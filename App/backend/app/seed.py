from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random

from app.models.user import User, UserRole, KYCStatus
from app.models.post import Post, ContentType, Visibility
from app.models.subscription import SubscriptionTierConfig, UserSubscription, SubscriptionTier, SubscriptionStatus
from app.models.wallet import ArtistWallet, PayoutRequest, PayoutStatus
from app.models.transaction import Transaction, TransactionType, PaymentMethod, TransactionStatus
from app.models.live import LiveStream, LiveAccessType, LiveStatus, LiveChatMessage
from app.models.messaging import Conversation, DirectMessage
from app.services.auth_service import get_password_hash


def seed_database_if_empty(db: Session, force: bool = False):
    # Vérifier si les comptes principaux existent déjà
    if not force and db.query(User).filter(User.email == "admin@cdar.ci").first():
        return

    print("[SEED] Initialisation des donnees socles (Artistes, Abonnements, Publications, Portefeuilles)...")

    # 1. Super Administrateur
    admin = User(
        email="admin@cdar.ci",
        hashed_password=get_password_hash("Password123!"),
        role=UserRole.SUPER_ADMIN,
        display_name="Directeur CDAR",
        country="CI"
    )
    db.add(admin)
    db.flush()

    # 2. Artiste Vérifié (Didi B)
    artist_didib = User(
        email="didib@rapivoire.ci",
        hashed_password=get_password_hash("Password123!"),
        role=UserRole.ARTIST,
        stage_name="Didi B Official",
        category="Musique & Rap Ivoire",
        bio="Pionnier du Rap Ivoire, créateur et producteur. Découvrez ici mes morceaux inédits, clips non censurés et coulisses de tournées !",
        country="CI",
        payout_momo_number="+2250700112233",
        payout_operator="orange_money",
        kyc_status=KYCStatus.VERIFIED
    )
    db.add(artist_didib)
    db.flush()

    # Paliers d'abonnements pour Didi B
    tiers = [
        SubscriptionTierConfig(artist_id=artist_didib.id, tier=SubscriptionTier.SIMPLE, price_cfa=5000.0, description="Accès aux publications exclusives du feed"),
        SubscriptionTierConfig(artist_id=artist_didib.id, tier=SubscriptionTier.VIP, price_cfa=10000.0, description="Publications + Replays des lives 48h + Notes vocales"),
        SubscriptionTierConfig(artist_id=artist_didib.id, tier=SubscriptionTier.SUPER_FAN, price_cfa=25000.0, description="Accès VIP + Badge exclusif + Messagerie vidéo prioritaire")
    ]
    db.add_all(tiers)

    # Publications pour Didi B
    posts = [
        Post(
            reference="POST-DIDIB-202610-001",
            artist_id=artist_didib.id,
            title="Teaser Officiel — Nouvel Album 'Before History'",
            caption="Découvrez le teaser officiel ouvert à tous les fans d'Afrique et de la diaspora !",
            content_type=ContentType.VIDEO,
            visibility=Visibility.FREE,
            media_url="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
            teaser_media_url="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400",
            is_published=True
        ),
        Post(
            reference="POST-DIDIB-202610-002",
            artist_id=artist_didib.id,
            title="Session Studio Secrète & Morceau Inédit",
            caption="En exclusivité totale pour mes abonnés VIP : écoutez la première version brute du morceau enregistré à minuit.",
            content_type=ContentType.MUSIC,
            visibility=Visibility.SUBSCRIBERS,
            media_url="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
            teaser_media_url="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
            is_published=True
        ),
        Post(
            reference="POST-DIDIB-202610-003",
            artist_id=artist_didib.id,
            title="Masterclass Flow, Écriture & Business Musical",
            caption="2h de formation intensive sur la construction d'une carrière musicale indépendante en Afrique de l'Ouest.",
            content_type=ContentType.VIDEO,
            visibility=Visibility.PPV,
            price_cfa=5000.0,
            media_url="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800",
            teaser_media_url="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400",
            is_published=True
        ),
        Post(
            reference="POST-DIDIB-202610-004",
            artist_id=artist_didib.id,
            title="Backstage Concert Live au Palais de la Culture",
            caption="Ce que les caméras de télévision n'ont pas montré : coulisses de loges, stress et triomphe.",
            content_type=ContentType.VIDEO,
            visibility=Visibility.SUBSCRIBERS,
            media_url="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
            teaser_media_url="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400",
            is_published=True
        ),
    ]
    db.add_all(posts)

    # Portefeuille initial pour Didi B
    wallet = ArtistWallet(
        artist_id=artist_didib.id,
        total_earned_cfa=48000.0,
        total_withdrawn_cfa=20000.0,
        available_balance_cfa=28000.0
    )
    db.add(wallet)

    # Historique de versements pour Didi B
    payout_demo = PayoutRequest(
        reference="VERS-DIDI-202610-101",
        artist_id=artist_didib.id,
        amount_cfa=20000.0,
        operator="orange_money",
        destination_number="+2250700112233",
        status=PayoutStatus.COMPLETED,
        processed_at=datetime.utcnow() - timedelta(days=2)
    )
    db.add(payout_demo)

    # 3. Artiste en Attente KYC (Josey)
    artist_josey = User(
        email="josey@music.ci",
        hashed_password=get_password_hash("Password123!"),
        role=UserRole.ARTIST,
        stage_name="Josey",
        category="Musique Afro-Soul & Variété",
        bio="Chanteuse ivoirienne, voix d'or de la musique contemporaine. Dossier KYC en cours de validation par l'équipe CDAR.",
        country="CI",
        payout_momo_number="+2250505112233",
        payout_operator="wave",
        kyc_status=KYCStatus.PENDING
    )
    db.add(artist_josey)

    # 4. Fan 1 (Libre / Non abonné)
    fan_libre = User(
        email="fan.abidjan@gmail.com",
        hashed_password=get_password_hash("Password123!"),
        role=UserRole.FAN,
        display_name="Koffi Fan #1",
        country="CI"
    )
    db.add(fan_libre)

    # 5. Fan 2 (Abonné VIP actif)
    fan_vip = User(
        email="fan.vip@gmail.com",
        hashed_password=get_password_hash("Password123!"),
        role=UserRole.FAN,
        display_name="Amina S.",
        country="SN"
    )
    db.add(fan_vip)
    db.flush()

    sub_vip = UserSubscription(
        reference="SUB-DIDI-AMINA-202610",
        fan_id=fan_vip.id,
        artist_id=artist_didib.id,
        tier=SubscriptionTier.VIP,
        price_paid_cfa=10000.0,
        status=SubscriptionStatus.ACTIVE,
        start_date=datetime.utcnow() - timedelta(days=5),
        end_date=datetime.utcnow() + timedelta(days=25)
    )
    db.add(sub_vip)

    # Transactions d'exemple
    txn1 = Transaction(
        reference="TXN-202610-84729",
        fan_id=fan_vip.id,
        artist_id=artist_didib.id,
        transaction_type=TransactionType.SUBSCRIPTION,
        payment_method=PaymentMethod.ORANGE_MONEY,
        gross_amount_cfa=10000.0,
        platform_commission_cfa=2000.0,
        net_artist_cfa=8000.0,
        status=TransactionStatus.SUCCESSFUL,
        provider="mobile_money"
    )
    db.add(txn1)

    # 6. Live Streaming initial en direct pour Didi B
    live1 = LiveStream(
        reference=f"LIVE-DIDIB-{datetime.utcnow().strftime('%Y%m%d')}-001",
        artist_id=artist_didib.id,
        title="Live Studio Abidjan — En Direct avec Didi B",
        description="Session privée en direct : coulisses d'enregistrement du nouvel album et échange VIP !",
        access_type=LiveAccessType.SUBSCRIBERS,
        min_tier="vip",
        status=LiveStatus.LIVE,
        stream_url="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
        current_viewers=34,
        total_tips_cfa=5000.0,
        started_at=datetime.utcnow() - timedelta(minutes=25)
    )
    db.add(live1)
    db.flush()

    chat_init = [
        LiveChatMessage(
            live_id=live1.id,
            user_id=artist_didib.id,
            user_name="Didi B Official",
            user_role="artist",
            badge="artist",
            message="Bienvenue dans le studio la famille ! On est en direct d'Abidjan."
        ),
        LiveChatMessage(
            live_id=live1.id,
            user_id=fan_vip.id,
            user_name="Amina S.",
            user_role="fan",
            badge="vip",
            message="Le son tourne en boucle chez nous à Dakar ! Trop fort 🔥"
        ),
        LiveChatMessage(
            live_id=live1.id,
            user_id=fan_vip.id,
            user_name="Amina S.",
            user_role="fan",
            badge="donor",
            message="🎁 A envoyé un don en direct de 5 000 F CFA !",
            is_tip=True,
            tip_amount_cfa=5000.0
        )
    ]
    db.add_all(chat_init)

    # 7. Conversation Privée VIP initiale entre Didi B et Amina S.
    conv1 = Conversation(
        reference=f"MSG-DIDI-AMINA-{datetime.utcnow().strftime('%Y%m')}",
        artist_id=artist_didib.id,
        fan_id=fan_vip.id,
        last_message_text="Merci pour la force Amina ! On prépare du très lourd 🙏",
        last_message_at=datetime.utcnow() - timedelta(hours=2),
        unread_artist_count=0,
        unread_fan_count=0
    )
    db.add(conv1)
    db.flush()

    msg1 = DirectMessage(
        conversation_id=conv1.id,
        sender_id=fan_vip.id,
        sender_role="fan",
        message_type="text",
        content="Salut Didi ! Félicitations pour le concert au Palais de la Culture, le live était exceptionnel 🔥",
        is_read=True,
        created_at=datetime.utcnow() - timedelta(hours=4)
    )
    msg2 = DirectMessage(
        conversation_id=conv1.id,
        sender_id=artist_didib.id,
        sender_role="artist",
        message_type="voice_note",
        content="Note vocale exclusive pour les abonnés VIP",
        media_url="https://cdn.cdar.ci/audio/didi-vocal-remerciement.mp3",
        is_read=True,
        created_at=datetime.utcnow() - timedelta(hours=2)
    )
    db.add_all([msg1, msg2])

    db.commit()
    print("[SEED] Donnees socles chargees avec succes (avec Live & Messagerie VIP) !")
    
    # Amorce des données additionnelles pour l'Espace Admin (Modération & Classement)
    seed_admin_demo_ecosystem(db)


