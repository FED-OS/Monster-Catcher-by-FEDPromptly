// ============================================================
//  Monster Catcher — Particle Engine (v5.0 HERO)
//  A lightweight particle system for visual "juice": sparks,
//  embers, sparkles, hit stars, catch sparkles, level-up bursts,
//  ambient fireflies, smoke, and weather ambience.
//  All particles are drawn at native GBA resolution (240×160).
// ============================================================

// ---- Global particle pool ----
// Each particle: { x, y, vx, vy, life, maxLife, size, color, color2, type, gravity, drag, rot, rotSpeed }
const particles = [];
const MAX_PARTICLES = 220;

// Spawn a single particle object.
function spawnParticle(opts) {
  if (particles.length >= MAX_PARTICLES) particles.shift();
  particles.push({
    x: opts.x ?? 0,
    y: opts.y ?? 0,
    vx: opts.vx ?? 0,
    vy: opts.vy ?? 0,
    life: opts.life ?? 30,
    maxLife: opts.life ?? 30,
    size: opts.size ?? 1,
    color: opts.color ?? "#fff",
    color2: opts.color2 ?? opts.color,
    type: opts.type ?? "dot",
    gravity: opts.gravity ?? 0,
    drag: opts.drag ?? 1,
    rot: opts.rot ?? 0,
    rotSpeed: opts.rotSpeed ?? 0,
    fade: opts.fade ?? true,
    shrink: opts.shrink ?? false
  });
}

// ---- Burst helpers (spawn multiple particles at once) ----

// Spark burst — used for physical hit impacts, metal clinks.
function burstSparks(x, y, count, color) {
  color = color || "#f8d818";
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 0.5 + Math.random() * 1.5;
    spawnParticle({
      x, y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 0.3,
      life: 12 + Math.floor(Math.random() * 10),
      size: 1,
      color,
      color2: "#fff8c0",
      type: "spark",
      gravity: 0.06,
      drag: 0.92
    });
  }
}

// Ember burst — floating fire particles that rise and fade.
function burstEmbers(x, y, count, color) {
  color = color || "#f87838";
  for (let i = 0; i < count; i++) {
    spawnParticle({
      x: x + (Math.random() - 0.5) * 6,
      y,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -0.3 - Math.random() * 0.5,
      life: 20 + Math.floor(Math.random() * 20),
      size: 1,
      color,
      color2: "#f8d060",
      type: "ember",
      gravity: -0.01,
      drag: 0.97
    });
  }
}

// Sparkle burst — used for healing, level-up, catch success, magic.
function burstSparkles(x, y, count, color) {
  color = color || "#f8f878";
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 0.3 + Math.random() * 1.2;
    spawnParticle({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 8,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: 18 + Math.floor(Math.random() * 15),
      size: 1,
      color,
      color2: "#ffffff",
      type: "sparkle",
      drag: 0.9,
      rotSpeed: 0.1
    });
  }
}

// Hit stars — star-shaped impact burst for critical hits.
function burstHitStars(x, y, count, color) {
  color = color || "#f8f8f8";
  for (let i = 0; i < count; i++) {
    const a = (Math.PI * 2 * i) / count + Math.random() * 0.3;
    const sp = 1 + Math.random() * 1.5;
    spawnParticle({
      x, y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: 14 + Math.floor(Math.random() * 8),
      size: 2,
      color,
      color2: "#f8d838",
      type: "star",
      gravity: 0.04,
      drag: 0.9,
      rot: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.3
    });
  }
}

// Smoke puff — used for fainting, explosions, dust.
function burstSmoke(x, y, count, color) {
  color = color || "#a8a8a8";
  for (let i = 0; i < count; i++) {
    spawnParticle({
      x: x + (Math.random() - 0.5) * 4,
      y,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -0.2 - Math.random() * 0.3,
      life: 25 + Math.floor(Math.random() * 20),
      size: 2 + Math.floor(Math.random() * 2),
      color,
      color2: "#606060",
      type: "smoke",
      drag: 0.95,
      shrink: false
    });
  }
}

