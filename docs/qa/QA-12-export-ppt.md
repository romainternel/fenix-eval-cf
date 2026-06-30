# QA — STORY-12 : Export PowerPoint résultats joueur

> Agent : QA | Date : 2026-06-30
> Sources : STORY-12, Code Review STORY-12, Security Auditor (skippé — non applicable)

---

## Lecture des rapports précédents

- Code Reviewer : **APPROUVÉ** — 0 bloquant
- Security Auditor : **Non applicable** (export client-side, pas de backend)

---

## Critères d'acceptation — Validation

| Critère | Statut | Justification |
|---------|--------|---------------|
| `coach.html` charge PptxGenJS via CDN avant `coach-dashboard.js` | ✅ | Script CDN ajouté ligne 50, avant coach-dashboard.js ligne 54 |
| Bouton affiche "📊 PPT" et appelle `exportCoachPPT()` | ✅ | `onclick="exportCoachPPT()"`, libellé `📊 PPT`, `id="btnExportPpt"` |
| Clic sans joueur chargé → toast, pas d'erreur JS | ✅ | Guard `if (!attCanvas)` → `showToast('Ouvrez d\'abord…')` puis `return` |
| Clic avec joueur → fichier `.pptx` téléchargé | ✅ | `prs.writeFile({ fileName: \`FENIX_${safe}.pptx\` })` |
| Slide 1 : deux radars côte à côte ou un seul si GB | ✅ | `if (!_cPdfIsGb && defCanvas)` → deux radars ; `else` → un centré |
| Slide 1 : légende bleu/orange, fond navy | ✅ | `s1.background = { color:NAVY }` + `addText('● Joueur', { color:'3B82F6' })` |
| Slide 2 : tableau critères Attaque avec couleur n1-n5 | ✅ | `buildCriteresTable(s2, _cAttId, 1.35)` avec `noteCell()` |
| Slide 3 : tableau critères Défense (absent si GB) | ✅ | `if (!_cPdfIsGb && _cDefId)` conditionne la création de s3 |
| Slide 4 : sections CR non vides uniquement | ✅ | `.filter(s => s.val)` sur les sections entretien |
| Slide 4 : si tout vide → "Aucun CR saisi" | ✅ | `if (filled.length === 0)` → `s4.addText('Aucun compte-rendu saisi.')` |
| Cas GB : slide 2 titrée "GARDIEN DE BUT", pas de slide 3 | ✅ | Titre `_cPdfIsGb ? '🧤 GARDIEN DE BUT' : '⚡ ATTAQUE'` + condition slide 3 |
| Logo slides (ou absent sans erreur si fetch échoue) | ✅ | `try/catch(_) {}` silencieux, logo conditionnel `if (logoB64)` |
| `exportCoachPDF()` (joueur player-home.js) toujours fonctionnelle | ✅ | player-home.js non modifié |
| `coach-dashboard.js` version bumpée à v=44 dans `coach.html` | ✅ | `coach-dashboard.js?v=44` présent |

---

## Cas limites testés (analyse statique)

| Cas | Comportement attendu | Statut |
|-----|---------------------|--------|
| PptxGenJS CDN non chargé | Toast "Librairie PPT non chargée", return | ✅ |
| Coach clique sans avoir chargé un joueur | Toast "Ouvrez d'abord la vue résultats d'un joueur" | ✅ |
| Joueur GB (un seul radar) | Slide 1 : un radar centré. Slide 2 : "GARDIEN DE BUT". Slide 3 : absente | ✅ |
| Joueur sans aucune note | Toutes cellules affichent "—" sur fond gris | ✅ (`ev.note_joueur \|\| 0` → `noteCell(0)`) |
| CR entretien vide | Slide 4 avec "Aucun compte-rendu saisi." | ✅ |
| CR entretien partiellement rempli | Seules les sections remplies affichées | ✅ (`filter(s => s.val)`) |
| Fetch logo échoue (offline) | Slides générées sans logo, pas d'erreur | ✅ (`catch (_) {}`) |
| Double-clic sur le bouton | Premier clic → `btn.disabled = true`, 2e clic ignoré | ✅ |
| `CRITERIA[_cAttId]` undefined | `buildCriteresTable` retourne sans erreur (`if (!profil) return`) | ✅ |
| Nom joueur avec caractères spéciaux (`/`, `é`, espace) | `replace(/[^a-zA-Z0-9_-]/g, '_')` dans le nom fichier | ✅ |
| Session avec accents dans le label | Même regex de sanitisation | ✅ |

---

## Régressions

| Feature | Impact STORY-12 | Statut |
|---------|-----------------|--------|
| Export PDF joueur (`exportPlayerPDF`) | player-home.js non modifié | ✅ RAS |
| Navigation onglets coach | coach-dashboard.js : ajout seul, aucun code existant modifié sauf le bouton | ✅ RAS |
| Radar Chart.js | Canvas pas touché, `toDataURL()` standard | ✅ RAS |
| Supabase queries | Aucune query modifiée | ✅ RAS |

---

## Note Mineur (non bloquant)

Le texte `● Joueur` / `● Staff` sur slide 1 utilise `●` (U+25CF, bullet Unicode). PptxGenJS avec Calibri supporte ce caractère sur Windows/Mac. Sur LibreOffice Impress certaines polices fallback peuvent afficher un carré — risque très faible, cosmétique.

---

## Verdict

**PASSED**

Tous les critères d'acceptation sont satisfaits. Aucune régression identifiée. Prêt pour Regression Guardian.
