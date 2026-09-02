// ============================================================
//  Monster Catcher — World Creatures (Autonomous Overworld AI)
//  Creatures visible on the overworld map that wander, sleep,
//  sniff, and react to the player. Includes stealth-radius
//  mechanics, screen-shake "!!" alerts, Zzz particles, and
//  interactive environment effects (bending grass, ripples).
// ============================================================

// ---- World creature entity ----
// Each is a creature roaming the current map that the player can
// approach to trigger an encounter (or stealth past, or sneak up on).
let worldCreatures = [];  // active creatures on current map

// ---- Particle systems ----
let envParticles = [];     // grass bends, pollen, water ripples, snow, embers
let alertParticles = [];   // "!!" and "Zzz" floating text

// ---- Behaviour states ----
const WC_STATE = {
  WANDER:  "wander",
  SLEEP:   "sleep",
  ALERT:   "alert",
  FLEE:    "flee",
  STALK:   "stalk"
};

// ---- Spawn a set of world creatures for the current map ----
function spawnWorldCreatures() {
  worldCreatures = [];
  envParticles = [];
  alertParticles = [];

  const map = currentMapData();
  if (!map) return;
  // Guard: don't spawn roaming creatures if the player has no party (no battles possible)
  if (!player.party || player.party.length === 0) return;
  const biome = currentBiome();

  // Number of roaming creatures depends on biome encounter rate + map size
  let count = 3;
  if (biome) {
    count = Math.round(biome.encounterRate * 0.06) + 2;
  }
  count = Math.min(count, 6);

  // Get possible species for this map/biome
  let speciesPool = [];
  if (map.encounters && map.encounters.length) {
    speciesPool = speciesPool.concat(map.encounters);
  }
  if (biome) {
    const biomeList = biomeEncounterList(biome.id);
    if (biomeList && biomeList.length) {
      speciesPool = speciesPool.concat(biomeList);
    }
  }
  if (!speciesPool.length) return;

  // Find valid walkable tiles (non-blocked, non-water unless the creature is aquatic)
  const validTiles = [];
  const grid = map.grid;
  if (grid) {
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (!isBlocked(c, r) && !isLedge(c, r)) {
          // Don't spawn on the player's tile or right next to them
          if (Math.abs(c - player.col) + Math.abs(r - player.row) > 2) {
            validTiles.push({ c, r });
          }
        }
      }
    }
  }
  if (!validTiles.length) return;

  for (let i = 0; i < count && validTiles.length; i++) {
    const ti = Math.floor(Math.random() * validTiles.length);
    const pos = validTiles.splice(ti, 1)[0];
    const speciesKey = speciesPool[Math.floor(Math.random() * speciesPool.length)];
    const avgLvl = partyAverageLevel();
    const level = Math.max(2, avgLvl - 3 + Math.floor(Math.random() * 5));

    // Randomly assign behaviour: 40% wander, 30% sleep, 20% stalk, 10% alert-start
    const roll = Math.random();
    let state = WC_STATE.WANDER;
    if (roll < 0.30) state = WC_STATE.SLEEP;
    else if (roll < 0.50) state = WC_STATE.STALK;
    else if (roll < 0.60) state = WC_STATE.ALERT;

    worldCreatures.push({
      id: i,
      speciesKey,
      col: pos.c,
      row: pos.r,
      pixelX: pos.c * TILE,
      pixelY: pos.r * TILE,
      targetCol: pos.c,
      targetRow: pos.r,
      facing: "down",
      state: state,
      stateTimer: 0,
      moveTimer: Math.floor(Math.random() * 60),
      moveCooldown: 40 + Math.floor(Math.random() * 60),
      level: level,
      // stealth: how close the player can get before it notices
      stealthRadius: state === WC_STATE.SLEEP ? 1 : (state === WC_STATE.STALK ? 4 : 3),
      // animation
      animFrame: 0,
      animTimer: 0,
      // Zzz / alert particle tracking
      hasAlertParticle: false,
      hasZzzParticle: false,
      // hopping animation
      hopOffset: 0,
      hopTimer: 0,
      // sniff animation
      sniffTimer: 0,
      // flagged for encounter when player touches
      encountered: false
    });
  }
}

