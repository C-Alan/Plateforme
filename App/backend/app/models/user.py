from sqlalchemy import Column, String, Boolean, DateTime, Enum, Text
from datetime import datetime
import enum
import uuid

from app.database import Base


class UserRole(str, enum.Enum):
    FAN = "fan"
    ARTIST = "artist"
    MODERATOR = "moderator"
    SUPER_ADMIN = "super_admin"


class KYCStatus(str, enum.Enum):
    NONE = "none"
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=True)
    phone_number = Column(String(50), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.FAN, nullable=False)
    country = Column(String(50), nullable=False, default="CI")  # CI, SN, CM, etc.
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Profil Fan
    display_name = Column(String(100), nullable=True)
    avatar_url = Column(String(500), nullable=True)

    # Profil Artiste (si role == ARTIST)
    stage_name = Column(String(100), unique=True, index=True, nullable=True)
    bio = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)  # Musique, Comédie, Danse, Mode, etc.
    banner_url = Column(String(500), nullable=True)
    payout_momo_number = Column(String(50), nullable=True)
    payout_operator = Column(String(50), nullable=True)  # orange, mtn, wave
    kyc_status = Column(Enum(KYCStatus), default=KYCStatus.NONE)
    kyc_id_type = Column(String(50), nullable=True, default="cni")  # cni, passeport, permis, carte_consulaire
    kyc_id_document_recto_url = Column(Text, nullable=True)  # Photo Recto de la pièce légale (URL ou DataURL base64)
    kyc_id_document_verso_url = Column(Text, nullable=True)  # Photo Verso de la pièce légale (URL ou DataURL base64)
    kyc_id_document_url = Column(Text, nullable=True)  # Document principal ou consolidé
    kyc_selfie_url = Column(Text, nullable=True)

