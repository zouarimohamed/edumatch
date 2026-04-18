from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.utils.dependencies import require_admin

router = APIRouter()

@router.get("/stats")
def get_finances_stats(
    db: Session = Depends(get_db),
    _=Depends(require_admin)
):
    # Chiffre d'affaires total
    try:
        ca = db.execute(text("""
            SELECT COALESCE(SUM(
                EXTRACT(EPOCH FROM (heure_fin::time - heure_debut::time))/3600.0
                * CAST(tarif_applique AS FLOAT)
            ), 0) AS total
            FROM reservations
            WHERE statut_paiement = 'payé'
        """)).fetchone()
        chiffre_affaires = round(float(ca.total or 0), 2)
    except Exception as e:
        print(f"[finances] ca error: {e}")
        chiffre_affaires = 0.0

    # Total séances confirmées
    try:
        total_confirmees = db.execute(text("""
            SELECT COUNT(*) FROM reservations 
            WHERE statut IN ('confirmé', 'terminé')
        """)).scalar() or 0
    except Exception as e:
        print(f"[finances] confirmees error: {e}")
        total_confirmees = 0

    # Total payées
    try:
        total_payees = db.execute(text("""
            SELECT COUNT(*) FROM reservations 
            WHERE statut_paiement = 'payé'
        """)).scalar() or 0
    except Exception as e:
        print(f"[finances] payees error: {e}")
        total_payees = 0

    # En attente
    try:
        en_attente = db.execute(text("""
            SELECT COUNT(*) FROM reservations
            WHERE statut IN ('confirmé', 'terminé')
            AND (statut_paiement IS NULL OR statut_paiement != 'payé')
        """)).scalar() or 0
    except Exception as e:
        print(f"[finances] attente error: {e}")
        en_attente = 0

    # Alertes retard > 7 jours
    alertes = []
    try:
        rows = db.execute(text("""
            SELECT 
                u.prenom || ' ' || u.nom AS etudiant,
                pu.prenom || ' ' || pu.nom AS prof,
                r.date_cours,
                CAST(COALESCE(r.tarif_applique, 0) AS FLOAT) AS tarif,
                (CURRENT_DATE - r.date_cours) AS jours_retard
            FROM reservations r
            JOIN etudiants e ON e.id = r.etudiant_id
            JOIN users u ON u.id = e.user_id
            JOIN professeurs p ON p.id = r.prof_id
            JOIN users pu ON pu.id = p.user_id
            WHERE r.statut IN ('confirmé', 'terminé')
            AND (r.statut_paiement IS NULL OR r.statut_paiement != 'payé')
            AND r.date_cours < CURRENT_DATE - INTERVAL '7 days'
            ORDER BY r.date_cours ASC
            LIMIT 10
        """)).fetchall()
        for a in rows:
            jr = a.jours_retard
            alertes.append({
                "etudiant": a.etudiant,
                "prof": a.prof,
                "date_cours": str(a.date_cours),
                "tarif": round(float(a.tarif or 0), 2),
                "jours_retard": int(jr.days) if hasattr(jr, 'days') else int(jr or 0)
            })
    except Exception as e:
        print(f"[finances] alertes error: {e}")

    # Top formateurs par revenus
    top_profs = []
    try:
        rows = db.execute(text("""
            SELECT 
                pu.prenom || ' ' || pu.nom AS prof,
                COUNT(r.id) AS nb_seances,
                COALESCE(SUM(
                    EXTRACT(EPOCH FROM (r.heure_fin::time - r.heure_debut::time))/3600.0
                    * CAST(COALESCE(r.tarif_applique,0) AS FLOAT)
                ), 0) AS total_revenus
            FROM reservations r
            JOIN professeurs p ON p.id = r.prof_id
            JOIN users pu ON pu.id = p.user_id
            WHERE r.statut_paiement = 'payé'
            GROUP BY p.id, pu.prenom, pu.nom
            ORDER BY total_revenus DESC
            LIMIT 5
        """)).fetchall()
        for t in rows:
            top_profs.append({
                "prof": t.prof,
                "nb_seances": int(t.nb_seances or 0),
                "total_revenus": round(float(t.total_revenus or 0), 2)
            })
    except Exception as e:
        print(f"[finances] top_profs error: {e}")

    # Revenus par mois
    revenus_mois = []
    try:
        rows = db.execute(text("""
            SELECT 
                TO_CHAR(date_cours, 'YYYY-MM') AS mois,
                TO_CHAR(date_cours, 'Mon YYYY') AS mois_label,
                COALESCE(SUM(
                    EXTRACT(EPOCH FROM (heure_fin::time - heure_debut::time))/3600.0
                    * CAST(COALESCE(tarif_applique,0) AS FLOAT)
                ), 0) AS total
            FROM reservations
            WHERE statut_paiement = 'payé'
            AND date_cours >= CURRENT_DATE - INTERVAL '6 months'
            GROUP BY TO_CHAR(date_cours, 'YYYY-MM'), TO_CHAR(date_cours, 'Mon YYYY')
            ORDER BY mois ASC
        """)).fetchall()
        for r in rows:
            revenus_mois.append({
                "mois": r.mois,
                "mois_label": r.mois_label,
                "total": round(float(r.total or 0), 2)
            })
    except Exception as e:
        print(f"[finances] revenus_mois error: {e}")

    # Demandes matières stats
    demandes_stats = []
    try:
        rows = db.execute(text("""
            SELECT 
                statut,
                COUNT(*) AS nb,
                ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER (), 0), 1) AS pct
            FROM demandes_matieres
            GROUP BY statut
            ORDER BY statut
        """)).fetchall()
        for d in rows:
            demandes_stats.append({
                "statut": d.statut,
                "nb": int(d.nb or 0),
                "pct": float(d.pct or 0)
            })
    except Exception as e:
        print(f"[finances] demandes error: {e}")

    taux_paiement = round((total_payees / total_confirmees * 100), 1) if total_confirmees > 0 else 0.0

    return {
        "chiffre_affaires":  chiffre_affaires,
        "taux_paiement":     taux_paiement,
        "total_confirmees":  total_confirmees,
        "total_payees":      total_payees,
        "en_attente_count":  en_attente,
        "alertes":           alertes,
        "top_profs":         top_profs,
        "revenus_mois":      revenus_mois,
        "demandes_stats":    demandes_stats,
    }