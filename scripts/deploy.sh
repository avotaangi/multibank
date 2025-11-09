#!/bin/bash

# Скрипт для развертывания MultiBank на сервере
# Использование: ./scripts/deploy.sh

set -e

SERVER="multibank-server"
PROJECT_DIR="/opt/multibank"
REPO_URL="https://github.com/yourusername/multibank.git"  # Замените на ваш репозиторий

echo "🚀 Начало развертывания MultiBank на сервере..."
echo ""

# Функция для выполнения команд на сервере
run_remote() {
    ssh $SERVER "$1"
}

# Функция для копирования файлов
copy_to_server() {
    scp -r "$1" $SERVER:"$2"
}

echo "📦 Шаг 1: Установка системных зависимостей..."
run_remote "apt update && apt upgrade -y"

echo ""
echo "📦 Шаг 2: Установка MongoDB..."
run_remote "curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor && echo 'deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse' | tee /etc/apt/sources.list.d/mongodb-org-7.0.list && apt update && apt install -y mongodb-org"

echo ""
echo "📦 Шаг 3: Установка PM2..."
run_remote "npm install -g pm2"

echo ""
echo "📦 Шаг 4: Установка Nginx..."
run_remote "apt install -y nginx"

echo ""
echo "📦 Шаг 5: Запуск MongoDB..."
run_remote "systemctl start mongod && systemctl enable mongod"

echo ""
echo "📦 Шаг 6: Создание директории проекта..."
run_remote "mkdir -p $PROJECT_DIR && cd $PROJECT_DIR"

echo ""
echo "📦 Шаг 7: Клонирование репозитория..."
echo "⚠️  ВНИМАНИЕ: Убедитесь, что REPO_URL указан правильно в скрипте!"
echo "   Или скопируйте проект вручную через rsync/scp"
echo ""
echo "Для копирования проекта локально используйте:"
echo "  rsync -avz --exclude 'node_modules' --exclude '.git' ./ $SERVER:$PROJECT_DIR/"

echo ""
echo "✅ Базовая настройка сервера завершена!"
echo ""
echo "Следующие шаги:"
echo "1. Скопируйте проект на сервер"
echo "2. Настройте переменные окружения"
echo "3. Установите зависимости"
echo "4. Запустите сервисы"
echo ""
echo "Используйте скрипт: ./scripts/setup-project.sh для продолжения"

