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

  player.col = newCol;
  player.row = newRow;

  // encounter check only when stepping onto tall grass
  if (isTallGrass(newCol, newRow)) {
    if (Math.random() < 0.15) {
      startRandomEncounter();
    }
  }
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
