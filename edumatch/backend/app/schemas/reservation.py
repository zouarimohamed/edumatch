from pydantic import BaseModel
from typing import Optional
from datetime import date, time, datetime
from decimal import Decimal

class ReservationCreate(BaseModel):
    prof_id:          int
    disponibilite_id: Optional[int] = None
    date_cours:       date
    heure_debut:      time
    heure_fin:        time
    mode_seance:      Optional[str] = "presentiel"
    notes_etudiant:   Optional[str] = None

class ReservationUpdate(BaseModel):
    statut: str  # confirmé | refusé | annulé

class ReservationOut(BaseModel):
    id:               int
    etudiant_id:      int
    prof_id:          int
    disponibilite_id: Optional[int] = None
    date_cours:       date
    heure_debut:      time
    heure_fin:        time
    statut:           str
    mode_seance:      Optional[str] = "presentiel"
    lien_meet:        Optional[str] = None
    tarif_applique:   Optional[Decimal] = None
    created_at:       Optional[datetime] = None

    class Config:
        from_attributes = True