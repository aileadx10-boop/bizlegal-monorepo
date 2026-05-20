# Weekly Revenue Plan — 2026-05-21

**Goal:** First real dollar this week. Second real dollar next week. Repeat.

---

## The 3 revenue levers (ordered by immediacy)

### Lever A — Wire + Crypto (take money TODAY)

**Status:** LIVE. No approvals needed. No gatekeepers. No stubs.

**Action this week:**
1. Send a prospect any of these checkout links:
   - **Hub Pro $149/mo** — `https://bizlegal-ai.com/checkout?product=hub&tier=pro&interval=monthly&amount=14900&name=BizLegal%20Hub%20Pro`
   - **LexAudit Monitor $99/mo** — `https://bizlegal-ai.com/checkout?product=lexaudit&tier=monitor&interval=monthly&amount=9900&name=LexAudit%20Compliance%20Monitor`
   - **BRAI Extended $500** — `https://bizlegal-ai.com/checkout?product=brai&tier=extended&interval=one-time&amount=50000&name=BRAI%20Extended%20Report`
   - **Forge BOI Kit $149** — `https://bizlegal-ai.com/checkout?product=forge&tier=boi-kit&interval=one-time&amount=14900&name=Forge%20BOI%20Kit`
2. Buyer picks: Crypto (NOWPayments) or Bank Wire (USD/EUR, ≥$500)
3. After payment clears, deliver the product manually via email (automated delivery not yet wired)
4. Log to ops: payment flows into `/ops` automatically via webhook

**Daily (30 sec):** Check `/ops` for any `payment.intent` or `payment.confirmed` events.

---

### Lever B — Cold-pitch queue (PR #43)

**Status:** 3 pitch variants ready to send. Compliance lead, GC, and founder personas.

**Action this week:**
1. Approve and merge PR #43
2. Send 3-5 pitches/day from the queue
3. Each pitch includes a live checkout URL — recipient can buy immediately
4. Track responses as `lead.inbound` ops events

**Target:** 15-25 pitches/week → expect 1-3 exploratory calls → 1 close within 2-3 weeks.

---

### Lever C — SEO velocity (gap pages → organic MRR)

**Status:** 3 gap pages indexed. Need 50-200 for topical authority. Curator pipeline produces 3/week.

**Action this week:**
1. Resubmit sitemap in GSC (needs your hands, 30 sec)
2. Verify curator pipeline is producing 3 gap pages/week
3. Check `forge.bizlegal-ai.com` gap pages for indexing status

**Expected timeline:** 50 indexed pages in ~16 weeks at current cadence. Push pipeline to 5/week to hit 50 in 10 weeks.

---

## Daily ops routine (5 min total)

| Time | Action | Tool |
|---|---|---|
| Morning | Check `/ops` for overnight events | `https://bizlegal-ai.com/ops?t=$OPS_DASHBOARD_TOKEN` |
| Morning | Check `/ops/health` for green across all 8 surfaces | same URL + `/health` |
| Morning | Send 3-5 cold pitches (if PR #43 merged) | PR #43 queue |
| Weekly (Fri) | Verify wire reconciliation via `/api/payments/wire/confirm` | curl or ops dashboard |

---

## This week's revenue target

| Source | Expected | Probability | Timeline |
|---|---|---|---|
| Wire (≥$500) | $500-2,000 | Medium (needs active pitching) | This week |
| Crypto | $149-500 | Low-Medium (depends on crypto buyer) | This week |
| Cold pitch close | $0-500 | Low (2-3 week cycle) | 2-3 weeks |
| SEO organic | $0 | Pipeline building | 8-16 weeks |

**First dollar target:** $500 from a wire or crypto sale this week.

---

## Quick-start checklist (today)

- [ ] Resubmit `https://bizlegal-ai.com/sitemap-index.xml` in GSC (30 sec)
- [ ] Verify `/ops` dashboard loads and shows green health
- [ ] Send 1 checkout link to a warm prospect (use any link from Lever A)
- [ ] Check if PR #43 can be merged and deployed
- [ ] Verify PayPal sandbox is working (not strictly needed — wire + crypto cover real revenue)

---

## Products available to sell RIGHT NOW

| Product | Price | Interval | Best for |
|---|---|---|---|
| Forge BOI Kit | $149 | one-time | Lowest friction first sale |
| Hub Pro | $149 | monthly | All-products access |
| LexAudit Monitor | $99 | monthly | Ongoing compliance need |
| DocAI Team | $69 | monthly | Contract-heavy teams |
| TRACR Standard | $149 | one-time | Wallet forensics |
| BRAI Extended | $500 | one-time | Regulatory deep dive |
| BRAI Retainer | $599-1,999 | monthly | Enterprise compliance |
| Bank Wire (any product) | ≥$500 | one-time | High-value buyers |
