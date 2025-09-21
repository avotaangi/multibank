# 🚀 Настройка Telegram Web App для MultiBank

## ✅ Текущий статус

**Ваш публичный URL:** `https://nonacquiescing-ungovernmentally-paz.ngrok-free.app`

### 🟢 Работающие сервисы:
- ✅ **Backend:** `http://localhost:3001`
- ✅ **Frontend:** `http://localhost:5173` (с поддержкой ngrok)
- ✅ **HTTPS сервер:** `https://localhost:8443`
- ✅ **ngrok туннель:** `https://nonacquiescing-ungovernmentally-paz.ngrok-free.app`

## 📋 Пошаговая инструкция

### 1️⃣ Откройте BotFather
- Перейдите в Telegram: [@BotFather](https://t.me/BotFather)
- Отправьте команду `/newapp`

### 2️⃣ Выберите бота
- Выберите вашего бота `@MultibankYo_bot`

### 3️⃣ Настройте Web App
- **Название:** `MultiBank`
- **Описание:** `Мультибанк - управление счетами и переводами`
- **Иконка:** (опционально, можете загрузить логотип)
- **Web App URL:** `https://nonacquiescing-ungovernmentally-paz.ngrok-free.app`
- **Короткое имя:** `multibank`

### 4️⃣ Получите ссылку
После настройки BotFather даст вам ссылку вида:
`https://t.me/MultibankYo_bot/multibank`

### 5️⃣ Протестируйте приложение
- Откройте ссылку в Telegram
- Или найдите вашего бота и нажмите "Menu" → "Web App"

## 🔧 Технические детали

### Запущенные сервисы:
- ✅ **Backend:** `http://localhost:3001`
- ✅ **Frontend:** `http://localhost:5173`
- ✅ **HTTPS сервер:** `https://localhost:8443`
- ✅ **ngrok туннель:** `https://nonacquiescing-ungovernmentally-paz.ngrok-free.app`

### Telegram Web App API:
- ✅ Инициализация в `main.jsx`
- ✅ Настройка темы и цветов
- ✅ Поддержка Telegram Web App API

## ⚠️ Важные замечания

1. **ngrok URL меняется** при каждом перезапуске
2. **Самоподписанные сертификаты** работают только для разработки
3. **Для продакшена** нужен постоянный домен с SSL
4. **Telegram требует HTTPS** для Web App

## 🛠️ Команды для управления

### Запуск всех сервисов:
```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend  
cd client && npm run dev

# Terminal 3: HTTPS сервер
node scripts/https-server.js

# Terminal 4: ngrok
node scripts/setup-ngrok.js
```

### Остановка сервисов:
```bash
# Остановить все процессы
pkill -f "npm run dev"
pkill -f "https-server"
pkill -f "ngrok"
```

## 🎉 Готово!

После выполнения всех шагов ваше мини-приложение MultiBank будет доступно в Telegram!

**Ссылка на приложение:** `https://t.me/MultibankYo_bot/multibank`
