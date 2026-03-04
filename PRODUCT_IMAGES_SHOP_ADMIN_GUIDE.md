# Product Images in Shop & Admin - Complete Integration Guide

## Overview

The product image system is now fully integrated across the entire application:

1. **Admin Panel** - View product images in the products table
2. **Shop Page** - Display product images in product cards
3. **Product Detail** - Show image carousel with thumbnails
4. **Database** - Store multiple images per product with thumbnail management

---

## Features

### Admin Panel (Manage Contents)

✅ **Product Images in Table**
- Thumbnail image displayed for each product
- Shows primary (thumbnail) image
- 12px × 16px image preview in table
- Click-to-edit with full image management

✅ **Image Management Dialog**
- Upload images via drag-and-drop
- Upload images via URL input
- Add up to 4 images per product
- Set thumbnail (primary image)
- Delete images
- See preview before saving

### Shop Page (Customer View)

✅ **Product Cards with Images**
- Display product thumbnail from database
- Show product information (price, brand, category)
- Display stock status for database products
- Add to cart functionality
- Wishlist toggle
- Responsive grid layout

✅ **Smart Product Display**
- Uses database products when available
- Falls back to static products if API unavailable
- Handles missing images gracefully
- Responsive design for mobile/tablet/desktop

### Product Detail Page

✅ **Image Carousel**
- Display all product images
- Smooth scrolling between images
- Thumbnail navigation
- Set thumbnail as primary
- Responsive design

---

## Architecture

### Data Flow

```
Database (MySQL)
    ↓
Backend API (/products/with-images/all)
    ↓
Shop Component (fetches via useEffect)
    ↓
ProductCard Component (displays image)
    ↓
Customer View
```

### Component Structure

```
App
├── Shop (fetches db products)
│   └── ProductCard (displays with image)
│       ├── Image from database
│       └── Actions (add to cart, wishlist)
│
└── Admin/Products (manages images)
    ├── Products Table (shows thumbnails)
    └── Edit Dialog (upload/manage images)
```

---

## Database Schema

### product_images Table

```sql
CREATE TABLE product_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  image_order INT DEFAULT 1,
  is_thumbnail BOOLEAN DEFAULT 0,
  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id),
  INDEX idx_product_id_image_order (product_id, image_order)
);
```

### Sample Data

```
Product ID 2 - Dior Sauvage
├── Image 1: /uploads/images/1707101234-product-front.jpg (is_thumbnail: true)
├── Image 2: /uploads/images/1707101235-product-side.jpg
├── Image 3: /uploads/images/1707101236-product-detail.jpg
└── Image 4: /uploads/images/1707101237-product-box.jpg
```

---

## API Endpoints

### Fetch Products with Images

**Endpoint**: `GET /api/products/with-images/all`  
**Auth**: Public (no authentication required)  
**Response**:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Perfume Name",
      "brand": "Brand Name",
      "price": 5000,
      "category": "Men",
      "concentration": "EDP",
      "description": "Description...",
      "stock": 10,
      "images": [
        {
          "id": 1,
          "image_url": "/uploads/images/1707101234-product.jpg",
          "alt_text": "Product front view",
          "image_order": 1,
          "is_thumbnail": true
        },
        {
          "id": 2,
          "image_url": "/uploads/images/1707101235-side.jpg",
          "alt_text": "Product side view",
          "image_order": 2,
          "is_thumbnail": false
        }
      ]
    }
  ]
}
```

### Upload Image File

**Endpoint**: `POST /api/upload-image`  
**Auth**: Required (Admin only)  
**Request Body**:
```json
{
  "file": "data:image/jpeg;base64,...",
  "altText": "Product description"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Image uploaded successfully",
  "imageUrl": "/uploads/images/1707101234-product.jpg"
}
```

---

## Frontend Implementation

### Shop Component

```typescript
// Fetch products with images
useEffect(() => {
  const fetchProducts = async () => {
    try {
      const response = await api.get('/products/with-images/all');
      setDbProducts(response.data.data || []);
    } catch (error) {
      // Fall back to static products
      setDbProducts([]);
    }
  };
  fetchProducts();
}, []);
```

### ProductCard Component

```typescript
// Handle both static and database products
const isStatic = isStaticProduct(product);
const imageUrl = isStatic 
  ? product.images[0] 
  : getDatabaseProductImage(product);

// Display image with fallback
<img
  src={imageUrl}
  alt={productName}
  onError={(e) => {
    e.target.src = '/images/placeholder.jpg';
  }}
/>
```

### Admin Products Table

```typescript
// Get thumbnail image
const productImages = product.images || [];
const thumbnailImage = productImages.find(
  (img) => img.is_thumbnail
) || productImages[0];
const imageUrl = thumbnailImage?.image_url || '/images/placeholder.jpg';

// Display in table
<img 
  src={imageUrl} 
  alt={product.name}
  className="w-full h-full object-cover"