// ---- Tick: update all world creatures each frame ----
function tickWorldCreatures() {
  const map = currentMapData();
  if (!map) return;

  for (const wc of worldCreatures) {
    wc.stateTimer++;
    wc.animTimer++;
    if (wc.animTimer > 15) { wc.animFrame = (wc.animFrame + 1) % 4; wc.animTimer = 0; }

    // Distance to player
    const dist = Math.abs(wc.col - player.col) + Math.abs(wc.row - player.row);

    switch (wc.state) {
      case WC_STATE.WANDER:
        tickWander(wc, map);
        // Check if player is within detection radius
        if (dist <= wc.stealthRadius && dist > 0) {
          wc.state = WC_STATE.ALERT;
          wc.stateTimer = 0;
          spawnAlert(wc, "!!");
          // Screen shake
          if (typeof battle !== 'undefined' && !battle) {
            triggerScreenShake(4, 15);
          }
        }
        break;

      case WC_STATE.SLEEP:
        tickSleep(wc);
        // Sleeping creatures have tiny detection radius; only wake if player is adjacent
        if (dist <= 1) {
          wc.state = WC_STATE.ALERT;
          wc.stateTimer = 0;
          spawnAlert(wc, "!!");
          triggerScreenShake(3, 10);
        }
        break;

      case WC_STATE.STALK:
        tickStalk(wc, map, dist);
        // Stalkers notice at larger radius and chase
        if (dist <= wc.stealthRadius) {
          wc.state = WC_STATE.ALERT;
          wc.stateTimer = 0;
          spawnAlert(wc, "!!");
          triggerScreenShake(5, 18);
        }
        break;

      case WC_STATE.ALERT:
        tickAlert(wc, map, dist);
        break;

      case WC_STATE.FLEE:
        tickFlee(wc, map);
        break;
    }

    // Hop animation decay
    if (wc.hopOffset > 0) {
      wc.hopTimer++;
      wc.hopOffset = Math.max(0, wc.hopOffset - 0.5);
    }

    // Smooth pixel movement toward target tile
    const targetX = wc.col * TILE;
    const targetY = wc.row * TILE;
    if (wc.pixelX !== targetX || wc.pixelY !== targetY) {
      const dx = targetX - wc.pixelX;
      const dy = targetY - wc.pixelY;
      const speed = 0.8;
      if (Math.abs(dx) <= speed) wc.pixelX = targetX;
      else wc.pixelX += Math.sign(dx) * speed;
      if (Math.abs(dy) <= speed) wc.pixelY = targetY;
      else wc.pixelY += Math.sign(dy) * speed;
    }
  }

  // Update alert particles
  for (let i = alertParticles.length - 1; i >= 0; i--) {
    const p = alertParticles[i];
    p.life--;
    p.y -= 0.3;
    if (p.life <= 0) alertParticles.splice(i, 1);
  }

  // Update environment particles
  tickEnvParticles();
}

// ---- Wander behaviour: hop to adjacent tiles randomly ----
function tickWander(wc, map) {
  wc.moveTimer++;
  if (wc.moveTimer < wc.moveCooldown) return;
  wc.moveTimer = 0;
  wc.moveCooldown = 40 + Math.floor(Math.random() * 80);

  // Pick a random adjacent direction
  const dirs = [[0,-1,"up"],[0,1,"down"],[-1,0,"left"],[1,0,"right"]];
  const [dc, dr, face] = dirs[Math.floor(Math.random() * 4)];
  const nc = wc.col + dc;
  const nr = wc.row + dr;

  if (!isBlocked(nc, nr) && !isLedge(nc, nr) && nc >= 0 && nr >= 0 &&
      map.grid && nr < map.grid.length && nc < map.grid[nr].length) {
    // Don't walk onto player's tile
    if (nc !== player.col || nr !== player.row) {
      wc.col = nc;
      wc.row = nr;
      wc.facing = face;
      wc.hopOffset = 3;  // little hop
      // Occasional sniff
      if (Math.random() < 0.2) wc.sniffTimer = 20;
    }
  }

  // Random chance to fall asleep
  if (Math.random() < 0.01) {
    wc.state = WC_STATE.SLEEP;
    wc.stateTimer = 0;
  }
}

