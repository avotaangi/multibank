from fastapi import APIRouter
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/webhook")
async def telegram_webhook():
    """Telegram webhook endpoint"""
    return {"message": "Webhook received"}

