# STORY-25 — Ajouter le référentiel mental et les helpers de session

**En tant que** développeur de l'appli,
**Je veux** un profil `mental` (16 critères) dans `criteria-data.js`, des helpers de calcul « par session » et le CSS d'identité mental,
**Afin que** toutes les stories suivantes s'appuient sur une source unique de critères, de totaux et de styles.

## Contexte technique
- Zones : `js/criteria-data.js`, `css/fenix.css`, `pages/coach-dashboard.js` (`PROFIL_LABELS` uniquement).
- Aucun changement visible tant que les stories 26-28 ne sont pas livrées (le profil n'est utilisé nulle part).
- Spéc : `docs/arch/dimension-mentale.md` §1, §4, §5 ; `docs/visual/dimension-mentale.md` §1-3.
- Ids d'axes **sans tiret** : `competition`, `travail`, `groupe`, `projet` (`getCritereById` en dépend — risque R9).

### Données à saisir (label = titre ; texte = phrase « Je… » affichée au joueur)
**competition — « Compétition »**
1. *Gestion du stress et de la pression en match* — « Le contexte du match n'affecte pas mes performances. Je me sens meilleur quand il y a de l'enjeu. »
2. *Confiance en soi / prise de responsabilité dans les moments clés* — « Je sais que je vais réussir quand ça devient important. »
3. *Capacité à rebondir après une erreur ou une défaite* — « Je suis capable de me projeter très vite vers les prochaines échéances sans douter après mon dernier échec. »
4. *Combativité et engagement sur des matchs à enjeu* — « Je suis capable de me transcender et de dépasser mes limites. »

**travail — « Travail »**
1. *Assiduité et ponctualité* — « Je suis toujours en avance quand je le peux. »
2. *Capacité à travailler de façon acharnée et rigoureuse* — « Je suis capable d'absorber une charge de travail intensive avec rigueur, constance et détermination, même face à la fatigue et à la difficulté. »
3. *Réceptivité aux consignes et capacité à se corriger* — « Je suis toujours capable d'activer un état de vigilance maximum pour comprendre et faire. »
4. *Autonomie dans le travail individuel (physique, vidéo, récupération)* — « Je sais ce dont j'ai besoin et je le mets en œuvre seul. »

**groupe — « Groupe »**
1. *Communication avec les coéquipiers* — « J'ai de la complicité avec tous mes coéquipiers. »
2. *Respect des règles de vie collective du centre* — « Je fais toujours attention à rester dans le cadre que le groupe a fixé. »
3. *Leadership / entraide envers les jeunes joueurs* — « Je me sens légitime à donner mon avis et je me sens écouté quand c'est le cas. »
4. *Intégration et comportement en dehors du terrain* — « Je partage des moments de convivialité avec mes coéquipiers en dehors du terrain. »

**projet — « Projet de vie »**
1. *Clarté et maturité du double projet (scolaire/pro + handball)* — « J'ai des objectifs SMART : Spécifiques, Mesurables, Atteignables, Réalistes et Temporels. »
2. *Investissement scolaire ou professionnel* — « Je fais tous les efforts pour réussir mes projets. »
3. *Capacité de projection à moyen terme (N+1, N+2)* — « Je sais comment atteindre mes objectifs. »
4. *Maturité générale et prise de recul sur son parcours* — « Je suis capable d'analyser avec discernement ma trajectoire de vie actuelle et passée. »

Ids : `mental-{competition|travail|groupe|projet}-{1..4}`.

## Critères d'acceptation
- [ ] `CRITERIA.mental` existe avec `type: "mental"`, 4 axes, 4 critères chacun (16 au total), ids conformes.
- [ ] `getAllCriteres('mental').length === 16`.
- [ ] Pour les 16 ids, `getCritereById(id)` retourne le bon critère (vérifié en console).
- [ ] `sessionProfilIds({profil_att:'ailier-att', profil_def:'n1-def'}, {inclut_mental:true})` → `['ailier-att','n1-def','mental']`; avec `{inclut_mental:false}` ou `undefined` → sans `mental`.
- [ ] `sessionProfilIds({profil_gb:'gb'}, {inclut_mental:true})` → `['gb','mental']`.
- [ ] `sessionTotalCriteres` retourne la somme des critères des profils renvoyés (profil `null` toléré → seulement le mental si session mentale).
- [ ] `PROFIL_LABELS.mental === 'Dimension mentale'`.
- [ ] `css/fenix.css` contient les tokens `--mental`, `--mental-light`, `--mental-tag`, `--mental-glow` et les règles `.profil-tab.active.mental`, `.profil-tab.active.mental .tab-progress`, `.btn-axe-eval.mental.active`, `.card.mental`, `.badge-type.mental`, `.badge-profil.mental`, `.badge-mental` (spec visual §2-3).
- [ ] Textes corrigés : aucun « perfomance », « acharné », « rigeur », « vigilence », « (?) ».
- [ ] Versions `?v=` bumpées dans `coach.html`, `player.html` (et `index.html` si `fenix.css` y est chargé) : css 51, criteria-data 34.
- [ ] Aucune régression : l'appli se charge, session technique existante identique (vérif rapide coach + joueur).

## Hors scope
Aucune UI, aucune migration SQL, aucun radar. Ne pas toucher aux profils techniques.

## Dépend de
- Aucune.

## Taille
S
