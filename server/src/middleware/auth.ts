import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth.js';
import { AuthenticationError, AuthorizationError } from '../utils/errors.js';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
  adminId?: number;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AuthenticationError('No token provided');
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export const adminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Not authenticated');
    }

    if (req.user.role !== 'super_admin' && req.user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }

    req.adminId = req.user.userId;
    next();
  } catch (error) {
    next(error);
  }
};

export const superAdminMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Not authenticated');
    }

    if (req.user.role !== 'super_admin') {
      throw new AuthorizationError('Super admin access required');
    }

    req.adminId = req.user.userId;
    next();
  } catch (error) {
    next(error);
  }
};
