from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.subscription import SubscriptionTierConfig, UserSubscription
from app.models.user import User
from app.schemas.subscription import TierConfigResponse, TierConfigCreateOrUpdate, SubscriptionResponse
from app.api.deps import get_current_user, require_artist

router = APIRouter(prefix="/subscriptions", tags=["Abonnements"])


@router.get("/artist/{artist_id}/tiers", response_model=List[TierConfigResponse])
def get_artist_subscription_tiers(artist_id: str, db: Session = Depends(get_db)):
    """Affiche les 3 offres (Simple, VIP, Super Fan) configurées par un artiste"""
    tiers = db.query(SubscriptionTierConfig).filter(
        SubscriptionTierConfig.artist_id == artist_id,
        SubscriptionTierConfig.is_active == True
    ).all()
    return tiers


@router.put("/my-tiers", response_model=List[TierConfigResponse])
def update_my_tiers(
    configs: List[TierConfigCreateOrUpdate],
    current_artist: User = Depends(require_artist),
    db: Session = Depends(get_db)
):
    """Permet à l'artiste de modifier le tarif de ses offres"""
    results = []
    for item in configs:
        if item.price_cfa < 1000.0 or item.price_cfa > 100000.0:
            raise HTTPException(
                status_code=400,
                detail="Le prix d'un palier doit être compris entre 1 000 F et 100 000 F CFA"
            )
        existing = db.query(SubscriptionTierConfig).filter(
            SubscriptionTierConfig.artist_id == current_artist.id,
            SubscriptionTierConfig.tier == item.tier
        ).first()

        if existing:
            existing.price_cfa = item.price_cfa
            existing.description = item.description
            results.append(existing)
        else:
            cfg = SubscriptionTierConfig(
                artist_id=current_artist.id,
                tier=item.tier,
                price_cfa=item.price_cfa,
                description=item.description
            )
            db.add(cfg)
            results.append(cfg)

    db.commit()
    for r in results:
        db.refresh(r)
    return results


@router.get("/my-subscriptions", response_model=List[SubscriptionResponse])
def get_fan_subscriptions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retourne la liste des abonnements actifs du fan"""
    subs = db.query(UserSubscription).filter(
        UserSubscription.fan_id == current_user.id
    ).all()
    return subs

