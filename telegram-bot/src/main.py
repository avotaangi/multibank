import os
import asyncio
import aiohttp
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo, Message
from aiogram.utils.keyboard import InlineKeyboardBuilder
from dotenv import load_dotenv
import json
import time
import uuid
from urllib.parse import urlencode

# Загружаем переменные окружения
load_dotenv()

# Конфигурация бота
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
API_URL = os.getenv("API_URL", "http://server:8000")
WEBAPP_URL = os.getenv("WEBAPP_URL", "http://localhost:5173")

if not BOT_TOKEN:
    print("❌ TELEGRAM_BOT_TOKEN is required")
    exit(1)

# Создаем экземпляры бота и диспетчера
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

# API клиент
async def api_request(method: str, endpoint: str, data: dict = None, headers: dict = None):
    """Выполнить запрос к API"""
    url = f"{API_URL}{endpoint}"
    try:
        async with aiohttp.ClientSession() as session:
            async with session.request(method, url, json=data, headers=headers) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    error_text = await response.text()
                    print(f"API Error {response.status}: {error_text}")
                    return None
    except Exception as e:
        print(f"API request error: {e}")
        return None

# Команды бота
@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    """Обработчик команды /start"""
    user = message.from_user
    chat_id = message.chat.id
    
    try:
        print(f"🔍 [Bot] /start command received from user {user.id} ({user.first_name})")
        
        # Регистрируем или обновляем пользователя
        # Формируем initData в формате строки, как ожидает API
        user_data = {
            'id': user.id,
            'first_name': user.first_name or '',
            'last_name': user.last_name or '',
            'username': user.username or ''
        }
        user_json = json.dumps(user_data, ensure_ascii=False)
        init_data_str = f"user={user_json}&chat_instance={chat_id}&chat_type=sender&auth_date={int(time.time())}&hash=bot_hash"
        
        print(f"🔍 [Bot] Attempting to register user via API: {API_URL}/api/auth/telegram")
        
        # Пытаемся зарегистрировать пользователя (если эндпоинт существует)
        # Это не критично, если эндпоинт не существует - просто продолжаем
        try:
            result = await api_request("POST", "/api/auth/telegram", {"initData": init_data_str})
            if result:
                print(f"✅ [Bot] User registered successfully")
            else:
                print(f"⚠️ [Bot] User registration returned None (endpoint may not exist)")
        except Exception as e:
            print(f"⚠️ [Bot] Telegram auth endpoint may not exist or error occurred: {e}")
            import traceback
            traceback.print_exc()
        
        welcome_message = f"""
🏦 Добро пожаловать в MultiBank, {user.first_name or 'Пользователь'}!

Ваш аккаунт успешно создан. Теперь вы можете:

💰 Проверить баланс - /balance
📊 Просмотреть транзакции - /transactions
💸 Совершать переводы
⚙️ Настроить уведомления

Для полного доступа к функциям банка используйте веб-приложение:
/webapp

Команды:
/balance - Проверить баланс
/transactions - Последние транзакции
/help - Помощь
/webapp - Открыть веб-приложение

📧 Поддержка: alinaignatova67@gmail.com
        """
        
        # Создаем клавиатуру
        try:
            keyboard = InlineKeyboardBuilder()
            keyboard.add(InlineKeyboardButton(text="💰 Баланс", callback_data="get_balance"))
            keyboard.add(InlineKeyboardButton(text="📊 Транзакции", callback_data="get_transactions"))
            
            # Telegram требует HTTPS для WebApp, поэтому добавляем кнопку только если URL начинается с https://
            # Для localhost используем обычную кнопку-ссылку или не добавляем WebApp
            if WEBAPP_URL.startswith('https://'):
                # Генерируем рандомные параметры для предотвращения кэширования
                random_params = {
                    't': str(int(time.time())),  # Текущее время
                    'r': str(uuid.uuid4().hex[:8])  # Рандомная строка
                }
                webapp_url_with_params = f"{WEBAPP_URL}?{urlencode(random_params)}"
                print(f"🔍 [Bot] Creating WebApp button with HTTPS URL: {webapp_url_with_params}")
                keyboard.row(InlineKeyboardButton(
                    text="🌐 Открыть приложение",
                    web_app=WebAppInfo(url=webapp_url_with_params)
                ))
            else:
                print(f"⚠️ [Bot] WebApp URL is not HTTPS ({WEBAPP_URL}), skipping WebApp button")
                # Можно добавить обычную кнопку-ссылку, но для этого нужен другой тип кнопки
                # Пока просто не добавляем WebApp кнопку
            
            print(f"🔍 [Bot] Sending welcome message to user {user.id}")
            await message.answer(welcome_message, reply_markup=keyboard.as_markup())
            print(f"✅ [Bot] Welcome message sent successfully")
        except Exception as e:
            print(f"❌ [Bot] Error creating keyboard or sending message: {e}")
            import traceback
            traceback.print_exc()
            # Отправляем сообщение без клавиатуры
            await message.answer(welcome_message)
    except Exception as e:
        print(f"❌ [Bot] Start command error: {e}")
        import traceback
        traceback.print_exc()
        await message.answer("❌ Произошла ошибка при инициализации. Попробуйте позже.")

