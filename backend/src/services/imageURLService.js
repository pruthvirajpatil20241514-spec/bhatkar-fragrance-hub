/**
 * Image URL Generation Service
 * ============================
 * Generates fresh signed URLs dynamically for storage API
 * Instead of storing expired signed URLs in database
 * 
 * Database stores ONLY object keys: products/filename.jpg
 * This service generates fresh signed URLs on each request
 * 
 * FIXED: Now properly handles external URLs (Unsplash, etc.)
 *        vs S3-stored images without double-encoding
 */

const { logger } = require('../utils/logger');

let AWS;
try {
  AWS = require('aws-sdk');
} catch (err) {
  // aws-sdk is optional in deployments that use v3 modular SDK.
  // Fall back gracefully if it's not installed.
  logger && logger.warn && logger.warn('aws-sdk not available — falling back to default image behavior');
  AWS = null;
}

class ImageURLService {
  constructor() {
    this.enabled = false;
    this.s3 = null;
    this.bucket = process.env.S3_BUCKET || 'bhatkar-images';
    this.urlExpiration = Number(process.env.S3_URL_EXPIRES_SEC || 604800); // default 7 days
    this.defaultImageUrl = process.env.DEFAULT_PRODUCT_IMAGE_URL || '/uploads/default-product.png';
    
    // Base storage URL for direct access (no signed URLs needed for public reads)
    this.baseStorageUrl = process.env.S3_ENDPOINT 
      ? `${process.env.S3_ENDPOINT}/${this.bucket}`
      : `https://t3.storageapi.dev/${this.bucket}`;

    // Cloudinary configuration
    this.cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
    this.isCloudinaryConfigured = !!(this.cloudinaryCloudName && process.env.CLOUDINARY_API_KEY);

    // Initialize S3 client only if aws-sdk is present and credentials set
    try {
      if (AWS && process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY && process.env.S3_SECRET_KEY) {
        this.s3 = new AWS.S3({
          endpoint: process.env.S3_ENDPOINT,
          accessKeyId: process.env.S3_ACCESS_KEY,
          secretAccessKey: process.env.S3_SECRET_KEY,
          s3ForcePathStyle: true,
          signatureVersion: 'v4',
          region: process.env.S3_REGION || 'auto',
        });
        this.enabled = true;
        logger && logger.info && logger.info('ImageURLService: S3 client initialized');
      } else if (AWS) {
        // aws-sdk installed but env not configured
        logger && logger.warn && logger.warn('ImageURLService: aws-sdk present but S3 env vars missing — using fallback URLs');
      }
    } catch (err) {
      // Do not let S3 initialization crash the server
      logger && logger.error && logger.error('ImageURLService: S3 initialization failed:', err && err.message ? err.message : err);
      this.s3 = null;
      this.enabled = false;
    }
  }

  /**
   * Check if URL is an external URL (not stored in S3)
   * External URLs should be returned as-is without signed URL generation
   * 
   * @param {string} url - URL to check
   * @returns {boolean} - True if external URL
   */
  isExternalUrl(url) {
    if (!url) return false;
    // Check for common external image hosts
    const externalHosts = [
      'unsplash.com',
      'pexels.com',
      'pixabay.com',
      'images.unsplash.com',
      'plus.unsplash.com',
      'randomuser.me',
      'googleusercontent.com',
      'fbcdn.net',
      'instagram.com',
      'cloudflare-ipfs.com'
    ];
    
    const lowerUrl = url.toLowerCase();
    return externalHosts.some(host => lowerUrl.includes(host));
  }

  /**
   * Generate FAST direct URL for an image (no signing - for list views)
   * Returns simple URL: BASE_STORAGE_URL + objectKey
   * Much faster than signed URLs for bulk requests
   * 
   * @param {string} objectKey - S3 object key (e.g., "products/image.jpg")
   * @returns {string} - Direct URL
   */
  generateDirectUrl(objectKey) {
    if (!objectKey) {
      return this.defaultImageUrl;
    }
    
    // Already a full URL, return as-is
    if (objectKey.includes('http')) {
      return objectKey;
    }
    
    // Return direct URL: baseStorageUrl + key
    return `${this.baseStorageUrl}/${objectKey}`;
  }

