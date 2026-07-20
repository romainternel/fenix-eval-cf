# Design — Refonte rôles socio-pro

> Agent : Designer · 2026-07-20

---

## Décision UX principale : un seul HTML, deux comportements

`fenix-sociopro.html` est partagé entre `coach` et `referent_sociopro`. La seule différence visible est dans la navigation :

- **Coach** : voit le lien retour "← Dashboard coach" côté droit de la nav
- **Référent** : nav sans lien retour (socio-pro est son espace racine)

Pas de doublon de page. Le rôle est lu au chargement (`window._spRole`) et conditionne uniquement l'affichage de ce lien.

---

## Maquette 1 — Nav coach dans fenix-sociopro.html

```
┌─────────────────────────────────────────────────────┐
│ FENIX SOCIO-PRO   Cellule Suivi CF    [Déconnexion] │
├─────────────────────────────────────────────────────┤
│ [Liste joueurs]  [Mode réunion]   [← Dashboard ↗] │
└─────────────────────────────────────────────────────┘
```

- Le bouton "← Dashboard ↗" est aligné à droite (margin-left:auto)
- Style : tab-btn avec couleur atténuée (#9E9A90) — différent des onglets fonctionnels
- Texte : "← Dashboard coach" (12px, pas de majuscules)

---

## Maquette 2 — Nav référent dans fenix-sociopro.html

```
┌─────────────────────────────────────────────────────┐
│ FENIX SOCIO-PRO   Cellule Suivi CF    [Déconnexion] │
├─────────────────────────────────────────────────────┤
│ [Liste joueurs]  [Mode réunion]                     │
└─────────────────────────────────────────────────────┘
```

- Nav identique à l'existant, sans aucun lien retour

---

## Maquette 3 — Nav coach dans coach.html (tab Socio-Pro)

```
┌─────────────────────────────────────────────────────┐
│ FENIX EVAL CF     Dashboard Coach     [Déconnexion] │
├─────────────────────────────────────────────────────┤
│ [Sessions]  [Joueurs]  [Coachs]     [Socio-Pro ↗] │
└─────────────────────────────────────────────────────┘
```

- "Socio-Pro ↗" en style atténué (margin-left:auto, couleur #9E9A90)
- Clic → `window.location.href = 'fenix-sociopro.html'`
- Pas d'onglet "actif" — c'est une sortie de page, pas un changement d'onglet

---

## Interactions

### Login → redirection
| Rôle | Page cible |
|------|-----------|
| `coach` | coach.html |
| `referent_sociopro` | fenix-sociopro.html |
| `joueur` | player.html |

### Tentative d'accès non autorisé
- Un joueur qui tape fenix-sociopro.html dans l'URL → redirigé vers player.html par requireAuth
- Un référent qui tape coach.html → redirigé vers fenix-sociopro.html
- Un non-connecté → redirigé vers index.html

---

## États à gérer

**Chargement** : spinner centré (existant, inchangé)

**Rôle inconnu** (compte mal configuré) : `requireAuth` redirige vers index.html (comportement actuel — aucun changement)

---

## Composants réutilisés

- `.tab-btn` — existant, utilisé tel quel pour tous les boutons nav
- `.fenix-header` — inchangé
- Spinner `.loading-state` — inchangé

## Composants nouveaux

Aucun. La différence est purement conditionnelle (affichage/masquage d'un bouton existant).

---

## Responsive

La nav avec le lien retour coach sur mobile (overflow-x:auto) : le bouton "← Dashboard coach" est visible en scrollant à droite si les deux onglets prennent trop de place. C'est acceptable — le lien retour est non-critique (le bouton retour navigateur suffit en dernier recours).
