/* ─── FENIX Eval CF — Données critères (STORY 03) ───────────────────────────
   Générés depuis cartes_fenix.html — source de vérité.
   Structure : CRITERIA[profilId].axes[axeId].criteres[i]
   critere_id : "{profilId}-{axeId}-{num}"  ex: "ailier-att-lecture-1"
──────────────────────────────────────────────────────────────────────────── */

const CRITERIA = {

  /* ═══════════════════════════════════════════════════════════ AILIER ATT */
  "ailier-att": {
    label: "Profil Ailier",
    type:  "att",
    axes: {
      "lecture": {
        label: "Lecture",
        criteres: [
          { id: "ailier-att-lecture-1", label: "Perception action du PB",
            texte: "Je lis ce que fait le porteur de balle (croisé, reste, lâche) et j'anticipe ce qui va m'arriver" },
          { id: "ailier-att-lecture-2", label: "Perception action du défenseur (grand espace)",
            texte: "Je lis la position et l'intention de mon défenseur pour choisir : tirer, traverser ou passer, y compris sur grand espace" },
          { id: "ailier-att-lecture-3", label: "Jeu avec le pivot",
            texte: "Je reconnais quand le pivot est en gain de position et je sais l'utiliser" },
          { id: "ailier-att-lecture-4", label: "Exploitation dans le dos des défenseurs",
            texte: "Je lis les décrochages défensifs et je me place pour recevoir en profondeur ou revenir à mon poste" },
          { id: "ailier-att-lecture-5", label: "Changement de statut",
            texte: "Je réagis vite quand mon équipe perd la balle (repli défensif)" }
        ]
      },
      "creation": {
        label: "Création",
        criteres: [
          { id: "ailier-att-creation-1", label: "Création d'espace / Duel",
            texte: "Je maîtrise les fondamentaux d'écartement, de fixation et de duel pour créer de l'espace et/ou un déséquilibre défensif" },
          { id: "ailier-att-creation-2", label: "Jeu autour du pivot",
            texte: "Je joue autour du pivot pour créer un déséquilibre défensif" },
          { id: "ailier-att-creation-3", label: "Passe vers l'arrière",
            texte: "Je suis en capacité d'attirer un défenseur et d'être efficace sur ma passe vers l'arrière" },
          { id: "ailier-att-creation-4", label: "Passe au pivot",
            texte: "Je sais trouver le pivot dans le bon timing et avec la bonne trajectoire" },
          { id: "ailier-att-creation-5", label: "Passe longue",
            texte: "Ma passe longue est précise — hauteur de poitrine, devant le coéquipier, exploitable en course. Je suis en capacité d'envoyer la balle où je veux (renversement, ailier, pivot, arrière)" },
          { id: "ailier-att-creation-6", label: "Passe sous pression",
            texte: "Même sous pression, ma passe est précise — hauteur de poitrine, devant, exploitable pour mon coéquipier" },
          { id: "ailier-att-creation-7", label: "Bloc / écran",
            texte: "Je sais poser un bloc ou un écran dans un bon timing de manière efficace" }
        ]
      },
      "finition": {
        label: "Finition",
        criteres: [
          { id: "ailier-att-finition-1", label: "Efficacité grand angle",
            texte: "Je suis efficace quand j'ai de l'espace et un bon angle d'impulsion" },
          { id: "ailier-att-finition-2", label: "Efficacité angle fermé",
            texte: "Je suis efficace en situation contrainte, angle réduit" },
          { id: "ailier-att-finition-3", label: "Efficacité rentrée en pivot",
            texte: "Je suis efficace au tir lors de mes rentrées en pivot" },
          { id: "ailier-att-finition-4", label: "Efficacité en contre-attaque",
            texte: "Je suis efficace en jeu rapide, seul face au GB ou en situation de supériorité" }
        ]
      },
      "skills": {
        label: "Skills",
        criteres: [
          { id: "ailier-att-skills-1", label: "Réception en course",
            texte: "Je prends la balle en mouvement et à l'aise, sans perdre mon élan ni mon information défensive" },
          { id: "ailier-att-skills-2", label: "Se démarquer",
            texte: "Je crée de l'espace par mon jeu sans ballon pour recevoir dans de bonnes conditions" },
          { id: "ailier-att-skills-3", label: "Protection de balle",
            texte: "Je protège correctement ma balle pour me permettre tous les choix possibles — tir, passe courte, longue, au pivot, en renversement — en utilisant mon corps et mon bras non porteur" },
          { id: "ailier-att-skills-4", label: "Dribble",
            texte: "Je l'utilise de façon appropriée et pas systématiquement, notamment en MDB — dribble d'approche duel, contournement pivot…" },
          { id: "ailier-att-skills-5", label: "Passes des deux mains",
            texte: "Je suis capable de passer des deux côtés avec qualité" }
        ]
      }
    }
  },

  /* ═══════════════════════════════════════════════════════════ ARRIÈRE ATT */
  "arr-att": {
    label: "Profil Arrière",
    type:  "att",
    axes: {
      "lecture": {
        label: "Lecture",
        criteres: [
          { id: "arr-att-lecture-1", label: "Perception action du PB",
            texte: "Je lis ce que fait le porteur de balle (décaler/croiser) et j'anticipe ce qui va m'arriver" },
          { id: "arr-att-lecture-2", label: "Prise de décision",
            texte: "Je lis rapidement la position et l'intention de mon défenseur pour choisir la bonne action : tirer, traverser ou passer" },
          { id: "arr-att-lecture-3", label: "Jeu avec le pivot",
            texte: "Je reconnais quand le pivot est en gain de position et je sais l'utiliser au bon moment" },
          { id: "arr-att-lecture-4", label: "Jeu sans ballon",
            texte: "Je lis les espaces ouverts et/ou les décrochages défensifs et je me déplace sans ballon pour recevoir en profondeur ou assurer la continuité" },
          { id: "arr-att-lecture-5", label: "Changement de statut",
            texte: "Je réagis vite quand mon équipe perd la balle (repli défensif)" },
          { id: "arr-att-lecture-6", label: "Gestion du rythme",
            texte: "Je sais gérer les temps d'attaque — accélérer, ralentir, repérer les temps forts et les temps faibles" }
        ]
      },
      "creation": {
        label: "Création",
        criteres: [
          { id: "arr-att-creation-1", label: "Création d'espace / Duel",
            texte: "Je maîtrise les fondamentaux d'écartement, de fixation et de duel pour créer de l'espace et/ou un déséquilibre défensif" },
          { id: "arr-att-creation-2", label: "Jeu autour du pivot",
            texte: "Je maîtrise le jeu autour du pivot pour créer un déséquilibre défensif" },
          { id: "arr-att-creation-3", label: "Passe à l'aile",
            texte: "Je suis en capacité d'attirer un défenseur et d'être efficace sur ma passe vers l'ailier" },
          { id: "arr-att-creation-4", label: "Passe au pivot",
            texte: "Je sais trouver le pivot dans le bon timing et avec la bonne trajectoire" },
          { id: "arr-att-creation-5", label: "Passe longue",
            texte: "Ma passe longue est précise — hauteur de poitrine, devant le coéquipier, exploitable en course. Je suis en capacité d'envoyer la balle où je veux (renversement, ailier, pivot, arrière)" },
          { id: "arr-att-creation-6", label: "Passe sous pression",
            texte: "Même sous pression, ma passe est précise — hauteur de poitrine, devant, exploitable pour mon coéquipier" }
        ]
      },
      "finition": {
        label: "Finition",
        criteres: [
          { id: "arr-att-finition-1", label: "Efficacité tir 9m",
            texte: "Je suis efficace sur mes tirs à longue distance dans les bonnes conditions" },
          { id: "arr-att-finition-2", label: "Efficacité mi-distance",
            texte: "Je suis efficace sur mes tirs après pénétration partielle ou duel" },
          { id: "arr-att-finition-3", label: "Efficacité tir 6m",
            texte: "Je suis efficace quand je pénètre jusqu'à la zone et que je finis près du but" },
          { id: "arr-att-finition-4", label: "Efficacité en contre-attaque",
            texte: "Je suis efficace en jeu rapide, en situation de supériorité ou face au GB" }
        ]
      },
      "skills": {
        label: "Skills",
        criteres: [
          { id: "arr-att-skills-1", label: "Réception en course & prise d'information",
            texte: "Je prends la balle en mouvement et à l'aise — je lis la situation au moment de la réception pour enchaîner le bon choix" },
          { id: "arr-att-skills-2", label: "Désengagement et gestion de la profondeur",
            texte: "Je sais me désengager d'une situation pour assurer la conservation et la continuité" },
          { id: "arr-att-skills-3", label: "Protection de balle",
            texte: "Je protège correctement ma balle pour me permettre tous les choix possibles — tir, passe courte, longue, au pivot, en renversement — en utilisant mon corps et mon bras non porteur" },
          { id: "arr-att-skills-4", label: "Dribble",
            texte: "Je l'utilise de façon appropriée et pas systématiquement — dribble d'approche duel, pénétration, contournement pivot" },
          { id: "arr-att-skills-5", label: "Se situer dans l'intervalle libre",
            texte: "Je trouve et j'occupe les espaces libres entre les défenseurs pour recevoir en situation favorable" },
          { id: "arr-att-skills-6", label: "Passes des deux mains",
            texte: "Je suis capable de passer des deux côtés avec qualité" }
        ]
      }
    }
  },

  /* ═══════════════════════════════════════════════════════════ DC ATT */
  "dc-att": {
    label: "Profil DC",
    type:  "att",
    axes: {
      "lecture": {
        label: "Lecture & Orga",
        criteres: [
          { id: "dc-att-lecture-1", label: "Lecture de la défense en place",
            texte: "Je lis simultanément la position de tous les défenseurs pour identifier le point faible à attaquer — je suis en capacité de choisir dans le projet de jeu de l'équipe la stratégie adaptée" },
          { id: "dc-att-lecture-2", label: "Lecture de mon équipe en attaque",
            texte: "Je suis capable de connaître les points forts de mes coéquipiers et de les mettre en situation, tout en respectant le plan de jeu stratégique établi" },
          { id: "dc-att-lecture-3", label: "Perception action du défenseur direct",
            texte: "Je lis rapidement l'intention de mon défenseur pour décider : tirer, traverser ou passer" },
          { id: "dc-att-lecture-4", label: "Jeu avec le pivot",
            texte: "Je reconnais quand le pivot est en gain de position et je sais l'utiliser au bon moment" },
          { id: "dc-att-lecture-5", label: "Gestion du rythme collectif",
            texte: "Je sais accélérer, ralentir, repérer les temps forts et les temps faibles pour toute l'équipe" },
          { id: "dc-att-lecture-6", label: "Jeu sans ballon",
            texte: "Je me déplace sans ballon pour créer des espaces, attirer des défenseurs et assurer la continuité" },
          { id: "dc-att-lecture-7", label: "Changement de statut",
            texte: "Je réagis vite quand mon équipe perd la balle — je suis souvent le premier à déclencher le repli" }
        ]
      },
      "creation": {
        label: "Création & Anim",
        criteres: [
          { id: "dc-att-creation-1", label: "Création d'espace / Duel",
            texte: "Je maîtrise les fondamentaux d'écartement, de fixation et de duel pour créer de l'espace et/ou un déséquilibre défensif" },
          { id: "dc-att-creation-2", label: "Jeu autour du pivot",
            texte: "Je maîtrise le jeu autour du pivot pour créer un déséquilibre défensif" },
          { id: "dc-att-creation-3", label: "Passe à l'aile",
            texte: "Je suis en capacité d'attirer un défenseur et d'être efficace sur ma passe vers l'ailier" },
          { id: "dc-att-creation-4", label: "Passe au pivot",
            texte: "Je sais trouver le pivot dans le bon timing et avec la bonne trajectoire" },
          { id: "dc-att-creation-5", label: "Passe longue",
            texte: "Ma passe longue est précise — hauteur de poitrine, devant le coéquipier, exploitable en course. Je suis en capacité d'envoyer la balle où je veux (renversement, ailier, pivot, arrière)" },
          { id: "dc-att-creation-6", label: "Passe sous pression",
            texte: "Même sous pression, ma passe est précise — hauteur de poitrine, devant, exploitable pour mon coéquipier" },
          { id: "dc-att-creation-7", label: "Passe croisée",
            texte: "Je sais effectuer une passe croisée propre pour mon partenaire tout en maintenant une pression sur le défenseur (contact, enfoncer)" },
          { id: "dc-att-creation-8", label: "Animation des temps forts",
            texte: "Je suis capable d'annoncer et de mener le jeu clairement par le geste ou la voix pour mes coéquipiers" }
        ]
      },
      "finition": {
        label: "Finition",
        criteres: [
          { id: "dc-att-finition-1", label: "Efficacité tir 9m",
            texte: "Je suis efficace sur mes tirs à longue distance dans les bonnes conditions" },
          { id: "dc-att-finition-2", label: "Efficacité mi-distance",
            texte: "Je suis efficace sur mes tirs après pénétration partielle ou duel" },
          { id: "dc-att-finition-3", label: "Efficacité tir 6m",
            texte: "Je suis efficace quand je pénètre jusqu'à la zone et que je finis près du but" },
          { id: "dc-att-finition-4", label: "Efficacité en contre-attaque",
            texte: "Je suis efficace en jeu rapide, en situation de supériorité ou face au GB" }
        ]
      },
      "skills": {
        label: "Skills",
        criteres: [
          { id: "dc-att-skills-1", label: "Réception en course & prise d'information",
            texte: "Je prends la balle en mouvement et à l'aise — je lis la situation au moment de la réception pour enchaîner le bon choix" },
          { id: "dc-att-skills-2", label: "Désengagement et gestion de la profondeur",
            texte: "Je sais me désengager d'une situation pour assurer la conservation et la continuité" },
          { id: "dc-att-skills-3", label: "Protection de balle",
            texte: "Je protège correctement ma balle pour me permettre tous les choix possibles — en utilisant mon corps et mon bras non porteur" },
          { id: "dc-att-skills-4", label: "Dribble",
            texte: "Je l'utilise de façon appropriée et pas systématiquement — dribble d'approche duel, pénétration, contournement pivot" },
          { id: "dc-att-skills-5", label: "Se situer dans l'intervalle libre",
            texte: "Je trouve et j'occupe les espaces libres entre les défenseurs pour recevoir en situation favorable" },
          { id: "dc-att-skills-6", label: "Passes des deux mains",
            texte: "Je suis capable de passer des deux côtés avec qualité" },
          { id: "dc-att-skills-7", label: "Changement de rythme",
            texte: "Je sais varier mon tempo d'action pour déséquilibrer la défense — accélération, feinte, arrêt" }
        ]
      }
    }
  },

  /* ═══════════════════════════════════════════════════════════ PIVOT ATT */
  "pvt-att": {
    label: "Profil Pivot",
    type:  "att",
    axes: {
      "lecture": {
        label: "Lecture",
        criteres: [
          { id: "pvt-att-lecture-1", label: "Se situer face au ballon",
            texte: "Je suis capable de me positionner en permanence en fonction de la position du ballon pour être disponible" },
          { id: "pvt-att-lecture-2", label: "Lecture de la défense",
            texte: "Je sens et lis le comportement de mon défenseur pour anticiper mon mouvement" },
          { id: "pvt-att-lecture-3", label: "Exploitation de la profondeur défensive",
            texte: "Je lis les décrochages défensifs et sais exploiter dans le bon timing les espaces dans mon dos" },
          { id: "pvt-att-lecture-4", label: "Timing de réception",
            texte: "Je sais déclencher mon mouvement au bon moment pour recevoir dans les meilleures conditions" },
          { id: "pvt-att-lecture-5", label: "Changement de statut",
            texte: "Je réagis immédiatement quand mon équipe perd la balle — repli et repositionnement" }
        ]
      },
      "gainbloc": {
        label: "Gain de position & Bloc",
        criteres: [
          { id: "pvt-att-gainbloc-1", label: "Gain de position",
            texte: "Je suis capable de me placer et de me maintenir dans une position favorable malgré le défenseur" },
          { id: "pvt-att-gainbloc-2", label: "Bloc",
            texte: "Je sais poser un bloc efficace — position stable, largeur, timing — pour créer un espace à exploiter pour mon coéquipier" },
          { id: "pvt-att-gainbloc-3", label: "Enchaînement de gain de position",
            texte: "Je sais enchaîner les gains de position en anticipant les enchaînements base arrière si je ne peux pas recevoir" },
          { id: "pvt-att-gainbloc-4", label: "Glissement",
            texte: "Je sais glisser au bon moment après un bloc ou si la défense prend de la profondeur pour recevoir en position d'accès au but" }
        ]
      },
      "finition": {
        label: "Finition",
        criteres: [
          { id: "pvt-att-finition-1", label: "Efficacité secteur central",
            texte: "Je suis efficace au tir face au but, dans l'axe central de la zone" },
          { id: "pvt-att-finition-2", label: "Efficacité secteur extérieur angle ouvert",
            texte: "Je suis efficace au tir en secteur extérieur côté ouvert" },
          { id: "pvt-att-finition-3", label: "Efficacité secteur extérieur angle fermé",
            texte: "Je suis efficace au tir en secteur extérieur côté fermé" }
        ]
      },
      "skills": {
        label: "Skills",
        criteres: [
          { id: "pvt-att-skills-1", label: "Utilisation du corps",
            texte: "J'utilise mon corps efficacement pour protéger ma position, résister au contact et créer de l'espace" },
          { id: "pvt-att-skills-2", label: "Formes de tir",
            texte: "Je maîtrise plusieurs formes de tir adaptées à mon secteur (traverser, contourner, lober)" },
          { id: "pvt-att-skills-3", label: "Se retourner / pivoter",
            texte: "Je sais me retourner efficacement avec la balle dans un espace réduit pour tirer" },
          { id: "pvt-att-skills-4", label: "Utilisation des deux mains",
            texte: "J'attrape le ballon des deux mains" },
          { id: "pvt-att-skills-5", label: "Prise de balle dans le contact",
            texte: "Je suis capable de réceptionner la balle dans une situation de contact physique intense" },
          { id: "pvt-att-skills-6", label: "Déplacements et feinte",
            texte: "Je me déplace efficacement dans et autour de la zone en anticipant les espaces — ou en feintant de prendre un espace pour revenir (Fake)" }
        ]
      }
    }
  },

  /* ═══════════════════════════════════════════════════════════ N°1 DEF */
  "n1-def": {
    label: "Profil N°1",
    type:  "def",
    axes: {
      "lecture": {
        label: "Lecture",
        criteres: [
          { id: "n1-def-lecture-1", label: "Lecture du rapport de force",
            texte: "Je reconnais si je suis en situation d'avantage ou de désavantage défensif (distance, position, vitesse du PB)" },
          { id: "n1-def-lecture-2", label: "Lecture de l'entraide",
            texte: "Je reconnais quand mon partenaire est débordé et j'adapte mon comportement en conséquence" },
          { id: "n1-def-lecture-3", label: "Lecture du crédit d'action",
            texte: "Je sais repérer l'action du PB — dribble, arrêt du dribble, volonté de passer — pour agir au bon moment" },
          { id: "n1-def-lecture-4", label: "Répartition",
            texte: "Je sais compter et m'adapter au changement de vis-à-vis (sur rentrée, départ d'arrière, 7vs6…)" },
          { id: "n1-def-lecture-5", label: "Changement de statut",
            texte: "Je réagis immédiatement quand mon équipe récupère la balle — je change de statut sans délai" },
          { id: "n1-def-lecture-6", label: "Adaptation tactique",
            texte: "Je suis capable d'adapter mes positions, mes articulations et mes choix en fonction des consignes tactiques et des comportements travaillés à l'entraînement, selon le projet défensif collectif" }
        ]
      },
      "action": {
        label: "Action",
        criteres: [
          { id: "n1-def-action-1", label: "Demi-position",
            texte: "Je sais me placer en demi-position pour piéger le PB à l'opposé — intercepter, faire reculer l'arrière, ou revenir sur mon ailier si passe sautée" },
          { id: "n1-def-action-2", label: "Dissuasion / Collage",
            texte: "J'empêche systématiquement l'arrière de s'appuyer sur l'ailier — je sais coller un attaquant dans les conditions du projet" },
          { id: "n1-def-action-3", label: "Duel défensif",
            texte: "Je suis capable de neutraliser mon adversaire direct — je reste entre le but et le PB" },
          { id: "n1-def-action-4", label: "Contournement pivot",
            texte: "Je sais contourner efficacement le pivot quand il cherche à prendre une position dans mon couloir" },
          { id: "n1-def-action-5", label: "Entraide",
            texte: "Je suis capable d'aider un partenaire débordé en me déplaçant face à l'attaquant et en cherchant à gober le ballon" },
          { id: "n1-def-action-6", label: "Communication",
            texte: "Je communique avec mes partenaires sur les changements, les dangers, les imprévus" }
        ]
      },
      "mentalite": {
        label: "Mentalité",
        criteres: [
          { id: "n1-def-mentalite-1", label: "Activité",
            texte: "Je suis actif défensivement sur toute la durée — je ne subis pas, je provoque" },
          { id: "n1-def-mentalite-2", label: "Agressivité",
            texte: "J'impose une pression physique et mentale à mon adversaire dans le respect du règlement" },
          { id: "n1-def-mentalite-3", label: "Combattivité",
            texte: "J'agis avec la même intensité, que ce soit en début ou en fin de match, en réussite ou en échec. Je ne baisse jamais de régime grâce à mon état d'esprit" }
        ]
      },
      "skills": {
        label: "Skills",
        criteres: [
          { id: "n1-def-skills-1", label: "Orientation des appuis",
            texte: "Mes appuis sont orientés pour réagir dans n'importe quelle direction" },
          { id: "n1-def-skills-2", label: "Déplacements latéraux",
            texte: "Je me déplace latéralement vite et en gardant mon équilibre défensif" },
          { id: "n1-def-skills-3", label: "Distance de combat et positionnement",
            texte: "Je gère ma distance de combat et mon positionnement pour rester efficace dans mon secteur" },
          { id: "n1-def-skills-4", label: "Utilisation des bras",
            texte: "J'utilise mes bras de façon active et intelligente — dissuasion, déviation, interception" }
        ]
      }
    }
  },

  /* ═══════════════════════════════════════════════════════════ N°2 DEF */
  "n2-def": {
    label: "Profil N°2",
    type:  "def",
    axes: {
      "lecture": {
        label: "Lecture",
        criteres: [
          { id: "n2-def-lecture-1", label: "Lecture du rapport de force",
            texte: "Je reconnais si je suis en situation d'avantage ou de désavantage défensif (distance, position, vitesse du PB)" },
          { id: "n2-def-lecture-2", label: "Lecture de l'entraide",
            texte: "Je reconnais quand mon partenaire est débordé et j'adapte mon comportement en conséquence" },
          { id: "n2-def-lecture-3", label: "Lecture du crédit d'action",
            texte: "Je sais repérer l'action du PB — dribble, arrêt du dribble, volonté de passer — pour agir au bon moment" },
          { id: "n2-def-lecture-4", label: "Répartition",
            texte: "Je sais compter et m'adapter au changement de vis-à-vis (sur rentrée, départ d'ailier, 7vs6…)" },
          { id: "n2-def-lecture-5", label: "Lecture d'impair",
            texte: "Je sais lire la course du DC vers le but et sa future réception dans la zone d'impair" },
          { id: "n2-def-lecture-6", label: "Changement de statut (grand espace)",
            texte: "Je réagis immédiatement quand mon équipe récupère la balle — je change de statut sans délai, y compris sur grand espace" },
          { id: "n2-def-lecture-7", label: "Adaptation tactique",
            texte: "Je suis capable d'adapter mes positions, mes articulations et mes choix en fonction des consignes tactiques et des comportements travaillés à l'entraînement, selon le projet défensif collectif" }
        ]
      },
      "action": {
        label: "Action",
        criteres: [
          { id: "n2-def-action-1", label: "Duel défensif",
            texte: "Je suis capable de neutraliser ou d'excentrer mon adversaire direct en restant au contact — je reste entre le but et le PB avec action sur le bras/ballon pour annihiler la sortie de balle" },
          { id: "n2-def-action-2", label: "Dissuasion / Interception / Récupération",
            texte: "Tout en gardant la prise d'info PB-vis-à-vis, j'empêche ou je ralentis par mon positionnement la sortie de balle — j'intercepte ou je provoque une poussette de balle" },
          { id: "n2-def-action-3", label: "Contournement pivot",
            texte: "Je sais contourner efficacement le pivot quand il cherche à prendre une position dans mon couloir" },
          { id: "n2-def-action-4", label: "Impair",
            texte: "J'agis sur le DC sur le temps de passe pour couper ou perturber sa réception dans la zone d'impair" },
          { id: "n2-def-action-5", label: "Entraide",
            texte: "Je suis capable d'aider un partenaire débordé en me déplaçant face à l'attaquant et en cherchant à gober le ballon" },
          { id: "n2-def-action-6", label: "Communication",
            texte: "Je communique avec mes partenaires sur les changements, les dangers, les imprévus" }
        ]
      },
      "mentalite": {
        label: "Mentalité",
        criteres: [
          { id: "n2-def-mentalite-1", label: "Activité",
            texte: "Je suis actif défensivement sur toute la durée — je ne subis pas, je provoque" },
          { id: "n2-def-mentalite-2", label: "Agressivité",
            texte: "J'impose une pression physique et mentale à mon adversaire dans le respect du règlement" },
          { id: "n2-def-mentalite-3", label: "Combattivité",
            texte: "J'agis avec la même intensité, que ce soit en début ou en fin de match, en réussite ou en échec. Je ne baisse jamais de régime grâce à mon état d'esprit" }
        ]
      },
      "skills": {
        label: "Skills",
        criteres: [
          { id: "n2-def-skills-1", label: "Orientation des appuis",
            texte: "Mes appuis sont orientés pour réagir dans n'importe quelle direction" },
          { id: "n2-def-skills-2", label: "Déplacements latéraux",
            texte: "Je me déplace latéralement vite et en gardant mon équilibre défensif" },
          { id: "n2-def-skills-3", label: "Distance de combat et positionnement",
            texte: "Je gère ma distance de combat et mon positionnement pour rester efficace dans mon secteur" },
          { id: "n2-def-skills-4", label: "Utilisation des bras",
            texte: "J'utilise mes bras de façon active et intelligente — dissuasion, déviation, interception" },
          { id: "n2-def-skills-5", label: "Excentrer / Orienter",
            texte: "Je sais orienter le PB dans la direction souhaitée par le projet défensif collectif" },
          { id: "n2-def-skills-6", label: "Contrer",
            texte: "Je suis capable de contrer efficacement au bon moment" }
        ]
      }
    }
  },

  /* ═══════════════════════════════════════════════════════════ N°3 DEF */
  "n3-def": {
    label: "Profil N°3",
    type:  "def",
    axes: {
      "lecture": {
        label: "Lecture",
        criteres: [
          { id: "n3-def-lecture-1", label: "Lecture du rapport de force",
            texte: "Je reconnais si je suis en situation d'avantage ou de désavantage défensif (distance, position, vitesse du PB)" },
          { id: "n3-def-lecture-2", label: "Lecture de l'entraide",
            texte: "Je reconnais quand mon partenaire est débordé et j'adapte mon comportement en conséquence" },
          { id: "n3-def-lecture-3", label: "Lecture du crédit d'action",
            texte: "Je sais repérer l'action du PB — dribble, arrêt du dribble, volonté de passer — pour agir au bon moment" },
          { id: "n3-def-lecture-4", label: "Répartition",
            texte: "Je sais compter et m'adapter au changement de vis-à-vis (rentrée d'ailier, croisé, 7vs6…)" },
          { id: "n3-def-lecture-5", label: "Lecture du pivot adverse",
            texte: "Je suis capable de lire en permanence la position et les intentions du pivot adverse dans mon secteur" },
          { id: "n3-def-lecture-6", label: "Changement de statut",
            texte: "Je réagis immédiatement quand mon équipe récupère la balle — je change de statut sans délai" },
          { id: "n3-def-lecture-7", label: "Adaptation tactique",
            texte: "Je suis capable d'adapter mes positions, mes articulations et mes choix en fonction des consignes tactiques et des comportements travaillés à l'entraînement, selon le projet défensif collectif" }
        ]
      },
      "action": {
        label: "Action",
        criteres: [
          { id: "n3-def-action-1", label: "Duel défensif",
            texte: "Je suis capable de neutraliser ou d'excentrer mon adversaire direct en restant au contact — je reste entre le but et le PB avec action sur le bras/ballon" },
          { id: "n3-def-action-2", label: "Contournement pivot",
            texte: "Je sais contourner efficacement le pivot quand il cherche à prendre une position dans mon couloir" },
          { id: "n3-def-action-3", label: "Entraide",
            texte: "Je suis capable d'aider un partenaire débordé en me déplaçant face à l'attaquant et en cherchant à gober le ballon" },
          { id: "n3-def-action-4", label: "Communication",
            texte: "Je structure la défense par ma voix — j'annonce les changements, les dangers, les croisés" }
        ]
      },
      "mentalite": {
        label: "Mentalité",
        criteres: [
          { id: "n3-def-mentalite-1", label: "Activité",
            texte: "Je suis actif défensivement sur toute la durée — je ne subis pas, je provoque" },
          { id: "n3-def-mentalite-2", label: "Agressivité",
            texte: "J'impose une pression physique et mentale à mon adversaire dans le respect du règlement" },
          { id: "n3-def-mentalite-3", label: "Combattivité",
            texte: "J'agis avec la même intensité, que ce soit en début ou en fin de match, en réussite ou en échec. Je ne baisse jamais de régime grâce à mon état d'esprit" }
        ]
      },
      "skills": {
        label: "Skills",
        criteres: [
          { id: "n3-def-skills-1", label: "Orientation des appuis",
            texte: "Mes appuis sont orientés pour réagir dans n'importe quelle direction" },
          { id: "n3-def-skills-2", label: "Déplacements latéraux",
            texte: "Je me déplace latéralement vite et en gardant mon équilibre défensif" },
          { id: "n3-def-skills-3", label: "Distance de combat et positionnement",
            texte: "Je gère ma distance de combat et mon positionnement pour rester efficace dans mon secteur" },
          { id: "n3-def-skills-4", label: "Utilisation des bras",
            texte: "J'utilise mes bras de façon active et intelligente — dissuasion, déviation, interception" },
          { id: "n3-def-skills-5", label: "Excentrer / Orienter",
            texte: "Je sais orienter le PB dans la direction souhaitée par le projet défensif collectif" },
          { id: "n3-def-skills-6", label: "Contrer",
            texte: "Je suis capable de contrer efficacement au bon moment" }
        ]
      }
    }
  },

  /* ═══════════════════════════════════════════════════════════ GARDIEN */
  "gb": {
    label: "Profil GB",
    type:  "gb",
    axes: {
      "lecture": {
        label: "Lecture",
        criteres: [
          { id: "gb-lecture-1", label: "Lecture du tireur",
            texte: "Je reconnais le profil du tireur — main forte, tirs préférentiels, habitudes — et je réfléchis à anticiper ses choix" },
          { id: "gb-lecture-2", label: "Lecture de la trajectoire",
            texte: "Je lis la position du bras, l'épaule et les appuis du tireur pour anticiper la trajectoire du tir" },
          { id: "gb-lecture-3", label: "Lecture de la situation de jeu",
            texte: "Je lis le contexte — supériorité, contre-attaque, situation de décalage, tir de loin, au travers… — pour adapter ma posture. Je ne suis pas en retard ou en réaction constamment" },
          { id: "gb-lecture-4", label: "Coopération avec le défenseur",
            texte: "Je sais lire l'action de mon défenseur (contre, toucher) et adapte mon placement en conséquence" }
        ]
      },
      "parade": {
        label: "Pré-Parade / Parade",
        criteres: [
          { id: "gb-parade-1", label: "Placement",
            texte: "Je suis bien placé avant le tir — pieds, mains, regard — pour être en capacité de réagir dans toutes les directions (placement Joueur-GB-Milieu du but)" },
          { id: "gb-parade-2", label: "Pré-parade",
            texte: "Je suis capable de marquer un temps d'arrêt pour avoir les appuis prêts à réagir et mon corps en équilibre avant chaque tir" },
          { id: "gb-parade-3", label: "Parade tirs lointains (9m)",
            texte: "Je suis efficace sur les tirs à distance — je couvre l'angle sans anticiper trop tôt" },
          { id: "gb-parade-4", label: "Parade tirs près (6m / rentrée pivot)",
            texte: "Je suis efficace sur les tirs proches — explosivité, occupation de l'espace, bras actifs" },
          { id: "gb-parade-5", label: "Parade jet de 7m",
            texte: "Je suis efficace sur les jets de 7m — placement, rituel, gestion de la pression" },
          { id: "gb-parade-6", label: "Parade en contre-attaque",
            texte: "Je suis efficace en situation de jeu rapide — 1vs1, sortie, face à face" },
          { id: "gb-parade-7", label: "Variété des parades",
            texte: "Je maîtrise plusieurs formes de parade (active, passive, au sol) selon la situation" }
        ]
      },
      "relance": {
        label: "Relance",
        criteres: [
          { id: "gb-relance-1", label: "Vitesse de changement de statut",
            texte: "Je passe immédiatement et rapidement de gardien à relanceur après un arrêt ou une sortie de balle" },
          { id: "gb-relance-2", label: "Qualité de passe courte",
            texte: "Ma passe courte est précise et exploitable — je ne mets pas mes coéquipiers en difficulté" },
          { id: "gb-relance-3", label: "Qualité de passe longue",
            texte: "Ma passe longue est précise — hauteur de poitrine, devant le coéquipier, exploitable en course" },
          { id: "gb-relance-4", label: "Lecture pour la relance",
            texte: "Je lis vite la situation après l'arrêt pour choisir le bon partenaire et le bon timing de relance" }
        ]
      },
      "skills": {
        label: "Skills",
        criteres: [
          { id: "gb-skills-1", label: "Déplacements latéraux",
            texte: "Je me déplace latéralement de façon explosive et équilibrée pour couvrir mon but" },
          { id: "gb-skills-2", label: "Déplacements en profondeur",
            texte: "Je gère mes déplacements avant-arrière pour adapter mon angle de parade" },
          { id: "gb-skills-3", label: "Utilisation du corps",
            texte: "J'utilise l'ensemble de mon corps — bras, jambes, tronc — pour maximiser la surface de parade" },
          { id: "gb-skills-4", label: "Dissociation segmentaire",
            texte: "Je suis capable de dissocier les actions de mes membres pour adapter ma parade à la trajectoire" }
        ]
      },
      "mental": {
        label: "Mental GB",
        criteres: [
          { id: "gb-mental-1", label: "Gestion de l'échec immédiat",
            texte: "Après un but encaissé, je retrouve ma concentration rapidement — je ne reste pas sur le but précédent" },
          { id: "gb-mental-2", label: "Présence et communication",
            texte: "Je suis vocalement et gestuellement présent — je guide ma défense, j'annonce les dangers" },
          { id: "gb-mental-3", label: "Gestion de la pression",
            texte: "Je reste performant dans les moments clés — fin de match, jet de 7m décisif, situation critique" },
          { id: "gb-mental-4", label: "Combattivité",
            texte: "J'agis avec la même intensité, que ce soit en début ou en fin de match, en réussite ou en échec. Je ne baisse jamais de régime grâce à mon état d'esprit" }
        ]
      }
    }
  },

  /* ═══════════════════════════════════════════════════ DIMENSION MENTALE */
  /* Optionnelle par session (sessions.inclut_mental). Ids d'axes SANS tiret. */
  "mental": {
    label: "Dimension mentale",
    type:  "mental",
    axes: {
      "competition": {
        label: "Compétition",
        criteres: [
          { id: "mental-competition-1", label: "Gestion du stress et de la pression en match",
            texte: "Le contexte du match n'affecte pas mes performances. Je me sens meilleur quand il y a de l'enjeu." },
          { id: "mental-competition-2", label: "Confiance en soi / prise de responsabilité dans les moments clés",
            texte: "Je sais que je vais réussir quand ça devient important." },
          { id: "mental-competition-3", label: "Capacité à rebondir après une erreur ou une défaite",
            texte: "Je suis capable de me projeter très vite vers les prochaines échéances sans douter après mon dernier échec." },
          { id: "mental-competition-4", label: "Combativité et engagement sur des matchs à enjeu",
            texte: "Je suis capable de me transcender et de dépasser mes limites." }
        ]
      },
      "travail": {
        label: "Travail",
        criteres: [
          { id: "mental-travail-1", label: "Assiduité et ponctualité",
            texte: "Je suis toujours en avance quand je le peux." },
          { id: "mental-travail-2", label: "Capacité à travailler de façon acharnée et rigoureuse",
            texte: "Je suis capable d'absorber une charge de travail intensive avec rigueur, constance et détermination, même face à la fatigue et à la difficulté." },
          { id: "mental-travail-3", label: "Réceptivité aux consignes et capacité à se corriger",
            texte: "Je suis toujours capable d'activer un état de vigilance maximum pour comprendre et faire." },
          { id: "mental-travail-4", label: "Autonomie dans le travail individuel (physique, vidéo, récupération)",
            texte: "Je sais ce dont j'ai besoin et je le mets en œuvre seul." }
        ]
      },
      "groupe": {
        label: "Groupe",
        criteres: [
          { id: "mental-groupe-1", label: "Communication avec les coéquipiers",
            texte: "J'ai de la complicité avec tous mes coéquipiers." },
          { id: "mental-groupe-2", label: "Respect des règles de vie collective du centre",
            texte: "Je fais toujours attention à rester dans le cadre que le groupe a fixé." },
          { id: "mental-groupe-3", label: "Leadership / entraide envers les jeunes joueurs",
            texte: "Je me sens légitime à donner mon avis et je me sens écouté quand c'est le cas." },
          { id: "mental-groupe-4", label: "Intégration et comportement en dehors du terrain",
            texte: "Je partage des moments de convivialité avec mes coéquipiers en dehors du terrain." }
        ]
      },
      "projet": {
        label: "Projet de vie",
        criteres: [
          { id: "mental-projet-1", label: "Clarté et maturité du double projet (scolaire/pro + handball)",
            texte: "J'ai des objectifs SMART : Spécifiques, Mesurables, Atteignables, Réalistes et Temporels." },
          { id: "mental-projet-2", label: "Investissement scolaire ou professionnel",
            texte: "Je fais tous les efforts pour réussir mes projets." },
          { id: "mental-projet-3", label: "Capacité de projection à moyen terme (N+1, N+2)",
            texte: "Je sais comment atteindre mes objectifs." },
          { id: "mental-projet-4", label: "Maturité générale et prise de recul sur son parcours",
            texte: "Je suis capable d'analyser avec discernement ma trajectoire de vie actuelle et passée." }
        ]
      }
    }
  }

};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

