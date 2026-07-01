# Brief — Refonte export PPT v2 (rendu slides)

> Agent : Analyst | Date : 2026-07-01 (remplacement de STORY-13)

---

## 1. Contexte

STORY-13 a livré une première version de l'export PPT par capture html2canvas. Le résultat est insatisfaisant sur 3 points : (1) le slide 1 radar sur fond navy est visuellement lourd et ne correspond pas au rendu de l'app (fond blanc, titres de profil) ; (2) les slides 2/3 ne capturent que le tableau récap résumé (moyennes par axe) alors que le coach veut voir le détail critère par critère avec les cercles colorés ; (3) une slide de synthèse Att+Def côte à côte est souhaitée avant le détail.

## 2. Problème

Le coach ne peut pas exporter un PPT dont le contenu correspond à ce qu'il voit dans l'application. Deux zones importantes manquent : la vue détail des critères (avec descriptions et pastilles colorées Joueur/Staff/Écart), et une slide de synthèse avec les deux tableaux récap côte à côte.

## 3. Utilisateurs

- **Coach FENIX CF** — PC/Mac, en fin de session d'évaluation, veut un PPT présentable pour un entretien joueur
- **Fréquence** : occasionnel (une fois par joueur par session)
- **Bénéficiaire** : aussi le joueur qui reçoit la présentation

## 4. Vision

Un PPT en 5 slides dont chaque slide reproduit fidèlement la vue correspondante dans l'application : radar blanc avec labels de profil, tableau synthèse Att+Def côte à côte, puis 4 cartes détail par axe pour l'Attaque, puis 4 cartes détail par axe pour la Défense, puis le CR entretien.

## 5. Scope

### Dedans
- **Slide 1** : capture html2canvas d'une zone radar reconstituée (fond blanc, 2 img radar toDataURL + titres profil + légende)
- **Slide 2** : capture `#pptCaptureAtt` (gauche) + `#pptCaptureDef` (droite) côte à côte sur une slide (ou 1 centré si GB)
- **Slide 3** : 4 cartes axes Attaque en grille 2×2 — chaque carte = détail critères d'un axe (label + texte + pastilles colorées n1-n5)
- **Slide 4** : 4 cartes axes Défense en grille 2×2 (absente si GB)
- **Slide 5** : capture `#pptCaptureCR` (inchangée de STORY-13)
- Extraction de `buildAxisDetailHTML(profilId, axeId)` comme fonction pure réutilisable

### Dehors
- Modification du style CSS des zones capturées
- Export multi-joueurs ou multi-sessions
- Slide supplémentaire de couverture graphique élaborée
- Modification de `player-home.js`, `fenix.css`, `index.html`, `player.html`

## 6. Critères de succès

- Slide 1 : fond blanc, radars lisibles avec titres profil (ex. "⚡ DC", "🛡 N°2"), légende Joueur/Staff
- Slide 2 : tableaux récap Att et Def visibles côte à côte (ou centré si GB)
- Slides 3/4 : 4 cartes par slide avec noms critères, descriptions, pastilles colorées
- Export sans erreur même si un axe n'a pas de notes (pastilles "vides")
- Slide 5 CR : inchangée

## 7. Questions en suspens

- Nombre exact d'axes par profil : peut varier (3 à 5 axes). Si > 4, la grille 2×2 devient 2×3 ou similaire → à trancher par l'Architect (comportement si profil à 5 axes : probablement 2+3 → accepté en l'état)
- Logos : logo-fenix.png dans le header de chaque slide (déjà en CDN non, mais en asset local) + logo-transparent.jpeg pour slide de couverture éventuelle → à décider par le Designer
