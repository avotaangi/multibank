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
- **MongoDB** - база данных
- **Mongoose** - ODM для MongoDB
- **JWT** - аутентификация

### Telegram
- **Telegram Bot API** - бот
- **Telegram Web App API** - мини-приложение

## 📱 Демо

[Открыть в Telegram](https://t.me/MultibankYo_bot/multibank)

## 🚀 Быстрый старт

### Локальная разработка

1. **Клонируйте репозиторий:**
```bash
git clone https://github.com/yourusername/multibank.git
cd multibank
```

2. **Установите зависимости:**
```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install

# Telegram Bot
cd ../telegram-bot && npm install
```

3. **Настройте переменные окружения:**
```bash
# Скопируйте примеры
cp server/.env.example server/.env
cp client/.env.example client/.env
cp telegram-bot/.env.example telegram-bot/.env

# Заполните токены в .env файлах
```

4. **Запустите MongoDB:**
```bash
brew services start mongodb-community
```

5. **Запустите сервисы:**
```bash
# Backend (терминал 1)
cd server && npm run dev

# Frontend (терминал 2)
cd client && npm run dev

# Telegram Bot (терминал 3)
cd telegram-bot && npm start
```

6. **Откройте приложение:**
- Локально: http://localhost:5173
- В Telegram: настройте Web App URL в BotFather

## 📦 Развертывание

### Vercel (рекомендуется)

1. **Подключите к GitHub:**
```bash
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/multibank.git
git push -u origin main
```

2. **Разверните на Vercel:**
- Откройте [vercel.com](https://vercel.com)
- Импортируйте репозиторий
- Настройте Build Command: `cd client && npm run build`
- Output Directory: `client/dist`

3. **Настройте Telegram Web App:**
- Откройте [@BotFather](https://t.me/BotFather)
- `/newapp` → выберите бота
- Вставьте URL от Vercel

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
├── telegram-bot/          # Telegram бот
└── scripts/               # Вспомогательные скрипты
```

## 🔧 API Endpoints

### Аутентификация
- `POST /api/auth/telegram` - Вход через Telegram
- `POST /api/auth/refresh` - Обновление токена
- `GET /api/auth/me` - Получение профиля

### Пользователи
- `GET /api/users/profile` - Профиль пользователя
- `PUT /api/users/profile` - Обновление профиля

### Счета
- `GET /api/accounts` - Список счетов
- `POST /api/accounts` - Создание счета
- `PUT /api/accounts/:id` - Обновление счета

### Транзакции
- `GET /api/transactions` - Список транзакций
- `POST /api/transactions` - Создание транзакции

## 🤝 Вклад в проект

1. Fork репозиторий
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 📞 Поддержка

Если у вас есть вопросы или предложения, создайте [Issue](https://github.com/yourusername/multibank/issues) или свяжитесь со мной.

---

**Сделано с ❤️ для Telegram Web Apps**