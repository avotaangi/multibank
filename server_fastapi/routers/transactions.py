from fastapi import APIRouter, HTTPException, Depends
from middleware.auth import verify_token
from models.user import User
from database import get_database
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/")
async def get_transactions(user: User = Depends(verify_token)):
    """Get user's transactions"""
    try:
        db = get_database()
        transactions = await db.transactions.find({
            "user_id": str(user.id)
        }).sort("transaction_date", -1).limit(100).to_list(length=100)
        
        return {
            "transactions": [
                {
                    "id": str(t["_id"]),
                    "account_id": t.get("account_id"),
                    "transaction_type": t.get("transaction_type"),
                    "amount": t.get("amount", 0.0),
                    "currency": t.get("currency", "RUB"),
                    "description": t.get("description"),
                    "category": t.get("category"),
                    "merchant_name": t.get("merchant_name"),
                    "status": t.get("status"),
                    "transaction_date": t.get("transaction_date"),
                    "metadata": t.get("metadata", {})
                }
                for t in transactions
            ]
        }
    except Exception as e:
        logger.error(f"Get transactions error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to get transactions")

