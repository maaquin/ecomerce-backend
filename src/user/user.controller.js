import { pool } from '../../configs/mysql.js';
import bcrypt from 'bcrypt';

// Helper para manejar las respuestas y errores de forma consistente
const handleResponse = (res, data, successMessage, notFoundMessage, errorMessage, statusCode = 200) => {
    if (data && data.length > 0) {
        res.status(statusCode).json(data);
    } else if (data && data.affectedRows > 0) {
        res.status(statusCode).json({ message: successMessage });
    } else {
        res.status(404).json({ message: notFoundMessage });
    }
};

const handleError = (res, error, defaultMessage) => {
    console.error(defaultMessage, error);
    res.status(500).json({ message: defaultMessage, error: { message: error.message } });
};

/**
 * @desc    Registra un nuevo usuario
 * @route   POST /api/user/register
 */
export const createUser = async (req, res) => {
    const { name, lastName, email, password, adress, nit } = req.body;
    const checkEmailQuery = 'SELECT * FROM User WHERE email = ?';
    const insertUserQuery = `
        INSERT INTO User (name, lastName, email, password, adress, nit, enable, timeStamp)
        VALUES (?, ?, ?, ?, ?, ?, false, CURDATE())
    `;

    try {
        // 1. Verificar si el email ya existe
        const [existingUsers] = await pool.query(checkEmailQuery, [email]);
        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'A user with this email already exists.' }); // 409 Conflict
        }

        // 2. Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Insertar el nuevo usuario
        const [result] = await pool.query(insertUserQuery, [name, lastName, email, hashedPassword, adress, nit]);
        res.status(201).json({ message: 'User created successfully', userId: result.insertId });
    } catch (error) {
        handleError(res, error, 'Error creating user');
    }
};

/**
 * @desc    Autentica un usuario y devuelve sus datos
 * @route   POST /api/user/login
 */
export const authUser = async (req, res) => {
    const { email, password } = req.body;
    const sqlQuery = 'SELECT * FROM User WHERE email = ?';

    try {
        const [users] = await pool.query(sqlQuery, [email]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // No enviar la contraseña en la respuesta
            const { password, ...userWithoutPassword } = user;
            res.status(200).json(userWithoutPassword);
        } else {
            res.status(401).json({ message: 'Invalid credentials.' }); // 401 Unauthorized
        }
    } catch (error) {
        handleError(res, error, 'Error authenticating user');
    }
};

/**
 * @desc    Obtiene todos los usuarios
 * @route   GET /api/user
 */
export const getUsers = async (req, res) => {
    const sqlQuery = 'SELECT userId, name, lastName, email, adress, nit, enable, timeStamp FROM User';
    try {
        const [users] = await pool.query(sqlQuery);
        handleResponse(res, users, null, 'No users found', 'Error fetching users');
    } catch (error) {
        handleError(res, error, 'Error fetching users');
    }
};

/**
 * @desc    Obtiene un usuario por su ID
 * @route   GET /api/user/:id
 */
export const getUserById = async (req, res) => {
    const { id } = req.params;
    const sqlQuery = 'SELECT userId, name, lastName, email, adress, nit, enable, timeStamp FROM User WHERE userId = ?';
    try {
        const [user] = await pool.query(sqlQuery, [id]);
        handleResponse(res, user.length > 0 ? user[0] : [], null, 'User not found', 'Error fetching user');
    } catch (error) {
        handleError(res, error, 'Error fetching user');
    }
};

/**
 * @desc    Actualiza un usuario
 * @route   PUT /api/user/:id
 */
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, lastName, email, password, adress, nit } = req.body;

    // Lógica para actualizar la contraseña solo si se proporciona una nueva
    let hashedPassword = null;
    if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
    }

    // Construcción dinámica de la consulta para evitar actualizar la contraseña a null
    let fieldsToUpdate = { name, lastName, email, adress, nit };
    if (hashedPassword) {
        fieldsToUpdate.password = hashedPassword;
    }
    fieldsToUpdate.timeStamp = new Date(); // Usar new Date() para que JS lo formatee a YYYY-MM-DD

    const sqlQuery = 'UPDATE User SET ? WHERE userId = ?';

    try {
        const [result] = await pool.query(sqlQuery, [fieldsToUpdate, id]);
        handleResponse(res, result, 'User updated successfully', 'User not found or no changes made', 'Error updating user');
    } catch (error) {
        handleError(res, error, 'Error updating user');
    }
};

/**
 * @desc    Activa un usuario
 * @route   PATCH /api/user/:id/activate
 */
export const activateUser = async (req, res) => {
    const { id } = req.params;
    const sqlQuery = 'UPDATE User SET enable = TRUE, timeStamp = CURDATE() WHERE userId = ?';
    try {
        const [result] = await pool.query(sqlQuery, [id]);
        handleResponse(res, result, 'User activated successfully', 'User not found', 'Error activating user');
    } catch (error) {
        handleError(res, error, 'Error activating user');
    }
};

/**
 * @desc    Desactiva un usuario
 * @route   PATCH /api/user/:id/deactivate
 */
export const deactivateUser = async (req, res) => {
    const { id } = req.params;
    const sqlQuery = 'UPDATE User SET enable = FALSE, timeStamp = CURDATE() WHERE userId = ?';
    try {
        const [result] = await pool.query(sqlQuery, [id]);
        handleResponse(res, result, 'User deactivated successfully', 'User not found', 'Error deactivating user');
    } catch (error) {
        handleError(res, error, 'Error deactivating user');
    }
};

/**
 * @desc    Elimina un usuario permanentemente
 * @route   DELETE /api/user/:id
 */
export const deleteUser = async (req, res) => {
    const { id } = req.params;
    const sqlQuery = 'DELETE FROM User WHERE userId = ?';
    try {
        const [result] = await pool.query(sqlQuery, [id]);
        handleResponse(res, result, 'User deleted successfully', 'User not found', 'Error deleting user');
    } catch (error) {
        handleError(res, error, 'Error deleting user');
    }
};