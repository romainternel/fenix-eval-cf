# PRD — Dimension mentale (optionnelle par session)

> Agent : Product Manager · 2026-11-12
> Source : `docs/brief.md`

---

## Objectif

Permettre au coach d'ajouter, session par session, une évaluation **mentale** (16 critères, 4 axes) notée par le joueur et le staff, avec le même parcours de notation et le même rendu « radar joueur vs staff » que la dimension technique. Usage attendu : **une session par an**.

## Principe produit

Le mental est un **profil de plus** (`mental`) dans le référentiel de critères, stocké dans la table `evaluations` existante (`profil_id = 'mental'`). Il est activé **par session** via un indicateur `sessions.inclut_mental`. Aucune nouvelle table.

## Priorités

| # | Feature | Priorité |
|---|---|---|
| F1 | Référentiel mental (16 critères) + totaux calculés par session | **Must** |
| F2 | Case « Inclure la dimension mentale » à la création de session + badge | **Must** |
| F3 | Joueur : onglet Mental + progression par session (champ et gardien) | **Must** |
| F4 | Coach : notation staff du mental + statuts de complétion par session | **Must** |
| F5 | Radar Mental joueur vs staff (joueur + coach) + détail par axe + partage | **Must** |
| F6 | Cocher/décocher le mental sur une session existante (si aucune note mentale) | **Should** |
| F7 | Comparaison inter-sessions du mental (bilan, bar chart, tableau progression) | **Should** |
| F8 | Slide mental dans l'export PPT coach | **Should** |

## Features — description fonctionnelle

### F1 — Référentiel mental
- Nouveau profil `mental` (type `mental`) dans `criteria-data.js` : axes `competition`, `travail`, `groupe`, `projet` (ids **sans tiret**, pour que `getCritereById` retrouve le profil).
- Critère = `{ id, label, texte }` : `label` = titre court (gras de l'Excel), `texte` = phrase « Je… » à la première personne affichée au joueur.
- Textes issus de l'Excel, orthographe corrigée, annotations « (?) » retirées.
- Fonctions utilitaires **session-aware** : liste des profils à évaluer pour (joueur × session), total de critères attendus, de façon à ce que plus aucun écran ne calcule le total « par joueur » seulement.

### F2 — Création de session
- Fenêtre « Nouvelle session » : case à cocher « 🧠 Inclure la dimension mentale (1 fois par an) », décochée par défaut, avec une ligne d'aide.
- La valeur est enregistrée dans `sessions.inclut_mental`.
- Badge « 🧠 Mental » sur les cartes de session (coach et joueur) et dans le détail de session.

### F3 — Joueur
- Écran d'évaluation : onglet « 🧠 Mental » après Attaque / Défense (joueur de champ) ou après l'onglet Gardien (GB), **uniquement si** la session inclut le mental.
- Même mécanique : navigation par axe (swipe/flèches), double-tap pour confirmer, auto-save, alerte « critères oubliés ».
- « Terminer » enchaîne ATT → DEF → Mental ; sur une session sans mental, comportement inchangé.
- Liste des sessions : barre de progression et « Complet » calculés avec le bon total (technique + 16 si mental).

### F4 — Coach
- Notation staff : onglet Mental dans l'écran de notation (2 rangées par critère : Joueur lecture seule + Staff cliquable), comme le technique.
- Statut joueur (Non commencé / En cours / Joueur terminé / Complet) calculé avec le total de **la session**.
- Un joueur sans profil technique mais dans une session avec mental ne casse pas l'écran.

### F5 — Rendu graphique
- 3e radar « Mental » (joueur en bleu, staff en orange — mêmes couleurs que ATT/DEF), côté joueur et côté coach.
- Clic sur un axe → détail par critère (pastilles joueur | staff), comme le technique.
- Côté joueur : visible uniquement si `resultats_visibles = true` (mécanisme existant, un seul bouton de partage).
- Sur une session sans mental : aucun radar Mental, mise en page identique à aujourd'hui.

### F6 — Modifier l'option après création
- Détail de session (coach) : interrupteur « Dimension mentale » ; désactivation refusée avec message si des notes `mental-*` existent déjà.

### F7 — Comparaison inter-sessions
- Bilan multi-sessions, bar chart et tableau de progression incluent l'axe Mental pour les sessions qui ont du mental ; les sessions sans mental sont ignorées (pas de zéros).
- Une seule session mental → affichage joueur vs staff uniquement, avec message « Comparaison disponible à la prochaine évaluation mentale ».

### F8 — Export PPT
- Une slide Mental (radar + écarts par axe) ajoutée à l'export coach si la session inclut le mental.

## Critères d'acceptation globaux

1. Session créée sans mental → tous les écrans (joueur, coach, radar, PPT) identiques à la version actuelle.
2. Session avec mental → joueur champ ET gardien peuvent noter 16 critères mentaux ; progression « X / total » correcte ; « Complet » uniquement quand tout est noté.
3. Coach note le staff sur le mental ; statut « Complet » exige joueur + staff sur technique + mental.
4. Radar Mental affiché côté coach dès qu'il y a des notes ; côté joueur seulement après partage.
5. Sessions existantes : totaux, barres de progression et radars inchangés.
6. Création d'une session **sans** mental fonctionne même si la migration SQL n'est pas encore appliquée (déploiement non bloquant).
7. Aucune donnée mentale visible d'un joueur par un autre joueur (RLS existante inchangée).

## Hors scope

Volet Physique ; commentaires par critère ; synthèse globale et appréciation générale de l'Excel ; partage séparé technique/mental ; export joueur ; évaluation mentale rétroactive ; notifications.

## Dépendances

- Migration SQL `ALTER TABLE sessions ADD COLUMN inclut_mental BOOLEAN NOT NULL DEFAULT false` **appliquée manuellement** dans le SQL Editor Supabase (le projet n'a pas de pipeline de migration).
- Aucune dépendance sur des stories en cours.

## Risques (détail dans `docs/risks/dimension-mentale.md`)

- Totaux par joueur codés à plusieurs endroits → régression silencieuse (barre de progression fausse).
- Ordre de déploiement SQL / front.
- Notes staff mentales lisibles par le joueur via l'API avant partage (faille RLS préexistante, aggravée par la sensibilité du mental).
