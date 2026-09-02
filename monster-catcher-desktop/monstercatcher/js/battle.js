// ============================================================
//  Monster Catcher — Battle System
//  Wild + trainer battles with:
//   - status effects (burn/poison/paralysis/sleep/freeze/confusion/toxic)
//   - stat stages, critical hits, STAB
//   - party switching, items in battle, multiple ball types
//   - XP share across party, level-ups, evolution, move learning
//   - battle animations (shake, flash, slide)
// ============================================================

let battle = null;

function startRandomEncounter() {
  const map = currentMapData();
  if (!map || !map.encounters || !map.encounters.length) return;
  // Guard: don't start a wild battle if the player has no usable party monsters
  if (!player.party || player.party.length === 0) return;
  if (!player.party.find(m => m.hp > 0)) return;
  const speciesKey = map.encounters[Math.floor(Math.random() * map.encounters.length)];
  // wild level scales a bit with player progress
  const avgLvl = partyAverageLevel();
  const level = Math.max(2, avgLvl - 3 + Math.floor(Math.random() * 5));
  const wild = createMonsterInstance(speciesKey, level);
  markSeen(speciesKey);

  battle = {
    isTrainerBattle: false,
    trainerNpc: null,
    enemyTeam: [wild],
    enemyIndex: 0,
    enemy: wild,
    player: firstUsableParty(),
    menu: "main",
    cursor: 0,
    subCursor: 0,
    message: `A wild ${wild.name} appeared!`,
    outcome: null,
    turnBusy: false,
    flashTimer: 0,
    shakeTimer: 0,
    ballAnim: 0,
    pendingPlayerMove: null,
    switching: false,
    messageQueue: [],
    afterMessage: null,
    awaitingContinue: true
  };
  game.state = GAME_STATE.BATTLE;
  sfxEncounter();
}

function startTrainerBattle(npc) {
  const team = npc.team.map(m => createMonsterInstance(m.speciesKey, m.level));
  team.forEach(m => markSeen(m.speciesKey));

  battle = {
    isTrainerBattle: true,
    trainerNpc: npc,
    enemyTeam: team,
    enemyIndex: 0,
    enemy: team[0],
    player: firstUsableParty(),
    menu: "main",
    cursor: 0,
    subCursor: 0,
    message: (npc.dialogue && npc.dialogue.length)
      ? npc.dialogue[npc.dialogue.length - 1].replace(/__\w+__/g, "").trim()
      : `${npc.id} wants to battle!`,
    outcome: null,
    turnBusy: false,
    flashTimer: 0,
    shakeTimer: 0,
    ballAnim: 0,
    pendingPlayerMove: null,
    switching: false,
    messageQueue: [],
    afterMessage: null,
    awaitingContinue: true
  };
  game.state = GAME_STATE.BATTLE;
  sfxEncounter();
}

function partyAverageLevel() {
  if (!player.party.length) return 5;
  return Math.floor(player.party.reduce((s, m) => s + m.level, 0) / player.party.length);
}

let dialogueQueueAfterBattle = null;

function endBattle() {
  // Mega-expansion: apply quirk win effects & friendship
  enhancedEndBattleHook();

  if (battle && battle.isBossBattle && typeof endBossBattle === 'function') {
    endBossBattle();
    return;
  }

  if (battle && battle.isTrainerBattle && battle.outcome === "won") {
    if (battle.trainerNpc) {
      battle.trainerNpc.defeated = true;
      if (battle.trainerNpc.flagOnDefeat) player.flags[battle.trainerNpc.flagOnDefeat] = true;
      if (battle.trainerNpc.givesBadge) {
        const badgeName = BADGES[battle.trainerNpc.givesBadge - 1] && BADGES[battle.trainerNpc.givesBadge - 1].name;
        if (badgeName && !player.badges.includes(badgeName)) player.badges.push(badgeName);
      }
      // Prize money: sum of enemy team levels × 12 (plus leader bonus)
      const prize = battle.enemyTeam.reduce((sum, m) => sum + m.level, 0) * 12;
      player.money += prize;
      if (dialogueQueueAfterBattle) {
        dialogueQueueAfterBattle.push(`You won $${prize} in prize money!`);
      } else {
        dialogueQueueAfterBattle = [`You won $${prize} in prize money!`];
      }
      sfxBadge();
    }
  }

  // Blackout: if the player lost (all monsters fainted), heal the party
  // and warp back to the last visited healing center (or starting town).
  if (battle && battle.outcome === "lost") {
    healParty();
    const healMap = player.lastHealMap || "mossmere";
    const healPos = player.lastHealPos || { col: 4, row: 7 };
    world.currentMap = healMap;
    player.col = healPos.col;
    player.row = healPos.row;
    player.facing = "down";
    // show blackout message
    dialogueQueueAfterBattle = ["You scurried back to a safe place...", "Your monsters have been healed!"];
  }

  // clear battle-only state on party
  player.party.forEach(m => { resetStatStages(m); });
  battle = null;
  game.state = GAME_STATE.OVERWORLD;

  if (dialogueQueueAfterBattle) {
    startDialogue(dialogueQueueAfterBattle);
    dialogueQueueAfterBattle = null;
  }
}

// ---------------------------------------------------------------
//  INPUT
// ---------------------------------------------------------------
function battleInput(key) {
  if (!battle) return;

  // "press to continue" after a message/outcome
  if (battle.awaitingContinue) {
    if (key === "confirm" || key === "cancel") {
      if (battle.outcome) { endBattle(); return; }
      battle.awaitingContinue = false;
      const afterCb = battle.afterMessage;
      battle.afterMessage = null;
      if (battle.messageQueue.length) {
        battle.message = battle.messageQueue.shift();
        battle.menu = "message";
        battle.awaitingContinue = true;
      } else {
        battle.menu = "main";
        battle.cursor = 0;
      }
      if (afterCb) { afterCb(); }
    }
    return;
  }

  if (battle.outcome) {
    if (key === "confirm") endBattle();
    return;
  }

  if (battle.turnBusy) return;

  // ---- Sub-menus ----
  if (battle.menu === "fight") {
    const moves = battle.player.moves;
    // Check if ultimate is available as an extra option
    const ultReady = (typeof ultimateReady === "function") && ultimateReady(battle.player);
    const ultIdx = moves.length; // ultimate is listed after regular moves
    const total = moves.length + (ultReady ? 1 : 0);
    if (key === "down") battle.cursor = (battle.cursor + 1) % total;
    if (key === "up") battle.cursor = (battle.cursor + total - 1) % total;
    if (key === "cancel") { battle.menu = "main"; battle.cursor = 0; }
    if (key === "confirm") {
      if (ultReady && battle.cursor === ultIdx) {
        // Use ultimate move — commitPlayerMove handles the full flow
        commitPlayerMove("__ULT__");
        return;
      }
      if ((battle.player.pp[moves[battle.cursor]] || 0) <= 0) {
        queueMessage("No PP left for that move!");
        return;
      }
      commitPlayerMove(moves[battle.cursor]);
    }
    return;
  }

  if (battle.menu === "bag") {
    handleBagInput(key);
    return;
  }

  if (battle.menu === "party") {
    handlePartyInput(key);
    return;
  }

  if (battle.menu === "catchball") {
    handleBallSelectInput(key);
    return;
  }

  // ---- Main menu ----
  if (battle.menu === "main") {
    // FIGHT / BAG / PARTY / (CATCH | RUN)
    const hasCatch = !battle.isTrainerBattle;
    const options = hasCatch
      ? ["FIGHT", "BAG", "PARTY", "CATCH", "RUN"]
      : ["FIGHT", "BAG", "PARTY", "RUN"];
    const maxIdx = options.length - 1;
    if (key === "down") battle.cursor = (battle.cursor + 1) % (maxIdx + 1);
    if (key === "up") battle.cursor = (battle.cursor + maxIdx) % (maxIdx + 1);
    if (key === "confirm") {
      const opt = options[battle.cursor];
      if (opt === "FIGHT") { battle.menu = "fight"; battle.cursor = 0; }
      else if (opt === "BAG") { battle.menu = "bag"; battle.cursor = 0; buildBagList(); }
      else if (opt === "PARTY") { battle.menu = "party"; battle.cursor = 0; }
      else if (opt === "CATCH") { battle.menu = "catchball"; battle.cursor = 0; buildBallList(); }
      else if (opt === "RUN") attemptRun();
    }
    return;
  }
}

// ---------------------------------------------------------------
//  BAG (in battle)
// ---------------------------------------------------------------
let bagList = []; // array of itemKeys available

function buildBagList() {
  bagList = Object.keys(player.bag).filter(k => player.bag[k] > 0 && ITEMS[k]);
  if (!bagList.length) {
    queueMessage("Your bag is empty!");
  }
}

function handleBagInput(key) {
  if (!bagList.length) {
    if (key === "cancel" || key === "confirm") { battle.menu = "main"; battle.cursor = 0; }
    return;
  }
  if (key === "down") battle.cursor = (battle.cursor + 1) % bagList.length;
  if (key === "up") battle.cursor = (battle.cursor + bagList.length - 1) % bagList.length;
  if (key === "cancel") { battle.menu = "main"; battle.cursor = 0; }
  if (key === "confirm") {
    const itemKey = bagList[battle.cursor];
    useItemInBattle(itemKey);
  }
}

