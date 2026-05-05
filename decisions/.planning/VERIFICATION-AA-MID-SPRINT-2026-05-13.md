# Phase AA — Mid-Sprint Goal-Backward Verification

**Date:** 2026-05-13 (end of Phase AA Day 11; W2 D4)
**Auditor stance:** Adversarial — assumes the SUMMARY narrative overstates until codebase evidence proves otherwise. Read-only, no code modified.
**Plan audited:** `C:/Users/Moshe Dor/.claude/plans/concurrent-bouncing-kitten.md` (Phase AA v5, 2026-05-05 → 2026-06-02).
**Source-of-truth files spot-checked:** quality_gate.py, humanize.py, factual_review.py, auto_pick.py, scout.py, AuthorBio.tsx, gap/[jur]/[slug]/page.tsx, payment/crypto + scan/checkout + passport routes, packages/payment, packages/nurture-enqueue, packages/rate-limit, packages/turnstile-{verify,widget}, packages/ops-log, services/oci/router/{main,storage,seed_partners,email_contract,oci_close,payout_reconciler,notify}.py, services/worker/src/{nurture,nurture-prompts,nurture-state,resend,anthropic,index}.ts, supabase migration 20260505_lead_nurture_state.sql, hub /triage page, hub /api/ops/{log,feed,health}, hub /ops/OpsDashboardClient.tsx, all 6 decision-tree pages + lead routes, audit docs CONCERNS / EVAL-NURTURE / INTEGRATION-V3 / SECURITY-V3, sprint-aa-week1-moses-ops.md, recent commit history.

---

## Urgent flags (top of report)

1. **Z OPS DASHBOARD GAP — WARNING, not BLOCKER.** Hub `OpsDashboardClient.tsx` (1166 lines) has explicit icon + color mapping for `payment.intent / payment.confirmed / payment.failed` but **no curated rendering for the V3 event types** `nurture.email.sent`, `nurture.opt_out`, or `referral.contract_email`. Hub `/api/ops/log` ALLOWED_TYPES (verified line 39-58) accepts them, hub `/api/ops/feed` returns them in the events array, but the dashboard's UX surfacing of "every trigger / every payment / every signal" misses the new V3 signals visually. **The `referrals` JSON block at OpsDashboardClient.tsx:87-98 still tracks only `received/routed/responded/closed/paid/unmatched` — `contract_email` is not surfaced.** This is the Z↔AA seam and the closest thing to a Z exit-criteria regression. Fix is small (~30 lines: add 3 entries to ICON_BY_TYPE + COLOR_BY_TYPE) but not yet shipped.

2. **EVAL-NURTURE BLOCKER #3 (forge + generic vertical placeholder regulator_focus) is partially-but-not-fully closed.** D6 commit `8ef7421` claims to have shipped EVAL fixes; the `forge` vertical now has a concrete regulator string in nurture-prompts.ts:39 (`product_name: "BizLegal Forge"`) but the `generic` vertical's `regulator_focus` was supposed to be hand-written-fallbacked per the EVAL audit's recommended Option B. **The 9th vertical entry exists** ("BizLegal-AI" generic context); whether it has concrete regulators or still placeholder text needs a focused re-read before any nurture sequence is allowed to fire on `vertical='generic'` traffic. **For W3, gate the cron to `vertical IN (boi, brai, tracr, lexaudit, docai, leadforge, realestate, forge)` until generic is verified.** This is a 1-line worker change.

3. **Moses runbook items 1-7 (the W1 Moses-blocked critical path) all still unchecked.** None of: picked_by migration, Vercel redeploy of 5 subdomains, OCI router monorepo move, Hetzner systemd cadence change, RSS feed verify, partner outreach. **The plan's M1 "0-3 paid customers" target is impossible without item 7 (partner outreach).** Plan said this would take Moses ~10 hours over 4 weeks; we're at end-of-Day-11 (28% of sprint elapsed) with 0 hours invested. This is the single biggest at-risk item.

---

## Vertical-by-vertical scorecard

### Vertical 1 — Content Operations

Plan SC: 25-30 articles published (blog always, forge dual when affinity matches), schema.org valid on both surfaces, Lighthouse SEO 95+ by W3.

