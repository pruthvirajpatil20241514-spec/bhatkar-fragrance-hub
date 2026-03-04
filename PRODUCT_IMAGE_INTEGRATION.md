# Product Image System - Integration & Setup Guide

## Complete Step-by-Step Setup

### Phase 1: Pre-Deployment Verification (Local)

#### 1.1 Verify All Files Exist

```bash
# Backend files
ls backend/src/database/productImages.queries.js
ls backend/src/database/scripts/addProductImages.js
ls backend/src/models/productImage.model.js
ls backend/src/controllers/productImage.controller.js

# Frontend files
ls src/components/products/ProductImageCarousel.tsx
ls src/components/products/ProductImageCarousel.css
ls src/pages/ProductDetailWithImages.tsx

# All should exist with no errors
```

#### 1.2 Verify Code Committed to Git

```bash
# Check git status
git status
# Should show: nothing to commit, working tree clean

# Check recent commits
git log --oneline -5
# Should show: "Add complete product image system with carousel UI and APIs"
```

#### 1.3 Verify Backend Routes

```bash
# Check that routes are properly exported
grep -n "router.get" backend/src/routes/product.route.js
grep -n "router.post" backend/src/routes/product.route.js
grep -n "router.put" backend/src/routes/product.route.js
grep -n "router.delete" backend/src/routes/product.route.js
```

---

### Phase 2: Production Deployment

#### 2.1 Wait for Render Auto-Redeploy

After push to main branch:
- ⏱️ Wait 2-3 minutes
- Check Render dashboard: https://dashboard.render.com
- Backend should show "Live" status

#### 2.2 Verify Backend is Online

```bash
# Test backend health
curl https://bhatkar-fragrance-hub-1.onrender.com/api/products

# Expected: 200 OK with products array (may be empty)
```

#### 2.3 Verify Database Connection

```bash
# SSH to backend (via Render)
# Or run health check

# Check database connection works
# Look for logs: "Connected to database successfully"
```

---

### Phase 3: Database Initialization

#### 3.1 Run Migration Script

**Option A: Run Locally (if you have access)**

```bash
cd backend
npm run db:add:product-images
```

**Option B: Run via Render Shell**

1. Go to Render Dashboard
2. Select backend service
3. Go to "Shell"
4. Run: `npm run db:add:product-images`

**Expected Output:**
```
Connected to database successfully
Creating product_images table...
Table created successfully!

Adding sample images...
Sample images added successfully!

Product images in database:
Product ID: 1, Images: 4
Product ID: 2, Images: 4
...
```

#### 3.2 Verify Table Created

```bash
# Connect to Railway MySQL
mysql -h shinkansen.proxy.rlwy.net -u [USERNAME] -p

# Check table exists
SHOW TABLES;
# Should show: product_images

# Check table structure
DESCRIBE product_images;
# Should show all 7 columns

# Check sample data
SELECT COUNT(*) FROM product_images;
# Should show: 4+ (at least some images)
```

---

### Phase 4: Backend API Testing

#### 4.1 Test Public Endpoints (No Authentication)

**Test 4.1.1: Get All Products with Images**

```bash
curl -X GET "https://bhatkar-fragrance-hub-1.onrender.com/api/products/with-images/all" \
  -H "Content-Type: application/json"

# Expected: 200 OK
# Response should include products array with images nested
```

**Test 4.1.2: Get Single Product with Images**

```bash
curl -X GET "https://bhatkar-fragrance-hub-1.onrender.com/api/products/1/with-images" \
  -H "Content-Type: application/json"

# Expected: 200 OK
# Response should include product object with images array
```

**Test 4.1.3: Get Product Images Only**

```bash
curl -X GET "https://bhatkar-fragrance-hub-1.onrender.com/api/products/1/images" \
  -H "Content-Type: application/json"

# Expected: 200 OK
# Response should include images array (4 images if sample data added)
```

#### 4.2 Test Admin Endpoints (Require Authentication)

**Setup: Get Admin Token**

