import { pool } from '../../configs/mysql.js';
import nodemailer from "nodemailer";

// Helpers para consistencia
const handleError = (res, error, defaultMessage) => {
    console.error(defaultMessage, error);
    res.status(500).json({ message: defaultMessage, error: { message: error.message } });
};

const handleResponse = (res, data, successMessage, notFoundMessage, errorMessage, statusCode = 200) => {
    // Si 'data' es un array, siempre devolvemos 200, incluso si está vacío.
    if (Array.isArray(data)) {
        res.status(200).json(data);
        return;
    }
    // Si es un resultado de UPDATE/DELETE/INSERT que fue exitoso
    if (data && data.affectedRows > 0) {
        res.status(statusCode).json({ message: successMessage });
    } else {
        // Solo enviamos 404 si no es un array y no afectó filas (ej. GET por ID fallido)
        res.status(404).json({ message: notFoundMessage });
    }
};

/**
 * @desc    Crea una nueva factura y envía correos de confirmación.
 * @route   POST /api/bill
 */
export const createBill = async (req, res) => {
    const { address, name, email, phone, bill, comment, metodPayment, status, total, discount, tax, shipment, products, billCode } = req.body;
    const productsJSON = JSON.stringify(products); // Asegurarse de que los productos se guarden como un string JSON

    const insertQuery = `
        INSERT INTO Bill 
        (address, name, email, phone, bill, comment, metodPayment, status, total, discount, tax, shipment, products, billCode, configId, enable, timeStamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, true, NOW())
    `;
    const getConfigQuery = 'SELECT email as sender_email, pass as sender_pass FROM Config LIMIT 1';

    try {
        // 1. Insertar la factura en la base de datos
        await pool.query(insertQuery, [address, name, email, phone, bill, comment, metodPayment, status, total, discount, tax, shipment, productsJSON, billCode]);

        // 2. Obtener la configuración para las credenciales del correo
        const [configRows] = await pool.query(getConfigQuery);
        if (configRows.length === 0) {
            throw new Error('System email configuration not found.');
        }
        const config = configRows[0];

        // 3. Configurar el transportador de correo
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: config.sender_email,
                pass: config.sender_pass
            }
        });

        const productsList = products.map(p => `
            <tr>
                <td style="padding:8px; border:1px solid #ddd;">${p.name}</td>
                <td style="padding:8px; border:1px solid #ddd;">${p.qty}</td>
                <td style="padding:8px; border:1px solid #ddd;">Q${p.price.toFixed(2)}</td>
            </tr>
        `).join('');

        // 4. Preparar y enviar correo al cliente
        const mailOptions = {
            from: config.sender_email,
            to: email,
            subject: "Recibo de tu pedido",
            html: `
                <div style="font-family: Arial, sans-serif; line-height:1.5; color:#333;">
                <h2>¡Tu pedido ha sido recibido! 🎉</h2>
                <p>Gracias por comprar con nosotros. Estamos procesando tu pedido y recibirás notificaciones del proceso por teléfono o correo electrónico.</p>
               
                <p><strong>Estado del pedido:</strong> ${status}</p>
                <p><strong>Total del pedido:</strong> Q${total}</p>
                <p><strong>Código de seguimiento:</strong> ${billCode}</p>

                <h3>Detalles de tu pedido:</h3>
                <table style="border-collapse: collapse; width:100%; margin-top:10px;">
                    <thead>
                    <tr style="background:#f4f4f4;">
                        <th style="padding:8px; border:1px solid #ddd;">Producto</th>
                        <th style="padding:8px; border:1px solid #ddd;">Cantidad</th>
                        <th style="padding:8px; border:1px solid #ddd;">Precio</th>
                    </tr>
                    </thead>
                    <tbody>
                    ${productsList}
                    </tbody>
                </table>

                <p style="margin-top:20px;">Si tienes alguna duda, puedes responder a este correo o contactarnos por nuestros canales de atención.</p>
                </div>
            `

        };
        await transporter.sendMail(mailOptions);

        // 5. Preparar y enviar correo al administrador
        const adminMailOptions = {
            from: config.sender_email,
            to: config.sender_email,
            subject: `Nuevo pedido recibido - Código ${billCode}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height:1.5; color:#333;">
                <h2>📦 Nuevo pedido recibido</h2>
                <p><strong>Cliente:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Teléfono:</strong> ${phone}</p>
                <p><strong>Dirección de envío:</strong> ${address}</p>
                <p><strong>Método de pago:</strong> ${metodPayment}</p>
                <p><strong>Comentario:</strong> ${comment || 'N/A'}</p>
                <p><strong>Total:</strong> Q${total}</p>
                <p><strong>Código de seguimiento:</strong> ${billCode}</p>

                <h3>Productos:</h3>
                <table style="border-collapse: collapse; width:100%; margin-top:10px;">
                    <thead>
                    <tr style="background:#f4f4f4;">
                        <th style="padding:8px; border:1px solid #ddd;">Producto</th>
                        <th style="padding:8px; border:1px solid #ddd;">Cantidad</th>
                        <th style="padding:8px; border:1px solid #ddd;">Precio</th>
                    </tr>
                    </thead>
                    <tbody>
                    ${productsList}
                    </tbody>
                </table>

                <p style="margin-top:20px;">Ingresa al panel administrativo para gestionar este pedido.</p>
                </div>
            `

        };
        await transporter.sendMail(adminMailOptions);

        res.status(201).json({ sent: true, message: 'Bill created and emails sent successfully.' });

    } catch (error) {
        handleError(res, error, 'Error creating bill');
    }
};

