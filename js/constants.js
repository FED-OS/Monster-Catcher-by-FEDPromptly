// ============================================================
//  Monster Catcher — Constants  (GBA Edition v3.0)
//  Upgraded to Game Boy Advance native resolution (240x160),
//  a rich 15-bit-style color system, and expanded game constants.
// ============================================================

// ---- GBA NATIVE RESOLUTION ----
// The real Game Boy Advance display is 240x160 px (15-bit color).
// We render at native res and upscale via CSS (pixelated) for crispness.
const SCREEN_W = 240;
const SCREEN_H = 160;
const TILE = 16;                 // 16x16 px tiles (same as before, more on screen)
const COLS = SCREEN_W / TILE;    // 15 columns visible
const ROWS = SCREEN_H / TILE;    // 10 rows visible

// ---- CORE 4-SHADE PALETTE (kept for legacy / classic theme) ----
// Still used as the "ink" ramp for text & UI outlines. Themes in
// palettes.js can swap these. Default = a GBA-friendly green.
const PALETTE = {
  light:  "#e0f8d0",
  mid:    "#88c070",
  dark:   "#346856",
  black:  "#081820"
};

// ---- GBA COLOR SYSTEM ----
// A broad palette of named colors inspired by GBA-era pixel art
// (Pokémon Ruby/Sapphire / FireRed era). Used by sprites, tiles, UI.
const COLOR = {
  // UI inks (kept compatible with PALETTE)
  inkLight:  "#e0f8d0",
  inkMid:    "#88c070",
  inkDark:   "#346856",
  inkBlack:  "#081820",

  // Window / panel
  winBg:     "#f8f8f8",
  winBgDark: "#c0c0d0",
  winBorder: "#3858a0",
  winBorderLight: "#6890d8",
  winShadow: "#787878",

  // Text
  textDark:  "#383830",
  textLight: "#ffffff",
  textShadow:"#586870",

  // Health bar
  hpGreen:   "#48d858",
  hpYellow:  "#f8c018",
  hpRed:     "#f84038",
  hpBg:      "#484848",

  // XP bar
  xpBlue:    "#48a8f8",

  // Terrain / nature — upgraded richer GBA palette
  grassLight:"#90d868",
  grassMid:  "#60b048",
  grassDark: "#3c8838",
  grassDeep: "#2c6828",
  tallGrass1:"#58c060",
  tallGrass2:"#349838",
  tallGrass3:"#1c7828",
  tallGrassLite:"#78e078",
  pathLight: "#e8dcb0",
  pathMid:   "#d0c090",
  pathDark:  "#a89868",
  pathEdge:  "#887848",
  sandLight: "#f0e8b8",
  sandMid:   "#d8c890",
  sandDark:  "#c0b070",
  treeLeaf1: "#58c850",
  treeLeaf2: "#38a838",
  treeLeaf3: "#208828",
  treeLeaf4: "#106818",
  treeLeafLite:"#80e870",
  treeBark:  "#785030",
  treeBarkD: "#503018",
  water1:    "#68d0f8",
  water2:    "#48b0e8",
  water3:    "#2890c8",
  waterDeep: "#1860a8",
  waterFoam: "#b8ecff",
  flowerRed: "#e85048",
  flowerYellow:"#f8d838",
  flowerPink: "#f8a8c0",
  flowerCenter:"#f8e858",
  rock1:     "#b8b0a0",
  rock2:     "#908878",
  rock3:     "#686058",
  rockD:     "#484038",
  caveFloor1:"#605850",
  caveFloor2:"#484038",
  caveWall1: "#484858",
  caveWall2: "#383848",
  caveWall3: "#282838",
  snow1:     "#f8fcff",
  snow2:     "#d8e8f8",
  snow3:     "#a8c8e8",
  snowShade: "#88a8c8",
  ice1:      "#b8e8f8",
  ice2:      "#88c8e8",
  ice3:      "#58a8d8",

  // Buildings / structures
  roofRed:   "#c84838",
  roofRedD:  "#a83028",
  roofBlue:  "#4878c8",
  roofBlueD: "#2858a8",
  wallCream: "#f8e8c8",
  wallCreamD:"#d8c8a8",
  doorDark:  "#583818",
  doorLight: "#886838",
  windowLit: "#f8d868",

  // Signs / mats
  signWood:  "#886838",
  signWoodD: "#584020",
  matHealR:  "#f84848",
  matHealW:  "#f8f8f8",
  matShopB:  "#3878d8",
  matGym1:   "#7878d8",
  matGym2:   "#4848a8",

  // Fences / crops / ledges
  fenceWood:  "#a88848",
  fenceWoodD: "#684828",
  fenceWoodL: "#d0b070",
  cropSoil:   "#6a4828",
  cropSoilD:  "#4a3018",
  cropStalk:  "#58a838",
  cropStalkD: "#387820",
  cropGrain:  "#f0d868",

  // Player sprite
  skin:      "#f8c898",
  skinShade: "#d8a878",
  hair:      "#684830",
  hairShade: "#483018",
  shirtRed:  "#e84038",
  shirtRedD: "#b82820",
  pantsBlue: "#3858b8",
  pantsBlueD:"#283890",
  shoes:     "#683818",

  // Sky / overworld backdrops
  skyDay:    "#78c8f8",
  skyDay2:   "#a8e0f8",
  skyDawn:   "#f8b878",
  skyDusk:   "#f88848",
  skyNight:  "#182848",
  skyNight2: "#283868"
};

