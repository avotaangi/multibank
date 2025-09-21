const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

// Bot configuration
const token = process.env.TELEGRAM_BOT_TOKEN;
const apiUrl = process.env.API_URL || 'http://localhost:3001/api';

if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN is required');
  process.exit(1);
}

// Create bot instance
const bot = new TelegramBot(token, { polling: true });

// API client
const api = axios.create({
  baseURL: apiUrl,
  timeout: 10000,
});

// Bot commands
const commands = [
  { command: 'start', description: 'Начать работу с ботом' },
  { command: 'balance', description: 'Проверить баланс' },
  { command: 'transactions', description: 'Последние транзакции' },
  { command: 'help', description: 'Помощь' },
  { command: 'webapp', description: 'Открыть веб-приложение' }
];

// Set bot commands
bot.setMyCommands(commands);

// Start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;
  
  try {
    // Register or update user
    await api.post('/auth/telegram', {
      initData: `user=${JSON.stringify({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username
      })}&chat_instance=${chatId}&chat_type=sender&auth_date=${Math.floor(Date.now() / 1000)}&hash=bot_hash`
    });

    const welcomeMessage = `
🏦 Добро пожаловать в MultiBank, ${user.first_name}!

Ваш аккаунт успешно создан. Теперь вы можете:

💰 Проверить баланс - /balance
📊 Просмотреть транзакции - /transactions
💸 Совершать переводы
⚙️ Настроить уведомления

Для полного доступа к функциям банка используйте веб-приложение:
/webapp

Команды:
/balance - Проверить баланс
/transactions - Последние транзакции
/help - Помощь
/webapp - Открыть веб-приложение
    `;

    await bot.sendMessage(chatId, welcomeMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '💰 Баланс', callback_data: 'get_balance' },
            { text: '📊 Транзакции', callback_data: 'get_transactions' }
          ],
          [
            { text: '🌐 Открыть приложение', web_app: { url: process.env.WEBAPP_URL || 'https://your-domain.com' } }
          ]
        ]
      }
    });
  } catch (error) {
    console.error('Start command error:', error);
    await bot.sendMessage(chatId, '❌ Произошла ошибка при инициализации. Попробуйте позже.');
  }
});

// Balance command
bot.onText(/\/balance/, async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;
  
  try {
    // Get user's accounts
    const response = await api.get('/accounts', {
      headers: {
        'Authorization': `Bearer ${await getUserToken(user.id)}`
      }
    });

    const accounts = response.data.accounts;
    
    if (accounts.length === 0) {
      await bot.sendMessage(chatId, "У вас пока нет активных счетов. Создайте счет в веб-приложении.");
      return;
    }
    
    let message = "💰 Ваши счета:\n\n";
    
    for (const account of accounts) {
      const balance = (account.balance / 100).toFixed(2);
      message += `🏦 ${account.accountType.toUpperCase()}\n`;
      message += `Номер: ${account.accountNumber}\n`;
      message += `Баланс: ${balance} ${account.currency}\n\n`;
    }
    
    await bot.sendMessage(chatId, message);
  } catch (error) {
    console.error('Balance command error:', error);
    await bot.sendMessage(chatId, '❌ Не удалось получить информацию о балансе.');
  }
});

// Transactions command
bot.onText(/\/transactions/, async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;
  
  try {
    const response = await api.get('/transactions?limit=5', {
      headers: {
        'Authorization': `Bearer ${await getUserToken(user.id)}`
      }
    });

    const transactions = response.data.transactions;
    
    if (transactions.length === 0) {
      await bot.sendMessage(chatId, "У вас пока нет транзакций.");
      return;
    }
    
    let message = "📊 Последние транзакции:\n\n";
    
    for (const transaction of transactions) {
      const amount = (transaction.amount / 100).toFixed(2);
      const date = new Date(transaction.createdAt).toLocaleDateString('ru-RU');
      message += `💸 ${transaction.type.toUpperCase()}\n`;
      message += `Сумма: ${amount} ${transaction.currency}\n`;
      message += `Описание: ${transaction.description}\n`;
      message += `Дата: ${date}\n\n`;
    }
    
    await bot.sendMessage(chatId, message);
  } catch (error) {
    console.error('Transactions command error:', error);
    await bot.sendMessage(chatId, '❌ Не удалось получить историю транзакций.');
  }
});

// Webapp command
bot.onText(/\/webapp/, async (msg) => {
  const chatId = msg.chat.id;
  
  const message = "🌐 Откройте веб-приложение для полного доступа к функциям банка:";
  
  await bot.sendMessage(chatId, message, {
    reply_markup: {
      inline_keyboard: [
        [
          { 
            text: '🚀 Открыть MultiBank', 
            web_app: { url: process.env.WEBAPP_URL || 'https://your-domain.com' } 
          }
        ]
      ]
    }
  });
});

// Help command
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  
  const message = `
🆘 Помощь по MultiBank

Доступные команды:
/start - Начать работу с ботом
/balance - Проверить баланс счетов
/transactions - Последние транзакции
/webapp - Открыть веб-приложение
/help - Показать это сообщение

Для полного доступа к функциям банка откройте веб-приложение.

Поддержка: support@multibank.com
  `;
  
  await bot.sendMessage(chatId, message);
});

// Handle callback queries
bot.on('callback_query', async (callbackQuery) => {
  const message = callbackQuery.message;
  const data = callbackQuery.data;
  const user = callbackQuery.from;
  
  try {
    switch (data) {
      case 'get_balance':
        // Trigger balance command
        await bot.sendMessage(message.chat.id, '💰 Получение информации о балансе...');
        // You can call the balance logic here
        break;
        
      case 'get_transactions':
        // Trigger transactions command
        await bot.sendMessage(message.chat.id, '📊 Получение истории транзакций...');
        // You can call the transactions logic here
        break;
    }
    
    // Answer callback query
    await bot.answerCallbackQuery(callbackQuery.id);
  } catch (error) {
    console.error('Callback query error:', error);
    await bot.answerCallbackQuery(callbackQuery.id, { text: 'Произошла ошибка' });
  }
});

// Helper function to get user token (simplified)
async function getUserToken(telegramId) {
  try {
    // In a real implementation, you would store and retrieve user tokens
    // For now, we'll create a temporary token or use a different approach
    const response = await api.post('/auth/telegram', {
      initData: `user=${JSON.stringify({ id: telegramId })}&chat_instance=0&chat_type=sender&auth_date=${Math.floor(Date.now() / 1000)}&hash=bot_hash`
    });
    return response.data.token;
  } catch (error) {
    console.error('Get user token error:', error);
    return null;
  }
}

// Error handling
bot.on('error', (error) => {
  console.error('Bot error:', error);
});

bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

// Start the bot
console.log('🤖 MultiBank Telegram Bot started');
console.log('📱 Bot username:', process.env.TELEGRAM_BOT_USERNAME || 'Not set');
console.log('🌐 WebApp URL:', process.env.WEBAPP_URL || 'Not set');
