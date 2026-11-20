# Chaud Devant ! 🍅🧅🍔

Jeu de cuisine coopératif **en ligne pour deux joueurs**, chacun sur son ordinateur, dans **une seule cuisine partagée**, en 3D, dans l'esprit d'Overcooked.

- Couper les ingrédients, remplir la marmite (3 tomates ou 3 oignons), saisir les steaks à la poêle, la surveiller : ce qu'on oublie brûle et **prend feu**, et le feu **gagne les postes voisins** toutes les 7 secondes (extincteur près du mur).
- Recettes : soupe de tomate, soupe à l'oignon, salade, burger, burger garni (pain, steak, laitue, tomate). On peut prendre le pain directement dans la caisse avec une assiette.
- **Commandes VIP** (ticket doré à couronne) : moins de temps, pièces doublées.
- Dresser, servir à la passe, puis **laver les assiettes sales** qui reviennent.
- Commandes avec chrono, pourboires selon la rapidité, **séries** qui multiplient les pourboires, 3 minutes par niveau.
- **1 à 4 étoiles** selon le nombre de plats servis. Une jauge en bas de l'écran montre les paliers pendant la partie, et il faut au moins 1 étoile pour débloquer le niveau suivant.

## Niveaux

| Monde | Niveau | Particularité |
|---|---|---|
| 1 · Le Bistrot | 1-1 Soupe de tomate | prise en main |
| | 1-2 Salade et soupe | deux recettes |
| | 1-3 Coup de feu | nouvel ingrédient : l'oignon, 3 feux |
| 2 · Terrains piégés | 2-1 Le passe-plat | un comptoir coupe la cuisine en deux : il faut se passer les ingrédients |
| | 2-2 La patinoire | sol gelé : les chefs glissent |
| | 2-3 Le pont-levis | une rivière et deux ponts qui montent et descendent en alternance ; tomber à l'eau fait perdre ce qu'on porte et 3 secondes |
| | 2-4 L'usine | tapis roulants au sol qui emportent les chefs, convoyeur à objets au centre |
| 3 · Les Folies | 3-1 Le grill | la poêle et les burgers, le feu qui se propage |
| | 3-2 Les portails | deux cuisines séparées, reliées par deux paires de portails |
| | 3-3 La panne | coupures de courant périodiques : seuls les chefs et les feux éclairent |
| | 3-4 Les souris | des souris sortent des trous et volent les ingrédients ; les toucher les fait fuir et rend l'ingrédient |
| | 3-5 Le grand banquet | portails, souris et coupures à la fois, 5 commandes en même temps |

Pour tester tous les niveaux sans les débloquer : ajouter `?tout` à l'adresse (par exemple `https://…onrender.com/?tout`).

## Commandes (identiques pour les deux joueurs)

| Touche | Action |
|---|---|
| Flèches (ou Z Q S D) | se déplacer |
| Espace (ou Entrée) | prendre / poser / servir ; **rester appuyé** pour couper, laver, utiliser l'extincteur |
| Maj | sprint |
| Échap | pause |

## Technique

- Rendu 3D maison en **WebGL2**, sans aucune bibliothèque : ombres portées, éclairage façon dessin animé (ombres teintées, reflets nets, liseré de lumière), contours sombres autour des personnages et des aliments.
- Modèles sculptés par code dans `src/models.js` (surfaces de révolution, surfaces paramétriques, couleurs et brillance par sommet) : tomate côtelée, laitue en feuilles, oignon strié, pain au sésame, steak marbré ou grillé, bols de soupe, burgers montés, et cinq chefs animaux (ours, chat, lapin, grenouille, panda) aux couleurs de chaque joueur.
- Les icônes des tickets, des bulles et les portraits sont des rendus des modèles 3D.
- Le code source est dans `src/` ; `python build.py` reconstruit `index.html`.
- Les niveaux sont des plans en texte dans `src/game.js` (la légende des symboles est en tête du fichier) : ajouter un niveau revient à dessiner un nouveau plan.
- `server.js` (Node, sans dépendance) sert le jeu et relie les deux joueurs d'une salle (code de 4 lettres).
- L'ordinateur de l'hôte fait tourner la partie et envoie l'état 20 fois par seconde ; l'invité déplace son chef localement, sans latence.
- L'ancienne version, **Cuisine Miroir**, reste jouable à l'adresse `/miroir`.

## Mettre en ligne sur Render

Le fichier `render.yaml` (Blueprint) décrit, dans le projet **Cooking**, un **Web Service Node gratuit** nommé `cuisine-miroir-en-ligne`. Chaque push sur `main` redéploie le jeu. Le nom du service est conservé pour garder la même adresse ; il peut être renommé dans le tableau de bord Render sans changer l'adresse.

Sur l'offre gratuite, le serveur s'endort après une période sans visite : la première connexion peut prendre environ une minute.

Lancer en local : `node server.js`, puis ouvrir `http://localhost:3000` dans deux navigateurs.

## Tests

`tests/play.py` lance le serveur et fait jouer deux joueurs automatiques **uniquement au clavier**, chacun dans son navigateur :

```
pip install playwright && playwright install chromium
python tests/play.py <niveau 0 à 6> <secondes> [port]
```

Les tests de l'ancienne version sont dans `tests/miroir/`.
