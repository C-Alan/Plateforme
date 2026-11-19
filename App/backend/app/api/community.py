from typing import List, Dict, Any, Optional
from datetime import datetime
import json
import uuid
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.community import ArtistCommunity, CommunityMember, CommunityAnnouncement, CommunityPoll
from app.models.subscription import UserSubscription, SubscriptionStatus
from app.api.deps import get_current_user, require_artist, get_current_user_optional

router = APIRouter(prefix="/community", tags=["Communauté Artiste & Fan Club"])


# Schémas Pydantic
class CommunityCreateRequest(BaseModel):
    name: str
    slogan: Optional[str] = None
    description: Optional[str] = None
    rules: Optional[str] = None
    badge_icon: Optional[str] = "👑"
    access_type: Optional[str] = "all_fans" # all_fans | vip_only | invite_only
    welcome_message: Optional[str] = None


class CommunityUpdateRequest(BaseModel):
    name: Optional[str] = None
    slogan: Optional[str] = None
    description: Optional[str] = None
    rules: Optional[str] = None
    badge_icon: Optional[str] = None
    access_type: Optional[str] = None
    welcome_message: Optional[str] = None
    is_active: Optional[bool] = None


class AnnouncementCreateRequest(BaseModel):
    title: str
    content: str
    is_pinned: Optional[bool] = True


class PollCreateRequest(BaseModel):
    question: str
    options: List[str] # ["Option 1", "Option 2", ...]


class PollVoteRequest(BaseModel):
    option_id: int


class MemberManageRequest(BaseModel):
    role: Optional[str] = None # member | moderator | top_fan | ambassador
    status: Optional[str] = None # active | warned | suspended
    moderation_note: Optional[str] = None
    add_warning: Optional[bool] = False


# Helper pour formater la communauté
def format_community_response(db: Session, community: ArtistCommunity, current_user: Optional[User] = None):
    # Membres
    members_q = db.query(CommunityMember, User).join(User, CommunityMember.user_id == User.id).filter(
        CommunityMember.community_id == community.id
    ).all()

    members_list = []
    for cm, u in members_q:
        members_list.append({
            "member_id": cm.id,
            "user_id": u.id,
            "name": u.display_name or u.stage_name or u.email.split("@")[0],
            "avatar_url": u.avatar_url or "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120",
            "country": u.country,
            "role": cm.role,
            "status": cm.status,
            "warning_count": cm.warning_count,
            "moderation_note": cm.moderation_note,
            "joined_at": cm.joined_at.isoformat()
        })

    # Annonces
    announcements = db.query(CommunityAnnouncement).filter(
        CommunityAnnouncement.community_id == community.id
    ).order_by(CommunityAnnouncement.is_pinned.desc(), CommunityAnnouncement.created_at.desc()).all()

    announcements_list = [
        {
            "id": a.id,
            "title": a.title,
            "content": a.content,
            "is_pinned": a.is_pinned,
            "likes_count": a.likes_count,
            "created_at": a.created_at.isoformat()
        }
        for a in announcements
    ]

    # Sondages
    polls = db.query(CommunityPoll).filter(
        CommunityPoll.community_id == community.id
    ).order_by(CommunityPoll.created_at.desc()).all()

    polls_list = []
    for p in polls:
        try:
            opts = json.loads(p.options_json)
        except Exception:
            opts = []
        polls_list.append({
            "id": p.id,
            "question": p.question,
            "options": opts,
            "is_active": p.is_active,
            "total_votes": p.total_votes,
            "created_at": p.created_at.isoformat()
        })

    return {
        "has_community": True,
        "community": {
            "id": community.id,
            "artist_id": community.artist_id,
            "name": community.name,
            "slogan": community.slogan,
            "description": community.description,
            "rules": community.rules,
            "badge_icon": community.badge_icon,
            "access_type": community.access_type,
            "welcome_message": community.welcome_message,
            "is_active": community.is_active,
            "created_at": community.created_at.isoformat(),
            "members_count": len(members_list),
            "members": members_list,
            "announcements": announcements_list,
            "polls": polls_list
        }
    }


# 1. Obtenir la communauté de l'artiste connecté
@router.get("/my-community")
def get_my_artist_community(
    current_artist: User = Depends(require_artist),
    db: Session = Depends(get_db)
):
    """Récupère l'espace communautaire de l'artiste connecté avec membres, annonces et sondages"""
    community = db.query(ArtistCommunity).filter(ArtistCommunity.artist_id == current_artist.id).first()
    if not community:
        return {"has_community": False, "community": None}
    
    return format_community_response(db, community, current_artist)


