# REVENUE MACHINE 24/7 — Build Decision (2026-07-04)

**File:** `decisions/REVENUE-MACHINE-24-7-2026-07-04.md`
**Owner:** Moses (BizLegal AI / DOR INNOVATIONS)
**Status:** APPROVED and built this session (branch `claude/bizlegal-compliance-strategy-h2wwga`)
**Composes with:** `decisions/MRR-40K-90-DAY-PLAN-2026-07-02.md` (the Week-1 first-dollar gate remains supreme — nothing sends autonomously until it passes) and `decisions/AEO-AUSTIN-ARMSTRONG-2026-07-02.md` (ratified content queue).
**Standing orders:** `agents/HERMES-STANDING-ORDERS.md` (created by this build — the single source Hermes reads first).

---

## 1. What this decision is

Turn the already-built-but-never-fired BizLegal machine into a 24/7 revenue loop. The system audit found: ~25 SEO agents + 8 crawlers already run daily on Hetzner; the outreach fleet (headhunter, cold sender, nurture drip) is verified working but draft-gated — **0 emails ever sent**; `/ops/live` heartbeats shipped; $0 ever captured. The bottleneck is not capability, it is (a) Moses-manual payment/env blockers and (b) everything waiting for manual sends. This build closes (b) behind explicit gates and adds the missing funnel pieces.

### Decisions ratified (defaults — Moses may override via the standing-orders change log)
1. **Autonomy:** auto-send with hard caps (cold ramp 15→30→50/day via cron `--cap` flag, headhunter ≤25/day weekdays), kill-switch on >5% bounce or any spam complaint, daily Telegram digest of everything sent. Gated on the Week-1 payment gate + one-time Moses template approval (the 26 headhunter drafts + 28 AEO emails staged in `lead_outreach`).
2. **Budget:** $150-200/mo is the TOTAL all-in cap (tools + infra + inference ≈ $165-205/mo; Apollo skipped — `signal_scout.py` covers signal sourcing free).
3. **High-ticket ladder:** Pilot **$2,500** → Build **$15,000** (50% wire upfront) → Flagship **$40,000 + 20% rev share**. Rationale: $40K does not close cold at $0 track record; the Pilot is the case-study machine that makes the Flagship sellable (~day 60+).
4. **Low-ticket volume SKU:** **$19 AI Compliance Risk Snapshot** — one-time, fully automated (Firecrawl scrape → Sonnet report → Resend email in ~10 min), upsells DocAI $29/mo + LexAudit $99/mo.

## 2. What was built (WP1-WP6)

| WP | Deliverable | Key files |
|---|---|---|
| 1 | Hermes consolidation: standing orders O1-O7, the missing agents index, 18:00 UTC `daily-standing-review` (WHAT WAS CHECKED / DONE / NEEDS DOING) | `agents/HERMES-STANDING-ORDERS.md`, `agents/AGENTS.md`, `apps/hub/lib/agents/prompts.ts`, `apps/hub/vercel.json` |
| 2 | 24/7 loop: gated autonomous cron entries, headhunter `--max-per-domain` + custom-build ICP, free signal-based outbound (hiring/funding/pain), invoice agent as real code | `services/seo-agents/crontab.txt`, `services/outreach/headhunter.py`, `services/outreach/signal_scout.py`, `apps/hub/app/api/cron/invoices/route.ts` |
| 3 | Async funnel (THE-MACHINE graft): multi-turn AI qualifier chat, token-gated deal rooms w/ wire + card/crypto checkout, day-1/3/7 nudges | `apps/hub/app/api/qualify/`, `apps/hub/components/conversion/QualifierChat.tsx`, `apps/hub/app/deal/[token]/`, `supabase/migrations/20260704_hub_qualifier_deal_rooms.sql`, `services/outreach/lead_nurture.py` |
| 4 | High-ticket offer page, 3 tiers, no sales calls | `apps/hub/app/services/custom-build/page.tsx`, SKUs in `packages/payment/src/products.ts` |
| 5 | $19 Risk Snapshot SKU + automated fulfillment | `apps/hub/app/products/risk-snapshot/page.tsx`, `apps/hub/app/api/risk-snapshot/generate/route.ts`, `agents/ea/prompts/risk-snapshot-report.md` |
| 6 | Command dashboard — every move on one screen | `apps/hub/app/api/ops/command/route.ts`, `apps/hub/app/ops/command/page.tsx` |

