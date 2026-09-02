// ============================================================
//  Monster Catcher — World (multi-map system)
//  Tile legend:
//   0 = path/grass (walkable, no encounter)
//   1 = tall grass (walkable, encounters)
//   2 = tree/wall (blocked)
//   3 = water (blocked unless surfing)
//   4 = sand (walkable, no encounter)
//   5 = cave floor (walkable, encounters)
//   6 = rock wall (blocked)
//   7 = snow (walkable, encounters)
//   8 = ledge-down (walkable only downward; one-way exit south)
//   9 = door/warp tile (walkable, triggers a warp)
//  10 = sign (blocked, interactable)
//  11 = heal-center floor marker
//  12 = shop floor marker
//  13 = gym floor marker
//  14 = deep water (blocked unless surfing; surf encounters here)
// ============================================================

// Each map: id, name, grid, encounter table, encounters rate,
// npcs (local), warps (tile -> destination), signs, ambient palette override.
const MAPS = {
  mossmere: {
    name: "Mossmere Hollow",
    grid: [
      [2,2,2,2,2,2,2,2,2,2],
      [2,0,0,0,1,1,0,0,9,2],
      [2,0,0,1,1,1,1,0,0,2],
      [2,0,1,1,1,1,1,1,0,2],
      [2,0,0,1,1,1,1,0,0,2],
      [2,0,0,0,0,0,0,0,0,2],
      [2,0,1,1,0,1,1,0,0,2],
      [2,0,0,0,0,0,0,0,0,2],
      [2,2,2,2,8,2,2,2,2,2]
    ],
    encounters: ["emberit","aquip","leafon","rattick","rattick","sparkit"],
    rate: 0.14,
    warps: {
      // door at (8,1) -> lab interior
      "8,1": { dest: "lab", col: 4, row: 6 },
      // ledge at (4,8) -> route 1 (south exit)
      "4,8": { dest: "route1", col: 4, row: 0 }
    },
    signs: {
      "1,7": "Mossmere Hollow — A quiet village at the forest's edge."
    },
    buildings: [
      { type: "lab", col: 7, row: 1, w: 3, roof: "red" }
    ]
  },

  lab: {
    name: "Thorne Lab",
    grid: [
      [6,6,6,6,6,6,6,6,6,6],
      [6,0,0,2,0,0,2,0,0,6],
      [6,0,0,2,0,0,2,0,0,6],
      [6,0,0,0,0,0,0,0,0,6],
      [6,0,0,2,0,0,2,0,0,6],
      [6,0,0,0,0,0,0,0,0,6],
      [6,0,0,0,9,0,0,0,0,6],
      [6,0,0,0,0,0,0,0,0,6],
      [6,6,6,6,6,6,6,6,6,6]
    ],
    encounters: [],
    rate: 0,
    warps: {
      "4,6": { dest: "mossmere", col: 8, row: 2 }
    },
    signs: {}
  },

  route1: {
    name: "Route 1",
    grid: [
      [2,2,2,2,8,2,2,2,2,2],
      [2,0,0,0,0,0,0,0,0,2],
      [2,1,1,0,0,1,1,0,0,2],
      [2,1,0,0,0,0,1,1,0,2],
      [2,0,0,0,1,1,0,0,0,2],
      [2,0,1,1,1,0,0,0,0,2],
      [2,0,1,0,0,0,1,1,0,2],
      [2,0,0,0,0,0,0,0,0,2],
      [2,2,2,2,8,2,2,2,2,2]
    ],
    encounters: ["rattick","rattick","breezel","sparkit","leafon"],
    rate: 0.16,
    warps: {
      "4,0": { dest: "mossmere", col: 4, row: 7 },
      "4,8": { dest: "verdantown", col: 4, row: 0 }
    },
    signs: {
      "0,2": "Route 1 — South to Mossmere, North to Verdantown."
    }
  },

  verdantown: {
    name: "Verdantown",
    grid: [
      [2,2,2,2,8,2,2,2,2,2],
      [2,0,0,0,9,0,0,0,9,2],
      [2,0,0,0,0,0,0,0,0,2],
      [2,1,1,0,0,0,1,1,0,2],
      [2,1,0,0,0,0,0,1,0,2],
      [2,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,2],
      [2,2,2,2,8,2,2,2,2,2]
    ],
    encounters: ["rattick","breezel"],
    rate: 0.08,
    warps: {
      "4,0": { dest: "route1", col: 4, row: 7 },
      "4,1": { dest: "center", col: 4, row: 6 },  // heal center door (col 4)
      "8,1": { dest: "shop", col: 4, row: 6 },     // shop door (col 8)
      "4,8": { dest: "route2", col: 4, row: 0 }
    },
    signs: {
      "0,1": "Verdantown — The green crossroads.",
      "3,1": "Verdantown Healing Center",
      "7,1": "Verdantown Mart"
    },
    buildings: [
      { type: "center", col: 3, row: 1, w: 3 },
      { type: "mart", col: 7, row: 1, w: 3 }
    ]
  },

  center: {
    name: "Healing Center",
    grid: [
      [6,6,6,6,6,6,6,6,6,6],
      [6,0,0,0,0,0,0,0,0,6],
      [6,0,0,0,0,0,0,0,0,6],
      [6,0,0,0,11,0,0,0,0,6],
      [6,0,0,0,0,0,0,0,0,6],
      [6,0,0,0,0,0,0,0,0,6],
      [6,0,0,0,9,0,0,0,0,6],
      [6,0,0,0,0,0,0,0,0,6],
      [6,6,6,6,6,6,6,6,6,6]
    ],
    encounters: [],
    rate: 0,
    warps: {
      "4,6": { dest: "verdantown", col: 4, row: 2 }
    },
    signs: {},
    healTile: "4,3"
  },

  shop: {
    name: "Verdantown Mart",
    grid: [
      [6,6,6,6,6,6,6,6,6,6],
      [6,0,0,0,12,0,0,0,0,6],
      [6,0,0,0,0,0,0,0,0,6],
      [6,0,0,0,0,0,0,0,0,6],
      [6,0,0,0,0,0,0,0,0,6],
      [6,0,0,0,0,0,0,0,0,6],
      [6,0,0,0,9,0,0,0,0,6],
      [6,0,0,0,0,0,0,0,0,6],
      [6,6,6,6,6,6,6,6,6,6]
    ],
    encounters: [],
    rate: 0,
    warps: {
      "4,6": { dest: "verdantown", col: 8, row: 2 }
    },
    signs: {},
    shopTile: "4,1"
  },

  route2: {
    name: "Route 2",
    grid: [
      [2,2,2,2,8,2,2,2,2,2],
      [2,1,1,0,0,0,1,1,0,2],
      [2,1,0,0,0,0,0,1,0,2],
      [2,0,0,0,3,3,0,0,0,2],
      [2,0,0,0,3,3,0,0,1,2],
      [2,1,0,0,0,0,0,1,1,2],
      [2,1,1,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,2],
      [2,2,2,2,8,2,2,2,2,2]
    ],
    encounters: ["breezel","sparkit","toxipod","frostip","carpox"],
    rate: 0.18,
    warps: {
      "4,0": { dest: "verdantown", col: 4, row: 7 },
      "4,8": { dest: "frostcave", col: 4, row: 0 }
    },
    signs: {
      "0,1": "Route 2 — Beware the cold winds ahead."
    }
  },

  frostcave: {
    name: "Frostpeak Cave",
    grid: [
      [2,2,2,2,8,2,2,2,2,2],
      [2,7,7,7,7,7,7,7,7,2],
      [2,7,6,6,7,7,6,6,7,2],
      [2,7,7,7,7,7,7,7,7,2],
      [2,7,6,7,7,7,7,6,7,2],
      [2,7,7,7,7,7,7,7,7,2],
      [2,7,7,7,7,7,7,7,7,2],
      [2,7,7,7,7,7,7,7,7,2],
      [2,2,2,2,2,2,2,2,2,2]
    ],
    encounters: ["frostip","frostip","pebblix","wispup","digmole"],
    rate: 0.12,
    warps: {
      "4,0": { dest: "route2", col: 4, row: 7 }
    },
    signs: {
      "0,1": "Frostpeak Cave — Where the ice never melts."
    }
  },

  // Gym town (post-route2, accessed via a warp tile we place in frostcave later)
  gymtown: {
    name: "Icicle City",
    grid: [
      [2,2,2,2,8,2,2,2,2,2],
      [2,0,0,0,9,0,0,0,9,2],
      [2,0,0,0,0,0,0,0,0,2],
      [2,7,7,0,0,0,7,7,0,2],
      [2,7,0,0,13,0,0,7,0,2],
      [2,7,0,0,0,0,0,7,0,2],
      [2,7,7,0,0,0,7,7,0,2],
      [2,0,0,0,0,0,0,0,0,2],
      [2,2,2,2,2,2,2,2,2,2]
    ],
    encounters: [],
    rate: 0,
    warps: {
      "4,0": { dest: "frostcave", col: 4, row: 7 },
      "4,1": { dest: "gym", col: 4, row: 6 },
      "8,1": { dest: "gymcenter", col: 4, row: 6 }
    },
    signs: {
      "3,1": "Icicle City Gym — Leader: Frostine",
      "7,1": "Icicle City Healing Center"
    },
    buildings: [
      { type: "gym", col: 3, row: 1, w: 3 },
      { type: "center", col: 7, row: 1, w: 3 }
    ]
  },

  gym: {
    name: "Icicle Gym",
    grid: [
      [6,6,6,6,6,6,6,6,6,6],
      [6,7,7,7,7,7,7,7,7,6],
      [6,7,0,0,0,0,0,0,7,6],
      [6,7,0,13,0,0,13,0,7,6],
      [6,7,0,0,0,0,0,0,7,6],
      [6,7,0,0,0,0,0,0,7,6],
      [6,7,7,7,9,7,7,7,7,6],
      [6,7,7,7,7,7,7,7,7,6],
      [6,6,6,6,6,6,6,6,6,6]
    ],
    encounters: [],
    rate: 0,
    warps: {
      "4,6": { dest: "gymtown", col: 4, row: 2 }
    },
    signs: {},
    gymLeaderTile: "3,3"
  },

  gymcenter: {
    name: "Icicle Healing Center",
    grid: [
      [6,6,6,6,6,6,6,6,6,6],
      [6,0,0,0,0,0,0,0,0,6],
      [6,0,0,0,11,0,0,0,0,6],
      [6,0,0,0,0,0,0,0,0,6],
      [6,0,0,0,0,0,0,0,0,6],
      [6,0,0,0,0,0,0,0,0,6],
      [6,0,0,0,9,0,0,0,0,6],
      [6,0,0,0,0,0,0,0,0,6],
      [6,6,6,6,6,6,6,6,6,6]
    ],
    encounters: [],
    rate: 0,
    warps: {
      "4,6": { dest: "gymtown", col: 8, row: 2 }
    },
    signs: {},
    healTile: "4,2"
  },

  // ============================================================
  //  MEGA EXPANSION — 8 Biome Maps
  // ============================================================

  volcano: {
    name: "Scorching Volcano",
    biome: "volcano",
    grid: [
      [40,40,40,40,40,40,40,40,40,40],
      [40,30,30,30,30,30,30,30,9,40],
      [40,30,30,30,30,30,30,30,30,40],
      [40,30,30,30,30,30,30,30,30,40],
      [40,30,30,30,30,30,30,30,30,40],
      [40,30,30,30,30,30,30,30,30,40],
      [40,30,30,30,30,30,30,30,30,40],
      [40,30,30,30,30,30,30,30,30,40],
      [40,40,40,40,40,40,40,40,40,40]
    ],
    encounters: ["magmaSlug","obsidianHawk","emberit"],
    rate: 0.16,
    warps: { "8,1": { dest: "verdantown", col: 1, row: 1 } },
    signs: { "1,7": "Scorching Volcano — The forge of the world. Tread carefully." }
  },

  cybercity: {
    name: "Neon-Cyber City",
    biome: "cybercity",
    grid: [
      [41,41,41,41,41,41,41,41,41,41],
      [41,31,31,31,31,31,31,31,9,41],
      [41,31,31,31,31,31,31,31,31,41],
      [41,31,31,31,31,31,31,31,31,41],
      [41,31,31,31,31,31,31,31,31,41],
      [41,31,31,31,31,31,31,31,31,41],
      [41,31,31,31,31,31,31,31,31,41],
      [41,31,31,31,31,31,31,31,31,41],
      [41,41,41,41,41,41,41,41,41,41]
    ],
    encounters: ["cyberPigeon","glitchHound","holographicMimic","sparkit"],
    rate: 0.14,
    warps: { "8,1": { dest: "verdantown", col: 2, row: 1 } },
    signs: { "1,7": "Neon-Cyber City — Where data flows and glitch-creatures roam." }
  },

  crystalforest: {
    name: "Enchanted Crystal Forest",
    biome: "crystalforest",
    grid: [
      [2,2,2,2,2,2,2,2,2,2],
      [2,32,32,32,32,32,32,32,9,2],
      [2,32,38,32,32,32,32,38,32,2],
      [2,32,32,32,32,32,32,32,32,2],
      [2,32,32,32,32,32,32,32,32,2],
      [2,32,38,32,32,32,32,32,38,2],
      [2,32,32,32,32,32,32,32,32,2],
      [2,32,32,32,32,32,32,32,32,2],
      [2,2,2,2,2,2,2,2,2,2]
    ],
    encounters: ["crystalDeer","glowingSprite","mossyGiant","leafon"],
    rate: 0.13,
    warps: { "8,1": { dest: "verdantown", col: 3, row: 1 } },
    signs: { "1,7": "Enchanted Crystal Forest — Ancient, magical, alive." }
  },

  junkwaste: {
    name: "Forgotten Junk Wasteland",
    biome: "junkwaste",
    grid: [
      [33,33,33,33,33,33,33,33,33,33],
      [33,33,33,33,33,33,33,33,9,33],
      [33,33,33,33,33,33,33,33,33,33],
      [33,33,33,33,33,33,33,33,33,33],
      [33,33,33,33,33,33,33,33,33,33],
      [33,33,33,33,33,33,33,33,33,33],
      [33,33,33,33,33,33,33,33,33,33],
      [33,33,33,33,33,33,33,33,33,33],
      [33,33,33,33,33,33,33,33,33,33]
    ],
    encounters: ["scrapRat","metalWorm","junkGolem","rattick"],
    rate: 0.15,
    warps: {
      "8,1": { dest: "verdantown", col: 4, row: 1 },
      "4,8": { dest: "bossroom", col: 4, row: 0 }
    },
    signs: { "1,7": "Forgotten Junk Wasteland — Where broken things are reborn. Something stirs below..." }
  },

  bossroom: {
    name: "Giga-Thok's Hoard",
    biome: "junkwaste",
    grid: [
      [33,33,33,33,33,33,33,33,33,33],
      [33,33,33,33,33,33,33,33,33,33],
      [33,33,33,33,33,33,33,33,33,33],
      [33,33,33,33,33,33,33,33,33,33],
      [33,33,33,33,33,33,33,33,33,33],
      [33,33,33,33,33,33,33,33,33,33],
      [33,33,33,33,33,33,33,33,33,33],
      [33,33,33,33,33,33,33,33,33,33],
      [33,33,33,33,9,33,33,33,33,33]
    ],
    encounters: [],
    rate: 0,
    warps: { "4,8": { dest: "junkwaste", col: 4, row: 7 } },
    signs: {},
    isBossRoom: true
  },

  glacialpeaks: {
    name: "Glacial Peak Mountains",
    biome: "glacialpeaks",
    grid: [
      [40,40,40,40,40,40,40,40,40,40],
      [40,34,34,34,34,34,34,34,9,40],
      [40,34,34,34,34,34,34,34,34,40],
      [40,34,34,34,34,34,34,34,34,40],
      [40,34,34,34,34,34,34,34,34,40],
      [40,34,34,34,34,34,34,34,34,40],
      [40,34,34,34,34,34,34,34,34,40],
      [40,34,34,34,34,34,34,34,34,40],
      [40,40,40,40,40,40,40,40,40,40]
    ],
    encounters: ["iceWolf","snowYeti","glacierMoth","frostip"],
    rate: 0.15,
    warps: { "8,1": { dest: "verdantown", col: 5, row: 1 } },
    signs: { "1,7": "Glacial Peak Mountains — Beautiful. Deadly. Frozen." }
  },

  abyssal: {
    name: "Abyssal Trench",
    biome: "abyssal",
    grid: [
      [6,6,6,6,6,6,6,6,6,6],
      [6,35,35,35,35,35,35,35,9,6],
      [6,35,35,35,35,35,35,35,35,6],
      [6,35,35,35,35,35,35,35,35,6],
      [6,35,35,35,35,35,35,35,35,6],
      [6,35,35,35,35,35,35,35,35,6],
      [6,35,35,35,35,35,35,35,35,6],
      [6,35,35,35,35,35,35,35,35,6],
      [6,6,6,6,6,6,6,6,6,6]
    ],
    encounters: ["glowingJellyfish","anglerMimic","seaSerpent","aquip"],
    rate: 0.13,
    warps: { "8,1": { dest: "verdantown", col: 6, row: 1 } },
    signs: { "1,7": "Abyssal Trench — Into the deep dark. Light your own way." }
  },

  stormsavanna: {
    name: "Stormy Savanna",
    biome: "stormsavanna",
    grid: [
      [2,2,2,2,2,2,2,2,2,2],
      [2,36,36,36,36,36,36,36,9,2],
      [2,36,36,36,36,36,36,36,36,2],
      [2,36,36,36,36,36,36,36,36,2],
      [2,36,36,36,36,36,36,36,36,2],
      [2,36,36,36,36,36,36,36,36,2],
      [2,36,36,36,36,36,36,36,36,2],
      [2,36,36,36,36,36,36,36,36,2],
      [2,2,2,2,2,2,2,2,2,2]
    ],
    encounters: ["thunderRhino","lightningBird","stormSpirit","sparkit"],
    rate: 0.16,
    warps: { "8,1": { dest: "verdantown", col: 7, row: 1 } },
    signs: { "1,7": "Stormy Savanna — Where lightning walks the earth." }
  },

  moonmarsh: {
    name: "Moonlight Marsh",
    biome: "moonmarsh",
    grid: [
      [2,2,2,2,2,2,2,2,2,2],
      [2,37,37,37,37,37,37,37,9,2],
      [2,37,38,37,37,37,37,38,37,2],
      [2,37,37,37,37,37,37,37,37,2],
      [2,37,37,37,37,37,37,37,37,2],
      [2,37,38,37,37,37,37,37,38,2],
      [2,37,37,37,37,37,37,37,37,2],
      [2,37,37,37,37,37,37,37,37,2],
      [2,2,2,2,2,2,2,2,2,2]
    ],
    encounters: ["willOWisp","swampToad","ghostMoth","shadepup"],
    rate: 0.14,
    warps: { "8,1": { dest: "verdantown", col: 8, row: 1 } },
    signs: { "1,7": "Moonlight Marsh — Silver mist, ghostly light, old secrets." }
  },

  // Verdantown hub expansion — add biome warp doors
  verdantown: {
    name: "Verdantown",
    grid: [
      [2,2,2,2,2,2,2,2,2,2],
      [2,9,9,9,9,9,9,9,9,2],
      [2,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,0,0,0,0,0,2],
      [2,0,0,0,9,0,0,0,0,2],
      [2,2,2,2,8,2,2,2,2,2]
    ],
    encounters: [],
    rate: 0,
    warps: {
      "1,1": { dest: "volcano", col: 8, row: 1 },
      "2,1": { dest: "cybercity", col: 8, row: 1 },
      "3,1": { dest: "crystalforest", col: 8, row: 1 },
      "4,1": { dest: "junkwaste", col: 8, row: 1 },
      "5,1": { dest: "glacialpeaks", col: 8, row: 1 },
      "6,1": { dest: "abyssal", col: 8, row: 1 },
      "7,1": { dest: "stormsavanna", col: 8, row: 1 },
      "8,1": { dest: "moonmarsh", col: 8, row: 1 },
      "4,7": { dest: "route1", col: 4, row: 7 },
      "4,8": { dest: "route2", col: 4, row: 0 }
    },
    signs: { "1,7": "Verdantown — Hub of the region. Biome portals to the north!" },
    buildings: [
      { type: "house", col: 2, row: 4, w: 3, roof: "red" },
      { type: "house", col: 6, row: 4, w: 3, roof: "blue" }
    ]
  }
};

