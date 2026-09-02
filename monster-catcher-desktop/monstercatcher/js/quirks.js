// ============================================================
//  Monster Catcher — Creature Personality Quirks
//  10 quirk categories that affect battle behaviour, dialogue,
//  and visual comic expressions. Each quirk grants small
//  mechanical effects + flavourful dialogue lines.
// ============================================================

// ---- Quirk IDs ----
const QUIRK = {
  SNACK:        "snackObsessed",
  SLEEPY:       "perpetuallySleepy",
  DRAMATIC:     "overlyDramatic",
  TECHNICAL:    "technicalObsessive",
  OVERCONFIDENT:"overconfident",
  NERVOUS:      "extremelyNervous",
  HOARDER:      "compulsiveHoarder",
  FOURTHWALL:   "fourthWallBreaker",
  PEACELOVING:  "peaceLoving",
  CHAOS:        "chaosAgent"
};

const QUIRKS = {
  [QUIRK.SNACK]: {
    id: QUIRK.SNACK,
    name: "Snack-Obsessed",
    emoji: "🍪",
    desc: "This creature thinks about food 90% of the time. Sometimes it eats mid-battle to heal itself.",
    color: "#f0c060",
    dialogue: {
      battleStart:   ["Om nom nom... oh, a battle? Can we snack first?", "I brought trail mix. And gravel. I eat anything.", "Is the enemy edible? Asking for a friend."],
      lowHp:          ["I'm too hungry to faint! ...mostly.", "If I faint, who feeds me? I can't risk it.", "My stomach hurts. In a sad way."],
      victory:        ["VICTORY SNACK! ...where did I put it?", "I won! Now I can eat in peace!", "Do defeated monsters taste different? Just curious."],
      idle:           ["*munches on absolutely nothing*", "Is it snack o'clock yet?", "I once ate a Rock-type. 0/10, too crunchy."],
      switchIn:       ["Snack squad, reporting for lunch—I mean, duty!", "I was mid-bite! Can battles wait?"]
    },
    effects: {
      // 15% chance to snack-heal 25% max HP at turn start
      onTurnStart: { chance: 0.15, healPct: 0.25, msg: "{name} snuck a snack and recovered HP!" },
      // Eats held item-themed bonuses
      itemAffinity: true
    }
  },

  [QUIRK.SLEEPY]: {
    id: QUIRK.SLEEPY,
    name: "Perpetually Sleepy",
    emoji: "💤",
    desc: "Always drowsy. More likely to fall asleep, but sleeps heal it and it's immune to enemy sleep.",
    color: "#7878d8",
    dialogue: {
      battleStart:   ["*yaaaawn*... we fighting? Wake me when it's over.", "Five more minutes... of battle?", "I had a dream I was fighting. Oh. It's real now."],
      lowHp:          ["If I sleep now, do I skip the scary part?", "My eyelids are heavy... like, emotionally."],
      victory:        ["We won? Great. *immediately naps*", "Victory nap! Don't wake me for the XP."],
      idle:           ["*snores softly*", "Zzz... mmrm... no mom, I don't want to battle... zzz", "Is it nap o'clock? It's always nap o'clock."],
      switchIn:       ["Mrrph... already? I was dreaming I was awake.", "*blinks slowly* ...this is the awake one, right?"]
    },
    effects: {
      // 12% chance to fall asleep at turn start (but it heals 15% HP while asleep)
      onTurnStart: { chance: 0.12, applyStatus: "sleep", selfHealWhileAsleep: 0.15 },
      sleepImmunity: true  // immune to enemy-inflicted sleep
    }
  },

  [QUIRK.DRAMATIC]: {
    id: QUIRK.DRAMATIC,
    name: "Overly Dramatic",
    emoji: "🎭",
    desc: "Everything is a Shakespearean tragedy. Crits do bonus damage and it monologues constantly.",
    color: "#d84080",
    dialogue: {
      battleStart:   ["ALAS! The stage is set for our grand confrontation!", "By the heavens, destiny calls! Enter: ME.", "To battle, or not to battle... obviously TO BATTLE."],
      lowHp:          ["I bleed! I BLEED! ...figuratively! But DRAMATICALLY!", "The light... it fades... tell my story... wait, I'm at 40% HP.", "Farewell, cruel world! ...well, see you next turn maybe."],
      victory:        ["AND SO THE VILLAIN FALLS! *bows to invisible audience*", "The crowd goes wild! ...there's no crowd. I hear them anyway.", "Curtain call! I accept my standing ovation."],
      idle:           ["*poses heroically against the wind*", "This battle shall be remembered for AGES!", "I sense... foreshadowing. How ominous. How EXCITING."],
      switchIn:       ["The DRAGON awakens! Wait, am I the dragon? I'll BE the dragon.", "From the shadows, I emerge! ...dramatically!"]
    },
    effects: {
      // +50% crit damage, 10% chance to gain +1 ATK stage on switch in (getting pumped up)
      critBonus: 1.5,
      onSwitchIn: { chance: 0.10, buff: "atk", stages: 1, msg: "{name} struck a pose and felt pumped up!" }
    }
  },

  [QUIRK.TECHNICAL]: {
    id: QUIRK.TECHNICAL,
    name: "Technical Obsessive",
    emoji: "🔧",
    desc: "Overanalyzes everything. Higher accuracy, sometimes 'optimizes' a move for bonus effect.",
    color: "#48b8c8",
    dialogue: {
      battleStart:   ["Scanning opponent... calculating optimal strategy... carry the two...", "Statistical analysis suggests a 73.2% victory probability. Acceptable.", "I've prepared a 14-page battle plan. Nobody read it. As expected."],
      lowHp:          ["Calculating survival probability... 12%. Suboptimal.", "Error: HP reserves critically low. Recommending: panic. Calmly."],
      victory:        ["Results match my projections. Obviously.", "Data point acquired: we are, statistically, the best.", "I predicted this outcome 4.7 turns ago. It's documented."],
      idle:           ["*muttering formulas*", "The optimal snack-to-battle ratio is 1:0. Always snack.", "Did you know crit chance is calculated via—I'll spare you. This time."],
      switchIn:       ["Deploying into combat scenario. Expect efficiency.", "Calculations complete. Engaging optimal aggression mode."]
    },
    effects: {
      // +15% accuracy to all moves, 8% chance a move costs no PP (efficiency)
      accuracyBonus: 0.15,
      onMoveUse: { chance: 0.08, freePp: true, msg: "{name} optimized the move — no PP consumed!" }
    }
  },

  [QUIRK.OVERCONFIDENT]: {
    id: QUIRK.OVERCONFIDENT,
    name: "Overconfident",
    emoji: "😎",
    desc: "Thinks it's invincible. Gets a speed boost on KO, but takes more damage when hit first.",
    color: "#f8a830",
    dialogue: {
      battleStart:   ["This'll be easy. I could win with my eyes closed. Want me to prove it?", "Ha! I've seen tougher opponents in a mirror.", "I'm gonna win so fast you won't even SEE it."],
      lowHp:          ["Okay so MAYBE I underestimated this one. A little.", "This is fine. I'm fine. Everything is fine and I'm winning."],
      victory:        ["Told ya. Didn't even break a sweat. ...I don't sweat, but STILL.", "Was there ever any doubt? Besides yours, obviously.", "Too easy. Next!", ],
      idle:           ["*flexes at nobody*", "I don't NEED a strategy. I AM the strategy.", "When's my victory parade? I need to prep my wave."],
      switchIn:       ["Stand back, mortals. I've got this. Probably.", "Let me show you how it's done. The cool way."]
    },
    effects: {
      // +1 SPD stage after landing a KO, but +20% damage taken if hit before acting
      onKo: { buff: "spd", stages: 1, msg: "{name} got cocky and sped up!" },
      firstHitPenalty: 1.2
    }
  },

  [QUIRK.NERVOUS]: {
    id: QUIRK.NERVOUS,
    name: "Extremely Nervous",
    emoji: "😰",
    desc: "Anxious wreck. Sometimes flinches and skips a turn, but has high evasion from all the fidgeting.",
    color: "#88c850",
    dialogue: {
      battleStart:   ["Oh gosh oh gosh we're fighting? Now? Already? I-I-I'm not ready...", "Um. Hi. Sorry to bother you with this battle. I'll try not to be in the way.", "Is—is it okay if I just... stand here? Nervously?"],
      lowHp:          ["I knew this would happen. I KNEW it. Why does no one listen to me?", "I'd like to lie down. In a panic. May I?"],
      victory:        ["We won?! Oh thank goodness. I was so worried. I'm still worried.", "I did it? I DID it? Are you sure? Let me double-check. Yep. Wow.", "Sorry if I was too aggressive. Was that too aggressive? I'm sorry."],
      idle:           ["*fidgets intensely*", "What if we lose? What if we WIN and that's worse somehow?", "Sorry. For existing. In this battle. Sorry."],
      switchIn:       ["Ohnohnohno okay I'm here I'm here I'm doing it.", "Um, hi again, sorry, reporting for probable-failure duty."]
    },
    effects: {
      // +20% evasion, 15% chance to flinch (skip turn) from anxiety
      evasionBonus: 0.20,
      onTurnStart: { chance: 0.15, flinch: true, msg: "{name} got too nervous and froze up!" }
    }
  },

  [QUIRK.HOARDER]: {
    id: QUIRK.HOARDER,
    name: "Compulsive Hoarder",
    emoji: "📦",
    desc: "Collects everything. Higher catch rate (it WANTS to be caught, new home for its stash), finds items after battles.",
    color: "#b89060",
    dialogue: {
      battleStart:   ["Ooh, is the enemy holding anything? I could add it to my collection.", "This battlefield has nice rocks. I'm keeping the nice rocks.", "Do you think they'd notice if I pocketed that tree?"],
      lowHp:          ["I can't faint! My collection needs a guardian! That's me!", "If I go down, who organizes my 400 identical pebbles??"],
      victory:        ["Victory loot! ...there's no loot. I'm taking the vibe anyway.", "I claim this defeated enemy for my hoard. Spiritually.", "Another trophy for the shelf! The metaphorical shelf."],
      idle:           ["*polishes a shiny pebble*", "I have 37 of these. I need 38. Then 39. Forever.", "One creature's trash is my treasure. So is their treasure."],
      switchIn:       ["I brought my whole collection! ...it's in a pocket dimension. Don't ask.", "Reporting for duty! And also for collecting. Mostly collecting."]
    },
    effects: {
      // +30% catch rate, 20% chance to find a random item after wild battle
      catchBonus: 0.30,
      onBattleWin: { chance: 0.20, itemTable: ["potion","basicball","antidote"], msg: "{name} scavenged an item after the battle!" }
    }
  },

  [QUIRK.FOURTHWALL]: {
    id: QUIRK.FOURTHWALL,
    name: "Fourth-Wall Breaker",
    emoji: "🧱",
    desc: "Knows it's in a game. References code, saves, the player, and frame data. Occasionally glitches reality.",
    color: "#d0d0e0",
    dialogue: {
      battleStart:   ["Ah, another random encounter. The encounter rate here is 12%, you know.", "Hey, player. Yeah, you. This battle gonna take long? I have frame data to critique.", "I'd quote my own code but it's spaghetti. Delicious, functional spaghetti."],
      lowHp:          ["If my HP hits zero the game just reloads a save. We'll be fine. Probably.", "I can see my health bar from here. It's looking grim, fam.", "Quick, mash A! That's not how this works? It should be."],
      victory:        ["GG. That's gamer-speak for 'good game.' I learned it from the loading screen.", "Another win for the patch notes. 'Fixed: opponent's dignity.'", "Do you think the dev is proud? I hope the dev is proud."],
      idle:           ["I checked the source code once. Don't recommend it. There's a comment that just says 'TODO: fix everything.'", "Fun fact: my sprite is 16 pixels of pure existential crisis.", "If you save now, this victory is canon. If not, it's a dream."],
      switchIn:       ["Spawned into battle, frame 1. Let's make it cinematic.", "New scene loaded. I'm ready for my close-up, player."]
    },
    effects: {
      // 10% chance to "glitch" — negate enemy's move this turn
      onEnemyMove: { chance: 0.10, negate: true, msg: "{name} glitched reality and cancelled the attack!" }
    }
  },

  [QUIRK.PEACELOVING]: {
    id: QUIRK.PEACELOVING,
    name: "Peace-Loving Hippie",
    emoji: "✌️",
    desc: "Hates violence. Sometimes 'negotiates' to end wild battles peacefully (auto-flee chance), heals team with good vibes.",
    color: "#80d870",
    dialogue: {
      battleStart:   ["Hey, can we just... talk this out? Violence is so last century.", "Namaste, opponent. Your aura is aggressive. Let's chill it.", "What if we, like, didn't fight? Just a thought. A peaceful one."],
      lowHp:          ["I think my chakra is misaligned. And bleeding. Mostly bleeding.", "This violence is harshing my mellow, man."],
      victory:        ["We won but... did we REALLY win? ...yes? Okay, cool. Peace.", "Love prevails over the opponent! And also hitting them. Mostly hitting.", "I send good vibes to the fallen. They're probably fine."],
      idle:           ["*braids grass into a friendship bracelet*", "Have you tried just... being? It's nice. You should try it.", "War is over if you want it. Also if your HP is higher. Mostly that."],
      switchIn:       ["Bringing the peace. And a tiny bit of violence. Balance, you know?", "I come with love and light. And scratch attacks. Balanced."]
    },
    effects: {
      // 18% chance to auto-flee wild battles peacefully (counts as escaped)
      onTurnStart: { chance: 0.18, autoFlee: true, wildOnly: true, msg: "{name} negotiated a peaceful end to the battle!" },
      // Heals entire party 5% on switch-in (good vibes)
      onSwitchIn: { healPartyPct: 0.05, msg: "{name} radiated good vibes and soothed the team!" }
    }
  },

  [QUIRK.CHAOS]: {
    id: QUIRK.CHAOS,
    name: "Chaos Agent",
    emoji: "🌀",
    desc: "Unpredictable and unhinged. Moves have random bonus effects. Pure beautiful disorder.",
    color: "#e060e0",
    dialogue: {
      battleStart:   ["BATTLE? I LOVE BATTLE! I ALSO LOVE CHAOS! AND MAYONNAISE!", "What's the plan? THERE IS NO PLAN! Plans are for people who fear entropy!", "I'm gonna do something. I don't know what. Neither do you. EXCITING!"],
      lowHp:          ["DEATH IS JUST A STATUS EFFECT AND I REFUSE IT!", "The chaos within me will NOT be extinguished! Probably! Maybe!"],
      victory:        ["WINNING IS JUST CONTROLLED CHAOS AND I AM THE MAYOR OF CHAOS CITY!", "Did you see that?? NOBODY saw that! Not even me! BEAUTIFUL!", "I'd explain how I won but the explanation is also chaos. You're welcome."],
      idle:           ["*vibrates with chaotic energy*", "What if we spun? Let's spin. SPIN!", "I put a move in a random slot. Which slot? CHAOS KNOWS. (Chaos doesn't know.)"],
      switchIn:       ["CHAOS HAS ENTERED THE CHAT! THE CHAT IS NOW ON FIRE!", "Surprise! It's me! With no plan! Let's GO!"]
    },
    effects: {
      // 25% chance a move gets a random extra effect (more dmg, heal, status, buff)
      onMoveUse: { chance: 0.25, randomBoost: true, msg: "{name} did SOMETHING and it was CHAOTIC!" }
    }
  }
};

