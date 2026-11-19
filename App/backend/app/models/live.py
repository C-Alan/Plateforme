import enum
from datetime import datetime, timedelta
import uuid
from sqlalchemy import Column, String, Float, DateTime, Enum, ForeignKey, Integer, Boolean, Text
from sqlalchemy.orm import relationship

from app.database import Base


class LiveAccessType(str, enum.Enum):
    FREE = "free"
    SUBSCRIBERS = "subscribers"
    PPV_TICKET = "ppv_ticket"


class LiveStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    LIVE = "live"
    ENDED = "ended"


class LiveStream(Base):
    __tablename__ = "live_streams"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reference = Column(String(64), unique=True, index=True)
    artist_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(120), nullable=False)
    description = Column(String(500), nullable=True)
    access_type = Column(Enum(LiveAccessType), default=LiveAccessType.SUBSCRIBERS)
    ticket_price_cfa = Column(Float, default=0.0)
    min_tier = Column(String(20), default="vip")
    status = Column(Enum(LiveStatus), default=LiveStatus.SCHEDULED, index=True)

    stream_url = Column(String(500), nullable=True)
    replay_url = Column(String(500), nullable=True)
    replay_expires_at = Column(DateTime, nullable=True)

    current_viewers = Column(Integer, default=0)
    total_tips_cfa = Column(Float, default=0.0)
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Surveillance & Sensibilité Admin
    sensitivity_status = Column(String(30), default="safe")  # safe, sensitive, flagged, high_risk
    is_interrupted = Column(Boolean, default=False)
    moderation_warning = Column(String(255), nullable=True)

    # Relations
    artist = relationship("User", foreign_keys=[artist_id])
    tickets = relationship("LiveTicket", back_populates="live", cascade="all, delete-orphan")
    chat_messages = relationship("LiveChatMessage", back_populates="live", cascade="all, delete-orphan")


class LiveTicket(Base):
    __tablename__ = "live_tickets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reference = Column(String(64), unique=True, index=True)
    live_id = Column(String(36), ForeignKey("live_streams.id"), nullable=False, index=True)
    fan_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    price_paid_cfa = Column(Float, nullable=False)
    payment_method = Column(String(30), default="orange_money")
    purchased_at = Column(DateTime, default=datetime.utcnow)

    live = relationship("LiveStream", back_populates="tickets")
    fan = relationship("User", foreign_keys=[fan_id])


class LiveChatMessage(Base):
    __tablename__ = "live_chat_messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    live_id = Column(String(36), ForeignKey("live_streams.id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    user_name = Column(String(80), nullable=False)
    user_role = Column(String(20), default="fan")
    badge = Column(String(30), nullable=True) # "vip", "super_fan", "artist"
    message = Column(String(500), nullable=False)
    is_tip = Column(Boolean, default=False)
    tip_amount_cfa = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    live = relationship("LiveStream", back_populates="chat_messages")

