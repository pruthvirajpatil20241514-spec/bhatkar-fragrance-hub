const { decode: decodeToken } = require('../utils/token');
const { logger } = require('../utils/logger');

const adminAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).send({
            status: 'error',
            message: 'No token provided. Authorization required.'
        });
    }

    const decoded = decodeToken(token);

    if (!decoded) {
        return res.status(401).send({
            status: 'error',
            message: 'Invalid or expired token.'
        });
    }

    // Check if the decoded token has admin flag
    if (!decoded.isAdmin) {
        return res.status(403).send({
            status: 'error',
            message: 'Access denied. Admin privileges required.'
        });
    }

    req.admin = decoded;
    next();
};

module.exports = adminAuth;
