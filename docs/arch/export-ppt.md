# Architecture — Refonte export PPT par capture d'écran

> Agent : Architect | Date : 2026-06-30 (refonte STORY-12)

---

## 1. Décision technique

**Approche : capture des zones DOM existantes via html2canvas + canvas natif pour les radars.**

Les slides PPT sont assemblées ainsi :
- En-tête (PptxGenJS — shapes + texte) : inchangé depuis STORY-12
- Contenu (image base64 via `slide.addImage`) : capture html2canvas ou `canvas.toDataURL()`

Aucune reconstruction programmatique des données dans PptxGenJS — tout le contenu provient des zones déjà rendues par le navigateur.

---

## 2. Audit DOM — Zones à capturer

### Slide 1 — Radars

| ID | Type | Disponibilité | Méthode |
|----|------|--------------|---------|
| `#radarAtt` | `<canvas>` | Toujours présent si joueur chargé | `canvas.toDataURL('image/png')` |
| `#radarDef` | `<canvas>` | Absent si GB | `canvas.toDataURL('image/png')` |

→ Pas besoin de html2canvas. Déjà fonctionnel.

### Slides 2 & 3 — Tableaux récapitulatifs (cRecapTableHTML)

Le code génère les tableaux via `cRecapTableHTML()` injectés directement dans `.card-body` **sans wrapper ID** (lignes 1077-1078 de coach-dashboard.js).

**Décision** : ajouter des wrappers `id="pptCaptureAtt"` et `id="pptCaptureDef"` autour des appels `cRecapTableHTML()` dans le template HTML de la vue résultats.

```javascript
// Avant
${_cAttId ? cRecapTableHTML(_cAttId, _coachEvalMap, ...) : ''}
${_cDefId ? cRecapTableHTML(_cDefId, _coachEvalMap, ...) : ''}

// Après
${_cAttId ? `<div id="pptCaptureAtt">${cRecapTableHTML(_cAttId, _coachEvalMap, ...)}</div>` : ''}
${_cDefId ? `<div id="pptCaptureDef">${cRecapTableHTML(_cDefId, _coachEvalMap, ...)}</div>` : ''}
```

**Contenu capturé** : tableau de synthèse par axe/thème (moyennes Staff / Joueur / Écart delta coloré), déjà stylé FENIX.

### Slide 4 — Compte-rendu entretien

La carte CR est un `<div class="card">` sans ID (ligne 1084).

**Décision** : ajouter `id="pptCaptureCR"` directement sur ce `<div class="card">`.

```javascript
// Avant
<div class="card" style="margin-top:12px">

// Après
<div class="card" style="margin-top:12px" id="pptCaptureCR">
```

---

## 3. CDN html2canvas à ajouter

```html
<!-- Dans coach.html, avant coach-dashboard.js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
```

---

