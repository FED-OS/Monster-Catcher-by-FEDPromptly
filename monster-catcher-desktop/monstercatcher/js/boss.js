// ============================================================
//  Monster Catcher — Boss Battle: Giga-Thok the Treasure Golem
//  Multi-phase boss with 4 phases, unique dialogue per phase,
//  special mechanics, and 3 endings (spare / defeat / hug).
// ============================================================

// ---- Boss battle state (extends the normal battle object) ----
// When a boss battle is active, battle.isBoss = true and we use
// the functions in this file to drive phase transitions, special
// mechanics, and the final choice.

let bossState = null;

// ---- Start the Giga-Thok boss battle ----
function startBossBattle() {
  const boss = BOSS_GIGA_THOK;
  const level = boss.level || 30;
  // Build the boss as a special monster instance with boosted HP
  const bossMon = createBossInstance(boss, level);

  markSeen("junkgolem");

  if (typeof sfxBossRoar === "function") sfxBossRoar();

  battle = {
    isTrainerBattle: false,
    isBossBattle: true,
    trainerNpc: null,
    enemyTeam: [bossMon],
    enemyIndex: 0,
    enemy: bossMon,
    player: firstUsableParty(),
    menu: "main",
    cursor: 0,
    subCursor: 0,
    message: boss.preBattle,
    outcome: null,
    turnBusy: false,
    flashTimer: 0,
    shakeTimer: 0,
    ballAnim: 0,
    pendingPlayerMove: null,
    switching: false,
    messageQueue: [],
    afterMessage: null,
    awaitingContinue: true,
    // Boss-specific
    bossPhase: 0,
    bossPhaseChanged: false,
    bossEnding: null
  };

  bossState = {
    phase: 0,
    phaseTransitionPending: false,
    endingChoice: null,
    hugCount: 0,
    treasureStolen: 0
  };

  game.state = GAME_STATE.BATTLE;
  sfxEncounter();
  // Big boss intro shake
  triggerScreenShake(8, 30);
}

// ---- Create a boss monster instance with boosted stats ----
function createBossInstance(boss, level) {
  // Use junkgolem as the base species for sprite/stats
  const base = createMonsterInstance("junkgolem", level);
  // Override with boss data
  base.name = boss.name;
  base.maxHp = boss.maxHpBase || 300;
  base.hp = base.maxHp;
  base.isBoss = true;
  // Boost stats significantly
  base.atk = Math.floor(base.atk * 1.5);
  base.def = Math.floor(base.def * 1.3);
  base.spd = Math.floor(base.spd * 0.8);  // bosses are slower but tankier
  // Give boss a special set of moves
  base.moves = ["tackle", "rockThrow", "ironDefense", "earthquake"];
  base.pp = {};
  base.maxPp = {};
  base.moves.forEach(mk => { base.pp[mk] = 99; base.maxPp[mk] = 99; });  // infinite PP for boss
  return base;
}

// ---- Boss phase definitions (from characters.js BOSS_GIGA_THOK.phases) ----
// Phase 0: The Clumsy Construct (75-100% HP)
// Phase 1: The Overclocked Apex (40-75% HP)
// Phase 2: The Desperate Hoarder (10-40% HP)
// Phase 3: The Lost Soul (0-10% HP)

// ---- Check and transition boss phases based on HP percentage ----
function checkBossPhaseTransition() {
  if (!battle || !battle.isBossBattle) return;
  const boss = battle.enemy;
  const hpPct = boss.hp / boss.maxHp;
  const oldPhase = bossState.phase;

  let newPhase = 0;
  if (hpPct <= 0.10) newPhase = 3;
  else if (hpPct <= 0.40) newPhase = 2;
  else if (hpPct <= 0.75) newPhase = 1;
  else newPhase = 0;

  if (newPhase !== oldPhase) {
    bossState.phase = newPhase;
    bossState.phaseTransitionPending = true;
    battle.bossPhase = newPhase;
    battle.bossPhaseChanged = true;
    // Trigger phase transition effects
    triggerBossPhaseTransition(newPhase);
  }
}

