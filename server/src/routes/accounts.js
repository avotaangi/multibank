const express = require('express');
const { body, validationResult } = require('express-validator');
const Account = require('../models/Account');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user's accounts
router.get('/',
  authenticateToken,
  async (req, res) => {
    try {
      const accounts = await Account.find({ 
        userId: req.user._id,
        status: { $ne: 'closed' }
      }).sort({ isDefault: -1, createdAt: -1 });

      res.json({
        accounts: accounts.map(account => ({
          id: account._id,
          accountNumber: account.accountNumber,
          accountType: account.accountType,
          currency: account.currency,
          balance: account.balance,
          availableBalance: account.availableBalance,
          creditLimit: account.creditLimit,
          interestRate: account.interestRate,
          status: account.status,
          isDefault: account.isDefault,
          formattedBalance: account.formattedBalance,
          metadata: account.metadata,
          createdAt: account.createdAt
        }))
      });
    } catch (error) {
      console.error('Get accounts error:', error);
      res.status(500).json({ 
        message: 'Failed to get accounts',
        code: 'ACCOUNTS_FETCH_FAILED'
      });
    }
  }
);

// Get specific account
router.get('/:accountId',
  authenticateToken,
  async (req, res) => {
    try {
      const account = await Account.findOne({
        _id: req.params.accountId,
        userId: req.user._id
      });

      if (!account) {
        return res.status(404).json({
          message: 'Account not found',
          code: 'ACCOUNT_NOT_FOUND'
        });
      }

      res.json({
        account: {
          id: account._id,
          accountNumber: account.accountNumber,
          accountType: account.accountType,
          currency: account.currency,
          balance: account.balance,
          availableBalance: account.availableBalance,
          creditLimit: account.creditLimit,
          interestRate: account.interestRate,
          status: account.status,
          isDefault: account.isDefault,
          formattedBalance: account.formattedBalance,
          metadata: account.metadata,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt
        }
      });
    } catch (error) {
      console.error('Get account error:', error);
      res.status(500).json({ 
        message: 'Failed to get account',
        code: 'ACCOUNT_FETCH_FAILED'
      });
    }
  }
);

// Create new account
router.post('/',
  authenticateToken,
  [
    body('accountType')
      .isIn(['checking', 'savings', 'credit', 'investment'])
      .withMessage('Invalid account type'),
    body('currency')
      .optional()
      .isIn(['USD', 'EUR', 'RUB', 'UAH'])
      .withMessage('Invalid currency'),
    body('initialBalance')
      .optional()
      .isNumeric()
      .isFloat({ min: 0 })
      .withMessage('Initial balance must be a positive number')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { accountType, currency, initialBalance, creditLimit } = req.body;

      // Check if user already has a default account of this type
      const existingDefault = await Account.findOne({
        userId: req.user._id,
        accountType,
        isDefault: true,
        status: 'active'
      });

      const account = new Account({
        userId: req.user._id,
        accountType,
        currency: currency || req.user.preferences.currency || 'USD',
        balance: initialBalance ? Math.round(initialBalance * 100) : 0, // Convert to cents
        availableBalance: initialBalance ? Math.round(initialBalance * 100) : 0,
        creditLimit: creditLimit ? Math.round(creditLimit * 100) : 0,
        isDefault: !existingDefault // Make default if no default account of this type exists
      });

      await account.save();

      res.status(201).json({
        message: 'Account created successfully',
        account: {
          id: account._id,
          accountNumber: account.accountNumber,
          accountType: account.accountType,
          currency: account.currency,
          balance: account.balance,
          availableBalance: account.availableBalance,
          creditLimit: account.creditLimit,
          status: account.status,
          isDefault: account.isDefault,
          formattedBalance: account.formattedBalance,
          metadata: account.metadata,
          createdAt: account.createdAt
        }
      });
    } catch (error) {
      console.error('Create account error:', error);
      res.status(500).json({ 
        message: 'Failed to create account',
        code: 'ACCOUNT_CREATE_FAILED'
      });
    }
  }
);

// Set default account
router.put('/:accountId/default',
  authenticateToken,
  async (req, res) => {
    try {
      const account = await Account.findOne({
        _id: req.params.accountId,
        userId: req.user._id,
        status: 'active'
      });

      if (!account) {
        return res.status(404).json({
          message: 'Account not found',
          code: 'ACCOUNT_NOT_FOUND'
        });
      }

      // Remove default status from other accounts of the same type
      await Account.updateMany(
        { 
          userId: req.user._id, 
          accountType: account.accountType,
          _id: { $ne: account._id }
        },
        { $set: { isDefault: false } }
      );

      // Set this account as default
      account.isDefault = true;
      await account.save();

      res.json({
        message: 'Default account updated successfully',
        account: {
          id: account._id,
          accountNumber: account.accountNumber,
          accountType: account.accountType,
          isDefault: account.isDefault
        }
      });
    } catch (error) {
      console.error('Set default account error:', error);
      res.status(500).json({ 
        message: 'Failed to set default account',
        code: 'DEFAULT_ACCOUNT_FAILED'
      });
    }
  }
);

// Update account settings
router.put('/:accountId',
  authenticateToken,
  [
    body('status')
      .optional()
      .isIn(['active', 'suspended', 'closed'])
      .withMessage('Invalid status'),
    body('creditLimit')
      .optional()
      .isNumeric()
      .isFloat({ min: 0 })
      .withMessage('Credit limit must be a positive number')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const account = await Account.findOne({
        _id: req.params.accountId,
        userId: req.user._id
      });

      if (!account) {
        return res.status(404).json({
          message: 'Account not found',
          code: 'ACCOUNT_NOT_FOUND'
        });
      }

      const { status, creditLimit } = req.body;

      if (status) account.status = status;
      if (creditLimit !== undefined) {
        account.creditLimit = Math.round(creditLimit * 100);
      }

      await account.save();

      res.json({
        message: 'Account updated successfully',
        account: {
          id: account._id,
          accountNumber: account.accountNumber,
          status: account.status,
          creditLimit: account.creditLimit
        }
      });
    } catch (error) {
      console.error('Update account error:', error);
      res.status(500).json({ 
        message: 'Failed to update account',
        code: 'ACCOUNT_UPDATE_FAILED'
      });
    }
  }
);

// Get account balance
router.get('/:accountId/balance',
  authenticateToken,
  async (req, res) => {
    try {
      const account = await Account.findOne({
        _id: req.params.accountId,
        userId: req.user._id
      });

      if (!account) {
        return res.status(404).json({
          message: 'Account not found',
          code: 'ACCOUNT_NOT_FOUND'
        });
      }

      res.json({
        balance: {
          accountId: account._id,
          accountNumber: account.accountNumber,
          balance: account.balance,
          availableBalance: account.availableBalance,
          creditLimit: account.creditLimit,
          currency: account.currency,
          formattedBalance: account.formattedBalance,
          lastUpdated: account.updatedAt
        }
      });
    } catch (error) {
      console.error('Get balance error:', error);
      res.status(500).json({ 
        message: 'Failed to get balance',
        code: 'BALANCE_FETCH_FAILED'
      });
    }
  }
);

module.exports = router;
