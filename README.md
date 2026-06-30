# FENIX Stats — Agents BMAD

Référence des agents IA utilisés pour le développement de FENIX Stats (CF FENIX Toulouse), méthode BMAD.

Fichiers agents : `C:\Users\gromi\.claude\agents\`
Doc visuelle : `agents-reference.html`

---

## Squad Build — de l'idée au code implémenté

| Ordre | Agent | Rôle | Commande | Produit |
|---|---|---|---|---|
| 1 | 🔬 Research Analyst | Benchmark & challenge | `Joue le Research Analyst` | `docs/research/` |
| 2 | 💡 Brainstormer | Idées & créativité | `Joue le Brainstormer` | `docs/brainstorm/` |
| 3 | 📋 Analyst | Brief & vision | `Joue l'Analyst` | `docs/brief.md` |
| 4 | 📦 Product Manager | PRD & priorités | `Joue le PM` | `docs/prd.md` |
| 5 | 🎨 Designer | UX/UI & maquettes | `Joue le Designer` | `docs/design/` |
| 6 | ✨ Visual Crafter | Polish & esthétique | `Joue le Visual Crafter` | `docs/visual/` |
| 7 | 🏗 Architect | Technique & structure | `Joue l'Architect` | `docs/architecture.md` |
| 8 | 📝 Scrum Master | Stories & planning | `Joue le Scrum Master` | `docs/stories/` |
| 9 | 💻 Developer | Code & implémentation | `Joue le Developer` | Code dans le HTML |

---

## Squad Contrôle Final — du code implémenté au feu vert push

Regard indépendant du squad build. Intervient après chaque story (ou epic) et avant tout push vers GitHub Pages.

| Quand | Agent | Rôle | Commande | Produit |
|---|---|---|---|---|
| Après l'Architect, avant le Scrum Master | 🎯 Risk Analyst | Anticipation & ruptures | `Joue le Risk Analyst` | `docs/risks/` |
| Après chaque story, avant QA | 🔍 Code Reviewer | Conformité & dette technique | `Joue le Code Reviewer` | `docs/code-review/` |
| Feature touchant rôles/auth/Supabase | 🔐 Security Auditor | Droits & accès Supabase | `Joue le Security Auditor` | `docs/security/` |
| Toujours, validateur final | ✅ QA | Tests & validation | `Joue le QA` | `docs/qa/` |
| Avant chaque push | 🛡 Regression Guardian | Checklist vivante | `Joue le Regression Guardian` | `docs/regression/` |

---

## Flux complet

```
Research → Brainstorm → Analyst → PM → Designer → Visual Crafter → Architect
                                                                        │
                                                                        ▼
                                                                 🎯 Risk Analyst
                                                                        │
                                                                        ▼
                                                                  Scrum Master
                                                                        │
                                                                        ▼
                                                                       Dev
                                                                        │
                                                                        ▼
                                                                 🔍 Code Reviewer
                                                                        │
                                                                        ▼
                                                          🔐 Security Auditor (si rôles/Supabase)
                                                                        │
                                                                        ▼
                                                                       QA
                                                                        │
                                                                        ▼
                                                              🛡 Regression Guardian
                                                                        │
                                                                        ▼
                                                                    🚀 Push
```

---

## Règles d'or

- **Risk Analyst** intervient en amont, pas après coup — ses findings P0/P1 deviennent des stories ou des critères d'acceptation.
- **Code Reviewer** ne valide jamais le comportement fonctionnel, seulement la conformité du code.
- **Security Auditor** a un droit de veto absolu : un finding Critique bloque le push, point final.
- **QA** reste le validateur final qui donne le go/no-go, en s'appuyant sur les rapports des autres agents du squad contrôle.
- **Regression Guardian** ne re-teste pas tout à chaque fois — il cible ce qui est plausible à risque selon les fichiers modifiés.
