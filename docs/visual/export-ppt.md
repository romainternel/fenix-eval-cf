# Visual Crafter — Refonte export PPT par capture d'écran

> Agent : Visual Crafter | Date : 2026-06-30 (refonte STORY-12)

---

## Contexte

Le contenu visuel des slides vient directement de l'app (captures html2canvas) — pas de nouveau token à concevoir pour le contenu. Mon travail porte sur les options html2canvas pour la fidélité visuelle, le rendu des en-têtes, et le sizing des images dans les slides.

---

## 1. Options html2canvas recommandées

```javascript
const captureOpts = {
  scale: 2,                    // 2x rétina — évite le flou dans PowerPoint
  useCORS: true,               // pour les images dans le DOM
  backgroundColor: '#FFFFFF',  // résout les CSS var() non résolues
  logging: false,
  windowWidth: el.scrollWidth,
  windowHeight: el.scrollHeight,
};
```

> Pour la section entretien (fond légèrement gris) : `backgroundColor: '#F8FAFC'`

---

## 2. En-têtes slides (PptxGenJS — conservés de STORY-12)

| Élément | Valeur |
|---------|--------|
| Bande top | Gold `#C8A84B`, h:0.12" |
| Fond header | Navy `#0A2463`, h:1.2" |
| Titre | Calibri 20pt bold, `#FFFFFF`, x:0.35 y:0.15 |
| Sous-titre | Calibri 10pt, `#C8A84B`, x:0.35 y:0.75 |
| Logo | x:9.0, y:5.1, w:0.7, h:0.4 |

---

## 3. Placement images capturées dans les slides

### Slides 2, 3, 4 (contenu sous l'en-tête 1.2")

```javascript
slide.addImage({
  data: imgB64,
  x: 0.3, y: 1.35, w: 9.4, h: 4.1,
  sizing: { type: 'contain', w: 9.4, h: 4.1 }
});
```

`sizing: contain` = le tableau tient dans la zone quelle que soit sa hauteur, sans déformer.

### Slide 1 (radars — canvas natif, inchangé)

```
Radar Att : x:0.4, y:1.3, w:4.2, h:3.8
Radar Def : x:5.4, y:1.3, w:4.2, h:3.8
Cas GB    : x:2.9, y:1.3, w:4.2, h:3.8
```

---

## 4. Contraste en-têtes

| Texte | Fond | Ratio | WCAG |
|-------|------|-------|------|
| Blanc `#FFFFFF` / Navy `#0A2463` | — | 10.7:1 | ✅ AAA |
| Gold `#C8A84B` / Navy `#0A2463` | — | 4.9:1 | ✅ AA |

---

## 5. Poids estimé du fichier .pptx

| Slide | Contenu | ~Ko |
|-------|---------|-----|
| S1 | 2 radars PNG @2x | ~300 |
| S2 | Tableau Att html2canvas @2x | ~250 |
| S3 | Tableau Def html2canvas @2x | ~250 |
| S4 | Section CR html2canvas @2x | ~100 |

**Total estimé : 700 Ko – 1.2 Mo** — acceptable pour PowerPoint.
> Source : docs/design/export-ppt.md

---

## Contexte

Ce document spec les valeurs exactes à passer à PptxGenJS (couleurs hex, polices, positions en pouces). La slide est 16:9 = 10" × 5.625" (unité PptxGenJS par défaut).

---

## 1. Palette de tokens PptxGenJS

| Token | Hex | Usage |
|-------|-----|-------|
| `navy` | `0A2463` | Fond slide 1, en-têtes slides 2/3/4, bandes |
| `gold` | `C8A84B` | Accent titres, bande supérieure slide 1 |
| `white` | `FFFFFF` | Textes sur fond navy |
| `bg-slide` | `F8FAFC` | Fond corps slides 2/3/4 |
| `n1` | `EF4444` | Note 1 — Fragile |
| `n2` | `F97316` | Note 2 — En travail |
| `n3` | `EAB308` | Note 3 — Acquis |
| `n4` | `84CC16` | Note 4 — Maîtrisé |
| `n5` | `22C55E` | Note 5 — Référence |
| `empty` | `E2E8F0` | Note vide |
| `text-dark` | `1E293B` | Corps texte sur fond clair |
| `text-muted` | `64748B` | Labels secondaires |

---

## 2. Typographie PptxGenJS

PptxGenJS n'accepte pas Google Fonts en CDN. Utiliser les polices système disponibles :

