# 🚀 Railway Object Storage Backend Implementation Guide

## Installation & Setup

### Step 1: Install Required Dependencies

```bash
cd backend
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**Dependencies added:**
- `@aws-sdk/client-s3` - S3 client for uploading/deleting
- `@aws-sdk/s3-request-presigner` - For generating signed URLs (if needed)

### Step 2: Backend File Structure

Files created:
```
backend/
├── src/
│   ├── config/
│   │   └── railwayStorage.config.js      ← S3 client configuration
│   │
│   ├── controllers/
│   │   └── railwayImageUpload.controller.js  ← Upload/delete logic
│   │
│   ├── routes/
│   │   └── railwayImage.route.js            ← API endpoints
│   │
│   └── database/
│       └── scripts/
│           └── createProductImagesTable.js   ← DB migration
```

### Step 3: Update Backend app.js

Add these routes to your `backend/src/app.js`:

```javascript
const railwayImageRoute = require('./routes/railwayImage.route');

// Register routes
app.use('/api/images', railwayImageRoute);
app.use('/api/products/:id/with-images', railwayImageRoute);
```

### Step 4: Configure Environment Variables

Create/update `backend/.env`:

```env
# Railway Object Storage
S3_ENDPOINT=https://t3.storageapi.dev
S3_BUCKET=stocked-cupboard-bdb4pjnh
S3_REGION=auto
S3_ACCESS_KEY=your_access_key_here
S3_SECRET_KEY=your_secret_key_here

# Keep existing variables
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=fragrance_hub
```

### Step 5: Create Database Table

Run migration to create `product_images` table:

```bash
cd backend
node src/database/scripts/createProductImagesTable.js
```

**Expected output:**
```
✅ Created product_images table successfully
```

## API Endpoints

### Upload Images

**Endpoint:** `POST /api/images/upload/:productId`

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```
Form Data:
- images: [File1, File2, File3, File4]  (max 4 files)
```

**Example with cURL:**
```bash
curl -X POST http://localhost:5000/api/images/upload/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg" \
  -F "images=@image3.jpg"
```

**Success Response (201):**
```json
{
  "status": "success",
  "message": "Successfully uploaded 3 image(s)",
  "data": {
    "uploadedCount": 3,
    "failedCount": 0,
    "images": [
      {
        "id": 1,
        "product_id": 1,
        "image_url": "https://t3.storageapi.dev/stocked-cupboard-bdb4pjnh/products/1707152400000-abc123-image1.jpg",
        "image_order": 1,
        "is_thumbnail": true
      },
      {
        "id": 2,
        "product_id": 1,
        "image_url": "https://t3.storageapi.dev/stocked-cupboard-bdb4pjnh/products/1707152401000-def456-image2.jpg",
        "image_order": 2,
        "is_thumbnail": false
      }
    ]
  }
}
```

**Error Responses:**

```json
// Missing files
{
  "status": "error",
  "message": "No files uploaded"
}

// Too many files
{
  "status": "error",
  "message": "Maximum 4 images allowed per product"
}

// Product limit exceeded
{
  "status": "error",
  "message": "Product already has 2 images. Maximum 4 allowed."
}
```

### Delete Image

**Endpoint:** `DELETE /api/images/:productId/:imageId`

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Example with cURL:**
```bash
curl -X DELETE http://localhost:5000/api/images/1/2 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200):**
```json
{
  "status": "success",
  "message": "Image deleted successfully"
}
```

### Get Product with Images

**Endpoint:** `GET /api/products/:id/with-images`

**Headers:**
```
No authentication required (public endpoint)
```