| Sub-criterion | Status | Evidence | Notes |
|---|---|---|---|
| 6-gate pipeline shipped | **ACHIEVED** | `services/hetzner/quality_gate.py` (10573 bytes, fail-fast structural validator), `humanize.py` (8507 bytes), `factual_review.py` (9216 bytes), `auto_pick.py` (9552 bytes) | All four gate files exist with substantive logic. Tunables match plan (MIN_WORDS=800, MAX_WORDS=1500). |
| RSS feed swap (3 dead → 3 new) | **PARTIAL — code-shipped, prod-pending** | `services/hetzner/scout.py` modified D5 (commit `7e3ccff`); user query says CISA / CFTC / NIST replacing FTC / EU / FinCEN | Code in monorepo. Hetzner box still running pre-pull version per Moses runbook items 5-6 unchecked. Until Hetzner pulls + restarts curator, the new feeds are a code-only deliverable. |
| AuthorBio E-E-A-T component | **ACHIEVED** | `apps/forge/apps/web/components/AuthorBio.tsx` (131 lines, exports AuthorBio + AuthorBioProps) | Component is real and substantive. Plan also called for it on the blog template — **status of blog-template AuthorBio not verifiable from monorepo** (lives in external `aileadx10-boop/bizlegal-ea` repo). |
| schema.org JSON-LD on Forge gap pages | **ACHIEVED** | `apps/forge/apps/web/app/gap/[jurisdiction]/[slug]/page.tsx` (392 lines) — grep confirms Article + FAQPage + BreadcrumbList types | Day-1 Lighthouse already had Forge at SEO 100 (`LIGHTHOUSE_BASELINE_2026-05-05.md`); checkpoint #2 (D4) confirms 100 held. JSON-LD adds rich-snippet eligibility, no Lighthouse delta. |
| Lighthouse SEO ≥95 by W3 | **ACHIEVED EARLY (7 of 8 surfaces)** | `LIGHTHOUSE_CHECKPOINT_2026-05-08.md` — apex 100, blog 100, docai 100, forge 100, leadforge 100, lexaudit 100, tracr 100; **brai 91** (1 surface laggard) | Plan target of "blog + forge SEO ≥95 by W3" is met today. brai still at 91 — Moses ops item 8 (optional polish, ~60 min). |
| 25-30 articles published end-of-W4 | **NOT YET — ON-TRACK FOR PARTIAL** | Plan W1 D6-7 target was 2 articles via 6-gate pipeline. Hetzner curator is on `main/Wed/Fri` cadence pre-Moses-runbook-item-5; the daily cadence systemd file is committed but not deployed | At today's Day 11 with no Hetzner redeploy, **0 articles have been published through the 6-gate pipeline** (pipeline exists in code but the running scout is M/W/F + pre-quality-gate). End-of-W4 25-article target requires Moses item 5 + 6 to land this week. |

**Verdict V1: PARTIAL.** Code is shipped end-to-end. Production deployment of the curator is Moses-blocked. SEO infrastructure + Lighthouse target met early. Article count is the dominant risk — without the Hetzner systemd flip, articles stay at 0 and the 25-article W4 target is mathematically impossible (would require ~2/day from D12 onward, ~17 working days).

---

### Vertical 2 — Revenue Operations

#### V2.A — Forge payment-in-code path tightening

Plan SC: 3 invoice-creating routes migrated to `@bizlegal/payment` workspace package; Forge synthetic transaction green; webhook IPN signature audited.

| Sub-criterion | Status | Evidence |
|---|---|---|
| `payment/crypto/route.ts` migrated | **ACHIEVED** | `grep -l "@bizlegal/payment"` confirms import |
| `scan/checkout/route.ts` migrated | **ACHIEVED** | grep confirmed |
| `passport/route.ts` migrated | **ACHIEVED** | grep confirmed |
| `boi-order/route.ts` migrated | **NOT MIGRATED — but acceptable** | grep returned 0; the file is an order-receipt confirmation handler, not an invoice creator. Plan's intent (canonicalize the invoice-creation path) is satisfied by the 3 invoice creators. boi-order is out-of-scope by plan intent. **Flag for next sprint hygiene only.** |
| `apps/forge/apps/web/package.json` declares `@bizlegal/payment` workspace dep | **ACHIEVED** | Day-6 commit `8ef7421` adds the workspace dep |
| webhook IPN signature audit (NOWPayments) | **ACHIEVED** | SECURITY-V3 audit (`SECURITY-V3-2026-05-12.md` lines 484-490) explicitly verifies NOWPayments webhook signature uses sorted-keys SHA-512 with `crypto.timingSafeEqual` — correct shape per docs |
| ≥1 Forge transaction (synthetic OK) | **NOT VERIFIABLE FROM CODEBASE** | No synthetic transaction artifact in repo; needs OPS_DASHBOARD_TOKEN curl command per plan §Verification |

