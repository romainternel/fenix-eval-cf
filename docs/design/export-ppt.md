# Design — Refonte export PPT par capture d'écran

> Agent : Designer | Date : 2026-06-30 (refonte STORY-12)

---

## Contexte de capture

Le coach est sur la vue résultats d'un joueur dans `coach.html`. Cette vue contient déjà :
- Les deux canvas radar (`radarAtt`, `radarDef`) rendus par Chart.js
- Un tableau de détail critères par axe (Attaque / Défense)
- Une section compte-rendu entretien avec des champs texte

L'export PPT capture ces zones telles qu'elles apparaissent — pas de nouvelle UI à concevoir pour le contenu. Le design porte sur la **composition des slides** et le **feedback utilisateur** pendant l'export.

---

## Slide 1 — Couverture + Radars

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ ████████████████████████████ BANDE GOLD (0.12") ██████████████████████████████████ │
│ ████████████████████████████ FOND NAVY ███████████████████████████████████████████ │
│  FENIX Eval CF                                                            [LOGO]   │
│  NomJoueur · Session                                                               │
│                                                                                    │
│       ┌──────────────────────────┐        ┌──────────────────────────┐            │
│       │                          │        │                          │            │
│       │   [capture canvas ATT]   │        │   [capture canvas DEF]   │            │
│       │   toDataURL() direct     │        │   toDataURL() direct     │            │
│       │                          │        │                          │            │
│       └──────────────────────────┘        └──────────────────────────┘            │
│  ● Joueur (bleu)   ● Staff (orange)                              [logo discret]   │
│ ████████████████████ BANDE NAVY BAS ██████████████████████████████████████████████ │
└────────────────────────────────────────────────────────────────────────────────────┘
```
Cas GB : un seul canvas centré.

---

## Slide 2 — Tableau Attaque (ou GB)

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ BANDE GOLD │ FOND NAVY │ ⚡ ATTAQUE — AILIER ATT          NomJoueur · Session     │
├────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                    │
│   ┌────────────────────────────────────────────────────────────────────────────┐   │
│   │  [capture html2canvas du tableau critères Attaque — rendu CSS FENIX       │   │
│   │   avec colonnes Critère / Joueur / Staff et couleurs n1→n5 intactes]      │   │
│   └────────────────────────────────────────────────────────────────────────────┘   │
│                                                                      [logo]        │
└────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Slide 3 — Tableau Défense (absent si GB)

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ BANDE GOLD │ FOND NAVY │ 🛡 DÉFENSE — N1 DEF               NomJoueur · Session    │
├────────────────────────────────────────────────────────────────────────────────────┤
│   ┌────────────────────────────────────────────────────────────────────────────┐   │
│   │  [capture html2canvas du tableau critères Défense]                        │   │
│   └────────────────────────────────────────────────────────────────────────────┘   │
│                                                                      [logo]        │
└────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Slide 4 — Compte-rendu entretien

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ BANDE GOLD │ FOND NAVY │ 📋 COMPTE-RENDU D'ENTRETIEN       NomJoueur · Session    │
├────────────────────────────────────────────────────────────────────────────────────┤
│   ┌────────────────────────────────────────────────────────────────────────────┐   │
│   │  [capture html2canvas de la zone entretien (axes, objectifs CT/MT, CR)]  │   │
│   └────────────────────────────────────────────────────────────────────────────┘   │
│              — ou si zone vide —                                                   │
│              "Aucun compte-rendu saisi." (texte PptxGenJS)                        │
│                                                                      [logo]        │
└────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Feedback utilisateur

| État | Bouton | Toast |
|------|--------|-------|
| Repos | `📊 PPT` | — |
| Export en cours | `Génération… ⏳` (disabled) | "Génération du PPT…" |
| Succès | `📊 PPT` (réactivé) | "PPT exporté ✓" |
| Erreur | `📊 PPT` (réactivé) | "Erreur export : [détail]" |
| html2canvas absent | `📊 PPT` | "Librairie de capture non chargée" |
| Joueur non chargé | `📊 PPT` | "Ouvrez d'abord la vue résultats d'un joueur" |
| Zone DOM absente | slide "Données non disponibles", export continue | — |

---

## Zones à capturer

| Slide | Contenu | Sélecteur | Méthode |
|-------|---------|-----------|---------|
| S1 | Radar Att | `#radarAtt` (canvas) | `canvas.toDataURL()` |
| S1 | Radar Def | `#radarDef` (canvas) | `canvas.toDataURL()` |
| S2 | Tableau critères Att | À identifier par Architect | `html2canvas(el)` |
| S3 | Tableau critères Def | À identifier par Architect | `html2canvas(el)` |
| S4 | Section entretien | À identifier par Architect | `html2canvas(el)` |
> Source : docs/prd.md

---

## Contexte d'usage

Le coach est sur PC. Il a ouvert la vue résultats d'un joueur. Il voit les radars et les tableaux. Il clique sur "📊 PPT" en haut de la section résultats. Le fichier se télécharge automatiquement. Il n'y a pas d'écran de configuration intermédiaire.

---

## 1. Bouton PPT dans l'interface web

Le bouton existant dans la vue résultats :

```
┌──────────────────────────────────────────────────────────┐
│  RÉSULTATS — ROMAIN TERNEL · JANVIER 2027                │
│                                              [📊 PPT]    │
│                                                          │
│  ┌──── Radar Att ────┐    ┌──── Radar Def ────┐          │
│  │                   │    │                   │          │
│  └───────────────────┘    └───────────────────┘          │
└──────────────────────────────────────────────────────────┘
```

- Classe : `.btn .btn-ghost .btn-sm` (cohérent avec le bouton PDF existant)
- Libellé : `📊 PPT`
- Position : même ligne que le titre de section résultats
- État pendant génération : bouton désactivé, texte "Génération…"

---

## 2. Slide 1 — Vue d'ensemble (16:9 paysage)

```
┌─────────────────────────────────────────────────────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ ← bande gold h=0.8cm
│  FENIX Eval CF                                                      │ ← blanc bold 24pt
│  ROMAIN TERNEL  ·  JANVIER 2027                                     │ ← gold 14pt
│                                                                     │
│   ┌─────────────────────┐      ┌─────────────────────┐             │
│   │                     │      │                     │             │
│   │   RADAR ATTAQUE     │      │   RADAR DÉFENSE     │             │
│   │    (canvas png)     │      │    (canvas png)     │             │
│   │                     │      │                     │             │
│   └─────────────────────┘      └─────────────────────┘             │
│                                                                     │
│   ● Joueur (bleu)   ● Staff (orange)               [LOGO FENIX]    │
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ ← bande navy bas h=0.4cm
└─────────────────────────────────────────────────────────────────────┘
  Fond : navy #0A2463 (toute la slide)
```

---

## 3. Slides 2 & 3 — Détail critères (même layout)

```
┌─────────────────────────────────────────────────────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ ← bande navy h=1.6cm
│  ⚡ ATTAQUE — DC ARRIÈRE CENTRE                                      │ ← blanc bold 18pt
│  Nom Joueur · Session                                               │ ← gold 10pt
├─────────────────────────────────────────────────────────────────────┤
│  Fond blanc                                                         │
│                                                                     │
│  ── LECTURE & ORGANISATION ──────────────────────────────────────── │
│  ┌──────────────────────────────────┬────────────┬────────────┐     │
│  │ Critère                          │  Joueur    │   Staff    │     │
│  ├──────────────────────────────────┼────────────┼────────────┤     │
│  │ Orientation des appuis           │ ████ 4     │ ███ 3      │     │
│  │ Placement défensif               │ ██ 2       │ ███ 3      │     │
│  └──────────────────────────────────┴────────────┴────────────┘     │
│                                                                     │
│  ── FINITION ─────────────────────────────────────────────────────  │
│  ┌──────────────────────────────────┬────────────┬────────────┐     │
│  │ ...                              │ ...        │ ...        │     │
│  └──────────────────────────────────┴────────────┴────────────┘     │
│                                                           [LOGO]    │
└─────────────────────────────────────────────────────────────────────┘
  Cellule note : fond coloré n1-n5, texte blanc (n1/n2) ou noir (n3-n5)
  Note vide : fond gris #e2e8f0, texte "—"
```

---

## 4. Slide 4 — Compte-rendu entretien

```
┌─────────────────────────────────────────────────────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ ← bande navy
│  📋 COMPTE-RENDU D'ENTRETIEN                                        │ ← blanc bold 18pt
│  Nom Joueur · Session                                               │ ← gold 10pt
├─────────────────────────────────────────────────────────────────────┤
│  Fond blanc. 2 colonnes pour économiser l'espace vertical.          │
│                                                                     │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐  │
│  │ ✦ POINTS FORTS              │  │ ✦ OBJECTIF COURT TERME      │  │
│  │ [texte libre]               │  │ [texte libre]               │  │
│  ├─────────────────────────────┤  ├─────────────────────────────┤  │
│  │ ✦ AXES PRIORITAIRES         │  │ ✦ OBJECTIF MOYEN TERME      │  │
│  │ [texte libre]               │  │ [texte libre]               │  │
│  └─────────────────────────────┘  └─────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ 📝 COMPTE-RENDU ENTRETIEN                                   │    │
│  │ [texte libre long]                                          │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                           [LOGO]    │
└─────────────────────────────────────────────────────────────────────┘
  Sections vides : omises. Si aucune section : message "Aucun CR saisi."
```

---

## 5. Interactions

| Action | Comportement |
|--------|-------------|
| Clic "📊 PPT" | Bouton disabled + texte "Génération…" → génération → download → bouton réactivé |
| Erreur librairie | Toast "PptxGenJS non disponible" |
| Radars non rendus | Guard → toast "Veuillez d'abord afficher les résultats" |
| CR vide | Slide 4 générée avec message "Aucun compte-rendu saisi" |

---

## 6. Composants réutilisés

- Bouton `.btn.btn-ghost.btn-sm` — existant
- `showToast()` — existant dans app.js
- `gid()` — existant dans coach-dashboard.js
- `CRITERIA[profilId]` — données statiques existantes
- `_coachEvalMap` — map des évaluations déjà chargée
