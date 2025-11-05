import express from 'express';
import bankingClient from '../services/bankingClient.js';

const router = express.Router();

/**
 * Создать платеж (согласно спецификации)
 * POST /api/payments?bank=vbank&client_id=team096-1
 */
router.post('/', async (req, res) => {
  try {
    const { bank = 'vbank', client_id } = req.query;
    const paymentData = req.body;
    
    const params = client_id ? { client_id } : {};
    const headers = {};
    
    if (req.headers['x-payment-consent-id']) {
      headers['X-Payment-Consent-Id'] = req.headers['x-payment-consent-id'];
    }
    if (req.headers['x-requesting-bank']) {
      headers['X-Requesting-Bank'] = req.headers['x-requesting-bank'];
    }
    if (req.headers['x-fapi-interaction-id']) {
      headers['X-Fapi-Interaction-Id'] = req.headers['x-fapi-interaction-id'];
    }
    if (req.headers['x-fapi-customer-ip-address']) {
      headers['X-Fapi-Customer-Ip-Address'] = req.headers['x-fapi-customer-ip-address'];
    }
    
    const payment = await bankingClient.request(
      bank,
      'POST',
      '/payments',
      {
        data: paymentData,
        params,
        headers
      }
    );
    
    res.status(201).json(payment);
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Failed to create payment'
    });
  }
});

/**
 * Получить статус платежа (согласно спецификации)
 * GET /api/payments/:paymentId?bank=vbank
 */
router.get('/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { bank = 'vbank' } = req.query;
    
    const headers = {};
    if (req.headers['x-fapi-interaction-id']) {
      headers['X-Fapi-Interaction-Id'] = req.headers['x-fapi-interaction-id'];
    }
    
    const payment = await bankingClient.request(
      bank,
      'GET',
      `/payments/${paymentId}`,
      { headers }
    );
    
    res.json(payment);
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Failed to fetch payment'
    });
  }
});

export default router;