const QUIRK_IDS = Object.keys(QUIRKS);

// ---- API ----
function getQuirk(id) { return QUIRKS[id] || null; }

function randomQuirk() {
  return QUIRK_IDS[Math.floor(Math.random() * QUIRK_IDS.length)];
}

// Assign a quirk to a monster instance (if it doesn't have one)
function assignQuirk(monster, quirkId) {
  if (!monster) return;
  monster.quirk = quirkId || randomQuirk();
}

function monsterQuirk(monster) {
  if (!monster || !monster.quirk) return null;
  return QUIRKS[monster.quirk] || null;
}

// Get a dialogue line for a quirk + context
function quirkLine(monster, context) {
  const q = monsterQuirk(monster);
  if (!q || !q.dialogue || !q.dialogue[context]) return null;
  const lines = q.dialogue[context];
  return lines[Math.floor(Math.random() * lines.length)];
}

// ---- Battle effect hooks ----
// Called at the start of a monster's turn; returns event object or null
function quirkOnTurnStart(monster, isWildBattle) {
  const q = monsterQuirk(monster);
  if (!q || !q.effects || !q.effects.onTurnStart) return null;
  const e = q.effects.onTurnStart;
  if (Math.random() > e.chance) return null;

  // Peace-loving auto-flee only in wild battles
  if (e.autoFlee && e.wildOnly && !isWildBattle) return null;

  return {
    quirkId: q.id,
    healPct: e.healPct || 0,
    applyStatus: e.applyStatus || null,
    flinch: e.flinch || false,
    autoFlee: e.autoFlee || false,
    msg: (e.msg || "").replace("{name}", monster.name)
  };
}

