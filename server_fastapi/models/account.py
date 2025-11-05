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


class Account(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    account_number: str
    account_type: str
    currency: str = "RUB"
    balance: float = 0.0
    available_balance: float = 0.0
    credit_limit: Optional[float] = None
    interest_rate: Optional[float] = None
    status: str = "active"
    is_default: bool = False
    formatted_balance: Optional[str] = None
    metadata: dict = {}
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class AccountResponse(BaseModel):
    id: str
    account_number: str
    account_type: str
    currency: str
    balance: float
    available_balance: float
    credit_limit: Optional[float]
    interest_rate: Optional[float]
    status: str
    is_default: bool
    formatted_balance: Optional[str]
    metadata: dict
    created_at: Optional[datetime]

