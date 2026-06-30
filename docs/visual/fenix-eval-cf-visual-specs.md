# FENIX Eval CF — Specs Visuelles
**Visual Crafter BMAD — v1 — 2026-06-30**

---

## AUDIT : ETAT ACTUEL

### Ce qui fonctionne
- Base tokens solide (navy/gold, palette notation 1-5, gris système)
- Hiérarchie de shadows correcte (sm / md)
- Bonne habitude de variables CSS
- `border-left: 4px solid` pour les profils ATT/DEF/GB = pattern utile
- `session-card.open` avec accent gold = lisible
- Transition `.card:hover` correcte

### Ce qui manque / problèmes identifiés

**1. Header plat sans profondeur**
Le `fenix-header` est navy uni. Aucun gradient, aucune texture, aucun effet subtil. Le `header-stripe` (6px gold) est le seul accent visuel — c'est trop timide. Sur mobile, le header est la première chose vue : il doit inspirer confiance et appartenir à une app professionnelle.

**2. Boutons de notation visuellement trop mous**
Les `.rating-btn` ronds ont une bonne mécanique (double-tap), mais les pastilles non-sélectionnées sont quasi invisibles (fonds très pâles, bordures légères). L'état `.selected` ne saute pas aux yeux. Sur terrain en plein soleil, difficile de voir quel bouton est actif.

**3. Typographie insuffisamment hiérarchisée**
- Le `h1` du header fait 15px — identique à la taille de corps. Aucun impact.
- Les `.section-title` (Bebas Neue 15px) sont trop petits pour une typo display.
- Aucune définition de `Inter 800` pour les données chiffrées (scores, pourcentages).
- `letter-spacing: 2.5px` sur Bebas est trop agressif pour 15px (illisible en gras).

**4. Cartes sans personnalité**
`.card` = blanc, border-radius 16px, shadow légère. C'est correct mais générique. Aucun effet subtil qui distingue une carte "active" d'une carte "inactive". La `.session-card.open` mérite un fond légèrement teinté, pas juste un border-left.

**5. Pas d'effets focus visibles sur mobile**
Le `.form-input:focus` change juste la border-color. Sur mobile, un ring de focus avec box-shadow colorée donne un retour plus satisfaisant. Le `.rating-btn` n'a aucun focus visible (keyboard / switch access).

**6. Progress bars ternes**
La `.progress-fill` est gold uni — bien. Mais à 6px de hauteur, le fill est invisible pour les petits pourcentages. L'`eval-progress-fill` navy est trop discret.

**7. `--fenix-blue` référencé sans être défini**
`var(--fenix-blue)` et `var(--fenix-blue-light)` sont utilisés dans les stories 09/09b (radar) mais absents du `:root`. Risque de fallback silencieux vers transparent.

**8. Absence totale de micro-feedback tactile**
`.player-card` et `.session-card` n'ont pas d'état `:hover` — seulement `:active`. Sur desktop/tablette coach, rien ne signale l'interactivité avant le tap.

**9. Page de login sous-exploitée**
Le fond navy est là, mais la carte login n'a pas d'effet premium. L'ombre `0 20px 60px rgba(0,0,0,0.3)` est générique. Le bouton de connexion manque d'un gradient ou d'un glow subtil pour attirer l'action principale.

**10. Radar Chart.js sans skin FENIX**
Les couleurs du radar utilisent probablement les défauts Chart.js. Aucune spec FENIX pour les datasets (strokeColor, fill, tension).

---

## 1. PALETTE DE TOKENS ENRICHIE

Coller ces variables dans `:root` dans `css/fenix.css`, en remplacement ou extension des existantes.