// Called when a monster is switched in
function quirkOnSwitchIn(monster) {
  const q = monsterQuirk(monster);
  if (!q || !q.effects) return null;
  const e = q.effects.onSwitchIn;
  if (!e) return null;
  if (e.chance && Math.random() > e.chance) return null;
  return {
    quirkId: q.id,
    buff: e.buff || null,
    stages: e.stages || 0,
    healPartyPct: e.healPartyPct || 0,
    msg: (e.msg || "").replace("{name}", monster.name)
  };
}

// Called when a move is used; may trigger free-PP or chaos effects
function quirkOnMoveUse(monster) {
  const q = monsterQuirk(monster);
  if (!q || !q.effects || !q.effects.onMoveUse) return null;
  const e = q.effects.onMoveUse;
  if (Math.random() > e.chance) return null;
  return {
    quirkId: q.id,
    freePp: e.freePp || false,
    randomBoost: e.randomBoost || false,
    msg: (e.msg || "").replace("{name}", monster.name)
  };
}

// Called when the enemy is about to move; may negate (fourth-wall)
function quirkOnEnemyMove(monster) {
  const q = monsterQuirk(monster);
  if (!q || !q.effects || !q.effects.onEnemyMove) return null;
  const e = q.effects.onEnemyMove;
  if (Math.random() > e.chance) return null;
  return {
    quirkId: q.id,
    negate: e.negate || false,
    msg: (e.msg || "").replace("{name}", monster.name)
  };
}

