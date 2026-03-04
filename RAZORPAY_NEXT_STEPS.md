# Razorpay Integration - Next Steps Checklist

## ✅ Completed

- [x] 7 backend payment service files created (1935+ lines)
- [x] React payment component created
- [x] Payment routes wired into main Express app
- [x] .env updated with Razorpay test keys
- [x] Comprehensive integration guide created
- [x] .env.example template updated
- [x] All code committed and pushed to GitHub (commit: b102b7c)

---

## 📋 Your Next Steps

### 1. Deploy Database Schema (Required to Test)

```bash
# On Railway MySQL:
# Execute the SQL from: backend/src/database/razorpay_schema.sql
# 
# This creates:
# - orders table (with indexes)
# - payments table (with indexes)
```

**Via SSH/Terminal:**
```bash
mysql -h shinkansen.proxy.rlwy.net -P 11735 -u root -p railway < backend/src/database/razorpay_schema.sql
```

**Via Railway Dashboard:**
1. Go to MySQL service
2. Click "Query" or "Database"
3. Copy contents of `backend/src/database/razorpay_schema.sql`
4. Paste and execute

### 2. Verify Backend Wiring

The payment routes are now in `backend/src/app.js`:

```javascript
const paymentRoute = require("./routes/paymentRoutes");
// ...
app.use("/api/payment", paymentRoute);
```

✅ **Already done** - No changes needed

### 3. Test Payment Flow Locally/Staging

**Start backend:**
```bash
cd backend
npm install razorpay  # If not already installed
npm start
```

**Open frontend and test:**
1. Find a product page with purchase button
2. Click "Buy Now" (using RazorpayPayment component)
3. Test with Razorpay test card:
   - Card: `4111 1111 1111 1111`
   - Expiry: Any future date (e.g., `12/25`)
   - CVV: Any 3 digits (e.g., `123`)

**Check logs:**
- Browser console: Payment flow logs
- Backend terminal: Service logs

### 4. Configure Webhook (For Prod)

In Razorpay Dashboard:

1. Settings → Webhooks → Add Webhook
2. URL: `https://your-prod-domain.railway.app/api/payment/webhook`
3. Select events:
   - payment.captured
   - payment.failed
   - order.paid
4. Copy webhook secret
5. Add to `.env` → `RAZORPAY_WEBHOOK_SECRET=secret_here`

### 5. Production Key Swap (When Ready)

When deploying to production:

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Generate production API keys
3. Update in `.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_live_xxxxx
   RAZORPAY_KEY_SECRET=your_prod_secret
   ```
4. Redeploy backend

---

## 🧪 Testing Checklist

- [ ] Database schema created (check with: `SHOW TABLES;`)
- [ ] Create order endpoint works: `POST /api/payment/create-order`
- [ ] Payment component loads Razorpay script
- [ ] Test card payment completes
- [ ] Payment verification succeeds
- [ ] Order status updates to PAID
- [ ] Can fetch order details: `GET /api/payment/order/:orderId`
- [ ] Can fetch payment: `GET /api/payment/payment/:paymentId`

---

## 📚 Documentation Files Created

- **RAZORPAY_INTEGRATION_GUIDE.md** - Complete setup and API docs
- **backend/src/config/razorpay.js** - Config with test keys
- **backend/src/services/paymentService.js** - Core payment logic
- **backend/src/controllers/paymentController.js** - HTTP handlers
- **backend/src/routes/paymentRoutes.js** - Route definitions
- **backend/src/models/orderModel.js** - Order DB operations
- **backend/src/models/paymentModel.js** - Payment DB operations
- **backend/src/database/razorpay_schema.sql** - Database schema
- **src/components/RazorpayPayment.tsx** - React checkout component

---

## 🔑 Test Credentials

```
Key ID: rzp_test_SG2Tx6WI4tXjVc
Secret: QM7kZJM8nnHGjFX62N038cLZ
```

---

## 📞 Support

Need to troubleshoot? Check:

1. **Logger utility** - `backend/src/utils/logger.js`
2. **Integration guide** - `RAZORPAY_INTEGRATION_GUIDE.md`
3. **Razorpay Docs** - https://razorpay.com/docs/

---

## 🎯 Success Criteria

Payment system is fully functional when:

1. ✅ Database tables exist
2. ✅ Payment component integrates with product pages
3. ✅ Test payments complete successfully
4. ✅ Order status updates in database
5. ✅ Webhook configured and receiving events (production)

---

**Git Commit:** `b102b7c`

All files are ready. Just run the database schema and test! 🚀
