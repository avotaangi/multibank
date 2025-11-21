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
            try:
                await self.add_bank(bank_name)
            except Exception as e:
                # Если банк уже существует, просто продолжаем
                if "already_exists" in str(e) or "E11000" in str(e):
                    print(f"⚠️ Банк '{bank_name}' уже существует, продолжаем...")
                else:
                    raise

        # Проверяем, есть ли уже такой client_id_id в банке
        existing_user = await db.users.find_one(
            {bank_name: {"$elemMatch": {"client_id_id": client_id_id}}}
        )

        if existing_user:
            print(f"⚠️ Аккаунт с id '{client_id_id}' уже существует в банке '{bank_name}' — пропускаем")
            return {"status": "already_exists"}
        
        access_token = await self.get_access_token(bank_name=bank_name)
        consent_result = await self.make_and_get_account_consent(bank_name=bank_name, access_token=access_token, client_id_id=client_id_id)
        
        # Обрабатываем результат согласия
        if isinstance(consent_result, dict):
            # Если вернулся объект (не одобрено автоматически)
            consent = consent_result.get("consent_id")
            status = consent_result.get("status")
            
            if status == "approved":
                # Согласие одобрено автоматически
                print(f"✅ Согласие для {bank_name} одобрено автоматически")
            elif status == "pending":
                # Для SBank согласие требует ручного одобрения
                request_id = consent_result.get("request_id")
                print(f"⚠️ Согласие для {bank_name} в статусе pending (request_id: {request_id}). Требуется ручное одобрение.")
                # Сохраняем request_id в БД для последующей проверки статуса
                # Пробуем использовать request_id как временный consent_id
                # (некоторые API могут использовать request_id как consent_id для pending согласий)
                if request_id:
                    existing = await db.users.find_one(
                        {bank_name: {"$elemMatch": {"client_id_id": client_id_id}}}
                    )

                    if not existing:
                        # Сохраняем pending согласие в БД
                        await db.users.update_one(
                            {
                                bank_name: {
                                    "$not": { "$elemMatch": {"client_id_id": client_id_id} }
                                }
                            },
                            {"$push": {bank_name: {
                                "client_id_id": client_id_id,
                                "consent": None,
                                "request_id": request_id,
                                "account_id": None,
                                "bank_account_number": None
                            }}}
                        )
                    # Добавляем банк в global_users
                    await db.global_users.update_one(
                        {"user_id_id": client_id_id},
                        {"$addToSet": {"bank_names": bank_name}},
                        upsert=True
                    )
                    print(f"✅ Pending согласие для {bank_name}/{client_id_id} сохранено в БД (request_id: {request_id})")
                raise ValueError(f"❌ Согласие для {bank_name} требует ручного одобрения (request_id: {request_id}). Аккаунт будет создан после одобрения.")
            else:
                # Другой статус
                if not consent:
                    raise ValueError(f"❌ Не удалось получить consent_id из ответа: {consent_result}")
        else:
            # Если вернулась строка (consent_id)
            consent = consent_result
        
        if not consent:
            raise ValueError(f"❌ Consent не получен для {bank_name}/{client_id_id}")
        
        account_id = await self.get_account_id(bank_name, access_token, consent, client_id_id)
        bank_account_number = await self.get_bank_account_number(bank_name, access_token, consent, client_id_id)

        # Если клиента нет — добавляем нового + Добавляем в global_users
        await db.users.update_one(
            {
                bank_name: {"$exists": True},
                f"{bank_name}.client_id_id": {"$ne": client_id_id}
            },  # ← просто ищем документ с этим банком
            {"$push": {bank_name: {
                "client_id_id": client_id_id,
                "consent": consent,
                "account_id": account_id,
                "bank_account_number": bank_account_number
            }}}
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
            print(f"⚠️ Банк '{bank_name}' уже существует в bank_names")
            # Проверяем, есть ли структура в users
            existing_bank_doc = await db.users.find_one({bank_name: {"$exists": True}})
            if not existing_bank_doc:
                # Структуры нет, создаем её
                existing_doc = await db.users.find_one({"$or": [{"telegramId": None}, {"telegramId": {"$exists": False}}]})
                if existing_doc:
                    await db.users.update_one(
                        {"_id": existing_doc["_id"]},
                        {"$set": {bank_name: []}}
                    )
                    print(f"✅ Структура для банка '{bank_name}' создана в существующем документе")
                else:
                    print(f"⚠️ Не найден документ для создания структуры банка '{bank_name}'")
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
        # Проверяем, есть ли уже документ с таким банком
        existing_bank_doc = await db.users.find_one({bank_name: {"$exists": True}})
        if existing_bank_doc:
            # Если документ с банком уже существует, ничего не делаем
            print(f"✅ Структура для банка '{bank_name}' уже существует")
        else:
            # Ищем существующий документ без telegramId или с null telegramId
            existing_doc = await db.users.find_one({"$or": [{"telegramId": None}, {"telegramId": {"$exists": False}}]})
            if existing_doc:
                # Добавляем банк к существующему документу
                await db.users.update_one(
                    {"_id": existing_doc["_id"]},
                    {"$set": {bank_name: []}}
                )
                print(f"✅ Банк '{bank_name}' добавлен к существующему документу")
            else:
                # Если нет подходящего документа, создаем новый с явным telegramId: null
                # Но сначала проверяем, нет ли уже документа без telegramId
                try:
                    await db.users.insert_one({
                        bank_name: [],
                        "telegramId": None
                    })
                    print(f"✅ Создан новый документ для банка '{bank_name}'")
                except Exception as e:
                    # Если все равно ошибка, значит документ уже есть - просто добавляем банк
                    if "E11000" in str(e):
                        existing_doc = await db.users.find_one({"telegramId": None})
                        if existing_doc:
                            await db.users.update_one(
                                {"_id": existing_doc["_id"]},
                                {"$set": {bank_name: []}}
                            )
                            print(f"✅ Банк '{bank_name}' добавлен к существующему документу (после ошибки)")
                    else:
                        raise



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
        db = self.db

        existing = await db.users.find_one(
            {f"{bank_name}.client_id_id": str(client_id_id)},
            {f"{bank_name}.$": 1}
        )

        if existing and existing[bank_name][0].get("request_id"):
            print("⛔ Уже есть pending согласие — второй раз не отправляю")
            return {"status": "pending", "request_id": existing[bank_name][0]["request_id"]}
        
        async with self._session.post(
            url=f"https://{bank_name}.{self.base_url}/account-consents/request",
            headers={
                "Authorization": f"Bearer {access_token}",
                "X-Requesting-Bank": self.client_id,
                "Content-Type": "application/json"
            },
            json={  # тело запроса
                "client_id": f"{self.client_id}-{client_id_id}",
                "permissions": ["ReadAccountsDetail", "ReadBalances", "ReadTransactionsDetail", "ReadCards"],
                "reason": "Агрегация счетов для HackAPI",
                "requesting_bank": self.client_id,
                "requesting_bank_name": re.sub(r"([a-zA-Z]+)(\d+)", r"\1 \2 App", self.client_id)
            },
            timeout=15
        ) as resp:
            if resp.status != 200:
                error_text = await resp.text()
                print(f"❌ Ошибка при создании согласия для {bank_name}: {resp.status} - {error_text}")
                raise ValueError(f"❌ Ошибка при создании согласия для {bank_name}: {resp.status}")
            
            result = await resp.json()
            print("\n\n\n\n\n", client_id_id, "\n", access_token, "\n\n\n\n\n")
            print(f"📋 Ответ согласия для {bank_name}: {result}")
            
            # Обрабатываем разные форматы ответа
            if isinstance(result, dict):
                if result.get("status") == "approved":
                    consent = result.get("consent_id") or result.get("data", {}).get("consentId")
                    if consent:
                        return consent
                elif result.get("status") == "pending":
                    # Для pending статуса пробуем извлечь consent_id из разных мест
                    consent = result.get("consent_id") or result.get("data", {}).get("consentId") or result.get("consentId")
                    if consent:
                        print(f"✅ Найден consent_id для pending согласия: {consent}")
                        return {"status": "pending", "consent_id": consent, **result}
                    else:
                        # Если consent_id нет, возвращаем весь объект для дальнейшей обработки
                        print(f"⚠️ consent_id не найден в ответе, возвращаем весь объект")
                        return result
                else:
                    # Другие статусы
                    consent = result.get("consent_id") or result.get("data", {}).get("consentId") or result.get("consentId")
                    if consent:
                        return consent
                    return result
            else:
                # Если вернулась строка (consent_id напрямую)
                return result
        raise ValueError(f"❌ Ошибка получения consent")
        

    # Проверить статус согласия по request_id (для SBank)
    async def check_consent_status_by_request_id(self, bank_name, access_token, request_id, client_id_id):
        """Проверяет статус согласия по request_id и возвращает consent_id если одобрено"""
        # Пробуем получить согласие через эндпоинт /account-consents/{request_id}
        # Если согласие одобрено, в ответе должен быть consent_id
        try:
            async with self._session.get(
                url=f"https://{bank_name}.{self.base_url}/account-consents/{request_id}",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "X-Requesting-Bank": self.client_id,
                    "Content-Type": "application/json"
                },
                timeout=15
            ) as resp:
                if resp.status == 200:
                    result = await resp.json()
                    print(result)
                    # Проверяем, есть ли consent_id в ответе
                    if isinstance(result, dict):
                        # Пробуем извлечь consent_id из разных мест в ответе
                        consent_id = result.get("data", {}).get("consentId", None)
                        
                        # Если статус approved и есть consent_id
                        status = result.get("status") or result.get("data", {}).get("status")
                        if status == "Authorized" and consent_id:
                            print(f"✅ Согласие одобрено! Найден consent_id: {consent_id}")
                            return consent_id
                        elif status == "pending":
                            print(f"⚠️ Согласие все еще в статусе pending")
                            return None
                        # ! -----------
                        elif status == "Revoked":
                            print(f"⚠️ Согласие отозвано")
                            return None
                elif resp.status == 404:
                    print(f"⚠️ Согласие с request_id {request_id} не найдено")
                    return None
                else:
                    error_text = await resp.text()
                    print(f"⚠️ Ошибка при проверке статуса согласия: {resp.status} - {error_text}")
        except Exception as e:
            print(f"⚠️ Не удалось проверить статус согласия через request_id: {e}")
        
        return None

    async def get_account_consent(self, bank_name, access_token, client_id_id):
        db = self.db

        # 1. Ищем запись о согласии в БД
        user = await db.users.find_one(
            {f"{bank_name}.client_id_id": client_id_id},
            {f"{bank_name}.$": 1}
        )

        # 2. Если записи нет – создаём аккаунт (включая согласие)
        if not user or bank_name not in user:
            try:
                print(f"⚠️ Нет аккаунта {bank_name}/{client_id_id}, создаю...")
                await self.add_new_account(bank_name, client_id_id)
            except ValueError:
                # pending согласие уже сохранено в add_new_account
                return None

            # ищем снова
            user = await db.users.find_one(
                {f"{bank_name}.client_id_id": client_id_id},
                {f"{bank_name}.$": 1}
            )

        record = user[bank_name][0]
        consent = record.get("consent")
        request_id = record.get("request_id")


        # ! Если согласие отозвано или не найдено в BankingAPI - делаем согласие и request_id - None, чтоб пересоздать
        new_consent = await self.check_consent_status_by_request_id(
            bank_name, access_token, request_id, client_id_id
        )
        if consent and request_id and not new_consent:
            consent = None
            request_id = None
            # * Убираем consent и request_id с БД
            await db.users.update_one(
                {f"{bank_name}.client_id_id": client_id_id},
                {"$set": {
                    f"{bank_name}.$.consent": None,
                    f"{bank_name}.$.request_id": None
                }}
            )


        # 3. Если consent уже есть — возвращаем
        if consent:
            return consent

        # 4. Если pending (consent=None, есть request_id)
        if request_id:
            print(f"🔄 Проверяю статус pending согласия (request_id={request_id})...")

            if new_consent:
                # обновляем consent в БД
                await db.users.update_one(
                    {f"{bank_name}.client_id_id": client_id_id},
                    {"$set": {f"{bank_name}.$.consent": new_consent}}
                )
                print(f"✅ consent обновлен: {new_consent}")
                return new_consent
            
            print("⚠️ Согласие всё ещё pending или отозвано")
            return None

        # 5. Если нет consent и нет request_id — логика авто-банк (VBank/ABank)
        print(f"➡️ Согласие отсутствует, создаю новое ({bank_name})...")
        try:
            consent_result = await self.make_and_get_account_consent(
                bank_name, access_token, client_id_id
            )
        except ValueError:
            # pending → добавлено в add_new_account
            return None

        # 6. Разбираем ответ create-consent
        if isinstance(consent_result, dict):
            if consent_result.get("status") == "approved":
                final_consent = consent_result.get("consent_id")
                await db.users.update_one(
                    {f"{bank_name}.client_id_id": client_id_id},
                    {"$set": {f"{bank_name}.$.consent": final_consent}}
                )
                return final_consent

            elif consent_result.get("status") == "pending":
                request_id = consent_result.get("request_id")
                await db.users.update_one(
                    {f"{bank_name}.client_id_id": client_id_id},
                    {"$set": {f"{bank_name}.$.request_id": request_id}}
                )
                return None

        # 7. Если просто строка — это consent_id
        if isinstance(consent_result, str):
            await db.users.update_one(
                {f"{bank_name}.client_id_id": client_id_id},
                {"$set": {f"{bank_name}.$.consent": consent_result}}
            )
            return consent_result

        return None

    
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
                error_text = await resp.text()
                print(f"❌ Ошибка при получении accounts из {bank_name}: {resp.status} - {error_text}")
                # Если ошибка 403 CONSENT_REQUIRED, это означает, что согласие еще не одобрено
                if resp.status == 403 and "CONSENT_REQUIRED" in error_text:
                    raise ValueError(f"❌ Согласие для {bank_name} требует ручного одобрения. Пока согласие не одобрено, данные недоступны.")
                raise ValueError(f"❌ Ошибка при получении accounts из {bank_name}: {resp.status} - {error_text}")
            result = await resp.json()
            # Обработка разных форматов ответа
            if "data" in result:
                if "account" in result["data"]:
                    accounts = result["data"]["account"]
                elif "accounts" in result["data"]:
                    accounts = result["data"]["accounts"]
                else:
                    accounts = result["data"]
            else:
                accounts = result.get("accounts", result.get("account", []))
            
            if not accounts or len(accounts) == 0:
                raise ValueError(f"❌ Нет счетов для клиента {client_id_id} в банке {bank_name}")
            
            account_id = accounts[0].get("accountId") or accounts[0].get("account_id") or accounts[0].get("id")
            if not account_id:
                raise ValueError(f"❌ Не удалось извлечь account_id из ответа: {accounts[0]}")
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
        
        # Если consent None (pending согласие), возвращаем 0
        if consent is None:
            print(f"⚠️ {bank_name}: Согласие не получено (pending). Возвращаем 0.")
            raise ValueError(f"❌ Согласие для {bank_name} требует ручного одобрения")
        
        account_id = await self.get_account_id(bank_name, access_token, consent, client_id_id)

        async with self._session.get(
            url=f"https://{bank_name}.{self.base_url}/accounts/{account_id}/balances",
            headers={
                "Authorization": f"Bearer {access_token}",
                "X-Requesting-Bank": self.client_id,  
                "X-Consent-Id": consent               
            },
            timeout=15
        ) as resp:
            if resp.status != 200:
                error_text = await resp.text()
                print(f"❌ Ошибка при получении балансов из {bank_name}: {resp.status} - {error_text}")
                raise ValueError(f"❌ Ошибка при получении балансов из {bank_name}: {resp.status} - {error_text}")
            
            result = await resp.json()
            print(f"✅ Получены балансы из банка '{bank_name}' для клиента '{client_id_id}'")
            return result
        
    
    # Получить доступный баланс конкретного банка пользователя
    async def get_account_available_balance(self, bank_name, client_id_id):
        try:
            print(f"🔍 Запрос баланса для {bank_name}, клиент: {client_id_id}")
            balances = await self.get_account_balances(bank_name, client_id_id)
            
            # Обработка разных форматов ответа
            if isinstance(balances, dict):
                if "data" in balances:
                    balance_data = balances["data"]
                    if "balance" in balance_data:
                        balance_list = balance_data["balance"]
                        if isinstance(balance_list, list) and len(balance_list) > 0:
                            amount = balance_list[0].get("amount", {})
                            if isinstance(amount, dict):
                                available_balance = amount.get("amount", "0")
                            else:
                                available_balance = amount
                        else:
                            available_balance = "0"
                    else:
                        available_balance = balance_data.get("amount", "0")
                else:
                    available_balance = balances.get("amount", "0")
            else:
                available_balance = str(balances) if balances else "0"
            
            print(f"✅ Баланс для {bank_name}/{client_id_id}: {available_balance}")
            return available_balance
        except ValueError as e:
            error_msg = str(e)
            # Если ошибка связана с pending согласием, возвращаем 0 без лишних логов
            if "требует ручного одобрения" in error_msg or "pending" in error_msg.lower():
                print(f"⚠️ {bank_name}: Согласие требует ручного одобрения. Возвращаем 0.")
                return "0"
            print(f"❌ ValueError при получении баланса для {bank_name}/{client_id_id}: {e}")
            return "0"
        except Exception as e:
            print(f"❌ Неожиданная ошибка при получении баланса для {bank_name}/{client_id_id}: {type(e).__name__}: {e}")
            import traceback
            traceback.print_exc()
            return "0"
    

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
    