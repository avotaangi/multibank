from pydantic import BaseModel, Field

class TransferRequest(BaseModel):
    user_id_id: str = Field(..., description="ID отправителя")
    to_user_id_id: str = Field(..., description="ID получателя")
    from_bank: str = Field(..., description="Банк отправителя (vbank, abank...)")
    to_bank: str = Field(..., description="Банк получателя")
    amount: float = Field(..., gt=0, description="Сумма перевода (должна быть > 0)")
