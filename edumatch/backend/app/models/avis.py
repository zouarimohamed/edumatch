from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Avis(Base):
    __tablename__ = "avis"

    id             = Column(Integer, primary_key=True, index=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id"), unique=True)
    etudiant_id    = Column(Integer, ForeignKey("etudiants.id"),    index=True)
    prof_id        = Column(Integer, ForeignKey("professeurs.id"),  index=True)
    note           = Column(Integer, CheckConstraint("note BETWEEN 1 AND 5"), nullable=False)
    commentaire    = Column(Text)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())

    reservation = relationship("Reservation", back_populates="avis")
    etudiant    = relationship("Etudiant",    back_populates="avis")
    professeur  = relationship("Professeur",  back_populates="avis")
