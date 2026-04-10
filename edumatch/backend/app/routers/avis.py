from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Avis, Professeur, Etudiant, Reservation, User
from app.utils.dependencies import get_current_user, require_etudiant

router = APIRouter()


def avis_to_out(a: Avis) -> dict:
    etudiant_nom = "Anonyme"
    if a.etudiant and a.etudiant.user:
        u = a.etudiant.user
        etudiant_nom = f"{u.prenom or ''} {u.nom or ''}".strip() or "Anonyme"
    return {
        "id":          a.id,
        "prof_id":     a.prof_id,
        "etudiant_id": a.etudiant_id,
        "etudiant":    etudiant_nom,
        "note":        a.note,
        "commentaire": a.commentaire or "",
        "created_at":  str(a.created_at) if a.created_at else None,
    }


# ── GET tous les avis d'un prof ──────────────────────────────────
@router.get("/professeur/{prof_id}")
def get_avis_prof(prof_id: int, db: Session = Depends(get_db)):
    avis = db.query(Avis).filter(Avis.prof_id == prof_id)\
             .order_by(Avis.created_at.desc()).all()
    return [avis_to_out(a) for a in avis]


# ── GET stats avis d'un prof ─────────────────────────────────────
@router.get("/professeur/{prof_id}/stats")
def get_stats_prof(prof_id: int, db: Session = Depends(get_db)):
    avis = db.query(Avis).filter(Avis.prof_id == prof_id).all()
    if not avis:
        return {"moyenne": 0, "total": 0, "distribution": {1:0,2:0,3:0,4:0,5:0}}

    distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    total_note = 0
    for a in avis:
        distribution[a.note] = distribution.get(a.note, 0) + 1
        total_note += a.note

    return {
        "moyenne":      round(total_note / len(avis), 1),
        "total":        len(avis),
        "distribution": distribution,
    }


# ── POST créer un avis ───────────────────────────────────────────
@router.post("/")
def create_avis(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_etudiant),
):
    prof_id     = data.get("prof_id")
    note        = data.get("note")
    commentaire = data.get("commentaire", "").strip()

    if not prof_id or not note:
        raise HTTPException(400, "prof_id et note requis")
    if not (1 <= int(note) <= 5):
        raise HTTPException(400, "Note entre 1 et 5")

    etudiant = db.query(Etudiant).filter(Etudiant.user_id == current_user.id).first()
    if not etudiant:
        raise HTTPException(404, "Profil étudiant introuvable")

    # Vérifier que l'étudiant a eu une réservation confirmée avec ce prof
    reservation = db.query(Reservation).filter(
        Reservation.etudiant_id == etudiant.id,
        Reservation.prof_id     == prof_id,
        Reservation.statut      == "confirmé",
    ).first()
    if not reservation:
        raise HTTPException(403, "Vous devez avoir eu un cours confirmé avec ce professeur pour laisser un avis")

    # Un seul avis par étudiant par prof
    existant = db.query(Avis).filter(
        Avis.etudiant_id == etudiant.id,
        Avis.prof_id     == prof_id,
    ).first()
    if existant:
        # Mettre à jour l'avis existant
        existant.note        = int(note)
        existant.commentaire = commentaire
        db.commit()
        db.refresh(existant)
        # Mettre à jour la moyenne du prof
        _update_prof_stats(prof_id, db)
        return avis_to_out(existant)

    avis = Avis(
        etudiant_id=etudiant.id,
        prof_id=int(prof_id),
        note=int(note),
        commentaire=commentaire,
    )
    db.add(avis)
    db.commit()
    db.refresh(avis)

    _update_prof_stats(prof_id, db)
    return avis_to_out(avis)


# ── DELETE supprimer son avis ────────────────────────────────────
@router.delete("/{avis_id}")
def delete_avis(
    avis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_etudiant),
):
    etudiant = db.query(Etudiant).filter(Etudiant.user_id == current_user.id).first()
    avis = db.query(Avis).filter(
        Avis.id          == avis_id,
        Avis.etudiant_id == etudiant.id,
    ).first()
    if not avis:
        raise HTTPException(404, "Avis introuvable")
    prof_id = avis.prof_id
    db.delete(avis)
    db.commit()
    _update_prof_stats(prof_id, db)
    return {"message": "Avis supprimé"}


# ── GET mon avis sur un prof ─────────────────────────────────────
@router.get("/mon-avis/{prof_id}")
def get_mon_avis(
    prof_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_etudiant),
):
    etudiant = db.query(Etudiant).filter(Etudiant.user_id == current_user.id).first()
    if not etudiant:
        return None
    avis = db.query(Avis).filter(
        Avis.etudiant_id == etudiant.id,
        Avis.prof_id     == prof_id,
    ).first()
    return avis_to_out(avis) if avis else None


def _update_prof_stats(prof_id: int, db: Session):
    """Recalcule et met à jour note_moyenne et nb_avis du prof."""
    result = db.query(
        func.avg(Avis.note).label("moy"),
        func.count(Avis.id).label("nb"),
    ).filter(Avis.prof_id == prof_id).one()

    prof = db.query(Professeur).filter(Professeur.id == prof_id).first()
    if prof:
        prof.note_moyenne = round(float(result.moy), 2) if result.moy else 0
        prof.nb_avis      = result.nb or 0
        db.commit()