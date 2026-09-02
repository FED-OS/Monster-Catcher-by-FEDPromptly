# FEDMON: NO MERCY

> A gritty, adult-oriented monster-taming action RPG. No gyms. No badges. No free healing.

Fists. Debt. Loan sharks. Arrests. Property you actually own. Creatures that bleed.

FEDMON: NO MERCY is an indie monster-taming action RPG built in **Godot 4**, designed for players who grew up on creature-collectors and want something that fights back. You don't grind badges — you survive a city that wants you broke, beaten, or behind bars.

---

## This Repository

This repo contains the **promotional landing page** for FEDMON: NO MERCY — a single-page static site built for **GitHub Pages**. No frameworks. No build step. No dependencies. Just hand-written HTML, CSS, and vanilla JavaScript.

### File Structure

```
fedmon/
├── index.html      # Markup — 6 scroll-snap sections + fixed HUD rail
├── style.css       # All styling — custom cursor, grain, snap layout, combat HUD
├── script.js       # Logic — live readouts, combat canvas, reveals, easter eggs
├── assets/         # (reserved for future sprites / og image)
└── README.md       # You are here
```

To run locally, just open `index.html` in a browser. To deploy, push to a `gh-pages` branch or enable GitHub Pages on the repo root.

---

## Page Composition

The page is built as a **fixed left-rail HUD** anchored to a **vertical scroll-snap sequence** of full-viewport sections. It is intentionally not a traditional top-down scroll.

### The Rail (left, fixed)
A 64px vertical command rail that stays pinned through the entire page. It shows live-updating readouts: TRAINER HP (wobbling 60–100), CASH (counting toward $1,247), HEAT (0–9 police heat spikes), STAMINA (drifting 40–95), and a scroll-progress bar. The wordmark runs vertically along the edge.

### Section 01 — BOOT
Asymmetric grid: a giant glitch-ready title on the left, a live terminal boot feed on the right. The terminal streams status lines on a delay, then drops a blinking prompt. Strikethrough callouts: ~~No gyms~~ ~~No badges~~ ~~No free healing~~. This is the only "hero" — and it's a terminal, not a marketing banner.

### Section 02 — COMBAT
A real, interactive **canvas combat HUD**. Pixel-art trainer and creature sprites face off with animated health bars, a SYNC energy meter, floating damage numbers, sparks with gravity, and screen shake. Five command buttons (JAB, DODGE, TACKLE, STRIKE, ULT) drive the mock fight — the enemy counters, you can rematch, and ULT only fires when SYNC is full. This is not a video. It's a playable slice.

### Section 03 — MECHANICS
A **horizontal scroll-snap card deck**. Six mechanic cards (NO FREE HEALING, FIST MELEE, PROPERTY OWNERSHIP, ARREST MECHANICS, LOAN SHARKS, STAMINA ECONOMY) slide sideways with momentum snapping. Each card has a meter bar that fills on reveal. Scroll vertically to advance past the deck; scroll horizontally to browse it.

### Section 04 — STARTERS
A **three-column starter dossier**. EMBERHOUND (fire/brute), VOLTHEDGE (volt/guard), SLICKLIZ (toxin/scout) — each with a CSS-drawn sprite, type badges, five animated stat bars (HP / ATK / DEF / SPD / SYNC), and an evolution chain. Bars fill from zero on scroll-into-view.

### Section 05 — ECONOMY
Two **receipt-style terminal panels**: DAILY BURN (what survival costs per day) and DEBT PROTOCOL (what the loan shark charges). Monospace, line-itemed, with totals. Reads like a bill, because in this game it is one.

### Section 06 — DROP
A **brutalist solid-red finale**. Huge outlined "NO MERCY" text, offset-shadow buttons (WISHLIST / DEVLOG / PRESS KIT), and a drop-foot with release window and engine credit. No soft fade-out. It hits and stops.

---

## Interaction & Effects

- **Custom cursor** — a dot with a lerp-following trailing ring that enters a "hot" state on interactive elements. Disabled on touch / coarse pointers. Uses `mix-blend-mode: screen` so it reads on any background.
- **SVG fractal grain** — an inline data-URI noise overlay with a slow `grainShift` keyframe. No external image assets.
- **Scroll-triggered reveals** — an `IntersectionObserver` adds an `.in` class to sections and animates stat/meter bars from zero when they enter view.
- **Live HUD readouts** — the rail's numbers tick, wobble, spike, and count in real time via `setInterval` loops.
- **F-key glitch** — press **F** to glitch the boot title (skew + hue-rotate + jitter) and charge SYNC to max. An undocumented charge-up easter egg.
- **Console easter egg** — styled `%c` console logs for anyone who opens DevTools.
- **Accessibility** — a `prefers-reduced-motion` media query disables grain animation, cursor trails, and snap where supported.

---

## Tech Notes

- **No dependencies.** No npm, no bundler, no Tailwind, no framework. Three files.
- **No external assets.** Grain is an inline SVG data URI; sprites are canvas/CSS-drawn; fonts are system stacks.
- **Responsive.** Breakpoints at 900px and 560px collapse the rail, stack the boot grid, and reflow the starter dossier. Custom cursor disabled on touch.
- **Engine note.** The game itself is built in Godot 4. This page is just the storefront.

---

## About the Game

FEDMON: NO MERCY is a monster-taming action RPG where the world doesn't hand you anything. Healing costs money. Fights can start with a fist. Creatures are owned, traded, and repossessed. The police have a heat meter with your name on it. The loan shark is patient — until he isn't.

You raise creatures. You take fights. You own property. You go into debt. You get arrested. You get out. You do it again.

**No mercy.**

---

*Indie project. Page hand-built. Creatures bleed.*
