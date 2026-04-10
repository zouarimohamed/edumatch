"""
Algorithme de Matching Intelligent EduMatch
Score sur 100 points – 6 critères pondérés
"""
from sqlalchemy.orm import Session
from app.models import Professeur, PreferencesEtudiant, Etudiant

WEIGHTS = {
    "matiere":       30,
    "ville":         20,
    "niveau":        20,
    "budget":        15,
    "note":          10,
    "disponibilite":  5,
}

def calculate_match_score(prof: Professeur, prefs: PreferencesEtudiant) -> int:
    score = 0
    total = 0

    # 1. Matière (30 pts)
    if prefs.matiere_id:
        total += WEIGHTS["matiere"]
        if any(m.id == prefs.matiere_id for m in prof.matieres):
            score += WEIGHTS["matiere"]

    # 2. Ville (20 pts)
    if prefs.ville:
        total += WEIGHTS["ville"]
        if prof.ville == prefs.ville:
            score += WEIGHTS["ville"]
        elif prof.ville and prof.ville.lower() in ["tunis", "sfax"]:
            score += WEIGHTS["ville"] // 2  # capitale = bonus partiel

    # 3. Niveau (20 pts)
    if prefs.niveau_id:
        total += WEIGHTS["niveau"]
        if any(n.id == prefs.niveau_id for n in prof.niveaux):
            score += WEIGHTS["niveau"]

    # 4. Budget (15 pts)
    if prefs.budget_max and prof.tarif is not None:
        total += WEIGHTS["budget"]
        if float(prof.tarif) <= float(prefs.budget_max):
            score += WEIGHTS["budget"]
        elif float(prof.tarif) <= float(prefs.budget_max) * 1.2:
            score += WEIGHTS["budget"] // 2

    # 5. Note moyenne (10 pts)
    total += WEIGHTS["note"]
    if prof.note_moyenne:
        score += round((float(prof.note_moyenne) / 5.0) * WEIGHTS["note"])

    # 6. Disponibilité (5 pts)
    total += WEIGHTS["disponibilite"]
    if prof.disponibilites:
        score += WEIGHTS["disponibilite"]

    return round((score / total) * 100) if total > 0 else 50


def get_top_matches(db: Session, etudiant_id: int, limit: int = 5):
    prefs = (
        db.query(PreferencesEtudiant)
          .filter_by(etudiant_id=etudiant_id)
          .order_by(PreferencesEtudiant.updated_at.desc())
          .first()
    )

    profs = (
        db.query(Professeur)
          .filter(Professeur.statut_validation == "validé")
          .all()
    )

    if not prefs:
        return [(p, 50) for p in profs[:limit]]

    scored = [(p, calculate_match_score(p, prefs)) for p in profs]
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored[:limit]


def save_preferences(db: Session, etudiant_id: int, data: dict):
    prefs = db.query(PreferencesEtudiant).filter_by(etudiant_id=etudiant_id).first()
    if not prefs:
        prefs = PreferencesEtudiant(etudiant_id=etudiant_id)
        db.add(prefs)
    for key, value in data.items():
        if hasattr(prefs, key):
            setattr(prefs, key, value)
    db.commit()
    db.refresh(prefs)
    return prefs
