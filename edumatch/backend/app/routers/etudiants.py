import os
import shutil
from datetime import date, datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.models import Etudiant, User, Reservation, Professeur
from app.utils.dependencies import get_current_user, require_etudiant

router = APIRouter()


# ── GET /me ─────────────────────────────────────────────────────
@router.get("/me")
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_etudiant),
):
    etudiant = db.query(Etudiant).filter(Etudiant.user_id == current_user.id).first()
    if not etudiant:
        raise HTTPException(404, "Profil étudiant introuvable")

    u = etudiant.user or current_user
    return {
        "id":          etudiant.id,
        "user_id":     etudiant.user_id,
        "prenom":      u.prenom      or "",
        "nom":         u.nom         or "",
        "user_prenom": u.prenom      or "",
        "user_nom":    u.nom         or "",
        "email":       u.email       or "",
        "telephone":   etudiant.telephone or "",
        "ville":       etudiant.ville     or "",
        "niveau":      etudiant.niveau    or "",
        "bio":         etudiant.bio       or "",
        "photo_url":   getattr(etudiant, 'photo_url', None),
    }


# ── PUT /me ─────────────────────────────────────────────────────
@router.put("/me")
def update_my_profile(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_etudiant),
):
    etudiant = db.query(Etudiant).filter(Etudiant.user_id == current_user.id).first()
    if not etudiant:
        raise HTTPException(404, "Profil étudiant introuvable")

    if data.get("prenom"):  current_user.prenom = data["prenom"]
    if data.get("nom"):     current_user.nom    = data["nom"]
    if "telephone" in data: etudiant.telephone  = data["telephone"]
    if "ville"     in data: etudiant.ville      = data["ville"]
    if "niveau"    in data: etudiant.niveau     = data["niveau"]
    if "bio"       in data: etudiant.bio        = data["bio"]

    db.commit()
    db.refresh(etudiant)

    u = etudiant.user or current_user
    return {
        "id":          etudiant.id,
        "user_id":     etudiant.user_id,
        "prenom":      u.prenom      or "",
        "nom":         u.nom         or "",
        "user_prenom": u.prenom      or "",
        "user_nom":    u.nom         or "",
        "email":       u.email       or "",
        "telephone":   etudiant.telephone or "",
        "ville":       etudiant.ville     or "",
        "niveau":      etudiant.niveau    or "",
        "bio":         etudiant.bio       or "",
        "photo_url":   getattr(etudiant, 'photo_url', None),
    }


# ── POST /me/photo ───────────────────────────────────────────────
@router.post("/me/photo")
async def upload_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_etudiant),
):
    etudiant = db.query(Etudiant).filter(Etudiant.user_id == current_user.id).first()
    if not etudiant:
        raise HTTPException(404, "Profil introuvable")

    os.makedirs("static/uploads/profiles", exist_ok=True)
    ext       = os.path.splitext(file.filename)[1] or ".jpg"
    file_path = f"static/uploads/profiles/etudiant_{etudiant.id}{ext}"

    with open(file_path, "wb") as buf:
        shutil.copyfileobj(file.file, buf)

    if hasattr(etudiant, 'photo_url'):
        etudiant.photo_url = f"/{file_path}"
        db.commit()

    return {"url": f"/{file_path}"}


# ── GET /me/rappels ──────────────────────────────────────────────
@router.get("/me/rappels")
def get_rappels(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_etudiant),
):
    """
    Retourne les cours confirmés dans les 24h à venir.
    Utilisé pour les notifications de rappel dans le dashboard étudiant.
    """
    etudiant = db.query(Etudiant).filter(Etudiant.user_id == current_user.id).first()
    if not etudiant:
        return []

    today    = date.today()
    tomorrow = today + timedelta(days=1)
    now      = datetime.now()

    reservations = (
        db.query(Reservation)
        .filter(
            Reservation.etudiant_id == etudiant.id,
            Reservation.statut      == "confirmé",
            Reservation.date_cours  >= today,
            Reservation.date_cours  <= tomorrow,
        )
        .order_by(Reservation.date_cours, Reservation.heure_debut)
        .all()
    )

    rappels = []

    for r in reservations:
        prof     = r.professeur
        prof_nom = "Professeur"
        if prof and prof.user:
            prof_nom = f"{prof.user.prenom or ''} {prof.user.nom or ''}".strip()

        hours_left   = None
        minutes_left = None
        is_today     = (r.date_cours == today)
        is_imminent  = False
        is_soon      = False
        is_past      = False

        if r.heure_debut:
            try:
                heure_str = str(r.heure_debut)[:5]
                h, m      = map(int, heure_str.split(':'))
                cours_dt  = datetime.combine(r.date_cours, datetime.min.time().replace(hour=h, minute=m))
                diff_sec  = (cours_dt - now).total_seconds()

                if diff_sec > 0:
                    hours_left   = round(diff_sec / 3600, 1)
                    minutes_left = int(diff_sec / 60)
                    is_soon      = diff_sec <= 86400
                    is_imminent  = diff_sec <= 3600
                else:
                    is_past = True
            except Exception:
                pass

        if is_past:
            continue

        rappels.append({
            "reservation_id": r.id,
            "prof_nom":       prof_nom,
            "prof_photo":     prof.photo_url if prof else None,
            "date_cours":     str(r.date_cours),
            "heure_debut":    str(r.heure_debut)[:5]  if r.heure_debut else None,
            "heure_fin":      str(r.heure_fin)[:5]    if r.heure_fin   else None,
            "mode_seance":    r.mode_seance or "presentiel",
            "lien_meet":      r.lien_meet,
            "hours_left":     hours_left,
            "minutes_left":   minutes_left,
            "is_today":       is_today,
            "is_imminent":    is_imminent,
            "is_soon":        is_soon,
        })

    rappels.sort(key=lambda x: (
        not x["is_imminent"],
        not x["is_today"],
        x["heure_debut"] or "99:99",
    ))

    return rappels


# ── GET /notifications ───────────────────────────────────────────
# Retourne les notifications de blocage/déblocage pour l'étudiant connecté
@router.get("/notifications")
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        rows = db.execute(text("""
            SELECT id, type, message, lu, created_at
            FROM notifications_users
            WHERE user_id = :user_id
            ORDER BY created_at DESC
            LIMIT 30
        """), {"user_id": current_user.id}).fetchall()
        return [
            {
                "id":         r.id,
                "type":       r.type,
                "message":    r.message,
                "lu":         r.lu,
                "created_at": str(r.created_at),
            }
            for r in rows
        ]
    except Exception as e:
        print(f"[etudiants] notifications error: {e}")
        return []


# ── PUT /notifications/lire ──────────────────────────────────────
# Marque toutes les notifications de l'étudiant comme lues
@router.put("/notifications/lire")
def mark_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        db.execute(text("""
            UPDATE notifications_users
            SET lu = true
            WHERE user_id = :user_id AND lu = false
        """), {"user_id": current_user.id})
        db.commit()
        return {"message": "Notifications marquées comme lues"}
    except Exception as e:
        print(f"[etudiants] mark_read error: {e}")
        return {"message": "ok"}