# Monster Catcher — GBA Graphics Upgrade to "Nintendo Level"

## Goal
Upgrade the existing Monster Catcher game's graphics to match the polished GBA/Pokémon-style aesthetic shown in the two reference screenshots (gba-overworld-preview.png and gba-battle-preview.png), and package it as a desktop app.

## Analysis Complete
- Current game: ~12,800 lines, 19 JS modules, 240×160 GBA canvas, procedural pixel art
- Target: Rich layered battle backgrounds (mountains/forest/lake), detailed shaded buildings, lush tilesets, polished monster sprites, authentic GBA UI

## Tasks

### Phase 1: Copy game to working directory & set up project
- [x] Extract and understand existing game
- [x] Copy game files to /workspace/monstercatcher/ working dir
- [x] Set up Electron desktop app wrapper structure

### Phase 2: Upgrade overworld graphics (match gba-overworld-preview.png)
- [x] Upgrade grass tiles (richer texture, multiple shades, scattered detail)
- [x] Upgrade tree tiles (larger rounded foliage, shading, dithering)
- [x] Upgrade path/dirt tiles (textured crossroads)
- [x] Upgrade water tiles (animated, shoreline edges, pond bordering)
- [x] Add building rendering (detailed houses with roofs, doors, windows, Pokémon Center with emblem, Mart, Gym, Lab)
- [x] Upgrade flowers, fences, signs, ledges detail
- [x] Upgrade player & NPC overworld sprites (more detail, shading)

### Phase 3: Upgrade battle graphics (match gba-battle-preview.png)
- [x] Rich layered battle background (sky, clouds, distant mountains, forest, lake, foreground rocks)
- [x] Detailed battle platforms (textured circular arena pads)
- [x] Polish HP info boxes (GBA-style bordered panels, type badges)
- [x] Upgrade monster battle sprites (drop shadows, idle bob animation, type badges)

### Phase 4: Upgrade monster sprites (detailed pixel art)
- [x] Enhance procedural sprite designs for key species (starter lines + common encounters)
- [x] Improve sprite shading/outlines for GBA-quality look

### Phase 5: Package as desktop app (Electron)
- [x] Create Electron main process + package.json
- [x] Test the app launches
- [x] Build/verify the desktop app

### Phase 6: Verify & deliver
- [x] Screenshot the upgraded game (overworld + battle) and compare to targets
- [x] Final verification and packaging
