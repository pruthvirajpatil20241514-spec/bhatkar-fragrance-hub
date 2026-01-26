-- ============================================================================
-- Bhatkar Fragrance Hub - MySQL Database Schema (v1.0)
-- Production-Grade with normalization, soft deletes, auditing, and indexes
-- ============================================================================

-- ============================================================================
-- 1. USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other'),
  
  -- Address info
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  
  -- Account status
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  
  -- Indexes
  INDEX idx_email (email),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  
  -- Permissions
  role ENUM('super_admin', 'admin', 'moderator') DEFAULT 'admin',
  permissions JSON,
  
  -- Status
  status ENUM('active', 'inactive') DEFAULT 'active',
  last_login TIMESTAMP NULL DEFAULT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  
  -- Indexes
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status),
  INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. PRODUCTS & CATEGORIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  image_url VARCHAR(255),
  display_order INT DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  
  INDEX idx_slug (slug),
  INDEX idx_status (status),
  INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Basic info
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  long_description TEXT,
  category_id INT NOT NULL,
  
  -- Pricing & inventory
  base_price DECIMAL(10, 2) NOT NULL,
  discounted_price DECIMAL(10, 2),
  discount_percentage INT,
  
  -- Images
  thumbnail_image VARCHAR(255),
  cover_image VARCHAR(255),
  
  -- Metadata
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INT DEFAULT 0,
  purchase_count INT DEFAULT 0,
  
  -- Fragrance profile
  top_notes VARCHAR(500),
  middle_notes VARCHAR(500),
  base_notes VARCHAR(500),
  
  -- Status
  status ENUM('active', 'draft', 'discontinued') DEFAULT 'draft',
  featured BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  
  -- Indexes
  INDEX idx_category_id (category_id),
  INDEX idx_slug (slug),
  INDEX idx_sku (sku),
  INDEX idx_status (status),
  INDEX idx_featured (featured),
  INDEX idx_created_at (created_at),
  INDEX idx_deleted_at (deleted_at),
  
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  alt_text VARCHAR(255),
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  
  INDEX idx_product_id (product_id),
  INDEX idx_deleted_at (deleted_at),
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_variants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  
  -- Size variant info
  size_ml INT NOT NULL,
  sku_variant VARCHAR(100) UNIQUE,
  price DECIMAL(10, 2) NOT NULL,
  discount_percentage INT,
  discounted_price DECIMAL(10, 2),
  
  -- Stock tracking
  stock_quantity INT DEFAULT 0,
  reorder_threshold INT DEFAULT 5,
  
  status ENUM('active', 'inactive') DEFAULT 'active',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  
  INDEX idx_product_id (product_id),
  INDEX idx_sku_variant (sku_variant),
  INDEX idx_deleted_at (deleted_at),
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_product_size (product_id, size_ml)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 3. INVENTORY MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS inventory (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_variant_id INT NOT NULL,
  
  -- Warehouse location
  warehouse_location VARCHAR(100),
  current_stock INT DEFAULT 0,
  reserved_stock INT DEFAULT 0,
  available_stock INT GENERATED ALWAYS AS (current_stock - reserved_stock) STORED,
  reorder_threshold INT DEFAULT 5,
  
  last_restocked_at TIMESTAMP NULL DEFAULT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_product_variant_id (product_variant_id),
  INDEX idx_available_stock (available_stock),
  
  FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_variant_id INT NOT NULL,
  
  -- Transaction
  transaction_type ENUM('restock', 'sale', 'damage', 'correction', 'return') NOT NULL,
  quantity_change INT NOT NULL,
  notes VARCHAR(500),
  
  -- Admin action
  admin_id INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_product_variant_id (product_variant_id),
  INDEX idx_transaction_type (transaction_type),
  INDEX idx_created_at (created_at),
  
  FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 4. ORDERS & PAYMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS carts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_variant_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  
  INDEX idx_user_id (user_id),
  INDEX idx_product_variant_id (product_variant_id),
  INDEX idx_deleted_at (deleted_at),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Shipping address
  shipping_address_line1 VARCHAR(255),
  shipping_address_line2 VARCHAR(255),
  shipping_city VARCHAR(100),
  shipping_state VARCHAR(100),
  shipping_postal_code VARCHAR(20),
  shipping_country VARCHAR(100),
  
  -- Billing address
  billing_address_line1 VARCHAR(255),
  billing_address_line2 VARCHAR(255),
  billing_city VARCHAR(100),
  billing_state VARCHAR(100),
  billing_postal_code VARCHAR(20),
  billing_country VARCHAR(100),
  
  -- Amounts
  subtotal DECIMAL(12, 2) NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL,
  
  -- Status
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  
  -- Tracking
  tracking_number VARCHAR(100),
  estimated_delivery_date DATE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  
  INDEX idx_user_id (user_id),
  INDEX idx_order_number (order_number),
  INDEX idx_status (status),
  INDEX idx_payment_status (payment_status),
  INDEX idx_created_at (created_at),
  INDEX idx_deleted_at (deleted_at),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_variant_id INT NOT NULL,
  
  -- Item details
  product_name VARCHAR(255) NOT NULL,
  size_ml INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  line_total DECIMAL(12, 2) NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_order_id (order_id),
  INDEX idx_product_variant_id (product_variant_id),
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  payment_method ENUM('card', 'upi', 'netbanking', 'wallet', 'cash_on_delivery') NOT NULL,
  
  -- Payment gateway
  gateway_transaction_id VARCHAR(255),
  gateway_response JSON,
  
  -- Status
  status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
  failure_reason VARCHAR(500),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_order_id (order_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS refunds (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_id INT NOT NULL,
  order_id INT NOT NULL,
  
  amount DECIMAL(12, 2) NOT NULL,
  refund_type ENUM('full', 'partial', 'store_credit', 'wallet') DEFAULT 'full',
  reason VARCHAR(500) NOT NULL,
  
  -- Quality check
  quality_check_status ENUM('pending', 'passed', 'failed') DEFAULT 'pending',
  quality_notes TEXT,
  
  -- Status
  status ENUM('pending', 'approved', 'processed', 'rejected') DEFAULT 'pending',
  rejection_reason VARCHAR(500),
  
  # Admin who processed
  processed_by INT,
  processed_at TIMESTAMP NULL DEFAULT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  
  INDEX idx_payment_id (payment_id),
  INDEX idx_order_id (order_id),
  INDEX idx_status (status),
  INDEX idx_deleted_at (deleted_at),
  
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE RESTRICT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
  FOREIGN KEY (processed_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 5. RETURNS & EXCHANGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS return_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  order_item_id INT NOT NULL,
  
  return_number VARCHAR(50) UNIQUE NOT NULL,
  return_type ENUM('return', 'exchange') NOT NULL,
  reason VARCHAR(500) NOT NULL,
  
  # Quality assessment
  quality_check_status ENUM('pending', 'passed', 'failed') DEFAULT 'pending',
  quality_notes TEXT,
  
  # Return status lifecycle
  status ENUM('pending', 'approved', 'shipped', 'received', 'rejected') DEFAULT 'pending',
  rejection_reason VARCHAR(500),
  
  # Refund/Exchange
  refund_amount DECIMAL(12, 2),
  refund_id INT,
  exchange_product_variant_id INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  
  INDEX idx_order_id (order_id),
  INDEX idx_return_type (return_type),
  INDEX idx_status (status),
  INDEX idx_deleted_at (deleted_at),
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
  FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE RESTRICT,
  FOREIGN KEY (refund_id) REFERENCES refunds(id) ON DELETE SET NULL,
  FOREIGN KEY (exchange_product_variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 6. REVIEWS & WISHLISTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  
  rating INT NOT NULL,
  title VARCHAR(255),
  review_text TEXT,
  
  # Moderation
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  
  # Helpful votes
  helpful_count INT DEFAULT 0,
  unhelpful_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  
  INDEX idx_product_id (product_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wishlists (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  
  INDEX idx_user_id (user_id),
  INDEX idx_product_id (product_id),
  INDEX idx_deleted_at (deleted_at),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_product (user_id, product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 7. PROMOTIONS & COUPONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS coupons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(500),
  
  # Discount details
  discount_type ENUM('percentage', 'fixed_amount') NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  minimum_order_amount DECIMAL(10, 2),
  maximum_discount DECIMAL(10, 2),
  
  # Usage limits
  max_uses INT,
  max_uses_per_customer INT DEFAULT 1,
  current_uses INT DEFAULT 0,
  
  # Date range
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  
  # Status
  status ENUM('active', 'inactive') DEFAULT 'active',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  
  INDEX idx_code (code),
  INDEX idx_status (status),
  INDEX idx_valid_from (valid_from),
  INDEX idx_valid_until (valid_until),
  
  UNIQUE KEY unique_code (code, deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS coupon_usage (
  id INT PRIMARY KEY AUTO_INCREMENT,
  coupon_id INT NOT NULL,
  user_id INT NOT NULL,
  order_id INT,
  
  discount_amount DECIMAL(10, 2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_coupon_id (coupon_id),
  INDEX idx_user_id (user_id),
  INDEX idx_order_id (order_id),
  
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE RESTRICT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 8. CMS & CONTENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS cms_pages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT,
  meta_description VARCHAR(500),
  meta_keywords VARCHAR(500),
  
  status ENUM('published', 'draft', 'archived') DEFAULT 'draft',
  published_at TIMESTAMP NULL DEFAULT NULL,
  
  created_by INT,
  updated_by INT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  
  INDEX idx_slug (slug),
  INDEX idx_status (status),
  INDEX idx_deleted_at (deleted_at),
  
  FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 9. AUDIT LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  # What changed
  entity_type VARCHAR(100) NOT NULL,
  entity_id INT NOT NULL,
  action ENUM('create', 'update', 'delete') NOT NULL,
  
  # Who made the change
  admin_id INT,
  user_id INT,
  
  # Changes
  old_values JSON,
  new_values JSON,
  changes_description TEXT,
  
  # Metadata
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_entity_type (entity_type),
  INDEX idx_entity_id (entity_id),
  INDEX idx_action (action),
  INDEX idx_admin_id (admin_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 10. SALES & ANALYTICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_sales (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date DATE NOT NULL,
  
  total_orders INT DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  total_customers INT DEFAULT 0,
  average_order_value DECIMAL(10, 2) DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_date (date),
  UNIQUE KEY unique_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_sales (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  product_variant_id INT NOT NULL,
  
  quantity_sold INT DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  
  last_sold_at TIMESTAMP NULL DEFAULT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_product_id (product_id),
  INDEX idx_quantity_sold (quantity_sold),
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_product_variant (product_id, product_variant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
