# Audit Synthesis — Week 3 Fix Plan (2026-05-09)

**Audits consolidated:**
- `SILENT-FAIL-WEEK3PRE-2026-05-09.md` (silent-failure-hunter)
- `SEC-REVIEW-WEEK3PRE-2026-05-09.md` (security-reviewer)
- `TYPE-DESIGN-WEEK3PRE-2026-05-09.md` (type-design-analyzer)
- `CODE-REVIEW-WEEK3PRE-2026-05-09.md` (gsd-code-reviewer)

**Production state at synthesis time:** Z7 GREEN (rows 1-8 + 10 verified). CRIT fixes (PR #17) and hub theme (PR #18) pending merge.

---

## Verdict

| Severity | Silent-fail | Security | Type-design | Code-review | **Total** |
|----------|------------:|---------:|------------:|------------:|----------:|
| CRITICAL |     2 (FIXED #17) |        0 |           — |           0 |         **0 open** |
| HIGH     |           6 |        0 |           4 |           4 |        **14** |
| MED      |           7 |        2 |           6 |           8 |        **23** |
| LOW      |           3 |        4 |           5 |           6 |        **18** |

**Ship verdict (all four audits):** SHIP — not blocked. Improvement work for Week 3 refactor pass.

---

## High-leverage cross-cutting fixes

These three fixes retire 7+ findings each and are the highest ROI in the Week 3 refactor pass:

### A. Lazy-SDK consolidation
**Retires:** silent-fail M-3 + type-design F-1 + F-2 + code-review H-1 (4 findings)

5 different `lazyClient`/Proxy implementations across `apps/forge/apps/web/lib/{claude,resend}/index.ts`, `apps/docai/web/lib/supabase.ts`, `apps/forge/apps/web/app/api/lead-magnet/route.ts`, `apps/forge/apps/web/app/sitemap.ts`. Same Proxy pattern, slightly different shapes, all assert `T` after losing the type inside the trap.

**Plan:** Extract `packages/lazy-client/src/index.ts` with `apply` + `Reflect`-based traps. Migrate 5 call sites. ~one afternoon.

### B. requireEnv helper for SDK constructors
**Retires:** silent-fail H-1 + code-review (top-3 ask) + parts of M-1/M-3 (3+ findings)

`process.env.X ?? ''` in lazy-init constructors silently constructs broken clients that fail later as misleading 401s. Affects `forge/lib/claude/index.ts:7`, `forge/lib/resend/index.ts:9`, multiple subdomain Supabase factories.

**Plan:** Add `packages/lazy-client/src/require-env.ts` that throws a named error at first prop access. Migrate ~6 SDK constructors. ~2 hours.

### C. Force-dynamic rollout completion
**Retires:** code-review (top-3 ask) — 11 routes

5 docai routes (`agents/{analyze,draft,generate,review}`, `documents/upload`) and 6 forge routes (`passport`, `passport/process`, `scan`, `scan/report`, `surplus/qualify`, `decision-tree/lead`) consume the new lazy-init Claude/Resend but lack `export const dynamic = 'force-dynamic'`. Today inert (POST-only) but a tripwire for the next GET handler.

**Plan:** Bulk add to all 11 routes, extract `DYNAMIC_ROUTE` constant in `lib/route-config.ts`. ~1 hour.

---

## DocAI funnel type tightening (ROI: deletes ~20 lines of defensive code)

### D. RedFlag.severity narrowing — type-design F-3
`AnalyzeResult.risk_level: RiskLevel` is correct. `RedFlag.severity: string` is free-form, even though prompt says same union. `report-view.tsx:35`, `:44`, `:16` do runtime checks (`includes`, `?? 2` fallback) for what should be compile-time invariants.

**Plan:** Tighten type, run `normalizeRiskLevel` on each red_flag in `enrichAnalyzeResult`. Drops `?? 2` fallback + `["critical","high","medium"].includes(...)` gate.

### E. RiskScore branding — type-design F-4
`risk_score: number` is unbranded. `normalizeScore` lives only in `report-view.tsx`. `buildFallbackAnalysis` accepts arbitrary number without clamping.

**Plan:** `type RiskScore = number & { readonly __brand: 'RiskScore_0_100' }` + `toRiskScore(n)` factory. Zero runtime cost.

### F. ai_content persistence-boundary — type-design F-5
`ai_content: AnalyzeResult | string | null` lets a consumer that doesn't run `parseStoredAnalysis` index `ai_content.red_flags` and have it pass type-check while being a string.

**Plan:** Two-layer `RawScanRow` (string only) → `ScanRow` (parsed only). Force every consumer through `parseStoredAnalysis`.

---

## Other HIGH findings (defer to W4 or batch into above)

### G. silent-fail H-2: forge sitemap try/catch swallows ALL errors
One-line fix during the lazy-SDK refactor — bring up to minimum-log bar.

### H. silent-fail H-3: lead-magnet `.catch(console.error)` on Telegram + Resend
No ops event. Use `nurture-enqueue` pattern (already exists in `services/worker`) for retry.

### I. silent-fail H-4: docai webhook checks `error` per-candidate but not `count`/affected-rows
Silent no-op on filter mismatch = lost payment record. PostgREST `.or()` filter raw candidate is also flagged in security MED-N2 — bundle.

### J. silent-fail H-5: webhook + scan + invoice routes return SDK error message verbatim
Information disclosure. Standardize on `{ error: 'internal_error', code: '...' }` shape with full detail in ops_log only.

### K. silent-fail H-6: forge claude.ts JSON parse failures lose Claude response details
Log full response with redaction to ops dashboard.

### L. type-design F-6: `GapPage` row type duplicated and incomplete
**Unblocks W3.2 enrichment.** Extract `apps/forge/apps/web/lib/types/gap-page.ts`. ~1 hour.

---

## MEDIUM findings (cleanup-when-touched)

### Security MED-N1: `javascript:` href in DocAI report-view
`apps/docai/web/components/report-view.tsx:132`. XSS surface. Replace with onClick handler.

### Security MED-N2: PostgREST `.or()` filter raw candidate in DocAI webhook
`apps/docai/web/app/api/payment/webhook/route.ts:36-47`. Should use parameterized `.eq()` joins.

### Code-review MED items
Bundled into the lazy-SDK refactor where applicable; rest deferred.

---

## LOW findings (next-touch cleanup)

- Security LOW-N1: webhook idempotency missing
- Security LOW-N2: docai payment routes lack rate-limit (forge already has `@bizlegal/rate-limit`)
- Security LOW-N3: OCI_REFERRAL_CC env-driver consistency miss
- Security LOW-N4: non-constant-time NowPayments signature compare (use `crypto.timingSafeEqual`)
- Type-design F-10/F-11: ModuleResult discriminated union, VerticalType co-typing — roll into next vertical-add PR
- Type-design F-13/F-14/F-15: AbsoluteUrl branding, ReportViewProps redundant fields, SAFE_LEAD_MAGNET_URLS key normalization

---

## Pre-existing cleanup (out of audit scope, flagged for awareness)

- `apps/forge/forge` contains an expired Vercel OIDC dev token (committed 2026-05-02 at `2ad29f9`, `iat:1774707567` `exp:1774750767`). Not a live credential. Delete from working tree, gitignore.

---

## Recommended execution order

Sprint structure: **Week 3 = content engine** (per Moses directive). The fixes below run AS A PARALLEL refactor pass that does not block content velocity.

### Track 1 — Refactor (interleave with W3 content work)
1. **A + B + C** as a single PR — `packages/lazy-client` + `requireEnv` + force-dynamic completion
2. **D + E + F** as a single PR — DocAI type tightening
3. **L** standalone PR — GapPage type → unblocks W3.2

### Track 2 — Content engine (Moses approved plan)
- W3.1 curator_runs observability
- W3.2 gap_pages enrichment (depends on **L**)
- W3.3 sitemap-index
- W3.4 GSC verification + indexing monitor

### Track 3 — Defer to W4+
- All MEDIUM + LOW findings
- G, H, I, J, K (silent-fail HIGH items not in Track 1)
- Pre-existing OIDC token cleanup

---

## Key wins the audits CONFIRMED

The audits independently verified that:

1. **All 5 lazy-init Proxy refactors are SAFE** — no race conditions, no env shadowing, no leaked secrets, backwards-compatible (security audit explicit verdict).
2. **C-1 + C-2 (silent-fail) fixes have landed** in PR #17 and resolve the only ship-blocking findings.
3. **Phase AA security baseline** (rate-limit + lead-magnet allow-list + PayPal preview-deploy) is intact and the Phase AA payload is live across all 7 subdomains.
4. **OCI Python additions** (`email_contract.py`, `seed_partners.py`, `payout_reconciler.py`) are the **quality benchmark** for the rest of the codebase — exemplary docstrings, telemetry, idempotency notes (code-review explicit callout).

Net: ship-ready for Week 3. Refactor pass is ROI-positive but not blocking.
