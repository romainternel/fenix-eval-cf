# Architecture — Dimension mentale

> Agent : Architect · 2026-11-12 · Sources : `docs/prd.md`, `docs/design/dimension-mentale.md`, code existant

---

## 1. Décision technique

**Le mental est un profil de plus (`mental`) dans `CRITERIA`, activé par session via `sessions.inclut_mental`.**

- Notes stockées dans **`evaluations` existante** : `profil_id = 'mental'`, `critere_id = 'mental-{axe}-{n}'`. Aucune nouvelle table, aucune nouvelle policy RLS.
- Un seul changement de schéma :
  ```sql
  ALTER TABLE sessions ADD COLUMN IF NOT EXISTS inclut_mental BOOLEAN NOT NULL DEFAULT false;
  ```
- Le **périmètre des profils évalués** pour (joueur × session) devient une fonction centrale unique au lieu de calculs dispersés :

```js
// js/criteria-data.js (ou app.js)
function sessionProfilIds(profile, session) {
  // profile = { profil_att, profil_def, profil_gb } ; session = { inclut_mental }
  const ids = profile?.profil_gb ? ['gb'] : [profile?.profil_att, profile?.profil_def].filter(Boolean);
  if (session?.inclut_mental) ids.push('mental');
  return ids;
}
function sessionTotalCriteres(profile, session) {
  return sessionProfilIds(profile, session).reduce((s, id) => s + getAllCriteres(id).length, 0);
}
```
`mental` ne dépend **pas** du profil technique : même un joueur sans profil actif a 16 critères mentaux dans une session mentale (mais voir risque R6 : l'écran de notation exige aujourd'hui un profil).

## 2. Pourquoi (alternatives rejetées)

| Alternative | Rejetée parce que |
|---|---|
| Nouvelle table `mental_evaluations` | Duplique RLS, requêtes, radars, comparaison ; tout le code évaluations/radar/PPT est paramétré par `profil_id` → réutilisation gratuite |
| Mental obligatoire à chaque session | Contraire au besoin (1×/an) ; alourdit l'éval technique |
| Case à cocher stockée côté front/localStorage | Le joueur doit connaître l'option → doit vivre en base, lisible via `sessions_joueur_read` (USING true) |
| Table `session_modules(session_id, module)` | Sur-ingénierie pour un seul module ; une colonne booléenne suffit. Critère de bascule §7 |
| Détecter le mental par présence de notes `mental-*` | Impossible avant que le joueur n'ait noté ; totaux/onglets instables |

## 3. Impact sur l'existant

### Points de calcul de total à corriger (les seuls)
| Fichier:ligne | Aujourd'hui | Après |
|---|---|---|
| `pages/player-home.js:90-94` (`totalCriteres`) | total **par joueur**, sorti de la boucle des cartes | total **par session** : calculé dans `sessionCard(s)` via `sessionTotalCriteres(_playerProfile, s)` |
| `pages/coach-dashboard.js:205-207` (`getPlayerStatus`) | total par joueur | `sessionTotalCriteres(prof, _currentSessionObj)` — nécessite que `loadSessionPlayerList` ait la session (`inclut_mental`) |
| `pages/coach-dashboard.js:176` (moyenne staff par profil) | `getAllCriteres(profilId)` | inchangé (par profil) ; ajouter `mental` à la liste des profils parcourus si session mentale |

> **Piège identifié** : les compteurs `countMap` (coach) et `notesBySession` (joueur) comptent **toutes** les lignes `evaluations` d'une session. Dès que des notes `mental-*` existent, le compteur monte : si le total n'est pas aussi augmenté de 16, un joueur apparaît « Complet » trop tôt. D'où la correction **simultanée** compteur/total (STORY-27/28), jamais l'une sans l'autre.

