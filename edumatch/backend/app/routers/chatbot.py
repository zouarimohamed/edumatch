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

VILLES_DISPONIBLES = ["tunis","sfax","sousse","monastir","nabeul"]

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

SYSTEM_PROMPT = """Tu es EduBot, assistant intelligent d'EduMatch Tunisie.
Tu aides à trouver le professeur idéal en posant des questions claires, une à la fois.

FLOW OBLIGATOIRE :
1. Domaine → académique ou professionnel
2. Matière
3. Niveau général (primaire/collège/lycée/université)
4. Sous-niveau précis (ex: 1ère année lycée, 7ème année, 4ème primaire...)
5. Mode (en ligne / présentiel)
6. Ville (si présentiel)
7. Budget (optionnel)

RÈGLES CRITIQUES :
- UNE SEULE question à la fois
- Confirme chaque réponse avant de poser la suivante
- Si l'utilisateur change un critère, prends-en acte explicitement
- Si aucun résultat : message clair + alternatives concrètes
- Jamais de résultats hors niveau demandé
- Max 3 lignes par réponse"""


def get_groq_client():
    k = os.getenv("GROQ_API_KEY")
    if not k: return None
    try: return Groq(api_key=k)
    except: return None


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
    if not cats:
        cat = get_cat_niveau((p.bio or "").lower())
        if cat:
            cats.add(cat)
    return list(cats)


def score_prof(p, criteria, db, variations, cat_demandee):
    score = 0
    details = {}
    mat_score = 25 if prof_match_matiere(p, variations, db) else 0
    score += mat_score; details["matiere"] = mat_score
    if cat_demandee:
        cats = get_prof_niveaux(p, db)
        niv_score = 40 if cat_demandee in cats else 0
    else:
        niv_score = 20
    score += niv_score; details["niveau"] = niv_score
    ville_score = 0
    if criteria.get("mode") == "en_ligne":
        ville_score = 0
    elif criteria.get("ville") and p.ville:
        vr,vp = criteria["ville"].lower().strip(), p.ville.lower().strip()
        if vr == vp: ville_score = 15
        elif vr in vp or vp in vr: ville_score = 7
    else:
        ville_score = 6
    score += ville_score; details["ville"] = ville_score
    budget_score = 0
    if criteria.get("budget_max") and criteria.get("budget_max") != -1:
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
                if tarif <= budget: budget_score = 10
                elif tarif <= budget*1.2: budget_score = 6
                elif tarif <= budget*1.4: budget_score = 3
                else: budget_score = 0
        except: pass
    score += budget_score; details["budget"] = budget_score
    mode_score = 0
    if criteria.get("mode") and p.mode_enseignement:
        mr,pm = criteria["mode"].lower(), p.mode_enseignement.lower()
        mode_score = 5 if (mr==pm or pm=="les_deux") else 0
    score += mode_score; details["mode"] = mode_score
    rep = 0
    if p.note_moyenne:
        n = float(p.note_moyenne)
        if n>=4.5: rep=5
        elif n>=4.0: rep=3
        elif n>=3.5: rep=1
    score += rep; details["reputation"] = rep
    return round(score,1), details


def prof_match_matiere(p, variations, db):
    try:
        mats = db.query(Matiere).join(
            ProfMatiereTarif, Matiere.id==ProfMatiereTarif.matiere_id
        ).filter(ProfMatiereTarif.prof_id==p.id).all()
        mat_names = [m.nom.lower() for m in mats]
        if any(any(v in mn or mn in v for v in variations) for mn in mat_names):
            return True
    except: pass
    bio = (p.bio or "").lower()
    return any(v in bio for v in variations)


def get_niveau_ids_pour_sous_niveau(sous_niveau, db):
    if not sous_niveau: return []
    sous_norm = sous_niveau.lower().replace('é','e').replace('è','e').replace('ê','e').replace("'","")
    try:
        tous_niveaux = db.query(Niveau).all()
        ids = []
        for n in tous_niveaux:
            n_norm = n.nom.lower().replace('é','e').replace('è','e').replace('ê','e').replace("'","")
            if sous_norm in n_norm or n_norm in sous_norm:
                ids.append(n.id)
        return ids
    except:
        return []


# ══════════════════════════════════════════════════════════════════════════════
# NOUVEAU : Filtre intelligent des disponibilités par créneau préféré
# ══════════════════════════════════════════════════════════════════════════════

JOURS_SEMAINE = {
    "lundi": 0, "mardi": 1, "mercredi": 2, "jeudi": 3,
    "vendredi": 4, "samedi": 5, "dimanche": 6,
}

WEEKEND_DAYS = {5, 6}   # samedi, dimanche
SEMAINE_DAYS = {0, 1, 2, 3, 4}

def parse_creneau_filter(creneaux_str):
    """
    Parse la préférence de créneau et retourne un dict de filtres :
      {
        "jours_semaine": set of int (0=lundi … 6=dimanche) | None,
        "date_exacte":   date | None,   # "aujourd'hui"
        "periode":       "matin"|"apres-midi"|"soir" | None,
      }
    """
    if not creneaux_str or creneaux_str is False:
        return {}

    filtre = {}
    text = creneaux_str.lower()

    # Aujourd'hui
    if "aujourd" in text or "today" in text:
        filtre["date_exacte"] = date.today()
        return filtre

    # Demain
    if "demain" in text:
        filtre["date_exacte"] = date.today() + timedelta(days=1)
        return filtre

    # Week-end
    if "week-end" in text or "weekend" in text:
        filtre["jours_semaine"] = WEEKEND_DAYS
    # Semaine (lundi-vendredi)
    elif "semaine" in text and "week" not in text:
        filtre["jours_semaine"] = SEMAINE_DAYS
    else:
        # Jours nommés
        jours = set()
        for nom, idx in JOURS_SEMAINE.items():
            if nom in text:
                jours.add(idx)
        if jours:
            filtre["jours_semaine"] = jours

    # Période de la journée
    if "matin" in text:
        filtre["periode"] = "matin"
    elif "soir" in text or "nuit" in text:
        filtre["periode"] = "soir"
    elif "apres-midi" in text or "après-midi" in text or "apres midi" in text:
        filtre["periode"] = "apres-midi"

    return filtre


def dispo_match_creneau(d, filtre):
    """
    Retourne True si la dispo correspond au filtre de créneau.
    Si filtre vide → toujours True (pas de préférence).
    """
    if not filtre:
        return True

    # Filtre par date exacte
    if "date_exacte" in filtre:
        return d.date_specifique == filtre["date_exacte"]

    # Filtre par jour de la semaine
    if "jours_semaine" in filtre:
        weekday = d.date_specifique.weekday()  # 0=lundi … 6=dimanche
        if weekday not in filtre["jours_semaine"]:
            return False

    # Filtre par période
    if "periode" in filtre and d.heure_debut:
        heure = d.heure_debut.hour
        if filtre["periode"] == "matin" and not (5 <= heure < 12):
            return False
        elif filtre["periode"] == "apres-midi" and not (12 <= heure < 18):
            return False
        elif filtre["periode"] == "soir" and not (18 <= heure < 24):
            return False

    return True


