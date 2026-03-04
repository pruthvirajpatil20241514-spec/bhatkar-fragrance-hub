#!/usr/bin/env node

/**
 * Verify images in MySQL database
 * Tests the direct database connection to check if image URLs are being stored
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fragrance_hub',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

console.log('🗄️  Database Connection Test\n');
console.log('Connection Config (sensitive data hidden):');
console.log(`   Host: ${config.host}`);
console.log(`   User: ${config.user}`);
console.log(`   Database: ${config.database}\n`);

async function testDatabaseConnection() {
  try {
    console.log('📍 Connecting to MySQL...');
    
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected to MySQL\n');
    
    // Test 1: Check if product_images table exists
    console.log('📍 Test 1: Checking product_images table...');
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'product_images'`,
      [config.database]
    );
    
    if (tables.length > 0) {
      console.log('✅ product_images table exists\n');
    } else {
      console.log('❌ product_images table NOT found\n');
      await connection.end();
      return;
    }
    
    // Test 2: Get table structure
    console.log('📍 Test 2: Checking table structure...');
    const [columns] = await connection.query('DESCRIBE product_images');
    
    console.log(`✅ Table has ${columns.length} columns:`);
    columns.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type})${col.Null === 'NO' ? ' NOT NULL' : ''}`);
    });
    console.log();
    
    // Test 3: Count total images
    console.log('📍 Test 3: Counting total images...');
    const [countResult] = await connection.query(
      'SELECT COUNT(*) as total FROM product_images'
    );
    const totalImages = countResult[0].total;
    console.log(`✅ Total images in database: ${totalImages}\n`);
    
    if (totalImages === 0) {
      console.log('⚠️  No images found. Try uploading images first.\n');
      await connection.end();
      return;
    }
    
    // Test 4: Show images by product
    console.log('📍 Test 4: Images by product...');
    const [productImages] = await connection.query(
      `SELECT product_id, COUNT(*) as image_count 
       FROM product_images 
       GROUP BY product_id 
       ORDER BY product_id`
    );
    
    productImages.forEach(row => {
      console.log(`   Product ${row.product_id}: ${row.image_count} images`);
    });
    console.log();
    
    // Test 5: Show sample images
    console.log('📍 Test 5: Sample images with URLs...');
    const [sampleImages] = await connection.query(
      `SELECT 
         id, product_id, image_url, image_format, 
         alt_text, image_order, is_thumbnail,
         created_on
       FROM product_images 
       LIMIT 3`
    );
    
    sampleImages.forEach((img, idx) => {
      console.log(`\n   Image ${idx + 1}:`);
      console.log(`   - ID: ${img.id}`);
      console.log(`   - Product ID: ${img.product_id}`);
      console.log(`   - URL: ${img.image_url?.substring(0, 90)}...`);
      console.log(`   - Format: ${img.image_format}`);
      console.log(`   - Alt: ${img.alt_text}`);
      console.log(`   - Order: ${img.image_order}`);
      console.log(`   - Thumbnail: ${img.is_thumbnail ? 'Yes' : 'No'}`);
    });
    console.log();
    
    // Test 6: Validate Cloudinary URLs
    console.log('📍 Test 6: Validating URL formats...');
    const [allImages] = await connection.query(
      'SELECT id, image_url FROM product_images LIMIT 10'
    );
    
    let cloudinaryCount = 0;
    let otherCount = 0;
    let nullCount = 0;
    
    allImages.forEach(img => {
      if (!img.image_url) {
        nullCount++;
      } else if (img.image_url.includes('res.cloudinary.com')) {
        cloudinaryCount++;
      } else {
        otherCount++;
      }
    });
    
    console.log(`✅ URL Format Analysis:`);
    console.log(`   - Cloudinary URLs: ${cloudinaryCount}`);
    console.log(`   - Other URLs: ${otherCount}`);
    console.log(`   - NULL URLs: ${nullCount}`);
    console.log();
    
    // Test 7: Check for null or empty URLs
    console.log('📍 Test 7: Checking for NULL or empty URLs...');
    const [nullCheck] = await connection.query(
      `SELECT COUNT(*) as null_count 
       FROM product_images 
       WHERE image_url IS NULL OR image_url = ''`
    );
    
    const nullImageCount = nullCheck[0].null_count;
    if (nullImageCount === 0) {
      console.log(`✅ All images have valid URLs\n`);
    } else {
      console.log(`⚠️  Found ${nullImageCount} images with NULL/empty URLs\n`);
    }
    
    // Test 8: Get product with images JSON output
    console.log('📍 Test 8: Full product with images (product ID 2)...');
    const [productWithImages] = await connection.query(
      `SELECT 
         p.id, p.name, p.price, 
         JSON_ARRAYAGG(
           JSON_OBJECT(
             'id', pi.id,
             'image_url', pi.image_url,
             'image_format', pi.image_format,
             'alt_text', pi.alt_text,
             'image_order', pi.image_order,
             'is_thumbnail', pi.is_thumbnail
           )
         ) as images
       FROM products p
       LEFT JOIN product_images pi ON p.id = pi.product_id
       WHERE p.id = 2
       GROUP BY p.id`
    );
    
    if (productWithImages.length > 0) {
      const product = productWithImages[0];
      console.log(`✅ Product: ${product.name}`);
      
      let images = [];
      if (typeof product.images === 'string') {
        images = JSON.parse(product.images);
      } else {
        images = product.images;
      }
      
      images = images.filter(img => img?.image_url);
      
      console.log(`✅ Images returned: ${images.length}`);
      
      if (images.length > 0) {
        images.forEach((img, idx) => {
          console.log(`   Image ${idx + 1}: ${img.image_url?.substring(0, 80)}...`);
        });
      }
    } else {
      console.log('⚠️  Product not found');
    }
    console.log();
    
    // Cleanup
    await connection.end();
    console.log('✅ Connection closed\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('   1. Make sure .env file has correct DB credentials');
    console.error('   2. Ensure MySQL server is running');
    console.error('   3. Check DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in .env');
    console.error('   4. Run: npm run db:check\n');
  }
}

testDatabaseConnection();
