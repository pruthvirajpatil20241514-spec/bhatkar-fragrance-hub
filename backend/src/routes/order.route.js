const router = require('express').Router();
const { asyncHandler } = require('../middlewares/asyncHandler');
const adminAuth = require('../middlewares/adminAuth');
const { auth } = require('../middlewares/auth');
const orderController = require('../controllers/order.controller');

// User: get personal orders
router.get('/my', auth, asyncHandler(orderController.getMyOrders));

// Public: get all orders (for admin UI we'll protect in front-end; keep admin route for modifications)
router.route('/').get(adminAuth, asyncHandler(orderController.getAllOrders));
router.route('/:id').get(adminAuth, asyncHandler(orderController.getOrderById));

// Update order status
router.route('/:id/status').put(adminAuth, asyncHandler(orderController.updateOrderStatus));

module.exports = router;
