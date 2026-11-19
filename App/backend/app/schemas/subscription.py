from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.subscription import SubscriptionTier, SubscriptionStatus


class TierConfigCreateOrUpdate(BaseModel):
    tier: SubscriptionTier
    price_cfa: float
    description: Optional[str] = None


class TierConfigResponse(BaseModel):
    id: str
    artist_id: str
    tier: SubscriptionTier
    price_cfa: float
    description: Optional[str] = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class SubscriptionResponse(BaseModel):
    id: str
    reference: str
    fan_id: str
    artist_id: str
    tier: SubscriptionTier
    price_paid_cfa: float
    status: SubscriptionStatus
    auto_renew: bool
    start_date: datetime
    end_date: datetime

    model_config = ConfigDict(from_attributes=True)
