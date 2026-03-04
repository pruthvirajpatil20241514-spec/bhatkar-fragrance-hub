# ⚡ Railway Object Storage - Quick Start (5 Minutes)

## 🎯 Goal
Get Railway Object Storage image uploads working in 5 minutes

---

## Step 1: Install Dependencies (1 min)

```bash
cd backend
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

Done! ✅

---

## Step 2: Configure Environment (1 min)

**Get credentials from Railway:**
1. Go to https://railway.app/dashboard
2. Select your project
3. Find Object Storage service
4. Copy "Access Key ID" and "Secret Access Key"

**Add to `backend/.env`:**
```env
S3_ENDPOINT=https://t3.storageapi.dev
S3_BUCKET=stocked-cupboard-bdb4pjnh
S3_REGION=auto
S3_ACCESS_KEY=paste_here
S3_SECRET_KEY=paste_here
```

Done! ✅

---

## Step 3: Create Database Table (1 min)

```bash
node backend/src/database/scripts/createProductImagesTable.js
```

You should see:
```
✅ Created product_images table successfully
```

Done! ✅

---

## Step 4: Register Backend Routes (1 min)

Open `backend/src/app.js` and add:

```javascript
// After other imports
const railwayImageRoute = require('./routes/railwayImage.route');

// After other app.use() calls
app.use('/api/images', railwayImageRoute);
```

Restart backend server.

Done! ✅

---

## Step 5: Test Connection (1 min)

```bash
cd backend
node -e "require('dotenv').config(); const { verifyConnection } = require('./src/config/railwayStorage.config'); verifyConnection();"
```

You should see:
```
✅ Successfully connected to Railway Object Storage
```

Done! ✅

---

## 🎉 That's it! You're ready!

### Next: Test the Upload Flow

1. **Go to Admin Panel**
   - Navigate to: http://localhost:5173/admin/products

2. **Add Images Button**
   - (Optional) Add button to products table, OR
   - Navigate directly to: http://localhost:5173/admin/products/1/images

3. **Upload Images**
   - Drag & drop or click to select images
   - Upload max 4 images per product
   - Wait for success

4. **View as Customer**
   - Go to: http://localhost:5173/product/1
   - Carousel shows uploaded images
   - Images load from Railway Storage ✅

---

## 📊 What You Get

```
Local Image File
        ↓
Admin Upload
        ↓
Railroad Object Storage Bucket ✅
        ↓
Public URL Generated
        ↓
MySQL Stores URL
        ↓
Customer Sees Image ✅
```

---

## 🔗 Generated URLs

Images stored at Railway will have URLs like:
```
https://t3.storageapi.dev/stocked-cupboard-bdb4pjnh/products/1707152400000-abc123-image.jpg
```

✅ Public and accessible
✅ CDN cached automatically
✅ Permanent and stable

---

## 📚 Full Guides Available

For more details, see:
- `RAILWAY_STORAGE_ENV_SETUP.md` - Environment setup details
- `RAILWAY_STORAGE_BACKEND_GUIDE.md` - Backend API documentation
- `RAILWAY_STORAGE_FRONTEND_GUIDE.md` - Frontend integration details
- `RAILWAY_STORAGE_IMPLEMENTATION_CHECKLIST.md` - Complete checklist

---

## ✅ Verification

**Backend running?**
```bash
curl http://localhost:5000/api/products/1/with-images
```
Should return product with images array.

**Database working?**
```bash
SELECT COUNT(*) FROM product_images;
```
Should return 0 or more (depending on uploads).

**Storage connected?**
```bash
node -e "require('dotenv').config(); const { verifyConnection } = require('./backend/src/config/railwayStorage.config'); verifyConnection();"
```
Should show ✅ Connected.

---

## ❌ Issues?

| Issue | Solution |
|-------|----------|
| Connection failed | Check S3_ACCESS_KEY and S3_SECRET_KEY |
| Upload fails | Verify file < 10MB and is image format |
| URL not working | Check S3_BUCKET name in .env |
| Images not showing | Verify database migration ran |

---

## 🚀 Ready to Deploy?

1. ✅ Dependencies installed
2. ✅ Environment configured
3. ✅ Database migrated
4. ✅ Routes registered
5. ✅ Connection tested

**Status: READY FOR PRODUCTION** 🎉

---

**Time to setup:** ~5 minutes  
**Time to first upload:** ~10 minutes  
**Status:** ✅ Complete
