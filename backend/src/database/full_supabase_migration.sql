-- ============================================================================
-- FULL POSTGRESQL SCHEMA FOR SUPABASE (PRODUCTION)
-- ============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    firstname VARCHAR(50) NULL,
    lastname VARCHAR(50) NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_on TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Products Table (With all optimized columns)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    shipping_cost DECIMAL(10, 2) DEFAULT 0,
    other_charges DECIMAL(10, 2) DEFAULT 0,
    quantity_ml INTEGER DEFAULT 100,
    quantity_unit VARCHAR(10) DEFAULT 'ml',
    category VARCHAR(20) NOT NULL CHECK (category IN ('Men', 'Women', 'Unisex')),
    concentration VARCHAR(20) NOT NULL CHECK (concentration IN ('EDP', 'EDT', 'Parfum')),
    description TEXT,
    stock INTEGER DEFAULT 0,
    is_best_seller BOOLEAN DEFAULT FALSE,
    is_luxury_product BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT FALSE,
    avg_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_on TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_on TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Ensure missing columns exist if table already exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='avg_rating') THEN
        ALTER TABLE products ADD COLUMN avg_rating DECIMAL(3, 2) DEFAULT 0.00;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='total_reviews') THEN
        ALTER TABLE products ADD COLUMN total_reviews INTEGER DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='views_count') THEN
        ALTER TABLE products ADD COLUMN views_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 3. Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_format VARCHAR(50),
    alt_text VARCHAR(255),
    image_order INTEGER DEFAULT 1,
    is_thumbnail BOOLEAN DEFAULT FALSE,
    created_on TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_on TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_id ON product_images(product_id);

-- 4. Product Variants Table
CREATE TABLE IF NOT EXISTS product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_name VARCHAR(255) NOT NULL,
    variant_value INTEGER NOT NULL,
    variant_unit VARCHAR(10) NOT NULL DEFAULT 'ml',
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(product_id, variant_value, variant_unit)
);

-- 5. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    reviewer_name VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    verified_purchase BOOLEAN DEFAULT FALSE,
    is_approved INTEGER DEFAULT 1,
    is_featured INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER DEFAULT 1 NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    razorpay_order_id VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) CHECK (status IN ('PENDING', 'PAID', 'FAILED')) DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    razorpay_payment_id VARCHAR(100) NOT NULL UNIQUE,
    razorpay_signature VARCHAR(255) NOT NULL,
    payment_status VARCHAR(20) CHECK (payment_status IN ('PENDING', 'SUCCESS', 'FAILED')) DEFAULT 'PENDING',
    gateway_response JSON,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- TIMESTAMP TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   IF (TG_TABLE_NAME = 'products' OR TG_TABLE_NAME = 'product_images') THEN
     NEW.updated_on = NOW();
   ELSE
     NEW.updated_at = NOW();
   END IF;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_products_modtime ON products;
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

DROP TRIGGER IF EXISTS update_product_images_modtime ON product_images;
CREATE TRIGGER update_product_images_modtime BEFORE UPDATE ON product_images FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

DROP TRIGGER IF EXISTS update_orders_modtime ON orders;
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();

DROP TRIGGER IF EXISTS update_payments_modtime ON payments;
CREATE TRIGGER update_payments_modtime BEFORE UPDATE ON payments FOR EACH ROW EXECUTE PROCEDURE update_timestamp_column();
