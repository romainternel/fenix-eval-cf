# Checklist de régression — FENIX Eval CF

> Agent : Regression Guardian | Dernière mise à jour : 2026-07-01 (STORY-14)

---

## Features critiques à vérifier avant chaque mise en production

| # | Feature | Fichiers concernés | Critère de bon fonctionnement | Criticité | Dernière vérif. OK |
|---|---------|-------------------|------------------------------|-----------|-------------------|
| R01 | Login email/password | `index.html`, `js/app.js` | Un utilisateur existant peut se connecter avec ses identifiants → routage vers coach.html ou player.html selon son rôle | Critique | v=47 |
| R02 | Routage par rôle | `js/app.js` (`requireAuth`) | Un joueur accédant à coach.html est redirigé vers index.html | Critique | v=47 |
| R03 | Création joueur (coach) | `pages/coach-dashboard.js`, Edge Function `create-player-account` | Coach peut créer un joueur → le joueur peut se connecter | Critique | v=47 |
| R04 | Évaluation joueur | `pages/player-home.js` | Joueur peut noter un critère (double-tap) → note sauvegardée en base | Critique | v=47 |
| R05 | Sessions coach | `pages/coach-dashboard.js` | Coach peut créer, fermer, rouvrir une session | Important | v=47 |
| R06 | Radar résultats | `pages/player-home.js`, `pages/coach-dashboard.js` | Radar s'affiche correctement après évaluation | Important | v=47 |
| R07 | Déconnexion | `js/app.js` (`logout`) | Déconnexion redirige vers index.html, session supprimée | Important | v=47 |
| R08 | Edge Function create-player-account | `supabase/functions/create-player-account/index.ts` | POST crée un compte joueur ; DELETE supprime | Critique | v=47 |
| R09 | RLS joueur isolé | Supabase RLS | Un joueur ne peut pas accéder aux données d'un autre joueur | Critique | v=47 |
| R10 | Edge Function manage-coach-account | `supabase/functions/manage-coach-account/index.ts` | POST crée un compte coach ; DELETE supprime un coach (pas un joueur) | Critique | Ajouté STORY-10 — à vérifier au déploiement |
| R11 | Interface gestion coachs | `pages/coach-dashboard.js`, `coach.html` | Onglet Coachs accessible, liste affichée, ajout/suppression fonctionnels | Important | Ajouté STORY-11 |
| R12 | Export PPT résultats joueur | `pages/coach-dashboard.js`, `coach.html` | Bouton "📊 PPT" → fichier FENIX_[nom]_[session].pptx téléchargé ; sans joueur → toast, pas d'erreur | Important | Ajouté STORY-12 |
| R13 | Show/hide password (login + modals) | `index.html`, `js/app.js`, `pages/coach-dashboard.js` | Bouton "Voir/Masquer" toggle le champ password → text dans login, création joueur et création coach | Important | Ajouté STORY-12 |
| R14 | Radar font size | `pages/coach-dashboard.js`, `pages/player-home.js` | Labels du radar lisibles (font-size 12, weight 600) sur les deux dashboards | Secondaire | Ajouté STORY-12 |
| R15 | Export PPT html2canvas (STORY-13) | `pages/coach-dashboard.js`, `coach.html` | Bouton PPT → 4 slides avec captures DOM fidèles au rendu ; garde-fous : sans joueur → toast, html2canvas absent → toast | Important | Supersédé par R16 |
| R16 | Export PPT v2 5 slides (STORY-14) | `pages/coach-dashboard.js`, `coach.html` | Bouton PPT → 5 slides : radar fond blanc, résumé côte à côte, 4 cartes axes Att, 4 cartes axes Def, CR ; logo-fenix.png visible ; guards PptxGenJS/html2canvas/radarAtt | Important | Ajouté STORY-14 |
| R17 | `showAxisDetail()` après refactoring | `pages/coach-dashboard.js` | Clic sur thème dans tableau récap → `#axisDetail` affiche le détail avec pastilles colorées, titres, labels | Important | Ajouté STORY-14 |

---

## Notes

- R01-R09 validés à v=47.
- R10 ajouté STORY-10 (Edge Function manage-coach-account) — vérification post-déploiement.
- R11 ajouté STORY-11 (interface gestion coachs UI).
- R12-R14 ajoutés STORY-12 (export PPT, show/hide password, radar font size).
- R15 ajouté STORY-13 (refonte export PPT html2canvas) — supersédé par R16.
- R16/R17 ajoutés STORY-14 (PPT v2 : 5 slides, fond blanc, cartes axes, showAxisDetail refactoring).
