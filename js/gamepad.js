// ============================================================
//  Monster Catcher — Gamepad / Controller Support (v5.0 HERO)
//  Full Gamepad API integration: D-pad, analog sticks, and
//  face buttons mapped to the same game actions as keyboard.
//  Supports Xbox, PlayStation, and Switch Pro controllers.
// ============================================================

// ---- Button mapping (standard gamepad layout) ----
// Standard mapping: buttons[0]=A, [1]=B, [2]=X, [3]=Y,
// [12]=D-Up, [13]=D-Down, [14]=D-Left, [15]=D-Right,
// [7]=Start, [6]=Back/Select, [4]=LB, [5]=RB
const GAMEPAD_BUTTONS = {
  A: 0,       // confirm
  B: 1,       // cancel
  X: 2,       // menu / quick action
  Y: 3,       // bag
  LB: 4,
  RB: 5,
  SELECT: 6,  // settings
  START: 7,   // menu
  D_UP: 12,
  D_DOWN: 13,
  D_LEFT: 14,
  D_RIGHT: 15
};

// ---- Gamepad state ----
const gamepadState = {
  connected: false,
  index: null,
  // Track button press edges (pressed this frame, not held)
  pressed: {},
  held: {},
  // Analog stick deadzone
  deadzone: 0.35,
  // Repeat timer for movement (analog/dpad held)
  moveRepeatTimer: 0,
  moveRepeatDelay: 9, // frames between auto-repeat steps
  // Last polled direction for edge detection
  lastDir: null
};

// ---- Connection events ----
window.addEventListener("gamepadconnected", (e) => {
  gamepadState.connected = true;
  gamepadState.index = e.gamepad.index;
});

window.addEventListener("gamepaddisconnected", (e) => {
  if (gamepadState.index === e.gamepad.index) {
    gamepadState.connected = false;
    gamepadState.index = null;
    gamepadState.pressed = {};
    gamepadState.held = {};
  }
});

