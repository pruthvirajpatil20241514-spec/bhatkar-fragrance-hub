-- ============================================================================
-- Seed Data for Testing
-- ============================================================================

-- Insert admin user (password: admin123 - hashed with bcrypt)
INSERT INTO admins (email, password_hash, first_name, last_name, role, status) VALUES
('admin@bhatkar.com', '$2b$10$3/SXxdR0wHJ/7w6vqNxg.uNQSRBCbP8dxGklnPQNfL6ZhKZIsvVcC', 'Admin', 'User', 'super_admin', 'active');

-- Insert regular user (password: user123 - hashed with bcrypt)
INSERT INTO users (email, password_hash, first_name, last_name, status, email_verified) VALUES
('customer@example.com', '$2b$10$kfKqQhk0qLKE8bWnJmkBXOdqNLQN6n4iJvVYJ7PFHW8TZIzN8AHXq', 'John', 'Doe', 'active', TRUE);

-- Insert categories
INSERT INTO categories (name, slug, description, icon, display_order, status) VALUES
('Luxury Perfumes', 'luxury-perfumes', 'Premium and exclusive fragrances', '👑', 1, 'active'),
('Eau de Toilette', 'eau-de-toilette', 'Light and fresh fragrances', '💨', 2, 'active'),
('Eau de Parfum', 'eau-de-parfum', 'Intense and long-lasting fragrances', '✨', 3, 'active'),
('Niche Brands', 'niche-brands', 'Handpicked artisanal fragrances', '🎨', 4, 'active'),
('Unisex', 'unisex', 'Gender-neutral fragrances', '🌈', 5, 'active');

-- Insert one sample product for testing
INSERT INTO products (name, slug, sku, description, long_description, category_id, base_price, discounted_price, discount_percentage, top_notes, middle_notes, base_notes, status, featured, thumbnail_image, cover_image) VALUES
(
  'Royal Oud Noir',
  'royal-oud-noir',
  'RON-001',
  'An exquisite blend of royal oud with dark spices',
  'Royal Oud Noir is a masterpiece of olfactory artistry. This luxurious fragrance combines the finest oud from Southeast Asia with rare spices from the Orient. Perfect for those who appreciate sophisticated and mysterious aromas.',
  1,
  8999.00,
  7999.00,
  11,
  'Bergamot, Lemon, Black Pepper',
  'Oud, Sandalwood, Amber',
  'Musk, Vanilla, Cedarwood',
  'active',
  TRUE,
  'https://images.unsplash.com/photo-1595959183225-4cd4051dec5f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1595959183225-4cd4051dec5f?w=1200&h=600&fit=crop'
);

-- Insert product images
INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary) VALUES
(1, 'https://images.unsplash.com/photo-1595959183225-4cd4051dec5f?w=400&h=400&fit=crop', 'Royal Oud Noir Main', 1, TRUE),
(1, 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop', 'Royal Oud Noir Side View', 2, FALSE),
(1, 'https://images.unsplash.com/photo-1609208530929-d23ed61cbdc4?w=400&h=400&fit=crop', 'Royal Oud Noir Detail', 3, FALSE);

-- Insert product variants (sizes: 30ml, 50ml, 100ml)
INSERT INTO product_variants (product_id, size_ml, sku_variant, price, discount_percentage, discounted_price, stock_quantity, reorder_threshold) VALUES
(1, 30, 'RON-001-30ML', 3999.00, 11, 3559.00, 15, 5),
(1, 50, 'RON-001-50ML', 5999.00, 10, 5399.00, 20, 5),
(1, 100, 'RON-001-100ML', 8999.00, 11, 7999.00, 25, 5);

-- Insert inventory for each variant
INSERT INTO inventory (product_variant_id, warehouse_location, current_stock, reserved_stock, reorder_threshold) VALUES
(1, 'Main Warehouse - Shelf A1', 15, 2, 5),
(2, 'Main Warehouse - Shelf A2', 20, 3, 5),
(3, 'Main Warehouse - Shelf A3', 25, 4, 5);

-- Insert a sample CMS page
INSERT INTO cms_pages (slug, title, content, meta_description, status, created_by) VALUES
(
  'about-us',
  'About Bhatkar Fragrances',
  '<h1>About Bhatkar Fragrances</h1><p>We are India\'s premier fragrance house, curating the finest perfumes from around the world.</p>',
  'Learn about Bhatkar Fragrances - India\'s leading perfume retailer',
  'published',
  1
);

-- Insert sample coupon
INSERT INTO coupons (code, description, discount_type, discount_value, minimum_order_amount, valid_from, valid_until, status) VALUES
('WELCOME10', 'Welcome discount - 10% off', 'percentage', 10, 0, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'active'),
('SUMMER500', 'Summer special - ₹500 off', 'fixed_amount', 500, 5000, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'active');
