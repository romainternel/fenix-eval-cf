# Risques — Refonte rôles socio-pro

> Agent : Risk Analyst · 2026-07-20

---

## Tableau des risques

| # | Risque | Probabilité | Impact | Priorité |
|---|--------|-------------|--------|----------|
| R1 | SQL migration exécutée AVANT déploiement code → lockout référents | Moyenne | Critique | P0 |
| R2 | is_cellule() supprimée avant que toutes les policies soient recréées → tables ssp_* inaccessibles | Moyenne | Critique | P0 |
| R3 | Un compte `cellule` oublié dans la migration → routing cassé après retrait de la compatibilité | Faible | Moyen | P1 |
| R4 | fenix-sociopro.html servi depuis cache navigateur (ancienne version) → requireAuth ne reconnaît pas 'referent_sociopro' | Faible | Moyen | P1 |
| R5 | Coach navigue vers socio-pro → la session Supabase est partagée → OK, mais si la session expire entre les deux pages | Faible | Faible | P2 |
| R6 | is_sociopro_membre() créée mais ancienne is_cellule() pas supprimée → deux fonctions avec des logiques différentes coexistent | Moyenne | Faible | P2 |

---

## Détail P0

### R1 — Lockout référents si SQL avant code

**Scénario** : L'admin exécute la migration SQL qui met `role = 'referent_sociopro'`. Le code actuel (app.js) ne connaît que `cellule` → Marion se connecte → rôle non reconnu → redirected vers `player.html` → elle voit la page joueur ou un blanc.

**Mitigation** :
- Séquençage strict documenté dans l'Architect : code TOUJOURS en premier
- La STORY-18 (code) est marquée `Dépend de : rien` — la STORY-19 (SQL) est marquée `Dépend de : STORY-18 déployée en prod`
- Critère d'acceptation STORY-19 : vérifier le login de Marion AVANT de retirer la compatibilité

### R2 — Trou RLS pendant le renommage de la fonction

**Scénario** : `DROP FUNCTION is_cellule()` exécuté. Les policies qui référencent cette fonction passent en `USING (false)` ou en erreur → personne ne peut lire/écrire les tables ssp_* pendant X secondes/minutes.

**Mitigation** :
- Ordre SQL dans le script : CREATE `is_sociopro_membre()` → DROP + CREATE policies → UPDATE rôles → DROP `is_cellule()`
- Ne jamais supprimer `is_cellule()` en premier
- Script idempotent : `CREATE OR REPLACE` partout, `DROP IF EXISTS` en fin de script uniquement

---

## Détail P1

### R3 — Compte `cellule` oublié

**Scénario** : L'admin oublie de migrer un compte. La compatibilité transitoire est retirée du code. Ce compte ne peut plus accéder à l'app (redirigé vers player.html).

**Mitigation** :
- Script SQL de vérification post-migration :
  ```sql
  SELECT id, role FROM user_profiles WHERE role = 'cellule';
  -- Doit retourner 0 lignes avant de retirer la compatibilité du code
  ```
- Critère dans STORY-19 (SQL) : la vérification doit passer avant de valider la story

### R4 — Cache navigateur

**Scénario** : Un référent a la page en cache (Service Worker ou cache HTTP). L'ancienne version de `fenix-sociopro.html` est servie, qui a `requireAuth('cellule')` — incompatible avec le nouveau rôle.

**Mitigation** :
- Les fichiers JS ont des paramètres `?v=N` — incrémenter les versions dans les balises script est la mitigation standard du projet
- Documenter dans la STORY-18 : incrémenter les versions de tous les scripts chargés dans fenix-sociopro.html

---

## Détail P2

### R5 — Session Supabase entre pages

Le SDK Supabase gère la session en localStorage — elle persiste entre les pages du même domaine. Pas de risque réel.

### R6 — Deux fonctions SQL coexistantes

Pas de conflit fonctionnel mais confusion lors d'une future évolution. Mitigation : `DROP FUNCTION is_cellule()` en fin de script STORY-19, avec commentaire explicatif dans le script.

---

## Stories de mitigation recommandées

Les risques P0 sont couverts par le **séquençage des stories** (STORY-18 avant STORY-19) et les **critères d'acceptation** de STORY-19. Pas de story dédiée à la mitigation — intégré dans les stories existantes.

Le risque R4 (cache) est couvert par l'incrémentation de version dans STORY-18 (critère d'acceptation).
