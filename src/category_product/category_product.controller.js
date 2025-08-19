import { pool } from '../../configs/mysql.js'

export const createCategoryProduct = async (req, res) => {
    const { name, img, description, weight } = req.body;
    try {
        const [result] = await pool.query(
            'CALL InsertCategoryProduct(?, ?, ?, ?)',
            [name, img, description, weight]
        );
        res.status(201).json({ message: 'Category product created successfully', result });
    } catch (error) {
        res.status(500).json({ message: 'Error creating Category product', error });
    }
};

export const getAllCategoryProduct = async (req, res) => {
    try {
        const [category] = await pool.query('CALL GetAllCategoryProducts()');
        if (category.length > 0) {
            res.status(200).json(category);
        } else {
            res.status(404).json({ message: 'No categorys in data base' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categorys', error });
    }
};

export const getAllGoodCategoryProduct = async (req, res) => {
    try {
        const [categorys] = await pool.query('CALL GetAllGoodCategoryProduct()');
        if (categorys.length > 0) {
            res.status(200).json(categorys);
        } else {
            res.status(404).json({ message: 'No categorys in data base' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching categorys', error });
    }
};

export const getCategoryProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const [category] = await pool.query('CALL GetCategoryProduct(?)', [id]);
        if (category.length > 0) {
            res.status(200).json(category[0]);
        } else {
            res.status(404).json({ message: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching category', error });
    }
};

export const UpdateCategoryProduct = async (req, res) => {
    const { id } = req.params;
    const { name, img, description, weight } = req.body;
    try {
        await pool.query(
            'CALL UpdateCategoryProduct(?, ?, ?, ?, ?)',
            [id, name, img, description, weight]
        );
        res.status(200).json({ message: 'Category updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating category', error });
    }
};

export const activateCategoryProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const [content] = await pool.query('CALL GetProductByCategory(?)', [id]);
        if (content[0].length <= 0) {
            return res.status(404).json({ message: 'Primero ponle contenido a la categoría!' });
        }

        await pool.query('CALL ActivateCategoryProduct(?)', [id]);
        res.status(200).json({ message: 'Category activated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error activating category', error });
    }
};

export const deactivateCategoryProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('CALL DeactivateCategoryProduct(?)', [id]);
        res.status(200).json({ message: 'Category deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deactivating category', error });
    }
};