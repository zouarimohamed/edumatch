# script_seed_profs.py
# Script pour ajouter des profils de professeurs de test

import os
import sys
from datetime import datetime, timedelta
import random

# Configuration du path pour importer vos modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import User, Professeur, ProfMatiereTarif, Matiere, Niveau, Disponibilite
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Données de test réalistes pour la Tunisie
MATIERES = ["Mathématiques", "Physique", "Anglais", "Français", "Arabe", "SVT", "Informatique", "Espagnol"]
VILLES = ["Tunis", "Sousse", "Sfax", "Monastir", "Nabeul", "Bizerte", "Gabès", "Kairouan"]
NIVEAUX = ["Primaire", "Collège", "Lycée", "Université"]

# Bios générées par catégorie
BIOS = {
    "primaire": [
        "Professeur certifié avec 8 ans d'expérience dans l'enseignement primaire. Spécialisé en mathématiques et français. Méthode douce et pédagogique adaptée aux jeunes élèves.",
        "Enseignante passionnée par l'éducation primaire. 5 ans d'expérience, approche ludique et interactive. Accompagnement personnalisé pour le CP au CM2.",
        "Expert en soutien scolaire primaire. Aide aux devoirs, remise à niveau, préparation aux examens. Patient et pédagogue.",
        "Professeur des écoles expérimenté. Cours de maths, français et arabe pour primaire. Méthode basée sur la confiance et la motivation.",
    ],
    "college": [
        "Professeur de mathématiques avec 10 ans d'expérience au collège. Spécialiste des classes de 7ème, 8ème et 9ème année. Préparation au brevet.",
        "Enseignante d'anglais, 6 ans d'expérience collège. Méthode communicative, cours dynamiques. Préparation aux examens trimestriels.",
        "Physicien passionné, enseigne la physique-chimie au collège depuis 8 ans. Expérimentations pratiques et approche concrète.",
        "Professeur de français, collège et début lycée. Littérature, grammaire, expression écrite. 7 ans d'expérience.",
    ],
    "lycee": [
        "Professeur agrégé de mathématiques, 15 ans d'expérience. Spécialiste du Bac Mathématiques. Préparation intensive aux épreuves du bac.",
        "Enseignant d'anglais, lycée et classes préparatoires. Préparation au TOEFL, IELTS. 12 ans d'expérience, dont 5 au lycée pilote.",
        "Professeur de physique, spécialiste du Bac Sciences. Méthode rigoureuse, fiches de révision, sujets d'entraînement.",
        "Enseignante de sciences SVT, lycée. Préparation au bac, projets scientifiques. Laboratoire virtuel et supports interactifs.",
        "Professeur d'informatique, lycée et université. Programmation Python, algorithmique, préparation aux études d'ingénieur.",
    ],
    "universite": [
        "Docteur en mathématiques, enseignant universitaire. Cours de licence et master. Analyse, algèbre, probabilités.",
        "Ingénieur informatique, donne cours de programmation université. Java, Python, bases de données, développement web.",
        "Professeur d'économie et gestion, université. Comptabilité, finance, marketing. 10 ans d'expérience académique.",
        "Médecin, donne cours de biologie, anatomie, physiologie niveau université. Préparation aux études médicales.",
    ]
}

PRENOMS_M = ["Ahmed", "Mohamed", "Ali", "Hassan", "Karim", "Youssef", "Omar", "Amine", "Tarek", "Nabil", "Rami", "Sami", "Hichem", "Anis", "Mehdi"]
PRENOMS_F = ["Fatima", "Aya", "Sarah", "Yasmine", "Nour", "Rania", "Sonia", "Amira", "Lina", "Maram", "Hela", "Asma", "Dorra", "Ines", "Marwa"]
NOMS = ["Ben Amor", "Trabelsi", "Ben Ali", "Guesmi", "Khadhraoui", "Bouaziz", "Jaziri", "Sassi", "Mejri", "Chaabane", "Ferchichi", "Gharbi", "Hammami", "Kallel", "Mansouri"]

