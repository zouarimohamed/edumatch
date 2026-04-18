from app.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()

rows = db.execute(text("""
    SELECT DISTINCT n.id, n.nom, d.nom as domaine, COUNT(pmt.prof_id) as nb_profs
    FROM niveaux n
    JOIN domaines d ON d.id = n.domaine_id
    LEFT JOIN prof_matiere_tarif pmt ON pmt.niveau_id = n.id
    GROUP BY n.id, n.nom, d.nom
    ORDER BY d.nom, n.nom
""")).fetchall()

print("\nNiveaux en base :")
print(f"{'ID':<5} {'Domaine':<20} {'Niveau (nom exact)':<30} {'Nb profs'}")
print("-" * 65)
for r in rows:
    print(f"{r.id:<5} {r.domaine:<20} {r.nom:<30} {r.nb_profs}")

# Voir aussi ce que retourne l'API professeurs
rows2 = db.execute(text("""
    SELECT DISTINCT n.nom as nom_niveau
    FROM prof_matiere_tarif pmt
    JOIN niveaux n ON n.id = pmt.niveau_id
    ORDER BY n.nom
""")).fetchall()

print("\nValeurs nom_niveau retournées par l'API :")
for r in rows2:
    print(f"  '{r.nom_niveau}'")

db.close()