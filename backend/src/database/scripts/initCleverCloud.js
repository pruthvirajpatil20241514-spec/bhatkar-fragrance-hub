#!/usr/bin/env node

/**
 * Database Initialization Script for Clever Cloud MySQL
 * 
 * This script creates all necessary tables in your Clever Cloud database
 * Run locally: node backend/src/database/scripts/initCleverCloud.js
 */

require('dotenv/config');
const mysql = require('mysql2/promise');
const { logger } = require('../../utils/logger');

const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT
} = require('../../utils/secrets');

// SQL to create tables
const CREATE_USERS_TABLE = `
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firstname VARCHAR(50) NULL,
    lastname VARCHAR(50) NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_on TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
)
`;

const CREATE_PRODUCTS_TABLE = `
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category ENUM('Men', 'Women', 'Unisex') NOT NULL,
    concentration ENUM('EDP', 'EDT', 'Parfum') NOT NULL,
    description LONGTEXT NULL,
    stock INT DEFAULT 0,
    created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`;

async function initializeDatabase() {
  let connection;
  
  try {
    console.log('🔧 Connecting to Clever Cloud MySQL...');
    console.log(`   Host: ${DB_HOST}`);
    console.log(`   Database: ${DB_NAME}`);
    console.log(`   User: ${DB_USER}`);
    
    // Connect to database
    connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: DB_PORT,
      ssl: true
    });
    
    console.log('✅ Connected to database!\n');
    
    // Create users table
    console.log('📋 Creating users table...');
    await connection.execute(CREATE_USERS_TABLE);
    console.log('✅ Users table created!\n');
    
    // Create products table
    console.log('📋 Creating products table...');
    await connection.execute(CREATE_PRODUCTS_TABLE);
    console.log('✅ Products table created!\n');
    
    // Verify tables exist
    console.log('🔍 Verifying tables...');
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
      [DB_NAME]
    );
    
    console.log(`✅ Found ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`   - ${table.TABLE_NAME}`);
    });
    
    console.log('\n✨ Database initialization successful!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error during database initialization:\n');
    console.error('Error:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 This looks like a credentials error.');
      console.error('   Check your Clever Cloud database credentials in .env:\n');
      console.error(`   DB_HOST=${DB_HOST}`);
      console.error(`   DB_USER=${DB_USER}`);
      console.error(`   DB_NAME=${DB_NAME}`);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Could not connect to database.');
      console.error('   Make sure:');
      console.error('   - Clever Cloud database is online');
      console.error('   - Host/port are correct');
      console.error('   - Your machine can reach the host');
    }
    
    process.exit(1);
    
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run initialization
console.log('\n========================================');
console.log('  Clever Cloud Database Initialization');
console.log('========================================\n');

initializeDatabase();
