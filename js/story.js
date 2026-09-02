// ============================================================
//  Monster Catcher — Story & World Content
//  Region lore, NPCs per map, gym leaders, rivals, dialogue.
// ============================================================

const WORLD = {
  regionName: "Verdale",
  townName: "Mossmere Hollow",
  professorName: "Professor Alder Thorne",
  rivalName: "Kestrel",
  antagonistTeam: "Team Dusk"
};

// ---- Intro story shown at title -> new game ----
const STORY_INTRO = [
  `Welcome to the ${WORLD.regionName} region!`,
  `I'm ${WORLD.professorName}. I study the wild creatures that share our world.`,
  `People who befriend and train them are called Tamers.`,
  `Your journey begins here in ${WORLD.townName}.`,
  `Step into the tall grass to the south when you're ready. Good luck!`
];

// ---- Starter selection dialogue (shown after professor greeting) ----
const STARTER_DIALOGUE = [
  `Ah, you've come! Each new Tamer chooses a first partner.`,
  `I have three here. Which will you take?`,
  `__STARTER_MENU__`
];

// ---- NPCs are grouped by map id so the world module can ask for them ----
// Each NPC: id, map, col, row, facing, sprite, isTrainer, dialogue,
// defeatedDialogue, team (for trainers), hideOnDefeat, condition (flag).
const NPCS = [
  // ---- Mossmere ----
  {
    id: "professor", map: "lab", col: 4, row: 3, facing: "down",
    sprite: "#e8b34f", isTrainer: false,
    dialogue: STARTER_DIALOGUE,
    givesStarter: true
  },
  {
    id: "mom", map: "mossmere", col: 2, row: 2, facing: "right",
    sprite: "#d68fb0", isTrainer: false,
    dialogue: [
      "Mom: Have a great adventure, dear! And remember to visit Healing Centers.",
      "Mom: I packed some Basic Balls in your bag. Be careful out there!"
    ],
    givesBalls: true
  },
  {
    id: "signpost_mossmere", map: "mossmere", col: 0, row: 7, facing: "right",
    sprite: "#888", isTrainer: false,
    dialogue: ["Mossmere Hollow — A quiet village at the forest's edge."]
  },

  // ---- Route 1 ----
  {
    id: "rival1", map: "route1", col: 6, row: 4, facing: "left",
    sprite: "#d65f5f", isTrainer: true,
    dialogue: [
      `${WORLD.rivalName}: Hey! Heading out already?`,
      `${WORLD.rivalName} wants to battle!`
    ],
    defeatedDialogue: [
      `${WORLD.rivalName}: ...Fine. You got lucky this time.`,
      `${WORLD.rivalName}: I'll be back. Don't get cocky.`
    ],
    team: [
      { speciesKey: "aquip", level: 6 },
      { speciesKey: "rattick", level: 5 }
    ],
    flagOnDefeat: FLAGS.RIVAL_1_DEFEATED,
    hideOnDefeat: true
  },
  {
    id: "youngster_route1", map: "route1", col: 3, row: 6, facing: "up",
    sprite: "#9fb83f", isTrainer: true,
    dialogue: ["Youngster Jo: I just caught my first one! Let's test it!"],
    defeatedDialogue: ["Youngster Jo: Wow, you're strong!"],
    team: [{ speciesKey: "rattick", level: 4 }],
    hideOnDefeat: false
  },

  // ---- Verdantown ----
  {
    id: "clerk_center", map: "center", col: 4, row: 2, facing: "down",
    sprite: "#d64545", isTrainer: false,
    dialogue: ["Welcome to the Healing Center! Would you like me to heal your monsters? __HEAL_MENU__"],
    isHealer: true
  },
  {
    id: "clerk_shop", map: "shop", col: 4, row: 1, facing: "down",
    sprite: "#2f6bb0", isTrainer: false,
    dialogue: ["Welcome to the Mart! What would you like? __SHOP_MENU__"],
    isShopkeeper: true
  },
  {
    id: "townfolk_verdant", map: "verdantown", col: 6, row: 5, facing: "left",
    sprite: "#bcd9e8", isTrainer: false,
    dialogue: ["Locals say a rare dragon roosts beyond the frozen peaks. Few have seen it."]
  },

  // ---- Route 2 ----
  {
    id: "birdkeeper_route2", map: "route2", col: 7, row: 1, facing: "left",
    sprite: "#7fa8d6", isTrainer: true,
    dialogue: ["Bird Keeper Wren: My Breezel hasn't lost a fight yet!"],
    defeatedDialogue: ["Bird Keeper Wren: Grounded... nice one."],
    team: [{ speciesKey: "breezel", level: 9 }],
    hideOnDefeat: false
  },
  {
    id: "lass_route2", map: "route2", col: 1, row: 5, facing: "right",
    sprite: "#d68fb0", isTrainer: true,
    dialogue: ["Lass Mira: My frost friends and I love the cold!"],
    defeatedDialogue: ["Lass Mira: Brr... that was intense!"],
    team: [
      { speciesKey: "frostip", level: 10 },
      { speciesKey: "toxipod", level: 9 }
    ],
    hideOnDefeat: false
  },

  // ---- Frostpeak Cave ----
  {
    id: "hiker_cave", map: "frostcave", col: 5, row: 4, facing: "left",
    sprite: "#b08d57", isTrainer: true,
    dialogue: ["Hiker Bram: Careful — the cave folk don't take kindly to strangers."],
    defeatedDialogue: ["Hiker Bram: You've got grit, kid. The city's just ahead."],
    team: [
      { speciesKey: "digmole", level: 11 },
      { speciesKey: "pebblix", level: 11 }
    ],
    hideOnDefeat: false
  },
  {
    id: "dusk_grunt_cave", map: "frostcave", col: 2, row: 6, facing: "right",
    sprite: "#5a5366", isTrainer: true,
    dialogue: [
      "Team Dusk Grunt: This cave's resources belong to Team Dusk now!",
      "Team Dusk Grunt: Buzz off, kid — or we'll make you."
    ],
    defeatedDialogue: ["Team Dusk Grunt: Tch. This isn't worth the trouble. (retreats)"],
    team: [
      { speciesKey: "shadepup", level: 12 },
      { speciesKey: "venomoth", level: 12 }
    ],
    hideOnDefeat: true,
    flagOnDefeat: FLAGS.TEAM_ROCKET_INTRO
  },

  // ---- Icicle City / Gym ----
  {
    id: "clerk_gymcenter", map: "gymcenter", col: 4, row: 2, facing: "down",
    sprite: "#d64545", isTrainer: false,
    dialogue: ["Welcome! Heal your team before challenging the gym? __HEAL_MENU__"],
    isHealer: true
  },
  {
    id: "gym_trainer1", map: "gym", col: 1, row: 2, facing: "right",
    sprite: "#9fd6e8", isTrainer: true,
    dialogue: ["Gym Trainer: Only the worthy face Frostine. Prove yourself!"],
    defeatedDialogue: ["Gym Trainer: Impressive. The leader awaits."],
    team: [{ speciesKey: "frostip", level: 14 }],
    hideOnDefeat: false
  },
  {
    id: "gym_trainer2", map: "gym", col: 7, row: 2, facing: "left",
    sprite: "#7fb4cf", isTrainer: true,
    dialogue: ["Gym Trainer: The cold sharpens the strong. Are you sharp?"],
    defeatedDialogue: ["Gym Trainer: ...Go on. Frostine is waiting."],
    team: [
      { speciesKey: "frostip", level: 14 },
      { speciesKey: "breezel", level: 13 }
    ],
    hideOnDefeat: false
  },
  {
    id: "gym_leader_frostine", map: "gym", col: 4, row: 3, facing: "down",
    sprite: "#dff0f8", isTrainer: true,
    dialogue: [
      "Frostine: So you've come for the Frost Badge. I admire your nerve.",
      "Frostine: Let the ice decide who is worthy!"
    ],
    defeatedDialogue: [
      "Frostine: ...The ice has spoken. You've earned the Frost Badge.",
      "Frostine: Take it. And may your journey be colder — and clearer — than mine was.",
      "__GIVE_BADGE_1__"
    ],
    team: [
      { speciesKey: "frostip", level: 16 },
      { speciesKey: "bouldron", level: 16 },
      { speciesKey: "glaciorn", level: 18 }
    ],
    hideOnDefeat: true,
    flagOnDefeat: FLAGS.GYM_1_DEFEATED,
    givesBadge: 1
  },

  // ---- Rival rematch in gymtown ----
  {
    id: "rival2", map: "gymtown", col: 2, row: 4, facing: "right",
    sprite: "#d65f5f", isTrainer: true,
    condition: FLAGS.GYM_1_DEFEATED,
    dialogue: [
      `${WORLD.rivalName}: You beat the gym already? Figures.`,
      `${WORLD.rivalName}: I won't fall behind. Let's go!`
    ],
    defeatedDialogue: [
      `${WORLD.rivalName}: Argh. You're always one step ahead.`,
      `${WORLD.rivalName}: ...There's something at the peak. A dragon, they say. Race you there.`
    ],
    team: [
      { speciesKey: "tidalon", level: 18 },
      { speciesKey: "galewing", level: 17 },
      { speciesKey: "rattigor", level: 16 }
    ],
    flagOnDefeat: FLAGS.RIVAL_2_DEFEATED,
    hideOnDefeat: true
  }
];

