# Monster Catcher — Verdale Region: GBA Edition v4.0 MEGA

A full-featured monster-catching RPG built with plain HTML, CSS, and
JavaScript. No build tools, no dependencies, no image files — every sprite,
tile, and effect is drawn on a `<canvas>` at runtime.

This is an **original** game (original monsters, world, and names) built in
the *visual style* of a **Game Boy Advance** game — **240×160 resolution,
15-bit color (32,768 colors), detailed per-species pixel-art sprites,
textured tilemaps, day/night lighting, weather effects**, and now a massive
**v4.0 MEGA expansion** adding dynamic world creatures, cinematic
evolutions, power-up tools, branching comedy dialogue, elemental
metamorphosis, biome exploration, a multi-phase boss battle, and more.

---

## What's new in v4.0 MEGA — The Mega Expansion

The v4.0 MEGA update is a top-to-bottom overhaul that adds entire new game
systems on top of the solid v3.0 GBA engine. Here's everything that's new:

### Dynamic World Map Mechanics
- **Autonomous AI creatures roam every map** — wild monsters wander, sleep,
  stalk, and flee in real time, each with their own behavioral state machine
  (WANDER, SLEEP, ALERT, FLEE, STALK)
- **Sleeping creatures** display animated Zzz particles and won't notice you
  unless you step right onto them
- **Stealth creatures** have a detection radius — sneak up carefully or
  they'll spot you and trigger an encounter
- **Screen-shake alerts** — when a creature spots you, the screen rumbles
  and an exclamation alert appears above the creature
- **Stalking creatures** actively path toward the player when in range,
  creating tense cat-and-mouse encounters
- **Environment particles** — each biome spawns its own ambient particle
  effects (embers, snowflakes, data sparks, pollen, etc.)

### Cinematic Level Evolutions (3-Stage Metamorphosis)
- **Elemental metamorphosis system** — 6 elemental evolution paths:
  **Pyro** (fire), **Cyber** (electric), **Magic** (fairy), **Junk**
  (steel/poison), **Frost** (ice), and **Shadow** (ghost/dark)
- Each element grants a unique **ultimate move** with a cooldown system —
  these are powerful signature attacks that can turn the tide of battle
- **Flash-bang evolution sequences** — when a monster evolves, a dramatic
  visual flash, screen shake, and ascending sparkle effect plays
- Evolution readiness is tracked per-monster based on level, friendship,
  and element affinity

### Power-Up Tools & Equipment System
- **35 power-up tools** with comedy quirks, each occupying one of six
  equipment slots: Back, Eyes, Head, Hands, Belt, or Accessory
