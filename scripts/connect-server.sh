#!/bin/bash

# Скрипт для подключения к серверу MultiBank
# Использование: ./scripts/connect-server.sh

SERVER_IP="178.217.98.35"
SERVER_USER="root"
SERVER_PASSWORD="Qf7v#N2kL9y=rz3U+Hp4%axW~tM8"

echo "🔌 Подключение к серверу $SERVER_IP..."

# Проверяем наличие SSH ключа
if [ -f ~/.ssh/id_rsa.pub ]; then
    echo "✅ SSH ключ найден"
    PUBLIC_KEY=$(cat ~/.ssh/id_rsa.pub)
    echo ""
    echo "📋 Ваш публичный SSH ключ:"
    echo "$PUBLIC_KEY"
    echo ""
    echo "💡 Для безопасного подключения добавьте этот ключ на сервер:"
    echo "   ssh-copy-id -i ~/.ssh/id_rsa.pub $SERVER_USER@$SERVER_IP"
    echo ""
fi

echo "🔐 Подключение к серверу..."
echo "   (Пароль будет запрошен интерактивно)"
echo ""

# Подключение
ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP

