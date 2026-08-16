# BENCH — Legal AI Quality Intelligence (2026-08-16)

**Decision:** build `apps/bench` (bench.bizlegal-ai.com) — the evaluation lab
for legal AI. Survival Plan v5.0 ("measurement company, not labor broker")
adopted, sharpened to v5.1 after a pressure-test verdict, and rebuilt on the
fleet's own architecture to the micro1.ai presentation standard.

**Identity:** Bench measures how accurately AI systems perform legal work — by
jurisdiction, against expert-labeled gold standards. Not legal advice, not a
lawyer referral service, not a marketplace. The experts are production
infrastructure — vetted, asynchronous, invisible. The measurement is the product.

---

## 1. The product line

| Product | Price | ID |
|---|---|---|
| Diagnostic Audit — 25–30 evals, one jurisdiction × practice area, full report | $2,500 one-time | `bench_audit_2500` |
| Managed Evaluation Program — 100–150 evals/mo, trend tracking | $5,000/mo | `bench_managed_monthly` |
| Dedicated Intelligence — custom rubric, multi-jurisdiction, quarterly reports | from $12,500/mo | deal room, no ID yet |

Report contents: accuracy score (mean/25 → %), hallucination rate,
critical-error rate, citation reliability, missing-law rate, jurisdictional
breakdown, 6-class error taxonomy, gold-standard corrections, remediation memo.
All computed by `apps/bench/web/lib/rubric-engine.ts` — deterministic, public
formulas (bench.bizlegal-ai.com/methodology).

**The benchmark suite is the brand** (micro1 pattern — named, versioned,
citable): **MiCA-Bench** (EU), **DPA-Bench** (UK), **VARA-Bench** (UAE). 25
items each at v1, ≤5 released publicly, the rest held out (contamination
control). JSON in git = the moat's spine.

## 2. v5.0 → v5.1 corrections (pressure-test verdict, applied)

1. **Economics:** both v5.0 paid tiers lost money ($16–30/eval revenue vs
   $40–100 expert cost). Fixed by eval-mix architecture: ~70–80% AI-prescored
   with expert verification sampling ($25–35/verification), ~20–30% full expert
   judgment ($75–125). Pilot floor $2,500/25–30 evals; managed 100–150
   evals/mo. Delivery-economics table in `apps/bench/docs/PLAN.md` gates all
   pricing copy.
2. **Trust architecture:** public methodology page with rubric anchors;
   calibration = double-scoring + inter-rater agreement computed by
   `lib/inter-rater.ts` and published (never asserted); per-report expert
   credential classes (jurisdiction, PQE) — never names.
3. **Moat re-framed:** not eval volume (decays monthly) but (a) versioned
   gold-standard sets, (b) methodology + calibration record, (c) longitudinal
   client accuracy history. **3-category data-rights clause** in /legal/terms:
   client inputs / client model outputs / Bench-owned evaluations & gold
   standards (unconditional).
4. **Defamation guard:** company-named scores are private deliverables only;
   published research is anonymized/aggregated; methodology-shield +
   liability-cap clauses in terms.
5. **Time budget:** the 20-insight-emails/week engine is deleted (see §3);
   analysis hours go into published benchmark research instead.
6. **Payer sequencing:** month-6 recurring mix must include ≥1
   compliance-software or law-firm client (AI startups churn/die/build
   in-house); landing + intake segment by buyer type.
7. **Leverage the stack:** first research output is the self-benchmark of our
   own surfaces (`wf_self_benchmark`, `scripts/bench-self-audit.mjs`) —
   disclosed, honest, free credibility.

## 3. Hard-rule reconciliation

