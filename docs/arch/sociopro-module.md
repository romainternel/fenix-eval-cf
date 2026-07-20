# Architecture — Module Socio-Pro

> Agent : Architect · 2026-07-20

---

## 1. Vue d'ensemble

Le module socio-pro est une **extension verticale** de l'app existante : même stack (Supabase + vanilla JS), même domaine GitHub Pages, même fichier de styles. Il s'ajoute sans modifier l'infrastructure existante.

**Ce qui manque pour qu'il fonctionne :**
1. Les tables SQL dans Supabase (à créer)
2. Le routing JS pour le rôle `referent_sociopro` (à corriger — actuellement code encore sur `'cellule'`)

---

## 2. Décisions techniques

### D1 — Un seul fichier HTML partagé (fenix-sociopro.html)

**Raison :** coach et referent_sociopro voient exactement les mêmes 4 vues. La seule différence est le bouton "← Coach" dans la nav, affiché conditionnellement via `window._spRole`. Deux fichiers HTML doubleraient la surface de maintenance pour un delta d'un bouton.

**Alternative rejetée :** fenix-sociopro-coach.html + fenix-sociopro-referent.html → rejeté car duplication totale à chaque évolution du module.

### D2 — Fonction SQL `is_sociopro_membre()` (et non `is_cellule()`)

**Raison :** le nom `is_cellule()` était lié à l'ancien rôle `'cellule'`. Le module concerne désormais deux rôles distincts. Un nom sémantiquement juste évite la confusion lors des audits de policies RLS.

```sql
CREATE OR REPLACE FUNCTION is_sociopro_membre()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('referent_sociopro', 'coach')
  );
$$;
```

### D3 — Routing par rôle dans app.js (sans compatibilité `cellule`)

Puisque aucun compte `cellule` n'existe en base (Supabase vierge côté socio-pro), il n'y a aucun compte à migrer. On déploie directement avec `referent_sociopro` sans compatibilité transitoire.

```javascript
// app.js — requireAuth() et routing post-login
if      (role === 'coach')             window.location.href = 'coach.html';
else if (role === 'referent_sociopro') window.location.href = 'fenix-sociopro.html';
else                                    window.location.href = 'player.html';
```

```javascript
// fenix-sociopro.html
const auth = await requireAuth(['referent_sociopro', 'coach']);
```

### D4 — Joueur_id bridge : `auth.users.id` ≠ `players.id`

Les tables ssp_* utilisent `joueur_id UUID REFERENCES auth.users(id)` — c'est l'ID Supabase Auth, pas l'ID de la table `players`.

Le bridge est dans `user_profiles` : `user_profiles.id = auth.users.id` et `user_profiles.player_id = players.id`.

La query `spLoadJoueurs()` joint les deux :
```javascript
// players → authIdMap via user_profiles.player_id
// authIdMap[players.id] = auth.users.id
// Utilisé ensuite pour toutes les queries ssp_*
```

### D5 — RLS : séparation des droits lecture joueur

Les joueurs peuvent lire leurs propres entretiens mais **le code JS ne sélectionne jamais** `notes_cellule` ni `couleur_justification` côté joueur. C'est un choix délibéré : la RLS ne peut pas cacher des colonnes, donc le filtrage est côté client dans `sociopro-player.js`.

---

## 3. Schéma SQL complet

### Tables

```sql
ssp_profils (
  id UUID PK,
  joueur_id UUID → auth.users(id) CASCADE, UNIQUE,
  formation TEXT, projet_pro TEXT, referent TEXT,
  tuteur TEXT, contrat_scolarite TEXT DEFAULT 'a_jour',
  lien_drive TEXT, notes_profil TEXT,
  created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
)

ssp_orientations (
  id UUID PK,
  joueur_id UUID → auth.users(id) CASCADE,
  date_changement DATE NOT NULL,
  formation TEXT, projet_pro TEXT, note TEXT,
  created_at TIMESTAMPTZ
)

ssp_entretiens (
  id UUID PK,
  joueur_id UUID → auth.users(id) CASCADE,
  date DATE NOT NULL,
  mene_par TEXT, mot_du_joueur TEXT,
  ce_qui_va TEXT, ce_qui_ne_va_pas TEXT,
  echeances TEXT, comment_aider TEXT,
  actions_suivant JSONB DEFAULT '[]',
  examens JSONB DEFAULT '[]',
  commentaire_examens TEXT,
  notes_cellule TEXT,          ← jamais lu côté joueur
  couleur TEXT CHECK IN ('vert','orange','rouge'),
  couleur_justification TEXT,  ← jamais lu côté joueur
  created_at TIMESTAMPTZ,
  created_by UUID → auth.users(id)
)

ssp_reprises (
  id UUID PK,
  entretien_id UUID → ssp_entretiens(id) CASCADE,
  action TEXT,
  statut TEXT CHECK IN ('fait','en_cours','non_fait')
)

ssp_actions_reunion (
  id UUID PK,
  date_reunion DATE DEFAULT CURRENT_DATE,
  joueur_id UUID → auth.users(id) SET NULL,  ← nullable (action collective)
  action TEXT NOT NULL,
  responsable TEXT,
  statut TEXT DEFAULT 'a_faire' CHECK IN ('a_faire','en_cours','fait'),
  created_at TIMESTAMPTZ
)
```

