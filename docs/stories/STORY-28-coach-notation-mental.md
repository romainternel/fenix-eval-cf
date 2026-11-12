# STORY-28 — Coach : noter le staff sur le mental et suivre la complétion

**En tant que** coach,
**Je veux** noter le staff sur les 16 critères mentaux et voir un statut de complétion juste pour la session,
**Afin de** comparer ma perception à celle du joueur.

## Contexte technique
- Zone : `pages/coach-dashboard.js` — `loadSessionPlayerList` (l.143, `getPlayerStatus` l.205), `showCoachEval` (l.1481), `coachSwitchProfil` (l.1534), `coachRenderAxes` (l.1539), `saveCoachRating` (l.1630).
- Spéc : `docs/design/dimension-mentale.md` §5 ; arch §3 ; risques R1, R5, R6.
- `loadSessionPlayerList` doit connaître la session (`inclut_mental`) → la charger ou la passer depuis `showSessionDetail`.
- **Compteur et total corrigés ensemble** (`countMap` compte déjà les lignes mentales).
- `saveCoachRating` : upsert sans écraser `note_joueur` (comportement existant à préserver).

## Critères d'acceptation
- [ ] `getPlayerStatus` utilise `sessionTotalCriteres(prof, session)`.
- [ ] Session sans mental : statuts et textes « X/total » identiques à avant.
- [ ] Session mentale : un joueur ayant tout noté en technique mais pas le mental n'est **pas** « Joueur terminé » ni « Complet » ; il devient « Complet ✓ » seulement quand joueur **et** staff ont noté technique + mental.
- [ ] Écran de notation staff : onglet `🧠 Mental` ajouté après ATT/DEF (champ) ; pour un **gardien**, barre `🧤 Gardien | 🧠 Mental` si session mentale (sinon écran inchangé).
- [ ] Onglet Mental : 2 rangées par critère — Joueur (lecture seule) + Staff (cliquable) — avec description au tap, comme le technique ; navigation par axe identique.
- [ ] Sauvegarde staff : `note_staff` + `date_staff` écrits avec `profil_id = 'mental'` ; `note_joueur` intact (vérifié en base).
- [ ] Le coach peut noter le mental même si le joueur n'a rien noté (et inversement).
- [ ] Les barres « Joueur / Staff » de la liste affichent le bon total de session.
- [ ] Bouton Fermer/Rouvrir l'accès par joueur et partage des résultats : inchangés.
- [ ] Joueur sans profil actif : message « Aucun profil assigné » conservé.
- [ ] `?v=` bumpé (`coach-dashboard.js`).

## Hors scope
Radar/graphiques (STORY-29/30), export PPT (STORY-31), commentaire par critère.

## Dépend de
- STORY-25, STORY-26.

## Taille
M
