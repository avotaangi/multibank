#!/usr/bin/env python3
"""
Скрипт для очистки токенов bankingAPI из базы данных.
Удаляет все записи из коллекции access_tokens.
"""
import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

def clear_access_tokens():
    """Очистить все токены из коллекции access_tokens"""
    # Получаем URL из переменной окружения или используем дефолтный
    mongo_url = os.getenv("MONGODB_URI", "mongodb://localhost:27017/multibank")
    db_name = "multibank"
    
    try:
        # Подключаемся к MongoDB
        if "mongodb://" in mongo_url or "mongodb+srv://" in mongo_url:
            client = MongoClient(mongo_url)
        else:
            # Если это просто host:port, создаём URI
            client = MongoClient(mongo_url)
        
        db = client[db_name]
        
        # Удаляем все токены (включая токены с user_id)
        result = db.access_tokens.delete_many({})
        print(f"✅ Успешно удалено {result.deleted_count} токен(ов) из базы данных")
        
        client.close()
        return result.deleted_count
    except Exception as e:
        print(f"❌ Ошибка при очистке токенов: {e}")
        raise

if __name__ == "__main__":
    clear_access_tokens()
