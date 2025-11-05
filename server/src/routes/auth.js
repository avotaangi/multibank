const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, verifyTelegramData } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Register/Login with Telegram
router.post('/telegram', 
  verifyTelegramData,
  async (req, res) => {
    try {
      const { telegramUser } = req;
      const { initData } = req.body;

      // Check if user exists
      let user = await User.findOne({ telegramId: telegramUser.id.toString() });

      if (user) {
        // Update last login
        user.lastLogin = new Date();
        await user.save();
      } else {
        // Create new user
        user = new User({
          telegramId: telegramUser.id.toString(),
          username: telegramUser.username || '',
          firstName: telegramUser.first_name || '',
          lastName: telegramUser.last_name || '',
          isVerified: true // Telegram users are considered verified
        });
        await user.save();
      }

      // Generate token
      const token = generateToken(user._id);

      res.json({
        message: 'Authentication successful',
        token,
        user: {
          id: user._id,
          telegramId: user.telegramId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          isVerified: user.isVerified,
          preferences: user.preferences
        }
      });
    } catch (error) {
      console.error('Telegram auth error:', error);
      res.status(500).json({ 
        message: 'Authentication failed',
        code: 'AUTH_FAILED'
      });
    }
  }
);

// Refresh token
router.post('/refresh', 
  authenticateToken,
  async (req, res) => {
    try {
      const token = generateToken(req.user._id);
      
      res.json({
        message: 'Token refreshed',
        token
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({ 
        message: 'Token refresh failed',
        code: 'REFRESH_FAILED'
      });
    }
  }
);

// Set PIN
router.post('/pin',
  authenticateToken,
  [
    body('pin')
      .isLength({ min: 4, max: 6 })
      .isNumeric()
      .withMessage('PIN must be 4-6 digits')
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

      const { pin } = req.body;
      const user = await User.findById(req.user._id);

      user.security.pinHash = pin;
      await user.save();

      res.json({
        message: 'PIN set successfully'
      });
    } catch (error) {
      console.error('PIN setting error:', error);
      res.status(500).json({ 
        message: 'Failed to set PIN',
        code: 'PIN_SET_FAILED'
      });
    }
  }
);

// Verify PIN
router.post('/pin/verify',
  authenticateToken,
  [
    body('pin')
      .isLength({ min: 4, max: 6 })
      .isNumeric()
      .withMessage('PIN must be 4-6 digits')
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

      const { pin } = req.body;
      const user = await User.findById(req.user._id);

      if (!user.security.pinHash) {
        return res.status(400).json({
          message: 'PIN not set',
          code: 'PIN_NOT_SET'
        });
      }

      const isValid = await user.comparePin(pin);
      
      if (!isValid) {
        return res.status(401).json({
          message: 'Invalid PIN',
          code: 'PIN_INVALID'
        });
      }

      res.json({
        message: 'PIN verified successfully'
      });
    } catch (error) {
      console.error('PIN verification error:', error);
      res.status(500).json({ 
        message: 'PIN verification failed',
        code: 'PIN_VERIFY_FAILED'
      });
    }
  }
);

// Logout (client-side token removal)
router.post('/logout',
  authenticateToken,
  async (req, res) => {
    try {
      // In a more sophisticated system, you might want to blacklist the token
      // For now, we just return success and let the client remove the token
      res.json({
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        message: 'Logout failed',
        code: 'LOGOUT_FAILED'
      });
    }
  }
);

// Get current user info
router.get('/me',
  authenticateToken,
  async (req, res) => {
    try {
      res.json({
        user: {
          id: req.user._id,
          telegramId: req.user.telegramId,
          username: req.user.username,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          fullName: req.user.fullName,
          email: req.user.email,
          phone: req.user.phone,
          isVerified: req.user.isVerified,
          preferences: req.user.preferences,
          security: {
            twoFactorEnabled: req.user.security.twoFactorEnabled,
            pinSet: !!req.user.security.pinHash
          },
          lastLogin: req.user.lastLogin,
          createdAt: req.user.createdAt
        }
      });
    } catch (error) {
      console.error('Get user info error:', error);
      res.status(500).json({ 
        message: 'Failed to get user info',
        code: 'USER_INFO_FAILED'
      });
    }
  }
);

// Get list of available banks
router.get('/banks', (req, res) => {
  try {
    // Возвращаем список доступных банков
    // TODO: Позже будет маппинг с персонажами
    const banks = [
      { id: 'vbank', name: 'VBank', url: 'https://vbank.open.bankingapi.ru' },
      { id: 'abank', name: 'ABank', url: 'https://abank.open.bankingapi.ru' },
      { id: 'sbank', name: 'SBank', url: 'https://sbank.open.bankingapi.ru' }
    ];
    
    res.json({ banks });
  } catch (error) {
    console.error('Get banks error:', error);
    res.status(500).json({ 
      message: 'Failed to get banks',
      code: 'BANKS_FETCH_FAILED'
    });
  }
});

// Get bank token (stub for now - will be replaced with real bankingClient)
router.post('/bank-token', async (req, res) => {
  try {
    const { bank } = req.query;
    
    // TODO: Позже будет реальная интеграция с bankingClient
    // Сейчас возвращаем заглушку
    res.json({
      message: 'Bank token endpoint - stub',
      bank: bank || 'vbank',
      note: 'This will be implemented with real bankingClient integration'
    });
  } catch (error) {
    console.error('Get bank token error:', error);
    res.status(500).json({ 
      message: 'Failed to get bank token',
      code: 'BANK_TOKEN_FAILED'
    });
  }
});

module.exports = router;
