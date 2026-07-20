# Visual Specs — Module Socio-Pro

> Agent : Visual Crafter · 2026-07-20

---

## Positionnement visuel

Le module socio-pro doit se sentir "même famille" que le dashboard CF — pas un produit différent. La palette navy/gold reste dominante dans le header. Les cards socio-pro utilisent le fond ivoire et les borders beige du système existant.

La nouveauté visuelle : les **couleurs de suivi** (vert/orange/rouge) qui créent un code sémantique propre au module.

---

## Tokens CSS existants à réutiliser (aucun nouveau token nécessaire)

```css
/* Déjà dans fenix.css */
--fenix-navy:   #0A2463
--fenix-accent: #C8A84B
--white:        #FFFFFF
--gray-50:      #F7F5F0   /* fond alterno sp-sec-alt */
--gray-200:     #E0DDD6   /* borders cards */
--gray-400:     #9E9A90   /* textes secondaires */
--gray-600:     #6B6862
--gray-800:     #3D3B36   /* texte principal */
```

## Tokens locaux socio-pro (dans fenix-sociopro.html style)

```css
/* Vert — suivi normal */
--sp-vert-dot:    #22c55e;
--sp-vert-bg:     #EAF3DE;
--sp-vert-border: #3B6D11;
--sp-vert-text:   #27500A;

/* Orange — à surveiller */
--sp-ora-dot:    #f97316;
--sp-ora-bg:     #FAEEDA;
--sp-ora-border: #854F0B;
--sp-ora-text:   #633806;

/* Rouge — action urgente */
--sp-rouge-dot:    #ef4444;
--sp-rouge-bg:     #FCEBEB;
--sp-rouge-border: #A32D2D;
--sp-rouge-text:   #791F1F;

/* Orientation (ambre) */
--sp-amber-bg:   #FAEEDA;
--sp-amber-text: #633806;
```

---

## Hiérarchie typographique module socio-pro

| Niveau | Size | Weight | Color | Cas d'usage |
|--------|------|--------|-------|-------------|
| Section label | 11px | 600 | #9E9A90 | SP-SEC-LBL (uppercase, letter-spacing 1px) |
| Nom joueur header | 15px | 500 | white | Card header navy |
| Corps texte | 13px | 400 | #3D3B36 | Champs, réponses |
| Sous-texte | 12px | 400 | #9E9A90 | Méta (formation, date) |
| Micro label | 11px | 600 | contextuel | Badges couleur, statuts |
| Label couleur | 11px | 700 | couleur text | "🟢 Vert", "🔴 Rouge" |

---

## Bouton "Socio-Pro ↗" dans coach.html (style exit)

```css
.tab-btn-exit {
  margin-left: auto;
  color: var(--gray-400);    /* gris — pas actif comme les vrais onglets */
  font-size: 12px;
  padding: 0 12px;
}
.tab-btn-exit:hover {
  color: var(--fenix-navy);
  background: var(--gray-50);
}
/* NE JAMAIS ajouter .active à ce bouton */
```

## Bouton "← Coach" dans fenix-sociopro.html

```css
/* Implémenté via JS — s'ajoute dynamiquement dans la nav */
button.sp-back-coach {
  margin-left: auto;
  color: var(--gray-400);
  font-size: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 12px;
  white-space: nowrap;
  transition: color 0.15s;
}
button.sp-back-coach:hover { color: var(--fenix-navy); }
```

---

## Dots de couleur

```css
/* Dot dans la liste joueurs (overlay sur avatar) */
.sp-dot-status {
  position: absolute;
  bottom: 0; right: 0;
  width: 12px; height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  /* background: dynamique selon couleur */
}

/* Dot inline (headers, cards) */
.sp-dot-inline {
  display: inline-block;
  width: 10px; height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 3px;
}
```

---

## Boutons couleur (section 🚦 de l'entretien)

```css
.sp-color-btn {
  flex: 1;
  padding: 10px 4px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  border: 0.5px solid #E0DDD6;
  background: white;
  color: #9E9A90;
  text-align: center;
  transition: border 0.15s, background 0.15s, color 0.15s;
}
/* État sélectionné — appliqué par JS spSetColor() */
.sp-color-btn.selected-vert   { border: 2px solid #22c55e; background: #EAF3DE; color: #27500A; font-weight: 500; }
.sp-color-btn.selected-orange { border: 2px solid #f97316; background: #FAEEDA; color: #633806; font-weight: 500; }
.sp-color-btn.selected-rouge  { border: 2px solid #ef4444; background: #FCEBEB; color: #791F1F; font-weight: 500; }
```

---

## États interactifs

| Composant | Default | Hover | Active/Selected |
|-----------|---------|-------|-----------------|
| Bouton Voir/Entretien | border gris, bg white | bg gris-50 | — |
| Bouton Enregistrer | navy bg | opacity .88 | scale(0.99) |
| Bouton couleur | border gris, texte gris | — | border colorée 2px, bg teinté |
| Tab nav (fonctionnel) | texte gris | — | border-bottom navy 2px, texte navy |
| Bouton sortie (← Coach, Socio-Pro ↗) | texte gris-400 | texte navy | — |
| Action réunion select statut | border gris | — | selon valeur choisie |

---

## Micro-animations

```css
/* Transition save feedback */
#fp-msg, #ej-msg { transition: opacity 0.3s; }

/* Accordion chevron */
.sp-chev { transition: transform 0.18s ease; }
.sp-chev.open { transform: rotate(180deg); }

/* Couleur dot overlay (joueur liste) */
/* Pas d'animation — la couleur change entre sessions, pas en temps réel */
```

---

## Checklist contraste

| Élément | Fond | Texte | Ratio | AA |
|---------|------|-------|-------|----|
| Section label | white | #9E9A90 | 2.9:1 | ⚠️ décoratif |
| Corps texte | white | #3D3B36 | 9.6:1 | ✅ |
| Label vert sélectionné | #EAF3DE | #27500A | 7.2:1 | ✅ |
| Label orange sélectionné | #FAEEDA | #633806 | 6.1:1 | ✅ |
| Label rouge sélectionné | #FCEBEB | #791F1F | 7.8:1 | ✅ |
| Bouton exit (hover) | white | #0A2463 | 12.6:1 | ✅ |

---

## Note Visual Crafter

Le code CSS est déjà 90% en place dans `fenix-sociopro.html` (styles locaux). Aucune modification de `fenix.css` n'est nécessaire pour ce module. La consistance visuelle est atteinte via réutilisation — ne pas créer de nouveaux composants globaux pour des besoins locaux au module socio-pro.
