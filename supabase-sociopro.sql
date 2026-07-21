-- ============================================================
-- Module Socio-Pro — FENIX Toulouse HB · Centre de Formation
-- Script COMPLET (à exécuter une seule fois dans Supabase SQL Editor)
-- Rôles : 'referent_sociopro' (Marion, Mathilde, Alain)
--         'coach' (Romain, Max — accès CF + socio-pro)
-- ============================================================

-- ── 1. Tables ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ssp_profils (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  joueur_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  formation         TEXT,
  projet_pro        TEXT,
  referent          TEXT,
  tuteur            TEXT,
  contrat_scolarite TEXT DEFAULT 'a_jour',  -- 'a_jour' | 'en_cours' | 'non_signe'
  lien_drive        TEXT,
  notes_profil      TEXT,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE (joueur_id)
);

CREATE TABLE IF NOT EXISTS ssp_orientations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  joueur_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date_changement  DATE NOT NULL,
  formation        TEXT,
  projet_pro       TEXT,
  note             TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ssp_entretiens (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  joueur_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date                  DATE NOT NULL,
  mene_par              TEXT,
  mot_du_joueur         TEXT,
  ce_qui_va             TEXT,
  ce_qui_ne_va_pas      TEXT,
  echeances             TEXT,
  comment_aider         TEXT,
  actions_suivant       JSONB DEFAULT '[]',
  examens               JSONB DEFAULT '[]',
  commentaire_examens   TEXT,
  notes_cellule         TEXT,
  couleur               TEXT CHECK (couleur IN ('vert','orange','rouge')),
  couleur_justification TEXT,
  created_at            TIMESTAMPTZ DEFAULT now(),
  created_by            UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS ssp_reprises (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entretien_id UUID REFERENCES ssp_entretiens(id) ON DELETE CASCADE,
  action       TEXT,
  statut       TEXT CHECK (statut IN ('fait','en_cours','non_fait'))
);

CREATE TABLE IF NOT EXISTS ssp_actions_reunion (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_reunion DATE NOT NULL DEFAULT CURRENT_DATE,
  joueur_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action       TEXT NOT NULL,
  responsable  TEXT,
  statut       TEXT NOT NULL DEFAULT 'a_faire'
               CHECK (statut IN ('a_faire','en_cours','fait')),
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ── 2. Trigger updated_at ─────────────────────────────────────

CREATE OR REPLACE FUNCTION ssp_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ssp_profils_updated_at ON ssp_profils;
CREATE TRIGGER ssp_profils_updated_at
  BEFORE UPDATE ON ssp_profils
  FOR EACH ROW EXECUTE FUNCTION ssp_set_updated_at();

-- ── 3. Fonction helper RLS ────────────────────────────────────
-- Retourne TRUE pour referent_sociopro ET coach
-- (les deux rôles ont accès complet au module socio-pro)

CREATE OR REPLACE FUNCTION is_sociopro_membre()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('referent_sociopro', 'coach')
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ── 4. RLS ────────────────────────────────────────────────────

ALTER TABLE ssp_profils        ENABLE ROW LEVEL SECURITY;
ALTER TABLE ssp_orientations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ssp_entretiens     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ssp_reprises       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ssp_actions_reunion ENABLE ROW LEVEL SECURITY;

-- ssp_profils : referent/coach = tout, joueur = le sien
DROP POLICY IF EXISTS "sp_membre_all_profils"  ON ssp_profils;
DROP POLICY IF EXISTS "sp_joueur_own_profil"   ON ssp_profils;
CREATE POLICY "sp_membre_all_profils" ON ssp_profils
  FOR ALL TO authenticated USING (is_sociopro_membre()) WITH CHECK (is_sociopro_membre());
CREATE POLICY "sp_joueur_own_profil"  ON ssp_profils
  FOR SELECT TO authenticated USING (joueur_id = auth.uid());

-- ssp_orientations : referent/coach = tout, joueur = les siennes
DROP POLICY IF EXISTS "sp_membre_all_orientations"  ON ssp_orientations;
DROP POLICY IF EXISTS "sp_joueur_own_orientations"  ON ssp_orientations;
CREATE POLICY "sp_membre_all_orientations" ON ssp_orientations
  FOR ALL TO authenticated USING (is_sociopro_membre()) WITH CHECK (is_sociopro_membre());
CREATE POLICY "sp_joueur_own_orientations" ON ssp_orientations
  FOR SELECT TO authenticated USING (joueur_id = auth.uid());

-- ssp_entretiens : referent/coach = tout, joueur = les siens (notes_cellule filtrée côté JS)
DROP POLICY IF EXISTS "sp_membre_all_entretiens"  ON ssp_entretiens;
DROP POLICY IF EXISTS "sp_joueur_own_entretiens"  ON ssp_entretiens;
CREATE POLICY "sp_membre_all_entretiens" ON ssp_entretiens
  FOR ALL TO authenticated USING (is_sociopro_membre()) WITH CHECK (is_sociopro_membre());
CREATE POLICY "sp_joueur_own_entretiens" ON ssp_entretiens
  FOR SELECT TO authenticated USING (joueur_id = auth.uid());

-- ssp_reprises : suit les droits de l'entretien parent
DROP POLICY IF EXISTS "sp_membre_all_reprises"  ON ssp_reprises;
DROP POLICY IF EXISTS "sp_joueur_own_reprises"  ON ssp_reprises;
CREATE POLICY "sp_membre_all_reprises" ON ssp_reprises
  FOR ALL TO authenticated USING (is_sociopro_membre()) WITH CHECK (is_sociopro_membre());
CREATE POLICY "sp_joueur_own_reprises" ON ssp_reprises
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM ssp_entretiens e
      WHERE e.id = entretien_id AND e.joueur_id = auth.uid()
    )
  );

