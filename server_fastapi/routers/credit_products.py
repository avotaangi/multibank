from fastapi import APIRouter, HTTPException, Depends
from middleware.auth import verify_token
from models.user import User
from services.banking_client import banking_client
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/")
async def get_credit_products(user: User = Depends(verify_token)):
    """Get credit products"""
    try:
        # Implementation would go here
        return {"products": []}
    except Exception as e:
        logger.error(f"Get credit products error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get credit products")

