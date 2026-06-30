# STORY-11 — Frontend : onglet Coachs, liste, création, suppression

**En tant que** coach principal,
**Je veux** gérer les comptes coachs directement depuis mon dashboard (lister, créer, supprimer),
**Afin de** ne jamais avoir besoin d'ouvrir le dashboard Supabase pour cette opération.

---

## Contexte technique

- **Zone concernée** : `pages/coach-dashboard.js` (ajout de ~120 lignes), `coach.html` (ajout d'un onglet + extension `showTab()`), `css/fenix.css` (ajout classe `.coach-you-badge`)
- **Edge Function** : `manage-coach-account` (déployée en STORY-10 — prérequis obligatoire)
- **Variable globale** : `_coachUser` déjà disponible dans `coach-dashboard.js` (contient `id` du coach connecté)
- **Pattern de création joueur** : `submitCreatePlayer()` dans `coach-dashboard.js` — même structure pour les coachs
- **Versions à incrémenter** : `fenix.css` → v=48, `coach-dashboard.js` → v=40 ; mettre à jour les refs dans `coach.html`

---

## Critères d'acceptation

### Onglet Coachs
- [ ] Un 3e onglet "Coachs" est visible dans la barre de navigation de `coach.html`
- [ ] Cliquer sur l'onglet appelle `renderCoachs()` et affiche la section
- [ ] L'onglet est stylé comme les onglets existants (`.tab-btn`, `.tab-btn.active`)

### Liste des coachs
- [ ] La liste affiche tous les `user_profiles` où `role='coach'`
- [ ] Chaque ligne montre : prénom + nom (ou "Coach" si nom null — fallback R6)
- [ ] La ligne du coach courant affiche le badge "Vous" (`.coach-you-badge`, fond gold)
- [ ] La ligne du coach courant N'A PAS de bouton "Supprimer" (absent, pas juste disabled) — garde R1
- [ ] Les lignes des autres coachs ont un bouton "Supprimer" (`.btn.btn-danger.btn-sm`)
- [ ] Un état de chargement (spinner) est visible pendant le fetch
- [ ] Si aucun co-coach n'existe (seul le coach courant est dans la liste) : message "Aucun co-coach pour l'instant"

### Bouton ajout
- [ ] Un bouton "+ Ajouter un coach" (`.btn.btn-primary.btn-full`) est visible sous la liste
- [ ] Le bouton ouvre le modal de création

### Modal création
- [ ] Le modal contient 4 champs : Prénom, Nom, Email, Mot de passe
- [ ] Le champ Email est de type `email` (validation navigateur native)
- [ ] Le champ Mot de passe est de type `password`
- [ ] Un hint "(min. 8 caractères)" est affiché sous le champ mot de passe
- [ ] La soumission est bloquée si mot de passe < 8 caractères (validation client, message `.form-error`) — R7
- [ ] Pendant l'appel API : le bouton "Créer" est désactivé avec texte "Création…"
- [ ] Si succès : modal fermé + toast "Coach ajouté avec succès" + liste rafraîchie
- [ ] Si erreur "already registered" : toast "Cet email est déjà utilisé" (le modal reste ouvert) — R3
- [ ] Si autre erreur API : toast avec le message d'erreur brut (non une stacktrace)

### Suppression
- [ ] Cliquer "Supprimer" déclenche `confirm('Supprimer [Prénom Nom] ?\nCette action est irréversible.')` — R4
- [ ] Si l'utilisateur annule : rien ne se passe
- [ ] Si l'utilisateur confirme : appel DELETE à `manage-coach-account`
- [ ] Si succès : toast "Coach supprimé" + liste rafraîchie
- [ ] Si erreur : toast avec message d'erreur lisible
- [ ] Impossible de déclencher la suppression de son propre compte (bouton absent) — R1

### CSS
- [ ] La classe `.coach-you-badge` est ajoutée dans `fenix.css` avec les tokens gold spécifiés dans `docs/visual/gestion-coachs.md`
- [ ] Les cartes coaches apparaissent avec l'animation `fenix-slide-up` au chargement de la liste

### Versions
- [ ] `coach-dashboard.js` référencé en `v=40` dans `coach.html`
- [ ] `fenix.css` référencé en `v=48` dans `coach.html`

---

## Implémentation guidée

### `coach.html` — onglet + showTab

```html
<!-- Dans la nav existante, après le bouton Joueurs -->
<button class="tab-btn" onclick="showTab('coachs')" id="tab-coachs">Coachs</button>
```

```javascript
// Dans showTab() du script inline de coach.html
if (tab === 'coachs') renderCoachs();
```

```html
<!-- Mettre à jour les versions -->
<link rel="stylesheet" href="css/fenix.css?v=48">
<script src="pages/coach-dashboard.js?v=40"></script>
```

### `css/fenix.css` — classe badge

```css
.coach-you-badge {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--fenix-gold-600);
  background: var(--fenix-gold-100);
  border: 1px solid var(--fenix-accent);
  border-radius: 20px;
  padding: 2px 10px;
  white-space: nowrap;
  flex-shrink: 0;
}
```

### `coach-dashboard.js` — nouvelles fonctions

```javascript
let _coaches = []

async function renderCoachs() {
  // 1. Afficher spinner dans mainContent
  // 2. Fetch user_profiles WHERE role='coach'
  // 3. Stocker dans _coaches
  // 4. Render liste + bouton ajout
  // Utiliser gid() pour getElementById
  // Utiliser escHtml() pour les noms
}

function coachCardHTML(coach) {
  const isSelf = coach.id === _coachUser.id
  const displayName = [coach.prenom, coach.nom].filter(Boolean).join(' ') || 'Coach'
  // Retourner HTML string avec .card flex-row
  // Badge .coach-you-badge si isSelf
  // Bouton .btn-danger si !isSelf avec onclick="deleteCoach('${coach.id}', '${escHtml(displayName)}')"
  // Animation: style="animation: fenix-slide-up 200ms var(--ease-out-quart) both; animation-delay: ${idx * 60}ms"
}

function showCreateCoachModal() {
  // Injecter modal dans document.body
  // Même structure que showCreatePlayerModal() existant
  // 4 champs : prenom, nom, email, password
  // onsubmit="submitCreateCoach(event)"
}

async function submitCreateCoach(e) {
  e.preventDefault()
  // Lire les champs du form
  // Validation client : password.length >= 8
  // Désactiver bouton submit → "Création…"
  // Fetch POST manage-coach-account
  // Si succès : closeModal, showToast('Coach ajouté avec succès'), renderCoachs()
  // Si erreur : parser le message, showToast(message lisible), réactiver bouton
}

async function deleteCoach(coachUserId, displayName) {
  if (!confirm(`Supprimer ${displayName} ?\nCette action est irréversible.`)) return
  // Fetch DELETE manage-coach-account { coach_user_id }
  // Si succès : showToast('Coach supprimé'), renderCoachs()
  // Si erreur : showToast(message lisible)
}
```

### URL Edge Function

```javascript
const COACH_FUNCTION_URL = 'https://wyiylqvreuippmcrzwat.supabase.co/functions/v1/manage-coach-account'
// Même pattern que create-player-account dans submitCreatePlayer()
```

---

## Hors scope

- Modification de `player-home.js` ou de tout code côté joueur
- Modification de `index.html`
- Édition d'un coach existant (email/password/nom)
- Envoi d'email au nouveau coach
- Distinction de rôles admin/assistant

---

## Dépend de

**STORY-10** — obligatoirement terminée et l'Edge Function testée avant de commencer STORY-11.

---

## Taille

**M** — Ajout de ~120 lignes dans `coach-dashboard.js`, modifications mineures de `coach.html` et `fenix.css`. Pattern bien établi dans le projet (réutilise `submitCreatePlayer`, `showCreatePlayerModal`, `closeModal`, `showToast`, `gid`, `escHtml`).
