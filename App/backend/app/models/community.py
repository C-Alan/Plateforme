from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, ForeignKey
from datetime import datetime
import uuid
import json

from app.database import Base


class ArtistCommunity(Base):
    """Espace communautaire officiel créé et administré par l'artiste"""
    __tablename__ = "artist_communities"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    artist_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False, index=True)
    name = Column(String(120), nullable=False)
    slogan = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    rules = Column(Text, nullable=True)
    badge_icon = Column(String(20), default="👑")
    banner_url = Column(String(500), nullable=True)
    access_type = Column(String(30), default="all_fans") # all_fans | vip_only | invite_only
    welcome_message = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CommunityMember(Base):
    """Membres de la communauté de l'artiste"""
    __tablename__ = "community_members"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    community_id = Column(String(36), ForeignKey("artist_communities.id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String(30), default="member") # member | moderator | top_fan | ambassador
    status = Column(String(30), default="active") # active | warned | suspended
    warning_count = Column(Integer, default=0)
    moderation_note = Column(String(255), nullable=True)
    joined_at = Column(DateTime, default=datetime.utcnow)


class CommunityAnnouncement(Base):
    """Annonces et messages épinglés par l'artiste pour ses membres"""
    __tablename__ = "community_announcements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    community_id = Column(String(36), ForeignKey("artist_communities.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    is_pinned = Column(Boolean, default=True)
    likes_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class CommunityPoll(Base):
    """Sondages interactifs créés par l'artiste pour recueillir l'avis de ses fans"""
    __tablename__ = "community_polls"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    community_id = Column(String(36), ForeignKey("artist_communities.id"), nullable=False, index=True)
    question = Column(String(255), nullable=False)
    options_json = Column(Text, nullable=False) # JSON: [{"id": 1, "text": "...", "votes": 12}]
    is_active = Column(Boolean, default=True)
    total_votes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
