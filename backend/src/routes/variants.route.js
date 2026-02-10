const express = require('express');
const variantsController = require('../controllers/variants.controller');
const adminAuth = require('../middlewares/adminAuth');

const router = express.Router();

// Public routes
router.get('/product/:productId', variantsController.getProductVariants);
router.get('/:variantId', variantsController.getVariant);

// Admin routes
router.post('/', adminAuth, variantsController.createVariant);
router.put('/:variantId', adminAuth, variantsController.updateVariant);
router.delete('/:variantId', adminAuth, variantsController.deleteVariant);

// Variant images
router.post('/:variantId/images', adminAuth, variantsController.uploadVariantImages);
router.delete('/images/:imageId', adminAuth, variantsController.deleteVariantImage);

module.exports = router;
