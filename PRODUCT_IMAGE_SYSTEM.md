# Product Image System Documentation

## Database Schema

### Tables

#### `product_images` Table
```sql
CREATE TABLE product_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  image_order INT NOT NULL DEFAULT 0,
  is_thumbnail BOOLEAN DEFAULT FALSE,
  created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id),
  INDEX idx_image_order (product_id, image_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Fields:**
- `id`: Unique image identifier
- `product_id`: Foreign key to products table
- `image_url`: Full URL to the image
- `alt_text`: Alt text for accessibility
- `image_order`: Display order (1-4)
- `is_thumbnail`: Boolean flag for thumbnail image
- `created_on`: Image creation timestamp
- `updated_on`: Last update timestamp

---

## Backend API Endpoints

### Public Endpoints (No Authentication Required)

#### 1. Get Product with Images
```
GET /api/products/:id/with-images
```

**Description:** Fetch a single product with all its images and details

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Dior Sauvage",
    "brand": "Christian Dior",
    "price": 89.99,
    "category": "Men",
    "concentration": "EDP",
    "description": "A fresh, spicy fragrance...",
    "stock": 15,
    "created_on": "2026-02-01T10:00:00.000Z",
    "images": [
      {
        "id": 1,
        "image_url": "https://example.com/image1.jpg",
        "alt_text": "Product front view",
        "image_order": 1,
        "is_thumbnail": true
      },
      {
        "id": 2,
        "image_url": "https://example.com/image2.jpg",
        "alt_text": "Product side view",
        "image_order": 2,
        "is_thumbnail": false
      }
    ]
  }
}
```

#### 2. Get All Products with Images
```
GET /api/products/with-images/all
```

**Description:** Fetch all products with their images (for product listing)

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Dior Sauvage",
      "brand": "Christian Dior",
      "price": 89.99,
      "category": "Men",
      "concentration": "EDP",
      "description": "...",
      "stock": 15,
      "created_on": "2026-02-01T10:00:00.000Z",
      "images": [
        {
          "id": 1,
          "image_url": "https://example.com/image1.jpg",
          "alt_text": "Product front view",
          "image_order": 1,
          "is_thumbnail": true
        }
      ]
    }
  ],
  "total": 10
}
```

#### 3. Get Product Images Only
```
GET /api/products/:productId/images
```

**Description:** Get only images for a specific product (without product details)

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "product_id": 1,
      "image_url": "https://example.com/image1.jpg",
      "alt_text": "Product Image 1",
      "image_order": 1,
      "is_thumbnail": true,
      "created_on": "2026-02-01T10:00:00.000Z"
    }
  ],
  "total": 4
}
```

---

### Admin-Only Endpoints (Authentication Required)

#### 4. Add Images to Product
```
POST /api/products/:productId/images
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "images": [
    {
      "imageUrl": "https://example.com/image1.jpg",
      "altText": "Product front view",
      "imageOrder": 1,
      "isThumbnail": true
    },
    {
      "imageUrl": "https://example.com/image2.jpg",
      "altText": "Product side view",
      "imageOrder": 2,
      "isThumbnail": false
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "2 images added successfully",
  "data": [
    {
      "id": 1,
      "productId": 1,
      "imageUrl": "https://example.com/image1.jpg",
      "altText": "Product front view",
      "imageOrder": 1,
      "isThumbnail": true
    }
  ]
}
```

**Validations:**
- Minimum 1 image, Maximum 4 images per product
- Each image requires imageUrl
- imageOrder should be between 1-4
- At least one image should be marked as thumbnail

#### 5. Update a Product Image
```
PUT /api/products/:productId/images/:imageId
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "imageUrl": "https://example.com/new-image.jpg",
  "altText": "Updated alt text",
  "imageOrder": 2
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Image updated successfully",
  "data": {
    "id": 1,
    "productId": 1,
    "imageUrl": "https://example.com/new-image.jpg",
    "altText": "Updated alt text",
    "imageOrder": 2
  }
}
```

#### 6. Delete a Product Image
```
DELETE /api/products/:productId/images/:imageId
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Image deleted successfully",
  "data": {
    "message": "Image deleted successfully"
  }
}
```

#### 7. Delete All Images for a Product
```
DELETE /api/products/:productId/images
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "status": "success",
  "message": "4 images deleted successfully",
  "data": {
    "message": "4 images deleted successfully"
  }
}
```

---

## Frontend Integration

### ProductImageCarousel Component

**Props:**
```typescript
interface ProductImageCarouselProps {
  images: ProductImage[];
  productName: string;
  className?: string;
}
```

**Usage:**
```tsx
import ProductImageCarousel from '@/components/products/ProductImageCarousel';

<ProductImageCarousel
  images={product.images}
  productName={product.name}
  className="mb-6"
/>
```

**Features:**
- Horizontal scroll carousel with smooth animations
- 3-4 visible images per view
- Left/right navigation arrows
- Image counter (e.g., "1 / 4")
- Click thumbnail to change main image
- Mobile responsive (adjusts size for smaller screens)
- Keyboard accessible

---

## Database Initialization

### Run Migration Script

```bash
npm run db:add:product-images
```

This script:
1. Creates the `product_images` table
2. Sets up proper foreign keys and indexes
3. Adds sample images for testing

---

## Error Handling

### Common Errors

**400 Bad Request:**
```json
{
  "status": "error",
  "message": "Images array is required and must contain at least one image"
}
```

**401 Unauthorized:**
```json
{
  "status": "error",
  "message": "Unauthorized access"
}
```

**404 Not Found:**
```json
{
  "status": "error",
  "message": "Product with id 999 not found"
}
```

**500 Internal Server Error:**
```json
{
  "status": "error",
  "message": "Error adding images"
}
```

---

## Best Practices

### Image URLs
- Use secure HTTPS URLs only
- Optimize images for web (max 500KB per image)
- Use descriptive alt text for accessibility
- Recommended dimensions: 500x500px minimum

### Performance
- Images are fetched with products in single query
- Proper indexing on product_id and image_order
- JSON aggregation for efficient data retrieval
- Lazy loading recommended on frontend

### Security
- Image URLs should point to secure, trusted sources
- Admin endpoints protected with JWT token
- Input validation on all endpoints
- SQL injection prevention with parameterized queries

---

## Example Workflow

### 1. Admin adds product with images
```bash
POST /api/products
{
  "name": "Chanel No. 5",
  "brand": "Chanel",
  "price": 120.00,
  "category": "Women",
  "concentration": "EDP",
  "description": "Iconic fragrance...",
  "stock": 20
}
```

### 2. Admin adds images
```bash
POST /api/products/1/images
{
  "images": [
    {
      "imageUrl": "https://cdn.example.com/chanel1.jpg",
      "altText": "Chanel No. 5 - Front",
      "imageOrder": 1,
      "isThumbnail": true
    },
    {
      "imageUrl": "https://cdn.example.com/chanel2.jpg",
      "altText": "Chanel No. 5 - Side",
      "imageOrder": 2,
      "isThumbnail": false
    }
  ]
}
```

### 3. Customer views product with carousel
```bash
GET /api/products/1/with-images
```

Returns product details with images array, which is displayed in ProductImageCarousel component.

---

## Future Enhancements

- Image upload to cloud storage (AWS S3, Cloudinary)
- Image compression and optimization
- Multiple image formats (WEBP, JPG, PNG)
- Video support for products
- 360° product view
- Zoom functionality
- User image reviews/uploads
