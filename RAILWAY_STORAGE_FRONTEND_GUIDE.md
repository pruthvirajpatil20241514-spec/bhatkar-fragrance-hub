# 🎨 Railway Object Storage Frontend Integration Guide

## Frontend File Structure

Files created:
```
src/
├── components/
│   └── products/
│       ├── RailwayImageUploader.tsx         ← Upload component
│       └── RailwayImageCarousel.tsx         ← Display carousel
│
├── pages/
│   └── AdminRailwayImageManager.tsx         ← Admin dashboard
│
└── (existing)
    ├── App.tsx                              ← Add routes
    └── pages/ProductDetailWithImages.tsx    ← Update to use carousel
```

## Component Usage

### 1. RailwayImageUploader

**Purpose:** Admin uploads images to Railway Storage

**Location:** `src/components/products/RailwayImageUploader.tsx`

**Props:**
```typescript
interface RailwayImageUploaderProps {
  productId: number;                    // Product ID
  onImagesUploaded?: (images: UploadedImage[]) => void;  // Callback after upload
  adminToken: string;                   // JWT token from auth context
}
```

**Usage Example:**
```tsx
import RailwayImageUploader from '@/components/products/RailwayImageUploader';
import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { token } = useAuth();
  
  return (
    <RailwayImageUploader
      productId={1}
      adminToken={token || ""}
      onImagesUploaded={(images) => {
        console.log('Uploaded:', images);
      }}
    />
  );
}
```

**Features:**
- ✅ Drag & drop file upload
- ✅ Multiple file selection (up to 4)
- ✅ Image preview
- ✅ Progress bar
- ✅ File validation (images only, 10MB max)
- ✅ Upload to Railway Storage
- ✅ Error handling

### 2. RailwayImageCarousel

**Purpose:** Display product images in carousel format

**Location:** `src/components/products/RailwayImageCarousel.tsx`

**Props:**
```typescript
interface ProductImageCarouselProps {
  images: ProductImage[];               // Array of images
  productName: string;                  // Product name (for alt text)
  className?: string;                   // Optional CSS classes
}
```

**Usage Example:**
```tsx
import ProductImageCarousel from '@/components/products/RailwayImageCarousel';

export default function ProductDetail() {
  const product = {
    id: 1,
    name: 'Rose Perfume',
    images: [
      {
        id: 1,
        image_url: 'https://t3.storageapi.dev/.../image1.jpg',
        alt_text: 'Rose Perfume Image 1',
        image_order: 1,
        is_thumbnail: true
      },
      // ... more images
    ]
  };

  return (
    <ProductImageCarousel
      images={product.images}
      productName={product.name}
      className="mb-6"
    />
  );
}
```

**Features:**
- ✅ Main image display
- ✅ Thumbnail strip (4 per view)
- ✅ Scroll arrows
- ✅ Image counter
- ✅ Thumbnail badges
- ✅ Smooth scrolling

### 3. AdminRailwayImageManager

**Purpose:** Full image management dashboard for admins

**Location:** `src/pages/AdminRailwayImageManager.tsx`

**Route Setup:**
```tsx
// In App.tsx
import AdminRailwayImageManager from '@/pages/AdminRailwayImageManager';

<Route
  path="/admin/products/:id/images"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminRailwayImageManager />
    </ProtectedRoute>
  }
/>
```

**Features:**
- ✅ Upload new images
- ✅ Display current images
- ✅ Delete images
- ✅ Image reordering
- ✅ Thumbnail management
- ✅ Image statistics

## Integration Steps

### Step 1: Update App.tsx

Add route for admin image manager:

```tsx
import AdminRailwayImageManager from '@/pages/AdminRailwayImageManager';
import ProtectedRoute from '@/components/ProtectedRoute';

// In your Routes component:
<Route
  path="/admin/products/:id/images"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminRailwayImageManager />
    </ProtectedRoute>
  }
/>
```

### Step 2: Update ProductDetailWithImages.tsx

Replace carousel usage:

```tsx
import RailwayImageCarousel from '@/components/products/RailwayImageCarousel';

// In JSX:
<ProductImageCarousel
  images={product.images || []}
  productName={product.name}
  className="mb-6"
/>
```

### Step 3: Update Products Table (Admin)

Add "Images" button to products table:

