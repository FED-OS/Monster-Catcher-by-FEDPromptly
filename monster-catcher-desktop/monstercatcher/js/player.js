// ============================================================
//  Monster Catcher — Player
//  World state (current map), player position & movement, collision,
//  party, bag/inventory, money, dex, save/load via localStorage.
// ============================================================

// ---- Global world/player state ----
const world = {
  currentMap: "mossmere",
  transitioning: false,
  transitionAlpha: 0
};

const player = {
  col: 4,
  row: 4,
  facing: "down",
  moving: false,
  walkFrame: 0,   // 0=stand, 1/2=step (for animated overworld sprite)
  walkTimer: 0,   // ticks to alternate step frames while moving
  party: [],
  bag: {},       // itemKey -> count
  money: 1500,
  balls: 5,      // legacy; bag.basicball is the source of truth but kept for compat
  badges: [],
  flags: {},
  dex: { seen: {}, caught: {} },  // speciesKey -> true
  playtime: 0,
  starterChosen: false,
  // Mega-expansion fields
  heroId: "kael",          // chosen hero
  toolBag: {},             // toolId -> count (power-up tools separate from bag)
  equippedTools: {},       // monsterUniqueId -> [toolId, toolId, toolId]
  friendship: {},          // speciesKey -> 0-255
  visitedBiomes: {},       // biomeId -> true
  stepCount: 0             // for tracking world creature spawns & random events
};

// Initialize a brand-new game (called from "New Game" on title).
function initNewGame() {
  player.party = [];
  player.bag = {
    basicball: 10,
    potion: 5,
    antidote: 2
  };
  player.money = 1500;
  player.balls = 10;
  player.badges = [];
  player.flags = {};
  player.dex = { seen: {}, caught: {} };
  player.starterChosen = false;
  player.lastHealMap = "mossmere";
  player.lastHealPos = { col: 4, row: 7 };
  world.currentMap = "mossmere";
  player.col = 4;
  player.row = 4;
  player.facing = "down";
  // Mega-expansion init
  player.heroId = "kael";
  player.toolBag = {};
  player.equippedTools = {};
  player.friendship = {};
  player.visitedBiomes = {};
  player.stepCount = 0;
  game.flags = player.flags;
  // Initialize world creatures for the starting map
  if (typeof initWorldCreatures === "function") initWorldCreatures();
}

// ---- Movement ----
function tryMove(dCol, dRow) {
  if (player.moving || world.transitioning) return;
  if (dialogue) return;
  if (game.state !== GAME_STATE.OVERWORLD) return;

  if (dCol === -1) player.facing = "left";
  if (dCol === 1) player.facing = "right";
  if (dRow === -1) player.facing = "up";
  if (dRow === 1) player.facing = "down";

  const newCol = player.col + dCol;
  const newRow = player.row + dRow;

  // Ledges: only allow stepping onto a ledge when moving DOWN into it.
  if (isLedge(newCol, newRow) && dRow !== 1) return;

  if (isBlocked(newCol, newRow)) return;
  if (getNpcAt(newCol, newRow)) return;

  player.col = newCol;
  player.row = newRow;
  player.moving = true;
  player.walkFrame = 1; // begin stepping
  player.walkTimer = 0;
  setTimeout(() => { player.moving = false; player.walkFrame = 0; }, 90); // tiny step delay for feel

  // Warp tile?
  const warp = warpAt(newCol, newRow);
  if (warp) {
    doWarp(warp);
    return;
  }

  // Heal / shop tiles
  const map = currentMapData();
  const tileKey = newCol + "," + newRow;
  if (map.healTile === tileKey) {
    openHealPrompt();
    return;
  }
  if (map.shopTile === tileKey) {
    openShopPrompt();
    return;
  }
  if (map.gymLeaderTile === tileKey) {
    // Trigger gym leader battle directly if not defeated
    const leader = NPCS.find(n => n.map === world.currentMap && n.id === "gym_leader_frostine");
    if (leader && !leader.defeated) {
      startTrainerBattle(leader);
    }
    return;
  }

  // Encounter check
  if (isTallGrass(newCol, newRow) && map.encounters && map.encounters.length) {
    if (Math.random() < (map.rate || 0.12)) {
      startRandomEncounter();
      return;
    }
  }

  // ---- Mega Expansion: world creature collision ----
  if (typeof checkWorldCreatureCollision === "function") {
    if (checkWorldCreatureCollision(newCol, newRow)) return;
  }

  // ---- Mega Expansion: Krax ambush on steps (rare) ----
  player.stepCount = (player.stepCount || 0) + 1;
  if (typeof maybeTriggerKraxAmbush === "function") {
    maybeTriggerKraxAmbush();
  }
}