@dp.message(Command("balance"))
async def cmd_balance(message: types.Message):
    """Обработчик команды /balance"""
    user = message.from_user
    chat_id = message.chat.id
    
    try:
        # Все пользователи используют один и тот же client_id_id = 1
        client_id_id = 1
        
        # Получаем список банков пользователя
        banks_response = await api_request("GET", f"/api/{client_id_id}/bank_names")
        banks = banks_response if isinstance(banks_response, list) else []
        
        if not banks:
            await message.answer("У вас пока нет подключенных банков. Создайте счет в веб-приложении.")
            return
        
        # Получаем балансы для всех банков пользователя
        balances = []
        total_balance = 0
        
        for bank in banks:
            try:
                response = await api_request("GET", f"/api/available_balance/{bank}/{client_id_id}")
                if response and "balance" in response:
                    balance = float(response["balance"])
                    total_balance += balance
                    balances.append({
                        "bank": bank.upper(),
                        "balance": balance,
                        "currency": "RUB"
                            })
            except Exception as e:
                print(f"Error getting balance for {bank}: {e}")
                continue
        
        if not balances:
            await message.answer("У вас пока нет активных счетов. Создайте счет в веб-приложении.")
            return
        
        message_text = "💰 Ваши счета:\n\n"
        for balance_info in balances:
            message_text += f"🏦 {balance_info['bank']}\n"
            message_text += f"Баланс: {balance_info['balance']:,.2f} {balance_info['currency']}\n\n"
        
        message_text += f"━━━━━━━━━━━━━━━━\n"
        message_text += f"💵 Общий баланс: {total_balance:,.2f} RUB"
        
        await message.answer(message_text)
    except Exception as e:
        print(f"Balance command error: {e}")
        import traceback
        traceback.print_exc()
        await message.answer("❌ Не удалось получить информацию о балансе.")

