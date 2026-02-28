const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const { logger } = require('./logger');

const {
    DB_HOST,
    DB_USER,
    DB_PASS,
    DB_PASSWORD,
    DB_NAME,
    DB_PORT,
    JWT_SECRET_KEY
} = process.env;

const requiredCredentials = [
    'DB_HOST',
    'DB_USER',
    'DB_NAME',
    'JWT_SECRET_KEY'
];

// DB_PASS and DB_PASSWORD are optional (one should be provided)
const dbPassword = process.env.DATABASE_URL ? null : (DB_PASSWORD || DB_PASS);
if (!dbPassword && !process.env.DATABASE_URL) {
    logger.error('Missing required credential: DB_PASSWORD or DB_PASS (or DATABASE_URL)');
    process.exit(1);
}

for (const credential of requiredCredentials) {
    if (process.env[credential] === undefined && !process.env.DATABASE_URL) {
        logger.error(`Missing required credential: ${credential} (or DATABASE_URL)`);
        process.exit(1);
    }
}

// Special case: JWT_SECRET_KEY is ALWAYS required
if (!JWT_SECRET_KEY) {
    logger.error('CRITICAL: JWT_SECRET_KEY is missing from environment variables!');
    process.exit(1);
}

module.exports = {
    DB_HOST,
    DB_USER,
    DB_PASS: dbPassword,
    DB_PASSWORD: dbPassword,
    DB_NAME,
    DB_PORT: DB_PORT || 3306,
    JWT_SECRET_KEY
};
