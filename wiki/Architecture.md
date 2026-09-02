# Architecture

How the FEDMON: NO MERCY promo page is built. (For the game's engine architecture, see the Godot project — not in this repo.)

## Overview

A static, single-page site: vanilla HTML + CSS + JS, no build step, no dependencies, no external core assets. Deployed to GitHub Pages.

## Composition model

**Fixed left rail HUD** + **vertical scroll-snap** of 6 full-viewport sections.

```
┌────┬─────────────────────────────────────┐
│ R  │  01 BOOT    (title + terminal feed) │
│ A  ├─────────────────────────────────────┤
│ I  │  02 COMBAT  (interactive canvas HUD)│
│ L  ├─────────────────────────────────────┤
│    │  03 MECH    (horizontal card deck)  │
│ HUD├─────────────────────────────────────┤
│    │  04 STARTERS (3-col dossier)        │
│ +  ├─────────────────────────────────────┤
│live│  05 ECON    (receipt terminals)     │
│read├─────────────────────────────────────┤
│outs│  06 DROP    (brutalist red CTA)     │
└────┴─────────────────────────────────────┘
```

### The rail (`aside.rail`)
- 64px wide, `position: fixed`, full viewport height.
- Live readout spans: `#rHP`, `#rCash`, `#rHeat`, `#rStam`, `#rProg`.
- Vertical wordmark.
- Collapses / hides at mobile breakpoints.

### Sections (`main > section`)
- `main` has `scroll-snap-type: y mandatory`; sections are `scroll-snap-align: start` and `min-height: 100vh`.
- IDs: `#boot`, `#combat`, `#mech`, `#starters`, `#econ`, `#drop`.

## Key subsystems

### Combat HUD (`#combatCanvas`, 880×360)
- `script.js` runs a `drawHUD()` render loop via `requestAnimationFrame`.
- `state` object: `tHP`, `cHP`, `sync`, `fx[]`, `shake`, `flash`, `msg`.
- `moves` object: `jab`, `dodge`, `tackle`, `strike`, `ult` — each with `dmg`, `gainSync`, `msg`.
- Buttons carry `data-move` attributes; click handlers apply damage, spawn floating fx (damage numbers + sparks with gravity), trigger enemy counter-attack, and handle rematch.
- ULT gated on full SYNC.

### Mechanics deck (`.mech-track`)
- Horizontal `scroll-snap-type: x mandatory`.
- `.snap-card` children (340px) with `data-w` → CSS `--w` meter bar width.
- IntersectionObserver sets `--w` on reveal.

### Starters (`.starter`)
- 3-column grid; each card has `data-stats` and 5 `.stat-row` bars with `data-v` → CSS `--v`.
- Bars animate from 0 to `--v` on scroll-into-view (IntersectionObserver adds `.in`).

### Live rail readouts
- `hpTick`, `cashTick`, `heatTick`, `stamTick` — `setInterval` loops.
- `updateProg` — scroll progress bound to scroll event.
- **Don't spawn duplicate intervals** when editing.

### Custom cursor
- `.cursor-dot` + `.cursor-ring`; ring lerps toward dot.
- `.hot` class on `a`, `button`, `.snap-card`, `.starter` hover.
- `mix-blend-mode: screen`.
- Disabled on `pointer: coarse` (touch).

### Grain
- Inline SVG fractal noise data URI in `style.css` `.grain` overlay.
- `@keyframes grainShift` animates `background-position`.

### Easter eggs
- **F key** → glitches `.boot-title` (skew + hue-rotate + jitter) and charges SYNC to max.
- Styled `%c` console logs on load.

## File map

| File | Responsibility |
|------|----------------|
| `index.html` | Markup: rail + 6 sections |
| `style.css` | All styling, responsive, reduced-motion |
| `script.js` | Cursor, rail readouts, combat HUD, reveals, easter eggs |

## Decisions

See [ADR.md](../ADR.md) — especially ADR-001 (vanilla), ADR-002 (no external assets), ADR-003 (rail+snap), ADR-004 (canvas combat), ADR-007 (no reused layouts).

## Constraints (enforced in review)

- No frameworks / build steps / CDN core assets.
- No external core assets (inline SVG, canvas, CSS, system fonts only).
- No reused layouts — structural changes only.
- `prefers-reduced-motion` honored; cursor disabled on touch.
- Responsive at 900px and 560px.
- No easter eggs removed without explicit approval.
- Aesthetic not softened.
