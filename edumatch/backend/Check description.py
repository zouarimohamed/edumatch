"""
Script de diagnostic — vérifier les descriptions en base
Exécuter dans le dossier backend :
    python check_description.py
"""
from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    rows = conn.execute(text(
        "SELECT id, date_specifique, heure_debut, heure_fin, description FROM disponibilites ORDER BY id"
    )).fetchall()

    print(f"\n{'ID':<5} {'Date':<14} {'Debut':<8} {'Fin':<8} {'Description'}")
    print("-" * 60)
    for r in rows:
        desc = r.description or "(vide)"
        print(f"{r.id:<5} {str(r.date_specifique):<14} {str(r.heure_debut)[:5]:<8} {str(r.heure_fin)[:5]:<8} {desc[:40]}")

    print(f"\nTotal : {len(rows)} disponibilité(s)")