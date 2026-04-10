from sqlalchemy import Column, Integer, ForeignKey, Date, Time, DateTime, Numeric, Text, String, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Reservation(Base):
    __tablename__ = "reservations"

    id               = Column(Integer, primary_key=True, index=True)
    etudiant_id      = Column(Integer, ForeignKey("etudiants.id",      ondelete="CASCADE"), index=True)
    prof_id          = Column(Integer, ForeignKey("professeurs.id",    ondelete="CASCADE"), index=True)
    disponibilite_id = Column(Integer, ForeignKey("disponibilites.id"), nullable=True)
    date_cours       = Column(Date,  nullable=False)
    heure_debut      = Column(Time,  nullable=False)
    heure_fin        = Column(Time,  nullable=False)
    statut           = Column(String(20), default="en_attente", index=True)
    tarif_applique   = Column(Numeric(8, 2))
    notes_etudiant   = Column(Text)

    # NOUVEAUX CHAMPS
    mode_seance      = Column(String(20), default="presentiel")  # en_ligne | presentiel
    lien_meet        = Column(String(500), nullable=True)        # généré auto si en_ligne

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    etudiant      = relationship("Etudiant",      back_populates="reservations")
    professeur    = relationship("Professeur",    back_populates="reservations")
    disponibilite = relationship("Disponibilite", back_populates="reservations")
    avis          = relationship("Avis",          back_populates="reservation", uselist=False)