import random
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.messaging import Conversation, DirectMessage
from app.models.subscription import UserSubscription, SubscriptionStatus, SubscriptionTier
from app.schemas.messaging import ConversationSummary, MessageResponse, MessageSend
from app.api.deps import get_current_user

router = APIRouter(prefix="/messaging", tags=["Messagerie Privée Abonnés VIP"])


def _verify_vip_access(fan_id: str, artist_id: str, db: Session) -> Optional[UserSubscription]:
    """Vérifie si le fan dispose d'un abonnement actif VIP ou Super Fan"""
    sub = db.query(UserSubscription).filter(
        UserSubscription.fan_id == fan_id,
        UserSubscription.artist_id == artist_id,
        UserSubscription.status == SubscriptionStatus.ACTIVE,
        UserSubscription.end_date > datetime.utcnow(),
        UserSubscription.tier.in_([SubscriptionTier.VIP, SubscriptionTier.SUPER_FAN])
    ).first()
    return sub


@router.get("/conversations", response_model=List[ConversationSummary])
def get_user_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lister les conversations actives de l'utilisateur (Artiste ou Fan)"""
    if current_user.role == UserRole.ARTIST:
        convs = db.query(Conversation).filter(
            Conversation.artist_id == current_user.id
        ).order_by(Conversation.last_message_at.desc()).all()
    else:
        convs = db.query(Conversation).filter(
            Conversation.fan_id == current_user.id
        ).order_by(Conversation.last_message_at.desc()).all()

    results = []
    for c in convs:
        summary = ConversationSummary(
            id=c.id,
            reference=c.reference or f"CONV-{c.id[:8]}",
            artist_id=c.artist_id,
            artist_name=c.artist.stage_name if c.artist else "Artiste",
            fan_id=c.fan_id,
            fan_name=c.fan.display_name if c.fan else "Fan VIP",
            last_message_text=c.last_message_text or "Conversation ouverte",
            last_message_at=c.last_message_at or c.created_at,
            unread_count=c.unread_artist_count if current_user.role == UserRole.ARTIST else c.unread_fan_count,
            created_at=c.created_at
        )
        # Déterminer le palier actuel du fan
        vip_sub = _verify_vip_access(c.fan_id, c.artist_id, db)
        summary.fan_tier = vip_sub.tier.value if vip_sub else "Abonné"
        results.append(summary)

    return results


@router.get("/eligibility/{artist_id}")
def check_messaging_eligibility(
    artist_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Vérifier si le fan a le droit d'envoyer des messages privés à cet artiste"""
    if current_user.role == UserRole.ARTIST and current_user.id == artist_id:
        return {"can_message": True, "tier": "artist", "is_vip": True}

    sub = _verify_vip_access(current_user.id, artist_id, db)
    if sub:
        return {
            "can_message": True,
            "tier": sub.tier.value,
            "is_vip": True,
            "expires_at": sub.end_date
        }
    return {
        "can_message": False,
        "tier": "none",
        "is_vip": False,
        "message": "La messagerie privée est réservée aux abonnés VIP et Super Fan."
    }


@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
def get_conversation_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Obtenir l'historique des messages d'une conversation"""
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation non trouvée")

    if current_user.id not in [conv.artist_id, conv.fan_id]:
        raise HTTPException(status_code=403, detail="Accès non autorisé à cette conversation")

    # Marquer les messages comme lus pour le récepteur
    if current_user.id == conv.artist_id:
        conv.unread_artist_count = 0
    else:
        conv.unread_fan_count = 0
    db.commit()

    messages = db.query(DirectMessage).filter(
        DirectMessage.conversation_id == conv.id
    ).order_by(DirectMessage.created_at.asc()).all()

    result = []
    for m in messages:
        sender_name = m.sender.stage_name if m.sender_role == "artist" and m.sender.stage_name else (m.sender.display_name or "Utilisateur")
        result.append(MessageResponse(
            id=m.id,
            conversation_id=m.conversation_id,
            sender_id=m.sender_id,
            sender_name=sender_name,
            sender_role=m.sender_role,
            message_type=m.message_type,
            content=m.content,
            media_url=m.media_url,
            is_read=m.is_read,
            created_at=m.created_at
        ))
    return result


@router.post("/{target_id}/send", response_model=MessageResponse)
def send_direct_message(
    target_id: str,
    data: MessageSend,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Envoyer un message privé (texte ou note vocale).
    - Si l'expéditeur est un fan : contrôle strict d'abonnement VIP avec l'artiste.
    - Si l'expéditeur est l'artiste : envoi vers le fan ciblé.
    """
    if current_user.role == UserRole.ARTIST:
        artist_id = current_user.id
        fan_id = target_id
        sender_role = "artist"
    else:
        artist_id = target_id
        fan_id = current_user.id
        sender_role = "fan"

        # VÉRIFICATION STRICTE DU NIVEAU D'ABONNEMENT VIP
        sub = _verify_vip_access(fan_id, artist_id, db)
        if not sub:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Privilège VIP requis : Vous devez être abonné VIP ou Super Fan pour envoyer des messages privés à cet artiste."
            )

    # Récupérer ou créer la conversation unique entre ce fan et cet artiste
    conv = db.query(Conversation).filter(
        Conversation.artist_id == artist_id,
        Conversation.fan_id == fan_id
    ).first()

    if not conv:
        conv = Conversation(
            reference=f"MSG-{artist_id[:4]}-{fan_id[:4]}-{datetime.utcnow().strftime('%Y%m')}",
            artist_id=artist_id,
            fan_id=fan_id,
            last_message_text=data.content or ("🎙️ Note vocale" if data.message_type == "voice_note" else "📷 Image"),
            last_message_at=datetime.utcnow()
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # Création du message
    new_msg = DirectMessage(
        conversation_id=conv.id,
        sender_id=current_user.id,
        sender_role=sender_role,
        message_type=data.message_type,
        content=data.content,
        media_url=data.media_url,
        is_read=False
    )
    db.add(new_msg)

    # Mettre à jour la conversation
    conv.last_message_text = data.content or ("🎙️ Note vocale" if data.message_type == "voice_note" else "📷 Image")
    conv.last_message_at = datetime.utcnow()
    if sender_role == "fan":
        conv.unread_artist_count += 1
    else:
        conv.unread_fan_count += 1

    db.commit()
    db.refresh(new_msg)

    sender_name = current_user.stage_name if current_user.role == UserRole.ARTIST else (current_user.display_name or "Fan VIP")
    return MessageResponse(
        id=new_msg.id,
        conversation_id=new_msg.conversation_id,
        sender_id=new_msg.sender_id,
        sender_name=sender_name,
        sender_role=new_msg.sender_role,
        message_type=new_msg.message_type,
        content=new_msg.content,
        media_url=new_msg.media_url,
        is_read=new_msg.is_read,
        created_at=new_msg.created_at
    )

