from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
import os, json, re, traceback
from app.database import get_db
from app.models import Professeur, User, ProfMatiereTarif, Matiere, Niveau
from groq import Groq

router = APIRouter()

# ── Poids du scoring ──
SCORING_WEIGHTS = {
    "matiere":    25,
    "niveau":     40,
    "ville":      15,
    "budget":     10,
    "mode":        5,
    "reputation":  5,
}

ETAPES_SCENARIO = [
    {"key": "matiere",    "question": "Quelle matière cherchez-vous ? 📚"},
    {"key": "niveau",     "question": "Très bien ! Quel est votre niveau ? 🎓 (ex: Bac, 9ème, Primaire...)"},
    {"key": "budget_max", "question": "Quel est votre budget maximum par heure (en DT) ? 💰"},
    {"key": "mode",       "question": "Préférez-vous les cours en ligne 💻 ou en présentiel 🏫 ?"},
    {"key": "ville",      "question": "Dernière étape 📍 : Dans quelle ville êtes-vous ?"},
]

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None
    try:
        return Groq(api_key=api_key)
    except Exception as e:
        print(f"Erreur Groq: {e}")
        return None

@router.post("/chat")
async def edu_chat(payload: dict, db: Session = Depends(get_db)):
    try:
        messages = payload.get("messages", [])

        if not messages:
            return {
                "reply": "Bonjour ! Je suis EduBot. Comment puis-je vous aider ?",
                "top3_profs": [], "besoin_complet": False,
                "prochain_critere": "matiere", "noProfs": False
            }

        client = get_groq_client()

        # ── 1. EXTRACTION DES CRITÈRES ──
        criteria = {}

        if client:
            try:
                analysis_prompt = """Tu es un extracteur de données pour une plateforme de tutorat en Tunisie.
Analyse la conversation et retourne UNIQUEMENT un JSON valide avec ces champs:
- matiere: string ou null
- niveau: string ou null
- budget_max: number ou null
- mode: "en_ligne" ou "presentiel" ou null
- ville: string ou null

RÈGLES:
- "6ème année" / "6eme" = "primaire"
- "Bac" / "Baccalauréat" = "lycée"
- "9ème" / "collège" = "collège"
- Budget: "30 DT" → 30, "pas cher" → 30
- Mode: "en ligne" → "en_ligne", "présentiel"/"domicile" → "presentiel"
- Matière: normalise ("maths"→"mathématiques", "physique chim"→"physique")
Réponds UNIQUEMENT avec le JSON."""

                analysis = client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[{"role": "system", "content": analysis_prompt}] + messages[-4:],
                    temperature=0,
                    max_tokens=200
                )
                content = analysis.choices[0].message.content.strip()
                try:
                    criteria = json.loads(content)
                except json.JSONDecodeError:
                    match = re.search(r'\{[\s\S]*?\}', content)
                    if match:
                        try: criteria = json.loads(match.group())
                        except: pass
            except Exception as e:
                print(f"Erreur extraction IA: {e}")

        criteria.setdefault("matiere",    None)
        criteria.setdefault("niveau",     None)
        criteria.setdefault("budget_max", None)
        criteria.setdefault("mode",       None)
        criteria.setdefault("ville",      None)

        print(f"Critères extraits: {criteria}")

        # ── 2. PROCHAIN CRITÈRE MANQUANT ──
        prochain_critere  = None
        question_suivante = None

        for etape in ETAPES_SCENARIO:
            # En ligne → pas besoin de ville
            if etape["key"] == "ville" and criteria.get("mode") == "en_ligne":
                continue
            if not criteria.get(etape["key"]):
                prochain_critere  = etape["key"]
                question_suivante = etape["question"]
                break

        # ── 3. MATCHING ──
        profs_scores = []

        profs_bruts = db.query(Professeur).join(User).filter(
            Professeur.statut_validation == "validé"
        ).all()

        if criteria.get("matiere") and profs_bruts:

            # Variations de matières
            VARIATIONS = {
                "mathématiques": ["math", "maths", "mathématique", "mathematique", "algebre", "géometrie"],
                "physique":      ["physique", "sciences physiques", "chimie physique"],
                "chimie":        ["chimie"],
                "anglais":       ["anglais", "english"],
                "français":      ["français", "francais"],
                "arabe":         ["arabe"],
                "svt":           ["svt", "science", "biologie", "géologie", "sciences naturelles"],
                "informatique":  ["informatique", "programmation", "python", "java", "développement", "dev", "algorithmique", "algo"],
                "philosophie":   ["philosophie", "philo"],
                "histoire":      ["histoire", "géographie", "hg"],
                "comptabilité":  ["comptabilité", "compta", "gestion", "finance"],
            }

            # Catégories de niveaux avec mots-clés
            NIVEAUX_MAP = {
                "primaire": {
                    "keywords": ["primaire","cp","ce","cm","6eme","6ème","5eme","4eme","3eme","2eme","1ere"],
                    "adjacent": ["college"]
                },
                "college": {
                    "keywords": ["college","collège","7eme","7ème","8eme","8ème","9eme","9ème","brevet"],
                    "adjacent": ["primaire","lycee"]
                },
                "lycee": {
                    "keywords": ["lycee","lycée","bac","baccalaureat","baccalauréat","terminale","premiere","seconde","1ère","2ème","3ème secondaire"],
                    "adjacent": ["college","universite"]
                },
                "universite": {
                    "keywords": ["universite","université","licence","master","ingenieur","médecine","prep","prepa","bts"],
                    "adjacent": ["lycee"]
                }
            }

            mat_lower = (criteria["matiere"] or "").lower().strip()
            # Trouver les variations pour la matière demandée
            variations_cible = [mat_lower]
            for key, vals in VARIATIONS.items():
                if mat_lower in key or key in mat_lower or any(v in mat_lower for v in vals):
                    variations_cible = list(set([key] + vals + [mat_lower]))
                    break

            niv_recherche = (criteria.get("niveau") or "").lower().strip()
            niv_clean     = niv_recherche.replace(' ','').replace('-','').replace('é','e').replace('è','e')

            # Détecter catégorie niveau demandé
            cat_demandee = None
            for cat, data in NIVEAUX_MAP.items():
                if any(k in niv_clean for k in data["keywords"]):
                    cat_demandee = cat
                    break

            for p in profs_bruts:
                if not p.user:
                    continue

                score   = 0
                details = {}

                # ── A. MATIÈRE (25 pts) ──
                mat_score = 0
                bio_lower = (p.bio or "").lower()

                # 1. Vérifier dans la bio — matching plus strict
                # Éviter faux positifs : "mathématiques" dans un contexte non-matière
                bio_words = set(bio_lower.replace(',','').replace('.','').replace('(','').replace(')','').split())
                if any(v in bio_lower for v in variations_cible):
                    # Vérifier que c'est bien une matière enseignée (pas juste mentionnée)
                    mat_keywords = ['enseigne','professeur','prof','cours','spécialisé','spécialiste','expert','mathématiques','maths','math']
                    if any(v in bio_lower for v in variations_cible):
                        mat_score = SCORING_WEIGHTS["matiere"]

                # 2. ✅ CORRECTION BUG : utiliser prof_id (pas professeur_id)
                if mat_score == 0:
                    try:
                        prof_mats = db.query(Matiere).join(
                            ProfMatiereTarif,
                            Matiere.id == ProfMatiereTarif.matiere_id
                        ).filter(
                            ProfMatiereTarif.prof_id == p.id   # ← CORRIGÉ
                        ).all()
                        for m in prof_mats:
                            if any(v in m.nom.lower() for v in variations_cible):
                                mat_score = SCORING_WEIGHTS["matiere"]
                                break
                    except Exception as e:
                        print(f"Erreur query matières: {e}")

                score += mat_score
                details["matiere"] = mat_score

                # ── B. NIVEAU (40 pts) ──
                niv_score = 0

                if cat_demandee:
                    bio_clean = bio_lower.replace(' ','').replace('-','').replace('é','e').replace('è','e')

                    # Vérifier dans la bio
                    cat_prof = None
                    for cat, data in NIVEAUX_MAP.items():
                        if any(k in bio_clean for k in data["keywords"]):
                            cat_prof = cat
                            break

                    # Vérifier aussi dans les niveaux des tarifs_matieres
                    if not cat_prof:
                        try:
                            niveaux_prof = db.query(Niveau).join(
                                ProfMatiereTarif, Niveau.id == ProfMatiereTarif.niveau_id
                            ).filter(ProfMatiereTarif.prof_id == p.id).all()
                            for niv_obj in niveaux_prof:
                                niv_nom_clean = niv_obj.nom.lower().replace(' ','').replace('é','e').replace('è','e')
                                for cat, data in NIVEAUX_MAP.items():
                                    if any(k in niv_nom_clean for k in data["keywords"]):
                                        cat_prof = cat
                                        break
                                if cat_prof:
                                    break
                        except Exception as e:
                            print(f"Erreur query niveaux: {e}")

                    if cat_prof:
                        if cat_demandee == cat_prof:
                            niv_score = SCORING_WEIGHTS["niveau"]               # 40
                        elif cat_prof in NIVEAUX_MAP[cat_demandee]["adjacent"]:
                            niv_score = int(SCORING_WEIGHTS["niveau"] * 0.3)   # 12
                        else:
                            niv_score = -20  # Pénalité forte
                    else:
                        # Niveau prof inconnu → neutre
                        niv_score = int(SCORING_WEIGHTS["niveau"] * 0.25)  # 10 pts

                elif not niv_recherche:
                    # Pas de niveau demandé → neutre
                    niv_score = int(SCORING_WEIGHTS["niveau"] * 0.5)  # 20 pts

                niv_score = max(0, min(niv_score, SCORING_WEIGHTS["niveau"]))
                score    += niv_score
                details["niveau"] = niv_score

                # ── C. VILLE (15 pts) ──
                ville_score = 0
                if criteria.get("mode") != "en_ligne":
                    if criteria.get("ville") and p.ville:
                        v_req  = criteria["ville"].lower().strip()
                        v_prof = p.ville.lower().strip()
                        if v_req == v_prof:
                            ville_score = SCORING_WEIGHTS["ville"]
                        elif v_req in v_prof or v_prof in v_req:
                            ville_score = int(SCORING_WEIGHTS["ville"] * 0.5)
                    elif not criteria.get("ville"):
                        # Pas de ville demandée → neutre
                        ville_score = int(SCORING_WEIGHTS["ville"] * 0.5)

                score += ville_score
                details["ville"] = ville_score

                # ── D. BUDGET (10 pts) ──
                budget_score = 0
                if criteria.get("budget_max"):
                    try:
                        budget = float(criteria["budget_max"])
                        tarif  = None
                        if criteria.get("mode") == "en_ligne" and p.tarif_en_ligne:
                            tarif = float(p.tarif_en_ligne)
                        elif criteria.get("mode") == "presentiel" and p.tarif_presentiel:
                            tarif = float(p.tarif_presentiel)
                        else:
                            tarifs = [t for t in [p.tarif_en_ligne, p.tarif_presentiel] if t]
                            if tarifs: tarif = min(float(t) for t in tarifs)

                        if tarif:
                            if tarif <= budget:
                                budget_score = SCORING_WEIGHTS["budget"]        # 10
                            elif tarif <= budget * 1.15:
                                budget_score = int(SCORING_WEIGHTS["budget"] * 0.6)  # 6
                            elif tarif <= budget * 1.30:
                                budget_score = int(SCORING_WEIGHTS["budget"] * 0.3)  # 3
                    except:
                        pass
                else:
                    # Pas de budget demandé → neutre
                    budget_score = int(SCORING_WEIGHTS["budget"] * 0.5)

                score += budget_score
                details["budget"] = budget_score

                # ── E. MODE (5 pts) ──
                mode_score = int(SCORING_WEIGHTS["mode"] * 0.5)  # neutre par défaut
                if criteria.get("mode") and p.mode_enseignement:
                    mode_req = criteria["mode"].lower()
                    p_mode   = p.mode_enseignement.lower()
                    if mode_req == p_mode or p_mode == "les_deux":
                        mode_score = SCORING_WEIGHTS["mode"]
                    else:
                        mode_score = 0

                score += mode_score
                details["mode"] = mode_score

                # ── F. RÉPUTATION (5 pts) ──
                rep_score = 0
                if p.note_moyenne:
                    note = float(p.note_moyenne)
                    if note >= 4.5:   rep_score = SCORING_WEIGHTS["reputation"]
                    elif note >= 4.0: rep_score = int(SCORING_WEIGHTS["reputation"] * 0.6)
                    elif note >= 3.5: rep_score = int(SCORING_WEIGHTS["reputation"] * 0.3)

                score += rep_score
                details["reputation"] = rep_score

                # Seuil minimum abaissé à 35 pts
                if score >= 35:
                    tarifs_list = [t for t in [p.tarif_en_ligne, p.tarif_presentiel] if t and float(t) > 0]
                    tarif_min   = min(float(t) for t in tarifs_list) if tarifs_list else 0

                    label = ("Excellent" if score >= 85 else
                             "Très bon"  if score >= 70 else
                             "Bon"       if score >= 55 else "Possible")

                    profs_scores.append({
                        "id":               p.id,
                        "nom":              f"{p.user.prenom} {p.user.nom}",
                        "photo_url":        p.photo_url,
                        "ville":            p.ville,
                        "note_moyenne":     float(p.note_moyenne or 0),
                        "nb_avis":          p.nb_avis or 0,
                        "mode_enseignement":p.mode_enseignement,
                        "tarif_en_ligne":   float(p.tarif_en_ligne or 0),
                        "tarif_presentiel": float(p.tarif_presentiel or 0),
                        "tarif_min":        tarif_min,
                        "bio":              p.bio,
                        "matieres":         [],
                        "disponibilites":   [],
                        "score": {
                            "total":   round(score, 1),
                            "label":   label,
                            "details": details,
                        }
                    })

        top3 = sorted(profs_scores, key=lambda x: x["score"]["total"], reverse=True)[:3]

        print(f"\nTop {len(top3)} résultats:")
        for p in top3:
            d = p["score"]["details"]
            print(f"  {p['nom']}: {p['score']['total']}pts | mat={d['matiere']} niv={d['niveau']} ville={d['ville']} budget={d['budget']} mode={d['mode']}")

        # ── 4. RÉPONSE ──
        if prochain_critere and len(top3) == 0:
            reply = question_suivante
        elif top3:
            reply = f"J'ai trouvé {len(top3)} professeur{'s' if len(top3)>1 else ''} qui correspondent à votre recherche !"
        else:
            reply = "Je n'ai pas trouvé de professeur correspondant à ces critères. Essayez d'élargir votre recherche (autre ville, autre budget, autre mode)."

        return {
            "reply":            reply,
            "top3_profs":       top3,
            "besoin_complet":   prochain_critere is None,
            "prochain_critere": prochain_critere,
            "noProfs":          len(top3) == 0 and criteria.get("matiere") is not None,
        }

    except Exception as e:
        print(f"❌ ERREUR chatbot: {e}")
        traceback.print_exc()
        return {
            "reply": "⚠️ Une erreur technique est survenue. Veuillez réessayer.",
            "top3_profs": [], "besoin_complet": False,
            "prochain_critere": None, "noProfs": False,
        }


