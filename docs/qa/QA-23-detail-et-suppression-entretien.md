# QA-23 — STORY-23 : Vue détail entretien + Suppression

> Agent : QA · 2026-07-21

---

## Critères d'acceptation

| Critère | Vérification | Résultat |
|---------|-------------|---------|
| Clic sur item historique → toggle détail | `onclick="spToggle('${detailId}');this.querySelector('.sp-chev').classList.toggle('open')"` → `spToggle` masque/affiche `#ent-detail-i`, `.sp-chev.open` tourne le chevron 180° | ✅ |
| Vue détail : tous champs non vides avec labels | `detailLines` : 8 champs conditionnels, chacun conditionné sur la présence de la valeur | ✅ |
| Bouton "Supprimer cet entretien ×" dans vue détail | Présent dans le `div#ent-detail-i`, invisible tant que le détail est fermé | ✅ |
| Clic Supprimer → `confirm()` avec date | `confirm('Supprimer l'entretien du ${dateLabel} ? Cette action est irréversible.')` | ✅ |
| Confirmation → suppression DB → accordéon actualisé | DELETE sur `ssp_entretiens.id` → `spLoadJoueurDetail` → `spRenderFiche()` recharge la fiche | ✅ |
| Refus confirm() → aucune suppression | `if (!confirm(...)) return;` — fonction stoppée | ✅ |
| Deux entretiens ouverts en même temps → pas de collision | IDs `ent-detail-0`, `ent-detail-1`... uniques par session de rendu | ✅ |

---

## Cas limites

| Cas | Comportement attendu | Résultat |
|-----|---------------------|---------|
| Entretien sans aucun champ optionnel | `detailLines` vide → fallback "Aucun détail renseigné." | ✅ |
| Entretien avec tous les champs | 8 sections de détail affichées | ✅ |
| `e.examens` retourné comme string JSON | `JSON.parse(e.examens\|\|'[]')` → Array | ✅ |
| `e.actions_suivant` Array vide | Condition `actions.length` → bloc absent | ✅ |
| Clic rapide sur plusieurs items | Chaque `ent-detail-i` est indépendant — plusieurs peuvent être ouverts simultanément | ✅ acceptable |
| `_spCurrent` null lors de `spDeleteEntretien` | Guard `if (!_spCurrent) return;` — protection en place | ✅ |
| Erreur DB lors de la suppression | `alert('Erreur : ' + error.message)` — bouton non bloqué (pas de spinner) | ✅ acceptable |
| Entretien supprimé → `spRenderFiche()` rechargée | `_spEntretiens` rechargé via `spLoadJoueurDetail` → accordéon mis à jour | ✅ |

---

## Visuel

| Critère | Résultat |
|---------|---------|
| Chevron ▼/▲ sur clic | `.sp-chev.open` avec `transform:rotate(180deg)` défini en CSS | ✅ |
| Labels en majuscules gris | `.sp-detail-lbl` : `text-transform:uppercase`, `color:#9E9A90` | ✅ |
| Bouton Supprimer rouge discret | `.sp-delete-btn` : `color:#791F1F`, `background:none`, `text-align:right` | ✅ |
| Notes cellule fond ivoire italique | `background:#F7F5F0;font-style:italic` inline | ✅ |
| Badge couleur état dans détail | `.sp-couleur-recap` réutilisé (pattern existant) | ✅ |

---

## Bugs trouvés

**Aucun bug bloquant ou majeur.**

**Note pré-existante (hors STORY-23)** : `ci.label` dans `spEntretienItemHTML` contient `'🟢 Vert'`/`'🟠 Orange'`/`'🔴 Rouge'`. Ces emojis s'affichent correctement dans l'interface HTML. Dans le PDF (STORY-22), ce même `ci.label` est utilisé et ces emojis restent corrompus dans Adobe Acrobat. Ce n'est pas une régression de STORY-23 — c'est un bug résiduel de STORY-22, hors scope ici.

---

## Régressions

| Feature testée | Résultat |
|---------------|---------|
| `spRenderListe()` | Non touchée | ✅ RAS |
| `spOpenFiche()` | Appelle `spRenderFiche()` qui utilise maintenant `spEntretienItemHTML` | ✅ |
| `spSaveProfil()` | Non touchée | ✅ RAS |
| `spOpenEntretien()` / `spSaveEntretien()` | Non touchées | ✅ RAS |
| Export .md et PDF | Non touchés | ✅ RAS |
| Mode Réunion | Non touché | ✅ RAS |

---

## Verdict

**PASSED**

Tous les critères d'acceptation sont satisfaits. Aucune régression. Le bug résiduel `ci.label` avec emojis est pré-existant et hors scope.
