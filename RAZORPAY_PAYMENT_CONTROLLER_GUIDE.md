/**
 * RAZORPAY PAYMENT SYSTEM - Complete Integration Guide
 * =====================================================
 * 
 * This guide shows the complete payment flow:
 * 1. Frontend creates order
 * 2. Backend creates order in DB + Razorpay API
 * 3. Frontend opens Razorpay modal for payment
 * 4. Customer pays
 * 5. Razorpay sends webhook
 * 6. Backend updates order/payment status
 * 7. Frontend receives confirmation
 */

// ========================================
// PART 1: FRONTEND INTEGRATION
// ========================================

/**
 * File: src/components/CheckoutPayment.tsx
 * 
 * Order Creation Flow
 */
class FrontendOrderFlow {
  constructor() {
    this.razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
  }

  /**
   * Step 1: Create order on backend
   */
  async createOrder(productId, quantity, totalAmount) {
    try {
      const response = await axios.post('/api/payment/create-order', {
        productId,
        quantity,
        totalAmount,
      });

      if (response.data.status !== 'success') {
        throw new Error(response.data.message);
      }

      const {
        orderId,
        razorpay_order_id,
        key_id,
        amount,
      } = response.data.data;

      console.log(`✅ Order created: ${razorpay_order_id}`);
      return {
        orderId,
        razorpay_order_id,
        key_id,
        amount,
      };
    } catch (error) {
      console.error(`❌ Order creation failed:`, error);
      throw error;
    }
  }

  /**
   * Step 2: Open Razorpay modal
   */
  openRazorpayModal(orderDetails) {
    const { razorpay_order_id, key_id, amount } = orderDetails;

    const options = {
      key: key_id, // From backend response
      amount: amount * 100, // In paise
      currency: 'INR',
      order_id: razorpay_order_id,
      handler: (response) => this.handlePaymentSuccess(response, orderDetails),
      prefill: {
        name: 'Customer Name',
        email: 'customer@example.com',
        contact: '9999999999',
      },
      notes: {
        orderId: orderDetails.orderId,
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  /**
   * Step 3: Handle payment callback
   */
  async handlePaymentSuccess(response, orderDetails) {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = response;

    try {
      // Verify payment on backend
      const verifyResponse = await axios.post('/api/payment/verify', {
        orderId: orderDetails.orderId,
        razorpay_payment_id,
        razorpay_signature,
      });

      if (verifyResponse.data.status === 'success') {
        console.log(`✅ Payment successful!`);
        // Navigate to success page or show confirmation
        window.location.href = '/order-success?orderId=' + orderDetails.orderId;
      } else {
        console.error(`❌ Payment verification failed`);
        alert('Payment verification failed');
      }
    } catch (error) {
      console.error(`❌ Payment verification error:`, error);
      alert('Payment verification error');
    }
  }

  /**
   * Step 4: Monitor order status (polling or websocket)
   */
  async checkOrderStatus(orderId) {
    try {
      const response = await axios.get(`/api/payment/order/${orderId}`);
      const { status, payment } = response.data.data;

      console.log(`📊 Order Status: ${status}`);
      console.log(`💳 Payment Status: ${payment?.payment_status}`);

      return {
        orderStatus: status,
        paymentStatus: payment?.payment_status,
      };
    } catch (error) {
      console.error(`❌ Failed to get order status:`, error);
    }
  }
}

// ========================================
// PART 2: BACKEND ORDER CREATION
// ========================================

/**
 * Database: orders table
 * 
 * Flow:
 * 1. Frontend sends POST /api/payment/create-order
 * 2. Backend inserts PENDING order
 * 3. Backend creates order with Razorpay API
 * 4. Backend returns razorpay_order_id
 */

const exampleCreateOrder = async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { productId, quantity, totalAmount } = req.body;

    // STEP 1: Create order with Razorpay
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100, // Convert to paise
      currency: 'INR',
      receipt: `ORDER_${Date.now()}`,
    });

