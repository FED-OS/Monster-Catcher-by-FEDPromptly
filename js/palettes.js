// ============================================================
//  Monster Catcher — Palette Themes (GBA Edition v3.0)
//  Multiple Game Boy–era palettes the player can switch between
//  at runtime. Each theme is a 4-shade ramp (lightest -> darkest)
//  that replaces PALETTE dynamically. Also wires day/night and
//  weather overlay tints for the overworld.
// ============================================================

// Each theme remaps the core 4-shade UI ramp (PALETTE).
// These affect text/panel ink; terrain & sprites use the richer
// COLOR system from constants.js (which themes can optionally recolor).
const PALETTES = {
  classic: {
    label: "Classic DMG",
    light: "#9bbc0f", mid: "#8bac0f", dark: "#306230", black: "#0f380f"
  },
  pocket: {
    label: "Pocket Grey",
    light: "#c4cfa1", mid: "#8b956a", dark: "#4d533c", black: "#1f1f1f"
  },
  supergb: {
    label: "Super GB",
    light: "#e0f8d0", mid: "#88c070", dark: "#346856", black: "#081820"
  },
  inverted: {
    label: "Inverted",
    light: "#0f380f", mid: "#306230", dark: "#8bac0f", black: "#9bbc0f"
  },
  blue: {
    label: "Blue Wave",
    light: "#a4c8e0", mid: "#5a8cb8", dark: "#2a4a68", black: "#0a1a2a"
  },
  amber: {
    label: "Amber Glow",
    light: "#ffd8a0", mid: "#d49850", dark: "#8a5a20", black: "#3a2810"
  }
};

// Current active theme key
let currentPaletteKey = "supergb";

// Returns a live reference to the active palette object.
function getActivePalette() {
  return PALETTES[currentPaletteKey] || PALETTES.supergb;
}

// Switch the global PALETTE to a new theme by key.
function setPaletteTheme(key) {
  if (!PALETTES[key]) return;
  currentPaletteKey = key;
  const p = PALETTES[key];
  PALETTE.light = p.light;
  PALETTE.mid   = p.mid;
  PALETTE.dark  = p.dark;
  PALETTE.black = p.black;
}

// Initialise — Super GB (GBA-ish green) is the default.
setPaletteTheme("supergb");

// ---- Time-of-day tinting ----
// Returns a CSS color string used as a translucent overlay on the
// overworld to simulate day/evening/night. "neutral" = no overlay.
const TIME_OF_DAY = {
  day:      { tint: "rgba(0,0,0,0)",        label: "Day",     sky: "#78c8f8", sky2: "#a8e0f8" },
  evening:  { tint: "rgba(255,140,40,0.14)", label: "Evening", sky: "#f8a868", sky2: "#f8c898" },
  night:    { tint: "rgba(10,12,45,0.42)",  label: "Night",   sky: "#182848", sky2: "#283868" },
  dawn:     { tint: "rgba(255,180,120,0.10)", label: "Dawn",  sky: "#f8c8a8", sky2: "#a8d8f8" }
};

// Current time-of-day key (advanced by the day/night system in main.js).
let currentTimeOfDay = "day";

function getTimeTint() {
  const t = TIME_OF_DAY[currentTimeOfDay];
  return t ? t.tint : "rgba(0,0,0,0)";
}

function getSkyColors() {
  const t = TIME_OF_DAY[currentTimeOfDay];
  return t ? [t.sky, t.sky2] : ["#78c8f8", "#a8e0f8"];
}

// Advance time of day in a fixed cycle (used by main loop).
function advanceTimeOfDay() {
  const order = ["day", "evening", "night", "dawn"];
  const idx = order.indexOf(currentTimeOfDay);
  currentTimeOfDay = order[(idx + 1) % order.length];
}

// ---- Weather overlay colors ----
const WEATHER = {
  none:   { tint: "rgba(0,0,0,0)",          label: "Clear" },
  rain:   { tint: "rgba(80,100,160,0.15)",  label: "Rain" },
  snow:   { tint: "rgba(220,230,255,0.18)", label: "Snow" },
  sun:    { tint: "rgba(255,220,80,0.12)",  label: "Harsh Sun" },
  sandst: { tint: "rgba(200,170,100,0.18)", label: "Sandstorm" }
};

let currentWeather = "none";

function getWeatherTint() {
  const w = WEATHER[currentWeather];
  return w ? w.tint : "rgba(0,0,0,0)";
}

// Per-map ambient weather (set in world.js map data, falls back to none).
function getMapWeather() {
  const map = (typeof currentMapData === "function") ? currentMapData() : null;
  if (map && map.weather) return map.weather;
  return "none";
}
