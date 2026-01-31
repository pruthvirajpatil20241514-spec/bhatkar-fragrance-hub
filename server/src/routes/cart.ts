import { Router } from 'express';
import { getCart, addToCart, removeFromCart } from '../controllers/cartController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, getCart);
router.post('/', authMiddleware, addToCart);
router.delete('/:id', authMiddleware, removeFromCart);

export default router;