```bash
# Login as admin
curl -X POST "https://bhatkar-fragrance-hub-1.onrender.com/api/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin_password"
  }'

# Save the token from response
# ADMIN_TOKEN = "eyJhbGciOiJIUzI1NiIs..."
```

**Test 4.2.1: Add Images (Admin)**

```bash
ADMIN_TOKEN="your_token_here"

curl -X POST "https://bhatkar-fragrance-hub-1.onrender.com/api/products/2/images" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "images": [
      {
        "imageUrl": "https://images.unsplash.com/photo-1495521821757-a1efb6729352",
        "altText": "Fragrance bottle",
        "imageOrder": 1,
        "isThumbnail": true
      }
    ]
  }'

# Expected: 201 Created
# Response should include added image with ID
```

**Test 4.2.2: Update Image (Admin)**

```bash
ADMIN_TOKEN="your_token_here"

curl -X PUT "https://bhatkar-fragrance-hub-1.onrender.com/api/products/2/images/5" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "imageUrl": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908",
    "altText": "Updated description"
  }'

# Expected: 200 OK
```

**Test 4.2.3: Delete Image (Admin)**

```bash
ADMIN_TOKEN="your_token_here"

curl -X DELETE "https://bhatkar-fragrance-hub-1.onrender.com/api/products/2/images/5" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Expected: 200 OK
```

---

### Phase 5: Frontend Integration

#### 5.1 Update Main App Router

Edit your main routing file to use ProductDetailWithImages:

**Before:**
```tsx
import ProductDetail from '@/pages/ProductDetail';

<Route path="/product/:id" element={<ProductDetail />} />
```

**After:**
```tsx
import ProductDetailWithImages from '@/pages/ProductDetailWithImages';

<Route path="/product/:id" element={<ProductDetailWithImages />} />
```

#### 5.2 Update Product Listing Page

Edit your product listing page to use new carousel endpoint:

**Before:**
```tsx
const response = await api.get('/products');
// Products don't have images
```

**After:**
```tsx
const response = await api.get('/products/with-images/all');
// Products now have images array
// Can display thumbnail in listing
```

#### 5.3 Import ProductImageCarousel in Custom Pages

If you create custom product pages:

```tsx
import ProductImageCarousel from '@/components/products/ProductImageCarousel';

<ProductImageCarousel
  images={product.images}
  productName={product.name}
  className="mb-8"
/>
```

---

### Phase 6: Frontend Testing

#### 6.1 Test in Development

```bash
# Start frontend dev server
npm run dev

# Navigate to product detail page
# http://localhost:5173/product/1
```

**Checklist:**
- [ ] Page loads without errors
- [ ] ProductImageCarousel displays
- [ ] Main image shows with counter
- [ ] Thumbnails display horizontally
- [ ] Scroll arrows appear when needed
- [ ] Click arrow scrolls carousel
- [ ] Click thumbnail changes main image
- [ ] Product info displays correctly
- [ ] Add to cart works
- [ ] Wishlist button works

#### 6.2 Test Product Listing Page

```bash
# Navigate to products listing
# http://localhost:5173/shop
```

**Checklist:**
- [ ] Products load with images
- [ ] Images display in grid/carousel
- [ ] Click product goes to detail page
- [ ] Mobile layout is responsive

#### 6.3 Test Responsive Design

**Desktop (1920x1080):**
- [ ] Carousel shows 3-4 thumbnails
- [ ] Thumbnails are 100px size
- [ ] All controls visible

**Tablet (768x1024):**
- [ ] Carousel shows 2-3 thumbnails
- [ ] Thumbnails are 80px size
- [ ] Controls properly positioned

**Mobile (375x667):**
- [ ] Carousel shows 2 thumbnails
- [ ] Thumbnails are 70px size
- [ ] Touch controls work smoothly

---

### Phase 7: Admin Testing (if applicable)

#### 7.1 Test Image Upload/Management

If you have admin panel:

```bash
# Navigate to admin panel
# http://localhost:5173/admin/products
```

