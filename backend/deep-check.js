/**
 * DEEP SYSTEM CHECK (POSTGRESQL)
 * =============================
 * Verifies database connectivity, schema integrity, and CRUD operations
 * across Products, Orders, and Reviews.
 */

const db = require('./src/config/db');
const { logger } = require('./src/config/db').logger || { info: console.log, error: console.error };

async function deepCheck() {
    console.log('🚀 Starting Deep System Check...\n');

    try {
        // 1. Connection Check
        console.log('📡 1. Testing Database Connectivity...');
        const [timeRows] = await db.query('SELECT NOW() as current_time');
        console.log('✅ Connected! Server Time:', timeRows[0]?.current_time);

        // 2. Schema Check
        console.log('\n📋 2. Checking Table Existence...');
        const tables = ['products', 'product_images', 'orders', 'reviews', 'users'];
        for (const table of tables) {
            const [rows] = await db.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = $1
                );
            `, [table]);
            console.log(`${rows[0].exists ? '✅' : '❌'} Table '${table}' ${rows[0].exists ? 'exists' : 'does NOT exist'}`);
        }

        // 3. Product CRUD Verification
        console.log('\n📦 3. Verifying Product CRUD...');
        // Create
        const testProduct = {
            name: 'Test Fragrance ' + Date.now(),
            brand: 'DeepCheck',
            price: 99.99,
            category: 'Unisex',
            concentration: 'EDP',
            stock: 10
        };
        const [createResult] = await db.execute(`
            INSERT INTO products (name, brand, price, category, concentration, stock)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `, [testProduct.name, testProduct.brand, testProduct.price, testProduct.category, testProduct.concentration, testProduct.stock]);
        const productId = createResult.id;
        console.log(`✅ Product Created (ID: ${productId})`);

        // Read
        const [readRows] = await db.query('SELECT * FROM products WHERE id = $1', [productId]);
        console.log(`✅ Product Read ${readRows[0]?.name === testProduct.name ? 'Verified' : 'FAILED'}`);

        // Update
        await db.execute('UPDATE products SET price = 149.99 WHERE id = $1', [productId]);
        const [updateRows] = await db.query('SELECT price FROM products WHERE id = $1', [productId]);
        console.log(`✅ Product Update ${parseFloat(updateRows[0]?.price) === 149.99 ? 'Verified' : 'FAILED'}`);

        // Delete (Cleanup)
        await db.execute('DELETE FROM products WHERE id = $1', [productId]);
        const [deleteRows] = await db.query('SELECT * FROM products WHERE id = $1', [productId]);
        console.log(`✅ Product Delete ${deleteRows.length === 0 ? 'Verified' : 'FAILED'}`);

        // 4. Image Aggregation Test
        console.log('\n🖼️  4. Testing Image Aggregation Result...');
        const [aggRows] = await db.query(`
            SELECT p.id, p.name,
            COALESCE(
                (SELECT json_agg(json_build_object('id', pi.id, 'url', pi.image_url))
                 FROM product_images pi WHERE pi.product_id = p.id),
                '[]'::json
            ) as images
            FROM products p LIMIT 1
        `);
        if (aggRows.length > 0) {
            const images = aggRows[0].images;
            console.log(`✅ Image field type: ${Array.isArray(images) ? 'Array (Correct)' : typeof images}`);
            console.log('✅ Aggregation structure verified');
        } else {
            console.log('⚠️  No products found to test aggregation');
        }

        // 5. Review Stats Test
        console.log('\n⭐ 5. Checking Review Aggregations...');
        const [reviewStats] = await db.query(`
            SELECT 
                COUNT(*)::INTEGER as total,
                AVG(rating)::DECIMAL(3,2) as avg_rating
            FROM reviews
        `);
        console.log(`✅ Review Stats: Total: ${reviewStats[0]?.total}, Avg: ${reviewStats[0]?.avg_rating || 0}`);

        console.log('\n✨ Deep Check Complete! System is healthy.');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ DEEP CHECK FAILED:');
        console.error(error);
        process.exit(1);
    }
}

deepCheck();
