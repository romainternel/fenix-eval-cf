# STORY-21 — UI création et gestion des référents socio-pro

**En tant que** coach,
**Je veux** créer et supprimer des comptes référents socio-pro depuis l'onglet Coachs,
**Afin de** ne plus avoir à passer par Supabase manuellement pour gérer Marion, Mathilde et Alain.

---

## Contexte technique

L'Edge Function `manage-coach-account` crée des comptes coach. Elle doit accepter un paramètre `role` optionnel pour créer des référents. L'onglet Coachs dans `coach.html` affichera deux sections : Coachs et Référents socio-pro.

---

## Critères d'acceptation

- [ ] L'onglet Coachs affiche deux sections : "Coachs" et "Référents socio-pro"
- [ ] Une note rappelle la différence : Coach = tout / Référent = socio-pro uniquement
- [ ] Bouton "+ Ajouter un référent" ouvre un modal identique au modal coach
- [ ] La création d'un référent appelle l'Edge Function avec `role: 'referent_sociopro'`
- [ ] Le compte créé apparaît immédiatement dans la liste "Référents socio-pro"
- [ ] Bouton "Supprimer" sur chaque référent — confirmation avant suppression
- [ ] Un coach ne peut pas se supprimer lui-même (guard existant côté Edge Function)
- [ ] `manage-coach-account` POST accepte `role` (défaut: `'coach'`, autorisé: `['coach', 'referent_sociopro']`)
- [ ] `manage-coach-account` DELETE accepte `user_id` (nouveau) ou `coach_user_id` (compat) et vérifie que la cible est coach ou referent_sociopro

## Hors scope

- Pas de modification des permissions socio-pro (STORY-19 les gère)
- Pas de modification de l'onglet "Référents" dans fenix-sociopro.html

## Fichiers modifiés

- `supabase/functions/manage-coach-account/index.ts`
- `pages/coach-dashboard.js` (v82 → v83)
- `coach.html` (version coach-dashboard.js)

## Taille

S
