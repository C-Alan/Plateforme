**CAHIER DES CHARGES COMPLET**

**Application Mobile**

Plateforme de contenus exclusifs

**Artistes & Fans**

# TABLE DES MATIÈRES 

**PARTIE 1 VISION ET CADRAGE DU PROJET**

1\. Résumé Exécutif

2\. Contexte et Opportunité de Marché

3\. Vision, Mission et Objectifs

4\. Proposition de Valeur

**PARTIE 2 SPÉCIFICATIONS FONCTIONNELLES**

5\. Utilisateurs, Profils et Permissions

6\. Parcours Utilisateur (Flux Écrans)

7\. Liste Complète des Écrans

8\. Module Authentification & Comptes

9\. Module Profils

10\. Module Fil d'Actualité & Découverte

11\. Module Publication de Contenu

12\. Module Live Streaming Privé

13\. Module Messagerie Directe

14\. Module Système d'Abonnement

15\. Module Pourboires

16\. Module Contenu Payant à l'Unité

17\. Module Notifications

18\. Module Tableau de Bord Artiste

19\. Module Paramètres & Compte

**PARTIE 3 MODÈLE ÉCONOMIQUE**

20\. Modèle Économique Complet

**PARTIE 4 ARCHITECTURE TECHNIQUE**

21\. Stack Technologique

24\. Architecture Générale

**PARTIE 5 SÉCURITÉ, JURIDIQUE & CONFORMITÉ**

25\. Sécurité

26\. Juridique

**PARTIE 6 RÉALISATION**

30\. Roadmap Produit

31\. Risques du Projet

32\. Indicateurs de Performance (KPI)

33\. Règles de Nommage et Références

34\. Livrables Attendus

35\. Plan de Déploiement

Annexes Glossaire, Modèle économique détaillé

**PARTIE 1 — VISION ET CADRAGE DU PROJET**

# 1. Résumé Exécutif

Ce projet consiste à créer une application mobile de contenus exclusifs mettant en relation des artistes et créateurs africains avec leurs fans. L'objectif est de devenir la référence africaine des plateformes de contenus premium, en proposant des solutions de paiement adaptées au marché local (Mobile Money).

## 1.1 Ce que la plateforme permet aux artistes

- Publier du contenu premium (vidéo, photo, musique, podcast, stories)

- Organiser des lives privés pour leurs abonnés

- Échanger directement avec leurs fans via messagerie

- Monétiser leur communauté par abonnements, pourboires et contenus payants

## 1.2 Ce que la plateforme permet aux fans

- S'abonner à leurs artistes préférés (3 niveaux)

- Accéder à des contenus exclusifs non disponibles ailleurs

- Participer à des lives privés avec chat et dons en temps réel

- Discuter directement avec les artistes

- Soutenir financièrement leurs créateurs favoris

# 2. Contexte et Opportunité de Marché

## 2.1 Plateformes Concurrentes Existantes

|                 |                            |                                                              |
|-----------------|----------------------------|--------------------------------------------------------------|
| **Plateforme**  | **Points forts**           | **Lacune pour l'Afrique**                                    |
| **Patreon**     | Abonnements créateurs      | Pas de Mobile Money, frais élevés                            |
| **OnlyFans**    | Contenus exclusifs payants | Non adapté culturellement, Manque de moyen de paiement local |
| **Twitch**      | Live streaming gaming      | Peu d'artistes africains, paiements USD                      |
| **TikTok Live** | Dons en direct             | Pas d'abonnements exclusifs, contenu éphémère                |
| **Fanfix**      | Contenus exclusifs jeunes  | Inexistant en Afrique francophone                            |

## 2.2 Lacunes du Marché Africain

- Peu de plateformes adaptées au marché africain

- Peu offrent des moyens de paiement locaux (Mobile Money)

- Les artistes africains ont du mal à monétiser leur communauté

## 2.3 Moyens de Paiement Ciblés

|                            |                                 |
|----------------------------|---------------------------------|
| **Moyen de paiement**      | **Intégration**                 |
| **Orange Money**           | Flutterwave ou API directe      |
| **MTN Mobile Money**       | Flutterwave                     |
| **Wave**                   | API Wave directe                |
| **Carte bancaire Visa/MC** | Stripe + Flutterwave + Paystack |

# 3. Vision, Mission et Objectifs

## 3.1 Vision

Devenir la principale plateforme de monétisation des créateurs africains.

## 3.2 Mission

- Permettre aux artistes de vivre de leur contenu

- Rapprocher les artistes de leur communauté

- Créer une économie autour de l'audience des artistes

## 3.3 Objectifs Chiffrés

|                         |                           |                         |                      |
|-------------------------|---------------------------|-------------------------|----------------------|
| **Horizon**             | **Objectif utilisateurs** | **Objectif artistes**   | **Ambition**         |
| **Court terme — 1 an**  | 10 000 utilisateurs       | 200 artistes signés     | Lancer la plateforme |
| **Moyen terme — 3 ans** | 500 000 utilisateurs      | Leader multi-pays       | Expansion africaine  |
| **Long terme**          | +1 000 000 utilisateurs   | Présence internationale | Plateforme mondiale  |

# 4. Proposition de Valeur

|                        |                                                                     |                                                                               |
|------------------------|---------------------------------------------------------------------|-------------------------------------------------------------------------------|
| **Cible**              | **Manque actuelle**                                                 | **Ce que la plateforme apporte**                                              |
| **Artistes africains** | Pas de plateforme locale, paiements difficiles, faible monétisation | Monétisation directe, indépendance financière, relation directe avec les fans |
| **Fans**               | Echange réelle et soutiens direct avec les artistes                 | Contenus exclusifs, proximité artiste, expériences uniques                    |

**PARTIE 2 — SPÉCIFICATIONS FONCTIONNELLES**

# 5. Utilisateurs, Profils et Permissions

## 5.1 Types d'Utilisateurs

|                          |                                        |                                                               |
|--------------------------|----------------------------------------|---------------------------------------------------------------|
| **Profil**               | **Description**                        | **Accès principal**                                           |
| **Super Administrateur** | Équipe plateforme — accès total        | Configuration, modération, gestion globale                    |
| **Modérateur**           | Équipe plateforme — modération contenu | Signalements, suppression contenus, litiges                   |
| **Artiste / Créateur**   | Créateur de contenu inscrit et vérifié | Publication, live, messagerie, analytics, revenus             |
| **Fan Abonné**           | Utilisateur avec abonnement actif      | Contenus exclusif, live, message direct avec Artiste\Créateur |
| **Fan Non Abonné**       | Utilisateur sans abonnement actif      | Profils publics, aperçus gratuits                             |

## 5.2 Matrice de Permissions

*◦ Légende : ✓ Accès complet R Lecture seule ✗ Aucun accès*

