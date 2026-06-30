# Rapport de régression — v50 (STORY-13)

> Agent : Regression Guardian | Date : 2026-07-01

---

## Contexte

STORY-13 remplace le corps de `exportCoachPPT()` dans `pages/coach-dashboard.js` et ajoute :
- CDN html2canvas dans `coach.html`
- Wrappers `#pptCaptureAtt`, `#pptCaptureDef` dans le template résultats
- `id="pptCaptureCR"` sur la card entretien

Fichiers modifiés : `coach.html`, `pages/coach-dashboard.js`
Fichiers NON modifiés : `player-home.js`, `fenix.css`, `index.html`, `player.html`, Edge Functions

---

## Résultat de la vérification — R01 à R15

| # | Feature | Impact STORY-13 | Statut |
|---|---------|----------------|--------|
| R01 | Login email/password | Aucun — index.html et app.js non modifiés | RAS ✅ |
| R02 | Routage par rôle | Aucun — requireAuth non modifié | RAS ✅ |
| R03 | Création joueur | Aucun — Edge Function + logique création non modifiée | RAS ✅ |
| R04 | Évaluation joueur | Aucun — player-home.js non modifié | RAS ✅ |
| R05 | Sessions coach | Aucun — renderSessions() non modifié | RAS ✅ |
| R06 | Radar résultats | Aucun — rendu radars inchangé, IDs `radarAtt`/`radarDef` intacts | RAS ✅ |
| R07 | Déconnexion | Aucun | RAS ✅ |
| R08 | Edge Function create-player-account | Aucun | RAS ✅ |
| R09 | RLS joueur isolé | Aucun | RAS ✅ |
| R10 | Edge Function manage-coach-account | Aucun | RAS ✅ |
| R11 | Interface gestion coachs | Aucun | RAS ✅ |
| R12 | Export PPT (structure STORY-12) | Slide 1 radars conservée à l'identique. `exportCoachPPT()` signature inchangée. Bouton PPT fonctionnel. **Remplacé** par l'implémentation html2canvas — voir R15 | REMPLACÉ ✅ |
| R13 | Show/hide password | Aucun — logique show/hide dans app.js et modal coach non modifiée | RAS ✅ |
| R14 | Radar font size | Aucun — CSS et Chart.js options inchangés | RAS ✅ |
| R15 | Export PPT html2canvas (nouveau) | Feature principale de STORY-13 — validée par QA-13 | AJOUTÉ ✅ |

---

## Points de vigilance

### `cRecapTableHTML()` encapsulé dans des wrappers div
Les appels `cRecapTableHTML()` aux lignes 1026-1027 sont maintenant encapsulés dans `<div id="pptCaptureAtt">` et `<div id="pptCaptureDef">`. Cette div est transparente visuellement (pas de style propre) — elle n'affecte pas le rendu HTML. La fonction `cRecapTableHTML()` elle-même n'est pas modifiée.

### CDN html2canvas additionnel
Un nouveau `<script>` CDN est ajouté dans `coach.html`. Si le CDN est indisponible, `window.html2canvas` est undefined → le guard ligne 656 affiche un toast et retourne proprement sans crash.

---

## Verdict : RAS — aucune régression détectée ✅
