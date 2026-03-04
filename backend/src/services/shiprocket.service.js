const axios = require('axios');
const logger = require('../utils/logger').logger || console;

const BASE = process.env.SHIPROCKET_API_BASE || 'https://apiv2.shiprocket.in/v1/external';
const EMAIL = process.env.SHIPROCKET_EMAIL;
const PASSWORD = process.env.SHIPROCKET_PASSWORD;

let cached = {
  token: null,
  obtainedAt: 0,
  ttlMs: 10 * 60 * 1000 // refresh every 10 minutes
};

async function login() {
  if (!EMAIL || !PASSWORD) {
    throw new Error('SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD not set');
  }

  // reuse token if fresh
  if (cached.token && (Date.now() - cached.obtainedAt) < cached.ttlMs) {
    return cached.token;
  }

  const url = `${BASE}/auth/login`;
  try {
    const resp = await axios.post(url, { email: EMAIL, password: PASSWORD }, { timeout: 10000 });
    const token = resp?.data?.token || resp?.data?.data?.token || resp?.data?.access_token;
    if (!token) {
      throw new Error('No token returned from Shiprocket login');
    }
    cached.token = token;
    cached.obtainedAt = Date.now();
    logger.info('Shiprocket: obtained new token');
    return token;
  } catch (err) {
    logger.error('Shiprocket login failed:', err.message || err);
    throw err;
  }
}

async function createShipment(payload) {
  // payload should be the body expected by Shiprocket /orders/create/adhoc
  const token = await login();
  const url = `${BASE}/orders/create/adhoc`;
  try {
    const resp = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    return resp.data;
  } catch (err) {
    // Invalidate token on 401 so next call will re-login
    if (err.response && err.response.status === 401) {
      cached.token = null;
    }
    logger.error('Shiprocket createShipment failed:', err.message || err);
    throw err;
  }
}

module.exports = {
  login,
  createShipment
};
