# Audit complet de régression — 2026-11-12

> Agent : Regression Guardian + E2E Tester | Version testée : commit `87d8e31` (css v51, criteria-data v34, app.js v46, player-home v46, coach-dashboard v91)
> Périmètre : checklist Critique + Important (R01–R24). Secondaire : seul R14 vérifié (peu coûteux).

## Conditions de test — à lire avant le verdict

- Navigateur réel (Playwright/Chromium), appli servie en local, **backend Supabase simulé** (faux PostgREST + session injectée). Pas d'identifiants de production fournis, aucun test contre la vraie base.
- Conséquence : tout ce qui dépend du **vrai** Supabase (Auth, RLS, Edge Functions déployées) est ⚠️ non vérifiable. Les Edge Functions ont été interceptées : on vérifie ce que l'UI envoie, pas ce que la fonction fait.
- Captures : `docs/regression/audit-2026-11-12/`.

## 1. Résultat par feature

| # | Feature | Crit. | Résultat | Preuve / détail |
|---|---------|-------|----------|-----------------|
| R01 | Login email/password | Critique | ⚠️ partiel | Formulaire, champs et bouton Voir/Masquer présents (`a03-login.png`). Authentification réelle non testable (Auth simulé). Routage post-login via rôle : voir R02 |
| R02 | Routage par rôle | Critique | ✅ | coach→player.html redirigé coach.html ; joueur→coach.html redirigé player.html ; référent→coach.html et player.html redirigé fenix-sociopro.html (`a01`, `a02`) |
| R03 | Création joueur (coach) | Critique | ⚠️ | Modal de création ouvrable ; Edge Function non testée en réel |
| R04 | Évaluation joueur | Critique | ✅ | Double-tap sur un bouton de notation → ligne `evaluations` (ailier-att-lecture-1, note 3) enregistrée (`c02`, `c03`). Onglets Attaque 0/21, Défense 0/19 |
| R05 | Sessions coach | Important | ✅ | Création (id EVAL-2026-DEC-xx, `b02`), fermeture → `ferme`, réouverture → `ouvert` |
| R06 | Radar résultats | Important | ✅ | Coach : `radarAtt`, `radarDef` + bilan + barres (`b04`). Joueur : `pRadarAtt/Def`, bilan, barres (`c04`). Aucune erreur JS |
| R07 | Déconnexion | Important | ✅ redirection / ⚠️ session | `logout()` → index.html. La suppression du jeton ne peut pas être jugée : le script d'injection de session du mock le recrée à chaque chargement |
| R08 | Edge Function create-player-account | Critique | ⚠️ | Non testable sans backend réel |
| R09 | RLS joueur isolé | Critique | ⚠️ | Non testable (RLS = Postgres). Voir faille connue `note_staff` ci-dessous |
| R10 | Edge Function manage-coach-account | Critique | ⚠️ | Non testable sans backend réel |
| R11 | Interface gestion coachs | Important | ✅ | Onglet Coachs : liste (badge VOUS), sections Coachs + Référents socio-pro, modal création (`b06`) |
| R12 | Export PPT résultats joueur | Important | ✅ | Fichier `FENIX_Alex_DURAND__valuation___Janvier_2026.pptx` téléchargé, 3 slides (session sans mental) |
| R13 | Show/hide password | Important | ✅ | Login, création joueur, création coach : `password → text` |
| R14 | Radar font size | Secondaire | ✅ | Chart.js `pointLabels` : 12 px, weight 600 (coach) |
| R15 | PPT html2canvas (supersédé) | Important | — | Remplacé par R16 |
| R16 | Export PPT 3 slides | Important | ✅ | 3 slides, `btnExportPpt` présent. Variante avec mental (4 slides) vérifiée lors du développement de la dimension mentale |
| R17 | `showAxisDetail()` | Important | ✅ | Clic sur un thème → `#axisDetail` rempli (Lecture, critère, JOUEUR Acquis / STAFF) (`b05`) |
| R18 | Bilan entretien joueur | Important | ✅ | `visible_joueur=true` → carte + objectifs CT/MT affichés ; `false` → carte absente (`c04`) |
| R19 | Suppression exports obsolètes | Important | ✅ | `exportCoachPDF`, `exportProgressionPPT`, `window.jspdf` absents de coach.html ; aucun bouton « PPT Prog. » |
| R20 | Routing referent_sociopro | Critique | ✅ | Référent → sociopro ; joueur sur sociopro → player.html ; coach autorisé sur sociopro (lien « ← Dashboard coach ») |
| R21 | Gestion des référents | Important | ✅ côté UI / ⚠️ serveur | Deux sections visibles ; la création envoie `POST manage-coach-account` avec `role:"referent_sociopro"`. Suppression et effet serveur non testés |
| R22 | Export PDF socio-pro | Important | ❌ | **Voir régression n°1** |
| R23 | Détail + suppression entretien | Important | ✅ | Détail replié → déplié, tous champs non vides affichés ; suppression → ligne retirée de la base (`d02`) |
| R24 | Mode Réunion UX | Important | ✅ | Bandeau « 1 Rouge · 2 joueurs au total » (seuls compteurs > 0), « Actions de la réunion », « Réunion du 12 novembre 2026 » (`d03`) |