// ---- Global animation frame (incremented each render tick) ----
// Used by water shimmer, tree sway, and grass rustle animations.
let worldAnimFrame = 0;
function tickWorldAnim() { worldAnimFrame++; }

// ---- Tile rendering (GBA Edition — full textured color tiles) ----
// Uses the rich COLOR palette from constants.js for detailed pixel-art tiles.
function drawTile(ctx, tile, px, py) {
  switch (tile) {
    case 0: drawGrassTile(ctx, px, py); break;
    case 1: drawTallGrassTile(ctx, px, py); break;
    case 2: drawTreeTile(ctx, px, py); break;
    case 3: drawWaterTile(ctx, px, py, false); break;
    case 4: drawSandTile(ctx, px, py); break;
    case 5: drawCaveFloorTile(ctx, px, py); break;
    case 6: drawCaveWallTile(ctx, px, py); break;
    case 7: drawSnowTile(ctx, px, py); break;
    case 8: drawLedgeTile(ctx, px, py); break;
    case 9: drawDoorTile(ctx, px, py); break;
    case 10: drawSignTile(ctx, px, py); break;
    case 11: drawHealMatTile(ctx, px, py); break;
    case 12: drawShopMatTile(ctx, px, py); break;
    case 13: drawGymMatTile(ctx, px, py); break;
    case 14: drawWaterTile(ctx, px, py, true); break;
    // Decoration tiles (15-17)
    case 15: drawFlowerTile(ctx, px, py); break;
    case 16: drawFenceTile(ctx, px, py); break;
    case 17: drawCropTile(ctx, px, py); break;
    // Biome tiles (30-41)
    case 30: drawLavaTile(ctx, px, py); break;
    case 31: drawNeonTile(ctx, px, py); break;
    case 32: drawCrystalTile(ctx, px, py); break;
    case 33: drawScrapTile(ctx, px, py); break;
    case 34: drawDeepIceTile(ctx, px, py); break;
    case 35: drawDeepWaterTile(ctx, px, py); break;
    case 36: drawStormGrassTile(ctx, px, py); break;
    case 37: drawMarshWaterTile(ctx, px, py); break;
    case 38: drawMushroomTile(ctx, px, py); break;
    case 39: drawHoloPanelTile(ctx, px, py); break;
    case 40: drawVolcanoRockTile(ctx, px, py); break;
    case 41: drawCyberWallTile(ctx, px, py); break;
    default: drawGrassTile(ctx, px, py); break;
  }
}

