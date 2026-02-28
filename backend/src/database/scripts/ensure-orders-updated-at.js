#!/usr/bin/env node
/**
 * ensure-orders-updated-at.js
 * ---------------------------
 * Idempotent migration to ensure `updated_at` exists on `orders` table.
 * - Safe to run multiple times
 * - Uses INFORMATION_SCHEMA to avoid ALTER when column exists
 * - Ignores duplicate-column errors if ALTER races occur
 * - Uses mysql2/promise via existing db.pool module
 */

const path = require('path');
// Load backend .env so DB_* env vars are available
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const db = require('../../config/db');
const { logger } = require('../../utils/logger');

async function main() {
  let conn;
  try {
    conn = await db.getConnection();

    // Check if column already exists
    const rows_result = await conn.execute(
      `SELECT COUNT(*); const rows = rows_result.rows || rows_result AS cnt FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'orders'
         AND COLUMN_NAME = 'updated_at'`
    );

    const exists = rows && rows[0] && rows[0].cnt > 0;

    if (exists) {
      logger && logger.info && logger.info('✅ orders.updated_at already exists - nothing to do');
      console.log('orders.updated_at already exists - nothing to do');
      return;
    }

    // Try to add the column. Prefer ALTER ... ADD COLUMN IF NOT EXISTS when supported.
    try {
      // MySQL 8.0.22+ supports IF NOT EXISTS; harmless on older versions because we already checked.
      const alterSql = `ALTER TABLE \`orders\` ADD COLUMN IF NOT EXISTS \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`;
      console.log('Running:', alterSql);
      await conn.execute(alterSql);
      logger && logger.info && logger.info('✅ Added orders.updated_at');
      console.log('✅ Added orders.updated_at');
    } catch (alterErr) {
      // Ignore duplicate column / race conditions; re-check to be safe
      const msg = alterErr && alterErr.message ? alterErr.message : '';
      if (msg.includes('Duplicate column name') || msg.includes('ER_DUP_FIELDNAME') || alterErr.errno === 1060) {
        logger && logger.warn && logger.warn('⚠️ Detected duplicate column during ALTER, re-checking...');
        console.log('Detected duplicate column during ALTER, re-checking...');
        const [r2] = await conn.execute(
          `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
           WHERE TABLE_SCHEMA = DATABASE()
             AND TABLE_NAME = 'orders'
             AND COLUMN_NAME = 'updated_at'`
        );
        const exists2 = r2 && r2[0] && r2[0].cnt > 0;
        if (exists2) {
          logger && logger.info && logger.info('✅ orders.updated_at exists after race');
          console.log('orders.updated_at exists after race');
        } else {
          throw alterErr; // Unexpected - propagate
        }
      } else {
        // Some MySQL versions don't support IF NOT EXISTS - attempt a plain ALTER (we already tried IF NOT EXISTS)
        try {
          const fallback = `ALTER TABLE \`orders\` ADD COLUMN \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`;
          console.log('Trying fallback:', fallback);
          await conn.execute(fallback);
          logger && logger.info && logger.info('✅ Added orders.updated_at (fallback)');
          console.log('✅ Added orders.updated_at (fallback)');
        } catch (fallbackErr) {
          // If still fails, surface the error
          console.error('❌ Failed to add updated_at to orders:', fallbackErr && fallbackErr.message ? fallbackErr.message : fallbackErr);
          throw fallbackErr;
        }
      }
    }

  } catch (err) {
    console.error('Migration failed:', err && err.message ? err.message : err);
    process.exitCode = 1;
  } finally {
    try {
      if (conn) conn.release();
      // Close pool gracefully
      if (db && db.closePool) await db.closePool();
    } catch (e) {
      // ignore
    }
  }
}

if (require.main === module) {
  main().then(() => process.exit(process.exitCode || 0));
}

module.exports = main;
