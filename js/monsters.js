// ---- Move data ----
const MOVES = {
  tackle:   { name: "Tackle",   power: 35, accuracy: 100, type: "normal" },
  ember:    { name: "Ember",    power: 40, accuracy: 100, type: "fire" },
  bubble:   { name: "Bubble",   power: 40, accuracy: 100, type: "water" },
  vinewhip: { name: "Vine Whip",power: 40, accuracy: 100, type: "grass" },
  bite:     { name: "Bite",     power: 45, accuracy: 95,  type: "normal" }
};

// Simple type effectiveness chart: attacker type -> defender type -> multiplier
const TYPE_CHART = {
  fire:   { grass: 2, water: 0.5, fire: 0.5 },
  water:  { fire: 2, grass: 0.5, water: 0.5 },
  grass:  { water: 2, fire: 0.5, grass: 0.5 },
  normal: {}
};

function typeMultiplier(attackType, defenderType) {
  const row = TYPE_CHART[attackType];
  if (!row) return 1;
  return row[defenderType] !== undefined ? row[defenderType] : 1;
}

// ---- Species data ----
// color is used to draw a simple procedural pixel-blob sprite (no image files needed)
const SPECIES = {
  emberit: {
    name: "Emberit", type: "fire", color: "#e0763f",
    baseHp: 39, baseAtk: 52, baseDef: 43, baseSpd: 65,
    moves: ["tackle", "ember"],
    catchRate: 45
  },
  aquip: {
    name: "Aquip", type: "water", color: "#4f8fd6",
    baseHp: 44, baseAtk: 48, baseDef: 65, baseSpd: 43,
    moves: ["tackle", "bubble"],
    catchRate: 45
  },
  leafon: {
    name: "Leafon", type: "grass", color: "#5fb04f",
    baseHp: 45, baseAtk: 49, baseDef: 49, baseSpd: 45,
    moves: ["tackle", "vinewhip"],
    catchRate: 45
  },
  rattick: {
    name: "Rattick", type: "normal", color: "#a8a29e",
    baseHp: 30, baseAtk: 56, baseDef: 35, baseSpd: 72,
    moves: ["tackle", "bite"],
    catchRate: 255 // very easy to catch, classic "route 1 rat" role
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
    level,
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
