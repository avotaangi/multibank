from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


class Transaction(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    account_id: str
    transaction_type: str  # 'debit' or 'credit'
    amount: float
    currency: str = "RUB"
    description: str
    category: Optional[str] = None
    merchant_name: Optional[str] = None
    status: str = "completed"
    transaction_date: datetime
    metadata: dict = {}
    created_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class TransactionResponse(BaseModel):
    id: str
    account_id: str
    transaction_type: str
    amount: float
    currency: str
    description: str
    category: Optional[str]
    merchant_name: Optional[str]
    status: str
    transaction_date: datetime
    metadata: dict

