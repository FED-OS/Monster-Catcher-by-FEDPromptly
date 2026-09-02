# prompts/

Reusable prompts for AI agents and assistants working on FEDMON: NO MERCY.

These are reference prompts — copy them into your tool of choice (Claude, Codex, Copilot Chat, Cursor, etc.) when you want consistent, constraint-aware output for this project.

Always pair these with the guidance in [`CLAUDE.md`](../CLAUDE.md) and [`AGENTS.md`](../AGENTS.md) — the constraints there are binding.

---

## Available prompts

### `page-fix.md`
Use when fixing a bug in the promo page. Keeps the fix scoped, vanilla-only, and verified in a browser.

### `page-section.md`
Use when proposing a **new section** or a **structural change**. Enforces the no-reused-layout rule (ADR-007) and the issue-first workflow.

### `docs-update.md`
Use when updating markdown docs. Keeps formatting, cross-links, and the brutalist tone consistent.

### `ci-workflow.md`
Use when adding or editing a GitHub Actions workflow. Enforces least-privilege tokens, pinned actions, and no secrets.

### `review-pr.md`
Use when reviewing a PR. Enforces the project's review checklist and non-negotiables.

---

## How to use

1. Open the relevant prompt file in this directory.
2. Copy its contents into your AI assistant.
3. Append your specific task at the end.
4. Review the output against [CONTRIBUTING.md](../CONTRIBUTING.md) before committing.

---

*Prompts are tools, not autopilots. You still verify in a browser.*
