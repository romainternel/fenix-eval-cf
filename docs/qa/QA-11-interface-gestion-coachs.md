# QA — STORY-11 : Interface gestion coachs

> Agent : QA | Date : 2026-06-30
> Sources : STORY-11, Code Review STORY-11, Security Audit gestion-coachs-frontend

---

## Lecture des rapports précédents

- Code Reviewer : **APPROUVÉ** — 0 bloquant
- Security Auditor : **Aucun finding** — feu vert

---

## Critères d'acceptation — Validation

### Onglet Coachs

| Critère | Statut | Justification |
|---------|--------|---------------|
| 3e onglet "Coachs" visible | ✅ | `<button class="tab-btn" onclick="showTab('coachs')" id="tab-coachs">Coachs</button>` ajouté dans `coach.html` |
| Clic → `renderCoachs()` | ✅ | `showTab('coachs')` → `if (tab === 'coachs') renderCoachs()` |
| Même style que les onglets existants | ✅ | Classe `.tab-btn` identique — underline animée, couleur navy actif |

### Liste des coachs

| Critère | Statut | Justification |
|---------|--------|---------------|
| Affiche tous `user_profiles WHERE role='coach'` | ✅ | `.from('user_profiles').select(...).eq('role', 'coach').order('prenom')` |
| Prénom + nom (ou "Coach" si null) | ✅ | `[coach.prenom, coach.nom].filter(Boolean).join(' ') \|\| 'Coach'` |
| Badge "Vous" pour coach courant | ✅ | `isSelf ? <span class="coach-you-badge">Vous</span> : ...` |
| Bouton Supprimer ABSENT pour soi | ✅ | Ternaire — bouton absent (pas juste `disabled`) quand `isSelf` |
| Bouton Supprimer présent pour les autres | ✅ | `.btn.btn-danger.btn-sm` sur branche `!isSelf` |
| Spinner pendant chargement | ✅ | `innerHTML = spinner` au début de `renderCoachs()` |
| Message "Aucun co-coach" si seul | ✅ | `otherCoachs.length === 0 ? <p>Aucun co-coach...</p> : ''` |

### Bouton ajout

| Critère | Statut | Justification |
|---------|--------|---------------|
| "+ Ajouter un coach" `.btn.btn-primary.btn-full` | ✅ | Présent à la fin de `renderCoachs()` |
| Ouvre `showCreateCoachModal()` | ✅ | `onclick="showCreateCoachModal()"` |

### Modal création

| Critère | Statut | Justification |
|---------|--------|---------------|
| 4 champs : Prénom, Nom, Email, Mot de passe | ✅ | Présents dans `showCreateCoachModal()` |
| Email `type="email"` | ✅ | `<input type="email">` |
| Mot de passe `type="password"` | ✅ | `<input type="password">` |
| Hint "(min. 8 caractères)" | ✅ | `<p class="form-hint">(min. 8 caractères)</p>` |
| Validation < 8 chars → `.form-error` | ✅ | `if (password.length < 8) { pwdErrEl.style.display = 'block'; return; }` |
| Pendant API : bouton désactivé "Création…" | ✅ | `btn.disabled = true; btn.textContent = 'Création…'` |
| Succès : modal fermé + toast + liste | ✅ | `closeModal → showToast('Coach ajouté avec succès') → renderCoachs()` |
| Erreur "already" : toast lisible, modal ouvert | ✅ | `.includes('already')` → message custom ; modal non fermé |
| Autre erreur API : toast brut | ✅ | `result.error` affiché dans `errEl` |

### Suppression

| Critère | Statut | Justification |
|---------|--------|---------------|
| `confirm()` avec nom + message | ✅ | `confirm('Supprimer ' + displayName + ' ?\nCette action est irréversible.')` |
| Annuler : rien | ✅ | `if (!confirm(...)) return` |
| Confirmer → appel DELETE | ✅ | Fetch DELETE vers `manage-coach-account` |
| Succès : toast + liste rafraîchie | ✅ | `showToast('Coach supprimé') → renderCoachs()` |
| Erreur : toast lisible | ✅ | `showToast(result.error \|\| ...)` |
| Impossible supprimer soi : bouton absent | ✅ | Confirmé — guard `isSelf` côté HTML |

### CSS

| Critère | Statut | Justification |
|---------|--------|---------------|
| `.coach-you-badge` avec tokens gold | ✅ | `color:var(--fenix-gold-600)`, `background:var(--fenix-gold-100)`, `border: 1px solid var(--fenix-accent)` |
| Animation `fenix-slide-up` sur les cartes | ✅ | `animation:fenix-slide-up 200ms var(--ease-out-quart) both; animation-delay:${delay}ms` |

### Versions

| Critère | Statut | Justification |
|---------|--------|---------------|
| `coach-dashboard.js?v=40` dans `coach.html` | ✅ | Vérifié dans le fichier |
| `fenix.css?v=48` dans `coach.html` | ✅ | Vérifié dans le fichier |

---

## Cas limites testés (analyse statique)

| Cas | Comportement | Statut |
|-----|-------------|--------|
| Coach seul (aucun co-coach) | Liste avec soi + badge "Vous" + message "Aucun co-coach" | ✅ |
| Mot de passe 7 caractères | `pwdErrEl` affiché, soumission bloquée, pas d'appel API | ✅ |
| Mot de passe 8 caractères | Soumission acceptée | ✅ |
| Email vide | HTML `required` bloque la soumission native | ✅ |
| Email déjà utilisé | Toast "Cet email est déjà utilisé par un autre compte." | ✅ |
| Perte réseau pendant création | Catch → `errEl.textContent = 'Erreur réseau'`, bouton réactivé | ✅ |
| Clic backdrop du modal | `e.target === overlay → closeModal()` | ✅ |
| Prenom/Nom avec `<script>` | `escHtml()` appliqué → rendu texte échappé | ✅ |

---

## Régressions

Aucune modification des fonctions existantes. L'ajout de `let _coaches = []` ne conflicte avec aucune variable existante.

---

## Verdict

**PASSED**

Tous les critères d'acceptation sont satisfaits. Aucune régression identifiée. Feature prête pour mise en production dès que STORY-10 est validée en environnement réel (migration SQL exécutée + Edge Function déployée).
