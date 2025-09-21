# MultiBank API Documentation

## Обзор

MultiBank API предоставляет RESTful интерфейс для управления банковскими операциями через Telegram Web App.

**Base URL:** `https://your-domain.com/api`

## Аутентификация

### Telegram Web App Authentication

```http
POST /auth/telegram
Content-Type: application/json

{
  "initData": "user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22John%22%7D&auth_date=1234567890&hash=hash"
}
```

**Response:**
```json
{
  "message": "Authentication successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "telegramId": "123456789",
    "username": "john_doe",
    "firstName": "John",
    "lastName": "Doe",
    "isVerified": true,
    "preferences": {
      "currency": "USD",
      "language": "en"
    }
  }
}
```

### JWT Token

Все последующие запросы должны включать JWT токен в заголовке:

```http
Authorization: Bearer <token>
```

## Пользователи

### Получить информацию о пользователе

```http
GET /auth/me
Authorization: Bearer <token>
```

### Обновить профиль

```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "user@example.com",
  "phone": "+1234567890",
  "preferences": {
    "currency": "EUR",
    "language": "ru"
  }
}
```

### Установить PIN

```http
POST /auth/pin
Authorization: Bearer <token>
Content-Type: application/json

{
  "pin": "1234"
}
```

### Проверить PIN

```http
POST /auth/pin/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "pin": "1234"
}
```

## Счета

### Получить все счета

```http
GET /accounts
Authorization: Bearer <token>
```

**Response:**
```json
{
  "accounts": [
    {
      "id": "507f1f77bcf86cd799439011",
      "accountNumber": "MB123456789",
      "accountType": "checking",
      "currency": "USD",
      "balance": 100000,
      "availableBalance": 95000,
      "creditLimit": 0,
      "interestRate": 0,
      "status": "active",
      "isDefault": true,
      "formattedBalance": "$1,000.00",
      "metadata": {
        "bankName": "MultiBank",
        "branchCode": "001",
        "openedDate": "2024-01-01T00:00:00.000Z"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Получить конкретный счет

```http
GET /accounts/{accountId}
Authorization: Bearer <token>
```

### Создать новый счет

```http
POST /accounts
Authorization: Bearer <token>
Content-Type: application/json

{
  "accountType": "savings",
  "currency": "USD",
  "initialBalance": 1000.00,
  "creditLimit": 0
}
```

### Установить счет по умолчанию

```http
PUT /accounts/{accountId}/default
Authorization: Bearer <token>
```

### Получить баланс счета

```http
GET /accounts/{accountId}/balance
Authorization: Bearer <token>
```

## Транзакции

### Получить транзакции

```http
GET /transactions?page=1&limit=20&type=transfer&status=completed
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (number): Номер страницы (по умолчанию: 1)
- `limit` (number): Количество записей на странице (по умолчанию: 20)
- `type` (string): Тип транзакции (transfer, deposit, withdrawal, payment, refund)
- `status` (string): Статус транзакции (pending, completed, failed, cancelled)
- `accountId` (string): ID счета для фильтрации
- `startDate` (string): Дата начала (ISO 8601)
- `endDate` (string): Дата окончания (ISO 8601)

**Response:**
```json
{
  "transactions": [
    {
      "id": "507f1f77bcf86cd799439011",
      "transactionId": "TXN1234567890",
      "type": "transfer",
      "category": "other",
      "amount": 5000,
      "currency": "USD",
      "exchangeRate": 1,
      "description": "Transfer to savings",
      "status": "completed",
      "reference": "",
      "fromAccount": {
        "id": "507f1f77bcf86cd799439012",
        "accountNumber": "MB123456789",
        "accountType": "checking"
      },
      "toAccount": {
        "id": "507f1f77bcf86cd799439013",
        "accountNumber": "MB987654321",
        "accountType": "savings"
      },
      "fees": {
        "processingFee": 0,
        "exchangeFee": 0
      },
      "formattedAmount": "$50.00",
      "totalAmount": 5000,
      "metadata": {
        "location": "",
        "merchant": "",
        "tags": [],
        "receipt": ""
      },
      "createdAt": "2024-01-01T12:00:00.000Z",
      "processedAt": "2024-01-01T12:00:01.000Z"
    }
  ],
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 100,
    "limit": 20
  }
}
```

### Получить конкретную транзакцию

```http
GET /transactions/{transactionId}
Authorization: Bearer <token>
```

### Создать перевод

