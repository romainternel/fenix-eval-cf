# STORY-19 — Migration SQL : renommage rôle cellule + fonction RLS

**En tant qu'** administrateur du projet,
**Je veux** exécuter un script SQL idempotent qui renomme le rôle `cellule` et la fonction RLS `is_cellule()`,
**Afin de** mettre la base en cohérence avec le code déployé et les rôles réels de chaque utilisateur.

---

## Contexte technique

- Zone concernée : Supabase SQL Editor uniquement (aucun fichier JS modifié dans cette story)
- **Prérequis absolu : STORY-18 doit être déployée en production avant d'exécuter ce SQL**
- Tables impactées par le renommage des policies : `ssp_profils`, `ssp_orientations`, `ssp_entretiens`, `ssp_reprises`, `ssp_actions_reunion`
- Livrable : fichier `supabase-sociopro-migration-v3.sql` dans le repo

---

## Critères d'acceptation

### SQL
- [ ] `is_sociopro_membre()` est créée et retourne TRUE pour `role IN ('referent_sociopro', 'coach')`
- [ ] Toutes les policies RLS des tables `ssp_*` sont reconstruites en utilisant `is_sociopro_membre()` (pas `is_cellule()`)
- [ ] `UPDATE user_profiles SET role = 'referent_sociopro' WHERE role = 'cellule'` exécuté avec succès
- [ ] `is_cellule()` est supprimée (`DROP FUNCTION IF EXISTS is_cellule()`) — en DERNIÈRE étape du script
- [ ] Le script est idempotent : `CREATE OR REPLACE` pour la fonction, `DROP POLICY IF EXISTS` + `CREATE POLICY` pour les policies

### Vérification post-migration
- [ ] `SELECT id, role FROM user_profiles WHERE role = 'cellule'` retourne **0 lignes**
- [ ] Marion, Mathilde, Alain peuvent se connecter et accéder à `fenix-sociopro.html`
- [ ] Romain et Max peuvent toujours accéder au module socio-pro depuis leur dashboard coach
- [ ] Un joueur ne peut pas lire les tables `ssp_profils`, `ssp_entretiens`, `ssp_orientations` (hors ses propres entretiens)

### Ordre d'exécution dans le script SQL (non négociable)
```
1. CREATE OR REPLACE FUNCTION is_sociopro_membre()
2. DROP POLICY IF EXISTS + CREATE POLICY pour chaque table ssp_*
3. UPDATE user_profiles SET role = 'referent_sociopro' WHERE role = 'cellule'
4. DROP FUNCTION IF EXISTS is_cellule()
```

---

## Hors scope

- Pas de modification de code JS dans cette story
- Pas de modification des structures de tables ssp_*
- Pas de retrait de la compatibilité `cellule` dans le code (story ultérieure de nettoyage)

---

## Dépend de

**STORY-18 déployée et validée en production.**

## Taille

S
