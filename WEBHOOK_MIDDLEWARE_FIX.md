# 🔧 Webhook Middleware Fix - Critical Production Issue

## Problem: ReferenceError: express is not defined

### Error Details
```
ReferenceError: express is not defined
at webhookMiddleware.js when using:
express.raw({ type: 'application/json' })
```

### Root Cause
**Line 17 of webhookMiddleware.js** used `express.raw()` but never imported `express`:

```javascript
// ❌ WRONG - Missing import
const captureRawBody = express.raw({ type: 'application/json' });
```

### Why This Happened
- File only imported logger: `const { logger } = require('../utils/logger');`
- Tried to use express methods without importing the express module
- Node.js threw ReferenceError when evaluating the line

### Impact
- ❌ Backend server would not start
- ❌ Payment webhook route could not load
- ❌ Razorpay signature verification impossible  
- ❌ Production deployment failed on Render

---

## Solution: Add Express Import

### Fix Applied (Commit: abb3a67)

```javascript
// ✅ CORRECT - Import express at top
const express = require('express');
const { logger } = require('../utils/logger');

// Now this works
const captureRawBody = express.raw({ type: 'application/json' });
```

### Files Modified
- `backend/src/middlewares/webhookMiddleware.js` - Added express import + enhanced error handling

### Changes Made

#### 1. Import Express (Line 13)
```javascript
const express = require('express');
```
**Why:** `express.raw()` is a built-in Express method that creates middleware to capture raw request body

#### 2. Enhanced Error Handling in attachRawBody
```javascript
const attachRawBody = (req, res, next) => {
  try {
    if (Buffer.isBuffer(req.body)) {
      req.rawBody = req.body.toString('utf8');
      
      // Parse JSON and handle errors
      try {
        req.body = JSON.parse(req.rawBody);
      } catch (parseError) {
        console.error('❌ Failed to parse webhook JSON:', parseError.message);
        return res.status(400).json({
          status: 'error',
          message: 'Invalid JSON in webhook body'
        });
      }
    }
    // ... more robust handling
    next();
  } catch (error) {
    console.error('❌ attachRawBody middleware error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Webhook processing failed'
    });
  }
};
```

---

## How Webhook Signature Verification Works

### The Problem It Solves
Razorpay signs webhooks using the **raw request body** (before JSON parsing):

```
signature = HMAC-SHA256(raw_body, razorpay_secret)
```

If we parse/modify the body, the signature becomes invalid.

### The Solution Flow

1. **Incoming Webhook Request**
   ```
   POST /api/payment/webhook
   Content-Type: application/json
   x-razorpay-signature: abc123...
   Raw Body: {"event":"payment.authorized","payload":{...}}
   ```

2. **captureRawBody Middleware** (express.raw())
   - Intercepts request BEFORE express.json() parses it
   - Stores raw body as Buffer in `req.body`
   ```javascript
   // express.raw() does this internally
   req.body = Buffer.from(raw_bytes)
   ```

3. **attachRawBody Middleware**
   - Extracts raw Buffer and converts to UTF-8 string
   - Stores in `req.rawBody` for signature verification
   - Parses JSON into `req.body` for controller
   ```javascript
   req.rawBody = req.body.toString('utf8');  // "{"event":"payment.authorized",...}"
   req.body = JSON.parse(req.rawBody);        // { event: "payment.authorized", ... }
   ```

4. **Payment Controller**
   - Accesses `req.rawBody` for signature verification
   - Accesses `req.body` for normal webhook data
   ```javascript
   // In paymentController.webhook()
   const signature = req.headers['x-razorpay-signature'];
   const isValid = verifySignature(req.rawBody, signature, secret);
   
   if (!isValid) {
     throw new Error('Webhook signature verification failed');
   }
   
   // Process webhook event
   const event = req.body.event;
   const payload = req.body.payload;
   ```

---

## Usage in Routes

### paymentRoutes.js (Correct Usage)

```javascript
const express = require('express');
const router = express.Router();
const { captureRawBody, attachRawBody } = require('../middlewares/webhookMiddleware');
const paymentController = require('../controllers/paymentController');

// ✅ Webhook route with raw body handling
router.post(
  '/webhook',
  (req, res, next) => {
    console.log('🎣 POST /api/payment/webhook received from Razorpay');
    next();
  },
  captureRawBody,        // ← Apply express.raw() first
  attachRawBody,         // ← Then attach raw to request object
  paymentController.webhook  // ← Controller receives req.rawBody + req.body
);

// ✅ Other routes use normal JSON parsing (express.json() in app.js)
router.post('/create-order', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);
```

