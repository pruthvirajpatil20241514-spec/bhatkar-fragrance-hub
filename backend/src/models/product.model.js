const db = require('../config/db.config');
const { 
    createProduct: createProductQuery,
    getAllProducts: getAllProductsQuery,
    getProductById: getProductByIdQuery,
    updateProduct: updateProductQuery,
    deleteProduct: deleteProductQuery
} = require('../database/products.queries');
const { logger } = require('../utils/logger');

class Product {
    constructor(name, brand, price, category, concentration, description, stock) {
        this.name = name;
        this.brand = brand;
        this.price = price;
        this.category = category;
        this.concentration = concentration;
        this.description = description;
        this.stock = stock;
    }

    static create(newProduct, cb) {
        db.query(createProductQuery, 
            [
                newProduct.name,
                newProduct.brand,
                newProduct.price,
                newProduct.category,
                newProduct.concentration,
                newProduct.description,
                newProduct.stock
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                cb(null, {
                    id: res.insertId,
                    ...newProduct
                });
        });
    }

    static getAll(cb) {
        db.query(getAllProductsQuery, (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            cb(null, res);
        });
    }

    static getById(id, cb) {
        db.query(getProductByIdQuery, id, (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length) {
                cb(null, res[0]);
                return;
            }
            cb({ kind: "not_found" }, null);
        });
    }

    static update(id, updatedProduct, cb) {
        db.query(updateProductQuery,
            [
                updatedProduct.name,
                updatedProduct.brand,
                updatedProduct.price,
                updatedProduct.category,
                updatedProduct.concentration,
                updatedProduct.description,
                updatedProduct.stock,
                id
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                if (res.affectedRows === 0) {
                    cb({ kind: "not_found" }, null);
                    return;
                }
                cb(null, { id, ...updatedProduct });
        });
    }

    static delete(id, cb) {
        db.query(deleteProductQuery, id, (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.affectedRows === 0) {
                cb({ kind: "not_found" }, null);
                return;
            }
            cb(null, { message: "Product deleted successfully" });
        });
    }
}

module.exports = Product;
