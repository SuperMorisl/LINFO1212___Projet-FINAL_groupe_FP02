# LINFO1212---Projet-FINAL
# 🎬 C’est tourné ! — Plateforme communautaire de films & séries

Bienvenue sur le dépôt GitHub du projet **C’est tourné !**, une plateforme web communautaire permettant aux utilisateurs de découvrir, noter et commenter films et séries.  
Chaque membre peut contribuer au catalogue, participer aux discussions et faire évoluer le classement des œuvres grâce à un système de notes et d’expérience.

---

## 🚀 Fonctionnalités principales

### 🎭 Gestion des utilisateurs
- Création de compte et connexion.
- Page de profil affichant :
  - le niveau,
  - le nombre de publications,
  - les notations réalisées.
- Déconnexion sécurisée.

### 🎥 Gestion des œuvres
- Ajout d’un film ou d’une série avec :
  - titre,
  - description,
  - année de sortie,
  - visuel optionnel.
- Consultation des détails d’une œuvre (synopsis, note moyenne, commentaires).
- Notation et commentaires par les utilisateurs.

### 📊 Classement et tendances
- Classement dynamique basé sur les votes de la communauté.
- Affichage des tendances du mois.
- Recherche et filtres : titre, genre, popularité.

### 🏆 Système de niveaux et badges
- Accumulation d’expérience lors des actions (commenter, noter, publier).
- Augmentation automatique du niveau.
- Déblocage de badges visibles dans le profil.

### 💬 Communauté et interactions
- Commentaires et réponses en chaîne.
- Affichage cohérent des discussions (chronologique ou pertinent).

### 🛠️ Administration et modération
- Certains utilisateurs peuvent devenir administrateurs.
- Actions possibles :
  - suppression d’œuvres,
  - corrections limitées pour éviter les abus.
- Réservé aux membres de confiance.

---

## 🧱 Technologies utilisées

- **Node.js** — back-end
- **EJS** — templates
- **CSS** — front-end
- **Base de données** — gestion des utilisateurs, œuvres, commentaires, niveaux

---

## 📄 Aperçu des pages

### 🏠 Page d’accueil
- Œuvres populaires du mois
- Classement dynamique

### 📘 Page de détails d’une œuvre
- Synopsis, année, visuel
- Notes et commentaires

### ➕ Page d’ajout
- Formulaire d’ajout d’une œuvre (utilisateur connecté)

### 👤 Page de profil
- Informations utilisateur
- Niveau et contributions

---

## 👥 Répartition du travail

| Membre | Rôle principal |
|--------|----------------|
| **Younes** | Front-end (EJS, CSS) |
| **Sofia** | Tests, back-end |
| **Maurice** | Base de données, back-end |

> Chaque membre a malgré tout participé aux autres parties.

---

## 🧪 Scénarios Gherkin

Le projet inclut plusieurs scénarios, notamment :
- ajout d’une œuvre,
- montée de niveau,
- ajout d’un avis,
- inscription,
- consultation des tendances par un utilisateur non inscrit.

---

## 📦 Installation

```bash
git clone <url-du-projet>
cd <nom-du-dossier>
npm install
