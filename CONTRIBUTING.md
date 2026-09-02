# Contributing to Monster Catcher — Verdale Region

First off — **thank you** for being interested in contributing! This is a passion project built to show that complete, polished games can be made with pure web technologies. Whether you're fixing a bug, adding a creature, improving the art, or just tightening up the docs, every contribution matters.

---

## 🎯 Ways to Contribute

### 🐛 Bug Reports
Found a bug? Open an issue with:
1. A clear title describing the problem
2. Steps to reproduce (be specific — which map, which monster, which action)
3. Expected behavior vs. actual behavior
4. Your browser/OS and whether you're playing in-browser or via Electron
5. Screenshots if applicable

### ✨ Feature Requests
Have an idea for a new feature? Open an issue with the `enhancement` label and describe:
- What the feature does
- Why it would improve the game
- Any ideas on how it could be implemented

### 🎨 Content Contributions
The game is always hungry for more content:
- **New creatures** — add a species entry to `js/monsters.js` and a procedural sprite design to `js/sprites.js`
- **New moves** — add entries to the `MOVES` object in `js/monsters.js`
- **New maps** — add a map definition to `js/world.js` and connect it via warps
- **New dialogue** — add branching scenes to `js/dialogue.js`
- **New quirks** — add personality quirks to `js/quirks.js`

### 💻 Code Contributions
- Performance optimizations
- UI/UX improvements
- New particle effects or screen effects
- Accessibility improvements
- Cross-browser compatibility fixes

---

## 🛠️ Development Setup

```bash
# Clone the repo
git clone <your-fork-url>
cd monstercatcher

# Run in browser (no build step needed)
python3 -m http.server 9090
# Open http://localhost:9090/

# Or run as desktop app
npm install
npm start
```

### Syntax Checking

Before submitting, verify your changes don't break any modules:

```bash
for f in js/*.js; do node --check "$f" && echo "OK: $f" || echo "FAIL: $f"; done
```

All 22 modules must pass with zero errors.

---

## 📋 Coding Standards

### JavaScript Style
- **Vanilla JS only** — no frameworks, no bundlers, no transpilers. The game loads modules via `<script>` tags in `index.html`.
- **No ES modules** — use plain `function` declarations and global variables (the game predates module adoption for maximum compatibility)
- **2-space indentation**
- **Descriptive names** — `spawnParticle`, `drawBattlePlatform`, `firstUsableParty` rather than `sp`, `dbp`, `fup`
- **Comment your code** — header comments at the top of each file explaining its purpose, and inline comments for non-obvious logic

### Adding a New Creature

1. **Define the species** in `js/monsters.js` inside the `SPECIES` object:
```javascript
mycreature: {
  name: "MyCreature",
  type: "pyro",           // or ["pyro", "frost"] for dual-type
  ability: "blaze",
  baseHp: 45, baseAtk: 55, baseDef: 40, baseSpd: 65,
  catchRate: 120,
  xpGroup: "mediumFast",
  moves: ["scratch", "ember"],
  learnset: { 7: "growl", 12: "firefang" },
  evolvesTo: "mycreature2",
  evolveLevel: 16,
  color: "#f87838",
  shape: "quadruped"
}
```

2. **Design the sprite** in `js/sprites.js` — add an entry to `SPECIES_DESIGNS64` using the procedural pixel-art system. The sprite is drawn at 64×64 resolution using `fillRect` calls on a pixel grid.

3. **Add it to encounters** — add the species key to a map's `encounters` array in `js/world.js`.

4. **Test** — run the game, encounter the creature in the wild, battle it, catch it, and verify it appears in the Monstrodex.

### Adding a New Map

1. Define the map in `js/world.js` with a tile grid, encounters, warps, and NPCs
2. Connect it to an existing map via a warp tile
3. Test walking to and from the new map

---

## 🔄 Pull Request Process

1. **Fork** the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/my-awesome-feature
   ```

2. **Make your changes** following the coding standards above

3. **Test thoroughly** — play the game and verify your changes work without breaking existing functionality

4. **Run syntax checks** — all 22 JS modules must pass `node --check`

5. **Commit with a clear message**:
   ```bash
   git commit -m "Add Pyrothorn evolution line with volcanic sprite design"
   ```

6. **Push and open a PR** — describe what you changed and why, and reference any related issues

7. **Be patient and responsive** — we'll review your PR as soon as possible and may suggest changes

---

## 🏗️ Architecture Quick Reference

| Module | Responsibility |
|--------|---------------|
| `constants.js` | Screen dimensions, tile size, color palette, game states |
| `palettes.js` | Theme palettes and color ramps |
| `elements.js` | Elemental type definitions, abilities, ultimates |
| `monsters.js` | Species data, moves, items, stats, evolution |
| `sprites.js` | Procedural sprite rendering engine (64×64) |
| `world.js` | Maps, tile definitions, warp connections |
| `biomes.js` | Special biome zones with weather effects |
| `player.js` | Player state, movement, save/load system |
| `worldcreatures.js` | Overworld NPCs, encounters |
| `battle.js` | Turn-based battle engine |
| `boss.js` | Giga-Thok multi-phase boss battle |
| `menu.js` | In-game menus |
| `dialogue.js` | Branching dialogue system |
| `story.js` | Main story progression |
| `characters.js` | NPC definitions |
| `quirks.js` | Creature personality quirks |
| `powerups.js` | Items and equipment |
| `particles.js` | Particle engine (v5.0) |
| `effects.js` | Screen effects (v5.0) |
| `gamepad.js` | Controller input (v5.0) |
| `audio.js` | Procedural Web Audio sound effects |
| `main.js` | Main game loop, state machine, rendering |

---

## 💬 Questions?

Feel free to open an issue with the `question` label if you need help understanding the codebase or getting set up. We're happy to help!

---

*Happy coding, and thanks for making the Verdale Region even better! 🌿🔥💧*