**Example with cURL:**
```bash
curl http://localhost:5000/api/products/1/with-images
```

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Rose Perfume",
    "brand": "Chanel",
    "price": 9999,
    "category": "Floral",
    "concentration": "Eau de Parfum",
    "description": "Beautiful rose fragrance...",
    "stock": 50,
    "images": [
      {
        "id": 1,
        "product_id": 1,
        "image_url": "https://t3.storageapi.dev/stocked-cupboard-bdb4pjnh/products/...",
        "image_format": "jpg",
        "alt_text": "Rose Perfume - Image 1",
        "image_order": 1,
        "is_thumbnail": true,
        "created_on": "2025-02-05T10:30:00Z",
        "updated_on": "2025-02-05T10:30:00Z"
      },
      {
        "id": 2,
        "product_id": 1,
        "image_url": "https://t3.storageapi.dev/stocked-cupboard-bdb4pjnh/products/...",
        "image_format": "jpg",
        "alt_text": "Rose Perfume - Image 2",
        "image_order": 2,
        "is_thumbnail": false,
        "created_on": "2025-02-05T10:31:00Z",
        "updated_on": "2025-02-05T10:31:00Z"
      }
    ]
  }
}
```

## Database Schema

### Products Table (Existing)
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  price DECIMAL(10, 2),
  category VARCHAR(50),
  concentration VARCHAR(50),
  description TEXT,
  stock INT,
  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Product Images Table (New)
```sql
CREATE TABLE product_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL UNIQUE,
  image_format VARCHAR(50),
  alt_text VARCHAR(255),
  image_order INT DEFAULT 1,
  is_thumbnail BOOLEAN DEFAULT FALSE,
  created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  KEY idx_product_id (product_id),
  KEY idx_image_order (product_id, image_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Key Design Decisions:**
- ✅ `image_url` is UNIQUE (prevents duplicate uploads)
- ✅ Foreign key with CASCADE delete (removes images when product deleted)
- ✅ Indexes on product_id and image_order (fast queries)
- ✅ UTF-8 encoding for all text fields
- ✅ Timestamps for audit trail

## Data Flow

```
1. Admin uploads image
        ↓
2. Frontend FormData sends to POST /api/images/upload/:productId
        ↓
3. Multer receives file in memory buffer
        ↓
4. Backend validates:
   - File is image ✅
   - File < 10MB ✅
   - Product exists ✅
   - Product not at 4 images limit ✅
        ↓
5. AWS SDK v3 streams buffer to Railway Storage
        ↓
6. Railway generates public URL
   (https://t3.storageapi.dev/stocked-cupboard-bdb4pjnh/products/...)
        ↓
7. Backend saves URL to product_images table
        ↓
8. Response sent to frontend with URL
        ↓
9. Frontend displays image from Railway URL
        ↓
10. Customer sees image when viewing product
```

## Testing

### Test Connection

```bash
cd backend
node -e "
require('dotenv').config();
const { verifyConnection } = require('./src/config/railwayStorage.config');
verifyConnection();
"
```

### Test Upload

```bash
# Using cURL
curl -X POST http://localhost:5000/api/images/upload/1 \
  -H 'Authorization: Bearer YOUR_ADMIN_TOKEN' \
  -F 'images=@test-image.jpg' \
  -F 'images=@test-image2.jpg'
```

### Test Get Product

```bash
curl http://localhost:5000/api/products/1/with-images
```

## Troubleshooting

### Issue: "Failed to upload to Railway Storage: Invalid credentials"
**Solution:**
- Verify S3_ACCESS_KEY and S3_SECRET_KEY in .env
- Regenerate keys from Railway dashboard
- Restart backend server

### Issue: "Maximum 4 images allowed per product"
**Solution:**
- Product already has maximum images
- Delete old images first
- Try again

### Issue: "File is too large (max 10MB)"
**Solution:**
- Compress image before uploading
- Use online tool: tinypng.com
- Max file size is 10MB

### Issue: URL not accessible
**Solution:**
- Verify bucket name in S3_BUCKET
- Check URL format: `https://t3.storageapi.dev/bucket-name/file-key`
- Test direct URL in browser

## Performance Considerations

- ✅ Memory storage (no disk I/O)
- ✅ Streaming upload (efficient)
- ✅ Indexes on foreign key (fast queries)
- ✅ CDN-backed Railway Storage (fast delivery)
- ✅ Image order indexed (carousel sorting)

## Security

- ✅ Admin authentication required for upload/delete
- ✅ File type validation (images only)
- ✅ File size limits (10MB per file)
- ✅ SQL injection protection (parameterized queries)
- ✅ Foreign key constraints (no orphaned data)
- ✅ ACL set to public-read (customers can access)

## Monitoring

Check uploaded images:
```sql
SELECT product_id, COUNT(*) as image_count 
FROM product_images 
GROUP BY product_id;
```

Check total storage used:
```sql
SELECT 
  COUNT(*) as total_images,
  SUM(CHAR_LENGTH(image_url)) as total_url_size_bytes
FROM product_images;
```

---

**Status:** ✅ Ready for Production
