from sqlalchemy import Column, String, Float, Boolean, DateTime, Enum, ForeignKey
from datetime import datetime, timedelta
import enum
import uuid

from app.database import Base


class SubscriptionTier(str, enum.Enum):
    SIMPLE = "simple"
    VIP = "vip"
    SUPER_FAN = "super_fan"


class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    PENDING = "pending"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


class SubscriptionTierConfig(Base):
    """Configuration des 3 offres d'abonnement personnalisées par chaque artiste"""
    __tablename__ = "subscription_tier_configs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    artist_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    tier = Column(Enum(SubscriptionTier), nullable=False)
    price_cfa = Column(Float, nullable=False)  # En F CFA
    description = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)


class UserSubscription(Base):
    """Abonnement d'un fan auprès d'un artiste"""
    __tablename__ = "user_subscriptions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reference = Column(String(64), unique=True, index=True)  # Format SUB-[ART_ID]-[FAN_ID]-[AAAAMM]
    fan_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    artist_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    tier = Column(Enum(SubscriptionTier), nullable=False)
    price_paid_cfa = Column(Float, nullable=False)
    status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE)
    auto_renew = Column(Boolean, default=True)
    start_date = Column(DateTime, default=datetime.utcnow)
    end_date = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(days=30))
    created_at = Column(DateTime, default=datetime.utcnow)

