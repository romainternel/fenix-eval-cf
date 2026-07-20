# STORY-18 — Routing et auth : rôle referent_sociopro

**En tant que** référente socio-pro (Marion, Mathilde ou Alain),
**Je veux** me connecter et arriver directement sur le module socio-pro,
**Afin d'** accéder à mon espace de travail sans passer par le dashboard CF ni voir de page d'erreur.

---

## Contexte technique

Le code actuel route `'cellule'` → fenix-sociopro.html, mais le rôle décidé est `'referent_sociopro'`. Il n'existe aucun compte `'cellule'` en base (Supabase vierge côté socio-pro), donc pas de migration — on remplace directement.

Fichiers à modifier :
- `js/app.js` (v44 → v45)
- `index.html` (script de login inline)
- `fenix-sociopro.html` (v2 → v3)
- `pages/sociopro-dashboard.js` (v2 → v3)

---

## Critères d'acceptation

- [ ] Dans `js/app.js`, `requireAuth()` : la branche `'cellule'` est remplacée par `'referent_sociopro'`
- [ ] Dans `js/app.js`, routing post-requireAuth : `role === 'referent_sociopro'` → `fenix-sociopro.html`
- [ ] Dans `index.html`, script de login : `role === 'referent_sociopro'` → `fenix-sociopro.html` (retirer `'cellule'`)
- [ ] Dans `fenix-sociopro.html` : `requireAuth(['referent_sociopro', 'coach'])` — sans `'cellule'`
- [ ] Dans `pages/sociopro-dashboard.js` : `let _spRole = 'referent_sociopro'` (plus `'cellule'`) et `_spRole = window._spRole || 'referent_sociopro'`
- [ ] Un utilisateur `referent_sociopro` qui accède à `coach.html` est redirigé vers `fenix-sociopro.html`
- [ ] Un utilisateur `joueur` qui accède à `fenix-sociopro.html` est redirigé vers `player.html`
- [ ] Un utilisateur `coach` qui accède à `fenix-sociopro.html` arrive bien sur la page (pas redirigé)
- [ ] Les versions `?v=N` sont incrémentées dans **tous** les HTML qui chargent les fichiers modifiés (coach.html, player.html, fenix-sociopro.html, index.html)
- [ ] La recherche `grep -r "cellule"` dans le code ne retourne plus que des occurrences cosmétiques (labels UI comme "Notes cellule", "Démarches cellule") — aucun check de rôle

---

## Hors scope

- Pas de création de comptes ni de modification SQL
- Pas de modification des 4 vues socio-pro (liste, fiche, entretien, réunion)
- Le label UI "🔒 Notes cellule" reste inchangé (c'est du texte, pas un rôle)

---

## Dépend de

Aucune (peut être développée et déployée avant le SQL).

## Taille

S
