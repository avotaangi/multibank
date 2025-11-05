from fastapi import APIRouter, HTTPException, Depends
from middleware.auth import verify_token
from models.user import User
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/start")
async def start_payment(user: User = Depends(verify_token)):
    """Start universal payment"""
    try:
        # Implementation would go here
        return {"payment_id": "123"}
    except Exception as e:
        logger.error(f"Start payment error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to start payment")

