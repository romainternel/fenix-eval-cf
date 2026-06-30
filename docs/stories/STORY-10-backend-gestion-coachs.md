# STORY-10 — Backend : schema migration + Edge Function manage-coach-account

**En tant que** coach principal,
**Je veux** que le backend soit prêt à créer et supprimer des comptes coachs de façon atomique,
**Afin de** que le frontend puisse s'y connecter sans risque d'erreur FK ou d'orphan row.

---

## Contexte technique

- **Zone concernée** : `user_profiles` (table SQL Supabase) + nouvelle Edge Function `supabase/functions/manage-coach-account/index.ts`
- **Pattern de référence** : `supabase/functions/create-player-account/index.ts` (même structure, mêmes gardes)
- **Pas de modification** du code frontend dans cette story
- **Prérequis Supabase** : Service Role Key configurée dans les secrets du projet (déjà le cas pour `create-player-account`)

---

## Critères d'acceptation

### Migration SQL
- [ ] Les colonnes `nom TEXT`, `prenom TEXT`, `email TEXT` existent dans `user_profiles` (nullable)
- [ ] Les lignes existantes (joueurs + coach actuel) ne sont pas affectées par la migration (valeurs NULL)
- [ ] Vérification manuelle : `SELECT id, role, nom, prenom, email FROM user_profiles;` renvoie les lignes sans erreur

### RLS — vérification
- [ ] Un coach connecté peut exécuter `SELECT * FROM user_profiles WHERE role='coach'` et obtenir TOUTES les lignes coach (pas seulement la sienne)
- [ ] Si ce n'est pas le cas, la policy SELECT est corrigée pour permettre à un coach de lire toutes les lignes

### Edge Function — création
- [ ] L'Edge Function `manage-coach-account` est déployée et accessible sur `https://wyiylqvreuippmcrzwat.supabase.co/functions/v1/manage-coach-account`
- [ ] POST `{ email, password, nom, prenom }` avec un token coach valide crée un nouvel utilisateur dans `auth.users` + une ligne dans `user_profiles` avec `role='coach'`, `nom`, `prenom`, `email`
- [ ] Le nouvel utilisateur peut se connecter sur `index.html` avec l'email et le mot de passe fournis
- [ ] POST avec un token joueur retourne 401
- [ ] POST sans token retourne 401
- [ ] POST avec un email déjà existant retourne une erreur JSON lisible (pas de 500 silencieux)

### Edge Function — suppression
- [ ] DELETE `{ coach_user_id }` avec un token coach valide supprime la ligne `user_profiles` ET le user `auth.users`
- [ ] DELETE avec `coach_user_id === caller_id` (auto-suppression) retourne 403 avec message "Impossible de supprimer votre propre compte"
- [ ] Après suppression, `SELECT * FROM user_profiles WHERE id = coach_user_id` renvoie 0 ligne
- [ ] Après suppression, la connexion avec les identifiants du coach supprimé échoue sur `index.html`

### Test de déploiement (curl ou Postman)
- [ ] Un test curl POST confirme la création avant que STORY-11 commence
- [ ] Un test curl DELETE confirme la suppression avant que STORY-11 commence

---

## Implémentation guidée

### 1. Migration SQL (à exécuter dans Supabase SQL Editor)

```sql
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS nom    TEXT,
  ADD COLUMN IF NOT EXISTS prenom TEXT,
  ADD COLUMN IF NOT EXISTS email  TEXT;
```

### 2. Vérification RLS

Dans le SQL Editor :
```sql
-- Tester la policy (se connecter comme coach en utilisant l'anon key avec le token)
-- OU vérifier dans Dashboard > Authentication > Policies > user_profiles
-- La policy SELECT doit contenir :
-- USING (id = auth.uid() OR (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'coach')
```

Si la policy actuelle est trop restrictive, modifier :
```sql
DROP POLICY IF EXISTS "coach can read all profiles" ON user_profiles;
CREATE POLICY "coach can read all profiles" ON user_profiles
  FOR SELECT USING (
    id = auth.uid()
    OR (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'coach'
  );
```

### 3. Edge Function `supabase/functions/manage-coach-account/index.ts`

Créer le fichier en suivant exactement le pattern de `create-player-account/index.ts` :
- Même import, même fonction `getAdminAndCoach()`, même structure CORS
- Handler POST : `{ email, password, nom, prenom }` → `createUser` → `insert user_profiles`
- Handler DELETE : `{ coach_user_id }` → vérifier ≠ caller → `delete user_profiles` → `deleteUser`

### 4. Déploiement

```bash
supabase functions deploy manage-coach-account
```

---

## Hors scope

- Aucune modification de `coach-dashboard.js`, `coach.html`, `fenix.css`
- Pas d'UI — cette story est purement backend
- Pas de modification de `create-player-account`

---

## Dépend de

Aucune autre story — cette story est le prérequis de STORY-11.

---

## Taille

**M** — 2 étapes distinctes (SQL + Edge Function), mais chacune est un copier-adapter du pattern existant. Pas de logique nouvelle.
