# Architecture — Refonte export PPT v2

> Agent : Architect | Date : 2026-07-01

---

## 1. Décision technique globale

5 slides, toutes via html2canvas sauf les en-têtes PptxGenJS :
- **Slide 1** : conteneur DOM temporaire reconstruit en JS (images radar + titres + légende) → html2canvas
- **Slide 2** : captures `#pptCaptureAtt` + `#pptCaptureDef` existants → positionnés côte à côte
- **Slides 3/4** : 4 conteneurs DOM temporaires off-screen (un par axe) → html2canvas → grille 2×2
- **Slide 5** : capture `#pptCaptureCR` inchangée (STORY-13)

---

## 2. Refactoring `showAxisDetail()` → `buildAxisDetailHTML()`

### Fonction à extraire

```javascript
// Nouvelle fonction pure — ne touche pas au DOM
function buildAxisDetailHTML(profilId, axeId) {
  const axe = CRITERIA[profilId]?.axes[axeId];
  if (!axe) return '';
  const rows = axe.criteres.map(c => {
    const nj = _coachEvalMap[c.id]?.note_joueur || 0;
    const ns = _coachEvalMap[c.id]?.note_staff  || 0;
    return `
      <div class="cc-row">
        <div class="cc-info">
          <div class="cc-label">${escHtml(c.label)}</div>
          <div class="cc-texte">${escHtml(c.texte)}</div>
        </div>
        <div class="cc-scores">
          <div class="cc-score-col">
            <span class="cc-who">Joueur</span>
            <div class="cc-pastille ${nj ? 'n'+nj : 'empty'}"></div>
            <span class="cc-score-name" style="color:${nj ? 'var(--n'+nj+'-text)' : 'var(--gray-400)'}">
              ${nj ? _CC_LABELS[nj] : '—'}
            </span>
          </div>
          <div class="cc-score-col">
            <span class="cc-who">Staff</span>
            <div class="cc-pastille ${ns ? 'n'+ns : 'empty'}"></div>
            <span class="cc-score-name" style="color:${ns ? 'var(--n'+ns+'-text)' : 'var(--gray-400)'}">
              ${ns ? _CC_LABELS[ns] : '—'}
            </span>
          </div>
          <div class="cc-score-col">
            <span class="cc-who">Écart</span>
            <div style="height:32px;display:flex;align-items:center;justify-content:center">${deltaHTML(nj, ns)}</div>
            <span class="cc-score-name" style="color:var(--gray-400)"> </span>
          </div>
        </div>
      </div>`;
  }).join('');
  return `
    <div class="card-body" style="padding:12px">
      <p class="section-title" style="margin-bottom:8px;font-size:12px">${escHtml(axe.label)}</p>
      ${rows}
    </div>`;
}
```

### `showAxisDetail()` après refactoring

```javascript
function showAxisDetail(profilId, axeId) {
  const axe = CRITERIA[profilId]?.axes[axeId];
  if (!axe) return;
  document.querySelectorAll('.recap-row').forEach(r => r.classList.remove('active'));
  document.querySelectorAll('.recap-theme-btn').forEach(b => b.classList.remove('active'));
  const activeRow = document.querySelector(`.recap-row[data-recap="${profilId}-${axeId}"]`);
  activeRow?.classList.add('active');
  activeRow?.querySelector('.recap-theme-btn')?.classList.add('active');
  const detailEl = gid('axisDetail');
  detailEl.style.display = 'block';
  detailEl.innerHTML = `
    <div class="card" style="margin-top:12px">
      ${buildAxisDetailHTML(profilId, axeId)}
    </div>`;
  detailEl.scrollIntoView({ behavior:'smooth', block:'nearest' });
}
```

> **Important** : la légende interactive `noteLegendHTML()` (boutons Fragile/En travail/etc.) est retirée du HTML de capture PPT — les boutons interactifs n'ont pas leur place dans une image statique, et les CSS vars `.n1`-`.n5` sur les pastilles suffisent à la lisibilité. Elle reste dans `showAxisDetail()` si souhaité ultérieurement.

---

## 3. Conteneur off-screen pour captures

### Approche retenue : `position: fixed; top: -9999px`

