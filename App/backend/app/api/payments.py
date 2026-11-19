from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.transaction import TransactionType, PaymentMethod
from app.schemas.payment import PaymentRequest, MockPaymentRequest, TipRequest, TransactionResponse
from app.services.mock_payment_gateway import get_payment_gateway
from app.api.deps import get_current_user

router = APIRouter(prefix="/payments", tags=["Paiements & Transactions"])


@router.post("/checkout", response_model=TransactionResponse)
def checkout(
    data: PaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Règlement sécurisé Mobile Money (Orange, Wave, MTN) ou Carte Bancaire.
    - Calcule automatiquement les 80% net pour l'artiste et 20% pour la plateforme.
    - Débloque instantanément le contenu (Abonnement 30 jours ou Ticket PPV).
    - Crédite le portefeuille de l'artiste bénéficiaire.
    """
    if data.amount_cfa <= 0:
        raise HTTPException(status_code=400, detail="Montant invalide")

    gateway = get_payment_gateway()
    txn = gateway.process_payment(
        db=db,
        fan_id=current_user.id,
        artist_id=data.artist_id,
        transaction_type=data.transaction_type,
        payment_method=data.payment_method,
        amount_cfa=data.amount_cfa,
        meta_id=data.meta_id,
        simulation_mode=data.simulation_mode
    )
    return txn


@router.post("/mock-checkout", response_model=TransactionResponse, include_in_schema=False)
def mock_checkout(
    data: MockPaymentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return checkout(data=data, current_user=current_user, db=db)


@router.post("/tip", response_model=TransactionResponse)
def send_tip(
    data: TipRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Envoi d'un pourboire direct à un artiste (min 100 F CFA)"""
    if data.amount_cfa < 100.0:
        raise HTTPException(status_code=400, detail="Le pourboire minimum est de 100 F CFA")

    gateway = get_payment_gateway()
    txn = gateway.process_payment(
        db=db,
        fan_id=current_user.id,
        artist_id=data.artist_id,
        transaction_type=TransactionType.TIP,
        payment_method=data.payment_method,
        amount_cfa=data.amount_cfa,
        meta_id="tip",
        simulation_mode=data.simulation_mode
    )
    return txn
