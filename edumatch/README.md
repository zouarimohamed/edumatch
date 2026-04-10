# 🎓 EduMatch – Plateforme Intelligente de Matching Professeur-Étudiant

> Projet de Fin d'Études (PFE) – Architecture 3-Tier : React.js / FastAPI / PostgreSQL

---

## 🗂️ Structure du projet

```
edumatch/
├── backend/                  # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── main.py           # Point d'entrée
│   │   ├── config.py         # Configuration
│   │   ├── database.py       # Connexion DB
│   │   ├── models/           # 9 modèles SQLAlchemy
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── routers/          # 8 routers REST
│   │   ├── services/         # Matching + Chatbot IA
│   │   └── utils/            # JWT + bcrypt
│   ├── requirements.txt
│   └── .env
├── frontend/                 # React.js 18
│   ├── src/
│   │   ├── App.jsx           # Router principal
│   │   ├── pages/            # 7 pages
│   │   ├── components/       # Composants réutilisables
│   │   ├── services/         # API + Auth
│   │   └── context/          # AuthContext (JWT)
│   └── package.json
└── database/
    └── schema.sql            # Schema PostgreSQL complet
```

---

## ⚙️ Installation & Démarrage

### Prérequis
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### 1. Base de données
```bash
psql -U postgres -c "CREATE DATABASE pfe_db;"
psql -U postgres -d pfe_db -f database/schema.sql
```

### 2. Backend FastAPI
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env .env.local              # Puis éditer les valeurs
uvicorn app.main:app --reload --port 8000
```
→ API Docs: http://localhost:8000/docs

### 3. Frontend React
```bash
cd frontend
npm install
npm start
```
→ App: http://localhost:3000

---

## 🔐 Variables d'environnement (.env)

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/pfe_db
SECRET_KEY=votre_secret_jwt_256bits
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ANTHROPIC_API_KEY=sk-ant-votre_cle
```

---

## 🔌 API REST – Routes principales

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | /api/auth/register | Inscription | ❌ |
| POST | /api/auth/login | Connexion JWT | ❌ |
| GET | /api/professeurs/ | Liste professeurs | ✅ |
| GET | /api/matching/top | Top matches IA | ✅ Étudiant |
| POST | /api/chatbot/message | Message EduBot | ✅ Étudiant |
| POST | /api/reservations/ | Créer réservation | ✅ Étudiant |
| PUT | /api/reservations/{id} | Confirmer/Refuser | ✅ Prof |
| POST | /api/avis/ | Laisser un avis | ✅ Étudiant |
| GET | /api/admin/stats | Statistiques | ✅ Admin |
| PUT | /api/admin/professeurs/{id}/valider | Valider prof | ✅ Admin |

---

## 🧠 Algorithme de Matching (Score sur 100%)

| Critère | Poids | Calcul |
|---------|-------|--------|
| Matière | 30% | Correspondance exacte |
| Ville | 20% | Exacte +20, grande ville +10 |
| Niveau | 20% | Niveau dans la liste du prof |
| Budget | 15% | ≤ budget: +15, ≤ 120%: +7 |
| Note moyenne | 10% | (note/5) × 10 |
| Disponibilité | 5% | Au moins 1 créneau disponible |

---

## 👥 Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | admin@edumatch.tn | admin123 |
| Étudiant | etudiant@test.tn | test123 |
| Professeur | prof@test.tn | test123 |

---

## 🎨 Stack Technique

- **Frontend**: React 18, React Router v6, Axios, CSS Variables
- **Backend**: FastAPI, SQLAlchemy 2, Pydantic v2, Alembic
- **Base de données**: PostgreSQL 14, 10 tables, indexes optimisés
- **Auth**: JWT (python-jose) + bcrypt (passlib)
- **IA**: Anthropic Claude API (claude-sonnet)
- **Design**: Dark theme SaaS, Google Fonts (Syne + DM Sans)

---

*EduMatch PFE 2026 – Mention Très Bien* 🎓
