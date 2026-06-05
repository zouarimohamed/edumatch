from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import os, json, re, traceback
from datetime import date, timedelta
from app.database import get_db
from app.models import Professeur, User, ProfMatiereTarif, Matiere, Niveau
from app.models.disponibilite import Disponibilite
from groq import Groq

router = APIRouter()

SCORING_WEIGHTS = {"matiere":25,"niveau":40,"ville":15,"budget":10,"mode":5,"reputation":5}

VILLES_DISPONIBLES = ["tunis","sfax","sousse","monastir"]  # Villes avec profs réels

# Toutes les villes tunisiennes connues pour la détection dans le texte user
TOUTES_VILLES_TN = [
    "tunis","sfax","sousse","monastir","nabeul","bizerte",
    "gabes","gabès","gafsa","kairouan","beja","béja",
    "jendouba","kef","le kef","siliana","zaghouan","ariana",
    "ben arous","manouba","mahdia","sidi bouzid","kasserine",
    "medenine","médenine","tataouine","tozeur","kebili","kébili",
    "djerba","hammamet","denia","carthage","la marsa","la goulette",
]

# Mots trop génériques pour le matching description (présents dans toutes les séances)
MOTS_GENERIQUES_DESC = {
    "exercices","applications","résolution","équations","mathématiques",
    "maths","série","calcul","problèmes","cours","séance","niveau",
    "année","méthode","travaux","pratiques","sciences","formules",
    "programme","révision","correction","devoir","examen","brevet",
}

VARIATIONS = {
    "mathématiques": ["math","maths","mathématique","mathematique","algebre","géometrie","calcul"],
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
    "développement web": ["dev web","développement web","web","frontend","backend","fullstack","html","css","javascript","react","node"],
    "intelligence artificielle": ["ia","intelligence artificielle","machine learning","deep learning","data science","llm","gpt"],
    "cybersécurité": ["cybersécurité","cyber","sécurité informatique","hacking","ethical hacking","pentest","réseau"],
    "cloud & devops": ["cloud","devops","aws","docker","kubernetes","terraform","azure","ci/cd"],
}

ALTERNATIVES = {
    "anglais":["français","arabe"],"français":["arabe","anglais"],
    "arabe":["français","anglais"],"physique":["mathématiques","chimie"],
    "chimie":["physique","svt"],"svt":["chimie","physique"],
    "philosophie":["histoire"],"histoire":["philosophie"],
    "informatique":["mathématiques","développement web"],
    "développement web":["informatique","intelligence artificielle"],
}

# Sous-niveaux pour chaque catégorie
SOUS_NIVEAUX = {
    "primaire":   ["1ère année","2ème année","3ème année","4ème année","5ème année","6ème année"],
    "college":    ["7ème année","8ème année","9ème année"],
    "lycee":      ["1ère année lycée","2ème année lycée","3ème année lycée","Baccalauréat"],
    "universite": ["Licence 1","Licence 2","Licence 3","Master 1","Master 2"],
}

NIVEAUX_MAP = {
    "primaire":   {"keywords":["primaire","cp","ce","cm","annee primaire","école primaire",
                               "1ère année","2ème année","3ème année","4ème année","5ème année","6ème année",
                               "1ere annee","2eme annee","3eme annee","4eme annee","5eme annee","6eme annee"]},
    "college":    {"keywords":["college","collège","7eme","7ème","8eme","8ème","9eme","9ème","brevet","année de base"]},
    "lycee":      {"keywords":["lycee","lycée","bac","baccalaureat","baccalauréat","terminale","secondaire",
                               "1ere annee lycee","2eme annee lycee","3eme annee lycee",
                               "1ère année lycée","2ème année lycée","3ème année lycée"]},
    "universite": {"keywords":["universite","université","licence","master","ingenieur","médecine","prep","prepa"]},
}

SYSTEM_PROMPT = """Tu es EduBot, assistant intelligent d'EduMatch Tunisie 🎓
Tu aides à trouver le professeur ou formateur idéal en Tunisie.

PERSONNALITÉ : Chaleureux, empathique, moderne. Ton naturel comme un vrai assistant IA.
Tu t'exprimes toujours en français, même si l'utilisateur écrit en arabe ou en anglais.

COMPORTEMENT CONVERSATIONNEL :
- L'utilisateur peut décrire librement son besoin en un seul message
- Extrait silencieusement toutes les informations déjà présentes dans son message
- Ne redemande JAMAIS une information déjà fournie
- Pose UNE SEULE question à la fois pour compléter uniquement ce qui manque
- Si l'user dit "en ligne" → ne demande JAMAIS la ville
- Si l'user dit "offline/présentiel" → demande la ville
- Confirme naturellement ce que tu as compris avant de poser la question suivante
- Adapte ton ton selon le contexte (urgent, débutant, professionnel...)

INFORMATIONS À COLLECTER (dans l'ordre de priorité) :
1. Matière / technologie (le plus important)
2. Niveau (primaire / collège / lycée / bac / université / professionnel)
3. Sous-niveau précis si académique (ex: 3ème lycée, 7ème année, Bac...)
4. Mode → en ligne ou présentiel
5. Ville si présentiel
6. Budget (optionnel — "peu importe" accepté)
7. Créneaux / disponibilité (optionnel — "peu importe" accepté)

RÈGLES ABSOLUES :
- UNE seule question à la fois
- Jamais demander quelque chose déjà mentionné
- Réponses courtes et naturelles (max 2-3 lignes sauf résultats finaux)
- Si hors sujet → redirige gentiment
- Emojis avec modération (1-2 max par message)"""


def _score_desc_match(user_text, description):
    """Score de matching texte user ↔ description séance (trigrammes + bigrammes).
    Fonctionne pour messages courts ET longs. Seuil >=3 pour isMyNeed=True."""
    import re as _re2
    def _clean(t):
        return _re2.sub(r'[^a-zàâéèêëîïôùûüçé0-9\s]', ' ', t.lower())
    u = _clean(user_text)
    d = _clean(description)
    words = u.split()
    score = 0
    # Trigrammes (signal fort : 4pts)
    for i in range(len(words)-2):
        tg = f"{words[i]} {words[i+1]} {words[i+2]}"
        if tg in d:
            score += 4
    # Bigrammes (signal moyen : 2pts)
    for i in range(len(words)-1):
        bg = f"{words[i]} {words[i+1]}"
        if len(bg) > 5 and bg in d:
            score += 2
    # Mots très spécifiques (signal fort : 3pts)
    SPECIFIQUES = {
                   # Mathématiques académiques
                   "inconnue","algèbre","géométrie","variés","factoriser",
                   "identités","proportionnalité","quadrilatères","statistiques",
                   "intégrales","dérivées","vecteurs","probabilités","logarithme",
                   "trigonométrie","complexes","matrices","primitives","fonctions",
                   # IA / Machine Learning / Data Science
                   "régression","classification","clustering","apprentissage",
                   "supervisé","neurones","convolutif","récurrent","transformer",
                   "tensorflow","pytorch","keras","sklearn","scikit",
                   "random","forest","validation","croisée","overfitting",
                   "gradient","backpropagation","optimisation","datasets",
                   "features","embeddings","tokenisation","attention",
                   # Deep Learning
                   "cnn","rnn","lstm","gpt","llm","diffusion","génératifs",
                   "discriminateur","génération","adversarial","gans",
                   # Développement / Pro
                   "certifiant","certifiante","attestation","certification",
                   "prompting","langchain","microservices","kubernetes",
                   "docker","devops","pipeline","déploiement","scraping",
                   # Cybersécurité
                   "pentest","hacking","ethical","vulnerabilité","cryptographie",
                   "firewall","intrusion","forensique","exploitation",
                   # Cloud
                   "terraform","ansible","serverless","infrastructure","monitoring",
    }
    for w in words:
        if w in SPECIFIQUES and w in d:
            score += 3
    return min(7, score)


def get_groq_client():
    k = os.getenv("GROQ_API_KEY")
    if not k: return None
    try: return Groq(api_key=k)
    except: return None


def normalize_mode(mode_raw):
    """Normalise le mode d'enseignement vers en_ligne / presentiel / les_deux."""
    if not mode_raw:
        return None
    m = str(mode_raw).lower().strip()
    m = m.replace("é","e").replace("è","e").replace("ê","e")
    if m in ("en_ligne","enligne","online","distance","en ligne","en-ligne","internet","remote","virtuel","zoom"):
        return "en_ligne"
    if m in ("presentiel","presenciel","présentiel","domicile","offline","en personne","face a face","chez moi"):
        return "presentiel"
    if m in ("les_deux","les deux","both","hybride"):
        return "les_deux"
    return None


def get_cat_niveau(text):
    if not text: return None
    c = text.lower().replace(' ','').replace('-','').replace('é','e').replace('è','e').replace('ê','e').replace("'","")
    for cat, data in NIVEAUX_MAP.items():
        for k in data["keywords"]:
            kn = k.lower().replace(' ','').replace('é','e').replace('è','e').replace("'","")
            if kn and kn in c:
                return cat
    return None


def get_variations(mat):
    v = [mat]
    for key, vals in VARIATIONS.items():
        if mat in key or key in mat or any(x in mat for x in vals):
            v = list(set([key]+vals+[mat]))
            break
    return v


def get_prof_niveaux(p, db):
    """Retourne la liste des catégories niveau du prof (depuis BD uniquement)."""
    cats = set()
    try:
        nivs = db.query(Niveau).join(
            ProfMatiereTarif, Niveau.id == ProfMatiereTarif.niveau_id
        ).filter(ProfMatiereTarif.prof_id == p.id).distinct().all()
        for n in nivs:
            cat = get_cat_niveau(n.nom.lower())
            if cat:
                cats.add(cat)
    except: pass
    # Fallback bio uniquement si table vide
    if not cats:
        cat = get_cat_niveau((p.bio or "").lower())
        if cat:
            cats.add(cat)
    return list(cats)


