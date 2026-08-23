const player = {
  col: 4,
  row: 4,
  facing: "down",
  moving: false,
  party: [ createMonsterInstance("rattick", 5) ],
  balls: 5
};

function tryMove(dCol, dRow) {
  if (player.moving) return;
  if (dCol === -1) player.facing = "left";
  if (dCol === 1) player.facing = "right";
  if (dRow === -1) player.facing = "up";
  if (dRow === 1) player.facing = "down";

  const newCol = player.col + dCol;
  const newRow = player.row + dRow;
  if (isBlocked(newCol, newRow)) return;
  if (getNpcAt(newCol, newRow)) return; // NPCs block movement, talk to them instead

  player.col = newCol;
  player.row = newRow;

  // encounter check only when stepping onto tall grass
  if (isTallGrass(newCol, newRow)) {
    if (Math.random() < 0.15) {
      startRandomEncounter();
    }
  }
}

// Returns the tile coordinate the player is currently facing
function tileInFrontOfPlayer() {
  const deltas = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const [dc, dr] = deltas[player.facing];
  return { col: player.col + dc, row: player.row + dr };
}

// Called when the player presses confirm while in the overworld
function interact() {
  const { col, row } = tileInFrontOfPlayer();
  const npc = getNpcAt(col, row);
  if (!npc) return;

  if (npc.isTrainer && !npc.defeated) {
    startTrainerBattle(npc);
    return;
  }

  const lines = (npc.isTrainer && npc.defeated && npc.defeatedDialogue)
    ? npc.defeatedDialogue
    : npc.dialogue;
  startDialogue(lines);
}

// ---- Dialogue box state (used for NPC talk + intro text) ----
let dialogue = null; // { lines, index } or null when not showing

function startDialogue(lines) {
  dialogue = { lines, index: 0 };
}

function advanceDialogue() {
  if (!dialogue) return;
  dialogue.index++;
  if (dialogue.index >= dialogue.lines.length) {
    dialogue = null;
  }
}

function drawDialogue(ctx) {
  if (!dialogue) return;
  ctx.fillStyle = PALETTE.black;
  ctx.fillRect(2, 104, SCREEN_W - 4, 38);
  ctx.fillStyle = PALETTE.light;
  ctx.fillRect(4, 106, SCREEN_W - 8, 34);

  ctx.fillStyle = PALETTE.black;
  ctx.font = "6px monospace";
  wrapText(ctx, dialogue.lines[dialogue.index], 8, 116, SCREEN_W - 16, 7);
}

function drawPlayer(ctx) {
  const px = player.col * TILE;
  const py = player.row * TILE;

  // simple 16x16 pixel-blob character, direction shown via a "nose" pixel
  ctx.fillStyle = PALETTE.black;
  ctx.fillRect(px + 4, py + 2, 8, 12); // body/head block

  ctx.fillStyle = PALETTE.light;
  ctx.fillRect(px + 6, py + 4, 4, 4); // face

  ctx.fillStyle = PALETTE.dark;
  if (player.facing === "down") ctx.fillRect(px + 7, py + 7, 2, 1);
  if (player.facing === "up") ctx.fillRect(px + 7, py + 3, 2, 1);
  if (player.facing === "left") ctx.fillRect(px + 5, py + 5, 1, 2);
  if (player.facing === "right") ctx.fillRect(px + 10, py + 5, 1, 2);
}
