# Architecture Decision Records (ADR)

A lightweight log of significant decisions made on FEDMON: NO MERCY (promo page + project structure). Newer decisions at the bottom.

Format: **ADR-NNN** — Title — Status — Date — Context / Decision / Consequences.

---

## ADR-001 — Vanilla HTML/CSS/JS, no framework or build step

**Status:** Accepted
**Date:** 2026-01-01

**Context:** The promo page needs to deploy to GitHub Pages with zero friction, load instantly, and be editable by anyone with a text editor. The maintainer has strong feelings about dependency weight and build pipelines for a marketing site.

**Decision:** Build the page with hand-written HTML, CSS, and vanilla JavaScript only. No npm, no bundler, no Tailwind, no React/Vue/Svelte.

**Consequences:**
- ✅ No `node_modules`, no lockfiles, no install step.
- ✅ Deploys as static files directly.
- ✅ Anyone can read and edit the source.
- ⚠️ No component reuse — markup is hand-maintained across sections.
- ⚠️ No type checking or linting built in (mitigated by CI checks, see ADR-006).

---

## ADR-002 — No external assets for core rendering

**Status:** Accepted
**Date:** 2026-01-01

**Context:** External image/font/CDN dependencies can break, get rate-limited, or go offline, killing the promo page. The grain, sprites, and fonts are simple enough to inline or draw.

**Decision:** Fractal grain = inline SVG data URI. Combat/creature sprites = canvas/CSS-drawn. Fonts = system stack. No CDN, no external image URLs for core assets.

**Consequences:**
- ✅ Fully self-contained — works offline, no network dependencies.
- ✅ No CORS or hotlink issues.
- ⚠️ Art fidelity is limited to what canvas/CSS can draw.
- ⚠️ System fonts mean rendering varies slightly by OS (acceptable; the aesthetic is terminal-ish anyway).

---

## ADR-003 — Fixed left rail HUD + vertical scroll-snap sections

**Status:** Accepted
**Date:** 2026-01-02

**Context:** Earlier promo-page attempts used a traditional top-hero-then-scroll layout. The maintainer rejected them as "boring," "predictable," and "the same thing with worse font." A structurally distinct composition was required.

**Decision:** Pin a 64px left command rail (live HUD readouts) to the viewport, and make `main` a vertical `scroll-snap-type: y mandatory` sequence of 6 full-viewport sections (boot, combat, mech, starters, econ, drop).

**Consequences:**
- ✅ Distinct, game-like feel — the rail reads like an in-game HUD.
- ✅ Each section is a "scene" rather than a scrolling column.
- ⚠️ Snap scrolling can feel restrictive to some users; mitigated by `prefers-reduced-motion` and responsive reflow.
- ⚠️ Mobile requires collapsing the rail and reflowing sections (handled at 900px/560px breakpoints).

---

## ADR-004 — Interactive canvas combat HUD instead of a video or static art

**Status:** Accepted
**Date:** 2026-01-02

**Context:** Showing combat via an embedded video is passive and bandwidth-heavy. Static art doesn't convey that FEDMON's combat is active (trainer + creature fighting together).

**Decision:** Build a real interactive canvas combat HUD in `script.js` — pixel sprites, animated bars, floating damage, sparks, screen shake — driven by five command buttons, with enemy counter-attacks and rematch logic.

**Consequences:**
- ✅ Visitors get a playable slice, not a pitch.
- ✅ Zero bandwidth — it's code, not media.
- ⚠️ More JS complexity (state machine, render loop, fx system).
- ⚠️ Must degrade gracefully if canvas/WebGL is unavailable (graceful: buttons simply no-op).

---

## ADR-005 — Name: "FEDMON: NO MERCY" (rejected racially coded alternatives)

**Status:** Accepted
**Date:** 2026-01-01

**Context:** Working titles included "JUMPMON: URBAN LEGACY" and variants using "Urban" / "Street Level." These were flagged as racially coded — associating the game's crime/debt/arrest themes with specific real-world demographics.

**Decision:** Rename to "FEDMON: NO MERCY." The "fed" prefix evokes the game's arrest/jurisdiction/heat mechanics without encoding race.

**Consequences:**
- ✅ Avoids reinforcing harmful stereotypes.
- ✅ The name still fits the brutal, legal-system-adjacent themes.
- ⚠️ Requires updating all references from prior working titles (done in this repo).
- **Rule:** Do not reintroduce racially coded naming in lore, locations, or characters.

---

## ADR-006 — CI via GitHub Actions: HTML validation, link check, deploy

**Status:** Accepted
**Date:** 2026-01-03

**Context:** With no build step or linter, there's no automated guard against broken HTML, dead links, or broken deploys.

**Decision:** Add GitHub Actions workflows (`.github/workflows/`) that: validate HTML structure, check internal links, lint JS for syntax errors, and deploy to GitHub Pages on push to the default branch.

**Consequences:**
- ✅ Catches broken markup/links before they hit production.
- ✅ Automated Pages deploy.
- ⚠️ CI adds config files (acceptable; they're standard GitHub templates).
- See workflows: `ci.yml`, `pages.yml`, `codeql.yml`, etc.

---

## ADR-007 — Reject restyled clones of prior layouts

**Status:** Accepted
**Date:** 2026-01-02

**Context:** The maintainer explicitly rejected multiple prior page versions for reusing the same layout with only cosmetic changes ("the same thing with worse font").

**Decision:** Establish a standing rule: any page redesign must be a **structural** change, not a restyle. Document the composition change in the PR. Maintainers reject PRs that clone prior layouts.

**Consequences:**
- ✅ Prevents churn and design regression.
- ✅ Forces intentional composition thinking.
- ⚠️ Higher bar for visual PRs — contributors must justify structure, not just styling.
- Enforced via the PR template checklist and maintainer review.

---

## How to add a new ADR

1. Copy the format above.
2. Number sequentially (ADR-008, ADR-009…).
3. Set Status to `Proposed`, then `Accepted` / `Superseded by ADR-NNN` / `Deprecated` once decided.
4. Open a PR. Keep it short.
