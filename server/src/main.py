from fastapi import FastAPI, Query, Header, HTTPException, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from aiohttp import ClientSession
from dotenv import load_dotenv
from bankAPI.bankAPI import BankHelper
from banking_client import BankingClient
from contextlib import asynccontextmanager
from schemas import TransferRequest
from database import db
from typing import Optional, Dict, Any
from datetime import datetime
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
    banking_client = BankingClient()

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

# Инициализация банков (вызывается один раз при первом запуске)
@app.post("/init/banks")
async def init_banks():
    """Инициализировать все банки в системе"""
    try:
        vbank = await bank_helper.add_bank("vbank")
        abank = await bank_helper.add_bank("abank")
        sbank = await bank_helper.add_bank("sbank")
        return {
            "status": "success",
            "banks": {
                "vbank": vbank,
                "abank": abank,
                "sbank": sbank
            }
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/health")
async def health():
    return {"status": "ok", "service": "fastapi"}

@app.get("/api/health")
async def api_health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

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
        
        # Если consent равен None (pending согласие), возвращаем пустой список счетов
        if not consent and not consent_id:
            print(f"⚠️ Согласие для {bank} не получено (pending), возвращаем пустой список счетов")
            return {"data": {"accounts": []}, "meta": {"pending_consent": True}}
        
        try:
            print(f"🔍 [get_banking_accounts] Запрос счетов для {bank}, client_id={client_id}, consent={consent or consent_id}")
            print(f"🔍 [get_banking_accounts] Headers: {headers}")
            
            accounts = await banking_client.request(
                session,
                bank,
                "GET",
                "/accounts",
                params={"client_id": client_id},
                headers=headers
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

@app.get("/api/products")
async def get_products(
    bank: Optional[str] = Query(None),
    product_type: Optional[str] = Query(None)
):
    """Получить каталог продуктов из банков"""
    try:
        banks = [bank] if bank else banking_client.get_banks()
        all_products = []
        
        for bank_name in banks:
            try:
                params = {}
                if product_type:
                    params["product_type"] = product_type
                
                products = await banking_client.request(
                    session,
                    bank_name,
                    "GET",
                    "/products",
                    params=params
                )
                
                products_list = products.get("products", [])
                if isinstance(products, list):
                    products_list = products
                
                for product in products_list:
                    product["bank"] = bank_name
                    product["bankName"] = bank_name.upper()
                
                all_products.extend(products_list)
            except Exception as e:
                print(f"Error fetching products from {bank_name}: {e}")
        
        return {"products": all_products}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/products/{product_id}")
async def get_product(product_id: str, bank: Optional[str] = Query(None)):
    """Получить детали продукта"""
    try:
        banks = [bank] if bank else banking_client.get_banks()
        
        for bank_name in banks:
            try:
                product = await banking_client.request(
                    session,
                    bank_name,
                    "GET",
                    f"/products/{product_id}"
                )
                product["bank"] = bank_name
                product["bankName"] = bank_name.upper()
                return product
            except:
                continue
        
        raise HTTPException(status_code=404, detail="Product not found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# =========================
# Consents endpoints
# =========================

@app.post("/api/consents/accounts")
async def create_account_consent(
    bank: str = Query(default="vbank"),
    client_id: str = Query(...),
    permissions: list = Query(default=["ReadAccountsDetail", "ReadBalances", "ReadTransactionsDetail", "ReadCards"]),
    reason: str = Query(default="Агрегация счетов для мультибанк-приложения"),
    requesting_bank_name: str = Query(default="MultiBank App")
):
    """Создать согласие на доступ к счетам"""
    try:
        headers = {
            "X-Requesting-Bank": banking_client.team_id
        }
        
        consent = await banking_client.request(
            session,
            bank,
            "POST",
            "/account-consents/request",
            data={
                "client_id": client_id,
                "permissions": permissions,
                "reason": reason,
                "requesting_bank": banking_client.team_id,
                "requesting_bank_name": requesting_bank_name
            },
            headers=headers
        )
        return consent
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/consents/accounts/{consent_id}")
async def get_account_consent(consent_id: str, bank: str = Query(default="vbank")):
    """Получить согласие по ID"""
    try:
        consent = await banking_client.request(
            session,
            bank,
            "GET",
            f"/account-consents/{consent_id}"
        )
        return consent
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/consents/accounts/{consent_id}")
async def revoke_account_consent(consent_id: str, bank: str = Query(default="vbank")):
    """Отозвать согласие"""
    try:
        await banking_client.request(
            session,
            bank,
            "DELETE",
            f"/account-consents/{consent_id}"
        )
        return {"status": "revoked"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
                headers=headers
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
                        headers={"X-Requesting-Bank": banking_client.team_id}
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
                            headers=headers
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
        params = {}
        if client_id:
            params["client_id"] = client_id
        
        payment = await banking_client.request(
            session,
            bank,
            "GET",
            f"/payments/{payment_id}",
            params=params
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
                headers=headers
            )
            return cards
        except Exception as e:
            # Если ошибка 403 CONSENT_REQUIRED с ReadCards, пересоздаем согласие
            error_str = str(e)
            if "403" in error_str and "ReadCards" in error_str:
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
                        headers={"X-Requesting-Bank": banking_client.team_id}
                    )
                    
                    # Извлекаем consent_id из ответа
                    new_consent_id = None
                    consent_status = None
                    
                    if isinstance(consent_result, dict):
                        new_consent_id = consent_result.get("consent_id") or consent_result.get("data", {}).get("consentId")
                        consent_status = consent_result.get("status") or consent_result.get("data", {}).get("status")
                        
                        # Если статус pending, получаем request_id
                        if consent_status == "pending":
                            request_id = consent_result.get("request_id") or consent_result.get("data", {}).get("requestId")
                            if request_id:
                                print(f"⚠️ Согласие для {bank} находится в статусе pending (request_id: {request_id})")
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
                            headers=headers
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
    consent_id: Optional[str] = Header(None, alias="X-Consent-Id")
):
    """Получить детали карты"""
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
            headers=headers
        )
        return card
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/{client_id_id}/bank_names")
async def get_bank_names(client_id_id) -> list:
    # читаем из коллекции global_users
    bank_names = []

    # Ищем пользователя по client_id_id
    user_doc = await db.global_users.find_one(
        {"user_id_id": client_id_id},
        {"_id": 0, "bank_names": 1}
    )

    if user_doc and "bank_names" in user_doc:
        bank_names = user_doc["bank_names"]

    # Временно отключено удаление sbank - теперь он должен работать
    # if "sbank" in bank_names:
    #     bank_names.remove("sbank")

    return bank_names

@app.get("/api/available_balance/{bank_name}/{client_id_id}")
async def get_available_balance(bank_name, client_id_id) -> dict:
    available_balance = await bank_helper.get_account_available_balance(bank_name, client_id_id)
    return {"balance": available_balance}

# =========================
# Transactions endpoints
# =========================

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
        
        transactions = await banking_client.request(
            session,
            bank,
            "GET",
            f"/accounts/{account_id}/transactions",
            params=params,
            headers=headers
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

