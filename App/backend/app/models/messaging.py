from datetime import datetime
import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Boolean, Text
from sqlalchemy.orm import relationship

from app.database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reference = Column(String(64), unique=True, index=True)
    artist_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    fan_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    last_message_text = Column(String(500), nullable=True)
    last_message_at = Column(DateTime, default=datetime.utcnow)
    unread_artist_count = Column(Integer, default=0)
    unread_fan_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relations
    artist = relationship("User", foreign_keys=[artist_id])
    fan = relationship("User", foreign_keys=[fan_id])
    messages = relationship("DirectMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="DirectMessage.created_at.asc()")


class DirectMessage(Base):
    __tablename__ = "direct_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=False, index=True)
    sender_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    sender_role = Column(String(20), default="fan") # fan | artist
    message_type = Column(String(20), default="text") # text | voice_note | image
    content = Column(Text, nullable=True)
    media_url = Column(String(500), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])

