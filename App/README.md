# 🌟 CDAR — Plateforme des Artistes & Créateurs d'Afrique

Plateforme complète de contenus exclusifs, streaming et monétisation directe pour les artistes et créateurs africains avec système de paiement et retrait Mobile Money (Orange Money, Wave, MTN, Moov).

> 📖 **Consultez le document détaillé complet :** [`PROJET_DESCRIPTIF.md`](./PROJET_DESCRIPTIF.md) pour une analyse exhaustive de chaque espace, fonctionnalité, modèle de données et architecture.

---

## 🔐 Accès Sécurisé aux Espaces par Rôles

L'accès à chaque espace est strictement conditionné par l'authentification et le **rôle utilisateur** :

| Rôle | Utilisateur Démo | Mot de passe | Espace Accessible | Fonctionnalités Clés |
| :--- | :--- | :--- | :--- | :--- |
| **Fan Libre** | `fan.abidjan@gmail.com` | `Password123!` | **Espace Fan** | Découverte des artistes, aperçus, cadenas sur exclusivités, souscription par Mobile Money fictif, envoi de pourboires (Tips), lecteur audio/vidéo immersif, paramétrage du profil personnel. |
| **Fan VIP (Déjà Abonné)** | `fan.vip@gmail.com` | `Password123!` | **Espace Fan** | Médias exclusifs déverrouillés à 100% avec watermark anti-piratage personnalisé, consultation des échéances dans *Mes Abonnements*, messagerie privée VIP avec l'artiste. |
| **Artiste Vérifié** | `didib@rapivoire.ci` | `Password123!` | **Studio Artiste** | Portefeuille en direct (solde retirable 80%), demande de retrait Mobile Money dès 5 000 F, publication multimédia (audio, vidéo, photo), gestion des 3 tarifs d'abonnement, studio de live streaming, configuration du profil et compte MoMo officiel. |
| **Artiste en Attente KYC** | `josey@music.ci` | `Password123!` | **Studio Artiste (Bridé)** | Bandeau d'attente KYC (publication en attente d'approbation administrative). |
| **Super Administrateur** | `admin@cdar.ci` | `Password123!` | **Console Admin** | Validation KYC des artistes en 1 clic, vérification des contenus sensibles (+18 ans / floutage), régie des directs (surveillance et alertes chat), suivi des revenus par artiste avec export CSV, classement officiel multi-critères, profil admin. |

---

## 📂 Architecture Modulaire

```text
App/
├── PROJET_DESCRIPTIF.md      # Documentation descriptive & explicative complète
├── README.md                 # Vue d'ensemble et guide de démarrage rapide
├── backend/                  # API FastAPI (Python 3.11 + SQLite / PostgreSQL)
│   ├── app/
│   │   ├── api/              # Endpoints sécurisés par rôles (deps.py)
│   │   │   ├── admin.py      # Modération, surveillance des lives, revenus, classement
│   │   │   ├── auth.py       # JWT, inscription, login, mise à jour des profils
│   │   │   ├── lives.py      # Télémétrie et gestion des directs
│   │   │   ├── messaging.py  # Chat en direct et messagerie VIP
│   │   │   ├── payments.py   # Simulation Mobile Money
│   │   │   ├── posts.py      # Publications et flux multimédia
│   │   │   ├── subscriptions.py # Gestion des abonnements
│   │   │   └── wallet.py     # Portefeuilles et retraits
│   │   ├── models/           # SQLAlchemy (Users, Posts, Subscriptions, Wallets, Lives)
│   │   ├── services/         # Moteur financier 80/20 & passerelle fictive
│   │   └── seed.py           # Données de démonstration pré-chargées
│   └── run.py                # Point d'entrée serveur (Port 8000)
│
└── frontend/                 # Client React Vite (Tailwind CSS)
    ├── src/
    │   ├── spaces/
    │   │   ├── fan/          # FeedView, FanMusicPlayerView, FanVideoPlayerView, LiveViewer, FanProfileView
    │   │   ├── artist/       # ArtistStudio, DashboardOverview, PostPublisher, TiersManager, LiveBroadcaster, ArtistProfileSettingsView
    │   │   ├── admin/        # AdminKycView, AdminContentModerationTab, AdminLiveMonitoringTab, AdminArtistRevenuesTab, AdminArtistRankingTab, AdminProfileSettingsView
    │   │   ├── payment/      # MockPaymentModal, PayoutModal
    │   │   └── shared/       # GuestPortal (Portail public & 1-clic demo), Navbar, AuthModal
    └── package.json          # Dépendances & scripts client (Port 3000)
```

---

## 🚀 Guide de Démarrage en 2 Terminaux

### Terminal 1 : Lancer l'API Backend
```powershell
cd c:\Users\LOU\Documents\CDAR\Plateforme\App\backend
.\.venv\Scripts\Activate.ps1
python run.py
```
* API & Documentation interactive Swagger : **http://localhost:8000/docs**

### Terminal 2 : Lancer le Frontend React
```powershell
cd c:\Users\LOU\Documents\CDAR\Plateforme\App\frontend
npm run dev
```
* Application : **http://localhost:3000**

---

## 🧪 Tests Automatisés

- **Backend (Pytest)** :
```powershell
cd App/backend
.\.venv\Scripts\python.exe -m pytest -v
```

- **Frontend (Vite Production Build)** :
```powershell
npm run build --prefix App/frontend
```
