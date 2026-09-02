// ============================================================
//  Monster Catcher — Monsters
//  Species, moves, types, abilities, items, leveling, evolution,
//  status effects, stat stages, and battle math.
// ============================================================

// ---------------------------------------------------------------
//  STATUS CONDITIONS (applied to a monster during battle)
// ---------------------------------------------------------------
const STATUS = {
  NONE:        "none",
  BURN:        "burn",        // halves physical attack damage, ticks HP each turn
  POISON:      "poison",      // ticks HP each turn
  PARALYSIS:   "paralysis",   // 25% chance to skip turn, quarters speed
  SLEEP:       "sleep",       // cannot act for 1-4 turns
  FREEZE:      "freeze",      // cannot act until thaw (20% chance per turn)
  CONFUSION:   "confusion",   // 33% chance to hit self, lasts 1-4 turns
  TOXIC:       "toxic"        // escalating poison (counts as poison but worse)
};

// Human-readable labels for UI
const STATUS_LABELS = {
  burn: "BRN", poison: "PSN", paralysis: "PAR", sleep: "SLP",
  freeze: "FRZ", confusion: "CNF", toxic: "TOX"
};

// ---------------------------------------------------------------
//  MOVE CATEGORIES
// ---------------------------------------------------------------
const MOVE_CATEGORY = {
  PHYSICAL: "physical",
  SPECIAL:  "special",
  STATUS:   "status"
};

