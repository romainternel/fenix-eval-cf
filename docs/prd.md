# PRD — Module Socio-Pro : activation complète + architecture rôles

> Agent : Product Manager · 2026-07-20
> Source : docs/brief.md

---

## 1. Objectif

Rendre le module socio-pro opérationnel en production : créer la base SQL, corriger le routing, attribuer les rôles. Le code existe déjà — ce cycle livre l'infrastructure et les corrections qui permettent de l'utiliser réellement.

---

## 2. Features — Must Have

### F1 — SQL Supabase complet
Créer toutes les tables ssp_* avec les policies RLS correctes.

**Tables à créer :**
- `ssp_profils` — profil socio-pro par joueur (formation, projet pro, référent, tuteur, contrat, Drive)
- `ssp_orientations` — historique immuable des changements d'orientation
- `ssp_entretiens` — entretiens complets (couleur, sections A/B/C, examens, notes cellule)
- `ssp_reprises` — suivi des actions du mois précédent
- `ssp_actions_reunion` — actions collectives horodatées par date de réunion

**Fonction RLS :**
- `is_sociopro_membre()` → TRUE pour `role IN ('referent_sociopro', 'coach')`

**Policies :**
- ssp_profils / ssp_orientations / ssp_entretiens / ssp_reprises / ssp_actions_reunion : `is_sociopro_membre()` = accès complet (CRUD)
- ssp_profils / ssp_orientations / ssp_entretiens / ssp_reprises : joueur = SELECT sur ses propres lignes seulement
- ssp_actions_reunion : joueur = aucun accès

**Critères d'acceptation F1 :**
- [ ] Les 5 tables existent dans Supabase
- [ ] `is_sociopro_membre()` retourne TRUE pour un coach et pour un referent_sociopro
- [ ] Un joueur peut SELECT ses propres entretiens mais pas ceux d'un autre
- [ ] Un joueur ne peut pas INSERT dans aucune table ssp_*
- [ ] Un coach peut CRUD toutes les tables ssp_*

---

### F2 — Mise à jour routing et auth côté code

Corriger le code JS pour utiliser `'referent_sociopro'` à la place de `'cellule'`.

**Fichiers impactés :**
- `js/app.js` : routing `'referent_sociopro'` → `fenix-sociopro.html` (retirer `'cellule'`)
- `index.html` : idem dans le script de login
- `fenix-sociopro.html` : `requireAuth(['referent_sociopro', 'coach'])` (retirer `'cellule'`)
- `pages/sociopro-dashboard.js` : valeur par défaut `_spRole = 'referent_sociopro'` (pas `'cellule'`)

**Critères d'acceptation F2 :**
- [ ] Un utilisateur `referent_sociopro` est redirigé vers `fenix-sociopro.html` au login
- [ ] Un utilisateur `coach` est redirigé vers `coach.html` au login
- [ ] Un utilisateur `joueur` qui accède manuellement à `fenix-sociopro.html` est redirigé vers `player.html`
- [ ] Le mot `'cellule'` n'apparaît plus dans aucun check de rôle (app.js, index.html, fenix-sociopro.html, sociopro-dashboard.js)
- [ ] Les versions `?v=N` des fichiers modifiés sont incrémentées

---

### F3 — Navigation coach ↔ socio-pro

Un coach navigue entre son dashboard CF et le module socio-pro sans logout.

**Critères d'acceptation F3 :**
- [ ] Tab "Socio-Pro ↗" visible dans la nav de `coach.html` (aligné à droite, style atténué)
- [ ] Clic → arrive sur `fenix-sociopro.html` avec son rôle coach reconnu
- [ ] Dans `fenix-sociopro.html`, un lien "← Dashboard coach" visible UNIQUEMENT pour les coachs
- [ ] Un `referent_sociopro` ne voit PAS ce lien retour

---

### F4 — Vue joueur "Mon suivi"

Un joueur voit ses entretiens socio-pro dans l'onglet "Mon suivi" de `player.html`.

**Critères d'acceptation F4 :**
- [ ] L'onglet "Mon suivi" s'affiche dans la nav de `player.html`
- [ ] Si aucun entretien : message "Ton premier entretien apparaîtra ici"
- [ ] Si entretien(s) : couleur du mois affichée (vert/orange/rouge) + ce qui va + points d'attention + actions à faire
- [ ] Les champs `notes_cellule` et `couleur_justification` ne sont jamais chargés côté joueur
- [ ] L'historique des entretiens précédents est accessible via accordéon

---

### F5 — Attribution des rôles (config)

Les 5 utilisateurs concernés ont le bon rôle dans `user_profiles`.

**Critères d'acceptation F5 :**
- [ ] Marion Agostini → `role = 'referent_sociopro'`
- [ ] Mathilde Soulié → `role = 'referent_sociopro'`
- [ ] Alain Raynal → `role = 'referent_sociopro'`
- [ ] Romain → `role = 'coach'` (déjà OK si compte coach existant, sinon créer)
- [ ] Max → `role = 'coach'` (idem)

---

## 3. Features — Should Have

### F6 — Export .md depuis la fiche joueur
Déjà codé, s'active automatiquement une fois la F1 accomplie. Pas de dev supplémentaire.

### F7 — Export PDF depuis la fiche joueur
Idem — codé, s'active avec F1.

---

## 4. Hors scope explicite

- Les référents socio-pro n'ont aucun accès aux tables `evaluations`, `sessions`, `player_profiles`, `comptes_rendus`
- Pas d'interface admin de gestion des rôles dans l'app
- Pas de notifications ou rappels d'entretien
- Pas de refonte UX du module (les 4 vues sont validées)

---

## 5. Ordre de livraison

```
STORY-18 : SQL Supabase (F1 + F5)  ← bloquant pour tout le reste
STORY-19 : Routing code (F2 + F3)  ← peut se faire en parallèle de STORY-18
STORY-20 : Validation end-to-end (F4 vérifiée + smoke test complet)
```

---

## 6. Risques produit

| Risque | Impact | Mitigation |
|--------|--------|------------|
| SQL mal ordonné → policies orphelines | Critique | Ordre strict dans le script : fonction avant policies |
| Compte referent_sociopro créé avant le SQL | Bloquant | SQL d'abord, attribution des rôles ensuite |
| Cache navigateur avec l'ancien app.js | Moyen | Incrémenter ?v=N sur tous les scripts modifiés |
