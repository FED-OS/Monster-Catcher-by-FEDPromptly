// ============================================================
//  PROJECT HERO — Elemental Evolution Types
//  6 elemental paths chosen at Stage 2 evolution. Permanently
//  alters appearance, abilities, personality, and unlocks a
//  screen-shattering Stage 3 ultimate move.
// ============================================================

// Each element: id, name, emoji, accent colors (for auras/trails),
// visual descriptors, ability bonuses, personality, stage2/stage3 names,
// ultimate move definition, and the sprite modifiers applied at render.
const ELEMENTS = {
  pyro: {
    id: "pyro",
    name: "Pyro",
    label: "Fire & Fury",
    emoji: "\u{1F525}",
    primary: "#f87838",
    secondary: "#ffb048",
    glow: "rgba(248,120,56,0.45)",
    trail: ["#f87838", "#ffb048", "#f8d818"],
    footprint: "rgba(248,88,24,0.5)",
    visual: "Flaming manes, ember trails, charcoal-blackened accents",
    ability: { atk: 1.25, burnBonus: 0.15, name: "Blaze Core" },
    abilityDesc: "+25% Attack. Fire moves +15% burn chance.",
    personality: "Dramatic, hot-tempered, always challenging others to a duel",
    stage2Name: "Inferno Knight",
    stage3Name: "Inferno Lord",
    stage3Alt: "Ember Monarch",
    aura: "fire swirls",
    // sprite mods: mane flicker, ember particles, darkened body
    mods: { aura: "fire", dark: 0.18, trail: true, mane: true, armor: "ember" },
    ultimate: {
      name: "SUPERNOVA BURST",
      shortName: "Supernova",
      power: 150,
      type: "fire",
      category: "special",
      target: "all-enemies",
      desc: "A cataclysmic sun erupts, scorching every enemy. The screen turns white as everything burns.",
      cooldown: 5,
      anim: "supernova"
    },
    flavor: "Chooses violence. Also chooses violence for breakfast."
  },

  cyber: {
    id: "cyber",
    name: "Cyber",
    label: "Tech & Electricity",
    emoji: "\u26A1",
    primary: "#48e0d8",
    secondary: "#88f8ff",
    glow: "rgba(72,224,216,0.45)",
    trail: ["#48e0d8", "#88f8ff", "#48a8f8"],
    footprint: "rgba(72,224,216,0.5)",
    visual: "Neon circuits, holographic wings, glowing LED eyes",
    ability: { spd: 1.35, name: "Overclock", hackChance: 0.2 },
    abilityDesc: "+35% Speed. 20% chance to 'hack' an enemy, disabling their next move.",
    personality: "Obsessed with efficiency, speaks in memes, constantly rebooting",
    stage2Name: "Code Sentinel",
    stage3Name: "Code Overlord",
    stage3Alt: "Digital Phantom",
    aura: "electric arcs",
    mods: { aura: "electric", circuits: true, ledEyes: true, hologram: true, trail: true },
    ultimate: {
      name: "SYSTEM SHUTDOWN",
      shortName: "Shutdown",
      power: 120,
      type: "electric",
      category: "special",
      target: "all-enemies",
      desc: "Green code rain floods the field. Enemy AI overloads — damage plus all enemies lose their next turn.",
      cooldown: 4,
      anim: "shutdown",
      disableTurns: 1
    },
    flavor: "Has never felt a single emotion and is thriving."
  },

  magic: {
    id: "magic",
    name: "Magic",
    label: "Mystic & Nature",
    emoji: "\u{1F33F}",
    primary: "#a878f8",
    secondary: "#d8b8ff",
    glow: "rgba(168,120,248,0.45)",
    trail: ["#a878f8", "#d8b8ff", "#f8a8e8"],
    footprint: "rgba(168,120,248,0.5)",
    visual: "Glowing runes, flower crowns, ethereal ribbons",
    ability: { spdef: 1.3, healAura: 0.05, name: "Verdant Soul" },
    abilityDesc: "+30% Sp.Def. Heals the party 5% HP each turn.",
    personality: "Dramatic, speaks in riddles, claims to be 4,000 years old but acts like a toddler",
    stage2Name: "Rune Sage",
    stage3Name: "Archmage Sovereign",
    stage3Alt: "Verdant Prophet",
    aura: "cosmic stardust",
    mods: { aura: "magic", runes: true, flowerCrown: true, ribbons: true, trail: true },
    ultimate: {
      name: "FORCE OF NATURE",
      shortName: "Force",
      power: 130,
      type: "grass",
      category: "special",
      target: "all",
      desc: "A giant glowing tree erupts from the ground. Heals all allies fully, damages all enemies, and buffs the party.",
      cooldown: 6,
      anim: "force",
      healParty: 1.0,
      buffParty: { atk: 1, def: 1 }
    },
    flavor: "Will absolutely cast 'fix your life' on you. It won't work."
  },

  junk: {
    id: "junk",
    name: "Junk",
    label: "Trash & Chaos",
    emoji: "\u{1F5D1}",
    primary: "#98a878",
    secondary: "#c8d8a0",
    glow: "rgba(152,168,120,0.4)",
    trail: ["#98a878", "#c8d8a0", "#a8a060"],
    footprint: "rgba(120,128,90,0.5)",
    visual: "Garbage accessories, duct-taped armor, mismatched parts",
    ability: { statusChance: 0.3, name: "Junk Spirit", dupeChance: 0.1 },
    abilityDesc: "All attacks have +30% to inflict a random status. 10% chance to duplicate a random bag item each battle.",
    personality: "Gross but lovable, hoards garbage, once ate a shoe and gained power",
    stage2Name: "Scrap Brute",
    stage3Name: "Trash Titan",
    stage3Alt: "Scrap Emperor",
    aura: "trash cyclone",
    mods: { aura: "junk", ductTape: true, mismatch: true, trash: true, trail: true },
    ultimate: {
      name: "CHAOS TORNADO",
      shortName: "Chaos",
      power: 0,
      type: "poison",
      category: "special",
      target: "all-enemies",
      desc: "A cyclone of trash engulfs enemies. Inflicts confusion, poison, AND a random debuff on every enemy. Pure chaos.",
      cooldown: 3,
      anim: "chaos",
      randomStatus: ["confusion", "poison", "burn", "paralysis"],
      randomDebuff: true
    },
    flavor: "Found a half-eaten sandwich in a dungeon. Best day of its life."
  },

  frost: {
    id: "frost",
    name: "Frost",
    label: "Ice & Precision",
    emoji: "\u2744\uFE0F",
    primary: "#98d8f8",
    secondary: "#d8f0ff",
    glow: "rgba(152,216,248,0.45)",
    trail: ["#98d8f8", "#d8f0ff", "#ffffff"],
    footprint: "rgba(152,216,248,0.5)",
    visual: "Crystalline armor, frost breath, snowflake patterns",
    ability: { def: 1.3, freezeBonus: 0.2, name: "Permafrost" },
    abilityDesc: "+30% Defense. Ice moves +20% freeze chance.",
    personality: "Calm, cold, delivers deadpan insults with zero emotion",
    stage2Name: "Glacier Guard",
    stage3Name: "Permafrost King",
    stage3Alt: "Glacial Queen",
    aura: "frost shards",
    mods: { aura: "frost", crystal: true, frostBreath: true, snowflake: true, trail: true },
    ultimate: {
      name: "ABSOLUTE ZERO",
      shortName: "Absolute Zero",
      power: 140,
      type: "ice",
      category: "special",
      target: "all-enemies",
      desc: "The temperature plunges. Ice shatters across the screen as all enemies are frozen solid for 2 turns.",
      cooldown: 5,
      anim: "absolutezero",
      freezeTurns: 2
    },
    flavor: "Told the hero their outfit was 'bold.' It was not a compliment."
  },

  shadow: {
    id: "shadow",
    name: "Shadow",
    label: "Darkness & Stealth",
    emoji: "\u{1F480}",
    primary: "#7858a8",
    secondary: "#a888c8",
    glow: "rgba(120,88,168,0.5)",
    trail: ["#7858a8", "#a888c8", "#382858"],
    footprint: "rgba(60,40,80,0.5)",
    visual: "Smoke aura, glowing red eyes, cloak of darkness",
    ability: { critBonus: 0.25, evasion: 0.15, name: "Void Veil" },
    abilityDesc: "+25% critical hit chance. 15% evasion against all attacks.",
    personality: "Edgy teenager energy. 'It's not a phase, Mom.' Constantly brooding.",
    stage2Name: "Night Stalker",
    stage3Name: "Nightmare Sovereign",
    stage3Alt: "Void Walker",
    aura: "darkness smoke",
    mods: { aura: "shadow", redEyes: true, cloak: true, smoke: true, trail: true },
    ultimate: {
      name: "VOID EMBRACE",
      shortName: "Void",
      power: 135,
      type: "ghost",
      category: "special",
      target: "all-enemies",
      desc: "Darkness swallows the screen. Glowing red eyes appear. Deals damage, steals all enemy buffs, and self-heals.",
      cooldown: 4,
      anim: "void",
      stealBuffs: true,
      selfHeal: 0.5
    },
    flavor: "Writes poetry. It's bad. Nobody tells it."
  }
};