/** Retourne tous les criteres d'un profil (tableau plat) */
function getAllCriteres(profilId) {
  var profil = CRITERIA[profilId];
  if (!profil) return [];
  var list = [];
  Object.values(profil.axes).forEach(function(axe) {
    axe.criteres.forEach(function(c) { list.push(c); });
  });
  return list;
}

/** Retourne un critère par son id */
function getCritereById(critereId) {
  var parts = critereId.split('-');
  // profilId = tout sauf les 2 dernières parties (axeId + num)
  // ex: "ailier-att-lecture-1" → profil="ailier-att", axe="lecture", num="1"
  // ex: "pvt-att-gainbloc-2"   → profil="pvt-att",   axe="gainbloc", num="2"
  for (var pId in CRITERIA) {
    var profil = CRITERIA[pId];
    for (var aId in profil.axes) {
      var axe = profil.axes[aId];
      for (var i = 0; i < axe.criteres.length; i++) {
        if (axe.criteres[i].id === critereId) return axe.criteres[i];
      }
    }
  }
  return null;
}

/** Retourne les profils disponibles pour un joueur (att + def, ou gb seul) */
function getProfilsForPlayer(playerProfile) {
  if (playerProfile.profil_gb) return [playerProfile.profil_gb];
  var list = [];
  if (playerProfile.profil_att) list.push(playerProfile.profil_att);
  if (playerProfile.profil_def) list.push(playerProfile.profil_def);
  return list;
}

