"""
Script de seed massif — 60 professeurs proches pour tester le matching
Exécuter dans le dossier backend : python seed_60_profs.py
"""

import os
import sys
import random
from datetime import datetime, timedelta, date, time

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.database import SessionLocal
from app.models.user import User
from app.models.professeur import Professeur, ProfMatiereTarif
from app.models.disponibilite import Disponibilite
from app.utils.security import hash_password

db = SessionLocal()

# ── 1. CONFIGURATION POUR TESTS CONTRASTÉS ──────────────────────────

# Villes principales (concentration pour avoir des profs proches)
VILLES = {
    'Tunis': 0.40,      # 40% des profs
    'Sfax': 0.25,       # 25%
    'Sousse': 0.20,     # 20%
    'Monastir': 0.10,   # 10%
    'Nabeul': 0.05,     # 5%
}

# Matières par niveau avec variations de mots-clés pour tester la détection
MATIERES_CONFIG = {
    'primaire': {
        'matieres': ['Mathématiques', 'Français', 'Arabe', 'Lecture', 'Écriture', 'Sciences'],
        'mots_cles': {
            'Mathématiques': ['maths', 'math', 'mathématiques', 'arithmétique', 'calcul'],
            'Français': ['français', 'francais', 'lecture', 'écriture', 'grammaire', 'conjugaison'],
            'Arabe': ['arabe', 'arabe littéraire', 'lecture arabe', 'écriture arabe'],
        },
        'tarif_min': 15,
        'tarif_max': 30,
    },
    'college': {
        'matieres': ['Mathématiques', 'Physique', 'Chimie', 'SVT', 'Anglais', 'Français', 'Histoire', 'Géographie'],
        'mots_cles': {
            'Mathématiques': ['maths', 'math', 'mathématiques', 'algèbre', 'géométrie', 'analyse'],
            'Physique': ['physique', 'sciences physiques', 'mécanique', 'électricité', 'optique'],
            'Chimie': ['chimie', 'sciences chimiques', 'réactions chimiques'],
            'Anglais': ['anglais', 'english', 'anglais conversation', 'grammaire anglaise'],
        },
        'tarif_min': 25,
        'tarif_max': 45,
    },
    'lycee': {
        'matieres': ['Mathématiques', 'Physique', 'Chimie', 'SVT', 'Anglais', 'Français', 'Philosophie', 'Informatique'],
        'mots_cles': {
            'Mathématiques': ['maths', 'math', 'mathématiques', 'analyse', 'algèbre', 'probabilités', 'bac maths'],
            'Physique': ['physique', 'sciences physiques', 'bac physique', 'mécanique quantique'],
            'SVT': ['svt', 'sciences vie', 'biologie', 'géologie', 'bac svt'],
            'Anglais': ['anglais', 'english', 'bac anglais', 'toefl', 'ielts'],
        },
        'tarif_min': 35,
        'tarif_max': 70,
    },
    'universite': {
        'matieres': ['Mathématiques', 'Informatique', 'Physique', 'Chimie', 'Économie', 'Gestion', 'Médecine'],
        'mots_cles': {
            'Mathématiques': ['maths', 'analyse numérique', 'algèbre linéaire', 'probabilités avancées', 'statistiques'],
            'Informatique': ['informatique', 'programmation', 'python', 'java', 'développement web', 'bases de données', 'algorithmique'],
            'Économie': ['économie', 'microéconomie', 'macroéconomie', 'gestion', 'comptabilité', 'finance'],
        },
        'tarif_min': 50,
        'tarif_max': 120,
    },
}

# Noms et prénoms réalistes pour la Tunisie
PRENOMS_M = [
    'Ahmed', 'Mohamed', 'Ali', 'Hassan', 'Karim', 'Youssef', 'Omar', 'Amine', 'Tarek', 'Nabil',
    'Rami', 'Sami', 'Hichem', 'Anis', 'Mehdi', 'Rached', 'Sofiene', 'Mourad', 'Adel', 'Firas',
    'Wael', 'Bassem', 'Khaled', 'Marouane', 'Zied', 'Iheb', 'Oussama', 'Hamza', 'Aymen', 'Slim',
    'Riadh', 'Moncef', 'Bechir', 'Taoufik', 'Najib', 'Jamel', 'Fathi', 'Lotfi', 'Hatem', 'Atef',
    'Moez', 'Rafik', 'Saber', 'Kais', 'Hamed', 'Mahmoud', 'Mounir', 'Zouheir', 'Lassaad', 'Habib',
]

