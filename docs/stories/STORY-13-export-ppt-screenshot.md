# STORY-13 — Refonte export PPT : capture d'écran des zones HTML

**En tant que** coach,
**Je veux** exporter un PPT dont les slides reproduisent fidèlement ce que je vois dans l'application,
**Afin d'** obtenir un rapport présentable sans rendu générique ou moche.

---

## Contexte technique

- **Fichiers modifiés** : `coach.html`, `pages/coach-dashboard.js`
- **Fichiers non modifiés** : `player-home.js`, `fenix.css`, `index.html`, `player.html`
- **Librairie ajoutée** : html2canvas v1.4.1 via CDN (avant `coach-dashboard.js` dans `coach.html`)
- **Fonction remplacée** : `exportCoachPPT()` dans `coach-dashboard.js` — la signature et le nom restent identiques, seul le corps change
- **PptxGenJS** : conservé pour l'assemblage des slides (en-têtes, `addImage`, `writeFile`)
- **Zones DOM cibles** :
  - `#radarAtt` / `#radarDef` — canvas Chart.js → `canvas.toDataURL()` (inchangé)
  - `#pptCaptureAtt` / `#pptCaptureDef` — nouveaux wrappers à ajouter autour des appels `cRecapTableHTML()`
  - `#pptCaptureCR` — `id` à ajouter sur le `<div class="card">` de la section CR

---

## Étape 1 — coach.html : ajout CDN html2canvas

Ajouter **avant** le script html2canvas (et avant `coach-dashboard.js`) :

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
```

Bumper `coach-dashboard.js?v=44` → `?v=45`.

---

## Étape 2 — Wrappers ID dans le template de la vue résultats

Dans `coach-dashboard.js`, dans la fonction qui génère la vue résultats joueur (autour de la ligne 1077), modifier :

```javascript
// Avant
${_cAttId ? cRecapTableHTML(_cAttId, _coachEvalMap, isGb ? '🧤 Gardien' : '⚡ Attaque') : ''}
${_cDefId ? cRecapTableHTML(_cDefId, _coachEvalMap, '🛡 Défense') : ''}

// Après
${_cAttId ? `<div id="pptCaptureAtt">${cRecapTableHTML(_cAttId, _coachEvalMap, isGb ? '🧤 Gardien' : '⚡ Attaque')}</div>` : ''}
${_cDefId ? `<div id="pptCaptureDef">${cRecapTableHTML(_cDefId, _coachEvalMap, '🛡 Défense')}</div>` : ''}
```

Et sur la card CR (autour de la ligne 1084) :

```javascript
// Avant
<div class="card" style="margin-top:12px">

