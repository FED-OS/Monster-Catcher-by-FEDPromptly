let battle = null; // active battle state, null when not in battle

function startRandomEncounter() {
  const speciesKey = ENCOUNTER_TABLE[Math.floor(Math.random() * ENCOUNTER_TABLE.length)];
  const level = 2 + Math.floor(Math.random() * 4);
  const wild = createMonsterInstance(speciesKey, level);

  battle = {
    wild,
    player: player.party[0],
    menu: "main",       // "main" | "fight" | "message"
    cursor: 0,
    message: `A wild ${wild.name} appeared!`,
    playerTurnLock: false,
    outcome: null        // "run" | "caught" | "fainted" | "fled" | null
  };
  game.state = GAME_STATE.BATTLE;
}

function endBattle() {
  battle = null;
  game.state = GAME_STATE.OVERWORLD;
}

function battleInput(key) {
  if (!battle) return;

  if (battle.outcome) {
    // any confirm key closes the result screen
    if (key === "confirm") endBattle();
    return;
  }

  if (battle.menu === "main") {
    if (key === "down") battle.cursor = (battle.cursor + 1) % 3;
    if (key === "up") battle.cursor = (battle.cursor + 2) % 3;
    if (key === "confirm") {
      if (battle.cursor === 0) { battle.menu = "fight"; battle.cursor = 0; }
      else if (battle.cursor === 1) attemptCatch();
      else if (battle.cursor === 2) attemptRun();
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
  const { dmg, mult } = calcDamage(battle.player, battle.wild, moveKey);
  battle.wild.hp = Math.max(0, battle.wild.hp - dmg);

  let note = "";
  if (mult > 1) note = " It's super effective!";
  else if (mult < 1 && mult > 0) note = " It's not very effective...";

  battle.message = `${battle.player.name} used ${MOVES[moveKey].name}!${note}`;
  battle.menu = "message";

  if (battle.wild.hp <= 0) {
    setTimeout(() => {
      battle.message = `Wild ${battle.wild.name} fainted!`;
      battle.outcome = "won";
    }, 700);
    return;
  }

  setTimeout(enemyTurn, 900);
}

function enemyTurn() {
  const moveKey = battle.wild.moves[Math.floor(Math.random() * battle.wild.moves.length)];
  const { dmg, mult } = calcDamage(battle.wild, battle.player, moveKey);
  battle.player.hp = Math.max(0, battle.player.hp - dmg);

  let note = "";
  if (mult > 1) note = " It's super effective!";
  else if (mult < 1 && mult > 0) note = " It's not very effective...";

  battle.message = `Wild ${battle.wild.name} used ${MOVES[moveKey].name}!${note}`;

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
  const chance = catchChance(battle.wild, 1.0);
  battle.message = "You threw a ball...";
  battle.menu = "message";

  setTimeout(() => {
    if (Math.random() < chance) {
      battle.message = `Gotcha! ${battle.wild.name} was caught!`;
      player.party.push(battle.wild);
      battle.outcome = "caught";
    } else {
      battle.message = "Oh no! It broke free!";
      setTimeout(enemyTurn, 900);
    }
  }, 900);
}

function attemptRun() {
  battle.message = "Got away safely!";
  battle.outcome = "fled";
}

function drawBattle(ctx) {
  // background
  ctx.fillStyle = PALETTE.light;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  // wild monster blob (top right area)
  ctx.fillStyle = battle.wild.color;
  ctx.fillRect(100, 20, 28, 24);
  ctx.fillStyle = PALETTE.black;
  ctx.fillRect(106, 26, 4, 4);
  ctx.fillRect(118, 26, 4, 4);

  // wild HP bar
  drawHpBar(ctx, 8, 8, battle.wild.name, battle.wild.hp, battle.wild.maxHp, battle.wild.level);

  // player monster blob (bottom left area)
  ctx.fillStyle = battle.player.color;
  ctx.fillRect(24, 78, 28, 24);
  ctx.fillStyle = PALETTE.black;
  ctx.fillRect(30, 84, 4, 4);
  ctx.fillRect(42, 84, 4, 4);

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
    const options = ["FIGHT", "CATCH", "RUN"];
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
