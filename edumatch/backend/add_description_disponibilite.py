"""
Migration : ajoute la colonne 'description' à la table disponibilites
Exécuter UNE SEULE FOIS depuis le dossier backend :
    python add_description_disponibilite.py
"""
from app.database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        # Vérifier si la colonne existe déjà
        try:
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='disponibilites' 
                AND column_name='description'
            """))
            exists = result.fetchone()
        except Exception:
            exists = None

        if exists:
            print("✅ La colonne 'description' existe déjà — rien à faire.")
            return

        # Ajouter la colonne
        conn.execute(text("""
            ALTER TABLE disponibilites 
            ADD COLUMN description TEXT DEFAULT NULL
        """))
        conn.commit()
        print("✅ Colonne 'description' ajoutée à la table disponibilites avec succès !")

if __name__ == "__main__":
    migrate()