// ============================================================
//  MEGA EXPANSION — Biome Tile Drawing Functions
// ============================================================

// 30: Lava floor (volcano) — glowing cracks
function drawLavaTile(ctx, px, py) {
  ctx.fillStyle = "#381010";
  ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = "#681818";
  ctx.fillRect(px + 2, py + 2, 12, 12);
  // Glowing cracks
  const glow = Math.sin(worldAnimFrame / 20 + (px + py) * 0.1) > 0;
  ctx.fillStyle = glow ? "#f86020" : "#a02810";
  ctx.fillRect(px + 4, py + 6, 8, 1);
  ctx.fillRect(px + 7, py + 4, 1, 8);
  ctx.fillStyle = glow ? "#f8a030" : "#681818";
  ctx.fillRect(px + 5, py + 10, 3, 1);
}

// 31: Neon floor (cyber city) — grid pattern
function drawNeonTile(ctx, px, py) {
  ctx.fillStyle = "#181828";
  ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = "#202038";
  ctx.fillRect(px + 1, py + 1, 14, 14);
  // Neon grid lines
  const pulse = (worldAnimFrame >> 3) % 2 === 0;
  ctx.fillStyle = pulse ? "#20d8a0" : "#0a3828";
  ctx.fillRect(px, py + 7, TILE, 1);
  ctx.fillRect(px + 7, py, 1, TILE);
  ctx.fillStyle = pulse ? "#40f8c0" : "#0a3828";
  ctx.fillRect(px + 7, py + 7, 1, 1);
}

// 32: Crystal floor (crystal forest) — shimmering facets
function drawCrystalTile(ctx, px, py) {
  ctx.fillStyle = "#2a1a38";
  ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = "#4a2868";
  ctx.fillRect(px + 2, py + 2, 12, 12);
  const shimmer = Math.sin(worldAnimFrame / 15 + (px + py) * 0.05);
  ctx.fillStyle = shimmer > 0 ? "#c080f0" : "#6838a0";
  ctx.fillRect(px + 3, py + 3, 4, 4);
  ctx.fillRect(px + 9, py + 9, 4, 4);
  ctx.fillStyle = shimmer > 0.5 ? "#e0c0ff" : "#8848c0";
  ctx.fillRect(px + 4, py + 4, 2, 2);
}

// 33: Scrap floor (junk wasteland) — rusty metal
function drawScrapTile(ctx, px, py) {
  ctx.fillStyle = "#4a4030";
  ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = "#5a5038";
  ctx.fillRect(px + 1, py + 1, 14, 14);
  ctx.fillStyle = "#6a6040";
  ctx.fillRect(px + 3, py + 3, 3, 3);
  ctx.fillRect(px + 10, py + 8, 3, 2);
  // Rust spots
  ctx.fillStyle = "#8a6038";
  ctx.fillRect(px + 6, py + 5, 2, 2);
  ctx.fillRect(px + 4, py + 11, 2, 1);
  ctx.fillStyle = "#383020";
  ctx.fillRect(px + 1, py, 14, 1);
  ctx.fillRect(px, py + 15, 16, 1);
}

// 34: Deep ice floor (glacial peaks) — frosty blue
function drawDeepIceTile(ctx, px, py) {
  ctx.fillStyle = "#a8c8e8";
  ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = "#c0d8f0";
  ctx.fillRect(px + 1, py + 1, 14, 14);
  // Ice cracks
  ctx.fillStyle = "#7898b8";
  ctx.fillRect(px + 4, py + 2, 1, 6);
  ctx.fillRect(px + 4, py + 8, 4, 1);
  ctx.fillRect(px + 10, py + 6, 1, 5);
  // Sparkle
  const sp = (worldAnimFrame >> 4) % 4 === 0;
  if (sp) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(px + 7, py + 3, 1, 1);
    ctx.fillRect(px + 8, py + 2, 1, 1);
    ctx.fillRect(px + 8, py + 4, 1, 1);
    ctx.fillRect(px + 6, py + 3, 1, 1);
  }
}

// 35: Deep water (abyssal) — dark blue, glowing spots
function drawDeepWaterTile(ctx, px, py) {
  ctx.fillStyle = "#081830";
  ctx.fillRect(px, py, TILE, TILE);
  const off = (worldAnimFrame >> 3) % 16;
  ctx.fillStyle = "#103050";
  ctx.fillRect(px + (off % 8), py + ((off >> 1) % 8), 2, 2);
  // Bioluminescent spots
  const glow = (worldAnimFrame >> 4) % 6;
  if (glow < 2) {
    ctx.fillStyle = "#40c0e0";
    ctx.fillRect(px + 5, py + 5, 1, 1);
    ctx.fillRect(px + 10, py + 9, 1, 1);
  }
  ctx.fillStyle = "#183850";
  ctx.fillRect(px, py + 7, TILE, 1);
}

// 36: Storm grass (stormy savanna) — dry grass with electric tinge
function drawStormGrassTile(ctx, px, py) {
  ctx.fillStyle = "#788830";
  ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = "#98a840";
  ctx.fillRect(px, py, TILE, 8);
  ctx.fillStyle = "#5a6820";
  ctx.fillRect(px + 2, py + 4, 1, 4);
  ctx.fillRect(px + 6, py + 3, 1, 5);
  ctx.fillRect(px + 10, py + 4, 1, 4);
  ctx.fillRect(px + 13, py + 3, 1, 5);
  // Occasional electric spark
  const spark = (worldAnimFrame >> 4) % 8 === 0;
  if (spark) {
    ctx.fillStyle = "#f8f820";
    ctx.fillRect(px + 7, py + 2, 1, 1);
  }
}