  /**
   * Generate Cloudinary URL from public_id
   * Cloudinary public_id is stored in database, this generates the full URL
   * 
   * @param {string} publicId - Cloudinary public_id (e.g., "bhatkar-fragrance-hub/products/image.jpg")
   * @returns {string} - Full Cloudinary URL
   */
  generateCloudinaryUrl(publicId) {
    if (!publicId) {
      return this.defaultImageUrl;
    }
    
    // Already a full URL, return as-is
    if (publicId.includes('http')) {
      return publicId;
    }
    
    // Generate Cloudinary URL from public_id
    if (this.isCloudinaryConfigured && this.cloudinaryCloudName) {
      return `https://res.cloudinary.com/${this.cloudinaryCloudName}/image/upload/${publicId}`;
    }
    
    // Fallback - return as-is
    return publicId;
  }

  /**
   * Check if the image key is a Cloudinary public_id
   * 
   * @param {string} key - Image key or URL
   * @returns {boolean} - True if Cloudinary public_id
   */
  isCloudinaryKey(key) {
    if (!key) return false;
    // Cloudinary public_ids typically start with folder name like "bhatkar-fragrance-hub/"
    return key.startsWith('bhatkar-fragrance-hub/') || 
           key.startsWith('bhatkar-fragrance-hub\\');
  }

  /**
   * Generate fresh signed URL for an image object key
   * Use ONLY for private/signed content - slower but authenticated
   * 
   * @param {string} objectKey - S3 object key (e.g., "products/image.jpg")
   * @returns {string} - Fresh signed URL valid for 7 days
   */
  generateSignedUrl(objectKey) {
    if (!objectKey) {
      logger.warn('⚠️ generateSignedUrl called with empty objectKey');
      return this.defaultImageUrl;
    }
    
    // If S3 is not available, return default image URL or the original key as best-effort
    if (!this.enabled || !this.s3) {
      logger && logger.debug && logger.debug('ImageURLService: S3 disabled — returning default image for', objectKey);
      return this.defaultImageUrl;
    }

    try {
      // CRITICAL: Decode the key first to handle double-encoded URLs
      const decodedKey = decodeURIComponent(objectKey);
      
      const signedUrl = this.s3.getSignedUrl('getObject', {
        Bucket: this.bucket,
        Key: decodedKey,
        Expires: this.urlExpiration,
      });

      logger && logger.debug && logger.debug(`✅ Generated signed URL for: ${decodedKey}`);
      return signedUrl;
    } catch (error) {
      logger && logger.error && logger.error(`❌ Error generating signed URL for ${objectKey}:`, error && error.message ? error.message : error);
      return this.defaultImageUrl;
    }
  }

  /**
   * Extract object key from full signed URL
   * 
   * If database has old signed URLs with full URLs,
   * this extracts just the object key
   * 
   * @param {string} signedUrlOrKey - Full URL or just object key
   * @returns {string|null} - Clean object key, or null if external URL
   */
  extractObjectKey(signedUrlOrKey) {
    if (!signedUrlOrKey) return null;

    // Decode the URL first to handle double-encoding
    let decodedUrl = signedUrlOrKey;
    try {
      decodedUrl = decodeURIComponent(signedUrlOrKey);
    } catch (e) {
      // If decoding fails, use original
      decodedUrl = signedUrlOrKey;
    }

    // Already just a key (e.g., "products/image.jpg") - not an HTTP URL
    if (!decodedUrl.includes('http')) {
      return decodedUrl;
    }

    // If it's an external URL (Unsplash, Pexels, etc.), return null to indicate external
    if (this.isExternalUrl(decodedUrl)) {
      return null; // Signal that this is an external URL
    }

    // Extract from S3 URL (e.g., from "https://t3.storageapi.dev/bucket/products/image.jpg")
    try {
      // Try to find bucket name in the URL path
      const urlParts = decodedUrl.split('/');
      const bucketIdx = urlParts.findIndex(p => p === this.bucket || p.includes('storageapi'));
      
      if (bucketIdx >= 0 && bucketIdx < urlParts.length - 1) {
        // Get everything after the bucket
        return urlParts.slice(bucketIdx + 1).join('/');
      }
      
      // Alternative: try to find if URL contains /products/ path
      const productsIdx = urlParts.findIndex(p => p === 'products');
      if (productsIdx >= 0) {
        return urlParts.slice(productsIdx).join('/');
      }
    } catch (error) {
      logger.warn(`⚠️ Could not extract object key from URL: ${decodedUrl}`);
    }

    return null; // Return null for external URLs, key for S3 URLs
  }

