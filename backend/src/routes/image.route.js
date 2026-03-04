const router = require('express').Router();
const { asyncHandler } = require('../middlewares/asyncHandler');
const adminAuth = require('../middlewares/adminAuth');
const upload = require('../config/multer.config');
const imageUploadController = require('../controllers/imageUpload.controller');
const { proxyImage, cacheStats } = require('../controllers/imageProxy.controller');

// ─── PUBLIC: Image Proxy ──────────────────────────────────────────────────────
// Proxies product images from Supabase Storage through the backend.
// This eliminates direct browser → Supabase CDN connections which can timeout.
//
// GET /api/images/proxy/<filename>
// GET /api/images/proxy/<folder>/<filename>    (path with slashes)
router.get('/proxy/*', asyncHandler(proxyImage));

// Debug only – returns in-memory cache stats (no auth needed, read-only)
router.get('/cache-stats', asyncHandler(cacheStats));

// ─── ADMIN: Upload / Delete ───────────────────────────────────────────────────

// Upload images to a product (admin only)
// POST /api/images/upload/:productId
router.post(
  '/upload/:productId',
  adminAuth,
  upload.array('images', 4),
  asyncHandler(imageUploadController.uploadProductImages)
);

// Temporary upload (no DB) - admin only
// POST /api/images/upload-temp
router.post(
  '/upload-temp',
  adminAuth,
  upload.array('images', 4),
  asyncHandler(imageUploadController.uploadTempImages)
);

// Delete product image (admin only)
// DELETE /api/images/:productId/:imageId
router.delete(
  '/:productId/:imageId',
  adminAuth,
  asyncHandler(imageUploadController.deleteProductImage)
);

module.exports = router;

