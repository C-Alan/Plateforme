from sqlalchemy import Column, String, Text, Float, Boolean, DateTime, Enum, ForeignKey, Integer
from datetime import datetime
import enum
import uuid

from app.database import Base


class ContentType(str, enum.Enum):
    VIDEO = "video"
    PHOTO = "photo"
    MUSIC = "music"
    PODCAST = "podcast"
    STORY = "story"


class Visibility(str, enum.Enum):
    FREE = "free"
    SUBSCRIBERS = "subscribers"
    PPV = "ppv"  # Pay-per-view (payant à l'unité)


class Post(Base):
    __tablename__ = "posts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reference = Column(String(64), unique=True, index=True)  # Format POST-[ART_ID]-[AAAAMMJJ]-[XXX]
    artist_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(150), nullable=True)
    caption = Column(Text, nullable=True)
    content_type = Column(Enum(ContentType), nullable=False)
    visibility = Column(Enum(Visibility), default=Visibility.SUBSCRIBERS, nullable=False)
    price_cfa = Column(Float, nullable=True, default=0.0)  # Si PPV
    teaser_media_url = Column(Text, nullable=True)  # Aperçu gratuit (30s)
    media_url = Column(Text, nullable=False)        # Média principal protégé
    media_filename = Column(String(255), nullable=True) # Nom réel du fichier sélectionné
    media_filesize = Column(String(50), nullable=True)  # Taille formatée (ex: 4.2 Mo)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Modération & Sensibilité
    sensitivity_status = Column(String(30), default="safe")  # safe, sensitive, flagged, pending_review, blocked
    sensitivity_reason = Column(String(200), nullable=True)
    reported_count = Column(Integer, default=0)
    moderation_note = Column(Text, nullable=True)
    is_blocked = Column(Boolean, default=False)


class ContentPurchase(Base):
    """Achats de contenus à l'unité (PPV) par des fans"""
    __tablename__ = "content_purchases"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reference = Column(String(64), unique=True, index=True)  # ACHAT-[FAN_ID]-[POST_ID]-[AAAAMM]
    fan_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    post_id = Column(String(36), ForeignKey("posts.id"), nullable=False, index=True)
    artist_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    price_paid_cfa = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