// ---- Trigger boss phase transition (dialogue + effects) ----
function triggerBossPhaseTransition(phase) {
  const phases = BOSS_GIGA_THOK.phases;
  if (!phases || !phases[phase]) return;

  const phaseData = phases[phase];
  // Queue the phase intro dialogue
  if (phaseData.intro) {
    battle.messageQueue.push(phaseData.intro);
  }

  // Visual effects per phase
  battle.flashTimer = 20;
  triggerScreenShake(6, 25);
  if (typeof sfxBossPhase === "function") sfxBossPhase();

  // Apply phase-specific buffs to the boss
  const boss = battle.enemy;
  if (phase === 1) {
    // Overclocked: +1 ATK, +1 SPD
    boss.statStages.atk = Math.min(6, boss.statStages.atk + 1);
    boss.statStages.spd = Math.min(6, boss.statStages.spd + 1);
  } else if (phase === 2) {
    // Desperate: +2 DEF (hoarding treasure as armor), gets a new move
    boss.statStages.def = Math.min(6, boss.statStages.def + 2);
    if (!boss.moves.includes("treasureFling")) {
      boss.moves.push("treasureFling");
      boss.pp["treasureFling"] = 99;
      boss.maxPp["treasureFling"] = 99;
    }
  } else if (phase === 3) {
    // Lost Soul: heals 10% HP (last stand), DEF drops (vulnerable)
    boss.hp = Math.min(boss.maxHp, boss.hp + Math.floor(boss.maxHp * 0.10));
    boss.statStages.def = Math.max(-6, boss.statStages.def - 2);
  }
}

// ---- Get boss dialogue for current context ----
function bossDialogue(context) {
  const phases = BOSS_GIGA_THOK.phases;
  if (!phases || !phases[bossState.phase]) return null;
  const phaseData = phases[bossState.phase];
  if (!phaseData[context]) return null;
  const lines = phaseData[context];
  return lines[Math.floor(Math.random() * lines.length)];
}

// ---- Boss picks a move (phase-aware AI) ----
function bossChooseMove() {
  if (!battle || !battle.isBossBattle) return "tackle";
  const boss = battle.enemy;
  const phase = bossState.phase;
  const available = boss.moves.filter(mk => (boss.pp[mk] || 0) > 0);

  // Phase 0: mostly basic attacks, occasionally clumsy
  if (phase === 0) {
    // 60% tackle, 30% rockThrow, 10% ironDefense
    const r = Math.random();
    if (r < 0.1 && available.includes("ironDefense")) return "ironDefense";
    if (r < 0.4 && available.includes("rockThrow")) return "rockThrow";
    return available.includes("tackle") ? "tackle" : available[0];
  }

  // Phase 1: Overclocked — aggressive, uses earthquake
  if (phase === 1) {
    const r = Math.random();
    if (r < 0.3 && available.includes("earthquake")) return "earthquake";
    if (r < 0.6 && available.includes("rockThrow")) return "rockThrow";
    return available.includes("tackle") ? "tackle" : available[0];
  }

  // Phase 2: Desperate — uses treasureFling if available
  if (phase === 2) {
    const r = Math.random();
    if (r < 0.4 && available.includes("treasureFling")) return "treasureFling";
    if (r < 0.7 && available.includes("rockThrow")) return "rockThrow";
    return available.includes("earthquake") ? "earthquake" : available[0];
  }

  // Phase 3: Lost Soul — mostly flails (tackle), occasionally earthquake
  const r = Math.random();
  if (r < 0.2 && available.includes("earthquake")) return "earthquake";
  return available.includes("tackle") ? "tackle" : available[0];
}

