from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.transaction import Transaction, PaymentMethod, TransactionType


class BasePaymentGateway(ABC):
    """Contrat d'interface pour les passerelles de paiement (Mock, Flutterwave, Wave, Stripe)"""

    @abstractmethod
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
        """Exécute ou simule un encaissement fan -> artiste"""
        pass

    @abstractmethod
    def process_payout(
        self,
        db: Session,
        artist_id: str,
        amount_cfa: float,
        operator: str,
        destination_number: str,
        simulation_mode: str = "instant_completed"
    ) -> Any:
        """Exécute ou simule un versement plateforme -> artiste Mobile Money"""
        pass

