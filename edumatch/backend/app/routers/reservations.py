import uuid
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Reservation, Etudiant, Professeur, Disponibilite
from app.schemas.reservation import ReservationCreate, ReservationUpdate, ReservationOut
from app.utils.dependencies import require_etudiant, get_current_user

router = APIRouter()


def generate_meet_link() -> str:
    """Génère un lien Google Meet unique."""
    code = uuid.uuid4().hex[:10]
    return f"https://meet.google.com/{code[:3]}-{code[3:7]}-{code[7:10]}"


def get_or_create_meet_link(dispo: Disponibilite, db: Session) -> str:
    if not hasattr(dispo, 'lien_meet') or not dispo.lien_meet:
        dispo.lien_meet = generate_meet_link()
        db.flush()
    return dispo.lien_meet


@router.post("/", response_model=ReservationOut, status_code=201)
def create_reservation(
    data: ReservationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_etudiant),
):
    etudiant = db.query(Etudiant).filter(Etudiant.user_id == current_user.id).first()
    prof     = db.query(Professeur).filter(Professeur.id == data.prof_id).first()
    if not prof:
        raise HTTPException(404, "Professeur introuvable")

    dispo = None
    if data.disponibilite_id:
        dispo = db.query(Disponibilite).filter(
            Disponibilite.id == data.disponibilite_id,
            Disponibilite.prof_id == prof.id,
            Disponibilite.actif == True,
        ).first()
        if not dispo:
            raise HTTPException(404, "Créneau introuvable ou inactif")
        if dispo.nb_inscrits >= dispo.nb_max_etudiants:
            raise HTTPException(400, "Ce créneau est complet")

    mode = data.mode_seance or dispo.mode_seance if dispo else "presentiel"

    lien_meet = None
    if mode == "en_ligne" and dispo:
        lien_meet = get_or_create_meet_link(dispo, db)
    elif mode == "en_ligne" and not dispo:
        lien_meet = generate_meet_link()

    tarif = None
    if mode == "en_ligne" and prof.tarif_en_ligne and float(prof.tarif_en_ligne) > 0:
        tarif = prof.tarif_en_ligne
    elif mode == "presentiel" and prof.tarif_presentiel and float(prof.tarif_presentiel) > 0:
        tarif = prof.tarif_presentiel
    elif prof.tarif_en_ligne and float(prof.tarif_en_ligne) > 0:
        tarif = prof.tarif_en_ligne
    elif prof.tarif_presentiel and float(prof.tarif_presentiel) > 0:
        tarif = prof.tarif_presentiel

    reservation = Reservation(
        etudiant_id=etudiant.id,
        prof_id=data.prof_id,
        disponibilite_id=data.disponibilite_id,
        date_cours=dispo.date_specifique if dispo else data.date_cours,
        heure_debut=dispo.heure_debut    if dispo else data.heure_debut,
        heure_fin=dispo.heure_fin        if dispo else data.heure_fin,
        tarif_applique=tarif,
        notes_etudiant=data.notes_etudiant,
        mode_seance=mode,
        lien_meet=lien_meet,
        statut="en_attente",
    )
    db.add(reservation)

    if dispo:
        dispo.nb_inscrits += 1

    db.commit()
    db.refresh(reservation)
    return reservation


def is_session_today_or_soon(date_cours, heure_debut, heure_fin) -> dict:
    if not date_cours:
        return {"is_today": False, "is_active": False, "is_past": False, "minutes_until": None}

    today = date.today()
    try:
        if isinstance(date_cours, str):
            session_date = date.fromisoformat(date_cours[:10])
        else:
            session_date = date_cours
    except Exception:
        return {"is_today": False, "is_active": False, "is_past": False, "minutes_until": None}

    is_today = (session_date == today)
    is_past  = (session_date < today)

    is_active       = False
    is_imminent     = False
    minutes_until   = None

    if is_today and heure_debut and heure_fin:
        now = datetime.now()
        try:
            debut_str = str(heure_debut)[:5]
            fin_str   = str(heure_fin)[:5]
            h_debut, m_debut = map(int, debut_str.split(':'))
            h_fin,   m_fin   = map(int, fin_str.split(':'))
            debut_dt = now.replace(hour=h_debut, minute=m_debut, second=0, microsecond=0)
            fin_dt   = now.replace(hour=h_fin,   minute=m_fin,   second=0, microsecond=0)

            from datetime import timedelta
            is_active    = debut_dt <= now <= (fin_dt + timedelta(minutes=30))
            is_imminent  = timedelta(0) <= (debut_dt - now) <= timedelta(minutes=30)
            minutes_until = max(0, int((debut_dt - now).total_seconds() / 60)) if debut_dt > now else 0
        except Exception:
            pass

    return {
        "is_today":     is_today,
        "is_active":    is_active,
        "is_imminent":  is_imminent,
        "is_past":      is_past,
        "minutes_until": minutes_until,
    }


