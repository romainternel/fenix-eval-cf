-- ═══════════════════════════════════════════════════════════════════════════
-- Migration : dimension mentale optionnelle par session (STORY-26)
-- À exécuter dans : Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════
-- Les sessions existantes passent à false : aucun changement pour elles.
-- Aucune policy à modifier : sessions_joueur_read (USING true) expose déjà la
-- colonne aux joueurs, et les notes mentales passent par la table evaluations.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS inclut_mental BOOLEAN NOT NULL DEFAULT false;

-- Vérification post-migration (exécuter séparément pour confirmer)
-- SELECT id, label, inclut_mental FROM sessions ORDER BY date_session DESC;
