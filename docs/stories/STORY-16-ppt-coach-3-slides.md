# STORY-16 — PPT coach simplifié : 3 slides

**En tant que** coach,
**Je veux** exporter un PPT de 3 slides propre (radar + critères ATT + critères DEF),
**Afin d'** avoir un fichier d'archivage clair sans slides redondantes.

---

## Contexte technique

- **Fichier impacté** : `pages/coach-dashboard.js`
- **Fonction modifiée** : `exportCoachPPT()`
- **Suppressions dans la fonction** :
  - Bloc "SLIDE 2 : Résumé/Bilan" (appel à `buildRecapBlock()`) → retirer entièrement
  - Bloc "SLIDE 5 : CR entretien" (appel à `captureEl('pptCaptureCR')`) → retirer entièrement
- **Après suppression** : la numérotation interne (commentaires) devient : slide 1 radar, slide 2 att, slide 3 def
- **`buildRecapBlock()`** : vérifier d'abord par grep si appelée ailleurs (voir R1 dans risks). Si appelée uniquement dans `exportCoachPPT()` → retirer la fonction elle-même. Sinon → laisser la fonction, retirer seulement l'appel PPT.

---

## Critères d'acceptation

- [ ] Grep préliminaire : `buildRecapBlock` n'est appelée qu'une fois dans `exportCoachPPT()` — sinon stopper et ajuster
- [ ] Le PPTX généré contient **exactement 3 slides** (profil non-GB) ou **2 slides** (profil GB)
- [ ] Slide 1 : radar (inchangé visuellement vs v59)
- [ ] Slide 2 : critères Attaque (inchangé visuellement vs v59, Skills inclus)
- [ ] Slide 3 : critères Défense (inchangé visuellement vs v59, absente si GB)
- [ ] La slide résumé (niveau pills par axe) n'apparaît plus
- [ ] La slide CR entretien n'apparaît plus
- [ ] Génération en < 15 secondes
- [ ] Toast "PPT exporté ✓" à la fin
- [ ] `coach-dashboard.js` bumped → v61, `coach.html` bumped → v61

---

## Hors scope

- Modification du contenu ou du rendu visuel des slides conservées
- Ajout d'une nouvelle slide
- Modification de la fonction `addAxisSlides()`

---

## Dépend de

Aucune (peut être livré avant ou après STORY-17)

---

## Taille

S
