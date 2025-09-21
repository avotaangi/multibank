const express = require('express');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

const router = express.Router();

// Verify Telegram Web App data signature
const verifyTelegramWebAppData = (initData, botToken) => {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    
    return calculatedHash === hash;
  } catch (error) {
    console.error('Telegram data verification error:', error);
    return false;
  }
};

// Webhook endpoint for Telegram bot
router.post('/webhook',
  async (req, res) => {
    try {
      const { message, callback_query } = req.body;
      
      if (message) {
        await handleMessage(message);
      } else if (callback_query) {
        await handleCallbackQuery(callback_query);
      }
      
      res.json({ ok: true });
    } catch (error) {
      console.error('Telegram webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

// Handle incoming messages
const handleMessage = async (message) => {
  const { from, text, chat } = message;
  
  if (!from || !text) return;
  
  try {
    // Find or create user
    let user = await User.findOne({ telegramId: from.id.toString() });
    
    if (!user) {
      user = new User({
        telegramId: from.id.toString(),
        username: from.username || '',
        firstName: from.first_name || '',
        lastName: from.last_name || '',
        isVerified: true
      });
      await user.save();
    }
    
    // Handle commands
    switch (text) {
      case '/start':
        await sendWelcomeMessage(chat.id, user);
        break;
      case '/balance':
        await sendBalanceMessage(chat.id, user);
        break;
      case '/help':
        await sendHelpMessage(chat.id);
        break;
      default:
        await sendUnknownCommandMessage(chat.id);
    }
  } catch (error) {
    console.error('Message handling error:', error);
  }
};

// Handle callback queries
const handleCallbackQuery = async (callbackQuery) => {
  const { from, data, message } = callbackQuery;
  
  try {
    const user = await User.findOne({ telegramId: from.id.toString() });
    if (!user) return;
    
    // Handle different callback data
    switch (data) {
      case 'get_balance':
        await sendBalanceMessage(message.chat.id, user);
        break;
      case 'get_transactions':
        await sendRecentTransactions(message.chat.id, user);
        break;
      default:
        // Handle other callback data
        break;
    }
  } catch (error) {
    console.error('Callback query handling error:', error);
  }
};

// Send welcome message
const sendWelcomeMessage = async (chatId, user) => {
  const message = `
🏦 Добро пожаловать в MultiBank, ${user.firstName}!

Ваш аккаунт успешно создан. Теперь вы можете:

💰 Проверить баланс
📊 Просмотреть историю транзакций
💸 Совершать переводы
⚙️ Настроить уведомления

Используйте команды ниже или откройте веб-приложение для полного доступа к функциям банка.

Команды:
/balance - Проверить баланс
/help - Помощь
  `;
  
  // In a real implementation, you would send this via Telegram Bot API
  console.log(`Sending welcome message to chat ${chatId}:`, message);
};

// Send balance message
const sendBalanceMessage = async (chatId, user) => {
  try {
    const accounts = await Account.find({ 
      userId: user._id, 
      status: 'active' 
    });
    
    if (accounts.length === 0) {
      const message = "У вас пока нет активных счетов. Создайте счет в веб-приложении.";
      console.log(`Sending message to chat ${chatId}:`, message);
      return;
    }
    
    let message = "💰 Ваши счета:\n\n";
    
    for (const account of accounts) {
      const balance = (account.balance / 100).toFixed(2);
      message += `🏦 ${account.accountType.toUpperCase()}\n`;
      message += `Номер: ${account.accountNumber}\n`;
      message += `Баланс: ${balance} ${account.currency}\n\n`;
    }
    
    console.log(`Sending balance message to chat ${chatId}:`, message);
  } catch (error) {
    console.error('Error sending balance message:', error);
  }
};

// Send recent transactions
const sendRecentTransactions = async (chatId, user) => {
  try {
    const transactions = await Transaction.find({ userId: user._id })
      .populate('fromAccount', 'accountNumber')
      .populate('toAccount', 'accountNumber')
      .sort({ createdAt: -1 })
      .limit(5);
    
    if (transactions.length === 0) {
      const message = "У вас пока нет транзакций.";
      console.log(`Sending message to chat ${chatId}:`, message);
      return;
    }
    
    let message = "📊 Последние транзакции:\n\n";
    
    for (const transaction of transactions) {
      const amount = (transaction.amount / 100).toFixed(2);
      const date = transaction.createdAt.toLocaleDateString('ru-RU');
      message += `💸 ${transaction.type.toUpperCase()}\n`;
      message += `Сумма: ${amount} ${transaction.currency}\n`;
      message += `Описание: ${transaction.description}\n`;
      message += `Дата: ${date}\n\n`;
    }
    
    console.log(`Sending transactions message to chat ${chatId}:`, message);
  } catch (error) {
    console.error('Error sending transactions message:', error);
  }
};

// Send help message
const sendHelpMessage = async (chatId) => {
  const message = `
🆘 Помощь по MultiBank

Доступные команды:
/start - Начать работу с ботом
/balance - Проверить баланс счетов
/help - Показать это сообщение

Для полного доступа к функциям банка откройте веб-приложение.

Поддержка: support@multibank.com
  `;
  
  console.log(`Sending help message to chat ${chatId}:`, message);
};

// Send unknown command message
const sendUnknownCommandMessage = async (chatId) => {
  const message = "❓ Неизвестная команда. Используйте /help для получения списка доступных команд.";
  console.log(`Sending unknown command message to chat ${chatId}:`, message);
};

// Get Telegram Web App configuration
router.get('/webapp-config',
  async (req, res) => {
    try {
      const config = {
        botUsername: process.env.TELEGRAM_BOT_USERNAME || 'multibank_bot',
        webAppUrl: process.env.TELEGRAM_WEBAPP_URL || 'https://your-domain.com',
        commands: [
          { command: 'start', description: 'Начать работу с ботом' },
          { command: 'balance', description: 'Проверить баланс' },
          { command: 'help', description: 'Помощь' }
        ]
      };
      
      res.json(config);
    } catch (error) {
      console.error('Get webapp config error:', error);
      res.status(500).json({ 
        message: 'Failed to get webapp configuration',
        code: 'CONFIG_FETCH_FAILED'
      });
    }
  }
);

// Verify Telegram Web App data
router.post('/verify-webapp',
  [
    body('initData')
      .notEmpty()
      .withMessage('Init data is required')
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

      const { initData } = req.body;
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      
      if (!botToken) {
        return res.status(500).json({
          message: 'Telegram bot token not configured',
          code: 'BOT_TOKEN_MISSING'
        });
      }

      const isValid = verifyTelegramWebAppData(initData, botToken);
      
      if (!isValid) {
        return res.status(401).json({
          message: 'Invalid Telegram Web App data',
          code: 'INVALID_WEBAPP_DATA'
        });
      }

      // Parse user data from init data
      const urlParams = new URLSearchParams(initData);
      const userData = JSON.parse(urlParams.get('user') || '{}');
      
      res.json({
        message: 'Telegram Web App data verified',
        user: userData
      });
    } catch (error) {
      console.error('Verify webapp error:', error);
      res.status(500).json({ 
        message: 'Failed to verify Telegram Web App data',
        code: 'VERIFY_FAILED'
      });
    }
  }
);

module.exports = router;
