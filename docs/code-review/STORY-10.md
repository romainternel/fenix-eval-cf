# Code Review — STORY-10

> Agent : Code Reviewer | Date : 2026-06-30
> Fichiers examinés : `supabase/functions/manage-coach-account/index.ts`, `supabase/migrations/20260630_add_coach_columns.sql`

---

## Conformité Architecture

✅ Pattern identique à `create-player-account/index.ts` : même structure CORS, même `json()` helper, même logique de validation du caller.

✅ `getCallerAndAdmin()` retourne `{ admin, callerId }` — nécessaire pour la garde auto-suppression. Adaptation correcte du pattern.

✅ `upsert` utilisé (pas `insert`) — correctement identifié par le Developer : le trigger `handle_new_user()` crée une ligne `role='joueur'` au moment du `createUser`, l'upsert l'écrase avec `role='coach'`.

✅ Rollback explicite : si l'upsert échoue, `deleteUser` nettoie le compte auth orphelin.

✅ Suppression `user_profiles` explicite avant `deleteUser` — même si le `ON DELETE CASCADE` est configuré, l'explicite est plus sûr.

---

## Conventions de nommage et style

✅ Nommage TypeScript cohérent avec le fichier de référence.

✅ Pas de logs de debug, pas de `console.log`.

Note : `getCallerAndAdmin` vs `getAdminAndCoach` (fichier référence) — différence de nommage justifiée par le changement de signature de retour. Acceptable.

---

## Réutilisation vs duplication

**Note (non bloquant)** : `cors`, `json()`, et la logique de vérification coach sont dupliqués entre `create-player-account` et `manage-coach-account`. Dans le contexte Supabase Edge Functions (fonctions Deno déployées indépendamment, sans module partagé natif), cette duplication est inévitable. À documenter dans CLAUDE.md si une 3e Edge Function est créée.

---

## Gestion d'erreurs

✅ `createUser` : erreur retournée en JSON avec le message Supabase (ex : "User already registered").

✅ `upsert` : erreur retournée + rollback auth.

✅ `deleteUser` : erreur retournée en JSON.

**Recommandé** : Dans le handler DELETE, si `admin.from('user_profiles').delete()` échoue (silencieux actuellement — aucun `error` checké), le `deleteUser` s'exécute quand même. Avec le CASCADE, ce n'est pas un problème fonctionnel, mais la cohérence serait meilleure avec un check. Pas bloquant étant donné le CASCADE.

---

## Sécurité basique

✅ Aucune clé en dur. `SUPABASE_SERVICE_ROLE_KEY` depuis les env vars.

⚠️ **Signalé au Security Auditor** : le handler DELETE accepte n'importe quel UUID comme `coach_user_id` sans vérifier que la cible est bien un coach. Un coach authentifié pourrait supprimer le compte auth d'un joueur en passant son UUID. → Délégué au Security Auditor pour classification.

---

## Scope

✅ Seuls les fichiers dans le périmètre STORY-10 ont été créés/modifiés.
✅ `create-player-account/index.ts` non touché.
✅ Aucune modification frontend.

---

## Verdict

**APPROUVÉ AVEC RÉSERVES**

- 0 point Bloquant
- 1 point Recommandé (check erreur DELETE user_profiles)
- 1 point signalé au Security Auditor (vérification rôle de la cible en DELETE)
- 1 Note (duplication acceptable entre Edge Functions)

Le Security Auditor doit classer le point signalé avant validation finale.
