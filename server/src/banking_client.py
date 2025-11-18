import aiohttp
import os
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

class BankingClient:
    def __init__(self):
        self.team_id = os.getenv("CLIENT_ID", "team096")
        self.team_secret = os.getenv("CLIENT_SECRET", "")
        self.banks = {
            "vbank": "https://vbank.open.bankingapi.ru",
            "abank": "https://abank.open.bankingapi.ru",
            "sbank": "https://sbank.open.bankingapi.ru"
        }
        self.tokens: Dict[str, Dict[str, Any]] = {}  # bank -> { token, expires_at }
    
    async def get_bank_token(self, session: aiohttp.ClientSession, bank: str) -> str:
        """Получить токен для банка"""
        bank_url = self.banks.get(bank)
        if not bank_url:
            raise ValueError(f"Unknown bank: {bank}")
        
        # Проверяем кэш токена
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
        
        async with session.request(
            method,
            url,
            params=params,
            json=data,
            headers=request_headers
        ) as resp:
            if resp.status >= 400:
                error_text = await resp.text()
                raise Exception(f"Error {method} {url}: {resp.status} - {error_text}")
            
            return await resp.json()
    
    def get_banks(self) -> list:
        """Получить список всех банков"""
        return list(self.banks.keys())

