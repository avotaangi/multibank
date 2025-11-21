#!/usr/bin/env python3
"""
Скрипт для сброса банков пользователя - обновляет global_users чтобы использовать только банк на основе telegram_id
"""
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

def get_bank_for_user(telegram_id: int) -> str:
    """Получить банк для пользователя на основе telegram_id: (telegram_id % 4) + 1"""
    if telegram_id is None:
        return "vbank"
    
    bank_index = (telegram_id % 4) + 1
    bank_mapping = {
        1: "vbank",
        2: "abank",
        3: "sbank",
        4: "vbank"
    }
    return bank_mapping.get(bank_index, "vbank")

def reset_user_banks():
    """Сбросить банки пользователя"""
    mongo_url = os.getenv("MONGODB_URI", "mongodb://localhost:27017/multibank")
    db_name = "multibank"
    
    try:
        client = MongoClient(mongo_url)
        db = client[db_name]
        
        # Получаем всех пользователей из global_users
        users = db.global_users.find({})
        
        updated_count = 0
        for user in users:
            user_id_id = user.get("user_id_id")
            if not user_id_id:
                continue
            
            # Пытаемся найти telegram_id в коллекции users
            user_doc = db.users.find_one({
                "$or": [
                    {"vbank.client_id_id": str(user_id_id)},
                    {"abank.client_id_id": str(user_id_id)},
                    {"sbank.client_id_id": str(user_id_id)}
                ]
            })
            
            telegram_id = None
            if user_doc:
                telegram_id = user_doc.get("telegramId")
                if telegram_id:
                    telegram_id = int(telegram_id)
            
            # Fallback: используем последнюю цифру user_id_id
            if telegram_id is None:
                try:
                    last_digit = int(str(user_id_id)[-1])
                    telegram_id = int(f"{last_digit}{last_digit}{last_digit}")
                    print(f"⚠️ telegram_id не найден для user_id_id={user_id_id}, используем fallback: {telegram_id}")
                except:
                    print(f"⚠️ Не удалось определить telegram_id для user_id_id={user_id_id}, пропускаем")
                    continue
            
            # Определяем банк пользователя
            user_bank = get_bank_for_user(telegram_id)
            
            # Обновляем global_users - оставляем только один банк
            result = db.global_users.update_one(
                {"user_id_id": user_id_id},
                {"$set": {"bank_names": [user_bank]}}
            )
            
            if result.modified_count > 0:
                print(f"✅ Обновлен user_id_id={user_id_id}: telegram_id={telegram_id}, банк={user_bank}")
                updated_count += 1
            else:
                print(f"ℹ️ user_id_id={user_id_id} уже использует банк {user_bank}")
        
        print(f"\n✅ Успешно обновлено {updated_count} пользователь(ей)")
        
        # Очищаем токены
        tokens_result = db.access_tokens.delete_many({})
        print(f"✅ Удалено {tokens_result.deleted_count} токен(ов)")
        
        client.close()
        return updated_count
    except Exception as e:
        print(f"❌ Ошибка при сбросе банков: {e}")
        raise

if __name__ == "__main__":
    reset_user_banks()

