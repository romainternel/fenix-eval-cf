# STORY-20 — Nettoyage : retrait de la compatibilité transitoire `cellule`

**En tant que** développeur du projet,
**Je veux** retirer les références résiduelles au rôle `cellule` du code,
**Afin de** avoir un code propre qui reflète exactement les rôles actifs (`joueur`, `referent_sociopro`, `coach`).

---

## Contexte technique

- Zone concernée : `js/app.js`, `index.html`, `fenix-sociopro.html`
- Cette story ne peut être exécutée qu'après confirmation que `SELECT COUNT(*) FROM user_profiles WHERE role = 'cellule'` retourne 0
- Versions à incrémenter : app.js → v46, fenix-sociopro.html → v4

---

## Critères d'acceptation

- [ ] Dans `app.js` : la branche `role === 'cellule'` est supprimée du routing — seul `referent_sociopro` redirige vers fenix-sociopro.html
- [ ] Dans `index.html` : idem — branche `cellule` supprimée du script de login
- [ ] Dans `fenix-sociopro.html` : `requireAuth(['referent_sociopro', 'coach'])` — `cellule` retiré du tableau
- [ ] `CLAUDE.md` mis à jour : section Authentification et rôles reflète les 3 rôles exacts avec leur page et périmètre
- [ ] Les versions `?v=N` des fichiers modifiés sont incrémentées
- [ ] Un compte avec `role = 'cellule'` (si un est retrouvé) ne peut plus accéder à fenix-sociopro.html (le comportement par défaut de requireAuth le redirige vers player.html — signalant une config manquante)

---

## Hors scope

- Pas de modification des tables SQL (déjà faite en STORY-19)
- Pas de modification des vues socio-pro

---

## Dépend de

**STORY-19 exécutée et vérifiée** (0 comptes `cellule` en base).

## Taille

XS
