# Архитектура проекта MultiBank

## Обзор

MultiBank - это мультибанковское приложение, работающее как Telegram Mini App, которое позволяет пользователям управлять счетами из разных банков (VBank, ABank, SBank) через единый интерфейс.

## Общая архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                    Telegram Mini App                        │
│                    (WebView в Telegram)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTPS
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                    Frontend (React)                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Vite Dev Server (порт 5173) / Production Build      │  │
│  │  - React 18.2                                        │  │
│  │  - React Router v6                                   │  │
│  │  - Zustand (State Management)                        │  │
│  │  - React Query (Data Fetching)                       │  │
│  │  - Tailwind CSS (Styling)                            │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ REST API
                       │ /api/*
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              Backend API Gateway                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Node.js/Express (порт 3001)                         │  │
│  │  ИЛИ FastAPI (Python) - в разработке                 │  │
│  │  - JWT Authentication                                │  │
│  │  - MongoDB (через Mongoose/Motor)                    │  │
│  │  - Rate Limiting                                     │  │
│  │  - CORS                                              │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ API Calls
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌────▼──────┐ ┌─────▼──────┐
│  VBank API   │ │ ABank API │ │ SBank API  │
│  Open Banking│ │ Open      │ │ Open       │
│  API         │ │ Banking   │ │ Banking    │
│              │ │ API       │ │ API        │
└──────────────┘ └───────────┘ └────────────┘
```

## Frontend архитектура

### Структура папок

```
client/
├── src/
│   ├── main.jsx              # Точка входа, инициализация Telegram WebApp
│   ├── App.jsx               # Главный компонент, роутинг
│   ├── index.css             # Глобальные стили
│   │
│   ├── components/           # Переиспользуемые компоненты
│   │   ├── Layout.jsx        # Основной layout с навигацией
│   │   ├── BottomNavigation.jsx  # Нижняя навигация
│   │   ├── InfoPanel.jsx     # Панель с информацией о странице
│   │   ├── BankCardStack.jsx # Карусель банковских карт
│   │   ├── CustomSelect.jsx  # Кастомный селект
│   │   ├── InsuranceCard.jsx # Карточка страховки
│   │   └── ...
│   │
│   ├── pages/                # Страницы приложения
│   │   ├── DashboardPage.jsx      # Главная страница
│   │   ├── MyCardsPage.jsx        # Мои карты
│   │   ├── CardAnalyticsPage.jsx  # Аналитика карты
│   │   ├── TransferPage.jsx       # Переводы между банками
│   │   ├── TransferByAccountPage.jsx  # Перевод по номеру счета
│   │   ├── PaymentsPage.jsx       # Универсальные платежи
│   │   ├── RewardsPage.jsx        # Бонусы
│   │   ├── CreditsPage.jsx        # Кредиты
│   │   ├── LeadsPage.jsx          # Управление лидами
│   │   ├── SecurityPage.jsx       # Безопасность
│   │   ├── InsuranceCascoPage.jsx # Оформление КАСКО
│   │   └── ...
│   │
│   ├── stores/               # Zustand stores (State Management)
│   │   ├── authStore.js      # Аутентификация, пользователь
│   │   ├── balanceStore.js   # Балансы банковских карт
│   │   ├── testCardsStore.js # Тестовые карты
│   │   └── transfersStore.js # История переводов
│   │
│   ├── services/             # API сервисы
│   │   └── api.js            # Axios instance, все API методы
│   │
│   ├── hooks/                # Custom React hooks
│   │   ├── useTelegramUser.js    # Информация о Telegram пользователе
│   │   ├── usePageInfo.js        # Информация о странице для InfoPanel
│   │   ├── useTelegramButtons.js # Telegram кнопки
│   │   └── useAndroidAdaptation.js  # Адаптация для Android
│   │
│   └── utils/                # Утилиты
│       ├── telegram.js       # Работа с Telegram WebApp API
│       └── platform.js       # Определение платформы
│
├── index.html                # HTML шаблон
├── vite.config.js            # Конфигурация Vite
├── tailwind.config.js        # Конфигурация Tailwind CSS
└── package.json              # Зависимости
```

### Технологический стек Frontend

- **React 18.2** - UI библиотека
- **React Router v6** - Маршрутизация
- **Zustand** - Легковесное управление состоянием
- **React Query v3** - Кеширование и синхронизация данных с сервером
- **Axios** - HTTP клиент
- **Tailwind CSS** - Utility-first CSS фреймворк
- **Vite** - Сборщик и dev server
- **Lucide React** - Иконки

### Управление состоянием

#### Zustand Stores

1. **authStore** - Аутентификация
   - Пользователь, токен
   - Инициализация через Telegram WebApp
   - Генерация client_id на основе Telegram user ID
   - Автоматическое обновление токена

2. **balanceStore** - Балансы банков
   - Балансы VBank, ABank, SBank
   - Методы для обновления балансов
   - Переводы между картами

3. **testCardsStore** - Тестовые карты
   - Управление дополнительными тестовыми картами
   - CRUD операции

4. **transfersStore** - История переводов
   - Последние 10 переводов
   - Добавление новых переводов

#### React Query

Используется для:
- Кеширования данных с сервера
- Автоматического обновления данных
- Управления состояниями загрузки и ошибок
- Оптимистичных обновлений

### Роутинг

```
/                          → DashboardPage (главная)
/dashboard                 → DashboardPage
/my-cards                  → MyCardsPage
/card-analytics/:cardId    → CardAnalyticsPage
/transfer                  → TransferPage (между банками)
/transfer-by-account       → TransferByAccountPage
/payments                  → PaymentsPage
/rewards                   → RewardsPage
/credits                   → CreditsPage
/leads                     → LeadsPage
/security                  → SecurityPage
/insurance-casco           → InsuranceCascoPage
/insurance-details/:id     → InsuranceDetailsPage
/analytics                 → AnalyticsPage
/budget-planning           → BudgetPlanningPage
/accounts                  → AccountsPage
/transactions              → TransactionsPage
```

## Backend архитектура

### Node.js/Express Backend (текущий)

```
server/
├── src/
│   ├── index.js            # Точка входа, настройка Express
│   │
│   ├── middleware/         # Middleware
│   │   └── auth.js         # JWT аутентификация, Telegram верификация
│   │
│   ├── models/             # Mongoose модели
│   │   ├── User.js         # Пользователь
│   │   ├── Account.js      # Банковский счет
│   │   └── Transaction.js  # Транзакция
│   │
│   ├── routes/             # API роуты
│   │   ├── auth.js         # /api/auth - аутентификация
│   │   ├── accounts.js     # /api/accounts - счета
│   │   ├── transactions.js # /api/transactions - транзакции
│   │   ├── payments.js     # /api/payments - платежи Open Banking
│   │   ├── consents.js     # /api/consents - согласия
│   │   ├── products.js     # /api/products - продукты
│   │   ├── rewards.js      # /api/rewards - бонусы
│   │   ├── leads.js        # /api/leads - лиды
│   │   ├── creditProducts.js      # /api/credit-products
│   │   ├── cashLoanApplications.js # /api/cash-loan-applications
│   │   ├── cardManagement.js       # /api/card-management
│   │   ├── cardOperations.js       # /api/card-operations
│   │   ├── universalPayments.js    # /api/universal-payments
│   │   └── mobilePayments.js       # /api/mobile-payments
│   │
│   └── services/           # Сервисы
│       └── bankingClient.js # Клиент для работы с Open Banking API
│
├── package.json
└── .env.example
```

### FastAPI Backend (в разработке)

```
server_fastapi/
├── app.py                  # Точка входа FastAPI приложения
├── config.py               # Конфигурация (Pydantic Settings)
├── database.py             # Подключение к MongoDB (Motor)
│
├── models/                 # Pydantic модели
│   ├── user.py
│   ├── account.py
│   └── transaction.py
│
├── middleware/             # Middleware
│   └── auth.py             # JWT аутентификация
│
├── routers/                # API роутеры
│   ├── auth.py
│   ├── accounts.py
│   ├── transactions.py
│   └── ... (все роуты аналогичны Express версии)
│
└── services/               # Сервисы
    └── banking_client.py   # Клиент для Open Banking API
```

### Технологический стек Backend

#### Node.js/Express
- **Express 4.18** - Web framework
- **Mongoose 8.0** - MongoDB ODM
- **JWT** - Аутентификация
- **bcryptjs** - Хеширование паролей/PIN
- **Axios** - HTTP клиент для внешних API
- **express-rate-limit** - Rate limiting
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

#### FastAPI (новый)
- **FastAPI** - Современный Python web framework
- **Motor** - Асинхронный MongoDB драйвер
- **Pydantic** - Валидация данных
- **python-jose** - JWT токены
- **passlib** - Хеширование
- **httpx** - Асинхронный HTTP клиент

### База данных

**MongoDB** - NoSQL база данных
- Коллекции: `users`, `accounts`, `transactions`
- Индексы для оптимизации запросов
- Схемы через Mongoose (Node.js) или встроенные в модели (FastAPI)

## Интеграция с внешними API

### Open Banking API

Backend выступает как API Gateway, проксируя запросы к трем банкам:

1. **VBank** - `https://vbank.open.bankingapi.ru`
2. **ABank** - `https://abank.open.bankingapi.ru`
3. **SBank** - `https://sbank.open.bankingapi.ru`

### BankingClient

Единый сервис для работы с банками:
- Автоматическое получение токенов доступа
- Кеширование токенов
- Унифицированный интерфейс для всех банков
- Обработка ошибок

### Интегрированные API

1. **Payments API** - Переводы между банками
2. **Consents API** - Управление согласиями на доступ к данным
3. **Products API** - Получение продуктов банков
4. **Rewards API** - Бонусные программы
5. **Leads API** - Управление лидами
6. **Credit Products API** - Кредитные продукты
7. **Cash Loan Applications API** - Заявки на кредит
8. **Card Management API** - Управление картами (информация)
9. **Card Operations API** - Операции с картами (блокировка, PIN и т.д.)
10. **Universal Payments API** - Универсальные платежи
11. **Mobile Payments API** - Платежи сотовым операторам

## Telegram Mini App интеграция

### Инициализация

1. Telegram WebApp SDK загружается в `index.html`
2. В `main.jsx` инициализируется Telegram WebApp:
   - `tg.ready()` - готовность приложения
   - `tg.expand()` - развернуть на весь экран
   - Настройка темы
   - Отключение вертикальных свайпов

### Аутентификация

1. Получение `initData` из Telegram WebApp
2. Отправка на backend `/api/auth/telegram`
3. Backend верифицирует данные и возвращает JWT токен
4. Токен сохраняется и используется для всех последующих запросов

### Генерация client_id

На основе Telegram user ID генерируется `client_id`:
```javascript
const clientIndex = telegramUserId % 10
const clientId = `team096-${clientIndex}`
```

Это позволяет использовать 10 разных тестовых клиентов (team096-0 до team096-9).

## Безопасность

### Frontend
- JWT токены в памяти (не localStorage для чувствительных данных)
- HTTPS только
- Автоматическое обновление токенов при 401 ошибках
- Валидация данных через Pydantic (FastAPI) или express-validator

### Backend
- JWT аутентификация
- Rate limiting (100 запросов в 15 минут)
- Helmet security headers
- CORS настройки
- Валидация входящих данных
- Хеширование PIN-кодов через bcrypt

### Open Banking API
- Bearer токены для каждого банка
- Автоматическое обновление токенов
- Correlation-ID для трейсинга
- X-Global-Transaction-ID для транзакций

## Потоки данных

### Типичный запрос

```
1. Пользователь открывает страницу
   ↓
2. React компонент использует useQuery
   ↓
3. React Query проверяет кеш
   ↓
4. Если нет в кеше → запрос через api.js (Axios)
   ↓
5. Axios добавляет Authorization header (JWT токен)
   ↓
6. Backend получает запрос
   ↓
7. Middleware проверяет JWT токен
   ↓
8. Роут обрабатывает запрос
   ↓
9. BankingClient делает запрос к Open Banking API
   ↓
10. Ответ проксируется обратно на frontend
    ↓
11. React Query кеширует результат
    ↓
12. Компонент обновляется с данными
```

### Пример: Перевод денег

```
1. Пользователь заполняет форму перевода
   ↓
2. useMutation вызывает paymentAPI.createPayment()
   ↓
3. Backend получает запрос
   ↓
4. Backend делает запрос к Open Banking API
   ↓
5. Backend возвращает результат
   ↓
6. Frontend обновляет балансы в balanceStore
   ↓
7. React Query инвалидирует кеш счетов
   ↓
8. UI обновляется с новыми балансами
```

## Деплой

### Frontend
- **Dev**: Vite dev server на порту 5173
- **Production**: 
  - Сборка: `npm run build`
  - Статические файлы в `dist/`
  - Может быть развернут на Vercel, Netlify, или через nginx

### Backend
- **Dev**: `npm run dev` (nodemon) или `uvicorn app:app --reload`
- **Production**: 
  - Node.js: `npm start` или через PM2
  - FastAPI: `uvicorn app:app --workers 4`
  - MongoDB должна быть доступна

### Docker
- Есть Dockerfile для frontend и backend
- docker-compose.yml для локального запуска

## Особенности реализации

### Кеширование
- React Query кеширует запросы на frontend
- BankingClient кеширует токены банков
- Vite использует хеши для файлов в production

### Обработка ошибок
- Централизованная обработка через axios interceptors
- Автоматическое обновление токенов при 401
- Fallback на тестовые данные при недоступности backend

### Адаптивность
- Tailwind CSS для responsive дизайна
- Адаптация для Telegram WebApp
- Поддержка Android/iOS через Telegram

### Производительность
- Code splitting через Vite
- Lazy loading компонентов (можно добавить)
- Оптимизация изображений
- Gzip сжатие

## Масштабирование

### Горизонтальное
- Backend можно запускать в нескольких экземплярах
- Stateless API (JWT токены)
- MongoDB репликация

### Вертикальное
- Кеширование на уровне Redis (можно добавить)
- CDN для статических файлов
- Оптимизация запросов к БД

## Мониторинг и логирование

- Console.log для разработки
- Можно добавить:
  - Winston/Pino для логирования
  - Sentry для отслеживания ошибок
  - Prometheus для метрик
  - ELK stack для централизованных логов