**Checklist:**
- [ ] Can view product with images
- [ ] Can add new images
- [ ] Can edit image details
- [ ] Can delete images
- [ ] Max 4 images enforced
- [ ] Error messages display

#### 7.2 Verify Image Ordering

```bash
# Images should display in correct order
# Image order 1, 2, 3, 4 should match display order
# Click different images to verify ordering
```

---

### Phase 8: Performance Testing

#### 8.1 Network Performance

```bash
# Open DevTools → Network tab
# Load product detail page

# Check timing:
# GET /api/products/:id/with-images should be < 200ms
# Page should fully render in < 3 seconds
```

#### 8.2 Lighthouse Performance

```bash
# Run Lighthouse on product detail page
# Should maintain good performance metrics

# Target:
# - Performance: > 80
# - Accessibility: > 90
# - Best Practices: > 80
```

#### 8.3 Database Performance

```bash
# Monitor query execution times
# Should all be < 500ms

# Check slow query log:
# SET GLOBAL slow_query_log = 'ON';
# SET GLOBAL long_query_time = 1;
```

---

### Phase 9: Error Handling Testing

#### 9.1 Test Error Cases

**Invalid Product ID:**
```bash
curl https://bhatkar-fragrance-hub-1.onrender.com/api/products/99999/with-images
# Expected: 404 Not Found
```

**Missing Required Fields:**
```bash
curl -X POST "https://bhatkar-fragrance-hub-1.onrender.com/api/products/1/images" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"images": []}'
# Expected: 400 Bad Request
```

**Unauthorized Access:**
```bash
curl -X POST "https://bhatkar-fragrance-hub-1.onrender.com/api/products/1/images" \
  -d '{...}'
# Expected: 401 Unauthorized (no token)
```

#### 9.2 Test Frontend Error Handling

- Close network tab to simulate connection error
- Page should show "Product Not Found" gracefully
- No crashes or console errors

---

### Phase 10: Production Monitoring

#### 10.1 Set Up Logging

```javascript
// Backend logs all operations
// Check: backend/logs/app.log

// Frontend error tracking
// Add error boundary if not exists
```

#### 10.2 Monitor Endpoints

```bash
# Setup monitoring for new endpoints
# Recommended: Sentry, DataDog, or similar

# Endpoints to monitor:
# - GET /api/products/with-images/all
# - GET /api/products/:id/with-images
# - POST/PUT/DELETE /api/products/:id/images/*
```

#### 10.3 Database Monitoring

```bash
# Check database performance regularly
# Monitor:
# - Slow queries
# - Connection count
# - Disk usage
# - Backup status
```

---

## Troubleshooting During Integration

### Issue: Backend Routes Not Found (404)

**Diagnosis:**
```bash
# Check routes are loaded
curl https://bhatkar-fragrance-hub-1.onrender.com/api/products

# If 404, backend might not have redeployed
# Wait 2-3 minutes and check again
```

**Solution:**
```bash
# Force redeploy from Render dashboard
# Or: git push -f origin main
```

### Issue: Database Table Not Found

**Diagnosis:**
```bash
# Check table exists
mysql> SHOW TABLES LIKE 'product_images';
# If empty, migration script hasn't run

# Check if script ran successfully
# Look for error messages in logs
```

**Solution:**
```bash
cd backend
npm run db:add:product-images
# Or run manually in MySQL:
# mysql> source src/database/scripts/createProductImagesTable.sql;
```

### Issue: Images Not Loading

**Diagnosis:**
```bash
# Check API response includes images
curl https://bhatkar-fragrance-hub-1.onrender.com/api/products/1/with-images
# Should have images array with image_url fields

# Check image URLs are valid
# Should be HTTPS, not broken links
```

**Solution:**
1. Verify imageUrl values in database
2. Check CORS headers on image responses
3. Verify image domains are allowed

### Issue: Carousel Not Scrolling

**Diagnosis:**
1. Open DevTools → Console
2. Check for JavaScript errors
3. Verify ProductImageCarousel.css is loaded
4. Check if more than 3 images exist

