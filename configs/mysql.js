'use strict'

import mysql from 'mysql2/promise';
import fs from 'fs';

// Conexión única
export const connection = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: {
                ca: fs.readFileSync('./certs/isrgrootx1.pem')
            }
        });

        console.log('MySQL | Connected to TiDB');

        // Probar conexión
        await connection.query('SELECT 1');
        console.log('MySQL | Connection test successful');
        
        return connection;
    } catch (error) {
        console.log('Database connection failed', error);
    }
}

// Pool de conexiones (mejor para producción)
export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        ca: fs.readFileSync('./certs/isrgrootx1.pem')
    }
});
