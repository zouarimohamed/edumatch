# create_meet_migration.py
from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text("ALTER TABLE disponibilites ADD COLUMN IF NOT EXISTS lien_meet VARCHAR(500);"))
    conn.commit()
    print("✅ Done")