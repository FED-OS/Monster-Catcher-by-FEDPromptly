// ============================================================
//  PROJECT HERO — Power-Up Tools & Equipment System
//  20+ physical tools that visually attach to creatures,
//  granting combat & traversal upgrades with comedy quirks.
// ============================================================

// Tool categories
const TOOL_CAT = {
  COMBAT: "combat",
  UTILITY: "utility",
  HEALING: "healing",
  LEGENDARY: "legendary"
};

// Each tool: id, name, category, rarity, price, icon (drawn procedural),
// equipSlot (back/eyes/head/hands/belt/accessory), combat/traversal effects,
// comedy quirk (flavor + chance of malfunction), sprite modifier key.
const POWERUP_TOOLS = {
  // ================= COMBAT & OFFENSIVE =================
  rocketBooster: {
    id: "rocketBooster", name: "Rocket Booster Harness", cat: TOOL_CAT.COMBAT,
    rarity: "rare", price: 1200, slot: "back",
    desc: "Dashes across gaps and plows through barriers.",
    effect: { dash: true, breakBarriers: true, spdBonus: 0.2 },
    quirk: "Occasionally backfires with smoke, launching the creature backwards.",
    quirkChance: 0.15,
    spriteMod: "rocket",
    overworld: { dash: true, smoke: true }
  },
  laserGoggles: {
    id: "laserGoggles", name: "Laser-Pointer Goggles", cat: TOOL_CAT.COMBAT,
    rarity: "rare", price: 1500, slot: "eyes",
    desc: "Fires high-velocity tracking lasers. Multi-hit damage with scanline FX.",
    effect: { multiHit: 3, laserBonus: 0.4, targetTracking: true },
    quirk: "Sometimes the lasers track the wrong target. Usually a nearby bush.",
    quirkChance: 0.1,
    spriteMod: "goggles"
  },
  goldenChefHat: {
    id: "goldenChefHat", name: "Golden Chef's Hat", cat: TOOL_CAT.COMBAT,
    rarity: "rare", price: 900, slot: "head",
    desc: "Tosses snacks during idle, healing self and allies. Sparkly green bursts.",
    effect: { idleHeal: 0.06, allyHeal: 0.04, snackToss: true },
    quirk: "Gets stuck in 'snack mode' and won't stop dispensing. Combat becomes a buffet.",
    quirkChance: 0.12,
    spriteMod: "chefhat"
  },
  bananaLauncher: {
    id: "bananaLauncher", name: "Banana Launcher", cat: TOOL_CAT.COMBAT,
    rarity: "common", price: 400, slot: "hands",
    desc: "Fires bananas that slip enemies, making them lose their turn.",
    effect: { slipChance: 0.5, tripStun: 1 },
    quirk: "Bananas bounce comically and sometimes ricochet back at the user.",
    quirkChance: 0.2,
    spriteMod: "banana"
  },
  confettiCannon: {
    id: "confettiCannon", name: "Confetti Cannon", cat: TOOL_CAT.COMBAT,
    rarity: "common", price: 350, slot: "hands",
    desc: "Stuns enemies with overwhelming celebration.",
    effect: { stunChance: 0.6, stunTurns: 1 },
    quirk: "Leaves glitter everywhere for the rest of the battle. Enemies hate it. So does the floor.",
    quirkChance: 1.0,
    spriteMod: "confetti"
  },
  spicyMeatball: {
    id: "spicyMeatball", name: "Spicy Meatball", cat: TOOL_CAT.COMBAT,
    rarity: "common", price: 300, slot: "hands",
    desc: "Giant flaming meatball on a stick. Fire damage + attracts wild creatures.",
    effect: { fireBonus: 0.3, attractWild: true },
    quirk: "Half the time, the companion eats it instead of using it. It was that good.",
    quirkChance: 0.5,
    spriteMod: "meatball"
  },
  rubberChickenSword: {
    id: "rubberChickenSword", name: "Rubber Chicken Sword", cat: TOOL_CAT.COMBAT,
    rarity: "uncommon", price: 700, slot: "hands",
    desc: "A squeaky chicken on a handle. Surprisingly high damage + humiliation.",
    effect: { atkBonus: 0.5, humiliation: true, squeak: true },
    quirk: "Enemies take emotional damage from being beaten by a chicken. Morale never recovers.",
    quirkChance: 1.0,
    spriteMod: "chicken"
  },

  // ================= UTILITY & EXPLORATION =================
  jetpackUmbrella: {
    id: "jetpackUmbrella", name: "Jetpack Umbrella", cat: TOOL_CAT.UTILITY,
    rarity: "uncommon", price: 800, slot: "back",
    desc: "Glide across gaps and slow falls.",
    effect: { glide: true, slowFall: true },
    quirk: "Occasionally backfires and launches the user straight upward. Into a tree. Usually.",
    quirkChance: 0.18,
    spriteMod: "umbrella",
    overworld: { glide: true }
  },
  magnetGloves: {
    id: "magnetGloves", name: "Magnet Gloves", cat: TOOL_CAT.UTILITY,
    rarity: "uncommon", price: 750, slot: "hands",
    desc: "Pull metal objects and disarm enemies.",
    effect: { disarm: 0.4, pull: true },
    quirk: "Sometimes attracts random trash from across the map. You are now carrying a toaster.",
    quirkChance: 0.15,
    spriteMod: "magnet",
    overworld: { pull: true }
  },
  echoWhistle: {
    id: "echoWhistle", name: "Echo Whistle", cat: TOOL_CAT.UTILITY,
    rarity: "uncommon", price: 600, slot: "accessory",
    desc: "Calls wild creatures to help in battle.",
    effect: { callAlly: true, allyChance: 0.5 },
    quirk: "Produces a noise so painful it also hurts your own ears. And the ally you called.",
    quirkChance: 0.3,
    spriteMod: "whistle"
  },
  pocketDimensionBag: {
    id: "pocketDimensionBag", name: "Pocket Dimension Bag", cat: TOOL_CAT.UTILITY,
    rarity: "rare", price: 2000, slot: "back",
    desc: "Stores unlimited items.",
    effect: { infiniteStorage: true },
    quirk: "Occasionally spits random objects back out at the worst possible times.",
    quirkChance: 0.1,
    spriteMod: "bag"
  },

  // ================= HEALING & SUPPORT =================
  snackDispenserHat: {
    id: "snackDispenserHat", name: "Snack Dispenser Hat", cat: TOOL_CAT.HEALING,
    rarity: "common", price: 500, slot: "head",
    desc: "Dispenses snacks. Restores HP over time.",
    effect: { regen: 0.04, regenTurns: 99 },
    quirk: "Gets stuck in 'snack mode' and won't stop dispensing. The floor is now a snack.",
    quirkChance: 0.2,
    spriteMod: "snackhat"
  },
  caffeineInjector: {
    id: "caffeineInjector", name: "Caffeine Injector", cat: TOOL_CAT.HEALING,
    rarity: "uncommon", price: 700, slot: "accessory",
    desc: "Boosts speed and reaction time.",
    effect: { spdBonus: 0.5, haste: 3 },
    quirk: "Companion becomes jittery and talks at 3x speed. Battle takes twice as long to read.",
    quirkChance: 1.0,
    spriteMod: "caffeine"
  },
  hugMachineBelt: {
    id: "hugMachineBelt", name: "Hug Machine Belt", cat: TOOL_CAT.HEALING,
    rarity: "uncommon", price: 650, slot: "belt",
    desc: "Mechanical arms provide free hugs that heal.",
    effect: { hugHeal: 0.1, hugAlly: 0.06 },
    quirk: "Hugs enemies by accident. They are deeply confused. Morale: unstable.",
    quirkChance: 0.25,
    spriteMod: "hugbelt"
  },
  pumpkinJuiceFlask: {
    id: "pumpkinJuiceFlask", name: "Pumpkin Juice Flask", cat: TOOL_CAT.HEALING,
    rarity: "common", price: 450, slot: "accessory",
    desc: "Restores MP and energy.",
    effect: { mpRestore: 30, energy: 0.3 },
    quirk: "Tastes disgusting. Companion complains audibly after every drink. For three turns.",
    quirkChance: 1.0,
    spriteMod: "flask"
  },

  // ================= RARE LEGENDARY =================
  mapsCompass: {
    id: "mapsCompass", name: "Map's Compass", cat: TOOL_CAT.LEGENDARY,
    rarity: "legendary", price: 5000, slot: "accessory",
    desc: "Points to secrets. Reveals hidden areas and treasures.",
    effect: { revealSecrets: true, treasureSense: true },
    quirk: "The compass has its own opinions and sometimes lies to you on purpose. It thinks it's funny.",
    quirkChance: 0.2,
    spriteMod: "compass",
    overworld: { reveal: true }
  },
  starFragment: {
    id: "starFragment", name: "Star Fragment", cat: TOOL_CAT.LEGENDARY,
    rarity: "legendary", price: 6000, slot: "accessory",
    desc: "Empowers ALL creatures in the party.",
    effect: { partyAtk: 0.2, partyDef: 0.15, partySpd: 0.1 },
    quirk: "Hums loudly and annoys nearby enemies into making mistakes. -10% enemy accuracy.",
    quirkChance: 1.0,
    spriteMod: "star"
  },
  musicalFlute: {
    id: "musicalFlute", name: "Musical Flute", cat: TOOL_CAT.LEGENDARY,
    rarity: "legendary", price: 4500, slot: "hands",
    desc: "Puts enemies to sleep or summons allies.",
    effect: { sleepChance: 0.5, summonAlly: 0.4 },
    quirk: "You can't play it well. It sounds horrible but works anyway. The irony is not lost on anyone.",
    quirkChance: 1.0,
    spriteMod: "flute"
  },
  photocopierStone: {
    id: "photocopierStone", name: "Photocopier Stone", cat: TOOL_CAT.LEGENDARY,
    rarity: "legendary", price: 7000, slot: "accessory",
    desc: "Duplicates items.",
    effect: { dupeChance: 0.15 },
    quirk: "Sometimes duplicates ENEMIES instead of items. You now have two of the problem.",
    quirkChance: 0.15,
    spriteMod: "copier"
  },

  // ================= BIOME-SPECIFIC TOOLS =================
  lavaBoots: {
    id: "lavaBoots", name: "Lava Boots", cat: TOOL_CAT.UTILITY,
    rarity: "rare", price: 1400, slot: "accessory",
    desc: "Walk on lava for a limited time. Reduces fire damage.",
    effect: { lavaWalk: true, fireResist: 0.5 },
    quirk: "They get HOT. After 10 steps you have to stop and let them cool. Comedy waiting animation.",
    quirkChance: 0.3,
    spriteMod: "lavaboots",
    biome: "volcano"
  },
  heatShielding: {
    id: "heatShielding", name: "Heat Shielding", cat: TOOL_CAT.HEALING,
    rarity: "uncommon", price: 800, slot: "back",
    desc: "Reduces fire damage significantly.",
    effect: { fireResist: 0.4 },
    quirk: "Makes the wearer sweaty and irritable. Grumpy dialogue for the whole volcano.",
    quirkChance: 1.0,
    spriteMod: "heatshield",
    biome: "volcano"
  },
  dataScrambler: {
    id: "dataScrambler", name: "Data Scrambler", cat: TOOL_CAT.COMBAT,
    rarity: "rare", price: 1600, slot: "hands",
    desc: "Disrupts enemy targeting systems.",
    effect: { confuseChance: 0.5, targetDisrupt: true },
    quirk: "Sometimes scrambles YOUR targeting too. You throw the ball at yourself. It doesn't work.",
    quirkChance: 0.1,
    spriteMod: "scrambler",
    biome: "cybercity"
  },
  holoCloak: {
    id: "holoCloak", name: "Holo-Cloak", cat: TOOL_CAT.UTILITY,
    rarity: "rare", price: 1800, slot: "back",
    desc: "Turns you invisible for 10 seconds.",
    effect: { invisibility: true, stealth: 10 },
    quirk: "The invisibility sometimes forgets to cloak your shadow. Enemies stare at a floating shadow.",
    quirkChance: 0.2,
    spriteMod: "holocloak",
    biome: "cybercity",
    overworld: { stealth: true }
  },
  crystalStaff: {
    id: "crystalStaff", name: "Crystal Staff", cat: TOOL_CAT.COMBAT,
    rarity: "rare", price: 1500, slot: "hands",
    desc: "Amplifies magic abilities.",
    effect: { magicBonus: 0.5, healBoost: 0.3 },
    quirk: "Glowing crystals are distracting. The creature stares at them mid-battle instead of attacking.",
    quirkChance: 0.12,
    spriteMod: "staff",
    biome: "crystalforest"
  },
  pollenBombs: {
    id: "pollenBombs", name: "Pollen Bombs", cat: TOOL_CAT.COMBAT,
    rarity: "uncommon", price: 600, slot: "hands",
    desc: "Confuses enemies with sweet-smelling clouds.",
    effect: { confuseChance: 0.6, sweetCloud: true },
    quirk: "Smells amazing. Everyone stops to sniff, including your own team. Battle delayed.",
    quirkChance: 0.3,
    spriteMod: "pollen",
    biome: "crystalforest"
  },
  magnetGauntlets: {
    id: "magnetGauntlets", name: "Magnet Gauntlets", cat: TOOL_CAT.UTILITY,
    rarity: "rare", price: 1300, slot: "hands",
    desc: "Pull metal objects from the environment.",
    effect: { pull: true, disarm: 0.5 },
    quirk: "Pulls EVERYTHING metal. You are now buried under scrap. Takes a turn to dig out.",
    quirkChance: 0.25,
    spriteMod: "magnetgauntlet",
    biome: "junkwaste",
    overworld: { pull: true }
  },
  trashCompactor: {
    id: "trashCompactor", name: "Trash Compactor", cat: TOOL_CAT.COMBAT,
    rarity: "rare", price: 1400, slot: "hands",
    desc: "Compresses enemies into small, portable cubes.",
    effect: { compress: true, defReduce: 0.5 },
    quirk: "Sometimes compresses a nearby friendly item by mistake. Your potion is now a tiny cube.",
    quirkChance: 0.15,
    spriteMod: "compactor",
    biome: "junkwaste"
  },
  iceSkates: {
    id: "iceSkates", name: "Ice Skates", cat: TOOL_CAT.UTILITY,
    rarity: "uncommon", price: 700, slot: "accessory",
    desc: "Move faster on frozen surfaces.",
    effect: { iceSpeed: 1.5 },
    quirk: "Hard to stop. The creature slides past its target and crashes into a snowbank. Repeatedly.",
    quirkChance: 0.2,
    spriteMod: "skates",
    biome: "glacialpeaks",
    overworld: { iceSpeed: true }
  },
  heatingCoil: {
    id: "heatingCoil", name: "Heating Coil", cat: TOOL_CAT.HEALING,
    rarity: "uncommon", price: 750, slot: "accessory",
    desc: "Keeps you warm and prevents freeze damage.",
    effect: { freezeImmune: true, regen: 0.02 },
    quirk: "Gets a little TOO warm. The companion complains about being 'medium-roasted.'",
    quirkChance: 1.0,
    spriteMod: "coil",
    biome: "glacialpeaks"
  },
  aquaBreathingMask: {
    id: "aquaBreathingMask", name: "Aqua-Breathing Mask", cat: TOOL_CAT.UTILITY,
    rarity: "rare", price: 1500, slot: "accessory",
    desc: "Unlimited underwater breathing.",
    effect: { waterBreath: true },
    quirk: "Makes the wearer talk like they're underwater. 'Blub blub blub.' It's annoying. It's also kind of cute.",
    quirkChance: 1.0,
    spriteMod: "aquamask",
    biome: "abyssal",
    overworld: { swim: true }
  },
  sonarBeacon: {
    id: "sonarBeacon", name: "Sonar Beacon", cat: TOOL_CAT.UTILITY,
    rarity: "rare", price: 1400, slot: "accessory",
    desc: "Reveals hidden enemies in the dark.",
    effect: { revealHidden: true },
    quirk: "Pings constantly. You now have a soundtrack of 'PING' for the entire dive.",
    quirkChance: 1.0,
    spriteMod: "sonar",
    biome: "abyssal"
  },
  lightningRod: {
    id: "lightningRod", name: "Lightning Rod", cat: TOOL_CAT.COMBAT,
    rarity: "rare", price: 1600, slot: "hands",
    desc: "Absorbs lightning and converts to energy.",
    effect: { absorbElectric: true, energyGain: 0.5 },
    quirk: "Also attracts lightning. The creature becomes a walking lightning target. It's a feature.",
    quirkChance: 1.0,
    spriteMod: "rod",
    biome: "stormsavanna"
  },
  stormShield: {
    id: "stormShield", name: "Storm Shield", cat: TOOL_CAT.HEALING,
    rarity: "rare", price: 1500, slot: "back",
    desc: "Protects against wind and electricity.",
    effect: { windResist: 0.6, electricResist: 0.5 },
    quirk: "The shield is so big the creature can't see around it. Walks into things. A lot.",
    quirkChance: 0.2,
    spriteMod: "stormshield",
    biome: "stormsavanna"
  },
  ghostDetector: {
    id: "ghostDetector", name: "Ghost Detector", cat: TOOL_CAT.UTILITY,
    rarity: "rare", price: 1400, slot: "hands",
    desc: "Reveals invisible enemies.",
    effect: { revealInvisible: true, ghostSense: true },
    quirk: "Goes off CONSTANTLY. Even when there are no ghosts. Especially then. Paranoia mode: engaged.",
    quirkChance: 1.0,
    spriteMod: "ghostdetector",
    biome: "moonmarsh"
  },
  fogCandle: {
    id: "fogCandle", name: "Fog Candle", cat: TOOL_CAT.UTILITY,
    rarity: "uncommon", price: 600, slot: "accessory",
    desc: "Clears fog in a small radius.",
    effect: { clearFog: true, radius: 3 },
    quirk: "Blows out randomly in the wind. You relight it. It blows out. This is the relationship now.",
    quirkChance: 0.25,
    spriteMod: "candle",
    biome: "moonmarsh",
    overworld: { clearFog: true }
  }
};

