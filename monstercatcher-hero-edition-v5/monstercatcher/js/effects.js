// ============================================================
//  Monster Catcher — Screen Effects (v5.0 HERO)
//  Screen flash, battle transition wipes, hit flash overlay,
//  and full-screen color pulses for "juicy" game feel.
// ============================================================

// ---- Screen flash ----
// Flashes a color across the full screen, fading out.
const flashEffect = {
  active: false,
  color: "#ffffff",
  alpha: 0,
  decay: 0.06
};

function screenFlash(color, intensity, decay) {
  flashEffect.active = true;
  flashEffect.color = color || "#ffffff";
  flashEffect.alpha = intensity ?? 0.5;
  flashEffect.decay = decay ?? 0.06;
}

function tickFlash() {
  if (flashEffect.active) {
    flashEffect.alpha -= flashEffect.decay;
    if (flashEffect.alpha <= 0) {
      flashEffect.alpha = 0;
      flashEffect.active = false;
    }
  }
}

function drawFlash(ctx) {
  if (flashEffect.active && flashEffect.alpha > 0) {
    ctx.globalAlpha = Math.max(0, flashEffect.alpha);
    ctx.fillStyle = flashEffect.color;
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    ctx.globalAlpha = 1;
  }
}

// ---- Battle transition wipe ----
// A classic GBA-style "zebra stripe" wipe that sweeps across the screen.
const battleWipe = {
  active: false,
  phase: 0,    // 0 = sweeping in, 1 = holding, 2 = sweeping out
  progress: 0, // 0 → 1
  speed: 0.06,
  onComplete: null
};

function startBattleWipe(callback) {
  battleWipe.active = true;
  battleWipe.phase = 0;
  battleWipe.progress = 0;
  battleWipe.speed = 0.08;
  battleWipe.onComplete = callback || null;
}

function tickBattleWipe() {
  if (!battleWipe.active) return;
  if (battleWipe.phase === 0) {
    battleWipe.progress += battleWipe.speed;
    if (battleWipe.progress >= 1) {
      battleWipe.progress = 1;
      battleWipe.phase = 1;
      // brief hold then start sweeping out
      if (battleWipe.onComplete) {
        battleWipe.onComplete();
        battleWipe.onComplete = null;
      }
      // auto-start phase 2 after a brief hold
      setTimeout(() => { if (battleWipe.active) battleWipe.phase = 2; }, 200);
    }
  } else if (battleWipe.phase === 2) {
    battleWipe.progress -= battleWipe.speed;
    if (battleWipe.progress <= 0) {
      battleWipe.progress = 0;
      battleWipe.active = false;
    }
  }
}