PRENOMS_F = [
    'Fatima', 'Aya', 'Sarah', 'Yasmine', 'Nour', 'Rania', 'Sonia', 'Amira', 'Lina', 'Maram',
    'Hela', 'Asma', 'Dorra', 'Ines', 'Marwa', 'Sana', 'Emna', 'Oumaima', 'Khaoula', 'Rim',
    'Chaima', 'Basma', 'Hana', 'Maya', 'Salma', 'Nada', 'Houda', 'Imen', 'Meriem', 'Ons',
    'Takwa', 'Feryel', 'Amani', 'Eya', 'Yosra', 'Senda', 'Aicha', 'Khawla', 'Chiraz', 'Mouna',
    'Rihab', 'Sahar', 'Nawres', 'Roua', 'Cyrine', 'Ahlem', 'Lamia', 'Faten', 'Jamila', 'Latifa',
]

NOMS = [
    'Ben Ammar', 'Ben Salah', 'Trabelsi', 'Ben Ali', 'Bouaziz', 'Chaabane', 'Guesmi', 'Khadhraoui',
    'Mansouri', 'Jaziri', 'Sassi', 'Mejri', 'Ferchichi', 'Gharbi', 'Hammami', 'Kallel', 'Zouari',
    'Hamdi', 'Khelifi', 'Boudhraa', 'Cherif', 'Dahmani', 'El Amri', 'Fki', 'Gadhgadhi', 'Hlali',
    'Jelassi', 'Kahlaoui', 'Lahmar', 'Miled', 'Nciri', 'Oueslati', 'Riahi', 'Sghaier', 'Tlili',
    'Yahyaoui', 'Zghal', 'Ammar', 'Baccar', 'Chouikha', 'Dhouib', 'Fazaa', 'Ghorbel', 'Haddad',
    'Jebali', 'Karboul', 'Labidi', 'Masmoudi', 'Naffeti', 'Ouerghi', 'Rezgui', 'Saidi', 'Turki',
]

# Bios templates par niveau et spécialité
BIOS_TEMPLATES = {
    'primaire': [
        "Enseignant{genre} passionné{genre} avec {annees} ans d'expérience dans l'enseignement primaire. Spécialisé{genre} en {specialite}. Méthode douce et pédagogique adaptée aux jeunes élèves.",
        "Professeur{genre} des écoles expérimenté{genre}. {annees} ans d'accompagnement scolaire du CP au CM2. {specialite} avec approche ludique et interactive.",
        "Enseignant{genre} dévoué{genre} pour l'éducation primaire. Expert{genre} en {specialite}. Préparation au concours 6ème année avec excellent taux de réussite.",
        "Professeur{genre} primaire dynamique. {specialite} et aide aux devoirs. {annees} ans d'expérience, méthode basée sur la motivation et la confiance.",
    ],
    'college': [
        "Professeur{genre} de {specialite} avec {annees} ans d'expérience au collège. Spécialiste des classes de 7ème, 8ème et 9ème année. Préparation intensive au brevet.",
        "Enseignant{genre} {specialite}, collège. {annees} ans d'expérience, méthode structurée et exercices ciblés. Excellent{genre} avec les adolescents.",
        "Professeur{genre} certifié{genre} en {specialite}. Collège et début lycée. {annees} ans de cours particuliers avec résultats garantis.",
        "Enseignant{genre} passionné{genre} par {specialite}. Niveau collège, {annees} ans d'expérience. Approche pratique et concrète des concepts.",
    ],
    'lycee': [
        "Professeur{genre} agrégé{genre} en {specialite}, {annees} ans d'expérience. Spécialiste du Bac. Préparation intensive aux épreuves, sujets types et méthodologie.",
        "Enseignant{genre} {specialite} lycée et classes préparatoires. {annees} ans d'expérience. Préparation aux concours nationaux et au bac avec excellent taux de réussite.",
        "Expert{genre} en {specialite}, niveau lycée. {annees} ans de cours particuliers. Fiches de révision détaillées et sujets d'entraînement corrigés.",
        "Professeur{genre} {specialite}, spécialiste du Bac Scientifique et Lettres. {annees} ans d'expérience. Méthode rigoureuse et accompagnement personnalisé.",
    ],
    'universite': [
        "Docteur en {specialite}, enseignant{genre} universitaire. Cours de licence et master. {annees} ans d'expérience académique et recherche.",
        "Ingénieur {specialite}, formateur professionnel. Niveau université et classes préparatoires. {annees} ans d'expérience industrielle et pédagogique.",
        "Professeur{genre} {specialite}, université. Spécialiste des projets de fin d'études et préparation aux concours d'ingénieurs. {annees} ans d'expérience.",
        "Chercheur et enseignant{genre} en {specialite}. Licence, master et doctorat. {annees} ans d'expérience universitaire internationale.",
    ],
}

