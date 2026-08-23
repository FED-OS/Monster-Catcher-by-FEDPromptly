// ---- Sprite system ----
// Two ways to draw a monster:
// 1. Procedural (default): a distinct pixel shape per "shape" key, tinted by species color.
// 2. Real PNG: drop an image at assets/sprites/<speciesKey>.png and it will be used
//    automatically instead, once loaded. No other code changes needed.

const spriteImages = {}; // speciesKey -> Image (only populated if a PNG actually loads)

function tryLoadSprite(speciesKey) {
  const img = new Image();
  img.onload = () => { spriteImages[speciesKey] = img; };
  img.onerror = () => { /* no PNG provided for this species — procedural fallback is used */ };
  img.src = `assets/sprites/${speciesKey}.png`;
}

// Kick off loading for every known species once monsters.js has run
function preloadAllSprites() {
  Object.keys(SPECIES).forEach(tryLoadSprite);
}

// Draws a monster at (x, y) inside a size x size box.
// Uses the real PNG if it loaded, otherwise draws a procedural shape.
function drawMonsterSprite(ctx, monster, x, y, size) {
  const img = spriteImages[monster.speciesKey];
  if (img) {
    ctx.drawImage(img, x, y, size, size);
    return;
  }
  drawProceduralMonster(ctx, monster.shape || "round", monster.color, x, y, size);
}

// Each shape is a distinct silhouette so species read differently at a glance
// even before real art exists. All coordinates are relative to a size x size box.
function drawProceduralMonster(ctx, shape, color, x, y, size) {
  const s = size;
  ctx.fillStyle = color;

  if (shape === "round") {
    // blob body + rounded head bump
    ctx.beginPath();
    ctx.ellipse(x + s * 0.5, y + s * 0.6, s * 0.42, s * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + s * 0.5, y + s * 0.32, s * 0.26, s * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (shape === "quad") {
    // squat four-legged body
    ctx.fillRect(x + s * 0.18, y + s * 0.3, s * 0.64, s * 0.4);
    ctx.fillRect(x + s * 0.22, y + s * 0.62, s * 0.14, s * 0.22);
    ctx.fillRect(x + s * 0.64, y + s * 0.62, s * 0.14, s * 0.22);
    ctx.fillRect(x + s * 0.3, y + s * 0.12, s * 0.4, s * 0.24); // head
  } else if (shape === "spiky") {
    // body with jagged back spikes (used for evolved/aggressive forms)
    ctx.beginPath();
    ctx.ellipse(x + s * 0.5, y + s * 0.6, s * 0.4, s * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 3; i++) {
      const px = x + s * (0.3 + i * 0.2);
      ctx.beginPath();
      ctx.moveTo(px, y + s * 0.34);
      ctx.lineTo(px + s * 0.06, y + s * 0.14);
      ctx.lineTo(px + s * 0.12, y + s * 0.34);
      ctx.closePath();
      ctx.fill();
    }
  } else if (shape === "finned") {
    // streamlined body with a fin/wing shape on top
    ctx.beginPath();
    ctx.ellipse(x + s * 0.5, y + s * 0.58, s * 0.4, s * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + s * 0.5, y + s * 0.3);
    ctx.lineTo(x + s * 0.62, y + s * 0.05);
    ctx.lineTo(x + s * 0.58, y + s * 0.34);
    ctx.closePath();
    ctx.fill();
  } else {
    // fallback: plain rounded rect
    ctx.fillRect(x + s * 0.15, y + s * 0.15, s * 0.7, s * 0.7);
  }

  // simple eyes for personality, dark on any color
  ctx.fillStyle = PALETTE.black;
  ctx.fillRect(x + s * 0.35, y + s * 0.38, s * 0.08, s * 0.08);
  ctx.fillRect(x + s * 0.57, y + s * 0.38, s * 0.08, s * 0.08);
}
