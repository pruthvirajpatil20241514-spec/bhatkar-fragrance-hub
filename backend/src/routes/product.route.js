const router = require('express').Router();
const { asyncHandler } = require('../middlewares/asyncHandler');
const adminAuth = require('../middlewares/adminAuth');
const productController = require('../controllers/product.controller');

// Get all products (public)
router.route('/').get(asyncHandler(productController.getAllProducts));

// Get product by ID (public)
router.route('/:id').get(asyncHandler(productController.getProductById));

// Admin only routes
// Create product
router.route('/').post(adminAuth, asyncHandler(productController.createProduct));

// Update product
router.route('/:id').put(adminAuth, asyncHandler(productController.updateProduct));

// Delete product
router.route('/:id').delete(adminAuth, asyncHandler(productController.deleteProduct));

module.exports = router;
