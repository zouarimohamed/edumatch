import psycopg2

DB = {"host":"localhost","port":5432,"dbname":"pfe_db","user":"postgres","password":"postgres"}
NOMS = ['1ère année primaire','2ème année primaire','3ème année primaire',
        '4ème année primaire','5ème année primaire','6ème année primaire']

conn = psycopg2.connect(**DB)
conn.autocommit = False
cur = conn.cursor()

try:
    # Matières de id=27
    cur.execute("SELECT nom FROM matieres WHERE niveau_id = 27")
    matieres = [r[0] for r in cur.fetchall()]
    print(f"Matières à copier: {matieres}")

    # Créer les 6 niveaux
    premiers_id = None
    for nom in NOMS:
        cur.execute("SELECT id FROM niveaux WHERE nom=%s AND domaine_id=10 LIMIT 1",(nom,))
        ex = cur.fetchone()
        if ex:
            nid = ex[0]
            print(f"  existe déjà: '{nom}' id={nid}")
        else:
            cur.execute("INSERT INTO niveaux (nom,domaine_id) VALUES (%s,10) RETURNING id",(nom,))
            nid = cur.fetchone()[0]
            print(f"  créé: '{nom}' id={nid}")
            for m in matieres:
                cur.execute("INSERT INTO matieres (nom,niveau_id) VALUES (%s,%s)",(m,nid))
        if premiers_id is None:
            premiers_id = nid

    # Migrer disponibilites de 27 vers premier
    cur.execute("UPDATE disponibilites SET niveau_id=%s WHERE niveau_id=27",(premiers_id,))
    print(f"Disponibilités migrées vers {premiers_id}")

    # Migrer prof_matiere_tarif
    try:
        cur.execute("UPDATE prof_matiere_tarif SET niveau_id=%s WHERE niveau_id=27",(premiers_id,))
    except: pass

    # Supprimer matières puis niveau 27
    cur.execute("DELETE FROM matieres WHERE niveau_id=27")
    cur.execute("DELETE FROM niveaux WHERE id=27")
    print("id=27 supprimé")

    conn.commit()
    print("\n✅ OK\n")

    # État final
    cur.execute("""
        SELECT n.id,n.nom,COUNT(m.id) FROM niveaux n
        JOIN domaines d ON d.id=n.domaine_id
        LEFT JOIN matieres m ON m.niveau_id=n.id
        WHERE d.nom='Académique' GROUP BY n.id,n.nom ORDER BY n.nom
    """)
    for nid,nom,nb in cur.fetchall():
        print(f"  {nid:<4} '{nom}' → {nb}")

except Exception as e:
    conn.rollback()
    print(f"❌ {e}")
    import traceback; traceback.print_exc()
finally:
    cur.close(); conn.close()