const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const CREDIT_PRODUCTS_API_BASE_URL = 'https://api.bankingapi.ru/extapi/aft/manageCreditProducts/hackathon/v1';

// Helper function to generate UUID for x-fapi-interaction-id
const generateInteractionId = () => {
  return uuidv4();
};

// Helper function to build headers
const buildHeaders = (req) => {
  const headers = {
    'Content-Type': 'application/json',
    'x-fapi-interaction-id': req.headers['x-fapi-interaction-id'] || generateInteractionId(),
  };

  // Add Authorization header if present
  if (req.headers['authorization']) {
    headers['Authorization'] = req.headers['authorization'];
  }

  // Add optional headers
  if (req.headers['x-fapi-customer-ip-address']) {
    headers['x-fapi-customer-ip-address'] = req.headers['x-fapi-customer-ip-address'];
  }
  if (req.headers['x-customer-user-agent']) {
    headers['x-customer-user-agent'] = req.headers['x-customer-user-agent'];
  }
  if (req.headers['if-modified-since']) {
    headers['If-Modified-Since'] = req.headers['if-modified-since'];
  }
  if (req.headers['if-none-match']) {
    headers['If-None-Match'] = req.headers['if-none-match'];
  }

  return headers;
};

/**
 * Получить список доступных банковских продуктов
 * GET /api/credit-products/products?page=1
 */
router.get('/products', async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const headers = buildHeaders(req);

    const params = { page: parseInt(page) };

    console.log(`[Credit Products API] GET Products list, page: ${page}`);

    const response = await axios.get(
      `${CREDIT_PRODUCTS_API_BASE_URL}/products`,
      { headers, params }
    );

    console.log(`[Credit Products API] Response status: ${response.status}`);

    // Forward x-fapi-interaction-id from response
    if (response.headers['x-fapi-interaction-id']) {
      res.set('x-fapi-interaction-id', response.headers['x-fapi-interaction-id']);
    }

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching credit products:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      message: error.response?.data?.message || 'Failed to fetch credit products',
      errors: error.response?.data?.Errors || [{ title: error.message }]
    });
  }
});

/**
 * Получить детальную информацию о продукте
 * GET /api/credit-products/products/:productId
 */
router.get('/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const headers = buildHeaders(req);

    console.log(`[Credit Products API] GET Product details: ${productId}`);

    const response = await axios.get(
      `${CREDIT_PRODUCTS_API_BASE_URL}/products/${productId}`,
      { headers }
    );

    console.log(`[Credit Products API] Response status: ${response.status}`);

    // Forward headers from response
    if (response.headers['x-fapi-interaction-id']) {
      res.set('x-fapi-interaction-id', response.headers['x-fapi-interaction-id']);
    }
    if (response.headers['etag']) {
      res.set('Etag', response.headers['etag']);
    }

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching product details:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      message: error.response?.data?.message || 'Failed to fetch product details',
      errors: error.response?.data?.Errors || [{ title: error.message }]
    });
  }
});

/**
 * Создать ресурс лидогенерации
 * POST /api/credit-products/customer-leads
 */
router.post('/customer-leads', async (req, res) => {
  try {
    const leadsData = req.body;
    const headers = buildHeaders(req);

    // Authorization is required
    if (!headers['Authorization']) {
      return res.status(401).json({
        message: 'Authorization header is required',
        errors: [{ title: 'Missing Authorization header' }]
      });
    }

    console.log(`[Credit Products API] POST Create customer lead`);

    const response = await axios.post(
      `${CREDIT_PRODUCTS_API_BASE_URL}/customer-leads`,
      leadsData,
      { headers }
    );

    console.log(`[Credit Products API] Response status: ${response.status}`);

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error creating customer lead:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      message: error.response?.data?.message || 'Failed to create customer lead',
      errors: error.response?.data?.Errors || [{ title: error.message }]
    });
  }
});

/**
 * Получить детали лидогенерации
 * GET /api/credit-products/customer-leads/:customerLeadId
 */
