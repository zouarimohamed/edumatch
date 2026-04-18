from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import os, json, re, traceback
from datetime import date, datetime, timedelta
from app.database import get_db
from app.models import Professeur, User, ProfMatiereTarif, Matiere, Niveau
from app.models.disponibilite import Disponibilite
from groq import Groq

router = APIRouter()

SCORING_WEIGHTS = {
    "matiere": 25, "niveau": 40, "ville": 15,
    "budget": 10,  "mode": 5,   "reputation": 5,
}

VILLES_DISPONIBLES = ["tunis", "sfax", "sousse", "monastir"]

DOMAINES_PRO = {
    "développement web": ["dev web", "développement web", "web", "frontend", "backend", "fullstack"],
    "intelligence artificielle": ["ia", "intelligence artificielle", "machine learning", "deep learning", "data science"],
    "cybersécurité": ["cybersécurité", "cyber", "sécurité informatique", "hacking", "réseau"],
    "cloud & devops": ["cloud", "devops", "aws", "docker", "kubernetes"],
    "comptabilité": ["comptabilité", "compta", "finance", "gestion financière"],
    "marketing digital": ["marketing", "marketing digital", "seo", "réseaux sociaux"],
    "langues professionnelles": ["anglais pro", "communication", "prise de parole"],
}

VARIATIONS = {
    "mathématiques": ["math","maths","mathématique","mathematique","algebre","géometrie"],
    "physique":      ["physique","sciences physiques","chimie physique","physique-chimie"],
    "chimie":        ["chimie"],
    "anglais":       ["anglais","english"],
    "français":      ["français","francais"],
    "arabe":         ["arabe"],
    "svt":           ["svt","biologie","sciences naturelles","géologie"],
    "informatique":  ["informatique","programmation","python","java","développement","algorithmique"],
    "philosophie":   ["philosophie","philo"],
    "histoire":      ["histoire","géographie"],
    "comptabilité":  ["comptabilité","compta","gestion","finance"],
}

ALTERNATIVES = {
    "anglais": ["français","arabe"], "français": ["arabe","anglais"],
    "arabe": ["français","anglais"], "physique": ["mathématiques","chimie"],
    "chimie": ["physique","svt"],    "svt": ["chimie","physique"],
    "philosophie": ["histoire"],     "histoire": ["philosophie"],
    "informatique": ["mathématiques"],
}

NIVEAUX_MAP = {
    "primaire":   {"keywords":["primaire","cp","ce","cm","6eme","6ème","5eme","4eme","annee primaire","école primaire"],"adjacent":["college"]},
    "college":    {"keywords":["college","collège","7eme","7ème","8eme","8ème","9eme","9ème","brevet","année de base"],"adjacent":["primaire","lycee"]},
    "lycee":      {"keywords":["lycee","lycée","bac","baccalaureat","baccalauréat","terminale","secondaire","1ere annee lycee","2eme annee lycee"],"adjacent":["college","universite"]},
    "universite": {"keywords":["universite","université","licence","master","ingenieur","médecine","prep","prepa"],"adjacent":["lycee"]},
}

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key: return None
    try: return Groq(api_key=api_key)
    except: return None

def get_variations(mat):
    v = [mat]
    for key, vals in VARIATIONS.items():
        if mat in key or key in mat or any(x in mat for x in vals):
            v = list(set([key] + vals + [mat]))
            break
    return v

def get_cat_niveau(text):
    if not text: return None
    c = text.lower().replace(' ','').replace('-','').replace('é','e').replace('è','e')
    for cat, data in NIVEAUX_MAP.items():
        if any(k in c for k in data["keywords"]):
            return cat
    return None

def get_prof_cat_niveau(p, db):
    """Détermine la catégorie niveau d'un prof via bio ET tarifs_matieres."""
    bio = (p.bio or "").lower()
    cat = get_cat_niveau(bio)
    if cat: return cat
    try:
        nivs = db.query(Niveau).join(
            ProfMatiereTarif, Niveau.id == ProfMatiereTarif.niveau_id
        ).filter(ProfMatiereTarif.prof_id == p.id).distinct().all()
        for n in nivs:
            cat = get_cat_niveau(n.nom)
            if cat: return cat
    except: pass
    return None

