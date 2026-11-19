from sqlalchemy import Column, String, Float, DateTime, Enum, ForeignKey
from datetime import datetime
import enum
import uuid

from app.database import Base


class PayoutStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    REJECTED = "rejected"


class ArtistWallet(Base):
    __tablename__ = "artist_wallets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    artist_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    total_earned_cfa = Column(Float, default=0.0)      # Cumul des 80% reçus
    total_withdrawn_cfa = Column(Float, default=0.0)   # Cumul des retraits effectués
    available_balance_cfa = Column(Float, default=0.0) # Solde retirable
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PayoutRequest(Base):
    __tablename__ = "payout_requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reference = Column(String(64), unique=True, index=True)  # VERS-[ART_ID]-[AAAAMM]-[XXX]
    artist_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    amount_cfa = Column(Float, nullable=False)
    operator = Column(String(50), nullable=False)  # orange_money, mtn_momo, wave, bank_transfer
    destination_number = Column(String(50), nullable=False)
    status = Column(Enum(PayoutStatus), default=PayoutStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)

