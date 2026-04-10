from sqlalchemy import Column, Integer, ForeignKey, Time, Date, Boolean, DateTime, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Disponibilite(Base):
    __tablename__ = "disponibilites"

    id               = Column(Integer, primary_key=True, index=True)
    prof_id          = Column(Integer, ForeignKey("professeurs.id", ondelete="CASCADE"), index=True)
    date_specifique  = Column(Date, nullable=True)
    jour_semaine     = Column(Integer, nullable=True)
    heure_debut      = Column(Time, nullable=False)
    heure_fin        = Column(Time, nullable=False)
    nb_max_etudiants = Column(Integer, default=1, nullable=False)
    nb_inscrits      = Column(Integer, default=0, nullable=False)
    mode_seance      = Column(String(20), default="presentiel")
    actif            = Column(Boolean, default=True)
    description      = Column(Text, nullable=True)        # ← AJOUTÉ
    created_at       = Column(DateTime(timezone=True), server_default=func.now())

    professeur   = relationship("Professeur",  back_populates="disponibilites")
    reservations = relationship("Reservation", back_populates="disponibilite")