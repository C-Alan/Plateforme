from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.wallet import PayoutStatus


class WalletResponse(BaseModel):
    artist_id: str
    total_earned_cfa: float
    total_withdrawn_cfa: float
    available_balance_cfa: float
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PayoutRequestCreate(BaseModel):
    amount_cfa: float
    operator: str  # orange_money, mtn_momo, wave, bank_transfer
    destination_number: str
    simulation_mode: str = "instant_completed"  # "instant_completed", "pending"


class PayoutResponse(BaseModel):
    id: str
    reference: str
    artist_id: str
    amount_cfa: float
    operator: str
    destination_number: str
    status: PayoutStatus
    created_at: datetime
    processed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
