# Dans ton fichier schemas.py, trouve DisponibiliteCreate et DisponibiliteOut
# et ajoute description: Optional[str] = None dans les deux.
#
# Exemple :

from typing import Optional
from datetime import date, time
from pydantic import BaseModel

class DisponibiliteCreate(BaseModel):
    date_specifique:  date
    heure_debut:      time
    heure_fin:        time
    nb_max_etudiants: int = 1
    mode_seance:      str = "presentiel"
    description:      Optional[str] = None   # ← AJOUTER

class DisponibiliteOut(BaseModel):
    id:               int
    prof_id:          int
    date_specifique:  Optional[date]  = None
    heure_debut:      Optional[time]  = None
    heure_fin:        Optional[time]  = None
    nb_max_etudiants: int             = 1
    nb_inscrits:      int             = 0
    actif:            bool            = True
    mode_seance:      Optional[str]   = None
    description:      Optional[str]   = None   # ← AJOUTER

    class Config:
        from_attributes = True