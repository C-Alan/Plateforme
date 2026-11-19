from datetime import datetime, timedelta
import random
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.services.payment_interface import BasePaymentGateway
from app.models.transaction import Transaction, TransactionType, PaymentMethod, TransactionStatus
from app.models.subscription import UserSubscription, SubscriptionTier, SubscriptionStatus
from app.models.post import ContentPurchase, Post
from app.models.wallet import ArtistWallet, PayoutRequest, PayoutStatus
from app.config import settings


class MockPaymentGateway(BasePaymentGateway):
    """
    Passerelle de paiement et de virement Mobile Money & Cartes (Orange Money, Wave, MTN MoMo).
    Gère la répartition 80% Artiste / 20% Plateforme et le déblocage en temps réel.
    """

    def _generate_txn_ref(self) -> str:
        date_str = datetime.utcnow().strftime("%Y%m")
        rand_num = random.randint(10000, 99999)
        return f"TXN-{date_str}-{rand_num}"

    def _generate_sub_ref(self, artist_id: str, fan_id: str) -> str:
        date_str = datetime.utcnow().strftime("%Y%m")
        return f"SUB-{artist_id[:4]}-{fan_id[:4]}-{date_str}"

    def _generate_achat_ref(self, fan_id: str, post_id: str) -> str:
        date_str = datetime.utcnow().strftime("%Y%m")
        return f"ACHAT-{fan_id[:4]}-{post_id[:4]}-{date_str}"

    def _generate_payout_ref(self, artist_id: str) -> str:
        date_str = datetime.utcnow().strftime("%Y%m")
        rand_num = random.randint(100, 999)
        return f"VERS-{artist_id[:4]}-{date_str}-{rand_num}"

    def process_payment(
        self,
        db: Session,
        fan_id: str,
        artist_id: str,
        transaction_type: TransactionType,
        payment_method: PaymentMethod,
        amount_cfa: float,
        meta_id: Optional[str] = None,
        simulation_mode: str = "instant_success"
    ) -> Transaction:
        # Calcul 80% Artiste / 20% Plateforme
        commission = amount_cfa * (settings.PLATFORM_COMMISSION_PERCENT / 100.0)
        net_artist = amount_cfa - commission

        txn_status = (
            TransactionStatus.SUCCESSFUL
            if simulation_mode == "instant_success"
            else TransactionStatus.FAILED
        )

        txn = Transaction(
            reference=self._generate_txn_ref(),
            fan_id=fan_id,
            artist_id=artist_id,
            transaction_type=transaction_type,
            payment_method=payment_method,
            gross_amount_cfa=amount_cfa,
            platform_commission_cfa=commission,
            net_artist_cfa=net_artist,
            status=txn_status,
            provider="mobile_money",
            meta_info=meta_id
        )
        db.add(txn)

        if txn_status == TransactionStatus.SUCCESSFUL:
            # 1. Traiter selon le type d'opération
            if transaction_type == TransactionType.SUBSCRIPTION and meta_id:
                # Création ou prolongation de l'abonnement 30 jours
                end_date = datetime.utcnow() + timedelta(days=30)
                sub = UserSubscription(
                    reference=self._generate_sub_ref(artist_id, fan_id),
                    fan_id=fan_id,
                    artist_id=artist_id,
                    tier=SubscriptionTier(meta_id),
                    price_paid_cfa=amount_cfa,
                    status=SubscriptionStatus.ACTIVE,
                    end_date=end_date
                )
                db.add(sub)

            elif transaction_type == TransactionType.PPV_PURCHASE and meta_id:
                # Déblocage de la publication unitaire
                purchase = ContentPurchase(
                    reference=self._generate_achat_ref(fan_id, meta_id),
                    fan_id=fan_id,
                    post_id=meta_id,
                    artist_id=artist_id,
                    price_paid_cfa=amount_cfa
                )
                db.add(purchase)

            elif transaction_type == TransactionType.TIP:
                # Pourboire direct
                pass

            # 2. Alimenter le portefeuille de l'artiste (+80%)
            wallet = db.query(ArtistWallet).filter(ArtistWallet.artist_id == artist_id).first()
            if not wallet:
                wallet = ArtistWallet(
                    artist_id=artist_id,
                    total_earned_cfa=net_artist,
                    total_withdrawn_cfa=0.0,
                    available_balance_cfa=net_artist
                )
                db.add(wallet)
            else:
                wallet.total_earned_cfa += net_artist
                wallet.available_balance_cfa += net_artist
                wallet.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(txn)
        return txn

    def process_payout(
        self,
        db: Session,
        artist_id: str,
        amount_cfa: float,
        operator: str,
        destination_number: str,
        simulation_mode: str = "instant_completed"
    ) -> PayoutRequest:
        if amount_cfa < settings.MIN_PAYOUT_AMOUNT:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Le montant minimum de retrait est de {settings.MIN_PAYOUT_AMOUNT:,.0f} F CFA"
            )

        wallet = db.query(ArtistWallet).filter(ArtistWallet.artist_id == artist_id).first()
        if not wallet or wallet.available_balance_cfa < amount_cfa:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Solde insuffisant pour effectuer ce retrait"
            )

        # Déduire du solde disponible
        wallet.available_balance_cfa -= amount_cfa
        wallet.total_withdrawn_cfa += amount_cfa
        wallet.updated_at = datetime.utcnow()

        payout_status = (
            PayoutStatus.COMPLETED
            if simulation_mode == "instant_completed"
            else PayoutStatus.PENDING
        )

        payout = PayoutRequest(
            reference=self._generate_payout_ref(artist_id),
            artist_id=artist_id,
            amount_cfa=amount_cfa,
            operator=operator,
            destination_number=destination_number,
            status=payout_status,
            created_at=datetime.utcnow(),
            processed_at=datetime.utcnow() if payout_status == PayoutStatus.COMPLETED else None
        )
        db.add(payout)
        db.commit()
        db.refresh(payout)
        return payout


def get_payment_gateway() -> BasePaymentGateway:
    """Factory injectant la passerelle de paiement Mobile Money active"""
    return MockPaymentGateway()
