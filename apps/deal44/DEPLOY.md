# DEAL44 — go live

Everything below is one sitting. The code is committed (`e8ff8c6` on `feat/deal44-phase0`), the migrations are applied, 105 tests and the production build are green.

**Why you are running these and not the agent:** the session's harness blocked `git push`, the GitHub API (bad credentials) and Vercel project creation. Nothing about the code is waiting.

---

## 1 — Push and merge

```bash
cd "C:/Users/Moshe Dor/bizlegal-monorepo"
git push -u origin feat/deal44-phase0
gh pr create --fill --base main --head feat/deal44-phase0
gh pr merge --squash --admin
```

Straight to main if you prefer: `git checkout main && git merge feat/deal44-phase0 && git push`.

## 2 — Vercel project

New Project → import `aileadx10-boop/bizlegal-monorepo` → name it `deal44`.

**Root Directory = `apps/deal44`.** Leaving this unset is what broke leadforge for a month.

Framework Next.js. Build and install commands come from `apps/deal44/vercel.json`; leave the UI fields empty.

## 3 — Environment variables

Production scope. Values are in the vault at `C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt`.

| Name | Where it comes from |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | vault |
| `SUPABASE_SERVICE_KEY` | vault |
| `INTERNAL_API_SECRET` | vault |
| `CRON_SECRET` | vault |
| `BIZLEGAL_INBOUND_SECRET` | vault — must match the fleet or `/ops` rejects the events |
| `OPS_LOG_URL` | vault |
| `RESEND_API_KEY` | vault — read inside `@bizlegal/email`, not by app code |
| `RESEND_FROM`, `RESEND_REPLY_TO` | vault |
| `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | vault |
| `NEXT_PUBLIC_DEAL44_SITE_URL` | `https://deal44.bizlegal-ai.com` |
| `DEAL44_INTAKE_EMAIL` | where broker intakes land |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | optional; `deal44.bizlegal-ai.com` if you want traffic visible |
| **`DEAL44_TOKEN_KEY`** | **generate: `openssl rand -hex 32`** — append to the vault first |

`DEAL44_TOKEN_KEY` is not optional in practice. Without it the daily digest still sends, but with no link in it: the database holds only a hash of each party's token, and the cipher column is what lets the cron rebuild a link. Set it before the first room.

## 4 — DNS

Cloudflare: `CNAME deal44 → cname.vercel-dns.com`, proxy off. Add `deal44.bizlegal-ai.com` as a domain on the Vercel project.

## 5 — Verify the deploy actually happened

Curling the URL cannot tell "not deployed" from "deployed and broken". Use the deployments API — see `decisions/VERCEL-PUSH-NOT-DEPLOYING-2026-07-29.md`, where seven projects silently stopped deploying:

```bash
gh api repos/aileadx10-boop/bizlegal-monorepo/deployments --jq '.[0:3] | .[] | {sha, environment, created_at}'
```

Then:

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://deal44.bizlegal-ai.com/
curl -s -o /dev/null -w "%{http_code}\n" https://deal44.bizlegal-ai.com/en
curl -s https://deal44.bizlegal-ai.com/sitemap.xml | head -5
curl -s -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer $CRON_SECRET" \
  "https://deal44.bizlegal-ai.com/api/cron/alerts?dry=1"     # expect 200
curl -s -o /dev/null -w "%{http_code}\n" \
  "https://deal44.bizlegal-ai.com/api/cron/alerts?dry=1"      # expect 401
```

The dry run touches nothing. It is the honest check that the cron can read the database in production.

## 6 — First room

The browser room builder at `/admin` was deleted in B3 (2026-09-15): a public page whose only gate was a pasted `INTERNAL_API_SECRET` had no business on a live domain. Build the room with the API it called:

```bash
curl -X POST "https://deal44.bizlegal-ai.com/api/admin/rooms" \
  -H "Content-Type: application/json" -H "x-internal-secret: $INTERNAL_API_SECRET" \
  -d '{
    "title": "רחוב הרצל 12, תל אביב",
    "locale": "he-IL",
    "template_id": "il-residential",
    "anchors": {"signing": "2026-10-01", "closing": "2027-01-15"},
    "broker": {"role": "broker", "name": "…", "email": "…"},
    "parties": [{"role": "buyer", "name": "…", "email": "…"}]
  }'
```

- Israel: template `il-residential`, set the **sale date** (drives the two statutory declarations) and the delivery date.
- Elsewhere: `us-residential-purchase`, closing date only.
- Or leave `template_id` null for a fully manual room and type the contract's own dates in.
- `"send_invites": false` holds the links back so you can forward them yourself.

The links come back **once**. The database keeps only hashes, so copy them then.

## 7 — First payment

**Self-serve (B3).** `/start` and `/en/start` carry a currency picker: shekels go to crypto, dollars to card or crypto, both through the hub's `/api/pay/start`. On payment the hub's `deal44-grant.ts` creates the paid room (email only — no parties, no template, no dates) and stamps `paid_order_id` + `activated_at`, then pings Telegram. You finish that room from the buyer's written brief using section 6. Apply `supabase/migrations/20260915_deal44_paid_room.sql` first — it is the guard that stops a re-delivered IPN from producing two rooms for one payment.

**By hand.** Card and crypto are live for the USD SKUs. ILS runs on crypto — PayPal cannot receive shekels, so a shekel card sale is invoiced by hand and recorded as a manual order:

```sql
insert into payment_orders
  (user_email, product, amount_cents, currency, gateway, status, source, tier, billing_interval)
values
  ('<broker email>', 'deal44_room_setup_ils', 250000, 'ILS', 'manual', 'active',
   'manual_invoice', 'deal44', 'one-time')
returning id;
```

Then link it to the room, which stamps `activated_at` and fires `payment.confirmed`:

```bash
curl -X POST "https://deal44.bizlegal-ai.com/api/admin/rooms/<deal_id>/activate" \
  -H "Content-Type: application/json" -H "x-internal-secret: $INTERNAL_API_SECRET" \
  -d '{"order_id":"<uuid from above>"}'
```

**Only activated rooms get reminders.** A room with no linked order is a draft and the cron skips it.

## 8 — Prove the money path before selling

Do this with a `gateway='simulated'` row first, exactly as above but `'simulated'`, drive it to activation, confirm `payment.confirmed` on `/ops`, then delete the row. That proves the rail without moving money.

---

## Still open

- **US templates are `reviewed: false`** and every US room shows the draft banner. Nobody here is admitted in any US state. Israel is authored by you and carries no banner.
- **Israeli spam-law position on invites.** They send by default now. If you want them held, create rooms with `send_invites: false` and forward the links yourself.
- **The fleet-wide Supabase fetch-cache audit.** DEAL44 is fixed; LeaseParse, CoGuard, DocAI and the hub crons build a Supabase client inside a route handler the same way and were never checked. See invariant 11 in `CLAUDE.md`.