/** Profils à évaluer pour (joueur × session) : technique du joueur + 'mental' si la session l'inclut.
 *  Source unique des totaux — ne jamais recalculer ça ailleurs. */
function sessionProfilIds(playerProfile, session) {
  var ids = [];
  if (playerProfile) {
    if (playerProfile.profil_gb) ids.push(playerProfile.profil_gb);
    else {
      if (playerProfile.profil_att) ids.push(playerProfile.profil_att);
      if (playerProfile.profil_def) ids.push(playerProfile.profil_def);
    }
  }
  if (session && session.inclut_mental === true) ids.push('mental');
  return ids;
}

/** Nombre total de critères attendus pour (joueur × session) */
function sessionTotalCriteres(playerProfile, session) {
  return sessionProfilIds(playerProfile, session)
    .reduce(function(sum, id) { return sum + getAllCriteres(id).length; }, 0);
}

/** Onglets de l'écran de notation (joueur et coach) pour (joueur × session).
 *  Champ : ATT + DEF ; gardien : Gardien ; + Mental si la session l'inclut.
 *  Champs : key (id DOM), profilId, label, cls (classe CSS), short/fem/to (messages de transition). */
function evalTabsFor(playerProfile, session) {
  var tabs = [];
  var p = playerProfile || {};
  if (p.profil_gb) {
    tabs.push({ key: 'gb',  profilId: p.profil_gb,  label: '🧤 Gardien', cls: 'gb',  short: 'Gardien', fem: false, to: 'le Gardien' });
  } else {
    tabs.push({ key: 'att', profilId: p.profil_att, label: '⚡ Attaque', cls: 'att', short: 'Attaque', fem: true,  to: "l'Attaque" });
    tabs.push({ key: 'def', profilId: p.profil_def, label: '🛡 Défense', cls: 'def', short: 'Défense', fem: true,  to: 'la Défense' });
  }
  if (session && session.inclut_mental === true) {
    tabs.push({ key: 'mental', profilId: 'mental', label: '🧠 Mental', cls: 'mental', short: 'Mental', fem: false, to: 'le Mental' });
  }
  return tabs;
}
