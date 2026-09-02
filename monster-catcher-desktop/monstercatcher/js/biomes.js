// ============================================================
//  PROJECT HERO — Biome System
//  8 distinct biomes with unique tilesets, weather effects,
//  creatures, power-up tools, and contextual dialogue.
//  Each biome has a map grid (reusing world.js tile codes plus
//  new biome-specific tile IDs rendered via biome tile fns).
// ============================================================

// New biome-specific tile codes (start at 30 to avoid collision with world.js)
// 30 = lava, 31 = neon floor, 32 = crystal, 33 = scrap/metal ground,
// 34 = deep ice, 35 = deep water (abyssal), 36 = storm grass,
// 37 = marsh water, 38 = glowing mushroom, 39 = hologram panel,
// 40 = volcano rock, 41 = cyber building wall

const BIOME_TILES = {
  LAVA: 30, NEON: 31, CRYSTAL: 32, SCRAP: 33, DEEPICE: 34,
  DEEPWATER: 35, STORMGRASS: 36, MARSHWATER: 37, MUSHROOM: 38,
  HOLOPANEL: 39, VOLCANOROCK: 40, CYBERWALL: 41
};

const BIOMES = {
  volcano: {
    id: "volcano", name: "Scorching Volcano Zone",
    emoji: "\u{1F30B}",
    palette: { sky: "#3a1010", sky2: "#681818", ground: "#5a2018", accent: "#f87838" },
    weather: ["eruption", "ashstorm"],
    tileCode: BIOME_TILES.LAVA,
    musicKey: "volcano",
    encounterRate: 0.16,
    creatures: ["emberit", "magmaSlug", "obsidianHawk"],
    tools: ["lavaBoots", "heatShielding"],
    dialogue: {
      hero: ["Why is it ALWAYS the volcanoes? Why can't we have a pleasant biome? Like a cookie zone?"],
      companion: ["I mean, you DID eat all the cookies.", "I love it! This is PARADISE!"],
      banter: [
        "Hero: THAT WAS LAST WEEK. I'VE CHANGED.",
        "Companion: The ground is literally on fire.",
        "Hero: Character-building ground."
      ]
    },
    weatherEffects: {
      eruption: { name: "Eruption", desc: "Random lava bursts damage nearby creatures", dmgPerTurn: 3 },
      ashstorm: { name: "Ash Storm", desc: "Reduces visibility and slows movement", speedMod: 0.7, visibility: 0.6 }
    }
  },

  cybercity: {
    id: "cybercity", name: "Neon-Cyber City",
    emoji: "\u{1F310}",
    palette: { sky: "#1a0a2e", sky2: "#2a1a4e", ground: "#2a2a3e", accent: "#48e0d8" },
    weather: ["datarain", "powersurge"],
    tileCode: BIOME_TILES.NEON,
    musicKey: "cyber",
    encounterRate: 0.14,
    creatures: ["cyberPigeon", "glitchHound", "holographicMimic"],
    tools: ["dataScrambler", "holoCloak"],
    dialogue: {
      hero: ["Everything here is so... shiny. And expensive."],
      companion: ["I LIVE HERE NOW. THIS IS MY HOME. I'M NEVER LEAVING.", "FIVE AMAZING SECONDS."],
      banter: [
        "Hero: You've been here five seconds.",
        "Companion: Five AMAZING seconds.",
        "Hero: That's not how time works."
      ]
    },
    weatherEffects: {
      datarain: { name: "Data Rain", desc: "Holographic raindrops glitch to reveal hidden items", revealItems: true },
      powersurge: { name: "Power Surge", desc: "All electrical attacks deal double damage", electricMult: 2.0 }
    }
  },

  crystalforest: {
    id: "crystalforest", name: "Enchanted Crystal Forest",
    emoji: "\u{1F4AB}",
    palette: { sky: "#2a1a3e", sky2: "#3a2a5e", ground: "#2a3a2e", accent: "#a878f8" },
    weather: ["crystalrain", "magicbloom"],
    tileCode: BIOME_TILES.CRYSTAL,
    musicKey: "crystal",
    encounterRate: 0.13,
    creatures: ["crystalDeer", "glowingSprite", "mossyGiant"],
    tools: ["crystalStaff", "pollenBombs"],
    dialogue: {
      hero: ["It's so magical. So peaceful. I feel like I'm in a dream."],
      companion: ["I just saw a mushroom wink at me.", "It's still winking. It won't stop. Help."],
      banter: [
        "Hero: ...Okay, that's slightly less peaceful.",
        "Companion: It's waving now. This is a threat."
      ]
    },
    weatherEffects: {
      crystalrain: { name: "Crystal Rain", desc: "Shards fall, damaging enemies randomly", dmgRandom: 4 },
      magicbloom: { name: "Magic Bloom", desc: "Healing effects are doubled", healMult: 2.0 }
    }
  },

  junkwaste: {
    id: "junkwaste", name: "Forgotten Junk Wasteland",
    emoji: "\u{1F5D1}",
    palette: { sky: "#4a4a3a", sky2: "#5a5a4a", ground: "#6a6a5a", accent: "#98a878" },
    weather: ["trashtornado", "acidrain"],
    tileCode: BIOME_TILES.SCRAP,
    musicKey: "junk",
    encounterRate: 0.18,
    creatures: ["scrapRat", "metalWorm", "junkGolem"],
    tools: ["magnetGauntlets", "trashCompactor"],
    dialogue: {
      hero: ["This is where good intentions go to die."],
      companion: ["THIS IS PARADISE! LOOK AT ALL THIS FREE STUFF!", "DID I STUTTER? I SAID TREASURE!"],
      banter: [
        "Hero: It's a broken toaster and a tire.",
        "Companion: I SAID. FREE. STUFF.",
        "Hero: That toaster is on fire.",
        "Companion: WARM FREE STUFF."
      ]
    },
    weatherEffects: {
      trashtornado: { name: "Trash Tornado", desc: "Twisters fling garbage and enemies around", randomFling: true },
      acidrain: { name: "Acid Rain", desc: "Damages creatures gradually; seek shelter", dmgPerTurn: 2 }
    }
  },

  glacialpeaks: {
    id: "glacialpeaks", name: "Glacial Peak Mountains",
    emoji: "\u26F0\uFE0F",
    palette: { sky: "#3a4a6e", sky2: "#5a7aae", ground: "#d8e8f8", accent: "#98d8f8" },
    weather: ["blizzard", "auroraboost"],
    tileCode: BIOME_TILES.DEEPICE,
    musicKey: "frost",
    encounterRate: 0.12,
    creatures: ["iceWolf", "snowYeti", "glacierMoth"],
    tools: ["iceSkates", "heatingCoil"],
    dialogue: {
      hero: ["Why do we always go to the cold places? Why not a tropical beach?"],
      companion: ["The cold builds character.", "I'm comfortable! This is FINE weather!"],
      banter: [
        "Hero: The cold builds hypothermia, you absolute icicle.",
        "Companion: (shivering but in denial) I'm FINE.",
        "Hero: You're literally frozen.",
        "Companion: I'm CRISP."
      ]
    },
    weatherEffects: {
      blizzard: { name: "Blizzard", desc: "Reduces speed and visibility", speedMod: 0.6, visibility: 0.5 },
      auroraboost: { name: "Aurora Boost", desc: "Increases experience gain", xpMult: 1.5 }
    }
  },

  abyssal: {
    id: "abyssal", name: "Abyssal Trench",
    emoji: "\u{1F30A}",
    palette: { sky: "#0a1a2e", sky2: "#1a2a4e", ground: "#0a2038", accent: "#48a8f8" },
    weather: ["currentsurge", "bioluminescence"],
    tileCode: BIOME_TILES.DEEPWATER,
    musicKey: "storm",
    encounterRate: 0.11,
    creatures: ["glowingJellyfish", "anglerMimic", "seaSerpent"],
    tools: ["aquaBreathingMask", "sonarBeacon"],
    dialogue: {
      hero: ["I can't breathe. I can't see. I'm being attacked by a glowing squid."],
      companion: ["It's just trying to be friends!", "They're not angry! They're... enthusiastic!"],
      banter: [
        "Hero: IT HAS TWENTY TENTACLES AND THEY'RE ALL ANGRY!",
        "Companion: Enthusiastic!",
        "Hero: THAT'S THE SAME THING WITH MORE TENTACLES."
      ]
    },
    weatherEffects: {
      currentsurge: { name: "Current Surge", desc: "Moves you in a random direction", randomMove: true },
      bioluminescence: { name: "Bioluminescent Glow", desc: "Illuminates hidden passages", revealPaths: true }
    }
  },

  stormsavanna: {
    id: "stormsavanna", name: "Stormy Savanna",
    emoji: "\u{1F32A}\uFE0F",
    palette: { sky: "#4a4a5a", sky2: "#5a5a6a", ground: "#8a9a5a", accent: "#f8d818" },
    weather: ["lightningstrikes", "windgusts"],
    tileCode: BIOME_TILES.STORMGRASS,
    musicKey: "storm",
    encounterRate: 0.17,
    creatures: ["thunderRhino", "lightningBird", "stormSpirit"],
    tools: ["lightningRod", "stormShield"],
    dialogue: {
      hero: ["Every time I step into this field, I'm IMMEDIATELY struck by lightning."],
      companion: ["Maybe stop wearing that metal hat?", "The universe hates you. I'm so sorry."],
      banter: [
        "Hero: IT'S NOT METAL. IT'S PLASTIC. WHY IS THIS HAPPENING TO ME?",
        "Companion: (dodging a bolt) It's a gift, really. Free electricity.",
        "Hero: I'M ON FIRE."
      ]
    },
    weatherEffects: {
      lightningstrikes: { name: "Lightning Strikes", desc: "Random bolts damage enemies", dmgRandom: 5, electric: true },
      windgusts: { name: "Wind Gusts", desc: "Push you sideways, affecting movement", pushDir: true }
    }
  },

  moonmarsh: {
    id: "moonmarsh", name: "Moonlight Marsh",
    emoji: "\u{1F319}",
    palette: { sky: "#1e1e2e", sky2: "#2e2e4e", ground: "#2a3a2a", accent: "#a888c8" },
    weather: ["fogbank", "lunarglow"],
    tileCode: BIOME_TILES.MARSHWATER,
    musicKey: "shadow",
    encounterRate: 0.15,
    creatures: ["willOWisp", "swampToad", "ghostMoth"],
    tools: ["ghostDetector", "fogCandle"],
    dialogue: {
      hero: ["It's quiet. Too quiet. I don't trust it."],
      companion: ["I trust it! The ghosts seem friendly!", "He just said hi! He's polite!"],
      banter: [
        "Hero: THAT WAS NOT FRIENDLY!",
        "(a ghost drifts through the hero)",
        "Hero: IT WALKED THROUGH ME. THAT IS A VIOLATION.",
        "Companion: He's shy! Give him time!"
      ]
    },
    weatherEffects: {
      fogbank: { name: "Fog Bank", desc: "Reduces visibility; enemies can ambush", visibility: 0.4, ambush: true },
      lunarglow: { name: "Lunar Glow", desc: "Increases luck and item drops", luckMult: 1.5, dropMult: 1.5 }
    }
  }
};

