import sys
import os
import time
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

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

def run_test():
    print("[TEST] Demarrage du cycle de test direct...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    ts = int(time.time())
    try:
        # 1. Inscription Artiste
        art_reg = UserRegisterArtist(
            email=f"art_{ts}@rapivoire.ci",
            password="Password123!",
            stage_name=f"Artiste_{ts}",
            category="Musique",
            bio="Artiste Rap Ivoire",
            country="CI",
            payout_momo_number="+2250700112233",
            payout_operator="orange_money"
        )
        token_art = register_artist(art_reg, db)
        artist = db.query(User).filter(User.id == token_art.user_id).first()
        print(f"1. Artiste inscrit : {artist.stage_name} (ID: {artist.id[:8]}..., Rôle: {artist.role})")
        assert artist.role == UserRole.ARTIST
        assert artist.kyc_status == KYCStatus.PENDING

        # 2. Validation KYC Artiste
        approved_art = approve_artist(artist.id, None, db)
        print(f"2. Validation KYC Artiste : Statut = {approved_art.kyc_status}")
        assert approved_art.kyc_status == KYCStatus.VERIFIED

        # 3. Inscription Fan
        fan_reg = UserRegisterFan(
            email=f"fan_{ts}@gmail.com",
            password="Password123!",
            display_name=f"Fan_{ts}",
            country="CI"
        )
        token_fan = register_fan(fan_reg, db)
        fan = db.query(User).filter(User.id == token_fan.user_id).first()
        print(f"3. Fan inscrit : {fan.display_name} (ID: {fan.id[:8]}..., Rôle: {fan.role})")
        assert fan.role == UserRole.FAN

        # 4. Artiste publie 2 posts (1 Public, 1 Abonnés Seulement)
        p1 = create_post(
            PostCreate(
                title="Teaser Gratuit",
                caption="Pour tout le monde",
                content_type=ContentType.VIDEO,
                visibility=Visibility.FREE,
                media_url="https://cdn.cdar.ci/teaser.mp4"
            ),
            current_artist=artist,
            db=db
        )
        print(f"4a. Post Public créé : '{p1.title}' | Verrouillé: {p1.is_locked}")
        assert p1.is_locked is False

        p2 = create_post(
            PostCreate(
                title="Clip Exclusif VIP",
                caption="Réservé aux abonnés VIP",
                content_type=ContentType.VIDEO,
                visibility=Visibility.SUBSCRIBERS,
                media_url="https://cdn.cdar.ci/vip_clip.mp4",
                teaser_media_url="https://cdn.cdar.ci/vip_teaser_30s.mp4"
            ),
            current_artist=artist,
            db=db
        )
        print(f"4b. Post Exclusif créé : '{p2.title}' (ID: {p2.id[:8]}...)")

        # 5. Le Fan consulte le feed AVANT abonnement
        feed_before = get_feed(current_user=fan, db=db)
        post_vip_before = next(p for p in feed_before if p.id == p2.id)
        print(f"5. Fan AVANT abonnement -> is_locked: {post_vip_before.is_locked} | media_url masqué: {post_vip_before.media_url}")
        assert post_vip_before.is_locked is True
        assert post_vip_before.media_url is None  # Protégé !

        # 6. Fan souscrit avec Orange Money via le Moteur Fictif (VIP = 10 000 F CFA)
        sub_pay = mock_checkout(
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
        print(f"6. Paiement Abonnement Réussi !")
        print(f"   Référence : {sub_pay.reference}")
        print(f"   Montant Brut : {sub_pay.gross_amount_cfa:,.0f} F CFA")
        print(f"   Commission Plateforme (20%) : {sub_pay.platform_commission_cfa:,.0f} F CFA")
        print(f"   Net Artiste (80%) : {sub_pay.net_artist_cfa:,.0f} F CFA")
        assert sub_pay.gross_amount_cfa == 10000.0
        assert sub_pay.platform_commission_cfa == 2000.0
        assert sub_pay.net_artist_cfa == 8000.0

        # 7. Le Fan consulte à nouveau le feed APRÈS abonnement
        feed_after = get_feed(current_user=fan, db=db)
        post_vip_after = next(p for p in feed_after if p.id == p2.id)
        print(f"7. Fan APRÈS abonnement -> is_locked: {post_vip_after.is_locked} | media_url déverrouillé: {post_vip_after.media_url}")
        assert post_vip_after.is_locked is False
        assert post_vip_after.media_url == "https://cdn.cdar.ci/vip_clip.mp4"

        # 8. Artiste consulte son Portefeuille
        w1 = get_artist_wallet(current_artist=artist, db=db)
        print(f"8. Portefeuille Artiste -> Solde disponible: {w1.available_balance_cfa:,.0f} F CFA")
        assert w1.available_balance_cfa == 8000.0

        # 9. Fan envoie un Pourboire de 5 000 F CFA via Wave
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
        print(f"9. Pourboire de 5 000 F CFA envoyé -> Net Artiste: {tip.net_artist_cfa:,.0f} F (80%)")
        assert tip.net_artist_cfa == 4000.0

        w2 = get_artist_wallet(current_artist=artist, db=db)
        print(f"   Nouveau Solde Artiste (8 000 + 4 000) = {w2.available_balance_cfa:,.0f} F CFA")
        assert w2.available_balance_cfa == 12000.0

        # 10. Artiste demande un Retrait Fictif Mobile Money de 10 000 F CFA vers son numéro
        payout = request_payout(
            PayoutRequestCreate(
                amount_cfa=10000.0,
                operator="orange_money",
                destination_number="+2250700112233",
                simulation_mode="instant_completed"
            ),
            current_artist=artist,
            db=db
        )
        print(f"10. Retrait Fictif Effectué !")
        print(f"    Réf Versement : {payout.reference}")
        print(f"    Montant Retiré : {payout.amount_cfa:,.0f} F CFA")
        print(f"    Statut : {payout.status}")
        assert payout.status.value == "completed"

        # 11. Vérification Solde Restant
        w3 = get_artist_wallet(current_artist=artist, db=db)
        print(f"11. Solde Restant en Poche : {w3.available_balance_cfa:,.0f} F CFA (Total retiré: {w3.total_withdrawn_cfa:,.0f} F CFA)")
        assert w3.available_balance_cfa == 2000.0
        assert w3.total_withdrawn_cfa == 10000.0

        print("\n========================================================")
        print("SUCCESS: TEST COMPLET VALIDE AVEC SUCCES A 100% !")
        print("SUCCESS: Le Moteur de Paiement & Retrait Fictif fonctionne parfaitement !")
        print("========================================================")

    finally:
        db.close()

if __name__ == "__main__":
    run_test()