// 37: Marsh water (moonlight marsh) — dark, reflective
function drawMarshWaterTile(ctx, px, py) {
  ctx.fillStyle = "#283048";
  ctx.fillRect(px, py, TILE, TILE);
  const off = (worldAnimFrame >> 3) % 16;
  ctx.fillStyle = "#384860";
  ctx.fillRect(px + (off % 6), py + ((off >> 1) % 6), 3, 1);
  // Moonlight reflection
  ctx.fillStyle = "#a0b0d0";
  ctx.fillRect(px + 6, py + 6, 2, 1);
  ctx.fillRect(px + 7, py + 7, 1, 1);
  ctx.fillStyle = "#1a2030";
  ctx.fillRect(px, py + 12, TILE, 1);
}

// 38: Mushroom (crystal forest / marsh) — glowing cap
function drawMushroomTile(ctx, px, py) {
  // Base ground
  ctx.fillStyle = "#2a1a38";
  ctx.fillRect(px, py, TILE, TILE);
  // Mushroom stem
  ctx.fillStyle = "#c0b0a0";
  ctx.fillRect(px + 7, py + 8, 2, 6);
  // Mushroom cap (glows)
  const glow = Math.sin(worldAnimFrame / 18 + (px + py) * 0.1);
  ctx.fillStyle = glow > 0 ? "#e0a0f8" : "#a068d0";
  ctx.fillRect(px + 5, py + 6, 6, 3);
  ctx.fillRect(px + 4, py + 7, 8, 1);
  ctx.fillStyle = glow > 0.5 ? "#f0c0ff" : "#b078e0";
  ctx.fillRect(px + 6, py + 6, 1, 1);
  ctx.fillRect(px + 9, py + 7, 1, 1);
}

// 39: Holo panel (cyber city variant) — flickering hologram
function drawHoloPanelTile(ctx, px, py) {
  ctx.fillStyle = "#101828";
  ctx.fillRect(px, py, TILE, TILE);
  const flicker = Math.sin(worldAnimFrame / 8 + (px + py) * 0.2);
  ctx.fillStyle = flicker > 0 ? "#20f8c0" : "#082818";
  ctx.fillRect(px + 2, py + 2, 12, 12);
  ctx.fillStyle = flicker > 0.5 ? "#60ffd0" : "#103828";
  ctx.fillRect(px + 4, py + 4, 8, 8);
  // Scan lines
  ctx.fillStyle = "rgba(32,248,192,0.3)";
  ctx.fillRect(px, py + (worldAnimFrame >> 2) % 16, TILE, 1);
}

// 40: Volcano rock wall (blocked)
function drawVolcanoRockTile(ctx, px, py) {
  ctx.fillStyle = "#281008";
  ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = "#481810";
  ctx.fillRect(px + 1, py + 1, 14, 14);
  ctx.fillStyle = "#682018";
  ctx.fillRect(px + 2, py + 2, 5, 5);
  ctx.fillRect(px + 9, py + 3, 4, 4);
  ctx.fillRect(px + 4, py + 10, 6, 4);
  // Lava veins
  ctx.fillStyle = "#a03020";
  ctx.fillRect(px + 8, py + 2, 1, 6);
  ctx.fillRect(px + 2, py + 9, 4, 1);
}

// 41: Cyber wall (blocked)
function drawCyberWallTile(ctx, px, py) {
  ctx.fillStyle = "#181828";
  ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = "#282848";
  ctx.fillRect(px + 1, py + 1, 14, 14);
  const pulse = (worldAnimFrame >> 3) % 2 === 0;
  ctx.fillStyle = pulse ? "#40f8c0" : "#203838";
  ctx.fillRect(px + 2, py + 2, 12, 1);
  ctx.fillRect(px + 2, py + 13, 12, 1);
  ctx.fillRect(px + 2, py + 2, 1, 12);
  ctx.fillRect(px + 13, py + 2, 1, 12);
  // Circuit pattern
  ctx.fillStyle = pulse ? "#20d8a0" : "#1a2838";
  ctx.fillRect(px + 5, py + 5, 2, 2);
  ctx.fillRect(px + 9, py + 9, 2, 2);
  ctx.fillRect(px + 6, py + 6, 4, 1);
}

// ---- 0: Grass (walkable path) ----
// ---- 0: Grass (walkable, no encounter) — rich textured GBA grass ----
function drawGrassTile(ctx, px, py) {
  // base
  ctx.fillStyle = COLOR.grassMid;
  ctx.fillRect(px, py, TILE, TILE);
  // lighter top-left bias
  ctx.fillStyle = COLOR.grassLight;
  ctx.fillRect(px, py, TILE, 6);
  ctx.fillRect(px, py + 6, 8, 4);
  // darker bottom-right
  ctx.fillStyle = COLOR.grassDark;
  ctx.fillRect(px + 8, py + 10, 8, 6);
  ctx.fillRect(px, py + 12, 8, 4);
  // individual grass blade clumps (deterministic per tile position)
  const h = ((px * 7 + py * 13) >> 2);
  ctx.fillStyle = COLOR.grassLight;
  ctx.fillRect(px + 2 + (h % 4), py + 3, 1, 2);
  ctx.fillRect(px + 11 + (h % 3), py + 5, 1, 2);
  ctx.fillStyle = COLOR.tallGrass1;
  ctx.fillRect(px + 5 + (h % 5), py + 8, 1, 2);
  ctx.fillRect(px + 13 - (h % 4), py + 11, 1, 2);
  ctx.fillStyle = COLOR.grassDeep;
  ctx.fillRect(px + 1 + (h % 6), py + 13, 1, 1);
  ctx.fillRect(px + 9 + (h % 4), py + 14, 1, 1);
  // tiny highlight speck
  ctx.fillStyle = COLOR.tallGrassLite;
  ctx.fillRect(px + 3 + (h % 5), py + 2, 1, 1);
}

// ---- 1: Tall grass (walkable, encounters) — animated lush rustle ----
function drawTallGrassTile(ctx, px, py) {
  ctx.fillStyle = COLOR.tallGrass2;
  ctx.fillRect(px, py, TILE, TILE);
  // ground hint at very bottom
  ctx.fillStyle = COLOR.tallGrass3;
  ctx.fillRect(px, py + 14, TILE, 2);
  const sway = Math.sin(worldAnimFrame / 24 + (px + py) * 0.1) > 0.6 ? 1 : 0;
  // blade clusters — taller, multi-shade
  ctx.fillStyle = COLOR.tallGrass3;
  for (let i = 0; i < 5; i++) {
    const bx = px + 1 + i * 3;
    ctx.fillRect(bx, py + 3 - sway, 1, 12);
    ctx.fillRect(bx + 1, py + 4, 1, 11);
  }
  ctx.fillStyle = COLOR.tallGrass2;
  for (let i = 0; i < 5; i++) {
    const bx = px + 2 + i * 3;
    ctx.fillRect(bx, py + 5 - sway, 1, 10);
  }
  ctx.fillStyle = COLOR.tallGrass1;
  for (let i = 0; i < 5; i++) {
    const bx = px + 1 + i * 3;
    ctx.fillRect(bx, py + 3 - sway, 1, 3);
    ctx.fillRect(bx + 1, py + 4, 1, 2);
  }
  // bright tips
  ctx.fillStyle = COLOR.tallGrassLite;
  ctx.fillRect(px + 2, py + 3 - sway, 1, 1);
  ctx.fillRect(px + 11, py + 3 - sway, 1, 1);
  ctx.fillRect(px + 14, py + 4, 1, 1);
}

// ---- 2: Tree / wall (blocked) — large rounded shaded canopy ----
function drawTreeTile(ctx, px, py) {
  // grass base
  ctx.fillStyle = COLOR.grassMid;
  ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = COLOR.grassLight;
  ctx.fillRect(px, py, TILE, 4);
  // tree cast shadow (soft, to the right)
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.fillRect(px + 12, py + 11, 4, 5);
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  ctx.fillRect(px + 14, py + 12, 2, 4);
  // trunk
  ctx.fillStyle = COLOR.treeBark;
  ctx.fillRect(px + 6, py + 11, 4, 5);
  ctx.fillStyle = COLOR.treeBarkD;
  ctx.fillRect(px + 6, py + 11, 1, 5);
  ctx.fillRect(px + 9, py + 11, 1, 5);
  ctx.fillStyle = "#987048";
  ctx.fillRect(px + 7, py + 11, 2, 1);
  // canopy — large rounded blob with multiple shade rings
  // dark outline/base
  ctx.fillStyle = COLOR.treeLeaf4;
  ctx.fillRect(px + 1, py + 2, 14, 9);
  ctx.fillRect(px + 2, py + 1, 12, 11);
  // mid green
  ctx.fillStyle = COLOR.treeLeaf3;
  ctx.fillRect(px + 2, py + 3, 12, 7);
  ctx.fillRect(px + 3, py + 2, 10, 9);
  // light green
  ctx.fillStyle = COLOR.treeLeaf2;
  ctx.fillRect(px + 3, py + 4, 10, 5);
  ctx.fillRect(px + 4, py + 3, 8, 7);
  // highlight (upper-left)
  ctx.fillStyle = COLOR.treeLeaf1;
  ctx.fillRect(px + 4, py + 4, 7, 3);
  ctx.fillRect(px + 5, py + 3, 5, 5);
  // bright spot
  ctx.fillStyle = COLOR.treeLeafLite;
  ctx.fillRect(px + 5, py + 4, 3, 2);
  ctx.fillRect(px + 6, py + 5, 1, 1);
  // side bumps for rounder look
  ctx.fillStyle = COLOR.treeLeaf3;
  ctx.fillRect(px, py + 5, 2, 3);
  ctx.fillRect(px + 14, py + 5, 2, 3);
  ctx.fillStyle = COLOR.treeLeaf2;
  ctx.fillRect(px + 1, py + 6, 1, 1);
  ctx.fillRect(px + 14, py + 6, 1, 1);
  // top bump
  ctx.fillStyle = COLOR.treeLeaf3;
  ctx.fillRect(px + 6, py, 4, 2);
  ctx.fillStyle = COLOR.treeLeaf2;
  ctx.fillRect(px + 7, py + 1, 2, 1);
}

