# QA Report — STORY-13 : Refonte export PPT (html2canvas)

> Agent : QA | Date : 2026-07-01 | Code Reviewer : APPROUVÉ ✅ | Security Auditor : SKIPPÉ

---

## Verdict : PASSED ✅

---

## Critères d'acceptation

| # | Critère | Statut | Vérification |
|---|---------|--------|-------------|
| CA-01 | CDN html2canvas chargé avant `coach-dashboard.js` | ✅ | `coach.html` ligne 51 : script html2canvas, puis ligne 55 : coach-dashboard.js |
| CA-02 | Guard `!window.html2canvas` → toast "Librairie de capture non chargée" + return | ✅ | Ligne 656 dans `exportCoachPPT()` |
| CA-03 | `coach-dashboard.js?v=45` dans `coach.html` | ✅ | Ligne 55 de `coach.html` |
| CA-04 | `#pptCaptureAtt` dans le DOM après chargement joueur | ✅ | Ligne 1026 : `<div id="pptCaptureAtt">` wrappant `cRecapTableHTML(_cAttId, ...)` |
| CA-05 | `#pptCaptureDef` dans le DOM si non GB | ✅ | Ligne 1027 : conditionnel `_cDefId`, absent si GB |
| CA-06 | `#pptCaptureCR` dans le DOM (card CR) | ✅ | Ligne 1033 : `id="pptCaptureCR"` sur la div.card |
| CA-07 | Slide 1 : radars via `toDataURL()`, fond navy, légende | ✅ | Lignes 711-727 : inchangées de STORY-12 |
| CA-08 | Slide 2 : image capturée tableau Att ou fallback "Tableau non disponible." | ✅ | Ligne 732 : `addCapture(s2, await captureEl('pptCaptureAtt', ...), 'Tableau non disponible.')` |
| CA-09 | Slide 3 : absente si GB | ✅ | Guard `!_cPdfIsGb && _cDefId` ligne 734 |
| CA-10 | Slide 4 : capture CR si non vide, sinon "Aucun compte-rendu saisi." | ✅ | Lignes 744-750 |
| CA-11 | `captureEl()` exception → null → fallback texte, export continue | ✅ | try/catch dans `captureEl()` retourne null, `addCapture()` affiche fallback si null |
| CA-12 | Fichier nommé `FENIX_[nom]_[session].pptx` | ✅ | Ligne 753-754 : `FENIX_${safe}.pptx` |
| CA-13 | `player-home.js` non modifié | ✅ | Confirmé `git diff --name-only` |
| CA-14 | `exportCoachPDF()` toujours présent | ✅ | Toujours à la ligne 551 |

---

## Cas limites testés (analyse statique)

### Joueur GB (gardien de but)
- `_cPdfIsGb = true` → slide 2 titre "🧤 GARDIEN DE BUT", `#pptCaptureDef` absent du DOM (conditionnel `_cDefId`), slide 3 skippée ✅

### CR vide
- `.some(id => gid(id)?.value?.trim())` retourne false → "Aucun compte-rendu saisi." sans tentative de capture ✅

### Zone DOM absente (`#pptCaptureAtt` non trouvée)
- `captureEl('pptCaptureAtt')` : `gid(id)` retourne null → return null immédiatement → `addCapture()` affiche "Tableau non disponible." ✅

### Clic bouton avant chargement joueur
- `gid('radarAtt')` null → toast "Ouvrez d'abord la vue résultats d'un joueur" + return ✅

### Clic double rapide
- `btn.disabled = true` dès le 1er clic, `finally` réactive → pas de double export ✅

### Logo fetch offline
- try/catch silencieux → `logoB64 = null` → slides générées sans logo ✅

### Exception interne html2canvas
- try/catch dans `captureEl()` → return null → addCapture affiche fallback, le reste de l'export continue ✅

---

## Régressions

Aucune régression détectée :
- `exportCoachPDF()` (ligne 551) non touchée
- `cRecapTableHTML()` (ligne 815+) non touchée — les wrappers l'encapsulent mais ne modifient pas son comportement
- Tous les autres onglets coach (Sessions, Joueurs, Coachs) non impactés
- `player-home.js` non modifié → export PDF joueur intact

---

## Notes

- Le titre de slide 2 passe de `"⚡ ATTAQUE — AILIER ATT"` à `"⚡ ATTAQUE"` : comportement voulu (profil visible dans le tableau capturé). Pas une régression, change conforme au pseudocode de la story.
- `sizing: { type:'contain', w:9.4, h:4.1 }` garantit que les captures longues (beaucoup de critères) s'adaptent sans déborder.
