# PRD — Gestion des comptes coachs

> Agent : Product Manager | Date : 2026-06-30 | Feature : gestion-coachs
> Source : docs/brief.md

---

## 1. Objectif

Permettre au coach principal de gérer les comptes coachs (créer, lister, supprimer) directement depuis le dashboard FENIX, sans passer par Supabase.

---

## 2. Features

### F1 — Onglet "Coachs" dans la navigation

Ajout d'un troisième onglet dans la barre de navigation du dashboard coach, après "Joueurs". Cet onglet est la surface d'entrée de toute la gestion des coachs.

**Description fonctionnelle :**
- Onglet visible uniquement pour les utilisateurs avec `role='coach'`
- Affiche la liste des comptes coach existants
- Fournit le point d'entrée pour créer un nouveau coach

### F2 — Liste des coachs

Affiche tous les comptes avec `role='coach'` dans `user_profiles`, avec le nom complet de chaque coach.

**Description fonctionnelle :**
- Chaque ligne : prénom + nom + badge "Vous" si c'est le compte courant
- Bouton "Supprimer" sur chaque ligne, sauf pour le compte courant
- État vide : message clair si aucun co-coach n'existe encore (le coach lui-même n'est pas surprenant dans la liste)
- Bouton "+ Ajouter un coach" en haut de la liste

### F3 — Création d'un compte coach

Modal de saisie → appel Edge Function → création atomique du compte auth + profil.

**Description fonctionnelle :**
- Champs : Prénom (required), Nom (required), Email (required), Mot de passe (required)
- Validation côté client : email format valide, mot de passe ≥ 8 caractères
- Appel POST à l'Edge Function `manage-coach-account`
- Résultat : toast "Coach ajouté avec succès" + rafraîchissement de la liste
- Erreur : toast lisible (ex : "Cet email est déjà utilisé") — pas de message technique

### F4 — Suppression d'un compte coach

Suppression du compte auth et du profil associé.

**Description fonctionnelle :**
- Bouton "Supprimer" visible uniquement sur les autres coachs (pas sur soi)
- Confirmation demandée avant toute suppression
- Appel DELETE à l'Edge Function `manage-coach-account`
- Résultat : toast "Coach supprimé" + rafraîchissement de la liste
- Erreur : toast lisible

### F5 — Backend : schema + Edge Function

Prérequis technique pour F2, F3, F4. Invisible pour l'utilisateur.

**Description fonctionnelle :**
- Ajout des colonnes `nom TEXT`, `prenom TEXT`, `email TEXT` dans `user_profiles` (nullable — compatibilité avec l'existant)
- Nouvelle Edge Function `manage-coach-account` déployée sur Supabase
  - POST `{ email, password, nom, prenom }` → crée auth user + insère user_profiles(role='coach')
  - DELETE `{ coach_user_id }` → supprime auth user (+ user_profiles en cascade)
  - Vérifie systématiquement que l'appelant est un coach (même garde que `create-player-account`)

---

## 3. Priorités

| Feature | Priorité | Justification |
|---------|---------|---------------|
| F5 — Backend schema + Edge Function | Must Have | Prérequis de tout le reste |
| F1 — Onglet Coachs | Must Have | Point d'entrée obligatoire |
| F2 — Liste des coachs | Must Have | Nécessaire pour savoir ce qui existe |
| F3 — Création coach | Must Have | Raison d'être de la feature |
| F4 — Suppression coach | Must Have | Sans suppression, les erreurs sont irréversibles depuis l'app |

Toutes les features sont Must Have — elles forment un ensemble indivisible. Une feature partielle (créer sans lister, ou lister sans supprimer) ne résout pas le problème.

---

## 4. Critères d'acceptation globaux

- [ ] Un coach peut créer un co-coach en < 2 minutes depuis l'app (mobile portrait)
- [ ] Le co-coach peut se connecter immédiatement après création sur index.html
- [ ] Zéro intervention sur le dashboard Supabase requise pour tout le flux
- [ ] L'erreur FK constraint est impossible (atomicité garantie par l'Edge Function)
- [ ] Les messages d'erreur sont lisibles et actionnables (pas de stacktrace, pas d'UUID brut)
- [ ] Le coach courant ne peut pas supprimer son propre compte

---

## 5. Hors scope

- Modifier l'email ou le mot de passe d'un coach existant après création
- Envoi automatique d'un email d'invitation au nouveau coach
- Distinction rôles coach (admin / assistant) — v1 : tous les coachs ont les mêmes droits
- Réinitialisation de mot de passe depuis l'app
- Mode invité lecture seule
- Historique des actions sur les comptes coach

---

## 6. Dépendances

- La Service Role Key Supabase doit être configurée dans les secrets de l'Edge Function (déjà fait pour `create-player-account` — même projet Supabase, même secret)
- CLI Supabase disponible pour déployer la nouvelle Edge Function (`supabase functions deploy manage-coach-account`)
- RLS existante sur `user_profiles` : vérifier que `SELECT WHERE role='coach'` est accessible à tous les coachs (policy "self or coach" — à confirmer en STORY-10)

---

## 7. Risques identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|------------|--------|-----------|
| Email déjà utilisé dans Auth | Faible | Moyen | Message d'erreur lisible depuis l'API |
| Suppression accidentelle d'un coach | Faible | Élevé | Dialog de confirmation obligatoire |
| Auto-suppression = lockout | Très faible | Critique | Bouton absent pour le compte courant |
| RLS bloque la liste des autres coachs | Faible | Élevé | À vérifier en STORY-10 (policy SELECT) |
| user_profiles non cascadé à la suppression auth | Faible | Moyen | Suppression explicite dans l'Edge Function |