// ---- 3 / 14: Water (blocked) — animated layered shimmer ----
function drawWaterTile(ctx, px, py, deep) {
  ctx.fillStyle = deep ? COLOR.waterDeep : COLOR.water3;
  ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = deep ? COLOR.water3 : COLOR.water2;
  ctx.fillRect(px, py + 2, TILE, 6);
  ctx.fillStyle = deep ? COLOR.water2 : COLOR.water1;
  ctx.fillRect(px, py + 2, TILE, 2);
  // animated wave bands
  const off = (worldAnimFrame >> 3) % 16;
  ctx.fillStyle = deep ? COLOR.water3 : COLOR.water2;
  const wy1 = py + 6 + (off > 8 ? 1 : 0);
  ctx.fillRect(px + ((off + 0) % TILE), wy1, 4, 1);
  ctx.fillRect(px + ((off + 8) % TILE), py + 11, 5, 1);
  ctx.fillStyle = deep ? COLOR.water2 : COLOR.water1;
  ctx.fillRect(px + ((off + 2) % TILE), py + 7, 3, 1);
  ctx.fillRect(px + ((off + 10) % TILE), py + 12, 4, 1);
  // foam highlights
  ctx.fillStyle = COLOR.waterFoam;
  ctx.fillRect(px + ((off + 3) % TILE), py + 6, 1, 1);
  ctx.fillRect(px + ((off + 11) % TILE), py + 11, 1, 1);
  ctx.fillRect(px + ((off + 6) % TILE), py + 8, 1, 1);
}

// ---- 4: Sand (walkable) — textured dirt path edge ----
function drawSandTile(ctx, px, py) {
  ctx.fillStyle = COLOR.sandLight;
  ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = COLOR.sandMid;
  ctx.fillRect(px, py + 7, TILE, 9);
  ctx.fillStyle = COLOR.sandDark;
  ctx.fillRect(px, py + 13, TILE, 3);
  // pebbles & grit
  ctx.fillStyle = COLOR.pathDark;
  ctx.fillRect(px + 3, py + 3, 1, 1);
  ctx.fillRect(px + 11, py + 6, 1, 1);
  ctx.fillRect(px + 6, py + 10, 1, 1);
  ctx.fillRect(px + 13, py + 12, 1, 1);
  ctx.fillRect(px + 1, py + 9, 1, 1);
  ctx.fillRect(px + 9, py + 14, 1, 1);
  ctx.fillStyle = COLOR.pathEdge;
  ctx.fillRect(px + 5, py + 5, 1, 1);
  ctx.fillRect(px + 12, py + 9, 1, 1);
  ctx.fillRect(px + 2, py + 13, 1, 1);
}

// ---- 5: Cave floor (walkable, encounters) ----
function drawCaveFloorTile(ctx, px, py) {
  ctx.fillStyle = COLOR.caveFloor1;
  ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = COLOR.caveFloor2;
  ctx.fillRect(px, py + 9, TILE, 7);
  ctx.fillStyle = COLOR.rockD;
  ctx.fillRect(px + 2, py + 3, 2, 2);
  ctx.fillRect(px + 11, py + 6, 2, 2);
  ctx.fillRect(px + 6, py + 12, 3, 1);
  ctx.fillStyle = COLOR.rock2;
  ctx.fillRect(px + 8, py + 2, 1, 1);
  ctx.fillRect(px + 4, py + 11, 1, 1);
}

// ---- 6: Cave wall / rock wall (blocked) ----
function drawCaveWallTile(ctx, px, py) {
  ctx.fillStyle = COLOR.caveWall1;
  ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = COLOR.caveWall2;
  ctx.fillRect(px, py + 1, TILE, 6);
  ctx.fillRect(px, py + 9, TILE, 6);
  ctx.fillStyle = COLOR.caveWall3;
  ctx.fillRect(px, py, 1, TILE);
  ctx.fillRect(px + 8, py, 1, TILE);
  ctx.fillRect(px + 15, py, 1, TILE);
  ctx.fillRect(px, py + 8, TILE, 1);
  ctx.fillStyle = COLOR.rock2;
  ctx.fillRect(px + 2, py + 2, 4, 1);
  ctx.fillRect(px + 10, py + 3, 4, 1);
  ctx.fillRect(px + 4, py + 11, 3, 1);
}

// ---- 7: Snow (walkable, encounters) ----
function drawSnowTile(ctx, px, py) {
  ctx.fillStyle = COLOR.snow1;
  ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = COLOR.snow2;
  ctx.fillRect(px, py + 8, TILE, 8);
  const sparkle = (worldAnimFrame >> 4) % 3;
  ctx.fillStyle = COLOR.ice1;
  ctx.fillRect(px + 3, py + 2, 1, 1);
  ctx.fillRect(px + 11, py + 5, 1, 1);
  ctx.fillRect(px + 7, py + 12, 1, 1);
  ctx.fillStyle = "#ffffff";
  if (sparkle === 0) ctx.fillRect(px + 3, py + 2, 1, 1);
  else if (sparkle === 1) ctx.fillRect(px + 11, py + 5, 1, 1);
  else ctx.fillRect(px + 7, py + 12, 1, 1);
  ctx.fillStyle = COLOR.snowShade;
  ctx.fillRect(px, py + 14, TILE, 2);
}

// ---- 8: Ledge (one-way down) ----
function drawLedgeTile(ctx, px, py) {
  ctx.fillStyle = COLOR.grassLight;
  ctx.fillRect(px, py, TILE, 10);
  ctx.fillStyle = COLOR.grassMid;
  ctx.fillRect(px, py, TILE, 4);
  ctx.fillStyle = COLOR.rock1;
  ctx.fillRect(px, py + 10, TILE, 6);
  ctx.fillStyle = COLOR.rock2;
  ctx.fillRect(px, py + 10, TILE, 2);
  ctx.fillStyle = COLOR.rockD;
  ctx.fillRect(px, py + 14, TILE, 2);
  ctx.fillStyle = COLOR.rock3;
  ctx.fillRect(px + 3, py + 12, 2, 1);
  ctx.fillRect(px + 10, py + 12, 3, 1);
  ctx.fillStyle = COLOR.grassDark;
  ctx.fillRect(px, py + 9, TILE, 2);
}

// ---- 9: Door / warp ----
function drawDoorTile(ctx, px, py) {
  ctx.fillStyle = COLOR.wallCreamD;
  ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = COLOR.doorDark;
  ctx.fillRect(px + 3, py + 1, 10, 15);
  ctx.fillStyle = COLOR.doorLight;
  ctx.fillRect(px + 4, py + 2, 8, 13);
  ctx.fillStyle = COLOR.doorDark;
  ctx.fillRect(px + 3, py + 1, 10, 1);
  ctx.fillRect(px + 2, py + 2, 1, 2);
  ctx.fillRect(px + 13, py + 2, 1, 2);
  ctx.fillStyle = "#f8d868";
  ctx.fillRect(px + 10, py + 8, 1, 1);
  ctx.fillStyle = COLOR.wallCream;
  ctx.fillRect(px + 2, py + 14, 12, 2);
}

// ---- 10: Sign post ----
function drawSignTile(ctx, px, py) {
  ctx.fillStyle = COLOR.grassLight;
  ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = COLOR.grassMid;
  ctx.fillRect(px, py, TILE, 4);
  ctx.fillStyle = COLOR.signWoodD;
  ctx.fillRect(px + 7, py + 9, 2, 7);
  ctx.fillStyle = COLOR.signWood;
  ctx.fillRect(px + 3, py + 3, 10, 7);
  ctx.fillStyle = COLOR.signWoodD;
  ctx.fillRect(px + 3, py + 3, 10, 1);
  ctx.fillRect(px + 3, py + 9, 10, 1);
  ctx.fillRect(px + 3, py + 3, 1, 7);
  ctx.fillRect(px + 12, py + 3, 1, 7);
  ctx.fillStyle = COLOR.treeBarkD;
  ctx.fillRect(px + 5, py + 5, 6, 1);
  ctx.fillRect(px + 5, py + 8, 4, 1);
}

// ---- 11: Heal center mat (red cross) ----
function drawHealMatTile(ctx, px, py) {
  ctx.fillStyle = COLOR.grassLight;
  ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = COLOR.matHealW;
  ctx.fillRect(px + 1, py + 1, 14, 14);
  ctx.fillStyle = COLOR.rockD;
  ctx.fillRect(px + 1, py + 1, 14, 1);
  ctx.fillRect(px + 1, py + 14, 14, 1);
  ctx.fillRect(px + 1, py + 1, 1, 14);
  ctx.fillRect(px + 14, py + 1, 1, 14);
  ctx.fillStyle = COLOR.matHealR;
  ctx.fillRect(px + 7, py + 4, 2, 8);
  ctx.fillRect(px + 4, py + 7, 8, 2);
}

