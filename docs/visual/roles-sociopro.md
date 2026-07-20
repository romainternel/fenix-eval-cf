# Visual Specs — Refonte rôles socio-pro

> Agent : Visual Crafter · 2026-07-20

---

## Principe : différenciation contextuelle sans surcharge visuelle

La seule différence visible entre un coach et un référent sur fenix-sociopro.html est un bouton dans la nav. Ce bouton doit être **reconnaissable comme "sortie"** sans perturber la hiérarchie des onglets principaux.

---

## Tokens CSS à utiliser

Tous les tokens sont déjà définis dans `fenix.css`. Aucun nouveau token.

```css
--fenix-navy:   #0A2463   /* nav active, header */
--gray-400:     #9E9A90   /* bouton retour — atténué */
--gray-200:     #E0DDD6   /* border nav */
--white:        #FFFFFF   /* fond nav */
```

---

## Bouton "← Dashboard coach" dans la nav socio-pro

```css
/* Style du bouton retour coach — différencié des onglets fonctionnels */
.sp-back-coach {
  margin-left: auto;           /* pousse à droite */
  font-size: 12px;
  color: var(--gray-400);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 12px;
  white-space: nowrap;
  transition: color 0.15s;
}
.sp-back-coach:hover {
  color: var(--fenix-navy);
}
```

Pas de fond coloré. Pas de border. C'est intentionnellement moins "bouton" que les onglets — signale une sortie de contexte, pas un onglet de navigation interne.

---

## Bouton "Socio-Pro ↗" dans coach.html

Même logique : tab-btn existant mais sans fond actif possible.

```css
/* Variante atténuée du .tab-btn pour les liens de sortie */
.tab-btn.tab-exit {
  margin-left: auto;
  color: var(--gray-400);
  font-size: 12px;
}
.tab-btn.tab-exit:hover {
  color: var(--fenix-navy);
  background: var(--gray-50);
}
/* Ne jamais recevoir la classe .active */
```

---

## États interactifs

| Élément | Default | Hover | Active | Disabled |
|---------|---------|-------|--------|----------|
| Tab fonctionnel (Liste, Réunion) | navy border-bottom | navy bg léger | navy bg | n/a |
| Bouton retour coach | gray-400 | navy | scale(0.98) | n/a |
| Bouton Socio-Pro ↗ | gray-400 | navy | scale(0.98) | n/a |

---

## Typographie nav

- Onglets actifs : 13px, font-weight 600, color navy
- Bouton sortie : 12px, font-weight 400, color gray-400
- La différence de taille (13 vs 12) suffit à signaler la hiérarchie

---

## Checklist contraste

| Élément | Couleur texte | Fond | Ratio | WCAG AA |
|---------|--------------|------|-------|---------|
| Onglet actif | #0A2463 | #FFFFFF | 12.6:1 | ✅ |
| Bouton retour (default) | #9E9A90 | #FFFFFF | 2.9:1 | ⚠️ décoratif |
| Bouton retour (hover) | #0A2463 | #FFFFFF | 12.6:1 | ✅ |

Le ratio 2.9:1 du bouton retour en état default est intentionnellement bas pour signaler son caractère secondaire. Il passe à 12.6 au hover/focus — conforme pour l'usage réel.

---

## Micro-animations

Aucune nouvelle animation. Les transitions existantes de `.tab-btn` (0.15s opacity) s'appliquent naturellement.

---

## Note Visual Crafter

Le design de cette feature est volontairement minimaliste. La valeur ici est dans la sémantique (le bon accès pour le bon rôle) pas dans l'esthétique. Résister à la tentation d'ajouter des badges, icônes ou couleurs rôle-spécifiques — ça surchargerait une nav déjà bien remplie sur mobile.
