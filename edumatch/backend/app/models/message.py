from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime, String, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Message(Base):
    __tablename__ = "messages"

    id          = Column(Integer, primary_key=True, index=True)
    reservation_id = Column(Integer, ForeignKey("reservations.id", ondelete="CASCADE"), index=True)
    expediteur_id  = Column(Integer, ForeignKey("users.id",         ondelete="CASCADE"), index=True)
    destinataire_id= Column(Integer, ForeignKey("users.id",         ondelete="CASCADE"), index=True)
    contenu     = Column(Text, nullable=True)
    fichier_url = Column(String(500), nullable=True)
    fichier_nom = Column(String(255), nullable=True)
    fichier_type= Column(String(50),  nullable=True)   # image | pdf | file
    lu          = Column(Boolean, default=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    expediteur   = relationship("User", foreign_keys=[expediteur_id])
    destinataire = relationship("User", foreign_keys=[destinataire_id])
    reservation  = relationship("Reservation")