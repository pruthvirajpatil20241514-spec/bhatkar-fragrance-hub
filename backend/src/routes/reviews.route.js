const express = require('express');
const reviewsController = require('../controllers/reviews.controller');
const adminAuth = require('../middlewares/adminAuth');

const router = express.Router();

// Get all reviews for a product - PUBLIC
router.get('/product/:productId', reviewsController.getProductReviews);

// Get review statistics for a product - PUBLIC
router.get('/stats/:productId', reviewsController.getReviewStats);

// Get single review by ID - PUBLIC
router.get('/:reviewId', reviewsController.getReviewById);

// Create a new review - PUBLIC
router.post('/product/:productId', reviewsController.createReview);

// Delete a review - ADMIN ONLY
router.delete('/:reviewId', adminAuth, reviewsController.deleteReview);

module.exports = router;
