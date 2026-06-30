# Architecture — Gestion des comptes coachs

> Agent : Architect | Date : 2026-06-30 | Feature : gestion-coachs
> Source : docs/prd.md + docs/design/gestion-coachs.md + CLAUDE.md

---

## 1. Décision technique

### Approche retenue : nouvelle Edge Function `manage-coach-account` + colonnes ajoutées à `user_profiles`

**Principe** : reproduire le pattern de `create-player-account` pour les coachs, dans une Edge Function séparée, avec un schéma enrichi pour permettre l'affichage des noms sans requêtes admin.

**4 composants impactés :**
1. `user_profiles` (table SQL) — ajout colonnes `nom`, `prenom`, `email`
2. `supabase/functions/manage-coach-account/index.ts` — nouvelle Edge Function
3. `pages/coach-dashboard.js` — nouvelles fonctions + tab
4. `coach.html` — 3e onglet + `showTab()` étendu
5. `css/fenix.css` — 1 nouvelle classe `.coach-you-badge`

---

## 2. Pourquoi (alternatives rejetées)

### Option A (rejetée) : Étendre `create-player-account` avec un paramètre `role`
- Ajouter `role` au body POST et brancher selon la valeur
- **Rejetée** : le nom de la fonction devient trompeur, la logique joueur/coach mélangée, et le comportement DELETE change (joueur = par `player_id`, coach = par `user_id`). Deux cas trop distincts pour un même endpoint.

### Option B (rejetée) : Utiliser le SDK Supabase Admin directement depuis le frontend
- Exposer la `service_role_key` dans le code frontend pour appeler `auth.admin.createUser()`
- **Rejetée immédiatement** : la Service Role Key ne doit JAMAIS être exposée côté client. Risque critique de sécurité.

### Option C retenue : Edge Function `manage-coach-account` dédiée
- Pattern identique à `create-player-account` : garde coach, admin client, opérations atomiques
- **Retenue** : séparation claire des responsabilités, auditabilité, cohérence avec l'existant

---

## 3. Impact sur l'existant

### `user_profiles` (SQL)
**Avant :**
```sql
id         UUID PK  (FK → auth.users ON DELETE CASCADE)
role       TEXT
player_id  UUID nullable (FK → players.id)
```

**Après — migration à appliquer :**
```sql
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS nom    TEXT,
  ADD COLUMN IF NOT EXISTS prenom TEXT,
  ADD COLUMN IF NOT EXISTS email  TEXT;
```

- Colonnes nullable → zéro impact sur les lignes existantes (joueurs et coach actuel)
- Pas de contrainte unique sur `email` — la contrainte d'unicité est déjà dans `auth.users`
- RLS inchangée — les policies existantes couvrent le cas

**Vérification RLS requise (STORY-10)** : la policy `SELECT` sur `user_profiles` doit permettre à un coach de lire TOUTES les lignes (pas seulement la sienne). Policy actuelle : "self or coach" → un coach peut lire toutes les lignes. ✅ À confirmer en base.

### `create-player-account` (Edge Function existante)
**Aucun changement.** La nouvelle fonction est indépendante.

