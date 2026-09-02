# Summary

A one-page overview of FEDMON: NO MERCY and this repository.

---

## The game

**FEDMON: NO MERCY** is a gritty, adult-oriented monster-taming action RPG built in **Godot 4**. You raise creatures and take fights — but the world doesn't hand you anything. Healing costs money. Fights can start with a fist. Creatures are owned, traded, and repossessed. The police run a heat meter with your name on it. The loan shark is patient until he isn't.

**Core identity pillars:**
- No gyms. No badges. No free healing.
- Trainer + creature dual combat (you throw hands alongside your monsters).
- Real economy: property, debt, foreclosure, loan sharks, banking fees.
- Consequences: arrest, fines, repossession, towed cars.
- Brutalist aesthetic — red, black, monospace, grain. No soft pastel cheer.

**Working title history:** earlier names ("JUMPMON: URBAN LEGACY," "Street Level") were rejected as racially coded. "FEDMON: NO MERCY" was chosen to evoke the arrest/jurisdiction/heat themes without encoding race.

---

## This repository

This repo holds the **promotional landing page** — a static site for GitHub Pages — plus the community and configuration files around it. The game itself (Godot 4 source) is not in this repo (yet).

### Promo page
- **Stack:** vanilla HTML + CSS + JS. No framework, no build step, no dependencies.
- **Composition:** fixed left rail HUD + 6 vertical scroll-snap sections.
- **Sections:** boot → combat → mechanics → starters → economy → drop.
- **Signature feature:** an interactive canvas combat HUD (playable slice, not a video).
- **Files:** `index.html`, `style.css`, `script.js` in the `fedmon/` directory.

### Community & config
- Issue/PR templates in `.github/`
- CI workflows in `.github/workflows/` (lint, link-check, Pages deploy, CodeQL, etc.)
- Docs: README, CONTRIBUTING, CODE_OF_CONDUCT, ROADMAP, ADR, SECURITY, FAQ, and more
- Agent guidance: `CLAUDE.md`, `AGENTS.md`

---

## Status

| Area | Status |
|------|--------|
| Promo page v2 (new composition) | ✅ Shipped |
| Repo structure & templates | ✅ Done |
| CI workflows | ✅ Configured |
| Open Graph / social image | 📋 Planned |
| Game pre-alpha | 🚧 In progress (separate) |

See [ROADMAP.md](ROADMAP.md) for the full plan.

---

## Quick links

- **Live page:** see [DEPLOYMENT.md](DEPLOYMENT.md) or the repo's Pages URL
- **Contribute:** [CONTRIBUTING.md](CONTRIBUTING.md)
- **Design decisions:** [ADR.md](ADR.md)
- **Get help:** [SUPPORT.md](SUPPORT.md)
- **FAQ:** [FAQ.md](FAQ.md)

---

*No gyms. No badges. No mercy.*