function useItemInBattle(itemKey) {
  const item = ITEMS[itemKey];
  if (!item) return;
  if (bagCount(itemKey) <= 0) { queueMessage("You don't have any left!"); return; }

  if (item.use === "ball") {
    // shouldn't reach here from bag; balls handled via CATCH menu
    queueMessage("Use CATCH to throw a ball.");
    return;
  }

  if (item.use === "heal") {
    // heal active monster (or pick if multiple fainted? simplest: active)
    const m = battle.player;
    if (m.hp <= 0) { queueMessage("It fainted — use a Revive!"); return; }
    if (m.hp >= m.maxHp) { queueMessage("Its HP is already full!"); return; }
    useItemFromBag(itemKey);
    m.hp = Math.min(m.maxHp, m.hp + item.amount);
    queueMessage(`Used ${item.name}! ${m.name} recovered HP.`);
    // using an item uses the turn
    enemyTurn();
    return;
  }

  if (item.use === "revive") {
    // pick first fainted in party
    const fainted = player.party.find(p => p.hp <= 0);
    if (!fainted) { queueMessage("No fainted monsters to revive!"); return; }
    useItemFromBag(itemKey);
    fainted.hp = Math.floor(fainted.maxHp * item.amount);
    cureStatus(fainted);
    queueMessage(`Used ${item.name}! ${fainted.name} is revived!`);
    enemyTurn();
    return;
  }

  if (item.use === "status") {
    const m = battle.player;
    if (item.status === "all") {
      if (m.status === STATUS.NONE) { queueMessage("It's already healthy!"); return; }
      cureStatus(m);
    } else {
      if (m.status !== item.status) { queueMessage("That won't help right now!"); return; }
      m.status = STATUS.NONE;
    }
    useItemFromBag(itemKey);
    queueMessage(`Used ${item.name}! ${m.name}'s status cleared.`);
    enemyTurn();
    return;
  }

  queueMessage("You can't use that here!");
}

// ---------------------------------------------------------------
//  BALL SELECTION (CATCH)
// ---------------------------------------------------------------
let ballList = [];

function buildBallList() {
  ballList = ["basicball", "greatball", "ultraball"].filter(k => bagCount(k) > 0);
  if (!ballList.length) {
    queueMessage("You don't have any balls!");
  }
}

function handleBallSelectInput(key) {
  if (!ballList.length) {
    if (key === "cancel" || key === "confirm") { battle.menu = "main"; battle.cursor = 0; }
    return;
  }
  if (key === "down") battle.cursor = (battle.cursor + 1) % ballList.length;
  if (key === "up") battle.cursor = (battle.cursor + ballList.length - 1) % ballList.length;
  if (key === "cancel") { battle.menu = "main"; battle.cursor = 0; }
  if (key === "confirm") {
    const ballKey = ballList[battle.cursor];
    attemptCatch(ballKey);
  }
}

// ---------------------------------------------------------------
//  PARTY SWITCHING (in battle)
// ---------------------------------------------------------------
function handlePartyInput(key) {
  if (key === "cancel") { battle.menu = "main"; battle.cursor = 0; return; }
  if (key === "down") battle.cursor = (battle.cursor + 1) % player.party.length;
  if (key === "up") battle.cursor = (battle.cursor + player.party.length - 1) % player.party.length;
  if (key === "confirm") {
    const chosen = player.party[battle.cursor];
    if (chosen.hp <= 0) { queueMessage("It's fainted!"); return; }
    if (chosen === battle.player) { queueMessage("It's already out!"); return; }
    switchTo(battle.cursor);
  }
}

function switchTo(index) {
  const prev = battle.player;
  // natural cure: cure status on switch out
  if (prev && prev.ability === "naturalcure" && prev.status !== STATUS.NONE) {
    cureStatus(prev);
  }
  resetStatStages(prev);
  battle.player = player.party[index];
  resetStatStages(battle.player);
  battle.menu = "main";
  battle.cursor = 0;
  queueMessage(`Go, ${battle.player.name}!`);
  // Mega-expansion: apply quirk on-switch-in
  applyQuirkSwitchIn(battle.player);
  // switching consumes the turn in trainer battles; wild: enemy still gets a free hit
  enemyTurn();
}

// Enemy takes a free turn (after player uses item, switches, or catch fails).
function enemyTurn() {
  if (!battle || battle.outcome) return;
  if (battle.enemy.hp <= 0) return;
  // Mega-expansion: route boss battles to bossTurn
  if (battle.isBossBattle && typeof bossTurn === 'function') {
    battle.turnBusy = true;
    bossTurn();
    // Flush boss message queue
    setTimeout(() => {
      if (battle && battle.messageQueue.length) {
        battle.message = battle.messageQueue.shift();
        battle.menu = "message";
        battle.awaitingContinue = true;
        // If more messages, queue them
        while (battle.messageQueue.length > 1) {
          // They'll be shown on continue
        }
      }
      battle.turnBusy = false;
    }, 1200);
    return;
  }
  battle.turnBusy = true;
  const moveKey = chooseEnemyMove();
  // brief delay so the player can read any prior message
  setTimeout(() => {
    if (!battle || battle.outcome) return;
    runEnemyAttack(moveKey, () => {
      if (battle.player.hp <= 0) { handlePlayerFainted(); return; }
      // status tick on enemy
      if (battle.enemy.hp > 0) {
        const msgs = tickStatus(battle.enemy);
        if (msgs.length) queueMessage(msgs[0]);
      }
      if (battle.player.hp <= 0) { handlePlayerFainted(); return; }
      battle.turnBusy = false;
      battle.menu = "main";
      battle.cursor = 0;
      if (battle.messageQueue.length) {
        battle.message = battle.messageQueue.shift();
        battle.menu = "message";
        battle.awaitingContinue = true;
      }
    });
  }, 600);
}

// ---------------------------------------------------------------
//  COMMITTING A PLAYER MOVE
// ---------------------------------------------------------------
function commitPlayerMove(moveKey) {
  battle.pendingPlayerMove = moveKey;
  battle.menu = "message";
  battle.message = "";
  battle.turnBusy = true;

  // Mega-expansion: tick ultimate cooldowns
  tickUltimateCooldown(battle.player);
  tickUltimateCooldown(battle.enemy);

  // Mega-expansion: apply quirk on-turn-start for player
  const quirkResult = applyQuirkTurnStart(battle.player, !battle.isTrainerBattle);
  if (quirkResult === "flee") return;  // auto-fled
  if (quirkResult === "skip") {
    // Player skipped turn, enemy goes
    setTimeout(() => {
      const em = chooseEnemyMove();
      runEnemyAttack(em, finishTurn);
    }, 800);
    return;
  }

  // Mega-expansion: handle ultimate move
  if (isUltimateMove(moveKey)) {
    const playerPriority = 1; // ultimates go first
    const enemyMoveKey = chooseEnemyMove();
    const enemyPriority = (MOVES[enemyMoveKey].priority || 0);
    let playerFirst = playerPriority >= enemyPriority;
    if (playerFirst) {
      executeUltimateMove(battle.player, battle.enemy, true, () => {
        checkBossPhaseAfterDamage();
        if (battle.enemy.hp <= 0) { handleEnemyFainted(); return; }
        runEnemyAttack(enemyMoveKey, finishTurn);
      });
    } else {
      runEnemyAttack(enemyMoveKey, () => {
        if (battle.player.hp <= 0) { handlePlayerFainted(); return; }
        executeUltimateMove(battle.player, battle.enemy, true, () => {
          checkBossPhaseAfterDamage();
          if (battle.enemy.hp <= 0) { handleEnemyFainted(); return; }
          finishTurn();
        });
      });
    }
    return;
  }

  // Determine turn order by speed (with priority + paralysis adjustments)
  const playerPriority = (MOVES[moveKey].priority || 0);
  const enemyMoveKey = chooseEnemyMove();
  const enemyPriority = (MOVES[enemyMoveKey].priority || 0);

  const playerSpeed = effectiveStat(battle.player, "spd") * (battle.player.status === STATUS.PARALYSIS ? 0.25 : 1);
  const enemySpeed = effectiveStat(battle.enemy, "spd") * (battle.enemy.status === STATUS.PARALYSIS ? 0.25 : 1);

  let playerFirst;
  if (playerPriority !== enemyPriority) playerFirst = playerPriority > enemyPriority;
  else if (playerSpeed === enemySpeed) playerFirst = Math.random() < 0.5;
  else playerFirst = playerSpeed > enemySpeed;

  battle._enemyMove = enemyMoveKey;

  if (playerFirst) {
    runPlayerAttack(moveKey, () => runEnemyAttack(enemyMoveKey, finishTurn));
  } else {
    runEnemyAttack(enemyMoveKey, () => runPlayerAttack(moveKey, finishTurn));
  }
}

function chooseEnemyMove() {
  // smart-ish: prefer super-effective moves
  const moves = battle.enemy.moves.filter(mk => (battle.enemy.pp[mk] || 0) > 0);
  const pool = moves.length ? moves : battle.enemy.moves;
  let best = pool[0], bestMult = -1;
  pool.forEach(mk => {
    const m = MOVES[mk];
    if (!m || m.category === MOVE_CATEGORY.STATUS) return;
    const mult = typeMultiplier(m.type, battle.player.type1, battle.player.type2);
    if (mult > bestMult) { bestMult = mult; best = mk; }
  });
  // 70% pick best, 30% random
  if (Math.random() < 0.7 && best) return best;
  return pool[Math.floor(Math.random() * pool.length)];
}

function runPlayerAttack(moveKey, cb) {
  const selfMsgs = [];
  if (!canAct(battle.player, selfMsgs)) {
    if (selfMsgs.length) queueMessage(selfMsgs[0]);
    // still consume PP? no — skipped due to status
    setTimeout(() => { afterPlayerAttack(cb); }, 700);
    return;
  }
  // decrement PP
  battle.player.pp[moveKey] = Math.max(0, (battle.player.pp[moveKey] || 0) - 1);
  executeMove(battle.player, battle.enemy, moveKey, true, () => afterPlayerAttack(cb));
}

