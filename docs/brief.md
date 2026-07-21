# Brief — Améliorations module socio-pro (v2)

> Agent : Analyst · 2026-07-21

---

## 1. Contexte

Le module socio-pro (fenix-sociopro.html + sociopro-dashboard.js) a été livré fonctionnellement (STORY-18 à 21). Marion (référente socio-pro) a pu se connecter, voir les joueurs et créer un premier entretien de test. Lors de ce test grandeur nature, trois lacunes bloquantes et un problème de compréhension UX ont été identifiés.

---

## 2. Problèmes identifiés

### P1 — Export PDF corrompu (bloquant)
Les emojis utilisés dans la fonction `spExportEntretiensPdf()` (💬 ✅ ⚠️ 📅 🔒) s'affichent en caractères illisibles dans Adobe Acrobat (`Ø=ßà`, `Ø=Ü¬`...). Root cause : jsPDF utilise la police Helvetica (encodage WinAnsi/Latin-1) qui ne couvre pas les codepoints emoji Unicode. Le PDF est inutilisable tel quel.

### P2 — Suppression d'entretien impossible (bloquant)
Un référent qui saisit un entretien par erreur (double saisie, mauvais joueur) ne peut pas le supprimer. Il n'existe aucun bouton de suppression dans l'interface. La seule option est d'aller dans Supabase Studio — inaccessible pour les référents.

### P3 — Vue détail entretien tronquée (important)
Dans l'historique de la fiche joueur, chaque entretien n'affiche que 3 champs : date/mene_par, mot du joueur, ce qui va / ce qui ne va pas. Les champs manquants (échéances, comment aider, actions suivantes, examens, notes cellule, justification couleur) ne sont visibles nulle part dans l'interface — seulement dans l'export .md/PDF.

### P4 — Mode Réunion incompris (UX)
L'onglet "Mode Réunion" n'est pas suffisamment explicite sur son usage. Les référents ne comprennent pas spontanément que cet onglet est conçu pour être utilisé en réunion d'équipe. La navigation carte par carte (Précédent/Suivant) est contre-intuitive. La section "Actions de la réunion" est liée à la date du jour sans que ce soit signalé.

---

## 3. Utilisateurs

| Rôle | Contexte d'usage | Appareil |
|------|-----------------|---------|
| Référent socio-pro (Marion, Mathilde, Alain) | Bureau, en déplacement, réunion d'équipe | Mobile (iPhone) + parfois desktop |
| Coach (Romain, Max) | Accès complet — peut aussi utiliser ce module | Desktop principalement |

Usage du module : environ 1x/mois par joueur pour les entretiens. Mode Réunion : 1x/mois lors des réunions de cellule socio-pro.

---

## 4. Vision

Rendre le module socio-pro pleinement opérationnel pour un usage quotidien sans intervention technique : le PDF sort propre, les erreurs de saisie sont corrigeables, toutes les données d'un entretien sont lisibles en un clic, et le Mode Réunion s'auto-explique.

---

## 5. Scope

### Dans le scope
- Fix PDF : remplacer les emojis par des équivalents texte dans `spExportEntretiensPdf()`
- Supprimer entretien : bouton dans l'historique avec `confirm()` + suppression Supabase
- Vue détail entretien : expand inline dans l'accordéon avec tous les champs
- Mode Réunion : bandeau explicatif + mini-barre de statut collectif + clarification section Actions

### Hors scope
- Édition d'un entretien existant (modification après saisie)
- Export PDF avec police Unicode/emoji native
- Historique des actions de réunion par date (filtre date_reunion)
- Modification de la structure de la base de données ssp_*

---

## 6. Critères de succès

- PDF téléchargé lisible dans Adobe Acrobat sans caractère corrompu
- Un référent peut supprimer un entretien saisi par erreur (avec confirmation)
- En cliquant sur un entretien dans l'historique, tous les champs sont visibles
- Un référent arrivant sur l'onglet Mode Réunion comprend son usage sans explication
- Zéro régression sur les features existantes

---

## 7. Questions en suspens résolues

- **Suppression en cascade** : `ssp_reprises` référence `ssp_entretiens` ON DELETE CASCADE — automatique.
- **Qui peut supprimer ?** Tout `is_sociopro_membre()` — acceptable pour une cellule de 3 personnes.
- **Mode Réunion — date** : les actions restent filtrées sur `spTodayISO()`, la date est affichée clairement.