// Returns the NPCs that belong to a given map (and whose condition, if any, is met).
function getNpcsForMap(mapId) {
  return NPCS.filter(n => {
    if (n.map !== mapId) return false;
    if (n.condition && !(game.flags && game.flags[n.condition])) return false;
    return true;
  });
}

function getNpcAt(col, row) {
  const npcs = getNpcsForMap(world.currentMap);
  return npcs.find(n => n.col === col && n.row === row) || null;
}

// ---- Badge names ----
const BADGES = [
  { name: "Frost Badge", desc: "Won from Leader Frostine of Icicle City." },
  { name: "Verdant Badge", desc: "Won from the Verdantown guardian." },
  { name: "Storm Badge", desc: "Won from the Stormhold leader." }
];

// ============================================================
//  MEGA EXPANSION — Story, Characters, Krax, Boss Intro
// ============================================================

// ---- Hero selection dialogue (shown at new game before starter) ----
const HERO_SELECT_DIALOGUE = [
  `Professor Thorne: Before you choose your first partner...`,
  `Professor Thorne: Who are you, exactly? I've been expecting one of four promising Tamers.`,
  `Professor Thorne: Go on — tell me your name.`,
  `__HERO_SELECT__`
];

// ---- Post hero-selection dialogue ----
function heroIntroDialogue(heroId) {
  const hero = getHero(heroId);
  if (!hero) return ["Professor Thorne: Ah, yes. I've heard about you."];
  return [
    `Professor Thorne: ${hero.name}! The ${hero.short}. Yes, I've heard about you.`,
    `${hero.name}: ${hero.lines.tired[0]}`,
    `Professor Thorne: ...Right. Well, I'm sure you'll do great things.`,
    `Professor Thorne: Now, let's find you a partner creature.`
  ];
}

