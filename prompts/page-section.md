# Prompt: Propose a new section or structural change

You are proposing a **new section** or a **structural change** to the FEDMON: NO MERCY promo page (vanilla HTML/CSS/JS in the `fedmon/` directory).

## Critical rule (ADR-007)
**No restyled clones of prior layouts.** Any visual change must alter the *structure*, not just restyle. Document the composition change explicitly. If your idea is "the same layout with different colors/fonts," stop — it will be rejected.

## Binding constraints
- Read `CLAUDE.md` and `AGENTS.md`.
- **Vanilla only.** No frameworks, build steps, or CDN core assets.
- **No external core assets.** Inline SVG / canvas / CSS / system fonts only.
- **Respect the composition model:** fixed left rail HUD + vertical scroll-snap of full-viewport sections. A new section must fit this model (or justify breaking it).
- **Aesthetic:** brutalist, red/black/monospace, grain, no soft pastel cheer.
- **Accessibility:** `prefers-reduced-motion`, coarse-pointer cursor disabling, responsive at 900px/560px.
- **No racially coded content.** (ADR-005)
- **Adult themes stay in-fiction.**

## Workflow (required)
This is a STRUCTURAL change. Per CONTRIBUTING.md:
1. **Do not open a PR cold.** First, produce a proposal for an issue/discussion.
2. The proposal must include: rationale, structural description, which existing section (if any) it relates to, and why it's not a restyle.
3. Get lead-maintainer sign-off before implementing.

## Your task — produce a PROPOSAL (not code yet)
1. Describe the new section/change in 3–5 sentences.
2. Explain what's structurally NEW (vs. reusing an existing layout pattern).
3. Specify where it fits in the section order (boot, combat, mech, starters, econ, drop).
4. List the files that would change and the rough scope of each.
5. Note any new interactive behavior (canvas, scroll-snap, observer, easter egg).
6. Call out accessibility and responsive considerations.
7. Identify risks / trade-offs.

## Output format
- **Proposal title**
- **Rationale** (why this, why now)
- **What's structurally new** (the anti-restyle justification)
- **Placement** (section order position)
- **Files & scope**
- **Interactivity**
- **Accessibility & responsive**
- **Risks / trade-offs**
- **Open questions for the maintainer**

Append your specific idea below this line:
