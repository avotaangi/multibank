# 🚀 Развертывание MultiBank на Vercel (Веб-интерфейс)

## 📋 Пошаговая инструкция

### 1️⃣ Подготовка проекта
✅ **Проект уже собран** в папке `client/dist`

### 2️⃣ Загрузка на Vercel

1. **Откройте [vercel.com](https://vercel.com)**
2. **Войдите в аккаунт** (или создайте новый)
3. **Нажмите "New Project"**
4. **Выберите "Import Git Repository"** или **"Upload"**

### 3️⃣ Настройка проекта

#### Вариант A: Загрузка файлов
1. **Создайте ZIP архив** папки `client/dist`
2. **Загрузите на Vercel**
3. **Название проекта:** `multibank`
4. **Framework Preset:** `Other`

#### Вариант B: GitHub (рекомендуется)
1. **Создайте репозиторий на GitHub**
2. **Загрузите код**
3. **Подключите к Vercel**
4. **Настройте Build Command:** `cd client && npm run build`
5. **Output Directory:** `client/dist`

### 4️⃣ Настройка переменных окружения

В настройках проекта добавьте:
```
VITE_API_BASE_URL=https://your-api-url.vercel.app
```

### 5️⃣ Получение URL

После развертывания вы получите URL вида:
```
https://multibank-xxx.vercel.app
```

### 6️⃣ Настройка Telegram Web App

1. **Откройте [@BotFather](https://t.me/BotFather)**
2. **Отправьте `/newapp`**
3. **Выберите `@MultibankYo_bot`**
4. **Настройте Web App:**
   - **Название:** `MultiBank`
   - **Описание:** `Мультибанк - управление счетами и переводами`
   - **Web App URL:** `https://multibank-xxx.vercel.app`
   - **Короткое имя:** `multibank`

### 7️⃣ Тестирование

После настройки вы получите ссылку:
```
https://t.me/MultibankYo_bot/multibank
```

## 🎯 Альтернативные варианты

### Netlify
1. **Откройте [netlify.com](https://netlify.com)**
2. **Drag & Drop** папку `client/dist`
3. **Получите URL** вида `https://xxx.netlify.app`

### GitHub Pages
1. **Создайте репозиторий**
2. **Загрузите код**
3. **Включите GitHub Pages**
4. **Получите URL** вида `https://username.github.io/repository`

## 📱 Текущий статус

### ✅ Готово:
- ✅ **Проект собран** (`client/dist`)
- ✅ **Все файлы подготовлены**
- ✅ **Telegram Bot настроен**

### 🔄 Следующий шаг:
**Разверните проект на одном из хостингов выше**

## 🎉 Результат

После развертывания ваше мини-приложение MultiBank будет доступно в Telegram!
