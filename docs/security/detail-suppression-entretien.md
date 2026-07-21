# Security Audit — Vue détail + Suppression entretien (STORY-23)

> Agent : Security Access Auditor · 2026-07-21

---

## Périmètre

- `spDeleteEntretien()` : DELETE sur `ssp_entretiens` via Supabase JS SDK
- RLS policy cible : `sp_membre_all_entretiens` (STORY-19, déployée en prod)
- Lecture des champs `notes_cellule` dans `spEntretienItemHTML`

---

## Findings

### Critique — Aucun

---

### Majeur — Aucun

---

### Mineur — M1 : `notes_cellule` visible à tous les membres socio-pro

La vue détail affiche `notes_cellule` pour tout `is_sociopro_membre()` (coach + les 3 référents). Ce champ est présenté comme "Notes cellule [Conf.]" mais est accessible à l'ensemble de la cellule — ce qui est le comportement prévu (la notation [Conf.] signifie confidentiel vis-à-vis du joueur, pas entre membres de la cellule).

**Impact** : Nul — comportement intentionnel confirmé en STORY-19 (le joueur ne voit pas `notes_cellule` via RLS/joueur).

**Vérification** : Policy `sp_joueur_own_entretiens` est FOR SELECT uniquement → pas de modification. La policy `sp_membre_all_entretiens` couvre le DELETE. ✅

---

### Mineur — M2 : Suppression sans log de traçabilité

`ssp_entretiens` n'a pas de colonne `deleted_by` ou `deleted_at`. Une suppression est irréversible et non tracée.

**Impact** : Faible pour 3 référents qui se connaissent — acceptable pour ce contexte. Le message `confirm()` et le mot "irréversible" mettent l'utilisateur en garde.

**Recommandation** : Si audit trail requis à l'avenir, envisager soft-delete (`deleted_at`). Hors scope de cette story.

---

## Vérification RLS DELETE

| Scénario | Policy | Résultat |
|----------|--------|---------|
| Référent socio-pro supprime un entretien | `sp_membre_all_entretiens` FOR ALL → `is_sociopro_membre()` = TRUE | ✅ Autorisé |
| Joueur tente de supprimer via console | `sp_joueur_own_entretiens` FOR SELECT uniquement — pas de DELETE | ✅ Refusé par Supabase |
| Utilisateur non authentifié | RLS activée → accès refusé par défaut | ✅ Refusé |
| Référent supprime un entretien d'un autre référent | Policy non scopée par `created_by` — tous les membres peuvent supprimer n'importe quel entretien | ⚠️ Comportement intentionnel (cf. brief) |

---

## Verdict

**Aucun finding Critique. STORY-23 peut passer en QA.**

Le `DELETE` est correctement protégé par RLS. La lecture de `notes_cellule` est intentionnellement réservée aux membres socio-pro (pas aux joueurs). Les deux mineurs sont acceptables pour ce contexte d'équipe restreinte.
