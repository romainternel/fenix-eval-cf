# STORY-14 — Refonte export PPT v2 : radars fond blanc + 4 cartes axes + résumé côte à côte

**En tant que** coach,
**Je veux** exporter un PPT en 5 slides dont le contenu reproduit exactement ce que je vois dans l'application (radars fond blanc avec labels, tableaux résumé côte à côte, détail critères par axe avec pastilles colorées),
**Afin d'** obtenir un rapport de qualité premium pour mes entretiens joueurs.

---

## Contexte technique

- **Fichiers modifiés** : `coach.html` (bump v=45→v=46), `pages/coach-dashboard.js`
- **Fichiers non modifiés** : `player-home.js`, `fenix.css`, `index.html`, `player.html`
- **Prérequis** : STORY-13 livrée (CDN html2canvas, PptxGenJS, `#pptCaptureAtt`, `#pptCaptureDef`, `#pptCaptureCR`)

---

## Étape 1 — `buildAxisDetailHTML()` : extraction depuis `showAxisDetail()`

Ajouter **avant** `showAxisDetail()` dans `coach-dashboard.js` :

```javascript
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

Modifier `showAxisDetail()` pour l'utiliser (remplacer le bloc qui génère `rows` et injecte dans `detailEl`) :

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
  detailEl.innerHTML = `<div class="card" style="margin-top:12px">${buildAxisDetailHTML(profilId, axeId)}</div>`;
  detailEl.scrollIntoView({ behavior:'smooth', block:'nearest' });
}
```

---

## Étape 2 — Helpers internes à `exportCoachPPT()`

Ajouter ces helpers à l'intérieur du `try {}` de `exportCoachPPT()`, après les déclarations NAVY/GOLD/WHITE/BG :

```javascript
function createOffscreen(width) {
  const div = document.createElement('div');
  div.style.cssText = `position:fixed;top:-9999px;left:0;width:${width}px;background:#FFFFFF;z-index:-1`;
  document.body.appendChild(div);
  return div;
}

