-- ═══════════════════════════════════════════════════════════════════════════
-- Migration : ajout colonnes nom / prenom / email sur user_profiles
-- À exécuter dans : Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════════════
-- Contexte : permet d'afficher les noms des coachs dans la liste sans
-- requêtes admin, et de stocker l'email en dénormalisé (lecture seule RLS
-- ne permet pas d'accéder à auth.users directement depuis le client).
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS nom    TEXT,
  ADD COLUMN IF NOT EXISTS prenom TEXT,
  ADD COLUMN IF NOT EXISTS email  TEXT;

-- Vérification post-migration (exécuter séparément pour confirmer)
-- SELECT id, role, nom, prenom, email FROM user_profiles;
