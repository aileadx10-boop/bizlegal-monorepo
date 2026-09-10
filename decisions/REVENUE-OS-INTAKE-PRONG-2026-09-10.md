# Revenue OS — the intake prong lands on FirmCited (2026-09-10)

**Status:** decided · **Owner:** Moses · **Order:** O-023 (`C:/Users/Moshe Dor/orders/O-023-revenue-os-intake-prong.md`) · **Plan:** `~/.claude/plans/breezy-jingling-pascal.md`

## 1. What was asked

The KIMI WORKER master prompt (pasted 2026-09-10) reframes work around one sentence — *BizLegal-AI turns missed law-firm inquiries into booked consultations and clients* — and orders a Phase 0 relight (Anthropic credits, FirmCited price revert, endpoint checks) followed by a Stage 1 build: intake leak scan, intake capture + qualification + booking + follow-up, pilot reporting, three products, a 100-PI-firm outbound sprint. Success = five numbers (response rate, demo→payment, activation, ROI, month-4 retention).

## 2. What verification found (code, git, Vercel, production DB)

| Prompt said | Reality | Action |
|---|---|---|
| FirmCited at temp $20; `git revert 4ccce6a` after Gate-1 | `4ccce6a` was reverted by `1d0e56b`; `vertical.config.ts:60` = 490; live `/audit` shows $490 only | Revert **cancelled**; running it would reintroduce $20. O-017 rewritten. |
| Verify Anthropic with a forge `runModule` call | Forge model id `'claude-opus-4-5(20241120)'` was invalid — failed with or without credits | Fixed to `ANTHROPIC_MODEL ?? 'claude-sonnet-5'`; probe via `Firmcited/lib/claude.ts` instead |
| Prod 31 commits behind (night audit) | `9be4aea` deployed to all 9 Vercel projects 2026-09-09 | No merge step |
| tracr migration blocked on a `sbp_` token | Supabase MCP reaches prod | Applied 2026-09-10 |
| `inspectFirmSite` checks intake | It detects chat-vendor scripts + schema only | Leak scan = new detection logic + sourced benchmark |

FirmCited already contains ~80% of Stage 1: `POST /api/leads` (zod, honeypot, Turnstile, HMAC ingress), PI-first practice-area enum, local-model lead scorer with heuristic fallback, <60s speed-to-lead, day 1/3/7 nurture, 24h warm-follow-up drafts, Svix inbound email, JWT client portal, PayPal subscriptions ($299 / $2,000), a fail-closed 10-minute cron with 20+ jobs, and its own `planning/REVENUE-OS-10K-MRR.md`. Its speed-to-lead copy already sells "a 24/7 intake agent".

