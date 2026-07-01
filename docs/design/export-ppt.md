# Design — Export PPT Coach
> Agent : Designer | Date : 2026-07-01 | Version cible : v50

---

## Problème identifié (v49)

Les slides de détail par axe (slides 3-10) présentent une distorsion verticale. Cause racine : le contenu HTML est capturé à **950px × ~250px** (ratio ≈ 3.8:1), puis placé sans `sizing` dans une boîte PPT de **9.4" × 4.72"** (ratio = 2:1). PptxGenJS étire l'image pour remplir exactement la boîte, comprimant les pixels verticalement d'un facteur ×1.9 → textes et pastilles apparaissent trop gros et déformés.

---

## Règle fondamentale

> L'image capturée doit avoir le même ratio que la boîte cible PPT.
>
> Boîte contenu : x:0.3, y:0.8, w:9.4, h:4.72 → ratio = 2:1
> Capture cible : 1880 × 940 px (scale 2 → canvas 3760 × 1880 en mémoire)

---

## Layout de la slide (toutes slides)

| Zone | Position | Dimensions | Couleur |
|------|----------|------------|---------|
| Bande gold | y=0, h=0.06" | w=10" | #C8A84B |
| Barre navy | y=0, h=0.72" | w=10" | #0A2463 |
| Titre | x=0.3, y=0.07 | w=7.8", fs=16, bold, white | — |
| Sous-titre | x=0.3, y=0.45 | w=7.8", fs=9, gold | — |
| Logo | x=9.05, y=0.1 | w=0.72", h=0.52" | dans barre navy |
| Zone contenu | x=0.3, y=0.8 | w=9.4", h=4.72" | fond slide F8FAFC |

---

## Slides 3-10 — Détail par axe (fix v50)

### Capture off-screen
- Dimensions : 1880 x 940 px (ratio 2:1 = boîte PPT)
- Background : #F8FAFC (identique fond slide)
- html2canvas : windowWidth:1880, windowHeight:940, backgroundColor:'#F8FAFC'

### Structure HTML de la capture

Conteneur : display:flex; height:940px; padding:16px; box-sizing:border-box; overflow:hidden; background:#F8FAFC

Deux colonnes flex (flex:1 chacune) avec border-right:2px solid #CBD5E1 sur la colonne gauche.

Chaque colonne : display:flex; flex-direction:column — les rows s'y distribuent via flex:1.

Chaque row (critère) :
  flex:1; display:flex; align-items:center; gap:12px; border-bottom:1px solid #E2E8F0; padding:8px 0
  (dernière row : pas de border-bottom)

Contenu d'une row :
  - Partie info (flex:1; min-width:0) :
    Label : font-size:13px; font-weight:700; color:#0A2463; margin-bottom:3px; line-height:1.2
    Texte : font-size:10px; color:#64748B; line-height:1.35
  - Partie scores (flex:0 0 210px; display:flex; gap:12px) :
    3 colonnes score (width:62px; display:flex; flex-direction:column; align-items:center; gap:3px)
    En-tête : font-size:9px; font-weight:600; color:#94A3B8; text-transform:uppercase; letter-spacing:.03em
    Pastille : width:28px; height:28px; border-radius:50%
    Label note : font-size:9px; font-weight:600; text-align:center; line-height:1.2

### Couleurs des pastilles (valeurs absolues, pas de CSS vars)

| Note | Fond | Anneau | Texte |
|------|------|--------|-------|
| n1 | #991B1B | #FBBFBF | #991B1B |
| n2 | #92400E | #FCD34D | #92400E |
| n3 | #065F46 | #6EE7B7 | #065F46 |
| n4 | #1E40AF | #93C5FD | #1E40AF |
| n5 | #5B21B6 | #C4B5FD | #5B21B6 |
| vide | #F1F5F9 | #E2E8F0 | #94A3B8 |

Pastille CSS : background:{fond}; box-shadow:0 0 0 2px {anneau}

---

## Placement image dans PptxGenJS (axis slides)

slide.addImage({ data:b64, x:0.3, y:0.8, w:9.4, h:4.72 })
Pas de sizing — image 2:1, boîte 2:1, pas de distorsion.

---

## captureDiv() — changements

Signature : captureDiv(div, width, height) — height optionnel, fallback div.scrollHeight
Background : '#F8FAFC' (remplace '#FFFFFF') pour toutes les captures axis

---

## Slides 1, 2, 11

Inchangées visuellement. sizing:contain conservé. Comportement déjà acceptable.