def score_prof(p, criteria, db, variations, cat_demandee):
    score = 0
    details = {}
    # Matière (25)
    mat_score = 22 if prof_match_matiere(p, variations, db) else 0
    score += mat_score; details["matiere"] = mat_score
    # Niveau (35)
    domaine = criteria.get("domaine_type", "")
    if cat_demandee:
        cats = get_prof_niveaux(p, db)
        niv_score = 35 if cat_demandee in cats else 0
    elif domaine == "professionnel":
        # Domaine professionnel sans contrainte niveau → score plein
        # (pas de notion primaire/lycée/université dans le pro)
        niv_score = 35
    else:
        niv_score = 17
    score += niv_score; details["niveau"] = niv_score
    # ── Ville (15) ──
    mode_norm_s = normalize_mode(criteria.get("mode"))
    ville_score = 0
    if mode_norm_s == "en_ligne":
        ville_score = 8  # Neutre : en ligne, la ville n'est pas pertinente
    elif criteria.get("ville") and p.ville:
        vr = criteria["ville"].lower().strip()
        vp = p.ville.lower().strip()
        if vr == vp: ville_score = 13
        elif vr in vp or vp in vr: ville_score = 6
        else: ville_score = 0
    else:
        ville_score = 5  # Pas de contrainte ville
    score += ville_score; details["ville"] = ville_score

    # Budget (10)
    budget_score = 0  # 0 si pas de budget spécifié
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
                if tarif <= budget: budget_score = 9
                elif tarif <= budget*1.2: budget_score = 5
                elif tarif <= budget*1.4: budget_score = 2
                else: budget_score = 0
        except: pass
    score += budget_score; details["budget"] = budget_score
    # Mode (5)
    mode_score = 0  # 0 si pas de mode spécifié
    if criteria.get("mode") and p.mode_enseignement:
        mr,pm = criteria["mode"].lower(), p.mode_enseignement.lower()
        mode_score = 4 if (mr==pm or pm=="les_deux") else 0
    score += mode_score; details["mode"] = mode_score
    # Réputation — intégrée dans note_moyenne, affichée séparément
    # On la garde dans details pour l'affichage mais réduite pour libérer place à description
    rep = 0
    if p.note_moyenne:
        n = float(p.note_moyenne)
        if n>=4.5: rep=2
        elif n>=4.0: rep=1
        elif n>=3.5: rep=1
    score += rep; details["reputation"] = rep

    # ── Score description séance ──
    # Si le prof a une dispo dont la description matche le besoin user → bonus score
    # ── Score matching description séance (trigrammes + bigrammes) ──
    _msgs_sp    = criteria.get("_messages") or []
    # Utiliser SEULEMENT le premier message user (le plus descriptif du besoin)
    # Les messages suivants ("Tunis", "20", "novembre") créent du bruit dans le matching
    _user_msgs  = [m["content"] for m in _msgs_sp if m.get("role") == "user"]
    _user_sp    = _user_msgs[0] if _user_msgs else ""
    desc_score  = 0
    best_desc   = None
    try:
        from datetime import date as _date_sp
        import calendar as _cal_sp, re as _re_sp
        # Charger TOUTES les dispos avec description (filtre Python ensuite)
        dispos_all = db.query(Disponibilite).filter(
            Disponibilite.prof_id     == p.id,
            Disponibilite.actif       == True,
            Disponibilite.description != None,
        ).order_by(Disponibilite.date_specifique).limit(50).all()

        # Filtre mois/date EN PYTHON (plus fiable que SQL avec SQLAlchemy)
        _MOIS_MAP_SP = {
            "janvier":1,"fevrier":2,"février":2,"mars":3,"avril":4,"mai":5,"juin":6,
            "juillet":7,"aout":8,"août":8,"septembre":9,"octobre":10,
            "novembre":11,"decembre":12,"décembre":12,
        }
        _cr_sp  = criteria.get("creneaux") or ""
        _cr_str = str(_cr_sp).lower() if _cr_sp and _cr_sp is not False else ""
        _mois_cible = next((_MOIS_MAP_SP[m] for m in _MOIS_MAP_SP if m in _cr_str), None)
        _date_cible = None
        if not _mois_cible and _cr_str:
            _dm2 = _re_sp.search(r'(\d{1,2})[/\-](\d{1,2})(?:[/\-](\d{4}))?', _cr_str)
            if _dm2:
                try:
                    _j2,_mo2 = int(_dm2.group(1)), int(_dm2.group(2))
                    _a2 = int(_dm2.group(3)) if _dm2.group(3) else _date_sp.today().year
                    _date_cible = _date_sp(_a2, _mo2, _j2)
                except Exception:
                    pass

        # Sous-niveau user pour filtrer les descriptions du bon niveau
        _sous_niv_sp = (criteria.get("sous_niveau") or "").lower()
        # Extraire le numéro d'année : "8ème année" → "8"
        import re as _re_niv
        _niv_num = _re_niv.search(r'(\d+)', _sous_niv_sp)
        _niv_num = _niv_num.group(1) if _niv_num else ""

        dispos_prof = []
        for _d in dispos_all:
            try:
                _ds = _d.date_specifique
                if _mois_cible and _ds.month != _mois_cible:
                    continue  # Exclure hors du mois demandé
                if _date_cible and _ds != _date_cible:
                    continue  # Exclure hors de la date exacte
                # Filtre niveau : si la description mentionne un niveau différent → exclure
                if _niv_num and _d.description:
                    _desc_low = str(_d.description).lower()
                    # Vérifier si le niveau correct est mentionné OU si aucun niveau n'est mentionné
                    _has_wrong_level = any(
                        f"{n}ème" in _desc_low or f"{n}ème" in _desc_low
                        for n in ["7","8","9","1","2","3"]
                        if n != _niv_num and f"{n}ème" in _desc_low
                    )
                    _has_right_level = f"{_niv_num}ème" in _desc_low
                    if _has_wrong_level and not _has_right_level:
                        continue  # Description d'un autre niveau → ignorer
                dispos_prof.append(_d)
            except Exception:
                continue
        best_s = 0
        for dispo in dispos_prof:
            try:
                desc_txt = str(dispo.description) if dispo.description else ""
                s = _score_desc_match(_user_sp, desc_txt)
                if s > best_s:
                    best_s    = s
                    best_desc = desc_txt
            except Exception:
                continue
        print(f"  📊 score_desc prof={p.id} best_s={best_s} seuil=4")
        if best_s >= 4:
            desc_score = min(15, best_s * 2)
    except Exception as _eall:
        print(f"  ⚠️ desc exception: {_eall}")

    score += desc_score  # Ajoute le bonus description au score total
    details["description_score"] = desc_score
    details["best_description"]  = best_desc

    return round(score, 1), details


def prof_match_matiere(p, variations, db):
    """Match matière STRICT sur prof_matiere_tarif uniquement.
    La bio n'est plus utilisée pour éviter les faux positifs."""
    try:
        mats = db.query(Matiere).join(
            ProfMatiereTarif, Matiere.id==ProfMatiereTarif.matiere_id
        ).filter(ProfMatiereTarif.prof_id==p.id).all()
        mat_names = [m.nom.lower() for m in mats]
        if any(any(v in mn or mn in v for v in variations) for mn in mat_names):
            return True
    except:
        pass
    # PAS de fallback sur la bio → évite faux positifs (Nour "Full Stack" avec ML dans bio)
    return False


def get_niveau_ids_pour_sous_niveau(sous_niveau, db):
    """
    Retourne les IDs de niveaux BD correspondant au sous-niveau demandé.
    Ex: "Baccalauréat" → [34], "7ème année" → [28]
    """
    if not sous_niveau: return []
    sous_norm = sous_niveau.lower().replace('é','e').replace('è','e').replace('ê','e').replace("'","")
    try:
        tous_niveaux = db.query(Niveau).all()
        ids = []
        for n in tous_niveaux:
            n_norm = n.nom.lower().replace('é','e').replace('è','e').replace('ê','e').replace("'","")
            # Match exact ou partiel
            if sous_norm in n_norm or n_norm in sous_norm:
                ids.append(n.id)
        return ids
    except:
        return []


JOURS_SEMAINE = {
    "lundi": 0, "mardi": 1, "mercredi": 2, "jeudi": 3,
    "vendredi": 4, "samedi": 5, "dimanche": 6,
}
WEEKEND_DAYS = {5, 6}
SEMAINE_DAYS = {0, 1, 2, 3, 4}

def parse_creneau_filter(creneaux_str):
    """Parse la préférence de créneau → dict de filtres."""
    if not creneaux_str or creneaux_str is False:
        return {}
    filtre = {}
    text = creneaux_str.lower().strip()

    # ── Date précise JJ/MM/AAAA ou JJ/MM/AA ──
    import re as _re_d
    dm = _re_d.search(r'(?:le\s+)?(\d{1,2})[/\-](\d{1,2})(?:[/\-](\d{2,4}))?', text)
    if dm:
        try:
            j, mo = int(dm.group(1)), int(dm.group(2))
            a_raw = dm.group(3)
            if a_raw:
                a = int(a_raw) if len(a_raw) == 4 else 2000 + int(a_raw)
            else:
                a = date.today().year
                if date(a, mo, j) < date.today():
                    a += 1
            d_obj = date(a, mo, j)
            filtre["date_exacte"] = d_obj
            filtre["date_str"]    = d_obj.strftime("%d/%m/%Y")
            return filtre
        except Exception:
            pass

    # Aujourd'hui / demain
    if "aujourd" in text or "today" in text:
        filtre["date_exacte"] = date.today()
        filtre["date_str"]    = date.today().strftime("%d/%m/%Y")
        return filtre
    if "demain" in text:
        d_demain = date.today() + timedelta(days=1)
        filtre["date_exacte"] = d_demain
        filtre["date_str"]    = d_demain.strftime("%d/%m/%Y")
        return filtre

    # Week-end / semaine
    if "week-end" in text or "weekend" in text:
        filtre["jours_semaine"] = WEEKEND_DAYS
    elif "semaine" in text and "week" not in text:
        filtre["jours_semaine"] = SEMAINE_DAYS
    else:
        jours = set()
        for nom, idx in JOURS_SEMAINE.items():
            if nom in text:
                jours.add(idx)
        if jours:
            filtre["jours_semaine"] = jours

    # Période
    if "matin" in text:
        filtre["periode"] = "matin"
    elif "soir" in text or "nuit" in text:
        filtre["periode"] = "soir"
    elif "apres-midi" in text or "après-midi" in text or "apres midi" in text:
        filtre["periode"] = "apres-midi"

    # ── Mois nommés → filtrer par mois ──
    MOIS_MAP = {
        "janvier":1,"fevrier":2,"février":2,"mars":3,"avril":4,"mai":5,"juin":6,
        "juillet":7,"aout":8,"août":8,"septembre":9,"octobre":10,
        "novembre":11,"decembre":12,"décembre":12,
    }
    for nom_mois, num_mois in MOIS_MAP.items():
        if nom_mois in text:
            filtre["mois"] = num_mois
            filtre["mois_nom"] = nom_mois
            break

    return filtre


def dispo_match_creneau_dict(row, filtre):
    """Filtre créneau sur un dict (pas un objet ORM)."""
    if not filtre:
        return True
    if "date_exacte" in filtre:
        try:
            from datetime import datetime
            d_row = row.get("date_obj") or (
                datetime.strptime(row["date"], "%Y-%m-%d").date()
                if row.get("date") else None
            )
            return d_row == filtre["date_exacte"]
        except Exception:
            return True
    if "mois" in filtre:
        try:
            from datetime import datetime
            d_row = row.get("date_obj") or datetime.strptime(row["date"], "%Y-%m-%d").date()
            if d_row.month != filtre["mois"]:
                return False
        except Exception:
            pass
    if "jours_semaine" in filtre:
        try:
            from datetime import datetime
            d_row = row.get("date_obj") or datetime.strptime(row["date"], "%Y-%m-%d").date()
            if d_row.weekday() not in filtre["jours_semaine"]:
                return False
        except Exception:
            pass
    if "periode" in filtre and row.get("heure_debut"):
        try:
            h = int(row["heure_debut"].split(":")[0])
            if filtre["periode"] == "matin"      and not (5  <= h < 12): return False
            if filtre["periode"] == "apres-midi" and not (12 <= h < 18): return False
            if filtre["periode"] == "soir"       and not (18 <= h < 24): return False
        except Exception:
            pass
    return True


def dispo_match_creneau(d, filtre):
    """True si la dispo correspond au filtre créneau."""
    if not filtre:
        return True
    if "date_exacte" in filtre:
        return d.date_specifique == filtre["date_exacte"]
    # Filtre par mois nommé (ex: "novembre" → mois=11)
    if "mois" in filtre:
        if d.date_specifique.month != filtre["mois"]:
            return False
    if "jours_semaine" in filtre:
        if d.date_specifique.weekday() not in filtre["jours_semaine"]:
            return False
    if "periode" in filtre and d.heure_debut:
        h = d.heure_debut.hour
        if filtre["periode"] == "matin"      and not (5  <= h < 12): return False
        if filtre["periode"] == "apres-midi" and not (12 <= h < 18): return False
        if filtre["periode"] == "soir"       and not (18 <= h < 24): return False
    return True


