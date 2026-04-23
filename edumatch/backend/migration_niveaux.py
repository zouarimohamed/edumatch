"""
Migration : Restructurer les niveaux académiques
Exécuter depuis le dossier backend :
  python migration_niveaux.py
"""

import psycopg2

# ── Connexion ─────────────────────────────────────────────
DB = {
    "host":     "localhost",
    "port":     5432,
    "dbname":   "pfe_db",
    "user":     "postgres",
    "password": "postgres",
}

def run():
    conn = psycopg2.connect(**DB)
    cur  = conn.cursor()

    try:
        # ── 1. Trouver le domaine Académique ──────────────
        cur.execute("SELECT id FROM domaines WHERE nom = 'Académique' LIMIT 1")
        row = cur.fetchone()
        if not row:
            print("❌ Domaine 'Académique' introuvable")
            return
        dom_id = row[0]
        print(f"✅ Domaine Académique id = {dom_id}")

        # ── 2. Trouver l'ancien niveau Primaire (1-6ème) ──
        cur.execute(
            "SELECT id FROM niveaux WHERE nom = 'Primaire (1-6ème)' AND domaine_id = %s LIMIT 1",
            (dom_id,)
        )
        row = cur.fetchone()

        if row:
            old_niv_id = row[0]
            print(f"✅ Ancien niveau 'Primaire (1-6ème)' trouvé, id = {old_niv_id}")

            # Récupérer les matières de l'ancien niveau
            cur.execute("SELECT nom FROM matieres WHERE niveau_id = %s", (old_niv_id,))
            matieres = [r[0] for r in cur.fetchall()]
            print(f"   Matières à copier : {matieres}")

            # Créer les 6 nouveaux niveaux
            nouveaux = [
                '1ère année primaire',
                '2ème année primaire',
                '3ème année primaire',
                '4ème année primaire',
                '5ème année primaire',
                '6ème année primaire',
            ]
            for nom_niv in nouveaux:
                # Vérifier s'il existe déjà
                cur.execute(
                    "SELECT id FROM niveaux WHERE nom = %s AND domaine_id = %s LIMIT 1",
                    (nom_niv, dom_id)
                )
                existing = cur.fetchone()
                if existing:
                    new_id = existing[0]
                    print(f"   ⚠️  Niveau '{nom_niv}' existe déjà (id={new_id})")
                else:
                    cur.execute(
                        "INSERT INTO niveaux (nom, domaine_id) VALUES (%s, %s) RETURNING id",
                        (nom_niv, dom_id)
                    )
                    new_id = cur.fetchone()[0]
                    print(f"   ✅ Niveau '{nom_niv}' créé (id={new_id})")

                # Copier les matières vers ce nouveau niveau
                for mat in matieres:
                    # Vérifier si la matière existe déjà
                    cur.execute(
                        "SELECT id FROM matieres WHERE nom = %s AND niveau_id = %s LIMIT 1",
                        (mat, new_id)
                    )
                    if not cur.fetchone():
                        cur.execute(
                            "INSERT INTO matieres (nom, niveau_id) VALUES (%s, %s)",
                            (mat, new_id)
                        )

            # Supprimer les matières et l'ancien niveau
            cur.execute("DELETE FROM matieres WHERE niveau_id = %s", (old_niv_id,))
            cur.execute("DELETE FROM niveaux WHERE id = %s", (old_niv_id,))
            print(f"   🗑  Ancien niveau 'Primaire (1-6ème)' supprimé")

        else:
            print("⚠️  Niveau 'Primaire (1-6ème)' non trouvé — déjà migré ou nom différent")

        # ── 3. Vérifier/renommer les niveaux Lycée ────────
        lycee_renames = {
            '1ère année Lycée': ['1ere année Lycée', '1ère Lycée', '1ere Lycee', 'Première année Lycée'],
            '2ème année Lycée': ['2eme année Lycée', '2ème Lycée', 'Deuxième année Lycée'],
            '3ème année Lycée': ['3eme année Lycée', '3ème Lycée', 'Troisième année Lycée'],
        }
        for correct, variants in lycee_renames.items():
            # Vérifier si le nom correct existe déjà
            cur.execute(
                "SELECT id FROM niveaux WHERE nom = %s AND domaine_id = %s LIMIT 1",
                (correct, dom_id)
            )
            if not cur.fetchone():
                # Chercher une variante
                for variant in variants:
                    cur.execute(
                        "SELECT id FROM niveaux WHERE nom = %s AND domaine_id = %s LIMIT 1",
                        (variant, dom_id)
                    )
                    row = cur.fetchone()
                    if row:
                        cur.execute(
                            "UPDATE niveaux SET nom = %s WHERE id = %s",
                            (correct, row[0])
                        )
                        print(f"   ✅ Renommé '{variant}' → '{correct}'")
                        break

        # ── 4. Vérifier Baccalauréat ──────────────────────
        cur.execute(
            "SELECT id FROM niveaux WHERE nom = 'Baccalauréat' AND domaine_id = %s LIMIT 1",
            (dom_id,)
        )
        if not cur.fetchone():
            cur.execute(
                "INSERT INTO niveaux (nom, domaine_id) VALUES ('Baccalauréat', %s)",
                (dom_id,)
            )
            print("   ✅ Niveau 'Baccalauréat' créé")
        else:
            print("   ✅ Niveau 'Baccalauréat' existe déjà")

        conn.commit()
        print("\n✅ Migration terminée avec succès !\n")

        # ── 5. Afficher l'état final ───────────────────────
        cur.execute("""
            SELECT n.nom, COUNT(m.id) as nb_matieres
            FROM niveaux n
            JOIN domaines d ON d.id = n.domaine_id
            LEFT JOIN matieres m ON m.niveau_id = n.id
            WHERE d.nom = 'Académique'
            GROUP BY n.nom
            ORDER BY n.nom
        """)
        rows = cur.fetchall()
        print("État final des niveaux Académique :")
        print("-" * 40)
        for nom, nb in rows:
            print(f"  {nom:35s} → {nb} matière(s)")

    except Exception as e:
        conn.rollback()
        print(f"❌ Erreur : {e}")
        import traceback; traceback.print_exc()
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    run()