const db = require('../../config/db');
const { logger } = require('../../utils/logger');

/**
 * Migration: Add is_best_seller to products & create reviews table
 * Enables admin to mark products as best sellers
 * Enables product reviews with ratings
 */

async function migrate() {
  return new Promise((resolve, reject) => {
    // Step 1: Add is_best_seller column to products if it doesn't exist
    const addBestSellerSQL = `
      ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT 0
    `;

    db.query(addBestSellerSQL, (err) => {
      if (err && err.code !== 'ER_DUP_FIELDNAME') {
        logger.error(`Error adding is_best_seller column: ${err.message}`);
        return reject(err);
      }
      console.log('✅ is_best_seller column added to products table');

      // Step 2: Create reviews table
      const createReviewsTableSQL = `
        CREATE TABLE IF NOT EXISTS reviews (
          id INT PRIMARY KEY AUTO_INCREMENT,
          product_id INT NOT NULL,
          reviewer_name VARCHAR(255) NOT NULL,
          rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
          review_text TEXT NOT NULL,
          verified_purchase BOOLEAN DEFAULT 0,
          is_approved BOOLEAN DEFAULT 1,
          is_featured BOOLEAN DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6),
          updated_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          INDEX idx_product (product_id),
          INDEX idx_rating (rating)
        )
      `;

      db.query(createReviewsTableSQL, (err) => {
        if (err) {
          logger.error(`Error creating reviews table: ${err.message}`);
          return reject(err);
        }
        console.log('✅ reviews table created successfully');
        resolve();
      });
    });
  });
}

console.log('🚀 Running migration: Add is_best_seller & reviews\n');

migrate()
  .then(() => {
    console.log('\n✅ Migration complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  });
