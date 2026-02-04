import mysql from 'mysql2/promise';

async function addProductImagesTable() {
  try {
    console.log('🔧 Connecting to Railway MySQL...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME
    });

    console.log('✅ Connected to database!\n');

    // Create product_images table
    console.log('📋 Creating product_images table...');
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS product_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        alt_text VARCHAR(255),
        image_order INT NOT NULL DEFAULT 0,
        is_thumbnail BOOLEAN DEFAULT FALSE,
        created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        INDEX idx_product_id (product_id),
        INDEX idx_image_order (product_id, image_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    await connection.query(createTableQuery);
    console.log('✅ product_images table created!\n');

    // Verify table structure
    console.log('🔍 Verifying table structure...');
    const [columns] = await connection.query('DESCRIBE product_images');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}${col.Null === 'NO' ? ' (NOT NULL)' : ''}`);
    });

    // Add sample images for existing products
    console.log('\n📸 Adding sample images for existing products...');
    const [products] = await connection.query('SELECT id FROM products LIMIT 1');
    
    if (products.length > 0) {
      const productId = products[0].id;
      const sampleImages = [
        { url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500', alt: 'Product Image 1', order: 1, thumbnail: true },
        { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500', alt: 'Product Image 2', order: 2, thumbnail: false },
        { url: 'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=500', alt: 'Product Image 3', order: 3, thumbnail: false },
        { url: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=500', alt: 'Product Image 4', order: 4, thumbnail: false }
      ];

      for (const img of sampleImages) {
        await connection.query(
          'INSERT INTO product_images (product_id, image_url, alt_text, image_order, is_thumbnail) VALUES (?, ?, ?, ?, ?)',
          [productId, img.url, img.alt, img.order, img.thumbnail]
        );
      }
      console.log('✅ Sample images added!\n');
    }

    // Verify images were created
    console.log('✅ Verifying product_images table exists...');
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'product_images'`,
      [process.env.DB_NAME]
    );

    if (tables.length > 0) {
      console.log('✅ product_images table verified!\n');
      const [imageCount] = await connection.query('SELECT COUNT(*) as count FROM product_images');
      console.log(`📊 Total images in database: ${imageCount[0].count}`);
    }

    console.log('\n✨ Database update successful!');
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addProductImagesTable();
