# QA-20 — STORY-18 : Routing referent_sociopro

> Agent : QA · 2026-07-21

---

## Critères d'acceptation — vérification exhaustive

### Routing dans `requireAuth()` (app.js)

| Critère | Fichier:ligne | Résultat |
|---------|---------------|----------|
| Branche `'cellule'` remplacée par `'referent_sociopro'` | `js/app.js:30` | ✅ |
| Routing post-requireAuth : `referent_sociopro` → `fenix-sociopro.html` | `js/app.js:30` | ✅ |

### index.html — post-login

| Critère | Fichier:ligne | Résultat |
|---------|---------------|----------|
| `role === 'referent_sociopro'` → `fenix-sociopro.html` | `index.html:220` | ✅ |
| `'cellule'` absent du script de login | `index.html` | ✅ |

### fenix-sociopro.html

| Critère | Fichier:ligne | Résultat |
|---------|---------------|----------|
| `requireAuth(['referent_sociopro', 'coach'])` sans `'cellule'` | `fenix-sociopro.html:121` | ✅ |

### sociopro-dashboard.js

| Critère | Fichier:ligne | Résultat |
|---------|---------------|----------|
| `let _spRole = 'referent_sociopro'` | `sociopro-dashboard.js:8` | ✅ |
| `_spRole = window._spRole \|\| 'referent_sociopro'` | `sociopro-dashboard.js:23` | ✅ |

### Scénarios de redirection

| Scénario | Comportement codé | Attendu | OK ? |
|----------|------------------|---------|------|
| `referent_sociopro` sur `coach.html` | redirigé → `fenix-sociopro.html` | ✅ | ✅ |
| `joueur` sur `fenix-sociopro.html` | redirigé → `player.html` | ✅ | ✅ |
| `coach` sur `fenix-sociopro.html` | accès accordé | ✅ | ✅ |
| Sans session | redirigé → `index.html` | ✅ | ✅ |

### Cache-busting — versions

| Fichier modifié | Version | Mis à jour dans | OK ? |
|-----------------|---------|-----------------|------|
| `js/app.js` | v45 | index.html, coach.html, player.html, fenix-sociopro.html | ✅ |
| `pages/sociopro-dashboard.js` | v3 | fenix-sociopro.html | ✅ |

### Grep de contrôle — aucun check de rôle `'cellule'` dans le code exécutable

Occurrences `cellule` restantes : uniquement labels UI (`🔒 Notes cellule`, `Démarches cellule...`) et noms de colonne SQL (`notes_cellule`) dans `sociopro-dashboard.js` — conforme à la hors-scope clause.

---

## Bugs trouvés

Aucun.

---

## Régressions détectées

Aucune — les fichiers `coach.html` et `player.html` n'ont reçu que la mise à jour de version `app.js?v=44→v45`. Leur logique est inchangée.

---

## Verdict

**PASSED**

Tous les critères d'acceptation de STORY-18 sont satisfaits. Aucun bug, aucune régression.