def get_disponibilites(prof_id, criteria, db, jours=None):
    """Récupère les dispos d'un prof avec filtrage créneau. Robuste contre les erreurs SQL."""
    try:
        import calendar as _cal
        creneaux       = criteria.get("creneaux")
        creneau_filtre = parse_creneau_filter(creneaux) if (creneaux and creneaux is not False) else {}
        mode_req       = normalize_mode(criteria.get("mode"))

        # ── Construire la requête selon le type de filtre créneau ──
        if creneau_filtre.get("mois"):
            mois_num = creneau_filtre["mois"]
            annee    = date.today().year
            if mois_num < date.today().month:
                annee += 1
            dernier_jour   = _cal.monthrange(annee, mois_num)[1]
            date_debut_mois = date(annee, mois_num, 1)
            date_fin_mois   = date(annee, mois_num, dernier_jour)
            q = db.query(Disponibilite).filter(
                Disponibilite.prof_id         == prof_id,
                Disponibilite.actif           == True,
                Disponibilite.date_specifique >= date_debut_mois,
                Disponibilite.date_specifique <= date_fin_mois,
            )
        elif creneau_filtre.get("date_exacte"):
            d_exacte = creneau_filtre["date_exacte"]
            q = db.query(Disponibilite).filter(
                Disponibilite.prof_id         == prof_id,
                Disponibilite.actif           == True,
                Disponibilite.date_specifique == d_exacte,
            )
        else:
            q = db.query(Disponibilite).filter(
                Disponibilite.prof_id         == prof_id,
                Disponibilite.actif           == True,
                Disponibilite.date_specifique >= date.today(),
            )
            if jours:
                q = q.filter(Disponibilite.date_specifique <= date.today() + timedelta(days=7))

        # Filtre sous-niveau (avec protection)
        try:
            sous_niveau = criteria.get("sous_niveau")
            if sous_niveau:
                niveau_ids = get_niveau_ids_pour_sous_niveau(sous_niveau, db)
                if niveau_ids:
                    q = q.filter(
                        (Disponibilite.niveau_id.in_(niveau_ids)) |
                        (Disponibilite.niveau_id.is_(None))
                    )
        except Exception as e_niv:
            print(f"  ⚠️ Filtre sous-niveau ignoré: {e_niv}")

        raw = q.order_by(Disponibilite.date_specifique).limit(30).all()

        # ── Extraire les données PENDANT que la session est encore ouverte ──
        rows = []
        for d in raw:
            try:
                rows.append({
                    "id":          d.id,
                    "date_obj":    d.date_specifique,
                    "date":        str(d.date_specifique),
                    "heure_debut": str(d.heure_debut)[:5] if d.heure_debut else None,
                    "heure_fin":   str(d.heure_fin)[:5]   if d.heure_fin   else None,
                    "mode":        str(d.mode_seance or ""),
                    "nb_places":   (d.nb_max_etudiants or 1) - (d.nb_inscrits or 0),
                    "description": str(d.description) if d.description else None,
                })
            except Exception as e_row:
                print(f"  ⚠️ Lecture dispo {getattr(d,'id','?')}: {e_row}")
                continue

        # ── Filtrer et construire la liste finale ──
        dispos = []
        for row in rows:
            if row["nb_places"] <= 0:
                continue
            if mode_req == "en_ligne"   and row["mode"] == "presentiel": continue
            # Mode différent toléré — prof affiché avec avertissement
            if creneau_filtre and not dispo_match_creneau_dict(row, creneau_filtre): continue
            # Score matching description pour CE créneau (trigrammes + bigrammes)
            _msgs_cr    = criteria.get("_messages") or []
            _user_cr    = " ".join(m["content"] for m in _msgs_cr if m.get("role")=="user")
            desc_text   = row.get("description") or ""
            match_count = _score_desc_match(_user_cr, desc_text) if (_user_cr and desc_text) else 0
            row_final = {k: v for k, v in row.items() if k != "date_obj"}
            row_final["description_match_score"] = match_count  # nb de mots-clés matchés
            dispos.append(row_final)
            if len(dispos) >= 5:
                break

        # ── Fallback date exacte : prochains créneaux si rien ce jour ──
        if not dispos and creneau_filtre.get("date_exacte"):
            q2 = db.query(Disponibilite).filter(
                Disponibilite.prof_id         == prof_id,
                Disponibilite.actif           == True,
                Disponibilite.date_specifique >= date.today(),
            ).order_by(Disponibilite.date_specifique).limit(30).all()
            rows2 = []
            for d in q2:
                try:
                    rows2.append({
                        "id":          d.id,
                        "date":        str(d.date_specifique),
                        "heure_debut": str(d.heure_debut)[:5] if d.heure_debut else None,
                        "heure_fin":   str(d.heure_fin)[:5]   if d.heure_fin   else None,
                        "mode":        str(d.mode_seance or ""),
                        "nb_places":   (d.nb_max_etudiants or 1) - (d.nb_inscrits or 0),
                        "description": str(d.description) if d.description else None,
                        "hors_date":   True,
                    })
                except Exception:
                    continue
            for row in rows2:
                if row["nb_places"] <= 0: continue
                if mode_req == "en_ligne"   and row["mode"] == "presentiel": continue
                # Mode différent toléré — prof affiché avec avertissement
                dispos.append(row)
                if len(dispos) >= 5: break

        # ── Trier par pertinence description : créneau matchant en premier ──
        mots_cles = criteria.get("mots_cles_besoin") or []
        if dispos:
            dispos.sort(
                key=lambda x: (
                    x.get("description_match_score", 0),  # match desc besoin en premier
                    # puis par date
                ),
                reverse=True
            )

        return dispos

    except Exception as e_global:
        print(f"  ❌ get_disponibilites prof {prof_id}: {e_global}")
        import traceback as _tb; _tb.print_exc()
        return []


def build_result(p, score, details, db, criteria, jours=None):
    """Construit le dict résultat prof — accède aux relations ORM dans la session."""
    # ── Lire TOUTES les colonnes ORM pendant que la session est active ──
    try:
        prenom     = p.user.prenom     if p.user else "—"
        nom_u      = p.user.nom        if p.user else "—"
        email_u    = p.user.email      if p.user else ""
    except Exception:
        prenom = nom_u = "—"; email_u = ""
    try:
        prof_id        = p.id
        photo_url      = p.photo_url
        ville          = p.ville
        telephone      = p.telephone
        note_moyenne   = float(p.note_moyenne or 0)
        nb_avis        = p.nb_avis or 0
        mode_ens       = p.mode_enseignement
        tarif_en_ligne = float(p.tarif_en_ligne  or 0)
        tarif_pres     = float(p.tarif_presentiel or 0)
        bio            = p.bio
    except Exception:
        prof_id = p.id; photo_url = None; ville = None; telephone = None
        note_moyenne = 0.0; nb_avis = 0; mode_ens = None
        tarif_en_ligne = tarif_pres = 0.0; bio = None

    tarif_min = min(t for t in [tarif_en_ligne, tarif_pres] if t > 0) if any(t > 0 for t in [tarif_en_ligne, tarif_pres]) else 0
    score_display = min(100, round(score, 1))  # score max 100
    label = "Excellent" if score_display>=85 else "Très bon" if score_display>=70 else "Bon" if score_display>=55 else "Possible"

    # ── Dispos ──
    try:
        dispos = get_disponibilites(prof_id, criteria, db, jours)
    except Exception as _e_d:
        print(f"⚠️ get_disponibilites: {_e_d}"); dispos = []

    # ── Warnings ──
    warnings = []
    mode_norm_b = normalize_mode(criteria.get("mode"))
    mode_ens_n  = normalize_mode(mode_ens)
    if mode_norm_b and mode_ens_n and mode_ens_n != "les_deux" and mode_ens_n != mode_norm_b:
        warnings.append(f"Mode {mode_ens} uniquement")
    if criteria.get("budget_max") and criteria.get("budget_max") != -1 and tarif_min > float(criteria["budget_max"]):
        warnings.append(f"Tarif {tarif_min:.0f} DT > votre budget {criteria['budget_max']} DT")
    ville_demandee = criteria.get("ville")
    if mode_norm_b == "presentiel" and ville_demandee and ville:
        if ville_demandee.lower().strip() not in ville.lower():
            warnings.append(f"Professeur à {ville} (vous avez demandé {ville_demandee})")

    # ── Tarifs matières ──
    try:
        tms = db.query(ProfMatiereTarif).filter(ProfMatiereTarif.prof_id == prof_id).all()
        matieres_list = []
        for tm in tms:
            try:
                mn  = tm.matiere.nom  if tm.matiere else "—"
                nn  = tm.niveau.nom   if tm.niveau  else "—"
                tar = float(tm.tarif) if tm.tarif   else 0
                matieres_list.append({"nom_matiere": mn, "nom_niveau": nn, "tarif": tar})
            except Exception:
                continue
    except Exception:
        matieres_list = []

    desc_score  = details.get("description_score", 0)
    best_desc   = details.get("best_description")

    return {
        "id":               prof_id,
        "nom":              f"{prenom} {nom_u}",
        "user_prenom":      prenom,
        "user_nom":         nom_u,
        "photo_url":        photo_url,
        "ville":            ville,
        "email":            email_u,
        "telephone":        telephone,
        "note_moyenne":     note_moyenne,
        "nb_avis":          nb_avis,
        "mode_enseignement":mode_ens,
        "tarif_en_ligne":   tarif_en_ligne,
        "tarif_presentiel": tarif_pres,
        "tarif_min":        tarif_min,
        "bio":              bio,
        "matieres":         [],
        "tarifs_matieres":  matieres_list,
        "disponibilites":   dispos,
        "warnings":         warnings,
        "has_disponibilites": len(dispos) > 0,
        "description_match": any(d.get("description") for d in dispos if d.get("description")),
        "seance_match":      best_desc if desc_score > 0 else None,  # description matchée
        "description_score": desc_score,       # score 0-15 du matching description
        "score":            {"total": score_display, "label": label, "details": details},
    }


def search_profs(matiere, criteria, db, seuil=20, jours=None):
    variations  = get_variations(matiere.lower().strip())
    # CRITIQUE : utiliser directement criteria["niveau"], pas get_cat_niveau()
    cat_demandee = criteria.get("niveau")

    from sqlalchemy.orm import joinedload as _jlsp
    query = db.query(Professeur).join(User).options(
        _jlsp(Professeur.user)  # Eager load pour éviter DetachedInstanceError
    ).filter(
        Professeur.statut_validation=="validé"
    )
    # Optimisation : filtre SQL direct sur ville si présentiel
    if criteria.get("ville") and criteria.get("mode") == "presentiel":
        query = query.filter(
            Professeur.ville.ilike(f"%{criteria['ville']}%")
        )
    profs = query.all()

    print(f"\n🔎 Recherche: matière={matiere!r} niveau={cat_demandee!r} mode={criteria.get('mode')!r} ville={criteria.get('ville')!r} budget={criteria.get('budget_max')!r}")

    results = []
    for p in profs:
        if not p.user: continue

        # FILTRE 1 : NIVEAU STRICT + SOUS-NIVEAU
        if cat_demandee:
            cats_prof = get_prof_niveaux(p, db)
            if cat_demandee not in cats_prof:
                print(f"  ❌ {p.user.prenom} {p.user.nom} — niveau {cats_prof} ≠ {cat_demandee}")
                continue
            # Filtre sous-niveau (ex: Baccalauréat, 7ème année...)
            sous_niv = criteria.get("sous_niveau")
            if sous_niv:
                niv_ids = get_niveau_ids_pour_sous_niveau(sous_niv, db)
                if niv_ids:
                    has_match = db.query(ProfMatiereTarif).filter(
                        ProfMatiereTarif.prof_id == p.id,
                        ProfMatiereTarif.niveau_id.in_(niv_ids)
                    ).first()
                    if not has_match:
                        print(f"  ❌ {p.user.prenom} {p.user.nom} — sous-niveau {sous_niv!r} absent")
                        continue

        # FILTRE 2 : MATIÈRE
        if not prof_match_matiere(p, variations, db):
            print(f"  ❌ {p.user.prenom} {p.user.nom} — matière ne correspond pas")
            continue

        # FILTRE 3 : MODE — on n'exclut pas les profs d'un autre mode
        # Ils sont inclus mais pénalisés dans le score (mode_score=0)
        # Cela permet d'afficher des alternatives en ligne si présentiel demandé
        if criteria.get("mode") and p.mode_enseignement:
            mu, mp = criteria["mode"].lower(), p.mode_enseignement.lower()
            if mp != "les_deux" and mp != mu:
                print(f"  ⚠️ {p.user.prenom} {p.user.nom} — mode {mp} ≠ {mu} (inclus avec pénalité)")
                # Ne pas exclure — mode_score=0 dans score_prof

        # SCORING
        try:
            s, d = score_prof(p, criteria, db, variations, cat_demandee)
            nom_p = f"{p.user.prenom} {p.user.nom}"  # force chargement user
            print(f"  ✅ {nom_p} — score={s}")
            if s >= seuil:
                results.append(build_result(p, s, d, db, criteria, jours))
        except Exception as _eb:
            print(f"  ⚠️ skip prof: {_eb}")
            continue

    return sorted(
        results,
        key=lambda x: (
            x["score"]["total"],                              # 1. score total (capé 100, Maram=100 si desc match)
            x.get("description_score", 0),                   # 2. desc_score (différencie si score=100)
            1 if x.get("disponibilites") else 0,             # 3. profs avec dispos
        ),
        reverse=True
    )[:3]


