# Changelog

All notable changes to **Monster Catcher — Verdale Region** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [5.0.0] — HERO Edition — 2024

The biggest update yet. Transforms the game from a solid prototype into a polished, feature-complete, GitHub-ready release.

### Added
- **Particle engine** (`particles.js`) — 10 particle types (sparks, embers, sparkles, hit stars, smoke, dust, splashes, fireflies, leaves, rings) with a pooled system (max 220 particles). Used for battle hit effects, catch success bursts, level-up celebrations, faint smoke, grass step puffs, water splashes, ambient fireflies at night, and falling leaves in forest biomes
- **Screen effects system** (`effects.js`) — full-screen color flashes, GBA-style zebra-stripe battle transition wipes, battle hit flashes, healing sparkle pulses, floating combat text ("CRITICAL!", "SUPER EFFECTIVE!", "LEVEL UP!"), and area name popups that fade in/out when entering new maps
- **Gamepad/controller support** (`gamepad.js`) — full Gamepad API integration with D-pad and analog stick support, 0.35 deadzone calibration, edge detection for button presses, auto-repeat for movement, and a "🎮 Connected" indicator on the title screen
- **Multi-slot save system** — 3 manual save slots plus auto-save, with rich metadata display (party lead, level, badges earned, dex completion, playtime). Auto-saves trigger on map transitions and after battles
- **Save slot selection screen** on the title menu with per-slot metadata cards
- **Area name popups** that display when entering a new map for the first time
- **Healing visual feedback** — green sparkle pulse and screen flash when healing at a Healing Center
- **Animated title screen** with drifting ambient sparkle particles
- **Controller connection indicator** on the title screen
- **Step particle effects** in the overworld — grass dust puffs, water splashes, volcano embers, crystal sparkles based on tile type and biome
- **Type-colored particle bursts** in battle — fire moves produce orange embers, water moves produce blue splashes, grass moves produce green sparkles, etc.
- **Comprehensive README.md** with features list, controls, how-to-run guide, architecture overview, screenshot gallery, and content stats
- **MIT LICENSE** file
- **.gitignore** for Node.js/Electron projects
- **CONTRIBUTING.md** with development setup, coding standards, and contribution guidelines

### Changed
- Title screen version tag updated to "v5.0 HERO"
- Hint text updated to mention D-pad, A-button, B-button, and controller support
- Save menu upgraded with slot selection (3 slots + back option)
- In-game save now writes to selectable slots with metadata
- Battle damage application now triggers type-colored particle bursts on hit
- Enemy faint now triggers smoke + sparkle burst + white screen flash
- Player faint now triggers smoke + sparkle burst + red screen flash
- Level-up now triggers golden burst + "LEVEL UP!" floating text + yellow flash
- Catch success now triggers catch sparkles + golden flash
- Battles auto-save on completion
- Map transitions auto-save and show area popup
- All script tags in `index.html` updated with cache-busting `?v=5` query parameter

### Fixed
- **`tileInFrontOfPlayer` destructuring bug** in `worldcreatures.js` — the function returns `{col, row}` object but code destructured it as an array `[tc, tr]`, causing a crash. Fixed to use `const tile = tileInFrontOfPlayer(); const tc = tile.col, tr = tile.row;`
- **Duplicate `SAVE_KEY` declaration** in `player.js` — after the save system rewrite, a stale `const SAVE_KEY` declaration remained, causing a syntax error. Removed the duplicate.

---

## [4.0.0] — GBA Graphics Upgrade — 2024

Major visual overhaul bringing the game to Game Boy Advance-quality graphics.

### Added
- GBA-native resolution (240×160) with 3× pixel-perfect upscaling
- 15-bit-style color system with named palette inspired by GBA-era pixel art
- Layered battle backgrounds with textured platforms
- HP boxes with type-colored element badges
- Day/night cycle with time-of-day overlay
- Procedural 64×64 sprite system (`SPECIES_DESIGNS64`)
- Biome zones with weather effects (volcano, cyber-city, crystal forest, junk wasteland, glacial peaks, abyssal trench, stormy savanna, moonlight marsh)
- Multi-phase boss battle: Giga-Thok the Treasure Golem with 4 phases and 3 endings
- Branching comedy dialogue system with player choice branches
- 10 creature personality quirks
- 35 items and power-ups
- Electron desktop app packaging

### Changed
- Tile size increased to 16×16 for GBA-standard tiles
- Visible viewport expanded to 15×10 tiles
- All creature sprites redesigned at 64×64 resolution
- Battle system expanded with stat stages, STAB, critical hits, and 7 status effects

---

## [3.0.0] — Content Expansion — 2024

Expanded the game from a tech demo to a playable adventure.

### Added
- 21 interconnected maps spanning towns, routes, caves, and special regions
- 42 monster species across 22 evolution lines
- 102 battle moves with type effectiveness
- 3 gym badges with leader battles
- Monstrodex (Pokédex-style creature tracker)
- In-game bag system with items
- Party management screen
- Procedural Web Audio sound effects (20+ SFX)
- NPC dialogue system
- Story progression system

---

## [2.0.0] — Battle System — 2024

### Added
- Full turn-based battle engine
- Wild encounters and trainer battles
- Catching mechanic with multiple ball types
- XP and leveling system
- Evolution system
- Move learning via level-up learnsets
- Party switching in battle
- In-battle item usage

---

## [1.0.0] — Initial Release — 2024

### Added
- HTML5 Canvas game engine
- Tile-based overworld with player movement
- Basic rendering system
- Title screen
- Core game loop and state machine
- Player character with directional movement
- Simple map system with warps

---

*For detailed code-level changes, see the [git commit history](../../commits/main).*