def score_prof(p, criteria, db, variations, cat_demandee):
    score = 0
    details = {}
    bio = (p.bio or "").lower()

    # ── Matière (25pts) — via table liaison EN PRIORITÉ ──
    mat_score = 0
    try:
        mats = db.query(Matiere).join(
            ProfMatiereTarif, Matiere.id == ProfMatiereTarif.matiere_id
        ).filter(ProfMatiereTarif.prof_id == p.id).all()
        mat_names = [m.nom.lower() for m in mats]
        if any(any(v in mn or mn in v for v in variations) for mn in mat_names):
            mat_score = SCORING_WEIGHTS["matiere"]
    except: pass
    # Fallback bio seulement si table liaison échoue
    if mat_score == 0 and any(v in bio for v in variations):
        mat_score = SCORING_WEIGHTS["matiere"]
    score += mat_score
    details["matiere"] = mat_score

    # ── Niveau (40pts) — strict ──
    niv_score = 0
    if cat_demandee:
        cat_prof = get_prof_cat_niveau(p, db)
        if cat_prof:
            if cat_demandee == cat_prof:
                niv_score = SCORING_WEIGHTS["niveau"]               # 40 — match parfait
            elif cat_prof in NIVEAUX_MAP[cat_demandee]["adjacent"]:
                niv_score = int(SCORING_WEIGHTS["niveau"] * 0.3)    # 12 — adjacent
            else:
                niv_score = 0                                        # 0  — incompatible
        else:
            niv_score = int(SCORING_WEIGHTS["niveau"] * 0.2)        # 8  — inconnu
    else:
        niv_score = int(SCORING_WEIGHTS["niveau"] * 0.5)            # 20 — neutre
    score += niv_score
    details["niveau"] = niv_score

    # ── Ville (15pts) ──
    ville_score = 0
    if criteria.get("mode") == "en_ligne":
        ville_score = 0
    elif criteria.get("ville") and p.ville:
        vr = criteria["ville"].lower().strip()
        vp = p.ville.lower().strip()
        if vr == vp:                ville_score = SCORING_WEIGHTS["ville"]
        elif vr in vp or vp in vr:  ville_score = int(SCORING_WEIGHTS["ville"] * 0.5)
        else:                       ville_score = 0
    else:
        ville_score = int(SCORING_WEIGHTS["ville"] * 0.4)
    score += ville_score
    details["ville"] = ville_score

    # ── Budget (10pts) ──
    budget_score = int(SCORING_WEIGHTS["budget"] * 0.5)
    if criteria.get("budget_max"):
        try:
            budget = float(criteria["budget_max"])
            tarifs = []
            if criteria.get("mode") == "en_ligne" and p.tarif_en_ligne:
                tarifs = [float(p.tarif_en_ligne)]
            elif criteria.get("mode") == "presentiel" and p.tarif_presentiel:
                tarifs = [float(p.tarif_presentiel)]
            else:
                tarifs = [float(t) for t in [p.tarif_en_ligne, p.tarif_presentiel] if t]
            tarif = min(tarifs) if tarifs else None
            if tarif:
                if tarif <= budget:          budget_score = SCORING_WEIGHTS["budget"]
                elif tarif <= budget * 1.15: budget_score = int(SCORING_WEIGHTS["budget"] * 0.6)
                elif tarif <= budget * 1.30: budget_score = int(SCORING_WEIGHTS["budget"] * 0.3)
                else:                        budget_score = 0
        except: pass
    score += budget_score
    details["budget"] = budget_score

    # ── Mode (5pts) ──
    mode_score = int(SCORING_WEIGHTS["mode"] * 0.5)
    if criteria.get("mode") and p.mode_enseignement:
        mr, pm = criteria["mode"].lower(), p.mode_enseignement.lower()
        if mr == pm or pm == "les_deux": mode_score = SCORING_WEIGHTS["mode"]
        else:                            mode_score = 0
    score += mode_score
    details["mode"] = mode_score

    # ── Réputation (5pts) ──
    rep = 0
    if p.note_moyenne:
        n = float(p.note_moyenne)
        if n >= 4.5:   rep = SCORING_WEIGHTS["reputation"]
        elif n >= 4.0: rep = int(SCORING_WEIGHTS["reputation"] * 0.6)
        elif n >= 3.5: rep = int(SCORING_WEIGHTS["reputation"] * 0.3)
    score += rep
    details["reputation"] = rep

    return round(score, 1), details

def get_disponibilites(prof_id, criteria, db, jours_disponible=None):
    """Récupère les dispos filtrées par mode et optionnellement par semaine."""
    q = db.query(Disponibilite).filter(
        Disponibilite.prof_id == prof_id,
        Disponibilite.actif == True,
        Disponibilite.date_specifique >= date.today(),
    )
    if jours_disponible:
        date_fin = date.today() + timedelta(days=7)
        q = q.filter(Disponibilite.date_specifique <= date_fin)
    dispos_raw = q.order_by(Disponibilite.date_specifique).limit(5).all()

    dispos = []
    for d in dispos_raw:
        if criteria.get("mode") == "en_ligne" and d.mode_seance == "presentiel": continue
        if criteria.get("mode") == "presentiel" and d.mode_seance == "en_ligne": continue
        dispos.append({
            "id": d.id, "date": str(d.date_specifique),
            "heure_debut": str(d.heure_debut)[:5] if d.heure_debut else None,
            "heure_fin":   str(d.heure_fin)[:5]   if d.heure_fin   else None,
            "mode": d.mode_seance,
            "nb_places": (d.nb_max_etudiants or 1) - (d.nb_inscrits or 0),
        })
    return dispos