// Dust puff — used for walking on grass/sand, landing.
function burstDust(x, y, count, color) {
  color = color || "#d0c898";
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI - Math.PI;
    spawnParticle({
      x: x + (Math.random() - 0.5) * 3,
      y,
      vx: Math.cos(a) * (0.3 + Math.random() * 0.5),
      vy: -0.1 - Math.random() * 0.2,
      life: 12 + Math.floor(Math.random() * 8),
      size: 1,
      color,
      color2: "#a89868",
      type: "dust",
      drag: 0.9
    });
  }
}

// Water splash — used for surfing, fishing, water encounters.
function burstSplash(x, y, count, color) {
  color = color || "#68d0f8";
  for (let i = 0; i < count; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.7;
    const sp = 0.5 + Math.random() * 1.2;
    spawnParticle({
      x, y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: 15 + Math.floor(Math.random() * 10),
      size: 1,
      color,
      color2: "#b8ecff",
      type: "drop",
      gravity: 0.08,
      drag: 0.96
    });
  }
}

// Level-up burst — rising golden ring + sparkles.
function burstLevelUp(x, y) {
  // golden sparkles rising
  for (let i = 0; i < 12; i++) {
    spawnParticle({
      x: x + (Math.random() - 0.5) * 16,
      y: y + 8,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.4 - Math.random() * 0.4,
      life: 30 + Math.floor(Math.random() * 20),
      size: 1,
      color: "#f8d838",
      color2: "#ffffff",
      type: "sparkle",
      drag: 0.98,
      rotSpeed: 0.08
    });
  }
  // ring expand
  spawnParticle({
    x, y,
    vx: 0, vy: 0,
    life: 20,
    size: 2,
    color: "#f8d838",
    type: "ring",
    shrink: false
  });
}

// Catch success — swirling stars + flash.
function burstCatchSuccess(x, y) {
  for (let i = 0; i < 16; i++) {
    const a = (Math.PI * 2 * i) / 16;
    const sp = 0.8 + Math.random() * 0.6;
    spawnParticle({
      x, y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: 25 + Math.floor(Math.random() * 15),
      size: 1,
      color: "#f8f878",
      color2: "#ffffff",
      type: "star",
      drag: 0.92,
      rot: a,
      rotSpeed: 0.15
    });
  }
}

// Ambient fireflies — slow drifting glowing dots for night/forest.
function spawnFirefly() {
  spawnParticle({
    x: Math.random() * SCREEN_W,
    y: 40 + Math.random() * (SCREEN_H - 60),
    vx: (Math.random() - 0.5) * 0.15,
    vy: (Math.random() - 0.5) * 0.1,
    life: 60 + Math.floor(Math.random() * 60),
    size: 1,
    color: "#f8f8a0",
    color2: "#f8d838",
    type: "firefly",
    drag: 1
  });
}

// Ambient falling leaves — for forest/grass maps.
function spawnLeaf() {
  spawnParticle({
    x: Math.random() * SCREEN_W,
    y: -2,
    vx: -0.2 + Math.random() * 0.15,
    vy: 0.2 + Math.random() * 0.2,
    life: 120,
    size: 1,
    color: "#58c850",
    color2: "#38a838",
    type: "leaf",
    drag: 0.99,
    rot: Math.random() * Math.PI,
    rotSpeed: 0.03
  });
}

// ---- Ambient spawner state ----
let ambientTimer = 0;

