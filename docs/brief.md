# Brief — Dimension mentale (évaluation annuelle optionnelle par session)

> Agent : Analyst · 2026-11-12
> Source : échange avec le coach + `Idée fiche_profil_joueur ISSA SECK.xlsx` (feuille « Psychologique »)

---

## 1. Contexte

L'appli évalue aujourd'hui uniquement la **dimension technique** (profils ATT / DEF / GB, 8 profils, notes 1-5 joueur vs staff, radars de comparaison).
Le staff du Centre de Formation suit déjà la **dimension mentale** hors appli, dans une fiche Excel (volet « Psychologique – état d'esprit du joueur »), avec le même principe : un critère, une note staff, une note joueur, un écart.
Le coach veut intégrer ce volet dans l'appli pour avoir **le même questionnaire auto-évaluation + staff, et le même rendu graphique de comparaison**, sans repasser par Excel.

## 2. Problème

- Le mental est évalué sur un fichier à part : pas de saisie par le joueur sur son téléphone, pas de radar, pas de comparaison d'une année sur l'autre, pas d'export PPT unifié.
- On ne peut pas l'imposer à chaque session : le mental évolue lentement et n'a de sens qu'**environ une fois par an**. Forcer 16 critères de plus à chaque session alourdirait l'évaluation technique et réduirait la qualité des réponses.

## 3. Utilisateurs

| Qui | Contexte | Appareil |
|---|---|---|
| **Joueur** (champ ou gardien) | Se note seul, quelques minutes, lors d'une session ouverte | Mobile, portrait |
| **Coach / staff** | Note le staff sur le mental, consulte les radars, prépare l'entretien et le PPT | iPad / desktop |

Le joueur n'a besoin d'aucune formation : le parcours est identique à l'évaluation technique (pastilles, double-tap).

## 4. Vision

> Le coach décide, à la création d'une session, d'y ajouter ou non la dimension mentale ; quand elle est incluse, joueur et staff la notent comme le reste, et le résultat s'affiche en radar « Joueur vs Staff » à côté des radars techniques.

## 5. Besoin réel vs solution proposée

- Solution proposée : « une section mentale avec le même questionnaire et le même rendu ».
- Besoin réel : **voir l'écart entre la perception du joueur et celle du staff sur son état d'esprit, et suivre son évolution année après année**, pour préparer l'entretien individuel.
- Conséquence : l'**optionnalité par session** est une exigence de fond, pas un détail. Et la comparaison inter-sessions du mental est par nature **annuelle** (peu de points).

## 6. Scope

### Dedans
1. **Référentiel mental** : 4 axes × 4 critères = 16 critères (repris de l'Excel, textes corrigés), échelle 1-5 existante (Fragile → Référence).
2. **Option à la création de session** : case « Inclure la dimension mentale » (décochée par défaut) + possibilité de la modifier après coup tant que personne n'a noté le mental.
3. **Côté joueur** : onglet « Mental » dans l'évaluation (tous les joueurs, gardiens inclus), progression correcte par session.
4. **Côté coach** : notation staff du mental ; statuts de complétion calculés par session.
5. **Rendu** : radar Mental (joueur vs staff) côté joueur et côté coach, détail par axe, partage via le mécanisme existant `resultats_visibles`.
6. **Comparaison entre sessions** (bilan / bar chart / tableau de progression) pour les sessions qui incluent le mental.
7. **Export PPT coach** : slide mental.

### Dehors
- **Volet Physique** de l'Excel (mesures chiffrées : 1RM, FMS, CMJ…) : autre nature de donnée, autre chantier.
- **Colonne « Commentaire / illustration »** par critère : demande une colonne en base et un champ de saisie ; les commentaires vont dans le compte-rendu d'entretien existant.
- Moyenne « Synthèse psychologique globale » et « Appréciation générale » de l'Excel : couverts par le radar et le CR d'entretien.
- Mental pour les évaluations rétroactives des sessions passées.
- Export PDF/PPT côté joueur (réservé au coach — décision existante).

## 7. Critères de succès

1. Créer une session **sans** cocher le mental → l'appli se comporte **exactement comme avant** (zéro régression visible).
2. Créer une session **avec** le mental → un joueur de champ et un gardien voient l'onglet Mental, le remplissent, et la barre de progression passe à « complet » seulement quand technique + mental sont notés.
3. Le coach note le staff sur les 16 critères et voit le radar Mental joueur vs staff.
4. Le joueur ne voit le radar Mental (et les notes staff) que si le coach a partagé les résultats.
5. Les sessions antérieures (sans mental) ne changent ni d'affichage ni de totaux.

## 8. Questions en suspens (tranchées par défaut, modifiables)

| # | Question | Hypothèse retenue |
|---|---|---|
| Q1 | Un seul bouton « Partager les résultats » pour technique + mental, ou un partage séparé ? | **Un seul** (v1). Le mental est plus sensible : à reconsidérer si le coach veut contrôler séparément. |
| Q2 | Peut-on cocher/décocher le mental sur une session déjà créée ? | **Oui**, tant qu'aucune note mentale n'existe ; verrouillé ensuite pour ne pas masquer de données. |
| Q3 | Les deux annotations « (?) » / « (Je me sens bien dans le groupe?) » de l'Excel | **Retirées** des textes joueur ; fautes d'orthographe corrigées. |
| Q4 | Le staff doit-il voir le mental du joueur avant de noter le sien ? | Même règle que le technique (notation staff indépendante, joueur affiché en lecture seule). |