```css
:root {
  /* ── COULEURS PRIMAIRES (inchangées, rappel) ── */
  --fenix-navy:     #0A2463;
  --fenix-accent:   #C8A84B;
  --white:          #FFFFFF;

  /* ── VARIANTES NAVY (nouvelles) ── */
  --fenix-navy-800: #071A4A;   /* navy plus sombre — hover bouton primaire, header bg fond */
  --fenix-navy-600: #0F3080;   /* navy intermédiaire — hover links, états actifs légers */
  --fenix-navy-100: #E8EDF8;   /* navy très dilué — bg de sélection, highlights */
  --fenix-navy-50:  #F0F3FA;   /* navy quasi-blanc — hover surface sur fond blanc */

  /* ── VARIANTES GOLD (nouvelles) ── */
  --fenix-gold:     #C8A84B;   /* alias explicite de --fenix-accent */
  --fenix-gold-600: #A8872E;   /* gold foncé — texte sur fond clair, hover accent */
  --fenix-gold-200: #EDD89A;   /* gold pâle — bg chips actives, highlights doux */
  --fenix-gold-100: #F7EDD4;   /* gold très pâle — bg card header alternatif */
  --fenix-gold-glow: rgba(200,168,75,0.20); /* glow gold pour focus/accent */

  /* ── CORRECTION : définir fenix-blue manquant ── */
  --fenix-blue:       #1E40AF;   /* = --gb, renommé explicitement */
  --fenix-blue-light: #EEF2FF;   /* bg clair bleu pour chips bilan */

  /* ── GRIS SYSTEME (compléments) ── */
  --gray-300: #CBD5E1;  /* manquant actuellement — entre 200 et 400 */
  --gray-500: #64748B;  /* manquant — entre 400 et 600, utile pour texte secondaire */
  --gray-700: #334155;  /* manquant — corps de texte moyen */

  /* ── SURFACES ── */
  --surface-card:      #FFFFFF;
  --surface-card-alt:  #FAFBFD;  /* bg carte légèrement bleutée — variante subtile */
  --surface-border:    #E2E8F2;  /* légèrement plus bleutée que #E8EDF5 actuel */
  --surface-border-strong: #C9D4E8; /* border accentuée pour composants importants */

  /* ── OMBRES ENRICHIES ── */
  --shadow-xs:   0 1px 2px rgba(10,36,99,0.06);
  --shadow-sm:   0 1px 4px rgba(10,36,99,0.08), 0 0 0 1px rgba(10,36,99,0.04);
  --shadow-md:   0 4px 16px rgba(10,36,99,0.12), 0 1px 4px rgba(10,36,99,0.06);
  --shadow-lg:   0 8px 32px rgba(10,36,99,0.16), 0 2px 8px rgba(10,36,99,0.08);
  --shadow-xl:   0 20px 48px rgba(10,36,99,0.22), 0 4px 12px rgba(10,36,99,0.10);
  --shadow-glow-gold:  0 0 0 3px rgba(200,168,75,0.25);
  --shadow-glow-navy:  0 0 0 3px rgba(10,36,99,0.18);
  --shadow-inset-sm:   inset 0 1px 3px rgba(10,36,99,0.08);

  /* ── GRADIENTS ── */
  --gradient-header:     linear-gradient(135deg, #0A2463 0%, #071A4A 100%);
  --gradient-navy-gold:  linear-gradient(135deg, var(--fenix-navy) 0%, #1a3570 100%);
  --gradient-card-top:   linear-gradient(180deg, #FFFFFF 0%, #FAFBFD 100%);
  --gradient-gold-btn:   linear-gradient(135deg, #D4B05A 0%, #B8942E 100%);
  --gradient-progress:   linear-gradient(90deg, var(--fenix-navy) 0%, #1E40AF 100%);
  --gradient-progress-done: linear-gradient(90deg, #16A34A 0%, #22C55E 100%);

  /* ── EASING ── */
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-spring:    cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth:    cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 2. TYPOGRAPHIE

### Niveaux hiérarchiques — valeurs exactes

```css
/* ── NIVEAU 1 : Impact display (titres de sections, header app) ── */
/* Usage : section-title, header h1, bandeau-entretien-title */
.t-display {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 22px;          /* au lieu de 15px actuel — Bebas gagne en lisibilité */
  font-weight: 400;          /* Bebas n'a qu'une graisse */
  letter-spacing: 1.5px;    /* réduit de 2.5px à 1.5px — plus propre à cette taille */
  line-height: 1.1;
  text-transform: uppercase;
}

