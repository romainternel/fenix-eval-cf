# Risques — Module Socio-Pro

> Agent : Risk Analyst · 2026-07-20

---

## Tableau des risques

| # | Risque | Probabilité | Impact | Priorité |
|---|--------|-------------|--------|----------|
| R1 | `is_sociopro_membre()` créée APRÈS les policies → policies créées sur une fonction inexistante → erreur SQL | Moyenne | Critique | P0 |
| R2 | Un joueur peut lire `notes_cellule` via Supabase REST API directement (hors app) | Faible | Élevé | P1 |
| R3 | Coach accède à fenix-sociopro.html, la session Supabase n'est pas reconnue (tokens différents) | Très faible | Moyen | P2 |
| R4 | Cache navigateur : ancien `app.js` servi → rôle `referent_sociopro` non reconnu → redirect player.html | Faible | Moyen | P1 |
| R5 | `joueur_id` dans ssp_* pointe vers `auth.users.id` — si un compte joueur est supprimé, ses entretiens sont supprimés en cascade | Faible | Moyen | P2 |
| R6 | `spLoadJoueurs()` fait 3 requêtes parallèles — si un joueur n'a pas de `user_profiles` row, il n'apparaît pas dans la liste | Moyenne | Faible | P2 |
| R7 | Le bouton "+ Action" dans Mode Réunion pré-remplit `joueur_id` = `authId` — si authId est null (joueur sans compte auth), l'INSERT échoue | Faible | Faible | P3 |

---

## Détail P0

### R1 — Ordre d'exécution SQL

**Scénario :** Le script SQL est copié-collé en deux blocs séparés dans l'éditeur. Les policies sont créées avant `is_sociopro_membre()`. Supabase rejette les CREATE POLICY avec une erreur "function is_sociopro_membre() does not exist".

**Mitigation :**
- Le script `supabase-sociopro.sql` doit être un bloc unique exécuté d'un coup
- Ordre dans le script : (1) tables, (2) trigger, (3) `is_sociopro_membre()`, (4) ALTER TABLE ENABLE RLS, (5) policies
- Critère d'acceptation STORY-18 : le script s'exécute sans erreur en une seule passe

---

## Détail P1

### R2 — Lecture directe de `notes_cellule` via REST

**Scénario :** Un joueur connaît l'URL Supabase REST et son token JWT. Il fait un GET sur `/rest/v1/ssp_entretiens?joueur_id=eq.{son_id}` → la policy RLS l'autorise (SELECT sur ses propres rows) → il reçoit TOUTES les colonnes y compris `notes_cellule` et `couleur_justification`.

**Impact :** Les notes internes de la cellule sont visibles à un joueur techniquement averti.

**Mitigation (recommandée, non bloquante pour le lancement) :**
- Option A (clean, prioritaire à terme) : créer une vue SQL `ssp_entretiens_joueur` qui exclut les colonnes sensibles, et appliquer la policy joueur sur la vue — la table réelle reste inaccessible aux joueurs.
- Option B (acceptable pour le lancement) : documenter la limitation. Les notes cellule contiennent rarement des informations critiques, et l'accès nécessite de connaître le token JWT.

**Décision pour ce cycle :** Option B — accepté en l'état, à traiter dans une story dédiée si le contenu des `notes_cellule` devient sensible.

### R4 — Cache navigateur

**Scénario :** Marion a déjà visité l'app. Son navigateur a mis en cache `app.js?v=44`. Elle reçoit son nouveau compte `referent_sociopro`. Elle se connecte. L'ancien `app.js` est servi → le routing ne connaît que `'cellule'` → elle est redirigée vers `player.html`.

**Mitigation :**
- Incrémenter systématiquement tous les `?v=N` des fichiers modifiés dans la STORY-19
- Documenter dans les critères d'acceptation

---

## Détail P2

### R3 — Session Supabase coach entre pages

Le SDK Supabase stocke la session dans `localStorage`. Elle persiste entre coach.html et fenix-sociopro.html sur le même domaine. Pas de risque réel — confirmé par le design du SDK.

### R5 — Cascade DELETE joueur

`ssp_entretiens.joueur_id` référence `auth.users(id) ON DELETE CASCADE`. Si un coach supprime le compte auth d'un joueur depuis l'onglet Joueurs, tous ses entretiens socio-pro sont supprimés silencieusement.

**Mitigation :** La suppression d'un compte joueur (`create-player-account` Edge Function) est une action explicite et rare. Acceptable en l'état. À documenter dans CLAUDE.md.

### R6 — Joueur sans `user_profiles` row

Si un joueur actif dans `players` n'a pas de row dans `user_profiles`, son `authId` sera `undefined` → il n'apparaît pas dans la liste socio-pro.

**Mitigation :** Ce cas ne devrait pas exister (la création de compte joueur crée toujours le profil), mais `spLoadJoueurs()` l'ignore silencieusement — pas de crash. Acceptable.

---

## Synthèse pour le Scrum Master

| Finding | Action |
|---------|--------|
| R1 | Critère d'acceptation STORY-18 : script SQL exécuté en une seule passe |
| R2 | Hors scope v1 — documenté dans CLAUDE.md |
| R4 | Critère d'acceptation STORY-19 : incrémenter tous les ?v=N |
| R5 | Documenter dans CLAUDE.md (comportement cascade intentionnel) |