def get_disponibilites(prof_id, criteria, db, jours=None):
    """Récupère les disponibilités avec filtrage intelligent par créneau."""
    creneaux = criteria.get("creneaux")

    # Construire le filtre créneau une seule fois
    creneau_filtre = parse_creneau_filter(creneaux) if (creneaux and creneaux is not False) else {}

    # Si l'utilisateur veut aujourd'hui ou demain, pas besoin de chercher loin
    if "date_exacte" in creneau_filtre:
        date_min = creneau_filtre["date_exacte"]
        date_max = creneau_filtre["date_exacte"]
    elif "jours_semaine" in creneau_filtre:
        # Chercher dans les 30 prochains jours pour trouver les bons jours
        date_min = date.today()
        date_max = date.today() + timedelta(days=30)
    elif jours:
        date_min = date.today()
        date_max = date.today() + timedelta(days=7)
    else:
        date_min = date.today()
        date_max = None  # pas de limite

    q = db.query(Disponibilite).filter(
        Disponibilite.prof_id == prof_id,
        Disponibilite.actif == True,
        Disponibilite.date_specifique >= date_min,
    )
    if date_max:
        q = q.filter(Disponibilite.date_specifique <= date_max)

    sous_niveau = criteria.get("sous_niveau")
    if sous_niveau:
        niveau_ids = get_niveau_ids_pour_sous_niveau(sous_niveau, db)
        if niveau_ids:
            q = q.filter(
                (Disponibilite.niveau_id.in_(niveau_ids)) |
                (Disponibilite.niveau_id == None)
            )

    # On récupère plus de dispos pour avoir assez après le filtre créneau
    raw = q.order_by(Disponibilite.date_specifique).limit(50).all()

    dispos = []
    for d in raw:
        # Filtre mode
        if criteria.get("mode") == "en_ligne" and d.mode_seance == "presentiel":
            continue
        if criteria.get("mode") == "presentiel" and d.mode_seance == "en_ligne":
            continue

        # ── FILTRE CRÉNEAU INTELLIGENT ──
        if not dispo_match_creneau(d, creneau_filtre):
            continue

        places = (d.nb_max_etudiants or 1) - (d.nb_inscrits or 0)
        if places <= 0:
            continue  # Plus de places disponibles

        dispos.append({
            "id": d.id,
            "date": str(d.date_specifique),
            "heure_debut": str(d.heure_debut)[:5] if d.heure_debut else None,
            "heure_fin": str(d.heure_fin)[:5] if d.heure_fin else None,
            "mode": d.mode_seance,
            "nb_places": places,
        })

        if len(dispos) >= 5:
            break  # On garde max 5 créneaux pertinents

    return dispos


def build_result(p, score, details, db, criteria, jours=None):
    tarifs = [t for t in [p.tarif_en_ligne,p.tarif_presentiel] if t and float(t)>0]
    tarif_min = min(float(t) for t in tarifs) if tarifs else 0
    label = "Excellent" if score>=85 else "Très bon" if score>=70 else "Bon" if score>=55 else "Possible"
    dispos = get_disponibilites(p.id, criteria, db, jours)
    warnings = []
    if criteria.get("mode") and p.mode_enseignement not in [criteria["mode"],"les_deux"]:
        warnings.append(f"Mode {p.mode_enseignement} uniquement")
    if criteria.get("budget_max") and criteria.get("budget_max") != -1 and tarif_min > float(criteria["budget_max"]):
        warnings.append(f"Tarif {tarif_min:.0f} DT > votre budget {criteria['budget_max']} DT")
    return {
        "id":p.id,"nom":f"{p.user.prenom} {p.user.nom}",
        "photo_url":p.photo_url,"ville":p.ville,
        "email":p.user.email,"telephone":p.telephone,
        "note_moyenne":float(p.note_moyenne or 0),"nb_avis":p.nb_avis or 0,
        "mode_enseignement":p.mode_enseignement,
        "tarif_en_ligne":float(p.tarif_en_ligne or 0),
        "tarif_presentiel":float(p.tarif_presentiel or 0),
        "tarif_min":tarif_min,"bio":p.bio,
        "matieres":[],"disponibilites":dispos,"warnings":warnings,
        "has_disponibilites": len(dispos) > 0,
        "score":{"total":score,"label":label,"details":details}
    }


def search_profs(matiere, criteria, db, seuil=20, jours=None, strict_budget=False):
    variations  = get_variations(matiere.lower().strip())
    cat_demandee = criteria.get("niveau")

    query = db.query(Professeur).join(User).filter(
        Professeur.statut_validation=="validé"
    )
    if criteria.get("ville") and criteria.get("mode") == "presentiel":
        query = query.filter(
            Professeur.ville.ilike(f"%{criteria['ville']}%")
        )
    profs = query.all()

    print(f"\n🔎 Recherche: matière={matiere!r} niveau={cat_demandee!r} mode={criteria.get('mode')!r} ville={criteria.get('ville')!r} budget={criteria.get('budget_max')!r} strict_budget={strict_budget}")

    results = []
    for p in profs:
        if not p.user: continue

        if cat_demandee:
            cats_prof = get_prof_niveaux(p, db)
            if cat_demandee not in cats_prof:
                print(f"  ❌ {p.user.prenom} {p.user.nom} — niveau {cats_prof} ≠ {cat_demandee}")
                continue
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

        if not prof_match_matiere(p, variations, db):
            print(f"  ❌ {p.user.prenom} {p.user.nom} — matière ne correspond pas")
            continue

        if criteria.get("mode") and p.mode_enseignement:
            mu, mp = criteria["mode"].lower(), p.mode_enseignement.lower()
            if mp != "les_deux" and mp != mu:
                print(f"  ❌ {p.user.prenom} {p.user.nom} — mode {mp} ≠ {mu}")
                continue

        if strict_budget and criteria.get("budget_max") and criteria.get("budget_max") != -1:
            try:
                budget = float(criteria["budget_max"])
                tarifs = []
                if criteria.get("mode") == "en_ligne" and p.tarif_en_ligne:
                    tarifs = [float(p.tarif_en_ligne)]
                elif criteria.get("mode") == "presentiel" and p.tarif_presentiel:
                    tarifs = [float(p.tarif_presentiel)]
                else:
                    tarifs = [float(t) for t in [p.tarif_en_ligne, p.tarif_presentiel] if t]
                tarif_min = min(tarifs) if tarifs else float('inf')
                if tarif_min > budget:
                    print(f"  ❌ {p.user.prenom} {p.user.nom} — tarif {tarif_min} > budget {budget} (strict)")
                    continue
            except:
                pass

        s, d = score_prof(p, criteria, db, variations, cat_demandee)
        print(f"  ✅ {p.user.prenom} {p.user.nom} — score={s} niv={d['niveau']} mat={d['matiere']}")
        if s >= seuil:
            results.append(build_result(p, s, d, db, criteria, jours))

    # Trier : d'abord ceux qui ont des dispos correspondant au créneau, puis par score
    return sorted(
        results,
        key=lambda x: (
            1 if x.get("disponibilites") else 0,
            x["score"]["total"]
        ),
        reverse=True
    )[:3]


