from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.user import UserRole, KYCStatus


class UserRegisterFan(BaseModel):
    phone_number: Optional[str] = None
    email: Optional[str] = None
    password: str
    display_name: str
    country: str = "CI"


class UserRegisterArtist(BaseModel):
    phone_number: Optional[str] = None
    email: Optional[str] = None
    password: str
    stage_name: str
    category: str
    bio: Optional[str] = None
    country: str = "CI"
    payout_momo_number: str
    payout_operator: str  # orange, mtn, wave
    avatar_url: Optional[str] = None  # Photo de profil de l'artiste
    kyc_id_type: Optional[str] = "cni"  # CNI, Passeport, Permis, etc.
    kyc_id_document_recto_url: Optional[str] = None  # Photo Recto de la pièce légale
    kyc_id_document_verso_url: Optional[str] = None  # Photo Verso de la pièce légale


class UserLogin(BaseModel):
    login: str  # email ou numéro de téléphone
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: UserRole
    display_or_stage_name: Optional[str] = None


class UserProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    country: Optional[str] = None
    avatar_url: Optional[str] = None
    # Spécifique Artiste
    stage_name: Optional[str] = None
    bio: Optional[str] = None
    category: Optional[str] = None
    banner_url: Optional[str] = None
    payout_momo_number: Optional[str] = None
    payout_operator: Optional[str] = None
    # Mise à jour KYC / Pièce légale
    kyc_id_type: Optional[str] = None
    kyc_id_document_recto_url: Optional[str] = None
    kyc_id_document_verso_url: Optional[str] = None
    kyc_id_document_url: Optional[str] = None
    # Mot de passe éventuel
    current_password: Optional[str] = None
    new_password: Optional[str] = None


class UserProfileResponse(BaseModel):
    id: str
    email: Optional[str] = None
    phone_number: Optional[str] = None
    role: UserRole
    country: str
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    stage_name: Optional[str] = None
    bio: Optional[str] = None
    category: Optional[str] = None
    banner_url: Optional[str] = None
    kyc_status: KYCStatus
    kyc_id_type: Optional[str] = None
    kyc_id_document_recto_url: Optional[str] = None
    kyc_id_document_verso_url: Optional[str] = None
    kyc_id_document_url: Optional[str] = None
    payout_momo_number: Optional[str] = None
    payout_operator: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ArtistPublicResponse(BaseModel):
    id: str
    stage_name: str
    category: Optional[str] = None
    bio: Optional[str] = None
    country: Optional[str] = "CI"
    avatar_url: Optional[str] = None
    kyc_status: KYCStatus
    post_count: int = 0
    min_tier_price_cfa: Optional[float] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

