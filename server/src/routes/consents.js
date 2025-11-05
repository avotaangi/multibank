import express from 'express';
import bankingClient from '../services/bankingClient.js';

const router = express.Router();

/**
 * Создать согласие на доступ к счетам
 * POST /api/consents/accounts?bank=vbank
 */
router.post('/accounts', async (req, res) => {
  try {
    const { bank = 'vbank' } = req.query;
    const {
      client_id,
      permissions = ['ReadAccountsDetail', 'ReadBalances', 'ReadTransactionsDetail'],
      reason = 'Агрегация счетов для мультибанк-приложения',
      requesting_bank_name = 'MultiBank App'
    } = req.body;
    
    const requesting_bank = bankingClient.teamId;
    
    const headers = {
      'X-Requesting-Bank': requesting_bank
    };
    
    const consent = await bankingClient.request(
      bank,
      'POST',
      '/account-consents/request',
      {
        data: {
          client_id,
          permissions,
          reason,
          requesting_bank,
          requesting_bank_name
        },
        headers
      }
    );
    
    res.json(consent);
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Failed to create account consent'
    });
  }
});

/**
 * Получить согласие по ID
 * GET /api/consents/accounts/:consentId?bank=vbank
 */
router.get('/accounts/:consentId', async (req, res) => {
  try {
    const { consentId } = req.params;
    const { bank = 'vbank' } = req.query;
    
    const consent = await bankingClient.request(
      bank,
      'GET',
      `/account-consents/${consentId}`
    );
    
    res.json(consent);
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Failed to fetch consent'
    });
  }
});

/**
 * Отозвать согласие
 * DELETE /api/consents/accounts/:consentId?bank=vbank
 */
router.delete('/accounts/:consentId', async (req, res) => {
  try {
    const { consentId } = req.params;
    const { bank = 'vbank' } = req.query;
    
    await bankingClient.request(
      bank,
      'DELETE',
      `/account-consents/${consentId}`
    );
    
    res.status(204).send();
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Failed to revoke consent'
    });
  }
});

/**
 * Создать согласие на платежи
 * POST /api/consents/payments?bank=vbank
 */
router.post('/payments', async (req, res) => {
  try {
    const { bank = 'vbank' } = req.query;
    const {
      client_id,
      consent_type = 'single_use',
      amount,
      currency = 'RUB',
      debtor_account,
      creditor_account,
      creditor_name,
      reference,
      max_uses,
      max_amount_per_payment,
      max_total_amount,
      allowed_creditor_accounts,
      vrp_max_individual_amount,
      vrp_daily_limit,
      vrp_monthly_limit,
      valid_until
    } = req.body;
    
    const requesting_bank = bankingClient.teamId;
    
    const headers = {
      'X-Requesting-Bank': requesting_bank
    };
    
    const consentData = {
      requesting_bank,
      client_id,
      consent_type,
      debtor_account
    };
    
    if (amount) consentData.amount = amount;
    if (currency) consentData.currency = currency;
    if (creditor_account) consentData.creditor_account = creditor_account;
    if (creditor_name) consentData.creditor_name = creditor_name;
    if (reference) consentData.reference = reference;
    if (max_uses) consentData.max_uses = max_uses;
    if (max_amount_per_payment) consentData.max_amount_per_payment = max_amount_per_payment;
    if (max_total_amount) consentData.max_total_amount = max_total_amount;
    if (allowed_creditor_accounts) consentData.allowed_creditor_accounts = allowed_creditor_accounts;
    if (vrp_max_individual_amount) consentData.vrp_max_individual_amount = vrp_max_individual_amount;
    if (vrp_daily_limit) consentData.vrp_daily_limit = vrp_daily_limit;
    if (vrp_monthly_limit) consentData.vrp_monthly_limit = vrp_monthly_limit;
    if (valid_until) consentData.valid_until = valid_until;
    
    const consent = await bankingClient.request(
      bank,
      'POST',
      '/payment-consents/request',
      {
        data: consentData,
        headers
      }
    );
    
    res.json(consent);
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Failed to create payment consent'
    });
  }
});

/**
 * Получить согласие на платежи по ID
 * GET /api/consents/payments/:consentId?bank=vbank
 */
router.get('/payments/:consentId', async (req, res) => {
  try {
    const { consentId } = req.params;
    const { bank = 'vbank' } = req.query;
    
    const consent = await bankingClient.request(
      bank,
      'GET',
      `/payment-consents/${consentId}`
    );
    
    res.json(consent);
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Failed to fetch payment consent'
    });
  }
});

/**
 * Отозвать согласие на платежи
 * DELETE /api/consents/payments/:consentId?bank=vbank
 */
router.delete('/payments/:consentId', async (req, res) => {
  try {
    const { consentId } = req.params;
    const { bank = 'vbank' } = req.query;
    
    await bankingClient.request(
      bank,
      'DELETE',
      `/payment-consents/${consentId}`
    );
    
    res.status(204).send();
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Failed to revoke payment consent'
    });
  }
});

/**
 * Создать согласие на управление договорами с продуктами
 * POST /api/consents/product-agreements?bank=vbank&client_id=team096-1
 */
router.post('/product-agreements', async (req, res) => {
  try {
    const { bank = 'vbank', client_id } = req.query;
    const {
      requesting_bank,
      client_id: bodyClientId,
      read_product_agreements,
      open_product_agreements,
      close_product_agreements,
      allowed_product_types,
      max_amount,
      valid_until,
      reason
    } = req.body;
    
    const params = client_id || bodyClientId ? { client_id: client_id || bodyClientId } : {};
    const headers = {};
    
    const consentData = {
      requesting_bank: requesting_bank || bankingClient.teamId,
      client_id: client_id || bodyClientId
    };
    
    if (read_product_agreements !== undefined) consentData.read_product_agreements = read_product_agreements;
    if (open_product_agreements !== undefined) consentData.open_product_agreements = open_product_agreements;
    if (close_product_agreements !== undefined) consentData.close_product_agreements = close_product_agreements;
    if (allowed_product_types) consentData.allowed_product_types = allowed_product_types;
    if (max_amount) consentData.max_amount = max_amount;
    if (valid_until) consentData.valid_until = valid_until;
    if (reason) consentData.reason = reason;
    
    const consent = await bankingClient.request(
      bank,
      'POST',
      '/product-agreement-consents/request',
      {
        data: consentData,
        params,
        headers
      }
    );
    
    res.json(consent);
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Failed to create product agreement consent'
    });
  }
});

/**
 * Получить согласие на управление договорами по ID
 * GET /api/consents/product-agreements/:consentId?bank=vbank
 */
router.get('/product-agreements/:consentId', async (req, res) => {
  try {
    const { consentId } = req.params;
    const { bank = 'vbank' } = req.query;
    
    const consent = await bankingClient.request(
      bank,
      'GET',
      `/product-agreement-consents/${consentId}`
    );
    
    res.json(consent);
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Failed to fetch product agreement consent'
    });
  }
});

/**
 * Отозвать согласие на управление договорами
 * DELETE /api/consents/product-agreements/:consentId?bank=vbank
 */
router.delete('/product-agreements/:consentId', async (req, res) => {
  try {
    const { consentId } = req.params;
    const { bank = 'vbank' } = req.query;
    
    await bankingClient.request(
      bank,
      'DELETE',
      `/product-agreement-consents/${consentId}`
    );
    
    res.status(204).send();
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || 'Failed to revoke product agreement consent'
    });
  }
});

export default router;

