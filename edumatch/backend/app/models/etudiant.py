from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Etudiant(Base):
    __tablename__ = "etudiants"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    ville      = Column(String(50))
    niveau     = Column(String(50))
    telephone  = Column(String(20))
    bio        = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user         = relationship("User", back_populates="etudiant")
    # On met les autres relations en commentaires ou on s'assure qu'elles pointent vers les bons noms
    reservations = relationship("Reservation", back_populates="etudiant")
    avis         = relationship("Avis", back_populates="etudiant")
    preferences  = relationship("PreferencesEtudiant", back_populates="etudiant")
    conversations = relationship("ConversationChat", back_populates="etudiant")