function doWarp(warp) {
  world.transitioning = true;
  world.transitionAlpha = 0;
  setTimeout(() => {
    world.currentMap = warp.dest;
    player.col = warp.col;
    player.row = warp.row;
    // Re-trigger any warp chain (e.g., door -> map -> nothing)
    const innerWarp = warpAt(player.col, player.row);
    if (innerWarp && innerWarp.dest !== world.currentMap) {
      // avoid infinite loop — only chain once
    }
    world.transitioning = false;
    // Spawn world creatures for the new map
    if (typeof initWorldCreatures === "function") initWorldCreatures();
  }, 320);
}

function tileInFrontOfPlayer() {
  const deltas = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const [dc, dr] = deltas[player.facing];
  return { col: player.col + dc, row: player.row + dr };
}

// ---- Interaction (talk to NPCs / read signs) ----
function interact() {
  const { col, row } = tileInFrontOfPlayer();
  const npc = getNpcAt(col, row);
  if (npc) {
    // Face the player
    npc.facing = oppositeFacing(player.facing);

    if (npc.isTrainer && !npc.defeated) {
      startTrainerBattle(npc);
      return;
    }
    if (npc.givesStarter && !player.starterChosen) {
      // If hero not yet chosen, show hero selection first
      if (!player.flags[FLAGS.CHOSEN_HERO] && typeof HERO_SELECT_DIALOGUE !== "undefined") {
        startDialogue(HERO_SELECT_DIALOGUE);
      } else {
        startDialogue(npc.dialogue);
      }
      return;
    }
    if (npc.givesBalls && !player.flags[FLAGS.GOT_FIRST_BALLS]) {
      startDialogue(npc.dialogue);
      player.flags[FLAGS.GOT_FIRST_BALLS] = true;
      // already has balls from initNewGame; mark flag
      return;
    }
    if (npc.isHealer) {
      startDialogue(["Welcome to the Healing Center! Healing now... __HEAL_NOW__"]);
      return;
    }
    if (npc.isShopkeeper) {
      if (npc.isToolShop) {
        startDialogue(["Scrap Merchant Rusty: Power-up tools for sale! __TOOL_SHOP_MENU__"]);
      } else {
        startDialogue(["Welcome to the Mart! __SHOP_MENU__"]);
      }
      return;
    }
    // Fast travel attendant
    if (npc.dialogue && npc.dialogue[0] && npc.dialogue[0].includes("__FAST_TRAVEL_MENU__")) {
      startDialogue(npc.dialogue);
      return;
    }
    // Contextual dialogue for special NPCs
    const ctx = getContextualNpcDialogue(npc.id);
    const lines = (npc.isTrainer && npc.defeated && npc.defeatedDialogue)
      ? npc.defeatedDialogue
      : npc.dialogue;
    // If contextual dialogue exists and NPC is non-trainer, occasionally use it
    if (ctx && !npc.isTrainer && Math.random() < 0.5) {
      startDialogue([ctx]);
    } else {
      startDialogue(lines);
    }
    return;
  }

  // Sign?
  const sign = signAt(col, row);
  if (sign) {
    startDialogue([sign]);
    return;
  }

  // Try staring contest with sleeping world creatures
  if (typeof tryStaringContest === 'function' && tryStaringContest()) {
    return;
  }

  // No interactable — open the start menu
  openStartMenu();
}

