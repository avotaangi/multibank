const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const REWARDS_API_BASE_URL = 'https://api.bankingapi.ru/api/rb/rewardsPay/hackathon/v1';

/**
 * Получить баланс бонусов
 * GET /api/rewards/balance/:externalAccountID
 */
router.get('/balance/:externalAccountID', async (req, res) => {
  try {
    const { externalAccountID } = req.params;
    
    // Валидация UUID формата
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(externalAccountID)) {
      return res.status(400).json({
        message: 'Invalid externalAccountID format. Must be a valid UUID.',
        errors: [{
          id: uuidv4(),
          code: 'INVALID_ACCOUNT_ID',
          title: 'Invalid externalAccountID format'
        }]
      });
    }
    
    // Получаем токен авторизации из заголовков запроса к нашему API
    // Этот токен будет передан во внешний Rewards API
    const authorization = req.headers['authorization'] || req.headers['Authorization'];
    
    if (!authorization) {
      return res.status(401).json({
        message: 'Authorization header is required',
        errors: [{
          id: uuidv4(),
          code: 'UNAUTHORIZED',
          title: 'Authorization header is required'
        }]
      });
    }
    
    // Генерируем Correlation-ID для внешнего API
    const correlationId = uuidv4();
    
    const headers = {
      'Authorization': authorization,
      'Correlation-ID': correlationId,
      'Content-Type': 'application/json',
    };
    
    // Добавляем X-Caller-Id если есть (опциональный заголовок)
    if (req.headers['x-caller-id'] || req.headers['X-Caller-Id']) {
      headers['X-Caller-Id'] = req.headers['x-caller-id'] || req.headers['X-Caller-Id'];
    }
    
    console.log(`[Rewards API] GET Balance for account: ${externalAccountID}`);
    console.log(`[Rewards API] Headers:`, { 
      'Authorization': authorization ? '***present***' : 'missing',
      'Correlation-ID': correlationId,
      'X-Caller-Id': headers['X-Caller-Id'] || 'not set'
    });
    
    const response = await axios.get(
      `${REWARDS_API_BASE_URL}/cards/accounts/external/${externalAccountID}/rewards/balance`,
      { headers }
    );
    
    console.log(`[Rewards API] Response status: ${response.status}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching rewards balance:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.errors?.[0]?.title || 'Failed to fetch rewards balance',
      errors: error.response?.data?.errors || [{ title: error.message }]
    });
  }
});

/**
 * Использовать бонусы
 * POST /api/rewards/redeem/:externalAccountID
 */
router.post('/redeem/:externalAccountID', async (req, res) => {
  try {
    const { externalAccountID } = req.params;
    const redemptionData = req.body;
    
    // Валидация UUID формата
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(externalAccountID)) {
      return res.status(400).json({
        message: 'Invalid externalAccountID format. Must be a valid UUID.',
        errors: [{
          id: uuidv4(),
          code: 'INVALID_ACCOUNT_ID',
          title: 'Invalid externalAccountID format'
        }]
      });
    }
    
    // Валидация тела запроса
    if (!redemptionData || !redemptionData.data) {
      return res.status(400).json({
        message: 'Request body must contain data object',
        errors: [{
          id: uuidv4(),
          code: 'BAD_REQUEST',
          title: 'Request body validation failed'
        }]
      });
    }
    
    // Валидация обязательных полей
    const { redemptionReferenceNumber, redemptionAmount, programId, catalogId } = redemptionData.data;
    if (!redemptionReferenceNumber || redemptionAmount === undefined || !programId || !catalogId) {
      return res.status(400).json({
        message: 'Missing required fields: redemptionReferenceNumber, redemptionAmount, programId, catalogId',
        errors: [{
          id: uuidv4(),
          code: 'BAD_REQUEST',
          title: 'Missing required fields in request body'
        }]
      });
    }
    
    // Получаем токен авторизации из заголовков
    const authorization = req.headers['authorization'] || req.headers['Authorization'];
    
    if (!authorization) {
      return res.status(401).json({
        message: 'Authorization header is required',
        errors: [{
          id: uuidv4(),
          code: 'UNAUTHORIZED',
          title: 'Authorization header is required'
        }]
      });
    }
    
    // Генерируем Correlation-ID для внешнего API
    const correlationId = uuidv4();
    
    const headers = {
      'Authorization': authorization,
      'Correlation-ID': correlationId,
      'Content-Type': 'application/json',
    };
    
    // Добавляем X-Caller-Id если есть (опциональный заголовок)
    if (req.headers['x-caller-id'] || req.headers['X-Caller-Id']) {
      headers['X-Caller-Id'] = req.headers['x-caller-id'] || req.headers['X-Caller-Id'];
    }
    
    console.log(`[Rewards API] POST Redemption for account: ${externalAccountID}`);
    console.log(`[Rewards API] Redemption data:`, {
      redemptionAmount: redemptionData?.data?.redemptionAmount,
      programId: redemptionData?.data?.programId,
      catalogId: redemptionData?.data?.catalogId
    });
    console.log(`[Rewards API] Headers:`, { 
      'Authorization': authorization ? '***present***' : 'missing',
      'Correlation-ID': correlationId,
      'X-Caller-Id': headers['X-Caller-Id'] || 'not set'
    });
    
    const response = await axios.post(
      `${REWARDS_API_BASE_URL}/cards/accounts/external/${externalAccountID}/rewards/redemption`,
      redemptionData,
      { headers }
    );
    
    console.log(`[Rewards API] Response status: ${response.status}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error redeeming rewards:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      message: error.response?.data?.errors?.[0]?.title || 'Failed to redeem rewards',
      errors: error.response?.data?.errors || [{ title: error.message }]
    });
  }
});

module.exports = router;

