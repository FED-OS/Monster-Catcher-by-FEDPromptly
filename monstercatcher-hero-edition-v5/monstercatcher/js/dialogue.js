// ============================================================
//  PROJECT HERO — Branching Dialogue & Comedy System
//  Interactive choice branches, party banter, fourth-wall breaks,
//  contextual location dialogue, Krax quotes, reactive dialogue.
// ============================================================

// Dialogue choice branch system. A dialogue node can present options;
// each option routes to a follow-up sequence and may trigger a game action.
// Format: { speaker, text, options: [ { label, goto, action } ] }
// Actions: "stealth_minigame", "battle_intro", "lullaby_event", etc.

const BRANCHING_SCENES = {
  // ---- Discovering a Sleeping Giant Creature ----
  sleepingGiant: {
    id: "sleepingGiant",
    intro: [
      "Hero: Great. Fantastic. A six-ton apex predator blocking the only bridge out of here, and it's sleeping like a newborn kitten. Anyone have a spare air-horn?",
      "Companion (Stage 2 Chonk): I could poke it with this very sharp stick I found.",
      "Hero: Yes, let's poke the hyper-destructive dragon beast with a piece of a pine tree. Truly, a tactical mastermind is leading this party."
    ],
    options: [
      {
        label: "Try to sneak past by walking incredibly slowly.",
        action: "stealth_minigame",
        result: [
          "(The hero tries to tip-toe. A stealth-meter UI slider pops up.)",
          "Hero: Slowly... slowly... do NOT step on the—",
          "(CRACK. A twig. The loudest twig in recorded history.)",
          "Hero: ...twig."
        ]
      },
      {
        label: "Equip the Laser-Pointer Goggles and blast it awake.",
        action: "battle_intro",
        result: [
          "Hero: Power tools it is. (activates Laser-Pointer Goggles)",
          "(A flash-effect battle intro sequence begins!)",
          "Hero: WAKE UP, SLEEPY!",
          "(The giant creature wakes up VERY angry.)",
          "Hero: ...I may have overcorrected."
        ]
      },
      {
        label: "Let the Companion sing a lullaby to keep it asleep.",
        action: "lullaby_event",
        result: [
          "Companion: I'll sing it a lullaby! I have a beautiful voice!",
          "Hero: You absolutely do not.",
          "(The companion sings terribly out of tune. Distorted musical note particles fill the air.)",
          "(The sleeping beast's eye twitches. Then the other eye. Then it rises, FURIOUS.)",
          "Companion: ...It was a lullaby of RAGE. A rare variant.",
          "Hero: RUN."
        ]
      }
    ]
  },

  // ---- Finding a Treasure Chest (Krax Ambush) ----
  treasureChest: {
    id: "treasureChest",
    intro: [
      "Hero: A treasure chest! In the middle of nowhere! This is NOT suspicious at all.",
      "Companion: It's glowing! Glowing means good!",
      "Hero: Glowing means BAIT. But I'm going to open it anyway because I have no impulse control."
    ],
    options: [
      { label: "Open it immediately. Live dangerously.", action: "chest_open", result: ["(You open the chest. It's a Holographic Mimic!)", "Hero: I KNEW IT. I knew it and I did it anyway."] },
      { label: "Poke it with a stick first.", action: "chest_poke", result: ["(You poke it. The chest grumbles.)", "Companion: It said 'ow.'", "Hero: Chests don't say ow.", "Companion: This one did."] },
      { label: "Leave it. Not today, temptation.", action: "chest_leave", result: ["Hero: I'm learning. I'm growing. I'm walking away.", "Companion: ...You're turning back.", "Hero: I'm learning SLOWLY."] }
    ]
  },

  // ---- The Boss Giga-Thok Final Choice ----
  bossFinalChoice: {
    id: "bossFinalChoice",
    intro: [
      "Giga-Thok lies broken, its tools scattered, a small lonely core staring up at you.",
      "Giga-Thok: (quietly) I just wanted someone to play with..."
    ],
    options: [
      { label: "Spare It — It becomes a friend and shares its hoard.", action: "boss_spare", result: ["Giga-Thok: You're my first real friend! Here—take anything!", "(Giga-Thok joins you as a companion and opens its hoard.)"] },
      { label: "Defeat It — Gain a legendary tool, but carry the guilt.", action: "boss_defeat", result: ["Giga-Thok crumbles into a pile of forgotten treasure...", "A legendary Star Fragment glints among the ruins.", "...You take it. It feels heavy. Not from weight."] },
      { label: "Hug It — It cries with joy and gives you EVERYTHING.", action: "boss_hug", result: ["You hug Giga-Thok. It has never been hugged before.", "Giga-Thok: *sob* NOBODY— *sob* —HAS EVER— *sob*", "Giga-Thok: Take everything! And can I come with you? PLEASE?", "(Giga-Thok joins your party as a loyal, weepy companion.)"] }
    ]
  }
};