// ---- 12: Shop mat (blue M) ----
function drawShopMatTile(ctx, px, py) {
  ctx.fillStyle = COLOR.grassLight;
  ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = "#f8f8f8";
  ctx.fillRect(px + 1, py + 1, 14, 14);
  ctx.fillStyle = COLOR.rockD;
  ctx.fillRect(px + 1, py + 1, 14, 1);
  ctx.fillRect(px + 1, py + 14, 14, 1);
  ctx.fillRect(px + 1, py + 1, 1, 14);
  ctx.fillRect(px + 14, py + 1, 1, 14);
  ctx.fillStyle = COLOR.matShopB;
  ctx.fillRect(px + 4, py + 4, 8, 8);
  ctx.fillStyle = "#f8f8f8";
  ctx.fillRect(px + 5, py + 5, 6, 6);
  ctx.fillStyle = COLOR.matShopB;
  ctx.fillRect(px + 6, py + 6, 1, 4);
  ctx.fillRect(px + 9, py + 6, 1, 4);
  ctx.fillRect(px + 7, py + 7, 2, 1);
}

// ---- 13: Gym mat (special floor) ----
function drawGymMatTile(ctx, px, py) {
  ctx.fillStyle = COLOR.matGym2;
  ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = COLOR.matGym1;
  ctx.fillRect(px + 1, py + 1, 14, 14);
  ctx.fillStyle = COLOR.matGym2;
  ctx.fillRect(px + 6, py + 3, 4, 2);
  ctx.fillRect(px + 4, py + 5, 8, 2);
  ctx.fillRect(px + 3, py + 7, 10, 2);
  ctx.fillRect(px + 4, py + 9, 8, 2);
  ctx.fillRect(px + 6, py + 11, 4, 2);
  ctx.fillStyle = "#f8f8f8";
  ctx.fillRect(px + 7, py + 7, 2, 2);
  ctx.fillStyle = COLOR.rockD;
  ctx.fillRect(px + 1, py + 1, 14, 1);
  ctx.fillRect(px + 1, py + 14, 14, 1);
  ctx.fillRect(px + 1, py + 1, 1, 14);
  ctx.fillRect(px + 14, py + 1, 1, 14);
}

// ---- 15: Flower patch (grass + scattered flowers, deterministic) ----
function drawFlowerTile(ctx, px, py) {
  // base grass
  drawGrassTile(ctx, px, py);
  // deterministic flower placement based on tile coords
  const seed = (px * 31 + py * 17) | 0;
  const flowerCols = [COLOR.flowerRed, COLOR.flowerYellow, COLOR.flowerPink];
  function drawFlower(fx, fy, col) {
    // petals (4 dots around center)
    ctx.fillStyle = col;
    ctx.fillRect(fx, fy, 1, 1);
    ctx.fillRect(fx + 2, fy, 1, 1);
    ctx.fillRect(fx, fy + 2, 1, 1);
    ctx.fillRect(fx + 2, fy + 2, 1, 1);
    // center
    ctx.fillStyle = COLOR.flowerCenter;
    ctx.fillRect(fx + 1, fy + 1, 1, 1);
    // stem leaf
    ctx.fillStyle = COLOR.grassDeep;
    ctx.fillRect(fx + 1, fy + 3, 1, 1);
  }
  // 2-3 flowers per tile
  drawFlower(px + 3 + (seed % 4), py + 4 + ((seed >> 2) % 4), flowerCols[seed % 3]);
  drawFlower(px + 9 + ((seed >> 4) % 4), py + 8 + ((seed >> 6) % 4), flowerCols[(seed >> 1) % 3]);
  if ((seed & 1) === 0) drawFlower(px + 6 + ((seed >> 5) % 3), py + 12 + ((seed >> 7) % 2), flowerCols[(seed >> 2) % 3]);
}

// ---- 16: Wooden fence (horizontal rail on grass) ----
function drawFenceTile(ctx, px, py) {
  // grass base
  drawGrassTile(ctx, px, py);
  // two horizontal rails
  ctx.fillStyle = COLOR.fenceWoodD;
  ctx.fillRect(px, py + 5, TILE, 2);
  ctx.fillRect(px, py + 10, TILE, 2);
  ctx.fillStyle = COLOR.fenceWood;
  ctx.fillRect(px, py + 5, TILE, 1);
  ctx.fillRect(px, py + 10, TILE, 1);
  ctx.fillStyle = COLOR.fenceWoodL;
  ctx.fillRect(px, py + 5, TILE, 1);
  // fence posts (every 8px)
  ctx.fillStyle = COLOR.fenceWoodD;
  ctx.fillRect(px + 1, py + 3, 2, 10);
  ctx.fillRect(px + 9, py + 3, 2, 10);
  ctx.fillStyle = COLOR.fenceWood;
  ctx.fillRect(px + 1, py + 3, 1, 10);
  ctx.fillRect(px + 9, py + 3, 1, 10);
  // post tops (pointed)
  ctx.fillStyle = COLOR.fenceWoodD;
  ctx.fillRect(px + 1, py + 2, 2, 1);
  ctx.fillRect(px + 9, py + 2, 2, 1);
  // shadow under fence
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fillRect(px, py + 14, TILE, 2);
}

// ---- 17: Crop field (tilled soil rows with green stalks) ----
function drawCropTile(ctx, px, py) {
  // tilled soil base
  ctx.fillStyle = COLOR.cropSoil;
  ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = COLOR.cropSoilD;
  ctx.fillRect(px, py, TILE, 1);
  ctx.fillRect(px, py + 15, TILE, 1);
  // furrow rows (horizontal dark stripes)
  ctx.fillStyle = COLOR.cropSoilD;
  ctx.fillRect(px, py + 3, TILE, 1);
  ctx.fillRect(px, py + 7, TILE, 1);
  ctx.fillRect(px, py + 11, TILE, 1);
  // crop stalks in furrows
  const seed = (px * 13 + py * 7) | 0;
  ctx.fillStyle = COLOR.cropStalk;
  function stalk(sx, sy) {
    ctx.fillRect(sx, sy, 1, 2);
    ctx.fillRect(sx, sy, 1, 1);
  }
  stalk(px + 2 + (seed % 3), py + 1);
  stalk(px + 7 + ((seed >> 2) % 3), py + 1);
  stalk(px + 12 + ((seed >> 4) % 2), py + 1);
  stalk(px + 3 + ((seed >> 3) % 3), py + 5);
  stalk(px + 9 + ((seed >> 5) % 3), py + 5);
  stalk(px + 13 - ((seed >> 6) % 3), py + 5);
  stalk(px + 2 + ((seed >> 4) % 3), py + 9);
  stalk(px + 8 + ((seed >> 7) % 3), py + 9);
  stalk(px + 12 + ((seed >> 1) % 2), py + 9);
  stalk(px + 5 + (seed % 3), py + 13);
  stalk(px + 11 - ((seed >> 3) % 3), py + 13);
  // grain heads (yellow) on some
  ctx.fillStyle = COLOR.cropGrain;
  ctx.fillRect(px + 2 + (seed % 3), py + 1, 1, 1);
  ctx.fillRect(px + 9 + ((seed >> 5) % 3), py + 5, 1, 1);
  ctx.fillRect(px + 8 + ((seed >> 7) % 3), py + 9, 1, 1);
}

// ============================================================
//  BUILDING OVERLAY SYSTEM
//  Draws detailed multi-tile buildings (houses, Pok\u00e9mon Center,
//  Mart, Gym) on top of the tile grid. Each building is anchored
//  at its door tile and extends upward (roof overhangs above).
//  Buildings are listed in map metadata: buildings: [{type, col, row}]
//  where (col,row) is the door tile. The building occupies the door
//  tile + one tile above (walls/roof). A 3-wide building uses cols
//  col-1..col+1; a 2-wide uses col..col+1.
// ============================================================

// Draw all buildings for a map (sorted by row so lower buildings
// correctly overlap upper ones).
function drawBuildings(ctx, map) {
  map = map || currentMapData();
  if (!map || !map.buildings) return;
  const list = map.buildings.slice().sort((a, b) => (a.row - b.row));
  // Pass 1: cast shadows (drawn before buildings, semi-transparent)
  for (const b of list) {
    const x = b.col * TILE;
    const y = b.row * TILE;
    const w = b.w || 3;
    const W = w * TILE;
    const H = 2 * TILE; // roof row + wall row
    // ground shadow: offset down-right, elliptical-ish
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(x + 4, y + H - 2, W + 2, 4);
    ctx.fillStyle = "rgba(0,0,0,0.10)";
    ctx.fillRect(x + 6, y + H, W, 3);
    // soft fade edge
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.fillRect(x + 8, y + H + 2, W - 2, 2);
  }
  // Pass 2: buildings
  for (const b of list) {
    const x = b.col * TILE;
    const y = b.row * TILE;
    switch (b.type) {
      case "house":    drawHouseBuilding(ctx, x, y, b.w || 3, b.roof || "red"); break;
      case "center":   drawCenterBuilding(ctx, x, y, b.w || 3); break;
      case "mart":     drawMartBuilding(ctx, x, y, b.w || 3); break;
      case "gym":      drawGymBuilding(ctx, x, y, b.w || 3); break;
      case "lab":      drawLabBuilding(ctx, x, y, b.w || 3); break;
      default:         drawHouseBuilding(ctx, x, y, b.w || 3, b.roof || "red"); break;
    }
  }
}

