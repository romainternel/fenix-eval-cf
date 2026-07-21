# Rapport de régression — v6 (STORY-24 : Mode Réunion UX)

> Agent : Regression Guardian · 2026-07-21

---

## Périmètre

Story STORY-24 — Mode Réunion UX : bandeau d'introduction avec compteurs colorés, navigation inchangée, titre Actions mis à jour.

Fichiers modifiés :
- `pages/sociopro-dashboard.js` v5 → v6
- `fenix-sociopro.html` (cache-bust `?v=5` → `?v=6`)

---

## Analyse d'impact

| Zone | Modifiée ? | Risque |
|------|-----------|--------|
| `spRenderReunion()` — flux principal | Oui (ajout counts + stockage `_spBandeauHTML`) | Faible — calcul additionnel avant appels existants |
| `spRenderReunionCard()` — affichage carte joueur | Oui (préfixe `_spBandeauHTML`) | Faible — contenu carte identique, `innerHTML` préfixé |
| `spRenderActionsSection()` — section actions | Oui (titre seul) | Minimal — formulaire et CRUD non touchés |
| `spReunionNav(idx)` — navigation joueurs | Non | Aucun |
| `spSaveReunionAction()`, `spUpdateReunionStatut()`, `spDeleteReunionAction()` | Non | Aucun |
| Flux liste joueurs / fiche profil / entretiens | Non | Aucun |

---

## Vérification des features critiques impactées

| # | Feature | Résultat |
|---|---------|---------|
| R20 | Routing rôle referent_sociopro | Non touché — `requireAuth` inchangé | ✅ RAS |
| R22 | Export PDF socio-pro | Non touché — `spExportEntretiensPdf` inchangé | ✅ RAS |
| R23 | Vue détail + suppression entretien | Non touché — `spEntretienItemHTML`, `spDeleteEntretien` inchangés | ✅ RAS |

---

## Régressions détectées

**Aucune.**

---

## Nouvelle entrée checklist

**R24** — Mode Réunion UX (STORY-24) · `pages/sociopro-dashboard.js`, `fenix-sociopro.html`

Critère : Ouverture Mode Réunion → bandeau affiché avec compteurs (seuls > 0 visibles) ; navigation Précédent/Suivant → bandeau persistant ; section Actions → titre "Actions de la réunion" + "Réunion du JJ mois AAAA".

---

## Verdict

**RAS** — Aucune régression détectée. STORY-24 prête pour la mise en production.
