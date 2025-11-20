from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class TransferRequest(BaseModel):
    user_id_id: str = Field(..., description="ID отправителя")
    to_user_id_id: str = Field(..., description="ID получателя")
    from_bank: str = Field(..., description="Банк отправителя (vbank, abank...)")
    to_bank: str = Field(..., description="Банк получателя")
    amount: float = Field(..., gt=0, description="Сумма перевода (должна быть > 0)")

class ProductAgreementRequest(BaseModel):
    product_id: str = Field(..., description="ID продукта")
    client_id: str = Field(..., description="ID клиента")
    amount: Optional[float] = Field(None, gt=0, description="Начальная сумма (для депозитов)")
    currency: Optional[str] = Field(default="RUB", description="Валюта")
    term: Optional[int] = Field(None, gt=0, description="Срок в месяцах")
    additional_data: Optional[Dict[str, Any]] = Field(default={}, description="Дополнительные данные")

class DepositRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Сумма пополнения")
    currency: Optional[str] = Field(default="RUB", description="Валюта")
    reference: Optional[str] = Field(default="Пополнение счета", description="Назначение платежа")

class CloseAgreementRequest(BaseModel):
    reason: Optional[str] = Field(default="Закрытие по заявлению клиента", description="Причина закрытия")
    force: Optional[bool] = Field(default=False, description="Принудительное закрытие")

class WithdrawRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Сумма снятия")
    currency: Optional[str] = Field(default="RUB", description="Валюта")
    reference: Optional[str] = Field(default="Снятие средств", description="Назначение платежа")
    destination_account: Optional[str] = Field(None, description="Счет получателя (если не указан, используется основной счет клиента)")
