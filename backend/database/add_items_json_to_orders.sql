-- Add multi-item support to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items_json JSONB;
ALTER TABLE orders ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE orders ALTER COLUMN quantity DROP NOT NULL;
