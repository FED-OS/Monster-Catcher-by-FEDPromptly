// Game Boy-style 4-shade palette (lightest -> darkest)
const PALETTE = {
  light:  "#9bbc0f",
  mid:    "#8bac0f",
  dark:   "#306230",
  black:  "#0f380f"
};

const TILE = 16;          // 16x16 px tiles
const SCREEN_W = 160;     // native GB-style resolution
const SCREEN_H = 144;
const COLS = SCREEN_W / TILE; // 10
const ROWS = SCREEN_H / TILE; // 9

const GAME_STATE = {
  OVERWORLD: "overworld",
  BATTLE: "battle"
};
