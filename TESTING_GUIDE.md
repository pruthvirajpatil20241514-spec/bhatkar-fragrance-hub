# Quick Start Testing Guide

## 🎯 Test Scenario 1: Create Product with Tags and Reviews

### Step 1: Navigate to Admin Products
1. Go to `/admin/products`
2. Click "Add Product"

### Step 2: Fill Basic Info
- Name: "Elegant Rose Perfume"
- Brand: "Parisian House"
- Price: ₹4500
- Category: Women
- Concentration: EDP
- Stock: 50

### Step 3: Add Tags
1. ✅ Check "⭐ Best Seller" checkbox
2. ✅ Check "💎 Luxury Product" checkbox

### Step 4: Add Images
1. Click "Upload Images" section
2. Upload 2 images:
   - Image 1: Full product view
   - Image 2: Close-up
3. Set first image as thumbnail

### Step 5: Add Initial Reviews
1. Expand "Initial Reviews" section
2. **Review #1**:
   - Name: Priya Sharma
   - Rating: 5 stars (click stars)
   - Text: "Absolutely fantastic fragrance! Long-lasting and elegant."
   - Click "Add Review"

3. **Review #2**:
   - Name: Rajesh Kumar
   - Rating: 4 stars
   - Text: "Great quality, a bit pricey but worth every penny."
   - Click "Add Review"

### Step 6: Save Product
- Click "Add Product" button
- Verify success toast

---

## 🎯 Test Scenario 2: Add ML Variants

### Step 1: Edit Product
1. Go to `/admin/products`
2. Find "Elegant Rose Perfume"
3. Click "Edit" button

### Step 2: Add Variants
**Variant 1: 50ml**:
- Name: 50ml
- Value: 50
- Unit: ml
- Price: ₹2499
- Stock: 30
- Click "Add Variant"

**Variant 2: 100ml**:
- Name: 100ml
- Value: 100
- Unit: ml
- Price: ₹3999
- Stock: 40
- Click "Add Variant"

**Variant 3: 200ml**:
- Name: 200ml
- Value: 200
- Unit: ml
- Price: ₹6999
- Stock: 20
- Click "Add Variant"

### Step 3: Upload Variant Images
1. For each variant:
   - Click variant Upload button
   - Select 2-3 images specific to that size
   - Click "Upload to Variant"
   - Wait for success toast

2. Images should now be linked to each variant

### Step 4: Save
- Click "Update Product"
- Verify success

---

## 🎯 Test Scenario 3: View on Frontend

### Step 1: Navigate to Product
1. Go to `/shop`
2. Search for "Elegant Rose Perfume"
3. Click product card
4. Verify:
   - ✅ ⭐ Best Seller badge visible (gold)
   - ✅ 💎 Luxury badge visible (purple)
   - ✅ Both badges top-left, stacked

### Step 2: Product Detail Page
1. ✅ Main image centered and sized properly
2. ✅ Thumbnail gallery below with horizontal scroll
3. ✅ Click thumbnails → main image updates
4. ✅ No page reload
5. ✅ Image spacing looks professional

### Step 3: Select ML Variant
1. ✅ Dropdown/buttons show: 50ml, 100ml, 200ml
2. **Click "100ml"**:
   - ✅ Price updates to ₹3999
   - ✅ Image gallery switches to 100ml images
   - ✅ Quantity resets to 1
   - ✅ Stock shows available units
3. **Click "50ml"**:
   - ✅ Price updates to ₹2499
   - ✅ Images switch again
   - ✅ Quantity still 1
4. **Change quantity to 2**:
   - ✅ Total shows: ₹4998 (2 × ₹2499)

### Step 4: View Reviews
1. ✅ Scroll to "Customer Reviews" section
2. ✅ Shows average rating (4.5/5 or similar)
3. ✅ Shows total count "2 reviews"
4. ✅ Review cards visible with:
   - Reviewer name
   - Star rating (visual)
   - Review text
   - Date posted

**Review 1**:
- "Priya Sharma"
- ⭐⭐⭐⭐⭐
- "Absolutely fantastic fragrance! Long-lasting and elegant."

**Review 2**:
- "Rajesh Kumar"
- ⭐⭐⭐⭐
- "Great quality, a bit pricey but worth every penny."

