# Build Session Handoff — Coverage/Autopilot (2026-09-15, resumed 4: HUB LIVE)

## THIS IS A MAJOR MILESTONE
- Hub deployed to production and aliased to https://bizlegal-ai.com (`readyState: READY`, target production).
- New SKUs (cp_solo_49, cp_firm_149, cp_setup_490, sf_firm_49, sf_lifetime_329, sf_pack_us_19, sf_pack_both_29) are live in the hub payment/price-map registry.
- Fixed two syntax blockers that had caused Vercel remote builds to fail:
  - packages/payment/src/products.ts premature closing brace
  - apps/hub/lib/payments/price-map.ts premature closing brace
- `pnpm turbo typecheck` 27/27 green.

## This turn also
- O-027 LIVE: Supabase live reads (442 queued), digest sent via Telegram.
- LangGap baseline generated.

## Remaining to 1st SALE
1. New product apps (casepage/sincefiled) standalone Vercel deploy failed: npm install (not pnpm) — needs monorepo/root build config and workspace deps. The hub is live, so checkout works via hub.
2. O-027 live Resend still 403 (Telegram works).
3. O-028 weekly cron/Phase B not authorized.

## Next step
- Decide whether to use hub-based checkout surface as the first-sale page (no new app deploy needed) or wire the new app deploys properly.
