const createTableProducts = `
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category ENUM('Men', 'Women', 'Unisex') NOT NULL,
    concentration ENUM('EDP', 'EDT', 'Parfum') NOT NULL,
    description TEXT,
    stock INT DEFAULT 0,
    created_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
)
`;

const createProduct = `
INSERT INTO products (name, brand, price, category, concentration, description, stock)
VALUES (?, ?, ?, ?, ?, ?, ?)
`;

const getAllProducts = `
SELECT * FROM products ORDER BY created_on DESC
`;

const getProductById = `
SELECT * FROM products WHERE id = ?
`;

const updateProduct = `
UPDATE products 
SET name = ?, brand = ?, price = ?, category = ?, concentration = ?, description = ?, stock = ?
WHERE id = ?
`;

const deleteProduct = `
DELETE FROM products WHERE id = ?
`;

module.exports = {
    createTableProducts,
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};
