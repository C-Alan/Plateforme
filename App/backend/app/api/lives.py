import random
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.live import LiveStream, LiveTicket, LiveChatMessage, LiveAccessType, LiveStatus
from app.models.subscription import UserSubscription, SubscriptionStatus, SubscriptionTier
from app.models.transaction import Transaction, TransactionType, PaymentMethod, TransactionStatus
from app.models.wallet import ArtistWallet
from app.schemas.live import (
    LiveCreate, LiveResponse, LiveChatMessageCreate,
    LiveChatMessageResponse, LiveTipCreate, LiveTicketPurchaseRequest
)
from app.api.deps import get_current_user, require_artist
from app.services.mock_payment_gateway import get_payment_gateway

router = APIRouter(prefix="/lives", tags=["Lives & Événements en Direct"])


def _generate_live_ref(artist_id: str) -> str:
    date_str = datetime.utcnow().strftime("%Y%m%d")
    rand_num = random.randint(100, 999)
    return f"LIVE-{artist_id[:4]}-{date_str}-{rand_num}"


def _user_has_live_access(live: LiveStream, user: Optional[User], db: Session) -> bool:
    if not user:
        return live.access_type == LiveAccessType.FREE
    if user.id == live.artist_id or user.role in [UserRole.SUPER_ADMIN, UserRole.MODERATOR]:
        return True
    if live.access_type == LiveAccessType.FREE:
        return True

    # 1. Vérifier si l'utilisateur a acheté un ticket PPV
    ticket = db.query(LiveTicket).filter(
        LiveTicket.live_id == live.id,
        LiveTicket.fan_id == user.id
    ).first()
    if ticket:
        return True

    # 2. Vérifier les abonnements actifs
    active_sub = db.query(UserSubscription).filter(
        UserSubscription.fan_id == user.id,
        UserSubscription.artist_id == live.artist_id,
        UserSubscription.status == SubscriptionStatus.ACTIVE,
        UserSubscription.end_date > datetime.utcnow()
    ).first()

    if active_sub:
        # Super Fan a accès à tous les lives
        if active_sub.tier == SubscriptionTier.SUPER_FAN:
            return True
        # Si le live est pour abonnés VIP
        if live.access_type == LiveAccessType.SUBSCRIBERS:
            if live.min_tier == "simple":
                return True
            if live.min_tier in ["vip", "super_fan"] and active_sub.tier in [SubscriptionTier.VIP, SubscriptionTier.SUPER_FAN]:
                return True

    return False


@router.post("", response_model=LiveResponse)
def create_live(
    data: LiveCreate,
    current_artist: User = Depends(require_artist),
    db: Session = Depends(get_db)
):
    """Programmer ou créer un live (Artiste vérifié)"""
    live = LiveStream(
        reference=_generate_live_ref(current_artist.id),
        artist_id=current_artist.id,
        title=data.title,
        description=data.description,
        access_type=data.access_type,
        ticket_price_cfa=data.ticket_price_cfa if data.access_type == LiveAccessType.PPV_TICKET else 0.0,
        min_tier=data.min_tier,
        status=LiveStatus.SCHEDULED,
        stream_url=data.stream_url or "https://cdn.cdar.ci/live-session.mp4",
        current_viewers=0,
        total_tips_cfa=0.0
    )
    db.add(live)
    db.commit()
    db.refresh(live)

    res = LiveResponse.model_validate(live)
    res.artist_name = current_artist.stage_name or current_artist.display_name
    res.has_access = True
    res.is_artist = True
    return res


@router.post("/{live_id}/start", response_model=LiveResponse)
def start_live(
    live_id: str,
    current_artist: User = Depends(require_artist),
    db: Session = Depends(get_db)
):
    """Lancer la diffusion en direct"""
    live = db.query(LiveStream).filter(
        LiveStream.id == live_id,
        LiveStream.artist_id == current_artist.id
    ).first()
    if not live:
        raise HTTPException(status_code=404, detail="Live non trouvé")

    live.status = LiveStatus.LIVE
    live.started_at = datetime.utcnow()
    live.current_viewers = random.randint(12, 38) # Audimat initial

    # Message de bienvenue automatique dans le tchat
    bot_msg = LiveChatMessage(
        live_id=live.id,
        user_id=current_artist.id,
        user_name=current_artist.stage_name or "Artiste",
        user_role="artist",
        badge="artist",
        message="🔥 Le Live commence maintenant ! Bienvenue à tous, posez vos questions dans le chat."
    )
    db.add(bot_msg)
    db.commit()
    db.refresh(live)

    res = LiveResponse.model_validate(live)
    res.artist_name = current_artist.stage_name
    res.has_access = True
    res.is_artist = True
    return res


