# Brief — Export PowerPoint des résultats d'évaluation

> Agent : Analyst | Date : 2026-06-30

---

## 1. Contexte

Le dashboard coach dispose d'un export PDF (jsPDF) qui génère un document portrait A4 avec les radars et le compte-rendu d'entretien. Ce PDF est fonctionnel mais visuellement limité : layout figé, polices sans personnalisation, pas de tableau de détail par critère. L'utilisateur (coach) veut un export professionnel qu'il peut ensuite présenter aux joueurs ou à la direction du club, en format paysage (réunion, partage écran, impression).

## 2. Problème

L'export PDF actuel ne permet pas :
- D'afficher le détail des critères par axe avec code couleur (joueur vs staff)
- Un layout paysage adapté à la présentation
- Une mise en page structurée par section (slide par slide)
- Un rendu premium digne d'un club professionnel

De plus, PowerPoint est un format natif pour les réunions de staff et les bilans de fin de saison — il peut être retravaillé, annoté, envoyé facilement.

## 3. Utilisateurs

**Coach** — sur PC (bureau ou laptop), après une session d'évaluation fermée ou lors d'un bilan multi-sessions. Il génère l'export depuis la vue "Résultats" d'un joueur. Il ne doit pas avoir à configurer quoi que ce soit — un clic → un fichier .pptx.

## 4. Vision

Permettre au coach d'exporter en un clic un rapport PowerPoint paysage, structuré en 4 slides, prêt à être présenté ou partagé, avec le branding FENIX.

## 5. Scope

**Dedans :**
- Remplacement du bouton "📄 PDF" par "📊 PPT" dans la vue résultats joueur
- Slide 1 : en-tête FENIX + nom joueur + session + deux radars (Att + Def) côte à côte + logo + légende
- Slide 2 : tableau critères Attaque avec note joueur et staff, code couleur n1→n5
- Slide 3 : tableau critères Défense (même format)
- Slide 4 : compte-rendu entretien (points forts, axes, objectifs CT/MT, CR)
- Librairie PptxGenJS chargée via CDN dans coach.html
- Cas profil GB (gardien) : un seul radar + slides 2/3 fusionnées

**Dehors :**
- Export PDF conservé dans player-home.js (côté joueur — non modifié)
- Export PDF coach existant : supprimé et remplacé (pas de coexistence)
- Personnalisation des slides par l'utilisateur (c'est PowerPoint qui prend le relai)
- Export multi-joueurs ou multi-sessions en un clic

## 6. Critères de succès

- Un clic sur "📊 PPT" → téléchargement automatique d'un fichier `.pptx`
- Le fichier s'ouvre dans PowerPoint, LibreOffice et Google Slides sans erreur
- Slide 1 : radars lisibles, légende correcte, logo visible
- Slides 2/3 : tous les critères listés avec couleur de fond selon note (n1-n5)
- Slide 4 : uniquement les champs non vides de l'entretien
- Fichier nommé `FENIX_NomJoueur_Session.pptx`

## 7. Questions en suspens

Aucune — le brief est complet et la décision technique (PptxGenJS CDN) est déjà validée par l'utilisateur.