// Called after landing a KO
function quirkOnKo(monster) {
  const q = monsterQuirk(monster);
  if (!q || !q.effects || !q.effects.onKo) return null;
  const e = q.effects.onKo;
  return {
    quirkId: q.id,
    buff: e.buff,
    stages: e.stages,
    msg: (e.msg || "").replace("{name}", monster.name)
  };
}

// Called after winning a battle; may yield items (hoarder)
function quirkOnBattleWin(monster) {
  const q = monsterQuirk(monster);
  if (!q || !q.effects || !q.effects.onBattleWin) return null;
  const e = q.effects.onBattleWin;
  if (Math.random() > e.chance) return null;
  const item = e.itemTable[Math.floor(Math.random() * e.itemTable.length)];
  return {
    quirkId: q.id,
    item: item,
    msg: (e.msg || "").replace("{name}", monster.name)
  };
}

// ---- Stat modifiers from quirks ----
function quirkStatModifier(monster, statName) {
  const q = monsterQuirk(monster);
  if (!q || !q.effects) return 1.0;
  if (statName === "acc" && q.effects.accuracyBonus) return 1 + q.effects.accuracyBonus;
  if (statName === "eva" && q.effects.evasionBonus) return 1 + q.effects.evasionBonus;
  return 1.0;
}

