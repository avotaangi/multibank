const express = require('express');
const axios = require('axios');

const router = express.Router();

const UNIVERSAL_PAYMENTS_API_BASE_URL = 'https://api.bankingapi.ru/api/rb/pmnt/acceptance/universal/hackathon/v1';

// Helper function to build headers
const buildHeaders = (req) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if present
  if (req.headers['authorization']) {
    headers['Authorization'] = req.headers['authorization'];
  }

  // Required headers
  const headerMap = {
    'x-unc': 'X-UNC',
    'x-mdm-id': 'X-MDM-ID',
    'x-partner-id': 'X-PARTNER-ID',
    'x-login-mode': 'X-LOGIN-MODE',
    'x-roles': 'X-ROLES',
    'x-channel': 'X-CHANNEL',
    'x-tb-id': 'X-TB-ID',
    'x-user-session-id': 'X-USER-SESSION-ID',
  };

  Object.keys(headerMap).forEach(key => {
    if (req.headers[key]) {
      headers[headerMap[key]] = req.headers[key];
    }
  });

  // Handle X-ROLES array
  if (req.headers['x-roles'] && typeof req.headers['x-roles'] === 'string') {
    try {
      headers['X-ROLES'] = JSON.parse(req.headers['x-roles']);
    } catch (e) {
      headers['X-ROLES'] = [req.headers['x-roles']];
    }
  }

  return headers;
};

// Helper function to handle errors
const handleError = (res, error, defaultMessage) => {
  console.error(`Error in Universal Payments API:`, error.response?.data || error.message);
  const status = error.response?.status || 500;
  res.status(status).json({
    error: error.response?.data?.error || defaultMessage,
    message: error.response?.data?.message || error.message,
    ...(error.response?.data || {})
  });
};

/**
 * Получить детальную информацию по платежу
 * GET /api/universal-payments/payments/:paymentId
 */
router.get('/payments/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const headers = buildHeaders(req);

    console.log(`[Universal Payments API] GET Payment: ${paymentId}`);

    const response = await axios.get(`${UNIVERSAL_PAYMENTS_API_BASE_URL}/payments/${paymentId}`, { headers });

    res.json(response.data);
  } catch (error) {
    handleError(res, error, 'Failed to get payment');
  }
});

/**
 * Получить список продуктов клиента
 * GET /api/universal-payments/products
 */
router.get('/products', async (req, res) => {
  try {
    const headers = buildHeaders(req);
    const { minBalance } = req.query;

    console.log(`[Universal Payments API] GET Products, minBalance: ${minBalance || 0}`);

    const config = {
      headers,
      params: minBalance ? { minBalance: parseFloat(minBalance) } : {}
    };

    const response = await axios.get(`${UNIVERSAL_PAYMENTS_API_BASE_URL}/products`, config);

    res.json(response.data);
  } catch (error) {
    handleError(res, error, 'Failed to get products');
  }
});

/**
 * Начать оплату (получить форму с полями)
 * POST /api/universal-payments/payments/start
 */
router.post('/payments/start', async (req, res) => {
  try {
    const headers = buildHeaders(req);
    const data = req.body;

    console.log(`[Universal Payments API] POST Start payment:`, data);

    const response = await axios.post(`${UNIVERSAL_PAYMENTS_API_BASE_URL}/payments/start`, data, { headers });

    res.json(response.data);
  } catch (error) {
    handleError(res, error, 'Failed to start payment');
  }
});

/**
 * Создать платеж
 * POST /api/universal-payments/payments/request
 */
router.post('/payments/request', async (req, res) => {
  try {
    const headers = buildHeaders(req);
    const data = req.body;

    console.log(`[Universal Payments API] POST Request payment:`, data);

    const response = await axios.post(`${UNIVERSAL_PAYMENTS_API_BASE_URL}/payments/request`, data, { headers });

    res.json(response.data);
  } catch (error) {
    handleError(res, error, 'Failed to request payment');
  }
});

/**
 * Подтвердить платеж
 * POST /api/universal-payments/payments/confirm
 */
router.post('/payments/confirm', async (req, res) => {
  try {
    const headers = buildHeaders(req);
    const data = req.body;

    console.log(`[Universal Payments API] POST Confirm payment:`, data);

    const response = await axios.post(`${UNIVERSAL_PAYMENTS_API_BASE_URL}/payments/confirm`, data, { headers });

    res.json(response.data);
  } catch (error) {
    handleError(res, error, 'Failed to confirm payment');
  }
});

/**
 * Получить чек по платежу
 * GET /api/universal-payments/payments/:paymentId/check
 */
router.get('/payments/:paymentId/check', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const headers = buildHeaders(req);

    console.log(`[Universal Payments API] GET Payment check: ${paymentId}`);

    const response = await axios.get(`${UNIVERSAL_PAYMENTS_API_BASE_URL}/payments/${paymentId}/check`, { headers });

    res.json(response.data);
  } catch (error) {
    handleError(res, error, 'Failed to get payment check');
  }
});

module.exports = router;

