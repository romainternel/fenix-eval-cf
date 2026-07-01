# Rapport de régression — v53 — PPT v3 — Fix ratio axis slides
> Agent : Regression Guardian | Date : 2026-07-01

## Fichiers modifiés

| Fichier | Changement |
|---------|-----------|
| `pages/coach-dashboard.js` | captureDiv +height param, addAxisSlides rewritten (1880×940, inline styles) |
| `coach.html` | Bump v=49 → v=50 |
| `docs/design/export-ppt.md` | Nouveau — spec Designer |
| `docs/qa/QA-15-export-ppt-v3.md` | Nouveau |

## Résultats checklist

| # | Feature | Impact | Résultat |
|---|---------|--------|----------|
| R01 | Login | Aucun | ✓ RAS |
| R02 | Routage rôle | Aucun | ✓ RAS |
| R03 | Création joueur | Aucun | ✓ RAS |
| R04 | Évaluation joueur | Aucun | ✓ RAS |
| R05 | Sessions coach | Aucun | ✓ RAS |
| R06 | Radar résultats | Aucun — captureDiv(radarDiv,900) sans height → fallback scrollHeight inchangé | ✓ RAS |
| R07 | Déconnexion | Aucun | ✓ RAS |
| R08 | Edge Function create-player | Aucun | ✓ RAS |
| R09 | RLS joueur | Aucun | ✓ RAS |
| R10 | Edge Function manage-coach | Aucun | ✓ RAS |
| R11 | Interface gestion coachs | Aucun | ✓ RAS |
| R12 | Export PPT résultats joueur | **Modifié** — addAxisSlides rewritten, ratio fix visuel uniquement | ✓ RAS |
| R13 | Show/hide password | Aucun | ✓ RAS |
| R14 | Radar font size | Aucun | ✓ RAS |
| R16 | Export PPT v2 (STORY-14) | **Supersédé visuellement** — slides 3-10 améliorées, slides 1/2/11 inchangées | ✓ RAS |
| R17 | showAxisDetail refactoring | Non modifié | ✓ RAS |

## Verdict
**RAS — aucune régression détectée. v53 prête pour déploiement.**
