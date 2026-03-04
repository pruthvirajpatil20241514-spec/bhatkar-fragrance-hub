-- Migration: Add missing columns to products table
-- Run this on your production database to fix the 500 error

-- =====================================================
-- IMPORTANT: Run these commands ONE BY ONE in phpMyAdmin
-- =====================================================

-- Step 1: Check current columns
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'products' AND TABLE_SCHEMA = DATABASE()
ORDER BY ORDINAL_POSITION;

-- Step 2: Add quantity_ml column (ignore error if it already exists)
ALTER TABLE products ADD COLUMN quantity_ml INT DEFAULT 100;

-- Step 3: Add quantity_unit column (ignore error if it already exists)  
ALTER TABLE products ADD COLUMN quantity_unit VARCHAR(10) DEFAULT 'ml';

-- Step 4: Add is_best_seller column (ignore error if it already exists)
ALTER TABLE products ADD COLUMN is_best_seller BOOLEAN DEFAULT 0;

-- Step 5: Add is_luxury_product column (ignore error if it already exists)
ALTER TABLE products ADD COLUMN is_luxury_product BOOLEAN DEFAULT 0;

-- Step 6: Verify columns were added
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'products' 
AND COLUMN_NAME IN ('quantity_ml', 'quantity_unit', 'is_best_seller', 'is_luxury_product')
AND TABLE_SCHEMA = DATABASE();