def build_result(p, score, details, db, criteria, jours_disponible=None):
    tarifs = [t for t in [p.tarif_en_ligne, p.tarif_presentiel] if t and float(t) > 0]
    tarif_min = min(float(t) for t in tarifs) if tarifs else 0
    label = "Excellent" if score >= 85 else "Très bon" if score >= 70 else "Bon" if score >= 55 else "Possible"

    dispos = get_disponibilites(p.id, criteria, db, jours_disponible)

    warnings = []
    if criteria.get("mode") and p.mode_enseignement not in [criteria["mode"], "les_deux"]:
        warnings.append(f"Mode {p.mode_enseignement} uniquement")
    if criteria.get("budget_max") and tarif_min > float(criteria["budget_max"]):
        warnings.append(f"Tarif {tarif_min:.0f} DT > votre budget {criteria['budget_max']} DT")

    return {
        "id": p.id, "nom": f"{p.user.prenom} {p.user.nom}",
        "photo_url": p.photo_url, "ville": p.ville,
        "email": p.user.email,
        "telephone": p.telephone,
        "note_moyenne": float(p.note_moyenne or 0), "nb_avis": p.nb_avis or 0,
        "mode_enseignement": p.mode_enseignement,
        "tarif_en_ligne":   float(p.tarif_en_ligne or 0),
        "tarif_presentiel": float(p.tarif_presentiel or 0),
        "tarif_min": tarif_min, "bio": p.bio,
        "matieres": [], "disponibilites": dispos, "warnings": warnings,
        "score": {"total": score, "label": label, "details": details}
    }

def search_profs(matiere, criteria, db, seuil=25, jours_disponible=None):
    variations = get_variations(matiere.lower().strip())
    cat = get_cat_niveau((criteria.get("niveau") or "").lower())
    profs = db.query(Professeur).join(User).filter(
        Professeur.statut_validation == "validé"
    ).all()
    results = []
    for p in profs:
        if not p.user: continue
        s, d = score_prof(p, criteria, db, variations, cat)
        if s >= seuil:
            results.append(build_result(p, s, d, db, criteria, jours_disponible))
    # Trier par score DESC — scores différenciés garantis
    return sorted(results, key=lambda x: x["score"]["total"], reverse=True)[:3]


