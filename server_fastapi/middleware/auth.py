from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from bson import ObjectId
import logging

from config import settings
from database import get_database
from models.user import User

logger = logging.getLogger(__name__)

security = HTTPBearer()

def create_access_token(user_id: str) -> str:
    """Create JWT access token"""
    expire = datetime.utcnow() + timedelta(days=7)  # Default to 7 days
    if settings.jwt_expires_in.endswith('d'):
        days = int(settings.jwt_expires_in[:-1])
        expire = datetime.utcnow() + timedelta(days=days)
    elif settings.jwt_expires_in.endswith('h'):
        hours = int(settings.jwt_expires_in[:-1])
        expire = datetime.utcnow() + timedelta(hours=hours)
    
    to_encode = {"userId": str(user_id), "exp": expire}
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret, algorithm="HS256")
    return encoded_jwt

async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> User:
    """Verify JWT token and return user"""
    token = credentials.credentials
    
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        user_id: str = payload.get("userId")
        
        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    db = get_database()
    try:
        user_obj_id = ObjectId(user_id)
    except:
        raise HTTPException(
            status_code=401,
            detail="Invalid user ID",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_doc = await db.users.find_one({"_id": user_obj_id})
    
    if not user_doc:
        raise HTTPException(
            status_code=401,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = User(**user_doc)
    
    if not user.is_active:
        raise HTTPException(
            status_code=401,
            detail="User is inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

async def verify_telegram_data(init_data: str) -> dict:
    """Verify Telegram WebApp init data"""
    if not init_data:
        raise HTTPException(
            status_code=400,
            detail="Telegram init data required"
        )
    
    try:
        # Parse Telegram init data
        from urllib.parse import parse_qs, unquote
        params = parse_qs(init_data)
        user_str = params.get('user', [''])[0]
        
        if not user_str:
            raise HTTPException(
                status_code=400,
                detail="Invalid Telegram user data"
            )
        
        import json
        user_data = json.loads(unquote(user_str))
        
        if not user_data.get('id'):
            raise HTTPException(
                status_code=400,
                detail="Invalid Telegram user data"
            )
        
        return user_data
    except Exception as e:
        logger.error(f"Telegram verification error: {e}")
        raise HTTPException(
            status_code=400,
            detail="Invalid Telegram data format"
        )

async def optional_auth(credentials: Optional[HTTPAuthorizationCredentials] = Security(HTTPBearer(auto_error=False))) -> Optional[User]:
    """Optional authentication - returns user if token is valid, None otherwise"""
    if not credentials:
        return None
    
    try:
        return await verify_token(credentials)
    except HTTPException:
        return None

