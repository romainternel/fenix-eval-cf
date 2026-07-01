# Rapport de régression — v52 — STORY-14 — Export PPT v2

> Agent : Regression Guardian | Date : 2026-07-01

---

## Fichiers modifiés dans cette version

| Fichier | Changement |
|---------|-----------|
| `pages/coach-dashboard.js` | Ajout `buildAxisDetailHTML()`, refactor `showAxisDetail()`, refonte `exportCoachPPT()` |
| `coach.html` | Bump `?v=45` → `?v=46` |

---

## Résultats checklist

| # | Feature | Impact STORY-14 | Résultat |
|---|---------|-----------------|----------|
| R01 | Login email/password | Aucun | ✓ RAS |
| R02 | Routage par rôle | Aucun | ✓ RAS |
| R03 | Création joueur | Aucun | ✓ RAS |
| R04 | Évaluation joueur | Aucun — `player-home.js` non modifié | ✓ RAS |
| R05 | Sessions coach | Aucun | ✓ RAS |
| R06 | Radar résultats | `showCoachRadar()` non modifié ; canvas `radarAtt`/`radarDef` toujours générés | ✓ RAS |
| R07 | Déconnexion | Aucun | ✓ RAS |
| R08 | Edge Function create-player-account | Aucun | ✓ RAS |
| R09 | RLS joueur isolé | Aucun | ✓ RAS |
| R10 | Edge Function manage-coach-account | Aucun | ✓ RAS |
| R11 | Interface gestion coachs | Aucun | ✓ RAS |
| R12 | Export PPT résultats joueur | **Modifié** — 5 slides au lieu de 4 ; bouton PPT toujours présent ; guards conservés | ✓ RAS |
| R13 | Show/hide password | Aucun | ✓ RAS |
| R14 | Radar font size | Aucun | ✓ RAS |
| R15 | Export PPT html2canvas (STORY-13) | **Supersédé** — nouvelle logique PPT v2 | ✓ R16 couvre |
| R16 | Export PPT v2 5 slides (nouveau) | **Cœur de la story** — validé par QA-14 | ✓ PASS |
| R17 | `showAxisDetail()` après refactoring (nouveau) | `buildAxisDetailHTML()` extrait, `showAxisDetail()` délègue | ✓ PASS |

---

## Points de surveillance

- `noteLegendHTML()` retiré de l'affichage DOM dans `showAxisDetail()` — changement intentionnel STORY-14. Si l'équipe souhaite la réintroduire, elle est toujours disponible dans `app.js`.
- 8 appels html2canvas séquentiels (4 axes Att + 4 axes Def) → temps de génération estimé 8–15s selon navigateur. Acceptable pour usage coach sporadique (R8 risk register P2).

---

## Verdict

**RAS — aucune régression détectée. Version v52 prête pour déploiement.**
