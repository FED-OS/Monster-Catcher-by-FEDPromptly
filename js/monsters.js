// ---- Move data ----
const MOVES = {
  tackle:    { name: "Tackle",     power: 35, accuracy: 100, type: "normal" },
  bite:      { name: "Bite",       power: 45, accuracy: 95,  type: "normal" },
  ember:     { name: "Ember",      power: 40, accuracy: 100, type: "fire" },
  flamerush: { name: "Flame Rush", power: 65, accuracy: 90,  type: "fire" },
  bubble:    { name: "Bubble",     power: 40, accuracy: 100, type: "water" },
  aquajet:   { name: "Aqua Jet",   power: 60, accuracy: 95,  type: "water" },
  vinewhip:  { name: "Vine Whip",  power: 40, accuracy: 100, type: "grass" },
  leafblade: { name: "Leaf Blade", power: 60, accuracy: 95,  type: "grass" },
  sparkbolt: { name: "Sparkbolt",  power: 45, accuracy: 100, type: "electric" },
  thunderjolt:{name: "Thunderjolt",power: 65, accuracy: 90,  type: "electric" },
  mudslap:   { name: "Mud Slap",   power: 35, accuracy: 100, type: "ground" },
  sandtomb:  { name: "Sand Tomb",  power: 55, accuracy: 90,  type: "ground" },
  gust:      { name: "Gust",       power: 40, accuracy: 100, type: "flying" },
  windcutter:{ name: "Wind Cutter",power: 60, accuracy: 95,  type: "flying" },
  sting:     { name: "Sting",      power: 35, accuracy: 100, type: "poison" },
  toxinspit: { name: "Toxin Spit", power: 55, accuracy: 90,  type: "poison" }
};

// Type effectiveness chart: attacker type -> defender type -> multiplier
// Loosely mirrors the classic 6-type core (fire/water/grass/electric/ground/flying) plus normal/poison
const TYPE_CHART = {
  fire:     { grass: 2, ground: 1, water: 0.5, fire: 0.5, electric: 1 },
  water:    { fire: 2, ground: 2, grass: 0.5, water: 0.5, electric: 0.5 },
  grass:    { water: 2, ground: 2, fire: 0.5, grass: 0.5, flying: 0.5, poison: 0.5 },
  electric: { water: 2, flying: 2, grass: 0.5, electric: 0.5, ground: 0 },
  ground:   { fire: 2, electric: 2, poison: 2, grass: 0.5, flying: 0 },
  flying:   { grass: 2, ground: 1, electric: 0.5, poison: 1 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5 },
  normal:   {}
};

function typeMultiplier(attackType, defenderType) {
  const row = TYPE_CHART[attackType];
  if (!row) return 1;
  return row[defenderType] !== undefined ? row[defenderType] : 1;
}

// ---- Species data ----
// color/shape are used by battle.js/player.js to draw a distinct procedural
// sprite per species (no image files needed). See js/sprites.js to swap in
// real hand-drawn PNGs later without touching this data.
const SPECIES = {
  // --- Starter line (fire) ---
  emberit: {
    name: "Emberit", type: "fire", color: "#e0763f", shape: "quad",
    baseHp: 39, baseAtk: 52, baseDef: 43, baseSpd: 65,
    moves: ["tackle", "ember"],
    catchRate: 45,
    evolvesTo: "infernyx", evolvesAt: 16
  },
  infernyx: {
    name: "Infernyx", type: "fire", color: "#c9481f", shape: "spiky",
    baseHp: 58, baseAtk: 78, baseDef: 62, baseSpd: 90,
    moves: ["tackle", "ember", "flamerush"],
    catchRate: 45
  },

  // --- Starter line (water) ---
  aquip: {
    name: "Aquip", type: "water", color: "#4f8fd6", shape: "round",
    baseHp: 44, baseAtk: 48, baseDef: 65, baseSpd: 43,
    moves: ["tackle", "bubble"],
    catchRate: 45,
    evolvesTo: "tidalon", evolvesAt: 16
  },
  tidalon: {
    name: "Tidalon", type: "water", color: "#2f6bb0", shape: "finned",
    baseHp: 63, baseAtk: 70, baseDef: 88, baseSpd: 60,
    moves: ["tackle", "bubble", "aquajet"],
    catchRate: 45
  },

  // --- Starter line (grass) ---
  leafon: {
    name: "Leafon", type: "grass", color: "#5fb04f", shape: "round",
    baseHp: 45, baseAtk: 49, baseDef: 49, baseSpd: 45,
    moves: ["tackle", "vinewhip"],
    catchRate: 45,
    evolvesTo: "florahn", evolvesAt: 16
  },
  florahn: {
    name: "Florahn", type: "grass", color: "#3f8a35", shape: "spiky",
    baseHp: 65, baseAtk: 72, baseDef: 68, baseSpd: 58,
    moves: ["tackle", "vinewhip", "leafblade"],
    catchRate: 45
  },

  // --- Early-route common line (normal, classic "route 1 rat") ---
  rattick: {
    name: "Rattick", type: "normal", color: "#a8a29e", shape: "round",
    baseHp: 30, baseAtk: 56, baseDef: 35, baseSpd: 72,
    moves: ["tackle", "bite"],
    catchRate: 255,
    evolvesTo: "rattigor", evolvesAt: 12
  },
  rattigor: {
    name: "Rattigor", type: "normal", color: "#78716c", shape: "spiky",
    baseHp: 45, baseAtk: 78, baseDef: 50, baseSpd: 92,
    moves: ["tackle", "bite"],
    catchRate: 90
  },

  // --- Electric line ---
  sparkit: {
    name: "Sparkit", type: "electric", color: "#e8d84f", shape: "quad",
    baseHp: 35, baseAtk: 55, baseDef: 40, baseSpd: 80,
    moves: ["tackle", "sparkbolt"],
    catchRate: 120,
    evolvesTo: "voltagon", evolvesAt: 14
  },
  voltagon: {
    name: "Voltagon", type: "electric", color: "#d4b91f", shape: "finned",
    baseHp: 55, baseAtk: 75, baseDef: 55, baseSpd: 105,
    moves: ["tackle", "sparkbolt", "thunderjolt"],
    catchRate: 60
  },

  // --- Ground, single-stage ---
  digmole: {
    name: "Digmole", type: "ground", color: "#b08d57", shape: "round",
    baseHp: 50, baseAtk: 60, baseDef: 70, baseSpd: 35,
    moves: ["tackle", "mudslap", "sandtomb"],
    catchRate: 100
  },

  // --- Flying, single-stage ---
  breezel: {
    name: "Breezel", type: "flying", color: "#bcd9e8", shape: "finned",
    baseHp: 42, baseAtk: 50, baseDef: 42, baseSpd: 85,
    moves: ["tackle", "gust", "windcutter"],
    catchRate: 90
  },

  // --- Poison, single-stage ---
  toxipod: {
    name: "Toxipod", type: "poison", color: "#8f5fb0", shape: "spiky",
    baseHp: 48, baseAtk: 52, baseDef: 58, baseSpd: 40,
    moves: ["tackle", "sting", "toxinspit"],
    catchRate: 110
  }
};

// Create a live battle-ready instance of a species at a given level
function createMonsterInstance(speciesKey, level) {
  const sp = SPECIES[speciesKey];
  const stat = (base) => Math.floor(((base * 2) * level) / 100) + level + 5;
  const maxHp = Math.floor(((sp.baseHp * 2) * level) / 100) + level + 10;

  return {
    speciesKey,
    name: sp.name,
    type: sp.type,
    color: sp.color,
    shape: sp.shape,
    level,
    xp: 0,
    maxHp,
    hp: maxHp,
    atk: stat(sp.baseAtk),
    def: stat(sp.baseDef),
    spd: stat(sp.baseSpd),
    moves: sp.moves.slice(),
    catchRate: sp.catchRate
  };
}

function calcDamage(attacker, defender, moveKey) {
  const move = MOVES[moveKey];
  const mult = typeMultiplier(move.type, defender.type);
  const base = (((2 * attacker.level / 5 + 2) * move.power * (attacker.atk / defender.def)) / 50) + 2;
  const dmg = Math.max(1, Math.floor(base * mult));
  return { dmg, mult, move };
}

// Classic-style catch chance formula (simplified)
function catchChance(monster, ballBonus) {
  const hpFactor = (3 * monster.maxHp - 2 * monster.hp) / (3 * monster.maxHp);
  const a = hpFactor * monster.catchRate * ballBonus;
  const chance = Math.min(1, a / 255);
  return chance;
}

// XP needed to reach a given level (simple cubic curve, same shape as classic games)
function xpForLevel(level) {
  return Math.floor(Math.pow(level, 3));
}

// Award XP after winning a battle; returns info about level-ups/evolution for messaging
function grantExperience(monster, defeatedLevel) {
  const gained = Math.max(1, Math.floor(defeatedLevel * 12));
  monster.xp += gained;

  const events = { gained, leveledUp: false, evolvedTo: null };

  while (monster.xp >= xpForLevel(monster.level + 1)) {
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

    if (sp.evolvesTo && monster.level >= sp.evolvesAt) {
      const newSp = SPECIES[sp.evolvesTo];
      monster.speciesKey = sp.evolvesTo;
      monster.name = newSp.name;
      monster.type = newSp.type;
      monster.color = newSp.color;
      monster.shape = newSp.shape;
      monster.moves = newSp.moves.slice();
      events.evolvedTo = newSp.name;
    }
  }

  return events;
}
