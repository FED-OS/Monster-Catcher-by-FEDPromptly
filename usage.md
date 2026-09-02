# usage

How to use the FEDMON: NO MERCY promo page — both as a visitor and as a developer editing it.

> For installation/local-run steps, see [INSTALL.md](INSTALL.md). This doc is about *using* the page and the repo.

---

## Using the promo page (visitor)

### Navigation
The page is a vertical sequence of full-screen sections. Scroll (or snap) through them in order:

1. **Boot** — the title and a live terminal feed. Three buttons: **ENTER** (jump to combat), **WISHLIST**, **REPO**.
2. **Combat** — an interactive fight. Click the move buttons to attack the enemy creature. The enemy counters. Watch your HP and SYNC bars. Fill SYNC to unleash the **ULT**.
3. **Mechanics** — a horizontal card deck. Scroll/drag sideways to browse the six survival rules.
4. **Starters** — three creature cards. Scroll into view and the stat bars animate.
5. **Economy** — two receipt panels showing the daily cost of survival and the loan shark's terms.
6. **Drop** — the finale. Links to wishlist, devlog, and press kit.

### The left rail
A fixed vertical HUD that stays with you the whole page. It shows live readouts:
- **HP** — your trainer's health (wobbles)
- **CASH** — in-game money (counts up)
- **HEAT** — police heat (spikes randomly)
- **STAM** — stamina (drifts)
- **Progress bar** — how far down the page you are

### Easter eggs
- **Press `F`** on the boot section → the title glitches and SYNC charges to max.
- **Open DevTools console** → styled hidden messages.

### Keyboard & input
- Mouse: custom cursor (dot + trailing ring). Hot-state on buttons/cards.
- Touch: custom cursor disabled; native interactions work.
- Reduced motion: grain and snap soften automatically if your OS requests it.

---

## Using the repo (developer)

### Editing the page
All three source files are in `fedmon/`:

| File | Edit it to… |
|------|-------------|
| `index.html` | Change markup, add/remove sections, edit copy |
| `style.css` | Change colors, layout, animation, responsive rules |
| `script.js` | Change cursor, rail readouts, combat HUD, reveals, easter eggs |

There's no build step. Save the file and refresh the browser.

### Common edits

**Change the color palette:**
Top of `style.css` defines CSS custom properties:
```css
:root{
  --bg:#08060c;
  --red:#e23a4a;
  --gold:#f6b83e;
  --blue:#4a8fe0;
  --green:#3ad48a;
  /* ... */
}
```
Adjust these and the whole page updates.

**Tweak a combat move:**
In `script.js`, find the `moves` object — each move has `dmg`, `gainSync`, and `msg`. Edit values there.

**Add a mechanic card:**
In `index.html` under `#mech`, copy a `.snap-card` `<article>` and change its `data-w`, icon, copy. Add a matching CSS rule if needed.

**Add a starter:**
In `#starters`, copy a `.starter` `<article>`, update `data-stats`, sprite, name, types, stat `data-v` values, and evolution chain.

**Adjust a live readout:**
In `script.js`, the `hpTick`, `cashTick`, `heatTick`, `stamTick` functions control the rail numbers. Edit their ranges/intervals.

### Don't (per [CONTRIBUTING.md](CONTRIBUTING.md))
- Don't add frameworks/build steps/CDN core assets.
- Don't reuse a prior layout composition — change structure, not just style.
- Don't delete easter eggs.
- Don't soften the aesthetic.
- Don't commit secrets.

---

## Using the workflows

CI workflows in `.github/workflows/` run automatically. You don't invoke them locally. To trigger manually:
- Repo → **Actions** tab → select a workflow → **Run workflow** (for those with `workflow_dispatch`).

See [BUILD.md](BUILD.md) and [DEPLOYMENT.md](DEPLOYMENT.md).

---

## Using the templates

- **Issues:** repo → Issues → New issue → pick a template.
- **PRs:** opening a PR auto-fills the PR template.
- **Discussions:** the welcome post is `.github/DISCUSSION_WELCOME_README.md`.

---

## Using this repo as a template for your own project

The promo page is MIT-licensed (see [COPYING.md](COPYING.md)). You're welcome to fork it for your own game's landing page, but:
1. Keep the LICENSE.
2. Don't use the **FEDMON** name or creature names for your project.
3. Credit the original where reasonable.
4. Make it your own composition — don't ship a clone.

---

*Use it. Break it. Fix it. Just don't soften it.*
