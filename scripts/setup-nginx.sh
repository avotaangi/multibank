#!/bin/bash

# Скрипт для настройки Nginx
# Использование: ./scripts/setup-nginx.sh

set -e

SERVER="multibank-server"
PROJECT_DIR="/opt/multibank"

echo "🌐 Настройка Nginx для MultiBank..."
echo ""

# Функция для выполнения команд на сервере
run_remote() {
    ssh $SERVER "$1"
}

# Создаем конфигурацию Nginx
NGINX_CONFIG=$(cat <<'EOF'
server {
    listen 80;
    server_name 178.217.98.35;

    # Frontend
    location / {
        root /opt/multibank/client/dist;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # FastAPI
    location /fastapi/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Статические файлы
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /opt/multibank/client/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF
)

echo "📝 Создание конфигурации Nginx..."
run_remote "cat > /etc/nginx/sites-available/multibank << 'NGINX_EOF'
$NGINX_CONFIG
NGINX_EOF
"

echo ""
echo "🔗 Активация конфигурации..."
run_remote "ln -sf /etc/nginx/sites-available/multibank /etc/nginx/sites-enabled/ && rm -f /etc/nginx/sites-enabled/default"

echo ""
echo "✅ Проверка конфигурации Nginx..."
run_remote "nginx -t"

echo ""
echo "🔄 Перезапуск Nginx..."
run_remote "systemctl restart nginx && systemctl enable nginx"

echo ""
echo "✅ Nginx настроен и запущен!"
echo ""
echo "Проверка статуса:"
echo "  ssh $SERVER 'systemctl status nginx'"

