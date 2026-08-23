const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const game = {
  state: GAME_STATE.OVERWORLD
};

const keyMap = {
  ArrowUp: "up", KeyW: "up",
  ArrowDown: "down", KeyS: "down",
  ArrowLeft: "left", KeyA: "left",
  ArrowRight: "right", KeyD: "right",
  KeyZ: "confirm", Enter: "confirm",
  KeyX: "cancel", Escape: "cancel"
};

const dirDelta = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0]
};

window.addEventListener("keydown", (e) => {
  const key = keyMap[e.code];
  if (!key) return;
  e.preventDefault();

  if (game.state === GAME_STATE.OVERWORLD) {
    if (dialogue) {
      if (key === "confirm") advanceDialogue();
      return;
    }
    if (dirDelta[key]) {
      const [dc, dr] = dirDelta[key];
      tryMove(dc, dr);
    }
    if (key === "confirm") {
      interact();
    }
  } else if (game.state === GAME_STATE.BATTLE) {
    battleInput(key);
  }
});

function drawOverworld() {
  drawMap(ctx);
  drawNpcs(ctx);
  drawPlayer(ctx);
  drawDialogue(ctx);
}

function render() {
  ctx.clearRect(0, 0, SCREEN_W, SCREEN_H);
  if (game.state === GAME_STATE.OVERWORLD) {
    drawOverworld();
  } else if (game.state === GAME_STATE.BATTLE) {
    drawBattle(ctx);
  }
  requestAnimationFrame(render);
}

preloadAllSprites();
startDialogue(STORY_INTRO); // greet the player on first load
render();
