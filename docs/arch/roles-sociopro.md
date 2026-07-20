# Architecture — Refonte rôles socio-pro

> Agent : Architect · 2026-07-20

---

## 1. Décision technique globale

**Option retenue : migration en place + renommage sémantique.**

Pas de nouveau fichier HTML. Pas de nouveau schéma de tables. Seulement :
- Renommage de la valeur de rôle en DB (`cellule` → `referent_sociopro`)
- Renommage de la fonction SQL RLS (`is_cellule()` → `is_sociopro_membre()`)
- Mise à jour du routing JS (`app.js`, `index.html`, `fenix-sociopro.html`)
- Suppression de l'ancienne fonction SQL après migration complète

---

## 2. Alternatives rejetées

| Alternative | Raison du rejet |
|-------------|----------------|
| Deux fichiers HTML (fenix-sociopro-referent.html + fenix-sociopro-coach.html) | Duplication complète du code JS — maintenance x2 pour une différence d'un bouton |
| Garder le nom `cellule` avec un alias | Confusion sémantique persistante dans le code et les policies RLS |
| Créer un rôle `referent` (sans `_sociopro`) | Trop générique — risque de confusion si d'autres types de référents apparaissent |
| is_cellule() étend ses conditions au lieu d'être renommée | Le nom ne reflète plus la réalité — crée de la dette de lecture |

---

## 3. Impact sur l'existant

### `js/app.js` (v44 → v45)
```javascript
// Routing post-login (index.html) et requireAuth()
// AVANT :
else if (role === 'cellule') window.location.href = 'fenix-sociopro.html';

// APRÈS :
else if (role === 'referent_sociopro' || role === 'cellule') window.location.href = 'fenix-sociopro.html';
// Note : compatibilité 'cellule' maintenue pendant la fenêtre de migration
```

### `fenix-sociopro.html` (v2 → v3)
```javascript
// AVANT :
const auth = await requireAuth(['cellule', 'coach']);

// APRÈS :
const auth = await requireAuth(['referent_sociopro', 'cellule', 'coach']);
// 'cellule' en compatibilité transitoire — retiré après migration SQL confirmée
```

### `index.html`
```javascript
// AVANT :
else if (role === 'cellule') window.location.href = 'fenix-sociopro.html';

// APRÈS :
else if (role === 'referent_sociopro' || role === 'cellule') window.location.href = 'fenix-sociopro.html';
```

### `pages/sociopro-dashboard.js` (v2 → v3)
```javascript
// _spRole est déjà lu depuis window._spRole
// Le check 'coach' vs autre rôle dans initSocioPro reste inchangé
// Aucune logique ne vérifie explicitement 'cellule' — transparent au renommage
```

### Supabase SQL — étapes séquencées

**Étape A (après déploiement code) :**
```sql
-- 1. Créer la nouvelle fonction
CREATE OR REPLACE FUNCTION is_sociopro_membre()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('referent_sociopro', 'coach')
  );
$$;

-- 2. Reconstruire toutes les policies RLS
-- (détail dans STORY-19)

-- 3. Migrer les comptes
UPDATE user_profiles SET role = 'referent_sociopro' WHERE role = 'cellule';

-- 4. Supprimer l'ancienne fonction (après vérification)
DROP FUNCTION IF EXISTS is_cellule();
```

**Tables impactées par le renommage des policies :**
- `ssp_profils`
- `ssp_orientations`
- `ssp_entretiens`
- `ssp_reprises`
- `ssp_actions_reunion`

---

## 4. Nouvelles structures de données

Aucune. La colonne `user_profiles.role` accepte déjà des valeurs TEXT libres — pas de contrainte ENUM à modifier.

---

## 5. Séquençage critique (ordre de déploiement)

```
1. Code déployé (app.js v45 + fenix-sociopro.html v3)
   → Supporte 'referent_sociopro' ET 'cellule' (compatibilité)
   
2. SQL Étape A exécutée
   → is_sociopro_membre() créée, policies reconstruites, rôles migrés
   
3. Vérification : Marion/Mathilde/Alain peuvent se connecter et accéder au module
   
4. Code nettoyé (retirer la compatibilité 'cellule' des requireAuth)
   → fenix-sociopro.html : requireAuth(['referent_sociopro', 'coach'])
   → app.js : retirer la branche 'cellule'
   
5. is_cellule() supprimée
```

---

## 6. Fonctions/modules impactés

| Fichier | Fonction | Changement |
|---------|----------|------------|
| `js/app.js` | `requireAuth()` | Ajouter `referent_sociopro` dans la branche de routing |
| `index.html` | inline script login | Ajouter `referent_sociopro` dans la branche de routing |
| `fenix-sociopro.html` | `requireAuth()` call | Ajouter `referent_sociopro` dans le tableau |
| SQL | `is_cellule()` | Renommer en `is_sociopro_membre()` |
| SQL | Toutes policies ssp_* | Remplacer `is_cellule()` par `is_sociopro_membre()` |
| SQL | `user_profiles.role` | UPDATE les comptes concernés |

---

## 7. Ce qui NE change pas

- Structure des tables `ssp_*` — inchangée
- Structure de `user_profiles` — inchangée (role TEXT, pas d'ENUM)
- `sociopro-dashboard.js` — logique interne inchangée (window._spRole déjà découplé)
- `sociopro-player.js` — inchangé (ne vérifie aucun rôle)
- `player.html`, `coach.html` — nav socio-pro déjà en place

---

## 8. Critère de bascule vers une refonte structurelle

Si le nombre de rôles dépasse 5 ou si des permissions granulaires par feature émergent (ex : "un référent peut voir le radar mais pas les notes"), envisager un système RBAC avec une table `permissions` distincte. Pour l'instant, la colonne `role` TEXT dans `user_profiles` est suffisante.
