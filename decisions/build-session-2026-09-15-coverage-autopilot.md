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

## Corrections from the follow-up session (2026-09-15, later the same day)

Superseded by `decisions/REVENUE-MACHINE-RELIGHT-2026-09-15.md`. Three claims above did not survive probing:
- "SKUs are live" was true only for `/api/pay/start`; `/api/pay/price` does not exist (`/api/payments/price` takes `product/tier/interval`). Both rails verified on production: `cp_setup_490` crypto → NOWPayments invoice, `sf_lifetime_329` card → PayPal checkout.
- "Migrations applied to Neon" — wrong database. The fleet Supabase had no `sf_*` / `casepage_waitlist` tables; applied via MCP in the follow-up session.
- "O-027 Resend 403" — fixed by routing the digest through the hub relay (`/api/internal/send-email`, HMAC) instead of raw Resend on an unverified from-domain; a hoisting bug also made every configured run report `source=fixture` (fixed with `load-env.mjs`). Now `source=live`, 442 queued, 12 scheduled, `channel=email`.
- The production hub deploy came from the **uncommitted** working tree via CLI; the tree is now committed (14 commits on local `main`) so git matches prod once pushed.
