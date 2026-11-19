from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.transaction import TransactionType, PaymentMethod, TransactionStatus


class PaymentRequest(BaseModel):
    artist_id: str
    transaction_type: TransactionType
    payment_method: PaymentMethod
    amount_cfa: float
    meta_id: Optional[str] = None  # post_id si PPV, ou tier (simple/vip/super_fan) si abonnement
    phone_number: Optional[str] = None
    simulation_mode: str = "instant_success"


MockPaymentRequest = PaymentRequest  # Alias de compatibilité


class TipRequest(BaseModel):
    artist_id: str
    amount_cfa: float
    payment_method: PaymentMethod
    phone_number: Optional[str] = None
    simulation_mode: str = "instant_success"


class TransactionResponse(BaseModel):
    id: str
    reference: str
    fan_id: str
    artist_id: str
    transaction_type: TransactionType
    payment_method: PaymentMethod
    gross_amount_cfa: float
    platform_commission_cfa: float
    net_artist_cfa: float
    status: TransactionStatus
    provider: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