router.get('/customer-leads/:customerLeadId', async (req, res) => {
  try {
    const { customerLeadId } = req.params;
    const headers = buildHeaders(req);

    // Authorization is required
    if (!headers['Authorization']) {
      return res.status(401).json({
        message: 'Authorization header is required',
        errors: [{ title: 'Missing Authorization header' }]
      });
    }

    console.log(`[Credit Products API] GET Customer lead: ${customerLeadId}`);

    const response = await axios.get(
      `${CREDIT_PRODUCTS_API_BASE_URL}/customer-leads/${customerLeadId}`,
      { headers }
    );

    console.log(`[Credit Products API] Response status: ${response.status}`);

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching customer lead:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      message: error.response?.data?.message || 'Failed to fetch customer lead',
      errors: error.response?.data?.Errors || [{ title: error.message }]
    });
  }
});

/**
 * Удалить лидогенерацию
 * DELETE /api/credit-products/customer-leads/:customerLeadId
 */
router.delete('/customer-leads/:customerLeadId', async (req, res) => {
  try {
    const { customerLeadId } = req.params;
    const headers = buildHeaders(req);

    // Authorization is required
    if (!headers['Authorization']) {
      return res.status(401).json({
        message: 'Authorization header is required',
        errors: [{ title: 'Missing Authorization header' }]
      });
    }

    console.log(`[Credit Products API] DELETE Customer lead: ${customerLeadId}`);

    const response = await axios.delete(
      `${CREDIT_PRODUCTS_API_BASE_URL}/customer-leads/${customerLeadId}`,
      { headers }
    );

    console.log(`[Credit Products API] Response status: ${response.status}`);

    res.status(response.status).send();
  } catch (error) {
    console.error('Error deleting customer lead:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      message: error.response?.data?.message || 'Failed to delete customer lead',
      errors: error.response?.data?.Errors || [{ title: error.message }]
    });
  }
});

/**
 * Создать предложение по продукту
 * POST /api/credit-products/product-offers
 */
router.post('/product-offers', async (req, res) => {
  try {
    const offerData = req.body;
    const headers = buildHeaders(req);

    // Authorization is required
    if (!headers['Authorization']) {
      return res.status(401).json({
        message: 'Authorization header is required',
        errors: [{ title: 'Missing Authorization header' }]
      });
    }

    console.log(`[Credit Products API] POST Create product offer`);

    const response = await axios.post(
      `${CREDIT_PRODUCTS_API_BASE_URL}/product-offers`,
      offerData,
      { headers }
    );

    console.log(`[Credit Products API] Response status: ${response.status}`);

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error creating product offer:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      message: error.response?.data?.message || 'Failed to create product offer',
      errors: error.response?.data?.Errors || [{ title: error.message }]
    });
  }
});

/**
 * Получить список всех предложений
 * GET /api/credit-products/product-offers
 */
router.get('/product-offers', async (req, res) => {
  try {
    const headers = buildHeaders(req);

    // Authorization is required
    if (!headers['Authorization']) {
      return res.status(401).json({
        message: 'Authorization header is required',
        errors: [{ title: 'Missing Authorization header' }]
      });
    }

    console.log(`[Credit Products API] GET Product offers list`);

    const response = await axios.get(
      `${CREDIT_PRODUCTS_API_BASE_URL}/product-offers`,
      { headers }
    );

    console.log(`[Credit Products API] Response status: ${response.status}`);

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching product offers:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      message: error.response?.data?.message || 'Failed to fetch product offers',
      errors: error.response?.data?.Errors || [{ title: error.message }]
    });
  }
});

/**
 * Получить детали предложения
 * GET /api/credit-products/product-offers/:offerId
 */