// ================= PARTY BANTER (random conversations) =================
// Triggered randomly while walking. Pairs of companions chat.
const PARTY_BANTER = [
  {
    pair: ["emberfuzz", "shelldon"],
    lines: [
      "Emberfuzz: Why are you so slow?",
      "Shelldon: Why are you so fast? Calm down. Eat a snack.",
      "Emberfuzz: I don't need snacks! I need SPEED!",
      "Shelldon: You need THERAPY."
    ]
  },
  {
    pair: ["mochi", "bitbeak"],
    lines: [
      "Bitbeak: 01001001 00100000 01101000 01100001 01110100 01100101 00100000 01110011 01101100 01101001 01101101 01100101.",
      "Mochi: ...I don't speak robot.",
      "Bitbeak: Translation: I hate slime.",
      "Mochi: Well, I hate BIRDS!",
      "Bitbeak: ...Fair."
    ]
  },
  {
    pair: ["emberfuzz", "novaflare"],
    lines: [
      "Emberfuzz: You're fire too, right? Are we related?",
      "Novaflare: I'm a CELESTIAL PHOENIX. You're a fox that sneezes sparks.",
      "Emberfuzz: So... that's a yes?",
      "Novaflare: It's a no. A definitive no."
    ]
  },
  {
    pair: ["goober", "scorchmuffin"],
    lines: [
      "Scorchmuffin: Fear not, little slime! I shall protect you!",
      "Goober: ...from what?",
      "Scorchmuffin: ...I'll know it when I see it. Probably.",
      "Goober: That's not reassuring.",
      "Scorchmuffin: It's not supposed to be! It's supposed to be HEROIC!"
    ]
  },
  {
    pair: ["shelldon", "barkley"],
    lines: [
      "Shelldon: ...zzz...",
      "Barkley: ...zzz...",
      "(Both asleep. Standing up. In the middle of a field.)",
      "Hero: We are NEVER going to get anywhere."
    ]
  }
];

// ================= FOURTH-WALL BREAKS =================
const FOURTH_WALL_LINES = {
  hero: [
    "You've been staring at this screen for 4 hours. Touch grass.",
    "I know you're just clicking buttons, but I feel your love.",
    "Can you please save the game? I'm worried.",
    "Are you going to pick the funny option again? ...I respect that.",
    "Do you EVER rest? I'm exhausted and I'm not even real.",
    "Save file's looking a little lonely. Just saying."
  ],
  companion: [
    "Are you reading these dialogues? I put a lot of effort into these jokes!",
    "Pst. I know you're just selecting the funny option every time. I respect that.",
    "This battle would be easier if you'd leveled me up earlier. Just saying. You can hear me, right?",
    "I'm self-aware enough to know my AI is questionable. Don't rub it in.",
    "Bad physics? You're seeing it too, right? The gravity is... optimistic."
  ],
  krax: [
    "I know you can just reload the save. I DON'T CARE. I'll steal it AGAIN.",
    "You could've stopped me. You were busy reading dialogue. Your fault.",
    "I see you mashing buttons. I'm mashing my escape button. We're the same."
  ]
};