function tickAmbient() {
  ambientTimer++;
  const weather = (typeof getMapWeather === "function") ? getMapWeather() : "none";
  const tod = (typeof currentTimeOfDay !== "undefined") ? currentTimeOfDay : "day";

  // Fireflies at night in grass/forest areas
  if (tod === "night" && ambientTimer % 25 === 0 && particles.length < MAX_PARTICLES - 20) {
    if (Math.random() < 0.4) spawnFirefly();
  }

  // Falling leaves in forest-like weather or wind
  if (ambientTimer % 40 === 0 && particles.length < MAX_PARTICLES - 20) {
    const map = (typeof currentMapData === "function") ? currentMapData() : null;
    const biome = map && map.biome ? map.biome : "forest";
    if ((biome === "forest" || biome === "grass") && Math.random() < 0.3) {
      spawnLeaf();
    }
  }
}

// ---- Update all particles ----
function tickParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.vx *= p.drag;
    p.vy *= p.drag;
    p.rot += p.rotSpeed;
    p.life--;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

// ---- Draw all particles ----
function drawParticles(ctx) {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const t = p.life / p.maxLife; // 1 → 0
    const alpha = p.fade ? t : 1;
    const sz = p.shrink ? Math.max(1, Math.round(p.size * t)) : p.size;

    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    switch (p.type) {
      case "dot":
      case "spark":
      case "dust":
      case "drop":
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), sz, sz);
        break;

      case "ember":
        // glow + bright core
        ctx.fillStyle = p.color2;
        ctx.globalAlpha = alpha * 0.4;
        ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, 3, 3);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
        break;

      case "sparkle":
        // 4-point sparkle cross
        ctx.fillStyle = p.color;
        const sx = Math.round(p.x), sy = Math.round(p.y);
        ctx.fillRect(sx, sy, 1, 1);
        ctx.globalAlpha = alpha * 0.6;
        ctx.fillRect(sx - 1, sy, 1, 1);
        ctx.fillRect(sx + 1, sy, 1, 1);
        ctx.fillRect(sx, sy - 1, 1, 1);
        ctx.fillRect(sx, sy + 1, 1, 1);
        break;

      case "star":
        drawStarParticle(ctx, p, alpha);
        break;

      case "smoke":
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillStyle = p.color;
        const sm = sz + Math.floor((1 - t) * 2);
        ctx.fillRect(Math.round(p.x) - Math.floor(sm / 2), Math.round(p.y) - Math.floor(sm / 2), sm, sm);
        break;

      case "firefly":
        // pulsing glow
        const pulse = 0.5 + 0.5 * Math.sin(p.life * 0.15);
        ctx.globalAlpha = alpha * pulse * 0.7;
        ctx.fillStyle = p.color2;
        ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, 3, 3);
        ctx.globalAlpha = alpha * pulse;
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
        break;

      case "leaf":
        ctx.save();
        ctx.translate(Math.round(p.x), Math.round(p.y));
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-1, 0, 2, 1);
        ctx.fillStyle = p.color2;
        ctx.fillRect(0, 0, 1, 1);
        ctx.restore();
        break;

      case "ring":
        // expanding ring
        const ringR = Math.round((1 - t) * 14);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = alpha * 0.8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, ringR), 0, Math.PI * 2);
        ctx.stroke();
        break;
    }
  }
  ctx.globalAlpha = 1;
}

// Draw a 5-point star particle using fillRect pixel approximation.
function drawStarParticle(ctx, p, alpha) {
  const cx = Math.round(p.x), cy = Math.round(p.y);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(p.rot);
  ctx.fillStyle = p.color;
  ctx.globalAlpha = alpha;
  // Simple pixel star: center + 4 cardinal points + diagonals
  ctx.fillRect(0, -2, 1, 5);   // vertical
  ctx.fillRect(-2, 0, 5, 1);   // horizontal
  ctx.fillStyle = p.color2;
  ctx.globalAlpha = alpha * 0.7;
  ctx.fillRect(-1, -1, 1, 1);  // diagonal accents
  ctx.fillRect(1, -1, 1, 1);
  ctx.fillRect(-1, 1, 1, 1);
  ctx.fillRect(1, 1, 1, 1);
  ctx.restore();
}

// Clear all particles (e.g. on state change).
function clearParticles() {
  particles.length = 0;
}