// ---- Poll the gamepad each frame ----
// Returns an object of actions that should fire this frame.
function pollGamepad() {
  const result = {
    directions: [],  // ["up","down","left","right"] — directions pressed this frame
    confirm: false,
    cancel: false,
    menu: false,
    bag: false,
    anyPressed: false
  };

  // Check all connected gamepads (in case index changed)
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  let pad = null;
  for (let i = 0; i < pads.length; i++) {
    if (pads[i]) { pad = pads[i]; gamepadState.index = i; break; }
  }
  if (!pad) {
    gamepadState.connected = false;
    return result;
  }
  gamepadState.connected = true;

  // ---- D-pad buttons ----
  const dpadUp = pad.buttons[GAMEPAD_BUTTONS.D_UP] && pad.buttons[GAMEPAD_BUTTONS.D_UP].pressed;
  const dpadDown = pad.buttons[GAMEPAD_BUTTONS.D_DOWN] && pad.buttons[GAMEPAD_BUTTONS.D_DOWN].pressed;
  const dpadLeft = pad.buttons[GAMEPAD_BUTTONS.D_LEFT] && pad.buttons[GAMEPAD_BUTTONS.D_LEFT].pressed;
  const dpadRight = pad.buttons[GAMEPAD_BUTTONS.D_RIGHT] && pad.buttons[GAMEPAD_BUTTONS.D_RIGHT].pressed;

  // ---- Analog sticks ----
  const lx = pad.axes[0] || 0;
  const ly = pad.axes[1] || 0;
  const dz = gamepadState.deadzone;

  const stickUp = ly < -dz;
  const stickDown = ly > dz;
  const stickLeft = lx < -dz;
  const stickRight = lx > dz;

  // Combine d-pad and stick
  const up = dpadUp || stickUp;
  const down = dpadDown || stickDown;
  const left = dpadLeft || stickLeft;
  const right = dpadRight || stickRight;

  // ---- Determine active direction ----
  let activeDir = null;
  if (up) activeDir = "up";
  else if (down) activeDir = "down";
  else if (left) activeDir = "left";
  else if (right) activeDir = "right";

  // Edge detection + auto-repeat for movement
  if (activeDir) {
    if (activeDir !== gamepadState.lastDir) {
      // New direction press — fire immediately
      result.directions.push(activeDir);
      gamepadState.moveRepeatTimer = gamepadState.moveRepeatDelay;
    } else {
      // Same direction held — use auto-repeat timer
      gamepadState.moveRepeatTimer--;
      if (gamepadState.moveRepeatTimer <= 0) {
        result.directions.push(activeDir);
        gamepadState.moveRepeatTimer = gamepadState.moveRepeatDelay;
      }
    }
    gamepadState.lastDir = activeDir;
    result.anyPressed = true;
  } else {
    gamepadState.lastDir = null;
    gamepadState.moveRepeatTimer = 0;
  }

  // ---- Face buttons (edge detection) ----
  const btnA = pad.buttons[GAMEPAD_BUTTONS.A] && pad.buttons[GAMEPAD_BUTTONS.A].pressed;
  const btnB = pad.buttons[GAMEPAD_BUTTONS.B] && pad.buttons[GAMEPAD_BUTTONS.B].pressed;
  const btnX = pad.buttons[GAMEPAD_BUTTONS.X] && pad.buttons[GAMEPAD_BUTTONS.X].pressed;
  const btnY = pad.buttons[GAMEPAD_BUTTONS.Y] && pad.buttons[GAMEPAD_BUTTONS.Y].pressed;
  const btnStart = pad.buttons[GAMEPAD_BUTTONS.START] && pad.buttons[GAMEPAD_BUTTONS.START].pressed;
  const btnSelect = pad.buttons[GAMEPAD_BUTTONS.SELECT] && pad.buttons[GAMEPAD_BUTTONS.SELECT].pressed;

  // Edge detection: fire only on press, not hold
  result.confirm = btnA && !gamepadState.held.A;
  result.cancel = btnB && !gamepadState.held.B;
  result.menu = (btnStart && !gamepadState.held.START) || (btnX && !gamepadState.held.X);
  result.bag = btnY && !gamepadState.held.Y;

  if (btnA || btnB || btnX || btnY || btnStart || btnSelect) result.anyPressed = true;

  // Update held state
  gamepadState.held.A = btnA;
  gamepadState.held.B = btnB;
  gamepadState.held.X = btnX;
  gamepadState.held.Y = btnY;
  gamepadState.held.START = btnStart;
  gamepadState.held.SELECT = btnSelect;

  return result;
}

// ---- Dispatch gamepad actions to the same handlers as keyboard ----
function dispatchGamepadInput() {
  const gp = pollGamepad();
  if (!gp.anyPressed && gp.directions.length === 0) return;

  // Route to the same logic as keyboard, using game state
  if (game.state === GAME_STATE.TITLE) {
    for (const dir of gp.directions) {
      titleInput(dir === "up" ? "up" : dir === "down" ? "down" : "up");
    }
    if (gp.confirm) titleInput("confirm");
    if (gp.cancel) titleInput("cancel");
    return;
  }

  if (game.state === GAME_STATE.MENU) {
    for (const dir of gp.directions) {
      sfxMenu();
      menuInput(dir);
    }
    if (gp.confirm) { sfxMenu(); menuInput("confirm"); }
    if (gp.cancel) { sfxMenu(); menuInput("cancel"); }
    return;
  }

  if (game.state === GAME_STATE.OVERWORLD) {
    if (dialogue) {
      if (gp.confirm) { advanceDialogue(); sfxConfirm(); }
      return;
    }
    for (const dir of gp.directions) {
      const [dc, dr] = dirDelta[dir];
      tryMove(dc, dr);
      sfxMove();
    }
    if (gp.confirm) { interact(); sfxConfirm(); }
    if (gp.cancel || gp.menu) { openStartMenu(); sfxMenu(); }
    return;
  }

  if (game.state === GAME_STATE.BATTLE) {
    for (const dir of gp.directions) {
      sfxMenu();
      battleInput(dir);
    }
    if (gp.confirm) { sfxMenu(); battleInput("confirm"); }
    if (gp.cancel) { sfxMenu(); battleInput("cancel"); }
    return;
  }
}

// ---- Controller status for UI display ----
function isControllerConnected() {
  return gamepadState.connected;
}