@router.get("/prof-detail/{prof_id}")
def get_prof_detail(prof_id: int, db: Session = Depends(get_db)):
    prof = db.query(Professeur).join(User).filter(
        Professeur.id == prof_id,
        Professeur.statut_validation == "validé",
    ).first()
    if not prof:
        raise HTTPException(404, "Professeur introuvable")

    # Matières
    matieres = db.query(Matiere).join(
        ProfMatiereTarif, Matiere.id == ProfMatiereTarif.matiere_id
    ).filter(ProfMatiereTarif.prof_id == prof_id).all()   # ← CORRIGÉ

    # Disponibilités
    from datetime import date
    dispos = [d for d in prof.disponibilites if d.actif and d.date_specifique and d.date_specifique >= date.today()]
    dispos.sort(key=lambda d: d.date_specifique)

    tarifs_list = [t for t in [prof.tarif_en_ligne, prof.tarif_presentiel] if t and float(t) > 0]
    tarif_min   = min(float(t) for t in tarifs_list) if tarifs_list else 0

    return {
        "id":               prof.id,
        "nom":              f"{prof.user.prenom} {prof.user.nom}",
        "user_prenom":      prof.user.prenom,
        "user_nom":         prof.user.nom,
        "photo_url":        prof.photo_url,
        "ville":            prof.ville,
        "bio":              prof.bio,
        "telephone":        prof.telephone,
        "email":            prof.user.email,
        "note_moyenne":     float(prof.note_moyenne or 0),
        "nb_avis":          prof.nb_avis or 0,
        "mode_enseignement":prof.mode_enseignement,
        "tarif_en_ligne":   float(prof.tarif_en_ligne or 0),
        "tarif_presentiel": float(prof.tarif_presentiel or 0),
        "tarif_min":        tarif_min,
        "matieres":         [m.nom for m in matieres],
        "tarifs_matieres":  [{"nom_matiere": m.nom, "tarif": tarif_min} for m in matieres],
        "disponibilites":   [{
            "id":            d.id,
            "date":          str(d.date_specifique),
            "heure_debut":   str(d.heure_debut)[:5] if d.heure_debut else None,
            "heure_fin":     str(d.heure_fin)[:5] if d.heure_fin else None,
            "nb_inscrits":   d.nb_inscrits,
            "nb_max":        d.nb_max_etudiants,
            "mode":          d.mode_seance,
        } for d in dispos[:5]],
    }