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
 * @desc    Crea una nueva categoría de producto
 * @route   POST /api/category
 */
export const createCategoryProduct = async (req, res) => {
    const { name, img, description, weight } = req.body;
    const sqlQuery = 'INSERT INTO Category_Product (name, img, description, weight, enable) VALUES (?, ?, ?, ?, false)';

    try {
        const [result] = await pool.query(sqlQuery, [name, img, description, weight]);
        res.status(201).json({ message: 'Category product created successfully', categoryId: result.insertId });
    } catch (error) {
        handleError(res, error, 'Error creating category product');
    }
};

/**
 * @desc    Obtiene TODAS las categorías de producto (habilitadas y deshabilitadas)
 * @route   GET /api/category/all
 */
export const getAllCategoryProduct = async (req, res) => {
    const sqlQuery = 'SELECT * FROM Category_Product';
    try {
        const [categories] = await pool.query(sqlQuery);
        handleResponse(res, categories, null, 'No categories found in the database', 'Error fetching categories');
    } catch (error) {
        handleError(res, error, 'Error fetching categories');
    }
};

/**
 * @desc    Obtiene solo las categorías de producto HABILITADAS
 * @route   GET /api/category
 */
export const getAllGoodCategoryProduct = async (req, res) => {
    const sqlQuery = 'SELECT * FROM Category_Product WHERE enable = true';
    try {
        const [categories] = await pool.query(sqlQuery);
        handleResponse(res, categories, null, 'No enabled categories found', 'Error fetching enabled categories');
    } catch (error) {
        handleError(res, error, 'Error fetching enabled categories');
    }
};

/**
 * @desc    Obtiene una categoría de producto por su ID
 * @route   GET /api/category/:id
 */
export const getCategoryProductById = async (req, res) => {
    const { id } = req.params;
    const sqlQuery = 'SELECT * FROM Category_Product WHERE categoryId = ?';
    try {
        const [category] = await pool.query(sqlQuery, [id]);
        // Devolvemos el objeto directamente, no el array
        handleResponse(res, category.length > 0 ? category[0] : [], null, 'Category not found', 'Error fetching category');
    } catch (error) {
        handleError(res, error, 'Error fetching category');
    }
};

/**
 * @desc    Actualiza una categoría de producto
 * @route   PUT /api/category/:id
 */
export const updateCategoryProduct = async (req, res) => {
    const { id } = req.params;
    const { name, img, description, weight } = req.body;
    const sqlQuery = 'UPDATE Category_Product SET name = ?, img = ?, description = ?, weight = ? WHERE categoryId = ?';
    try {
        const [result] = await pool.query(sqlQuery, [name, img, description, weight, id]);
        handleResponse(res, result, 'Category updated successfully', 'Category not found or no changes made', 'Error updating category', 200);
    } catch (error) {
        handleError(res, error, 'Error updating category');
    }
};

/**
 * @desc    Activa una categoría de producto
 * @route   PATCH /api/category/:id/activate
 */
export const activateCategoryProduct = async (req, res) => {
    const { id } = req.params;
    // Asumo que 'GetProductByCategory' busca en la tabla 'Product'
    const checkProductsQuery = 'SELECT COUNT(*) as productCount FROM Product WHERE categoryId = ?';
    const activateQuery = 'UPDATE Category_Product SET enable = TRUE WHERE categoryId = ?';

    try {
        // 1. Verificar si la categoría tiene productos asociados
        const [rows] = await pool.query(checkProductsQuery, [id]);
        const { productCount } = rows[0];

        if (productCount === 0) {
            return res.status(400).json({ message: 'Cannot activate a category with no products. Please add products first.' });
        }

        // 2. Si tiene productos, activarla
        const [result] = await pool.query(activateQuery, [id]);
        handleResponse(res, result, 'Category activated successfully', 'Category not found', 'Error activating category', 200);
    } catch (error) {
        handleError(res, error, 'Error activating category');
    }
};

/**
 * @desc    Desactiva una categoría de producto
 * @route   PATCH /api/category/:id/deactivate
 */
export const deactivateCategoryProduct = async (req, res) => {
    const { id } = req.params;
    const sqlQuery = 'UPDATE Category_Product SET enable = FALSE WHERE categoryId = ?';
    try {
        const [result] = await pool.query(sqlQuery, [id]);
        handleResponse(res, result, 'Category deactivated successfully', 'Category not found', 'Error deactivating category', 200);
    } catch (error) {
        handleError(res, error, 'Error deactivating category');
    }
};