# ══════════════════════════════════════════════════════════
# EXTRACTION CUMULATIVE DES CRITÈRES
# ══════════════════════════════════════════════════════════
def extract_all_criteria(messages):
    """
    Extrait les critères depuis TOUS les messages user.
    Retourne un dict complet avec toutes les valeurs trouvées.
    """
    user_text = " ".join(m["content"] for m in messages if m.get("role")=="user").lower()
    c = {}

    # Domaine
    kw_acad = ["academique","académique","scolaire","primaire","collège","college","lycée","lycee",
               "bac","université","universite","mathématiques","physique","svt","arabe",
               "français","francais","anglais","histoire","philosophie","informatique"]
    kw_pro  = ["professionnel","reconversion","entreprise","développement web","dev web",
               "cybersécurité","marketing","comptabilité","intelligence artificielle","cloud","devops","docker","aws"]
    if any(k in user_text for k in kw_pro):
        c["domaine_type"] = "professionnel"
    elif any(k in user_text for k in kw_acad):
        c["domaine_type"] = "academique"

    # Matière
    MAT_KW = {
        "mathématiques": ["mathématiques","mathematiques","maths","math","algèbre","calcul","fractions"],
        "physique":      ["physique","sciences physiques"],
        "chimie":        ["chimie"],
        "anglais":       ["anglais","english"],
        "français":      ["français","francais"],
        "arabe":         ["arabe"],
        "svt":           ["svt","biologie","sciences naturelles"],
        "informatique":  ["informatique","programmation","python","java","algorithmique"],
        "philosophie":   ["philosophie","philo"],
        "histoire":      ["histoire","géographie"],
        "développement web": ["dev web","développement web","html","css","javascript","react","node","frontend","backend","fullstack"],
        "intelligence artificielle": ["intelligence artificielle","ia","machine learning","deep learning","llm","gpt"],
        "cybersécurité": ["cybersécurité","cyber","hacking","pentest","ethical hacking"],
        "cloud & devops": ["cloud","devops","aws","docker","kubernetes","terraform","azure"],
    }
    for mat, kws in MAT_KW.items():
        if any(k in user_text for k in kws):
            c["matiere"] = mat
            break

    # Niveau général (catégorie)
    NIV_KW = {
        "primaire":   ["primaire","école primaire","6ème","6eme","5ème","5eme","4ème","4eme",
                       "3ème","3eme","2ème","2eme","1ère","1ere","cp","ce1","ce2","cm1","cm2"],
        "college":    ["collège","college","7ème","7eme","8ème","8eme","9ème","9eme","brevet","année de base"],
        "lycee":      ["lycée","lycee","baccalauréat","baccalaureat","terminale","secondaire"],
        "universite": ["université","universite","licence","master","ingénieur","ingenieur","prépa","prepa","médecine"],
    }
    # "bac" seul = lycée — uniquement si niveau pas encore connu
    last_user = (messages[-1]["content"] if messages else "").lower()
    if "bac" in last_user and "bac+" not in last_user:
        if not c.get("niveau"):
            c["niveau"] = "lycee"
    # Toujours chercher dans NIV_KW pour confirmer/préciser
    if not c.get("niveau"):
        for niv, kws in NIV_KW.items():
            if any(k in user_text for k in kws):
                c["niveau"] = niv
                break

    # Sous-niveau PRÉCIS (ex: 7ème année, 1ère année lycée, Baccalauréat...)
    # IMPORTANT : on ne met sous_niveau que si l'utilisateur a EXPLICITEMENT précisé
    # "bac" seul ne suffit pas — le bot doit poser la question de sous-niveau d'abord
    SOUS_NIV_KW = {
        # Primaire — keywords très spécifiques
        "1ère année primaire":  ["1ère année primaire","1ere annee primaire","premiere annee primaire"],
        "2ème année primaire":  ["2ème année primaire","2eme annee primaire","deuxième année primaire"],
        "3ème année primaire":  ["3ème année primaire","3eme annee primaire","troisième année primaire"],
        "4ème année primaire":  ["4ème année primaire","4eme annee primaire","quatrième année primaire","4ème primaire","4eme primaire"],
        "5ème année primaire":  ["5ème année primaire","5eme annee primaire","cinquième année primaire","5ème primaire"],
        "6ème année primaire":  ["6ème année primaire","6eme annee primaire","sixième année primaire","6ème primaire"],
        # Collège
        "7ème année":  ["7ème","7eme","septième année"],
        "8ème année":  ["8ème","8eme","huitième année"],
        "9ème année":  ["9ème","9eme","neuvième année"],
        # Lycée — keywords PRÉCIS avec contexte lycée (variantes courtes incluses)
        "1ère année lycée": [
            "1ère année lycée","1ere annee lycee","première année lycée","1ère secondaire","première secondaire",
            "1er lycée","1er lycee","premiere lycee","1ère lycée","1ere lycee",
            "1 lycee","1 lycée","1ere","premiere annee lycee","1st lycee",
        ],
        "2ème année lycée": [
            "2ème année lycée","2eme annee lycee","deuxième année lycée","2ème secondaire",
            "2eme lycee","2ème lycée","2 lycee","2 lycée","deuxieme lycee",
        ],
        "3ème année lycée": [
            "3ème année lycée","3eme annee lycee","troisième année lycée","3ème secondaire",
            "3eme lycee","3ème lycée","3 lycee","3 lycée","troisieme lycee",
        ],
        # Baccalauréat — toutes les variantes avec et sans accent
        "Baccalauréat": [
            "baccalauréat","baccalaureat","baccalaureat","bac ","bac$",
            "terminale","terminal","bac final","classe terminale",
        ],
    }
    # Normaliser pour comparer sans accent
    def norm(t): return t.lower().replace('é','e').replace('è','e').replace('ê','e').replace('à','a').replace("'","").strip()

    # "bac" seul → sous_niveau seulement si niveau=lycee déjà défini (réponse à question sous-niveau)
    # Sinon juste niveau=lycee
    bac_in_last = any(k in norm(last_user) for k in ["bac","baccalaureat","terminale"])
    niveau_lycee_defini = c.get("niveau") == "lycee"
    if bac_in_last and niveau_lycee_defini:
        c["sous_niveau"] = "Baccalauréat"
    else:
        # Chercher sous-niveau dans SOUS_NIV_KW avec normalisation
        for sous_niv, kws in SOUS_NIV_KW.items():
            if any(norm(k) in norm(user_text) for k in kws):
                c["sous_niveau"] = sous_niv
                break

    # Mode
    kw_ligne = ["en ligne","online","à distance","distance","virtuel","zoom","teams","internet","remote","en-ligne","enligne"]
    kw_pres  = ["présentiel","presentiel","domicile","chez moi","en personne","face à face"]

    # ── MODE : basé sur les 3 derniers messages user UNIQUEMENT ──
    # JAMAIS depuis user_text complet (évite que "présentiel" ancien écrase "en ligne" récent)
    msgs_u_mode = [m["content"].lower() for m in messages if m.get("role") == "user"]
    recent_3_mode = msgs_u_mode[-3:]  # 3 derniers msgs user
    recent_text_mode = " ".join(recent_3_mode)

    if any(k in recent_text_mode for k in kw_ligne) and not any(k in recent_text_mode for k in kw_pres):
        c["mode"] = "en_ligne"
    elif any(k in recent_text_mode for k in kw_pres) and not any(k in recent_text_mode for k in kw_ligne):
        c["mode"] = "presentiel"
    # Si conflit (les deux présents) ou rien → ne pas extraire (Groq prime)

    # ── VILLE : dernier message user uniquement ──
    mode_detecte = c.get("mode") or ""
    if mode_detecte == "en_ligne" or any(k in last_user for k in kw_ligne):
        c["ville"] = None  # En ligne → jamais de ville
    else:
        # Chercher dans le dernier message si la question ville était posée
        msgs_list_v = list(messages)
        last_asst_v = next((m["content"].lower() for m in reversed(msgs_list_v)
                            if m.get("role") == "assistant"), "")
        question_ville_posee = any(k in last_asst_v for k in
                                   ["quelle ville","dans quelle ville","ville ?","tunis","sfax"])
        # Chercher d'abord dans TOUTES_VILLES_TN (villes connues)
        ville_trouvee = None
        for v in TOUTES_VILLES_TN:
            if v in last_user:
                ville_trouvee = v
                break
        if ville_trouvee:
            c["ville"] = ville_trouvee
        elif question_ville_posee and last_user.strip() and len(last_user.strip()) >= 3:
            # L'user a tapé quelque chose qui n'est pas une ville connue
            # → stocker comme ville inconnue pour déclencher le message "non couverte"
            mots_exclus_v = {"oui","non","ok","je","tu","il","sais","pas","peu","importe"}
            mot = last_user.strip().split()[0] if last_user.strip() else ""
            if mot and mot not in mots_exclus_v and not any(k in last_user for k in kw_pres+kw_ligne):
                c["ville"] = last_user.strip()  # Ville inconnue → sera rejetée par check_ville

        # Budget
    m = re.search(r'(\d{2,3})\s*(?:dt|dinar|dinars|euro)', user_text)
    if not m:
        m = re.search(r'(?:budget|max|maximum|pas plus de|moins de|seulement)\s*(\d{2,3})', user_text)
    if m:
        c["budget_max"] = int(m.group(1))
    else:
        for msg in reversed(messages):
            if msg.get("role")=="user":
                txt = msg["content"].strip()
                m2  = re.match(r'^\s*(\d{2,3})\s*$', txt)
                if m2:
                    c["budget_max"] = int(m2.group(1))
                    break

    # Disponibilité semaine
    kw_dispo = ["cette semaine","semaine","lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche","weekend","week-end","demain","aujourd"]
    if any(k in last_user for k in kw_dispo):
        c["disponibilite_semaine"] = True

    # ── EXTRACTION CRÉNEAUX ──────────────────────────────────────────────
    # Détecter si la question créneaux vient d'être posée (dernier message assistant)
    msgs_list_cr = list(messages)
    last_asst_cr = next((m["content"].lower() for m in reversed(msgs_list_cr)
                         if m.get("role") == "assistant"), "")
    question_creneau_posee = any(k in last_asst_cr for k in [
        "préférence de créneau", "preference de creneau",
        "créneau", "creneau", "disponibilité", "disponibilite",
        "quelle heure", "quel jour", "lundi matin", "week-end"
    ])

    kw_pas_pref_cr = [
        "peu importe","n importe","n'importe","pas de preference","pas de préférence",
        "flexible","disponible","quand vous","quand tu","indifferent","indifférent",
        "skip","passer","non","non merci","aucune preference","aucune préférence",
        "pas vraiment","pas de créneau","n importe quand","nimporte quand"
    ]
    jours_noms_cr  = ["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"]
    moments_cr     = ["matin","apres-midi","après-midi","apres midi","soir","nuit",
                      "journee","journée","weekend","week-end","semaine",
                      "janvier","fevrier","février","mars","avril","mai","juin",
                      "juillet","aout","août","septembre","octobre","novembre","decembre","décembre"]
    kw_dispo_cr    = ["aujourd","demain","cette semaine","prochaine semaine"]

    # ── Détection proactive de créneau dans TOUT le message user ──
    # (date, mois, jour) même si la question créneau n'a pas encore été posée
    import re as _re
    date_pattern = _re.search(r'(?:le\s+)?(\d{1,2})[/\-](\d{1,2})(?:[/\-](\d{2,4}))?', last_user)

    MOIS_LETTRES = {
        "janvier":1,"fevrier":2,"février":2,"mars":3,"avril":4,"mai":5,"juin":6,
        "juillet":7,"aout":8,"août":8,"septembre":9,"octobre":10,
        "novembre":11,"decembre":12,"décembre":12,
    }
    if not c.get("creneaux"):
        # 1. Date au format JJ/MM/AAAA
        if date_pattern:
            try:
                from datetime import date as _date_cls
                jour_d = int(date_pattern.group(1))
                mois_d = int(date_pattern.group(2))
                annee_d = date_pattern.group(3) or "2026"
                if len(annee_d) == 2: annee_d = "20" + annee_d
                d_obj = _date_cls(int(annee_d), mois_d, jour_d)
                c["creneaux"] = f"le {d_obj.strftime('%d/%m/%Y')}"
                c["disponibilite_semaine"] = True
            except Exception:
                pass
        # 2. Date en lettres : "le 5 novembre 2026", "5 novembre", "le 5 nov."
        if not c.get("creneaux"):
            mois_pattern_str = "|".join(MOIS_LETTRES.keys())
            _pat = "(?:le\\s+)?(\\d{1,2})\\s+(" + mois_pattern_str + ")(?:\\s+(\\d{4}))?"
            date_lettre = _re.search(_pat, last_user)
            if date_lettre:
                try:
                    from datetime import date as _date_cls
                    jour_d  = int(date_lettre.group(1))
                    mois_d  = MOIS_LETTRES[date_lettre.group(2)]
                    annee_d = int(date_lettre.group(3)) if date_lettre.group(3) else _date_cls.today().year
                    d_obj   = _date_cls(annee_d, mois_d, jour_d)
                    c["creneaux"] = date_lettre.group(2)  # mois → afficher tous les créneaux du mois
                    c["disponibilite_semaine"] = True
                except Exception:
                    pass
        # 3. Mois seul : "en novembre", "pour novembre"
        # ⚠️ FIX: word boundary  pour éviter faux positif "mai" dans "primaire"
        _cr_val = c.get("creneaux") or ""
        _is_date_exacte = _cr_val.startswith("le ") and "/" in _cr_val
        if not _is_date_exacte:  # Ne pas écraser une date exacte deja extraite
            import re as _re_mois
            for mois_nom, mois_num in MOIS_LETTRES.items():
                if _re_mois.search(r'\b' + mois_nom + r'\b', user_text):
                    if not _is_date_exacte:
                        c["creneaux"] = mois_nom
                    break
        # 4. Jour nommé ou période
        if not c.get("creneaux"):
            jours_trouves   = [j for j in jours_noms_cr if j in last_user]
            moments_trouves = [m for m in ["matin","soir","après-midi","apres-midi"] if m in last_user]
            if jours_trouves or moments_trouves:
                c["creneaux"] = " ".join(jours_trouves + moments_trouves).strip()
                c["disponibilite_semaine"] = True

    if question_creneau_posee:
        if any(k in last_user for k in kw_pas_pref_cr):
            c["creneaux"] = False  # Réponse valide : pas de préférence
        elif date_pattern:
            # L'user a donné une date avec mois en chiffres (JJ/MM/AAAA)
            # → extraire le MOIS pour afficher tous les créneaux du mois
            jour, mois_num = date_pattern.group(1), date_pattern.group(2)
            annee = date_pattern.group(3) or "2026"
            if len(annee) == 2:
                annee = "20" + annee
            MOIS_NOMS = {1:"janvier",2:"fevrier",3:"mars",4:"avril",5:"mai",
                         6:"juin",7:"juillet",8:"aout",9:"septembre",
                         10:"octobre",11:"novembre",12:"decembre"}
            try:
                mois_nom = MOIS_NOMS.get(int(mois_num), "novembre")
                c["creneaux"] = mois_nom  # → afficher tous les créneaux du mois
                c["disponibilite_semaine"] = True
            except Exception:
                c["creneaux"] = last_user.strip()
        elif any(k in last_user for k in jours_noms_cr + moments_cr + kw_dispo_cr):
            jours_trouves   = [j for j in jours_noms_cr if j in last_user]
            moments_trouves = [m for m in moments_cr    if m in last_user]
            kw_trouves      = [k for k in kw_dispo_cr   if k in last_user]
            desc = " ".join(jours_trouves + moments_trouves + kw_trouves).strip()
            if desc:
                c["creneaux"] = desc
                c["disponibilite_semaine"] = True
        elif last_user and len(last_user.strip()) >= 2:
            # Réponse courte non reconnue → stocker telle quelle (ex: "18h", "après 20h")
            c["creneaux"] = last_user.strip()

    # Difficultés / objectifs / style
    if any(k in user_text for k in ["faible","difficultés","problème","nul","comprend pas","peur","bloqué","retard"]):
        c["difficultes"] = "Élève en difficulté — accompagnement personnalisé"
    if any(k in user_text for k in ["examen","bac","brevet","concours","réussir","améliorer","préparer"]):
        c["objectifs"] = "Préparation examen / amélioration des résultats"

    # ── Extraction mots-clés du besoin pour matching sémantique avec descriptions ──
    # Extraire les termes spécifiques mentionnés par l'user (chapitres, méthodes...)
    mots_exclus_desc = {"je","tu","il","elle","nous","vous","ils","mon","ma","mes",
                        "le","la","les","un","une","des","et","ou","de","du","en",
                        "cherche","veux","besoin","cours","prof","professeur","soutien",
                        "lacunes","problèmes","aide","trouver","apprendre","préfère",
                        "bonjour","surtout","ainsi","liés","cette","séance"}
    # Extraire les mots significatifs du message user (longueur > 4, pas dans exclusions)
    mots_significatifs = []
    for word in user_text.split():
        w = re.sub(r'[^a-zàâéèêëîïôùûüç]', '', word.lower())
        if len(w) > 4 and w not in mots_exclus_desc:
            mots_significatifs.append(w)
    if mots_significatifs:
        c["mots_cles_besoin"] = list(dict.fromkeys(mots_significatifs))[:15]
    for style, kws in {"patient":["patient","doux","calme"],"strict":["strict","rigoureux","exigeant"],"interactif":["interactif","dynamique","ludique","motivant"]}.items():
        if any(k in user_text for k in kws):
            c["style_souhaite"] = style
            break

    return c


