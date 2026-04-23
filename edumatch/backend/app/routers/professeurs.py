from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from typing import List
import os
import shutil
from datetime import datetime

from app.database import get_db
from app.models import Professeur, User, Disponibilite, Matiere, Niveau
from app.models.professeur import ProfMatiereTarif, Certificat, DemandeMatiere
from app.schemas.professeur import (
    ProfesseurOut, ProfesseurUpdate,
    DisponibiliteCreate, DisponibiliteOut
)
from app.utils.dependencies import get_current_user, require_professeur

router = APIRouter()


def prof_to_out(p: Professeur) -> dict:
    tarif_en_ligne = None
    if p.tarif_en_ligne and float(p.tarif_en_ligne) > 0:
        tarif_en_ligne = float(p.tarif_en_ligne)

    tarif_presentiel = None
    if p.tarif_presentiel and float(p.tarif_presentiel) > 0:
        tarif_presentiel = float(p.tarif_presentiel)

    return {
        "id":               p.id,
        "user_nom":         str(p.user.nom)    if p.user else "",
        "user_prenom":      str(p.user.prenom) if p.user else "",
        "email":            str(p.user.email)  if p.user else "",
        "date_naissance":   p.user.date_naissance.strftime("%Y-%m-%d") if p.user and p.user.date_naissance else None,
        "ville":            str(p.ville)      if p.ville      else "",
        "bio":              str(p.bio)        if p.bio        else "",
        "description":      str(p.description) if p.description else "",
        "photo_url":        p.photo_url,
        "telephone":        str(p.telephone)  if p.telephone  else "",
        "note_moyenne":     float(p.note_moyenne) if p.note_moyenne else 0,
        "nb_avis":          int(p.nb_avis)    if p.nb_avis    else 0,
        "statut_validation": str(p.statut_validation),
        "mode_enseignement": p.mode_enseignement or "presentiel",
        "tarif_en_ligne":   tarif_en_ligne,
        "tarif_presentiel": tarif_presentiel,
        "tarifs_matieres": [
            {
                "matiere_id":  t.matiere_id,
                "nom_matiere": t.matiere.nom,
                "niveau_id":   t.niveau_id,
                "nom_niveau":  t.niveau.nom if t.niveau else "N/A",
                "nom_domaine": t.niveau.domaine.nom if (t.niveau and t.niveau.domaine) else "N/A",
                "tarif":       float(t.tarif)
            }
            for t in p.tarifs_matieres
        ],
        "niveaux": [n.nom for n in p.niveaux],
        "certificats": [
            {
                "id":          c.id,
                "titre":       c.titre,
                "description": c.description,
                "fichier_url": c.fichier_url
            }
            for c in p.certificats
        ],
        "disponibilites": [
            {
                "id":               d.id,
                "date_specifique":  d.date_specifique.strftime("%Y-%m-%d") if d.date_specifique else None,
                "heure_debut":      d.heure_debut.strftime("%H:%M") if d.heure_debut else None,
                "heure_fin":        d.heure_fin.strftime("%H:%M")   if d.heure_fin   else None,
                "nb_max_etudiants": d.nb_max_etudiants,
                "nb_inscrits":      d.nb_inscrits,
                "actif":            d.actif,
                "mode_seance":      d.mode_seance or "presentiel",
            }
            for d in p.disponibilites if d.actif
        ]
    }


def _is_future(d: Disponibilite) -> bool:
    """Retourne True si la disponibilité n'est pas encore passée (comparaison date+heure_fin)."""
    try:
        if not d.date_specifique or not d.heure_fin:
            return True
        date_str = d.date_specifique.strftime("%Y-%m-%d")
        heure_str = d.heure_fin.strftime("%H:%M")
        fin = datetime.strptime(f"{date_str} {heure_str}", "%Y-%m-%d %H:%M")
        return fin > datetime.now()
    except Exception:
        return True


# ── GET /me ──────────────────────────────────────────────────────
@router.get("/me", response_model=ProfesseurOut)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_professeur)
):
    prof = db.query(Professeur).filter(Professeur.user_id == current_user.id).first()
    if not prof:
        raise HTTPException(404, "Profil non trouvé")
    return prof_to_out(prof)