// ---- Krax the Grabber encounter dialogues ----
const KRAX_DIALOGUE = {
  firstEncounter: [
    "Krax: Well well well. Fresh meat on the trail.",
    "Krax: Name's Krax. I COLLECT power-up tools. From other Tamers. Without asking.",
    "Krax: And you've got a shiny bag there. Mind if I... browse?",
    "Krax: What? You won't just hand them over? Rude. GUESS I'LL TAKE 'EM THE FUN WAY!",
    "__KRAX_BATTLE_1__"
  ],
  midEncounter: [
    "Krax: YOU. Again. Still holding out on me?",
    "Krax: I've been counting your tools. You have MORE now. Unacceptable.",
    "Krax: Time for another 'donation.' Don't worry — I'll put them to better use than you!",
    "__KRAX_BATTLE_2__"
  ],
  finalEncounter: [
    "Krax: Okay. OKAY. I'll admit it. You've got grit.",
    "Krax: But I've been saving the BEST tools for this moment. My personal collection.",
    "Krax: This is it, hero. Winner takes ALL. Every tool either of us has ever grabbed.",
    "Krax: ...Try not to cry when I take everything. It's embarrassing for both of us.",
    "__KRAX_BATTLE_3__"
  ],
  defeated: [
    "Krax: ...Hmph. Fine. FINE. You win this round.",
    "Krax: I'll give back what I took. THIS time. Don't get used to it.",
    "Krax: ...You're alright, hero. For a goody-two-shoes. See you around. Maybe."
  ],
  finalDefeated: [
    "Krax: ...I can't believe it. My whole collection. Gone.",
    "Krax: You know what? Maybe... maybe grabbing isn't everything.",
    "Krax: ...Nah, who am I kidding. But you EARNED this. Take 'em. All of 'em.",
    "Krax: Just... leave me ONE cool one? Please? ...I'll find my own. Eventually. (leaves)"
  ],
  stealSuccess: [
    "Krax: Yoink! Thanks for the — heh heh — donation!",
    "Krax: Finders keepers, losers... uh, lose. That's how it works!",
    "Krax: Ooh, shiny! This is going RIGHT in my collection.",
    "Krax: Don't cry, hero. I'll put it to better use. Probably. Maybe."
  ],
  stealFail: [
    "Krax: What?! You blocked me?! That's — that's not FAIR!",
    "Krax: ...Fine. Be that way. I'll get it next time. (flees)",
    "Krax: Hmph. Guard your stuff well, hero. I respect that. Barely.",
    "Krax: Aww, nothing to grab? You're no fun. (slinks away)"
  ]
};

