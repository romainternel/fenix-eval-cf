# Design — Module Socio-Pro (vue complète)

> Agent : Designer · 2026-07-20

---

## Principe général

Le module socio-pro partage le même langage visuel que l'app CF (header navy/gold, cards ivoires, Inter + Bebas Neue). Il s'ouvre dans une page dédiée `fenix-sociopro.html` — pas une modale, pas une section dans coach.html. Deux rôles y accèdent avec la même interface ; seul le lien retour change.

---

## Écran 0 — Points d'entrée

### Coach (depuis coach.html)
```
┌─────────────────────────────────────────────────────┐
│ FENIX EVAL CF       Dashboard Coach    [Déconnexion]│
├─────────────────────────────────────────────────────┤
│ [Sessions] [Joueurs] [Coachs]       [Socio-Pro ↗] │
└─────────────────────────────────────────────────────┘
  ↑ "Socio-Pro ↗" aligné à droite, style grisé/secondaire
```

### Référent (login direct)
Login → `role = referent_sociopro` → redirect `fenix-sociopro.html`

---

## Écran 1 — Header + nav de fenix-sociopro.html

### Référent socio-pro
```
┌─────────────────────────────────────────────────────┐
│  [Logo]  FENIX Socio-Pro  Cellule Suivi CF  [Logout]│
├─────────────────────────────────────────────────────┤
│  [Liste joueurs ●]   [Mode réunion]                 │
└─────────────────────────────────────────────────────┘
```

### Coach (même page, lien retour visible)
```
┌─────────────────────────────────────────────────────┐
│  [Logo]  FENIX Socio-Pro  Cellule Suivi CF  [Logout]│
├─────────────────────────────────────────────────────┤
│  [Liste joueurs ●]   [Mode réunion]  [← Coach]     │
└─────────────────────────────────────────────────────┘
  ↑ "← Coach" : margin-left:auto, 12px, gris, pas de border
```

---

## Écran 2 — Vue 1 : Liste joueurs

```
┌─────────────────────────────────────────────────────┐
│  [Tous les référents ▾]                             │  ← filtre
├─────────────────────────────────────────────────────┤
│  ┌─── Card joueurs ──────────────────────────────┐  │
│  │  🟢 [MB]  Martin Baptiste              [Voir] │  │
│  │           BTS Management · Marion     [Entreti│  │
│  │           27 juin                    en]      │  │
│  ├──────────────────────────────────────────────┤  │
│  │  🔴 [DL]  Dupont Lucas               [Voir]  │  │
│  │           Bac Pro · Mathilde          [Entreti│  │
│  │           [Entretien en retard]      en]      │  │
│  ├──────────────────────────────────────────────┤  │
│  │  ○  [RJ]  Roux Julien                [Voir]  │  │
│  │           —  · Sans référent                 │  │
│  │           [Pas encore d'entretien]            │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Interactions :**
- Dot coloré = couleur du dernier entretien (⚫ = aucun)
- Initiales dans l'avatar = 2 premières lettres prénom + nom
- Badge rouge "Entretien en retard" = > 5 semaines depuis le dernier
- [Voir] → Vue 2 Fiche, [Entretien] → Vue 3 Formulaire

---

## Écran 3 — Vue 2 : Fiche profil joueur

```
┌─────────────────────────────────────────────────────┐
│  ← Retour                                           │
│  ┌─── Card ──────────────────────────────────────┐  │
│  │  [Navy hdr]  [MB] Martin Baptiste  [+Entretien│  │
│  │               martin@email.com              ] │  │
│  ├──────────────────────────────────────────────┤  │
│  │  ✏️ PROFIL SOCIO-PROFESSIONNEL               │  │
│  │  Formation ________________                  │  │
│  │  Projet pro _______________                  │  │
│  │  [Référent SHN ▾] [Contrat ▾]               │  │
│  │  Tuteur ___________________                  │  │
│  │  Lien Drive _______________                  │  │
│  │  Notes profil ______________                 │  │
│  │                                              │  │
│  │  📂 Orientations précédentes (2)  ▼         │  │
│  │  📋 Historique entretiens (3)    ▼          │  │
│  │                                              │  │
│  │  [🗂 Drive ↗] [Enregistrer] [⬇ .md] [⬇ PDF]│  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**États :**
- Champ vide → placeholder grisé
- Après save → message "✓ Profil enregistré" (2.5s)
- Lien Drive absent → bouton Drive masqué

---

## Écran 4 — Vue 3 : Formulaire entretien

Structure en 4 sections :

**Section A — Profil (lecture seule)**
Rappel compact : formation, projet, référent, tuteur, contrat

**Section B — Reprise** (premier entretien = "Pas de reprise")
Si entretien précédent : couleur du mois dernier + liste des actions avec sélecteur statut (✓ Fait / ~ En cours / ✗ Non fait)

