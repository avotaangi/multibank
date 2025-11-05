from fastapi import APIRouter, HTTPException, Depends
from middleware.auth import verify_token
from models.user import User
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/me")
async def get_user(user: User = Depends(verify_token)):
    """Get current user info"""
    return {"user": user.dict()}