### Policies RLS

```
Règle : is_sociopro_membre() = TRUE pour coach ET referent_sociopro

ssp_profils :
  - sp_membre_all_profils  : is_sociopro_membre() → FOR ALL
  - sp_joueur_own_profil   : joueur_id = auth.uid() → FOR SELECT

ssp_orientations :
  - sp_membre_all_orientations : is_sociopro_membre() → FOR ALL
  - sp_joueur_own_orientations : joueur_id = auth.uid() → FOR SELECT

ssp_entretiens :
  - sp_membre_all_entretiens : is_sociopro_membre() → FOR ALL
  - sp_joueur_own_entretiens : joueur_id = auth.uid() → FOR SELECT

ssp_reprises :
  - sp_membre_all_reprises : is_sociopro_membre() → FOR ALL
  - sp_joueur_own_reprises : EXISTS(ssp_entretiens WHERE joueur_id = auth.uid()) → FOR SELECT

ssp_actions_reunion :
  - sp_membre_all_actions_reunion : is_sociopro_membre() → FOR ALL
  (joueurs : aucun accès)
```

---

## 4. Fichiers impactés et responsabilités

| Fichier | Changement | Raison |
|---------|------------|--------|
| `supabase-sociopro.sql` | Réécriture propre avec `is_sociopro_membre()` | SQL jamais exécuté → partir propre |
| `js/app.js` v44→v45 | `'cellule'` → `'referent_sociopro'` dans routing | Nom de rôle mis à jour |
| `index.html` | Idem | Cohérence post-login |
| `fenix-sociopro.html` v2→v3 | `requireAuth(['referent_sociopro','coach'])` | Retirer `'cellule'` |
| `pages/sociopro-dashboard.js` v2→v3 | `_spRole = 'referent_sociopro'` par défaut | Valeur par défaut cohérente |
| `coach.html` | Tab "Socio-Pro ↗" (déjà en place) | Vérifier/valider |
| `player.html` | Onglet "Mon suivi" (déjà en place) | Vérifier/valider |

---

## 5. Ce qui NE change pas

- Structure de `user_profiles` (pas d'ENUM, TEXT libre pour `role`)
- `fenix.css` — aucune modification globale
- Les 4 vues du module (liste, fiche, entretien, réunion) — code existant validé
- `sociopro-player.js` — logique inchangée, pas de références à 'cellule'
- Tables CF existantes (`evaluations`, `sessions`, etc.) — totalement séparées

---

## 6. Ordre de déploiement (non négociable)

```
Étape 1 : Déployer le code mis à jour (STORY-19 — app.js, index.html, fenix-sociopro.html)
          → GitHub Pages sert le nouveau code

Étape 2 : Exécuter supabase-sociopro.sql dans Supabase SQL Editor (STORY-18)
          → Tables créées, policies en place

Étape 3 : Créer les comptes des référents et attribuer role = 'referent_sociopro'
          → Via Supabase Auth ou la future UI

Étape 4 : Test de connexion de chaque référent (STORY-20)
```

**Pourquoi code avant SQL ?** Si le SQL est exécuté en premier mais que le code route encore vers `'cellule'`, les référents sont bloqués (le rôle `referent_sociopro` ne serait pas reconnu par le vieux code). Comme aucun compte n'existe encore pour ces rôles, l'ordre est libre dans les faits — mais l'habitude du code d'abord est meilleure pratique.
