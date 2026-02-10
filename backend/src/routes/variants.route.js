const express = require('express');
const variantsController = require('../controllers/variants.controller');
const { verifyAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes
router.get('/product/:productId', variantsController.getProductVariants);
router.get('/:variantId', variantsController.getVariant);

// Admin routes
router.post('/', verifyAdmin, variantsController.createVariant);
router.put('/:variantId', verifyAdmin, variantsController.updateVariant);
router.delete('/:variantId', verifyAdmin, variantsController.deleteVariant);

// Variant images
router.post('/:variantId/images', verifyAdmin, variantsController.uploadVariantImages);
router.delete('/images/:imageId', verifyAdmin, variantsController.deleteVariantImage);

module.exports = router;
