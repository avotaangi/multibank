from fastapi import APIRouter, HTTPException, Depends
from middleware.auth import verify_token
from models.user import User
from services.banking_client import banking_client
import httpx
import uuid
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/balance/{external_account_id}")
async def get_rewards_balance(external_account_id: str, user: User = Depends(verify_token)):
    """Get rewards balance"""
    try:
        # This would need consent_id mapping - simplified for now
        correlation_id = str(uuid.uuid4())
        
        # Try each bank
        for bank in ["vbank", "abank", "sbank"]:
            try:
                response = await banking_client.request(
                    bank,
                    "GET",
                    f"/cards/accounts/external/{external_account_id}/rewards/balance",
                    headers={
                        "Correlation-ID": correlation_id,
                        "X-Caller-Id": str(user.id)
                    }
                )
                return response
            except Exception:
                continue
        
        raise HTTPException(status_code=404, detail="Account not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get rewards balance error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get rewards balance")

