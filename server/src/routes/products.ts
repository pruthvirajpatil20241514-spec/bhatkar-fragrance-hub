import { Router } from 'express';
import { getAllProducts, getProductById, getFeaturedProducts } from '../controllers/productController.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// Public routes
router.get('/', asyncHandler(getAllProducts));
router.get('/featured', asyncHandler(getFeaturedProducts));
router.get('/:id', asyncHandler(getProductById));

export default router;
