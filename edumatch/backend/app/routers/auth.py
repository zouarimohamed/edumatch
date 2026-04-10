from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.etudiant import Etudiant
from app.models.professeur import Professeur
from app.schemas.user import UserCreate, UserLogin, UserOut, Token
from app.utils.security import hash_password, verify_password, create_access_token
from app.utils.dependencies import get_current_user

router = APIRouter()

# --- NOUVELLE ROUTE : RÉCUPÉRER MON PROFIL (Admin, Prof, Etudiant) ---
@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Cette route fonctionne pour TOUT LE MONDE car elle lit la table 'User'"""
    return current_user

# --- NOUVELLE ROUTE : MODIFIER MON PROFIL (Admin, Prof, Etudiant) ---
@router.put("/me", response_model=UserOut)
def update_me(data: dict, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Permet à n'importe qui de changer son Nom et Prénom"""
    if "nom" in data: current_user.nom = data["nom"]
    if "prenom" in data: current_user.prenom = data["prenom"]
    # L'admin n'ayant pas de table spécifique, on ne peut modifier que ces champs
    db.commit()
    db.refresh(current_user)
    return current_user

# --- LOGIN & REGISTER ---
@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    token = create_access_token({"sub": user.email, "role": user.role})
    return {"access_token": token, "token_type": "bearer", "user": UserOut.model_validate(user)}

@router.post("/register", response_model=Token, status_code=201)
def register(data: UserCreate, db: Session = Depends(get_db)):

    role_db = data.role.lower()

    if role_db not in ["étudiant", "professeur"]:
        raise HTTPException(status_code=400, detail="Role invalide")

    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    user = User(
        nom=data.nom,
        prenom=data.prenom,
        email=data.email,
        password=hash_password(data.password),
        role=role_db,
        statut="actif"
    )

    db.add(user)
    db.flush()

    if role_db == "étudiant":
        db.add(Etudiant(user_id=user.id))
    else:
        db.add(Professeur(user_id=user.id, statut_validation="en_attente"))

    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email, "role": user.role})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserOut.model_validate(user)
    }