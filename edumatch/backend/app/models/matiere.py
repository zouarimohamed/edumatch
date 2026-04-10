from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Domaine(Base):
    __tablename__ = "domaines"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), unique=True, nullable=False)
    
    niveaux = relationship("Niveau", back_populates="domaine", cascade="all, delete-orphan")

class Niveau(Base):
    __tablename__ = "niveaux"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False)
    ordre = Column(Integer)
    domaine_id = Column(Integer, ForeignKey("domaines.id", ondelete="CASCADE"))
    
    domaine = relationship("Domaine", back_populates="niveaux")
    matieres = relationship("Matiere", back_populates="niveau", cascade="all, delete-orphan")
    
    # INDISPENSABLE : Ces relations doivent exister pour que SQLAlchemy ne plante pas
    professeurs = relationship("Professeur", secondary="prof_niveaux", back_populates="niveaux")
    preferences = relationship("PreferencesEtudiant", back_populates="niveau")

class Matiere(Base):
    __tablename__ = "matieres"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(100), nullable=False)
    niveau_id = Column(Integer, ForeignKey("niveaux.id", ondelete="CASCADE"))
    actif = Column(Boolean, default=True)

    niveau = relationship("Niveau", back_populates="matieres")
    professeurs = relationship("ProfMatiereTarif", back_populates="matiere")
    preferences = relationship("PreferencesEtudiant", back_populates="matiere")

class Ville(Base):
    __tablename__ = "villes"
    id    = Column(Integer, primary_key=True, index=True)
    nom   = Column(String(100), unique=True, nullable=False)
    actif = Column(Boolean, default=True)