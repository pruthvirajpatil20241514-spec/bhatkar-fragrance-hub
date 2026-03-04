const router = require('express').Router();
const { asyncHandler } = require('../middlewares/asyncHandler');
const adminAuth = require('../middlewares/adminAuth');
const productController = require('../controllers/product.controller');
const productImageController = require('../controllers/productImage.controller');

// Get all products with images (public)
router.route('/with-images/all').get(asyncHandler(productImageController.getAllProductsWithImages));

// Get all products (public)
router.route('/').get(asyncHandler(productController.getAllProducts));

// Get product with images (public)
router.route('/:id/with-images').get(asyncHandler(productImageController.getProductWithImages));

// Get product by ID (public)
router.route('/:id').get(asyncHandler(productController.getProductById));

// Admin only routes
// Create product
router.route('/').post(adminAuth, asyncHandler(productController.createProduct));

// Update product
router.route('/:id').put(adminAuth, asyncHandler(productController.updateProduct));

// Delete product
router.route('/:id').delete(adminAuth, asyncHandler(productController.deleteProduct));

/**
 * Product Image Routes (Admin Protected)
 */

// Get all images for a product (public)
router.route('/:productId/images').get(asyncHandler(productImageController.getProductImages));

// Add images to product (admin only)
router.route('/:productId/images').post(adminAuth, asyncHandler(productImageController.addProductImages));

// Delete all images for a product (admin only)
router.route('/:productId/images').delete(adminAuth, asyncHandler(productImageController.deleteProductImages));

// Update a product image (admin only)
router.route('/:productId/images/:imageId').put(adminAuth, asyncHandler(productImageController.updateProductImage));

// Delete a product image (admin only)
router.route('/:productId/images/:imageId').delete(adminAuth, asyncHandler(productImageController.deleteProductImage));

module.exports = router;