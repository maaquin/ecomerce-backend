import { pool } from '../../configs/mysql.js'

export const createProduct = async (req, res) => {
    const { name, img, description, categoryId, weight, price, discount, tax } = req.body;
    try {
        const [result] = await pool.query(
            'CALL InsertProduct(?, ?, ?, ?, ?, ?, ?, ?)',
            [name, img, description, categoryId, weight, price, discount, tax]
        );
        res.status(201).json({ message: 'Product created successfully', result });
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const [product] = await pool.query('CALL GetAllProducts()');
        if (product.length > 0) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: 'No products in data base' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
};

export const getAllGoodProducts = async (req, res) => {
    try {
        const [products] = await pool.query('CALL GetAllGoodProducts()');
        if (products.length > 0) {
            res.status(200).json(products);
        } else {
            res.status(404).json({ message: 'No products in data base' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
};

export const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const [product] = await pool.query('CALL GetProduct(?)', [id]);
        if (product.length > 0) {
            res.status(200).json(product[0]);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error });
    }
};

export const getProductsByType = async (req, res) => {
    const { type } = req.body;
    try {
        const [product] = await pool.query('CALL GetProductByCategory(?)', [type]);
        if (product.length > 0) {
            res.status(200).json(product[0]);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error });
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, img, description, categoryId, weight, price, discount, tax } = req.body;
    
    try {
        await pool.query(
            'CALL UpdateProduct(?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, name, img, description, categoryId, weight, price, discount, tax]
        );
        res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error });
    }
};

export const activateProduct = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('CALL ActivateProduct(?)', [id]);
        res.status(200).json({ message: 'Product activated successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Error activating product', error });
    }
};

export const deactivateProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('CALL DeactivateProduct(?)', [id]);
        res.status(200).json({ message: 'Product deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deactivating product', error });
    }
};


export const createImgProduct = async (req, res) => {
    const { img, id } = req.body;
    try {
        const [result] = await pool.query(
            'CALL InsertImgProduct(?, ?)',
            [img, id]
        );
        res.status(201).json({ message: 'Img created successfully', result });
    } catch (error) {
        res.status(500).json({ message: 'Img creating event', error });
    }
};

export const getImgsProduct = async (req, res) => {
    const { id } = req.params;
    console.log('id: ', id)
    try {
        const [icons] = await pool.query('CALL GetImgsProduct(?)', [id]);
        console.log('imagenes: ', icons)
        if (icons.length > 0) {
            res.status(200).json(icons);
        } else {
            res.status(404).json({ message: 'No icons in data base' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching icons', error });
    }
};

export const deleteImgProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('CALL DeleteImgProduct(?)', [id]);
        res.status(200).json({ message: 'Img delete successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting img', error });
    }
};