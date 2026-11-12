# Design — Dimension mentale

> Agent : Designer · 2026-11-12 · Source : `docs/prd.md`
> Appareil principal : **mobile portrait** (joueur), **iPad/desktop** (coach). Tout est un prolongement de composants existants : peu de nouveau.

---

## 1. Coach — Création de session (F2)

```
┌─────────────────────────────────────┐
│ Nouvelle session                  ✕ │
├─────────────────────────────────────┤
│ Nom de la session *                 │
│ [Évaluation — Novembre 2026      ]  │
│ Date *                              │
│ [2026-11-12                      ]  │
│ Saison                              │
│ [2026-2027 (grisé)               ]  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ☐ 🧠 Inclure la dimension       │ │
│ │      mentale                    │ │
│ │ 16 critères en plus. À faire    │ │
│ │ une fois par an.                │ │
│ └─────────────────────────────────┘ │
│ Un identifiant sera généré…         │
│        [Annuler]   [Créer]          │
└─────────────────────────────────────┘
```
- Case dans un bloc cliquable sur toute la largeur (zone ≥ 44 px de haut). Décochée par défaut.
- Le libellé d'aide reste visible (pas de tooltip : mobile).

## 2. Cartes de session (coach + joueur) (F2)

```
┌─────────────────────────────────────┐
│ [OUVERT] [🧠 MENTAL]      12 nov.   │
│ Évaluation — Novembre 2026          │
│ EVAL-2026-NOV-01                    │
└─────────────────────────────────────┘
```
- Badge « 🧠 MENTAL » à côté du badge de statut, seulement si `inclut_mental`.

## 3. Coach — Détail de session (F6)

```
│ Dimension mentale     [ ● Activée  ]│
│ 16 critères en plus pour chaque     │
│ joueur.                             │
```
- Interrupteur dans la carte d'infos de session.
- Désactivation impossible si des notes mentales existent → toast : « Des notes mentales existent déjà, impossible de désactiver. »
- Session fermée : interrupteur désactivé (lecture seule).

## 4. Joueur — Évaluation (F3)