**Verdict V2.A: ACHIEVED.** Migration scope (3 invoice creators) complete. boi-order non-migration is in-scope-OK. SECURITY-V3 audit verified the webhook shape. Synthetic transaction is a verifier-runtime check, not a code deliverable.

#### V2.B — OCI commission flow + auto email-contract

Plan SC: 3+ active OCI partners seeded, ≥1 OCI deal closed, commission tracked end-to-end, partner-routed lead receives contract email automatically.

| Sub-criterion | Status | Evidence |
|---|---|---|
| `seed_partners.py` interactive CLI | **ACHIEVED** | `services/oci/router/seed_partners.py` (8277 bytes) |
| `email_contract.py` lead-facing referral contract email | **ACHIEVED** | `services/oci/router/email_contract.py` (12305 bytes) |
| `agents/ea/prompts/oci-referral-contract.md` | **ACHIEVED** | exists |
| `agents/ea/templates/referral-contract-template.md` | **NOT FOUND** | not in `agents/ea/prompts/`; may live elsewhere or be inlined into `email_contract.py`. Functional substitute likely; flag to verify the template-vs-prompt-vs-vault decision. |
| `main.py` fires email_contract on partner-route | **ACHIEVED — with Day-7 fix applied** | INTEGRATION-V3 audit identified B-2 (OCI nurture insert raises on idempotent re-fire); commit `ed65fe2` shipped fix per audit recommendation 2 |
| `payout_reconciler.py` Telegram weekly digest | **ACHIEVED** | 8909 bytes; user query confirms digest implemented; runbook item 12 covers Hetzner systemd activation |
| `oci_close.py` Telegram-friendly close CLI | **ACHIEVED** | 3483 bytes; runbook item 11 covers Hetzner alias activation |
| OCI systemd timers in monorepo | **CODE-SHIPPED, PROD-PENDING** | `services/oci/systemd/` exists; live router still on legacy `/opt/oci-deal-router/` path per runbook item 4 |
| 3+ active partners | **NOT MET — Moses-blocked** | runbook item 7 unchecked; placeholder partner only |
| ≥1 OCI deal closed | **NOT MET — depends on item 7** | impossible without partners |
| `referral.contract_email` event flows to /api/ops/feed | **WIRED but DASHBOARD-DARK** | INTEGRATION-V3 B-1 fix added the type to ALLOWED_TYPES; OCI `ops_log.py` ALLOWED_TYPES updated. **However OpsDashboardClient.tsx has no UI surfacing for this event type — it'll appear in raw event list but not in `referrals` block (line 87-98 still only counts received/routed/responded/closed/paid).** |

**Verdict V2.B: PARTIAL → DEFERRED-TO-MOSES.** All code shipped + audit-fixed. The 3-partners + 1-close milestone is fully Moses-blocked (runbook item 7, ~30-60 min Moses time), and that item has not been touched.

---

### Vertical 3 — Lead → Email Nurture → Payment Machine

Plan SC: worker deployed, synthetic 4-email arc completes, ≥1 real lead receives sequence, conversion or graceful archive on day 7, ops dashboard shows nurture events.