function oppositeFacing(f) {
  return { up: "down", down: "up", left: "right", right: "left" }[f] || "down";
}

// ---- Dialogue box state ----
let dialogue = null; // { lines, index } or null

function startDialogue(lines) {
  dialogue = { lines: lines.slice(), index: 0 };
}

function advanceDialogue() {
  if (!dialogue) return;
  dialogue.index++;
  if (dialogue.index >= dialogue.lines.length) {
    const lastLine = dialogue.lines[dialogue.lines.length - 1] || "";
    dialogue = null;
    handleDialogueEndTag(lastLine);
  }
}

// Detect special tags embedded at the end of a dialogue line.
function handleDialogueEndTag(line) {
  if (line.includes("__STARTER_MENU__")) {
    openStarterMenu();
  } else if (line.includes("__HERO_SELECT__")) {
    if (typeof openHeroSelectMenu === 'function') openHeroSelectMenu();
    else openStarterMenu(); // fallback
  } else if (line.includes("__HEAL_NOW__")) {
    healParty();
    recordHealLocation();
    startDialogue(["...and done! Your monsters are fully restored.", "Take care!"]);
  } else if (line.includes("__HEAL_MENU__")) {
    openHealPrompt();
  } else if (line.includes("__TOOL_SHOP_MENU__")) {
    if (typeof openToolShop === 'function') openToolShop();
    else openShop();
  } else if (line.includes("__FAST_TRAVEL_MENU__")) {
    if (typeof openFastTravelMenu === 'function') openFastTravelMenu();
  } else if (line.includes("__SHOP_MENU__")) {
    openShop();
  } else if (line.includes("__GIVE_BADGE_1__")) {
    if (!player.badges.includes("Frost Badge")) {
      player.badges.push("Frost Badge");
      startDialogue(["You received the Frost Badge!"]);
    }
  } else if (line.includes("__UNLOCK_FAST_TRAVEL__")) {
    unlockFastTravel();
    startDialogue(["Fast travel unlocked! Visit the Travel Attendant in Verdantown to reach the biomes."]);
  } else if (line.includes("__KRAX_BATTLE_1__")) {
    const kraxNpc = NPCS.find(n => n.id === "krax_1");
    if (kraxNpc) startTrainerBattle(kraxNpc);
  } else if (line.includes("__KRAX_BATTLE_2__")) {
    const kraxNpc = NPCS.find(n => n.id === "krax_2");
    if (kraxNpc) startTrainerBattle(kraxNpc);
  } else if (line.includes("__KRAX_BATTLE_3__")) {
    const kraxNpc = NPCS.find(n => n.id === "krax_3");
    if (kraxNpc) startTrainerBattle(kraxNpc);
  } else if (line.includes("__BOSS_BATTLE__")) {
    if (typeof startBossBattle === 'function') startBossBattle();
  } else if (line.includes("__BOSS_END__")) {
    if (typeof endBossBattle === 'function') endBossBattle();
  } else if (line.includes("__SLEEPING_GIANT_BATTLE__")) {
    // Triggered from branching dialogue
    const wild = createMonsterInstance("mossyGiant", Math.max(20, partyAverageLevel() + 3));
    markSeen("mossyGiant");
    battle = {
      isTrainerBattle: false, trainerNpc: null, enemyTeam: [wild], enemyIndex: 0,
      enemy: wild, player: firstUsableParty(), menu: "main", cursor: 0, subCursor: 0,
      message: `A wild ${wild.name} appeared!`, outcome: null, turnBusy: false,
      flashTimer: 0, shakeTimer: 0, ballAnim: 0, pendingPlayerMove: null,
      switching: false, messageQueue: [], afterMessage: null, awaitingContinue: true
    };
    game.state = GAME_STATE.BATTLE;
    sfxEncounter();
  } else if (line.includes("__MIMIC_BATTLE__")) {
    // Treasure chest mimic encounter
    const wild = createMonsterInstance("holographicMimic", Math.max(15, partyAverageLevel() + 1));
    markSeen("holographicMimic");
    battle = {
      isTrainerBattle: false, trainerNpc: null, enemyTeam: [wild], enemyIndex: 0,
      enemy: wild, player: firstUsableParty(), menu: "main", cursor: 0, subCursor: 0,
      message: `The treasure chest was a ${wild.name} in disguise!`, outcome: null,
      turnBusy: false, flashTimer: 0, shakeTimer: 0, ballAnim: 0, pendingPlayerMove: null,
      switching: false, messageQueue: [], afterMessage: null, awaitingContinue: true
    };
    game.state = GAME_STATE.BATTLE;
    sfxEncounter();
  } else if (line.includes("__BRANCH_")) {
    // Branching dialogue tag — handled by dialogue.js
    if (typeof handleBranchTag === 'function') handleBranchTag(line);
  }
}

