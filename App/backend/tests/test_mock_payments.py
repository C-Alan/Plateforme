import pytest
from app.database import SessionLocal, Base, engine
from app.models.user import User, UserRole, KYCStatus
from app.models.post import ContentType, Visibility
from app.models.transaction import TransactionType, PaymentMethod
from app.schemas.user import UserRegisterArtist, UserRegisterFan
from app.schemas.post import PostCreate
from app.schemas.payment import MockPaymentRequest, TipRequest
from app.schemas.wallet import PayoutRequestCreate
from app.api.auth import register_artist, register_fan
from app.api.posts import create_post, get_feed
from app.api.payments import mock_checkout, send_tip
from app.api.wallet import get_artist_wallet, request_payout
from app.api.admin import approve_artist

import uuid

def test_full_mock_payment_cycle():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    unique_id = str(uuid.uuid4())[:8]

    try:
        # Inscription Artiste
        art_reg = UserRegisterArtist(
            email=f"artist_{unique_id}@cdar.ci",
            password="Password123!",
            stage_name=f"Star {unique_id}",
            category="Musique",
            bio="Artiste",
            country="CI",
            payout_momo_number="+2250700998877",
            payout_operator="wave"
        )
        token_art = register_artist(art_reg, db)
        artist = db.query(User).filter(User.id == token_art.user_id).first()
        approve_artist(artist.id, None, db)

        # Inscription Fan
        fan_reg = UserRegisterFan(
            email=f"fan_{unique_id}@cdar.ci",
            password="Password123!",
            display_name=f"Fan {unique_id}",
            country="CI"
        )
        token_fan = register_fan(fan_reg, db)
        fan = db.query(User).filter(User.id == token_fan.user_id).first()

        # Artiste publie un post VIP
        p_vip = create_post(
            PostCreate(
                title="Pytest VIP Content",
                content_type=ContentType.VIDEO,
                visibility=Visibility.SUBSCRIBERS,
                media_url="https://cdn.cdar.ci/vip.mp4"
            ),
            current_artist=artist,
            db=db
        )

        # Fan voit le post verrouillé
        feed1 = get_feed(current_user=fan, db=db)
        post_item = next(p for p in feed1 if p.id == p_vip.id)
        assert post_item.is_locked is True
        assert post_item.media_url is None

        # Fan s'abonne via Orange Money Mock
        pay = mock_checkout(
            MockPaymentRequest(
                artist_id=artist.id,
                transaction_type=TransactionType.SUBSCRIPTION,
                payment_method=PaymentMethod.ORANGE_MONEY,
                amount_cfa=10000.0,
                meta_id="vip",
                simulation_mode="instant_success"
            ),
            current_user=fan,
            db=db
        )
        assert pay.status.value == "successful"
        assert pay.net_artist_cfa == 8000.0
        assert pay.platform_commission_cfa == 2000.0

        # Post maintenant déverrouillé
        feed2 = get_feed(current_user=fan, db=db)
        post_unlocked = next(p for p in feed2 if p.id == p_vip.id)
        assert post_unlocked.is_locked is False
        assert post_unlocked.media_url == "https://cdn.cdar.ci/vip.mp4"

        # Pourboire 5 000 F via Wave
        tip = send_tip(
            TipRequest(
                artist_id=artist.id,
                amount_cfa=5000.0,
                payment_method=PaymentMethod.WAVE,
                simulation_mode="instant_success"
            ),
            current_user=fan,
            db=db
        )
        assert tip.net_artist_cfa == 4000.0

        # Solde disponible = 8 000 + 4 000 = 12 000 F
        w = get_artist_wallet(current_artist=artist, db=db)
        assert w.available_balance_cfa == 12000.0

        # Retrait MoMo de 7 000 F
        payout = request_payout(
            PayoutRequestCreate(
                amount_cfa=7000.0,
                operator="wave",
                destination_number="+2250700998877",
                simulation_mode="instant_completed"
            ),
            current_artist=artist,
            db=db
        )
        assert payout.status.value == "completed"

        # Solde restant = 5 000 F
        w_final = get_artist_wallet(current_artist=artist, db=db)
        assert w_final.available_balance_cfa == 5000.0
        assert w_final.total_withdrawn_cfa == 7000.0

    finally:
        db.close()