# ── PUT /me ──────────────────────────────────────────────────────
@router.put("/me", response_model=ProfesseurOut)
def update_my_profile(
    data: ProfesseurUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_professeur)
):
    prof = db.query(Professeur).filter(Professeur.user_id == current_user.id).first()
    if not prof:
        raise HTTPException(404, "Profil introuvable")

    if data.nom:    current_user.nom    = data.nom
    if data.prenom: current_user.prenom = data.prenom

    if data.ville     is not None: prof.ville     = data.ville
    if data.bio       is not None: prof.bio       = data.bio
    if data.telephone is not None: prof.telephone = data.telephone

    if data.mode_enseignement is not None:
        prof.mode_enseignement = data.mode_enseignement

    if data.tarif_en_ligne is not None:
        prof.tarif_en_ligne = float(data.tarif_en_ligne) if float(data.tarif_en_ligne) > 0 else None

    if data.tarif_presentiel is not None:
        prof.tarif_presentiel = float(data.tarif_presentiel) if float(data.tarif_presentiel) > 0 else None

    if data.tarifs_complets is not None:
        db.query(ProfMatiereTarif).filter(ProfMatiereTarif.prof_id == prof.id).delete()
        for item in data.tarifs_complets:
            db.add(ProfMatiereTarif(
                prof_id=prof.id,
                matiere_id=item.matiere_id,
                niveau_id=item.niveau_id,
                tarif=item.tarif
            ))

    db.commit()
    db.refresh(prof)
    return prof_to_out(prof)


# ── GET /me/disponibilites ───────────────────────────────────────
@router.get("/me/disponibilites")
def get_my_disponibilites(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_professeur)
):
    prof = db.query(Professeur).filter(Professeur.user_id == current_user.id).first()
    dispos = db.query(Disponibilite).filter(
        Disponibilite.prof_id == prof.id,
        Disponibilite.actif == True
    ).all()
    return [
        {
            "id":               d.id,
            "prof_id":          d.prof_id,
            "date_specifique":  d.date_specifique.strftime("%Y-%m-%d") if d.date_specifique else None,
            "heure_debut":      d.heure_debut.strftime("%H:%M") if d.heure_debut else None,
            "heure_fin":        d.heure_fin.strftime("%H:%M")   if d.heure_fin   else None,
            "nb_max_etudiants": d.nb_max_etudiants,
            "nb_inscrits":      d.nb_inscrits,
            "actif":            d.actif,
            "mode_seance":      d.mode_seance or "presentiel",
            "description":      d.description or None,
            "niveau_id":        getattr(d, "niveau_id", None),
            "niveau_nom":       d.niveau.nom if getattr(d, "niveau", None) else None,
        }
        for d in dispos
    ]


