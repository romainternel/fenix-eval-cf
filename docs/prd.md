# PRD — Améliorations module socio-pro (v2)

> Agent : Product Manager · 2026-07-21
> Source : docs/brief.md

---

## Priorités

| # | Feature | Priorité | Effort estimé |
|---|---------|---------|--------------|
| 1 | Fix export PDF (emojis) | P0 — bloquant | XS — 10 min |
| 2 | Supprimer un entretien | P0 — bloquant | S — 30 min |
| 3 | Vue détail entretien complet | P1 — important | M — 1h |
| 4 | Mode Réunion UX | P2 — confort | M — 1h |

---

## Feature 1 — Fix export PDF

**Problème** : Emojis → caractères corrompus dans Adobe Acrobat.

**Solution** : Dans `spExportEntretiensPdf()`, remplacer chaque emoji par un préfixe texte ASCII-safe :
- `💬` → aucun préfixe (champ "Mot du joueur" est déjà le label)
- `✅` → `(+)`
- `⚠️` → `(!)`
- `📅` → (aucun, le label suffit)
- `🔒` → `[Conf.]`

Également ajouter les champs manquants au PDF (`comment_aider`, `examens`, `commentaire_examens`) pour parité avec l'export .md.

**Critères d'acceptation** :
- [ ] PDF ouvert dans Adobe Acrobat : aucun `Ø`, `ß`, `à`, `Ü` ou `¬` affiché
- [ ] Tous les champs d'un entretien apparaissent dans le PDF (parité avec .md)

---

## Feature 2 — Supprimer un entretien

**Problème** : Pas de bouton suppression — impossible de corriger une double saisie.

**Solution** : Dans l'accordéon `histEntretiens` de `spRenderFiche()`, ajouter un bouton "Supprimer" sur chaque item. Clic → `confirm()` → `DELETE` dans `ssp_entretiens` → rechargement.

**Critères d'acceptation** :
- [ ] Bouton "Supprimer" visible sur chaque entretien dans l'historique
- [ ] `confirm()` affiché avant la suppression (message clair avec la date)
- [ ] Après confirmation : entretien supprimé en DB, accordéon mis à jour
- [ ] Si refus du confirm : aucune action

---

## Feature 3 — Vue détail entretien complet

**Problème** : L'accordéon historique ne montre que 3 champs sur ~10.

**Solution** : Rendre chaque item de l'accordéon expandable. Clic sur l'en-tête → toggle d'une section détail affichant tous les champs non vides :
- État (couleur + justification)
- Mot du joueur
- Ce qui va / Ce qui ne va pas
- Échéances
- Comment on peut l'aider
- Actions suivantes (liste)
- Examens (si renseignés)
- Notes cellule (si renseignées)

**Critères d'acceptation** :
- [ ] Chaque entretien dans l'accordéon a un comportement toggle (clic = expand/collapse)
- [ ] Vue expandée affiche tous les champs non vides, bien formatés
- [ ] Bouton Supprimer présent dans la vue expandée (pas en vue résumée)

---

## Feature 4 — Mode Réunion UX

**Problème** : L'onglet s'intitule "Mode Réunion" mais son usage n'est pas clair.

**Solution** :
1. **Bandeau intro** : texte court expliquant l'usage (navigation joueur par joueur, triés par priorité rouge→vert)
2. **Mini-barre statuts** : avant les cartes, afficher une ligne "N rouge · M orange · P vert" pour donner la vue d'ensemble en un coup d'œil
3. **Date_réunion dans Actions** : afficher clairement "Réunion du JJ mois AAAA" dans la section Actions (date du jour)
4. **Indicateur de progression** : "Joueur X / N" déjà présent — le rendre plus visible

**Critères d'acceptation** :
- [ ] Bandeau explicatif visible à l'ouverture du Mode Réunion
- [ ] Compteurs couleur (N rouge, M orange, P vert) affichés avant les cartes
- [ ] Section "Actions de la réunion" titre avec la date formatée en français
- [ ] Navigation Précédent/Suivant toujours fonctionnelle

---

## Hors scope (rappel)

- Édition d'un entretien
- Filtrage des actions par date de réunion passée
- Police Unicode dans jsPDF
