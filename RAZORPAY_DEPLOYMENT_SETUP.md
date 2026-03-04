/**
 * RAZORPAY PAYMENT SYSTEM - Environment Setup & Deployment
 * =========================================================
 * 
 * Complete checklist for setting up payment system in production
 */

// ========================================
// STEP 1: RAZORPAY ACCOUNT SETUP
// ========================================

/**
 * 1.1: Create Razorpay Account
 *   - Visit: https://razorpay.com
 *   - Sign up as Business
 *   - Complete KYC verification
 *   - Expected timeline: 15-30 minutes
 * 
 * 1.2: Find API Credentials
 *   - Login to Razorpay Dashboard
 *   - Navigate: Settings → API Keys
 *   - Two tabs: Test & Live
 *   - For development: Use TEST keys
 *   - For production: Switch to LIVE keys
 *   - Copy: Key ID and Key Secret
 * 
 * 1.3: Setup Webhook Endpoint
 *   - Navigate: Settings → Webhooks
 *   - Webhook URL: https://yourdomain.com/api/payment/webhook
 *   - Example: https://bhatkar-fragrance-hub-1.onrender.com/api/payment/webhook
 *   - Events: Select payment.authorized, payment.failed, refund.created
 *   - Copy: Webhook Secret
 */

// ========================================
// STEP 2: ENVIRONMENT VARIABLES
// ========================================

/**
 * File: backend/.env.local (Not version controlled!)
 * 
 * Copy this template and fill in actual values:
 */

// ===== DATABASE =====
DB_HOST=shinkansen.proxy.rlwy.net
DB_PORT=11735
DB_USER=root
DB_PASSWORD=<your_railway_password>
DB_NAME=bhatkar_db

// ===== RAZORPAY (from Dashboard) =====
RAZORPAY_KEY_ID=rzp_test_abc123xyz789
RAZORPAY_KEY_SECRET=rzp_secret_key_xyz789
RAZORPAY_WEBHOOK_SECRET=webhook_secret_from_dashboard

// ===== SERVER =====
NODE_ENV=development
PORT=5000

// ===== FRONTEND (in frontend/.env.local) =====
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_abc123xyz789

// ========================================
// STEP 3: DATABASE MIGRATION
// ========================================

/**
 * 3.1: Create Tables on Railway
 * 
 * Option A: Run Migration Script
 * ------
 * Command:
 *   npm run migrate:razorpay
 * 
 * This file: backend/database/migrations/razorpay.migration.js
 * - Creates all 4 tables (orders, payments, refunds, payment_logs)
 * - Uses IF NOT EXISTS (safe to run multiple times)
 * - Returns clear success/error messages
 * 
 * Option B: Manual SQL
 * ------
 * 1. Connect to Railway MySQL:
 *    mysql -h shinkansen.proxy.rlwy.net -P 11735 -u root -p
 * 
 * 2. Run SQL from RAZORPAY_SCHEMA.sql:
 *    - Copy entire contents
 *    - Paste into MySQL CLI
 *    - Verify with: SHOW TABLES;
 * 
 * Expected Output:
 *   ✅ Table 'orders' created/verified
 *   ✅ Table 'payments' created/verified
 *   ✅ Table 'refunds' created/verified
 *   ✅ Table 'payment_logs' created/verified
 */

// ========================================
// STEP 4: BACKEND CODE SETUP
// ========================================