/>
```

---

## User Workflows

### Admin: Upload Product Images

```
1. Login as Admin
   ↓
2. Navigate to Admin → Manage Contents → Products
   ↓
3. Click "Add Product" or "Edit Product"
   ↓
4. Fill product details
   ↓
5. Scroll to "Product Images" section
   ↓
6. Choose upload method:
   a) Drag & Drop File
      - Select image file from computer
      - See preview
   b) Paste URL
      - Enter HTTPS image URL
   ↓
7. Add Alt Text
   ↓
8. Click "Upload Image" or "Add Image"
   ↓
9. Image appears in list
   ↓
10. Set thumbnail (primary image)
    ↓
11. Add up to 4 images total
    ↓
12. Click "Add Product" or "Update Product"
    ↓
13. Images saved to database
    ↓
14. See thumbnail in products table
```

### Customer: View Product Images

```
1. Visit Shop page
   ↓
2. See product cards with images
   ↓
3. Click on product card
   ↓
4. View product detail page
   ↓
5. See image carousel
   ↓
6. Click thumbnails to view different angles
   ↓
7. Add to cart
```

---

## Image Display Locations

### 1. Admin Products Table

**Location**: `/admin/products`  
**Image Size**: 48px × 64px (3:4 aspect ratio)  
**Position**: First column (before product name)

```
┌─────────────┬──────────────┬──────────┐
│ Image       │ Name         │ Brand    │
├─────────────┼──────────────┼──────────┤
│ [Thumbnail] │ Dior Sauvage │ Dior     │
│ 48×64       │              │          │
└─────────────┴──────────────┴──────────┘
```

### 2. Shop Product Card

**Location**: `/shop`  
**Image Size**: Full width, 3:4 aspect ratio  
**Features**:
- Hover zoom effect
- Wishlist button overlay
- Add to cart button
- Stock status badge

```
┌────────────────────────┐
│   [Product Image]      │ ← Full width
│   ████████████████     │
│   ████████████████     │ ← 3:4 aspect
│   ████████████████     │
│   ████████████████     │
│   [Wishlist] [Add >]   │
├────────────────────────┤
│ Name                   │
│ Brand / Category       │
│ Price                  │
└────────────────────────┘
```

### 3. Product Detail Page

**Location**: `/product/:id`  
**Image Size**: Large carousel, responsive  
**Features**:
- Main image display
- Thumbnail carousel below
- Smooth zoom on hover
- Click to change main image

```
┌──────────────────────────────────────┐
│                                      │
│    [Large Product Image]             │
│    ██████████████████████████████   │
│    ██████████████████████████████   │
│    ██████████████████████████████   │
│                                      │
├──────────────────────────────────────┤
│ [Thumb 1] [Thumb 2] [Thumb 3] [T4]  │
│  ████      ████      ████      ████  │
└──────────────────────────────────────┘
```

---

## Image Management

### Upload Methods

#### 1. Drag and Drop
```
✓ Drop image files directly
✓ Multiple formats supported (JPG, PNG, WebP, GIF)
✓ Max 5MB file size
✓ See preview before upload
✓ Optional alt text for accessibility
```

#### 2. URL Input
```
✓ Paste HTTPS image URLs
✓ External CDN support (Unsplash, Cloudinary, etc.)
✓ No file size limit
✓ Optional alt text
```

### Image Settings

#### Thumbnail (Primary Image)
```
- Only ONE image marked as thumbnail per product
- Shows in product table
- Shows in shop product card
- Customer sees this first in carousel
```

#### Image Order
```
- Automatically assigned (1-4)
- Displayed in carousel in order
- Can reorder by deleting and re-uploading
```

#### Alt Text
```
- Required field (from user input)
- Used for accessibility
- Helps with SEO
- Shows in image hover
```

---

## Error Handling

### Missing Images
```
Scenario: Product has no images
Display: /images/placeholder.jpg (fallback image)
```

### Invalid URL
```
Scenario: Image URL broken or inaccessible
Display: /images/placeholder.jpg (fallback image)
Error: Logged to console
```

### Upload Failed
```
Scenario: File upload failed
Display: Toast error message
Action: User can retry upload
```

### API Unavailable
```
Scenario: /products/with-images/all endpoint fails
Display: Static products as fallback
Behavior: Shop still works with cached data
```

---

## Performance Optimization

### Image Loading
```
✓ Lazy loading in product cards
✓ Thumbnail images (smaller file size)
✓ Responsive images for mobile
✓ WebP format support
✓ CDN-ready URLs
```

### Database Queries
```
✓ JOIN with product_images table
✓ Index on product_id
✓ Index on product_id + image_order
✓ Filtered by is_thumbnail for quick lookup
```

### Caching
```
✓ Browser caching for images
✓ API response caching (if configured)
✓ Static fallback when API unavailable
```

---

## Mobile Responsiveness

### Product Card Grid

```
Mobile (< 640px):  1 column
Tablet (640-1024px): 2 columns
Desktop (> 1024px): 3 columns
```

### Image Display
```
Mobile: Full width image, responsive
Tablet: Larger preview, touch-friendly
Desktop: Hover effects enabled
```

### Touch Interactions
```
✓ Touch to expand product card
✓ Swipe to navigate carousel
✓ Tap to add to cart
✓ Long-press for wishlist
```

---

## Supported Image Formats

```
Format          MIME Type          Support
────────────────────────────────────────────
JPG/JPEG        image/jpeg         ✅ Full
PNG             image/png          ✅ Full
WebP            image/webp         ✅ Full
GIF             image/gif          ✅ Full
BMP             image/bmp          ❌ Not supported
TIFF            image/tiff         ❌ Not supported
SVG             image/svg+xml      ❌ Not supported
```

---

## File Storage

### Local Storage Structure
```
backend/
└── uploads/
    └── images/
        ├── 1707101234-product-front.jpg
        ├── 1707101235-product-side.jpg
        ├── 1707101236-product-detail.jpg
        └── 1707101237-product-box.jpg
