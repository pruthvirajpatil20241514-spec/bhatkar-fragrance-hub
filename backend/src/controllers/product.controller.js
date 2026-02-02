const Product = require('../models/product.model');
const { logger } = require('../utils/logger');

// Get all products
exports.getAllProducts = (req, res) => {
    try {
        Product.getAll((err, data) => {
            if (err) {
                logger.error(`Get all products error: ${err.message}`);
                return res.status(500).send({
                    status: 'error',
                    message: 'Error retrieving products'
                });
            }
            logger.info('All products retrieved successfully');
            return res.status(200).send({
                status: 'success',
                data: data
            });
        });
    } catch (error) {
        logger.error(`Get all products error: ${error.message}`);
        return res.status(500).send({
            status: 'error',
            message: 'Internal server error.'
        });
    }
};

// Get product by ID
exports.getProductById = (req, res) => {
    try {
        const { id } = req.params;
        
        Product.getById(id, (err, data) => {
            if (err) {
                if (err.kind === 'not_found') {
                    logger.warn(`Product not found: ${id}`);
                    return res.status(404).send({
                        status: 'error',
                        message: `Product with id ${id} not found`
                    });
                }
                logger.error(`Get product error: ${err.message}`);
                return res.status(500).send({
                    status: 'error',
                    message: 'Error retrieving product'
                });
            }
            logger.info(`Product retrieved: ${id}`);
            return res.status(200).send({
                status: 'success',
                data: data
            });
        });
    } catch (error) {
        logger.error(`Get product error: ${error.message}`);
        return res.status(500).send({
            status: 'error',
            message: 'Internal server error.'
        });
    }
};

// Create product
exports.createProduct = (req, res) => {
    try {
        const { name, brand, price, category, concentration, description, stock } = req.body;

        // Validate required fields
        if (!name || !brand || !price || !category || !concentration) {
            return res.status(400).send({
                status: 'error',
                message: 'Name, brand, price, category, and concentration are required'
            });
        }

        const product = new Product(name, brand, price, category, concentration, description, stock || 0);

        Product.create(product, (err, data) => {
            if (err) {
                logger.error(`Create product error: ${err.message}`);
                return res.status(500).send({
                    status: 'error',
                    message: 'Error creating product'
                });
            }
            logger.info(`Product created: ${data.id}`);
            return res.status(201).send({
                status: 'success',
                message: 'Product created successfully',
                data: data
            });
        });
    } catch (error) {
        logger.error(`Create product error: ${error.message}`);
        return res.status(500).send({
            status: 'error',
            message: 'Internal server error.'
        });
    }
};

// Update product
exports.updateProduct = (req, res) => {
    try {
        const { id } = req.params;
        const { name, brand, price, category, concentration, description, stock } = req.body;

        // Validate required fields
        if (!name || !brand || !price || !category || !concentration) {
            return res.status(400).send({
                status: 'error',
                message: 'Name, brand, price, category, and concentration are required'
            });
        }

        const updatedProduct = {
            name,
            brand,
            price,
            category,
            concentration,
            description,
            stock: stock || 0
        };

        Product.update(id, updatedProduct, (err, data) => {
            if (err) {
                if (err.kind === 'not_found') {
                    logger.warn(`Product not found for update: ${id}`);
                    return res.status(404).send({
                        status: 'error',
                        message: `Product with id ${id} not found`
                    });
                }
                logger.error(`Update product error: ${err.message}`);
                return res.status(500).send({
                    status: 'error',
                    message: 'Error updating product'
                });
            }
            logger.info(`Product updated: ${id}`);
            return res.status(200).send({
                status: 'success',
                message: 'Product updated successfully',
                data: data
            });
        });
    } catch (error) {
        logger.error(`Update product error: ${error.message}`);
        return res.status(500).send({
            status: 'error',
            message: 'Internal server error.'
        });
    }
};

// Delete product
exports.deleteProduct = (req, res) => {
    try {
        const { id } = req.params;

        Product.delete(id, (err, data) => {
            if (err) {
                if (err.kind === 'not_found') {
                    logger.warn(`Product not found for delete: ${id}`);
                    return res.status(404).send({
                        status: 'error',
                        message: `Product with id ${id} not found`
                    });
                }
                logger.error(`Delete product error: ${err.message}`);
                return res.status(500).send({
                    status: 'error',
                    message: 'Error deleting product'
                });
            }
            logger.info(`Product deleted: ${id}`);
            return res.status(200).send({
                status: 'success',
                message: 'Product deleted successfully',
                data: data
            });
        });
    } catch (error) {
        logger.error(`Delete product error: ${error.message}`);
        return res.status(500).send({
            status: 'error',
            message: 'Internal server error.'
        });
    }
};