// ---------------------------------------------------------------
//  MOVES  (power, accuracy, type, category, PP, effects)
// ---------------------------------------------------------------
const MOVES = {
  // ---- Normal ----
  tackle:      { name: "Tackle",      power: 40,  accuracy: 100, type: "normal",   category: MOVE_CATEGORY.PHYSICAL, pp: 35 },
  bite:        { name: "Bite",        power: 60,  accuracy: 100, type: "normal",   category: MOVE_CATEGORY.PHYSICAL, pp: 25, flinch: 10 },
  scratch:     { name: "Scratch",     power: 40,  accuracy: 100, type: "normal",   category: MOVE_CATEGORY.PHYSICAL, pp: 35 },
  bodyslam:    { name: "Body Slam",   power: 85,  accuracy: 100, type: "normal",   category: MOVE_CATEGORY.PHYSICAL, pp: 15, flinch: 30 },
  quickattack: { name: "Quick Atk",   power: 40,  accuracy: 100, type: "normal",   category: MOVE_CATEGORY.PHYSICAL, pp: 30, priority: 1 },
  hyperbeam:   { name: "Hyper Beam",  power: 150, accuracy: 90,  type: "normal",   category: MOVE_CATEGORY.SPECIAL,  pp: 5,  recharge: true },
  growl:       { name: "Growl",       power: 0,   accuracy: 100, type: "normal",   category: MOVE_CATEGORY.STATUS,   pp: 40, stat: {target:"enemy",stat:"atk",stages:-1} },
  tailwhip:    { name: "Tail Whip",   power: 0,   accuracy: 100, type: "normal",   category: MOVE_CATEGORY.STATUS,   pp: 30, stat: {target:"enemy",stat:"def",stages:-1} },
  leer:        { name: "Leer",        power: 0,   accuracy: 100, type: "normal",   category: MOVE_CATEGORY.STATUS,   pp: 30, stat: {target:"enemy",stat:"def",stages:-1} },
  focusenergy: { name: "Focus",       power: 0,   accuracy: 100, type: "normal",   category: MOVE_CATEGORY.STATUS,   pp: 30, critBoost: true },
  rest:        { name: "Rest",        power: 0,   accuracy: 100, type: "normal",   category: MOVE_CATEGORY.STATUS,   pp: 10, restoreFullHp: true, sleepSelf: 2 },
  recover:     { name: "Recover",     power: 0,   accuracy: 100, type: "normal",   category: MOVE_CATEGORY.STATUS,   pp: 10, healPct: 0.5 },

  // ---- Fire ----
  ember:       { name: "Ember",       power: 40,  accuracy: 100, type: "fire",     category: MOVE_CATEGORY.SPECIAL,  pp: 25, burnChance: 10 },
  flamerush:   { name: "Flame Rush",  power: 65,  accuracy: 90,  type: "fire",     category: MOVE_CATEGORY.SPECIAL,  pp: 15, burnChance: 15 },
  firefang:    { name: "Fire Fang",   power: 65,  accuracy: 95,  type: "fire",     category: MOVE_CATEGORY.PHYSICAL, pp: 15, burnChance: 10, flinch: 10 },
  flameburst:  { name: "Flameburst",  power: 90,  accuracy: 90,  type: "fire",     category: MOVE_CATEGORY.SPECIAL,  pp: 10, burnChance: 10 },
  inferno:     { name: "Inferno",     power: 100, accuracy: 75,  type: "fire",     category: MOVE_CATEGORY.SPECIAL,  pp: 10, burnChance: 100 },
  fireworks:   { name: "Fireworks",   power: 110, accuracy: 85,  type: "fire",     category: MOVE_CATEGORY.SPECIAL,  pp: 5,  burnChance: 10 },

  // ---- Water ----
  bubble:      { name: "Bubble",      power: 40,  accuracy: 100, type: "water",    category: MOVE_CATEGORY.SPECIAL,  pp: 30, stat: {target:"enemy",stat:"spd",stages:-1,chance:10} },
  aquajet:     { name: "Aqua Jet",    power: 60,  accuracy: 95,  type: "water",    category: MOVE_CATEGORY.PHYSICAL, pp: 20, priority: 1 },
  watergun:    { name: "Water Gun",   power: 40,  accuracy: 100, type: "water",    category: MOVE_CATEGORY.SPECIAL,  pp: 25 },
  surf:        { name: "Surf",        power: 90,  accuracy: 100, type: "water",    category: MOVE_CATEGORY.SPECIAL,  pp: 15 },
  hydropump:   { name: "Hydro Pump",  power: 110, accuracy: 80,  type: "water",    category: MOVE_CATEGORY.SPECIAL,  pp: 5 },
  waterfall:   { name: "Waterfall",   power: 80,  accuracy: 100, type: "water",    category: MOVE_CATEGORY.PHYSICAL, pp: 15, flinch: 20 },

  // ---- Grass ----
  vinewhip:    { name: "Vine Whip",   power: 45,  accuracy: 100, type: "grass",    category: MOVE_CATEGORY.PHYSICAL, pp: 25 },
  leafblade:   { name: "Leaf Blade",  power: 70,  accuracy: 100, type: "grass",    category: MOVE_CATEGORY.PHYSICAL, pp: 15, highCrit: true },
  absorb:      { name: "Absorb",      power: 20,  accuracy: 100, type: "grass",    category: MOVE_CATEGORY.SPECIAL,  pp: 25, drain: 0.5 },
  megadrain:   { name: "Mega Drain",  power: 40,  accuracy: 100, type: "grass",    category: MOVE_CATEGORY.SPECIAL,  pp: 15, drain: 0.5 },
  solarbeam:   { name: "Solar Beam",  power: 120, accuracy: 100, type: "grass",    category: MOVE_CATEGORY.SPECIAL,  pp: 10, charge: true },
  seedbomb:    { name: "Seed Bomb",   power: 80,  accuracy: 100, type: "grass",    category: MOVE_CATEGORY.PHYSICAL, pp: 15 },
  spore:       { name: "Spore",       power: 0,   accuracy: 100, type: "grass",    category: MOVE_CATEGORY.STATUS,   pp: 15, inflict: STATUS.SLEEP },

  // ---- Electric ----
  sparkbolt:   { name: "Sparkbolt",   power: 45,  accuracy: 100, type: "electric", category: MOVE_CATEGORY.SPECIAL,  pp: 25, paralyzeChance: 10 },
  thunderjolt: { name: "Thunderjolt", power: 65,  accuracy: 90,  type: "electric", category: MOVE_CATEGORY.SPECIAL,  pp: 15, paralyzeChance: 10 },
  thunderbolt: { name: "Thunderbolt", power: 90,  accuracy: 100, type: "electric", category: MOVE_CATEGORY.SPECIAL,  pp: 15, paralyzeChance: 10 },
  thunder:     { name: "Thunder",     power: 110, accuracy: 70,  type: "electric", category: MOVE_CATEGORY.SPECIAL,  pp: 10, paralyzeChance: 30 },
  voltswitch:  { name: "Volt Switch", power: 70,  accuracy: 100, type: "electric", category: MOVE_CATEGORY.SPECIAL,  pp: 20, forceSwitch: true },

  // ---- Ground ----
  mudslap:     { name: "Mud Slap",    power: 35,  accuracy: 100, type: "ground",   category: MOVE_CATEGORY.SPECIAL,  pp: 15, stat: {target:"enemy",stat:"acc",stages:-1,chance:100} },
  sandtomb:    { name: "Sand Tomb",   power: 55,  accuracy: 90,  type: "ground",   category: MOVE_CATEGORY.PHYSICAL, pp: 15 },
  earthquake:  { name: "Earthquake",  power: 100, accuracy: 100, type: "ground",   category: MOVE_CATEGORY.PHYSICAL, pp: 10 },
  dig:         { name: "Dig",         power: 80,  accuracy: 100, type: "ground",   category: MOVE_CATEGORY.PHYSICAL, pp: 10, charge: true },
  bonemerge:   { name: "Bone Merge",  power: 70,  accuracy: 90,  type: "ground",   category: MOVE_CATEGORY.PHYSICAL, pp: 15 },

  // ---- Flying ----
  gust:        { name: "Gust",        power: 40,  accuracy: 100, type: "flying",   category: MOVE_CATEGORY.SPECIAL,  pp: 35 },
  windcutter:  { name: "Wind Cutter", power: 60,  accuracy: 95,  type: "flying",   category: MOVE_CATEGORY.SPECIAL,  pp: 20 },
  wingattack:  { name: "Wing Attack", power: 60,  accuracy: 100, type: "flying",   category: MOVE_CATEGORY.PHYSICAL, pp: 35 },
  aerialace:   { name: "Aerial Ace",  power: 60,  accuracy: 100, type: "flying",   category: MOVE_CATEGORY.PHYSICAL, pp: 20, neverMiss: true },
  drillbeak:   { name: "Drill Beak",  power: 80,  accuracy: 100, type: "flying",   category: MOVE_CATEGORY.PHYSICAL, pp: 20, highCrit: true },
  bravebird:   { name: "Brave Bird",  power: 120, accuracy: 100, type: "flying",   category: MOVE_CATEGORY.PHYSICAL, pp: 15, recoil: 0.33 },

  // ---- Poison ----
  sting:       { name: "Sting",       power: 35,  accuracy: 100, type: "poison",   category: MOVE_CATEGORY.PHYSICAL, pp: 35, poisonChance: 10 },
  toxinspit:   { name: "Toxin Spit",  power: 55,  accuracy: 90,  type: "poison",   category: MOVE_CATEGORY.SPECIAL,  pp: 15, poisonChance: 30 },
  sludge:      { name: "Sludge",      power: 65,  accuracy: 100, type: "poison",   category: MOVE_CATEGORY.SPECIAL,  pp: 20, poisonChance: 30 },
  sludgebomb:  { name: "Sludge Bomb", power: 90,  accuracy: 100, type: "poison",   category: MOVE_CATEGORY.SPECIAL,  pp: 10, poisonChance: 30 },
  toxic:       { name: "Toxic",       power: 0,   accuracy: 90,  type: "poison",   category: MOVE_CATEGORY.STATUS,   pp: 10, inflict: STATUS.TOXIC },

  // ---- Ice ----
  icefang:     { name: "Ice Fang",    power: 65,  accuracy: 95,  type: "ice",      category: MOVE_CATEGORY.PHYSICAL, pp: 15, freezeChance: 10, flinch: 10 },
  icebeam:     { name: "Ice Beam",    power: 90,  accuracy: 100, type: "ice",      category: MOVE_CATEGORY.SPECIAL,  pp: 10, freezeChance: 10 },
  blizzard:    { name: "Blizzard",    power: 110, accuracy: 70,  type: "ice",      category: MOVE_CATEGORY.SPECIAL,  pp: 5,  freezeChance: 10 },
  frostbreath: { name: "Frost Breath",power: 60,  accuracy: 90,  type: "ice",      category: MOVE_CATEGORY.SPECIAL,  pp: 10, alwaysCrit: true },

  // ---- Rock ----
  rockthrow:   { name: "Rock Throw",  power: 50,  accuracy: 90,  type: "rock",     category: MOVE_CATEGORY.PHYSICAL, pp: 15 },
  rockslide:   { name: "Rock Slide",  power: 75,  accuracy: 90,  type: "rock",     category: MOVE_CATEGORY.PHYSICAL, pp: 10, flinch: 30 },
  stoneedge:   { name: "Stone Edge",  power: 100, accuracy: 80,  type: "rock",     category: MOVE_CATEGORY.PHYSICAL, pp: 5,  highCrit: true },
  rockblast:   { name: "Rock Blast",  power: 60,  accuracy: 90,  type: "rock",     category: MOVE_CATEGORY.PHYSICAL, pp: 15, multihit: true },

  // ---- Bug ----
  bugbite:     { name: "Bug Bite",    power: 60,  accuracy: 100, type: "bug",      category: MOVE_CATEGORY.PHYSICAL, pp: 20 },
  pinmissile:  { name: "Pin Missile", power: 50,  accuracy: 95,  type: "bug",      category: MOVE_CATEGORY.PHYSICAL, pp: 20, multihit: true },
  xscissor:    { name: "X-Scissor",   power: 80,  accuracy: 100, type: "bug",      category: MOVE_CATEGORY.PHYSICAL, pp: 15 },
  megahorn:    { name: "Megahorn",    power: 120, accuracy: 85,  type: "bug",      category: MOVE_CATEGORY.PHYSICAL, pp: 10 },
  stringshot: { name: "String Shot", power: 0,   accuracy: 95,  type: "bug",      category: MOVE_CATEGORY.STATUS,   pp: 40, stat: {target:"enemy",stat:"spd",stages:-2,chance:100} },

  // ---- Psychic ----
  confusion:   { name: "Confusion",   power: 50,  accuracy: 100, type: "psychic",  category: MOVE_CATEGORY.SPECIAL,  pp: 25, confuseChance: 10 },
  psybeam:     { name: "Psybeam",     power: 65,  accuracy: 100, type: "psychic",  category: MOVE_CATEGORY.SPECIAL,  pp: 20, confuseChance: 10 },
  psychic:     { name: "Psychic",     power: 90,  accuracy: 100, type: "psychic",  category: MOVE_CATEGORY.SPECIAL,  pp: 10, stat: {target:"enemy",stat:"def",stages:-1,chance:10} },
  dreameater:  { name: "Dream Eater", power: 100, accuracy: 100, type: "psychic",  category: MOVE_CATEGORY.SPECIAL,  pp: 15, requiresSleep: true, drain: 0.5 },
  lightscreen: { name: "Light Scrn",  power: 0,   accuracy: 100, type: "psychic",  category: MOVE_CATEGORY.STATUS,   pp: 30, wall: "special" },
  calmind:     { name: "Calm Mind",   power: 0,   accuracy: 100, type: "psychic",  category: MOVE_CATEGORY.STATUS,   pp: 20, stat: {target:"self",stat:"spatk",stages:1}, stat2:{target:"self",stat:"spdef",stages:1} },

  // ---- Ghost ----
  lick:        { name: "Lick",        power: 30,  accuracy: 100, type: "ghost",    category: MOVE_CATEGORY.PHYSICAL, pp: 30, paralyzeChance: 30 },
  shadowball:  { name: "Shadow Ball", power: 80,  accuracy: 100, type: "ghost",    category: MOVE_CATEGORY.SPECIAL,  pp: 15, stat: {target:"enemy",stat:"spdef",stages:-1,chance:20} },
  phantom:     { name: "Phantom",     power: 90,  accuracy: 100, type: "ghost",    category: MOVE_CATEGORY.PHYSICAL, pp: 10 },
  nightshade:  { name: "Night Shade", power: 0,   accuracy: 100, type: "ghost",    category: MOVE_CATEGORY.SPECIAL,  pp: 15, fixedDamage: true },

  // ---- Dark ----
  bite_dark:   { name: "Crunch",      power: 80,  accuracy: 100, type: "dark",     category: MOVE_CATEGORY.PHYSICAL, pp: 15, stat: {target:"enemy",stat:"def",stages:-1,chance:20} },
  pursuit:     { name: "Pursuit",     power: 40,  accuracy: 100, type: "dark",     category: MOVE_CATEGORY.PHYSICAL, pp: 20, priority: 0 },
  foulplay:    { name: "Foul Play",   power: 95,  accuracy: 100, type: "dark",     category: MOVE_CATEGORY.PHYSICAL, pp: 15, usesTargetAtk: true },
  darkpulse:   { name: "Dark Pulse",  power: 80,  accuracy: 100, type: "dark",     category: MOVE_CATEGORY.SPECIAL,  pp: 15, flinch: 20 },

  // ---- Dragon ----
  twister:     { name: "Twister",     power: 40,  accuracy: 100, type: "dragon",   category: MOVE_CATEGORY.SPECIAL,  pp: 30, flinch: 20 },
  dragonbreath:{ name: "Dragon Breath",power:60,  accuracy: 100, type: "dragon",   category: MOVE_CATEGORY.SPECIAL,  pp: 20, paralyzeChance: 30 },
  dragonclaw:  { name: "Dragon Claw", power: 80,  accuracy: 100, type: "dragon",   category: MOVE_CATEGORY.PHYSICAL, pp: 15 },
  outrage:     { name: "Outrage",     power: 120, accuracy: 100, type: "dragon",   category: MOVE_CATEGORY.PHYSICAL, pp: 10, lockTurns: 2, confuseSelf: true },
  dracometeor: { name: "Draco Meteor",power: 130, accuracy: 90,  type: "dragon",   category: MOVE_CATEGORY.SPECIAL,  pp: 5,  stat: {target:"self",stat:"spatk",stages:-2,chance:100} },

  // ---- Steel ----
  metalclaw:   { name: "Metal Claw",  power: 50,  accuracy: 95,  type: "steel",    category: MOVE_CATEGORY.PHYSICAL, pp: 35, stat: {target:"self",stat:"atk",stages:1,chance:10} },
  ironhead:    { name: "Iron Head",   power: 80,  accuracy: 100, type: "steel",    category: MOVE_CATEGORY.PHYSICAL, pp: 15, flinch: 30 },
  flashcannon: { name: "Flash Cannon",power: 80,  accuracy: 100, type: "steel",    category: MOVE_CATEGORY.SPECIAL,  pp: 10, stat: {target:"enemy",stat:"spdef",stages:-1,chance:10} },
  gyroball:    { name: "Gyro Ball",   power: 0,   accuracy: 100, type: "steel",    category: MOVE_CATEGORY.PHYSICAL, pp: 5,  speedBased: true },

  // ---- Fairy ----
  fairywind:   { name: "Fairy Wind",  power: 40,  accuracy: 100, type: "fairy",    category: MOVE_CATEGORY.SPECIAL,  pp: 30 },
  moonblast:   { name: "Moonblast",   power: 95,  accuracy: 100, type: "fairy",    category: MOVE_CATEGORY.SPECIAL,  pp: 15, stat: {target:"enemy",stat:"spatk",stages:-1,chance:30} },
  drainingkiss:{ name: "Draining Kiss",power:50, accuracy: 100, type: "fairy",    category: MOVE_CATEGORY.SPECIAL,  pp: 10, drain: 0.75 },
  charm:       { name: "Charm",       power: 0,   accuracy: 100, type: "fairy",    category: MOVE_CATEGORY.STATUS,   pp: 20, stat: {target:"enemy",stat:"atk",stages:-2,chance:100} },

  // ---- Fighting ----
  karatechop:  { name: "Karate Chop", power: 50,  accuracy: 100, type: "fighting", category: MOVE_CATEGORY.PHYSICAL, pp: 25, highCrit: true },
  brickbreak:  { name: "Brick Break", power: 75,  accuracy: 100, type: "fighting", category: MOVE_CATEGORY.PHYSICAL, pp: 15, breakWalls: true },
  closecombat: { name: "Close Combat",power: 120, accuracy: 100, type: "fighting", category: MOVE_CATEGORY.PHYSICAL, pp: 5,  stat: {target:"self",stat:"def",stages:-1,chance:100}, stat2:{target:"self",stat:"spdef",stages:-1,chance:100} },
  crosschop:   { name: "Cross Chop",  power: 100, accuracy: 80,  type: "fighting", category: MOVE_CATEGORY.PHYSICAL, pp: 5,  highCrit: true },

  // ---- Custom / Boss moves (Mega Expansion) ----
  treasureFling: { name: "Treasure Fling", power: 90, accuracy: 85, type: "steel",  category: MOVE_CATEGORY.PHYSICAL, pp: 10, flinch: 20 },
  gigastomp:     { name: "Giga-Stomp",     power: 110, accuracy: 80, type: "normal", category: MOVE_CATEGORY.PHYSICAL, pp: 5,  flinch: 40, recharge: true },
  quakeslam:     { name: "Quake Slam",     power: 95,  accuracy: 90, type: "ground", category: MOVE_CATEGORY.PHYSICAL, pp: 10, stat: {target:"enemy",stat:"def",stages:-1,chance:30} },
  shadowvoid:    { name: "Shadow Void",    power: 85,  accuracy: 100,type: "ghost",  category: MOVE_CATEGORY.SPECIAL,  pp: 10, confuseChance: 20 },
  blindingshout: { name: "Blinding Shout", power: 0,   accuracy: 100,type: "normal", category: MOVE_CATEGORY.STATUS,   pp: 10, stat: {target:"enemy",stat:"atk",stages:-2,chance:100}, flinch: 30 }
};

