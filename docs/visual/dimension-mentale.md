# Visual — Dimension mentale

> Agent : Visual Crafter · 2026-11-12 · Source : `docs/design/dimension-mentale.md`
> Principe : le mental a **sa propre couleur d'identité**, distincte de ATT (vert) et DEF (rouge), et **différente de l'échelle de notes n1→n5** (rouge/jaune/vert/bleu/violet) pour ne jamais être confondue avec un niveau.
> Choix : **or Fenix** (déjà dans la charte, absent des couleurs ATT/DEF) — sobre, premium, cohérent avec le header navy/gold.

---

## 1. Tokens CSS à ajouter (`:root`, à côté de `--att` / `--def`)

```css
--mental:       #7A5C0F;               /* texte / icônes sur fond clair — contraste 6,1:1 sur --mental-tag */
--mental-light: #C8A84B;               /* bordures, accents (= --fenix-gold) */
--mental-tag:   #F7EDD4;               /* fonds de badge/onglet actif (= --fenix-gold-100) */
--mental-glow:  rgba(200,168,75,0.28); /* halo focus */
```

## 2. Onglet profil (`.profil-tab.mental`)

| État | Style |
|---|---|
| Repos | identique aux onglets ATT/DEF repos |
| Actif | `border-color: var(--mental-light); background: var(--mental-tag); color: var(--mental);` |
| Badge progression actif | `background: rgba(255,255,255,0.7); color: var(--mental);` |
| Focus clavier | `outline: 2px solid var(--mental-light); outline-offset: 2px;` |

```css
.profil-tab.active.mental { border-color: var(--mental-light); background: var(--mental-tag); color: var(--mental); }
.profil-tab.active.mental .tab-progress { background: rgba(255,255,255,0.7); color: var(--mental); }
.btn-axe-eval.mental.active { background: var(--mental-light); color: var(--fenix-navy); border-color: var(--mental-light); }
.card.mental { border-left: 4px solid var(--mental-light); }
.badge-type.mental, .badge-profil.mental { background: var(--mental-tag); color: var(--mental); }
```
(Mêmes tailles, `letter-spacing` et `font-weight` que les règles `.att` / `.def` voisines — copier la structure.)

## 3. Badge « 🧠 MENTAL » sur les cartes de session

```css
.badge-mental {
  display:inline-block; margin-left:6px; padding:2px 8px; border-radius:999px;
  font:700 11px/1.4 'Inter',sans-serif; letter-spacing:.6px; text-transform:uppercase;
  color: var(--mental); background: var(--mental-tag); border:1px solid var(--mental-light);
}
```

## 4. Case « Inclure la dimension mentale » (`.mental-option`)

```css
.mental-option {
  display:flex; gap:12px; align-items:flex-start; padding:14px; cursor:pointer;
  border:1.5px solid var(--surface-border); border-radius:12px; background:#fff;
  transition: border-color .18s ease, background-color .18s ease, box-shadow .18s ease;
}
.mental-option:hover { border-color: var(--mental-light); }
.mental-option:has(input:checked) { border-color: var(--mental-light); background: var(--mental-tag); box-shadow: 0 0 0 3px var(--mental-glow); }
.mental-option input { width:22px; height:22px; accent-color: var(--fenix-navy); flex-shrink:0; margin-top:1px; }
.mental-option .mo-title { font:600 15px/1.3 'Inter',sans-serif; color: var(--fenix-navy); }
.mental-option .mo-hint  { font:400 13px/1.4 'Inter',sans-serif; color: var(--gray-600); margin-top:2px; }
```
- Cible tactile ≥ 44 px (padding 14 + contenu). `:has()` est supporté iOS 15.4+ / Chrome 105+ ; sans lui, l'`accent-color` suffit à signaler l'état (dégradation propre).

## 5. Interrupteur dans le détail de session

- Piste 44×26 px, rayon 999 ; **Off** `#D1D5DB`, **On** `var(--mental-light)` ; pouce blanc 20 px, `box-shadow: 0 1px 3px rgba(0,0,0,.25)`.
- Transition : `transform .18s ease, background-color .18s ease`.
- Disabled : `opacity:.5; cursor:not-allowed`.

## 6. Radar Mental (Chart.js)

| Élément | Valeur |
|---|---|
| Série Joueur | `border rgba(59,130,246,0.9)` / `fill rgba(59,130,246,0.15)` (= radars existants) |
| Série Staff | `border rgba(245,158,11,0.9)` / `fill rgba(245,158,11,0.15)` (= radars existants) |
| Échelle | `min 0, max 5, stepSize 1` ; grille `rgba(10,36,99,0.10)` ; labels de points `font 12px` (cohérent v=50) |
| Points | `pointRadius 3`, `pointHoverRadius 5` |
| Titre de carte | bandeau gauche `4px solid var(--mental-light)` (`.card.mental`) |
| Étiquettes d'axes | « Compétition », « Travail », « Groupe », « Projet de vie » — pas de découpe multiligne nécessaire |

> Les séries gardent les couleurs bleu/orange (Joueur/Staff) **comme les radars ATT et DEF** : l'œil lit « Joueur vs Staff » partout pareil ; la couleur or sert uniquement à identifier la **dimension**.

## 7. Lignes « Moi / Staff / écart » sous le radar

```
Compétition      Moi 3,5   Staff 4,0   +0,5
```
- Police 13 px ; nom d'axe `600 var(--fenix-navy)`, valeurs `tabular-nums`.
- Écart : pastille ronde — `|écart| ≤ 0,5` gris `#6B7280` ; `> 0,5` or (`--mental`) ; `> 1,0` rouge `--n1-text` + fond `--n1-bg`. Le signe « + » / « − » est toujours affiché (information non portée par la couleur seule).

## 8. Micro-animations

| Composant | Transition | Durée / easing |
|---|---|---|
| Onglet Mental actif | `background-color, border-color, color` | 180 ms `ease` |
| Carte radar à l'apparition | `fenix-slide-up` existante | inchangé |
| Case `.mental-option` | cf. §4 | 180 ms `ease` |
| Toast « Passe au Mental » | existant | inchangé |

Tout est neutralisé sous `@media (prefers-reduced-motion: reduce)` (règle globale déjà en place — VISUAL-05).

## 9. Checklist contraste (WCAG AA : 4,5:1 texte normal)

| Paire | Ratio approx. | OK |
|---|---|---|
| `--mental` #7A5C0F sur `--mental-tag` #F7EDD4 | ≈ 6,1:1 | ✓ |
| `--mental` #7A5C0F sur blanc | ≈ 6,9:1 | ✓ |
| `--fenix-navy` #0A2463 sur `--mental-light` #C8A84B (axe actif) | ≈ 5,2:1 | ✓ |
| `--mental-light` #C8A84B sur blanc (bordure seule, décoratif) | ≈ 2,3:1 | ✓ non porteur de texte |
| Texte `--gray-600` sur `--mental-tag` | ≥ 4,5:1 | ✓ |

> Règle : **ne jamais écrire du texte en `--mental-light` sur fond clair** (c'est un accent, pas une couleur de texte).

## 10. Versions à incrémenter

`css/fenix.css` v=50 → **51** (index.html, player.html, coach.html).
