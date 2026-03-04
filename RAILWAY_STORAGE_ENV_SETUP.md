# 🚀 Railway Object Storage Configuration Guide

## Environment Variables Setup

Add these variables to your `.env` file in the backend folder:

```env
# Railway Object Storage Configuration
S3_ENDPOINT=https://t3.storageapi.dev
S3_BUCKET=stocked-cupboard-bdb4pjnh
S3_REGION=auto
S3_ACCESS_KEY=your_access_key_here
S3_SECRET_KEY=your_secret_key_here

# Example (replace with actual credentials):
# S3_ACCESS_KEY=AKIA2EXAMPLE1234567890
# S3_SECRET_KEY=wJalrXUtnFEMI/K7MDENG+ExampleSecretKey
```

## Credentials Location

1. **Go to Railway Project:**
   - Visit https://railway.app/dashboard

2. **Navigate to Object Storage:**
   - Select your project
   - Click "Storage" or "Plugins"
   - Find "Object Storage" service

3. **Get Credentials:**
   - Copy "Access Key ID"
   - Copy "Secret Access Key"
   - Paste into `.env` file

## Verification

### Test Connection in Backend:
```bash
cd backend
node -e "
require('dotenv').config();
const { verifyConnection } = require('./src/config/railwayStorage.config');
verifyConnection().then(success => {
  if (success) console.log('✅ Connected');
  else console.log('❌ Failed');
});
"
```

### Expected Output:
```
✅ Successfully connected to Railway Object Storage
```

## Security Notes

- ⚠️ **NEVER commit `.env` to GitHub**
- ✅ Add `.env` to `.gitignore`
- ✅ Use Railway environment variables in production
- ✅ Rotate access keys regularly
- ✅ Keep secrets private

## File Upload Flow

```
Admin uploads image
        ↓
Multer receives file in memory
        ↓
AWS SDK v3 streams to Railway Storage
        ↓
Public URL generated
        ↓
URL stored in MySQL
        ↓
Customer sees image from Railway CDN
```

## API Endpoints

### Upload Images
```http
POST /api/images/upload/:productId
Content-Type: multipart/form-data
Authorization: Bearer <admin_token>

[Binary image files]
```

### Delete Image
```http
DELETE /api/images/:productId/:imageId
Authorization: Bearer <admin_token>
```

### Get Product with Images
```http
GET /api/products/:productId/with-images
```

## Maximum Image Sizes

- Per file: 10 MB
- Per product: 4 files maximum
- Total per upload: 40 MB

## Troubleshooting

### Issue: Connection Failed
```
❌ Connection failed: Invalid credentials
```
**Solution:**
- Verify S3_ACCESS_KEY and S3_SECRET_KEY
- Check credentials are not expired
- Regenerate keys from Railway dashboard

### Issue: Upload Fails
```
❌ Failed to upload to Railway Storage: Request failed
```
**Solution:**
- Check bucket name is correct
- Verify endpoint URL is https://t3.storageapi.dev
- Ensure file size < 10MB

### Issue: URL Not Accessible
```
❌ Image URL returns 403 Forbidden
```
**Solution:**
- Check ACL is set to 'public-read'
- Verify S3_BUCKET name in URL
- Test direct URL in browser

## Next Steps

1. ✅ Add environment variables to `.env`
2. ✅ Test connection
3. ✅ Start backend server
4. ✅ Upload images via admin interface
5. ✅ Verify images appear on product pages
