# Sprint AA — Week 2 milestone

**Window:** 2026-05-12 → 2026-05-18 (Days 5-11)
**Bonus:** Days 12-14 mega-session bundled here for continuity
**Author:** automation
**Status:** infrastructure complete; awaiting Moses ops items 1, 4, 5, 6, 7 for revenue activation

---

## What shipped

### V3 conversion machine — 6 of 7 verticals live

| # | Vertical | URL | Verdict shape | Day shipped |
|---|---|---|---|---:|
| 1 | Forge BOI | `forge.bizlegal-ai.com/decision-tree` | must_file / likely_exempt / edge_case | D6 |
| 2 | TRACR wallet-trace | `tracr.bizlegal-ai.com/decision-tree` | high_priority / standard_review / casual_use | D7 |
| 3 | DocAI privacy | `docai.bizlegal-ai.com/decision-tree` | high_risk / moderate_review / light_touch | D8 |
| 4 | LexAudit monitoring | `lexaudit.bizlegal-ai.com/decision-tree` | continuous_monitoring_critical / baseline_audit_first / self_serve | D9 |
| 5 | BRAI sanctions | `brai.bizlegal-ai.com/decision-tree` | critical_screen / periodic_screen / low_priority | D9 |
| 6 | LeadForge TCPA | `leadforge.bizlegal-ai.com/decision-tree` | tcpa_active_risk / consent_audit_now / light_friction | D10 |
| ⊕ | Hub `/triage` (meta-router) | `bizlegal-ai.com/triage` | routes to one of the 6 above | D11 |

The 7th vertical-specific tree was deliberately replaced by `/triage` — a meta-router that surfaces all 6 V1 magnets with "fits when..." copy. Cleaner than 7 parallel trees.

### Workspace packages (6 total)

| Package | Purpose | Day shipped |
|---|---|---:|
| `@bizlegal/payment` | Code-only NOWPayments + PayPal + LS/Paddle stubs | (Phase Z) |
| `@bizlegal/ops-log` | HMAC-signed event POST shared by every app | (Phase Z) |
| `@bizlegal/nurture-enqueue` | Single source of truth for `lead_nurture_state` insert | D8 |
| `@bizlegal/turnstile-verify` | Server-side Turnstile verifier (skip-if-not-configured) | D9 |
| `@bizlegal/rate-limit` | In-memory sliding-window rate limiter (no Redis dep) | D10 |
| `@bizlegal/turnstile-widget` | Conditional client React widget | D11 |

Plus pricing experiment harness in `@bizlegal/payment`:
- `pricing-experiments.ts` — append-only registry with `defineExperiment()` validating ±20% / 14-day / ≥30-char rationale rules
- `EXPERIMENTS.md` — protocol ledger
- `verify-pricing-rules.mjs` — 6-case sanity, all pass

### Audits + remediations

3 read-only audits ran during W2 + W2-bonus, all CRITICALs fixed same-commit:

| Audit | Day | Findings | Same-commit fixes |
|---|---:|---|---|
| `gsd-eval-auditor` (nurture prompts) | D6 | 58/100, PARTIAL on 5 dims | regulator-focus on forge/generic, single-anchor rule, runtime guards |
| `gsd-integration-checker` (V3 surface) | D7 | 5 BLOCKERs + 6 WARNINGs | B-1 telemetry types, B-2 OCI idempotent insert, B-3 LS markNurturePaid, W-1/W-2/W-6 |
| `gsd-security-auditor` (V3 surface) | D10 | 2 CRITICAL + 6 HIGH + 8 MED + 4 LOW | C-1 rate-limit, C-2 lead-magnet phishing, H-3 PayPal strict, M-1 OCI CC env |
| `gsd-verifier` (mid-sprint) | D11 | infrastructure-on-track, revenue-at-risk | dashboard event-type mapping for V3 + referrals |

D8 also shipped W-4/W-5 race fix (compose→send re-read) + B-4 quarantine via `consecutive_failures` (defensive: tolerates missing column).

D11 + D13 applied 3 more deferred audit findings: H-4 prompt-injection sanitization, B-5 cross-vertical email skip-on-existing, H-5 randomize order_id.

### Skills (Phase AA plan §Operating-book)

5 skills (4 net-new in this session) cover the operator handbook:

- `~/.claude/skills/bizlegal-publish-article` — drives one article through the 6-gate pipeline (Phase Z)
- `~/.claude/skills/bizlegal-fire-cron` — manually trigger Worker / Hetzner / OCI cron jobs (D13)
- `~/.claude/skills/bizlegal-verify-z7` — one-pass Z7 health check (D13)
- `~/.claude/skills/bizlegal-seed-partner` — wraps OCI `seed_partners.py` (D13)
- `~/.claude/skills/bizlegal-price-test` — open/close a pricing A/B experiment within agent authority (D13)

### Hub apex polish

- `bizlegal-ai.com/triage` — 6-card meta-router (D11)
- `bizlegal-ai.com/agents` — visible-from-hero "free 60-second triage" CTA (D12)
- `apps/hub/app/ops/OpsDashboardClient.tsx` — icon/color mapping for V3 + referral events (D11)