function drawDialogue(ctx) {
  if (!dialogue) return;
  // GBA-style dialogue window: dark border, cream interior, accent edge
  const bx = 2, by = 116, bw = SCREEN_W - 4, bh = 42;
  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(bx + 2, by + 2, bw, bh);
  // border (dark blue)
  ctx.fillStyle = COLOR.winBorder;
  ctx.fillRect(bx, by, bw, bh);
  // light edge highlight
  ctx.fillStyle = COLOR.winBorderLight;
  ctx.fillRect(bx, by, bw, 1);
  ctx.fillRect(bx, by, 1, bh);
  // interior
  ctx.fillStyle = COLOR.winBg;
  ctx.fillRect(bx + 2, by + 2, bw - 4, bh - 4);
  // inner shadow line
  ctx.fillStyle = COLOR.winBgDark;
  ctx.fillRect(bx + 2, by + bh - 4, bw - 4, 2);

  ctx.fillStyle = COLOR.textDark;
  ctx.font = "7px monospace";
  let line = (dialogue.lines[dialogue.index] || "").replace(/__\w+__/g, "").trim();
  wrapText(ctx, line, 8, by + 12, SCREEN_W - 16, 9);

  // continue arrow (animated blinking)
  if (dialogue.index < dialogue.lines.length - 1) {
    if ((Math.floor(Date.now() / 300) % 2) === 0) {
      ctx.fillStyle = COLOR.winBorder;
      // small down-arrow
      ctx.fillRect(SCREEN_W - 12, by + bh - 12, 6, 1);
      ctx.fillRect(SCREEN_W - 11, by + bh - 11, 4, 1);
      ctx.fillRect(SCREEN_W - 10, by + bh - 10, 2, 1);
    }
  }
}

function drawPlayer(ctx) {
  const px = player.col * TILE;
  const py = player.row * TILE;

  // Advance walk animation while moving (alternates step frames 1<->2)
  if (player.moving) {
    player.walkTimer++;
    if (player.walkTimer > 5) {
      player.walkFrame = (player.walkFrame === 1) ? 2 : 1;
      player.walkTimer = 0;
    }
  } else {
    player.walkFrame = 0;
  }

  // Use the detailed GBA-style directional overworld sprite from sprites.js
  if (typeof drawPlayerOverworld === "function") {
    drawPlayerOverworld(ctx, px, py, player.facing, player.walkFrame);
  } else {
    // legacy fallback
    ctx.fillStyle = PALETTE.black;
    ctx.fillRect(px + 4, py + 2, 8, 12);
    ctx.fillStyle = PALETTE.light;
    ctx.fillRect(px + 6, py + 4, 4, 4);
    ctx.fillStyle = PALETTE.dark;
    if (player.facing === "down") ctx.fillRect(px + 7, py + 7, 2, 1);
    if (player.facing === "up") ctx.fillRect(px + 7, py + 3, 2, 1);
    if (player.facing === "left") ctx.fillRect(px + 5, py + 5, 1, 2);
    if (player.facing === "right") ctx.fillRect(px + 10, py + 5, 1, 2);
  }
}