# Jours et créneaux horaires
JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
HEURES_DEBUT = ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00', '17:00', '18:00']
DUREES = [1, 1.5, 2, 2.5, 3]

# ── 2. FONCTIONS UTILITAIRES ───────────────────────────────────────

def choisir_ville():
    """Choisit une ville selon les probabilités"""
    r = random.random()
    cumul = 0
    for ville, proba in VILLES.items():
        cumul += proba
        if r <= cumul:
            return ville
    return 'Tunis'

def generer_bio(niveau, specialite, genre, annees_exp):
    """Génère une bio réaliste"""
    templates = BIOS_TEMPLATES.get(niveau, BIOS_TEMPLATES['college'])
    template = random.choice(templates)
    
    genre_str = 'e' if genre == 'F' else ''
    
    return template.format(
        genre=genre_str,
        annees=annees_exp,
        specialite=specialite
    )

def generer_disponibilites(mode_enseignement, nb_dispos=6):
    """Génère des disponibilités variées"""
    dispos = []
    jours_choisis = random.sample(JOURS, min(nb_dispos, len(JOURS)))
    
    for jour in jours_choisis:
        heure_debut = random.choice(HEURES_DEBUT)
        duree = random.choice(DUREES)
        
        h, m = map(int, heure_debut.split(':'))
        fin_h = int(h + duree)
        fin_m = int((duree % 1) * 60) if duree % 1 != 0 else 0
        heure_fin = f"{fin_h:02d}:{fin_m:02d}"
        
        # Mode selon le profil
        if mode_enseignement == 'en_ligne':
            mode = 'en_ligne'
        elif mode_enseignement == 'presentiel':
            mode = 'presentiel'
        else:
            mode = random.choice(['en_ligne', 'presentiel'])
        
        dispos.append({
            'jour': jour,
            'debut': heure_debut,
            'fin': heure_fin,
            'mode': mode
        })
    
    return dispos

def get_prochain_jour_date(jour_semaine: str):
    """Retourne la prochaine date pour un jour de la semaine"""
    jours_idx = {'Lundi': 0, 'Mardi': 1, 'Mercredi': 2, 'Jeudi': 3, 'Vendredi': 4, 'Samedi': 5, 'Dimanche': 6}
    aujourd_hui = datetime.now().date()
    idx_jour = jours_idx[jour_semaine]
    idx_aujourd_hui = aujourd_hui.weekday()
    
    diff = (idx_jour - idx_aujourd_hui) % 7
    if diff == 0:
        diff = 7
    
    return aujourd_hui + timedelta(days=diff)

def generer_telephone():
    """Génère un numéro de téléphone tunisien réaliste"""
    prefixes = ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99']
    return f"+216 {random.choice(prefixes)} {random.randint(100000, 999999)}"

# ── 3. RÉCUPÉRATION DES MATIÈRES ────────────────────────────────────

print("\n📚 Chargement du référentiel...")

