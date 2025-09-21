const https = require('https');
const fs = require('fs');
const path = require('path');

// Функция для отправки запроса к Telegram Bot API
const sendTelegramRequest = (method, data) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
};

// Настройка Web App
const setupWebApp = async (webAppUrl) => {
  try {
    console.log('🤖 Настраиваем Telegram Web App...');
    
    const result = await sendTelegramRequest('setWebhook', {
      url: `${webAppUrl}/api/telegram/webhook`
    });
    
    if (result.ok) {
      console.log('✅ Webhook настроен успешно');
    } else {
      console.error('❌ Ошибка настройки webhook:', result.description);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    throw error;
  }
};

// Создание Web App через BotFather
const createWebApp = async (webAppUrl, appName = 'multibank') => {
  try {
    console.log('📱 Создаем Web App через BotFather...');
    console.log('\n📋 Инструкции:');
    console.log('1. Откройте @BotFather в Telegram');
    console.log('2. Отправьте команду /newapp');
    console.log('3. Выберите вашего бота');
    console.log('4. Введите название приложения: MultiBank');
    console.log('5. Введите описание: Мультибанк - управление счетами');
    console.log('6. Загрузите иконку (опционально)');
    console.log(`7. Введите Web App URL: ${webAppUrl}`);
    console.log(`8. Введите короткое имя: ${appName}`);
    console.log('\n🎉 После создания вы получите ссылку на ваше приложение!');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
};

// Основная функция
const main = async () => {
  const webAppUrl = process.argv[2];
  
  if (!webAppUrl) {
    console.log('❌ Укажите URL Web App');
    console.log('Использование: node telegram-webapp.js <webapp-url>');
    console.log('Пример: node telegram-webapp.js https://abc123.ngrok.io');
    process.exit(1);
  }
  
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.log('❌ Установите TELEGRAM_BOT_TOKEN в переменных окружения');
    console.log('Пример: export TELEGRAM_BOT_TOKEN=your_bot_token');
    process.exit(1);
  }
  
  try {
    await setupWebApp(webAppUrl);
    await createWebApp(webAppUrl);
  } catch (error) {
    console.error('❌ Ошибка настройки:', error.message);
    process.exit(1);
  }
};

main();
