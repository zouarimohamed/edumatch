from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime, String
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class ConversationChat(Base):
    __tablename__ = "conversations_chat"

    id          = Column(Integer, primary_key=True, index=True)
    etudiant_id = Column(Integer, ForeignKey("etudiants.id", ondelete="CASCADE"), index=True)
    role        = Column(String(10))   # "user" | "assistant"
    message     = Column(Text, nullable=False)
    metadata_   = Column("metadata", JSONB, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    etudiant = relationship("Etudiant", back_populates="conversations")
