# Stories Visuelles — FENIX Eval CF
**Scrum Master BMAD — v1 — 2026-06-30**
**Ordre d'exécution : VISUAL-01 → VISUAL-05 (dépendances strictes)**

---

## VISUAL-01 — Fondations : tokens CSS enrichis + corrections WCAG

**Priorité : BLOQUANTE — toutes les stories suivantes en dépendent**

### Fichiers à modifier
- `css/fenix.css` — bloc `:root` uniquement (lignes 1–52)

### Travail exact

Remplacer le bloc `:root` existant par la version étendue ci-dessous.
Ne toucher à aucune règle CSS en dehors de `:root`.

```css
:root {
  /* ── COULEURS PRIMAIRES (inchangées) ── */
  --fenix-navy:   #0A2463;
  --fenix-accent: #C8A84B;
  --white:        #FFFFFF;

  /* ── VARIANTES NAVY (nouvelles) ── */
  --fenix-navy-800: #071A4A;
  --fenix-navy-600: #0F3080;
  --fenix-navy-100: #E8EDF8;
  --fenix-navy-50:  #F0F3FA;

  /* ── VARIANTES GOLD (nouvelles) ── */
  --fenix-gold:     #C8A84B;
  --fenix-gold-600: #A8872E;
  --fenix-gold-200: #EDD89A;
  --fenix-gold-100: #F7EDD4;
  --fenix-gold-glow: rgba(200,168,75,0.20);

  /* ── CORRECTION CRITIQUE : fenix-blue manquant ── */
  --fenix-blue:       #1E40AF;
  --fenix-blue-light: #EEF2FF;

  /* ── GRIS SYSTEME (compléments aux existants) ── */
  --gray-50:  #F8FAFC;
  --gray-100: #F1F5F9;
  --gray-200: #E2E8F0;
  --gray-300: #CBD5E1;
  --gray-400: #94A3B8;
  --gray-500: #64748B;
  --gray-600: #475569;
  --gray-700: #334155;
  --gray-800: #1E293B;

  /* ── TYPES DE PROFIL (inchangés) ── */
  --att:       #166534;
  --att-light: #22C55E;
  --att-tag:   #DCFCE7;
  --def:       #991B1B;
  --def-light: #EF4444;
  --def-tag:   #FEE2E2;
  --gb:        #1E40AF;
  --gb-light:  #3B82F6;
  --gb-tag:    #DBEAFE;

  /* ── ECHELLE DE NOTATION (fonds plus saturés) ── */
  --n1-bg: #FECACA; --n1-border: #FBBFBF; --n1-text: #991B1B;
  --n2-bg: #FDE68A; --n2-border: #FCD34D; --n2-text: #92400E;
  --n3-bg: #A7F3D0; --n3-border: #6EE7B7; --n3-text: #065F46;
  --n4-bg: #BAD7FF; --n4-border: #93C5FD; --n4-text: #1E40AF;
  --n5-bg: #DDD6FE; --n5-border: #C4B5FD; --n5-text: #5B21B6;

  /* ── SURFACES ── */
  --surface-card:           #FFFFFF;
  --surface-card-alt:       #FAFBFD;
  --surface-border:         #E2E8F2;
  --surface-border-strong:  #C9D4E8;

  /* ── OMBRES ENRICHIES ── */
  --shadow-xs:         0 1px 2px rgba(10,36,99,0.06);
  --shadow-sm:         0 1px 4px rgba(10,36,99,0.08), 0 0 0 1px rgba(10,36,99,0.04);
  --shadow-md:         0 4px 16px rgba(10,36,99,0.12), 0 1px 4px rgba(10,36,99,0.06);
  --shadow-lg:         0 8px 32px rgba(10,36,99,0.16), 0 2px 8px rgba(10,36,99,0.08);
  --shadow-xl:         0 20px 48px rgba(10,36,99,0.22), 0 4px 12px rgba(10,36,99,0.10);
  --shadow-glow-gold:  0 0 0 3px rgba(200,168,75,0.25);
  --shadow-glow-navy:  0 0 0 3px rgba(10,36,99,0.18);
  --shadow-inset-sm:   inset 0 1px 3px rgba(10,36,99,0.08);

  /* ── GRADIENTS ── */
  --gradient-header:        linear-gradient(135deg, #0A2463 0%, #071A4A 100%);
  --gradient-navy-gold:     linear-gradient(135deg, var(--fenix-navy) 0%, #1a3570 100%);
  --gradient-card-top:      linear-gradient(180deg, #FFFFFF 0%, #FAFBFD 100%);
  --gradient-gold-btn:      linear-gradient(135deg, #D4B05A 0%, #B8942E 100%);
  --gradient-progress:      linear-gradient(90deg, var(--fenix-navy) 0%, #1E40AF 100%);
  --gradient-progress-done: linear-gradient(90deg, #16A34A 0%, #22C55E 100%);

  /* ── EASING ── */
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth:    cubic-bezier(0.4, 0, 0.2, 1);

  /* ── LAYOUT (inchangé) ── */
  --header-h:    60px;
  --backnav-h:   44px;
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left:   env(safe-area-inset-left, 0px);
  --safe-right:  env(safe-area-inset-right, 0px);
}
```

