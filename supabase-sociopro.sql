-- ============================================================
-- Module Socio-Pro — FENIX Toulouse HB · Centre de Formation
-- Étape 1 : Créer les tables + RLS dans Supabase
-- Coller ce script dans l'éditeur SQL Supabase
-- ============================================================

-- ── 1. Tables ────────────────────────────────────────────────

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

-- ── 2. Trigger updated_at ────────────────────────────────────

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

-- ── 3. Helper : est-ce un membre cellule ? ───────────────────

CREATE OR REPLACE FUNCTION is_cellule()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'cellule'
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ── 4. RLS ───────────────────────────────────────────────────

ALTER TABLE ssp_profils      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ssp_orientations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ssp_entretiens   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ssp_reprises     ENABLE ROW LEVEL SECURITY;

-- ssp_profils : cellule = tout, joueur = le sien
DROP POLICY IF EXISTS "cellule_all_profils"  ON ssp_profils;
DROP POLICY IF EXISTS "joueur_own_profil"    ON ssp_profils;
CREATE POLICY "cellule_all_profils" ON ssp_profils FOR ALL TO authenticated USING (is_cellule()) WITH CHECK (is_cellule());
CREATE POLICY "joueur_own_profil"   ON ssp_profils FOR SELECT TO authenticated USING (joueur_id = auth.uid());

-- ssp_orientations : cellule = tout, joueur = les siennes
DROP POLICY IF EXISTS "cellule_all_orientations"  ON ssp_orientations;
DROP POLICY IF EXISTS "joueur_own_orientations"   ON ssp_orientations;
CREATE POLICY "cellule_all_orientations" ON ssp_orientations FOR ALL TO authenticated USING (is_cellule()) WITH CHECK (is_cellule());
CREATE POLICY "joueur_own_orientations"  ON ssp_orientations FOR SELECT TO authenticated USING (joueur_id = auth.uid());

-- ssp_entretiens : cellule = tout, joueur = les siens (notes_cellule filtrée côté JS)
DROP POLICY IF EXISTS "cellule_all_entretiens"  ON ssp_entretiens;
DROP POLICY IF EXISTS "joueur_own_entretiens"   ON ssp_entretiens;
CREATE POLICY "cellule_all_entretiens" ON ssp_entretiens FOR ALL TO authenticated USING (is_cellule()) WITH CHECK (is_cellule());
CREATE POLICY "joueur_own_entretiens"  ON ssp_entretiens FOR SELECT TO authenticated USING (joueur_id = auth.uid());

-- ssp_reprises : suit les droits de l'entretien parent
DROP POLICY IF EXISTS "cellule_all_reprises"  ON ssp_reprises;
DROP POLICY IF EXISTS "joueur_own_reprises"   ON ssp_reprises;
CREATE POLICY "cellule_all_reprises" ON ssp_reprises FOR ALL TO authenticated USING (is_cellule()) WITH CHECK (is_cellule());
CREATE POLICY "joueur_own_reprises"  ON ssp_reprises FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM ssp_entretiens e
    WHERE e.id = entretien_id AND e.joueur_id = auth.uid()
  ));

-- ── 5. Note post-déploiement ─────────────────────────────────
-- Ajouter le rôle 'cellule' dans user_profiles pour chaque membre :
-- UPDATE user_profiles SET role = 'cellule' WHERE id = '<auth_user_id>';
-- Membres : Marion Agostini, Mathilde Soulié, Alain Raynal, Romain, Max, Rémi
