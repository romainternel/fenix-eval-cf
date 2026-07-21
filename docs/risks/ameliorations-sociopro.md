# Risks — Améliorations module socio-pro

> Agent : Risk Analyst · 2026-07-21

---

## R1 — Suppression accidentelle d'entretien

**Scénario** : Un référent distrait clique "Supprimer" et confirme sans relire la date.  
**Impact** : Perte d'un entretien et de ses reprises (ON DELETE CASCADE). Irréversible.  
**Probabilité** : Faible (confirm() avec date affichée)  
**Mitigation** : Message de confirmation clair avec date : "Supprimer l'entretien du 12 juin 2026 ? Cette action est irréversible." — Niveau acceptable pour une équipe de 3 référents. Pas de soft delete requis.  
**Résidu** : Acceptable.

---

## R2 — PDF : caractères spéciaux français mal encodés

**Scénario** : En supprimant les emojis, certains caractères accentués (é, è, ê, ç...) pourraient aussi poser problème si jsPDF n'encode pas correctement en UTF-8.  
**Impact** : PDF encore illisible pour un autre motif.  
**Probabilité** : Très faible — jsPDF Helvetica supporte WinAnsi qui couvre tous les accents français courants. Le texte saisi par les référents est déjà en français sans problème signalé (seuls les emojis étaient hors range).  
**Mitigation** : Tester le PDF sur un entretien réel avant push.  
**Résidu** : Négligeable.

---

## R3 — Régression `spRenderFiche()` après refactoring histEntretiens

**Scénario** : L'extraction de `spEntretienItemHTML()` introduit un bug (IDs en double si plusieurs accordéons ouverts, `e.examens` non parsé...).  
**Impact** : Historique des entretiens affiché vide ou en erreur JS.  
**Probabilité** : Modérée — changement de structure du HTML généré.  
**Mitigation** : Tester avec un joueur ayant ≥2 entretiens. Vérifier que `JSON.parse(e.examens||'[]')` ne plante pas si `examens` est déjà un Array (défensive : `Array.isArray(e.examens) ? e.examens : JSON.parse(e.examens||'[]')`).  
**Résidu** : Faible si testé.

---

## R4 — `spDeleteEntretien` appelée sans `_spCurrent`

**Scénario** : Réouverture de fiche depuis le cache avec un état incohérent.  
**Impact** : `spLoadJoueurDetail(_spCurrent)` avec `_spCurrent = null` → erreur silencieuse.  
**Probabilité** : Très faible (le bouton n'est affiché que dans spRenderFiche qui requiert _spCurrent).  
**Mitigation** : Guard `if (!_spCurrent) return;` en début de `spDeleteEntretien`.  
**Résidu** : Négligeable.

---

## R5 — Mode Réunion : joueurs sans `lastEntretien` dans les compteurs

**Scénario** : `_spReunionJoueurs` filtre déjà `filter(j => j.lastEntretien)` avant le calcul des compteurs. Les joueurs sans entretien ne sont pas comptés dans les chips couleurs, mais sont dans le total.  
**Impact** : "2 Rouge · 3 Orange · 5 Vert · 10 joueurs total" — les 10 incluent les sans-entretien.  
**Probabilité** : Certaine (par design).  
**Mitigation** : Afficher le total depuis `_spJoueurs.length` (pas `_spReunionJoueurs.length`) et ajouter une note si des joueurs n'ont pas encore d'entretien.  
**Résidu** : Acceptable — la discordance est documentée dans le design.

---

## Verdict

Aucun risque bloquant. Les 4 features peuvent avancer. Points de vigilance :
- Tester F2 (suppression) avec un vrai entretien avant push
- Tester F3 (expand) avec ≥2 entretiens et au moins un avec `examens`
- Tester le PDF (F1) dans Adobe Acrobat sur Windows
