# PRD — Refonte export PPT par capture d'écran

> Agent : Product Manager | Date : 2026-06-30
> Source : docs/brief.md (refonte STORY-12)

---

## 1. Objectif

Remplacer la génération programmatique PptxGenJS (tableaux, formes, textes via API JS) par des captures d'écran des zones HTML/CSS déjà rendues dans l'application, afin que le PPT exporté soit visuellement fidèle à ce que le coach voit à l'écran.

---

## 2. Features

### F1 — Capture des radars Chart.js (Slide 1)
Les canvas `radarAtt` et `radarDef` sont déjà en mémoire. Capturer via `canvas.toDataURL('image/png')` et insérer côte à côte dans la slide 1. Pas besoin de html2canvas — API Canvas native suffisante.

### F2 — Capture du tableau critères Attaque (Slide 2)
Capturer le nœud DOM du tableau critères Attaque déjà rendu dans la vue résultats via html2canvas. Insérer en pleine slide sous l'en-tête.

### F3 — Capture du tableau critères Défense (Slide 3)
Idem F2 pour le tableau Défense. Absent si profil GB (gardien de but).

### F4 — Capture de la section compte-rendu entretien (Slide 4)
Capturer la zone DOM contenant les champs entretien. Si la zone est vide ou absente, slide avec message "Aucun compte-rendu saisi."

### F5 — En-têtes slides via PptxGenJS
Conserver les en-têtes (bande navy, titre joueur + session, logo) générés par PptxGenJS. Seul le contenu sous l'en-tête change (image capturée vs shapes/tableaux JS).

### F6 — Ajout html2canvas CDN
Ajouter `https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js` dans `coach.html` avant `coach-dashboard.js`.

---

## 3. Priorités

| Feature | Priorité | Justification |
|---------|----------|---------------|
| F1 — Radars (canvas natif) | Must Have | Déjà fonctionnel via `toDataURL()` |
| F2 — Tableau critères Att | Must Have | Slide principale de valeur |
| F3 — Tableau critères Def | Must Have | Symétrique F2, sauf GB |
| F4 — Section CR entretien | Must Have | Complément radar |
| F5 — En-têtes PptxGenJS | Must Have | Déjà en place — conserver |
| F6 — CDN html2canvas | Must Have | Prérequis technique F2/F3/F4 |

---

## 4. Critères d'acceptation

- [ ] html2canvas chargé dans `coach.html` avant `coach-dashboard.js`
- [ ] Slide 1 : radars capturés via `toDataURL()`, côte à côte sur fond navy
- [ ] Slide 2 : tableau critères Attaque capturé via html2canvas, inséré sous l'en-tête
- [ ] Slide 3 : tableau critères Défense capturé — absent si `_cPdfIsGb`
- [ ] Slide 4 : section CR capturée — "Aucun CR saisi" si zone vide ou absente
- [ ] Si html2canvas non chargé → toast + return, pas d'erreur JS
- [ ] Si zone DOM cible absente → slide avec message gracieux, export continue
- [ ] Fichier nommé `FENIX_[nom]_[session].pptx`
- [ ] `player-home.js` non modifié

---

## 5. Hors scope

- Modifier le rendu HTML des zones capturées
- Capturer l'intégralité de la page
- Export mobile
- Choix de résolution ou de qualité par l'utilisateur
- Export PDF coach

---

## 6. Dépendances

- PptxGenJS v3 déjà en CDN dans `coach.html` ✓
- Vue résultats coach avec `radarAtt`, `radarDef`, tableau critères et section CR ✓
- html2canvas v1.4.1 à ajouter (F6)

---

## 7. Risques

- **html2canvas + CSS variables** : `var(--couleur)` peuvent ne pas être résolues → passer `backgroundColor` explicite
- **Contenu hors viewport** : html2canvas capture ce qui est visible → utiliser `scrollX:0, scrollY:0` et dimensions adaptées
- **Hauteur variable des tableaux** : peut déborder de la slide → scaling via `addImage` avec `sizing: { type:'contain' }`

---

## 1. Objectif

Remplacer l'export PDF coach par un export PowerPoint 4 slides, format paysage 16:9, brandé FENIX, généré en un clic depuis la vue résultats d'un joueur.

---

## 2. Features

### F1 — Chargement PptxGenJS via CDN *(Must Have)*
Ajouter la librairie PptxGenJS dans `coach.html` via CDN (jsDelivr ou unpkg). Elle doit être disponible avant tout clic sur le bouton PPT.