### `coach-dashboard.js`
**Ajouts (pas de modification de l'existant) :**
- Global : `_coaches = []` — état de la liste des coachs en mémoire
- `renderCoachs()` — fetch + render liste
- `showCreateCoachModal()` — modal de création
- `submitCreateCoach(e)` — appel Edge Function POST
- `deleteCoach(coachUserId, displayName)` — confirm + appel Edge Function DELETE
- `coachCardHTML(coach)` — générateur HTML d'une carte coach

**Modification de l'existant :**
- Aucune modification des fonctions existantes
- Ajout du cas `'coachs'` dans la fonction `showTab()` dans `coach.html`

### `coach.html`
**Ajout du bouton onglet :**
```html
<button class="tab-btn" onclick="showTab('coachs')" id="tab-coachs">Coachs</button>
```
**Extension de `showTab()` :**
```javascript
if (tab === 'coachs') renderCoachs();
```

### `css/fenix.css`
**Ajout d'une seule classe :**
```css
.coach-you-badge { /* 6 lignes */ }
```

---

## 4. Nouvelle structure de données

### Colonnes ajoutées à `user_profiles`

| Colonne | Type | Nullable | Rôle |
|---------|------|----------|------|
| `nom` | TEXT | Oui | Nom de famille du coach (affiché dans la liste) |
| `prenom` | TEXT | Oui | Prénom du coach |
| `email` | TEXT | Oui | Email dupliqué depuis auth.users (affichage sans admin) |

**Pourquoi stocker `email` dans `user_profiles` ?**
Le SDK Supabase côté client avec la clé anon ne peut pas lister les emails des autres utilisateurs (`auth.users` n'est pas accessible). Pour afficher l'email dans la liste des coachs sans passer par une Edge Function ou l'admin, on le dénormalise dans `user_profiles`. Risque d'obsolescence si l'email change dans Auth, mais acceptable car :
1. En v1, l'édition d'email n'est pas dans le scope
2. Un co-coach dont l'email change doit être supprimé et recréé (workflow explicite)

---

## 5. Nouvelles fonctions

### Edge Function : `supabase/functions/manage-coach-account/index.ts`

Structure identique à `create-player-account/index.ts` :

```typescript
// Garde identique : getAdminAndCoach() vérifie que l'appelant est un coach

// POST { email, password, nom, prenom }
//   → admin.auth.admin.createUser({ email, password, user_metadata: { nom, prenom }, email_confirm: true })
//   → admin.from('user_profiles').insert({ id: newUser.id, role: 'coach', nom, prenom, email })
//   → return { success: true }

// DELETE { coach_user_id }
//   → Vérifier que coach_user_id !== caller id (protection auto-suppression côté Edge Function)
//   → admin.from('user_profiles').delete().eq('id', coach_user_id)  // explicite avant cascade
//   → admin.auth.admin.deleteUser(coach_user_id)
//   → return { success: true }

// Méthodes supportées : POST, DELETE, OPTIONS
// CORS : identique à create-player-account
```

**Note sur la cascade** : on supprime explicitement user_profiles AVANT de supprimer le user auth, même si la FK est `ON DELETE CASCADE`, pour garantir la cohérence dans tous les environnements Supabase (le CASCADE n'est pas garanti selon la version de migration).

### Fonctions JS dans `coach-dashboard.js`

```javascript
// Nouvelles variables globales
let _coaches = []

// Fetch + render
async function renderCoachs() { ... }

// HTML generator
function coachCardHTML(coach) { ... }  // retourne string HTML

// Modal
function showCreateCoachModal() { ... }
async function submitCreateCoach(e) { ... }

// Suppression
async function deleteCoach(coachUserId, displayName) { ... }
```

**Appel Edge Function depuis le frontend** (même pattern que create-player-account) :
```javascript
const { data: { session } } = await db.auth.getSession()
const res = await fetch(
  'https://wyiylqvreuippmcrzwat.supabase.co/functions/v1/manage-coach-account',
  {
    method: 'POST', // ou 'DELETE'
    headers: {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password, nom, prenom })
  }
)
```

---

## 6. Risques techniques

| Risque | Probabilité | Mitigation |
|--------|------------|-----------|
| RLS trop restrictive sur SELECT user_profiles | Faible | Vérifier la policy en STORY-10 avant tout dev frontend |
| user_profiles non cascadé sur delete auth user | Faible | Suppression explicite dans Edge Function avant deleteUser() |
| Ancien compte coach sans nom/prenom dans user_profiles | Certaine | Les colonnes sont nullable — afficher "Coach" par défaut si nom null |
| Email déjà pris dans Auth | Faible | Géré par l'erreur API + toast lisible |
| Déploiement Edge Function oublié | Possible | Inclus dans les critères d'acceptation de STORY-10 |

---

## 7. Critère de bascule vers refonte

Cette architecture reste valide tant que le nombre de coachs est < 20. Au-delà (hypothèse très unlikely pour un club CF), une table `coaches` dédiée serait justifiée pour la lisibilité. Pour l'instant : surcoût inutile.

---

## 8. Versions à incrémenter

| Fichier modifié | Version actuelle | Nouvelle version |
|-----------------|-----------------|-----------------|
| `css/fenix.css` | v=47 | v=48 |
| `pages/coach-dashboard.js` | v=39 | v=40 |
| `coach.html` | (script refs) | Incrémenter les refs v=48 / v=40 |

`js/app.js`, `js/criteria-data.js`, `js/supabase-client.js`, `pages/player-home.js` : **non touchés**.
