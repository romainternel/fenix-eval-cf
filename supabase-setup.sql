-- ═══════════════════════════════════════════════════════════════════════════
-- FENIX Eval CF — Schéma Supabase complet
-- À exécuter dans : Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ── 1. USER PROFILES (rôle coach ou joueur) ──────────────────────────────────
-- Lié à auth.users (créé automatiquement par Supabase Auth)
CREATE TABLE IF NOT EXISTS user_profiles (
  id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role      TEXT NOT NULL DEFAULT 'joueur'  -- 'joueur' | 'coach'
            CHECK (role IN ('joueur', 'coach')),
  player_id UUID,                           -- lié à players.id si rôle joueur
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-création du profil à l'inscription (trigger)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, role)
  VALUES (NEW.id, 'joueur')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ── 2. PLAYERS (créés par le coach) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS players (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom        TEXT NOT NULL,
  prenom     TEXT NOT NULL,
  email      TEXT UNIQUE,
  actif      BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ── 3. PLAYER PROFILES (profil positionnel par saison) ───────────────────────
-- Historique conservé : un changement de poste crée une nouvelle ligne
CREATE TABLE IF NOT EXISTS player_profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id   UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  saison      TEXT NOT NULL,          -- ex: "2025-2026"
  profil_att  TEXT,                   -- 'ailier-att' | 'arr-att' | 'dc-att' | 'pvt-att'
  profil_def  TEXT,                   -- 'n1-def' | 'n2-def' | 'n3-def'
  profil_gb   TEXT,                   -- 'gb' (mutuellement exclusif avec att/def)
  actif       BOOLEAN DEFAULT true,   -- profil courant de la saison
  created_at  TIMESTAMPTZ DEFAULT now(),

  -- Contrainte : soit (att + def), soit gb, pas les deux
  CONSTRAINT check_profil_coherent CHECK (
    (profil_gb IS NOT NULL AND profil_att IS NULL AND profil_def IS NULL)
    OR
    (profil_gb IS NULL AND profil_att IS NOT NULL AND profil_def IS NOT NULL)
  )
);


-- ── 4. SESSIONS D'ÉVALUATION (créées par le coach) ───────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id           TEXT PRIMARY KEY,       -- ex: "EVAL-2025-NOV-01" (lisible + unique)
  label        TEXT NOT NULL,          -- ex: "Évaluation S1 — Novembre 2025"
  saison       TEXT NOT NULL,          -- ex: "2025-2026"
  date_session DATE NOT NULL,
  statut       TEXT NOT NULL DEFAULT 'ouvert'
               CHECK (statut IN ('ouvert', 'ferme')),
  created_by   UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ DEFAULT now(),
  closed_at    TIMESTAMPTZ
);


-- ── 5. ÉVALUATIONS (notes joueur + coach par critère) ────────────────────────
CREATE TABLE IF NOT EXISTS evaluations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  player_id    UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  profil_id    TEXT NOT NULL,          -- profil utilisé à la date de la session
  critere_id   TEXT NOT NULL,          -- ex: "ailier-att-lecture-1"
  note_joueur  SMALLINT CHECK (note_joueur BETWEEN 1 AND 5),
  note_staff   SMALLINT CHECK (note_staff BETWEEN 1 AND 5),
  date_joueur  TIMESTAMPTZ,
  date_staff   TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ DEFAULT now(),

  UNIQUE(session_id, player_id, critere_id)
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_evaluations_session    ON evaluations(session_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_player     ON evaluations(player_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_session_player ON evaluations(session_id, player_id);


-- ── 6. ENTRETIENS / COMPTES-RENDUS ───────────────────────────────────────────
-- Saisie coach, liée à session + joueur, éditable même après fermeture session
CREATE TABLE IF NOT EXISTS entretiens (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  player_id         UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  points_forts      TEXT,
  axes_prioritaires TEXT,
  objectif_ct       TEXT,             -- court terme < 2 mois
  objectif_mt       TEXT,             -- moyen terme (saison)
  cr_entretien      TEXT,             -- compte-rendu libre d'entretien
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),

  UNIQUE(session_id, player_id)
);


-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE user_profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE players        ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE entretiens     ENABLE ROW LEVEL SECURITY;


-- Helper : vérifie si l'utilisateur connecté est coach
CREATE OR REPLACE FUNCTION is_coach()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'coach'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper : récupère le player_id lié à l'utilisateur connecté
CREATE OR REPLACE FUNCTION my_player_id()
RETURNS UUID AS $$
  SELECT player_id FROM user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- user_profiles : chacun voit son propre profil ; le coach voit tout
CREATE POLICY "user_profiles_self"   ON user_profiles FOR SELECT USING (id = auth.uid() OR is_coach());
CREATE POLICY "user_profiles_coach"  ON user_profiles FOR ALL    USING (is_coach());

-- players : coach = lecture/écriture ; joueur = lecture de son propre enregistrement
CREATE POLICY "players_coach_all"    ON players FOR ALL    USING (is_coach());
CREATE POLICY "players_joueur_self"  ON players FOR SELECT USING (id = my_player_id());

-- player_profiles : même logique
CREATE POLICY "pp_coach_all"         ON player_profiles FOR ALL    USING (is_coach());
CREATE POLICY "pp_joueur_self"       ON player_profiles FOR SELECT USING (player_id = my_player_id());

-- sessions : coach = tout ; joueur = lecture des sessions ouvertes + ses sessions passées
CREATE POLICY "sessions_coach_all"   ON sessions FOR ALL    USING (is_coach());
CREATE POLICY "sessions_joueur_read" ON sessions FOR SELECT USING (true);  -- affinée si besoin

-- evaluations : joueur écrit uniquement note_joueur sur son player_id
-- (le check métier se fait côté JS ; Supabase bloque l'écriture cross-player)
CREATE POLICY "eval_coach_all"       ON evaluations FOR ALL    USING (is_coach());
CREATE POLICY "eval_joueur_read"     ON evaluations FOR SELECT USING (player_id = my_player_id());
CREATE POLICY "eval_joueur_write"    ON evaluations FOR INSERT WITH CHECK (player_id = my_player_id());
CREATE POLICY "eval_joueur_update"   ON evaluations FOR UPDATE USING (player_id = my_player_id());

-- entretiens : coach = tout ; joueur = lecture seule de son propre CR
CREATE POLICY "cr_coach_all"         ON entretiens FOR ALL    USING (is_coach());
CREATE POLICY "cr_joueur_read"       ON entretiens FOR SELECT USING (player_id = my_player_id());


-- ═══════════════════════════════════════════════════════════════════════════
-- DONNÉES INITIALES
-- ═══════════════════════════════════════════════════════════════════════════

-- Après avoir créé ton compte coach via l'Auth Supabase,
-- récupère ton user_id (Dashboard → Auth → Users) et exécute :
--
-- UPDATE user_profiles SET role = 'coach' WHERE id = 'TON_USER_ID_ICI';
--
-- ═══════════════════════════════════════════════════════════════════════════