def extract_all_criteria(messages):
    user_text = " ".join(m["content"] for m in messages if m.get("role")=="user").lower()
    c = {}

    kw_acad = ["academique","académique","scolaire","primaire","collège","college","lycée","lycee",
               "bac","université","universite","mathématiques","physique","svt","arabe",
               "français","francais","anglais","histoire","philosophie","informatique"]
    kw_pro  = ["professionnel","reconversion","entreprise","développement web","dev web",
               "cybersécurité","marketing","comptabilité","intelligence artificielle","cloud","devops","docker","aws"]
    if any(k in user_text for k in kw_pro):
        c["domaine_type"] = "professionnel"
    elif any(k in user_text for k in kw_acad):
        c["domaine_type"] = "academique"

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

    # ── DÉTECTION MATIÈRE INCONNUE ──────────────────────────────────────────
    # Si le bot vient de demander "quelle matière ?" et que l'user a répondu,
    # on capture le texte brut pour détecter une matière non reconnue.
    if not c.get("matiere"):
        # Vérifier si la question précédente était sur la matière
        msgs_list = list(messages)
        last_assistant = next(
            (m["content"] for m in reversed(msgs_list) if m.get("role") == "assistant"),
            ""
        )
        matiere_question_posee = any(k in last_assistant.lower() for k in [
            "quelle matière", "quelle matiere", "matière cherchez", "matiere cherchez"
        ])
        if matiere_question_posee:
            # L'utilisateur a répondu → capturer son texte brut
            last_user_raw = (messages[-1]["content"] if messages else "").strip()
            # Exclure les réponses qui sont clairement autre chose (domaine, mode...)
            mots_exclus = ["academique","académique","professionnel","en ligne","presentiel",
                           "présentiel","oui","non","ok","merci","bonjour","salut"]
            if last_user_raw and not any(e in last_user_raw.lower() for e in mots_exclus):
                c["matiere_saisie_brute"] = last_user_raw.lower().strip()

    NIV_KW = {
        "primaire":   ["primaire","école primaire","6ème","6eme","5ème","5eme","4ème","4eme",
                       "3ème","3eme","2ème","2eme","1ère","1ere","cp","ce1","ce2","cm1","cm2"],
        "college":    ["collège","college","7ème","7eme","8ème","8eme","9ème","9eme","brevet","année de base"],
        "lycee":      ["lycée","lycee","baccalauréat","baccalaureat","terminale","secondaire"],
        "universite": ["université","universite","licence","master","ingénieur","ingenieur","prépa","prepa","médecine"],
    }

    if "bac" in user_text and "bac+" not in user_text:
        c["niveau"] = "lycee"

    if not c.get("niveau"):
        for niv, kws in NIV_KW.items():
            if any(k in user_text for k in kws):
                c["niveau"] = niv
                break

    def norm(t):
        return t.lower().replace('é','e').replace('è','e').replace('ê','e').replace('à','a').replace("'","").strip()

    user_text_norm = norm(user_text)
    last_user = (messages[-1]["content"] if messages else "").lower()
    last_user_norm = norm(last_user)

    niveau_defini = c.get("niveau")

    SOUS_NIV_PRECIS = {
        "1ère année primaire":  ["1ere annee primaire","premiere annee primaire","1 annee primaire",
                                  "1ere primaire","1 primaire","premiere primaire","1ere annee"],
        "2ème année primaire":  ["2eme annee primaire","deuxieme annee primaire","2 annee primaire",
                                  "2eme primaire","2 primaire","deuxieme primaire","2eme annee"],
        "3ème année primaire":  ["3eme annee primaire","troisieme annee primaire","3 annee primaire",
                                  "3eme primaire","3 primaire","troisieme primaire","3eme annee"],
        "4ème année primaire":  ["4eme annee primaire","quatrieme annee primaire","4eme primaire",
                                  "4 annee primaire","4 primaire","quatrieme primaire","4eme annee",
                                  "4 eme","4eme"],
        "5ème année primaire":  ["5eme annee primaire","cinquieme annee primaire","5eme primaire",
                                  "5 annee primaire","5 primaire","cinquieme primaire","5eme annee",
                                  "5 eme","5eme"],
        "6ème année primaire":  ["6eme annee primaire","sixieme annee primaire","6eme primaire",
                                  "6 annee primaire","6 primaire","sixieme primaire","6eme annee",
                                  "6 eme","6eme"],
        "7ème année":  ["7eme annee","7eme","septieme annee","7 annee","7 eme","septieme",
                        "7e annee","7e","annee 7"],
        "8ème année":  ["8eme annee","8eme","huitieme annee","8 annee","8 eme","huitieme",
                        "8e annee","8e","annee 8"],
        "9ème année":  ["9eme annee","9eme","neuvieme annee","9 annee","9 eme","neuvieme",
                        "9e annee","9e","annee 9"],
        "1ère année lycée": ["1ere annee lycee","premiere annee lycee","1ere secondaire",
                              "premiere secondaire","1 annee lycee","1ere lycee","1 lycee"],
        "2ème année lycée": ["2eme annee lycee","deuxieme annee lycee","2eme secondaire",
                              "2 annee lycee","2eme lycee","2 lycee"],
        "3ème année lycée": ["3eme annee lycee","troisieme annee lycee","3eme secondaire",
                              "3 annee lycee","3eme lycee","3 lycee"],
    }

    user_text_norm2 = user_text_norm.replace(" eme","eme").replace(" e ","e ").replace(" ere","ere")
    last_user_norm2 = last_user_norm.replace(" eme","eme").replace(" e ","e ").replace(" ere","ere")

    for sous_niv, kws in SOUS_NIV_PRECIS.items():
        found = (any(k in user_text_norm for k in kws) or
                 any(k in user_text_norm2 for k in kws) or
                 any(k in last_user_norm for k in kws) or
                 any(k in last_user_norm2 for k in kws))
        if found:
            c["sous_niveau"] = sous_niv
            if not niveau_defini:
                if "primaire" in sous_niv:
                    c["niveau"] = "primaire"
                elif "7ème" in sous_niv or "8ème" in sous_niv or "9ème" in sous_niv:
                    c["niveau"] = "college"
                elif "lycée" in sous_niv:
                    c["niveau"] = "lycee"
            break

    if not c.get("sous_niveau") and c.get("niveau") == "primaire":
        import re as re_niv
        m_niv = re_niv.search(r"([1-6])\s*e?me?", last_user_norm)
        if m_niv:
            num = int(m_niv.group(1))
            noms = ["","1ère année primaire","2ème année primaire","3ème année primaire",
                    "4ème année primaire","5ème année primaire","6ème année primaire"]
            if 1 <= num <= 6:
                c["sous_niveau"] = noms[num]

    if not c.get("sous_niveau") and c.get("niveau") == "college":
        import re as re_niv
        m_niv = re_niv.search(r"([7-9])\s*e?me?|([7-9])\s*eme", last_user_norm)
        if not m_niv:
            m_niv = re_niv.search(r"([7-9])", last_user_norm)
        if m_niv:
            num = int(m_niv.group(1) or m_niv.group(2) or "0")
            noms = {7:"7ème année", 8:"8ème année", 9:"9ème année"}
            if num in noms:
                c["sous_niveau"] = noms[num]

    if not c.get("sous_niveau") and c.get("niveau") == "lycee":
        BAC_KEYWORDS = [
            "baccalaureat",
            "bac ", " bac",
            "bacfinal", "bacfinal",
            "annee du bac",
            "preparation bac", "prep bac", "revision bac", "reussir le bac",
            "bac dans", "bac dans un mois", "bac dans 2 mois", "bac dans deux mois",
            "passer le bac", "session bac", "controle bac",
            "terminale", "terminal", "classe terminale",
        ]

        found_bac = False
        for check_text in [last_user_norm, user_text_norm]:
            for kw in BAC_KEYWORDS:
                if kw in check_text:
                    found_bac = True
                    break
            if found_bac:
                break

        if found_bac:
            c["sous_niveau"] = "Baccalauréat"

    if not c.get("sous_niveau") and c.get("niveau") == "lycee":
        if re.search(r'\bbac\b', last_user, re.IGNORECASE):
            c["sous_niveau"] = "Baccalauréat"

    kw_ligne = ["en ligne","online","à distance","distance","virtuel","zoom","teams"]
    kw_pres  = ["présentiel","presentiel","domicile","chez moi","en personne","face à face"]
    if any(k in user_text for k in kw_ligne) and not any(k in user_text for k in kw_pres):
        c["mode"] = "en_ligne"
    elif any(k in user_text for k in kw_pres):
        c["mode"] = "presentiel"
    elif any(k in user_text for k in kw_ligne):
        c["mode"] = "en_ligne"

    for v in VILLES_DISPONIBLES:
        if v in user_text:
            c["ville"] = v
            break

    # Si aucune ville connue trouvée, capturer la ville brute si la question ville était posée
    if not c.get("ville"):
        # On cherche dans le dernier message user un nom de ville potentiel
        # (au moins 3 caractères, pas un mot-clé connu)
        mots_exclus = {"en","le","la","les","de","du","un","une","des","et","ou","je","tu",
                       "me","ma","mon","oui","non","ok","bac","lycee","lycée","maths","math",
                       "physique","arabe","francais","anglais","presentiel","en ligne","sfax",
                       "tunis","sousse","monastir","nabeul"}
        last_words = last_user.lower().strip().split()
        for word in last_words:
            word_clean = re.sub(r'[^a-zàâéèêëîïôùûüç]', '', word)
            if len(word_clean) >= 3 and word_clean not in mots_exclus:
                # Vérifier que ce n'est pas un mot de mode ou niveau
                kw_autres = kw_ligne + kw_pres + ["primaire","college","collège","lycee","lycée",
                                                   "universite","université","baccalaureat"]
                if not any(word_clean in kw.replace(" ","") for kw in kw_autres):
                    c["ville_saisie_brute"] = word_clean
                    break

    import re as re_local

    def extract_budget_from_text(text):
        if not text:
            return None
        text_lower = text.lower()
        m = re_local.search(r'(\d{1,3})\s*(?:dt|dinar|dinars|d)(?!\w)', text_lower)
        if m:
            val = int(m.group(1))
            if 1 <= val <= 500:
                return val
        m = re_local.search(r'(\d{1,3})\s*(?:€|euros?|euro?)', text_lower)
        if m:
            val = int(m.group(1))
            if 1 <= val <= 500:
                return val
        m = re_local.search(r'(?:budget|max|maximum|pas plus de|moins de|seulement|environ|~|jusqu\'à|jusqu a|limite)\s*(\d{1,3})', text_lower)
        if m:
            val = int(m.group(1))
            if 1 <= val <= 500:
                return val
        m = re_local.search(r'(\d{1,3})\s*[dD][tT]\b', text)
        if m:
            val = int(m.group(1))
            if 1 <= val <= 500:
                return val
        return None

    budget_val = extract_budget_from_text(last_user)
    if budget_val is None:
        budget_val = extract_budget_from_text(user_text)
    if budget_val is None:
        for msg in reversed(messages):
            if msg.get("role") == "user":
                txt = msg["content"].strip()
                m = re_local.match(r'^\s*(\d{1,3})\s*$', txt)
                if m:
                    val = int(m.group(1))
                    if 1 <= val <= 500:
                        budget_val = val
                        break
    if budget_val is not None:
        c["budget_max"] = budget_val

    kw_dispo = ["cette semaine","semaine","lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche","weekend","week-end","demain","aujourd"]
    if any(k in last_user for k in kw_dispo):
        c["disponibilite_semaine"] = True

    # ── CRÉNEAUX ──────────────────────────────────────────────────────────────
    kw_pas_pref = ["peu importe","n importe","n'importe","pas de preference","pas de préférence",
                   "flexible","disponible","quand vous voulez","quand vous souhaitez",
                   "pas de creneaux","aucune preference","indifferent","indifférent","skip","passer",
                   "non","non merci","aucun","aucune","pas vraiment"]
    jours_noms = ["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"]
    moments = ["matin","apres-midi","après-midi","apres midi","soir","nuit","journee","journée","weekend","week-end","semaine"]
    kw_dispo_creneau = ["aujourd","demain","cette semaine"]

    if any(k in last_user for k in kw_pas_pref):
        c["creneaux"] = False
    elif any(k in last_user for k in jours_noms + moments + kw_dispo_creneau):
        jours_trouvés = [j for j in jours_noms if j in last_user]
        moments_trouvés = [m for m in moments if m in last_user]
        kw_trouvés = [k for k in kw_dispo_creneau if k in last_user]
        if jours_trouvés or moments_trouvés or kw_trouvés:
            desc = " ".join(jours_trouvés + moments_trouvés + kw_trouvés)
            c["creneaux"] = desc
            c["disponibilite_semaine"] = True

    if any(k in user_text for k in ["faible","difficultés","problème","nul","comprend pas","peur","bloqué","retard"]):
        c["difficultes"] = "Élève en difficulté — accompagnement personnalisé"
    if any(k in user_text for k in ["examen","bac","brevet","concours","réussir","améliorer","préparer"]):
        c["objectifs"] = "Préparation examen / amélioration des résultats"
    for style, kws in {"patient":["patient","doux","calme"],"strict":["strict","rigoureux","exigeant"],"interactif":["interactif","dynamique","ludique","motivant"]}.items():
        if any(k in user_text for k in kws):
            c["style_souhaite"] = style
            break

    return c