matieres = db.execute(text("""
    SELECT m.id, m.nom, n.nom as niveau, n.id as niveau_id, d.nom as domaine
    FROM matieres m
    JOIN niveaux n ON m.niveau_id = n.id
    JOIN domaines d ON n.domaine_id = d.id
    ORDER BY d.nom, n.nom, m.nom
""")).fetchall()

if not matieres:
    print("  ❌ Aucune matière trouvée — ajoutez d'abord des matières dans le référentiel Admin")
    db.close()
    exit(1)

# Index pour recherche rapide
mat_index = {}
for m in matieres:
    key = m.nom.lower().strip()
    if key not in mat_index:
        mat_index[key] = []
    mat_index[key].append({
        'matiere_id': m.id,
        'niveau_id': m.niveau_id,
        'niveau': m.niveau,
        'domaine': m.domaine,
        'nom': m.nom
    })

print(f"  ✅ {len(matieres)} matières chargées depuis la base")

# ── 4. GÉNÉRATION DES 60 PROFESSEURS ────────────────────────────────

print(f"\n{'='*60}")
print("🚀 GÉNÉRATION DE 60 PROFESSEURS PROCHES (TESTS MATCHING)")
print(f"{'='*60}")

PROFS_GENERES = []
compteur = 0

# Distribution stratégique pour avoir des profs très proches
distribution = [
    # (niveau, nombre, ville_principale, matiere_principale, concentration)
    ('primaire', 12, 'Tunis', 'Mathématiques', 0.7),      # 12 profs maths primaire à Tunis
    ('primaire', 8, 'Sfax', 'Français', 0.6),               # 8 profs français primaire à Sfax
    ('college', 15, 'Tunis', 'Mathématiques', 0.6),        # 15 profs maths collège à Tunis
    ('college', 10, 'Sousse', 'Physique', 0.5),            # 10 profs physique collège à Sousse
    ('lycee', 10, 'Tunis', 'Mathématiques', 0.5),          # 10 profs maths bac à Tunis
    ('lycee', 5, 'Sfax', 'SVT', 0.6),                       # 5 profs SVT bac à Sfax
    ('universite', 5, 'Tunis', 'Informatique', 0.8),       # 5 profs info université à Tunis
    ('universite', 5, 'Tunis', 'Mathématiques', 0.6),       # 5 profs maths université à Tunis
]

for niveau, nb_profs, ville_cible, matiere_cible, concentration in distribution:
    config = MATIERES_CONFIG[niveau]
    
    for i in range(nb_profs):
        compteur += 1
        
        # Genre aléatoire
        genre = random.choice(['M', 'F'])
        prenom = random.choice(PRENOMS_M if genre == 'M' else PRENOMS_F)
        nom = random.choice(NOMS)
        
        # Ville : concentration sur la ville cible
        if random.random() < concentration:
            ville = ville_cible
        else:
            ville = choisir_ville()
        
        # Email unique
        email = f"{prenom.lower()}.{nom.lower().replace(' ', '')}{compteur}@edumatch.tn"
        
        # Matière principale : concentration sur la matière cible
        if random.random() < 0.7:
            matiere_principale = matiere_cible
        else:
            matiere_principale = random.choice(config['matieres'])
        
        # Matières secondaires (1-3 matières supplémentaires)
        nb_matieres = random.randint(1, 3)
        matieres_secondaires = random.sample(
            [m for m in config['matieres'] if m != matiere_principale],
            min(nb_matieres, len(config['matieres']) - 1)
        )
        matieres_list = [matiere_principale] + matieres_secondaires
        
        # Mots-clés pour la détection
        mots_cles = []
        for m in matieres_list:
            if m in config['mots_cles']:
                mots_cles.extend(config['mots_cles'][m][:2])  # Prendre 2 variantes
        mots_cles = list(set(mots_cles))  # Dédupliquer
        
        # Mode d'enseignement
        mode = random.choice(['en_ligne', 'presentiel', 'les_deux'])
        
        # Tarifs selon niveau et mode
        tarif_base = random.randint(config['tarif_min'], config['tarif_max'])
        if mode == 'en_ligne':
            tarif_en_ligne = tarif_base
            tarif_presentiel = None
        elif mode == 'presentiel':
            tarif_en_ligne = None
            tarif_presentiel = tarif_base + random.randint(5, 15)
        else:
            tarif_en_ligne = tarif_base
            tarif_presentiel = tarif_base + random.randint(5, 15)
        
        # Bio et expérience
        annees_exp = random.randint(3, 20)
        bio = generer_bio(niveau, matiere_principale, genre, annees_exp)
        
        # Disponibilités
        dispos = generer_disponibilites(mode, random.randint(4, 8))
        
        # Note et avis (variés pour tester le scoring)
        note = round(random.uniform(3.5, 5.0), 1)
        nb_avis = random.randint(0, 50)
        
        prof_data = {
            'prenom': prenom,
            'nom': nom,
            'email': email,
            'password': 'test1234',
            'ville': ville,
            'bio': bio,
            'telephone': generer_telephone(),
            'mode_enseignement': mode,
            'tarif_en_ligne': tarif_en_ligne,
            'tarif_presentiel': tarif_presentiel,
            'matieres_cibles': mots_cles,
            'matieres_principales': matieres_list,
            'niveau_categorie': niveau,
            'disponibilites': dispos,
            'note': note,
            'nb_avis': nb_avis,
        }
        
        PROFS_GENERES.append(prof_data)