- **Rule 7 (outbound is inbound-only):** the v5.0 Apollo/Instantly insight-led
  cold-email engine is **not built** — deleted the same day that rule was
  written, on the same branch. GTM: published anonymized benchmarks (existing
  blog/AEO engine), `/audit/request` + `/experts` inbound funnels, double
  opt-in newsletter via `@bizlegal/email`, cross-sell from DocAI/LexAudit/hub.
  Person-targeted drafts, if Moses sources a target himself, go through
  `sales_outreach` (draft-only, Moses approves, consent logged). The system
  never sends cold.
- **Rule 5 (no real money until verified):** `/api/checkout/start` ships dark
  (503 `checkout_not_live`); lit by flipping `CHECKOUT_LIVE` after a
  Moses-verified test purchase.
- **Rule 3 (no new event types):** bench uses existing types only —
  `lead.inbound`, `legal.cite_audit`, `report.generated`, `download.report`,
  `agent.checkout`, `payment.*`, `email.sent`, `error`.
- **Vault:** zero new env names.
- **AI-hiring compliance:** expert admission decisions are human-only; AI
  assists assessment, humans decide (wf_expert_onboarding).

## 4. Architecture (all existing fleet patterns)

- App: `apps/bench/web/` — Next 14 app router, trio scaffold convention,
  self-contained "laboratory ledger" design system (globals.css tokens, light +
  dark deliberate).
- Data: `supabase/migrations/20260816_bench_schema.sql` — bench_intake,
  bench_clients, bench_engagements, bench_experts, bench_expert_applications,
  bench_evaluations (the atomic moat unit, incl. calibration self-refs),
  bench_reports (token-gated). RLS everywhere, service-role only.
- Payments: products registered in `@bizlegal/payment`; checkout via hub
  `/api/pay/start` when lit (NOWPayments + PayPal — Stripe unavailable).
- Email: `@bizlegal/email` only; the two API routes send transactional acks;
  suppression enforced in-package.
- Ops: HMAC ops-log wrapper (propsignal pattern), source `bench`.
- WAT: `apps/bench/docs/PLAN.md` + 5 SOPs (diagnostic audit, expert
  onboarding, benchmark authoring, self-benchmark, managed month).

## 5. Staged model

| Stage | MRR | Sell |
|---|---|---|
| 1. Managed evaluation | $0–10K | Diagnostic audits + managed programs |
| 2. Recurring benchmarking | $10–30K | Trend tracking + remediation, annual benchmark report |
| 3. Automated monitoring | $30–100K | Continuous evaluation + proprietary benchmark subscriptions |
| 4. Enterprise intelligence | $100K+ | API, real-time monitoring, competitive intelligence |
| Marketplace | — | Probably never; only on explicit client demand + $30K MRR stable |

**Targets:** day-60 kill criterion (<2 paying engagements ⇒ reprice/retarget);
month 6: $8–12K MRR, 3–5 recurring (≥1 non-startup), 10–15 active experts.

## 6. Moses-only gates (in order)

1. Review the 3 benchmark sets (`web/data/benchmarks/v1/*.json`) + `/legal`
   pages — sets stay `draft`/unusable-for-paid until his sign-off
   (wf_benchmark_authoring gate).
2. Apply the migration (Supabase MCP or dashboard SQL editor).
3. Vercel project `bench`, Root Directory `apps/bench/web`, CNAME
   `bench` → cname.vercel-dns.com. Read
   `decisions/VERCEL-PUSH-NOT-DEPLOYING-2026-07-29.md` before trusting a push.
4. Run `node apps/bench/scripts/bench-self-audit.mjs --set mica-bench`,
   score it, update `/sample`, publish the anonymized post.
5. First buyer → $0.50-class test purchase → flip `CHECKOUT_LIVE`.

## 7. What was killed

Carrd, Stripe (dead for IL founders), Typeform, Airtable, ConvertKit, Slack,
Apollo, Instantly, cold email in any form, public expert profiles, marketplace
endgame, named-company published scores, AI-decided hiring, $1,500/50-eval
pricing, "48–72h" universal SLA (now "typically 3 business days"), new env
vars, new event types, live checkout before verification.
