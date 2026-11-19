# 🎵 Backend API — Plateforme Artistes & Fans (MVP)

Backend FastAPI avec **moteur de paiement et de retrait fictif (Mock Engine)** intégré pour le MVP.

---

## ⚡ Fonctionnalités Clés Implémentées

1. **Authentification & Gestion des Rôles**
   - Inscription Fan (`/api/v1/auth/register/fan`)
   - Inscription Artiste avec KYC (`/api/v1/auth/register/artist`)
   - Connexion JWT (`/api/v1/auth/login`)
   - Validation KYC Admin (`/api/v1/admin/approve-artist/{artist_id}`)

2. **Publications & Protection des Médias**
   - Création de publications Vidéo, Photo, Musique, Podcast (`/api/v1/posts/`)
   - Filtrage d'accès automatique :
     - Posts gratuits : visibles par tous.
     - Posts abonnés : `media_url` masqué si le fan n'a pas d'abonnement actif.
     - Posts payants à l'unité (PPV) : débloqués uniquement après achat.

3. **Moteur Économique & Paiements Fictifs (Mock Engine)**
   - Passerelle simulée (`/api/v1/payments/mock-checkout`) pour Orange Money, MTN, Wave et Carte.
   - Calcul automatique strict : **80% Net Artiste / 20% Commission Plateforme**.
   - Déverrouillage automatique des abonnements (validité 30 jours) et des achats PPV.
   - Envoi de pourboires directs (`/api/v1/payments/tip`).

4. **Portefeuille Virtuel & Retraits Fictifs**
   - Consultation du solde disponible (`/api/v1/wallet/balance`).
   - Demande de retrait Mobile Money (`/api/v1/wallet/payout-request`) dès 5 000 F CFA.
   - Débit immédiat du solde disponible et génération des références normalisées (`VERS-...`, `TXN-...`).

---

## 🚀 Démarrage Rapide

### 1. Activer l'environnement virtuel
```powershell
cd App/backend
.\.venv\Scripts\Activate.ps1
```

### 2. Lancer le serveur d'API
```powershell
python run.py
```
Le serveur démarre sur `http://localhost:8000`.

- Documentation interactive Swagger : **http://localhost:8000/docs**
- Documentation ReDoc : **http://localhost:8000/redoc**

---

## 🧪 Lancer les Tests Automatisés

```powershell
pytest -v
```
Ou exécuter le script de démonstration complet :
```powershell
python tests/test_direct_cycle.py
```