// ---- Party helpers ----
function firstUsableParty() {
  return player.party.find(m => m.hp > 0) || player.party[0];
}

function addMonsterToParty(monster) {
  // dex tracking
  player.dex.caught[monster.speciesKey] = true;
  if (player.party.length < 6) {
    player.party.push(monster);
    return true;
  } else {
    // sent to "box" — we just keep a simple box array on player
    if (!player.box) player.box = [];
    player.box.push(monster);
    return false;
  }
}

function markSeen(speciesKey) {
  player.dex.seen[speciesKey] = true;
}

// ---- Bag helpers ----
function bagCount(itemKey) {
  return player.bag[itemKey] || 0;
}

function useItemFromBag(itemKey) {
  if (bagCount(itemKey) <= 0) return false;
  player.bag[itemKey] = bagCount(itemKey) - 1;
  return true;
}

function addItemToBag(itemKey, count) {
  count = count || 1;
  player.bag[itemKey] = bagCount(itemKey) + count;
}

// ---- Healing ----
function healParty() {
  player.party.forEach(m => {
    m.hp = m.maxHp;
    cureStatus(m);
    resetStatStages(m);
    // restore PP
    if (m.maxPp) {
      Object.keys(m.maxPp).forEach(mk => { m.pp[mk] = m.maxPp[mk]; });
    } else {
      // fallback: restore PP to move base values
      Object.keys(m.pp || {}).forEach(mk => {
        if (MOVES[mk]) m.pp[mk] = MOVES[mk].pp;
      });
    }
  });
}

// Record the current location as the last healing center visited.
// Called when the player uses a healing center so that a blackout
// warps them back here.
function recordHealLocation() {
  player.lastHealMap = world.currentMap;
  player.lastHealPos = { col: player.col, row: player.row };
}

// ---- Save / Load ----
const SAVE_KEY = "monsterCatcher_save_v1";

function saveGame() {
  try {
    const data = {
      currentMap: world.currentMap,
      col: player.col,
      row: player.row,
      facing: player.facing,
      party: player.party,
      bag: player.bag,
      money: player.money,
      badges: player.badges,
      flags: player.flags,
      dex: player.dex,
      starterChosen: player.starterChosen,
      playtime: player.playtime,
      box: player.box || [],
      lastHealMap: player.lastHealMap || "mossmere",
      lastHealPos: player.lastHealPos || { col: 4, row: 7 },
      defeatedNpcs: NPCS.filter(n => n.defeated).map(n => n.id),
      // Mega-expansion fields
      heroId: player.heroId || "kael",
      toolBag: player.toolBag || {},
      equippedTools: player.equippedTools || {},
      friendship: player.friendship || {},
      visitedBiomes: player.visitedBiomes || {},
      stepCount: player.stepCount || 0
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Save failed:", e);
    return false;
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    world.currentMap = data.currentMap || "mossmere";
    player.col = data.col ?? 4;
    player.row = data.row ?? 4;
    player.facing = data.facing || "down";
    player.party = data.party || [];
    player.bag = data.bag || { basicball: 10, potion: 5 };
    player.money = data.money ?? 1500;
    player.balls = player.bag.basicball || 0;
    player.badges = data.badges || [];
    player.flags = data.flags || {};
    player.dex = data.dex || { seen: {}, caught: {} };
    player.starterChosen = !!data.starterChosen;
    player.playtime = data.playtime || 0;
    player.box = data.box || [];
    player.lastHealMap = data.lastHealMap || "mossmere";
    player.lastHealPos = data.lastHealPos || { col: 4, row: 7 };
    // Mega-expansion restore
    player.heroId = data.heroId || "kael";
    player.toolBag = data.toolBag || {};
    player.equippedTools = data.equippedTools || {};
    player.friendship = data.friendship || {};
    player.visitedBiomes = data.visitedBiomes || {};
    player.stepCount = data.stepCount || 0;
    game.flags = player.flags;
    // Ensure party unique IDs
    ensurePartyUniqueIds();
    // Restore defeated trainer flags
    (data.defeatedNpcs || []).forEach(id => {
      const n = NPCS.find(x => x.id === id);
      if (n) n.defeated = true;
    });
    return true;
  } catch (e) {
    console.error("Load failed:", e);
    return false;
  }
}

function hasSave() {
  try { return !!localStorage.getItem(SAVE_KEY); } catch (e) { return false; }
}

function deleteSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}

