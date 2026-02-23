// Quick script to check and add missing columns to products table
// Run with: node check-columns.js

require('dotenv/config');
const db = require('./src/config/db.config');

async function checkAndAddColumns() {
    try {
        console.log('🔄 Checking database columns...');
        
        // Check what columns exist
        const [columns] = await db.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'products' AND TABLE_SCHEMA = DATABASE()
        `);
        
        const columnNames = columns.map(c => c.COLUMN_NAME);
        console.log('Existing columns:', columnNames);
        
        // Add missing columns
        const requiredColumns = [
            { name: 'quantity_ml', sql: 'ALTER TABLE products ADD COLUMN quantity_ml INT DEFAULT 100 AFTER price' },
            { name: 'quantity_unit', sql: 'ALTER TABLE products ADD COLUMN quantity_unit VARCHAR(10) DEFAULT \'ml\' AFTER quantity_ml' },
            { name: 'is_best_seller', sql: 'ALTER TABLE products ADD COLUMN is_best_seller BOOLEAN DEFAULT 0' },
            { name: 'is_luxury_product', sql: 'ALTER TABLE products ADD COLUMN is_luxury_product BOOLEAN DEFAULT 0' }
        ];
        
        for (const col of requiredColumns) {
            if (!columnNames.includes(col.name)) {
                console.log(`➕ Adding column: ${col.name}`);
                try {
                    await db.query(col.sql);
                    console.log(`✅ Added column: ${col.name}`);
                } catch (e) {
                    console.log(`⚠️  Error adding ${col.name}: ${e.message}`);
                }
            } else {
                console.log(`✅ Column exists: ${col.name}`);
            }
        }
        
        console.log('✅ Database columns check complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkAndAddColumns();
