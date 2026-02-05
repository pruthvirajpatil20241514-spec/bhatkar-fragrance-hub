#!/usr/bin/env node

/**
 * Railway Object Storage Configuration
 * S3-compatible bucket setup for product images
 */

const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const railwayS3Config = {
  endpoint: process.env.S3_ENDPOINT || 'https://t3.storageapi.dev',
  region: 'auto',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true, // Required for S3-compatible services
};

// Initialize S3 client
const s3Client = new S3Client(railwayS3Config);

/**
 * Upload file to Railway Object Storage
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} fileName - Original file name
 * @returns {Promise<string>} - Public URL of uploaded file
 */
async function uploadToRailway(fileBuffer, fileName) {
  try {
    // Generate unique key to prevent name collisions
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const fileKey = `products/${timestamp}-${random}-${fileName}`;

    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: 'image/jpeg', // Can be enhanced to detect MIME type
      ACL: 'public-read', // Make file publicly readable
    });

    await s3Client.send(uploadCommand);

    // Construct public URL
    const publicUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${fileKey}`;
    console.log(`✅ Uploaded: ${publicUrl}`);
    
    return publicUrl;
  } catch (error) {
    console.error('❌ Upload error:', error.message);
    throw new Error(`Failed to upload to Railway Storage: ${error.message}`);
  }
}

/**
 * Delete file from Railway Object Storage
 * @param {string} fileUrl - Full URL of the file to delete
 * @returns {Promise<void>}
 */
async function deleteFromRailway(fileUrl) {
  try {
    // Extract file key from URL
    const urlParts = fileUrl.split(`${process.env.S3_BUCKET}/`);
    if (urlParts.length !== 2) {
      throw new Error('Invalid file URL format');
    }
    const fileKey = urlParts[1];

    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: fileKey,
    });

    await s3Client.send(deleteCommand);
    console.log(`✅ Deleted: ${fileUrl}`);
  } catch (error) {
    console.error('❌ Delete error:', error.message);
    throw new Error(`Failed to delete from Railway Storage: ${error.message}`);
  }
}

/**
 * Verify connection to Railway Object Storage
 * @returns {Promise<boolean>}
 */
async function verifyConnection() {
  try {
    const testKey = '.connection-test';
    const testBuffer = Buffer.from('test');

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: testKey,
        Body: testBuffer,
      })
    );

    // Clean up test file
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: testKey,
      })
    );

    console.log('✅ Successfully connected to Railway Object Storage');
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    return false;
  }
}

module.exports = {
  uploadToRailway,
  deleteFromRailway,
  verifyConnection,
  s3Client,
};
