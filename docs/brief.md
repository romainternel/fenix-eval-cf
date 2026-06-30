# Brief — Gestion des comptes coachs

> Agent : Analyst | Date : 2026-06-30 | Feature : gestion-coachs

---

## 1. Contexte

Actuellement, FENIX Eval CF n'a qu'un seul compte coach. Ajouter un co-coach nécessite de passer par le dashboard admin Supabase — interface technique réservée aux développeurs. Lors d'une tentative réelle, le coach principal a rencontré une erreur de contrainte de clé étrangère (FK error : insertion dans `user_profiles` avant que la ligne existe dans `auth.users`). L'opération a échoué. La décision a été prise explicitement : **"c'est pas mieux de coder et de me laisser gérer ajout et les rôles en même temps"** → on code une interface dans l'app.

## 2. Problème

Le coach principal ne peut pas créer un co-coach depuis l'application. Le chemin actuel impose :

1. Se connecter sur dashboard.supabase.com (interface technique)
2. Naviguer dans Authentication → Users → créer un utilisateur
3. Aller dans Table Editor → user_profiles → insérer manuellement une ligne avec le bon UUID
4. Respecter l'ordre exact (auth d'abord, user_profiles ensuite) sous peine de FK error

Ce processus est non reproductible par un non-développeur, source d'erreurs, et contraire à l'autonomie attendue d'un coach principal.

## 3. Utilisateurs

| Utilisateur | Rôle | Appareil | Contexte |
|-------------|------|----------|---------|
| Coach principal (Romain) | Crée/supprime les comptes coachs | iPhone (mobile portrait) | Bureau ou vestiaire, pas en match — opération rare |
| Co-coach (ex : Max) | Reçoit ses identifiants et se connecte | Mobile | Accès complet au dashboard coach |

Fréquence d'usage : **rare** (quelques fois par saison). Pas d'urgence temps. Pas de contexte offline.

## 4. Vision

Le coach principal crée et supprime des comptes coachs directement depuis son dashboard en moins de 2 minutes, sans jamais ouvrir Supabase.

## 5. Scope

**Dans le scope :**
- Lister les coachs existants (prénom, nom)
- Créer un compte coach (prénom, nom, email, mot de passe)
- Supprimer un compte coach
- Validation basique côté formulaire (email format, password ≥ 8 chars)
- Toast succès/erreur
- Protection contre l'auto-suppression (ne peut pas supprimer son propre compte)

**Hors scope :**
- Modifier l'email ou le mot de passe d'un coach existant
- Envoi d'un lien d'invitation par email
- Distinction rôles coach (admin vs assistant) — tous les coachs ont les mêmes droits en v1
- Réinitialisation mot de passe depuis l'app
- Mode invité lecture seule

## 6. Critères de succès

- Un coach peut créer un co-coach en < 2 minutes depuis l'app
- Le co-coach peut se connecter immédiatement après création
- Zéro intervention sur le dashboard Supabase requise
- L'erreur FK constraint est structurellement impossible (création atomique via Edge Function)
- Les erreurs API sont affichées de façon lisible (pas de code technique)

## 7. Questions en suspens

Aucune question bloquante. Le scope est clair, la décision est prise, la stack est connue (Edge Function pattern déjà existant pour les joueurs).

Note pour la v2 : si le club grandit, la distinction "coach admin" (peut gérer les coachs) vs "coach assistant" (consultation seule) pourra être adressée en ajoutant un champ `is_admin` dans `user_profiles`.