// ---------------------------------------------------------------
//  TYPE EFFECTIVENESS CHART (full 18-type)
//  attacker -> { defender: multiplier }
// ---------------------------------------------------------------
const TYPE_CHART = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  poison:   { poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, grass: 2, fairy: 2, steel: 0 },
  ice:      { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  bug:      { fire: 0.5, fighting: 0.5, poison: 0.5, flying: 0.5, ghost: 0.5, grass: 2, psychic: 2, dark: 2, steel: 0.5, fairy: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 }
};

function typeMultiplier(attackType, defenderType1, defenderType2) {
  let mult = 1;
  const row = TYPE_CHART[attackType];
  if (row) {
    if (row[defenderType1] !== undefined) mult *= row[defenderType1];
    if (defenderType2 && row[defenderType2] !== undefined) mult *= row[defenderType2];
  }
  return mult;
}

// Returns a human-friendly effectiveness phrase
function effectivenessPhrase(mult) {
  if (mult === 0) return "It had no effect...";
  if (mult >= 2) return "It's super effective!";
  if (mult <= 0.5 && mult > 0) return "It's not very effective...";
  return "";
}

// ---------------------------------------------------------------
//  ABILITIES (passive traits) — kept simple, checked in battle hooks
// ---------------------------------------------------------------
const ABILITIES = {
  none:        { name: "—" },
  blaze:       { name: "Blaze",      desc: "Fire moves boosted at low HP." },
  torrent:     { name: "Torrent",    desc: "Water moves boosted at low HP." },
  overgrow:    { name: "Overgrow",   desc: "Grass moves boosted at low HP." },
  static:      { name: "Static",     desc: "Contact may paralyze attacker." },
  intimidate:  { name: "Intimidate", desc: "Lowers foe's Atk on entry." },
  poisonpoint: { name: "Poison Pt",  desc: "Contact may poison attacker." },
  flamebody:   { name: "Flame Body", desc: "Contact may burn attacker." },
  levitate:    { name: "Levitate",   desc: "Immune to Ground moves." },
  ThickFat:    { name: "Thick Fat",  desc: "Halves Fire/Ice damage." },
  swiftswim:   { name: "Swift Swim", desc: "Speed up in rain (cosmetic)." },
  chlorophyll: { name: "Chloro.",    desc: "Speed up in sun (cosmetic)." },
  shellarmor:  { name: "Shell Arm",  desc: "Never takes a critical hit." },
  sheerforce:  { name: "Sheer Force",desc: "Moves hit harder, no extra effects." },
  naturalcure: { name: "Natural Cur",desc: "Cures status on switch out." },
  multiscale:  { name: "Multiscale", desc: "Takes half damage at full HP." }
};