# Mélanger pour plus de réalisme
random.shuffle(PROFS_GENERES)

print(f"  ✅ {len(PROFS_GENERES)} profils générés")
print(f"\n📊 Répartition :")
print(f"   • Primaire: {len([p for p in PROFS_GENERES if p['niveau_categorie'] == 'primaire'])} profs")
print(f"   • Collège: {len([p for p in PROFS_GENERES if p['niveau_categorie'] == 'college'])} profs")
print(f"   • Lycée: {len([p for p in PROFS_GENERES if p['niveau_categorie'] == 'lycee'])} profs")
print(f"   • Université: {len([p for p in PROFS_GENERES if p['niveau_categorie'] == 'universite'])} profs")

# ── 5. FONCTION DE CRÉATION ────────────────────────────────────────

def creer_professeur_complet(db, data: dict):
    """Crée un professeur avec toutes ses données"""
    
    # Vérifier si existe déjà
    existing = db.query(User).filter(User.email == data['email']).first()
    if existing:
        return None, "existe"
    
    try:
        # 1. Créer l'utilisateur (champs minimaux)
        user = User(
            prenom=data['prenom'],
            nom=data['nom'],
            email=data['email'],
            password=hash_password(data['password']),
            role='professeur',
            statut='actif',
            created_at=datetime.now(),
        )
        db.add(user)
        db.flush()
        
        # 2. Créer le profil professeur (champs minimaux)
        prof = Professeur(
            user_id=user.id,
            bio=data['bio'],
            ville=data['ville'],
            telephone=data['telephone'],
            mode_enseignement=data['mode_enseignement'],
            tarif_en_ligne=data['tarif_en_ligne'],
            tarif_presentiel=data['tarif_presentiel'],
            statut_validation='validé',
            note_moyenne=data['note'],
            nb_avis=data['nb_avis'],
            created_at=datetime.now(),
        )
        db.add(prof)
        db.flush()
        
        # 3. Associer les matières
        matieres_ajoutees = 0
        for cible in data['matieres_cibles']:
            cible_lower = cible.lower().strip()
            matches = [(k, v) for k, v in mat_index.items() if cible_lower in k or k in cible_lower]
            
            for _, mat_list in matches:
                for mat in mat_list:
                    exists = db.query(ProfMatiereTarif).filter_by(
                        prof_id=prof.id,
                        matiere_id=mat['matiere_id'],
                        niveau_id=mat['niveau_id']
                    ).first()
                    
                    if not exists:
                        tarif = data['tarif_en_ligne'] or data['tarif_presentiel'] or 30.0
                        db.add(ProfMatiereTarif(
                            prof_id=prof.id,
                            matiere_id=mat['matiere_id'],
                            niveau_id=mat['niveau_id'],
                            tarif=tarif,
                        ))
                        matieres_ajoutees += 1
        
        # 4. Créer les disponibilités (4 semaines) - CHAMPS CORRIGÉS
        dispos_crees = 0
        for dispo_template in data.get('disponibilites', []):
            for semaine in range(4):
                date_base = get_prochain_jour_date(dispo_template['jour'])
                date_dispo = date_base + timedelta(weeks=semaine)
                
                # ⭐ CHAMPS CORRIGÉS selon le schéma Disponibilite
                dispo = Disponibilite(
                    professeur=prof,  # Relation SQLAlchemy
                    # ⭐ Utilise date_specifique au lieu de date
                    date_specifique=date_dispo,
                    # ⭐ Utilise heure_debut/heure_fin (format time)
                    heure_debut=datetime.strptime(dispo_template['debut'], '%H:%M').time(),
                    heure_fin=datetime.strptime(dispo_template['fin'], '%H:%M').time(),
                    # ⭐ Champs supplémentaires avec valeurs par défaut
                    nb_max_etudiants=1,
                    nb_inscrits=0,
                    actif=True,
                    mode_seance=dispo_template['mode'],
                    description=None,
                )
                db.add(dispo)
                dispos_crees += 1
        
        db.commit()
        return prof, "créé"
        
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        return None, f"erreur: {e}"

