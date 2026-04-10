from sqlalchemy import Column, Integer, String, DateTime, Date  # Ajout de Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    nom        = Column(String(100), nullable=False)
    prenom     = Column(String(100)) # AJOUT : Pour l'identité complète
    email      = Column(String(150), unique=True, index=True, nullable=False)
    password   = Column(String(255), nullable=False)
    role       = Column(String(20), nullable=False, default="étudiant")
    
    # AJOUT : Date de naissance pour le profil
    date_naissance = Column(Date, nullable=True) 
    
    statut     = Column(String(20), default="actif") # actif, suspendu, en_attente
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relations (Utilisation de chaînes pour éviter les imports circulaires)
    etudiant   = relationship("Etudiant", back_populates="user", uselist=False, cascade="all, delete-orphan")
    professeur = relationship("Professeur", back_populates="user", uselist=False, cascade="all, delete-orphan")