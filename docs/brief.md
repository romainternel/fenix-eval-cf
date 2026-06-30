# Brief — Refonte export PPT par capture d'écran

> Agent : Analyst | Date : 2026-06-30

---

## 1. Contexte

L'export PPT (STORY-12) a été livré et utilise PptxGenJS pour reconstruire programmatiquement les slides : formes CSS, tableaux, textes dessinés via l'API JS. Le résultat est visuellement pauvre — les données sont présentes mais le rendu ne correspond pas à l'identité visuelle FENIX de l'application. L'interface web affiche déjà les bonnes informations avec le bon rendu (radars Chart.js, tableaux critères colorés, section entretien) — il faut capturer ces zones plutôt que les reconstruire.

## 2. Problème

Le coach ne peut pas exporter un PPT présentable. Le rendu généré par PptxGenJS (shapes, colW, rowH, couleurs hex manuelles) est différent du rendu HTML/CSS de l'application — les tableaux sont trop bruts, les typographies ne correspondent pas, l'ensemble ne reflète pas la qualité visuelle attendue pour un bilan de saison.

## 3. Utilisateurs

- **Coach FENIX CF** — consulte les résultats d'un joueur dans le dashboard coach sur PC/Mac
- **Contexte d'usage** : fin de session ou entretien individuel joueur, veut exporter rapidement un PPT pour une présentation
- **Appareil** : PC ou Mac (l'export PPT est un usage bureau, pas mobile)
- **Fréquence** : occasionnel (une fois par session d'évaluation par joueur)

## 4. Vision

Exporter un PPT dont chaque slide est une capture fidèle de ce que le coach voit dans l'application — sans reconstruction manuelle, sans perte de rendu visuel.

## 5. Scope

### Dedans
- Remplacement de la logique de génération programmatique dans `exportCoachPPT()` par des captures d'écran des zones DOM
- Slide 1 : radars Chart.js (canvas → `toDataURL()` directement, pas besoin de html2canvas)
- Slide 2 : tableau détail critères Attaque (DOM → html2canvas)
- Slide 3 : tableau détail critères Défense (DOM → html2canvas, absent si GB)
- Slide 4 : section compte-rendu entretien (DOM → html2canvas)
- Ajout de html2canvas via CDN dans `coach.html`
- En-têtes slides conservés (titre joueur + session) via PptxGenJS (texte propre sur fond navy/gold)

### Dehors
- Modification du rendu HTML des zones capturées (elles doivent être capturées telles quelles)
- Export multi-joueurs
- Slides supplémentaires
- Modification de `player-home.js`

## 6. Critères de succès

- Les slides affichent visuellement les mêmes données que ce que le coach voit à l'écran
- Le fichier `.pptx` s'ouvre correctement sur PowerPoint Windows et Mac
- Le coach ne voit pas de différence de qualité entre le rendu app et le rendu PPT
- L'export fonctionne sans erreur si une zone est absente ou vide

## 7. Questions en suspens

- **Zones DOM cibles** : les tableaux critères et la section CR ont-ils des IDs ou classes stables à capturer ? → À confirmer par l'Architect en lisant le code.
- **Scroll / hauteur** : si un tableau critères est plus haut que la slide, html2canvas capture-t-il tout ou seulement le viewport ? → À gérer dans l'Architect (option `windowWidth`, `scrollX/Y`).
- **Background CSS var()** : html2canvas peut avoir des problèmes avec les variables CSS — à anticiper avec `backgroundColor` explicite.
