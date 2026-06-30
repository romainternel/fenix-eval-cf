# Code Review — STORY-11

> Agent : Code Reviewer | Date : 2026-06-30
> Fichiers examinés : `coach.html`, `css/fenix.css`, `pages/coach-dashboard.js`

---

## Conformité Architecture

✅ Onglet ajouté dans la nav — même balise `.tab-btn`, même pattern `onclick="showTab('...')"`, même `id="tab-..."` que les deux onglets existants.

✅ `showTab()` étendu avec `if (tab === 'coachs') renderCoachs()` — cohérent avec le pattern existant.

✅ Versions incrémentées : `fenix.css?v=47` → `v=48`, `coach-dashboard.js?v=39` → `v=40`. Correct.

✅ `.coach-you-badge` ajoutée à la fin du fichier CSS après le bloc `prefers-reduced-motion` — bon emplacement, ne perturbe rien.

✅ Pattern de création modal : identique à `showCreatePlayerModal()` — même `modal-overlay`, même `modal-panel`, même gestion `backdrop click`, même `focus()` premier champ. Cohérence parfaite.

✅ Pattern Edge Function : identique à `submitCreatePlayer()` — même récupération `session.access_token`, même `fetch`, même gestion bouton désactivé.

✅ Gestion erreur "already" : `result.error.toLowerCase().includes('already')` — robuste pour le message Supabase `"User already registered"`. Toast lisible.

✅ `confirm()` natif — conforme à la décision Design (pas de modal custom).

---

## Conventions de nommage et style

✅ `renderCoachs`, `coachCardHTML`, `showCreateCoachModal`, `submitCreateCoach`, `deleteCoach` — camelCase, cohérent.

✅ `let _coaches = []` — préfixe `_` pour état global, cohérent avec `_coachUser`, `_currentSession`.

✅ `gid()`, `escHtml()`, `showToast()`, `closeModal()` — toutes les fonctions utilitaires existantes sont réutilisées.

---

## Réutilisation vs duplication

✅ Aucune duplication : pas de `escHtml` redéfini, pas de `showToast` redéfini.

---

## Scope

✅ Seuls les 3 fichiers du périmètre STORY-11 modifiés. `player-home.js`, `index.html`, `create-player-account`, et tout le reste : intacts.

---

## Gestion d'erreurs

✅ `renderCoachs()` : gestion `error` Supabase → message affiché.

✅ `submitCreateCoach()` : `!res.ok` → erreur lisible, bouton réactivé, modal reste ouvert.

✅ `deleteCoach()` : `!res.ok` → `showToast`. Catch erreur réseau.

---

## Notes

**Note** : Dans `coachCardHTML`, le `displayName` est injecté dans un attribut `onclick="..."` délimité par des apostrophes (`'...'`). Si un nom contient une apostrophe (`O'Brien`), le JS serait syntaxiquement invalide. Ce pattern est identique à `confirmDeletePlayer('${p.id}', '${escHtml(p.prenom)} ${escHtml(p.nom)}')` déjà dans le code — cohérent avec l'existant, acceptable pour des prénoms/noms français où les apostrophes dans les noms propres sont rares.

**Note** : `escHtml(coach.id)` dans l'onclick — les UUIDs ne contiennent jamais de caractères HTML spéciaux, l'appel est donc sans effet, mais pas incorrect.

**Note** : L'email du coach (`coach.email`) est bien récupéré dans la query SELECT mais n'est pas affiché dans `coachCardHTML` — correct (non demandé dans le scope STORY-11, et cohérent avec les maquettes).

---

## Verdict

**APPROUVÉ**

0 point Bloquant. 0 point Recommandé. 3 Notes de style — toutes cohérentes avec l'existant du projet.