def detect_last_change(messages, criteria_avant):
    if not messages: return {}
    last = next((m["content"].lower().strip() for m in reversed(messages) if m.get("role")=="user"), "")
    overrides = {}

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

    m = re.search(r'(\d{2,3})\s*(?:dt|dinar|dinars|d\b|euros?)?', last)
    budget_kw = ["max","budget","dt","dinar","d ","par heure","€","euro","moins","seulement","veux","souhaite"]
    if m and any(k in last for k in budget_kw):
        val = int(m.group(1))
        if 5 <= val <= 300:
            overrides["budget_max"] = val

    kw_augment = [
        "augment", "d accord", "d'accord", "ok augment", "oui augment",
        "augmentons", "voir tous", "afficher tous", "montrer tous",
        "peu importe le budget", "sans limite de budget",
        "enlever le budget", "ignorer le budget", "supprimer le budget",
        "voir quand meme", "voir quand même", "je veux quand meme",
    ]
    kw_no_budget = [
        "peu importe", "n importe", "n'importe", "pas de budget",
        "aucun budget", "sans budget", "pas de limite", "sans contrainte",
    ]
    if not overrides.get("budget_max"):
        if any(k in last for k in kw_augment) or any(k in last for k in kw_no_budget):
            overrides["budget_max"] = -1

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

    niv_kw = {"lycee":["lycée","lycee","terminale"],"college":["collège","college","7ème","8ème","9ème"],"primaire":["primaire"],"universite":["université","universite","licence","master"]}
    for niv, kws in niv_kw.items():
        if any(k in last for k in kws) and any(c in last for c in chg_kw) and criteria_avant.get("niveau") != niv:
            overrides["niveau"] = niv
            break

    for v in VILLES_DISPONIBLES:
        if v in last and any(c in last for c in chg_kw+["à","a "]) and criteria_avant.get("ville") != v:
            overrides["ville"] = v
            break

    return overrides


def _levenshtein(a, b):
    """Distance de Levenshtein pour détecter les fautes de frappe."""
    if len(a) < len(b): a, b = b, a
    if not b: return len(a)
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a):
        curr = [i + 1]
        for j, cb in enumerate(b):
            curr.append(min(prev[j+1]+1, curr[j]+1, prev[j]+(ca!=cb)))
        prev = curr
    return prev[-1]


def _normaliser(t):
    """Normalise : minuscules, sans accents."""
    t = t.lower().strip()
    for a, b in [('é','e'),('è','e'),('ê','e'),('ë','e'),
                 ('à','a'),('â','a'),('ä','a'),
                 ('ô','o'),('ö','o'),
                 ('û','u'),('ù','u'),('ü','u'),
                 ('î','i'),('ï','i'),
                 ('ç','c'),('ñ','n'),("'",""),("-"," ")]:
        t = t.replace(a, b)
    return t


# Mots trop génériques → jamais une matière valide
MOTS_TROP_GENERIQUES = {
    "science","sciences","cours","matiere","matières","matieres",
    "lecon","leçon","apprendre","apprentissage","etude","études","etudes"
}