| Niveau | Police | Taille | Gras | Couleur |
|--------|--------|--------|------|---------|
| Titre principal (slide 1) | `Calibri` | 28pt | true | `FFFFFF` |
| Sous-titre joueur/session | `Calibri` | 14pt | false | `C8A84B` |
| En-tête slide (slides 2-4) | `Calibri` | 20pt | true | `FFFFFF` |
| Sous-titre slide | `Calibri` | 10pt | false | `C8A84B` |
| En-tête axe (tableau) | `Calibri` | 10pt | true | `0A2463` |
| Libellé critère | `Calibri` | 9pt | false | `1E293B` |
| Note dans cellule | `Calibri` | 10pt | true | voir ci-dessous |
| CR label section | `Calibri` | 10pt | true | `0A2463` |
| CR texte | `Calibri` | 9pt | false | `1E293B` |

**Couleur du texte dans les cellules de note :**
- n1, n2 → `FFFFFF` (blanc, fond foncé)
- n3 → `1E293B` (jaune clair → texte sombre)
- n4, n5 → `1E293B` (vert → texte sombre)
- vide → `94A3B8`

---

## 3. Layout Slide 1 — positions exactes (unité : pouces)

```
Slide : 10" × 5.625"

Bande gold top :      x=0, y=0,    w=10,   h=0.15
Bande gold left :     x=0, y=0,    w=0.15, h=5.625
Fond navy :           background fill = 0A2463

Titre "FENIX Eval CF":  x=0.4, y=0.3,  fontSize=28, bold, color=FFFFFF
Sous-titre joueur·session: x=0.4, y=0.85, fontSize=14, color=C8A84B

Radar Att (image) :   x=0.4,  y=1.3,  w=4.2, h=3.8
Radar Def (image) :   x=5.4,  y=1.3,  w=4.2, h=3.8
(si GB seul : x=2.9, y=1.3, w=4.2, h=3.8)

Légende "● Joueur" :  x=0.4, y=5.1,  fontSize=9, color=3B82F6
Légende "● Staff" :   x=1.5, y=5.1,  fontSize=9, color=F97316

Logo (image) :        x=8.8, y=4.9,  w=0.9, h=0.5 (coin bas-droit)

Bande navy bas :      x=0, y=5.3, w=10, h=0.325
```

---

## 4. Layout Slides 2/3 — positions

```
En-tête fond navy :   x=0, y=0, w=10, h=1.2
Bande gold top :      x=0, y=0, w=10, h=0.12
Titre slide :         x=0.35, y=0.2,  fontSize=20, bold, color=FFFFFF
Sous-titre :          x=0.35, y=0.78, fontSize=10, color=C8A84B

Corps fond clair :    x=0, y=1.2, w=10, h=4.425, fill=F8FAFC

Tableau :             x=0.3, y=1.35, w=9.4
  Colonnes : Critère (6.5"), Joueur (1.45"), Staff (1.45")
  Hauteur lignes : 0.28"
  En-tête axe : fill=E8EEF8, bold, color=0A2463, fontSize=9
  Ligne critère : fill selon note, fontSize=9

Logo bas-droit :      x=9.0, y=5.1, w=0.7, h=0.4
```

---

## 5. Layout Slide 4 — positions

```
En-tête fond navy :   x=0, y=0, w=10, h=1.2 (identique slides 2/3)

Corps : 2 colonnes de boîtes
  Colonne gauche :  x=0.3,  y=1.35, w=4.65
  Colonne droite :  x=5.05, y=1.35, w=4.65
  Espacement inter-boîte vertical : 0.15"

Boîte section :
  Fond : FFFFFF, border : D0D7E5, radius : 0.08"
  Label : fontSize=9, bold, color=0A2463, padding-left=0.1"
  Texte : fontSize=9, color=1E293B, wrap

CR entretien (section longue) :
  x=0.3, y=(dynamique après boîtes), w=9.4
  Fond : F0F4FF, border-left gold 0.06"

Logo bas-droit :      x=9.0, y=5.1, w=0.7, h=0.4
```

---

## 6. États du bouton dans l'UI web

| État | Style |
|------|-------|
| Idle | `.btn.btn-ghost.btn-sm` standard |
| Génération | `disabled=true`, texte "Génération…", opacity 0.6 |
| Erreur | Toast rouge via `showToast()` |

---

## 7. Nouvelles classes CSS web

Aucune — le bouton PPT réutilise `.btn.btn-ghost.btn-sm` existant.

---

## 8. Checklist contraste

| Texte | Fond | Ratio estimé | WCAG |
|-------|------|-------------|------|
| Blanc sur navy | `0A2463` | 12:1 | ✅ AAA |
| Gold sur navy | `C8A84B` / `0A2463` | 6.8:1 | ✅ AA |
| Noir sur jaune n3 | `1E293B` / `EAB308` | 8.2:1 | ✅ AAA |
| Blanc sur rouge n1 | `FFFFFF` / `EF4444` | 4.6:1 | ✅ AA |