/* ── NIVEAU 2 : Titre de carte / modal ── */
/* Usage : modal-title, intro-card-title, player-greeting */
.t-card-title {
  font-family: 'Inter', sans-serif;
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.3px;   /* légèrement resserré — premium */
  line-height: 1.2;
  color: var(--fenix-navy);
}

/* ── NIVEAU 3 : Nom joueur, critère label, section heading ── */
/* Usage : player-card-name, critere-eval-label, card-header-block h2 */
.t-heading {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.1px;
  line-height: 1.3;
}

/* ── NIVEAU 4 : Corps principal ── */
/* Usage : critere-eval-texte, form-input, td, info-value */
.t-body {
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 1.55;
  color: var(--gray-800);
}

/* ── NIVEAU 5 : Texte secondaire / métadata ── */
/* Usage : player-card-email, info-label, tab-btn inactif */
.t-meta {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0;
  line-height: 1.4;
  color: var(--gray-500);
}

/* ── NIVEAU 6 : Labels caps (étiquettes de champs, section overline) ── */
/* Usage : form-label, data-table th, section-title actuel */
.t-label-caps {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.2px;
  line-height: 1.3;
  text-transform: uppercase;
  color: var(--gray-400);
}

/* ── NIVEAU 7 : Chiffre impact (score, note, pourcentage) ── */
/* Usage : note affichée en bilan, score global, pct */
.t-data {
  font-family: 'Inter', sans-serif;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
```

### Corrections spécifiques à appliquer

```css
/* Header h1 : actuellement 15px, beaucoup trop petit */
.header-text h1 {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.2px;
  line-height: 1.2;
}

/* Sous-titre header : renforcer la lisibilité du gold */
.header-text p {
  font-size: 10px;
  color: var(--fenix-accent);
  letter-spacing: 2px;
  text-transform: uppercase;
  font-weight: 600;
  opacity: 0.85;
}

/* Section-title : utiliser Bebas à taille réelle */
.section-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 18px;           /* 15px -> 18px */
  letter-spacing: 1.5px;    /* 2.5px -> 1.5px */
  color: var(--gray-500);
  margin-bottom: 14px;
}
```

---

## 3. OMBRES ET EFFETS

### Header enrichi

```css
.fenix-header {
  background: var(--gradient-header);
  box-shadow:
    0 2px 12px rgba(10,36,99,0.40),
    0 1px 3px rgba(10,36,99,0.20);
  /* ajouter un micro-reflet en bas du header */
  border-bottom: 1px solid rgba(200,168,75,0.12);
}

