import sys
import os
from datetime import date
from sqlalchemy import text

# Permet à Python de trouver le dossier 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.models.etudiant import Etudiant
from app.models.professeur import Professeur, ProfMatiereTarif, Certificat
from app.models.matiere import Domaine, Niveau, Matiere, Ville
from app.models.reservation import Reservation
from app.models.disponibilite import Disponibilite
from app.models.avis import Avis
from app.models.preferences import PreferencesEtudiant
from app.models.conversation import ConversationChat

from app.utils.security import hash_password

def seed_database():
    db = SessionLocal()
    print("🧹 Nettoyage radical de la base de données (DROP SCHEMA CASCADE)...")
    
    try:
        db.execute(text("DROP SCHEMA IF EXISTS public CASCADE;"))
        db.execute(text("CREATE SCHEMA public;"))
        db.execute(text("GRANT ALL ON SCHEMA public TO postgres;"))
        db.execute(text("GRANT ALL ON SCHEMA public TO public;"))
        db.commit()
        print("✨ Schéma PostgreSQL réinitialisé.")
    except Exception as e:
        print(f"⚠️ Erreur lors du nettoyage : {e}")
        db.rollback()

    print("🏗️ Création des tables selon les nouveaux modèles...")
    Base.metadata.create_all(bind=engine)

    try:
        # --- 1. LES VILLES ---
        print("📍 Insertion des villes...")
        for v_nom in ["Tunis", "Sfax", "Sousse", "Monastir", "Nabeul", "Bizerte", "Kairouan", "Ariana"]:
            db.add(Ville(nom=v_nom))
        db.commit()

        # --- 2. LES DOMAINES ---
        print("📁 Création des domaines (Académique / Professionnel)...")
        d_acad = Domaine(nom="Domaine académique")
        d_prof = Domaine(nom="Domaine professionnel")
        db.add_all([d_acad, d_prof])
        db.commit()

        # --- 3. CATALOGUE ACADÉMIQUE ---
        print("📚 Insertion du catalogue Académique...")
        
        # A. Ecole Primaire
        n_prim = Niveau(nom="Ecole Primaire (1ère - 6ème année)", ordre=1, domaine_id=d_acad.id)
        db.add(n_prim); db.commit()
        m_prim = ["Arabe", "Français", "Anglais (Eveil)", "Mathématiques"]
        for m in m_prim: db.add(Matiere(nom=m, niveau_id=n_prim.id))

        # B. Collège & Lycée
        n_sec = Niveau(nom="Collège & Lycée (7ème - Baccalauréat)", ordre=2, domaine_id=d_acad.id)
        db.add(n_sec); db.commit()
        m_sec = ["Algèbre", "Physique", "Chimie", "Programmation Python"]
        for m in m_sec: db.add(Matiere(nom=m, niveau_id=n_sec.id))

        # C. Université
        n_univ = Niveau(nom="Université & Enseignement Supérieur", ordre=3, domaine_id=d_acad.id)
        db.add(n_univ); db.commit()
        m_univ = ["Machine Learning & Deep Learning", "Ethical Hacking", "UI/UX Design"]
        for m in m_univ: db.add(Matiere(nom=m, niveau_id=n_univ.id))

        # --- 4. CATALOGUE PROFESSIONNEL ---
        print("💼 Insertion du catalogue Professionnel...")
        n_pro = Niveau(nom="Formation continue & Reconversion", ordre=4, domaine_id=d_prof.id)
        db.add(n_pro); db.commit()
        m_pro = ["Growth Hacking", "IA Générative pour Pro", "Cuisine Professionnelle"]
        for m in m_pro: db.add(Matiere(nom=m, niveau_id=n_pro.id))

        db.commit()

        # --- 5. COMPTES DE TEST ---
        print("👤 Création des comptes utilisateurs...")
        
        # ADMIN
        admin = User(nom="Admin", prenom="EduMatch", email="admin@edumatch.tn", 
                     password=hash_password("admin123"), role="admin", statut="actif")
        db.add(admin)

        # PROFESSEUR (Nabila)
        nabila_u = User(nom="Masmoudi", prenom="Nabila", email="nabila@test.tn", 
                        password=hash_password("test1234"), role="professeur", statut="actif")
        db.add(nabila_u); db.flush()
        
        nabila_p = Professeur(user_id=nabila_u.id, ville="Sfax", bio="Expert IA", statut_validation="validé")
        db.add(nabila_p); db.flush()

        # --- CORRECTION ICI : Ajout du prix avec le NIVEAU_ID ---
        m_ia = db.query(Matiere).filter_by(nom="Machine Learning & Deep Learning").first()
        # On lie le prix au niveau Université (n_univ.id)
        db.add(ProfMatiereTarif(prof_id=nabila_p.id, matiere_id=m_ia.id, niveau_id=n_univ.id, tarif=75.0))

        # ÉTUDIANT (Ahmed)
        ahmed_u = User(nom="Zouari", prenom="Ahmed", email="ahmed@test.tn", 
                       password=hash_password("test1234"), role="étudiant", statut="actif")
        db.add(ahmed_u); db.flush()
        db.add(Etudiant(user_id=ahmed_u.id, ville="Tunis", niveau="Baccalauréat"))

        db.commit()
        print("\n" + "="*40)
        print("✅ BASE DE DONNÉES MISE À JOUR !")
        print("="*40)

    except Exception as e:
        print(f"\n❌ ERREUR DURANT L'INSERTION : {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()