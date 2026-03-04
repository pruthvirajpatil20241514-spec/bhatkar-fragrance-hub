# Razorpay Payment Audit Checklist

**Issue:** Razorpay popup shows "Uh! Oh! Something went wrong" even though order creation succeeds.

---

## 🔍 AUDIT CHECKLIST

### 1️⃣ Key Consistency Verification

**Check in Render Dashboard:**

Backend Service → Environment Variables:
```
RAZORPAY_KEY_ID=rzp_live_SMD9AGyXN0xDKM
RAZORPAY_KEY_SECRET=3e2wlpstPAP1vxxOVKuOop4R
```

**Check in .env file (local):**
```
RAZORPAY_KEY_ID=rzp_live_SMD9AGyXN0xDKM
RAZORPAY_KEY_SECRET=3e2wlpstPAP1vxxOVKuOop4R
VITE_RAZORPAY_KEY_ID=rzp_live_SMD9AGyXN0xDKM
```

**Verify all keys are LIVE mode:**
- ✅ Key starts with `rzp_live_` (NOT `rzp_test_`)
- ✅ All three keys belong to SAME Razorpay account
- ✅ Backend knows the secret to verify signature

---

### 2️⃣ Domain Whitelisting (CRITICAL)

**Go to Razorpay Dashboard:**

1. Settings → Website & App Settings
2. Add these domains:
   - `https://bhatkar-fragrance-hub-5.onrender.com` (Frontend)
   - `http://localhost:3000` (Local dev)
   - `http://localhost:5173` (Local dev Vite)

**Why this matters:**
- Razorpay blocks requests from unlisted domains
- Results in "Something went wrong" error

---

### 3️⃣ Razorpay Key Delivery Flow

**Frontend → Backend → Razorpay:**

```
1. Frontend calls GET /api/payment/config
   ↓
2. Backend returns RAZORPAY_KEY_ID from env
   ↓
3. Frontend uses this key to initialize Razorpay
   ↓
4. Razorpay validates key + domain
   ↓
5. If domain not whitelisted → 400 error
```

**Logs to check:**
```
Backend logs:
🔑 Fetching Razorpay key from backend...
✅ Razorpay key retrieved from backend

Frontend logs:
📋 Razorpay options: key SET, amount X, contact ...
🔧 Initializing Razorpay with options
📤 Calling razorpay.open()...
✅ Razorpay modal should be visible
```

---

### 4️⃣ Razorpay Initialization Validation

**What gets sent to Razorpay:**

```javascript
{
  key: "rzp_live_SMD9AGyXN0xDKM",          // Must match Razorpay account
  amount: 2970,                             // In paise (27.70 * 100)
  currency: "INR",                          // Always INR
  name: "Bhatkar Fragrance Hub",            // Shop name
  description: "Order - Product Name",      // Order description
  order_id: "order_SMhSaV088kEzA4",         // From backend
  
  prefill: {
    email: "user@example.com",              // Optional
    contact: "9876543210"                   // 10-digit number (optional)
  }
}
```

**Validation Checks:**
- ✅ key: Must be from same Razorpay account
- ✅ amount: Must be > 0, in paise (multiply by 100)
- ✅ order_id: Must match order created with same key
- ✅ contact: Must be 10 digits if provided (not empty)
- ✅ email: Valid email format

---

### 5️⃣ Backend Verification Route

**What happens after payment:**

```
1. Frontend receives payment response
   {
     razorpay_payment_id: "pay_xxx",
     razorpay_signature: "sig_xxx"
   }

2. Frontend sends to /api/payment/verify

3. Backend verifies signature:
   - Uses RAZORPAY_KEY_SECRET
   - HMAC-SHA256(order_id|payment_id, secret)
   - Compares with provided signature

4. If signature valid → Mark order as PAID
5. If signature invalid → Reject payment
```

**Required:** Signature verification MUST use correct SECRET from same Razorpay account.

---

### 6️⃣ Backend Health Check

**Verify backend is running:**

```bash
# Test health endpoint
curl https://bhatkar-fragrance-hub-1.onrender.com/api/payment/health

# Response should be:
{
  "status": "Payment API is running",
  "routes": {...},
  "controller": {...}
}
```

