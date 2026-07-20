# STORY-20 — Validation end-to-end du module socio-pro

**En tant que** membre de la cellule socio-pro,
**Je veux** que le module soit vérifié de bout en bout avant mise en usage réel,
**Afin d'** être sûr qu'aucun rôle n'est bloqué et qu'aucune donnée ne fuite entre joueurs.

---

## Contexte technique

STORY-18 (code) et STORY-19 (SQL) sont terminées. Cette story est une story de vérification fonctionnelle — pas de nouveau code. Si un test échoue, on revient en STORY-18 ou STORY-19 pour corriger.

---

## Critères d'acceptation

### Parcours référent socio-pro
- [ ] Marion se connecte avec son email → redirigée vers `fenix-sociopro.html`
- [ ] Elle voit la liste des joueurs (potentiellement vide si aucun entretien, pas d'erreur JS)
- [ ] Elle peut accéder à la fiche d'un joueur (Vue 2)
- [ ] Elle peut créer un entretien et le sauvegarder (Vue 3) — une row apparaît dans `ssp_entretiens`
- [ ] Elle ne voit PAS le lien "← Dashboard coach" dans la nav
- [ ] Elle ne peut pas accéder à `coach.html` manuellement (redirigée vers fenix-sociopro.html)

### Parcours coach
- [ ] Romain se connecte → redirigé vers `coach.html`
- [ ] Il voit le tab "Socio-Pro ↗" dans la nav
- [ ] Clic → arrive sur `fenix-sociopro.html`, voit les mêmes données que Marion
- [ ] Il voit le lien "← Dashboard coach" dans la nav
- [ ] Clic "← Dashboard coach" → retour sur `coach.html`, toujours connecté
- [ ] Il peut créer une action de réunion (Mode Réunion → ssp_actions_reunion)

### Parcours joueur
- [ ] Un joueur se connecte → `player.html` avec onglet "Mon suivi"
- [ ] Si aucun entretien le concernant : message "Pas encore d'entretien"
- [ ] Après qu'un entretien a été créé par un référent pour ce joueur : le joueur voit sa couleur, "ce qui va", ses actions
- [ ] Le joueur ne voit PAS `notes_cellule` ni `couleur_justification` dans l'interface
- [ ] Le joueur ne peut pas accéder à `fenix-sociopro.html` (redirigé vers player.html)

### Isolation des données
- [ ] Le joueur A ne peut pas lire les entretiens du joueur B (vérifiable en console navigateur : query retourne 0 résultats pour un autre joueur_id)

---

## Hors scope

- Pas de test de performance ni de charge
- Pas de test de l'export PDF/MD (fonctionnel dès que les données existent)
- Pas d'audit de sécurité complet (R2 du Risk Analyst — accepté pour v1)

---

## Dépend de

STORY-18 déployée + STORY-19 exécutée + rôles attribués.

## Taille

S
