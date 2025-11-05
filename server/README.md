# MultiBank Server - Open Banking API Integration

Backend сервер для работы с Open Banking API (VBank, ABank, SBank).

## Установка

```bash
npm install
```

## Конфигурация

Создайте файл `.env` на основе `env.example`:

```env
OPEN_BANKINGAPI_TEAM_ID=team096
OPEN_BANKINGAPI_PASSWORD=your_password
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173
NODE_ENV=development
```

## Запуск

```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Аутентификация

- `GET /api/auth/banks` - Получить список доступных банков
- `GET /api/auth/bank-token?bank=vbank` - Получить токен для банка
- `POST /api/auth/telegram` - Аутентификация через Telegram (для совместимости)
- `GET /api/auth/me` - Получить информацию о текущем пользователе

### Счета

- `GET /api/accounts?bank=vbank&client_id=team096-1` - Получить все счета
- `GET /api/accounts/:accountId?bank=vbank` - Получить детали счета
- `GET /api/accounts/:accountId/balance?bank=vbank` - Получить баланс счета
- `GET /api/accounts/:accountId/transactions?bank=vbank` - Получить транзакции по счету
- `POST /api/accounts?bank=vbank` - Создать новый счет

### Транзакции

- `GET /api/transactions?bank=vbank&client_id=team096-1` - Получить все транзакции
- `POST /api/transactions/transfer?bank=vbank&client_id=team096-1` - Создать перевод
- `GET /api/transactions/payment/:paymentId?bank=vbank` - Получить статус платежа

### Согласия

- `POST /api/consents/accounts?bank=vbank` - Создать согласие на доступ к счетам
- `GET /api/consents/accounts/:consentId?bank=vbank` - Получить согласие
- `DELETE /api/consents/accounts/:consentId?bank=vbank` - Отозвать согласие
- `POST /api/consents/payments?bank=vbank` - Создать согласие на платежи
- `GET /api/consents/payments/:consentId?bank=vbank` - Получить согласие на платежи
- `DELETE /api/consents/payments/:consentId?bank=vbank` - Отозвать согласие на платежи

### Продукты

- `GET /api/products?bank=vbank&product_type=deposit` - Получить каталог продуктов
- `GET /api/products/:productId?bank=vbank` - Получить детали продукта

## Структура проекта

```
server/
├── src/
│   ├── index.js              # Точка входа
│   ├── services/
│   │   └── bankingClient.js  # Клиент для работы с банками
│   └── routes/
│       ├── auth.js           # Аутентификация
│       ├── accounts.js       # Счета
│       ├── transactions.js   # Транзакции
│       ├── consents.js       # Согласия
│       └── products.js       # Продукты
├── package.json
└── env.example
```

## Работа с банками

Сервер автоматически управляет токенами для всех трех банков:
- **VBank**: `https://vbank.open.bankingapi.ru`
- **ABank**: `https://abank.open.bankingapi.ru`
- **SBank**: `https://sbank.open.bankingapi.ru`

Токены кэшируются и автоматически обновляются при истечении.

## Межбанковые операции

Для межбанковых операций требуется создание согласия (consent):

1. Создайте согласие: `POST /api/consents/accounts`
2. Используйте `consent_id` в заголовке `X-Consent-Id` при запросах
3. Укажите `X-Requesting-Bank` с вашим team ID

## Примеры использования

### Получить все счета из всех банков

```bash
GET /api/accounts
```

### Получить счета из конкретного банка

```bash
GET /api/accounts?bank=vbank&client_id=team096-1
```

### Создать перевод

```bash
POST /api/transactions/transfer?bank=vbank&client_id=team096-1
Content-Type: application/json

{
  "fromAccountId": "40817810099910004312",
  "toAccountId": "40817810099910005423",
  "amount": 1000.00,
  "currency": "RUB",
  "description": "Перевод между счетами",
  "toBank": "abank"  // для межбанковского перевода
}
```

