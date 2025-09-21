const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-security.pinHash');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        message: 'Invalid or inactive user',
        code: 'USER_INVALID'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token',
        code: 'TOKEN_INVALID'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

// Verify Telegram Web App data
const verifyTelegramData = (req, res, next) => {
  try {
    const { initData } = req.body;
    
    if (!initData) {
      return res.status(400).json({ 
        message: 'Telegram init data required',
        code: 'TELEGRAM_DATA_MISSING'
      });
    }

    // Parse Telegram init data
    const urlParams = new URLSearchParams(initData);
    const userData = JSON.parse(urlParams.get('user') || '{}');
    
    if (!userData.id) {
      return res.status(400).json({ 
        message: 'Invalid Telegram user data',
        code: 'TELEGRAM_USER_INVALID'
      });
    }

    req.telegramUser = userData;
    next();
  } catch (error) {
    console.error('Telegram verification error:', error);
    res.status(400).json({ 
      message: 'Invalid Telegram data format',
      code: 'TELEGRAM_DATA_INVALID'
    });
  }
};

// Optional authentication (for public endpoints that can work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-security.pinHash');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

// Check if user has specific role or permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Add role-based permission logic here if needed
    // For now, all authenticated users have basic permissions
    next();
  };
};

// Rate limiting for sensitive operations
const sensitiveOperationLimit = (req, res, next) => {
  // This would integrate with a more sophisticated rate limiting system
  // For now, we rely on the global rate limiter
  next();
};

module.exports = {
  authenticateToken,
  verifyTelegramData,
  optionalAuth,
  requirePermission,
  sensitiveOperationLimit
};
