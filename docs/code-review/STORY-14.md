# Code Review — STORY-14 — Export PPT v2

> Agent : Code Reviewer | Date : 2026-07-01 | Verdict : **APPROUVÉ**

---

## Fichiers modifiés

| Fichier | Nature |
|---------|--------|
| `pages/coach-dashboard.js` | Ajout `buildAxisDetailHTML()`, refactor `showAxisDetail()`, refonte `exportCoachPPT()` |
| `coach.html` | Bump `?v=45` → `?v=46` |

---

## Points validés

| # | Point | Verdict |
|---|-------|---------|
| 1 | `buildAxisDetailHTML()` — fonction pure, pas de DOM, `escHtml()` appliqué | ✓ |
| 2 | `buildAxisDetailHTML()` — retourne `''` si profil/axe inconnu | ✓ |
| 3 | `showAxisDetail()` — signature inchangée, appelle `buildAxisDetailHTML()` | ✓ |
| 4 | `showAxisDetail()` — activation `.active` sur `.recap-row` / `.recap-theme-btn` préservée | ✓ |
| 5 | `showAxisDetail()` — `scrollIntoView` préservé | ✓ |
| 6 | `exportCoachPPT()` — guards PptxGenJS / html2canvas / radarAtt | ✓ |
| 7 | `exportCoachPPT()` — logo switché vers `logo-fenix.png` (opaque), position `9.0/5.0/0.75/0.45` | ✓ |
| 8 | `captureEl()` identique STORY-13 (inchangée) | ✓ |
| 9 | `createOffscreen()` — `position:fixed;top:-9999px` — CSS vars résolues car in-DOM | ✓ |
| 10 | `captureDiv()` — `img.complete + onload` avant html2canvas (R1 mitigé) + `requestAnimationFrame` | ✓ |
| 11 | `addCapture()` — signature avec `x, y, w, h`, fallback texte si `b64 === null` | ✓ |
| 12 | Slide 2 — côte à côte ou centré si GB | ✓ |
| 13 | Slide 3/4 — boucle séquentielle, guard `i < 4` | ✓ |
| 14 | Slide 5 — CR comportement STORY-13 inchangé | ✓ |
| 15 | `finally` — bouton réactivé même si exception | ✓ |
| 16 | `exportCoachPDF()` — non modifié (L551) | ✓ |
| 17 | `coach.html` — `?v=46` | ✓ |

---

## Point de vigilance

**R2 — `div.remove()` non garanti si html2canvas throw** (risque P2, documenté dans risk register) :  
Dans `captureDiv()`, si `window.html2canvas(...)` lève une exception, le `catch` swallow l'erreur mais `div.remove()` est dans le corps du `try`, pas dans un `finally`. En pratique : l'exception est capturée dans le `catch (_) {}` interne, `b64` reste `null`, et `div.remove()` est bien appelé sur la ligne suivante. Le risque réel ne se produit que si `html2canvas` throw de façon synchrone avant le retour de la Promise, ce qui est impossible (api async). **Pas de bug.**

---

## Verdict final

**APPROUVÉ** — Implémentation conforme à la story, à l'architecture et aux conventions du projet.