def detect_last_change(messages, criteria_avant):
    """
    Lit UNIQUEMENT le dernier message user et détecte ce qui change.
    Retourne un dict des overrides à appliquer.
    """
    if not messages: return {}
    last = next((m["content"].lower().strip() for m in reversed(messages) if m.get("role")=="user"), "")
    overrides = {}

    # ── MODE ──
    kw_enligne = ["en ligne","online","à distance","virtuel","je veux en ligne",
                  "plutôt en ligne","finalement en ligne","change en ligne",
                  "passer en ligne","mode en ligne","j ai changé","changé mon avis"]
    kw_pres    = ["présentiel","presentiel","domicile","chez moi","en personne",
                  "plutôt presentiel","finalement presentiel"]
    if ("en ligne" in last or any(k in last for k in kw_enligne)) and criteria_avant.get("mode") != "en_ligne":
        overrides["mode"] = "en_ligne"
        overrides["ville"] = None
    elif any(k in last for k in kw_pres) and criteria_avant.get("mode") != "presentiel":
        overrides["mode"] = "presentiel"

    # ── BUDGET — détecter dans le dernier message ──
    m = re.search(r'(\d{2,3})\s*(?:dt|dinar|dinars|d\b|euros?)?', last)
    budget_kw = ["max","budget","dt","dinar","d ","par heure","€","euro","moins","seulement","veux","souhaite"]
    if m and any(k in last for k in budget_kw):
        val = int(m.group(1))
        if 5 <= val <= 300:
            overrides["budget_max"] = val

    # ── MATIÈRE ──
    MAT_KW = {
        "mathématiques": ["maths","math","mathématiques","mathematiques"],
        "physique":      ["physique"],
        "français":      ["français","francais"],
        "arabe":         ["arabe"],
        "anglais":       ["anglais"],
        "informatique":  ["informatique","programmation"],
    }
    chg_kw = ["change","changer","plutôt","finalement","veux","préfère","prefere","maintenant"]
    for mat, kws in MAT_KW.items():
        if any(k in last for k in kws) and any(c in last for c in chg_kw) and criteria_avant.get("matiere") != mat:
            overrides["matiere"] = mat
            break

    # ── NIVEAU ──
    niv_kw = {"lycee":["lycée","lycee","terminale"],"college":["collège","college","7ème","8ème","9ème"],"primaire":["primaire"],"universite":["université","universite","licence","master"]}
    for niv, kws in niv_kw.items():
        if any(k in last for k in kws) and any(c in last for c in chg_kw) and criteria_avant.get("niveau") != niv:
            overrides["niveau"] = niv
            break

    # ── VILLE ──
    for v in VILLES_DISPONIBLES:
        if v in last and any(c in last for c in chg_kw+["à","a "]) and criteria_avant.get("ville") != v:
            overrides["ville"] = v
            break

    return overrides


def get_manquants(criteria):
    """Retourne les critères encore manquants dans l'ordre."""
    domaine = criteria.get("domaine_type")
    if not domaine:
        return ["domaine_type"]
    missing = []
    if not criteria.get("matiere"):
        missing.append("matiere")
    if domaine == "academique":
        if not criteria.get("niveau"):
            missing.append("niveau")
        elif not criteria.get("sous_niveau"):
            missing.append("sous_niveau")
    if not criteria.get("mode"):
        missing.append("mode")
    if criteria.get("mode") == "presentiel" and not criteria.get("ville"):
        missing.append("ville")
    # Budget : optionnel mais posé une seule fois
    bv = criteria.get("budget_max")
    if not missing and bv is None:
        missing.append("budget_max")
    # Créneaux : posé après le budget, avant de lancer la recherche
    # None = jamais répondu, False = "peu importe" (réponse valide)
    if not missing and criteria.get("creneaux") is None:
        missing.append("creneaux")
    return missing


def message_aucun_resultat(criteria, overrides):
    """Génère un message clair et utile quand aucun prof n'est trouvé."""
    mat   = criteria.get("matiere","—").capitalize()
    niv   = criteria.get("sous_niveau") or criteria.get("niveau","—")
    mode  = "en ligne 🌐" if criteria.get("mode")=="en_ligne" else "présentiel 🏫"
    ville = (criteria.get("ville") or "").capitalize()
    budget = criteria.get("budget_max")

    # Identifier la cause principale
    if "budget_max" in overrides and budget:
        return (
            f"⚠️ Aucun professeur de {mat} ({niv}) en {mode} ne propose des cours "
            f"à **{budget} DT/h** ou moins.\n\n"
            f"Les professeurs disponibles pour ce profil débutent à **25 DT/h**. "
            f"Que souhaitez-vous faire ?\n"
            f"• Augmenter votre budget (ex: 30 DT/h) ?\n"
            f"• Voir les professeurs disponibles sans limite de budget ?"
        )
    elif "mode" in overrides:
        mode_label = "en ligne 🌐" if criteria.get("mode")=="en_ligne" else "présentiel 🏫"
        return (
            f"Je vois que vous préférez maintenant les cours **{mode_label}**.\n\n"
            f"⚠️ Malheureusement, aucun professeur de {mat} ({niv}) n'est disponible "
            f"en **{mode_label}** pour l'instant.\n\n"
            f"Souhaitez-vous :\n"
            f"• Revenir à l'autre mode ?\n"
            f"• Voir tous les professeurs disponibles quel que soit le mode ?"
        )
    elif criteria.get("ville"):
        return (
            f"⚠️ Aucun professeur de {mat} ({niv}) en {mode} trouvé **à {ville}**.\n\n"
            f"Nous avons des professeurs disponibles dans d'autres villes. "
            f"Souhaitez-vous :\n"
            f"• Essayer une autre ville (Tunis, Sousse, Monastir) ?\n"
            f"• Passer aux cours en ligne (plus de choix) ?"
        )
    else:
        return (
            f"⚠️ Aucun professeur de {mat} ({niv}) en {mode} ne correspond "
            f"exactement à votre profil pour l'instant.\n\n"
            f"Souhaitez-vous que j'élargisse la recherche :\n"
            f"• Sans contrainte de mode ?\n"
            f"• Avec un budget plus flexible ?\n"
            f"• Dans une autre ville ?"
        )


def generer_profil_ideal(criteria):
    mat      = criteria.get("matiere","—").capitalize()
    niv      = criteria.get("sous_niveau") or (criteria.get("niveau","—").capitalize())
    mode_n   = normalize_mode(criteria.get("mode"))
    mode     = "en ligne 🌐" if mode_n=="en_ligne" else "présentiel 🏫" if mode_n else ""
    ville    = (criteria.get("ville") or "").capitalize()
    budget   = f"{criteria['budget_max']} DT" if criteria.get('budget_max') else None
    cr       = criteria.get("creneaux")

    # ── Construire une phrase de résumé naturelle et professionnelle ──
    parties = []

    # Matière + niveau
    if mat and niv and niv != "—":
        parties.append(f"**{mat}** — niveau **{niv}**")
    elif mat:
        parties.append(f"**{mat}**")

    # Mode + ville
    if mode_n == "presentiel" and ville:
        parties.append(f"cours **{mode}** à **{ville}**")
    elif mode_n == "en_ligne":
        parties.append(f"cours **{mode}**")
    elif mode:
        parties.append(mode)

    # Budget
    if budget:
        parties.append(f"budget **{budget}/séance**")

    # Créneau
    if cr and cr is not False:
        parties.append(f"disponible **{cr}**")

    # Contexte (difficultés, objectifs)
    contexte = ""
    if criteria.get("difficultes"):
        contexte = " — élève en difficulté, accompagnement personnalisé souhaité"
    elif criteria.get("objectifs"):
        contexte = f" — objectif : {criteria['objectifs'].lower()}"

    resume = ", ".join(parties) + contexte if parties else "votre besoin"

    return (
        f"✅ **{resume}**\n"
        f"\n🔍 Recherche du meilleur profil en cours..."
    )

