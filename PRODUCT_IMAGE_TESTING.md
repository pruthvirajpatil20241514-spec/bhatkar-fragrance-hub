# Product Image System - Testing Guide

## Step 1: Initialize Database

### Run the migration script in backend directory:

```bash
cd backend
npm run db:add:product-images
```

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
Product ID: 3, Images: 4
...

Database initialization completed successfully!
```

---

## Step 2: Test Public API Endpoints

### Test 2.1: Get All Products with Images

**Command (using curl):**
```bash
curl -X GET "http://localhost:5000/api/products/with-images/all" \
  -H "Content-Type: application/json"
```

**Expected Response:** Status 200
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Product Name",
      "brand": "Brand Name",
      "price": 89.99,
      "category": "Category",
      "concentration": "EDP",
      "description": "...",
      "stock": 15,
      "images": [
        {
          "id": 1,
          "image_url": "https://...",
          "alt_text": "...",
          "image_order": 1,
          "is_thumbnail": true
        }
      ]
    }
  ]
}
```

### Test 2.2: Get Single Product with Images

**Command:**
```bash
curl -X GET "http://localhost:5000/api/products/1/with-images" \
  -H "Content-Type: application/json"
```

**Expected Response:** Status 200 with single product object + images array

### Test 2.3: Get Images Only

**Command:**
```bash
curl -X GET "http://localhost:5000/api/products/1/images" \
  -H "Content-Type: application/json"
```

**Expected Response:** Status 200 with images array only

---

## Step 3: Test Admin API Endpoints

### Setup: Get Admin Token

1. Register/Login as admin user
2. Save the token from response
3. Use in Authorization header

**Example Login:**
```bash
curl -X POST "http://localhost:5000/api/auth/admin/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin_password"
  }'
```

### Test 3.1: Add Images to Product

**Command:**
```bash
curl -X POST "http://localhost:5000/api/products/1/images" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "images": [
      {
        "imageUrl": "https://images.unsplash.com/photo-1495521821757-a1efb6729352",
        "altText": "New perfume image 1",
        "imageOrder": 3,
        "isThumbnail": false
      },
      {
        "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        "altText": "New perfume image 2",
        "imageOrder": 4,
        "isThumbnail": false
      }
    ]
  }'
```

**Expected Response:** Status 201 with added images

**Validation Checks:**
- ✅ Exactly 1-4 images per product
- ✅ imageUrl is required
- ✅ altText is optional but recommended
- ✅ imageOrder should be 1-4
- ✅ At least one isThumbnail should be true

### Test 3.2: Update Product Image

**Command:**
```bash
curl -X PUT "http://localhost:5000/api/products/1/images/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "imageUrl": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908",
    "altText": "Updated image description",
    "imageOrder": 1
  }'
```

**Expected Response:** Status 200 with updated image

### Test 3.3: Delete Single Image

**Command:**
```bash
curl -X DELETE "http://localhost:5000/api/products/1/images/2" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response:** Status 200 with success message

### Test 3.4: Delete All Images for Product

**Command:**
```bash
curl -X DELETE "http://localhost:5000/api/products/1/images" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Expected Response:** Status 200 with count of deleted images

---

## Step 4: Test Frontend Components

### Test 4.1: ProductImageCarousel Component

In browser console or React DevTools:

```tsx
// The carousel should:
// 1. Display main image with counter (e.g., "1 / 4")
// 2. Show 3-4 thumbnail images horizontally
// 3. Have left/right arrow buttons
// 4. Allow clicking thumbnails to change main image
// 5. Smooth scroll when clicking arrows
```

**Manual Testing Checklist:**
- [ ] Main image displays correctly
- [ ] Image counter shows correct count
- [ ] Thumbnails are visible and clickable
- [ ] Left arrow appears when scrollable left
- [ ] Right arrow appears when scrollable right
- [ ] Clicking arrow scrolls carousel smoothly
- [ ] Clicking thumbnail changes main image
- [ ] Alt text displays below carousel
- [ ] Component is responsive on mobile

### Test 4.2: ProductDetailWithImages Page

**URL:** `http://localhost:5173/product/1`

**Manual Testing Checklist:**
- [ ] Page loads without errors
- [ ] ProductImageCarousel is displayed
- [ ] Product information displays correctly
- [ ] Price shows with correct format
- [ ] Stock status displays
- [ ] Quantity selector works
- [ ] Add to cart button is functional
- [ ] Wishlist button toggles
- [ ] Responsive on tablet/mobile