```

### URL Format
```
Local: /uploads/images/1707101234-product.jpg
Full: https://api.example.com/uploads/images/1707101234-product.jpg
```

### Future Enhancements
```
- [ ] S3/CloudStorage integration
- [ ] CDN acceleration
- [ ] Image optimization/compression
- [ ] WebP conversion
- [ ] Cropping tool
```

---

## Testing Checklist

### Admin Upload
- [ ] Upload image via drag & drop
- [ ] Upload image via file browser
- [ ] Upload image via URL
- [ ] Add alt text
- [ ] See preview before upload
- [ ] File size validation works
- [ ] Format validation works
- [ ] Max 4 images enforced
- [ ] Thumbnail selection works
- [ ] Delete image works
- [ ] Images persist after save

### Shop Display
- [ ] Images load in product cards
- [ ] Correct thumbnail displayed
- [ ] Fallback image shows if broken
- [ ] Responsive layout works
- [ ] Add to cart works
- [ ] Wishlist works
- [ ] Product detail navigation works

### Product Detail
- [ ] Carousel displays all images
- [ ] Thumbnail navigation works
- [ ] Main image changes on click
- [ ] Zoom on hover works
- [ ] Responsive on mobile
- [ ] Images load quickly

### Admin Table
- [ ] Image column visible
- [ ] Thumbnails display correctly
- [ ] Click to edit works
- [ ] Images update on save

---

## Troubleshooting

### Images Not Showing

**Check**:
1. Upload directory exists: `backend/uploads/images/`
2. File permissions are set correctly
3. API endpoint returning images: `GET /products/with-images/all`
4. Image URLs are accessible

**Solution**:
```bash
# Create directory if missing
mkdir -p backend/uploads/images

# Check file permissions
ls -la backend/uploads/

# Restart backend server
npm start
```

### Image Upload Fails

**Check**:
1. File size < 5MB
2. Correct file format (JPG, PNG, WebP, GIF)
3. Alt text provided
4. Server running and accessible
5. JWT token valid (admin auth)

**Solution**:
```
1. Compress image (use TinyPNG)
2. Convert to supported format
3. Add descriptive alt text
4. Log out and log back in
5. Try in incognito mode
```

### Wrong Image Displays

**Check**:
1. Thumbnail flag set correctly
2. Image order correct
3. Database synchronized

**Solution**:
```
1. Set correct thumbnail in edit dialog
2. Save product
3. Refresh page
4. Check database directly
```

---

## Best Practices

### Image Uploading
```
1. Use consistent dimensions (800x1000px)
2. Keep file size under 500KB
3. Use descriptive alt text
4. Upload highest quality image first (as thumbnail)
5. Name files descriptively
```

### Image Organization
```
1. Order images: front → side → detail → box
2. Upload similar photos together
3. Keep alt text consistent
4. Update images regularly
```

### Customer Experience
```
1. Show product from multiple angles
2. Include lifestyle/context photos
3. Show packaging/unboxing
4. Ensure good lighting in photos
5. Maintain consistent style/background
```

---

## Future Enhancements

```
Phase 2:
- [ ] Bulk image upload
- [ ] Image cropping tool
- [ ] CloudFront CDN integration
- [ ] Image optimization/compression
- [ ] Automatic WebP conversion
- [ ] Image gallery lightbox

Phase 3:
- [ ] AR product preview
- [ ] 360-degree image rotation
- [ ] Video product tour
- [ ] User-submitted photos
- [ ] Image comparison slider
```

---

**Last Updated**: February 4, 2026  
**Status**: ✅ Production Ready  
**Version**: 2.0 (Database Integration Complete)
