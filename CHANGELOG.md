# Changelog

All notable changes to FEDMON: NO MERCY (promo page + repo) are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Dates are YYYY-MM-DD.

---

## [Unreleased]

### Added
- Community & governance docs: README (expanded), CONTRIBUTING, CODE_OF_CONDUCT, GOVERNANCE, SUPPORT, FAQ, CHANGELOG, NOTICE, PRICING, COPYING, CITATIONS, ROADMAP, ADR, SUMMARY, DEPLOYMENT, BUILD, INSTALL, usage
- AI-agent guidance: CLAUDE.md, AGENTS.md
- Contributor rosters: AUTHORS.md, MAINTAINERS.md
- GitHub issue templates: bug_report, feature_request, custom
- GitHub PR template + discussion welcome post
- GitHub Actions workflows: ci, pages (deploy), codeql, build, test, cd, release, publish, pr, stale, labeler, greetings, main, dependency-review, scorecards
- Root-level .gitignore, LICENSE, SECURITY.md, styles.css (auxiliary)
- `prompts/`, `wiki/`, `discussion/` directories
- Ko-fi support button integration in community docs
- Root duplicate templates: PULL_REQUEST_TEMPLATE.md, bug_report.md, feature_request.md

---

## [2.0.0] — 2026-01-02

### Added
- **Completely new page composition** (replaces v1 layout — see ADR-007)
- Fixed left rail HUD with live-updating readouts (HP, CASH, HEAT, STAMINA, scroll progress)
- Vertical scroll-snap layout with 6 full-viewport sections: boot, combat, mech, starters, econ, drop
- Interactive canvas combat HUD: pixel sprites, animated health bars, SYNC meter, floating damage numbers, sparks with gravity, screen shake, enemy counter-attacks, rematch logic, ULT gated on full SYNC
- Horizontal scroll-snap mechanics card deck (6 cards with meter bars)
- Three-column starter dossier (EMBERHOUND, VOLTHEDGE, SLICKLIZ) with animated stat bars and evolution chains
- Receipt-style economy terminal panels (DAILY BURN, DEBT PROTOCOL)
- Brutalist solid-red finale (DROP) section with offset-shadow buttons
- Custom CSS cursor (dot + lerp-following ring, hot-state, mix-blend-mode: screen, disabled on touch)
- Inline SVG fractal grain overlay with grainShift animation (no external assets)
- IntersectionObserver scroll reveals + stat-bar fill animations
- F-key glitch easter egg (title skew/hue-rotate + SYNC charge)
- Styled console easter egg (%c logs)
- prefers-reduced-motion accessibility support
- Responsive breakpoints at 900px and 560px

### Removed
- v1 layout (hero-on-top + pills + split grid + lore banner + economy tiles + CTA + footer) — superseded

---

## [1.0.0] — 2026-01-01

### Added
- Initial promo page (later superseded by v2 — see ADR-007)
- Canvas cursor trail + particle effects + CRT scanlines
- Hero + features + economy + CTA composition
- README.md, .gitattributes
- First deployment

[Unreleased]: https://github.com/FED-OS/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/FED-OS/releases/tag/v2.0.0
[1.0.0]: https://github.com/FED-OS/releases/tag/v1.0.0
