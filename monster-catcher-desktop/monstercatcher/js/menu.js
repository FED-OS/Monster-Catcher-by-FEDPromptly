// ============================================================
//  Monster Catcher — Menus
//  Start menu (Party/Bag/Dex/Save/Settings), starter selection,
//  shop, heal prompt. Drawn in the GAME_STATE.MENU overlay state.
// ============================================================

// The active menu object: { type, cursor, subCursor, items, ... }
let menu = null;

// ---- Start menu ----
const START_MENU_OPTIONS = ["PARTY", "BAG", "DEX", "BADGES", "SAVE", "SETTINGS", "EXIT"];

function openStartMenu() {
  game.state = GAME_STATE.MENU;
  menu = { type: "start", cursor: 0 };
}

function openStarterMenu() {
  game.state = GAME_STATE.MENU;
  menu = { type: "starter", cursor: 0, options: ["emberit","aquip","leafon"] };
}

function openHealPrompt() {
  game.state = GAME_STATE.MENU;
  menu = { type: "healprompt", cursor: 0 };
}

function openShop() {
  game.state = GAME_STATE.MENU;
  menu = { type: "shop", cursor: 0, subCursor: 0, phase: "browse" };
}

function openShopPrompt() {
  game.state = GAME_STATE.MENU;
  menu = { type: "shop", cursor: 0, subCursor: 0, phase: "browse" };
}

function closeMenu() {
  game.state = GAME_STATE.OVERWORLD;
  menu = null;
}

// ---- Input router ----
function menuInput(key) {
  if (!menu) { closeMenu(); return; }
  switch (menu.type) {
    case "start":       startMenuInput(key); break;
    case "party":       partyMenuInput(key); break;
    case "monsterDetail": monsterDetailInput(key); break;
    case "bag":         bagMenuInput(key); break;
    case "dex":         dexMenuInput(key); break;
    case "dexDetail":   dexDetailInput(key); break;
    case "badges":      badgesInput(key); break;
    case "save":        saveMenuInput(key); break;
    case "settings":    settingsInput(key); break;
    case "starter":     starterMenuInput(key); break;
    case "healprompt":  healPromptInput(key); break;
    case "shop":        shopInput(key); break;
    case "message":     menuMessageInput(key); break;
    case "heroselect":  heroSelectInput(key); break;
    case "toolshop":    toolShopInput(key); break;
    case "fasttravel":  fastTravelInput(key); break;
    case "toolequip":   toolEquipInput(key); break;
    case "branch":      branchMenuInput(key); break;
    case "stealth":     stealthMenuInput(key); break;
    default: closeMenu();
  }
}

// ---- Start menu ----
function startMenuInput(key) {
  if (key === "cancel") { closeMenu(); return; }
  const n = START_MENU_OPTIONS.length;
  if (key === "down") menu.cursor = (menu.cursor + 1) % n;
  if (key === "up") menu.cursor = (menu.cursor + n - 1) % n;
  if (key === "confirm") {
    const opt = START_MENU_OPTIONS[menu.cursor];
    if (opt === "PARTY") { menu = { type: "party", cursor: 0 }; }
    else if (opt === "BAG") { menu = { type: "bag", cursor: 0, sub: "list" }; }
    else if (opt === "DEX") { menu = { type: "dex", cursor: 0, page: 0, list: buildDexList() }; }
    else if (opt === "BADGES") { menu = { type: "badges", cursor: 0 }; }
    else if (opt === "SAVE") { menu = { type: "save", cursor: 0 }; }
    else if (opt === "SETTINGS") { menu = { type: "settings", cursor: 0 }; }
    else if (opt === "EXIT") { closeMenu(); }
  }
}

// ---- Party menu ----
function partyMenuInput(key) {
  if (key === "cancel") { menu = { type: "start", cursor: 1 }; return; }
  if (!player.party.length) { closeMenu(); return; }
  if (key === "down") menu.cursor = (menu.cursor + 1) % player.party.length;
  if (key === "up") menu.cursor = (menu.cursor + player.party.length - 1) % player.party.length;
  if (key === "confirm") {
    menu = { type: "monsterDetail", cursor: 0, monster: player.party[menu.cursor] };
  }
}

function monsterDetailInput(key) {
  if (key === "cancel" || key === "confirm") {
    menu = { type: "party", cursor: 0 };
  }
}

// ---- Bag menu ----
function bagMenuInput(key) {
  const items = Object.keys(player.bag).filter(k => player.bag[k] > 0 && ITEMS[k]);
  if (key === "cancel") { menu = { type: "start", cursor: 2 }; return; }
  if (!items.length) return;
  if (key === "down") menu.cursor = (menu.cursor + 1) % items.length;
  if (key === "up") menu.cursor = (menu.cursor + items.length - 1) % items.length;
  if (key === "confirm") {
    menu.selectedItem = items[menu.cursor];
    menu = { type: "message", text: ITEMS[items[menu.cursor]].desc, returnTo: { type: "bag", cursor: menu.cursor } };
  }
}

// ---- Dex ----
function buildDexList() {
  return Object.keys(SPECIES).sort();
}

function dexMenuInput(key) {
  if (key === "cancel") { menu = { type: "start", cursor: 3 }; return; }
  const list = menu.list;
  if (key === "down") menu.cursor = (menu.cursor + 1) % list.length;
  if (key === "up") menu.cursor = (menu.cursor + list.length - 1) % list.length;
  if (key === "confirm") {
    menu = { type: "dexDetail", cursor: 0, speciesKey: list[menu.cursor] };
  }
}

function dexDetailInput(key) {
  if (key === "cancel" || key === "confirm") {
    menu = { type: "dex", cursor: menu.cursor, page: 0, list: buildDexList() };
  }
}

// ---- Badges ----
function badgesInput(key) {
  if (key === "cancel" || key === "confirm") { menu = { type: "start", cursor: 4 }; }
}

