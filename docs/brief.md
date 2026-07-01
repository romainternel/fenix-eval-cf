# Brief — Bilan d'entretien joueur + simplification exports

> Agent : Analyst | Date : 2026-07-01

---

## 1. Contexte

L'entretien individuel coach/joueur est le moment culminant du cycle d'évaluation FENIX : on passe en revue les résultats, on identifie les axes prioritaires et on fixe des objectifs. La table `comptes_rendus` existe en base (axes_att, axes_def, objectifs_ct, objectifs_mt, notes, visible_joueur) et le coach peut déjà saisir et partager ces informations. L'export PPT coach (v59, 5 slides) est opérationnel. L'export PPT progression a été livré en v60 mais n'est pas encore validé.

---

## 2. Problème

**P1 — Le joueur n'a pas de bilan lisible.**
Le joueur voit des moyennes numériques (3.4, 4.2…) dans le tableau récap. Ce n'est pas ce qu'il retient de l'entretien. Ce qu'il veut savoir : "suis-je Acquis ou Maîtrisé en Finition ? Qu'est-ce que mon coach attend de moi ?" → les niveaux nommés et les objectifs dans une vue unique.

**P2 — Le PPT coach accumule des slides peu utiles.**
La slide 2 (résumé par axe) montre des pills Joueur + Staff côte à côte — trop chargée pour guider une conversation. La slide 5 (capture du formulaire CR) est redondante avec ce que le coach voit déjà dans l'app. Le PPT progression (v60) n'a pas de cas d'usage validé.

**P3 — Les exports s'accumulent sans purpose clair.**
PDF + PPT résumé + PPT progression + PPT critères = 4 exports. Le coach ne sait plus quoi utiliser et quand.

---

## 3. Utilisateurs

| Utilisateur | Moment | Appareil | Besoin réel |
|-------------|--------|----------|-------------|
| Joueur | Après l'entretien, vestiaire ou domicile | iPhone | Ses niveaux par axe en langage humain + ses objectifs |
| Coach | Pendant l'entretien, face au joueur | Laptop / tablette | Une vue de synthèse claire, pilotable en conversation |
| Coach | Après l'entretien, archivage | Desktop | Un fichier exporté propre pour le dossier joueur |

---

## 4. Vision

> **Donner au joueur une fiche de bilan lisible dans son app — niveaux par axe en langage humain et objectifs fixés — et réduire les exports coach à l'essentiel utile.**

---

## 5. Scope

### Dedans
- **Bilan joueur in-app** : nouvelle carte dans les résultats joueur (visible si `visible_joueur = true`), affichant les niveaux par axe (labels Fragile/En travail/Acquis/Maîtrisé/Référence pour Joueur et Staff) + axes prioritaires + objectifs CT + MT
- **PPT coach simplifié** : 3 slides (radar + critères ATT + critères DEF) — suppression slides 2 (résumé) et 5 (CR)
- **Suppression PPT progression** : bouton et fonction `exportProgressionPPT()` retirés
- **Suppression PDF coach** : bouton et fonction `exportCoachPDF()` retirés
- **Nettoyage CDN** : retrait de `jsPDF` du CDN coach.html

### Dehors
- Envoi email / notification joueur
- Bilan multi-sessions dans la fiche joueur (backlog)
- Refonte du tableau récap numérique `pRecapTableHTML` (conservé tel quel)
- Nouveau champ en base (pas de migration nécessaire)
- Modification du CSS existant de la vue résultats

---

## 6. Critères de succès

- Un joueur ouvre ses résultats après un entretien et lit son niveau nommé sur chaque axe + ses deux objectifs — sans décoder un chiffre
- Le PPT coach génère exactement 3 slides (pas plus) en < 15 secondes
- La section export du coach ne propose qu'un seul bouton `📊 PPT`
- Aucun appel API supplémentaire côté joueur (données déjà chargées)

---

## 7. Questions en suspens

- Q1 : La fiche bilan joueur remplace-t-elle `pRecapTableHTML` ou s'y ajoute-t-elle ?
  → Recommandation : **s'y ajoute**, uniquement quand `visible_joueur = true` — les deux vues coexistent sans conflit
- Q2 : Faut-il conserver `jsPDF` dans le CDN si le PDF est supprimé ?
  → Non, à retirer de coach.html (player.html ne le charge pas)
- Q3 : Le PPT corridor (slides critères att/def) reste-t-il dense ?
  → Oui mais utile au coach — à conserver en l'état (fix Skills v59 déjà appliqué)
