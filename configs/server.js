'use strict'

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsOptions } from '../src/middlewares/validar-origen.js';

import billRoutes from '../src/bill/bill.routes.js';
import category_productRoutes from '../src/category_product/category_product.routes.js';
import configRoutes from '../src/config/config.routes.js'
import imgRoutes from '../src/img/img.routes.js';
import productRoutes from '../src/product/product.routes.js';
import userRoutes from '../src/user/user.routes.js';

import { connection } from './mysql.js';

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT;

        this.billPath = '/century/v1/bill';
        this.categorysPath = '/century/v1/category';
        this.imgPath = '/century/v1/img';
        this.configPath = '/century/v1/config';
        this.productPath = '/century/v1/product';
        this.userPath = '/century/v1/user';

        this.middlewares();
        this.conectarDB();
        this.routes();
    }

    async conectarDB() {
        try {
            await connection();
            console.log('Database connection established');
        } catch (error) {
            console.error('Error connecting to the database', error);
            process.exit(1);
        }
    }

    middlewares() {
        this.app.use((req, res, next) => {
            const origin = req.headers.origin;
            const allowedOrigins = [
                'http://localhost:5173',
                'http://localhost:5174',
                // Añade aquí tu URL de producción del frontend si la tienes
            ];

            if (allowedOrigins.includes(origin)) {
                res.setHeader('Access-Control-Allow-Origin', origin);
            }

            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.header('Access-Control-Allow-Credentials', true);

            // Si es una petición OPTIONS, termina aquí con un 204 (No Content)
            if (req.method === 'OPTIONS') {
                return res.sendStatus(204);
            }

            next();
        });

        this.app.use(express.urlencoded({ extended: false }));
        this.app.options('*', cors(corsOptions));
        this.app.use(cors(corsOptions));
        this.app.use(express.json());
        this.app.use(helmet());
        this.app.use(morgan('dev'));
    }

    routes() {
        this.app.use(this.billPath, billRoutes);
        this.app.use(this.categorysPath, category_productRoutes);
        this.app.use(this.productPath, productRoutes);
        this.app.use(this.userPath, userRoutes);
        this.app.use(this.imgPath, imgRoutes);
        this.app.use(this.configPath, configRoutes);
    }
}

export default Server;