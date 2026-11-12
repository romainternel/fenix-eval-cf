# STORY-26 — Choisir d'inclure le mental à la création d'une session (+ migration SQL)

**En tant que** coach,
**Je veux** cocher « Inclure la dimension mentale » en créant une session (et pouvoir le modifier tant que personne n'a noté le mental),
**Afin de** ne déclencher l'évaluation mentale qu'une fois par an, quand c'est pertinent.

## Contexte technique
- Zones : `supabase/migrations/20261112_add_inclut_mental.sql` (nouveau), `pages/coach-dashboard.js` (`showCreateSessionModal` ~l.1757, `submitCreateSession` ~l.1799, `renderSessionCard` ~l.63, `showSessionDetail` ~l.76), `player-home.js` (badge sur `sessionCard` uniquement).
- Spéc : `docs/design/dimension-mentale.md` §1-3 ; `docs/visual/dimension-mentale.md` §3-5 ; `docs/arch/dimension-mentale.md` §5.
- **Migration à exécuter manuellement dans le SQL Editor Supabase AVANT de pousser le front** (pas de pipeline de migration) :
  ```sql
  ALTER TABLE sessions ADD COLUMN IF NOT EXISTS inclut_mental BOOLEAN NOT NULL DEFAULT false;
  ```
- **Insertion non bloquante** : n'envoyer la clé `inclut_mental: true` que si la case est cochée (risque R2).
- Lecture tolérante partout : `session.inclut_mental === true`.

## Critères d'acceptation
- [ ] Le fichier de migration existe et le SQL ci-dessus a été exécuté (sessions existantes → `inclut_mental = false`).
- [ ] La fenêtre « Nouvelle session » affiche une case « 🧠 Inclure la dimension mentale » + aide « 16 critères en plus. À faire une fois par an. », **décochée par défaut**, zone cliquable ≥ 44 px.
- [ ] Session créée **décochée** → `inclut_mental = false` en base ; **cochée** → `true`.
- [ ] Création d'une session **décochée** fonctionne même si la colonne n'existait pas (clé non envoyée) — vérifié en lisant le code d'insertion.
- [ ] Les cartes de session (coach et joueur) affichent le badge « 🧠 MENTAL » si `inclut_mental === true`, rien sinon.
- [ ] Détail de session (coach) : interrupteur « Dimension mentale » reflétant l'état.
- [ ] Interrupteur : activer sur session **ouverte** → écrit `true` + toast de confirmation.
- [ ] Interrupteur : désactiver alors qu'il existe des évaluations `critere_id LIKE 'mental-%'` pour la session → refusé, toast « Des notes mentales existent déjà, impossible de désactiver. », interrupteur revient à l'état précédent.
- [ ] Interrupteur désactivé (non cliquable) sur session fermée.
- [ ] Échec réseau/BDD sur l'interrupteur → toast d'erreur, état précédent restauré.
- [ ] Sessions existantes : aucun badge, comportement identique.
- [ ] `?v=` bumpés (coach-dashboard, player-home, css si modifié).

## Hors scope
Aucun onglet Mental, aucun total modifié (STORY-27/28). Pas de modification du libellé automatique de session.

## Dépend de
- STORY-25 (CSS `.badge-mental`, tokens).

## Taille
M
