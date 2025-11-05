const express = require('express');
const axios = require('axios');

const router = express.Router();

const CARD_OPERATIONS_API_BASE_URL = 'https://api.bankingapi.ru/api/rb/dks/cardops/hackathon/v1';

// Helper function to build headers
const buildHeaders = (req) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if present
  if (req.headers['authorization']) {
    headers['Authorization'] = req.headers['authorization'];
  }

  // Add required headers
  if (req.headers['x-mdm-id']) {
    headers['X-Mdm-Id'] = req.headers['x-mdm-id'];
  }
  if (req.headers['x-client-channel']) {
    headers['x-client-channel'] = req.headers['x-client-channel'];
  }
  if (req.headers['x-partner-id']) {
    headers['X-PARTNER-ID'] = req.headers['x-partner-id'];
  }
  if (req.headers['x-tyk-api-key']) {
    headers['X-TYK-API-KEY'] = req.headers['x-tyk-api-key'];
  }

  return headers;
};

// Helper function to handle errors
const handleError = (res, error, defaultMessage) => {
  console.error(`Error in Card Operations API:`, error.response?.data || error.message);
  const status = error.response?.status || 500;
  res.status(status).json({
    error: error.response?.data?.error || defaultMessage,
    message: error.response?.data?.message || error.message
  });
};

/**
 * Закрытие карты
 * POST /api/card-operations/close/:publicId
 */
router.post('/close/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    const headers = buildHeaders(req);

    console.log(`[Card Operations API] POST Close card: ${publicId}`);

    const response = await axios.post(`${CARD_OPERATIONS_API_BASE_URL}/close/${publicId}`, {}, { headers });

    // Forward rate limit headers
    if (response.headers['x-ratelimit-limit']) {
      res.set('X-RateLimit-Limit', response.headers['x-ratelimit-limit']);
    }
    if (response.headers['x-ratelimit-remaining']) {
      res.set('X-RateLimit-Remaining', response.headers['x-ratelimit-remaining']);
    }
    if (response.headers['x-ratelimit-reset']) {
      res.set('X-RateLimit-Reset', response.headers['x-ratelimit-reset']);
    }

    res.json(response.data);
  } catch (error) {
    handleError(res, error, 'Failed to close card');
  }
});

/**
 * Смена PIN-кода карты
 * POST /api/card-operations/pin/:publicId
 */
router.post('/pin/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    const headers = buildHeaders(req);
    const data = req.body;

    console.log(`[Card Operations API] POST Change PIN for card: ${publicId}`);

    const response = await axios.post(`${CARD_OPERATIONS_API_BASE_URL}/pin/${publicId}`, data, { headers });

    // Forward rate limit headers
    if (response.headers['x-ratelimit-limit']) {
      res.set('X-RateLimit-Limit', response.headers['x-ratelimit-limit']);
    }
    if (response.headers['x-ratelimit-remaining']) {
      res.set('X-RateLimit-Remaining', response.headers['x-ratelimit-remaining']);
    }
    if (response.headers['x-ratelimit-reset']) {
      res.set('X-RateLimit-Reset', response.headers['x-ratelimit-reset']);
    }

    res.json(response.data);
  } catch (error) {
    handleError(res, error, 'Failed to change card PIN');
  }
});

/**
 * Изменение статуса карты (блокировка/разблокировка)
 * PUT /api/card-operations/status/:publicId
 */
router.put('/status/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    const headers = buildHeaders(req);
    const data = req.body;

    console.log(`[Card Operations API] PUT Change status for card: ${publicId}`, data);

    const response = await axios.put(`${CARD_OPERATIONS_API_BASE_URL}/status/${publicId}`, data, { headers });

    // Forward rate limit headers
    if (response.headers['x-ratelimit-limit']) {
      res.set('X-RateLimit-Limit', response.headers['x-ratelimit-limit']);
    }
    if (response.headers['x-ratelimit-remaining']) {
      res.set('X-RateLimit-Remaining', response.headers['x-ratelimit-remaining']);
    }
    if (response.headers['x-ratelimit-reset']) {
      res.set('X-RateLimit-Reset', response.headers['x-ratelimit-reset']);
    }

    res.json(response.data);
  } catch (error) {
    handleError(res, error, 'Failed to change card status');
  }
});

module.exports = router;

