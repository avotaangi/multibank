from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from aiohttp import ClientSession
from dotenv import load_dotenv
from bankAPI.bankAPI import BankHelper
from contextlib import asynccontextmanager
from schemas import TransferRequest
from database import db
load_dotenv()

bank_helper: BankHelper | None = None  # глобальная переменная

@asynccontextmanager
async def lifespan(app: FastAPI):
    global bank_helper
    print("🚀 BankHelper запущен")

    # Сборник функций для работы с API и БД
    session = ClientSession()
    bank_helper = BankHelper(db=db, session=session)
    for user in range(1,10):
        for bank in ["vbank", "abank"]:
            await bank_helper.add_new_account(bank, user)

    yield                                 # приложение работает

    await bank_helper.close()             # закрываем сессию
    print("🛑 BankHelper остановлен")

app = FastAPI(lifespan=lifespan)

# CORS
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
    "https://vindictively-meteoric-pilchard.cloudpub.ru"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
async def main():
    # await bank_helper.add_bank("vbank")
    # await bank_helper.add_bank("abank")
    # await bank_helper.add_bank("sbank")
    # return await bank_helper.add_new_account("abank", "2")
    # return "good"
    # await bank_helper.drop_db()
    # return await bank_helper.get_account_available_balance("abank", "2")
    # return await bank_helper.get_transfer_consent("1", "2", "vbank", "abank", 100)
    # return await bank_helper.make_transfer("1", "1", "vbank", "abank", 100)
    return {"status": "ok"}

@app.get("/{client_id_id}/bank_names")
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

    # Безопасно удаляем "sbank", если есть ЭТО ВРЕМЕННО!!!
    if "sbank" in bank_names:
        bank_names.remove("sbank")

    return bank_names

@app.get("/available_balance/{bank_name}/{client_id_id}")
async def get_available_balance(bank_name, client_id_id) -> dict:
    available_balance = await bank_helper.get_account_available_balance(bank_name, client_id_id)
    return {"balance": available_balance}
    

# global_users
@app.get("/get_global_users")
async def get_global_users() -> dict:
    global_users = await bank_helper.get_global_users()

    return global_users



# Перевод
@app.post("/payments/make_transfer/")
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

