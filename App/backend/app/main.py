from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
import app.models  # Charge tous les modèles SQLAlchemy

from app.api.auth import router as auth_router
from app.api.posts import router as posts_router
from app.api.subscriptions import router as subscriptions_router
from app.api.payments import router as payments_router
from app.api.wallet import router as wallet_router
from app.api.admin import router as admin_router
from app.api.lives import router as lives_router
from app.api.messaging import router as messaging_router
from app.api.community import router as community_router
from app.seed import seed_database_if_empty, seed_admin_demo_ecosystem
from app.database import SessionLocal, ensure_schema_updates

# Initialisation de la base de données
Base.metadata.create_all(bind=engine)
ensure_schema_updates(engine)

# Amorce des données socles si la base est vide & écosystème admin
_init_db = SessionLocal()
try:
    seed_database_if_empty(_init_db)
    seed_admin_demo_ecosystem(_init_db)
finally:
    _init_db.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
    ## 🌟 API de la Plateforme CDAR Artistes & Fans
    
    ### ⚡ Écosystème de Monétisation Créative & Mobile Money :
    - **Abonnements à 3 niveaux** : Simple, VIP, Super Fan (déverrouillage automatique en temps réel).
    - **Passerelle Mobile Money** : Orange Money, MTN MoMo, Wave et Carte Bancaire.
    - **Répartition financière automatique** : 80% Artiste / 20% Plateforme.
    - **Portefeuille & Retraits** : Versements directs Mobile Money dès 5 000 F CFA.
    - **Protection de contenu** : Restriction dynamique des flux médias (Watermark et DRM).
    """,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS pour autoriser l'application mobile et le dashboard web
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routes API v1
api_v1 = settings.API_V1_PREFIX
app.include_router(auth_router, prefix=api_v1)
app.include_router(posts_router, prefix=api_v1)
app.include_router(subscriptions_router, prefix=api_v1)
app.include_router(payments_router, prefix=api_v1)
app.include_router(wallet_router, prefix=api_v1)
app.include_router(admin_router, prefix=api_v1)
app.include_router(lives_router, prefix=api_v1)
app.include_router(messaging_router, prefix=api_v1)
app.include_router(community_router, prefix=api_v1)


@app.get("/")
def root():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "gateway": "CDAR Mobile Money Gateway",
        "docs_url": "/docs"
    }