// ---- Sleep behaviour: stay put, emit Zzz, occasionally wake ----
function tickSleep(wc) {
  // Emit Zzz particle periodically
  if (wc.stateTimer % 50 === 0) {
    spawnAlert(wc, "Z");
  }
  // Small chance to wake and wander
  if (wc.stateTimer > 200 && Math.random() < 0.005) {
    wc.state = WC_STATE.WANDER;
    wc.stateTimer = 0;
  }
}

// ---- Stalk behaviour: slowly move toward player but keep distance ----
function tickStalk(wc, map, dist) {
  wc.moveTimer++;
  if (wc.moveTimer < 30) return;
  wc.moveTimer = 0;

  // Move toward player but stay 2 tiles away
  if (dist > 2) {
    let dc = 0, dr = 0;
    if (player.col > wc.col) dc = 1;
    else if (player.col < wc.col) dc = -1;
    if (player.row > wc.row) dr = 1;
    else if (player.row < wc.row) dr = -1;

    // Prefer moving in the axis with greater distance
    if (Math.abs(player.col - wc.col) > Math.abs(player.row - wc.row)) dr = 0;
    else dc = 0;

    const nc = wc.col + dc;
    const nr = wc.row + dr;
    if (!isBlocked(nc, nr) && !isLedge(nc, nr) && (nc !== player.col || nr !== player.row)) {
      wc.col = nc;
      wc.row = nr;
      wc.facing = dc > 0 ? "right" : dc < 0 ? "left" : dr > 0 ? "down" : "up";
    }
  }
}

// ---- Alert behaviour: chase the player! ----
function tickAlert(wc, map, dist) {
  wc.moveTimer++;
  if (wc.moveTimer < 20) return;
  wc.moveTimer = 0;

  // If player got away (distance > 5), give up and wander
  if (dist > 5) {
    wc.state = WC_STATE.WANDER;
    wc.stateTimer = 0;
    return;
  }

  // Chase: move toward player
  let dc = 0, dr = 0;
  if (player.col > wc.col) dc = 1;
  else if (player.col < wc.col) dc = -1;
  if (player.row > wc.row) dr = 1;
  else if (player.row < wc.row) dr = -1;

  // Move in the closer axis
  if (Math.abs(player.col - wc.col) >= Math.abs(player.row - wc.row)) dr = 0;
  else dc = 0;

  const nc = wc.col + dc;
  const nr = wc.row + dr;
  if (nc === player.col && nr === player.row) {
    // Caught the player! Trigger encounter
    triggerWorldCreatureEncounter(wc);
    return;
  }
  if (!isBlocked(nc, nr) && !isLedge(nc, nr)) {
    wc.col = nc;
    wc.row = nr;
    wc.facing = dc > 0 ? "right" : dc < 0 ? "left" : dr > 0 ? "down" : "up";
    wc.hopOffset = 2;
  }
}