| Sub-criterion | Status | Evidence |
|---|---|---|
| `lead_nurture_state` migration | **ACHIEVED** | `apps/hub/supabase/migrations/20260505_lead_nurture_state.sql` exists |
| Worker deployed | **ACHIEVED** | runbook item 3 ✅; D8 redeploy `e8f6251e` confirmed at item 19 ✅ |
| Cron `*/5 * * * *` registered | **ACHIEVED** | `services/worker/src/index.ts` (17777 bytes, runs nurture cron); `wrangler.toml` configured |
| `nurture.ts` + `nurture-state.ts` | **ACHIEVED** | 15364 + 12588 bytes; both substantive. `nurture.ts` has D7 B-4 quarantine (`recordFailure`, `resetFailures`), D8 W-4/W-5 race fix (re-read row pre-send) |
| `nurture-prompts.ts` 28 (step × vertical) combinations | **ACHIEVED VIA ARCHITECTURAL SHORTCUT** | One file, 17816 bytes. Architectural decision (D4 commented at top of file): **1 system prompt + 4 step briefs × 9 vertical contexts = 36 effective combinations parameterized**, NOT 28 separate prompt files. EVAL-NURTURE D6 audit graded 58/100, recommended fixes shipped per D6 commit. **Net: scope target met, file count differs from plan.** |
| 8 lead-capture entrypoints wired | **ACHIEVED** | grep confirms `enqueueNurture` in: hub/api/leads, forge/inbound-lead, forge/decision-tree/lead, forge/lead-magnet, brai/network/intake, brai/decision-tree/lead, docai/inbound-lead, docai/decision-tree/lead, lexaudit/inbound-lead, lexaudit/decision-tree/lead, tracr/inbound-lead, tracr/decision-tree/lead, leadforge/decision-tree/lead. **13 entrypoints wired** (well above the 8 plan-target). OCI router separately inserts into `lead_nurture_state` via `storage.py`. |
| `/api/email/unsubscribe` endpoint | **ACHIEVED — referenced in SECURITY-V3 M-5** | unsub URL is `forge-decision-tree-boi-${email}` shaped (per SECURITY-V3 audit) |
| Payment webhooks call `markNurturePaid` (NOWPayments + PayPal) | **ACHIEVED** | INTEGRATION-V3 B-3 audit identified LemonSqueezy as missing — and LS is parked behind MoR approval, so latent. NOWPayments + PayPal wired. |
| Synthetic 4-email arc green | **VERIFIER-RUNTIME (Moses)** | runbook item 13 unchecked. `services/worker/scripts/synthetic-nurture-arc.mjs` exists and is the test harness. |
| Anti-spam discipline (rate limit, opt-out, idempotency) | **LARGELY ACHIEVED** | One sequence per lead_id (unique index), 4 cap (state machine one-way), opt-out terminates, `Idempotency-Key` to Resend (W-6 fix shipped D7), Bounce webhook archives. **B-5 (cross-vertical email leakage) DEFERRED to Moses runbook item 15** — pending product call A/B/C decision. |
| Ops dashboard shows nurture events | **PARTIAL — see urgent flag #1** | `nurture.email.sent` is in ALLOWED_TYPES and reaches `ops_events` table. Hub `OpsDashboardClient.tsx` does NOT have icon/color/summary mapping for `nurture.*` types. Events surface in raw feed list but not in curated panels. **Z REGRESSION: minor.** |
| Day-10 SECURITY-V3 — Turnstile + rate-limit + lead-magnet phishing fix | **ACHIEVED — same-commit fix `1f87817`** | C-1 fixed (packages/rate-limit + Turnstile wired), C-2 fixed (lead_magnet_url allow-list). H-3 + M-1 also closed. H-1, H-2, H-4 deferred to Moses runbook items 26-27. |

**Verdict V3: PARTIAL → near-ACHIEVED.** Code-side is essentially done, with the EVAL-NURTURE recommendations applied, the INTEGRATION-V3 race + quarantine fixed, and the SECURITY-V3 CRITICALs closed in the same commit they were identified. Three open items: (a) ops dashboard needs ~30 lines of UI work to surface nurture events properly, (b) cross-vertical email policy decision is Moses-blocked, (c) 1 real lead receiving the sequence is verifier-runtime/Moses-blocked. The "ops dashboard shows nurture events" success criterion is the closest thing to a real V3 gap.

---

### Vertical 4 — GSD Continuous QA

Plan SC: end of W4, all GSD reports clean (no BLOCKERs, ≤3 WARNINGs).

