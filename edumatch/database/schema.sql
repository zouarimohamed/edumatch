-- ══════════════════════════════════════════════════
--   SCHEMA PostgreSQL – pfe_db
--   EduMatch: Plateforme Matching Professeur-Étudiant
-- ══════════════════════════════════════════════════

-- Créer la base
-- CREATE DATABASE pfe_db;
-- \c pfe_db

-- TABLE USERS
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    nom         VARCHAR(100) NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(20) NOT NULL DEFAULT 'étudiant',
    statut      VARCHAR(20) DEFAULT 'actif',
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

-- TABLE ETUDIANTS
CREATE TABLE IF NOT EXISTS etudiants (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    ville       VARCHAR(50),
    niveau      VARCHAR(50),
    telephone   VARCHAR(20),
    bio         TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- TABLE PROFESSEURS
CREATE TABLE IF NOT EXISTS professeurs (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bio                 TEXT,
    description         TEXT,
    ville               VARCHAR(50),
    tarif               DECIMAL(8,2),
    diplome             VARCHAR(200),
    cv_url              VARCHAR(255),
    photo_url           VARCHAR(255),
    telephone           VARCHAR(20),
    note_moyenne        DECIMAL(3,2) DEFAULT 0,
    nb_avis             INTEGER DEFAULT 0,
    statut_validation   VARCHAR(20) DEFAULT 'en_attente',
    created_at          TIMESTAMP DEFAULT NOW()
);

-- TABLE MATIERES
CREATE TABLE IF NOT EXISTS matieres (
    id    SERIAL PRIMARY KEY,
    nom   VARCHAR(100) UNIQUE NOT NULL,
    actif BOOLEAN DEFAULT TRUE
);

-- TABLE NIVEAUX
CREATE TABLE IF NOT EXISTS niveaux (
    id    SERIAL PRIMARY KEY,
    nom   VARCHAR(100) UNIQUE NOT NULL,
    ordre INTEGER,
    actif BOOLEAN DEFAULT TRUE
);

-- TABLE VILLES
CREATE TABLE IF NOT EXISTS villes (
    id    SERIAL PRIMARY KEY,
    nom   VARCHAR(100) UNIQUE NOT NULL,
    actif BOOLEAN DEFAULT TRUE
);

-- TABLE PROF_MATIERES (many-to-many)
CREATE TABLE IF NOT EXISTS prof_matieres (
    prof_id     INTEGER REFERENCES professeurs(id) ON DELETE CASCADE,
    matiere_id  INTEGER REFERENCES matieres(id) ON DELETE CASCADE,
    PRIMARY KEY (prof_id, matiere_id)
);

-- TABLE PROF_NIVEAUX (many-to-many)
CREATE TABLE IF NOT EXISTS prof_niveaux (
    prof_id     INTEGER REFERENCES professeurs(id) ON DELETE CASCADE,
    niveau_id   INTEGER REFERENCES niveaux(id) ON DELETE CASCADE,
    PRIMARY KEY (prof_id, niveau_id)
);

-- TABLE DISPONIBILITES
CREATE TABLE IF NOT EXISTS disponibilites (
    id           SERIAL PRIMARY KEY,
    prof_id      INTEGER REFERENCES professeurs(id) ON DELETE CASCADE,
    jour_semaine INTEGER CHECK (jour_semaine BETWEEN 1 AND 7),
    heure_debut  TIME NOT NULL,
    heure_fin    TIME NOT NULL,
    actif        BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMP DEFAULT NOW()
);

-- TABLE RESERVATIONS
CREATE TABLE IF NOT EXISTS reservations (
    id               SERIAL PRIMARY KEY,
    etudiant_id      INTEGER REFERENCES etudiants(id) ON DELETE CASCADE,
    prof_id          INTEGER REFERENCES professeurs(id) ON DELETE CASCADE,
    disponibilite_id INTEGER REFERENCES disponibilites(id),
    date_cours       DATE NOT NULL,
    heure_debut      TIME NOT NULL,
    heure_fin        TIME NOT NULL,
    statut           VARCHAR(20) DEFAULT 'en_attente',
    tarif_applique   DECIMAL(8,2),
    notes_etudiant   TEXT,
    created_at       TIMESTAMP DEFAULT NOW(),
    updated_at       TIMESTAMP DEFAULT NOW()
);

-- TABLE AVIS
CREATE TABLE IF NOT EXISTS avis (
    id             SERIAL PRIMARY KEY,
    reservation_id INTEGER UNIQUE REFERENCES reservations(id),
    etudiant_id    INTEGER REFERENCES etudiants(id),
    prof_id        INTEGER REFERENCES professeurs(id),
    note           INTEGER CHECK (note BETWEEN 1 AND 5),
    commentaire    TEXT,
    created_at     TIMESTAMP DEFAULT NOW()
);

-- TABLE PREFERENCES_ETUDIANT (remplie par le chatbot)
CREATE TABLE IF NOT EXISTS preferences_etudiant (
    id             SERIAL PRIMARY KEY,
    etudiant_id    INTEGER REFERENCES etudiants(id) ON DELETE CASCADE,
    matiere_id     INTEGER REFERENCES matieres(id),
    niveau_id      INTEGER REFERENCES niveaux(id),
    ville          VARCHAR(50),
    budget_max     DECIMAL(8,2),
    disponibilite  VARCHAR(100),
    priorite_note  BOOLEAN DEFAULT FALSE,
    priorite_prix  BOOLEAN DEFAULT FALSE,
    created_at     TIMESTAMP DEFAULT NOW(),
    updated_at     TIMESTAMP DEFAULT NOW()
);

-- TABLE CONVERSATIONS_CHAT
CREATE TABLE IF NOT EXISTS conversations_chat (
    id          SERIAL PRIMARY KEY,
    etudiant_id INTEGER REFERENCES etudiants(id) ON DELETE CASCADE,
    role        VARCHAR(10) CHECK (role IN ('user', 'assistant')),
    message     TEXT NOT NULL,
    metadata    JSONB,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ──────────────────────────────────────────────────
-- INDEXES
-- ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_prof_ville    ON professeurs(ville);
CREATE INDEX IF NOT EXISTS idx_prof_statut   ON professeurs(statut_validation);
CREATE INDEX IF NOT EXISTS idx_res_etudiant  ON reservations(etudiant_id);
CREATE INDEX IF NOT EXISTS idx_res_prof      ON reservations(prof_id);
CREATE INDEX IF NOT EXISTS idx_res_statut    ON reservations(statut);
CREATE INDEX IF NOT EXISTS idx_avis_prof     ON avis(prof_id);
CREATE INDEX IF NOT EXISTS idx_conv_etud     ON conversations_chat(etudiant_id);

-- ──────────────────────────────────────────────────
-- DONNÉES INITIALES
-- ──────────────────────────────────────────────────
INSERT INTO matieres (nom) VALUES
  ('Mathématiques'),('Physique'),('Chimie'),('Français'),('Anglais'),
  ('Arabe'),('SVT'),('Histoire-Géo'),('Informatique'),('Philosophie')
ON CONFLICT DO NOTHING;

INSERT INTO niveaux (nom, ordre) VALUES
  ('Primaire',1),('Collège 1ère',2),('Collège 2ème',3),('Collège 3ème',4),
  ('Lycée 1ère',5),('Lycée 2ème',6),('Lycée 3ème (Bac)',7),
  ('Université L1',8),('Université L2',9),('Université L3',10),('Master',11)
ON CONFLICT DO NOTHING;

INSERT INTO villes (nom) VALUES
  ('Tunis'),('Sfax'),('Sousse'),('Monastir'),('Nabeul'),
  ('Bizerte'),('Kairouan'),('Ariana'),('Ben Arous'),('Mahdia')
ON CONFLICT DO NOTHING;

-- Compte admin par défaut (mot de passe: admin123 – à changer en prod!)
-- INSERT INTO users (nom, email, password, role) VALUES ('Admin EduMatch', 'admin@edumatch.tn', '$2b$12$...bcrypt_hash...', 'admin');
