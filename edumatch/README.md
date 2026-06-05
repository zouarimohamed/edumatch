<div align="center">

# 🎓 EduMatch

### Plateforme intelligente de mise en relation apprenants-formateurs

**Projet de Fin d'Études (PFE) — Application web fullstack avec IA intégrée**

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org)

</div>

---

## 📋 Table des matières

- [Présentation](#présentation)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Lancer le projet](#lancer-le-projet)
- [Structure du projet](#structure-du-projet)
- [Variables d'environnement](#variables-denvironnement)
- [Migrations SQL](#migrations-sql)
- [Comptes de test](#comptes-de-test)
- [Fonctionnalités principales](#fonctionnalités-principales)
- [Notes importantes](#notes-importantes)

---

## 🎯 Présentation

**EduMatch** est une plateforme web intelligente développée dans le cadre d'un PFE à l'**Institut International de Technologie (IIT)**, en partenariat avec l'agence digitale **21C'Digital — Sfax, Tunisie**.

Elle connecte des **étudiants** avec des **formateurs qualifiés**, via un système de matching multicritères, un chatbot IA conversationnel (**EduBot**), et un tableau de bord d'administration complet.

---

## 🛠 Stack technique

| Couche | Technologie | Rôle |
|--------|------------|------|
| Frontend | React 18 + Vite | Interface SPA |
| Backend | FastAPI (Python 3.11) | API REST |
| Base de données | PostgreSQL 15+ | Stockage relationnel |
| ORM | SQLAlchemy | Accès données |
| IA / Chatbot | Groq API (LLaMA 3.1) | EduBot |
| Authentification | JWT + bcrypt | Sécurité |
| Charts | Chart.js 4 | Analytiques admin |
| Styling | CSS-in-JS (inline styles) | UI dynamique |

---

## ✅ Prérequis

| Outil | Version minimale | Lien |
|-------|-----------------|------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Python | 3.11+ | [python.org](https://python.org) |
| PostgreSQL | 15+ | [postgresql.org](https://postgresql.org) |
| Git | — | [git-scm.com](https://git-scm.com) |

---

## 📦 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/edumatch.git
cd edumatch
```

---

### 2. Backend — FastAPI

```bash
cd backend

# Créer l'environnement virtuel
python -m venv venv_new

# Activer l'environnement
# Windows :
venv_new\Scripts\activate
# Mac/Linux :
source venv_new/bin/activate

# Installer les dépendances
pip install -r requirements.txt
```

Créer le fichier **`backend/.env`** :

```env
DATABASE_URL=postgresql://postgres:votre_mot_de_passe@localhost:5432/pfe_db
SECRET_KEY=votre_secret_key_jwt_256bits_changez_moi
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GROQ_API_KEY=gsk_votre_cle_groq_ici
```

> 💡 Clé Groq gratuite sur [console.groq.com](https://console.groq.com)

Créer la base de données PostgreSQL :

```sql
CREATE DATABASE pfe_db;
```

Créer les tables :

```bash
python -c "from app.database import Base, engine; Base.metadata.create_all(engine)"
```

---

### 3. Frontend — React + Vite

```bash
cd frontend
npm install
```

---

## 🚀 Lancer le projet

Ouvrez **deux terminaux** séparés :

**Terminal 1 — Backend :**

```bash
cd backend

# Windows
venv_new\Scripts\activate
# Mac/Linux
source venv_new/bin/activate

uvicorn app.main:app --reload --port 8001
```

> API disponible sur **http://localhost:8001**
> Swagger : **http://localhost:8001/docs**

**Terminal 2 — Frontend :**

```bash
cd frontend
npm run dev
```

> Application disponible sur **http://localhost:5173**

---

## 🗂 Structure du projet

```
edumatch/
├── backend/
│   ├── app/
│   │   ├── main.py              # Point d'entrée FastAPI + CORS
│   │   ├── config.py            # Variables d'environnement
│   │   ├── database.py          # Connexion PostgreSQL + SQLAlchemy
│   │   ├── models/              # Modèles ORM
│   │   │   ├── user.py
│   │   │   ├── professeur.py
│   │   │   ├── etudiant.py
│   │   │   ├── reservation.py
│   │   │   ├── disponibilite.py
│   │   │   └── ...
│   │   ├── routers/             # Routes API par domaine
│   │   │   ├── auth.py          # Inscription / Connexion / JWT
│   │   │   ├── professeurs.py   # Profils, disponibilités, validation
│   │   │   ├── etudiants.py     # Profil étudiant, notifications
│   │   │   ├── reservations.py  # Réservations, confirmations
│   │   │   ├── admin.py         # Dashboard admin complet
│   │   │   ├── admin_finances.py
│   │   │   ├── chatbot.py       # EduBot — Groq API + matching
│   │   │   ├── messages.py      # Messagerie directe
│   │   │   └── avis.py          # Évaluations post-séance
│   │   ├── schemas/             # Schémas Pydantic (validation)
│   │   └── utils/               # Sécurité, dépendances JWT
│   ├── static/                  # Uploads (photos, certificats)
│   ├── seed_profs.py            # Données de test professeurs
│   ├── requirements.txt
│   └── .env                     # ⚠️ Ne pas committer
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Admin.jsx             # Dashboard admin complet
    │   │   ├── ProfDashboard.jsx     # Espace professeur
    │   │   ├── EtudiantDashboard.jsx # Espace étudiant
    │   │   ├── Profs.jsx             # Liste formateurs + recherche
    │   │   ├── Chatbot.jsx           # Interface EduBot
    │   │   ├── Disponibilites.jsx    # Gestion créneaux prof
    │   │   ├── MesReservations.jsx
    │   │   ├── Paiement.jsx
    │   │   └── FinancesTab.jsx
    │   ├── components/
    │   │   ├── Layout.jsx            # Sidebar + topbar + notifications
    │   │   └── ProfModal.jsx         # Fiche prof + réservation + signalement
    │   ├── context/
    │   │   └── AuthContext.jsx       # État auth global
    │   ├── services/
    │   │   ├── api.js                # Axios + intercepteurs JWT
    │   │   └── exportPDF.js          # Export rapports PDF
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

---

## 🔐 Variables d'environnement

### `backend/.env` — référence complète

```env
# Base de données PostgreSQL
DATABASE_URL=postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/pfe_db

# Sécurité JWT (minimum 32 caractères, aléatoire)
SECRET_KEY=votre_secret_jwt_super_securise_256bits_changez_moi
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Groq API — EduBot (LLaMA 3.1)
GROQ_API_KEY=gsk_votre_cle_groq_ici
```

---

## 🗄 Migrations SQL

Si vous reprenez une base existante, appliquez ces scripts dans **DBeaver** ou **psql** dans l'ordre :

```bash
# 1. Système de blocage utilisateurs
psql -d pfe_db -f migrations/migration_blocage_system.sql

# 2. Tables notifications
psql -d pfe_db -f migrations/migration_notifications.sql

# 3. Colonnes supplémentaires (raison_blocage, soumis_le…)
psql -d pfe_db -f migrations/migration_nouvelles_colonnes.sql

# 4. Niveaux dans les disponibilités (calendrier admin)
psql -d pfe_db -f migrations/migration_niveaux.sql

# 5. Suivi des resoumissions prof
psql -d pfe_db -f migrations/migration_soumis_le.sql
```

---

## 👤 Comptes de test

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@edumatch.tn | admin123 |
| Professeur | mohamed@test.tn | password123 |
| Professeur | iheb.gharbi51@edumatch.tn | password123 |
| Étudiant | *(créer via inscription)* | — |

> Pour ajouter des professeurs de test avec des données complètes :
> ```bash
> cd backend && python seed_profs.py
> ```

---

## ✨ Fonctionnalités principales

### 👨‍🎓 Étudiant
- Recherche et filtrage de formateurs (matière, niveau, ville, budget, mode)
- Réservation de séances (présentiel / en ligne)
- Messagerie directe avec le formateur
- Chatbot IA **EduBot** — recommandation personnalisée
- Système d'avis et notation post-séance
- Signalement de professeurs
- Paiement simulé

### 👨‍🏫 Formateur
- Tableau de bord avec gestion des réservations
- Création de disponibilités avec niveau et description de séance
- Workflow de validation par l'administration
- Messagerie avec les étudiants
- Gestion des gains et historique des paiements
- Profil avec certificats, matières et tarifs par niveau

### 🛡️ Administrateur
- Validation / refus des formateurs avec raison
- Gestion des utilisateurs (blocage / déblocage)
- Traitement des signalements (ignorer / avertir / bloquer)
- Référentiel académique (Domaines → Niveaux → Matières)
- Calendrier des réservations confirmées
- Dashboard analytiques complet avec graphiques (Chart.js)
- Tableau de bord financier
- Système de notifications temps réel

### 🤖 EduBot — Chatbot IA
- Compréhension des besoins en langage naturel
- Extraction des critères (matière, niveau, budget, mode, ville)
- Score de matching multicritères sur 100 points
- Recommandation des 3 formateurs les plus adaptés

**Pondération du scoring :**

| Critère | Poids |
|---------|-------|
| Niveau | 40 pts |
| Matière | 25 pts |
| Ville | 15 pts |
| Budget | 10 pts |
| Mode | 5 pts |
| Réputation | 5 pts |

---

## 🔧 Commandes utiles

```bash
# Réinitialiser complètement la base de données
cd backend
python -c "from app.database import Base, engine; Base.metadata.drop_all(engine); Base.metadata.create_all(engine)"

# Installer psycopg2 si erreur de driver
pip install psycopg2-binary

# Build frontend pour production
cd frontend && npm run build

# Vérifier que le backend répond
curl http://localhost:8001/docs
```

---

## 📝 Notes importantes

- Le backend tourne sur le **port 8001** (pas 8000)
- Le frontend tourne sur le **port 5173**
- PostgreSQL doit être démarré avant le backend
- Les fichiers uploadés (photos, certificats) sont dans `backend/static/uploads/`
- La clé `GROQ_API_KEY` est **requise** pour que le chatbot fonctionne
- Ne jamais committer le fichier `.env` — il est dans `.gitignore`

---

## 🙈 .gitignore recommandé

```gitignore
# Backend
backend/.env
backend/venv_new/
backend/venv/
backend/__pycache__/
backend/**/__pycache__/
backend/static/uploads/
*.pyc
*.pyo

# Frontend
frontend/node_modules/
frontend/dist/
frontend/.env

# Divers
.DS_Store
Thumbs.db
*.log
```

---

<div align="center">

**Développé par Mohamed Zouari**
Licence Informatique — IIT Sfax · PFE 2026
En partenariat avec **21C'Digital** 🇹🇳

</div>