# STORY-30 — Comparaison du mental entre sessions (bilan, bar chart, progression)

**En tant que** coach ou joueur,
**Je veux** comparer le mental d'une évaluation à l'autre (année N vs N-1),
**Afin de** voir l'évolution de l'état d'esprit dans le temps.

## Contexte technique
- Zones : `coach-dashboard.js` — `_axesData` (l.309), `cRenderBilan` (l.321), `cToggleSession` (l.355), `cRenderBarChart` (l.383), `cRenderTrendTable` (l.506) ; `player-home.js` — `pAxesData` (l.492), `pRenderBilan` (l.513), `pToggleSession` (l.547), `pRenderBarChart` (l.575), `pRenderTrendTable` (l.830).
- Spéc : `docs/design/dimension-mentale.md` §7 ; risque R8.
- Les sessions superposables pour le mental = celles avec `inclut_mental === true` **et** au moins une note mentale. Les autres sont ignorées pour cette carte (pas de zéro, pas de `NaN`).

## Critères d'acceptation
- [ ] Bilan : la carte Mental superpose uniquement les sessions mentales sélectionnées (max. comme aujourd'hui).
- [ ] Avec **une seule** session mentale : pas de comparaison, texte « Comparaison disponible à la prochaine évaluation mentale. » ; aucun message d'erreur, aucun graphique vide.
- [ ] Avec **deux** sessions mentales : les deux séries apparaissent avec les couleurs de session existantes (`_P_SESSION_COLORS` / équivalent coach) et la légende du bilan reste cohérente.
- [ ] Bar chart : barres Mental présentes pour les sessions mentales ; aucune barre fantôme pour les autres.
- [ ] Tableau de progression : lignes Mental ajoutées ; cellule « — » pour une session sans mental ; aucune moyenne à 0 ou `NaN`.
- [ ] Sélection de sessions sans aucune session mentale : bilan technique **identique** à avant, aucune carte Mental.
- [ ] Mode « joueur / staff / écart » du sélecteur de vue fonctionne aussi pour le mental.
- [ ] Côté joueur : seules les sessions dont les résultats sont partagés (`resultats_visibles`) sont comparées (règle existante conservée).
- [ ] `?v=` bumpés.

## Hors scope
Radar d'une seule session (STORY-29), PPT.

## Dépend de
- STORY-29.

## Taille
M