const TOOL_IDS = Object.keys(POWERUP_TOOLS);

// Equip slots a creature can have (max 3 tools equipped)
const EQUIP_SLOTS = ["back", "eyes", "head", "hands", "belt", "accessory"];
const MAX_EQUIPPED = 3;

// Get tool def safely
function getTool(id) {
  return POWERUP_TOOLS[id] || null;
}

// Tools available in the shop (base set; biome tools found in-world)
const SHOP_TOOLS = [
  "bananaLauncher", "confettiCannon", "spicyMeatball", "rubberChickenSword",
  "jetpackUmbrella", "magnetGloves", "echoWhistle",
  "snackDispenserHat", "caffeineInjector", "hugMachineBelt", "pumpkinJuiceFlask"
];

// Equip a tool to a monster (if slot free and under max)
function equipTool(monster, toolId) {
  const tool = getTool(toolId);
  if (!tool) return false;
  if (!monster.equipped) monster.equipped = [];
  if (monster.equipped.length >= MAX_EQUIPPED) return false;
  if (monster.equipped.includes(toolId)) return false;
  // only one tool per slot
  const conflict = monster.equipped.some(tid => {
    const t = getTool(tid);
    return t && t.slot === tool.slot;
  });
  if (conflict) return false;
  monster.equipped.push(toolId);
  return true;
}

