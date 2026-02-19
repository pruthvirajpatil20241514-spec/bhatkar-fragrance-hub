/**
 * Optional Authentication Middleware
 * ==================================
 * Extracts userId from JWT token if present, but doesn't block requests if absent.
 * Used for payment endpoints where we want userId if available but allow public access.
 * 
 * How it works:
 * 1. Checks Authorization header for Bearer token
 * 2. Decodes JWT to extract userId
 * 3. Attaches user object to req.user if token is valid
 * 4. Allows request to proceed even if token is missing/invalid
 */

const { decode } = require('../utils/token');
const { logger } = require('../utils/logger');

const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // If no authorization header, just continue without user data
    if (!authHeader) {
      logger.debug('⚠️  No Authorization header provided');
      return next();
    }

    // Extract token from "Bearer <token>" format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      logger.debug('⚠️ Invalid Authorization header format');
      return next();
    }

    const token = parts[1];

    // Decode token
    const decoded = decode(token);
    
    if (!decoded || !decoded.id) {
      logger.debug('⚠️ Invalid or expired token');
      return next();
    }

    // ✅ Attach user to request
    req.user = {
      id: decoded.id
    };
    
    logger.debug(`✅ User ID extracted from token: ${req.user.id}`);
    next();
  } catch (error) {
    logger.error('❌ Error in optionalAuth middleware:', error.message);
    // Continue anyway - this is optional auth
    next();
  }
};

module.exports = optionalAuth;
