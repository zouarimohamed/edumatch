from fastapi import APIRouter, Depends, HTTPException
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

    # ── 1. Réservations par mois ─────────────────────────────────
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

    # ── 2. Matières par domaine — SQL brut garanti ───────────────
    # ProfMatiereTarif n'a PAS de colonne "id" (clé composite)
    # → on utilise func.count(ProfMatiereTarif.prof_id.distinct())
    matieres_par_domaine = []
    try:
        domaines = db.query(Domaine).all()
        for domaine in domaines:
            matieres_data = []
            niveaux = db.query(Niveau).filter(Niveau.domaine_id == domaine.id).all()
            for niveau in niveaux:
                matieres = db.query(Matiere).filter(Matiere.niveau_id == niveau.id).all()
                for matiere in matieres:
                    # Compter profs distincts via colonne prof_id (pas id)
                    try:
                        nb_profs = db.query(
                            func.count(ProfMatiereTarif.prof_id.distinct())
                        ).filter(
                            ProfMatiereTarif.matiere_id == matiere.id
                        ).scalar() or 0
                    except Exception as e:
                        print(f"[charts] nb_profs error matiere {matiere.id}: {e}")
                        nb_profs = 0

                    # Compter réservations liées à cette matière
                    try:
                        nb_resa = (
                            db.query(func.count(Reservation.id))
                            .join(Professeur, Professeur.id == Reservation.professeur_id)
                            .join(ProfMatiereTarif,
                                  ProfMatiereTarif.prof_id == Professeur.id)
                            .filter(ProfMatiereTarif.matiere_id == matiere.id)
                            .scalar() or 0
                        )
                    except Exception as e:
                        print(f"[charts] nb_resa error matiere {matiere.id}: {e}")
                        nb_resa = 0

                    matieres_data.append({
                        "matiere":  matiere.nom,
                        "nb_profs": nb_profs,
                        "nb_resa":  nb_resa,
                    })

            if matieres_data:
                matieres_data.sort(
                    key=lambda x: (x["nb_resa"], x["nb_profs"]), reverse=True
                )
                matieres_par_domaine.append({
                    "domaine":  domaine.nom,
                    "matieres": matieres_data[:8],
                })

    except Exception as e:
        print(f"[charts] Erreur globale matières: {e}")
        import traceback; traceback.print_exc()

    # ── 3. Mode d'enseignement ────────────────────────────────────
    try:
        profs_valides = db.query(Professeur).filter(
            Professeur.statut_validation == "validé"
        ).all()
        nb_en_ligne   = sum(1 for p in profs_valides if p.mode_enseignement == "en_ligne")
        nb_presentiel = sum(1 for p in profs_valides if p.mode_enseignement == "presentiel")
        nb_les_deux   = sum(1 for p in profs_valides if p.mode_enseignement == "les_deux")
        # "Les deux" = peut enseigner EN LIGNE et EN PRÉSENTIEL
        # → compté dans les deux catégories (capacité réelle de la plateforme)
        modes_enseignement = [
            {"label": "En ligne",   "val": nb_en_ligne + nb_les_deux},
            {"label": "Présentiel", "val": nb_presentiel + nb_les_deux},
        ]
        # Enlever les catégories à 0
        modes_enseignement = [m for m in modes_enseignement if m["val"] > 0]
        total_valides = len(profs_valides)
    except Exception as e:
        print(f"[charts] Erreur modes: {e}")
        modes_enseignement = []
        total_valides      = 0

    # ── 4. Statut des professeurs ─────────────────────────────────
    try:
        statut_profs = [
            {"label": "Validés",    "val": db.query(Professeur).filter_by(statut_validation="validé").count()},
            {"label": "En attente", "val": db.query(Professeur).filter_by(statut_validation="en_attente").count()},
            {"label": "Refusés",    "val": db.query(Professeur).filter_by(statut_validation="refusé").count()},
        ]
    except Exception as e:
        print(f"[charts] Erreur statut: {e}")
        statut_profs = []

    # ── 5. Réservations par jour ──────────────────────────────────
    JOURS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    reservations_par_jour = []
    try:
        for jour_num in range(7):
            pg_dow = (jour_num + 1) % 7
            count = db.query(func.count(Reservation.id)).filter(
                extract('dow', Reservation.created_at) == pg_dow
            ).scalar() or 0
            reservations_par_jour.append({"jour": JOURS_FR[jour_num], "total": count})
    except Exception as e:
        print(f"[charts] Erreur jours: {e}")
        reservations_par_jour = [{"jour": j, "total": 0} for j in JOURS_FR]

    # ── 6. Analyse matières par domaine ET par niveau ───────────────
    # LOGIQUE CORRECTE :
    # Une réservation est liée à une disponibilité (créneau du prof).
    # Ce créneau appartient à un prof. Ce prof enseigne certaines matières
    # via prof_matiere_tarif. On doit joindre r → dispo → prof → pmt → matière
    # MAIS : une réservation n'est pas liée à une matière précise en base.
    # Donc on compte les réservations du prof PONDÉRÉES par le nombre de matières
    # qu'il enseigne dans ce domaine (répartition équitable).
    # Plus simple et plus juste : compter les réservations uniques par prof,
    # et les attribuer aux matières qu'il enseigne (COUNT DISTINCT r.id / nb_matieres_prof).
    # Solution la plus fiable : comptage direct via sous-requête.

    top_matieres_par_domaine = []
    try:
        rows = db.execute(text("""
            SELECT
                d.nom                                    AS domaine,
                niv.nom                                  AS niveau,
                m.nom                                    AS matiere,
                m.id                                     AS matiere_id,
                COUNT(DISTINCT pmt.prof_id)              AS nb_profs,
                COUNT(DISTINCT r.id)                     AS nb_resa
            FROM domaines d
            JOIN niveaux  niv ON niv.domaine_id = d.id
            JOIN matieres m   ON m.niveau_id    = niv.id
            LEFT JOIN prof_matiere_tarif pmt
                   ON pmt.matiere_id = m.id
            LEFT JOIN professeurs p
                   ON p.id = pmt.prof_id
                  AND p.statut_validation = 'validé'
            LEFT JOIN disponibilites dispo
                   ON dispo.prof_id = p.id
                  AND dispo.actif   = true
            LEFT JOIN reservations r
                   ON r.disponibilite_id = dispo.id
                  AND r.statut IN ('confirmé', 'en_attente', 'terminé')
            GROUP BY d.id, d.nom, niv.id, niv.nom, m.id, m.nom
            ORDER BY d.nom, niv.nom, nb_resa DESC, nb_profs DESC
        """)).fetchall()

        from collections import defaultdict

        # Structure : { domaine: { matiere_nom: {nb_profs, nb_resa, niveaux:[]} } }
        grouped_dom  = defaultdict(lambda: defaultdict(lambda: {"nb_profs":0,"nb_resa":0,"niveaux":set()}))
        grouped_niv  = defaultdict(lambda: defaultdict(list))  # domaine → niveau → matieres

        for row in rows:
            dom = row.domaine
            niv = row.niveau
            mat = row.matiere
            nb_p = int(row.nb_profs or 0)
            nb_r = int(row.nb_resa  or 0)

            # Vue par domaine (matières dédupliquées)
            grouped_dom[dom][mat]["nb_profs"] = max(grouped_dom[dom][mat]["nb_profs"], nb_p)
            grouped_dom[dom][mat]["nb_resa"]  += nb_r
            grouped_dom[dom][mat]["niveaux"].add(niv)

            # Vue par niveau
            existing = next((x for x in grouped_niv[dom][niv] if x["matiere"] == mat), None)
            if existing:
                existing["nb_profs"] += nb_p
                existing["nb_resa"]  += nb_r
            else:
                grouped_niv[dom][niv].append({"matiere": mat, "nb_profs": nb_p, "nb_resa": nb_r})

        # Construire matieres_par_domaine (vue agrégée par domaine)
        top_matieres_par_domaine = []
        for domaine_nom, mats_dict in grouped_dom.items():
            mats = []
            for mat_nom, data in mats_dict.items():
                mats.append({
                    "matiere":  mat_nom,
                    "nb_profs": data["nb_profs"],
                    "nb_resa":  data["nb_resa"],
                    "niveaux":  sorted(list(data["niveaux"])),
                })
            mats_sorted = sorted(mats, key=lambda x: (x["nb_resa"], x["nb_profs"]), reverse=True)
            top_matieres_par_domaine.append({
                "domaine":  domaine_nom,
                "matieres": mats_sorted[:15],
            })

        # Construire par_niveau (vue détaillée par niveau)
        par_niveau = []
        for domaine_nom in grouped_niv:
            niveaux_list = []
            for niv_nom, mats in grouped_niv[domaine_nom].items():
                mats_sorted = sorted(mats, key=lambda x: (x["nb_resa"], x["nb_profs"]), reverse=True)
                niveaux_list.append({
                    "niveau":   niv_nom,
                    "matieres": mats_sorted,
                    "total_profs": sum(m["nb_profs"] for m in mats_sorted),
                    "total_resa":  sum(m["nb_resa"]  for m in mats_sorted),
                })
            niveaux_list.sort(key=lambda x: x["total_resa"], reverse=True)
            par_niveau.append({
                "domaine":  domaine_nom,
                "niveaux":  niveaux_list,
            })

        if top_matieres_par_domaine:
            matieres_par_domaine = top_matieres_par_domaine

    except Exception as e:
        print(f"[charts] Erreur analyse matières: {e}")
        import traceback; traceback.print_exc()
        par_niveau = []
    # ── 7. Entonnoir de conversion ────────────────────────────────
    try:
        nb_etudiants  = db.query(Etudiant).count()
        nb_resa_total = db.query(Reservation).count()
        nb_resa_confirmees = db.query(Reservation).filter(
            Reservation.statut == "confirmé"
        ).count()
        nb_resa_terminees = db.query(Reservation).filter(
            Reservation.statut == "terminé"
        ).count()
        nb_resa_refusees = db.query(Reservation).filter(
            Reservation.statut == "refusé"
        ).count()
        nb_resa_attente = db.query(Reservation).filter(
            Reservation.statut == "en_attente"
        ).count()
        # Étudiants ayant fait au moins une réservation
        nb_etudiants_actifs = db.query(
            func.count(Reservation.etudiant_id.distinct())
        ).scalar() or 0

        entonnoir = {
            "etudiants_inscrits":   nb_etudiants,
            "etudiants_actifs":     nb_etudiants_actifs,
            "reservations_total":   nb_resa_total,
            "reservations_attente": nb_resa_attente,
            "reservations_confirmees": nb_resa_confirmees,
            "reservations_terminees":  nb_resa_terminees,
            "reservations_refusees":   nb_resa_refusees,
            "taux_activation":      round(nb_etudiants_actifs/nb_etudiants*100,1) if nb_etudiants>0 else 0,
            "taux_confirmation":    round(nb_resa_confirmees/nb_resa_total*100,1)  if nb_resa_total>0  else 0,
            "taux_refus":           round(nb_resa_refusees/nb_resa_total*100,1)    if nb_resa_total>0  else 0,
        }
    except Exception as e:
        print(f"[charts] Erreur entonnoir: {e}")
        entonnoir = {}

    # ── 8. Performance des formateurs ────────────────────────────
    try:
        profs_data = []
        profs_all = db.query(Professeur).filter_by(statut_validation="validé").all()
        for p in profs_all:
            u = p.user
            nom = f"{u.prenom or ''} {u.nom or ''}".strip() if u else "—"
            nb_r_total     = db.query(func.count(Reservation.id)).filter(Reservation.prof_id == p.id).scalar() or 0
            nb_r_confirme  = db.query(func.count(Reservation.id)).filter(Reservation.prof_id == p.id, Reservation.statut == "confirmé").scalar() or 0
            nb_r_termine   = db.query(func.count(Reservation.id)).filter(Reservation.prof_id == p.id, Reservation.statut == "terminé").scalar() or 0
            nb_r_refuse    = db.query(func.count(Reservation.id)).filter(Reservation.prof_id == p.id, Reservation.statut == "refusé").scalar() or 0
            note           = float(p.note_moyenne or 0)
            taux_conf      = round(nb_r_confirme / nb_r_total * 100, 1) if nb_r_total > 0 else 0
            matieres       = list({pmt.matiere.nom for pmt in p.tarifs_matieres if pmt.matiere}) if p.tarifs_matieres else []
            profs_data.append({
                "id":           p.id,
                "nom":          nom,
                "note":         note,
                "nb_avis":      p.nb_avis or 0,
                "nb_resa":      nb_r_total,
                "nb_confirme":  nb_r_confirme,
                "nb_termine":   nb_r_termine,
                "nb_refuse":    nb_r_refuse,
                "taux_confirmation": taux_conf,
                "mode":         p.mode_enseignement or "presentiel",
                "ville":        p.ville or "",
                "matieres":     matieres[:3],
                "photo":        p.photo_url or "",
            })
        # Trier par note puis nb_reservations
        profs_data.sort(key=lambda x: (x["note"], x["nb_resa"]), reverse=True)
    except Exception as e:
        print(f"[charts] Erreur performance profs: {e}")
        import traceback; traceback.print_exc()
        profs_data = []

    return {
        "reservations_par_mois":    reservations_par_mois,
        "reservations_par_jour":    reservations_par_jour,
        "par_niveau":               par_niveau if 'par_niveau' in dir() else [],
        "matieres_par_domaine":     matieres_par_domaine,
        "modes_enseignement":       modes_enseignement,
        "statut_profs":             statut_profs,
        "total_profs_valides":      total_valides,
        "top_matieres_par_domaine": top_matieres_par_domaine,
        "entonnoir":                entonnoir,
        "performance_profs":        profs_data,
    }


