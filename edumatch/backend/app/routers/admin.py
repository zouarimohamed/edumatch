from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, text
from app.database import get_db
from app.models import (
    User, Professeur, Etudiant, ProfMatiereTarif, Reservation, Avis,
    Matiere, Niveau, Ville, Domaine, DemandeMatiere
)
from app.utils.dependencies import require_admin

router = APIRouter()

# ── STATS ────────────────────────────────────────────────────────
@router.get("/stats")
def get_stats(db: Session = Depends(get_db), _=Depends(require_admin)):
    count_mois = db.query(Reservation).filter(
        func.extract('month', Reservation.created_at) == func.extract('month', func.now())
    ).count()
    return {
        "total_users":               db.query(User).count(),
        "total_professeurs":         db.query(Professeur).filter_by(statut_validation="validé").count(),
        "en_attente":                db.query(Professeur).filter_by(statut_validation="en_attente").count(),
        "total_reservations":        db.query(Reservation).count(),
        "reservations_mois":         count_mois,
        "demandes_matieres_pending": db.query(DemandeMatiere).filter_by(statut="en_attente").count(),
    }


# ── STATS GRAPHIQUES ─────────────────────────────────────────────
@router.get("/stats/charts")
def get_stats_charts(db: Session = Depends(get_db), _=Depends(require_admin)):
    from sqlalchemy import extract
    from datetime import datetime, timedelta

    today   = datetime.now()
    MOIS_FR = ['Jan','Fév','Mar','Avr','Mai','Jun',
               'Jul','Aoû','Sep','Oct','Nov','Déc']
    reservations_par_mois = []
    for i in range(5, -1, -1):
        d = today - timedelta(days=30 * i)
        try:
            count = db.query(Reservation).filter(
                extract('year',  Reservation.created_at) == d.year,
                extract('month', Reservation.created_at) == d.month,
            ).count()
        except Exception:
            count = 0
        reservations_par_mois.append({
            "mois":  MOIS_FR[d.month - 1],
            "annee": d.year,
            "total": count,
        })

    matieres_par_domaine = []
    try:
        domaines = db.query(Domaine).all()
        for domaine in domaines:
            matieres_data = []
            niveaux = db.query(Niveau).filter(Niveau.domaine_id == domaine.id).all()
            for niveau in niveaux:
                matieres = db.query(Matiere).filter(Matiere.niveau_id == niveau.id).all()
                for matiere in matieres:
                    try:
                        nb_profs = db.query(func.count(ProfMatiereTarif.prof_id.distinct())).filter(ProfMatiereTarif.matiere_id == matiere.id).scalar() or 0
                    except: nb_profs = 0
                    try:
                        nb_resa = (db.query(func.count(Reservation.id)).join(Professeur, Professeur.id == Reservation.prof_id).join(ProfMatiereTarif, ProfMatiereTarif.prof_id == Professeur.id).filter(ProfMatiereTarif.matiere_id == matiere.id).scalar() or 0)
                    except: nb_resa = 0
                    matieres_data.append({"matiere": matiere.nom, "nb_profs": nb_profs, "nb_resa": nb_resa})
            if matieres_data:
                matieres_data.sort(key=lambda x: (x["nb_resa"], x["nb_profs"]), reverse=True)
                matieres_par_domaine.append({"domaine": domaine.nom, "matieres": matieres_data[:8]})
    except Exception as e:
        print(f"[charts] Erreur matières: {e}")

    try:
        profs_valides = db.query(Professeur).filter(Professeur.statut_validation == "validé").all()
        nb_en_ligne   = sum(1 for p in profs_valides if p.mode_enseignement == "en_ligne")
        nb_presentiel = sum(1 for p in profs_valides if p.mode_enseignement == "presentiel")
        nb_les_deux   = sum(1 for p in profs_valides if p.mode_enseignement == "les_deux")
        modes_enseignement = [{"label": "En ligne", "val": nb_en_ligne + nb_les_deux}, {"label": "Présentiel", "val": nb_presentiel + nb_les_deux}]
        modes_enseignement = [m for m in modes_enseignement if m["val"] > 0]
        total_valides = len(profs_valides)
    except:
        modes_enseignement = []; total_valides = 0

    try:
        statut_profs = [
            {"label": "Validés",    "val": db.query(Professeur).filter_by(statut_validation="validé").count()},
            {"label": "En attente", "val": db.query(Professeur).filter_by(statut_validation="en_attente").count()},
            {"label": "Refusés",    "val": db.query(Professeur).filter_by(statut_validation="refusé").count()},
        ]
    except: statut_profs = []

    JOURS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    reservations_par_jour = []
    try:
        for jour_num in range(7):
            pg_dow = (jour_num + 1) % 7
            count = db.query(func.count(Reservation.id)).filter(extract('dow', Reservation.created_at) == pg_dow).scalar() or 0
            reservations_par_jour.append({"jour": JOURS_FR[jour_num], "total": count})
    except: reservations_par_jour = [{"jour": j, "total": 0} for j in JOURS_FR]

    top_matieres_par_domaine = []
    par_niveau = []
    try:
        rows = db.execute(text("""
            SELECT d.nom AS domaine, niv.nom AS niveau, m.nom AS matiere, m.id AS matiere_id,
                COUNT(DISTINCT pmt.prof_id) AS nb_profs, COUNT(DISTINCT r.id) AS nb_resa
            FROM domaines d
            JOIN niveaux niv ON niv.domaine_id = d.id
            JOIN matieres m ON m.niveau_id = niv.id
            LEFT JOIN prof_matiere_tarif pmt ON pmt.matiere_id = m.id
            LEFT JOIN professeurs p ON p.id = pmt.prof_id AND p.statut_validation = 'validé'
            LEFT JOIN disponibilites dispo ON dispo.prof_id = p.id AND dispo.actif = true
            LEFT JOIN reservations r ON r.disponibilite_id = dispo.id AND r.statut IN ('confirmé', 'en_attente', 'terminé')
            GROUP BY d.id, d.nom, niv.id, niv.nom, m.id, m.nom
            ORDER BY d.nom, niv.nom, nb_resa DESC, nb_profs DESC
        """)).fetchall()
        from collections import defaultdict
        grouped_dom = defaultdict(lambda: defaultdict(lambda: {"nb_profs":0,"nb_resa":0,"niveaux":set()}))
        grouped_niv = defaultdict(lambda: defaultdict(list))
        for row in rows:
            dom=row.domaine; niv=row.niveau; mat=row.matiere
            nb_p=int(row.nb_profs or 0); nb_r=int(row.nb_resa or 0)
            grouped_dom[dom][mat]["nb_profs"] = max(grouped_dom[dom][mat]["nb_profs"], nb_p)
            grouped_dom[dom][mat]["nb_resa"] += nb_r
            grouped_dom[dom][mat]["niveaux"].add(niv)
            existing = next((x for x in grouped_niv[dom][niv] if x["matiere"] == mat), None)
            if existing: existing["nb_profs"] += nb_p; existing["nb_resa"] += nb_r
            else: grouped_niv[dom][niv].append({"matiere": mat, "nb_profs": nb_p, "nb_resa": nb_r})
        for domaine_nom, mats_dict in grouped_dom.items():
            mats = []
            for mat_nom, data in mats_dict.items():
                mats.append({"matiere": mat_nom, "nb_profs": data["nb_profs"], "nb_resa": data["nb_resa"], "niveaux": sorted(list(data["niveaux"]))})
            mats_sorted = sorted(mats, key=lambda x: (x["nb_resa"], x["nb_profs"]), reverse=True)
            top_matieres_par_domaine.append({"domaine": domaine_nom, "matieres": mats_sorted[:15]})
        for domaine_nom in grouped_niv:
            niveaux_list = []
            for niv_nom, mats in grouped_niv[domaine_nom].items():
                mats_sorted = sorted(mats, key=lambda x: (x["nb_resa"], x["nb_profs"]), reverse=True)
                niveaux_list.append({"niveau": niv_nom, "matieres": mats_sorted, "total_profs": sum(m["nb_profs"] for m in mats_sorted), "total_resa": sum(m["nb_resa"] for m in mats_sorted)})
            niveaux_list.sort(key=lambda x: x["total_resa"], reverse=True)
            par_niveau.append({"domaine": domaine_nom, "niveaux": niveaux_list})
        if top_matieres_par_domaine:
            matieres_par_domaine = top_matieres_par_domaine
    except Exception as e:
        print(f"[charts] Erreur analyse: {e}"); import traceback; traceback.print_exc()

    try:
        nb_etudiants = db.query(Etudiant).count()
        nb_resa_total = db.query(Reservation).count()
        nb_resa_confirmees = db.query(Reservation).filter(Reservation.statut == "confirmé").count()
        nb_resa_terminees = db.query(Reservation).filter(Reservation.statut == "terminé").count()
        nb_resa_refusees = db.query(Reservation).filter(Reservation.statut == "refusé").count()
        nb_resa_attente = db.query(Reservation).filter(Reservation.statut == "en_attente").count()
        nb_etudiants_actifs = db.query(func.count(Reservation.etudiant_id.distinct())).scalar() or 0
        entonnoir = {
            "etudiants_inscrits": nb_etudiants, "etudiants_actifs": nb_etudiants_actifs,
            "reservations_total": nb_resa_total, "reservations_attente": nb_resa_attente,
            "reservations_confirmees": nb_resa_confirmees, "reservations_terminees": nb_resa_terminees,
            "reservations_refusees": nb_resa_refusees,
            "taux_activation": round(nb_etudiants_actifs/nb_etudiants*100, 1) if nb_etudiants > 0 else 0,
            "taux_confirmation": round(nb_resa_confirmees/nb_resa_total*100, 1) if nb_resa_total > 0 else 0,
            "taux_refus": round(nb_resa_refusees/nb_resa_total*100, 1) if nb_resa_total > 0 else 0,
        }
    except: entonnoir = {}

    try:
        profs_data = []
        seen_user_ids = set(); seen_noms = set()
        profs_all = db.query(Professeur).filter_by(statut_validation="validé").all()
        for p in profs_all:
            u = p.user
            if not u: continue
            if u.id in seen_user_ids: continue
            seen_user_ids.add(u.id)
            nom_key = f"{(u.prenom or '').strip().lower()} {(u.nom or '').strip().lower()}"
            if nom_key in seen_noms: continue
            seen_noms.add(nom_key)
            nom = f"{u.prenom or ''} {u.nom or ''}".strip()
            nb_r_total = db.query(func.count(Reservation.id)).filter(Reservation.prof_id == p.id).scalar() or 0
            nb_r_confirme = db.query(func.count(Reservation.id)).filter(Reservation.prof_id == p.id, Reservation.statut == "confirmé").scalar() or 0
            nb_r_termine = db.query(func.count(Reservation.id)).filter(Reservation.prof_id == p.id, Reservation.statut == "terminé").scalar() or 0
            nb_r_refuse = db.query(func.count(Reservation.id)).filter(Reservation.prof_id == p.id, Reservation.statut == "refusé").scalar() or 0
            note = float(p.note_moyenne or 0)
            taux_conf = round(nb_r_confirme / nb_r_total * 100, 1) if nb_r_total > 0 else 0
            matieres = list({pmt.matiere.nom for pmt in p.tarifs_matieres if pmt.matiere}) if p.tarifs_matieres else []
            profs_data.append({"id": p.id, "nom": nom, "note": note, "nb_avis": p.nb_avis or 0, "nb_resa": nb_r_total, "nb_confirme": nb_r_confirme, "nb_termine": nb_r_termine, "nb_refuse": nb_r_refuse, "taux_confirmation": taux_conf, "mode": p.mode_enseignement or "presentiel", "ville": p.ville or "", "matieres": matieres[:3], "photo": p.photo_url or ""})
        profs_data.sort(key=lambda x: (x["note"], x["nb_resa"]), reverse=True)
        total_profs_performance = len(profs_data)
    except: profs_data = []; total_profs_performance = 0

    demandes_stats = []
    try:
        rows = db.execute(text("SELECT statut, COUNT(*) AS nb, ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER (), 0), 1) AS pct FROM demandes_matieres GROUP BY statut ORDER BY statut")).fetchall()
        for d in rows:
            demandes_stats.append({"statut": d.statut, "nb": int(d.nb or 0), "pct": float(d.pct or 0)})
    except: pass

    return {
        "reservations_par_mois": reservations_par_mois,
        "reservations_par_jour": reservations_par_jour,
        "par_niveau": par_niveau,
        "matieres_par_domaine": matieres_par_domaine,
        "modes_enseignement": modes_enseignement,
        "statut_profs": statut_profs,
        "total_profs_valides": total_valides,
        "top_matieres_par_domaine": top_matieres_par_domaine,
        "entonnoir": entonnoir,
        "performance_profs": profs_data,
        "performance_profs_total": total_profs_performance,
        "demandes_stats": demandes_stats,
    }


