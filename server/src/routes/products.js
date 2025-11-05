import express from 'express';
import bankingClient from '../services/bankingClient.js';

const router = express.Router();

/**
 * Получить каталог продуктов из всех банков
 * GET /api/products?bank=vbank&product_type=deposit
 */
router.get('/', async (req, res) => {
  try {
    const { bank, product_type } = req.query;
    const banks = bank ? [bank] : bankingClient.getBanks();
    
    const allProducts = [];
    
    for (const bankName of banks) {
      try {
        const params = product_type ? { product_type } : {};
        const products = await bankingClient.request(
          bankName,
          'GET',
          '/products',
          { params }
        );
        
        if (products.products || Array.isArray(products)) {
          const productsList = products.products || products;
          productsList.forEach(product => {
            product.bank = bankName;
            product.bankName = bankName.toUpperCase();
          });
          allProducts.push(...productsList);
        }
      } catch (error) {
        console.error(`Error fetching products from ${bankName}:`, error.message);
      }
    }
    
    res.json({ products: allProducts });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Failed to fetch products'
    });
  }
});

/**
 * Получить список договоров с продуктами
 * GET /api/products/agreements?bank=vbank&client_id=team096-1
 */
router.get('/agreements', async (req, res) => {
  try {
    const { bank, client_id } = req.query;
    const banks = bank ? [bank] : bankingClient.getBanks();
    
    const allAgreements = [];
    
    for (const bankName of banks) {
      try {
        const params = client_id ? { client_id } : {};
        const headers = {};
        
        if (req.headers['x-product-agreement-consent-id']) {
          headers['X-Product-Agreement-Consent-Id'] = req.headers['x-product-agreement-consent-id'];
        }
        if (req.headers['x-requesting-bank']) {
          headers['X-Requesting-Bank'] = req.headers['x-requesting-bank'];
        }
        
        const agreements = await bankingClient.request(
          bankName,
          'GET',
          '/product-agreements',
          { params, headers }
        );
        
        if (agreements.agreements || Array.isArray(agreements)) {
          const agreementsList = agreements.agreements || agreements;
          agreementsList.forEach(agreement => {
            agreement.bank = bankName;
          });
          allAgreements.push(...agreementsList);
        }
      } catch (error) {
        console.error(`Error fetching agreements from ${bankName}:`, error.message);
      }
    }
    
    res.json({ agreements: allAgreements });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Failed to fetch agreements'
    });
  }
});

/**
 * Открыть договор с продуктом
 * POST /api/products/agreements?bank=vbank&client_id=team096-1
 */
router.post('/agreements', async (req, res) => {
  try {
    const { bank = 'vbank', client_id } = req.query;
    const { product_id, amount, term_months, source_account_id } = req.body;
    
    const params = client_id ? { client_id } : {};
    const headers = {};
    
    if (req.headers['x-product-agreement-consent-id']) {
      headers['X-Product-Agreement-Consent-Id'] = req.headers['x-product-agreement-consent-id'];
    }
    if (req.headers['x-requesting-bank']) {
      headers['X-Requesting-Bank'] = req.headers['x-requesting-bank'];
    }
    
    const agreement = await bankingClient.request(
      bank,
      'POST',
      '/product-agreements',
      {
        data: {
          product_id,
          amount,
          term_months,
          source_account_id
        },
        params,
        headers
      }
    );
    
    agreement.bank = bank;
    res.json(agreement);
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Failed to create agreement'
    });
  }
});

/**
 * Получить детали договора
 * GET /api/products/agreements/:agreementId?bank=vbank&client_id=team096-1
 */
router.get('/agreements/:agreementId', async (req, res) => {
  try {
    const { agreementId } = req.params;
    const { bank = 'vbank', client_id } = req.query;
    
    const params = client_id ? { client_id } : {};
    const headers = {};
    
    if (req.headers['x-product-agreement-consent-id']) {
      headers['X-Product-Agreement-Consent-Id'] = req.headers['x-product-agreement-consent-id'];
    }
    if (req.headers['x-requesting-bank']) {
      headers['X-Requesting-Bank'] = req.headers['x-requesting-bank'];
    }
    
    const agreement = await bankingClient.request(
      bank,
      'GET',
      `/product-agreements/${agreementId}`,
      { params, headers }
    );
    
    agreement.bank = bank;
    res.json(agreement);
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Failed to fetch agreement'
    });
  }
});

/**
 * Закрыть договор
 * DELETE /api/products/agreements/:agreementId?bank=vbank&client_id=team096-1
 */
router.delete('/agreements/:agreementId', async (req, res) => {
  try {
    const { agreementId } = req.params;
    const { bank = 'vbank', client_id } = req.query;
    
    const params = client_id ? { client_id } : {};
    const headers = {};
    
    if (req.headers['x-product-agreement-consent-id']) {
      headers['X-Product-Agreement-Consent-Id'] = req.headers['x-product-agreement-consent-id'];
    }
    if (req.headers['x-requesting-bank']) {
      headers['X-Requesting-Bank'] = req.headers['x-requesting-bank'];
    }
    
    const data = req.body?.repayment_account_id || req.body?.repayment_amount ? {
      repayment_account_id: req.body.repayment_account_id,
      repayment_amount: req.body.repayment_amount
    } : undefined;
    
    await bankingClient.request(
      bank,
      'DELETE',
      `/product-agreements/${agreementId}`,
      {
        data,
        params,
        headers
      }
    );
    
    res.status(204).send();
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Failed to close agreement'
    });
  }
});

/**
 * Получить детали продукта
 * GET /api/products/:productId?bank=vbank
 */
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { bank = 'vbank' } = req.query;
    
    const product = await bankingClient.request(
      bank,
      'GET',
      `/products/${productId}`
    );
    
    product.bank = bank;
    product.bankName = bank.toUpperCase();
    
    res.json(product);
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Failed to fetch product'
    });
  }
});

export default router;

