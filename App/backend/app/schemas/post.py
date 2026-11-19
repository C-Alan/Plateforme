from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.post import ContentType, Visibility


class PostCreate(BaseModel):
    title: Optional[str] = None
    caption: Optional[str] = None
    content_type: ContentType
    visibility: Visibility = Visibility.SUBSCRIBERS
    price_cfa: Optional[float] = 0.0
    media_url: str
    teaser_media_url: Optional[str] = None
    media_filename: Optional[str] = None
    media_filesize: Optional[str] = None


class PostResponse(BaseModel):
    id: str
    reference: str
    artist_id: str
    artist_name: Optional[str] = None
    artist_category: Optional[str] = None
    artist_avatar: Optional[str] = None
    title: Optional[str] = None
    caption: Optional[str] = None
    content_type: ContentType
    visibility: Visibility
    price_cfa: Optional[float] = 0.0
    teaser_media_url: Optional[str] = None
    media_url: Optional[str] = None  # None si verrouillé pour l'utilisateur qui consulte !
    media_filename: Optional[str] = None
    media_filesize: Optional[str] = None
    is_locked: bool = False
    created_at: datetime

    # Sensibilité & Modération
    sensitivity_status: Optional[str] = "safe"
    sensitivity_reason: Optional[str] = None
    reported_count: Optional[int] = 0
    is_blocked: Optional[bool] = False
    moderation_note: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