### Joueur de champ
```
┌─────────────────────────────────────┐
│ ← Sessions                          │
│ ┌────────┐ ┌────────┐ ┌──────────┐ │
│ │⚡ Atta │ │🛡 Défe │ │🧠 Mental │ │
│ │  3/18  │ │  0/16  │ │   0/16   │ │
│ └────────┘ └────────┘ └──────────┘ │
│ ‹ Compétition | Travail | Groupe | Projet ›
│                                     │
│ Gestion du stress et de la pression │
│ en match                            │
│ « Le contexte du match n'affecte    │
│   pas mes performances… »           │
│   ( )  ( )  ( )  ( )  ( )           │
│ …                                   │
│ [← Précédent]  1/4  [Suivant →]     │
└─────────────────────────────────────┘
```
- 3 onglets sur la largeur (chacun ≈ 1/3). Sur écran étroit (< 360 px) : libellés courts « ⚡ ATT », « 🛡 DEF », « 🧠 Mental ».
- **Gardien** : 2 onglets « 🧤 Gardien » + « 🧠 Mental » (aujourd'hui pas d'onglets pour le GB → ajout de la barre d'onglets **uniquement** quand la session inclut le mental).
- **Session sans mental** : barre d'onglets inchangée (ATT/DEF, ou rien pour le GB).
- Fin de profil : toast « Défense terminée ! Passe au Mental. » puis bascule auto vers l'onglet Mental ; à la fin du Mental : « Évaluation envoyée ! ».
- Alerte « critères oubliés » : identique, listant les axes mentaux manquants.
- Intro : ajouter une ligne « Cette session inclut aussi ton état d'esprit (mental). » sur l'écran « Comment te noter ? » si la session inclut le mental.

### Liste des sessions (joueur)
```
│ [OUVERT] [🧠 MENTAL]      12 nov.   │
│ Évaluation — Novembre 2026          │
│ ▓▓▓▓▓▓▓░░░░░░░░░                    │
│ 21 / 53 critères        Modifier →  │
```
- Le total affiché est celui de **la session** (ex. 37 technique + 16 mental = 53).

## 5. Coach — Notation staff (F4)

```
│ ┌────────┐ ┌────────┐ ┌──────────┐ │
│ │⚡ ATT  │ │🛡 DEF  │ │🧠 Mental │ │
│ Compétition | Travail | Groupe | Projet
│ Gestion du stress…                  │
│ Joueur : ( ) ( ) (●) ( ) ( )  lecture
│ Staff  : ( ) ( ) ( ) ( ) ( )  cliquable
```
- Même écran que l'actuel, un onglet de plus quand la session inclut le mental. Joueur sans profil technique (aucun ATT/DEF) : seul l'onglet Mental est affiché.
- Liste joueurs de la session : barres Joueur/Staff avec le total de la session ; texte « X/total ».

## 6. Résultats — radar Mental (F5)

```
┌─────────────────────────────────────┐
│ ⚡ Attaque                          │
│      [radar ATT]                    │
├─────────────────────────────────────┤
│ 🛡 Défense                          │
│      [radar DEF]                    │
├─────────────────────────────────────┤
│ 🧠 Mental                           │
│  Compétition                        │
│ Projet   ◆   Travail    [radar 4 axes]
│   Groupe                            │
│  ● Moi   ● Staff                    │
└─────────────────────────────────────┘
```
- 4 axes seulement : radar en **losange** ; lisible, mais rappeler les valeurs en chiffres sous le radar : une ligne par axe « Compétition  Moi 3,5 · Staff 4,0 · écart +0,5 » (4 lignes) pour compenser la faible lisibilité d'un radar à 4 pointes.
- Clic sur un axe (étiquette ou ligne) → panneau de détail par critère, pastilles Joueur | Staff (composant `showAxisDetail` / `showPlayerAxisDetail` existant).
- Disposition : desktop/iPad = 3 cartes côte à côte (1fr 1fr 1fr, ou ATT+DEF puis Mental pleine largeur sous 900 px) ; mobile = empilées.
- **Session sans mental** : cette carte n'existe pas (aucun trou, aucun « 0 »).

## 7. Comparaison inter-sessions (F7)

- Les puces de sessions du bilan restent communes. Pour la carte Mental, seules les sessions `inclut_mental` sont superposées.
- Une seule session mentale :
  « Comparaison disponible à la prochaine évaluation mentale. » (texte gris sous le radar, pas d'erreur).
- Tableau de progression par thème : ligne(s) Mental ajoutée(s) ; cellule « — » pour les sessions sans mental.

## 8. États

| Écran | Chargement | Vide | Erreur |
|---|---|---|---|
| Onglet Mental joueur | spinner existant | — (critères statiques) | toast ✗ sur échec de sauvegarde (existant) |
| Radar Mental | spinner global existant | « Pas encore de notes mentales. » (coach) / absent (joueur) | message existant |
| Interrupteur mental | bouton désactivé pendant l'écriture | — | toast d'erreur + retour à l'état précédent |

## 9. Composants réutilisés vs nouveaux

| Réutilisé | Nouveau |
|---|---|
| `renderAxesTabs`, `showAxeCriteres`, `tapRating`, `saveRating`, `terminerProfil` | Onglet « Mental » dans les barres `.profil-tab` |
| `buildSessionRadar`, `showAxisDetail`, `pLevelFromAvg` | Bloc de 4 lignes « Moi / Staff / écart » sous le radar mental |
| `.session-badge-*`, `.modal-*`, `.form-group` | Case à cocher en bloc (`.mental-option`), badge `.badge-mental`, interrupteur dans le détail de session |
| Légende pastilles n1-n5 | Couleur d'identité « mental » (voir `docs/visual/dimension-mentale.md`) |
