# seed_profs.py - VERSION FINALE PRO
from app.database import SessionLocal
from app.models import (User, Professeur, Matiere, Niveau, Domaine, 
                        ProfMatiereTarif, Certificat, Disponibilite, Avis, Reservation, Message, ConversationChat)
from app.utils.security import hash_password
from datetime import date, time, timedelta

def seed():
    db = SessionLocal()
    try:
        print("⏳ Nettoyage complet pour une démo propre...")
        
        # Nettoyage
        db.query(Avis).delete()
        db.query(Message).delete()
        db.query(ConversationChat).delete()
        db.query(Reservation).delete()
        db.query(Disponibilite).delete()
        db.query(Certificat).delete()
        db.query(ProfMatiereTarif).delete()
        db.query(Professeur).delete()
        db.query(Matiere).delete()
        db.query(Niveau).delete()
        db.query(Domaine).delete()
        
        emails_test = ["ahmed@test.com", "sonia@test.com", "mariem@test.com"]
        db.query(User).filter(User.email.in_(emails_test)).delete(synchronize_session=False)
        db.commit()

        # 1. RÉFÉRENTIEL
        dom = Domaine(nom="Sciences")
        db.add(dom); db.flush()
        niv_bac = Niveau(nom="Baccalauréat", domaine_id=dom.id)
        niv_prim = Niveau(nom="Primaire", domaine_id=dom.id)
        db.add_all([niv_bac, niv_prim]); db.flush()
        m_maths = Matiere(nom="Mathématiques", niveau_id=niv_bac.id)
        m_fr = Matiere(nom="Français", niveau_id=niv_prim.id)
        db.add_all([m_maths, m_fr]); db.flush()

        # 2. AHMED BEN AMOR (SOUSSE)
        u1 = User(nom="Ben Amor", prenom="Ahmed", email="ahmed@test.com", password=hash_password("123"), role="professeur", statut="actif")
        db.add(u1); db.flush()
        p1 = Professeur(
            user_id=u1.id, 
            ville="Sousse", 
            bio="Expert en Mathématiques pour le Bac. 10 ans d'expérience.", 
            telephone="+216 98765432",
            mode_enseignement="les_deux", # <--- Important pour l'affichage
            tarif_en_ligne=20.00,        # <--- Ton bouton bleu
            tarif_presentiel=25.00,      # <--- Ton bouton vert
            statut_validation="validé", 
            note_moyenne=4.8, 
            nb_avis=1
        )
        db.add(p1); db.flush()
        db.add(ProfMatiereTarif(prof_id=p1.id, matiere_id=m_maths.id, niveau_id=niv_bac.id, tarif=25))
        db.add(Certificat(prof_id=p1.id, titre="Master en Mathématiques", description="Université de Sousse"))
        db.add(Disponibilite(prof_id=p1.id, date_specifique=date.today() + timedelta(days=2), heure_debut=time(10, 0), heure_fin=time(12, 0), mode_seance="presentiel", nb_max_etudiants=5))

        # 3. MARIEM ZOUARI (SFAX)
        u3 = User(nom="Zouari", prenom="Mariem", email="mariem@test.com", password=hash_password("123"), role="professeur", statut="actif")
        db.add(u3); db.flush()
        p3 = Professeur(
            user_id=u3.id, 
            ville="Sfax", 
            bio="J'enseigne le français pour tous les niveaux, y compris la 5ème année primaire.", 
            telephone="+216 22334455",
            mode_enseignement="les_deux", 
            tarif_en_ligne=20.00, 
            tarif_presentiel=35.00, 
            statut_validation="validé", 
            note_moyenne=5.0, 
            nb_avis=12
        )
        db.add(p3); db.flush()
        db.add(ProfMatiereTarif(prof_id=p3.id, matiere_id=m_fr.id, niveau_id=niv_prim.id, tarif=22))
        db.add(Certificat(prof_id=p3.id, titre="Licence en Français", description="Faculté des Lettres de Sfax"))
        db.add(Disponibilite(prof_id=p3.id, date_specifique=date.today() + timedelta(days=1), heure_debut=time(14, 0), heure_fin=time(16, 0), mode_seance="en_ligne", nb_max_etudiants=3))

        db.commit()
        print("✅ Base de données Élite créée avec les deux tarifs !")
        
    except Exception as e:
        print(f"❌ Erreur : {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()