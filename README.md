# Cuisine Miroir 🪞🍳

Jeu de cuisine coopératif pour **deux joueurs**, vu de dessus, dans un palace Art déco.
Deux cuisines sont séparées par un miroir magique : ce que l'on fait d'un côté peut se produire de l'autre.
Couper sur sa planche coupe aussi celle du partenaire, un levier allume le feu de l'autre cuisine, la poubelle éteint parfois sa lumière… À vous de découvrir les liens cachés.

## Jouer

Ouvrez `index.html` dans un navigateur récent (Chrome, Firefox, Edge, Safari). Aucune installation nécessaire.

| | Se déplacer | Tout le reste |
|---|---|---|
| **Cuisine Soleil** | Z Q S D (ou W A S D) | Espace |
| **Cuisine Lune** | Flèches | Entrée |

- **Appuyer** : prendre, poser, actionner un levier ou un robinet.
- **Rester appuyé** devant une planche : couper.
- Poser un aliment prêt sur la pile d'assiettes : dresser l'assiette.
- Échap : pause. Deux manettes fonctionnent aussi.

## Progression

| Service | Nouveauté |
|---|---|
| Apéritif I — Le premier reflet | Couper, servir, planche reflet (tutoriel guidé, sans chrono) |
| Apéritif II — Chaud et froid | Leviers qui allument le feu de l'autre cuisine |
| Entrée I — Reflets cachés | Liens invisibles à découvrir, un piège |
| Entrée II — Gestes du quotidien | Chrono, plats à deux ingrédients, liens dans le robinet et la poubelle |
| Entrée III — Coup de feu | Tout à la fois : 8 liens cachés et des leurres |

Bientôt : Plat (liens inversés), Fromage (liens à retardement), Dessert (passe-plat à travers le miroir), Digestif (le miroir se fissure).

## Mettre en ligne sur Render (version actuelle : deux joueurs sur le même écran)

Le dépôt contient un fichier `render.yaml` (Blueprint) :

1. Sur [render.com](https://render.com), **New → Blueprint**, puis choisir ce dépôt et la branche `main`.
2. Render lit `render.yaml` et crée le site statique `cuisine-miroir`. Valider avec **Apply**.
3. Le jeu est accessible à l'adresse fournie par Render (`https://cuisine-miroir.onrender.com` ou proche).

## Feuille de route : jeu à distance

Pour que chaque joueur joue depuis son propre ordinateur, il faudra ajouter un petit serveur Node.js (WebSocket) qui relaie les actions entre les deux navigateurs, déployé sur Render en **Web Service**. Chaque joueur n'utilisera alors que les flèches et une touche d'action.

## Structure

- `index.html` : le jeu complet (HTML, CSS et JavaScript dans un seul fichier, dessin sur canvas, sons générés par le navigateur).
