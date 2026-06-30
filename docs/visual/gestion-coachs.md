# Visual Specs — Gestion des comptes coachs

> Agent : Visual Crafter | Date : 2026-06-30 | Feature : gestion-coachs
> Source : docs/design/gestion-coachs.md | Tokens ref : docs/visual/fenix-eval-cf-visual-specs.md

---

## Audit visuel du contexte

La feature s'intègre dans le dashboard coach existant. Les onglets Sessions et Joueurs ont leur traitement visuel finalisé (v=47). Le badge coach et la carte coach sont des nouveaux composants — ils doivent s'aligner sur le système existant sans créer de dissonance.

**Enjeu principal** : différencier visuellement un "coach" d'un "joueur" dans la liste, sans introduire de nouvelle couleur principale.

---

## 1. Palette de tokens

Aucun nouveau token n'est nécessaire. Tout est couvert par le système existant v=47.

| Usage | Token | Valeur |
|-------|-------|--------|
| Badge "Vous" fond | `--fenix-gold-100` | `#FEF9EC` |
| Badge "Vous" texte | `--fenix-gold-600` | `#92610A` |
| Badge "Vous" bordure | `--fenix-accent` | `#C8A84B` |
| Carte coach fond | `--white` | `#FFFFFF` |
| Carte coach bordure hover | `--fenix-navy-100` | `#E8EDF7` |
| Nom du coach | `--gray-800` | `#1A1A2E` |
| Bouton supprimer | `.btn-danger` déjà défini | `--danger` existant |
| Section title | `--fenix-navy` via `.section-title` | `#0A2463` |

---

## 2. Typographie

| Élément | Font | Taille | Poids | Note |
|---------|------|--------|-------|------|
| "GESTION DES COACHS" | Bebas Neue | 18px | 400 | `.section-title` existant |
| Nom du coach (ligne liste) | Inter | 15px | 600 | `font-weight: 600` |
| Badge "Vous" | Inter | 11px | 600 | `letter-spacing: 0.5px; text-transform: uppercase` |
| Hint formulaire "(min. 8 car.)" | Inter | 12px | 400 | `--gray-400`, `.form-hint` existant |
| Erreur formulaire | Inter | 12px | 400 | `--danger`, `.form-error` existant |

---

## 3. Carte coach (nouveau composant)

Le composant `.coach-card` est une variante allégée du `.card` existant.

```css
/* Pas de nouvelle classe requise — on utilise .card avec des surcharges inline */
/* Structure : flex row, align-items center, justify-content space-between */
.card (existant)
  → padding: 12px 16px  (moins que la carte session standard)
  → display: flex; align-items: center; justify-content: space-between
  → gap: 12px
  → transition: box-shadow 200ms var(--ease-out-quart) (déjà sur .card)
```

**Badge "Vous"** — nouvelle classe `.coach-you-badge` :
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

---

## 4. États interactifs

### Carte coach
| État | Apparence |
|------|-----------|
| Default | Fond blanc, shadow-sm |
| Hover | shadow-md (déjà géré par `.card:hover`) |
| Active | Légère compression scale(0.99) (déjà géré par `.card:active`) |

### Bouton "+ Ajouter un coach"
- Réutilise `.btn.btn-primary.btn-full` — déjà stylé avec gradient navy/gold
- Pas de changement

### Bouton "Supprimer"
- `.btn.btn-danger.btn-sm` — fond rouge existant
- État `disabled` pendant la requête API : opacité 0.5, cursor not-allowed

### Bouton "Créer →" dans modal
- `.btn.btn-primary` existant
- État loading pendant l'appel API :
  ```
  [Création…]  ← texte + curseur disabled
  opacity: 0.7; pointer-events: none
  ```

### Champ en erreur
- Bordure rouge sur `.form-input` en erreur
- Message `.form-error` sous le champ — déjà dans le système

---

## 5. Micro-animations

Aucune nouvelle animation requise. Les animations existantes couvrent le cas :

| Transition | Token/règle | Déjà disponible |
|-----------|-------------|-----------------|
| Apparition liste au chargement | `@keyframes fenix-slide-up` | Oui (VISUAL-05) |
| Modal entrée | opacity + translateY | Oui (`.modal`) |
| Toast entrée | slide-up | Oui (`showToast`) |
| Hover carte | box-shadow transition | Oui (`.card:hover`) |

La nouvelle carte coach utilise `animation: fenix-slide-up 200ms var(--ease-out-quart) both` au chargement initial de la liste, avec un `animation-delay` incrémental si plusieurs cartes (0ms, 60ms, 120ms).

---

## 6. Checklist contraste WCAG

| Élément | Foreground | Background | Ratio estimé | AA (4.5:1) |
|---------|-----------|-----------|-------------|-----------|
| Nom coach (15px 600) | `--gray-800` (#1A1A2E) | `--white` (#FFF) | ~17:1 | ✅ |
| Badge "Vous" (11px 600) | `--fenix-gold-600` (#92610A) | `--fenix-gold-100` (#FEF9EC) | ~7:1 | ✅ |
| Section title (Bebas 18px) | `--fenix-navy` (#0A2463) | page bg (`--gray-50`) | ~15:1 | ✅ |
| Hint formulaire (12px) | `--gray-400` (#9CA3AF) | `--white` | ~2.8:1 | ⚠ (hint non critique) |
| Bouton danger (14px 600) | `--white` | `--danger` | ~5.5:1 | ✅ |

Note : le hint `--gray-400` ne passe pas WCAG AA strictement, mais c'est une information complémentaire non critique (comme partout dans le projet actuellement). À ne pas aggraver.

---

## 7. Ce que le Developer doit implémenter

1. **Classe `.coach-you-badge`** à ajouter dans `fenix.css` (6 lignes CSS, voir section 3)
2. **Structure HTML de la carte coach** : `.card` existant avec flex-row, `.coach-you-badge`, `.btn.btn-danger.btn-sm`
3. **Animation slide-up** sur les cartes de la liste : réutiliser `@keyframes fenix-slide-up` déjà défini
4. **Pas d'autres changements CSS** — tout le reste vient du système existant

Effort CSS : **minimal** — 1 nouvelle classe, 0 nouveaux tokens, 0 nouvelles animations.
