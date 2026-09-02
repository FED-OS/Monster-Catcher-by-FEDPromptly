# Monster Catcher — Verdale Region: GBA Edition (Nintendo-Level Graphics Upgrade)

A polished Game Boy Advance-style monster catching RPG, upgraded with rich layered
pixel-art graphics and packaged as a desktop application via Electron.

## What's Inside

This is a complete monster-catcher RPG (Pokémon-style) rendered at native GBA
resolution (240×160) and upscaled with crisp pixel-art scaling. Every visual is
drawn procedurally on an HTML5 Canvas — no external sprite PNGs required.

### Graphics Upgrades (matching the reference GBA screenshots)

**Overworld:**
- Rich multi-shade textured grass with deterministic blade clumps
- Large rounded canopy trees with 5 shade rings, side bumps, shaded trunks
- Animated water with layered shimmer and foam highlights
- Textured sandy paths with pebbles/grit
- Detailed multi-tile buildings: houses (red/blue/green roofs, shingles, chimneys,
  lit windows, doors), Pokémon Center (with red emblem), Mart, Gym, Lab
- Flower patches (red/yellow/pink with centers + stems)
- Wooden fences with rails and pointed posts
- Crop fields (tilled soil furrows with green stalks + grain heads)
- Pond/lake with earth borders
- Upgraded player & NPC overworld sprites

**Battle:**
- Layered outdoor battle scene: sky gradient, drifting pixel clouds, snow-capped
  distant mountains, lake band with shimmer, forest tree-line, grassy foreground
  with texture, foreground rocks, bushes, flowers
- Textured circular arena pads (concentric rings, speckle texture, highlight crescent)
- Drop shadows beneath monsters + subtle idle bob animation
- Polished GBA-style HP info boxes: beveled panels, compact type badges
  (colored pills: FIRE/WATER/GRASS/etc.), HP bars with color tiers, status icons
- Bottom command/text window with GBA styling
- Cave and snow battle variants supported

**Monster Sprites:**
- 32×32 procedural pixel-art per species with custom designs for all starter lines
  (Emberit→Infernyx→Pyrothorn, Aquip→Tidalon→Leviathorn, Leafon→Florahn→Thornheart)
  and common encounters (Rattick, etc.)
- Multi-tone shading, outlines, eyes with shine, type-themed accents

## How to Run

### Option 1: Desktop App (Electron) — recommended

```bash
cd monstercatcher
npm install
npm start
```

This opens the game in a native desktop window (820×620) styled like a GBA
handheld, with the purple console frame and CRT scanline overlay.

> **Note for Linux/headless environments:** add `--no-sandbox` (already included
> in the `start` script). For virtual displays / CI, use
> `npm run start:headless` (adds `--disable-gpu --software-rendering`).

### Option 2: Web browser (quick test)

```bash
cd monstercatcher
python3 -m http.server 9090
# then open http://localhost:9090/index.html
```

## Controls

- **Move:** Arrow keys / WASD
- **Confirm:** Z or Enter
- **Cancel:** X

## Project Structure

```
monstercatcher/
├── index.html          # Game shell, loads all JS modules
├── style.css           # GBA handheld frame + CRT styling
├── package.json        # Electron app config
├── electron/
│   └── main.js         # Electron main process (window setup)
└── js/
    ├── constants.js    # Color palettes, terrain/building colors
    ├── world.js        # Maps, tile rendering, building overlay system
    ├── battle.js       # Battle scene, platforms, HP boxes, backgrounds
    ├── sprites.js      # Procedural monster sprites + type badges
    ├── monsters.js     # Species definitions, stats, moves
    ├── elements.js     # Elemental types & colors
    ├── main.js         # Game loop & input
    └── ... (19 modules total)
```

## Tech Notes

- The game runs at native 240×160 GBA resolution and is upscaled via CSS
  `image-rendering: pixelated` for crisp pixel scaling.
- All art is procedural (Canvas 2D `fillRect` calls) — no image assets needed.
- Maps are 10×9 tile grids (16px tiles); buildings render as multi-tile overlays.
- Tile codes: 0=grass, 1=tall grass, 2=tree, 3=water, 4=sand, 8=ledge, 9=door,
  10=sign, 11=heal mat, 12=shop mat, 13=gym mat, 14=deep water,
  15=flowers, 16=fence, 17=crops, 30-41=biome tiles.

---

Enjoy your journey through the Verdale Region!
