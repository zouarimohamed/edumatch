# 🎓 EduMatch — Plateforme de Mise en Relation Étudiants / Formateurs

> Projet de Fin d'Études (PFE) — Application web fullstack avec IA intégrée

---

## 📋 Table des matières

- [Présentation](#présentation)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Lancer le projet](#lancer-le-projet)
- [Structure du projet](#structure-du-projet)
- [Variables d'environnement](#variables-denvironnement)
- [Comptes de test](#comptes-de-test)
- [Fonctionnalités principales](#fonctionnalités-principales)

---

## 🎯 Présentation

EduMatch est une plateforme intelligente qui met en relation des **étudiants** avec des **formateurs** qualifiés. Elle intègre un **chatbot IA** capable d'analyser les besoins pédagogiques et de recommander le formateur le plus adapté.

---

## 🛠 Stack technique

| Couche | Technologie |
|--------|------------|
| Frontend | React 18 + Vite |
| Backend | FastAPI (Python 3.11) |
| Base de données | PostgreSQL 15+ |
| ORM | SQLAlchemy |
| IA / Chatbot | Groq API (LLaMA) |
| Authentification | JWT (jose) |
| Styling | CSS-in-JS (inline styles) |

---

## ✅ Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** v18+ → [nodejs.org](https://nodejs.org)
- **Python** 3.11+ → [python.org](https://python.org)
- **PostgreSQL** 15+ → [postgresql.org](https://postgresql.org)
- **Git** → [git-scm.com](https://git-scm.com)

---

## 📦 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/votre-repo/edumatch.git
cd edumatch
```

---

### 2. Backend — FastAPI

```bash
cd backend

# Créer l'environnement virtuel
python -m venv venv_new

# Activer l'environnement (Windows)
venv_new\Scripts\activate

# Activer l'environnement (Mac/Linux)
source venv_new/bin/activate

# Installer les dépendances
pip install -r requirements.txt
```

Créer le fichier `.env` dans `backend/` :

```env
DATABASE_URL=postgresql://postgres:votre_mot_de_passe@localhost:5432/pfe_db
SECRET_KEY=votre_secret_key_jwt
GROQ_API_KEY=gsk_votre_cle_groq
```

Créer la base de données PostgreSQL :

```sql
CREATE DATABASE pfe_db;
```

---

### 3. Frontend — React

```bash
cd frontend

# Installer les dépendances
npm install
```

---

## 🚀 Lancer le projet

### Backend (FastAPI)

```bash
cd backend

# Activer l'environnement virtuel (Windows)
venv_new\Scripts\activate

# Lancer le serveur
uvicorn app.main:app --reload --port 8001
```

> L'API sera disponible sur : **http://localhost:8001**
> Documentation Swagger : **http://localhost:8001/docs**

---

### Frontend (React + Vite)

```bash
cd frontend

npm run dev
```

> L'application sera disponible sur : **http://localhost:5173**

---

### Lancer les deux en même temps (Windows)

Ouvrez **deux terminaux** séparés :

**Terminal 1 — Backend :**
```bash
cd backend
venv_new\Scripts\activate
uvicorn app.main:app --reload --port 8001
```

**Terminal 2 — Frontend :**
```bash
cd frontend
npm run dev
```

---

## 🗂 Structure du projet

```
edumatch/
├── backend/
│   ├── app/
│   │   ├── main.py              # Point d'entrée FastAPI
│   │   ├── database.py          # Connexion PostgreSQL
│   │   ├── models/              # Modèles SQLAlchemy
│   │   │   ├── user.py
│   │   │   ├── professeur.py
│   │   │   ├── etudiant.py
│   │   │   ├── reservation.py
│   │   │   ├── disponibilite.py
│   │   │   └── ...
│   │   ├── routers/             # Routes API
│   │   │   ├── auth.py
│   │   │   ├── professeurs.py
│   │   │   ├── etudiants.py
│   │   │   ├── reservations.py
│   │   │   ├── admin.py
│   │   │   ├── admin_finances.py
│   │   │   ├── chatbot.py
│   │   │   ├── messages.py
│   │   │   └── avis.py
│   │   ├── schemas/             # Schémas Pydantic
│   │   └── utils/               # Utilitaires (JWT, deps)
│   ├── static/                  # Uploads (photos, certificats)
│   ├── requirements.txt
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── pages/               # Pages principales
    │   │   ├── Admin.jsx
    │   │   ├── ProfDashboard.jsx
    │   │   ├── EtudiantDashboard.jsx
    │   │   ├── Profs.jsx
    │   │   ├── Chatbot.jsx
    │   │   ├── Disponibilites.jsx
    │   │   ├── MesReservations.jsx
    │   │   ├── Paiement.jsx
    │   │   ├── FinancesTab.jsx
    │   │   └── ...
    │   ├── services/
    │   │   ├── api.js           # Instance Axios configurée
    │   │   └── exportPDF.js
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

---

## 🔐 Variables d'environnement

### `backend/.env`

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pfe_db
SECRET_KEY=votre_secret_jwt_super_securise_256bits_changez_moi
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GROQ_API_KEY=gsk_votre_cle_groq_ici
```

---

## 👤 Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@edumatch.tn | admin123 |
| Professeur | mohamed@test.tn | password123 |
| Professeur | iheb.gharbi51@edumatch.tn | password123 |
| Étudiant | *(créer via inscription)* | — |

---

## ✨ Fonctionnalités principales

### 👨‍🎓 Étudiant
- Recherche et filtrage de formateurs par matière, niveau, ville, mode
- Système de favoris
- Réservation de séances (présentiel / en ligne)
- Chat en temps réel avec le formateur
- Paiement simulé avec carte
- Chatbot IA — recommandation personnalisée de formateur

### 👨‍🏫 Formateur
- Dashboard avec gestion des réservations
- Création de disponibilités avec niveau et description
- Chat avec les étudiants
- Gestion des gains et historique des paiements
- Profil avec certificats, matières et tarifs

### 🛡️ Admin
- Validation / refus des formateurs
- Dashboard analytiques complet (réservations, entonnoir, performance)
- Gestion du référentiel (domaines, niveaux, matières, villes)
- Approbation des demandes de nouvelles matières
- Tableau de bord financier (CA, taux de paiement, alertes)

### 🤖 Chatbot IA
- Recommandation de formateurs selon les besoins
- Analyse de séries d'exercices pour identifier la matière
- Matching étudiant ↔ formateur 1:1

---

## 🔧 Commandes utiles

```bash
# Réinitialiser la base de données
cd backend
python -c "from app.database import Base, engine; Base.metadata.drop_all(engine); Base.metadata.create_all(engine)"

# Installer psycopg2 (si erreur)
pip install psycopg2-binary --break-system-packages

# Build frontend pour production
cd frontend
npm run build
```

---

## 📝 Notes importantes

- Le backend tourne sur le **port 8001** (pas 8000)
- PostgreSQL doit être en mode **lecture/écriture** (pas standby)
- Les fichiers uploadés sont dans `backend/static/uploads/`
- La clé Groq est requise pour le chatbot