// ================= CONTEXTUAL (LOCATION-BASED) DIALOGUE =================
const CONTEXTUAL_DIALOGUE = {
  lowHp: ["Oh no. Oh no. We're going to DIE.", "My HP bar is a suggestion at this point.", "I'm at 1 HP. ONE. That's not a number, that's a cry for help."],
  victory: ["HAH! We did it! I NEVER doubted us!", "Victory! ...I contributed. Spiritually.", "We won! Nobody ask what I actually did."],
  defeat: ["...Okay, that was my fault. I'm sorry.", "We lost. I'm going to blame the lag. There is no lag. I'm going to blame it anyway.", "Defeat. The dark. The void. ...Can we try again?"],
  levelUp: ["I FEEL SO POWERFUL! I COULD PUNCH A MOUNTAIN!", "Level up! My stats went up! ALL of them! Even the bad ones!", "I grew! In power AND emotionally! ...Mostly power."],
  newTool: ["What does this do? ...I'm scared to find out.", "Ooh, shiny! Is it a weapon? A snack? A weapon-snack?", "New tool acquired. My bag is now 40% mystery."],
  newBiome: ["WOAH! Where are we? This is AMAZING!", "New biome! Smells different. ...Not always good different.", "We've never been here! My instincts say 'danger.' My heart says 'loot.'"],
  kraxAppears: ["NOT THIS GUY AGAIN. RUN!", "Krax. Of course. Why wouldn't it be Krax.", "Hold onto your tools. The klepto is here."],
  evolution: ["I'm... I'm CHANGING. Is this normal?! It feels WEIRD!", "EVOLUTION! Watch me become MAGNIFICENT! ...Please watch."],
  bossPhase: ["It changed! It's BIGGER now! Why is it ALWAYS bigger?!", "New phase, new problems. Classic boss."],
  sleepingCreature: ["It's asleep. Should we... should we wake it? We should NOT wake it.", "A sleeping giant. This is fine. Everything is fine. Nothing is fine."]
};

// Get a random line from a category
function randomLine(arr) {
  if (!arr || !arr.length) return "...";
  return arr[Math.floor(Math.random() * arr.length)];
}

// Pick a contextual line by key, flavored by hero
function contextualLine(key) {
  const base = CONTEXTUAL_DIALOGUE[key] || ["..."];
  const line = randomLine(base);
  // Some contexts use hero-specific lines
  if (key === "lowHp" || key === "victory" || key === "defeat") {
    return "Hero: " + line;
  }
  if (key === "kraxAppears") {
    return heroLine("krax");
  }
  return line;
}

// A random fourth-wall line (hero or companion)
function fourthWallLine(speaker) {
  const pool = speaker === "krax" ? FOURTH_WALL_LINES.krax : (speaker === "companion" ? FOURTH_WALL_LINES.companion : FOURTH_WALL_LINES.hero);
  return randomLine(pool);
}

// Random party banter (picks any pair regardless of who's in party for simplicity)
function randomBanter() {
  return PARTY_BANTER[Math.floor(Math.random() * PARTY_BANTER.length)];
}

// ================= BRANCHING DIALOGUE RUNTIME =================
// Active branching dialogue state
let branchDialogue = null; // { scene, phase: "intro"|"options"|"result", optionCursor, chosenOption }

function startBranchDialogue(sceneId) {
  const scene = BRANCHING_SCENES[sceneId];
  if (!scene) return false;
  branchDialogue = { scene, phase: "intro", lineIndex: 0, optionCursor: 0, chosenOption: null };
  // show the intro lines via the normal dialogue system
  startDialogue(scene.intro.slice());
  return true;
}