// ---- Krax NPC definitions (added to NPCS array dynamically) ----
const KRAX_NPCS = [
  {
    id: "krax_1", map: "route2", col: 4, row: 3, facing: "down",
    sprite: "#c84030", isTrainer: true,
    condition: FLAGS.GOT_FIRST_BALLS,
    dialogue: KRAX_DIALOGUE.firstEncounter,
    defeatedDialogue: KRAX_DIALOGUE.defeated,
    isKrax: true,
    kraxStage: 1,
    team: [
      { speciesKey: "rattigor", level: 10 },
      { speciesKey: "shadepup", level: 9 }
    ],
    flagOnDefeat: FLAGS.KRAX_DEFEATED_1,
    hideOnDefeat: true
  },
  {
    id: "krax_2", map: "gymtown", col: 5, row: 5, facing: "left",
    sprite: "#c84030", isTrainer: true,
    condition: FLAGS.GYM_1_DEFEATED,
    dialogue: KRAX_DIALOGUE.midEncounter,
    defeatedDialogue: KRAX_DIALOGUE.defeated,
    isKrax: true,
    kraxStage: 2,
    team: [
      { speciesKey: "rattigor", level: 18 },
      { speciesKey: "voltagon", level: 17 },
      { speciesKey: "shadepup", level: 16 }
    ],
    flagOnDefeat: FLAGS.KRAX_DEFEATED_2,
    hideOnDefeat: true
  },
  {
    id: "krax_3", map: "junkwaste", col: 7, row: 4, facing: "left",
    sprite: "#c84030", isTrainer: true,
    condition: FLAGS.KRAX_DEFEATED_2,
    dialogue: KRAX_DIALOGUE.finalEncounter,
    defeatedDialogue: KRAX_DIALOGUE.finalDefeated,
    isKrax: true,
    kraxStage: 3,
    team: [
      { speciesKey: "rattigor", level: 28 },
      { speciesKey: "voltagon", level: 27 },
      { speciesKey: "pyrothorn", level: 26 },
      { speciesKey: "shadepup", level: 25 }
    ],
    flagOnDefeat: FLAGS.KRAX_DEFEATED_3,
    hideOnDefeat: true
  }
];

// Merge Krax NPCs into the main NPCS array
KRAX_NPCS.forEach(n => NPCS.push(n));

// ---- Boss Giga-Thok intro ----
const BOSS_INTRO_DIALOGUE = [
  "As you enter the deepest chamber of the Junk Wasteland...",
  "A colossal shape stirs. Scrap metal and ancient treasure clatter together.",
  "Two glowing eyes ignite in the darkness.",
  "Giga-Thok: ...VISITOR. YOU SEEK TREASURE? OR... DESTRUCTION?",
  "Giga-Thok: I AM THE KEEPER. THE LAST GUARDIAN OF WHAT OTHERS DISCARDED.",
  "Giga-Thok: ALL THINGS HAVE VALUE. EVEN THE BROKEN. EVEN THE LOST.",
  "Giga-Thok: ...PROVE YOUR WORTH, SMALL ONE. OR JOIN MY COLLECTION.",
  "__BOSS_BATTLE__"
];

