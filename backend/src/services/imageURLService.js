/**
 * Image URL Generation Service
 * ============================
 * Generates fresh signed URLs dynamically for storage API
 * Instead of storing expired signed URLs in database
 * 
 * Database stores ONLY object keys: products/filename.jpg
 * This service generates fresh signed URLs on each request
 */

const AWS = require('aws-sdk');
const { logger } = require('../utils/logger');

class ImageURLService {
  constructor() {
    // Configure S3-compatible storage (Railway Storage)
    this.s3 = new AWS.S3({
      endpoint: process.env.S3_ENDPOINT || 'https://s3.railway.app',
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY,
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
      region: process.env.S3_REGION || 'auto'
    });

    this.bucket = process.env.S3_BUCKET || 'bhatkar-images';
    this.urlExpiration = 604800; // 7 days in seconds
  }

  /**
   * Generate fresh signed URL for an image object key
   * 
   * @param {string} objectKey - S3 object key (e.g., "products/image.jpg")
   * @returns {string} - Fresh signed URL valid for 7 days
   */
  generateSignedUrl(objectKey) {
    if (!objectKey) {
      logger.warn('⚠️ generateSignedUrl called with empty objectKey');
      return null;
    }

    try {
      const signedUrl = this.s3.getSignedUrl('getObject', {
        Bucket: this.bucket,
        Key: objectKey,
        Expires: this.urlExpiration
      });

      logger.debug(`✅ Generated signed URL for: ${objectKey}`);
      return signedUrl;
    } catch (error) {
      logger.error(`❌ Error generating signed URL for ${objectKey}:`, error.message);
      return null;
    }
  }

  /**
   * Extract object key from full signed URL
   * 
   * If database has old signed URLs with full URLs,
   * this extracts just the object key
   * 
   * @param {string} signedUrlOrKey - Full URL or just object key
   * @returns {string} - Clean object key
   */
  extractObjectKey(signedUrlOrKey) {
    if (!signedUrlOrKey) return null;

    // Already just a key (e.g., "products/image.jpg")
    if (!signedUrlOrKey.includes('http')) {
      return signedUrlOrKey;
    }

    // Extract from URL (e.g., from "https://.../.../bucket/products/image.jpg")
    try {
      const parts = signedUrlOrKey.split('/');
      const objectKeyStartIdx = parts.findIndex(p => p === this.bucket) + 1;
      if (objectKeyStartIdx > 0) {
        return parts.slice(objectKeyStartIdx).join('/');
      }
    } catch (error) {
      logger.warn(`⚠️ Could not extract object key from URL: ${signedUrlOrKey}`);
    }

    return signedUrlOrKey; // Return as-is if can't parse
  }

  /**
   * Batch generate signed URLs for multiple images
   * 
   * @param {Array} images - Array of image objects with 'image_url' field
   * @returns {Array} - Same images with fresh signed URLs
   */
  generateSignedUrlsForImages(images) {
    if (!Array.isArray(images)) {
      return images;
    }

    return images.map(image => {
      if (!image || !image.image_url) {
        return image;
      }

      // Extract object key (handles both old URLs and fresh keys)
      const objectKey = this.extractObjectKey(image.image_url);
      
      // Generate fresh signed URL
      const freshUrl = this.generateSignedUrl(objectKey);

      return {
        ...image,
        image_url: freshUrl || image.image_url, // Fallback to original if generation fails
        _object_key: objectKey // For debugging
      };
    });
  }

  /**
   * Refresh signed URLs for a product's images
   * 
   * @param {Object} product - Product object with images array
   * @returns {Object} - Same product with fresh signed URLs
   */
  refreshProductImageUrls(product) {
    if (!product || !product.images) {
      return product;
    }

    return {
      ...product,
      images: this.generateSignedUrlsForImages(product.images)
    };
  }

  /**
   * Refresh signed URLs for multiple products
   * 
   * @param {Array} products - Array of products
   * @returns {Array} - Same products with fresh signed URLs
   */
  refreshProductsImageUrls(products) {
    if (!Array.isArray(products)) {
      return products;
    }

    return products.map(product => this.refreshProductImageUrls(product));
  }
}

module.exports = new ImageURLService();
