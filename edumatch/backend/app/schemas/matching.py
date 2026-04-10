from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal

class PreferencesCreate(BaseModel):
    matiere_id: Optional[int] = None
    niveau_id: Optional[int] = None
    ville: Optional[str] = None
    budget_max: Optional[Decimal] = None
    disponibilite: Optional[str] = None
    priorite_note: bool = False
    priorite_prix: bool = False

class MatchResult(BaseModel):
    prof_id: int
    nom: str
    matiere: Optional[str]
    ville: Optional[str]
    tarif: Optional[Decimal]
    note_moyenne: Optional[Decimal]
    score: int
    photo_url: Optional[str]

class ChatMessage(BaseModel):
    message: str
    history: Optional[List[dict]] = []