- Each monster can equip up to **3 tools simultaneously**, with slot-conflict
  checking (you can't wear two hats)
- Tools provide stat boosts, battle effects, and comedic side effects —
  from the **Rubber Chicken of Destiny** (randomly confuses enemies with
  its absurd honking) to the **Lava Boots** (walk on hot terrain, but your
  feet smell terrible, lowering friendship)
- **Tool shop** — browse and purchase tools with your hard-earned coins
- **Random tool drops** — defeated wild creatures sometimes leave behind
  a tool
- Equip and unequip tools from the party menu with a full slot-management
  interface

### Extended Branching Dialogue & Comedic Banter
- **Branching dialogue scenes** — key story moments present the player
  with multiple choices that lead to different outcomes and reactions
- **Party banter** — your companion creature and hero comment on the
  environment, each other, and the absurdity of the situations with
  fourth-wall-breaking humor
- **Contextual dialogue** — NPCs and biomes trigger situation-specific
  conversations that reference the player's progress, party composition,
  and recent events
- **Stealth minigame** — a timing-based slider minigame where you press Z
  when the marker is in the green zone to successfully sneak past
  dangerous creatures

### Custom Characters & Companions
- **4 playable heroes** to choose from at the start of the game:
  **Kael** (the determined), **Lyra** (the curious), **Mort** (the gloomy),
  and **Zara** (the chaotic) — each with a unique personality, backstory,
  and dialogue style
- **Companion creatures** — befriend special creatures that travel with
  you and participate in banter
- **Hero selection screen** — a dedicated character-select interface with
  personality previews before you commit

### 8 Biome System
- **8 distinct biomes**, each with unique terrain tiles, color palettes,
  weather effects, encounter tables, biome-specific creatures, and tools:
  1. **Scorching Volcano Zone** — lava flows, eruptions, and ash storms
  2. **Neon-Cyber City** — data rain, power surges, and holographic
     creatures
  3. **Enchanted Crystal Forest** — crystal rain, magic blooms, and
     glowing sprites
  4. **Forgotten Junk Wasteland** — trash tornadoes, acid rain, and
     scrap creatures
  5. **Glacial Peak Mountains** — blizzards, aurora boosts, and ice
     predators
  6. **Abyssal Trench** — current surges, bioluminescence, and deep-sea
     leviathans
  7. **Stormy Savanna** — lightning strikes, wind gusts, and thunder
     beasts
  8. **Moonlight Marsh** — fog banks, lunar glow, and ghostly haunts
- **23 new biome-specific creatures** with unique stats, sprites, and
  Pokédex entries
- **Fast travel system** — once you've visited a biome, you can fast
  travel back to it from the menu
- **Biome entry dialogue** — each biome greets you with hero and companion
  banter specific to that environment

### Rival: Krax the Grabber
- **Krax the Grabber** — a thieving rival who ambushes you randomly in the
  overworld, attempting to steal your tools
- Krax has a **stealing mechanic** — if he catches you, he swipes a random
  tool from your bag, and you'll have to win it back or buy a replacement
- Krax appears in **stages** — each encounter escalates, with multiple
  defeat flags tracking your rivalry progression
- A cooldown system prevents Krax from appearing too frequently, keeping
  the ambushes surprising but fair

### 10 Creature Personality Quirks
- Every creature can have one of **10 personality quirks** that affect
  battle behavior and trigger special effects:
  - **Brave** — bonus attack but takes more damage
  - **Timid** — higher evasion but may flinch
  - **Clumsy** — occasional self-damage fumbles (zoink!)
  - **Greedy** — bonus item drops after battle
  - **Lazy** — may skip turns but recovers HP when resting
  - **Dramatic** — critical hits trigger extra fanfare and screen effects
  - **Hungry** — drains HP from enemies on contact
  - **Showoff** — bonus stats when HP is full, panics when low
  - **Nervous** — speed fluctuates randomly each turn
  - **Lucky** — small chance to dodge any attack completely
- Quirks trigger with **comedy SFX** and contextual battle messages

### Multi-Stage Boss Battle: Giga-Thok
- **Giga-Thok** — a massive junk-golem boss with **4 phases**, each
  triggered by HP thresholds (75%, 40%, 10%)
- Each phase changes the boss's dialogue, stats, and available moves,
  with **phase-transition stingers** (ominous music, screen shake, flash)
- The boss has unique custom moves: **Giga Stomp**, **Quake Slam**,
  **Shadow Void**, and **Blinding Shout**
- **3 possible endings** based on your final choice:
  - **Spare** — Giga-Thok gives you treasure as thanks (peaceful ending)
  - **Defeat** — more money but the boss is gone for good (victory ending)
  - **Hug** — Giga-Thok becomes your companion (best ending, warm and fuzzy)
- The final choice is presented as a **branching dialogue scene** with
  unique music for each outcome

### High-Fidelity Visual Effects
- **Impact frames** — critical hits and powerful moves trigger monochrome
  inverted flash effects (the screen briefly flashes to black-and-white)
- **Comic status expressions** — status conditions display with comedic
  visual cues (confusion = spinning stars, sleep = Zzz bubbles, poison =
  green bubbles, burn = flickering orange)
- **Ultimate move flash** — elemental ultimates trigger a dramatic
  full-screen flash and screen shake on impact
- **Elemental auras** — creatures with an element display a subtle colored
  aura around their sprite in battle
- **Footprint trails** — world creatures leave brief trail particles as
  they move
- **Screen shake system** — a reusable screen-shake effect for impacts,
  alerts, boss phase transitions, and celebrations

### Procedural Music Engine
- **Biome-specific music** — a lightweight procedural chiptune music loop
  engine generates unique melodic patterns for each biome, the town, the
  title screen, regular battles, and the boss battle
- Each track has a melody and bass line that loop seamlessly at biome-
  specific tempos and wave types (square, sawtooth, sine, triangle)
- Music automatically transitions based on game state (title → town →
  biome → battle → boss)
- **40+ sound effects** including all original SFX plus new comedy sounds:
  - **Zoink** — cartoony spring/boing (quirky tool effects, fumbles)
  - **Womp womp** — sad trombone (failures, quirk backfires)
  - **Ding** — bright notification chime (item found, tool ready)
  - **Bonk** — hollow hit (comic impacts)
  - **Pow** — explosive impact (critical hits, boss slams)
  - **Zap** — electric crackle (spark, glitch effects)
  - **Sizzle, Splash, Crunch** — environmental and attack textures
  - **Sneak, Alert, Snore** — world creature behavior sounds
  - **Ultimate charge/release** — dramatic ultimate move fanfare
  - **Boss roar, boss phase** — ominous boss stingers
  - **Krax ambush, steal** — thief encounter sounds
  - **Evolution flash, rumble, warp** — system event sounds
  - **Starter, hero select** — character selection fanfares
  - **Tool equip/unequip** — mechanical click-clack
  - **Quirk** — quirky little flourish for quirk activations
  - **Spare, hug, victory, defeat** — ending-specific stingers

---

## What was in v3.0 (GBA Edition) — Still Here

The entire v3.0 GBA rendering engine is fully intact and enhanced:

- **240×160 resolution** (GBA native), displayed at 3× scale (720×480)
  with crisp `image-rendering: pixelated` upscaling
- **Full 15-bit color system** with a comprehensive named color palette
- **Detailed per-species pixel-art sprites** — all 42 species have unique
  hand-pixeled 32×32 designs with outlines, shading, eyes, and features
- **Textured GBA-style tilemaps** with multi-shade pixel-art textures
- **Animated environment** — water shimmer, tree sway, grass rustle, snow
  sparkle
- **Directional animated player & NPC sprites** with 4-direction facing
  and 2-frame walk animation
- **GBA-style battle scenes** with themed backgrounds, platforms, HP boxes,
  type badges, and command windows
- **Polished menus & windows** with bordered panels, cursor arrows, and
  highlights
- **Day/night cycle** with time-of-day tinting
- **Weather system** with animated particle overlays
- **CRT/scanline overlay** for authentic retro feel
- **Palette theme switching** — 6 color themes in Settings

---

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
- Z or Enter — confirm / select / talk / interact
- X or Escape — cancel / back / open start menu

## What's implemented (full feature list)

### World & Exploration
- 10+ interconnected maps with screen-transition warps including the
  starting town, Professor's Lab, routes, biomes, and the boss arena
- 8 explorable biomes with unique terrain, weather, and creatures
- Varied terrain: paths, tall grass, trees, water, sand, cave walls, rock
  walls, snow, ledges, doors, signs, heal mats, shop mats, gym leader
  tiles, plus new biome tiles (lava, neon floor, crystal, scrap, deep ice,
  deep water, storm grass, marsh water, volcano rock, cyber walls)
- Per-map and per-biome wild encounter tables with varied encounter rates
- Signs you can read by pressing Z while facing them
- NPCs scattered across every map with unique colored sprites
- Day/night lighting and per-map weather with animated particle effects
- **Fast travel** to any previously visited biome

### Monsters (42 species + 23 biome creatures = 65 total)
- 42 original base species spanning all 18 types
- 23 additional biome-specific creatures with unique stats and sprites
- Evolution lines with level-based, item-based, and elemental metamorphosis
- Dual-typed monsters
- Full 18-type effectiveness chart with dual-type defender resolution
- Each species has a unique detailed pixel-art sprite
- **10 personality quirks** with battle effects and comedy

### Moves (101+ moves)
- Physical, special, and status move categories
- Status moves: stat buffs/debuffs, recovery, protection, field effects
- Secondary effects: burn, poison, paralysis, sleep, freeze, confusion,
  flinch, toxic, stat-stage changes
- Moves with drain, recoil, priority, charge turns, multi-hit, fixed-damage
- **6 elemental ultimate moves** with cooldown systems
- **5 boss-specific custom moves**
- PP (power points) per move, tracked and restored on healing

### Battle System
- Full turn-based battle state machine with speed-based turn ordering
- STAB, critical hits, accuracy/evasion checks, stat stages (-6 to +6)
- Status effects: burn, poison, toxic, paralysis, sleep, freeze, confusion
- **Quirk effect hooks** — personality quirks trigger during battle
- **Ultimate moves** — elemental signature attacks with priority and
  cooldowns, listed in the fight menu when ready
- Party switching mid-battle
- Item use in battle: potions, super potions, revives, status-cure items
- Three ball types with catch bonuses: Basic Ball, Great Ball, Ultra Ball
- Multi-roll catch chance formula
- Battle animations: screen shake, flash, ball-throw arc, impact frames,
  ultimate flash, comic status expressions
- XP share across the party, level-up with move learning and evolution
- **4-phase boss battle** with HP-based transitions and 3 endings
- GBA-style battle scene with themed backgrounds and polished UI

### Player Systems
- Full start menu: Party, Bag, Monstrodex, Badges, Save, Settings, Exit
- **Hero selection screen** — choose from 4 heroes at game start
- **Tool equipment system** — equip up to 3 tools per monster across 6 slots
- **Tool shop** — browse and purchase 35+ power-up tools
- Party menu: view stats, HP, type, moves, ability, equipped tools, quirk
- Bag / inventory with 19+ item types
- Monstrodex: tracks all species with seen/caught counts
- Badge case with badge icons
- Save / Load via localStorage
- Settings: toggle sound/music, cycle color palette theme
- Money system

### Audio
- **Procedural music engine** — biome-specific chiptune tracks for all
  8 biomes, town, title, battle, and boss, with melody and bass lines
- 40+ WebAudio chiptune sound effects including comedy SFX (zoink, womp
  womp, ding, bonk, pow, zap) and system SFX (ultimate charge/release,
  boss roar/phase, Krax ambush/steal, evolution flash, warp, spare/hug/
  victory/defeat endings)
- Mute toggle in settings and on the title screen

### Progression & Story
- GBA-style title screen with New Game / Continue / Mute options
- Hero selection with 4 playable characters
- Intro story with Professor Alder Thorne
- Starter selection: Emberit (fire), Aquip (water), or Leafon (grass)
- Rival battles at multiple story points
- **Krax the Grabber** — thieving rival with random ambushes and tool
  stealing
- Team Dusk antagonist encounter
- Gym with trainers and Gym Leader Frostine (ice-type specialist)
- **Branching dialogue scenes** at key story moments
- **Giga-Thok boss battle** — 4 phases, 3 endings (spare/defeat/hug)
- Story flags system tracking progression
- Biome exploration and fast travel

## Project structure

```
monster-game/
├── index.html                  # entry point, loads canvas + all scripts (v4.0 MEGA)
├── style.css                   # GBA console frame, CRT overlay, canvas styling
├── js/
│   ├── constants.js            # GBA 240x160 res, COLOR system, game states,
│   │                          #   element/biome/tool IDs, flags, tile codes
│   ├── palettes.js             # 6 color themes, day/night, weather tints
│   ├── monsters.js             # 42 species, 23 biome creatures fallback, 101+
│   │                          #   moves, 18-type chart, damage, catch, XP, evolution
│   ├── sprites.js              # detailed per-species pixel art (round/quad/spiky/
│   │                          #   finned/winged shapes), player/NPC sprites, badges
│   ├── story.js                # NPCs, trainers, dialogue, badges, starters
│   ├── world.js                # 10+ maps, textured tile rendering, animation,
│   │                          #   warps, signs, encounter tables, biome tiles
│   ├── audio.js                # WebAudio SFX engine + procedural music loop engine
│   │                          #   (biome music, comedy SFX, 40+ sounds)
│   ├── elements.js             # 6 elemental evolution types, ultimate moves,
│   │                          #   applyElement, checkEvolutionReady, resolveUltimate
│   ├── powerups.js             # 35 power-up tools, shop tools, equip mechanics,
│   │                          #   random drops, comedy quirks
│   ├── biomes.js               # 8 biomes, 23 biome creatures, weather effects,
│   │                          #   encounter lists, biome entry dialogue
│   ├── characters.js           # 4 heroes, companions, Rival Krax, Boss Giga-Thok
│   ├── quirks.js               # 10 personality quirks with battle effect hooks
│   ├── dialogue.js             # branching scenes, party banter, stealth minigame,
│   │                          #   branch option selection, fourth-wall breaks
│   ├── worldcreatures.js       # autonomous AI creatures (wander/sleep/alert/flee/
│   │                          #   stalk), screen shake, env particles, collision
│   ├── boss.js                 # Giga-Thok 4-phase boss, phase transitions,
│   │                          #   spare/defeat/hug endings, boss UI
│   ├── player.js               # movement, collision, interact, dialogue, save/load,
│   │                          #   party, tools, hero selection, Krax ambush, fast travel
│   ├── battle.js               # full battle state machine, quirks, ultimates, boss
│   │                          #   routing, impact frames, evolution sequences
│   ├── menu.js                 # all menus: start, party, bag, dex, badges, save,
│   │                          #   settings, shop, starter, hero select, tool shop,
│   │                          #   tool equip, fast travel, branching, stealth
│   └── main.js                 # game loop, input, title screen, music updates,
│                               #   world creature/particle/shake ticking, render
└── README.md
```

## How to put this on GitHub

```bash
git init
git add .
git commit -m "Monster Catcher v4.0 MEGA — massive expansion"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## A note on originality

Nintendo/Game Freak actively enforce their IP around Pokémon (character
designs, creature designs, names, region names, etc.). This project
deliberately uses **original monster designs, names, and world**, built
only in the *constraint style* of a Game Boy Advance game (resolution,
color depth, tile grid, visual conventions). Keep it that way if you plan
to share or publish what you build from this.
