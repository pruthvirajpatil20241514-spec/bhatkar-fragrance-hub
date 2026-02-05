const router = require('express').Router();
const { asyncHandler } = require('../middlewares/asyncHandler');
const adminAuth = require('../middlewares/adminAuth');
const upload = require('../config/multer.config');
const imageUploadController = require('../controllers/imageUpload.controller');

/**
 * Image Upload Routes (Admin Protected)
 */

// Upload images to a product (admin only)
// POST /api/images/upload/:productId
router.post(
  '/upload/:productId',
  adminAuth,
  upload.array('images', 4), // Accept up to 4 files with field name 'images'
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
