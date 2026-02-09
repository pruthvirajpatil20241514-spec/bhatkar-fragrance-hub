// Reviews database queries

const getProductReviews = `
SELECT id, product_id, reviewer_name, rating, review_text, verified_purchase, created_at
FROM reviews
WHERE product_id = ? AND is_approved = 1
ORDER BY created_at DESC
`;

const getProductReviewStats = `
SELECT 
  COUNT(*) as total_reviews,
  AVG(rating) as average_rating,
  SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
  SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
  SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
  SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
  SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
FROM reviews
WHERE product_id = ? AND is_approved = 1
`;

const createReview = `
INSERT INTO reviews (product_id, reviewer_name, rating, review_text, verified_purchase, is_approved)
VALUES (?, ?, ?, ?, ?, ?)
`;

const getAllProductReviews = `
SELECT id, product_id, reviewer_name, rating, review_text, verified_purchase, is_approved, created_at
FROM reviews
WHERE product_id = ?
ORDER BY created_at DESC
`;

const approveReview = `
UPDATE reviews SET is_approved = 1 WHERE id = ?
`;

const rejectReview = `
UPDATE reviews SET is_approved = 0 WHERE id = ?
`;

const deleteReview = `
DELETE FROM reviews WHERE id = ?
`;

module.exports = {
  getProductReviews,
  getProductReviewStats,
  createReview,
  getAllProductReviews,
  approveReview,
  rejectReview,
  deleteReview
};
