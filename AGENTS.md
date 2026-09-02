# AGENTS.md

Guidance for any AI agent (Claude, Codex, Copilot, Cursor, etc.) or automation working in this repository.

## What this repo is

**FEDMON: NO MERCY** — promo landing page for a brutal, adult monster-taming action RPG (game itself is Godot 4; this repo is the storefront site). Static HTML/CSS/JS, no build step, deployed to GitHub Pages.

## Core constraints (read first)

- **No dependencies, no build step, no frameworks.** Vanilla HTML + CSS + JS only.
- **No external assets** for core rendering. Grain = inline SVG data URI. Sprites = canvas/CSS. Fonts = system stack.
- **No secrets in commits.** Ever.
- **Don't reuse a previous layout composition.** The maintainer has rejected restyled clones. Structural changes only, and document them.
- **Respect `prefers-reduced-motion`** and disable custom cursor on touch/coarse pointers.
- **Adult content is in-fiction only.** Keep it out of contributor interactions and docs' tone toward people.
- **No racially coded naming or lore.** The project actively rejects it.

## Files you'll touch

| File | What it is |
|------|-----------|
| `index.html` | Markup — 6 scroll-snap sections + fixed left rail |
| `style.css` | All styling — cursor, grain, snap layout, combat HUD, responsive |
| `script.js` | Logic — cursor, live readouts, combat canvas, reveals, easter eggs |
| `README.md` | Project + composition docs |
| `CLAUDE.md` | Claude-specific guidance (read alongside this) |
| `.github/**` | Templates + workflows |

## Architecture notes

- **Fixed left rail** (`aside.rail`) pinned viewport-height, with live readout spans (`#rHP`, `#rCash`, `#rHeat`, `#rStam`, `#rProg`).
- **6 snap sections** in `main`: boot, combat, mech, starters, econ, drop. `scroll-snap-type: y mandatory` on `main`.
- **Combat HUD** (`#combatCanvas`, 880×360): `drawHUD()` render loop, `state` object (tHP, cHP, sync, fx[], shake, flash), `moves` object. Buttons have `data-move` attributes.
- **Mech deck** (`.mech-track`): horizontal `scroll-snap-type: x mandatory`, `.snap-card` children with `data-w` meter values.
- **Starters** (`.starter`): `data-stats`, 5 `.stat-row` bars with `data-v`, animated by IntersectionObserver setting `--v`.
- **Easter eggs**: F-key title glitch + SYNC charge; styled console logs. Preserve them.

## How to verify your work

```bash
cd fedmon
python3 -m http.server 8765
# open http://localhost:8765/index.html in a browser
```

Check:
- Page renders, title is "FEDMON: NO MERCY"
- No console errors (DevTools)
- Rail readouts are ticking (HP/CASH/HEAT/STAM change over time)
- Combat buttons trigger enemy response + damage numbers
- Stat bars animate on scroll into view
- Cursor dot + ring follow mouse on desktop, disabled on touch
- Mobile width (≤560px) doesn't break layout

Only claim success after actually opening it in a browser.

## Commit conventions

- Imperative subject: `Add heat-spike card to mech deck`
- Reference issues/PRs in body
- One logical change per commit
- Don't commit generated/scratch files

## Escalation

If a request would require a framework, build step, external asset, or a reused layout — **stop and ask** (open an issue or discussion) rather than proceeding. The maintainer has explicit preferences documented in `CLAUDE.md` and `CONTRIBUTING.md`.