```tsx
import { Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

// In table actions:
<Link to={`/admin/products/${product.id}/images`}>
  <Button variant="outline" size="sm">
    <ImageIcon className="mr-2 h-4 w-4" />
    Images
  </Button>
</Link>
```

## API Integration

### Upload Images

```typescript
const handleUpload = async (files: File[], productId: number, token: string) => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  try {
    const response = await api.post(
      `/images/upload/${productId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('Uploaded:', response.data.data.images);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Get Product with Images

```typescript
const fetchProductWithImages = async (productId: number) => {
  try {
    const response = await api.get(`/products/${productId}/with-images`);
    return response.data.data;  // Contains product + images array
  } catch (error) {
    console.error('Fetch failed:', error);
  }
};
```

### Delete Image

```typescript
const deleteImage = async (productId: number, imageId: number, token: string) => {
  try {
    await api.delete(
      `/images/${productId}/${imageId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    console.log('Image deleted');
  } catch (error) {
    console.error('Delete failed:', error);
  }
};
```

## Styling Customization

### Carousel Colors

```tsx
// Edit RailwayImageCarousel.tsx
<div
  className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center"
  // Change: bg-opacity-40 to adjust hover darkness
  // Change: transition speed with transition-all duration-300
/>
```

### Image Card Borders

```tsx
// Edit AdminRailwayImageManager.tsx
border-orange-300  // Main image border
border-gray-200    // Inactive border
hover:border-orange-300  // Hover state
```

### Upload Zone Colors

```tsx
// Edit RailwayImageUploader.tsx
bg-blue-600      // Upload button
hover:bg-blue-700 // Button hover
border-gray-300  // Drop zone border
```

## Performance Optimization

### Image Lazy Loading

```tsx
<img
  src={image.image_url}
  alt={image.alt_text}
  loading="lazy"  // Add this
  className="w-full h-full object-cover"
/>
```

### Image Compression

Before uploading, compress images client-side:

```typescript
import imageCompression from 'browser-image-compression';

const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
  };
  return await imageCompression(file, options);
};
```

### Caching

Railway Storage uses CloudFront CDN, so URLs are cached by default.

## Error Handling

### Network Errors

```typescript
try {
  await uploadImages(files, productId, token);
} catch (error: any) {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
  } else if (error.response?.status === 413) {
    // Payload too large
    toast.error('File too large');
  } else {
    toast.error(error.response?.data?.message || 'Upload failed');
  }
}
```

### Validation Errors

```typescript
// Component handles:
- No files selected
- Too many files (>4)
- Invalid file type
- File too large (>10MB)
- Product not found
- Permission denied
```

## Testing

### Manual Test Flow

1. **Login as Admin**
   - Navigate to admin dashboard
   - Go to Products

2. **Upload Images**
   - Click "Images" button on any product
   - Drag & drop 2-3 images
   - Click "Upload to Railway"
   - Wait for success message

3. **Verify Images**
   - Should see thumbnails in "Current Images"
   - Check badges (Main, #1, #2, etc)
   - File format shown below image

4. **View as Customer**
   - Go to product detail page
   - Carousel should display all images
   - Can scroll through thumbnails
   - Images load from Railway Storage

5. **Delete Image**
   - Click delete button on image
   - Confirm deletion
   - Image removed from carousel
   - Remaining images reordered

### Test Cases

```typescript
// Test: Upload single image
✅ Admin uploads 1 image
✅ Image URL returned
✅ Image appears in carousel

// Test: Upload multiple images
✅ Admin uploads 3 images
✅ All URLs returned
✅ All images appear in carousel
✅ Ordered correctly (1, 2, 3)

// Test: Maximum images
✅ Upload 4 images
✅ Cannot upload 5th
✅ Shows error message

// Test: Invalid files
❌ Try uploading PDF
❌ Try uploading video
❌ Try uploading file >10MB
✅ All rejected with error

// Test: Delete image
✅ Delete image from carousel
✅ Remaining reordered
✅ Deleted from Railway Storage
```

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

Requires:
- Drag & Drop API
- FormData API
- Fetch API

## Accessibility

Components include:
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Color contrast
- ✅ Alt text for images

## Security

- ✅ Admin authentication required
- ✅ File type validation
- ✅ File size limits
- ✅ CORS protected
- ✅ No sensitive data in URLs

---

**Status:** ✅ Ready for Integration