/**
 * 4.1: Copy Payment Files
 * 
 * Files created:
 * - backend/src/controllers/paymentController.production.js
 * - backend/src/routes/payment.routes.js
 * - backend/database/RAZORPAY_SCHEMA.sql
 * - backend/database/migrations/razorpay.migration.js
 * 
 * 4.2: Update app.js
 * 
 * Location: backend/src/app.js (or server.js)
 * 
 * Add these lines EARLY in your app setup:
 * 
 * // CRITICAL: Raw body parsing for webhook signature verification
 * app.use(express.raw({ type: 'application/json' }));
 * app.use(express.json());
 * 
 * // Payment routes BEFORE auth middleware
 * const paymentRoutes = require('./routes/payment.routes');
 * app.use('/api/payment', paymentRoutes);
 * 
 * // Then auth and other routes...
 * app.use(require('./middleware/auth'));
 * 
 * Important: Payment routes must come BEFORE auth middleware
 * because they don't require authentication
 * 
 * 4.3: Test Locally
 * 
 * Command:
 *   npm run dev
 * 
 * Test endpoints:
 *   POST http://localhost:5000/api/payment/create-order
 *   Body: { "productId": 1, "quantity": 1, "totalAmount": 99.99 }
 *   
 *   Expected Response:
 *   {
 *     "status": "success",
 *     "data": {
 *       "orderId": 1,
 *       "razorpay_order_id": "order_abc123xyz789"
 *     }
 *   }
 */

// ========================================
// STEP 5: FRONTEND SETUP
// ========================================

/**
 * 5.1: Add Razorpay Script
 * 
 * File: frontend/index.html
 * 
 * Add to <head> or <body>:
 * 
 * <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
 * 
 * 5.2: Environment Variables
 * 
 * File: frontend/.env.local
 * 
 * VITE_API_BASE_URL=<your_backend_url>
 * VITE_RAZORPAY_KEY_ID=rzp_test_abc123xyz789
 * 
 * For production:
 * VITE_API_BASE_URL=https://bhatkar-fragrance-hub-1.onrender.com/api
 * VITE_RAZORPAY_KEY_ID=rzp_live_abc123xyz789
 * 
 * 5.3: Payment Checkout Component
 * 
 * Location: src/components/CheckoutPayment.tsx
 * 
 * Flow Example:
 * 
 * const handlePayment = async () => {
 *   // 1. Create order on backend
 *   const response = await axios.post('/api/payment/create-order', {
 *     productId: 22,
 *     quantity: 1,
 *     totalAmount: 999.99
 *   });
 *   
 *   // 2. Open Razorpay modal
 *   const options = {
 *     key: response.data.data.key_id,
 *     order_id: response.data.data.razorpay_order_id,
 *     amount: response.data.data.amount * 100,
 *     currency: 'INR',
 *     handler: (paymentResponse) => {
 *       // 3. Verify payment on backend
 *       axios.post('/api/payment/verify', {
 *         orderId: response.data.data.orderId,
 *         razorpay_payment_id: paymentResponse.razorpay_payment_id,
 *         razorpay_signature: paymentResponse.razorpay_signature
 *       });
 *     }
 *   };
 *   
 *   const rzp = new window.Razorpay(options);
 *   rzp.open();
 * };
 */

// ========================================
// STEP 6: DEPLOYMENT TO PRODUCTION
// ========================================

/**
 * 6.1: Deploy Frontend to Render
 * 
 * In Render Dashboard:
 * 1. Go to: bhatkar-fragrance-hub (frontend service)
 * 2. Connect to GitHub repo
 * 3. Set environment variables:
 *    VITE_API_BASE_URL=https://bhatkar-fragrance-hub-1.onrender.com/api
 *    VITE_RAZORPAY_KEY_ID=rzp_live_abc123xyz789 (LIVE key, not test)
 * 4. Click "Deploy"
 * 5. Wait for build to complete
 * 
 * 6.2: Deploy Backend to Render
 * 
 * In Render Dashboard:
 * 1. Go to: bhatkar-fragrance-hub-1 (backend service)
 * 2. Connect to GitHub repo
 * 3. Set environment variables:
 *    DB_HOST=shinkansen.proxy.rlwy.net
 *    DB_PORT=11735
 *    DB_USER=root
 *    DB_PASSWORD=<railway_password>
 *    DB_NAME=bhatkar_db
 *    RAZORPAY_KEY_ID=rzp_live_abc123xyz789 (LIVE key, not test)
 *    RAZORPAY_KEY_SECRET=rzp_secret_key_xyz789
 *    RAZORPAY_WEBHOOK_SECRET=webhook_secret_from_dashboard
 *    NODE_ENV=production
 * 4. Click "Deploy"
 * 5. Wait for build to complete
 * 
 * 6.3: Run Migration on Production
 * 
 * Connect to Railway MySQL directly:
 * mysql -h shinkansen.proxy.rlwy.net -P 11735 -u root -p
 * 
 * Or run via backend:
 * - SSH into Render backend
 * - Run: npm run migrate:razorpay
 * 
 * Verify tables created:
 * SHOW TABLES;
 * DESCRIBE orders;
 * DESCRIBE payments;
 * 
 * 6.4: Update Razorpay Webhook URL
 * 
 * In Razorpay Dashboard:
 * 1. Go to: Settings → Webhooks
 * 2. For LIVE mode:
 *    URL: https://bhatkar-fragrance-hub-1.onrender.com/api/payment/webhook
 * 3. Switch API keys to LIVE mode
 * 4. Test webhook (Razorpay provides test button)
 */

