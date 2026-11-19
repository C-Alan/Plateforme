from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


class MessageSend(BaseModel):
    content: Optional[str] = None
    message_type: str = "text" # "text", "voice_note", "image"
    media_url: Optional[str] = None


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    sender_name: Optional[str] = None
    sender_role: str
    message_type: str
    content: Optional[str] = None
    media_url: Optional[str] = None
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConversationSummary(BaseModel):
    id: str
    reference: str
    artist_id: str
    artist_name: Optional[str] = None
    fan_id: str
    fan_name: Optional[str] = None
    fan_tier: Optional[str] = None # "vip", "super_fan"
    last_message_text: Optional[str] = None
    last_message_at: datetime
    unread_count: int = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