  /**
   * FAST: Generate direct URLs for images (no signing - for list views)
   * Much faster than signed URLs - no S3 API calls needed
   * Use this for product lists, grids, and any bulk operations
   * 
   * @param {Array} images - Array of image objects with 'image_url' field
   * @returns {Array} - Same images with direct URLs
   */
  generateDirectUrlsForImages(images) {
    if (!Array.isArray(images)) {
      return images;
    }
    return images.map((image) => {
      if (!image || !image.image_url) {
        return {
          ...image,
          image_url: this.defaultImageUrl,
        };
      }

      let imageUrl = image.image_url;
      
      // Decode if double-encoded
      try {
        if (imageUrl.includes('%3A') || imageUrl.includes('%2F')) {
          imageUrl = decodeURIComponent(imageUrl);
        }
      } catch (e) {
        // Keep original if decode fails
      }

      // External URLs - return as-is
      if (this.isExternalUrl(imageUrl)) {
        return {
          ...image,
          image_url: imageUrl,
        };
      }

      // Extract object key
      const objectKey = this.extractObjectKey(imageUrl);

      if (!objectKey) {
        return {
          ...image,
          image_url: imageUrl,
        };
      }

      // Check if it's a Cloudinary key
      if (this.isCloudinaryKey(objectKey)) {
        return {
          ...image,
          image_url: this.generateCloudinaryUrl(objectKey),
        };
      }

      // Use FAST direct URL (no signing!)
      return {
        ...image,
        image_url: this.generateDirectUrl(objectKey),
      };
    });
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
    return images.map((image) => {
      if (!image || !image.image_url) {
        return {
          ...image,
          image_url: this.defaultImageUrl,
        };
      }

      let imageUrl = image.image_url;
      
      // First, try to decode if it's double-encoded
      try {
        if (imageUrl.includes('%3A') || imageUrl.includes('%2F')) {
          imageUrl = decodeURIComponent(imageUrl);
        }
      } catch (e) {
        // Keep original if decode fails
      }

      // Check if it's an external URL - return as-is without signed URL
      if (this.isExternalUrl(imageUrl)) {
        logger && logger.debug && logger.debug(`🔗 External URL detected: ${imageUrl.substring(0, 50)}...`);
        return {
          ...image,
          image_url: imageUrl,
          _is_external: true,
        };
      }

      // Extract object key (handles both old URLs and fresh keys)
      const objectKey = this.extractObjectKey(imageUrl);

      // If objectKey is null, it's an external URL - return as-is
      if (!objectKey) {
        return {
          ...image,
          image_url: imageUrl,
          _is_external: true,
        };
      }

      // Generate fresh signed URL for S3-stored images
      const freshUrl = this.generateSignedUrl(objectKey);

      return {
        ...image,
        image_url: freshUrl || this.defaultImageUrl,
        _object_key: objectKey,
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

  /**
   * FAST: Refresh direct URLs for a product's images (no signing)
   * Use for list views - much faster than signed URLs
   * 
   * @param {Object} product - Product object with images array
   * @returns {Object} - Same product with direct URLs
   */
  refreshProductDirectImageUrls(product) {
    if (!product || !product.images) {
      return product;
    }

    return {
      ...product,
      images: this.generateDirectUrlsForImages(product.images)
    };
  }

  /**
   * FAST: Refresh direct URLs for multiple products (no signing)
   * Use for list views - much faster than signed URLs
   * 
   * @param {Array} products - Array of products
   * @returns {Array} - Same products with direct URLs
   */
  refreshProductsDirectImageUrls(products) {
    if (!Array.isArray(products)) {
      return products;
    }

    return products.map(product => this.refreshProductDirectImageUrls(product));
  }
}

module.exports = new ImageURLService();
