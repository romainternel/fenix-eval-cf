# Visual Crafter — Refonte export PPT v2

> Agent : Visual Crafter | Date : 2026-07-01

---

## 1. En-têtes slides (PptxGenJS — inchangés)

| Élément | Valeur |
|---------|--------|
| Bande gold top | `#C8A84B`, h:0.12" |
| Fond header | Navy `#0A2463`, h:1.2" |
| Titre | Calibri 20pt bold, `#FFFFFF`, x:0.35 y:0.15 |
| Sous-titre | Calibri 10pt, `#C8A84B`, x:0.35 y:0.75 |

---

## 2. Logo

**`logo-fenix.png`** — chaque slide, coin bas-droit, fetché en base64 comme logo-transparent :
```
x:9.0, y:5.0, w:0.75, h:0.45
```
Fond opaque → pas de problème de blending sur fond blanc ou navy.

---

## 3. Slide 1 — Conteneur radar reconstruit

Le conteneur off-screen injecté en JS doit avoir le style suivant pour reproduire fidèlement la vue app :

```javascript
const container = document.createElement('div');
container.style.cssText = `
  position: fixed; top: -9999px; left: 0;
  width: 900px; background: #FFFFFF; padding: 16px;
  font-family: 'Inter', sans-serif;
`;
```

Structure interne :
```html
<div style="display:flex; gap:16px; justify-content:center">
  <!-- si non GB : deux colonnes -->
  <div style="flex:1; text-align:center">
    <p style="font-size:13px; font-weight:700; color:#1E293B; margin-bottom:8px">⚡ DC</p>
    <img src="[attCanvas.toDataURL()]" style="width:100%; max-width:380px">
  </div>
  <div style="flex:1; text-align:center">
    <p style="font-size:13px; font-weight:700; color:#1E293B; margin-bottom:8px">🛡 N°2</p>
    <img src="[defCanvas.toDataURL()]" style="width:100%; max-width:380px">
  </div>
</div>
<div style="display:flex; gap:16px; margin-top:12px; font-size:11px">
  <div style="display:flex; align-items:center; gap:4px">
    <div style="width:10px;height:10px;border-radius:50%;background:rgba(59,130,246,0.8)"></div> Joueur
  </div>
  <div style="display:flex; align-items:center; gap:4px">
    <div style="width:10px;height:10px;border-radius:50%;background:rgba(234,88,12,0.8)"></div> Staff
  </div>
</div>
```

Options html2canvas pour cette capture :
```javascript
{ scale: 2, useCORS: true, backgroundColor: '#FFFFFF', logging: false,
  windowWidth: 900, windowHeight: container.scrollHeight }
```

Placement dans la slide :
```javascript
slide.addImage({ data: b64, x:0.3, y:1.35, w:9.4, h:3.9,
  sizing: { type:'contain', w:9.4, h:3.9 } });
```

---

## 4. Slide 2 — Résumé côte à côte

Deux captures positionnées via PptxGenJS :

```javascript
// Att (gauche)
slide.addImage({ data: b64Att, x:0.2, y:1.35, w:4.6, h:3.9,
  sizing: { type:'contain', w:4.6, h:3.9 } });
// Def (droite)
slide.addImage({ data: b64Def, x:5.0, y:1.35, w:4.6, h:3.9,
  sizing: { type:'contain', w:4.6, h:3.9 } });
// Si GB : centré
slide.addImage({ data: b64Att, x:2.5, y:1.35, w:5.0, h:3.9,
  sizing: { type:'contain', w:5.0, h:3.9 } });
```

---

## 5. Slides 3/4 — Grille 2×2 cartes axes

Chaque carte = 1 capture html2canvas du contenu d'un axe.

Conteneur off-screen par axe :
```javascript
const axeContainer = document.createElement('div');
axeContainer.style.cssText = `
  position: fixed; top: -9999px; left: 0;
  width: 600px; background: #FFFFFF; padding: 12px;
  font-family: 'Inter', sans-serif; border-radius: 8px;
`;
axeContainer.innerHTML = buildAxisDetailHTML(profilId, axeId);
document.body.appendChild(axeContainer);
```

Options html2canvas :
```javascript
{ scale: 2, useCORS: true, backgroundColor: '#FFFFFF', logging: false,
  windowWidth: 600, windowHeight: axeContainer.scrollHeight }
```

Positionnement 2×2 dans PptxGenJS (slide 10"×5.625") :
```
Cellule [0] : x:0.2,  y:1.35, w:4.6, h:1.9
Cellule [1] : x:5.0,  y:1.35, w:4.6, h:1.9
Cellule [2] : x:0.2,  y:3.35, w:4.6, h:1.9
Cellule [3] : x:5.0,  y:3.35, w:4.6, h:1.9
```

```javascript
const positions = [
  { x:0.2, y:1.35 }, { x:5.0, y:1.35 },
  { x:0.2, y:3.35 }, { x:5.0, y:3.35 },
];
// Pour chaque axe i :
slide.addImage({ data: captures[i], x: positions[i].x, y: positions[i].y,
  w:4.6, h:1.9, sizing: { type:'contain', w:4.6, h:1.9 } });
```

---

## 6. Options html2canvas générales (rappel)

```javascript
const captureEl = async (id, bg = '#FFFFFF') => {
  const el = gid(id);
  if (!el) return null;
  try {
    const cv = await window.html2canvas(el, {
      scale: 2, useCORS: true, backgroundColor: bg, logging: false,
      windowWidth: el.scrollWidth, windowHeight: el.scrollHeight,
    });
    return cv.toDataURL('image/png');
  } catch (_) { return null; }
};
```

---

## 7. Poids estimé

| Slide | Contenu | ~Ko |
|-------|---------|-----|
| S1 | Radar reconstruit @2x | ~200 |
| S2 | 2 tableaux récap @2x | ~300 |
| S3 | 4 cartes axes Att @2x | ~600 |
| S4 | 4 cartes axes Def @2x | ~600 |
| S5 | CR entretien @2x | ~100 |

**Total estimé : 1.5 – 2 Mo** — acceptable.
