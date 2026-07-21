# Rapport de régression — sociopro-dashboard.js v5 (STORY-23)

> Agent : Regression Guardian · 2026-07-21

---

## Changements de cette version

- `pages/sociopro-dashboard.js` v4 → v5 :
  - Ajout `spEntretienItemHTML(e, i)`
  - `histEntretiens` dans `spRenderFiche()` : inline HTML → appel `spEntretienItemHTML`
  - Ajout `spDeleteEntretien(entretienId, dateLabel)`
- `fenix-sociopro.html` :
  - CSS ajouté : `.sp-delete-btn`, `.sp-detail-lbl`, `.sp-detail-val`
  - Cache-bust `?v=4` → `?v=5`

---

## Analyse des risques de régression

### R20 — Routing referent_sociopro
Non impacté. Aucune modification du routing ou de `requireAuth`.

### R22 — Export PDF socio-pro
Non impacté. `spExportEntretiensPdf()` non touchée dans cette version.

### Export .md
`spExportEntretiensMd()` non touchée. RAS.

### Fiche joueur — accordéon entretiens
`histEntretiens` restructuré. Risque ciblé : les items s'affichent-ils correctement avec le nouveau `spEntretienItemHTML` ?
- `_spEntretiens.map((e, i) => spEntretienItemHTML(e, i))` — identique en nombre d'items
- La structure HTML a changé (div englobant + div détail caché) mais le rendu initial est équivalent au précédent (résumé visible, détail masqué)
- `spToggle()` réutilisé — fonction éprouvée
- RAS.

### `spOpenFiche` → `spRenderFiche` → après `spDeleteEntretien`
`spDeleteEntretien` appelle `spLoadJoueurDetail(_spCurrent)` puis `spRenderFiche()`. Pattern identique à `spSaveProfil()`. RAS.

### Mode Réunion
Non impacté. RAS.

---

## Points ciblés

| Item | Risque | Verdict |
|------|--------|---------|
| `histEntretiens` restructuré | Items absents ou dupliqués ? | ✅ RAS — même `_spEntretiens.map()` |
| IDs `ent-detail-i` | Collision avec `acc-entretiens` ou `acc-orients` ? | ✅ RAS — noms distincts |
| `.sp-chev.open` | Déjà défini dans fenix-sociopro.html | ✅ RAS — réutilisé |
| Cache-bust `?v=5` | Correct dans fenix-sociopro.html | ✅ |
| `spDeleteEntretien` | Rechargement complet de la fiche après suppression | ✅ RAS |

---

## Nouvelle entrée checklist

| # | Feature | Critère | Criticité |
|---|---------|---------|-----------|
| R23 | Vue détail + suppression entretien (STORY-23) | Historique : clic → détail expand/collapse ; tous champs visibles ; bouton Supprimer → confirm → suppression DB → rechargement | Important |

---

## Verdict

**RAS — Aucune régression détectée.**

STORY-23 est prête pour la mise en production.