Puis appliquer les corrections WCAG obligatoires (remplacer `gray-400` en texte courant) :

```css
/* Après le bloc :root, cibler les sélecteurs suivants et corriger la couleur */
/* section-title : ligne ~147 */
.section-title { color: var(--gray-500); }   /* était --gray-400 */

/* rating-labels : ligne ~235 */
.rating-labels { color: var(--gray-500); }   /* était --gray-400 */

/* progress-label : ligne ~269 */
.progress-label { color: var(--gray-500); }  /* était --gray-400 */

/* player-card-email : ligne ~530 */
.player-card-email { color: var(--gray-500); } /* était --gray-400 */

/* btn-logout : ligne ~421 */
.btn-logout { color: rgba(255,255,255,0.75); } /* était 0.6 */
```

### Criteres d'acceptation

| # | Test | PASS | FAIL |
|---|------|------|------|
| 1 | Ouvrir DevTools > Elements > `:root` — `--fenix-blue` est visible avec valeur `#1E40AF` | Variable presente | Absente ou hérite `undefined` |
| 2 | Les pastilles n1/n3 non sélectionnées sur la page eval sont clairement plus saturées qu'avant | Rouge vif / vert vif visibles | Pâles comme avant |
| 3 | Inspecter `.section-title` — `color` computed = `#64748B` (gray-500) | Ratio >4.5:1 | Encore `#94A3B8` |
| 4 | Inspecter `.btn-logout` — `color` computed = `rgba(255,255,255,0.75)` | Opacité 75% | Encore 60% |
| 5 | Aucune erreur console CSS (pas de `undefined var`) sur les pages Story 09/09b | 0 erreur | Erreurs fallback |

---

## VISUAL-02 — Header premium : gradient + stripe glow + typographie

**Dépend de : VISUAL-01 (utilise `--gradient-header`, `--fenix-navy-800`)**

### Fichiers à modifier
- `css/fenix.css` — bloc `/* ── HEADER ── */` (lignes 83–108)

### Travail exact

Remplacer les règles `.fenix-header`, `.header-stripe`, `.header-text h1`, `.header-text p` par :

```css
.fenix-header {
  background: var(--gradient-header);
  display: flex;
  align-items: stretch;
  position: sticky;
  top: 0;
  z-index: 200;
  box-shadow:
    0 2px 12px rgba(10,36,99,0.40),
    0 1px 3px rgba(10,36,99,0.20);
  border-bottom: 1px solid rgba(200,168,75,0.12);
  padding-left: var(--safe-left);
  padding-right: var(--safe-right);
  min-height: var(--header-h);
}

.header-stripe {
  width: 5px;          /* 6px -> 5px — plus élancé */
  background: var(--fenix-accent);
  box-shadow: 0 0 14px rgba(200,168,75,0.40);
  flex-shrink: 0;
}

.header-text h1 {
  font-size: 17px;     /* 15px -> 17px */
  font-weight: 800;    /* 700 -> 800 */
  letter-spacing: -0.2px;
  color: var(--white);
  line-height: 1.2;
}

.header-text p {
  font-size: 10px;     /* 12px -> 10px — plus compact, plus premium */
  color: var(--fenix-accent);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-top: 2px;
  font-weight: 600;
  opacity: 0.88;
}
```

### Criteres d'acceptation

