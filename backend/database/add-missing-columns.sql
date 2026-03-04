-- Migration: Add missing columns to products table
-- Run this on your production database to fix the 500 error

-- Check current columns first
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'products' AND TABLE_SCHEMA = DATABASE()
ORDER BY ORDINAL_POSITION;

-- Add quantity_ml column if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity_ml INT DEFAULT 100;

-- Add quantity_unit column if it doesn't exist  
ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity_unit VARCHAR(10) DEFAULT 'ml';

-- Add is_best_seller column if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT 0;

-- Add is_luxury_product column if it doesn't exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_luxury_product BOOLEAN DEFAULT 0;

-- Verify columns were added
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'products' 
AND COLUMN_NAME IN ('quantity_ml', 'quantity_unit', 'is_best_seller', 'is_luxury_product')
AND TABLE_SCHEMA = DATABASE();
