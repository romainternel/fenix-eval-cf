# Architecture — Export PowerPoint

> Agent : Architect | Date : 2026-06-30
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