def creer_utilisateur(db: Session, email: str, prenom: str, nom: str, telephone: str, role: str = "professeur"):
    """Crée un utilisateur s'il n'existe pas déjà"""
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        print(f"  ⚠️  Utilisateur {email} existe déjà")
        return existing
    
    user = User(
        email=email,
        hashed_password=pwd_context.hash("password123"),
        prenom=prenom,
        nom=nom,
        telephone=telephone,
        role=role,
        is_active=True,
        created_at=datetime.now()
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"  ✅ Utilisateur créé: {email}")
    return user

def creer_professeur(db: Session, user: User, categorie: str, ville: str, matieres: list, tarif_base: int):
    """Crée un profil professeur"""
    
    # Sélectionner une bio adaptée à la catégorie
    bio = random.choice(BIOS.get(categorie, BIOS["college"]))
    
    # Déterminer le mode d'enseignement
    mode = random.choice(["en_ligne", "presentiel", "les_deux"])
    
    # Tarifs selon le mode
    tarif_en_ligne = tarif_base if mode in ["en_ligne", "les_deux"] else None
    tarif_presentiel = tarif_base + 5 if mode in ["presentiel", "les_deux"] else None
    
    # Note aléatoire réaliste (entre 3.5 et 5.0)
    note = round(random.uniform(3.5, 5.0), 1)
    nb_avis = random.randint(0, 25)
    
    prof = Professeur(
        user_id=user.id,
        bio=bio,
        ville=ville,
        mode_enseignement=mode,
        tarif_en_ligne=tarif_en_ligne,
        tarif_presentiel=tarif_presentiel,
        note_moyenne=note,
        nb_avis=nb_avis,
        statut_validation="validé",  # Important pour être visible
        photo_url=None,  # Vous pouvez ajouter des URLs de photos par défaut
        diplome_verifie=True,
        identite_verifiee=True,
        created_at=datetime.now()
    )
    
    db.add(prof)
    db.commit()
    db.refresh(prof)
    print(f"  ✅ Profil prof créé: {user.prenom} {user.nom} ({categorie}) - {ville}")
    
    return prof

def associer_matieres(db: Session, prof: Professeur, matieres_noms: list):
    """Associe des matières au professeur avec tarifs"""
    for mat_nom in matieres_noms:
        # Chercher ou créer la matière
        matiere = db.query(Matiere).filter(Matiere.nom == mat_nom).first()
        if not matiere:
            matiere = Matiere(nom=mat_nom, description=f"Cours de {mat_nom}")
            db.add(matiere)
            db.commit()
            db.refresh(matiere)
            print(f"    📚 Matière créée: {mat_nom}")
        
        # Créer l'association avec tarif
        tarif = prof.tarif_en_ligne or prof.tarif_presentiel or 30
        prof_mat = ProfMatiereTarif(
            professeur_id=prof.id,
            matiere_id=matiere.id,
            tarif_horaire=tarif
        )
        db.add(prof_mat)
    
    db.commit()
    print(f"    📚 Matières associées: {', '.join(matieres_noms)}")

def creer_disponibilites(db: Session, prof: Professeur, nb_creneaux: int = 5):
    """Crée des disponibilités aléatoires pour le prof"""
    jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
    modes = ["en_ligne", "presentiel"]
    
    for _ in range(nb_creneaux):
        jour = random.choice(jours)
        heure_debut = random.randint(8, 18)
        duree = random.choice([1, 1.5, 2])
        heure_fin = heure_debut + int(duree) + (0.5 if duree % 1 != 0 else 0)
        
        # Date dans les 30 prochains jours
        date = datetime.now() + timedelta(days=random.randint(1, 30))
        
        dispo = Disponibilite(
            professeur_id=prof.id,
            date=date.date(),
            heure_debut=f"{heure_debut:02d}:00",
            heure_fin=f"{int(heure_fin):02d}:30" if heure_fin % 1 != 0 else f"{int(heure_fin):02d}:00",
            mode=random.choice(modes),
            est_reserve=False
        )
        db.add(dispo)
    
    db.commit()
    print(f"    📅 {nb_creneaux} disponibilités créées")