@router.post("/{live_id}/stop", response_model=LiveResponse)
def stop_live(
    live_id: str,
    current_artist: User = Depends(require_artist),
    db: Session = Depends(get_db)
):
    """Arrêter le live et archiver automatiquement en Replay 48h"""
    live = db.query(LiveStream).filter(
        LiveStream.id == live_id,
        LiveStream.artist_id == current_artist.id
    ).first()
    if not live:
        raise HTTPException(status_code=404, detail="Live non trouvé")

    live.status = LiveStatus.ENDED
    live.ended_at = datetime.utcnow()
    live.replay_url = live.stream_url or "https://cdn.cdar.ci/live-replay.mp4"
    live.replay_expires_at = datetime.utcnow() + timedelta(hours=48)
    live.current_viewers = 0

    end_msg = LiveChatMessage(
        live_id=live.id,
        user_id=current_artist.id,
        user_name="Système CDAR",
        user_role="moderator",
        badge="system",
        message="🏁 Le live est terminé. Le replay sera disponible pendant 48h pour les abonnés VIP !"
    )
    db.add(end_msg)
    db.commit()
    db.refresh(live)

    res = LiveResponse.model_validate(live)
    res.artist_name = current_artist.stage_name
    res.has_access = True
    res.is_artist = True
    return res