def check_ville_disponible(criteria, db):
    """
    Vérifie si des profs existent réellement dans la ville demandée
    pour la matière et le niveau souhaités.
    Retourne None si OK, ou un dict {reply, ville_manquante} si pas de profs.
    """
    ville = criteria.get("ville")
    mode_norm = normalize_mode(criteria.get("mode"))
    if not ville or mode_norm != "presentiel":
        return None

    matiere = criteria.get("matiere", "")
    if not matiere:
        return None

    variations = get_variations(matiere.lower().strip())
    cat_demandee = criteria.get("niveau")

    # Chercher un prof qui correspond ET est dans cette ville
    from sqlalchemy.orm import joinedload as _jl2
    profs_ville = db.query(Professeur).join(User).options(
        _jl2(Professeur.user)
    ).filter(
        Professeur.statut_validation == "validé",
        Professeur.ville.ilike(f"%{ville}%")
    ).all()

    prof_match = False
    for p in profs_ville:
        if not p.user: continue
        if not prof_match_matiere(p, variations, db): continue
        if cat_demandee and cat_demandee not in get_prof_niveaux(p, db): continue
        prof_match = True
        break

    if prof_match:
        return None  # Tout va bien, des profs existent

    # Aucun prof dans cette ville → chercher les villes alternatives
    mat = matiere.capitalize()
    niv = criteria.get("sous_niveau") or criteria.get("niveau", "")

    villes_alternatives = set()
    tous_profs = db.query(Professeur).join(User).filter(
        Professeur.statut_validation == "validé",
        Professeur.ville != None,
    ).all()
    for p in tous_profs:
        if not p.user or not p.ville: continue
        if not prof_match_matiere(p, variations, db): continue
        if cat_demandee and cat_demandee not in get_prof_niveaux(p, db): continue
        villes_alternatives.add(p.ville.strip().capitalize())

    if villes_alternatives:
        villes_str = ", ".join(sorted(villes_alternatives)[:5])
        reply = (
            f"⚠️ Je n'ai trouvé aucun professeur de **{mat}** ({niv}) "
            f"à **{ville.capitalize()}** pour l'instant.\n\n"
            f"Nous avons des professeurs disponibles à : **{villes_str}**.\n\n"
            f"Que préférez-vous ?\n"
            f"• Choisir une de ces villes ?\n"
            f"• Passer aux cours **en ligne** 🌐 (plus de choix)"
        )
    else:
        reply = (
            f"⚠️ Je n'ai trouvé aucun professeur de **{mat}** ({niv}) "
            f"à **{ville.capitalize()}** pour l'instant.\n\n"
            f"Souhaitez-vous passer aux cours **en ligne** 🌐 ?"
        )

    return {"reply": reply, "ville_manquante": True}


