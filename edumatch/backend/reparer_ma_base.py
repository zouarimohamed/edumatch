# restructuration_finale.py
from app.database import SessionLocal
from app.models import Domaine, Niveau, Matiere, User, Professeur
from app.utils.security import hash_password

def restructure():
    db = SessionLocal()
    try:
        print("🧹 Nettoyage des anciens domaines...")
        anciens = ["Sciences", "Primaire", "Collège", "Lycée", "Université", "Académique", "Professionnel"]
        db.query(Domaine).filter(Domaine.nom.in_(anciens)).delete(synchronize_session=False)
        db.commit()

        # 1. CRÉATION DU DOMAINE ACADÉMIQUE
        dom_aca = Domaine(nom="Académique")
        db.add(dom_aca); db.flush()
        
        niveaux_aca = [
            "Primaire (1-6ème)", "7ème année", "8ème année", "9ème année", 
            "1ère année Lycée", "2ème année Lycée", "3ème année Lycée", "Baccalauréat"
        ]
        
        for n_nom in niveaux_aca:
            niv = Niveau(nom=n_nom, domaine_id=dom_aca.id)
            db.add(niv); db.flush()
            # Matières scolaires par défaut
            for m_nom in ["Mathématiques", "Français", "Arabe", "Physique"]:
                db.add(Matiere(nom=m_nom, niveau_id=niv.id))

        # 2. CRÉATION DU DOMAINE PROFESSIONNEL
        dom_pro = Domaine(nom="Professionnel")
        db.add(dom_pro); db.flush()
        
        niveaux_pro = ["Intelligence Artificielle", "Développement Web", "Cloud & DevOps", "Cyber-sécurité"]
        
        for n_nom in niveaux_pro:
            niv = Niveau(nom=n_nom, domaine_id=dom_pro.id)
            db.add(niv); db.flush()
            # Matières techniques (ex: pour Web -> React, Node, etc.)
            if "Web" in n_nom:
                matieres = ["React JS", "Node.js", "PHP / Laravel", "Base de données"]
            elif "IA" in n_nom:
                matieres = ["Python", "Machine Learning", "Deep Learning", "Data Science"]
            else:
                matieres = ["Spécialité 1", "Spécialité 2"]
                
            for m_nom in matieres:
                db.add(Matiere(nom=m_nom, niveau_id=niv.id))

        # 3. S'ASSURER QUE MOHAMED ZOUARI EXISTE TOUJOURS
        u_m = db.query(User).filter_by(email="mohamed@test.tn").first()
        if not u_m:
            u_m = User(nom="Zouari", prenom="Mohamed", email="mohamed@test.tn", 
                       password=hash_password("123"), role="professeur", statut="actif")
            db.add(u_m); db.flush()
        
        p_m = db.query(Professeur).filter_by(user_id=u_m.id).first()
        if not p_m:
            p_m = Professeur(user_id=u_m.id, ville="Sfax", bio="Expert en Mathématiques.", 
                             tarif_en_ligne=20, tarif_presentiel=35, statut_validation="validé")
            db.add(p_m)

        db.commit()
        print("✅ Restructuration terminée !")
        print("📂 Domaine ACADÉMIQUE : Primaire au Lycée")
        print("📂 Domaine PROFESSIONNEL : AI, Web, Cloud")

    except Exception as e:
        print(f"❌ Erreur : {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    restructure()