# STORY-12 — Export PowerPoint résultats joueur

**En tant que** coach,
**Je veux** exporter les résultats d'évaluation d'un joueur en fichier PowerPoint,
**Afin de** présenter un rapport professionnel 4 slides lors des bilans de saison ou des entretiens individuels.

---

## Contexte technique

- **Fichiers modifiés :** `coach.html`, `pages/coach-dashboard.js`
- **Fichiers non modifiés :** `player-home.js`, `css/fenix.css`, `index.html`, `player.html`
- **Librairie ajoutée :** PptxGenJS v3 via CDN `https://cdn.jsdelivr.net/npm/pptxgenjs@3/dist/pptxgen.bundle.js`
- **Fonction remplacée :** le bouton `onclick="exportCoachPDF()"` devient `onclick="exportCoachPPT()"`. `exportCoachPDF()` reste dans le code mais n'est plus appelée.
- **Données disponibles :** `_cAttId`, `_cDefId`, `_cPdfNom`, `_cPdfSession`, `_cPdfIsGb`, `_coachEvalMap`, `CRITERIA`, canvas `radarAtt`/`radarDef`, textareas `crAxesAtt`, `crAxesDef`, `crCT`, `crMT`, `crNotes`
- **Logo :** `assets/logo-transparent.jpeg` — fetch + base64 au moment de l'export

---

## Implémentation guidée

### Étape 1 — coach.html : ajout CDN PptxGenJS

Ajouter après le script jsPDF existant (ligne ~49) :
```html
<script src="https://cdn.jsdelivr.net/npm/pptxgenjs@3/dist/pptxgen.bundle.js"></script>
```
Bumper `coach-dashboard.js?v=43` → `?v=44`.

---

### Étape 2 — Bouton PPT

Remplacer dans la vue résultats :
```javascript
// Avant
`<button class="btn btn-ghost btn-sm" onclick="exportCoachPDF()">📄 PDF</button>`

// Après
`<button class="btn btn-ghost btn-sm" id="btnExportPpt" onclick="exportCoachPPT()">📊 PPT</button>`
```

---

### Étape 3 — Fonction `exportCoachPPT()` dans coach-dashboard.js

Ajouter juste après `exportCoachPDF()` (ligne ~653) :

