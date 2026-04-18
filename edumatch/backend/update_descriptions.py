"""
Script Python pour mettre à jour les descriptions des disponibilités
Exécuter : python update_descriptions.py
"""
import psycopg2

# Connexion à la base
conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="pfe_db",
    user="postgres",
    password="postgres"
)
conn.autocommit = True
cur = conn.cursor()

descriptions = {
    # prof_id : description
    18: "Séance Mathématiques et Arabe niveau Primaire 1ère à 6ème. Maths : 4 opérations fractions nombres décimaux résolution problèmes géométrie périmètre aire tables multiplication algèbre primaire calcul. Arabe grammaire conjugaison expression écrite lecture textes. Soutien scolaire primaire préparation examens trimestriels.",
    
    148: "Séance Mathématiques lycée et baccalauréat 1ère 2ème 3ème année lycée. Algèbre équations premier second degré inéquations systèmes factorisation polynômes. Analyse fonctions limites dérivées étude de fonctions suites intégrales. Géométrie analytique vecteurs trigonométrie logarithmes exponentielles probabilités. Préparation baccalauréat annales corrigées méthodes rapides.",
    
    149: "Séance Français primaire 1ère à 6ème. Lecture fluide compréhension textes vocabulaire. Grammaire nom verbe adjectif phrase. Conjugaison présent passé composé futur imparfait. Orthographe accord homophones dictée. Expression écrite rédaction histoire. Soutien scolaire français primaire rattrapage lecture écriture difficultés.",
    
    151: "Séance Mathématiques collège 7ème 8ème 9ème année. Nombres relatifs calcul littéral géométrie. Equations premier degré Pythagore Thalès statistiques. Fonctions affines second degré trigonométrie. Algèbre développer factoriser résoudre équations. Révision contrôles collège.",
    
    153: "Séance Mathématiques primaire 1ère à 6ème. Numération calcul addition soustraction multiplication division tables. Fractions décimaux pourcentages résolution problèmes. Géométrie formes périmètre aire symétrie. Calcul mental exercices progressifs soutien scolaire maths primaire.",
    
    154: "Séance Mathématiques lycée baccalauréat 1ère 2ème 3ème année. Algèbre équations inéquations vecteurs. Fonctions dérivées étude tableaux variation. Suites probabilités nombres complexes géométrie analytique. Préparation bac annales exercices ciblés lycée.",
    
    156: "Séance Français primaire lecture grammaire expression écrite. Lecture compréhension textes. Grammaire conjugaison orthographe accord dictée. Expression écrite rédaction vocabulaire synonymes. Conscience phonologique écriture cursive. Soutien scolaire français primaire difficultés lecture écriture rattrapage.",
    
    157: "Séance Mathématiques primaire cours exercices pratiques. Calcul fractions décimaux résolution problèmes numération opérations. Tables multiplication fractions simples partage mesures. Géométrie formes périmètre aire. Exercices progressifs correction détaillée soutien scolaire maths primaire préparation examens.",
    
    158: "Séance Mathématiques collège 7ème 8ème 9ème année. Nombres relatifs calcul littéral figures. Equations premier degré Thalès probabilités. Fonctions affines second degré trigonométrie. Algèbre factoriser développer systèmes. Pythagore Thalès angles longueurs statistiques. Diagnostic lacunes exercices préparation contrôles collège.",
}

print("Mise à jour des descriptions...")
total = 0
for prof_id, description in descriptions.items():
    cur.execute(
        "UPDATE disponibilites SET description = %s WHERE prof_id = %s",
        (description, prof_id)
    )
    rows = cur.rowcount
    total += rows
    print(f"  prof_id={prof_id} : {rows} disponibilités mises à jour")

print(f"\nTotal : {total} disponibilités mises à jour")

# Vérification
cur.execute("""
    SELECT u.prenom || ' ' || u.nom AS prof, 
           COUNT(d.id) AS nb,
           LEFT(MAX(d.description), 60) AS apercu
    FROM disponibilites d
    JOIN professeurs p ON p.id = d.prof_id
    JOIN users u ON u.id = p.user_id
    WHERE p.id IN (18,148,149,151,153,154,156,157,158)
    GROUP BY p.id, u.prenom, u.nom
    ORDER BY u.nom
""")
print("\nVérification finale:")
print(f"{'Prof':<25} {'Nb':<5} {'Apercu'}")
print("-" * 80)
for row in cur.fetchall():
    print(f"{row[0]:<25} {row[1]:<5} {row[2] or 'NULL'}")

cur.close()
conn.close()
print("\nTerminé !")