@router.get("/active", response_model=List[LiveResponse])
def get_active_lives(
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lister les lives en direct, programmés ou en replay valide (< 48h)"""
    now = datetime.utcnow()
    lives = db.query(LiveStream).filter(
        (LiveStream.status == LiveStatus.LIVE) |
        (LiveStream.status == LiveStatus.SCHEDULED) |
        ((LiveStream.status == LiveStatus.ENDED) & (LiveStream.replay_expires_at > now))
    ).order_by(LiveStream.created_at.desc()).all()

    result = []
    for l in lives:
        resp = LiveResponse.model_validate(l)
        resp.artist_name = l.artist.stage_name if l.artist else "Artiste"
        resp.has_access = _user_has_live_access(l, current_user, db)
        resp.is_artist = bool(current_user and current_user.id == l.artist_id)
        result.append(resp)
    return result


@router.get("/{live_id}", response_model=LiveResponse)
def get_live_detail(
    live_id: str,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Consulter un live avec vérification des droits d'accès"""
    live = db.query(LiveStream).filter(LiveStream.id == live_id).first()
    if not live:
        raise HTTPException(status_code=404, detail="Live non trouvé")

    resp = LiveResponse.model_validate(live)
    resp.artist_name = live.artist.stage_name if live.artist else "Artiste"
    resp.has_access = _user_has_live_access(live, current_user, db)
    resp.is_artist = bool(current_user and current_user.id == live.artist_id)

    # Masquer le flux vidéo si l'accès n'est pas débloqué
    if not resp.has_access:
        resp.stream_url = None
        resp.replay_url = None

    return resp


@router.post("/{live_id}/ticket")
def purchase_live_ticket(
    live_id: str,
    data: LiveTicketPurchaseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Acheter un ticket pour un Live Payant via Mobile Money"""
    live = db.query(LiveStream).filter(LiveStream.id == live_id).first()
    if not live:
        raise HTTPException(status_code=404, detail="Live non trouvé")

    if live.access_type != LiveAccessType.PPV_TICKET:
        raise HTTPException(status_code=400, detail="Ce live ne requiert pas de ticket payant")

    # Vérifier si déjà acheté
    existing_ticket = db.query(LiveTicket).filter(
        LiveTicket.live_id == live.id,
        LiveTicket.fan_id == current_user.id
    ).first()
    if existing_ticket:
        return {"status": "already_owned", "message": "Ticket déjà en votre possession"}

    gateway = get_payment_gateway()
    txn = gateway.process_payment(
        db=db,
        fan_id=current_user.id,
        artist_id=live.artist_id,
        transaction_type=TransactionType.PPV_PURCHASE,
        payment_method=PaymentMethod(data.payment_method) if data.payment_method in [m.value for m in PaymentMethod] else PaymentMethod.ORANGE_MONEY,
        amount_cfa=live.ticket_price_cfa,
        meta_id=live.id
    )

    ticket = LiveTicket(
        reference=f"TCK-{live.id[:4]}-{current_user.id[:4]}-{datetime.utcnow().strftime('%H%M%S')}",
        live_id=live.id,
        fan_id=current_user.id,
        price_paid_cfa=live.ticket_price_cfa,
        payment_method=data.payment_method
    )
    db.add(ticket)
    db.commit()

    return {
        "status": "success",
        "ticket_reference": ticket.reference,
        "message": "Ticket validé ! Vous pouvez maintenant accéder au Live."
    }


@router.get("/{live_id}/messages", response_model=List[LiveChatMessageResponse])
def get_live_messages(
    live_id: str,
    db: Session = Depends(get_db)
):
    """Récupérer les derniers messages du tchat en direct"""
    msgs = db.query(LiveChatMessage).filter(
        LiveChatMessage.live_id == live_id
    ).order_by(LiveChatMessage.created_at.desc()).limit(60).all()
    return list(reversed(msgs))


@router.post("/{live_id}/messages", response_model=LiveChatMessageResponse)
def send_live_message(
    live_id: str,
    data: LiveChatMessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Envoyer un message ou réaction dans le chat en direct"""
    live = db.query(LiveStream).filter(LiveStream.id == live_id).first()
    if not live:
        raise HTTPException(status_code=404, detail="Live non trouvé")

    # Déterminer badge de l'utilisateur
    badge = None
    if current_user.id == live.artist_id:
        badge = "artist"
    else:
        sub = db.query(UserSubscription).filter(
            UserSubscription.fan_id == current_user.id,
            UserSubscription.artist_id == live.artist_id,
            UserSubscription.status == SubscriptionStatus.ACTIVE,
            UserSubscription.end_date > datetime.utcnow()
        ).first()
        if sub:
            badge = sub.tier.value

    chat_msg = LiveChatMessage(
        live_id=live.id,
        user_id=current_user.id,
        user_name=current_user.display_name or current_user.stage_name or "Fan",
        user_role=current_user.role.value,
        badge=badge,
        message=data.message,
        is_tip=False,
        tip_amount_cfa=0.0
    )
    db.add(chat_msg)
    db.commit()
    db.refresh(chat_msg)
    return chat_msg


@router.post("/{live_id}/tip", response_model=LiveChatMessageResponse)
def send_live_tip(
    live_id: str,
    data: LiveTipCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Envoyer un don / pourboire en direct pendant le live"""
    live = db.query(LiveStream).filter(LiveStream.id == live_id).first()
    if not live:
        raise HTTPException(status_code=404, detail="Live non trouvé")

    if data.amount_cfa < 100:
        raise HTTPException(status_code=400, detail="Montant minimum : 100 F CFA")

    gateway = get_payment_gateway()
    gateway.process_payment(
        db=db,
        fan_id=current_user.id,
        artist_id=live.artist_id,
        transaction_type=TransactionType.TIP,
        payment_method=PaymentMethod(data.payment_method) if data.payment_method in [m.value for m in PaymentMethod] else PaymentMethod.ORANGE_MONEY,
        amount_cfa=data.amount_cfa,
        meta_id=live.id
    )

    live.total_tips_cfa += data.amount_cfa

    donor_name = current_user.display_name or current_user.stage_name or "Fan"
    tip_msg = LiveChatMessage(
        live_id=live.id,
        user_id=current_user.id,
        user_name=donor_name,
        user_role=current_user.role.value,
        badge="donor",
        message=f"🎁 A envoyé un don en direct de {data.amount_cfa:,.0f} F CFA !",
        is_tip=True,
        tip_amount_cfa=data.amount_cfa
    )
    db.add(tip_msg)
    db.commit()
    db.refresh(tip_msg)
    return tip_msg

