// ============================================================
//  Monster Catcher — Main
//  Canvas setup, game loop, input, state machine wiring for:
//  TITLE / OVERWORLD / BATTLE / MENU. Includes map transitions.
// ============================================================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const game = {
  state: GAME_STATE.TITLE,
  flags: {},
  titleCursor: 0,
  titleTime: 0,
  hasSaveOnBoot: hasSave(),
  // HERO: save slot selection state
  titleMode: "main",     // "main" or "slots"
  slotCursor: 0,
  slotAction: "load"     // "load" or "save" or "newgame"
};

const keyMap = {
  ArrowUp: "up", KeyW: "up",
  ArrowDown: "down", KeyS: "down",
  ArrowLeft: "left", KeyA: "left",
  ArrowRight: "right", KeyD: "right",
  KeyZ: "confirm", Enter: "confirm",
  KeyX: "cancel", Escape: "cancel"
};

const dirDelta = {
  up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0]
};

// ---- Input dispatch ----
window.addEventListener("keydown", (e) => {
  const key = keyMap[e.code];
  if (!key) return;
  e.preventDefault();
  ensureAudio(); // unlock audio on first keypress

  if (game.state === GAME_STATE.TITLE) {
    titleInput(key);
    return;
  }

  if (game.state === GAME_STATE.MENU) {
    if (key === "up" || key === "down" || key === "confirm" || key === "cancel") sfxMenu();
    menuInput(key);
    return;
  }

  if (game.state === GAME_STATE.OVERWORLD) {
    if (dialogue) {
      if (key === "confirm") { advanceDialogue(); sfxConfirm(); }
      return;
    }
    if (dirDelta[key]) {
      const [dc, dr] = dirDelta[key];
      tryMove(dc, dr);
      sfxMove();
    }
    if (key === "confirm") { interact(); sfxConfirm(); }
    if (key === "cancel") {
      // open start menu on cancel key when no dialogue
      openStartMenu();
      sfxMenu();
    }
    return;
  }

  if (game.state === GAME_STATE.BATTLE) {
    if (key === "up" || key === "down" || key === "confirm" || key === "cancel") sfxMenu();
    battleInput(key);
    return;
  }
});

// ---- Title screen input ----
function titleInput(key) {
  // ---- HERO: Save slot selection mode ----
  if (game.titleMode === "slots") {
    if (key === "down") game.slotCursor = (game.slotCursor + 1) % (NUM_SAVE_SLOTS + 1);
    if (key === "up") game.slotCursor = (game.slotCursor + NUM_SAVE_SLOTS) % (NUM_SAVE_SLOTS + 1);
    if (key === "cancel") {
      game.titleMode = "main";
      sfxMenu();
      return;
    }
    if (key === "confirm") {
      sfxTitle();
      if (game.slotCursor === NUM_SAVE_SLOTS) {
        // "Back" option
        game.titleMode = "main";
        return;
      }
      const slot = game.slotCursor;
      if (game.slotAction === "newgame") {
        initNewGame();
        game.state = GAME_STATE.OVERWORLD;
        world.currentMap = "lab";
        player.col = 4;
        player.row = 6;
        player.facing = "up";
        startDialogue(STORY_INTRO.concat(["__GO_TO_PROF__"]));
        // Save the new game to the selected slot
        saveToSlot(slot);
        game.titleMode = "main";
      } else if (game.slotAction === "load") {
        if (loadFromSlot(slot)) {
          game.state = GAME_STATE.OVERWORLD;
          game.titleMode = "main";
        } else {
          // slot is empty — start new game in this slot
          initNewGame();
          game.state = GAME_STATE.OVERWORLD;
          world.currentMap = "lab";
          player.col = 4;
          player.row = 6;
          player.facing = "up";
          startDialogue(STORY_INTRO.concat(["__GO_TO_PROF__"]));
          saveToSlot(slot);
          game.titleMode = "main";
        }
      }
    }
    return;
  }

  // ---- Main title menu ----
  const options = game.hasSaveOnBoot ? ["NEW GAME", "CONTINUE", "MUTE"] : ["NEW GAME", "MUTE"];
  if (key === "down") game.titleCursor = (game.titleCursor + 1) % options.length;
  if (key === "up") game.titleCursor = (game.titleCursor + options.length - 1) % options.length;
  if (key === "confirm") {
    const opt = options[game.titleCursor];
    sfxTitle();
    if (opt === "NEW GAME") {
      // Enter slot selection to pick where to save
      game.titleMode = "slots";
      game.slotCursor = 0;
      game.slotAction = "newgame";
    } else if (opt === "CONTINUE") {
      // Enter slot selection to pick which save to load
      game.titleMode = "slots";
      game.slotCursor = 0;
      game.slotAction = "load";
    } else if (opt === "MUTE") {
      settings.muted = !settings.muted;
    }
  }
}

