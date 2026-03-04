/**
 * Database: Ensure product_images table exists for Railway Storage
 */

const db = require('../db');

async function createProductImagesTable() {
  try {
    const connection = await db.getConnection();

    // Check if table exists
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'product_images'`
    );

    if (tables.length > 0) {
      console.log('✅ product_images table already exists');
      connection.release();
      return;
    }

    // Create table
    await connection.query(`
      CREATE TABLE product_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL UNIQUE,
        image_format VARCHAR(50),
        alt_text VARCHAR(255),
        image_order INT DEFAULT 1,
        is_thumbnail BOOLEAN DEFAULT FALSE,
        created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        KEY idx_product_id (product_id),
        KEY idx_image_order (product_id, image_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Created product_images table successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Error creating product_images table:', error.message);
    throw error;
  }
}

module.exports = { createProductImagesTable };
