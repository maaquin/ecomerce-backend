import { pool } from '../../configs/mysql.js';

// Helper para manejar las respuestas y errores de forma consistente
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

const handleError = (res, error, defaultMessage) => {
    console.error(defaultMessage, error);
    res.status(500).json({ message: defaultMessage, error: { message: error.message } });
};

/**
 * @desc    Crea un nuevo producto
 * @route   POST /api/product
 */
export const createProduct = async (req, res) => {
    const { name, img, description, categoryId, weight, price, discount, tax } = req.body;
    const sqlQuery = `
        INSERT INTO Product 
        (name, img, description, categoryId, weight, price, discount, tax, enable, timeStamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, true, CURDATE())
    `;
    try {
        const [result] = await pool.query(sqlQuery, [name, img, description, categoryId, weight, price, discount, tax]);
        res.status(201).json({ message: 'Product created successfully', productId: result.insertId });
    } catch (error) {
        handleError(res, error, 'Error creating product');
    }
};

/**
 * @desc    Obtiene todos los productos con el nombre de su categoría
 * @route   GET /api/product/all
 */
export const getAllProducts = async (req, res) => {
    const sqlQuery = `
        SELECT 
            p.productId, p.name, p.img, p.description, c.name AS categoryName, 
            p.categoryId, p.weight, p.price, p.discount, p.tax, p.enable, p.timeStamp
        FROM Product p
        JOIN Category_Product c ON p.categoryId = c.categoryId
    `;
    try {
        const [products] = await pool.query(sqlQuery);
        handleResponse(res, products, null, 'No products found in the database', 'Error fetching products');
    } catch (error) {
        handleError(res, error, 'Error fetching products');
    }
};

/**
 * @desc    Obtiene solo los productos HABILITADOS
 * @route   GET /api/product
 */
export const getAllGoodProducts = async (req, res) => {
    const sqlQuery = 'SELECT * FROM Product WHERE enable = true';
    try {
        const [products] = await pool.query(sqlQuery);
        handleResponse(res, products, null, 'No enabled products found', 'Error fetching enabled products');
    } catch (error) {
        handleError(res, error, 'Error fetching enabled products');
    }
};

/**
 * @desc    Obtiene un producto por su ID
 * @route   GET /api/product/:id
 */
export const getProductById = async (req, res) => {
    const { id } = req.params;
    const sqlQuery = 'SELECT * FROM Product WHERE productId = ?';
    try {
        const [product] = await pool.query(sqlQuery, [id]);
        handleResponse(res, product.length > 0 ? product[0] : [], null, 'Product not found', 'Error fetching product');
    } catch (error) {
        handleError(res, error, 'Error fetching product');
    }
};

/**
 * @desc    Obtiene todos los productos de una categoría específica
 * @route   GET /api/product/category/:categoryId
 */
export const getProductsByCategory = async (req, res) => {
    const { categoryId } = req.params; // Cambiado de req.body a req.params para ser más RESTful
    const sqlQuery = 'SELECT * FROM Product WHERE categoryId = ?';
    try {
        const [products] = await pool.query(sqlQuery, [categoryId]);
        handleResponse(res, products, null, 'No products found for this category', 'Error fetching products by category');
    } catch (error) {
        handleError(res, error, 'Error fetching products by category');
    }
};

/**
 * @desc    Actualiza un producto
 * @route   PUT /api/product/:id
 */
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, img, description, categoryId, weight, price, discount, tax } = req.body;
    const sqlQuery = `
        UPDATE Product SET 
            name = ?, img = ?, description = ?, categoryId = ?, 
            weight = ?, price = ?, discount = ?, tax = ?, timeStamp = CURDATE()
        WHERE productId = ?
    `;
    try {
        const [result] = await pool.query(sqlQuery, [name, img, description, categoryId, weight, price, discount, tax, id]);
        handleResponse(res, result, 'Product updated successfully', 'Product not found or no changes made', 'Error updating product');
    } catch (error) {
        handleError(res, error, 'Error updating product');
    }
};

/**
 * @desc    Activa un producto
 * @route   PATCH /api/product/:id/activate
 */
export const activateProduct = async (req, res) => {
    const { id } = req.params;
    const sqlQuery = 'UPDATE Product SET enable = TRUE, timeStamp = CURDATE() WHERE productId = ?';
    try {
        const [result] = await pool.query(sqlQuery, [id]);
        handleResponse(res, result, 'Product activated successfully', 'Product not found', 'Error activating product');
    } catch (error) {
        handleError(res, error, 'Error activating product');
    }
};

/**
 * @desc    Desactiva un producto
 * @route   PATCH /api/product/:id/deactivate
 */
export const deactivateProduct = async (req, res) => {
    const { id } = req.params;
    const sqlQuery = 'UPDATE Product SET enable = FALSE, timeStamp = CURDATE() WHERE productId = ?';
    try {
        const [result] = await pool.query(sqlQuery, [id]);
        handleResponse(res, result, 'Product deactivated successfully', 'Product not found', 'Error deactivating product');
    } catch (error) {
        handleError(res, error, 'Error deactivating product');
    }
};