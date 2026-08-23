# Sprites folder

Drop a PNG in here named exactly after a species key from `js/monsters.js`
(e.g. `emberit.png`, `infernyx.png`, `aquip.png`) and the game will
automatically use it instead of the built-in procedural shape — no code
changes needed. `js/sprites.js` tries to load a file for every species on
startup and silently falls back to the procedural drawing if none exists.

## Current species keys (file names to use)

emberit, infernyx, aquip, tidalon, leafon, florahn, rattick, rattigor,
sparkit, voltagon, digmole, breezel, toxipod

## Recommended format

- Square canvas, transparent background (PNG with alpha)
- 64x64 px works well for battle sprites at the size they're drawn on screen
- Flat colors + hard pixel edges (no anti-aliasing) to match the Game Boy look
- Keep the same "camera angle" across all species (3/4 front-on is classic)

## Tools

- [Aseprite](https://www.aseprite.org/) (paid, ~$20) — industry-standard
  pixel art tool, has a built-in indexed/limited-palette mode
- [Piskel](https://www.piskelapp.com/) (free, browser-based) — good enough
  for this, exports PNG directly

## Overworld / player sprite

The player and NPCs currently draw as simple procedural figures in
`js/player.js` and `js/world.js`. If you want a real overworld sprite sheet
(walk-cycle frames per direction) later, that's a bigger change — ask for
it and it can be wired in the same "PNG if present, else procedural"
pattern as the monster sprites.
