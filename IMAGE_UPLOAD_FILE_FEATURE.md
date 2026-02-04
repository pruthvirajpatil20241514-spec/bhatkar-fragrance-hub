# Image Upload Feature - File Upload & Drag-and-Drop Guide

## Overview

The product image upload system now supports two methods:

1. **📁 File Upload** - Drag and drop or select images from your local computer
2. **🔗 URL Input** - Paste HTTPS image URLs from external sources

---

## Feature Highlights

### File Upload (NEW)
✅ **Drag and Drop Support** - Drop images directly into the upload zone  
✅ **File Selection** - Click to browse and select files from computer  
✅ **Live Preview** - See selected image before uploading  
✅ **File Validation** - Automatic format and size checking  
✅ **Progress Indicator** - Shows uploading status  
✅ **File Size Limit** - Max 5MB per image  
✅ **Supported Formats** - JPG, PNG, WebP, GIF  

### URL Upload (Existing)
✅ **External URLs** - Link to images on Unsplash, Cloudinary, etc.  
✅ **HTTPS Required** - Secure URLs only  
✅ **No Size Limits** - External URL storage  
✅ **Simple Input** - Paste and go  

---

## Upload Interface

### Upload Method Tabs

```
┌─────────────────────────────────────────┐
│  📁 Upload File  │  🔗 Use URL          │
└─────────────────────────────────────────┘
```

Switch between methods with easy tab buttons.

---

## File Upload Method

### Drag and Drop Zone

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ⬆️ Upload Icon                                │
│  Drag and drop your image here                 │
│  or click to select from computer              │
│  Max size: 5MB (JPG, PNG, WebP)               │
│                                                 │
│  [Click anywhere to select file]               │
└─────────────────────────────────────────────────┘
```

### With Preview (File Selected)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ┌─────────────────────────┐                   │
│  │  [Image Preview]        │                   │
│  │  ████████████████████   │                   │
│  │  ████████████████████   │  20x20px preview  │
│  └─────────────────────────┘                   │
│  product_image.jpg                             │
│  Click or drag to replace                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Input Fields (File Upload Tab)

**Alt Text** (Required)
```
┌─────────────────────────────────────────┐
│ e.g., Product front view                │
└─────────────────────────────────────────┘
```

### Action Buttons

```
┌─────────────────────────────────────────┐
│  [⬆️ Upload Image]   (Active/Disabled)  │
│  [Clear Selection]   (Clear file)       │
└─────────────────────────────────────────┘
```

---

## URL Upload Method

### Input Fields

**Image URL** (Required)
```
┌─────────────────────────────────────────┐
│ https://example.com/image.jpg           │
│ 💡 Use HTTPS URLs (Unsplash, ...)      │
└─────────────────────────────────────────┘
```

**Alt Text** (Optional)
```
┌─────────────────────────────────────────┐
│ e.g., Product front view                │
└─────────────────────────────────────────┘
```

### Action Button

```
┌─────────────────────────────────────────┐
│ [⬆️ Add Image]     (Active/Disabled)   │
└─────────────────────────────────────────┘
```

---

## Step-by-Step Usage

### Method 1: Upload from Computer (File)

```
1. Click "Product Images (Max 4)" section

2. Tab automatically shows "📁 Upload File"

3. Either:
   a) Drag image file into the zone, OR
   b) Click in the zone and select from file browser

4. Image appears with preview:
   ┌─────────────────┐
   │  [Preview]      │
   │  filename.jpg   │
   └─────────────────┘

5. Type Alt Text (e.g., "Product front view")

6. Click [⬆️ Upload Image]

7. Uploading... (shows spinner)
   [⏳ Uploading Image...]

8. Success! Image added to list:
   ✅ "Image uploaded successfully!"
   
   ┌──────────────────────────────┐
   │ Product front view           │
   │ /uploads/images/123456...jpg │
   │ [Thumb]        [✕]          │
   └──────────────────────────────┘

9. Repeat steps 3-8 for up to 4 images

10. Click "Add Product" or "Update Product"
    Images automatically saved to database
```

### Method 2: Upload from URL

```
1. Click "Product Images (Max 4)" section

2. Click "🔗 Use URL" tab

3. Paste HTTPS URL:
   https://images.unsplash.com/photo-xxx

4. Type Alt Text (optional)

5. Click [⬆️ Add Image]

6. Image added to list:
   ┌──────────────────────────────┐
   │ Product detail               │
   │ https://images.unsplash...   │
   │ [Thumb]        [✕]          │
   └──────────────────────────────┘

7. Repeat for up to 4 images

8. Click "Add Product" or "Update Product"
```

---

## File Validation

### Supported Image Formats
```
✅ JPG/JPEG  (image/jpeg)
✅ PNG       (image/png)
✅ WebP      (image/webp)
✅ GIF       (image/gif)

