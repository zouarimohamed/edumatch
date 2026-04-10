from app.database import engine
from sqlalchemy import text

from app.database import engine
from sqlalchemy import text

sql = """
CREATE TABLE IF NOT EXISTS messages (
    id               SERIAL PRIMARY KEY,
    reservation_id   INTEGER REFERENCES reservations(id) ON DELETE CASCADE,
    expediteur_id    INTEGER REFERENCES users(id) ON DELETE CASCADE,
    destinataire_id  INTEGER REFERENCES users(id) ON DELETE CASCADE,
    contenu          TEXT,
    fichier_url      VARCHAR(500),
    fichier_nom      VARCHAR(255),
    fichier_type     VARCHAR(50),
    lu               BOOLEAN DEFAULT FALSE,
    created_at       TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_msg_resa ON messages(reservation_id);
CREATE INDEX IF NOT EXISTS idx_msg_dest ON messages(destinataire_id);
"""

with engine.connect() as conn:
    conn.execute(text(sql))
    conn.commit()
    print("✅ Table messages créée avec succès !")

with engine.connect() as conn:
    conn.execute(text("ALTER TABLE etudiants ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500);"))
    conn.commit()
    print("✅ Colonne photo_url ajoutée à etudiants")