def get_matieres_bd(db, domaine_type=None):
    """
    Retourne les matières DISTINCTES disponibles en BD (au moins un prof validé).
    Filtre par domaine_type si fourni.

    STRATÉGIE : whitelist académique explicite.
    Toute matière dont le nom normalisé contient un mot académique → académique.
    Sinon → professionnelle.
    """
    MOTS_ACAD = [
        "mathematique","math","physique","chimie","arabe","francais","anglais",
        "svt","biologie","histoire","geographie","philosophie","philo",
        "sciences naturelles","sciences physiques","algorithmique","education",
        "sport","langue","litterature","economie","droit",
    ]

    try:
        matieres = db.query(Matiere).join(
            ProfMatiereTarif, Matiere.id == ProfMatiereTarif.matiere_id
        ).join(
            Professeur, ProfMatiereTarif.prof_id == Professeur.id
        ).join(
            User, Professeur.user_id == User.id
        ).filter(
            Professeur.statut_validation == "validé"
        ).all()

        # Dédupliquer par nom normalisé
        seen = set()
        result = []
        for m in matieres:
            nom_norm = _normaliser(m.nom)
            if nom_norm in seen:
                continue
            seen.add(nom_norm)

            is_acad = any(kw in nom_norm for kw in MOTS_ACAD)

            if domaine_type == "academique" and not is_acad:
                continue
            if domaine_type == "professionnel" and is_acad:
                continue

            result.append({"id": m.id, "nom": m.nom, "nom_norm": nom_norm})

        return result
    except:
        return []


def matiere_existe_en_bd(matiere, db, domaine_type=None):
    """Vérifie si une matière (nom canonique) a au moins un prof validé."""
    if not matiere:
        return True
    matieres_dispo = get_matieres_bd(db, domaine_type)
    mat_norm = _normaliser(matiere)
    return any(m["nom_norm"] == mat_norm or mat_norm in m["nom_norm"] for m in matieres_dispo)


def matiere_brute_existe_en_bd(matiere_brute, db, domaine_type=None):
    """
    Cherche si le texte libre saisi par l'user correspond à une matière en BD.
    Approche 100% BD : on charge les matières disponibles, on compare.
    Gère fautes de frappe (englais→anglais) et mots génériques (science→non).
    Retourne (existe: bool, nom_exact: str|None)
    """
    if not matiere_brute:
        return True, None

    text = _normaliser(matiere_brute)

    # Rejeter les mots trop génériques
    if text in MOTS_TROP_GENERIQUES:
        return False, None

    # Charger les matières disponibles en BD (filtrées par domaine)
    matieres_dispo = get_matieres_bd(db, domaine_type)
    if not matieres_dispo:
        return True, None  # BD vide ou erreur → laisser passer

    best_match = None
    best_score = 999

    for m in matieres_dispo:
        nom_norm = m["nom_norm"]

        # 1. Correspondance exacte
        if text == nom_norm:
            return True, m["nom"]

        # 2. L'un contient l'autre
        if text in nom_norm or nom_norm in text:
            score = abs(len(text) - len(nom_norm))
            if len(text) >= 4 and score < best_score:
                best_score = score
                best_match = m["nom"]
            continue

        # 3. Fuzzy (fautes de frappe)
        max_dist = 1 if len(nom_norm) <= 5 else 2 if len(nom_norm) <= 9 else 3
        dist = _levenshtein(text, nom_norm)
        if dist <= max_dist and dist < best_score:
            best_score = dist
            best_match = m["nom"]

    if best_match:
        return True, best_match

    return False, None


def get_manquants(criteria):
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
    bv = criteria.get("budget_max")
    if not missing and bv is None:
        missing.append("budget_max")
    if not missing and criteria.get("creneaux") is None:
        missing.append("creneaux")
    return missing


def get_tarif_min_prof(p, mode=None):
    tarifs = []
    if mode == "en_ligne" and p.tarif_en_ligne:
        tarifs = [float(p.tarif_en_ligne)]
    elif mode == "presentiel" and p.tarif_presentiel:
        tarifs = [float(p.tarif_presentiel)]
    else:
        tarifs = [float(t) for t in [p.tarif_en_ligne, p.tarif_presentiel] if t and float(t) > 0]
    return min(tarifs) if tarifs else None


def get_budget_stats(criteria, db):
    matiere = criteria.get("matiere")
    if not matiere:
        return None
    variations = get_variations(matiere.lower().strip())
    cat_demandee = criteria.get("niveau")
    query = db.query(Professeur).join(User).filter(
        Professeur.statut_validation=="validé"
    )
    if criteria.get("ville") and criteria.get("mode") == "presentiel":
        query = query.filter(Professeur.ville.ilike(f"%{criteria['ville']}%"))
    profs = query.all()
    tarifs = []
    for p in profs:
        if not p.user: continue
        if cat_demandee:
            cats_prof = get_prof_niveaux(p, db)
            if cat_demandee not in cats_prof:
                continue
        if not prof_match_matiere(p, variations, db):
            continue
        if criteria.get("mode") and p.mode_enseignement:
            mu, mp = criteria["mode"].lower(), p.mode_enseignement.lower()
            if mp != "les_deux" and mp != mu:
                continue
        tarif = get_tarif_min_prof(p, criteria.get("mode"))
        if tarif:
            tarifs.append(tarif)
    if not tarifs:
        return None
    tarifs.sort()
    return {
        "min": min(tarifs),
        "max": max(tarifs),
        "count": len(tarifs),
        "moyenne": round(sum(tarifs)/len(tarifs), 1),
        "tarifs": tarifs
    }


def message_aucun_resultat(criteria, overrides, db=None):
    mat   = (criteria.get("matiere") or "—").capitalize()
    niv   = criteria.get("sous_niveau") or criteria.get("niveau") or "—"
    mode  = "en ligne 🌐" if criteria.get("mode")=="en_ligne" else ("présentiel 🏫" if criteria.get("mode") else "tout mode")
    ville = (criteria.get("ville") or "").capitalize()
    budget = criteria.get("budget_max")

    budget_stats = None
    if db and budget and budget != -1:
        try:
            budget_stats = get_budget_stats(criteria, db)
        except:
            pass

    if budget and budget_stats:
        tarif_min_global = budget_stats["min"]
        if budget < tarif_min_global:
            return (
                f"⚠️ Aucun professeur de **{mat}** ({niv}) ne propose des cours "
                f"à **{budget} DT/h** ou moins.\n\n"
                f"Pour cette matière et ce niveau, les tarifs commencent à "
                f"**{tarif_min_global:.0f} DT/h** (moyenne : {budget_stats['moyenne']:.0f} DT/h, "
                f"{budget_stats['count']} professeur(s) disponible(s)).\n\n"
                f"Que souhaitez-vous faire ?\n"
                f"• Augmenter votre budget à **{tarif_min_global:.0f} DT/h** ou plus ?\n"
                f"• Voir tous les professeurs sans limite de budget ?"
            )
        else:
            return (
                f"⚠️ Aucun professeur de **{mat}** ({niv}) ne correspond exactement "
                f"à votre budget de **{budget} DT/h**.\n\n"
                f"Les tarifs pour ce profil vont de **{budget_stats['min']:.0f}** à "
                f"**{budget_stats['max']:.0f} DT/h**.\n\n"
                f"Souhaitez-vous :\n"
                f"• Ajuster votre budget ?\n"
                f"• Voir tous les professeurs disponibles ?"
            )
    elif "mode" in (overrides or {}):
        mode_label = "en ligne 🌐" if criteria.get("mode")=="en_ligne" else "présentiel 🏫"
        return (
            f"Je vois que vous préférez maintenant les cours **{mode_label}**.\n\n"
            f"⚠️ Malheureusement, aucun professeur de **{mat}** ({niv}) n'est disponible "
            f"en **{mode_label}** pour l'instant.\n\n"
            f"Souhaitez-vous :\n"
            f"• Revenir à l'autre mode ?\n"
            f"• Voir tous les professeurs disponibles quel que soit le mode ?"
        )
    elif criteria.get("ville"):
        return (
            f"⚠️ Aucun professeur de **{mat}** ({niv}) en {mode} trouvé **à {ville}**.\n\n"
            f"Nous avons des professeurs disponibles dans d'autres villes. "
            f"Souhaitez-vous :\n"
            f"• Essayer une autre ville (Tunis, Sousse, Monastir) ?\n"
            f"• Passer aux cours en ligne (plus de choix) ?"
        )
    else:
        return (
            f"⚠️ Aucun professeur de **{mat}** ({niv}) en {mode} ne correspond "
            f"exactement à votre profil pour l'instant.\n\n"
            f"Souhaitez-vous que j'élargisse la recherche :\n"
            f"• Sans contrainte de mode ?\n"
            f"• Avec un budget plus flexible ?\n"
            f"• Dans une autre ville ?"
        )


