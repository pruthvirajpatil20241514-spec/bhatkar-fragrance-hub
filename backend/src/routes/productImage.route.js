const router = require('express').Router();
const { asyncHandler } = require('../middlewares/asyncHandler');
const adminAuth = require('../middlewares/adminAuth');
const productImageController = require('../controllers/productImage.controller');

/**
 * Public Routes (Customer can view images)
 */

// Get product with all images - GET /api/products/:productId/with-images
router.get('/:productId/with-images', asyncHandler(productImageController.getProductWithImages));

// Get all products with images - GET /api/products/with-images
router.get('/with-images/all', asyncHandler(productImageController.getAllProductsWithImages));

// Get all images for a product - GET /api/products/:productId/images
router.get('/:productId/images', asyncHandler(productImageController.getProductImages));

/**
 * Admin Protected Routes (Only admin can modify images)
 */

// Add images to product - POST /api/products/:productId/images
router.post(
  '/:productId/images',
  adminAuth,
  asyncHandler(productImageController.addProductImages)
);

// Update a product image - PUT /api/products/:productId/images/:imageId
router.put(
  '/:productId/images/:imageId',
  adminAuth,
  asyncHandler(productImageController.updateProductImage)
);

// Delete a product image - DELETE /api/products/:productId/images/:imageId
router.delete(
  '/:productId/images/:imageId',
  adminAuth,
  asyncHandler(productImageController.deleteProductImage)
);

// Delete all images for a product - DELETE /api/products/:productId/images
router.delete(
  '/:productId/images',
  adminAuth,
  asyncHandler(productImageController.deleteProductImages)
);

module.exports = router;