// ---- Helper: roof colors ----
function roofColors(style) {
  if (style === "blue") return { lite: "#78a8e8", mid: COLOR.roofBlue, dark: COLOR.roofBlueD, edge: "#1c4890" };
  if (style === "green") return { lite: "#78d878", mid: "#48b048", dark: "#287828", edge: "#185818" };
  // red (default)
  return { lite: "#e87868", mid: COLOR.roofRed, dark: COLOR.roofRedD, edge: "#801818" };
}

// ---- Generic house: 3-wide, 2-tall (roof row + wall/door row) ----
// (x,y) = top-left of the building's footprint. The door is centered.
function drawHouseBuilding(ctx, x, y, w, roofStyle) {
  const W = w * TILE;
  const rc = roofColors(roofStyle);
  // ROOF (top tile row) — triangular peaked roof
  // dark base band
  ctx.fillStyle = rc.edge;
  ctx.fillRect(x, y + 4, W, 2);
  // roof fill
  ctx.fillStyle = rc.dark;
  ctx.fillRect(x, y, W, 5);
  ctx.fillStyle = rc.mid;
  ctx.fillRect(x + 1, y, W - 2, 4);
  ctx.fillStyle = rc.lite;
  ctx.fillRect(x + 2, y + 1, W - 4, 2);
  // roof peak (center triangle) for 3-wide
  if (w >= 3) {
    const cx = x + W / 2;
    ctx.fillStyle = rc.dark;
    ctx.fillRect(cx - 4, y - 3, 8, 4);
    ctx.fillStyle = rc.mid;
    ctx.fillRect(cx - 3, y - 3, 6, 3);
    ctx.fillStyle = rc.lite;
    ctx.fillRect(cx - 2, y - 2, 4, 1);
    // chimney
    ctx.fillStyle = "#888070";
    ctx.fillRect(x + W - 6, y - 4, 3, 4);
    ctx.fillStyle = "#585048";
    ctx.fillRect(x + W - 6, y - 4, 3, 1);
  }
  // roof shingle lines
  ctx.fillStyle = rc.dark;
  for (let i = 0; i < w; i++) {
    ctx.fillRect(x + i * TILE + 6, y + 2, 4, 1);
  }
  // WALLS (bottom tile row = the door tile row)
  const wy = y + TILE;
  ctx.fillStyle = COLOR.wallCreamD;
  ctx.fillRect(x, wy, W, TILE);
  ctx.fillStyle = COLOR.wallCream;
  ctx.fillRect(x + 1, wy + 1, W - 2, TILE - 2);
  // wall base shadow
  ctx.fillStyle = COLOR.wallCreamD;
  ctx.fillRect(x, wy + TILE - 3, W, 3);
  // door (centered)
  const dw = 8, dh = 12;
  const dx = x + (W - dw) / 2;
  const dy = wy + TILE - dh - 1;
  ctx.fillStyle = COLOR.doorDark;
  ctx.fillRect(dx - 1, dy - 1, dw + 2, dh + 2);
  ctx.fillStyle = COLOR.doorLight;
  ctx.fillRect(dx, dy, dw, dh);
  ctx.fillStyle = COLOR.doorDark;
  ctx.fillRect(dx + dw / 2, dy, 1, dh); // center seam
  ctx.fillStyle = "#f8d868";
  ctx.fillRect(dx + dw - 2, dy + dh / 2, 1, 1); // knob
  // windows (left & right of door, if room)
  if (w >= 3) {
    drawWindow(ctx, x + 3, wy + 3);
    drawWindow(ctx, x + W - 11, wy + 3);
  }
}

// ---- Small blue window with lit pane ----
function drawWindow(ctx, x, y) {
  ctx.fillStyle = "#383840";
  ctx.fillRect(x - 1, y - 1, 9, 9);
  ctx.fillStyle = COLOR.windowLit;
  ctx.fillRect(x, y, 7, 7);
  ctx.fillStyle = "#c8a838";
  ctx.fillRect(x, y, 7, 1);
  ctx.fillStyle = "#383840";
  ctx.fillRect(x + 3, y, 1, 7);
  ctx.fillRect(x, y + 3, 7, 1);
  // highlight
  ctx.fillStyle = "#f8f0a0";
  ctx.fillRect(x + 1, y + 1, 1, 1);
}

// ---- Pok\u00e9mon Center style: red roof + red cross emblem on sign ----
function drawCenterBuilding(ctx, x, y, w) {
  const W = w * TILE;
  const rc = roofColors("red");
  // ROOF
  ctx.fillStyle = rc.edge;
  ctx.fillRect(x, y + 5, W, 2);
  ctx.fillStyle = rc.dark;
  ctx.fillRect(x, y, W, 6);
  ctx.fillStyle = rc.mid;
  ctx.fillRect(x + 1, y, W - 2, 5);
  ctx.fillStyle = rc.lite;
  ctx.fillRect(x + 2, y + 1, W - 4, 2);
  // center peak
  if (w >= 3) {
    const cx = x + W / 2;
    ctx.fillStyle = rc.dark;
    ctx.fillRect(cx - 5, y - 4, 10, 5);
    ctx.fillStyle = rc.mid;
    ctx.fillRect(cx - 4, y - 4, 8, 4);
    ctx.fillStyle = rc.lite;
    ctx.fillRect(cx - 3, y - 3, 6, 1);
  }
  // roof shingles
  ctx.fillStyle = rc.dark;
  for (let i = 0; i < w; i++) ctx.fillRect(x + i * TILE + 6, y + 3, 4, 1);
  // WALLS (white/cream)
  const wy = y + TILE;
  ctx.fillStyle = "#d0d0d8";
  ctx.fillRect(x, wy, W, TILE);
  ctx.fillStyle = "#f0f0f4";
  ctx.fillRect(x + 1, wy + 1, W - 2, TILE - 2);
  ctx.fillStyle = "#d0d0d8";
  ctx.fillRect(x, wy + TILE - 3, W, 3);
  // door (centered, glassy blue)
  const dw = 8, dh = 12;
  const dx = x + (W - dw) / 2;
  const dy = wy + TILE - dh - 1;
  ctx.fillStyle = "#2858a8";
  ctx.fillRect(dx - 1, dy - 1, dw + 2, dh + 2);
  ctx.fillStyle = "#4888d8";
  ctx.fillRect(dx, dy, dw, dh);
  ctx.fillStyle = "#68a8f8";
  ctx.fillRect(dx + 1, dy + 1, dw - 2, 4);
  ctx.fillStyle = "#2858a8";
  ctx.fillRect(dx + dw / 2, dy, 1, dh);
  // RED CROSS emblem above door (the Pok\u00e9mon Center sign)
  const ex = x + W / 2;
  ctx.fillStyle = "#f8f8f8";
  ctx.fillRect(ex - 5, wy + 1, 10, 6);
  ctx.fillStyle = "#383840";
  ctx.fillRect(ex - 5, wy + 1, 10, 1);
  ctx.fillRect(ex - 5, wy + 6, 10, 1);
  ctx.fillRect(ex - 5, wy + 1, 1, 6);
  ctx.fillRect(ex + 4, wy + 1, 1, 6);
  ctx.fillStyle = COLOR.matHealR;
  ctx.fillRect(ex - 1, wy + 2, 2, 4);
  ctx.fillRect(ex - 2, wy + 3, 4, 2);
  // side windows
  if (w >= 3) {
    drawWindow(ctx, x + 3, wy + 3);
    drawWindow(ctx, x + W - 11, wy + 3);
  }
}

// ---- Pok\u00e9mon Mart style: blue roof + blue shop sign ----
function drawMartBuilding(ctx, x, y, w) {
  const W = w * TILE;
  const rc = roofColors("blue");
  // ROOF
  ctx.fillStyle = rc.edge;
  ctx.fillRect(x, y + 5, W, 2);
  ctx.fillStyle = rc.dark;
  ctx.fillRect(x, y, W, 6);
  ctx.fillStyle = rc.mid;
  ctx.fillRect(x + 1, y, W - 2, 5);
  ctx.fillStyle = rc.lite;
  ctx.fillRect(x + 2, y + 1, W - 4, 2);
  if (w >= 3) {
    const cx = x + W / 2;
    ctx.fillStyle = rc.dark;
    ctx.fillRect(cx - 5, y - 4, 10, 5);
    ctx.fillStyle = rc.mid;
    ctx.fillRect(cx - 4, y - 4, 8, 4);
    ctx.fillStyle = rc.lite;
    ctx.fillRect(cx - 3, y - 3, 6, 1);
  }
  ctx.fillStyle = rc.dark;
  for (let i = 0; i < w; i++) ctx.fillRect(x + i * TILE + 6, y + 3, 4, 1);
  // WALLS
  const wy = y + TILE;
  ctx.fillStyle = "#d0d0d8";
  ctx.fillRect(x, wy, W, TILE);
  ctx.fillStyle = "#f0f0f4";
  ctx.fillRect(x + 1, wy + 1, W - 2, TILE - 2);
  ctx.fillStyle = "#d0d0d8";
  ctx.fillRect(x, wy + TILE - 3, W, 3);
  // door
  const dw = 8, dh = 12;
  const dx = x + (W - dw) / 2;
  const dy = wy + TILE - dh - 1;
  ctx.fillStyle = COLOR.doorDark;
  ctx.fillRect(dx - 1, dy - 1, dw + 2, dh + 2);
  ctx.fillStyle = COLOR.doorLight;
  ctx.fillRect(dx, dy, dw, dh);
  ctx.fillStyle = COLOR.doorDark;
  ctx.fillRect(dx + dw / 2, dy, 1, dh);
  // BLUE MART sign above door
  const ex = x + W / 2;
  ctx.fillStyle = "#f8f8f8";
  ctx.fillRect(ex - 5, wy + 1, 10, 6);
  ctx.fillStyle = "#383840";
  ctx.fillRect(ex - 5, wy + 1, 10, 1);
  ctx.fillRect(ex - 5, wy + 6, 10, 1);
  ctx.fillRect(ex - 5, wy + 1, 1, 6);
  ctx.fillRect(ex + 4, wy + 1, 1, 6);
  ctx.fillStyle = COLOR.matShopB;
  // simple "M" shape
  ctx.fillRect(ex - 3, wy + 2, 1, 4);
  ctx.fillRect(ex + 2, wy + 2, 1, 4);
  ctx.fillRect(ex - 2, wy + 3, 1, 1);
  ctx.fillRect(ex + 1, wy + 3, 1, 1);
  ctx.fillRect(ex - 1, wy + 4, 1, 1);
  ctx.fillRect(ex, wy + 4, 1, 1);
  if (w >= 3) {
    drawWindow(ctx, x + 3, wy + 3);
    drawWindow(ctx, x + W - 11, wy + 3);
  }
}

