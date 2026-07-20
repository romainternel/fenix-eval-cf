# PRD — Refonte architecture des rôles (module socio-pro)

> Agent : Product Manager · 2026-07-20
> Brief source : docs/brief.md

---

## 1. Objectif

Clarifier le modèle de rôles de l'application pour distinguer proprement les coachs CF (accès complet : évaluation + socio-pro) des référents socio-pro purs (accès restreint au module socio-pro uniquement). Éliminer le rôle ambigu `cellule` et le remplacer par `referent_sociopro`.

---

## 2. Features — Must Have

### F1 — Renommage du rôle en base
Remplacer `role = 'cellule'` par `role = 'referent_sociopro'` dans la table `user_profiles` pour les 3 référents purs (Marion, Mathilde, Alain).

**Critères d'acceptation :**
- [ ] Un utilisateur avec `role = 'referent_sociopro'` est redirigé vers `fenix-sociopro.html` au login
- [ ] Un utilisateur avec `role = 'cellule'` résiduel (si migration partielle) est redirigé vers `fenix-sociopro.html` sans casse (compatibilité transitoire)
- [ ] Un coach (`role = 'coach'`) accède toujours à `coach.html`

### F2 — Renommage de la fonction RLS
Remplacer `is_cellule()` par `is_sociopro_membre()` dans Supabase. La fonction retourne `TRUE` pour `role IN ('referent_sociopro', 'coach')`.

**Critères d'acceptation :**
- [ ] Toutes les policies des tables `ssp_*` et `ssp_actions_reunion` utilisent `is_sociopro_membre()`
- [ ] `is_cellule()` n'existe plus (supprimée après migration)
- [ ] Les joueurs ne peuvent toujours pas accéder aux tables `ssp_*`

### F3 — Mise à jour du routing dans le code
`app.js` gère le routing pour `referent_sociopro` (en plus de la compatibilité `cellule` transitoire). `fenix-sociopro.html` accepte `['referent_sociopro', 'coach']`.

**Critères d'acceptation :**
- [ ] `requireAuth(['referent_sociopro', 'coach'])` dans fenix-sociopro.html
- [ ] `requireAuth('joueur')` redirige un joueur qui tente d'accéder à fenix-sociopro.html
- [ ] Le routing post-login dans index.html couvre `referent_sociopro`

### F4 — Navigation coach ↔ socio-pro
Un coach peut naviguer entre son dashboard CF et le module socio-pro sans logout.

**Critères d'acceptation :**
- [ ] Tab "Socio-Pro ↗" visible dans la nav de coach.html
- [ ] Lien "← Dashboard coach" visible dans fenix-sociopro.html uniquement pour les coachs (`_spRole === 'coach'`)
- [ ] Un référent (`_spRole === 'referent_sociopro'`) ne voit PAS le lien "← Dashboard coach"

---

## 3. Features — Should Have

### F5 — Documentation mise à jour
`CLAUDE.md` reflète les 3 rôles exacts avec leur périmètre d'accès.

### F6 — Compatibilité transitoire `cellule`
Pendant la fenêtre de déploiement, le code accepte encore `cellule` dans le routing pour éviter tout lockout. Supprimé dès que la migration SQL est confirmée.

---

## 4. Features — Nice to Have (hors scope v actuelle)

- Indicateur visuel dans le header socio-pro montrant le rôle de l'utilisateur connecté
- Gestion des rôles depuis une interface admin (actuellement : Supabase uniquement)
- Un référent socio-pro voit le radar CF d'un joueur en lecture seule (décision non prise)

---

## 5. Hors scope explicite

- Les référents socio-pro n'ont AUCUN accès aux tables `evaluations`, `sessions`, `player_profiles`, `comptes_rendus`
- Pas de modification des droits joueur
- Pas de création de nouveau rôle admin
- Pas d'interface de gestion des rôles dans l'app

---

## 6. Dépendances

- SQL Supabase : migration à exécuter APRÈS déploiement du code (voir Architect pour le séquençage)
- Comptes existants avec `role = 'cellule'` : Marion Agostini, Mathilde Soulié, Alain Raynal

---

## 7. Ordre de livraison recommandé

1. **STORY-18** : Mise à jour code (routing + requireAuth + sociopro-dashboard) — déployer en premier
2. **STORY-19** : Migration SQL (rename role + rename fonction + policies) — exécuter après déploiement
3. **STORY-20** : Documentation CLAUDE.md mise à jour

---

## 8. Risques PM

| Risque | Mitigation |
|--------|------------|
| Migration SQL avant déploiement code → lockout des référents | Séquençage strict : code d'abord |
| Oubli de recréer une policy RLS → donnée ssp_* inaccessible | Script SQL idempotent avec vérification post-migration |
| Rôle `cellule` laissé en base sur un compte → redirection cassée | Compatibilité transitoire dans app.js pendant 1 cycle |
