#!/bin/bash

# Скрипт для запуска сервисов MultiBank
# Использование: ./scripts/start-services.sh

set -e

SERVER="multibank-server"
PROJECT_DIR="/opt/multibank"

echo "🚀 Запуск сервисов MultiBank..."
echo ""

# Функция для выполнения команд на сервере
run_remote() {
    ssh $SERVER "$1"
}

echo "🛑 Шаг 1: Остановка существующих процессов PM2..."
run_remote "pm2 stop all 2>/dev/null || true"
run_remote "pm2 delete all 2>/dev/null || true"

echo ""
echo "🚀 Шаг 2: Запуск Backend (Node.js)..."
run_remote "cd $PROJECT_DIR/server && pm2 start src/index.js --name multibank-backend --log-date-format 'YYYY-MM-DD HH:mm:ss Z'"

echo ""
echo "🚀 Шаг 3: Запуск FastAPI..."
run_remote "cd $PROJECT_DIR/server-fastapi && pm2 start 'uvicorn src.main:app --host 0.0.0.0 --port 8000' --name multibank-fastapi --interpreter python3 --log-date-format 'YYYY-MM-DD HH:mm:ss Z'"

echo ""
echo "🚀 Шаг 4: Запуск Telegram Bot..."
run_remote "cd $PROJECT_DIR/telegram-bot && pm2 start src/index.js --name multibank-bot --log-date-format 'YYYY-MM-DD HH:mm:ss Z'"

echo ""
echo "💾 Шаг 5: Сохранение конфигурации PM2..."
run_remote "pm2 save"
run_remote "pm2 startup | tail -1 | bash || true"

echo ""
echo "📊 Шаг 6: Статус сервисов..."
run_remote "pm2 status"

echo ""
echo "✅ Сервисы запущены!"
echo ""
echo "Просмотр логов:"
echo "  ssh $SERVER 'pm2 logs'"
echo "  ssh $SERVER 'pm2 logs multibank-backend'"
echo "  ssh $SERVER 'pm2 logs multibank-fastapi'"
echo "  ssh $SERVER 'pm2 logs multibank-bot'"