---

## Step 5: Error Testing

### Test 5.1: Invalid Product ID

```bash
curl -X GET "http://localhost:5000/api/products/999/with-images"
```

**Expected:** Status 404, "Product not found"

### Test 5.2: Missing Required Fields

```bash
curl -X POST "http://localhost:5000/api/products/1/images" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "images": [{}]
  }'
```

**Expected:** Status 400, "imageUrl is required"

### Test 5.3: Too Many Images

```bash
curl -X POST "http://localhost:5000/api/products/1/images" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "images": [
      {"imageUrl": "url1", "imageOrder": 1},
      {"imageUrl": "url2", "imageOrder": 2},
      {"imageUrl": "url3", "imageOrder": 3},
      {"imageUrl": "url4", "imageOrder": 4},
      {"imageUrl": "url5", "imageOrder": 5}
    ]
  }'
```

**Expected:** Status 400, "Maximum 4 images per product"

### Test 5.4: Unauthorized Access

```bash
curl -X POST "http://localhost:5000/api/products/1/images" \
  -H "Content-Type: application/json" \
  -d '{"images": [...]}'
```

**Expected:** Status 401, "Unauthorized access"

---

## Step 6: Performance Testing

### Check Query Performance

1. Open browser DevTools → Network tab
2. Navigate to product listing page
3. Observe API response times:
   - GET /api/products/with-images/all should complete in < 200ms
   - GET /api/products/:id/with-images should complete in < 100ms

### Check Database Indexes

In MySQL console:
```sql
SHOW INDEXES FROM product_images;
```

**Expected:** Two indexes:
- `idx_product_id` on product_id column
- `idx_product_id_image_order` on (product_id, image_order)

---

## Step 7: Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

**Carousel should work smoothly** on all browsers with:
- Smooth scrolling
- Proper arrow visibility
- Responsive sizing

---

## Troubleshooting

### Issue: Database table not created

**Solution:**
```bash
cd backend
npm install  # Ensure all dependencies installed
npm run db:add:product-images  # Run migration
```

### Issue: Images not loading

**Checks:**
1. Verify imageUrl is valid HTTPS
2. Check database has image records
3. Verify API returns images array
4. Check browser console for CORS errors

### Issue: Carousel not scrolling

**Checks:**
1. Verify multiple images exist (need > 3 images)
2. Check CSS is loading (ProductImageCarousel.css)
3. Verify images array is passed to component
4. Check browser console for JavaScript errors

### Issue: Admin endpoints return 401

**Checks:**
1. Token is valid and not expired
2. User has admin role
3. Authorization header format is correct: `Bearer TOKEN`
4. CORS headers are present

---

## Sample cURL Commands File

Save as `test-api.sh`:

```bash
#!/bin/bash

# Public endpoints (no auth needed)
GET_ALL_PRODUCTS='curl -X GET "http://localhost:5000/api/products/with-images/all"'

GET_ONE_PRODUCT='curl -X GET "http://localhost:5000/api/products/1/with-images"'

GET_IMAGES='curl -X GET "http://localhost:5000/api/products/1/images"'

# Admin endpoints (require token)
ADMIN_TOKEN="your_admin_token_here"

ADD_IMAGES='curl -X POST "http://localhost:5000/api/products/1/images" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '"'"'{
    "images": [
      {
        "imageUrl": "https://images.unsplash.com/photo-1495521821757-a1efb6729352",
        "altText": "Image 1",
        "imageOrder": 1,
        "isThumbnail": true
      }
    ]
  }'"'"''

echo "Run these commands to test the API:"
echo "1. $GET_ALL_PRODUCTS"
echo "2. $GET_ONE_PRODUCT"
echo "3. $GET_IMAGES"
echo "4. $ADD_IMAGES"
```

---

## Quick Verification Checklist

Before deployment:

- [ ] Database table created successfully
- [ ] All public endpoints return 200
- [ ] All admin endpoints require auth
- [ ] Images display in carousel
- [ ] Carousel is responsive
- [ ] No console errors
- [ ] No network errors
- [ ] Product detail page loads
- [ ] Add to cart works
- [ ] Wishlist button works

---

## Support

If tests fail:
1. Check backend logs: `tail -f backend/logs/app.log`
2. Check database connection in backend console
3. Verify Railway database credentials
4. Ensure Render backend is running
5. Check frontend console for errors (F12 → Console tab)
