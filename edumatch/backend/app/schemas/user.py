from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime, date
from typing import Optional

# --- 1. Schéma de base (Champs communs à tous) ---
class UserBase(BaseModel):
    nom: str
    prenom: Optional[str] = None
    email: EmailStr
    role: str # "étudiant" ou "professeur"

# --- 2. Schéma pour l'inscription (Register) ---
# On permet à l'étudiant de ne pas remplir ville/niveau tout de suite
class UserCreate(UserBase):
    password: str
    date_naissance: Optional[date] = None
    ville: Optional[str] = None
    niveau: Optional[str] = None

# --- 3. Schéma pour la connexion (Login) ---
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# --- 4. Schéma pour la réponse (Données renvoyées au client) ---
class UserOut(BaseModel):
    id: int
    nom: str
    prenom: Optional[str] = None
    email: EmailStr
    role: str
    statut: str
    date_naissance: Optional[date] = None
    created_at: datetime

    # Indispensable pour transformer les objets SQLAlchemy en JSON
    model_config = ConfigDict(from_attributes=True)

# --- 5. Schéma pour le Token ---
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut