// ---- Story & world content ----
// Everything text/lore/trainer-related lives here so it's easy to expand
// without touching the engine code in player.js / battle.js / main.js.

const WORLD = {
  regionName: "Verdale",
  townName: "Mossmere Hollow",
  professorName: "Professor Alder Thorne",
  rivalName: "Kestrel"
};

const STORY_INTRO = [
  `Welcome to ${WORLD.regionName}!`,
  `My name is ${WORLD.professorName}. This region is home to all sorts of wild creatures.`,
  `Some people, like you, study them as partners. We call them Tamers.`,
  `Your journey starts here in ${WORLD.townName}. Go on — the tall grass to the south is a good place to start.`
];

// NPCs placed on the map. col/row match the MAP grid in world.js.
// isTrainer: true means walking into their sightline / talking triggers a battle.
const NPCS = [
  {
    id: "professor",
    col: 4, row: 2,
    facing: "down",
    sprite: "#e8b34f",
    isTrainer: false,
    dialogue: STORY_INTRO
  },
  {
    id: "rival",
    col: 6, row: 6,
    facing: "left",
    sprite: "#d65f5f",
    isTrainer: true,
    dialogue: [
      `${WORLD.rivalName}: Hey! Bet my team beats yours.`,
      `${WORLD.rivalName} wants to battle!`
    ],
    defeatedDialogue: [
      `${WORLD.rivalName}: ...Fine. You got lucky this time.`
    ],
    team: [
      { speciesKey: "aquip", level: 6 },
      { speciesKey: "rattick", level: 5 }
    ]
  },
  {
    id: "trainer_birdkeeper",
    col: 8, row: 1,
    facing: "left",
    sprite: "#7fa8d6",
    isTrainer: true,
    dialogue: [`Bird Keeper Wren: My Breezel hasn't lost a fight yet!`],
    defeatedDialogue: [`Bird Keeper Wren: Grounded... nice one.`],
    team: [
      { speciesKey: "breezel", level: 7 }
    ]
  }
];

function getNpcAt(col, row) {
  return NPCS.find(n => n.col === col && n.row === row) || null;
}