### Key Points
- `captureRawBody` must be applied BEFORE `attachRawBody`
- Only use on webhook route (other routes use express.json() from app.js)
- Controller receives both `req.rawBody` (string) and `req.body` (object)

---

## Node.js v22 Compatibility

The fix is fully compatible with Node.js v22.22.0 (what Render uses):

✅ `require('express')` - CommonJS still supported in Node v22  
✅ `express.raw()` - Available in Express v4  
✅ `Buffer.isBuffer()` - Native Node.js method  
✅ `JSON.parse()` - Native JavaScript

No ESM migration needed for this middleware.

---

## Production Deployment Steps

### 1. Current State
- ✅ Commit abb3a67 pushed to GitHub with fix
- ✅ Razorpay package added to backend/package.json
- ✅ Webhook middleware now imports express correctly

### 2. Redeploy on Render
```
Render Dashboard:
1. Go to Backend Service
2. Click "Manual Deploy"
3. Wait for build to complete
4. Check logs for: "✅ Payment routes successfully loaded"
```

### 3. Verify Webhook Route Loads
Expected logs:
```
🚀 REGISTERING API ROUTES:
   ✅ POST /api/payment/* → paymentRoute
   ├─ GET /health → Payment health check
   ├─ POST /create-order → Create payment order
   ├─ POST /verify → Verify payment
   ├─ POST /webhook → Razorpay webhook ← This should load now
   ├─ GET /order/:orderId → Get order
   └─ GET /payment/:paymentId → Get payment

✨ All routes registered successfully!

✅ Payment routes successfully loaded
   Routes: /create-order, /verify, /webhook, /order/:id, /health
```

### 4. Test Webhook Endpoint
```bash
# Test that webhook route is accessible
curl -X GET https://your-render-url/api/payment/health

# Should return 200 with webhook route listed as "Ready"
{
  "status": "Payment API is running",
  "routes": {
    "POST /api/payment/webhook": "✅ Ready",
    ...
  }
}
```

---

## Error Handling in Middleware

The enhanced middleware now handles:

| Scenario | Behavior | Response |
|----------|----------|----------|
| Valid raw body (Buffer) | Convert to string, parse JSON | 200 OK, req.rawBody set |
| String body | Convert to string, parse JSON | 200 OK, req.rawBody set |
| Invalid JSON | Return error | 400 Bad Request |
| Already parsed object | Reconstruct raw | 200 OK, req.rawBody set |
| Empty body | Set empty string | 200 OK, req.rawBody = '' |
| Middleware crash | Catch and respond | 500 Internal Error |

All error paths log detailed messages for debugging.

---

## Testing the Fix Locally

### 1. Verify Import Works
```bash
cd backend
node -e "const m = require('./src/middlewares/webhookMiddleware.js'); console.log('✅ Middleware loads correctly')"
```

Expected output: `✅ Middleware loads correctly`

### 2. Start Server
```bash
npm start
```

Expected logs:
```
✅ Payment routes successfully loaded
📡 Server running on port 3001
```

### 3. Test Webhook Route Exists
```bash
curl http://localhost:3001/api/payment/health
```

Should return 200 with webhook status.

---

## Summary

### What Was Fixed
- ❌ ReferenceError: express is not defined
- ✅ Express import added to webhookMiddleware.js
- ✅ Enhanced error handling for webhook processing
- ✅ Production-safe implementation

### Impact
- ✅ Webhook route can now load
- ✅ Razorpay signature verification can proceed
- ✅ No more server startup failures
- ✅ Comprehensive error logging

### Files Changed
- `backend/src/middlewares/webhookMiddleware.js` (56 insertions, 7 deletions)
- Commit: abb3a67

### Status
🚀 **Ready for Production Deployment**

Next step: Click "Manual Deploy" on Render to redeploy with the fix.

---

## Reference

### Middleware Chaining in Payment Routes
```javascript
router.post('/webhook',
  middleware1,      // Logging middleware
  captureRawBody,   // express.raw() - gets Buffer
  attachRawBody,    // Processes Buffer -> req.rawBody + req.body
  weeklyController  // Has access to both req.body and req.rawBody
);
```

### What Each Part Does
| Middleware | Input | Output | Purpose |
|-----------|-------|--------|---------|
| captureRawBody | Raw HTTP body | req.body = Buffer | Prevents JSON parsing |
| attachRawBody | req.body = Buffer | req.rawBody = string | Preserves for signature |
| | | req.body = object | Allows JSON processing |
| webhook controller | req.rawBody + req.body | Verification + handling | Verify signature, process event |

