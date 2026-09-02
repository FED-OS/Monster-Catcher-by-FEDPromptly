// ============================================================
//  PROJECT HERO — Characters
//  Hero options, companion creatures, Rival Krax, Boss Giga-Thok.
//  Each hero has a personality, sprite palette, and dialogue style.
// ============================================================

// ================= HEROES =================
const HEROES = {
  kael: {
    id: "kael", name: "Kaelen \"Kael\" Vex", short: "Kael",
    personality: "Sarcastic, clever, perpetually exhausted",
    backstory: "A retired treasure hunter dragged back into adventure by a talking map.",
    sprite: { hair: "#5a3a1a", hairShade: "#3a2a10", skin: "#f0c898", skinShade: "#d0a878", shirt: "#3a5a8a", shirtD: "#2a4a6a", pants: "#383848", accent: "#c8a018" },
    dialogueStyle: "deadpan",
    lines: {
      tired: ["I need a vacation. And therapy. And possibly a new companion.", "...No, I don't. I love this chaos."],
      krax: ["I'm going to END him. Politely. In a court of law. Maybe.", "You're the reason I can't have nice things."],
      boss: ["Did you just rhyme 'crash' with 'crash'?", "That's not how toasters work! That's not how ANYTHING works!"]
    }
  },
  lyra: {
    id: "lyra", name: "Lyra Sparks", short: "Lyra",
    personality: "Energetic, optimistic, accidentally chaotic",
    backstory: "An inventor whose gadgets work 60% of the time, every time.",
    sprite: { hair: "#c84878", hairShade: "#a83868", skin: "#f0c898", skinShade: "#d0a878", shirt: "#f8c848", shirtD: "#d8a828", pants: "#48a868", accent: "#f84878" },
    dialogueStyle: "chaotic-optimist",
    lines: {
      tired: ["Okay that was a 40% success! That's passing! Barely! We're doing great!", "My gadgets almost never explode! ...Anymore!"],
      krax: ["Hey! That's MY almost-working thing! Give it back!", "I'll invent something to stop him. It might explode. Worth it."],
      boss: ["Ooh, a giant golem! I bet I can make it better! ...Wait, no. Bad idea."],
      fourthwall: ["You've been staring at this screen for hours. Touch grass! ...I'll touch grass for both of us!"]
    }
  },
  mort: {
    id: "mort", name: "Mordecai \"Mort\" Grumble", short: "Mort",
    personality: "Grumpy, reluctant hero, secretly caring",
    backstory: "Former villain who quit because the benefits were terrible.",
    sprite: { hair: "#2a2a2a", hairShade: "#1a1a1a", skin: "#d8b898", skinShade: "#b89878", shirt: "#5a2a2a", shirtD: "#3a1a1a", pants: "#383838", accent: "#8a6848" },
    dialogueStyle: "grumpy-ex-villain",
    lines: {
      tired: ["In my villain days, I had dental. DENTAL. Do you know what I'd give for dental?", "I'm too old for this. I was too old for this a decade ago."],
      krax: ["I used to steal things too. I was BETTER at it. This kid's an amateur.", "When I was a villain, we had STANDARDS. And dental."],
      boss: ["A hoarding golem? Please. My old lair had three of these. ...Okay, they were smaller. A lot smaller."]
    }
  },
  zara: {
    id: "zara", name: "Zara Quickfoot", short: "Zara",
    personality: "Witty, competitive, snack-obsessed",
    backstory: "Runs faster than her brain processes consequences.",
    sprite: { hair: "#f8a848", hairShade: "#d88828", skin: "#e8b888", skinShade: "#c89868", shirt: "#48c8a8", shirtD: "#28a888", pants: "#3848a8", accent: "#f8a848" },
    dialogueStyle: "fast-snacker",
    lines: {
      tired: ["I ran here. Then I ran there. Then I forgot why. Do you have snacks?", "My legs move faster than my brain and honestly it's worked out so far."],
      krax: ["He stole my snack dispenser?! I will OUTRUN HIM AND HIS ENTIRE LINEAGE.", "Catch me if you can, Krax! I've had three energy drinks and zero thoughts!"],
      boss: ["It's huge! Can I outrun it? ...Can I outsnack it? Someone distract it while I eat."],
      fourthwall: ["Save the game? I saved a sandwich earlier. Same energy. ...Okay not the same."],
      bossFinal: ["You're not a monster. You're just lonely. ...I get it. I eat my feelings too. Want a snack?"]
    }
  }
};