// ELEMENT_IDS is defined in constants.js
// Map element -> a representative battle type for move-type matching
const ELEMENT_BATTLE_TYPE = {
  pyro: "fire",
  cyber: "electric",
  magic: "grass",
  junk: "poison",
  frost: "ice",
  shadow: "ghost"
};

// Evolution stage thresholds (XP-based, also gated by level)
// Stage 1 -> Stage 2 at level 16 OR 600 XP (and an element must be chosen)
// Stage 2 -> Stage 3 at level 36 OR 4000 XP
const EVOLUTION = {
  STAGE2_LEVEL: 16,
  STAGE2_XP: 600,
  STAGE3_LEVEL: 36,
  STAGE3_XP: 4000
};

// Get element definition safely
function getElement(id) {
  return ELEMENTS[id] || null;
}

// Pick a random element (used for wild evolved creatures or RNG events)
function randomElement() {
  return ELEMENT_IDS[Math.floor(Math.random() * ELEMENT_IDS.length)];
}

// Apply element ability bonuses to a monster's effective stat.
// Called from battle.js effectiveStat when a monster has an element.
function elementStatBonus(monster, stat) {
  if (!monster.element) return 1;
  const el = ELEMENTS[monster.element];
  if (!el || !el.ability) return 1;
  const a = el.ability;
  switch (stat) {
    case "atk":  return a.atk  || 1;
    case "spd":  return a.spd  || 1;
    case "def":  return a.def  || 1;
    case "spdef":return a.spdef|| 1;
    default: return 1;
  }
}

