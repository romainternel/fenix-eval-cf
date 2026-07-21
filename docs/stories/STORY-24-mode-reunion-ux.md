# STORY-24 — Mode Réunion UX

> Scrum Master · 2026-07-21
> Fichier : `pages/sociopro-dashboard.js` (suite de STORY-23)

---

## Contexte

L'onglet "Mode Réunion" n'est pas clair pour les référents qui l'utilisent pour la première fois. Trois ajouts minimes rendent l'interface auto-explicative : un bandeau intro, des compteurs de statut collectif, et une date explicite dans la section Actions.

## Tâches

### 1. Nouvelle fonction `spReunionBandeauHTML(counts)`

```javascript
function spReunionBandeauHTML(counts) {
  const total = _spJoueurs.length;
  const chips = [
    counts.rouge  ? `<span style="background:#FDEAEA;color:#791F1F;border-radius:20px;padding:2px 8px;font-size:11px;font-weight:600">${counts.rouge} Rouge</span>` : '',
    counts.orange ? `<span style="background:#FEF3E6;color:#803A00;border-radius:20px;padding:2px 8px;font-size:11px;font-weight:600">${counts.orange} Orange</span>` : '',
    counts.vert   ? `<span style="background:#EBF7ED;color:#27500A;border-radius:20px;padding:2px 8px;font-size:11px;font-weight:600">${counts.vert} Vert</span>` : '',
  ].filter(Boolean).join('');

  return `
    <div style="background:#F7F5F0;border:.5px solid #E0DDD6;border-radius:8px;padding:10px 14px;margin-bottom:14px">
      <div style="font-size:13px;font-weight:500;color:#3D3B36;margin-bottom:4px">Mode Réunion socio-pro</div>
      <div style="font-size:12px;color:#9E9A90;margin-bottom:8px">Faites défiler les joueurs triés par priorité (rouge en premier).<br>Ajoutez les actions décidées en réunion dans la section ci-dessous.</div>
      ${chips ? `<div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center">
        ${chips}
        <span style="font-size:11px;color:#9E9A90;margin-left:4px">· ${total} joueur${total>1?'s':''} au total</span>
      </div>` : ''}
    </div>`;
}
```

### 2. Modifier `spRenderReunion()`

Après `_spReunionJoueurs = ...` et avant `spRenderReunionCard()`, calculer les compteurs et injecter le bandeau :

```javascript
// Calculer les compteurs
const counts = { rouge: 0, orange: 0, vert: 0 };
_spReunionJoueurs.forEach(j => {
  const c = j.lastEntretien?.couleur;
  if (c && counts[c] !== undefined) counts[c]++;
});

// Injecter bandeau + carte
if (_spReunionJoueurs.length) {
  _spReunionIdx = 0;
  sgid('sp-reunion-cards').innerHTML = spReunionBandeauHTML(counts);
  spRenderReunionCard();
} else {
  sgid('sp-reunion-cards').innerHTML =
    spReunionBandeauHTML(counts) +
    `<p style="padding:20px;text-align:center;color:#9E9A90;font-size:13px">Aucun entretien enregistré pour le moment.</p>`;
}
```

Note : `spRenderReunionCard()` utilise `container.innerHTML = ...` ce qui écrase le contenu de `#sp-reunion-cards`. Il faut modifier `spRenderReunionCard()` pour préserver le bandeau ou le ré-injecter systématiquement.

**Solution retenue** : stocker le bandeau HTML dans une variable `_spBandeauHTML` et le préfixer dans `spRenderReunionCard()` :

```javascript
let _spBandeauHTML = '';

// Dans spRenderReunion() :
_spBandeauHTML = spReunionBandeauHTML(counts);

// Dans spRenderReunionCard() :
container.innerHTML = _spBandeauHTML + `<div style="font-size:12px;color:#9E9A90;margin-bottom:12px">...`;
```

### 3. Modifier `spRenderActionsSection()` — titre

```javascript
// Avant :
<div class="sp-sec-lbl" style="margin-bottom:0">📋 Actions de la réunion</div>
<div style="font-size:11px;color:#9E9A90;margin-top:3px">${spDateFR(spTodayISO())}</div>

// Après (remplacer le bloc existant) :
<div class="sp-sec-lbl" style="margin-bottom:0">Actions de la réunion</div>
<div style="font-size:11px;color:#9E9A90;margin-top:3px">Réunion du ${spDateFR(spTodayISO())}</div>
```

Note : l'emoji 📋 dans le titre est dans le DOM HTML (pas dans jsPDF) donc pas de problème d'encodage — mais supprimé pour cohérence avec le reste de l'UX cleanup.

### 4. Incrémenter les versions

| Fichier | Version |
|---------|---------|
| `pages/sociopro-dashboard.js` | après STORY-23 → +1 |
| `fenix-sociopro.html` | cache-bust mis à jour |

## Critères d'acceptation

- [ ] À l'ouverture du Mode Réunion : bandeau intro visible avec le texte explicatif
- [ ] Compteurs colorés affichés (seuls ceux > 0 sont affichés)
- [ ] Navigation Précédent/Suivant toujours fonctionnelle, le bandeau reste affiché
- [ ] Section Actions : "Réunion du JJ mois AAAA" affiché sous le titre
- [ ] Joueurs sans entretien : pas comptés dans les chips couleur, comptés dans "N joueurs au total"
- [ ] Pas de régression sur la saisie et la mise à jour du statut des actions

## Notes techniques

- `_spBandeauHTML` est une variable module-level (pattern existant avec `_spReunionIdx`, `_spReunionJoueurs`, etc.)
- `spDateFR()` est déjà défini dans le fichier — retourne "21 juillet 2026" pour `2026-07-21`
- Si `_spReunionJoueurs.length === 0`, afficher quand même le bandeau (avec 0 chips) — prévu dans le code ci-dessus
