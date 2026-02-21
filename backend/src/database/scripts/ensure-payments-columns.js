const path = require('path');

// Load backend .env so config modules can read DB_* env vars
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const db = require('../../config/db.pool');
const { logger } = require('../../utils/logger');

// Basic validation
if (!process.env.DB_HOST || !process.env.DB_NAME) {
  logger.error('❌ Missing DB configuration. Ensure backend/.env contains DB_HOST and DB_NAME');
  // Do not proceed when DB config is missing
  if (require.main === module) process.exit(1);
}

async function ensurePaymentsColumns() {
  const conn = await db.getConnection();
  try {
    const [rows] = await conn.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'payments'`
    );

    const existing = rows.map(r => r.COLUMN_NAME.toLowerCase());

    const alters = [];

    if (!existing.includes('razorpay_order_id')) {
      alters.push("ADD COLUMN razorpay_order_id VARCHAR(100) DEFAULT NULL");
    }
    if (!existing.includes('razorpay_payment_id')) {
      alters.push("ADD COLUMN razorpay_payment_id VARCHAR(100) DEFAULT NULL");
    }
    if (!existing.includes('razorpay_signature')) {
      alters.push("ADD COLUMN razorpay_signature VARCHAR(255) DEFAULT NULL");
    }
    if (!existing.includes('product_id')) {
      alters.push("ADD COLUMN product_id INT DEFAULT NULL");
    }
    if (!existing.includes('user_id')) {
      alters.push("ADD COLUMN user_id INT DEFAULT NULL");
    }
    if (!existing.includes('amount')) {
      alters.push("ADD COLUMN amount DECIMAL(10,2) DEFAULT NULL");
    }
    if (!existing.includes('currency')) {
      alters.push("ADD COLUMN currency VARCHAR(10) DEFAULT 'INR'");
    }
    if (!existing.includes('status') && !existing.includes('payment_status')) {
      // Add 'status' as a general column; many code paths use payment_status or status
      alters.push("ADD COLUMN status VARCHAR(40) DEFAULT 'PENDING'");
    }
    if (!existing.includes('created_at')) {
      alters.push("ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
    }
    if (!existing.includes('updated_at')) {
      alters.push("ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
    }

    if (alters.length === 0) {
      logger.info('✅ payments table already has required columns');
      return;
    }

    const alterSql = `ALTER TABLE payments ${alters.join(', ')};`;
    logger.info('🔧 Running ALTER TABLE for payments:', alterSql);
    await conn.execute(alterSql);
    logger.info('✅ payments table updated successfully');
  } catch (err) {
    logger.error('❌ Failed to ensure payments columns:', err && err.message ? err.message : err);
    throw err;
  } finally {
    conn.release();
  }
}

if (require.main === module) {
  ensurePaymentsColumns()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = ensurePaymentsColumns;
