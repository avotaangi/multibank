const express = require('express');
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user's transactions
router.get('/',
  authenticateToken,
  async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 20, 
        type, 
        status, 
        accountId,
        startDate,
        endDate 
      } = req.query;

      const query = { userId: req.user._id };

      // Add filters
      if (type) query.type = type;
      if (status) query.status = status;
      if (accountId) {
        query.$or = [
          { fromAccount: accountId },
          { toAccount: accountId }
        ];
      }
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
      }

      const transactions = await Transaction.find(query)
        .populate('fromAccount', 'accountNumber accountType')
        .populate('toAccount', 'accountNumber accountType')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Transaction.countDocuments(query);

      res.json({
        transactions: transactions.map(transaction => ({
          id: transaction._id,
          transactionId: transaction.transactionId,
          type: transaction.type,
          category: transaction.category,
          amount: transaction.amount,
          currency: transaction.currency,
          exchangeRate: transaction.exchangeRate,
          description: transaction.description,
          status: transaction.status,
          reference: transaction.reference,
          fromAccount: transaction.fromAccount,
          toAccount: transaction.toAccount,
          fees: transaction.fees,
          formattedAmount: transaction.formattedAmount,
          totalAmount: transaction.totalAmount,
          metadata: transaction.metadata,
          createdAt: transaction.createdAt,
          processedAt: transaction.processedAt
        })),
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({ 
        message: 'Failed to get transactions',
        code: 'TRANSACTIONS_FETCH_FAILED'
      });
    }
  }
);

// Get specific transaction
router.get('/:transactionId',
  authenticateToken,
  async (req, res) => {
    try {
      const transaction = await Transaction.findOne({
        _id: req.params.transactionId,
        userId: req.user._id
      })
      .populate('fromAccount', 'accountNumber accountType')
      .populate('toAccount', 'accountNumber accountType');

      if (!transaction) {
        return res.status(404).json({
          message: 'Transaction not found',
          code: 'TRANSACTION_NOT_FOUND'
        });
      }

      res.json({
        transaction: {
          id: transaction._id,
          transactionId: transaction.transactionId,
          type: transaction.type,
          category: transaction.category,
          amount: transaction.amount,
          currency: transaction.currency,
          exchangeRate: transaction.exchangeRate,
          description: transaction.description,
          status: transaction.status,
          reference: transaction.reference,
          fromAccount: transaction.fromAccount,
          toAccount: transaction.toAccount,
          fees: transaction.fees,
          formattedAmount: transaction.formattedAmount,
          totalAmount: transaction.totalAmount,
          metadata: transaction.metadata,
          createdAt: transaction.createdAt,
          processedAt: transaction.processedAt
        }
      });
    } catch (error) {
      console.error('Get transaction error:', error);
      res.status(500).json({ 
        message: 'Failed to get transaction',
        code: 'TRANSACTION_FETCH_FAILED'
      });
    }
  }
);

// Create transfer between accounts
router.post('/transfer',
  authenticateToken,
  [
    body('fromAccountId')
      .isMongoId()
      .withMessage('Invalid from account ID'),
    body('toAccountId')
      .isMongoId()
      .withMessage('Invalid to account ID'),
    body('amount')
      .isNumeric()
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be a positive number'),
    body('description')
      .isLength({ min: 1, max: 500 })
      .withMessage('Description is required and must be less than 500 characters'),
    body('category')
      .optional()
      .isIn(['food', 'transport', 'shopping', 'bills', 'entertainment', 'health', 'education', 'other'])
      .withMessage('Invalid category')
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

      const { fromAccountId, toAccountId, amount, description, category, reference } = req.body;
      const amountInCents = Math.round(amount * 100);

      // Validate accounts belong to user
      const fromAccount = await Account.findOne({
        _id: fromAccountId,
        userId: req.user._id,
        status: 'active'
      });

      const toAccount = await Account.findOne({
        _id: toAccountId,
        userId: req.user._id,
        status: 'active'
      });

      if (!fromAccount) {
        return res.status(404).json({
          message: 'Source account not found',
          code: 'FROM_ACCOUNT_NOT_FOUND'
        });
      }

      if (!toAccount) {
        return res.status(404).json({
          message: 'Destination account not found',
          code: 'TO_ACCOUNT_NOT_FOUND'
        });
      }

      if (fromAccountId === toAccountId) {
        return res.status(400).json({
          message: 'Cannot transfer to the same account',
          code: 'SAME_ACCOUNT_TRANSFER'
        });
      }

      // Check sufficient funds
      if (!fromAccount.hasSufficientFunds(amountInCents)) {
        return res.status(400).json({
          message: 'Insufficient funds',
          code: 'INSUFFICIENT_FUNDS'
        });
      }

      // Create transaction
      const transaction = new Transaction({
        fromAccount: fromAccountId,
        toAccount: toAccountId,
        userId: req.user._id,
        type: 'transfer',
        category: category || 'other',
        amount: amountInCents,
        currency: fromAccount.currency,
        description,
        reference: reference || '',
        status: 'pending'
      });

      await transaction.save();

      // Process the transfer
      try {
        await fromAccount.debit(amountInCents);
        await toAccount.credit(amountInCents);
        
        await transaction.complete();

        res.status(201).json({
          message: 'Transfer completed successfully',
          transaction: {
            id: transaction._id,
            transactionId: transaction.transactionId,
            type: transaction.type,
            amount: transaction.amount,
            currency: transaction.currency,
            description: transaction.description,
            status: transaction.status,
            fromAccount: {
              id: fromAccount._id,
              accountNumber: fromAccount.accountNumber,
              newBalance: fromAccount.balance
            },
            toAccount: {
              id: toAccount._id,
              accountNumber: toAccount.accountNumber,
              newBalance: toAccount.balance
            },
            createdAt: transaction.createdAt
          }
        });
      } catch (transferError) {
        await transaction.fail();
        throw transferError;
      }
    } catch (error) {
      console.error('Transfer error:', error);
      res.status(500).json({ 
        message: 'Transfer failed',
        code: 'TRANSFER_FAILED'
      });
    }
  }
);

// Get transaction summary
router.get('/stats/summary',
  authenticateToken,
  async (req, res) => {
    try {
      const { startDate, endDate, accountId } = req.query;
      
      const match = { userId: req.user._id };
      
      if (startDate && endDate) {
        match.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      if (accountId) {
        match.$or = [
          { fromAccount: accountId },
          { toAccount: accountId }
        ];
      }

      const summary = await Transaction.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            avgAmount: { $avg: '$amount' },
            completedTransactions: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            pendingTransactions: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            failedTransactions: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
            }
          }
        }
      ]);

      const categoryStats = await Transaction.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        },
        { $sort: { totalAmount: -1 } }
      ]);

      res.json({
        summary: summary[0] || {
          totalTransactions: 0,
          totalAmount: 0,
          avgAmount: 0,
          completedTransactions: 0,
          pendingTransactions: 0,
          failedTransactions: 0
        },
        categoryStats
      });
    } catch (error) {
      console.error('Get transaction summary error:', error);
      res.status(500).json({ 
        message: 'Failed to get transaction summary',
        code: 'SUMMARY_FETCH_FAILED'
      });
    }
  }
);

module.exports = router;
