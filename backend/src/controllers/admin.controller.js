const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = require('../utils/secrets');
const { compare: comparePassword } = require('../utils/password');
const { logger } = require('../utils/logger');

// Fixed admin credentials
const ADMIN_EMAIL = 'admin@bhatkar.com';
const ADMIN_PASSWORD = 'admin123';

/**
 * Admin Login
 * Only allows the fixed admin account to log in
 */
exports.login = (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email
        if (email !== ADMIN_EMAIL) {
            logger.warn(`Login attempt with invalid email: ${email}`);
            return res.status(401).send({
                status: 'error',
                message: 'Invalid credentials.'
            });
        }

        // Validate password
        if (password !== ADMIN_PASSWORD) {
            logger.warn(`Login attempt with invalid password for email: ${email}`);
            return res.status(401).send({
                status: 'error',
                message: 'Invalid credentials.'
            });
        }

        // Generate JWT token with admin flag
        const token = jwt.sign(
            { 
                id: 1, 
                email: ADMIN_EMAIL,
                isAdmin: true 
            },
            JWT_SECRET_KEY,
            { expiresIn: '7d' }
        );

        logger.info(`Admin login successful for: ${email}`);

        return res.status(200).send({
            status: 'success',
            message: 'Login successful',
            data: {
                token,
                admin: {
                    id: 1,
                    email: ADMIN_EMAIL
                }
            }
        });
    } catch (error) {
        logger.error(`Admin login error: ${error.message}`);
        return res.status(500).send({
            status: 'error',
            message: 'Internal server error during login.'
        });
    }
};

/**
 * Get Admin Profile
 * Returns admin information (requires authentication)
 */
exports.getProfile = (req, res) => {
    try {
        return res.status(200).send({
            status: 'success',
            data: {
                admin: {
                    id: req.admin.id,
                    email: req.admin.email
                }
            }
        });
    } catch (error) {
        logger.error(`Get admin profile error: ${error.message}`);
        return res.status(500).send({
            status: 'error',
            message: 'Internal server error.'
        });
    }
};

/**
 * Admin Logout
 * Simply returns success (token invalidation handled client-side)
 */
exports.logout = (req, res) => {
    try {
        logger.info(`Admin logout for: ${req.admin.email}`);
        return res.status(200).send({
            status: 'success',
            message: 'Logout successful'
        });
    } catch (error) {
        logger.error(`Admin logout error: ${error.message}`);
        return res.status(500).send({
            status: 'error',
            message: 'Internal server error.'
        });
    }
};