function unequipTool(monster, toolId) {
  if (!monster.equipped) return false;
  const idx = monster.equipped.indexOf(toolId);
  if (idx < 0) return false;
  monster.equipped.splice(idx, 1);
  return true;
}

// Aggregate the combat bonuses from a monster's equipped tools
function toolStatBonus(monster, stat) {
  if (!monster.equipped || !monster.equipped.length) return 1;
  let mult = 1;
  monster.equipped.forEach(tid => {
    const t = getTool(tid);
    if (!t || !t.effect) return;
    if (stat === "atk" && t.effect.atkBonus) mult += t.effect.atkBonus;
    if (stat === "atk" && t.effect.laserBonus) mult += t.effect.laserBonus * 0.5;
    if (stat === "atk" && t.effect.fireBonus) mult += t.effect.fireBonus * 0.3;
    if (stat === "atk" && t.effect.magicBonus) mult += t.effect.magicBonus * 0.3;
    if (stat === "spd" && t.effect.spdBonus) mult += t.effect.spdBonus;
    if (stat === "spd" && t.effect.haste) mult += 0.3;
    if (stat === "def" && t.effect.fireResist) {/* handled in damage calc */}
  });
  return mult;
}

// Check if a monster has a tool granting a specific flag
function hasToolFlag(monster, flag) {
  if (!monster.equipped || !monster.equipped.length) return false;
  return monster.equipped.some(tid => {
    const t = getTool(tid);
    return t && t.effect && t.effect[flag];
  });
}

