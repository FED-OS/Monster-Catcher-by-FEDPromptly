# Prompt: Add or edit a GitHub Actions workflow

You are adding or editing a workflow in `.github/workflows/` for the FEDMON: NO MERCY repository.

## Binding constraints
- Read `CLAUDE.md` and `AGENTS.md`.
- **Least privilege.** Use the `GITHUB_TOKEN` with minimal `permissions:`. Only request what the job needs (e.g. `pages: write` + `id-token: write` for Pages deploy; `contents: read` for lint).
- **Pin actions to a version.** Use `@v4`-style major tags at minimum; pin to a SHA for security-critical workflows if asked. Never use `@main`/`@master`/`@latest`.
- **No secrets in the workflow file.** Use repo/org secrets via `${{ secrets.NAME }}`. Never hardcode tokens.
- **No `pull_request_target`** on untrusted branches without careful review (it runs with write tokens on fork PRs — dangerous). Prefer `pull_request` for checks.
- **Conccurrency.** Add `concurrency:` groups to cancel superseded runs on the same branch/PR.
- **Keep it lean.** This is a static site with no build step. Don't add Node setup, npm install, or bundler steps unless a job genuinely needs them (e.g. a linter).
- **Don't fail the repo on a flaky third-party action.** Use `continue-on-error` for nice-to-have checks (e.g. scorecards, dependency review on forks) where appropriate.

## Standard workflow skeleton
```yaml
name: <Name>
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
jobs:
  <job>:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # ... job-specific steps
```

## Your task
1. State which workflow you're creating/editing and its purpose.
2. Write/modify the YAML using the skeleton above and the constraints.
3. Specify the exact `permissions:` block.
4. List the actions used and their pinned versions.
5. Note the trigger events and concurrency group.
6. Confirm no secrets are hardcoded.

## Output format
- Workflow filename
- Purpose (1–2 sentences)
- Full YAML
- Permissions block (called out)
- Actions + versions (called out)
- Triggers + concurrency
- Security notes

Append your specific workflow task below this line:
