# Design — Refonte export PPT v2

> Agent : Designer | Date : 2026-07-01

---

## Contexte

Le coach est sur la vue résultats d'un joueur dans `coach.html` (PC/Mac). Il clique sur "📊 PPT". Le fichier se télécharge. 5 slides.

---

## Slide 1 — Radars (fond blanc, vue app)

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ ████████████████████████████ BANDE GOLD (h=0.12") ████████████████████████████████ │
│ ████████████████████████████ FOND NAVY (h=1.2") ██████████████████████████████████ │
│  FENIX Eval CF                                                           [LOGO]    │
│  NomJoueur · Session                                                               │
├────────────────────────────────────────────────────────────────────────────────────┤
│  FOND BLANC                                                                        │
│                                                                                    │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │  [capture html2canvas du conteneur radar reconstruit :]                      │  │
│  │                                                                              │  │
│  │   ⚡ DC                            🛡 N°2                                   │  │
│  │  ┌────────────────────┐          ┌────────────────────┐                     │  │
│  │  │   radar att (img)  │          │   radar def (img)  │                     │  │
│  │  └────────────────────┘          └────────────────────┘                     │  │
│  │                                                                              │  │
│  │  ● Joueur (bleu)   ● Staff (orange)                                         │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
│                                                                      [logo bas]    │
└────────────────────────────────────────────────────────────────────────────────────┘
```

- Le conteneur de capture est un div off-screen généré en JS avec deux `<img>` (toDataURL), les titres profil au-dessus, la légende en bas
- Fond blanc `#FFFFFF`
- Cas GB : un seul radar centré

---

## Slide 2 — Résumé Att + Def (tableaux récap côte à côte)

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ BANDE GOLD │ FOND NAVY │ RÉSUMÉ                        NomJoueur · Session        │
├────────────────────────────────────────────────────────────────────────────────────┤
│  FOND BLANC                                                                        │
│                                                                                    │
│   ┌──────────────────────────────────┐   ┌──────────────────────────────────┐      │
│   │  [capture #pptCaptureAtt        │   │  [capture #pptCaptureDef         │      │
│   │   tableau récap Attaque]        │   │   tableau récap Défense]         │      │
│   │   THÈME | STAFF | JOUEUR | ÉCART│   │   THÈME | STAFF | JOUEUR | ÉCART │      │
│   └──────────────────────────────────┘   └──────────────────────────────────┘      │
│                                                                      [logo bas]    │
└────────────────────────────────────────────────────────────────────────────────────┘
```

- Deux captures positionnées côte à côte via `addImage` (x:0.2 et x:5.1)
- Cas GB : capture Att centrée seule (x:2.5)

---

## Slide 3 — Détail critères Attaque (4 cartes 2×2)

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ BANDE GOLD │ FOND NAVY │ ⚡ ATTAQUE                     NomJoueur · Session        │
├────────────────────────────────────────────────────────────────────────────────────┤
│  FOND BLANC                                                                        │
│  ┌───────────────────────┐    ┌───────────────────────┐                           │
│  │ LECTURE & ORGA        │    │ CRÉATION & ANIM        │                           │
│  │  Critère 1 …  J● S●  │    │  Critère 1 …  J● S●   │                           │
│  │  Critère 2 …  J● S●  │    │  Critère 2 …  J● S●   │                           │
│  │  …                    │    │  …                     │                           │
│  └───────────────────────┘    └───────────────────────┘                           │
│  ┌───────────────────────┐    ┌───────────────────────┐                           │
│  │ FINITION              │    │ SKILLS                 │                           │
│  │  Critère 1 …  J● S●  │    │  Critère 1 …  J● S●   │                           │
│  │  …                    │    │  …                     │                           │
│  └───────────────────────┘    └───────────────────────┘                           │
│                                                                      [logo bas]    │
└────────────────────────────────────────────────────────────────────────────────────┘
```

- 4 captures html2canvas, une par axe, grille 2×2
- Chaque capture = carte blanche avec titre axe, liste critères (label + texte court + pastilles)

---

## Slide 4 — Détail critères Défense (4 cartes 2×2, absente si GB)

Même structure que Slide 3 avec les axes Défense.

---

## Slide 5 — CR entretien (inchangé)

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ BANDE GOLD │ FOND NAVY │ 📋 COMPTE-RENDU D'ENTRETIEN   NomJoueur · Session        │
├────────────────────────────────────────────────────────────────────────────────────┤
│   [capture html2canvas #pptCaptureCR]                                              │
│   — ou si vide —                                                                   │
│   "Aucun compte-rendu saisi."                                                      │
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
