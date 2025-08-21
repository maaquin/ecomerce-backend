import { pool } from '../../configs/mysql.js';
import jwt from "jsonwebtoken";
import { validarCaptcha } from '../middlewares/validar-captcha.js';
import nodemailer from "nodemailer";

// Helpers para consistencia
const handleError = (res, error, defaultMessage) => {
    console.error(defaultMessage, error);
    res.status(500).json({ message: defaultMessage, error: { message: error.message } });
};

/**
 * @desc    Obtiene la configuración del sistema. Si no existe, la crea con valores por defecto.
 * @route   GET /api/config
 */
export const getConfig = async (req, res) => {
    const selectQuery = 'SELECT * FROM Config LIMIT 1';
    const insertQuery = `
        INSERT INTO Config (name, email, phone, pass, adress, nit, imgLogo, msgSoldOut, msgSale, msgThanks)
        VALUES ("century", 'ejemplo@email.com', '12345678', 'pass', "Guatemala", "000000000", "logo", "Agotado!", "Ultimas unidades", "Gracias por comprar con nosotros!")
    `;

    try {
        let [configRows] = await pool.query(selectQuery);

        // Si no hay configuración, la creamos
        if (configRows.length === 0) {
            await pool.query(insertQuery);
            // Volvemos a solicitarla para enviarla al cliente
            [configRows] = await pool.query(selectQuery);
        }

        // Devolvemos el primer y único objeto de configuración
        res.status(200).json(configRows);
    } catch (error) {
        handleError(res, error, 'Error fetching system configuration');
    }
};

export const getConfigFront = async (req, res) => {
    const selectQuery = 'SELECT * FROM Config LIMIT 1';
    const insertQuery = `
        INSERT INTO Config (name, email, phone, pass, adress, nit, imgLogo, msgSoldOut, msgSale, msgThanks)
        VALUES ("century", 'ejemplo@email.com', '12345678', 'pass', "Guatemala", "000000000", "logo", "Agotado!", "Ultimas unidades", "Gracias por comprar con nosotros!")
    `;

    try {
        let [configRows] = await pool.query(selectQuery);

        // Si no hay configuración, la creamos
        if (configRows.length === 0) {
            await pool.query(insertQuery);
            // Volvemos a solicitarla para enviarla al cliente
            [configRows] = await pool.query(selectQuery);
        }

        // Devolvemos el primer y único objeto de configuración
        res.status(200).json(configRows[0]);
    } catch (error) {
        handleError(res, error, 'Error fetching system configuration');
    }
};

/**
 * @desc    Actualiza la configuración del sistema.
 * @route   PUT /api/config
 */
export const updateConfig = async (req, res) => {
    // Asumimos que siempre hay una sola fila de config, con ID 1 o un ID conocido.
    // Es más seguro obtener el ID de la propia config o pasarlo. Aquí usaré el que venga en el body.
    const { configId, name, email, phone, pass, adress, nit, imgLogo, msgSoldOut, msgSale, msgThanks } = req.body;

    if (!configId) {
        return res.status(400).json({ message: 'Config ID is required to update.' });
    }

    const updateQuery = `
        UPDATE Config SET 
            name = ?, email = ?, phone = ?, pass = ?, adress = ?, nit = ?, 
            imgLogo = ?, msgSoldOut = ?, msgSale = ?, msgThanks = ?
        WHERE configId = ?
    `;

    try {
        const [result] = await pool.query(updateQuery,
            [name, email, phone, pass, adress, nit, imgLogo, msgSoldOut, msgSale, msgThanks, configId]
        );

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Configuration updated successfully' });
        } else {
            res.status(404).json({ message: 'Configuration not found or no changes made' });
        }
    } catch (error) {
        handleError(res, error, 'Error updating configuration');
    }
};


/**
 * @desc    Verifica un token JWT y de la base de datos.
 * @route   GET /api/verify-token
 */
export const verifyToken = async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).json({ valid: false, message: "Token is missing" });
    }

    // Corregido: Usando el nombre de tabla 'Token' (singular)
    const dbTokenQuery = 'SELECT email FROM Token WHERE token = ?';

    try {
        // 1. Verificar el token con la clave secreta (valida firma y expiración)
        const decoded = jwt.verify(token, process.env.SECRETKEY);

        // 2. Verificar que el token existe en la base de datos (no ha sido invalidado o es de un solo uso)
        const [tokenRows] = await pool.query(dbTokenQuery, [token]);
        if (tokenRows.length === 0) {
            return res.status(404).json({ valid: false, message: 'Token not found in database.' });
        }

        // Si todo es correcto
        console.log("Token is valid", decoded);
        res.status(200).json({ valid: true, email: tokenRows[0].email });

    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ valid: false, message: "Token has expired." });
        }
        return res.status(401).json({ valid: false, message: "Invalid token." });
    }
};


/**
 * @desc    Envía un enlace de verificación por correo electrónico.
 * @route   POST /api/send-link
 */
export const verifyLink = async (req, res) => {
    const { email, captcha } = req.body;
    if (!email || !captcha) {
        return res.status(400).json({ sent: false, message: "Email and captcha are required." });
    }

    try {
        const captchaValido = await validarCaptcha(captcha);
        if (!captchaValido) return res.status(400).json({ sent: false, message: "Invalid captcha" });

        // 1. Obtener la configuración para las credenciales del correo
        const [configRows] = await pool.query('SELECT email as sender_email, pass as sender_pass FROM Config LIMIT 1');
        if (configRows.length === 0) {
            throw new Error('System email configuration not found.');
        }
        const config = configRows[0];

        // 2. Crear y guardar el token
        const token = jwt.sign({ email }, process.env.SECRETKEY, { expiresIn: "1h" });
        // Corregido: Usando el nombre de tabla 'Token' (singular)
        await pool.query('INSERT INTO Token (email, token) VALUES (?, ?)', [email, token]);

        // 3. Configurar y enviar el correo
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: config.sender_email,
                pass: config.sender_pass
            }
        });

        // IMPORTANTE: El enlace debe apuntar a tu dominio de producción, no a localhost
        const verificationLink = `${process.env.FRONTEND_URL}/data-client?token=${token}`;

        const mailOptions = {
            from: config.sender_email,
            to: email,
            subject: "Confirma tu correo electrónico",
            html: `
                <div style="font-family: Arial, sans-serif; line-height:1.5; color:#333;">
                    <h2>¡Ya estás a un solo paso de confirmar tu pedido!</h2>
                    <p>Por favor, haz clic en el siguiente botón para validar tu correo:</p>
                    <a href="${verificationLink}" 
                       style="display:inline-block; padding:10px 20px; background:#007bff; color:#fff; text-decoration:none; border-radius:5px;">
                       Confirmar mi correo
                    </a>
                    <p style="margin-top:20px;">Si no has solicitado esta confirmación, puedes ignorar este mensaje.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ sent: true, message: 'Verification email sent successfully.' });

    } catch (error) {
        handleError(res, error, 'Failed to send verification email');
    }
};