async function captureDiv(div, width) {
  await Promise.all([...div.querySelectorAll('img')].map(img =>
    img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; })
  ));
  await new Promise(r => requestAnimationFrame(r));
  try {
    const cv = await window.html2canvas(div, {
      scale: 2, useCORS: true, backgroundColor: '#FFFFFF', logging: false,
      windowWidth: width, windowHeight: div.scrollHeight,
    });
    return cv.toDataURL('image/png');
  } catch (_) { return null; }
}
```

---

## Étape 3 — Refonte complète de `exportCoachPPT()`

Remplacer intégralement le corps de `exportCoachPPT()` :

```javascript
async function exportCoachPPT() {
  if (!window.PptxGenJS)   { showToast('Librairie PPT non chargée'); return; }
  if (!window.html2canvas) { showToast('Librairie de capture non chargée'); return; }
  const attCanvas = gid('radarAtt');
  if (!attCanvas) { showToast('Ouvrez d\'abord la vue résultats d\'un joueur'); return; }

  const btn = gid('btnExportPpt');
  if (btn) { btn.disabled = true; btn.textContent = 'Génération…'; }
  showToast('Génération du PPT…');

  try {
    // ── Logos ──────────────────────────────────────────────────────────────
    let logoB64 = null;
    try {
      const r = await fetch('assets/logo-fenix.png');
      const blob = await r.blob();
      logoB64 = await new Promise(res => {
        const reader = new FileReader(); reader.onloadend = () => res(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (_) {}

    const prs = new window.PptxGenJS();
    prs.layout = 'LAYOUT_WIDE';
    const NAVY = '0A2463', GOLD = 'C8A84B', WHITE = 'FFFFFF', BG = 'F8FAFC';
    const subHdr = `${_cPdfNom}  ·  ${_cPdfSession}`;

    function addHeader(slide, title, subtitle) {
      slide.addShape(prs.ShapeType.rect, { x:0, y:0, w:10, h:0.12, fill:{ color:GOLD } });
      slide.addShape(prs.ShapeType.rect, { x:0, y:0, w:10, h:1.2,  fill:{ color:NAVY } });
      slide.addText(title,    { x:0.35, y:0.15, w:9.3, fontSize:20, bold:true,  color:WHITE, fontFace:'Calibri' });
      slide.addText(subtitle, { x:0.35, y:0.75, w:9.3, fontSize:10, bold:false, color:GOLD,  fontFace:'Calibri' });
      if (logoB64) slide.addImage({ data:logoB64, x:9.0, y:5.0, w:0.75, h:0.45 });
    }

    function createOffscreen(width) {
      const div = document.createElement('div');
      div.style.cssText = `position:fixed;top:-9999px;left:0;width:${width}px;background:#FFFFFF;z-index:-1`;
      document.body.appendChild(div);
      return div;
    }

    async function captureDiv(div, width) {
      await Promise.all([...div.querySelectorAll('img')].map(img =>
        img.complete ? Promise.resolve() : new Promise(r => { img.onload = r; img.onerror = r; })
      ));
      await new Promise(r => requestAnimationFrame(r));
      let b64 = null;
      try {
        const cv = await window.html2canvas(div, {
          scale: 2, useCORS: true, backgroundColor: '#FFFFFF', logging: false,
          windowWidth: width, windowHeight: div.scrollHeight,
        });
        b64 = cv.toDataURL('image/png');
      } catch (_) {}
      div.remove();
      return b64;
    }

    function addCapture(slide, b64, x, y, w, h, fallback) {
      if (b64) {
        slide.addImage({ data: b64, x, y, w, h, sizing: { type:'contain', w, h } });
      } else if (fallback) {
        slide.addText(fallback, { x: x + 0.2, y: y + 0.5, fontSize:11,
          color:'94A3B8', fontFace:'Calibri', italic:true });
      }
    }

    // ── SLIDE 1 : Radars fond blanc ───────────────────────────────────────
    const defCanvas = gid('radarDef');
    const attTitle  = `${_cPdfIsGb ? '🧤' : '⚡'} ${PROFIL_LABELS[_cAttId] || _cAttId}`;
    const defTitle  = defCanvas ? `🛡 ${PROFIL_LABELS[_cDefId] || _cDefId}` : '';
    const attImg    = attCanvas.toDataURL('image/png');
    const defImg    = (defCanvas && !_cPdfIsGb) ? defCanvas.toDataURL('image/png') : null;

    const radarDiv = createOffscreen(900);
    radarDiv.innerHTML = `
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
    const radarB64 = await captureDiv(radarDiv, 900);

    const s1 = prs.addSlide();
    s1.background = { color: BG };
    addHeader(s1, 'FENIX Eval CF', subHdr);
    addCapture(s1, radarB64, 0.3, 1.35, 9.4, 3.9, 'Radars non disponibles.');

    // ── SLIDE 2 : Résumé Att + Def côte à côte ───────────────────────────
    const s2 = prs.addSlide();
    s2.background = { color: BG };
    addHeader(s2, _cPdfIsGb ? '🧤 RÉSUMÉ GARDIEN' : '📊 RÉSUMÉ', subHdr);
    const b64Att = await captureEl('pptCaptureAtt', '#FFFFFF');
    const b64Def = await captureEl('pptCaptureDef', '#FFFFFF');
    if (_cPdfIsGb || !b64Def) {
      addCapture(s2, b64Att, 2.5, 1.35, 5.0, 3.9, 'Tableau non disponible.');
    } else {
      addCapture(s2, b64Att, 0.2, 1.35, 4.6, 3.9, 'Tableau Att non disponible.');
      addCapture(s2, b64Def, 5.0, 1.35, 4.6, 3.9, 'Tableau Def non disponible.');
    }

    // ── Helper capture axes 2×2 ───────────────────────────────────────────
    async function addAxesSlide(profilId, slideTitle) {
      const profil = CRITERIA[profilId];
      if (!profil) return;
      const axeIds = Object.keys(profil.axes);
      const positions = [
        { x:0.2, y:1.35 }, { x:5.0, y:1.35 },
        { x:0.2, y:3.35 }, { x:5.0, y:3.35 },
      ];
      const slide = prs.addSlide();
      slide.background = { color: BG };
      addHeader(slide, slideTitle, subHdr);
      for (let i = 0; i < axeIds.length && i < 4; i++) {
        const div = createOffscreen(600);
        div.innerHTML = buildAxisDetailHTML(profilId, axeIds[i]);
        const b64 = await captureDiv(div, 600);
        if (b64 && positions[i]) {
          slide.addImage({ data: b64,
            x: positions[i].x, y: positions[i].y, w: 4.6, h: 1.9,
            sizing: { type:'contain', w:4.6, h:1.9 } });
        }
      }
    }

    // ── SLIDE 3 : Axes Attaque ────────────────────────────────────────────
    if (_cAttId) await addAxesSlide(_cAttId, _cPdfIsGb ? '🧤 DÉTAIL GARDIEN' : '⚡ DÉTAIL ATTAQUE');

    // ── SLIDE 4 : Axes Défense (si non GB) ───────────────────────────────
    if (!_cPdfIsGb && _cDefId) await addAxesSlide(_cDefId, '🛡 DÉTAIL DÉFENSE');

    // ── SLIDE 5 : CR entretien (inchangé) ────────────────────────────────
    const s5 = prs.addSlide();
    s5.background = { color: BG };
    addHeader(s5, '📋 COMPTE-RENDU D\'ENTRETIEN', subHdr);
    const crVide = !['crAxesAtt','crAxesDef','crCT','crMT','crNotes']
      .some(id => gid(id)?.value?.trim());
    if (crVide) {
      s5.addText('Aucun compte-rendu saisi.', { x:0.5, y:2, fontSize:12,
        color:'94A3B8', fontFace:'Calibri', italic:true });
    } else {
      const crB64 = await captureEl('pptCaptureCR', '#F8FAFC');
      if (crB64) {
        s5.addImage({ data:crB64, x:0.3, y:1.35, w:9.4, h:4.1,
          sizing:{ type:'contain', w:9.4, h:4.1 } });
      } else {
        s5.addText('Compte-rendu non disponible.', { x:0.5, y:2, fontSize:12,
          color:'94A3B8', fontFace:'Calibri', italic:true });
      }
    }

    const safe = (`${_cPdfNom}_${_cPdfSession}`).replace(/[^a-zA-Z0-9_-]/g, '_');
    await prs.writeFile({ fileName: `FENIX_${safe}.pptx` });
    showToast('PPT exporté ✓');

  } catch (err) {
    showToast('Erreur export : ' + (err.message || 'inconnue'));
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '📊 PPT'; }
  }
}
```

> **Note** : `captureEl()` est la même fonction que dans STORY-13 (lignes 689-699) — elle reste inchangée dans le code, cette story l'utilise pour les slides 2 et 5.

---

## Étape 4 — coach.html : bump version

```html
<!-- Avant -->
<script src="pages/coach-dashboard.js?v=45"></script>
<!-- Après -->
<script src="pages/coach-dashboard.js?v=46"></script>
```

---

## Critères d'acceptation

- [ ] `buildAxisDetailHTML(profilId, axeId)` existe et retourne une chaîne HTML non vide si le profil est valide
- [ ] `showAxisDetail()` fonctionne toujours après le refactoring (clic sur un thème → détail affiché)
- [ ] `coach-dashboard.js?v=46` dans `coach.html`
- [ ] Slide 1 : fond blanc, radars avec titres profil, légende Joueur/Staff
- [ ] Slide 2 : tableaux récap Att + Def côte à côte ; si GB → seul tableau centré
- [ ] Slide 3 : 4 zones 2×2 avec le détail de chaque axe Attaque (pastilles colorées visibles)
- [ ] Slide 4 : 4 zones 2×2 avec le détail de chaque axe Défense (absente si GB)
- [ ] Slide 5 : capture CR ou "Aucun compte-rendu saisi." (comportement STORY-13 inchangé)
- [ ] Logo `logo-fenix.png` visible coin bas-droit sur chaque slide
- [ ] Guard `!window.html2canvas` → toast + return
- [ ] Guard `!gid('radarAtt')` → toast + return
- [ ] Si une capture échoue → fallback texte, export continue
- [ ] `player-home.js` non modifié
- [ ] `exportCoachPDF()` toujours présent

---

## Hors scope

- Modifier le style CSS des zones capturées
- Support GB avec slide 4 défense (inexistante par définition)
- Grille adaptative si > 4 axes
- Export multi-joueurs

---

## Dépend de

STORY-13 (CDN html2canvas, `#pptCaptureAtt`, `#pptCaptureDef`, `#pptCaptureCR`)

---

## Taille

L — 4 changements (extraction fonction, refactor showAxisDetail, refonte exportCoachPPT, bump version), logique asynchrone multiple.