Live bugs on the exact path the pilot rail needs (prod SQL): `fc_outbound` still had the 0006 shape (no `reviewed_at`, kind/status CHECKs too narrow → `/ops` approve 500'd, reply drafts violated CHECK); `fc_inbound_replies` / `fc_unsubscribes` / `fc_leads.verification_status` missing → `/api/inbound` 500'd on every delivery; `OutboundQueue` destructured a prop named `key` → approve POSTed `?key=undefined` → 401; `fc_flags` had 0 rows (sender correctly failed closed). A 2026-09-04 burst of 120 recovery emails to 3 addresses was the dedup guard failing open — fixed 2026-09-08 in `05500c6`, no repeats since.

## 3. The four forks and what Moses chose

| Fork | Conflict | Choice |
|---|---|---|
| Authority | `REVENUE-OS-IDEAS-RATED-2026-09-07` killed idea 25 (Revenue OS SaaS) and 20 (marketplace); CLAUDE.md mission = compliance; FirmCited positioning LOCKED 2026-09-08 | **Spear, mission unchanged.** Stage 1 is FirmCited prong 5 ("Did it produce leads?"). Idea 25 is reopened **narrowly**: service-first pilots for PI firms, not seat SaaS. Idea 20 / Stage 5 (marketplace) stays killed. |
| Host | FirmCited (80% exists, CLI-only deploy) vs hub subtree vs new app | **FirmCited repo.** `fc_*` tables, existing cron. |
| Rail | Rule 7 v2 #6 bans cold mail via Resend; Instantly needs a domain + 2–4 weeks warm-up; G0 = 2026-09-20 | **Warm-first + Moses's own Gmail.** Machine drafts → `/ops` approval → external Gmail CLI, 10–20/day, verified published addresses only, CAN-SPAM footer. Instantly setup runs in parallel for post-G0 volume. |
| Leak scan | `inspectFirmSite` cannot see response time | **Site facts + verified benchmark.** Deterministic; the "consultations/month" estimate stays hidden until Moses flips `verified` on a sourced study; no test inquiry is ever sent to a firm. |

Standing assumptions: email-only v0 (the 12-day plan bans SMS/phone; no SMS vendor in the fleet); W2 v0 classification is zero-LLM with a cron-side, credit-gated LLM summary on redacted text; the performance add-on is a flat per-booked-consultation marketing fee (never contingent on retention or fees); "you owe us nothing" is a diagnostic-fee waiver, never an outcome guarantee; dead scaffolds untouched.

## 4. Phase 0 — shipped 2026-09-10

- Applied `supabase/migrations/20260909_tracr_wallet_leads.sql` (BRAI IPN no longer 500s on `payment_status`).
- Wrote + applied `Firmcited/supabase/migrations/0014_intake_os.sql`: re-asserts the 0011/0011b/0013 drift, seeds `fc_flags.OUTBOUND_ENABLED=false`, adds `fc_outbound.channel` (`resend|gmail`), `fc_email_log` channel columns, and the intake tables `fc_intake_scans`, `fc_firms`, `fc_intake_inquiries`, `fc_intake_events` (RLS on, service-role only).
- `components/OutboundQueue.tsx` + `app/ops/page.tsx`: `key` → `opsKey` (approve works).
- `app/api/inbound/route.ts`: insert failure → 200 + `fc_alerts` row instead of 500 (no Resend retry storm).
- `apps/forge/apps/web/lib/claude/index.ts`: valid model id via `FORGE_MODEL`.
- Practice-revenue analyzer verified end to end (`PR-2026-34a312ea46`).
- O-017 corrected; O-023 filed.

Phase 0 exit still needs Moses: Anthropic top-up (then one call through `Firmcited/lib/claude.ts`) and a real $490 Gate-1 purchase.

## 5. Stage 1 build order (FirmCited; one `vercel --prod` per step)

W1 leak scan (+ the `resendEligible` guard in `lib/outbound/send.ts` — gmail rows are invisible to Resend) → W2 intake (hosted form + `intake+<slug>@` forwarding, never-500 service) → W3 follow-up (24h/72h/168h, ≤90 d, parked never deleted) → W4 reporting (`fc_deliverables` nightly, portal Intake tab, weekly email) → W5 outbound (PI ICP, `leak-scan-pitch` drafts, Gmail export script, `five-numbers.mjs`) + offers `intake_pilot_setup` 2000 / `intake_monthly` 750 / `intake_pro_monthly` 1500. Full file map in O-023 and the plan file.

## 6. Rule mapping

- Rule 5 (AI never a lawyer): `CLERK_SYSTEM` + `FORBIDDEN_RE` + a forbidden-phrase test on every template.
- Rule 6 (no fee splitting): booked consultations only; flat fee; Moses checks the state-bar rule per pilot state.
- Rule 7 (TCPA): moot — email-only; opt-out link on every follow-up; ≤90-day inquiries only.
- CLAUDE.md rule 7 v2: verified published addresses, `source_url`, suppression inside the sender, caps fail-closed (`fc_flags` row missing → blocked), per-campaign human approval, never Resend for cold.
- Introvert doc: demo = scan page + written memo; no call anywhere on the path.

## 7. Moses ops accumulated

Anthropic top-up · real $490 Gate-1 buy · `vercel --prod` per step · Resend inbound route + `RESEND_WEBHOOK_SECRET` · vault names `PAYPAL_PLAN_ID_INTAKE_MONTHLY`, `PAYPAL_PLAN_ID_INTAKE_PRO_MONTHLY`, `INTAKE_INBOUND_DOMAIN`, `LEGAL_OS_CLI`, `LEGAL_OS_PYTHON` · approve drafts / run the Gmail export / mark bookings · flip `INTAKE_BENCHMARK.verified` after reading the source · state-bar check · batch: GSC token, OPS_DASHBOARD_TOKEN, NOWPayments rotation · Instantly domain (post-G0).
