// ============================================================
//  Monster Catcher — Sprite System (GBA Edition v3.0)
//  Rich per-species pixel-art creatures drawn to an offscreen
//  32x32 buffer then blitted, plus optional real-PNG drop-in.
//  Also includes UI sprite helpers (balls, badges, status, tiles).
// ============================================================

const spriteImages = {}; // speciesKey -> Image (only populated if a PNG loads)
const spriteCache  = {}; // speciesKey -> offscreen canvas (procedural art)

function tryLoadSprite(speciesKey) {
  const img = new Image();
  img.onload  = () => { spriteImages[speciesKey] = img; };
  img.onerror = () => { /* no PNG provided — procedural fallback used */ };
  img.src = `assets/sprites/${speciesKey}.png`;
}

function preloadAllSprites() {
  if (typeof SPECIES === "undefined") return;
  Object.keys(SPECIES).forEach(tryLoadSprite);
}

// Draws a monster at (x, y) inside a size x size box.
function drawMonsterSprite(ctx, monster, x, y, size) {
  const key = monster && monster.speciesKey;
  const img = key && spriteImages[key];
  if (img) { ctx.drawImage(img, x, y, size, size); return; }

  // Procedural pixel-art path: build (or fetch cached) an offscreen
  // 32x32 canvas for this species, then blit it scaled to `size`.
  if (key) {
    let cv = spriteCache[key];
    if (!cv) {
      cv = buildSpeciesSprite(key);
      spriteCache[key] = cv;
    }
    ctx.drawImage(cv, x, y, size, size);
    return;
  }
  // total fallback — inline simple blob (drawProceduralMonster was removed in GBA rewrite)
  ctx.fillStyle = "#888888";
  ctx.beginPath(); ctx.arc(x + size/2, y + size/2, size*0.4, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#444444";
  ctx.fillRect(x + size*0.35, y + size*0.45, 2, 2);
  ctx.fillRect(x + size*0.65 - 2, y + size*0.45, 2, 2);
}

// ---------------------------------------------------------------
//  PIXEL ART BUILDER
//  Each species maps to a "design" function that paints onto a
//  32x32 offscreen canvas using a small palette derived from the
//  species color (base / shade / dark / light accents).
// ---------------------------------------------------------------
function SPRITE_SIZE() { return 64; }
function buildSpeciesSprite(speciesKey) {
  const sp = SPECIES[speciesKey] || (typeof BIOME_CREATURES !== "undefined" ? BIOME_CREATURES[speciesKey] : null) || { color: "#888888", shape: "round", type: "normal" };
  const pal = speciesPalette(sp.color, sp.type);
  const cv = document.createElement("canvas");
  cv.width = 64; cv.height = 64;
  const c = cv.getContext("2d");
  c.imageSmoothingEnabled = false;
  c._sz = 64;

  const design = SPECIES_DESIGNS64[speciesKey] || SPECIES_DESIGNS[speciesKey] || DEFAULT_DESIGNS64[sp.shape] || DEFAULT_DESIGNS64.round;
  design(c, pal, sp);

  return cv;
}

// Build a 4-6 color ramp from a base hex color (+ type tint accents).
function speciesPalette(baseHex, type) {
  const base = hexToRgb(baseHex);
  const shade = rgbToHex(clampRgb(base.r - 55, base.g - 55, base.b - 55));
  const dark  = rgbToHex(clampRgb(base.r - 95, base.g - 95, base.b - 95));
  const light = rgbToHex(clampRgb(base.r + 55, base.g + 55, base.b + 55));
  const hl    = rgbToHex(clampRgb(base.r + 95, base.g + 95, base.b + 95));
  // type-based belly/accent color
  const belly = typeBellyColor(type);
  // second super-highlight for glossy sheen
  const hl2 = rgbToHex(clampRgb(base.r + 120, base.g + 120, base.b + 120));
  const shade2 = rgbToHex(clampRgb(base.r - 30, base.g - 30, base.b - 30));
  const outline = "#181820";
  const outlineLight = "#404048";
  const eye = "#181820";
  const eyeShine = "#ffffff";
  return { base, shade, shade2, dark, light, hl, hl2, belly, outline, outlineLight, eye, eyeShine };
}

function typeBellyColor(type) {
  const t = Array.isArray(type) ? type[0] : type;
  switch (t) {
    case "fire":     return "#f8d088";
    case "water":    return "#c8e8f8";
    case "grass":    return "#e8f8c8";
    case "electric": return "#fff8c8";
    case "ground":   return "#e8d8a8";
    case "flying":   return "#e8f0ff";
    case "poison":   return "#e0c0e8";
    case "ice":      return "#e8f8ff";
    case "rock":     return "#d8c8a8";
    case "bug":      return "#e8e088";
    case "psychic":  return "#f8d8e8";
    case "ghost":    return "#c8c0e0";
    case "dark":     return "#584858";
    case "dragon":   return "#c8a8f8";
    case "steel":    return "#e0e8f0";
    case "fairy":    return "#fce0ec";
    case "fighting": return "#f0c8a8";
    default:         return "#f0e8d0"; // normal
  }
}

// ---- color helpers ----
function hexToRgb(h) {
  h = h.replace("#", "");
  if (h.length === 3) h = h.split("").map(x => x + x).join("");
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function clampByte(v) { return Math.max(0, Math.min(255, Math.round(v))); }
function clampRgb(r, g, b) { return { r: clampByte(r), g: clampByte(g), b: clampByte(b) }; }
function rgbToHex({ r, g, b }) {
  return "#" + [r, g, b].map(v => clampByte(v).toString(16).padStart(2, "0")).join("");
}

// --- 64x64 pixel painters (sprite resolution upgrade) ---
function px(c, x, y, color) {
  const sz = c._sz || 64;
  if (x < 0 || y < 0 || x >= sz || y >= sz) return;
  c.fillStyle = color;
  c.fillRect(x, y, 1, 1);
}
function pxr(c, x, y, w, h, color) {
  if (!w || !h || x + w <= 0 || y + h <= 0) return;
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
}
// Outline helper: draw a 1px outline around a filled region defined by a predicate
function outlineRegion(c, isFilled, color) {
  const sz = c._sz || 64;
  for (let y = 0; y < sz; y++) {
    for (let x = 0; x < sz; x++) {
      if (isFilled(x, y)) continue;
      const neighbor =
        (isFilled(x - 1, y) || isFilled(x + 1, y) ||
         isFilled(x, y - 1) || isFilled(x, y + 1));
      if (neighbor) px(c, x, y, color);
    }
  }
}
// Draw a filled ellipse-ish blob, optionally return the pixel set
function fillBlob(c, cx0, cy0, rx, ry, color, collect) {
  const sz = c._sz || 64;
  const set = collect ? [] : null;
  for (let y = -ry; y <= ry; y++) {
    for (let x = -rx; x <= rx; x++) {
      const v = (x * x) / (rx * rx) + (y * y) / (ry * ry);
      if (v <= 1.04) {
        const X = cx0 + x, Y = cy0 + y;
        if (X >= 0 && Y >= 0 && X < sz && Y < sz) {
          c.fillStyle = color;
          c.fillRect(X, Y, 1, 1);
          if (collect) set.push([X, Y]);
        }
      }
    }
  }
  return set;
}
// Two eyes at given centers (with optional iris color + bigger shine)
function eyes(c, lx, ly, rx, ry, pal, size, iris) {
  size = size || 4;
  // white sclera
  pxr(c, lx, ly, size, size, "#ffffff");
  pxr(c, rx, ry, size, size, "#ffffff");
  // dark pupil/outline ring
  pxr(c, lx, ly, size, 1, pal.eye);
  pxr(c, lx, ly, 1, size, pal.eye);
  pxr(c, lx + size - 1, ly, 1, size, pal.eye);
  pxr(c, lx, ly + size - 1, size, 1, pal.eye);
  // iris
  const ic = iris || pal.eye;
  pxr(c, lx + 1, ly + 1, size - 2, size - 2, ic);
  pxr(c, rx + 1, ry + 1, size - 2, size - 2, ic);
  // shine
  px(c, lx + 1, ly + 1, pal.eyeShine);
  px(c, rx + 1, ry + 1, pal.eyeShine);
  if (size >= 4) { px(c, lx + size - 2, ly + size - 2, "rgba(255,255,255,0.5)"); px(c, rx + size - 2, ry + size - 2, "rgba(255,255,255,0.5)"); }
}
// Soft ground shadow blob under a creature (for sprite-internal use)
function spriteShadow(c, cx, baseY, rx, ry) {
  c.fillStyle = "rgba(0,0,0,0.22)";
  fillBlob(c, cx, baseY, rx, ry, "rgba(0,0,0,0.22)");
  c.fillStyle = "rgba(0,0,0,0.12)";
  fillBlob(c, cx, baseY + 1, rx + 2, ry + 1, "rgba(0,0,0,0.12)");
}

// ===============================================================
//  HIGH-DETAIL 64x64 DESIGNS (v4 — "300% graphics upgrade")
//  Richer volume shading, highlights, outlines, expressions.
//  These take priority over the legacy 32x32 designs.
// ===============================================================

// Shared shading helper: paint a soft light-to-shade gradient over an
// elliptical body region (upper-left light, lower-right shade).
function shadeBody(c, cx, cy, rx, ry, pal) {
  // base already painted by caller; overlay shade on lower portion
  for (let y = -ry; y <= ry; y++) {
    for (let x = -rx; x <= rx; x++) {
      const v = (x * x) / (rx * rx) + (y * y) / (ry * ry);
      if (v > 1.04) continue;
      const X = cx + x, Y = cy + y;
      if (X < 0 || Y < 0 || X >= 64 || Y >= 64) continue;
      // shade band: bottom ~45%
      if (y > ry * 0.15) { c.fillStyle = pal.shade; c.fillRect(X, Y, 1, 1); }
      // deep shade: very bottom
      if (y > ry * 0.55) { c.fillStyle = pal.shade2; c.fillRect(X, Y, 1, 1); }
    }
  }
  // highlight crescent: upper-left
  for (let y = -ry; y <= 0; y++) {
    for (let x = -rx; x <= 0; x++) {
      const v = (x * x) / (rx * rx) + (y * y) / (ry * ry);
      if (v > 0.55 || v < 0.18) continue;
      const X = cx + x, Y = cy + y;
      if (X < 0 || Y < 0 || X >= 64 || Y >= 64) continue;
      c.fillStyle = pal.light; c.fillRect(X, Y, 1, 1);
      if (v < 0.3) { c.fillStyle = pal.hl; c.fillRect(X, Y, 1, 1); }
    }
  }
}

// Ground shadow for grid-based sprite designs.
function gridShadow(c, cx, baseY, rx, ry) {
  c.fillStyle = "rgba(0,0,0,0.22)";
  fillBlob(c, cx, baseY, rx, ry, "rgba(0,0,0,0.22)");
  c.fillStyle = "rgba(0,0,0,0.10)";
  fillBlob(c, cx, baseY + 1, rx + 2, ry, "rgba(0,0,0,0.10)");
}

const DEFAULT_DESIGNS64 = {
  // ROUND: cute round creature (Pikachu-style) with ears, cheeks, zigzag tail
  round(c, pal, sp) {
    gridShadow(c, 32, 58, 18, 4);
    // ears (tall, pointed, dark tips)
    pxr(c, 19, 6, 5, 3, pal.outline); pxr(c, 20, 4, 4, 3, pal.outline);
    pxr(c, 20, 8, 4, 8, pal.base); pxr(c, 20, 8, 4, 2, pal.dark);
    pxr(c, 21, 9, 2, 6, pal.light);
    pxr(c, 40, 6, 5, 3, pal.outline); pxr(c, 40, 4, 4, 3, pal.outline);
    pxr(c, 40, 8, 4, 8, pal.base); pxr(c, 40, 8, 4, 2, pal.dark);
    pxr(c, 41, 9, 2, 6, pal.light);
    // body outline (round)
    fillBlob(c, 32, 38, 19, 16, pal.outline);
    fillBlob(c, 32, 38, 17, 14, pal.base);
    // shading: bottom band
    fillBlob(c, 32, 42, 17, 10, pal.shade);
    fillBlob(c, 32, 48, 15, 6, pal.dark);
    // rim light (upper-left)
    for (let i = 0; i < 12; i++) {
      px(c, 16 + i, 30 + Math.floor(i * 0.3), pal.light);
      if (i < 8) px(c, 16 + i, 31 + Math.floor(i * 0.3), pal.hl);
    }
    // top highlight
    fillBlob(c, 28, 28, 6, 3, pal.hl);
    fillBlob(c, 30, 27, 3, 2, pal.hl2);
    // belly patch (cream)
    fillBlob(c, 32, 46, 10, 6, pal.belly);
    fillBlob(c, 32, 49, 8, 3, pal.shade);
    // feet
    pxr(c, 21, 53, 7, 5, pal.outline); pxr(c, 22, 53, 5, 4, pal.shade);
    pxr(c, 36, 53, 7, 5, pal.outline); pxr(c, 37, 53, 5, 4, pal.shade);
    pxr(c, 22, 56, 5, 2, pal.dark); pxr(c, 37, 56, 5, 2, pal.dark);
    // toes
    pxr(c, 23, 57, 1, 1, pal.outline); pxr(c, 26, 57, 1, 1, pal.outline);
    pxr(c, 38, 57, 1, 1, pal.outline); pxr(c, 41, 57, 1, 1, pal.outline);
    // arms
    pxr(c, 14, 40, 4, 7, pal.outline); pxr(c, 15, 40, 3, 6, pal.shade);
    pxr(c, 46, 40, 4, 7, pal.outline); pxr(c, 46, 40, 3, 6, pal.shade);
    // eyes
    eyes(c, 25, 34, 39, 34, pal, 5, "#584830");
    // brows
    pxr(c, 24, 32, 6, 1, pal.outline); pxr(c, 38, 32, 6, 1, pal.outline);
    // cheeks (blush)
    fillBlob(c, 19, 40, 3, 2, "rgba(248,120,120,0.6)");
    fillBlob(c, 45, 40, 3, 2, "rgba(248,120,120,0.6)");
    // smile
    px(c, 29, 42, pal.outline); pxr(c, 30, 43, 4, 1, pal.outline); px(c, 34, 42, pal.outline);
    // zigzag tail (lightning)
    pxr(c, 51, 44, 5, 3, pal.outline); pxr(c, 52, 44, 4, 2, pal.base);
    pxr(c, 54, 41, 5, 3, pal.outline); pxr(c, 55, 41, 4, 2, pal.light);
    pxr(c, 57, 38, 5, 3, pal.outline); pxr(c, 58, 38, 4, 2, pal.base);
    pxr(c, 55, 41, 2, 1, pal.hl);
    // nose
    px(c, 31, 40, pal.dark); px(c, 33, 40, pal.dark);
  },

  // QUAD: four-legged creature (fox/dog style) facing right
  quad(c, pal, sp) {
    gridShadow(c, 34, 58, 20, 4);
    // tail (curled up, left side)
    pxr(c, 6, 30, 7, 5, pal.outline); pxr(c, 7, 30, 6, 4, pal.base);
    pxr(c, 7, 30, 6, 2, pal.light); pxr(c, 7, 33, 6, 1, pal.shade);
    pxr(c, 4, 27, 5, 4, pal.outline); pxr(c, 5, 27, 4, 3, pal.base);
    pxr(c, 5, 27, 4, 1, pal.hl); pxr(c, 5, 29, 4, 1, pal.light);
    // body outline
    fillBlob(c, 33, 42, 18, 11, pal.outline);
    fillBlob(c, 33, 42, 16, 9, pal.base);
    fillBlob(c, 33, 45, 16, 6, pal.shade);
    fillBlob(c, 33, 48, 14, 3, pal.dark);
    // rim light
    for (let i = 0; i < 14; i++) px(c, 17 + i, 38, pal.light);
    for (let i = 0; i < 10; i++) px(c, 19 + i, 37, pal.hl);
    // belly
    fillBlob(c, 33, 47, 14, 4, pal.belly);
    // head (front-right)
    fillBlob(c, 47, 30, 11, 10, pal.outline);
    fillBlob(c, 47, 30, 9, 8, pal.base);
    fillBlob(c, 47, 33, 9, 5, pal.shade);
    // head highlight
    fillBlob(c, 44, 28, 5, 3, pal.light); px(c, 45, 27, pal.hl);
    // snout
    pxr(c, 55, 34, 7, 5, pal.outline); pxr(c, 56, 34, 6, 4, pal.base);
    pxr(c, 56, 37, 6, 1, pal.shade);
    // nose
    pxr(c, 60, 35, 3, 2, pal.outline); px(c, 61, 35, pal.dark);
    // ears (pointed, upright)
    pxr(c, 43, 18, 4, 6, pal.outline); pxr(c, 44, 18, 3, 5, pal.base);
    pxr(c, 44, 18, 3, 2, pal.dark); pxr(c, 44, 20, 2, 3, pal.light);
    pxr(c, 52, 18, 4, 6, pal.outline); pxr(c, 53, 18, 3, 5, pal.base);
    pxr(c, 53, 18, 3, 2, pal.dark); pxr(c, 53, 20, 2, 3, pal.light);
    // legs (4)
    pxr(c, 20, 50, 6, 8, pal.outline); pxr(c, 21, 50, 4, 7, pal.shade);
    pxr(c, 29, 50, 6, 8, pal.outline); pxr(c, 30, 50, 4, 7, pal.shade);
    pxr(c, 39, 50, 6, 8, pal.outline); pxr(c, 40, 50, 4, 7, pal.shade);
    pxr(c, 48, 50, 6, 8, pal.outline); pxr(c, 49, 50, 4, 7, pal.shade);
    pxr(c, 21, 56, 4, 2, pal.dark); pxr(c, 30, 56, 4, 2, pal.dark);
    pxr(c, 40, 56, 4, 2, pal.dark); pxr(c, 49, 56, 4, 2, pal.dark);
    // eye
    pxr(c, 47, 30, 5, 5, "#ffffff"); pxr(c, 48, 31, 4, 4, pal.eye);
    px(c, 49, 31, pal.eyeShine); pxr(c, 46, 29, 6, 1, pal.outline);
    pxr(c, 46, 35, 6, 1, pal.outline); pxr(c, 46, 29, 1, 7, pal.outline); pxr(c, 52, 29, 1, 7, pal.outline);
    pxr(c, 45, 28, 6, 1, pal.outline); // brow
  },

  // SPIKY: bipedal creature with back spikes + flame tail
  spiky(c, pal, sp) {
    gridShadow(c, 32, 58, 17, 4);
    const isFire = Array.isArray(sp.type) ? sp.type.includes("fire") : sp.type === "fire";
    // back spikes (triangular, 3 big)
    function spike(x, h, col1, col2) {
      for (let i = 0; i < h; i++) {
        const w = (h - i) + 1;
        const sx = x - Math.floor(w / 2);
        pxr(c, sx, 18 + h - i - 1, w, 1, i < 2 ? pal.dark : col1);
        if (i < h - 1) px(c, sx + 1, 18 + h - i - 1, col2);
      }
      pxr(c, x - 1, 18, 3, 1, pal.outline);
    }
    spike(22, 10, pal.light, pal.hl); spike(32, 13, pal.base, pal.light); spike(42, 10, pal.light, pal.hl);
    // body outline
    fillBlob(c, 32, 40, 17, 14, pal.outline);
    fillBlob(c, 32, 40, 15, 12, pal.base);
    fillBlob(c, 32, 43, 15, 9, pal.shade);
    fillBlob(c, 32, 48, 13, 4, pal.dark);
    // rim light upper-left
    for (let i = 0; i < 12; i++) { px(c, 17 + i, 33, pal.light); if (i < 8) px(c, 17 + i, 32, pal.hl); }
    // head
    fillBlob(c, 32, 28, 13, 10, pal.outline);
    fillBlob(c, 32, 28, 11, 8, pal.base);
    fillBlob(c, 32, 30, 11, 6, pal.shade);
    fillBlob(c, 28, 26, 5, 3, pal.light); px(c, 29, 25, pal.hl);
    // belly
    fillBlob(c, 32, 46, 9, 5, pal.belly);
    // arms
    pxr(c, 14, 38, 5, 9, pal.outline); pxr(c, 15, 38, 3, 8, pal.shade);
    pxr(c, 45, 38, 5, 9, pal.outline); pxr(c, 46, 38, 3, 8, pal.shade);
    pxr(c, 15, 45, 1, 2, pal.outline); pxr(c, 18, 45, 1, 2, pal.outline);
    pxr(c, 46, 45, 1, 2, pal.outline); pxr(c, 49, 45, 1, 2, pal.outline);
    // legs
    pxr(c, 22, 50, 7, 8, pal.outline); pxr(c, 23, 50, 5, 7, pal.shade);
    pxr(c, 34, 50, 7, 8, pal.outline); pxr(c, 35, 50, 5, 7, pal.shade);
    pxr(c, 23, 56, 5, 2, pal.dark); pxr(c, 35, 56, 5, 2, pal.dark);
    pxr(c, 24, 57, 1, 1, pal.outline); pxr(c, 27, 57, 1, 1, pal.outline);
    pxr(c, 36, 57, 1, 1, pal.outline); pxr(c, 39, 57, 1, 1, pal.outline);
    // eyes
    eyes(c, 27, 28, 36, 28, pal, 4, "#f8b820");
    pxr(c, 25, 26, 6, 1, pal.outline); pxr(c, 36, 26, 6, 1, pal.outline);
    // snout + mouth
    pxr(c, 38, 33, 5, 2, pal.outline);
    px(c, 40, 35, "#ffffff"); px(c, 42, 35, "#ffffff"); // fangs
    // horns
    pxr(c, 26, 18, 3, 6, pal.outline); pxr(c, 27, 18, 2, 5, pal.dark); px(c, 27, 19, pal.shade2);
    pxr(c, 37, 18, 3, 6, pal.outline); pxr(c, 38, 18, 2, 5, pal.dark); px(c, 38, 19, pal.shade2);
    // tail
    if (isFire) {
      pxr(c, 7, 36, 8, 5, pal.outline); pxr(c, 8, 36, 7, 4, pal.base);
      pxr(c, 3, 32, 6, 5, pal.light); pxr(c, 1, 28, 4, 5, pal.hl); px(c, 1, 24, pal.hl2);
      pxr(c, 8, 40, 7, 1, pal.dark);
    } else {
      pxr(c, 8, 36, 8, 4, pal.outline); pxr(c, 9, 36, 7, 3, pal.shade);
      pxr(c, 5, 34, 5, 3, pal.light);
    }
  },

  // FINNED: fish/aquatic with dorsal fin, tail fin, side fins
  finned(c, pal, sp) {
    gridShadow(c, 32, 58, 19, 4);
    // body (horizontal ellipse, fish-like)
    fillBlob(c, 30, 38, 21, 12, pal.outline);
    fillBlob(c, 30, 38, 19, 10, pal.base);
    fillBlob(c, 30, 41, 19, 7, pal.shade);
    fillBlob(c, 30, 45, 17, 3, pal.dark);
    // rim light along top
    for (let i = 0; i < 18; i++) { px(c, 13 + i, 31, pal.light); if (i < 12) px(c, 15 + i, 30, pal.hl); }
    px(c, 17, 29, pal.hl2);
    // belly (light underside)
    fillBlob(c, 30, 44, 16, 4, pal.belly);
    // dorsal fin (big, on top)
    pxr(c, 22, 16, 16, 4, pal.outline); pxr(c, 23, 16, 15, 3, pal.base);
    pxr(c, 25, 12, 12, 4, pal.outline); pxr(c, 26, 12, 11, 3, pal.light);
    pxr(c, 28, 9, 8, 3, pal.outline); pxr(c, 29, 9, 7, 2, pal.hl);
    px(c, 30, 7, pal.hl2);
    pxr(c, 22, 20, 16, 1, pal.dark);
    // tail fin (right side, forked)
    pxr(c, 49, 28, 4, 4, pal.outline); pxr(c, 50, 28, 3, 3, pal.base);
    pxr(c, 53, 24, 5, 6, pal.outline); pxr(c, 54, 24, 4, 5, pal.light);
    pxr(c, 53, 42, 5, 6, pal.outline); pxr(c, 54, 42, 4, 5, pal.light);
    pxr(c, 56, 28, 3, 16, pal.outline); pxr(c, 56, 30, 2, 12, pal.shade);
    // side fin (pectoral)
    pxr(c, 22, 40, 8, 5, pal.outline); pxr(c, 23, 40, 7, 4, pal.shade);
    pxr(c, 24, 41, 6, 2, pal.light);
    pxr(c, 22, 44, 8, 1, pal.dark);
    // scales (shimmer)
    const sc = [pal.hl, pal.hl2, pal.light];
    [[26,34],[32,33],[38,35],[28,37],[34,36],[40,34],[24,36]].forEach((p,i)=>{
      px(c, p[0], p[1], sc[i % 3]);
    });
    // gill
    pxr(c, 22, 37, 1, 5, pal.dark); px(c, 23, 38, pal.shade2);
    // eye (big, left side)
    pxr(c, 15, 34, 7, 7, "#ffffff"); pxr(c, 16, 35, 6, 6, pal.eye);
    pxr(c, 17, 35, 4, 4, "#083858"); px(c, 18, 36, pal.eyeShine);
    pxr(c, 14, 33, 8, 1, pal.outline); pxr(c, 14, 41, 8, 1, pal.outline);
    pxr(c, 14, 33, 1, 8, pal.outline); pxr(c, 22, 33, 1, 8, pal.outline);
    // mouth
    pxr(c, 12, 42, 6, 2, pal.outline); pxr(c, 13, 42, 4, 1, pal.dark);
  },

  // WINGED: bird with spread wings, crest, beak
  winged(c, pal, sp) {
    gridShadow(c, 32, 58, 21, 4);
    // left wing (spread, 3 feather rows)
    pxr(c, 4, 30, 20, 5, pal.outline); pxr(c, 5, 30, 19, 4, pal.base);
    pxr(c, 5, 30, 19, 2, pal.light);
    pxr(c, 2, 26, 16, 4, pal.outline); pxr(c, 3, 26, 15, 3, pal.base);
    pxr(c, 3, 26, 15, 1, pal.hl);
    pxr(c, 6, 34, 18, 4, pal.outline); pxr(c, 7, 34, 17, 3, pal.shade);
    // feather divisions (left)
    pxr(c, 7, 30, 1, 8, pal.dark); pxr(c, 13, 30, 1, 8, pal.dark); pxr(c, 19, 30, 1, 8, pal.dark);
    // right wing
    pxr(c, 40, 30, 20, 5, pal.outline); pxr(c, 41, 30, 19, 4, pal.base);
    pxr(c, 41, 30, 19, 2, pal.light);
    pxr(c, 46, 26, 16, 4, pal.outline); pxr(c, 47, 26, 15, 3, pal.base);
    pxr(c, 47, 26, 15, 1, pal.hl);
    pxr(c, 40, 34, 18, 4, pal.outline); pxr(c, 41, 34, 17, 3, pal.shade);
    pxr(c, 44, 30, 1, 8, pal.dark); pxr(c, 50, 30, 1, 8, pal.dark); pxr(c, 56, 30, 1, 8, pal.dark);
    // body (compact, round)
    fillBlob(c, 32, 40, 12, 13, pal.outline);
    fillBlob(c, 32, 40, 10, 11, pal.base);
    fillBlob(c, 32, 43, 10, 8, pal.shade);
    fillBlob(c, 32, 48, 8, 3, pal.dark);
    // rim light
    for (let i = 0; i < 10; i++) { px(c, 23 + i, 32, pal.light); if (i < 6) px(c, 24 + i, 31, pal.hl); }
    // belly
    fillBlob(c, 32, 45, 7, 5, pal.belly);
    // head crest (3 feathers up)
    pxr(c, 29, 18, 3, 6, pal.outline); pxr(c, 30, 18, 2, 5, pal.base); px(c, 30, 19, pal.hl);
    pxr(c, 32, 16, 3, 7, pal.outline); pxr(c, 33, 16, 2, 6, pal.light); px(c, 33, 17, pal.hl2);
    pxr(c, 35, 18, 3, 6, pal.outline); pxr(c, 36, 18, 2, 5, pal.base); px(c, 36, 19, pal.hl);
    // beak
    pxr(c, 29, 36, 8, 4, "#f8c848"); pxr(c, 29, 39, 8, 1, "#c89828");
    pxr(c, 28, 36, 1, 4, pal.outline); pxr(c, 37, 36, 1, 4, pal.outline);
    pxr(c, 29, 35, 8, 1, pal.outline);
    // eyes
    pxr(c, 27, 32, 5, 5, "#ffffff"); pxr(c, 28, 33, 4, 4, pal.eye);
    px(c, 29, 33, pal.eyeShine);
    pxr(c, 26, 31, 6, 1, pal.outline); pxr(c, 26, 37, 6, 1, pal.outline);
    pxr(c, 26, 31, 1, 7, pal.outline); pxr(c, 32, 31, 1, 7, pal.outline);
    // feet
    pxr(c, 27, 52, 3, 6, pal.outline); pxr(c, 28, 52, 2, 5, "#f8c848");
    pxr(c, 34, 52, 3, 6, pal.outline); pxr(c, 35, 52, 2, 5, "#f8c848");
    pxr(c, 26, 57, 5, 1, pal.outline); pxr(c, 33, 57, 5, 1, pal.outline);
    pxr(c, 26, 57, 1, 1, pal.outline); pxr(c, 30, 57, 1, 1, pal.outline);
    pxr(c, 33, 57, 1, 1, pal.outline); pxr(c, 37, 57, 1, 1, pal.outline);
  }
};

// ===============================================================
//  HIGH-DETAIL SPECIES DESIGNS (64x64) — starter lines + key mons
// ===============================================================
const SPECIES_DESIGNS64 = {

  // ---- FIRE LINE ----
  // Emberit: small fire lizard, big eyes, flame tail-tip
  emberit(c, pal) {
    gridShadow(c, 32, 57, 14, 4);
    // tail with flame (right side, curled up)
    pxr(c, 46, 38, 6, 4, pal.outline); pxr(c, 47, 38, 5, 3, pal.base);
    pxr(c, 52, 32, 5, 6, pal.outline); pxr(c, 53, 32, 4, 5, pal.light);
    pxr(c, 54, 26, 4, 6, pal.outline); pxr(c, 55, 26, 3, 5, pal.hl);
    pxr(c, 56, 20, 3, 6, pal.outline); pxr(c, 57, 20, 2, 5, pal.hl2);
    px(c, 57, 18, pal.hl2);
    // body
    fillBlob(c, 31, 40, 15, 13, pal.outline);
    fillBlob(c, 31, 40, 13, 11, pal.base);
    fillBlob(c, 31, 43, 13, 8, pal.shade);
    fillBlob(c, 31, 48, 11, 3, pal.dark);
    // rim light
    for (let i = 0; i < 11; i++) { px(c, 17 + i, 34, pal.light); if (i < 7) px(c, 17 + i, 33, pal.hl); }
    // head
    fillBlob(c, 31, 27, 12, 10, pal.outline);
    fillBlob(c, 31, 27, 10, 8, pal.base);
    fillBlob(c, 31, 29, 10, 6, pal.shade);
    fillBlob(c, 27, 25, 5, 3, pal.light); px(c, 28, 24, pal.hl);
    // belly (cream)
    fillBlob(c, 31, 46, 8, 5, pal.belly); pxr(c, 31, 49, 6, 2, pal.shade);
    // legs
    pxr(c, 22, 50, 6, 7, pal.outline); pxr(c, 23, 50, 4, 6, pal.shade);
    pxr(c, 34, 50, 6, 7, pal.outline); pxr(c, 35, 50, 4, 6, pal.shade);
    pxr(c, 23, 55, 4, 2, pal.dark); pxr(c, 35, 55, 4, 2, pal.dark);
    pxr(c, 24, 56, 1, 1, pal.outline); pxr(c, 27, 56, 1, 1, pal.outline);
    pxr(c, 36, 56, 1, 1, pal.outline); pxr(c, 39, 56, 1, 1, pal.outline);
    // arms
    pxr(c, 17, 39, 4, 7, pal.outline); pxr(c, 18, 39, 3, 6, pal.shade);
    pxr(c, 41, 39, 4, 7, pal.outline); pxr(c, 42, 39, 3, 6, pal.shade);
    pxr(c, 18, 45, 1, 1, pal.outline); pxr(c, 20, 45, 1, 1, pal.outline);
    pxr(c, 42, 45, 1, 1, pal.outline); pxr(c, 44, 45, 1, 1, pal.outline);
    // eyes (big, cute)
    eyes(c, 25, 27, 37, 27, pal, 5, "#f8b820");
    pxr(c, 23, 25, 6, 1, pal.outline); pxr(c, 36, 25, 6, 1, pal.outline);
    // snout + nostrils
    pxr(c, 38, 33, 4, 2, pal.outline); px(c, 39, 33, pal.dark); px(c, 41, 33, pal.dark);
    // smile
    px(c, 28, 35, pal.outline); pxr(c, 29, 36, 4, 1, pal.outline); px(c, 33, 35, pal.outline);
    // tiny horns/ears
    pxr(c, 25, 17, 3, 5, pal.outline); pxr(c, 26, 17, 2, 4, pal.dark); px(c, 26, 18, pal.shade2);
    pxr(c, 36, 17, 3, 5, pal.outline); pxr(c, 37, 17, 2, 4, pal.dark); px(c, 37, 18, pal.shade2);
    // cheeks (warm blush)
    fillBlob(c, 19, 34, 3, 2, "rgba(248,140,80,0.5)");
    fillBlob(c, 42, 34, 3, 2, "rgba(248,140,80,0.5)");
  },

  // Infernyx: bigger fiery lizard, flame mane, fierce expression
  infernyx(c, pal) {
    gridShadow(c, 33, 57, 17, 4);
    // flame mane (behind head, row of flames)
    for (let i = 0; i < 5; i++) {
      const fx = 13 + i * 8;
      pxr(c, fx, 18, 5, 12, pal.outline); pxr(c, fx + 1, 18, 4, 11, pal.light);
      pxr(c, fx + 1, 13, 4, 6, pal.outline); pxr(c, fx + 2, 13, 3, 5, pal.hl);
      pxr(c, fx + 2, 9, 3, 5, pal.outline); pxr(c, fx + 3, 9, 2, 4, pal.hl2);
      px(c, fx + 3, 7, pal.hl2);
      pxr(c, fx, 29, 5, 2, pal.dark);
    }
    // body
    fillBlob(c, 33, 42, 18, 13, pal.outline);
    fillBlob(c, 33, 42, 16, 11, pal.base);
    fillBlob(c, 33, 45, 16, 8, pal.shade);
    fillBlob(c, 33, 50, 14, 3, pal.dark);
    // rim light
    for (let i = 0; i < 14; i++) { px(c, 17 + i, 36, pal.light); if (i < 9) px(c, 17 + i, 35, pal.hl); }
    // head
    fillBlob(c, 33, 28, 14, 11, pal.outline);
    fillBlob(c, 33, 28, 12, 9, pal.base);
    fillBlob(c, 33, 30, 12, 7, pal.shade);
    fillBlob(c, 28, 26, 6, 3, pal.light); px(c, 29, 25, pal.hl);
    // belly
    fillBlob(c, 33, 48, 9, 5, pal.belly); pxr(c, 33, 51, 7, 2, pal.shade);
    // legs (strong)
    pxr(c, 21, 51, 8, 7, pal.outline); pxr(c, 22, 51, 6, 6, pal.shade);
    pxr(c, 37, 51, 8, 7, pal.outline); pxr(c, 38, 51, 6, 6, pal.shade);
    pxr(c, 22, 56, 6, 2, pal.dark); pxr(c, 38, 56, 6, 2, pal.dark);
    // claws (3 per foot)
    pxr(c, 23, 57, 1, 1, pal.outline); pxr(c, 25, 57, 1, 1, pal.outline); pxr(c, 27, 57, 1, 1, pal.outline);
    pxr(c, 39, 57, 1, 1, pal.outline); pxr(c, 41, 57, 1, 1, pal.outline); pxr(c, 43, 57, 1, 1, pal.outline);
    // arms + claws
    pxr(c, 15, 41, 5, 9, pal.outline); pxr(c, 16, 41, 3, 8, pal.shade);
    pxr(c, 46, 41, 5, 9, pal.outline); pxr(c, 47, 41, 3, 8, pal.shade);
    pxr(c, 16, 49, 1, 1, pal.outline); pxr(c, 18, 49, 1, 1, pal.outline);
    pxr(c, 47, 49, 1, 1, pal.outline); pxr(c, 49, 49, 1, 1, pal.outline);
    // horns (curved, swept back)
    pxr(c, 24, 15, 4, 7, pal.outline); pxr(c, 25, 15, 3, 6, pal.dark); pxr(c, 25, 16, 2, 4, pal.shade2);
    pxr(c, 39, 15, 4, 7, pal.outline); pxr(c, 40, 15, 3, 6, pal.dark); pxr(c, 40, 16, 2, 4, pal.shade2);
    pxr(c, 23, 14, 2, 2, pal.outline); pxr(c, 42, 14, 2, 2, pal.outline);
    // fierce eyes
    eyes(c, 27, 28, 39, 28, pal, 5, "#f8d020");
    // angry brows
    pxr(c, 24, 25, 7, 2, pal.outline); pxr(c, 36, 25, 7, 2, pal.outline);
    pxr(c, 24, 25, 2, 1, pal.dark); pxr(c, 41, 25, 2, 1, pal.dark);
    // snout + fangs
    pxr(c, 40, 34, 6, 3, pal.outline); pxr(c, 41, 34, 5, 2, pal.shade);
    px(c, 42, 37, "#ffffff"); px(c, 44, 37, "#ffffff"); // fangs
    // tail flame
    pxr(c, 50, 38, 7, 6, pal.outline); pxr(c, 51, 38, 6, 5, pal.base);
    pxr(c, 53, 31, 5, 7, pal.outline); pxr(c, 54, 31, 4, 6, pal.light);
    pxr(c, 55, 24, 3, 7, pal.outline); pxr(c, 56, 24, 2, 6, pal.hl);
    pxr(c, 57, 18, 2, 6, pal.outline); pxr(c, 58, 18, 1, 5, pal.hl2);
  },

  // Pyrothorn: winged volcanic dragon, big spread wings
  pyrothorn(c, pal) {
    gridShadow(c, 32, 57, 21, 4);
    // left wing (large, bat-like)
    pxr(c, 3, 26, 22, 5, pal.outline); pxr(c, 4, 26, 21, 4, pal.base);
    pxr(c, 4, 26, 21, 2, pal.light);
    pxr(c, 2, 21, 18, 5, pal.outline); pxr(c, 3, 21, 17, 4, pal.base);
    pxr(c, 3, 21, 17, 1, pal.hl);
    pxr(c, 6, 16, 12, 5, pal.outline); pxr(c, 7, 16, 11, 4, pal.light);
    pxr(c, 3, 31, 22, 4, pal.outline); pxr(c, 4, 31, 21, 3, pal.shade);
    // wing membrane lines
    pxr(c, 8, 26, 1, 9, pal.dark); pxr(c, 14, 26, 1, 9, pal.dark); pxr(c, 20, 26, 1, 9, pal.dark);
    // right wing
    pxr(c, 39, 26, 22, 5, pal.outline); pxr(c, 40, 26, 21, 4, pal.base);
    pxr(c, 40, 26, 21, 2, pal.light);
    pxr(c, 44, 21, 18, 5, pal.outline); pxr(c, 45, 21, 17, 4, pal.base);
    pxr(c, 45, 21, 17, 1, pal.hl);
    pxr(c, 46, 16, 12, 5, pal.outline); pxr(c, 47, 16, 11, 4, pal.light);
    pxr(c, 39, 31, 22, 4, pal.outline); pxr(c, 40, 31, 21, 3, pal.shade);
    pxr(c, 43, 26, 1, 9, pal.dark); pxr(c, 49, 26, 1, 9, pal.dark); pxr(c, 55, 26, 1, 9, pal.dark);
    // body
    fillBlob(c, 32, 41, 16, 13, pal.outline);
    fillBlob(c, 32, 41, 14, 11, pal.base);
    fillBlob(c, 32, 44, 14, 8, pal.shade);
    fillBlob(c, 32, 49, 12, 3, pal.dark);
    // rim light
    for (let i = 0; i < 12; i++) { px(c, 19 + i, 36, pal.light); if (i < 8) px(c, 19 + i, 35, pal.hl); }
    // neck + head (facing right)
    fillBlob(c, 38, 26, 10, 8, pal.outline);
    fillBlob(c, 38, 26, 8, 6, pal.base);
    fillBlob(c, 38, 28, 8, 4, pal.shade);
    fillBlob(c, 35, 24, 4, 2, pal.light); px(c, 36, 23, pal.hl);
    // snout (long)
    pxr(c, 45, 25, 9, 5, pal.outline); pxr(c, 46, 25, 8, 4, pal.base);
    pxr(c, 46, 28, 8, 1, pal.shade);
    // jaw line
    pxr(c, 45, 29, 9, 1, pal.outline);
    // belly
    fillBlob(c, 32, 47, 10, 5, pal.belly); pxr(c, 32, 50, 8, 2, pal.shade);
    // legs
    pxr(c, 22, 51, 7, 7, pal.outline); pxr(c, 23, 51, 5, 6, pal.shade);
    pxr(c, 36, 51, 7, 7, pal.outline); pxr(c, 37, 51, 5, 6, pal.shade);
    pxr(c, 23, 56, 5, 2, pal.dark); pxr(c, 37, 56, 5, 2, pal.dark);
    // claws
    pxr(c, 24, 57, 1, 1, pal.outline); pxr(c, 26, 57, 1, 1, pal.outline); pxr(c, 28, 57, 1, 1, pal.outline);
    pxr(c, 38, 57, 1, 1, pal.outline); pxr(c, 40, 57, 1, 1, pal.outline); pxr(c, 42, 57, 1, 1, pal.outline);
    // horns (swept back, 2 pairs)
    pxr(c, 32, 14, 4, 8, pal.outline); pxr(c, 33, 14, 3, 7, pal.dark); pxr(c, 33, 15, 2, 5, pal.shade2);
    pxr(c, 43, 14, 4, 7, pal.outline); pxr(c, 44, 14, 3, 6, pal.dark); pxr(c, 44, 15, 2, 4, pal.shade2);
    // spine spikes
    pxr(c, 25, 30, 2, 5, pal.outline); pxr(c, 25, 30, 1, 4, pal.dark);
    pxr(c, 29, 32, 2, 5, pal.outline); pxr(c, 29, 32, 1, 4, pal.dark);
    pxr(c, 33, 33, 2, 4, pal.outline); pxr(c, 33, 33, 1, 3, pal.dark);
    // eye (fierce)
    eyes(c, 36, 24, 43, 24, pal, 4, "#f8d020");
    pxr(c, 34, 22, 6, 1, pal.outline); pxr(c, 41, 22, 6, 1, pal.outline);
    // fangs
    px(c, 47, 30, "#ffffff"); px(c, 50, 30, "#ffffff");
    // fiery tail (left)
    pxr(c, 8, 40, 8, 5, pal.outline); pxr(c, 9, 40, 7, 4, pal.base);
    pxr(c, 4, 35, 6, 6, pal.outline); pxr(c, 5, 35, 5, 5, pal.light);
    pxr(c, 2, 29, 4, 6, pal.outline); pxr(c, 3, 29, 3, 5, pal.hl);
    px(c, 3, 25, pal.hl2);
  },

  // ---- WATER LINE ----
  // Aquip: small water creature, round, big eyes, water droplet crest
  aquip(c, pal) {
    gridShadow(c, 32, 57, 15, 4);
    // water droplet crest on top
    pxr(c, 30, 14, 5, 4, pal.outline); pxr(c, 31, 14, 4, 3, pal.light);
    pxr(c, 31, 10, 4, 5, pal.outline); pxr(c, 32, 10, 3, 4, pal.hl);
    pxr(c, 32, 7, 3, 4, pal.outline); pxr(c, 33, 7, 2, 3, pal.hl2);
    px(c, 33, 6, pal.hl2);
    // body (round, chubby)
    fillBlob(c, 32, 40, 16, 14, pal.outline);
    fillBlob(c, 32, 40, 14, 12, pal.base);
    fillBlob(c, 32, 43, 14, 9, pal.shade);
    fillBlob(c, 32, 48, 12, 4, pal.dark);
    // rim light (glossy water sheen)
    for (let i = 0; i < 12; i++) { px(c, 18 + i, 33, pal.light); if (i < 8) px(c, 18 + i, 32, pal.hl); }
    px(c, 21, 31, pal.hl2);
    // belly (pale)
    fillBlob(c, 32, 46, 10, 6, pal.belly); pxr(c, 32, 49, 8, 3, pal.shade);
    // fins (side, small)
    pxr(c, 14, 40, 5, 5, pal.outline); pxr(c, 15, 40, 4, 4, pal.light); pxr(c, 15, 40, 4, 1, pal.hl);
    pxr(c, 45, 40, 5, 5, pal.outline); pxr(c, 46, 40, 4, 4, pal.light); pxr(c, 46, 40, 4, 1, pal.hl);
    // feet (flippers)
    pxr(c, 22, 52, 7, 5, pal.outline); pxr(c, 23, 52, 5, 4, pal.shade);
    pxr(c, 35, 52, 7, 5, pal.outline); pxr(c, 36, 52, 5, 4, pal.shade);
    pxr(c, 23, 55, 5, 2, pal.dark); pxr(c, 36, 55, 5, 2, pal.dark);
    // toe webbing lines
    pxr(c, 25, 56, 1, 1, pal.outline); pxr(c, 28, 56, 1, 1, pal.outline);
    pxr(c, 38, 56, 1, 1, pal.outline); pxr(c, 41, 56, 1, 1, pal.outline);
    // eyes (big, cute, glossy)
    eyes(c, 25, 34, 39, 34, pal, 5, "#2080d0");
    pxr(c, 23, 32, 6, 1, pal.outline); pxr(c, 36, 32, 6, 1, pal.outline);
    // extra shine on eyes
    px(c, 26, 35, "#ffffff"); px(c, 40, 35, "#ffffff");
    // cheeks (cool blush)
    fillBlob(c, 19, 40, 3, 2, "rgba(120,180,248,0.5)");
    fillBlob(c, 45, 40, 3, 2, "rgba(120,180,248,0.5)");
    // smile
    px(c, 29, 42, pal.outline); pxr(c, 30, 43, 4, 1, pal.outline); px(c, 34, 42, pal.outline);
    // water droplets (floating, decorative)
    pxr(c, 8, 30, 3, 3, pal.hl); pxr(c, 8, 29, 3, 1, pal.hl2);
    pxr(c, 54, 28, 3, 3, pal.hl); pxr(c, 54, 27, 3, 1, pal.hl2);
  },

  // Tidalon: sleek aquatic creature with dorsal fin, tail fin, scales
  tidalon(c, pal) {
    gridShadow(c, 31, 57, 18, 4);
    // dorsal fin (big, sail-like)
    pxr(c, 20, 17, 18, 4, pal.outline); pxr(c, 21, 17, 17, 3, pal.base);
    pxr(c, 23, 12, 14, 5, pal.outline); pxr(c, 24, 12, 13, 4, pal.light);
    pxr(c, 26, 8, 10, 4, pal.outline); pxr(c, 27, 8, 9, 3, pal.hl);
    pxr(c, 29, 5, 6, 3, pal.outline); pxr(c, 30, 5, 5, 2, pal.hl2);
    px(c, 30, 3, pal.hl2);
    // fin ridge lines
    pxr(c, 24, 17, 1, 5, pal.dark); pxr(c, 29, 17, 1, 7, pal.dark); pxr(c, 34, 17, 1, 5, pal.dark);
    pxr(c, 20, 21, 18, 1, pal.dark);
    // body (sleek, horizontal)
    fillBlob(c, 30, 38, 20, 12, pal.outline);
    fillBlob(c, 30, 38, 18, 10, pal.base);
    fillBlob(c, 30, 41, 18, 7, pal.shade);
    fillBlob(c, 30, 45, 16, 3, pal.dark);
    // rim light
    for (let i = 0; i < 17; i++) { px(c, 14 + i, 31, pal.light); if (i < 11) px(c, 15 + i, 30, pal.hl); }
    px(c, 18, 29, pal.hl2);
    // belly
    fillBlob(c, 30, 44, 16, 4, pal.belly);
    // scales (rows of shimmer)
    const sc = [pal.hl, pal.hl2, pal.light];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 6; col++) {
        px(c, 24 + col * 3, 35 + row * 3, sc[(row + col) % 3]);
      }
    }
    // tail fin (right, forked, large)
    pxr(c, 49, 28, 4, 5, pal.outline); pxr(c, 50, 28, 3, 4, pal.base);
    pxr(c, 53, 22, 6, 8, pal.outline); pxr(c, 54, 22, 5, 7, pal.light);
    pxr(c, 53, 42, 6, 8, pal.outline); pxr(c, 54, 42, 5, 7, pal.light);
    pxr(c, 58, 26, 2, 20, pal.outline); pxr(c, 58, 28, 1, 16, pal.shade);
    pxr(c, 54, 22, 1, 7, pal.hl); pxr(c, 54, 42, 1, 7, pal.hl);
    // side fin (pectoral, large)
    pxr(c, 21, 40, 9, 6, pal.outline); pxr(c, 22, 40, 8, 5, pal.shade);
    pxr(c, 23, 41, 7, 3, pal.light); pxr(c, 24, 42, 5, 2, pal.hl);
    pxr(c, 21, 45, 9, 1, pal.dark);
    // fin rays
    pxr(c, 25, 40, 1, 5, pal.dark); pxr(c, 29, 40, 1, 5, pal.dark);
    // gill
    pxr(c, 22, 37, 1, 5, pal.dark); pxr(c, 23, 38, 1, 3, pal.shade2);
    // eye (big, left)
    pxr(c, 15, 34, 7, 7, "#ffffff"); pxr(c, 16, 35, 6, 6, pal.eye);
    pxr(c, 17, 35, 4, 4, "#084058"); px(c, 18, 36, pal.eyeShine);
    pxr(c, 14, 33, 8, 1, pal.outline); pxr(c, 14, 41, 8, 1, pal.outline);
    pxr(c, 14, 33, 1, 8, pal.outline); pxr(c, 22, 33, 1, 8, pal.outline);
    pxr(c, 13, 32, 8, 1, pal.outline); // brow
    // mouth
    pxr(c, 12, 42, 7, 2, pal.outline); pxr(c, 13, 42, 5, 1, pal.dark);
    px(c, 15, 43, "#ffffff"); // tooth
    // water splash droplets
    pxr(c, 6, 36, 3, 3, pal.hl); pxr(c, 6, 35, 3, 1, pal.hl2);
    pxr(c, 8, 42, 2, 2, pal.light);
  },

  // Leviathorn: massive sea serpent, coiled body, big head, horns
  leviathorn(c, pal) {
    gridShadow(c, 32, 57, 22, 4);
    // coiled body (lower, serpentine curves)
    pxr(c, 10, 48, 44, 8, pal.outline); pxr(c, 11, 48, 42, 7, pal.base);
    pxr(c, 11, 51, 42, 4, pal.shade); pxr(c, 11, 54, 42, 1, pal.dark);
    pxr(c, 11, 48, 42, 2, pal.light);
    // coil bump
    pxr(c, 16, 45, 8, 4, pal.outline); pxr(c, 17, 45, 7, 3, pal.base);
    pxr(c, 17, 45, 7, 1, pal.hl);
    pxr(c, 40, 45, 8, 4, pal.outline); pxr(c, 41, 45, 7, 3, pal.base);
    pxr(c, 41, 45, 7, 1, pal.hl);
    // scale rows on body
    const sc = [pal.hl, pal.hl2, pal.light];
    for (let i = 0; i < 12; i++) { px(c, 14 + i * 3, 49, sc[i % 3]); px(c, 14 + i * 3, 51, sc[(i + 1) % 3]); }
    // body segments (vertical lines)
    for (let i = 0; i < 7; i++) pxr(c, 16 + i * 6, 48, 1, 7, pal.dark);
    // neck (rising from body to head)
    pxr(c, 38, 30, 10, 18, pal.outline); pxr(c, 39, 30, 8, 17, pal.base);
    pxr(c, 39, 33, 8, 14, pal.shade); pxr(c, 39, 30, 8, 2, pal.light);
    // neck segments
    for (let i = 0; i < 4; i++) pxr(c, 39, 32 + i * 4, 8, 1, pal.dark);
    // head (big, dragon-like, upper right)
    fillBlob(c, 44, 24, 13, 11, pal.outline);
    fillBlob(c, 44, 24, 11, 9, pal.base);
    fillBlob(c, 44, 27, 11, 6, pal.shade);
    fillBlob(c, 40, 22, 5, 3, pal.light); px(c, 41, 21, pal.hl);
    // snout (long)
    pxr(c, 52, 25, 10, 6, pal.outline); pxr(c, 53, 25, 9, 5, pal.base);
    pxr(c, 53, 29, 9, 1, pal.shade); pxr(c, 52, 30, 10, 1, pal.outline);
    // horns (big, swept back)
    pxr(c, 38, 14, 4, 9, pal.outline); pxr(c, 39, 14, 3, 8, pal.dark); pxr(c, 39, 15, 2, 6, pal.shade2);
    pxr(c, 35, 10, 3, 5, pal.outline); pxr(c, 36, 10, 2, 4, pal.dark);
    pxr(c, 50, 14, 4, 8, pal.outline); pxr(c, 51, 14, 3, 7, pal.dark); pxr(c, 51, 15, 2, 5, pal.shade2);
    // dorsal ridge on neck
    pxr(c, 38, 28, 2, 4, pal.outline); pxr(c, 38, 28, 1, 3, pal.dark);
    pxr(c, 38, 33, 2, 4, pal.outline); pxr(c, 38, 33, 1, 3, pal.dark);
    // eye (fierce, narrow)
    pxr(c, 43, 25, 6, 4, "#ffffff"); pxr(c, 44, 26, 5, 3, pal.eye);
    pxr(c, 45, 26, 3, 2, "#084058"); px(c, 46, 26, pal.eyeShine);
    pxr(c, 42, 24, 7, 1, pal.outline); pxr(c, 42, 29, 7, 1, pal.outline);
    pxr(c, 42, 24, 1, 6, pal.outline); pxr(c, 49, 24, 1, 6, pal.outline);
    // angry brow
    pxr(c, 42, 23, 6, 1, pal.outline); px(c, 42, 23, pal.dark);
    // fangs
    pxr(c, 54, 31, 2, 4, "#ffffff"); pxr(c, 58, 31, 2, 4, "#ffffff");
    // nostril
    px(c, 60, 27, pal.outline);
    // tail fin (left end of body)
    pxr(c, 4, 46, 8, 10, pal.outline); pxr(c, 5, 46, 7, 9, pal.light);
    pxr(c, 1, 42, 5, 6, pal.outline); pxr(c, 2, 42, 4, 5, pal.hl);
    pxr(c, 1, 52, 5, 5, pal.outline); pxr(c, 2, 52, 4, 4, pal.hl);
  },

  // ---- GRASS LINE ----
  // Leafon: small grass creature, leaf ears, bud tail
  leafon(c, pal) {
    gridShadow(c, 32, 57, 15, 4);
    // leaf ears (big, pointed, on top sides)
    pxr(c, 16, 18, 7, 4, pal.outline); pxr(c, 17, 18, 6, 3, pal.light);
    pxr(c, 13, 14, 6, 5, pal.outline); pxr(c, 14, 14, 5, 4, pal.base);
    pxr(c, 14, 14, 5, 1, pal.hl);
    // leaf vein
    pxr(c, 15, 14, 1, 4, pal.dark); pxr(c, 16, 16, 2, 1, pal.dark);
    // right leaf ear
    pxr(c, 41, 18, 7, 4, pal.outline); pxr(c, 42, 18, 6, 3, pal.light);
    pxr(c, 45, 14, 6, 5, pal.outline); pxr(c, 46, 14, 5, 4, pal.base);
    pxr(c, 46, 14, 5, 1, pal.hl);
    pxr(c, 48, 14, 1, 4, pal.dark); pxr(c, 46, 16, 2, 1, pal.dark);
    // body
    fillBlob(c, 32, 40, 15, 13, pal.outline);
    fillBlob(c, 32, 40, 13, 11, pal.base);
    fillBlob(c, 32, 43, 13, 8, pal.shade);
    fillBlob(c, 32, 48, 11, 3, pal.dark);
    // rim light
    for (let i = 0; i < 11; i++) { px(c, 18 + i, 34, pal.light); if (i < 7) px(c, 18 + i, 33, pal.hl); }
    // belly (pale green)
    fillBlob(c, 32, 46, 9, 5, pal.belly); pxr(c, 32, 49, 7, 2, pal.shade);
    // leaf collar (around neck)
    pxr(c, 23, 33, 18, 3, pal.outline); pxr(c, 24, 33, 17, 2, pal.light);
    pxr(c, 24, 33, 17, 1, pal.hl);
    // leaf points on collar
    px(c, 24, 32, pal.outline); px(c, 29, 32, pal.outline); px(c, 35, 32, pal.outline); px(c, 40, 32, pal.outline);
    // legs
    pxr(c, 22, 50, 6, 7, pal.outline); pxr(c, 23, 50, 4, 6, pal.shade);
    pxr(c, 35, 50, 6, 7, pal.outline); pxr(c, 36, 50, 4, 6, pal.shade);
    pxr(c, 23, 55, 4, 2, pal.dark); pxr(c, 36, 55, 4, 2, pal.dark);
    pxr(c, 24, 56, 1, 1, pal.outline); pxr(c, 27, 56, 1, 1, pal.outline);
    pxr(c, 37, 56, 1, 1, pal.outline); pxr(c, 40, 56, 1, 1, pal.outline);
    // arms
    pxr(c, 17, 39, 4, 7, pal.outline); pxr(c, 18, 39, 3, 6, pal.shade);
    pxr(c, 43, 39, 4, 7, pal.outline); pxr(c, 44, 39, 3, 6, pal.shade);
    // eyes (big, warm)
    eyes(c, 25, 28, 39, 28, pal, 5, "#587820");
    pxr(c, 23, 26, 6, 1, pal.outline); pxr(c, 36, 26, 6, 1, pal.outline);
    // nose
    px(c, 31, 34, pal.dark); px(c, 33, 34, pal.dark);
    // smile
    px(c, 29, 36, pal.outline); pxr(c, 30, 37, 4, 1, pal.outline); px(c, 34, 36, pal.outline);
    // bud/flower tail (right side)
    pxr(c, 47, 40, 5, 5, pal.outline); pxr(c, 48, 40, 4, 4, pal.light);
    pxr(c, 48, 40, 4, 1, pal.hl);
    // petals
    pxr(c, 50, 38, 3, 2, "#f8c8d8"); pxr(c, 50, 44, 3, 2, "#f8c8d8");
    pxr(c, 52, 40, 2, 4, "#f8a8c8"); px(c, 53, 42, "#f878a8");
  },

  // Florahn: flowering grass creature, petals on head, leafy body
  florahn(c, pal) {
    gridShadow(c, 32, 57, 16, 4);
    // flower petals on head (5 petals around top)
    function petal(cx, cy, r) {
      fillBlob(c, cx, cy, r, r, pal.outline);
      fillBlob(c, cx, cy, r - 1, r - 1, "#f8a8c8");
      px(c, cx, cy - r + 1, "#f878a8");
    }
    petal(32, 8, 4); petal(24, 12, 4); petal(40, 12, 4); petal(28, 6, 3); petal(36, 6, 3);
    // flower center
    fillBlob(c, 32, 14, 5, 4, pal.outline); fillBlob(c, 32, 14, 4, 3, "#f8d848");
    px(c, 32, 13, "#f8e878");
    // stem (neck)
    pxr(c, 30, 18, 5, 8, pal.outline); pxr(c, 31, 18, 3, 7, pal.base);
    pxr(c, 31, 18, 3, 1, pal.hl);
    // body (round, leafy)
    fillBlob(c, 32, 38, 16, 14, pal.outline);
    fillBlob(c, 32, 38, 14, 12, pal.base);
    fillBlob(c, 32, 41, 14, 9, pal.shade);
    fillBlob(c, 32, 46, 12, 4, pal.dark);
    // rim light
    for (let i = 0; i < 12; i++) { px(c, 18 + i, 32, pal.light); if (i < 8) px(c, 18 + i, 31, pal.hl); }
    // leaf pattern on body (veins)
    pxr(c, 24, 36, 1, 8, pal.dark); pxr(c, 30, 36, 1, 8, pal.dark);
    pxr(c, 36, 36, 1, 8, pal.dark); pxr(c, 40, 36, 1, 8, pal.dark);
    pxr(c, 24, 40, 2, 1, pal.dark); pxr(c, 36, 40, 2, 1, pal.dark);
    // belly
    fillBlob(c, 32, 44, 10, 5, pal.belly); pxr(c, 32, 47, 8, 2, pal.shade);
    // leaf arms (pointed)
    pxr(c, 13, 36, 6, 5, pal.outline); pxr(c, 14, 36, 5, 4, pal.base); pxr(c, 14, 36, 5, 1, pal.hl);
    px(c, 12, 38, pal.outline); pxr(c, 13, 37, 1, 3, pal.dark); // vein
    pxr(c, 45, 36, 6, 5, pal.outline); pxr(c, 46, 36, 5, 4, pal.base); pxr(c, 46, 36, 5, 1, pal.hl);
    px(c, 52, 38, pal.outline); pxr(c, 50, 37, 1, 3, pal.dark);
    // legs (stumpy)
    pxr(c, 22, 50, 7, 7, pal.outline); pxr(c, 23, 50, 5, 6, pal.shade);
    pxr(c, 35, 50, 7, 7, pal.outline); pxr(c, 36, 50, 5, 6, pal.shade);
    pxr(c, 23, 55, 5, 2, pal.dark); pxr(c, 36, 55, 5, 2, pal.dark);
    pxr(c, 24, 56, 1, 1, pal.outline); pxr(c, 27, 56, 1, 1, pal.outline);
    pxr(c, 37, 56, 1, 1, pal.outline); pxr(c, 40, 56, 1, 1, pal.outline);
    // eyes (gentle)
    eyes(c, 26, 32, 38, 32, pal, 4, "#587820");
    pxr(c, 24, 30, 6, 1, pal.outline); pxr(c, 36, 30, 6, 1, pal.outline);
    // cheeks (pink blush)
    fillBlob(c, 20, 38, 3, 2, "rgba(248,168,200,0.6)");
    fillBlob(c, 44, 38, 3, 2, "rgba(248,168,200,0.6)");
    // smile
    px(c, 29, 39, pal.outline); pxr(c, 30, 40, 4, 1, pal.outline); px(c, 34, 39, pal.outline);
  },

  // Thornheart: thorny grass creature, defensive, big thorns, stern face
  thornheart(c, pal) {
    gridShadow(c, 32, 57, 18, 4);
    // big thorns on back (3 large triangular)
    function thorn(x, h) {
      for (let i = 0; i < h; i++) {
        const w = h - i + 1;
        const sx = x - Math.floor(w / 2);
        pxr(c, sx, 20 + h - i - 1, w, 1, i < 2 ? pal.dark : pal.base);
        if (i < h - 1) px(c, sx + 1, 20 + h - i - 1, pal.light);
        if (i < 3) pxr(c, sx, 20 + h - i - 1, w, 1, pal.outline);
      }
      pxr(c, x - 1, 20, 3, 1, pal.outline);
    }
    thorn(20, 11); thorn(32, 14); thorn(44, 11);
    // thorn tips (sharp)
    px(c, 20, 19, pal.outline); px(c, 32, 16, pal.outline); px(c, 44, 19, pal.outline);
    // body (stocky, broad)
    fillBlob(c, 32, 42, 17, 13, pal.outline);
    fillBlob(c, 32, 42, 15, 11, pal.base);
    fillBlob(c, 32, 45, 15, 8, pal.shade);
    fillBlob(c, 32, 50, 13, 3, pal.dark);
    // rim light
    for (let i = 0; i < 13; i++) { px(c, 17 + i, 36, pal.light); if (i < 9) px(c, 17 + i, 35, pal.hl); }
    // bark/wood texture lines on body
    pxr(c, 24, 38, 1, 10, pal.dark); pxr(c, 30, 38, 1, 10, pal.dark);
    pxr(c, 36, 38, 1, 10, pal.dark); pxr(c, 40, 38, 1, 10, pal.dark);
    pxr(c, 24, 42, 2, 1, pal.dark); pxr(c, 36, 44, 2, 1, pal.dark);
    // belly (wood/cream)
    fillBlob(c, 32, 48, 9, 4, pal.belly); pxr(c, 32, 50, 7, 2, pal.shade);
    // arms (stumpy, with thorns)
    pxr(c, 13, 40, 5, 8, pal.outline); pxr(c, 14, 40, 3, 7, pal.shade);
    pxr(c, 11, 38, 3, 3, pal.outline); pxr(c, 12, 38, 2, 2, pal.dark); // arm thorn
    pxr(c, 46, 40, 5, 8, pal.outline); pxr(c, 47, 40, 3, 7, pal.shade);
    pxr(c, 50, 38, 3, 3, pal.outline); pxr(c, 51, 38, 2, 2, pal.dark); // arm thorn
    // legs (stout)
    pxr(c, 22, 51, 7, 7, pal.outline); pxr(c, 23, 51, 5, 6, pal.shade);
    pxr(c, 35, 51, 7, 7, pal.outline); pxr(c, 36, 51, 5, 6, pal.shade);
    pxr(c, 23, 56, 5, 2, pal.dark); pxr(c, 36, 56, 5, 2, pal.dark);
    // root toes
    pxr(c, 22, 57, 1, 1, pal.outline); pxr(c, 25, 57, 1, 1, pal.outline); pxr(c, 28, 57, 1, 1, pal.outline);
    pxr(c, 35, 57, 1, 1, pal.outline); pxr(c, 38, 57, 1, 1, pal.outline); pxr(c, 41, 57, 1, 1, pal.outline);
    // head (merged with body top, stern)
    fillBlob(c, 32, 32, 13, 8, pal.outline);
    fillBlob(c, 32, 32, 11, 6, pal.base);
    fillBlob(c, 32, 33, 11, 5, pal.shade);
    fillBlob(c, 28, 30, 5, 2, pal.light); px(c, 29, 29, pal.hl);
    // eyes (stern, narrowed)
    pxr(c, 26, 32, 6, 3, "#ffffff"); pxr(c, 27, 33, 5, 2, pal.eye);
    pxr(c, 28, 33, 3, 1, "#385818"); px(c, 29, 33, pal.eyeShine);
    pxr(c, 33, 32, 6, 3, "#ffffff"); pxr(c, 34, 33, 5, 2, pal.eye);
    pxr(c, 35, 33, 3, 1, "#385818"); px(c, 36, 33, pal.eyeShine);
    // stern brows (heavy)
    pxr(c, 24, 30, 8, 2, pal.outline); pxr(c, 33, 30, 8, 2, pal.outline);
    pxr(c, 24, 30, 2, 1, pal.dark); pxr(c, 39, 30, 2, 1, pal.dark);
    // mouth (firm line)
    pxr(c, 28, 38, 8, 1, pal.outline);
    pxr(c, 30, 39, 1, 1, pal.outline); pxr(c, 33, 39, 1, 1, pal.outline);
  },

  // ---- NORMAL ----
  // Rattick: rat/mouse creature, big ears, long tail, whiskers
  rattick(c, pal) {
    gridShadow(c, 34, 57, 18, 4);
    // long tail (curved, right side going down then right)
    pxr(c, 48, 44, 4, 3, pal.outline); pxr(c, 49, 44, 3, 2, pal.shade);
    pxr(c, 52, 42, 5, 3, pal.outline); pxr(c, 53, 42, 4, 2, pal.base);
    pxr(c, 56, 40, 4, 3, pal.outline); pxr(c, 57, 40, 3, 2, pal.light);
    pxr(c, 57, 37, 3, 4, pal.outline); pxr(c, 58, 37, 2, 3, pal.shade);
    // big round ears (with inner ear)
    fillBlob(c, 21, 20, 7, 7, pal.outline); fillBlob(c, 21, 20, 5, 5, pal.base);
    fillBlob(c, 21, 20, 3, 3, pal.shade); px(c, 21, 19, pal.hl);
    fillBlob(c, 43, 20, 7, 7, pal.outline); fillBlob(c, 43, 20, 5, 5, pal.base);
    fillBlob(c, 43, 20, 3, 3, pal.shade); px(c, 43, 19, pal.hl);
    // body (plump, hunched)
    fillBlob(c, 32, 40, 15, 13, pal.outline);
    fillBlob(c, 32, 40, 13, 11, pal.base);
    fillBlob(c, 32, 43, 13, 8, pal.shade);
    fillBlob(c, 32, 48, 11, 3, pal.dark);
    // rim light
    for (let i = 0; i < 11; i++) { px(c, 19 + i, 34, pal.light); if (i < 7) px(c, 19 + i, 33, pal.hl); }
    // belly (pale)
    fillBlob(c, 32, 45, 10, 5, pal.belly); pxr(c, 32, 48, 8, 2, pal.shade);
    // head (merged, snout pointing right)
    fillBlob(c, 36, 30, 12, 9, pal.outline);
    fillBlob(c, 36, 30, 10, 7, pal.base);
    fillBlob(c, 36, 32, 10, 5, pal.shade);
    fillBlob(c, 32, 28, 5, 2, pal.light); px(c, 33, 27, pal.hl);
    // snout (pointed)
    pxr(c, 44, 34, 7, 4, pal.outline); pxr(c, 45, 34, 6, 3, pal.base);
    pxr(c, 45, 36, 6, 1, pal.shade);
    // nose (pink)
    pxr(c, 49, 35, 3, 2, "#f8a8b8"); px(c, 50, 35, "#e87890");
    // whiskers
    pxr(c, 40, 37, 6, 1, pal.outline); pxr(c, 40, 38, 6, 1, pal.outline);
    // legs
    pxr(c, 24, 50, 6, 7, pal.outline); pxr(c, 25, 50, 4, 6, pal.shade);
    pxr(c, 35, 50, 6, 7, pal.outline); pxr(c, 36, 50, 4, 6, pal.shade);
    pxr(c, 25, 55, 4, 2, pal.dark); pxr(c, 36, 55, 4, 2, pal.dark);
    // claws
    pxr(c, 26, 56, 1, 1, pal.outline); pxr(c, 29, 56, 1, 1, pal.outline);
    pxr(c, 37, 56, 1, 1, pal.outline); pxr(c, 40, 56, 1, 1, pal.outline);
    // arms (small, tucked)
    pxr(c, 19, 40, 4, 6, pal.outline); pxr(c, 20, 40, 3, 5, pal.shade);
    pxr(c, 42, 40, 4, 6, pal.outline); pxr(c, 43, 40, 3, 5, pal.shade);
    // eye (one visible, side-facing)
    pxr(c, 38, 31, 5, 5, "#ffffff"); pxr(c, 39, 32, 4, 4, pal.eye);
    pxr(c, 40, 32, 2, 2, "#282828"); px(c, 40, 32, pal.eyeShine);
    pxr(c, 37, 30, 6, 1, pal.outline); pxr(c, 37, 36, 6, 1, pal.outline);
    pxr(c, 37, 30, 1, 7, pal.outline); pxr(c, 43, 30, 1, 7, pal.outline);
    // buck teeth
    pxr(c, 47, 37, 2, 3, "#ffffff"); pxr(c, 47, 37, 2, 1, pal.outline);
    pxr(c, 50, 37, 2, 3, "#ffffff"); pxr(c, 52, 37, 2, 1, pal.outline);
  }
};