const HERO_IDS = Object.keys(HEROES);
let chosenHeroId = "kael"; // default; player picks at new game

function getHero(id) {
  return HEROES[id] || HEROES.kael;
}
// currentHero() is defined in player.js (uses player.heroId)
// Get a hero line by context key (with fallback)
function heroLine(contextKey) {
  const h = currentHero();
  if (h.lines && h.lines[contextKey] && h.lines[contextKey].length) {
    return h.lines[contextKey][Math.floor(Math.random() * h.lines[contextKey].length)];
  }
  return "...";
}

// ================= COMPANION CREATURES (named) =================
// Named companion identities layered on top of species. Each has a quirk id
// (see quirks.js), personality blurb, and signature dialogue.
const COMPANIONS = {
  emberfuzz: { name: "Emberfuzz", species: "emberit", element: "pyro", quirk: "dramatic",
    personality: "Mischievous fire-starter who apologizes with singed hugs",
    lines: { idle: "I want to touch it. But DRAMATICALLY.", battle: "BEHOLD! MY POWER! ...Still nothing. BEHOLD AGAIN!" } },
  scorchmuffin: { name: "Scorchmuffin", species: "emberit", element: "pyro", quirk: "overconfident",
    personality: "Insists it can handle anything, then immediately fails",
    lines: { idle: "Fear not! ...oh no, that's a big enemy. Could you take this one?", battle: "I shall save the— IT'S HUGE. RETREAT. STRATEGIC RETREAT." } },
  zapscale: { name: "Zapscale", species: "sparkit", element: "cyber", quirk: "overconfident",
    personality: "Overconfident but can't control its own lightning farts",
    lines: { idle: "I'm SO fast. Watch me— *zap* —ok that was the floor.", battle: "CHAAARGE! *fzzt* ...I'll charge from over here." } },
  goober: { name: "Goober", species: "leafon", element: "magic", quirk: "nervous",
    personality: "Clueless but optimistic, absorbs random objects by accident",
    lines: { idle: "Oh no. Oh NO. Is that a LARGE CREATURE? I don't want to fight a LARGE CREATURE.", battle: "I-I'll do my best! Please don't look at me!" } },
  mochi: { name: "Mochi", species: "leafon", element: "magic", quirk: "snackobsessed",
    personality: "Refuses to fight unless fed a snack first",
    lines: { idle: "I'm not fighting until I get a treat. I'm WEAK. I need SUSTENANCE.", battle: "Did you... did you bring snacks? No? Then I'm sitting down." } },
  shelldon: { name: "Shelldon", species: "aquip", element: "frost", quirk: "sleepy",
    personality: "Moves at a glacial pace but throws tantrums if rushed",
    lines: { idle: "Five more minutes... I was having a dream about clouds...", battle: "Why are you so fast? Calm down. Eat a snack. You need THERAPY." } },
  bitbeak: { name: "Bitbeak", species: "breezel", element: "cyber", quirk: "technical",
    personality: "Repeats everything you say in a terrifying robot voice",
    lines: { idle: "01001001 00100000 01100001 01101101 00100000 01100011 01101111 01101110 01100110 01110101 01110011 01100101 01100100. (I am confused.)", battle: "INITIATING COMBAT PROTOCOLS. RESULT: UNCERTAIN. REBOOTING." } },
  barkley: { name: "Barkley", species: "leafon", element: "magic", quirk: "sleepy",
    personality: "Photosynthesizes during battle, refuses to fight on cloudy days",
    lines: { idle: "Is it... cloudy? I can't fight if it's cloudy. That's the rule. I made it.", battle: "I need sunlight. This is non-negotiable. I'll wait." } },
  novaflare: { name: "Novaflare", species: "emberit", element: "pyro", quirk: "dramatic", legendary: true,
    personality: "Celestial Phoenix. Resurrects once per battle with dramatic sparkles",
    lines: { idle: "I'm a CELESTIAL PHOENIX. You're a fox that sneezes sparks. We are not the same.", battle: "FROM THE ASHES I RISE! ...That was my entrance. The fight starts now." } },
  inkwell: { name: "Inkwell", species: "aquip", element: "shadow", quirk: "nervous", legendary: true,
    personality: "Abyssal Krakenling. Fits in your pocket but demands constant attention",
    lines: { idle: "Notice me. NOTICE ME. I'm right here. In your pocket. Pay attention.", battle: "I'm small but I'm MEAN. ...Please still pay attention to me after." } },
  gearscream: { name: "Gearscream", species: "sparkit", element: "cyber", quirk: "technical", legendary: true,
    personality: "Mechanical Dragon. Speaks in binary and judges your life choices",
    lines: { idle: "01000011 01101111 01101110 01100111 01110010 01100001 01110100 01110101 01101100 01100001 01110100 01101001 01101111 01101110 01110011. (Congratulations.) ...On nothing. Just generally.", battle: "I HAVE ANALYZED YOUR STRATEGY. IT IS SUBOPTIMAL. LIKE YOUR LIFE." } }
};

