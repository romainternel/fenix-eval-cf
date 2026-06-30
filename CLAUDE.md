# CLAUDE.md — FENIX Eval CF

> Fichier de référence lu automatiquement par tous les agents BMAD avant de travailler sur ce projet.
> Dernière mise à jour : 2026-06-30

---

## 1. Objectif du projet

**FENIX Eval CF** est une application web d'auto-évaluation pour des joueurs de club de football en chaise (CF), permettant aux joueurs de se noter sur des critères techniques par profil de poste, et aux coachs de comparer ces auto-évaluations avec leurs propres notes staff.

---

## 2. Stack technique

| Couche | Techno |
|--------|--------|
| Frontend | Vanilla HTML5, CSS3, JavaScript ES2020 (pas de framework, pas de bundler) |
| Backend / BDD | Supabase (PostgreSQL + Auth + RLS + Edge Functions) |
| Graphiques | Chart.js v4 (CDN) |
| PDF | jsPDF v2.5.1 (CDN) |
| Fonts | Google Fonts — Bebas Neue (display), Inter 400/500/600/700 (body) |
| Hébergement | GitHub Pages (statique) |
| Edge Functions | Deno (TypeScript) via Supabase Functions |
| Build | **Aucun** — pas de webpack, pas de Vite, pas de TypeScript côté frontend |

**CDN scripts chargés dans les HTML** :
- `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
- `https://cdn.jsdelivr.net/npm/chart.js@4`
- `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js`

---

## 3. Structure des fichiers

```
fenix-eval-cf/
├── index.html               # Page de login (formulaire email+password)
├── player.html              # Dashboard joueur
├── coach.html               # Dashboard coach (onglets Sessions / Joueurs)
├── CLAUDE.md                # Ce fichier
├── README.md                # Description agents BMAD et flow squad
├── supabase-setup.sql       # Script de création du schéma DB complet
├── agents-reference.html    # Référence visuelle des agents BMAD disponibles
│
├── assets/
│   ├── favicon.svg
│   └── logo-fenix.png
│
├── css/
│   └── fenix.css            # Feuille de style unique (~1500 lignes), versionnée
│
├── js/
│   ├── supabase-client.js   # Init client Supabase (window.supabaseClient)
│   ├── app.js               # Utilitaires partagés coach+joueur
│   └── criteria-data.js     # Données statiques des critères d'évaluation par profil
│
├── pages/
│   ├── coach-dashboard.js   # Logique complète du dashboard coach (~1757 lignes)
│   └── player-home.js       # Logique complète du dashboard joueur (~1146 lignes)
│
├── supabase/
│   └── functions/
│       └── create-player-account/
│           └── index.ts     # Edge Function : créer/supprimer compte joueur
│
└── docs/
    └── visual/
        ├── fenix-eval-cf-visual-specs.md   # Audit Visual Crafter (tokens, états, animations)
        └── stories-visual.md               # Stories VISUAL-01 à VISUAL-05+
```

**Rôle de chaque fichier JS** :

- `supabase-client.js` — expose `window.supabaseClient` avec URL + anon key Supabase hardcodées. Chargé en premier dans tous les HTML.
- `app.js` — fonctions utilitaires globales : auth, formatage, calculs, composants HTML réutilisables (trend tables). Chargé après supabase-client.
- `criteria-data.js` — objet `CRITERIA` statique : 8 profils × 4-5 axes × 4-7 critères. Ne fait aucun appel réseau.
- `coach-dashboard.js` — tout le code coach : sessions, joueurs, modals, PDF, entretiens. Dépend de app.js et criteria-data.js.
- `player-home.js` — tout le code joueur : liste sessions, évaluation par critère (double tap), radar, PDF. Dépend de app.js et criteria-data.js.

---

## 4. Conventions de code

### Nommage
- **Fonctions globales** : camelCase — ex. `initCoachDashboard`, `renderSessions`, `showPlayerRadar`
- **Variables globales** (état en mémoire) : préfixe `_` + camelCase — ex. `_coachUser`, `_currentSession`, `_ratings`
- **IDs HTML dynamiques** : format `{scope}-{entité}-{id}` — ex. `pr-ailier-att-lecture`, `trend-row-ailier-att`
- **Critères** : format `{profilId}-{axeId}-{num}` — ex. `ailier-att-lecture-1`
- **Profils** : `ailier-att`, `arr-att`, `dc-att`, `pvt-att`, `n1-def`, `n2-def`, `n3-def`, `gb`
- **Niveaux de note** : classes CSS `n1` à `n5` (1=Fragile, 2=En travail, 3=Acquis, 4=Maîtrisé, 5=Référence)

