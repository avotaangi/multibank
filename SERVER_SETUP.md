# 🖥️ Настройка подключения к серверу MultiBank

## 📋 Информация о сервере

- **IP адрес:** `178.217.98.35`
- **Пользователь:** `root`
- **Пароль:** `Qf7v#N2kL9y=rz3U+Hp4%axW~tM8`

## 🔐 Настройка SSH подключения

### Вариант 1: Быстрое подключение с паролем

```bash
ssh root@178.217.98.35
# Введите пароль: Qf7v#N2kL9y=rz3U+Hp4%axW~tM8
```

### Вариант 2: Настройка SSH ключей (рекомендуется)

#### Шаг 1: Добавьте SSH ключ на сервер

```bash
# Используйте скрипт
./scripts/setup-server-ssh.sh

# Или вручную
ssh-copy-id -i ~/.ssh/id_rsa.pub root@178.217.98.35
# Введите пароль: Qf7v#N2kL9y=rz3U+Hp4%axW~tM8
```

#### Шаг 2: Настройте SSH config

```bash
# Добавьте конфигурацию в ~/.ssh/config
cat .ssh-config >> ~/.ssh/config

# Или создайте файл вручную
mkdir -p ~/.ssh
cat > ~/.ssh/config << EOF
Host multibank-server
    HostName 178.217.98.35
    User root
    IdentityFile ~/.ssh/id_rsa
    StrictHostKeyChecking no
EOF
```

#### Шаг 3: Подключитесь без пароля

```bash
ssh multibank-server
# или
ssh root@178.217.98.35
```

## 🚀 Использование скриптов

### Подключение к серверу

```bash
./scripts/connect-server.sh
```

### Настройка SSH ключей

```bash
./scripts/setup-server-ssh.sh
```

## 📦 Развертывание проекта на сервере

### 1. Подключитесь к серверу

```bash
ssh root@178.217.98.35
```

### 2. Установите необходимые зависимости

```bash
# Обновление системы
apt update && apt upgrade -y

# Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Установка Python и pip
apt install -y python3 python3-pip

# Установка MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
apt update
apt install -y mongodb-org

# Установка PM2 для управления процессами
npm install -g pm2

# Установка Nginx
apt install -y nginx
```

### 3. Клонируйте репозиторий

```bash
cd /opt
git clone <your-repo-url> multibank
cd multibank
```

### 4. Настройте переменные окружения

```bash
# Backend
cd server
cp .env.example .env
nano .env  # Отредактируйте файл

# Frontend
cd ../client
cp .env.example .env
nano .env  # Отредактируйте файл

# FastAPI
cd ../server-fastapi
cp env.example .env
nano .env  # Отредактируйте файл
```

### 5. Установите зависимости

```bash
# Backend (Node.js)
cd /opt/multibank/server
npm install

# Frontend
cd /opt/multibank/client
npm install
npm run build

# FastAPI
cd /opt/multibank/server-fastapi
pip3 install -r requirements.txt
```

### 6. Запустите сервисы

```bash
# Backend с PM2
cd /opt/multibank/server
pm2 start src/index.js --name multibank-backend

# FastAPI с PM2
cd /opt/multibank/server-fastapi
pm2 start "uvicorn src.main:app --host 0.0.0.0 --port 8000" --name multibank-fastapi

# Telegram Bot
cd /opt/multibank/telegram-bot
pm2 start src/index.js --name multibank-bot

# Сохраните конфигурацию PM2
pm2 save
pm2 startup
```

### 7. Настройте Nginx

```bash
cat > /etc/nginx/sites-available/multibank << EOF
server {
    listen 80;
    server_name 178.217.98.35;

    # Frontend
    location / {
        root /opt/multibank/client/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # FastAPI
    location /fastapi/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Активируйте конфигурацию
ln -s /etc/nginx/sites-available/multibank /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## 🔒 Безопасность

### Настройка Firewall

```bash
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

### Настройка SSL (Let's Encrypt)

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

## 📊 Мониторинг

### Просмотр логов PM2

```bash
pm2 logs
pm2 logs multibank-backend
pm2 logs multibank-fastapi
pm2 logs multibank-bot
```

### Статус сервисов

```bash
pm2 status
systemctl status nginx
systemctl status mongod
```

## 🔄 Обновление проекта

```bash
cd /opt/multibank
git pull
cd client && npm run build
pm2 restart all
```

## 📞 Поддержка

При возникновении проблем проверьте:
- Логи PM2: `pm2 logs`
- Логи Nginx: `tail -f /var/log/nginx/error.log`
- Логи MongoDB: `tail -f /var/log/mongodb/mongod.log`

