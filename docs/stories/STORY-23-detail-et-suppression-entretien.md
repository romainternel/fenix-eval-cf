# STORY-23 — Vue détail entretien + Suppression

> Scrum Master · 2026-07-21
> Fichier : `pages/sociopro-dashboard.js` (suite de v4 ou v5 si STORY-22 déjà mergée)

---

## Contexte

L'accordéon "Historique entretiens" dans `spRenderFiche()` n'affiche que 3 champs par entretien et ne permet pas la suppression. Ces deux besoins sont couplés : le bouton Supprimer vit dans la vue détail expandée.

## Tâches

### 1. Extraire `spEntretienItemHTML(e, i)`

Créer une fonction qui génère le HTML d'un item d'entretien avec comportement toggle :

```javascript
function spEntretienItemHTML(e, i) {
  const ci = e.couleur ? SP_COULEURS[e.couleur] : null;
  const actions = Array.isArray(e.actions_suivant) ? e.actions_suivant : JSON.parse(e.actions_suivant||'[]');
  const examens = Array.isArray(e.examens) ? e.examens : JSON.parse(e.examens||'[]');
  const detailId = `ent-detail-${i}`;

  const summaryLines = [
    e.mot_du_joueur ? `<div style="font-style:italic;color:#633806;margin-bottom:3px">"${spEsc(e.mot_du_joueur)}"</div>` : '',
    e.ce_qui_va     ? `<div><span style="color:#27500A">(+) </span>${spEsc(e.ce_qui_va)}</div>` : '',
    e.ce_qui_ne_va_pas ? `<div><span style="color:#791F1F">(!) </span>${spEsc(e.ce_qui_ne_va_pas)}</div>` : '',
  ].filter(Boolean).join('');

  const detailLines = [
    ci ? `<div class="sp-couleur-recap" style="background:${ci.bg};border:.5px solid ${ci.border};margin-bottom:8px">
            <span style="background:${ci.dot};width:10px;height:10px;border-radius:50%;display:inline-block;flex-shrink:0;margin-top:3px"></span>
            <div><div style="font-size:11px;font-weight:600;color:${ci.text}">${ci.label}</div>
            <div style="font-size:12px;color:${ci.text}">${spEsc(e.couleur_justification||'')}</div></div>
          </div>` : '',
    e.mot_du_joueur    ? `<div class="sp-detail-lbl">Mot du joueur</div><div class="sp-detail-val" style="font-style:italic">"${spEsc(e.mot_du_joueur)}"</div>` : '',
    e.ce_qui_va        ? `<div class="sp-detail-lbl">(+) Ce qui va</div><div class="sp-detail-val">${spEsc(e.ce_qui_va)}</div>` : '',
    e.ce_qui_ne_va_pas ? `<div class="sp-detail-lbl">(!) Ce qui ne va pas</div><div class="sp-detail-val">${spEsc(e.ce_qui_ne_va_pas)}</div>` : '',
    e.echeances        ? `<div class="sp-detail-lbl">Echéances</div><div class="sp-detail-val">${spEsc(e.echeances)}</div>` : '',
    e.comment_aider    ? `<div class="sp-detail-lbl">Comment l'aider</div><div class="sp-detail-val">${spEsc(e.comment_aider)}</div>` : '',
    actions.length     ? `<div class="sp-detail-lbl">Actions suivantes</div><div class="sp-detail-val">${actions.map(a=>'• '+spEsc(a)).join('<br>')}</div>` : '',
    examens.length     ? `<div class="sp-detail-lbl">Examens</div><div class="sp-detail-val">${examens.map(ex=>spEsc(ex.matiere)+' : '+spEsc(ex.note)+(ex.tendance?' ('+spEsc(ex.tendance)+')':'')).join('<br>')}${e.commentaire_examens?'<br><em>'+spEsc(e.commentaire_examens)+'</em>':''}</div>` : '',
    e.notes_cellule    ? `<div class="sp-detail-lbl">[Conf.] Notes cellule</div><div class="sp-detail-val" style="background:#F7F5F0;padding:6px 8px;border-radius:6px;font-style:italic">${spEsc(e.notes_cellule)}</div>` : '',
  ].filter(Boolean).join('');

  return `
    <div style="border-bottom:.5px solid #E0DDD6">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 0;cursor:pointer" onclick="spToggle('${detailId}');this.querySelector('.sp-chev').classList.toggle('open')">
        <span style="background:${ci?.dot||'#9E9A90'};width:10px;height:10px;border-radius:50%;flex-shrink:0;display:inline-block"></span>
        <div style="flex:1">
          <strong style="font-size:12px">${spDateFR(e.date)}</strong>
          <span style="font-size:12px;color:#9E9A90"> — ${spEsc(e.mene_par||'—')}</span>
          <div style="font-size:11px;color:#9E9A90;margin-top:2px">${summaryLines}</div>
        </div>
        <span class="sp-chev" style="font-size:11px;flex-shrink:0">▼</span>
      </div>
      <div id="${detailId}" style="display:none;padding:0 0 10px 18px">
        ${detailLines}
        <button class="sp-delete-btn" onclick="spDeleteEntretien('${e.id}','${spDateFR(e.date)}')">
          Supprimer cet entretien ×
        </button>
      </div>
    </div>`;
}
```

### 2. Modifier `histEntretiens` dans `spRenderFiche()`

```javascript
// Remplacer le bloc actuel (lignes 189-203) par :
const histEntretiens = _spEntretiens.length ? `
  <div class="sp-accordion" onclick="spToggle('acc-entretiens')">
    <span>Historique entretiens (${_spEntretiens.length})</span><span class="sp-chev">▼</span>
  </div>
  <div id="acc-entretiens" style="display:none;padding:8px 0">
    ${_spEntretiens.map((e, i) => spEntretienItemHTML(e, i)).join('')}
  </div>` : '';
