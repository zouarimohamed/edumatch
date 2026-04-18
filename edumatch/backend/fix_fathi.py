"""
Correction finale des niveaux selon les bios.
Exécuter : python fix_niveaux_final.py
"""
from app.database import SessionLocal
from app.models.professeur import ProfMatiereTarif
from app.models.user import User
from app.models.professeur import Professeur
from sqlalchemy import text

db = SessionLocal()

# Règles précises basées sur les bios réelles
# format: { nom_complet: [niveau_ids_a_garder] }
CORRECTIONS = {
    # Primaire (CP au CM2) → garder seulement 27
    'Mahmoud Baccar':  [27],
    'Fathi Ben Ali':   [27],
    'Mohamed Hamdi':   [27],

    # Lycée (1ère, 2ème, 3ème, Bac) → garder 31,32,33,34
    'Sonia Mansouri':  [31, 32, 33, 34],
    'Iheb Gharbi':     [31, 32, 33, 34],
    'Chaima Rezgui':   [31, 32, 33, 34],
    'Aicha Tlili':     [31, 32, 33, 34],
    'Hichem Gharbi':   [31, 32, 33, 34],
    'Amira Jebali':    [31, 32, 33, 34],
    'Maram Haddad':    [31, 32, 33, 34],

    # Collège (7ème, 8ème, 9ème) → garder 28,29,30 — déjà corrects
    # Maram Karboul, Iheb Bouaziz, etc. → pas besoin de modifier
}

fixed = 0
for nom_complet, garder in CORRECTIONS.items():
    prenom, *nom_parts = nom_complet.split()
    nom = ' '.join(nom_parts)

    user = db.query(User).filter(
        User.prenom == prenom,
        User.nom == nom
    ).first()

    if not user:
        print(f"  ❌ {nom_complet} — non trouvé")
        continue

    prof = db.query(Professeur).filter(Professeur.user_id == user.id).first()
    if not prof:
        print(f"  ❌ {nom_complet} — pas de profil prof")
        continue

    to_delete = [t for t in prof.tarifs_matieres if t.niveau_id not in garder]
    for t in to_delete:
        db.delete(t)

    niveau_names = {27:'Primaire', 28:'7ème', 29:'8ème', 30:'9ème',
                    31:'1ère Lycée', 32:'2ème Lycée', 33:'3ème Lycée', 34:'Bac'}
    garder_labels = [niveau_names.get(i, str(i)) for i in garder]

    print(f"  ✅ {nom_complet} → {garder_labels} (supprimé {len(to_delete)} entrées)")
    fixed += 1

db.commit()
print(f"\n✅ {fixed} profs corrigés")
db.close()