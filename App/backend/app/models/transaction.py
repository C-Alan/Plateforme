from sqlalchemy import Column, String, Float, DateTime, Enum, ForeignKey
from datetime import datetime
import enum
import uuid

from app.database import Base


class TransactionType(str, enum.Enum):
    SUBSCRIPTION = "subscription"
    PPV_PURCHASE = "ppv_purchase"
    TIP = "tip"
    LIVE_TICKET = "live_ticket"


class PaymentMethod(str, enum.Enum):
    ORANGE_MONEY = "orange_money"
    MTN_MOMO = "mtn_momo"
    WAVE = "wave"
    CARD = "card"


class TransactionStatus(str, enum.Enum):
    PENDING = "pending"
    SUCCESSFUL = "successful"
    FAILED = "failed"
    REFUNDED = "refunded"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reference = Column(String(64), unique=True, index=True)  # TXN-[AAAAMM]-[XXXXX]
    fan_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    artist_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    transaction_type = Column(Enum(TransactionType), nullable=False)
    payment_method = Column(Enum(PaymentMethod), nullable=False)
    gross_amount_cfa = Column(Float, nullable=False)       # 100%
    platform_commission_cfa = Column(Float, nullable=False) # 20%
    net_artist_cfa = Column(Float, nullable=False)         # 80%
    status = Column(Enum(TransactionStatus), default=TransactionStatus.PENDING)
    provider = Column(String(50), default="mock")          # "mock", "flutterwave", etc.
    meta_info = Column(String(500), nullable=True)         # ex: post_id ou subscription_tier
    created_at = Column(DateTime, default=datetime.utcnow)

