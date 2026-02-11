const mysql = require('mysql2/promise');
const { logger } = require('../utils/logger');
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = require('../utils/secrets');

// Production-ready connection pool with SSL
const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
    ssl: process.env.NODE_ENV === 'production' ? true : false
});

// Attempt to verify DB connectivity with retries (exponential backoff)
async function verifyConnectionWithRetry(maxAttempts = 10, initialDelayMs = 2000) {
    let attempt = 0;
    let delay = initialDelayMs;

    while (attempt < maxAttempts) {
        try {
            attempt++;
            const conn = await pool.getConnection();
            conn.release();
            logger.info('Database pool created successfully');
            return true;
        } catch (err) {
            logger.warn(`Database pool creation failed (attempt ${attempt}/${maxAttempts}): ${err.message}`);
            if (attempt >= maxAttempts) {
                logger.error('Max DB connection attempts reached. Continuing and retrying queries later.');
                return false;
            }
            // wait before retrying
            await new Promise(res => setTimeout(res, delay));
            // exponential backoff with cap
            delay = Math.min(delay * 2, 30000);
        }
    }
}

// Start verification but do not exit process if DB is not yet available.
verifyConnectionWithRetry().catch(err => {
    logger.error('Unexpected error during DB verification:', err.message);
});

module.exports = pool;