function drawBattleWipe(ctx) {
  if (!battleWipe.active) return;
  const p = battleWipe.progress;
  // GBA-style alternating black/white diagonal stripes sweeping from left
  const stripeW = 20;
  const offset = p * SCREEN_W * 2 - SCREEN_W;
  ctx.save();
  for (let i = -1; i < SCREEN_W / stripeW + 2; i++) {
    const sx = offset + i * stripeW;
    if (sx + stripeW < 0 || sx > SCREEN_W) continue;
    ctx.fillStyle = (i % 2 === 0) ? "#081820" : "#f8f8f8";
    // diagonal slant
    ctx.beginPath();
    ctx.moveTo(sx, 0);
    ctx.lineTo(sx + stripeW, 0);
    ctx.lineTo(sx + stripeW - 10, SCREEN_H);
    ctx.lineTo(sx - 10, SCREEN_H);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// ---- Hit flash (battle) ----
// Brief white/red flash on the target monster when hit.
const hitFlash = {
  active: false,
  timer: 0,
  duration: 6,
  color: "#ffffff"
};

function triggerHitFlash(color) {
  hitFlash.active = true;
  hitFlash.timer = hitFlash.duration;
  hitFlash.color = color || "#ffffff";
}

function tickHitFlash() {
  if (hitFlash.active) {
    hitFlash.timer--;
    if (hitFlash.timer <= 0) hitFlash.active = false;
  }
}

// Returns true if the target should be drawn white (flashing).
function isHitFlashing() {
  return hitFlash.active && (hitFlash.timer % 2 === 0);
}

// ---- Heal pulse ----
// Green sparkles pulse when healing at a center.
const healPulse = {
  active: false,
  timer: 0,
  duration: 40
};

function triggerHealPulse() {
  healPulse.active = true;
  healPulse.timer = healPulse.duration;
  // spawn healing sparkles around party
  for (let i = 0; i < 20; i++) {
    if (typeof burstSparkles === "function") {
      burstSparkles(
        30 + Math.random() * (SCREEN_W - 60),
        40 + Math.random() * (SCREEN_H - 80),
        2, "#48f878"
      );
    }
  }
}

function tickHealPulse() {
  if (healPulse.active) {
    healPulse.timer--;
    if (healPulse.timer % 8 === 0 && typeof burstSparkles === "function") {
      burstSparkles(
        30 + Math.random() * (SCREEN_W - 60),
        40 + Math.random() * (SCREEN_H - 80),
        3, "#48f878"
      );
    }
    if (healPulse.timer <= 0) healPulse.active = false;
  }
}

// ---- Combo / critical text popup ----
// Floating text that rises and fades (e.g. "CRITICAL!", "SUPER EFFECTIVE!").
const floatingTexts = [];

function spawnFloatingText(x, y, text, color) {
  floatingTexts.push({
    x, y,
    text,
    color: color || "#ffffff",
    life: 40,
    maxLife: 40,
    vy: -0.4
  });
}

function tickFloatingText() {
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y += ft.vy;
    ft.vy *= 0.96;
    ft.life--;
    if (ft.life <= 0) floatingTexts.splice(i, 1);
  }
}

function drawFloatingText(ctx) {
  for (let i = 0; i < floatingTexts.length; i++) {
    const ft = floatingTexts[i];
    const alpha = ft.life / ft.maxLife;
    ctx.globalAlpha = alpha;
    ctx.font = "bold 7px monospace";
    ctx.textAlign = "center";
    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
    // main
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.textAlign = "left";
  }
  ctx.globalAlpha = 1;
}

// ---- Master tick: call once per frame ----
function tickAllEffects() {
  tickFlash();
  tickBattleWipe();
  tickHitFlash();
  tickHealPulse();
  tickFloatingText();
  tickAreaPopup();
}

// ---- Master draw: draw all full-screen / overlay effects ----
function drawAllEffects(ctx) {
  drawFlash(ctx);
  drawBattleWipe(ctx);
  drawFloatingText(ctx);
  drawAreaPopup(ctx);
}

// ---- Area name popup (shown when entering a new map) ----
const areaPopup = {
  active: false,
  name: "",
  timer: 0,
  duration: 120,  // ~2 seconds at 60fps
  fadeIn: 15,
  fadeOut: 15
};

function showAreaPopup(name) {
  areaPopup.active = true;
  areaPopup.name = name || "";
  areaPopup.timer = areaPopup.duration;
}

function tickAreaPopup() {
  if (areaPopup.active) {
    areaPopup.timer--;
    if (areaPopup.timer <= 0) areaPopup.active = false;
  }
}

function drawAreaPopup(ctx) {
  if (!areaPopup.active) return;
  const t = areaPopup.timer;
  const dur = areaPopup.duration;
  let alpha = 1;
  if (t > dur - areaPopup.fadeIn) {
    alpha = (dur - t) / areaPopup.fadeIn;
  } else if (t < areaPopup.fadeOut) {
    alpha = t / areaPopup.fadeOut;
  }
  alpha = Math.max(0, Math.min(1, alpha));

  const pw = 120;
  const ph = 16;
  const px = SCREEN_W / 2 - pw / 2;
  const py = 8;

  ctx.globalAlpha = alpha;
  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(px + 2, py + 2, pw, ph);
  // panel
  ctx.fillStyle = COLOR.winBorder;
  ctx.fillRect(px, py, pw, ph);
  ctx.fillStyle = COLOR.winBorderLight;
  ctx.fillRect(px, py, pw, 1);
  ctx.fillRect(px, py, 1, ph);
  ctx.fillStyle = COLOR.winBg;
  ctx.fillRect(px + 2, py + 2, pw - 4, ph - 4);
  ctx.fillStyle = COLOR.winBgDark;
  ctx.fillRect(px + 2, py + ph - 4, pw - 4, 2);
  // text
  ctx.fillStyle = COLOR.textDark;
  ctx.font = "bold 7px monospace";
  ctx.textAlign = "center";
  ctx.fillText(areaPopup.name, SCREEN_W / 2, py + 11);
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;
}
