# Security Policy

## Supported versions

This is a static marketing site (no backend, no user data, no auth). Security concerns are limited but still taken seriously.

| Version | Supported | Notes |
|---------|-----------|-------|
| Latest `main` | ✅ | Active development |
| Tagged releases | ✅ | Per release notes |
| Older v1 layout | ❌ | Superseded — no patches |

## Reporting a vulnerability

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, report privately:

1. **Preferred:** use GitHub's [private vulnerability reporting](../../security/advisories/new) (Security tab → "Report a vulnerability").
2. **Alternative:** email the maintainer at **fedjumpergaming@gmail.com** with the subject `FEDMON SECURITY`.

Please include:
- Description of the issue and its impact
- Steps to reproduce or a proof of concept
- Affected file(s) / URL(s)
- Suggested fix (optional)

You'll receive an acknowledgment within **48 hours**, and we'll coordinate a fix and disclosure timeline with you.

## Scope

### In scope
- XSS vectors in the promo page (HTML/CSS/JS)
- Secrets or credentials accidentally committed to the repo
- Supply-chain concerns in CI workflows or dependencies (though we have no runtime dependencies)
- Broken access controls in GitHub Actions workflows or repo settings
- Anything that could harm visitors or the project's integrity

### Out of scope
- The game itself (Godot 4 build) — handled separately when distributed
- Vulnerabilities in third-party services we merely link to (Ko-fi, GitHub, Steam)
- "Bugs" that are intentional design (e.g. the F-key glitch easter egg is *supposed* to look broken)
- Reports from automated scanners without a real exploit path

## Our commitments

- We will **acknowledge** your report within 48 hours.
- We will **investigate** and keep you informed of progress.
- We will **credit** you in the fix advisory unless you prefer to remain anonymous.
- We will **not** take legal action against good-faith reporters.

## Disclosure

Once a fix is ready and deployed, we'll publish a GitHub Security Advisory describing the issue (crediting the reporter if desired) and update [CHANGELOG.md](CHANGELOG.md). We aim for coordinated disclosure within 90 days of the report, sooner if low-risk.

## Hardening notes (already in place)

- No runtime dependencies → no dependency CVE surface.
- No external core assets → no CDN/supply-chain risk for page rendering.
- CI uses only the auto-provided `GITHUB_TOKEN` with least-privilege permissions.
- `.gitignore` excludes common secret file patterns.
- No user input is persisted (the page has no forms or backend yet).

When forms/backends are added (e.g. wishlist capture), this policy will be updated with the new surface area.

---

*The game has loan sharks. The repo doesn't have to.*
