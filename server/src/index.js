const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const accountRoutes = require('./routes/accounts');
const transactionRoutes = require('./routes/transactions');
const telegramRoutes = require('./routes/telegram');
const rewardsRoutes = require('./routes/rewards');
const leadsRoutes = require('./routes/leads');
const creditProductsRoutes = require('./routes/creditProducts');
const cashLoanApplicationsRoutes = require('./routes/cashLoanApplications');
const cardManagementRoutes = require('./routes/cardManagement');
const cardOperationsRoutes = require('./routes/cardOperations');
const universalPaymentsRoutes = require('./routes/universalPayments');
const mobilePaymentsRoutes = require('./routes/mobilePayments');

// Open Banking API routes (ES modules - need dynamic import)
let consentsRoutes, paymentsRoutes, productsRoutes;

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'http://localhost:5174', 
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:5179',
  'http://localhost:5180'
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/multibank')
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/credit-products', creditProductsRoutes);
app.use('/api/cash-loan-applications', cashLoanApplicationsRoutes);
app.use('/api/card-management', cardManagementRoutes);
app.use('/api/card-operations', cardOperationsRoutes);
app.use('/api/universal-payments', universalPaymentsRoutes);
app.use('/api/mobile-payments', mobilePaymentsRoutes);

// Open Banking API routes (dynamically imported)
(async () => {
  try {
    const consentsModule = await import('./routes/consents.js');
    consentsRoutes = consentsModule.default;
    app.use('/api/consents', consentsRoutes);
    console.log('✅ Consents routes loaded');
  } catch (error) {
    console.error('❌ Error loading consents routes:', error.message);
  }

  try {
    const paymentsModule = await import('./routes/payments.js');
    paymentsRoutes = paymentsModule.default;
    app.use('/api/payments', paymentsRoutes);
    console.log('✅ Payments routes loaded');
  } catch (error) {
    console.error('❌ Error loading payments routes:', error.message);
  }

  try {
    const productsModule = await import('./routes/products.js');
    productsRoutes = productsModule.default;
    app.use('/api/products', productsRoutes);
    console.log('✅ Products routes loaded');
  } catch (error) {
    console.error('❌ Error loading products routes:', error.message);
  }
})();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
});