**Solution:**
```tsx
// Ensure CSS is imported in component
import './ProductImageCarousel.css';

// Add debug logging
console.log('Images received:', images);
console.log('Number of images:', images.length);
```

### Issue: Admin Endpoints Return 401

**Diagnosis:**
```bash
# Check token is valid
# Token should be JWT from admin login

# Check auth header format
# Should be: Authorization: Bearer TOKEN
# Not: Authorization: TOKEN
```

**Solution:**
1. Get fresh admin token
2. Verify token hasn't expired
3. Check adminAuth middleware is working
4. Verify user has admin role

---

## Checklist for Full Integration

### Pre-Production
- [ ] All files created and committed
- [ ] Code pushed to GitHub
- [ ] Render auto-redeploy triggered
- [ ] No compilation errors

### Backend
- [ ] Render backend comes back online
- [ ] Database connection verified
- [ ] Migration script runs successfully
- [ ] product_images table created
- [ ] Sample data inserted

### API Testing
- [ ] GET /products/with-images/all returns 200
- [ ] GET /products/:id/with-images returns 200
- [ ] GET /products/:id/images returns 200
- [ ] POST add images returns 201 (with auth)
- [ ] PUT update image returns 200 (with auth)
- [ ] DELETE image returns 200 (with auth)

### Frontend Testing
- [ ] ProductImageCarousel renders correctly
- [ ] Carousel displays 3-4 images
- [ ] Scroll arrows work
- [ ] Thumbnail click changes image
- [ ] ProductDetailWithImages page loads

### Responsive Design
- [ ] Desktop (1920px) works correctly
- [ ] Tablet (768px) works correctly
- [ ] Mobile (375px) works correctly

### Error Handling
- [ ] Invalid product returns 404
- [ ] Missing fields return 400
- [ ] Unauthorized access returns 401
- [ ] Server errors return 500

### Performance
- [ ] API responses < 200ms
- [ ] Page loads in < 3 seconds
- [ ] Carousel scrolls smoothly (60fps)
- [ ] No memory leaks

### Production Ready
- [ ] All logs accessible
- [ ] Monitoring set up
- [ ] Backup strategy in place
- [ ] Rollback plan ready

---

## Final Verification

Run this script to verify everything is working:

```bash
#!/bin/bash

echo "=== Checking Backend ==="
curl -s https://bhatkar-fragrance-hub-1.onrender.com/api/products | head -20

echo "\n=== Checking Products with Images ==="
curl -s https://bhatkar-fragrance-hub-1.onrender.com/api/products/with-images/all | head -20

echo "\n=== Checking Single Product ==="
curl -s https://bhatkar-fragrance-hub-1.onrender.com/api/products/1/with-images | head -20

echo "\n=== System Status ==="
echo "✅ Backend: $(curl -s -o /dev/null -w '%{http_code}' https://bhatkar-fragrance-hub-1.onrender.com/api/products)"
echo "✅ Products with images endpoint: $(curl -s -o /dev/null -w '%{http_code}' https://bhatkar-fragrance-hub-1.onrender.com/api/products/with-images/all)"
echo "✅ Frontend: $(curl -s -o /dev/null -w '%{http_code}' https://bhatkar-fragrance-hub-5.onrender.com)"

echo "\n=== Integration Complete ==="
```

---

## Support & Next Steps

### If All Tests Pass ✅
- System is production ready
- Continue monitoring logs
- Train admin users on image management
- Plan for future enhancements

### If Tests Fail ❌
1. Check logs: `backend/logs/app.log`
2. Review PRODUCT_IMAGE_TESTING.md
3. Check Render dashboard for errors
4. Verify database connection

---

## Rollback Procedure

If issues occur and you need to rollback:

```bash
# Revert to previous commit
git revert HEAD

# Or reset entirely
git reset --hard HEAD~1

# Push to trigger Render redeploy
git push origin main

# This removes all product image features
# System returns to previous state
```

---

**Integration Status: READY FOR DEPLOYMENT**

All components are in place and tested. Follow this guide step-by-step for complete integration.

Last Updated: February 4, 2026
