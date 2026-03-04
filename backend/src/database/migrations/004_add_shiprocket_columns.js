/**
 * Migration: add Shiprocket columns to orders table
 * Adds: shiprocket_order_id, awb_code, courier_name, tracking_url, shipment_status
 */
module.exports = {
  up: async (db) => {
    const alter = `ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS shiprocket_order_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS awb_code VARCHAR(255),
      ADD COLUMN IF NOT EXISTS courier_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS tracking_url TEXT,
      ADD COLUMN IF NOT EXISTS shipment_status VARCHAR(100);
    `;
    try {
      await db.query(alter);
      return true;
    } catch (err) {
      console.error('Migration 004 failed:', err.message);
      throw err;
    }
  },

  down: async (db) => {
    const alter = `ALTER TABLE orders
      DROP COLUMN IF EXISTS shiprocket_order_id,
      DROP COLUMN IF EXISTS awb_code,
      DROP COLUMN IF EXISTS courier_name,
      DROP COLUMN IF EXISTS tracking_url,
      DROP COLUMN IF EXISTS shipment_status;
    `;
    try {
      await db.query(alter);
      return true;
    } catch (err) {
      console.error('Rollback 004 failed:', err.message);
      throw err;
    }
  }
};
