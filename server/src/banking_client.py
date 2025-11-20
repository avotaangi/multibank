import aiohttp
import os
from typing import Optional, Dict, Any
from datetime import datetime, timedelta, timezone

class BankingClient:
    def __init__(self, db=None):
        self.team_id = os.getenv("CLIENT_ID", "team096")
        self.team_secret = os.getenv("CLIENT_SECRET", "")
        self.banks = {
            "vbank": "https://vbank.open.bankingapi.ru",
            "abank": "https://abank.open.bankingapi.ru",
            "sbank": "https://sbank.open.bankingapi.ru"
        }
        self.db = db
        self.tokens: Dict[str, Dict[str, Any]] = {}  # bank -> { token, expires_at } (in-memory cache)
    
    async def get_bank_token(self, session: aiohttp.ClientSession, bank: str) -> str:
        """Получить токен для банка (сохраняется в БД, переиспользуется до истечения срока)"""
        bank_url = self.banks.get(bank)
        if not bank_url:
            raise ValueError(f"Unknown bank: {bank}")
        
        # Если есть БД, используем её для хранения токенов (как в BankHelper)
        if self.db is not None:
            # Проверяем токен в БД
            record = await self.db.access_tokens.find_one({"bank_name": bank})
            if record:
                updated_at = record.get("updated_at")
                # Проверяем срок действия (24 часа)
                if updated_at:
                    if updated_at.tzinfo is None:
                        updated_at = updated_at.replace(tzinfo=timezone.utc)
                    
                    delta = datetime.now(timezone.utc) - updated_at
                    if delta < timedelta(hours=24):
                        # Ещё свежий токен из БД
                        access_token = record.get("access_token")
                        # Обновляем in-memory кэш для быстрого доступа
                        self.tokens[bank] = {
                            "token": access_token,
                            "expires_at": datetime.now().timestamp() + (24 * 3600)
                        }
                        return access_token
            
            # Если в БД токен истёк или его нет - получаем новый
            async with session.post(
                f"{bank_url}/auth/bank-token",
                params={
                    "client_id": self.team_id,
                    "client_secret": self.team_secret
                }
            ) as resp:
                if resp.status != 200:
                    error_text = await resp.text()
                    raise Exception(f"Failed to get token for {bank}: {resp.status} - {error_text}")
                
                data = await resp.json()
                access_token = data.get("access_token")
                if not access_token:
                    raise Exception(f"No access_token in response for {bank}")
                
                # Сохраняем в БД
                await self.db.access_tokens.update_one(
                    {"bank_name": bank},
                    {"$set": {
                        "access_token": access_token,
                        "updated_at": datetime.now(timezone.utc)
                    }},
                    upsert=True
                )
                
                # Обновляем in-memory кэш
                expires_at = datetime.now().timestamp() + (24 * 3600) - 60
                self.tokens[bank] = {
                    "token": access_token,
                    "expires_at": expires_at
                }
                
                return access_token
        
        # Если БД нет, используем только in-memory кэш (fallback для обратной совместимости)
        cached = self.tokens.get(bank)
        if cached and cached.get("expires_at", 0) > datetime.now().timestamp():
            return cached["token"]
        
        # Получаем новый токен
        async with session.post(
            f"{bank_url}/auth/bank-token",
            params={
                "client_id": self.team_id,
                "client_secret": self.team_secret
            }
        ) as resp:
            if resp.status != 200:
                error_text = await resp.text()
                raise Exception(f"Failed to get token for {bank}: {resp.status} - {error_text}")
            
            data = await resp.json()
            access_token = data.get("access_token")
            expires_in = data.get("expires_in", 86400)
            
            expires_at = datetime.now().timestamp() + expires_in - 60  # -60 секунд для запаса
            self.tokens[bank] = {
                "token": access_token,
                "expires_at": expires_at
            }
            
            return access_token
    
    async def request(
        self,
        session: aiohttp.ClientSession,
        bank: str,
        method: str,
        endpoint: str,
        params: Optional[Dict] = None,
        data: Optional[Dict] = None,
        headers: Optional[Dict] = None
    ) -> Dict:
        """Сделать запрос к банку"""
        bank_url = self.banks.get(bank)
        if not bank_url:
            raise ValueError(f"Unknown bank: {bank}")
        
        token = await self.get_bank_token(session, bank)
        url = f"{bank_url}{endpoint}"
        
        request_headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            **(headers or {})
        }
        
        # Для DELETE запросов без данных не отправляем json
        request_kwargs = {
            "method": method,
            "url": url,
            "params": params,
            "headers": request_headers
        }
        
        # Отправляем json только если есть данные и это не GET запрос
        if data is not None and method.upper() != "GET":
            request_kwargs["json"] = data
        
        async with session.request(**request_kwargs) as resp:
            if resp.status >= 400:
                error_text = await resp.text()
                raise Exception(f"Error {method} {url}: {resp.status} - {error_text}")
            
            return await resp.json()
    
    def get_banks(self) -> list:
        """Получить список всех банков"""
        return list(self.banks.keys())

