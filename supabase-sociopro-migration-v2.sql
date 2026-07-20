-- ─── Migration socio-pro v2 ───────────────────────────────────────────────
-- À exécuter dans Supabase SQL Editor (une seule fois)
-- Objectif : accès coachs aux données socio-pro + table actions de réunion

-- 1. Mettre à jour is_cellule() pour inclure le rôle 'coach'
CREATE OR REPLACE FUNCTION is_cellule()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('cellule', 'coach')
  );
$$;

-- 2. Créer la table des actions de réunion collective
CREATE TABLE IF NOT EXISTS ssp_actions_reunion (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_reunion DATE NOT NULL DEFAULT CURRENT_DATE,
  joueur_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action       TEXT NOT NULL,
  responsable  TEXT,
  statut       TEXT NOT NULL DEFAULT 'a_faire'
               CHECK (statut IN ('a_faire', 'en_cours', 'fait')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ssp_actions_reunion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cellule_coach_actions_all" ON ssp_actions_reunion
  FOR ALL USING (is_cellule()) WITH CHECK (is_cellule());