// ---- TYPE ACCENT COLORS (battle badges / type tags) ----
// Slightly more saturated, GBA-era tones.
const ACCENT = {
  fire:     "#f87838",
  water:    "#4890f8",
  grass:    "#58c858",
  electric: "#f8d818",
  ground:   "#e0c068",
  flying:   "#a8c0e8",
  poison:   "#a040a0",
  normal:   "#c8c0b0",
  ice:      "#98d8f8",
  rock:     "#b8a878",
  bug:      "#a8b838",
  psychic:  "#f85888",
  ghost:    "#7858a8",
  dark:     "#685048",
  dragon:   "#8858f8",
  steel:    "#b8b8d0",
  fairy:    "#f8a8c8",
  fighting: "#c85838"
};

const GAME_STATE = {
  TITLE:     "title",
  OVERWORLD: "overworld",
  BATTLE:    "battle",
  MENU:      "menu",
  SHOP:      "shop"
};

// Persistent flag keys used by the story / progression system.
const FLAGS = {
  CHOSEN_STARTER:   "chosenStarter",
  CHOSEN_HERO:      "chosenHero",
  RIVAL_1_DEFEATED: "rival1Defeated",
  RIVAL_2_DEFEATED: "rival2Defeated",
  RIVAL_3_DEFEATED: "rival3Defeated",
  GYM_1_DEFEATED:   "gym1Defeated",
  GYM_2_DEFEATED:   "gym2Defeated",
  GYM_3_DEFEATED:   "gym3Defeated",
  GOT_FIRST_BALLS:  "gotFirstBalls",
  GOT_ROD:          "gotRod",
  GOT_HM_SURF:      "gotHmSurf",
  TEAM_ROCKET_INTRO:"teamRocketIntro",
  ELITE_INTRO:      "eliteIntro",
  CHAMPION_DEFEATED:"championDefeated",
  // Mega-expansion flags
  KRAX_DEFEATED_1:  "kraxDefeated1",
  KRAX_DEFEATED_2:  "kraxDefeated2",
  KRAX_DEFEATED_3:  "kraxDefeated3",
  BOSS_INTRO:       "bossIntro",
  BOSS_DEFEATED:    "bossDefeated",
  BOSS_SPARED:      "bossSpared",
  BOSS_HUGGED:      "bossHugged",
  BIOME_VOLCANO:    "biomeVolcanoUnlocked",
  BIOME_CYBER:      "biomeCyberUnlocked",
  BIOME_CRYSTAL:    "biomeCrystalUnlocked",
  BIOME_JUNK:       "biomeJunkUnlocked",
  BIOME_GLACIAL:    "biomeGlacialUnlocked",
  BIOME_ABYSSAL:    "biomeAbyssalUnlocked",
  BIOME_STORM:      "biomeStormUnlocked",
  BIOME_MARSH:      "biomeMarshUnlocked",
  FAST_TRAVEL:      "fastTravelUnlocked",
  TUTORIAL_DONE:    "tutorialDone"
};

// Type list (used for dex / type badge rendering)
const ALL_TYPES = [
  "normal","fire","water","grass","electric","ground","flying","poison",
  "ice","rock","bug","psychic","ghost","dark","dragon","steel","fairy","fighting"
];

// ---- MEGA EXPANSION CONSTANTS ----

// Elemental type IDs (see elements.js for full data)
const ELEMENT_IDS = ["pyro","cyber","magic","junk","frost","shadow"];

// Evolution stages
const EVO_STAGE = { ROOKIE: 1, PRODIGY: 2, APEX: 3 };

// Power-up equip slots (see powerups.js)
const EQUIP_SLOTS_CONST = ["back","eyes","head","hands","belt","accessory"];
const MAX_EQUIPPED_TOOLS = 3;

// Biome IDs (see biomes.js for full data)
const BIOME_IDS = ["volcano","cybercity","crystalforest","junkwaste","glacialpeaks","abyssal","stormsavanna","moonmarsh"];

// World creature states (see worldcreatures.js)
const WC_STATE_CONST = { WANDER:"wander", SLEEP:"sleep", ALERT:"alert", FLEE:"flee", STALK:"stalk" };

// New tile codes for biomes (start at 30 to avoid collision with world.js 0-14)
const TILE_LAVA        = 30;
const TILE_NEON        = 31;
const TILE_CRYSTAL     = 32;
const TILE_SCRAP       = 33;
const TILE_DEEPICE     = 34;
const TILE_DEEPWATER   = 35;
const TILE_STORMGRASS  = 36;
const TILE_MARSHWATER  = 37;
const TILE_MUSHROOM    = 38;
const TILE_HOLOPANEL   = 39;
const TILE_VOLCANOROCK = 40;
const TILE_CYBERWALL   = 41;

// Friendship / affection thresholds
const FRIENDSHIP_HATCH = 0;
const FRIENDSHIP_LOW = 50;
const FRIENDSHIP_MID = 150;
const FRIENDSHIP_HIGH = 220;
const FRIENDSHIP_MAX = 255;