// ---------------------------------------------------------------
//  SPECIES DATA
//  Each entry: name, type (string or [t1,t2]), color, shape, base stats,
//  moves (learned at creation; more via learnsets), catchRate, xpGroup,
//  ability, evolvesTo/At or evolutionItem, dex text.
// ---------------------------------------------------------------
const SPECIES = {

  // ================= FIRE =================
  emberit: {
    name: "Emberit", type: "fire", color: "#e0763f", shape: "quad",
    baseHp: 39, baseAtk: 52, baseDef: 43, baseSpd: 65,
    moves: ["scratch", "ember"],
    learnset: { 7: "growl", 10: "firefang", 16: "flamerush" },
    catchRate: 45, xpGroup: "mediumSlow", ability: "blaze",
    evolvesTo: "infernyx", evolvesAt: 16,
    dex: "A timid spark-creature that flickers like a candle when calm."
  },
  infernyx: {
    name: "Infernyx", type: "fire", color: "#c9481f", shape: "spiky",
    baseHp: 58, baseAtk: 78, baseDef: 62, baseSpd: 90,
    moves: ["scratch", "ember", "firefang", "flamerush"],
    learnset: { 20: "flameburst", 28: "inferno", 36: "fireworks" },
    catchRate: 45, xpGroup: "mediumSlow", ability: "blaze",
    evolvesTo: "pyrothorn", evolvesAt: 36,
    dex: "Its mane of living flame can scorch a forest when it loses its temper."
  },
  pyrothorn: {
    name: "Pyrothorn", type: ["fire", "dragon"], color: "#a32f1c", shape: "spiky",
    baseHp: 78, baseAtk: 108, baseDef: 78, baseSpd: 100,
    moves: ["flamerush", "firefang", "flameburst", "dragonclaw"],
    learnset: { 40: "fireworks", 48: "outrage", 56: "flameburst" },
    catchRate: 45, xpGroup: "mediumSlow", ability: "blaze",
    dex: "A volcanic dragon whose roar can melt stone. Trainers approach with caution."
  },

  // ================= WATER =================
  aquip: {
    name: "Aquip", type: "water", color: "#4f8fd6", shape: "round",
    baseHp: 44, baseAtk: 48, baseDef: 65, baseSpd: 43,
    moves: ["tackle", "bubble"],
    learnset: { 7: "watergun", 10: "tailwhip", 16: "aquajet" },
    catchRate: 45, xpGroup: "mediumSlow", ability: "torrent",
    evolvesTo: "tidalon", evolvesAt: 16,
    dex: "It paddles in cold streams, the fin on its back sensing currents."
  },
  tidalon: {
    name: "Tidalon", type: "water", color: "#2f6bb0", shape: "finned",
    baseHp: 63, baseAtk: 70, baseDef: 88, baseSpd: 60,
    moves: ["tackle", "bubble", "watergun", "aquajet"],
    learnset: { 20: "waterfall", 28: "surf", 36: "hydropump" },
    catchRate: 45, xpGroup: "mediumSlow", ability: "torrent",
    evolvesTo: "leviathorn", evolvesAt: 36,
    dex: "Tidalon's body is a living wave; sailors treat its surf as a weather warning."
  },
  leviathorn: {
    name: "Leviathorn", type: ["water", "dragon"], color: "#1f4a80", shape: "finned",
    baseHp: 88, baseAtk: 95, baseDef: 108, baseSpd: 78,
    moves: ["aquajet", "waterfall", "surf", "dragonclaw"],
    learnset: { 40: "hydropump", 48: "outrage", 56: "dracometeor" },
    catchRate: 45, xpGroup: "mediumSlow", ability: "torrent",
    dex: "An ancient sea leviathan. Whole harbors hush when its spire breaks the water."
  },

  // ================= GRASS =================
  leafon: {
    name: "Leafon", type: "grass", color: "#5fb04f", shape: "round",
    baseHp: 45, baseAtk: 49, baseDef: 49, baseSpd: 45,
    moves: ["tackle", "vinewhip"],
    learnset: { 7: "growl", 10: "absorb", 16: "leafblade" },
    catchRate: 45, xpGroup: "mediumSlow", ability: "overgrow",
    evolvesTo: "florahn", evolvesAt: 16,
    dex: "A sproutling that photosynthesizes through the leaf on its head."
  },
  florahn: {
    name: "Florahn", type: "grass", color: "#3f8a35", shape: "spiky",
    baseHp: 65, baseAtk: 72, baseDef: 68, baseSpd: 58,
    moves: ["tackle", "vinewhip", "absorb", "leafblade"],
    learnset: { 20: "seedbomb", 28: "megadrain", 36: "solarbeam" },
    catchRate: 45, xpGroup: "mediumSlow", ability: "overgrow",
    evolvesTo: "thornheart", evolvesAt: 36,
    dex: "Florahn blooms only in spring; its petals are prized by herbalists."
  },
  thornheart: {
    name: "Thornheart", type: ["grass", "fairy"], color: "#2f7a25", shape: "spiky",
    baseHp: 85, baseAtk: 90, baseDef: 88, baseSpd: 70,
    moves: ["leafblade", "seedbomb", "megadrain", "moonblast"],
    learnset: { 40: "solarbeam", 48: "drainingkiss", 56: "spore" },
    catchRate: 45, xpGroup: "mediumSlow", ability: "overgrow",
    dex: "Said to be the guardian of old forests. Its heart-shaped core glows at dusk."
  },

  // ================= NORMAL (early route) =================
  rattick: {
    name: "Rattick", type: "normal", color: "#a8a29e", shape: "round",
    baseHp: 30, baseAtk: 56, baseDef: 35, baseSpd: 72,
    moves: ["tackle", "bite"],
    learnset: { 6: "tailwhip", 10: "quickattack", 14: "focusenergy" },
    catchRate: 255, xpGroup: "mediumFast", ability: "intimidate",
    evolvesTo: "rattigor", evolvesAt: 12,
    dex: "A common plains rodent. Its incisors grow back within a day."
  },
  rattigor: {
    name: "Rattigor", type: "normal", color: "#78716c", shape: "spiky",
    baseHp: 45, baseAtk: 78, baseDef: 50, baseSpd: 92,
    moves: ["tackle", "bite", "quickattack", "bodyslam"],
    learnset: { 20: "hyperbeam" },
    catchRate: 90, xpGroup: "mediumFast", ability: "intimidate",
    dex: "Rattigor's whiskers twitch at the slightest tremor. It seldom loses a chase."
  },

  // ================= ELECTRIC =================
  sparkit: {
    name: "Sparkit", type: "electric", color: "#e8d84f", shape: "quad",
    baseHp: 35, baseAtk: 55, baseDef: 40, baseSpd: 80,
    moves: ["tackle", "sparkbolt"],
    learnset: { 8: "tailwhip", 12: "thunderjolt", 16: "quickattack" },
    catchRate: 120, xpGroup: "mediumFast", ability: "static",
    evolvesTo: "voltagon", evolvesAt: 14,
    dex: "Stores static in its fur. Petting one in dry weather is inadvisable."
  },
  voltagon: {
    name: "Voltagon", type: "electric", color: "#d4b91f", shape: "finned",
    baseHp: 55, baseAtk: 75, baseDef: 55, baseSpd: 105,
    moves: ["sparkbolt", "thunderjolt", "quickattack"],
    learnset: { 22: "thunderbolt", 30: "thunder", 38: "voltswitch" },
    catchRate: 60, xpGroup: "mediumFast", ability: "static",
    evolvesTo: "stormoxen", evolvesAt: 30,
    dex: "Voltagon can discharge enough voltage to light a small town for a minute."
  },
  stormoxen: {
    name: "Stormoxen", type: ["electric", "fighting"], color: "#b89f12", shape: "spiky",
    baseHp: 75, baseAtk: 100, baseDef: 75, baseSpd: 110,
    moves: ["thunderjolt", "thunderbolt", "closecombat", "crosschop"],
    learnset: { 40: "thunder", 48: "voltswitch", 56: "closecombat" },
    catchRate: 45, xpGroup: "mediumFast", ability: "static",
    dex: "A thundering ox beast. Its hooves strike the earth like a drumroll of storms."
  },

  // ================= GROUND =================
  digmole: {
    name: "Digmole", type: "ground", color: "#b08d57", shape: "round",
    baseHp: 50, baseAtk: 60, baseDef: 70, baseSpd: 35,
    moves: ["scratch", "mudslap", "sandtomb"],
    learnset: { 8: "growl", 12: "dig", 18: "bonemerge" },
    catchRate: 100, xpGroup: "mediumFast", ability: "none",
    evolvesTo: "terramole", evolvesAt: 26,
    dex: "Digmole tunnels faster than a man can walk. Its burrows aerate farmland."
  },
  terramole: {
    name: "Terramole", type: ["ground", "rock"], color: "#8a6b3f", shape: "spiky",
    baseHp: 75, baseAtk: 85, baseDef: 95, baseSpd: 45,
    moves: ["mudslap", "sandtomb", "dig", "earthquake"],
    learnset: { 32: "rockslide", 40: "stoneedge" },
    catchRate: 60, xpGroup: "mediumFast", ability: "none",
    dex: "Terramole's claws are harder than iron. Miners fear and respect it equally."
  },

  // ================= FLYING =================
  breezel: {
    name: "Breezel", type: ["flying", "normal"], color: "#bcd9e8", shape: "finned",
    baseHp: 42, baseAtk: 50, baseDef: 42, baseSpd: 85,
    moves: ["tackle", "gust", "windcutter"],
    learnset: { 8: "wingattack", 14: "quickattack", 22: "aerialace" },
    catchRate: 90, xpGroup: "mediumFast", ability: "none",
    evolvesTo: "galewing", evolvesAt: 24,
    dex: "Breezel rides thermals all day, rarely flapping. A sign of fair weather."
  },
  galewing: {
    name: "Galewing", type: ["flying", "normal"], color: "#7fb4cf", shape: "finned",
    baseHp: 65, baseAtk: 80, baseDef: 60, baseSpd: 110,
    moves: ["windcutter", "wingattack", "aerialace", "drillbeak"],
    learnset: { 30: "bravebird", 38: "drillbeak" },
    catchRate: 45, xpGroup: "mediumFast", ability: "none",
    dex: "Galewing can outfly a storm front. Its silhouette is a sailor's good omen."
  },

  // ================= POISON =================
  toxipod: {
    name: "Toxipod", type: ["poison", "bug"], color: "#8f5fb0", shape: "spiky",
    baseHp: 48, baseAtk: 52, baseDef: 58, baseSpd: 40,
    moves: ["sting", "toxinspit", "bugbite"],
    learnset: { 8: "stringshot", 14: "sludge", 20: "sludgebomb" },
    catchRate: 110, xpGroup: "mediumFast", ability: "poisonpoint",
    evolvesTo: "venomoth", evolvesAt: 22,
    dex: "Toxipod's spines drip a slow-acting venom used historically on arrow tips."
  },
  venomoth: {
    name: "Venomoth", type: ["poison", "bug"], color: "#6f3f9a", shape: "finned",
    baseHp: 60, baseAtk: 65, baseDef: 60, baseSpd: 90,
    moves: ["toxinspit", "sludge", "sludgebomb", "xscissor"],
    learnset: { 28: "toxic", 36: "megahorn" },
    catchRate: 75, xpGroup: "mediumFast", ability: "poisonpoint",
    dex: "A dusk-flying moth whose wing-scales cause dizziness in those who brush them."
  },

  // ================= ICE =================
  frostip: {
    name: "Frostip", type: "ice", color: "#cfe8f0", shape: "round",
    baseHp: 50, baseAtk: 45, baseDef: 55, baseSpd: 50,
    moves: ["tackle", "icefang", "frostbreath"],
    learnset: { 8: "growl", 14: "icebeam", 20: "blizzard" },
    catchRate: 120, xpGroup: "mediumFast", ability: "none",
    evolvesTo: "glaciorn", evolvesAt: 28,
    dex: "Frostip lives on glaciers. Its breath can freeze a pond in seconds."
  },
  glaciorn: {
    name: "Glaciorn", type: ["ice", "fairy"], color: "#9fd6e8", shape: "spiky",
    baseHp: 80, baseAtk: 70, baseDef: 90, baseSpd: 70,
    moves: ["icefang", "icebeam", "blizzard", "moonblast"],
    learnset: { 34: "frostbreath", 42: "drainingkiss" },
    catchRate: 60, xpGroup: "mediumFast", ability: "none",
    dex: "A mythical frost beast. Its horn is said to grant a single wish per winter."
  },

  // ================= ROCK =================
  pebblix: {
    name: "Pebblix", type: ["rock", "ground"], color: "#9b8b6e", shape: "round",
    baseHp: 55, baseAtk: 60, baseDef: 80, baseSpd: 30,
    moves: ["tackle", "rockthrow", "mudslap"],
    learnset: { 10: "rockslide", 16: "dig", 24: "earthquake" },
    catchRate: 140, xpGroup: "mediumFast", ability: "none",
    evolvesTo: "bouldron", evolvesAt: 24,
    dex: "Pebblix rolls down hillsides for fun, bowling over anything in its path."
  },
  bouldron: {
    name: "Bouldron", type: ["rock", "ground"], color: "#7a6b54", shape: "spiky",
    baseHp: 85, baseAtk: 90, baseDef: 110, baseSpd: 40,
    moves: ["rockthrow", "rockslide", "earthquake", "stoneedge"],
    learnset: { 32: "rockblast", 40: "stoneedge" },
    catchRate: 60, xpGroup: "mediumFast", ability: "none",
    dex: "Bouldron is mistaken for a boulder until it stands up. Mountain trails beware."
  },

  // ================= BUG =================
  carpox: {
    name: "Carpox", type: ["bug", "water"], color: "#cf6f3f", shape: "round",
    baseHp: 40, baseAtk: 35, baseDef: 50, baseSpd: 25,
    moves: ["tackle", "bugbite", "bubble"],
    learnset: { 10: "stringshot", 15: "pinmissile" },
    catchRate: 150, xpGroup: "mediumFast", ability: "none",
    evolvesTo: "silkmoth", evolvesAt: 18,
    dex: "A pond-dwelling grub. Fishers use them as bait despite their feeble splashing."
  },
  silkmoth: {
    name: "Silkmoth", type: ["bug", "flying"], color: "#d9b04f", shape: "finned",
    baseHp: 60, baseAtk: 70, baseDef: 50, baseSpd: 85,
    moves: ["bugbite", "pinmissile", "gust", "xscissor"],
    learnset: { 24: "windcutter", 32: "megahorn" },
    catchRate: 90, xpGroup: "mediumFast", ability: "none",
    dex: "Silkmoth's cocoon silk is woven into the region's finest, lightest cloth."
  },

  // ================= PSYCHIC =================
  mindrill: {
    name: "Mindrill", type: "psychic", color: "#d68fb0", shape: "round",
    baseHp: 45, baseAtk: 40, baseDef: 50, baseSpd: 55,
    moves: ["confusion", "growl", "psybeam"],
    learnset: { 10: "lightscreen", 16: "psychic", 24: "dreameater" },
    catchRate: 120, xpGroup: "mediumSlow", ability: "naturalcure",
    evolvesTo: "oraculon", evolvesAt: 28,
    dex: "Mindrill hums a note only the introspective can hear. It soothes headaches."
  },
  oraculon: {
    name: "Oraculon", type: ["psychic", "fairy"], color: "#b06f9a", shape: "spiky",
    baseHp: 70, baseAtk: 65, baseDef: 75, baseSpd: 80,
    moves: ["psybeam", "psychic", "moonblast", "calmind"],
    learnset: { 34: "dreameater", 42: "lightscreen" },
    catchRate: 60, xpGroup: "mediumSlow", ability: "naturalcure",
    dex: "Oraculon glimpses the future in still water. Its prophecies are famously cryptic."
  },

  // ================= GHOST =================
  wispup: {
    name: "Wispup", type: ["ghost", "fire"], color: "#9f7fb0", shape: "round",
    baseHp: 40, baseAtk: 50, baseDef: 45, baseSpd: 60,
    moves: ["lick", "ember", "shadowball"],
    learnset: { 10: "flameburst", 16: "phantom", 24: "nightshade" },
    catchRate: 120, xpGroup: "mediumFast", ability: "flamebody",
    evolvesTo: "spectral", evolvesAt: 30,
    dex: "A will-o'-wisp that guides lost travelers — sometimes to safety, sometimes not."
  },
  spectral: {
    name: "Spectral", type: ["ghost", "fire"], color: "#7a5f9a", shape: "spiky",
    baseHp: 65, baseAtk: 85, baseDef: 60, baseSpd: 90,
    moves: ["shadowball", "phantom", "flameburst", "nightshade"],
    learnset: { 38: "inferno", 46: "fireworks" },
    catchRate: 60, xpGroup: "mediumFast", ability: "flamebody",
    dex: "Spectral feeds on forgotten memories, which it burns like fuel for its flame."
  },

  // ================= DARK =================
  shadepup: {
    name: "Shadepup", type: "dark", color: "#5a5366", shape: "quad",
    baseHp: 50, baseAtk: 60, baseDef: 45, baseSpd: 65,
    moves: ["bite_dark", "pursuit", "leer"],
    learnset: { 10: "bite", 16: "foulplay", 24: "darkpulse" },
    catchRate: 120, xpGroup: "mediumFast", ability: "intimidate",
    evolvesTo: "nightmere", evolvesAt: 26,
    dex: "Shadepup hunts at dusk. Its howl is the last sound many small creatures hear."
  },
  nightmere: {
    name: "Nightmere", type: ["dark", "ghost"], color: "#3f3a4f", shape: "spiky",
    baseHp: 75, baseAtk: 95, baseDef: 70, baseSpd: 85,
    moves: ["bite_dark", "foulplay", "darkpulse", "shadowball"],
    learnset: { 34: "phantom", 42: "nightshade" },
    catchRate: 60, xpGroup: "mediumFast", ability: "intimidate",
    dex: "Nightmere rides through nightmares. Those who wake to its eyes rarely sleep again."
  },

  // ================= DRAGON =================
  drakeling: {
    name: "Drakeling", type: "dragon", color: "#7a4fb0", shape: "spiky",
    baseHp: 55, baseAtk: 60, baseDef: 55, baseSpd: 50,
    moves: ["tackle", "twister", "dragonbreath"],
    learnset: { 12: "dragonclaw", 20: "bite", 28: "outrage" },
    catchRate: 60, xpGroup: "slow", ability: "none",
    evolvesTo: "wyrmking", evolvesAt: 40,
    dex: "Drakeling hoards shiny pebbles. Trainers find their pockets mysteriously lighter."
  },
  wyrmking: {
    name: "Wyrmking", type: ["dragon", "flying"], color: "#5f3f9a", shape: "spiky",
    baseHp: 95, baseAtk: 110, baseDef: 90, baseSpd: 90,
    moves: ["dragonclaw", "dragonbreath", "outrage", "wingattack"],
    learnset: { 48: "dracometeor", 56: "bravebird" },
    catchRate: 30, xpGroup: "slow", ability: "intimidate",
    dex: "Wyrmking rules mountain peaks. Its wingspan blots out the midday sun."
  },

  // ================= STEEL =================
  ironscale: {
    name: "Ironscale", type: ["steel", "rock"], color: "#9aa5b1", shape: "spiky",
    baseHp: 60, baseAtk: 70, baseDef: 95, baseSpd: 30,
    moves: ["metalclaw", "rockthrow", "ironhead"],
    learnset: { 12: "rockslide", 20: "flashcannon", 28: "gyroball" },
    catchRate: 90, xpGroup: "mediumFast", ability: "none",
    evolvesTo: "adamantaur", evolvesAt: 32,
    dex: "Ironscale's plated hide deflects arrows. Blacksmiths study it for inspiration."
  },
  adamantaur: {
    name: "Adamantaur", type: ["steel", "fighting"], color: "#7a8591", shape: "spiky",
    baseHp: 90, baseAtk: 110, baseDef: 120, baseSpd: 50,
    moves: ["ironhead", "flashcannon", "brickbreak", "closecombat"],
    learnset: { 40: "gyroball", 48: "closecombat" },
    catchRate: 45, xpGroup: "mediumFast", ability: "none",
    dex: "An armored juggernaut. Once it charges, stopping it requires a mountain."
  },

  // ================= FAIRY =================
  pixiecap: {
    name: "Pixiecap", type: "fairy", color: "#d68fb0", shape: "round",
    baseHp: 50, baseAtk: 40, baseDef: 55, baseSpd: 45,
    moves: ["fairywind", "charm", "growl"],
    learnset: { 10: "drainingkiss", 16: "moonblast", 24: "calmind" },
    catchRate: 150, xpGroup: "mediumFast", ability: "naturalcure",
    evolvesTo: "glamora", evolvesAt: 24,
    dex: "Pixiecap dances in moonlit meadows. Children who watch it forget their worries."
  },
  glamora: {
    name: "Glamora", type: ["fairy", "psychic"], color: "#b06f9a", shape: "spiky",
    baseHp: 75, baseAtk: 65, baseDef: 80, baseSpd: 70,
    moves: ["fairywind", "moonblast", "drainingkiss", "psychic"],
    learnset: { 32: "calmind", 40: "dreameater" },
    catchRate: 60, xpGroup: "mediumFast", ability: "naturalcure",
    dex: "Glamora's aura bends light around it, letting it vanish mid-conversation."
  },

  // ================= FIGHTING =================
  monkick: {
    name: "Monkick", type: "fighting", color: "#c97f3f", shape: "quad",
    baseHp: 50, baseAtk: 70, baseDef: 45, baseSpd: 65,
    moves: ["karatechop", "leer", "focusenergy"],
    learnset: { 10: "brickbreak", 16: "crosschop", 24: "closecombat" },
    catchRate: 90, xpGroup: "mediumFast", ability: "none",
    evolvesTo: "grandfist", evolvesAt: 28,
    dex: "Monkick trains by punching river stones smooth. Its fists are permanently calloused."
  },
  grandfist: {
    name: "Grandfist", type: ["fighting", "steel"], color: "#a85f2f", shape: "spiky",
    baseHp: 80, baseAtk: 110, baseDef: 75, baseSpd: 80,
    moves: ["karatechop", "brickbreak", "crosschop", "closecombat"],
    learnset: { 36: "ironhead", 44: "closecombat" },
    catchRate: 45, xpGroup: "mediumFast", ability: "none",
    dex: "Grandfist's punch is said to split boulders and settle feuds in one stroke."
  },

  // ================= LEGENDARY (single-stage, rare) =================
  aurorion: {
    name: "Aurorion", type: ["dragon", "fairy"], color: "#8fb0d6", shape: "finned",
    baseHp: 110, baseAtk: 100, baseDef: 100, baseSpd: 95,
    moves: ["dragonclaw", "moonblast", "outrage", "calmind"],
    catchRate: 3, xpGroup: "slow", ability: "multiscale",
    dex: "The aurora dragon. It appears where the northern lights touch the earth, once a generation."
  },
  voidrath: {
    name: "Voidrath", type: ["dark", "dragon"], color: "#3f3a5f", shape: "spiky",
    baseHp: 110, baseAtk: 120, baseDef: 90, baseSpd: 100,
    moves: ["darkpulse", "dragonclaw", "outrage", "foulplay"],
    catchRate: 3, xpGroup: "slow", ability: "intimidate",
    dex: "An eclipse dragon. Where Voidrath flies, daylight dares not follow."
  }
};

// ---------------------------------------------------------------
//  ITEM DATA (purchasable / findable consumables)
// ---------------------------------------------------------------
const ITEMS = {
  basicball:    { name: "Basic Ball",  price: 200,  desc: "A standard catching ball.",         use: "ball",    catchBonus: 1.0 },
  greatball:    { name: "Great Ball",  price: 600,  desc: "A better catching ball.",           use: "ball",    catchBonus: 1.5 },
  ultraball:    { name: "Ultra Ball",  price: 1200, desc: "An excellent catching ball.",       use: "ball",    catchBonus: 2.0 },
  potion:       { name: "Potion",      price: 300,  desc: "Restores 50 HP.",                   use: "heal",    amount: 50 },
  superpotion:  { name: "Super Potion",price: 700,  desc: "Restores 150 HP.",                  use: "heal",    amount: 150 },
  hyperpotion:  { name: "Hyper Potion",price: 1500, desc: "Restores 400 HP.",                  use: "heal",    amount: 400 },
  revive:       { name: "Revive",      price: 1500, desc: "Revives a fainted monster to 1/2 HP.", use: "revive", amount: 0.5 },
  ether:        { name: "Ether",       price: 1000, desc: "Restores 10 PP to all moves.",      use: "pp",      amount: 10 },
  firestone:    { name: "Fire Stone",  price: 2100, desc: "Evolves certain fire-types.",       use: "estone",  evoType: "fire" },
  waterstone:   { name: "Water Stone", price: 2100, desc: "Evolves certain water-types.",      use: "estone",  evoType: "water" },
  leafstone:    { name: "Leaf Stone",  price: 2100, desc: "Evolves certain grass-types.",      use: "estone",  evoType: "grass" },
  thunderstone: { name: "Thunder Stone",price: 2100,desc: "Evolves certain electric-types.",   use: "estone",  evoType: "electric" },
  moonstone:    { name: "Moon Stone",  price: 2100, desc: "Evolves certain fairy-types.",      use: "estone",  evoType: "fairy" },
  antidote:     { name: "Antidote",    price: 100,  desc: "Cures poison.",                     use: "status",  status: "poison" },
  burnheal:     { name: "Burn Heal",   price: 250,  desc: "Cures burn.",                       use: "status",  status: "burn" },
  paralyzeheal: { name: "Parlyz Heal", price: 200,  desc: "Cures paralysis.",                  use: "status",  status: "paralysis" },
  awakening:    { name: "Awakening",   price: 250,  desc: "Wakes a sleeping monster.",         use: "status",  status: "sleep" },
  iceheal:      { name: "Ice Heal",    price: 250,  desc: "Thaws a frozen monster.",           use: "status",  status: "freeze" },
  fullheal:     { name: "Full Heal",   price: 600,  desc: "Cures all status conditions.",      use: "status",  status: "all" }
};

