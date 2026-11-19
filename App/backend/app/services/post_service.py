from typing import Optional, List
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.post import Post, ContentPurchase, Visibility
from app.models.subscription import UserSubscription, SubscriptionStatus
from app.models.user import User, UserRole
from app.schemas.post import PostResponse


def check_can_view_media(db: Session, post: Post, user: Optional[User]) -> bool:
    """Détermine si un utilisateur a le droit d'accéder au média complet protégé"""
    if not user or not hasattr(user, 'id'):
        return post.visibility == Visibility.FREE

    # 1. L'artiste lui-même ou les modérateurs ont toujours accès
    if post.artist_id == user.id or user.role in [UserRole.SUPER_ADMIN, UserRole.MODERATOR]:
        return True

    # 2. Post public/gratuit
    if post.visibility == Visibility.FREE:
        return True

    # 3. Post PPV (Payant à l'unité)
    if post.visibility == Visibility.PPV:
        has_purchased = db.query(ContentPurchase).filter(
            ContentPurchase.post_id == post.id,
            ContentPurchase.fan_id == user.id
        ).first()
        return bool(has_purchased)

    # 4. Post réservé aux abonnés
    if post.visibility == Visibility.SUBSCRIBERS:
        active_sub = db.query(UserSubscription).filter(
            UserSubscription.artist_id == post.artist_id,
            UserSubscription.fan_id == user.id,
            UserSubscription.status == SubscriptionStatus.ACTIVE,
            UserSubscription.end_date >= datetime.utcnow()
        ).first()
        return bool(active_sub)

    return False


def format_post_response(db: Session, post: Post, user: Optional[User]) -> PostResponse:
    can_view = check_can_view_media(db, post, user)
    artist = db.query(User).filter(User.id == post.artist_id).first()
    
    artist_name = artist.stage_name if (artist and artist.stage_name) else (artist.display_name if artist else "Artiste CDAR")
    artist_category = artist.category if (artist and artist.category) else "Musique"
    
    # Avatar avec fallback visuel élégant
    if artist and "didi" in (artist.stage_name or "").lower():
        artist_avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
    elif artist and "josey" in (artist.stage_name or "").lower():
        artist_avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"
    else:
        artist_avatar = artist.avatar_url if (artist and artist.avatar_url) else "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"

    return PostResponse(
        id=post.id,
        reference=post.reference,
        artist_id=post.artist_id,
        artist_name=artist_name,
        artist_category=artist_category,
        artist_avatar=artist_avatar,
        title=post.title,
        caption=post.caption,
        content_type=post.content_type,
        visibility=post.visibility,
        price_cfa=post.price_cfa,
        teaser_media_url=post.teaser_media_url,
        media_url=post.media_url if can_view else None,  # Masqué si verrouillé
        media_filename=getattr(post, 'media_filename', None),
        media_filesize=getattr(post, 'media_filesize', None),
        is_locked=not can_view,
        created_at=post.created_at,
        sensitivity_status=getattr(post, 'sensitivity_status', 'safe') or 'safe',
        sensitivity_reason=getattr(post, 'sensitivity_reason', None),
        reported_count=getattr(post, 'reported_count', 0) or 0,
        is_blocked=bool(getattr(post, 'is_blocked', False)),
        moderation_note=getattr(post, 'moderation_note', None)
    )