function afterPlayerAttack(cb) {
  if (battle.enemy.hp <= 0) { handleEnemyFainted(); return; }
  // player status tick (burn/poison) happens at end of full turn (done in finishTurn)
  cb && cb();
}

function runEnemyAttack(moveKey, cb) {
  if (battle.outcome) { cb && cb(); return; }
  if (battle.enemy.hp <= 0) { cb && cb(); return; }
  const selfMsgs = [];
  if (!canAct(battle.enemy, selfMsgs)) {
    if (selfMsgs.length) queueMessage(selfMsgs[0]);
    setTimeout(() => { afterEnemyAttack(cb); }, 700);
    return;
  }
  battle.enemy.pp[moveKey] = Math.max(0, (battle.enemy.pp[moveKey] || 0) - 1);
  executeMove(battle.enemy, battle.player, moveKey, false, () => afterEnemyAttack(cb));
}

function afterEnemyAttack(cb) {
  if (battle.player.hp <= 0) { handlePlayerFainted(); return; }
  cb && cb();
}

function finishTurn() {
  // status ticks for both
  if (battle.player.hp > 0) {
    const msgs = tickStatus(battle.player);
    if (msgs.length) queueMessage(msgs[0]);
  }
  if (battle.enemy.hp > 0) {
    const msgs = tickStatus(battle.enemy);
    if (msgs.length) queueMessage(msgs[0]);
  }
  if (battle.player.hp <= 0) { handlePlayerFainted(); return; }
  if (battle.enemy.hp <= 0) { handleEnemyFainted(); return; }

  battle.turnBusy = false;
  battle.menu = "main";
  battle.cursor = 0;
  battle.pendingPlayerMove = null;

  // flush queued messages
  if (battle.messageQueue.length) {
    battle.message = battle.messageQueue.shift();
    battle.menu = "message";
    battle.awaitingContinue = true;
  } else {
    battle.menu = "main";
  }
}

// ---------------------------------------------------------------
//  EXECUTE A MOVE (attacker -> defender)
// ---------------------------------------------------------------
function executeMove(attacker, defender, moveKey, isPlayer, cb) {
  const move = MOVES[moveKey];
  if (!move) { cb && cb(); return; }

  // Charge moves (Solar Beam / Dig): simple two-turn (we skip the explicit charge turn
  // for brevity but apply a "preparing" message then strike next call). For simplicity
  // we treat charge as immediate with a prep message.
  // Status moves
  if (move.category === MOVE_CATEGORY.STATUS) {
    executeStatusMove(attacker, defender, move, moveKey, isPlayer, cb);
    return;
  }

  // Accuracy check
  if (!move.neverMiss) {
    const accStage = attacker.statStages.acc || 0;
    const evaStage = defender.statStages.eva || 0;
    const accMult = (accStage >= 0) ? (1 + accStage * 0.1) : (1 / (1 - accStage * 0.1));
    const evaMult = (evaStage >= 0) ? (1 / (1 + evaStage * 0.1)) : (1 + (-evaStage) * 0.1);
    const acc = (move.accuracy / 100) * accMult * evaMult;
    if (Math.random() > acc) {
      queueMessage(`${attacker.name}'s attack missed!`);
      sfxMiss();
      setTimeout(() => cb && cb(), 600);
      return;
    }
  }

  // Requires sleep target (Dream Eater)
  if (move.requiresSleep && defender.status !== STATUS.SLEEP) {
    queueMessage(`${defender.name} isn't asleep!`);
    setTimeout(() => cb && cb(), 600);
    return;
  }

  const result = calcDamage(attacker, defender, moveKey);
  if (result.mult === 0) {
    queueMessage(`${effectivenessPhrase(0)}`);
    sfxMiss();
    setTimeout(() => cb && cb(), 600);
    return;
  }

  // animation: shake + flash
  battle.shakeTimer = 8;
  battle.flashTimer = 4;
  sfxHit();

  defender.hp = Math.max(0, defender.hp - result.dmg);

  let note = effectivenessPhrase(result.mult);
  let msg = `${attacker.name} used ${move.name}!`;
  if (result.crit) note = `A critical hit! ${note}`;
  if (note) msg += " " + note;
  queueMessage(msg);

  // Drain
  if (move.drain) {
    const healed = Math.max(1, Math.floor(result.dmg * move.drain));
    attacker.hp = Math.min(attacker.maxHp, attacker.hp + healed);
    queueMessage(`${attacker.name} drained ${healed} HP!`);
  }

  // Recoil
  if (move.recoil) {
    const recoil = Math.max(1, Math.floor(result.dmg * move.recoil));
    attacker.hp = Math.max(0, attacker.hp - recoil);
    queueMessage(`${attacker.name} was hit by recoil!`);
  }

  // Secondary effects (status infliction, stat changes)
  applyMoveSecondaryEffects(attacker, defender, move, isPlayer);

  setTimeout(() => cb && cb(), 900);
}

function applyMoveSecondaryEffects(attacker, defender, move, isPlayer) {
  // Burn
  if (move.burnChance && Math.random() * 100 < move.burnChance && defender.status === STATUS.NONE) {
    defender.status = STATUS.BURN;
    queueMessage(`${defender.name} was burned!`);
  }
  if (move.poisonChance && Math.random() * 100 < move.poisonChance && defender.status === STATUS.NONE) {
    defender.status = STATUS.POISON;
    queueMessage(`${defender.name} was poisoned!`);
  }
  if (move.paralyzeChance && Math.random() * 100 < move.paralyzeChance && defender.status === STATUS.NONE) {
    defender.status = STATUS.PARALYSIS;
    queueMessage(`${defender.name} was paralyzed!`);
  }
  if (move.freezeChance && Math.random() * 100 < move.freezeChance && defender.status === STATUS.NONE) {
    defender.status = STATUS.FREEZE;
    queueMessage(`${defender.name} was frozen!`);
  }
  if (move.confuseChance && Math.random() * 100 < move.confuseChance && defender.status === STATUS.NONE) {
    defender.status = STATUS.CONFUSION;
    defender.confusionTurns = 2 + Math.floor(Math.random() * 3);
    queueMessage(`${defender.name} became confused!`);
  }
  if (move.flinch && Math.random() * 100 < move.flinch) {
    // flinch: opponent skips next action (simple: set a flag checked in enemy turn)
    if (defender === battle.enemy) battle.enemyFlinched = true;
    else battle.playerFlinched = true;
  }

  // Stat changes
  const applyStat = (statSpec) => {
    if (!statSpec) return;
    if (statSpec.chance !== undefined && Math.random() * 100 >= statSpec.chance) return;
    const target = (statSpec.target === "self") ? attacker : defender;
    target.statStages[statSpec.stat] = Math.max(-6, Math.min(6, (target.statStages[statSpec.stat] || 0) + statSpec.stages));
    const dir = statSpec.stages > 0 ? "rose" : "fell";
    const statName = ({atk:"Attack",def:"Defense",spd:"Speed",acc:"Accuracy",eva:"Evasion",spatk:"Sp.Atk",spdef:"Sp.Def"})[statSpec.stat] || statSpec.stat;
    queueMessage(`${target.name}'s ${statName} ${dir}!`);
  };
  applyStat(move.stat);
  applyStat(move.stat2);

  // Crit boost (Focus Energy)
  if (move.critBoost) {
    attacker.statStages.acc = (attacker.statStages.acc || 0); // placeholder; crit-boost handled via flag
    attacker._critBoosted = true;
    queueMessage(`${attacker.name} is getting pumped!`);
  }

  // Direct inflict (Spore, Toxic)
  if (move.inflict) {
    if (move.inflict === STATUS.SLEEP && defender.status === STATUS.NONE) {
      defender.status = STATUS.SLEEP;
      defender.sleepTurns = 1 + Math.floor(Math.random() * 3);
      queueMessage(`${defender.name} fell asleep!`);
    } else if (move.inflict === STATUS.TOXIC && defender.status === STATUS.NONE) {
      defender.status = STATUS.TOXIC;
      defender.statusTurns = 0;
      queueMessage(`${defender.name} is badly poisoned!`);
    }
  }

  // Healing moves
  if (move.healPct) {
    const healed = Math.floor(attacker.maxHp * move.healPct);
    attacker.hp = Math.min(attacker.maxHp, attacker.hp + healed);
    queueMessage(`${attacker.name} recovered HP!`);
  }
  if (move.restoreFullHp) {
    attacker.hp = attacker.maxHp;
    if (move.sleepSelf) {
      attacker.status = STATUS.SLEEP;
      attacker.sleepTurns = move.sleepSelf;
    }
    queueMessage(`${attacker.name} rested and restored HP!`);
  }

  // Walls (simplified: just message; not fully modeled)
  if (move.wall) {
    queueMessage(`${attacker.name} raised a ${move.wall} wall!`);
  }
}

function executeStatusMove(attacker, defender, move, moveKey, isPlayer, cb) {
  // Accuracy for status
  if (move.accuracy < 100 && Math.random() > move.accuracy / 100) {
    queueMessage(`${attacker.name}'s move missed!`);
    setTimeout(() => cb && cb(), 600);
    return;
  }
  // Direct inflict handled in secondary; here we call the shared applier with no damage
  applyMoveSecondaryEffects(attacker, defender, move, isPlayer);
  queueMessage(`${attacker.name} used ${move.name}!`);
  setTimeout(() => cb && cb(), 700);
}

