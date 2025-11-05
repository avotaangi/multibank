const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const CASH_LOAN_API_BASE_URL = 'https://api.bankingapi.ru/api/rb/mssa/partner/hackathon/v1';

// Helper function to build headers
const buildHeaders = (req) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if present
  if (req.headers['authorization']) {
    headers['Authorization'] = req.headers['authorization'];
  }

  // Add X-TYK-API-KEY if present
  if (req.headers['x-tyk-api-key']) {
    headers['X-TYK-API-KEY'] = req.headers['x-tyk-api-key'];
  }

  return headers;
};

// Helper function to handle errors
const handleError = (res, error, defaultMessage) => {
  console.error(`Error in Cash Loan Applications API:`, error.response?.data || error.message);
  const status = error.response?.status || 500;
  res.status(status).json({
    error: error.response?.data?.error || defaultMessage,
    message: error.response?.data?.message || error.message
  });
};

/**
 * Сохранить данные по заявке
 * POST /api/cash-loan-applications
 */
router.post('/', async (req, res) => {
  try {
    const headers = buildHeaders(req);
    const data = req.body;

    console.log(`[Cash Loan API] POST Create Application`);
    console.log(`[Cash Loan API] Partner: ${data?.partnerName}, Application ID: ${data?.partnerApplicationId}`);

    const response = await axios.post(`${CASH_LOAN_API_BASE_URL}/applications`, data, { headers });

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
    handleError(res, error, 'Failed to create cash loan application');
  }
});

/**
 * Проверить статус заявки
 * GET /api/cash-loan-applications/:applicationId
 */
router.get('/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const headers = buildHeaders(req);

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(applicationId)) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'Invalid applicationId format. Expected UUID.'
      });
    }

    console.log(`[Cash Loan API] GET Application Status for ${applicationId}`);

    const response = await axios.get(`${CASH_LOAN_API_BASE_URL}/applications/${applicationId}`, { headers });

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
    handleError(res, error, 'Failed to get application status');
  }
});

/**
 * Принять предложение
 * PATCH /api/cash-loan-applications/:applicationId/confirm
 */
router.patch('/:applicationId/confirm', async (req, res) => {
  try {
    const { applicationId } = req.params;
    const headers = buildHeaders(req);

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(applicationId)) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'Invalid applicationId format. Expected UUID.'
      });
    }

    console.log(`[Cash Loan API] PATCH Confirm Application ${applicationId}`);

    const response = await axios.patch(`${CASH_LOAN_API_BASE_URL}/applications/${applicationId}`, {}, { headers });

    res.json(response.data || { success: true });
  } catch (error) {
    handleError(res, error, 'Failed to confirm application');
  }
});

module.exports = router;