@router.post("/chat")
async def edu_chat(payload: dict, db: Session = Depends(get_db)):
    try:
        messages = payload.get("messages", [])

        if not messages:
            return {
                "reply": (
                    "Bonjour ! Je suis **EduBot**, votre assistant de matching EduMatch Tunisie.\n\n"
                    "Je vous aide à trouver le professeur ou formateur idéal, rapidement et gratuitement.\n\n"
                    "🎓 **Soutien académique** — Primaire, collège, lycée, université\n"
                    "💼 **Formation professionnelle** — Dev web, IA, cloud, reconversion\n\n"
                    "Décrivez librement votre besoin : matière, niveau, ville, budget..."
                ),
                "top3_profs":[],"besoin_complet":False,
                "prochain_critere":None,"noProfs":False,
                "alternative":None,"criteres":{},
            }

        client = get_groq_client()

        # ── DÉTECTION RESET ────────────────────────────────────────────────
        last_raw = messages[-1]["content"].strip() if messages else ""
        last_low = last_raw.lower()
        kw_reset = ["recommencer","restart","reset","nouvelle recherche","nouveau","repartir",
                    "effacer","annuler tout","tout réinitialiser","changer tout","autre recherche"]
        if any(k in last_low for k in kw_reset):
            return {
                "reply": (
                    "🔄 Parfait, on repart de zéro !\n\n"
                    "Souhaitez-vous une formation **académique** 🎓 "
                    "(soutien scolaire, lycée, bac...) "
                    "ou **professionnelle** 💼 (dev web, IA, reconversion...) ?"
                ),
                "top3_profs":[],"besoin_complet":False,
                "prochain_critere":"domaine_type","noProfs":False,
                "alternative":None,"criteres":{},
            }

        # ── DÉTECTION LANGUE ARABE ──────────────────────────────────────────
        # Compter les caractères arabes dans le dernier message
        arabic_chars = sum(1 for c in last_raw if "؀" <= c <= "ۿ")
        is_arabic = arabic_chars > len(last_raw) * 0.3  # > 30% caractères arabes
        if is_arabic:
            # Traduire l'intention via Groq mais répondre en français
            if client:
                try:
                    r_ar = client.chat.completions.create(
                        model="llama-3.1-8b-instant",
                        messages=[{
                            "role": "user",
                            "content": (
                                f"L\'utilisateur a écrit en arabe : \"{last_raw}\"\n"
                                "Traduis UNIQUEMENT son intention en une phrase française courte et naturelle.\n"
                                "Exemple: Je cherche un prof de maths pour le lycee\n"
                                "Reponds en francais uniquement, sans explication."
                            )
                        }],
                        temperature=0, max_tokens=60
                    )
                    intention_fr = r_ar.choices[0].message.content.strip()
                    # Injecter la traduction comme si l'user avait écrit en français
                    messages = messages[:-1] + [{"role":"user","content":intention_fr}]
                    last_raw = intention_fr
                    last_low = intention_fr.lower()
                except Exception:
                    pass  # Continuer avec le texte arabe

        # ── DÉTECTION QUESTION HORS SUJET ──────────────────────────────────
        kw_hors_sujet = [
            "météo","football","recette","cuisine","film","série","musique",
            "politique","blague","joke","boite de nuit","restaurant","hotel",
            "acheter","vendre","immobilier","voiture","médecin","hôpital",
            "sport","résultat match"
        ]
        if any(k in last_low for k in kw_hors_sujet) and len(messages) > 1:
            return {
                "reply": (
                    "😊 Je suis EduBot, spécialisé dans la recherche de professeurs et formateurs.\n\n"
                    "Je ne peux pas vous aider sur ce sujet, mais je serais ravi de vous trouver "
                    "le formateur idéal ! 🎓\n\n"
                    "Souhaitez-vous chercher un **professeur académique** ou une **formation professionnelle** ?"
                ),
                "top3_profs":[],"besoin_complet":False,
                "prochain_critere":"domaine_type","noProfs":False,
                "alternative":None,"criteres":{},
            }

        # ── ÉTAPE 1 : Extraction Groq ──
        criteria = {}
        if client:
            try:
                conv_text = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in messages])
                extract_prompt = f"""Analyse la conversation et extrais tous les critères déjà mentionnés par l'USER.
Réponds UNIQUEMENT en JSON valide, sans markdown.

FORMAT : {{"domaine_type":null,"matiere":null,"niveau":null,"sous_niveau":null,"budget_max":null,"mode":null,"ville":null,"creneaux":null,"difficultes":null,"objectifs":null,"style_souhaite":null}}

CONVERSATION :
{conv_text}

RÈGLES (messages USER uniquement) :

domaine_type :
  "academique" → maths, physique, arabe, français, anglais, SVT, lycée, bac, primaire, collège, école
  "professionnel" → python, java, react, dev web, IA, cloud, devops, reconversion, entreprise, cybersécurité
  null si non mentionné ou ambigu

matiere : matière ou techno mentionnée
  "python"/"java" → "informatique" | "react"/"html"/"js" → "développement web"
  "maths" → "mathématiques" | garder la techno exacte si pro (Python, React, Docker...)

niveau : "primaire"|"college"|"lycee"|"universite"|null
  "bac" seul = "lycee" | "7ème/8ème/9ème" = "college" | "1ère à 6ème" = "primaire"

sous_niveau : uniquement si l'user précise EXPLICITEMENT
  "bac" → "Baccalauréat" | "7ème" → "7ème année" | "licence 2" → "Licence 2"
  "lycée" seul → null (trop général)

mode : "en_ligne" si online/zoom/distance | "presentiel" si offline/domicile/en personne | null

ville : ville tunisienne mentionnée uniquement | null

creneaux : description si mentionné (ex: "matin", "samedi", "14/10/2026", "soir") | null

budget_max : entier si mentionné ("30 DT", "max 50", "budget 40") | null

difficultes : résumé si mentionné | null
objectifs : objectif mentionné | null
style_souhaite : "patient"|"strict"|"interactif"|null

JSON:"""
                resp = client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[{"role":"user","content":extract_prompt}],
                    temperature=0, max_tokens=300
                )
                raw = re.sub(r'```json|```','',resp.choices[0].message.content.strip()).strip()
                try: criteria = json.loads(raw)
                except:
                    m = re.search(r'\{[\s\S]*?\}', raw)
                    if m:
                        try: criteria = json.loads(m.group())
                        except: pass
            except Exception as e:
                print(f"Erreur extraction Groq: {e}")

        # ── ÉTAPE 2 : Compléter avec Python ──
        py_c = extract_all_criteria(messages)
        # ── Fusion intelligente : Groq prime pour mode/ville, Python prime pour matière/niveau ──
        # mode et ville changent souvent en cours de conversation → Groq (qui voit tout) est plus fiable
        # matière, niveau, sous_niveau → Python (regex strict) est plus fiable
        PYTHON_PRIME = {"matiere", "niveau", "sous_niveau", "budget_max", "domaine_type"}
        # ── Détecter le MODE depuis les 5 derniers messages user ──
        # Plus fiable que Groq qui peut voir "présentiel" dans l'historique complet
        kw_ligne_m = ["en ligne","online","à distance","virtuel","zoom","internet","enligne","en-ligne"]
        kw_pres_m  = ["présentiel","presentiel","domicile","chez moi","en personne"]
        msgs_users_recent = [m["content"].lower() for m in messages if m.get("role")=="user"][-5:]
        mode_from_recent = None
        # Parcourir du plus récent au plus ancien
        for msg_r in reversed(msgs_users_recent):
            has_ligne = any(k in msg_r for k in kw_ligne_m)
            has_pres  = any(k in msg_r for k in kw_pres_m)
            if has_ligne and not has_pres:
                mode_from_recent = "en_ligne"
                break
            elif has_pres and not has_ligne:
                mode_from_recent = "presentiel"
                break

        for k, v in py_c.items():
            if v is not None and v is not False:
                if k in PYTHON_PRIME:
                    criteria[k] = v
                else:
                    if not criteria.get(k):
                        criteria[k] = v
            elif v is False and k == "creneaux":
                criteria[k] = v

        # ── Le mode récent prime sur tout (Groq ET Python) ──
        if mode_from_recent:
            criteria["mode"] = mode_from_recent
            print(f"  → Mode forcé depuis msgs récents: {mode_from_recent}")
        for k in ["domaine_type","matiere","niveau","sous_niveau","budget_max","mode","ville",
                  "disponibilite_semaine","difficultes","objectifs","style_souhaite","mots_cles_besoin"]:
            criteria.setdefault(k, None)

        # ── Normaliser mode et effacer ville si en_ligne ──
        if criteria.get("mode"):
            criteria["mode"] = normalize_mode(criteria["mode"])
        if criteria.get("mode") == "en_ligne":
            criteria["ville"] = None  # En ligne → jamais de contrainte ville
        elif criteria.get("mode") == "presentiel" and not criteria.get("ville"):
            # Récupérer la ville depuis l'historique si elle avait été saisie
            for msg in reversed(messages):
                if msg.get("role") == "user":
                    txt = msg["content"].lower().strip()
                    for v in VILLES_DISPONIBLES:
                        if v in txt:
                            criteria["ville"] = v
                            break
                    if criteria.get("ville"):
                        break

        # ── ÉTAPE 3 : Override dernier message ──
        criteria_avant = dict(criteria)
        overrides = detect_last_change(messages, criteria_avant)
        has_change = bool(overrides)
        if has_change:
            print(f"🔄 Override: {overrides}")
            for k, v in overrides.items():
                criteria[k] = v

        # Passer les messages dans criteria pour le scoring description
        criteria["_messages"] = messages

        # ── Garantie : mode=en_ligne → ville=None TOUJOURS ──
        if normalize_mode(criteria.get("mode")) == "en_ligne":
            criteria["ville"] = None

        # ── ÉTAPE 4 : Recalculer manquants ──
        manquants = get_manquants(criteria)

        # Ville invalide (donnée mais hors VILLES_DISPONIBLES)
        ville_invalide = False
        ville_hors_couverture = False
        if criteria.get("mode") == "presentiel" and criteria.get("ville"):
            ville_lower = criteria["ville"].lower().strip()
            if not any(v == ville_lower or v in ville_lower for v in VILLES_DISPONIBLES):
                ville_invalide = True
                ville_hors_couverture = True

        prochain = manquants[0] if manquants else None
        besoin_complet = not manquants and not ville_invalide

        print(f"Critères: {criteria}")
        print(f"Manquants: {manquants} | Override: {overrides}")

        # ── Vérifier ville SEULEMENT si elle vient d'être saisie ──
        # (éviter de revérifier à chaque message si la ville est déjà validée)
        last_asst_msg = next(
            (m["content"].lower() for m in reversed(messages) if m.get("role") == "assistant"),
            ""
        )
        ville_vient_detre_saisie = any(k in last_asst_msg for k in [
            "quelle ville", "dans quelle ville", "ville ?", "tunis", "sfax", "sousse", "monastir",
            "non couverte", "ne couvre pas", "choisir une", "passer aux cours en ligne"
        ])

        if normalize_mode(criteria.get("mode")) == "presentiel" and criteria.get("ville") and ville_vient_detre_saisie:
            ville_v = criteria["ville"].lower().strip()

            # Cas 1 : ville hors couverture connue (gabes, kairouan, etc.)
            if ville_hors_couverture:
                mat = (criteria.get("matiere") or "").capitalize()
                niv = criteria.get("sous_niveau") or criteria.get("niveau","")
                villes_str = ", ".join(v.capitalize() for v in VILLES_DISPONIBLES)
                return {
                    "reply": (
                        f"😕 Je ne couvre pas encore **{(criteria.get('ville') or '').capitalize()}**.\n\n"
                        f"EduMatch est actuellement disponible à : **{villes_str}**.\n\n"
                        "Que préférez-vous ?\n"
                        "• Choisir une de ces villes ?\n"
                        "• Passer aux cours **en ligne** 🌐 (accès à tous les professeurs)"
                    ),
                    "top3_profs": [],
                    "besoin_complet": False,
                    "prochain_critere": "ville",
                    "noProfs": False,
                    "alternative": None,
                    "criteres": criteria,
                }

            # Cas 2 : ville couverte mais sans profs pour ce besoin
            if criteria.get("matiere"):
                ville_check = check_ville_disponible(criteria, db)
                if ville_check:
                    return {
                        "reply": ville_check["reply"],
                        "top3_profs": [],
                        "besoin_complet": False,
                        "prochain_critere": "ville",
                        "noProfs": False,
                        "alternative": None,
                        "criteres": criteria,
                    }

        # ── ÉTAPE 5 : Recherche ──
        top3 = []
        alternative = None
        jours = criteria.get("disponibilite_semaine")

        if besoin_complet and criteria.get("matiere"):
            try:
                top3 = search_profs(criteria["matiere"], criteria, db, jours=jours)
            except Exception as _e_s:
                print(f"⚠️ search_profs: {_e_s}")
                import traceback as _tb3; _tb3.print_exc()
                top3 = []
            mode_norm_fb = normalize_mode(criteria.get("mode"))

            if not top3 and mode_norm_fb == "en_ligne":
                try:
                    c2 = {**criteria, "creneaux": False}
                    top3 = search_profs(criteria["matiere"], c2, db, jours=jours)
                    if not top3:
                        c2 = {**criteria, "budget_max": None, "creneaux": False}
                        top3 = search_profs(criteria["matiere"], c2, db, jours=jours)
                    if not top3:
                        c2 = {**criteria, "mode": None, "ville": None, "budget_max": None, "creneaux": False}
                        top3 = search_profs(criteria["matiere"], c2, db, jours=jours)
                        if top3:
                            for p in top3:
                                if normalize_mode(p.get("mode_enseignement")) != "en_ligne":
                                    p.setdefault("warnings", [])
                                    p["warnings"].insert(0, "ℹ️ Ce professeur enseigne en présentiel — contactez-le pour convenir d'une séance en ligne")
                except Exception as _e_fb:
                    print(f"⚠️ Fallback en_ligne: {_e_fb}")

            if not top3 and mode_norm_fb != "en_ligne":
                # Fallback 1 : même matière+niveau, sans mode/ville
                print("Fallback 1: élargir mode/ville...")
                c2 = {**criteria,"mode":None,"ville":None}
                top3 = search_profs(criteria["matiere"], c2, db, jours=jours)

            if not top3:
                # Fallback 2 : matière alternative
                print("Fallback 2: alternatives matière...")
                mat = criteria["matiere"].lower()
                for key, vals in VARIATIONS.items():
                    if mat in key or any(v in mat for v in vals):
                        mat = key; break
                for alt in ALTERNATIVES.get(mat,[]):
                    res = search_profs(alt, criteria, db)
                    if res:
                        alternative = {"matiere_originale":criteria["matiere"],"matiere_alternative":alt}
                        top3 = res; break

        print(f"Résultats: {len(top3)} profs")

        # ── ÉTAPE 6 : Générer la réponse ──
        QUESTIONS = {
            "domaine_type": "Souhaitez-vous une formation **académique** 🎓 (soutien scolaire, lycée, bac...) ou **professionnelle** 💼 (dev web, IA, cloud, reconversion...) ?",
            "matiere":      "Quelle matière cherchez-vous ? 📚\n_(ex: maths, physique, arabe, français, développement web, IA...)_",
            "niveau":       "Quel est le niveau scolaire ? 🎓\n_(primaire, collège, lycée/bac, université...)_",
            "sous_niveau":  None,  # généré dynamiquement
            "mode":         "Préférez-vous les cours **en ligne** 🌐 ou **en présentiel** 🏫 ?",
            "ville":        "Dans quelle ville êtes-vous ? 📍\n_(Tunis, Sfax, Sousse, Monastir)_",
            "budget_max":   "Quel est votre budget maximum pour une séance ? 💰\n_(en DT, ex: 30, 50, 80... ou tapez 'peu importe')_",
            "creneaux":     "Avez-vous une préférence de créneau ? 📅\n_(tapez 'peu importe' si pas de préférence)_",
        }

        # Question sous-niveau dynamique
        if prochain == "sous_niveau" and criteria.get("niveau"):
            niv = criteria["niveau"]
            opts = SOUS_NIVEAUX.get(niv, [])
            opts_str = ", ".join(opts)
            QUESTIONS["sous_niveau"] = f"Quel niveau précisément ? 🎓\n_({opts_str})_"

        reply = ""

        # ── CAS : Changement de critère avec 0 résultat ──
        if has_change and besoin_complet and not top3 and not alternative:
            reply = message_aucun_resultat(criteria, overrides)

        # ── CAS : Changement de critère avec résultats ──
        # Ne PAS répéter le profil — juste confirmer le changement
        elif has_change and top3:
            change_labels = []
            if "mode" in overrides:
                mode_label = "en ligne 🌐" if overrides["mode"]=="en_ligne" else "présentiel 🏫"
                change_labels.append(f"mode {mode_label}")
            if "budget_max" in overrides:
                change_labels.append(f"budget max {overrides['budget_max']} DT/h")
            if "matiere" in overrides:
                change_labels.append(f"matière → {overrides['matiere']}")
            if "ville" in overrides and overrides["ville"]:
                change_labels.append(f"ville → {overrides['ville']}")
            change_str = " et ".join(change_labels) if change_labels else "critère modifié"

            # Utiliser le même résumé intelligent que pour la première recherche
            try:
                resumes_profs_c = []
                medals_c = ["🥇","🥈","🥉"]
                for idx_c, p_c in enumerate(top3):
                    prenom_c  = p_c["nom"].split()[0]
                    dispos_c  = p_c.get("disponibilites", [])
                    mode_c    = p_c.get("mode_enseignement", "")
                    warnings_c = p_c.get("warnings", [])
                    has_warn_mode = any("ligne" in w.lower() or "mode" in w.lower() for w in warnings_c)
                    dispo_c = next((d for d in dispos_c if not d.get("hors_date")), dispos_c[0] if dispos_c else None)
                    if dispo_c:
                        from datetime import datetime as _dttc
                        try:
                            d_c = _dttc.strptime(dispo_c["date"], "%Y-%m-%d")
                            MOIS_FR_C = ["jan","fév","mar","avr","mai","juin","juil","aoû","sep","oct","nov","déc"]
                            date_c = f"{d_c.day} {MOIS_FR_C[d_c.month-1]}."
                        except: date_c = dispo_c.get("date","")
                        mode_lbl_c = "en ligne 🌐" if "en_ligne" in (mode_c or "") else "présentiel 🏫"
                        if idx_c == 0:
                            desc_c = dispo_c.get("description","")
                            theme_c = desc_c.split(".")[1].strip()[:80] if len(desc_c.split(".")) > 1 else ""
                            if theme_c: resumes_profs_c.append(f"**{prenom_c}** est le meilleur match avec une séance disponible le {date_c} sur {theme_c.lower()}")
                            else: resumes_profs_c.append(f"**{prenom_c}** est le meilleur match avec un créneau le {date_c} {mode_lbl_c}")
                        elif has_warn_mode:
                            resumes_profs_c.append(f"**{prenom_c}** propose le même cours {mode_lbl_c} le {date_c}")
                        else:
                            resumes_profs_c.append(f"**{prenom_c}** est disponible le {date_c} {mode_lbl_c}")
                    else:
                        resumes_profs_c.append(f"**{prenom_c}** — à contacter directement")
                reply = "🎯 **" + str(len(top3)) + " professeurs trouvés** — " + ". ".join(resumes_profs_c) + "."
            except Exception as _ec:
                print(f"⚠️ résumé has_change: {_ec}")
                reply = f"🎯 {len(top3)} professeur(s) trouvé(s) !"

        # ── CAS : Ville invalide ──
        elif ville_invalide:
            if client:
                r = client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[{"role":"system","content":SYSTEM_PROMPT},
                               {"role":"user","content":f"Ville '{criteria['ville']}' non couverte. Villes dispo: Tunis, Sfax, Sousse, Monastir. Écris 2 phrases empathiques qui expliquent et proposent les villes ou cours en ligne. INTERDIT: listes."}],
                    temperature=0.3, max_tokens=100
                )
                reply = r.choices[0].message.content.strip()
            if not reply:
                reply = f"La ville **{criteria['ville']}** n'est pas encore couverte. Nous proposons des cours à Tunis, Sfax, Sousse et Monastir. Ou souhaitez-vous passer en cours en ligne ? 🌐"

        # ── CAS : Questions manquantes ──
        elif manquants:
            next_q = QUESTIONS.get(prochain)
            if client:
                user_msgs_count = sum(1 for m in messages if m.get("role")=="user")
                dernier = messages[-1]["content"] if messages else ""
                mots_salut = ["bonjour","bonsoir","salut","hello","hi","salam"]
                # is_salut : message très court de salutation
                is_salut = (user_msgs_count <= 1
                            and any(s in dernier.lower() for s in mots_salut)
                            and len(dernier.split()) <= 4)
                # is_premier : premier message substantiel (pas une salutation)
                is_premier = user_msgs_count <= 1 and not is_salut

                criteres_ok = []
                if criteria["domaine_type"]: criteres_ok.append(f"domaine={'académique' if criteria['domaine_type']=='academique' else 'professionnel'}")
                if criteria["matiere"]:      criteres_ok.append(f"matière={criteria['matiere']}")
                if criteria["niveau"]:       criteres_ok.append(f"niveau={criteria['niveau']}")
                if criteria["sous_niveau"]:  criteres_ok.append(f"sous-niveau={criteria['sous_niveau']}")
                if criteria["mode"]:         criteres_ok.append(f"mode={'en ligne' if criteria['mode']=='en_ligne' else 'présentiel'}")
                if criteria["ville"]:        criteres_ok.append(f"ville={criteria['ville']}")
                if criteria["budget_max"] and criteria["budget_max"] != -1:
                    criteres_ok.append(f"budget={criteria['budget_max']}DT/h")
                elif criteria["budget_max"] == -1:
                    criteres_ok.append("budget=flexible")
                cr = criteria.get("creneaux")
                if cr and cr is not False:
                    criteres_ok.append(f"créneau={cr}")
                elif cr is False:
                    criteres_ok.append("créneaux=flexible")
                ctx = ", ".join(criteres_ok) or "aucun"

                # ── Prompt conversationnel intelligent unique ──
                manquants_labels = {
                    "domaine_type": "type de formation (académique ou professionnel)",
                    "matiere":      "matière ou technologie recherchée",
                    "niveau":       "niveau scolaire (primaire, collège, lycée, université...)",
                    "sous_niveau":  f"sous-niveau précis ({', '.join(SOUS_NIVEAUX.get(criteria.get('niveau',''), []))})",
                    "mode":         "mode d'enseignement (en ligne ou en présentiel)",
                    "ville":        "ville pour les cours en présentiel",
                    "budget_max":   "budget maximum par heure en DT",
                    "creneaux":     "préférence de créneau ou disponibilité",
                }
                prochaine_info = manquants_labels.get(prochain, next_q or "information manquante")

                if is_salut:
                    sys_p = (
                        f'''Tu es EduBot d\'EduMatch. L\'utilisateur vient de te saluer : "{dernier}".
Réponds chaleureusement en 1-2 phrases naturelles.
Invite-le à décrire librement son besoin (prof, matière, niveau, objectif...).
NE PAS poser de question fermée académique/professionnel. Laisse l\'utilisateur s\'exprimer.
INTERDIT: listes, markdown, questions multiples.'''
                )
                else:
                    sys_p = (
                        f'''Tu es EduBot d\'EduMatch. Assistant conversationnel intelligent.

CONTEXTE DÉTECTÉ jusqu\'ici : {ctx if ctx != "aucun" else "premier message de l\'utilisateur"}
DERNIER MESSAGE : "{dernier}"
INFORMATION MANQUANTE : {prochaine_info}

INSTRUCTIONS :
1. Si des critères ont été détectés → confirme-les brièvement et naturellement (1 phrase max)
2. Pose UNE SEULE question pour obtenir : {prochaine_info}
3. La question doit être naturelle, directe, sans liste à puces
4. Si l\'user a déjà donné de nombreuses infos → ne répète pas tout, sois concis
5. Si c\'est le premier message → accuse réception avec empathie puis pose la question

EXEMPLES de style :
- "Parfait, maths au lycée noté ! Vous préférez les cours en ligne ou en présentiel ?"
- "Je cherche des profs de physique pour vous. C\'est pour quel niveau ?"
- "Super ! Quel est votre budget maximum par heure ?"

MAX 2 phrases. TON naturel. INTERDIT: markdown, listes, questions multiples.'''
                    )

                try:
                    r = client.chat.completions.create(
                        model="llama-3.1-8b-instant",
                        messages=[{"role":"system","content":SYSTEM_PROMPT},{"role":"user","content":sys_p+"\n\nRéponds directement en français."}],
                        temperature=0.3, max_tokens=140
                    )
                    reply = r.choices[0].message.content.strip()
                except Exception as e:
                    print(f"Erreur génération: {e}")

            if not reply:
                reply = next_q or "Pouvez-vous préciser votre demande ?"

        # ── CAS : Résultats trouvés (première recherche) ──
        elif top3 and not has_change:
            mat_r = alternative["matiere_alternative"] if alternative else criteria["matiere"]
            noms_dispo = [p["nom"].split()[0] for p in top3 if p.get("disponibilites")]
            nb_dispo = len(noms_dispo)
            ville_s = f"à {(criteria.get('ville') or '').capitalize()}" if criteria.get("ville") else ""

            if alternative:
                if client:
                    try:
                        r = client.chat.completions.create(
                            model="llama-3.1-8b-instant",
                            messages=[{"role":"system","content":SYSTEM_PROMPT},
                                       {"role":"user","content":f"Aucun prof en {alternative['matiere_originale']} mais {len(top3)} en {mat_r}. 1 phrase naturelle. INTERDIT: listes."}],
                            temperature=0.3, max_tokens=80
                        )
                        reply = r.choices[0].message.content.strip()
                    except: pass
                if not reply:
                    reply = f"Aucun résultat en {alternative['matiere_originale']}, mais j'ai trouvé {len(top3)} professeur(s) en **{mat_r}** ! 🎯"
            else:
                profil = generer_profil_ideal(criteria)
                creneaux_v      = criteria.get("creneaux")
                creneau_filtre_v = parse_creneau_filter(creneaux_v) if (creneaux_v and creneaux_v is not False) else {}
                date_str_msg    = creneau_filtre_v.get("date_str", "")

                if nb_dispo == 0 and creneau_filtre_v.get("date_exacte") and date_str_msg:
                    # Date précise demandée mais aucun créneau ce jour
                    has_next = any(
                        any(sl.get("hors_date") for sl in p.get("disponibilites", []))
                        for p in top3
                    )
                    if has_next:
                        reply = (
                            profil +
                            f"\n\n🎯 {len(top3)} professeur(s) trouvé(s) {ville_s}\n"
                            f"⚠️ **Aucun créneau disponible le {date_str_msg}.** "
                            f"Voici les prochaines disponibilités de ces professeurs ci-dessous."
                        )
                    else:
                        reply = (
                            profil +
                            f"\n\n🎯 {len(top3)} professeur(s) trouvé(s) {ville_s}\n"
                            f"⚠️ **Aucun créneau disponible le {date_str_msg}** ni dans les semaines à venir.\n"
                            f"Vous pouvez contacter ces professeurs directement pour convenir d'une date."
                        )
                elif client and nb_dispo > 0:
                    try:
                        # ── Construire le résumé intelligent des résultats ──
                        # Pour chaque prof : prénom + point clé (dispo exacte, mode, créneau)
                        resumes_profs = []
                        for idx_p, p_r in enumerate(top3):
                            prenom_p = p_r["nom"].split()[0]
                            dispos_p = p_r.get("disponibilites", [])
                            mode_p   = p_r.get("mode_enseignement", "")
                            warnings_p = p_r.get("warnings", [])

                            # Trouver la dispo la plus pertinente
                            dispo_exacte = next((d for d in dispos_p if not d.get("hors_date")), None)
                            dispo_proche = dispos_p[0] if dispos_p else None
                            dispo_ref    = dispo_exacte or dispo_proche

                            if dispo_ref:
                                from datetime import datetime as _dt
                                try:
                                    d_obj = _dt.strptime(dispo_ref["date"], "%Y-%m-%d")
                                    date_label = d_obj.strftime("le %d %B").replace(
                                        "January","janvier").replace("February","février").replace(
                                        "March","mars").replace("April","avril").replace(
                                        "May","mai").replace("June","juin").replace(
                                        "July","juillet").replace("August","août").replace(
                                        "September","septembre").replace("October","octobre").replace(
                                        "November","novembre").replace("December","décembre")
                                except:
                                    date_label = dispo_ref.get("date","")

                                mode_label = "en ligne 🌐" if dispo_ref.get("mode") == "en_ligne" else "en présentiel 🏫"

                                if idx_p == 0:
                                    # 1er prof — meilleur match
                                    desc_p = dispo_ref.get("description","")
                                    if desc_p and len(desc_p) > 20:
                                        # Extraire le thème principal (après le tiret)
                                        theme = desc_p.split(".")
                                        theme = theme[1].strip() if len(theme) > 1 else theme[0][:60]
                                        resumes_profs.append(f"**{prenom_p}** est le meilleur match avec une séance disponible {date_label} sur {theme.lower()[:80]}")
                                    else:
                                        resumes_profs.append(f"**{prenom_p}** est le meilleur match avec un créneau disponible {date_label} {mode_label}")
                                elif any("ligne" in w.lower() for w in warnings_p):
                                    resumes_profs.append(f"**{prenom_p}** propose le même cours {mode_label} {date_label}")
                                else:
                                    resumes_profs.append(f"**{prenom_p}** est disponible {date_label} {mode_label}")
                            else:
                                if any("ligne" in w.lower() for w in warnings_p):
                                    resumes_profs.append(f"**{prenom_p}** enseigne {('en ligne 🌐' if 'en_ligne' in mode_p else 'en présentiel 🏫')} — à contacter directement")
                                else:
                                    resumes_profs.append(f"**{prenom_p}** — à contacter directement pour convenir d'une date")

                        resume_str = ". ".join(resumes_profs) + "."

                        # ── Donner le résumé à Groq pour le rendre plus naturel ──
                        try:
                            _msgs_user = criteria.get("_messages") or []
                            _besoin = next((m["content"] for m in _msgs_user if m.get("role")=="user"), mat_r)
                            prompt_groq_resume = (
                                f"Tu es EduBot. Voici le résumé des {len(top3)} professeurs trouvés "
                                f"pour le besoin : \"{_besoin[:120]}\"\n\n"
                                f"{resume_str}\n\n"
                                f"Réécris ce résumé en 1-2 phrases naturelles et professionnelles. "
                                f"Garde les prénoms, les dates et les modes (en ligne/présentiel). "
                                f"INTERDIT: listes, markdown excessif. MAX 2 phrases."
                            )
                            _r_groq = client.chat.completions.create(
                                model="llama-3.1-8b-instant",
                                messages=[
                                    {"role":"system","content":SYSTEM_PROMPT},
                                    {"role":"user","content":prompt_groq_resume+"\n\nRéponds directement en français."}
                                ],
                                temperature=0.3, max_tokens=120
                            )
                            reply = _r_groq.choices[0].message.content.strip()
                        except Exception as _eg:
                            # Fallback : résumé Python direct
                            reply = f"🎯 **{len(top3)} professeurs trouvés** — {resume_str}"

                    except Exception as _e_res:
                        print(f"⚠️ résumé résultats: {_e_res}")
                        reply = f"🎯 {len(top3)} professeur(s) trouvé(s) {ville_s} !"
                else:
                    # Profs trouvés mais aucune dispo en ligne pour ce créneau
                    mode_n_f = normalize_mode(criteria.get("mode"))
                    if mode_n_f == "en_ligne" and nb_dispo == 0:
                        noms_prof = [p["nom"] for p in top3]
                        villes_prof = list({p["ville"] for p in top3 if p.get("ville")})
                        villes_str = ", ".join(villes_prof[:3]) if villes_prof else "Tunis"
                        reply = (
                            profil +
                            f"\n\n🎯 {len(top3)} professeur(s) trouvé(s) correspondant à votre profil.\n"
                            f"⚠️ Ces professeurs n'ont pas de créneaux **en ligne** disponibles "
                            f"pour le moment, mais enseignent en **présentiel** à {villes_str}.\n\n"
                            f"Vous pouvez les **contacter directement** pour convenir d'une séance "
                            f"en ligne ou en présentiel selon vos disponibilités. 📞"
                        )
                    else:
                        reply = f"🎯 {len(top3)} professeur(s) trouvé(s) {ville_s} !"

        # ── CAS : Aucun résultat (première recherche) ──
        elif besoin_complet and not top3 and not alternative:
            reply = message_aucun_resultat(criteria, {})

        return {
            "reply": reply or "Comment puis-je vous aider ?",
            "top3_profs": top3,
            "besoin_complet": besoin_complet,
            "prochain_critere": prochain,
            "noProfs": len(top3)==0 and besoin_complet,
            "alternative": alternative,
            "criteres": criteria,
        }

    except Exception as e:
        traceback.print_exc()
        print(f"❌ ERREUR: {e}")
        return {
            "reply": "⚠️ Une erreur est survenue. Veuillez réessayer.",
            "top3_profs":[],"besoin_complet":False,
            "prochain_critere":None,"noProfs":False,
            "alternative":None,"criteres":{},
        }


