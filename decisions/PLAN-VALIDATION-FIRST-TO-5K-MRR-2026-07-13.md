# Validation-First Plan → $5K MRR — bizlegal-ai.com
**Supersedes the Hermes "12-month organic SEO → $5K MRR" plan (2026-07-12).**
Written 2026-07-13 after live-testing the money surfaces.

## Why the previous plan was rejected

1. **The funnel math was physically impossible.** At its own stated rates
   (1% blog→pricing × 2% pricing→checkout × 25% checkout→paid = 0.005%),
   hitting the month-10 target needed ~1.6M blog visits/mo — 50–60× the
   plan's own traffic projection.
2. **B2B compliance is a considered, high-trust sale** — it does not close
   via anonymous blog SEO + self-serve $99 checkout.
3. **YMYL + mass AI content = demotion risk, not an asset.** 480 anonymous
   AI articles in a legal/compliance niche is what Google's Helpful-Content
   system penalises.
4. **It was 90% supply-side** (15 new agents) for a demand problem.
5. **It ignored the founder** — a practising lawyer — as the primary GTM
   asset and the only real source of E-E-A-T.

## GROUND TRUTH (live-tested 2026-07-13)

| Surface | State | Note |
|---|---|---|
| Crypto checkout (`/api/pay/start`) | ✅ WORKS | Real NOWPayments invoices |
| Card checkout (PayPal) | ✅ WORKS | Real checkout URLs, 20 plans live |
| DocAI decision-tree (free lead capture) | ✅ WORKS | Pure capture, no LLM |
| **DocAI SQA drafter (paid $69 feature)** | ❌ **BROKEN** | "credit balance too low" |
| **Hub risk-snapshot (free tool)** | ❌ **BROKEN** | Same — now degrades gracefully (f3d4d5b) |
| **DPA negotiator, qualifier chat** | ❌ **BROKEN** | Same dead Vercel Anthropic key |
| **Plausible analytics** | ❌ **DEAD** | 0 tags on prod → zero funnel visibility |
| Hetzner content engine (SEO agents) | ✅ WORKS | Separate FUNDED Anthropic key |
| Ops HMAC chain | ✅ GREEN | vault==Hetzner==hub |
| Outbound email | 🔒 HALTED | 4 senders disabled; 123-addr suppression list |
| Paying customers | **0** | 0 signups, 0 newsletter opt-ins |

**The #1 barrier is not demand or SEO — the product is currently broken.**
Every visitor who reaches an AI feature gets an error, and you cannot
even *see* who visits because analytics is off. You can take money for a
product that doesn't work — the worst possible state.

## The strategy: validate by hand, then automate what's proven

Same assets, inverted sequence. Do NOT scale traffic to a funnel that may
convert at 0% and a product that currently errors.

---

### PHASE 0 — Make it work & make it visible (THIS WEEK, ~45 min Moses)

Nothing else matters until these are true. All Moses-only, all cheap.

