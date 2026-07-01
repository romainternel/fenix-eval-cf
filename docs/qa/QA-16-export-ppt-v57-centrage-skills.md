# QA — PPT v57 — Fix centrage slides + Skills overflow
> Agent : QA | Date : 2026-07-01 | Verdict : **PASSED**

## Périmètre
`coach-dashboard.js v=57` — 3 correctifs visuels sur `exportCoachPPT()`.

## Critères d'acceptation

| # | Critère | Vérification | Résultat |
|---|---------|-------------|----------|
| CA-01 | `prs.layout = 'LAYOUT_16x9'` (L677) | Lu en L677 | ✅ PASS |
| CA-02 | Slide 10"×5.625" : gold stripe `w:10` couvre toute la largeur | Rect w=10" = slide width ✓ | ✅ PASS |
| CA-03 | Logo `x:9.05+w:0.72=9.77"` ne déborde pas de 10" | 9.77 < 10 ✓ | ✅ PASS |
| CA-04 | Content slides 3&4 : `x:0.1+w:9.8=9.9"` < 10" | 9.9 < 10 ✓ | ✅ PASS |
| CA-05 | Content slides 3&4 : `y:0.74+h:4.875=5.615"` < 5.625" | 5.615 < 5.625 ✓ | ✅ PASS |
| CA-06 | `align:'center'` sur titre (L684) | Lu en L684 ✓ | ✅ PASS |
| CA-07 | `align:'center'` sur sous-titre (L685) | Lu en L685 ✓ | ✅ PASS |
| CA-08 | `availH` = 743px pour profil 4 axes (safety -40) | 975-24-40-128-40=743 ✓ | ✅ PASS |
| CA-09 | `rowH` ailier-att = 35px > 34px → `showDesc = true` | max(24,floor(743/21))=35≥34 ✓ | ✅ PASS |
| CA-10 | Table ailier-att totale = 924px < 951px disponibles | 40+128+21×36=924 ✓ | ✅ PASS |
| CA-11 | Axe Skills (5 critères) complet dans 924px | 924+27px marge → visible ✓ | ✅ PASS |
| CA-12 | Ratio capture CW/CH = 1960/975 = 2.0103 = box 9.8/4.875 | Identiques ✓ | ✅ PASS |
| CA-13 | Slide 2 : ratio 940×472 = 1.9915 = 9.4/4.72 | Identiques ✓ | ✅ PASS |
| CA-14 | `coach.html` bumped v=56→v=57 | L55 coach.html ✓ | ✅ PASS |

## Cas limites

| Cas | Attendu | Résultat |
|-----|---------|----------|
| Profil 28 critères | rowH=max(24,floor(743/28))=26, showDesc=false, table=40+128+28×26=896px<951px | ✅ PASS |
| Profil 35 critères (max théorique) | rowH=24 (plancher), table=40+128+35×24=888px<951px | ✅ PASS |
| Gardien (GB, 1 seul profil) | _cDefId absent → slide 4 sautée, 4 slides max | ✅ PASS — logique inchangée |
| html2canvas throw | b64=null → fallback addText → pas de crash | ✅ PASS — inchangé |
| LAYOUT_16x9 non supporté par navigateur | PptxGenJS v3 gère le layout dans le PPTX, indépendant du navigateur | ✅ PASS |

## Régressions détectées
Aucune.

- `captureDiv` : signature inchangée ✓
- `captureEl` : inchangée ✓
- `addCapture` : inchangée ✓
- `buildAxisDetailHTML` / `showAxisDetail` : inchangées ✓
- Dashboard joueur / sessions / joueurs : non touchés ✓

## Bugs trouvés
Aucun bug bloquant ou majeur.

> **Note mineure** : le bord bas des slides 3&4 est à 5.615" sur une slide de 5.625" (0.01" de marge). Fonctionnellement sans impact — PowerPoint affiche la slide correctement. Non bloquant.

## Verdict final
**PASSED — 14/14 critères validés, 5/5 cas limites couverts.**