@router.post("/chat")
async def edu_chat(payload: dict, db: Session = Depends(get_db)):
    try:
        messages = payload.get("messages", [])
        if not messages:
            return {
                "reply": "Bonjour ! 👋 Je suis EduBot, l'assistant intelligent d'EduMatch. Je vous aide à trouver le formateur ou professeur idéal — que ce soit pour du soutien scolaire académique 🎓 ou une formation professionnelle 💼. Souhaitez-vous une formation académique ou professionnelle ?",
                "top3_profs": [], "besoin_complet": False,
                "prochain_critere": "matiere", "noProfs": False,
                "alternative": None, "criteres": {},
            }

        client = get_groq_client()

        # ── EXTRACTION CUMULATIVE ──
        conv_text = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in messages])

        criteria = {}
        if client:
            try:
                extract_prompt = f"""Lis cette conversation et extrais les critères de recherche de formateur/professeur.
Retourne UNIQUEMENT ce JSON valide (rien d'autre):
{{"domaine_type": null, "matiere": null, "niveau": null, "budget_max": null, "mode": null, "ville": null, "disponibilite_semaine": null}}

CONVERSATION:
{conv_text}

RÈGLES STRICTES — Extraire UNIQUEMENT depuis les messages USER (lignes commençant par USER:). Ignorer totalement le contenu des messages ASSISTANT. Null si l'utilisateur ne l'a pas explicitement mentionné.

domaine_type: "academique" si le message contient "academique","académique","scolaire","école","primaire","collège","lycée","bac","université","mathématiques","physique","svt","histoire","philo","maths","anglais","arabe","français" | "professionnel" si le message contient "professionnel","pro","développement web","IA","cybersécurité","marketing","comptabilité","entreprise","reconversion","formation pro","certification" | sinon null

matiere (academique): "math"/"maths" → "mathématiques" | "physique" → "physique" | "anglais" → "anglais" | "français" → "français" | "arabe" → "arabe" | "informatique"/"programmation" → "informatique" | "chimie" → "chimie" | "svt"/"biologie" → "svt" | null si non mentionné

matiere (professionnel): "dev web"/"développement web"/"web" → "développement web" | "ia"/"machine learning" → "intelligence artificielle" | "cyber"/"cybersécurité" → "cybersécurité" | "cloud"/"devops" → "cloud & devops" | "compta"/"comptabilité" → "comptabilité" | "marketing" → "marketing digital" | null si non mentionné

niveau: "primaire"/"6ème"/"5ème"/"CP"/"CM" → "primaire" | "collège"/"7ème"/"8ème"/"9ème"/"base" → "collège" | "lycée"/"bac"/"terminale"/"secondaire" → "lycée" | "université"/"licence"/"master"/"prépa" → "université" | null si non mentionné

budget_max: nombre entier — "30dt"/"30 DT"/"30" après question budget → 30 | "pas cher" → 25 | null si non mentionné

mode: extraire UNIQUEMENT depuis les messages USER (ignorer ASSISTANT) | "en ligne"/"online"/"distance" dit par USER → "en_ligne" | "présentiel"/"presentiel"/"domicile"/"chez moi" dit par USER → "presentiel" | null si USER ne l'a pas précisé

ville: ville tunisienne mentionnée par USER | null sinon (ignorer villes dans messages ASSISTANT)

disponibilite_semaine: true si "cette semaine"/"weekend"/"samedi"/"dimanche"/"lundi" mentionné | null sinon

JSON UNIQUEMENT:"""

                resp = client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[{"role": "user", "content": extract_prompt}],
                    temperature=0, max_tokens=200
                )
                raw = re.sub(r'```json|```', '', resp.choices[0].message.content.strip()).strip()
                try:
                    criteria = json.loads(raw)
                except:
                    m = re.search(r'\{[\s\S]*?\}', raw)
                    if m:
                        try: criteria = json.loads(m.group())
                        except: pass
            except Exception as e:
                print(f"Erreur extraction: {e}")

        criteria.setdefault("domaine_type", None)
        criteria.setdefault("matiere", None)
        criteria.setdefault("niveau", None)
        criteria.setdefault("budget_max", None)
        criteria.setdefault("mode", None)
        criteria.setdefault("ville", None)
        criteria.setdefault("disponibilite_semaine", None)

        # ── FALLBACK Python — scanner UNIQUEMENT les messages USER ──
        user_only_text = " ".join(
            m["content"] for m in messages if m.get("role") == "user"
        ).lower()

        # Domaine
        if not criteria.get("domaine_type"):
            kw_acad = ["academique","académique","scolaire","primaire","collège","lycée","lycee",
                       "bac","université","universite","mathématiques","physique","svt","arabe",
                       "français","francais","anglais","histoire","philosophie","informatique"]
            kw_pro  = ["professionnel","formation pro","reconversion","entreprise",
                       "développement web","dev web","cybersécurité","marketing",
                       "comptabilité","intelligence artificielle","cloud","devops"]
            if any(k in user_only_text for k in kw_acad):
                criteria["domaine_type"] = "academique"
            elif any(k in user_only_text for k in kw_pro):
                criteria["domaine_type"] = "professionnel"

        # Matière — uniquement si domaine connu
        if not criteria.get("matiere") and criteria.get("domaine_type"):
            MAT_KW = {
                "mathématiques": ["mathématiques","mathematiques","maths","math","algèbre","geometrie"],
                "physique":      ["physique","sciences physiques","physique-chimie"],
                "chimie":        ["chimie"],
                "anglais":       ["anglais","english"],
                "français":      ["français","francais"],
                "arabe":         ["arabe"],
                "svt":           ["svt","biologie","sciences naturelles"],
                "informatique":  ["informatique","programmation","python","java","algorithmique"],
                "philosophie":   ["philosophie"],
                "histoire":      ["histoire","géographie"],
                "comptabilité":  ["comptabilité","compta"],
            }
            for mat_key, kws in MAT_KW.items():
                if any(k in user_only_text for k in kws):
                    criteria["matiere"] = mat_key
                    break

        # Niveau — uniquement si matière déjà connue (évite faux positifs précoces)
        if not criteria.get("niveau") and criteria.get("matiere"):
            NIV_KW = {
                "primaire":   ["primaire","6ème","6eme","5ème","5eme","4ème","4eme","cp ","ce1","ce2","cm1","cm2","école primaire","annee primaire"],
                "college":    ["collège","college","7ème","7eme","8ème","8eme","9ème","9eme","brevet","année de base"],
                "lycee":      ["lycée","lycee","baccalauréat","baccalaureat","terminale","secondaire","1ere annee sec","2eme annee sec","4eme lettres","4eme sciences"],
                "universite": ["université","universite","licence","master","ingénieur","ingenieur","prépa","prepa","médecine"],
            }
            # "bac" peut être ambigu (baccalauréat = lycée) — traiter séparément
            last_user = messages[-1]["content"].lower() if messages else ""
            if "bac" in last_user and "bac+" not in last_user:
                criteria["niveau"] = "lycee"
            else:
                for niv_key, kws in NIV_KW.items():
                    if any(k in user_only_text for k in kws):
                        criteria["niveau"] = niv_key
                        break

        # Mode — chercher aussi dans chaque message user séparément
        if not criteria.get("mode"):
            kw_ligne = ["en ligne","online","à distance","distance","virtuel"]
            kw_pres  = ["présentiel","presentiel","domicile","chez moi","en personne"]
            if any(k in user_only_text for k in kw_ligne) and not any(k in user_only_text for k in kw_pres):
                criteria["mode"] = "en_ligne"
            elif any(k in user_only_text for k in kw_pres):
                criteria["mode"] = "presentiel"
            elif any(k in user_only_text for k in kw_ligne):
                criteria["mode"] = "en_ligne"

        # Villes
        if not criteria.get("ville"):
            for v in VILLES_DISPONIBLES:
                if v in user_only_text:
                    criteria["ville"] = v
                    break

        # Budget
        import re as _re
        if not criteria.get("budget_max"):
            m = _re.search(r'(\d{2,3})\s*(?:dt|dinar|euro)', user_only_text)
            if not m:
                m = _re.search(r'(?:budget|max|maximum)\s+(\d{2,3})', user_only_text)
            if m:
                criteria["budget_max"] = int(m.group(1))
            else:
                # Chercher un nombre isolé dans tout l'historique user (du plus récent au plus ancien)
                user_msgs = [msg for msg in messages if msg.get("role") == "user"]
                for umsg in reversed(user_msgs):
                    txt = umsg.get("content", "").strip()
                    m2 = _re.match(r'^\s*(\d{2,3})\s*$', txt)
                    if m2:
                        criteria["budget_max"] = int(m2.group(1))
                        break

        # Disponibilité semaine — détecter "oui/non" en réponse à la question filtre
        if not criteria.get("disponibilite_semaine"):
            last_user_msg = ""
            for msg in reversed(messages):
                if msg.get("role") == "user":
                    last_user_msg = msg.get("content","").lower().strip()
                    break
            kw_dispo = ["cette semaine","semaine","oui","yes","ok","d'accord","disponib",
                        "lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche",
                        "weekend","week-end","demain","aujourd"]
            kw_no_dispo = ["non","no","tous","tout","sans filtre","peu importe","pas de filtre","voir tous"]
            if any(k in last_user_msg for k in kw_dispo) and not any(k in last_user_msg for k in kw_no_dispo):
                criteria["disponibilite_semaine"] = True

        print(f"Critères après fallback: {criteria}")

        # ── ÉTAPES DE COLLECTE — dynamiques selon domaine ──
        domaine = criteria.get("domaine_type")

        if not domaine:
            # Étape 0 : choisir domaine
            ETAPES = [
                ("domaine_type", "Souhaitez-vous une formation académique 🎓 (scolaire/universitaire) ou professionnelle 💼 (reconversion/entreprise) ?"),
            ]
        elif domaine == "academique":
            ETAPES = [
                ("domaine_type", ""),  # déjà collecté
                ("matiere",    "Quelle matière cherchez-vous ? 📚 (ex: maths, physique, anglais, informatique...)"),
                ("niveau",     "Quel est le niveau scolaire ? 🎓 (primaire, collège, lycée, bac, université...)"),
                ("budget_max", "Quel est votre budget maximum par heure en DT ? 💰 (ex: 30, 40, 50...)"),
                ("mode",       "Préférez-vous les cours en ligne 🌐 ou en présentiel 🏫 ?"),
            ]
            if criteria.get("mode") == "presentiel":
                ETAPES.append(("ville", "Dans quelle ville ? 📍 (Tunis, Sfax, Sousse ou Monastir)"))
        else:
            # Professionnel — pas de niveau scolaire
            ETAPES = [
                ("domaine_type", ""),  # déjà collecté
                ("matiere",    "Quel domaine professionnel vous intéresse ? 💼 (ex: développement web, IA, cybersécurité, marketing, comptabilité...)"),
                ("budget_max", "Quel est votre budget maximum par heure en DT ? 💰 (ex: 40, 60, 80...)"),
                ("mode",       "Préférez-vous les formations en ligne 🌐 ou en présentiel 🏫 ?"),
            ]
            if criteria.get("mode") == "presentiel":
                ETAPES.append(("ville", "Dans quelle ville ? 📍 (Tunis, Sfax, Sousse ou Monastir)"))

        # Trouver ce qui manque
        manquants = []
        for key, _ in ETAPES:
            if key and not criteria.get(key):
                manquants.append(key)

        # Vérifier ville invalide si présentiel
        ville_invalide = False
        if criteria.get("mode") == "presentiel" and criteria.get("ville"):
            ville_lower = criteria["ville"].lower().strip()
            if not any(v in ville_lower for v in VILLES_DISPONIBLES):
                ville_invalide = True

        prochain = manquants[0] if manquants else None

        # ── RECHERCHE ──
        top3 = []
        alternative = None
        jours = criteria.get("disponibilite_semaine")

        if not manquants and not ville_invalide and criteria.get("matiere"):
            top3 = search_profs(criteria["matiere"], criteria, db, seuil=25, jours_disponible=jours)
            if len(top3) == 0:
                mat = criteria["matiere"].lower()
                for key, vals in VARIATIONS.items():
                    if mat in key or any(v in mat for v in vals):
                        mat = key; break
                for alt in ALTERNATIVES.get(mat, []):
                    res = search_profs(alt, criteria, db, seuil=25)
                    if res:
                        alternative = {"matiere_originale": criteria["matiere"], "matiere_alternative": alt}
                        top3 = res; break

        print(f"Manquants: {manquants} | Top: {len(top3)} | Ville invalide: {ville_invalide}")
        for p in top3:
            d = p["score"]["details"]
            print(f"  {p['nom']}: {p['score']['total']}pts | mat={d['matiere']} niv={d['niveau']} ville={d['ville']}")

        # ── GÉNÉRATION RÉPONSE NATURELLE ──
        reply = ""
        if client:
            try:
                dernier = messages[-1]["content"] if messages else ""
                criteres_ok = []
                if criteria["domaine_type"]: criteres_ok.append(f"domaine={'académique' if criteria['domaine_type']=='academique' else 'professionnel'}")
                if criteria["matiere"]:    criteres_ok.append(f"matière={criteria['matiere']}")
                if criteria["niveau"]:     criteres_ok.append(f"niveau={criteria['niveau']}")
                if criteria["budget_max"]: criteres_ok.append(f"budget={criteria['budget_max']}DT/h")
                if criteria["mode"]:       criteres_ok.append(f"mode={'en ligne' if criteria['mode']=='en_ligne' else 'présentiel'}")
                if criteria["ville"]:      criteres_ok.append(f"ville={criteria['ville']}")
                ctx = ", ".join(criteres_ok) or "rien encore"

                if ville_invalide:
                    sys_p = f"""Tu es EduBot, un assistant conversationnel chaleureux pour EduMatch Tunisie.
L'étudiant veut des cours en présentiel à "{criteria['ville']}" mais seules 4 villes sont couvertes: Tunis, Sfax, Sousse, Monastir.
Écris UN message naturel et amical qui explique que cette ville n'est pas encore disponible et propose les 4 villes OU suggère les cours en ligne.
Style: conversationnel, pas de liste numérotée, pas de "Voici les phrases". Maximum 2-3 lignes."""

                elif manquants:
                    next_key, next_q = [(k,q) for k,q in ETAPES if k == prochain][0]

                    # Cas spécial: premier message (salutation uniquement)
                    mots_salutation = ["bonjour","bonsoir","salut","hello","hi","salam","bsr"]
                    is_salutation = len(messages) <= 1 or all(
                        any(s in m["content"].lower() for s in mots_salutation)
                        for m in messages if m["role"] == "user"
                    )

                    # Construire confirmation naturelle selon ce qui vient d'être dit
                    confirm_map = {
                        "domaine_type": f"formation {'académique' if criteria['domaine_type']=='academique' else 'professionnelle'}" if criteria['domaine_type'] else "",
                        "matiere":    f"matière: {criteria['matiere']}" if criteria['matiere'] else "",
                        "niveau":     f"niveau: {criteria['niveau']}" if criteria['niveau'] else "",
                        "budget_max": f"budget: {criteria['budget_max']} DT/h" if criteria['budget_max'] else "",
                        "mode":       f"mode: {'en ligne' if criteria['mode']=='en_ligne' else 'présentiel'}" if criteria['mode'] else "",
                        "ville":      f"ville: {criteria['ville']}" if criteria['ville'] else "",
                    }
                    # Ce qui vient juste d'être confirmé = le critère AVANT le prochain manquant
                    etapes_keys = [k for k,_ in ETAPES]
                    idx_prochain = etapes_keys.index(prochain) if prochain in etapes_keys else 0
                    dernier_confirme = etapes_keys[idx_prochain - 1] if idx_prochain > 0 else None
                    confirmation = confirm_map.get(dernier_confirme, "") if dernier_confirme else ""

                    if is_salutation and not any(criteres_ok):
                        sys_p = """Tu es EduBot, l'assistant de matching d'EduMatch Tunisie.
Écris UN message de bienvenue chaleureux et professionnel en 2-3 phrases qui:
- Te présente comme assistant intelligent d'EduMatch
- Explique que tu aides à trouver le professeur ou formateur idéal
- Mentionne les 2 options: soutien académique (scolaire/universitaire) ET formations professionnelles (reconversion/entreprise)
- Termine en posant la question: académique ou professionnel ?
EXEMPLE DE TON: "Bonjour ! Je suis EduBot, votre assistant de matching pour trouver le professeur ou le formateur idéal. Nous proposons un soutien académique pour les étudiants et les universitaires, ainsi que des formations professionnelles. Souhaitez-vous une formation académique ou professionnelle ?"
RÈGLES STRICTES: même ton que l'exemple, chaleureux et professionnel, 2-3 phrases, pas de liste, pas de markdown
Réponds directement en français."""
                    else:
                        sys_p = f"""Tu es EduBot, assistant de EduMatch Tunisie.
Critères confirmés: {ctx if ctx != "rien encore" else "aucun"}
Dernier message étudiant: "{dernier}"
{f'Critère venant d\'être fourni: {confirmation}' if confirmation else ''}
Prochaine question à poser: {next_q}

INSTRUCTIONS STRICTES:
- Commence par confirmer le critère reçu avec enthousiasme: "Super, [critère] confirmé(e) !" ou "Parfait, [critère] noté !"
- Puis pose la prochaine question de façon naturelle et directe
- TON: chaleureux, professionnel, comme un conseiller éducatif
- LONGUEUR: 1-2 phrases maximum
- INTERDIT: listes numérotées, markdown, "Voici", guillemets autour du texte, phrases trop longues
- EXEMPLE BON: "Super, matière mathématiques confirmée ! Quel est le niveau scolaire ? (primaire, collège, lycée, bac, université)"
- EXEMPLE BON: "Parfait, budget 30 DT/h noté ! Préférez-vous les cours en ligne 🌐 ou en présentiel 🏫 ?"
Réponds directement en français."""

                elif len(top3) > 0:
                    mat = alternative["matiere_alternative"] if alternative else criteria["matiere"]
                    profs_avec_dispo = [p for p in top3 if p["disponibilites"]]
                    nb_avec_dispo = len(profs_avec_dispo)

                    if alternative:
                        sys_p = f"""Tu es EduBot. Aucun prof trouvé en {alternative['matiere_originale']} mais {len(top3)} prof(s) disponibles en {mat}.
Écris 1 phrase naturelle et positive qui explique la situation et propose les alternatives.
Style: amical, direct. INTERDIT: listes numérotées, "Voici les phrases"."""

                    elif not criteria.get("disponibilite_semaine") and nb_avec_dispo > 0:
                        # Annoncer résultats ET demander filtre disponibilités
                        noms_dispo = [p["nom"].split()[0] for p in profs_avec_dispo[:2]]
                        noms_tous  = [p["nom"].split()[0] for p in top3[:3]]
                        ville_str  = f"à {criteria['ville']}" if criteria.get("ville") else ""
                        noms_dispo_str = ' et '.join(noms_dispo) if noms_dispo else ''
                        sys_p = f"""Tu es EduBot, assistant chaleureux et professionnel d'EduMatch Tunisie.

Génère EXACTEMENT ce type de message (adapte les valeurs):
"Je suis ravi de vous annoncer que j'ai trouvé {len(top3)} professeurs de {mat} niveau {criteria.get('niveau','')} {ville_str} qui pourraient vous aider ! La bonne nouvelle, c'est que {nb_avec_dispo} d'entre eux ({noms_dispo_str}) ont des créneaux disponibles cette semaine. Avez-vous une préférence pour un jour en particulier ?"

RÈGLES STRICTES:
- Commence par "Je suis ravi" ou "Excellente nouvelle" ou "Bonne nouvelle"
- Mentionne le nombre de profs trouvés, la matière et la ville
- Cite les prénoms des profs avec des créneaux: {noms_dispo_str}
- Termine par une question sur les disponibilités
- 2-3 phrases maximum
- INTERDIT: listes, markdown, guillemets autour du texte"""

                    else:
                        # Résultats avec ou sans filtre dispo
                        ville_str = f"à {criteria['ville']}" if criteria.get("ville") else ""
                        dispo_str = "filtrés par disponibilité cette semaine" if criteria.get("disponibilite_semaine") else ""
                        sys_p = f"""Tu es EduBot, assistant EduMatch Tunisie.
{len(top3)} professeurs de {mat} niveau {criteria.get('niveau','')} {ville_str} trouvés {dispo_str}.
Écris 1-2 phrases enthousiastes et professionnelles pour annoncer les résultats.
Si filtré par dispo: mentionne que ce sont les profs disponibles cette semaine.
EXEMPLE: "Voici les {len(top3)} professeurs disponibles cette semaine à {criteria.get('ville','Sfax')} ! Leurs profils et créneaux sont affichés ci-dessous."
TON: chaleureux, professionnel. INTERDIT: listes numérotées."""

                else:
                    sys_p = f"""Tu es EduBot. Aucun prof trouvé pour: {ctx}.
Écris 2-3 phrases naturelles et encourageantes qui s'excusent et suggèrent d'élargir les critères.
Style: empathique, constructif. INTERDIT: listes numérotées."""

                r = client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[{"role":"system","content":sys_p},{"role":"user","content":dernier}],
                    temperature=0.3, max_tokens=120
                )
                reply = r.choices[0].message.content.strip()
            except Exception as e:
                print(f"Erreur génération: {e}")

        # Fallback
        if not reply:
            if ville_invalide:
                reply = f"La ville '{criteria['ville']}' n'est pas encore couverte. Nous sommes disponibles à Tunis, Sfax, Sousse et Monastir. Souhaitez-vous passer en cours en ligne ? 🌐"
            elif manquants:
                # Bienvenue si premier message
                user_msgs_count = sum(1 for m in messages if m.get("role") == "user")
                if user_msgs_count <= 1 and prochain == "domaine_type":
                    reply = "Bonjour ! 👋 Je suis EduBot, l'assistant intelligent d'EduMatch. Je vous aide à trouver le formateur ou professeur idéal — que ce soit pour du soutien académique 🎓 (scolaire/universitaire) ou une formation professionnelle 💼 (reconversion/entreprise). Souhaitez-vous une formation académique ou professionnelle ?"
                else:
                    etapes_dict = dict(ETAPES)
                    reply = etapes_dict.get(prochain, "Pouvez-vous préciser votre demande ?")
            elif len(top3) > 0:
                profs_dispo = [p for p in top3 if p.get("disponibilites")]
                noms = [p["nom"].split()[0] for p in top3[:3]]
                noms_dispo = [p["nom"].split()[0] for p in profs_dispo[:2]]
                ville_str = f"à {criteria['ville']}" if criteria.get("ville") else ""
                mat_str = criteria.get("matiere","")
                niv_str = criteria.get("niveau","")
                if criteria.get("disponibilite_semaine"):
                    reply = f"Voici les {len(top3)} professeurs disponibles cette semaine {ville_str} ! Leurs créneaux sont affichés sur chaque carte. 📅"
                elif profs_dispo:
                    reply = (
                        f"Je suis ravi de vous annoncer que j'ai trouvé {len(top3)} professeurs "
                        f"de {mat_str} niveau {niv_str} {ville_str} ! "
                        f"La bonne nouvelle : {len(profs_dispo)} d'entre eux "
                        f"({' et '.join(noms_dispo)}) ont des créneaux disponibles cette semaine. "
                        f"Avez-vous une préférence pour un jour en particulier ? 📅"
                    )
                else:
                    reply = (
                        f"J'ai trouvé {len(top3)} professeurs de {mat_str} {ville_str} "
                        f"qui correspondent à votre profil ! "
                        f"Consultez leurs profils ci-dessous pour les contacter directement. 🎯"
                    )
            else:
                reply = "Aucun prof trouvé. Essayez d'élargir votre budget ou changer de mode."

        return {
            "reply": reply, "top3_profs": top3,
            "besoin_complet": len(manquants) == 0 and not ville_invalide,
            "prochain_critere": prochain,
            "noProfs": len(top3) == 0 and len(manquants) == 0 and not ville_invalide,
            "alternative": alternative, "criteres": criteria,
        }

    except Exception as e:
        print(f"❌ ERREUR: {e}")
        traceback.print_exc()
        return {
            "reply": "⚠️ Erreur technique. Veuillez réessayer.",
            "top3_profs": [], "besoin_complet": False,
            "prochain_critere": None, "noProfs": False,
            "alternative": None, "criteres": {},
        }


