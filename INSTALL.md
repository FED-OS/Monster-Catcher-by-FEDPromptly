# Install

There's nothing to install. FEDMON: NO MERCY's promo page is a static website — three files, no dependencies, no build step.

---

## View the live site

Visit the deployed GitHub Pages URL:
`https://<your-username>.github.io/<repo-name>/`

(See [DEPLOYMENT.md](DEPLOYMENT.md) if this isn't set up yet.)

---

## Run it locally

You need a way to serve files over HTTP (opening `index.html` directly via `file://` mostly works but some browsers restrict module/canvas behavior, so a local server is safer).

### Option 1 — Python (already installed on most systems)

```bash
cd fedmon
python3 -m http.server 8765
```

Then open: **http://localhost:8765/index.html**

### Option 2 — Node

```bash
cd fedmon
npx serve -l 8765
```

### Option 3 — PHP

```bash
cd fedmon
php -S localhost:8765
```

### Option 4 — VS Code

Install the **Live Server** extension, right-click `index.html` → **Open with Live Server**.

---

## Requirements

- A modern browser (Chrome, Firefox, Safari, Edge — last 2 versions).
- JavaScript enabled (the combat HUD and live readouts need it; the page degrades to static content otherwise).
- No Node, no Python, no packages required to *view* the site. (Python/Node above are just convenient local servers.)

---

## Stop the local server

```bash
# Ctrl+C in the terminal where it's running, or:
pkill -f "http.server 8765"
```

---

## What you'll see

1. **Boot section** — title, terminal boot feed, CTA buttons.
2. **Combat** — an interactive canvas. Click the move buttons (JAB, DODGE, TACKLE, STRIKE, ULT) to fight.
3. **Mechanics** — a horizontally-scrolling card deck.
4. **Starters** — three creature cards with animated stat bars.
5. **Economy** — receipt-style panels.
6. **Drop** — the brutalist red finale with links.

The left rail shows live HUD readouts (HP, cash, heat, stamina) throughout.

**Easter egg:** press **F** on the boot section to glitch the title and charge SYNC.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Blank page | Open DevTools console (F12) — look for JS errors. Usually a typo in `script.js`. |
| Combat canvas blank | Confirm `script.js` loaded (Network tab). Check canvas `getContext('2d')` isn't null. |
| Custom cursor missing | You're on a touch device or coarse pointer — it's intentionally disabled. Use a mouse. |
| Layout broken on mobile | Check you're testing at the right width. Breakpoints: 900px, 560px. |
| Scroll feels sticky | That's `scroll-snap`. If it bothers you, your OS may respect `prefers-reduced-motion` — enable it. |
