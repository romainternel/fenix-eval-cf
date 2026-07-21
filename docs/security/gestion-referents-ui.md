# Security Audit — UI gestion des référents (STORY-21)

> Auditor : Security Access Auditor · 2026-07-21

---

## Périmètre

- Edge Function `manage-coach-account` : extension POST (role param) et DELETE (user_id compat)
- `coach-dashboard.js` : création et suppression de comptes referent_sociopro
- Aucune nouvelle table backend — pas de nouvelles policies RLS à auditer

---

## Findings

### Aucun finding Critique

---

### Mineur — M1 : Validation du rôle côté client inutile mais inoffensive

`submitCreateReferent` envoie `role: 'referent_sociopro'` en dur dans le corps de la requête. Un utilisateur malveillant pourrait modifier ce corps (via DevTools) et envoyer `role: 'coach'`. La Edge Function valide que `reqRole` est dans `['coach', 'referent_sociopro']` — les deux rôles sont autorisés à être créés par un coach, donc pas de privilège excessif accordé.

**Impact :** Nul — un coach peut créer des coachs et des référents, les deux sont des opérations légitimes pour ce rôle.

---

### Mineur — M2 : Guard DELETE — seul un coach peut supprimer

`getCallerAndAdmin` vérifie que l'appelant a `role = 'coach'`. Un `referent_sociopro` ne peut pas appeler la Edge Function pour supprimer un autre compte — il obtient un 401. ✅

---

## Vérification des scénarios d'escalade de privilège

| Scénario | Résultat | OK ? |
|----------|---------|------|
| Un joueur tente de créer un référent (pas de token coach) | Edge Function retourne 401 | ✅ |
| Un référent tente de supprimer un coach | Edge Function retourne 401 (non coach) | ✅ |
| Un coach crée un compte avec `role: 'joueur'` en modifiant le body | Edge Function retourne 400 (rôle invalide) | ✅ |
| Un coach crée un compte avec `role: 'admin'` | Edge Function retourne 400 (rôle invalide) | ✅ |
| DELETE sans `user_id` ni `coach_user_id` | Edge Function retourne 400 | ✅ |
| Un coach se supprime lui-même | Edge Function retourne 403 | ✅ |

---

## Verdict

**Aucun finding Critique. STORY-21 peut passer en QA.**

> Rappel STORY-19 : déployer l'Edge Function mise à jour avant de créer les comptes référents.
