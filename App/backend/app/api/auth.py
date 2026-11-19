from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole, KYCStatus
from app.models.subscription import SubscriptionTierConfig, SubscriptionTier
from app.schemas.user import (
    UserRegisterFan, UserRegisterArtist, UserLogin, TokenResponse, UserProfileResponse, UserProfileUpdate
)
from app.services.auth_service import get_password_hash, verify_password, create_access_token
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentification & Profils"])


@router.post("/register/fan", response_model=TokenResponse)
def register_fan(data: UserRegisterFan, db: Session = Depends(get_db)):
    if data.email and db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
    if data.phone_number and db.query(User).filter(User.phone_number == data.phone_number).first():
        raise HTTPException(status_code=400, detail="Ce numéro de téléphone est déjà utilisé")

    user = User(
        email=data.email,
        phone_number=data.phone_number,
        hashed_password=get_password_hash(data.password),
        role=UserRole.FAN,
        display_name=data.display_name,
        country=data.country
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "role": user.role.value})
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        role=user.role,
        display_or_stage_name=user.display_name
    )


@router.post("/register/artist", response_model=TokenResponse)
def register_artist(data: UserRegisterArtist, db: Session = Depends(get_db)):
    if data.email and db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
    if data.phone_number and db.query(User).filter(User.phone_number == data.phone_number).first():
        raise HTTPException(status_code=400, detail="Ce numéro de téléphone est déjà utilisé")
    if db.query(User).filter(User.stage_name == data.stage_name).first():
        raise HTTPException(status_code=400, detail="Ce nom de scène est déjà pris")

    user = User(
        email=data.email,
        phone_number=data.phone_number,
        hashed_password=get_password_hash(data.password),
        role=UserRole.ARTIST,
        stage_name=data.stage_name,
        category=data.category,
        bio=data.bio,
        country=data.country,
        avatar_url=data.avatar_url,
        kyc_id_type=data.kyc_id_type or "cni",
        kyc_id_document_recto_url=data.kyc_id_document_recto_url,
        kyc_id_document_verso_url=data.kyc_id_document_verso_url,
        kyc_id_document_url=data.kyc_id_document_recto_url or data.kyc_id_document_verso_url,
        payout_momo_number=data.payout_momo_number,
        payout_operator=data.payout_operator,
        kyc_status=KYCStatus.PENDING  # En attente de validation KYC
    )
    db.add(user)
    db.flush()

    # Initialiser les 3 offres d'abonnement par défaut pour cet artiste
    default_tiers = [
        (SubscriptionTier.SIMPLE, 5000.0, "Accès aux publications abonnés"),
        (SubscriptionTier.VIP, 10000.0, "Accès publications + replays lives + vocal"),
        (SubscriptionTier.SUPER_FAN, 25000.0, "Accès total + badge exclusif + messagerie complète"),
    ]
    for tier, price, desc in default_tiers:
        tier_cfg = SubscriptionTierConfig(
            artist_id=user.id,
            tier=tier,
            price_cfa=price,
            description=desc
        )
        db.add(tier_cfg)

    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "role": user.role.value})
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        role=user.role,
        display_or_stage_name=user.stage_name
    )


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.email == data.login) | (User.phone_number == data.login)
    ).first()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants incorrects"
        )

    token = create_access_token({"sub": user.id, "role": user.role.value})
    name = user.stage_name if user.role == UserRole.ARTIST else user.display_name
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        role=user.role,
        display_or_stage_name=name
    )


@router.get("/me", response_model=UserProfileResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserProfileResponse)
@router.patch("/me", response_model=UserProfileResponse)
def update_my_profile(
    data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Met à jour les informations et coordonnées personnelles de l'utilisateur connecté (Fan, Artiste, Admin)"""
    # 1. Vérification d'unicité de l'email si modifié
    if data.email is not None and data.email != current_user.email:
        if data.email.strip() != "":
            existing = db.query(User).filter(User.email == data.email, User.id != current_user.id).first()
            if existing:
                raise HTTPException(status_code=400, detail="Cette adresse email est déjà associée à un autre compte")
            current_user.email = data.email

    # 2. Vérification d'unicité du numéro de téléphone si modifié
    if data.phone_number is not None and data.phone_number != current_user.phone_number:
        if data.phone_number.strip() != "":
            existing = db.query(User).filter(User.phone_number == data.phone_number, User.id != current_user.id).first()
            if existing:
                raise HTTPException(status_code=400, detail="Ce numéro de téléphone est déjà associé à un autre compte")
            current_user.phone_number = data.phone_number

    # 3. Vérification du nom de scène si artiste
    if data.stage_name is not None and current_user.role == UserRole.ARTIST and data.stage_name != current_user.stage_name:
        existing = db.query(User).filter(User.stage_name == data.stage_name, User.id != current_user.id).first()
        if existing:
            raise HTTPException(status_code=400, detail="Ce nom de scène est déjà pris")
        current_user.stage_name = data.stage_name

    # 4. Mise à jour des champs communs
    if data.display_name is not None:
        current_user.display_name = data.display_name

    if data.country is not None:
        current_user.country = data.country

    if data.avatar_url is not None:
        current_user.avatar_url = data.avatar_url

    # 5. Champs spécifiques artistes
    if current_user.role == UserRole.ARTIST:
        if data.bio is not None:
            current_user.bio = data.bio
        if data.category is not None:
            current_user.category = data.category
        if data.banner_url is not None:
            current_user.banner_url = data.banner_url
        if data.payout_momo_number is not None:
            current_user.payout_momo_number = data.payout_momo_number
        if data.payout_operator is not None:
            current_user.payout_operator = data.payout_operator
        if data.kyc_id_type is not None:
            current_user.kyc_id_type = data.kyc_id_type
        if data.kyc_id_document_recto_url is not None:
            current_user.kyc_id_document_recto_url = data.kyc_id_document_recto_url
        if data.kyc_id_document_verso_url is not None:
            current_user.kyc_id_document_verso_url = data.kyc_id_document_verso_url
        if data.kyc_id_document_url is not None:
            current_user.kyc_id_document_url = data.kyc_id_document_url
        elif data.kyc_id_document_recto_url is not None:
            current_user.kyc_id_document_url = data.kyc_id_document_recto_url

    # 6. Mise à jour du mot de passe si demandé
    if data.new_password:
        if not data.current_password or not verify_password(data.current_password, current_user.hashed_password):
            raise HTTPException(status_code=400, detail="Le mot de passe actuel est incorrect")
        current_user.hashed_password = get_password_hash(data.new_password)

    db.commit()
    db.refresh(current_user)
    return current_user