| # | Test | PASS | FAIL |
|---|------|------|------|
| 1 | Le header affiche un dégradé visible (navy sombre vers navy très sombre) | Gradient perceptible en diagonale | Navy uni aplat |
| 2 | La stripe verticale gold a un halo lumineux visible (lueur dorée) | Glow visible à l'oeil | Stripe sans effet |
| 3 | Le titre `h1` est clairement plus grand et gras qu'avant | Impact visuel fort | Identique à avant |
| 4 | Une fine ligne gold est visible au bas du header (séparation subtile) | Ligne dorée en bas | Aucune séparation |
| 5 | Test mobile (DevTools iPhone 390px) — le header reste sous 60px de hauteur | Hauteur inchangée | Overflow ou trop haut |

---

## VISUAL-03 — Cartes et sessions : fond teinté, etats interactifs, hover

**Dépend de : VISUAL-01 (utilise `--shadow-sm`, `--surface-border-strong`, `--fenix-gold-200`)**

### Fichiers à modifier
- `css/fenix.css` — blocs `/* ── CARDS ── */`, `/* ── SESSION CARD ── */`, `/* ── PLAYER CARD ── */`

### Travail exact

**1. Card generique** (remplacer les regles `.card` et `.card:hover`) :
```css
.card {
  background: var(--gradient-card-top);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--surface-border);
  margin-bottom: 12px;
  transition: box-shadow 0.18s var(--ease-smooth),
              transform 0.18s var(--ease-smooth),
              border-color 0.18s;
}
.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  border-color: var(--surface-border-strong);
}
.card:active {
  transform: translateY(0);
  box-shadow: var(--shadow-xs);
}
```

**2. Session card** (remplacer toutes les regles `.session-card*`) :
```css
.session-card {
  background: var(--white);
  border-radius: 14px;
  border: 1.5px solid var(--surface-border);
  padding: 18px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: border-color 0.15s,
              box-shadow 0.18s var(--ease-smooth),
              transform 0.15s var(--ease-smooth);
  text-decoration: none;
  display: block;
  color: inherit;
}
.session-card:active {
  border-color: var(--fenix-navy);
  box-shadow: 0 4px 16px rgba(10,36,99,0.12);
  transform: scale(0.995);
}
/* Session ouverte : fond teinté gold subtil */
.session-card.open {
  border-left: 4px solid var(--fenix-accent);
  background: linear-gradient(135deg, #FFFDF5 0%, #FFFFFF 55%);
}
/* Session ouverte : badge plus vivant */
.session-card.open .session-badge-open {
  background: var(--fenix-gold-200);
  color: var(--fenix-gold-600);
  font-weight: 800;
  letter-spacing: 1.2px;
}
/* Session fermée : retrait visuel clair */
.session-card.closed {
  border-left: 4px solid var(--gray-300);
  background: var(--gray-50);
  opacity: 0.72;
}

/* Hover uniquement sur appareils avec pointeur (tablette coach, desktop) */
@media (hover: hover) {
  .session-card:hover {
    border-color: var(--surface-border-strong);
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }
}
```

**3. Player card** (remplacer les regles `.player-card`, `.player-card-avatar`, `.player-card-arrow`) :
```css
.player-card {
  background: var(--white);
  border-radius: 12px;
  border: 1.5px solid var(--surface-border);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
}
.player-card:active {
  border-color: var(--fenix-navy);
  background: var(--fenix-navy-50);
  box-shadow: 0 4px 12px rgba(10,36,99,0.12);
  transform: scale(0.99);
}
/* Avatar avec gradient navy */
.player-card-avatar {
  width: 44px; height: 44px;
  background: linear-gradient(135deg, var(--fenix-navy) 0%, #1a3570 100%);
  color: var(--fenix-accent);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(10,36,99,0.18);
}
.player-card-arrow {
  color: var(--gray-400);
  font-size: 20px;
  flex-shrink: 0;
  transition: color 0.15s, transform 0.15s;
}
/* Badge profil : padding légèrement plus grand */
.badge-profil {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 3px 9px;    /* était 2px 8px */
  border-radius: 20px;
  display: inline-block;
}
/* Hover tablette/desktop coach */
@media (hover: hover) {
  .player-card:hover {
    border-color: var(--fenix-navy-100);
    box-shadow: var(--shadow-sm);
    transform: translateY(-1px);
  }
  .player-card:hover .player-card-arrow {
    color: var(--fenix-navy);
    transform: translateX(3px);
  }
}
```

