# Build

**Good news: there is no build step.**

FEDMON: NO MERCY's promo page is hand-written HTML, CSS, and vanilla JavaScript. There is no compiler, bundler, transpiler, or package manager. You edit files and refresh the browser.

This was an intentional decision — see [ADR-001](ADR.md#adr-001--vanilla-htmlcssjs-no-framework-or-build-step).

---

## What "building" means here

| Task | Command |
|------|---------|
| Serve locally | `cd fedmon && python3 -m http.server 8765` |
| Check CSS braces | `python3 -c "s=open('fedmon/style.css').read(); print(s.count('{'), s.count('}'))"` |
| Check JS braces | `python3 -c "s=open('fedmon/script.js').read(); print(s.count('{'), s.count('}'))"` |
| Validate HTML (optional) | `python3 -m pip install html5lib && python3 -c "import html5lib; html5lib.parse(open('fedmon/index.html').read())"` |
| Check for secrets | `grep -rniE "(api[_-]?key\|token\|secret\|password)" fedmon/ --include="*.html" --include="*.css" --include="*.js"` |

There is no `npm install`, no `npm run build`, no `dist/` folder. The source is the output.

---

## CI (runs on GitHub Actions, not locally)

The workflows in [`.github/workflows/`](.github/workflows/) handle automated checks on push/PR:
- `ci.yml` — lints JS syntax, checks brace balance, validates HTML structure
- `pages.yml` — builds (uploads) and deploys to GitHub Pages
- `codeql.yml` — security analysis
- See [DEPLOYMENT.md](DEPLOYMENT.md) for deploy specifics

You don't need to run these locally. They exist to guard the default branch.

---

## If you really want a local linter

Optional, not required:

```bash
# JS syntax check (requires node)
node --check fedmon/script.js

# CSS lint (optional, requires npm)
npx stylelint "fedmon/*.css"  # only if you've set up stylelint config
```

Neither is needed to ship. The CI workflows cover the essentials.

---

## Asset pipeline

There is none. Assets are either:
- **Inline** — the SVG grain is a data URI in `style.css`.
- **Canvas/CSS-drawn** — sprites in the combat HUD and starter dossier are drawn in code.
- **Reserved** — `fedmon/assets/` exists for future static images (e.g. `social-image.png`).

If you add a static image, drop it in `assets/` and reference it with a relative path (`assets/foo.png`). No optimization step is wired up — keep images small.
