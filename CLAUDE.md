# CLAUDE.md

Guidance for Claude (and other AI coding assistants) working in this repository.

## Project

**FEDMON: NO MERCY** — a gritty, adult-oriented monster-taming action RPG (Godot 4 engine for the game). This repository currently holds the **promotional landing page** — a hand-built static site for GitHub Pages — plus community/config files.

The game design lives in design docs and the README; the *code* in this repo is the promo page only.

## Repo layout

```
fedmon/
├── index.html              # Promo page markup — 6 scroll-snap sections + fixed rail
├── style.css               # All styling (custom cursor, grain, snap, combat HUD)
├── script.js               # Logic (cursor, live readouts, combat canvas, easter eggs)
├── assets/                 # Reserved for sprites / og image
├── .github/                # Issue templates, PR template, workflows, discussion welcome
├── README.md               # Project + page composition docs
├── CONTRIBUTING.md         # How to contribute
├── CLAUDE.md               # This file — guidance for AI assistants
├── AGENTS.md               # Generic agent guidance
└── ...                     # Other community/meta docs
```

## Critical rules

1. **NEVER reuse a previous page layout wholesale.** The maintainer has explicitly rejected restyled versions of the same composition. If you change the page, change the *structure*, and say so in the PR description.
2. **No dependencies.** No npm, no bundler, no Tailwind, no framework. Three files: HTML, CSS, JS.
3. **No external assets.** Grain is an inline SVG data URI; sprites are canvas/CSS-drawn; fonts are system stacks. Don't introduce CDNs or external image URLs for core assets.
4. **No secrets.** Never commit API keys, tokens, or personal data.
5. **Adult themes stay in-fiction.** The game is brutal (fistfights, debt, arrests, loan sharks, no free healing). That tone does **not** extend to how contributors or users are treated.
6. **Reject racially coded naming.** The project deliberately chose "FEDMON: NO MERCY" over alternatives that were racially coded. Do not reintroduce coded language.
7. **Verify before claiming.** If you change files, open `index.html` in a browser and confirm it renders with no console errors. Don't say "done" without checking.

## Working on the page

- The page is a **fixed left rail HUD** + **vertical scroll-snap** of 6 full-viewport sections: `#boot`, `#combat`, `#mech`, `#starters`, `#econ`, `#drop`.
- Section 02 (`#combat`) has an **interactive canvas combat HUD** in `script.js` with a `drawHUD()` render loop, a `state` object, and a `moves` object. Touch the canvas API carefully.
- Live HUD readouts in the rail are driven by `setInterval` loops (`hpTick`, `cashTick`, `heatTick`, `stamTick`). Don't spawn duplicate intervals.
- IntersectionObserver handles `.in` reveals and stat-bar animation. Bar widths come from `data-v` / `data-w` attributes set into CSS custom properties (`--v`, `--w`).
- Easter eggs: **F key** glitches the boot title and charges SYNC; styled `%c` console logs. Don't remove these unless asked.
- Accessibility: respect `prefers-reduced-motion`. Custom cursor must disable on coarse pointers (`pointer: coarse`).

## Testing locally

```bash
cd fedmon
python3 -m http.server 8765
# open http://localhost:8765/index.html
```

No build step. Refresh after edits.

## Commit style

- Use clear, imperative subjects: `Add arrest-mechanic card to mech deck`, not `updated stuff`.
- Reference issues: `Fix combat canvas redraw on resize (#42)`.
- One logical change per commit.

## Don't

- Don't add a framework, package manager, or build pipeline without explicit maintainer approval.
- Don't replace the canvas combat HUD with a static image or video.
- Don't soften the aesthetic (pastel colors, rounded soft UI, cheerful copy) — the brutalist red/black monospace tone is the point.
- Don't delete easter eggs.
- Don't "normalize" file line endings by hand — `.gitattributes` handles it.

## When unsure

Open a discussion or an issue before making large structural changes. The maintainer has strong opinions about composition.