@dp.message(Command("transactions"))
async def cmd_transactions(message: types.Message):
    """Обработчик команды /transactions"""
    user = message.from_user
    chat_id = message.chat.id
    
    try:
        # Все пользователи используют один и тот же client_id_id = 1
        client_id_id = 1
        client_id = f"team096-{client_id_id}"
        
        # Получаем список банков пользователя
        banks_response = await api_request("GET", f"/api/{client_id_id}/bank_names")
        banks = banks_response if isinstance(banks_response, list) else []
        
        if not banks:
            await message.answer("У вас пока нет подключенных банков. Создайте счет в веб-приложении.")
            return
        
        # Получаем транзакции для всех банков
        all_transactions = []
        
        for bank in banks:
            try:
                # Получаем счета для банка
                accounts_response = await api_request("GET", f"/api/accounts/banking?bank={bank}&client_id={client_id}")
                if not accounts_response or "data" not in accounts_response:
                    continue
                
                accounts = accounts_response.get("data", {}).get("accounts", []) or accounts_response.get("data", {}).get("account", [])
                
                for account in accounts:
                    if not isinstance(account, dict):
                        continue
                    
                    account_id = account.get("accountId") or account.get("account_id") or account.get("id")
                    if not account_id:
                        continue
                    
                    # Получаем транзакции для счета через правильный эндпоинт
                    try:
                        transactions_response = await api_request("GET", f"/api/accounts/{account_id}/transactions?bank={bank}&client_id={client_id}&limit=10")
                        if transactions_response:
                            # Извлекаем транзакции из ответа
                            # Структура: data.data.transaction или data.transaction (единственное число!)
                            transactions_data = []
                            if isinstance(transactions_response, dict):
                                # Вариант 1: data.data.transaction (единственное число - приоритет!)
                                if "data" in transactions_response:
                                    data_obj = transactions_response["data"]
                                    if isinstance(data_obj, dict) and "data" in data_obj:
                                        if "transaction" in data_obj["data"] and isinstance(data_obj["data"]["transaction"], list):
                                            transactions_data = data_obj["data"]["transaction"]
                                        elif "transactions" in data_obj["data"] and isinstance(data_obj["data"]["transactions"], list):
                                            transactions_data = data_obj["data"]["transactions"]
                                    # Вариант 2: data.transaction (единственное число)
                                    elif "transaction" in data_obj and isinstance(data_obj["transaction"], list):
                                        transactions_data = data_obj["transaction"]
                                    # Вариант 3: data.transactions (множественное число)
                                    elif "transactions" in data_obj and isinstance(data_obj["transactions"], list):
                                        transactions_data = data_obj["transactions"]
                                    # Вариант 4: data - это массив
                                    elif isinstance(data_obj, list):
                                        transactions_data = data_obj
                                # Вариант 5: transactions напрямую
                                elif "transactions" in transactions_response and isinstance(transactions_response["transactions"], list):
                                    transactions_data = transactions_response["transactions"]
                            elif isinstance(transactions_response, list):
                                transactions_data = transactions_response
                            
                            for tx in transactions_data:
                                all_transactions.append({
                                    "bank": bank.upper(),
                                    "account": account_id,
                                    "transaction": tx
                                })
                    except Exception as e:
                        print(f"Error getting transactions for account {account_id} in {bank}: {e}")
                        import traceback
                        traceback.print_exc()
                        continue
            except Exception as e:
                print(f"Error processing bank {bank}: {e}")
                continue
        
        if not all_transactions:
            await message.answer("📊 У вас пока нет транзакций. История транзакций будет доступна после совершения операций.")
            return
        
        # Форматируем транзакции для отображения
        message_text = "📊 Последние транзакции:\n\n"
        
        # Ограничиваем до 10 последних транзакций
        for i, tx_info in enumerate(all_transactions[:10], 1):
            tx = tx_info["transaction"]
            bank = tx_info["bank"]
            
            # Извлекаем сумму и валюту
            amount_obj = tx.get("amount", {})
            if isinstance(amount_obj, dict):
                amount = amount_obj.get("amount", "0")
                currency = amount_obj.get("currency", "RUB")
            else:
                amount = str(amount_obj) if amount_obj else "0"
                currency = tx.get("currency", "RUB")
            
            # Извлекаем описание (используем transactionInformation)
            description = tx.get("transactionInformation") or tx.get("description") or tx.get("reference") or tx.get("remittanceInformation") or "Транзакция"
            
            # Извлекаем дату (используем bookingDateTime)
            date = tx.get("bookingDateTime") or tx.get("valueDateTime") or tx.get("bookingDate") or tx.get("valueDate") or ""
            
            # Форматируем дату
            formatted_date = ""
            if date:
                try:
                    from datetime import datetime
                    # Парсим ISO формат даты
                    if "T" in date:
                        date_obj = datetime.fromisoformat(date.replace("Z", "+00:00"))
                        formatted_date = date_obj.strftime("%d.%m.%Y %H:%M")
                    else:
                        formatted_date = date
                except:
                    formatted_date = date
            
            # Определяем тип транзакции на основе creditDebitIndicator
            credit_debit = tx.get("creditDebitIndicator", "")
            amount_num = float(amount) if amount else 0
            
            if credit_debit == "Credit":
                tx_type = "📥"
                sign = "+"
            elif credit_debit == "Debit":
                tx_type = "📤"
                sign = "-"
            else:
                # Fallback: проверяем знак суммы
                if amount_num > 0:
                    tx_type = "📥"
                    sign = "+"
                elif amount_num < 0:
                    tx_type = "📤"
                    sign = "-"
                else:
                    tx_type = "💸"
                    sign = ""
            
            # Форматируем сумму
            formatted_amount = f"{sign}{abs(amount_num):,.2f}".replace(",", " ").replace(".", ",")
            
            message_text += f"{tx_type} {bank}\n"
            message_text += f"{description}\n"
            message_text += f"Сумма: {formatted_amount} {currency}\n"
            if formatted_date:
                message_text += f"Дата: {formatted_date}\n"
            message_text += "\n"
        
        if len(all_transactions) > 10:
            message_text += f"\n... и еще {len(all_transactions) - 10} транзакций"
        
        message_text += "\n💡 Для полной истории используйте веб-приложение: /webapp"
        
        await message.answer(message_text)
    except Exception as e:
        print(f"Transactions command error: {e}")
        import traceback
        traceback.print_exc()
        await message.answer("❌ Не удалось получить историю транзакций.")