// ---- Flee behaviour: run away from player ----
function tickFlee(wc, map) {
  wc.moveTimer++;
  if (wc.moveTimer < 15) return;
  wc.moveTimer = 0;

  let dc = 0, dr = 0;
  if (player.col > wc.col) dc = -1;
  else if (player.col < wc.col) dc = 1;
  if (player.row > wc.row) dr = -1;
  else if (player.row < wc.row) dr = 1;

  if (Math.abs(player.col - wc.col) >= Math.abs(player.row - wc.row)) dr = 0;
  else dc = 0;

  const nc = wc.col + dc;
  const nr = wc.row + dr;
  if (!isBlocked(nc, nr) && !isLedge(nc, nr) && nc >= 0 && nr >= 0 &&
      map.grid && nr < map.grid.length && nc < map.grid[nr].length) {
    wc.col = nc;
    wc.row = nr;
    wc.facing = dc > 0 ? "right" : dc < 0 ? "left" : dr > 0 ? "down" : "up";
    wc.hopOffset = 4;  // bigger hop when fleeing
  }

  // If far enough, calm down
  if (Math.abs(wc.col - player.col) + Math.abs(wc.row - player.row) > 6) {
    wc.state = WC_STATE.WANDER;
    wc.stateTimer = 0;
  }
}

