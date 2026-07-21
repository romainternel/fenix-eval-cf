# STORY-22 — Fix export PDF socio-pro

> Scrum Master · 2026-07-21
> Fichier : `pages/sociopro-dashboard.js` (v3 → v4)

---

## Contexte

La fonction `spExportEntretiensPdf()` utilise des emojis (💬 ✅ ⚠️ 📅 🔒) qui s'affichent en caractères corrompus dans Adobe Acrobat. jsPDF/Helvetica ne couvre pas ces codepoints Unicode. De plus, des champs sont absents du PDF par rapport à l'export .md (comment_aider, examens, commentaire_examens).

## Tâches

1. Dans `spExportEntretiensPdf()`, remplacer chaque emoji par un équivalent texte :
   - `💬 Mot du joueur :` → `Mot du joueur :`
   - `✅ Ce qui va :` → `(+) Ce qui va :`
   - `⚠️ Ce qui ne va pas :` → `(!) Ce qui ne va pas :`
   - `📅 Échéances :` → `Echeances :`
   - `🔒 Notes cellule :` → `[Conf.] Notes cellule :`

2. Ajouter les champs manquants dans la boucle d'entretiens du PDF (après `echeances`, avant `actions`) :
   ```javascript
   if (e.comment_aider) line(`Comment l'aider : ${e.comment_aider}`, 2, 9);
   ```
   Et après les actions :
   ```javascript
   const examens = Array.isArray(e.examens) ? e.examens : JSON.parse(e.examens||'[]');
   if (examens.length) {
     line(`Examens :`, 2, 9, true);
     examens.forEach(ex => line(`${ex.matiere} : ${ex.note}${ex.tendance ? ' ('+ex.tendance+')' : ''}`, 4, 9));
     if (e.commentaire_examens) line(`Commentaire : ${e.commentaire_examens}`, 4, 9);
   }
   ```

3. Incrémenter `sociopro-dashboard.js` → v4 dans `fenix-sociopro.html`

## Critères d'acceptation

- [ ] PDF généré sans aucun caractère corrompu (Ø, ß, à, Ü, ¬)
- [ ] Tous les champs non vides d'un entretien apparaissent dans le PDF
- [ ] Le bullet `•` des actions reste intact (WinAnsi compatible)
- [ ] Pas de régression sur l'export .md (fonction distincte, non modifiée)

## Notes techniques

- Scope limité à `spExportEntretiensPdf()` uniquement
- `_spEntretiens` est chargé via `select('*')` → `e.comment_aider`, `e.examens`, `e.commentaire_examens` sont disponibles
- Ne pas modifier `spExportEntretiensMd()` (pas impacté)