// ---- Render routines ----
function drawOverworld() {
  // Apply screen shake offset if active
  let shakeX = 0, shakeY = 0;
  if (typeof screenShakeOffset === "function") {
    const off = screenShakeOffset();
    shakeX = off.x; shakeY = off.y;
  }
  ctx.save();
  ctx.translate(shakeX, shakeY);

  drawMap(ctx);
  drawNpcs(ctx);

  // Draw world creatures (autonomous AI) above NPCs, below player
  if (typeof drawWorldCreatures === "function") drawWorldCreatures(ctx);

  drawPlayer(ctx);

  // Draw environment particles (grass bends, water ripples, Zzz, alert !)
  if (typeof drawEnvParticles === "function") drawEnvParticles(ctx);

  drawDialogue(ctx);

  ctx.restore();

  // ---- Particles (drawn above world but below UI overlays) ----
  if (typeof drawParticles === "function") drawParticles(ctx);

  // ---- Time-of-day overlay (day/evening/night/dawn) ----
  if (typeof getTimeTint === "function") {
    const tint = getTimeTint();
    if (tint && tint !== "rgba(0,0,0,0)") {
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    }
  }

  // ---- Weather overlay ----
  if (typeof getWeatherTint === "function") {
    const wtint = getWeatherTint();
    if (wtint && wtint !== "rgba(0,0,0,0)") {
      ctx.fillStyle = wtint;
      ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
      // animated weather particles
      drawWeatherParticles(ctx);
    }
  }

  // map transition fade (smooth black fade)
  if (world.transitioning) {
    const a = Math.min(0.9, (world.transitionAlpha || 0));
    ctx.fillStyle = `rgba(8,24,32,${a})`;
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  }

  // ---- Full-screen effects (flash, battle wipe, floating text) ----
  if (typeof drawAllEffects === "function") drawAllEffects(ctx);
}

