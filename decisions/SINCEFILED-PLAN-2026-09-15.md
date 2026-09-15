# SINCEFILED PLAN — Reddit Plan #2: anti-streak compliance tracker for law firms

**Date:** 2026-09-15 · **Status:** APPROVED by Moses (C/R/C: 1 yes · 3 both packs · 4 $329 lifetime) · **Name:** SinceFiled (placeholder — "SinceWhen?" is the source app's trademark, red zone; override with ComplyWhen/FiledSince if desired)
**Source:** Reddit — SinceWhen post ($1,559 sales, lifetime drove revenue, free ≤3 events funnel, no-streak positioning)
**Order:** `C:/Users/Moshe Dor/orders/O-026-reddit-plan-2-sincefiled.md` · **Builds after:** O-025 CasePage scaffold exists · **G0 (09-20) still comes first**

---

## 1. Product

**One sentence:** SinceFiled quietly counts the days since a law firm's irregular obligations were last done — and predicts when they're actually due — with zero guilt, zero streaks, and zero missed deadlines.

Legal compliance is the canonical "irregular life maintenance" problem: obligations recur at 30/90/365-day intervals, habit trackers punish rather than help, and a missed deadline is malpractice exposure. Pure liability shrinker with a natural B2B buyer.

## 2. Core features (mingled from the source + fleet)

| # | Feature | Adaptation | Revenue lever | Liability shrinker |
|---|---|---|---|---|
| 1 | Anti-streak days-since counter | Per-obligation "days since / days until" — no red rings, no failure states | Core free value (≤3 events) | Tone rule: UI says "predicted due", NEVER "you are late" — shaming copy in a compliance context invites negligence claims |
| 2 | Smart rhythm predictions | Learns firm's natural cadence per obligation type; predicts actual due date | $49/mo plan unlock | Prediction labeled "estimate — verify against jurisdiction rules"; disclaimer auto-appended |
| 3 | Frictionless logging | Email/WhatsApp reply "done" → logged via existing fleet rails (Siri is iOS-only; firms live in email) | retention hook | Auth via tokenized email links, no passwords to leak |
| 4 | Free ≤3 events funnel | SinceWhen's exact paywall mechanics | conversion engine | — |
| 5 | Lifetime tier $329 | "Refuge from subscription-only apps" (confirmed by BOTH SinceWhen and Local TTS data points) | cash now, funds runway | — |
| 6 | Obligation packs | US state-bar pack (CLE, dues, filings) + Dubai pack (trust recon, DLD service-charge clearance, Oqood renewals) — **Moses reviewed each pack** (named-human-reviewer) | pack-per-vertical SEO | Pack content gated behind review like deal-engine `reviewed: true` — machine-translated or unreviewed deadline text never ships |

## 3. Legal copycat boundary

- 🟢 Green: interval-tracking concept, days-since counters, rhythm prediction, free-tier funnel, lifetime pricing — clean-room build.
- 🟡 Yellow: prediction/UX tone (see table); localize marketing freely but obligation CONTENT ships only in its jurisdiction's locale (same wall as CasePage addendum).
- 🔴 Red: "SinceWhen" name (source trademark — flagged to Moses), their code, App Store listing, artwork, UX copy.

## 4. Revenue stack & 6-month math

| Tier | Price | What |
|---|---|---|
| Free | $0 | Up to 3 events, 1 user (the funnel) |
| Firm | $49/mo | Unlimited events, team seats, email/WhatsApp logging, predictions |
| Lifetime | $329 one-time | Firm plan, forever |
| Pack add-ons | $29–49 one-time | Additional jurisdiction packs beyond the first |

**Ramp (conservative):** M1–2 = Rezi pattern first — sell **Compliance Rhythm Pack** ($19 PDF: trust-recon tracker + renewal calendar + CLE sheet) via hub checkout on r/lawfirm + blog; M3 = 12 firms × ~$35 avg = $420/mo + ~6 lifetimes ($1,974); M4–5 = 25 firms ≈ $875/mo; M6 = 35 firms ≈ $1.7k/mo + lifetime drip. **Combined with O-025 CasePage: $3.5–5k/mo at month 6** — clears the $2–3k goal with margin.

## 5. Costs

| Item | Cost |
|---|---|
| Infra | $0 marginal (Vercel/Supabase/Resend/Turnstile already in fleet) |
| Domain | $0 if served under `sincefiled.bizlegal-ai.com` |
| Anthropic credits | shared with the G0 top-up (~$20–50) |
| Build | ~30–40 agent-hours — rides O-025 scaffold (auth, billing shell, dashboard) |
| **Total cash** | **<$50** |

Stack: `apps/sincefiled` (or second tenant on the CasePage app), Supabase `sf_*` tables, `@bizlegal/payment` products `sf_firm_49` + `sf_lifetime_329` + `sf_pack_*`, hub `/api/pay/start`, ops spine. Zero new vendors.

## 6. Build order (Kimi Code)

1. Scaffold on CasePage base (auth, dashboard shell, billing already wired)
2. Supabase migration draft: `sf_firms`, `sf_obligations`, `sf_events` (log), `sf_predictions`, `sf_subscriptions` — DRAFT, show before applying
3. Obligation engine: pack-based seed data (US + Dubai packs, Moses-reviewed), days-since/days-until counters, no-streak UI (zero red/failure states)
4. Prediction v1: simple interval-from-history heuristic (no LLM needed at v1 — deterministic = no credits burned)
5. Logging rails: tokenized email "done" link + WhatsApp-style deep link stub
6. Paywall: ≤3 events free → hub checkout (`sf_firm_49`, `sf_lifetime_329`) → entitlement flip
7. Rezi-pattern PDF pack: `sf_pack_us_19` / `sf_pack_both_29` via hub checkout, automated fulfilment (Resend)
8. SEO: 20 long-tail pages ("trust account reconciliation checklist", "CLE deadline tracker [state]", "Dubai DLD service charge clearance guide")
9. Ops-log every route + Five-numbers endpoint
10. E2E verify

## 7. Kimi Code master prompt (paste-ready)

```
Read C:\Users\Moshe Dor\bizlegal-monorepo\decisions\SINCEFILED-PLAN-2026-09-15.md — it is the approved spec. Build it.

GOAL: Ship "SinceFiled" — a zero-guilt, anti-streak compliance-rhythm tracker for small law firms — reusing the apps/casepage scaffold (auth, dashboard shell, hub billing) in the bizlegal-monorepo.

HARD CONSTRAINTS (same fleet rules as CasePage):
1. WAT conventions: workflows/ SOPs + deterministic tools/; reuse existing tools first.
2. Money: hub /api/pay/start → payment_orders → IPN HMAC fail-closed → Resend fulfilment. Products: sf_firm_49, sf_lifetime_329, sf_pack_us_19, sf_pack_both_29. NOWPayments + PayPal only.
3. Ops spine on every route (x-bizlegal-signature). Turnstile + Upstash on capture. RLS on. Never log secrets.
4. Tone shield: UI NEVER says "late"/"missed"/"overdue" — only "days since", "predicted due", "estimate — verify against jurisdiction rules". Disclaimer auto-appended on every prediction. No outcome guarantees.
5. Obligation packs: seed data files ONLY from packs/ directory; mark unreviewed packs `reviewed: false` and hide them (same gate as deal-engine ae-dubai-residential).
6. NO deploy, NO prod Supabase migration without my explicit approval. Build + typecheck + local E2E only.
7. Do not touch W0/G0 (FirmCited Gate-1) or apps/casepage work in progress.

BUILD ORDER: per spec §6 (items 1–10).

VERIFY: typecheck + build clean; local E2E: create firm → seed 3 obligations → log event via tokenized email → counter updates → paywall at 4th event → sandbox checkout → IPN sim → entitlement → PDF pack purchase → fulfilment email → ops-log rows. Report shipped hashes, verified local URLs, blocked items.

Do NOT ask me what to build — the spec file decides. Only ask if a constraint conflicts with a feature.
```

## 8. Acceptance (O7)

- typecheck + build clean
- E2E green per §7
- Zero "late/missed" strings anywhere in UI copy (grep proof)
- Packs respect `reviewed` gate
- No deploy until Moses approves