```

### 3. Ajouter `spDeleteEntretien()`

```javascript
async function spDeleteEntretien(entretienId, dateLabel) {
  if (!_spCurrent) return;
  if (!confirm(`Supprimer l'entretien du ${dateLabel} ? Cette action est irréversible.`)) return;
  const { error } = await spDB().from('ssp_entretiens').delete().eq('id', entretienId);
  if (error) { alert('Erreur : ' + error.message); return; }
  await spLoadJoueurDetail(_spCurrent);
  spRenderFiche();
}
```

### 4. Ajouter les classes CSS dans `fenix.css` (ou inline dans les styles)

```css
.sp-delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #791F1F;
  font-size: 12px;
  padding: 4px 0;
  display: block;
  text-align: right;
  width: 100%;
  margin-top: 8px;
}
.sp-delete-btn:hover { opacity: .8; text-decoration: underline; }
.sp-detail-lbl {
  font-size: 11px;
  font-weight: 600;
  color: #9E9A90;
  text-transform: uppercase;
  letter-spacing: .5px;
  margin: 6px 0 2px;
}
.sp-detail-val {
  font-size: 13px;
  color: #3D3B36;
}
```

Ajouter ces classes à `css/fenix.css` (v51) et mettre à jour `fenix-sociopro.html`.

## Critères d'acceptation

- [ ] Clic sur un item de l'historique : la section détail s'ouvre/ferme (toggle)
- [ ] Vue détail : tous les champs non vides sont affichés avec labels
- [ ] Bouton "Supprimer cet entretien ×" visible dans la vue détail
- [ ] Clic Supprimer → `confirm()` avec date → suppression en DB → accordéon actualisé
- [ ] Refus du `confirm()` → aucune suppression
- [ ] Deux entretiens ouverts en même temps : pas de collision d'IDs

## Notes techniques

- `spToggle(id)` est déjà défini (ligne 537) — réutiliser
- `sp-chev` + `.open` est le pattern existant pour les accordéons — respecter la cohérence
- Ajouter `.sp-chev.open { transform: rotate(180deg); }` si pas déjà dans fenix.css
- Les IDs `ent-detail-0`, `ent-detail-1`... sont uniques dans la page tant que `spRenderFiche` est rendu une seule fois

## Versions à incrémenter

| Fichier | Avant | Après |
|---------|-------|-------|
| `css/fenix.css` | v50 | v51 |
| `pages/sociopro-dashboard.js` | v4 (après STORY-22) | v5 |
| `fenix-sociopro.html` | cache-bust à jour | mis à jour |