## 2. Régressions détectées

### N°1 — R22 : emoji dans la ligne « Etat » du PDF socio-pro (Important)

- **Constat** : `spEntretienPdfBody` (`pages/sociopro-dashboard.js:1182`) écrit `Etat : ${ci.label}` ; or `SP_COULEURS[x].label` vaut `🟢 Vert` / `🟠 Orange` / `🔴 Rouge` (`js/sociopro.js:10-12`). Chaîne capturée à l'entrée de jsPDF : `Etat : 🔴 Rouge — Absences répétées`.
- **Pourquoi c'est un problème** : la police Helvetica de jsPDF ne gère pas les emojis ; ils sortent en caractères corrompus (du type Ø=Ý4), exactement le défaut que la STORY-22 devait supprimer.
- **Ce n'est pas une régression de la dimension mentale** : la ligne date de la STORY-22 elle-même (commit a8d0536) ; le QA-22 n'a compté que 5 emojis remplacés et n'a pas vu celui-ci. Les autres lignes et les champs (Mot du joueur, (+), (!), Echeances, Comment l'aider, Examens, Notes cellule) sont corrects, bullet `•` intact.
- **Limite de la preuve** : je n'ai pas pu ouvrir le PDF (pas de lecteur PDF disponible) ; le constat repose sur la chaîne transmise à jsPDF, pas sur un rendu visuel.
- **Correctif suggéré** (une ligne) : dans `spEntretienPdfBody`, retirer l'emoji avant impression, par ex. `ci.label.replace(/^\S+\s/, '')`. Même vérification à faire pour l'export « tous les entretiens » (`spExportEntretiensPdf`), qui réutilise cette fonction.

### Aucune autre régression détectée sur les parcours testés.

## 3. Non vérifiable (⚠️)

- R01 (auth réelle), R03, R08, R10 (Edge Functions), R09 (RLS), suppression de compte (R21 partiel), effacement de session à la déconnexion (R07).
- **À faire avec identifiants réels** : un passage manuel de 5 minutes en production : login coach, login joueur, création d'un joueur, création d'une session avec mental coché, notation, partage.
- Risque connu, hors régression : la policy `eval_joueur_read` permet à un joueur de lire `note_staff` via l'API avant partage (voir mémoire du projet). À traiter par le Security Auditor.

## 4. Verdict global

**RÉGRESSIONS DÉTECTÉES — 1 régression (R22, PDF socio-pro : emoji dans la ligne « Etat », antérieure à la dimension mentale).**

Les parcours critiques testables (routage, évaluation joueur, sessions, radars, exports PPT, onglet Coachs, socio-pro) sont conformes et la dimension mentale n'a cassé aucune feature existante. Les features dépendant du vrai backend restent à valider en production.
