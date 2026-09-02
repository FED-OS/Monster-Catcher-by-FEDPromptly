# Prompt: Update markdown docs

You are updating markdown documentation in the FEDMON: NO MERCY repository.

## Binding constraints
- Read `CLAUDE.md` and `AGENTS.md`.
- **Keep cross-links valid.** Docs link to each other (README → CONTRIBUTING → CODE_OF_CONDUCT, etc.). If you rename or move a file, update every inbound link. Use relative paths (`CONTRIBUTING.md`, `../CLAUDE.md`, `.github/ISSUE_TEMPLATE/bug_report.md`).
- **Keep the tone consistent:** brutalist but professional. The game is harsh; the docs are clear. No pastel cheer, no corporate fluff, no emoji spam. A few emoji as section markers are fine (existing docs use them sparingly).
- **Use GitHub-flavored Markdown.** Tables, task lists, fenced code, and admonitions via blockquotes are all fine.
- **No secrets.** Never include real API keys, emails (use `fedjumpergaming@gmail.com` placeholder), or personal data.
- **Don't soften the aesthetic language** — "brutal," "no free healing," "no mercy" are intentional.
- **Don't introduce racially coded language.** (ADR-005)
- **Keep the Ko-fi button snippet consistent** where support is mentioned:
  ```html
  <a href='https://ko-fi.com/fedjumpergaming' target='_blank'>
      <img height='36' style='border:0px;height:36px;' src='https://ko-fi.com/img/githubbutton_sm.svg' border='0' alt='Buy Me a Coffee at ko-fi.com' />
  </a>
  ```
- **Version/date references:** if you mention a version, update [CHANGELOG.md](../CHANGELOG.md) too. If you mention a roadmap item, keep [ROADMAP.md](../ROADMAP.md) in sync.

## Your task
1. Identify which doc(s) need updating and why.
2. Make the edits with minimal disruption to surrounding content.
3. Verify all cross-links in the edited file still resolve (check the target file exists).
4. If you added/removed a file, update [SUMMARY.md](../SUMMARY.md) and the relevant index (README, CONTRIBUTING, etc.).
5. Run a quick link sanity check:
   ```bash
   grep -rEo '\]\([^)]+\)' fedmon/*.md | sort
   ```
   Eyeball that the referenced paths exist.

## Output format
- Files changed + one-line reason each
- Any cross-links updated (list old → new)
- Files that should be updated as a follow-up (don't edit them unless asked)

Append your specific doc task below this line:
