# Design — Export PowerPoint

> Agent : Designer | Date : 2026-06-30
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