/* Stripe gold avec glow subtil */
.header-stripe {
  width: 5px;
  background: var(--fenix-accent);
  box-shadow: 0 0 12px rgba(200,168,75,0.35);
}
```

### Cartes

```css
/* Card par défaut */
.card {
  background: var(--gradient-card-top);
  border: 1px solid var(--surface-border);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.18s var(--ease-smooth),
              transform 0.18s var(--ease-smooth);
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

/* Card header-block : gradient au lieu du navy plat */
.card-header-block {
  background: var(--gradient-navy-gold);
  /* alternative : conserver le navy pur mais ajouter une ligne gold en bas */
  border-bottom: 2px solid rgba(200,168,75,0.25);
}
```

### Session card : version enrichie

```css
.session-card {
  background: var(--white);
  border: 1.5px solid var(--surface-border);
  box-shadow: var(--shadow-xs);
  transition: border-color 0.15s, box-shadow 0.18s var(--ease-smooth),
              transform 0.15s var(--ease-smooth);
}
.session-card:hover {
  border-color: var(--surface-border-strong);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}
.session-card:active {
  transform: scale(0.995);
  box-shadow: none;
}

/* Session ouverte : fond légèrement teinté gold, pas juste un border */
.session-card.open {
  border-left: 4px solid var(--fenix-accent);
  background: linear-gradient(135deg, #FFFDF7 0%, #FFFFFF 60%);
}

/* Session fermée : visuellement retrait clair */
.session-card.closed {
  border-left: 4px solid var(--gray-300);
  background: var(--gray-50);
  opacity: 0.72;
}
```

### Page de login — effets

```css
/* Login card : ombre dramatique sur fond navy */
.login-card {
  background: var(--white);
  border-radius: 20px;
  box-shadow:
    0 24px 64px rgba(0,0,0,0.28),
    0 4px 16px rgba(0,0,0,0.16),
    inset 0 1px 0 rgba(255,255,255,0.8);
}

/* Fond navy : gradient subtil, pas un aplat */
body {
  background:
    radial-gradient(ellipse at 50% 0%, rgba(200,168,75,0.08) 0%, transparent 60%),
    var(--gradient-header);
}

/* Bouton de connexion avec gradient gold */
.btn-login {
  background: var(--gradient-navy-gold);
  box-shadow: 0 4px 16px rgba(10,36,99,0.30);
  transition: box-shadow 0.18s, transform 0.15s, opacity 0.15s;
}
.btn-login:hover {
  box-shadow: 0 6px 24px rgba(10,36,99,0.40);
  transform: translateY(-1px);
}
.btn-login:active {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(10,36,99,0.25);
}

/* Stripe accent sous le bouton login — conserver mais épaissir */
.btn-accent-stripe {
  height: 4px;
  background: var(--fenix-accent);
  border-radius: 0 0 10px 10px;
  margin-top: -4px;
  box-shadow: 0 2px 8px rgba(200,168,75,0.35);
}
```

### Avatar joueur (player-card-avatar)

```css
.player-card-avatar {
  background: var(--gradient-navy-gold);
  box-shadow: var(--shadow-xs), inset 0 1px 0 rgba(200,168,75,0.15);
  font-size: 13px;
  letter-spacing: 0.5px;
}
```

### Glassmorphism pour modal panel

```css
/* Modal overlay plus riche */
.modal-overlay {
  background: rgba(7,26,74,0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Modal panel : séparation et profondeur */
.modal-panel {
  box-shadow: var(--shadow-xl);
  border: 1px solid rgba(255,255,255,0.8);
  border-top: 1px solid rgba(255,255,255,1);
}
```

---

## 4. ETATS INTERACTIFS

### Boutons génériques

```css
/* btn-primary enrichi */
.btn-primary {
  background: var(--fenix-navy);
  box-shadow: 0 2px 8px rgba(10,36,99,0.25);
  transition: background 0.15s, box-shadow 0.18s var(--ease-smooth),
              transform 0.15s var(--ease-smooth);
}
.btn-primary:hover {
  background: var(--fenix-navy-800);
  box-shadow: 0 4px 16px rgba(10,36,99,0.35);
  transform: translateY(-1px);
}
.btn-primary:active {
  background: var(--fenix-navy-800);
  box-shadow: var(--shadow-inset-sm);
  transform: scale(0.97);
}
.btn-primary:focus-visible {
  outline: none;
  box-shadow: var(--shadow-glow-navy), 0 2px 8px rgba(10,36,99,0.25);
}

/* btn-accent (gold) */
.btn-accent {
  background: var(--gradient-gold-btn);
  color: var(--fenix-navy);
  font-weight: 800;
  box-shadow: 0 2px 8px rgba(200,168,75,0.30);
}
.btn-accent:hover {
  box-shadow: 0 4px 16px rgba(200,168,75,0.40);
  transform: translateY(-1px);
}
.btn-accent:active {
  transform: scale(0.97);
  box-shadow: none;
}
.btn-accent:focus-visible {
  outline: none;
  box-shadow: var(--shadow-glow-gold);
}

/* btn-ghost : micro-hover */
.btn-ghost:hover {
  background: var(--fenix-navy-50);
  border-color: var(--fenix-navy-100);
  color: var(--fenix-navy);
}

/* Etat disabled : stylé, pas juste opaque */
.btn:disabled {
  opacity: 0.38;
  cursor: not-allowed;
  filter: grayscale(0.3);
  transform: none;
  box-shadow: none;
}
```

### Boutons de notation (rating-btn)

```css
/* Non-sélectionné : visible même en plein soleil */
.rating-btn {
  border-width: 2px;
  /* Ajouter du contraste aux fonds pâles */
  box-shadow: var(--shadow-xs), inset 0 1px 0 rgba(255,255,255,0.7);
  transition: transform 0.12s var(--ease-spring),
              box-shadow 0.12s,
              border-color 0.1s,
              background 0.1s;
}

/* Hover desktop sur chaque pastille */
.rating-btn.n1:hover { filter: brightness(0.92); }
.rating-btn.n2:hover { filter: brightness(0.92); }
.rating-btn.n3:hover { filter: brightness(0.92); }
.rating-btn.n4:hover { filter: brightness(0.92); }
.rating-btn.n5:hover { filter: brightness(0.92); }

/* Selected : renforcer le contraste */
.rating-btn.n1.selected { box-shadow: 0 0 0 4px rgba(153,27,27,0.22),  0 2px 8px rgba(153,27,27,0.20); }
.rating-btn.n2.selected { box-shadow: 0 0 0 4px rgba(146,64,14,0.22),  0 2px 8px rgba(146,64,14,0.18); }
.rating-btn.n3.selected { box-shadow: 0 0 0 4px rgba(6,95,70,0.22),    0 2px 8px rgba(6,95,70,0.18); }
.rating-btn.n4.selected { box-shadow: 0 0 0 4px rgba(30,64,175,0.22),  0 2px 8px rgba(30,64,175,0.18); }
.rating-btn.n5.selected { box-shadow: 0 0 0 4px rgba(91,33,182,0.22),  0 2px 8px rgba(91,33,182,0.18); }

/* Tap : spring inversé */
.rating-btn:active { transform: scale(0.85); }

/* Focus visible (accessibilité clavier/switch) */
.rating-btn:focus-visible {
  outline: 3px solid var(--fenix-accent);
  outline-offset: 3px;
}
```

### Formulaires

```css
/* Focus enrichi */
.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--fenix-navy);
  background: var(--white);
  box-shadow: var(--shadow-glow-navy), var(--shadow-xs);
}

/* Placeholder plus visible */
.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--gray-300);
  font-style: normal;
}

