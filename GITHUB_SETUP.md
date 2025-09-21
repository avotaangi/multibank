# 🐙 Настройка GitHub репозитория для MultiBank

## 📋 Пошаговая инструкция

### 1️⃣ Создание репозитория на GitHub

1. **Откройте [github.com](https://github.com)**
2. **Войдите в свой аккаунт**
3. **Нажмите зеленую кнопку "New"** или **"+" → "New repository"**
4. **Заполните форму:**
   - **Repository name:** `multibank`
   - **Description:** `MultiBank - Telegram Web App for managing multiple bank accounts`
   - **Visibility:** `Public` (или `Private` если хотите)
   - **НЕ добавляйте** README, .gitignore, license (у нас уже есть)
5. **Нажмите "Create repository"**

### 2️⃣ Подключение локального репозитория

После создания репозитория GitHub покажет инструкции. Выполните команды:

```bash
# Добавьте remote origin (замените YOUR_USERNAME на ваш GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/multibank.git

# Переименуйте ветку в main (современный стандарт)
git branch -M main

# Загрузите код на GitHub
git push -u origin main
```

### 3️⃣ Альтернативный способ (если у вас есть SSH ключи)

```bash
# Если у вас настроены SSH ключи
git remote add origin git@github.com:YOUR_USERNAME/multibank.git
git branch -M main
git push -u origin main
```

## 🚀 После загрузки на GitHub

### 1️⃣ Развертывание на Vercel

1. **Откройте [vercel.com](https://vercel.com)**
2. **Войдите через GitHub**
3. **Нажмите "New Project"**
4. **Выберите репозиторий `multibank`**
5. **Настройте проект:**
   - **Framework Preset:** `Other`
   - **Root Directory:** `./` (корень)
   - **Build Command:** `cd client && npm run build`
   - **Output Directory:** `client/dist`
6. **Нажмите "Deploy"**

### 2️⃣ Получение URL

После развертывания вы получите URL вида:
```
https://multibank-xxx.vercel.app
```

### 3️⃣ Настройка Telegram Web App

1. **Откройте [@BotFather](https://t.me/BotFather)**
2. **Отправьте `/newapp`**
3. **Выберите `@MultibankYo_bot`**
4. **Настройте Web App:**
   - **Название:** `MultiBank`
   - **Описание:** `Мультибанк - управление счетами и переводами`
   - **Web App URL:** `https://multibank-xxx.vercel.app`
   - **Короткое имя:** `multibank`

## 🎯 Текущий статус

### ✅ **Готово:**
- ✅ **Git репозиторий** инициализирован
- ✅ **Первый коммит** создан
- ✅ **Все файлы** добавлены
- ✅ **README.md** создан
- ✅ **.gitignore** настроен

### 🔄 **Следующий шаг:**
**Создайте репозиторий на GitHub и выполните команды выше**

## 📱 Результат

После выполнения всех шагов:
1. **Код будет на GitHub** - доступен для всех
2. **Приложение развернуто на Vercel** - работает в интернете
3. **Telegram Web App настроен** - доступен в Telegram

## 🆘 Если что-то не работает

### Проблема с авторизацией GitHub
```bash
# Попробуйте через браузер
gh auth login --web
```

### Проблема с push
```bash
# Проверьте remote
git remote -v

# Если нужно изменить URL
git remote set-url origin https://github.com/YOUR_USERNAME/multibank.git
```

### Проблема с Vercel
- Убедитесь, что репозиторий публичный
- Проверьте настройки Build Command и Output Directory
- Посмотрите логи в Vercel Dashboard

---

**Готово! Следуйте инструкциям выше для завершения настройки.** 🚀
