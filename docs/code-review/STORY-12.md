# Code Review — STORY-12 : Export PowerPoint

> Agent : Code Reviewer | Date : 2026-06-30
> Source : coach-dashboard.js (fonction exportCoachPPT), coach.html

---

## Périmètre examiné

- `coach.html` : ajout CDN PptxGenJS, bump version v=43→v=44
- `pages/coach-dashboard.js` : ajout fonction `exportCoachPPT()` (~160 lignes), bouton remplacé

---

## Conformité architecture

| Point | Statut | Détail |
|-------|--------|--------|
| Fichier unique coach-dashboard.js | ✅ | Pas de nouveau fichier créé |
| Librairie via CDN | ✅ | `cdn.jsdelivr.net/npm/pptxgenjs@3` — conforme aux CDNs du projet |
| Version fixée (`@3`, pas `@latest`) | ✅ | Protège contre breaking changes futurs |
| player-home.js non modifié | ✅ | Export PDF joueur préservé |
| Fonctions globales camelCase | ✅ | `exportCoachPPT()` conforme |
| Variables locales (closures) | ✅ | `addHeader`, `noteCell`, `buildCriteresTable` définies à l'intérieur de la fonction async — pas de pollution du scope global |
| `gid()` utilisé pour les DOM queries | ✅ | Conforme au projet |
| `showToast()` pour les feedbacks | ✅ | Conforme |
| Pas de logs debug | ✅ | |

---

## Revue du code

### Guards (R1, R2, R10 du Risk Analyst)

```javascript
if (!window.PptxGenJS) { showToast('Librairie PPT non chargée'); return; }  // ✅ R1
const attCanvas = gid('radarAtt');
if (!attCanvas) { showToast('…'); return; }                                   // ✅ R2
if (!_cPdfIsGb && defCanvas) { ... } else { ... }                            // ✅ R10
```

Tous les guards P1 du Risk Analyst sont présents.

### Gestion du logo

```javascript
try {
  const r = await fetch('assets/logo-transparent.jpeg');
  ...
} catch (_) {}  // ✅ R3 — silencieux, logo optionnel
```

`catch (_)` sans corps : acceptable ici car logo est documenté comme optionnel.

### Tableau critères — cas colspan

```javascript
rows.push([
  { text: axe.label.toUpperCase(), options:{ ..., colspan:3 } },
  { text:'', options:{} }, { text:'', options:{} },
]);
```

**Note :** PptxGenJS v3 attend que les cellules mergées soient présentes dans le tableau mais avec `text:''`. Ce pattern est correct selon la doc PptxGenJS.

### Variable `yPos` inutilisée

```javascript
let yPos = 1.4;  // ← déclarée dans la story d'origine mais supprimée correctement
```

Le Developer a nettoyé ce dead code de la version story : `yPos` n'apparaît pas dans le code final. ✅

### Slide 4 — `y` non initialisé globalement

```javascript
cols.forEach((col, ci) => {
  let y = 1.4;  // ← réinitialisé par colonne
```

Correct : chaque colonne repart de y=1.4 indépendamment. Cohérent avec le layout 2 colonnes.

### Cas `_cDefId` null mais `_cPdfIsGb` false

Si un joueur a un profil att mais pas de profil def (cas edge non GB), `_cDefId` est null. La condition `if (!_cPdfIsGb && _cDefId)` skippe la slide 3. La slide 1 entre dans le `else` (un seul radar centré). Comportement correct.

---

## Remarques

### Bloquant
Aucun.

### Recommandé
- **Pas de `h` sur `addText` pour les légendes slide 1** (`● Joueur`, `● Staff`) : si le texte est coupé par le bas de slide, il n'y a pas de wrapping. Non bloquant car texte court.

### Notes
- Le bouton a reçu un `id="btnExportPpt"` pour permettre le disable/enable — bonne pratique.
- La bande gold gauche sur slide 1 (`w:0.15, h:5.625`) est au-dessus de la bande gold top (`h:0.15`) à cause de l'ordre d'ajout. Visuellement ça fonctionne (overlap) mais l'ordre pourrait être inversé pour la cohérence. Non bloquant.

---

## Verdict

**APPROUVÉ** — code propre, guards complets, conventions respectées, pas de dette technique introduite.
