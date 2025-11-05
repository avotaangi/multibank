from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
import logging

from middleware.auth import verify_token
from database import get_database
from models.user import User
from models.account import Account, AccountResponse

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=dict)
async def get_accounts(user: User = Depends(verify_token)):
    """Get user's accounts"""
    try:
        db = get_database()
        accounts = await db.accounts.find({
            "user_id": str(user.id),
            "status": {"$ne": "closed"}
        }).sort([("is_default", -1), ("created_at", -1)]).to_list(length=100)
        
        return {
            "accounts": [
                {
                    "id": str(acc["_id"]),
                    "account_number": acc.get("account_number"),
                    "account_type": acc.get("account_type"),
                    "currency": acc.get("currency", "RUB"),
                    "balance": acc.get("balance", 0.0),
                    "available_balance": acc.get("available_balance", 0.0),
                    "credit_limit": acc.get("credit_limit"),
                    "interest_rate": acc.get("interest_rate"),
                    "status": acc.get("status", "active"),
                    "is_default": acc.get("is_default", False),
                    "formatted_balance": acc.get("formatted_balance"),
                    "metadata": acc.get("metadata", {}),
                    "created_at": acc.get("created_at")
                }
                for acc in accounts
            ]
        }
    except Exception as e:
        logger.error(f"Get accounts error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get accounts")


@router.get("/{account_id}", response_model=dict)
async def get_account(account_id: str, user: User = Depends(verify_token)):
    """Get specific account"""
    try:
        db = get_database()
        account = await db.accounts.find_one({
            "_id": ObjectId(account_id) if ObjectId.is_valid(account_id) else account_id,
            "user_id": str(user.id)
        })
        
        if not account:
            raise HTTPException(status_code=404, detail="Account not found")
        
        return {
            "account": {
                "id": str(account["_id"]),
                "account_number": account.get("account_number"),
                "account_type": account.get("account_type"),
                "currency": account.get("currency", "RUB"),
                "balance": account.get("balance", 0.0),
                "available_balance": account.get("available_balance", 0.0),
                "credit_limit": account.get("credit_limit"),
                "interest_rate": account.get("interest_rate"),
                "status": account.get("status", "active"),
                "is_default": account.get("is_default", False),
                "formatted_balance": account.get("formatted_balance"),
                "metadata": account.get("metadata", {}),
                "created_at": account.get("created_at"),
                "updated_at": account.get("updated_at")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get account error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get account")