/* Input rempli = feedback léger */
.form-input:not(:placeholder-shown):not(:focus) {
  border-color: var(--surface-border-strong);
  background: var(--surface-card-alt);
}
```

### Player card & Session card — hover mobile-first

```css
/* Sur mobile : pas de hover, l'active suffit */
.player-card:active {
  border-color: var(--fenix-navy);
  background: var(--fenix-navy-50);
  box-shadow: 0 4px 12px rgba(10,36,99,0.12);
  transform: scale(0.99);
}

/* Sur tablette/desktop coach : hover intentionnel */
@media (hover: hover) {
  .player-card:hover {
    border-color: var(--surface-border-strong);
    box-shadow: var(--shadow-sm);
    transform: translateY(-1px);
  }
  .session-card:hover {
    border-color: var(--surface-border-strong);
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }
}
```

### Tab buttons

```css
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
```

---

## 5. MICRO-ANIMATIONS

### Principes
- Durée : 100–220ms pour le feedback immédiat, 250–350ms pour les transitions de page
- Easing : `var(--ease-spring)` pour les bounces (boutons tap), `var(--ease-smooth)` pour tout le reste
- Jamais > 250ms pour les réponses à une action utilisateur
- Aucune animation si `prefers-reduced-motion: reduce` est actif

### Keyframes à ajouter

```css
/* ── Apparition des cartes (liste sessions/joueurs) ── */
@keyframes fenix-slide-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Confirmation de sauvegarde (save-status) ── */
@keyframes fenix-confirm-pop {
  0%   { transform: scale(1); }
  40%  { transform: scale(1.06); }
  70%  { transform: scale(0.97); }
  100% { transform: scale(1); }
}

/* ── Rating sélectionné : pop de confirmation ── */
@keyframes fenix-rating-confirm {
  0%   { transform: scale(1); }
  35%  { transform: scale(1.18); }
  65%  { transform: scale(0.95); }
  100% { transform: scale(1); }
}

