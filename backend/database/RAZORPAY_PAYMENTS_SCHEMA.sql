-- Razorpay payments schema migration
-- Run in a maintenance window and backup DB before running

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED,
  razorpay_order_id VARCHAR(100),
  razorpay_payment_id VARCHAR(100) UNIQUE,
  razorpay_signature VARCHAR(255),
  product_id INT,
  user_id INT,
  amount DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'INR',
  status VARCHAR(40) DEFAULT 'PENDING',
  gateway_response JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_razorpay_payment_id (razorpay_payment_id),
  INDEX idx_razorpay_order_id (razorpay_order_id),
  INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
