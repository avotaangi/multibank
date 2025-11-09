#!/usr/bin/expect -f

# Скрипт для автоматической настройки SSH ключей на сервере
# Использование: ./scripts/setup-ssh-keys.sh

set SERVER_IP "178.217.98.35"
set SERVER_USER "root"
set SERVER_PASSWORD "Qf7v#N2kL9y=rz3U+Hp4%axW~tM8"
set SERVER_PORT "22"
set TIMEOUT 30

# Если SSH на другом порту, измените SERVER_PORT
# set SERVER_PORT "2222"

puts "🔧 Настройка SSH ключей на сервере $SERVER_IP..."

# Проверяем наличие публичного ключа
if {![file exists "$env(HOME)/.ssh/id_rsa.pub"]} {
    puts "❌ Публичный SSH ключ не найден в ~/.ssh/id_rsa.pub"
    puts "   Создайте ключ: ssh-keygen -t rsa -b 4096 -C 'your_email@example.com'"
    exit 1
}

puts "📤 Добавление SSH ключа на сервер..."
puts "   Пользователь: $SERVER_USER"
puts "   Сервер: $SERVER_IP"
puts ""

# Используем ssh-copy-id через expect
if {$SERVER_PORT != "22"} {
    spawn ssh-copy-id -p $SERVER_PORT -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $SERVER_USER@$SERVER_IP
} else {
    spawn ssh-copy-id -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null $SERVER_USER@$SERVER_IP
}

expect {
    timeout {
        puts "❌ Таймаут при подключении"
        exit 1
    }
    "password:" {
        send "$SERVER_PASSWORD\r"
        exp_continue
    }
    "Password:" {
        send "$SERVER_PASSWORD\r"
        exp_continue
    }
    "yes/no" {
        send "yes\r"
        exp_continue
    }
    "Permission denied" {
        puts "❌ Ошибка доступа. Проверьте пароль и права доступа."
        exit 1
    }
    "Number of key(s) added:" {
        puts "✅ SSH ключ успешно добавлен на сервер!"
        exp_continue
    }
    eof {
        puts ""
        puts "✅ Настройка завершена!"
        puts ""
        puts "Теперь вы можете подключаться без пароля:"
        puts "   ssh $SERVER_USER@$SERVER_IP"
    }
}

wait

# Проверяем подключение
puts ""
puts "🔍 Проверка подключения..."
if {$SERVER_PORT != "22"} {
    spawn ssh -p $SERVER_PORT -o StrictHostKeyChecking=no -o ConnectTimeout=5 $SERVER_USER@$SERVER_IP "echo 'SSH ключ работает!' && uname -a"
} else {
    spawn ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 $SERVER_USER@$SERVER_IP "echo 'SSH ключ работает!' && uname -a"
}

expect {
    timeout {
        puts "⚠️  Не удалось подключиться автоматически, но ключ может быть добавлен"
        exit 0
    }
    "SSH ключ работает!" {
        puts "✅ Подключение успешно! SSH ключ настроен правильно."
        expect eof
    }
    "Permission denied" {
        puts "⚠️  Ключ может быть не полностью настроен. Попробуйте подключиться вручную."
    }
    eof {
        puts "✅ Проверка завершена"
    }
}

wait

