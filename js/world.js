// Tile legend: 0 = grass path (safe), 1 = tall grass (encounters), 2 = tree/wall (blocked), 3 = water (blocked for now)
const MAP = [
  [2,2,2,2,2,2,2,2,2,2],
  [2,0,0,0,1,1,0,0,0,2],
  [2,0,0,1,1,1,1,0,0,2],
  [2,0,1,1,1,1,1,1,0,2],
  [2,0,0,1,1,1,1,0,0,2],
  [2,0,0,0,0,0,0,0,0,2],
  [2,0,1,1,0,1,1,0,0,2],
  [2,0,0,0,0,0,0,0,0,2],
  [2,2,2,2,2,2,2,2,2,2]
];

const ENCOUNTER_TABLE = ["emberit", "aquip", "leafon", "rattick", "rattick"]; // weighted-ish

function isBlocked(col, row) {
  if (row < 0 || col < 0 || row >= MAP.length || col >= MAP[0].length) return true;
  const t = MAP[row][col];
  return t === 2 || t === 3;
}

function isTallGrass(col, row) {
  return MAP[row] && MAP[row][col] === 1;
}

function drawTile(ctx, tile, px, py) {
  if (tile === 0) {
    ctx.fillStyle = PALETTE.light;
    ctx.fillRect(px, py, TILE, TILE);
  } else if (tile === 1) {
    ctx.fillStyle = PALETTE.mid;
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = PALETTE.dark;
    // little grass tuft marks
    for (let i = 0; i < 3; i++) {
      const gx = px + 2 + i * 5;
      ctx.fillRect(gx, py + 4, 1, 8);
      ctx.fillRect(gx + 2, py + 6, 1, 6);
    }
  } else if (tile === 2) {
    ctx.fillStyle = PALETTE.black;
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = PALETTE.dark;
    ctx.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
  } else if (tile === 3) {
    ctx.fillStyle = PALETTE.dark;
    ctx.fillRect(px, py, TILE, TILE);
  }
}

function drawMap(ctx) {
  for (let row = 0; row < MAP.length; row++) {
    for (let col = 0; col < MAP[row].length; col++) {
      drawTile(ctx, MAP[row][col], col * TILE, row * TILE);
    }
  }
}
