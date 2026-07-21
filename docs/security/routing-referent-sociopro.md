# Security Audit — Routing referent_sociopro (STORY-18)

> Auditor : Security Access Auditor · 2026-07-21

---

## Périmètre

Vérification du routing et de l'authentification pour le nouveau rôle `referent_sociopro`. Pas de nouvelles tables backend dans cette story (STORY-19 les crée) — l'audit porte exclusivement sur les vérifications côté client.

---

## Findings

### Aucun finding Critique

### Mineur — M1 : Rôle vérifié uniquement côté client

**Ressource :** `fenix-sociopro.html`

**Observation :** `requireAuth(['referent_sociopro', 'coach'])` est une vérification JS côté navigateur. Un utilisateur de rôle `joueur` qui désactive JS ou intercepte la réponse du SDK peut contourner la redirection et rester sur la page.

**Impact réel :** Les tables `ssp_*` n'existent pas encore (STORY-19). Une fois créées, elles seront protégées par RLS Supabase (`is_sociopro_membre()`) — toute requête directe d'un joueur retournera 0 lignes. La redirection JS est donc une protection d'UX, pas la protection de sécurité réelle.

**Statut :** Acceptable. La vraie barrière est la RLS (STORY-19). Documenté.

### Mineur — M2 : `getRole()` sans gestion d'erreur réseau

**Ressource :** `js/app.js` — `getRole()`

**Observation :** Si la requête Supabase échoue (réseau coupé), `data?.role ?? 'joueur'` retourne `'joueur'` par défaut. Un `referent_sociopro` en situation de réseau instable sera redirigé vers `player.html` plutôt que de voir une erreur explicite.

**Impact :** UX dégradée, pas de fuite de données. Acceptable en l'état (comportement fail-safe vers le rôle le moins privilégié).

---

## Vérification des rôles (simulation)

| Scénario | Résultat attendu | Conforme ? |
|----------|-----------------|-----------|
| `referent_sociopro` accède `coach.html` | redirigé → `fenix-sociopro.html` | ✅ |
| `joueur` accède `fenix-sociopro.html` | redirigé → `player.html` | ✅ |
| `coach` accède `fenix-sociopro.html` | accès autorisé | ✅ |
| `referent_sociopro` accède `fenix-sociopro.html` | accès autorisé | ✅ |
| Sans session accède n'importe quelle page | redirigé → `index.html` | ✅ |

---

## Verdict

**Aucun finding Critique. STORY-18 peut passer en QA.**

> Note pour STORY-19 : la création de `is_sociopro_membre()` avec `SECURITY DEFINER` est la vraie barrière de sécurité — veiller à ce que la fonction soit créée AVANT les policies RLS (R1 du Risk Analyst).
