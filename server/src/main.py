from fastapi import FastAPI, Query, Header, HTTPException, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from aiohttp import ClientSession
from dotenv import load_dotenv
from bankAPI.bankAPI import BankHelper
from banking_client import BankingClient
from contextlib import asynccontextmanager
from schemas import TransferRequest, ProductAgreementRequest, DepositRequest, CloseAgreementRequest, WithdrawRequest
from database import db
from typing import Optional, Dict, Any
from datetime import datetime, timezone
load_dotenv()

# Импортируем db для использования в эндпоинтах
from database import db as db_instance

bank_helper: Optional[BankHelper] = None  # глобальная переменная
banking_client: Optional[BankingClient] = None  # клиент для банковского API

session: Optional[ClientSession] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global bank_helper, banking_client, session
    print("🚀 BankHelper запущен")

    # Сборник функций для работы с API и БД
    session = ClientSession()
    bank_helper = BankHelper(db=db, session=session)
    banking_client = BankingClient(db=db)

    yield                                 # приложение работает

    await bank_helper.close()             # закрываем сессию
    await session.close()
    print("🛑 BankHelper остановлен")

app = FastAPI(lifespan=lifespan)

# CORS
import os
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
origins = [
    "http://localhost",
    "http://127.0.0.1",
    "http://localhost:80",
    "http://127.0.0.1:80",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4040",
    "http://192.168.0.16:5173",
    "http://198.18.0.1:5173",
    "http://localhost:3001",
    "https://*.ngrok.io",
    "https://*.loca.lt",
    "https://*.cloudpub.ru/",
    "https://vindictively-meteoric-pilchard.cloudpub.ru",
    "https://avotaangi.ru",
    "https://www.avotaangi.ru"
]
# Добавляем origins из переменной окружения
if allowed_origins_env:
    origins.extend([origin.strip() for origin in allowed_origins_env.split(",")])
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
async def main():
    return {"status": "ok", "message": "FastAPI Banking API is running"}

@app.get("/health")
async def health():
    return {"status": "ok", "service": "fastapi"}

async def get_telegram_id_from_client_id(client_id: str) -> Optional[int]:
    """Получить telegram_id из БД по client_id"""
    try:
        client_id_id = client_id.split('-')[-1] if '-' in client_id else client_id
        
        # Ищем пользователя в коллекции users по client_id_id в любом банке
        user = await db_instance.users.find_one({
            "$or": [
                {"vbank.client_id_id": client_id_id},
                {"abank.client_id_id": client_id_id},
                {"sbank.client_id_id": client_id_id}
            ]
        })
        
        if user:
            telegram_id = user.get("telegramId")
            if telegram_id:
                return int(telegram_id)
        
        # Fallback: используем последнюю цифру client_id_id как telegram_id для тестирования
        # Это позволяет системе работать даже если telegram_id не установлен в БД
        try:
            last_digit = int(str(client_id_id)[-1])
            # Используем последнюю цифру * 10 для получения уникального ID
            fallback_telegram_id = int(f"{last_digit}{last_digit}{last_digit}")
            print(f"⚠️ telegram_id не найден в БД для client_id={client_id}, используем fallback: {fallback_telegram_id}")
            return fallback_telegram_id
        except:
            pass
        
        return None
    except Exception as e:
        print(f"⚠️ Ошибка при получении telegram_id для client_id={client_id}: {e}")
        return None