// After the intro dialogue ends, present the options as a special menu.
// This is hooked from handleDialogueEndTag via a "__BRANCH_<id>__" tag appended.
function branchTag(sceneId) {
  return "__BRANCH_" + sceneId + "__";
}

// Process a branch option selection -> show its result lines, then run its action.
function selectBranchOption(optionIndex) {
  if (!branchDialogue || !branchDialogue.scene) return;
  const opt = branchDialogue.scene.options[optionIndex];
  if (!opt) return;
  branchDialogue.chosenOption = opt;
  branchDialogue.phase = "result";
  // append the action tag to the last result line so handleDialogueEndTag fires it
  const resultLines = opt.result.slice();
  resultLines[resultLines.length - 1] = resultLines[resultLines.length - 1] + " __BRANCHACTION_" + opt.action + "__";
  startDialogue(resultLines);
}

// Execute a branching action (called from handleDialogueEndTag)
function executeBranchAction(actionId) {
  switch (actionId) {
    case "stealth_minigame":
      openStealthMinigame();
      break;
    case "battle_intro":
      // trigger a wild battle with a high-level sleeping creature
      if (typeof startSleepingGiantBattle === "function") startSleepingGiantBattle();
      break;
    case "lullaby_event":
      // the lullaby fails -> trigger angry battle
      if (typeof startSleepingGiantBattle === "function") startSleepingGiantBattle();
      break;
    case "chest_open":
    case "chest_poke":
      // mimic battle
      if (typeof startMimicBattle === "function") startMimicBattle();
      break;
    case "chest_leave":
      // nothing happens
      break;
    case "boss_spare":
      if (typeof resolveBossEnding === "function") resolveBossEnding("spare");
      break;
    case "boss_defeat":
      if (typeof resolveBossEnding === "function") resolveBossEnding("defeat");
      break;
    case "boss_hug":
      if (typeof resolveBossEnding === "function") resolveBossEnding("hug");
      break;
  }
  branchDialogue = null;
}

// ================= STEALTH MINI-GAME =================
// A slider mini-game: a marker bounces along a bar; press confirm when it's
// in the green "safe" zone. Success = sneak past; fail = wake the creature.
let stealthMinigame = null;

function openStealthMinigame() {
  stealthMinigame = {
    pos: 0, dir: 1, speed: 2.2,
    safeStart: 35, safeEnd: 65,
    active: true, result: null,
    timer: 0
  };
  // switch to a special menu mode for rendering
  menuState = "stealth";
  game.state = GAME_STATE.MENU;
}

function stealthMinigameTick() {
  if (!stealthMinigame || !stealthMinigame.active) return;
  stealthMinigame.pos += stealthMinigame.dir * stealthMinigame.speed;
  if (stealthMinigame.pos >= 100) { stealthMinigame.pos = 100; stealthMinigame.dir = -1; }
  if (stealthMinigame.pos <= 0) { stealthMinigame.pos = 0; stealthMinigame.dir = 1; }
}

function stealthMinigameInput(key) {
  if (!stealthMinigame || !stealthMinigame.active) return;
  if (key === "confirm") {
    const p = stealthMinigame.pos;
    if (p >= stealthMinigame.safeStart && p <= stealthMinigame.safeEnd) {
      stealthMinigame.result = "success";
      stealthMinigame.active = false;
      closeMenu();
      startDialogue(["Hero: (holding breath) ...We made it past. We actually made it past.", "Companion: That was the most stressful walk of my life.", "Hero: Same. Every time."]);
    } else {
      stealthMinigame.result = "fail";
      stealthMinigame.active = false;
      closeMenu();
      startDialogue(["(You stepped on EVERYTHING. The creature wakes with a roar!)", "Hero: Stealth is NOT my strong suit.", "Companion: It is nobody's strong suit. We established this."]);
      if (typeof startSleepingGiantBattle === "function") startSleepingGiantBattle();
    }
  }
}
