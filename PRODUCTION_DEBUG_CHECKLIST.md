# 🚨 PRODUCTION DEBUGGING CHECKLIST

## Issue 1: Payment Route Returns 404

### Quick Fix (5 minutes)

```bash
# 1. Check if backend is running
curl https://your-render-url/health
# Should return JSON with "healthy" status

# 2. Test payment health endpoint
curl https://your-render-url/api/payment/health
# Should return JSON with payment routes listed

# 3. If not working, check Render logs
# Go to Render Dashboard → Backend Service → Logs
# Look for: "✅ Payment routes successfully loaded"
```

### If Still 404

**Server logs show "✅ Payment routes successfully loaded"?**
- ✅ YES → Payment routes are loaded, issue is client-side (see Issue 2)
- ❌ NO → Redeploy backend: Go to Render Dashboard → Click "Deploy"

---

## Issue 2: Product Images Not Displaying

### Quick Fix (2 minutes)

1. **Check browser console for image errors**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for messages starting with ❌ or ⚠️
   - Copy error message

2. **Check network tab**
   - Go to Network tab
   - Reload page
   - Look for 404s on image URLs
   - Check image URL format (should start with http/https or /)

3. **Test image helper function**
   ```javascript
   // In browser console, paste:
   import { getProductImage } from '/src/lib/imageUtils.ts';
   
   // Then paste your problematic product data:
   const testImage = ... // copy product.images[0]
   console.log('Extracted URL:', getProductImage(testImage));
   ```

### Common Symptoms & Fixes

| Symptom | Root Cause | Fix |
|---------|-----------|-----|
| `src="[object Object]"` | Image not extracted from object | Update component to use `getProductImage()` |
| `src="/placeholder.svg"` | Image URL was invalid/missing | Check API response format in Network tab |
| Image 404 in Network | URL is wrong/incomplete | Verify image_url in API response |
| No cart images visible | CartDrawer not using helper | Update CartDrawer to use new utilities |
| Different images on refresh | No caching/deduplication | Make sure using `productApi` helpers |

---

## Issue 3: Duplicate API Requests

### Check Cache Status

In browser console:
```javascript
// Import helpers
import { debugApiCache, clearApiCache } from '/src/lib/apiUtils.ts';

// See what's cached
debugApiCache();

// Clear cache if needed
clearApiCache('products');
```

**Expected Output:**
- Each endpoint should appear once per 5 seconds max
- Multiple same requests within 5 sec = using cache (good!)
- Multiple different requests = OK, different data needed

---

## Testing Checklist

- [ ] Payment route works: `GET /api/payment/health` → 200
- [ ] No image URLs are `[object Object]`
- [ ] No image URLs are empty strings
- [ ] All `<img>` tags have `src` attribute (not undefined)
- [ ] No duplicate API requests in Network tab
- [ ] CartDrawer images load correctly
- [ ] Product Detail images load correctly
- [ ] Shop page images load correctly
- [ ] Placeholder shows when image fails to load
- [ ] No console errors on main pages

---

## Debug Commands (Browser Console)

```javascript
// Import debug utilities
import { getProductImage, debugImageData } from '@/lib/imageUtils';
import { debugApiCache, clearApiCache } from '@/lib/apiUtils';

// Test image extraction
const product = { images: [{image_url: 'https://...'}] };
getProductImage(product.images[0]); // Should return URL string

// Debug specific image data
debugImageData(product.images, 'Product Images');

// Check API cache
debugApiCache();

// Clear specific cache
clearApiCache('products');

// Test payment route
fetch('/api/payment/health').then(r => r.json()).then(console.log);

// Monitor all requests (enable debug logging)
import { enableApiDebugLogging } from '@/lib/apiUtils';
enableApiDebugLogging();
```

---

## Render Deployment Checklist

### Backend Deployment
- [ ] Updated `backend/src/app.js` with new routing code
- [ ] Updated `backend/src/routes/paymentRoutes.js` with health check
- [ ] Committed to GitHub
- [ ] Redeploy on Render Dashboard
- [ ] Check Logs for "✅ Payment routes successfully loaded"

### Frontend Deployment
- [ ] Copied `src/lib/imageUtils.ts`
- [ ] Copied `src/lib/apiUtils.ts`
- [ ] Updated image imports in components
- [ ] Updated API calls to use productApi helpers
- [ ] No TypeScript errors: `npm run build`
- [ ] Tested locally: `npm run dev`
- [ ] Committed to GitHub
- [ ] Redeploy on Render Dashboard
- [ ] Test in production

---

## Emergency Fixes

### If images completely broken:

1. **Clear all assets and cache**
   ```bash
   # On Render Dashboard:
   # 1. Go to Frontend Service
   # 2. Click "Environment" tab
   # 3. Redeploy with: npm install && npm run build
   ```

2. **Revert to working version**
   ```bash
   git log --oneline
   # Find last working commit
   git reset --hard <commit-hash>
   git push --force
   # Redeploy on Render
   ```

3. **Override broken images temporarily**
   ```javascript
   // In CartDrawer or ProductDetail
   // Hardcode image URL to test:
   <img src="https://cdn.example.com/placeholder.jpg" />
   ```

---

## What NOT To Do

❌ Don't modify API responses manually  
❌ Don't use inline image URL strings  
❌ Don't skip onError handlers  
❌ Don't ignore console warnings  
❌ Don't deploy without testing locally  
❌ Don't clear entire database  
❌ Don't hard-code image paths  

---

## Key Files

| File | Purpose | Status |
|------|---------|--------|
| `backend/src/app.js` | Express routing + logging | ✅ Fixed |
| `backend/src/routes/paymentRoutes.js` | Payment routes + health check | ✅ Fixed |
| `src/lib/imageUtils.ts` | Image extraction helper | ✅ Created |
| `src/lib/apiUtils.ts` | API caching + deduplication | ✅ Created |
| `src/components/cart/CartDrawer.tsx` | Image rendering | ⏳ Needs update |
| `src/pages/ProductDetail.tsx` | Product detail images | ⏳ Needs update |
| `src/pages/Shop.tsx` | Shop images | ⏳ Needs update |

---

## Support Info

**For payment routing issues:**
- Check: `backend/src/app.js` line 82-100 (route mounting)
- Test: `GET https://your-render-url/api/payment/health`
- Logs: Render Dashboard → Backend → Logs

**For image issues:**
- Check: Network tab for image 404s
- Test: Browser console `getProductImage(data)`
- Logs: Browser console for ❌ errors

**For API issues:**
- Check: Network tab request deduplication
- Test: Browser console `debugApiCache()`
- Logs: Every request logged with timestamp

---

## Contact

If issues persist:
1. Collect screenshots of:
   - Browser Network tab (showing requests)
   - Browser Console (showing errors)
   - Render Logs (showing server output)
2. Document exact steps to reproduce
3. Share affected product/page URLs

---

Last Updated: February 15, 2026
