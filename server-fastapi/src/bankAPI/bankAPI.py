from aiohttp import ClientSession
from fastapi import HTTPException
from async_lru import alru_cache
from datetime import datetime, timedelta, timezone
import os, re

#Передаем только db
class BankHelper:
    def __init__(self, db, session):
        self.db = db

        # Создаем сессию йоу davvk
        self._session = session
        self.base_url = os.getenv("BASE_URL", "open.bankingapi.ru") 

        # bank-token
        self.client_id = os.getenv("CLIENT_ID")
        self.client_secret = os.getenv("CLIENT_SECRET")



    # Add new аккаунт банка (Не создает сразу а акканут для всех банков, а только для 1)
    async def add_new_account(self, bank_name, client_id_id):
        db = self.db

        # Проверяем, есть ли банк в users
        bank_exists = await db.users.find_one({bank_name: {"$exists": True}})
        if not bank_exists:
            print(f"⚠️ Банк '{bank_name}' не найден в users. Создаю новый банк...")
            await self.add_bank(bank_name)

        # Проверяем, есть ли уже такой client_id_id в банке
        existing_user = await db.users.find_one(
            {f"{bank_name}.client_id_id": client_id_id},
            {f"{bank_name}.$": 1}
        )

        if existing_user:
            print(f"⚠️ Аккаунт с id '{client_id_id}' уже существует в банке '{bank_name}' — пропускаем")
            return {"status": "already_exists"}
        
        access_token = await self.get_access_token(bank_name=bank_name)
        consent = await self.make_and_get_account_consent(bank_name=bank_name, access_token=access_token, client_id_id=client_id_id)
        account_id = await self.get_account_id(bank_name, access_token, consent, client_id_id)
        bank_account_number = await self.get_bank_account_number(bank_name, access_token, consent, client_id_id)

        # Если клиента нет — добавляем нового + Добавляем в global_users
        await db.users.update_one(
            {bank_name: {"$exists": True}},
            {"$push": {bank_name: {
                "client_id_id": client_id_id,
                "consent": consent,
                "account_id": account_id,
                "bank_account_number": bank_account_number
            }}},
            upsert=True
        )

        # ОБЩИЙ СПИСОК ВСЕХ ЮЗЕРОВ
        # Добавляем банк пользователю, если его нет
        await db.global_users.update_one(
            {"user_id_id": client_id_id},
            {"$addToSet": {"bank_names": bank_name}},  # добавит, если нет
            upsert=True  # создаст документ, если такого user_id_id нет
        )

        print(f"✅ Аккаунт банка: {bank_name} с id: {client_id_id} создан!")
        return {"status": "added"}


    async def get_global_users(self) -> dict:
        db = self.db

        global_users = {}
        async for doc in db.global_users.find({}, {"_id": 0}):
            user_id = doc["user_id_id"]
            global_users[user_id] = {
                "bank_names": doc.get("bank_names", [])
            }
        return global_users



    # --------------------------- Access-token services --------------------------------------------------
    # Добавляем новые банки в banks_names
    async def add_bank(self, bank_name: str) -> dict:
        db = self.db

        # Проверяем, есть ли уже запись с таким bank_name
        existing = await db.bank_names.find_one({"bank_name": bank_name})
        if existing:
            print(f"⚠️ Банк '{bank_name}' уже существует")
            return {"status": "exists", "bank_name": bank_name}


        # Добавления

        # Добавляем новую запись в bank_names
        await db.bank_names.insert_one({    
            "bank_name": bank_name
        })
        access_token = await self.get_access_token(bank_name)
        if not access_token:
            print(f"⚠️ Не удалось получить токен при добавлении банка {bank_name}")
            return {"status": "error", "bank_name": bank_name}
    
        # Добавляем новую запись в access_tokens
        await db.access_tokens.insert_one({    
            "bank_name": bank_name,
            "access_token": access_token,
            "updated_at": datetime.now(timezone.utc)
        })

        # Добавляем новый банк в котором список пользователей
        await db.users.insert_one({
            bank_name: []
        })



        print(f"✅ Банк '{bank_name}' добавлен\tAccess-token добавлен")
        return {"status": "added", "bank_name": bank_name}

    
    # Возвращает access_token конкретного банка
    async def get_access_token(self, bank_name) -> dict:
        db = self.db

        # Выдача из БД
        record = await db.access_tokens.find_one({"bank_name": bank_name})
        if record:
            updated_at = record.get("updated_at")
            # Проверяем срок действия (24 часа)
            if updated_at:
                if updated_at.tzinfo is None:
                    updated_at = updated_at.replace(tzinfo=timezone.utc)

                delta = datetime.now(timezone.utc) - updated_at
                if delta < timedelta(hours=24):
                    # Ещё свежий токен
                    access_token = record.get("access_token")
                    return access_token
        
        # Если в БД стухло( Если истек срок годности access_token ) 
        async with self._session.post(
            url=f"https://{bank_name}.{self.base_url}/auth/bank-token",
            params={
                "client_id": self.client_id,
                "client_secret": self.client_secret
            },
            timeout=15
            ) as resp:
            result = await resp.json()
            if not result or "access_token" not in result:
                print(f"⚠️ Не удалось получить токен для {bank_name}")
                return None
            access_token = result.get("access_token")

            # ✅ Обновляем токен и дату в базе
            await self.update_access_token(bank_name, access_token)

            return access_token
        
    # Обновляем access_token для конкретного банка :) (Особо не использую, чисто ради стиля в update_access_tokens)
    async def update_access_token(self, bank_name, new_access_token):
        db = self.db

        # Обновляем access_token у банка bank_name
        await db.access_tokens.update_one(
            {"bank_name": bank_name},              # фильтр — по имени банка киса
            {"$set": {                        # обновляем поля ле
                "access_token": new_access_token,
                "updated_at": datetime.now(timezone.utc)
            }},  
        )
    
    # ---------------------------------------------------------------------------------------------------
    # ----------------------------------- Consent services ( Согласие клиента ) -------------------------

    # Создаем consest и выдаем его
    async def make_and_get_account_consent(self, bank_name, access_token, client_id_id):
        async with self._session.post(
            url=f"https://{bank_name}.{self.base_url}/account-consents/request",
            headers={
                "Authorization": f"Bearer {access_token}",
                "X-Requesting-Bank": self.client_id,
                "Content-Type": "application/json"
            },
            json={  # тело запроса
                "client_id": f"{self.client_id}-{client_id_id}",
                "permissions": ["ReadAccountsDetail", "ReadBalances"],
                "reason": "Агрегация счетов для HackAPI",
                "requesting_bank": self.client_id,
                "requesting_bank_name": re.sub(r"([a-zA-Z]+)(\d+)", r"\1 \2 App", self.client_id)
            },
            timeout=15
        ) as resp:
            result = await resp.json()
            if result.get("status") == "approved":
                consent = result.get("consent_id")
                return consent
            return result
        raise ValueError(f"❌ Ошибка получения consent")
        

    # Выдать consent
    async def get_account_consent(self, bank_name, access_token, client_id_id):
        db = self.db
        some_reason = True   # На будущее, если какая-то ошибка -> False

        #Выдача из БД
        if some_reason:
            consent = await db.users.find_one(
                {f"{bank_name}.client_id_id": client_id_id},
                {f"{bank_name}.$": 1}
            )
            if consent and bank_name in consent:
                consent = consent[bank_name][0].get("consent")
                return consent
            raise ValueError(f"❌ Аккаунт Отутствует в БД")

        print("\n\nПерешли на make_and_get_acc.._consent")
        #Если в есть какая то причина (some_reason), делаем запрос
        consent = await self.make_and_get_account_consent(bank_name=bank_name, access_token=access_token, client_id_id=client_id_id)
        # Обновляем в бд
        await self.update_account_consent_in_db(bank_name=bank_name, client_id_id=client_id_id, consent=consent)

        return consent
    
    # Обновляем значение consent в БД
    async def update_account_consent_in_db(self, bank_name, client_id_id, consent):
        db = self.db

        result = await db.users.update_one(
            {f"{bank_name}.client_id_id": client_id_id},  # ищем в массиве нужного клиента
            {"$set": {f"{bank_name}.$.consent": consent}}  # обновляем consent у найденного
        )
        # если клиента нет
        if result.matched_count == 0:
            print("⚠️ Нет такого аккаунта в БД")
            return {"status": "error"}

        return {"status": "updated"}
    

    
    # ---------------------------------------------------------------------------------------------------
    # ----------------------------------- Balances ------------------------------------------------------

    # Получить account_id клиента конкретного банка
    async def get_account_id(self, bank_name, access_token, consent, client_id_id):
        db = self.db

        # Проверяем, есть ли account_id в БД
        record = await db.users.find_one(
            {f"{bank_name}.client_id_id": client_id_id},
            {f"{bank_name}.$": 1}
        )
        if record and bank_name in record:
            account_data = record[bank_name][0]
            account_id = account_data.get("account_id")
            if account_id:
                print(f"⚡ account_id найден в БД: {account_id}")
                return account_id

        # Если нет — делаем запрос к API
        async with self._session.get(
            url=f"https://{bank_name}.{self.base_url}/accounts",
            headers={
                "Authorization": f"Bearer {access_token}",
                "X-Requesting-Bank": self.client_id,  
                "X-Consent-Id": consent               
            },
            params={
                "client_id": f"{self.client_id}-{client_id_id}"
            },
            timeout=15
        ) as resp:
            if resp.status != 200:
                raise ValueError(f"❌ Ошибка при получении accounts из {bank_name}: {resp.status}")
            result = await resp.json()
            account_id = result["data"]["account"][0]["accountId"]
            return account_id
        
    # Получить Номер счета клиента конкретного банка
    async def get_bank_account_number(self, bank_name, access_token, consent, client_id_id):
        db = self.db

        # Проверяем, есть ли user_id_id в БД
        record = await db.users.find_one(
            {f"{bank_name}.client_id_id": client_id_id},
            {f"{bank_name}.$": 1}
        )
        if record and bank_name in record:
            account_data = record[bank_name][0]
            bank_account_number = account_data.get("bank_account_number")
            if bank_account_number:
                print(f"⚡ account_id найден в БД: {bank_account_number}")
                return bank_account_number

        # Если нет — делаем запрос к API
        async with self._session.get(
            url=f"https://{bank_name}.{self.base_url}/accounts",
            headers={
                "Authorization": f"Bearer {access_token}",
                "X-Requesting-Bank": self.client_id,  
                "X-Consent-Id": consent               
            },
            params={
                "client_id": f"{self.client_id}-{client_id_id}"
            },
            timeout=15
        ) as resp:
            if resp.status != 200:
                raise ValueError(f"❌ Ошибка при получении accounts из {bank_name}: {resp.status}")
            result = await resp.json()
            bank_account_number = result["data"]["account"][0]["account"][0].get("identification", "0000")
            return bank_account_number
            


    # Получить Балансы конкретного банка и юзера
    async def get_account_balances(self, bank_name, client_id_id):
        access_token = await self.get_access_token(bank_name)
        consent = await self.get_account_consent(bank_name, access_token, client_id_id)
        account_id = await self.get_account_id(bank_name, access_token, consent, client_id_id)

        async with self._session.get(
            url=f"https://{bank_name}.{self.base_url}/accounts/{account_id}/balances",
            headers={
                "Authorization": f"Bearer {access_token}",
                "X-Requesting-Bank": self.client_id,  
                "X-Consent-Id": consent               
            },
            params={
                "client_id": f"{self.client_id}-{client_id_id}"
            },
            timeout=15
        ) as resp:
            if resp.status != 200:
                print(f"❌ Ошибка при получении балансов из {bank_name}: {resp.status}")
                return resp.status
            
            result = await resp.json()
            print(f"✅ Получены балансы из банка '{bank_name}' для клиента '{client_id_id}'")
            return result
        
    
    # Получить доступный баланс конкретного банка пользователя
    async def get_account_available_balance(self, bank_name, client_id_id):
        balances = await self.get_account_balances(bank_name, client_id_id)

        available_balance = balances["data"]["balance"][0]["amount"].get("amount", "0")

        return available_balance
    

    # ---------------------------------------------------------------------------------------------------
    # ----------------------------------- Payments ------------------------------------------------------

    # Получить согласие на перевод
    async def get_transfer_consent(self, client_id_id, from_bank, amount,
                                   from_access_token, debtor_bank_account_number,
                                    creditor_bank_account_number):


        async with self._session.post(
            url=f"https://{from_bank}.{self.base_url}/payment-consents/request",
            headers={
                "Authorization": f"Bearer {from_access_token}",
                "X-Requesting-Bank": self.client_id,
                "Content-Type": "application/json"
            },
            json={
                "requesting_bank": f"{self.client_id}",
                "client_id": f"{self.client_id}-{client_id_id}",
                "consent_type": "single_use",
                "amount": amount,
                "currency": "RUB",
                "debtor_account": f"{debtor_bank_account_number}",
                "creditor_account": f"{creditor_bank_account_number}",
                "reference": "Оплата услуг"
            },
            timeout=15
        ) as resp:
            if resp.status != 200:
                text = await resp.text()
                raise Exception(f"Ошибка при создании consent: {resp.status} {text}")
            
            result = await resp.json()
            # Проверяем если подтвердили согласие на перевод
            if result.get("status") == "approved":
                transfer_consent = result.get("consent_id")
                return transfer_consent
            return None



    # Создание платежа  
    async def make_transfer(self, client_id_id, to_client_id_id, from_bank, to_bank, amount) -> dict:
        from_access_token = await self.get_access_token(bank_name=from_bank)
        to_access_token = await self.get_access_token(bank_name=to_bank)

        from_consent = await self.get_account_consent(from_bank, from_access_token, client_id_id)
        to_consent = await self.get_account_consent(to_bank, to_access_token, to_client_id_id)

        debtor_bank_account_number = await self.get_bank_account_number(from_bank, from_access_token, from_consent, client_id_id)
        creditor_bank_account_number = await self.get_bank_account_number(to_bank, to_access_token, to_consent, to_client_id_id)

        amount = float(amount)

        # Получение согласия на перевод
        transfer_consent = await self.get_transfer_consent(client_id_id, from_bank,
                                                           amount, from_access_token,
                                                           debtor_bank_account_number, 
                                                           creditor_bank_account_number)

        # Если не дали согласие
        if transfer_consent == None:
            print("Произошла какая-то ошибка при получении согласия на перевод!")
            return {"status": "error", "message": "Произошла какая-то ошибка при получении согласия на перевод!"}

        async with self._session.post(
            url=f"https://{from_bank}.{self.base_url}/payments",
            headers={
                "Authorization": f"Bearer {from_access_token}",
                "Content-Type": "application/json",
                "X-Requesting-Bank": f"{self.client_id}",
                "X-FAPI-Interaction-Id": f"{self.client_id}-pay-004",
                "X-Payment-Consent-Id": f"{transfer_consent}"
            },
            params={
                "client_id": f"{self.client_id}-{client_id_id}"
            },
            json={
                "data": {
                    "initiation": {
                        "instructedAmount": {
                            "amount": str(amount),
                            "currency": "RUB"
                        },
                        "debtorAccount": {
                            "schemeName": "RU.CBR.PAN",
                            "identification": f"{debtor_bank_account_number}"
                        },
                        "creditorAccount": {
                            "identification": f"{creditor_bank_account_number}",
                            "bank_code": f"{to_bank}"
                        }
                    }
                }
            },
            timeout=15
        ) as resp:
            if resp.status not in (200, 201):
                raise Exception(f"Ошибка при создании платежа: {resp.status} {await resp.text()}")
            result = await resp.json()
            if result["data"].get("status") != "AcceptedSettlementCompleted":
                return {"status": "Перевод не подтвержден!"}
            paymentId = result["data"].get("paymentId")             #paymentId !!!!!!!!!!!!!!!!!!!!!!!!!!!!
            result = {"status": "success", "message": "Перевод выполнен!"}

            return result






    




    #ONLY FOR TESTING ( Убиваем БД коллекции которые здесь создали )
    async def drop_db(self):
        db = self.db
        collection_list = await db.list_collection_names()
        dont_delete = ["transactions", "accounts"]
        for collection_name in collection_list:
            if collection_name in dont_delete:
                continue
            await db[collection_name].drop()
            print(f"🗑️ Коллекция '{collection_name}' удалена")
        return {"status": "deleted"}


    # Закрытие сессии
    async def close(self):
        await self._session.close()
    