## 4. Structure exportCoachPPT() refontée

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
    let logoB64 = null;
    try { /* fetch logo-transparent.jpeg → base64 — inchangé */ } catch (_) {}

    const prs = new window.PptxGenJS();
    prs.layout = 'LAYOUT_WIDE';
    const NAVY = '0A2463', GOLD = 'C8A84B', WHITE = 'FFFFFF', BG = 'F8FAFC';
    const subHdr = `${_cPdfNom}  ·  ${_cPdfSession}`;

    function addHeader(slide, title, subtitle) { /* inchangé */ }

    // Helper : capture un élément DOM → base64 PNG
    async function captureEl(id, bg = '#FFFFFF') {
      const el = gid(id);
      if (!el) return null;
      const cv = await window.html2canvas(el, {
        scale: 2, useCORS: true, backgroundColor: bg, logging: false,
        windowWidth: el.scrollWidth, windowHeight: el.scrollHeight,
      });
      return cv.toDataURL('image/png');
    }

    // Helper : insère la capture dans la zone contenu de la slide
    function addCapture(slide, b64, fallback) {
      if (b64) {
        slide.addImage({ data: b64, x:0.3, y:1.35, w:9.4, h:4.1,
          sizing: { type:'contain', w:9.4, h:4.1 } });
      } else {
        slide.addText(fallback, { x:0.5, y:2, fontSize:12,
          color:'94A3B8', fontFace:'Calibri', italic:true });
      }
    }

    // SLIDE 1 — radars (canvas natif, inchangé)
    // ...

    // SLIDE 2 — tableau Att
    const s2 = prs.addSlide();
    s2.background = { color: BG };
    addHeader(s2, _cPdfIsGb ? '🧤 GARDIEN DE BUT' : '⚡ ATTAQUE', subHdr);
    addCapture(s2, await captureEl('pptCaptureAtt'), 'Tableau non disponible.');

    // SLIDE 3 — tableau Def (si non GB)
    if (!_cPdfIsGb && _cDefId) {
      const s3 = prs.addSlide();
      s3.background = { color: BG };
      addHeader(s3, '🛡 DÉFENSE', subHdr);
      addCapture(s3, await captureEl('pptCaptureDef'), 'Tableau non disponible.');
    }

    // SLIDE 4 — CR entretien
    const s4 = prs.addSlide();
    s4.background = { color: BG };
    addHeader(s4, '📋 COMPTE-RENDU D\'ENTRETIEN', subHdr);
    const crVide = !['crAxesAtt','crAxesDef','crCT','crMT','crNotes']
      .some(id => gid(id)?.value?.trim());
    if (crVide) {
      s4.addText('Aucun compte-rendu saisi.', { x:0.5, y:2, fontSize:12,
        color:'94A3B8', fontFace:'Calibri', italic:true });
    } else {
      addCapture(s4, await captureEl('pptCaptureCR', '#F8FAFC'), 'CR non disponible.');
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

---

## 5. Mitigations

| Risque | Mitigation |
|--------|-----------|
| CSS `var()` non résolues | html2canvas les résout via le browser — pas de mitigation nécessaire. `backgroundColor` explicite en backup. |
| Placeholders textarea | Non rendus dans html2canvas (pseudo-élément) — les champs vides apparaissent simplement vides. |
| Contenu > viewport | `windowWidth: el.scrollWidth, windowHeight: el.scrollHeight` — capture la hauteur réelle, pas le viewport. |
| Scroll position page | Capture sur l'élément lui-même, indépendant du scroll de la page. |

---

## 6. Fichiers modifiés

| Fichier | Nature | Version |
|---------|--------|---------|
| `coach.html` | Ajout CDN html2canvas | v=45 |
| `pages/coach-dashboard.js` | Refonte `exportCoachPPT()` + wrappers `id` dans template résultats | v=45 |

---

## 7. Alternatives rejetées

| Alternative | Raison |
|-------------|--------|
| Garder PptxGenJS programmatique | Rendu moche — raison de cette story |
| Puppeteer / headless Chrome | Requiert un backend — hors stack GitHub Pages |
| `dom-to-image` | Moins fiable sur CSS vars, moins maintenu que html2canvas |
| Div caché avec rendu dédié | Complexité inutile — zones existantes déjà correctement stylées |
> Source : docs/prd.md, docs/design/export-ppt.md

---

## 1. Décision technique

**Librairie : PptxGenJS** (via CDN jsDelivr)
- URL : `https://cdn.jsdelivr.net/npm/pptxgenjs@3/dist/pptxgen.bundle.js`
- Expose `window.PptxGenJS` après chargement
- Poids ~500KB (gzip ~130KB) — acceptable pour un usage coach PC uniquement

**Remplacement de jsPDF coach :**
- La balise `<script src=".../jspdf...">` reste dans coach.html (conservée au cas où)
- La fonction `exportCoachPDF()` est conservée mais le bouton passe à `exportCoachPPT()`
- `exportCoachPPT()` remplace `exportCoachPDF()` comme fonction principale export

**Pas de nouveau fichier JS :** `exportCoachPPT()` est définie dans `coach-dashboard.js`, au même emplacement que `exportCoachPDF()`. La cohérence du fichier unique est respectée.

---

## 2. Pourquoi PptxGenJS et pas une autre approche

| Option | Rejet |
|--------|-------|
| jsPDF avec layout paysage | Pas de support natif tableaux, rendus pixelisés |
| Génération côté serveur (Edge Function) | Complexité inutile, dépendance réseau au moment de l'export |
| html2canvas + jsPDF | Double conversion, qualité dégradée, polices non fidèles |
| PptxGenJS CDN | ✅ API declarative, tableaux natifs, images PNG, pas de build |

---

## 3. Impact sur l'existant

| Fichier | Changement |
|---------|-----------|
| `coach.html` | +1 balise `<script>` CDN PptxGenJS, bump version coach-dashboard.js |
| `pages/coach-dashboard.js` | Remplacement `exportCoachPDF()` → `exportCoachPPT()`, bouton mis à jour |
| `player-home.js` | **Non modifié** — export PDF joueur inchangé |
| `css/fenix.css` | **Non modifié** — aucune nouvelle classe web |
| `index.html`, `player.html` | **Non modifiés** |

---

## 4. Nouvelles fonctions dans coach-dashboard.js

### `exportCoachPPT()` — fonction principale
```
async exportCoachPPT()
  → guard : PptxGenJS disponible ? sinon toast erreur
  → guard : canvas radarAtt ou radarDef présent ? sinon toast
  → showToast("Génération PPT…")
  → désactiver le bouton
  → buildSlide1(prs)  — vue radars
  → buildSlide2(prs)  — critères Attaque (ou GB)
  → buildSlide3(prs)  — critères Défense (skipped si GB)
  → buildSlide4(prs)  — compte-rendu entretien
  → prs.writeFile({ fileName })
  → réactiver le bouton
```

### Fonctions auxiliaires (locales à exportCoachPPT, closures)
- `addHeader(slide, title, subtitle)` — bande navy + titre + gold
- `noteColor(n)` — retourne `{ fill, textColor }` selon niveau 1-5
- `criteresRows(profilId)` — construit les lignes du tableau depuis `CRITERIA` + `_coachEvalMap`
- `logoPath()` — retourne l'URL base64 du logo (ou path relatif selon support PptxGenJS)

---

## 5. Gestion du logo

PptxGenJS accepte les images en base64 ou URL absolue. Comme l'app est sur GitHub Pages :
- URL absolue : `https://romainternel.github.io/fenix-eval-cf/assets/logo-transparent.jpeg`
- Alternative : fetch + base64 au moment de la génération

**Décision : fetch + base64 au moment du clic.**
Cela évite les problèmes CORS et fonctionne indépendamment de l'URL de déploiement.

```javascript
async function fetchLogoBase64() {
  const resp = await fetch('assets/logo-transparent.jpeg');
  const blob = await resp.blob();
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}
```

---

## 6. Données disponibles au moment de l'export

Toutes les données nécessaires sont déjà en mémoire au moment du clic :

| Variable | Contenu | Source |
|----------|---------|--------|
| `_cAttId` | profil_id attaque | global coach-dashboard.js |
| `_cDefId` | profil_id défense (null si GB) | global |
| `_cPdfNom` | Nom du joueur | global |
| `_cPdfSession` | Label de la session | global |
| `_cPdfIsGb` | Booléen profil GB | global |
| `_coachEvalMap` | `critere_id → {note_joueur, note_staff}` | global |
| `CRITERIA` | Structure profils/axes/critères | criteria-data.js |
| DOM `radarAtt`, `radarDef` | Canvas Chart.js déjà rendus | DOM |
| DOM `crAxesAtt`, `crAxesDef`, `crCT`, `crMT`, `crNotes` | Textareas entretien | DOM |

---

## 7. Versions à bumper

| Fichier | Avant | Après |
|---------|-------|-------|
| `pages/coach-dashboard.js` | v=43 | v=44 |
| `coach.html` | v=43 → v=44 pour coach-dashboard.js | bump + ajout CDN PptxGenJS |

---

## 8. Risques techniques

| Risque | Mitigation |
|--------|-----------|
| PptxGenJS CDN indisponible | Guard `if (!window.PptxGenJS)` → toast "Librairie non disponible" |
| Canvas radar non rendu (pas encore cliqué sur joueur) | Guard `if (!gid('radarAtt'))` → toast "Affichez d'abord les résultats" |
| Logo fetch échoue (offline, CORS) | try/catch → slide 1 sans logo plutôt qu'erreur bloquante |
| Critère sans note (`undefined`) | Fallback `note || 0` systématique dans `criteresRows()` |
| Texte CR très long | PptxGenJS wrap automatique activé sur toutes les textbox |
