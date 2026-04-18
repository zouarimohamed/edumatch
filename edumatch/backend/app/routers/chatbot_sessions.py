# app/routers/chatbot_sessions.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.chat_session import ChatSession, ChatMessage
from app.models.etudiant import Etudiant
from app.models.user import User
from app.utils.dependencies import require_etudiant

router = APIRouter()

# ── GET toutes les sessions de l'étudiant ──
@router.get("/sessions")
def get_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_etudiant)
):
    etudiant = db.query(Etudiant).filter(Etudiant.user_id == current_user.id).first()
    if not etudiant:
        raise HTTPException(404, "Étudiant introuvable")
    sessions = db.query(ChatSession).filter(
        ChatSession.etudiant_id == etudiant.id
    ).order_by(ChatSession.updated_at.desc()).all()
    return [
        {
            "id":         s.id,
            "titre":      s.titre,
            "created_at": str(s.created_at),
            "updated_at": str(s.updated_at),
            "nb_messages": len(s.messages),
            "apercu":     s.messages[-1].content[:60] + "…" if s.messages else "",
        }
        for s in sessions
    ]

# ── POST créer une nouvelle session ──
@router.post("/sessions")
def create_session(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_etudiant)
):
    etudiant = db.query(Etudiant).filter(Etudiant.user_id == current_user.id).first()
    if not etudiant:
        raise HTTPException(404, "Étudiant introuvable")
    session = ChatSession(
        etudiant_id=etudiant.id,
        titre=data.get("titre", "Nouvelle conversation")
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"id": session.id, "titre": session.titre, "created_at": str(session.created_at)}

# ── GET messages d'une session ──
@router.get("/sessions/{session_id}/messages")
def get_messages(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_etudiant)
):
    etudiant = db.query(Etudiant).filter(Etudiant.user_id == current_user.id).first()
    session  = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.etudiant_id == etudiant.id
    ).first()
    if not session:
        raise HTTPException(404, "Session introuvable")
    return [
        {"role": m.role, "content": m.content, "created_at": str(m.created_at)}
        for m in session.messages
    ]

# ── POST ajouter un message à une session ──
@router.post("/sessions/{session_id}/messages")
def add_message(
    session_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_etudiant)
):
    etudiant = db.query(Etudiant).filter(Etudiant.user_id == current_user.id).first()
    session  = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.etudiant_id == etudiant.id
    ).first()
    if not session:
        raise HTTPException(404, "Session introuvable")

    msg = ChatMessage(
        session_id=session_id,
        role=data.get("role", "user"),
        content=data.get("content", "")
    )
    db.add(msg)

    # Mettre à jour le titre si c'est le premier message utilisateur
    if data.get("role") == "user" and len(session.messages) == 0:
        titre = data["content"][:50] + ("…" if len(data["content"]) > 50 else "")
        session.titre = titre

    db.commit()
    return {"id": msg.id, "role": msg.role, "content": msg.content}

# ── PUT renommer une session ──
@router.put("/sessions/{session_id}")
def rename_session(
    session_id: int,
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_etudiant)
):
    etudiant = db.query(Etudiant).filter(Etudiant.user_id == current_user.id).first()
    session  = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.etudiant_id == etudiant.id
    ).first()
    if not session:
        raise HTTPException(404, "Session introuvable")
    session.titre = data.get("titre", session.titre)[:100]
    db.commit()
    return {"id": session.id, "titre": session.titre}

# ── DELETE supprimer une session ──
@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_etudiant)
):
    etudiant = db.query(Etudiant).filter(Etudiant.user_id == current_user.id).first()
    session  = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.etudiant_id == etudiant.id
    ).first()
    if not session:
        raise HTTPException(404, "Session introuvable")
    db.delete(session)
    db.commit()
    return {"message": "Session supprimée"}