from fastapi import APIRouter, HTTPException, Depends
from middleware.auth import verify_token
from models.user import User
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/")
async def create_cash_loan_application(user: User = Depends(verify_token)):
    """Create cash loan application"""
    try:
        # Implementation would go here
        return {"message": "Application created"}
    except Exception as e:
        logger.error(f"Create cash loan application error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to create application")

