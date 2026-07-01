# QA — STORY-17 : Cleanup exports
**QA** : QA Agent  
**Date** : 2026-07-01  
**Verdict** : PASSED

## Cas testés

| # | Scénario | Résultat | Notes |
|---|----------|----------|-------|
| 1 | `exportCoachPDF` : 0 occurrence dans coach-dashboard.js | VALIDE | grep négatif confirmé |
| 2 | `exportProgressionPPT` : 0 occurrence dans coach-dashboard.js | VALIDE | grep négatif confirmé |
| 3 | Bouton "PPT Prog." (texte "PPT Prog" et emoji 📈) : 0 occurrence dans coach-dashboard.js | VALIDE | grep négatif confirmé |
| 4 | CDN jsPDF : 0 occurrence dans coach.html | VALIDE | grep négatif confirmé |
| 5 | `exportCoachPPT` présente et complète dans coach-dashboard.js | VALIDE | Lignes 551–802, fonction intacte |
| 6 | Bouton `btnExportPpt` présent dans le template toolbar | VALIDE | Ligne 1049 : `id="btnExportPpt" onclick="exportCoachPPT()"` |
| 7 | CDN PptxGenJS présent dans coach.html | VALIDE | Ligne 49 de coach.html |
| 8 | CDN html2canvas présent dans coach.html | VALIDE | Ligne 50 de coach.html |
| 9 | `player.html` : aucun CDN export ajouté ou retiré par erreur | VALIDE | Ni jsPDF, ni PptxGenJS, ni html2canvas dans player.html |
| 10 | `player-home.js` : aucune fonction joueur supprimée accidentellement | VALIDE | Variables `_pPdfSession` et `_pCrData` intactes, aucune occurrence manquante |
| 11 | `coach.html` charge `coach-dashboard.js?v=61` | VALIDE | Ligne 54 de coach.html |
| 12 | `coach.html` charge `fenix.css?v=50` | VALIDE | Ligne 16 de coach.html |

## Bugs trouvés

Aucun.

Note documentaire héritée du Code Reviewer (non bloquante) : le `CLAUDE.md` référence encore jsPDF à trois endroits (section Stack, CDN scripts, Performance). Ces références sont désormais inexactes. À corriger par l'Archiviste en fin de cycle.

## Conclusion

Les 4 suppressions demandées par STORY-17 sont effectives et sans résidu. Les 4 éléments à conserver sont intacts et fonctionnellement raccordés. Aucune régression détectée sur `player.html` ou `player-home.js`. Les versions `?v=61` et `?v=50` sont correctement incrémentées dans `coach.html`.
