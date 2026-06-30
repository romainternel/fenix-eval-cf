# Risks — Export PowerPoint

> Agent : Risk Analyst | Date : 2026-06-30
> Source : docs/arch/export-ppt.md

---

## Tableau des risques

| # | Risque | Prob. | Impact | Priorité | Recommandation |
|---|--------|-------|--------|----------|----------------|
| R1 | PptxGenJS CDN indisponible au moment du clic | Faible | Moyen | P1 | Guard + toast explicite "Librairie non disponible, vérifiez votre connexion" |
| R2 | Canvas `radarAtt`/`radarDef` pas encore rendus (coach clique PPT sans avoir chargé un joueur) | Moyenne | Moyen | P1 | Guard sur `gid('radarAtt')` → toast "Sélectionnez d'abord un joueur" |
| R3 | Logo fetch échoue (réseau, CORS) | Faible | Faible | P2 | try/catch silencieux → slide générée sans logo, pas d'erreur bloquante |
| R4 | `_coachEvalMap` vide (joueur sans aucune note) | Faible | Faible | P2 | Fallback `"—"` sur chaque cellule, fichier généré quand même |
| R5 | `CRITERIA[_cAttId]` undefined (profil inconnu) | Très faible | Moyen | P2 | Guard `if (!CRITERIA[profilId]) return` → slide 2/3 avec message "Profil inconnu" |
| R6 | Texte CR très long → overflow slide | Faible | Faible | P2 | PptxGenJS wrap activé + `shrinkText: true` sur les textbox CR |
| R7 | Bouton PPT cliqué deux fois rapidement → double téléchargement | Faible | Faible | P2 | `btn.disabled = true` dès le premier clic, réactivé après |
| R8 | Régression sur l'export PDF joueur (player-home.js) | Très faible | Critique | P1 | player-home.js non modifié — à confirmer par Regression Guardian |
| R9 | PptxGenJS v3 API change → incompatibilité | Très faible | Moyen | P3 | URL CDN fixée à `@3` (majeure stable), pas `@latest` |
| R10 | Cas GB : `_cDefId` null → tentative de rendu radarDef absent | Moyenne | Moyen | P1 | Guard `if (_cDefId && gid('radarDef'))` avant addImage |

---

## Risques P0

**Aucun risque P0 identifié.** La feature est un export client-side sans modification de base de données, sans Edge Function, sans impact sur les données existantes. Le risque de rupture critique est quasi-nul.

---

## Détail P1

### R1 — PptxGenJS CDN
**Critère d'acceptation à ajouter :** Si `window.PptxGenJS` est falsy au clic, afficher un toast "Librairie PPT non chargée — vérifiez votre connexion" et ne pas poursuivre.

### R2 — Canvas non rendu
**Critère d'acceptation à ajouter :** Si `gid('radarAtt')` est null, afficher un toast "Ouvrez d'abord la vue résultats d'un joueur" et ne pas poursuivre.

### R8 — Régression export PDF joueur
**Critère d'acceptation :** Regression Guardian doit confirmer que `exportPlayerPDF()` dans `player-home.js` fonctionne toujours après la STORY-12.

### R10 — Cas GB radarDef absent
**Critère d'acceptation :** Si `_cPdfIsGb` est true ou `_cDefId` est null, ne pas tenter d'ajouter `radarDef` sur la slide 1. Slide 2 et Slide 3 fusionnées en une seule slide "GARDIEN DE BUT".