```javascript
function createOffscreenDiv(width = 600) {
  const div = document.createElement('div');
  div.style.cssText = `position:fixed;top:-9999px;left:0;width:${width}px;background:#FFFFFF;z-index:-1`;
  document.body.appendChild(div);
  return div;
}
```

→ Supprimer avec `div.remove()` après capture.

**Pourquoi `position:fixed` et non `display:none`** : html2canvas ne peut pas capturer un élément `display:none` (dimensions = 0). `position:fixed; top:-9999px` le rend invisible à l'utilisateur mais calculable par le navigateur.

**Pourquoi les CSS vars fonctionnent** : `fenix.css` est chargé sur la page — les classes `.cc-pastille.n1`, `.cc-row`, `.cc-label`, `.cc-scores`, `.delta-badge` ont leur style résolu normalement car l'élément est in-DOM.

---

## 4. Slide 1 — Conteneur radar reconstruit

```javascript
async function captureRadarSlide() {
  const attCanvas = gid('radarAtt');
  const defCanvas = gid('radarDef');
  if (!attCanvas) return null;
  const attImg = attCanvas.toDataURL('image/png');
  const defImg = defCanvas ? defCanvas.toDataURL('image/png') : null;
  const attTitle = `${_cPdfIsGb ? '🧤' : '⚡'} ${PROFIL_LABELS[_cAttId] || _cAttId}`;
  const defTitle = defImg ? `🛡 ${PROFIL_LABELS[_cDefId] || _cDefId}` : '';

  const div = createOffscreenDiv(900);
  div.innerHTML = `
    <div style="display:flex;gap:16px;justify-content:center;padding:16px">
      <div style="flex:1;text-align:center">
        <p style="font-size:13px;font-weight:700;color:#1E293B;margin:0 0 8px">${attTitle}</p>
        <img src="${attImg}" style="width:100%;max-width:380px">
      </div>
      ${defImg ? `<div style="flex:1;text-align:center">
        <p style="font-size:13px;font-weight:700;color:#1E293B;margin:0 0 8px">${defTitle}</p>
        <img src="${defImg}" style="width:100%;max-width:380px">
      </div>` : ''}
    </div>
    <div style="display:flex;gap:16px;padding:0 16px 16px;font-size:11px;color:#475569">
      <div style="display:flex;align-items:center;gap:4px">
        <div style="width:10px;height:10px;border-radius:50%;background:rgba(59,130,246,0.8)"></div>Joueur
      </div>
      <div style="display:flex;align-items:center;gap:4px">
        <div style="width:10px;height:10px;border-radius:50%;background:rgba(234,88,12,0.8)"></div>Staff
      </div>
    </div>`;
  // Attendre un frame pour que le navigateur calcule les dimensions
  await new Promise(r => requestAnimationFrame(r));
  let b64 = null;
  try {
    const cv = await window.html2canvas(div, {
      scale: 2, useCORS: true, backgroundColor: '#FFFFFF', logging: false,
      windowWidth: 900, windowHeight: div.scrollHeight,
    });
    b64 = cv.toDataURL('image/png');
  } catch (_) {}
  div.remove();
  return b64;
}
```

> `requestAnimationFrame` : nécessaire pour que le navigateur resolve les dimensions des `<img>` avant la capture.

---

## 5. Slides 3/4 — Capture des 4 axes

```javascript
async function captureAxes(profilId) {
  if (!profilId || !CRITERIA[profilId]) return [];
  const axeIds = Object.keys(CRITERIA[profilId].axes);
  const captures = [];
  for (const axeId of axeIds) {
    const div = createOffscreenDiv(600);
    div.innerHTML = buildAxisDetailHTML(profilId, axeId);
    await new Promise(r => requestAnimationFrame(r));
    let b64 = null;
    try {
      const cv = await window.html2canvas(div, {
        scale: 2, useCORS: true, backgroundColor: '#FFFFFF', logging: false,
        windowWidth: 600, windowHeight: div.scrollHeight,
      });
      b64 = cv.toDataURL('image/png');
    } catch (_) {}
    div.remove();
    captures.push(b64);
  }
  return captures;
}
```

Positionnement 2×2 :
```javascript
const positions = [
  { x:0.2, y:1.35 }, { x:5.0, y:1.35 },
  { x:0.2, y:3.35 }, { x:5.0, y:3.35 },
];
captures.forEach((b64, i) => {
  if (!b64 || !positions[i]) return;
  slide.addImage({ data: b64, x: positions[i].x, y: positions[i].y,
    w:4.6, h:1.9, sizing: { type:'contain', w:4.6, h:1.9 } });
});
```

---

## 6. Logo logo-fenix.png

Fetcher en base64 au même endroit que `logo-transparent.jpeg` :

```javascript
let logoFenixB64 = null;
try {
  const r = await fetch('assets/logo-fenix.png');
  const blob = await r.blob();
  logoFenixB64 = await new Promise(res => {
    const reader = new FileReader(); reader.onloadend = () => res(reader.result);
    reader.readAsDataURL(blob);
  });
} catch (_) {}
```

Utilisation dans `addHeader()` :
```javascript
if (logoFenixB64) slide.addImage({ data:logoFenixB64, x:9.0, y:5.0, w:0.75, h:0.45 });
```

---

## 7. Fichiers modifiés

| Fichier | Nature | Version |
|---------|--------|---------|
| `pages/coach-dashboard.js` | Refonte `exportCoachPPT()`, ajout `buildAxisDetailHTML()`, refactor `showAxisDetail()`, helpers `createOffscreenDiv()`, `captureRadarSlide()`, `captureAxes()` | v=46 |
| `coach.html` | Bump version coach-dashboard.js v45→v46 | — |

---

## 8. Alternatives rejetées

| Alternative | Raison |
|-------------|--------|
| Capturer `#axisDetail` en place après clic simulé | Requiert de modifier l'état du DOM (clic simulé = modification active), instable |
| Capturer le `sessionRadarHTML` div directement (`#radarGrid` ou équivalent) | Les canvas html2canvas peuvent être blancs si le contexte WebGL/2D est détaché — reconstituer avec `<img>` est plus fiable |
| Garder `buildAxisDetailHTML` avec `noteLegendHTML()` | Les boutons interactifs et `id="noteLegendInfo"` dans une capture statique = éléments inutiles et potentiellement dupliqués en DOM |

---

## 9. Impact sur l'existant

- `showAxisDetail()` : signature inchangée, comportement identique (appelle `buildAxisDetailHTML()`)
- `#pptCaptureAtt`, `#pptCaptureDef`, `#pptCaptureCR` : IDs existants conservés, utilisés en slide 2 et 5
- `exportCoachPDF()` : non modifié (ligne 551)
- `player-home.js`, `fenix.css`, `index.html`, `player.html` : non modifiés
