# Analyse des risques — Gestion des comptes coachs

> Agent : Risk Analyst | Date : 2026-06-30 | Feature : gestion-coachs
> Source : docs/arch/gestion-coachs.md

---

## Tableau des risques

| # | Risque | Prob. | Impact | Priorité | Recommandation |
|---|--------|-------|--------|---------|---------------|
| R1 | Auto-suppression : coach supprime son propre compte → lockout immédiat | Faible | Critique | **P0** | Double garde : côté frontend (bouton absent) ET côté Edge Function (vérifier `coach_user_id !== caller.id`) |
| R2 | RLS trop restrictive : un coach ne peut pas lire les autres coachs dans `user_profiles` | Faible | Élevé | **P1** | Vérifier la policy SELECT avant le dev frontend ; si nécessaire, ajouter `role = 'coach'` OR `id = auth.uid()` |
| R3 | Email déjà utilisé dans Auth : la création échoue sans message clair | Moyenne | Moyen | **P1** | Parser le message d'erreur Supabase (`User already registered`) et afficher "Cet email est déjà utilisé" |
| R4 | Suppression accidentelle d'un co-coach actif | Faible | Élevé | **P1** | `confirm()` natif obligatoire avec le nom du coach dans le message ("Supprimer Max Gilbert ?") |
| R5 | user_profiles non supprimé si le CASCADE FK n'est pas actif → orphan row | Faible | Moyen | **P1** | Supprimer user_profiles explicitement dans l'Edge Function AVANT `deleteUser()` |
| R6 | Ancien coach sans `nom`/`prenom` dans user_profiles → affichage cassé | Certaine | Faible | **P2** | Afficher "Coach" par défaut si `nom` est null. Le coach courant (Romain) n'a pas de nom stocké initialement |
| R7 | Mot de passe trop court : Supabase accepte mais l'UX n'avertit pas | Faible | Faible | **P2** | Validation côté client (min 8 chars) + vérifier le paramètre `minimum_password_length` dans les settings Supabase Auth |
| R8 | Edge Function non déployée : appels silencieusement échoués (404) | Possible | Élevé | **P1** | Inclure le déploiement CLI dans les critères d'acceptation de STORY-10 et tester avant STORY-11 |
| R9 | Session expirée pendant l'opération : Bearer token invalide | Très faible | Faible | **P3** | L'erreur 401 de l'Edge Function est catchée → toast "Session expirée, reconnectez-vous" |

---

## Risques P0 — Bloquants avant tout développement

### R1 — Auto-suppression = lockout

**Scénario** : Le coach principal, distrait, supprime sa propre ligne dans la liste.

**Conséquence** : Son compte auth est supprimé. Il ne peut plus se connecter. Il n'a pas accès à Supabase dashboard pour se recréer. L'app est inutilisable pour lui.

**Mitigations requises (les deux ensemble) :**
1. **Frontend** : Bouton "Supprimer" absent (pas juste `disabled`) sur la carte du compte courant (`coach.id === _coachUser.id`)
2. **Edge Function** : Vérification que `coach_user_id !== caller_id` dans le handler DELETE. Si égaux → retourner 403 avec message "Impossible de supprimer votre propre compte"

**Critère d'acceptation P0** : Inclure dans STORY-10 et STORY-11. Non négociable.

---

## Risques P1 — À traiter dans les stories

### R2 — RLS restrictive sur `user_profiles`

**Scénario** : `renderCoachs()` fait `SELECT * FROM user_profiles WHERE role='coach'` → renvoie seulement la ligne du coach courant si la policy est `id = auth.uid()`.

**Mitigation** : Vérifier la policy en STORY-10 avec une requête test. Si restrictive, ajouter : `USING (id = auth.uid() OR (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'coach')`.

**Story concernée** : STORY-10 — critère d'acceptation "la requête list renvoie tous les coachs".

---

### R3 — Erreur API "email déjà utilisé"

**Scénario** : Le coach saisit un email qui existe déjà dans Supabase Auth (ex : un joueur avec le même email).

**Mitigation** : Dans `submitCreateCoach()`, parser la réponse d'erreur :
```javascript
if (result.error?.includes('already registered') || result.error?.includes('already been registered')) {
  showToast('Cet email est déjà utilisé par un autre compte')
} else {
  showToast(result.error || 'Erreur lors de la création')
}
```

**Story concernée** : STORY-11 — critère d'acceptation "les erreurs API sont lisibles".

---

### R4 — Suppression accidentelle

**Scénario** : Tap malencontreux sur "Supprimer" sans lire le nom.

**Mitigation** : `confirm('Supprimer ${displayName} ?\nCette action est irréversible.')` — la modale native du navigateur est suffisante pour une opération rare.

**Story concernée** : STORY-11 — critère d'acceptation "confirmation obligatoire avant suppression".

---

### R5 — Orphan row si pas de CASCADE

**Scénario** : `auth.admin.deleteUser(id)` réussit mais la FK `user_profiles.id → auth.users.id` n'a pas `ON DELETE CASCADE` → la ligne reste dans `user_profiles` et pollue la liste.

**Mitigation** : Dans l'Edge Function DELETE, toujours exécuter `DELETE FROM user_profiles WHERE id = coach_user_id` AVANT `deleteUser()`.

**Story concernée** : STORY-10 — critère d'acceptation "après suppression, la ligne user_profiles est absente".

---

### R8 — Edge Function non déployée

**Scénario** : Le Developer écrit le code frontend qui appelle `manage-coach-account` mais la fonction n'est pas déployée → 404 silencieux ou erreur réseau.

**Mitigation** : STORY-10 se termine par un test curl de l'Edge Function avant que STORY-11 commence. Inclure dans les critères d'acceptation de STORY-10.

---

## Risques P2 — Traiter dans la story sans bloquer

### R6 — Affichage coach existant sans nom

Le coach actuel (Romain) n'a pas de `nom`/`prenom` dans `user_profiles` (colonnes ajoutées en migration). Fallback dans `coachCardHTML()` : `coach.prenom || coach.nom ? `${coach.prenom} ${coach.nom}` : 'Coach'`.

### R7 — Mot de passe trop court

Validation JS client : `if (pwd.length < 8) { afficher erreur inline }` avant d'appeler l'Edge Function.

---

## Risques P3 — Acceptés en l'état

### R9 — Session expirée pendant opération

Cas très rare (session Supabase dure 1h, auto-refresh). Si ça arrive, le 401 de l'Edge Function génère un toast. Pas de gestion spéciale nécessaire.

---

## Résumé des stories de mitigation

| Story | Mitigations intégrées |
|-------|----------------------|
| STORY-10 (Backend) | R1 (garde EF), R2 (vérif RLS), R5 (delete explicite), R8 (test déploiement) |
| STORY-11 (Frontend) | R1 (bouton absent), R3 (parsing erreur), R4 (confirm()), R6 (fallback nom), R7 (validation client) |
