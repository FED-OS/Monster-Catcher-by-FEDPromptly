let battle = null; // active battle state, null when not in battle

function startRandomEncounter() {
  const speciesKey = ENCOUNTER_TABLE[Math.floor(Math.random() * ENCOUNTER_TABLE.length)];
  const level = 2 + Math.floor(Math.random() * 4);
  const wild = createMonsterInstance(speciesKey, level);

  battle = {
    isTrainerBattle: false,
    trainerNpc: null,
    enemyTeam: [wild],
    enemyIndex: 0,
    enemy: wild,
    player: firstUsableParty(),
    menu: "main",       // "main" | "fight" | "message"
    cursor: 0,
    message: `A wild ${wild.name} appeared!`,
    outcome: null        // "won" | "lost" | "caught" | "fled" | null
  };
  game.state = GAME_STATE.BATTLE;
}

function startTrainerBattle(npc) {
  const team = npc.team.map(m => createMonsterInstance(m.speciesKey, m.level));

  battle = {
    isTrainerBattle: true,
    trainerNpc: npc,
    enemyTeam: team,
    enemyIndex: 0,
    enemy: team[0],
    player: firstUsableParty(),
    menu: "main",
    cursor: 0,
    message: (npc.dialogue && npc.dialogue.length)
      ? npc.dialogue[npc.dialogue.length - 1]
      : `${npc.id} wants to battle!`,
    outcome: null
  };
  game.state = GAME_STATE.BATTLE;
}

function firstUsableParty() {
  return player.party.find(m => m.hp > 0) || player.party[0];
}

function endBattle() {
  if (battle && battle.isTrainerBattle && battle.outcome === "won") {
    battle.trainerNpc.defeated = true;
  }
  battle = null;
  game.state = GAME_STATE.OVERWORLD;

  if (battle === null && dialogueQueueAfterBattle) {
    startDialogue(dialogueQueueAfterBattle);
    dialogueQueueAfterBattle = null;
  }
}

let dialogueQueueAfterBattle = null;

function battleInput(key) {
  if (!battle) return;

  if (battle.outcome) {
    if (key === "confirm") endBattle();
    return;
  }

  if (battle.menu === "main") {
    const maxIdx = battle.isTrainerBattle ? 1 : 2; // trainer battles: no CATCH option
    if (key === "down") battle.cursor = (battle.cursor + 1) % (maxIdx + 1);
    if (key === "up") battle.cursor = (battle.cursor + maxIdx + 1) % (maxIdx + 1);
    if (key === "confirm") {
      if (battle.cursor === 0) { battle.menu = "fight"; battle.cursor = 0; }
      else if (!battle.isTrainerBattle && battle.cursor === 1) attemptCatch();
      else attemptRun();
    }
    return;
  }

  if (battle.menu === "fight") {
    const moves = battle.player.moves;
    if (key === "down") battle.cursor = (battle.cursor + 1) % moves.length;
    if (key === "up") battle.cursor = (battle.cursor + moves.length - 1) % moves.length;
    if (key === "cancel") { battle.menu = "main"; battle.cursor = 0; }
    if (key === "confirm") {
      playerAttack(moves[battle.cursor]);
    }
    return;
  }
}

function playerAttack(moveKey) {
  const { dmg, mult } = calcDamage(battle.player, battle.enemy, moveKey);
  battle.enemy.hp = Math.max(0, battle.enemy.hp - dmg);

  let note = "";
  if (mult > 1) note = " It's super effective!";
  else if (mult < 1 && mult > 0) note = " It's not very effective...";

  battle.message = `${battle.player.name} used ${MOVES[moveKey].name}!${note}`;
  battle.menu = "message";

  if (battle.enemy.hp <= 0) {
    setTimeout(handleEnemyFainted, 700);
    return;
  }

  setTimeout(enemyTurn, 900);
}

function handleEnemyFainted() {
  const defeatedName = battle.enemy.name;
  const defeatedLevel = battle.enemy.level;
  battle.message = `${battle.isTrainerBattle ? "" : "Wild "}${defeatedName} fainted!`;

  // trainer has more monsters left -> send next one out instead of ending
  if (battle.isTrainerBattle && battle.enemyIndex < battle.enemyTeam.length - 1) {
    setTimeout(() => {
      battle.enemyIndex++;
      battle.enemy = battle.enemyTeam[battle.enemyIndex];
      battle.message = `${battle.trainerNpc.id} sent out ${battle.enemy.name}!`;
      battle.menu = "message";
      setTimeout(() => { battle.menu = "main"; battle.cursor = 0; }, 1000);
    }, 700);
    return;
  }

  const events = grantExperience(battle.player, defeatedLevel);
  setTimeout(() => {
    let msg = `${battle.player.name} gained ${events.gained} XP!`;
    if (events.evolvedTo) msg += ` It evolved into ${events.evolvedTo}!`;
    else if (events.leveledUp) msg += ` Level up! Now Lv${battle.player.level}.`;
    battle.message = msg;
    battle.outcome = "won";

    if (battle.isTrainerBattle && battle.trainerNpc.defeatedDialogue) {
      dialogueQueueAfterBattle = battle.trainerNpc.defeatedDialogue;
    }
  }, 700);
}

