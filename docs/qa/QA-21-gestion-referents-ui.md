# QA-21 — STORY-21 : UI gestion des référents socio-pro

> Agent : QA · 2026-07-21

---

## Critères d'acceptation — vérification exhaustive

### UI — onglet Coachs

| Critère | Localisation | Résultat |
|---------|-------------|----------|
| Deux sections "Coachs" et "Référents socio-pro" | `renderCoachs()` lignes 2233/2240 | ✅ |
| Note rappelant Coach = tout / Référent = socio-pro uniquement | `renderCoachs()` lignes 2227-2231 | ✅ |
| Message "Aucun référent pour l'instant" si liste vide | `renderCoachs()` ligne 2242-2244 | ✅ |
| Bouton "+ Ajouter un référent" | `renderCoachs()` ligne 2245 | ✅ |

### Modal création référent

| Critère | Localisation | Résultat |
|---------|-------------|----------|
| Modal s'ouvre via `showCreateReferentModal()` | ligne 2258 | ✅ |
| Note "Accès socio-pro uniquement" dans le modal | ligne 2268 | ✅ |
| Champs Prénom, Nom, Email, Mot de passe + show/hide | lignes 2271-2290 | ✅ |
| Validation mot de passe min. 5 caractères | ligne 2319 | ✅ |
| Fermeture en cliquant sur overlay | ligne 2299-2301 | ✅ |
| Focus sur prénom à l'ouverture | ligne 2302 | ✅ |

### Création — appel Edge Function

| Critère | Localisation | Résultat |
|---------|-------------|----------|
| `role: 'referent_sociopro'` envoyé dans le body | `submitCreateReferent()` ligne 2337 | ✅ |
| Toast "Référent ajouté avec succès" | ligne 2353 | ✅ |
| Liste rechargée après création | ligne 2354 | ✅ |
| Gestion erreur email déjà utilisé | lignes 2342-2344 | ✅ |

### Suppression

| Critère | Localisation | Résultat |
|---------|-------------|----------|
| `deleteReferent` avec confirmation | ligne 2365 | ✅ |
| Envoi `user_id` (nouveau param) | ligne 2377 | ✅ |
| Toast "Référent supprimé" | ligne 2386 | ✅ |
| Liste rechargée après suppression | ligne 2387 | ✅ |

### Edge Function

| Critère | Localisation | Résultat |
|---------|-------------|----------|
| POST accepte `role` optionnel (défaut 'coach') | `index.ts` ligne 50 | ✅ |
| Validation role IN ['coach', 'referent_sociopro'] | `index.ts` ligne 54 | ✅ |
| `upsert` avec `role: reqRole` | `index.ts` ligne 67 | ✅ |
| DELETE accepte `user_id` ou `coach_user_id` | `index.ts` ligne 79 | ✅ |
| DELETE vérifie role IN ['coach', 'referent_sociopro'] | `index.ts` ligne 88 | ✅ |
| Rétrocompatibilité `deleteCoach` (coach_user_id) | `index.ts` ligne 79 | ✅ |

### Cache-busting

| Fichier | Version | coach.html | OK ? |
|---------|---------|-----------|------|
| `coach-dashboard.js` | v83 | ✅ | ✅ |

---

## Cas limites

| Cas | Comportement | OK ? |
|-----|-------------|------|
| Créer un référent avec email déjà existant | Message "Cet email est déjà utilisé" | ✅ |
| Mot de passe < 5 car. | Erreur affichée, pas d'appel réseau | ✅ |
| Réseau coupé pendant création | Message d'erreur réseau, bouton réactivé | ✅ |
| Section référents au premier chargement (liste vide) | "Aucun référent pour l'instant" | ✅ |

---

## Bugs trouvés

Aucun.

---

## Régressions potentielles

- `deleteCoach` envoie `{ coach_user_id }` — toujours supporté par la Edge Function (compat `body.user_id || body.coach_user_id`). ✅ RAS.
- `submitCreateCoach` n'envoie pas de `role` — Edge Function utilise le défaut `'coach'`. ✅ RAS.

---

## Verdict

**PASSED**

Tous les critères validés. Aucun bug, aucune régression identifiée.
