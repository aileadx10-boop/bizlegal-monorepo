# Overnight session — 2026-07-30

Branch: **`fix/money-path-and-dealdesk`** (pushed, 2 commits, **not merged**). `main` untouched.

Nothing was deployed, no migration was applied, no email was sent, no money moved, and no cloud routine was armed. All four are deliberate — see "Not done, and why".

---

## 1. Found and fixed: `/api/pay/start` could take money and leave no record

The worst defect in the repo. Three faults compounding:

1. `/api/pay/start` never inserted a `payment_orders` row. Its gateway `order_id` came from `makeOrderId()` in `@bizlegal/payment` → `bz_<product>_<email>_<minute>_<nonce>`.
2. The NOWPayments webhook reconciles with `.eq('id', ipn.order_id)` against `payment_orders.id`, a **uuid**. A `bz_*` string can never match.
3. The webhook claimed the idempotency event **before** the order lookup, so the resulting 404 permanently burned the event and all ~25h of gateway retries deduped to a 200.

Net: customer pays → no order row → no entitlement → no receipt → no alert → unrecoverable.

**Fixed (commit `cb83dff`)**
- Webhook: `claimWebhookEvent` moved to **after** a successful order lookup.
- Webhook: order-not-found now returns **200** (ends the retry storm) *and* raises a loud alert — an ops `error` event plus a Telegram message — instead of a silent `console.warn` behind a 404.
- `/api/pay/start`: hard **503**, with the reconcilable path and the exact restoration steps documented inline.
- Rewrote the `propsignal`/`leaseparse`/`closeflow` docblocks that instructed a future agent to POST to that route.

The apex path (`/checkout` → `/api/payments/{nowpayments,paypal,wire}/start`) is untouched and remains the only reconcilable money path.

## 2. Built: `apps/dealdesk` (commit `a6d6810`)

One app, two hands, one login, one property record — so cross-sell is a DB join, not a cross-domain hop.

Ported **verbatim**, not rewritten (~380 lines of already-correct logic): the CloseFlow business-day/deadline engine and 44-task checklist templates across 4 transaction types, and the DocParse `LeaseAbstract` contract, 90/60/30/7 date engine with notice windows, extraction prompt, and deterministic `scoreConfidence`.

Migrations `20260730_dealdesk_{properties,leases,transactions}.sql` with a `dd_` prefix supersede the three unapplied `20260728` trio migrations. Renaming was free — verified against the live project that none of those tables exist. `propsignal_reports` is **parked, not deleted**. `user_id` stays nullable with an `email` fallback so anonymous checkout works before an account exists.

**Verified:** `dealdesk` tsc clean + `next build` green (4 routes); `hub` and `lexaudit` tsc still clean after the `ops-log` source-union change; operating-book guard satisfied for the new dir. Checkout stays dark.

## 3. Corrected a wrong belief I had been carrying

**Both Anthropic keys are funded.** Live-tested: vault key `fp 49ef1753` → HTTP 200; Hetzner key `fp d5dfd8d4` → HTTP 200. The "$0 credit blocks everything" claim came from a 48-day-old note and is **false**. The Hetzner key has also rotated (my note said `f17e77a3`).

Consequences: **no Anthropic topup is needed**, and DealDesk extraction needs no Hetzner relay — the standard vault key works. A 4-token probe proves validity and some credit, not a large balance, so still watch spend.

---

## Not done, and why

**Cloud routines not armed.** You asked for crons inside Claude Code. Two blockers:
- `CronCreate` is **session-only** — jobs die when the session exits, and cap at 7 days. Useless for anything durable.
- Scheduled **cloud routines** are durable but run in Anthropic's cloud with only a git checkout: **no local vault, no Hetzner SSH key, no local env**. So "use the funded Hetzner key" does not apply to them — they bill to the Claude subscription. Minimum interval is 1 hour.

I did not arm them because a routine holding `Bash`/`Write` on this repo can commit and push to `main`, which auto-deploys nine live surfaces — the exact failure that broke the hub for a week. Unsupervised at 2am that is *more* exposure, not less. Configs are below, one approval away.

**Product-critical crons should NOT be Claude Code agents.** A lease-renewal alert 90 days out is deterministic SQL plus an email. Putting it behind a probabilistic agent contradicts the WAT principle in your own root `CLAUDE.md` ("deterministic code handles execution… 90% accurate per step is 59% after five steps"), and a missed date on a lawyer-run product is malpractice-adjacent. **Keep `date-scan`, `reminders`, and `cost-audit` as Vercel crons in `apps/dealdesk/web/vercel.json`.** Use cloud routines only for ops/audit/digest work, which is what they're good at.

**Not merged, not deployed, not applied.** Merging touches the live money path across nine surfaces; migrations change the live DB. Both want you awake.

---

## Morning queue (in order)

1. **Review and merge `fix/money-path-and-dealdesk`.** The webhook change is the highest-value line of code in the repo right now. PR: https://github.com/aileadx10-boop/bizlegal-monorepo/pull/new/fix/money-path-and-dealdesk
2. **Prove the rail with `gateway='simulated'`** (already a valid CHECK value) — drive `pending → active`, replay the IPN to confirm dedup, confirm the receipt. No real money required.
3. **Apply the migrations**, `dd_properties` first.
4. **Sell something.** The binding constraint is not code. `payment_orders` has 244 cancelled / 10 pending / 1 simulated / **0 paid** across 8 surfaces. Lease abstraction at $300–800 and closing management at $500–1,500, invoiced by wire, need **one buyer** — self-serve at $49 needs ~2,450 visitors against ≈0 traffic.

### Topup — much smaller than either brief claimed

