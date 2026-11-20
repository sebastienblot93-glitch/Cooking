# Cuisine en Duo 🍅🍲

Jeu de cuisine coopératif **en ligne pour deux joueurs**, chacun sur son ordinateur, dans **une seule cuisine partagée**, en 3D, dans l'esprit d'Overcooked.

- Couper les ingrédients, remplir la marmite (3 tomates), la surveiller : une soupe oubliée brûle et **prend feu** (extincteur près du mur).
- Dresser, servir à la passe, puis **laver les assiettes sales** qui reviennent.
- Commandes avec chrono, pourboires selon la rapidité, **séries** qui multiplient les pourboires, 3 minutes par niveau.
- Deux niveaux pour l'instant : **1-1 Soupe de tomate** et **1-2 Salade et soupe**.

## Commandes (identiques pour les deux joueurs)

| Touche | Action |
|---|---|
| Flèches (ou Z Q S D) | se déplacer |
| Espace (ou Entrée) | prendre / poser / servir ; **rester appuyé** pour couper, laver, utiliser l'extincteur |
| Maj | sprint |
| Échap | pause |

## Technique

- Rendu 3D maison en **WebGL2**, sans aucune bibliothèque : ombres portées, lumière douce, objets modélisés à partir de formes simples.
- Le code source est dans `src/` ; `python build.py` reconstruit `index.html`.
- `server.js` (Node, sans dépendance) sert le jeu et relie les deux joueurs d'une salle (code de 4 lettres).
- L'ordinateur de l'hôte fait tourner la partie ; l'invité déplace son chef localement, sans latence.
- L'ancienne version, **Cuisine Miroir**, reste jouable à l'adresse `/miroir`.

## Mettre en ligne sur Render

Le fichier `render.yaml` (Blueprint) crée dans le projet **Cooking** un **Web Service Node gratuit** nommé `cuisine-miroir-en-ligne` :

1. Sur Render, ouvrir le Blueprint du dépôt et lancer **Manual Sync** (ou **New → Blueprint** sur ce dépôt), puis **Apply**.
2. Le jeu est accessible à l'adresse du service (`https://cuisine-miroir-en-ligne.onrender.com` ou proche).

Sur l'offre gratuite, le serveur s'endort après une période sans visite : la première connexion peut prendre environ une minute.

## Fonctionnement réseau

- `server.js` (Node, aucune dépendance) sert `index.html` et ouvre un WebSocket sur `/ws`.
- Une salle = un code de 4 lettres, un hôte (Soleil) et un invité (Lune). Le serveur relaie seulement les messages entre eux.
- L'ordinateur de l'hôte fait tourner la partie et envoie l'état du jeu 20 fois par seconde. L'invité déplace son commis localement (sans latence) et envoie ses déplacements et ses actions.
- Si l'invité se déconnecte, il peut revenir avec le même code. Si l'hôte part, la salle est fermée.

Lancer en local : `node server.js`, puis ouvrir `http://localhost:3000` dans deux navigateurs.

## Structure

- `index.html` : le jeu (HTML, CSS et JavaScript dans un seul fichier, dessin sur canvas, sons générés par le navigateur).
- `server.js` : le serveur de salles.
- `render.yaml` : la configuration Render.

## Tests

`tests/play.py` lance le serveur et fait jouer deux joueurs automatiques **uniquement au clavier**, chacun dans son navigateur :

```
pip install playwright && playwright install chromium
python tests/play.py 0 200   # niveau 1-1
python tests/play.py 1 200   # niveau 1-2
```

Les tests de l'ancienne version sont dans `tests/miroir/`.