// BIOME_IDS is defined in constants.js
// Map biome id -> biome definition
function getBiome(id) {
  return BIOMES[id] || null;
}

// Current biome for a given map id (maps declare their biome; fallback by tile)
function currentBiome() {
  const map = (typeof currentMapData === "function") ? currentMapData() : null;
  if (map && map.biome) return getBiome(map.biome);
  return null;
}

// Roll a weather for the current biome (called on map entry)
function rollBiomeWeather(biomeId) {
  const b = getBiome(biomeId);
  if (!b || !b.weather || !b.weather.length) return null;
  return b.weather[Math.floor(Math.random() * b.weather.length)];
}

// Weather effect definition for current weather
function getWeatherEffect(biomeId, weatherId) {
  const b = getBiome(biomeId);
  if (!b || !b.weatherEffects) return null;
  return b.weatherEffects[weatherId] || null;
}

// Dialogue lines for entering a biome (returns array of lines for dialogue box)
function biomeEntryDialogue(biomeId) {
  const b = getBiome(biomeId);
  if (!b) return [];
  const lines = [];
  if (b.dialogue.hero && b.dialogue.hero.length) {
    lines.push("Hero: " + b.dialogue.hero[0]);
  }
  if (b.dialogue.companion && b.dialogue.companion.length) {
    lines.push("Companion: " + b.dialogue.companion[0]);
  }
  if (b.dialogue.banter) {
    b.dialogue.banter.forEach(l => lines.push(l));
  }
  return lines;
}

