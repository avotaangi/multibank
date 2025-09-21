const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Развертывание MultiBank на Vercel...\n');

// Проверяем, установлен ли Vercel CLI
const checkVercelCLI = () => {
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
};

// Устанавливаем Vercel CLI
const installVercelCLI = () => {
  console.log('📦 Устанавливаем Vercel CLI...');
  try {
    execSync('npm install -g vercel', { stdio: 'inherit' });
    console.log('✅ Vercel CLI установлен');
    return true;
  } catch (error) {
    console.error('❌ Ошибка установки Vercel CLI:', error.message);
    return false;
  }
};

// Создаем .vercelignore
const createVercelIgnore = () => {
  const vercelIgnore = `node_modules
server
scripts
*.md
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
ssl
telegram-bot
docker-compose.yml
Dockerfile
nginx.conf
`;

  fs.writeFileSync('.vercelignore', vercelIgnore);
  console.log('✅ Создан .vercelignore');
};

// Создаем package.json для корня проекта
const createRootPackageJson = () => {
  const packageJson = {
    "name": "multibank",
    "version": "1.0.0",
    "description": "MultiBank - Telegram Web App",
    "scripts": {
      "build": "cd client && npm run build",
      "dev": "cd client && npm run dev",
      "deploy": "vercel --prod"
    },
    "devDependencies": {
      "vercel": "^32.0.0"
    }
  };

  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('✅ Создан корневой package.json');
};

// Основная функция
const main = async () => {
  try {
    console.log('🔍 Проверяем Vercel CLI...');
    
    if (!checkVercelCLI()) {
      console.log('❌ Vercel CLI не установлен');
      if (!installVercelCLI()) {
        process.exit(1);
      }
    } else {
      console.log('✅ Vercel CLI найден');
    }

    console.log('\n📁 Подготавливаем проект...');
    createVercelIgnore();
    createRootPackageJson();

    console.log('\n🏗️ Собираем проект...');
    execSync('cd client && npm run build', { stdio: 'inherit' });

    console.log('\n🚀 Развертываем на Vercel...');
    console.log('📋 Инструкции:');
    console.log('1. Выполните: vercel login');
    console.log('2. Выполните: vercel --prod');
    console.log('3. Скопируйте полученный URL');
    console.log('4. Настройте Telegram Web App с этим URL');

    console.log('\n🎉 Готово! Следуйте инструкциям выше.');

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
};

main();