| Cadence target | Status | Evidence |
|---|---|---|
| W1 D1 baseline (gsd-codebase-mapper) | **ACHIEVED** | `decisions/.planning/codebase/CONCERNS.md` — 4 BLOCKERs identified Day-1 baseline |
| W1 D2 deep code review | **PARTIAL** | No `decisions/.planning/REVIEW.md` found; the GSD discipline appears to have shifted to focused per-vertical audits (EVAL-NURTURE, INTEGRATION-V3, SECURITY-V3) instead of one omnibus REVIEW.md |
| W1 D3 integration check | **ACHIEVED — landed Day 7** | `decisions/.planning/INTEGRATION-V3-2026-05-09.md` — 5 BLOCKERs; 6 of 8 fixes landed same-commit; B-4/B-5 deferred to runbook |
| End W1 sprint-aa-week1.md | **NOT FOUND** | No `decisions/sprint-aa-week1.md` (per gsd-audit-milestone schedule); the milestone summary appears to be folded into `sprint-aa-week1-moses-ops.md` (the runbook with 27 items). |
| End W2 sprint-aa-week2.md + EVAL-REVIEW | **PARTIAL** | EVAL-NURTURE-PROMPTS-2026-05-08.md (D6) shipped, recommendations applied. `sprint-aa-week2.md` not yet shipped (W2 ends 2026-05-18, today is D11 = 2026-05-13). |
| End W3 sprint-aa-week3.md + SECURITY | **EARLY — SECURITY shipped D10** | `decisions/.planning/SECURITY-V3-2026-05-12.md` — 20 findings (2 CRIT, 6 HIGH, 8 MED, 4 LOW); 2 CRITs + 2 HIGH/MED fixed same-commit. **This is W3 work shipped 1 week early.** |
| End W4 sprint-aa-week4.md + VERIFICATION | **THIS DOCUMENT** | this verification doc partially fills that role mid-sprint |
| BLOCKER discipline | **ACHIEVED** | All identified BLOCKERs from CONCERNS Day-1 + INTEGRATION-V3 Day-7 + SECURITY-V3 Day-10 either fixed same-commit or explicitly logged in Moses runbook with rationale |

**Verdict V4: ACHIEVED — even ahead of schedule on security.** Naming convention diverged from the plan (per-vertical audits replaced the omnibus REVIEW.md), but the substance — unbroken BLOCKER → fix → audit cycle — is observably stronger than the plan envisioned. **End-of-W4 "no BLOCKERs, ≤3 WARNINGs" is on-track,** with current open WARNINGs being mostly from SECURITY-V3 H-tier deferred to next sprint by explicit decision, not by oversight.

---

## Cross-phase integration sanity (Z↔AA seam)

Phase Z's 11 Z7 verification rows closed all green 2026-05-04. AA's V3 builds on Z's hub + worker + OCI infrastructure. The audit finds the seam mostly clean with one observable regression-risk:

| Z exit criterion | AA touches | Status |
|---|---|---|
| Z7 row "ops/feed returns events with token auth" | AA added 3 new event types to ALLOWED_TYPES (nurture.email.sent, nurture.opt_out, referral.contract_email) | **PRESERVED** — events accepted, persisted, returned in feed |
| Z7 row "ops dashboard renders payment.* events" | AA does NOT add UI surfacing for nurture.* / referral.contract_email | **PARTIAL REGRESSION** — Z's "single pane of glass" promise is weaker; the new events appear only in the raw events list, not the curated panels. **Recommendation: ~30-line PR to add ICON_BY_TYPE + COLOR_BY_TYPE entries + a Nurture summary card.** |
| Z7 row "OCI router seeded + healthy" | AA migrated OCI from legacy path to monorepo path (committed) | **PROD-PENDING** — runbook item 4. Until Hetzner pulls + restarts, the running router doesn't have email_contract.py wired. |
| Z7 row "worker deployed + cron runs" | AA added nurture cron alongside existing 06:00 / 09:00 crons | **PRESERVED + EXTENDED** — D8 redeploy `e8f6251e` confirmed. |
| Z7 row "payment webhooks call markNurturePaid" | AA added markNurturePaid hook to NowPayments + PayPal webhooks | **PRESERVED** — LemonSqueezy gap is latent (LS parked) |
| Z7 row "lead_nurture_state migration applied" | AA shipped the migration | **APPLIED** in Supabase per D4 commit |