|                                    |                 |                |             |                 |                  |
|------------------------------------|-----------------|----------------|-------------|-----------------|------------------|
| **Module**                         | **Super Admin** | **Modérateur** | **Artiste** | **Fan Abonné**  | **Fan Libre**    |
| **Inscription / Connexion**        | ✓               | ✓              | ✓           | ✓               | ✓                |
| **Gestion de son profil**          | ✓               | R              | ✓           | ✓               | ✓                |
| **Publication contenu**            | ✓               | R              | ✓           | ✗               | ✗                |
| **Lecture contenu gratuit**        | ✓               | ✓              | ✗           | ✓               | ✓                |
| **Lecture contenu abonné**         | ✓               | ✓              | ✗           | ✓               | ✗                |
| **Lecture contenu payant**         | ✓               | ✓              | ✗           | ✓ (si acheté)   | ✓ (si acheté)    |
| **Abonnements — souscrire**        | ✓               | ✗              | ✗           | ✓               | ✓                |
| **Abonnements — gérer ses offres** | ✓               | ✗              | ✓           | ✗               | ✗                |
| **Paiements**                      | ✓               | R              | R           | ✓               | ✓ (achats seuls) |
| **Live — diffuser**                | ✓               | ✗              | ✓           | ✗               | ✗                |
| **Live — regarder**                | ✓               | ✓              | ✗           | ✓               | (Limité)         |
| **Messagerie directe**             | ✓               | R              | ✓           | ✓ (selon offre) | ✗                |
| **Pourboires — envoyer**           | ✓               | ✗              | ✗           | ✓               | ✓                |
| **Notifications**                  | ✓               | R              | ✓           | ✓               | R                |
| **Dashboard analytics**            | ✓               | R              | ✓ (sien)    | ✗               | ✗                |
| **Modération contenu**             | ✓               | ✓              | ✗           | ✗               | ✗                |
| **Configuration système**          | ✓               | ✗              | ✗           | ✗               | ✗                |

# 6. Parcours Utilisateur (Flux Écrans)

## 6.1 Parcours Fan — Première Utilisation

|           |                            |                                                   |
|-----------|----------------------------|---------------------------------------------------|
| **Étape** | **Écran**                  | **Action**                                        |
| **1**     | Splash Screen              | Chargement de l'application                       |
| **2**     | Onboarding (3 slides)      | Découverte des fonctionnalités principales        |
| **3**     | Inscription Fan            | Saisie email/téléphone, mot de passe, pays        |
| **4**     | Vérification OTP           | Code SMS de confirmation                          |
| **5**     | Sélection artistes favoris | Choix de +3 artistes pour personnaliser le feed   |
| **6**     | Accueil / Feed             | Fil d'actualité des artistes suivis               |
| **7**     | Profil artiste             | Consultation du profil et du contenu              |
| **8**     | Écran d'abonnement         | Choix du niveau d'abonnement                      |
| **9**     | Paiement                   | Sélection Mobile Money ou carte, confirmation OTP |
| **10**    | Confirmation               | Accès débloqué au contenu exclusif                |

## 6.2 Parcours Fan — Live

|           |                   |                                        |
|-----------|-------------------|----------------------------------------|
| **Étape** | **Écran**         | **Action**                             |
| **1**     | Notification push | « \[Artiste\] est en live maintenant » |
| **2**     | Écran live        | Connexion au stream, affichage chat    |
| **3**     | Interaction       | Envoi de messages, réactions, dons     |
| **4**     | Fin du live       | Accès au replay (48h si abonné)        |

## 6.3 Parcours Artiste — Publication

|           |                       |                                                                  |
|-----------|-----------------------|------------------------------------------------------------------|
| **Étape** | **Écran**             | **Action**                                                       |
| **1**     | Dashboard             | Vue synthétique revenus + abonnés                                |
| **2**     | Créer une publication | Sélection du type de contenu                                     |
| **3**     | Upload média          | Sélection fichier depuis galerie ou appareil photo               |
| **4**     | Paramétrage           | Légende, visibilité (gratuit/abonnés/payant), prix si applicable |
| **5**     | Planification (opt.)  | Date et heure de publication différée                            |
| **6**     | Aperçu                | Vérification avant publication                                   |
| **7**     | Publication           | Contenu publié, notification envoyée aux abonnés                 |

## 6.4 Parcours Artiste — Live

|           |                  |                                                     |
|-----------|------------------|-----------------------------------------------------|
| **Étape** | **Écran**        | **Action**                                          |
| **1**     | Démarrer un live | Titre, type d'accès, activation caméra/micro        |
| **2**     | En direct        | Diffusion, gestion chat, visualisation dons reçus   |
| **3**     | Fin du live      | Arrêt diffusion, stats instantanées (viewers, dons) |
| **4**     | Replay           | Disponible automatiquement 48h pour les abonnés     |

# 7. Liste Complète des Écrans à Développer

## 7.1 Écrans Communs (Fan & Artiste)

|                           |                                                  |              |
|---------------------------|--------------------------------------------------|--------------|
| **Écran**                 | **Description**                                  | **Priorité** |
| **Splash Screen**         | Logo + animation au démarrage                    | Phase 1      |
| **Onboarding (3 slides)** | Présentation des 3 valeurs clés de la plateforme | Phase 1      |
| **Inscription Fan**       | Formulaire d'inscription compte fan              | Phase 1      |
| **Inscription Artiste**   | Formulaire + upload                              | Phase 1      |
| **Connexion**             | Email/tél + mot de passe ou OAuth                | Phase 1      |
| **Vérification OTP**      | Saisie code SMS 6 chiffres                       | Phase 1      |
| **Mot de passe oublié**   | Réinitialisation via email ou SMS                | Phase 1      |
| **Paramètres du compte**  | Modifier profil, sécurité, notifications         | Phase 1      |
| **Notifications**         | Liste des notifications reçues                   | Phase 1      |

## 7.2 Écrans Fan

|                               |                                                         |              |
|-------------------------------|---------------------------------------------------------|--------------|
| **Écran**                     | **Description**                                         | **Priorité** |
| **Accueil / Feed**            | Fil d'actualité des artistes suivis (chrono ou algo)    | Phase 1      |
| **Découverte / Recherche**    | Recherche artistes, tendances, suggestions              | Phase 1      |
| **Profil Artiste (public)**   | Page complète : photo, bio, contenus, offres abonnement | Phase 1      |
| **Écran Abonnement**          | Choix du niveau + récapitulatif + paiement              | Phase 1      |
| **Lecteur Vidéo**             | Plein écran, contrôles, qualité, DRM                    | Phase 1      |
| **Lecteur Audio**             | Pochette, titre, contrôles lecture                      | Phase 1      |
| **Galerie Photos**            | Visualisation album photos d'une publication            | Phase 1      |
| **Mes Abonnements**           | Liste des abonnements actifs + date renouvellement      | Phase 1      |
| **Mes Achats**                | Historique des contenus achetés à l'unité               | Phase 1      |
| **Pourboire**                 | Envoi de pourboire (500F / 1000F / libre)               | Phase 1      |
| **Live — Spectateur**         | Stream vidéo + chat + dons                              | Phase 2      |
| **Replay Live**               | Lecture replay post-live                                | Phase 2      |
| **Messagerie — Liste**        | Liste des conversations actives                         | Phase 2      |
| **Messagerie — Conversation** | Échange texte/audio/vidéo avec l'artiste                | Phase 2      |
| **Mon Profil Fan**            | Photo, pseudo, historique                               | Phase 1      |