// ---- Boss takes a turn (replaces enemyTurn for boss battles) ----
function bossTurn() {
  if (!battle || !battle.isBossBattle || battle.outcome) return;
  const boss = battle.enemy;

  // Check if boss is statused and can't move
  if (boss.status === STATUS.SLEEP && boss.sleepTurns > 0) {
    battle.messageQueue.push(`${boss.name} is fast asleep...`);
    boss.sleepTurns--;
    if (boss.sleepTurns <= 0) {
      boss.status = STATUS.NONE;
      battle.messageQueue.push(`${boss.name} woke up!`);
    }
    return;
  }
  if (boss.status === STATUS.FREEZE) {
    battle.messageQueue.push(`${boss.name} is frozen solid!`);
    if (Math.random() < 0.2) {
      boss.status = STATUS.NONE;
      battle.messageQueue.push(`${boss.name} thawed out!`);
    }
    return;
  }
  if (boss.status === STATUS.PARALYSIS && Math.random() < 0.25) {
    battle.messageQueue.push(`${boss.name} is paralyzed and can't move!`);
    return;
  }

  // Confusion check
  if (boss.status === STATUS.CONFUSION && boss.confusionTurns > 0) {
    boss.confusionTurns--;
    if (Math.random() < 0.5) {
      // Self-hit from confusion
      const selfDmg = Math.floor(boss.maxHp * 0.05);
      boss.hp = Math.max(0, boss.hp - selfDmg);
      battle.messageQueue.push(`${boss.name} hurt itself in confusion!`);
      battle.shakeTimer = 10;
      if (boss.hp <= 0) {
        battle.messageQueue.push(`${boss.name} collapsed!`);
        handleBossDefeat();
        return;
      }
      if (boss.confusionTurns <= 0) boss.status = STATUS.NONE;
      return;
    }
    if (boss.confusionTurns <= 0) boss.status = STATUS.NONE;
  }

  // Pick and execute a move
  const moveKey = bossChooseMove();
  executeBossMove(moveKey);

  // Phase taunts: 20% chance to say something after attacking
  if (Math.random() < 0.2 && battle.outcome === null) {
    const taunt = bossDialogue("taunt");
    if (taunt) battle.messageQueue.push(taunt);
  }
}

// ---- Execute a boss move ----
function executeBossMove(moveKey) {
  const move = MOVES[moveKey];
  if (!move) return;
  const boss = battle.enemy;
  const target = battle.player;

  // treasureFling: custom boss move
  if (moveKey === "treasureFling") {
    const dmg = Math.floor(boss.maxHp * 0.08) + 15;
    target.hp = Math.max(0, target.hp - dmg);
    battle.messageQueue.push(`${boss.name} flung its stolen treasure!`);
    battle.messageQueue.push(`${target.name} took ${dmg} damage!`);
    battle.shakeTimer = 15;
    battle.flashTimer = 10;
    // 30% chance to steal an item
    if (Math.random() < 0.3 && Object.keys(player.bag).length > 0) {
      const items = Object.keys(player.bag).filter(k => player.bag[k] > 0);
      if (items.length) {
        const stolen = items[Math.floor(Math.random() * items.length)];
        player.bag[stolen] = Math.max(0, player.bag[stolen] - 1);
        bossState.treasureStolen++;
        battle.messageQueue.push(`${boss.name} stole a ${stolen}!`);
      }
    }
    if (target.hp <= 0) handleBossPlayerFaint();
    return;
  }

  // Normal move: use the existing damage system
  const result = calcDamage(boss, target, moveKey, { isBossAttack: true });
  if (result.move && result.move.category !== MOVE_CATEGORY.STATUS) {
    target.hp = Math.max(0, target.hp - result.dmg);
    let msg = `${boss.name} used ${result.move.name}!`;
    if (result.crit) msg += " A critical hit!";
    if (result.mult > 1) msg += " It's super effective!";
    else if (result.mult < 1 && result.mult > 0) msg += " It's not very effective...";
    battle.messageQueue.push(msg);
    battle.shakeTimer = result.crit ? 20 : 12;
    battle.flashTimer = 8;
    if (target.hp <= 0) {
      handleBossPlayerFaint();
      return;
    }
  } else {
    // Status move
    battle.messageQueue.push(`${boss.name} used ${move.name}!`);
    if (moveKey === "ironDefense") {
      boss.statStages.def = Math.min(6, boss.statStages.def + 2);
      battle.messageQueue.push(`${boss.name}'s Defense rose sharply!`);
    }
  }
}