router.get('/product-offers/:offerId', async (req, res) => {
  try {
    const { offerId } = req.params;
    const headers = buildHeaders(req);

    // Authorization is required
    if (!headers['Authorization']) {
      return res.status(401).json({
        message: 'Authorization header is required',
        errors: [{ title: 'Missing Authorization header' }]
      });
    }

    console.log(`[Credit Products API] GET Product offer: ${offerId}`);

    const response = await axios.get(
      `${CREDIT_PRODUCTS_API_BASE_URL}/product-offers/${offerId}`,
      { headers }
    );

    console.log(`[Credit Products API] Response status: ${response.status}`);

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching product offer:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      message: error.response?.data?.message || 'Failed to fetch product offer',
      errors: error.response?.data?.Errors || [{ title: error.message }]
    });
  }
});

/**
 * Удалить предложение
 * DELETE /api/credit-products/product-offers/:offerId
 */
router.delete('/product-offers/:offerId', async (req, res) => {
  try {
    const { offerId } = req.params;
    const headers = buildHeaders(req);

    // Authorization is required
    if (!headers['Authorization']) {
      return res.status(401).json({
        message: 'Authorization header is required',
        errors: [{ title: 'Missing Authorization header' }]
      });
    }

    console.log(`[Credit Products API] DELETE Product offer: ${offerId}`);

    const response = await axios.delete(
      `${CREDIT_PRODUCTS_API_BASE_URL}/product-offers/${offerId}`,
      { headers }
    );

    console.log(`[Credit Products API] Response status: ${response.status}`);

    res.status(response.status).send();
  } catch (error) {
    console.error('Error deleting product offer:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      message: error.response?.data?.message || 'Failed to delete product offer',
      errors: error.response?.data?.Errors || [{ title: error.message }]
    });
  }
});

/**
 * Создать согласие на предложение
 * POST /api/credit-products/product-offer-consents
 */
router.post('/product-offer-consents', async (req, res) => {
  try {
    const consentData = req.body;
    const headers = buildHeaders(req);

    // Authorization is required
    if (!headers['Authorization']) {
      return res.status(401).json({
        message: 'Authorization header is required',
        errors: [{ title: 'Missing Authorization header' }]
      });
    }

    console.log(`[Credit Products API] POST Create product offer consent`);

    const response = await axios.post(
      `${CREDIT_PRODUCTS_API_BASE_URL}/product-offer-consents`,
      consentData,
      { headers }
    );

    console.log(`[Credit Products API] Response status: ${response.status}`);

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error creating product offer consent:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      message: error.response?.data?.message || 'Failed to create product offer consent',
      errors: error.response?.data?.Errors || [{ title: error.message }]
    });
  }
});

/**
 * Получить детали согласия
 * GET /api/credit-products/product-offer-consents/:consentId
 */
router.get('/product-offer-consents/:consentId', async (req, res) => {
  try {
    const { consentId } = req.params;
    const headers = buildHeaders(req);

    // Authorization is required
    if (!headers['Authorization']) {
      return res.status(401).json({
        message: 'Authorization header is required',
        errors: [{ title: 'Missing Authorization header' }]
      });
    }

    console.log(`[Credit Products API] GET Product offer consent: ${consentId}`);

    const response = await axios.get(
      `${CREDIT_PRODUCTS_API_BASE_URL}/product-offer-consents/${consentId}`,
      { headers }
    );

    console.log(`[Credit Products API] Response status: ${response.status}`);

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching product offer consent:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      message: error.response?.data?.message || 'Failed to fetch product offer consent',
      errors: error.response?.data?.Errors || [{ title: error.message }]
    });
  }
});

/**
 * Удалить согласие
 * DELETE /api/credit-products/product-offer-consents/:consentId
 */
router.delete('/product-offer-consents/:consentId', async (req, res) => {
  try {
    const { consentId } = req.params;
    const headers = buildHeaders(req);

    // Authorization is required
    if (!headers['Authorization']) {
      return res.status(401).json({
        message: 'Authorization header is required',
        errors: [{ title: 'Missing Authorization header' }]
      });
    }

    console.log(`[Credit Products API] DELETE Product offer consent: ${consentId}`);

    const response = await axios.delete(
      `${CREDIT_PRODUCTS_API_BASE_URL}/product-offer-consents/${consentId}`,
      { headers }
    );

    console.log(`[Credit Products API] Response status: ${response.status}`);

    res.status(response.status).send();
  } catch (error) {
    console.error('Error deleting product offer consent:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      message: error.response?.data?.message || 'Failed to delete product offer consent',
      errors: error.response?.data?.Errors || [{ title: error.message }]
    });
  }
});