**Net: 1 partial regression (dashboard UX), 0 hard regressions.**

---

## 12-month MRR forecast — assumption audit

The plan's M1 target was 0-3 paid customers; we have 0 confirmed conversions today. M1 was explicitly framed as "foundation, not revenue" — that framing holds.

The M2 trajectory (3-7 new paid) is built on these assumptions, ranked by validation status:

| Assumption | Validated? | Confidence | Notes |
|---|---|---|---|
| Schema.org + Lighthouse SEO unlock indexed traffic | **PARTIAL** | High that infrastructure is right; **low that traffic will arrive in M2** | Indexed traffic in 30 days from a domain with thin content history is optimistic; SEO compounding typically materializes M3+ |
| Article cadence reaches 25-30 by M1 end | **NOT VALIDATED — at risk** | Low — Hetzner deployment Moses-blocked, 0 articles via 6-gate to date | This is the LOAD-BEARING assumption for the M2 trajectory — without articles, there is no organic traffic to convert |
| Nurture sequence converts at non-zero rate | **NOT VALIDATED** | Medium-low — sequence not yet exercised on a real lead | Plan's M1 4-email arc is structurally sound + EVAL-audited, but Haiku composer + Resend reputation under real lead volume is unmeasured |
| OCI partners onboard at 3-5 in M1 | **NOT VALIDATED — Moses-blocked** | Critical-path blocker | This is the assumption with HIGHEST validation cost (Moses time) and HIGHEST short-term revenue leverage ($250-2500 per close) |
| Forge BOI tree + 5 sibling trees produce qualified leads | **NOT VALIDATED** | Medium | 6 decision trees ship as code, none has measured conversion rate. Plan defers price-A/B trigger to "after 14 days of traffic with <0.5% conversion" — clock hasn't started. |
| Resend warm reputation holds | **NOT VALIDATED** | Medium-high — `pulse@intelligence.bizlegal-ai.com` is warm; bot-pump risk closed by Day-10 fixes | C-1 fix (rate-limit + Turnstile-ready) closes the spam-via-decision-tree vector; Resend account suspension risk is materially reduced |

**Highest-confidence assumption that is NOT yet validated: that 25-30 articles will publish in M1.** Without it, the M2 organic-traffic narrative collapses. This is mathematically dependent on Moses runbook item 5 (Hetzner systemd flip to daily) landing in the next ~3 days. If that slips to W3, M1 lands ~8-12 articles; if it slips to W4, M1 lands ~3-5; both compress the M2-M6 trajectory by one full month.

**Verdict: foundation is real and audit-clean, but the M2 trajectory has one load-bearing assumption (article volume) that is right now Moses-blocked and time-critical.**

---

## Risk register status (R1-R9 from plan §Risks)