// Roll a tool's comedy quirk; returns true if it triggers this turn
function rollToolQuirk(monster) {
  if (!monster.equipped || !monster.equipped.length) return null;
  for (const tid of monster.equipped) {
    const t = getTool(tid);
    if (!t || !t.quirkChance) continue;
    if (Math.random() < t.quirkChance) return t;
  }
  return null;
}

// Find a tool in a specific biome (for scattering loot)
function toolsForBiome(biomeId) {
  return TOOL_IDS.filter(id => POWERUP_TOOLS[id].biome === biomeId);
}

// Random tool drop table by rarity weight
const RARITY_WEIGHT = { common: 50, uncommon: 25, rare: 10, legendary: 2 };
function randomToolDrop(biomeId) {
  let pool = TOOL_IDS;
  if (biomeId) {
    const biomeTools = toolsForBiome(biomeId);
    // 60% chance biome-specific, 40% general
    if (biomeTools.length && Math.random() < 0.6) pool = biomeTools;
  }
  // weighted by rarity
  const weighted = [];
  pool.forEach(id => {
    const t = POWERUP_TOOLS[id];
    const w = RARITY_WEIGHT[t.rarity] || 10;
    for (let i = 0; i < w; i++) weighted.push(id);
  });
  return weighted[Math.floor(Math.random() * weighted.length)] || "bananaLauncher";
}
