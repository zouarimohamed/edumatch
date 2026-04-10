import os
import shutil
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.message import Message
from app.models import Reservation, Etudiant, Professeur, User
from app.utils.dependencies import get_current_user

router = APIRouter()


def serialize_message(m: Message) -> dict:
    return {
        "id":             m.id,
        "reservation_id": m.reservation_id,
        "expediteur_id":  m.expediteur_id,
        "expediteur_nom": f"{m.expediteur.prenom or ''} {m.expediteur.nom or ''}".strip() if m.expediteur else "—",
        "expediteur_role": m.expediteur.role if m.expediteur else "—",
        "contenu":        m.contenu,
        "fichier_url":    m.fichier_url,
        "fichier_nom":    m.fichier_nom,
        "fichier_type":   m.fichier_type,
        "lu":             m.lu,
        "created_at":     m.created_at.isoformat() if m.created_at else None,
    }


# ── RÉCUPÉRER LES MESSAGES D'UNE RÉSERVATION ──────────────────────
@router.get("/reservation/{reservation_id}")
def get_messages(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Vérifier que l'utilisateur a accès à cette réservation
    resa = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not resa:
        raise HTTPException(404, "Réservation introuvable")

    # Marquer les messages reçus comme lus
    db.query(Message).filter(
        Message.reservation_id == reservation_id,
        Message.destinataire_id == current_user.id,
        Message.lu == False,
    ).update({"lu": True})
    db.commit()

    messages = db.query(Message).filter(
        Message.reservation_id == reservation_id
    ).order_by(Message.created_at.asc()).all()

    return [serialize_message(m) for m in messages]


# ── ENVOYER UN MESSAGE TEXTE ───────────────────────────────────────
@router.post("/reservation/{reservation_id}")
def send_message(
    reservation_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resa = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not resa:
        raise HTTPException(404, "Réservation introuvable")

    # Déterminer le destinataire
    if current_user.role == "étudiant":
        etudiant = db.query(Etudiant).filter(Etudiant.user_id == current_user.id).first()
        if not etudiant or etudiant.id != resa.etudiant_id:
            raise HTTPException(403, "Accès refusé")
        prof = db.query(Professeur).filter(Professeur.id == resa.prof_id).first()
        destinataire_id = prof.user_id if prof else None
    else:
        prof = db.query(Professeur).filter(Professeur.user_id == current_user.id).first()
        if not prof or prof.id != resa.prof_id:
            raise HTTPException(403, "Accès refusé")
        etudiant = db.query(Etudiant).filter(Etudiant.id == resa.etudiant_id).first()
        destinataire_id = etudiant.user_id if etudiant else None

    if not destinataire_id:
        raise HTTPException(400, "Destinataire introuvable")

    contenu = data.get("contenu", "").strip()
    if not contenu:
        raise HTTPException(400, "Message vide")

    msg = Message(
        reservation_id=reservation_id,
        expediteur_id=current_user.id,
        destinataire_id=destinataire_id,
        contenu=contenu,
        lu=False,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return serialize_message(msg)


# ── ENVOYER UN FICHIER / IMAGE / PDF ──────────────────────────────
@router.post("/reservation/{reservation_id}/fichier")
async def send_fichier(
    reservation_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    resa = db.query(Reservation).filter(Reservation.id == reservation_id).first()
    if not resa:
        raise HTTPException(404, "Réservation introuvable")

    # Déterminer le type de fichier
    fname   = file.filename or "fichier"
    ext     = os.path.splitext(fname)[1].lower()
    ftype   = "image" if ext in [".jpg",".jpeg",".png",".gif",".webp"] else "pdf" if ext == ".pdf" else "file"
    uid     = uuid.uuid4().hex[:8]
    save_path = f"static/uploads/messages/msg_{reservation_id}_{uid}{ext}"

    os.makedirs("static/uploads/messages", exist_ok=True)
    with open(save_path, "wb") as buf:
        shutil.copyfileobj(file.file, buf)

    # Destinataire
    if current_user.role == "étudiant":
        prof = db.query(Professeur).filter(Professeur.id == resa.prof_id).first()
        destinataire_id = prof.user_id if prof else None
    else:
        etudiant = db.query(Etudiant).filter(Etudiant.id == resa.etudiant_id).first()
        destinataire_id = etudiant.user_id if etudiant else None

    if not destinataire_id:
        raise HTTPException(400, "Destinataire introuvable")

    msg = Message(
        reservation_id=reservation_id,
        expediteur_id=current_user.id,
        destinataire_id=destinataire_id,
        contenu=None,
        fichier_url=f"/{save_path}",
        fichier_nom=fname,
        fichier_type=ftype,
        lu=False,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return serialize_message(msg)


# ── NOMBRE DE MESSAGES NON LUS (pour notifications) ───────────────
@router.get("/non-lus")
def get_non_lus(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    count = db.query(Message).filter(
        Message.destinataire_id == current_user.id,
        Message.lu == False,
    ).count()

    # Regrouper par réservation pour les détails
    messages = db.query(Message).filter(
        Message.destinataire_id == current_user.id,
        Message.lu == False,
    ).order_by(Message.created_at.desc()).all()

    reservations_ids = list({m.reservation_id for m in messages})

    return {
        "total": count,
        "reservations": reservations_ids,
        "messages": [serialize_message(m) for m in messages[:10]],
    }