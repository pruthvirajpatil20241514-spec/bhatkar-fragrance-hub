/**
 * Razorpay Configuration
 * =====================
 * Initializes Razorpay instance with test/live keys
 */

const Razorpay = require('razorpay');
const { logger } = require('../utils/logger');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

logger.info('✅ Razorpay initialized with KEY ID:', process.env.RAZORPAY_KEY_ID?.substring(0, 10) + '...');

module.exports = razorpay;