### Criteres d'acceptation

| # | Test | PASS | FAIL |
|---|------|------|------|
| 1 | La `.session-card.open` a un fond légèrement ivoire/doré visible (pas blanc pur) | Teinte chaude perceptible | Fond blanc pur |
| 2 | La `.session-card.closed` est clairement en retrait (opacité 72%, fond gris) | Distinction visuelle franche | Identique à `.open` |
| 3 | L'avatar d'un joueur affiche un gradient (navy sombre vers navy légèrement bleuté) | Gradient subtil visible | Aplat navy uni |
| 4 | Sur desktop : hover sur `.player-card` => la flèche se déplace de 3px vers la droite | Animation flèche visible | Aucun effet |
| 5 | Sur mobile DevTools : touch sur `.session-card` => léger scale 0.995 perceptible | Micro-compression visible | Aucun feedback tactile |

---

## VISUAL-04 — Boutons de notation + progress bar

**Dépend de : VISUAL-01 (utilise `--shadow-xs`, `--ease-spring`, fonds n1-n5 plus saturés)**

### Fichiers à modifier
- `css/fenix.css` — blocs `/* ── BOUTONS NOTATION ── */` (ligne ~199) et `/* ── BARRE DE PROGRESSION EVAL ── */` (ligne ~638)

### Travail exact

**1. Rating-btn (pastilles rondes de la page eval)** — remplacer toutes les regles `.rating-btn*` du second bloc (ligne ~741) :
```css
.rating-btn {
  flex: 1; aspect-ratio: 1/1;
  max-width: 52px; min-width: 0;
  border-radius: 50%;
  border: 3px solid transparent;
  border-width: 2.5px;          /* renforcé pour lisibilité terrain */
  font-size: 0;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.12s var(--ease-spring),
              box-shadow 0.12s,
              border-color 0.1s,
              filter 0.1s;
  box-shadow: var(--shadow-xs), inset 0 1px 0 rgba(255,255,255,0.7);
  -webkit-tap-highlight-color: transparent;
}
.rating-btn:active { transform: scale(0.85); }

/* Focus clavier / switch access */
.rating-btn:focus-visible {
  outline: 3px solid var(--fenix-accent);
  outline-offset: 3px;
}

/* Couleurs de base (non sélectionné) — fonds plus saturés via VISUAL-01 */
.rating-btn.n1 { background: var(--n1-bg);  border-color: var(--n1-border); }
.rating-btn.n2 { background: var(--n2-bg);  border-color: var(--n2-border); }
.rating-btn.n3 { background: var(--n3-bg);  border-color: var(--n3-border); }
.rating-btn.n4 { background: var(--n4-bg);  border-color: var(--n4-border); }
.rating-btn.n5 { background: var(--n5-bg);  border-color: var(--n5-border); }

/* Hover desktop */
.rating-btn:hover { filter: brightness(0.92); }

/* Sélectionné : couleur pleine + ring coloré élargi */
.rating-btn.n1.selected {
  background: var(--n1-text); border-color: var(--n1-text);
  box-shadow: 0 0 0 4px rgba(153,27,27,0.22), 0 2px 8px rgba(153,27,27,0.20);
}
.rating-btn.n2.selected {
  background: var(--n2-text); border-color: var(--n2-text);
  box-shadow: 0 0 0 4px rgba(146,64,14,0.22), 0 2px 8px rgba(146,64,14,0.18);
}
.rating-btn.n3.selected {
  background: var(--n3-text); border-color: var(--n3-text);
  box-shadow: 0 0 0 4px rgba(6,95,70,0.22), 0 2px 8px rgba(6,95,70,0.18);
}
.rating-btn.n4.selected {
  background: var(--n4-text); border-color: var(--n4-text);
  box-shadow: 0 0 0 4px rgba(30,64,175,0.22), 0 2px 8px rgba(30,64,175,0.18);
}
.rating-btn.n5.selected {
  background: var(--n5-text); border-color: var(--n5-text);
  box-shadow: 0 0 0 4px rgba(91,33,182,0.22), 0 2px 8px rgba(91,33,182,0.18);
}

/* Etat pending (double-tap) — conserver la logique existante + spring */
.rating-btn.pending {
  border-width: 3px; transform: scale(1.15);
  box-shadow: 0 3px 10px rgba(0,0,0,0.15);
}
.rating-btn.n1.pending { background: var(--n1-border); border-color: var(--n1-text); }
.rating-btn.n2.pending { background: var(--n2-border); border-color: var(--n2-text); }
.rating-btn.n3.pending { background: var(--n3-border); border-color: var(--n3-text); }
.rating-btn.n4.pending { background: var(--n4-border); border-color: var(--n4-text); }
.rating-btn.n5.pending { background: var(--n5-border); border-color: var(--n5-text); }
```