function getCompanion(id) {
  return COMPANIONS[id] || null;
}

// ================= RIVAL: KRAX THE GRABBER =================
const RIVAL_KRAX = {
  id: "krax", name: "Krax the Grabber",
  personality: "Treasure-hunting kleptomaniac. Not evil—just wildly selfish and deeply insecure.",
  appearance: "Scruffy adventurer, perpetual smirk, overflowing bag of stolen items, pet slime Sticky.",
  petName: "Sticky",
  petType: "kleptomaniac slime",
  sprite: { hair: "#4a8a4a", hairShade: "#2a6a2a", skin: "#e0b890", skinShade: "#c09870", shirt: "#8a5a2a", shirtD: "#6a4a1a", pants: "#5a4a3a", bag: "#a87838" },
  catchphrases: [
    "Finders keepers! Oh wait, I found it first!",
    "You snooze, you lose! Actually, I'd steal it either way.",
    "Mine now! Thanks for carrying it for me!",
    "I'm not stealing! I'm... relocating items to a better home!",
    "This tool looks expensive. You probably didn't need it anyway.",
    "I'll give it back! Eventually! When I'm dead!",
    "You have too many tools. I'm helping you declutter.",
    "I'm the hero of this story. I just haven't told you that part yet.",
    "Catch you later! Or not! I'll probably steal something else first!"
  ],
  encounters: {
    first: {
      cond: null, // first meeting after getting starter
      lines: [
        "Krax: (dropping from a tree) Well, WELL, WELL! Look who's walking around with my stuff!",
        "Hero: Your stuff? I literally just found this five minutes ago.",
        "Krax: Correction—you found it, I saw you find it, and now I'm claiming it! Thanks for the delivery!",
        "(He snatches a tool and runs away, cackling)",
        "Hero: I'm going to END him. Politely. In a court of law. Maybe."
      ],
      steal: true
    },
    mid: {
      cond: "GYM_1_DEFEATED",
      lines: [
        "Krax: (riding a stolen companion) Nice pet! Looks expensive. I'll take it!",
        "Companion: Wait, what? No! I'm a person! I have feelings!",
        "Krax: Feelings don't pay the bills, buddy. SORRY!",
        "(Your companion escapes and pokes him in the eye)",
        "Krax: OW! Okay! Fine! Keep your stupid creature! I didn't want it anyway!",
        "Hero: You literally tried to steal it three seconds ago.",
        "Krax: I changed my mind! It has ATTITUDE problems!"
      ],
      steal: true
    },
    final: {
      cond: "KRAX_FINAL_READY",
      lines: [
        "Krax: (surrounded by stolen items) You know what? I respect you. You keep finding things. I keep taking them. We're like... a team!",
        "Hero: You're the reason I can't have nice things.",
        "Krax: And you're the reason I HAVE nice things! We complete each other!",
        "(He throws a stolen item at you and bolts)",
        "Krax: Catch you later! I'll probably steal something else first!"
      ],
      steal: true
    }
  },
  // Rival battle team (scales with player progress)
  team: function(avgLevel) {
    const lvl = Math.max(6, Math.floor(avgLevel));
    return [
      { speciesKey: "rattick", level: lvl, element: "junk" },
      { speciesKey: "sparkit", level: lvl + 1, element: "cyber" },
      { speciesKey: "emberit", level: lvl + 2, element: "pyro" }
    ];
  }
};