**If this fails:**
- Backend is sleeping (Render Free plan)
- Or backend crashed
- Check Render logs for errors

---

### 7️⃣ Payment Verification Route

**Test the verify endpoint:**

```bash
curl -X POST https://bhatkar-fragrance-hub-1.onrender.com/api/payment/verify \
  -H "Content-Type: application/json" \
  -d {
    "orderId": 10,
    "razorpay_payment_id": "pay_xxx",
    "razorpay_signature": "sig_xxx"
  }
```

**Check logs for:**
- ✅ Order found in database
- ✅ Signature verification succeeds
- ✅ Order status updated to PAID
- ❌ If fails, check error message

---

## 🔧 QUICK FIXES

### Fix 1: Update Domain Whitelist
1. Go to Razorpay Dashboard
2. Settings → Website & App Settings
3. Add: `https://bhatkar-fragrance-hub-5.onrender.com`
4. Save

### Fix 2: Verify Keys Match
- Razorpay Dashboard → Account Settings → API Keys
- Copy live key
- Update `.env`: `RAZORPAY_KEY_ID=rzp_live_xxxxx`
- Update Render env vars same
- Redeploy

### Fix 3: Check Backend Logs
- Render Dashboard → Backend Service → Logs
- Look for errors in `/api/payment/create-order`
- Look for errors in `/api/payment/verify`

---

## 📊 EXPECTED FLOW (Working)

```
1. User adds items → Cart shows 2 items
2. Click "Pay Now" → Checkout
3. Frontend calls GET /api/payment/config
   ✅ Returns: { razorpayKeyId: "rzp_live_xxx" }
4. Frontend calls POST /api/payment/create-order
   ✅ Returns: { orderId: 10, razorpayOrderId: "order_xxx", amount: 29.7 }
5. Frontend initializes Razorpay with key from backend
   ✅ Logs: "🔧 Initializing Razorpay"
   ✅ Logs: "📤 Calling razorpay.open()"
6. Razorpay modal opens (blue modal)
   ✅ No "Something went wrong" error
7. User completes payment
8. Razorpay returns payment response
9. Frontend calls POST /api/payment/verify
   ✅ Returns: { success: true }
10. Order marked as PAID in database
```

---

## ❌ FAILING FLOW (Current Issue)

```
1. Order creation succeeds ✅
2. Frontend logs show razorpay.open() called ✅
3. But Razorpay modal shows error ❌
   "Uh! Oh! Something went wrong"
   
Likely causes:
A. Domain not whitelisted in Razorpay
B. Key mismatch (test vs live)
C. Order created with different account
D. Razorpay script failed to load
E. Invalid prefill contact format
F. Network issue between frontend & Razorpay servers
```

---

## 🚀 IMMEDIATE ACTIONS

1. **Check Razorpay Domain Whitelist** (5 minutes)
   ```
   Razorpay Dashboard → Settings → Website & App Settings
   → Add your Render frontend URL
   → Save
   ```

2. **Verify Keys** (2 minutes)
   ```
   .env: RAZORPAY_KEY_ID=?
   Render env: RAZORPAY_KEY_ID=?
   Should be IDENTICAL and start with rzp_live_
   ```

3. **Check Backend Health** (1 minute)
   ```
   curl https://bhatkar-fragrance-hub-1.onrender.com/api/payment/health
   Should return 200 with status message
   ```

4. **Redeploy Backend** (5 minutes)
   ```
   Render Dashboard → Backend → Manual Deploy
   Wait for deployment to complete
   Check logs for startup messages
   ```

5. **Check Browser Console** (2 minutes)
   ```
   Open DevTools → Console tab
   Look for error messages
   Check network tab for failed requests
   ```

---

## 📞 If Issue Persists

**Collect these details:**
1. Screenshot of Razorpay error modal
2. Browser console full error message
3. Backend logs from past 10 minutes
4. Order ID that failed
5. Payment amount
6. User contact/email

**Check Razorpay Support:**
- Contact: https://razorpay.com/contact-us/
- Check test payment in Razorpay Dashboard