**2. Progress bar d'évaluation** (remplacer `.eval-progress-bar` et `.eval-progress-fill`) :
```css
.eval-progress-bar {
  height: 8px;         /* 6px -> 8px */
  border-radius: 4px;
  background: var(--gray-200);
  overflow: hidden;
  box-shadow: var(--shadow-inset-sm);
}
.eval-progress-fill {
  height: 100%;
  border-radius: 4px;
  background: var(--gradient-progress);   /* navy -> blue gradient */
  transition: width 0.45s var(--ease-out-quart);
}
.eval-progress-fill.done {
  background: var(--gradient-progress-done);  /* vert success */
}
```

Egalement mettre a jour la `.progress-bar` generique (ligne ~254) :
```css
.progress-bar {
  height: 8px;          /* 6px -> 8px */
  background: var(--gray-200);
  border-radius: 99px;
  overflow: hidden;
  box-shadow: var(--shadow-inset-sm);
}
.progress-fill {
  height: 100%;
  background: var(--fenix-accent);
  border-radius: 99px;
  transition: width 0.45s var(--ease-out-quart);
}
```

### Criteres d'acceptation

| # | Test | PASS | FAIL |
|---|------|------|------|
| 1 | Les 5 pastilles non sélectionnées sont nettement plus saturées (rouge vif, vert vif) en pleine lumière | Couleurs franches, visibles | Pastilles pâles, quasi-blanches |
| 2 | Sélectionner la note 3 — un ring vert apparait autour de la pastille sélectionnée | Ring coloré visible (rayon 4px) | Aucun ring ou ring discret |
| 3 | La progress bar d'eval à 20% est clairement visible (pas quasi-invisible) | Fill visible même à faible % | Quasi-invisible à 20% |
| 4 | La progress bar done est verte (pas navy) | Vert success affiché | Navy ou or |
| 5 | Navigation clavier (Tab) sur les pastilles — outline gold visible | Outline gold 3px visible | Aucun focus visible |

---

## VISUAL-05 — Micro-animations et polish final

**Dépend de : VISUAL-01, VISUAL-02, VISUAL-03, VISUAL-04**

### Fichiers a modifier
- `css/fenix.css` — section `/* ── SPINNER ── */` et fin du fichier (ajouter les keyframes + classes d'animation)

### Travail exact

**1. Remplacer le keyframe `spin` et la regle `.spinner`** (ligne ~450) :
```css
.spinner {
  width: 24px; height: 24px;
  border: 3px solid var(--gray-200);
  border-top-color: var(--fenix-navy);
  border-radius: 50%;
  animation: fenix-spin 0.65s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  margin: 0 auto;
}
@keyframes fenix-spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

**2. Ajouter en fin de fichier** (après la dernière regle existante) :
```css
/* ── MICRO-ANIMATIONS FENIX ─────────────────────────────────────────────── */

/* Apparition en glissement vers le haut */
@keyframes fenix-slide-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Pop de confirmation (save, completion) */
@keyframes fenix-confirm-pop {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.06); }
  70%  { transform: scale(0.97); }
  100% { transform: scale(1); }
}

/* Pop notation selectionnee */
@keyframes fenix-rating-confirm {
  0%   { transform: scale(1); }
  35%  { transform: scale(1.18); }
  65%  { transform: scale(0.95); }
  100% { transform: scale(1); }
}

