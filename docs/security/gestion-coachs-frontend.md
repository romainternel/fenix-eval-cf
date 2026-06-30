# Audit Sécurité — Gestion des coachs Frontend (STORY-11)

> Agent : Security Access Auditor | Date : 2026-06-30
> Périmètre : `coach.html`, `css/fenix.css`, `pages/coach-dashboard.js`

---

## Contexte

STORY-11 est une story frontend. La sécurité métier (création/suppression de comptes, vérification des rôles) est entièrement déléguée à l'Edge Function `manage-coach-account` auditée dans `docs/security/gestion-coachs.md` (STORY-10). Cette audit se concentre sur ce que le code frontend expose ou permet côté client.

---

## Vérifications

| Point | Statut | Détail |
|-------|--------|--------|
| Aucun secret dans le code frontend | ✅ | Seule l'`access_token` de la session utilisateur est transmise — c'est le comportement attendu |
| Bearer token récupéré correctement | ✅ | `(await window.supabaseClient.auth.getSession()).data.session.access_token` — pattern identique à `create-player-account` |
| Données affichées vs données reçues | ✅ | La query sélectionne `id, role, nom, prenom, email` mais `email` n'est jamais affiché dans le HTML généré — pas d'exposition involontaire |
| Bouton "Supprimer" absent pour soi | ✅ | Guard `isSelf` côté frontend (en plus de la garde Edge Function côté serveur) — double protection |
| Le frontend peut-il contourner la garde de rôle ? | ✅ Non | Un joueur arrivant sur `coach.html` est redirigé par `requireAuth('coach')` avant l'init |
| XSS sur les noms de coachs | ✅ | `escHtml()` appliqué sur `displayName` dans `coachCardHTML` avant injection dans HTML |
| XSS sur les messages d'erreur | ✅ | Erreurs API affichées via `errEl.textContent` (pas `innerHTML`) ou `showToast(result.error)` où `showToast` utilise `.textContent` |

---

## Findings

**Aucun finding Critique. Aucun finding Majeur. Aucun finding Mineur.**

La story est frontend-only, délègue l'autorisation à l'Edge Function, et utilise correctement les guards existants (`requireAuth`, `is_coach()` côté RLS).

---

## Verdict

**Feu vert — Aucun finding bloquant.**