---

## 🎯 Test Scenario 4: Product Card Grid

### Step 1: View Product Cards
1. Go to `/shop`
2. Find "Elegant Rose Perfume" card
3. ✅ Verify badges visible (top-left, stacked)
4. ✅ ⭐ Best Seller (gold background)
5. ✅ 💎 Luxury (purple background)
6. ✅ Text readable and professional

---

## 🔍 Validation Checklist

### Database ✅
- [ ] `is_best_seller` column in products table
- [ ] `is_luxury_product` column in products table
- [ ] Product has both flags set to TRUE
- [ ] `reviews` table has 2 reviews linked to product
- [ ] `product_variants` table has 3 variants
- [ ] `variant_images` table has images per variant

### Admin UI ✅
- [ ] Best Seller checkbox visible and toggleable
- [ ] Luxury Product checkbox visible and toggleable
- [ ] Reviews section visible and functional
- [ ] Review form has name, rating, text fields
- [ ] Star rating selector works
- [ ] Add/remove reviews works
- [ ] Review count shows updated
- [ ] Variant images upload works
- [ ] No validation errors

### Frontend UI ✅
- [ ] Product cards show badges
- [ ] Badges are top-left, stacked
- [ ] Best Seller badge is gold (⭐)
- [ ] Luxury badge is purple (💎)
- [ ] Product detail image centered
- [ ] Image gallery responsive
- [ ] Thumbnails scroll horizontally
- [ ] Click thumbnail updates main
- [ ] ML variant selector visible
- [ ] Click variant updates price
- [ ] Click variant updates images
- [ ] Click variant resets quantity
- [ ] Reviews section visible
- [ ] Average rating shows
- [ ] Review count shows
- [ ] Reviews display correctly

### API ✅
- [ ] POST /products - creates with tags
- [ ] PUT /products/:id - updates tags
- [ ] POST /variants - creates variant
- [ ] POST /variants/:id/images - uploads images
- [ ] POST /reviews - creates reviews
- [ ] GET /reviews/product/:id - fetches reviews
- [ ] GET /reviews/stats/:id - fetches stats

### Error Handling ✅
- [ ] No console errors
- [ ] No 500 errors on upload
- [ ] Validation errors show toasts
- [ ] Success messages show
- [ ] Loading states visible

---

## 🚨 Troubleshooting

### Images not showing?
1. Check Railway storage link
2. Verify image_url in database
3. Check VITE_API_BASE_URL setting

### Variants not switching?
1. Verify variant API response
2. Check selectedVariant state
3. Ensure variantPrice calculated correctly

### Reviews not showing?
1. Check reviews table data
2. Verify product_id FK
3. Check /reviews/stats endpoint response

### Badges not displaying?
1. Verify is_best_seller = 1 in DB
2. Check is_luxury_product = 1 in DB
3. Verify ProductCard component logic

---

## 📊 Expected Data Structure

### Product Table
```
id | name | brand | price | is_best_seller | is_luxury_product | stock
1  | Elegant Rose Perfume | Parisian House | 4500 | 1 | 1 | 50
```

### Product Variants Table
```
id | product_id | variant_name | variant_value | variant_unit | price | stock
1  | 1 | 50ml | 50 | ml | 2499 | 30
2  | 1 | 100ml | 100 | ml | 3999 | 40
3  | 1 | 200ml | 200 | ml | 6999 | 20
```

### Reviews Table
```
id | product_id | reviewer_name | rating | review_text | is_active | is_approved
1  | 1 | Priya Sharma | 5 | Absolutely fantastic... | 1 | 1
2  | 1 | Rajesh Kumar | 4 | Great quality... | 1 | 1
```

---

## ✅ Launch Checklist

- [ ] Backend migrations run successfully
- [ ] No database errors
- [ ] Frontend compiles with no TS errors
- [ ] Admin can create products
- [ ] Admin can add tags
- [ ] Admin can add reviews
- [ ] Admin can add variants
- [ ] Admin can upload variant images
- [ ] Frontend displays badges
- [ ] Frontend displays reviews
- [ ] ML switching works
- [ ] Image gallery works
- [ ] No console errors
- [ ] No network errors
- [ ] Ready for production

---

**Good luck with testing!** 🎉