// ---- Save ----
function saveMenuInput(key) {
  if (key === "cancel") { menu = { type: "start", cursor: 5 }; return; }
  if (key === "confirm") {
    const ok = saveGame();
    menu = { type: "message", text: ok ? "Game saved!" : "Save failed!", returnTo: { type: "start", cursor: 5 } };
  }
}

// ---- Settings ----
function settingsInput(key) {
  if (key === "cancel" || key === "confirm") { menu = { type: "start", cursor: 6 }; return; }
  if (key === "down" || key === "up") {
    settings.muted = !settings.muted;
  }
  if (key === "left" || key === "right") {
    // cycle palette themes
    const keys = Object.keys(PALETTES);
    const idx = keys.indexOf(currentPaletteKey);
    const next = key === "right" ? (idx + 1) % keys.length : (idx + keys.length - 1) % keys.length;
    setPaletteTheme(keys[next]);
  }
}

// ---- Starter selection ----
function starterMenuInput(key) {
  if (key === "down") menu.cursor = (menu.cursor + 1) % menu.options.length;
  if (key === "up") menu.cursor = (menu.cursor + menu.options.length - 1) % menu.options.length;
  if (key === "confirm") {
    const spKey = menu.options[menu.cursor];
    const starter = createMonsterInstance(spKey, 5);
    addMonsterToParty(starter);
    player.starterChosen = true;
    player.flags[FLAGS.CHOSEN_STARTER] = true;
    const sp = SPECIES[spKey];
    menu = { type: "message", text: `You chose ${sp.name}! A fine partner.`, returnTo: null, onClose: () => {
      closeMenu();
      const spTypes = Array.isArray(sp.type) ? sp.type : [sp.type];
      startDialogue([`Professor Thorne: ${sp.name} is a ${spTypes.join("/")}-type. Treat it well, and it will treat you well.`, "Your adventure begins now! Head south to the tall grass."]);
    }};
  }
}

// ---- Heal prompt ----
function healPromptInput(key) {
  if (key === "cancel") { closeMenu(); return; }
  if (key === "down" || key === "up") menu.cursor = (menu.cursor + 1) % 2;
  if (key === "confirm") {
    if (menu.cursor === 0) {
      healParty();
      recordHealLocation();
      menu = { type: "message", text: "All healed up!", returnTo: null, onClose: closeMenu };
      sfxHeal();
    } else {
      closeMenu();
    }
  }
}

// ---- Shop ----
const SHOP_STOCK = ["basicball","greatball","potion","superpotion","antidote","burnheal","paralyzeheal","awakening","revive","firestone","waterstone","leafstone","thunderstone","moonstone"];

function shopInput(key) {
  if (key === "cancel") {
    if (menu.phase === "confirm") { menu.phase = "browse"; menu.subCursor = 0; }
    else { closeMenu(); }
    return;
  }
  if (menu.phase === "browse") {
    if (key === "down") menu.cursor = (menu.cursor + 1) % SHOP_STOCK.length;
    if (key === "up") menu.cursor = (menu.cursor + SHOP_STOCK.length - 1) % SHOP_STOCK.length;
    if (key === "confirm") {
      const itemKey = SHOP_STOCK[menu.cursor];
      const item = ITEMS[itemKey];
      if (player.money < item.price) {
        menu = { type: "message", text: "You don't have enough money!", returnTo: { type: "shop", cursor: menu.cursor, phase: "browse" } };
        return;
      }
      menu.phase = "confirm";
      menu.subCursor = 0;
      menu.itemKey = itemKey;
    }
  } else if (menu.phase === "confirm") {
    if (key === "down" || key === "up") menu.subCursor = (menu.subCursor + 1) % 2;
    if (key === "confirm") {
      if (menu.subCursor === 0) {
        // buy
        const item = ITEMS[menu.itemKey];
        player.money -= item.price;
        addItemToBag(menu.itemKey, 1);
        menu = { type: "message", text: `Bought ${item.name}!`, returnTo: { type: "shop", cursor: menu.cursor, phase: "browse" } };
      } else {
        menu.phase = "browse";
      }
    }
  }
}

// ---- Message (sub-menu) ----
function menuMessageInput(key) {
  if (key === "confirm" || key === "cancel") {
    const ret = menu.returnTo;
    const onClose = menu.onClose;
    if (onClose) { menu = null; onClose(); return; }
    menu = ret || { type: "start", cursor: 0 };
  }
}

// ============================================================
//  MENU RENDERING
// ============================================================
function drawMenu(ctx) {
  if (!menu) return;
  switch (menu.type) {
    case "start":       drawStartMenu(ctx); break;
    case "party":       drawPartyMenu(ctx); break;
    case "monsterDetail": drawMonsterDetail(ctx); break;
    case "bag":         drawBagMenu(ctx); break;
    case "dex":         drawDexMenu(ctx); break;
    case "dexDetail":   drawDexDetail(ctx); break;
    case "badges":      drawBadgesMenu(ctx); break;
    case "save":        drawSaveMenu(ctx); break;
    case "settings":    drawSettingsMenu(ctx); break;
    case "starter":     drawStarterMenu(ctx); break;
    case "healprompt":  drawHealPrompt(ctx); break;
    case "shop":        drawShop(ctx); break;
    case "message":     drawMenuMessage(ctx); break;
    case "heroselect":  drawHeroSelect(ctx); break;
    case "toolshop":    drawToolShop(ctx); break;
    case "fasttravel":  drawFastTravel(ctx); break;
    case "toolequip":   drawToolEquip(ctx); break;
    case "branch":      drawBranchMenu(ctx); break;
    case "stealth":     drawStealthMinigame(ctx); break;
  }
}