```http
POST /transactions/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "fromAccountId": "507f1f77bcf86cd799439012",
  "toAccountId": "507f1f77bcf86cd799439013",
  "amount": 50.00,
  "description": "Transfer to savings account",
  "category": "savings",
  "reference": "REF123456"
}
```

### Получить статистику транзакций

```http
GET /transactions/stats/summary?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Response:**
```json
{
  "summary": {
    "totalTransactions": 25,
    "totalAmount": 125000,
    "avgAmount": 5000,
    "completedTransactions": 24,
    "pendingTransactions": 1,
    "failedTransactions": 0
  },
  "categoryStats": [
    {
      "_id": "food",
      "count": 10,
      "totalAmount": 50000
    },
    {
      "_id": "transport",
      "count": 8,
      "totalAmount": 30000
    }
  ]
}
```

## Telegram Integration

### Получить конфигурацию Web App

```http
GET /telegram/webapp-config
```

### Проверить данные Web App

```http
POST /telegram/verify-webapp
Content-Type: application/json

{
  "initData": "user=%7B%22id%22%3A123456789%7D&auth_date=1234567890&hash=hash"
}
```

### Webhook для бота

```http
POST /telegram/webhook
Content-Type: application/json

{
  "update_id": 123456789,
  "message": {
    "message_id": 1,
    "from": {
      "id": 123456789,
      "is_bot": false,
      "first_name": "John",
      "last_name": "Doe",
      "username": "john_doe"
    },
    "chat": {
      "id": 123456789,
      "first_name": "John",
      "last_name": "Doe",
      "username": "john_doe",
      "type": "private"
    },
    "date": 1234567890,
    "text": "/start"
  }
}
```

## Коды ошибок

### HTTP Status Codes

- `200` - Успешный запрос
- `201` - Ресурс создан
- `400` - Неверный запрос
- `401` - Не авторизован
- `403` - Доступ запрещен
- `404` - Ресурс не найден
- `429` - Превышен лимит запросов
- `500` - Внутренняя ошибка сервера

### Коды ошибок приложения

```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error message"
    }
  ]
}
```

**Коды ошибок:**
- `TOKEN_MISSING` - Отсутствует токен авторизации
- `TOKEN_INVALID` - Неверный токен
- `TOKEN_EXPIRED` - Токен истек
- `USER_INVALID` - Неверный пользователь
- `INSUFFICIENT_FUNDS` - Недостаточно средств
- `ACCOUNT_NOT_FOUND` - Счет не найден
- `TRANSACTION_NOT_FOUND` - Транзакция не найдена
- `VALIDATION_FAILED` - Ошибка валидации
- `RATE_LIMIT_EXCEEDED` - Превышен лимит запросов

## Rate Limiting

API использует rate limiting для защиты от злоупотреблений:

- **Лимит:** 100 запросов в 15 минут на IP
- **Заголовки ответа:**
  - `X-RateLimit-Limit` - Максимальное количество запросов
  - `X-RateLimit-Remaining` - Оставшееся количество запросов
  - `X-RateLimit-Reset` - Время сброса лимита (Unix timestamp)

## WebSocket (Планируется)

Для real-time уведомлений планируется поддержка WebSocket:

```javascript
const ws = new WebSocket('wss://your-domain.com/ws');
ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  // Обработка уведомления
};
```

## SDK и библиотеки

### JavaScript/TypeScript

```bash
npm install multibank-sdk
```

```javascript
import { MultiBankClient } from 'multibank-sdk';

const client = new MultiBankClient({
  baseURL: 'https://your-domain.com/api',
  token: 'your-jwt-token'
});

// Получить счета
const accounts = await client.accounts.getAll();

// Создать перевод
const transfer = await client.transactions.createTransfer({
  fromAccountId: 'account1',
  toAccountId: 'account2',
  amount: 100.00,
  description: 'Transfer'
});
```

## Примеры использования

### Полный цикл работы с API

```javascript
// 1. Аутентификация
const authResponse = await fetch('/api/auth/telegram', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ initData: telegramInitData })
});
const { token } = await authResponse.json();

// 2. Получить счета
const accountsResponse = await fetch('/api/accounts', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { accounts } = await accountsResponse.json();

// 3. Создать перевод
const transferResponse = await fetch('/api/transactions/transfer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    fromAccountId: accounts[0].id,
    toAccountId: accounts[1].id,
    amount: 50.00,
    description: 'Transfer between accounts'
  })
});
const transfer = await transferResponse.json();

// 4. Получить историю транзакций
const transactionsResponse = await fetch('/api/transactions?limit=10', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { transactions } = await transactionsResponse.json();
```
