# Pirate Baie

Jeu de plateau contrôlé par une application web

## Règles
### Nombre de joueurs
Actuellement, Pirate Baie peut se jouer à 5 joueurs.

### Mise en place
L'appareil sur lequel est lancé le serveur Node doit être branché à l'Arduino qui contrôle les LEDs. Les droits doivent être accordés pour le port sur lequel il est branché :
```
sudo chmod 777 /dev/ttyUSB0
```

Tous les joueurs doivent se rendre sur `http://{ip_du_serveur_node}:{port_d_écoute}` et renseigner leur nom ou pseudo.

Lorsque tous les joueurs ont rejoint la partie, ils doivent cliquer sur le bouton `Prêt !` affiché à côté de leur nom/pseudo. La partie se lance alors.
Aucun joueur supplémentaire ne pourra rejoindre la partie en cours.

### Début de partie
En début de partie, chaque joueur ne dispose que d'un seul bateau. La marée est haute, et le vent vient du Sud-Est (afin d'être sûr que tout le monde pourra atteindre la pleine mer à la fin du 2e tour). Au deuxième tour, le vent viendra du Sud pour permettre à Cancale de rejoindre la pleine mer.

### Déroulement d'un tour
La mer bouge :
1. Marée haute
2. Marée descendante
3. Marée basse
4. Marée montante

La provenance du vent est choisie alétoirement entre :
* Nord
* Sud
* Nord-Ouest
* Sud-Ouest
* Nord-Est
* Sud-Est

Chaque joueur attribue un **déplacement** et une **action** à chacun de ses bateaux, puis clique sur le bouton `Prêt !`.

### Déplacements
La capacité de déplacement d'un bateau est définie par son attribut `voile`. Ses possibilités de déplacement vont dépendre du vent (sauf pour la **Barque**). Les cases qui vont dans le sens du vent coûtent 1 déplacement. Celles qui se situent à un angle de 60° par rapport au sens du vent vont coûter 2 déplacements. Celles qui se situent à un angle de 120° par rapport au sens du vent vont coûter 3 déplacements. Exemple :
Le **Terre-Neuvier** a 4 de voile. Le vent vient du Sud. Ses possibilités de déplacement sont :
* 4 cases vers le Nord _4 - 1 - 1 - 1 - 1_
* 2 cases vers le Nord, puis une case vers le Nord-Ouest (ou Nord-Est) _4 - 1 - 1 - 2_
* 2 cases vers le Nord-Ouest (ou Nord-Est) _4 - 2 - 2_
* 1 case vers le Sud-Ouest (ou Sud-Est) _4 - 3_

### Actions
Il existe 3 actions possibles :

#### Pêcher
La capacité de transport d'un bateau est défini par sa caractéristique `cale`.
Si la case est vierge (sans piège ni casier), le bateau peut ramasser un trésor, des poissons, des déchêts, un piège, ou rien du tout (_probabilités à définir_).
Si la case est piégée, le bateau déclanche le piège. Il perd alors tout ce qu'il transporte (_ainsi que quelques points de vie ?_), et récupère le piège. Tant que le piège est sur le bateau, il ne pourra rien transporter de plus.
Si un casier a été déposé sur la case (par n'importe quel joueur), le bateau récupère le poisson qui s'est accumulé dedans.

#### Déposer quelque chose
Si la case est vierge, le bateau peut y déposer un piège ou un casier (choix du joueur).
Si le bateau est à son port, ou sur la côte de Chausey, il peut décharger ce qu'il transporte (tout ou partie).

#### Attaquer
Par défaut, un bateau a 1 case de portée, il peut donc attaquer les 6 cases qui l'entourent. La **Goélette** a 2 cases de portée, elle peut donc attaquer les 18 cases les plus proches d'elle.
La puissance d'attaque d'un bateau est définie par son nombre de `canons`. Chaque canon fait 15 points de dégâts. Lorsque les `pv` d'un bateau tombent à zéro, l'attaquant ramasse ce qu'il transportait (dans la limite de sa capacité de transport). S'il transportait un piège, l'attaquant perd alors tout ce qu'il transporte (_ainsi que quelques points de vie ?_). Le bateau coulé commence à être reconstruit à son port.
_Si le bateau est coulé à cause d'un piège, alors tous les trésors sont perdus ?_
