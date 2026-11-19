# 🌍 CDAR — Plateforme des Artistes & Créateurs d'Afrique
## Document Descriptif, Explicatif et Technique du Projet

---

## 1. 🎯 Présentation Générale & Vision du Projet

**CDAR (Collectif & Diffusion des Artistes Révélés)** est une plateforme numérique innovante dédiée à la visibilité, la valorisation et la **monétisation directe** des artistes, musiciens et créateurs de contenu africains (Côte d'Ivoire, Sénégal, Cameroun, etc.).

### Problématiques résolues :
- **Difficulté de monétisation locale** : Les plateformes internationales majeures (Patreon, OnlyFans, Spotify) n'intègrent pas nativement les modes de paiement usuels en Afrique francophone et prélèvent des commissions élevées.
- **Piratage et pillage de contenu** : Manque d'outils de protection des œuvres (marquage anti-piratage, accès conditionné).
- **Barrière d'accès pour les fans** : Nécessité de disposer d'une carte bancaire internationale, alors que **plus de 85% des transactions numériques en Afrique de l'Ouest s'effectuent par Mobile Money**.

### Solution CDAR :
1. **Économie équitable 80/20** : 80% des revenus générés (abonnements, pourboires, vidéos pay-per-view) sont directement crédités sur le portefeuille de l'artiste. CDAR ne prélève que 20% pour l'hébergement, la sécurité et l'infrastructure.
2. **Paiements & Retraits Mobile Money natifs** : Intégration simulée complète d'**Orange Money**, **Wave**, **MTN MoMo** et **Moov Money** en Franc CFA (XOF / F CFA), avec retraits possibles dès 5 000 F CFA.
3. **Protection des contenus & Watermarking dynamique** : Marquage visuel nominatif et horodaté sur les flux et médias exclusifs pour dissuader le piratage.
4. **Modération & Sensibilité des flux** : Contrôle strict des contenus sensibles (+18 ans avec avertissement et floutage teaser préventif) et surveillance en temps réel des diffusions en direct (Lives).
5. **Expérience utilisateur immersive & bilingue graphique** : Support complet du **Thème Sombre** (dark glassmorphism, néons violet/ambre) et du **Thème Clair** (épuré, contrasté et lisible).

---

## 2. 🏛️ Architecture des Espaces Utilisateurs

L'application est architecturée autour d'un contrôle d'accès strict par rôle (**Role-Based Access Control - RBAC**). Chaque utilisateur accède à un espace adapté à ses droits et besoins :

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        PORTAIL PUBLIC / GUEST                          │
│  - Vitrine des artistes & carrousel immersif                           │
│  - Connexion 1-Clic Démo & inscription avec choix de rôle               │
└──────────────────┬─────────────────┬──────────────────┬────────────────┘
                   │                 │                  │
        ┌──────────┴────────┐        │         ┌────────┴────────┐
        ▼                   ▼        ▼         ▼                 ▼
 ┌─────────────┐     ┌──────────────┐     ┌──────────────┐  ┌──────────────┐
 │ ESPACE FAN  │     │ESPACE ARTISTE│     │ ESPACE ADMIN │  │ESPACE PAYMENT│
 │  (Audience) │     │  (Créateur)  │     │ (Gouvernance)│  │ (Passerelle) │
 └─────────────┘     └──────────────┘     └──────────────┘  └──────────────┘
```

---

## 3. 👥 Description Détaillée des Espaces & Fonctionnalités

### 3.1. 🌐 Portail Public & Visiteur (`spaces/shared/GuestPortal.jsx`)
Point d'entrée de la plateforme pour les internautes non authentifiés :
- **Carrousel Découverte & Vitrine** : Mise en avant dynamique des artistes phares, de leurs derniers titres et de leurs statistiques de popularité.
- **Accès Rapide « 1-Clic Démo »** : Sélecteur instantané permettant d'endosser n'importe quel rôle pour tester la plateforme :
  - *Fan Libre* (non abonné, cadenas sur exclusivités)
  - *Fan VIP* (abonné actif à Didi B, accès déverrouillé)
  - *Artiste Vérifié* (Didi B, studio complet actif)
  - *Artiste en attente KYC* (Josey, studio bridé en attente de validation)
  - *Super Administrateur* (accès complet à la console de régie)
- **Formulaire d'Inscription Artiste Complet Intégré (`GuestPortal.jsx` & `AuthModal.jsx`)** : 
  - Formulaire de connexion / inscription sécurisé par JWT accessible directement depuis la carte d'accueil (`GuestPortal.jsx`) ou la modale globale (`AuthModal.jsx`).
  - **Formulaire d'inscription Artiste enrichi et exhaustif** :
    - **1. Identité Créateur & Discipline** : Nom de scène officiel (nom public), Nom d'état civil réel (pour conformité légale et financière), Catégorie/discipline artistique (Musique, Rap, Soul, Humour, Danse, DJing, Arts visuels, Mode), Pays de création et résidence (Côte d'Ivoire, Sénégal, Cameroun, Mali, RD Congo, Burkina Faso, Togo, Bénin, France, etc.).
    - **2. Coordonnées de Contact & Sécurité** : Adresse email officielle de l'artiste/management (notifications, relevés financiers), Numéro de téléphone mobile direct / WhatsApp (indicatif pays pré-sélectionné), Mot de passe sécurisé.
    - **3. Photo de Profil Officielle** : Zone interactive de téléversement (glisser-déposer ou clic) avec prévisualisation immédiate en temps réel.
    - **4. Dossier de Vérification KYC (Pièce Légale Recto-Verso)** : Choix du type de document officiel (Carte Nationale d'Identité CNI, Passeport biométrique, Permis de conduire, Carte consulaire) + Téléversement distinct et vérifié de la **Photo RECTO** et de la **Photo VERSO** avec contrôle d'intégrité visuel.
    - **5. Coordonnées de Versement Mobile Money (80% Net)** : Opérateur de paiement privilégié (*Orange Money, Wave, MTN MoMo, Moov Money*) et numéro de compte de versement direct.
    - **6. Biographie & Présentation** : Présentation textuelle du parcours et de la vision artistique.
  - Mise en attente automatique pour instruction par le Super Administrateur, redirigeant le nouvel artiste vers l'écran d'attente sécurisé `ArtistPendingValidationView.jsx`.

---

### 3.2. 🎧 Espace Fan (`spaces/fan/`)
Conçu pour offrir aux passionnés de culture africaine une expérience fluide, interactive et exclusive avec leurs artistes préférés :

1. **Fil d'Actualité & Découverte (`FeedView.jsx`)** :
   - **Bandeau défilant Stories & Lives** : Cartes animées horizontales permettant en 1 clic de regarder une story ou de rejoindre un live stream en cours.
   - **Filtres multimédias** : Navigation instantanée par type de contenu (*Tous, Musiques, Vidéos, Exclusivités VIP, Directs*).
   - **Cartes de contenu intelligentes** :
     - Pour les contenus gratuits : lecture et visionnage immédiats.
     - Pour les contenus VIP / Pay-Per-View : affichage d'un cadenas, du tarif en F CFA, et d'un bouton d'action contextuel (*« Débloquer par Mobile Money »* ou *« S'abonner »*).
     - Détection des contenus sensibles avec avertissement visuel (+18 ans).

2. **Lecteur Musical Dédié & Écoute Continue Persistante (`FanMusicPlayerView.jsx` & `AudioPlayerContext.jsx`)** :
   - Interface inspirée des standards du streaming moderne.
   - **Écoute Continue Persistante en Arrière-Plan** : lorsqu'un fan lance une musique, celle-ci continue de jouer sans interruption même s'il change d'onglet (*Explorer, Actualité, Podium, Chat VIP, Profil Artiste, Abonnements*).
   - **Mini-Lecteur Flottant au Bas de l'Écran (`GlobalMiniAudioPlayer.jsx`)** :
     - Affichage de la pochette rotative, titre du morceau, nom de l'artiste et badge VIP.
     - Barre de progression interactive fine en haut du composant (cliquable pour avancer/reculer).
     - Commandes directes : **Précédent ($\mathtt{SkipBack}$)**, **Play / Pause ($\mathtt{Play/Pause}$)**, **Suivant ($\mathtt{SkipForward}$)**.
     - Réglage du son / Sourdine ($\mathtt{Mute}$) et fermeture rapide ($\mathtt{X}$).
     - Clic sur la carte pour rouvrir instantanément le grand lecteur vinyle immersif.
   - Bouton de pourboire direct (Tip Mobile Money) pour soutenir l'artiste pendant l'écoute.

3. **Lecteur Vidéo Dédié (`FanVideoPlayerView.jsx`)** :
   - Écran de visionnage optimisé format cinéma avec support grand écran.
   - File de vidéos recommandées de l'artiste.
   - Badge d'accès (Gratuit ou VIP) et filigrane de protection anti-enregistrement.

4. **Profil Artiste Vu par le Fan (`ArtistProfileFanView.jsx`)** :
   - Bannière grand format, avatar, biographie, pays, genre musical et réseaux sociaux.
   - **Grille des 3 Paliers d'Abonnement** (Tier 1 Simple, Tier 2 VIP, Tier 3 Super Fan) détaillant les tarifs et les privilèges associés.
   - Onglets de tri des contenus de l'artiste (Musiques, Vidéos, Photos, Exclusivités).

5. **Gestionnaire des Abonnements (`MySubscriptionsView.jsx`)** :
   - Répertoire de tous les artistes auxquels le fan est actuellement abonné.
   - Affichage du statut, de la date de prochaine échéance et du montant mensuel.
   - Renouvellement ou annulation d'abonnement en un clic.

6. **Salle de Diffusion Live & Pourboires (`LiveViewer.jsx`)** :
   - Immersion totale dans les concerts et sessions privées en direct.
   - Chat interactif en direct avec les autres spectateurs et l'artiste.
   - **Envoi de pourboires Mobile Money (Tips)** avec animation à l'écran (ex: 500 F, 2 000 F, 10 000 F CFA).
   - Réception en temps réel des avertissements officiels de la modération.

7. **Messagerie Privée VIP (`FanVipChat.jsx`)** :
   - Canal de discussion directe et privilégiée entre le fan VIP et son idole.

8. **Classement Officiel des Artistes (`spaces/shared/ArtistLeaderboard.jsx`)** :
   - Accessible depuis la barre de navigation Fan, la barre mobile et la page Découverte.
   - **Podium Top 3 interactif** (#1 Or avec couronne animée, #2 Argent, #3 Bronze).
   - Filtres par popularité, abonnés VIP, publications, catégorie musicale et pays.
   - Accès direct en un clic au profil complet ou à la souscription d'abonnement.

9. **Paramètres du Profil Fan (`FanProfileView.jsx`)** :
   - Configuration du nom complet, nom d'utilisateur, téléphone et email.
   - Choix de l'opérateur Mobile Money par défaut (*Orange, Wave, MTN, Moov*).
   - Gestion des notifications et bascule de thème (Clair / Sombre).

---

### 3.3. 🎨 Espace Artiste / Studio Créateur (`spaces/artist/`)
Le centre de pilotage professionnel où les artistes gèrent leur communauté et maximisent leurs revenus :

0. **Contrôle d'Accès & Écran d'Attente de Validation KYC (`ArtistPendingValidationView.jsx`)** :
   - **Isolation stricte tant que le profil n'est pas validé par un administrateur** :
     - **Aucune vue opérationnelle du studio n'est accessible** (aucun tableau de bord, onglet de publication, régie de direct ou messagerie).
     - **Écran d'attente solennel** : Message proéminent *« Vous êtes en attente de validation »* avec badge statutaire et explications sur la vérification en cours par la régie.
     - **Récapitulatif fidèle et exhaustif des informations fournies lors de l'inscription** :
       - Photo de profil de l'artiste (agrandissable par clic).
       - Nom de scène officiel, discipline/catégorie et pays de rattachement.
       - Coordonnées de contact privé (email et téléphone).
       - Coordonnées de retrait Mobile Money (opérateur choisi et numéro de versement 80%).
       - Pièce légale d'identité avec visualisation des photos **Recto et Verso** transmises.
     - Boutons contextuels pour *« Vérifier mon statut »* (actualisation en direct dès qu'un admin valide) et *« Se déconnecter »*.

1. **Tableau de Bord Tri-Axes & Accès Rapide (`DashboardOverview.jsx`)** :
   - **Carte 1 — Unique Bloc Financier & Retraits MoMo** : Solde net disponible (80% net), jauge vers le seuil de 5 000 F CFA, bouton de retrait Mobile Money immédiat et synthèse discrète des cumuls.
   - **Carte 2 — Taux d'Engagement des Fans** : Pourcentage d'engagement communautaire (ex: 87.4%), jauge de rétention des abonnés VIP (92.4%), nombre de fans VIP actifs, taux de réponse prioritaire et bouton d'accès au rapport d'engagement.
   - **Carte 3 — Taux d'Évolution sur la Plateforme** : Pourcentage de croissance mensuelle (ex: +28.5%), progression du score de popularité CDAR, rang officiel sur la plateforme et jauge de régularité des diffusions.
   - **Bannières d'accès direct** au rapport d'Analytics et au Classement CDAR.

2. **Rapport Statistique d'Activités & Suivi de l'Engagement Fans (`ArtistAnalyticsView.jsx`)** :
   - **Bilan Quantitatif des Activités Créatrices** :
     - Suivi du catalogue de publications ventilé par format (*Musique audio, Vidéos/Clips, Photos de scène, Podcasts/Masterclass*).
     - Ventilation par modèle économique (*Gratuit / Public, Abonnés VIP, Pay-Per-View à l'unité*).
     - Nombre de sessions de direct (Lives) effectuées et cumul des spectateurs réunis.
     - Activités d'animation communautaire (annonces épinglées, sondages d'opinion lancés).
     - Monétisation directe générée : volume des ventes PPV et cumul des pourboires Mobile Money (Tips).
   - **Mesure Approfondie de l'Engagement Fan** :
     - **Taux d'Engagement Global** en temps réel et statut de fidélisation.
     - **Volume total d'interactions** : Vues & Écoutes globales, Cœurs/Likes reçus, Commentaires déposés et Partages.
     - **Performance Comparative par Format d'Activité** : Classement par efficacité (Lives 96.5%, Musique 94.2%, Vidéos 91.8%, Sondages 88.5%, Photos 78.4%) avec tendances d'évolution.
     - **Courbe Temporelle d'Engagement Hebdomadaire** : Graphique interactif sur 7 jours avec bascule des métriques (*Interactions, Vues/Écoutes, Nouveaux Fans*).
   - **Dynamique Communautaire & Leaderboard des Fans** :
     - **Répartition des Abonnés par Palier** : Tier 1 Simple, Tier 2 VIP, Tier 3 Super Fan avec taux de rétention mensuelle (92.4%).
     - **Top 5 des Super Fans & Contributeurs Majeurs** : Classement nominatif avec photo, palier d'abonnement, badges honorifiques (*👑 Top Contributeur, 🔥 Fan Assidu, ⚡ Super Supporter*), cumul des pourboires MoMo et réactions.
     - **Rayonnement & Répartition Géographique** : Origine des fans (*Côte d'Ivoire, Sénégal, Cameroun, Mali, Diaspora & France*).
     - **Top Publications les Plus Engageantes** : Tableau des 5 meilleurs contenus avec vues, cœurs, commentaires et taux d'engagement unitaire.
     - **Recommandations Intelligentes d'Optimisation** : Conseils personnalisés générés pour booster les interactions (horaires de forte affluence, formats porteurs).

3. **Espace & Animation de Communauté Créateur (`CommunityManager.jsx`)** :
   - **Création du Fan Club** : Assistant de création guidé pour définir le nom du fan club, le slogan accrocheur, le badge honorifique (👑, 🔥, ⚡, 💎), les conditions d'accès (*Tous les fans, Abonnés VIP uniquement, etc.*) et le message de bienvenue personnalisé.
   - **Administration des Membres & Modération** :
     - Liste des membres inscrits avec statistiques d'activité.
     - Attribution de rôles stratégiques : nomination de **Modérateurs** parmi les fans de confiance, attribution du badge **Top Fan** ou **Ambassadeur**.
     - Sanctions et protection de l'espace : émission d'avertissements formels, suspension temporaire ou exclusion pour non-respect des règles.
   - **Tableau d'Affichage & Annonces Officielles** :
     - Publication d'annonces prioritaires épinglées en haut du club avec notification aux membres.
   - **Sondages Interactifs en Direct** :
     - Création de sondages à choix multiples avec vote en temps réel et jauges de progression graphiques (ex: choix de la setlist de concert, vote pour la pochette du prochain single).
   - **Charte & Règles de Bonne Conduite** :
     - Édition de la charte officielle de respect et bienveillance pour préserver une communauté saine et solidaire.
   - **Paramètres Avancés** :
     - Ajustement continu des règles, slogans, types d'accès et messages d'accueil.

4. **Classement & Benchmark des Pairs (`ArtistLeaderboard.jsx`)** :
   - Onglet dédié « Classement » dans le studio créateur.
   - **Mise en avant personnalisée** : Bannière récapitulative du rang actuel (*ex: #1 sur 4 créateurs*), score de popularité et abonnés VIP.
   - Carte de l'artiste connecté surlignée d'un liseré lumineux avec badge *« C'est vous ! »*.
   - Comparaison saine et motivante pour débloquer les badges honorifiques supérieurs (*👑 Top Star Africaine, 🔥 Tendance Majeure, ⭐ Créateur Établi*).

5. **Éditeur de Publications & Téléversement de Médias Réels (`PostPublisher.jsx`)** :
   - Formulaire de création ergonomique en 2 colonnes interactives.
   - **Sélection de Fichiers Médias Réels** (remplacement total des champs URL manuels) :
     - Sélecteur de fichiers réels par glisser-déposer ou clic direct depuis le disque ou smartphone.
     - Prise en charge des formats natifs selon le type choisi : Vidéo HD (*MP4, MOV, WebM*), Audio/Musique (*MP3, WAV, AAC*), Photos & Galeries (*JPG, PNG, WebP*), Podcasts/Vocaux (*MP3, M4A, OGG*).
     - Remplissage automatique du titre à partir du nom du fichier et affichage de la taille du média en Ko/Mo.
     - Prévisualisation live du lecteur réel (lecteur vidéo HTML5 natif, lecteur audio avec visualisation d'onde, ou affichage photo grand format).
   - **Politique de monétisation** :
     - *Gratuit / Public* : Accessible à tous pour booster la notoriété.
     - *Abonnés VIP uniquement* : Réservé aux fans ayant souscrit à un palier.
     - *Pay-Per-View (À la carte)* : Définition d'un prix unitaire en F CFA (ex: 1 000 F CFA pour un clip inédit) avec calculateur instantané de gain net (80%).
   - **Classification de sensibilité** : Option « Contenu Sensible / +18 ans » avec floutage automatique de la vignette teaser.

6. **Gestionnaire des 3 Paliers d'Abonnement (`TiersManager.jsx`)** :
   - Personnalisation intégrale des formules d'adhésion :
     - **Palier 1 — Fan Simple** (ex: 1 500 F CFA / mois) : Accès aux stories privées et posts audio.
     - **Palier 2 — Fan VIP** (ex: 3 000 F CFA / mois) : Accès aux clips exclusifs, coulisses et lives privés.
     - **Palier 3 — Super Fan / Mécène** (ex: 10 000 F CFA / mois) : Messagerie directe VIP, dédicaces et réductions concerts.
   - Boutons de pas d'incrémentation (+500 / -500 F CFA) et préréglages recommandés.

7. **Studio de Diffusion Live (`LiveBroadcaster.jsx`)** :
   - Lancement d'un live vidéo avec titre et choix d'accès (*Public, VIP, Payant*).
   - Modération du flux de chat en direct et visualisation du compteur de spectateurs.
   - Notification sonore et visuelle lors de la réception d'un pourboire Mobile Money.

8. **Boîte de Réception VIP (`ArtistVipInbox.jsx`)** :
   - Interface de réponse prioritaire aux messages des abonnés les plus engagés.

9. **Historique des Publications & Retraits (`HistoryView.jsx`)** :
   - Liste exhaustive des publications passées avec nombre de vues, likes et revenus générés.
   - Relevé chronologique des demandes de retrait Mobile Money avec récépissé de transaction.

10. **Paramètres de Profil & Coordonnées (`ArtistProfileSettingsView.jsx`)** :

8. **Profil Artiste & Coordonnées (`ArtistProfileSettingsView.jsx`)** :
   - Mise à jour en totale autonomie des informations créateur : nom de scène, photo de profil par clic direct, bannière et biographie.
   - Paramétrage officiel du **numéro Mobile Money de versement** et de l'opérateur associé (rétribution 80%).
   - **Mise à jour et téléversement autonome des pièces légales d'identité (KYC)** :
     - Sélection du type de pièce (CNI, Passeport, Permis, Carte consulaire).
     - Remplacement et visualisation directe des photos **Recto et Verso**.
     - Suivi du statut de certification officiel (*✓ CERTIFIÉ CONFORME* ou *⏳ EN ATTENTE DE CONTRÔLE*).

---

### 3.4. 🛡️ Espace Administrateur / Régie de Gouvernance (`spaces/admin/`)
La tour de contrôle réservée aux administrateurs CDAR pour assurer la conformité, la sécurité et l'équilibre financier de la plateforme :

1. **Console Centrale & Pilules Défilantes (`AdminKycView.jsx`)** :
   - En-tête statutaire avec compteur d'alertes KYC en temps réel et accès direct au profil administrateur.
   - Barre de navigation horizontale fluide entre les 7 piliers de gestion.

2. **Modération & Vérification des Contenus Sensibles (`AdminContentModerationTab.jsx`)** :
   - Suivi des publications signalées par les utilisateurs ou classées sensibles par le système.
   - Inspection visuelle des vignettes avec floutage de sécurité et possibilité de dévoilement sous contrôle.
   - Actions immédiates : *Certifier conforme tout public*, *Appliquer restriction +18 ans*, *Bloquer la publication*, ou *Supprimer définitivement*.

3. **Supervision des Directs / Lives en Temps Réel (`AdminLiveMonitoringTab.jsx`)** :
   - Surveillance simultanée des lives en cours avec métriques en temps réel (nombre de spectateurs, montant des pourboires, flux de messages).
   - Émission d'avertissements officiels épinglés dans le chat via des modèles prêts à l'emploi (*« Propos inappropriés »*, *« Tenue non conforme »*, *« Dernier avertissement avant coupure »*).
   - Bouton d'interruption d'urgence du direct en cas d'infraction grave à la charte.

4. **Suivi des Revenus par Artiste & Payouts MoMo (`AdminArtistRevenuesTab.jsx`)** :
   - Suivi comptable consolidé : Volume Brut total généré, Part Nette due aux créateurs (80%), Commission CDAR encaissée (20%), et total des retraits Mobile Money décaissés.
   - Tableau nominatif détaillé par artiste avec filtres par opérateur Mobile Money (*Orange, Wave, MTN*).
   - Fonction d'exportation complète des données financières au format CSV pour la comptabilité.

5. **Classement Multi-critères des Créateurs (`AdminArtistRankingTab.jsx`)** :
   - **Podium interactif Top 3** : Célébration visuelle du #1 Or (couronne animée), du #2 Argent et du #3 Bronze.
   - Algorithme de tri multi-critères : par *Score de Popularité*, par *Nombre d'Abonnés VIP*, par *Chiffre d'Affaires généré* ou par *Volume de Publications*.
   - Filtres croisés par catégorie artistique (*Rap Ivoire, Afro-Soul, Danse, Masterclass*) et par pays (*Côte d'Ivoire, Sénégal, Cameroun*).

6. **Validation des Dossiers KYC Artistes (`AdminKycTab.jsx`)** :
   - Traitement des candidatures des nouveaux artistes souhaitant publier sur la plateforme.
   - Examen de l'identité, de la cohérence artistique et des coordonnées de retrait Mobile Money.
   - Décision en un clic : *Approuver & Certifier KYC* (active immédiatement le studio de l'artiste) ou *Rejeter le dossier*.

7. **Profil Administrateur (`AdminProfileSettingsView.jsx`)** :
   - Gestion des informations de contact de l'administrateur, journal d'audit et sécurité du compte.

---

### 3.5. 💳 Espace Paiement & Passerelle Mobile Money Fictive (`spaces/payment/`)
Un simulateur interactif fidèle aux parcours de paiement d'Afrique de l'Ouest :
- **Souscription & Achat (`MockPaymentModal.jsx`, `PaymentModal.jsx`)** :
  - Sélection de l'opérateur (*Orange Money, Wave, MTN Mobile Money, Moov*).
  - Saisie du numéro de téléphone et affichage du montant en F CFA.
  - Simulation de validation USSD (code secret) ou QR Code Wave avec retour instantané du statut de paiement.
- **Retrait Créateur (`PayoutModal.jsx`)** :
  - Déduction immédiate du solde disponible du portefeuille de l'artiste.
  - Génération d'une référence de transaction Mobile Money unique.

---

## 4. ⚙️ Architecture Technique & Schéma de Données

### 4.1. Stack Technologique
- **Frontend** :
  - React 18 & Vite 5 (Hot Module Replacement, build ultra-rapide)
  - Tailwind CSS 3 avec classes utilitaires étendues et support dark mode (`dark:`)
  - Lucide React (bibliothèque d'icônes moderne et cohérente)
  - Canvas Confetti (célébrations d'abonnement et de pourboires)
- **Backend** :
  - Python 3.11 avec framework haute performance **FastAPI**
  - **SQLAlchemy 2.0** (ORM déclaratif et gestion des sessions asynchrones/synchrones)
  - **Pydantic v2** (validation stricte des schémas d'entrée/sortie)
  - **Passlib & Bcrypt** (hachage sécurisé des mots de passe)
  - **Python-Jose** (génération et vérification des tokens JWT)
  - Base de données : SQLite pour le développement local rapide (compatible PostgreSQL pour la production sans modification du code ORM).

### 4.2. Schéma Relationnel de la Base de Données

```text
┌─────────────────┐       1:N       ┌──────────────────┐
│      User       ├─────────────────┤       Post       │
│  - id, role     │                 │  - id, artist_id │
│  - email, pwd   │                 │  - title, media  │
│  - stage_name   │                 │  - sensitivity   │
│  - kyc_status   │                 │  - price_cfa     │
└────────┬────────┘                 └──────────────────┘
         │
         │ 1:1
         ├──────────────────────────┐
         │                          │
         ▼ 1:N                      ▼ 1:1
┌─────────────────┐        ┌─────────────────┐
│  Subscription   │        │     Wallet      │
│  - fan_id       │        │  - artist_id    │
│  - artist_id    │        │  - balance_cfa  │
│  - tier_level   │        │  - total_earned │
│  - expires_at   │        └────────┬────────┘
└─────────────────┘                 │
                                    │ 1:N
                                    ▼
                           ┌─────────────────┐
                           │   Transaction   │
                           │  - wallet_id    │
                           │  - amount_cfa   │
                           │  - type         │
                           │  - momo_operator│
                           └─────────────────┘
```

---

## 5. 🔑 Comptes de Démonstration Pré-configurés

La base de données est initialisée avec des comptes prêts à l'emploi permettant de tester immédiatement l'ensemble des scénarios :

| Rôle | Adresse Email | Mot de passe | Statut & Privilèges |
| :--- | :--- | :--- | :--- |
| **Fan Libre** | `fan.abidjan@gmail.com` | `Password123!` | Compte visiteur non abonné, découverte des artistes, cadenas sur exclusivités, achat possible par MoMo fictif. |
| **Fan VIP** | `fan.vip@gmail.com` | `Password123!` | Compte abonné VIP à Didi B, accès intégral aux médias déverrouillés, chat VIP disponible. |
| **Artiste Certifié** | `didib@rapivoire.ci` | `Password123!` | Artiste star ivoirien, KYC approuvé, studio complet, portefeuille approvisionné, retraits actifs. |
| **Artiste en attente** | `josey@music.ci` | `Password123!` | Artiste en attente d'approbation KYC, studio restreint. |
| **Super Administrateur**| `admin@cdar.ci` | `Password123!` | Accès complet à la console de régie, modération des contenus et validation KYC. |

---

## 6. 🚀 Guide de Démarrage Rapide

### Prérequis
- Node.js (v18+) et npm
- Python (v3.10 ou v3.11)

### Étape 1 : Démarrage du Serveur Backend
```powershell
cd App/backend
# Activation de l'environnement virtuel Python
.\.venv\Scripts\Activate.ps1
# Lancement de l'API avec rechargement automatique
python run.py
```
* API opérationnelle sur : **http://localhost:8000**
* Documentation interactive Swagger : **http://localhost:8000/docs**

### Étape 2 : Démarrage du Client Frontend
Dans un second terminal :
```powershell
cd App/frontend
npm run dev
```
* Application accessible dans le navigateur : **http://localhost:3000**

### Étape 3 : Exécution des Tests Automatisés
- **Tests unitaires et fonctionnels Backend (Pytest)** :
  ```powershell
  cd App/backend
  .\.venv\Scripts\python.exe -m pytest -v
  ```
- **Vérification de la compilation Frontend (Vite Build)** :
  ```powershell
  npm run build --prefix App/frontend
  ```

---

## 7. 🛡️ Sécurité & Bonnes Pratiques Appliquées
- **Watermarking dynamique** : Injection du prénom/pseudo du fan et horodatage sur les flux VIP pour dissuader les captures d'écran et la redistribution non autorisée.
- **Ségrégation stricte des rôles** : Les endpoints de validation KYC, de modération et de suivi financier sont protégés par le rôle `admin` côté serveur via des dépendances FastAPI (`deps.py`).
- **Isolation des portefeuilles** : Calcul et virement des parts 80/20 atomiques lors de chaque transaction pour éviter tout risque de divergence financière.
- **Filtrage de sensibilité gradué** : Respect des règles de diffusion pour protéger les publics jeunes tout en laissant aux créateurs la liberté d'expression encadrée.
