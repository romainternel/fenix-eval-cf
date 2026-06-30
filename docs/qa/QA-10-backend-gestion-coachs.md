# QA — STORY-10 : Backend gestion coachs

> Agent : QA | Date : 2026-06-30
> Sources : STORY-10, Code Review STORY-10, Security Audit gestion-coachs

---

## Lecture du Code Reviewer

- Verdict : APPROUVÉ AVEC RÉSERVES
- Point signalé au Security Auditor : vérification rôle cible en DELETE → **corrigé dans la foulée**
- Recommendation check erreur delete user_profiles : non bloquant (CASCADE présent) → accepté

## Lecture du Security Auditor

- Majeur : DELETE sans vérif rôle cible → **corrigé avant QA** (5 lignes ajoutées)
- Mineur : email dénormalisé → accepté en v1

---

## Critères d'acceptation — Validation

### Migration SQL

| Critère | Statut | Justification |
|---------|--------|---------------|
| Colonnes `nom`, `prenom`, `email` nullable dans `user_profiles` | ✅ | `ADD COLUMN IF NOT EXISTS [col] TEXT` — nullable par défaut |
| Lignes existantes non affectées | ✅ | Colonnes nullable → valeur NULL pour les lignes existantes |
| Requête de vérification disponible | ✅ | Incluse en commentaire dans le fichier migration |

### RLS — vérification

| Critère | Statut | Justification |
|---------|--------|---------------|
| Coach peut lire toutes les lignes `user_profiles` | ✅ | Policy `user_profiles_self` : `id = auth.uid() OR is_coach()` — confirmé dans `supabase-setup.sql` ligne 168 |
| Aucune modification de policy requise | ✅ | Policy déjà correcte |

### Edge Function — création (POST)

| Critère | Statut | Justification |
|---------|--------|---------------|
| Déployée et accessible | ⏳ | À confirmer par déploiement réel (hors périmètre QA statique) |
| POST valide → auth user + user_profiles(role='coach') | ✅ | `createUser` + `upsert` avec `role:'coach', nom, prenom, email` |
| Trigger `handle_new_user()` écrasé par upsert | ✅ | Le trigger crée `role='joueur'`, l'upsert le remplace par `role='coach'` |
| Nouvel utilisateur peut se connecter | ✅ | `email_confirm: true` → compte confirmé immédiatement |
| POST token joueur → 401 | ✅ | Guard `profile?.role !== 'coach'` → `null` → `json({error}, 401)` |
| POST sans token → 401 | ✅ | `if (!authHeader) return null` → 401 |
| POST email déjà existant → erreur JSON lisible | ✅ | `createError.message` retourné en JSON (ex: "User already registered") |
| Champs manquants → 400 | ✅ | `if (!email || !password || !nom || !prenom)` → 400 |
| Rollback si upsert échoue | ✅ | `deleteUser(newUser.user.id)` appelé si `linkError` |

### Edge Function — suppression (DELETE)

| Critère | Statut | Justification |
|---------|--------|---------------|
| DELETE valide → supprime `user_profiles` ET `auth.users` | ✅ | `.delete().eq('id', ...)` puis `deleteUser` |
| DELETE auto-suppression → 403 | ✅ | `coach_user_id === callerId` → 403 |
| Après suppression, 0 ligne dans `user_profiles` | ✅ | Suppression explicite + CASCADE |
| Connexion avec compte supprimé échoue | ✅ | `deleteUser` supprime l'entrée auth.users |
| DELETE UUID joueur → 404 (fix Majeur) | ✅ | `targetProfile.role !== 'coach'` → 404 (ajouté après Security Audit) |
| DELETE sans `coach_user_id` → 400 | ✅ | `if (!coach_user_id)` → 400 |

### Test de déploiement

| Critère | Statut | Note |
|---------|--------|------|
| Test curl POST confirme création | ⏳ | À exécuter après `supabase functions deploy manage-coach-account` |
| Test curl DELETE confirme suppression | ⏳ | Idem — test manuel requis |

---

## Cas limites testés (analyse statique)

| Cas | Comportement attendu | Statut |
|-----|---------------------|--------|
| `nom` = chaîne vide `""` | `!nom` → true → 400 | ✅ |
| `coach_user_id` UUID invalide | `maybeSingle()` → null → 404 | ✅ |
| Même email créé 2 fois | `createError.message` → JSON lisible | ✅ |
| Caller avec session expirée | `getUser()` → null → 401 | ✅ |
| DELETE `coach_user_id` d'un joueur | `targetProfile.role !== 'coach'` → 404 | ✅ |

---

## Régressions

STORY-10 ne modifie aucun fichier frontend, aucune Edge Function existante, et aucune table existante (seulement `ADD COLUMN` sur `user_profiles`). **Zéro risque de régression sur les features existantes.**

La fonction `create-player-account` : non touchée. ✅

---

## Bugs trouvés

Aucun bug bloquant. La correction du Majeur security finding a été faite avant cette phase QA.

---

## Verdict

**PASSED WITH NOTES**

✅ Tous les critères vérifiables statiquement sont satisfaits.
⏳ 2 critères nécessitent un test en environnement réel (déploiement + curl) — à valider par l'utilisateur après `supabase functions deploy manage-coach-account` et exécution de la migration SQL.

**Condition de passage en prod** : exécuter la migration SQL + déployer l'Edge Function + faire un test curl de création et de suppression.
