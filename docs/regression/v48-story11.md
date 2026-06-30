# Rapport de régression — v=48 STORY-11 (frontend gestion coachs)

> Agent : Regression Guardian | Date : 2026-06-30
> Changements : `coach.html` (onglet + versions), `css/fenix.css` (classe ajoutée), `pages/coach-dashboard.js` (fonctions ajoutées)

---

## Analyse des risques de régression

### Fichiers modifiés

| Fichier | Nature du changement | Features à risque |
|---------|---------------------|------------------|
| `coach.html` | Ajout d'un bouton nav + extension `showTab()` + versions incrémentées | Navigation onglets existants (Sessions, Joueurs) |
| `css/fenix.css` | Ajout d'une classe `.coach-you-badge` à la fin | Aucun style existant |
| `pages/coach-dashboard.js` | Ajout de 6 fonctions + 1 variable avant `/* Utilitaires */` | Fonctions existantes non modifiées |

### Fichiers NON modifiés

`index.html`, `player.html`, `js/app.js`, `js/supabase-client.js`, `js/criteria-data.js`, `pages/player-home.js`, `supabase/functions/create-player-account/index.ts`

---

## Passage checklist

| # | Feature | Impact STORY-11 | Analyse | Statut |
|---|---------|-----------------|---------|--------|
| R01 | Login | Aucun | `index.html` non touché | ✅ RAS |
| R02 | Routage rôle | Aucun | `requireAuth` dans `app.js` non touchée | ✅ RAS |
| R03 | Création joueur | Aucun | `showCreatePlayerModal` / `submitCreatePlayer` non touchés | ✅ RAS |
| R04 | Évaluation joueur | Aucun | `player-home.js` non touché | ✅ RAS |
| R05 | Sessions coach | Aucun | `renderSessions` non touchée | ✅ RAS |
| R06 | Radar résultats | Aucun | Fonctions radar non touchées | ✅ RAS |
| R07 | Déconnexion | Aucun | `logout()` dans `app.js` non touchée | ✅ RAS |
| R08 | EF create-player-account | Aucun | Non touché | ✅ RAS |
| R09 | RLS joueur isolé | Aucun | Policies non modifiées | ✅ RAS |
| R10 | EF manage-coach-account | Aucun (utilisée, non modifiée) | Le frontend appelle l'EF mais ne la change pas | ✅ RAS |
| R11 | Interface gestion coachs | **Nouvelle feature** | À vérifier après déploiement | ⏳ |

### Analyse spécifique : navigation onglets

La modification de `coach.html` la plus à risque est l'extension de `showTab()`. Vérification :

```javascript
// Avant STORY-11
if (tab === 'sessions') renderSessions();
if (tab === 'players')  renderPlayers();

// Après STORY-11 (ajout ligne)
if (tab === 'sessions') renderSessions();
if (tab === 'players')  renderPlayers();
if (tab === 'coachs')   renderCoachs();
```

Les deux branches existantes sont inchangées. Le 3e onglet ne s'active pas automatiquement au chargement (le premier onglet actif reste Sessions, géré par `initCoachDashboard`). Risque : nul.

---

## Verdict

**RAS** — Aucune régression détectée ou attendue.

Tous les changements sont additifs et isolés. Les onglets Sessions et Joueurs fonctionnent exactement comme avant.
