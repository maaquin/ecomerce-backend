'use strict'

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const certPath = path.join(__dirname, '..', 'certs', 'isrgrootx1.pem');
const caCert = fs.readFileSync(certPath);

export const connection = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            ssl: {
                ca: caCert
            }
        });
        console.log('MySQL | Connected to TiDB');
        await connection.query('SELECT 1');
        console.log('MySQL | Connection test successful');
        return connection;
    } catch (error) {
        console.log('Database connection failed', error);
    }
}

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
        ca: caCert
    }
});