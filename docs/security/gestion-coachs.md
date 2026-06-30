# Audit Sécurité — Gestion des comptes coachs (STORY-10)

> Agent : Security Access Auditor | Date : 2026-06-30
> Ressources auditées : Edge Function `manage-coach-account`, table `user_profiles` (colonnes ajoutées), RLS existante

---

## Périmètre

| Ressource | Opérations exposées |
|-----------|---------------------|
| `auth.users` (via Edge Function) | Création, suppression |
| `user_profiles` | INSERT/UPDATE (upsert coach), DELETE, SELECT (liste coachs) |
| Edge Function `manage-coach-account` | POST (création), DELETE (suppression) |

---

## Findings

### 🔴 MAJEUR — DELETE sans vérification du rôle de la cible

**Description** : Le handler DELETE accepte `coach_user_id` depuis le body de la requête sans vérifier que l'UUID cible appartient bien à un compte `role='coach'`. Un coach authentifié pourrait donc passer l'UUID d'un joueur et supprimer son compte auth (+ sa ligne `user_profiles`).

**Vecteur** : Appel direct à l'Edge Function (contournement de l'UI) par un coach authentifié.

**Impact** : Suppression du compte joueur — le joueur perd l'accès à l'app, ses évaluations restent en base (liées à `players.id`, pas à `auth.users.id`). Récupération possible via Supabase mais non triviale pour un non-développeur.

**Probabilité** : Faible (requiert un appel direct API intentionnel ou un bug frontend sévère). Mais la fonction doit défendre par elle-même.

**Correction requise** : Ajouter une vérification du rôle de la cible avant toute suppression :

```typescript
const { data: targetProfile } = await admin
  .from('user_profiles').select('role').eq('id', coach_user_id).maybeSingle()
if (!targetProfile || targetProfile.role !== 'coach') {
  return json({ error: 'Utilisateur cible non trouvé ou non coach' }, 404)
}
```

**Statut** : À corriger avant déploiement.

---

### 🟡 MINEUR — Email stocké en dénormalisé dans user_profiles

**Description** : La colonne `email` dans `user_profiles` duplique l'email de `auth.users`. Si l'email est modifié dans Auth (via Supabase dashboard ou future feature), `user_profiles.email` devient obsolète.

**Impact** : Affichage d'un email incorrect dans la liste des coachs. Pas de fuite de données.

**Risque actuel** : Faible — la modification d'email depuis l'app n'est pas dans le scope de cette version.

**Recommandation** : Documenter ce choix de dénormalisation dans CLAUDE.md (section 5 — stockage) pour alerter les futurs développeurs.

**Statut** : Accepté en l'état pour v1 (hors scope de corriger maintenant).

---

## Vérifications sans finding

| Point d'audit | Statut | Justification |
|---------------|--------|---------------|
| Caller non authentifié | ✅ Bloqué | `getCallerAndAdmin` retourne `null` si pas de Bearer token → 401 |
| Caller avec rôle joueur | ✅ Bloqué | `profile?.role !== 'coach'` → retourne `null` → 401 |
| Service Role Key exposée | ✅ Non exposée | Chargée via `Deno.env.get()`, jamais dans le code |
| Auto-suppression | ✅ Bloquée | `coach_user_id === callerId` → 403 avec message explicite |
| Joueur peut lire les emails des autres | ✅ Bloqué | RLS `user_profiles_self` : un joueur ne voit que sa propre ligne |
| Coach peut lire tous les profils | ✅ Autorisé | RLS `user_profiles_self` : `id = auth.uid() OR is_coach()` — intentionnel |
| Joueur peut escalader son rôle | ✅ Impossible | Trigger = `joueur` par défaut ; upsert vers `coach` réservé à l'Edge Function (protégée) |
| CORS origin `*` | ✅ Acceptable | Auth via Bearer token, pas via cookies — standard Supabase Edge Functions |
| Rollback si upsert échoue | ✅ Présent | `deleteUser` appelé si `linkError` |

---

## Verdict

**PAS DE FINDING CRITIQUE — Déploiement conditionnel.**

1 finding **Majeur** à corriger avant déploiement : vérification du rôle de la cible dans le DELETE.

La correction est minime (5 lignes). Le Majeur **ne bloque pas le feu vert** selon les règles du squad (seul un Critique bloque), mais il doit être corrigé avant de passer en prod, et le QA doit valider ce cas de test.
