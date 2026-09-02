# Governance

How the FEDMON: NO MERCY project is run.

---

## Model

**Benevolent dictator for now, collaborative later.** The project currently has a single lead maintainer (see [MAINTAINERS.md](MAINTAINERS.md)) who has final say on direction. As the contributor base grows, governance can evolve toward a consensus or committee model — that decision is deferred until there are enough active maintainers to justify it.

---

## Roles

| Role | Who | What they do |
|------|-----|--------------|
| **Lead maintainer** | Project author | Final decisions, vision, aesthetic guardrails, merge authority |
| **Maintainers** | Trusted contributors | Triage, review, label, merge routine PRs (see MAINTAINERS.md) |
| **Contributors** | Anyone with merged PRs | Code, docs, design proposals via issues/PRs |
| **Community** | Everyone | Discussions, feedback, bug reports, feature requests |

---

## Decision making

### Small changes
Bug fixes, doc tweaks, copy edits, CI config — a maintainer reviews and merges. No ceremony.

### Structural / aesthetic changes
Anything that changes the page **composition**, the visual tone, or core game-design pillars requires:
1. An issue or discussion first (don't open a structural PR cold).
2. Lead maintainer sign-off.
3. A documented rationale in the PR (the [PR template](.github/PULL_REQUEST_TEMPLATE.md) enforces this).

See [ADR-007](ADR.md) — restyled clones of prior layouts are rejected by policy.

### Architecture decisions
Significant technical or design decisions are recorded as **ADRs** in [ADR.md](ADR.md). Anyone can propose one via PR; the lead accepts or rejects.

### Rule changes (governance, conduct)
Changes to this file, [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), or [CONTRIBUTING.md](CONTRIBUTING.md) require lead maintainer approval and are announced in Discussions.

---

## Non-negotiables

These aren't up for a vote — they're project identity:

1. **No free healing.** Core pillar.
2. **No racially coded naming/lore.** Rejected explicitly; see [ADR-005](ADR.md).
3. **No softening the aesthetic** for mass appeal.
4. **No microtransactions / loot boxes** mirroring the in-fiction loan sharks. See [PRICING.md](PRICING.md).
5. **No frameworks/build steps** for the promo page. See [ADR-001](ADR.md).
6. **Adult content stays in-fiction** — never in how people are treated. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

Proposals to change any of the above will be declined. Everything else is discussable.

---

## Conflict resolution

1. **Assume good faith.** Most disagreements are misunderstandings.
2. **Take it to Discussions, not PR threads.** Keep PRs about the code.
3. **Escalate to a maintainer** if it stalls.
4. **The lead maintainer breaks ties.**

Personal attacks, harassment, or discriminatory behavior are **not** a governance matter — they're a [Code of Conduct](CODE_OF_CONDUCT.md) matter and handled per that policy.

---

## Transparency

- All decisions of consequence are documented (ADRs, merged PRs, closed issues).
- Maintainer deliberation that isn't sensitive happens in public issues/PRs.
- Sensitive matters (security, conduct reports) are handled privately per [SECURITY.md](SECURITY.md) and the Conduct policy.

---

## Funding & money

The project accepts voluntary support via Ko-fi and future Steam sales. No contributor is obligated to pay or be paid. If the project ever generates revenue that could fund contributors, a transparent profit-share will be documented here. Until then: it's a labor of love. See [PRICING.md](PRICING.md).

---

## Changes to this document

Propose changes via PR. Significant governance changes are announced in Discussions before merging.