// ---------------------------------------------------------------
//  XP GROUPS — different curves per species
// ---------------------------------------------------------------
function xpForLevel(level, group) {
  group = group || "mediumFast";
  switch (group) {
    case "fast":         return Math.floor(Math.pow(level, 3) * 0.8);
    case "mediumFast":   return Math.floor(Math.pow(level, 3));
    case "mediumSlow":   return Math.floor(Math.pow(level, 3) * 1.25 - 30 * Math.pow(level, 2) + 500 * level - 5000 > 0 ? Math.pow(level,3)*1.25 - 30*Math.pow(level,2) + 500*level : 0);
    case "slow":         return Math.floor(Math.pow(level, 3) * 1.25);
    default:             return Math.floor(Math.pow(level, 3));
  }
}

// ---------------------------------------------------------------
//  INSTANCE CREATION
// ---------------------------------------------------------------
function createMonsterInstance(speciesKey, level) {
  let sp = SPECIES[speciesKey];
  if (!sp && typeof BIOME_CREATURES !== "undefined") sp = BIOME_CREATURES[speciesKey];
  if (!sp) {
    console.error("Unknown species:", speciesKey);
    return createMonsterInstance("rattick", level);
  }

  const stat = (base) => Math.floor(((base * 2) * level) / 100) + level + 5;
  const maxHp = Math.floor(((sp.baseHp * 2) * level) / 100) + level + 10;

  // Build the full move list: base moves + learned moves up to this level
  const moves = sp.moves.slice();
  if (sp.learnset) {
    Object.keys(sp.learnset).forEach(lvl => {
      if (Number(lvl) <= level && !moves.includes(sp.learnset[lvl])) {
        moves.push(sp.learnset[lvl]);
      }
    });
  }
  // Cap at 4 moves (keep most recent)
  const finalMoves = moves.slice(-4);

  // PP tracking per move
  const ppMap = {};
  finalMoves.forEach(mk => {
    ppMap[mk] = MOVES[mk] ? MOVES[mk].pp : 10;
  });

  const types = Array.isArray(sp.type) ? sp.type : [sp.type, null];

  return {
    speciesKey,
    name: sp.name,
    type1: types[0],
    type2: types[1],
    color: sp.color,
    shape: sp.shape,
    ability: sp.ability || "none",
    level,
    xp: 0,
    xpGroup: sp.xpGroup || "mediumFast",
    maxHp,
    hp: maxHp,
    atk: stat(sp.baseAtk),
    def: stat(sp.baseDef),
    spd: stat(sp.baseSpd),
    moves: finalMoves,
    pp: ppMap,
    maxPp: Object.assign({}, ppMap),
    catchRate: sp.catchRate || 120,
    status: STATUS.NONE,
    statusTurns: 0,
    sleepTurns: 0,
    confusionTurns: 0,
    statStages: { atk: 0, def: 0, spd: 0, acc: 0, eva: 0, spatk: 0, spdef: 0 },
    // keep legacy single-type alias for older code paths
    type: types[0]
  };
}

