# Monster Catcher

A tiny Game Boy-style monster-catching game built with plain HTML, CSS, and
JavaScript. No build tools, no dependencies, no image files — every sprite
and tile is drawn on a `<canvas>` at runtime using a 4-shade Game Boy-style
palette.

This is an **original** game (original monsters, world, and names) built in
the *visual style* of an original Game Boy game — 160x144 resolution,
4-shade palette, 16x16 tile grid — not a copy of any existing game's
characters or assets.

## Play it locally

You don't need Node, Python, or any installs. Just open `index.html`
directly in a browser, or serve it locally:

```bash
# from the project folder
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Controls

- Arrow keys / WASD — move
- Z or Enter — confirm / select
- X or Escape — cancel / back

## How to put this on GitHub

```bash
git init
git add .
git commit -m "Initial commit: monster catcher prototype"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Free hosting with GitHub Pages

This repo includes `.github/workflows/deploy.yml`, a GitHub Actions
workflow that automatically deploys the site to GitHub Pages every time
you push to `main`. To turn it on (one-time setup):

1. Push this repo to GitHub (steps above).
2. Go to your repo's **Settings > Pages**.
3. Under "Build and deployment", set Source to **GitHub Actions**
   (not "Deploy from a branch").
4. Push any commit to `main` (or go to the **Actions** tab and run the
   "Deploy to GitHub Pages" workflow manually).
5. Your game will be live at
   `https://<your-username>.github.io/<your-repo>/` within a minute or two.

No build step actually runs — the workflow just uploads the plain HTML/CSS/JS
files as-is and publishes them. You don't need Node, npm, or anything
installed for this to work.

## Project structure

```
monster-game/
├── .github/
│   └── workflows/
│       └── deploy.yml   # auto-deploys to GitHub Pages on push to main
├── assets/
│   └── sprites/
│       └── README.md    # how to drop in real pixel art PNGs later
├── index.html          # entry point, loads canvas + scripts
├── style.css            # page shell styling around the canvas
├── js/
│   ├── constants.js      # palette, tile size, game states
│   ├── monsters.js        # species, moves, types, XP/leveling, evolution
│   ├── sprites.js          # procedural monster shapes + real-PNG loader
│   ├── story.js             # world/NPC/trainer data and dialogue text
│   ├── world.js               # map data + tile/NPC rendering
│   ├── player.js                # movement, collision, interact, dialogue box
│   ├── battle.js                  # wild + trainer battle state machine
│   └── main.js                      # game loop, input handling, wiring
└── README.md
```

## What's implemented

- Tile-based overworld movement with collision (trees/water block you)
- Tall grass encounter zones with a random encounter rate
- Turn-based battles: Fight / Catch / Run menu
- 7 types with a full effectiveness chart (fire/water/grass/electric/ground/flying/poison + normal)
- Classic-style catch chance formula based on remaining HP
- 13 original species across 5 evolution lines, plus 3 single-stage species
- XP, leveling, and automatic evolution at set levels
- NPCs you can talk to (walk up, face them, press Z)
- Trainer battles with fixed teams, multi-monster fights, and no catching
- A tiny intro story (professor greeting) and a rival battle
- A sprite system that draws distinct procedural shapes per species now,
  and automatically switches to a real PNG if you drop one in
  `assets/sprites/` later — see `assets/sprites/README.md`

## Ideas for extending it

- Add more maps and a way to walk between them (screen transitions)
- Add a party/menu screen to switch which monster fights
- Add trainer battles (NPCs with their own teams)
- Add leveling/XP after winning battles
- Add save/load using `localStorage`
- Replace the procedural blob sprites with real hand-drawn pixel art
  (try [Aseprite](https://www.aseprite.org/) or
  [Piskel](https://www.piskelapp.com/), both great for GB-style pixel art)

## A note on originality

Nintendo/Game Freak actively enforce their IP around Pokémon (character
designs, creature designs, names, region names, etc. — see the ongoing
Palworld lawsuit for how seriously this is taken). This project deliberately
uses **original monster designs, names, and world**, built only in the
*constraint style* of an original Game Boy game (resolution, palette, tile
grid). Keep it that way if you plan to share or publish what you build from
this.
