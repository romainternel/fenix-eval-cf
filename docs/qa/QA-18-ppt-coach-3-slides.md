# QA — STORY-16 : PPT coach 3 slides
**QA** : QA Agent  
**Date** : 2026-07-01  
**Verdict** : PASSED WITH NOTES

## Cas testés

| # | Scenario | Resultat | Notes |
|---|----------|----------|-------|
| 1 | `buildRecapBlock` absent de tout le fichier (suppression slide 2) | VALIDE | Grep sur tout `coach-dashboard.js` : aucun match |
| 2 | `captureEl('pptCaptureCR')` absent de `exportCoachPPT()` (suppression slide 5) | VALIDE | Grep : aucun match dans tout le fichier |
| 3 | `addAxisSlides` appele 2 fois — ATT (L788) et DEF avec garde `!_cPdfIsGb` (L791) | VALIDE | Garde exacte : `if (!_cPdfIsGb && _cDefId)` |
| 4 | `writeFile` present (L794) suivi du toast `PPT exporte ✓` (L795) | VALIDE | Conforme a la story |
| 5 | Fonction ferme proprement — ouvre L551, ferme L802, pas d'accolades orphelines | VALIDE | try/catch/finally complets |
| 6 | Cas GB : appel DEF saute → 2 slides generees | VALIDE | Slide 2 ATT generee avec label `🧤 GARDIEN` via ternaire L788 |
| 7 | Pas de `const`/`let` declares mais inutilises dans la fonction | NOTE | `captureEl` est definie (L615) mais jamais appelee — voir Bugs |
| 8 | Pas de `await` sur fonction non-async ou variable inexistante | VALIDE | Tous les `await` ciblent `captureDiv`, `addAxisSlides`, `prs.writeFile`, `fetch` — fonctions async confirmees |
| 9 | `coach.html` charge `coach-dashboard.js?v=61` | VALIDE | L54 de coach.html confirme `?v=61` |
| 10 | Commentaires internes refletent la nouvelle numerotation (slide 1/2/3) | ECHEC MINEUR | Commentaires disent "SLIDE 3" (L787) et "SLIDE 4" (L790) au lieu de "SLIDE 2" et "SLIDE 3" |

## Bugs trouves

**Bug 1 — Mineur — Fonction `captureEl` declaree mais inutilisee**

- Contexte : `captureEl(id, bg)` est declaree en L615 comme fonction async interne a `exportCoachPPT()`. Elle etait utilisee par les anciens slides 2 et 5. Apres leur suppression, aucun appel subsiste.
- Consequence : code mort. Pas d'erreur runtime, pas d'impact sur la generation du PPT.
- Correction recommandee : supprimer la declaration de `captureEl` (L615-L625) dans `exportCoachPPT()`.

**Bug 2 — Mineur — Commentaires de numerotation incorrects**

- Contexte : la story specifie que la numerotation interne devient slide 1 (radar), slide 2 (att), slide 3 (def). Les commentaires L787 et L790 disent respectivement `SLIDE 3 : Detail Attaque` et `SLIDE 4 : Detail Defense`.
- Consequence : maintenance degradee, confusion pour un futur developpeur. Pas d'impact fonctionnel.
- Correction recommandee : renommer en `SLIDE 2 : Detail Attaque` et `SLIDE 3 : Detail Defense`.

## Conclusion

La suppression des slides recap et CR est complete et correcte. La generation a 3 slides (ou 2 pour GB) est conforme aux criteres d'acceptation. Les deux bugs sont mineurs (code mort, commentaires) et n'affectent pas le comportement observable. Le feu vert est donne sous reserve de correction optionnelle de ces points avant la prochaine iteration.