@router.get("/stats/public")
def get_public_stats(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_profs = db.query(Professeur).filter_by(statut_validation="validé").count()
    return {"total_professeurs": total_profs, "total_etudiants": max(0, total_users - total_profs - 1), "total_users": total_users, "total_reservations": db.query(Reservation).count()}


# ── RÉFÉRENTIEL ──────────────────────────────────────────────────
@router.get("/referentiel/structure")
def get_full_structure(db: Session = Depends(get_db)):
    return db.query(Domaine).options(joinedload(Domaine.niveaux).joinedload(Niveau.matieres)).all()

@router.get("/referentiel/villes")
def list_villes(db: Session = Depends(get_db)):
    return db.query(Ville).all()

@router.post("/referentiel/villes")
def add_ville(data: dict, db: Session = Depends(get_db), _=Depends(require_admin)):
    nom = data.get("nom", "").strip()
    if not nom: raise HTTPException(400, "Nom requis")
    if db.query(Ville).filter(func.lower(Ville.nom) == nom.lower()).first(): raise HTTPException(400, "Cette ville existe déjà")
    ville = Ville(nom=nom); db.add(ville); db.commit(); db.refresh(ville)
    return {"id": ville.id, "nom": ville.nom}

@router.delete("/referentiel/villes/{ville_id}")
def delete_ville(ville_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    ville = db.query(Ville).filter(Ville.id == ville_id).first()
    if not ville: raise HTTPException(404, "Ville introuvable")
    db.delete(ville); db.commit(); return {"message": "Ville supprimée"}

@router.post("/referentiel/domaines")
def add_domaine(data: dict, db: Session = Depends(get_db), _=Depends(require_admin)):
    nom = data.get("nom", "").strip()
    if not nom: raise HTTPException(400, "Nom requis")
    if db.query(Domaine).filter(func.lower(Domaine.nom) == nom.lower()).first(): raise HTTPException(400, "Ce domaine existe déjà")
    domaine = Domaine(nom=nom); db.add(domaine); db.commit(); db.refresh(domaine)
    return {"id": domaine.id, "nom": domaine.nom}

@router.delete("/referentiel/domaines/{domaine_id}")
def delete_domaine(domaine_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    domaine = db.query(Domaine).filter(Domaine.id == domaine_id).first()
    if not domaine: raise HTTPException(404, "Domaine introuvable")
    db.delete(domaine); db.commit(); return {"message": "Domaine supprimé"}

@router.post("/referentiel/niveaux")
def add_niveau(data: dict, db: Session = Depends(get_db), _=Depends(require_admin)):
    nom = data.get("nom", "").strip(); domaine_id = data.get("domaine_id")
    if not nom or not domaine_id: raise HTTPException(400, "Nom et domaine_id requis")
    niveau = Niveau(nom=nom, domaine_id=domaine_id); db.add(niveau); db.commit(); db.refresh(niveau)
    return {"id": niveau.id, "nom": niveau.nom}

@router.delete("/referentiel/niveaux/{niveau_id}")
def delete_niveau(niveau_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    niveau = db.query(Niveau).filter(Niveau.id == niveau_id).first()
    if not niveau: raise HTTPException(404, "Niveau introuvable")
    db.delete(niveau); db.commit(); return {"message": "Niveau supprimé"}

@router.post("/referentiel/matieres")
def add_matiere(data: dict, db: Session = Depends(get_db), _=Depends(require_admin)):
    nom = data.get("nom", "").strip(); niveau_id = data.get("niveau_id")
    if not nom: raise HTTPException(400, "Nom requis")
    m = Matiere(nom=nom, niveau_id=niveau_id); db.add(m); db.commit(); db.refresh(m)
    return {"id": m.id, "nom": m.nom}

@router.delete("/referentiel/matieres/{mid}")
def delete_matiere(mid: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    m = db.query(Matiere).filter(Matiere.id == mid).first()
    if not m: raise HTTPException(404, "Matière introuvable")
    db.delete(m); db.commit(); return {"message": "Matière supprimée"}


# ── PROFESSEURS ──────────────────────────────────────────────────
@router.get("/professeurs/pending")
def pending_profs(db: Session = Depends(get_db), _=Depends(require_admin)):
    profs = db.query(Professeur).filter_by(statut_validation="en_attente").all()
    return [{"id": p.id, "nom": f"{p.user.prenom} {p.user.nom}", "email": p.user.email} for p in profs if p.user]

@router.get("/professeurs/all")
def get_all_profs(db: Session = Depends(get_db), _=Depends(require_admin)):
    from app.routers.professeurs import prof_to_out
    profs = db.query(Professeur).all()
    return [prof_to_out(p) for p in profs]

@router.put("/professeurs/{prof_id}/valider")
def valider_prof(prof_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    prof = db.query(Professeur).filter(Professeur.id == prof_id).first()
    if not prof: raise HTTPException(404, "Professeur introuvable")
    prof.statut_validation = "validé"
    prof.raison_refus = None
    db.commit()
    # ── Notification au professeur : candidature validée ──
    msg = f"Félicitations ! Votre profil a été validé le {datetime.now().strftime('%d/%m/%Y')}. Vous êtes maintenant visible par les étudiants sur EduMatch."
    try:
        db.execute(text("""
            INSERT INTO notifications (prof_id, type, message, lu, created_at)
            VALUES (:prof_id, 'validation', :message, false, NOW())
        """), {"prof_id": prof_id, "message": msg})
        db.commit()
    except Exception as e:
        print(f"[admin] notification validation error: {e}")
    return {"message": "Professeur validé", "notification_envoyee": True}

@router.put("/professeurs/{prof_id}/refuser")
def refuser_prof(prof_id: int, data: dict = Body(default={}), db: Session = Depends(get_db), _=Depends(require_admin)):
    prof = db.query(Professeur).filter(Professeur.id == prof_id).first()
    if not prof: raise HTTPException(404, "Professeur introuvable")
    raison = (data.get("raison") or "").strip() if data else ""
    prof.statut_validation = "refusé"
    prof.raison_refus = raison if raison else None
    db.commit()
    # ── Notification automatique au professeur (re-envoyée à chaque refus) ──
    msg = f"Votre candidature a été refusée le {datetime.now().strftime('%d/%m/%Y')}."
    if raison:
        msg += f" Raison : {raison}"
    else:
        msg += " Aucune raison précisée."
    msg += " Vous pouvez corriger votre profil et resoumettre votre candidature."
    try:
        # Supprimer les anciennes notifs de refus non lues pour ce prof
        # afin que la nouvelle soit bien perçue comme "nouvelle"
        db.execute(text("""
            DELETE FROM notifications
            WHERE prof_id = :prof_id AND type = 'refus'
        """), {"prof_id": prof_id})
        # Insérer la nouvelle notification
        db.execute(text("""
            INSERT INTO notifications (prof_id, type, message, lu, created_at)
            VALUES (:prof_id, 'refus', :message, false, NOW())
        """), {"prof_id": prof_id, "message": msg})
        db.commit()
    except Exception as e:
        print(f"[admin] notification error: {e}")
    return {"message": "Professeur refusé", "notification_envoyee": True}


# ── BLOCAGE / DÉBLOCAGE ──────────────────────────────────────────
@router.put("/users/{user_id}/bloquer")
def bloquer_user(user_id: int, data: dict = Body(default={}), db: Session = Depends(get_db), _=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user: raise HTTPException(404, "Utilisateur introuvable")
    if user.role == "admin": raise HTTPException(400, "Impossible de bloquer un administrateur")
    raison = (data.get("raison") or "").strip() if data else ""
    # UPDATE SQL brut pour garantir la sauvegarde même si colonne hors modèle ORM
    db.execute(text("""
        UPDATE users
        SET statut = 'bloqué', raison_blocage = :raison
        WHERE id = :uid
    """), {"raison": raison if raison else None, "uid": user_id})
    db.commit()
    # Recharger pour les notifications
    user = db.query(User).filter(User.id == user_id).first()
    # notification automatique
    msg = f"Votre compte a été suspendu le {datetime.now().strftime('%d/%m/%Y')} par l'administration."
    if raison:
        msg += f" Raison : {raison}"
    msg += " Contactez l'équipe EduMatch si vous pensez que c'est une erreur."
    try:
        if user.role == "professeur":
            prof = db.execute(text("SELECT id FROM professeurs WHERE user_id = :uid"), {"uid": user.id}).fetchone()
            if prof:
                db.execute(text("INSERT INTO notifications (prof_id, type, message, lu, created_at) VALUES (:pid, 'blocage', :msg, false, NOW())"), {"pid": prof.id, "msg": msg})
                db.commit()
        elif user.role == "étudiant":
            db.execute(text("INSERT INTO notifications_users (user_id, type, message, lu, created_at) VALUES (:uid, 'blocage', :msg, false, NOW())"), {"uid": user.id, "msg": msg})
            db.commit()
    except Exception as e:
        print(f"[admin] notif blocage error: {e}")
    return {"message": "Utilisateur bloqué", "raison": raison}


@router.put("/users/{user_id}/debloquer")
def debloquer_user(user_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user: raise HTTPException(404, "Utilisateur introuvable")
    db.execute(text("""
        UPDATE users
        SET statut = 'actif', raison_blocage = NULL
        WHERE id = :uid
    """), {"uid": user_id})
    db.commit()
    user = db.query(User).filter(User.id == user_id).first()
    msg = f"Votre compte a été réactivé le {datetime.now().strftime('%d/%m/%Y')}. Vous pouvez à nouveau vous connecter."
    try:
        if user.role == "professeur":
            prof = db.execute(text("SELECT id FROM professeurs WHERE user_id = :uid"), {"uid": user.id}).fetchone()
            if prof:
                db.execute(text("INSERT INTO notifications (prof_id, type, message, lu, created_at) VALUES (:pid, 'deblocage', :msg, false, NOW())"), {"pid": prof.id, "msg": msg})
                db.commit()
        elif user.role == "étudiant":
            db.execute(text("INSERT INTO notifications_users (user_id, type, message, lu, created_at) VALUES (:uid, 'deblocage', :msg, false, NOW())"), {"uid": user.id, "msg": msg})
            db.commit()
    except Exception as e:
        print(f"[admin] notif deblocage error: {e}")
    return {"message": "Utilisateur débloqué"}

@router.get("/users/all")
def get_all_users(db: Session = Depends(get_db), _=Depends(require_admin)):
    # SQL brut pour lire raison_blocage même si absent du modèle ORM
    rows = db.execute(text("""
        SELECT
            id, nom, prenom, email, role, statut,
            raison_blocage,
            created_at
        FROM users
        ORDER BY created_at DESC
    """)).fetchall()
    return [
        {
            "id":             r.id,
            "nom":            r.nom,
            "prenom":         r.prenom,
            "email":          r.email,
            "role":           r.role,
            "statut":         r.statut,
            "raison_blocage": r.raison_blocage or None,
            "created_at":     str(r.created_at) if r.created_at else None,
        }
        for r in rows
    ]

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user: raise HTTPException(404, "Utilisateur introuvable")
    db.delete(user); db.commit()
    return {"message": "Utilisateur supprimé"}


# ── SIGNALEMENTS ─────────────────────────────────────────────────
@router.get("/signalements")
def get_signalements(db: Session = Depends(get_db), _=Depends(require_admin)):
    try:
        rows = db.execute(text("""
            SELECT s.id, s.raison, s.statut, s.created_at,
                   eu.prenom || ' ' || eu.nom AS etudiant_nom,
                   pu.prenom || ' ' || pu.nom AS prof_nom,
                   s.etudiant_id, s.prof_id
            FROM signalements s
            JOIN etudiants e ON e.id = s.etudiant_id
            JOIN users eu ON eu.id = e.user_id
            JOIN professeurs p ON p.id = s.prof_id
            JOIN users pu ON pu.id = p.user_id
            ORDER BY s.created_at DESC
        """)).fetchall()
        return [
            {
                "id": r.id,
                "raison": r.raison,
                "statut": r.statut,
                "created_at": str(r.created_at),
                "etudiant_nom": r.etudiant_nom,
                "prof_nom": r.prof_nom,
                "etudiant_id": r.etudiant_id,
                "prof_id": r.prof_id,
            }
            for r in rows
        ]
    except Exception as e:
        print(f"[admin] signalements error: {e}")
        return []

@router.post("/signalements")
def create_signalement(data: dict, db: Session = Depends(get_db)):
    """Route publique — étudiant connecté peut signaler un prof"""
    etudiant_id = data.get("etudiant_id")
    prof_id = data.get("prof_id")
    raison = data.get("raison", "").strip()
    if not etudiant_id or not prof_id or not raison:
        raise HTTPException(400, "etudiant_id, prof_id et raison requis")
    try:
        db.execute(text("""
            INSERT INTO signalements (etudiant_id, prof_id, raison, statut, created_at)
            VALUES (:etudiant_id, :prof_id, :raison, 'nouveau', NOW())
        """), {"etudiant_id": etudiant_id, "prof_id": prof_id, "raison": raison})
        db.commit()
        return {"message": "Signalement envoyé"}
    except Exception as e:
        print(f"[admin] create_signalement error: {e}")
        raise HTTPException(500, "Erreur lors de la création du signalement")

@router.put("/signalements/{sig_id}/action")
def action_signalement(sig_id: int, data: dict, db: Session = Depends(get_db), _=Depends(require_admin)):
    action = data.get("action")  # 'ignorer' | 'avertir' | 'bloquer'
    if action not in ["ignorer", "avertir", "bloquer"]:
        raise HTTPException(400, "Action invalide: ignorer | avertir | bloquer")
    try:
        # Récupérer le signalement
        sig = db.execute(text("SELECT * FROM signalements WHERE id = :id"), {"id": sig_id}).fetchone()
        if not sig: raise HTTPException(404, "Signalement introuvable")

        if action == "ignorer":
            db.execute(text("UPDATE signalements SET statut = 'ignoré' WHERE id = :id"), {"id": sig_id})
        elif action == "avertir":
            db.execute(text("UPDATE signalements SET statut = 'traité' WHERE id = :id"), {"id": sig_id})
            # Envoyer une notification au professeur concerné
            etudiant_info = db.execute(text("""
                SELECT u.prenom || ' ' || u.nom AS nom
                FROM etudiants e JOIN users u ON u.id = e.user_id
                WHERE e.id = :etudiant_id
            """), {"etudiant_id": sig.etudiant_id}).fetchone()
            etudiant_nom = etudiant_info.nom if etudiant_info else "Un étudiant"
            msg_warning = (
                f"Vous avez reçu un avertissement officiel suite à un signalement de {etudiant_nom} "
                f"le {datetime.now().strftime('%d/%m/%Y')}. "
                f"Raison signalée : {sig.raison}. "
                f"Merci de respecter les conditions d'utilisation d'EduMatch."
            )
            try:
                db.execute(text("""
                    INSERT INTO notifications (prof_id, type, message, lu, created_at)
                    VALUES (:prof_id, 'warning', :msg, false, NOW())
                """), {"prof_id": sig.prof_id, "msg": msg_warning})
            except Exception as e2:
                print(f"[admin] avertissement notification error: {e2}")
        elif action == "bloquer":
            db.execute(text("UPDATE signalements SET statut = 'traité' WHERE id = :id"), {"id": sig_id})
            # Bloquer le prof (via user)
            raison = data.get("raison", "Signalement étudiant")
            db.execute(text("""
                UPDATE users SET statut = 'bloqué', raison_blocage = :raison
                WHERE id = (SELECT user_id FROM professeurs WHERE id = :prof_id)
            """), {"raison": raison, "prof_id": sig.prof_id})
        db.commit()
        return {"message": f"Action '{action}' effectuée"}
    except HTTPException: raise
    except Exception as e:
        print(f"[admin] action_signalement error: {e}")
        raise HTTPException(500, "Erreur action signalement")


# ── DEMANDES MATIÈRES ────────────────────────────────────────────
@router.get("/demandes-matieres")
def get_demandes(db: Session = Depends(get_db), _=Depends(require_admin)):
    demandes = (db.query(DemandeMatiere).options(joinedload(DemandeMatiere.professeur).joinedload(Professeur.user), joinedload(DemandeMatiere.niveau)).order_by(DemandeMatiere.created_at.desc()).all())
    return [{"id": d.id, "nom_matiere": d.nom_matiere, "niveau_id": d.niveau_id, "nom_niveau": d.niveau.nom if d.niveau else "—", "statut": d.statut, "created_at": d.created_at, "prof_id": d.prof_id, "prof_nom": f"{d.professeur.user.prenom} {d.professeur.user.nom}" if d.professeur and d.professeur.user else "—"} for d in demandes]

@router.put("/demandes-matieres/{demande_id}/approuver")
def approuver_demande(demande_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    d = db.query(DemandeMatiere).filter(DemandeMatiere.id == demande_id).first()
    if not d: raise HTTPException(404, "Demande introuvable")
    if d.statut != "en_attente": raise HTTPException(400, "Demande déjà traitée")
    m = Matiere(nom=d.nom_matiere, niveau_id=d.niveau_id); db.add(m); db.flush()
    d.statut = "approuvé"; db.commit()
    return {"message": "Matière approuvée", "matiere_id": m.id}

@router.put("/demandes-matieres/{demande_id}/refuser")
def refuser_demande(demande_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    d = db.query(DemandeMatiere).filter(DemandeMatiere.id == demande_id).first()
    if not d: raise HTTPException(404, "Demande introuvable")
    d.statut = "refusé"; db.commit()
    return {"message": "Demande refusée"}


# ── TOUTES LES RÉSERVATIONS ──────────────────────────────────────
@router.get("/reservations/all")
def get_all_reservations(db: Session = Depends(get_db), _=Depends(require_admin)):
    try:
        rows = db.execute(text("""
            SELECT r.id, r.date_cours,
                r.heure_debut::text AS heure_debut,
                r.heure_fin::text AS heure_fin,
                r.statut, r.mode_seance, r.statut_paiement,
                r.disponibilite_id,
                CAST(COALESCE(r.tarif_applique, 0) AS FLOAT) AS tarif_applique,
                pu.prenom || ' ' || pu.nom AS prof_nom,
                pu.email AS prof_email,
                eu.prenom || ' ' || eu.nom AS etudiant_nom,
                eu.email AS etudiant_email,
                niv.nom AS niveau_nom
            FROM reservations r
            JOIN professeurs p ON p.id = r.prof_id
            JOIN users pu ON pu.id = p.user_id
            JOIN etudiants e ON e.id = r.etudiant_id
            JOIN users eu ON eu.id = e.user_id
            LEFT JOIN disponibilites d ON d.id = r.disponibilite_id
            LEFT JOIN niveaux niv ON niv.id = d.niveau_id
            ORDER BY r.date_cours DESC, r.heure_debut
        """)).fetchall()
        return [
            {
                "id": row.id,
                "date_cours": str(row.date_cours) if row.date_cours else None,
                "heure_debut": str(row.heure_debut)[:5] if row.heure_debut else None,
                "heure_fin": str(row.heure_fin)[:5] if row.heure_fin else None,
                "statut": row.statut,
                "mode_seance": row.mode_seance,
                "statut_paiement": row.statut_paiement,
                "tarif_applique": round(row.tarif_applique, 2),
                "prof_nom": row.prof_nom,
                "prof_email": row.prof_email,
                "etudiant_nom": row.etudiant_nom,
                "etudiant_email": row.etudiant_email,
                "disponibilite_id": row.disponibilite_id,
                "niveau_nom": row.niveau_nom or None,
            }
            for row in rows
        ]
    except Exception as e:
        print(f"[admin] reservations/all error: {e}"); return []