System flow, funnel, and daily-loop Mermaid diagrams live in `agents/HERMES-STANDING-ORDERS.md` §5.

## 3. Tool stack (total all-in ≤ ~$200/mo)

Hetzner $12 · Vercel $20 · Supabase $25 · Resend $20 · Firecrawl $16 · Plausible $9 · SerpBear self-hosted + serper.dev ~$10 · Buffer $6 · Perplexity ~$5 · Anthropic inference $40-80 → **~$165-205/mo**. Skipped: Apollo $49, SE Ranking $65, Apify. One $2.5K Pilot covers ~12 months of burn.

## 4. Forced estimates

**Income (conservative / base / stretch per 30-day period):**

| Engine | Day 30 | Day 60 | Day 90 |
|---|---|---|---|
| $19 Snapshot | $57 / $190 / $570 | $190 / $570 / $1.9K | $380 / $1.5K / $5.7K |
| Subs MRR | $29 / $127 / $400 | $127 / $500 / $1.5K | $300 / $1.5K / $4K |
| High-ticket builds | $0 / $2.5K / $5K | $2.5K / $7.5K / $17.5K | $5K / $20K / $55K |
| Retainers (MRR-40K E2) | $0 / $500 / $1.5K | $500 / $2K / $6.4K | $1K / $5K / $12.7K |
| **Total** | **$86 / $3.3K / $7.5K** | **$3.3K / $10.6K / $27K** | **$6.7K / $28K / $77K** |

Kill criteria: if day-30 conservative isn't beaten, the problem is offer/trust, not automation — stop building; Moses does 10 founder-led closes.

## 5. Activation order (what fires when)

- **Phase 0 — Moses (blocks all sends, ~3.5h):** the MRR-40K Week-1 gate — DocAI `NEXT_PUBLIC_SITE_URL` fix, PayPal plan IDs, Cloudflare AI-crawler unblock (8 zones), GSC verify, one real test payment.
- **Phase 1-2 — shipped this session:** all WP code above; new crons in `crontab.txt` are committed **commented out**.
- **Phase 3 — flip autonomous (after gate green + Moses approves the staged templates once):** uncomment the four crontab entries, SCP to Hetzner per `decisions/DEPLOYMENT_MAP.md`, restart. Cold cap ramps 15→30→50 weekly by editing `--cap`.
- **Phase 4 — steady state:** Hermes runs the daily loop; Moses ≈20 min/day — read the 08:00 digest + 18:00 standing review, follow up deal-room opens ≥$2.5K same day, record case study #1 the day the first Pilot delivers.

## 6. Verification checklist

- [ ] 08:00 + 18:00 Telegram messages arrive in the specified formats.
- [ ] Send caps greppable in exactly one file (`agents/HERMES-STANDING-ORDERS.md`).
- [ ] E2E dry run: qualifier chat → deal-room email → open alert → wire `payment_orders` row → day-1 nudge.
- [ ] $19 snapshot test purchase → automated report email <10 min, zero human touch.
- [ ] Wire order → invoice email <24h; reminders day 3/7; Telegram at day 14.
- [ ] Kill-switch halts senders on seeded bounce.
- [ ] `/ops/command` numbers reconcile against Supabase; heartbeat strip live.
- [ ] 5 consecutive weekdays of autonomous sends in `lead_outreach` with zero Moses touches.