| Item | Verdict |
|---|---|
| Anthropic | **$0 — not needed.** Both keys live-tested working |
| Supabase | **~$25/mo**, but confirm the tier first — a second project sits `INACTIVE`, which is free-tier auto-pause behaviour |
| Resend | **$0.** Free tier is 3,000/**month** and 100/day (not 3,000/day) — crons must respect it |
| Perplexity | **$0.** Key is 13 chars, a placeholder. Not needed with PropSignal parked |
| Stripe / entity | **$0.** Deferred — see below |

**Total: ~$25/mo.** Claude extraction is ~$0.12/lease on Sonnet, ~$0.02 on Haiku → 100 leases ≈ $12/mo. That is why Hermes-first is premature optimisation: ~$12 saved for a tunnel, an auth surface, and a model mismatch (Hetzner runs `mistral-nemo`; the prompt file defaults to `hermes3`).

### Entity / Stripe

**Defer.** Two live rails have processed zero real transactions, and wire (already built, ≥$500) is the correct instrument for high-ticket B2B. Revisit on a specific card-blocked deal or ~$2–3K self-serve MRR. If then: **US Delaware LLC** (~$500, 2–3 wks) over a UAE free zone ($3,400–5,500/yr, 4–12 wks, bank-account opening is the bottleneck and often refused). Two things not to gloss over — incorporating abroad does **not** move tax residency (management-and-control from Israel generally keeps it Israeli tax-resident, so the entity buys Stripe access, not a tax outcome), and a foreign-owned single-member US LLC must file **Form 5472**, penalty **$25,000** if missed. Israeli CPA first.

---

## Cloud routine configs — ready to arm

Create via `/schedule` → create, environment `Default`, repo `aileadx10-boop/bizlegal-monorepo`. Times are UTC (you are Asia/Jerusalem, UTC+3 in summer).

**Model routing, per your budget instruction** — Haiku for mechanical passes, Sonnet where a judgement call matters. Opus only for genuine architecture work, on request.

| Routine | Cron (UTC) | Model | Tools | Purpose |
|---|---|---|---|---|
| `revenue-watchdog` | `17 * * * *` hourly | `claude-haiku-4-5-20251001` | Read, Grep, Glob + Supabase MCP | Query `payment_orders` for `status='pending'` with a non-null `gateway_invoice_id` older than 2h, and `ops_events` for `type='error'` with `scope='nowpayments_webhook'`. Report only. **Never write.** |
| `build-health` | `13 6 * * *` 09:13 local | `claude-haiku-4-5-20251001` | Bash, Read, Grep | Run typecheck across all apps, report failures. Open **no** PR, push **nothing**. |
| `weekly-review` | `23 7 * * 1` Mon 10:23 local | `claude-sonnet-5` | Read, Grep, Glob + Supabase MCP | Revenue, traffic, and funnel state vs the prior week; name the single biggest blocker. Judgement work, so Sonnet. |

Two rules to keep on every routine: **read-only tool sets** (no `Write`/`Edit` until you've watched one run), and **never `git push`** — a push to `main` auto-deploys nine surfaces. Attach the Supabase connector; it is already connected.

## Pre-existing issues found, not fixed

- **3 tables have RLS disabled** — `fc_visibility_index_runs`, `fc_visibility_index_entries`, `fc_social_experiments` — fully readable *and writable* with the anon key. Enabling RLS without policies would block all access, so this needs deliberate policies, not a blind `ALTER`.
- Legacy `orders` table has `public_read USING (true)` — every order row readable by anon.
- **4 of 5 `nowpayments/webhook` copies have no idempotency** (`brai`, `docai`, `lexaudit`, `tracr`); only hub's claims events.
- `apps/forge/.../api/payment/webhook` **fails open** when secret or signature is missing, uses `!==` not `timingSafeEqual`, no idempotency claim.
- `apps/docai/.../documents/upload` has no size limit → opaque platform 413 (Vercel caps bodies at 4.5 MB; this is also why DealDesk uploads must go direct to Storage).
- `audit-vault` reports **56 pre-existing** env names missing from the vault (incl. every `BANK_*` used by `lib/payments/wire.ts` — relevant now that wire is the recommended instrument).
- `packages/ops-heartbeat/CLAUDE.md` missing; `services/__pycache__` tracked and tripping the operating-book guard.
- Root `CLAUDE.md` lists 5 packages that do not exist (`ui-v2`, `theme`, `safe`, `firecrawl`, `policy-refresh`), and §6 ("no real money until Z7") contradicts §7 ("checkout live").

## Removed from the briefs on liability grounds

You are bar-admitted, which changes these from company risk to licence risk:
- **RESPA §8** (12 U.S.C. §2607) bars giving *or* accepting a fee for referral of settlement-service business on federally related mortgage loans. That kills CloseFlow's title ($75–150/closed-ref), lender ($100–250/closed-loan), and notary success fees. Success-based is the textbook violation — treble damages plus criminal exposure.
- **ABA Model Rules 5.4 / 7.2** — per-lead attorney referral fees implicate fee-sharing and paying-for-recommendation. Kills DocParse paths D and E.
- Selling anonymized lease terms — leases are confidential, often NDA-bound.

Defensible alternative later: flat-rate placement at fair market value, unlinked to closings or referrals, paid identically whether or not business results. Not disclaimer-fixable. Needs real counsel.

Same defect already exists at `decisions/MASTER-PLAN.md:256` ("8% referral fee" to lawyer partners) — flagged, not fixed.

I have not checked this analysis against a legal source. It is well-established rules applied to the briefs' fee structures, and you are far better placed to judge it than I am.
