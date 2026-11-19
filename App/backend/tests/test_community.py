import pytest
from app.database import Base, engine, SessionLocal, ensure_schema_updates
from app.models.user import User, UserRole
from app.models.community import ArtistCommunity, CommunityMember, CommunityAnnouncement, CommunityPoll
from app.api.community import (
    get_my_artist_community, create_artist_community, update_community_settings,
    create_announcement, delete_announcement, create_poll, vote_on_poll,
    manage_community_member, CommunityCreateRequest, CommunityUpdateRequest,
    AnnouncementCreateRequest, PollCreateRequest, PollVoteRequest, MemberManageRequest
)
from app.seed import seed_database_if_empty


def test_artist_community_lifecycle():
    Base.metadata.create_all(bind=engine)
    ensure_schema_updates(engine)
    db = SessionLocal()

    try:
        seed_database_if_empty(db)

        # 1. Récupérer un artiste de démo
        artist_user = db.query(User).filter(User.role == UserRole.ARTIST).first()
        assert artist_user is not None

        # Nettoyer une éventuelle communauté existante pour le test
        existing_comm = db.query(ArtistCommunity).filter(ArtistCommunity.artist_id == artist_user.id).first()
        if existing_comm:
            db.query(CommunityAnnouncement).filter(CommunityAnnouncement.community_id == existing_comm.id).delete()
            db.query(CommunityPoll).filter(CommunityPoll.community_id == existing_comm.id).delete()
            db.query(CommunityMember).filter(CommunityMember.community_id == existing_comm.id).delete()
            db.delete(existing_comm)
            db.commit()

        # 2. Avant création : has_community doit être False
        initial_check = get_my_artist_community(current_artist=artist_user, db=db)
        assert initial_check["has_community"] is False

        # 3. Créer la communauté
        create_req = CommunityCreateRequest(
            name=f"La Tribu {artist_user.stage_name}",
            slogan="Force, authenticité & flow",
            description="Le club officiel pour les vrais passionnés.",
            rules="1. Respect obligatoire.\n2. Pas d'insultes.",
            badge_icon="👑",
            access_type="all_fans",
            welcome_message="Bienvenue dans la famille !"
        )
        created_res = create_artist_community(data=create_req, current_artist=artist_user, db=db)
        assert created_res["has_community"] is True
        assert created_res["community"]["name"] == f"La Tribu {artist_user.stage_name}"
        community_id = created_res["community"]["id"]

        # 4. Publier une annonce officielle
        ann_req = AnnouncementCreateRequest(
            title="Sortie exclusive ce vendredi !",
            content="Tous les membres auront accès au teaser 24h avant tout le monde.",
            is_pinned=True
        )
        ann_res = create_announcement(data=ann_req, current_artist=artist_user, db=db)
        assert ann_res["success"] is True

        # 5. Créer un sondage et voter
        poll_req = PollCreateRequest(
            question="Quel sera le prochain single clipé ?",
            options=["Titre A (Afro-trap)", "Titre B (Acoustique)", "Titre C (Feat exclusif)"]
        )
        poll_res = create_poll(data=poll_req, current_artist=artist_user, db=db)
        assert poll_res["success"] is True
        poll_id = poll_res["poll_id"]

        # Vote d'un fan
        fan_user = db.query(User).filter(User.role == UserRole.FAN).first()
        assert fan_user is not None
        vote_res = vote_on_poll(poll_id=poll_id, data=PollVoteRequest(option_id=1), current_user=fan_user, db=db)
        assert vote_res["success"] is True
        assert vote_res["total_votes"] == 1

        # 6. Ajouter et administrer un membre
        member = CommunityMember(
            community_id=community_id,
            user_id=fan_user.id,
            role="member",
            status="active"
        )
        db.add(member)
        db.commit()
        db.refresh(member)

        # Promouvoir en modérateur et avertir
        manage_req = MemberManageRequest(
            role="moderator",
            add_warning=True,
            moderation_note="Avertissement test modération"
        )
        manage_res = manage_community_member(member_id=member.id, data=manage_req, current_artist=artist_user, db=db)
        assert manage_res["success"] is True
        assert manage_res["new_role"] == "moderator"
        assert manage_res["warning_count"] == 1

        # 7. Mettre à jour les paramètres de la communauté
        update_req = CommunityUpdateRequest(
            slogan="Le mouvement créatif le plus chaud d'Afrique !",
            badge_icon="🔥"
        )
        updated_res = update_community_settings(data=update_req, current_artist=artist_user, db=db)
        assert updated_res["community"]["slogan"] == "Le mouvement créatif le plus chaud d'Afrique !"
        assert updated_res["community"]["badge_icon"] == "🔥"

    finally:
        db.close()
