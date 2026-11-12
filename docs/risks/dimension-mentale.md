# Risques — Dimension mentale

> Agent : Risk Analyst · 2026-11-12 · Sources : `docs/arch/dimension-mentale.md`, code et schéma SQL existants

---

## Tableau des risques

| # | Risque | Prob. | Impact | Prio | Recommandation |
|---|---|---|---|---|---|
| R1 | **Totaux/« Complet » faux.** Les compteurs (`notesBySession`, `countMap`) comptent toutes les lignes `evaluations` de la session, mais les totaux sont calculés **par joueur** (`player-home.js:90`, `coach-dashboard.js:205`). Une session mentale fausse la barre de progression et affiche « Complet » trop tôt (ou jamais). | Élevée | Critique | **P0** | Corriger compteur **et** total dans la même story, via `sessionTotalCriteres()`. Critères d'acceptation chiffrés (ex. 37 techniques + 16 mental = 53). |
| R2 | **Ordre de déploiement SQL / front.** Si le front est poussé avant la colonne `inclut_mental`, l'`insert` de session échoue (`column does not exist`) et **toute création de session est cassée**, même sans mental. | Moyenne | Critique | **P0** | N'envoyer la clé `inclut_mental` que si la case est cochée. Lecture tolérante (`=== true`). Story SQL livrée et exécutée **avant** le push de la story d'UI. |
| R3 | **Fuite des notes staff mentales vers le joueur.** `eval_joueur_read` = `player_id = my_player_id()` sans restriction de colonnes : un joueur qui appelle l'API Supabase directement lit `note_staff` **avant** que le coach partage les résultats. Existe déjà pour le technique, mais le mental (état d'esprit, projet de vie) est plus sensible. | Faible (demande de bidouiller l'API) | Moyen–Critique | **P1** | **Hors scope de cette feature** mais à signaler : passer par une vue/fonction filtrant `note_staff` tant que `resultats_visibles = false`. Convoquer le Security Auditor pour une story dédiée. Mention dans le résumé final. |
| R4 | **Mauvaise modification d'une session en cours.** Cocher/décocher le mental après que des joueurs ont commencé : changement du total en cours de route (un joueur « Complet » repasse « En cours »), ou masquage de notes mentales déjà saisies. | Moyenne | Moyen | **P1** | Activation autorisée tant que la session est ouverte (avec message d'avertissement) ; **désactivation refusée** si des notes `mental-%` existent ; interrupteur inactif sur session fermée. |
| R5 | **Gardien (GB) oublié.** `renderGbEval` n'a pas de barre d'onglets : le flux GB est un chemin séparé de `renderChampEval`. Risque que le mental n'apparaisse que pour les joueurs de champ. | Élevée | Élevé | **P1** | Critère d'acceptation explicite « gardien » en STORY-27 et STORY-28 ; test e2e GB obligatoire. |
| R6 | **Joueur sans profil technique actif.** `showEvaluation` et `showCoachEval` affichent « Aucun profil assigné » et sortent : le joueur ne pourrait pas noter le mental. | Faible | Moyen | **P2** | Décision : le mental reste conditionné à l'existence d'un profil (cohérent avec le reste, un joueur sans profil est un cas d'erreur de configuration). Le noter dans la story ; ne pas l'élargir. |
| R7 | **`type: 'mental'` sans CSS.** `type` est utilisé comme classe CSS ; sans règles `.mental`, onglets/boutons d'axes non stylés (ou pire : styles ATT/DEF appliqués par défaut). | Élevée si oubli | Faible | **P2** | CSS dans STORY-25 (référentiel) ; contrôle visuel QA. |
| R8 | **Comparaison inter-sessions avec trous.** Bilan/bar chart/tableau superposent aujourd'hui toutes les sessions ; une session sans mental produirait des zéros ou `NaN` sur l'axe mental, ou un radar vide. | Élevée | Moyen | **P1** | Filtrer les sessions `inclut_mental` pour le mental ; message « comparaison disponible à la prochaine évaluation mentale » avec 1 seule session ; cellules « — » dans le tableau. |
| R9 | **Ids d'axes avec tiret.** `getCritereById` retrouve le profil en retirant les 2 derniers segments : un axe `projet-vie` casserait la résolution (`mental-projet` ≠ `mental`). | Faible | Moyen | **P2** | Ids d'axes sans tiret (`competition`, `travail`, `groupe`, `projet`) — déjà dans l'architecture ; test unitaire/console sur les 16 ids. |
| R10 | **Cache navigateur (cache-busting).** Joueurs qui gardent l'ancien `player-home.js` : ne voient pas l'onglet Mental sur une session mentale, progression fausse. | Moyenne | Moyen | **P2** | Bumper `?v=` dans les 3 HTML (règle projet) ; vérifier après déploiement avec Ctrl+F5. |
| R11 | **Réponses de joueur dépendantes d'un état de session changeant.** Le joueur remplit pendant que le coach active le mental → `_ratings` chargé avant, onglet absent jusqu'au rechargement. | Faible | Faible | **P3** | Accepté. L'onglet apparaît au prochain chargement de la session. |
| R12 | **Radar à 4 axes peu lisible** et valeurs moyennes arrondies trompeuses. | Moyenne | Faible | **P3** | Lignes chiffrées « Moi / Staff / écart » sous le radar (déjà dans le design). |
| R13 | **Suppression de session / de joueur.** Les notes mentales doivent partir avec le reste. | Faible | Moyen | **P3** | Vérifié : `evaluations` est supprimé par `session_id` (cascade + delete explicite, `coach-dashboard.js:1715`) et par `player_id` (`:2156`). Rien à faire. |
| R14 | **Connexion perdue pendant la saisie.** | Moyenne | Faible | **P3** | Comportement existant (auto-save par critère, ✗ sur échec) ; pas de mode hors ligne, accepté. |

## Concurrence
Joueur et coach écrivent des colonnes différentes (`note_joueur` / `note_staff`) sur la même ligne via upsert `UNIQUE(session_id, player_id, critere_id)` : mécanique existante, pas de nouvelle collision. À conserver : le coach ne doit jamais écraser `note_joueur` (voir `saveCoachRating`).

## Édge cases métier à couvrir en test
1. Joueur de champ, session mentale, **aucun** critère noté → « 0 / 53 ».
2. Gardien, session mentale → total = critères GB + 16.
3. Session **sans** mental d'un joueur qui a déjà des notes mentales d'une autre session → total inchangé.
4. Session mentale avec 1 seul joueur ayant noté le mental → statuts des autres joueurs = « Non commencé ».
5. Coach décoche le mental alors que 3 critères mentaux sont notés → refus + message.
6. Partage des résultats avant que le staff ait noté le mental → radar staff à 0 (comportement actuel du technique) : message « Staff : en attente » à prévoir pour ne pas montrer un radar vide trompeur.

## Mitigations → stories / critères
| Risque | Traité dans |
|---|---|
| R1, R5 | STORY-27 (joueur), STORY-28 (coach) |
| R2 | STORY-26 (migration + création) |
| R4 | STORY-26 (interrupteur) |
| R7, R9 | STORY-25 (référentiel + CSS) |
| R8 | STORY-30 (comparaison) |
| R3 | **Hors scope — à confier au Security Auditor** |
