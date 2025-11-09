#!/bin/bash

# Скрипт для настройки проекта на сервере
# Использование: ./scripts/setup-project.sh

set -e

SERVER="multibank-server"
PROJECT_DIR="/opt/multibank"

echo "🔧 Настройка проекта MultiBank на сервере..."
echo ""

# Функция для выполнения команд на сервере
run_remote() {
    ssh $SERVER "$1"
}

echo "📦 Шаг 1: Копирование проекта на сервер..."
echo "Используется rsync для синхронизации файлов..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude '__pycache__' \
    --exclude '*.pyc' \
    --exclude '.env' \
    --exclude '.DS_Store' \
    ./ $SERVER:$PROJECT_DIR/

echo ""
echo "📝 Шаг 2: Настройка переменных окружения..."

# Backend .env
echo "Настройка server/.env..."
run_remote "cd $PROJECT_DIR/server && if [ ! -f .env ]; then cp env.example .env; fi"

# Frontend .env
echo "Настройка client/.env..."
run_remote "cd $PROJECT_DIR/client && if [ ! -f .env ]; then cp env.example .env; fi"

# FastAPI .env
echo "Настройка server-fastapi/.env..."
run_remote "cd $PROJECT_DIR/server-fastapi && if [ ! -f .env ]; then cp env.example .env; fi"

# Telegram Bot .env
echo "Настройка telegram-bot/.env..."
run_remote "cd $PROJECT_DIR/telegram-bot && if [ ! -f .env ]; then cp env.example .env; fi"

echo ""
echo "⚠️  ВАЖНО: Отредактируйте .env файлы на сервере!"
echo "   ssh $SERVER"
echo "   nano $PROJECT_DIR/server/.env"
echo "   nano $PROJECT_DIR/client/.env"
echo "   nano $PROJECT_DIR/server-fastapi/.env"
echo "   nano $PROJECT_DIR/telegram-bot/.env"

echo ""
echo "📦 Шаг 3: Установка зависимостей..."

echo "Установка зависимостей Backend..."
run_remote "cd $PROJECT_DIR/server && npm install"

echo "Установка зависимостей Frontend..."
run_remote "cd $PROJECT_DIR/client && npm install"

echo "Установка зависимостей FastAPI..."
run_remote "cd $PROJECT_DIR/server-fastapi && pip3 install -r requirements.txt"

echo "Установка зависимостей Telegram Bot..."
run_remote "cd $PROJECT_DIR/telegram-bot && npm install"

echo ""
echo "🏗️  Шаг 4: Сборка Frontend..."
run_remote "cd $PROJECT_DIR/client && npm run build"

echo ""
echo "✅ Настройка проекта завершена!"
echo ""
echo "Следующий шаг: Запуск сервисов"
echo "Используйте скрипт: ./scripts/start-services.sh"