def generer_profil_ideal(criteria):
    mat    = criteria.get("matiere","—").capitalize()
    niv    = criteria.get("sous_niveau") or (criteria.get("niveau","—").capitalize())
    mode   = "En ligne 🌐" if criteria.get("mode")=="en_ligne" else "Présentiel 🏫" if criteria.get("mode") else "—"
    _bv = criteria.get("budget_max"); budget = f"{_bv} DT/h" if (_bv and _bv != -1) else "Non spécifié"
    diff   = criteria.get("difficultes") or "Accompagnement général"
    obj    = criteria.get("objectifs")   or "Amélioration des résultats"
    style  = criteria.get("style_souhaite") or "Pédagogue et patient"
    creneaux = criteria.get("creneaux")
    creneaux_str = creneaux if (creneaux and creneaux is not False) else "Flexible"
    return (
        f"✨ **Profil du professeur idéal :**\n"
        f"• **Matière :** {mat}\n"
        f"• **Niveau :** {niv}\n"
        f"• **Besoins :** {diff}\n"
        f"• **Objectifs :** {obj}\n"
        f"• **Style :** {style}\n"
        f"• **Mode :** {mode}\n"
        f"• **Budget :** {budget}\n"
        f"• **Créneaux :** {creneaux_str}\n\n"
        f"🔍 Recherche en cours..."
    )


