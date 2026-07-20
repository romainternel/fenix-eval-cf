# STORY-18 — Routing et auth : support du rôle referent_sociopro

**En tant que** référente socio-pro (Marion, Mathilde ou Alain),
**Je veux** me connecter et arriver directement sur le module socio-pro,
**Afin de** ne pas être bloquée si mon rôle est renommé de `cellule` à `referent_sociopro` en base.

---

## Contexte technique

- Zone concernée : `js/app.js`, `index.html`, `fenix-sociopro.html`, `pages/sociopro-dashboard.js`
- Cette story doit être **déployée en production AVANT** l'exécution du SQL de la STORY-19
- La compatibilité `cellule` doit rester active dans ce livrable (retirée dans une story de nettoyage ultérieure)
- Versions à incrémenter : app.js → v45, fenix-sociopro.html → v3, sociopro-dashboard.js → v3

---

## Critères d'acceptation

- [ ] Dans `app.js` (routing post-login et `requireAuth`) : `role === 'referent_sociopro'` redirige vers `fenix-sociopro.html` — au même titre que `cellule`
- [ ] Dans `index.html` (script de login) : branche `referent_sociopro` redirige vers `fenix-sociopro.html`
- [ ] Dans `fenix-sociopro.html` : `requireAuth(['referent_sociopro', 'cellule', 'coach'])` (compatibilité transitoire)
- [ ] Dans `sociopro-dashboard.js` : `initSocioPro` vérifie `_spRole === 'coach'` pour afficher le lien retour — un `referent_sociopro` ne voit PAS ce lien
- [ ] Les versions `?v=N` des fichiers modifiés sont incrémentées dans tous les HTML qui les chargent
- [ ] Un coach (`role = 'coach'`) arrive toujours sur `coach.html` au login
- [ ] Un joueur qui accède manuellement à `fenix-sociopro.html` est redirigé vers `player.html`

---

## Hors scope

- Pas de modification SQL (aucun `role = 'referent_sociopro'` n'existe encore en base à ce stade)
- Pas de retrait de la compatibilité `cellule` (ce sera une story de nettoyage après STORY-19)
- Pas de modification des vues socio-pro (liste, fiche, entretien, réunion)

---

## Dépend de

Aucune — point de départ du cycle.

## Taille

S