def seed_admin_demo_ecosystem(db: Session):
    """Enrichit la base avec des créateurs, publications variées (sensibles/signalées) et métriques financières"""
    # 1. Mettre à jour les statuts de sensibilité sur les posts existants de Didi B si non définis
    didib = db.query(User).filter(User.stage_name == "Didi B Official").first()
    if didib:
        didi_posts = db.query(Post).filter(Post.artist_id == didib.id).all()
        for i, p in enumerate(didi_posts):
            if not getattr(p, 'sensitivity_status', None) or p.sensitivity_status == 'safe':
                if i == 1:
                    p.sensitivity_status = "sensitive"
                    p.sensitivity_reason = "Paroles explicites & Thème adulte"
                elif i == 2:
                    p.sensitivity_status = "pending_review"
                    p.sensitivity_reason = "Vérification automatisée droits audio"
                elif i == 3:
                    p.sensitivity_status = "flagged"
                    p.sensitivity_reason = "Signalement communauté : Scène de foule dense"
                    p.reported_count = 2
                else:
                    p.sensitivity_status = "safe"

    # 2. Créer Roseline Layo si absente
    if not db.query(User).filter(User.email == "roselinelayo@music.ci").first():
        artist_roseline = User(
            email="roselinelayo@music.ci",
            hashed_password=get_password_hash("Password123!"),
            role=UserRole.ARTIST,
            stage_name="Roseline Layo",
            category="Afro-Soul & Variété",
            bio="Voix d'or de la chanson ivoirienne. Partage de mes répétitions privées, clips exclusifs et concerts.",
            country="CI",
            payout_momo_number="+2250708998877",
            payout_operator="orange_money",
            kyc_status=KYCStatus.VERIFIED
        )
        db.add(artist_roseline)
        db.flush()

        # Portefeuille Roseline
        db.add(ArtistWallet(
            artist_id=artist_roseline.id,
            total_earned_cfa=92000.0,
            total_withdrawn_cfa=40000.0,
            available_balance_cfa=52000.0
        ))

        # Publications Roseline
        db.add_all([
            Post(
                reference="POST-ROSE-202611-001",
                artist_id=artist_roseline.id,
                title="Concert Acoustique 'Donnez-nous un peu' Live Abidjan",
                caption="Enregistrement haute définition en direct de la salle Anoumabo.",
                content_type=ContentType.MUSIC,
                visibility=Visibility.FREE,
                media_url="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
                sensitivity_status="safe",
                is_published=True
            ),
            Post(
                reference="POST-ROSE-202611-002",
                artist_id=artist_roseline.id,
                title="Coulisses Loges & Séance Préparation",
                caption="Moments intimes avant l'entrée en scène avec mes choristes.",
                content_type=ContentType.PHOTO,
                visibility=Visibility.SUBSCRIBERS,
                media_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800",
                sensitivity_status="sensitive",
                sensitivity_reason="Tenue légère en coulisses (Floutage actif)",
                reported_count=1,
                is_published=True
            ),
            Post(
                reference="POST-ROSE-202611-003",
                artist_id=artist_roseline.id,
                title="Titre Inédit 'Chandelier d'Afrique' (Version Master)",
                caption="Master audio débloquable en avant-première.",
                content_type=ContentType.MUSIC,
                visibility=Visibility.PPV,
                price_cfa=2000.0,
                media_url="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800",
                sensitivity_status="safe",
                is_published=True
            )
        ])

        # Transactions d'exemple Roseline
        fan_vip = db.query(User).filter(User.email == "fan.vip@gmail.com").first()
        if fan_vip:
            db.add(Transaction(
                reference="TXN-ROSE-89102",
                fan_id=fan_vip.id,
                artist_id=artist_roseline.id,
                transaction_type=TransactionType.SUBSCRIPTION,
                payment_method=PaymentMethod.ORANGE_MONEY,
                gross_amount_cfa=10000.0,
                platform_commission_cfa=2000.0,
                net_artist_cfa=8000.0,
                status=TransactionStatus.SUCCESSFUL,
                provider="mobile_money"
            ))

    # 3. Créer Suspect 95 si absent
    if not db.query(User).filter(User.email == "suspect95@rapivoire.ci").first():
        artist_suspect = User(
            email="suspect95@rapivoire.ci",
            hashed_password=get_password_hash("Password123!"),
            role=UserRole.ARTIST,
            stage_name="Suspect 95",
            category="Musique & Rap Ivoire",
            bio="Président du Syndicat, freestyles percutants, punchlines et engagement.",
            country="CI",
            payout_momo_number="+2250504112233",
            payout_operator="wave",
            kyc_status=KYCStatus.VERIFIED
        )
        db.add(artist_suspect)
        db.flush()

        db.add(ArtistWallet(
            artist_id=artist_suspect.id,
            total_earned_cfa=68000.0,
            total_withdrawn_cfa=25000.0,
            available_balance_cfa=43000.0
        ))

        db.add(Post(
            reference="POST-SUSPECT-202611-001",
            artist_id=artist_suspect.id,
            title="Freestyle 'Vérités du Syndicat' Non Censuré",
            caption="Texte direct et sans compromis sur la vie quotidienne à Abidjan.",
            content_type=ContentType.VIDEO,
            visibility=Visibility.PPV,
            price_cfa=1500.0,
            media_url="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800",
            sensitivity_status="flagged",
            sensitivity_reason="Signalement : Langage cru & Allusions sensibles",
            reported_count=3,
            moderation_note="En attente de confirmation de classification +18",
            is_published=True
        ))

    # 4. Créer Dakar Afro Dance si absent
    if not db.query(User).filter(User.email == "afrodance@dakar.sn").first():
        artist_dance = User(
            email="afrodance@dakar.sn",
            hashed_password=get_password_hash("Password123!"),
            role=UserRole.ARTIST,
            stage_name="Dakar Afro Dance",
            category="Danse & Chorégraphie",
            bio="Collectif de danse urbaine et traditionnelle sénégalaise.",
            country="SN",
            payout_momo_number="+221770001122",
            payout_operator="wave",
            kyc_status=KYCStatus.VERIFIED
        )
        db.add(artist_dance)
        db.flush()

        db.add(ArtistWallet(
            artist_id=artist_dance.id,
            total_earned_cfa=38000.0,
            total_withdrawn_cfa=15000.0,
            available_balance_cfa=23000.0
        ))

        db.add(Post(
            reference="POST-DANCE-202611-001",
            artist_id=artist_dance.id,
            title="Battle Afro-House sur la Corniche de Dakar",
            caption="Énergie pure au coucher du soleil à Dakar.",
            content_type=ContentType.VIDEO,
            visibility=Visibility.SUBSCRIBERS,
            media_url="https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800",
            sensitivity_status="safe",
            is_published=True
        ))

    # 5. Créer Shado Chris Prod si absent
    if not db.query(User).filter(User.email == "shado@beatmaker.ci").first():
        artist_shado = User(
            email="shado@beatmaker.ci",
            hashed_password=get_password_hash("Password123!"),
            role=UserRole.ARTIST,
            stage_name="Shado Chris Prod",
            category="Masterclass & Production",
            bio="Compositeur & Producteur multi-disques d'or en Afrique de l'Ouest.",
            country="CI",
            payout_momo_number="+2250102030405",
            payout_operator="mtn",
            kyc_status=KYCStatus.VERIFIED
        )
        db.add(artist_shado)
        db.flush()

        db.add(ArtistWallet(
            artist_id=artist_shado.id,
            total_earned_cfa=115000.0,
            total_withdrawn_cfa=50000.0,
            available_balance_cfa=65000.0
        ))

        db.add(Post(
            reference="POST-SHADO-202611-001",
            artist_id=artist_shado.id,
            title="Masterclass Mixage & Mastering Rap Africain",
            caption="Toutes les techniques de studio révélées pas à pas.",
            content_type=ContentType.VIDEO,
            visibility=Visibility.PPV,
            price_cfa=5000.0,
            media_url="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800",
            sensitivity_status="safe",
            is_published=True
        ))

    db.commit()


if __name__ == "__main__":
    from app.database import SessionLocal, Base, engine
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        seed_database_if_empty(session)
    finally:
        session.close()

