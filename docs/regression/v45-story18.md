# Rapport de régression — app.js v45 (STORY-18)

> Agent : Regression Guardian · 2026-07-21

---

## Changements de cette version

- `js/app.js` v44 → v45 : rôle `'cellule'` → `'referent_sociopro'` dans `requireAuth()`
- `index.html` : idem post-login
- `fenix-sociopro.html` : `requireAuth(['referent_sociopro', 'coach'])`, versions v45/v3
- `pages/sociopro-dashboard.js` v2 → v3 : `_spRole` par défaut mis à jour
- `coach.html`, `player.html` : `app.js?v=44` → `v=45`

---

## Analyse des risques de régression

Les fichiers `coach.html` et `player.html` n'ont reçu qu'une mise à jour de version `?v=45` — leur logique est inchangée. `app.js` a reçu une modification chirurgicale d'une seule ligne (ligne 30). Les features R03–R19 ne sont pas dans le chemin de code modifié.

---

## Points à risque ciblés

| Item | Risque | Verdict |
|------|--------|---------|
| R01 — Login email/password | `getRole()` appelé dans le même fichier modifié | ✅ RAS — `getRole()` non modifié |
| R02 — Routage par rôle | Ligne 30 modifiée dans `requireAuth()` | ✅ RAS — coach et joueur inchangés, referent_sociopro correctement ajouté |
| R04 — Évaluation joueur | `player.html` reçoit app.js v45 | ✅ RAS — `requireAuth('joueur')` non touché |
| R05 — Sessions coach | `coach.html` reçoit app.js v45 | ✅ RAS — logique coach inchangée |
| R12 — Export PPT | `coach.html` non touché sur la logique | ✅ RAS |
| R18 — Bilan entretien in-app | `player.html` logique inchangée | ✅ RAS |

---

## Features non concernées (test de fumée recommandé au déploiement)

R03, R06–R11, R13–R17, R19 — pas dans le périmètre des fichiers modifiés.

---

## Verdict

**RAS — Aucune régression détectée.**

STORY-18 est prête pour la mise en production.