### Organisation
- **Pas de modules ES** (`import/export`) — tout est global via `window` ou déclaré au niveau fichier
- **HTML généré par JS** : les pages sont entièrement rendues via `innerHTML` et `insertAdjacentHTML`, pas de templates HTML statiques dans les .html
- **Cache-busting** : chaque fichier CSS/JS a un paramètre `?v=N` incrémenté manuellement à chaque modification
- **Pas de commentaires** dans le code sauf cas non-évidents
- **`escHtml(str)`** : présent dans coach-dashboard.js et player-home.js (non partagé) — toujours utiliser pour les données utilisateur insérées en HTML

### Raccourcis notables
- `gid(id)` = `document.getElementById(id)` dans coach-dashboard.js
- `pgid(id)` = `document.getElementById(id)` dans player-home.js
- `el(tag, attrs, ...children)` dans app.js — factory d'éléments DOM (rarement utilisé, innerHTML préféré)
- `db` = `window.supabaseClient` dans app.js

### Versions actuelles des fichiers (à incrémenter à chaque modification)

| Fichier | Version actuelle |
|---------|-----------------|
| `css/fenix.css` | v=47 |
| `js/supabase-client.js` | v=32 |
| `js/app.js` | v=42 |
| `js/criteria-data.js` | v=32 |
| `pages/coach-dashboard.js` | v=39 |
| `pages/player-home.js` | v=39 |

> **Règle** : quand un fichier est modifié, incrémenter son `?v=N` dans **tous** les HTML qui le chargent (index.html, player.html, coach.html selon le cas). Le numéro global de version de l'itération est le plus grand des `?v=N` en cours.

---

## 5. Stockage des données

### Supabase PostgreSQL — Schéma complet

**`user_profiles`** — lien auth.users → rôle application
```
id         UUID PK (FK → auth.users.id)
role       TEXT  'joueur' | 'coach'
player_id  UUID  nullable (FK → players.id, uniquement pour joueurs)
```

**`players`** — roster des joueurs (indépendant du compte auth)
```
id         UUID PK
nom        TEXT
prenom     TEXT
email      TEXT unique
actif      BOOLEAN
created_at TIMESTAMPTZ
```

**`player_profiles`** — profils de poste par saison
```
id          UUID PK
player_id   UUID FK
saison      TEXT  ex: "2025-2026"
profil_att  TEXT  nullable  ex: "ailier-att"
profil_def  TEXT  nullable  ex: "n1-def"
profil_gb   TEXT  nullable  ex: "gb"
actif       BOOLEAN  (true = saison en cours)
```
> Contrainte : `profil_gb` est mutuellement exclusif avec `profil_att` + `profil_def`

**`sessions`** — sessions d'évaluation
```
id           TEXT PK  ex: "EVAL-2025-NOV-01"
label        TEXT  ex: "Évaluation — Janvier 2026"
saison       TEXT
date_session DATE
statut       TEXT  'ouvert' | 'ferme'
created_by   UUID FK (coach)
closed_at    TIMESTAMPTZ nullable
```

**`evaluations`** — notes individuelles
```
id           UUID PK
session_id   TEXT FK
player_id    UUID FK
profil_id    TEXT  ex: "ailier-att"
critere_id   TEXT  ex: "ailier-att-lecture-1"
note_joueur  SMALLINT 1-5 nullable
note_staff   SMALLINT 1-5 nullable
date_joueur  TIMESTAMPTZ nullable
date_staff   TIMESTAMPTZ nullable
```
> Unique sur (session_id, player_id, critere_id)

**`entretiens`** — notes d'entretien coach/joueur par session
```
id                UUID PK
session_id        TEXT FK
player_id         UUID FK
points_forts      TEXT
axes_prioritaires TEXT
objectif_ct       TEXT
objectif_mt       TEXT
cr_entretien      TEXT
created_at, updated_at TIMESTAMPTZ
```
> Unique sur (session_id, player_id)

**`session_player_statut`** — état de verrouillage par joueur×session
```
session_id          TEXT FK
player_id           UUID FK
locked              BOOLEAN  (éval joueur verrouillée)
resultats_visibles  BOOLEAN  (radar visible pour le joueur)
```

