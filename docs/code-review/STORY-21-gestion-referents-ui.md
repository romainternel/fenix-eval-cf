# Code Review — STORY-21 : UI gestion des référents socio-pro

> Reviewer : Code Reviewer · 2026-07-21

---

## Fichiers inspectés

| Fichier | Nature du changement |
|---------|---------------------|
| `supabase/functions/manage-coach-account/index.ts` | POST : param `role` optionnel ; DELETE : `user_id` + compat `coach_user_id` |
| `pages/coach-dashboard.js` v82→v83 | `renderCoachs()` deux sections, +`referentCardHTML`, +`showCreateReferentModal`, +`submitCreateReferent`, +`deleteReferent` |
| `coach.html` | `coach-dashboard.js?v=82` → `v=83` |

---

## Conformité architecture

✅ Même pattern que les fonctions coach existantes — pas de nouvelle abstraction, pas de nouveau CDN.
✅ Edge Function : `role` validé explicitement avant usage (`['coach', 'referent_sociopro'].includes(reqRole)`).
✅ Rétrocompatibilité DELETE : `body.user_id || body.coach_user_id` — les appels existants `deleteCoach` continuent de fonctionner.
✅ `submitCreateReferent` envoie `role: 'referent_sociopro'` en dur — pas de risque d'injection côté client puisque la validation est dans la Edge Function.

---

## Remarques

### Note — `_coaches.filter(c => c.id !== _coachUser.id).length === 0`

La condition du message "Aucun co-coach" est évaluée après avoir rendu toutes les cartes coach. Si le coach connecté est le seul, le message s'affiche sous sa carte. Comportement identique à l'ancienne version — acceptable, pas de régression.

### Note — Pas de `refData.error` vérifié

La query referents (`refData`) n'a pas de gestion d'erreur dédiée. Si elle échoue silencieusement, la section référents s'affiche vide sans message. Cohérent avec le comportement des autres listes du dashboard — acceptable.

### Note — `deleteReferent` utilise `confirm()` natif

Idem `deleteCoach` — cohérence maintenue.

---

## Verdict

**APPROUVÉ**

Aucune remarque bloquante. Trois notes de style mineur, toutes conformes aux patterns existants du projet.