// ========================================
// STEP 7: TESTING PAYMENT FLOW
// ========================================

/**
 * 7.1: Test in Razorpay Sandbox Mode
 * 
 * Card Details (Razorpay provides):
 * Card Number: 4111 1111 1111 1111
 * Expiry: 12/25
 * CVV: 123
 * OTP: 000000
 * 
 * 7.2: Verify Order Created
 * 
 * Query:
 * SELECT * FROM orders ORDER BY created_at DESC LIMIT 1;
 * 
 * Expected: PENDING status, razorpay_order_id filled
 * 
 * 7.3: Verify Payment Recorded (After Webhook)
 * 
 * Query:
 * SELECT * FROM payments ORDER BY created_at DESC LIMIT 1;
 * 
 * Expected: SUCCESS status, razorpay_payment_id filled
 * 
 * Order status should be PAID:
 * 
 * Query:
 * SELECT status FROM orders WHERE id = <order_id>;
 * 
 * Expected: PAID
 * 
 * 7.4: Check Audit Trail
 * 
 * Query:
 * SELECT log_type, action, created_at FROM payment_logs 
 * WHERE order_id = <order_id> 
 * ORDER BY created_at;
 * 
 * Expected:
 * - API_CALL | create_order | 2025-02-15 10:00:00
 * - WEBHOOK | payment_authorized | 2025-02-15 10:00:05
 */

// ========================================
// STEP 8: MONITORING & ALERTS
// ========================================

/**
 * 8.1: Monitor Failed Orders
 * 
 * Query (Run daily):
 * 
 * SELECT COUNT(*) as failed_count
 * FROM orders
 * WHERE status = 'FAILED'
 *   AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY);
 * 
 * Alert: If count > 5, investigate payment issues
 * 
 * 8.2: Monitor Pending Orders
 * 
 * Query (Run hourly):
 * 
 * SELECT id, order_number, created_at
 * FROM orders
 * WHERE status = 'PENDING'
 *   AND created_at < DATE_SUB(NOW(), INTERVAL 30 MINUTE);
 * 
 * Alert: Pending orders older than 30 min = webhook lost
 * Solution: Check payment_logs for errors
 * 
 * 8.3: Monitor Database Health
 * 
 * Query:
 * 
 * SELECT 
 *   DATE(created_at) as date,
 *   COUNT(*) as total_orders,
 *   SUM(CASE WHEN status = 'PAID' THEN 1 ELSE 0 END) as successful,
 *   SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed,
 *   ROUND(100 * SUM(CASE WHEN status = 'PAID' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
 * FROM orders
 * GROUP BY DATE(created_at)
 * ORDER BY date DESC;
 */

// ========================================
// STEP 9: TROUBLESHOOTING
// ========================================