@router.post("/chat")
async def edu_chat(payload: dict, db: Session = Depends(get_db)):
    try:
        messages = payload.get("messages", [])

        if not messages:
            return {
                "reply": (
                    "Bonjour ! 👋 Je suis **EduBot**, l'assistant intelligent d'EduMatch Tunisie.\n\n"
                    "Je vous aide à trouver le professeur ou formateur idéal — **soutien académique** 🎓 "
                    "(scolaire, lycée, bac...) ou **formation professionnelle** 💼 (dev web, IA, reconversion...).\n\n"
                    "Souhaitez-vous une formation **académique** ou **professionnelle** ?"
                ),
                "top3_profs":[],"besoin_complet":False,
                "prochain_critere":"domaine_type","noProfs":False,
                "alternative":None,"criteres":{},
            }

        client = get_groq_client()

        # ── ÉTAPE 1 : Extraction Groq ──
        criteria = {}
        if client:
            try:
                conv_text = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in messages])
                extract_prompt = f"""Extrais les critères depuis les messages USER uniquement.
JSON uniquement (sans markdown) :
{{"domaine_type":null,"matiere":null,"niveau":null,"sous_niveau":null,"budget_max":null,"mode":null,"ville":null,"disponibilite_semaine":null,"difficultes":null,"objectifs":null,"style_souhaite":null}}

CONVERSATION:
{conv_text}

RÈGLES (USER seulement, ignorer ASSISTANT) :
- domaine_type: "academique"(maths/physique/arabe/français/lycée/bac/primaire/collège) | "professionnel"(dev web/IA/cyber/cloud) | null
- matiere: "mathématiques","physique","chimie","anglais","français","arabe","svt","informatique","développement web","intelligence artificielle","cybersécurité","cloud & devops" | null
- niveau: "primaire","college","lycee","universite" | null
  → "bac" seul = "lycee" | "7ème" = "college" | "6ème" = "primaire"
- sous_niveau: sous-niveau PRÉCIS uniquement si explicitement précisé par l'user
  → NE PAS extraire sous_niveau si l'user n'a donné que le niveau général
- budget_max: entier | null
- mode: "en_ligne"|"presentiel"|null
- ville: ville tunisienne USER uniquement | null
- disponibilite_semaine: true|null
- difficultes: résumé si mentionné | null
- objectifs: objectif si mentionné | null
- style_souhaite: "patient"|"strict"|"interactif"|null
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
        for k, v in py_c.items():
            if not criteria.get(k) and v:
                criteria[k] = v
        for k in ["domaine_type","matiere","niveau","sous_niveau","budget_max","mode","ville",
                  "disponibilite_semaine","difficultes","objectifs","style_souhaite","creneaux",
                  "matiere_saisie_brute","ville_saisie_brute"]:
            criteria.setdefault(k, None)

        # ── NORMALISATION budget_max ──
        bv = criteria.get("budget_max")
        if bv is not None:
            try:
                criteria["budget_max"] = int(float(str(bv)))
            except:
                criteria["budget_max"] = None

        # ── "peu importe" budget ──
        last_msg_content = messages[-1]["content"].lower().strip() if messages else ""
        if any(k in last_msg_content for k in ["peu importe","n'importe","sans limite","pas de budget","aucun budget","skip","passer"]):
            criteria["budget_max"] = -1

        # ── ÉTAPE 3 : Override dernier message ──
        criteria_avant = dict(criteria)
        overrides = detect_last_change(messages, criteria_avant)
        has_change = bool(overrides)
        if has_change:
            print(f"🔄 Override: {overrides}")
            for k, v in overrides.items():
                criteria[k] = v

        # ── Si mode = en_ligne → effacer ville (inutile en ligne) ──
        if criteria.get("mode") == "en_ligne":
            criteria["ville"] = None
            criteria["ville_saisie_brute"] = None

        # ── Si user vient de dire "en ligne" suite à une ville invalide → mode en_ligne ──
        kw_enligne_reponse = ["en ligne","online","à distance","virtuel","internet"]
        if any(k in last_msg_content for k in kw_enligne_reponse):
            criteria["mode"] = "en_ligne"
            criteria["ville"] = None
            criteria["ville_saisie_brute"] = None

        # ── ÉTAPE 4 : Recalculer manquants ──
        manquants = get_manquants(criteria)

        ville_invalide = False
        ville_saisie_brute = criteria.get("ville_saisie_brute")

        if criteria.get("mode") == "presentiel":
            if criteria.get("ville"):
                if not any(v in criteria["ville"].lower() for v in VILLES_DISPONIBLES):
                    ville_invalide = True
            elif ville_saisie_brute:
                # L'user a donné une ville non couverte → détecter si la question ville était posée
                msgs_list_v = list(messages)
                last_asst_v = next((m["content"].lower() for m in reversed(msgs_list_v)
                                    if m.get("role") == "assistant"), "")
                if any(k in last_asst_v for k in ["quelle ville","dans quelle ville","ville ?","tunis","sfax","sousse","monastir"]):
                    ville_invalide = True
                    criteria["ville"] = ville_saisie_brute  # pour afficher le nom dans le message

        prochain = manquants[0] if manquants else None
        besoin_complet = not manquants and not ville_invalide

        # ── VÉRIFICATION ANTICIPÉE MATIÈRE ──────────────────────────────────
        # Logique : dès qu'on a un domaine ET que l'user vient de répondre à
        # la question "quelle matière ?", on vérifie immédiatement en BD.
        # Si la matière n'existe pas → on bloque le flow et on répond.
        matiere_introuvable = False
        matiere_inconnue_brute = None

        if criteria.get("domaine_type"):
            # Trouver le dernier message user et le dernier message assistant
            msgs_list = list(messages)
            last_user_txt = ""
            last_asst_txt = ""
            for m in msgs_list[::-1]:
                if m.get("role") == "user" and not last_user_txt:
                    last_user_txt = m["content"].strip()
                elif m.get("role") == "assistant" and not last_asst_txt:
                    last_asst_txt = m["content"].lower()
                if last_user_txt and last_asst_txt:
                    break

            question_matiere_posee = any(k in last_asst_txt for k in [
                "quelle matière", "quelle matiere",
                "matière cherchez", "matiere cherchez",
                "matière souhait", "matiere souhait",
            ])

            # Cas 1 : matière reconnue par Groq/Python → vérifier en BD
            # ET vérifier que le texte brut n'est pas trop générique
            domaine_type = criteria.get("domaine_type")
            if criteria.get("matiere"):
                brut_norm = _normaliser(last_user_txt) if question_matiere_posee else ""
                if brut_norm and brut_norm in MOTS_TROP_GENERIQUES:
                    matiere_introuvable = True
                    matiere_inconnue_brute = last_user_txt
                elif not matiere_existe_en_bd(criteria["matiere"], db, domaine_type):
                    matiere_introuvable = True

            # Cas 2 : matière non reconnue (null) → détecter via texte brut
            elif question_matiere_posee and last_user_txt:
                mots_hors_sujet = [
                    "academique","académique","professionnel","en ligne","presentiel",
                    "présentiel","oui","non","ok","merci","bonjour","salut","d'accord",
                    "peu importe","je veux","je voudrais",
                ]
                txt = last_user_txt.lower()
                is_hors_sujet = any(e in txt for e in mots_hors_sujet)

                if not is_hors_sujet:
                    existe, nom_normalise = matiere_brute_existe_en_bd(txt, db, domaine_type)
                    if existe and nom_normalise:
                        criteria["matiere"] = nom_normalise
                        manquants = get_manquants(criteria)
                        prochain = manquants[0] if manquants else None
                        besoin_complet = not manquants and not ville_invalide
                    elif not existe:
                        matiere_introuvable = True
                        matiere_inconnue_brute = last_user_txt

        print(f"Critères: {criteria}")
        print(f"Manquants: {manquants} | Override: {overrides}")

        # ── ÉTAPE 5 : Recherche ──
        top3 = []
        alternative = None
        jours = criteria.get("disponibilite_semaine") or bool(criteria.get("creneaux"))
        no_profs_message = None

        if besoin_complet and criteria.get("matiere"):
            top3 = search_profs(criteria["matiere"], criteria, db, jours=jours, strict_budget=True)

            if not top3 and criteria.get("budget_max") and criteria.get("budget_max") != -1:
                c_sans_budget = {**criteria, "budget_max": None}
                top3_sans_budget = search_profs(
                    criteria["matiere"], c_sans_budget, db, jours=jours, strict_budget=False
                )
                if top3_sans_budget:
                    no_profs_message = message_aucun_resultat(
                        criteria, {"budget_max": criteria["budget_max"]}, db
                    )
                    top3 = []

            if not top3 and not no_profs_message and "mode" in overrides:
                c2 = {**criteria, "budget_max": None}
                top3_flexible = search_profs(criteria["matiere"], c2, db, jours=jours, strict_budget=False)
                if top3_flexible:
                    no_profs_message = message_aucun_resultat(criteria, overrides, db)
                    top3 = []
                else:
                    c3 = {**criteria, "mode": None, "ville": None}
                    top3 = search_profs(criteria["matiere"], c3, db, jours=jours)

            if not top3 and not no_profs_message:
                print("Fallback: élargir mode/ville...")
                c3 = {**criteria, "mode": None, "ville": None}
                top3 = search_profs(criteria["matiere"], c3, db, jours=jours)

            if not top3 and not no_profs_message:
                print("Fallback: alternatives matière...")
                mat = criteria["matiere"].lower()
                for key, vals in VARIATIONS.items():
                    if mat in key or any(v in mat for v in vals):
                        mat = key
                        break
                for alt in ALTERNATIVES.get(mat, []):
                    res = search_profs(alt, criteria, db)
                    if res:
                        alternative = {
                            "matiere_originale": criteria["matiere"],
                            "matiere_alternative": alt,
                        }
                        top3 = res
                        break

            if not top3 and not no_profs_message:
                no_profs_message = message_aucun_resultat(criteria, overrides or {}, db)

        print(f"Résultats: {len(top3)} profs")

        # ── ÉTAPE 6 : Générer la réponse ──
        QUESTIONS = {
            "domaine_type": "Souhaitez-vous une formation **académique** 🎓 (soutien scolaire, lycée, bac...) ou **professionnelle** 💼 (dev web, IA, reconversion...) ?",
            "matiere":      "Quelle matière cherchez-vous ? 📚\n_(ex: maths, physique, arabe, français, développement web, IA...)_",
            "niveau":       "Quel est le niveau scolaire ? 🎓\n_(primaire, collège, lycée/bac, université...)_",
            "sous_niveau":  None,
            "mode":         "Préférez-vous les cours **en ligne** 🌐 ou **en présentiel** 🏫 ?",
            "ville":        "Dans quelle ville ? 📍\n_(Tunis, Sfax, Sousse ou Monastir)_",
            "budget_max":   "Quel est votre budget maximum par heure en DT ? 💰\n_(tapez un nombre ou 'peu importe')_",
            "creneaux":     "Avez-vous une préférence de créneau ? 📅\n_(ex: lundi matin, week-end, soir... ou 'peu importe')_",
        }

        if prochain == "sous_niveau" and criteria.get("niveau"):
            niv = criteria["niveau"]
            opts = SOUS_NIVEAUX.get(niv, [])
            opts_str = ", ".join(opts)
            QUESTIONS["sous_niveau"] = f"Quel niveau précisément ? 🎓\n_({opts_str})_"

        reply = ""

        if matiere_introuvable:
            mat_nom = (
                matiere_inconnue_brute.capitalize()
                if matiere_inconnue_brute
                else (criteria.get("matiere") or "").capitalize()
            )
            # Lister uniquement les matières disponibles pour ce domaine
            domaine_type = criteria.get("domaine_type")
            matieres_dispo = get_matieres_bd(db, domaine_type)
            noms_dispo = list(dict.fromkeys(m["nom"] for m in matieres_dispo))  # dédupliqués, ordre préservé
            if noms_dispo:
                alts_str = ", ".join(f"**{n}**" for n in noms_dispo)
            else:
                alts_str = "**mathématiques**, **physique**, **arabe**, **français**"
            reply = (
                f"😕 Désolé, notre plateforme ne dispose pas encore de professeurs "
                f"en **{mat_nom}** pour le moment.\n\n"
                f"Les matières actuellement disponibles : {alts_str}.\n\n"
                f"Souhaitez-vous chercher dans une de ces matières ?"
            )
        elif has_change and besoin_complet and not top3 and not alternative and no_profs_message:
            reply = no_profs_message

        elif has_change and top3:
            change_labels = []
            if "mode" in overrides:
                mode_label = "en ligne 🌐" if overrides["mode"]=="en_ligne" else "présentiel 🏫"
                change_labels.append(f"mode {mode_label}")
            if "budget_max" in overrides:
                bv_label = overrides['budget_max']
                if bv_label == -1:
                    change_labels.append("sans limite de budget")
                else:
                    change_labels.append(f"budget max {bv_label} DT/h")
            if "matiere" in overrides:
                change_labels.append(f"matière → {overrides['matiere']}")
            if "ville" in overrides and overrides["ville"]:
                change_labels.append(f"ville → {overrides['ville']}")
            change_str = " et ".join(change_labels) if change_labels else "critère modifié"

            if client:
                try:
                    mat_r = alternative["matiere_alternative"] if alternative else criteria["matiere"]
                    sys_p = f"""Tu es EduBot. L'utilisateur vient de changer {change_str}.
