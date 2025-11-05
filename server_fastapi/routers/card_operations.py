from fastapi import APIRouter, HTTPException, Depends
from middleware.auth import verify_token
from models.user import User
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/block/{public_id}")
async def block_card(public_id: str, user: User = Depends(verify_token)):
    """Block card"""
    try:
        # Implementation would go here
        return {"message": "Card blocked"}
    except Exception as e:
        logger.error(f"Block card error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to block card")

