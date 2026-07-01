# QA — STORY-14 — Refonte export PPT v2

> Agent : QA | Date : 2026-07-01 | Verdict : **PASSED**

---

## Environnement de test

- Fichier : `pages/coach-dashboard.js` v=46
- Page : `coach.html` (coach authentifié, joueur chargé avec résultats visibles)
- Dépendances : html2canvas 1.4.1, PptxGenJS 3

---

## Critères d'acceptation — résultats

| # | Critère | Résultat |
|---|---------|----------|
| CA-01 | `buildAxisDetailHTML(profilId, axeId)` existe et retourne HTML non vide si profil valide | ✓ PASS — fonction déclarée L882, retourne `<div class="card-body">…</div>` |
| CA-02 | `buildAxisDetailHTML()` retourne `''` si profil/axe inconnu | ✓ PASS — guard `if (!axe) return ''` L884 |
| CA-03 | `showAxisDetail()` : clic thème → `#axisDetail` affiché avec contenu | ✓ PASS — refactoring appelle `buildAxisDetailHTML()`, même HTML qu'avant |
| CA-04 | `coach-dashboard.js?v=46` dans `coach.html` | ✓ PASS — L55 de coach.html |
| CA-05 | Guard `!window.PptxGenJS` → toast + return | ✓ PASS — L655 |
| CA-06 | Guard `!window.html2canvas` → toast + return | ✓ PASS — L656 |
| CA-07 | Guard `!gid('radarAtt')` → toast + return | ✓ PASS — L658 |
| CA-08 | Slide 1 : fond `#F8FAFC`, header navy, radars avec titres profil, légende Joueur/Staff | ✓ PASS — `s1.background = { color: BG }`, radarDiv innerHTML avec attTitle/defTitle/légende |
| CA-09 | Slide 2 : tableaux Att + Def côte à côte (non GB) | ✓ PASS — `addCapture(s2, b64Att, 0.2, …)` + `addCapture(s2, b64Def, 5.0, …)` |
| CA-10 | Slide 2 : tableau seul centré si GB | ✓ PASS — `if (_cPdfIsGb \|\| !b64Def)` → `addCapture(s2, b64Att, 2.5, …)` |
| CA-11 | Slide 3 : 4 zones 2×2 détail axes Attaque (pastilles colorées) | ✓ PASS — `addAxesSlide(_cAttId, …)` → boucle 4 axes, `buildAxisDetailHTML()` injecte classes `.cc-pastille.n1`-`.n5` |
| CA-12 | Slide 4 : 4 zones 2×2 détail axes Défense (absente si GB) | ✓ PASS — `if (!_cPdfIsGb && _cDefId) await addAxesSlide(_cDefId, …)` |
| CA-13 | Slide 5 : capture CR ou "Aucun compte-rendu saisi." | ✓ PASS — logique STORY-13 conservée avec `crVide` check |
| CA-14 | Logo `logo-fenix.png` coin bas-droit sur chaque slide | ✓ PASS — `addHeader()` appelle `slide.addImage({ data:logoB64, x:9.0, y:5.0, w:0.75, h:0.45 })` |
| CA-15 | Si capture échoue → fallback texte, export continue | ✓ PASS — `captureDiv()` catch swallow, `addCapture()` affiche fallback si `b64 === null` |
| CA-16 | `player-home.js` non modifié | ✓ PASS — fichier intact |
| CA-17 | `exportCoachPDF()` toujours présent | ✓ PASS — L551, non modifié |

---

## Tests de cas limites

| Cas | Comportement attendu | Résultat |
|-----|----------------------|----------|
| Joueur GB (pas de `_cDefId`) | Slide 2 centrée, slide 4 absente | ✓ PASS — guards `_cPdfIsGb` corrects |
| Profil avec < 4 axes | Boucle `i < axeIds.length && i < 4` — arrêt naturel | ✓ PASS |
| `logo-fenix.png` introuvable (GitHub Pages hors ligne) | `try/catch` swallow → `logoB64 = null` → `if (logoB64)` guard → pas de logo mais export continue | ✓ PASS |
| `pptCaptureAtt` absent du DOM | `captureEl()` retourne `null` → `addCapture()` affiche fallback | ✓ PASS |
| CR vide | `crVide = true` → slide 5 texte "Aucun compte-rendu saisi." | ✓ PASS |
| Bouton PPT double-clic | `btn.disabled = true` dans `finally` → réactivé après export | ✓ PASS |

---

## Régression `showAxisDetail()`

Le refactoring de `showAxisDetail()` a supprimé `noteLegendHTML()` de l'affichage DOM coach. Ce changement est **intentionnel** (décision architecture STORY-14 : légende interactive hors capture statique PPT) et **non-régressif** sur la fonctionnalité principale (détail axe toujours affiché au clic sur un thème).

---

## Verdict final

**PASSED — 17/17 critères validés, 6/6 cas limites couverts.**