// GBA-style window panel: shadow + dark border + light edge + cream interior.
function drawPanel(ctx, x, y, w, h) {
  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.fillRect(x + 2, y + 2, w, h);
  ctx.fillStyle = COLOR.winBorder;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = COLOR.winBorderLight;
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y, 1, h);
  ctx.fillStyle = COLOR.winBg;
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
  ctx.fillStyle = COLOR.winBgDark;
  ctx.fillRect(x + 2, y + h - 4, w - 4, 2);
}

function drawStartMenu(ctx) {
  const pw = 76, ph = START_MENU_OPTIONS.length * 11 + 10;
  drawPanel(ctx, SCREEN_W - pw - 4, 4, pw, ph);
  ctx.fillStyle = COLOR.textDark;
  ctx.font = "7px monospace";
  START_MENU_OPTIONS.forEach((opt, i) => {
    const y = 16 + i * 11;
    if (menu.cursor === i) {
      ctx.fillStyle = COLOR.winBorder;
      ctx.fillText(">", SCREEN_W - pw, y);
    }
    ctx.fillStyle = COLOR.textDark;
    ctx.fillText(opt, SCREEN_W - pw + 6, y);
  });
}

function drawPartyMenu(ctx) {
  drawPanel(ctx, 2, 2, SCREEN_W - 4, SCREEN_H - 4);
  ctx.fillStyle = COLOR.winBorder;
  ctx.font = "bold 8px monospace";
  ctx.fillText("PARTY", 8, 13);
  ctx.fillStyle = COLOR.textDark;
  ctx.font = "7px monospace";
  if (!player.party.length) {
    ctx.fillText("(empty)", 8, 26);
    return;
  }
  player.party.forEach((m, i) => {
    const y = 24 + i * 17;
    if (menu.cursor === i) {
      ctx.fillStyle = COLOR.winBorderLight;
      ctx.fillRect(4, y - 8, SCREEN_W - 12, 15);
      ctx.fillStyle = COLOR.textDark;
    }
    drawMonsterSprite(ctx, m, 6, y - 7, 14);
    ctx.fillStyle = COLOR.textDark;
    ctx.fillText((menu.cursor === i ? ">" : " ") + `${m.name} Lv${m.level}`, 24, y);
    const pct = m.hp / m.maxHp;
    const barX = 130, barW = 70;
    ctx.fillStyle = COLOR.hpBg;
    ctx.fillRect(barX, y - 6, barW, 5);
    ctx.fillStyle = pct > 0.5 ? COLOR.hpGreen : (pct > 0.2 ? COLOR.hpYellow : COLOR.hpRed);
    ctx.fillRect(barX + 1, y - 5, Math.floor((barW - 2) * pct), 3);
    ctx.fillStyle = COLOR.textDark;
    ctx.fillText(`${m.hp}/${m.maxHp}`, barX, y + 6);
    drawTypeBadges(ctx, m, 24, y + 2);
  });
  ctx.fillStyle = COLOR.winBorder;
  ctx.fillText("Z: details  X: back", 8, SCREEN_H - 10);
}

function drawMonsterDetail(ctx) {
  const m = menu.monster;
  drawPanel(ctx, 2, 2, SCREEN_W - 4, SCREEN_H - 4);
  ctx.fillStyle = COLOR.winBorder;
  ctx.font = "bold 8px monospace";
  ctx.fillText(`${m.name}  Lv${m.level}`, 8, 13);
  drawMonsterSprite(ctx, m, 8, 20, 40);
  ctx.fillStyle = COLOR.textDark;
  ctx.font = "7px monospace";
  drawTypeBadges(ctx, m, 56, 22);

  ctx.fillText(`Type: ${m.type1}${m.type2 ? "/" + m.type2 : ""}`, 56, 38);
  ctx.fillText(`Ability: ${(ABILITIES[m.ability]||{name:"-"}).name}`, 56, 48);
  ctx.fillText(`HP:  ${m.hp}/${m.maxHp}`, 8, 68);
  ctx.fillText(`ATK: ${m.atk}   DEF: ${m.def}`, 8, 78);
  ctx.fillText(`SPD: ${m.spd}`, 8, 88);
  ctx.fillText(`XP:  ${m.xp}/${xpForLevel(m.level+1, m.xpGroup)}`, 8, 98);
  ctx.fillStyle = COLOR.winBorder;
  ctx.fillText("Moves:", 8, 110);
  ctx.fillStyle = COLOR.textDark;
  m.moves.forEach((mk, i) => {
    const mv = MOVES[mk];
    const col = i % 2;
    const row = Math.floor(i / 2);
    ctx.fillText(`- ${mv.name}`, 10 + col * 116, 120 + row * 9);
    ctx.font = "6px monospace";
    ctx.fillText(`(${mv.type})`, 10 + col * 116 + 70, 120 + row * 9);
    ctx.font = "7px monospace";
  });
  ctx.fillStyle = COLOR.winBorder;
  ctx.fillText("Z/X: back", 8, SCREEN_H - 8);
}

function drawBagMenu(ctx) {
  drawPanel(ctx, 2, 2, SCREEN_W - 4, SCREEN_H - 4);
  ctx.fillStyle = COLOR.winBorder;
  ctx.font = "bold 8px monospace";
  ctx.fillText("BAG", 8, 13);
  ctx.fillStyle = COLOR.textDark;
  ctx.font = "7px monospace";
  ctx.fillText(`Money: $${player.money}`, 140, 13);
  const items = Object.keys(player.bag).filter(k => player.bag[k] > 0 && ITEMS[k]);
  if (!items.length) {
    ctx.fillText("(empty)", 8, 26);
    return;
  }
  items.forEach((ik, i) => {
    const it = ITEMS[ik];
    const col = i % 2;
    const row = Math.floor(i / 2);
    if (menu.cursor === i) {
      ctx.fillStyle = COLOR.winBorderLight;
      ctx.fillRect(4 + col * 116, 22 + row * 9 - 7, 112, 9);
    }
    ctx.fillStyle = COLOR.textDark;
    ctx.fillText((menu.cursor === i ? ">" : " ") + `${it.name} x${player.bag[ik]}`, 6 + col * 116, 22 + row * 9);
  });
  ctx.fillStyle = COLOR.winBorder;
  ctx.fillText("Z: info  X: back", 8, SCREEN_H - 10);
}

