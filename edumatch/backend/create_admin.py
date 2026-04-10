import bcrypt
from app.database import SessionLocal
from app.models.user import User

def main():
    db = SessionLocal()

    # Vérifier si admin existe déjà
    existing = db.query(User).filter(User.email == 'admin@edumatch.tn').first()
    if existing:
        print("Admin existe déjà !")
        db.close()
        return

    # Hash password directement avec bcrypt
    password = b"admin123"
    hashed = bcrypt.hashpw(password, bcrypt.gensalt())

    admin = User(
        nom='Admin EduMatch',
        email='admin@edumatch.tn',
        password=hashed.decode('utf-8'),
        role='admin',
        statut='actif'
    )
    db.add(admin)
    db.commit()
    print("✅ Admin créé avec succès !")
    print("   Email    : admin@edumatch.tn")
    print("   Password : admin123")
    db.close()

if __name__ == "__main__":
    main()