# 2. Créer une nouvelle communauté pour l'artiste
@router.post("/create")
def create_artist_community(
    data: CommunityCreateRequest,
    current_artist: User = Depends(require_artist),
    db: Session = Depends(get_db)
):
    """Création du fan club / communauté officielle par l'artiste"""
    existing = db.query(ArtistCommunity).filter(ArtistCommunity.artist_id == current_artist.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vous possédez déjà une communauté active.")

    artist_name = current_artist.stage_name or "l'artiste"
    community = ArtistCommunity(
        artist_id=current_artist.id,
        name=data.name,
        slogan=data.slogan or f"Club officiel de {artist_name}",
        description=data.description or "Espace d'échange exclusif et d'annonces entre l'artiste et ses fans les plus fidèles.",
        rules=data.rules or "1. Respect mutuel et bienveillance obligatoire.\n2. Pas de spam ni de propos diffamatoires.\n3. Soutien actif et valorisation de la culture africaine.",
        badge_icon=data.badge_icon or "👑",
        access_type=data.access_type or "all_fans",
        welcome_message=data.welcome_message or "Bienvenue dans ma communauté officielle CDAR ! Vous aurez accès aux exclusivités en premier."
    )
    db.add(community)
    db.commit()
    db.refresh(community)

    # Initialiser avec quelques abonnés existants de l'artiste s'il y en a
    subs = db.query(UserSubscription).filter(
        UserSubscription.artist_id == current_artist.id,
        UserSubscription.status == SubscriptionStatus.ACTIVE
    ).all()

    for s in subs:
        mem = CommunityMember(
            community_id=community.id,
            user_id=s.fan_id,
            role="top_fan" if s.tier.value == "super_fan" else "member",
            status="active"
        )
        db.add(mem)

    # Créer une première annonce de bienvenue par défaut
    first_ann = CommunityAnnouncement(
        community_id=community.id,
        title="🌟 Lancement officiel de notre communauté !",
        content="Heureux de vous accueillir dans notre espace privilégié. Restez connectés pour les répétitions en coulisses et les sondages des prochains concerts !",
        is_pinned=True,
        likes_count=12
    )
    db.add(first_ann)

    # Créer un premier sondage d'exemple
    sample_poll = CommunityPoll(
        community_id=community.id,
        question="Quelle ville préférez-vous pour notre prochaine session acoustique VIP ?",
        options_json=json.dumps([
            {"id": 1, "text": "🇨🇮 Abidjan (Palais de la Culture)", "votes": 48},
            {"id": 2, "text": "🇸🇳 Dakar (Monument de la Renaissance)", "votes": 34},
            {"id": 3, "text": "🇨🇲 Douala (Canal Olympia)", "votes": 21}
        ]),
        total_votes=103
    )
    db.add(sample_poll)

    db.commit()
    return format_community_response(db, community, current_artist)


# 3. Mettre à jour les paramètres de la communauté
@router.put("/settings")
def update_community_settings(
    data: CommunityUpdateRequest,
    current_artist: User = Depends(require_artist),
    db: Session = Depends(get_db)
):
    """Mise à jour des règles, slogan, accès et informations de la communauté"""
    community = db.query(ArtistCommunity).filter(ArtistCommunity.artist_id == current_artist.id).first()
    if not community:
        raise HTTPException(status_code=404, detail="Communauté introuvable")

    if data.name is not None: community.name = data.name
    if data.slogan is not None: community.slogan = data.slogan
    if data.description is not None: community.description = data.description
    if data.rules is not None: community.rules = data.rules
    if data.badge_icon is not None: community.badge_icon = data.badge_icon
    if data.access_type is not None: community.access_type = data.access_type
    if data.welcome_message is not None: community.welcome_message = data.welcome_message
    if data.is_active is not None: community.is_active = data.is_active

    db.commit()
    db.refresh(community)
    return format_community_response(db, community, current_artist)


# 4. Publier une annonce
@router.post("/announcements")
def create_announcement(
    data: AnnouncementCreateRequest,
    current_artist: User = Depends(require_artist),
    db: Session = Depends(get_db)
):
    """Publication d'une annonce épinglée dans la communauté par l'artiste"""
    community = db.query(ArtistCommunity).filter(ArtistCommunity.artist_id == current_artist.id).first()
    if not community:
        raise HTTPException(status_code=404, detail="Veuillez d'abord créer votre communauté")

    ann = CommunityAnnouncement(
        community_id=community.id,
        title=data.title,
        content=data.content,
        is_pinned=data.is_pinned if data.is_pinned is not None else True
    )
    db.add(ann)
    db.commit()
    return {"success": True, "announcement_id": ann.id}


# 5. Supprimer une annonce
@router.delete("/announcements/{announcement_id}")
def delete_announcement(
    announcement_id: str,
    current_artist: User = Depends(require_artist),
    db: Session = Depends(get_db)
):
    """Suppression d'une annonce par l'artiste administrateur"""
    community = db.query(ArtistCommunity).filter(ArtistCommunity.artist_id == current_artist.id).first()
    if not community:
        raise HTTPException(status_code=404, detail="Communauté introuvable")

    ann = db.query(CommunityAnnouncement).filter(
        CommunityAnnouncement.id == announcement_id,
        CommunityAnnouncement.community_id == community.id
    ).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Annonce introuvable")

    db.delete(ann)
    db.commit()
    return {"success": True}


# 6. Créer un sondage interactif
@router.post("/polls")
def create_poll(
    data: PollCreateRequest,
    current_artist: User = Depends(require_artist),
    db: Session = Depends(get_db)
):
    """Création d'un sondage interactif avec choix multiples pour les fans"""
    community = db.query(ArtistCommunity).filter(ArtistCommunity.artist_id == current_artist.id).first()
    if not community:
        raise HTTPException(status_code=404, detail="Communauté introuvable")

    options_data = [
        {"id": idx + 1, "text": opt.strip(), "votes": 0}
        for idx, opt in enumerate(data.options)
        if opt.strip()
    ]
    if len(options_data) < 2:
        raise HTTPException(status_code=400, detail="Un sondage doit comporter au moins 2 options.")

    poll = CommunityPoll(
        community_id=community.id,
        question=data.question,
        options_json=json.dumps(options_data),
        total_votes=0
    )
    db.add(poll)
    db.commit()
    return {"success": True, "poll_id": poll.id}


# 7. Voter sur un sondage (Fans & Artistes)
@router.post("/polls/{poll_id}/vote")
def vote_on_poll(
    poll_id: str,
    data: PollVoteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enregistre le vote d'un utilisateur sur une option de sondage"""
    poll = db.query(CommunityPoll).filter(CommunityPoll.id == poll_id).first()
    if not poll or not poll.is_active:
        raise HTTPException(status_code=404, detail="Sondage introuvable ou clôturé")

    try:
        opts = json.loads(poll.options_json)
        found = False
        for opt in opts:
            if opt["id"] == data.option_id:
                opt["votes"] = opt.get("votes", 0) + 1
                found = True
                break
        if not found:
            raise HTTPException(status_code=400, detail="Option de vote invalide")

        poll.options_json = json.dumps(opts)
        poll.total_votes = (poll.total_votes or 0) + 1
        db.commit()
        return {"success": True, "total_votes": poll.total_votes, "options": opts}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur lors du vote: {str(e)}")


# 8. Administrer un membre de la communauté (Rôle, Statut, Avertissement)
@router.put("/members/{member_id}/manage")
def manage_community_member(
    member_id: str,
    data: MemberManageRequest,
    current_artist: User = Depends(require_artist),
    db: Session = Depends(get_db)
):
    """
    Administration d'un membre par l'artiste :
    - Rôles : member, moderator, top_fan, ambassador
    - Statut : active, warned, suspended
    - Avertissements et notes de modération
    """
    community = db.query(ArtistCommunity).filter(ArtistCommunity.artist_id == current_artist.id).first()
    if not community:
        raise HTTPException(status_code=404, detail="Communauté introuvable")

    member = db.query(CommunityMember).filter(
        CommunityMember.id == member_id,
        CommunityMember.community_id == community.id
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Membre introuvable")

    if data.role is not None:
        member.role = data.role
    if data.status is not None:
        member.status = data.status
    if data.moderation_note is not None:
        member.moderation_note = data.moderation_note
    if data.add_warning:
        member.warning_count = (member.warning_count or 0) + 1
        member.status = "warned"

    db.commit()
    db.refresh(member)
    return {
        "success": True,
        "member_id": member.id,
        "new_role": member.role,
        "new_status": member.status,
        "warning_count": member.warning_count
    }


# 9. Rejoindre une communauté (Pour les fans)
@router.post("/{community_id}/join")
def join_community(
    community_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Un fan rejoint le club officiel d'un artiste"""
    community = db.query(ArtistCommunity).filter(ArtistCommunity.id == community_id).first()
    if not community or not community.is_active:
        raise HTTPException(status_code=404, detail="Communauté introuvable ou désactivée")

    existing = db.query(CommunityMember).filter(
        CommunityMember.community_id == community_id,
        CommunityMember.user_id == current_user.id
    ).first()
    if existing:
        return {"success": True, "message": "Vous êtes déjà membre de cette communauté"}

    member = CommunityMember(
        community_id=community.id,
        user_id=current_user.id,
        role="member",
        status="active"
    )
    db.add(member)
    db.commit()
    return {"success": True, "message": "Bienvenue dans la communauté !"}
