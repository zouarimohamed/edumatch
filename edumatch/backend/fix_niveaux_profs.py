"""
Corrige les profs qui ont été assignés à TOUS les niveaux.
Garde seulement les niveaux cohérents avec leur bio.

Exécuter UNE SEULE FOIS :
    python fix_niveaux_profs.py
"""
from app.database import SessionLocal
from app.models.professeur import Professeur, ProfMatiereTarif
from app.models.user import User
from sqlalchemy import text

db = SessionLocal()

# Mapping : prof email → niveaux à garder (IDs)
# ID 27 = Primaire, 28=7ème, 29=8ème, 30=9ème, 31=1ère Lycée, 32=2ème Lycée, 33=3ème Lycée, 34=Bac
NIVEAUX_IDS = {
    'primaire':    [27],
    'college':     [28, 29, 30],
    'lycee':       [31, 32, 33, 34],
    'bac':         [34],
    'universite':  [34],
}

# Règles par prof selon leur bio
PROF_NIVEAUX = {
    # Profs primaire uniquement
    'primaire': ['zouari', 'tlili', 'chouikha', 'jebali', 'rezgui'],
    # Profs collège
    'college':  ['7ème', '8ème', '9ème'],
    # Profs lycée
    'lycee':    ['bac', 'lycée', 'lycee', 'terminale'],
    # Profs tous niveaux (garder tel quel)
    'tous':     [],
}

# Récupérer tous les profs avec trop de niveaux (> 3 niveaux distincts)
rows = db.execute(text("""
    SELECT 
        p.id, u.prenom, u.nom, u.email, p.bio,
        COUNT(DISTINCT pmt.niveau_id) as nb_niveaux
    FROM professeurs p
    JOIN users u ON u.id = p.user_id
    JOIN prof_matiere_tarif pmt ON pmt.prof_id = p.id
    GROUP BY p.id, u.prenom, u.nom, u.email, p.bio
    HAVING COUNT(DISTINCT pmt.niveau_id) > 3
    ORDER BY nb_niveaux DESC
""")).fetchall()

print(f"\n{len(rows)} profs avec > 3 niveaux :")
for r in rows:
    print(f"  {r.prenom} {r.nom} ({r.nb_niveaux} niveaux) — Bio: {(r.bio or '')[:60]}")

print("\n--- Correction ---")
fixed = 0

for r in rows:
    bio_lower = (r.bio or '').lower()
    
    # Détecter le niveau principal selon la bio
    if any(k in bio_lower for k in ['primaire', '6ème', '6eme', 'jeunes élèves', 'jeunes eleves', 'enfant']):
        garder = [27]  # Primaire seulement
        label = 'Primaire'
    elif any(k in bio_lower for k in ['collège', 'college', '7ème', '8ème', '9ème', 'brevet']):
        garder = [28, 29, 30]  # Collège
        label = 'Collège'
    elif any(k in bio_lower for k in ['lycée', 'lycee', 'bac', 'baccalauréat', 'terminale', 'secondaire']):
        garder = [31, 32, 33, 34]  # Lycée
        label = 'Lycée'
    elif any(k in bio_lower for k in ['université', 'universite', 'licence', 'master', 'ingénieur']):
        garder = [34]  # Bac/Univ
        label = 'Université'
    else:
        # Bio ambiguë → garder tous les niveaux, ne pas modifier
        print(f"  ⏭  {r.prenom} {r.nom} — bio ambiguë, non modifié")
        continue
    
    # Supprimer les niveaux non désirés
    prof = db.query(Professeur).filter(Professeur.id == r.id).first()
    
    # Garder seulement les tarifs_matieres avec les bons niveaux
    to_delete = [t for t in prof.tarifs_matieres if t.niveau_id not in garder]
    
    for t in to_delete:
        db.delete(t)
    
    print(f"  ✅ {r.prenom} {r.nom} → gardé niveau '{label}' (supprimé {len(to_delete)} entrées)")
    fixed += 1

db.commit()
print(f"\n✅ {fixed} profs corrigés")
print("Redémarre le backend pour voir les changements.")
db.close()