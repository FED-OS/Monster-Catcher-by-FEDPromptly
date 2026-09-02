# Support

How to get help with FEDMON: NO MERCY — the repo, the promo page, and (eventually) the game.

---

## Before you ask

1. **Check the [FAQ](FAQ.md)** — common questions are answered there.
2. **Search existing [issues](../../issues) and [discussions](../../discussions)** — someone may have already asked.
3. **Read the [README](README.md)** and [INSTALL.md](INSTALL.md) — the page is simple; most "it doesn't work" answers are there.

---

## Where to go

| You want to… | Go to |
|--------------|-------|
| Report a bug on the promo page | [Open a bug report issue](../../issues/new?template=bug_report.md) |
| Suggest a feature or section | [Open a feature request](../../issues/new?template=feature_request.md) |
| Ask a question / discuss design | [Start a discussion](../../discussions) |
| Report a security vulnerability | See [SECURITY.md](SECURITY.md) — **do not open a public issue** |
| Report conduct violations | See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) — contact the maintainers privately |
| Contribute code/docs | See [CONTRIBUTING.md](CONTRIBUTING.md) |

---

## Promo page troubleshooting (quick)

| Symptom | First check |
|---------|-------------|
| Blank or broken page | DevTools console (F12) for JS errors. Usually a typo or a broken relative path. |
| Combat canvas is blank | Confirm `script.js` loaded (Network tab). Browser must support canvas. |
| No custom cursor | Touch device / coarse pointer — it's intentionally disabled. Use a mouse. |
| Scroll feels sticky | That's scroll-snap by design. Enable `prefers-reduced-motion` in your OS to soften it. |
| Mobile layout looks off | Confirm width ≤560px. The rail collapses and sections reflow at breakpoints. |
| Readouts not changing | JS may be blocked or errored. Check console. |
| Easter egg (F key) not working | Make sure focus is on the page (click somewhere first) and you're on the boot section. |

For anything else, open an issue with the **bug report** template filled out.

---

## Game support

The game (Godot 4 build) is in pre-alpha and not yet publicly distributed. When playtest builds go out, support channels and a known-issues list will be posted here.

For now, all "game" discussion happens in [Discussions](../../discussions) under the design/lore categories.

---

## Response times

This is an indie project maintained by a small team (currently one). Expect:
- **Issues:** triaged within a few days; resolution depends on complexity.
- **Discussions:** best-effort, community-helped.
- **Security reports:** acknowledged within 48 hours (see [SECURITY.md](SECURITY.md)).
- **Conduct reports:** handled promptly and confidentially.

There's no SLA. Patience is appreciated. Kindness is required.

---

## Don't open issues for

- ❤️ "I love this" messages — that's what the star button and Discussions are for.
- 🗨️ General chat — use Discussions.
- 🐛 Bugs in software we don't own (Godot, your browser, GitHub) — report to them.
- 💼 Business/partnership inquiries — contact the maintainer directly.
- 🔒 Security issues — use [SECURITY.md](SECURITY.md), not a public issue.

---

## Supporting us back

<a href='https://ko-fi.com/fedjumpergaming' target='_blank'>
    <img height='36' style='border:0px;height:36px;' src='https://ko-fi.com/img/githubbutton_sm.svg' border='0' alt='Buy Me a Coffee at ko-fi.com' />
</a>

- Star the repo (free, helps visibility)
- Wishlist on Steam when live (free, helps a lot)
- Ko-fi tip (optional, feeds the dev)
- Tell a friend who likes grimy creature-collectors

---

*No mercy in the game. A little patience in the issues.*