// ===============================================================
//  DEFAULT BODY DESIGNS (by shape key — used when no species-
//  specific design exists). Each draws a cute, readable creature.
// ===============================================================
const DEFAULT_DESIGNS = {
  // ROUND: a chubby blob creature (e.g. Pikachu-ish / Jigglypuff-ish body)
  round(c, pal, sp) {
    const body = fillBlob(c, 16, 19, 11, 9, pal.base);
    // shade bottom
    for (let y = 22; y < 29; y++)
      for (let x = 7; x < 26; x++)
        if ((x - 16) * (x - 16) / 121 + (y - 19) * (y - 19) / 81 <= 1.05)
          px(c, x, y, pal.shade);
    // belly
    fillBlob(c, 16, 23, 5, 4, pal.belly);
    // ears (two nubs on top)
    pxr(c, 10, 4, 3, 4, pal.base); pxr(c, 9, 3, 2, 2, pal.base);
    pxr(c, 19, 4, 3, 4, pal.base); pxr(c, 21, 3, 2, 2, pal.base);
    pxr(c, 10, 4, 3, 2, pal.dark); pxr(c, 19, 4, 3, 2, pal.dark);
    // feet
    pxr(c, 10, 27, 4, 2, pal.shade); pxr(c, 18, 27, 4, 2, pal.shade);
    // eyes + smile
    eyes(c, 12, 16, 19, 16, pal, 3);
    pxr(c, 14, 22, 4, 1, pal.outline); // mouth
    px(c, 14, 23, pal.outline); px(c, 17, 23, pal.outline);
    // cheeks
    px(c, 9, 20, pal.hl); px(c, 22, 20, pal.hl);
    outlineRegion(c, (x, y) => body.some(([bx, by]) => bx === x && by === y), pal.outline);
  },

  // QUAD: four-legged creature (Charmander-ish / Growlithe-ish)
  quad(c, pal, sp) {
    // body
    fillBlob(c, 16, 20, 10, 6, pal.base);
    for (let y = 22; y < 27; y++)
      for (let x = 7; x < 26; x++)
        if ((x - 16) * (x - 16) / 100 + (y - 20) * (y - 20) / 36 <= 1.05)
          px(c, x, y, pal.shade);
    // head
    fillBlob(c, 22, 14, 6, 5, pal.base);
    for (let y = 16; y < 20; y++)
      for (let x = 17; x < 29; x++)
        if ((x - 22) * (x - 22) / 36 + (y - 14) * (y - 14) / 25 <= 1.05)
          px(c, x, y, pal.shade);
    // belly stripe
    fillBlob(c, 16, 23, 6, 2, pal.belly);
    // legs
    pxr(c, 9, 25, 3, 4, pal.shade);
    pxr(c, 14, 25, 3, 4, pal.shade);
    pxr(c, 20, 25, 3, 4, pal.shade);
    pxr(c, 25, 25, 3, 4, pal.shade);
    pxr(c, 9, 28, 3, 1, pal.dark);
    pxr(c, 14, 28, 3, 1, pal.dark);
    pxr(c, 20, 28, 3, 1, pal.dark);
    pxr(c, 25, 28, 3, 1, pal.dark);
    // tail
    pxr(c, 4, 17, 4, 2, pal.base); pxr(c, 3, 15, 3, 3, pal.base);
    pxr(c, 3, 15, 2, 2, pal.light);
    // ears
    pxr(c, 19, 8, 2, 4, pal.base); pxr(c, 25, 8, 2, 4, pal.base);
    pxr(c, 19, 8, 2, 2, pal.dark); pxr(c, 25, 8, 2, 2, pal.dark);
    // eyes + snout
    eyes(c, 20, 13, 25, 13, pal, 2);
    pxr(c, 27, 16, 2, 1, pal.outline); // nose
    // outline
    const filled = (x, y) => {
      const a = (x - 16) * (x - 16) / 100 + (y - 20) * (y - 20) / 36 <= 1.05;
      const b = (x - 22) * (x - 22) / 36 + (y - 14) * (y - 14) / 25 <= 1.05;
      return a || b;
    };
    outlineRegion(c, filled, pal.outline);
  },

  // SPIKY: a creature with back spikes / flame mane (Charmeleon-ish)
  spiky(c, pal, sp) {
    fillBlob(c, 16, 20, 10, 7, pal.base);
    for (let y = 23; y < 28; y++)
      for (let x = 7; x < 26; x++)
        if ((x - 16) * (x - 16) / 100 + (y - 20) * (y - 20) / 49 <= 1.05)
          px(c, x, y, pal.shade);
    // head
    fillBlob(c, 16, 13, 7, 5, pal.base);
    for (let y = 15; y < 19; y++)
      for (let x = 10; x < 23; x++)
        if ((x - 16) * (x - 16) / 49 + (y - 13) * (y - 13) / 25 <= 1.05)
          px(c, x, y, pal.shade);
    // belly
    fillBlob(c, 16, 23, 5, 3, pal.belly);
    // back spikes (3 triangles)
    function spike(x) {
      pxr(c, x, 11, 3, 1, pal.light);
      pxr(c, x + 1, 9, 1, 2, pal.light);
      pxr(c, x, 7, 3, 1, pal.base);
      px(c, x + 1, 6, pal.dark);
    }
    spike(10); spike(15); spike(20);
    // flame-ish tail tip (only for fire types visually)
    if (Array.isArray(sp.type) ? sp.type.includes("fire") : sp.type === "fire") {
      pxr(c, 3, 16, 4, 3, pal.base);
      pxr(c, 2, 14, 3, 2, pal.light);
      pxr(c, 1, 12, 2, 2, pal.hl);
      pxr(c, 4, 18, 3, 1, pal.dark);
    } else {
      pxr(c, 3, 17, 4, 2, pal.base); pxr(c, 2, 16, 2, 1, pal.shade);
    }
    // arms
    pxr(c, 6, 19, 2, 4, pal.shade); pxr(c, 24, 19, 2, 4, pal.shade);
    // legs
    pxr(c, 11, 26, 3, 3, pal.shade); pxr(c, 18, 26, 3, 3, pal.shade);
    pxr(c, 11, 28, 3, 1, pal.dark); pxr(c, 18, 28, 3, 1, pal.dark);
    // eyes + snout
    eyes(c, 13, 12, 18, 12, pal, 2);
    pxr(c, 21, 15, 2, 1, pal.outline);
    const filled = (x, y) => {
      const a = (x - 16) * (x - 16) / 100 + (y - 20) * (y - 20) / 49 <= 1.05;
      const b = (x - 16) * (x - 16) / 49 + (y - 13) * (y - 13) / 25 <= 1.05;
      return a || b;
    };
    outlineRegion(c, filled, pal.outline);
  },

  // FINNED: a fish/aquatic creature (Magikarp-ish / finned beast)
  finned(c, pal, sp) {
    // body (elongated)
    fillBlob(c, 15, 18, 11, 6, pal.base);
    for (let y = 20; y < 25; y++)
      for (let x = 5; x < 27; x++)
        if ((x - 15) * (x - 15) / 121 + (y - 18) * (y - 18) / 36 <= 1.05)
          px(c, x, y, pal.shade);
    // belly
    fillBlob(c, 15, 21, 9, 2, pal.belly);
    // dorsal fin
    pxr(c, 13, 9, 6, 2, pal.base);
    pxr(c, 14, 7, 4, 2, pal.base);
    pxr(c, 15, 6, 2, 1, pal.light);
    pxr(c, 13, 11, 6, 1, pal.dark);
    // tail fin
    pxr(c, 24, 14, 2, 8, pal.base);
    pxr(c, 26, 12, 2, 3, pal.light);
    pxr(c, 26, 21, 2, 3, pal.light);
    pxr(c, 24, 13, 1, 1, pal.dark); pxr(c, 24, 22, 1, 1, pal.dark);
    // side fin
    pxr(c, 12, 20, 4, 2, pal.shade); pxr(c, 11, 21, 2, 1, pal.dark);
    // eye
    eyes(c, 8, 15, null, null, pal, 0);
    pxr(c, 7, 15, 3, 3, pal.eye); px(c, 9, 15, pal.eyeShine);
    // mouth
    pxr(c, 4, 19, 3, 1, pal.outline);
    // scales (a few dots)
    px(c, 13, 17, pal.hl); px(c, 17, 16, pal.hl); px(c, 20, 18, pal.hl);
    const filled = (x, y) => (x - 15) * (x - 15) / 121 + (y - 18) * (y - 18) / 36 <= 1.05;
    outlineRegion(c, filled, pal.outline);
  },

  // WINGED: a bird/bat-like creature with spread wings
  winged(c, pal, sp) {
    // body (compact)
    fillBlob(c, 16, 19, 7, 7, pal.base);
    for (let y = 21; y < 27; y++)
      for (let x = 10; x < 23; x++)
        if ((x - 16) * (x - 16) / 49 + (y - 19) * (y - 19) / 49 <= 1.05)
          px(c, x, y, pal.shade);
    // belly
    fillBlob(c, 16, 22, 4, 3, pal.belly);
    // left wing
    pxr(c, 4, 16, 8, 2, pal.base);
    pxr(c, 3, 14, 5, 2, pal.base);
    pxr(c, 5, 18, 6, 2, pal.shade);
    pxr(c, 4, 15, 1, 1, pal.dark); pxr(c, 8, 15, 1, 1, pal.dark);
    // right wing
    pxr(c, 21, 16, 8, 2, pal.base);
    pxr(c, 25, 14, 5, 2, pal.base);
    pxr(c, 20, 18, 6, 2, pal.shade);
    pxr(c, 22, 15, 1, 1, pal.dark); pxr(c, 27, 15, 1, 1, pal.dark);
    // head tuft
    pxr(c, 15, 10, 3, 2, pal.base); pxr(c, 16, 9, 1, 1, pal.hl);
    // beak
    pxr(c, 15, 17, 3, 2, pal.belly); pxr(c, 15, 18, 3, 1, pal.dark);
    // eyes
    pxr(c, 13, 16, 2, 2, pal.eye); pxr(c, 18, 16, 2, 2, pal.eye);
    px(c, 14, 16, pal.eyeShine); px(c, 19, 16, pal.eyeShine);
    // feet
    pxr(c, 13, 26, 2, 2, pal.shade); pxr(c, 18, 26, 2, 2, pal.shade);
    const filled = (x, y) => (x - 16) * (x - 16) / 49 + (y - 19) * (y - 19) / 49 <= 1.05;
    outlineRegion(c, filled, pal.outline);
  }
};

