# Design — Gestion des comptes coachs

> Agent : Designer | Date : 2026-06-30 | Feature : gestion-coachs
> Source : docs/prd.md | Appareil cible : mobile portrait (iPhone)

---

## Principes de design retenus

- Réutiliser au maximum les composants existants (`.card`, `.modal`, `.btn`, `.tab-btn`, `.form-input`, `.toast`)
- Aucun nouvel écran — la feature s'intègre dans le dashboard coach existant via un 3e onglet
- Mobile portrait first — toute la feature doit être utilisable sans rotation
- Opération rare → pas besoin d'optimiser le nombre de taps, mais les erreurs doivent être claires

---

## Écran 1 — Barre de navigation coach (modifiée)

La nav existante a 2 onglets : Sessions | Joueurs. On ajoute Coachs.

```
┌─────────────────────────────────────────┐
│  [Sessions]   [Joueurs]   [Coachs]      │
│      —————                              │
└─────────────────────────────────────────┘
```

- Même style `.tab-btn` / `.tab-btn.active` que les onglets existants
- Pas d'icône supplémentaire — label texte suffisant
- Scroll horizontal si nécessaire (déjà géré par `overflow-x: auto` sur la nav)

---

## Écran 2 — Onglet Coachs (liste)

### État : liste avec 2 coachs

```
┌─────────────────────────────────────────┐
│  FENIX Eval CF          [Déconnexion]   │
│  ──────────────────────────────────     │
│  [Sessions]  [Joueurs]  [Coachs] ←actif│
├─────────────────────────────────────────┤
│                                         │
│  GESTION DES COACHS                     │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Romain Internel        [Vous]  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Max Gilbert        [Supprimer] │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [+ Ajouter un coach]                   │
│                                         │
└─────────────────────────────────────────┘
```

**Détail chaque ligne coach :**
- Carte `.card` légère (padding réduit)
- Prénom + Nom en texte principal (Inter 600, 15px)
- Badge `[Vous]` doré si `id === _coachUser.id` — class `.session-badge-open` réutilisée, couleur gold
- Bouton `[Supprimer]` en rouge (`.btn-danger .btn-sm`) si ce n'est pas le compte courant
- Bouton absent (pas juste désactivé) sur la ligne "Vous"

**Bouton ajout :**
- `.btn.btn-primary.btn-full` : "+ Ajouter un coach"
- Positionné en bas de liste (scroll naturel)

### État : liste vide (aucun co-coach)

```
┌─────────────────────────────────────────┐
│  GESTION DES COACHS                     │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │  Romain Internel        [Vous]  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─── ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ──┐    │
│  │  Aucun co-coach pour l'instant  │    │
│  │  Ajoutez votre premier co-coach │    │
│  └─── ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ──┘    │
│                                         │
│  [+ Ajouter un coach]                   │
│                                         │
└─────────────────────────────────────────┘
```

Note : le coach courant est toujours affiché (il existe forcément). L'état "vide" signifie "aucun autre coach".

### État : chargement

- Spinner centré identique aux autres onglets
- Le titre "GESTION DES COACHS" reste visible pendant le chargement

---

## Écran 3 — Modal "Ajouter un coach"

```
┌─────────────────────────────────────────┐
│ ░░░░░░░░░░ (backdrop)  ░░░░░░░░░░░░░░░ │
│ ░░░  ┌──────────────────────────┐  ░░░ │
│ ░░░  │  Ajouter un coach        │  ░░░ │
│ ░░░  │                          │  ░░░ │
│ ░░░  │  Prénom *                │  ░░░ │
│ ░░░  │  ┌──────────────────┐    │  ░░░ │
│ ░░░  │  │ ex : Maxime      │    │  ░░░ │
│ ░░░  │  └──────────────────┘    │  ░░░ │
│ ░░░  │                          │  ░░░ │
│ ░░░  │  Nom *                   │  ░░░ │
│ ░░░  │  ┌──────────────────┐    │  ░░░ │
│ ░░░  │  │ ex : Gilbert     │    │  ░░░ │
│ ░░░  │  └──────────────────┘    │  ░░░ │
│ ░░░  │                          │  ░░░ │
│ ░░░  │  Email *                 │  ░░░ │
│ ░░░  │  ┌──────────────────┐    │  ░░░ │
│ ░░░  │  │ coach@club.fr    │    │  ░░░ │
│ ░░░  │  └──────────────────┘    │  ░░░ │
│ ░░░  │                          │  ░░░ │
│ ░░░  │  Mot de passe *          │  ░░░ │
│ ░░░  │  ┌──────────────────┐    │  ░░░ │
│ ░░░  │  │ ••••••••         │    │  ░░░ │
│ ░░░  │  └──────────────────┘    │  ░░░ │
│ ░░░  │  (min. 8 caractères)     │  ░░░ │
│ ░░░  │                          │  ░░░ │
│ ░░░  │  [Annuler]  [Créer →]   │  ░░░ │
│ ░░░  └──────────────────────────┘  ░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
└─────────────────────────────────────────┘
```

