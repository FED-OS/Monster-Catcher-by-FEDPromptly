// ============================================================
//  Monster Catcher — Audio (WebAudio chiptune SFX + Music)
//  No external files. Square-wave beeps, arpeggios, and a
//  lightweight procedural music loop engine for biome themes.
//  Mega Expansion v4.0: biome music, comedy SFX, boss/ultimate stingers.
// ============================================================

const settings = {
  muted: false,
  musicVolume: 0.04,
  sfxVolume: 1.0
};

let audioCtx = null;

// ---- Music loop engine state ----
let musicLoop = null;       // { timer, pattern, step, bpm, name }
let currentMusicName = null;

function ensureAudio() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      audioCtx = null;
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// ---- Core tone synthesizer ----
// Plays a single beep: freq (Hz), duration (s), type, volume
function beep(freq, duration, type, vol) {
  if (settings.muted) return;
  const ctx = ensureAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || "square";
  osc.frequency.value = freq;
  const baseVol = (vol || 0.08) * settings.sfxVolume;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(baseVol, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.start(now);
  osc.stop(now + duration);
}

// Plays a tone with a slight pitch slide (good for whoops and zoinks)
function slideTone(startFreq, endFreq, duration, type, vol) {
  if (settings.muted) return;
  const ctx = ensureAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || "square";
  const baseVol = (vol || 0.08) * settings.sfxVolume;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
  gain.gain.setValueAtTime(baseVol, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.start(now);
  osc.stop(now + duration);
}

// Plays a short noise burst (for impacts, static, glitch sounds)
function noiseBurst(duration, vol, filterFreq) {
  if (settings.muted) return;
  const ctx = ensureAudio();
  if (!ctx) return;
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = filterFreq || 2000;
  const baseVol = (vol || 0.08) * settings.sfxVolume;
  gain.gain.value = baseVol;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start();
}

// Play a quick arpeggio of beeps
function arp(notes, gap, type, vol) {
  if (settings.muted) return;
  notes.forEach((n, i) => {
    setTimeout(() => beep(n, gap, type, vol), i * gap * 1000);
  });
}

// ============================================================
//  ORIGINAL SFX (preserved for backward compatibility)
// ============================================================
function sfxMove()      { beep(180, 0.05, "square", 0.05); }
function sfxConfirm()   { beep(440, 0.06, "square", 0.08); }
function sfxCancel()    { beep(220, 0.06, "square", 0.08); }
function sfxMenu()      { beep(330, 0.04, "square", 0.06); }
function sfxEncounter() { arp([330,392,523,659], 0.06, "square", 0.07); }
function sfxHit()       { beep(140, 0.08, "sawtooth", 0.1); setTimeout(()=>beep(90,0.1,"sawtooth",0.08),60); }
function sfxMiss()      { beep(120, 0.12, "triangle", 0.06); }
function sfxFaint()     { arp([523,392,330,220], 0.1, "sawtooth", 0.08); }
function sfxBallThrow() { beep(700, 0.08, "square", 0.06); }
function sfxCatch()     { arp([523,659,784,1047], 0.1, "square", 0.09); }
function sfxBreakFree() { arp([523,440,330], 0.08, "sawtooth", 0.07); }
function sfxHeal()      { arp([392,523,659,784], 0.1, "sine", 0.08); }
function sfxLevelUp()   { arp([523,659,784,1047,1319], 0.08, "square", 0.08); }
function sfxEvolve()    { arp([330,392,523,659,784,1047], 0.12, "sine", 0.09); }
function sfxBuy()       { arp([523,784], 0.08, "square", 0.08); }
function sfxTitle()     { arp([523,659,784,1047,784,659,523], 0.1, "square", 0.07); }
function sfxBadge()     { arp([659,784,1047,1319], 0.12, "sine", 0.1); }

// ============================================================
//  MEGA EXPANSION — COMEDY SFX
// ============================================================

// "Zoink!" — a cartoony spring/boing sound (quirky tool effects, miss-fumble)
function sfxZoink() {
  slideTone(200, 800, 0.15, "square", 0.07);
  setTimeout(() => slideTone(800, 400, 0.1, "square", 0.05), 80);
}

// "Womp womp." — a descending sad trombone (failure, quirk backfire)
function sfxWomp() {
  beep(330, 0.12, "sawtooth", 0.06);
  setTimeout(() => beep(294, 0.12, "sawtooth", 0.06), 130);
  setTimeout(() => beep(247, 0.18, "sawtooth", 0.07), 260);
}

// "Ding!" — a bright notification chime (item found, quirk proc, tool ready)
function sfxDing() {
  beep(1568, 0.08, "sine", 0.07);
  setTimeout(() => beep(2093, 0.12, "sine", 0.06), 60);
}

// "Bonk!" — a hollow hit (comic impact frame, head-bump)
function sfxBonk() {
  beep(120, 0.06, "square", 0.1);
  noiseBurst(0.05, 0.04, 800);
}

// "Pow!" — an explosive impact (critical hit, boss slam)
function sfxPow() {
  noiseBurst(0.08, 0.1, 3000);
  setTimeout(() => beep(80, 0.12, "sawtooth", 0.1), 20);
}

// "Zap!" — electric crackle (spark, glitch, cyber effects)
function sfxZap() {
  noiseBurst(0.06, 0.06, 5000);
  setTimeout(() => slideTone(1200, 300, 0.08, "square", 0.05), 30);
}

// "Sizzle" — fire/lava ambient sizzle
function sfxSizzle() {
  noiseBurst(0.2, 0.03, 4000);
}

// "Splash" — water entry
function sfxSplash() {
  slideTone(400, 100, 0.15, "sine", 0.06);
  noiseBurst(0.1, 0.04, 1500);
}

// "Crunch" — a satisfying bite/crunch
function sfxCrunch() {
  noiseBurst(0.05, 0.08, 1200);
  setTimeout(() => noiseBurst(0.04, 0.06, 1000), 50);
}

// "Sneak" — a quiet tiptoe note (stealth minigame)
function sfxSneak() {
  beep(300, 0.03, "triangle", 0.03);
  setTimeout(() => beep(280, 0.03, "triangle", 0.03), 80);
}

// "Alert!" — an exclamation-point alert (world creature spots player)
function sfxAlert() {
  beep(880, 0.06, "square", 0.08);
  setTimeout(() => beep(880, 0.06, "square", 0.08), 80);
}

// "Snore" — a comedic Zzz snore (sleeping world creature)
function sfxSnore() {
  slideTone(100, 60, 0.3, "sawtooth", 0.04);
  setTimeout(() => slideTone(80, 50, 0.25, "sawtooth", 0.03), 320);
}

// ============================================================
//  MEGA EXPANSION — SYSTEM SFX
// ============================================================

// Ultimate move charge — dramatic rising sweep
function sfxUltimateCharge() {
  slideTone(110, 880, 0.5, "sawtooth", 0.08);
  setTimeout(() => beep(880, 0.15, "square", 0.07), 500);
}

// Ultimate move release — explosive fanfare
function sfxUltimateRelease() {
  noiseBurst(0.15, 0.12, 4000);
  arp([523, 659, 784, 1047, 1319], 0.06, "square", 0.09);
  setTimeout(() => beep(1319, 0.3, "sine", 0.08), 300);
}

// Boss phase transition — ominous stinger
function sfxBossPhase() {
  beep(110, 0.2, "sawtooth", 0.1);
  setTimeout(() => beep(98, 0.2, "sawtooth", 0.1), 220);
  setTimeout(() => beep(87, 0.3, "sawtooth", 0.1), 440);
  noiseBurst(0.1, 0.06, 800);
}

// Boss roar — a layered growl
function sfxBossRoar() {
  slideTone(80, 50, 0.6, "sawtooth", 0.12);
  setTimeout(() => slideTone(60, 40, 0.5, "sawtooth", 0.1), 100);
  noiseBurst(0.3, 0.05, 600);
}

// Krax ambush — a sneaky thief sting
function sfxKraxAmbush() {
  slideTone(600, 200, 0.1, "square", 0.06);
  setTimeout(() => beep(150, 0.08, "sawtooth", 0.07), 100);
  setTimeout(() => sfxZoink(), 200);
}

// Krax steal — item swiped
function sfxSteal() {
  slideTone(1200, 400, 0.1, "square", 0.05);
  setTimeout(() => sfxZoink(), 100);
}

// Evolution flash-bang — bright ascending sparkle
function sfxEvolutionFlash() {
  arp([523, 659, 784, 1047, 1319, 1568, 2093], 0.05, "sine", 0.08);
  setTimeout(() => noiseBurst(0.1, 0.06, 6000), 350);
}

// Screen shake — low rumble
function sfxRumble() {
  slideTone(60, 40, 0.4, "sawtooth", 0.06);
  noiseBurst(0.3, 0.03, 400);
}

// Warp / fast travel — whoosh
function sfxWarp() {
  slideTone(200, 1600, 0.2, "sine", 0.06);
  setTimeout(() => slideTone(1600, 200, 0.15, "sine", 0.05), 200);
}

// Starter chosen — a triumphant little fanfare
function sfxStarter() {
  arp([392, 523, 659, 784], 0.1, "square", 0.08);
  setTimeout(() => beep(1047, 0.2, "sine", 0.08), 400);
}

// Hero selected — a confident chord
function sfxHeroSelect() {
  arp([330, 440, 523], 0.08, "square", 0.07);
}

// Tool equip — a mechanical click-clack
function sfxToolEquip() {
  beep(440, 0.04, "square", 0.06);
  setTimeout(() => beep(550, 0.04, "square", 0.06), 50);
  setTimeout(() => beep(660, 0.06, "square", 0.06), 100);
}

// Tool unequip — reverse click
function sfxToolUnequip() {
  beep(660, 0.04, "square", 0.06);
  setTimeout(() => beep(440, 0.06, "square", 0.06), 50);
}

// Quirk activation — a quirky little flourish
function sfxQuirk() {
  arp([523, 659, 523, 784], 0.05, "triangle", 0.05);
}

// Branching dialogue choice — a soft select tone
function sfxBranch() {
  beep(392, 0.05, "triangle", 0.05);
  setTimeout(() => beep(523, 0.06, "triangle", 0.05), 60);
}

// Spare ending — gentle, peaceful
function sfxSpare() {
  arp([523, 659, 784, 659, 523], 0.15, "sine", 0.07);
}

// Hug ending — warm and fuzzy
function sfxHug() {
  arp([523, 659, 523, 659, 784], 0.1, "sine", 0.06);
  setTimeout(() => sfxDing(), 500);
}

// Victory fanfare — extended
function sfxVictory() {
  arp([523, 659, 784, 1047, 784, 1047, 1319], 0.12, "square", 0.08);
}

// Defeat — game over sting
function sfxDefeat() {
  arp([523, 440, 349, 262, 196], 0.2, "sawtooth", 0.08);
}

// ============================================================
//  MEGA EXPANSION — BIOME MUSIC (procedural loop engine)
// ============================================================
// Each biome has a short melodic pattern that loops at a given BPM.
// Patterns are arrays of [freq, durationBeats] — 0 freq = rest.

// Note frequency helper (A4 = 440)
const NOTE = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  Cs4: 277.18, Ds4: 311.13, Fs4: 369.99, Gs4: 415.30, As4: 466.16,
  Cs5: 554.37, Ds5: 622.25, Fs5: 739.99, Gs5: 830.61,
  R: 0 // rest
};

const BIOME_MUSIC = {
  // Verdant plains — cheerful, bouncy melody
  verdant: {
    name: "verdant",
    bpm: 132,
    type: "square",
    melody: [
      [NOTE.C5, 0.5], [NOTE.E5, 0.5], [NOTE.G5, 0.5], [NOTE.E5, 0.5],
      [NOTE.C5, 0.5], [NOTE.D5, 0.5], [NOTE.F5, 0.5], [NOTE.D5, 0.5],
      [NOTE.B4, 0.5], [NOTE.D5, 0.5], [NOTE.G5, 0.5], [NOTE.D5, 0.5],
      [NOTE.C5, 1], [NOTE.R, 0.5],
      [NOTE.G4, 0.5], [NOTE.C5, 0.5], [NOTE.E5, 0.5], [NOTE.G5, 0.5],
      [NOTE.A5, 0.5], [NOTE.G5, 0.5], [NOTE.E5, 0.5], [NOTE.C5, 0.5],
      [NOTE.D5, 1], [NOTE.R, 1]
    ],
    bass: [
      [NOTE.C3, 1], [NOTE.G3, 1], [NOTE.A3, 1], [NOTE.F3, 1],
      [NOTE.G3, 1], [NOTE.C3, 1], [NOTE.G3, 1], [NOTE.C3, 1]
    ]
  },
  // Volcano — intense, driving, minor key
  volcano: {
    name: "volcano",
    bpm: 140,
    type: "sawtooth",
    melody: [
      [NOTE.Ds4, 0.5], [NOTE.D4, 0.5], [NOTE.Ds4, 0.5], [NOTE.G4, 0.5],
      [NOTE.Ds4, 0.5], [NOTE.D4, 0.5], [NOTE.C4, 0.5], [NOTE.D4, 0.5],
      [NOTE.Ds4, 0.5], [NOTE.F4, 0.5], [NOTE.G4, 0.5], [NOTE.Ds4, 0.5],
      [NOTE.D4, 1], [NOTE.R, 0.5],
      [NOTE.G4, 0.5], [NOTE.F4, 0.5], [NOTE.Ds4, 0.5], [NOTE.D4, 0.5],
      [NOTE.Ds4, 0.5], [NOTE.G4, 0.5], [NOTE.As4, 0.5], [NOTE.G4, 0.5],
      [NOTE.Ds4, 1], [NOTE.R, 1]
    ],
    bass: [
      [NOTE.D3, 1], [NOTE.D3, 1], [NOTE.G3, 1], [NOTE.D3, 1],
      [NOTE.D3, 1], [NOTE.G3, 1], [NOTE.F3, 1], [NOTE.D3, 1]
    ]
  },
  // Cyber city — upbeat electronic, syncopated
  cyber: {
    name: "cyber",
    bpm: 128,
    type: "square",
    melody: [
      [NOTE.E5, 0.25], [NOTE.R, 0.25], [NOTE.E5, 0.25], [NOTE.G5, 0.25],
      [NOTE.E5, 0.25], [NOTE.R, 0.25], [NOTE.D5, 0.5],
      [NOTE.C5, 0.25], [NOTE.R, 0.25], [NOTE.C5, 0.25], [NOTE.E5, 0.25],
      [NOTE.D5, 0.5], [NOTE.R, 0.5],
      [NOTE.E5, 0.25], [NOTE.R, 0.25], [NOTE.E5, 0.25], [NOTE.A5, 0.25],
      [NOTE.G5, 0.25], [NOTE.E5, 0.25], [NOTE.D5, 0.25], [NOTE.C5, 0.25],
      [NOTE.D5, 1], [NOTE.R, 1]
    ],
    bass: [
      [NOTE.A3, 0.5], [NOTE.A3, 0.5], [NOTE.E3, 0.5], [NOTE.E3, 0.5],
      [NOTE.F3, 0.5], [NOTE.F3, 0.5], [NOTE.D3, 0.5], [NOTE.D3, 0.5]
    ]
  },
  // Crystal cavern — ethereal, slow, mysterious
  crystal: {
    name: "crystal",
    bpm: 90,
    type: "sine",
    melody: [
      [NOTE.C5, 1], [NOTE.E5, 1], [NOTE.G5, 1], [NOTE.B5, 1],
      [NOTE.A5, 1], [NOTE.G5, 1], [NOTE.E5, 1], [NOTE.C5, 1],
      [NOTE.D5, 1], [NOTE.F5, 1], [NOTE.A5, 1], [NOTE.G5, 1],
      [NOTE.E5, 2], [NOTE.R, 2]
    ],
    bass: [
      [NOTE.C3, 2], [NOTE.G3, 2], [NOTE.F3, 2], [NOTE.C3, 2]
    ]
  },
  // Junkyard — gritty, percussive, chaotic
  junk: {
    name: "junk",
    bpm: 112,
    type: "sawtooth",
    melody: [
      [NOTE.D4, 0.25], [NOTE.D4, 0.25], [NOTE.F4, 0.5], [NOTE.D4, 0.25],
      [NOTE.C4, 0.25], [NOTE.D4, 0.5], [NOTE.F4, 0.25], [NOTE.G4, 0.25],
      [NOTE.F4, 0.25], [NOTE.D4, 0.25], [NOTE.C4, 0.5], [NOTE.R, 0.5],
      [NOTE.D4, 0.25], [NOTE.F4, 0.25], [NOTE.G4, 0.25], [NOTE.As4, 0.25],
      [NOTE.G4, 0.25], [NOTE.F4, 0.25], [NOTE.D4, 0.5], [NOTE.R, 1]
    ],
    bass: [
      [NOTE.D3, 0.5], [NOTE.D3, 0.5], [NOTE.F3, 0.5], [NOTE.F3, 0.5],
      [NOTE.C3, 0.5], [NOTE.C3, 0.5], [NOTE.G3, 0.5], [NOTE.G3, 0.5]
    ]
  },
  // Frozen tundra — sparse, cold, lonely
  frost: {
    name: "frost",
    bpm: 80,
    type: "sine",
    melody: [
      [NOTE.C5, 1.5], [NOTE.E5, 0.5], [NOTE.D5, 1], [NOTE.R, 0.5],
      [NOTE.C5, 1], [NOTE.G4, 1], [NOTE.A4, 1], [NOTE.R, 1],
      [NOTE.E5, 1.5], [NOTE.D5, 0.5], [NOTE.C5, 1], [NOTE.R, 0.5],
      [NOTE.G4, 2], [NOTE.R, 2]
    ],
    bass: [
      [NOTE.C3, 2], [NOTE.F3, 2], [NOTE.G3, 2], [NOTE.C3, 2]
    ]
  },
  // Storm peak — dramatic, thunderous
  storm: {
    name: "storm",
    bpm: 120,
    type: "square",
    melody: [
      [NOTE.A4, 0.5], [NOTE.C5, 0.5], [NOTE.E5, 0.5], [NOTE.A5, 0.5],
      [NOTE.G5, 0.5], [NOTE.E5, 0.5], [NOTE.C5, 0.5], [NOTE.A4, 0.5],
      [NOTE.B4, 0.5], [NOTE.D5, 0.5], [NOTE.F5, 0.5], [NOTE.B5, 0.5],
      [NOTE.A5, 1], [NOTE.R, 0.5],
      [NOTE.E5, 0.5], [NOTE.D5, 0.5], [NOTE.C5, 0.5], [NOTE.B4, 0.5],
      [NOTE.A4, 1], [NOTE.R, 1]
    ],
    bass: [
      [NOTE.A3, 1], [NOTE.E3, 1], [NOTE.F3, 1], [NOTE.E3, 1],
      [NOTE.D3, 1], [NOTE.A3, 1], [NOTE.E3, 1], [NOTE.A3, 1]
    ]
  },
  // Shadow swamp — eerie, slow, minor
  shadow: {
    name: "shadow",
    bpm: 75,
    type: "triangle",
    melody: [
      [NOTE.Ds4, 1.5], [NOTE.F4, 0.5], [NOTE.G4, 1], [NOTE.R, 0.5],
      [NOTE.Ds4, 1], [NOTE.C4, 1], [NOTE.D4, 1], [NOTE.R, 1],
      [NOTE.G4, 1.5], [NOTE.F4, 0.5], [NOTE.Ds4, 1], [NOTE.R, 0.5],
      [NOTE.C4, 2], [NOTE.R, 2]
    ],
    bass: [
      [NOTE.D3, 2], [NOTE.G3, 2], [NOTE.F3, 2], [NOTE.Ds3, 2]
    ]
  },
  // Town / lab — peaceful, homey
  town: {
    name: "town",
    bpm: 100,
    type: "square",
    melody: [
      [NOTE.C5, 0.5], [NOTE.E5, 0.5], [NOTE.G5, 0.5], [NOTE.C5, 0.5],
      [NOTE.A4, 0.5], [NOTE.C5, 0.5], [NOTE.E5, 0.5], [NOTE.A4, 0.5],
      [NOTE.G4, 0.5], [NOTE.B4, 0.5], [NOTE.D5, 0.5], [NOTE.G4, 0.5],
      [NOTE.C5, 1], [NOTE.R, 1],
      [NOTE.E5, 0.5], [NOTE.G5, 0.5], [NOTE.E5, 0.5], [NOTE.C5, 0.5],
      [NOTE.D5, 1], [NOTE.R, 1]
    ],
    bass: [
      [NOTE.C3, 1], [NOTE.A3, 1], [NOTE.G3, 1], [NOTE.C3, 1],
      [NOTE.F3, 1], [NOTE.C3, 1], [NOTE.G3, 1], [NOTE.C3, 1]
    ]
  },
  // Battle music — fast, tense
  battle: {
    name: "battle",
    bpm: 150,
    type: "square",
    melody: [
      [NOTE.C5, 0.25], [NOTE.C5, 0.25], [NOTE.E5, 0.25], [NOTE.G5, 0.25],
      [NOTE.C5, 0.25], [NOTE.C5, 0.25], [NOTE.E5, 0.25], [NOTE.G5, 0.25],
      [NOTE.B4, 0.25], [NOTE.B4, 0.25], [NOTE.D5, 0.25], [NOTE.G5, 0.25],
      [NOTE.B4, 0.25], [NOTE.B4, 0.25], [NOTE.D5, 0.25], [NOTE.G5, 0.25],
      [NOTE.A4, 0.25], [NOTE.A4, 0.25], [NOTE.C5, 0.25], [NOTE.E5, 0.25],
      [NOTE.A4, 0.25], [NOTE.A4, 0.25], [NOTE.C5, 0.25], [NOTE.E5, 0.25],
      [NOTE.D5, 0.5], [NOTE.C5, 0.5], [NOTE.R, 1]
    ],
    bass: [
      [NOTE.C3, 0.5], [NOTE.G3, 0.5], [NOTE.C3, 0.5], [NOTE.G3, 0.5],
      [NOTE.G3, 0.5], [NOTE.D3, 0.5], [NOTE.G3, 0.5], [NOTE.D3, 0.5],
      [NOTE.A3, 0.5], [NOTE.E3, 0.5], [NOTE.A3, 0.5], [NOTE.E3, 0.5],
      [NOTE.F3, 0.5], [NOTE.G3, 0.5], [NOTE.C3, 1]
    ]
  },
  // Boss music — epic, dark, driving
  boss: {
    name: "boss",
    bpm: 160,
    type: "sawtooth",
    melody: [
      [NOTE.D4, 0.25], [NOTE.D4, 0.25], [NOTE.Ds4, 0.25], [NOTE.F4, 0.25],
      [NOTE.G4, 0.25], [NOTE.F4, 0.25], [NOTE.Ds4, 0.25], [NOTE.D4, 0.25],
      [NOTE.Ds4, 0.25], [NOTE.Ds4, 0.25], [NOTE.F4, 0.25], [NOTE.G4, 0.25],
      [NOTE.As4, 0.25], [NOTE.G4, 0.25], [NOTE.F4, 0.25], [NOTE.Ds4, 0.25],
      [NOTE.D4, 0.25], [NOTE.F4, 0.25], [NOTE.Ds4, 0.25], [NOTE.D4, 0.25],
      [NOTE.C4, 0.25], [NOTE.D4, 0.25], [NOTE.Ds4, 0.25], [NOTE.F4, 0.25],
      [NOTE.G4, 0.5], [NOTE.D4, 0.5], [NOTE.R, 1]
    ],
    bass: [
      [NOTE.D3, 0.5], [NOTE.D3, 0.5], [NOTE.Ds3, 0.5], [NOTE.Ds3, 0.5],
      [NOTE.F3, 0.5], [NOTE.F3, 0.5], [NOTE.G3, 0.5], [NOTE.G3, 0.5],
      [NOTE.D3, 0.5], [NOTE.D3, 0.5], [NOTE.C3, 0.5], [NOTE.C3, 0.5],
      [NOTE.D3, 1], [NOTE.R, 1]
    ]
  },
  // Title screen — grand, adventurous
  title: {
    name: "title",
    bpm: 110,
    type: "square",
    melody: [
      [NOTE.C5, 0.5], [NOTE.E5, 0.5], [NOTE.G5, 0.5], [NOTE.C5, 0.5],
      [NOTE.A4, 0.5], [NOTE.C5, 0.5], [NOTE.E5, 0.5], [NOTE.A5, 0.5],
      [NOTE.G5, 1], [NOTE.E5, 0.5], [NOTE.C5, 0.5],
      [NOTE.D5, 0.5], [NOTE.F5, 0.5], [NOTE.A5, 0.5], [NOTE.G5, 0.5],
      [NOTE.E5, 0.5], [NOTE.D5, 0.5], [NOTE.C5, 1], [NOTE.R, 1]
    ],
    bass: [
      [NOTE.C3, 1], [NOTE.A3, 1], [NOTE.G3, 1], [NOTE.C3, 1],
      [NOTE.F3, 1], [NOTE.G3, 1], [NOTE.C3, 2]
    ]
  }
};

// ---- Music loop engine ----
function stopMusic() {
  if (musicLoop && musicLoop.timer) {
    clearTimeout(musicLoop.timer);
    musicLoop = null;
  }
  currentMusicName = null;
}

function playMusic(trackName) {
  if (settings.muted) return;
  const track = BIOME_MUSIC[trackName];
  if (!track) return;
  // Don't restart if already playing the same track
  if (currentMusicName === trackName && musicLoop) return;
  stopMusic();
  currentMusicName = trackName;

  const beatDuration = 60 / track.bpm; // seconds per beat
  let melodyStep = 0;
  let bassStep = 0;
  let melodyTime = 0; // accumulated beats
  let bassTime = 0;

  musicLoop = {
    timer: null,
    name: trackName,
    step: 0
  };

  function tick() {
    if (settings.muted || !musicLoop || musicLoop.name !== trackName) return;
    const ctx = ensureAudio();
    if (!ctx) return;

    // Play melody note if it's time
    if (melodyStep < track.melody.length) {
      const [freq, dur] = track.melody[melodyStep];
      if (freq > 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = track.type;
        osc.frequency.value = freq;
        const vol = settings.musicVolume;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const now = ctx.currentTime;
        const durSec = dur * beatDuration;
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + durSec * 0.9);
        osc.start(now);
        osc.stop(now + durSec);
      }
      melodyStep++;
    } else {
      melodyStep = 0; // loop
    }

    // Play bass note (slower — every 2 melody steps roughly)
    if (bassStep < track.bass.length) {
      const [freq, dur] = track.bass[bassStep];
      if (freq > 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        const vol = settings.musicVolume * 0.7;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const now = ctx.currentTime;
        const durSec = dur * beatDuration;
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + durSec * 0.9);
        osc.start(now);
        osc.stop(now + durSec);
      }
      bassStep++;
    } else {
      bassStep = 0; // loop
    }

    musicLoop.step++;
    // Schedule next tick at the shortest note duration (0.25 beats)
    musicLoop.timer = setTimeout(tick, beatDuration * 0.25 * 1000);
  }

  tick();
}

