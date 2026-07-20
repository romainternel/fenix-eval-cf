# STORY-19 — SQL Supabase : tables ssp_* + RLS + is_sociopro_membre()

**En tant qu'** administrateur du projet,
**Je veux** exécuter un script SQL unique dans Supabase,
**Afin de** rendre le module socio-pro fonctionnel en base (lectures, écritures, sécurité).

---

## Contexte technique

Supabase est dans son état d'origine — aucune table ssp_* n'existe. Le fichier `supabase-sociopro.sql` est déjà rédigé et prêt à être exécuté. Cette story consiste à valider le script, l'exécuter, et vérifier le résultat.

Le script crée dans l'ordre :
1. Les 5 tables (`ssp_profils`, `ssp_orientations`, `ssp_entretiens`, `ssp_reprises`, `ssp_actions_reunion`)
2. Le trigger `ssp_set_updated_at()` sur `ssp_profils`
3. La fonction `is_sociopro_membre()` (TRUE pour coach + referent_sociopro)
4. `ENABLE ROW LEVEL SECURITY` sur toutes les tables
5. Les policies RLS (membre = CRUD complet, joueur = SELECT ses propres lignes)

---

## Critères d'acceptation

### Script SQL
- [ ] Le script `supabase-sociopro.sql` s'exécute sans erreur en **une seule passe** dans Supabase SQL Editor
- [ ] Aucune erreur "function does not exist" (la fonction est créée avant les policies)

### Tables
- [ ] Les 5 tables apparaissent dans Supabase → Table Editor
- [ ] `ssp_profils` a bien la contrainte UNIQUE sur `joueur_id`
- [ ] `ssp_entretiens.couleur` n'accepte que `'vert'`, `'orange'`, `'rouge'`
- [ ] `ssp_actions_reunion.statut` n'accepte que `'a_faire'`, `'en_cours'`, `'fait'`

### RLS
- [ ] RLS activé sur les 5 tables (visible dans Supabase → Authentication → Policies)
- [ ] `is_sociopro_membre()` est listée dans Supabase → Database → Functions
- [ ] Un test SQL `SELECT is_sociopro_membre()` avec un JWT joueur retourne `false`
- [ ] Un test SQL avec un JWT coach retourne `true`

### Attribution des rôles (après SQL)
- [ ] Marion Agostini : `UPDATE user_profiles SET role = 'referent_sociopro' WHERE id = '<uuid>'` exécuté
- [ ] Mathilde Soulié : idem
- [ ] Alain Raynal : idem
- [ ] Romain : `role = 'coach'` déjà en place OU compte créé via onglet Coachs + role vérifié
- [ ] Max : idem

---

## Hors scope

- Pas de modification de code JS dans cette story
- Pas de création de données (les tables restent vides après le SQL)

---

## Dépend de

STORY-18 déployée (recommandé) — techniquement le SQL peut être exécuté avant, mais si les comptes referent_sociopro sont créés avant que le code soit déployé, ces utilisateurs verront une page vide.

## Taille

S