# ── GET /me/niveaux ─────────────────────────────────────────────
# IMPORTANT : doit être avant /{prof_id} pour ne pas être capturé
@router.get("/me/niveaux")
def get_my_niveaux(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retourne les niveaux des matières enseignées par le prof connecté."""
    prof = db.query(Professeur).filter(Professeur.user_id == current_user.id).first()
    if not prof:
        return []
    niveaux = db.execute(text("""
        SELECT DISTINCT niv.id, niv.nom, dom.nom AS domaine
        FROM prof_matiere_tarif pmt
        JOIN matieres m ON m.id = pmt.matiere_id
        JOIN niveaux niv ON niv.id = m.niveau_id
        JOIN domaines dom ON dom.id = niv.domaine_id
        WHERE pmt.prof_id = :prof_id
        ORDER BY dom.nom, niv.nom
    """), {"prof_id": prof.id}).fetchall()
    return [{"id": n.id, "nom": n.nom, "domaine": n.domaine} for n in niveaux]


# ── GET /me/demandes-matieres ────────────────────────────────────
@router.get("/me/demandes-matieres")
def get_mes_demandes(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_professeur)
):
    prof = db.query(Professeur).filter(Professeur.user_id == current_user.id).first()
    demandes = db.query(DemandeMatiere).filter(
        DemandeMatiere.prof_id == prof.id
    ).order_by(DemandeMatiere.created_at.desc()).all()
    return [
        {
            "id":          d.id,
            "nom_matiere": d.nom_matiere,
            "niveau_id":   d.niveau_id,
            "nom_niveau":  d.niveau.nom if d.niveau else "—",
            "statut":      d.statut,
            "created_at":  d.created_at,
        }
        for d in demandes
    ]


# ── POST /me/disponibilites ──────────────────────────────────────
@router.post("/me/disponibilites", response_model=DisponibiliteOut)
def add_disponibilite(
    data: DisponibiliteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_professeur)
):
    prof = db.query(Professeur).filter(Professeur.user_id == current_user.id).first()
    new_dispo = Disponibilite(
        prof_id=prof.id,
        date_specifique=data.date_specifique,
        heure_debut=data.heure_debut,
        heure_fin=data.heure_fin,
        nb_max_etudiants=data.nb_max_etudiants,
        nb_inscrits=0,
        actif=True,
        mode_seance=data.mode_seance or "presentiel",
        description=getattr(data, "description", None),
        niveau_id=getattr(data, "niveau_id", None),
    )
    db.add(new_dispo)
    db.commit()
    db.refresh(new_dispo)
    return new_dispo


# ── PUT /me/disponibilites/{dispo_id} — modifier une séance ────
@router.put("/me/disponibilites/{dispo_id}")
def update_disponibilite(
    dispo_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_professeur)
):
    prof = db.query(Professeur).filter(Professeur.user_id == current_user.id).first()
    dispo = db.query(Disponibilite).filter(
        Disponibilite.id == dispo_id,
        Disponibilite.prof_id == prof.id
    ).first()
    if not dispo:
        raise HTTPException(404, "Disponibilité introuvable")

    from datetime import date, time
    if data.get("date_specifique"):
        dispo.date_specifique = date.fromisoformat(data["date_specifique"])
    if data.get("heure_debut"):
        h, m = map(int, data["heure_debut"].split(":"))
        dispo.heure_debut = time(h, m)
    if data.get("heure_fin"):
        h, m = map(int, data["heure_fin"].split(":"))
        dispo.heure_fin = time(h, m)
    if data.get("nb_max_etudiants") is not None:
        nb = int(data["nb_max_etudiants"])
        if nb < dispo.nb_inscrits:
            raise HTTPException(400, f"Impossible : {dispo.nb_inscrits} étudiant(s) déjà inscrit(s)")
        dispo.nb_max_etudiants = nb
    if data.get("mode_seance"):
        dispo.mode_seance = data["mode_seance"]
    if "description" in data:
        dispo.description = data["description"] or None
    if "niveau_id" in data:
        dispo.niveau_id = int(data["niveau_id"]) if data["niveau_id"] else None

    db.commit()
    db.refresh(dispo)
    return {"message": "Séance modifiée", "id": dispo.id}


# ── DELETE /me/disponibilites/{dispo_id} ────────────────────────
@router.delete("/me/disponibilites/{dispo_id}")
def delete_disponibilite(
    dispo_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_professeur)
):
    prof = db.query(Professeur).filter(Professeur.user_id == current_user.id).first()
    dispo = db.query(Disponibilite).filter(
        Disponibilite.id == dispo_id,
        Disponibilite.prof_id == prof.id
    ).first()
    if dispo:
        dispo.actif = False
        db.commit()
    return {"message": "ok"}


# ── POST /me/demandes-matieres ───────────────────────────────────
@router.post("/me/demandes-matieres")
def demander_matiere(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_professeur)
):
    prof = db.query(Professeur).filter(Professeur.user_id == current_user.id).first()
    if not prof:
        raise HTTPException(404, "Profil introuvable")

    nom       = data.get("nom_matiere", "").strip()
    niveau_id = data.get("niveau_id")

    if not nom:
        raise HTTPException(400, "Le nom de la matière est requis")
    if not niveau_id:
        raise HTTPException(400, "Le niveau est requis")

    existant = db.query(Matiere).filter(
        func.lower(Matiere.nom) == nom.lower(),
        Matiere.niveau_id == niveau_id
    ).first()
    if existant:
        raise HTTPException(400, "Cette matière existe déjà dans le référentiel")

    doublon = db.query(DemandeMatiere).filter(
        DemandeMatiere.prof_id == prof.id,
        func.lower(DemandeMatiere.nom_matiere) == nom.lower(),
        DemandeMatiere.niveau_id == niveau_id,
        DemandeMatiere.statut == "en_attente"
    ).first()
    if doublon:
        raise HTTPException(400, "Vous avez déjà soumis cette demande, elle est en attente")

    demande = DemandeMatiere(
        prof_id=prof.id,
        niveau_id=niveau_id,
        nom_matiere=nom,
        statut="en_attente",
    )
    db.add(demande)
    db.commit()
    db.refresh(demande)
    return {"message": "Demande envoyée à l'administrateur", "id": demande.id}


# ── DELETE /me/demandes-matieres/{demande_id} ────────────────────
@router.delete("/me/demandes-matieres/{demande_id}")
def supprimer_demande(
    demande_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_professeur)
):
    prof = db.query(Professeur).filter(Professeur.user_id == current_user.id).first()
    demande = db.query(DemandeMatiere).filter(
        DemandeMatiere.id == demande_id,
        DemandeMatiere.prof_id == prof.id
    ).first()
    if not demande:
        raise HTTPException(404, "Demande introuvable")
    db.delete(demande)
    db.commit()
    return {"message": "Demande supprimée"}


# ── POST /me/photo ───────────────────────────────────────────────
@router.post("/me/photo")
async def upload_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_professeur)
):
    prof = db.query(Professeur).filter(Professeur.user_id == current_user.id).first()
    ext = os.path.splitext(file.filename)[1]
    file_path = f"static/uploads/profiles/avatar_{prof.id}{ext}"
    os.makedirs("static/uploads/profiles", exist_ok=True)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    prof.photo_url = f"/{file_path}"
    db.commit()
    return {"url": prof.photo_url}


# ── POST /me/certificats ─────────────────────────────────────────
@router.post("/me/certificats")
async def add_certificat(
    titre: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_professeur)
):
    prof = db.query(Professeur).filter(Professeur.user_id == current_user.id).first()
    ext = os.path.splitext(file.filename)[1]
    file_path = f"static/uploads/certificats/cert_{prof.id}_{os.urandom(2).hex()}{ext}"
    os.makedirs("static/uploads/certificats", exist_ok=True)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    db.add(Certificat(prof_id=prof.id, titre=titre, fichier_url=f"/{file_path}"))
    db.commit()
    return {"message": "ok"}


# ── GET / — liste tous les profs validés ─────────────────────────
@router.get("/")
def list_profs(db: Session = Depends(get_db)):
    profs = db.query(Professeur).filter(
        Professeur.statut_validation == "validé"
    ).all()
    return [prof_to_out(p) for p in profs]


# ── GET /{prof_id} — profil public d'un prof ────────────────────
@router.get("/{prof_id}")
def get_prof_by_id(prof_id: int, db: Session = Depends(get_db)):
    prof = db.query(Professeur).filter(
        Professeur.id == prof_id,
        Professeur.statut_validation == "validé",
    ).first()
    if not prof:
        raise HTTPException(404, "Professeur introuvable ou non validé")
    return prof_to_out(prof)


# ── GET /{prof_id}/disponibilites — dispos publiques (futures uniquement) ──
@router.get("/{prof_id}/disponibilites")
def get_prof_disponibilites(prof_id: int, db: Session = Depends(get_db)):
    dispos = db.query(Disponibilite).filter(
        Disponibilite.prof_id == prof_id,
        Disponibilite.actif == True,
    ).order_by(Disponibilite.date_specifique).all()

    # Filtrer côté backend : ne retourner que les créneaux futurs
    now = datetime.now()
    result = []
    for d in dispos:
        try:
            if d.date_specifique and d.heure_fin:
                date_str  = d.date_specifique.strftime("%Y-%m-%d")
                heure_str = d.heure_fin.strftime("%H:%M")
                fin = datetime.strptime(f"{date_str} {heure_str}", "%Y-%m-%d %H:%M")
                if fin <= now:
                    continue  # créneau passé → on le saute
        except Exception:
            pass  # en cas d'erreur de parsing, on inclut le créneau

        result.append({
            "id":               d.id,
            "date_specifique":  d.date_specifique.strftime("%Y-%m-%d") if d.date_specifique else None,
            "heure_debut":      d.heure_debut.strftime("%H:%M") if d.heure_debut else None,
            "heure_fin":        d.heure_fin.strftime("%H:%M")   if d.heure_fin   else None,
            "nb_max_etudiants": d.nb_max_etudiants,
            "nb_inscrits":      d.nb_inscrits,
            "mode_seance":      d.mode_seance or "presentiel",
            "actif":            d.actif,
            "description":      d.description or None,
        })

    return result