// Apply an element to a monster (Stage 2 evolution choice).
// Permanently transforms stats, adds element key, unlocks ultimate.
function applyElement(monster, elementId) {
  const el = ELEMENTS[elementId];
  if (!el) return false;
  monster.element = elementId;
  monster.evolutionStage = 2;
  // rename to stage2 name
  if (monster.speciesName) {
    monster.stageName = el.stage2Name;
  }
  // unlock the ultimate move (added as a 5th move slot)
  if (!monster.moves.includes("__ULT__")) {
    monster.moves.push("__ULT__");
    monster.pp["__ULT__"] = 1; // ultimates use a cooldown, tracked separately
    monster.maxPp["__ULT__"] = 1;
  }
  monster.ultCooldown = 0;
  // stat bump for evolving
  monster.maxHp = Math.floor(monster.maxHp * 1.2);
  monster.hp = monster.maxHp;
  return true;
}

// Advance to Stage 3 (Apex Mythic). Requires Stage 2 element + threshold.
function applyStage3(monster) {
  if (!monster.element) return false;
  const el = ELEMENTS[monster.element];
  if (!el) return false;
  monster.evolutionStage = 3;
  monster.stageName = el.stage3Name;
  // big stat bump
  monster.maxHp = Math.floor(monster.maxHp * 1.3);
  monster.hp = monster.maxHp;
  // reset ult cooldown (it's fresh and ready)
  monster.ultCooldown = 0;
  return true;
}

// Check if a monster is ready to evolve (returns stage number to evolve to, or 0)
function checkEvolutionReady(monster) {
  if (monster.evolutionStage >= 3) return 0;
  if (!monster.evolutionStage || monster.evolutionStage === 1) {
    if (monster.level >= EVOLUTION.STAGE2_LEVEL && monster.xp >= EVOLUTION.STAGE2_XP) {
      return 2;
    }
  }
  if (monster.evolutionStage === 2) {
    if (monster.level >= EVOLUTION.STAGE3_LEVEL && monster.xp >= EVOLUTION.STAGE3_XP) {
      return 3;
    }
  }
  return 0;
}

// Resolve an ultimate move execution for a given element.
// Returns a structured effect object the battle system consumes.
function resolveUltimate(elementId, attacker, enemies, allies) {
  const el = ELEMENTS[elementId];
  if (!el || !el.ultimate) return null;
  const u = el.ultimate;
  const effects = {
    name: u.name,
    power: u.power,
    type: u.type,
    target: u.target,
    anim: u.anim,
    damage: u.power,
    freezeTurns: u.freezeTurns || 0,
    disableTurns: u.disableTurns || 0,
    healParty: u.healParty || 0,
    buffParty: u.buffParty || null,
    stealBuffs: !!u.stealBuffs,
    selfHeal: u.selfHeal || 0,
    randomStatus: u.randomStatus || null,
    randomDebuff: !!u.randomDebuff
  };
  return effects;
}
