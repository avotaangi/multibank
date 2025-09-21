#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Запускаем MultiBank Telegram Web App...\n');

// Функция для запуска процесса
const startProcess = (command, args, options = {}) => {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });
    
    process.on('error', (error) => {
      reject(error);
    });
  });
};

// Основная функция
const main = async () => {
  try {
    console.log('📋 Пошаговая инструкция для настройки Telegram Web App:\n');
    
    console.log('1️⃣  Запустите MongoDB (если не запущен):');
    console.log('   brew services start mongodb-community\n');
    
    console.log('2️⃣  Запустите backend сервер:');
    console.log('   cd server && npm run dev\n');
    
    console.log('3️⃣  Запустите frontend сервер:');
    console.log('   cd client && npm run dev\n');
    
    console.log('4️⃣  В новом терминале запустите HTTPS сервер:');
    console.log('   node scripts/https-server.js\n');
    
    console.log('5️⃣  В еще одном терминале запустите ngrok:');
    console.log('   node scripts/setup-ngrok.js\n');
    
    console.log('6️⃣  Настройте Telegram Bot:');
    console.log('   - Откройте @BotFather в Telegram');
    console.log('   - Отправьте /newapp');
    console.log('   - Выберите вашего бота');
    console.log('   - Введите название: MultiBank');
    console.log('   - Введите описание: Мультибанк - управление счетами');
    console.log('   - Вставьте URL от ngrok (https://...)');
    console.log('   - Введите короткое имя: multibank\n');
    
    console.log('7️⃣  Протестируйте приложение:');
    console.log('   - Откройте ссылку от BotFather в Telegram');
    console.log('   - Или найдите вашего бота и нажмите "Menu" -> "Web App"\n');
    
    console.log('🎉 Готово! Ваше мини-приложение должно работать в Telegram!\n');
    
    console.log('📱 Полезные ссылки:');
    console.log('   - Telegram Web App API: https://core.telegram.org/bots/webapps');
    console.log('   - BotFather: https://t.me/BotFather');
    console.log('   - ngrok: https://ngrok.com/\n');
    
    console.log('⚠️  Важно:');
    console.log('   - ngrok URL меняется при каждом перезапуске');
    console.log('   - Для продакшена нужен постоянный домен с SSL');
    console.log('   - Самоподписанные сертификаты работают только для разработки\n');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
};

main();