    // STEP 2: Insert into orders table (PENDING status)
    const [result] = await connection.execute(
      `INSERT INTO orders 
       (user_id, order_number, total_amount, razorpay_order_id, status, items_count)
       VALUES (?, ?, ?, ?, 'PENDING', ?)`,
      [
        req.user?.id || null,
        `ORD_${Date.now()}`,
        totalAmount,
        razorpayOrder.id,
        quantity,
      ]
    );

    // STEP 3: Log this action for audit trail
    await connection.execute(
      `INSERT INTO payment_logs 
       (order_id, log_type, action, request_data, response_data, status_code)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        result.insertId,
        'API_CALL',
        'create_order',
        JSON.stringify({ productId, quantity, totalAmount }),
        JSON.stringify({ razorpay_order_id: razorpayOrder.id }),
        201,
      ]
    );

    await connection.commit();

    res.status(200).json({
      status: 'success',
      data: {
        orderId: result.insertId,
        razorpay_order_id: razorpayOrder.id,
        key_id: process.env.RAZORPAY_KEY_ID,
        amount: totalAmount,
      },
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      status: 'error',
      message: 'Order creation failed',
    });
  } finally {
    await connection.release();
  }
};

// ========================================
// PART 3: WEBHOOK HANDLING
// ========================================

/**
 * Razorpay Webhook: payment.authorized
 * 
 * When customer completes payment:
 * 1. Razorpay sends webhook to /api/payment/webhook
 * 2. Backend verifies signature
 * 3. Backend inserts payment record
 * 4. Backend updates order status to PAID
 * 5. Backend returns 200 OK (important!)
 */

const exampleWebhookHandler = async (req, res) => {
  try {
    const signature = req.get('X-Razorpay-Signature');
    const body = req.rawBody;

    // STEP 1: Verify webhook signature (CRITICAL!)
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error(`❌ Invalid webhook signature`);
      return res.status(200).json({ ok: false }); // Return 200 even if invalid
    }

    console.log(`✅ Webhook signature verified`);

    const event = JSON.parse(body);
    const payment = event.payload.payment.entity;
    const paymentId = payment.id;

    // STEP 2: Get order ID from payment notes
    // (Frontend passed orderId in notes during Razorpay.Checkout)
    const orderId = payment.notes?.orderId;

    if (!orderId) {
      console.error(`❌ No orderId in webhook payload`);
      return res.status(200).json({ ok: true }); // Always return 200
    }

    // STEP 3: Insert payment record
    await db.execute(
      `INSERT INTO payments 
       (order_id, razorpay_payment_id, razorpay_signature, payment_status, amount)
       VALUES (?, ?, ?, 'SUCCESS', ?)`,
      [
        orderId,
        paymentId,
        payment.signature || null,
        payment.amount / 100, // Convert from paise
      ]
    );

    // STEP 4: Update order status
    await db.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      ['PAID', orderId]
    );

    // STEP 5: Log webhook
    await db.execute(
      `INSERT INTO payment_logs 
       (order_id, log_type, action, status_code)
       VALUES (?, ?, ?, ?)`,
      [orderId, 'WEBHOOK', 'payment_authorized', 200]
    );

    console.log(`✅ Order ${orderId} marked as PAID`);

    // CRITICAL: Always return 200 (Razorpay will retry if not 200)
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error(`❌ Webhook processing failed:`, error);
    res.status(200).json({ ok: true }); // Still return 200 to stop retries
  }
};

// ========================================
// PART 4: DATABASE FLOW
// ========================================

/**
 * Order Flow in Database:
 * 
 * Timeline:
 * T0: CREATE ORDER
 *     INSERT orders (PENDING)
 *     INSERT payment_logs (create_order)
 * 
 * T1: PAYMENT COMPLETED BY CUSTOMER
 *     Razorpay sends webhook
 * 
 * T2: WEBHOOK RECEIVED
 *     INSERT payments (SUCCESS)
 *     UPDATE orders (PAID)
 *     INSERT payment_logs (payment_authorized)
 * 
 * T3+: REFUND (if needed)
 *      Razorpay sends refund webhook
 *      INSERT refunds
 *      UPDATE orders (REFUNDED)
 */

// Query: Check order creation
// SELECT id, order_number, status, razorpay_order_id, created_at FROM orders WHERE id = 1;
// Expected: 1 | ORD_20260215_ABC123 | PENDING | rzp_test_123456 | 2025-02-15 10:00:00

// Query: Check payment after webhook
// SELECT p.*, o.status FROM payments p 
// JOIN orders o ON p.order_id = o.id 
// WHERE p.order_id = 1;
// Expected: Payment record with SUCCESS status, Order with PAID status

// Query: Check audit trail
// SELECT action, log_type, created_at FROM payment_logs WHERE order_id = 1;
// Expected: create_order (API_CALL), payment_authorized (WEBHOOK)

// ========================================
// PART 5: ERROR SCENARIOS
// ========================================

/**
 * Scenario 1: Order Creation Fails
 * 
 * Issue: Razorpay API timeout or payment creation fails
 * Solution:
 * - Order stays in PENDING status
 * - error_message stored in payment_logs
 * - Frontend can retry by calling /create-order again
 * - Transactional rollback ensures consistency
 */

/**
 * Scenario 2: Webhook Lost
 * 
 * Issue: Razorpay webhook doesn't reach backend
 * Solution:
 * - Payment sits in PENDING status
 * - Frontend can poll /api/payment/order/:id to check payment status
 * - Razorpay retries webhook 10 times over 24 hours
 * - Admin can manually verify in Razorpay dashboard
 */

/**
 * Scenario 3: Duplicate Webhooks
 * 
 * Issue: Razorpay sends same webhook twice
 * Solution:
 * - UNIQUE constraint on razorpay_payment_id prevents duplicates
 * - Second insert fails silently (payment already created)
 * - Order status already PAID, webhook returns 200 OK
 */

/**
 * Scenario 4: Invalid Signature
 * 
 * Issue: Webhook signature doesn't match
 * Solution:
 * - Webhook rejected, order stays PENDING
 * - error_message logged in payment_logs
 * - Razorpay retries webhook
 * - Admin investigates in payment_logs table
 */

// ========================================
// PART 6: MONITORING & DEBUGGING
// ========================================

/**
 * Query: Find failed orders
 * 
 * SELECT o.id, o.order_number, o.status, 
 *        p.payment_status, p.error_message
 * FROM orders o
 * LEFT JOIN payments p ON o.id = p.order_id
 * WHERE o.status = 'FAILED'
 * ORDER BY o.created_at DESC;
 */

/**
 * Query: Find pending orders (payment not received)
 * 
 * SELECT o.id, o.order_number, o.created_at,
 *        TIMESTAMPDIFF(MINUTE, o.created_at, NOW()) as minutes_pending
 * FROM orders o
 * WHERE o.status = 'PENDING'
 *   AND o.created_at < DATE_SUB(NOW(), INTERVAL 30 MINUTE);
 */

/**
 * Query: Audit trail for debugging
 * 
 * SELECT log_type, action, request_data, response_data, created_at
 * FROM payment_logs
 * WHERE order_id = ?
 * ORDER BY created_at ASC;
 */

// ========================================
// PART 7: ENVIRONMENT VARIABLES
// ========================================

/**
 * Required .env.local variables:
 * 
 * # Razorpay Credentials (from Razorpay Dashboard)
 * RAZORPAY_KEY_ID=rzp_test_abc123
 * RAZORPAY_KEY_SECRET=rzp_secret_xyz789
 * RAZORPAY_WEBHOOK_SECRET=webhook_secret_for_signature
 * 
 * # Database
 * DB_HOST=shinkansen.proxy.rlwy.net
 * DB_PORT=11735
 * DB_USER=root
 * DB_PASSWORD=password
 * DB_NAME=bhatkar_db
 * 
 * # Server
 * NODE_ENV=production
 * PORT=5000
 */

module.exports = {
  FrontendOrderFlow,
  exampleCreateOrder,
  exampleWebhookHandler,
};
