const router = require('express').Router();
const { asyncHandler } = require('../middlewares/asyncHandler');
const adminAuth = require('../middlewares/adminAuth');
const uploadController = require('../controllers/upload.controller');

/**
 * Upload image from base64 (client converts file to base64)
 * POST /api/upload-image
 * Body: { file: base64string, altText: string }
 */
router.post('/', adminAuth, asyncHandler(uploadController.uploadImage));

module.exports = router;
