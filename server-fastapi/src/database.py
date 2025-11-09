from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb://localhost:27017/multibank"  # или твой URI, например Atlas
MONGO_DB_NAME = "multibank"

client = AsyncIOMotorClient(MONGO_URL)
db = client[MONGO_DB_NAME]