// ---- Handle player monster fainting during boss battle ----
function handleBossPlayerFaint() {
  battle.player.hp = 0;
  battle.messageQueue.push(`${battle.player.name} fainted!`);
  // Check if any party members are still alive
  const next = firstUsableParty();
  if (!next || next.hp <= 0) {
    // All party fainted — boss wins (but player doesn't "lose" the game, just retreats)
    battle.outcome = "lost";
    battle.messageQueue.push("You have no more creatures able to battle...");
    battle.messageQueue.push("You retreat from Giga-Thok's lair!");
    battle.afterMessage = () => {
      // Heal party and return to last heal point
      healParty();
      world.currentMap = player.lastHealMap || "mossmere";
      player.col = player.lastHealPos ? player.lastHealPos.col : 4;
      player.row = player.lastHealPos ? player.lastHealPos.row : 7;
      game.state = GAME_STATE.OVERWORLD;
      battle = null;
      bossState = null;
    };
  } else {
    // Prompt to switch
    battle.switching = true;
    battle.menu = "party";
    battle.messageQueue.push("Choose your next creature!");
  }
}

// ---- Handle boss being defeated (HP reaches 0) ----
function handleBossDefeat() {
  battle.enemy.hp = 0;
  battle.messageQueue.push(`${battle.enemy.name} was defeated!`);
  // Don't end the battle — go to the final choice
  battle.outcome = "bossDefeated";
  battle.bossEnding = "defeat";
  battle.awaitingContinue = true;
  battle.afterMessage = () => {
    openBossFinalChoice();
  };
}

// ---- Open the boss final choice menu (spare / defeat / hug) ----
function openBossFinalChoice() {
  game.state = GAME_STATE.MENU;
  menu = { type: "bossChoice", cursor: 0 };
  // Trigger the branching dialogue
  if (typeof startBranchDialogue === 'function') {
    startBranchDialogue("bossFinalChoice");
  }
}

// ---- Resolve the boss ending based on player choice ----
function resolveBossEnding(choice) {
  if (!battle || !battle.isBossBattle) return;
  const phases = BOSS_GIGA_THOK.phases;
  const lastPhase = phases[bossState.phase] || phases[3];
  let endingDialogue = [];
  let rewards = { money: 0, items: [] };

  switch (choice) {
    case "spare":
      bossState.endingChoice = "spare";
      if (lastPhase.endingSpare) {
        endingDialogue = Array.isArray(lastPhase.endingSpare) ? lastPhase.endingSpare : [lastPhase.endingSpare];
      }
      // Spare: boss gives treasure as thanks
      rewards.money = 2000;
      rewards.items = ["starFragment", "potion", "potion", "basicball", "basicball"];
      player.flags[FLAGS.BOSS_SPARED] = true;
      break;

    case "defeat":
      bossState.endingChoice = "defeat";
      if (typeof sfxVictory === "function") sfxVictory();
      if (lastPhase.endingDefeat) {
        endingDialogue = Array.isArray(lastPhase.endingDefeat) ? lastPhase.endingDefeat : [lastPhase.endingDefeat];
      }
      // Defeat: more money but boss is gone
      rewards.money = 3000;
      rewards.items = ["starFragment", "goldenChefHat"];
      player.flags[FLAGS.BOSS_DEFEATED] = true;
      break;

    case "hug":
      bossState.endingChoice = "hug";
      bossState.hugCount++;
      if (lastPhase.endingHug) {
        endingDialogue = Array.isArray(lastPhase.endingHug) ? lastPhase.endingHug : [lastPhase.endingHug];
      }
      // Hug: boss becomes a friend/companion, best ending
      rewards.money = 1000;
      rewards.items = ["starFragment", "hugMachineBelt"];
      // Add boss as a companion
      player.flags[FLAGS.BOSS_HUGGED] = true;
      if (typeof getCompanion === 'function') {
        // Mark giga-thok as befriended
        player.flags["gigaThokBefriended"] = true;
      }
      break;
  }

  // Apply rewards
  player.money += rewards.money;
  rewards.items.forEach(item => {
    if (typeof giveItem === 'function') giveItem(item);
    else player.bag[item] = (player.bag[item] || 0) + 1;
  });

  // Build the ending dialogue sequence
  const fullDialogue = endingDialogue.slice();
  fullDialogue.push(`You received ${rewards.money} coins!`);
  if (rewards.items.length) {
    fullDialogue.push(`You received: ${rewards.items.join(", ")}!`);
  }
  if (choice === "hug") {
    fullDialogue.push("Giga-Thok joined you as a companion!");
  }
  fullDialogue.push("__BOSS_END__");

  // Set up dialogue to play, then end the battle
  battle.messageQueue = fullDialogue;
  battle.outcome = "won";
  battle.awaitingContinue = true;
  battle.afterMessage = () => {
    endBossBattle();
  };
}