-- ssp_actions_reunion : referent/coach = tout, joueur = aucun accès
DROP POLICY IF EXISTS "sp_membre_all_actions_reunion" ON ssp_actions_reunion;
CREATE POLICY "sp_membre_all_actions_reunion" ON ssp_actions_reunion
  FOR ALL TO authenticated USING (is_sociopro_membre()) WITH CHECK (is_sociopro_membre());

-- ── 5. Policies sur tables CF existantes ─────────────────────
-- Les référents socio-pro ont besoin de lire players et player_profiles
-- (tables créées par supabase-setup.sql, RLS déjà activée)

CREATE POLICY IF NOT EXISTS "players_sociopro_read" ON players
  FOR SELECT TO authenticated USING (is_sociopro_membre());

CREATE POLICY IF NOT EXISTS "pp_sociopro_read" ON player_profiles
  FOR SELECT TO authenticated USING (is_sociopro_membre());

CREATE POLICY IF NOT EXISTS "referent_read_user_profiles" ON user_profiles
  FOR SELECT TO authenticated USING (is_sociopro_membre());

-- Contrainte de rôle élargie (si la contrainte CHECK originale n'inclut pas referent_sociopro)
-- ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_role_check;
-- ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check
--   CHECK (role IN ('joueur', 'coach', 'referent_sociopro'));

-- ── 6. Attribution des rôles (à adapter selon les UUID réels) ─
-- Exécuter ces commandes APRÈS avoir récupéré les UUID depuis
-- Supabase > Authentication > Users
--
-- Référents socio-pro (Marion, Mathilde, Alain) :
-- UPDATE user_profiles SET role = 'referent_sociopro' WHERE id = '<uuid-marion>';
-- UPDATE user_profiles SET role = 'referent_sociopro' WHERE id = '<uuid-mathilde>';
-- UPDATE user_profiles SET role = 'referent_sociopro' WHERE id = '<uuid-alain>';
--
-- Les coachs (Romain, Max) gardent role = 'coach' — déjà OK s'ils ont un compte coach.
-- S'ils n'ont pas encore de compte, créer via l'onglet Coachs dans coach.html.
