#!/bin/bash

# Скрипт для создания локального .env файла
# Использование: ./scripts/create-local-env.sh

set -e

CLIENT_DIR="client"

echo "🔧 Создание локального .env файла для разработки..."
echo ""

if [ ! -d "$CLIENT_DIR" ]; then
    echo "❌ Папка $CLIENT_DIR не найдена!"
    exit 1
fi

ENV_FILE="$CLIENT_DIR/.env"

if [ -f "$ENV_FILE" ]; then
    echo "⚠️  Файл $ENV_FILE уже существует!"
    read -p "Перезаписать? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Отменено."
        exit 0
    fi
fi

cat > "$ENV_FILE" << 'EOF'
# API Configuration для локальной разработки
VITE_API_URL=http://localhost:3001/api

# Telegram Configuration
VITE_TELEGRAM_BOT_USERNAME=MultibankYo_bot
VITE_TELEGRAM_WEBAPP_URL=http://localhost:5173

# App Configuration
VITE_APP_NAME=MultiBank
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# FastAPI сервер (для банковских операций)
VITE_API_BASE=https://respectively-maximum-bonobo.cloudpub.ru
VITE_CLIENT_ID_ID="1"
EOF

echo "✅ Файл $ENV_FILE создан!"
echo ""
echo "Теперь вы можете запустить:"
echo "  cd client && npm run dev"
echo ""