/**
 * @desc    Obtiene todas las facturas.
 * @route   GET /api/bill
 */
export const getAllBills = async (req, res) => {
    const sqlQuery = 'SELECT * FROM Bill';
    try {
        const [bills] = await pool.query(sqlQuery);
        handleResponse(res, bills, null, 'No bills found in database', 'Error fetching bills');
    } catch (error) {
        handleError(res, error, 'Error fetching bills');
    }
};

/**
 * @desc    Obtiene una factura por su billCode.
 * @route   GET /api/bill/:billCode
 */
export const getBillById = async (req, res) => {
    const { id } = req.params;
    const sqlQuery = 'SELECT * FROM Bill WHERE billCode = ?';
    try {
        // 1. Ejecutamos la consulta
        const [billRows] = await pool.query(sqlQuery, [id]);

        // 2. Verificamos si el array de resultados tiene algo
        if (billRows.length > 0) {
            // Si encontramos la factura, la devolvemos con un 200 OK
            res.status(200).json(billRows[0]); // Enviamos el objeto, no el array
        } else {
            // Si el array está vacío, devolvemos un 404 Not Found
            res.status(404).json({ message: 'Bill not found' });
        }
    } catch (error) {
        handleError(res, error, 'Error fetching bill');
    }
};

/**
 * @desc    Actualiza una factura.
 * @route   PUT /api/bill/:billId
 */
export const updateBill = async (req, res) => {
    const { billId } = req.params;
    const { address, bill, comment, metodPayment, name, phone, shipment, status } = req.body;
    const productsJSON = JSON.stringify(products);

    const sqlQuery = `
        UPDATE Bill SET 
            address = ?, name = ?, phone = ?, bill = ?, comment = ?, 
            metodPayment = ?, status = ?,
            shipment = ?, timeStamp = NOW()
        WHERE billId = ?
    `;
    try {
        const [result] = await pool.query(sqlQuery, [address, bill, comment, metodPayment, name, phone, shipment, status]);
        handleResponse(res, result, 'Bill updated successfully', 'Bill not found or no changes made', 'Error updating bill');
    } catch (error) {
        handleError(res, error, 'Error updating bill');
    }
};

/**
 * @desc    Activa una factura.
 * @route   PATCH /api/bill/:billId/activate
 */
export const activateBill = async (req, res) => {
    const { billId } = req.params;
    const sqlQuery = 'UPDATE Bill SET enable = TRUE, timeStamp = NOW() WHERE billId = ?';
    try {
        const [result] = await pool.query(sqlQuery, [billId]);
        handleResponse(res, result, 'Bill activated successfully', 'Bill not found', 'Error activating bill');
    } catch (error) {
        handleError(res, error, 'Error activating bill');
    }
};

/**
 * @desc    Desactiva una factura.
 * @route   PATCH /api/bill/:billId/deactivate
 */
export const deactivateBill = async (req, res) => {
    const { billId } = req.params;
    const sqlQuery = 'UPDATE Bill SET enable = FALSE, timeStamp = NOW() WHERE billId = ?';
    try {
        const [result] = await pool.query(sqlQuery, [billId]);
        handleResponse(res, result, 'Bill deactivated successfully', 'Bill not found', 'Error deactivating bill');
    } catch (error) {
        handleError(res, error, 'Error deactivating bill');
    }
};