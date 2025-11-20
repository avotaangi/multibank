#!/bin/bash

# Скрипт для настройки переменных окружения клиента на сервере
# Использование: ./scripts/setup-client-env.sh

set -e

SERVER="root@178.217.98.35"
CLIENT_DIR="/opt/multibank/client"

echo "🔧 Настройка переменных окружения для мини-приложения..."
echo ""

# Функция для выполнения команд на сервере
run_remote() {
    ssh $SERVER "$1"
}

echo "📝 Создание .env файла на сервере..."

# Создаем .env файл с правильными значениями для продакшн
run_remote "cat > $CLIENT_DIR/.env << 'EOF'
# API Configuration для продакшн сервера
VITE_API_URL=http://178.217.98.35/api

# Telegram Configuration
VITE_TELEGRAM_BOT_USERNAME=MultibankYo_bot
VITE_TELEGRAM_WEBAPP_URL=http://178.217.98.35

# App Configuration
VITE_APP_NAME=MultiBank
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production

# FastAPI сервер (для банковских операций)
VITE_API_BASE=https://respectively-maximum-bonobo.cloudpub.ru
VITE_CLIENT_ID_ID=\"1\"
EOF
"

echo ""
echo "✅ .env файл создан"
echo ""

echo "🔨 Пересборка фронтенда..."
run_remote "cd $CLIENT_DIR && npm install && npm run build"

echo ""
echo "✅ Фронтенд пересобран"
echo ""

echo "🔄 Перезапуск Nginx..."
run_remote "systemctl restart nginx"

echo ""
echo "✅ Готово!"
echo ""
echo "Проверка:"
echo "  - Откройте http://178.217.98.35 в браузере"
echo "  - Или откройте мини-приложение в Telegram боте @MultibankYo_bot"
echo ""
echo "Проверка файлов:"
echo "  ssh $SERVER 'ls -la $CLIENT_DIR/dist/index.html'"