| # | Action | Where | Cost | Unblocks |
|---|---|---|---|---|
| 0.1 | **Fund Anthropic credit** (the key hub/docai use) | console.anthropic.com → Billing | $20–50 | Un-breaks SQA, DPA, risk-snapshot, qualifier — the actual product |
| 0.2 | **Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`** in Vercel on all 8 projects + redeploy | Vercel env | $0 | Funnel becomes measurable — you can finally SEE traffic/clicks |
| 0.3 | Set `BIZLEGAL_NEWSLETTER_SECRET` (any 32+ char string) in Vercel | Vercel env | $0 | Double-opt-in confirm flow works |
| 0.4 | Set `RESEND_WEBHOOK_SECRET` + point Resend webhook at `/api/webhooks/resend` | Vercel + Resend | $0 | Auto-suppress bounces |
| 0.5 | Do ONE real $0.50 crypto purchase end-to-end | live site | $0.50 | Proves IPN → access-grant leg |

**Gate:** After 0.1–0.5, every product feature works and you can watch the
funnel. If you skip 0.1, everything below is moot.

---

### PHASE 1 — Introvert-friendly validation (WEEKS 1–10) — THE WHOLE BALLGAME

This is the phase the old plan didn't have. **Founder-AUTHORED, not
founder-performing.** Moses is an introvert who dislikes live "human touch"
— so this phase is deliberately built around a lawyer's real strengths:
writing, depth, credibility, and async. NO cold calls. NO live demos.

- **Pick the SELF-SERVE product, not the high-touch one.** Recommendation
  changed to **DocAI $97 contract/privacy scan** — it can sell with ZERO
  conversations if the funnel + trust signals are right. (The $2,500/mo
  retainer needs live consultative selling, which is the exact wrong fit
  for an introvert — defer it until inbound produces warm, self-qualifying
  leads.) Shelve the other 6 products.
- **Inbound-first (plays to your strength).** Publish genuinely expert
  compliance writing **under your real name + bar credentials** — 1–2 pieces/
  week answering specific regulatory questions. This is writing (your job
  already), it builds authority passively, and it generates INBOUND so
  people come to you. For an introvert, inbound > outbound. Optimise every
  piece for **AI citation (GEO)** — Perplexity/ChatGPT answer compliance
  questions and can cite you without you ever talking to anyone.
- **Async, written, tiny-volume outreach (never calls).** 10–20 genuinely
  personalised written notes/week to REAL warm targets (your network, 2nd-
  degree LinkedIn, relevant community members). The AI drafts (kills the
  blank-page burden — your strength is editing, not cold-initiating), YOU
  curate the list and approve each send. Every note offers an ASYNC next
  step (the free tool link, a short Loom, a written audit) so the prospect
  self-serves the "demo." Small volume + real people + genuine 1:1 = normal
  professional outreach, the opposite of the scraped-blast incident.
- **Optional: one partnership beats fifty conversations.** An introvert can
  build ONE deep relationship (a compliance consultant, an accountant
  network, a niche newsletter) that distributes to hundreds. Depth over
  breadth.
- **Target: 3–5 paying self-serve customers** from inbound + light written
  outreach.
- **HARD GATE:** if content + GEO + light written outreach can't produce a
  single sale in ~10 weeks, the product or positioning is wrong — stop and
  fix that before scaling. (Fails fast in 10 weeks instead of 12 months.)
- **Honest tradeoff:** the introvert-friendly path is SLOWER and lower-
  volume than aggressive founder sales, so the ramp stretches (~2 extra
  weeks in Phase 1, and $5K MRR trends toward month 12–15 rather than 10).
  That's a fair trade for a motion you'll actually execute. The one thing
  that would speed it up without live selling is the single partnership.
- First customers become your **real testimonials** — the only legitimate
  E-E-A-T fuel for Phase 2.

---

### PHASE 2 — Compounding authority + GEO (MONTH 2–6)

Now the content engine earns its keep — as YOUR drafting assistant, not an
autonomous slop publisher.

- **1–2 genuinely expert pieces/week, bylined by you** (real lawyer creds =
  real E-E-A-T). ~40 authoritative articles, not 480 AI ones.
- Target **specific, bottom-funnel, low-competition regulatory questions**
  (long-tail intent) where a new domain can rank AND where AI engines pull
  answers.
- **Lean hard into GEO/AEO** (Perplexity/ChatGPT citation) — the old plan's
  best instinct, promoted to centrepiece. AI answer engines are far less
  authority-gated than Google YMYL, and compliance Q&A is exactly what
  people ask AI. `geo_citation.py` + `aeo_loop_v2.py` already exist.
- Keep existing agents: `seo_dispatcher`, `aeo_loop_v2`, `content_enricher_v2`,
  `index_watchdog`. NO new agent builds this phase.

---

### PHASE 3 — Scale only what's proven (MONTH 6–12)

Pour fuel ONLY on the channel + topics that produced actual customers or
citations in Phases 1–2. Add paid experiments once the funnel demonstrably
converts. Revisit the 8-product question only after ONE is a proven winner.

---

## Milestones — tied to REVENUE, not output

| When | Milestone (the ONLY metric that matters is a human who paid) |
|---|---|
| This week | Phase 0 done: product works, analytics live, $0.50 test passes |
| Week 8 | **3–5 paying customers (founder-led) — or PIVOT positioning** |
| Month 3 | One repeatable acquisition channel identified (real CAC) |
| Month 6 | $1–2K MRR from a channel with a known cost-per-customer |
| Month 12 | $5K MRR **if** the proven channel scales |

Vanity metrics explicitly NOT used as milestones: pages published,
posts/day, articles written, agents built.

## Cost

Phase 0: ~$25 one-time-ish (Anthropic). Phases 1–3: $30–130/mo (LLM +
optional Apify). Same lean envelope as the old plan (~$1.5–2K/12mo) — the
difference is sequencing, not spend.

## What to build (almost nothing)

The old plan's 15 new agents / 3,000 LOC are CUT until Phase 3, and only
if a proven channel demands them. Existing agents cover Phases 0–2. The
work that matters in Phases 0–1 is credentials + founder selling, not code.

## Risks the inversion removes

- Spending 12 months + building 15 agents before discovering nobody will pay.
- Getting the domain demoted by dumping 480 AI articles into a YMYL niche.
- Taking money for a broken product (Phase 0 fixes this first).
- Flying blind with no analytics (Phase 0.2 fixes this).