function drawDexMenu(ctx) {
  drawPanel(ctx, 2, 2, SCREEN_W - 4, SCREEN_H - 4);
  ctx.fillStyle = COLOR.winBorder;
  ctx.font = "bold 8px monospace";
  ctx.fillText(`MONSTRODEX  ${caughtCount()}/${Object.keys(SPECIES).length}`, 8, 13);
  ctx.fillStyle = COLOR.textDark;
  ctx.font = "7px monospace";
  const list = menu.list;
  const perPage = 16;
  list.forEach((sk, i) => {
    if (i < 0 || i >= perPage) return;
    const sp = SPECIES[sk];
    const seen = player.dex.seen[sk];
    const caught = player.dex.caught[sk];
    const label = caught ? sp.name : (seen ? "??????" : "------");
    const num = String(i + 1).padStart(3, "0");
    if (menu.cursor === i) {
      ctx.fillStyle = COLOR.winBorderLight;
      ctx.fillRect(4, 22 + i * 8 - 6, SCREEN_W - 12, 8);
    }
    ctx.fillStyle = COLOR.textDark;
    ctx.fillText((menu.cursor === i ? ">" : " ") + `${num} ${label}`, 8, 22 + i * 8);
  });
  ctx.fillStyle = COLOR.winBorder;
  ctx.fillText("Z: detail  X: back", 8, SCREEN_H - 8);
}

function caughtCount() {
  return Object.keys(player.dex.caught || {}).length;
}

function drawDexDetail(ctx) {
  const sk = menu.speciesKey;
  const sp = SPECIES[sk];
  const caught = player.dex.caught[sk];
  const seen = player.dex.seen[sk];
  drawPanel(ctx, 2, 2, SCREEN_W - 4, SCREEN_H - 4);
  ctx.fillStyle = COLOR.winBorder;
  ctx.font = "bold 8px monospace";
  ctx.fillText(`No.${String(Object.keys(SPECIES).indexOf(sk)+1).padStart(3,"0")}`, 8, 13);

  ctx.fillStyle = COLOR.textDark;
  ctx.font = "7px monospace";
  if (caught) {
    drawMonsterSprite(ctx, { speciesKey: sk, shape: sp.shape, color: sp.color }, 8, 20, 40);
    ctx.font = "bold 8px monospace";
    ctx.fillStyle = COLOR.winBorder;
    ctx.fillText(sp.name, 56, 26);
    ctx.fillStyle = COLOR.textDark;
    ctx.font = "7px monospace";
    const types = Array.isArray(sp.type) ? sp.type : [sp.type];
    ctx.fillText(`Type: ${types.join("/")}`, 56, 38);
    ctx.fillText(`HT: ${(sp.baseHp/10).toFixed(1)}m`, 56, 48);
    ctx.fillText(`Catch: ${sp.catchRate}`, 56, 58);
    wrapText(ctx, sp.dex || "", 8, 72, SCREEN_W - 16, 8);
  } else if (seen) {
    ctx.fillText("???????", 56, 26);
    ctx.fillText("Type: ???", 56, 38);
    ctx.fillText("A glimpse was all you saw.", 8, 70);
  } else {
    ctx.fillText("Not yet encountered.", 8, 40);
  }
  ctx.fillStyle = COLOR.winBorder;
  ctx.fillText("Z/X: back", 8, SCREEN_H - 8);
}

