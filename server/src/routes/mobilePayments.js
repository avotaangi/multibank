const express = require('express');
const axios = require('axios');

const router = express.Router();

const MOBILE_PAYMENTS_API_BASE_URL = 'https://api.bankingapi.ru/api/rb/pmnt/acceptance/mobile/hackathon/v1';

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
    'x-mdm-id': 'X-MDM-ID',
    'x-unc': 'X-UNC',
    'x-client-channel': 'X-CLIENT-CHANNEL',
    'x-tb-id': 'X-TB-ID',
    'x-user-session-id': 'x-user-session-id',
    'x-client-interaction': 'X-CLIENT-INTERACTION',
  };

  Object.keys(headerMap).forEach(key => {
    if (req.headers[key]) {
      headers[headerMap[key]] = req.headers[key];
    }
  });

  return headers;
};

// Helper function to handle errors
const handleError = (res, error, defaultMessage) => {
  console.error(`Error in Mobile Payments API:`, error.response?.data || error.message);
  const status = error.response?.status || 500;
  res.status(status).json({
    error: error.response?.data?.error || defaultMessage,
    message: error.response?.data?.message || error.message,
    ...(error.response?.data || {})
  });
};

/**
 * Получить список продуктов клиента
 * POST /api/mobile-payments/products
 */
router.post('/products', async (req, res) => {
  try {
    const headers = buildHeaders(req);
    const data = req.body;

    console.log(`[Mobile Payments API] POST Products:`, data);

    const response = await axios.post(`${MOBILE_PAYMENTS_API_BASE_URL}/products`, data, { headers });

    res.json(response.data);
  } catch (error) {
    handleError(res, error, 'Failed to get products');
  }
});

/**
 * Получить информацию о номере телефона (определить оператора)
 * POST /api/mobile-payments/phones/info
 */
router.post('/phones/info', async (req, res) => {
  try {
    const headers = buildHeaders(req);
    const data = req.body;

    console.log(`[Mobile Payments API] POST Phone info:`, data);

    const response = await axios.post(`${MOBILE_PAYMENTS_API_BASE_URL}/phones/info`, data, { headers });

    res.json(response.data);
  } catch (error) {
    handleError(res, error, 'Failed to get phone info');
  }
});

/**
 * Начать платеж
 * POST /api/mobile-payments/payments/start
 */
router.post('/payments/start', async (req, res) => {
  try {
    const headers = buildHeaders(req);
    const data = req.body;

    console.log(`[Mobile Payments API] POST Start payment:`, data);

    const response = await axios.post(`${MOBILE_PAYMENTS_API_BASE_URL}/payments/start`, data, { headers });

    res.json(response.data);
  } catch (error) {
    handleError(res, error, 'Failed to start payment');
  }
});

/**
 * Создать платеж
 * POST /api/mobile-payments/payments/request
 */
router.post('/payments/request', async (req, res) => {
  try {
    const headers = buildHeaders(req);
    const data = req.body;

    console.log(`[Mobile Payments API] POST Request payment:`, data);

    const response = await axios.post(`${MOBILE_PAYMENTS_API_BASE_URL}/payments/request`, data, { headers });

    res.json(response.data);
  } catch (error) {
    handleError(res, error, 'Failed to request payment');
  }
});

/**
 * Подтвердить платеж
 * POST /api/mobile-payments/payments/confirm
 */
router.post('/payments/confirm', async (req, res) => {
  try {
    const headers = buildHeaders(req);
    const data = req.body;

    console.log(`[Mobile Payments API] POST Confirm payment:`, data);

    const response = await axios.post(`${MOBILE_PAYMENTS_API_BASE_URL}/payments/confirm`, data, { headers });

    res.json(response.data);
  } catch (error) {
    handleError(res, error, 'Failed to confirm payment');
  }
});

/**
 * Получить информацию о платеже
 * GET /api/mobile-payments/payments/:paymentId
 */
router.get('/payments/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const headers = buildHeaders(req);

    console.log(`[Mobile Payments API] GET Payment: ${paymentId}`);

    const response = await axios.get(`${MOBILE_PAYMENTS_API_BASE_URL}/payments/${paymentId}`, { headers });

    res.json(response.data);
  } catch (error) {
    handleError(res, error, 'Failed to get payment');
  }
});

/**
 * Получить чек по платежу
 * GET /api/mobile-payments/payments/:paymentId/check
 */
router.get('/payments/:paymentId/check', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const headers = buildHeaders(req);

    console.log(`[Mobile Payments API] GET Payment check: ${paymentId}`);

    const response = await axios.get(`${MOBILE_PAYMENTS_API_BASE_URL}/payments/${paymentId}/check`, { headers });

    res.json(response.data);
  } catch (error) {
    handleError(res, error, 'Failed to get payment check');
  }
});

module.exports = router;

