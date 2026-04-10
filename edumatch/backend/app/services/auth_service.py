from sqlalchemy.orm import Session
from app.models import User
from app.utils.security import verify_password, create_access_token, hash_password

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password):
        return None
    return user

def create_user_token(user: User) -> str:
    return create_access_token({"sub": user.email, "role": user.role})
