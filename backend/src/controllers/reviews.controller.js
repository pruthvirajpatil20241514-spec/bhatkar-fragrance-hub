const { asyncHandler } = require('../middlewares/asyncHandler');
const reviewsQueries = require('../database/reviews.queries');
const logger = require('../utils/logger');

// Get all reviews for a product
exports.getProductReviews = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    if (!productId) {
        return res.status(400).send({
            status: 'error',
            message: 'Product ID is required'
        });
    }

    const reviews = await reviewsQueries.getProductReviews(productId);
    logger.info(`Retrieved reviews for product: ${productId}`);

    return res.status(200).send({
        status: 'success',
        data: reviews
    });
});

// Get review statistics for a product
exports.getReviewStats = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    if (!productId) {
        return res.status(400).send({
            status: 'error',
            message: 'Product ID is required'
        });
    }

    const stats = await reviewsQueries.getReviewStats(productId);
    logger.info(`Retrieved review stats for product: ${productId}`);

    return res.status(200).send({
        status: 'success',
        data: stats
    });
});

// Create a new review
exports.createReview = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { reviewer_name, rating, review_text, verified_purchase } = req.body;

    if (!productId || !reviewer_name || !rating || !review_text) {
        return res.status(400).send({
            status: 'error',
            message: 'Product ID, reviewer name, rating, and review text are required'
        });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).send({
            status: 'error',
            message: 'Rating must be between 1 and 5'
        });
    }

    const reviewData = {
        product_id: productId,
        reviewer_name,
        rating,
        review_text,
        verified_purchase: verified_purchase || false
    };

    const review = await reviewsQueries.createReview(reviewData);
    logger.info(`Review created for product: ${productId}`);

    return res.status(201).send({
        status: 'success',
        message: 'Review created successfully',
        data: review
    });
});

// Delete a review (admin only)
exports.deleteReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;

    if (!reviewId) {
        return res.status(400).send({
            status: 'error',
            message: 'Review ID is required'
        });
    }

    const result = await reviewsQueries.deleteReview(reviewId);
    logger.info(`Review deleted: ${reviewId}`);

    return res.status(200).send({
        status: 'success',
        message: 'Review deleted successfully',
        data: result
    });
});

// Get review by ID
exports.getReviewById = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;

    if (!reviewId) {
        return res.status(400).send({
            status: 'error',
            message: 'Review ID is required'
        });
    }

    const review = await reviewsQueries.getReviewById(reviewId);

    if (!review) {
        return res.status(404).send({
            status: 'error',
            message: 'Review not found'
        });
    }

    logger.info(`Retrieved review: ${reviewId}`);
    return res.status(200).send({
        status: 'success',
        data: review
    });
});
