const https = require('https');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8226697395:AAGp98RUQfJo-sLL-OaH0wwXtIdjeeaCs8A';
const WEBAPP_URL = 'https://nonacquiescing-ungovernmentally-paz.ngrok-free.app';

if (!BOT_TOKEN) {
  console.log('❌ Установите TELEGRAM_BOT_TOKEN в переменных окружения');
  process.exit(1);
}

// Функция для отправки запроса к Telegram Bot API
const sendTelegramRequest = (method, data = {}) => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/${method}`,
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

// Получение информации о боте
const getBotInfo = async () => {
  try {
    console.log('🤖 Получаем информацию о боте...');
    const result = await sendTelegramRequest('getMe');
    
    if (result.ok) {
      console.log('✅ Бот найден:', result.result.first_name);
      console.log('📱 Username:', result.result.username);
      return result.result;
    } else {
      console.error('❌ Ошибка получения информации о боте:', result.description);
      return null;
    }
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    return null;
  }
};

// Настройка Web App
const setupWebApp = async () => {
  try {
    console.log('🌐 Настраиваем Web App...');
    console.log('📱 URL:', WEBAPP_URL);
    
    const result = await sendTelegramRequest('setWebhook', {
      url: `${WEBAPP_URL}/api/telegram/webhook`
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

// Основная функция
const main = async () => {
  try {
    console.log('🚀 Настройка Telegram Web App для MultiBank\n');
    
    // Получаем информацию о боте
    const botInfo = await getBotInfo();
    if (!botInfo) {
      process.exit(1);
    }
    
    console.log('\n📋 Инструкции для настройки Web App в BotFather:\n');
    
    console.log('1️⃣ Откройте @BotFather в Telegram');
    console.log('2️⃣ Отправьте команду /newapp');
    console.log('3️⃣ Выберите вашего бота:', botInfo.username);
    console.log('4️⃣ Настройте Web App:');
    console.log('   • Название: MultiBank');
    console.log('   • Описание: Мультибанк - управление счетами и переводами');
    console.log('   • Web App URL:', WEBAPP_URL);
    console.log('   • Короткое имя: multibank');
    
    console.log('\n5️⃣ После настройки вы получите ссылку:');
    console.log(`   https://t.me/${botInfo.username}/multibank`);
    
    console.log('\n🎉 Готово! Откройте ссылку в Telegram для тестирования!');
    
    // Настраиваем webhook
    await setupWebApp();
    
  } catch (error) {
    console.error('❌ Ошибка настройки:', error.message);
    process.exit(1);
  }
};

main();