@router.get("/prof-detail/{prof_id}")
def get_prof_detail(prof_id: int, db: Session = Depends(get_db)):
    prof = db.query(Professeur).join(User).filter(
        Professeur.id == prof_id, Professeur.statut_validation == "validé"
    ).first()
    if not prof: raise HTTPException(404, "Professeur introuvable")

    matieres = db.query(Matiere).join(
        ProfMatiereTarif, Matiere.id == ProfMatiereTarif.matiere_id
    ).filter(ProfMatiereTarif.prof_id == prof_id).all()

    dispos = db.query(Disponibilite).filter(
        Disponibilite.prof_id == prof_id, Disponibilite.actif == True,
        Disponibilite.date_specifique >= date.today()
    ).order_by(Disponibilite.date_specifique).limit(5).all()

    tarifs = [t for t in [prof.tarif_en_ligne, prof.tarif_presentiel] if t and float(t) > 0]
    tarif_min = min(float(t) for t in tarifs) if tarifs else 0

    return {
        "id": prof.id, "nom": f"{prof.user.prenom} {prof.user.nom}",
        "user_prenom": prof.user.prenom, "user_nom": prof.user.nom,
        "photo_url": prof.photo_url, "ville": prof.ville, "bio": prof.bio,
        "telephone": prof.telephone, "email": prof.user.email,
        "note_moyenne": float(prof.note_moyenne or 0), "nb_avis": prof.nb_avis or 0,
        "mode_enseignement": prof.mode_enseignement,
        "tarif_en_ligne":   float(prof.tarif_en_ligne or 0),
        "tarif_presentiel": float(prof.tarif_presentiel or 0),
        "tarif_min": tarif_min,
        "matieres": [m.nom for m in matieres],
        "tarifs_matieres": [{"nom_matiere": m.nom, "tarif": tarif_min} for m in matieres],
        "disponibilites": [{
            "id": d.id, "date": str(d.date_specifique),
            "heure_debut": str(d.heure_debut)[:5] if d.heure_debut else None,
            "heure_fin":   str(d.heure_fin)[:5]   if d.heure_fin   else None,
            "mode": d.mode_seance,
            "nb_places": (d.nb_max_etudiants or 1) - (d.nb_inscrits or 0),
        } for d in dispos],
    }