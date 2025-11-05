const express = require('express');
const axios = require('axios');

const router = express.Router();

const CARD_MANAGEMENT_API_BASE_URL = 'https://api.bankingapi.ru/api/rb/dks/cardinfo/hackathon/v1';

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
  if (req.headers['client-open-key']) {
    headers['clientOpenKey'] = req.headers['client-open-key'];
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
  console.error(`Error in Card Management API:`, error.response?.data || error.message);
  const status = error.response?.status || 500;
  res.status(status).json({
    error: error.response?.data?.error || defaultMessage,
    message: error.response?.data?.message || error.message
  });
};

/**
 * Получение реквизитов карты
 * GET /api/card-management/credentials/:publicId
 */
router.get('/credentials/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    const headers = buildHeaders(req);

    console.log(`[Card Management API] GET Credentials for card: ${publicId}`);

    const response = await axios.get(`${CARD_MANAGEMENT_API_BASE_URL}/credentials/${publicId}`, { headers });

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
    handleError(res, error, 'Failed to get card credentials');
  }
});

/**
 * Получение CVV кода карты
 * GET /api/card-management/cvv/:publicId
 */
router.get('/cvv/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    const headers = buildHeaders(req);

    console.log(`[Card Management API] GET CVV for card: ${publicId}`);

    const response = await axios.get(`${CARD_MANAGEMENT_API_BASE_URL}/cvv/${publicId}`, { headers });

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
    handleError(res, error, 'Failed to get card CVV');
  }
});

/**
 * Токенизация карты
 * POST /api/card-management/token/:publicId
 */
router.post('/token/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    const headers = buildHeaders(req);
    const data = req.body;

    console.log(`[Card Management API] POST Tokenize card: ${publicId}`);

    const response = await axios.post(`${CARD_MANAGEMENT_API_BASE_URL}/token/${publicId}`, data, { headers });

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
    handleError(res, error, 'Failed to tokenize card');
  }
});

/**
 * Получение токенов карты
 * GET /api/card-management/tokens/:publicId
 */
router.get('/tokens/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    const headers = buildHeaders(req);

    console.log(`[Card Management API] GET Tokens for card: ${publicId}`);

    const response = await axios.get(`${CARD_MANAGEMENT_API_BASE_URL}/tokens/${publicId}`, { headers });

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
    handleError(res, error, 'Failed to get card tokens');
  }
});

module.exports = router;

