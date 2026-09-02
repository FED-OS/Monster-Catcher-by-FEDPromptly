# Prompt: Fix a bug in the FEDMON promo page

You are fixing a bug in the FEDMON: NO MERCY promo page (a vanilla HTML/CSS/JS static site in the `fedmon/` directory of this repo).

## Binding constraints (read first)
- Read `CLAUDE.md` and `AGENTS.md` in the repo root.
- **Vanilla only.** No frameworks, no npm, no build step, no CDN core assets.
- **No external core assets.** Grain = inline SVG; sprites = canvas/CSS; fonts = system stack.
- **No secrets.** Never commit API keys, tokens, or personal data.
- **Respect accessibility.** `prefers-reduced-motion` must stay honored. Custom cursor stays disabled on coarse pointers.
- **Don't soften the aesthetic.** Red/black/monospace/grain is the point.
- **Don't delete easter eggs** (F-key glitch, console logs) unless the bug IS the easter egg.

## Bug context
- File(s) affected: <fill in>
- Section: <01 boot | 02 combat | 03 mech | 04 starters | 05 econ | 06 drop | rail | cursor | grain | other>
- Symptom: <describe what's wrong>
- Repro: <steps>
- Console errors (if any): <paste>

## Your task
1. Locate the root cause in the relevant file (`index.html`, `style.css`, or `script.js`).
2. Make the **minimal** change that fixes the bug without altering unrelated behavior or the page composition.
3. Do NOT refactor or restyle around the fix. Scope stays tight.
4. After editing, verify:
   - `cd fedmon && python3 -m http.server 8765` → open http://localhost:8765/index.html
   - The original repro no longer triggers the bug.
   - No new console errors (DevTools F12).
   - Layout still works at desktop, 900px, and 560px widths.
   - CSS and JS braces are still balanced.
5. Report: what the root cause was, what you changed (diff summary), and the verification steps you ran.

## Output format
- Summary of root cause (1–3 sentences)
- Files changed + brief diff description
- Verification results (what you opened, what you checked)
- Any follow-up issues noticed (do NOT fix them — just note them)

Append your specific bug details below this line:
