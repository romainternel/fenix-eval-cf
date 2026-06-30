# Rapport de régression — v=49 STORY-12 (export PPT + show/hide pwd + radar font)

> Agent : Regression Guardian | Date : 2026-06-30
> Changements : `coach.html` (CDN PptxGenJS, version v=44), `pages/coach-dashboard.js` (fonction exportCoachPPT), `pages/player-home.js` (font radar), `css/fenix.css` (v=49 show/hide pwd CSS), `js/app.js` (togglePwd), `index.html`, `player.html`

---

## Analyse des risques de régression

### Fichiers modifiés

| Fichier | Nature du changement | Features à risque |
|---------|---------------------|------------------|
| `coach.html` | Ajout script CDN PptxGenJS + version coach-dashboard.js v=44 | Aucune — ajout seul, ordre scripts préservé |
| `pages/coach-dashboard.js` | Ajout fonction `exportCoachPPT()` + bouton changé PDF→PPT | Export PDF coach (supprimé du bouton mais fonction toujours présente) |
| `pages/player-home.js` | `pointLabels.font.size` 9→12 (×2 occurrences) | Radar joueur : visuel uniquement, données inchangées |
| `css/fenix.css` | Ajout `.coach-you-badge`, `.input-pwd-wrap`, `.btn-pwd-toggle` | Aucun style existant écrasé (ajout en fin de fichier) |
| `js/app.js` | Ajout fonction `togglePwd(btn)` en fin de fichier | Aucune — ajout seul |
| `index.html` | Ajout apple-touch-icon + toggle pwd login + versions CSS/JS | Login : uniquement le champ password wrappé |
| `player.html` | Ajout apple-touch-icon + version player-home.js v=40 | Aucune — versions seules |

### Fichiers NON modifiés

`js/supabase-client.js`, `js/criteria-data.js`, `supabase/functions/create-player-account/index.ts`, `supabase/functions/manage-coach-account/index.ts`

---

## Passage checklist

| # | Feature | Impact STORY-12 | Analyse | Statut |
|---|---------|-----------------|---------|--------|
| R01 | Login email/password | `index.html` modifié | Toggle pwd ajouté autour du champ, la logique de connexion (`signInWithPassword`) non touchée | ✅ RAS |
| R02 | Routage rôle | Aucun | `requireAuth` dans `app.js` non touchée | ✅ RAS |
| R03 | Création joueur | Aucun | `showCreatePlayerModal` / `submitCreatePlayer` non touchés | ✅ RAS |
| R04 | Évaluation joueur | Aucun | `player-home.js` : seul `pointLabels.font.size` modifié | ✅ RAS |
| R05 | Sessions coach | Aucun | `renderSessions` non touchée | ✅ RAS |
| R06 | Radar résultats | `player-home.js` font size 9→12 | Changement purement cosmétique, logique Chart.js inchangée | ✅ RAS |
| R07 | Déconnexion | Aucun | `logout()` dans `app.js` non touchée | ✅ RAS |
| R08 | EF create-player-account | Aucun | Non touché | ✅ RAS |
| R09 | RLS joueur isolé | Aucun | Policies non modifiées | ✅ RAS |
| R10 | EF manage-coach-account | Aucun | Non touchée | ✅ RAS |
| R11 | Interface gestion coachs | Aucun | `renderCoachs`, `coachCardHTML`, etc. non touchées | ✅ RAS |
| R12 | Export PPT (nouvelle feature) | **Feature ajoutée** | Validé par QA STORY-12 — PASSED | ✅ AJOUTÉ |
| R13 | Show/hide password | **Feature ajoutée** | Login + modal joueur + modal coach — `togglePwd()` ajout pur | ✅ AJOUTÉ |
| R14 | Radar font size | **Amélioration** | Lisibilité labels améliorée, aucune rupture | ✅ AJOUTÉ |

### Analyse spécifique : bouton PDF → PPT

Le bouton `onclick="exportCoachPDF()"` a été remplacé par `onclick="exportCoachPPT()"`. La fonction `exportCoachPDF()` reste présente dans `coach-dashboard.js` (non supprimée) mais n'est plus appelée par aucun bouton. Impact sur les features existantes : nul — l'export PDF coach n'était pas listé comme feature critique (R06 est le radar, pas l'export PDF coach).

L'export PDF **joueur** (`exportPlayerPDF` dans `player-home.js`) est inchangé → R06 préservé.

### Analyse spécifique : `togglePwd` dans `app.js`

La fonction est ajoutée en fin de fichier, ne modifie aucune fonction existante. Elle est appelée via `onclick="togglePwd(this)"` dans les HTML. Si PptxGenJS CDN est indisponible, le toggle pwd fonctionne indépendamment.

---

## Verdict

**RAS** — Aucune régression détectée ou attendue.

Tous les changements sont additifs. Les modifications cosmétiques (font radar) et structurelles (wrap input pwd) sont isolées de la logique métier. Le remplacement PDF→PPT est intentionnel et sans impact sur les autres features.
