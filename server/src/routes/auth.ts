import { Router } from 'express';
import { registerUser, loginUser, loginAdmin, refreshToken, getCurrentUser } from '../controllers/authController.js';
import { authMiddleware, asyncHandler } from '../middleware/auth.js';
import { errorHandler, asyncHandler as asyncHandlerFn } from '../middleware/errorHandler.js';

const router = Router();

// Public routes
router.post('/register', asyncHandlerFn(registerUser));
router.post('/login', asyncHandlerFn(loginUser));
router.post('/admin/login', asyncHandlerFn(loginAdmin));
router.post('/refresh', asyncHandlerFn(refreshToken));

// Protected routes
router.get('/me', authMiddleware, asyncHandlerFn(getCurrentUser));

export default router;
