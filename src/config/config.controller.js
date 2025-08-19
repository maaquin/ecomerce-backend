import { pool } from '../../configs/mysql.js';
import jwt from "jsonwebtoken";
import { validarCaptcha } from '../middlewares/validar-captcha.js';
import nodemailer from "nodemailer";

export const getConfig = async (req, res) => {
    try {
        const [config] = await pool.query('CALL GetConfig()');
        if (config[0].length > 0) {
            res.status(200).json(config);
        } else {
            await pool.query('CALL InsertConfig()');
            const [config] = await pool.query('CALL GetConfig()');
            if (config[0].length > 0) {
                res.status(200).json(config);
            }
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching config', error });
    }
};

export const UpdateConfig = async (req, res) => {
    const { configId, name, email, phone, pass, adress, nit, imgLogo, msgSoldOut, msgSale, msgThanks } = req.body;
    try {
        const [result] = await pool.query('CALL UpdateConfig(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [configId, name, email, phone, pass, adress, nit, imgLogo, msgSoldOut, msgSale, msgThanks]);
        res.status(201).json({ message: 'Update logo successfully', result });
    } catch (error) {
        res.status(500).json({ message: 'Error updating logo', error });
    }
};

export const VerifyToken = async (req, res) => {
    const { token } = req.query; // <- aquí recibes el token
    if (!token) {
        return res.status(400).json({ valid: false, message: "Token faltante" });
    }

    // Aquí iría la lógica para buscar el token en DB y validar expiración
    const [token_db] = await pool.query('CALL GetToken(?)', [token]);
    if (!token_db > 0) {
        return res.status(404).json({ valid: false });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRETKEY);
        console.log("Token válido", decoded);
        return res.json({ valid: true, email: token_db.email });
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            console.log("Token expirado");
        } else {
            console.log("Token inválido");
        }
    }
};

export const VerifyLink = async (req, res) => {
    const { email, captcha } = req.body;
    if (!email || !captcha) return res.status(400).json({ sent: false });

    const captchaValido = await validarCaptcha(captcha);
    //if (!captchaValido) return res.status(400).json({ sent: false, message: "Captcha inválido" });

    const token = jwt.sign({ userId: email }, process.env.SECRETKEY, { expiresIn: "1h" });


    await pool.query(
        'CALL InsertToken(?, ?)',
        [email, token]
    );

    const [config] = await pool.query('CALL GetConfig()');


    const user = config[0][0].email;
    const pass = config[0][0].pass;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: user,
            pass: pass
        }
    });

    const mailOptions = {
        from: user,
        to: email,
        subject: "Confirma tu correo electrónico",
        html: `
            <div style="font-family: Arial, sans-serif; line-height:1.5; color:#333;">
                <h2>¡Ya estás a un solo paso de confirmar tu pedido!</h2>
                <p>Antes de continuar con tu compra necesitamos confirmar tu correo electrónico.</p>
                <p>Por favor, haz clic en el siguiente botón para validar tu correo:</p>
                <a href="http://localhost:5174/data-client?token=${token}" 
                    style="display:inline-block; padding:10px 20px; background:#007bff; color:#fff; text-decoration:none; border-radius:5px;">
                    Confirmar mi correo
                </a>
                <p style="margin-top:20px;">Si no has solicitado esta confirmación, puedes ignorar este mensaje.</p>
            </div>
            `
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) return res.status(500).json({ sent: false });
        res.json({ sent: true });
    });
};