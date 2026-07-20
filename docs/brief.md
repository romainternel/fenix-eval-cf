# Brief — Module Socio-Pro : activation complète + architecture rôles

> Agent : Analyst · 2026-07-20 (cycle repris de zéro)

---

## 1. Contexte

FENIX Eval CF est une app mobile-first d'auto-évaluation pour joueurs de football en chaise. Elle dispose depuis quelques semaines d'un module socio-pro *codé mais non activé* : le code existe sur GitHub Pages (fenix-sociopro.html + 4 fichiers JS), mais aucune table SQL n'a jamais été créée dans Supabase, et les rôles nécessaires n'existent pas encore en base.

Le club a deux types de personnes chargées du suivi socio-pro :
- **Les référents purs** (Marion Agostini, Mathilde Soulié, Alain Raynal) : leur seule mission dans l'app est le socio-pro
- **Les coachs CF** (Romain, Max) : ils font l'évaluation sportive ET participent au suivi socio-pro

---

## 2. Problème réel

Le module socio-pro est inutilisable aujourd'hui pour deux raisons distinctes :

1. **Pas de SQL** : les tables `ssp_*` n'existent pas dans Supabase. Toute tentative d'accès à `fenix-sociopro.html` plante silencieusement — les requêtes retournent des erreurs.

2. **Routing cassé** : le code route encore l'ancien rôle `'cellule'` vers fenix-sociopro.html, mais ce rôle n'a jamais été attribué à personne et ne correspond plus au modèle décidé. Le rôle cible s'appelle `'referent_sociopro'`.

Ces deux problèmes bloquent l'activation complète du module.

---

## 3. Utilisateurs et besoins

| Persona | Rôle en base | Ce qu'ils font dans l'app |
|---------|-------------|--------------------------|
| Marion, Mathilde, Alain | `referent_sociopro` (à créer) | Socio-pro uniquement : entretiens, fiches, réunions |
| Romain, Max | `coach` (existe déjà) | Dashboard CF + socio-pro depuis la nav coach |
| Joueurs du CF | `joueur` (existe) | Auto-évaluation + "Mon suivi" si entretien existe |

**Contexte d'usage** : mobile (iPhone/Android), en réunion ou en couloir, connexion 4G. La navigation doit être instantanée et sans friction — un coach doit passer de ses sessions CF au module socio-pro sans logout.

---

## 4. Vision

> Le module socio-pro est opérationnel pour tous les utilisateurs concernés : les référents atterrissent directement sur leur espace, les coachs y accèdent depuis la nav, les joueurs voient leur suivi dans "Mon suivi".

---

## 5. Scope

**Dans ce cycle :**
- Créer les tables SQL `ssp_*` dans Supabase avec les bonnes policies RLS
- Créer la fonction helper `is_sociopro_membre()` (coach + referent_sociopro)
- Mettre à jour le routing JS pour `'referent_sociopro'` (retirer `'cellule'`)
- Attribuer les rôles aux 5 personnes concernées

**Hors scope :**
- Refonte UX du module (4 vues existantes sont validées)
- Export PPT socio-pro
- Gestion des rôles depuis l'UI (toujours via Supabase)
- Accès des référents aux données CF (radar, notes)

---

## 6. Critères de succès

- Marion se connecte avec son email → arrive sur fenix-sociopro.html, voit la liste des joueurs
- Romain se connecte → arrive sur coach.html → clique "Socio-Pro" → voit les mêmes données → revient au dashboard d'un clic
- Un joueur qui a eu un entretien voit "Mon suivi" dans player.html avec sa couleur du mois
- Un joueur ne peut pas accéder aux données d'un autre joueur dans les tables ssp_*

---

## 7. Décisions actées

| Question | Réponse |
|----------|---------|
| Nom du rôle référent | `referent_sociopro` |
| Nom de la fonction SQL | `is_sociopro_membre()` — retourne TRUE pour coach ET referent_sociopro |
| Un ou deux fichiers HTML ? | Un seul : fenix-sociopro.html — le lien retour coach s'affiche conditionnellement |
| Les référents voient-ils les notes CF ? | Non — aucun accès aux tables evaluations/sessions/comptes_rendus |
| Accès aux actions de réunion | Coach ET referent_sociopro — même droits |
| Notes cellule visible joueur ? | Non — intentionnellement absentes de la query dans sociopro-player.js |