// ---- Trigger encounter when a world creature catches the player ----
function triggerWorldCreatureEncounter(wc) {
  if (wc.encountered) return;
  // Guard: don't start a battle if the player has no usable party monsters
  if (!player.party || player.party.length === 0) {
    // Just scare the creature away — no broken battle
    wc.encountered = true;
    worldCreatures = worldCreatures.filter(c => c.id !== wc.id);
    return;
  }
  const usable = player.party.find(m => m.hp > 0);
  if (!usable) {
    // Party exists but all fainted — don't trigger
    wc.encountered = true;
    worldCreatures = worldCreatures.filter(c => c.id !== wc.id);
    return;
  }
  wc.encountered = true;
  // Remove this creature from the roaming list
  worldCreatures = worldCreatures.filter(c => c.id !== wc.id);
  // Start a battle with this specific creature
  const wild = createMonsterInstance(wc.speciesKey, wc.level);
  markSeen(wc.speciesKey);

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

// ---- Check if the player steps onto a world creature tile (walking into them) ----
function checkWorldCreatureCollision(col, row) {
  const c = (col !== undefined) ? col : player.col;
  const r = (row !== undefined) ? row : player.row;
  for (const wc of worldCreatures) {
    if (wc.col === c && wc.row === r && !wc.encountered) {
      triggerWorldCreatureEncounter(wc);
      return true;
    }
  }
  return false;
}

// ---- Spawn alert/Zzz particle above a creature ----
function spawnAlert(wc, text) {
  alertParticles.push({
    x: wc.pixelX + 4,
    y: wc.pixelY - 4,
    text: text,
    life: 40,
    color: text === "!!" ? "#f84038" : "#a8a8f8"
  });
}

// ---- Screen shake state ----
let screenShake = { intensity: 0, duration: 0, timer: 0 };

function triggerScreenShake(intensity, duration) {
  if (intensity > screenShake.intensity || screenShake.timer <= 0) {
    screenShake.intensity = intensity;
    screenShake.duration = duration;
    screenShake.timer = duration;
  }
}

function tickScreenShake() {
  if (screenShake.timer > 0) screenShake.timer--;
}

function screenShakeOffset() {
  if (screenShake.timer <= 0) return { x: 0, y: 0 };
  const t = screenShake.timer / screenShake.duration;
  const i = screenShake.intensity * t;
  return {
    x: (Math.random() - 0.5) * i * 2,
    y: (Math.random() - 0.5) * i * 2
  };
}

// ---- Environment particles (grass bending, pollen, ripples, snow, embers) ----
function spawnEnvParticles() {
  const biome = currentBiome();
  if (!biome) return;
  const weather = getWeatherEffect();
  const map = currentMapData();
  if (!map || !map.grid) return;

  // Spawn weather-appropriate particles
  let particleType = "pollen";
  let maxParticles = 8;
  if (biome.id === "volcano") { particleType = "ember"; maxParticles = 6; }
  else if (biome.id === "glacialpeaks") { particleType = "snow"; maxParticles = 12; }
  else if (biome.id === "moonmarsh") { particleType = "firefly"; maxParticles = 8; }
  else if (biome.id === "stormsavanna") { particleType = "rain"; maxParticles = 15; }
  else if (biome.id === "abyssal") { particleType = "bubble"; maxParticles = 6; }
  else if (biome.id === "crystalforest") { particleType = "sparkle"; maxParticles = 6; }
  else if (biome.id === "cybercity") { particleType = "data"; maxParticles = 5; }
  else if (biome.id === "junkwaste") { particleType = "dust"; maxParticles = 5; }

  if (envParticles.length >= maxParticles) return;

  // Random screen position for ambient particles
  envParticles.push({
    type: particleType,
    x: Math.random() * SCREEN_W,
    y: Math.random() * SCREEN_H,
    vx: (Math.random() - 0.5) * 0.5,
    vy: 0.2 + Math.random() * 0.6,
    life: 60 + Math.floor(Math.random() * 60),
    size: 1 + Math.floor(Math.random() * 2),
    color: particleColor(particleType, biome)
  });
}

function particleColor(type, biome) {
  switch (type) {
    case "ember": return ["#f86020","#f8a030","#f8d020"][Math.floor(Math.random()*3)];
    case "snow": return "#e0e8f8";
    case "firefly": return ["#80f8a0","#a0f8c0","#c0f8d0"][Math.floor(Math.random()*3)];
    case "rain": return "#6090d0";
    case "bubble": return "#80c0e0";
    case "sparkle": return ["#e0a0f8","#c080f0","#f0c0ff"][Math.floor(Math.random()*3)];
    case "data": return ["#40f8c0","#20d8a0","#60ffd0"][Math.floor(Math.random()*3)];
    case "dust": return "#a09070";
    default: return "#d0f8a0";  // pollen
  }
}

function tickEnvParticles() {
  const biome = currentBiome();
  // Spawn new particles
  if (biome && Math.random() < 0.3) spawnEnvParticles();

  for (let i = envParticles.length - 1; i >= 0; i--) {
    const p = envParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;

    // Type-specific behaviour
    if (p.type === "firefly") {
      p.vx += (Math.random() - 0.5) * 0.2;
      p.vy += (Math.random() - 0.5) * 0.2;
      p.vx = Math.max(-1, Math.min(1, p.vx));
      p.vy = Math.max(-1, Math.min(1, p.vy));
    } else if (p.type === "bubble") {
      p.vy = -Math.abs(p.vy);  // bubbles float up
    } else if (p.type === "ember") {
      p.vy = -Math.abs(p.vy) * 0.5;  // embers drift up
    }

    if (p.life <= 0 || p.y > SCREEN_H + 5 || p.y < -5 || p.x < -5 || p.x > SCREEN_W + 5) {
      envParticles.splice(i, 1);
    }
  }
}

// Grass bend: when player walks through tall grass, create a bend particle
function spawnGrassBend(col, row) {
  envParticles.push({
    type: "grassBend",
    x: col * TILE + 8,
    y: row * TILE + 12,
    vx: 0,
    vy: 0,
    life: 15,
    size: 2,
    color: "#5cb848"
  });
}

// Water ripple: when player is near/surfing on water
function spawnWaterRipple(col, row) {
  envParticles.push({
    type: "ripple",
    x: col * TILE + 8,
    y: row * TILE + 8,
    vx: 0, vy: 0,
    life: 20,
    size: 1,
    color: "#90c0e0"
  });
}

// ---- Drawing ----
function drawWorldCreatures(ctx) {
  for (const wc of worldCreatures) {
    const px = wc.pixelX;
    const py = wc.pixelY - wc.hopOffset;

    // Draw a small shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(px + 8, py + 14, 5 - wc.hopOffset * 0.3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw the creature sprite (mini overworld version)
    drawWorldCreatureSprite(ctx, wc, px, py);

    // Draw sniff animation (small puffs)
    if (wc.sniffTimer > 0) {
      wc.sniffTimer--;
      ctx.fillStyle = "rgba(200,200,200,0.5)";
      ctx.beginPath();
      ctx.arc(px + (wc.facing === "left" ? 2 : wc.facing === "right" ? 14 : 8), py + 4, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw alert particles
  for (const p of alertParticles) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, p.life / 20);
    ctx.fillStyle = p.color;
    ctx.font = "bold 8px monospace";
    ctx.textAlign = "center";
    ctx.fillText(p.text, p.x, p.y);
    ctx.restore();
  }

  // Draw environment particles
  drawEnvParticles(ctx);
}

// Draw a simplified mini-sprite for overworld creatures
function drawWorldCreatureSprite(ctx, wc, px, py) {
  // Use the species sprite if available, scaled down
  const sp = SPECIES[wc.speciesKey];
  let color = "#888";
  if (sp) color = sp.color;

  // If we have a cached sprite image, draw it small
  if (typeof spriteImages !== 'undefined' && spriteImages[wc.speciesKey]) {
    ctx.drawImage(spriteImages[wc.speciesKey], px, py, 16, 16);
    return;
  }

  // Fallback: draw a simple blob creature
  ctx.fillStyle = color;
  ctx.fillRect(px + 4, py + 4, 8, 8);
  // Darker outline
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(px + 3, py + 3, 1, 10);
  ctx.fillRect(px + 12, py + 3, 1, 10);
  ctx.fillRect(px + 3, py + 3, 10, 1);
  ctx.fillRect(px + 3, py + 12, 10, 1);
  // Eyes
  ctx.fillStyle = "#000";
  if (wc.state === WC_STATE.SLEEP) {
    // Closed eyes (lines)
    ctx.fillRect(px + 5, py + 7, 2, 1);
    ctx.fillRect(px + 9, py + 7, 2, 1);
  } else {
    ctx.fillRect(px + 5, py + 6, 2, 2);
    ctx.fillRect(px + 9, py + 6, 2, 2);
  }

  // Element glow if applicable
  const biome = currentBiome();
  if (biome) {
    ctx.save();
    ctx.globalAlpha = 0.15 + Math.sin(wc.animTimer * 0.1) * 0.05;
    ctx.fillStyle = biomeAccentColor(biome.id);
    ctx.fillRect(px + 2, py + 2, 12, 12);
    ctx.restore();
  }
}

// Draw environment particles
function drawEnvParticles(ctx) {
  for (const p of envParticles) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, p.life / 30);

    if (p.type === "ripple") {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1;
      const r = (20 - p.life) * 0.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.type === "grassBend") {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 1, p.y - p.life, 1, p.life);
    } else if (p.type === "snow") {
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 1, 1);
    } else if (p.type === "rain") {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - 1, p.y + 3);
      ctx.stroke();
    } else if (p.type === "firefly") {
      ctx.globalAlpha *= (0.5 + Math.sin(p.life * 0.3) * 0.5);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
    } else {
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
    }
    ctx.restore();
  }
}

// ---- Staring contest mechanic ----
// When the player faces a sleeping creature and presses confirm,
// initiate a staring contest (mini encounter choice)
function tryStaringContest() {
  const tile = tileInFrontOfPlayer();
  const tc = tile.col, tr = tile.row;
  for (const wc of worldCreatures) {
    if (wc.col === tc && wc.row === tr && wc.state === WC_STATE.SLEEP) {
      // Wake it up — it becomes alert
      wc.state = WC_STATE.ALERT;
      wc.stateTimer = 0;
      spawnAlert(wc, "!!");
      triggerScreenShake(4, 12);
      // Could trigger a special "staring contest" encounter or normal battle
      // For now, it just wakes up and chases
      return true;
    }
  }
  return false;
}

// ---- Init: called on map load ----
function initWorldCreatures() {
  spawnWorldCreatures();
}

// ---- Get a world creature at a tile (for interaction) ----
function worldCreatureAt(col, row) {
  return worldCreatures.find(wc => wc.col === col && wc.row === row);
}