function enemyTurn() {
  const moveKey = battle.enemy.moves[Math.floor(Math.random() * battle.enemy.moves.length)];
  const { dmg, mult } = calcDamage(battle.enemy, battle.player, moveKey);
  battle.player.hp = Math.max(0, battle.player.hp - dmg);

  let note = "";
  if (mult > 1) note = " It's super effective!";
  else if (mult < 1 && mult > 0) note = " It's not very effective...";

  battle.message = `${battle.isTrainerBattle ? "" : "Wild "}${battle.enemy.name} used ${MOVES[moveKey].name}!${note}`;

  if (battle.player.hp <= 0) {
    setTimeout(() => {
      battle.message = `${battle.player.name} fainted!`;
      battle.outcome = "lost";
    }, 700);
  } else {
    setTimeout(() => { battle.menu = "main"; battle.cursor = 0; }, 900);
  }
}

function attemptCatch() {
  if (player.balls <= 0) {
    battle.message = "You don't have any balls left!";
    battle.menu = "message";
    setTimeout(() => { battle.menu = "main"; }, 900);
    return;
  }
  player.balls--;
  const chance = catchChance(battle.enemy, 1.0);
  battle.message = "You threw a ball...";
  battle.menu = "message";

  setTimeout(() => {
    if (Math.random() < chance) {
      battle.message = `Gotcha! ${battle.enemy.name} was caught!`;
      player.party.push(battle.enemy);
      battle.outcome = "caught";
    } else {
      battle.message = "Oh no! It broke free!";
      setTimeout(enemyTurn, 900);
    }
  }, 900);
}

function attemptRun() {
  if (battle.isTrainerBattle) {
    battle.message = "You can't run from a trainer battle!";
    battle.menu = "message";
    setTimeout(() => { battle.menu = "main"; }, 900);
    return;
  }
  battle.message = "Got away safely!";
  battle.outcome = "fled";
}

function drawBattle(ctx) {
  // background
  ctx.fillStyle = PALETTE.light;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  // enemy monster sprite (top right area)
  drawMonsterSprite(ctx, battle.enemy, 96, 16, 36);

  // enemy HP bar
  drawHpBar(ctx, 8, 8, battle.enemy.name, battle.enemy.hp, battle.enemy.maxHp, battle.enemy.level);

  // player monster sprite (bottom left area)
  drawMonsterSprite(ctx, battle.player, 20, 72, 36);

  // player HP bar
  drawHpBar(ctx, 74, 60, battle.player.name, battle.player.hp, battle.player.maxHp, battle.player.level);

  // bottom textbox
  ctx.fillStyle = PALETTE.black;
  ctx.fillRect(2, 104, SCREEN_W - 4, 38);
  ctx.fillStyle = PALETTE.light;
  ctx.fillRect(4, 106, SCREEN_W - 8, 34);

  ctx.fillStyle = PALETTE.black;
  ctx.font = "6px monospace";

  if (battle.outcome) {
    wrapText(ctx, battle.message, 8, 116, SCREEN_W - 16, 7);
    wrapText(ctx, "Press Z to continue", 8, 132, SCREEN_W - 16, 7);
    return;
  }

  if (battle.menu === "message") {
    wrapText(ctx, battle.message, 8, 116, SCREEN_W - 16, 7);
    return;
  }

  if (battle.menu === "main") {
    const options = battle.isTrainerBattle ? ["FIGHT", "RUN"] : ["FIGHT", "CATCH", "RUN"];
    options.forEach((opt, i) => {
      ctx.fillText((battle.cursor === i ? "> " : "  ") + opt, 10, 116 + i * 9);
    });
    return;
  }

  if (battle.menu === "fight") {
    battle.player.moves.forEach((mk, i) => {
      ctx.fillText((battle.cursor === i ? "> " : "  ") + MOVES[mk].name, 10, 116 + i * 9);
    });
  }
}

function drawHpBar(ctx, x, y, name, hp, maxHp, level) {
  ctx.fillStyle = PALETTE.black;
  ctx.font = "6px monospace";
  ctx.fillText(`${name} Lv${level}`, x, y);

  const barW = 50;
  ctx.strokeStyle = PALETTE.black;
  ctx.strokeRect(x, y + 3, barW, 4);
  const pct = Math.max(0, hp / maxHp);
  ctx.fillStyle = pct > 0.5 ? PALETTE.dark : "#d64545";
  ctx.fillRect(x + 1, y + 4, Math.floor((barW - 2) * pct), 2);
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
