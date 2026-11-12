# STORY-31 — Export PPT coach : slide Mental

**En tant que** coach,
**Je veux** une slide « Dimension mentale » dans l'export PPT quand la session l'inclut,
**Afin de** présenter le mental à l'entretien avec le même rapport que la technique.

## Contexte technique
- Zone : `pages/coach-dashboard.js` — `exportCoachPPT` (l.559). Export réservé au coach (aucun bouton côté joueur — décision existante).
- Slides existantes : détail ATT, détail DEF, radars par axe, axes & objectifs (natif), compte rendu (natif). PptxGenJS v3, html2canvas pour capturer les canvas.
- Réutiliser le canvas du radar Mental (STORY-29) pour la capture ; texte natif pour les écarts par axe.
- Charte : navy `#0A2463`, or `#C8A84B`, logo `assets/logo-transparent.jpeg`.

## Critères d'acceptation
- [ ] Session **mentale** : le PPT contient une slide « Dimension mentale » avec radar Joueur vs Staff et le tableau « Axe / Moi / Staff / Écart » (4 lignes).
- [ ] Session **sans mental** : PPT strictement identique à avant (même nombre de slides, même ordre).
- [ ] La slide ne s'affiche pas vide si le staff n'a pas noté : mention « Staff : en attente ».
- [ ] Le fichier s'ouvre dans PowerPoint sans réparation ; pas de texte tronqué.
- [ ] Aucun bouton d'export côté joueur n'est ajouté.
- [ ] `?v=` bumpé (`coach-dashboard.js`).

## Hors scope
Export PDF joueur, refonte des autres slides.

## Dépend de
- STORY-29.

## Taille
S
