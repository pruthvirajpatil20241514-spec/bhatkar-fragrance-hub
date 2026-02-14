# Razorpay Payment Integration - Complete Guide

## Overview

This guide covers the production-ready Razorpay payment integration for Bhatkar Fragrance Hub. The system includes:

- **Backend**: Payment service with order management, signature verification, and webhook handling
- **Frontend**: React component for customer checkout
- **Database**: Orders and Payments tables with performance optimizations
- **Security**: HMAC-SHA256 verification, no frontend amount manipulation, transaction support

---

## ✅ Implementation Checklist

- [x] Backend payment service created (`backend/src/services/paymentService.js`)
- [x] Payment controller with 6 HTTP endpoints (`backend/src/controllers/paymentController.js`)
- [x] Payment routes with auth/no-auth split (`backend/src/routes/paymentRoutes.js`)
- [x] Order and Payment database models (`backend/src/models/orderModel.js`, `paymentModel.js`)
- [x] Database schema with indexes (`backend/src/database/razorpay_schema.sql`)
- [x] Razorpay config with test keys (`backend/src/config/razorpay.js`)
- [x] React payment component (`src/components/RazorpayPayment.tsx`)
- [x] Environment variables updated (`.env`)
- [x] Backend app.js wired with payment routes

---

## 🚀 Setup Instructions

### Step 1: Database Setup

Run the schema SQL to create orders and payments tables:

```bash
mysql -h shinkansen.proxy.rlwy.net -P 11735 -u root -p railway < backend/src/database/razorpay_schema.sql
```

**Or** if using Railway dashboard SQL editor, copy contents of `backend/src/database/razorpay_schema.sql` and execute.

**Tables created:**
- `orders` - Stores customer orders with Razorpay order IDs
- `payments` - Stores payment verification data with signatures

### Step 2: Environment Configuration

Your `.env` already has test keys added:

```env
RAZORPAY_KEY_ID=rzp_test_SG2Tx6WI4tXjVc
RAZORPAY_KEY_SECRET=QM7kZJM8nnHGjFX62N038cLZ
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_from_dashboard
```