// Krax stealing mechanic
const KRAX_STATE = {
  cooldown: 0,           // turns until Krax can appear again
  encounterChance: 0.08, // base chance per overworld step when not on cooldown
  minCooldown: 30        // steps
};

// What Krax can do when he appears
function kraxStealActions() {
  return [
    { id: "stealTool", desc: "Steals one random power-up tool from your inventory", weight: 50 },
    { id: "disableTool", desc: "Disables one of your equipped tools for the next battle", weight: 25 },
    { id: "swapJunk", desc: "Swaps a tool with a junk item (stick, rock, angry frog)", weight: 15 },
    { id: "taunt", desc: "Taunts you with unskippable dialogue. You must endure it.", weight: 10 }
  ];
}

// ================= BOSS: GIGA-THOK THE TREASURE GOLEM =================
const BOSS_GIGA_THOK = {
  id: "gigathok", name: "Giga-Thok",
  title: "The Treasure Golem",
  lore: "A legendary golem constructed from thousands of stolen power-up tools, ancient artifacts, and discarded loot. Created by a greedy wizard who wanted to protect his hoard—but the golem grew sentient and decided to BECOME the hoard. Now it roams the overworld, absorbing treasure and challenging anyone foolish enough to approach. It speaks in booming rhymes and terrible puns.",
  sprite: { body: "#8a7a5a", bodyDark: "#5a4a3a", core: "#f8d818", coreGlow: "rgba(248,216,24,0.6)", eye: "#f84838" },
  maxHpBase: 300,
  level: 30,
  preBattle: [
    "Giga-Thok: (rising from the ground, tools clattering) A challenger approaches! How bold! How BRASH!",
    "Giga-Thok: I eat adventurers for breakfast—with a side of CRASH!",
    "Giga-Thok: Your weapons are shiny, your armor is CLEAN, but you face a golem LOOT-OBSESSED AND MEAN!",
    "Hero: (deadpan) Did you just rhyme 'crash' with 'crash'?",
    "Giga-Thok: I'M A GOLEM, NOT A POET! LET'S FIGHT!"
  ],
  phases: [
    {
      name: "The Clumsy Construct", hpRange: [0.75, 1.0],
      visual: "Sluggish, tools rattling loose. Items occasionally fall off and roll around.",
      attacks: ["toolToss", "stompSlam", "treasureShield"],
      dialogue: [
        "Giga-Thok: I've got a HOARD and I'll use it! Watch me throw a toaster!",
        "(A toaster bounces off your companion's head)",
        "Companion: Ow. That was... surprisingly tasty?",
        "Hero: That's not how toasters work! That's not how ANYTHING works!"
      ],
      mechanic: "Loot drops during this phase; collect them to use against the boss."
    },
    {
      name: "The Overclocked Apex", hpRange: [0.4, 0.75],
      visual: "Absorbs nearby tools, grows 50% larger. Orange energy glow, tools spin in a vortex. Eyes flash red and blue.",
      attacks: ["toolCyclone", "laserGoggleBlast", "rocketCharge"],
      dialogue: [
        "Giga-Thok: You've made me ANGRY! I'll use your own tricks against you!",
        "(It equips stolen Laser-Pointer Goggles but points them backwards)",
        "Giga-Thok: Wait, how do these—MY FACE! I'VE BLINDED MY FACE!",
        "Hero: Did you... just blast yourself in the eye?",
        "Giga-Thok: I MEANT TO DO THAT! IT'S A TACTICAL MOVE!"
      ],
      mechanic: "Giga-Thok steals one of YOUR equipped power-up tools mid-battle. Adapt!"
    },
    {
      name: "The Desperate Hoarder", hpRange: [0.1, 0.4],
      visual: "Cracked and damaged, glowing core exposed in its chest. Moves erratically, trips over its own legs.",
      attacks: ["desperateGrab", "corePulse", "miniGolemSummon"],
      dialogue: [
        "Giga-Thok: You can't have my STUFF! It's ALL MINE! MINE I SAY!",
        "(It hugs a pile of trash protectively)",
        "Hero: That's literally garbage. You're hugging garbage.",
        "Giga-Thok: IT'S VINTAGE GARBAGE! VERY RARE!",
        "Companion: I don't think vintage means what you think it means.",
        "Giga-Thok: STOP JUDGING MY LIFE CHOICES!"
      ],
      mechanic: "Giga-Thok uses stolen tools, but they malfunction because it doesn't know how to use them."
    },
    {
      name: "The Lost Soul", hpRange: [0.0, 0.1],
      visual: "Collapses to its knees. Tools fall away, revealing a sad, lonely core with a child-like face drawn in marker.",
      attacks: ["finalPlea", "sobbingQuake", "infiniteProcrastination"],
      dialogue: [
        "Giga-Thok: (quietly) I just... I just wanted someone to play with. Nobody ever stays. They just want my stuff.",
        "Hero: (softening) Oh. Oh, buddy. You're not a monster. You're just a lonely trash golem.",
        "Giga-Thok: You think so? You're not just saying that because I'm crying on the floor?",
        "Hero: I mean, that definitely helps. But yeah, you're okay.",
        "Giga-Thok: (perking up) Wanna see my REAL collection? I have a very rare stale potato chip that looks like a frog!"
      ],
      mechanic: "Player chooses: Spare, Defeat, or Hug.",
      endings: {
        spare: { lines: ["Giga-Thok becomes a friendly companion, giving you access to its hoard of tools!", "Giga-Thok: You're my first real friend! Here—take anything! I have SO much!"], reward: { tools: 5, xp: 500 } },
        defeat: { lines: ["Giga-Thok crumbles, releasing a legendary tool...", "...but the victory feels hollow. You feel a pang of guilt that may never fade."], reward: { legendaryTool: "starFragment", xp: 1000 } },
        hug: { lines: ["You hug Giga-Thok. It cries with joy. Then it cries MORE.", "Giga-Thok: NOBODY HAS EVER HUGGED ME BEFORE! *sob*", "Giga-Thok: Take EVERYTHING! And... and can I come with you? Please?"], reward: { tools: 10, xp: 750, companion: true } }
      }
    }
  ],
  // Boss-specific attack definitions
  attacks: {
    toolToss: { name: "Tool Toss", power: 45, type: "normal", desc: "Throws random power-up tools (bananas, rubber chickens). Items bounce comically." },
    stompSlam: { name: "Stomp Slam", power: 60, type: "ground", desc: "Stomps the ground, shockwaves and dropping loot.", flinch: 30 },
    treasureShield: { name: "Treasure Shield", power: 0, type: "steel", desc: "Blocks with a wall of golden coins. Raises Defense.", stat: { target: "self", stat: "def", stages: 2 } },
    toolCyclone: { name: "Tool Cyclone", power: 75, type: "steel", desc: "Spins rapidly, whirlwind of sharp objects. Hits all party members.", target: "all-allies" },
    laserGoggleBlast: { name: "Laser Goggle Blast", power: 80, type: "electric", desc: "Uses stolen Laser-Pointer Goggles. 50% chance to hit itself instead.", selfHit: 0.5 },
    rocketCharge: { name: "Rocket Charge", power: 90, type: "normal", desc: "Activates Rocket Booster Harness to ram the party. High damage, must recharge.", recharge: true },
    desperateGrab: { name: "Desperate Grab", power: 40, type: "normal", desc: "Tries to steal your companions' items. 30% success.", stealItem: 0.3 },
    corePulse: { name: "Core Pulse", power: 70, type: "dragon", desc: "Core glows intensely, emits a damaging shockwave.", target: "all-allies" },
    miniGolemSummon: { name: "Mini-Golem Summon", power: 0, type: "normal", desc: "Spawns smaller golems made of loose change.", summon: true },
    finalPlea: { name: "Final Plea", power: 0, type: "normal", desc: "Begs you to stop. Deals 'emotional damage'—lowers party Attack.", debuffParty: { atk: -1 } },
    sobbingQuake: { name: "Sobbing Quake", power: 30, type: "ground", desc: "Cries so hard the ground shakes. Low damage, high guilt.", target: "all-allies" },
    infiniteProcrastination: { name: "Infinite Procrastination", power: 0, type: "normal", desc: "Just... keeps talking. Does nothing. The battle stalls emotionally." }
  }
};
