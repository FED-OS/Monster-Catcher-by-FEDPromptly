<img width="1324" height="720" alt="Screenshot 2026-07-30 144746" src="https://github.com/user-attachments/assets/fbaa1c2f-936c-487c-988a-e9ced1d9eb34" />
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

1. Push this repo to GitHub (steps above).
2. Go to your repo's **Settings > Pages**.
3. Under "Build and deployment", set Source to **Deploy from a branch**,
   branch `main`, folder `/ (root)`.
4. Save. Your game will be live at
   `https://<your-username>.github.io/<your-repo>/` within a minute or two.

## Project structure

```
monster-game/
├── index.html          # entry point, loads canvas + scripts
├── style.css            # page shell styling around the canvas
├── js/
│   ├── constants.js      # palette, tile size, game states
│   ├── monsters.js        # species data, moves, damage/catch formulas
│   ├── world.js            # map data + tile rendering
│   ├── player.js            # player movement, procedural sprite
│   ├── battle.js              # battle state machine + battle rendering
│   └── main.js                  # game loop, input handling, wiring
└── README.md
```

## What's implemented

- Tile-based overworld movement with collision (trees/water block you)
- Tall grass encounter zones with a random encounter rate
- Turn-based battles: Fight / Catch / Run menu
- Type effectiveness (fire/water/grass triangle + normal)
- Classic-style catch chance formula based on remaining HP
- 4 original species to encounter and catch

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