/**
 * Issue: "404 Route not found" when calling /api/payment/create-order
 * 
 * Cause: Payment routes not registered in app.js
 * Solution:
 * 1. Check app.js has: const paymentRoutes = require('./routes/payment.routes');
 * 2. Check it's mounted: app.use('/api/payment', paymentRoutes);
 * 3. Verify BEFORE auth middleware
 * 4. Redeploy backend
 * 
 * Issue: Payment created but webhook not received
 * 
 * Cause: Webhook URL not configured in Razorpay or signature invalid
 * Solution:
 * 1. Check Razorpay Dashboard → Settings → Webhooks
 * 2. Verify webhook URL is correct
 * 3. Check RAZORPAY_WEBHOOK_SECRET matches
 * 4. View webhook logs in Razorpay dashboard
 * 5. Check backend logs for signature mismatch errors
 * 
 * Issue: "Invalid Signature" in payment verification
 * 
 * Cause: RAZORPAY_KEY_SECRET or signature wrong
 * Solution:
 * 1. Verify RAZORPAY_KEY_SECRET in .env matches Razorpay dashboard
 * 2. Check payment signature exists from Razorpay response
 * 3. Ensure test/live key is correct (not mixed)
 * 
 * Issue: Duplicate payment entries
 * 
 * Cause: Webhook received twice (normal, Razorpay retries)
 * Solution:
 * - UNIQUE constraint on razorpay_payment_id prevents duplicates
 * - Second insert will fail (expected)
 * - Order status stays PAID
 * - No action needed
 * 
 * Issue: Database connection refused
 * 
 * Cause: DB_HOST/PORT/PASSWORD wrong in .env
 * Solution:
 * 1. Verify Railway database credentials
 * 2. Test connection manually:
 *    mysql -h shinkansen.proxy.rlwy.net -P 11735 -u root -p
 * 3. Check IP whitelist in Railway
 * 4. Update .env and redeploy
 */

// ========================================
// STEP 10: QUICK CHECKLIST
// ========================================

/**
 * Pre-Launch Checklist:
 * 
 * ✅ Database Migration
 *   - [ ] Tables created on Railway (orders, payments, refunds, payment_logs)
 *   - [ ] Foreign keys verified
 *   - [ ] Indices created
 * 
 * ✅ Environment Variables
 *   - [ ] RAZORPAY_KEY_ID set (test mode)
 *   - [ ] RAZORPAY_KEY_SECRET set (test mode)
 *   - [ ] RAZORPAY_WEBHOOK_SECRET set
 *   - [ ] DB connection verified
 *   - [ ] All env vars in both frontend & backend
 * 
 * ✅ Backend Code
 *   - [ ] paymentController.production.js copied
 *   - [ ] payment.routes.js copied
 *   - [ ] app.js updated with payment routes
 *   - [ ] express.raw() middleware added BEFORE JSON parsing
 *   - [ ] Tests run locally with npm run dev
 * 
 * ✅ Frontend Code
 *   - [ ] Razorpay script added to index.html
 *   - [ ] VITE_RAZORPAY_KEY_ID in .env
 *   - [ ] CheckoutPayment component updated
 *   - [ ] Tests run locally with npm run dev
 * 
 * ✅ Razorpay Configuration
 *   - [ ] Test keys working locally
 *   - [ ] Webhook endpoint created in Razorpay
 *   - [ ] Webhook signed secret saved
 *   - [ ] Test payment succeeds
 * 
 * ✅ Deployment
 *   - [ ] Backend deployed to Render
 *   - [ ] Frontend deployed to Render
 *   - [ ] Migration ran on production database
 *   - [ ] Razorpay webhook URL points to production
 * 
 * ✅ Production Testing
 *   - [ ] Create order in production
 *   - [ ] Payment goes through
 *   - [ ] Webhook received
 *   - [ ] Order status updated to PAID
 *   - [ ] Payment recorded in database
 */

module.exports = {
  RAZORPAY_SETUP: {
    testCardNumber: '4111111111111111',
    testExpiry: '12/25',
    testCVV: '123',
  },
};