// Returns the current effective stat given base + stat stage (-6..+6)
function effectiveStat(monster, statName) {
  const base = monster[statName] || 0;
  const stage = monster.statStages ? (monster.statStages[statName] || 0) : 0;
  const multipliers = [0.25, 0.28, 0.33, 0.4, 0.5, 0.66, 1, 1.5, 2, 2.5, 3, 3.5, 4];
  const idx = Math.max(0, Math.min(12, stage + 6));
  return Math.floor(base * multipliers[idx]);
}

// ---------------------------------------------------------------
//  DAMAGE CALCULATION (with STAB, crit, burn, abilities)
// ---------------------------------------------------------------
function calcDamage(attacker, defender, moveKey, opts) {
  opts = opts || {};
  const move = MOVES[moveKey];
  if (!move) return { dmg: 0, mult: 1, move: null, crit: false };

  // Fixed-damage moves (e.g. Night Shade = user's level)
  if (move.fixedDamage) {
    return { dmg: attacker.level, mult: 1, move, crit: false };
  }

  // Speed-based move (Gyro Ball)
  if (move.speedBased) {
    const base = Math.max(1, Math.floor(25 * (defender.spd) / Math.max(1, attacker.spd)));
    return { dmg: base, mult: 1, move, crit: false };
  }

  // Type effectiveness (handles dual type defenders)
  const mult = typeMultiplier(move.type, defender.type1, defender.type2);
  if (mult === 0) {
    return { dmg: 0, mult: 0, move, crit: false };
  }

  // STAB: same-type attack bonus
  let stab = 1;
  if (move.type === attacker.type1 || move.type === attacker.type2) {
    stab = 1.5;
  }

  // Critical hit
  let critRate = (move.highCrit ? 1/8 : 1/24);
  if (opts.critBoost) critRate = 1/4;
  if (move.alwaysCrit) critRate = 1;
  const crit = Math.random() < critRate;

  // Pick attack/defense: physical uses atk/def, special uses spatk/spdef
  // We approximate spatk/spdef with atk/def since stats are simplified.
  const atkStat = effectiveStat(attacker, "atk");
  const defStat = effectiveStat(defender, "def");
  const effAtk = move.usesTargetAtk ? effectiveStat(defender, "atk") : atkStat;

  let base = (((2 * attacker.level / 5 + 2) * move.power * (effAtk / Math.max(1, defStat))) / 50) + 2;
  if (crit) base *= 1.5;
  base *= stab;
  base *= mult;

  // Burn halves physical damage
  if (attacker.status === STATUS.BURN && move.category === MOVE_CATEGORY.PHYSICAL) {
    base *= 0.5;
  }

  // Random variance 0.85-1.0
  base *= (0.85 + Math.random() * 0.15);

  const dmg = Math.max(1, Math.floor(base));
  return { dmg, mult, move, crit };
}

