import mysql from 'mysql2/promise';

async function initializeDatabase() {
  try {
    console.log('🔧 Connecting to Railway MySQL...');
    const connection = await mysql.createConnection({
      host: 'shinkansen.proxy.rlwy.net',
      user: 'root',
      password: 'tpPfcKjqZpEqGgtLbykJYBsyturBALMV',
      port: 11735,
      database: 'railway'
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
    const [products] = await connection.query('SELECT id FROM products ORDER BY id LIMIT 5');
    
    if (products.length > 0) {
      const imageUrls = [
        'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop',
        'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=500&h=500&fit=crop'
      ];

      for (const product of products) {
        const productId = product.id;
        for (let i = 0; i < 4; i++) {
          const insertQuery = `
            INSERT INTO product_images (product_id, image_url, alt_text, image_order, is_thumbnail)
            VALUES (?, ?, ?, ?, ?)
          `;
          await connection.query(insertQuery, [
            productId,
            imageUrls[i],
            `Product image ${i + 1}`,
            i + 1,
            i === 0 ? true : false
          ]);
        }
      }
      console.log(`✅ Added 4 sample images to ${products.length} products!\n`);
    }

    // Verify data
    console.log('📊 Product images in database:');
    const [imageData] = await connection.query(`
      SELECT product_id, COUNT(*) as image_count 
      FROM product_images 
      GROUP BY product_id
    `);
    
    imageData.forEach(row => {
      console.log(`  Product ID ${row.product_id}: ${row.image_count} images`);
    });

    const [totalImages] = await connection.query('SELECT COUNT(*) as total FROM product_images');
    console.log(`\n✅ Total images in database: ${totalImages[0].total}`);

    await connection.end();
    console.log('\n✅ Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
