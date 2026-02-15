/**
 * Payment Routes
 * ==============
 * API endpoints for Razorpay payment integration
 * 
 * IMPORTANT: Webhook route uses express.raw() to preserve raw body
 * for signature verification (must be applied before express.json())
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { adminAuth } = require('../middlewares/adminAuth');
const { captureRawBody, attachRawBody } = require('../middlewares/webhookMiddleware');

/**
 * Public Routes (Accessible to all authenticated users, not just admins)
 * IMPORTANT: These handle customer payments, so they should NOT require adminAuth
 */

// Create payment order
// POST /api/payment/create-order
// Body: { productId, quantity }
// Auth: Optional (userId from token if available)
router.post('/create-order', paymentController.createOrder);

// Verify payment
// POST /api/payment/verify
// Body: { orderId, razorpay_payment_id, razorpay_signature }
// Auth: Required for security
router.post('/verify', paymentController.verifyPayment);

// Get order details
// GET /api/payment/order/:orderId
// Auth: Optional (return public order data)
router.get('/order/:orderId', paymentController.getOrder);

// Get payment details
// GET /api/payment/payment/:paymentId
// Auth: Optional
router.get('/payment/:paymentId', paymentController.getPayment);

/**
 * Webhook Routes (No Auth Required - Razorpay signature validates)
 * 
 * CRITICAL: express.raw() MUST be applied here to preserve raw body
 * This is required for HMAC SHA256 signature verification
 * The signature is calculated from the raw request body, not parsed JSON
 */

// Razorpay webhook
// POST /api/payment/webhook
// Headers: x-razorpay-signature
router.post(
  '/webhook',
  captureRawBody,
  attachRawBody,
  paymentController.webhook
);

module.exports = router;