### Écrans touchés
- **Joueur** `player-home.js` : `showSessionsList`, `showEvaluation` (doit lire la session → `inclut_mental`), `startEvaluation`, `renderChampEval` (+ onglet), `renderGbEval` (+ barre d'onglets si mental), `switchProfilTab` (étendre à `'mental'`), `updateProgressBadges`, `_doTerminerProfil` (chaîne ATT → DEF → Mental), `showPlayerRadar` (+ 3e radar `_pChartMental`, évalMap, détail axe).
- **Coach** `coach-dashboard.js` : `showCreateSessionModal`/`submitCreateSession` (case + colonne), `renderSessionCard` + `showSessionDetail` (badge + interrupteur), `showCoachEval` (+ onglet Mental, y compris joueur sans onglets GB), `coachSwitchProfil`, `getPlayerStatus`, `showCoachRadar` (+ radar Mental), `cRenderBilan`/`cRenderBarChart`/`cRenderTrendTable`/`cRecapTableHTML` (profil mental), `exportCoachPPT` (+ slide).
- **`criteria-data.js`** : bloc `mental` + 2 helpers. `getCritereById` déjà compatible (`mental-competition-1` → profil `mental`, axe `competition`, num `1`) **à condition que les ids d'axes n'aient pas de tiret**.
- **`css/fenix.css`** : tokens `--mental*`, `.profil-tab.mental`, `.btn-axe-eval.mental`, `.badge-mental`, `.mental-option`, interrupteur, `.card.mental`.
- **HTML** : bumper `?v=` (css 51, criteria-data 34, app 46 si modifié, player-home 46, coach-dashboard 91+).

### Ce qui ne change pas
RLS, Edge Functions, `session_player_statut`, `comptes_rendus`, flux d'authentification, sessions existantes (`inclut_mental = false` par défaut → aucun changement).

## 4. Nouvelles structures de données

### `CRITERIA.mental`
```js
"mental": {
  label: "Dimension mentale",
  type:  "mental",
  axes: {
    "competition": { label: "Compétition", criteres: [ {id:"mental-competition-1", label:"…", texte:"…"}, … 4 ] },
    "travail":     { label: "Travail",     criteres: [ … 4 ] },
    "groupe":      { label: "Groupe",      criteres: [ … 4 ] },
    "projet":      { label: "Projet de vie", criteres: [ … 4 ] }
  }
}
```
- Libellés d'onglets d'axes courts (« Compétition », « Travail », « Groupe », « Projet »).
- Le `type: "mental"` est consommé comme **classe CSS** (`btn-axe-eval ${type}`) → d'où le CSS `.mental`.
- `PROFIL_LABELS` (coach) : ajouter `mental: 'Dimension mentale'`.

### `sessions.inclut_mental BOOLEAN NOT NULL DEFAULT false`
Migration livrée en fichier `supabase/migrations/20261112_add_inclut_mental.sql` **et** à exécuter manuellement dans le SQL Editor (pas de pipeline de migration).

## 5. Nouvelles fonctions / responsabilités

| Fonction | Rôle |
|---|---|
| `sessionProfilIds(profile, session)` | Source unique des profils à évaluer |
| `sessionTotalCriteres(profile, session)` | Total attendu pour (joueur × session) |
| `toggleSessionMental(sessionId, checked)` (coach) | Met à jour `inclut_mental` ; refuse la désactivation si `evaluations` contient `critere_id LIKE 'mental-%'` pour la session ; refuse si session fermée |
| `buildMentalRadar(...)` | **Pas de nouvelle fonction** : réutiliser `buildSessionRadar(canvasId, 'mental')` existant (le radar est paramétré par `profilId`) |
| `renderMentalDeltaRows(evalMap)` | Génère les 4 lignes « Moi / Staff / écart » sous le radar (présentation pure) |

**Règle d'insertion à la création** (non bloquante sans migration) :
```js
const row = { id, label, saison, date_session, statut:'ouvert', created_by };
if (fd.get('inclut_mental')) row.inclut_mental = true;   // la clé n'est envoyée QUE si cochée
```
→ créer une session classique continue de marcher même si la migration n'est pas encore appliquée.

**Lecture tolérante** : partout, `session.inclut_mental === true` (jamais `if (s.inclut_mental)` sur une valeur `undefined` interprétée autrement ; `undefined` ⇒ faux).

## 6. Risques techniques (résumé — détail dans `docs/risks/dimension-mentale.md`)

1. Régression silencieuse des totaux/« Complet » (deux sites + compteurs).
2. Ordre de déploiement SQL/front.
3. Radar à 4 axes peu lisible → compensé par les lignes de valeurs.
4. `type: 'mental'` absent du CSS → onglets/axes sans style.
5. Joueur sans profil technique bloqué par l'écran « Aucun profil assigné ».

## 7. Critère de bascule

Passer de la colonne booléenne à une table `session_modules(session_id, module_id)` **quand un 2e module optionnel apparaît** (ex. module « Physique » du fichier Excel). Le coût de bascule est faible : `sessionProfilIds()` reste l'unique point à adapter, ce qui est la raison de le centraliser dès maintenant.

Refonte plus large (nouvelle table d'évaluations) seulement si le mental devait avoir une échelle ou une structure de réponse différente de 1-5 (ex. questions ouvertes, commentaires par critère).
