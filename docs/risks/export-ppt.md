# Risks — Refonte export PPT v2

> Agent : Risk Analyst | Date : 2026-07-01

---

## Tableau des risques

| # | Risque | Proba | Impact | Priorité | Recommandation |
|---|--------|-------|--------|----------|----------------|
| R1 | `<img>` dans le conteneur radar pas encore chargée au moment de la capture (race condition) | Moyenne | Moyen | P1 | `await requestAnimationFrame()` + `await new Promise(r => img.onload = r)` pour chaque img avant html2canvas |
| R2 | Conteneur off-screen non supprimé si html2canvas lance une exception | Faible | Faible | P2 | Mettre `div.remove()` dans un `finally {}` |
| R3 | `buildAxisDetailHTML()` retourne une chaîne vide si `_coachEvalMap` est vide (aucune note) | Moyenne | Faible | P2 | HTML généré quand même avec pastilles "empty" — acceptable, pas bloquant |
| R4 | CSS vars (`.cc-pastille.n1`, `--n1-text`, etc.) non résolues dans le conteneur off-screen sur certains navigateurs anciens | Faible | Moyen | P2 | Le conteneur est in-DOM → fenix.css s'applique normalement. Risque réel seulement si navigateur ne supporte pas `position:fixed` avec `top:-9999px` — négligeable sur PC/Mac |
| R5 | html2canvas génère des captures blanches pour les images `<img>` dans le conteneur radar | Faible | Critique | P1 | Utiliser `useCORS: true` + attendre `img.onload` avant capture. Alternative : si blanc → fallback canvas.toDataURL directement via addImage PptxGenJS |
| R6 | Nombre d'axes ≠ 4 pour un profil (ajout futur) → positions 2×2 dépassent la slide | Très faible | Faible | P3 | `positions[i]` avec guard `if (!positions[i]) return` — axes supplémentaires silencieusement ignorés |
| R7 | Régression `showAxisDetail()` après extraction de `buildAxisDetailHTML()` | Faible | Critique | P1 | Test dans QA : clic sur une ligne recap → axisDetail s'affiche toujours correctement |
| R8 | Appels séquentiels html2canvas × 8 (4 axes Att + 4 axes Def) ralentissent l'export (> 10s) | Moyenne | Moyen | P2 | Acceptable pour un usage occasionnel PC. Si > 15s → to do post-STORY : parallélisation avec Promise.all sur les captures non-DOM |

---

## Détail P1

### R1 — Race condition `<img>` dans le radar reconstruit

**Critère d'acceptation** : avant d'appeler `html2canvas` sur le conteneur radar, toutes les `<img>` doivent avoir `complete === true`. Sinon : attendre `onload` sur chaque image.

```javascript
await Promise.all([...div.querySelectorAll('img')].map(img =>
  img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; })
));
```

### R5 — Images blanches dans html2canvas

**Critère d'acceptation** : si la capture radar retourne un canvas de pixels blancs (détectable via `getImageData`), basculer vers l'ancienne méthode `canvas.toDataURL()` direct + `addImage` PptxGenJS. Le guard dans la story doit couvrir ce cas en fallback.

### R7 — Régression `showAxisDetail()`

**Critère d'acceptation** : après refactoring, cliquer sur un thème dans le tableau récap coach → `#axisDetail` s'affiche avec le bon contenu (label axe, critères, pastilles). Testé explicitement par le QA.

---

## Pas de P0

Aucun risque bloquant non mitigeable. La feature est 100% client-side, sans backend, sans données sensibles.