❌ BMP, TIFF, SVG (not supported)
```

### File Size Limits
```
✅ Maximum: 5MB (5,242,880 bytes)
❌ Exceeds 5MB: Error shown
```

### Validation Errors

```
❌ "Please select an image file"
   → File format not supported
   → Select JPG, PNG, WebP, or GIF

❌ "File size must be less than 5MB"
   → File too large
   → Compress image or select smaller file

❌ "Please select a file and add alt text"
   → Missing alt text
   → Type description in Alt Text field

❌ "Please enter an image URL"
   → Empty URL field
   → Paste image URL in field

❌ "Invalid image format"
   → Corrupted or invalid image
   → Try different image file
```

---

## Drag and Drop Behavior

### Normal State (Hover)
```
Border: Light gray dashed
Color: Muted/gray background
Text: "Drag and drop your image here..."
```

### Active State (Dragging Over)
```
Border: Solid primary color (blue/orange)
Background: Light blue/orange tint
Color: Highlighted with primary color
```

### File Selected
```
Shows image preview
Displays filename
Text: "Click or drag to replace"
```

---

## Image Management

### Adding Images

1. **Upload file** → Image preview shows
2. **Add alt text** → Describe the image
3. **Click Upload** → Sends to server
4. **Image appears in list** → Ready to manage

### Setting Thumbnail

```
Current state (Image 1 is thumbnail):
│ Image 1: [✓ Thumb]  [✕]  ← Primary image
│ Image 2: [Thumb]    [✕]
│ Image 3: [Thumb]    [✕]

Click Thumb button on Image 2:
│ Image 1: [Thumb]    [✕]
│ Image 2: [✓ Thumb]  [✕]  ← Now primary
│ Image 3: [Thumb]    [✕]
```

Only one image can be marked as thumbnail (primary image shown to customers).

### Removing Images

```
Click [✕] on any image:
│ Image 1: [✓ Thumb]  [✕]
│ Image 2: [Thumb]    [✕]  ← Deleted
│ Image 3: [Thumb]    [✕]

Image removed from list
(Not deleted from server until you click "Add/Update Product")
```

---

## Backend Implementation

### Upload Endpoint

**URL**: `POST /api/upload-image`  
**Auth**: Required (Admin JWT token)  
**Content-Type**: `application/json`

### Request Body

```json
{
  "file": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "altText": "Product front view"
}
```

### Response

**Success (200)**
```json
{
  "status": "success",
  "message": "Image uploaded successfully",
  "data": {
    "imageUrl": "/uploads/images/1707101234-product.jpg",
    "altText": "Product front view"
  },
  "imageUrl": "/uploads/images/1707101234-product.jpg"
}
```

**Error (400)**
```json
{
  "status": "error",
  "message": "File size exceeds 5MB limit"
}
```

### Error Codes

```
400 - Bad Request
  - No file provided
  - Invalid base64 format
  - Invalid image format
  - File size exceeds limit
  - Alt text required

401 - Unauthorized
  - Missing JWT token
  - Invalid token
  - Not admin user

500 - Server Error
  - File system error
  - Database error
  - Unexpected error
```

---

## Frontend Integration

### Component: ImageUploadForm

Located in: `/src/pages/admin/Products.tsx`

**Props**:
```tsx
interface ImageUploadFormProps {
  onAdd: (imageUrl: string, altText: string) => void;
  disabled?: boolean;
}
```

**State Management**:
```tsx
const [uploadMethod, setUploadMethod] = useState<"url" | "file">("file");
const [isDragging, setIsDragging] = useState(false);
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [filePreview, setFilePreview] = useState<string | null>(null);
const [isUploading, setIsUploading] = useState(false);
```

**Key Functions**:
- `handleFileSelect()` - Validate and preview file
- `handleDrop()` - Handle drag and drop
- `handleUploadFile()` - Send to backend
- `handleFileInputChange()` - File input handler
- `handleUrlSubmit()` - URL submission

---

## API Integration

### Axios Configuration

```typescript
// File gets converted to base64 automatically
const reader = new FileReader();
reader.onload = (e) => {
  const base64String = e.target?.result as string;
  api.post('/upload-image', {
    file: base64String,
    altText: altText
  });
};
reader.readAsDataURL(file);
```

### Response Handling

```typescript
try {
  const response = await api.post("/upload-image", formData);
  const imageUrl = response.data.imageUrl;
  onAdd(imageUrl, altText); // Add to product
  toast.success("Image uploaded successfully!");
} catch (error) {
  toast.error(error.response?.data?.message);
}
```

---

## Storage Location

### Local Storage
```
/backend/uploads/images/
├── 1707101234-product.jpg
├── 1707101235-bottle.png
├── 1707101236-package.jpg
└── 1707101237-detail.webp
```

### File Naming Convention
```
[TIMESTAMP]-[FILENAME]

