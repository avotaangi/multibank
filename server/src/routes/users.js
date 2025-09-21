const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Update user profile
router.put('/profile',
  authenticateToken,
  [
    body('email')
      .optional()
      .isEmail()
      .withMessage('Invalid email format'),
    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Invalid phone format'),
    body('preferences.currency')
      .optional()
      .isIn(['USD', 'EUR', 'RUB', 'UAH'])
      .withMessage('Invalid currency'),
    body('preferences.language')
      .optional()
      .isIn(['en', 'ru', 'uk'])
      .withMessage('Invalid language')
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

      const { email, phone, preferences } = req.body;
      const user = await User.findById(req.user._id);

      // Check if email is already taken by another user
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ 
          email, 
          _id: { $ne: user._id } 
        });
        if (existingUser) {
          return res.status(400).json({
            message: 'Email already in use',
            code: 'EMAIL_EXISTS'
          });
        }
        user.email = email;
      }

      if (phone !== undefined) user.phone = phone;
      if (preferences) {
        if (preferences.currency) user.preferences.currency = preferences.currency;
        if (preferences.language) user.preferences.language = preferences.language;
        if (preferences.notifications) {
          user.preferences.notifications = {
            ...user.preferences.notifications,
            ...preferences.notifications
          };
        }
      }

      await user.save();

      res.json({
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          telegramId: user.telegramId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          preferences: user.preferences,
          isVerified: user.isVerified
        }
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ 
        message: 'Failed to update profile',
        code: 'PROFILE_UPDATE_FAILED'
      });
    }
  }
);

// Update user preferences
router.put('/preferences',
  authenticateToken,
  [
    body('currency')
      .optional()
      .isIn(['USD', 'EUR', 'RUB', 'UAH'])
      .withMessage('Invalid currency'),
    body('language')
      .optional()
      .isIn(['en', 'ru', 'uk'])
      .withMessage('Invalid language'),
    body('notifications.email')
      .optional()
      .isBoolean()
      .withMessage('Email notifications must be boolean'),
    body('notifications.telegram')
      .optional()
      .isBoolean()
      .withMessage('Telegram notifications must be boolean')
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

      const { currency, language, notifications } = req.body;
      const user = await User.findById(req.user._id);

      if (currency) user.preferences.currency = currency;
      if (language) user.preferences.language = language;
      if (notifications) {
        user.preferences.notifications = {
          ...user.preferences.notifications,
          ...notifications
        };
      }

      await user.save();

      res.json({
        message: 'Preferences updated successfully',
        preferences: user.preferences
      });
    } catch (error) {
      console.error('Preferences update error:', error);
      res.status(500).json({ 
        message: 'Failed to update preferences',
        code: 'PREFERENCES_UPDATE_FAILED'
      });
    }
  }
);

// Get user statistics
router.get('/stats',
  authenticateToken,
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      
      // This would typically include more complex statistics
      // For now, we'll return basic user info
      const stats = {
        accountAge: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)), // days
        isVerified: user.isVerified,
        hasEmail: !!user.email,
        hasPhone: !!user.phone,
        hasPin: !!user.security.pinHash,
        twoFactorEnabled: user.security.twoFactorEnabled,
        lastLogin: user.lastLogin,
        preferences: user.preferences
      };

      res.json({
        stats
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({ 
        message: 'Failed to get user statistics',
        code: 'STATS_FAILED'
      });
    }
  }
);

// Delete user account
router.delete('/account',
  authenticateToken,
  async (req, res) => {
    try {
      // In a real application, you would want to:
      // 1. Verify the user's identity (PIN, password, etc.)
      // 2. Handle pending transactions
      // 3. Archive data instead of deleting
      // 4. Send confirmation email/SMS
      
      const user = await User.findById(req.user._id);
      user.isActive = false;
      await user.save();

      res.json({
        message: 'Account deactivated successfully'
      });
    } catch (error) {
      console.error('Account deletion error:', error);
      res.status(500).json({ 
        message: 'Failed to deactivate account',
        code: 'ACCOUNT_DELETE_FAILED'
      });
    }
  }
);

module.exports = router;