/* Badge apparition (eval complete) */
@keyframes fenix-badge-in {
  from { opacity: 0; transform: scale(0.7) translateY(4px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* Pulse gold invitation (session ouverte) */
@keyframes fenix-open-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(200,168,75,0); }
  50%       { box-shadow: 0 0 0 4px rgba(200,168,75,0.15); }
}

/* Application par composant */
.session-card {
  animation: fenix-slide-up 0.22s var(--ease-smooth) both;
}
/* Note : le JS doit ajouter style="animation-delay: Xms" (0, 40, 80…) sur chaque carte */

.player-card {
  animation: fenix-slide-up 0.20s var(--ease-smooth) both;
}

.save-status.saved {
  animation: fenix-confirm-pop 0.25s var(--ease-spring);
}

/* Classe ajoutée par JS apres confirmation de note */
.rating-btn.just-selected {
  animation: fenix-rating-confirm 0.22s var(--ease-spring);
}

/* Pulse d'invitation — 1 seule fois apres ouverture de session */
.session-card.open.highlight-pulse {
  animation: fenix-open-pulse 1.2s ease 0.3s 1;
}

/* Progress fill done : animation d'entree */
.eval-progress-fill.done {
  animation: fenix-badge-in 0.3s var(--ease-spring);
}

/* Modal overlay et panel (remplacer les keyframes existants) */
.modal-overlay { animation: fadeIn 0.18s var(--ease-smooth); }
.modal-panel   { animation: slideUp 0.22s var(--ease-out-quart); }

/* Tab button : underline animée */
.tab-btn {
  position: relative;
  color: var(--gray-500);
  transition: color 0.15s;
}
.tab-btn::after {
  content: '';
  position: absolute;
  bottom: 0; left: 50%; right: 50%;
  height: 2px;
  background: var(--fenix-accent);
  transition: left 0.2s var(--ease-smooth), right 0.2s var(--ease-smooth);
}
.tab-btn.active {
  color: var(--fenix-navy);
  font-weight: 700;
}
.tab-btn.active::after {
  left: 16px;
  right: 16px;
}
.tab-btn:hover:not(.active) { color: var(--gray-700); }

/* Focus enrichi sur formulaires */
.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--fenix-navy);
  background: var(--white);
  box-shadow: var(--shadow-glow-navy), var(--shadow-xs);
}

/* ── ACCESSIBILITE : respecter les preferences systeme ── */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Criteres d'acceptation

| # | Test | PASS | FAIL |
|---|------|------|------|
| 1 | Charger la liste des joueurs — les cartes apparaissent en glissant depuis le bas (slide-up) | Animation visible sur chaque carte | Apparition instantanee |
| 2 | Sauvegarder une note — le `.save-status` fait un micro-bounce (pop) | Bounce visible a l'oeil nu | Changement de couleur seulement |
| 3 | Activer un tab => l'underline gold s'etend depuis le centre vers les bords (expansion) | Animation underline visible | Underline apparait sans animation |
| 4 | Cliquer dans un champ input — ring navy visible autour du champ (glow) | Ring de focus blue/navy visible | Juste border-color change |
| 5 | Activer `prefers-reduced-motion: reduce` dans OS (ou DevTools) — toutes les animations disparaissent | Aucun mouvement perceptible | Animations encore presentes |

---

## RECAP : ORDRE D'EXECUTION ET TEMPS ESTIME

| Story | Focus | Temps | Dependances |
|-------|-------|-------|-------------|
| VISUAL-01 | Tokens `:root` + WCAG | ~20 min | Aucune — commencer ici |
| VISUAL-02 | Header gradient + typo | ~10 min | VISUAL-01 |
| VISUAL-03 | Cards + sessions + player | ~20 min | VISUAL-01 |
| VISUAL-04 | Rating-btn + progress bar | ~15 min | VISUAL-01 |
| VISUAL-05 | Keyframes + animations + focus | ~20 min | VISUAL-01 a 04 |

**Total estime : 1h25 — 1 session Claude Code par story.**

### Fichiers HTML potentiellement a verifier (lecture seule — ne pas modifier)

Pour tester visuellement chaque story sans modifier le HTML :
- Page coach liste joueurs => VISUAL-03 (player-card)
- Page joueur sessions => VISUAL-03 (session-card)
- Page eval critere => VISUAL-04 (rating-btn)
- N'importe quelle page => VISUAL-02 (header)
- N'importe quelle page avec liste => VISUAL-05 (slide-up)

### Hors scope de ces 5 stories (backlog visuel)

- Login page : gradient body + card shadow + btn gradient (WCAG conforme mais pas critique)
- Radar Chart.js : tokens JS datasets ATT/DEF/Staff (story JS, pas CSS)
- Section `.bandeau-entretien` : Bebas 15px -> 18px (impact faible)
- `.card-header-block` : gradient navy-gold (risque de contraste a verifier avant merge)
