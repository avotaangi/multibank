# 🏦 MultiBank - Telegram Web App

Мультибанк - это мини-приложение для Telegram, которое позволяет управлять счетами из разных банков в одном интерфейсе.

## 🚀 Функциональность

- **Главная страница** с карточками банков
- **Свайп вниз** для просмотра всех карт
- **Переводы между банками**
- **Аналитика расходов** по категориям
- **Адаптивный дизайн** для мобильных устройств
- **Telegram Web App API** интеграция

## 🛠️ Технологии

### Frontend
- **React 18** - UI библиотека
- **Vite** - сборщик
- **Tailwind CSS** - стилизация
- **React Router** - маршрутизация
- **Zustand** - управление состоянием
- **React Query** - работа с API

### Backend
- **Node.js** - серверная платформа
- **Express** - веб-фреймворк
- **FastAPI** - Python API сервер
- **MongoDB** - база данных
- **Mongoose** - ODM для MongoDB
- **JWT** - аутентификация

### Telegram
- **Telegram Bot API** - бот
- **Telegram Web App API** - мини-приложение

## 🐳 Быстрый старт через Docker (Рекомендуется)

### Требования
- Docker (версия 20.10+)
- Docker Compose (версия 2.0+)

### 1. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_BOT_USERNAME=multibank_bot

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# API Configuration
VITE_API_URL=http://localhost:3001/api
VITE_TELEGRAM_BOT_USERNAME=multibank_bot
VITE_TELEGRAM_WEBAPP_URL=http://localhost:5173

# FastAPI Configuration
WEBAPP_URL=http://localhost:5173
CLIENT_ID=team096
CLIENT_SECRET=your-secret
BASE_URL=open.bankingapi.ru
CLIENT_ID_ID=1
```

### 2. Запуск всех сервисов

```bash
docker-compose up -d
```

Эта команда запустит все сервисы в фоновом режиме:
- **MongoDB** на порту 27017
- **Backend (Node.js)** на порту 3001
- **FastAPI** на порту 8000
- **Frontend (React)** на порту 5173
- **Telegram Bot**

### 3. Проверка статуса

```bash
docker-compose ps
```

### 4. Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f fastapi
docker-compose logs -f telegram-bot
```

### 5. Остановка сервисов

```bash
docker-compose down
```

Для удаления всех данных (включая базу данных):

```bash
docker-compose down -v
```

## 🔧 Сервисы и порты

### MongoDB
- **Порт**: 27017
- **Доступ**: `mongodb://admin:password123@localhost:27017/multibank?authSource=admin`
- **Данные**: Сохраняются в volume `mongodb_data`

### Backend (Node.js)
- **Порт**: 3001
- **API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

### FastAPI
- **Порт**: 8000
- **API**: http://localhost:8000
- **Документация**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

### Frontend (React)
- **Порт**: 5173
- **URL**: http://localhost:5173

### Telegram Bot
- Запускается автоматически при наличии `TELEGRAM_BOT_TOKEN`

## 🛠️ Локальная разработка (без Docker)

### 1. Установка зависимостей

```bash
# Backend (Node.js)
cd server && npm install

# Frontend
cd ../client && npm install

# Telegram Bot
cd ../telegram-bot && npm install

# FastAPI (Python)
cd ../server-fastapi
pip install -r requirements.txt
```

### 2. Настройка переменных окружения

Скопируйте примеры и заполните:

```bash
cp server/env.example server/.env
cp client/env.example client/.env
cp telegram-bot/env.example telegram-bot/.env
cp server-fastapi/env.example server-fastapi/.env
```

### 3. Запуск MongoDB

```bash
# macOS
brew services start mongodb-community

# Или через Docker
docker run -d -p 27017:27017 --name mongodb mongo:7.0
```

### 4. Запуск сервисов

```bash
# Терминал 1: Backend
cd server && npm start

# Терминал 2: Frontend
cd client && npm run dev

# Терминал 3: Telegram Bot
cd telegram-bot && npm start

# Терминал 4: FastAPI
cd server-fastapi/src && uvicorn main:app --reload --port 8000
```

## 📁 Структура проекта