// ---------------------------------------------------------------
//  CATCH / RUN
// ---------------------------------------------------------------
function attemptCatch(ballKey) {
  ballKey = ballKey || "basicball";
  const ball = ITEMS[ballKey];
  if (!ball || bagCount(ballKey) <= 0) {
    queueMessage("You're out of those balls!");
    battle.menu = "main";
    return;
  }
  useItemFromBag(ballKey);
  player.balls = bagCount("basicball");

  battle.turnBusy = true;
  battle.menu = "message";
  battle.message = `You threw a ${ball.name}!`;
  battle.ballAnim = 30;
  sfxBallThrow();

  setTimeout(() => {
    const chance = catchChance(battle.enemy, ball.catchBonus);
    const rolls = 3;
    let successes = 0;
    for (let i = 0; i < rolls; i++) if (Math.random() < chance) successes++;
    if (successes >= 2 || Math.random() < chance) {
      battle.message = `Gotcha! ${battle.enemy.name} was caught!`;
      sfxCatch();
      const caught = battle.enemy;
      const added = addMonsterToParty(caught);
      if (!added) {
        battle.message += ` (Sent to your box!)`;
      }
      // record dex
      markSeen(caught.speciesKey);
      player.dex.caught[caught.speciesKey] = true;
      battle.outcome = "caught";
      battle.awaitingContinue = true;
      battle.turnBusy = false;
    } else {
      battle.message = `Oh no! ${battle.enemy.name} broke free!`;
      sfxBreakFree();
      battle.ballAnim = 0;
      battle.awaitingContinue = true;
      battle.afterMessage = () => { enemyTurn(); };
      battle.turnBusy = false;
    }
  }, 1400);
}

function attemptRun() {
  if (battle.isTrainerBattle) {
    queueMessage("You can't run from a trainer battle!");
    return;
  }
  // run chance based on speed
  const pSpeed = effectiveStat(battle.player, "spd");
  const eSpeed = effectiveStat(battle.enemy, "spd");
  const chance = Math.min(1, (pSpeed / Math.max(1, eSpeed)) * 0.6 + 0.2);
  if (Math.random() < chance) {
    battle.message = "Got away safely!";
    battle.outcome = "fled";
    battle.awaitingContinue = true;
  } else {
    battle.message = "Couldn't escape!";
    battle.menu = "message";
    battle.awaitingContinue = true;
    battle.afterMessage = () => { enemyTurn(); };
  }
}

// ---------------------------------------------------------------
//  FAINT / XP / LEVEL UP / EVOLUTION
// ---------------------------------------------------------------
function handleEnemyFainted() {
  const defeatedName = battle.enemy.name;
  const defeatedLevel = battle.enemy.level;
  queueMessage(`${battle.isTrainerBattle ? "" : "Wild "}${defeatedName} fainted!`);
  battle.shakeTimer = 6;

  // Mega-expansion: apply quirk on-KO for player monster
  applyQuirkOnKo(battle.player);

  // Mega-expansion: check boss phase transition
  checkBossPhaseAfterDamage();

  // Mega-expansion: if boss battle and boss HP is 0, handle boss defeat
  if (battle.isBossBattle && battle.enemy.hp <= 0) {
    if (typeof handleBossDefeat === 'function') {
      handleBossDefeat();
      return;
    }
  }

  if (battle.isTrainerBattle && battle.enemyIndex < battle.enemyTeam.length - 1) {
    setTimeout(() => {
      battle.enemyIndex++;
      battle.enemy = battle.enemyTeam[battle.enemyIndex];
      queueMessage(`${battle.trainerNpc.id.replace(/_/g," ")} sent out ${battle.enemy.name}!`);
      battle.menu = "message";
      battle.awaitingContinue = true;
      battle.turnBusy = false;
    }, 900);
    return;
  }

  // XP share: give full to active, half to others
  const events = grantExperience(battle.player, defeatedLevel);
  player.party.forEach(m => {
    if (m !== battle.player && m.hp > 0) {
      grantExperience(m, Math.floor(defeatedLevel * 6));
    }
  });

  setTimeout(() => {
    let msg = `${battle.player.name} gained ${events.gained} XP!`;
    queueMessage(msg);
    if (events.leveledUp) queueMessage(`${battle.player.name} grew to Lv${battle.player.level}!`);
    if (events.learnedMove) queueMessage(`${battle.player.name} learned ${MOVES[events.learnedMove].name}!`);
    if (events.evolvedTo) queueMessage(`What? ${battle.player.name} is evolving! ...It evolved into ${events.evolvedTo}!`);
    battle.outcome = "won";
    battle.menu = "message";
    battle.awaitingContinue = true;
    battle.turnBusy = false;
    sfxFaint();

    if (battle.isTrainerBattle && battle.trainerNpc.defeatedDialogue) {
      dialogueQueueAfterBattle = battle.trainerNpc.defeatedDialogue.filter(l => !l.includes("__"));
    }
  }, 900);
}

function handlePlayerFainted() {
  queueMessage(`${battle.player.name} fainted!`);
  sfxFaint();
  const next = player.party.find(m => m.hp > 0);
  if (next) {
    setTimeout(() => {
      battle.player = next;
      resetStatStages(next);
      queueMessage(`Go, ${next.name}!`);
      battle.menu = "message";
      battle.awaitingContinue = true;
      battle.turnBusy = false;
    }, 900);
  } else {
    // all fainted
    setTimeout(() => {
      queueMessage("You have no more monsters that can fight!");
      battle.outcome = "lost";
      battle.menu = "message";
      battle.awaitingContinue = true;
      battle.turnBusy = false;
    }, 900);
  }
}

// ---------------------------------------------------------------
//  MESSAGE QUEUE
// ---------------------------------------------------------------
function queueMessage(msg) {
  if (!battle) return;
  if (battle.menu !== "message" && !battle.awaitingContinue) {
    battle.message = msg;
    battle.menu = "message";
    battle.awaitingContinue = true;
  } else {
    battle.messageQueue.push(msg);
  }
}

