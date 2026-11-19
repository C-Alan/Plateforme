from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.database import get_db
from app.models.user import User, UserRole, KYCStatus
from app.models.post import Post, ContentType, Visibility
from app.models.live import LiveStream, LiveStatus, LiveAccessType, LiveChatMessage
from app.models.subscription import UserSubscription, SubscriptionStatus
from app.models.wallet import ArtistWallet, PayoutRequest, PayoutStatus
from app.models.transaction import Transaction, TransactionStatus, TransactionType
from app.schemas.user import UserProfileResponse
from app.api.deps import require_admin, get_current_user_optional

router = APIRouter(prefix="/admin", tags=["Administration & Modération"])


class PostModerationRequest(BaseModel):
    sensitivity_status: Optional[str] = None  # safe, sensitive, flagged, pending_review, blocked
    sensitivity_reason: Optional[str] = None
    is_blocked: Optional[bool] = None
    is_published: Optional[bool] = None
    moderation_note: Optional[str] = None


class LiveInterventionRequest(BaseModel):
    action: str  # interrupt, set_sensitive, set_safe, send_warning
    warning_message: Optional[str] = None


# -------------------------------------------------------------
# 1. GOUVERNANCE KYC DES ARTISTES
# -------------------------------------------------------------

@router.get("/pending-artists", response_model=List[UserProfileResponse])
def get_pending_artists(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Liste des comptes artistes en attente de validation KYC"""
    return db.query(User).filter(
        User.role == UserRole.ARTIST,
        User.kyc_status == KYCStatus.PENDING
    ).all()


@router.post("/approve-artist/{artist_id}", response_model=UserProfileResponse)
def approve_artist(
    artist_id: str,
    current_admin: Optional[User] = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Valide le KYC d'un artiste et lui donne l'autorisation complète de publication"""
    artist = db.query(User).filter(User.id == artist_id, User.role == UserRole.ARTIST).first()
    if not artist:
        raise HTTPException(status_code=404, detail="Artiste introuvable")

    artist.kyc_status = KYCStatus.VERIFIED
    db.commit()
    db.refresh(artist)
    return artist


@router.post("/reject-artist/{artist_id}", response_model=UserProfileResponse)
def reject_artist(
    artist_id: str,
    current_admin: Optional[User] = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Rejette le dossier KYC d'un artiste"""
    artist = db.query(User).filter(User.id == artist_id, User.role == UserRole.ARTIST).first()
    if not artist:
        raise HTTPException(status_code=404, detail="Artiste introuvable")

    artist.kyc_status = KYCStatus.REJECTED
    db.commit()
    db.refresh(artist)
    return artist


# -------------------------------------------------------------
# 2. GESTION / VÉRIFICATION DE CONTENU (SENSIBILITÉ & MODÉRATION)
# -------------------------------------------------------------

@router.get("/posts")
def get_admin_posts(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    artist_id: Optional[str] = None,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Retourne toutes les publications avec leurs statuts de sensibilité et modération"""
    query = db.query(Post)

    if artist_id:
        query = query.filter(Post.artist_id == artist_id)

    if status_filter and status_filter != "all":
        if status_filter == "blocked":
            query = query.filter(Post.is_blocked == True)
        else:
            query = query.filter(Post.sensitivity_status == status_filter)

    posts = query.order_by(Post.created_at.desc()).limit(150).all()

    # Récupérer les artistes en cache dictionnaire
    artist_ids = list({p.artist_id for p in posts})
    artists_map = {a.id: a for a in db.query(User).filter(User.id.in_(artist_ids)).all()} if artist_ids else {}

    results = []
    for post in posts:
        artist = artists_map.get(post.artist_id)
        artist_name = artist.stage_name if (artist and artist.stage_name) else (artist.display_name if artist else "Artiste")
        artist_avatar = getattr(artist, 'avatar_url', None) or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200"

        # Filtrage texte de recherche
        if search:
            s = search.lower().strip()
            match_title = post.title and s in post.title.lower()
            match_caption = post.caption and s in post.caption.lower()
            match_artist = artist_name and s in artist_name.lower()
            match_reason = post.sensitivity_reason and s in post.sensitivity_reason.lower()
            if not (match_title or match_caption or match_artist or match_reason):
                continue

        results.append({
            "id": post.id,
            "reference": post.reference,
            "title": post.title or "Sans titre",
            "caption": post.caption or "",
            "content_type": post.content_type.value if hasattr(post.content_type, 'value') else str(post.content_type),
            "visibility": post.visibility.value if hasattr(post.visibility, 'value') else str(post.visibility),
            "price_cfa": post.price_cfa or 0.0,
            "media_url": post.media_url,
            "teaser_media_url": post.teaser_media_url,
            "is_published": bool(post.is_published),
            "is_blocked": bool(getattr(post, 'is_blocked', False)),
            "sensitivity_status": getattr(post, 'sensitivity_status', 'safe') or 'safe',
            "sensitivity_reason": getattr(post, 'sensitivity_reason', None),
            "reported_count": getattr(post, 'reported_count', 0) or 0,
            "moderation_note": getattr(post, 'moderation_note', None),
            "created_at": post.created_at.isoformat() if post.created_at else datetime.utcnow().isoformat(),
            "artist_id": post.artist_id,
            "artist_name": artist_name,
            "artist_category": getattr(artist, 'category', 'Musique') or 'Musique',
            "artist_country": getattr(artist, 'country', 'CI') or 'CI',
            "artist_avatar": artist_avatar
        })

    return results


@router.post("/posts/{post_id}/moderate")
def moderate_post(
    post_id: str,
    payload: PostModerationRequest,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Met à jour le statut de sensibilité, blocage ou censure d'un contenu"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Publication introuvable")

    if payload.sensitivity_status is not None:
        post.sensitivity_status = payload.sensitivity_status
        if payload.sensitivity_status == "blocked":
            post.is_blocked = True
            post.is_published = False
        elif payload.sensitivity_status == "safe":
            post.is_blocked = False
            post.is_published = True

    if payload.sensitivity_reason is not None:
        post.sensitivity_reason = payload.sensitivity_reason

    if payload.is_blocked is not None:
        post.is_blocked = payload.is_blocked
        if payload.is_blocked:
            post.is_published = False

    if payload.is_published is not None:
        post.is_published = payload.is_published

    if payload.moderation_note is not None:
        post.moderation_note = payload.moderation_note

    db.commit()
    db.refresh(post)

    return {
        "success": True,
        "message": f"Publication {post.reference} mise à jour avec succès",
        "post_id": post.id,
        "sensitivity_status": post.sensitivity_status,
        "is_blocked": post.is_blocked,
        "is_published": post.is_published
    }


@router.delete("/posts/{post_id}")
def delete_post_admin(
    post_id: str,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Supprime définitivement un contenu non conforme"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Publication introuvable")

    ref = post.reference
    db.delete(post)
    db.commit()
    return {"success": True, "message": f"Publication {ref} supprimée avec succès"}


# -------------------------------------------------------------
# 3. SUIVI DES CONTENUS / LIVES (SURVEILLANCE SENSIBILITÉ)
# -------------------------------------------------------------

@router.get("/lives")
def get_admin_lives(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Supervision de tous les Lives en direct, programmés et passés avec sensibilité"""
    lives = db.query(LiveStream).order_by(
        # Priorité aux lives en direct
        (LiveStream.status == LiveStatus.LIVE).desc(),
        LiveStream.created_at.desc()
    ).limit(50).all()

    artist_ids = list({l.artist_id for l in lives})
    artists_map = {a.id: a for a in db.query(User).filter(User.id.in_(artist_ids)).all()} if artist_ids else {}

    results = []
    for live in lives:
        artist = artists_map.get(live.artist_id)
        artist_name = artist.stage_name if (artist and artist.stage_name) else (artist.display_name if artist else "Artiste")
        artist_avatar = getattr(artist, 'avatar_url', None) or "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200"

        # Messages du chat pour surveiller la modération
        messages = db.query(LiveChatMessage).filter(LiveChatMessage.live_id == live.id).order_by(LiveChatMessage.created_at.desc()).limit(10).all()
        chat_count = db.query(LiveChatMessage).filter(LiveChatMessage.live_id == live.id).count()

        # Signalements estimés dans le chat
        flagged_chat_count = sum(1 for m in messages if any(bad in (m.message or "").lower() for bad in ["arnaque", "haine", "violence", "insulte"]))

        results.append({
            "id": live.id,
            "reference": live.reference,
            "title": live.title,
            "description": live.description or "",
            "access_type": live.access_type.value if hasattr(live.access_type, 'value') else str(live.access_type),
            "ticket_price_cfa": live.ticket_price_cfa or 0.0,
            "status": live.status.value if hasattr(live.status, 'value') else str(live.status),
            "stream_url": live.stream_url,
            "replay_url": live.replay_url,
            "current_viewers": live.current_viewers or 0,
            "total_tips_cfa": live.total_tips_cfa or 0.0,
            "started_at": live.started_at.isoformat() if live.started_at else None,
            "ended_at": live.ended_at.isoformat() if live.ended_at else None,
            "created_at": live.created_at.isoformat() if live.created_at else datetime.utcnow().isoformat(),
            "sensitivity_status": getattr(live, 'sensitivity_status', 'safe') or 'safe',
            "is_interrupted": bool(getattr(live, 'is_interrupted', False)),
            "moderation_warning": getattr(live, 'moderation_warning', None),
            "artist_id": live.artist_id,
            "artist_name": artist_name,
            "artist_category": getattr(artist, 'category', 'Musique') or 'Musique',
            "artist_avatar": artist_avatar,
            "chat_messages_count": chat_count,
            "flagged_chat_messages_count": flagged_chat_count,
            "recent_chat_sample": [
                {
                    "id": m.id,
                    "user_name": m.user_name,
                    "message": m.message,
                    "badge": m.badge,
                    "is_tip": m.is_tip,
                    "tip_amount_cfa": m.tip_amount_cfa,
                    "created_at": m.created_at.isoformat()
                }
                for m in reversed(messages[:5])
            ]
        })

    return results


@router.post("/lives/{live_id}/intervene")
def intervene_live(
    live_id: str,
    payload: LiveInterventionRequest,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Intervention d'urgence ou régulation de sensibilité sur un Live en direct"""
    live = db.query(LiveStream).filter(LiveStream.id == live_id).first()
    if not live:
        raise HTTPException(status_code=404, detail="Session Live introuvable")

    warning = payload.warning_message or ""

    if payload.action == "interrupt":
        # Coupure immédiate du live pour infraction
        live.status = LiveStatus.ENDED
        live.is_interrupted = True
        live.ended_at = datetime.utcnow()
        live.sensitivity_status = "high_risk"
        live.moderation_warning = warning or "Direct interrompu par la modération CDAR pour non-conformité."

        # Notification dans le chat
        msg = LiveChatMessage(
            live_id=live.id,
            user_id=current_admin.id if hasattr(current_admin, 'id') else "admin-cdar",
            user_name="Modération CDAR (Système)",
            user_role="admin",
            badge="system_alert",
            message=f"🚨 CE DIRECT A ÉTÉ INTERROMPU PAR L'ADMINISTRATION : {live.moderation_warning}"
        )
        db.add(msg)

    elif payload.action == "set_sensitive":
        live.sensitivity_status = "sensitive"
        live.moderation_warning = warning or "Diffusion classée sensible (+18 ans)."

    elif payload.action == "set_safe":
        live.sensitivity_status = "safe"
        live.is_interrupted = False
        live.moderation_warning = None

    elif payload.action == "send_warning":
        live.moderation_warning = warning
        # Message d'avertissement dans le chat
        msg = LiveChatMessage(
            live_id=live.id,
            user_id=current_admin.id if hasattr(current_admin, 'id') else "admin-cdar",
            user_name="Modération CDAR (Alerte)",
            user_role="admin",
            badge="system_alert",
            message=f"⚠️ AVERTISSEMENT OFFICIEL : {warning}"
        )
        db.add(msg)

    db.commit()
    db.refresh(live)

    return {
        "success": True,
        "message": f"Action '{payload.action}' appliquée avec succès sur le live {live.reference}",
        "live_id": live.id,
        "status": live.status.value if hasattr(live.status, 'value') else str(live.status),
        "sensitivity_status": live.sensitivity_status,
        "is_interrupted": live.is_interrupted
    }


# -------------------------------------------------------------
# 4. SUIVI DES REVENUS PAR ARTISTE
# -------------------------------------------------------------

@router.get("/artists/revenues")
def get_artists_revenues(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Tableau de bord financier complet ventilé par créateur (Part 80% / Commission CDAR 20%)"""
    artists = db.query(User).filter(User.role == UserRole.ARTIST).all()

    artists_revenues = []
    total_platform_gross = 0.0
    total_platform_commission = 0.0
    total_platform_payouts = 0.0

    for artist in artists:
        # Transactions réussies liées à cet artiste
        txns = db.query(Transaction).filter(
            Transaction.artist_id == artist.id,
            Transaction.status == TransactionStatus.SUCCESSFUL
        ).order_by(Transaction.created_at.desc()).all()

        gross_cfa = sum(t.gross_amount_cfa for t in txns)
        com_cfa = sum(t.platform_commission_cfa for t in txns)
        net_cfa = sum(t.net_artist_cfa for t in txns)

        # Ventilation par type de revenu
        sub_cfa = sum(t.gross_amount_cfa for t in txns if t.transaction_type == TransactionType.SUBSCRIPTION)
        ppv_cfa = sum(t.gross_amount_cfa for t in txns if t.transaction_type == TransactionType.PPV_PURCHASE)
        tip_cfa = sum(t.gross_amount_cfa for t in txns if t.transaction_type == TransactionType.TIP)
        live_ticket_cfa = sum(t.gross_amount_cfa for t in txns if t.transaction_type == TransactionType.LIVE_TICKET)

        # Portefeuille de l'artiste
        wallet = db.query(ArtistWallet).filter(ArtistWallet.artist_id == artist.id).first()
        available_balance = wallet.available_balance_cfa if wallet else max(0.0, net_cfa)
        total_withdrawn = wallet.total_withdrawn_cfa if wallet else 0.0

        # Retraits validés
        completed_payouts = db.query(PayoutRequest).filter(
            PayoutRequest.artist_id == artist.id,
            PayoutRequest.status == PayoutStatus.COMPLETED
        ).all()
        payouts_sum = sum(p.amount_cfa for p in completed_payouts)
        if payouts_sum > total_withdrawn:
            total_withdrawn = payouts_sum

        total_platform_gross += gross_cfa
        total_platform_commission += com_cfa
        total_platform_payouts += total_withdrawn

        artists_revenues.append({
            "artist_id": artist.id,
            "stage_name": artist.stage_name or artist.display_name or "Artiste",
            "email": artist.email,
            "category": artist.category or "Musique",
            "country": artist.country or "CI",
            "avatar_url": getattr(artist, 'avatar_url', None) or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
            "payout_operator": artist.payout_operator or "orange_money",
            "payout_momo_number": artist.payout_momo_number or "Non renseigné",
            "kyc_status": artist.kyc_status.value if hasattr(artist.kyc_status, 'value') else str(artist.kyc_status),
            "gross_revenue_cfa": gross_cfa,
            "net_artist_cfa": net_cfa,
            "commission_cdar_cfa": com_cfa,
            "available_balance_cfa": available_balance,
            "total_withdrawn_cfa": total_withdrawn,
            "total_transactions_count": len(txns),
            "breakdown": {
                "subscriptions_cfa": sub_cfa,
                "ppv_cfa": ppv_cfa,
                "tips_cfa": tip_cfa,
                "live_tickets_cfa": live_ticket_cfa
            },
            "recent_transactions": [
                {
                    "reference": t.reference,
                    "type": t.transaction_type.value if hasattr(t.transaction_type, 'value') else str(t.transaction_type),
                    "method": t.payment_method.value if hasattr(t.payment_method, 'value') else str(t.payment_method),
                    "gross": t.gross_amount_cfa,
                    "net": t.net_artist_cfa,
                    "commission": t.platform_commission_cfa,
                    "date": t.created_at.isoformat()
                }
                for t in txns[:5]
            ]
        })

    # Tri par défaut par chiffre d'affaires brut décroissant
    artists_revenues.sort(key=lambda a: a["gross_revenue_cfa"], reverse=True)

    return {
        "summary": {
            "total_artists": len(artists),
            "total_gross_volume_cfa": total_platform_gross,
            "total_platform_commission_cfa": total_platform_commission,
            "total_artists_net_share_cfa": total_platform_gross - total_platform_commission,
            "total_payouts_completed_cfa": total_platform_payouts
        },
        "artists": artists_revenues
    }


# -------------------------------------------------------------
# 5. CLASSEMENT DES ARTISTES PAR POPULARITÉ / FANS / CATÉGORIE
# -------------------------------------------------------------

@router.get("/artists/ranking")
def get_artists_ranking(
    sort_by: str = Query("popularity", description="popularity | subscribers | revenue | posts | engagement"),
    category: Optional[str] = None,
    country: Optional[str] = None,
    kyc_status: Optional[str] = None,
    current_admin: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Classement multi-critères des créateurs avec scores de popularité et télémétrie fan"""
    query = db.query(User).filter(User.role == UserRole.ARTIST)

    if category and category != "all":
        query = query.filter(User.category.ilike(f"%{category}%"))

    if country and country != "all":
        query = query.filter(User.country == country.upper())

    if kyc_status and kyc_status != "all":
        query = query.filter(User.kyc_status == kyc_status)

    artists = query.all()
    ranking_list = []

    for artist in artists:
        # Abonnés VIP actifs
        active_subs_count = db.query(UserSubscription).filter(
            UserSubscription.artist_id == artist.id,
            UserSubscription.status == SubscriptionStatus.ACTIVE,
            UserSubscription.end_date >= datetime.utcnow()
        ).count()

        # Total abonnements historiques
        all_subs_count = db.query(UserSubscription).filter(
            UserSubscription.artist_id == artist.id
        ).count()

        # Nombre de publications
        posts_count = db.query(Post).filter(Post.artist_id == artist.id).count()

        # Nombre de lives
        lives_count = db.query(LiveStream).filter(LiveStream.artist_id == artist.id).count()

        # Chiffre d'affaires
        txns = db.query(Transaction).filter(
            Transaction.artist_id == artist.id,
            Transaction.status == TransactionStatus.SUCCESSFUL
        ).all()
        gross_cfa = sum(t.gross_amount_cfa for t in txns)
        tips_cfa = sum(t.gross_amount_cfa for t in txns if t.transaction_type == TransactionType.TIP)

        # Calcul d'un score de popularité unifié et transparent (engagement + monétisation + audience)
        popularity_score = int(
            (active_subs_count * 150) +
            (all_subs_count * 40) +
            (gross_cfa / 50) +
            (posts_count * 25) +
            (lives_count * 60) +
            (tips_cfa / 20)
        )

        # Portée estimée (fans + abonnés + vues moyennes)
        estimated_reach = (active_subs_count * 8) + (posts_count * 120) + (lives_count * 350) + (all_subs_count * 5)
        if estimated_reach == 0:
            estimated_reach = 45  # Audience d'amorce

        # Badge honorifique calculé
        if popularity_score > 5000:
            badge = "👑 Top Star Africaine"
        elif popularity_score > 2000:
            badge = "🔥 Tendance Majeure"
        elif active_subs_count > 0:
            badge = "⭐ Créateur Établi"
        else:
            badge = "🌱 Étoile Montante"

        ranking_list.append({
            "artist_id": artist.id,
            "stage_name": artist.stage_name or artist.display_name or "Artiste CDAR",
            "category": artist.category or "Musique",
            "country": artist.country or "CI",
            "bio": artist.bio or "",
            "avatar_url": getattr(artist, 'avatar_url', None) or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
            "kyc_status": artist.kyc_status.value if hasattr(artist.kyc_status, 'value') else str(artist.kyc_status),
            "active_subscribers_count": active_subs_count,
            "total_subscribers_history": all_subs_count,
            "posts_count": posts_count,
            "lives_count": lives_count,
            "gross_revenue_cfa": gross_cfa,
            "popularity_score": popularity_score,
            "estimated_reach": estimated_reach,
            "badge": badge,
            "engagement_rate": f"{min(98.5, max(12.0, 45.0 + (active_subs_count * 3.5))):.1f}%"
        })

    # Tri selon le critère demandé
    if sort_by == "subscribers":
        ranking_list.sort(key=lambda x: (x["active_subscribers_count"], x["popularity_score"]), reverse=True)
    elif sort_by == "revenue":
        ranking_list.sort(key=lambda x: (x["gross_revenue_cfa"], x["popularity_score"]), reverse=True)
    elif sort_by == "posts":
        ranking_list.sort(key=lambda x: (x["posts_count"], x["popularity_score"]), reverse=True)
    elif sort_by == "engagement":
        ranking_list.sort(key=lambda x: (x["estimated_reach"], x["popularity_score"]), reverse=True)
    else:  # 'popularity' par défaut
        ranking_list.sort(key=lambda x: x["popularity_score"], reverse=True)

    # Attribution du rang dynamique (1, 2, 3...)
    for idx, item in enumerate(ranking_list):
        item["rank"] = idx + 1

    return {
        "total_ranked": len(ranking_list),
        "sort_by": sort_by,
        "category_filter": category or "all",
        "country_filter": country or "all",
        "rankings": ranking_list
    }


# -------------------------------------------------------------
# 6. STATISTIQUES GLOBALES PLATEFORME (ORIGINEL)
# -------------------------------------------------------------

@router.get("/stats")
def get_platform_stats(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Retourne la télémétrie financière et utilisateur globale de la plateforme"""
    total_users = db.query(User).count()
    total_artists = db.query(User).filter(User.role == UserRole.ARTIST).count()
    total_fans = db.query(User).filter(User.role == UserRole.FAN).count()
    verified_artists = db.query(User).filter(User.role == UserRole.ARTIST, User.kyc_status == KYCStatus.VERIFIED).count()
    pending_kyc = db.query(User).filter(User.role == UserRole.ARTIST, User.kyc_status == KYCStatus.PENDING).count()

    # Modération
    total_posts = db.query(Post).count()
    sensitive_posts = db.query(Post).filter(Post.sensitivity_status.in_(["sensitive", "flagged", "pending_review"])).count()
    blocked_posts = db.query(Post).filter(Post.is_blocked == True).count()

    # Lives
    active_lives = db.query(LiveStream).filter(LiveStream.status == LiveStatus.LIVE).count()

    # Calculs financiers
    successful_txns = db.query(Transaction).filter(Transaction.status == TransactionStatus.SUCCESSFUL).all()
    gross_volume = sum(t.gross_amount_cfa for t in successful_txns)
    platform_commission = sum(t.platform_commission_cfa for t in successful_txns)
    artist_share = sum(t.net_artist_cfa for t in successful_txns)

    # Retraits
    completed_payouts = db.query(PayoutRequest).filter(PayoutRequest.status == PayoutStatus.COMPLETED).all()
    total_payouts = sum(p.amount_cfa for p in completed_payouts)

    # 10 dernières transactions
    recent_transactions = [
        {
            "id": t.id,
            "reference": t.reference,
            "fan_id": t.fan_id,
            "artist_id": t.artist_id,
            "type": t.transaction_type.value if hasattr(t.transaction_type, 'value') else str(t.transaction_type),
            "method": t.payment_method.value if hasattr(t.payment_method, 'value') else str(t.payment_method),
            "gross": t.gross_amount_cfa,
            "commission": t.platform_commission_cfa,
            "net": t.net_artist_cfa,
            "status": t.status.value if hasattr(t.status, 'value') else str(t.status),
            "date": t.created_at.isoformat()
        }
        for t in db.query(Transaction).order_by(Transaction.created_at.desc()).limit(10).all()
    ]

    return {
        "total_users": total_users,
        "total_artists": total_artists,
        "total_fans": total_fans,
        "verified_artists": verified_artists,
        "pending_kyc": pending_kyc,
        "total_posts": total_posts,
        "sensitive_posts": sensitive_posts,
        "blocked_posts": blocked_posts,
        "active_lives": active_lives,
        "gross_volume_cfa": gross_volume,
        "platform_commission_cfa": platform_commission,
        "artist_net_share_cfa": artist_share,
        "total_payouts_completed_cfa": total_payouts,
        "recent_transactions": recent_transactions
    }