Example:
1707101234-product_front.jpg
```

### Serving URL
```
GET /uploads/images/1707101234-product.jpg

Full URL:
https://api.example.com/uploads/images/1707101234-product.jpg
```

---

## Database Storage

Once uploaded, images are saved to `product_images` table:

```sql
INSERT INTO product_images 
  (product_id, image_url, alt_text, image_order, is_thumbnail, created_on)
VALUES 
  (1, '/uploads/images/1707101234-product.jpg', 'Product front view', 1, 1, NOW());
```

**Columns**:
- `id` - Image ID (auto-increment)
- `product_id` - Link to product
- `image_url` - File path or URL
- `alt_text` - Alt text description
- `image_order` - Display order (1-4)
- `is_thumbnail` - Primary image flag
- `created_on` - Upload timestamp
- `updated_on` - Last modified timestamp

---

## Troubleshooting

### Issue: Drag and Drop Not Working

**Solution 1**: Ensure you're dropping files (not folders)
```
✓ Drop: image.jpg file
✗ Drop: folder containing images
```

**Solution 2**: Try file selection instead
```
Click in the upload zone → Select from file browser
```

### Issue: File Upload Fails

**Check**:
1. File format: JPG, PNG, WebP, or GIF?
2. File size: Less than 5MB?
3. Internet connection: Stable connection?
4. Admin permission: Logged in as admin?

**Solution**:
```
1. Convert to supported format (JPG or PNG)
2. Compress image (use TinyPNG or similar)
3. Try again with stable internet
4. Log out and log back in
```

### Issue: Image Not Appearing After Upload

**Check**:
1. Backend running? Check `/health` endpoint
2. Upload directory exists? `/backend/uploads/images/`
3. File permissions? Directory writable?

**Solution**:
```
1. Restart backend server
2. Create uploads directory manually:
   mkdir -p backend/uploads/images
3. Check directory permissions
```

### Issue: "Failed to Upload Image"

**Check**:
1. Alt text added? (Required)
2. Server logs: Check error message
3. Network tab: Check API response

**Solution**:
```
1. Add descriptive alt text
2. Check backend console for specific error
3. Retry with different image
```

---

## Best Practices

### Image Preparation

1. **Compress Images**
   - Use: TinyPNG, ImageOptim, or similar
   - Target: 200-500 KB per image
   - Benefit: Faster uploads and loads

2. **Image Dimensions**
   - Recommended: 800x1000px or higher
   - Aspect ratio: Portrait (3:4 or 2:3)
   - Benefit: Looks good in carousel

3. **Image Quality**
   - Format: JPG (better compression) or PNG (for transparency)
   - Quality: 80% JPG quality is usually sufficient
   - Benefit: Balance quality and file size

### Alt Text Guidelines

```
❌ Bad: "image", "photo", "pic"
   → Not descriptive for accessibility

✓ Good: "Product front view", "Bottle side angle"
   → Clear description of image content

✓ Better: "Perfume bottle with box and leaves"
   → More detailed for customers and SEO
```

### Upload Order

```
1st Image: Main product photo (most important)
2nd Image: Side or different angle
3rd Image: Detail shot (cap, label)
4th Image: Packaging or lifestyle photo
```

This order helps customers get complete product overview.

---

## Testing Checklist

- [ ] Upload image via drag and drop
- [ ] Upload image via file selection
- [ ] Preview shows before uploading
- [ ] Alt text is required and validated
- [ ] File size limit enforced (5MB)
- [ ] File format validation works
- [ ] Upload progress shows (spinner)
- [ ] Success message displayed
- [ ] Image appears in products list
- [ ] Thumbnail selection works
- [ ] Image deletion works
- [ ] 4-image limit enforced
- [ ] URL upload method works
- [ ] Images visible in customer view
- [ ] Images persist after product save
- [ ] Mobile view responsive

---

## Performance Considerations

### File Size
```
Total upload: 4 images × 500KB = 2MB
Upload time: ~2 seconds (typical connection)
```

### Database
```
Per image: ~200 bytes metadata
Per product (4 images): ~800 bytes
Total impact: Minimal
```

### Storage
```
Annual usage (1000 products × 4 images × 500KB):
~2GB storage needed
Recommendation: Use cloud storage for production
```

---

## Future Enhancements

- [ ] Image cropping tool
- [ ] Bulk upload (multiple files at once)
- [ ] Cloudinary/S3 integration
- [ ] Automatic image optimization
- [ ] Image compression before upload
- [ ] Drag to reorder images
- [ ] Image gallery template

---

**Documentation Updated**: February 4, 2026  
**Status**: ✅ Production Ready  
**Last Modified**: File upload feature complete
