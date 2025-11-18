from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGO_URL = os.getenv("MONGODB_URI", "mongodb://localhost:27017/multibank")  # или твой URI, например Atlas
MONGO_DB_NAME = "multibank"

client = AsyncIOMotorClient(MONGO_URL)
db = client[MONGO_DB_NAME]
