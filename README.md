# Cuisine Miroir 🪞🍳

Jeu de cuisine coopératif pour **deux joueurs**, vu de dessus, dans un palace Art déco.
Deux cuisines sont séparées par un miroir magique : ce que l'on fait d'un côté peut se produire de l'autre.
Couper sur sa planche coupe aussi celle du partenaire, un levier allume le feu de l'autre cuisine, la poubelle éteint parfois sa lumière… À vous de découvrir les liens cachés.

## Jouer

Le jeu se joue **uniquement à deux, chacun sur son ordinateur**, dans une salle privée.

1. Le premier joueur ouvre l'adresse du jeu et clique sur **Créer une salle**. Il obtient un code de 4 lettres (et un lien à partager). Il joue la **Cuisine Soleil** et choisit les services.
2. Le second joueur ouvre la même adresse, entre le code et clique sur **Rejoindre**. Il joue la **Cuisine Lune**.
3. Chacun choisit son commis, puis les deux joueurs se déclarent prêts avant chaque service.

Commandes, identiques pour les deux joueurs :

| Se déplacer | Tout le reste |
|---|---|
| Flèches (ou Z Q S D) | Espace ou Entrée |

- **Appuyer** : prendre, poser, actionner un levier ou un robinet.
- **Rester appuyé** devant une planche : couper.
- Poser un aliment prêt sur la pile d'assiettes : dresser l'assiette.
- Échap : pause pour les deux joueurs. Une manette fonctionne aussi.

## Principe

Le miroir entre les deux cuisines est un **passe-plat** : on y pose un aliment, il apparaît de l'autre côté.
Les deux cuisines n'ont pas les mêmes outils (ingrédients et couteau d'un côté, marmite, assiettes et cloche de service de l'autre) et **les commandes sont communes** : aucun plat ne sort sans les deux joueurs.
Chaque ticket montre le chemin du plat en icônes (ingrédient → couteau → marmite…). Enchaîner les plats donne des bonus de série.

## Progression

| Service | Nouveauté |
|---|---|
| Apéritif I — Le passe-plat | Soleil coupe, Lune dresse et sert (tutoriel guidé, sans chrono) |
| Apéritif II — Soupe du jour | Une marmite chez Lune, attention à ne pas laisser brûler |
| Entrée I — Donnant-donnant | Échanges dans les deux sens : Lune a les citrons, Soleil le couteau |
| Entrée II — Chaud et froid | Chaque levier allume la machine de l'autre cuisine |
| Entrée III — Coup de feu | Chrono, leviers cachés, un piège et un cadeau |

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

`tests/suite.py` (Python + Playwright) lance le serveur, ouvre deux navigateurs séparés et fait jouer deux joueurs automatiques **uniquement au clavier** sur tous les services, puis vérifie les cas limites : code inconnu, salle pleine, lien partagé, pause, onglet caché, départ et retour d'un joueur, latence réseau simulée (~100 ms), tailles d'écran et débit.

```
pip install playwright && playwright install chromium
python tests/suite.py          # tout
python tests/suite.py edge     # cas limites seulement
```