## 7.3 Écrans Artiste

|                              |                                              |              |
|------------------------------|----------------------------------------------|--------------|
| **Écran**                    | **Description**                              | **Priorité** |
| **Dashboard Artiste**        | Synthèse revenus + abonnés + contenu récent  | Phase 1      |
| **Créer une Publication**    | Sélection type + upload + paramétrage        | Phase 1      |
| **Gestion des Publications** | Liste + édition + suppression des contenus   | Phase 1      |
| **Gestion des Abonnements**  | Créer/modifier les offres d'abonnement       | Phase 1      |
| **Démarrer un Live**         | Titre + type d'accès + test caméra/micro     | Phase 2      |
| **En Live (Diffusion)**      | Streaming + chat + dons reçus en temps réel  | Phase 2      |
| **Analytics Contenu**        | Vues, taux complétion, likes par publication | Phase 2      |
| **Analytics Revenus**        | Évolution MRR, répartition par source        | Phase 2      |
| **Messagerie Artiste**       | Réponses aux fans selon niveau d'abonnement  | Phase 2      |
| **Portefeuille / Revenus**   | Solde disponible + historique versements     | Phase 1      |
| **Profil Public (preview)**  | Aperçu de sa page telle que vue par les fans | Phase 1      |

# 8. Module Authentification & Comptes

## 8.1 Inscription Fan

|                         |               |                    |                                              |
|-------------------------|---------------|--------------------|----------------------------------------------|
| **Champ**               | **Type**      | **Obligatoire**    | **Validation**                               |
| **Prénom**              | Texte         | Oui                | 2 à 50 caractères                            |
| **Nom**                 | Texte         | Oui                | 2 à 50 caractères                            |
| **Numéro de téléphone** | Téléphone     | Oui (ou email)     | Format international (+225…). OTP envoyé.    |
| **Email**               | Email         | Oui (ou téléphone) | Format valide. Lien de confirmation.         |
| **Mot de passe**        | Password      | Oui                | Min. 8 car., 1 maj., 1 chiffre, 1 spécial    |
| **Confirmation MDP**    | Password      | Oui                | Identique au mot de passe                    |
| **Pays**                | Liste         | Oui                | Détermine les moyens de paiement disponibles |
| **Acceptation CGU**     | Case à cocher | Oui                | Inscription bloquée si non coché             |

## 8.2 Inscription Artiste (champs supplémentaires)

|                                  |                   |                 |                                                    |
|----------------------------------|-------------------|-----------------|----------------------------------------------------|
| **Champ**                        | **Type**          | **Obligatoire** | **Validation**                                     |
| **Nom de scène**                 | Texte             | Oui             | Unique sur la plateforme. Max 60 car.              |
| **Catégorie artistique**         | Liste             | Oui             | Musique / Comédie / Cuisine / Sport / Mode / Autre |
| **Biographie**                   | Texte long        | Non             | Max 500 caractères                                 |
| **Pays de résidence**            | Liste             | Oui             | Détermine les modes de versement                   |
| **Pièce d'identité (KYC)**       | Fichier image/PDF | Oui             | CNI ou passeport. Validation manuelle 48h max.     |
| **Selfie avec pièce (KYC)**      | Image             | Oui             | Anti-fraude                                        |
| **N° Mobile Money (versements)** | Téléphone         | Oui             | Numéro pour recevoir les versements mensuels       |

*◦ Le compte artiste est activé en mode publication uniquement après validation KYC par l'équipe (délai max. 48h ouvrées).*

## 8.3 Méthodes de Connexion

|                          |                                                     |
|--------------------------|-----------------------------------------------------|
| **Méthode**              | **Description**                                     |
| **Email + mot de passe** | Authentification classique. JWT retourné.           |
| **Téléphone + OTP SMS**  | Code 6 chiffres. Valide 10 minutes.                 |
| **Google OAuth**         | Connexion via compte Google (fans principalement)   |
| **Facebook OAuth**       | Connexion via compte Facebook (fans principalement) |

## 8.4 Règles de Sécurité — Authentification

- Verrouillage après 5 tentatives échouées (déverrouillage par email/SMS)

- Access token : expiration 15 minutes

- Refresh token : expiration 7 jours

- 2FA optionnel : SMS ou application TOTP (Google Authenticator, Authy)

- Mot de passe : min. 8 caractères, majuscule + chiffre + caractère spécial

# 9. Module Profils

## 9.1 Profil Artiste — Page Publique

|                           |                    |                |                                                 |
|---------------------------|--------------------|----------------|-------------------------------------------------|
| **Champ**                 | **Type**           | **Modifiable** | **Description**                                 |
| **Photo de profil**       | Image JPG/PNG/WEBP | Artiste        | Max 5 Mo. Affichée 400×400px.                   |
| **Bannière**              | Image JPG/PNG      | Artiste        | Max 10 Mo. Recommandé 1500×500px.               |
| **Nom de scène**          | Texte              | Artiste        | Affiché publiquement. Unique.                   |
| **Biographie**            | Texte long         | Artiste        | Max 1000 caractères. Emojis supportés.          |
| **Catégorie artistique**  | Liste              | Artiste        | Une catégorie principale.                       |
| **Pays**                  | Liste              | Artiste        | Pays de résidence.                              |
| **Liens réseaux sociaux** | URLs               | Artiste        | Instagram, TikTok, YouTube, Twitter/X.          |
| **Grille de contenus**    | Système            | Auto           | Publications récentes. Verrouillées si abonnés. |
| **Offres d'abonnement**   | Système            | Artiste        | Bouton abonnement + 3 niveaux.                  |
| **Compteur abonnés**      | Entier             | Auto           | Calculé automatiquement.                        |
| **Badge vérifié**         | Booléen            | Admin          | Activé après validation KYC.                    |
| **Statut en ligne**       | Booléen            | Auto           | Mis à jour toutes les 5 minutes.                |

## 9.2 Profil Fan

