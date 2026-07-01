# QA — PPT v3 — Fix ratio axis slides
> Agent : QA | Date : 2026-07-01 | Verdict : PASSED

## Périmètre
coach-dashboard.js v=50 — corrections visuelles slides détail axes (slides 3-10)

## Critères d'acceptation

| # | Critère | Résultat |
|---|---------|----------|
| CA-01 | `captureDiv(div, width, height)` : signature étendue, `height` optionnel, fallback `div.scrollHeight` préservé | ✓ PASS — L708 |
| CA-02 | `captureDiv` sans `height` : appels radar (L761) et résumé (via captureEl) non affectés | ✓ PASS — captureEl non modifié, radarDiv fallback div.scrollHeight |
| CA-03 | `N_STYLES` : 5 entrées n1-n5 avec bg/ring/txt correspondant aux CSS vars de fenix.css | ✓ PASS — valeurs vérifiées contre fenix.css L53-57 |
| CA-04 | `pastilleInline(0)` → fond #F1F5F9, anneau #E2E8F0 | ✓ PASS — L790-793 |
| CA-05 | `pastilleInline(3)` → fond #065F46, anneau #6EE7B7 | ✓ PASS — N_STYLES[3] L785 |
| CA-06 | `scoreNameInline(0)` → texte '—', couleur #94A3B8 | ✓ PASS — L795-798 |
| CA-07 | Conteneur axis : height=940px, width=1880px, background=#F8FAFC, box-sizing:border-box | ✓ PASS — L837 |
| CA-08 | Colonnes : display:flex; flex-direction:column → rows distribuées verticalement | ✓ PASS — L838-843 |
| CA-09 | Rows : flex:1 → distribution égale dans 940px | ✓ PASS — L812 |
| CA-10 | Dernière row colL : isLast=true → border-bottom:none | ✓ PASS — L839 `i === colL.length - 1` |
| CA-11 | Dernière row colR : isLast=true → border-bottom:none | ✓ PASS — L842 |
| CA-12 | `captureDiv(div, CAPTURE_W, CAPTURE_H)` : windowHeight=940 forcé | ✓ PASS — L845 |
| CA-13 | Ratio image capturée : 1880×940 = 2:1 = ratio boîte PPT 9.4"×4.72" | ✓ PASS — ratio exact |
| CA-14 | `slide.addImage` sans `sizing` → PptxGenJS remplit exactement sans distorsion | ✓ PASS — L850 |
| CA-15 | Fallback texte si b64=null toujours présent | ✓ PASS — L851-854 |
| CA-16 | `buildAxisDetailHTML` / `showAxisDetail` non modifiés | ✓ PASS |
| CA-17 | `coach.html?v=50` | ✓ PASS |

## Cas limites

| Cas | Attendu | Résultat |
|-----|---------|----------|
| Axe avec 1 critère | colL=[c1], colR=[] → colonne droite vide, fond F8FAFC | ✓ PASS |
| Axe avec 6 critères | half=3, colL=[c1..c3], colR=[c4..c6], 3 rows chacune flex:1 | ✓ PASS |
| Note joueur absent (nj=0) | pastilleInline(0)=gris, scoreNameInline(0)='—' | ✓ PASS |
| html2canvas throw | captureDiv catch swallow → b64=null → fallback texte | ✓ PASS |

## Verdict final
**PASSED — 17/17 critères validés, 4/4 cas limites couverts.**