### F2 — Bouton "📊 PPT" *(Must Have)*
Remplacer le bouton `onclick="exportCoachPDF()"` par `onclick="exportCoachPPT()"` dans la vue résultats. Libellé : "📊 PPT". L'ancienne fonction `exportCoachPDF()` et le chargement de jsPDF restent en place pour le joueur (player-home.js non modifié).

### F3 — Slide 1 : Vue d'ensemble *(Must Have)*
- Fond navy `#0A2463` sur toute la slide
- Bande gold en haut (accent)
- Titre "FENIX Eval CF" + sous-titre nom joueur + session en blanc/gold
- Logo `assets/logo-transparent.jpeg` en coin bas-droit (watermark)
- Deux radars Attaque + Défense côte à côte au centre (captures canvas `radarAtt` / `radarDef`)
- Légende "● Joueur  ● Staff" en bas
- Cas GB : un seul radar centré

### F4 — Slide 2 : Critères Attaque *(Must Have)*
- En-tête de slide : "ATTAQUE — [Profil label]" avec accent gold
- Tableau par axe → critères : colonnes Critère | Note Joueur | Note Staff
- Cellule de note colorée selon niveau : n1=#ef4444, n2=#f97316, n3=#eab308, n4=#84cc16, n5=#22c55e
- Note vide (0) : cellule grise `#e2e8f0`, texte "—"
- Texte critique en blanc sur fond coloré, tailles >n2 en noir pour lisibilité

### F5 — Slide 3 : Critères Défense *(Must Have)*
Même format que Slide 2 mais pour le profil Défense. Si profil GB : fusionner avec Slide 2 (tout sur une slide titrée "GARDIEN DE BUT").

### F6 — Slide 4 : Compte-rendu entretien *(Must Have)*
- En-tête "COMPTE-RENDU D'ENTRETIEN"
- 5 sections issues des textareas : Points forts, Axes prioritaires Att, Axes prioritaires Def, Objectif CT, Objectif MT, CR entretien
- Sections vides : omises (non affichées)
- Si aucun champ rempli : slide avec message "Aucun compte-rendu saisi"

### F7 — Nom du fichier *(Must Have)*
Format : `FENIX_[NomJoueur]_[Session].pptx` (caractères spéciaux remplacés par `_`)

---

## 3. Priorités

| Feature | Priorité |
|---------|----------|
| F1 CDN PptxGenJS | Must Have |
| F2 Bouton PPT | Must Have |
| F3 Slide 1 radars | Must Have |
| F4 Slide 2 Attaque | Must Have |
| F5 Slide 3 Défense | Must Have |
| F6 Slide 4 CR | Must Have |
| F7 Nom fichier | Must Have |

---

## 4. Critères d'acceptation globaux

- [ ] Clic sur "📊 PPT" → fichier `.pptx` téléchargé sans erreur
- [ ] Le fichier s'ouvre dans PowerPoint / LibreOffice sans message d'erreur
- [ ] Slide 1 affiche les deux radars (ou un seul si GB) lisibles
- [ ] Slides 2/3 listent tous les critères avec couleur correcte par note
- [ ] Slide 4 n'affiche que les sections remplies
- [ ] L'ancien export PDF joueur (player-home.js) fonctionne toujours

---

## 5. Hors scope

- Export PDF coach (supprimé, remplacé)
- Export multi-joueurs
- Export multi-sessions en un seul PPT
- Personnalisation de la palette par l'utilisateur
- Animation ou transitions dans le PPT

---

## 6. Dépendances

- `CRITERIA` (criteria-data.js) — structure des profils et critères
- `_coachEvalMap` — map `critere_id → {note_joueur, note_staff}` déjà en mémoire
- `_cAttId`, `_cDefId`, `_cPdfNom`, `_cPdfSession`, `_cPdfIsGb` — variables globales déjà disponibles
- Canvas `radarAtt`, `radarDef` — déjà rendus au moment du clic
- Textareas `crAxesAtt`, `crAxesDef`, `crCT`, `crMT`, `crNotes` — présents dans le DOM

---

## 7. Risques

- PptxGenJS CDN non disponible → toast d'erreur, dégradation gracieuse
- Canvas radar non encore rendu au clic → guard avec vérification du DOM
- Critères null/undefined dans CRITERIA → fallback "—" systématique