|                        |               |                |                                                |
|------------------------|---------------|----------------|------------------------------------------------|
| **Champ**              | **Type**      | **Modifiable** | **Description**                                |
| **Photo de profil**    | Image         | Fan            | Optionnel. Max 5 Mo.                           |
| **Pseudo**             | Texte         | Fan            | Affiché dans commentaires et messages. Unique. |
| **Pays**               | Liste         | Fan            | Utilisé pour sélection des paiements.          |
| **Abonnements actifs** | Lecture seule | Auto           | Liste avec date de renouvellement.             |
| **Contenus achetés**   | Lecture seule | Auto           | Historique des achats à l'unité.               |

# 10. Module Fil d'Actualité & Découverte

## 10.1 Fil d'Actualité (Feed)

La page d'accueil affiche les publications des artistes auxquels le fan est abonné ou qu'il suit gratuitement.

|                          |                                                            |
|--------------------------|------------------------------------------------------------|
| **Paramètre**            | **Valeur**                                                 |
| **Ordre d'affichage**    | Chronologique inversé (plus récent en premier) — Phase 1   |
| **Contenu affiché**      | Publications des artistes suivis + abonnés                 |
| **Contenus verrouillés** | Affichés en aperçu avec cadenas pour non-abonnés           |
| **Infinite scroll**      | Pagination automatique (20 publications par chargement)    |
| **Stories**              | Affichées en haut du feed (cercles cliquables, 24h de vie) |
| **Lives en cours**       | Badge « EN DIRECT » affiché en priorité en haut du feed    |

## 10.2 Page Découverte / Recherche

|                                |                                                     |
|--------------------------------|-----------------------------------------------------|
| **Fonctionnalité**             | **Description**                                     |
| **Barre de recherche**         | Recherche par nom d'artiste, catégorie, hashtag     |
| **Artistes tendance**          | Top artistes selon croissance d'abonnés sur 7 jours |
| **Suggestions personnalisées** | Basées sur les catégories des artistes suivis       |
| **Filtres**                    | Par catégorie artistique et par pays                |
| **Résultats de recherche**     | Profil artiste + nombre abonnés + bouton suivre     |

# 11. Module Publication de Contenu

## 11.1 Types de Contenus

|                       |                     |                |                                                            |
|-----------------------|---------------------|----------------|------------------------------------------------------------|
| **Type**              | **Formats**         | **Taille max** | **Durée / Contraintes**                                    |
| **Vidéos exclusives** | MP4, MOV            | 2 Go           | Max 3h. H.264. Transcodage automatique en 1080p/720p/480p. |
| **Photos**            | JPG, PNG, WEBP      | 20 Mo          | Galerie multi-photos (max 10 par publication).             |
| **Musique**           | MP3, AAC, FLAC, WAV | 200 Mo         | Lecteur intégré avec couverture et titre.                  |
| **Podcasts**          | MP3, M4A            | 500 Mo         | Chapitrage supporté. Max 4h.                               |
| **Stories**           | Image/Vidéo courte  | 50 Mo          | Durée de vie 24h. Vidéo max 60 secondes.                   |

## 11.2 Fiche de Publication