// ============================================================
//  MEGA EXPANSION — Player helpers: tools, hero, fast travel,
//  Krax defense, friendship
// ============================================================

// ---- Item helpers (used by boss rewards, quirk scavenging, etc.) ----
function giveItem(itemKey, count) {
  count = count || 1;
  player.bag[itemKey] = (player.bag[itemKey] || 0) + count;
}

// ---- Tool (power-up) inventory helpers ----
function giveTool(toolId, count) {
  count = count || 1;
  player.toolBag[toolId] = (player.toolBag[toolId] || 0) + count;
}

function toolCount(toolId) {
  return player.toolBag[toolId] || 0;
}

function useTool(toolId) {
  if (toolCount(toolId) <= 0) return false;
  player.toolBag[toolId] = toolCount(toolId) - 1;
  return true;
}

// ---- Equipped tools on a monster ----
function getEquippedTools(monster) {
  if (!monster) return [];
  const uid = monster.uniqueId || monster.speciesKey;
  if (!player.equippedTools[uid]) player.equippedTools[uid] = [];
  return player.equippedTools[uid];
}

function equipToolToMonster(monster, toolId) {
  if (!monster) return false;
  const uid = monster.uniqueId || monster.speciesKey;
  if (!player.equippedTools[uid]) player.equippedTools[uid] = [];
  const equipped = player.equippedTools[uid];
  if (equipped.length >= MAX_EQUIPPED_TOOLS) return false;
  if (equipped.includes(toolId)) return false;
  if (toolCount(toolId) <= 0) return false;
  equipped.push(toolId);
  useTool(toolId);
  return true;
}

function unequipToolFromMonster(monster, toolId) {
  if (!monster) return false;
  const uid = monster.uniqueId || monster.speciesKey;
  if (!player.equippedTools[uid]) return false;
  const idx = player.equippedTools[uid].indexOf(toolId);
  if (idx < 0) return false;
  player.equippedTools[uid].splice(idx, 1);
  giveTool(toolId);
  return true;
}

// ---- Hero selection ----
function chooseHero(heroId) {
  if (!HEROES[heroId]) return false;
  player.heroId = heroId;
  player.flags[FLAGS.CHOSEN_HERO] = true;
  return true;
}

function currentHero() {
  return HEROES[player.heroId] || HEROES.kael;
}

// ---- Fast travel ----
function unlockFastTravel() {
  player.flags[FLAGS.FAST_TRAVEL] = true;
}

function canFastTravel() {
  return !!player.flags[FLAGS.FAST_TRAVEL];
}

function fastTravelTo(mapId) {
  const map = MAPS[mapId];
  if (!map) return false;
  if (typeof sfxWarp === "function") sfxWarp();
  // Find the door/warp entry point on the destination map
  // Default to a safe position
  world.currentMap = mapId;
  // Try to find a walkable tile near the entrance
  for (let r = 0; r < map.grid.length; r++) {
    for (let c = 0; c < map.grid[r].length; c++) {
      if (!isBlocked(c, r) && !isLedge(c, r)) {
        player.col = c;
        player.row = r;
        player.facing = "down";
        // Spawn world creatures for the new map
        if (typeof initWorldCreatures === 'function') initWorldCreatures();
        return true;
      }
    }
  }
  player.col = 4;
  player.row = 4;
  return true;
}

function unlockedBiomes() {
  return BIOME_IDS.filter(id => player.visitedBiomes[id]);
}

function markBiomeVisited(biomeId) {
  player.visitedBiomes[biomeId] = true;
}

