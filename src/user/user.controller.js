import { pool } from '../../configs/mysql.js';
import bcrypt from 'bcrypt';

export const createUser = async (req, res) => {
    const { name, lastName, email, password, adress, nit } = req.body;
    try {
        const [rows] = await pool.query('CALL GetUserByEmail(?)', [email]);
        const userExist = rows[0]?.length > 0; // Verifica si hay usuario existente
        if (userExist) {
            return res.status(400).json({ message: 'Ya existe un usuario con este email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            'CALL InsertUser(?, ?, ?, ?, ?, ?)',
            [name, lastName, email, hashedPassword, adress, nit]
        );

        res.status(201).json({ message: 'Usuario creado exitosamente', result });
    } catch (error) {
        res.status(500).json({ message: 'Error creando usuario', error: error.message });
    }
};

export const getUsers = async (req, res) => {
    try {
        const [users] = await pool.query('CALL GetAllUsers()');
        if (users.length > 0) {
            res.status(200).json(users);
        } else {
            res.status(404).json({ message: 'No users found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};

export const getUserById = async (req, res) => {
    const { id } = req.params;

    if (!id || id.trim() === '') {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
        const [user] = await pool.query('CALL GetUser(?)', [id]);
        if (user.length > 0) {
            res.status(200).json(user[0]);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error });
    }
};

export const authUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || email.trim() === '') {
        return res.status(400).json({ message: 'Invalid email' });
    }

    try {
        const [user] = await pool.query('CALL GetUserByEmail(?)', [email]);
        if (user.length > 0) {
            // Compare the provided password with the hashed password
            const isMatch = await bcrypt.compare(password, user[0].password);
            if (isMatch) {
                res.status(200).json(user[0]);
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error authenticating user', error });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, lastName, email, password, adress, nit } = req.body;

    try {
        // Encrypt the password if provided
        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

        await pool.query(
            'CALL UpdateUser(?, ?, ?, ?, ?, ?, ?)',
            [id, name, lastName, email, hashedPassword || password, adress, nit]
        );
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error });
    }
};

export const deactivateUser = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('CALL DeactivateUser(?)', [id]);
        res.status(200).json({ message: 'User deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deactivating user', error });
    }
};

export const activateUser = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('CALL ActivateUser(?)', [id]);
        res.status(200).json({ message: 'User activated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error activating user', error });
    }
};