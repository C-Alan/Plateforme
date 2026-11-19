import pytest
from datetime import datetime, timedelta
import uuid

from app.database import Base, engine, SessionLocal
from app.models.user import User, UserRole, KYCStatus
from app.models.subscription import UserSubscription, SubscriptionTier, SubscriptionStatus
from app.models.live import LiveStream, LiveAccessType, LiveStatus, LiveChatMessage
from app.models.messaging import Conversation, DirectMessage
from app.schemas.user import UserRegisterArtist, UserRegisterFan
from app.schemas.live import LiveCreate, LiveChatMessageCreate, LiveTipCreate, LiveTicketPurchaseRequest
from app.schemas.messaging import MessageSend
from app.api.auth import register_artist, register_fan
from app.api.admin import approve_artist
from app.api.lives import create_live, start_live, stop_live, get_live_detail, purchase_live_ticket, send_live_message, send_live_tip
from app.api.messaging import send_direct_message, get_conversation_messages, check_messaging_eligibility


def test_live_lifecycle_and_vip_messaging():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    uid = str(uuid.uuid4())[:8]

    try:
        # 1. Créer un Artiste
        art_reg = UserRegisterArtist(
            email=f"art_live_{uid}@cdar.ci",
            password="Password123!",
            stage_name=f"Star Live {uid}",
            category="Musique",
            country="CI",
            payout_momo_number="+2250700112233",
            payout_operator="orange_money"
        )
        token_art = register_artist(art_reg, db)
        artist = db.query(User).filter(User.id == token_art.user_id).first()
        approve_artist(artist.id, None, db)

        # 2. Créer Fan 1 (Libre / Non-abonné)
        fan1_reg = UserRegisterFan(
            email=f"fan_free_{uid}@cdar.ci",
            password="Password123!",
            display_name=f"Fan Free {uid}",
            country="CI"
        )
        token_fan1 = register_fan(fan1_reg, db)
        fan1 = db.query(User).filter(User.id == token_fan1.user_id).first()

        # 3. Créer Fan 2 (Abonné VIP)
        fan2_reg = UserRegisterFan(
            email=f"fan_vip_{uid}@cdar.ci",
            password="Password123!",
            display_name=f"Fan VIP {uid}",
            country="CI"
        )
        token_fan2 = register_fan(fan2_reg, db)
        fan2 = db.query(User).filter(User.id == token_fan2.user_id).first()

        # Souscription VIP manuelle pour Fan 2
        sub_vip = UserSubscription(
            reference=f"SUB-{uid}",
            fan_id=fan2.id,
            artist_id=artist.id,
            tier=SubscriptionTier.VIP,
            price_paid_cfa=10000.0,
            status=SubscriptionStatus.ACTIVE,
            start_date=datetime.utcnow() - timedelta(days=1),
            end_date=datetime.utcnow() + timedelta(days=29)
        )
        db.add(sub_vip)
        db.commit()

        # 4. Artiste crée un Live réservé aux abonnés VIP
        live_sub = create_live(
            LiveCreate(
                title="Live VIP Privé",
                description="Session intime avec questions VIP",
                access_type=LiveAccessType.SUBSCRIBERS,
                min_tier="vip"
            ),
            current_artist=artist,
            db=db
        )
        assert live_sub.status == LiveStatus.SCHEDULED

        # Démarrer le live
        started_live = start_live(live_sub.id, current_artist=artist, db=db)
        assert started_live.status == LiveStatus.LIVE

        # Vérifier l'accès pour Fan 1 (Free) -> has_access = False
        det_fan1 = get_live_detail(live_sub.id, current_user=fan1, db=db)
        assert det_fan1.has_access is False
        assert det_fan1.stream_url is None

        # Vérifier l'accès pour Fan 2 (VIP) -> has_access = True
        det_fan2 = get_live_detail(live_sub.id, current_user=fan2, db=db)
        assert det_fan2.has_access is True
        assert det_fan2.stream_url is not None

        # 5. Fan 2 envoie un message et un tip dans le live
        msg = send_live_message(
            live_sub.id,
            LiveChatMessageCreate(message="Trop chaud le live !"),
            current_user=fan2,
            db=db
        )
        assert msg.badge == "vip"

        tip = send_live_tip(
            live_sub.id,
            LiveTipCreate(amount_cfa=2000.0, payment_method="orange_money"),
            current_user=fan2,
            db=db
        )
        assert tip.is_tip is True
        assert tip.tip_amount_cfa == 2000.0

        # Arrêt du live -> archivage 48h
        ended_live = stop_live(live_sub.id, current_artist=artist, db=db)
        assert ended_live.status == LiveStatus.ENDED
        assert ended_live.replay_url is not None

        # 6. Test Live Payant (Ticket PPV)
        live_ppv = create_live(
            LiveCreate(
                title="Concert Digital Live",
                access_type=LiveAccessType.PPV_TICKET,
                ticket_price_cfa=3000.0
            ),
            current_artist=artist,
            db=db
        )
        # Fan 1 n'a pas accès initialement
        assert get_live_detail(live_ppv.id, current_user=fan1, db=db).has_access is False

        # Fan 1 achète un ticket Mobile Money
        tck_res = purchase_live_ticket(
            live_ppv.id,
            LiveTicketPurchaseRequest(payment_method="wave"),
            current_user=fan1,
            db=db
        )
        assert tck_res["status"] == "success"
        # Maintenant Fan 1 a accès au Live PPV !
        assert get_live_detail(live_ppv.id, current_user=fan1, db=db).has_access is True

        # 7. Test Messagerie VIP (Contrôle d'accès strict)
        # Fan 1 (Non-VIP) essaie d'envoyer un message -> Doit échouer (403)
        with pytest.raises(Exception) as exc_info:
            send_direct_message(
                artist.id,
                MessageSend(content="Coucou l'artiste"),
                current_user=fan1,
                db=db
            )
        assert "Privilège VIP requis" in str(exc_info.value)

        # Fan 2 (VIP) envoie un message -> Doit réussir
        msg_fan = send_direct_message(
            artist.id,
            MessageSend(content="Bonjour Didi, fan depuis le début !"),
            current_user=fan2,
            db=db
        )
        assert msg_fan.content == "Bonjour Didi, fan depuis le début !"
        assert msg_fan.sender_role == "fan"

        # L'Artiste répond avec une note vocale
        msg_art = send_direct_message(
            fan2.id,
            MessageSend(
                content="Note vocale réponse",
                message_type="voice_note",
                media_url="https://cdn.cdar.ci/audio/reponse-vocal.mp3"
            ),
            current_artist if 'current_artist' in locals() else artist,
            db=db
        )
        assert msg_art.message_type == "voice_note"

        # Vérifier l'historique de la conversation
        hist = get_conversation_messages(msg_fan.conversation_id, current_user=fan2, db=db)
        assert len(hist) == 2

    finally:
        db.close()