// ---- Biome entry hints (shown when entering a new biome for the first time) ----
const BIOME_ENTRY_HINTS = {
  volcano: "The air shimmers with heat. The Scorching Volcano stretches before you — home to fiery creatures and molten treasure.",
  cybercity: "Neon lights flicker across rain-slick streets. Welcome to Neon-Cyber City, where data flows like water and glitch-creatures roam.",
  crystalforest: "Crystalline trees chime softly in the breeze. The Enchanted Crystal Forest is tranquil, ancient, and full of magical beings.",
  junkwaste: "Piles of scrap stretch to the horizon. The Forgotten Junk Wasteland — where broken things are reborn. And where something massive awaits...",
  glacialpeaks: "Biting wind greets you at the summit. The Glacial Peak Mountains are beautiful, deadly, and home to creatures of pure ice.",
  abyssal: "Darkness envelops you. The Abyssal Trench plunges into the unknown — bioluminescent creatures drift in the crushing deep.",
  stormsavanna: "Thunder rumbles overhead. The Stormy Savanna crackles with electric energy and creatures that thrive in the chaos.",
  moonmarsh: "Silver mist curls around ancient trees. The Moonlight Marsh is peaceful, mysterious, and alive with ghostly light."
};

// ---- New NPCs for biome maps ----
const BIOME_NPCS = [
  // Volcano — a heat-obsessed trainer
  {
    id: "volcano_trainer", map: "volcano", col: 5, row: 3, facing: "down",
    sprite: "#f86020", isTrainer: true,
    dialogue: ["Ember Mage Sera: The volcano tests all who enter. Are you forged strong enough?"],
    defeatedDialogue: ["Ember Mage Sera: You burn bright, hero. The legendary tools deeper in may aid you."],
    team: [
      { speciesKey: "magmaSlug", level: 22 },
      { speciesKey: "obsidianHawk", level: 24 }
    ],
    hideOnDefeat: false
  },
  // Cyber City — a glitch hacker
  {
    id: "cyber_trainer", map: "cybercity", col: 8, row: 4, facing: "left",
    sprite: "#20d8a0", isTrainer: true,
    dialogue: ["Glitch Runner Vex: I've rewritten my team's code. Let's see if your data can handle it."],
    defeatedDialogue: ["Glitch Runner Vex: Error 404: My winning strategy not found. Nice battle, hero."],
    team: [
      { speciesKey: "cyberPigeon", level: 26 },
      { speciesKey: "glitchHound", level: 25 }
    ],
    hideOnDefeat: false
  },
  // Crystal Forest — a mystic
  {
    id: "crystal_trainer", map: "crystalforest", col: 4, row: 5, facing: "up",
    sprite: "#c080f0", isTrainer: true,
    dialogue: ["Crystal Seer Lume: The forest speaks to me. It says... you are interesting."],
    defeatedDialogue: ["Crystal Seer Lume: The crystals approve of you. Take this wisdom: not all battles end in victory."],
    team: [
      { speciesKey: "crystalDeer", level: 28 },
      { speciesKey: "glowingSprite", level: 27 }
    ],
    hideOnDefeat: false
  },
  // Glacial Peaks — an ice climber
  {
    id: "glacial_trainer", map: "glacialpeaks", col: 6, row: 2, facing: "down",
    sprite: "#90c0f0", isTrainer: true,
    dialogue: ["Ice Climber Bjorn: The cold never bothered me anyway! But it might bother YOU!"],
    defeatedDialogue: ["Ice Climber Bjorn: You've got fire in your veins, hero. The peak's guardian awaits above."],
    team: [
      { speciesKey: "iceWolf", level: 30 },
      { speciesKey: "snowYeti", level: 29 }
    ],
    hideOnDefeat: false
  },
  // Stormy Savanna — a storm chaser
  {
    id: "storm_trainer", map: "stormsavanna", col: 3, row: 6, facing: "right",
    sprite: "#f8c020", isTrainer: true,
    dialogue: ["Storm Chaser Zappy: I chase lightning for FUN. Let's see if you can catch THIS!"],
    defeatedDialogue: ["Storm Chaser Zappy: Whoa! You're faster than a bolt! Respect, hero."],
    team: [
      { speciesKey: "thunderRhino", level: 32 },
      { speciesKey: "lightningBird", level: 31 }
    ],
    hideOnDefeat: false
  },
  // Moonlight Marsh — a ghost whisperer
  {
    id: "marsh_trainer", map: "moonmarsh", col: 5, row: 4, facing: "down",
    sprite: "#a8a8d8", isTrainer: true,
    dialogue: ["Ghost Whisperer Ember: The marsh holds memories. And so do I. Battle me to learn them."],
    defeatedDialogue: ["Ghost Whisperer Ember: You carry warmth, hero. The marsh spirits are pleased. The Abyssal Trench calls to you now."],
    team: [
      { speciesKey: "willOWisp", level: 34 },
      { speciesKey: "ghostMoth", level: 33 }
    ],
    hideOnDefeat: false
  },
  // Junk Wasteland — a scrap merchant (sells power-up tools)
  {
    id: "scrap_merchant", map: "junkwaste", col: 2, row: 3, facing: "right",
    sprite: "#b89060", isTrainer: false,
    dialogue: ["Scrap Merchant Rusty: One person's junk is another's treasure! Wanna buy some power-up tools? __SHOP_MENU__"],
    isShopkeeper: true,
    isToolShop: true
  },
  // Biome warp NPC — fast travel attendant
  {
    id: "travel_attendant", map: "verdantown", col: 3, row: 3, facing: "down",
    sprite: "#48b8c8", isTrainer: false,
    condition: FLAGS.FAST_TRAVEL,
    dialogue: ["Travel Attendant: Fast travel unlocked! Where would you like to go? __FAST_TRAVEL_MENU__"]
  }
];

