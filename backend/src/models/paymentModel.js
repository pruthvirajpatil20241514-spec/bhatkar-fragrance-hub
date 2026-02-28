/**
 * Payment Model
 * =============
 * Database operations for payments
 */

const db = require('../config/db');
const { logger } = require('../utils/logger');

class PaymentModel {
  /**
   * Create new payment record
   */
  static async create(paymentData) {
    try {
      const { orderId, razorpayPaymentId, razorpaySignature, status = 'PENDING' } = paymentData;

      const queryResult = await db.query(
        `INSERT INTO payments (order_id, razorpay_payment_id, razorpay_signature, payment_status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
        [orderId, razorpayPaymentId, razorpaySignature, status]
      );

      const id = queryResult.rows[0].id;
      logger.info(`✅ Payment record created: ${id}`);
      return id;
    } catch (error) {
      logger.error('❌ Error creating payment record:', error.message);
      throw error;
    }
  }

  /**
   * Get payment by ID
   */
  static async getById(paymentId) {
    try {
      const queryResult = await db.query(
        'SELECT * FROM payments WHERE id = $1',
        [paymentId]
      );

      return queryResult.rows[0] || null;
    } catch (error) {
      logger.error('❌ Error fetching payment:', error.message);
      throw error;
    }
  }

  /**
   * Get payment by Razorpay Payment ID
   */
  static async getByRazorpayPaymentId(razorpayPaymentId) {
    try {
      const queryResult = await db.query(
        'SELECT * FROM payments WHERE razorpay_payment_id = $1',
        [razorpayPaymentId]
      );

      return queryResult.rows[0] || null;
    } catch (error) {
      logger.error('❌ Error fetching payment by Razorpay ID:', error.message);
      throw error;
    }
  }

  /**
   * Get all payments for an order
   */
  static async getByOrderId(orderId) {
    try {
      const queryResult = await db.query(
        'SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC',
        [orderId]
      );

      return queryResult.rows;
    } catch (error) {
      logger.error('❌ Error fetching payment by order:', error.message);
      throw error;
    }
  }

  /**
   * Update payment status
   */
  static async updateStatus(paymentId, status) {
    try {
      const queryResult = await db.query(
        'UPDATE payments SET payment_status = $1, updated_at = NOW() WHERE id = $2',
        [status, paymentId]
      );

      logger.info(`✅ Payment status updated: ${paymentId} -> ${status}`);
      return queryResult.rowCount > 0;
    } catch (error) {
      logger.error('❌ Error updating payment status:', error.message);
      throw error;
    }
  }

  /**
   * Check if payment already exists
   */
  static async exists(razorpayPaymentId) {
    try {
      const queryResult = await db.query(
        'SELECT id FROM payments WHERE razorpay_payment_id = $1',
        [razorpayPaymentId]
      );

      return queryResult.rows.length > 0;
    } catch (error) {
      logger.error('❌ Error checking payment existence:', error.message);
      throw error;
    }
  }

  /**
   * Get payment statistics
   */
  static async getStats() {
    try {
      const queryResult = await db.query(
        `SELECT 
          COUNT(*) as total_payments,
          SUM(CASE WHEN payment_status = 'SUCCESS' THEN 1 ELSE 0 END) as successful_payments,
          SUM(CASE WHEN payment_status = 'FAILED' THEN 1 ELSE 0 END) as failed_payments,
          SUM(CASE WHEN payment_status = 'PENDING' THEN 1 ELSE 0 END) as pending_payments
        FROM payments`
      );

      return queryResult.rows[0];
    } catch (error) {
      logger.error('❌ Error fetching payment stats:', error.message);
      throw error;
    }
  }
}

module.exports = PaymentModel;
