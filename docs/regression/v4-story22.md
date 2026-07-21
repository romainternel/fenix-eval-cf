# Rapport de régression — sociopro-dashboard.js v4 (STORY-22)

> Agent : Regression Guardian · 2026-07-21

---

## Changements de cette version

- `pages/sociopro-dashboard.js` v3 → v4 : `spExportEntretiensPdf()` — emojis supprimés, champs manquants ajoutés
- `fenix-sociopro.html` : cache-bust `?v=3` → `?v=4`

---

## Analyse des risques de régression

### R20 — Routing rôle referent_sociopro
Non impacté. Aucune modification de `requireAuth`, de l'entry point `initSocioPro()`, ni de la navigation.

### R21 — Gestion des référents socio-pro (coach.html)
Non impacté. La modification est dans `sociopro-dashboard.js`, pas dans `coach-dashboard.js`.

### Export .md
`spExportEntretiensMd()` — non modifiée. RAS.

### Fiche joueur / entretiens
`spRenderFiche()`, `spSaveEntretien()`, `spLoadJoueurDetail()` — non modifiées. RAS.

### Mode Réunion
`spRenderReunion()` — non modifiée. RAS.

---

## Points ciblés

| Item | Risque | Verdict |
|------|--------|---------|
| `spExportEntretiensPdf()` — logique boucle | Ajout de `examens` sans casser `actions` | ✅ RAS — `examens` parsé, conditionné sur `length` |
| Bullet `•` dans PDF | Emoji ? | ✅ WinAnsi — non emoji |
| `fenix-sociopro.html` cache-bust | Version correcte ? | ✅ `?v=4` |
| Autres fonctions du fichier | Touchées ? | ✅ RAS — seule la boucle forEach de `spExportEntretiensPdf` modifiée |

---

## Nouvelle entrée checklist

| # | Feature | Critère | Criticité |
|---|---------|---------|-----------|
| R22 | Export PDF socio-pro (STORY-22) | PDF téléchargé : aucun Ø/ß/à/Ü/¬ ; tous champs présents ; bullet `•` lisible | Important |

---

## Verdict

**RAS — Aucune régression détectée.**

STORY-22 est prête pour la mise en production.
