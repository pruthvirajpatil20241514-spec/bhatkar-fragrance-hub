#!/usr/bin/env node

/**
 * Test image upload and retrieval flow
 * This script tests if images are being saved to MySQL and returned in API responses
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API_BASE = 'https://bhatkar-fragrance-hub-1.onrender.com/api';
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN_HERE'; // Replace with actual token
const PRODUCT_ID = 2;

console.log('🧪 Testing Image Upload and Retrieval Flow\n');

// Test 1: Get product with images before upload
async function testGetProductWithImages() {
  try {
    console.log(`📍 Test 1: Fetching product ${PRODUCT_ID} with images...`);
    const response = await axios.get(`${API_BASE}/products/${PRODUCT_ID}/with-images`);
    
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   📊 Product: ${response.data.data.name}`);
    console.log(`   🖼️  Images returned: ${response.data.data.images?.length || 0}`);
    
    if (response.data.data.images?.length > 0) {
      console.log(`\n   First image details:`);
      const img = response.data.data.images[0];
      console.log(`   - ID: ${img.id}`);
      console.log(`   - URL: ${img.image_url?.substring(0, 80)}...`);
      console.log(`   - Format: ${img.image_format}`);
      console.log(`   - Alt Text: ${img.alt_text}`);
    }
    
    return response.data.data;
  } catch (error) {
    console.error(`   ❌ Error: ${error.response?.status} - ${error.message}`);
    return null;
  }
}

// Test 2: Check MySQL directly (if you have access)
async function testDatabaseQuery() {
  try {
    console.log(`\n📍 Test 2: Checking MySQL product_images table...`);
    
    // Try to hit a database check endpoint if available
    const response = await axios.get(`${API_BASE}/products/${PRODUCT_ID}/images`);
    
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   📊 Images in database: ${response.data.data?.length || 0}`);
    
    if (response.data.data?.length > 0) {
      console.log(`\n   Sample image from database:`);
      const img = response.data.data[0];
      console.log(`   - ID: ${img.id}`);
      console.log(`   - Product ID: ${img.product_id}`);
      console.log(`   - URL: ${img.image_url?.substring(0, 80)}...`);
      console.log(`   - Format: ${img.image_format}`);
    }
    
    return response.data.data;
  } catch (error) {
    console.error(`   ❌ Error: ${error.response?.status} - ${error.message}`);
    return null;
  }
}

// Test 3: Get all products with images
async function testGetAllProductsWithImages() {
  try {
    console.log(`\n📍 Test 3: Fetching all products with images...`);
    const response = await axios.get(`${API_BASE}/products/with-images/all`);
    
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   📊 Total products: ${response.data.data?.length || 0}`);
    
    // Count total images
    let totalImages = 0;
    let productsWithImages = 0;
    
    response.data.data?.forEach(product => {
      if (product.images?.length > 0) {
        productsWithImages++;
        totalImages += product.images.length;
      }
    });
    
    console.log(`   🖼️  Products with images: ${productsWithImages}`);
    console.log(`   🖼️  Total images: ${totalImages}`);
    
    // Show product 2
    const product2 = response.data.data?.find(p => p.id === PRODUCT_ID);
    if (product2) {
      console.log(`\n   Product ${PRODUCT_ID}: ${product2.name}`);
      console.log(`   - Images: ${product2.images?.length || 0}`);
      if (product2.images?.length > 0) {
        console.log(`   - First image URL: ${product2.images[0].image_url?.substring(0, 80)}...`);
      }
    }
    
    return response.data.data;
  } catch (error) {
    console.error(`   ❌ Error: ${error.response?.status} - ${error.message}`);
    return null;
  }
}

// Test 4: Verify Cloudinary URLs format
async function testCloudinaryURLFormat() {
  try {
    console.log(`\n📍 Test 4: Verifying Cloudinary URL format...`);
    const response = await axios.get(`${API_BASE}/products/${PRODUCT_ID}/with-images`);
    
    const images = response.data.data?.images || [];
    
    if (images.length === 0) {
      console.log(`   ⚠️  No images found for product ${PRODUCT_ID}`);
      return;
    }
    
    console.log(`   ✅ Found ${images.length} images`);
    
    images.forEach((img, idx) => {
      const isValidCloudinary = img.image_url?.includes('res.cloudinary.com');
      const status = isValidCloudinary ? '✅' : '❌';
      console.log(`   ${status} Image ${idx + 1}: ${img.image_url?.substring(0, 80)}...`);
      console.log(`      Format: ${img.image_format}`);
      
      // Try to access the image
      if (isValidCloudinary) {
        console.log(`      Type: Cloudinary URL (valid)`);
      } else {
        console.log(`      Type: Not a Cloudinary URL!`);
      }
    });
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
  }
}

// Main test runner
async function runTests() {
  try {
    console.log(`🌐 API Base: ${API_BASE}`);
    console.log(`👤 Testing as: Customer (no auth required)\n`);
    console.log('─'.repeat(80) + '\n');
    
    // Run tests
    await testGetProductWithImages();
    await testDatabaseQuery();
    await testGetAllProductsWithImages();
    await testCloudinaryURLFormat();
    
    console.log('\n' + '─'.repeat(80));
    console.log('\n✨ Test Summary:');
    console.log('   ✅ = Data is being returned correctly');
    console.log('   ❌ = Error or no data');
    console.log('   ⚠️  = Warning or empty result\n');
    
    console.log('📋 Troubleshooting:');
    console.log('   1. If all tests fail with 404: Backend might not be deployed yet');
    console.log('   2. If images are empty: No images have been uploaded yet');
    console.log('   3. If URLs are wrong format: Check if Cloudinary upload is working');
    console.log('   4. If database shows URLs but API doesn\'t: Check filter logic in model\n');
    
  } catch (error) {
    console.error('Test suite error:', error.message);
  }
}

// Run the tests
runTests();