J'ai trouvé {len(top3)} professeur(s) correspondant au nouveau critère.
Écris UNE phrase courte et naturelle qui :
- Confirme le changement pris en compte
- Annonce le nombre de résultats
STYLE: naturel, direct, PAS de répétition du profil complet. MAX 1-2 phrases. INTERDIT: markdown, liste."""
                    r = client.chat.completions.create(
                        model="llama-3.1-8b-instant",
                        messages=[{"role":"system","content":SYSTEM_PROMPT},
                                   {"role":"user","content":sys_p+"\n\nRéponds directement en français."}],
                        temperature=0.3, max_tokens=80
                    )
                    reply = r.choices[0].message.content.strip()
                except:
                    reply = f"✅ Compris ! Voici les résultats avec {change_str} :"
            else:
                reply = f"✅ Compris ! Voici les résultats avec {change_str} :"

        elif ville_invalide:
            ville_nom = (criteria.get("ville") or "").capitalize()
            fallback_msg = (
                f"😕 **{ville_nom}** n'est pas encore couverte par EduMatch.\n\n"
                f"Nous sommes actuellement disponibles à **Tunis**, **Sfax**, **Sousse** et **Monastir**.\n\n"
                f"Souhaitez-vous :\n"
                f"• Choisir une de ces villes ?\n"
                f"• Passer en cours **en ligne** 🌐 (plus de choix) ?"
            )
            if client:
                try:
                    r = client.chat.completions.create(
                        model="llama-3.1-8b-instant",
                        messages=[{"role":"system","content":SYSTEM_PROMPT},
                                   {"role":"user","content":f"Ville '{ville_nom}' non couverte. Villes dispo: Tunis, Sfax, Sousse, Monastir. Écris 2 phrases empathiques : confirme que cette ville n'est pas couverte, propose les 4 villes ET les cours en ligne comme alternative. INTERDIT: listes à puces."}],
                        temperature=0.3, max_tokens=120
                    )
                    reply = r.choices[0].message.content.strip()
                except:
                    reply = fallback_msg
            else:
                reply = fallback_msg

        elif manquants:
            next_q = QUESTIONS.get(prochain)
            if client:
                user_msgs_count = sum(1 for m in messages if m.get("role")=="user")
                dernier = messages[-1]["content"] if messages else ""
                mots_salut = ["bonjour","bonsoir","salut","hello","hi","salam"]
                is_salut = user_msgs_count<=1 and any(s in dernier.lower() for s in mots_salut) and len(dernier.split())<=4
                is_premier = user_msgs_count<=1

                criteres_ok = []
                if criteria["domaine_type"]: criteres_ok.append(f"domaine={'académique' if criteria['domaine_type']=='academique' else 'professionnel'}")
                if criteria["matiere"]:      criteres_ok.append(f"matière={criteria['matiere']}")
                if criteria["niveau"]:       criteres_ok.append(f"niveau={criteria['niveau']}")
                if criteria["sous_niveau"]:  criteres_ok.append(f"sous-niveau={criteria['sous_niveau']}")
                if criteria["mode"]:         criteres_ok.append(f"mode={'en ligne' if criteria['mode']=='en_ligne' else 'présentiel'}")
                if criteria["ville"]:        criteres_ok.append(f"ville={criteria['ville']}")
                if criteria["budget_max"]:   criteres_ok.append(f"budget={criteria['budget_max']}DT/h")
                if criteria.get("creneaux") and criteria["creneaux"] is not False:
                    criteres_ok.append(f"créneau={criteria['creneaux']}")
                ctx = ", ".join(criteres_ok) or "aucun"

                if is_salut:
                    sys_p = "Tu es EduBot d'EduMatch Tunisie. Message de bienvenue chaleureux (2-3 phrases) : te présente, explique que tu trouves le prof idéal (académique ou professionnel), termine par : académique ou professionnel ? INTERDIT: markdown, listes."
                elif is_premier:
                    sys_p = f"""Tu es EduBot d'EduMatch. Message reçu: "{dernier}"
Critères compris: {ctx}. Prochaine question: {next_q}
MODE ANALYSE LIBRE: accuse réception avec empathie (1 phrase), confirme ce compris, pose UNE question. MAX 3 lignes. INTERDIT: listes."""
                else:
                    sys_p = f"""Tu es EduBot d'EduMatch. Critères: {ctx}. Message: "{dernier}". Question suivante: {next_q}
Confirme le dernier critère reçu (ex: "Super, lycée noté !") puis pose la question. MAX 2 phrases. INTERDIT: listes."""

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

        elif top3 and not has_change:
            mat_r = alternative["matiere_alternative"] if alternative else criteria["matiere"]
            noms_dispo = [p["nom"].split()[0] for p in top3 if p["disponibilites"]]
            nb_dispo = len(noms_dispo)
            ville_s = f"à {criteria['ville'].capitalize()}" if criteria.get("ville") else ""

            # Message indiquant si les créneaux affichés correspondent à la préférence
            creneaux = criteria.get("creneaux")
            creneau_filtre = parse_creneau_filter(creneaux) if (creneaux and creneaux is not False) else {}
            creneau_label = ""
            if creneau_filtre.get("jours_semaine") == WEEKEND_DAYS:
                creneau_label = " (créneaux week-end uniquement)"
            elif "date_exacte" in creneau_filtre:
                creneau_label = " (créneaux d'aujourd'hui)"
            elif creneau_filtre.get("jours_semaine"):
                jours_list = [j for j, i in JOURS_SEMAINE.items() if i in creneau_filtre["jours_semaine"]]
                creneau_label = f" (créneaux {', '.join(jours_list)})"

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

                # Message intelligent selon disponibilités trouvées
                if nb_dispo == 0 and creneau_filtre:
                    # Profs trouvés mais aucun créneau correspondant à la préférence
                    profil_msg = (
                        profil + f"\n\n🎯 {len(top3)} professeur(s) trouvé(s) {ville_s}.\n"
                        f"⚠️ Aucun créneau disponible{creneau_label} pour l'instant — "
                        f"les prochaines disponibilités sont affichées ci-dessous."
                    )
                    reply = profil_msg
                elif client and nb_dispo > 0:
                    try:
                        creneau_ctx = f" Créneaux filtrés{creneau_label}." if creneau_label else ""
                        r = client.chat.completions.create(
                            model="llama-3.1-8b-instant",
                            messages=[{"role":"system","content":SYSTEM_PROMPT},
                                       {"role":"user","content":f"J'ai trouvé {len(top3)} profs de {mat_r} {ville_s}.{creneau_ctx} {nb_dispo} ont des créneaux ({', '.join(noms_dispo[:2])}). Annonce en 2 phrases : résultats + prénom(s) + note que les créneaux correspondent à leur préférence si pertinent. INTERDIT: listes."}],
                            temperature=0.3, max_tokens=100
                        )
                        reply = profil + "\n\n" + r.choices[0].message.content.strip()
                    except:
                        reply = profil + f"\n\n🎯 {len(top3)} professeur(s) trouvé(s) {ville_s}{creneau_label} !"
                else:
                    reply = profil + f"\n\n🎯 {len(top3)} professeur(s) trouvé(s) {ville_s} !"

        elif besoin_complet and not top3 and not alternative:
            reply = no_profs_message or message_aucun_resultat(criteria, {}, db)

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
        print(f"❌ ERREUR: {e}")
        traceback.print_exc()
        return {
            "reply":"⚠️ Erreur technique. Veuillez réessayer.",
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

    q = db.query(Disponibilite).filter(
        Disponibilite.prof_id==prof_id,
        Disponibilite.actif==True,
        Disponibilite.date_specifique>=date.today()
    )

    if sous_niveau:
        niveau_ids = get_niveau_ids_pour_sous_niveau(sous_niveau, db)
        if niveau_ids:
            q = q.filter(
                (Disponibilite.niveau_id.in_(niveau_ids)) |
                (Disponibilite.niveau_id == None)
            )

    raw = q.order_by(Disponibilite.date_specifique).limit(10).all()

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