@app.delete("/api/admin/clear-tokens")
async def clear_tokens():
    """Очистить все токены bankingAPI из базы данных"""
    try:
        result = await db_instance.access_tokens.delete_many({})
        return {
            "status": "success",
            "message": f"Удалено {result.deleted_count} токен(ов)",
            "deleted_count": result.deleted_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при очистке токенов: {str(e)}")

@app.post("/api/admin/reset-user-banks")
async def reset_user_banks(client_id_id: str = Query(...)):
    """Сбросить токены пользователя - очистить все токены для пользователя"""
    try:
        user_id = int(client_id_id) if client_id_id.isdigit() else None
        
        if user_id is None:
            raise HTTPException(status_code=400, detail=f"Неверный client_id_id={client_id_id}, должен быть числом")
        
        # Очищаем токены для этого пользователя
        result = await db_instance.access_tokens.delete_many({
            "user_id": user_id
        })
        
        return {
            "status": "success",
            "message": f"Токены пользователя {user_id} очищены",
            "user_id": user_id,
            "deleted_count": result.deleted_count
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при сбросе токенов: {str(e)}")

# =========================
# Auth endpoints
# =========================

@app.get("/api/auth/banks")
async def get_banks():
    """Получить список доступных банков"""
    banks = banking_client.get_banks()
    return {
        "banks": [
            {"id": bank, "name": bank.upper(), "url": banking_client.banks[bank]}
            for bank in banks
        ]
    }

# =========================
# Accounts endpoints
# =========================

@app.get("/api/accounts/banking")
async def get_banking_accounts(
    bank: str = Query(default="vbank"),
    client_id: str = Query(...),
    consent_id: Optional[str] = Header(None, alias="X-Consent-Id")
):
    """Получить счета из банковского API"""
    try:
        if not session or not banking_client or not bank_helper:
            raise HTTPException(status_code=503, detail="Service not initialized")
        
        # Получаем user_id из client_id
        client_id_id = client_id.split('-')[-1] if '-' in client_id else client_id
        user_id = int(client_id_id) if client_id_id.isdigit() else None
        
        # Получаем consent для банка
        access_token = await bank_helper.get_access_token(bank_name=bank)
        consent = await bank_helper.get_account_consent(bank_name=bank, access_token=access_token, client_id_id=client_id_id)
        
        headers = {
            "X-Requesting-Bank": banking_client.team_id
        }
        if consent:
            headers["X-Consent-Id"] = consent
        if consent_id:
            headers["X-Consent-Id"] = consent_id
        
        # Если consent равен None (pending согласие), возвращаем пустой список счетов
        if not consent and not consent_id:
            print(f"⚠️ Согласие для {bank} не получено (pending), возвращаем пустой список счетов")
            return {"data": {"accounts": []}, "meta": {"pending_consent": True}}
        
        try:
            print(f"🔍 [get_banking_accounts] Запрос счетов для {bank}, client_id={client_id}, user_id={user_id}, consent={consent or consent_id}")
            print(f"🔍 [get_banking_accounts] Headers: {headers}")
            
            accounts = await banking_client.request(
                session,
                bank,
                "GET",
                "/accounts",
                params={"client_id": client_id},
                headers=headers,
                user_id=user_id
            )
            
            print(f"✅ [get_banking_accounts] Получен ответ от {bank}:")
            print(f"   Тип данных: {type(accounts)}")
            print(f"   Содержимое: {str(accounts)[:500]}")  # Первые 500 символов
            if isinstance(accounts, dict):
                print(f"   Ключи: {list(accounts.keys())}")
                if "data" in accounts:
                    if isinstance(accounts["data"], dict):
                        print(f"   data.keys(): {list(accounts['data'].keys())}")
                        if "accounts" in accounts["data"]:
                            print(f"   Количество счетов в data.accounts: {len(accounts['data']['accounts']) if isinstance(accounts['data']['accounts'], list) else 'не массив'}")
                        if "account" in accounts["data"]:
                            print(f"   Количество счетов в data.account: {len(accounts['data']['account']) if isinstance(accounts['data']['account'], list) else 'не массив'}")
                    elif isinstance(accounts["data"], list):
                        print(f"   data - это массив, длина: {len(accounts['data'])}")
                if "accounts" in accounts:
                    print(f"   Количество счетов в accounts: {len(accounts['accounts']) if isinstance(accounts['accounts'], list) else 'не массив'}")
                if "account" in accounts:
                    print(f"   Количество счетов в account: {len(accounts['account']) if isinstance(accounts['account'], list) else 'не массив'}")
            
            return accounts
        except Exception as e:
            # Если ошибка 403 CONSENT_REQUIRED, возвращаем пустой список вместо ошибки
            error_str = str(e)
            print(f"❌ [get_banking_accounts] Ошибка при получении счетов для {bank}: {error_str}")
            print(f"   Тип ошибки: {type(e).__name__}")
            if "403" in error_str or "CONSENT_REQUIRED" in error_str:
                print(f"⚠️ Согласие для {bank} не одобрено или отсутствует, возвращаем пустой список счетов")
                return {"data": {"accounts": []}, "meta": {"pending_consent": True, "error": error_str}}
            # Для других ошибок тоже возвращаем пустой список, чтобы не ломать UI
            print(f"⚠️ Ошибка при получении счетов для {bank}: {error_str}, возвращаем пустой список")
            return {"data": {"accounts": []}, "meta": {"error": error_str}}
    except HTTPException:
        raise
    except Exception as e:
        # Вместо ошибки 500, возвращаем пустой список счетов
        print(f"⚠️ Ошибка в get_banking_accounts для {bank}: {str(e)}, возвращаем пустой список")
        return {"data": {"accounts": []}, "meta": {"error": str(e)}}

# =========================
# Products endpoints
# =========================

# =========================
# Payments endpoints
# =========================

# =========================
# Product Agreements endpoints - УДАЛЕНЫ (не используются)
# =========================

# =========================
# Consents endpoints - УДАЛЕНЫ (не используются)  
# =========================

# =========================
# Payments endpoints
# =========================

@app.post("/api/payments")
async def create_payment(
    request: Request,
    bank: str = Query(default="vbank"),
    client_id: Optional[str] = Query(None),
    x_payment_consent_id: Optional[str] = Header(None, alias="X-Payment-Consent-Id"),
    x_requesting_bank: Optional[str] = Header(None, alias="X-Requesting-Bank")
):
    """Создать платеж"""

# =========================
# Payments endpoints
# =========================

@app.post("/api/payments")
async def create_payment(
    request: Request,
    bank: str = Query(default="vbank"),
    client_id: Optional[str] = Query(None),
    x_payment_consent_id: Optional[str] = Header(None, alias="X-Payment-Consent-Id"),
    x_requesting_bank: Optional[str] = Header(None, alias="X-Requesting-Bank")
):
    """Создать платеж"""
    try:
        if not session or not banking_client:
            raise HTTPException(status_code=503, detail="Service not initialized")
        
        # Получаем user_id из client_id
        user_id = None
        if client_id:
            client_id_id = client_id.split('-')[-1] if '-' in client_id else client_id
            user_id = int(client_id_id) if client_id_id.isdigit() else None
        
        payment_data = await request.json()
        params = {}
        if client_id:
            params["client_id"] = client_id
        
        headers = {}
        if x_payment_consent_id:
            headers["X-Payment-Consent-Id"] = x_payment_consent_id
        if x_requesting_bank:
            headers["X-Requesting-Bank"] = x_requesting_bank
        else:
            headers["X-Requesting-Bank"] = banking_client.team_id
        
        # Пытаемся создать платеж
        try:
            payment = await banking_client.request(
                session,
                bank,
                "POST",
                "/payments",
                params=params,
                data=payment_data,
                headers=headers,
                user_id=user_id
            )
            return payment
        except Exception as e:
            # Если ошибка 403 PAYMENT_CONSENT_REQUIRED, автоматически создаем согласие
            error_str = str(e)
            if "403" in error_str and ("PAYMENT_CONSENT_REQUIRED" in error_str or "consent" in error_str.lower()):
                print(f"⚠️ Требуется согласие на платеж для {bank}, создаю автоматически...")
                
                # Извлекаем данные из payment_data для создания consent
                initiation = payment_data.get("data", {}).get("initiation", {})
                instructed_amount = initiation.get("instructedAmount", {})
                debtor_account = initiation.get("debtorAccount", {})
                creditor_account = initiation.get("creditorAccount", {})
                
                amount = float(instructed_amount.get("amount", 0))
                currency = instructed_amount.get("currency", "RUB")
                debtor_account_number = debtor_account.get("identification", "")
                creditor_account_number = creditor_account.get("identification", "")
                comment = initiation.get("comment", "Перевод по номеру счета")
                
                if not client_id:
                    raise HTTPException(status_code=400, detail="client_id required for payment consent")
                
                # Создаем payment consent
                try:
                    consent_result = await banking_client.request(
                        session,
                        bank,
                        "POST",
                        "/payment-consents/request",
                        data={
                            "requesting_bank": banking_client.team_id,
                            "client_id": client_id,
                            "consent_type": "single_use",
                            "amount": amount,
                            "currency": currency,
                            "debtor_account": debtor_account_number,
                            "creditor_account": creditor_account_number,
                            "reference": comment
                        },
                        headers={"X-Requesting-Bank": banking_client.team_id},
                        user_id=user_id
                    )
                    
                    # Извлекаем consent_id из ответа
                    payment_consent_id = None
                    if isinstance(consent_result, dict):
                        payment_consent_id = consent_result.get("consent_id") or consent_result.get("data", {}).get("consentId") or consent_result.get("data", {}).get("consent_id")
                        # Если это строка напрямую
                        if not payment_consent_id and isinstance(consent_result, str):
                            payment_consent_id = consent_result
                    else:
                        payment_consent_id = consent_result
                    
                    if payment_consent_id:
                        print(f"✅ Payment consent создан для {bank}: {payment_consent_id}")
                        # Добавляем consent_id в заголовки и повторяем запрос
                        headers["X-Payment-Consent-Id"] = payment_consent_id
                        
                        payment = await banking_client.request(
                            session,
                            bank,
                            "POST",
                            "/payments",
                            params=params,
                            data=payment_data,
                            headers=headers,
                            user_id=user_id
                        )
                        return payment
                    else:
                        raise HTTPException(status_code=500, detail="Failed to get payment consent_id from response")
                except Exception as e2:
                    print(f"❌ Ошибка при создании payment consent: {e2}")
                    raise HTTPException(status_code=500, detail=f"Failed to create payment consent: {str(e2)}")
            else:
                # Другая ошибка - пробрасываем дальше
                raise
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/payments/{payment_id}")
async def get_payment(payment_id: str, bank: str = Query(default="vbank"), client_id: Optional[str] = Query(None)):
    """Получить статус платежа"""
    try:
        if not session or not banking_client:
            raise HTTPException(status_code=503, detail="Service not initialized")
        
        # Получаем user_id из client_id
        user_id = None
        if client_id:
            client_id_id = client_id.split('-')[-1] if '-' in client_id else client_id
            user_id = int(client_id_id) if client_id_id.isdigit() else None
        
        params = {}
        if client_id:
            params["client_id"] = client_id
        
        payment = await banking_client.request(
            session,
            bank,
            "GET",
            f"/payments/{payment_id}",
            params=params,
            user_id=user_id
        )
        return payment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =========================
# Cards endpoints
# =========================

@app.get("/api/cards")
async def get_cards(
    bank: str = Query(default="vbank"),
    client_id: str = Query(...),
    consent_id: Optional[str] = Header(None, alias="X-Consent-Id")
):
    """Получить список карт клиента"""
    try:
        if not session or not banking_client or not bank_helper:
            raise HTTPException(status_code=503, detail="Service not initialized")
        
        # Получаем user_id из client_id
        client_id_id = client_id.split('-')[-1] if '-' in client_id else client_id
        user_id = int(client_id_id) if client_id_id.isdigit() else None
        
        # Получаем consent для банка
        client_id_id = client_id.split('-')[-1] if '-' in client_id else client_id
        access_token = await bank_helper.get_access_token(bank_name=bank)
        consent = await bank_helper.get_account_consent(bank_name=bank, access_token=access_token, client_id_id=client_id_id)
        
        headers = {
            "X-Requesting-Bank": banking_client.team_id
        }
        if consent:
            headers["X-Consent-Id"] = consent
        if consent_id:
            headers["X-Consent-Id"] = consent_id
        
        # Если consent равен None (pending согласие), возвращаем пустой список карт
        if not consent and not consent_id:
            print(f"⚠️ Согласие для {bank} не получено (pending), возвращаем пустой список карт")
            return {"data": {"cards": []}, "meta": {"pending_consent": True}}
        
        try:
            cards = await banking_client.request(
                session,
                bank,
                "GET",
                "/cards",
                params={"client_id": client_id},
                headers=headers,
                user_id=user_id
            )
            return cards
        except Exception as e:
            # Если ошибка 403 CONSENT_REQUIRED с ReadCards, пересоздаем согласие
            error_str = str(e)
            if "403" in error_str and "ReadCards" in error_str:
                # Проверяем, есть ли уже pending согласие в БД
                user = await db_instance.users.find_one(
                    {f"{bank}.client_id_id": client_id_id},
                    {f"{bank}.$": 1}
                )
                
                # Если есть pending согласие (есть request_id, но нет consent), не создаем новое
                if user and bank in user and user[bank]:
                    record = user[bank][0]
                    existing_request_id = record.get("request_id")
                    existing_consent = record.get("consent")
                    
                    # Если есть request_id, но нет consent - значит согласие в pending
                    if existing_request_id and not existing_consent:
                        print(f"⚠️ Согласие для {bank} уже в статусе pending (request_id: {existing_request_id}), не создаю новое")
                        return {"data": {"cards": []}, "meta": {"pending_consent": True, "request_id": existing_request_id}}
                
                print(f"⚠️ Согласие не содержит ReadCards, пересоздаю согласие для {bank}...")
                try:
                    # Создаем новое согласие с ReadCards
                    consent_result = await banking_client.request(
                        session,
                        bank,
                        "POST",
                        "/account-consents/request",
                        data={
                            "client_id": client_id,
                            "permissions": ["ReadAccountsDetail", "ReadBalances", "ReadTransactionsDetail", "ReadCards"],
                            "reason": "Агрегация счетов и карт для мультибанк-приложения",
                            "requesting_bank": banking_client.team_id,
                            "requesting_bank_name": "MultiBank App"
                        },
                        headers={"X-Requesting-Bank": banking_client.team_id},
                        user_id=user_id
                    )
                    
                    # Извлекаем consent_id из ответа
                    new_consent_id = None
                    consent_status = None
                    
                    if isinstance(consent_result, dict):
                        new_consent_id = consent_result.get("consent_id") or consent_result.get("data", {}).get("consentId")
                        consent_status = consent_result.get("status") or consent_result.get("data", {}).get("status")
                        
                        # Если статус pending, получаем request_id и сохраняем в БД
                        if consent_status == "pending":
                            request_id = consent_result.get("request_id") or consent_result.get("data", {}).get("requestId")
                            if request_id:
                                # Сохраняем request_id в БД, чтобы не создавать новое согласие повторно
                                await db_instance.users.update_one(
                                    {f"{bank}.client_id_id": client_id_id},
                                    {"$set": {f"{bank}.$.request_id": request_id}}
                                )
                                print(f"⚠️ Согласие для {bank} находится в статусе pending (request_id: {request_id}), сохранено в БД")
                                # Для pending согласий возвращаем пустой список карт
                                return {"data": {"cards": []}, "meta": {"pending_consent": True, "request_id": request_id}}
                        
                        # Если статус approved, используем consent_id
                        if consent_status == "approved" and new_consent_id:
                            pass  # consent_id уже получен
                        elif not new_consent_id:
                            # Если это строка (consent_id напрямую)
                            new_consent_id = consent_result if isinstance(consent_result, str) else None
                    else:
                        new_consent_id = consent_result
                    
                    if new_consent_id:
                        # Обновляем consent в БД
                        client_id_id = client_id.split('-')[-1] if '-' in client_id else client_id
                        await db_instance.users.update_one(
                            {f"{bank}.client_id_id": client_id_id},
                            {"$set": {f"{bank}.$.consent": new_consent_id}}
                        )
                        print(f"✅ Новое согласие с ReadCards создано для {bank}: {new_consent_id}")
                        
                        # Повторяем запрос карт с новым согласием
                        headers["X-Consent-Id"] = new_consent_id
                        cards = await banking_client.request(
                            session,
                            bank,
                            "GET",
                            "/cards",
                            params={"client_id": client_id},
                            headers=headers,
                            user_id=user_id
                        )
                        return cards
                    else:
                        # Если не удалось получить consent_id, возвращаем пустой список вместо ошибки
                        print(f"⚠️ Не удалось получить consent_id для {bank}, возвращаем пустой список карт")
                        return {"data": {"cards": []}, "meta": {"pending_consent": True}}
                except Exception as e2:
                    print(f"❌ Ошибка при пересоздании согласия: {e2}")
                    # Вместо ошибки 500, возвращаем пустой список карт
                    return {"data": {"cards": []}, "meta": {"error": str(e2), "pending_consent": True}}
            else:
                # Другая ошибка - пробрасываем дальше
                raise
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/cards/{card_id}")
async def get_card(
    card_id: str,
    bank: str = Query(default="vbank"),
    client_id: Optional[str] = Query(None),
    show_full_number: bool = Query(default=False),
    consent_id: Optional[str] = Header(None, alias="X-Consent-Id"),
    telegram_id: Optional[int] = Query(None)
):
    """Получить детали карты"""
    try:
        if not session or not banking_client or not bank_helper:
            raise HTTPException(status_code=503, detail="Service not initialized")
        
        # Получаем user_id из client_id
        user_id = None
        if client_id:
            client_id_id = client_id.split('-')[-1] if '-' in client_id else client_id
            user_id = int(client_id_id) if client_id_id.isdigit() else None
        
        # Получаем consent для банка
        if client_id:
            client_id_id = client_id.split('-')[-1] if '-' in client_id else client_id
            access_token = await bank_helper.get_access_token(bank_name=bank)
            consent = await bank_helper.get_account_consent(bank_name=bank, access_token=access_token, client_id_id=client_id_id)
        else:
            consent = None
        
        headers = {
            "X-Requesting-Bank": banking_client.team_id
        }
        if consent:
            headers["X-Consent-Id"] = consent
        if consent_id:
            headers["X-Consent-Id"] = consent_id
        
        params = {}
        if client_id:
            params["client_id"] = client_id
        if show_full_number:
            params["show_full_number"] = "true"
        
        card = await banking_client.request(
            session,
            bank,
            "GET",
            f"/cards/{card_id}",
            params=params,
                    headers=headers,
                    user_id=user_id
                )
        return card
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/cards/{card_id}/statement")
async def get_card_statement(
    card_id: str,
    bank: str = Query(default="vbank"),
    client_id: str = Query(...),
    consent_id: Optional[str] = Header(None, alias="X-Consent-Id")
):
    """Получить выписку по карте в виде текстового файла"""
    try:
        print(f"🔍 [get_card_statement] Запрос выписки для карты {card_id}, банк: {bank}, client_id: {client_id}")
        
        if not session or not banking_client or not bank_helper:
            raise HTTPException(status_code=503, detail="Service not initialized")
        
        from datetime import datetime
        from fastapi.responses import Response
        
        # Получаем consent для банка
        client_id_id = client_id.split('-')[-1] if '-' in client_id else client_id
        print(f"🔍 [get_card_statement] client_id_id: {client_id_id}")
        
        try:
            access_token = await bank_helper.get_access_token(bank_name=bank)
            print(f"✅ [get_card_statement] Получен access_token для {bank}")
        except Exception as e:
            print(f"❌ [get_card_statement] Ошибка при получении access_token: {e}")
            raise
        
        try:
            consent = await bank_helper.get_account_consent(bank_name=bank, access_token=access_token, client_id_id=client_id_id)
            print(f"✅ [get_card_statement] Получен consent: {consent}")
        except Exception as e:
            print(f"❌ [get_card_statement] Ошибка при получении consent: {e}")
            raise
        
        headers = {
            "X-Requesting-Bank": banking_client.team_id
        }
        if consent:
            headers["X-Consent-Id"] = consent
        if consent_id:
            headers["X-Consent-Id"] = consent_id
        
        # Получаем детали карты
        params = {"client_id": client_id, "show_full_number": "true"}
        # Получаем user_id из client_id
        user_id = None
        if client_id:
            client_id_id = client_id.split('-')[-1] if '-' in client_id else client_id
            user_id = int(client_id_id) if client_id_id.isdigit() else None
        
        print(f"🔍 [get_card_statement] Запрос карты {card_id} с params: {params}, headers: {headers}, user_id: {user_id}")
        
        try:
            card_response = await banking_client.request(
                session,
                bank,
                "GET",
                f"/cards/{card_id}",
                params=params,
                headers=headers,
                user_id=user_id
            )
            print(f"✅ [get_card_statement] Получен ответ от банка: {type(card_response)}")
        except Exception as e:
            print(f"❌ [get_card_statement] Ошибка при запросе карты: {e}")
            raise
        
        # Извлекаем данные карты
        card_data = {}
        if isinstance(card_response, dict):
            # Проверяем разные возможные структуры ответа
            if "data" in card_response:
                card_data = card_response.get("data", {})
                # Если data - это список, берем первый элемент
                if isinstance(card_data, list) and len(card_data) > 0:
                    card_data = card_data[0]
                # Если data - это словарь с ключом "card" или "cards"
                elif isinstance(card_data, dict):
                    if "card" in card_data:
                        card_data = card_data["card"]
                        if isinstance(card_data, list) and len(card_data) > 0:
                            card_data = card_data[0]
                    elif "cards" in card_data:
                        cards_list = card_data["cards"]
                        if isinstance(cards_list, list) and len(cards_list) > 0:
                            card_data = cards_list[0]
            else:
                # Если нет ключа "data", используем весь ответ
                card_data = card_response
        
        print(f"✅ [get_card_statement] Извлечены данные карты: {list(card_data.keys()) if isinstance(card_data, dict) else 'не словарь'}")
        
        # Формируем текст выписки
        statement_lines = []
        statement_lines.append("ВЫПИСКА ПО КАРТЕ")
        statement_lines.append(f"Дата формирования: {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}")
        statement_lines.append("")
        
        # Информация о банке
        statement_lines.append(f"БАНК: {bank.upper()}")
        
        # Номер карты
        card_number = card_data.get("cardNumber") or card_data.get("pan") or card_data.get("maskedPan") or "N/A"
        statement_lines.append(f"НОМЕР КАРТЫ: {card_number}")
        
        # Баланс
        balance = card_data.get("balance") or card_data.get("availableBalance") or "0.00"
        statement_lines.append(f"БАЛАНС: {balance}")
        
        # Статус
        status = card_data.get("status") or card_data.get("cardStatus") or "N/A"
        statement_lines.append(f"СТАТУС: {status}")
        statement_lines.append("")
        
        # Реквизиты карты
        credentials = card_data.get("credentials") or {}
        if credentials:
            statement_lines.append("РЕКВИЗИТЫ КАРТЫ:")
            if credentials.get("pan"):
                statement_lines.append(f"Номер карты: {credentials.get('pan')}")
            if credentials.get("expiry"):
                statement_lines.append(f"Срок действия: {credentials.get('expiry')}")
            if credentials.get("holder"):
                statement_lines.append(f"Держатель: {credentials.get('holder')}")
            statement_lines.append("")
        
        # Токены кошельков
        tokens = card_data.get("tokens") or []
        if tokens:
            statement_lines.append("ТОКЕНЫ КОШЕЛЬКОВ:")
            for index, token in enumerate(tokens, 1):
                token_name = token.get("name") or f"Токен {index}"
                token_value = token.get("value") or token.get("token") or "N/A"
                statement_lines.append(f"{index}. {token_name}: {token_value}")
            statement_lines.append("")
        
        statement_lines.append("---")
        statement_lines.append("Сгенерировано в MultiBank")
        
        # Объединяем в текст
        statement_text = "\n".join(statement_lines)
        
        # Формируем имя файла
        date_str = datetime.now().strftime('%Y-%m-%d')
        filename = f"Выписка_{bank}_{date_str}.txt"
        
        # Кодируем имя файла для заголовка Content-Disposition (RFC 2231)
        from urllib.parse import quote
        filename_encoded = quote(filename, safe='')
        content_disposition = f"attachment; filename*=UTF-8''{filename_encoded}"
        
        print(f"✅ [get_card_statement] Выписка сформирована, размер: {len(statement_text)} символов")
        
        # Возвращаем файл
        return Response(
            content=statement_text.encode('utf-8'),
            media_type="text/plain; charset=utf-8",
            headers={
                "Content-Disposition": content_disposition,
                "Content-Type": "text/plain; charset=utf-8"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        print(f"❌ [get_card_statement] Критическая ошибка: {e}")
        print(f"❌ [get_card_statement] Traceback:\n{error_traceback}")
        raise HTTPException(status_code=500, detail=f"Ошибка при формировании выписки: {str(e)}")

@app.get("/api/{client_id_id}/bank_names")
async def get_bank_names(client_id_id) -> list:
    """Получить список банков пользователя (возвращает все 3 банка для каждого пользователя)"""
    # Всегда возвращаем все 3 банка для каждого пользователя
    # У каждого пользователя будет свой токен для каждого банка
    bank_names = ["vbank", "abank", "sbank"]
    print(f"🔍 [get_bank_names] Пользователь client_id_id={client_id_id} имеет доступ к банкам: {bank_names}")
    return bank_names

@app.get("/api/available_balance/{bank_name}/{client_id_id}")
async def get_available_balance(bank_name, client_id_id) -> dict:
    """Получить доступный баланс для банка пользователя"""
    # Используем переданный bank_name (пользователь может запросить любой из 3 банков)
    # Токены будут индивидуальными для каждого пользователя и банка
    user_id = int(client_id_id) if client_id_id.isdigit() else None
    print(f"🔍 [get_available_balance] Пользователь {client_id_id} (user_id={user_id}) запрашивает баланс для банка: {bank_name}")
    available_balance = await bank_helper.get_account_available_balance(bank_name, client_id_id)
    return {"balance": available_balance}

# =========================
# Transactions endpoints
# =========================

@app.get("/api/transactions")
async def get_transactions(
    client_id: str = Query(...),
    bank: Optional[str] = Query(None),
    startDate: Optional[str] = Query(None),
    endDate: Optional[str] = Query(None),
    limit: int = Query(default=1000, ge=1, le=1000),
    consent_id: Optional[str] = Header(None, alias="X-Consent-Id")
):
    """Получить транзакции со всех счетов пользователя"""
    try:
        if not session or not banking_client or not bank_helper:
            raise HTTPException(status_code=503, detail="Service not initialized")
        
        client_id_id = client_id.split('-')[-1] if '-' in client_id else client_id
        user_id = int(client_id_id) if client_id_id.isdigit() else None
        
        # Определяем список банков для запроса (все 3 банка для каждого пользователя)
        banks_to_query = [bank] if bank else ["vbank", "abank", "sbank"]
        
        all_transactions = []
        
        # Получаем транзакции из каждого банка
        for bank_name in banks_to_query:
            try:
                # Получаем consent для банка
                access_token = await bank_helper.get_access_token(bank_name=bank_name)
                consent = await bank_helper.get_account_consent(bank_name=bank_name, access_token=access_token, client_id_id=client_id_id)
                
                headers = {
                    "X-Requesting-Bank": banking_client.team_id
                }
                if consent:
                    headers["X-Consent-Id"] = consent
                if consent_id:
                    headers["X-Consent-Id"] = consent_id
                
                # Если нет согласия, пропускаем этот банк
                if not consent and not consent_id:
                    print(f"⚠️ Согласие для {bank_name} не получено, пропускаем")
                    continue
                
                # Получаем список счетов
                accounts_response = await banking_client.request(
                    session,
                    bank_name,
                    "GET",
                    "/accounts",
                    params={"client_id": client_id},
                    headers=headers,
                    user_id=user_id
                )
                
                # Извлекаем список счетов из ответа
                accounts = []
                if isinstance(accounts_response, dict):
                    if "data" in accounts_response:
                        if isinstance(accounts_response["data"], dict):
                            accounts = accounts_response["data"].get("accounts", [])
                        elif isinstance(accounts_response["data"], list):
                            accounts = accounts_response["data"]
                    elif "accounts" in accounts_response:
                        accounts = accounts_response["accounts"]
                    elif "account" in accounts_response:
                        accounts = accounts_response["account"] if isinstance(accounts_response["account"], list) else [accounts_response["account"]]
                elif isinstance(accounts_response, list):
                    accounts = accounts_response
                
                if not accounts:
                    print(f"⚠️ Нет счетов для {bank_name}, пропускаем")
                    continue
                
                # Получаем транзакции для каждого счета
                for account in accounts:
                    account_id = account.get("accountId") or account.get("account_id") or account.get("id")
                    if not account_id:
                        continue
                    
                    try:
                        params = {
                            "page": 1,
                            "limit": limit
                        }
                        if startDate:
                            params["from_booking_date_time"] = startDate
                        if endDate:
                            params["to_booking_date_time"] = endDate
                        params["client_id"] = client_id
                        
                        account_transactions = await banking_client.request(
                            session,
                            bank_name,
                            "GET",
                            f"/accounts/{account_id}/transactions",
                            params=params,
                            headers=headers,
                            user_id=user_id
                        )
                        
                        # Извлекаем транзакции из ответа
                        transactions = []
                        if isinstance(account_transactions, dict):
                            if "data" in account_transactions:
                                if isinstance(account_transactions["data"], dict):
                                    transactions = account_transactions["data"].get("transactions", [])
                                elif isinstance(account_transactions["data"], list):
                                    transactions = account_transactions["data"]
                            elif "transactions" in account_transactions:
                                transactions = account_transactions["transactions"]
                        elif isinstance(account_transactions, list):
                            transactions = account_transactions
                        
                        # Добавляем информацию о банке к каждой транзакции
                        for transaction in transactions:
                            if isinstance(transaction, dict):
                                transaction["bank"] = bank_name
                                transaction["account_id"] = account_id
                        
                        all_transactions.extend(transactions)
                    except Exception as e:
                        print(f"⚠️ Ошибка при получении транзакций для счета {account_id} в {bank_name}: {str(e)}")
                        continue
                        
            except Exception as e:
                print(f"⚠️ Ошибка при обработке банка {bank_name}: {str(e)}")
                continue
        
        # Сортируем транзакции по дате (новые первыми)
        all_transactions.sort(key=lambda x: x.get("bookingDateTime") or x.get("booking_date_time") or x.get("date") or "", reverse=True)
        
        # Ограничиваем количество транзакций
        all_transactions = all_transactions[:limit]
        
        return {
            "data": {
                "transactions": all_transactions
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/accounts/{account_id}/transactions")
async def get_account_transactions(
    account_id: str,
    bank: str = Query(default="vbank"),
    client_id: Optional[str] = Query(None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=500),
    from_booking_date_time: Optional[str] = Query(None),
    to_booking_date_time: Optional[str] = Query(None),
    consent_id: Optional[str] = Header(None, alias="X-Consent-Id")
):
    """Получить историю транзакций по счету"""
    try:
        if not session or not banking_client or not bank_helper:
            raise HTTPException(status_code=503, detail="Service not initialized")
        
        # Получаем consent для банка
        if client_id:
            client_id_id = client_id.split('-')[-1] if '-' in client_id else client_id
            access_token = await bank_helper.get_access_token(bank_name=bank)
            consent = await bank_helper.get_account_consent(bank_name=bank, access_token=access_token, client_id_id=client_id_id)
        else:
            consent = None
        
        headers = {
            "X-Requesting-Bank": banking_client.team_id
        }
        if consent:
            headers["X-Consent-Id"] = consent
        if consent_id:
            headers["X-Consent-Id"] = consent_id
        
        params = {
            "page": page,
            "limit": limit
        }
        if from_booking_date_time:
            params["from_booking_date_time"] = from_booking_date_time
        if to_booking_date_time:
            params["to_booking_date_time"] = to_booking_date_time
        if client_id:
            params["client_id"] = client_id
        
        # Получаем user_id из client_id
        user_id = None
        if client_id:
            client_id_id = client_id.split('-')[-1] if '-' in client_id else client_id
            user_id = int(client_id_id) if client_id_id.isdigit() else None
        
        transactions = await banking_client.request(
            session,
            bank,
            "GET",
            f"/accounts/{account_id}/transactions",
            params=params,
            headers=headers,
            user_id=user_id
        )
        return transactions
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# global_users
@app.get("/api/get_global_users")
async def get_global_users() -> dict:
    global_users = await bank_helper.get_global_users()

    return global_users



# Перевод
@app.post("/api/payments/make_transfer/")
async def make_transfer(payload: TransferRequest):
    client_id_id = payload.user_id_id
    to_client_id_id = payload.to_user_id_id
    from_bank = payload.from_bank
    to_bank = payload.to_bank
    amount = payload.amount

    print(client_id_id, to_client_id_id, from_bank, to_bank, amount)

    # Создаем перевод
    transfer = await bank_helper.make_transfer(client_id_id, to_client_id_id, from_bank, to_bank, amount)

    return transfer

# =========================
# Products endpoints
# =========================

@app.get("/api/products")
async def get_products(
    client_id: str = Query(...),
    bank: Optional[str] = Query(None)
):
    """Получить информацию по всем продуктам (депозиты, кредиты, карты) со всех банков, включая балансы и остатки по кредитам"""
    try:
        if not session or not banking_client or not bank_helper:
            raise HTTPException(status_code=503, detail="Service not initialized")
        
        client_id_id = client_id.split('-')[-1] if '-' in client_id else client_id
        user_id = int(client_id_id) if client_id_id.isdigit() else None
        team_id = banking_client.team_id
        full_client_id = f"{team_id}-{client_id_id}"
        
        # Определяем список банков для запроса (все 3 банка для каждого пользователя)
        banks_to_query = [bank] if bank else ["vbank", "abank", "sbank"]
        
        all_products = []
        
        # Получаем продукты из каждого банка
        for bank_name in banks_to_query:
            try:
                # Получаем access_token для банка
                access_token = await bank_helper.get_access_token(bank_name=bank_name)
                if not access_token:
                    print(f"⚠️ Не удалось получить access_token для {bank_name}, пропускаем")
                    continue
                
                # Проверяем наличие product-agreement consent в БД
                user = await db_instance.users.find_one(
                    {f"{bank_name}.client_id_id": client_id_id},
                    {f"{bank_name}.$": 1}
                )
                
                product_agreement_consent = None
                if user and bank_name in user and user[bank_name]:
                    record = user[bank_name][0]
                    product_agreement_consent = record.get("product_agreement_consent")
                
                # Если нет согласия, создаем его
                if not product_agreement_consent:
                    print(f"⚠️ Согласие на product-agreements для {bank_name} не найдено, создаю новое...")
                    try:
                        consent_response = await banking_client.request(
                            session,
                            bank_name,
                            "POST",
                            "/product-agreement-consents/request",
                            data={
                                "requesting_bank": team_id,
                                "client_id": full_client_id,
                                "read_product_agreements": True,
                                "open_product_agreements": False,
                                "close_product_agreements": False,
                                "allowed_product_types": ["deposit", "loan", "card"],
                                "reason": "Агрегация продуктов для мультибанк-приложения"
                            },
                            headers={"X-Requesting-Bank": team_id},
                            params={"client_id": full_client_id},
                            user_id=user_id
                        )
                        
                        # Извлекаем consent_id из ответа
                        if isinstance(consent_response, dict):
                            consent_id = consent_response.get("consent_id") or consent_response.get("data", {}).get("consentId")
                            status = consent_response.get("status") or consent_response.get("data", {}).get("status")
                            
                            if status == "approved" and consent_id:
                                product_agreement_consent = consent_id
                                # Сохраняем в БД
                                await db_instance.users.update_one(
                                    {f"{bank_name}.client_id_id": client_id_id},
                                    {"$set": {f"{bank_name}.$.product_agreement_consent": product_agreement_consent}}
                                )
                                print(f"✅ Согласие на product-agreements для {bank_name} создано и сохранено: {product_agreement_consent}")
                            elif status == "pending":
                                print(f"⚠️ Согласие на product-agreements для {bank_name} находится в статусе pending")
                                # Пропускаем этот банк, так как согласие еще не одобрено
                                continue
                            else:
                                print(f"⚠️ Не удалось получить согласие для {bank_name}, статус: {status}")
                                continue
                        else:
                            print(f"⚠️ Неожиданный формат ответа для согласия {bank_name}")
                            continue
                    except Exception as e:
                        print(f"❌ Ошибка при создании согласия на product-agreements для {bank_name}: {str(e)}")
                        continue
                
                # Получаем список договоров
                headers = {
                    "X-Requesting-Bank": team_id,
                    "X-Product-Agreement-Consent-Id": product_agreement_consent
                }
                
                try:
                    try:
                        agreements_response = await banking_client.request(
                        session,
                        bank_name,
                        "GET",
                        "/product-agreements",
                        params={"client_id": full_client_id},
                        headers=headers,
                        user_id=user_id
                        )
                    except Exception as agreements_error:
                        # Если ошибка 401, обновляем токен и повторяем запрос
                        error_str = str(agreements_error)
                        if "401" in error_str:
                            print(f"🔄 Получена ошибка 401 при получении договоров для {bank_name}, обновляю токен...")
                            # Обновляем токен (принудительно получаем новый)
                            await db_instance.access_tokens.update_one(
                                {"bank_name": bank_name},
                                {"$set": {"updated_at": datetime(1970, 1, 1, tzinfo=timezone.utc)}}
                            )
                            # Получаем новый токен
                            new_access_token = await bank_helper.get_access_token(bank_name=bank_name)
                            if new_access_token:
                                # Обновляем токен в banking_client
                                await banking_client.get_bank_token(session, bank_name, user_id=user_id)
                                # Повторяем запрос
                                try:
                                    agreements_response = await banking_client.request(
                                        session,
                                        bank_name,
                                        "GET",
                                        "/product-agreements",
                                        params={"client_id": full_client_id},
                                        headers=headers,
                                        user_id=user_id
                                    )
                                except Exception as retry_error:
                                    print(f"⚠️ Ошибка при повторном получении договоров для {bank_name}: {str(retry_error)}")
                                    continue
                            else:
                                print(f"⚠️ Не удалось получить новый токен для {bank_name}")
                                continue
                        # Если ошибка 403 (согласие истекло или не найдено), пересоздаем согласие
                        elif "403" in error_str and ("Product agreement consent" in error_str or "consent" in error_str.lower()):
                            print(f"🔄 Получена ошибка 403 (согласие истекло) для {bank_name}, пересоздаю согласие...")
                            # Удаляем старое согласие из БД
                            await db_instance.users.update_one(
                                {f"{bank_name}.client_id_id": client_id_id},
                                {"$set": {f"{bank_name}.$.product_agreement_consent": None}}
                            )
                            # Создаем новое согласие
                            try:
                                consent_response = await banking_client.request(
                                    session,
                                    bank_name,
                                    "POST",
                                    "/product-agreement-consents/request",
                                    data={
                                        "requesting_bank": team_id,
                                        "client_id": full_client_id,
                                        "read_product_agreements": True,
                                        "open_product_agreements": False,
                                        "close_product_agreements": False,
                                        "allowed_product_types": ["deposit", "loan", "card"],
                                        "reason": "Агрегация продуктов для мультибанк-приложения"
                                    },
                                    headers={"X-Requesting-Bank": team_id},
                                    params={"client_id": full_client_id},
                                    user_id=user_id
                                )
                                
                                # Извлекаем consent_id из ответа
                                if isinstance(consent_response, dict):
                                    consent_id = consent_response.get("consent_id") or consent_response.get("data", {}).get("consentId")
                                    status = consent_response.get("status") or consent_response.get("data", {}).get("status")
                                    
                                    if status == "approved" and consent_id:
                                        product_agreement_consent = consent_id
                                        # Сохраняем в БД
                                        await db_instance.users.update_one(
                                            {f"{bank_name}.client_id_id": client_id_id},
                                            {"$set": {f"{bank_name}.$.product_agreement_consent": product_agreement_consent}}
                                        )
                                        print(f"✅ Новое согласие на product-agreements для {bank_name} создано и сохранено: {product_agreement_consent}")
                                        # Обновляем заголовки с новым согласием
                                        headers["X-Product-Agreement-Consent-Id"] = product_agreement_consent
                                        # Повторяем запрос с новым согласием
                                        try:
                                            agreements_response = await banking_client.request(
                                                session,
                                                bank_name,
                                                "GET",
                                                "/product-agreements",
                                                params={"client_id": full_client_id},
                                                headers=headers,
                                                user_id=user_id
                                            )
                                        except Exception as retry_error:
                                            print(f"⚠️ Ошибка при повторном получении договоров для {bank_name} после пересоздания согласия: {str(retry_error)}")
                                            continue
                                    elif status == "pending":
                                        print(f"⚠️ Согласие на product-agreements для {bank_name} находится в статусе pending")
                                        continue
                                    else:
                                        print(f"⚠️ Не удалось получить согласие для {bank_name}, статус: {status}")
                                        continue
                                else:
                                    print(f"⚠️ Неожиданный формат ответа для согласия {bank_name}")
                                    continue
                            except Exception as consent_error:
                                print(f"❌ Ошибка при пересоздании согласия на product-agreements для {bank_name}: {str(consent_error)}")
                                continue
                        else:
                            print(f"⚠️ Ошибка при получении договоров для {bank_name}: {error_str}")
                            continue
                    
                    # Извлекаем список договоров из ответа
                    agreements = []
                    if isinstance(agreements_response, dict):
                        if "data" in agreements_response:
                            if isinstance(agreements_response["data"], dict):
                                agreements = agreements_response["data"].get("agreements", [])
                            elif isinstance(agreements_response["data"], list):
                                agreements = agreements_response["data"]
                        elif "agreements" in agreements_response:
                            agreements = agreements_response["agreements"]
                        elif "agreement" in agreements_response:
                            agreements = agreements_response["agreement"] if isinstance(agreements_response["agreement"], list) else [agreements_response["agreement"]]
                    elif isinstance(agreements_response, list):
                        agreements = agreements_response
                    
                    if not agreements:
                        print(f"⚠️ Нет договоров для {bank_name}, пропускаем")
                        continue
                    
                    # Для каждого договора получаем баланс/остаток
                    for agreement in agreements:
                        agreement_id = agreement.get("agreementId") or agreement.get("agreement_id") or agreement.get("id")
                        product_type = agreement.get("productType") or agreement.get("product_type")
                        product_id = agreement.get("productId") or agreement.get("product_id")
                        
                        if not agreement_id:
                            continue
                        
                        # Получаем детали договора для получения account_id
                        try:
                            try:
                                agreement_details = await banking_client.request(
                                session,
                                bank_name,
                                "GET",
                                f"/product-agreements/{agreement_id}",
                                params={"client_id": full_client_id},
                                headers=headers,
                                user_id=user_id
                                )
                            except Exception as details_error:
                                # Если ошибка 401, обновляем токен и повторяем запрос
                                error_str = str(details_error)
                                if "401" in error_str:
                                    print(f"🔄 Получена ошибка 401 при получении деталей договора для {bank_name}, обновляю токен...")
                                    # Обновляем токен (принудительно получаем новый)
                                    await db_instance.access_tokens.update_one(
                                        {"bank_name": bank_name},
                                        {"$set": {"updated_at": datetime(1970, 1, 1, tzinfo=timezone.utc)}}
                                    )
                                    # Получаем новый токен
                                    new_access_token = await bank_helper.get_access_token(bank_name=bank_name)
                                    if new_access_token:
                                        # Обновляем токен в banking_client
                                        await banking_client.get_bank_token(session, bank_name, user_id=user_id)
                                        # Повторяем запрос
                                        try:
                                            agreement_details = await banking_client.request(
                                                session,
                                                bank_name,
                                                "GET",
                                                f"/product-agreements/{agreement_id}",
                                                params={"client_id": full_client_id},
                                                headers=headers,
                                                user_id=user_id
                                            )
                                        except Exception as retry_error:
                                            print(f"⚠️ Ошибка при повторном получении деталей договора для {bank_name}: {str(retry_error)}")
                                            raise
                                    else:
                                        print(f"⚠️ Не удалось получить новый токен для {bank_name}")
                                        raise
                                # Если ошибка 403 (согласие истекло или не найдено), пересоздаем согласие
                                elif "403" in error_str and ("Product agreement consent" in error_str or "consent" in error_str.lower()):
                                    print(f"🔄 Получена ошибка 403 (согласие истекло) при получении деталей договора для {bank_name}, пересоздаю согласие...")
                                    # Удаляем старое согласие из БД
                                    await db_instance.users.update_one(
                                        {f"{bank_name}.client_id_id": client_id_id},
                                        {"$set": {f"{bank_name}.$.product_agreement_consent": None}}
                                    )
                                    # Создаем новое согласие
                                    try:
                                        consent_response = await banking_client.request(
                                            session,
                                            bank_name,
                                            "POST",
                                            "/product-agreement-consents/request",
                                            data={
                                                "requesting_bank": team_id,
                                                "client_id": full_client_id,
                                                "read_product_agreements": True,
                                                "open_product_agreements": False,
                                                "close_product_agreements": False,
                                                "allowed_product_types": ["deposit", "loan", "card"],
                                                "reason": "Агрегация продуктов для мультибанк-приложения"
                                            },
                                            headers={"X-Requesting-Bank": team_id},
                                            params={"client_id": full_client_id},
                                            user_id=user_id
                                        )
                                        
                                        # Извлекаем consent_id из ответа
                                        if isinstance(consent_response, dict):
                                            consent_id = consent_response.get("consent_id") or consent_response.get("data", {}).get("consentId")
                                            status = consent_response.get("status") or consent_response.get("data", {}).get("status")
                                            
                                            if status == "approved" and consent_id:
                                                product_agreement_consent = consent_id
                                                # Сохраняем в БД
                                                await db_instance.users.update_one(
                                                    {f"{bank_name}.client_id_id": client_id_id},
                                                    {"$set": {f"{bank_name}.$.product_agreement_consent": product_agreement_consent}}
                                                )
                                                print(f"✅ Новое согласие на product-agreements для {bank_name} создано и сохранено: {product_agreement_consent}")
                                                # Обновляем заголовки с новым согласием
                                                headers["X-Product-Agreement-Consent-Id"] = product_agreement_consent
                                                # Повторяем запрос с новым согласием
                                                try:
                                                    agreement_details = await banking_client.request(
                                                        session,
                                                        bank_name,
                                                        "GET",
                                                        f"/product-agreements/{agreement_id}",
                                                        params={"client_id": full_client_id},
                                                        headers=headers,
                                                        user_id=user_id
                                                    )
                                                except Exception as retry_error:
                                                    print(f"⚠️ Ошибка при повторном получении деталей договора для {bank_name} после пересоздания согласия: {str(retry_error)}")
                                                    raise
                                            elif status == "pending":
                                                print(f"⚠️ Согласие на product-agreements для {bank_name} находится в статусе pending")
                                                raise ValueError(f"Согласие для {bank_name} требует ручного одобрения")
                                            else:
                                                print(f"⚠️ Не удалось получить согласие для {bank_name}, статус: {status}")
                                                raise ValueError(f"Не удалось получить согласие для {bank_name}")
                                        else:
                                            print(f"⚠️ Неожиданный формат ответа для согласия {bank_name}")
                                            raise ValueError(f"Неожиданный формат ответа для согласия {bank_name}")
                                    except Exception as consent_error:
                                        print(f"❌ Ошибка при пересоздании согласия на product-agreements для {bank_name}: {str(consent_error)}")
                                        raise
                                else:
                                    raise
                            
                            # Извлекаем account_id из деталей договора
                            account_id = None
                            if isinstance(agreement_details, dict):
                                if "data" in agreement_details:
                                    account_id = agreement_details["data"].get("accountId") or agreement_details["data"].get("account_id")
                                elif "accountId" in agreement_details:
                                    account_id = agreement_details["accountId"]
                                elif "account_id" in agreement_details:
                                    account_id = agreement_details["account_id"]
                            
                            balance = None
                            outstanding_amount = None
                            
                            # Для депозитов и кредитов получаем баланс счета
                            if account_id and product_type in ["deposit", "loan"]:
                                try:
                                    # Получаем account consent для баланса
                                    account_consent = await bank_helper.get_account_consent(
                                        bank_name=bank_name,
                                        access_token=access_token,
                                        client_id_id=client_id_id
                                    )
                                    
                                    if account_consent:
                                        balance_headers = {
                                            "X-Requesting-Bank": team_id,
                                            "X-Consent-Id": account_consent
                                        }
                                        
                                        try:
                                            balance_response = await banking_client.request(
                                            session,
                                            bank_name,
                                            "GET",
                                            f"/accounts/{account_id}/balances",
                                            params={"client_id": full_client_id},
                                            headers=balance_headers,
                                            user_id=user_id
                                        )
                                        except Exception as balance_error:
                                            # Если ошибка 401, обновляем токен и повторяем запрос
                                            error_str = str(balance_error)
                                            if "401" in error_str:
                                                print(f"🔄 Получена ошибка 401 при получении баланса для {bank_name}, обновляю токен...")
                                                # Обновляем токен (принудительно получаем новый)
                                                await db_instance.access_tokens.update_one(
                                                    {"bank_name": bank_name},
                                                    {"$set": {"updated_at": datetime(1970, 1, 1, tzinfo=timezone.utc)}}
                                                )
                                                # Получаем новый токен
                                                new_access_token = await bank_helper.get_access_token(bank_name=bank_name)
                                                if new_access_token:
                                                    # Обновляем токен в banking_client
                                                    await banking_client.get_bank_token(session, bank_name, user_id=user_id)
                                                    # Повторяем запрос
                                                    try:
                                                        balance_response = await banking_client.request(
                                                            session,
                                                            bank_name,
                                                            "GET",
                                                            f"/accounts/{account_id}/balances",
                                                            params={"client_id": full_client_id},
                                                            headers=balance_headers,
                                                            user_id=user_id
                                                        )
                                                    except Exception as retry_error:
                                                        print(f"⚠️ Ошибка при повторном получении баланса для {bank_name}: {str(retry_error)}")
                                                        balance_response = None
                                                else:
                                                    print(f"⚠️ Не удалось получить новый токен для {bank_name}")
                                                    balance_response = None
                                            else:
                                                print(f"⚠️ Ошибка при получении баланса для {bank_name}: {error_str}")
                                                balance_response = None
                                        
                                        # Извлекаем баланс
                                        if balance_response and isinstance(balance_response, dict):
                                            if "data" in balance_response:
                                                balances = balance_response["data"].get("balances", [])
                                                if balances and isinstance(balances, list) and len(balances) > 0:
                                                    balance_data = balances[0]
                                                    balance = balance_data.get("amount", {}).get("amount") or balance_data.get("amount")
                                                    if isinstance(balance, str):
                                                        balance = float(balance)
                                            elif "balances" in balance_response:
                                                balances = balance_response["balances"]
                                                if balances and isinstance(balances, list) and len(balances) > 0:
                                                    balance_data = balances[0]
                                                    balance = balance_data.get("amount", {}).get("amount") or balance_data.get("amount")
                                                    if isinstance(balance, str):
                                                        balance = float(balance)
                                        
                                        # Для кредитов остаток = абсолютное значение баланса (баланс обычно отрицательный)
                                        if product_type == "loan" and balance is not None:
                                            # Для кредитов баланс отрицательный, остаток - это абсолютное значение
                                            outstanding_amount = abs(float(balance))
                                        elif product_type == "deposit" and balance is not None:
                                            # Для депозитов баланс положительный
                                            balance = float(balance)
                                except Exception as e:
                                    print(f"⚠️ Ошибка при получении баланса для договора {agreement_id} в {bank_name}: {str(e)}")
                            
                            # Формируем информацию о продукте
                            product_info = {
                                "bank": bank_name,
                                "agreement_id": agreement_id,
                                "product_type": product_type,
                                "product_id": product_id,
                                "account_id": account_id,
                                "balance": balance,
                                "outstanding_amount": outstanding_amount,  # Остаток по кредиту
                                "agreement_details": agreement_details if isinstance(agreement_details, dict) else {}
                            }
                            
                            # Добавляем информацию из исходного договора
                            product_info.update({
                                k: v for k, v in agreement.items() 
                                if k not in ["agreementId", "agreement_id", "id", "productType", "product_type", "productId", "product_id"]
                            })
                            
                            all_products.append(product_info)
                        except Exception as e:
                            print(f"⚠️ Ошибка при получении деталей договора {agreement_id} в {bank_name}: {str(e)}")
                            # Добавляем базовую информацию без баланса
                            product_info = {
                                "bank": bank_name,
                                "agreement_id": agreement_id,
                                "product_type": product_type,
                                "product_id": product_id,
                                "balance": None,
                                "outstanding_amount": None
                            }
                            product_info.update({
                                k: v for k, v in agreement.items() 
                                if k not in ["agreementId", "agreement_id", "id", "productType", "product_type", "productId", "product_id"]
                            })
                            all_products.append(product_info)
                            
                except Exception as e:
                    print(f"⚠️ Ошибка при получении договоров для {bank_name}: {str(e)}")
                    continue
                    
            except Exception as e:
                print(f"⚠️ Ошибка при обработке банка {bank_name}: {str(e)}")
                continue
        
        return {
            "data": {
                "products": all_products
            },
            "meta": {
                "total": len(all_products),
                "banks_queried": banks_to_query
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

