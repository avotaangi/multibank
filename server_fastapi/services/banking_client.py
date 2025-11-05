import httpx
import logging
from typing import Dict, Optional
from datetime import datetime, timedelta

from config import settings

logger = logging.getLogger(__name__)

BANKS = {
    "vbank": "https://vbank.open.bankingapi.ru",
    "abank": "https://abank.open.bankingapi.ru",
    "sbank": "https://sbank.open.bankingapi.ru"
}


class BankingClient:
    def __init__(self):
        self.team_id = settings.open_bankingapi_team_id
        self.team_secret = settings.open_bankingapi_password
        self.tokens: Dict[str, Dict] = {}  # bank -> { token, expires_at }
    
    async def get_bank_token(self, bank: str) -> str:
        """Get access token for bank"""
        bank_url = BANKS.get(bank)
        if not bank_url:
            raise ValueError(f"Unknown bank: {bank}")
        
        # Check token cache
        cached = self.tokens.get(bank)
        if cached and cached["expires_at"] > datetime.now():
            return cached["token"]
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{bank_url}/auth/bank-token",
                    params={
                        "client_id": self.team_id,
                        "client_secret": self.team_secret
                    }
                )
                response.raise_for_status()
                data = response.json()
                
                access_token = data.get("access_token")
                expires_in = data.get("expires_in", 3600)
                
                # Subtract 60 seconds for safety margin
                expires_at = datetime.now() + timedelta(seconds=expires_in - 60)
                
                self.tokens[bank] = {
                    "token": access_token,
                    "expires_at": expires_at
                }
                
                return access_token
        except httpx.HTTPError as e:
            logger.error(f"Error getting token for {bank}: {e}")
            raise Exception(f"Failed to get token for {bank}: {str(e)}")
    
    async def request(
        self,
        bank: str,
        method: str,
        endpoint: str,
        params: Optional[Dict] = None,
        data: Optional[Dict] = None,
        headers: Optional[Dict] = None
    ) -> Dict:
        """Make request to bank API"""
        bank_url = BANKS.get(bank)
        if not bank_url:
            raise ValueError(f"Unknown bank: {bank}")
        
        token = await self.get_bank_token(bank)
        url = f"{bank_url}{endpoint}"
        
        request_headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            **(headers or {})
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.request(
                    method=method.upper(),
                    url=url,
                    params=params,
                    json=data,
                    headers=request_headers,
                    timeout=30.0
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"Error {method} {url}: {e.response.text}")
            raise {
                "status": e.response.status_code,
                "message": e.response.json().get("detail", str(e)),
                "data": e.response.json()
            }
        except httpx.HTTPError as e:
            logger.error(f"Error {method} {url}: {e}")
            raise {
                "status": 500,
                "message": str(e),
                "data": None
            }
    
    def get_banks(self) -> list:
        """Get list of all banks"""
        return list(BANKS.keys())
    
    def get_bank_url(self, bank: str) -> Optional[str]:
        """Get URL for bank"""
        return BANKS.get(bank)


# Singleton instance
banking_client = BankingClient()

