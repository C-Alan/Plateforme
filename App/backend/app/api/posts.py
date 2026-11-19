from typing import List, Optional
from datetime import datetime
import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.post import Post, ContentType, Visibility
from app.models.user import User, UserRole
from app.models.subscription import SubscriptionTierConfig
from app.schemas.post import PostCreate, PostResponse
from app.schemas.user import ArtistPublicResponse
from app.services.post_service import format_post_response
from app.api.deps import get_current_user, require_artist, get_current_user_optional

router = APIRouter(prefix="/posts", tags=["Publications & Feed"])


def generate_post_ref(artist_id: str) -> str:
    date_str = datetime.utcnow().strftime("%Y%m%d")
    rand_seq = random.randint(100, 999)
    return f"POST-{artist_id[:4]}-{date_str}-{rand_seq}"


@router.post("/", response_model=PostResponse)
def create_post(
    data: PostCreate,
    current_artist: User = Depends(require_artist),
    db: Session = Depends(get_db)
):
    post = Post(
        reference=generate_post_ref(current_artist.id),
        artist_id=current_artist.id,
        title=data.title,
        caption=data.caption,
        content_type=data.content_type,
        visibility=data.visibility,
        price_cfa=data.price_cfa if data.visibility == Visibility.PPV else 0.0,
        media_url=data.media_url,
        teaser_media_url=data.teaser_media_url,
        media_filename=data.media_filename,
        media_filesize=data.media_filesize,
        is_published=True
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return format_post_response(db, post, current_artist)


@router.get("/feed", response_model=List[PostResponse])
def get_feed(
    query: Optional[str] = None,
    content_type: Optional[str] = None,
    artist_id: Optional[str] = None,
    visibility: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Retourne le fil d'actualités avec recherche multi-critères et filtres"""
    q = db.query(Post).filter(Post.is_published == True)

    is_admin = current_user and current_user.role in [UserRole.SUPER_ADMIN, UserRole.MODERATOR]
    if not is_admin:
        q = q.filter(Post.is_blocked != True)

    if artist_id:
        q = q.filter(Post.artist_id == artist_id)

    if content_type and content_type.upper() in ContentType.__members__:
        q = q.filter(Post.content_type == ContentType[content_type.upper()])

    if visibility and visibility.upper() in Visibility.__members__:
        q = q.filter(Post.visibility == Visibility[visibility.upper()])

    posts = q.order_by(Post.created_at.desc()).limit(100).all()

    formatted_posts = [format_post_response(db, post, current_user) for post in posts]

    if query:
        search_term = query.strip().lower()
        formatted_posts = [
            p for p in formatted_posts
            if (
                (p.title and search_term in p.title.lower())
                or (p.caption and search_term in p.caption.lower())
                or (p.artist_name and search_term in p.artist_name.lower())
                or (p.artist_category and search_term in p.artist_category.lower())
            )
        ]

    return formatted_posts


@router.get("/artists", response_model=List[ArtistPublicResponse])
def get_artists(
    query: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retourne l'annuaire des artistes pour la recherche et la découverte"""
    users_query = db.query(User).filter(User.role == UserRole.ARTIST)

    if category and category.lower() != "tous":
        users_query = users_query.filter(User.category.ilike(f"%{category}%"))

    artists = users_query.all()
    results = []

    for art in artists:
        if query:
            q_term = query.strip().lower()
            match_name = art.stage_name and q_term in art.stage_name.lower()
            match_cat = art.category and q_term in art.category.lower()
            match_bio = art.bio and q_term in art.bio.lower()
            if not (match_name or match_cat or match_bio):
                continue

        post_count = db.query(Post).filter(Post.artist_id == art.id, Post.is_published == True).count()

        min_tier = db.query(SubscriptionTierConfig.price_cfa).filter(
            SubscriptionTierConfig.artist_id == art.id,
            SubscriptionTierConfig.is_active == True
        ).order_by(SubscriptionTierConfig.price_cfa.asc()).first()

        min_price = min_tier[0] if min_tier else 5000.0

        if "didi" in (art.stage_name or "").lower():
            avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"
        elif "josey" in (art.stage_name or "").lower():
            avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"
        else:
            avatar = art.avatar_url or "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"

        results.append(
            ArtistPublicResponse(
                id=art.id,
                stage_name=art.stage_name or art.display_name or "Artiste",
                category=art.category or "Musique",
                bio=art.bio,
                country=art.country or "CI",
                avatar_url=avatar,
                kyc_status=art.kyc_status,
                post_count=post_count,
                min_tier_price_cfa=min_price,
                created_at=art.created_at
            )
        )

    return results


@router.get("/artists/ranking")
def get_artists_ranking_public(
    sort_by: str = "popularity",
    category: Optional[str] = None,
    country: Optional[str] = None,
    kyc_status: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Classement officiel des artistes accessible aux fans, artistes et administrateurs"""
    from app.api.admin import get_artists_ranking
    return get_artists_ranking(
        sort_by=sort_by,
        category=category,
        country=country,
        kyc_status=kyc_status,
        current_admin=current_user,
        db=db
    )


@router.get("/{post_id}", response_model=PostResponse)
def get_post_detail(
    post_id: str,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id, Post.is_published == True).first()
    if not post:
        raise HTTPException(status_code=404, detail="Publication non trouvée")
    return format_post_response(db, post, current_user)