function drawBadgesMenu(ctx) {
  drawPanel(ctx, 2, 2, SCREEN_W - 4, SCREEN_H - 4);
  ctx.fillStyle = COLOR.winBorder;
  ctx.font = "bold 8px monospace";
  ctx.fillText("BADGES", 8, 13);
  ctx.fillStyle = COLOR.textDark;
  ctx.font = "7px monospace";
  ctx.fillText(`Earned: ${player.badges.length}/${BADGES.length}`, 8, 24);
  BADGES.forEach((b, i) => {
    const has = player.badges.includes(b.name);
    const y = 36 + i * 18;
    ctx.fillStyle = has ? "#f8d818" : COLOR.winBgDark;
    ctx.beginPath(); ctx.arc(14, y - 3, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = has ? "#c8a018" : COLOR.rockD;
    ctx.beginPath(); ctx.arc(14, y - 2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = COLOR.textDark;
    ctx.fillText((has ? "[*] " : "[ ] ") + b.name, 24, y);
    if (has) {
      ctx.font = "6px monospace";
      wrapText(ctx, b.desc, 28, y + 7, SCREEN_W - 36, 7);
      ctx.font = "7px monospace";
    }
  });
  ctx.fillStyle = COLOR.winBorder;
  ctx.fillText("Z/X: back", 8, SCREEN_H - 8);
}

function drawSaveMenu(ctx) {
  drawPanel(ctx, 30, 50, SCREEN_W - 60, 60);
  ctx.fillStyle = COLOR.winBorder;
  ctx.font = "bold 8px monospace";
  ctx.fillText("SAVE GAME", 38, 64);
  ctx.fillStyle = COLOR.textDark;
  ctx.font = "7px monospace";
  ctx.fillText("Press Z to save.", 38, 78);
  ctx.fillText("X to cancel.", 38, 90);
  ctx.fillStyle = COLOR.winBorder;
  ctx.fillText("Money: $" + player.money, 38, 102);
}

function drawSettingsMenu(ctx) {
  drawPanel(ctx, 30, 50, SCREEN_W - 60, 60);
  ctx.fillStyle = COLOR.winBorder;
  ctx.font = "bold 8px monospace";
  ctx.fillText("SETTINGS", 38, 64);
  ctx.fillStyle = COLOR.textDark;
  ctx.font = "7px monospace";
  ctx.fillText('Sound: ' + (settings.muted ? 'OFF' : 'ON') + '  (Up/Down)', 38, 78);
  ctx.fillText("Theme: " + (getActivePalette().label || "Super GB"), 38, 90);
  ctx.fillText("(Left/Right to change)", 38, 100);
  ctx.fillStyle = COLOR.winBorder;
  ctx.fillText("X: back", 38, 110);
}

function drawStarterMenu(ctx) {
  drawPanel(ctx, 2, 2, SCREEN_W - 4, SCREEN_H - 4);
  ctx.fillStyle = COLOR.winBorder;
  ctx.font = "bold 8px monospace";
  ctx.fillText("Choose your first partner!", 8, 13);
  menu.options.forEach((sk, i) => {
    const sp = SPECIES[sk];
    const y = 24 + i * 42;
    if (menu.cursor === i) {
      ctx.fillStyle = COLOR.winBorderLight;
      ctx.fillRect(4, y - 4, SCREEN_W - 12, 38);
    }
    ctx.fillStyle = COLOR.textDark;
    drawMonsterSprite(ctx, { speciesKey: sk, shape: sp.shape, color: sp.color }, 8, y, 32);
    ctx.font = "bold 8px monospace";
    ctx.fillStyle = COLOR.winBorder;
    ctx.fillText((menu.cursor === i ? "> " : "  ") + sp.name, 46, y + 8);
    ctx.fillStyle = COLOR.textDark;
    ctx.font = "7px monospace";
    const types = Array.isArray(sp.type) ? sp.type : [sp.type];
    ctx.fillText("Type: " + types.join("/"), 46, y + 20);
    ctx.font = "6px monospace";
    wrapText(ctx, sp.dex || "", 46, y + 30, SCREEN_W - 54, 7);
    ctx.font = "7px monospace";
  });
  ctx.fillStyle = COLOR.winBorder;
  ctx.fillText("Z: confirm  X: back", 8, SCREEN_H - 6);
}

function drawHealPrompt(ctx) {
  drawPanel(ctx, 40, 54, SCREEN_W - 80, 50);
  ctx.fillStyle = COLOR.winBorder;
  ctx.font = "bold 8px monospace";
  ctx.fillText("Heal your monsters?", 48, 68);
  ctx.fillStyle = COLOR.textDark;
  ctx.font = "7px monospace";
  ctx.fillText((menu.cursor === 0 ? ">" : " ") + "Yes", 56, 84);
  ctx.fillText((menu.cursor === 1 ? ">" : " ") + "No", 110, 84);
}

function drawShop(ctx) {
  drawPanel(ctx, 2, 2, SCREEN_W - 4, SCREEN_H - 4);
  ctx.fillStyle = COLOR.winBorder;
  ctx.font = "bold 8px monospace";
  ctx.fillText("MART", 8, 13);
  ctx.fillStyle = COLOR.textDark;
  ctx.font = "7px monospace";
  ctx.fillText(`$${player.money}`, 180, 13);

  if (menu.phase === "browse") {
    SHOP_STOCK.forEach((ik, i) => {
      const it = ITEMS[ik];
      const col = i % 2;
      const row = Math.floor(i / 2);
      if (menu.cursor === i) {
        ctx.fillStyle = COLOR.winBorderLight;
        ctx.fillRect(4 + col * 116, 24 + row * 9 - 7, 112, 9);
      }
      ctx.fillStyle = COLOR.textDark;
      ctx.fillText((menu.cursor === i ? ">" : " ") + it.name, 6 + col * 116, 24 + row * 9);
      ctx.fillText(`$${it.price}`, 6 + col * 116 + 80, 24 + row * 9);
    });
    ctx.fillStyle = COLOR.winBorder;
    ctx.fillText("Z: buy  X: exit", 8, SCREEN_H - 8);
  } else if (menu.phase === "confirm") {
    const it = ITEMS[menu.itemKey];
    ctx.fillStyle = COLOR.textDark;
    ctx.fillText(`Buy ${it.name} for $${it.price}?`, 8, 40);
    ctx.fillText((menu.subCursor === 0 ? ">" : " ") + "Yes", 30, 56);
    ctx.fillText((menu.subCursor === 1 ? ">" : " ") + "No", 80, 56);
  }
}

function drawMenuMessage(ctx) {
  drawPanel(ctx, 2, 120, SCREEN_W - 4, 38);
  ctx.fillStyle = COLOR.textDark;
  ctx.font = "7px monospace";
  wrapText(ctx, menu.text, 8, 132, SCREEN_W - 16, 8);
  ctx.fillStyle = COLOR.winBorder;
  ctx.fillText("Z: ok", 8, 152);
}

// ============================================================
//  MEGA EXPANSION MENUS
//  Hero select, tool shop, fast travel, tool equip,
//  branching dialogue choices, stealth minigame.
// ============================================================

// ---- Hero Select ----
function openHeroSelectMenu() {
  game.state = GAME_STATE.MENU;
  menu = { type: "heroselect", cursor: 0, options: (typeof HERO_IDS !== "undefined") ? HERO_IDS.slice() : ["kael","lyra","mort","zara"] };
}

function heroSelectInput(key) {
  if (key === "cancel") { closeMenu(); return; }
  const n = menu.options.length;
  if (key === "down") menu.cursor = (menu.cursor + 1) % n;
  if (key === "up") menu.cursor = (menu.cursor + n - 1) % n;
  if (key === "confirm") {
    const heroId = menu.options[menu.cursor];
    if (typeof sfxHeroSelect === "function") sfxHeroSelect();
    if (typeof chooseHero === "function") chooseHero(heroId);
    const h = (typeof getHero === "function") ? getHero(heroId) : { name: heroId, personality: "?" };
    // After hero selection, show hero intro then proceed to starter selection
    const introLines = (typeof heroIntroDialogue === "function") ? heroIntroDialogue(heroId) : [];
    introLines.push("__STARTER_MENU__");
    menu = null;
    game.state = GAME_STATE.OVERWORLD;
    startDialogue(introLines);
  }
}

function drawHeroSelect(ctx) {
  drawPanel(ctx, 2, 2, SCREEN_W - 4, SCREEN_H - 4);
  ctx.fillStyle = COLOR.winBorder;
  ctx.font = "bold 8px monospace";
  ctx.fillText("CHOOSE YOUR HERO", 8, 13);
  ctx.fillStyle = COLOR.textDark;
  ctx.font = "7px monospace";
  menu.options.forEach((hid, i) => {
    const h = (typeof getHero === "function") ? getHero(hid) : { name: hid, personality: "", backstory: "" };
    const y = 22 + i * 34;
    if (menu.cursor === i) {
      ctx.fillStyle = COLOR.winBorderLight;
      ctx.fillRect(4, y - 8, SCREEN_W - 12, 30);
    }
    ctx.fillStyle = COLOR.winBorder;
    ctx.font = "bold 7px monospace";
    ctx.fillText((menu.cursor === i ? "> " : "  ") + h.name, 8, y);
    ctx.fillStyle = COLOR.textDark;
    ctx.font = "6px monospace";
    wrapText(ctx, h.personality || "", 8, y + 8, SCREEN_W - 16, 6);
    ctx.font = "7px monospace";
  });
  ctx.fillStyle = COLOR.winBorder;
  ctx.fillText("Z: confirm  X: back", 8, SCREEN_H - 6);
}

// ---- Tool Shop ----
function openToolShop() {
  game.state = GAME_STATE.MENU;
  const stock = (typeof SHOP_TOOLS !== "undefined") ? SHOP_TOOLS.slice() : [];
  menu = { type: "toolshop", cursor: 0, subCursor: 0, phase: "browse", stock: stock, itemKey: null };
}

function toolShopInput(key) {
  if (key === "cancel") {
    if (menu.phase === "confirm") { menu.phase = "browse"; menu.subCursor = 0; }
    else { closeMenu(); }
    return;
  }
  if (!menu.stock.length) { closeMenu(); return; }
  if (menu.phase === "browse") {
    if (key === "down") menu.cursor = (menu.cursor + 1) % menu.stock.length;
    if (key === "up") menu.cursor = (menu.cursor + menu.stock.length - 1) % menu.stock.length;
    if (key === "confirm") {
      const toolId = menu.stock[menu.cursor];
      const tool = (typeof getTool === "function") ? getTool(toolId) : null;
      if (!tool) return;
      if (player.money < tool.price) {
        menu = { type: "message", text: "Not enough money!", returnTo: { type: "toolshop", cursor: menu.cursor, phase: "browse", stock: menu.stock } };
        return;
      }
      menu.phase = "confirm";
      menu.subCursor = 0;
      menu.itemKey = toolId;
    }
  } else if (menu.phase === "confirm") {
    if (key === "down" || key === "up") menu.subCursor = (menu.subCursor + 1) % 2;
    if (key === "confirm") {
      if (menu.subCursor === 0) {
        const tool = getTool(menu.itemKey);
        player.money -= tool.price;
        if (typeof giveTool === "function") giveTool(menu.itemKey, 1);
        menu = { type: "message", text: `Bought ${tool.name}!`, returnTo: { type: "toolshop", cursor: menu.cursor, phase: "browse", stock: menu.stock } };
      } else {
        menu.phase = "browse";
      }
    }
  }
}

function drawToolShop(ctx) {
  drawPanel(ctx, 2, 2, SCREEN_W - 4, SCREEN_H - 4);
  ctx.fillStyle = COLOR.winBorder;
  ctx.font = "bold 8px monospace";
  ctx.fillText("TOOL SHOP", 8, 13);
  ctx.fillStyle = COLOR.textDark;
  ctx.font = "7px monospace";
  ctx.fillText("$" + player.money, 180, 13);

  if (menu.phase === "browse") {
    if (!menu.stock.length) {
      ctx.fillText("(no tools in stock)", 8, 28);
    } else {
      menu.stock.forEach((tid, i) => {
        const tool = getTool(tid);
        if (!tool) return;
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 6 + col * 116;
        const y = 26 + row * 12;
        if (menu.cursor === i) {
          ctx.fillStyle = COLOR.winBorderLight;
          ctx.fillRect(x - 2, y - 8, 112, 11);
        }
        ctx.fillStyle = COLOR.textDark;
        ctx.font = "7px monospace";
        // Shorten long names for display
        const nm = tool.name.length > 18 ? tool.name.slice(0, 17) + "." : tool.name;
        ctx.fillText((menu.cursor === i ? ">" : " ") + nm, x, y);
        ctx.fillText("$" + tool.price, x + 70, y);
        ctx.font = "6px monospace";
        ctx.fillText(tool.rarity, x, y + 7);
        ctx.font = "7px monospace";
      });
    }
    ctx.fillStyle = COLOR.winBorder;
    ctx.fillText("Z: buy  X: exit", 8, SCREEN_H - 8);
  } else if (menu.phase === "confirm") {
    const tool = getTool(menu.itemKey);
    ctx.fillStyle = COLOR.textDark;
    ctx.font = "7px monospace";
    ctx.fillText(`Buy ${tool.name}?`, 8, 36);
    wrapText(ctx, tool.desc || "", 8, 48, SCREEN_W - 16, 7);
    ctx.fillText(`Price: $${tool.price}`, 8, 90);
    ctx.fillText((menu.subCursor === 0 ? ">" : " ") + "Yes", 40, 110);
    ctx.fillText((menu.subCursor === 1 ? ">" : " ") + "No", 90, 110);
  }
}

// ---- Fast Travel ----
function openFastTravelMenu() {
  game.state = GAME_STATE.MENU;
  const unlocked = (typeof unlockedBiomes === "function") ? unlockedBiomes() : [];
  // Build destination list: verdantown hub + unlocked biomes
  const dests = [{ id: "verdantown", name: "Verdantown Hub", emoji: "" }];
  unlocked.forEach(bid => {
    const b = (typeof getBiome === "function") ? getBiome(bid) : null;
    dests.push({ id: bid, name: b ? b.name : bid, emoji: b ? b.emoji : "" });
  });
  menu = { type: "fasttravel", cursor: 0, destinations: dests };
}

function fastTravelInput(key) {
  if (key === "cancel") { closeMenu(); return; }
  const n = menu.destinations.length;
  if (key === "down") menu.cursor = (menu.cursor + 1) % n;
  if (key === "up") menu.cursor = (menu.cursor + n - 1) % n;
  if (key === "confirm") {
    const dest = menu.destinations[menu.cursor];
    if (typeof fastTravelTo === "function") fastTravelTo(dest.id);
    const msg = dest.id === "verdantown" ? "Welcome back to Verdantown!" : `Traveled to ${dest.name}!`;
    menu = { type: "message", text: msg, returnTo: null, onClose: closeMenu };
  }
}

function drawFastTravel(ctx) {
  drawPanel(ctx, 2, 2, SCREEN_W - 4, SCREEN_H - 4);
  ctx.fillStyle = COLOR.winBorder;
  ctx.font = "bold 8px monospace";
  ctx.fillText("FAST TRAVEL", 8, 13);
  ctx.fillStyle = COLOR.textDark;
  ctx.font = "7px monospace";
  if (!menu.destinations.length) {
    ctx.fillText("No destinations unlocked yet.", 8, 28);
    ctx.fillText("Explore the biomes to unlock fast travel!", 8, 38);
  } else {
    menu.destinations.forEach((d, i) => {
      const y = 24 + i * 12;
      if (menu.cursor === i) {
        ctx.fillStyle = COLOR.winBorderLight;
        ctx.fillRect(4, y - 8, SCREEN_W - 12, 11);
      }
      ctx.fillStyle = COLOR.textDark;
      ctx.fillText((menu.cursor === i ? "> " : "  ") + (d.emoji || "*") + " " + d.name, 8, y);
    });
  }
  ctx.fillStyle = COLOR.winBorder;
  ctx.fillText("Z: travel  X: back", 8, SCREEN_H - 6);
}

// ---- Tool Equip UI (from Party menu) ----
function openToolEquipMenu(monster) {
  game.state = GAME_STATE.MENU;
  const owned = [];
  if (player.toolBag) {
    Object.keys(player.toolBag).forEach(tid => {
      if (player.toolBag[tid] > 0) owned.push(tid);
    });
  }
  menu = { type: "toolequip", cursor: 0, monster: monster, owned: owned, phase: "list" };
}

function toolEquipInput(key) {
  if (key === "cancel") {
    if (menu.phase === "confirm") { menu.phase = "list"; return; }
    closeMenu();
    return;
  }
  const monster = menu.monster;
  const equipped = (typeof getEquippedTools === "function") ? getEquippedTools(monster) : [];
  const reopen = function() { openToolEquipMenu(monster); };
  if (menu.phase === "list") {
    const total = equipped.length + menu.owned.length;
    if (total === 0) { closeMenu(); return; }
    if (key === "down") menu.cursor = (menu.cursor + 1) % (total + 1); // +1 for exit
    if (key === "up") menu.cursor = (menu.cursor + total) % (total + 1);
    if (key === "confirm") {
      if (menu.cursor < equipped.length) {
        // Unequip
        const tid = equipped[menu.cursor];
        if (typeof unequipToolFromMonster === "function") unequipToolFromMonster(monster, tid);
        const tool = getTool(tid);
        menu = { type: "message", text: `Unequipped ${tool ? tool.name : tid}.`, returnTo: null, onClose: reopen };
      } else if (menu.cursor < total) {
        const tid = menu.owned[menu.cursor - equipped.length];
        const tool = getTool(tid);
        if (equipped.length >= 3) {
          menu = { type: "message", text: "Max 3 tools equipped!", returnTo: null, onClose: reopen };
          return;
        }
        const conflict = equipped.some(eid => { const t = getTool(eid); return t && t.slot === tool.slot; });
        if (conflict) {
          menu = { type: "message", text: `Slot (${tool.slot}) occupied!`, returnTo: null, onClose: reopen };
          return;
        }
        if (typeof equipToolToMonster === "function") equipToolToMonster(monster, tid);
        menu = { type: "message", text: `Equipped ${tool.name}!`, returnTo: null, onClose: reopen };
      } else {
        closeMenu();
      }
    }
  }
}

function drawToolEquip(ctx) {
  const m = menu.monster;
  drawPanel(ctx, 2, 2, SCREEN_W - 4, SCREEN_H - 4);
  ctx.fillStyle = COLOR.winBorder;
  ctx.font = "bold 8px monospace";
  ctx.fillText("TOOLS: " + m.name, 8, 13);
  ctx.fillStyle = COLOR.textDark;
  ctx.font = "7px monospace";
  const equipped = (typeof getEquippedTools === "function") ? getEquippedTools(m) : [];
  let y = 24;
  ctx.fillStyle = COLOR.winBorder;
  ctx.fillText("Equipped (" + equipped.length + "/3):", 8, y);
  y += 9;
  equipped.forEach((tid, i) => {
    const tool = getTool(tid);
    if (menu.cursor === i) {
      ctx.fillStyle = COLOR.winBorderLight;
      ctx.fillRect(4, y - 7, SCREEN_W - 12, 9);
    }
    ctx.fillStyle = COLOR.textDark;
    ctx.fillText((menu.cursor === i ? "> " : "  ") + "- " + (tool ? tool.name : tid), 8, y);
    y += 9;
  });
  ctx.fillStyle = COLOR.winBorder;
  ctx.fillText("Available:", 8, y);
  y += 9;
  menu.owned.forEach((tid, i) => {
    const tool = getTool(tid);
    const idx = equipped.length + i;
    if (menu.cursor === idx) {
      ctx.fillStyle = COLOR.winBorderLight;
      ctx.fillRect(4, y - 7, SCREEN_W - 12, 9);
    }
    ctx.fillStyle = COLOR.textDark;
    ctx.fillText((menu.cursor === idx ? "> " : "  ") + "+ " + (tool ? tool.name : tid), 8, y);
    y += 9;
  });
  // exit option
  if (menu.cursor === equipped.length + menu.owned.length) {
    ctx.fillStyle = COLOR.winBorderLight;
    ctx.fillRect(4, y - 7, SCREEN_W - 12, 9);
  }
  ctx.fillStyle = COLOR.winBorder;
  ctx.fillText((menu.cursor === equipped.length + menu.owned.length ? "> " : "  ") + "EXIT", 8, y);
  ctx.fillText("Z: equip/unequip  X: back", 8, SCREEN_H - 6);
}

// ---- Branching Dialogue Choice Menu ----
function handleBranchTag(line) {
  // Parse: __BRANCH_<sceneId>__
  const m = line.match(/__BRANCH_([a-zA-Z0-9_]+)__/);
  if (!m) return;
  const sceneId = m[1];
  // Start the branch (intro already shown); now present options
  if (typeof startBranchDialogue === "function") {
    // If branch already started (intro was shown), just present options
    if (typeof branchDialogue !== "undefined" && branchDialogue && branchDialogue.scene) {
      // intro already done, show options menu
      game.state = GAME_STATE.MENU;
      menu = { type: "branch", cursor: 0, scene: branchDialogue.scene };
    } else {
      // Start fresh — show intro then options
      startBranchDialogue(sceneId);
    }
  }
}

function branchMenuInput(key) {
  if (key === "cancel") { closeMenu(); return; }
  if (!menu.scene) { closeMenu(); return; }
  const opts = menu.scene.options;
  if (key === "down") menu.cursor = (menu.cursor + 1) % opts.length;
  if (key === "up") menu.cursor = (menu.cursor + opts.length - 1) % opts.length;
  if (key === "confirm") {
    const opt = opts[menu.cursor];
    if (typeof sfxBranch === "function") sfxBranch();
    // Show result lines, with action tag appended
    if (typeof selectBranchOption === "function") {
      selectBranchOption(menu.cursor);
    }
    closeMenu();
  }
}

function drawBranchMenu(ctx) {
  if (!menu.scene) return;
  drawPanel(ctx, 2, 2, SCREEN_W - 4, SCREEN_H - 4);
  ctx.fillStyle = COLOR.winBorder;
  ctx.font = "bold 8px monospace";
  ctx.fillText("WHAT DO YOU DO?", 8, 13);
  ctx.fillStyle = COLOR.textDark;
  ctx.font = "7px monospace";
  menu.scene.options.forEach((opt, i) => {
    const y = 24 + i * 18;
    if (menu.cursor === i) {
      ctx.fillStyle = COLOR.winBorderLight;
      ctx.fillRect(4, y - 8, SCREEN_W - 12, 16);
    }
    ctx.fillStyle = COLOR.textDark;
    ctx.font = "6px monospace";
    wrapText(ctx, (menu.cursor === i ? "> " : "  ") + opt.label, 8, y, SCREEN_W - 16, 7);
    ctx.font = "7px monospace";
  });
  ctx.fillStyle = COLOR.winBorder;
  ctx.fillText("Z: choose  X: back", 8, SCREEN_H - 6);
}

// ---- Stealth Minigame ----
function stealthMenuInput(key) {
  if (typeof stealthMinigameInput === "function") {
    stealthMinigameInput(key);
  }
}

function drawStealthMinigame(ctx) {
  drawPanel(ctx, 2, 2, SCREEN_W - 4, SCREEN_H - 4);
  ctx.fillStyle = COLOR.winBorder;
  ctx.font = "bold 8px monospace";
  ctx.fillText("STEALTH CHECK", 8, 13);
  ctx.fillStyle = COLOR.textDark;
  ctx.font = "7px monospace";
  ctx.fillText("Press Z when the marker", 8, 28);
  ctx.fillText("is in the green zone!", 8, 38);

  // Bar
  const barX = 16, barY = 60, barW = SCREEN_W - 32, barH = 12;
  // danger zone (red)
  ctx.fillStyle = "#a83838";
  ctx.fillRect(barX, barY, barW, barH);
  // safe zone (green)
  if (typeof stealthMinigame !== "undefined" && stealthMinigame) {
    const safeX = barX + Math.floor(barW * stealthMinigame.safeStart / 100);
    const safeW = Math.floor(barW * (stealthMinigame.safeEnd - stealthMinigame.safeStart) / 100);
    ctx.fillStyle = "#38a838";
    ctx.fillRect(safeX, barY, safeW, barH);
    // marker
    const mx = barX + Math.floor(barW * stealthMinigame.pos / 100);
    ctx.fillStyle = "#f8f8f8";
    ctx.fillRect(mx - 1, barY - 2, 3, barH + 4);
  }
  ctx.fillStyle = COLOR.winBorder;
  ctx.fillRect(barX, barY, barW, 1);
  ctx.fillRect(barX, barY + barH - 1, barW, 1);

  ctx.fillStyle = COLOR.textDark;
  ctx.font = "6px monospace";
  ctx.fillText("DANGER", barX + 2, barY + barH + 8);
  ctx.fillText("SAFE", barX + Math.floor(barW * 0.45), barY + barH + 8);
  ctx.fillStyle = COLOR.winBorder;
  ctx.font = "7px monospace";
  ctx.fillText("Z: STOP!", 8, SCREEN_H - 6);
}
