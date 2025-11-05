from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        from pydantic_core import core_schema
        return core_schema.no_info_after_validator_function(
            cls.validate,
            core_schema.str_schema(),
            serialization=core_schema.to_ser_schema(core_schema.str_schema())
        )
    
    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str):
            if ObjectId.is_valid(v):
                return ObjectId(v)
            raise ValueError("Invalid ObjectId")
        raise ValueError("Invalid ObjectId type")


class UserPreferences(BaseModel):
    currency: str = "USD"
    language: str = "en"
    notifications: dict = {"email": True, "telegram": True}


class UserSecurity(BaseModel):
    two_factor_enabled: bool = False
    pin_hash: Optional[str] = None


class User(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    telegram_id: str
    username: str
    first_name: str
    last_name: str = ""
    email: Optional[str] = None
    phone: str = ""
    is_active: bool = True
    is_verified: bool = False
    last_login: Optional[datetime] = None
    preferences: UserPreferences = UserPreferences()
    security: UserSecurity = UserSecurity()
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class UserResponse(BaseModel):
    id: str
    telegram_id: str
    username: str
    first_name: str
    last_name: str
    is_verified: bool
    preferences: UserPreferences