// ---- Gym building: purple roof + gym emblem ----
function drawGymBuilding(ctx, x, y, w) {
  const W = w * TILE;
  const rc = roofColors("green");
  ctx.fillStyle = rc.edge;
  ctx.fillRect(x, y + 5, W, 2);
  ctx.fillStyle = rc.dark;
  ctx.fillRect(x, y, W, 6);
  ctx.fillStyle = rc.mid;
  ctx.fillRect(x + 1, y, W - 2, 5);
  ctx.fillStyle = rc.lite;
  ctx.fillRect(x + 2, y + 1, W - 4, 2);
  if (w >= 3) {
    const cx = x + W / 2;
    ctx.fillStyle = rc.dark;
    ctx.fillRect(cx - 5, y - 4, 10, 5);
    ctx.fillStyle = rc.mid;
    ctx.fillRect(cx - 4, y - 4, 8, 4);
    ctx.fillStyle = rc.lite;
    ctx.fillRect(cx - 3, y - 3, 6, 1);
  }
  // WALLS
  const wy = y + TILE;
  ctx.fillStyle = COLOR.wallCreamD;
  ctx.fillRect(x, wy, W, TILE);
  ctx.fillStyle = COLOR.wallCream;
  ctx.fillRect(x + 1, wy + 1, W - 2, TILE - 2);
  ctx.fillStyle = COLOR.wallCreamD;
  ctx.fillRect(x, wy + TILE - 3, W, 3);
  // door (grand, double)
  const dw = 10, dh = 12;
  const dx = x + (W - dw) / 2;
  const dy = wy + TILE - dh - 1;
  ctx.fillStyle = "#4848a8";
  ctx.fillRect(dx - 1, dy - 1, dw + 2, dh + 2);
  ctx.fillStyle = "#7878d8";
  ctx.fillRect(dx, dy, dw, dh);
  ctx.fillStyle = "#4848a8";
  ctx.fillRect(dx + dw / 2 - 1, dy, 1, dh);
  ctx.fillRect(dx + dw / 2, dy, 1, dh);
  // gym badge emblem above door
  const ex = x + W / 2;
  ctx.fillStyle = "#f8f8f8";
  ctx.fillRect(ex - 4, wy + 1, 8, 5);
  ctx.fillStyle = COLOR.matGym1;
  ctx.fillRect(ex - 2, wy + 2, 4, 3);
  ctx.fillStyle = "#f8f8f8";
  ctx.fillRect(ex - 1, wy + 3, 2, 1);
  if (w >= 3) {
    drawWindow(ctx, x + 3, wy + 3);
    drawWindow(ctx, x + W - 11, wy + 3);
  }
}

// ---- Lab building (Professor's lab): white walls, flat-ish roof ----
function drawLabBuilding(ctx, x, y, w) {
  const W = w * TILE;
  const rc = roofColors("red");
  ctx.fillStyle = rc.edge;
  ctx.fillRect(x, y + 5, W, 2);
  ctx.fillStyle = rc.dark;
  ctx.fillRect(x, y, W, 6);
  ctx.fillStyle = rc.mid;
  ctx.fillRect(x + 1, y, W - 2, 5);
  ctx.fillStyle = rc.lite;
  ctx.fillRect(x + 2, y + 1, W - 4, 2);
  if (w >= 3) {
    const cx = x + W / 2;
    ctx.fillStyle = rc.dark;
    ctx.fillRect(cx - 5, y - 4, 10, 5);
    ctx.fillStyle = rc.mid;
    ctx.fillRect(cx - 4, y - 4, 8, 4);
    ctx.fillStyle = rc.lite;
    ctx.fillRect(cx - 3, y - 3, 6, 1);
  }
  const wy = y + TILE;
  ctx.fillStyle = "#d0d0d8";
  ctx.fillRect(x, wy, W, TILE);
  ctx.fillStyle = "#f0f0f4";
  ctx.fillRect(x + 1, wy + 1, W - 2, TILE - 2);
  ctx.fillStyle = "#d0d0d8";
  ctx.fillRect(x, wy + TILE - 3, W, 3);
  // wide door
  const dw = 10, dh = 12;
  const dx = x + (W - dw) / 2;
  const dy = wy + TILE - dh - 1;
  ctx.fillStyle = COLOR.doorDark;
  ctx.fillRect(dx - 1, dy - 1, dw + 2, dh + 2);
  ctx.fillStyle = COLOR.doorLight;
  ctx.fillRect(dx, dy, dw, dh);
  ctx.fillStyle = COLOR.doorDark;
  ctx.fillRect(dx + dw / 2, dy, 1, dh);
  // big windows (lab has many)
  if (w >= 3) {
    drawWindow(ctx, x + 2, wy + 3);
    drawWindow(ctx, x + W - 10, wy + 3);
  }
}

function drawMap(ctx, map) {
  map = map || currentMapData();
  for (let row = 0; row < map.grid.length; row++) {
    for (let col = 0; col < map.grid[row].length; col++) {
      drawTile(ctx, map.grid[row][col], col * TILE, row * TILE);
    }
  }
  // Overlay decorative buildings (drawn after tiles, before entities)
  drawBuildings(ctx, map);
}

// ---- Helpers for the current map ----
function currentMapData() {
  return MAPS[world.currentMap];
}

function isBlocked(col, row) {
  const map = currentMapData();
  if (!map) return true;
  if (row < 0 || col < 0 || row >= map.grid.length || col >= map.grid[0].length) return true;
  const t = map.grid[row][col];
  // water(3,14,35), trees(2), rock walls(6), signs(10), volcano rock(40), cyber wall(41) block
  return t === 2 || t === 3 || t === 6 || t === 10 || t === 14 || t === 35 || t === 40 || t === 41;
}

// Ledges (8) can only be stepped onto if moving downward into them.
function isLedge(col, row) {
  const map = currentMapData();
  return map && map.grid[row] && map.grid[row][col] === 8;
}

function isTallGrass(col, row) {
  const map = currentMapData();
  const t = map && map.grid[row] && map.grid[row][col];
  // encounter tiles: tall grass(1), cave(5), snow(7), + biome floor tiles (30-39)
  return t === 1 || t === 5 || t === 7 || (t >= 30 && t <= 39);
}

function warpAt(col, row) {
  const map = currentMapData();
  const key = col + "," + row;
  return (map.warps && map.warps[key]) || null;
}

function signAt(col, row) {
  const map = currentMapData();
  const key = col + "," + row;
  return (map.signs && map.signs[key]) || null;
}

// ---- NPC drawing (GBA-style detailed humanoid overworld sprites) ----
function drawNpcs(ctx) {
  const npcs = getNpcsForMap(world.currentMap);
  npcs.forEach(npc => {
    if (npc.defeated && npc.hideOnDefeat) return;
    const px = npc.col * TILE;
    const py = npc.row * TILE;

    // Use the new detailed humanoid sprite from sprites.js.
    // npcPalette() converts the NPC's sprite hex into a full clothing palette.
    if (typeof drawHumanoid === "function" && typeof npcPalette === "function") {
      const P = npcPalette(npc.sprite);
      // gentle idle bob for life (NPCs stand still, so walkFrame=0)
      drawHumanoid(ctx, px, py, npc.facing || "down", 0, P);
    } else {
      // legacy fallback (should never trigger now)
      ctx.fillStyle = PALETTE.black;
      ctx.fillRect(px + 4, py + 2, 8, 12);
      ctx.fillStyle = npc.sprite || PALETTE.light;
      ctx.fillRect(px + 6, py + 4, 4, 4);
    }

    // exclamation indicator for undefeated trainers (gives a GBA "!" vibe)
    if (npc.isTrainer && !npc.defeated) {
      ctx.fillStyle = "#f8d818";
      ctx.fillRect(px + 13, py - 3, 1, 5);
      ctx.fillRect(px + 13, py + 3, 1, 1);
      ctx.fillStyle = "#181820";
      ctx.fillRect(px + 12, py - 4, 3, 1);
      ctx.fillRect(px + 12, py + 4, 3, 1);
    }
  });
}
