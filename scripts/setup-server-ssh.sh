#!/bin/bash

# Скрипт для настройки SSH ключей на сервере
# Использование: ./scripts/setup-server-ssh.sh

SERVER_IP="178.217.98.35"
SERVER_USER="root"
SERVER_PASSWORD="Qf7v#N2kL9y=rz3U+Hp4%axW~tM8"

echo "🔧 Настройка SSH ключей на сервере..."

if [ ! -f ~/.ssh/id_rsa.pub ]; then
    echo "❌ Публичный SSH ключ не найден!"
    echo "   Создайте ключ: ssh-keygen -t rsa -b 4096 -C 'your_email@example.com'"
    exit 1
fi

PUBLIC_KEY=$(cat ~/.ssh/id_rsa.pub)

echo "📤 Добавление SSH ключа на сервер..."
echo "   (Потребуется ввести пароль один раз)"
echo ""

# Используем sshpass если доступен, иначе интерактивный ввод
if command -v sshpass &> /dev/null; then
    sshpass -p "$SERVER_PASSWORD" ssh-copy-id -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP
else
    echo "⚠️  sshpass не установлен. Используйте команду вручную:"
    echo "   ssh-copy-id -i ~/.ssh/id_rsa.pub $SERVER_USER@$SERVER_IP"
    echo ""
    echo "   Или введите пароль вручную: $SERVER_PASSWORD"
    ssh-copy-id -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSH ключ успешно добавлен на сервер!"
    echo "   Теперь вы можете подключаться без пароля:"
    echo "   ssh $SERVER_USER@$SERVER_IP"
else
    echo ""
    echo "❌ Ошибка при добавлении ключа"
    exit 1
fi

