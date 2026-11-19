from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from app.models.live import LiveAccessType, LiveStatus


class LiveCreate(BaseModel):
    title: str
    description: Optional[str] = None
    access_type: LiveAccessType = LiveAccessType.SUBSCRIBERS
    ticket_price_cfa: float = 0.0
    min_tier: str = "vip" # "simple", "vip", "super_fan"
    stream_url: Optional[str] = "https://cdn.cdar.ci/live-stream-hls.m3u8"


class LiveChatMessageCreate(BaseModel):
    message: str


class LiveTipCreate(BaseModel):
    amount_cfa: float
    payment_method: str = "orange_money"


class LiveTicketPurchaseRequest(BaseModel):
    payment_method: str = "orange_money"
    phone_number: Optional[str] = None


class LiveChatMessageResponse(BaseModel):
    id: str
    live_id: str
    user_id: str
    user_name: str
    user_role: str
    badge: Optional[str] = None
    message: str
    is_tip: bool
    tip_amount_cfa: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LiveResponse(BaseModel):
    id: str
    reference: str
    artist_id: str
    artist_name: Optional[str] = None
    title: str
    description: Optional[str] = None
    access_type: LiveAccessType
    ticket_price_cfa: float
    min_tier: str
    status: LiveStatus
    stream_url: Optional[str] = None
    replay_url: Optional[str] = None
    replay_expires_at: Optional[datetime] = None
    current_viewers: int
    total_tips_cfa: float
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    created_at: datetime
    has_access: Optional[bool] = False
    is_artist: Optional[bool] = False

    model_config = ConfigDict(from_attributes=True)