// ===============================================================
//  SPECIES-SPECIFIC DESIGNS
//  Keyed by speciesKey. Each overrides the default for a more
//  distinct, recognizable creature. Where absent, the shape-based
//  default is used (still far richer than the old blobs).
// ===============================================================
const SPECIES_DESIGNS = {

  // ---- FIRE line: Emberit -> Infernyx -> Pyrothorn ----
  emberit(c, pal) {
    // small fire lizard with a candle flame on the tail
    fillBlob(c, 15, 20, 8, 7, pal.base);
    for (let y = 22; y < 28; y++)
      for (let x = 8; x < 23; x++)
        if ((x - 15) * (x - 15) / 64 + (y - 20) * (y - 20) / 49 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 15, 13, 6, 5, pal.base);
    for (let y = 15; y < 19; y++)
      for (let x = 10; x < 21; x++)
        if ((x - 15) * (x - 15) / 36 + (y - 13) * (y - 13) / 25 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 15, 23, 4, 2, pal.belly);
    // tail with flame
    pxr(c, 22, 20, 4, 2, pal.base);
    pxr(c, 25, 17, 3, 4, pal.light); pxr(c, 26, 14, 2, 3, pal.hl);
    pxr(c, 25, 21, 3, 1, pal.dark);
    // legs
    pxr(c, 10, 26, 3, 3, pal.shade); pxr(c, 18, 26, 3, 3, pal.shade);
    pxr(c, 10, 28, 3, 1, pal.dark); pxr(c, 18, 28, 3, 1, pal.dark);
    // ears
    pxr(c, 11, 8, 2, 3, pal.base); pxr(c, 18, 8, 2, 3, pal.base);
    eyes(c, 12, 13, 18, 13, pal, 2);
    pxr(c, 20, 16, 2, 1, pal.outline);
    const f = (x, y) => (x - 15) * (x - 15) / 64 + (y - 20) * (y - 20) / 49 <= 1.05
                     || (x - 15) * (x - 15) / 36 + (y - 13) * (y - 13) / 25 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  infernyx(c, pal) {
    // bigger fiery lizard with a flame mane
    fillBlob(c, 16, 20, 10, 7, pal.base);
    for (let y = 23; y < 28; y++)
      for (let x = 7; x < 26; x++)
        if ((x - 16) * (x - 16) / 100 + (y - 20) * (y - 20) / 49 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 16, 13, 7, 5, pal.base);
    // flame mane behind head
    pxr(c, 8, 10, 3, 6, pal.light); pxr(c, 21, 10, 3, 6, pal.light);
    pxr(c, 8, 8, 2, 2, pal.hl); pxr(c, 22, 8, 2, 2, pal.hl);
    pxr(c, 8, 16, 3, 1, pal.dark); pxr(c, 21, 16, 3, 1, pal.dark);
    fillBlob(c, 16, 23, 5, 3, pal.belly);
    // claws
    pxr(c, 11, 26, 3, 3, pal.shade); pxr(c, 18, 26, 3, 3, pal.shade);
    px(c, 11, 28, 1, 1, pal.dark); px(c, 13, 28, 1, 1, pal.dark);
    px(c, 18, 28, 1, 1, pal.dark); px(c, 20, 28, 1, 1, pal.dark);
    // horns
    pxr(c, 12, 7, 2, 3, pal.dark); pxr(c, 18, 7, 2, 3, pal.dark);
    eyes(c, 13, 12, 18, 12, pal, 2);
    pxr(c, 21, 15, 2, 1, pal.outline);
    const f = (x, y) => (x - 16) * (x - 16) / 100 + (y - 20) * (y - 20) / 49 <= 1.05
                     || (x - 16) * (x - 16) / 49 + (y - 13) * (y - 13) / 25 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  pyrothorn(c, pal) {
    // winged volcanic dragon
    fillBlob(c, 16, 21, 10, 7, pal.base);
    for (let y = 24; y < 29; y++)
      for (let x = 7; x < 26; x++)
        if ((x - 16) * (x - 16) / 100 + (y - 21) * (y - 21) / 49 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 16, 13, 7, 5, pal.base);
    // wings
    pxr(c, 4, 12, 8, 2, pal.shade); pxr(c, 3, 10, 3, 2, pal.dark); pxr(c, 5, 8, 2, 2, pal.shade);
    pxr(c, 20, 12, 8, 2, pal.shade); pxr(c, 26, 10, 3, 2, pal.dark); pxr(c, 25, 8, 2, 2, pal.shade);
    // flame mane
    pxr(c, 9, 8, 3, 5, pal.light); pxr(c, 20, 8, 3, 5, pal.light);
    pxr(c, 9, 6, 2, 2, pal.hl); pxr(c, 21, 6, 2, 2, pal.hl);
    fillBlob(c, 16, 24, 5, 2, pal.belly);
    // horns + snout
    pxr(c, 11, 6, 2, 4, pal.dark); pxr(c, 19, 6, 2, 4, pal.dark);
    pxr(c, 21, 15, 4, 2, pal.base); pxr(c, 24, 15, 2, 1, pal.outline);
    // legs
    pxr(c, 11, 27, 3, 2, pal.shade); pxr(c, 18, 27, 3, 2, pal.shade);
    eyes(c, 13, 12, 18, 12, pal, 2);
    const f = (x, y) => (x - 16) * (x - 16) / 100 + (y - 21) * (y - 21) / 49 <= 1.05
                     || (x - 16) * (x - 16) / 49 + (y - 13) * (y - 13) / 25 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  // ---- WATER line: Aquip -> Tidalon -> Leviathorn ----
  aquip(c, pal) {
    // round little water creature with a shell-ish back
    fillBlob(c, 16, 19, 10, 8, pal.base);
    for (let y = 22; y < 28; y++)
      for (let x = 7; x < 26; x++)
        if ((x - 16) * (x - 16) / 100 + (y - 19) * (y - 19) / 64 <= 1.05)
          px(c, x, y, pal.shade);
    // shell back
    fillBlob(c, 16, 15, 8, 4, pal.dark);
    pxr(c, 12, 13, 8, 1, pal.shade); pxr(c, 14, 12, 4, 1, pal.shade);
    fillBlob(c, 16, 22, 6, 3, pal.belly);
    // tail
    pxr(c, 24, 19, 4, 3, pal.base); pxr(c, 27, 18, 2, 2, pal.light);
    // feet
    pxr(c, 10, 27, 4, 2, pal.shade); pxr(c, 18, 27, 4, 2, pal.shade);
    eyes(c, 12, 18, 19, 18, pal, 3);
    pxr(c, 14, 23, 4, 1, pal.outline);
    px(c, 14, 24, pal.outline); px(c, 17, 24, pal.outline);
    const f = (x, y) => (x - 16) * (x - 16) / 100 + (y - 19) * (y - 19) / 64 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  tidalon(c, pal) {
    // evolved turtle-aquatic with a ridged shell
    fillBlob(c, 16, 19, 11, 8, pal.base);
    for (let y = 22; y < 28; y++)
      for (let x = 6; x < 27; x++)
        if ((x - 16) * (x - 16) / 121 + (y - 19) * (y - 19) / 64 <= 1.05)
          px(c, x, y, pal.shade);
    // shell with ridges
    fillBlob(c, 16, 14, 9, 4, pal.dark);
    pxr(c, 11, 11, 10, 1, pal.shade);
    pxr(c, 13, 10, 6, 1, pal.shade);
    pxr(c, 15, 9, 2, 1, pal.light);
    // shell segments
    pxr(c, 11, 14, 1, 3, pal.shade); pxr(c, 16, 14, 1, 3, pal.shade); pxr(c, 20, 14, 1, 3, pal.shade);
    fillBlob(c, 16, 22, 6, 3, pal.belly);
    // flippers
    pxr(c, 6, 19, 3, 4, pal.shade); pxr(c, 23, 19, 3, 4, pal.shade);
    pxr(c, 6, 22, 3, 1, pal.dark); pxr(c, 23, 22, 3, 1, pal.dark);
    pxr(c, 10, 27, 4, 2, pal.shade); pxr(c, 18, 27, 4, 2, pal.shade);
    // head
    fillBlob(c, 16, 24, 5, 3, pal.base);
    eyes(c, 13, 22, 19, 22, pal, 2);
    pxr(c, 14, 27, 4, 1, pal.outline);
    const f = (x, y) => (x - 16) * (x - 16) / 121 + (y - 19) * (y - 19) / 64 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  leviathorn(c, pal) {
    // big sea dragon with a horned spire
    fillBlob(c, 15, 20, 12, 7, pal.base);
    for (let y = 23; y < 28; y++)
      for (let x = 4; x < 28; x++)
        if ((x - 15) * (x - 15) / 144 + (y - 20) * (y - 20) / 49 <= 1.05)
          px(c, x, y, pal.shade);
    // head
    fillBlob(c, 24, 15, 5, 5, pal.base);
    // horned spire on back
    pxr(c, 8, 8, 3, 6, pal.dark); pxr(c, 9, 5, 1, 3, pal.dark);
    pxr(c, 13, 9, 3, 5, pal.dark); pxr(c, 14, 6, 1, 3, pal.dark);
    pxr(c, 8, 13, 3, 1, pal.shade); pxr(c, 13, 13, 3, 1, pal.shade);
    fillBlob(c, 15, 23, 9, 2, pal.belly);
    // fins
    pxr(c, 4, 20, 3, 4, pal.shade); pxr(c, 27, 17, 2, 5, pal.shade);
    pxr(c, 4, 23, 3, 1, pal.dark);
    // tail
    pxr(c, 2, 21, 3, 3, pal.base); pxr(c, 1, 20, 1, 2, pal.light);
    eyes(c, 23, 13, null, null, pal, 0);
    pxr(c, 22, 13, 3, 3, pal.eye); px(c, 24, 13, pal.eyeShine);
    pxr(c, 28, 16, 2, 1, pal.outline);
    const f = (x, y) => (x - 15) * (x - 15) / 144 + (y - 20) * (y - 20) / 49 <= 1.05
                     || (x - 24) * (x - 24) / 25 + (y - 15) * (y - 15) / 25 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  // ---- GRASS line: Leafon -> Florahn -> Thornheart ----
  leafon(c, pal) {
    // sproutling with a big leaf on its head
    fillBlob(c, 16, 20, 9, 8, pal.base);
    for (let y = 23; y < 28; y++)
      for (let x = 8; x < 25; x++)
        if ((x - 16) * (x - 16) / 81 + (y - 20) * (y - 20) / 64 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 16, 23, 5, 3, pal.belly);
    // big leaf on head
    pxr(c, 14, 4, 5, 2, pal.light); pxr(c, 15, 2, 3, 2, pal.light);
    pxr(c, 16, 1, 1, 1, pal.hl);
    pxr(c, 14, 6, 5, 4, pal.base); pxr(c, 16, 6, 1, 4, pal.dark); // vein
    pxr(c, 14, 10, 5, 1, pal.shade);
    // feet
    pxr(c, 11, 27, 4, 2, pal.shade); pxr(c, 18, 27, 4, 2, pal.shade);
    pxr(c, 11, 28, 4, 1, pal.dark); pxr(c, 18, 28, 4, 1, pal.dark);
    eyes(c, 12, 18, 19, 18, pal, 3);
    pxr(c, 14, 24, 4, 1, pal.outline);
    px(c, 9, 21, pal.hl); px(c, 23, 21, pal.hl);
    const f = (x, y) => (x - 16) * (x - 16) / 81 + (y - 20) * (y - 20) / 64 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  florahn(c, pal) {
    // blooming plant creature with petals
    fillBlob(c, 16, 20, 10, 8, pal.base);
    for (let y = 23; y < 28; y++)
      for (let x = 7; x < 26; x++)
        if ((x - 16) * (x - 16) / 100 + (y - 20) * (y - 20) / 64 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 16, 23, 6, 3, pal.belly);
    // flower petals on head
    pxr(c, 11, 5, 4, 3, pal.light); pxr(c, 18, 5, 4, 3, pal.light);
    pxr(c, 15, 3, 4, 3, pal.light);
    pxr(c, 12, 6, 2, 1, pal.hl); pxr(c, 19, 6, 2, 1, pal.hl); pxr(c, 16, 4, 1, 1, pal.hl);
    // center
    pxr(c, 14, 7, 5, 3, "#f8d848"); pxr(c, 15, 8, 3, 1, "#f8b820");
    // leaves on sides
    pxr(c, 6, 17, 3, 4, pal.base); pxr(c, 5, 18, 1, 2, pal.light);
    pxr(c, 24, 17, 3, 4, pal.base); pxr(c, 27, 18, 1, 2, pal.light);
    // feet
    pxr(c, 11, 27, 4, 2, pal.shade); pxr(c, 18, 27, 4, 2, pal.shade);
    eyes(c, 12, 18, 19, 18, pal, 3);
    pxr(c, 14, 24, 4, 1, pal.outline);
    const f = (x, y) => (x - 16) * (x - 16) / 100 + (y - 20) * (y - 20) / 64 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  thornheart(c, pal) {
    // guardian with thorns and a glowing heart core
    fillBlob(c, 16, 20, 10, 8, pal.base);
    for (let y = 23; y < 28; y++)
      for (let x = 7; x < 26; x++)
        if ((x - 16) * (x - 16) / 100 + (y - 20) * (y - 20) / 64 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 16, 23, 6, 3, pal.belly);
    // thorns
    pxr(c, 7, 13, 2, 4, pal.dark); pxr(c, 23, 13, 2, 4, pal.dark);
    pxr(c, 5, 10, 2, 3, pal.dark); pxr(c, 25, 10, 2, 3, pal.dark);
    // glowing heart core
    pxr(c, 14, 18, 5, 4, "#f8a8c8");
    pxr(c, 15, 17, 3, 1, "#f8a8c8"); pxr(c, 15, 22, 3, 1, "#f8a8c8");
    pxr(c, 13, 19, 1, 2, "#f8c8d8"); pxr(c, 14, 19, 1, 1, "#fce0ec");
    pxr(c, 14, 17, 1, 1, "#d878a0");
    // head petals
    pxr(c, 12, 6, 3, 3, pal.light); pxr(c, 18, 6, 3, 3, pal.light);
    pxr(c, 15, 4, 3, 3, pal.light);
    pxr(c, 13, 7, 1, 1, pal.hl); pxr(c, 19, 7, 1, 1, pal.hl);
    // feet
    pxr(c, 11, 27, 4, 2, pal.shade); pxr(c, 18, 27, 4, 2, pal.shade);
    eyes(c, 12, 15, 19, 15, pal, 3);
    const f = (x, y) => (x - 16) * (x - 16) / 100 + (y - 20) * (y - 20) / 64 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  // ---- NORMAL: Rattick -> Rattigor ----
  rattick(c, pal) {
    // small rodent
    fillBlob(c, 18, 20, 8, 6, pal.base);
    for (let y = 22; y < 26; y++)
      for (let x = 11; x < 26; x++)
        if ((x - 18) * (x - 18) / 64 + (y - 20) * (y - 20) / 36 <= 1.05)
          px(c, x, y, pal.shade);
    // head
    fillBlob(c, 11, 17, 5, 4, pal.base);
    // ears
    pxr(c, 8, 11, 3, 3, pal.base); pxr(c, 14, 11, 3, 3, pal.base);
    pxr(c, 9, 11, 1, 2, pal.shade); pxr(c, 15, 11, 1, 2, pal.shade);
    // belly
    fillBlob(c, 18, 22, 5, 2, pal.belly);
    // tail
    pxr(c, 25, 18, 4, 1, pal.shade); pxr(c, 28, 17, 2, 1, pal.shade);
    // feet
    pxr(c, 14, 25, 3, 2, pal.shade); pxr(c, 20, 25, 3, 2, pal.shade);
    eyes(c, 9, 16, 13, 16, pal, 2);
    pxr(c, 6, 19, 3, 1, pal.outline); // snout
    px(c, 5, 19, pal.outline);
    // whisker dots
    px(c, 8, 19, pal.outline); px(c, 11, 20, pal.outline);
    const f = (x, y) => (x - 18) * (x - 18) / 64 + (y - 20) * (y - 20) / 36 <= 1.05
                     || (x - 11) * (x - 11) / 25 + (y - 17) * (y - 17) / 16 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  rattigor(c, pal) {
    // bigger rodent with prominent incisors
    fillBlob(c, 18, 20, 10, 7, pal.base);
    for (let y = 23; y < 27; y++)
      for (let x = 9; x < 28; x++)
        if ((x - 18) * (x - 18) / 100 + (y - 20) * (y - 20) / 49 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 11, 16, 6, 5, pal.base);
    for (let y = 18; y < 22; y++)
      for (let x = 6; x < 17; x++)
        if ((x - 11) * (x - 11) / 36 + (y - 16) * (y - 16) / 25 <= 1.05)
          px(c, x, y, pal.shade);
    // ears
    pxr(c, 7, 9, 4, 4, pal.base); pxr(c, 15, 9, 4, 4, pal.base);
    pxr(c, 8, 9, 2, 2, pal.shade); pxr(c, 16, 9, 2, 2, pal.shade);
    fillBlob(c, 18, 23, 6, 2, pal.belly);
    // tail
    pxr(c, 27, 16, 4, 2, pal.shade); pxr(c, 30, 15, 1, 1, pal.shade);
    // feet
    pxr(c, 13, 26, 4, 2, pal.shade); pxr(c, 21, 26, 4, 2, pal.shade);
    eyes(c, 8, 15, 14, 15, pal, 2);
    // big incisors
    pxr(c, 5, 19, 2, 3, "#f8f8e8"); pxr(c, 7, 19, 2, 3, "#f8f8e8");
    pxr(c, 5, 21, 2, 1, pal.outline); pxr(c, 7, 21, 2, 1, pal.outline);
    const f = (x, y) => (x - 18) * (x - 18) / 100 + (y - 20) * (y - 20) / 49 <= 1.05
                     || (x - 11) * (x - 11) / 36 + (y - 16) * (y - 16) / 25 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  // ---- ELECTRIC: Sparkit -> Voltagon -> Stormoxen ----
  sparkit(c, pal) {
    fillBlob(c, 16, 20, 9, 8, pal.base);
    for (let y = 23; y < 28; y++)
      for (let x = 8; x < 25; x++)
        if ((x - 16) * (x - 16) / 81 + (y - 20) * (y - 20) / 64 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 16, 23, 5, 3, pal.belly);
    // lightning-bolt ears
    pxr(c, 10, 6, 2, 5, pal.base); pxr(c, 11, 4, 1, 2, pal.light);
    pxr(c, 12, 6, 1, 3, pal.hl);
    pxr(c, 20, 6, 2, 5, pal.base); pxr(c, 20, 4, 1, 2, pal.light);
    pxr(c, 19, 6, 1, 3, pal.hl);
    // zig-zag tail
    pxr(c, 24, 22, 3, 2, pal.base); pxr(c, 26, 19, 2, 3, pal.base); pxr(c, 28, 17, 1, 2, pal.light);
    // feet
    pxr(c, 11, 27, 4, 2, pal.shade); pxr(c, 18, 27, 4, 2, pal.shade);
    // cheek sparks
    px(c, 10, 20, pal.hl); px(c, 22, 20, pal.hl);
    pxr(c, 9, 19, 1, 1, pal.hl); pxr(c, 23, 19, 1, 1, pal.hl);
    eyes(c, 12, 18, 19, 18, pal, 3);
    pxr(c, 14, 24, 4, 1, pal.outline);
    const f = (x, y) => (x - 16) * (x - 16) / 81 + (y - 20) * (y - 20) / 64 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  voltagon(c, pal) {
    fillBlob(c, 16, 20, 10, 7, pal.base);
    for (let y = 23; y < 27; y++)
      for (let x = 7; x < 26; x++)
        if ((x - 16) * (x - 16) / 100 + (y - 20) * (y - 20) / 49 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 16, 23, 6, 2, pal.belly);
    // bolt ears + mane
    pxr(c, 8, 6, 3, 6, pal.base); pxr(c, 9, 4, 1, 2, pal.light);
    pxr(c, 21, 6, 3, 6, pal.base); pxr(c, 21, 4, 1, 2, pal.light);
    pxr(c, 10, 8, 4, 2, pal.light); pxr(c, 18, 8, 4, 2, pal.light);
    // lightning tail
    pxr(c, 25, 20, 3, 3, pal.base); pxr(c, 27, 16, 2, 4, pal.light); pxr(c, 28, 14, 1, 2, pal.hl);
    // legs
    pxr(c, 10, 26, 3, 3, pal.shade); pxr(c, 19, 26, 3, 3, pal.shade);
    pxr(c, 10, 28, 3, 1, pal.dark); pxr(c, 19, 28, 3, 1, pal.dark);
    // cheek pouches (electric sacs)
    pxr(c, 8, 19, 3, 3, "#f8d848"); pxr(c, 21, 19, 3, 3, "#f8d848");
    pxr(c, 9, 20, 1, 1, "#fff8a8");
    eyes(c, 12, 17, 19, 17, pal, 2);
    pxr(c, 14, 22, 4, 1, pal.outline);
    const f = (x, y) => (x - 16) * (x - 16) / 100 + (y - 20) * (y - 20) / 49 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  stormoxen(c, pal) {
    // thundering ox beast
    fillBlob(c, 16, 21, 11, 7, pal.base);
    for (let y = 24; y < 28; y++)
      for (let x = 6; x < 27; x++)
        if ((x - 16) * (x - 16) / 121 + (y - 21) * (y - 21) / 49 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 16, 24, 6, 2, pal.belly);
    // head
    fillBlob(c, 16, 14, 8, 5, pal.base);
    for (let y = 16; y < 20; y++)
      for (let x = 9; x < 24; x++)
        if ((x - 16) * (x - 16) / 64 + (y - 14) * (y - 14) / 25 <= 1.05)
          px(c, x, y, pal.shade);
    // horns
    pxr(c, 8, 9, 3, 2, pal.dark); pxr(c, 6, 7, 3, 2, pal.dark); pxr(c, 5, 6, 2, 1, pal.dark);
    pxr(c, 21, 9, 3, 2, pal.dark); pxr(c, 23, 7, 3, 2, pal.dark); pxr(c, 25, 6, 2, 1, pal.dark);
    // lightning mane
    pxr(c, 12, 10, 2, 3, pal.light); pxr(c, 18, 10, 2, 3, pal.light);
    pxr(c, 13, 8, 1, 2, pal.hl); pxr(c, 19, 8, 1, 2, pal.hl);
    // legs (stocky)
    pxr(c, 9, 26, 4, 3, pal.shade); pxr(c, 19, 26, 4, 3, pal.shade);
    pxr(c, 9, 28, 4, 1, pal.dark); pxr(c, 19, 28, 4, 1, pal.dark);
    eyes(c, 12, 13, 19, 13, pal, 2);
    pxr(c, 14, 17, 4, 1, pal.outline); // muzzle line
    const f = (x, y) => (x - 16) * (x - 16) / 121 + (y - 21) * (y - 21) / 49 <= 1.05
                     || (x - 16) * (x - 16) / 64 + (y - 14) * (y - 14) / 25 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  // ---- GROUND: Digmole -> Terramole ----
  digmole(c, pal) {
    fillBlob(c, 16, 20, 9, 7, pal.base);
    for (let y = 23; y < 27; y++)
      for (let x = 8; x < 25; x++)
        if ((x - 16) * (x - 16) / 81 + (y - 20) * (y - 20) / 49 <= 1.05)
          px(c, x, y, pal.shade);
    // big claws/hands
    pxr(c, 6, 18, 4, 5, pal.base); pxr(c, 22, 18, 4, 5, pal.base);
    pxr(c, 5, 17, 2, 1, pal.light); pxr(c, 25, 17, 2, 1, pal.light);
    // claw tips
    pxr(c, 6, 22, 1, 2, pal.dark); pxr(c, 8, 22, 1, 2, pal.dark);
    pxr(c, 23, 22, 1, 2, pal.dark); pxr(c, 25, 22, 1, 2, pal.dark);
    // belly
    fillBlob(c, 16, 23, 4, 2, pal.belly);
    // snout
    pxr(c, 13, 17, 6, 3, pal.base); pxr(c, 14, 19, 4, 1, pal.shade);
    pxr(c, 15, 19, 2, 1, pal.outline); // nose
    eyes(c, 12, 15, 19, 15, pal, 2);
    pxr(c, 11, 27, 4, 2, pal.shade); pxr(c, 18, 27, 4, 2, pal.shade);
    const f = (x, y) => (x - 16) * (x - 16) / 81 + (y - 20) * (y - 20) / 49 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  terramole(c, pal) {
    fillBlob(c, 16, 20, 11, 8, pal.base);
    for (let y = 23; y < 28; y++)
      for (let x = 6; x < 27; x++)
        if ((x - 16) * (x - 16) / 121 + (y - 20) * (y - 20) / 64 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 16, 23, 6, 3, pal.belly);
    // rocky back plates
    pxr(c, 9, 12, 14, 4, pal.dark);
    pxr(c, 11, 10, 10, 2, pal.shade);
    pxr(c, 13, 9, 6, 1, pal.light);
    // plate cracks
    pxr(c, 12, 13, 1, 3, pal.outline); pxr(c, 20, 13, 1, 3, pal.outline);
    // big claws
    pxr(c, 4, 19, 5, 5, pal.base); pxr(c, 23, 19, 5, 5, pal.base);
    pxr(c, 4, 17, 2, 1, pal.light); pxr(c, 26, 17, 2, 1, pal.light);
    pxr(c, 4, 23, 2, 2, pal.dark); pxr(c, 26, 23, 2, 2, pal.dark);
    // legs
    pxr(c, 10, 27, 4, 2, pal.shade); pxr(c, 18, 27, 4, 2, pal.shade);
    eyes(c, 12, 17, 19, 17, pal, 2);
    pxr(c, 14, 21, 4, 1, pal.outline);
    const f = (x, y) => (x - 16) * (x - 16) / 121 + (y - 20) * (y - 20) / 64 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  // ---- FLYING: Breezel -> Galewing ----
  breezel(c, pal) {
    // small bird
    fillBlob(c, 16, 19, 8, 7, pal.base);
    for (let y = 22; y < 26; y++)
      for (let x = 9; x < 24; x++)
        if ((x - 16) * (x - 16) / 64 + (y - 19) * (y - 19) / 49 <= 1.05)
          px(c, x, y, pal.shade);
    // belly
    fillBlob(c, 16, 21, 5, 3, pal.belly);
    // wings
    pxr(c, 6, 16, 6, 4, pal.base); pxr(c, 5, 17, 2, 2, pal.light);
    pxr(c, 20, 16, 6, 4, pal.base); pxr(c, 25, 17, 2, 2, pal.light);
    pxr(c, 6, 19, 6, 1, pal.dark); pxr(c, 20, 19, 6, 1, pal.dark);
    // head feathers
    pxr(c, 14, 8, 2, 3, pal.base); pxr(c, 16, 7, 2, 3, pal.base);
    pxr(c, 14, 8, 1, 1, pal.light);
    // beak
    pxr(c, 15, 17, 3, 2, "#f8b820"); pxr(c, 16, 18, 1, 1, "#d88810");
    // feet
    pxr(c, 13, 26, 2, 2, pal.dark); pxr(c, 18, 26, 2, 2, pal.dark);
    eyes(c, 13, 14, 18, 14, pal, 2);
    const f = (x, y) => (x - 16) * (x - 16) / 64 + (y - 19) * (y - 19) / 49 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  galewing(c, pal) {
    // large soaring bird
    fillBlob(c, 16, 20, 9, 7, pal.base);
    for (let y = 23; y < 27; y++)
      for (let x = 8; x < 25; x++)
        if ((x - 16) * (x - 16) / 81 + (y - 20) * (y - 20) / 49 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 16, 22, 5, 3, pal.belly);
    // big wings spread
    pxr(c, 2, 15, 8, 3, pal.base); pxr(c, 3, 13, 4, 2, pal.light); pxr(c, 1, 16, 3, 1, pal.dark);
    pxr(c, 22, 15, 8, 3, pal.base); pxr(c, 25, 13, 4, 2, pal.light); pxr(c, 28, 16, 3, 1, pal.dark);
    // wing feather lines
    pxr(c, 4, 17, 5, 1, pal.dark); pxr(c, 23, 17, 5, 1, pal.dark);
    // head crest
    pxr(c, 13, 7, 2, 4, pal.base); pxr(c, 16, 6, 2, 4, pal.base); pxr(c, 15, 5, 1, 1, pal.light);
    // beak
    pxr(c, 14, 16, 4, 2, "#f8b820"); pxr(c, 15, 17, 2, 1, "#d88810");
    // tail
    pxr(c, 14, 26, 5, 3, pal.base); pxr(c, 16, 28, 1, 1, pal.shade);
    eyes(c, 13, 14, 18, 14, pal, 2);
    const f = (x, y) => (x - 16) * (x - 16) / 81 + (y - 20) * (y - 20) / 49 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  // ---- POISON/BUG: Toxipod -> Venomoth ----
  toxipod(c, pal) {
    // spiky grub
    fillBlob(c, 16, 19, 9, 8, pal.base);
    for (let y = 22; y < 27; y++)
      for (let x = 8; x < 25; x++)
        if ((x - 16) * (x - 16) / 81 + (y - 19) * (y - 19) / 64 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 16, 22, 5, 3, pal.belly);
    // poison spikes
    pxr(c, 8, 11, 2, 4, pal.dark); pxr(c, 22, 11, 2, 4, pal.dark);
    pxr(c, 11, 9, 2, 3, pal.dark); pxr(c, 19, 9, 2, 3, pal.dark);
    pxr(c, 14, 7, 2, 3, pal.dark); pxr(c, 16, 7, 2, 3, pal.dark);
    // segment bands
    pxr(c, 11, 18, 10, 1, pal.dark); pxr(c, 11, 22, 10, 1, pal.dark);
    // little legs
    pxr(c, 7, 24, 2, 2, pal.shade); pxr(c, 23, 24, 2, 2, pal.shade);
    pxr(c, 9, 26, 2, 2, pal.shade); pxr(c, 21, 26, 2, 2, pal.shade);
    eyes(c, 12, 16, 19, 16, pal, 2);
    pxr(c, 14, 21, 4, 1, pal.outline);
    const f = (x, y) => (x - 16) * (x - 16) / 81 + (y - 19) * (y - 19) / 64 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  venomoth(c, pal) {
    // moth with big wings
    // body
    pxr(c, 15, 12, 3, 16, pal.base);
    pxr(c, 15, 18, 3, 10, pal.shade);
    // wings (upper, larger)
    fillBlob(c, 9, 14, 6, 6, pal.base);
    fillBlob(c, 23, 14, 6, 6, pal.base);
    for (let y = 16; y < 20; y++)
      for (let x = 3; x < 16; x++)
        if ((x - 9) * (x - 9) / 36 + (y - 14) * (y - 14) / 36 <= 1.05)
          px(c, x, y, pal.shade);
    for (let y = 16; y < 20; y++)
      for (let x = 17; x < 30; x++)
        if ((x - 23) * (x - 23) / 36 + (y - 14) * (y - 14) / 36 <= 1.05)
          px(c, x, y, pal.shade);
    // wing eye-spots
    pxr(c, 8, 15, 3, 3, pal.dark); px(c, 9, 16, pal.hl);
    pxr(c, 21, 15, 3, 3, pal.dark); px(c, 22, 16, pal.hl);
    // wing edges
    pxr(c, 4, 13, 2, 1, pal.light); pxr(c, 26, 13, 2, 1, pal.light);
    // antennae
    pxr(c, 13, 8, 1, 3, pal.dark); pxr(c, 18, 8, 1, 3, pal.dark);
    pxr(c, 12, 7, 2, 1, pal.dark); pxr(c, 18, 7, 2, 1, pal.dark);
    // eyes
    eyes(c, 14, 13, 17, 13, pal, 1);
    const f = (x, y) => (x - 9) * (x - 9) / 36 + (y - 14) * (y - 14) / 36 <= 1.05
                     || (x - 23) * (x - 23) / 36 + (y - 14) * (y - 14) / 36 <= 1.05
                     || (x >= 15 && x <= 17 && y >= 12 && y <= 27);
    outlineRegion(c, f, pal.outline);
  },

  // ---- ICE: Frostip -> Glaciorn ----
  frostip(c, pal) {
    fillBlob(c, 16, 20, 9, 8, pal.base);
    for (let y = 23; y < 28; y++)
      for (let x = 8; x < 25; x++)
        if ((x - 16) * (x - 16) / 81 + (y - 20) * (y - 20) / 64 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 16, 23, 5, 3, pal.belly);
    // ice crystal on head
    pxr(c, 14, 5, 5, 2, "#b8e8f8"); pxr(c, 15, 3, 3, 2, "#b8e8f8"); pxr(c, 16, 1, 1, 2, "#e0f8ff");
    pxr(c, 14, 7, 5, 4, "#88c8e8"); pxr(c, 16, 7, 1, 4, "#58a8d8");
    // ice shards on back
    pxr(c, 8, 14, 2, 4, "#88c8e8"); pxr(c, 22, 14, 2, 4, "#88c8e8");
    pxr(c, 8, 12, 1, 2, "#b8e8f8"); pxr(c, 23, 12, 1, 2, "#b8e8f8");
    // feet
    pxr(c, 11, 27, 4, 2, pal.shade); pxr(c, 18, 27, 4, 2, pal.shade);
    eyes(c, 12, 18, 19, 18, pal, 3);
    pxr(c, 14, 24, 4, 1, pal.outline);
    px(c, 11, 21, pal.hl); px(c, 21, 21, pal.hl); // frost glints
    const f = (x, y) => (x - 16) * (x - 16) / 81 + (y - 20) * (y - 20) / 64 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  glaciorn(c, pal) {
    // majestic frost beast with a horn
    fillBlob(c, 16, 21, 10, 7, pal.base);
    for (let y = 24; y < 28; y++)
      for (let x = 7; x < 26; x++)
        if ((x - 16) * (x - 16) / 100 + (y - 21) * (y - 21) / 49 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 16, 24, 5, 2, pal.belly);
    // head
    fillBlob(c, 16, 14, 7, 5, pal.base);
    // spiral ice horn
    pxr(c, 16, 4, 2, 6, "#b8e8f8"); pxr(c, 15, 3, 1, 2, "#b8e8f8"); pxr(c, 17, 3, 1, 2, "#b8e8f8");
    pxr(c, 16, 2, 1, 1, "#e0f8ff");
    pxr(c, 16, 7, 2, 1, "#58a8d8");
    // mane of frost
    pxr(c, 9, 11, 4, 4, "#88c8e8"); pxr(c, 19, 11, 4, 4, "#88c8e8");
    pxr(c, 10, 9, 2, 2, "#b8e8f8"); pxr(c, 20, 9, 2, 2, "#b8e8f8");
    // legs
    pxr(c, 10, 26, 3, 3, pal.shade); pxr(c, 19, 26, 3, 3, pal.shade);
    pxr(c, 10, 28, 3, 1, pal.dark); pxr(c, 19, 28, 3, 1, pal.dark);
    eyes(c, 13, 13, 18, 13, pal, 2);
    pxr(c, 21, 16, 2, 1, pal.outline);
    const f = (x, y) => (x - 16) * (x - 16) / 100 + (y - 21) * (y - 21) / 49 <= 1.05
                     || (x - 16) * (x - 16) / 49 + (y - 14) * (y - 14) / 25 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  // ---- ROCK: Pebblix -> Bouldron ----
  pebblix(c, pal) {
    // round rocky creature
    fillBlob(c, 16, 19, 10, 8, pal.base);
    for (let y = 22; y < 27; y++)
      for (let x = 7; x < 26; x++)
        if ((x - 16) * (x - 16) / 100 + (y - 19) * (y - 19) / 64 <= 1.05)
          px(c, x, y, pal.shade);
    // rocky bumps
    pxr(c, 10, 11, 4, 3, pal.shade); pxr(c, 18, 11, 4, 3, pal.shade);
    pxr(c, 14, 9, 4, 3, pal.shade);
    pxr(c, 11, 10, 2, 1, pal.dark); pxr(c, 19, 10, 2, 1, pal.dark); pxr(c, 15, 8, 2, 1, pal.dark);
    // cracks
    pxr(c, 11, 17, 1, 4, pal.outline); pxr(c, 21, 17, 1, 4, pal.outline);
    pxr(c, 13, 22, 6, 1, pal.outline);
    // arms
    pxr(c, 5, 18, 3, 4, pal.shade); pxr(c, 24, 18, 3, 4, pal.shade);
    // feet
    pxr(c, 10, 27, 4, 2, pal.shade); pxr(c, 18, 27, 4, 2, pal.shade);
    eyes(c, 12, 17, 19, 17, pal, 2);
    pxr(c, 14, 22, 4, 1, pal.outline);
    const f = (x, y) => (x - 16) * (x - 16) / 100 + (y - 19) * (y - 19) / 64 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  bouldron(c, pal) {
    // big boulder beast
    fillBlob(c, 16, 20, 11, 8, pal.base);
    for (let y = 23; y < 28; y++)
      for (let x = 6; x < 27; x++)
        if ((x - 16) * (x - 16) / 121 + (y - 20) * (y - 20) / 64 <= 1.05)
          px(c, x, y, pal.shade);
    // big rocky back
    pxr(c, 8, 9, 16, 6, pal.shade);
    pxr(c, 10, 7, 12, 3, pal.dark);
    pxr(c, 12, 6, 8, 2, pal.shade);
    // cracks
    pxr(c, 10, 11, 1, 4, pal.outline); pxr(c, 16, 10, 1, 5, pal.outline); pxr(c, 22, 11, 1, 4, pal.outline);
    pxr(c, 11, 14, 10, 1, pal.outline);
    // arms (big)
    pxr(c, 3, 17, 5, 6, pal.shade); pxr(c, 24, 17, 5, 6, pal.shade);
    pxr(c, 3, 22, 5, 1, pal.dark); pxr(c, 24, 22, 5, 1, pal.dark);
    // legs
    pxr(c, 9, 27, 5, 2, pal.shade); pxr(c, 18, 27, 5, 2, pal.shade);
    eyes(c, 12, 17, 19, 17, pal, 2);
    pxr(c, 14, 22, 4, 1, pal.outline);
    const f = (x, y) => (x - 16) * (x - 16) / 121 + (y - 20) * (y - 20) / 64 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  // ---- BUG/WATER: Carpox -> Silkmoth ----
  carpox(c, pal) {
    // fish grub
    fillBlob(c, 16, 18, 11, 6, pal.base);
    for (let y = 20; y < 25; y++)
      for (let x = 6; x < 27; x++)
        if ((x - 16) * (x - 16) / 121 + (y - 18) * (y - 18) / 36 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 16, 21, 9, 2, pal.belly);
    // big eyes (carp-like)
    pxr(c, 8, 15, 4, 4, "#f8f8e8"); pxr(c, 9, 16, 2, 2, pal.eye);
    pxr(c, 22, 15, 4, 4, "#f8f8e8"); pxr(c, 23, 16, 2, 2, pal.eye);
    // barbels
    pxr(c, 6, 21, 3, 1, pal.shade); pxr(c, 23, 21, 3, 1, pal.shade);
    // tail
    pxr(c, 26, 16, 2, 6, pal.base); pxr(c, 28, 14, 1, 3, pal.light); pxr(c, 28, 22, 1, 3, pal.light);
    // scales
    pxr(c, 13, 17, 1, 1, pal.hl); pxr(c, 17, 17, 1, 1, pal.hl); pxr(c, 21, 17, 1, 1, pal.hl);
    const f = (x, y) => (x - 16) * (x - 16) / 121 + (y - 18) * (y - 18) / 36 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  silkmoth(c, pal) {
    // elegant moth
    pxr(c, 15, 11, 3, 18, pal.base);
    pxr(c, 15, 17, 3, 12, pal.shade);
    // wings
    fillBlob(c, 8, 13, 7, 7, pal.base);
    fillBlob(c, 24, 13, 7, 7, pal.base);
    for (let y = 15; y < 20; y++)
      for (let x = 2; x < 15; x++)
        if ((x - 8) * (x - 8) / 49 + (y - 13) * (y - 13) / 49 <= 1.05)
          px(c, x, y, pal.shade);
    for (let y = 15; y < 20; y++)
      for (let x = 17; x < 30; x++)
        if ((x - 24) * (x - 24) / 49 + (y - 13) * (y - 13) / 49 <= 1.05)
          px(c, x, y, pal.shade);
    // wing patterns (golden silk)
    pxr(c, 7, 14, 2, 1, pal.hl); pxr(c, 23, 14, 2, 1, pal.hl);
    pxr(c, 6, 17, 3, 1, pal.hl); pxr(c, 23, 17, 3, 1, pal.hl);
    pxr(c, 9, 16, 2, 2, "#f8d848"); pxr(c, 21, 16, 2, 2, "#f8d848");
    // antennae (feathery)
    pxr(c, 13, 7, 1, 3, pal.dark); pxr(c, 12, 6, 2, 1, pal.dark); pxr(c, 11, 7, 1, 1, pal.dark);
    pxr(c, 18, 7, 1, 3, pal.dark); pxr(c, 19, 6, 2, 1, pal.dark); pxr(c, 20, 7, 1, 1, pal.dark);
    eyes(c, 14, 12, 17, 12, pal, 1);
    const f = (x, y) => (x - 8) * (x - 8) / 49 + (y - 13) * (y - 13) / 49 <= 1.05
                     || (x - 24) * (x - 24) / 49 + (y - 13) * (y - 13) / 49 <= 1.05
                     || (x >= 15 && x <= 17 && y >= 11 && y <= 28);
    outlineRegion(c, f, pal.outline);
  },

  // ---- PSYCHIC: Mindrill -> Oraculon ----
  mindrill(c, pal) {
    fillBlob(c, 16, 20, 9, 8, pal.base);
    for (let y = 23; y < 28; y++)
      for (let x = 8; x < 25; x++)
        if ((x - 16) * (x - 16) / 81 + (y - 20) * (y - 20) / 64 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 16, 23, 5, 3, pal.belly);
    // spiral / drill horn on head
    pxr(c, 14, 8, 5, 2, pal.dark); pxr(c, 15, 6, 3, 2, pal.dark); pxr(c, 16, 4, 1, 2, pal.light);
    pxr(c, 14, 10, 5, 2, pal.shade);
    // third eye (psychic)
    pxr(c, 15, 14, 3, 2, "#f85888"); px(c, 16, 15, "#f8a8c8");
    // little arms
    pxr(c, 7, 19, 2, 4, pal.shade); pxr(c, 24, 19, 2, 4, pal.shade);
    pxr(c, 11, 27, 4, 2, pal.shade); pxr(c, 18, 27, 4, 2, pal.shade);
    eyes(c, 12, 18, 19, 18, pal, 2);
    pxr(c, 14, 24, 4, 1, pal.outline);
    const f = (x, y) => (x - 16) * (x - 16) / 81 + (y - 20) * (y - 20) / 64 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  oraculon(c, pal) {
    fillBlob(c, 16, 20, 10, 8, pal.base);
    for (let y = 23; y < 28; y++)
      for (let x = 7; x < 26; x++)
        if ((x - 16) * (x - 16) / 100 + (y - 20) * (y - 20) / 64 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 16, 23, 6, 3, pal.belly);
    // ornate head with crown
    fillBlob(c, 16, 13, 7, 5, pal.base);
    pxr(c, 11, 7, 2, 4, pal.dark); pxr(c, 15, 5, 2, 5, pal.dark); pxr(c, 19, 7, 2, 4, pal.dark);
    pxr(c, 11, 6, 1, 1, pal.light); pxr(c, 15, 4, 1, 1, pal.light); pxr(c, 20, 6, 1, 1, pal.light);
    // jewel (third eye)
    pxr(c, 15, 13, 3, 2, "#f85888"); px(c, 16, 14, "#f8d8e8");
    // floating orbs
    pxr(c, 5, 14, 2, 2, pal.hl); pxr(c, 25, 14, 2, 2, pal.hl);
    // arms
    pxr(c, 6, 19, 2, 4, pal.shade); pxr(c, 24, 19, 2, 4, pal.shade);
    pxr(c, 11, 27, 4, 2, pal.shade); pxr(c, 18, 27, 4, 2, pal.shade);
    eyes(c, 12, 16, 19, 16, pal, 2);
    pxr(c, 14, 22, 4, 1, pal.outline);
    const f = (x, y) => (x - 16) * (x - 16) / 100 + (y - 20) * (y - 20) / 64 <= 1.05
                     || (x - 16) * (x - 16) / 49 + (y - 13) * (y - 13) / 25 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  // ---- GHOST/FIRE: Wispup -> Spectral ----
  wispup(c, pal) {
    // ghostly flame blob
    fillBlob(c, 16, 19, 9, 9, pal.base);
    for (let y = 23; y < 28; y++)
      for (let x = 8; x < 25; x++)
        if ((x - 16) * (x - 16) / 81 + (y - 19) * (y - 19) / 81 <= 1.05)
          px(c, x, y, pal.shade);
    // wavy bottom (ghost tail)
    pxr(c, 9, 27, 3, 1, pal.base); pxr(c, 14, 28, 4, 1, pal.base); pxr(c, 20, 27, 3, 1, pal.base);
    // flame top
    pxr(c, 13, 6, 6, 3, pal.light); pxr(c, 14, 4, 4, 2, pal.light); pxr(c, 16, 2, 1, 2, pal.hl);
    // hollow ghost eyes
    pxr(c, 12, 16, 3, 4, pal.eye); pxr(c, 19, 16, 3, 4, pal.eye);
    pxr(c, 13, 17, 1, 2, pal.eyeShine); pxr(c, 20, 17, 1, 2, pal.eyeShine);
    // tiny mouth
    pxr(c, 15, 22, 3, 1, pal.outline);
    const f = (x, y) => (x - 16) * (x - 16) / 81 + (y - 19) * (y - 19) / 81 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  spectral(c, pal) {
    // larger ghost with flames
    fillBlob(c, 16, 18, 11, 10, pal.base);
    for (let y = 23; y < 28; y++)
      for (let x = 6; x < 27; x++)
        if ((x - 16) * (x - 16) / 121 + (y - 18) * (y - 18) / 100 <= 1.05)
          px(c, x, y, pal.shade);
    // ghostly tail
    pxr(c, 7, 27, 3, 1, pal.base); pxr(c, 12, 28, 3, 1, pal.base); pxr(c, 18, 28, 3, 1, pal.base); pxr(c, 23, 27, 3, 1, pal.base);
    // flame mane
    pxr(c, 8, 7, 3, 6, pal.light); pxr(c, 21, 7, 3, 6, pal.light);
    pxr(c, 9, 5, 1, 2, pal.hl); pxr(c, 22, 5, 1, 2, pal.hl);
    pxr(c, 12, 5, 3, 3, pal.light); pxr(c, 17, 5, 3, 3, pal.light);
    // arms (ghostly)
    pxr(c, 4, 16, 3, 3, pal.base); pxr(c, 25, 16, 3, 3, pal.base);
    // hollow eyes
    pxr(c, 12, 15, 3, 5, pal.eye); pxr(c, 18, 15, 3, 5, pal.eye);
    pxr(c, 13, 16, 1, 3, pal.eyeShine); pxr(c, 19, 16, 1, 3, pal.eyeShine);
    // mouth
    pxr(c, 14, 23, 5, 2, pal.outline); pxr(c, 15, 24, 3, 1, pal.eye);
    const f = (x, y) => (x - 16) * (x - 16) / 121 + (y - 18) * (y - 18) / 100 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  // ---- DARK: Shadepup -> Nightmere ----
  shadepup(c, pal) {
    // dark pup
    fillBlob(c, 16, 21, 9, 7, pal.base);
    for (let y = 24; y < 28; y++)
      for (let x = 8; x < 25; x++)
        if ((x - 16) * (x - 16) / 81 + (y - 21) * (y - 21) / 49 <= 1.05)
          px(c, x, y, pal.shade);
    // head
    fillBlob(c, 16, 15, 7, 5, pal.base);
    for (let y = 17; y < 20; y++)
      for (let x = 10; x < 23; x++)
        if ((x - 16) * (x - 16) / 49 + (y - 15) * (y - 15) / 25 <= 1.05)
          px(c, x, y, pal.shade);
    // pointed ears
    pxr(c, 10, 8, 2, 4, pal.dark); pxr(c, 20, 8, 2, 4, pal.dark);
    // legs
    pxr(c, 11, 27, 3, 2, pal.shade); pxr(c, 18, 27, 3, 2, pal.shade);
    // glowing eyes
    pxr(c, 12, 14, 3, 2, "#f8d848"); pxr(c, 18, 14, 3, 2, "#f8d848");
    px(c, 13, 15, "#fff8a8"); px(c, 19, 15, "#fff8a8");
    // fangs
    pxr(c, 14, 18, 1, 2, "#f8f8e8"); pxr(c, 17, 18, 1, 2, "#f8f8e8");
    // tail
    pxr(c, 24, 20, 4, 2, pal.shade); pxr(c, 27, 19, 2, 1, pal.shade);
    const f = (x, y) => (x - 16) * (x - 16) / 81 + (y - 21) * (y - 21) / 49 <= 1.05
                     || (x - 16) * (x - 16) / 49 + (y - 15) * (y - 15) / 25 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  nightmere(c, pal) {
    // dark nightmare beast
    fillBlob(c, 16, 21, 11, 7, pal.base);
    for (let y = 24; y < 28; y++)
      for (let x = 6; x < 27; x++)
        if ((x - 16) * (x - 16) / 121 + (y - 21) * (y - 21) / 49 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 16, 13, 8, 5, pal.base);
    for (let y = 15; y < 19; y++)
      for (let x = 9; x < 24; x++)
        if ((x - 16) * (x - 16) / 64 + (y - 13) * (y - 13) / 25 <= 1.05)
          px(c, x, y, pal.shade);
    // big curved horns
    pxr(c, 8, 8, 3, 2, pal.dark); pxr(c, 6, 6, 3, 2, pal.dark); pxr(c, 5, 5, 2, 1, pal.dark);
    pxr(c, 21, 8, 3, 2, pal.dark); pxr(c, 23, 6, 3, 2, pal.dark); pxr(c, 25, 5, 2, 1, pal.dark);
    // shadowy mane
    pxr(c, 10, 10, 12, 3, pal.dark);
    // legs
    pxr(c, 9, 26, 4, 3, pal.shade); pxr(c, 19, 26, 4, 3, pal.shade);
    pxr(c, 9, 28, 4, 1, pal.dark); pxr(c, 19, 28, 4, 1, pal.dark);
    // glowing eyes
    pxr(c, 12, 13, 3, 3, "#f8d848"); pxr(c, 18, 13, 3, 3, "#f8d848");
    pxr(c, 13, 13, 1, 1, "#fff8a8"); pxr(c, 19, 13, 1, 1, "#fff8a8");
    // fangs
    pxr(c, 14, 17, 1, 3, "#f8f8e8"); pxr(c, 17, 17, 1, 3, "#f8f8e8");
    const f = (x, y) => (x - 16) * (x - 16) / 121 + (y - 21) * (y - 21) / 49 <= 1.05
                     || (x - 16) * (x - 16) / 64 + (y - 13) * (y - 13) / 25 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  // ---- DRAGON: Drakeling -> Wyrmking ----
  drakeling(c, pal) {
    // small dragon
    fillBlob(c, 16, 20, 9, 7, pal.base);
    for (let y = 23; y < 27; y++)
      for (let x = 8; x < 25; x++)
        if ((x - 16) * (x - 16) / 81 + (y - 20) * (y - 20) / 49 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 16, 23, 5, 2, pal.belly);
    fillBlob(c, 16, 13, 6, 5, pal.base);
    // little wings
    pxr(c, 7, 14, 5, 3, pal.shade); pxr(c, 6, 12, 2, 2, pal.dark);
    pxr(c, 20, 14, 5, 3, pal.shade); pxr(c, 24, 12, 2, 2, pal.dark);
    // horns
    pxr(c, 12, 7, 2, 3, pal.dark); pxr(c, 18, 7, 2, 3, pal.dark);
    // tail
    pxr(c, 24, 21, 5, 2, pal.base); pxr(c, 28, 20, 2, 2, pal.light);
    // legs
    pxr(c, 11, 26, 3, 2, pal.shade); pxr(c, 18, 26, 3, 2, pal.shade);
    eyes(c, 13, 13, 18, 13, pal, 2);
    pxr(c, 21, 16, 2, 1, pal.outline);
    const f = (x, y) => (x - 16) * (x - 16) / 81 + (y - 20) * (y - 20) / 49 <= 1.05
                     || (x - 16) * (x - 16) / 36 + (y - 13) * (y - 13) / 25 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  wyrmking(c, pal) {
    // grand dragon
    fillBlob(c, 16, 21, 11, 7, pal.base);
    for (let y = 24; y < 28; y++)
      for (let x = 6; x < 27; x++)
        if ((x - 16) * (x - 16) / 121 + (y - 21) * (y - 21) / 49 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 16, 24, 6, 2, pal.belly);
    fillBlob(c, 16, 13, 8, 5, pal.base);
    for (let y = 15; y < 19; y++)
      for (let x = 9; x < 24; x++)
        if ((x - 16) * (x - 16) / 64 + (y - 13) * (y - 13) / 25 <= 1.05)
          px(c, x, y, pal.shade);
    // big wings
    pxr(c, 3, 13, 7, 3, pal.shade); pxr(c, 2, 10, 3, 3, pal.dark); pxr(c, 4, 8, 2, 2, pal.shade);
    pxr(c, 22, 13, 7, 3, pal.shade); pxr(c, 27, 10, 3, 3, pal.dark); pxr(c, 26, 8, 2, 2, pal.shade);
    pxr(c, 4, 15, 5, 1, pal.dark); pxr(c, 23, 15, 5, 1, pal.dark);
    // horns
    pxr(c, 11, 6, 2, 5, pal.dark); pxr(c, 19, 6, 2, 5, pal.dark);
    pxr(c, 10, 4, 1, 2, pal.dark); pxr(c, 21, 4, 1, 2, pal.dark);
    // tail
    pxr(c, 25, 22, 6, 2, pal.base); pxr(c, 30, 21, 2, 2, pal.light);
    // legs
    pxr(c, 10, 26, 4, 3, pal.shade); pxr(c, 19, 26, 4, 3, pal.shade);
    pxr(c, 10, 28, 4, 1, pal.dark); pxr(c, 19, 28, 4, 1, pal.dark);
    eyes(c, 13, 13, 18, 13, pal, 2);
    pxr(c, 21, 16, 3, 1, pal.outline);
    const f = (x, y) => (x - 16) * (x - 16) / 121 + (y - 21) * (y - 21) / 49 <= 1.05
                     || (x - 16) * (x - 16) / 64 + (y - 13) * (y - 13) / 25 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  // ---- STEEL: Ironscale -> Adamantaur ----
  ironscale(c, pal) {
    fillBlob(c, 16, 20, 10, 7, pal.base);
    for (let y = 23; y < 27; y++)
      for (let x = 7; x < 26; x++)
        if ((x - 16) * (x - 16) / 100 + (y - 20) * (y - 20) / 49 <= 1.05)
          px(c, x, y, pal.shade);
    // steel plates
    pxr(c, 9, 12, 14, 4, pal.dark);
    pxr(c, 11, 10, 10, 2, pal.shade);
    pxr(c, 13, 9, 6, 1, pal.light);
    // plate seams
    pxr(c, 12, 13, 1, 3, pal.outline); pxr(c, 20, 13, 1, 3, pal.outline);
    pxr(c, 16, 13, 1, 3, pal.outline);
    // head
    fillBlob(c, 16, 14, 6, 4, pal.base);
    // helmet ridge
    pxr(c, 13, 10, 6, 2, pal.dark); pxr(c, 15, 9, 2, 1, pal.light);
    fillBlob(c, 16, 23, 5, 2, pal.belly);
    // legs
    pxr(c, 10, 26, 4, 3, pal.shade); pxr(c, 18, 26, 4, 3, pal.shade);
    pxr(c, 10, 28, 4, 1, pal.dark); pxr(c, 18, 28, 4, 1, pal.dark);
    eyes(c, 13, 14, 18, 14, pal, 2);
    pxr(c, 14, 22, 4, 1, pal.outline);
    const f = (x, y) => (x - 16) * (x - 16) / 100 + (y - 20) * (y - 20) / 49 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  adamantaur(c, pal) {
    // armored juggernaut
    fillBlob(c, 16, 21, 11, 7, pal.base);
    for (let y = 24; y < 28; y++)
      for (let x = 6; x < 27; x++)
        if ((x - 16) * (x - 16) / 121 + (y - 21) * (y - 21) / 49 <= 1.05)
          px(c, x, y, pal.shade);
    // heavy plate armor
    pxr(c, 8, 11, 16, 5, pal.dark);
    pxr(c, 10, 9, 12, 2, pal.shade);
    pxr(c, 12, 8, 8, 1, pal.light);
    // plate rivets
    px(c, 11, 13, pal.light); px(c, 16, 13, pal.light); px(c, 21, 13, pal.light);
    // horns/helmet
    pxr(c, 9, 8, 2, 3, pal.dark); pxr(c, 21, 8, 2, 3, pal.dark);
    pxr(c, 8, 6, 2, 2, pal.dark); pxr(c, 22, 6, 2, 2, pal.dark);
    // head
    fillBlob(c, 16, 15, 6, 4, pal.base);
    // big fists
    pxr(c, 3, 18, 5, 6, pal.shade); pxr(c, 24, 18, 5, 6, pal.shade);
    pxr(c, 3, 23, 5, 1, pal.dark); pxr(c, 24, 23, 5, 1, pal.dark);
    // legs
    pxr(c, 9, 26, 4, 3, pal.shade); pxr(c, 19, 26, 4, 3, pal.shade);
    pxr(c, 9, 28, 4, 1, pal.dark); pxr(c, 19, 28, 4, 1, pal.dark);
    eyes(c, 13, 14, 18, 14, pal, 2);
    pxr(c, 14, 22, 4, 1, pal.outline);
    const f = (x, y) => (x - 16) * (x - 16) / 121 + (y - 21) * (y - 21) / 49 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  // ---- FAIRY: Pixiecap -> Glamora ----
  pixiecap(c, pal) {
    fillBlob(c, 16, 20, 8, 7, pal.base);
    for (let y = 23; y < 27; y++)
      for (let x = 9; x < 24; x++)
        if ((x - 16) * (x - 16) / 64 + (y - 20) * (y - 20) / 49 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 16, 22, 5, 3, pal.belly);
    // mushroom-ish cap
    pxr(c, 10, 8, 12, 3, pal.dark); pxr(c, 12, 6, 8, 2, pal.dark);
    pxr(c, 14, 5, 4, 1, pal.shade);
    // cap spots
    pxr(c, 12, 8, 2, 1, "#f8f8f8"); pxr(c, 18, 8, 2, 1, "#f8f8f8"); pxr(c, 15, 6, 2, 1, "#f8f8f8");
    // little wings
    pxr(c, 6, 17, 3, 3, pal.light); pxr(c, 23, 17, 3, 3, pal.light);
    pxr(c, 6, 16, 1, 1, "#fce0ec");
    // feet
    pxr(c, 12, 27, 3, 2, pal.shade); pxr(c, 18, 27, 3, 2, pal.shade);
    eyes(c, 13, 17, 18, 17, pal, 2);
    pxr(c, 14, 22, 4, 1, pal.outline);
    px(c, 11, 20, pal.hl); px(c, 21, 20, pal.hl);
    const f = (x, y) => (x - 16) * (x - 16) / 64 + (y - 20) * (y - 20) / 49 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  glamora(c, pal) {
    fillBlob(c, 16, 20, 10, 7, pal.base);
    for (let y = 23; y < 27; y++)
      for (let x = 7; x < 26; x++)
        if ((x - 16) * (x - 16) / 100 + (y - 20) * (y - 20) / 49 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 16, 23, 6, 2, pal.belly);
    // elegant head + tiara
    fillBlob(c, 16, 13, 7, 5, pal.base);
    pxr(c, 12, 8, 2, 3, pal.dark); pxr(c, 18, 8, 2, 3, pal.dark);
    pxr(c, 14, 7, 4, 2, pal.light); pxr(c, 15, 5, 2, 2, pal.light);
    // jewel
    pxr(c, 15, 6, 2, 1, "#f8d848");
    // big wings (fairy)
    pxr(c, 4, 14, 6, 4, pal.light); pxr(c, 3, 12, 3, 2, "#fce0ec");
    pxr(c, 22, 14, 6, 4, pal.light); pxr(c, 26, 12, 3, 2, "#fce0ec");
    pxr(c, 5, 17, 4, 1, pal.hl); pxr(c, 23, 17, 4, 1, pal.hl);
    // arms
    pxr(c, 7, 19, 2, 4, pal.shade); pxr(c, 24, 19, 2, 4, pal.shade);
    pxr(c, 11, 27, 4, 2, pal.shade); pxr(c, 18, 27, 4, 2, pal.shade);
    eyes(c, 13, 14, 18, 14, pal, 2);
    pxr(c, 14, 22, 4, 1, pal.outline);
    const f = (x, y) => (x - 16) * (x - 16) / 100 + (y - 20) * (y - 20) / 49 <= 1.05
                     || (x - 16) * (x - 16) / 49 + (y - 13) * (y - 13) / 25 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  // ---- FIGHTING: Monkick -> Grandfist ----
  monkick(c, pal) {
    fillBlob(c, 16, 20, 9, 8, pal.base);
    for (let y = 23; y < 28; y++)
      for (let x = 8; x < 25; x++)
        if ((x - 16) * (x - 16) / 81 + (y - 20) * (y - 20) / 64 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 16, 23, 5, 3, pal.belly);
    // head
    fillBlob(c, 16, 13, 6, 5, pal.base);
    // big ears
    pxr(c, 9, 9, 3, 4, pal.base); pxr(c, 20, 9, 3, 4, pal.base);
    pxr(c, 10, 9, 1, 2, pal.shade); pxr(c, 21, 9, 1, 2, pal.shade);
    // big fists
    pxr(c, 5, 19, 4, 5, pal.shade); pxr(c, 23, 19, 4, 5, pal.shade);
    pxr(c, 5, 17, 2, 1, pal.light); pxr(c, 25, 17, 2, 1, pal.light);
    // knuckles
    pxr(c, 5, 22, 1, 1, pal.dark); pxr(c, 7, 22, 1, 1, pal.dark);
    pxr(c, 24, 22, 1, 1, pal.dark); pxr(c, 26, 22, 1, 1, pal.dark);
    // feet
    pxr(c, 11, 27, 4, 2, pal.shade); pxr(c, 18, 27, 4, 2, pal.shade);
    eyes(c, 13, 13, 18, 13, pal, 2);
    pxr(c, 14, 18, 4, 1, pal.outline); // determined mouth
    const f = (x, y) => (x - 16) * (x - 16) / 81 + (y - 20) * (y - 20) / 64 <= 1.05
                     || (x - 16) * (x - 16) / 36 + (y - 13) * (y - 13) / 25 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  grandfist(c, pal) {
    fillBlob(c, 16, 21, 11, 7, pal.base);
    for (let y = 24; y < 28; y++)
      for (let x = 6; x < 27; x++)
        if ((x - 16) * (x - 16) / 121 + (y - 21) * (y - 21) / 49 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 16, 24, 6, 2, pal.belly);
    fillBlob(c, 16, 13, 8, 5, pal.base);
    for (let y = 15; y < 19; y++)
      for (let x = 9; x < 24; x++)
        if ((x - 16) * (x - 16) / 64 + (y - 13) * (y - 13) / 25 <= 1.05)
          px(c, x, y, pal.shade);
    // headband
    pxr(c, 9, 12, 14, 2, "#e84038"); pxr(c, 11, 11, 10, 1, "#b82820");
    // big ears
    pxr(c, 8, 8, 3, 5, pal.base); pxr(c, 21, 8, 3, 5, pal.base);
    // huge gauntlet fists
    pxr(c, 2, 18, 6, 7, pal.dark); pxr(c, 24, 18, 6, 7, pal.dark);
    pxr(c, 3, 16, 4, 2, pal.shade); pxr(c, 25, 16, 4, 2, pal.shade);
    // studs on gauntlets
    px(c, 3, 20, pal.light); px(c, 6, 20, pal.light); px(c, 25, 20, pal.light); px(c, 28, 20, pal.light);
    // legs
    pxr(c, 10, 26, 4, 3, pal.shade); pxr(c, 19, 26, 4, 3, pal.shade);
    pxr(c, 10, 28, 4, 1, pal.dark); pxr(c, 19, 28, 4, 1, pal.dark);
    eyes(c, 13, 13, 18, 13, pal, 2);
    pxr(c, 14, 18, 4, 1, pal.outline);
    const f = (x, y) => (x - 16) * (x - 16) / 121 + (y - 21) * (y - 21) / 49 <= 1.05
                     || (x - 16) * (x - 16) / 64 + (y - 13) * (y - 13) / 25 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  // ---- LEGENDARIES ----
  aurorion(c, pal) {
    // aurora dragon — elegant, glowing
    fillBlob(c, 16, 21, 11, 7, pal.base);
    for (let y = 24; y < 28; y++)
      for (let x = 6; x < 27; x++)
        if ((x - 16) * (x - 16) / 121 + (y - 21) * (y - 21) / 49 <= 1.05)
          px(c, x, y, pal.shade);
    fillBlob(c, 16, 24, 6, 2, pal.belly);
    fillBlob(c, 16, 13, 8, 5, pal.base);
    for (let y = 15; y < 19; y++)
      for (let x = 9; x < 24; x++)
        if ((x - 16) * (x - 16) / 64 + (y - 13) * (y - 13) / 25 <= 1.05)
          px(c, x, y, pal.shade);
    // flowing wings with aurora gradient
    pxr(c, 3, 13, 7, 4, pal.shade);
    pxr(c, 4, 11, 3, 2, "#88f8c8"); pxr(c, 6, 9, 2, 2, "#c8f888");
    pxr(c, 22, 13, 7, 4, pal.shade);
    pxr(c, 25, 11, 3, 2, "#88f8c8"); pxr(c, 24, 9, 2, 2, "#c8f888");
    // glowing horns
    pxr(c, 12, 6, 2, 5, pal.light); pxr(c, 18, 6, 2, 5, pal.light);
    pxr(c, 12, 4, 1, 2, "#e0fff8"); pxr(c, 19, 4, 1, 2, "#e0fff8");
    // aurora glow dots
    px(c, 8, 15, "#c8f888"); px(c, 23, 15, "#c8f888");
    px(c, 6, 17, "#88f8c8"); px(c, 25, 17, "#88f8c8");
    // tail
    pxr(c, 26, 22, 5, 2, pal.base); pxr(c, 30, 21, 1, 2, pal.light);
    // legs
    pxr(c, 10, 26, 4, 3, pal.shade); pxr(c, 19, 26, 4, 3, pal.shade);
    eyes(c, 13, 13, 18, 13, pal, 2);
    pxr(c, 21, 16, 3, 1, pal.outline);
    const f = (x, y) => (x - 16) * (x - 16) / 121 + (y - 21) * (y - 21) / 49 <= 1.05
                     || (x - 16) * (x - 16) / 64 + (y - 13) * (y - 13) / 25 <= 1.05;
    outlineRegion(c, f, pal.outline);
  },

  voidrath(c, pal) {
    // eclipse dragon — dark, menacing
    fillBlob(c, 16, 21, 11, 7, pal.base);
    for (let y = 24; y < 28; y++)
      for (let x = 6; x < 27; x++)
        if ((x - 16) * (x - 16) / 121 + (y - 21) * (y - 21) / 49 <= 1.05)
          px(c, x, y, pal.dark);
    fillBlob(c, 16, 24, 6, 2, pal.shade);
    fillBlob(c, 16, 13, 8, 5, pal.base);
    for (let y = 15; y < 19; y++)
      for (let x = 9; x < 24; x++)
        if ((x - 16) * (x - 16) / 64 + (y - 13) * (y - 13) / 25 <= 1.05)
          px(c, x, y, pal.shade);
    // tattered dark wings
    pxr(c, 2, 13, 8, 3, pal.dark); pxr(c, 1, 11, 3, 2, pal.outline); pxr(c, 3, 9, 2, 2, pal.dark);
    pxr(c, 22, 13, 8, 3, pal.dark); pxr(c, 28, 11, 3, 2, pal.outline); pxr(c, 27, 9, 2, 2, pal.dark);
    // jagged horns
    pxr(c, 11, 5, 2, 6, pal.outline); pxr(c, 10, 3, 1, 2, pal.outline);
    pxr(c, 19, 5, 2, 6, pal.outline); pxr(c, 21, 3, 1, 2, pal.outline);
    // glowing red eyes
    pxr(c, 12, 13, 3, 3, "#f84038"); pxr(c, 18, 13, 3, 3, "#f84038");
    pxr(c, 13, 13, 1, 1, "#f8a898"); pxr(c, 19, 13, 1, 1, "#f8a898");
    // dark aura
    px(c, 7, 17, "#583878"); px(c, 24, 17, "#583878");
    px(c, 5, 19, "#483068"); px(c, 26, 19, "#483068");
    // tail
    pxr(c, 26, 22, 5, 2, pal.base); pxr(c, 30, 22, 1, 2, pal.dark);
    // legs
    pxr(c, 10, 26, 4, 3, pal.dark); pxr(c, 19, 26, 4, 3, pal.dark);
    pxr(c, 10, 28, 4, 1, pal.outline); pxr(c, 19, 28, 4, 1, pal.outline);
    pxr(c, 21, 16, 3, 1, pal.outline);
    const f = (x, y) => (x - 16) * (x - 16) / 121 + (y - 21) * (y - 21) / 49 <= 1.05
                     || (x - 16) * (x - 16) / 64 + (y - 13) * (y - 13) / 25 <= 1.05;
    outlineRegion(c, f, pal.outline);
  }
};

// ---------- Type badge (small colored square + label) ----------
function drawTypeBadge(ctx, type, x, y) {
  const col = ACCENT[type] || PALETTE.dark;
  // rounded-ish badge with border
  ctx.fillStyle = "#181820";
  ctx.fillRect(x - 1, y, 30, 9);
  ctx.fillStyle = col;
  ctx.fillRect(x, y + 1, 28, 7);
  // subtle highlight
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillRect(x, y + 1, 28, 2);
  ctx.fillStyle = "#ffffff";
  ctx.font = "6px monospace";
  ctx.textBaseline = "alphabetic";
  const label = type.toUpperCase().slice(0, 5);
  ctx.fillText(label, x + 3, y + 7);
}

// ---------- Ball sprite (procedural, GBA-style) ----------
function drawBall(ctx, cx, cy, r, palette) {
  palette = palette || { top: "#f84848", topD: "#c82828", bottom: "#f8f8f8", bottomD: "#c8c8c8", band: "#383838", button: "#f8f8f8", buttonD: "#888888" };
  // top half
  ctx.fillStyle = palette.top;
  ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, 0); ctx.fill();
  ctx.fillStyle = palette.topD;
  ctx.beginPath(); ctx.arc(cx, cy + r * 0.3, r, Math.PI, Math.PI * 1.15); ctx.fill();
  // bottom half
  ctx.fillStyle = palette.bottom;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI); ctx.fill();
  ctx.fillStyle = palette.bottomD;
  ctx.beginPath(); ctx.arc(cx, cy - r * 0.2, r, Math.PI * 0.85, Math.PI); ctx.fill();
  // band
  ctx.fillStyle = palette.band;
  ctx.fillRect(cx - r, cy - 1, r * 2, 2);
  // button
  ctx.fillStyle = palette.button;
  ctx.beginPath(); ctx.arc(cx, cy, Math.max(2, r * 0.3), 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = palette.buttonD;
  ctx.beginPath(); ctx.arc(cx, cy, Math.max(1, r * 0.15), 0, Math.PI * 2); ctx.fill();
  // outline
  ctx.strokeStyle = "#181820";
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
}

// ---------- Status icon (tiny badges) ----------
function drawStatusIcon(ctx, status, x, y) {
  if (!status || status === STATUS.NONE) return;
  const label = STATUS_LABELS[status] || "";
  const colors = {
    burn: "#f87838", poison: "#a040a0", paralysis: "#f8d818",
    sleep: "#7878a8", freeze: "#98d8f8", confusion: "#f85888", toxic: "#683068"
  };
  ctx.fillStyle = "#181820";
  ctx.fillRect(x, y, 18, 8);
  ctx.fillStyle = colors[status] || "#888888";
  ctx.fillRect(x + 1, y + 1, 16, 6);
  ctx.fillStyle = "#ffffff";
  ctx.font = "6px monospace";
  ctx.fillText(label, x + 3, y + 7);
}

// ---------- Title-screen decorative creature silhouette ----------
function drawTitleCreature(ctx, cx, cy, size, t) {
  // a floating dragon-ish silhouette that bobs with time t (ms)
  const bob = Math.sin(t / 400) * 4;
  ctx.save();
  ctx.translate(0, bob);
  // body
  ctx.fillStyle = COLOR.dragon ? "#8858f8" : PALETTE.dark;
  ctx.beginPath();
  ctx.ellipse(cx, cy, size * 0.5, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  // wings
  ctx.fillStyle = "#6838d8";
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.2, cy - size * 0.1);
  ctx.lineTo(cx - size * 0.7, cy - size * 0.4);
  ctx.lineTo(cx - size * 0.1, cy - size * 0.25);
  ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.2, cy - size * 0.1);
  ctx.lineTo(cx + size * 0.7, cy - size * 0.4);
  ctx.lineTo(cx + size * 0.1, cy - size * 0.25);
  ctx.closePath(); ctx.fill();
  // eyes
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(cx - size * 0.2, cy - size * 0.1, 3, 3);
  ctx.fillRect(cx + size * 0.12, cy - size * 0.1, 3, 3);
  ctx.fillStyle = "#181820";
  ctx.fillRect(cx - size * 0.2 + 1, cy - size * 0.1 + 1, 2, 2);
  ctx.fillRect(cx + size * 0.12 + 1, cy - size * 0.1 + 1, 2, 2);
  ctx.restore();
}

// ============================================================
//  OVERWORLD SPRITES — directional player & NPC figures
//  Drawn at 16x16 with simple walk animation (frame by time t).
// ============================================================

// Draw the player overworld sprite at pixel (px, py) with facing dir.
// walkFrame: 0 = standing, 1/2 = step frames (alternating legs).
function drawPlayerOverworld(ctx, px, py, facing, walkFrame, palette) {
  const P = palette || {
    skin: COLOR.skin, skinD: COLOR.skinShade,
    hair: COLOR.hair, hairD: COLOR.hairShade,
    shirt: COLOR.shirtRed, shirtD: COLOR.shirtRedD,
    pants: COLOR.pantsBlue, pantsD: COLOR.pantsBlueD,
    shoes: COLOR.shoes
  };
  drawHumanoid(ctx, px, py, facing, walkFrame, P);
}

// Generic humanoid overworld figure (used for NPCs too).
function drawHumanoid(ctx, px, py, facing, walkFrame, P) {
  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath(); ctx.ellipse(px + 8, py + 15, 6, 2, 0, 0, Math.PI * 2); ctx.fill();

  // legs (animate)
  const step = (walkFrame === 1) ? 1 : (walkFrame === 2 ? -1 : 0);
  ctx.fillStyle = P.pants;
  ctx.fillRect(px + 5, py + 11, 2, 3 + (facing === "down" || facing === "up" ? step : 0));
  ctx.fillRect(px + 9, py + 11, 2, 3 - (facing === "down" || facing === "up" ? step : 0));
  // shoes
  ctx.fillStyle = P.shoes || P.hairD;
  if (facing === "down" || facing === "up") {
    ctx.fillRect(px + 5, py + 14 + step, 2, 1);
    ctx.fillRect(px + 9, py + 14 - step, 2, 1);
  } else {
    ctx.fillRect(px + 6, py + 14, 2, 1);
    ctx.fillRect(px + 9, py + 14, 2, 1);
  }

  // body / shirt
  ctx.fillStyle = P.shirt;
  ctx.fillRect(px + 4, py + 7, 8, 5);
  ctx.fillStyle = P.shirtD;
  ctx.fillRect(px + 4, py + 11, 8, 1);

  // arms
  ctx.fillStyle = P.shirt;
  if (facing === "left") { ctx.fillRect(px + 3, py + 8, 2, 3); }
  else if (facing === "right") { ctx.fillRect(px + 11, py + 8, 2, 3); }
  else { ctx.fillRect(px + 3, py + 8, 2, 3); ctx.fillRect(px + 11, py + 8, 2, 3); }
  // hands
  ctx.fillStyle = P.skin;
  if (facing === "left") { ctx.fillRect(px + 3, py + 10, 2, 1); }
  else if (facing === "right") { ctx.fillRect(px + 11, py + 10, 2, 1); }
  else { ctx.fillRect(px + 3, py + 10, 2, 1); ctx.fillRect(px + 11, py + 10, 2, 1); }

  // head
  ctx.fillStyle = P.skin;
  ctx.fillRect(px + 5, py + 3, 6, 5);
  ctx.fillStyle = P.skinD;
  ctx.fillRect(px + 5, py + 7, 6, 1);

  // hair (cap on top + back)
  ctx.fillStyle = P.hair;
  ctx.fillRect(px + 4, py + 2, 8, 2);
  if (facing === "down") { ctx.fillRect(px + 4, py + 4, 1, 2); ctx.fillRect(px + 11, py + 4, 1, 2); }
  if (facing === "left") { ctx.fillRect(px + 4, py + 3, 1, 4); }
  if (facing === "right") { ctx.fillRect(px + 11, py + 3, 1, 4); }
  if (facing === "up") { ctx.fillRect(px + 4, py + 2, 8, 4); } // back of head when up
  ctx.fillStyle = P.hairD;
  ctx.fillRect(px + 4, py + 3, 8, 1);

  // face features
  ctx.fillStyle = "#181820";
  if (facing === "down") {
    ctx.fillRect(px + 6, py + 5, 1, 1); ctx.fillRect(px + 9, py + 5, 1, 1); // eyes
  } else if (facing === "left") {
    ctx.fillRect(px + 5, py + 5, 1, 1);
  } else if (facing === "right") {
    ctx.fillRect(px + 10, py + 5, 1, 1);
  }
  // 'up' has no face visible
}

// NPC color presets keyed by sprite hex (falls back to a sensible humanoid).
function npcPalette(spriteColor) {
  const base = spriteColor || "#c8c8c8";
  const rgb = hexToRgb(base);
  const shade = rgbToHex(clampRgb(rgb.r - 50, rgb.g - 50, rgb.b - 50));
  return {
    skin: COLOR.skin, skinD: COLOR.skinShade,
    hair: shade, hairD: rgbToHex(clampRgb(rgb.r - 80, rgb.g - 80, rgb.b - 80)),
    shirt: base, shirtD: shade,
    pants: rgbToHex(clampRgb(rgb.r - 30, rgb.g - 30, rgb.b - 30)),
    pantsD: rgbToHex(clampRgb(rgb.r - 60, rgb.g - 60, rgb.b - 60)),
    shoes: "#583818"
  };
}
