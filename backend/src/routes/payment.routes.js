/**
 * PAYMENT ROUTES - Production Razorpay Integration
 * ================================================
 * 
 * Routes:
 * POST   /api/payment/create-order          Create new order (public)
 * POST   /api/payment/verify                Verify payment signature (public)
 * POST   /api/payment/webhook               Razorpay webhook endpoint (public)
 * GET    /api/payment/order/:orderId        Get order status (public)
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController.production');
const { allowCors } = require('../middleware/cors');

// ===== MIDDLEWARE NOTE =====
// These routes are marked as public in axios.ts:
// /payment/create-order
// /payment/verify
// /payment/webhook
// 
// This means NO auth token is required - frontend can call directly
// All verification is done via Razorpay signatures instead

// ===== CREATE ORDER =====
// Frontend: POST /api/payment/create-order
// Body: { productId, quantity, totalAmount }
// Response: { razorpay_order_id, key_id, ... }
router.post('/create-order', allowCors, paymentController.createOrder);

// ===== VERIFY PAYMENT =====
// Frontend: POST /api/payment/verify
// Body: { orderId, razorpay_payment_id, razorpay_signature }
// Response: { status: 'success' or 'error' }
router.post('/verify', allowCors, paymentController.verifyPayment);

// ===== WEBHOOK ENDPOINT =====
// Razorpay → POST /api/payment/webhook
// Headers: X-Razorpay-Signature: <signature>
// Body: { event: 'payment.authorized', payload: {...} }
router.post(
  '/webhook',
  // CRITICAL: Express needs raw body for signature verification
  // Make sure app.js has: app.use(express.raw({type: 'application/json'}))
  paymentController.handleWebhook
);

// ===== GET ORDER STATUS =====
// Frontend: GET /api/payment/order/:orderId
// Response: { order_number, status, payment: {...} }
router.get('/order/:orderId', allowCors, paymentController.getOrderStatus);

module.exports = router;