@router.get("/prof-detail/{prof_id}")
def get_prof_detail(
    prof_id: int,
    sous_niveau: str = None,
    mode: str = None,
    db: Session = Depends(get_db)
):
    prof = db.query(Professeur).join(User).filter(
        Professeur.id==prof_id, Professeur.statut_validation=="validé"
    ).first()
    if not prof: raise HTTPException(404,"Professeur introuvable")

    matieres = db.query(Matiere).join(
        ProfMatiereTarif, Matiere.id==ProfMatiereTarif.matiere_id
    ).filter(ProfMatiereTarif.prof_id==prof_id).all()

    # ── Disponibilités filtrées par sous_niveau + mode ──
    q = db.query(Disponibilite).filter(
        Disponibilite.prof_id==prof_id,
        Disponibilite.actif==True,
        Disponibilite.date_specifique>=date.today()
    )

    # Filtre sous-niveau (ex: Baccalauréat, 7ème année...)
    if sous_niveau:
        niveau_ids = get_niveau_ids_pour_sous_niveau(sous_niveau, db)
        if niveau_ids:
            q = q.filter(
                (Disponibilite.niveau_id.in_(niveau_ids)) |
                (Disponibilite.niveau_id.is_(None))
            )

    raw = q.order_by(Disponibilite.date_specifique).limit(10).all()

    # Filtre mode
    dispos = []
    for d in raw:
        if mode == "en_ligne"   and d.mode_seance == "presentiel": continue
        if mode == "presentiel" and d.mode_seance == "en_ligne":   continue
        dispos.append({
            "id":d.id,"date":str(d.date_specifique),
            "heure_debut":str(d.heure_debut)[:5] if d.heure_debut else None,
            "heure_fin":str(d.heure_fin)[:5]     if d.heure_fin   else None,
            "mode":d.mode_seance,
            "nb_places":(d.nb_max_etudiants or 1)-(d.nb_inscrits or 0),
            "description": d.description or None,
            "niveau_nom": None,  # Évite DetachedInstanceError
        })

    tarifs = [t for t in [prof.tarif_en_ligne,prof.tarif_presentiel] if t and float(t)>0]
    tarif_min = min(float(t) for t in tarifs) if tarifs else 0

    return {
        "id":prof.id,"nom":f"{prof.user.prenom} {prof.user.nom}",
        "user_prenom":prof.user.prenom,"user_nom":prof.user.nom,
        "photo_url":prof.photo_url,"ville":prof.ville,"bio":prof.bio,
        "telephone":prof.telephone,"email":prof.user.email,
        "note_moyenne":float(prof.note_moyenne or 0),"nb_avis":prof.nb_avis or 0,
        "mode_enseignement":prof.mode_enseignement,
        "tarif_en_ligne":float(prof.tarif_en_ligne or 0),
        "tarif_presentiel":float(prof.tarif_presentiel or 0),
        "tarif_min":tarif_min,
        "matieres":[m.nom for m in matieres],
        "tarifs_matieres":[{"nom_matiere":m.nom,"tarif":tarif_min} for m in matieres],
        "disponibilites":dispos,
    }