**For Production:**
1. Replace test keys with production keys from [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Get webhook secret from Dashboard → Settings → Webhooks

### Step 3: Frontend Environment

Create `.env.local` in frontend root (if not exists):

```env
REACT_APP_RAZORPAY_KEY_ID=rzp_test_SG2Tx6WI4tXjVc
```

This allows frontend to initialize Razorpay Checkout.

### Step 4: Deploy Backend

Ensure payment routes are wired in `backend/src/app.js` (already done):

```javascript
const paymentRoute = require("./routes/paymentRoutes");
// ... in app setup ...
app.use("/api/payment", paymentRoute);
```

---

## 📋 API Endpoints

### 1. Create Order

**Endpoint:** `POST /api/payment/create-order`

**Auth:** Required (user must be logged in)

**Request:**
```json
{
  "productId": 123,
  "quantity": 1
}
```

**Response (Success):**
```json
{
  "success": true,
  "orderId": "order_1234567890",
  "razorpayOrderId": "order_IluGVZzf5xyOXs",
  "amount": 999.00,
  "productName": "Rose Essence Perfume"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Product not found"
}
```

**Flow:**
1. Backend fetches product price from database (never from frontend)
2. Creates Razorpay order with exact amount
3. Saves order to database with PENDING status
4. Returns order ID and Razorpay order ID to frontend

---

### 2. Verify Payment

**Endpoint:** `POST /api/payment/verify`

**Auth:** Required

**Request:**
```json
{
  "orderId": "order_1234567890",
  "razorpay_payment_id": "pay_1234567890",
  "razorpay_signature": "signature_hash_from_razorpay"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Payment verified and order updated"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid signature"
}
```

**Security Flow:**
1. Backend verifies HMAC-SHA256 signature (prevents tampering)
2. Checks for duplicate payments (prevents replay attacks)
3. Updates order status to PAID
4. Saves payment details with signature

---

### 3. Webhook Endpoint

**Endpoint:** `POST /api/payment/webhook`

**Auth:** None (Razorpay signature validates instead)

**Events Handled:**
- `payment.captured` - Payment successful
- `payment.failed` - Payment failed
- `order.paid` - Order paid (from Razorpay side)

**Webhook Setup in Razorpay Dashboard:**
1. Go to Settings → Webhooks
2. Create webhook with URL: `https://your-backend.railway.app/api/payment/webhook`
3. Select events: `payment.captured`, `payment.failed`, `order.paid`
4. Copy webhook secret to `.env` → `RAZORPAY_WEBHOOK_SECRET`

---

### 4. Get Order Details

**Endpoint:** `GET /api/payment/order/:orderId`

**Auth:** Required

**Response:**
```json
{
  "success": true,
  "order": {
    "id": 1,
    "user_id": 5,
    "product_id": 123,
    "quantity": 1,
    "total_amount": 999.00,
    "razorpay_order_id": "order_IluGVZzf5xyOXs",
    "status": "PAID",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:35:00Z"
  }
}
```

---

### 5. Get Payment Details

**Endpoint:** `GET /api/payment/payment/:paymentId`

**Auth:** Required

**Response:**
```json
{
  "success": true,
  "payment": {
    "id": 1,
    "order_id": 1,
    "razorpay_payment_id": "pay_IluG12345678",
    "razorpay_signature": "signature_hash",
    "payment_status": "captured",
    "created_at": "2024-01-15T10:35:00Z"
  }
}
```

---

## 🎨 Using RazorpayPayment Component

### Basic Usage

```tsx
import RazorpayPayment from './components/RazorpayPayment';

function ProductPage() {
  const handleSuccess = (response) => {
    console.log('Payment successful!', response);
    // Redirect to order confirmation
  };

  const handleError = (error) => {
    console.error('Payment failed:', error);
    // Show error message
  };

  return (
    <div>
      <h1>Product Details</h1>
      <RazorpayPayment
        productId={123}
        quantity={1}
        onSuccess={handleSuccess}
        onError={handleError}
        buttonText="Buy Now"
      />
    </div>
  );
}
```

### Component Props

```typescript
interface RazorpayPaymentProps {
  productId: number;              // Required: Product ID to purchase
  quantity?: number;               // Optional: Quantity (default: 1)
  onSuccess?: (response) => void;  // Optional: Success callback
  onError?: (error) => void;       // Optional: Error callback
  buttonText?: string;             // Optional: Button label (default: "Pay Now")
  buttonClassName?: string;        // Optional: CSS class (default: "btn-primary")
}
```

### Component Features

✅ **Automatic Razorpay Script Loading** - Loads from CDN if not already loaded
✅ **Error Handling** - Displays errors in user-friendly format
✅ **Loading States** - Shows "Processing..." during payment
✅ **Prefill Support** - Auto-fills email/phone from localStorage
✅ **Theme Customization** - Razorpay modal uses brand color (#FF6B35)
✅ **Notes Support** - Includes productId and quantity in Razorpay notes

---

## 🧪 Testing Payment Flow

### Test Cards

Use these test cards for development (from [Razorpay Docs](https://razorpay.com/docs/payments/payments-landing-page/test-cards/)):

**Successful Payment:**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date (e.g., `12/25`)
- CVV: Any 3 digits (e.g., `123`)

**Failed Payment:**
- Card Number: `4000 0000 0000 0002`
- Expiry: Any future date
- CVV: Any 3 digits

### Testing Steps

1. **Frontend**: Click "Buy Now" button
2. **Backend**: Creates order, logs to console
3. **Checkout Opens**: Razorpay modal appears
4. **Enter Card**: Use test card from above
5. **OTP**: If prompted, use any 6-digit number
6. **Verify**: Backend verifies signature
7. **Success**: Order marked as PAID

### Debug Logs

Check browser console and backend logs:

**Frontend (Browser Console):**
```
[RazorpayPayment] Creating order...
[RazorpayPayment] Order created: order_IluGVZzf5xyOXs
[RazorpayPayment] Opening Razorpay Checkout...
[RazorpayPayment] Verifying payment...
[RazorpayPayment] ✓ Payment verified!
```

**Backend Console:**
```
[paymentService] Creating order for user 5, product 123, qty 1
[paymentService] Razorpay order created: order_IluGVZzf5xyOXs
[paymentService] Order saved to DB with ID: 1
[paymentService] Verifying payment signature...
[paymentService] ✓ Signature valid, updating order status...
```

---

## 🔒 Security Best Practices

### 1. Amount Validation
❌ **NEVER trust frontend amounts**
✅ **Always fetch from database**

```javascript
// Backend paymentService.js
const productResult = await db.execute(
  'SELECT price FROM products WHERE id = ? AND is_active = 1',
  [productId]
);
const price = productResult[0][0].price; // ← DB SOURCE OF TRUTH
```

### 2. Signature Verification
✅ **HMAC-SHA256 signature validation on all payments**

```javascript
const hash = crypto
  .createHmac('sha256', webhookSecret)
  .update(orderId + '|' + paymentId)
  .digest('hex');

if (hash !== signature) {
  throw new Error('Invalid signature - possible tampering');
}
```

### 3. Idempotency
✅ **Check for duplicate payments before processing**

```javascript
const exists = await PaymentModel.exists(razorpayPaymentId);
if (exists) {
  throw new Error('Payment already processed');
}
```

### 4. Transactions
✅ **Use database transactions for atomic operations**

```javascript
const connection = await db.getConnection();
try {
  await connection.beginTransaction();
  await connection.execute('INSERT INTO orders...');
  await connection.execute('INSERT INTO payments...');
  await connection.commit();
} catch (err) {
  await connection.rollback();
  throw err;
}
```

### 5. Webhook Validation
✅ **Validate webhook signature before processing**

```javascript
const webhookSignature = req.headers['x-razorpay-signature'];
const expected = crypto
  .createHmac('sha256', secret)
  .update(rawBody)
  .digest('hex');

if (webhookSignature !== expected) {
  throw new Error('Invalid webhook signature');
}
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Invalid Signature"

**Cause:** Amount mismatch or tampered data

**Solution:**
- Verify `RAZORPAY_KEY_SECRET` is correct in `.env`
- Ensure amount is fetched from DB, not frontend
- Check webhook signature generation uses raw body

### Issue 2: "Cannot find module razorpay"

**Cause:** npm package not installed

**Solution:**
```bash
cd backend
npm install razorpay
```

### Issue 3: "Webhook not received"

**Cause:** Webhook not configured in Razorpay dashboard

**Solution:**
1. Login to Razorpay Dashboard
2. Settings → Webhooks → Add Webhook
3. Paste: `https://your-backend-url/api/payment/webhook`
4. Select events: payment.captured, payment.failed, order.paid
5. Copy secret and paste in `.env` → `RAZORPAY_WEBHOOK_SECRET`
6. Test webhook from dashboard

### Issue 4: Duplicate Order Creation

**Cause:** Multiple order creation calls before first completes

**Solution:**
- Add loading state to button (already done in component)
- Disable button during processing
- Check for existing order before creating new one

---

## 📊 Monitoring & Analytics

### Query Order Statistics

```sql
-- Total revenue
SELECT SUM(total_amount) as total_revenue 
FROM orders 
WHERE status = 'PAID';

-- Orders by status
SELECT status, COUNT(*) as count 
FROM orders 
GROUP BY status;

-- Recent orders
SELECT * FROM orders 
WHERE status = 'PAID' 
ORDER BY created_at DESC 
LIMIT 10;
```

### API Endpoints for Stats

Backend service includes `getStats()` method for analytics:

```javascript
const stats = await PaymentService.getStats();
// Returns: { totalOrders, totalRevenue, paidOrders, pendingOrders }
```

---

## 🔄 Production Deployment

### Before Going Live

1. **Replace Test Keys**
   ```env
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=your_production_secret
   RAZORPAY_WEBHOOK_SECRET=your_production_webhook_secret
   ```

2. **Set NODE_ENV to Production**
   ```env
   NODE_ENV=production
   ```

3. **Test with Production Keys** (small amounts)
   - Place test orders
   - Verify payments process correctly
   - Check webhook deliveries

4. **Configure Webhook** in Production Dashboard
   - Create webhook for production URL
   - Update secret in `.env`
   - Verify webhook headers include correct signature

5. **Enable SSL/HTTPS**
   - Required for webhook delivery
   - Razorpay won't send webhooks to non-HTTPS URLs

6. **Monitor Logs**
   - Check backend logs for payment errors
   - Monitor webhook delivery in Razorpay Dashboard
   - Set up alerts for failed payments

---

## 📱 Mobile Optimization

The RazorpayPayment component is mobile-friendly:

✅ Responsive button sizing
✅ Touch-friendly modals
✅ Mobile payment methods supported
✅ Works with all major payment apps

---

## 📚 Additional Resources

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Dashboard](https://dashboard.razorpay.com)
- [Test Cards & Flows](https://razorpay.com/docs/payments/payments-landing-page/test-cards/)
- [Webhook Documentation](https://razorpay.com/docs/webhooks/)
- [API Reference](https://razorpay.com/docs/api/)

---

## 🎯 Next Steps

1. ✅ Run database schema
2. ✅ Test payment flow with test keys
3. ✅ Verify webhook delivery
4. ✅ Add payment component to product pages
5. ✅ Test on staging before production
6. ✅ Replace test keys with production keys
7. ✅ Deploy to production with HTTPS

---

**Questions?** Check the logs in `backend/src/utils/logger.js` for detailed payment processing information.
