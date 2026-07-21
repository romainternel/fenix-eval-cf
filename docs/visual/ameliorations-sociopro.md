# Visual — Améliorations module socio-pro

> Agent : Visual Crafter · 2026-07-21

---

## F2 — Bouton Supprimer

- Style : texte seulement, pas de fond (ghost destructif)
- Couleur : `#791F1F` (rouge foncé — déjà utilisé pour le niveau n1 dans l'app)
- Taille : `font-size: 12px`
- Label : `Supprimer cet entretien ×`
- Position : `text-align: right; margin-top: 10px`
- Hover : `opacity: .8; text-decoration: underline`

```css
.sp-delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #791F1F;
  font-size: 12px;
  padding: 4px 0;
  text-align: right;
  width: 100%;
}
.sp-delete-btn:hover { opacity: .8; text-decoration: underline; }
```

---

## F3 — Détail entretien expandable

### Header cliquable de chaque item
- Curseur `pointer`
- Chevron `▼` → `▲` au clic (toggle classe `open`)
- Hover : léger fond `#F7F5F0`

### Corps expandé
- `padding: 10px 0 4px`
- Séparateur `border-top: 0.5px solid #E0DDD6` entre résumé et détail
- Labels en `font-size: 11px; font-weight: 600; color: #9E9A90; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 2px`
- Valeurs en `font-size: 13px; color: #3D3B36; margin-bottom: 8px`
- Section couleur : conserver le badge coloré `sp-couleur-recap` existant (classes CSS déjà définies)
- Actions en liste à puces simples : `• action` (font-size 12px)
- Notes cellule : fond `#F7F5F0`, padding `8px`, border-radius `6px`, italic, `font-size: 12px`

---

## F4 — Mode Réunion UX

### Bandeau intro
```css
.sp-reunion-intro {
  background: #F7F5F0;
  border: 0.5px solid #E0DDD6;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 14px;
  font-size: 12px;
  color: #9E9A90;
  line-height: 1.5;
}
.sp-reunion-intro strong {
  color: #3D3B36;
  display: block;
  margin-bottom: 3px;
  font-size: 13px;
}
```

### Mini-barre statuts
- Chips inline : fond coloré, texte coloré, `border-radius: 20px`, `padding: 2px 8px`, `font-size: 11px`, `font-weight: 600`
- Rouge : bg `#FDEAEA`, text `#791F1F`
- Orange : bg `#FEF3E6`, text `#803A00`
- Vert : bg `#EBF7ED`, text `#27500A`
- Séparateur entre chips : `gap: 6px` (flexbox)

### Titre section Actions
- Format : `ACTIONS — Réunion du 21 juillet 2026`
- La date est calculée via `spDateFR(spTodayISO())`

---

## Aucun nouveau token CSS requis
Tous les styles utilisent les variables et patterns déjà présents dans `fenix.css` (sp-card, sp-sec, sp-accordion, SP_COULEURS). Les deux nouvelles classes (`sp-delete-btn`, `sp-reunion-intro`) sont minimes.
