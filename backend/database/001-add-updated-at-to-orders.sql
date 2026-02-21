-- Migration: Add updated_at to orders (idempotent where supported)
-- MySQL 8.0.22+ supports IF NOT EXISTS for ADD COLUMN
-- If your MySQL version doesn't support IF NOT EXISTS, run the SELECT-based check below.

-- Preferred (MySQL 8.0.22+):
ALTER TABLE `orders`
  ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Fallback (run only if ALTER ... IF NOT EXISTS is not supported):
-- SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'updated_at';
-- If result is 0, run:
-- ALTER TABLE `orders` ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
