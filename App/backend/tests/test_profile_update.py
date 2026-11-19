import pytest
import uuid
from app.database import Base, engine, SessionLocal, ensure_schema_updates
from app.models.user import User, UserRole, KYCStatus
from app.schemas.user import UserProfileUpdate
from app.api.auth import update_my_profile
from app.services.auth_service import get_password_hash, verify_password


def test_update_profile_fan_and_artist():
    Base.metadata.create_all(bind=engine)
    ensure_schema_updates(engine)
    db = SessionLocal()

    uid = str(uuid.uuid4())[:8]

    try:
        # 1. Créer un utilisateur Fan
        fan = User(
            email=f"fan_test_{uid}@cdar.ci",
            phone_number=f"+2250700{uid[:4]}",
            hashed_password=get_password_hash("OldPassword123!"),
            role=UserRole.FAN,
            display_name="Fan Test Initial",
            country="CI"
        )
        db.add(fan)
        db.commit()
        db.refresh(fan)

        # 2. Mettre à jour son profil Fan
        update_data = UserProfileUpdate(
            display_name="Fan Test Modifié",
            country="SN",
            avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
            current_password="OldPassword123!",
            new_password="NewPassword456!"
        )
        updated_fan = update_my_profile(update_data, current_user=fan, db=db)
        assert updated_fan.display_name == "Fan Test Modifié"
        assert updated_fan.country == "SN"
        assert updated_fan.avatar_url == "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200"
        assert verify_password("NewPassword456!", updated_fan.hashed_password)

        # 3. Créer un Artiste et mettre à jour ses coordonnées de paiement Mobile Money
        artist = User(
            email=f"art_test_{uid}@cdar.ci",
            phone_number=f"+2250505{uid[:4]}",
            hashed_password=get_password_hash("ArtistPass123!"),
            role=UserRole.ARTIST,
            stage_name=f"Star_{uid}",
            category="Musique",
            country="CI",
            payout_operator="orange",
            payout_momo_number="+2250700112233"
        )
        db.add(artist)
        db.commit()
        db.refresh(artist)

        art_update = UserProfileUpdate(
            stage_name=f"SuperStar_{uid}",
            bio="Nouvelle biographie officielle de l'artiste",
            category="Danse & Chorégraphie",
            payout_operator="wave",
            payout_momo_number="+2250555998877",
            kyc_id_type="cni",
            kyc_id_document_recto_url="data:image/png;base64,mockrectodata",
            kyc_id_document_verso_url="data:image/png;base64,mockversodata"
        )
        updated_art = update_my_profile(art_update, current_user=artist, db=db)
        assert updated_art.stage_name == f"SuperStar_{uid}"
        assert updated_art.bio == "Nouvelle biographie officielle de l'artiste"
        assert updated_art.payout_operator == "wave"
        assert updated_art.payout_momo_number == "+2250555998877"
        assert updated_art.kyc_id_type == "cni"
        assert updated_art.kyc_id_document_recto_url == "data:image/png;base64,mockrectodata"
        assert updated_art.kyc_id_document_verso_url == "data:image/png;base64,mockversodata"

    finally:
        db.close()
