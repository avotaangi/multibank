# MultiBank FastAPI Backend

FastAPI backend для MultiBank приложения.

## Установка

1. Создайте виртуальное окружение:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate  # Windows
```

2. Установите зависимости:
```bash
pip install -r requirements.txt
```

3. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

4. Настройте переменные окружения в `.env`

## Запуск

### Development режим:
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 3001
```

### Production режим:
```bash
uvicorn app:app --host 0.0.0.0 --port 3001 --workers 4
```

## Структура проекта

```
server_fastapi/
├── app.py                 # Главный файл приложения
├── config.py             # Конфигурация
├── database.py           # Подключение к MongoDB
├── requirements.txt      # Зависимости Python
├── models/              # Pydantic модели
│   ├── user.py
│   ├── account.py
│   └── transaction.py
├── middleware/          # Middleware
│   └── auth.py         # JWT аутентификация
├── routers/            # API роутеры
│   ├── auth.py
│   ├── accounts.py
│   ├── transactions.py
│   └── ...
└── services/           # Сервисы
    └── banking_client.py
```

## API Endpoints

Все эндпоинты доступны по префиксу `/api/`

- `/api/auth/*` - Аутентификация
- `/api/accounts/*` - Управление счетами
- `/api/transactions/*` - Транзакции
- `/api/rewards/*` - Бонусы
- `/api/leads/*` - Лиды
- `/api/credit-products/*` - Кредитные продукты
- `/api/cash-loan-applications/*` - Заявки на кредит
- `/api/card-management/*` - Управление картами
- `/api/card-operations/*` - Операции с картами
- `/api/universal-payments/*` - Универсальные платежи
- `/api/mobile-payments/*` - Мобильные платежи

## Документация API

После запуска сервера документация доступна по адресам:
- Swagger UI: http://localhost:3001/docs
- ReDoc: http://localhost:3001/redoc

