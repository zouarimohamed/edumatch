from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.models.user import User
from app.models.etudiant import Etudiant
from app.models.professeur import Professeur
from app.schemas.user import UserCreate, UserLogin, UserOut, Token
from app.utils.security import hash_password, verify_password, create_access_token
from app.utils.dependencies import get_current_user
from datetime import datetime

router = APIRouter()


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserOut)
def update_me(data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if "nom"    in data: current_user.nom    = data["nom"]
    if "prenom" in data: current_user.prenom = data["prenom"]
    db.commit(); db.refresh(current_user)
    return current_user


# ── GET /status — vérifie si l'utilisateur connecté est encore actif ──────────
# Appelé périodiquement par le frontend pour détecter un blocage en temps réel
@router.get("/status")
def check_status(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Retourne le statut actuel de l'utilisateur connecté.
    Si bloqué → retourne 403 avec la raison (le frontend le déconnecte).
    """
    # Recharger depuis la BDD pour avoir le statut le plus récent
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur introuvable")

    if user.statut == "bloqué":
        # SQL brut pour lire raison_blocage même si absent du modèle ORM
        row = db.execute(
            text("SELECT raison_blocage FROM users WHERE id = :uid"),
            {"uid": user.id}
        ).fetchone()
        raison_admin = (row.raison_blocage or "") if row else ""
        raise HTTPException(
            status_code=403,
            detail={
                "code":    "COMPTE_BLOQUE",
                "message": "Votre compte a été suspendu par l'administration.",
                "raison":  raison_admin,
            }
        )

    return {"statut": user.statut, "actif": True}


# ── POST /login ───────────────────────────────────────────────────────────────
@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    # ── VÉRIFICATION BLOCAGE AU LOGIN ─────────────────────────────
    if user.statut == "bloqué":
        # SQL brut pour lire raison_blocage même si absent du modèle ORM
        row = db.execute(
            text("SELECT raison_blocage FROM users WHERE id = :uid"),
            {"uid": user.id}
        ).fetchone()
        raison_admin = (row.raison_blocage or "") if row else ""
        raise HTTPException(
            status_code=403,
            detail={
                "code":    "COMPTE_BLOQUE",
                "message": "Votre compte a été suspendu par l'administration.",
                "raison":  raison_admin,
            }
        )

    token = create_access_token({"sub": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": UserOut.model_validate(user)}


# ── POST /register ────────────────────────────────────────────────────────────
@router.post("/register", response_model=Token, status_code=201)
def register(data: UserCreate, db: Session = Depends(get_db)):
    role_db = data.role.lower()
    if role_db not in ["étudiant", "professeur"]:
        raise HTTPException(status_code=400, detail="Role invalide")
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    user = User(
        nom=data.nom, prenom=data.prenom, email=data.email,
        password=hash_password(data.password), role=role_db, statut="actif"
    )
    db.add(user); db.flush()
    if role_db == "étudiant":
        db.add(Etudiant(user_id=user.id))
    else:
        db.add(Professeur(user_id=user.id, statut_validation="en_attente"))
    db.commit(); db.refresh(user)

    token = create_access_token({"sub": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": UserOut.model_validate(user)}