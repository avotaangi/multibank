from fastapi import APIRouter, HTTPException, Depends
from middleware.auth import verify_token
from models.user import User
from services.banking_client import banking_client
import uuid
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/")
async def get_leads(user: User = Depends(verify_token)):
    """Get leads"""
    try:
        # Implementation would go here
        return {"leads": []}
    except Exception as e:
        logger.error(f"Get leads error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get leads")