// ---------------------------------------------------------------
//  RENDER (GBA Edition — full battle scene with backgrounds,
//  platforms, polished HP boxes, and themed terrain)
// ---------------------------------------------------------------
// Drop shadow beneath a battle monster (soft ellipse, grounded feel)
function drawMonsterShadow(ctx, cx, baseY, rx, ry) {
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(cx, baseY, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  ctx.beginPath();
  ctx.ellipse(cx, baseY, rx + 2, ry + 1, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawBattle(ctx) {
  // shake offset
  let sx = 0, sy = 0;
  if (battle.shakeTimer > 0) {
    sx = (Math.random() - 0.5) * 4;
    sy = (Math.random() - 0.5) * 4;
    battle.shakeTimer--;
  }
  ctx.save();
  ctx.translate(sx, sy);

  // ---- Battle background (themed by current map) ----
  drawBattleBackground(ctx);

  // flash overlay (hit flash)
  if (battle.flashTimer > 0) {
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    battle.flashTimer--;
  }

  // ---- Enemy (top-right) on a platform ----
  drawBattlePlatform(ctx, 96, 48, 60, 16, false);
  // idle bob (subtle vertical oscillation)
  const eBob = Math.sin(Date.now() / 380) * 1;
  drawMonsterShadow(ctx, 128, 60, 22, 5);
  drawElementalAura(ctx, battle.enemy, 104, 12 + eBob, 48, 48);
  drawMonsterSprite(ctx, battle.enemy, 104, 12 + eBob, 48);
  drawStatusComicEyes(ctx, battle.enemy, 104, 12 + eBob, false);

  // ball animation
  if (battle.ballAnim > 0) {
    const progress = (30 - battle.ballAnim) / 30;
    const bx = 28 + (124 - 28) * progress;
    const by = 88 - Math.sin(progress * Math.PI) * 50;
    drawBall(ctx, bx, by, 7);
    if (battle.ballAnim < 20) {
      drawBall(ctx, 128 + Math.sin(battle.ballAnim) * 3, 40, 7);
    }
    battle.ballAnim--;
  }

  // enemy HP box (top-left)
  drawHpBox(ctx, 6, 6, battle.enemy.name, battle.enemy.hp, battle.enemy.maxHp, battle.enemy.level, battle.enemy, true);
  drawTypeBadges(ctx, battle.enemy, 10, 30);

  // ---- Player (bottom-left) on a platform ----
  drawBattlePlatform(ctx, 8, 120, 64, 18, true);
  const pBob = Math.sin(Date.now() / 360 + 1.2) * 1;
  drawMonsterShadow(ctx, 40, 124, 24, 5);
  drawElementalAura(ctx, battle.player, 16, 80 + pBob, 48, 48);
  drawMonsterSprite(ctx, battle.player, 16, 80 + pBob, 48);
  drawStatusComicEyes(ctx, battle.player, 16, 80 + pBob, true);

  // player HP box (bottom-right)
  drawHpBox(ctx, 120, 76, battle.player.name, battle.player.hp, battle.player.maxHp, battle.player.level, battle.player, false);
  drawTypeBadges(ctx, battle.player, 124, 100);

  // Draw quirk emoji indicator next to player name area
  if (typeof quirkEmoji === 'function') {
    const qe = quirkEmoji(battle.player);
    if (qe) {
      ctx.save();
      ctx.font = "8px monospace";
      ctx.fillText(qe, 118, 86);
      ctx.restore();
    }
  }

  // ---- Bottom textbox (GBA-style command window) ----
  drawBattleTextBox(ctx);

  // Mega-expansion: boss UI overlay
  if (battle.isBossBattle && typeof drawBossUI === 'function') {
    drawBossUI(ctx);
  }

  ctx.restore();

  // Mega-expansion: impact frames (drawn after restore so they cover everything)
  drawImpactFrame(ctx);

  // Mega-expansion: boss phase flash
  if (battle.isBossBattle && typeof drawBossPhaseFlash === 'function') {
    drawBossPhaseFlash(ctx);
  }

  // Mega-expansion: evolution sequence overlay (drawn on top of everything)
  if (tickEvolutionSequence()) {
    drawEvolutionSequence(ctx);
  }
}

// ---- Battle background (themed by map terrain) ----
function drawBattleBackground(ctx) {
  const mapId = world.currentMap;
  // sky gradient (top portion)
  let sky1 = COLOR.skyDay, sky2 = COLOR.skyDay2;
  // use time-of-day sky if available
  if (typeof getSkyColors === "function") {
    const sc = getSkyColors();
    sky1 = sc[0]; sky2 = sc[1];
  }
  // weather tint fallback
  const weather = (typeof getMapWeather === "function") ? getMapWeather() : "none";

  // cave / indoor maps use dark background
  const isCave = (mapId === "frostcave" || mapId === "lab" || mapId === "center" || mapId === "shop" || mapId === "gym" || mapId === "gymcenter");

  if (isCave) {
    ctx.fillStyle = COLOR.caveWall3;
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    ctx.fillStyle = COLOR.caveWall2;
    ctx.fillRect(0, 0, SCREEN_W, 60);
    // rock texture
    ctx.fillStyle = COLOR.caveWall1;
    for (let i = 0; i < 8; i++) {
      ctx.fillRect((i * 31) % SCREEN_W, (i * 17) % 60, 6, 4);
    }
    // cave floor
    ctx.fillStyle = COLOR.caveFloor1;
    ctx.fillRect(0, 60, SCREEN_W, SCREEN_H - 60);
    ctx.fillStyle = COLOR.caveFloor2;
    ctx.fillRect(0, 100, SCREEN_W, SCREEN_H - 100);
  } else if (mapId === "frostcave" || mapId === "gymtown" || mapId === "gym") {
    // snow/ice battlefield
    ctx.fillStyle = sky1;
    ctx.fillRect(0, 0, SCREEN_W, 70);
    ctx.fillStyle = sky2;
    ctx.fillRect(0, 0, SCREEN_W, 35);
    // snowy ground
    ctx.fillStyle = COLOR.snow1;
    ctx.fillRect(0, 70, SCREEN_W, SCREEN_H - 70);
    ctx.fillStyle = COLOR.snow2;
    ctx.fillRect(0, 110, SCREEN_W, SCREEN_H - 110);
    // distant ice peaks
    ctx.fillStyle = COLOR.ice2;
    ctx.fillRect(0, 60, SCREEN_W, 12);
    ctx.fillStyle = COLOR.ice3;
    ctx.fillRect(40, 50, 30, 22);
    ctx.fillRect(120, 48, 36, 24);
    ctx.fillRect(180, 54, 28, 18);
  } else {
    // ---- outdoor grassy battlefield: rich layered GBA scene ----
    drawOutdoorBattleScene(ctx, sky1, sky2);
  }

  // weather overlay
  if (weather === "rain") {
    ctx.fillStyle = "rgba(80,100,160,0.12)";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  } else if (weather === "snow") {
    ctx.fillStyle = "rgba(220,230,255,0.14)";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  }
}

// ---- Rich layered outdoor battle scene (sky, clouds, mountains,
//      forest, lake, foreground grass & rocks) — matches GBA ref ----
function drawOutdoorBattleScene(ctx, sky1, sky2) {
  const f = (typeof worldAnimFrame !== "undefined") ? worldAnimFrame : 0;
  // SKY — vertical gradient bands
  ctx.fillStyle = sky2;
  ctx.fillRect(0, 0, SCREEN_W, 18);
  ctx.fillStyle = sky1;
  ctx.fillRect(0, 12, SCREEN_W, 30);
  ctx.fillStyle = "#90d0f0";
  ctx.fillRect(0, 30, SCREEN_W, 18);

  // CLOUDS — soft pixel clouds drifting
  drawBattleCloud(ctx, 20 + (f >> 3) % 8, 8, 22, 8);
  drawBattleCloud(ctx, 120 + (f >> 4) % 6, 14, 28, 7);
  drawBattleCloud(ctx, 200 - (f >> 3) % 8, 6, 18, 7);

  // DISTANT MOUNTAINS — snow-capped peaks
  // back ridge (lighter, hazy)
  ctx.fillStyle = "#a8b8c8";
  drawMountainShape(ctx, 0, 52, 90, 22, 30);
  drawMountainShape(ctx, 70, 50, 110, 24, 50);
  drawMountainShape(ctx, 150, 53, 100, 21, 28);
  // snow caps on peaks
  ctx.fillStyle = "#f0f4f8";
  ctx.fillRect(28, 36, 10, 6);
  ctx.fillRect(30, 34, 6, 2);
  ctx.fillRect(110, 34, 14, 8);
  ctx.fillRect(113, 32, 8, 2);
  ctx.fillRect(190, 38, 10, 6);
  // front ridge (darker, closer)
  ctx.fillStyle = "#7888a0";
  drawMountainShape(ctx, -10, 60, 80, 18, 20);
  drawMountainShape(ctx, 90, 58, 100, 20, 35);
  drawMountainShape(ctx, 180, 60, 80, 18, 22);

  // LAKE — middle distance blue water band
  ctx.fillStyle = "#4898d8";
  ctx.fillRect(0, 62, SCREEN_W, 10);
  ctx.fillStyle = "#68b0e8";
  ctx.fillRect(0, 62, SCREEN_W, 4);
  // lake shimmer
  ctx.fillStyle = "#a8d8f8";
  ctx.fillRect((f >> 2) % SCREEN_W, 65, 6, 1);
  ctx.fillRect((SCREEN_W - (f >> 2) % 60), 67, 8, 1);
  ctx.fillStyle = "#3880c8";
  ctx.fillRect(0, 70, SCREEN_W, 2);

  // DISTANT FOREST — dark green tree-line on both sides
  // atmospheric haze blend (lighter green near horizon for depth)
  ctx.fillStyle = "#389838";
  ctx.fillRect(0, 58, 30, 14);
  ctx.fillRect(210, 58, 30, 14);
  // hazy tree-line (distant, lighter)
  ctx.fillStyle = "#48a848";
  for (let i = 0; i < 6; i++) ctx.fillRect(i * 5, 56 + (i % 2), 4, 4);
  for (let i = 0; i < 6; i++) ctx.fillRect(210 + i * 5, 56 + (i % 2), 4, 4);
  ctx.fillStyle = "#287828";
  for (let i = 0; i < 5; i++) ctx.fillRect(i * 6 + 2, 60, 4, 6);
  for (let i = 0; i < 5; i++) ctx.fillRect(212 + i * 6, 60, 4, 6);
  // atmospheric haze band (fades distant elements into sky)
  ctx.fillStyle = "rgba(180,210,230,0.25)";
  ctx.fillRect(0, 58, SCREEN_W, 4);

  // GRASSY GROUND — foreground (where platforms sit)
  ctx.fillStyle = COLOR.grassMid;
  ctx.fillRect(0, 72, SCREEN_W, SCREEN_H - 72);
  ctx.fillStyle = COLOR.grassLight;
  ctx.fillRect(0, 72, SCREEN_W, 14);
  ctx.fillStyle = COLOR.grassDark;
  ctx.fillRect(0, 120, SCREEN_W, SCREEN_H - 120);
  // grass texture blades
  ctx.fillStyle = COLOR.tallGrass1;
  for (let i = 0; i < 16; i++) {
    const gx = (i * 17 + 3) % SCREEN_W;
    const gy = 100 + ((i * 11) % 40);
    ctx.fillRect(gx, gy, 1, 3);
    ctx.fillRect(gx + 1, gy + 1, 1, 2);
  }
  ctx.fillStyle = COLOR.tallGrassLite;
  for (let i = 0; i < 8; i++) {
    ctx.fillRect((i * 31 + 5) % SCREEN_W, 95 + ((i * 7) % 30), 1, 1);
  }
  // FOREGROUND ROCKS & bushes (scattered, frame the scene)
  drawBattleRock(ctx, 4, 132, 14);
  drawBattleRock(ctx, 220, 128, 16);
  drawBattleBush(ctx, 60, 140, 12);
  drawBattleBush(ctx, 180, 142, 10);
  // tiny flowers
  ctx.fillStyle = COLOR.flowerYellow;
  ctx.fillRect(40, 136, 1, 1); ctx.fillRect(41, 135, 1, 1);
  ctx.fillStyle = COLOR.flowerRed;
  ctx.fillRect(200, 138, 1, 1); ctx.fillRect(201, 137, 1, 1);
}

// Soft pixel cloud for battle sky
function drawBattleCloud(ctx, x, y, w, h) {
  ctx.fillStyle = "#f8fcff";
  ctx.fillRect(x + 4, y, w - 8, h);
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
  ctx.fillRect(x, y + 3, w, h - 6);
  ctx.fillRect(x + 6, y - 2, 6, 3);
  ctx.fillRect(x + w - 12, y - 1, 6, 3);
  // shading underside
  ctx.fillStyle = "#d8e8f8";
  ctx.fillRect(x + 2, y + h - 2, w - 4, 2);
}

// Triangular mountain shape (filled)
function drawMountainShape(ctx, x, baseY, w, h, peakOffset) {
  const peakX = x + peakOffset;
  for (let yy = 0; yy < h; yy++) {
    const halfW = Math.floor((w / 2) * (1 - yy / h));
    ctx.fillRect(peakX - halfW, baseY - h + yy, halfW * 2, 1);
  }
}

// Foreground rock
function drawBattleRock(ctx, x, y, s) {
  ctx.fillStyle = COLOR.rockD;
  ctx.fillRect(x, y, s, s - 2);
  ctx.fillStyle = COLOR.rock2;
  ctx.fillRect(x + 1, y + 1, s - 2, s - 4);
  ctx.fillStyle = COLOR.rock1;
  ctx.fillRect(x + 2, y + 1, s - 5, 3);
  ctx.fillStyle = COLOR.rock3;
  ctx.fillRect(x, y + s - 4, s, 2);
}

// Foreground bush
function drawBattleBush(ctx, x, y, s) {
  ctx.fillStyle = COLOR.treeLeaf4;
  ctx.fillRect(x, y, s, s);
  ctx.fillStyle = COLOR.treeLeaf3;
  ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
  ctx.fillStyle = COLOR.treeLeaf2;
  ctx.fillRect(x + 2, y + 1, s - 5, 3);
  ctx.fillStyle = COLOR.treeLeaf1;
  ctx.fillRect(x + 3, y + 2, 2, 1);
}

// ---- Battle platform (the oval shadow under each monster) ----
function drawBattlePlatform(ctx, x, y, w, h, isPlayer) {
  // Textured circular arena pad (GBA style) - layered concentric ellipses with speckle texture + highlight
  const cx = x + w / 2, cy = y + h / 2, rx = w / 2, ry = h / 2;
  const mapId = world.currentMap;
  const isCave = (mapId === "frostcave" || mapId === "lab" || mapId === "center" || mapId === "shop" || mapId === "gym" || mapId === "gymcenter");
  const isSnow = (mapId === "frostcave" || mapId === "gymtown" || mapId === "gym");
  // pick 4-tone palette per biome
  let colEdge, colDark, colMid, colTop;
  if (isCave && !isSnow) { colEdge = COLOR.caveFloor2; colDark = "#5a5a6a"; colMid = COLOR.caveFloor1; colTop = "#b8b8c8"; }
  else if (isSnow) { colEdge = COLOR.snowShade; colDark = "#c8d8e8"; colMid = COLOR.snow2; colTop = "#f8fcff"; }
  else { colEdge = COLOR.grassDark; colDark = COLOR.grassDeep; colMid = COLOR.grassMid; colTop = COLOR.grassLight; }
  // ground shadow (soft drop)
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath(); ctx.ellipse(cx, cy + 2, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  // edge ring (darkest, slightly larger for rim)
  ctx.fillStyle = colEdge;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  // dark mid ring
  ctx.fillStyle = colDark;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx - 2, ry - 2, 0, 0, Math.PI * 2); ctx.fill();
  // main surface
  ctx.fillStyle = colMid;
  ctx.beginPath(); ctx.ellipse(cx, cy, rx - 4, ry - 3, 0, 0, Math.PI * 2); ctx.fill();
  // speckle texture on surface (deterministic clumps)
  ctx.fillStyle = colDark;
  const seed = (cx * 7 + cy * 13) | 0;
  for (let i = 0; i < 14; i++) {
    const a = ((seed + i * 37) % 628) / 100;
    const dr = ((seed + i * 53) % 100) / 100;
    const px = cx + Math.cos(a) * (rx - 6) * dr;
    const py = cy + Math.sin(a) * (ry - 5) * dr;
    ctx.fillRect(Math.round(px), Math.round(py), 1, 1);
  }
  // top highlight crescent (upper-left light)
  ctx.fillStyle = colTop;
  ctx.beginPath(); ctx.ellipse(cx - 1, cy - 1, rx - 6, ry - 5, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
  // bright specular dots
  ctx.fillStyle = (isSnow ? "#ffffff" : (isCave && !isSnow ? "#d8d8e8" : COLOR.grassLight));
  ctx.fillRect(Math.round(cx - rx * 0.45), Math.round(cy - ry * 0.5), 1, 1);
  ctx.fillRect(Math.round(cx - rx * 0.3), Math.round(cy - ry * 0.6), 1, 1);
  ctx.fillRect(Math.round(cx - rx * 0.55), Math.round(cy - ry * 0.2), 1, 1);
}

// ---- GBA-style HP info box (polished: beveled panel, type badge, gender dot) ----
function drawHpBox(ctx, x, y, name, hp, maxHp, level, monster, isEnemy) {
  const bw = 112, bh = 28;
  // drop shadow
  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(x + 2, y + 3, bw, bh);
  // outer dark frame
  ctx.fillStyle = "#404858";
  ctx.fillRect(x, y, bw, bh);
  // beveled light edge (top + left)
  ctx.fillStyle = "#e8e8f0";
  ctx.fillRect(x + 1, y + 1, bw - 2, 1);
  ctx.fillRect(x + 1, y + 1, 1, bh - 2);
  // beveled dark edge (bottom + right)
  ctx.fillStyle = "#9098a8";
  ctx.fillRect(x + 1, y + bh - 2, bw - 2, 1);
  ctx.fillRect(x + bw - 2, y + 1, 1, bh - 2);
  // cream interior
  ctx.fillStyle = COLOR.winBg;
  ctx.fillRect(x + 3, y + 3, bw - 6, bh - 6);
  // subtle interior shade band (bottom)
  ctx.fillStyle = COLOR.winBgDark;
  ctx.fillRect(x + 3, y + bh - 6, bw - 6, 2);

  // name
  ctx.fillStyle = COLOR.textDark;
  ctx.font = "7px monospace";
  ctx.textBaseline = "alphabetic";
  let label = name;
  if (label.length > 10) label = label.slice(0, 9) + ".";
  ctx.fillText(label, x + 6, y + 11);
  // gender dot (player: male blue, enemy: female pink placeholder) - small GBA touch
  // level (right-aligned, with Lv. styling)
  ctx.font = "7px monospace";
  const lvTxt = "Lv" + level;
  ctx.fillText(lvTxt, x + bw - 6 - ctx.measureText(lvTxt).width, y + 11);

  // type badge (compact) under the name on the left
  if (monster && monster.type1 && typeof drawTypeBadge === "function") {
    // mini type pill: 20x7
    const tbx = x + 6, tby = y + 13;
    const tcol = (typeof ACCENT !== "undefined" && ACCENT[monster.type1]) ? ACCENT[monster.type1] : "#888";
    ctx.fillStyle = "#181820";
    ctx.fillRect(tbx - 1, tby, 22, 9);
    ctx.fillStyle = tcol;
    ctx.fillRect(tbx, tby + 1, 20, 7);
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillRect(tbx, tby + 1, 20, 2);
    ctx.fillStyle = "#ffffff";
    ctx.font = "6px monospace";
    ctx.fillText(monster.type1.toUpperCase().slice(0, 5), tbx + 2, tby + 7);
  }

  // HP bar label
  ctx.font = "6px monospace";
  ctx.fillStyle = COLOR.textDark;
  ctx.fillText("HP", x + 32, y + 20);

  // HP bar
  const barX = x + 44, barY = y + 16, barW = isEnemy ? 58 : 40, barH = 5;
  ctx.fillStyle = COLOR.hpBg;
  ctx.fillRect(barX, barY, barW, barH);
  ctx.fillStyle = "#404858";
  ctx.fillRect(barX, barY, barW, 1);
  ctx.fillRect(barX, barY, 1, barH);
  const pct = Math.max(0, hp / maxHp);
  ctx.fillStyle = pct > 0.5 ? COLOR.hpGreen : (pct > 0.2 ? COLOR.hpYellow : COLOR.hpRed);
  ctx.fillRect(barX + 1, barY + 1, Math.max(0, Math.floor((barW - 2) * pct)), barH - 2);

  // HP numbers (player only — enemy hides exact numbers like GBA)
  if (!isEnemy) {
    ctx.fillStyle = COLOR.textDark;
    ctx.font = "6px monospace";
    const hpTxt = `${hp}/${maxHp}`;
    ctx.fillText(hpTxt, x + bw - 6 - ctx.measureText(hpTxt).width, y + 20);
  }

  // status icon
  if (monster) drawStatusIcon(ctx, monster.status, x + bw - 18, y + 4);
}

// ---- Battle bottom textbox (GBA-style command window) ----
function drawBattleTextBox(ctx) {
  const bx = 2, by = 132, bw = SCREEN_W - 4, bh = 26;
  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(bx + 2, by + 2, bw, bh);
  // border
  ctx.fillStyle = COLOR.winBorder;
  ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = COLOR.winBorderLight;
  ctx.fillRect(bx, by, bw, 1);
  ctx.fillRect(bx, by, 1, bh);
  // interior
  ctx.fillStyle = COLOR.winBg;
  ctx.fillRect(bx + 2, by + 2, bw - 4, bh - 4);

  ctx.fillStyle = COLOR.textDark;
  ctx.font = "7px monospace";

  if (battle.outcome || battle.awaitingContinue) {
    wrapText(ctx, battle.message, 6, by + 11, bw - 12, 8);
    if ((Math.floor(Date.now() / 400) % 2) === 0) {
      ctx.fillStyle = COLOR.winBorder;
      ctx.fillRect(SCREEN_W - 12, by + bh - 8, 5, 1);
      ctx.fillRect(SCREEN_W - 11, by + bh - 7, 3, 1);
      ctx.fillRect(SCREEN_W - 10, by + bh - 6, 1, 1);
    }
    return;
  }

  if (battle.menu === "message") {
    wrapText(ctx, battle.message, 6, by + 11, bw - 12, 8);
    return;
  }

  if (battle.menu === "main") {
    const hasCatch = !battle.isTrainerBattle;
    const options = hasCatch
      ? ["FIGHT", "BAG", "PARTY", "CATCH", "RUN"]
      : ["FIGHT", "BAG", "PARTY", "RUN"];
    // 2-col layout in the right portion; message area on left
    // draw a divider
    ctx.fillStyle = COLOR.winBgDark;
    ctx.fillRect(bx + 120, by + 4, 1, bh - 8);
    options.forEach((opt, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      ctx.fillText((battle.cursor === i ? ">" : " ") + opt, 128 + col * 50, by + 11 + row * 9);
    });
    return;
  }

  if (battle.menu === "fight") {
    battle.player.moves.forEach((mk, i) => {
      const m = MOVES[mk];
      if (!m) return;
      const pp = battle.player.pp[mk] || 0;
      const col = i % 2;
      const row = Math.floor(i / 2);
      ctx.fillText((battle.cursor === i ? ">" : " ") + m.name, 6 + col * 116, by + 11 + row * 8);
      ctx.font = "6px monospace";
      ctx.fillText(`PP ${pp}/${battle.player.maxPp[mk]||0}`, 6 + col * 116 + 80, by + 11 + row * 8);
      ctx.font = "7px monospace";
    });
    // Mega-expansion: show ultimate move option if ready
    const ultReady = (typeof ultimateReady === "function") && ultimateReady(battle.player);
    if (ultReady) {
      const ultIdx = battle.player.moves.length;
      const el = (typeof getElement === "function") ? getElement(battle.player.element) : null;
      const ultName = el && el.ultimate ? el.ultimate.name : "ULTIMATE";
      const col = ultIdx % 2;
      const row = Math.floor(ultIdx / 2);
      ctx.fillStyle = "#c81818";
      ctx.fillText((battle.cursor === ultIdx ? ">" : " ") + "* " + ultName, 6 + col * 116, by + 11 + row * 8);
      ctx.font = "6px monospace";
      ctx.fillText("READY", 6 + col * 116 + 80, by + 11 + row * 8);
      ctx.font = "7px monospace";
    }
    return;
  }

  if (battle.menu === "bag") {
    if (!bagList.length) {
      wrapText(ctx, "Bag is empty. (X to go back)", 6, by + 11, bw - 12, 8);
    } else {
      bagList.forEach((ik, i) => {
        const it = ITEMS[ik];
        const col = i % 2;
        const row = Math.floor(i / 2);
        ctx.fillText((battle.cursor === i ? ">" : " ") + `${it.name} x${bagCount(ik)}`, 6 + col * 116, by + 11 + row * 8);
      });
    }
    return;
  }

  if (battle.menu === "catchball") {
    if (!ballList.length) {
      wrapText(ctx, "No balls! (X to go back)", 6, by + 11, bw - 12, 8);
    } else {
      ballList.forEach((bk, i) => {
        const it = ITEMS[bk];
        ctx.fillText((battle.cursor === i ? ">" : " ") + `${it.name} x${bagCount(bk)}`, 6, by + 11 + i * 8);
      });
    }
    return;
  }

  if (battle.menu === "party") {
    // compact party list in the textbox
    player.party.forEach((m, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      ctx.fillText((battle.cursor === i ? ">" : " ") + `${m.name} Lv${m.level}`, 6 + col * 116, by + 11 + row * 8);
      const pct = m.hp / m.maxHp;
      ctx.fillStyle = pct > 0.5 ? COLOR.hpGreen : (pct > 0.2 ? COLOR.hpYellow : COLOR.hpRed);
      ctx.fillRect(6 + col * 116 + 80, by + 6 + row * 8, Math.floor(30 * pct), 3);
      ctx.fillStyle = COLOR.textDark;
    });
    return;
  }
}

function drawHpBar(ctx, x, y, name, hp, maxHp, level, monster) {
  // Legacy wrapper — delegates to the new GBA-style HP box (used only if
  // something calls the old signature; drawBattle now uses drawHpBox directly).
  drawHpBox(ctx, x, y, name, hp, maxHp, level, monster, false);
}

function drawTypeBadges(ctx, monster, x, y) {
  let cx = x;
  drawTypeBadge(ctx, monster.type1, cx, y); cx += 26;
  if (monster.type2) drawTypeBadge(ctx, monster.type2, cx, y);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let cy = y;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line !== "") {
      ctx.fillText(line, x, cy);
      line = word + " ";
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, cy);
}

// ============================================================
//  MEGA EXPANSION — Battle Hooks: Quirks, Elements, Ultimates,
//  Boss routing, Impact frames, Status comic expressions
// ============================================================

// ---- Apply quirk on-turn-start effects (called before player acts) ----
function applyQuirkTurnStart(monster, isWildBattle) {
  if (typeof quirkOnTurnStart !== 'function') return null;
  const event = quirkOnTurnStart(monster, isWildBattle);
  if (!event) return null;

  if (event.healPct && event.healPct > 0) {
    const heal = Math.floor(monster.maxHp * event.healPct);
    monster.hp = Math.min(monster.maxHp, monster.hp + heal);
    queueMessage(event.msg);
  }
  if (event.applyStatus === "sleep" && !quirkSleepImmune(monster)) {
    monster.status = STATUS.SLEEP;
    monster.sleepTurns = 1 + Math.floor(Math.random() * 3);
    queueMessage(event.msg);
  }
  if (event.flinch) {
    queueMessage(event.msg);
    return "skip";  // signal to skip this turn
  }
  if (event.autoFlee) {
    queueMessage(event.msg);
    battle.outcome = "fled";
    battle.menu = "message";
    battle.awaitingContinue = true;
    return "flee";
  }
  return null;
}

// ---- Apply quirk on-switch-in effects ----
function applyQuirkSwitchIn(monster) {
  if (typeof quirkOnSwitchIn !== 'function') return;
  const event = quirkOnSwitchIn(monster);
  if (!event) return;
  if (event.buff && event.stages) {
    monster.statStages[event.buff] = Math.min(6, (monster.statStages[event.buff] || 0) + event.stages);
    queueMessage(event.msg);
  }
  if (event.healPartyPct && event.healPartyPct > 0) {
    player.party.forEach(m => {
      if (m.hp > 0) {
        m.hp = Math.min(m.maxHp, m.hp + Math.floor(m.maxHp * event.healPartyPct));
      }
    });
    queueMessage(event.msg);
  }
}

// ---- Apply quirk on-move-use effects (free PP / chaos boost) ----
function applyQuirkMoveUse(monster, moveKey) {
  if (typeof quirkOnMoveUse !== 'function') return null;
  const event = quirkOnMoveUse(monster);
  if (!event) return null;
  if (event.freePp) {
    monster.pp[moveKey] = Math.min(monster.maxPp[moveKey] || 99, (monster.pp[moveKey] || 0) + 1);
    queueMessage(event.msg);
  }
  if (event.randomBoost) {
    // Apply a random bonus: extra damage, heal, or status
    const roll = Math.random();
    if (roll < 0.33) {
      // Extra damage will be applied via a flag
      queueMessage(event.msg);
      return "extraDamage";
    } else if (roll < 0.66) {
      monster.hp = Math.min(monster.maxHp, monster.hp + Math.floor(monster.maxHp * 0.15));
      queueMessage(event.msg + " (Healed!)");
    } else {
      queueMessage(event.msg + " (Status inflicted on foe!)");
      return "inflictStatus";
    }
  }
  return null;
}

// ---- Apply quirk on-KO effects ----
function applyQuirkOnKo(monster) {
  if (typeof quirkOnKo !== 'function') return;
  const event = quirkOnKo(monster);
  if (!event) return;
  if (event.buff && event.stages) {
    monster.statStages[event.buff] = Math.min(6, (monster.statStages[event.buff] || 0) + event.stages);
    queueMessage(event.msg);
  }
}

// ---- Apply quirk on-battle-win effects (hoarder scavenges) ----
function applyQuirkOnBattleWin(monster) {
  if (typeof quirkOnBattleWin !== 'function') return null;
  const event = quirkOnBattleWin(monster);
  if (!event) return null;
  if (event.item && typeof giveItem === 'function') {
    giveItem(event.item);
    queueMessage(event.msg);
  }
  return event;
}

// ---- Check for ultimate move usage ----
function isUltimateMove(moveKey) {
  return moveKey === "__ULT__";
}

// ---- Execute an ultimate move ----
function executeUltimateMove(attacker, defender, isPlayer, cb) {
  if (typeof resolveUltimate !== 'function') {
    queueMessage(`${attacker.name}'s ultimate isn't ready!`);
    setTimeout(() => cb && cb(), 800);
    return;
  }
  const result = resolveUltimate(attacker, defender);
  if (!result) {
    queueMessage(`${attacker.name}'s ultimate is on cooldown!`);
    setTimeout(() => cb && cb(), 800);
    return;
  }

  queueMessage(`${attacker.name} used ${result.moveName}!`);

  setTimeout(() => {
    if (result.damage) {
      defender.hp = Math.max(0, defender.hp - result.damage);
      battle.shakeTimer = 25;
      battle.flashTimer = 20;
      // Ultimate impact frame: monochrome inverted flash
      battle.ultimateFlash = 15;
      queueMessage(`${defender.name} took ${result.damage} damage!`);
    }
    if (result.status) {
      defender.status = result.status;
      defender.statusTurns = result.statusTurns || 2;
      queueMessage(`${defender.name} was afflicted!`);
    }
    if (result.heal) {
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + result.heal);
      queueMessage(`${attacker.name} recovered HP!`);
    }
    if (result.buffSelf) {
      attacker.statStages[result.buffSelf] = Math.min(6, (attacker.statStages[result.buffSelf] || 0) + 2);
      queueMessage(`${attacker.name}'s stats rose!`);
    }
    if (result.stealBuffs) {
      // Steal enemy's positive stat stages
      Object.keys(defender.statStages).forEach(stat => {
        if (defender.statStages[stat] > 0) {
          attacker.statStages[stat] = (attacker.statStages[stat] || 0) + defender.statStages[stat];
          defender.statStages[stat] = 0;
        }
      });
      queueMessage(`${attacker.name} stole the foe's stat boosts!`);
    }
    // Set cooldown
    attacker.ultCooldown = (attacker.ultCooldown || 0) + result.cooldown;
    if (typeof sfxUltimateRelease === "function") sfxUltimateRelease();
    cb && cb();
  }, 1000);
}

// ---- Decrement ultimate cooldown each turn ----
function tickUltimateCooldown(monster) {
  if (monster.ultCooldown && monster.ultCooldown > 0) {
    monster.ultCooldown--;
  }
}

// ---- Check if monster has ultimate available ----
function ultimateReady(monster) {
  return monster.element && (!monster.ultCooldown || monster.ultCooldown <= 0) &&
         monster.moves && monster.moves.includes("__ULT__");
}

// ---- Boss battle routing: if boss battle, use bossTurn instead of enemyTurn ----
function checkBossTurn() {
  if (battle && battle.isBossBattle && !battle.turnBusy) {
    if (typeof bossTurn === 'function') {
      bossTurn();
      return true;
    }
  }
  return false;
}

// ---- Check boss phase transition after damage ----
function checkBossPhaseAfterDamage() {
  if (battle && battle.isBossBattle && typeof checkBossPhaseTransition === 'function') {
    checkBossPhaseTransition();
  }
}

// ---- Impact frame rendering: monochrome inverted-color on crits ----
function drawImpactFrame(ctx) {
  if (!battle) return;
  // Ultimate flash: full-screen monochrome inversion
  if (battle.ultimateFlash && battle.ultimateFlash > 0) {
    battle.ultimateFlash--;
    ctx.save();
    ctx.globalAlpha = (battle.ultimateFlash / 15) * 0.5;
    ctx.globalCompositeOperation = 'difference';
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    ctx.restore();
  }
  // Crit flash: brief inverted color
  if (battle.critFlash && battle.critFlash > 0) {
    battle.critFlash--;
    ctx.save();
    ctx.globalAlpha = (battle.critFlash / 10) * 0.3;
    ctx.globalCompositeOperation = 'difference';
    ctx.fillStyle = "#f8f8f8";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    ctx.restore();
  }
}

// ---- Status comic expressions: draw over sprites based on status ----
function drawStatusComicEyes(ctx, monster, x, y, isPlayer) {
  if (!monster || monster.status === STATUS.NONE) return;
  const eyeY = y + (isPlayer ? 8 : 6);
  const eyeXL = x + 6;
  const eyeXR = x + 10;

  ctx.save();
  switch (monster.status) {
    case STATUS.CONFUSION:
      // Swirl eyes
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      [eyeXL, eyeXR].forEach(ex => {
        ctx.beginPath();
        ctx.arc(ex + 1, eyeY, 2, 0, Math.PI * 1.5);
        ctx.stroke();
      });
      break;
    case STATUS.SLEEP:
      // Closed eyes (lines)
      ctx.fillStyle = "#000";
      ctx.fillRect(eyeXL, eyeY, 3, 1);
      ctx.fillRect(eyeXR, eyeY, 3, 1);
      break;
    case STATUS.BURN:
      // Dizzy X eyes
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      [eyeXL, eyeXR].forEach(ex => {
        ctx.beginPath();
        ctx.moveTo(ex, eyeY); ctx.lineTo(ex + 3, eyeY + 3);
        ctx.moveTo(ex + 3, eyeY); ctx.lineTo(ex, eyeY + 3);
        ctx.stroke();
      });
      break;
    case STATUS.FREEZE:
      // Frozen eyes (ice blocks)
      ctx.fillStyle = "#a0d0f0";
      ctx.fillRect(eyeXL, eyeY, 3, 3);
      ctx.fillRect(eyeXR, eyeY, 3, 3);
      break;
    case STATUS.POISON:
    case STATUS.TOXIC:
      // Dizzy spiral eyes (purple tint)
      ctx.strokeStyle = "#a040a0";
      ctx.lineWidth = 1;
      [eyeXL, eyeXR].forEach(ex => {
        ctx.beginPath();
        ctx.arc(ex + 1, eyeY + 1, 1.5, 0, Math.PI * 2);
        ctx.stroke();
      });
      break;
    case STATUS.PARALYSIS:
      // Zigzag eyes
      ctx.strokeStyle = "#f8c020";
      ctx.lineWidth = 1;
      [eyeXL, eyeXR].forEach(ex => {
        ctx.beginPath();
        ctx.moveTo(ex, eyeY); ctx.lineTo(ex + 1, eyeY + 1);
        ctx.lineTo(ex + 2, eyeY); ctx.lineTo(ex + 3, eyeY + 1);
        ctx.stroke();
      });
      break;
  }
  ctx.restore();
}

// ---- Elemental aura drawing (glow around battle sprites) ----
function drawElementalAura(ctx, monster, x, y, w, h) {
  if (!monster || !monster.element) return;
  if (typeof getElement !== 'function') return;
  const el = getElement(monster.element);
  if (!el) return;
  const t = Date.now() / 200;
  ctx.save();
  ctx.globalAlpha = 0.15 + Math.sin(t) * 0.08;
  ctx.fillStyle = el.glow || "#ffffff";
  // Aura as a soft rectangular glow
  ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
  ctx.globalAlpha = 0.25 + Math.sin(t + 1) * 0.1;
  ctx.fillStyle = el.glow || "#ffffff";
  ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  ctx.restore();
}

// ---- Footprint trail: draw glowing footprints behind moving battle sprites ----
let battleFootprints = [];
function addBattleFootprint(x, y, color) {
  battleFootprints.push({ x, y, color, life: 15 });
}
function drawBattleFootprints(ctx) {
  for (let i = battleFootprints.length - 1; i >= 0; i--) {
    const fp = battleFootprints[i];
    fp.life--;
    ctx.save();
    ctx.globalAlpha = fp.life / 15 * 0.4;
    ctx.fillStyle = fp.color;
    ctx.fillRect(fp.x, fp.y, 2, 2);
    ctx.restore();
    if (fp.life <= 0) battleFootprints.splice(i, 1);
  }
}

// ---- Cinematic evolution sequence overlay ----
let evolutionSequence = null;
function startEvolutionSequence(monster, newSpeciesKey, cb) {
  evolutionSequence = {
    monster, newSpeciesKey, phase: 0, timer: 0, cb
  };
  sfxEvolve();
}

function tickEvolutionSequence() {
  if (!evolutionSequence) return false;
  evolutionSequence.timer++;
  if (evolutionSequence.timer > 20 && evolutionSequence.phase === 0) {
    evolutionSequence.phase = 1;
  }
  if (evolutionSequence.timer > 60) {
    // Complete
    const cb = evolutionSequence.cb;
    evolutionSequence = null;
    if (cb) cb();
  }
  return true;
}

function drawEvolutionSequence(ctx) {
  if (!evolutionSequence) return;
  const t = evolutionSequence.timer;
  // Flash-bang effect
  ctx.save();
  if (t < 20) {
    // Growing white flash
    ctx.globalAlpha = t / 20;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  } else if (t < 50) {
    // Pulsing glow
    const pulse = Math.sin(t * 0.3) * 0.5 + 0.5;
    ctx.globalAlpha = pulse * 0.6;
    ctx.fillStyle = "#f8f8a0";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    // Aura matrix lines
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const offset = (t * 2 + i * 30) % SCREEN_W;
      ctx.beginPath();
      ctx.moveTo(offset, 0);
      ctx.lineTo(offset, SCREEN_H);
      ctx.stroke();
    }
  } else {
    // Fading out
    ctx.globalAlpha = (60 - t) / 10;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  }
  ctx.restore();
}

// ---- Assign quirks to newly created monsters ----
function maybeAssignQuirkToNewMonster(monster) {
  if (typeof maybeAssignRandomQuirk === 'function') {
    maybeAssignRandomQuirk(monster, 0.6);
  }
}

// ---- Enhanced endBattle with quirk win effects ----
function enhancedEndBattleHook() {
  if (!battle) return;
  // Apply quirk on-battle-win for active player monster
  if (battle.outcome === "won" && battle.player) {
    applyQuirkOnBattleWin(battle.player);
    // Gain friendship
    if (typeof gainBattleFriendship === 'function') {
      gainBattleFriendship(battle.player, 2);
    }
  }
}

// ---- Get effective stat with element bonus ----
function effectiveStatWithElement(monster, statName) {
  let base = effectiveStat(monster, statName);
  if (typeof elementStatBonus === 'function') {
    base += elementStatBonus(monster, statName);
  }
  if (typeof toolStatBonus === 'function') {
    base += toolStatBonus(monster, statName);
  }
  return Math.max(1, base);
}

// ---- Apply tool quirk effects in battle ----
function applyToolQuirkInBattle(monster) {
  if (typeof rollToolQuirk !== 'function') return null;
  const event = rollToolQuirk(monster);
  if (!event) return null;
  queueMessage(event.msg);
  return event;
}
