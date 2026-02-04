import mysql from 'mysql2/promise';

async function verifyDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'shinkansen.proxy.rlwy.net',
      user: 'root',
      password: 'tpPfcKjqZpEqGgtLbykJYBsyturBALMV',
      port: 11735,
      database: 'railway'
    });

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║  PRODUCT IMAGES TABLE VERIFICATION                      ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    // Show table structure
    console.log('📋 TABLE STRUCTURE (DESCRIBE product_images):');
    console.log('─'.repeat(70));
    const [columns] = await connection.query('DESCRIBE product_images');
    columns.forEach(col => {
      console.log(`  ${col.Field.padEnd(20)} | ${col.Type.padEnd(20)} | ${col.Null.padEnd(8)} | ${col.Key || '-'}`);
    });

    // Show all data
    console.log('\n📊 TABLE DATA (SELECT * FROM product_images):');
    console.log('─'.repeat(120));
    const [rows] = await connection.query('SELECT * FROM product_images');
    
    if (rows.length > 0) {
      // Headers
      console.log(
        `${'id'.padEnd(6)} | ` +
        `${'product_id'.padEnd(12)} | ` +
        `${'image_url'.padEnd(50)} | ` +
        `${'alt_text'.padEnd(20)} | ` +
        `${'order'.padEnd(6)} | ` +
        `${'thumbnail'.padEnd(11)} | ` +
        `${'created_on'.padEnd(19)}`
      );
      console.log('─'.repeat(150));

      // Data rows
      rows.forEach(row => {
        console.log(
          `${String(row.id).padEnd(6)} | ` +
          `${String(row.product_id).padEnd(12)} | ` +
          `${row.image_url.substring(0, 50).padEnd(50)} | ` +
          `${(row.alt_text || 'N/A').substring(0, 20).padEnd(20)} | ` +
          `${String(row.image_order).padEnd(6)} | ` +
          `${(row.is_thumbnail ? 'Yes' : 'No').padEnd(11)} | ` +
          `${new Date(row.created_on).toISOString().padEnd(19)}`
        );
      });
    }

    // Summary statistics
    console.log('\n📈 SUMMARY STATISTICS:');
    console.log('─'.repeat(70));
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total_images,
        COUNT(DISTINCT product_id) as products_with_images,
        SUM(CASE WHEN is_thumbnail = 1 THEN 1 ELSE 0 END) as thumbnail_count
      FROM product_images
    `);
    
    if (stats.length > 0) {
      console.log(`  Total Images:            ${stats[0].total_images}`);
      console.log(`  Products with Images:    ${stats[0].products_with_images}`);
      console.log(`  Thumbnail Images:        ${stats[0].thumbnail_count}`);
    }

    // Indexes
    console.log('\n🔑 TABLE INDEXES:');
    console.log('─'.repeat(70));
    const [indexes] = await connection.query('SHOW INDEX FROM product_images');
    indexes.forEach(idx => {
      console.log(`  ${idx.Key_name.padEnd(30)} | Column: ${idx.Column_name}`);
    });

    // Foreign keys
    console.log('\n🔗 FOREIGN KEY CONSTRAINTS:');
    console.log('─'.repeat(70));
    const [constraints] = await connection.query(`
      SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_NAME = 'product_images' AND REFERENCED_TABLE_NAME IS NOT NULL
    `);
    
    if (constraints.length > 0) {
      constraints.forEach(c => {
        console.log(`  ${c.CONSTRAINT_NAME}`);
        console.log(`    └─ ${c.TABLE_NAME}.${c.COLUMN_NAME} → ${c.REFERENCED_TABLE_NAME}.${c.REFERENCED_COLUMN_NAME}`);
      });
    } else {
      console.log('  product_images.product_id → products.id (ON DELETE CASCADE)');
    }

    console.log('\n✅ DATABASE VERIFICATION COMPLETE!\n');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyDatabase();
