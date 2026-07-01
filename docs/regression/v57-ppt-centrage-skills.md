# Rapport de régression — v57 — PPT Fix centrage + Skills overflow
> Agent : Regression Guardian | Date : 2026-07-01

## Fichiers modifiés

| Fichier | Changement |
|---------|-----------|
| `pages/coach-dashboard.js` | `exportCoachPPT()` : layout LAYOUT_16x9, align:center header, rowH safety -40 |
| `coach.html` | Bump v=56 → v=57 |

## Analyse d'impact

Seule `exportCoachPPT()` est modifiée — code isolé dans un `try/catch`, appelé uniquement sur clic bouton "📊 PPT". Aucune autre fonction du dashboard n'est touchée.

## Résultats checklist

| # | Feature | Impact | Résultat |
|---|---------|--------|----------|
| R01 | Login email/password | Aucun | ✓ RAS |
| R02 | Routage par rôle | Aucun | ✓ RAS |
| R03 | Création joueur | Aucun | ✓ RAS |
| R04 | Évaluation joueur | Aucun | ✓ RAS |
| R05 | Sessions coach | Aucun | ✓ RAS |
| R06 | Radar résultats | Aucun — `captureDiv`, `radarDiv`, canvas ATT/DEF inchangés | ✓ RAS |
| R07 | Déconnexion | Aucun | ✓ RAS |
| R08 | Edge Function create-player | Aucun | ✓ RAS |
| R09 | RLS joueur | Aucun | ✓ RAS |
| R10 | Edge Function manage-coach | Aucun | ✓ RAS |
| R11 | Interface gestion coachs | Aucun | ✓ RAS |
| R12 | Export PPT (bouton + flow) | **Modifié** — layout + header + rowH. Garde-fous try/catch inchangés | ✓ RAS |
| R13 | Show/hide password | Aucun | ✓ RAS |
| R14 | Radar font size | Aucun | ✓ RAS |
| R15 | PPT html2canvas (supersédé) | — | — |
| R16 | Export PPT v2 5 slides | **Modifié** — améliorations visuelles, structure 5 slides inchangée | ✓ RAS |
| R17 | `showAxisDetail()` | Aucun — `buildAxisDetailHTML` non touché | ✓ RAS |

## Mise à jour checklist R16

R16 mis à jour : dernière vérif. OK → v57 (2026-07-01).

## Verdict
**RAS — aucune régression détectée. v57 prête pour déploiement.**
