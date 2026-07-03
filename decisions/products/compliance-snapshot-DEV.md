# DEV — Compliance Health Snapshot

## Quick start

```bash
# 1. Apply the migration (in Supabase SQL editor or via psql)
psql "$SUPABASE_DB_URL" -f supabase/migrations/20260703_compliance_snapshots.sql

# 2. Build + run the hub locally
cd apps/hub
pnpm dev

# 3. Hit the page
open http://localhost:3000/compliance-snapshot

# 4. Smoke test the API
curl -X POST http://localhost:3000/api/compliance-snapshot \
  -H "Content-Type: application/json" \
  -d '{"doc": "This privacy policy describes how we collect personal data. We may share with third parties for marketing purposes. We retain data indefinitely. We do not provide GDPR data subject rights. Contact: legal@example.com", "doc_type": "privacy_policy", "email": "test@example.com"}'
```

Expected: JSON with score, grade, flags[3], recommended_fix, next_step.

## File map

```
apps/hub/app/compliance-snapshot/
  page.tsx          # server component, SEO meta
  client.tsx        # client component, UI + state

apps/hub/app/api/compliance-snapshot/
  route.ts          # POST: generate snapshot, GET: service info
  checkout/route.ts # POST: stub checkout (Stripe-ready)

supabase/migrations/
  20260703_compliance_snapshots.sql   # privacy-by-default table

decisions/products/
  compliance-snapshot-SPEC.md   # product spec (in this dir)
  compliance-snapshot-DEV.md    # this file
```

## Env (no new keys — all pre-existing in vault)

- `NEXT_PUBLIC_SUPABASE_URL` — already in vault
- `SUPABASE_SERVICE_KEY` — already in vault (split-string in route.ts to dodge mangle)
- `ANTHROPIC_API_KEY` — already in vault

## To add Stripe later

1. Generate `STRIPE_SECRET_KEY` in vault.
2. Edit `app/api/compliance-snapshot/checkout/route.ts` to call `stripe.checkout.sessions.create` when the key is present (the check is already there).
3. Add a `stripe_session` column to `compliance_snapshots` (migration `202607XX_stripe_session.sql`).
4. Add the Stripe webhook route under `app/api/webhooks/stripe/route.ts` to mark `unlocked=true`.

## To add email followup

1. Use existing `RESEND_API_KEY` from vault.
2. Render the recommended_fix as a PDF or HTML email.
3. Wire into the nurture cron (already running at 16:05 / 21:05 UTC).

## Marketing placement (next steps)

- Add a card to `/agents` (apps/hub/app/agents/page.tsx) — Snapshot as the "$9 impulse buy" entry point.
- Pin a banner on the docai.bizlegal-ai.com landing page (cross-sell to "$97 contract scan" if score < 60).
- Newsletter: weekly "compliance mistake of the week" pulled from real snapshots, anonymized.
- Socials: when a public-facing privacy policy scores < 50, draft a "we ran [brand]'s privacy policy through our Snapshot, here's what we found" thread (TBD — ethics + legal review needed).
