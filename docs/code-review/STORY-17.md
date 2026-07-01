# Code Review — STORY-17 : Cleanup exports

**Reviewer** : Code Reviewer Agent  
**Date** : 2026-07-01  
**Verdict** : APPROUVE AVEC RESERVES

---

## Points vérifiés

| # | Critère | Résultat |
|---|---------|----------|
| 1 | `exportCoachPDF` absent de `coach-dashboard.js` (fonction + appels) | OK |
| 2 | `exportProgressionPPT` absent de `coach-dashboard.js` (fonction + appels) | OK |
| 3 | Bouton `📈 PPT Prog.` absent du template toolbar | OK |
| 4 | `exportCoachPPT` toujours présente et intacte (lignes 551–802) | OK |
| 5 | Bouton `📊 PPT` (id `btnExportPpt`, onclick `exportCoachPPT`) toujours présent | OK |
| 6 | CDN jsPDF absent de `coach.html` | OK |
| 7 | CDN PptxGenJS toujours présent dans `coach.html` | OK |
| 8 | CDN html2canvas toujours présent dans `coach.html` | OK |
| 9 | Incrémentation version `coach-dashboard.js` : `?v=61` dans `coach.html` | OK |
| 10 | `player.html` : aucun export PDF/PPT ni CDN jsPDF/PptxGenJS | OK — hors scope confirmé |
| 11 | `CLAUDE.md` mis à jour pour refléter la suppression de jsPDF | RESERVE |

---

## Issues trouvées

### Reserve — CLAUDE.md non mis à jour (dette documentaire)

Le `CLAUDE.md` référence encore jsPDF comme composant actif du projet à trois endroits :

- Section 2 (Stack technique) : ligne `| PDF | jsPDF v2.5.1 (CDN) |`
- Section 2 (CDN scripts) : ligne `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js`
- Section 8 (Performance / Contraintes) : `Chart.js et jsPDF chargés même sur pages qui ne les utilisent pas`

Ces trois références sont désormais fausses : jsPDF n'est plus chargé dans aucune page. L'agent suivant (Archiviste, en fin de cycle) devra corriger ces lignes. Ce point ne bloque pas le passage en QA mais doit être tracé.

---

## Conclusion

Les suppressions demandées sont complètes et propres : `exportCoachPDF`, `exportProgressionPPT` et le CDN jsPDF ont été retirés sans résidu. La fonction `exportCoachPPT` et son bouton toolbar sont intacts. La version est correctement incrémentée à v=61. La seule réserve concerne le `CLAUDE.md` qui documente encore jsPDF comme dépendance active — à corriger par l'Archiviste en fin de cycle.
