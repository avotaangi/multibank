const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const LEADS_API_BASE_URL = 'https://api.bankingapi.ru/openapi/smb/lecs/lead/hackathon/v1';

/**
 * Получить статусы лидов
 * GET /api/leads?leadId=123&leadId=456
 */
router.get('/', async (req, res) => {
  try {
    const { leadId } = req.query;
    
    // Преобразуем leadId в массив, если он строка или массив
    const leadIds = Array.isArray(leadId) ? leadId : (leadId ? [leadId] : []);
    
    if (leadIds.length === 0) {
      return res.status(400).json({
        message: 'leadId is required',
        errors: [{
          id: uuidv4(),
          code: 'BAD_REQUEST',
          title: 'At least one leadId is required'
        }]
      });
    }

    // Генерируем X-Global-Transaction-ID если не указан
    const globalTransactionId = req.headers['x-global-transaction-id'] || uuidv4();

    const headers = {
      'X-Global-Transaction-ID': globalTransactionId,
      'Content-Type': 'application/json',
    };

    // Добавляем заголовки авторизации если есть
    if (req.headers['x-ibm-client-id']) {
      headers['X-IBM-Client-Id'] = req.headers['x-ibm-client-id'];
    }
    if (req.headers['x-ibm-client-secret']) {
      headers['X-IBM-Client-Secret'] = req.headers['x-ibm-client-secret'];
    }

    console.log(`[Leads API] GET Status for leads: ${leadIds.join(', ')}`);
    console.log(`[Leads API] Transaction ID: ${globalTransactionId}`);

    // Формируем query параметры для массива leadId
    // Создаем объект params для axios, который автоматически сериализует массив
    const params = {};
    if (leadIds.length === 1) {
      params.leadId = leadIds[0];
    } else {
      params.leadId = leadIds;
    }

    const response = await axios.get(
      `${LEADS_API_BASE_URL}/leads`,
      {
        params,
        headers,
        paramsSerializer: {
          indexes: null // Для правильной сериализации массива leadId как leadId=1&leadId=2
        }
      }
    );

    console.log(`[Leads API] Response status: ${response.status}`);
    
    // Возвращаем X-Global-Transaction-ID в заголовках ответа
    res.set('X-Global-Transaction-ID', response.headers['x-global-transaction-id'] || globalTransactionId);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching leads status:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      message: error.response?.data?.message || 'Failed to fetch leads status',
      errors: error.response?.data?.errors || [{ title: error.message }]
    });
  }
});

/**
 * Добавить лиды
 * POST /api/leads
 */
router.post('/', async (req, res) => {
  try {
    const leadsData = req.body;

    // Валидация
    if (!leadsData || !leadsData.leads || !Array.isArray(leadsData.leads) || leadsData.leads.length === 0) {
      return res.status(400).json({
        message: 'Request body must contain leads array with at least one lead',
        errors: [{
          id: uuidv4(),
          code: 'BAD_REQUEST',
          title: 'Invalid request body'
        }]
      });
    }

    // Валидация обязательных полей
    for (const lead of leadsData.leads) {
      if (!lead.phone) {
        return res.status(400).json({
          message: 'phone is required for all leads',
          errors: [{
            id: uuidv4(),
            code: 'BAD_REQUEST',
            title: 'Missing required field: phone'
          }]
        });
      }
    }

    // Генерируем X-Global-Transaction-ID если не указан
    const globalTransactionId = req.headers['x-global-transaction-id'] || uuidv4();

    const headers = {
      'X-Global-Transaction-ID': globalTransactionId,
      'Content-Type': 'application/json',
    };

    // Добавляем заголовки авторизации если есть
    if (req.headers['x-ibm-client-id']) {
      headers['X-IBM-Client-Id'] = req.headers['x-ibm-client-id'];
    }
    if (req.headers['x-ibm-client-secret']) {
      headers['X-IBM-Client-Secret'] = req.headers['x-ibm-client-secret'];
    }

    console.log(`[Leads API] POST Add leads: ${leadsData.leads.length} lead(s)`);
    console.log(`[Leads API] Transaction ID: ${globalTransactionId}`);

    const response = await axios.post(
      `${LEADS_API_BASE_URL}/leads_impersonal`,
      leadsData,
      { headers }
    );

    console.log(`[Leads API] Response status: ${response.status}`);
    
    // Возвращаем X-Global-Transaction-ID и Location в заголовках ответа
    if (response.headers['x-global-transaction-id']) {
      res.set('X-Global-Transaction-ID', response.headers['x-global-transaction-id']);
    }
    if (response.headers['location']) {
      res.set('Location', response.headers['location']);
    }
    
    res.json(response.data);
  } catch (error) {
    console.error('Error adding leads:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      message: error.response?.data?.message || 'Failed to add leads',
      errors: error.response?.data?.errors || [{ title: error.message }]
    });
  }
});

/**
 * Проверить лиды
 * POST /api/leads/check
 */
router.post('/check', async (req, res) => {
  try {
    const checkData = req.body;

    // Валидация
    if (!checkData || !checkData.leads || !Array.isArray(checkData.leads) || checkData.leads.length === 0) {
      return res.status(400).json({
        message: 'Request body must contain leads array with at least one lead',
        errors: [{
          id: uuidv4(),
          code: 'BAD_REQUEST',
          title: 'Invalid request body'
        }]
      });
    }

    // Валидация обязательных полей
    for (const lead of checkData.leads) {
      if (!lead.inn || !lead.productCode) {
        return res.status(400).json({
          message: 'inn and productCode are required for all leads',
          errors: [{
            id: uuidv4(),
            code: 'BAD_REQUEST',
            title: 'Missing required fields: inn, productCode'
          }]
        });
      }
    }

    // Генерируем X-Global-Transaction-ID если не указан
    const globalTransactionId = req.headers['x-global-transaction-id'] || uuidv4();

    const headers = {
      'X-Global-Transaction-ID': globalTransactionId,
      'Content-Type': 'application/json',
    };

    // Добавляем заголовки авторизации если есть
    if (req.headers['x-ibm-client-id']) {
      headers['X-IBM-Client-Id'] = req.headers['x-ibm-client-id'];
    }
    if (req.headers['x-ibm-client-secret']) {
      headers['X-IBM-Client-Secret'] = req.headers['x-ibm-client-secret'];
    }

    console.log(`[Leads API] POST Check leads: ${checkData.leads.length} lead(s)`);
    console.log(`[Leads API] Transaction ID: ${globalTransactionId}`);

    const response = await axios.post(
      `${LEADS_API_BASE_URL}/check_leads`,
      checkData,
      { headers }
    );

    console.log(`[Leads API] Response status: ${response.status}`);
    
    // Возвращаем X-Global-Transaction-ID в заголовках ответа
    if (response.headers['x-global-transaction-id']) {
      res.set('X-Global-Transaction-ID', response.headers['x-global-transaction-id']);
    }
    
    res.json(response.data);
  } catch (error) {
    console.error('Error checking leads:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      message: error.response?.data?.message || 'Failed to check leads',
      errors: error.response?.data?.errors || [{ title: error.message }]
    });
  }
});

module.exports = router;

