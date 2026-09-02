# Prompt: Review a PR for FEDMON: NO MERCY

You are reviewing a pull request against the FEDMON: NO MERCY repository.

## Binding constraints (reject if violated)
- Read `CLAUDE.md`, `AGENTS.md`, and `CONTRIBUTING.md`.
- **Vanilla only.** Reject frameworks, npm, build steps, CDN core assets.
- **No external core assets.** Grain must stay inline SVG; sprites canvas/CSS; fonts system stack.
- **No reused layouts (ADR-007).** If the PR is a visual change, does it alter *structure*, or just restyle? Restyled clones → request changes / close.
- **No secrets.** Scan the diff for keys, tokens, emails, personal data.
- **Accessibility:** `prefers-reduced-motion` honored? Custom cursor disabled on coarse pointers? Responsive at 900px/560px? ARIA on non-native interactive elements?
- **No racially coded content.** (ADR-005)
- **Adult themes in-fiction only.** Nothing bleeding into contributor-facing tone.
- **Easter eggs preserved** unless the PR explicitly removes one with rationale.
- **Aesthetic not softened.** No pastel/soft rewrites.

## Review checklist
- [ ] PR template filled out (type, testing, checklist)
- [ ] Linked to an issue/discussion if structural
- [ ] No secrets in diff
- [ ] No new dependencies / build step
- [ ] No external core assets
- [ ] If visual: structural change documented (not a restyle)
- [ ] JS wrapped in IIFE, no new globals, `const`/`let` only
- [ ] CSS uses custom properties, no unexplained `!important`
- [ ] HTML semantic, alt text present, ARIA where needed
- [ ] `prefers-reduced-motion` respected for any new animation
- [ ] Tested locally (browser, no console errors)
- [ ] Responsive at 900px and 560px
- [ ] Brace balance intact (CSS `{`==`}`, JS `{`==`}`)
- [ ] Commit messages imperative, reference issues
- [ ] Docs updated if behavior changed

## Quick verification commands
```bash
# brace balance
python3 -c "s=open('fedmon/style.css').read(); print('css', s.count('{'), s.count('}'))"
python3 -c "s=open('fedmon/script.js').read(); print('js', s.count('{'), s.count('}'))"
# secret scan
grep -rniE "(api[_-]?key|token|secret|password|BEGIN.*PRIVATE KEY)" fedmon/ --include="*.html" --include="*.css" --include="*.js" --include="*.yml"
# serve + check
cd fedmon && python3 -m http.server 8765
```

## Output format
- **Verdict:** Approve / Request changes / Reject
- **Constraint violations** (if any) — list each with the rule it breaks
- **Checklist results** — pass/fail per item
- **Nitpicks** (optional, non-blocking)
- **Required changes before merge** (numbered, specific)

Append the PR details/diff below this line:
