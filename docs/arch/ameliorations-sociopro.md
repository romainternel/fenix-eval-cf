# Architecture — Améliorations module socio-pro

> Agent : Architect · 2026-07-21

---

## Périmètre des modifications

Un seul fichier source modifié : `fenix-eval-cf/pages/sociopro-dashboard.js`  
Version actuelle : `v3` → passera à `v4`  
Référencé dans : `fenix-eval-cf/fenix-sociopro.html` (cache-bust à mettre à jour)

Aucune modification de schéma DB, aucune Edge Function, aucun fichier CSS ajouté (les 2 classes visuelles nouvelles sont inline ou dans le JS).

---

## F1 — Fix PDF

### Zone de modification
`spExportEntretiensPdf()` — lignes 917-922

### Changements
Remplacer les emojis dans les appels `line(...)` par des préfixes texte :
```
line(`💬 Mot du joueur : ...`)   →  line(`Mot du joueur : ...`)
line(`✅ Ce qui va : ...`)        →  line(`(+) Ce qui va : ...`)
line(`⚠️ Ce qui ne va pas : ...`) →  line(`(!) Ce qui ne va pas : ...`)
line(`📅 Échéances : ...`)        →  line(`Echeances : ...`)
line(`🔒 Notes cellule : ...`)    →  line(`[Conf.] Notes cellule : ...`)
```

Ajouter les champs manquants (parité avec .md export) :
```javascript
if (e.comment_aider)  line(`Comment l'aider : ${e.comment_aider}`, 2, 9);
if (examens.length) {
  line(`Examens :`, 2, 9, true);
  examens.forEach(ex => line(`  ${ex.matiere} : ${ex.note} (${ex.tendance||'—'})`, 4, 9));
  if (e.commentaire_examens) line(`  Commentaire : ${e.commentaire_examens}`, 4, 9);
}
```

Note : `examens` n'est pas dans le SELECT actuel de `spExportEntretiensPdf`. Vérifier : `spLoadJoueurDetail` fait `select('*')` sur `ssp_entretiens` → tous les champs sont disponibles dans `_spEntretiens`.

---

## F2 — Supprimer un entretien

### Nouvelle fonction
```javascript
async function spDeleteEntretien(entretienId, dateLabel) {
  if (!confirm(`Supprimer l'entretien du ${dateLabel} ? Cette action est irréversible.`)) return;
  const { error } = await spDB().from('ssp_entretiens').delete().eq('id', entretienId);
  if (error) { alert('Erreur : ' + error.message); return; }
  await spLoadJoueurDetail(_spCurrent);
  spRenderFiche();
}
```

### Zone de modification dans `spRenderFiche()`
Dans `histEntretiens` (lignes 189-203), l'expand detail d'un item (feature F3) accueille le bouton :
```html
<button class="sp-delete-btn" onclick="spDeleteEntretien('${e.id}', '${spDateFR(e.date)}')">
  Supprimer cet entretien ×
</button>
```

### Cascade DB
`ssp_reprises.entretien_id` → `ssp_entretiens.id` ON DELETE CASCADE : les reprises sont supprimées automatiquement. Aucune requête DELETE supplémentaire nécessaire.

### RLS
La policy `sp_membre_all_entretiens` autorise DELETE pour `is_sociopro_membre()`. Aucune modification RLS requise.

---

## F3 — Vue détail entretien

### Refactoring de `histEntretiens` dans `spRenderFiche()`

Chaque item passe de statique à toggle. Pattern : un ID unique par entretien pour le div détail.

```javascript
const histEntretiens = _spEntretiens.length ? `
  <div class="sp-accordion" onclick="spToggle('acc-entretiens')">
    <span>Historique entretiens (${_spEntretiens.length})</span><span class="sp-chev">▼</span>
  </div>
  <div id="acc-entretiens" style="display:none;padding:8px 0">
    ${_spEntretiens.map((e, i) => spEntretienItemHTML(e, i)).join('')}
  </div>` : '';
```

Nouvelle fonction `spEntretienItemHTML(e, i)` qui produit :
- Header cliquable → `spToggle('ent-detail-${i}')`
- Résumé (3 champs existants)
- Section détail `id="ent-detail-${i}"` display:none → tous champs + bouton Supprimer

Le tableau `_spEntretiens[i].examens` est un JSONB → déjà parsé en Array par le SDK si le select(*) ramène du JSON, sinon `JSON.parse(e.examens||'[]')`.

---

## F4 — Mode Réunion UX

### Zone de modification : `spRenderReunion()`

Avant `spRenderReunionCard()`, calculer les compteurs :
```javascript
const counts = { rouge: 0, orange: 0, vert: 0 };
_spReunionJoueurs.forEach(j => { if (j.lastEntretien?.couleur) counts[j.lastEntretien.couleur]++; });
```

Injecter un bandeau HTML dans `#sp-reunion-cards` avant la carte :
```javascript
sgid('sp-reunion-cards').insertAdjacentHTML('afterbegin', spReunionBandeauHTML(counts));
```

### Zone de modification : `spRenderActionsSection()`

Titre de la section :
```javascript
// Avant :
<div class="sp-sec-lbl" style="margin-bottom:0">📋 Actions de la réunion</div>
// Après :
<div class="sp-sec-lbl" style="margin-bottom:0">Actions de la réunion</div>
<div style="font-size:11px;color:#9E9A90;margin-top:3px">Réunion du ${spDateFR(spTodayISO())}</div>
```

---

## Incrément de version

| Fichier | Avant | Après |
|---------|-------|-------|
| `sociopro-dashboard.js` | v3 | v4 |
| `fenix-sociopro.html` | `?v=3` | `?v=4` |

Aucun autre fichier modifié.
