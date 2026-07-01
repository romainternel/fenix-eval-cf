# PRD — Refonte export PPT v2

> Agent : Product Manager | Date : 2026-07-01

---

## Objectif

Remplacer l'implémentation actuelle de `exportCoachPPT()` (STORY-13) par une version en 5 slides dont le contenu correspond exactement à ce que le coach voit dans l'application, avec le bon rendu visuel.

---

## Features — Must Have

### F1 — Slide 1 : Radars fond blanc avec titres profil
Capture d'un conteneur temporaire reconstruit en JS : deux `<img>` (toDataURL des canvas radarAtt/radarDef) avec les titres de profil (ex. "⚡ DC", "🛡 N°2") et la légende "● Joueur ● Staff" — tout sur fond blanc. Inséré dans PptxGenJS via `addImage`.

**Critère d'acceptation** : fond blanc, titres profil visibles au-dessus des radars, légende en bas.

### F2 — Slide 2 : Résumé Att + Def côte à côte
Capture `#pptCaptureAtt` positionnée à gauche de la slide. Capture `#pptCaptureDef` positionnée à droite. Si GB : `#pptCaptureAtt` centré seul. Images disposées via `addImage` avec `sizing: contain`.

**Critère d'acceptation** : les deux tableaux récap apparaissent sur la même slide ; si GB, seul le tableau GB est centré.

### F3 — Slides 3 & 4 : 4 cartes axes en grille 2×2
Pour chaque profil (Att et Def), générer le HTML de chaque axe via une fonction pure `buildAxisDetailHTML(profilId, axeId)` (extraite de `showAxisDetail()`). Injecter chaque axe dans un conteneur off-screen, capturer avec html2canvas, disposer les 4 captures en grille 2×2 dans PptxGenJS. Slide 4 absente si GB.

**Critère d'acceptation** : 4 zones visibles par slide, chaque zone = label axe + liste critères avec descriptions + pastilles colorées n1-n5 ou vide.

### F4 — Slide 5 : CR entretien (inchangée)
Conserver exactement la logique de STORY-13 : capture `#pptCaptureCR`, fallback "Aucun compte-rendu saisi." si vide.

**Critère d'acceptation** : comportement identique à STORY-13 sur la slide CR.

### F5 — Logo fenix.png dans chaque header
`logo-fenix.png` fetché en base64 et inséré dans le coin bas-droit de chaque slide via `addImage`.

**Critère d'acceptation** : logo visible sur les 5 slides.

### F6 — Extraction `buildAxisDetailHTML()` comme fonction pure
Refactorer `showAxisDetail()` pour extraire la génération HTML dans une fonction pure `buildAxisDetailHTML(profilId, axeId)` qui ne manipule pas le DOM. `showAxisDetail()` l'appelle ensuite. Utilisée aussi par `exportCoachPPT()`.

**Critère d'acceptation** : `showAxisDetail()` fonctionne toujours après le refactor.

---

## Hors scope

- Modifier le style CSS des zones capturées
- Slide de couverture graphique élaborée
- Export multi-joueurs
- Support mobile de l'export PPT
- Grille adaptative si > 4 axes (tous les profils FENIX ont exactement 4 axes)
- Modifier `player-home.js`, `fenix.css`, `index.html`, `player.html`

---

## Dépendances

- STORY-13 livrée (CDN html2canvas, PptxGenJS, wrappers `#pptCaptureAtt`, `#pptCaptureDef`, `#pptCaptureCR`)

---

## Risques

- `buildAxisDetailHTML()` utilise `_coachEvalMap` (global) et `escHtml()` (global) — accessibles
- Canvas toDataURL cross-origin : non applicable (données locales Chart.js)
- CSS vars fenix.css dans conteneur off-screen : à valider par l'Architect
- Profil GB : slide 4 absente, slide 2 centrée — cas à tester explicitement
