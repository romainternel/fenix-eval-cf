# Code Review — STORY-PPT-V57 — Fix centrage slides PPT + Skills overflow
> Agent : Code Reviewer | Date : 2026-07-01 | Verdict : **APPROUVÉ**

## Fichiers modifiés

| Fichier | Lignes modifiées |
|---------|-----------------|
| `pages/coach-dashboard.js` | 677, 684, 685, 850, 851 |
| `coach.html` | 55 (v=56 → v=57) |

## Fix 1 — Layout LAYOUT_WIDE → LAYOUT_16x9 (L677)

**Analyse** : LAYOUT_WIDE = 13.33"×7.5" ; tous les coords existants sont calibrés 0–10". Ce mismatch laissait 3.33" vides à droite de chaque slide. LAYOUT_16x9 = 10"×5.625" : correspondance exacte.

**Vérification des bornes post-changement :**

| Élément | x | w | Bord droit | Slide width |
|---------|---|---|-----------|-------------|
| Gold stripe | 0 | 10 | 10" | 10" ✓ |
| Navy bar | 0 | 10 | 10" | 10" ✓ |
| Logo | 9.05 | 0.72 | 9.77" | < 10" ✓ |
| Content slide 1&2 | 0.3 | 9.4 | 9.7" | < 10" ✓ |
| Content slides 3&4 | 0.1 | 9.8 | 9.9" | < 10" ✓ |

| Élément | y | h | Bord bas | Slide height |
|---------|---|---|---------|-------------|
| Content slides 1,2,5 | 0.8 | 4.72 | 5.52" | < 5.625" ✓ |
| Content slides 3&4 | 0.74 | 4.875 | **5.615"** | < 5.625" ✓ (marge 0.01") |

— Verdict : **sans observation bloquante**

## Fix 2 — align:'center' sur addHeader (L684-685)

PptxGenJS v3 supporte `align:'left'|'center'|'right'` sur `addText`. La box titre (x=0.3, w=8.3) va de 0.3" à 8.6" ; le logo est à x=9.05 — pas de chevauchement. Centrage visuel correct dans la barre navy.

— Verdict : **conforme**

## Fix 3 — Marge sécurité availH -40 (L850) et min rowH 26→24 (L851)

**Calculs vérifiés (ailier-att, 21 critères, 4 axes) :**
```
availH = 975 - 24 - 40 - 128 - 40 = 743px
rowH   = max(24, floor(743/21))    = 35px
showDesc = 35 ≥ 34                 → true
Contenu cellule (label 17 + desc 12 + margin 1 + padding 6) = 36px > rowH → expand à 36px
Table totale = 40 + 128 + 21×36   = 924px < 951px dispo ✓ (27px marge)
```

**Profil avec 28 critères :**
```
rowH   = max(24, floor(743/28)) = 26px
showDesc = 26 ≥ 34              → false
Contenu sans desc = 23px < 26px → cellules à 26px
Table = 40 + 128 + 28×26       = 896px < 951px ✓
```

**Profil extrême 35 critères :**
```
rowH   = max(24, floor(743/35)) = 24px (plancher)
showDesc = false
Table = 40 + 128 + 35×24       = 888px < 951px ✓
```

— Verdict : **robuste pour tous les profils connus**

## Conformité aux conventions CLAUDE.md

| Règle | Statut |
|-------|--------|
| Pas de commentaires superflus | ✓ |
| Pas d'abstraction hors scope | ✓ |
| Cache-busting v=57 dans coach.html | ✓ |
| escHtml() sur données utilisateur (inchangé) | ✓ |
| Pas de fichier hors scope touché | ✓ |

## Remarques

| Niveau | Remarque |
|--------|----------|
| Note | Slide 2 : ratio capture 940×472 = 1.9915 vs box 9.4×4.72 = 1.9915 — match quasi-parfait, stretch négligeable. `sizing:contain` serait plus robuste mais hors scope. |
| Note | Slides 3&4 : marge bord bas = 0.01" (5.615" vs 5.625"). Si PowerPoint arrondissait à 5.62", il n'y aurait pas de dépassement mais c'est très juste. Sans impact pratique. |

## Verdict

**APPROUVÉ** — aucune observation bloquante. Les 3 fixes sont correctement scoped, mathématiquement vérifiés, et conformes aux conventions du projet.
