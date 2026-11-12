# STORY-27 — Joueur : noter le mental dans une session qui l'inclut

**En tant que** joueur (de champ ou gardien),
**Je veux** un onglet « Mental » dans mon évaluation quand la session l'inclut, avec une progression correcte,
**Afin de** m'auto-évaluer sur mon état d'esprit comme je le fais sur la technique.

## Contexte technique
- Zone : `pages/player-home.js` — `showSessionsList` (l.60, total l.90-94), `showEvaluation` (l.149, doit récupérer la session), `startEvaluation` (l.196), `renderChampEval` (l.205), `renderGbEval` (l.234), `switchProfilTab` (l.226), `updateProgressBadges` (l.414), `terminerProfil` / `_doTerminerProfil` (l.421-484).
- Spéc : `docs/design/dimension-mentale.md` §4 ; arch §3 (piège compteur/total) ; risques R1, R5, R6, R10.
- Utiliser `sessionTotalCriteres(_playerProfile, session)` et `sessionProfilIds(...)` (STORY-25).
- `_currentSession` reste l'id ; ajouter `_currentSessionObj` (ou équivalent) pour porter `inclut_mental`.
- **Compteur et total doivent être corrigés ensemble** : `notesBySession` compte déjà les lignes mentales.

## Critères d'acceptation
- [ ] **Liste des sessions** : chaque carte calcule son total avec `sessionTotalCriteres` (session sans mental = valeur actuelle ; avec mental = +16).
- [ ] Joueur de champ, session mentale, rien noté → « 0 / (ATT+DEF+16) critères », pas « Complet ».
- [ ] « ✓ Complet » et la barre à 100 % uniquement quand **tous** les critères (technique + mental) sont notés.
- [ ] **Joueur de champ** : barre d'onglets `⚡ Attaque | 🛡 Défense | 🧠 Mental` avec progression par onglet (`X/16` pour le mental).
- [ ] **Gardien** : session mentale → barre d'onglets `🧤 Gardien | 🧠 Mental` ; session sans mental → écran gardien **inchangé** (pas de barre).
- [ ] Onglet Mental : navigation par axe (Compétition / Travail / Groupe / Projet), swipe + flèches, double-tap pour confirmer, auto-save en base avec `profil_id = 'mental'` et `critere_id = 'mental-…'`, retour ✓/✗.
- [ ] `note_staff` n'est jamais écrasé par la saisie joueur.
- [ ] « Terminer » : ATT → toast + bascule DEF ; DEF → toast « Défense terminée ! Passe au Mental. » + bascule Mental ; Mental → « Évaluation envoyée ! » + retour liste. Gardien : Gardien → Mental → fin.
- [ ] Alerte « critères oubliés » liste les axes mentaux non notés.
- [ ] Écran d'intro : ligne « Cette session inclut aussi ton état d'esprit (mental). » **uniquement** si session mentale.
- [ ] **Session sans mental** : écrans, totaux et enchaînement strictement identiques à avant (champ et gardien).
- [ ] Joueur sans profil actif : message « Aucun profil assigné » conservé (décision R6).
- [ ] Rechargement de la page en cours de notation mentale : les notes déjà saisies réapparaissent.
- [ ] `?v=` bumpé (`player-home.js`, `css` si modifié).

## Hors scope
Radar et résultats (STORY-29). Notation staff (STORY-28). Comparaison (STORY-30).

## Dépend de
- STORY-25, STORY-26.

## Taille
M
