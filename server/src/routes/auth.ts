import { Router } from 'express';
import {
  registerUser,
  loginUser,
  loginAdmin,
  refreshToken,
  getCurrentUser,
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { asyncHandler as asyncHandlerFn } from '../middleware/errorHandler.js';

const router = Router();

/* ============================================================================
   PUBLIC AUTH ROUTES
============================================================================ */

// User registration
router.post('/register', asyncHandlerFn(registerUser));

// User login
router.post('/login', asyncHandlerFn(loginUser));

// Admin login
router.post('/admin/login', asyncHandlerFn(loginAdmin));

// Refresh access token
router.post('/refresh', asyncHandlerFn(refreshToken));

/* ============================================================================
   PROTECTED AUTH ROUTES
============================================================================ */

// Get currently logged-in user
router.get('/me', authMiddleware, asyncHandlerFn(getCurrentUser));

export default router;
