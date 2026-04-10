from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Numeric, Table, Date, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

prof_niveaux = Table(
    "prof_niveaux", Base.metadata,
    Column("prof_id",   Integer, ForeignKey("professeurs.id", ondelete="CASCADE"), primary_key=True),
    Column("niveau_id", Integer, ForeignKey("niveaux.id",     ondelete="CASCADE"), primary_key=True),
)

class ProfMatiereTarif(Base):
    __tablename__ = "prof_matiere_tarif"
    prof_id    = Column(Integer, ForeignKey("professeurs.id", ondelete="CASCADE"), primary_key=True)
    matiere_id = Column(Integer, ForeignKey("matieres.id",    ondelete="CASCADE"), primary_key=True)
    niveau_id  = Column(Integer, ForeignKey("niveaux.id",     ondelete="CASCADE"), primary_key=True)
    tarif      = Column(Numeric(8, 2), nullable=False, default=0.0)

    matiere = relationship("Matiere", back_populates="professeurs")
    niveau  = relationship("Niveau")

class Certificat(Base):
    __tablename__ = "certificats"
    id          = Column(Integer, primary_key=True, index=True)
    prof_id     = Column(Integer, ForeignKey("professeurs.id", ondelete="CASCADE"))
    titre       = Column(String(200), nullable=False)
    description = Column(Text)
    fichier_url = Column(String(255))
    professeur  = relationship("Professeur", back_populates="certificats")

# ── NOUVEAU : demande d'ajout de matière par un prof ──────────────
class DemandeMatiere(Base):
    __tablename__ = "demandes_matieres"

    id          = Column(Integer, primary_key=True, index=True)
    prof_id     = Column(Integer, ForeignKey("professeurs.id", ondelete="CASCADE"), index=True)
    niveau_id   = Column(Integer, ForeignKey("niveaux.id",     ondelete="CASCADE"))
    nom_matiere = Column(String(150), nullable=False)
    statut      = Column(String(20), default="en_attente")  # en_attente | approuvé | refusé
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    professeur = relationship("Professeur", back_populates="demandes_matieres")
    niveau     = relationship("Niveau")

class Professeur(Base):
    __tablename__ = "professeurs"

    id                = Column(Integer, primary_key=True, index=True)
    user_id           = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    bio               = Column(Text)
    description       = Column(Text)
    ville             = Column(String(50), index=True)
    photo_url         = Column(String(255))
    telephone         = Column(String(20))
    note_moyenne      = Column(Numeric(3, 2), default=0)
    nb_avis           = Column(Integer, default=0)
    statut_validation = Column(String(20), default="en_attente", index=True)
    created_at        = Column(DateTime(timezone=True), server_default=func.now())
    mode_enseignement = Column(String(20), default="presentiel")
    tarif_en_ligne    = Column(Numeric(8, 2), nullable=True)
    tarif_presentiel  = Column(Numeric(8, 2), nullable=True)

    user             = relationship("User",          back_populates="professeur")
    niveaux          = relationship("Niveau",        secondary=prof_niveaux, back_populates="professeurs")
    tarifs_matieres  = relationship("ProfMatiereTarif", cascade="all, delete-orphan")
    certificats      = relationship("Certificat",    back_populates="professeur", cascade="all, delete-orphan")
    disponibilites   = relationship("Disponibilite", back_populates="professeur", cascade="all, delete")
    reservations     = relationship("Reservation",   back_populates="professeur")
    avis             = relationship("Avis",          back_populates="professeur")
    demandes_matieres = relationship("DemandeMatiere", back_populates="professeur", cascade="all, delete-orphan")