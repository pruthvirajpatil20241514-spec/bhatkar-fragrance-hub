/**
 * Image Upload Routes (Railway Object Storage)
 */

const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  uploadProductImages,
  deleteProductImage,
  getProductWithImages,
} = require('../controllers/railwayImageUpload.controller');
const { verifyAdmin } = require('../middlewares/auth.middleware');

// Configure multer for memory storage (will stream to Railway)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 4, // Maximum 4 files per request
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

/**
 * @route POST /api/images/upload/:productId
 * @desc Upload images for a product
 * @access Admin only
 */
router.post(
  '/upload/:productId',
  verifyAdmin,
  upload.array('images', 4),
  uploadProductImages
);

/**
 * @route DELETE /api/images/:productId/:imageId
 * @desc Delete a product image
 * @access Admin only
 */
router.delete(
  '/:productId/:imageId',
  verifyAdmin,
  deleteProductImage
);

/**
 * @route GET /api/products/:id/with-images
 * @desc Get product with all its images
 * @access Public
 */
router.get('/products/:id/with-images', getProductWithImages);

module.exports = router;