@dp.message(Command("webapp"))
async def cmd_webapp(message: types.Message):
    """Обработчик команды /webapp"""
    chat_id = message.chat.id
    
    message_text = "🌐 Откройте веб-приложение для полного доступа к функциям банка:"
    
    # Генерируем рандомные параметры для предотвращения кэширования
    random_params = {
        't': str(int(time.time())),  # Текущее время
        'r': str(uuid.uuid4().hex[:8])  # Рандомная строка
    }
    webapp_url_with_params = f"{WEBAPP_URL}?{urlencode(random_params)}"
    
    keyboard = InlineKeyboardBuilder()
    keyboard.add(InlineKeyboardButton(
        text="🚀 Открыть MultiBank",
        web_app=WebAppInfo(url=webapp_url_with_params)
    ))
    
    await message.answer(message_text, reply_markup=keyboard.as_markup())

@dp.message(Command("help"))
async def cmd_help(message: types.Message):
    """Обработчик команды /help"""
    help_message = """
🆘 Помощь по MultiBank

Доступные команды:
/start - Начать работу с ботом
/balance - Проверить баланс счетов
/transactions - Последние транзакции
/webapp - Открыть веб-приложение
/help - Показать это сообщение

Для полного доступа к функциям банка откройте веб-приложение.

Поддержка: alinaignatova67@gmail.com
    """
    
    await message.answer(help_message)

# Обработчик callback запросов
@dp.callback_query(F.data == "get_balance")
async def callback_balance(callback: types.CallbackQuery):
    """Обработчик callback для получения баланса"""
    user = callback.from_user
    chat_id = callback.message.chat.id
    
    try:
        await callback.answer("💰 Получение информации о балансе...")
        
        # Все пользователи используют один и тот же client_id_id = 1
        client_id_id = 1
        
        # Получаем список банков пользователя
        banks_response = await api_request("GET", f"/api/{client_id_id}/bank_names")
        banks = banks_response if isinstance(banks_response, list) else []
        
        if not banks:
            await callback.message.answer("У вас пока нет подключенных банков. Создайте счет в веб-приложении.")
            return
        
        # Получаем балансы для всех банков пользователя
        balances = []
        total_balance = 0
        
        for bank in banks:
            try:
                response = await api_request("GET", f"/api/available_balance/{bank}/{client_id_id}")
                if response and "balance" in response:
                    balance = float(response["balance"])
                    total_balance += balance
                    balances.append({
                        "bank": bank.upper(),
                        "balance": balance,
                        "currency": "RUB"
                    })
            except Exception as e:
                print(f"Error getting balance for {bank}: {e}")
                continue
        
        if not balances:
            await callback.message.answer("У вас пока нет активных счетов. Создайте счет в веб-приложении.")
            return
        
        message_text = "💰 Ваши счета:\n\n"
        for balance_info in balances:
            message_text += f"🏦 {balance_info['bank']}\n"
            message_text += f"Баланс: {balance_info['balance']:,.2f} {balance_info['currency']}\n\n"
        
        message_text += f"━━━━━━━━━━━━━━━━\n"
        message_text += f"💵 Общий баланс: {total_balance:,.2f} RUB"
        
        await callback.message.answer(message_text)
    except Exception as e:
        print(f"Callback balance error: {e}")
        import traceback
        traceback.print_exc()
        await callback.message.answer("❌ Не удалось получить информацию о балансе.")

