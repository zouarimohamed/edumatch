# app/routers/matching.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Etudiant, Professeur, PreferencesEtudiant
from app.utils.dependencies import require_etudiant

router = APIRouter()

@router.get("/top")
def top_matches(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user=Depends(require_etudiant),
):
    etudiant = db.query(Etudiant).filter(Etudiant.user_id == current_user.id).first()
    if not etudiant:
        return []

    prefs = (
        db.query(PreferencesEtudiant)
        .filter_by(etudiant_id=etudiant.id)
        .order_by(PreferencesEtudiant.updated_at.desc())
        .first()
    )

    profs = db.query(Professeur).filter(
        Professeur.statut_validation == "validé"
    ).all()

    if not profs:
        return []

    def score(p):
        s = 50
        if prefs:
            if prefs.ville and p.ville == prefs.ville:
                s += 20
            if prefs.matiere_id:
                ids = [t.matiere_id for t in p.tarifs_matieres]
                if prefs.matiere_id in ids:
                    s += 30
            if prefs.niveau_id:
                nids = [n.id for n in p.niveaux]
                if prefs.niveau_id in nids:
                    s += 20
            tarif = p.tarif_en_ligne or p.tarif_presentiel
            if prefs.budget_max and tarif:
                if float(tarif) <= float(prefs.budget_max):
                    s += 15
        if p.note_moyenne:
            s += round((float(p.note_moyenne) / 5.0) * 10)
        if p.disponibilites:
            s += 5
        return min(s, 100)

    scored = sorted([(p, score(p)) for p in profs], key=lambda x: x[1], reverse=True)

    return [
        {
            "prof_id":      p.id,
            "user_nom":     p.user.nom     if p.user else "",
            "user_prenom":  p.user.prenom  if p.user else "",
            "nom":          f"{p.user.prenom} {p.user.nom}" if p.user else "Prof",
            "ville":        p.ville or "",
            "tarif":        float(p.tarif_en_ligne or p.tarif_presentiel or 0),
            "tarif_en_ligne":   float(p.tarif_en_ligne)   if p.tarif_en_ligne   else None,
            "tarif_presentiel": float(p.tarif_presentiel) if p.tarif_presentiel else None,
            "mode_enseignement": p.mode_enseignement or "presentiel",
            "note_moyenne": float(p.note_moyenne) if p.note_moyenne else 0,
            "nb_avis":      p.nb_avis or 0,
            "photo_url":    p.photo_url,
            "score":        s,
            "niveaux":      [n.nom for n in p.niveaux],
        }
        for p, s in scored[:limit]
    ]