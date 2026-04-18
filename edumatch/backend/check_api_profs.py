"""
Simule exactement le filtre frontend filterNiveau dans Profs.jsx
"""
import requests

try:
    r = requests.get('http://localhost:8001/api/professeurs/')
    data = r.json()
except Exception as e:
    print(f"Erreur connexion API: {e}")
    exit(1)

print(f"Total profs reçus: {len(data)}")

# Simuler: filterNiveau = 'Primaire (1-6ème)'
filtre = 'Primaire (1-6ème)'
filtered = [p for p in data if any(t.get('nom_niveau') == filtre for t in (p.get('tarifs_matieres') or []))]

print(f"Profs avec niveau '{filtre}': {len(filtered)}")
for p in filtered[:5]:
    nom = f"{p.get('user_prenom','')} {p.get('user_nom','')}".strip()
    mats = [(t['nom_matiere'], t['nom_niveau']) for t in p.get('tarifs_matieres', [])]
    print(f"  ✓ {nom} → {mats}")

# Vérifier les valeurs exactes de nom_niveau dans l'API
print("\nToutes les valeurs nom_niveau présentes dans l'API:")
niveaux = set()
for p in data:
    for t in (p.get('tarifs_matieres') or []):
        niveaux.add(repr(t.get('nom_niveau')))
for n in sorted(niveaux):
    print(f"  {n}")