/**
 * Создать заявление по продукту
 * POST /api/credit-products/product-application
 */
router.post('/product-application', async (req, res) => {
  try {
    const applicationData = req.body;
    const headers = buildHeaders(req);

    // Authorization is required
    if (!headers['Authorization']) {
      return res.status(401).json({
        message: 'Authorization header is required',
        errors: [{ title: 'Missing Authorization header' }]
      });
    }

    console.log(`[Credit Products API] POST Create product application`);

    const response = await axios.post(
      `${CREDIT_PRODUCTS_API_BASE_URL}/product-application`,
      applicationData,
      { headers }
    );

    console.log(`[Credit Products API] Response status: ${response.status}`);

    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Error creating product application:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      message: error.response?.data?.message || 'Failed to create product application',
      errors: error.response?.data?.Errors || [{ title: error.message }]
    });
  }
});

/**
 * Получить список заявлений
 * GET /api/credit-products/product-application
 */
router.get('/product-application', async (req, res) => {
  try {
    const headers = buildHeaders(req);

    // Authorization is required
    if (!headers['Authorization']) {
      return res.status(401).json({
        message: 'Authorization header is required',
        errors: [{ title: 'Missing Authorization header' }]
      });
    }

    console.log(`[Credit Products API] GET Product applications list`);

    const response = await axios.get(
      `${CREDIT_PRODUCTS_API_BASE_URL}/product-application`,
      { headers }
    );

    console.log(`[Credit Products API] Response status: ${response.status}`);

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching product applications:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      message: error.response?.data?.message || 'Failed to fetch product applications',
      errors: error.response?.data?.Errors || [{ title: error.message }]
    });
  }
});

/**
 * Получить детали заявления
 * GET /api/credit-products/product-application/:productApplicationId
 */
router.get('/product-application/:productApplicationId', async (req, res) => {
  try {
    const { productApplicationId } = req.params;
    const headers = buildHeaders(req);

    // Authorization is required
    if (!headers['Authorization']) {
      return res.status(401).json({
        message: 'Authorization header is required',
        errors: [{ title: 'Missing Authorization header' }]
      });
    }

    console.log(`[Credit Products API] GET Product application: ${productApplicationId}`);

    const response = await axios.get(
      `${CREDIT_PRODUCTS_API_BASE_URL}/product-application/${productApplicationId}`,
      { headers }
    );

    console.log(`[Credit Products API] Response status: ${response.status}`);

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching product application:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      message: error.response?.data?.message || 'Failed to fetch product application',
      errors: error.response?.data?.Errors || [{ title: error.message }]
    });
  }
});

/**
 * Удалить заявление
 * DELETE /api/credit-products/product-application/:productApplicationId
 */
router.delete('/product-application/:productApplicationId', async (req, res) => {
  try {
    const { productApplicationId } = req.params;
    const headers = buildHeaders(req);

    // Authorization is required
    if (!headers['Authorization']) {
      return res.status(401).json({
        message: 'Authorization header is required',
        errors: [{ title: 'Missing Authorization header' }]
      });
    }

    console.log(`[Credit Products API] DELETE Product application: ${productApplicationId}`);

    const response = await axios.delete(
      `${CREDIT_PRODUCTS_API_BASE_URL}/product-application/${productApplicationId}`,
      { headers }
    );

    console.log(`[Credit Products API] Response status: ${response.status}`);

    res.status(response.status).send();
  } catch (error) {
    console.error('Error deleting product application:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      message: error.response?.data?.message || 'Failed to delete product application',
      errors: error.response?.data?.Errors || [{ title: error.message }]
    });
  }
});

module.exports = router;