### Pas de localStorage
Aucune donnée persistée localement. Tout passe par Supabase. Les variables `_xxx` en mémoire sont éphémères (durée de vie de la page).

---

## 6. Authentification et rôles

### Auth
- **Supabase Auth** — email + password
- Connexion via `supabaseClient.auth.signInWithPassword({ email, password })`
- Session stockée automatiquement par le SDK Supabase (localStorage navigateur, géré par SDK)
- `requireAuth(expectedRole)` dans app.js : vérifie session active + rôle correspondant, redirige sinon

### Rôles
| Rôle | Accès | Page |
|------|-------|------|
| `coach` | Tout : CRUD sessions, joueurs, notes staff, entretiens | coach.html |
| `joueur` | Ses propres évaluations uniquement (note_joueur), résultats si `resultats_visibles=true` | player.html |

### RLS (Row-Level Security)
Toutes les tables ont RLS activé. Les policies Supabase garantissent :
- Un joueur ne peut lire/écrire que ses propres données
- Un coach peut tout lire/écrire
- La fonction SQL `my_player_id()` retourne le `player_id` de l'utilisateur connecté

### Création de comptes
- **Joueurs** : via Edge Function `create-player-account` (POST avec `email`, `password`, `player_id`) — appelée depuis coach-dashboard.js avec le Bearer token du coach
- **Coachs** : actuellement via Supabase Dashboard (pas d'interface codée) — **TODO voir section 10**

---

## 7. Hébergement et déploiement

- **Production** : GitHub Pages — `https://romainternel.github.io/fenix-eval-cf/`
- **Déploiement** : `git push` sur la branche `main` → GitHub Pages sert automatiquement
- **Pas de CI/CD** — déploiement manuel
- **Pas de build step** — les fichiers sont servis tels quels
- **Supabase** : projet hébergé sur Supabase Cloud, région par défaut, ID projet `wyiylqvreuippmcrzwat`
- **Edge Functions** : déployées via CLI Supabase (`supabase functions deploy create-player-account`)

---

## 8. Contraintes spécifiques

### Appareil cible
- **Mobile first** — iPhone/Android, usage principal en vestiaire ou terrain
- **Portrait** : vue par défaut pour tout sauf la table "Progression par thème" (nécessite paysage)
- **Pas d'app native** — PWA non configurée, accès via navigateur mobile

### Performance
- Pas de bundler → aucune minification en prod (fichiers bruts)
- Chargement des scripts en séquence (pas `defer`/`async` partout)
- Chart.js et jsPDF chargés même sur pages qui ne les utilisent pas (index.html ne les charge pas)

### Taille des fichiers
- `fenix.css` : ~1500 lignes — garder dans un seul fichier, ne pas splitter
- `coach-dashboard.js` : ~1757 lignes — garder dans un seul fichier
- `player-home.js` : ~1146 lignes — garder dans un seul fichier

### Offline
- Pas de support offline, pas de Service Worker

### Sécurité
- Clé anon Supabase hardcodée dans `supabase-client.js` (publique par design, RLS protège les données)
- Jamais exposer la Service Role key côté frontend
- Les Edge Functions valident que l'appelant est un coach (`user_profiles.role = 'coach'`)

### Identité visuelle
- **Couleurs principales** : Navy `#0A2463` (fond header), Gold `#C8A84B` (accent), Blanc `#FFFFFF`
- **Police display** : Bebas Neue (titres, badges, sections) avec `letter-spacing: 2.5px`
- **Police corps** : Inter (tout le reste)
- **Émotion cible** : app premium de sport, sobre et moderne, inspire confiance
- **Niveaux de note** : n1 (rouge), n2 (orange), n3 (jaune), n4 (vert clair), n5 (vert foncé) — cohérence stricte à maintenir

---

## 9. État d'avancement

### Features existantes et fonctionnelles

#### Authentification
- [x] Login email/password
- [x] Routing par rôle (coach → coach.html, joueur → player.html)
- [x] Logout

#### Dashboard Coach — Sessions
- [x] Lister sessions (ouvertes / fermées)
- [x] Créer une session (label, date)
- [x] Renommer une session (inline edit)
- [x] Voir détail session (liste joueurs + statut d'évaluation)
- [x] Fermer / rouvrir une session
- [x] Label court `sessionShortLabel()` : format `① janv. 26`

#### Dashboard Coach — Joueurs
- [x] Lister joueurs avec profil actif
- [x] Créer un joueur (nom, email, profil, compte auth via Edge Function)
- [x] Éditer un joueur (nom, email, profils de poste)
- [x] Supprimer un joueur (supprime compte auth)
- [x] Vue détail joueur avec historique profils

#### Dashboard Coach — Résultats
- [x] Radar chart coach/joueur par profil et session
- [x] Sélection multi-sessions pour comparaison (bilan chips)
- [x] Table de progression par thème (`trendTableHTML`) avec sous-lignes dépliables
- [x] Table récapitulatif par profil (`cRecapTableHTML`) avec sous-lignes dépliables
- [x] Badge delta joueur/staff (deltaHTML)
- [x] Export PDF

#### Dashboard Joueur
- [x] Liste des sessions ouvertes/fermées avec barre de progression
- [x] Évaluation par critère (double-tap : 1er tap = description, 2e tap = confirme)
- [x] Navigation par axe (carousel)
- [x] Profil GB (gardien de but) avec flux distinct
- [x] Vue résultats radar (si `resultats_visibles=true`)
- [x] Sélection multi-sessions pour comparaison
- [x] Table récapitulatif inline dépliable (`pRecapTableHTML`)
- [x] Table progression par thème (mode paysage recommandé)
- [x] Export PDF joueur
- [x] Hint "👆 Sélectionne les sessions à comparer" sur les bilan chips

#### Visual Polish (stories VISUAL-01 à 06, v=47)
- [x] VISUAL-01 : Tokens CSS complets (40+ variables)
- [x] VISUAL-02 : Header gradient navy/gold
- [x] VISUAL-03 : Cards ivoire teintées, hover/active
- [x] VISUAL-04 : Rating buttons 2.5px border, focus gold
- [x] VISUAL-05 : Animation `fenix-slide-up`, prefers-reduced-motion
- [x] VISUAL-06 : Arc conic-gradient sur rating-btn selected (n1-n5)

### Features en cours / non terminées
- [ ] Interface de gestion des coachs (ajout/suppression de comptes coach via l'app — actuellement Supabase Dashboard uniquement)

### Features prévues / roadmap connue
- [ ] Entretiens individuels (table `entretiens` existe en DB, pas d'UI)
- [ ] Mode "invité coach" (lecture seule, sans authentification complète) — décision non prise
- [ ] Bilan multi-sessions joueur : test avec 2ème session disponible (juillet 2026 — STORY 09b)
- [ ] Notifications ou rappels d'évaluation

---

## 10. Décisions techniques en attente / roadmap

### 1. Gestion des coachs (PRIORITÉ HAUTE)
**Problème** : ajouter un 2ème compte coach via Supabase Dashboard est complexe et sujet aux erreurs (foreign key error si l'utilisateur n'existe pas encore dans auth.users). L'Edge Function `create-player-account` existe pour les joueurs mais pas pour les coachs.

**Décision prise** : coder une interface dans le dashboard coach pour créer/gérer les comptes coachs (UI + Edge Function ou réutilisation de `create-player-account`).

**À implémenter** :
- Nouvelle Edge Function `create-coach-account` (ou extension de l'existante)
- Section "Gestion des coachs" dans coach.html (accessible uniquement au coach principal)
- Liste des coachs existants, ajout (nom, email, password), suppression

### 2. Mode "invité coach"
**Problème** : des coachs occasionnels veulent voir les résultats sans avoir de compte permanent.

**Options** : (a) compte coach standard, (b) lien partagé avec token, (c) pas de mode invité.

**Décision** : non prise — à valider avec l'utilisateur.

### 3. Entretiens individuels
La table `entretiens` est créée en DB. Aucune UI n'existe. À prioriser avec le PM.

### 4. Incrémentation des versions
**Règle actuelle** : incrémentation manuelle du `?v=N` dans les balises `<script>` et `<link>`. Le numéro de version global est 47. Aucun outil de build ne gère ça automatiquement — risque d'oubli.

### 5. index.html non mis à jour
`index.html` charge encore `app.js?v=1`, `supabase-client.js?v=1`, `css/fenix.css?v=1` alors que ces fichiers sont à des versions supérieures. À synchroniser si la page de login est modifiée.