def generer_email(prenom: str, nom: str, index: int):
    """Génère un email unique"""
    nom_clean = nom.lower().replace(" ", "")
    prenom_clean = prenom.lower()
    return f"{prenom_clean}.{nom_clean}{index}@edumatch.tn"

def seed_database():
    """Fonction principale pour peupler la base de données"""
    
    print("🚀 Démarrage du seeding de la base de données...\n")
    
    db = SessionLocal()
    
    try:
        # Configuration des profils à créer
        config_profs = [
            # (categorie, nombre, ville_preferee, matieres, tarif_base)
            ("primaire", 5, "Tunis", ["Mathématiques", "Français"], 25),
            ("primaire", 3, "Sousse", ["Mathématiques", "Arabe"], 20),
            ("college", 6, "Sfax", ["Mathématiques", "Physique"], 30),
            ("college", 4, "Monastir", ["Anglais", "Français"], 28),
            ("lycee", 8, "Tunis", ["Mathématiques", "Physique"], 40),
            ("lycee", 5, "Sousse", ["Anglais", "Espagnol"], 35),
            ("lycee", 4, "Nabeul", ["SVT", "Mathématiques"], 38),
            ("universite", 3, "Tunis", ["Informatique", "Mathématiques"], 50),
            ("universite", 2, "Sfax", ["Informatique"], 45),
        ]
        
        total_cree = 0
        
        for categorie, nombre, ville, matieres, tarif_base in config_profs:
            print(f"\n📌 Création de {nombre} profs - Catégorie: {categorie.upper()}, Ville: {ville}")
            
            for i in range(nombre):
                # Alterner entre prénoms masculins et féminins
                if random.choice([True, False]):
                    prenom = random.choice(PRENOMS_M)
                else:
                    prenom = random.choice(PRENOMS_F)
                
                nom = random.choice(NOMS)
                
                # Variation de ville (80% ville principale, 20% aléatoire)
                if random.random() < 0.8:
                    ville_prof = ville
                else:
                    ville_prof = random.choice(VILLES)
                
                email = generer_email(prenom, nom, total_cree)
                telephone = f"+216 {random.choice([20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59])} {random.randint(100000, 999999)}"
                
                # Créer l'utilisateur
                user = creer_utilisateur(db, email, prenom, nom, telephone)
                if not user:
                    continue
                
                # Créer le profil professeur
                prof = creer_professeur(db, user, categorie, ville_prof, matieres, tarif_base)
                
                # Associer les matières
                associer_matieres(db, prof, matieres)
                
                # Créer des disponibilités
                creer_disponibilites(db, prof, random.randint(3, 8))
                
                total_cree += 1
        
        print(f"\n{'='*50}")
        print(f"✅ SEEDING TERMINÉ AVEC SUCCÈS!")
        print(f"📊 Total professeurs créés: {total_cree}")
        print(f"{'='*50}")
        
    except Exception as e:
        print(f"\n❌ ERREUR: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    # Vérifier les variables d'environnement
    if not os.getenv("DATABASE_URL"):
        print("⚠️  Attention: DATABASE_URL non définie, utilisation de SQLite par défaut")
    
    print("⚠️  Ce script va ajouter des données de test à votre base de données.")
    print("⚠️  Assurez-vous d'avoir fait une sauvegarde si nécessaire.\n")
    
    confirmation = input("Continuer? (oui/non): ")
    if confirmation.lower() in ["oui", "o", "yes", "y"]:
        seed_database()
    else:
        print("❌ Opération annulée.")