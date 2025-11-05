from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import BaseModel, Field, validator
from passlib.context import CryptContext
from datetime import datetime
from bson import ObjectId
import logging

from middleware.auth import create_access_token, verify_token, verify_telegram_data
from database import get_database
from models.user import User, UserResponse

logger = logging.getLogger(__name__)

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class TelegramAuthRequest(BaseModel):
    init_data: str


class PinRequest(BaseModel):
    pin: str = Field(..., min_length=4, max_length=6)
    
    @validator('pin')
    def validate_pin(cls, v):
        if not v.isdigit():
            raise ValueError('PIN must be numeric')
        return v


@router.post("/telegram")
async def telegram_auth(request: TelegramAuthRequest):
    """Register/Login with Telegram"""
    try:
        telegram_user = await verify_telegram_data(request.init_data)
        
        db = get_database()
        
        # Check if user exists
        existing_user = await db.users.find_one({"telegram_id": str(telegram_user["id"])})
        
        if existing_user:
            # Update last login
            await db.users.update_one(
                {"_id": existing_user["_id"]},
                {"$set": {"last_login": datetime.utcnow()}}
            )
            user = User(**existing_user)
        else:
            # Create new user
            user_data = {
                "telegram_id": str(telegram_user["id"]),
                "username": telegram_user.get("username", ""),
                "first_name": telegram_user.get("first_name", ""),
                "last_name": telegram_user.get("last_name", ""),
                "is_verified": True,  # Telegram users are considered verified
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            result = await db.users.insert_one(user_data)
            user_data["_id"] = result.inserted_id
            user = User(**user_data)
        
        # Generate token
        token = create_access_token(str(user.id))
        
        return {
            "message": "Authentication successful",
            "token": token,
            "user": {
                "id": str(user.id),
                "telegram_id": user.telegram_id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "is_verified": user.is_verified,
                "preferences": user.preferences.dict()
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Telegram auth error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Authentication failed")


@router.post("/refresh")
async def refresh_token(user: User = Depends(verify_token)):
    """Refresh access token"""
    try:
        token = create_access_token(str(user.id))
        return {
            "message": "Token refreshed",
            "token": token
        }
    except Exception as e:
        logger.error(f"Token refresh error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Token refresh failed")


@router.post("/pin")
async def set_pin(request: PinRequest, user: User = Depends(verify_token)):
    """Set PIN code"""
    try:
        db = get_database()
        
        # Hash PIN
        pin_hash = pwd_context.hash(request.pin)
        
        await db.users.update_one(
            {"_id": user.id},
            {"$set": {"security.pin_hash": pin_hash, "updated_at": datetime.utcnow()}}
        )
        
        return {"message": "PIN set successfully"}
    except Exception as e:
        logger.error(f"PIN setting error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to set PIN")


@router.post("/pin/verify")
async def verify_pin(request: PinRequest, user: User = Depends(verify_token)):
    """Verify PIN code"""
    try:
        db = get_database()
        user_doc = await db.users.find_one({"_id": user.id})
        
        if not user_doc or not user_doc.get("security", {}).get("pin_hash"):
            raise HTTPException(status_code=400, detail="PIN not set")
        
        pin_hash = user_doc["security"]["pin_hash"]
        is_valid = pwd_context.verify(request.pin, pin_hash)
        
        if not is_valid:
            raise HTTPException(status_code=401, detail="Invalid PIN")
        
        return {"message": "PIN verified successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PIN verification error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="PIN verification failed")


@router.post("/logout")
async def logout(user: User = Depends(verify_token)):
    """Logout (client-side token removal)"""
    try:
        # In a more sophisticated system, you might want to blacklist the token
        # For now, we just return success and let the client remove the token
        return {"message": "Logged out successfully"}
    except Exception as e:
        logger.error(f"Logout error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Logout failed")


@router.get("/me")
async def get_current_user(user: User = Depends(verify_token)):
    """Get current user info"""
    try:
        db = get_database()
        user_doc = await db.users.find_one({"_id": user.id})
        
        if not user_doc:
            raise HTTPException(status_code=404, detail="User not found")
        
        pin_set = bool(user_doc.get("security", {}).get("pin_hash"))
        
        return {
            "user": {
                "id": str(user_doc["_id"]),
                "telegram_id": user_doc.get("telegram_id"),
                "username": user_doc.get("username"),
                "first_name": user_doc.get("first_name"),
                "last_name": user_doc.get("last_name"),
                "full_name": f"{user_doc.get('first_name', '')} {user_doc.get('last_name', '')}".strip(),
                "email": user_doc.get("email"),
                "phone": user_doc.get("phone", ""),
                "is_verified": user_doc.get("is_verified", False),
                "preferences": user_doc.get("preferences", {}),
                "security": {
                    "two_factor_enabled": user_doc.get("security", {}).get("two_factor_enabled", False),
                    "pin_set": pin_set
                },
                "last_login": user_doc.get("last_login"),
                "created_at": user_doc.get("created_at")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user info error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get user info")


@router.get("/banks")
async def get_banks():
    """Get list of available banks"""
    try:
        banks = [
            {"id": "vbank", "name": "VBank", "url": "https://vbank.open.bankingapi.ru"},
            {"id": "abank", "name": "ABank", "url": "https://abank.open.bankingapi.ru"},
            {"id": "sbank", "name": "SBank", "url": "https://sbank.open.bankingapi.ru"}
        ]
        return {"banks": banks}
    except Exception as e:
        logger.error(f"Get banks error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get banks")


@router.post("/bank-token")
async def get_bank_token(bank: str = None):
    """Get bank token (stub for now)"""
    try:
        # TODO: Implement with real bankingClient integration
        return {
            "message": "Bank token endpoint - stub",
            "bank": bank or "vbank",
            "note": "This will be implemented with real bankingClient integration"
        }
    except Exception as e:
        logger.error(f"Get bank token error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get bank token")