// ---------------------------------------------------------------
//  CATCH CHANCE (improved formula with ball bonus + status)
// ---------------------------------------------------------------
function catchChance(monster, ballBonus) {
  const hpFactor = (3 * monster.maxHp - 2 * monster.hp) / (3 * monster.maxHp);
  let statusBonus = 1;
  if (monster.status === STATUS.SLEEP || monster.status === STATUS.FREEZE) statusBonus = 2;
  else if (monster.status !== STATUS.NONE) statusBonus = 1.5;
  const a = hpFactor * monster.catchRate * ballBonus * statusBonus;
  const chance = Math.min(1, a / 255);
  return chance;
}

// ---------------------------------------------------------------
//  XP & LEVELING (with move learning + evolution)
// ---------------------------------------------------------------
function grantExperience(monster, defeatedLevel, party) {
  const gained = Math.max(1, Math.floor(defeatedLevel * 12));
  monster.xp += gained;

  const events = { gained, leveledUp: false, evolvedTo: null, learnedMove: null };

  while (monster.xp >= xpForLevel(monster.level + 1, monster.xpGroup)) {
    monster.level++;
    events.leveledUp = true;

    const sp = SPECIES[monster.speciesKey];
    const stat = (base) => Math.floor(((base * 2) * monster.level) / 100) + monster.level + 5;
    const newMaxHp = Math.floor(((sp.baseHp * 2) * monster.level) / 100) + monster.level + 10;
    const hpDiff = newMaxHp - monster.maxHp;
    monster.maxHp = newMaxHp;
    monster.hp = Math.min(monster.maxHp, monster.hp + hpDiff);
    monster.atk = stat(sp.baseAtk);
    monster.def = stat(sp.baseDef);
    monster.spd = stat(sp.baseSpd);

    // Learn new moves at this level
    if (sp.learnset && sp.learnset[monster.level]) {
      const newMove = sp.learnset[monster.level];
      if (!monster.moves.includes(newMove)) {
        if (monster.moves.length < 4) {
          monster.moves.push(newMove);
          monster.pp[newMove] = MOVES[newMove] ? MOVES[newMove].pp : 10;
          monster.maxPp[newMove] = monster.pp[newMove];
          events.learnedMove = newMove;
        } else {
          // Replace oldest move (simple policy; full UI choice omitted)
          const dropped = monster.moves.shift();
          delete monster.pp[dropped];
          delete monster.maxPp[dropped];
          monster.moves.push(newMove);
          monster.pp[newMove] = MOVES[newMove] ? MOVES[newMove].pp : 10;
          monster.maxPp[newMove] = monster.pp[newMove];
          events.learnedMove = newMove;
        }
      }
    }

    // Evolution by level
    if (sp.evolvesTo && sp.evolvesAt && monster.level >= sp.evolvesAt) {
      evolveMonster(monster, sp.evolvesTo);
      events.evolvedTo = SPECIES[sp.evolvesTo].name;
    }
  }

  return events;
}

// Apply an evolution (by item or by level). Updates the live instance.
function evolveMonster(monster, newSpeciesKey) {
  const newSp = SPECIES[newSpeciesKey];
  if (!newSp) return;
  const oldMaxHp = monster.maxHp;
  const hpRatio = monster.hp / oldMaxHp;

  monster.speciesKey = newSpeciesKey;
  monster.name = newSp.name;
  const types = Array.isArray(newSp.type) ? newSp.type : [newSp.type, null];
  monster.type1 = types[0];
  monster.type2 = types[1];
  monster.type = types[0]; // legacy alias
  monster.color = newSp.color;
  monster.shape = newSp.shape;
  monster.ability = newSp.ability || "none";

  // Recompute stats at current level
  const stat = (base) => Math.floor(((base * 2) * monster.level) / 100) + monster.level + 5;
  monster.maxHp = Math.floor(((newSp.baseHp * 2) * monster.level) / 100) + monster.level + 10;
  monster.hp = Math.floor(monster.maxHp * hpRatio);
  monster.atk = stat(newSp.baseAtk);
  monster.def = stat(newSp.baseDef);
  monster.spd = stat(newSp.baseSpd);

  // Merge any new moves the evolved form should know at this level
  if (newSp.learnset) {
    Object.keys(newSp.learnset).forEach(lvl => {
      if (Number(lvl) <= monster.level && !monster.moves.includes(newSp.learnset[lvl]) && monster.moves.length < 4) {
        monster.moves.push(newSp.learnset[lvl]);
        monster.pp[newSp.learnset[lvl]] = MOVES[newSp.learnset[lvl]] ? MOVES[newSp.learnset[lvl]].pp : 10;
        monster.maxPp[newSp.learnset[lvl]] = monster.pp[newSp.learnset[lvl]];
      }
    });
  }
}

// Evolution by item — returns true if it evolved.
function tryItemEvolution(monster, itemKey) {
  const sp = SPECIES[monster.speciesKey];
  if (!sp || !sp.evolutionItem) return false;
  if (sp.evolutionItem !== ITEMS[itemKey].evoType) return false;
  evolveMonster(monster, sp.evolvesTo);
  return true;
}

// ---------------------------------------------------------------
//  STATUS TICK (called at end of each turn for active monsters)
//  Returns { messages: [] } describing what happened.
// ---------------------------------------------------------------
function tickStatus(monster) {
  const messages = [];
  if (monster.status === STATUS.NONE) return messages;

  if (monster.status === STATUS.BURN) {
    const dmg = Math.max(1, Math.floor(monster.maxHp / 16));
    monster.hp = Math.max(0, monster.hp - dmg);
    messages.push(`${monster.name} is hurt by its burn!`);
  } else if (monster.status === STATUS.POISON || monster.status === STATUS.TOXIC) {
    const dmg = monster.status === STATUS.TOXIC
      ? Math.max(1, Math.floor(monster.maxHp / 16) * (monster.statusTurns + 1))
      : Math.max(1, Math.floor(monster.maxHp / 8));
    monster.hp = Math.max(0, monster.hp - dmg);
    monster.statusTurns = (monster.statusTurns || 0) + 1;
    messages.push(`${monster.name} is hurt by poison!`);
  } else if (monster.status === STATUS.SLEEP) {
    monster.sleepTurns = (monster.sleepTurns || 0) - 1;
    if (monster.sleepTurns <= 0) {
      monster.status = STATUS.NONE;
      messages.push(`${monster.name} woke up!`);
    }
  } else if (monster.status === STATUS.FREEZE) {
    if (Math.random() < 0.2) {
      monster.status = STATUS.NONE;
      messages.push(`${monster.name} thawed out!`);
    }
  } else if (monster.status === STATUS.CONFUSION) {
    monster.confusionTurns = (monster.confusionTurns || 0) - 1;
    if (monster.confusionTurns <= 0) {
      // confusion clears (we keep status flag for the simple model)
      monster.status = STATUS.NONE;
    }
  }
  return messages;
}

// Whether a monster can act this turn given its status (false = skip turn)
function canAct(monster, selfMessages) {
  selfMessages = selfMessages || [];
  if (monster.status === STATUS.SLEEP) {
    selfMessages.push(`${monster.name} is fast asleep.`);
    return false;
  }
  if (monster.status === STATUS.FREEZE) {
    selfMessages.push(`${monster.name} is frozen solid!`);
    return false;
  }
  if (monster.status === STATUS.PARALYSIS && Math.random() < 0.25) {
    selfMessages.push(`${monster.name} is paralyzed! It can't move!`);
    return false;
  }
  if (monster.status === STATUS.CONFUSION && Math.random() < 0.33) {
    const dmg = Math.max(1, Math.floor(monster.maxHp / 12));
    monster.hp = Math.max(0, monster.hp - dmg);
    selfMessages.push(`${monster.name} is confused! It hurt itself in confusion!`);
    return false;
  }
  return true;
}

// Cure all status (used by Full Heal / healing center)
function cureStatus(monster) {
  monster.status = STATUS.NONE;
  monster.statusTurns = 0;
  monster.sleepTurns = 0;
  monster.confusionTurns = 0;
}

// Reset stat stages (used on switch / end of battle)
function resetStatStages(monster) {
  if (!monster.statStages) monster.statStages = {};
  monster.statStages = { atk: 0, def: 0, spd: 0, acc: 0, eva: 0, spatk: 0, spdef: 0 };
}