// Play the appropriate music for the current game state / biome
function updateMusic() {
  if (settings.muted) { stopMusic(); return; }
  if (game.state === GAME_STATE.TITLE) {
    playMusic("title");
    return;
  }
  if (game.state === GAME_STATE.BATTLE) {
    // Boss battle vs regular battle
    if (typeof bossState !== "undefined" && bossState && bossState.active) {
      playMusic("boss");
    } else {
      playMusic("battle");
    }
    return;
  }
  if (game.state === GAME_STATE.OVERWORLD) {
    const biome = (typeof currentBiome === "function") ? currentBiome() : null;
    if (biome && biome.musicKey && BIOME_MUSIC[biome.musicKey]) {
      playMusic(biome.musicKey);
    } else {
      // Town maps (lab, verdantown) get town music; default to verdant
      const map = (typeof currentMapData === "function") ? currentMapData() : null;
      if (map && (map.id === "lab" || map.id === "verdantown" || (map.encounters && map.encounters.length === 0 && map.rate === 0))) {
        playMusic("town");
      } else {
        playMusic("verdant");
      }
    }
    return;
  }
  // Menu / shop — keep current music
}

// Toggle mute
function toggleMute() {
  settings.muted = !settings.muted;
  if (settings.muted) {
    stopMusic();
  } else {
    updateMusic();
  }
  return settings.muted;
}