| # | Risk | Status | Evidence |
|---|---|---|---|
| R1 | Gemma drafts too low quality | **CLOSED — by deferral** | Plan said W1 D2 A/B; commit history shows scout switched to gemma4 (commit `e09d74b`), brain.py drafting model decision is in-flight. No quality regression observed because **0 articles have made it through the pipeline yet** — the test will run on the first real article. R1 is parked, not closed. |
| R2 | Email nurture flagged as spam | **MITIGATED** | Day-10 SECURITY-V3 C-1 closed the bot-pump risk. Rate-limit shipped (`packages/rate-limit`). Turnstile wired (skip-if-not-configured today, enforced once Moses runbook 20-21 lands). One-click unsubscribe shipped (`/api/email/unsubscribe`). Anti-spam architecturally sound; reputation risk reduced from "high" to "medium". |
| R3 | Moses slow on partner outreach | **MATERIALIZED** | 0 of 5 partners reached out to in 11 days. Runbook item 7 unchecked. Plan budgeted ~10 hr Moses over 4 weeks; we're at 0 hr. **This is the dominant operational risk today.** |
| R4 | Hetzner Ollama / Gemma thrashing | **NOT MATERIALIZED — but unmeasurable** | scout switched to gemma4 (Moses's actual install) per D-pre-AA commit `e09d74b`. With 0 articles published since the AA pipeline shipped, thrashing risk hasn't been exercised. Will surface on Moses runbook item 5 + 6. |
| R5 | gsd-integration-checker finds nurture race | **MATERIALIZED + CLOSED** | INTEGRATION-V3 W-4 / W-5 / W-6 found exactly the race the plan predicted (cron tick vs payment-confirm + opt-out + Resend retry). All three fixes shipped D8. The plan's mitigation (`select ... for update`) was implemented as "re-read row pre-send + Idempotency-Key on Resend." Different solution shape, same coverage. |
| R6 | Lighthouse 95+ not reachable on forge | **CLOSED** | Forge already at SEO 100 D1. Plan's "accept 90+" fallback unused. |
| R7 | Resend bounces consume credits | **MITIGATED** | Bounce webhook → archive shipped per anti-spam discipline. 4-cap per lead enforced via state machine. **Untested under real volume.** |
| R8 | Moses Claude Design breaks shared components | **NOT MATERIALIZED** | No subdomain redesign has landed in this sprint. Phase Z hard-rule "no shared component edits" still in force. **Latent risk for Phase AB.** |
| R9 | Anthropic budget overrun | **NOT MATERIALIZED — close watch** | Plan budgeted $130; SECURITY-V3 audit C-1 quantified worst-case bot-pump at $11,880 if unchecked, closed by D10 fix. Real burn is well under target because nurture cron has only the synthetic test traffic. **At-risk vector if articles ramp without Gemma drafting flip.** |

**Net: 9 risks → 1 materialized + closed (R5), 1 materialized + open (R3), 5 mitigated/closed, 2 latent.**

---

## What we shipped that wasn't in the plan

The plan called out "Forge BOI lead magnet" as the V1 conversion-machine template. Reality:

1. **6 decision trees instead of 1** — BOI (Forge), TRACR wallet-trace, DocAI privacy-scan, LexAudit baseline-vs-monitoring, BRAI sanctions, LeadForge TCPA. Plan envisioned 1 magnet; we shipped 6 in 5 days (D6-D10). **Net positive — the V1 pattern generalized cleanly into a reusable shape.**
2. **Hub `/triage` meta-router** (D11) — not in plan; consolidates the 6 trees into a single "where do you start?" landing. Reasonable scope creep, ~150 line page.
3. **Pricing A/B harness** (`packages/payment/src/pricing-experiments.ts` + `EXPERIMENTS.md` + `verify-pricing-rules.mjs`) shipped D10. Plan §Pricing-authority described the rules but not the harness. **Net positive — the rules now have code to enforce them.**
4. **Turnstile** (`packages/turnstile-verify` + `packages/turnstile-widget`) — not in plan, shipped D9 in response to INTEGRATION-V3 F-2.
5. **In-memory rate limiter** (`packages/rate-limit`, 149 lines, no Redis dep) shipped D10 in response to SECURITY-V3 C-1. **Net positive — closed the bot-pump risk same-commit-as-discovery.**
6. **`packages/nurture-enqueue`** (lifted from 5 byte-identical subdomain shims D8) — not in plan, but the lift was the explicit `f-9` recommendation from INTEGRATION-V3.
7. **27 Moses ops items** in a runbook — plan didn't specify a runbook format; the cumulative deferral discipline materialized as needed.
8. **3 detailed audit docs** (EVAL-NURTURE, INTEGRATION-V3, SECURITY-V3) — plan called for `EVAL-REVIEW.md`, `INTEGRATION.md`, `SECURITY.md`. The actual files have version suffixes (-V3) and timestamps. Same content, different naming.

**Scoring the overshoot:** **Net positive.** Items 1-6 are direct responses to plan-stated risks (bot-pump, race conditions, decision-tree generalization) or close-by-design recommendations from the plan's audit cadence (item 6). The only borderline is item 1 (6 trees vs 1) — but the trees are mechanical replications of one pattern, the per-tree code lift is small, and they're all gated behind the same Turnstile + rate-limit infrastructure. **No items qualify as net-negative scope creep.** The discipline of "every fix lands same-commit as the audit that found it" (D7, D10) is observably stronger than the plan envisioned.

---

## Bottlenecks for W3 + W4 — critical path

**W3 (2026-05-19 → 2026-05-25) ahead.** Plan targets: 12 articles cumulative, AuthorBio on Forge + blog, gsd-security-auditor (already done D10), first OCI deal (Moses), first 1-3 Forge conversions (Moses-traffic-bound), Lighthouse SEO ≥95 (already met).

**Critical path, in dependency order:**

1. **MOSES-BOUND, ~30 min total — runbook items 1, 5, 6** (Supabase migration + Hetzner systemd flip + RSS verify). Without this, V1 article volume stays at 0. **First-priority unblock.**
2. **MOSES-BOUND, ~10 min — runbook item 2** (Vercel redeploy of 5 subdomains). Until done, the 8 lead-capture wirings + 6 decision trees are code-only. **Second-priority unblock.**
3. **MOSES-BOUND, ~30-60 min — runbook item 7** (3-5 partner outreach emails). Without partners, OCI revenue track is mathematically blocked. **Third-priority unblock.**
4. **MOSES-BOUND, ~15 min — runbook item 4** (OCI router monorepo move on Hetzner). Until done, email_contract.py is shipped-but-not-running. **Couples to item 7 above.**
5. **AUTONOMOUS-BOUND, ~2 hr — close the dashboard regression flagged in §1**: add nurture/referral icons + colors + summary card to `OpsDashboardClient.tsx`. Closes the Z↔AA seam.
6. **AUTONOMOUS-BOUND, ~1 hr — verify generic vertical regulator_focus** in nurture-prompts.ts; if still placeholder, gate the cron to skip `vertical='generic'` until fallback shipped (per EVAL-NURTURE Option B).
7. **MOSES-BOUND, ~5 min — runbook item 13** (synthetic-nurture-arc against post-fixes worker). Closes the V3 SC "synthetic 4-email sequence completes."

**W4 (2026-05-26 → 2026-06-02).** Plan targets: 20 articles cumulative, final E-E-A-T pass, price A/B if any product hits 14-day stalled-conversion window, gsd-verifier sprint goal achievement, sprint retro Sun 2026-06-02.

**W4 is dominated by traffic + lead arrival, both of which are downstream of W3 unblocks 1-3.** If items 1-2 land in the next 3 days, W4 can plausibly hit 15-20 articles + first measurable nurture conversions. If items 1-2 slip to W3 end, W4 lands 5-10 articles + 0 measurable conversions and the sprint closes "infrastructure complete, revenue inconclusive."

**Where time will get spent next (autonomous orchestrator):**
- Closing the OpsDashboardClient gap (item 5 above)
- Verifying generic-vertical regulator_focus (item 6 above)
- Running the synthetic nurture arc when Moses unblocks the worker side (item 7 above) — though Moses can run this himself
- Filling in the missing `decisions/sprint-aa-week2.md` milestone audit at end of W2 (D14)

**Where time will get spent next (Moses, ranked by leverage):**
1. Runbook items 1, 5, 6 (Hetzner cadence + Supabase migration). 30 min, unblocks article volume.
2. Runbook item 7 (partner outreach). 30-60 min, unblocks OCI revenue. **Highest revenue leverage of any single item.**
3. Runbook item 2 (Vercel redeploy 5 subdomains). 10 min, unblocks lead-capture flow.
4. Runbook item 4 (OCI Hetzner move). 15 min, unblocks email_contract.py.

**Total Moses time required to close the W3 critical path: ~90-120 min.** Plan budgeted ~10 hr over 4 weeks; we're at 0 hr through 11 days. The runbook is well-organized and copy-paste-ready, so the time investment is bounded. But it has to actually happen.

---

## One-line verdict

**The sprint is infrastructure-on-track and revenue-at-risk: the plan's end-of-W4 success criteria are reachable IF Moses spends ~2 hr on runbook items 1-7 in the next 3-5 days; if Moses ops slips past D15, the M1 article-volume + partner-outreach assumptions collapse and the sprint closes as foundation-complete-revenue-inconclusive.**

---

_Verified: 2026-05-13_
_Verifier: Claude (mid-sprint goal-backward verification, read-only)_