**Section C — Entretien du jour**
```
Date [____] Mené par [Marion ▾]
💬 Mot du joueur : [textarea]
✅ Ce qui va bien : [textarea]
⚠️ Ce qui ne va pas : [textarea]
📅 Échéances : [textarea]
🤝 Comment on peut l'aider : [textarea]
☑️ Ce qu'il doit faire : [+ ligne action × n] [+ Ajouter]
🔒 Notes cellule (non visible du joueur) : [textarea]
```

**Section Examens** (accordéon, optionnel)
Matière / Note / Tendance × n + commentaire global

**Section couleur** (obligatoire avant save)
```
┌──────────┐  ┌──────────┐  ┌──────────┐
│    🟢    │  │    🟠    │  │    🔴    │
│   Vert   │  │  Orange  │  │  Rouge   │
│  Suivi   │  │  À surv. │  │  Action  │
│  normal  │  │          │  │  urgente │
└──────────┘  └──────────┘  └──────────┘
[Définition de la couleur sélectionnée]
Justification : [textarea obligatoire]
```

**Footer**
```
[✓ Entretien enregistré (hidden)]  💾 Sauvegarde Supabase  [Enregistrer]
```

---

## Écran 5 — Vue 4 : Mode réunion

```
┌─────────────────────────────────────────────────────┐
│  Ordre: 🔴→🟠→🟢 · Joueur 2 / 7                    │
│  ┌─── Card joueur ───────────────────────────────┐  │
│  │  [Navy] [DL] Dupont Lucas · BTS · Mathilde 🔴 │  │
│  ├──────────────────────────────────────────────┤  │
│  │  ÉTAT CE MOIS — 15 juin 2026                  │  │
│  │  🔴 Rouge — "Rupture contrat apprentissage"   │  │
│  ├──────────────────────────────────────────────┤  │
│  │  CE QU'IL DOIT FAIRE                          │  │
│  │  • Rappeler son tuteur avant vendredi         │  │
│  │  • Envoyer le formulaire au CFA               │  │
│  ├──────────────────────────────────────────────┤  │
│  │  [← Préc.] [Fiche] [+ Action] [Suivant →]   │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  📋 ACTIONS DE LA RÉUNION — 20 juillet 2026        │
│  ┌──────────────────────────────────────────────┐  │
│  │  🔴 Pour Dupont · Contacter CFA · Marion     │  │
│  │                              [À faire ▾] [🗑]│  │
│  │  🟢 Général · Préparer bilan S1 · Mathilde   │  │
│  │                              [Fait ▾]    [🗑]│  │
│  └──────────────────────────────────────────────┘  │
│  [+ Action]                                         │
└─────────────────────────────────────────────────────┘
```

**"+ Action" depuis la carte joueur** → pré-remplit le joueur dans le formulaire en bas

---

## Écran 6 — Vue joueur "Mon suivi" (player.html)

```
┌─────────────────────────────────────────────────────┐
│  FENIX EVAL CF    Baptiste Martin    [Déconnexion]  │
├─────────────────────────────────────────────────────┤
│  [Mes sessions]   [Mon suivi ●]                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─── Mon état ce mois ──────────────────────────┐  │
│  │  🟢  VERT — Suivi normal                       │  │
│  │  ─────────────────────────────────────────    │  │
│  │  Entretien du 15 juin 2026                     │  │
│  │                                                │  │
│  │  ✅ CE QUI VA BIEN                             │  │
│  │  Bonne progression en cours, tuteur satisfait  │  │
│  │                                                │  │
│  │  📅 MES ÉCHÉANCES À VENIR                      │  │
│  │  Examen BTS en septembre                       │  │
│  │                                                │  │
│  │  ☑️ CE QUE JE DOIS FAIRE                       │  │
│  │  • Finaliser le rapport de stage               │  │
│  │  • Envoyer le planning à Mathilde              │  │
│  └────────────────────────────────────────────────┘  │
│                                                     │
│  ┌─── Mes entretiens précédents ─────────────────┐  │
│  │  Afficher (2) ▼                               │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**État vide (pas encore d'entretien) :**
```
│  📋                                               │
│  Pas encore d'entretien                           │
│  Ton premier entretien avec la cellule            │
│  socio-pro apparaîtra ici.                        │
```

---

## Composants existants réutilisés

- `.fenix-header`, `.header-inner`, `.btn-logout` — inchangés
- `.tab-btn`, `.tab-btn.active` — inchangés
- `.card`, `.card-body`, `.section-title` — inchangés
- `.loading-state`, `.spinner` — inchangés
- `.page-content` — inchangé

## Composants propres au module socio-pro

Tous déjà définis en `<style>` local dans `fenix-sociopro.html` : `.sp-card`, `.sp-hdr`, `.sp-avatar`, `.sp-dot`, `.sp-sec`, `.sp-field`, `.sp-color-btn`, etc.
