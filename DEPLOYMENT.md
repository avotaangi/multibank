# Развертывание MultiBank

## Быстрый старт

### 1. Клонирование и установка

```bash
# Клонировать репозиторий
git clone <repository-url>
cd multibank

# Установить все зависимости
npm run install:all
```

### 2. Настройка окружения

#### Backend (.env в папке server/)
```env
MONGODB_URI=mongodb://localhost:27017/multibank
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_WEBHOOK_URL=https://your-domain.com/api/telegram/webhook
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ALLOWED_ORIGINS=http://localhost:5173,https://your-domain.com
```

#### Frontend (.env в папке client/)
```env
VITE_API_URL=http://localhost:3001/api
VITE_TELEGRAM_BOT_USERNAME=multibank_bot
VITE_TELEGRAM_WEBAPP_URL=https://your-domain.com
```

#### Telegram Bot (.env в папке telegram-bot/)
```env
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_BOT_USERNAME=multibank_bot
API_URL=http://localhost:3001/api
WEBAPP_URL=https://your-domain.com
```

### 3. Запуск в режиме разработки

```bash
# Запустить все сервисы
npm run dev

# Или запустить отдельно:
# Backend
cd server && npm run dev

# Frontend
cd client && npm run dev

# Telegram Bot
cd telegram-bot && npm run dev
```

## Настройка Telegram Bot

### 1. Создание бота

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Сохраните полученный токен

### 2. Настройка Web App

1. Отправьте команду `/newapp` в @BotFather
2. Выберите вашего бота
3. Укажите название и описание приложения
4. Загрузите иконку (512x512px)
5. Укажите URL вашего веб-приложения
6. Сохраните полученную ссылку

### 3. Настройка команд бота

```bash
# Установить команды бота
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setMyCommands" \
  -H "Content-Type: application/json" \
  -d '{
    "commands": [
      {"command": "start", "description": "Начать работу с ботом"},
      {"command": "balance", "description": "Проверить баланс"},
      {"command": "transactions", "description": "Последние транзакции"},
      {"command": "help", "description": "Помощь"},
      {"command": "webapp", "description": "Открыть веб-приложение"}
    ]
  }'
```

## Развертывание в продакшене

### 1. Docker Compose

```bash
# Создать .env файл с переменными окружения
cp .env.example .env

# Запустить все сервисы
docker-compose up -d

# Проверить статус
docker-compose ps

# Просмотр логов
docker-compose logs -f
```

### 2. Настройка Nginx

Создайте конфигурацию Nginx для проксирования:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. SSL сертификаты

```bash
# Использование Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Мониторинг и логирование

### 1. Логи приложения

```bash
# Просмотр логов
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f telegram-bot

# Логи MongoDB
docker-compose logs -f mongodb
```

### 2. Мониторинг производительности

```bash
# Использование PM2 для Node.js приложений
npm install -g pm2

# Запуск с PM2
pm2 start server/src/index.js --name "multibank-backend"
pm2 start telegram-bot/src/index.js --name "multibank-bot"

# Мониторинг
pm2 monit
pm2 logs
```

### 3. Health checks

```bash
# Проверка API
curl http://localhost:3001/api/health

# Проверка базы данных
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

## Резервное копирование

### 1. База данных

```bash
# Создание бэкапа
docker-compose exec mongodb mongodump --db multibank --out /backup

# Восстановление
docker-compose exec mongodb mongorestore --db multibank /backup/multibank
```

### 2. Файлы приложения

```bash
# Создание архива
tar -czf multibank-backup-$(date +%Y%m%d).tar.gz \
  server/ client/ telegram-bot/ docker-compose.yml
```

## Безопасность

### 1. Переменные окружения

- Никогда не коммитьте .env файлы
- Используйте сильные пароли и секретные ключи
- Регулярно обновляйте токены и ключи

### 2. Firewall

```bash
# Настройка UFW
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### 3. Обновления

```bash
# Обновление зависимостей
npm audit fix

# Обновление Docker образов
docker-compose pull
docker-compose up -d
```

## Troubleshooting

### Частые проблемы

1. **Ошибка подключения к MongoDB**
   - Проверьте, что MongoDB запущен
   - Проверьте строку подключения в .env

2. **Telegram Bot не отвечает**
   - Проверьте токен бота
   - Убедитесь, что webhook настроен правильно

3. **CORS ошибки**
   - Проверьте ALLOWED_ORIGINS в .env
   - Убедитесь, что домен добавлен в список

4. **Проблемы с SSL**
   - Проверьте сертификаты
   - Убедитесь, что домен правильно настроен

### Логи для отладки

```bash
# Включить подробные логи
NODE_ENV=development npm run dev

# Логи MongoDB
docker-compose exec mongodb mongosh --eval "db.setLogLevel(2)"
```
