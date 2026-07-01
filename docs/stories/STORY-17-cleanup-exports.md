# STORY-17 — Cleanup exports (PPT progression + PDF)

**En tant que** coach,
**Je veux** que la toolbar résultats ne propose qu'un seul bouton export `📊 PPT`,
**Afin d'** éviter la confusion entre plusieurs exports aux usages flous.

---

## Contexte technique

- **Fichier principal** : `pages/coach-dashboard.js`
- **Fichier secondaire** : `coach.html`
- **Fonctions à supprimer** :
  - `exportProgressionPPT()` (ajoutée en v60, ~160 lignes)
  - `exportCoachPDF()` (existante depuis STORY-11, ~150 lignes)
- **Boutons à retirer** du template string dans `showPlayerResults()` / `showCoachRadar()` :
  - `<button id="btnExportProgPpt" onclick="exportProgressionPPT()">📈 PPT Prog.</button>`
  - Bouton PDF (s'il existe — chercher `exportCoachPDF` dans le HTML généré)
- **CDN à retirer de `coach.html`** :
  - `<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>`

---

## Ordre d'exécution obligatoire (risque R2/R3)

1. Retirer les boutons du HTML template (template string dans la toolbar)
2. Supprimer les fonctions `exportProgressionPPT()` et `exportCoachPDF()`
3. Retirer le CDN jsPDF de `coach.html`
4. Bump versions

---

## Critères d'acceptation

- [ ] Grep `exportProgressionPPT` dans coach-dashboard.js → 0 occurrence après suppression
- [ ] Grep `exportCoachPDF` dans coach-dashboard.js → 0 occurrence après suppression
- [ ] Grep `jspdf` dans coach.html → 0 occurrence après retrait CDN
- [ ] La toolbar résultats joueur n'affiche plus que le bouton `📊 PPT` (plus de `📈 PPT Prog.` ni de bouton PDF)
- [ ] Aucune erreur console au chargement de coach.html
- [ ] `coach-dashboard.js` bumped (si pas déjà bumped par STORY-16) ; `coach.html` bumped

---

## Hors scope

- Suppression de `captureEl()` et `captureDiv()` (encore utilisées par les slides restantes du PPT)
- Suppression de html2canvas CDN (encore utilisé par le PPT)
- Suppression de PptxGenJS CDN (encore utilisé)
- Modification de `player-home.js` ou `player.html`

---

## Dépend de

Aucune (peut être livré avant ou après STORY-16)

---

## Taille

S
