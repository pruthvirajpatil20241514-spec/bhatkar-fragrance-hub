const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/images');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Convert base64 to file and save locally
 * @param {string} base64String - Base64 encoded image data
 * @param {string} fileName - Original file name
 * @returns {string} - File path or URL
 */
const saveBase64Image = (base64String, fileName) => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const uniqueName = `${timestamp}-${fileName.replace(/\s+/g, '-')}`;
    const filePath = path.join(uploadsDir, uniqueName);

    // Extract base64 data (remove data:image/png;base64, prefix)
    const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');

    // Write file to disk
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    // Return relative URL path
    return `/uploads/images/${uniqueName}`;
  } catch (error) {
    console.error('Error saving base64 image:', error);
    throw new Error('Failed to save image');
  }
};

/**
 * Delete image file
 * @param {string} fileName - File name to delete
 */
const deleteImage = (fileName) => {
  try {
    const filePath = path.join(uploadsDir, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

/**
 * Validate image file
 * @param {Buffer} buffer - File buffer
 * @param {string} mimetype - File mime type
 * @param {number} size - File size
 */
const validateImageFile = (buffer, mimetype, size) => {
  const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validMimeTypes.includes(mimetype)) {
    throw new Error('Invalid file type. Only JPG, PNG, WebP, and GIF are allowed.');
  }

  if (size > maxSize) {
    throw new Error('File size exceeds 5MB limit');
  }

  return true;
};

module.exports = {
  saveBase64Image,
  deleteImage,
  validateImageFile,
  uploadsDir
};
