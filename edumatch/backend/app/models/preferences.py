from sqlalchemy import Column, Integer, ForeignKey, DateTime, Numeric, String, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class PreferencesEtudiant(Base):
    __tablename__ = "preferences_etudiant"

    id             = Column(Integer, primary_key=True, index=True)
    etudiant_id    = Column(Integer, ForeignKey("etudiants.id", ondelete="CASCADE"))
    matiere_id     = Column(Integer, ForeignKey("matieres.id"), nullable=True)
    niveau_id      = Column(Integer, ForeignKey("niveaux.id"),  nullable=True)
    ville          = Column(String(50))
    budget_max     = Column(Numeric(8, 2))
    disponibilite  = Column(String(100))
    priorite_note  = Column(Boolean, default=False)
    priorite_prix  = Column(Boolean, default=False)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())
    updated_at     = Column(DateTime(timezone=True), onupdate=func.now())

    etudiant = relationship("Etudiant", back_populates="preferences")
    matiere  = relationship("Matiere",  back_populates="preferences")
    niveau   = relationship("Niveau",   back_populates="preferences")
