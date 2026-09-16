# BrainX productization — 2026-09-16

**Owner:** Moses Dor. **Trigger:** Moses pasted a strategic assessment + a
"master prompt for Codex" arguing BrainX (brainx.bizlegal-ai.com) fails on
productization, not price — the site shows a philosophy and a price list,
not a machine producing output. Followed by: "Goal set: fully functioning
ready to 1st $, website app product, with mesmorizing design. crash it."

## Ground truth (verified against `main` @ `6cf4b5b` before writing anything)

The pasted prompt assumed a working, styled site with real checkout,
authentication, and a Gmail pipeline to preserve. None of that existed:

| Assumed | Actual |
|---|---|
| Styled site | `app/globals.css` was 3 `@tailwind` lines with no postcss config — live CSS was 56 bytes of raw text |
| Working checkout | `/pricing` POSTed to a route that only existed on the hub → 404 |
| Two priced tiers | Only the $99/$999 SKU existed; the $249 button charged the $999 yearly SKU |
| Monthly subscription | Routed through PayPal Orders v2 → billed once, never again |
| Paying grants access | No grant helper, no users table; `/overview` etc. were public and in `sitemap.xml` |
| "24/7 scanning" | 5 FastAPI agents returned zeros; no LLM client existed; n8n workflows targeted an unhosted host |
| Evidence "12 sources" | `evidence_links`/`opportunities` = 0 rows; the only signals were 3 hand-seeded rows pointing at `google.com` |

## Decisions

1. **Truth before beauty.** Phase 0 fixed styling, checkout, SKUs, billing,
   grant, and access gating before any surface work.
2. **Engine v0 is operator-run**, not automated. A Claude Code session
   follows `agents/brainx/radar-run/SOP.md` and the five existing agent
   prompts; `apps/brainx/tools/ingest-radar.ts` validates and writes to
   Neon. Zero API cost. `services/highintelligence-api` stays PARKED.
   `packages/llm` is still an empty placeholder, so BUILD THIS brief
   generation is also a Claude Code session (`agents/brainx/build-this/
   prompt.md`), not a direct API call.
3. **Card billing = a real PayPal subscription** via the hub's legacy
   `/api/payments/paypal/start` (not the universal `/api/pay/start`, which
   only builds one-time PayPal Orders). Crypto = yearly-only via
   `/api/pay/start`; monthly + crypto is refused.
4. **Sample radar = 5 real, hand-researched opportunities**, evidence
   gathered via live web research on 2026-09-16 and verified to resolve
   (curl 200) before shipping — see `apps/brainx/lib/fixtures/sample.ts`
   and its header comment for the sourcing discipline.
5. **Score = the real 7-dimension `@bizlegal/scoring` engine**, not an
   invented list — rendered with its actual weights, never hard-coded in
   copy.
6. **Tiers renamed and re-scoped**: Radar ($99/mo, $999/yr) and Radar +
   Build ($249/mo, $2,499/yr — new SKUs). Killed: "Gmail digest" (replaced
   by a real `@bizlegal/email` weekly send), "custom verticals up to 5"
   (schema CHECK forbids; replaced by "5 radar profiles"), "practice-revenue
   cross-scan" (nothing implemented it), unlimited human review (replaced by
   a capped, async, written review — never a call, per the introvert-founder
   rule).

## What shipped (this pass)

- Money: 2 new SKUs (`brainx_radar_build_{monthly,yearly}`), hub
  `price-map.ts` entry, `apps/hub/lib/payments/brainx-grant.ts` wired into
  both hub webhooks (activate/renew/past-due/cancel/refund), BrainX
  `/api/checkout/start` + `/api/fulfillment` + `/api/access/request`.
- Access: migration `002_brainx_subscribers.sql` (subscribers,
  subscription_events, radar_profiles, access_link_requests, products
  columns), `lib/access.ts` (cookie-gated, `active_until`-based), `/enter`
  token exchange, `/access` lost-link page.
- Surface: dark "instrument" design (`theme-v2.css` on `@bizlegal/themes`
  royal-dark), real homepage/pricing/sample radar/guides, gated `/radar`
  dashboard (list, detail, briefs, profiles), BUILD THIS request→brief loop
  with monthly metering.
- Hygiene: 4 new/updated `CLAUDE.md` files, 2 new READMEs, root `CLAUDE.md`
  one-liners, this doc, order O-029.

## Not done in this pass (left for the Moses-ops queue)

Migration not yet applied to production Neon; no PayPal plan ids created;
no Vercel project; not deployed; no first radar run executed; no real test
purchase. See `apps/brainx/CLAUDE.md` §Moses ops for the exact commands.
