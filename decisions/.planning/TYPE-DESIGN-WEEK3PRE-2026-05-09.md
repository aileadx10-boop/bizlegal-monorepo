# Type-Design Audit — Week 3 Pre-Flight (2026-05-09)

**Scope:** Lazy-init Proxy SDK pattern, Globe.tsx three.js ref drift, force-dynamic exports, sitemap GapPage type, DocAI MVP funnel files.

**Reviewer:** type-design-analyzer agent (Opus 4.7)

---

## Verdict

| Severity | Count |
|----------|------:|
| HIGH     | 4 |
| MED      | 6 |
| LOW      | 5 |
| **Total**| **15** |

**Status:** No ship-blockers. Improvement work for Week-3 refactor pass.

---

## HIGH

### F-1. `lazyClient` Proxy duplicated 3x with no shared abstraction; surface type is a lie
**Files:**
- `apps/docai/web/lib/supabase.ts:40-53`
- `apps/forge/apps/web/lib/claude/index.ts:4-16`
- `apps/forge/apps/web/lib/resend/index.ts:6-19`
- `apps/hub/lib/supabase.ts:9-30` (precedent)

All three implementations cast the real client to `Record<string|symbol, unknown>` and the value back to `(...args: unknown[]) => unknown`. Once you pierce the Proxy you have lost the `T` type entirely. The exported value is then re-asserted as `T`, so call sites look fully typed while the body has no type-checking. Three copies = three places to fix.

**Refactor:** Extract `packages/lazy-sdk/src/index.ts` with `apply` trap and `Reflect`-based traps. Prefer the function-only `getSupabase()` pattern at call sites — the type lie buys nothing.

### F-2. Proxy `get` trap is missing `apply`, `has`, `ownKeys` traps; `bind` is load-bearing but undocumented
**Files:** all three Proxy implementations (same defect)

`bind(real)` correctly preserves `this` for top-level methods (`supabase.from(...)`, `anthropic.messages.create(...)`, `resend.emails.send(...)`). But it returns non-function values raw without binding (Supabase's `auth`/`storage` getters are latent bugs), and there's no `apply`/`has`/`ownKeys`/`getOwnPropertyDescriptor` traps — so `JSON.stringify(supabase)` makes the proxy look empty. **The bind is load-bearing but has no comment** — a future simplifier removing it silently breaks every method call.

### F-3. `RedFlag.severity` is `string`, not `RiskLevel`
**File:** `apps/docai/web/lib/contract-analysis.ts:23-31`

`AnalyzeResult.risk_level: RiskLevel` is correctly typed as `"low" | "medium" | "high" | "critical"`. But `RedFlag.severity: string` is free-form, even though the prompt instructs Claude to return the same union. `report-view.tsx:35`, `:44`, `:16` all do runtime checks (`includes`, `toLowerCase`, `?? 2` fallback) that should be compile-time invariants.

### F-4. `risk_score: number` is unbranded — clamping is duplicated and bypassable
**Files:** `contract-analysis.ts:39`, `report-data.ts:14-27`, `report-view.tsx:18-20`

Risk score is supposed to be 0-100 integer. `normalizeScore` lives only in `report-view.tsx` and is not exported. `buildFallbackAnalysis` accepts arbitrary `riskScore: number` without clamping. Brand it: `type RiskScore = number & { readonly __brand: 'RiskScore_0_100' }` + `toRiskScore(n)` factory. Zero runtime cost.

---

## MED (6)

- **F-5.** `ai_content: AnalyzeResult | string | null` is an unsafe persistence-boundary union. Consumer that doesn't run `parseStoredAnalysis` could index `ai_content.red_flags` and have it pass type-check even when value is the literal string `'{"red_flags":[]}'`.
- **F-6.** `GapPage` row type is duplicated and incomplete — sitemap declares 3 fields, page.tsx consumes ~20 untyped. Will drift on column rename.
- **F-7.** `force-dynamic` route exports duplicated 40x — extract `DYNAMIC_ROUTE` constant. Low value alone; treat as cleanup-when-touched.
- **F-8.** `Globe.tsx` mixes two opposite escape hatches for the same drei type drift — `as unknown as RefObject<never>` (silent on upgrade) at `:28` and `@ts-expect-error` at `:51`. Standardize on `@ts-expect-error`.
- **F-9.** `gap.faqs` consumed as `{q,a}[]` but type narrowing is implicit — typo on column name renders `name: undefined`, schema validators reject silently.
- **F-12.** `verifyNOWPaymentsSignature` `Object.keys(payload).sort()` crashes on null/array/primitive JSON. Malformed webhook becomes 500 instead of 401.

---

## LOW (5)

- **F-10.** `ModuleResult` interface has `[key: string]: any` — textbook discriminated-union case across 14 verticals. Roll into next "add a vertical" PR.
- **F-11.** `VerticalType` union not co-typed with `VERB_PROMPTS: Record<string, ...>`. Compiler accepts a vertical with no prompt; throws at runtime.
- **F-13.** `InvoiceParams.successUrl?: string` could be a branded `AbsoluteUrl` — relative URL silently routes to NOWPayments default page.
- **F-14.** `ReportViewProps` carries `riskLevel`/`riskScore` redundantly with `analysis.risk_level`/`analysis.risk_score`. Caller could pass `riskLevel: "blue"` while analysis says `"critical"`.
- **F-15.** Empty `SAFE_LEAD_MAGNET_URLS` map; key normalisation undocumented (`Record<string, string>` doesn't encode normalised lowercase slug).

---

## Cross-cutting theme

The same anti-pattern shows up four times: **runtime fallbacks compensating for loose types** — F-3's `?? 2`, F-4's clamping in three places, F-9's implicit narrowing, F-12's missing JSON validation. Each is a place where a better type would have made the runtime check unnecessary, or moved the check to a single boundary.

A one-time pass — brand `RiskScore`, narrow `RedFlag.severity`, constrain `ai_content` — deletes roughly 20 lines of defensive code while making invariants enforced.

---

## Recommendations (priority order)

1. **F-1 + F-2** (HIGH): extract `packages/lazy-sdk` with `apply` + `Reflect`-based traps; migrate three files. ~one afternoon. **Single PR retires this AND silent-fail M-3 AND code-review H-1.**
2. **F-3** (HIGH): tighten `RedFlag.severity` to `RiskLevel`; remove runtime gates in `report-view.tsx`. Half a day.
3. **F-4** (HIGH): brand `RiskScore`, clamp at construction. Two hours.
4. **F-6** (MED): shared `GapPage` type used by sitemap + gap-page renderer + scout writer. One hour. **Unblocks W3.2 enrichment.**
5. **F-5, F-9, F-12** (MED+LOW): tighten persistence-boundary types where unsafe parsing happens today.
6. **F-8** (MED): standardise on `@ts-expect-error` for both Globe refs. Five minutes.
7. **F-10, F-11** (LOW): roll into next "add a vertical" PR.
8. **F-7** (LOW value alone): only worth doing if already touching all 40 routes.
9. **F-13, F-14, F-15** (LOW): cleanup-when-touched.