// Merge biome NPCs into the main NPCS array
BIOME_NPCS.forEach(n => NPCS.push(n));

// ---- Side quest: the sleeping giant (branching dialogue) ----
const SLEEPING_GIANT_QUEST = {
  intro: [
    "In a clearing ahead, a massive creature sleeps peacefully...",
    "It's surrounded by glittering treasure. This could be a legendary encounter.",
    "How will you approach?"
  ]
};

// ---- Side quest: treasure chest (mimic encounter) ----
const TREASURE_CHEST_QUEST = {
  intro: [
    "An ornate treasure chest sits in the middle of the path.",
    "It's... suspiciously clean. And the lid seems to be breathing.",
    "What do you do?"
  ]
};

// ---- Expanded story arcs ----
const STORY_ARCS = {
  // After beating gym 1, the biomes become accessible
  biomeUnlock: [
    "Professor Thorne (Holo-Call): Incredible! You earned the Frost Badge!",
    "Professor Thorne: I've detected unusual energy signatures across the region — eight distinct biomes!",
    "Professor Thorne: Each holds unique creatures and power-up tools. I've unlocked fast travel for you.",
    "Professor Thorne: Use the Travel Attendant in Verdantown to reach them. Explore, hero!",
    "__UNLOCK_FAST_TRAVEL__"
  ],
  // The deeper story — Krax and the boss
  bossRumors: [
    "Townfolk: They say something ancient guards the deepest part of the Junk Wasteland.",
    "Townfolk: A golem made of treasure and scrap. Giga-Thok, they call it.",
    "Townfolk: It doesn't attack travelers... but it never lets anyone take its hoard.",
    "Townfolk: Some say it's just lonely. Others say it'll crush you without hesitation.",
    "Townfolk: If you're heading there... be ready for anything, hero."
  ]
};

// ---- Contextual NPC dialogue (reacts to player state) ----
function getContextualNpcDialogue(npcId) {
  const partySize = player.party.length;
  const avgLvl = partyAverageLevel();

  if (npcId === "mom") {
    if (partySize === 0) return "Mom: Have you visited the lab yet? Professor Thorne is waiting for you!";
    if (partySize <= 2) return "Mom: Your team is growing! Don't forget to heal at the Center.";
    return "Mom: Look at you — a real Tamer! I'm so proud. Stay safe out there, dear.";
  }
  if (npcId === "professor") {
    if (player.flags[FLAGS.BOSS_HUGGED]) return "Professor Thorne: You... HUGGED Giga-Thok? And it joined you? I — I need to write a paper about this.";
    if (player.flags[FLAGS.BOSS_DEFEATED]) return "Professor Thorne: Giga-Thok has fallen. A mighty feat, but I wonder... was there another way?";
    if (player.flags[FLAGS.BOSS_SPARED]) return "Professor Thorne: You spared the Treasure Golem? Compassion is a rare strength, hero. Well done.";
    return "Professor Thorne: The biomes hold many secrets. Explore them all, hero!";
  }
  return null;
}