def serialize_reservation(r: Reservation, db: Session = None) -> dict:
    etudiant      = r.etudiant
    etudiant_user = etudiant.user if etudiant else None
    prof          = r.professeur
    prof_user     = prof.user if prof else None

    lien_meet = r.lien_meet
    if not lien_meet and r.disponibilite_id and db:
        dispo = db.query(Disponibilite).filter(Disponibilite.id == r.disponibilite_id).first()
        if dispo and hasattr(dispo, 'lien_meet'):
            lien_meet = dispo.lien_meet

    session_info = is_session_today_or_soon(r.date_cours, r.heure_debut, r.heure_fin)

    return {
        "id":               r.id,
        "etudiant_id":      r.etudiant_id,
        "prof_id":          r.prof_id,
        "disponibilite_id": r.disponibilite_id,
        "date_cours":       str(r.date_cours) if r.date_cours else None,
        "heure_debut":      str(r.heure_debut)[:5] if r.heure_debut else None,
        "heure_fin":        str(r.heure_fin)[:5]   if r.heure_fin   else None,
        "statut":           r.statut,
        "statut_paiement":  getattr(r, 'statut_paiement', 'non_payé') or 'non_payé',
        "mode_seance":      r.mode_seance or "presentiel",
        "lien_meet":        lien_meet,
        "tarif_applique":   float(r.tarif_applique) if r.tarif_applique else None,
        "notes_etudiant":   r.notes_etudiant,
        "created_at":       str(r.created_at) if r.created_at else None,

        "description_seance": (
            db.query(Disponibilite).filter_by(id=r.disponibilite_id).first().description
            if r.disponibilite_id and db else None
        ),

        "session_today":    session_info["is_today"],
        "session_active":   session_info["is_active"],
        "session_imminent": session_info["is_imminent"],
        "session_past":     session_info["is_past"],
        "minutes_until":    session_info["minutes_until"],

        "etudiant_nom":       f"{etudiant_user.prenom or ''} {etudiant_user.nom or ''}".strip() if etudiant_user else "—",
        "etudiant_email":     etudiant_user.email  if etudiant_user else None,
        "etudiant_telephone": etudiant.telephone   if etudiant      else None,
        "etudiant_ville":     etudiant.ville       if etudiant      else None,
        "etudiant_niveau":    etudiant.niveau      if etudiant      else None,
        "etudiant_photo":     None,

        "prof_nom":       f"{prof_user.prenom or ''} {prof_user.nom or ''}".strip() if prof_user else "—",
        "prof_email":     prof_user.email     if prof_user else None,
        "prof_telephone": prof.telephone      if prof      else None,
        "prof_photo":     prof.photo_url      if prof      else None,
    }


@router.get("/mes-reservations")
def mes_reservations(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role == "étudiant":
        etudiant = db.query(Etudiant).filter(Etudiant.user_id == current_user.id).first()
        if not etudiant:
            return []
        resa = db.query(Reservation).filter(
            Reservation.etudiant_id == etudiant.id
        ).order_by(Reservation.created_at.desc()).all()
    else:
        prof = db.query(Professeur).filter(Professeur.user_id == current_user.id).first()
        if not prof:
            return []
        resa = db.query(Reservation).filter(
            Reservation.prof_id == prof.id
        ).order_by(Reservation.created_at.desc()).all()

    return [serialize_reservation(r, db) for r in resa]


@router.put("/{res_id}")
def update_reservation(
    res_id: int,
    data: ReservationUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    res = db.query(Reservation).filter(Reservation.id == res_id).first()
    if not res:
        raise HTTPException(404, "Réservation introuvable")

    ancien_statut = res.statut
    res.statut    = data.statut

    if data.statut in ("refusé", "annulé") and ancien_statut == "en_attente":
        if res.disponibilite_id:
            dispo = db.query(Disponibilite).filter(
                Disponibilite.id == res.disponibilite_id
            ).first()
            if dispo and dispo.nb_inscrits > 0:
                dispo.nb_inscrits -= 1

    db.commit()
    return {"message": f"Réservation {data.statut}", "lien_meet": res.lien_meet}


# ── NOUVEAU : Route paiement ──────────────────────────────────────
@router.post("/{res_id}/payer")
def payer_reservation(
    res_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Marque une réservation comme payée."""
    res = db.query(Reservation).filter(Reservation.id == res_id).first()
    if not res:
        raise HTTPException(404, "Réservation introuvable")

    # Vérifier que c'est bien l'étudiant propriétaire
    etudiant = db.query(Etudiant).filter(Etudiant.user_id == current_user.id).first()
    if not etudiant or res.etudiant_id != etudiant.id:
        raise HTTPException(403, "Non autorisé")

    # Vérifier que la réservation est confirmée
    if res.statut != "confirmé":
        raise HTTPException(400, "La réservation doit être confirmée avant le paiement")

    # Marquer comme payée
    res.statut_paiement = "payé"
    db.commit()

    return {
        "message": "Paiement enregistré avec succès",
        "reservation_id": res_id,
        "statut_paiement": "payé",
        "montant": float(res.tarif_applique) if res.tarif_applique else 0,
    }