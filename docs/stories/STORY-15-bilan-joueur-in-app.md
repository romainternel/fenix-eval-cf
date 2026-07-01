# STORY-15 — Bilan d'entretien joueur in-app

**En tant que** joueur,
**Je veux** voir dans mes résultats une fiche de bilan lisible avec mes niveaux par axe et mes objectifs,
**Afin de** comprendre où j'en suis et ce que mon coach attend de moi — sans devoir décoder des chiffres.

---

## Contexte technique

- **Fichiers impactés** : `pages/player-home.js`, `css/fenix.css`
- **Fonction à créer** : `pBilanEntretienHTML(attId, defId, evalMap, cr)` — pure, sans effet de bord DOM
- **Fonction à créer** : `pLevelFromAvg(avg)` — retourne 1-5 ou null
- **Intégration** : dans `showPlayerResults()`, insérer la carte bilan **après** `bilanCard` et **avant** la carte CR existante
- **Condition d'affichage** : `cr !== null` (le filtre Supabase `eq('visible_joueur', true)` garantit que `cr` est null si non partagé)
- **Données disponibles** : `_pEvalMap` (notes J+S par critère), `_pCrData` (CR complet), `CRITERIA` (axes et critères), `_pAttId`, `_pDefId`, `_pIsGb`

---

## Critères d'acceptation

- [ ] La carte bilan **n'apparaît pas** si `cr` est null ou si `visible_joueur = false`
- [ ] La carte affiche un header navy "📋 BILAN D'ENTRETIEN" avec la date du CR en gold (format `jour mois année`)
- [ ] Pour chaque profil (ATT et éventuellement DEF), un tableau 3 colonnes : Axe | Mon niveau | Coach
- [ ] Les niveaux sont des pills colorées avec le label (Fragile / En travail / Acquis / Maîtrisé / Référence) — même couleurs que le PPT coach
- [ ] Si avg joueur indisponible (aucune note_joueur sur l'axe) → pill grise "—"
- [ ] Si avg staff indisponible (aucune note_staff sur l'axe) → pill grise "—"
- [ ] Axes prioritaires ATT affichés en italique sous le tableau ATT si `cr.axes_att` non vide
- [ ] Axes prioritaires DEF affichés en italique sous le tableau DEF si `cr.axes_def` non vide
- [ ] Objectif CT affiché si `cr.objectifs_ct` non vide
- [ ] Objectif MT affiché si `cr.objectifs_mt` non vide
- [ ] Profil GB : uniquement le tableau GB (pas de section DEF)
- [ ] Les classes CSS `.bilan-entretien-*` et `.bilan-level-pill` sont ajoutées à `fenix.css`
- [ ] `fenix.css` bumped v49 → v50 ; `player-home.js` bumped → v41 ; `player.html` mis à jour si nécessaire

---

## Hors scope

- Interaction / clic sur les lignes du tableau bilan
- Modification de `pRecapTableHTML` existant
- Affichage des notes individuelles par critère dans le bilan
- Bilan multi-sessions

---

## Dépend de

Aucune (données déjà disponibles en mémoire)

---

## Taille

M
