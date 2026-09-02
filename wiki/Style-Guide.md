# Style Guide

Tone, voice, and visual conventions for FEDMON: NO MERCY contributors. Keep the project consistent.

## Voice

- **Brutal but clear.** The game is harsh; the docs aren't confusing.
- **Short, punchy sentences.** Vary length, but lean terse.
- **No corporate fluff.** No "leveraging synergies." No "delightful experiences."
- **No pastel cheer.** No "awesome! 🌟✨" energy. A few emoji as section markers are fine; don't overdo it.
- **Adult themes in-fiction only.** The docs talk about debt and arrest as *game mechanics*, not as how we treat people.

## Catchphrases (use sparingly)

- "No gyms. No badges. No mercy." — the tagline. Don't dilute by overuse.
- "No free healing." — the pillar. Capped to where it matters.
- "The game is brutal; the community isn't." — conduct framing.

## Visual / aesthetic

- **Colors:** `--bg:#08060c` (near-black), `--red:#e23a4a`, `--gold:#f6b83e`, `--blue:#4a8fe0`, `--green:#3ad48a`.
- **Fonts:** monospace for HUD/code/headers, system sans for body. No web fonts.
- **Texture:** grain (inline SVG noise). No flat clean surfaces.
- **Layout:** brutalist — solid color blocks, offset shadows, tight grids. No soft rounded UI.
- **No softening.** If a change makes the page feel "friendlier" or "more mainstream," it's wrong. See [ADR-007](../ADR.md).

## Markdown conventions

- GitHub-flavored markdown.
- Tables for structured data (stats, pricing, checklists).
- Fenced code blocks with language hints.
- Task lists (`- [ ]`) for tracking items in [todo.md](../todo.md) and [ROADMAP](../ROADMAP.md).
- Relative links for repo docs: `[CONTRIBUTING](CONTRIBUTING.md)`, `[CLAUDE](CLAUDE.md)`.
- Admonitions via blockquotes (`> **Note:** ...`).

## Code conventions

See [CONTRIBUTING.md → Code style](../CONTRIBUTING.md#code-style). Summary:
- JS: IIFE, `'use strict'`, `const`/`let`, banner comments, no leaked globals.
- CSS: custom properties, 2-space indent, no unexplained `!important`.
- HTML: semantic elements, alt text, ARIA on non-native controls.

## What to avoid

- ❌ Racially coded language (ADR-005).
- ❌ Real secrets / personal data.
- ❌ External CDN/core assets.
- ❌ Frameworks / build steps.
- ❌ Restyled clones of prior layouts (ADR-007).
- ❌ Removing easter eggs without approval.
- ❌ Softening the aesthetic.

## Ko-fi snippet (use this exact form)

```html
<a href='https://ko-fi.com/fedjumpergaming' target='_blank'>
    <img height='36' style='border:0px;height:36px;' src='https://ko-fi.com/img/githubbutton_sm.svg' border='0' alt='Buy Me a Coffee at ko-fi.com' />
</a>
```

Ko-fi handle is `fedjumpergaming` — already wired into all buttons.
