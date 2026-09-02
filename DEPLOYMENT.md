# Deployment

How FEDMON: NO MERCY's promo page gets deployed. It's a static site — deployment is simple.

---

## Target: GitHub Pages

The promo page deploys to GitHub Pages from the repo. Two supported methods:

### Method A — Automatic via GitHub Actions (recommended)

The [`.github/workflows/pages.yml`](.github/workflows/pages.yml) workflow deploys on every push to the default branch (`main`).

**One-time setup:**
1. Repo → **Settings → Pages**.
2. **Build and deployment → Source:** select **GitHub Actions** (not "Deploy from a branch").
3. Push to `main`. The workflow uploads the `fedmon/` directory as the Pages artifact.

**URL:** `https://<your-username>.github.io/<repo-name>/` (or a custom domain if configured).

The workflow:
- Checks out the repo.
- Uploads `fedmon/` as a static Pages artifact.
- Deploys with the official `actions/deploy-pages` action.
- Runs on every push to `main` and can be triggered manually.

### Method B — Manual / branch-based

If you prefer not to use the Actions deploy:
1. Repo → **Settings → Pages**.
2. **Source:** Deploy from a branch.
3. **Branch:** `main` / root (or a dedicated `gh-pages` branch).
4. Save.

⚠️ Note: the page files live in the `fedmon/` subdirectory, not the repo root. For branch-based Pages, you'll need the files at the root or use the Actions method (which can target the subdirectory).

---

## Pre-deploy checklist

- [ ] `index.html`, `style.css`, `script.js` all present in `fedmon/`
- [ ] HTML has `<!DOCTYPE html>`, single `</html>`, single `</body>`
- [ ] CSS braces balanced (`{` count == `}` count)
- [ ] JS braces balanced and wrapped in IIFE
- [ ] No absolute paths — all asset/script references are relative
- [ ] No external CDN/asset URLs in core rendering
- [ ] No secrets, tokens, or personal data in any file
- [ ] Opened `index.html` locally — renders, no console errors
- [ ] Tested at desktop, 900px, and 560px widths
- [ ] `prefers-reduced-motion` respected

Run the brace check quickly:

```bash
python3 -c "s=open('fedmon/style.css').read(); print('css', s.count('{'), s.count('}'))"
python3 -c "s=open('fedmon/script.js').read(); print('js', s.count('{'), s.count('}'))"
```

---

## Local preview

```bash
cd fedmon
python3 -m http.server 8765
# open http://localhost:8765/index.html
```

Any static server works (`npx serve`, `php -S`, etc.). No build step.

---

## Custom domain (optional)

1. Repo → **Settings → Pages → Custom domain** → enter `yourdomain.com`.
2. Add a `CNAME` file in `fedmon/CNAME` containing the domain.
3. Configure DNS with your provider (A record or CNAME per GitHub's docs).
4. Enable **Enforce HTTPS**.

---

## Rollback

GitHub Pages keeps deployment history. To roll back:
- **Actions method:** re-run a previous successful workflow run, or revert the commit and push.
- **Branch method:** force-push the prior commit to the deploy branch.

---

## Environment variables / secrets

None required for the promo page. CI uses only the auto-provided `GITHUB_TOKEN` and Pages permissions. Never add real secrets to this repo — it's a public marketing site.