# ── 6. EXÉCUTION ────────────────────────────────────────────────────

print(f"\n{'='*60}")
print("🚀 CRÉATION EN BASE DE DONNÉES")
print(f"{'='*60}")

created = 0
skipped = 0
errors = 0

for i, prof_data in enumerate(PROFS_GENERES, 1):
    result, status = creer_professeur_complet(db, prof_data)
    
    if status == "créé":
        created += 1
        ville = prof_data['ville']
        niveau = prof_data['niveau_categorie']
        matiere = prof_data['matieres_principales'][0]
        tarif = prof_data['tarif_en_ligne'] or prof_data['tarif_presentiel']
        print(f"  {i:2d}/60 ✅ {prof_data['prenom']} {prof_data['nom'][:12]:<12} | {ville:<8} | {niveau:<10} | {matiere[:15]:<15} | {tarif:.0f} DT | ⭐{prof_data['note']}")
    elif status == "existe":
        skipped += 1
        print(f"  {i:2d}/60 ⏭  {prof_data['prenom']} {prof_data['nom'][:12]:<12} | déjà existant")
    else:
        errors += 1
        print(f"  {i:2d}/60 ❌ {prof_data['prenom']} {prof_data['nom'][:12]:<12} | {status}")

print(f"\n{'='*60}")
print(f"✅ TERMINÉ : {created} créés | {skipped} ignorés | {errors} erreurs")
print(f"{'='*60}")

if created > 0:
    print(f"\n📊 STATISTIQUES FINALES :")
    
    # Par ville
    villes_count = {}
    niveaux_count = {}
    matieres_count = {}
    
    for p in PROFS_GENERES[:created]:
        villes_count[p['ville']] = villes_count.get(p['ville'], 0) + 1
        niveaux_count[p['niveau_categorie']] = niveaux_count.get(p['niveau_categorie'], 0) + 1
        mat = p['matieres_principales'][0]
        matieres_count[mat] = matieres_count.get(mat, 0) + 1
    
    print(f"\n   📍 Par ville :")
    for ville, count in sorted(villes_count.items(), key=lambda x: -x[1]):
        print(f"      • {ville}: {count} profs")
    
    print(f"\n   🎓 Par niveau :")
    for niv, count in sorted(niveaux_count.items(), key=lambda x: -x[1]):
        print(f"      • {niv}: {count} profs")
    
    print(f"\n   📚 Par matière principale :")
    for mat, count in sorted(matieres_count.items(), key=lambda x: -x[1])[:10]:
        print(f"      • {mat}: {count} profs")
    
    print(f"\n🔑 Mot de passe pour tous les comptes : test1234")
    print(f"\n💡 TESTEZ LE CHATBOT AVEC :")
    print(f"   • 'maths 6ème année primaire tunis 25'")
    print(f"   • 'physique 9ème année collège tunis 35'")
    print(f"   • 'maths bac tunis 50'")
    print(f"   • 'informatique université tunis 60'")

db.close()
print("\n✨ Terminé !")