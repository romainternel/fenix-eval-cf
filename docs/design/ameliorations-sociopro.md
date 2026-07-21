# Design — Améliorations module socio-pro

> Agent : Designer · 2026-07-21

---

## F1 — Fix PDF (pas d'UI)

Changement interne uniquement — pas de design nécessaire.

---

## F2 — Supprimer un entretien

### Placement du bouton

Le bouton "Supprimer" n'est visible que dans la **vue expandée** d'un entretien (feature F3). Il apparaît en bas à droite de la section détail, avec un style discret (texte rouge, pas de fond).

```
┌───────────────────────────────────────────────────────────┐
│ ● 12 juin 2026 — Marion Agostini                    ▲     │  ← header cliquable
├───────────────────────────────────────────────────────────┤
│ État : Orange — À surveiller                              │
│ Justification : Stress autour des examens                 │
│                                                           │
│ Mot du joueur : "Je me sens un peu dépassé"              │
│ (+) Ce qui va : Présence aux entraînements               │
│ (!) Ce qui ne va pas : Retards de rendus                 │
│ Échéances : 30 juin — rendu BTS                          │
│ Comment l'aider : Recontacter le tuteur                  │
│ Actions : • Appel tuteur (Marion)                        │
│                                                           │
│                          [Supprimer cet entretien ×]     │
└───────────────────────────────────────────────────────────┘
```

**Message de confirmation** (natif `confirm()`) :
> "Supprimer l'entretien du 12 juin 2026 ? Cette action est irréversible."

---

## F3 — Vue détail entretien

### Comportement accordion nested

L'accordéon "Historique entretiens (N)" existant s'ouvre. À l'intérieur, chaque item est cliquable :

**Vue résumée (défaut) :**
```
● 12 juin 2026 — Marion Agostini                       ▼
  "Je me sens un peu dépassé"
  (+) Présence entraîn.   (!) Retards rendus
```

**Vue expandée (clic sur l'item) :**
```
● 12 juin 2026 — Marion Agostini                       ▲
─────────────────────────────────────────────────────
État : 🟠 Orange — À surveiller
Justification : Stress autour des examens BTS

Mot du joueur
  "Je me sens un peu dépassé en ce moment"

(+) Ce qui va
  Présence régulière aux entraînements

(!) Ce qui ne va pas
  Retards de rendus scolaires

Échéances
  30 juin — rendu BTS Management

Comment on peut l'aider
  Recontacter le tuteur M. Bertrand

Actions suivantes
  • Appel tuteur avant le 25 juin (Marion)
  • Relancer le lycée (Mathilde)

[Supprimer cet entretien ×]
─────────────────────────────────────────────────────
```

*Note : la couleur de l'état (🟠 Orange) ne peut pas utiliser l'emoji dans le PDF mais peut s'afficher dans l'UI.*

---

## F4 — Mode Réunion UX

### Layout révisé

```
┌─────────────────────────────────────────────────────────┐
│  MODE RÉUNION                                           │
│  Réunion socio-pro · Faites défiler les joueurs         │
│  triés par priorité (rouge → orange → vert).           │
│                                                         │
│  Statut collectif :                                     │
│  ● 2 Rouge  ● 3 Orange  ● 5 Vert  · 10 joueurs total  │
└─────────────────────────────────────────────────────────┘

                                                           
    ┌──── Carte joueur (inchangée) ────────────────────┐  
    │  [Avatar]  NOM Prénom · Formation                │  
    │  ● État : Rouge — Situation critique             │  
    │  Ce qu'il doit faire :                           │  
    │   • Action 1                                     │  
    │  [← Précédent]  [Fiche]  [+ Action]  [Suivant →]│  
    └──────────────────────────────────────────────────┘  
    Joueur 1 / 10                                          

    ─────────────────────────────────────────────────      

    📋 ACTIONS — Réunion du 21 juillet 2026               
    [+ Action]                                            
    ● Action 1 · Joueur · Resp.   [statut ▼]  [🗑]       
    ● Action 2 · Collectif · —    [statut ▼]  [🗑]       
```

### Changements précis
1. **Bandeau intro** : block fixe en haut du Mode Réunion, fond ivoire léger `#F7F5F0`, texte 12px gris
2. **Mini-barre statuts** : ligne de compteurs colorés juste sous le bandeau
3. **Titre section Actions** : "📋 ACTIONS — Réunion du JJ mois AAAA" (date en français)
4. Aucun autre changement de layout — les cartes et la navigation restent identiques
