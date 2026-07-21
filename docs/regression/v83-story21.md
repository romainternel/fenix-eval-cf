# Rapport de régression — coach-dashboard.js v83 (STORY-21)

> Agent : Regression Guardian · 2026-07-21

---

## Changements de cette version

- `pages/coach-dashboard.js` v82 → v83 : `renderCoachs()` restructurée (deux sections), +`referentCardHTML`, +`showCreateReferentModal`, +`submitCreateReferent`, +`deleteReferent`
- `supabase/functions/manage-coach-account/index.ts` : POST accepte `role` optionnel, DELETE accepte `user_id` ou `coach_user_id`
- `coach.html` : `coach-dashboard.js?v=82` → `v=83`

---

## Analyse des risques de régression

### R10 — Edge Function manage-coach-account (coach_user_id compat)

`deleteCoach` envoie `{ coach_user_id }`. La Edge Function lit `body.user_id || body.coach_user_id` — la valeur `coach_user_id` est bien lue. Pas de régression.

### R11 — Interface gestion coachs

`renderCoachs()` charge toujours les coachs en premier. La section coachs affiche toujours la liste et le bouton "+ Ajouter un coach". `coachCardHTML`, `showCreateCoachModal`, `submitCreateCoach`, `deleteCoach` sont **inchangés**. Pas de régression.

### R05 — Sessions, R06 — Radar, R04 — Évaluation joueur

Non dans le périmètre des fichiers modifiés. RAS.

---

## Points à risque ciblés

| Item | Risque | Verdict |
|------|--------|---------|
| R10 — `deleteCoach` avec `coach_user_id` | Compat supprimée ? | ✅ RAS — `body.user_id \|\| body.coach_user_id` |
| R11 — Section coachs toujours présente | `renderCoachs` réécrite | ✅ RAS — section coachs intacte |
| R12 — Export PPT | `coach-dashboard.js` modifié | ✅ RAS — fonctions PPT non touchées |

---

## Verdict

**RAS — Aucune régression détectée.**

STORY-21 est prête pour la mise en production.

> **Action requise avant tests** : déployer l'Edge Function mise à jour via `supabase functions deploy manage-coach-account`.