// Après
<div class="card" style="margin-top:12px" id="pptCaptureCR">
```

---

## Étape 3 — Refonte de exportCoachPPT()

Remplacer intégralement le corps de `exportCoachPPT()` par l'implémentation suivante. Les parties **conservées** de STORY-12 sont indiquées.

```javascript
async function exportCoachPPT() {
  // ── Guards ────────────────────────────────────────────────────────────────
  if (!window.PptxGenJS)   { showToast('Librairie PPT non chargée'); return; }
  if (!window.html2canvas) { showToast('Librairie de capture non chargée'); return; }
  const attCanvas = gid('radarAtt');
  if (!attCanvas) { showToast('Ouvrez d\'abord la vue résultats d\'un joueur'); return; }

  const btn = gid('btnExportPpt');
  if (btn) { btn.disabled = true; btn.textContent = 'Génération…'; }
  showToast('Génération du PPT…');

  try {
    // ── Logo base64 (CONSERVÉ de STORY-12) ───────────────────────────────
    let logoB64 = null;
    try {
      const r = await fetch('assets/logo-transparent.jpeg');
      const blob = await r.blob();
      logoB64 = await new Promise(res => {
        const reader = new FileReader();
        reader.onloadend = () => res(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (_) {}

    const prs = new window.PptxGenJS();
    prs.layout = 'LAYOUT_WIDE';
    const NAVY = '0A2463', GOLD = 'C8A84B', WHITE = 'FFFFFF', BG = 'F8FAFC';
    const subHdr = `${_cPdfNom}  ·  ${_cPdfSession}`;

    // ── addHeader (CONSERVÉ de STORY-12) ─────────────────────────────────
    function addHeader(slide, title, subtitle) {
      slide.addShape(prs.ShapeType.rect, { x:0, y:0, w:10, h:0.12, fill:{ color:GOLD } });
      slide.addShape(prs.ShapeType.rect, { x:0, y:0, w:10, h:1.2,  fill:{ color:NAVY } });
      slide.addText(title,    { x:0.35, y:0.15, w:9.3, fontSize:20, bold:true,  color:WHITE, fontFace:'Calibri' });
      slide.addText(subtitle, { x:0.35, y:0.75, w:9.3, fontSize:10, bold:false, color:GOLD,  fontFace:'Calibri' });
      if (logoB64) slide.addImage({ data:logoB64, x:9.0, y:5.1, w:0.7, h:0.4 });
    }

    // ── Helper capture DOM → base64 ───────────────────────────────────────
    async function captureEl(id, bg) {
      const el = gid(id);
      if (!el) return null;
      try {
        const cv = await window.html2canvas(el, {
          scale: 2,
          useCORS: true,
          backgroundColor: bg || '#FFFFFF',
          logging: false,
          windowWidth: el.scrollWidth,
          windowHeight: el.scrollHeight,
        });
        return cv.toDataURL('image/png');
      } catch (_) { return null; }
    }

    // ── Helper insertion image dans slide ─────────────────────────────────
    function addCapture(slide, b64, fallback) {
      if (b64) {
        slide.addImage({ data:b64, x:0.3, y:1.35, w:9.4, h:4.1,
          sizing: { type:'contain', w:9.4, h:4.1 } });
      } else {
        slide.addText(fallback, { x:0.5, y:2, fontSize:12,
          color:'94A3B8', fontFace:'Calibri', italic:true });
      }
    }

    // ── SLIDE 1 : radars (CONSERVÉ de STORY-12) ───────────────────────────
    const s1 = prs.addSlide();
    s1.background = { color: NAVY };
    s1.addShape(prs.ShapeType.rect, { x:0, y:0, w:10, h:0.15, fill:{ color:GOLD } });
    s1.addShape(prs.ShapeType.rect, { x:0, y:0, w:0.15, h:5.625, fill:{ color:GOLD } });
    s1.addText('FENIX Eval CF', { x:0.4, y:0.3,  w:8, fontSize:28, bold:true,  color:WHITE, fontFace:'Calibri' });
    s1.addText(subHdr,          { x:0.4, y:0.85, w:8, fontSize:14, bold:false, color:GOLD,  fontFace:'Calibri' });
    const defCanvas = gid('radarDef');
    if (!_cPdfIsGb && defCanvas) {
      s1.addImage({ data: attCanvas.toDataURL('image/png'), x:0.4, y:1.3, w:4.2, h:3.8 });
      s1.addImage({ data: defCanvas.toDataURL('image/png'), x:5.4, y:1.3, w:4.2, h:3.8 });
    } else {
      s1.addImage({ data: attCanvas.toDataURL('image/png'), x:2.9, y:1.3, w:4.2, h:3.8 });
    }
    s1.addText('● Joueur', { x:0.4, y:5.1, fontSize:9, color:'3B82F6', fontFace:'Calibri' });
    s1.addText('● Staff',  { x:1.5, y:5.1, fontSize:9, color:'F97316', fontFace:'Calibri' });
    if (logoB64) s1.addImage({ data:logoB64, x:8.8, y:4.9, w:0.9, h:0.5 });
    s1.addShape(prs.ShapeType.rect, { x:0, y:5.3, w:10, h:0.325, fill:{ color:NAVY } });

    // ── SLIDE 2 : tableau récap Attaque ──────────────────────────────────
    const s2 = prs.addSlide();
    s2.background = { color: BG };
    addHeader(s2, _cPdfIsGb ? '🧤 GARDIEN DE BUT' : '⚡ ATTAQUE', subHdr);
    addCapture(s2, await captureEl('pptCaptureAtt', '#FFFFFF'), 'Tableau non disponible.');

    // ── SLIDE 3 : tableau récap Défense (si non GB) ───────────────────────
    if (!_cPdfIsGb && _cDefId) {
      const s3 = prs.addSlide();
      s3.background = { color: BG };
      addHeader(s3, '🛡 DÉFENSE', subHdr);
      addCapture(s3, await captureEl('pptCaptureDef', '#FFFFFF'), 'Tableau non disponible.');
    }

    // ── SLIDE 4 : compte-rendu entretien ─────────────────────────────────
    const s4 = prs.addSlide();
    s4.background = { color: BG };
    addHeader(s4, '📋 COMPTE-RENDU D\'ENTRETIEN', subHdr);
    const crVide = !['crAxesAtt','crAxesDef','crCT','crMT','crNotes']
      .some(id => gid(id)?.value?.trim());
    if (crVide) {
      s4.addText('Aucun compte-rendu saisi.', { x:0.5, y:2, fontSize:12,
        color:'94A3B8', fontFace:'Calibri', italic:true });
    } else {
      addCapture(s4, await captureEl('pptCaptureCR', '#F8FAFC'), 'Compte-rendu non disponible.');
    }

    // ── Export fichier ────────────────────────────────────────────────────
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

---

## Critères d'acceptation

- [ ] html2canvas CDN chargé dans `coach.html` avant `coach-dashboard.js`
- [ ] Guard `if (!window.html2canvas)` → toast "Librairie de capture non chargée" + return
- [ ] `coach-dashboard.js` version bumpée à v=45 dans `coach.html`
- [ ] `#pptCaptureAtt` présent dans le DOM après chargement d'un joueur
- [ ] `#pptCaptureDef` présent dans le DOM si joueur non GB
- [ ] `#pptCaptureCR` présent dans le DOM (card CR)
- [ ] Slide 1 : radars capturés via `toDataURL()`, fond navy, légende Joueur/Staff
- [ ] Slide 2 : image capturée du tableau récap Attaque insérée sous l'en-tête (ou "Tableau non disponible.")
- [ ] Slide 3 : image capturée du tableau récap Défense (absente si GB)
- [ ] Slide 4 : image capturée de la section CR si non vide, sinon "Aucun compte-rendu saisi."
- [ ] Si `captureEl()` lève une exception → retourne null → fallback texte, export continue
- [ ] Fichier nommé `FENIX_[nom]_[session].pptx`
- [ ] `player-home.js` non modifié
- [ ] `exportCoachPDF()` (ancienne fonction) toujours dans le code, non modifiée

---

## Hors scope

- Modifier le rendu HTML des zones capturées
- Changer la disposition des slides
- Capturer `#axisDetail` (détail critères par axe — non visible sans clic)
- Support mobile de l'export PPT

---

## Dépend de

STORY-12 (export PPT programmatique) — déjà livré. Cette story remplace `exportCoachPPT()` uniquement.

---

## Taille

M — trois modifications bien délimitées (CDN, wrappers ID, refonte fonction), pas de nouvelle logique complexe.
