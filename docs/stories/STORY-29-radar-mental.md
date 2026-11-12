# STORY-29 — Radar Mental joueur vs staff (coach et joueur)

**En tant que** coach (puis joueur, après partage),
**Je veux** voir un radar Mental « Joueur vs Staff » avec le détail par axe,
**Afin de** repérer les écarts de perception sur l'état d'esprit.

## Contexte technique
- Zones : `pages/coach-dashboard.js` — `showCoachRadar` (l.1224), `buildSessionRadar` (l.~1285, déjà paramétré par `profilId`), `showAxisDetail` (l.1210), `buildAxisDetailHTML`, `_axesBtns`, `cRecapTableHTML` (l.1128) ; `pages/player-home.js` — `showPlayerRadar` (l.850), `showPlayerAxisDetail` (l.1059), `pAxesBtns`, `pRecapTableHTML`.
- Spéc : `docs/design/dimension-mentale.md` §6 ; `docs/visual/dimension-mentale.md` §6-7 ; risques R12 et edge case n°6.
- Réutiliser `buildSessionRadar(canvasId, 'mental')` ; ne **pas** dupliquer la logique. Ajouter `_pChartMental` / `_cChartMental` et les `destroy()` correspondants au début des fonctions.
- Le radar Mental n'est construit que si la session `inclut_mental === true`.
- Visibilité joueur : `resultats_visibles` existant (un seul bouton de partage).

## Critères d'acceptation
- [ ] Coach : sur une session mentale, une 3e carte « 🧠 Mental » (bordure gauche or) avec radar 4 axes (Compétition, Travail, Groupe, Projet de vie), séries Joueur (bleu) et Staff (orange), échelle 0-5.
- [ ] Sous le radar : 4 lignes « Axe · Moi X,X · Staff X,X · écart ±X,X » (signe toujours affiché ; pastille grise ≤ 0,5 / or > 0,5 / rouge > 1,0).
- [ ] Clic sur un axe (étiquette ou ligne) → détail par critère avec pastilles Joueur | Staff, comme pour ATT/DEF.
- [ ] Récapitulatif (`cRecapTableHTML` / `pRecapTableHTML`) inclut le profil Mental quand la session le contient.
- [ ] Joueur : radar Mental visible **uniquement** si `resultats_visibles = true` pour la session ; sinon absent.
- [ ] Si le staff n'a pas encore noté le mental : message « Staff : en attente » (ou équivalent) au lieu d'un radar staff plat à 0.
- [ ] Session **sans** mental : aucune carte Mental, mise en page identique à aujourd'hui (champ et gardien).
- [ ] Mise en page : cartes empilées sur mobile ; ≥ 900 px ATT+DEF côte à côte et Mental en dessous, pleine largeur (ou 3 colonnes si la largeur le permet) sans radar écrasé.
- [ ] Aucune fuite mémoire : relancer l'ouverture du radar plusieurs fois ne laisse pas de `Chart` orphelin (destroy appelé).
- [ ] `?v=` bumpés.

## Hors scope
Superposition de plusieurs sessions et tableau de progression (STORY-30). PPT (STORY-31).

## Dépend de
- STORY-27, STORY-28 (données notées pour tester).

## Taille
M