// ---- End the boss battle and return to overworld ----
function endBossBattle() {
  // Give XP for the boss
  if (battle && battle.player) {
    const xpGain = 500;
    battle.player.xp += xpGain;
    battle.messageQueue = [`${battle.player.name} gained ${xpGain} XP!`];
  }
  // Clean up
  game.state = GAME_STATE.OVERWORLD;
  battle = null;
  bossState = null;
  // Trigger screen shake celebration
  triggerScreenShake(3, 10);
  sfxBadge();
}

// ---- Check if current battle is a boss battle ----
function isBossBattle() {
  return !!(battle && battle.isBossBattle);
}

// ---- Get current boss phase ----
function currentBossPhase() {
  if (!bossState) return 0;
  return bossState.phase;
}

// ---- Get boss phase name ----
function bossPhaseName() {
  const phases = BOSS_GIGA_THOK.phases;
  if (!phases || !phases[bossState.phase]) return "Unknown";
  return phases[bossState.phase].name || "Unknown";
}

// ---- Draw boss-specific UI elements ----
function drawBossUI(ctx) {
  if (!battle || !battle.isBossBattle) return;
  // Draw a larger, fancier HP bar for the boss
  const x = 8;
  const y = 8;
  const w = 120;
  const h = 14;
  const boss = battle.enemy;

  // Background
  ctx.fillStyle = "#081820";
  ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
  ctx.fillStyle = "#383830";
  ctx.fillRect(x, y, w, h);

  // Boss name + phase
  ctx.fillStyle = "#f8d020";
  ctx.font = "bold 7px monospace";
  ctx.textAlign = "left";
  ctx.fillText(boss.name.toUpperCase(), x + 2, y + 6);
  ctx.fillStyle = "#f88040";
  ctx.textAlign = "right";
  ctx.fillText(`[${bossPhaseName()}]`, x + w - 2, y + 6);

  // HP bar
  const hpPct = boss.hp / boss.maxHp;
  const barY = y + 8;
  const barH = 4;
  ctx.fillStyle = "#484848";
  ctx.fillRect(x + 2, barY, w - 4, barH);
  // Phase-colored HP bar
  let hpColor = "#48d858";
  if (bossState.phase === 1) hpColor = "#f8a030";
  else if (bossState.phase === 2) hpColor = "#f84038";
  else if (bossState.phase === 3) hpColor = "#a868f8";
  ctx.fillStyle = hpColor;
  ctx.fillRect(x + 2, barY, Math.floor((w - 4) * hpPct), barH);

  // Phase indicator dots
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i <= bossState.phase ? "#f8d020" : "#484848";
    ctx.fillRect(x + 2 + i * 4, y + h, 2, 2);
  }
}

// ---- Boss phase transition flash effect ----
function drawBossPhaseFlash(ctx) {
  if (!battle || !battle.isBossBattle || !battle.bossPhaseChanged) return;
  if (battle.flashTimer > 0) {
    ctx.save();
    ctx.globalAlpha = (battle.flashTimer / 20) * 0.6;
    const phaseColors = ["#f8d020", "#f84038", "#f88040", "#a868f8"];
    ctx.fillStyle = phaseColors[bossState.phase] || "#ffffff";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    ctx.restore();
  }
}