// Crit damage multiplier from quirks (dramatic)
function quirkCritMultiplier(monster) {
  const q = monsterQuirk(monster);
  if (!q || !q.effects || !q.effects.critBonus) return 1.0;
  return q.effects.critBonus;
}

// Catch rate multiplier from quirks (hoarder)
function quirkCatchMultiplier(monster) {
  const q = monsterQuirk(monster);
  if (!q || !q.effects || !q.effects.catchBonus) return 1.0;
  return 1 + q.effects.catchBonus;
}

// First-hit penalty multiplier (overconfident takes more damage if hit first)
function quirkFirstHitPenalty(monster) {
  const q = monsterQuirk(monster);
  if (!q || !q.effects || !q.effects.firstHitPenalty) return 1.0;
  return q.effects.firstHitPenalty;
}

// Sleep immunity check (sleepy quirk)
function quirkSleepImmune(monster) {
  const q = monsterQuirk(monster);
  return !!(q && q.effects && q.effects.sleepImmunity);
}

// ---- Random quirk assignment for new party members ----
// When a monster is caught or received, optionally give it a quirk
function maybeAssignRandomQuirk(monster, chance) {
  chance = chance === undefined ? 0.5 : chance;
  if (!monster.quirk && Math.random() < chance) {
    assignQuirk(monster);
  }
}

// ---- Quirk emoji for UI display ----
function quirkEmoji(monster) {
  const q = monsterQuirk(monster);
  return q ? q.emoji : "";
}