**Détail modal :**
- Même structure que les modals existants dans coach-dashboard.js (`.modal` + `.modal-backdrop`)
- 4 champs verticaux avec labels et `.form-input`
- `type="email"` sur le champ email (validation navigateur native)
- `type="password"` sur le mot de passe
- Hint texte "(min. 8 caractères)" sous le champ password (`.form-hint`)
- Boutons : `[Annuler]` (`.btn.btn-ghost`) + `[Créer →]` (`.btn.btn-primary`)
- Pendant la requête : bouton "Créer" en état `disabled` avec texte "Création…"

### État erreur formulaire

```
│  Email *                               │
│  ┌────────────────────────────────┐    │
│  │ max@                           │    │
│  └────────────────────────────────┘    │
│  ⚠ Email invalide                      │
```

- Message d'erreur en rouge sous le champ (`.form-error`)
- Pas de soumission si champs invalides

### État erreur API (ex : email déjà utilisé)

- Toast rouge en bas : "Cet email est déjà utilisé par un autre compte"
- Le modal reste ouvert (ne pas le fermer si erreur API)

---

## Écran 4 — Confirmation suppression

Pas de modal custom — on utilise `confirm()` natif du navigateur :

```
[Navigateur natif]
"Supprimer Max Gilbert ?
Cette action est irréversible."
[Annuler] [OK]
```

Simple, rapide, compatible mobile. Pas d'UI custom pour cette confirmation rare.

---

## Interactions

| Action | Déclencheur | Résultat |
|--------|------------|---------|
| Tap onglet Coachs | `.tab-btn` | `showTab('coachs')` → `renderCoachs()` |
| Tap "+ Ajouter" | `.btn-primary` | `showCreateCoachModal()` → modal |
| Tap "Créer" dans modal | form submit | `submitCreateCoach(e)` → Edge Function |
| Tap "Supprimer" | `.btn-danger` | `deleteCoach(id, nom)` → `confirm()` → Edge Function |
| Tap "Annuler" dans modal | `.btn-ghost` | `closeModal('create-coach-modal')` |

---

## Composants réutilisés vs nouveaux

| Composant | Statut | Classe CSS |
|-----------|--------|-----------|
| Barre de navigation / tab-btn | Réutilisé | `.tab-btn`, `.tab-btn.active` |
| Carte coach | Nouveau (basé sur `.card`) | `.card` existant |
| Badge "Vous" | Nouveau style sur token existant | `.coach-you-badge` (gold) |
| Bouton Supprimer | Réutilisé | `.btn.btn-danger.btn-sm` |
| Bouton Ajouter | Réutilisé | `.btn.btn-primary.btn-full` |
| Modal création | Réutilisé | `.modal`, `.modal-backdrop` |
| Inputs formulaire | Réutilisé | `.form-group`, `.form-input`, `.form-label`, `.form-hint`, `.form-error` |
| Toast | Réutilisé | `showToast()` existant |
| Spinner chargement | Réutilisé | `.loading-state`, `.spinner` |
| Confirmation suppression | Natif navigateur | `confirm()` |

---

## Responsive

| Orientation | Comportement |
|------------|-------------|
| Portrait mobile (principal) | Tout fonctionne — liste pleine largeur, modal fullscreen ou centré |
| Paysage mobile | La nav onglets est déjà `overflow-x:auto` — pas de problème |
| Desktop | La liste s'affiche en colonne centrale (`.page-content` max-width existant) |
