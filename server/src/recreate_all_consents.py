#!/usr/bin/env python3
"""
Скрипт для пересоздания всех согласий для всех пользователей и всех банков
"""
import os
import asyncio
from aiohttp import ClientSession
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from banking_client import BankingClient

load_dotenv()

async def recreate_all_consents():
    """Пересоздать все согласия для всех пользователей и всех банков"""
    mongo_url = os.getenv("MONGODB_URI", "mongodb://localhost:27017/multibank")
    db_name = "multibank"
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    session = ClientSession()
    banking_client = BankingClient(db=db)
    
    banks = ["vbank", "abank", "sbank"]
    team_id = os.getenv("CLIENT_ID", "team096")
    
    try:
        # Получаем всех пользователей из global_users
        users = await db.global_users.find({}).to_list(length=None)
        
        if not users:
            print("⚠️ Нет пользователей в global_users")
            return
        
        total_consents = 0
        successful_consents = 0
        
        for user_doc in users:
            user_id_id = user_doc.get("user_id_id")
            if not user_id_id:
                continue
            
            user_id = int(user_id_id) if str(user_id_id).isdigit() else None
            if user_id is None:
                continue
            
            client_id = f"{team_id}-{user_id_id}"
            
            print(f"\n🔄 Обрабатываю пользователя user_id={user_id} (client_id_id={user_id_id})")
            
            # Для каждого банка создаем согласие
            for bank_name in banks:
                try:
                    print(f"  📝 Создаю account consent для {bank_name}...")
                    
                    # Получаем токен для пользователя и банка
                    token = await banking_client.get_bank_token(session, bank_name, user_id=user_id)
                    
                    # Создаем account consent
                    consent_result = await banking_client.request(
                        session,
                        bank_name,
                        "POST",
                        "/account-consents/request",
                        data={
                            "client_id": client_id,
                            "permissions": ["ReadAccountsDetail", "ReadBalances", "ReadTransactionsDetail", "ReadCards"],
                            "reason": "Агрегация счетов и карт для мультибанк-приложения",
                            "requesting_bank": team_id,
                            "requesting_bank_name": "MultiBank App"
                        },
                        headers={"X-Requesting-Bank": team_id},
                        user_id=user_id
                    )
                    
                    total_consents += 1
                    
                    # Обрабатываем ответ
                    consent_id = None
                    status = None
                    request_id = None
                    
                    if isinstance(consent_result, dict):
                        consent_id = consent_result.get("consent_id") or consent_result.get("data", {}).get("consentId")
                        status = consent_result.get("status") or consent_result.get("data", {}).get("status")
                        request_id = consent_result.get("request_id") or consent_result.get("data", {}).get("requestId")
                    elif isinstance(consent_result, str):
                        consent_id = consent_result
                        status = "approved"
                    
                    if status == "approved" and consent_id:
                        # Сохраняем consent в БД
                        await db.users.update_one(
                            {f"{bank_name}.client_id_id": str(user_id_id)},
                            {"$set": {
                                f"{bank_name}.$.consent": consent_id,
                                f"{bank_name}.$.request_id": None
                            }}
                        )
                        print(f"    ✅ Account consent для {bank_name} создан: {consent_id}")
                        successful_consents += 1
                    elif status == "pending":
                        # Сохраняем request_id
                        if request_id:
                            await db.users.update_one(
                                {f"{bank_name}.client_id_id": str(user_id_id)},
                                {"$set": {
                                    f"{bank_name}.$.request_id": request_id,
                                    f"{bank_name}.$.consent": None
                                }}
                            )
                            print(f"    ⚠️ Account consent для {bank_name} в статусе pending (request_id: {request_id})")
                        else:
                            print(f"    ⚠️ Account consent для {bank_name} в статусе pending, но request_id не найден")
                    else:
                        print(f"    ❌ Не удалось создать account consent для {bank_name}: {consent_result}")
                    
                    # Создаем product-agreement consent
                    print(f"  📝 Создаю product-agreement consent для {bank_name}...")
                    
                    try:
                        product_consent_result = await banking_client.request(
                            session,
                            bank_name,
                            "POST",
                            "/product-agreement-consents/request",
                            data={
                                "requesting_bank": team_id,
                                "client_id": client_id,
                                "read_product_agreements": True,
                                "open_product_agreements": False,
                                "close_product_agreements": False,
                                "allowed_product_types": ["deposit", "loan", "card"],
                                "reason": "Агрегация продуктов для мультибанк-приложения"
                            },
                            headers={"X-Requesting-Bank": team_id},
                            params={"client_id": client_id},
                            user_id=user_id
                        )
                        
                        total_consents += 1
                        
                        # Обрабатываем ответ
                        product_consent_id = None
                        product_status = None
                        
                        if isinstance(product_consent_result, dict):
                            product_consent_id = product_consent_result.get("consent_id") or product_consent_result.get("data", {}).get("consentId")
                            product_status = product_consent_result.get("status") or product_consent_result.get("data", {}).get("status")
                        elif isinstance(product_consent_result, str):
                            product_consent_id = product_consent_result
                            product_status = "approved"
                        
                        if product_status == "approved" and product_consent_id:
                            # Сохраняем product-agreement consent в БД
                            await db.users.update_one(
                                {f"{bank_name}.client_id_id": str(user_id_id)},
                                {"$set": {f"{bank_name}.$.product_agreement_consent": product_consent_id}}
                            )
                            print(f"    ✅ Product-agreement consent для {bank_name} создан: {product_consent_id}")
                            successful_consents += 1
                        elif product_status == "pending":
                            print(f"    ⚠️ Product-agreement consent для {bank_name} в статусе pending")
                        else:
                            print(f"    ❌ Не удалось создать product-agreement consent для {bank_name}: {product_consent_result}")
                    
                    except Exception as e:
                        print(f"    ❌ Ошибка при создании product-agreement consent для {bank_name}: {e}")
                    
                except Exception as e:
                    print(f"    ❌ Ошибка при обработке {bank_name} для user_id={user_id}: {e}")
                    continue
        
        print(f"\n✅ Обработка завершена:")
        print(f"   Всего согласий создано: {total_consents}")
        print(f"   Успешно: {successful_consents}")
        print(f"   Pending/ошибок: {total_consents - successful_consents}")
        
    finally:
        await session.close()
        client.close()

if __name__ == "__main__":
    asyncio.run(recreate_all_consents())