// New biome-specific creatures (mini-species, lighter than full SPECIES entries)
// These are added to the encounter pool for their biomes and have basic stats.
const BIOME_CREATURES = {
  magmaSlug: { name: "Magma Slug", type: "fire", color: "#c84818", shape: "round", baseHp: 50, baseAtk: 40, baseDef: 60, baseSpd: 20, moves: ["ember", "rockthrow"], dex: "A slow, explosive slug. It leaves a trail of cooling magma." },
  obsidianHawk: { name: "Obsidian Hawk", type: ["fire", "flying"], color: "#383028", shape: "winged", baseHp: 42, baseAtk: 70, baseDef: 45, baseSpd: 85, moves: ["gust", "firefang"], dex: "Flies above the lava flows, diving to scorch prey." },
  cyberPigeon: { name: "Cyber-Pigeon", type: ["electric", "flying"], color: "#48c8d8", shape: "winged", baseHp: 38, baseAtk: 55, baseDef: 40, baseSpd: 90, moves: ["sparkbolt", "gust"], dex: "Hack into your equipment and rearranges your inventory. Rude." },
  glitchHound: { name: "Glitch Hound", type: "electric", color: "#88f8ff", shape: "quad", baseHp: 55, baseAtk: 68, baseDef: 50, baseSpd: 78, moves: ["thunderjolt", "bite"], dex: "Phases in and out of visibility. Hard to pet. Worth it." },
  holographicMimic: { name: "Holographic Mimic", type: "electric", color: "#a8f8ff", shape: "round", baseHp: 48, baseAtk: 60, baseDef: 55, baseSpd: 40, moves: ["confusion", "sparkbolt"], dex: "Pretends to be a treasure chest. It is not a treasure chest. It is a problem." },
  crystalDeer: { name: "Crystal Deer", type: ["ice", "fairy"], color: "#d8b8ff", shape: "quad", baseHp: 60, baseAtk: 45, baseDef: 55, baseSpd: 70, moves: ["icebeam", "fairywind"], dex: "Its antlers heal allies automatically. Polite to a fault." },
  glowingSprite: { name: "Glowing Sprite", type: "fairy", color: "#f8e8a8", shape: "round", baseHp: 35, baseAtk: 50, baseDef: 40, baseSpd: 95, moves: ["fairywind", "confusion"], dex: "Casts random buffs. Sometimes on the enemy. Oops." },
  mossyGiant: { name: "Mossy Giant", type: ["grass", "rock"], color: "#5a8a3a", shape: "round", baseHp: 90, baseAtk: 60, baseDef: 80, baseSpd: 25, moves: ["vinewhip", "rockslide"], dex: "Slow, strong, and very, very sleepy. Cloudy days are not its thing." },
  scrapRat: { name: "Scrap Rat", type: "poison", color: "#8a8a6a", shape: "round", baseHp: 40, baseAtk: 65, baseDef: 35, baseSpd: 88, moves: ["sting", "bite"], dex: "Steals items with incredible speed. Petty. Effective." },
  metalWorm: { name: "Metal Worm", type: ["steel", "ground"], color: "#9a9aa8", shape: "spiky", baseHp: 70, baseAtk: 75, baseDef: 70, baseSpd: 30, moves: ["dig", "metalclaw"], dex: "Borrows underground and ambushes. Also borrows your tools." },
  junkGolem: { name: "Junk Golem", type: ["steel", "poison"], color: "#a89878", shape: "round", baseHp: 85, baseAtk: 70, baseDef: 75, baseSpd: 20, moves: ["sludgebomb", "metalclaw"], dex: "Small, numerous, and aggressively protective of its garbage hoard." },
  iceWolf: { name: "Ice Wolf", type: "ice", color: "#c8e0f8", shape: "quad", baseHp: 55, baseAtk: 72, baseDef: 50, baseSpd: 80, moves: ["icefang", "bite"], dex: "Hunts in packs. The cold is not a problem for them. It is a weapon." },
  snowYeti: { name: "Snow Yeti", type: ["ice", "fighting"], color: "#f0f8ff", shape: "round", baseHp: 100, baseAtk: 80, baseDef: 70, baseSpd: 35, moves: ["icefang", "karatechop"], dex: "Huge, intimidating, and surprisingly friendly. Will share its snacks." },
  glacierMoth: { name: "Glacier Moth", type: ["ice", "bug"], color: "#b8d8f8", shape: "winged", baseHp: 50, baseAtk: 60, baseDef: 60, baseSpd: 70, moves: ["icebeam", "bugbite"], dex: "Dusts enemies with freezing powder. Beautiful. Inconvenient." },
  glowingJellyfish: { name: "Glowing Jellyfish", type: ["water", "electric"], color: "#88f8e8", shape: "round", baseHp: 60, baseAtk: 50, baseDef: 60, baseSpd: 45, moves: ["bubble", "sparkbolt"], dex: "Paralyzes with a touch. Also glows. Multitasking." },
  anglerMimic: { name: "Angler Mimic", type: "water", color: "#1a4a6a", shape: "round", baseHp: 70, baseAtk: 75, baseDef: 55, baseSpd: 40, moves: ["bite", "watergun"], dex: "Hides in the dark, luring prey with a glowing lure. Then: ambush." },
  seaSerpent: { name: "Sea Serpent", type: ["water", "dragon"], color: "#2a6a9a", shape: "finned", baseHp: 95, baseAtk: 90, baseDef: 70, baseSpd: 65, moves: ["surf", "dragonbreath"], dex: "A boss-level threat of the deep. Respects nothing but strength." },
  thunderRhino: { name: "Thunder Rhino", type: ["electric", "ground"], color: "#b89858", shape: "quad", baseHp: 80, baseAtk: 85, baseDef: 75, baseSpd: 50, moves: ["sparkbolt", "earthquake"], dex: "Charges with the force of a thunderclap. Do not stand in front of it." },
  lightningBird: { name: "Lightning Bird", type: ["electric", "flying"], color: "#f8d848", shape: "winged", baseHp: 45, baseAtk: 70, baseDef: 40, baseSpd: 100, moves: ["thunderjolt", "drillbeak"], dex: "Dive-bombs from storm clouds, trailing electricity." },
  stormSpirit: { name: "Storm Spirit", type: ["electric", "ghost"], color: "#a8a8d8", shape: "round", baseHp: 55, baseAtk: 75, baseDef: 55, baseSpd: 85, moves: ["thunderbolt", "shadowball"], dex: "Floats through the storm, shooting lightning at random. Chaotic." },
  willOWisp: { name: "Will-o'-Wisp", type: ["fire", "ghost"], color: "#a8e8c8", shape: "round", baseHp: 35, baseAtk: 55, baseDef: 45, baseSpd: 90, moves: ["ember", "lick"], dex: "Lures travelers into traps with a friendly glow. Not friendly." },
  swampToad: { name: "Swamp Toad", type: ["water", "poison"], color: "#5a7a3a", shape: "round", baseHp: 70, baseAtk: 60, baseDef: 65, baseSpd: 30, moves: ["bubble", "toxinspit"], dex: "Giant, sticky, and slow. Surprisingly good at hide and seek." },
  ghostMoth: { name: "Ghost Moth", type: ["ghost", "bug"], color: "#c8c8e8", shape: "winged", baseHp: 45, baseAtk: 65, baseDef: 50, baseSpd: 75, moves: ["shadowball", "bugbite"], dex: "Invisible until it attacks. By then, you've already been moth'd." }
};

// Resolve a creature key: either a full SPECIES entry or a BIOME_CREATURES entry
function resolveCreatureKey(key) {
  if (typeof SPECIES !== "undefined" && SPECIES[key]) return SPECIES[key];
  if (BIOME_CREATURES[key]) return BIOME_CREATURES[key];
  return null;
}

// Get the encounter list for a biome (mix of biome creatures + base species)
function biomeEncounterList(biomeId) {
  const b = getBiome(biomeId);
  if (!b) return [];
  return b.creatures.slice();
}

// Biome tile color helper (for minimap / quick biome identification)
function biomeAccentColor(biomeId) {
  const b = getBiome(biomeId);
  return b ? b.palette.accent : "#888";
}
