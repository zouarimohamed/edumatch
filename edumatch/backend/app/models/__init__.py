# app/models/__init__.py — REMPLACER par ce contenu
from app.models.user import User
from app.models.etudiant import Etudiant
from app.models.professeur import Professeur, ProfMatiereTarif, prof_niveaux, Certificat, DemandeMatiere
from app.models.matiere import Domaine, Niveau, Matiere, Ville
from app.models.reservation import Reservation
from app.models.disponibilite import Disponibilite
from app.models.avis import Avis
from app.models.preferences import PreferencesEtudiant
from app.models.conversation import ConversationChat
from app.models.message import Message
from app.models.chat_session import ChatSession, ChatMessage   # ← NOUVEAU

__all__ = [
    "User", "Etudiant", "Professeur", "ProfMatiereTarif", "prof_niveaux",
    "Certificat", "DemandeMatiere",
    "Matiere", "Niveau", "Ville", "Domaine", "Reservation", "Disponibilite",
    "Avis", "PreferencesEtudiant", "ConversationChat", "Message",
    "ChatSession", "ChatMessage",                              # ← NOUVEAU
]