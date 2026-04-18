from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from decimal import Decimal
from datetime import date, time

class DisponibiliteCreate(BaseModel):
    date_specifique: Optional[date] = None
    jour_semaine: Optional[int] = None
    heure_debut: time
    heure_fin: time
    nb_max_etudiants: int = 1
    mode_seance: Optional[str] = "presentiel"
    description: Optional[str] = None
    niveau_id:   Optional[int] = None          # ← AJOUTÉ

class DisponibiliteOut(BaseModel):
    id: int
    date_specifique: Optional[date] = None
    jour_semaine: Optional[int] = None
    heure_debut: time
    heure_fin: time
    nb_max_etudiants: int
    nb_inscrits: int
    actif: bool
    mode_seance: Optional[str] = "presentiel"
    niveau_id:   Optional[int] = None          # ← AJOUTÉ
    model_config = ConfigDict(from_attributes=True)

class ProfMatiereTarifSchema(BaseModel):
    matiere_id: int
    niveau_id: int
    tarif: Decimal

class ProfMatiereTarifOut(BaseModel):
    matiere_id: int
    nom_matiere: str
    niveau_id: int
    nom_niveau: str
    tarif: Decimal
    model_config = ConfigDict(from_attributes=True)

class CertificatSchema(BaseModel):
    id: int
    titre: str
    description: Optional[str] = None
    fichier_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class ProfesseurUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    bio: Optional[str] = None
    description: Optional[str] = None
    ville: Optional[str] = None
    telephone: Optional[str] = None
    tarifs_complets: List[ProfMatiereTarifSchema] = []
    mode_enseignement: Optional[str] = None
    tarif_en_ligne: Optional[Decimal] = None
    tarif_presentiel: Optional[Decimal] = None

class ProfesseurOut(BaseModel):
    id: int
    user_nom: Optional[str] = None
    user_prenom: Optional[str] = None
    email: Optional[str] = None
    ville: Optional[str] = None
    bio: Optional[str] = None
    description: Optional[str] = None
    photo_url: Optional[str] = None
    telephone: Optional[str] = None
    note_moyenne: Optional[Decimal] = None
    nb_avis: int = 0
    statut_validation: str
    mode_enseignement: Optional[str] = "presentiel"
    tarif_en_ligne: Optional[Decimal] = None
    tarif_presentiel: Optional[Decimal] = None
    tarifs_matieres: List[ProfMatiereTarifOut] = []
    certificats: List[CertificatSchema] = []
    disponibilites: List[DisponibiliteOut] = []
    niveaux: List[str] = []
    model_config = ConfigDict(from_attributes=True)