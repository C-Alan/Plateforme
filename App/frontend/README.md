# 📱 Frontend React — Plateforme Artistes & Fans (Architecture par Espaces)

L'architecture du frontend est désormais organisée strictement **par Espaces Métiers** dans `src/spaces/` :

```text
src/spaces/
├── fan/                 # 🧑‍🎤 Espace Fan (Consommation & Abonnements)
│   ├── FeedView.jsx              # Fil d'actualité, stories, lecteurs médias & pourboires
│   └── MySubscriptionsView.jsx   # Gestion des abonnements actifs & échéances
│
├── artist/              # 🎨 Espace Artiste (Studio Créateur & Portefeuille)
│   ├── ArtistStudio.jsx          # Hub principal de l'espace créateur
│   ├── DashboardOverview.jsx     # Vue financière (solde disponible 80%, MRR, cumul)
│   ├── PostPublisher.jsx         # Studio de publication multimédia (vidéos, audio, photos)
│   ├── TiersManager.jsx          # Paramétrage personnalisé des 3 paliers (Simple, VIP, Super Fan)
│   └── HistoryView.jsx           # Traçabilité des recettes et retraits Mobile Money
│
├── admin/               # 🛡️ Espace Modération & Administration
│   └── AdminKycView.jsx          # Console de validation des dossiers KYC créateurs
│
├── payment/             # 💳 Moteur de Paiement & Retraits Fictifs (MVP)
│   ├── MockPaymentModal.jsx      # Simulateur de paiement Orange Money, Wave, MTN, Carte
│   └── PayoutModal.jsx           # Formulaire de retrait vers compte Mobile Money (seuil 5 000 F)
│
└── shared/              # 🌐 Composants Transverses Partagés
    ├── Navbar.jsx                # Barre de navigation globale & sélecteur d'espace
    └── AuthModal.jsx             # Connexion et bascule rapide de profil test (1-clic)
```

---

## 🚀 Démarrage du Frontend

```powershell
cd App/frontend
npm run dev
```
Accessible sur : **http://localhost:3000**
