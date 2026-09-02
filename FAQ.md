# FAQ

Frequently asked questions about FEDMON: NO MERCY.

---

## The game

### What is FEDMON: NO MERCY?
A gritty, adult-oriented monster-taming action RPG built in Godot 4. You raise creatures and fight — but the world doesn't coddle you. Healing costs money, fights can start with a fist, creatures get repossessed, the police track your heat, and the loan shark wants his money. No gyms. No badges. No free healing.

### Wait — "adult" how?
The *themes* are adult: debt, arrest, loan sharks, property ownership, violence, no safety nets. It's a creature-collector that treats the world like a hard place. It is not pornographic. Think "M-rated life-sim meets monster-taming," not anything else.

### Why "no free healing"?
It's a core identity pillar. In most creature-collectors, healing is free and infinite — it removes economic tension. In FEDMON, healing is a cost you have to budget for. It makes every fight a financial decision, not just a tactical one. This is non-negotiable by design (see [GOVERNANCE.md](GOVERNANCE.md) non-negotiables).

### Do I fight, or do my creatures fight?
Both. FEDMON has **dual combat**: your trainer can throw hands (fists, melee skills) alongside your creature. Trainer skills cost 2× and are permanent — no relearn, no take-backs. You can also counter theft attempts mid-battle with a fistfight.

### What are the starters?
Three:
- **EMBERHOUND** — fire / brute — high attack, glass cannon speed
- **VOLTHEDGE** — volt / guard — defensive wall
- **SLICKLIZ** — toxin / scout — fast, disruptive

Each has a 3-stage evolution chain, plus a 1-turn 4th form for starters that doubles the highest stat and halves the lowest.

### What's the deal with the loan shark?
You can borrow money — but interest compounds and the shark is patient until he isn't. It's a risk/reward pressure valve for when you're broke. Miss payments and consequences escalate. It's satire of predatory lending baked into the gameplay loop — **not** a metaphor for real-money microtransactions (see [PRICING.md](PRICING.md)).

### Can you actually get arrested?
Yes. Fight unprovoked too often and your heat meter trips an arrest. When arrested: cash halved, car towed, court fines double every offense. You can bank money in the PC to survive a bust.

### What engine?
Godot 4. The promo page (this repo) is vanilla HTML/CSS/JS and unrelated to the engine.

---

## The name

### Why "FEDMON"?
It evokes the game's arrest / jurisdiction / "the feds" / heat mechanics without encoding race. Earlier working titles ("URBAN LEGACY," "Street Level") were rejected as racially coded — see [ADR-005](ADR.md). "FEDMON" keeps the legal-system edge without that problem.

### Is it a Pokémon rip-off?
No. It's a creature-collector — a genre — reimagined for adults with consequences. The mechanics (dual combat, economy, arrest, property, no free healing) are distinct. We respect the genre; we're not copying any single game's assets or IP.

---

## This repository

### What's in this repo?
The **promo landing page** (vanilla HTML/CSS/JS for GitHub Pages) plus community and config files (templates, workflows, docs). The game's Godot source is **not** in this repo.

### Is there a build step?
No. It's three files: `index.html`, `style.css`, `script.js`. Open in a browser. Done. See [BUILD.md](BUILD.md).

### Do I need Node/npm?
No. To run locally, `python3 -m http.server` (or any static server) is enough. See [INSTALL.md](INSTALL.md).

### The combat section is interactive?
Yes — it's a real canvas HUD, not a video. Click the move buttons (JAB, DODGE, TACKLE, STRIKE, ULT) to fight the enemy creature. The enemy counters back. Fill SYNC to use ULT. There's a rematch when it ends.

### The readouts in the left rail are changing — is that a bug?
No, that's the point. The rail is a live HUD: HP wobbles, CASH counts up, HEAT spikes, STAMINA drifts. It's simulating an in-game status bar.

### I pressed F and the title went weird.
That's the easter egg. Press **F** on the boot section to glitch the title and charge SYNC. There's also a styled message in the DevTools console.

### The custom cursor doesn't show on my phone.
Correct — it's disabled on touch / coarse pointers by design. Use a mouse.

### Scroll feels sticky.
That's `scroll-snap` — intentional. If your OS has "reduce motion" enabled, the page softens it automatically.

---

## Contributing

### Can I contribute?
Yes — see [CONTRIBUTING.md](CONTRIBUTING.md). Bug fixes and docs are easy wins. Structural/aesthetic changes need an issue first.

### Why was my visual PR rejected?
Likely because it restyled an existing layout rather than changing the *structure*. That's a documented policy (ADR-007): no restyled clones. Open an issue to discuss the direction first.

### Can I add a framework / Tailwind / a build step?
No. It's a project constraint (ADR-001). Vanilla only.

---

## Money & support

### Is the game free?
No — it'll be a one-time paid purchase (~$14.99 standard, ~$24.99 supporter). No microtransactions, no loot boxes, no pay-to-win. See [PRICING.md](PRICING.md).

### Can I support development now?
Yes, voluntarily:
- Star the repo (free)
- Wishlist on Steam when live (free)
- Ko-fi tip (optional)

<a href='https://ko-fi.com/fedjumpergaming' target='_blank'>
    <img height='36' style='border:0px;height:36px;' src='https://ko-fi.com/img/githubbutton_sm.svg' border='0' alt='Buy Me a Coffee at ko-fi.com' />
</a>

None of these unlock game content.

---

## Safety

### I found a security issue.
**Do not open a public issue.** See [SECURITY.md](SECURITY.md) for private reporting.

### Someone's being a jerk in the community.
Report it per [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). The game is brutal; the community isn't — we enforce that.

---

*Question not answered here? Open a [discussion](../../discussions).*
