const { spawn } = require('child_process');
const https = require('https');

// Проверяем, установлен ли ngrok
const checkNgrok = () => {
  return new Promise((resolve) => {
    const ngrok = spawn('ngrok', ['version'], { stdio: 'pipe' });
    ngrok.on('close', (code) => {
      resolve(code === 0);
    });
    ngrok.on('error', () => {
      resolve(false);
    });
  });
};

// Получаем публичный URL от ngrok
const getNgrokUrl = () => {
  return new Promise((resolve, reject) => {
    const req = https.get('http://localhost:4040/api/tunnels', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const tunnels = JSON.parse(data);
          const httpsTunnel = tunnels.tunnels.find(tunnel => tunnel.proto === 'https');
          if (httpsTunnel) {
            resolve(httpsTunnel.public_url);
          } else {
            reject(new Error('HTTPS туннель не найден'));
          }
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
};

// Запускаем ngrok
const startNgrok = () => {
  return new Promise((resolve, reject) => {
    console.log('🚀 Запускаем ngrok...');
    
    const ngrok = spawn('ngrok', ['http', '8443', '--log=stdout'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let output = '';
    
    ngrok.stdout.on('data', (data) => {
      output += data.toString();
      console.log(data.toString());
    });
    
    ngrok.stderr.on('data', (data) => {
      console.error(data.toString());
    });
    
    ngrok.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ngrok завершился с кодом ${code}`));
      }
    });
    
    // Ждем немного, чтобы ngrok запустился
    setTimeout(async () => {
      try {
        const url = await getNgrokUrl();
        console.log(`\n🌐 Публичный URL: ${url}`);
        console.log(`📱 Используйте этот URL для Telegram Web App`);
        resolve({ ngrok, url });
      } catch (error) {
        console.error('❌ Ошибка получения URL:', error.message);
        reject(error);
      }
    }, 3000);
  });
};

// Основная функция
const main = async () => {
  try {
    console.log('🔍 Проверяем ngrok...');
    const ngrokInstalled = await checkNgrok();
    
    if (!ngrokInstalled) {
      console.log('❌ ngrok не установлен!');
      console.log('📥 Установите ngrok:');
      console.log('   brew install ngrok/ngrok/ngrok');
      console.log('   или скачайте с https://ngrok.com/');
      process.exit(1);
    }
    
    console.log('✅ ngrok найден');
    
    const { ngrok, url } = await startNgrok();
    
    console.log('\n🎉 Настройка завершена!');
    console.log(`📱 Telegram Web App URL: ${url}`);
    console.log('\n📋 Следующие шаги:');
    console.log('1. Скопируйте URL выше');
    console.log('2. Отправьте /newapp в @BotFather');
    console.log('3. Вставьте URL в поле "Web App URL"');
    console.log('4. Выберите короткое имя для приложения');
    console.log('\n⏹️  Нажмите Ctrl+C для остановки');
    
    // Обработка сигналов
    process.on('SIGINT', () => {
      console.log('\n🛑 Останавливаем ngrok...');
      ngrok.kill();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
};

main();
