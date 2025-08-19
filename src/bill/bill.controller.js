import { pool } from '../../configs/mysql.js'
import nodemailer from "nodemailer";

export const createBill = async (req, res) => {
    const { address, name, email, phone, bill, comment, metodPayment, status, total, discount, tax, shipment, products, billCode } = req.body;
    const productsJSON = JSON.stringify(products);
    try {
        const [result] = await pool.query(
            'CALL InsertBill(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [address, name, email, phone, bill, comment, metodPayment, status, total, discount, tax, shipment, productsJSON, billCode]
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

        const productsList = products.map(p => `
            <tr>
                <td style="padding:8px; border:1px solid #ddd;">${p.name}</td>
                <td style="padding:8px; border:1px solid #ddd;">${p.qty}</td>
                <td style="padding:8px; border:1px solid #ddd;">Q${p.price}</td>
            </tr>
        `).join('');

        const mailOptions = {
            from: user,
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

        const adminMailOptions = {
            from: user,
            to: user,
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

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Error enviando correo al cliente:", err);
                return res.status(500).json({ sent: false });
            }

            transporter.sendMail(adminMailOptions, (err2, info2) => {
                if (err2) {
                    console.error("Error enviando correo al admin:", err2);
                }

                res.status(201).json({ sent: true });
            });
        });

    } catch (error) {
        res.status(500).json({ message: 'Error creating bill', error });
    }
};

export const getAllBills = async (req, res) => {
    try {
        const [bills] = await pool.query('CALL GetAllBills()');
        if (bills.length > 0) {
            res.status(200).json(bills);
        } else {
            res.status(404).json({ message: 'No bills in data base' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bills', error });
    }
};

export const getBillById = async (req, res) => {
    const { id } = req.params;
    try {
        const [bill] = await pool.query('CALL GetBill(?)', [id]);
        if (bill.length > 0) {
            res.status(200).json(bill[0]);
        } else {
            res.status(404).json({ message: 'Bill not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bill', error });
    }
};

export const getBillByUser = async (req, res) => {
    const { id } = req.params;
    try {
        const [bill] = await pool.query('CALL GetBillByUser(?)', [id]);
        if (bill.length > 0) {
            res.status(200).json(bill[0]);
        } else {
            res.status(404).json({ message: 'Bill not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bill', error });
    }
};

export const updateBill = async (req, res) => {
    const { id } = req.params;
    const { address, name, email, phone, bill, comment, metodPayment, status, total, discount, tax, shipment, products, billCode } = req.body;
    try {
        await pool.query(
            'CALL UpdateBill(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, address, name, email, phone, bill, comment, metodPayment, status, total, discount, tax, shipment, products, billCode]
        );
        res.status(200).json({ message: 'Bill updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating bill', error });
    }
};

export const activateBill = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('CALL ActivateBill(?)', [id]);
        res.status(200).json({ message: 'Bill activated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error activating bill', error });
    }
};

export const deactivateBill = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('CALL DeactivateBill(?)', [id]);
        res.status(200).json({ message: 'Bill deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deactivating bill', error });
    }
};