// Draw animated weather particles (rain streaks / snow flakes).
function drawWeatherParticles(ctx) {
  const weather = (typeof getMapWeather === "function") ? getMapWeather() : "none";
  const f = (typeof worldAnimFrame !== "undefined") ? worldAnimFrame : 0;
  if (weather === "rain") {
    ctx.fillStyle = "rgba(180,200,240,0.5)";
    for (let i = 0; i < 30; i++) {
      const x = (i * 53 + f * 3) % SCREEN_W;
      const y = (i * 31 + f * 6) % SCREEN_H;
      ctx.fillRect(x, y, 1, 3);
    }
  } else if (weather === "snow") {
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    for (let i = 0; i < 24; i++) {
      const x = (i * 47 + Math.sin((f + i * 10) / 30) * 8) % SCREEN_W;
      const y = (i * 29 + f * 2) % SCREEN_H;
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function drawTitleScreen() {
  // ---- Sky gradient background ----
  const sky = (typeof getSkyColors === "function") ? getSkyColors() : [COLOR.skyDay, COLOR.skyDay2];
  ctx.fillStyle = sky[0];
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  ctx.fillStyle = sky[1];
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H / 2);

  // ---- Distant landscape silhouette ----
  // rolling hills
  ctx.fillStyle = COLOR.grassDark;
  ctx.fillRect(0, 110, SCREEN_W, 50);
  ctx.fillStyle = COLOR.grassMid;
  ctx.fillRect(0, 120, SCREEN_W, 40);
  // hill bumps
  ctx.fillStyle = COLOR.grassDark;
  ctx.beginPath(); ctx.ellipse(50, 120, 40, 18, 0, Math.PI, 0); ctx.fill();
  ctx.beginPath(); ctx.ellipse(150, 118, 50, 20, 0, Math.PI, 0); ctx.fill();
  ctx.beginPath(); ctx.ellipse(210, 122, 35, 16, 0, Math.PI, 0); ctx.fill();
  // trees on hills
  ctx.fillStyle = COLOR.treeLeaf3;
  ctx.fillRect(20, 104, 8, 10);
  ctx.fillRect(130, 100, 10, 12);
  ctx.fillRect(200, 106, 8, 10);

  // ---- Floating creature (bobs with time) ----
  drawTitleCreature(ctx, SCREEN_W / 2, 56, 32, game.titleTime);

  // ---- Title logo (styled, GBA-style with shadow) ----
  ctx.textAlign = "center";
  // shadow
  ctx.fillStyle = "rgba(8,24,32,0.5)";
  ctx.font = "bold 16px monospace";
  ctx.fillText("MONSTER", SCREEN_W / 2 + 2, 92);
  ctx.fillText("CATCHER", SCREEN_W / 2 + 2, 108);
  // main title with accent
  ctx.fillStyle = COLOR.shirtRed;
  ctx.fillText("MONSTER", SCREEN_W / 2, 90);
  ctx.fillStyle = COLOR.shirtRedD;
  ctx.fillText("CATCHER", SCREEN_W / 2, 106);
  // subtitle
  ctx.font = "bold 7px monospace";
  ctx.fillStyle = COLOR.winBorder;
  ctx.fillText("Verdale Region  -  GBA Edition", SCREEN_W / 2, 120);
  ctx.textAlign = "left";

  // ---- Menu options window (GBA-style panel) ----
  const options = game.hasSaveOnBoot ? ["NEW GAME", "CONTINUE", "MUTE"] : ["NEW GAME", "MUTE"];
  const mw = 100, mh = options.length * 11 + 10;
  const mx = SCREEN_W / 2 - mw / 2;
  const my = 128;
  // panel
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(mx + 2, my + 2, mw, mh);
  ctx.fillStyle = COLOR.winBorder;
  ctx.fillRect(mx, my, mw, mh);
  ctx.fillStyle = COLOR.winBorderLight;
  ctx.fillRect(mx, my, mw, 1);
  ctx.fillRect(mx, my, 1, mh);
  ctx.fillStyle = COLOR.winBg;
  ctx.fillRect(mx + 2, my + 2, mw - 4, mh - 4);
  ctx.fillStyle = COLOR.winBgDark;
  ctx.fillRect(mx + 2, my + mh - 4, mw - 4, 2);

  ctx.font = "7px monospace";
  options.forEach((opt, i) => {
    const y = my + 12 + i * 11;
    let label = opt;
    if (opt === "MUTE") label = settings.muted ? "SOUND: OFF" : "SOUND: ON";
    // cursor (blink)
    if (game.titleCursor === i) {
      ctx.fillStyle = COLOR.shirtRed;
      ctx.fillText(">", mx + 6, y);
    }
    ctx.fillStyle = COLOR.textDark;
    ctx.fillText(label, mx + 14, y);
  });

  // ---- Version tag ----
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "6px monospace";
  ctx.fillText("v5.0 HERO", SCREEN_W - 40, SCREEN_H - 6);

  // ---- HERO: controller indicator ----
  if (typeof isControllerConnected === "function" && isControllerConnected()) {
    ctx.fillStyle = "#48d858";
    ctx.font = "6px monospace";
    ctx.fillText("🎮 Connected", 4, SCREEN_H - 6);
  }

  // ---- HERO: ambient title particles (sparkles drifting) ----
  if (typeof drawParticles === "function") drawParticles(ctx);
  if (game.titleTime % 20 === 0 && typeof burstSparkles === "function") {
    burstSparkles(Math.random() * SCREEN_W, 20 + Math.random() * 80, 1, "#f8f8c0");
  }

  // ---- Press start hint (blink) ----
  if ((Math.floor(game.titleTime / 500) % 2) === 0 && game.titleCursor === 0 && !game.hasSaveOnBoot) {
    ctx.fillStyle = COLOR.winBorder;
    ctx.font = "6px monospace";
    ctx.textAlign = "center";
    ctx.fillText("Press Z to begin", SCREEN_W / 2, my + mh + 12);
    ctx.textAlign = "left";
  }

  // ---- HERO: Save slot selection overlay ----
  if (game.titleMode === "slots") {
    drawSaveSlotSelect(ctx);
  }
}

// ---- HERO: Draw the save slot selection screen ----
function drawSaveSlotSelect(ctx) {
  // Darken background
  ctx.fillStyle = "rgba(8,24,32,0.7)";
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  // Title
  ctx.textAlign = "center";
  ctx.fillStyle = COLOR.winBorder;
  ctx.font = "bold 9px monospace";
  ctx.fillText(game.slotAction === "newgame" ? "SELECT SLOT" : "LOAD GAME", SCREEN_W / 2, 18);
  ctx.textAlign = "left";

  // Slot list
  const mw = 180, mh = (NUM_SAVE_SLOTS + 1) * 28 + 10;
  const mx = SCREEN_W / 2 - mw / 2;
  const my = 28;

  // Panel background
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(mx + 2, my + 2, mw, mh);
  ctx.fillStyle = COLOR.winBorder;
  ctx.fillRect(mx, my, mw, mh);
  ctx.fillStyle = COLOR.winBg;
  ctx.fillRect(mx + 2, my + 2, mw - 4, mh - 4);

  // Each slot
  for (let i = 0; i < NUM_SAVE_SLOTS; i++) {
    const sy = my + 8 + i * 28;
    const hasData = slotHasSave(i);
    const meta = getSlotMeta(i);

    // Slot highlight
    if (game.slotCursor === i) {
      ctx.fillStyle = COLOR.winBorderLight;
      ctx.fillRect(mx + 4, sy, mw - 8, 24);
    }

    // Cursor arrow
    if (game.slotCursor === i) {
      ctx.fillStyle = COLOR.shirtRed;
      ctx.font = "bold 7px monospace";
      ctx.fillText(">", mx + 8, sy + 10);
    }

    // Slot label
    ctx.fillStyle = COLOR.textDark;
    ctx.font = "bold 7px monospace";
    ctx.fillText("SLOT " + (i + 1), mx + 18, sy + 10);

    if (hasData && meta) {
      ctx.font = "6px monospace";
      ctx.fillStyle = COLOR.textDark;
      ctx.fillText("Lead: " + meta.partyLead + " Lv" + meta.partyLeadLevel, mx + 18, sy + 18);
      ctx.fillText("Badges: " + meta.badges + "  Dex: " + meta.dexCaught, mx + 100, sy + 18);
      // Playtime
      const mins = Math.floor(meta.playtime / 60);
      const hrs = Math.floor(mins / 60);
      ctx.fillStyle = COLOR.textShadow;
      ctx.fillText("Time: " + hrs + "h " + (mins % 60) + "m", mx + 100, sy + 10);
    } else {
      ctx.font = "6px monospace";
      ctx.fillStyle = COLOR.textShadow;
      ctx.fillText("— Empty —", mx + 18, sy + 18);
    }
  }

  // Back option
  const backY = my + 8 + NUM_SAVE_SLOTS * 28;
  if (game.slotCursor === NUM_SAVE_SLOTS) {
    ctx.fillStyle = COLOR.winBorderLight;
    ctx.fillRect(mx + 4, backY, mw - 8, 20);
    ctx.fillStyle = COLOR.shirtRed;
    ctx.font = "bold 7px monospace";
    ctx.fillText(">", mx + 8, backY + 12);
  }
  ctx.fillStyle = COLOR.textDark;
  ctx.font = "bold 7px monospace";
  ctx.fillText("BACK", mx + 18, backY + 12);

  // Hint
  ctx.fillStyle = COLOR.textShadow;
  ctx.font = "6px monospace";
  ctx.textAlign = "center";
  ctx.fillText("Z to select  ·  X to go back", SCREEN_W / 2, my + mh + 10);
  ctx.textAlign = "left";
}

function render() {
  ctx.clearRect(0, 0, SCREEN_W, SCREEN_H);
  game.titleTime = Date.now();

  // advance world animation frame (for water/trees/grass/snow)
  if (typeof tickWorldAnim === "function") tickWorldAnim();

  // ---- Mega Expansion: update biome/state music ----
  if (typeof updateMusic === "function") updateMusic();

  // ---- Mega Expansion: tick world creatures, particles, screen shake ----
  if (game.state === GAME_STATE.OVERWORLD) {
    if (typeof tickWorldCreatures === "function") tickWorldCreatures();
    if (typeof tickEnvParticles === "function") tickEnvParticles();
    if (typeof tickScreenShake === "function") tickScreenShake();
    if (typeof tickAmbient === "function") tickAmbient();
  }
  // ---- HERO: tick particles & screen effects every frame ----
  if (typeof tickParticles === "function") tickParticles();
  if (typeof tickAllEffects === "function") tickAllEffects();
  // ---- HERO: poll gamepad every frame ----
  if (typeof dispatchGamepadInput === "function") dispatchGamepadInput();
  // Stealth minigame tick (runs in MENU state)
  if (game.state === GAME_STATE.MENU && typeof stealthMinigameTick === "function") {
    stealthMinigameTick();
  }
  // Evolution sequence tick (runs in BATTLE state)
  if (game.state === GAME_STATE.BATTLE && typeof tickEvolutionSequence === "function") {
    tickEvolutionSequence();
  }

  // advance transition fade
  if (world.transitioning) {
    world.transitionAlpha = Math.min(1, (world.transitionAlpha || 0) + 0.08);
  } else {
    world.transitionAlpha = 0;
  }

  if (game.state === GAME_STATE.TITLE) {
    drawTitleScreen();
  } else if (game.state === GAME_STATE.OVERWORLD) {
    drawOverworld();
  } else if (game.state === GAME_STATE.BATTLE) {
    drawBattle(ctx);
  } else if (game.state === GAME_STATE.MENU) {
    drawOverworld();
    drawMenu(ctx);
  }
  requestAnimationFrame(render);
}

// ---- Boot ----
preloadAllSprites();
render();