```
multibank/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── pages/         # Страницы
│   │   ├── stores/        # Zustand stores
│   │   └── services/      # API сервисы
│   └── dist/              # Собранное приложение
├── server/                # Node.js backend
│   ├── src/
│   │   ├── routes/        # API маршруты
│   │   ├── models/        # MongoDB модели
│   │   └── middleware/    # Express middleware
├── server-fastapi/        # FastAPI backend
│   └── src/
│       ├── bankAPI/       # Банковские API
│       └── main.py        # Точка входа
├── telegram-bot/          # Telegram бот
├── docker-compose.yml     # Docker конфигурация
└── requirements.txt       # Python зависимости
```

## 🔧 Основные API Endpoints

### Аутентификация
- `POST /api/auth/telegram` - Вход через Telegram
- `POST /api/auth/refresh` - Обновление токена
- `GET /api/auth/me` - Получение профиля
- `POST /api/auth/pin` - Установка PIN
- `POST /api/auth/pin/verify` - Проверка PIN

### Пользователи
- `GET /api/users/profile` - Профиль пользователя
- `PUT /api/users/profile` - Обновление профиля

### Счета
- `GET /api/accounts` - Список счетов
- `POST /api/accounts` - Создание счета
- `GET /api/accounts/:id` - Детали счета
- `GET /api/accounts/:id/balance` - Баланс счета
- `GET /api/accounts/:id/transactions` - Транзакции по счету

### Транзакции
- `GET /api/transactions` - Список транзакций
- `POST /api/transactions/transfer` - Создание перевода
- `GET /api/transactions/payment/:paymentId` - Статус платежа

### Согласия (Consents)
- `POST /api/consents/accounts` - Создать согласие на доступ к счетам
- `GET /api/consents/accounts/:consentId` - Получить согласие
- `DELETE /api/consents/accounts/:consentId` - Отозвать согласие
- `POST /api/consents/payments` - Создать согласие на платежи

### Продукты
- `GET /api/products` - Каталог продуктов
- `GET /api/products/:productId` - Детали продукта

### FastAPI Endpoints
- `GET /` - Главная страница
- `GET /health` - Health check
- `GET /{client_id_id}/bank_names` - Список банков пользователя
- `GET /available_balance/{bank_name}/{client_id_id}` - Доступный баланс
- `POST /payments/make_transfer/` - Создание перевода

## 🔍 Отладка

### Просмотр логов Docker
```bash
docker-compose logs -f [service-name]
```

### Проверка здоровья сервисов
```bash
# Backend
curl http://localhost:3001/api/health

# FastAPI
curl http://localhost:8000/health
```

### Подключение к базе данных
```bash
# Через Docker
docker-compose exec mongodb mongosh -u admin -p password123 --authenticationDatabase admin

# Локально
mongosh mongodb://admin:password123@localhost:27017/multibank?authSource=admin
```

## 🐛 Решение проблем

### Сервис не запускается
1. Проверьте логи: `docker-compose logs [service-name]`
2. Убедитесь, что порты не заняты
3. Проверьте переменные окружения в `.env`

### База данных не подключается
1. Убедитесь, что MongoDB запущен: `docker-compose ps mongodb`
2. Проверьте логи: `docker-compose logs mongodb`
3. Проверьте `MONGODB_URI` в конфигурации

### Изменения в коде не применяются
Для разработки код монтируется как volume. Если изменения не применяются:
1. Перезапустите сервис: `docker-compose restart [service-name]`
2. Пересоберите образ: `docker-compose build [service-name]`

## 📦 Развертывание

### Vercel (Frontend)

1. Подключите репозиторий к GitHub
2. Импортируйте на [vercel.com](https://vercel.com)
3. Настройте:
   - Build Command: `cd client && npm run build`
   - Output Directory: `client/dist`
4. Настройте Telegram Web App URL в BotFather

### Docker Production

Для production используйте отдельные настройки:
- Измените пароли MongoDB
- Настройте HTTPS
- Используйте секретные ключи для JWT
- Настройте CORS для production доменов

## 📝 Переменные окружения

Основные переменные:
- `TELEGRAM_BOT_TOKEN` - токен Telegram бота
- `TELEGRAM_BOT_USERNAME` - username бота
- `JWT_SECRET` - секретный ключ для JWT
- `MONGODB_URI` - URI подключения к MongoDB
- `VITE_API_URL` - URL API для фронтенда
- `CLIENT_ID` - ID клиента для банковского API
- `CLIENT_SECRET` - секрет для банковского API

## 🤝 Вклад в проект

1. Fork репозиторий
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License.

---

**Сделано с ❤️ для Telegram Web Apps**
