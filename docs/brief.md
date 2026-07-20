# Brief — Refonte architecture des rôles (module socio-pro)

> Produit par l'Analyst · 2026-07-20

---

## 1. Contexte

L'application FENIX Eval CF dispose d'un module socio-pro opérationnel (fenix-sociopro.html) avec 4 vues : liste joueurs, fiche profil, entretien, mode réunion. Ce module est utilisé par 5 personnes : Marion, Mathilde, Alain (référents socio-pro purs), et Romain, Max (coachs CF qui font aussi du suivi socio-pro).

Le rôle actuel `cellule` a été créé pour couvrir tous ces usages. Il s'avère insuffisant : il ne distingue pas les référents purs des coachs, et il crée deux problèmes distincts pour chaque population.

---

## 2. Problème réel

**Pour Romain et Max (coachs)** : ils ont deux casquettes réelles — coach CF (sessions d'évaluation, notes staff, export PPT) et membre de la cellule socio-pro. Aujourd'hui ces deux espaces sont des silos : impossible de passer de l'un à l'autre sans friction. Un coach doit pouvoir naviguer entre son dashboard CF et le module socio-pro depuis la même session, d'un seul clic.

**Pour Marion, Mathilde, Alain (référents purs)** : le rôle `cellule` ne correspond à rien dans le vocabulaire du club. Le nom est opaque. Ces trois personnes ne doivent accéder à rien du dashboard CF (pas de sessions, pas de notes techniques, pas de radar) — la frontière doit être nette et documentée.

**Pour le code** : la fonction SQL `is_cellule()` inclut maintenant les coachs (patch précédent), ce qui est sémantiquement faux. Les policies RLS bâties dessus sont ambiguës. Ce n'est pas bloquant aujourd'hui mais deviendra un point de confusion à toute future évolution.

---

## 3. Utilisateurs

| Persona | Rôle actuel | Besoin réel |
|---------|-------------|-------------|
| Romain, Max | `coach` | Dashboard CF + accès natif socio-pro depuis la même session |
| Marion, Mathilde, Alain | `cellule` | Socio-pro uniquement — pas de dashboard CF |
| Joueurs | `joueur` | Inchangé |

**Contexte d'usage** : mobile, debout ou en réunion, connexion variable. La navigation entre modules doit être instantanée — un seul compte, un seul login.

---

## 4. Vision

> Un système de rôles lisible à 3 niveaux : `joueur`, `referent_sociopro`, `coach`. Chaque rôle donne accès exactement à ce que la personne a besoin de voir, sans friction de navigation et sans ambiguïté dans le code.

---

## 5. Scope

**Dans ce cycle :**
- Renommer le rôle `cellule` → `referent_sociopro` (DB + code + routing)
- Donner aux coachs un accès natif au module socio-pro (même session, lien dans nav)
- Renommer `is_cellule()` → `is_sociopro_membre()` et reconstruire les policies RLS
- Migrer les comptes existants (UPDATE SQL)
- Documenter les 3 rôles dans CLAUDE.md

**Hors scope :**
- Les référents socio-pro ne voient PAS les notes CF (radar, progression, critères)
- Pas de tableau de bord mixte "coach + socio-pro en un seul écran"
- Pas de nouveau rôle admin global
- Pas de gestion des droits depuis l'UI (toujours via Supabase directement)

---

## 6. Critères de succès

- Romain se connecte → voit son dashboard coach → clique "Socio-Pro" → arrive sur fenix-sociopro.html → revient au dashboard coach d'un clic, sans logout
- Marion se connecte → arrive directement sur fenix-sociopro.html — aucun accès aux sessions CF ou aux notes
- Un joueur avec un compte mal configuré ne peut pas accéder au module socio-pro
- Les tables `ssp_*` restent inaccessibles aux joueurs, et aucune donnée `notes_cellule` / `couleur_justification` n'est exposée dans la vue joueur

---

## 7. Questions résolues dans ce Brief

| Question | Décision |
|----------|----------|
| Un fichier HTML partagé ou deux ? | Partagé (fenix-sociopro.html) — le rôle conditionne uniquement le lien retour |
| Le référent voit-il les notes CF ? | Non — aucun accès aux tables `evaluations`, `sessions`, `player_profiles` |
| Les actions réunion sont-elles multi-rôles ? | Oui — coach et referent_sociopro peuvent toutes les voir et les modifier |
| Nom du nouveau rôle ? | `referent_sociopro` (snake_case, cohérent avec la convention du projet) |
| Quelle migration ? | UPDATE SQL + renommage fonction RLS — idempotent, en deux étapes séquencées |