|                             |            |                 |                                                       |
|-----------------------------|------------|-----------------|-------------------------------------------------------|
| **Champ**                   | **Type**   | **Obligatoire** | **Description / Validation**                          |
| **Titre**                   | Texte      | Non             | Max 150 caractères.                                   |
| **Légende / Description**   | Texte long | Non             | Max 2000 car. Hashtags (#) et mentions (@) supportés. |
| **Fichier(s) média**        | Fichier    | Oui             | Selon type (cf. 11.1).                                |
| **Type de contenu**         | Liste      | Oui             | Vidéo / Photo / Musique / Podcast / Story             |
| **Visibilité**              | Liste      | Oui             | Gratuit / Abonnés seulement / Payant à l'unité        |
| **Prix (si payant)**        | Décimal    | Conditionnel    | En FCFA. Min 500 F. Max 50 000 F.                     |
| **Aperçu gratuit**          | Fichier    | Non             | Max 30 sec vidéo. Pour contenus payants.              |
| **Hashtags**                | Tags       | Non             | Max 10 hashtags.                                      |
| **Planification**           | Date/Heure | Non             | Publication différée. Doit être dans le futur.        |
| **Téléchargement autorisé** | Booléen    | Non             | Par défaut : Non.                                     |
| **Statut**                  | Système    | Auto            | Brouillon / Planifié / Publié / Archivé / Supprimé    |

## 11.3 Commentaires

|                         |                                                         |
|-------------------------|---------------------------------------------------------|
| **Paramètre**           | **Valeur**                                              |
| **Qui peut commenter**  | Fans abonnés uniquement (configurable par l'artiste)    |
| **Longueur max**        | 500 caractères                                          |
| **Réponses imbriquées** | 1 niveau de réponse autorisé                            |
| **Signalement**         | Tout utilisateur peut signaler un commentaire           |
| **Suppression**         | Artiste peut supprimer tout commentaire sur son contenu |

# 12. Module Live Streaming Privé

## 12.1 Types de Lives

|                       |                                                  |                                     |
|-----------------------|--------------------------------------------------|-------------------------------------|
| **Type**              | **Accès**                                        | **Remarque**                        |
| **Live privé**        | Abonnés uniquement                               | Tous niveaux d'abonnement           |
| **Live pour abonnés** | Niveau d'abonnement minimum défini par l'artiste | Ex : VIP et Super Fan seulement     |
| **Live payant**       | Tout utilisateur ayant acheté un ticket          | Prix fixé par l'artiste (min 500 F) |

## 12.2 Fiche de Live

|                              |              |                                               |
|------------------------------|--------------|-----------------------------------------------|
| **Champ**                    | **Type**     | **Description**                               |
| **Référence**                | Système      | Format : LIVE-\[ART_ID\]-\[AAAAMMJJ\]-\[XXX\] |
| **Titre**                    | Texte        | Max 100 caractères                            |
| **Type d'accès**             | Liste        | Privé / Abonnés / Payant                      |
| **Prix (si payant)**         | Décimal      | Min 500 F CFA                                 |
| **Niveau abonnement requis** | Liste        | Simple / VIP / Super Fan (si type=Abonnés)    |
| **Date/heure prévues**       | Date/Heure   | Notification abonnés 1h avant                 |
| **Durée réelle**             | Durée        | Calculée automatiquement                      |
| **Chat activé**              | Booléen      | Par défaut : Oui                              |
| **Mode lent**                | Entier (sec) | 0 / 5 / 10 / 30 secondes entre messages       |
| **Replay disponible**        | Booléen      | Par défaut : Oui. 48h pour les ayants droit.  |
| **Statut**                   | Liste        | Planifié / En direct / Terminé / Annulé       |

## 12.3 Fonctionnalités Chat Live

- Messages texte en temps réel (50 derniers messages affichés)

- Dons en direct avec animation à l'écran (montant + pseudo affiché 3 secondes)

- Réactions animées : cœur, feu, applaudissements, étoile, …

- Épinglage de message par l'artiste

- Bannissement temporaire ou définitif d'un utilisateur du chat

- Mode lent paramétrable par l'artiste

- Filtrage automatique des mots bannis (liste configurable)

# 13. Module Messagerie Directe

## 13.1 Règles d'Accès

|                         |                       |                                          |
|-------------------------|-----------------------|------------------------------------------|
| **Niveau d'abonnement** | **Accès messagerie**  | **Types de messages autorisés**          |
| **Fan non abonné**      | Aucun                 | —                                        |
| **Fan Simple**          | Selon config. artiste | Texte uniquement si activé par l'artiste |
| **Fan VIP**             | Accès par défaut      | Texte + messages vocaux                  |
| **Super Fan**           | Accès complet         | Texte + vocal + vidéo courte             |
| **Artiste**             | Accès complet         | Répond à tous ses fans messagerie        |

## 13.2 Fiche de Message

|                               |            |                                            |
|-------------------------------|------------|--------------------------------------------|
| **Champ**                     | **Type**   | **Description**                            |
| **Référence**                 | Système    | Format : MSG-\[CONV_ID\]-\[XXXXX\]         |
| **Conversation**              | Lien       | Identifiant unique fan-artiste             |
| **Expéditeur / Destinataire** | Lien       | Références profils                         |
| **Type de contenu**           | Liste      | Texte / Audio / Vidéo courte               |
| **Texte**                     | Texte long | Max 1000 caractères                        |
| **Fichier média**             | Fichier    | Audio MP3 max 2 min / Vidéo MP4 max 30 sec |
| **Date et heure**             | Horodatage | UTC                                        |
| **Statut de lecture**         | Liste      | Envoyé / Livré / Lu                        |

# 14. Module Système d'Abonnement

## 14.1 Niveaux d'Abonnement

|                |                     |                                                                                       |
|----------------|---------------------|---------------------------------------------------------------------------------------|
| **Niveau**     | **Prix indicatif**  | **Avantages inclus**                                                                  |
| **Fan Simple** | 5 000 F CFA / mois  | Accès publications abonnés + fil d'actualité prioritaire                              |
| **Fan VIP**    | 10 000 F CFA / mois | Fan Simple + replays lives 48h + remise 10% contenus payants + messages vocaux        |
| **Super Fan**  | 25 000 F CFA / mois | Fan VIP + messagerie complète (texte+vocal+vidéo) + badge exclusif + priorité réponse |

*◦ Prix personnalisables par l'artiste. Minimum plateforme : 1 000 F. Maximum : 100 000 F / mois.*

## 14.2 Fiche d'Abonnement

|                         |          |                                                  |
|-------------------------|----------|--------------------------------------------------|
| **Champ**               | **Type** | **Description**                                  |
| **Référence**           | Système  | Format : SUB-\[ART_ID\]-\[FAN_ID\]-\[AAAAMM\]    |
| **Artiste**             | Lien     | Référence profil artiste                         |
| **Fan**                 | Lien     | Référence profil fan                             |
| **Offre souscrite**     | Lien     | Simple / VIP / Super Fan                         |
| **Prix payé**           | Décimal  | Montant en FCFA à la souscription                |
| **Date de début**       | Date     | Date d'activation                                |
| **Date de fin**         | Date     | Date de renouvellement (J+30)                    |
| **Renouvellement auto** | Booléen  | Par défaut : Oui. Fan peut désactiver.           |
| **Moyen de paiement**   | Lien     | Mode de paiement utilisé                         |
| **Statut**              | Liste    | Actif / En attente / Suspendu / Résilié / Expiré |

## 14.3 Règles de Gestion

- Renouvellement automatique J+30

- Notifications fan : J-3 et J-1 avant renouvellement

- Échec de paiement : 3 tentatives automatiques à 24h d'intervalle

- Après 3 échecs : abonnement suspendu, accès coupé immédiatement

- Résiliation : effective immédiatement, accès maintenu jusqu'à fin de période payée

# 15. Module Pourboires

## 15.1 Montants Disponibles

|                   |                                     |
|-------------------|-------------------------------------|
| **Montant**       | **Disponibilité**                   |
| **500 F CFA**     | Montant prédéfini                   |
| **1 000 F CFA**   | Montant prédéfini                   |
| **Montant libre** | Saisie manuelle — Minimum 100 F CFA |

## 15.2 Fiche de Pourboire

|                               |            |                                   |
|-------------------------------|------------|-----------------------------------|
| **Champ**                     | **Type**   | **Description**                   |
| **Référence**                 | Système    | Format : TIP-\[AAAAMM\]-\[XXXXX\] |
| **Fan (payeur)**              | Lien       | Référence profil fan              |
| **Artiste (receveur)**        | Lien       | Référence profil artiste          |
| **Montant brut**              | Décimal    | Montant en FCFA                   |
| **Commission (20%)**          | Décimal    | Calculé automatiquement           |
| **Montant net artiste (80%)** | Décimal    | Calculé automatiquement           |
| **Contexte**                  | Liste      | Profil artiste / Live streaming   |
| **Live associé**              | Lien       | Si contexte = Live                |
| **Moyen de paiement**         | Liste      | Orange Money / MTN / Wave / Carte |
| **Date et heure**             | Horodatage | UTC                               |
| **Statut**                    | Liste      | En attente / Réussi / Échoué      |

# 16. Module Contenu Payant à l'Unité

## 16.1 Exemples de Contenus Payants

|                       |                                       |                    |
|-----------------------|---------------------------------------|--------------------|
| **Type**              | **Description**                       | **Prix indicatif** |
| **Vidéo exclusive**   | Contenu vidéo premium vendu à l'unité | 1 000 F — 50 000 F |
| **Backstage concert** | Coulisses d'un concert ou événement   | 2 000 F — 20 000 F |
| **Master class**      | Cours ou formation exclusive          | 5 000 F — 50 000 F |

## 16.2 Fiche d'Achat Contenu

|                               |            |                                                  |
|-------------------------------|------------|--------------------------------------------------|
| **Champ**                     | **Type**   | **Description**                                  |
| **Référence achat**           | Système    | Format : ACHAT-\[FAN_ID\]-\[POST_ID\]-\[AAAAMM\] |
| **Fan (acheteur)**            | Lien       | Référence profil fan                             |
| **Contenu acheté**            | Lien       | Référence publication                            |
| **Prix payé**                 | Décimal    | En FCFA. Min 500 F.                              |
| **Commission (20%)**          | Décimal    | Calculé automatiquement                          |
| **Montant net artiste (80%)** | Décimal    | Calculé automatiquement                          |
| **Moyen de paiement**         | Liste      | Orange Money / MTN / Wave / Carte                |
| **Date d'achat**              | Horodatage | UTC                                              |
| **Accès**                     | Booléen    | Permanent à vie. Non révocable.                  |
| **Téléchargement autorisé**   | Booléen    | Configurable par l'artiste. Défaut : Non.        |
| **Statut**                    | Liste      | En attente / Confirmé / Échoué / Remboursé       |

# 17. Module Notifications

## 17.1 Événements et Déclencheurs

|                                   |                  |                    |                                                     |
|-----------------------------------|------------------|--------------------|-----------------------------------------------------|
| **Événement**                     | **Destinataire** | **Canal**          | **Message**                                         |
| **Nouveau contenu artiste suivi** | Fan abonné       | Push               | « \[Artiste\] vient de publier un nouveau contenu » |
| **Live à venir (1h avant)**       | Fan abonné       | Push + SMS         | « \[Artiste\] démarre un live dans 1 heure »        |
| **Live démarré**                  | Fan abonné       | Push               | « \[Artiste\] est en live maintenant »              |
| **Nouveau message**               | Fan / Artiste    | Push               | « Vous avez un nouveau message »                    |
| **Pourboire reçu**                | Artiste          | Push               | « \[Fan\] vous a envoyé \[montant\] »               |
| **Nouvel abonné**                 | Artiste          | Push               | « \[Fan\] s'est abonné à votre offre \[niveau\] »   |
| **Paiement réussi**               | Fan              | Push + Email       | « Votre paiement de \[montant\] est confirmé »      |
| **Échec paiement**                | Fan              | Push + SMS + Email | « Votre renouvellement a échoué »                   |
| **Renouvellement J-3**            | Fan              | Push + Email       | « Votre abonnement sera renouvelé dans 3 jours »    |
| **Versement artiste**             | Artiste          | Push + Email       | « Versement de \[montant\] effectué »               |
| **KYC validé**                    | Artiste          | Push + Email       | « Votre compte artiste est vérifié »                |
| **Contenu supprimé**              | Artiste          | Email + Push       | « Votre contenu \[titre\] a été retiré »            |

## 17.2 Paramètres Utilisateur

- Activation / désactivation de chaque type de notification

- Mode « Ne pas déranger » avec plage horaire configurable

# 18. Module Tableau de Bord Artiste

## 18.1 Section Revenus

|                                   |                                           |               |
|-----------------------------------|-------------------------------------------|---------------|
| **Indicateur**                    | **Description**                           | **Fréquence** |
| **Revenu du mois en cours**       | Cumul temps réel                          | Temps réel    |
| **Évolution mensuelle (12 mois)** | Graphique courbe                          | Mensuel       |
| **Solde disponible**              | Montant disponible pour versement         | Temps réel    |
| **Répartition par source**        | Abonnements / Achats / Pourboires / Lives | Mensuel       |
| **Historique versements**         | Date, montant, statut de chaque versement | Historique    |

## 18.2 Section Abonnés

- Nombre total d'abonnés actifs

- Évolution mensuelle (graphique sur 12 mois)

- Répartition par niveau (Simple / VIP / Super Fan)

- Nouveaux abonnés ce mois / Résiliations ce mois

- Top pays des abonnés

## 18.3 Section Performance Contenus

|                              |                                          |
|------------------------------|------------------------------------------|
| **Indicateur**               | **Description**                          |
| **Vues totales**             | Nombre de lectures par publication       |
| **Taux de complétion vidéo** | % de la vidéo regardée en moyenne        |
| **Likes / Réactions**        | Nombre de réactions par publication      |
| **Revenus par contenu**      | Montant généré par chaque contenu payant |
| **Top 5 publications**       | Meilleurs contenus sur 30 jours          |

## 18.4 Section Lives

- Nombre de lives organisés, pic de spectateurs par live

- Dons reçus par live, durée totale diffusée

# 19. Module Paramètres & Compte

|                         |                                                               |
|-------------------------|---------------------------------------------------------------|
| **Section**             | **Fonctionnalités**                                           |
| **Mon profil**          | Modifier photo, pseudo, biographie, catégorie, liens réseaux  |
| **Sécurité**            | Changer mot de passe, activer 2FA, gérer sessions actives     |
| **Notifications**       | Activer/désactiver chaque type, plage horaire silence         |
| **Paiements**           | Gérer moyens de paiement enregistrés, historique transactions |
| **Abonnements (fan)**   | Voir abonnements actifs, gérer renouvellements, se désabonner |
| **Offres (artiste)**    | Créer/modifier/supprimer les niveaux d'abonnement             |
| **Confidentialité**     | Paramètres visibilité, blocage d'utilisateurs                 |
| **Aide & Support**      | FAQ, formulaire de contact, signalement de problème           |
| **Supprimer le compte** | Désactivation ou suppression définitive avec confirmation     |

**PARTIE 3 — MODÈLE ÉCONOMIQUE**

# 20. Modèle Économique Complet

## 20.1 Commission

La plateforme prélève une commission fixe de 20% sur tous les revenus générés par les artistes.

|                        |                  |                   |                      |
|------------------------|------------------|-------------------|----------------------|
| **Exemple concret**    | **Montant brut** | **Artiste (80%)** | **Plateforme (20%)** |
| **Abonnement Fan VIP** | 10 000 F         | 8 000 F           | 2 000 F              |
| **Contenu payant**     | 5 000 F          | 4 000 F           | 1 000 F              |
| **Pourboire**          | 1 000 F          | 800 F             | 200 F                |
| **Ticket live payant** | 3 000 F          | 2 400 F           | 600 F                |

## 20.2 Sources de Revenus

|        |                      |                                            |                     |
|--------|----------------------|--------------------------------------------|---------------------|
| **N°** | **Source**           | **Description**                            | **Part plateforme** |
| **1**  | Abonnements mensuels | Commission sur chaque abonnement renouvelé | 20%                 |
| **2**  | Commissions          | Prélevées sur tous les paiements           | 20%                 |
| **3**  | Contenus payants     | Commission sur achats à l'unité            | 20%                 |
| **4**  | Pourboires           | Commission sur pourboires et dons live     | 20%                 |
| **5**  | Publicité premium    | Bannières ciblées artistes non-exclusifs   | 100%                |
| **6**  | Événements           | Ticketing virtuel concerts et événements   | 100%                |

## 20.3 Versements Artistes

|                      |                                                                |
|----------------------|----------------------------------------------------------------|
| **Paramètre**        | **Valeur**                                                     |
| **Fréquence**        | Directement — Des qu’un abonnement\achat est effectué          |
| **Seuil minimum**    | 5 000 F CFA cumulés                                            |
| **Modes**            | Orange Money, MTN Money, Wave, Virement bancaire               |
| **Délai traitement** | 48h ouvrées                                                    |
| **Formule solde**    | Solde = Σ transactions réussies (80%) − Σ versements effectués |

**PARTIE 4 — ARCHITECTURE TECHNIQUE**

# 21. Stack Technologique

|                           |                             |                                |                                                           |
|---------------------------|-----------------------------|--------------------------------|-----------------------------------------------------------|
| **Couche**                | **Technologie retenue**     | **Options alternatives**       | **Justification**                                         |
| **App mobile**            | Flutter                     | React Native (Expo SDK 54)     | Cross-platform iOS/Android. Cité dans les spécifications. |
| **Interface web artiste** | React + Vite + Tailwind CSS | Next.js                        | Dashboard analytics navigateur                            |
| **Backend API**           | Python FastAPI              | Django REST Framework, Node.js | Haute perf., async natif, documentation auto.             |
| **Base de données**       | PostgreSQL                  | —                              | Cité dans les spécifications. Neon ou AWS RDS.            |
| **Stockage médias**       | AWS S3                      | —                              | Cité. URLs signées, réplication géographique.             |
| **CDN**                   | Cloudflare                  | AWS CloudFront                 | Cité. Distribution rapide des contenus.                   |
| **Live streaming**        | AWS IVS                     | Agora, LiveKit                 | Tous 3 cités dans les spécifications.                     |
| **Paiement Afrique**      | Flutterwave                 | Paystack                       | Cité. MoMo pan-africain.                                  |
| **Paiement Intl.**        | Stripe                      | Flutterwave                    | Cité. Cartes Visa/Mastercard.                             |
| **Notifications push**    | Firebase FCM                | —                              | Support iOS & Android.                                    |
| **OTP SMS**               | Twilio                      | API Orange / MTN directe       | Envoi codes de vérification.                              |
| **Authentification**      | JWT (access+refresh)        | —                              | Stateless, sécurisé mobile.                               |
| **DRM vidéos**            | Widevine + FairPlay         | —                              | Widevine Android, FairPlay iOS.                           |
| **Monitoring erreurs**    | Sentry                      | —                              | Détection bugs en production.                             |

# 24. Architecture Générale

|               |                                    |                                                  |
|---------------|------------------------------------|--------------------------------------------------|
| **Couche**    | **Composant**                      | **Rôle**                                         |
| **Client**    | Application Flutter / React Native | Interface utilisateur iOS & Android              |
| **Client**    | Interface Web React (Artistes)     | Dashboard analytics navigateur                   |
| **Gateway**   | API Gateway                        | Auth JWT, rate limiting (100 req/min), routage   |
| **Backend**   | FastAPI ou Django                  | Logique métier, endpoints REST, permissions      |
| **Backend**   | Worker Celery / Async              | Tâches asynchrones : emails, MoMo, transcoding   |
| **Data**      | PostgreSQL                         | Données structurées : users, posts, transactions |
| **Storage**   | AWS S3                             | Médias : vidéos, photos, audio, KYC documents    |
| **CDN**       | Cloudflare                         | Distribution rapide des médias aux utilisateurs  |
| **Streaming** | AWS IVS / Agora / LiveKit          | Lives temps réel, faible latence                 |
| **Paiement**  | Flutterwave + Stripe + Paystack    | Mobile Money + carte bancaire                    |
| **Push**      | Firebase FCM                       | Notifications push iOS & Android                 |
| **SMS**       | Twilio                             | OTP vérification, alertes critiques              |

**PARTIE 5 — SÉCURITÉ, JURIDIQUE & CONFORMITÉ**

# 25. Sécurité

|                             |                                                                                        |
|-----------------------------|----------------------------------------------------------------------------------------|
| **Mesure**                  | **Description**                                                                        |
| **Chiffrement des données** | HTTPS obligatoire sur tous les endpoints. Données sensibles chiffrées AES-256 en base. |
| **Protection des contenus** | URLs signées avec expiration 15 min. Accès uniquement via token JWT valide.            |
| **DRM vidéos**              | Widevine (Android) + FairPlay (iOS). Standard industrie pour contenus premium.         |
| **Watermarking dynamique**  | Pseudo du fan intégré invisiblement dans chaque vidéo et photo premium.                |
| **Protection piratage**     | Détection captures d'écran (FLAG_SECURE Android). Signalement communautaire.           |
| **Authentification**        | JWT access 15 min + refresh 7 jours. OTP SMS. 2FA optionnel (TOTP).                    |
| **Sécurité paiements**      | Aucune donnée carte stockée (PCI-DSS via Flutterwave/Stripe). HMAC-SHA256 webhooks.    |
| **Journal d'audit**         | Utilisateur, action, date/heure UTC, IP, valeurs avant/après. Non modifiable.          |
| **Sauvegardes**             | Quotidienne + hebdomadaire (1 mois) + mensuelle (1 an). Réplication 2 zones AWS.       |
| **Verrouillage compte**     | Après 5 tentatives échouées. Déverrouillage par email ou SMS.                          |

# 26. Juridique

|                                    |                                                                                   |                 |
|------------------------------------|-----------------------------------------------------------------------------------|-----------------|
| **Document**                       | **Description**                                                                   | **Obligatoire** |
| **Conditions d'utilisation (CGU)** | Règles d'usage de la plateforme pour fans et artistes. Acceptées à l'inscription. | Oui             |
| **Politique de confidentialité**   | Traitement données personnelles (RGPD-compatible). Droits des utilisateurs.       | Oui             |
| **Contrat créateur**               | Encadre la relation plateforme / créateurs de contenu générique.                  | Oui             |
| **Contrat artiste**                | Commission 20%, versements, clause d'exclusivité partielle, droits d'auteur.      | Oui             |
| **Politique de modération**        | Critères de suppression de contenu, procédure d'appel.                            | Oui             |
| **CGU Mobile Money**               | Conformité réglementations opérateurs (Orange, MTN, Wave) par pays.               | Oui             |

**PARTIE 6 — RÉALISATION**

# 30. Roadmap Produit

|             |           |            |                                                                                                                                                                                                                                                                                  |
|-------------|-----------|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Phase**   | **Nom**   | **Durée**  | **Fonctionnalités**                                                                                                                                                                                                                                                              |
| **Phase 1** | MVP       | 3 mois     | Auth & comptes (Fan + Artiste + KYC), Profils, Feed & découverte, Publication (vidéo/photo/musique/podcast/stories), Abonnements (3 niveaux), Paiements (MoMo + carte), Pourboires, Contenu payant à l'unité, Notifications push, Dashboard artiste basique, Paramètres & compte |
| **Phase 2** | Avancé    | 2 mois     | Live streaming (privé + abonnés + payant), Chat live (dons + réactions), Messagerie directe (texte + vocal + vidéo), Replay live 48h, Analytics complets                                                                                                                         |
| **Phase 3** | Premium   | 2 mois     | Stories avancées, Commentaires, Recherche avancée (filtres), Boost profil artiste, Interface web artiste complète                                                                                                                                                                |
| **Phase 4** | Expansion | En continu | NFT artiste, Marketplace, Ticketing virtuel concerts, Version web fan, Expansion multi-pays                                                                                                                                                                                      |

# 31. Risques du Projet

|        |                                       |                 |                                                                                                       |
|--------|---------------------------------------|-----------------|-------------------------------------------------------------------------------------------------------|
| **N°** | **Risque**                            | **Probabilité** | **Solution proposée**                                                                                 |
| **1**  | Piratage du contenu                   | Haute           | DRM Widevine/FairPlay, watermarking dynamique, signalement communautaire, poursuites légales          |
| **2**  | Artistes peu actifs après inscription | Moyenne         | Exclusivité contractuelle, gestionnaire de compte dédié, incentives sur revenus                       |
| **3**  | Concurrence internationale            | Haute           | Différenciation paiements locaux, focus africain, communauté forte, expérience utilisateur supérieure |
| **4**  | Fraude aux paiements                  | Moyenne         | KYC artistes, limites de transaction, vérification signatures webhooks, monitoring                    |
| **5**  | Échec intégration Mobile Money        | Faible          | Multi-agrégateurs (Flutterwave + Paystack + API directe)                                              |
| **6**  | Performances streaming dégradées      | Faible          | Multi-solutions (AWS IVS + Agora + LiveKit), CDN Cloudflare, tests de charge                          |

# 32. Indicateurs de Performance (KPI)

|                                         |                                                 |                        |
|-----------------------------------------|-------------------------------------------------|------------------------|
| **KPI**                                 | **Description**                                 | **Fréquence de suivi** |
| **Nombre d'utilisateurs**               | Total inscrits fans + artistes                  | Mensuel                |
| **Nombre d'abonnements actifs**         | Abonnements en cours sur la plateforme          | Mensuel                |
| **Revenu mensuel récurrent (MRR)**      | Revenus abonnements en cours                    | Mensuel                |
| **Taux de conversion**                  | Visiteur → inscrit → abonné payant              | Mensuel                |
| **DAU / MAU**                           | Ratio utilisateurs actifs quotidiens / mensuels | Hebdomadaire           |
| **Durée moyenne de session**            | Temps passé dans l'application                  | Hebdomadaire           |
| **Taux de rétention abonnements**       | % abonnements renouvelés à 30/60/90 jours       | Mensuel                |
| **Revenu moyen par utilisateur (ARPU)** | MRR ÷ nombre d'utilisateurs actifs              | Mensuel                |

# 33. Règles de Nommage et Références Automatiques

|                       |                                         |                        |
|-----------------------|-----------------------------------------|------------------------|
| **Type**              | **Format**                              | **Exemple**            |
| **Transaction**       | TXN-\[AAAAMM\]-\[XXXXX\]                | TXN-202604-00001       |
| **Abonnement**        | SUB-\[ART_ID\]-\[FAN_ID\]-\[AAAAMM\]    | SUB-A042-F189-202604   |
| **Publication**       | POST-\[ART_ID\]-\[AAAAMMJJ\]-\[XXX\]    | POST-A042-20260415-007 |
| **Live**              | LIVE-\[ART_ID\]-\[AAAAMMJJ\]-\[XXX\]    | LIVE-A042-20260415-001 |
| **Message**           | MSG-\[CONV_ID\]-\[XXXXX\]               | MSG-C0091-00234        |
| **Pourboire**         | TIP-\[AAAAMM\]-\[XXXXX\]                | TIP-202604-00089       |
| **Achat contenu**     | ACHAT-\[FAN_ID\]-\[POST_ID\]-\[AAAAMM\] | ACHAT-F189-P031-202604 |
| **Versement artiste** | VERS-\[ART_ID\]-\[AAAAMM\]              | VERS-A042-202604       |
| **Ticket live**       | TICKET-\[LIVE_ID\]-\[FAN_ID\]           | TICKET-L007-F189       |

# 34. Livrables Attendus

## 34.1 Application

- \[ \] Application mobile iOS fonctionnelle (TestFlight ou .ipa)

- \[ \] Application mobile Android fonctionnelle (.apk / .aab ou Play Console)

- \[ \] Tous les modules Phase 1 opérationnels

- \[ \] Paiements Mobile Money + carte bancaire intégrés et testés

- \[ \] Notifications push opérationnelles

## 34.2 Technique

- \[ \] API REST documentée (OpenAPI / Swagger)

- \[ \] Base de données PostgreSQL sécurisée et migrée

- \[ \] Scripts de sauvegarde automatique configurés

- \[ \] Documentation technique complète (architecture, BDD, API)

- \[ \] Code source versionné Git livré avec historique

- \[ \] Pipeline CI/CD configuré

## 34.3 Documentation Utilisateur

- \[ \] Guide utilisateur Fan (onboarding, abonnement, paiement, live)

- \[ \] Guide utilisateur Artiste (publication, live, dashboard, versements)

- \[ \] Guide Administrateur (modération, gestion, paramètres)

## 34.4 Formation & Support

- \[ \] Formation équipe opérationnelle

- \[ \] Formation 20 artistes fondateurs

- \[ \] Déploiement production accompagné et validé

- \[ \] Garantie bugs minimum 3 mois post-livraison

# 35. Plan de Déploiement

|             |                                                                                                   |              |            |
|-------------|---------------------------------------------------------------------------------------------------|--------------|------------|
| **Phase**   | **Modules**                                                                                       | **Priorité** | **Durée**  |
| **Phase 1** | Auth + Profils + Feed + Publication + Abonnements + Paiements + Notifications + Dashboard basique | Critique     | 3 mois     |
| **Phase 2** | Live Streaming + Chat + Messagerie + Replay + Analytics complets                                  | Haute        | 2 mois     |
| **Phase 3** | Stories avancées + Commentaires + Recherche avancée + Boost profil                                | Moyenne      | 2 mois     |
| **Phase 4** | NFT + Marketplace + Ticketing + Version web + Expansion                                           | Faible       | En continu |

## 35.1 Environnements

|                       |                                                   |                                  |
|-----------------------|---------------------------------------------------|----------------------------------|
| **Environnement**     | **Usage**                                         | **Accès**                        |
| **Développement**     | Tests développeurs, intégration CI/CD             | Équipe technique uniquement      |
| **Staging (recette)** | Validation fonctionnelle, tests UAT Product Owner | Équipe technique + Product Owner |
| **Production**        | Application live utilisateurs finaux              | Utilisateurs finaux              |

## 35.2 Critères d'Acceptation

- Tests fonctionnels validés par le Product Owner sur staging

- Tests de charge : 1 000 utilisateurs simultanés sans dégradation

- Taux de bug bloquant : 0

- Documentation livrée et à jour

- Formation utilisateurs pilotes effectuée

*Document confidentiel — Version 2.0 — 12 Avril 2026*