/* ── Badge success (éval complète) ── */
@keyframes fenix-badge-in {
  from {
    opacity: 0;
    transform: scale(0.7) translateY(4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* ── Pulse discret pour session ouverte ── */
@keyframes fenix-open-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(200,168,75,0); }
  50%       { box-shadow: 0 0 0 4px rgba(200,168,75,0.15); }
}

/* ── Spinner plus fluide (remplace le spin 0.7s linear) ── */
@keyframes fenix-spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Respect des préférences système */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Application des animations par composant

```css
/* Cartes de session en liste — délai en cascade */
.session-card {
  animation: fenix-slide-up 0.22s var(--ease-smooth) both;
}
/* Via JS : ajouter style="animation-delay: Xms" sur chaque carte (0, 40, 80…ms) */

/* Joueurs en liste */
.player-card {
  animation: fenix-slide-up 0.20s var(--ease-smooth) both;
}

/* Save status : pop quand saved */
.save-status.saved {
  animation: fenix-confirm-pop 0.25s var(--ease-spring);
  color: var(--att);
}

/* Rating bouton sélectionné — déclencher via JS après .selected */
.rating-btn.just-selected {
  animation: fenix-rating-confirm 0.22s var(--ease-spring);
}

/* Session ouverte : pulse d'invitation subtil, 1 seule fois */
.session-card.open.highlight-pulse {
  animation: fenix-open-pulse 1.2s ease 0.3s 1;
}

/* Spinner amélioré */
.spinner {
  animation: fenix-spin 0.65s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  border-color: var(--gray-200);
  border-top-color: var(--fenix-navy);
}

/* Modal panel */
.modal-panel {
  animation: slideUp 0.22s var(--ease-out-quart);
}

/* Modal overlay */
.modal-overlay {
  animation: fadeIn 0.18s var(--ease-smooth);
}
```

---

## 6. COMPOSANTS A UPGRADER — TOP 5 PRIORITES

### Priorite 1 — Header de l'app

**Probleme** : Navy plat, h1 trop petit (15px), aucun effet de profondeur. Premiere impression ratee.

**Diff exact** :
```css
/* fenix.css — remplacer la regle .fenix-header */
.fenix-header {
  background: linear-gradient(135deg, #0A2463 0%, #071A4A 100%);
  box-shadow: 0 2px 12px rgba(10,36,99,0.40), 0 1px 3px rgba(10,36,99,0.20);
  border-bottom: 1px solid rgba(200,168,75,0.12);
  /* tout le reste inchange */
}
.header-stripe {
  width: 5px;
  background: var(--fenix-accent);
  box-shadow: 0 0 14px rgba(200,168,75,0.40);
  flex-shrink: 0;
}
.header-text h1 {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.2px;
  color: var(--white);
}
.header-text p {
  font-size: 10px;
  letter-spacing: 2px;
  color: var(--fenix-accent);
  font-weight: 600;
  opacity: 0.88;
}
```

### Priorite 2 — Boutons de notation (rating-btn)

**Probleme** : Pastilles peu visibles sur terrain (plein soleil), aucun focus, tap sans feedback vibrant.

**Diff exact** :
```css
/* Renforcer les fonds non-selectionnés */
--n1-bg: #FECACA;    /* plus sature que #FEE2E2 */
--n2-bg: #FDE68A;    /* plus sature que #FEF3C7 */
--n3-bg: #A7F3D0;    /* plus sature que #D1FAE5 */
--n4-bg: #BAD7FF;    /* plus sature que #DBEAFE */
--n5-bg: #DDD6FE;    /* plus sature que #EDE9FE */

.rating-btn {
  border-width: 2.5px;
  box-shadow: var(--shadow-xs);
  transition: transform 0.12s var(--ease-spring), box-shadow 0.12s, filter 0.1s;
}
.rating-btn:focus-visible {
  outline: 3px solid var(--fenix-accent);
  outline-offset: 3px;
}
/* Les .selected gagnent un ring coloré elargi (voir section 4) */
```

### Priorite 3 — Session card ouverte (page joueur)

**Probleme** : Seul le border-left est gold. La carte ne se distingue pas assez visuellement de la version fermee. Joueur sur mobile rate parfois quelle session est active.

**Diff exact** :
```css
.session-card.open {
  border-left: 4px solid var(--fenix-accent);
  background: linear-gradient(135deg, #FFFDF5 0%, #FFFFFF 55%);
  /* micro-pulse a l'entree si c'est la seule session ouverte */
}
.session-card.open .session-badge-open {
  background: var(--fenix-gold-200);
  color: var(--fenix-gold-600);
  font-weight: 800;
  letter-spacing: 1.2px;
  /* au lieu du FEF3C7/92400E actuel moins vivant */
}
```

### Priorite 4 — Progress bar (eval-progress-bar)

**Probleme** : 6px de hauteur, fill navy discret. A 20%, on ne voit presque rien. Sur mobile, la progression n'est pas celebree visuellement.

**Diff exact** :
```css
.eval-progress-bar {
  height: 8px;          /* 6px -> 8px */
  border-radius: 4px;
  background: var(--gray-200);
  overflow: hidden;
  box-shadow: var(--shadow-inset-sm);
}
.eval-progress-fill {
  height: 100%;
  border-radius: 4px;
  background: var(--gradient-progress);
  transition: width 0.45s var(--ease-out-quart);
}
.eval-progress-fill.done {
  background: var(--gradient-progress-done);
  /* micro-animation de completion */
  animation: fenix-badge-in 0.3s var(--ease-spring);
}
```

### Priorite 5 — Player card (liste coach)

**Probleme** : Aucun hover (tablette coach). Avatar navy plat. Arrow color gray-400 invisible. Badges profil trop petits (12px, illisibles en liste dense).

**Diff exact** :
```css
/* Avatar avec gradient */
.player-card-avatar {
  background: linear-gradient(135deg, var(--fenix-navy) 0%, #1a3570 100%);
  box-shadow: 0 1px 4px rgba(10,36,99,0.18);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: var(--fenix-accent);
}

/* Hover desktop coach */
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
.player-card-arrow {
  transition: color 0.15s, transform 0.15s;
}

/* Badge profil : un cran plus large */
.badge-profil {
  font-size: 11px;
  padding: 3px 9px;    /* 2px 8px -> 3px 9px */
}
```

---

## 7. CHECKLIST CONTRASTE WCAG

Standard cible : **AA (4.5:1 minimum pour texte normal, 3:1 pour grand texte / composants UI)**.

| Element | Texte | Fond | Ratio estimé | Statut |
|---|---|---|---|---|
| Header h1 blanc | `#FFFFFF` | `#0A2463` | 12.6:1 | AA |
| Sous-titre gold sur navy | `#C8A84B` | `#0A2463` | 4.6:1 | AA |
| `.gray-400` sur blanc | `#94A3B8` | `#FFFFFF` | 2.9:1 | ECHEC texte normal |
| `.gray-500` sur blanc | `#64748B` | `#FFFFFF` | 4.6:1 | AA |
| `.gray-600` sur blanc | `#475569` | `#FFFFFF` | 6.1:1 | AA |
| n1-text sur n1-bg | `#991B1B` | `#FEE2E2` | 5.2:1 | AA |
| n2-text sur n2-bg | `#92400E` | `#FEF3C7` | 5.4:1 | AA |
| n3-text sur n3-bg | `#065F46` | `#D1FAE5` | 6.3:1 | AA |
| n4-text sur n4-bg | `#1E40AF` | `#DBEAFE` | 5.5:1 | AA |
| n5-text sur n5-bg | `#5B21B6` | `#EDE9FE` | 5.1:1 | AA |
| att `#166534` sur att-tag `#DCFCE7` | `#166534` | `#DCFCE7` | 6.1:1 | AA |
| def `#991B1B` sur def-tag `#FEE2E2` | `#991B1B` | `#FEE2E2` | 5.2:1 | AA |
| gb `#1E40AF` sur gb-tag `#DBEAFE` | `#1E40AF` | `#DBEAFE` | 5.5:1 | AA |
| Navy sur gold btn | `#0A2463` | `#C8A84B` | 5.3:1 | AA |
| Gray-400 dans section-title | `#94A3B8` | `#F8FAFC` | 2.7:1 | ECHEC |
| Btn-logout sur navy | `rgba(255,255,255,0.6)` | `#0A2463` | ~4.0:1 | Limite — risque |

### Corrections obligatoires

**1. `.gray-400` en texte courant = ECHEC WCAG**
Partout ou `gray-400` est utilisé comme texte lisible (section-title, player-card-email, rating-labels, info-label), remplacer par `gray-500` (#64748B) minimum.

```css
/* Remplacements prioritaires */
.section-title    { color: var(--gray-500); }   /* etait gray-400 */
.player-card-email { color: var(--gray-500); }  /* etait gray-400 */
.rating-labels    { color: var(--gray-500); }   /* etait gray-400 */
.progress-label   { color: var(--gray-500); }   /* etait gray-400 */
.breadcrumb       { color: var(--gray-500); }   /* etait gray-400 */
```

**2. btn-logout : renforcer l'opacité**
```css
.btn-logout {
  color: rgba(255,255,255,0.75);  /* 0.6 -> 0.75 */
}
```

**3. section-title avec Bebas Neue : cas particulier**
Bebas Neue est une police display — ses formes larges permettent un ratio plus bas (3:1 acceptable pour grand texte). A 18px/400, elle tombe dans la categorie "grand texte" WCAG. `gray-500` (#64748B) sur `gray-100` (#F1F5F9) donne 3.7:1, ce qui satisfait AA grand texte.

---

## TOKENS RADAR CHART.JS

Pour que le radar Chart.js soit aux couleurs FENIX, appliquer ces options dans le JS d'initialisation :

```js
// Dataset ATT
{
  borderColor: 'rgba(22,101,52,0.9)',       // att #166534
  backgroundColor: 'rgba(22,101,52,0.12)',
  borderWidth: 2,
  pointBackgroundColor: '#166534',
  pointBorderColor: '#FFFFFF',
  pointRadius: 4,
  pointHoverRadius: 6,
  tension: 0,
}
// Dataset DEF
{
  borderColor: 'rgba(153,27,27,0.9)',
  backgroundColor: 'rgba(153,27,27,0.10)',
  borderWidth: 2,
  pointBackgroundColor: '#991B1B',
  pointBorderColor: '#FFFFFF',
  pointRadius: 4,
  pointHoverRadius: 6,
  tension: 0,
}
// Dataset Staff (comparaison)
{
  borderColor: 'rgba(200,168,75,0.85)',      // gold
  backgroundColor: 'rgba(200,168,75,0.08)',
  borderWidth: 1.5,
  borderDash: [4, 3],
  pointBackgroundColor: '#C8A84B',
  pointBorderColor: '#FFFFFF',
  pointRadius: 3,
  tension: 0,
}
// Options globales radar
scales: {
  r: {
    min: 0, max: 5,
    ticks: {
      stepSize: 1,
      font: { family: 'Inter', size: 10, weight: '600' },
      color: '#94A3B8',
      backdropColor: 'transparent',
    },
    grid: { color: 'rgba(10,36,99,0.08)' },
    pointLabels: {
      font: { family: 'Inter', size: 11, weight: '700' },
      color: '#475569',
    },
    angleLines: { color: 'rgba(10,36,99,0.10)' },
  }
}
```

---

## ORDRE D'IMPLEMENTATION RECOMMANDE

1. **Tokens CSS** — Ajouter les nouveaux custom properties dans `:root` (10 min)
2. **Corrections WCAG** — Remplacer gray-400 par gray-500 sur les textes courants (15 min)
3. **Header** — Gradient + stripe glow + h1 size (5 min)
4. **rating-btn** — Fonds plus saturés + focus-visible + ring selected (10 min)
5. **session-card.open** — Fond teinté gold + badge renforce (5 min)
6. **progress-bar** — Hauteur 8px + gradient fill (5 min)
7. **Keyframes** — Ajouter les 6 animations + prefers-reduced-motion (10 min)
8. **player-card** — Avatar gradient + hover media query (10 min)
9. **login page** — Body gradient + card shadow + btn gradient (10 min)
10. **Radar Chart.js** — Options dataset dans le JS (15 min)

**Temps total estimé : 1h30 de CSS pur sans changement de structure HTML.**
