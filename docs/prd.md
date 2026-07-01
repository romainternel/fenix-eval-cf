# PRD — Bilan d'entretien joueur + simplification exports

> Agent : Product Manager | Date : 2026-07-01

---

## Objectif

Donner au joueur une fiche de bilan lisible dans son app (niveaux par axe + objectifs) et simplifier les exports coach à un seul PPT de 3 slides.

---

## Features — Must Have

### F1 — Carte bilan joueur in-app

Nouvelle section dans la vue résultats joueur (`pages/player-home.js`), affichée uniquement si le CR est partagé (`visible_joueur = true`).

**Contenu** :
- Titre "📋 BILAN D'ENTRETIEN" + date de mise à jour du CR
- Pour chaque profil (ATT et DEF, ou GB) : tableau axes avec 3 colonnes :
  - Axe (label)
  - Mon niveau (level pill coloré — basé sur la moyenne des notes_joueur du critère arrondie)
  - Niveau Coach (level pill coloré — basé sur notes_staff)
- Axes prioritaires (texte libre depuis cr.axes_att / cr.axes_def)
- Objectif court terme (cr.objectifs_ct)
- Objectif moyen terme (cr.objectifs_mt)

**Données** : tout est déjà chargé en mémoire (`_pEvalMap`, `_pCrData`, `CRITERIA`). Aucun appel réseau supplémentaire.

**Critères d'acceptation** :
- Carte absente si `visible_joueur = false` ou si le CR n'existe pas
- Les 5 niveaux (Fragile/En travail/Acquis/Maîtrisé/Référence) s'affichent avec leurs couleurs (même palette que le PPT coach)
- Les 3 sections (axes prioritaires, obj CT, obj MT) ne s'affichent que si le champ n'est pas vide
- Profil GB : un seul tableau (pas de section DEF)

---

### F2 — PPT coach simplifié : 3 slides

Refonte de `exportCoachPPT()` dans `pages/coach-dashboard.js`.

**Structure cible** :
- Slide 1 : Radar (inchangé — existant)
- Slide 2 : Critères détail Attaque (inchangé — existant, fix v59)
- Slide 3 : Critères détail Défense (inchangé — existant, fix v59, absent si GB)

**Suppressions** :
- Slide 2 actuelle (résumé par axe avec pills côte à côte) → retirée
- Slide 5 actuelle (capture CR entretien) → retirée
- La numérotation devient : radar=1, att=2, def=3

**Critères d'acceptation** :
- Le fichier PPTX généré contient exactement 3 slides (2 si GB)
- Toujours < 15 secondes de génération
- Les slides 1-3 sont visuellement identiques à v59

---

### F3 — Suppression exports inutiles

**`exportProgressionPPT()`** :
- Retirer la fonction de `coach-dashboard.js`
- Retirer le bouton `📈 PPT Prog.` de la toolbar résultats

**`exportCoachPDF()`** :
- Retirer la fonction de `coach-dashboard.js`
- Retirer le bouton correspondant (s'il existe dans la toolbar)

**`jsPDF` CDN** :
- Retirer la ligne `<script jspdf>` de `coach.html`

**Critères d'acceptation** :
- La toolbar résultats coach ne montre qu'un seul bouton export : `📊 PPT`
- Aucune erreur console liée aux fonctions supprimées
- `coach.html` n'inclut plus `jspdf`

---

## Should Have

*(Aucun dans cette itération — scope volontairement resserré)*

---

## Hors scope

- Envoi email de la fiche bilan au joueur
- Bilan multi-sessions dans la fiche bilan joueur
- Refonte graphique de `pRecapTableHTML` (conservé tel quel)
- Nouveau champ DB
- Modification de `fenix.css`, `index.html`, `player.html` CDN

---

## Priorité de livraison

| # | Story | Priorité | Taille |
|---|-------|----------|--------|
| STORY-15 | Bilan joueur in-app | P0 | M |
| STORY-16 | PPT coach 3 slides | P1 | S |
| STORY-17 | Cleanup exports | P1 | S |

STORY-16 et STORY-17 peuvent être livrées dans n'importe quel ordre entre elles.

---

## Dépendances

- `comptes_rendus` table et données : disponibles (existant)
- `_pEvalMap`, `_pCrData`, `CRITERIA` : globaux déjà chargés dans la vue résultats joueur
- `exportCoachPPT()` v59 : base pour STORY-16 (retrait slides 2 et 5)

---

## Risques PM

- Si la fiche bilan joueur est trop similaire au `pRecapTableHTML` existant → confusion. Solution : design clairement différent (level labels vs chiffres) et positionnement après la carte CR
- Si la suppression du PDF déclenche des erreurs parce qu'un bouton PDF est référencé ailleurs → vérifier toutes les occurrences avant suppression