```javascript
async function exportCoachPPT() {
  if (!window.PptxGenJS) { showToast('Librairie PPT non chargée'); return; }
  const attCanvas = gid('radarAtt');
  if (!attCanvas) { showToast('Ouvrez d\'abord la vue résultats d\'un joueur'); return; }

  const btn = gid('btnExportPpt');
  if (btn) { btn.disabled = true; btn.textContent = 'Génération…'; }
  showToast('Génération du PPT…');

  try {
    // Logo en base64
    let logoB64 = null;
    try {
      const r = await fetch('assets/logo-transparent.jpeg');
      const blob = await r.blob();
      logoB64 = await new Promise(res => {
        const reader = new FileReader();
        reader.onloadend = () => res(reader.result);
        reader.readAsDataURL(blob);
      });
    } catch (_) { /* logo optionnel */ }

    const prs = new window.PptxGenJS();
    prs.layout = 'LAYOUT_WIDE'; // 16:9, 10" × 5.625"

    const NAVY = '0A2463', GOLD = 'C8A84B', WHITE = 'FFFFFF';
    const BG   = 'F8FAFC';
    const NOTE_COLORS = {
      1: { fill:'EF4444', text:WHITE },
      2: { fill:'F97316', text:WHITE },
      3: { fill:'EAB308', text:'1E293B' },
      4: { fill:'84CC16', text:'1E293B' },
      5: { fill:'22C55E', text:'1E293B' },
    };

    function addHeader(slide, title, subtitle) {
      slide.addShape(prs.ShapeType.rect, { x:0, y:0, w:10, h:0.12, fill:{ color:GOLD } });
      slide.addShape(prs.ShapeType.rect, { x:0, y:0, w:10, h:1.2,  fill:{ color:NAVY } });
      slide.addText(title,    { x:0.35, y:0.15, w:9.3, fontSize:20, bold:true,  color:WHITE, fontFace:'Calibri' });
      slide.addText(subtitle, { x:0.35, y:0.75, w:9.3, fontSize:10, bold:false, color:GOLD,  fontFace:'Calibri' });
      if (logoB64) slide.addImage({ data:logoB64, x:9.0, y:5.1, w:0.7, h:0.4 });
    }

    function noteCell(n) {
      const c = NOTE_COLORS[n];
      if (!c) return { text:'—', options:{ fill:{ color:'E2E8F0' }, color:'94A3B8', bold:false, align:'center', fontSize:9, fontFace:'Calibri' } };
      return { text: String(n), options:{ fill:{ color:c.fill }, color:c.text, bold:true, align:'center', fontSize:10, fontFace:'Calibri' } };
    }

    function buildCriteresTable(slide, profilId, startY) {
      const profil = CRITERIA[profilId];
      if (!profil) return;
      const rows = [[
        { text:'Critère', options:{ bold:true, fill:{ color:'E2E8F0' }, color:'0A2463', fontSize:9, fontFace:'Calibri' } },
        { text:'Joueur',  options:{ bold:true, fill:{ color:'E2E8F0' }, color:'0A2463', fontSize:9, fontFace:'Calibri', align:'center' } },
        { text:'Staff',   options:{ bold:true, fill:{ color:'E2E8F0' }, color:'0A2463', fontSize:9, fontFace:'Calibri', align:'center' } },
      ]];
      Object.entries(profil.axes).forEach(([, axe]) => {
        rows.push([
          { text: axe.label.toUpperCase(), options:{ bold:true, fill:{ color:'EEF2FF' }, color:NAVY, fontSize:8, fontFace:'Calibri', colspan:3 } },
          { text:'', options:{} }, { text:'', options:{} },
        ]);
        axe.criteres.forEach(c => {
          const ev = _coachEvalMap[c.id] || {};
          rows.push([
            { text: c.label, options:{ fill:{ color:WHITE }, color:'1E293B', fontSize:9, fontFace:'Calibri' } },
            noteCell(ev.note_joueur || 0),
            noteCell(ev.note_staff  || 0),
          ]);
        });
      });
      slide.addTable(rows, {
        x:0.3, y:startY, w:9.4,
        rowH: 0.27,
        colW: [6.5, 1.45, 1.45],
        border: { type:'solid', color:'E2E8F0', pt:0.5 },
      });
    }

    const attLbl = PROFIL_LABELS[_cAttId] || _cAttId || '—';
    const defLbl = PROFIL_LABELS[_cDefId] || _cDefId || '—';
    const subHdr = `${_cPdfNom}  ·  ${_cPdfSession}`;

    // ── SLIDE 1 : radars ──────────────────────────────────────────────
    const s1 = prs.addSlide();
    s1.background = { color: NAVY };
    s1.addShape(prs.ShapeType.rect, { x:0, y:0, w:10, h:0.15, fill:{ color:GOLD } });
    s1.addShape(prs.ShapeType.rect, { x:0, y:0, w:0.15, h:5.625, fill:{ color:GOLD } });
    s1.addText('FENIX Eval CF', { x:0.4, y:0.3,  w:8, fontSize:28, bold:true,  color:WHITE, fontFace:'Calibri' });
    s1.addText(subHdr,          { x:0.4, y:0.85, w:8, fontSize:14, bold:false, color:GOLD,  fontFace:'Calibri' });

    const defCanvas = gid('radarDef');
    if (!_cPdfIsGb && defCanvas) {
      s1.addImage({ data: attCanvas.toDataURL('image/png'), x:0.4,  y:1.3, w:4.2, h:3.8 });
      s1.addImage({ data: defCanvas.toDataURL('image/png'), x:5.4,  y:1.3, w:4.2, h:3.8 });
    } else {
      s1.addImage({ data: attCanvas.toDataURL('image/png'), x:2.9, y:1.3, w:4.2, h:3.8 });
    }
    s1.addText('● Joueur', { x:0.4, y:5.1, fontSize:9, color:'3B82F6', fontFace:'Calibri' });
    s1.addText('● Staff',  { x:1.5, y:5.1, fontSize:9, color:'F97316', fontFace:'Calibri' });
    if (logoB64) s1.addImage({ data:logoB64, x:8.8, y:4.9, w:0.9, h:0.5 });
    s1.addShape(prs.ShapeType.rect, { x:0, y:5.3, w:10, h:0.325, fill:{ color:NAVY } });

    // ── SLIDE 2 : critères Attaque (ou GB) ───────────────────────────
    const s2 = prs.addSlide();
    s2.background = { color: BG };
    const s2Icon = _cPdfIsGb ? '🧤' : '⚡';
    addHeader(s2, `${s2Icon} ${_cPdfIsGb ? 'GARDIEN DE BUT' : 'ATTAQUE'} — ${attLbl.toUpperCase()}`, subHdr);
    buildCriteresTable(s2, _cAttId, 1.35);

    // ── SLIDE 3 : critères Défense (skipped si GB) ───────────────────
    if (!_cPdfIsGb && _cDefId) {
      const s3 = prs.addSlide();
      s3.background = { color: BG };
      addHeader(s3, `🛡 DÉFENSE — ${defLbl.toUpperCase()}`, subHdr);
      buildCriteresTable(s3, _cDefId, 1.35);
    }

    // ── SLIDE 4 : compte-rendu entretien ─────────────────────────────
    const s4 = prs.addSlide();
    s4.background = { color: BG };
    addHeader(s4, '📋 COMPTE-RENDU D\'ENTRETIEN', subHdr);

    const crSecs = [
      { id:'crAxesAtt', label:'AXES PRIORITAIRES — ATTAQUE' },
      { id:'crAxesDef', label:'AXES PRIORITAIRES — DÉFENSE' },
      { id:'crCT',      label:'OBJECTIF COURT TERME' },
      { id:'crMT',      label:'OBJECTIF MOYEN TERME' },
      { id:'crNotes',   label:'COMPTE-RENDU ENTRETIEN' },
    ];
    const filled = crSecs.map(s => ({ ...s, val: (gid(s.id)?.value || '').trim() })).filter(s => s.val);

    if (filled.length === 0) {
      s4.addText('Aucun compte-rendu saisi.', { x:0.5, y:2, fontSize:12, color:'94A3B8', fontFace:'Calibri', italic:true });
    } else {
      let yPos = 1.4;
      const cols = [
        filled.filter((_, i) => i % 2 === 0),
        filled.filter((_, i) => i % 2 !== 0),
      ];
      const xPos = [0.3, 5.1];
      cols.forEach((col, ci) => {
        let y = 1.4;
        col.forEach(sec => {
          s4.addText(sec.label, { x:xPos[ci], y, w:4.5, fontSize:8, bold:true, color:NAVY, fontFace:'Calibri' });
          y += 0.22;
          s4.addText(sec.val, {
            x:xPos[ci], y, w:4.5,
            fontSize:8, color:'1E293B', fontFace:'Calibri',
            wrap:true, shrinkText:true,
            fill:{ color:WHITE },
            line:{ color:'D0D7E5', pt:0.5 },
            h:0.7,
          });
          y += 0.85;
        });
      });
    }

    // ── Sauvegarde ────────────────────────────────────────────────────
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

- [ ] `coach.html` charge PptxGenJS via CDN avant `coach-dashboard.js`
- [ ] Le bouton dans la vue résultats affiche "📊 PPT" et appelle `exportCoachPPT()`
- [ ] Clic sans joueur chargé → toast "Ouvrez d'abord la vue résultats d'un joueur", pas d'erreur JS
- [ ] Clic avec joueur chargé → fichier `FENIX_[nom]_[session].pptx` téléchargé
- [ ] Slide 1 : deux radars côte à côte (ou un seul si GB), légende bleu/orange, fond navy
- [ ] Slide 2 : tableau critères Attaque avec couleur de cellule selon note (n1-n5)
- [ ] Slide 3 : tableau critères Défense (absent si GB)
- [ ] Slide 4 : sections CR non vides uniquement ; si tout vide → "Aucun CR saisi"
- [ ] Cas GB : slide 2 titrée "GARDIEN DE BUT", pas de slide 3
- [ ] Logo `assets/logo-transparent.jpeg` présent dans les slides (ou absent sans erreur si fetch échoue)
- [ ] `exportCoachPDF()` (joueur, player-home.js) toujours fonctionnelle après cette story
- [ ] `coach-dashboard.js` version bumpée à v=44 dans `coach.html`

---

## Hors scope

- Modification de `player-home.js` ou de l'export PDF joueur
- Ajout de transitions ou animations dans le PPT
- Export multi-joueurs
- Personnalisation des couleurs par l'utilisateur

---

## Dépend de

Aucune story — toutes les données sont déjà disponibles en mémoire.

## Taille

L — fonction longue (~100 lignes), plusieurs slides, fetch logo async, cas GB à gérer.