# ── STATS PUBLIQUES ──────────────────────────────────────────────
@router.get("/stats/public")
def get_public_stats(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_profs = db.query(Professeur).filter_by(statut_validation="validé").count()
    return {
        "total_professeurs":  total_profs,
        "total_etudiants":    max(0, total_users - total_profs - 1),
        "total_users":        total_users,
        "total_reservations": db.query(Reservation).count(),
    }

# ── RÉFÉRENTIEL ──────────────────────────────────────────────────
@router.get("/referentiel/structure")
def get_full_structure(db: Session = Depends(get_db)):
    return db.query(Domaine).options(
        joinedload(Domaine.niveaux).joinedload(Niveau.matieres)
    ).all()

@router.get("/referentiel/villes")
def list_villes(db: Session = Depends(get_db)):
    return db.query(Ville).all()

@router.post("/referentiel/villes")
def add_ville(data: dict, db: Session = Depends(get_db), _=Depends(require_admin)):
    nom = data.get("nom", "").strip()
    if not nom: raise HTTPException(400, "Nom requis")
    if db.query(Ville).filter(func.lower(Ville.nom) == nom.lower()).first():
        raise HTTPException(400, "Cette ville existe déjà")
    ville = Ville(nom=nom)
    db.add(ville); db.commit(); db.refresh(ville)
    return {"id": ville.id, "nom": ville.nom}

@router.delete("/referentiel/villes/{ville_id}")
def delete_ville(ville_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    ville = db.query(Ville).filter(Ville.id == ville_id).first()
    if not ville: raise HTTPException(404, "Ville introuvable")
    db.delete(ville); db.commit()
    return {"message": "Ville supprimée"}

@router.post("/referentiel/domaines")
def add_domaine(data: dict, db: Session = Depends(get_db), _=Depends(require_admin)):
    nom = data.get("nom", "").strip()
    if not nom: raise HTTPException(400, "Nom requis")
    if db.query(Domaine).filter(func.lower(Domaine.nom) == nom.lower()).first():
        raise HTTPException(400, "Ce domaine existe déjà")
    domaine = Domaine(nom=nom)
    db.add(domaine); db.commit(); db.refresh(domaine)
    return {"id": domaine.id, "nom": domaine.nom}

@router.delete("/referentiel/domaines/{domaine_id}")
def delete_domaine(domaine_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    domaine = db.query(Domaine).filter(Domaine.id == domaine_id).first()
    if not domaine: raise HTTPException(404, "Domaine introuvable")
    db.delete(domaine); db.commit()
    return {"message": "Domaine supprimé"}

@router.post("/referentiel/niveaux")
def add_niveau(data: dict, db: Session = Depends(get_db), _=Depends(require_admin)):
    nom = data.get("nom", "").strip()
    domaine_id = data.get("domaine_id")
    if not nom or not domaine_id: raise HTTPException(400, "Nom et domaine_id requis")
    niveau = Niveau(nom=nom, domaine_id=domaine_id)
    db.add(niveau); db.commit(); db.refresh(niveau)
    return {"id": niveau.id, "nom": niveau.nom}

@router.delete("/referentiel/niveaux/{niveau_id}")
def delete_niveau(niveau_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    niveau = db.query(Niveau).filter(Niveau.id == niveau_id).first()
    if not niveau: raise HTTPException(404, "Niveau introuvable")
    db.delete(niveau); db.commit()
    return {"message": "Niveau supprimé"}

@router.post("/referentiel/matieres")
def add_matiere(data: dict, db: Session = Depends(get_db), _=Depends(require_admin)):
    nom = data.get("nom", "").strip()
    niveau_id = data.get("niveau_id")
    if not nom: raise HTTPException(400, "Nom requis")
    m = Matiere(nom=nom, niveau_id=niveau_id)
    db.add(m); db.commit(); db.refresh(m)
    return {"id": m.id, "nom": m.nom}

@router.delete("/referentiel/matieres/{mid}")
def delete_matiere(mid: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    m = db.query(Matiere).filter(Matiere.id == mid).first()
    if not m: raise HTTPException(404, "Matière introuvable")
    db.delete(m); db.commit()
    return {"message": "Matière supprimée"}

# ── PROFESSEURS ──────────────────────────────────────────────────
@router.get("/professeurs/pending")
def pending_profs(db: Session = Depends(get_db), _=Depends(require_admin)):
    profs = db.query(Professeur).filter_by(statut_validation="en_attente").all()
    return [
        {"id": p.id, "nom": f"{p.user.prenom} {p.user.nom}", "email": p.user.email}
        for p in profs if p.user
    ]

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
    db.commit()
    return {"message": "Professeur validé"}

@router.put("/professeurs/{prof_id}/refuser")
def refuser_prof(prof_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    prof = db.query(Professeur).filter(Professeur.id == prof_id).first()
    if not prof: raise HTTPException(404, "Professeur introuvable")
    prof.statut_validation = "refusé"
    db.commit()
    return {"message": "Professeur refusé"}

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user: raise HTTPException(404, "Utilisateur introuvable")
    db.delete(user); db.commit()
    return {"message": "Utilisateur supprimé"}

# ── DEMANDES MATIÈRES ────────────────────────────────────────────
@router.get("/demandes-matieres")
def get_demandes(db: Session = Depends(get_db), _=Depends(require_admin)):
    demandes = (
        db.query(DemandeMatiere)
        .options(
            joinedload(DemandeMatiere.professeur).joinedload(Professeur.user),
            joinedload(DemandeMatiere.niveau),
        )
        .order_by(DemandeMatiere.created_at.desc())
        .all()
    )
    return [
        {
            "id":          d.id,
            "nom_matiere": d.nom_matiere,
            "niveau_id":   d.niveau_id,
            "nom_niveau":  d.niveau.nom if d.niveau else "—",
            "statut":      d.statut,
            "created_at":  d.created_at,
            "prof_id":     d.prof_id,
            "prof_nom":    f"{d.professeur.user.prenom} {d.professeur.user.nom}"
                           if d.professeur and d.professeur.user else "—",
        }
        for d in demandes
    ]

@router.put("/demandes-matieres/{demande_id}/approuver")
def approuver_demande(demande_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    d = db.query(DemandeMatiere).filter(DemandeMatiere.id == demande_id).first()
    if not d: raise HTTPException(404, "Demande introuvable")
    if d.statut != "en_attente": raise HTTPException(400, "Demande déjà traitée")
    m = Matiere(nom=d.nom_matiere, niveau_id=d.niveau_id)
    db.add(m); db.flush()
    d.statut = "approuvé"
    db.commit()
    return {"message": "Matière approuvée", "matiere_id": m.id}

@router.put("/demandes-matieres/{demande_id}/refuser")
def refuser_demande(demande_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    d = db.query(DemandeMatiere).filter(DemandeMatiere.id == demande_id).first()
    if not d: raise HTTPException(404, "Demande introuvable")
    d.statut = "refusé"
    db.commit()
    return {"message": "Demande refusée"}