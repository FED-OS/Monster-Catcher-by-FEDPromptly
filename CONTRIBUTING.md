# Contributing to FEDMON: NO MERCY

Thanks for wanting to help. The project is small and indie — every contribution matters.

> **The game is brutal. The community is not.** Read the [Code of Conduct](CODE_OF_CONDUCT.md) first.

---

## Quick start

```bash
# 1. Fork & clone
git clone https://github.com/FED-OS.git
cd fedmon-no-mercy/fedmon

# 2. Serve locally
python3 -m http.server 8765
# open http://localhost:8765/index.html

# 3. Make your changes to index.html / style.css / script.js

# 4. Verify (no build step!)
#    - Page renders, no console errors (F12)
#    - Test desktop + 900px + 560px widths
#    - prefers-reduced-motion still respected

# 5. Commit & push, then open a PR using the template
```

No `npm install`. No build. No dependencies. You edit files, refresh the browser.

---

## What you can contribute

| Type | How |
|------|-----|
| 🐛 Bug fix (page) | Open an issue first if non-trivial; small fixes can go straight to PR |
| ✨ New section / interaction | **Open an issue or discussion first** — see "Structural changes" below |
| 🎨 Visual polish | Allowed, but see ADR-007 — no restyled clones of prior layouts |
| 📝 Docs | README, FAQ, ROADMAP, ADRs — PRs welcome |
| 🔧 CI / tooling | Workflows, templates, checks |
| ♿ Accessibility | Always welcome (ARIA, reduced-motion, keyboard nav) |
| 🌐 Localization | Not yet wired; discuss in Discussions first |
| 📖 Lore / design | Discussions, not PRs (creative direction is lead-maintainer-led) |

---

## The rules (read these)

These are enforced in review. Violating them will get a PR closed.

1. **Vanilla only.** No frameworks, no npm, no build step, no CDNs for core assets. (See [ADR-001](ADR.md), [ADR-002](ADR.md).)
2. **No reused layouts.** A visual redesign must change the *structure*, not just restyle. Document the composition change in your PR. Restyled clones of prior layouts are rejected. (See [ADR-007](ADR.md).)
3. **No external core assets.** Grain = inline SVG; sprites = canvas/CSS; fonts = system stack.
4. **No secrets.** Never commit API keys, tokens, personal data.
5. **Respect accessibility.** `prefers-reduced-motion` must be honored. Custom cursor disables on coarse pointers. Test responsive breakpoints (900px, 560px).
6. **No racially coded content.** In names, lore, locations, or discussion. (See [ADR-005](ADR.md).)
7. **Adult themes stay in-fiction.** They don't extend to how you treat people. (See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).)
8. **Don't delete easter eggs** (F-key glitch, console logs) without explicit approval.
9. **Don't soften the aesthetic.** Red/black/monospace/grain is the point. No pastel rewrites.
10. **Verify before you PR.** Open the page in a browser. Confirm no console errors. Don't claim "done" without checking.

---

## Structural changes (important)

If your change alters the page **composition** (adds/removes/reorders sections, changes the rail, restructures the combat HUD, changes the snap model):

1. **Open an issue or discussion first.** Don't open a structural PR cold.
2. **Get lead-maintainer sign-off** on the direction.
3. **In the PR, describe what's structurally new** — the PR template asks for this explicitly.
4. **Reference the relevant ADR** or propose a new one if it's a significant architectural shift.

This is non-negotiable. The maintainer has rejected restyled clones before; the policy exists to prevent that churn.

---

## Code style

It's vanilla, so style is light:

- **JS:** Wrap in an IIFE (`(function(){ 'use strict'; ... })();`). No globals leaking. Use `const`/`let`, not `var`. Comment sections with banner comments.
- **CSS:** Use CSS custom properties (`--var`) for colors/sizes. Mobile-first where practical. No `!important` without a comment explaining why.
- **HTML:** Semantic elements (`section`, `article`, `aside`, `nav`). Alt text on any images. ARIA where interactive elements aren't native controls.
- **Indentation:** 2 spaces. No tabs mixed with spaces.

You don't need a linter installed — CI handles syntax checks. Just write clean code.

---

## Commit messages

- Imperative subject: `Add arrest-mechanic card to mech deck`
- Reference issues in the body: `Closes #42` / `Refs #17`
- One logical change per commit
- No `@mentions` of maintainers in commit messages

---

## Pull request process

1. **Fill out the [PR template](.github/PULL_REQUEST_TEMPLATE.md)** completely.
2. **Self-review** your diff before requesting review.
3. **Be responsive** to feedback. Disagreements are fine; defensiveness isn't.
4. **Don't force-push** after review starts (it resets the conversation). Rebase cleanly instead.
5. **CI must pass.** If a check fails, fix it — don't disable the check.
6. A maintainer merges. You don't merge your own PR unless you're a maintainer on a routine change.

---

## Reporting bugs & features

Use the issue templates:
- 🐛 [Bug report](.github/ISSUE_TEMPLATE/bug_report.md)
- ✨ [Feature request](.github/ISSUE_TEMPLATE/feature_request.md)
- 📋 [Custom](.github/ISSUE_TEMPLATE/custom.md)

One issue = one bug or one feature. Search before opening.

---

## Security

**Do not open a public issue for security vulnerabilities.** See [SECURITY.md](SECURITY.md) for private reporting.

---

## Recognition

Contributors with merged PRs are listed in [AUTHORS.md](AUTHORS.md) (optional — opt in via your PR).

---

## Questions?

Open a [discussion](../../discussions). We're friendly (the game isn't).

<a href='https://ko-fi.com/fedjumpergaming' target='_blank'>
    <img height='36' style='border:0px;height:36px;' src='https://ko-fi.com/img/githubbutton_sm.svg' border='0' alt='Buy Me a Coffee at ko-fi.com' />
</a>

*No gyms. No badges. No mercy. But a little kindness in the PRs.*