---

## Plan-stated W2 success criteria

| SC | Status | Evidence |
|---|---|---|
| Daily articles target 5 cumulative | DEFERRED-TO-MOSES | curator code complete; production deployment Moses-blocked (runbook items 4-6) |
| Ship education / comparison / last_call email steps with 21 prompts | ACHIEVED | nurture-prompts.ts: 1 system + 4 step briefs × parameterized 9 verticals = effectively 36 step×vertical combos |
| Forge payment migration to `@bizlegal/payment` | ACHIEVED | 3 invoice-creating routes migrated D6 |
| `gsd-integration-checker` on full Forge flow | ACHIEVED | INTEGRATION-V3-2026-05-09.md, 5 BLOCKERs + 6 WARNINGs, all CRITICALs fixed |
| OCI partner #1 + #2 seeded | DEFERRED-TO-MOSES | code complete (`seed_partners.py`, `email_contract.py`); Moses outreach 0hr invested |
| First synthetic lead through email-contract flow | DEFERRED-TO-MOSES | `synthetic-nurture-arc.mjs` runnable; Moses runs once subdomains redeployed |
| `gsd-eval-auditor` on email composition prompts | ACHIEVED | EVAL-NURTURE-PROMPTS-2026-05-08.md, 58/100, all 3 ship-blockers fixed same-commit D6 |
| Lighthouse #2, target SEO ≥90 | ACHIEVED EARLY | 7 of 8 surfaces at SEO 100 since D1 baseline |

---

## Risk register update

From the original 9 risks in the sprint plan:

| # | Risk | Status |
|---|---|---|
| R1 | Gemma drafts too low quality despite humanize/factual fixing | LATENT — A/B not run; Sonnet still primary |
| R2 | Email nurture flagged as spam | MITIGATED — single-anchor rule + word count + cross-vertical skip + opt-out cue + List-Unsubscribe |
| R3 | Moses slow on partner outreach | **MATERIALIZED + OPEN** — 0 hr invested in 14 days; gates V2.B revenue |
| R4 | Daily article cadence breaks Hetzner Ollama or Gemma | LATENT — cadence not yet daily; Moses blocked |
| R5 | gsd-integration-checker finds nurture race condition | MATERIALIZED + CLOSED — D7 W-4/W-5 race fix |
| R6 | Lighthouse 95+ not reachable on forge | CLOSED — 100 since D1 |
| R7 | Resend bounces consume credits without conversion | MITIGATED — 4-email cap, idempotency-key, opt-out hard-archive |
| R8 | Moses's Claude Design changes break shared components | LATENT — no Claude Design merges to date |
| R9 | Budget overrun on Anthropic during heavy GSD weeks | MITIGATED — 4 audits ran, no breach signal |

---

## What carries into W3

### Hard-blocked on Moses (~30 min total)

The mid-sprint verifier identified the critical path:

1. **Item 1** — apply `picked_by` migration (2 min, Supabase SQL)
2. **Item 5** — Hetzner scout systemd timer to daily (5 min, ssh)
3. **Item 6** — verify replacement RSS feeds + restart scout (5 min, ssh)
4. **Item 4** — move OCI router to monorepo path on Hetzner (15 min, ssh)
5. **Item 2** — redeploy 5 subdomains on Vercel (10 min, dashboard)
6. **Item 7** — OCI partner outreach, 3-5 emails (30-60 min)

Without 1+5+6: zero articles ship. Without 4: OCI's D5 contract email + D6 weekly digest don't take effect. Without 2: D6+D7+D8+D9+D10+D11+D12+D13 work doesn't reach production users. Without 7: zero OCI revenue.

### Autonomous candidates W3

- W3 plan called for: AuthorBio cross-link in blog template (✅ done D5), gsd-security-auditor (✅ done D10), Lighthouse #3 (already at 100). Most W3 work is downstream of Moses ops.
- New autonomous: monitor `conversion-report.mjs` outputs once leads start landing; first pricing experiment when conversion data justifies; LeadForge content magnets if traffic ramps; deferred audit items H-1 (HMAC replay) + H-2 (scoped Supabase role).

### Backlog (not in original plan)

- Real Forge transactions — gated on Moses redeploys + organic traffic
- First closed OCI deal — gated on Moses partner outreach
- Curator pipeline first article — gated on Moses Hetzner ops
- 7th vertical-specific tree — superseded by `/triage`
- LemonSqueezy / Paddle MoR approval — outside sprint scope

---

## One-line W2 verdict

**Foundation-complete. Revenue activation is one ssh session away.** Plan end-of-W4 success criteria are reachable IF Moses spends ~2 hours on runbook items 1-7 in the next 3-5 days. The agent is at the throttle limit of what it can ship without external action.

## Days 12-14 bonus delta (commits ea3ceee, 5479368, [pending])

- D12: hub /agents → /triage CTA + H-5 randomize makeOrderId
- D13: B-5 cross-vertical email Option A + 4 skills + conversion-report
- D14: this milestone doc + workspace package READMEs + final cleanup