@dp.callback_query(F.data == "get_transactions")
async def callback_transactions(callback: types.CallbackQuery):
    """Обработчик callback для получения транзакций"""
    user = callback.from_user
    
    try:
        await callback.answer("📊 Получение истории транзакций...")
        
        # Все пользователи используют один и тот же client_id_id = 1
        client_id_id = 1
        client_id = f"team096-{client_id_id}"
        
        # Получаем список банков пользователя
        banks_response = await api_request("GET", f"/api/{client_id_id}/bank_names")
        banks = banks_response if isinstance(banks_response, list) else []
        
        if not banks:
            await callback.message.answer("У вас пока нет подключенных банков. Создайте счет в веб-приложении.")
            return
        
        # Получаем транзакции для всех банков
        all_transactions = []
        
        for bank in banks:
            try:
                # Получаем счета для банка
                accounts_response = await api_request("GET", f"/api/accounts/banking?bank={bank}&client_id={client_id}")
                if not accounts_response or "data" not in accounts_response:
                    continue
                
                accounts = accounts_response.get("data", {}).get("accounts", []) or accounts_response.get("data", {}).get("account", [])
                
                for account in accounts:
                    if not isinstance(account, dict):
                        continue
                    
                    account_id = account.get("accountId") or account.get("account_id") or account.get("id")
                    if not account_id:
                        continue
                    
                    # Получаем транзакции для счета через правильный эндпоинт
                    try:
                        transactions_response = await api_request("GET", f"/api/accounts/{account_id}/transactions?bank={bank}&client_id={client_id}&limit=10")
                        if transactions_response:
                            # Извлекаем транзакции из ответа
                            # Структура: data.data.transaction или data.transaction (единственное число!)
                            transactions_data = []
                            if isinstance(transactions_response, dict):
                                # Вариант 1: data.data.transaction (единственное число - приоритет!)
                                if "data" in transactions_response:
                                    data_obj = transactions_response["data"]
                                    if isinstance(data_obj, dict) and "data" in data_obj:
                                        if "transaction" in data_obj["data"] and isinstance(data_obj["data"]["transaction"], list):
                                            transactions_data = data_obj["data"]["transaction"]
                                        elif "transactions" in data_obj["data"] and isinstance(data_obj["data"]["transactions"], list):
                                            transactions_data = data_obj["data"]["transactions"]
                                    # Вариант 2: data.transaction (единственное число)
                                    elif "transaction" in data_obj and isinstance(data_obj["transaction"], list):
                                        transactions_data = data_obj["transaction"]
                                    # Вариант 3: data.transactions (множественное число)
                                    elif "transactions" in data_obj and isinstance(data_obj["transactions"], list):
                                        transactions_data = data_obj["transactions"]
                                    # Вариант 4: data - это массив
                                    elif isinstance(data_obj, list):
                                        transactions_data = data_obj
                                # Вариант 5: transactions напрямую
                                elif "transactions" in transactions_response and isinstance(transactions_response["transactions"], list):
                                    transactions_data = transactions_response["transactions"]
                            elif isinstance(transactions_response, list):
                                transactions_data = transactions_response
                            
                            for tx in transactions_data:
                                all_transactions.append({
                                    "bank": bank.upper(),
                                    "account": account_id,
                                    "transaction": tx
                                })
                    except Exception as e:
                        print(f"Error getting transactions for account {account_id} in {bank}: {e}")
                        import traceback
                        traceback.print_exc()
                        continue
            except Exception as e:
                print(f"Error processing bank {bank}: {e}")
                continue
        
        if not all_transactions:
            await callback.message.answer("📊 У вас пока нет транзакций. История транзакций будет доступна после совершения операций.")
            return
        
        # Форматируем транзакции для отображения
        message_text = "📊 Последние транзакции:\n\n"
        
        # Ограничиваем до 10 последних транзакций
        for i, tx_info in enumerate(all_transactions[:10], 1):
            tx = tx_info["transaction"]
            bank = tx_info["bank"]
            
            # Извлекаем сумму и валюту
            amount_obj = tx.get("amount", {})
            if isinstance(amount_obj, dict):
                amount = amount_obj.get("amount", "0")
                currency = amount_obj.get("currency", "RUB")
            else:
                amount = str(amount_obj) if amount_obj else "0"
                currency = tx.get("currency", "RUB")
            
            # Извлекаем описание (используем transactionInformation)
            description = tx.get("transactionInformation") or tx.get("description") or tx.get("reference") or tx.get("remittanceInformation") or "Транзакция"
            
            # Извлекаем дату (используем bookingDateTime)
            date = tx.get("bookingDateTime") or tx.get("valueDateTime") or tx.get("bookingDate") or tx.get("valueDate") or ""
            
            # Форматируем дату
            formatted_date = ""
            if date:
                try:
                    from datetime import datetime
                    # Парсим ISO формат даты
                    if "T" in date:
                        date_obj = datetime.fromisoformat(date.replace("Z", "+00:00"))
                        formatted_date = date_obj.strftime("%d.%m.%Y %H:%M")
                    else:
                        formatted_date = date
                except:
                    formatted_date = date
            
            # Определяем тип транзакции на основе creditDebitIndicator
            credit_debit = tx.get("creditDebitIndicator", "")
            amount_num = float(amount) if amount else 0
            
            if credit_debit == "Credit":
                tx_type = "📥"
                sign = "+"
            elif credit_debit == "Debit":
                tx_type = "📤"
                sign = "-"
            else:
                # Fallback: проверяем знак суммы
                if amount_num > 0:
                    tx_type = "📥"
                    sign = "+"
                elif amount_num < 0:
                    tx_type = "📤"
                    sign = "-"
                else:
                    tx_type = "💸"
                    sign = ""
            
            # Форматируем сумму
            formatted_amount = f"{sign}{abs(amount_num):,.2f}".replace(",", " ").replace(".", ",")
            
            message_text += f"{tx_type} {bank}\n"
            message_text += f"{description}\n"
            message_text += f"Сумма: {formatted_amount} {currency}\n"
            if formatted_date:
                message_text += f"Дата: {formatted_date}\n"
            message_text += "\n"
        
        if len(all_transactions) > 10:
            message_text += f"\n... и еще {len(all_transactions) - 10} транзакций"
        
        message_text += "\n💡 Для полной истории используйте веб-приложение: /webapp"
        
        await callback.message.answer(message_text)
    except Exception as e:
        print(f"Callback transactions error: {e}")
        import traceback
        traceback.print_exc()
        await callback.message.answer("❌ Не удалось получить историю транзакций.")

# Установка команд бота
async def set_bot_commands():
    """Установить команды бота"""
    commands = [
        types.BotCommand(command="start", description="Начать работу с ботом"),
        types.BotCommand(command="balance", description="Проверить баланс"),
        types.BotCommand(command="transactions", description="Последние транзакции"),
        types.BotCommand(command="help", description="Помощь"),
        types.BotCommand(command="webapp", description="Открыть веб-приложение")
    ]
    await bot.set_my_commands(commands)

# Обработка ошибок
@dp.errors()
async def error_handler(update: types.Update, exception: Exception):
    """Обработчик ошибок"""
    print(f"Error: {exception}")
    return True

# Главная функция
async def main():
    """Главная функция запуска бота"""
    # Устанавливаем команды
    await set_bot_commands()
    
    print("🤖 MultiBank Telegram Bot started")
    print(f"📱 Bot username: {os.getenv('TELEGRAM_BOT_USERNAME', 'Not set')}")
    print(f"🌐 WebApp URL: {WEBAPP_URL}")
    print(f"🔗 API URL: {API_URL}")
    
    # Запускаем бота
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Bot stopped")
    finally:
        asyncio.run(bot.session.close())