// ---- Friendship system ----
function getFriendship(speciesKey) {
  return player.friendship[speciesKey] || FRIENDSHIP_HATCH;
}

function addFriendship(speciesKey, amount) {
  amount = amount || 1;
  const current = getFriendship(speciesKey);
  player.friendship[speciesKey] = Math.min(FRIENDSHIP_MAX, current + amount);
}

function friendshipLevel(speciesKey) {
  const f = getFriendship(speciesKey);
  if (f >= FRIENDSHIP_HIGH) return "MAX";
  if (f >= FRIENDSHIP_MID) return "HIGH";
  if (f >= FRIENDSHIP_LOW) return "MID";
  return "LOW";
}

// ---- Krax stealing defense ----
// When Krax tries to steal a tool, the player can defend if they have a
// "defense tool" equipped or if they pass a luck check.
function kraxStealAttempt() {
  // 8% chance per step in certain conditions
  const equippedToolIds = [];
  player.party.forEach(m => {
    getEquippedTools(m).forEach(t => equippedToolIds.push(t));
  });
  // Krax can only steal if the player has tools
  if (equippedToolIds.length === 0) return null;

  // Check if any equipped tool provides defense (magnetGloves, stormShield)
  const hasDefense = equippedToolIds.some(tid => {
    const tool = typeof getTool === 'function' ? getTool(tid) : null;
    return tool && (tid === "magnetGloves" || tid === "stormShield" || tid === "holoCloak");
  });

  if (hasDefense) {
    // 60% chance to block with defense tool
    if (Math.random() < 0.6) {
      return { result: "blocked", line: KRAX_DIALOGUE.stealFail[0] };
    }
  }

  // No defense — Krax steals a random tool
  const stolen = equippedToolIds[Math.floor(Math.random() * equippedToolIds.length)];
  // Remove from equipped
  for (const m of player.party) {
    if (unequipToolFromMonster(m, stolen)) break;
  }
  return { result: "stolen", tool: stolen, line: KRAX_DIALOGUE.stealSuccess[Math.floor(Math.random() * KRAX_DIALOGUE.stealSuccess.length)] };
}

// ---- Random Krax encounter in overworld ----
function maybeTriggerKraxAmbush() {
  if (!KRAX_STATE) return false;
  KRAX_STATE.cooldown--;
  if (KRAX_STATE.cooldown > 0) return false;
  if (Math.random() > KRAX_STATE.encounterChance) return false;

  // Only if player has tools and hasn't defeated Krax at current stage
  const hasTools = Object.keys(player.toolBag).filter(t => toolCount(t) > 0).length > 0;
  if (!hasTools) return false;
  if (player.flags[FLAGS.KRAX_DEFEATED_1] && player.flags[FLAGS.KRAX_DEFEATED_2]) return false;

  // Krax ambush: show dialogue and attempt steal
  KRAX_STATE.cooldown = KRAX_STATE.minCooldown;
  if (typeof sfxKraxAmbush === "function") sfxKraxAmbush();
  const steal = kraxStealAttempt();
  if (steal) {
    if (typeof sfxSteal === "function") sfxSteal();
    const lines = [
      "Krax appears from the shadows!",
      steal.line
    ];
    startDialogue(lines);
    return true;
  }
  return false;
}

// ---- Assign unique IDs to party monsters for tool tracking ----
function ensurePartyUniqueIds() {
  player.party.forEach((m, i) => {
    if (!m.uniqueId) m.uniqueId = m.speciesKey + "_" + i + "_" + Date.now();
  });
}

// ---- Gain friendship on battle actions ----
function gainBattleFriendship(monster, amount) {
  if (!monster) return;
  addFriendship(monster.speciesKey, amount || 1);
}

// ---- Check if a monster can evolve via friendship ----
function checkFriendshipEvolution(monster) {
  if (!monster) return false;
  return getFriendship(monster.speciesKey) >= FRIENDSHIP_HIGH;
}
