# Code Review — Week 3 Pre-Flight (2026-05-09)

**Scope:** Commits `b81bf0e..a3e16c2` — ~16 PRs covering Vercel build unblock (lazy-init Proxy, `force-dynamic`, `outputFileTracingRoot`, corepack vercel.json), MVP funnel ship (docai contract scan), OCI router additions (email_contract, seed_partners, payout_reconciler), Globe.tsx type drift workarounds, command-menu cmdk pin, and forge homepage debrand.

**Reviewer:** code-reviewer (Opus 4.7 1M).

**Pillars covered:** Logic, Quality, Performance, Maintainability, Convention. Security and silent-failure findings explicitly deferred — see *Companion docs* below.

---

## Companion docs (no overlap below)

This review **does not** restate findings from:

- `SILENT-FAIL-WEEK3PRE-2026-05-09.md` — covers C-1/C-2 lost-lead writes, `process.env.X ?? ''` H-1, sitemap try/catch H-2, Resend `.catch(console.error)` H-3, docai webhook count check H-4, error-message verbatim disclosure H-5, JSON-parse loss H-6, Globe `as unknown as RefObject<never>` L-1.
- `SEC-REVIEW-SITESHELL-2026-05-07.md` — covers S-1 Turnstile gap, S-2 inline `<script>`/`<style>` CSP surface, FOUC injection verification.
- `TYPE-DESIGN-PHASE-AA-2026-05-07.md` — covers F-1 `ThemeSpec.vars` Record→keyed, F-2 `LeadSubmitResult` discriminated union, F-3 `applyTheme` runtime fallback, F-5/F-7 nav/sticky.
- `SILENT-FAIL-PHASE-AA-2026-05-07.md`, `COMMENT-AUDIT-PHASE-AA-2026-05-07.md`, `A11Y-AUDIT-PHASE-AA-2026-05-07.md` — pre-Week-3 themes-package audits.

If a finding here looks like it touches one of those, it does so from a **different angle** (DRY, perf, maintainability) and is annotated.

---

## Executive Verdict

| Severity | Count |
|----------|------:|
| CRITICAL | 0     |
| HIGH     | 4     |
| MEDIUM   | 8     |
| LOW      | 6     |
| **Total**| **18** |

**Ship-block decision:** **DO NOT BLOCK on this review alone.** The two CRITICAL findings flagged for Week 3 live in `SILENT-FAIL-WEEK3PRE-2026-05-09.md` (C-1/C-2 lost-lead writes). Everything in this document is improvement work — most of it would benefit from being batched into a single "lazy-init hardening" PR rather than blocking deploy.

**Headline pattern issues:**
1. The `lazyClient(getter)` Proxy pattern is duplicated across **5 files in 4 distinct shapes** (3 reviewed in this PR set, 2 pre-existing). DRY violation; ripe for `@bizlegal/lazy-client` package.
2. `force-dynamic` is applied **inconsistently** across docai (17 routes covered, 5 missed) and is **not applied at all** in forge — even on routes that import lazy-init Claude/Resend modules.
3. The `Globe.tsx` type drift is patched **with two different escape hatches in the same component** (one `as unknown as RefObject<never>`, one `@ts-expect-error`) for what is almost certainly the same root cause.
4. `corepack pnpm install --ignore-scripts` is universal across the 6 vercel.json files — the rationale is undocumented and the trade-offs (skipped postinstall hooks, no Husky, no Sharp setup) deserve a comment.

The well-done parts: docai's `force-dynamic` rollout is **mostly** correct (17/22 routes); the OCI Python additions (`seed_partners.py`, `payout_reconciler.py`, `email_contract.py`) are well-organized, have docstrings explaining "why this is separate from notify.py," and follow consistent error-handling patterns with `log_event`. The forge homepage debrand commit is exemplary — small, scoped, with a commit body that explains exactly which "AI" mentions stayed and why.

---

## HIGH

### H-1. `lazyClient`/Proxy pattern duplicated 5 ways across the monorepo — DRY violation, divergent semantics

**Files:**
- `apps/docai/web/lib/supabase.ts:42-50` — *new in this PR set* — closure-based `lazyClient(getter)` helper, exports `supabase` + `supabaseAdmin`
- `apps/forge/apps/web/lib/claude/index.ts:5-16` — *new* — function + module-level Proxy, anonymous binding helper
- `apps/forge/apps/web/lib/resend/index.ts:7-19` — *new* — function + module-level Proxy, anonymous binding helper
- `apps/hub/lib/supabase.ts:9-30` — *pre-existing* — `lazyClient(keyResolver)` helper takes the **key resolver**, not the **client getter**, and throws inside `init()` not in the resolver
- `apps/tracr/lib/supabase.ts:28-40` — *pre-existing* — hand-rolled object literal with `from: (...args) => getSupabase().from(...args)` and a separate Proxy for `auth`/`storage`

**Why it matters (Quality + Maintainability):** Five subtly different implementations of the same idea. Each handles missing env differently:
- docai: throws in `readEnv()` at first prop access, includes service key requirement
- hub: throws in `init()` at first prop access, only requires URL + key
- forge claude/resend: silently constructs `new Anthropic({apiKey: ''})` — defers the error to first API call as a misleading 401 (also flagged as H-1 in `SILENT-FAIL-WEEK3PRE`)
- tracr: only proxies `from`, `auth`, `storage` — any other Supabase method (`.rpc`, `.storage.from(...)`, `.realtime`) silently breaks

A new dev modifying any one of these has no way to know the other four exist or what their contract is. The next env-var bug will get fixed in one place and reintroduced in the others.

**Suggested fix:** Extract a shared `@bizlegal/lazy-client` workspace package with a single `lazyProxy<T>(factory: () => T): T` helper. Standardize on the docai shape (factory returns the real client; helper handles Proxy). Migrate all five sites in one PR. Pin TypeScript to a version that supports the new construct.

**Severity rationale:** HIGH because the divergence is already producing different runtime behavior for the same logical concern. CRITICAL only if the H-1 silent-fail in `SILENT-FAIL-WEEK3PRE` lands in production unfixed.

---

### H-2. `force-dynamic` rollout is inconsistent — 5 docai routes and **all** forge `lib/claude` consumer routes are missing it

**Files (docai missing `dynamic = 'force-dynamic'`):**
- `apps/docai/web/app/api/agents/analyze/route.ts:1-7`
- `apps/docai/web/app/api/agents/draft/route.ts`
- `apps/docai/web/app/api/agents/generate/route.ts`
- `apps/docai/web/app/api/agents/review/route.ts`
- `apps/docai/web/app/api/documents/upload/route.ts`

**Files (forge — none have `force-dynamic` despite consuming lazy clients):**
- `apps/forge/apps/web/app/api/passport/route.ts` (createServerClient + createNowPaymentsInvoiceRaw)
- `apps/forge/apps/web/app/api/passport/process/route.ts` (runPassportAssessment + sendPassportDelivery)
- `apps/forge/apps/web/app/api/scan/route.ts` (runModule)
- `apps/forge/apps/web/app/api/scan/report/route.ts`
- `apps/forge/apps/web/app/api/surplus/qualify/route.ts` (qualifyCase)
- `apps/forge/apps/web/app/api/decision-tree/lead/route.ts`

**Why it matters (Logic + Convention):** The fix in PR #14 says these routes were broken at build because `new Anthropic()` and `new Resend()` were called at module load. The lazy-init Proxy makes module load safe, but Next.js can still attempt to **statically analyze and prerender** `GET` routes that don't opt out. Today the routes here are all `POST`, which Next never prerenders, so the omission is **functionally inert** for these specific files — but:
1. Anyone adding a `GET` to the `agents/*` or `passport/process` route in a future PR will trip the same trap (env not present at build → broken function path)
2. `force-dynamic` is also a self-documenting marker that "this route requires runtime env" — without it, a reviewer can't easily tell that `agents/analyze` differs from a pure utility route
3. Forge's `inbound-lead`, `lead-magnet`, `decision-tree/lead` got `force-dynamic`; the others didn't. Inconsistency is itself the smell.

**Suggested fix:** Add `export const dynamic = 'force-dynamic'` to all routes that import a lazy-init module (`lib/claude`, `lib/resend`, `lib/supabase`, `supabase/server`). Better: add a one-line lint rule or a `runtime.ts` re-export so the entire `app/api/**` tree applies it once.

**Severity rationale:** HIGH for convention consistency, MEDIUM for actual deploy risk (only POST handlers in scope today). Will become CRITICAL the moment anyone adds a GET handler to one of the missed routes.

---

### H-3. `apiKey: process.env.ANTHROPIC_API_KEY ?? ''` constructs a broken client at first use — but throws a 401 from Anthropic, not a clear "missing env" error

**Files:**
- `apps/forge/apps/web/lib/claude/index.ts:7`
- `apps/forge/apps/web/lib/resend/index.ts:9`

**Already flagged** as H-1 in `SILENT-FAIL-WEEK3PRE` for the silent-failure angle. **Adding here for the maintainability angle:** even if the silent-fail H-1 gets a `requireEnv()` helper, the **structure** of the lazy getter is wrong. The getter promises "lazy init" but the factory body unconditionally calls `new Anthropic({...})`. There is no second deferral.

```ts
// current — fails at first request with confusing upstream error
function anthropicClient(): Anthropic {
  if (_anthropic) return _anthropic
  _anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' })
  return _anthropic
}
```

**Suggested fix:** Throw with a clear ops message:

```ts
function anthropicClient(): Anthropic {
  if (_anthropic) return _anthropic
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    throw new Error('[forge:claude] ANTHROPIC_API_KEY missing at request time')
  }
  _anthropic = new Anthropic({ apiKey: key })
  return _anthropic
}
```

**Why this is a code-review angle, not duplicate of silent-fail:** The fix above also satisfies the **caller-trust contract**: a client returned from this function is guaranteed valid. The `?? ''` shape encourages "let runtime sort it out" thinking that propagates across the codebase.

---

### H-4. `Globe.tsx` mixes two different TypeScript escape hatches for the same drei→three.js drift in one component

**File:** `apps/hub/components/hero/Globe.tsx:25-28, 51-52`

**Issue:**
```tsx
{/* @types/three vs @react-three/drei type drift — drei's Sphere ref expects
    Mesh<BufferGeometry<…, BufferGeometryEventMap>>, but THREE.Mesh widens to
    BufferGeometry<NormalBufferAttributes>. Cast through unknown. */}
<Sphere ref={meshRef as unknown as RefObject<never>} args={[1.8, 64, 64]}>
  ...
</Sphere>

{/* @ts-expect-error -- @types/react vs @react-three/fiber Group ref drift */}
<group ref={ringsRef}>
```

The first uses an `as unknown as RefObject<never>` cast — silent at compile time, **never** errors out if the underlying drift gets fixed (the cast becomes an expensive no-op). The second uses `@ts-expect-error` — **does** error if the drift gets fixed (compile breaks until the directive is removed).

The two patterns have opposite maintenance properties. Mixing them in one file means upgrading `@react-three/fiber` later will only signal one of the two sites — the other will silently keep its dead cast.

**Why it matters (Quality + Maintainability):** Either the drift is ephemeral (use `@ts-expect-error` everywhere — gets cleaned up automatically on upgrade) or it's load-bearing (use the cast everywhere — accept the maintenance debt). Don't mix.

**Suggested fix:** Standardize on `@ts-expect-error` for both sites with a shared comment block above the component:

```tsx
// drei + @types/three drift — both refs use @ts-expect-error so the next
// upgrade signals when the cast is no longer needed.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error: drei Sphere ref expects narrowed Mesh
<Sphere ref={meshRef} args={[1.8, 64, 64]}>
```

**Severity rationale:** HIGH for maintainability — this is a tripwire for the next dependency upgrade. Everything else here is suggestion-level.

---

## MEDIUM

### M-1. `lazyClient` Proxy `get` trap binds **every** function call — measurable per-call overhead on hot paths

**Files:**
- `apps/docai/web/lib/supabase.ts:42-50`
- `apps/forge/apps/web/lib/claude/index.ts:10-16`
- `apps/forge/apps/web/lib/resend/index.ts:13-19`
- `apps/hub/lib/supabase.ts:23-29`

**Issue:**
```ts
function lazyClient(getter: () => Sb): Sb {
  return new Proxy({} as Sb, {
    get(_t, prop) {
      const real = getter() as unknown as Record<string | symbol, unknown>
      const v = real[prop]
      return typeof v === "function" ? (v as (...args: unknown[]) => unknown).bind(real) : v
    },
  })
}
```

Every single `supabase.from('x').select()` call now goes through:
1. Proxy `get('from')` → call `getter()` (just returns memoized `_supabase`)
2. Read `_supabase.from` → it's a function → `bind(_supabase)` creates a **new Function object** each call

The `.bind(real)` per-call allocation is the issue. For a hot endpoint serving 100 req/s, that's 100+ `Function.bind` calls per request lifecycle (each chained method `.from().select().eq()` triggers another). Not catastrophic, but for the intended use ("backwards-compatible Proxy exports") this is paying perf for backward compat that isn't needed in any of the new call sites — they all use the explicit `getSupabase()`/`supabaseAdmin` named exports.

**Suggested fix:** Document that the Proxy export is **only** for backward-compat with pre-D14 call sites, and migrate those sites incrementally. Long-term, delete the Proxy and keep only `getSupabase()`. Alternative micro-optimization: cache bound methods in a `WeakMap<Sb, Map<prop, Function>>` keyed by the real client.

**Severity rationale:** MEDIUM because Vercel function cold-start hides this; warm-path overhead is real but minor. Worth fixing as part of the H-1 consolidation PR.

---

### M-2. `lib/claude/index.ts` — the file is 620 lines, mostly inline prompts; violates `<800` rule but only just, and crowds the actual logic

**File:** `apps/forge/apps/web/lib/claude/index.ts` (619 lines)

**Issue:** Lines 76-543 are a `VERB_PROMPTS` map with **15 inline prompt templates** (`noncompete`, `phantom_1099`, `surplus_funds`, `passport`, `gdpr`, `boi`, `sms`, `tdpsa`, `cipa`, `gpc`, `mhmda`, `iso27001`, `gipa`, `edtech`, `surplus`). Each template is 20-100+ lines. The actual orchestration logic (`runModule`, `runPassportAssessment`, `qualifyCase`, `generateReport`) is buried in the last 70 lines.

The file is ~620 lines, just under the 800-line common rule limit, but the **density** of meaningful logic is low. Two issues:
1. Adding a 16th vertical means editing one massive file — merge conflicts compound
2. The prompts are versioned in source, but commit history can't tell when **only the `gdpr` prompt** changed

**Suggested fix:** Extract prompts to `apps/forge/apps/web/lib/claude/prompts/{vertical}.ts`. Keep the registry as `import { gdprPrompt } from './prompts/gdpr'`. Each prompt file becomes its own diff-able unit. Pattern matches docai's `lib/contract-analysis.ts` (160 lines, focused).

**Severity rationale:** MEDIUM — file is borderline. Code review would flag this on the next vertical addition; better to split now while the verticals are still ~uniform.

---

### M-3. `lib/payments.ts` `verifyNOWPaymentsSignature` — sorted-keys-then-stringify is fragile

**File:** `apps/docai/web/lib/payments.ts:68-85`

**Issue:**
```ts
const payload = JSON.parse(rawBody) as Record<string, unknown>;
const sorted = Object.keys(payload)
  .sort()
  .reduce<Record<string, unknown>>((accumulator, key) => {
    accumulator[key] = payload[key];
    return accumulator;
  }, {});

const expected = crypto.createHmac("sha512", secret).update(JSON.stringify(sorted)).digest("hex");
```

This **only sorts top-level keys**. If `payload.outcome` is itself an object with `{ status, amount }`, `JSON.stringify` will preserve **insertion order** of those nested keys — which depends on what JSON.parse gave us, which depends on the wire format from NOWPayments.

NOWPayments' actual signature scheme (per their docs) is more elaborate than this; if NOWPayments ever serializes a nested object with a different key order, the HMAC mismatches and **every** webhook gets rejected.

**Suggested fix:** Either (a) verify against the **raw** body bytes that NOWPayments hashed (their docs specify this — read `rawBody` directly into HMAC, no parse/sort), or (b) recursively sort keys at all depths. The current shape sits between the two and works only by accident.

**Severity rationale:** MEDIUM — security-adjacent (HMAC verification correctness). Not CRITICAL because the route is `force-dynamic` and a mismatch fails closed (rejects payment), not open. But a payment-rejection storm is a P1 ops event.

---

### M-4. `apps/forge/apps/web/app/api/lead-magnet/route.ts` — `SAFE_LEAD_MAGNET_URLS` is empty in source

**File:** `apps/forge/apps/web/app/api/lead-magnet/route.ts:27-32`

**Issue:**
```ts
const SAFE_LEAD_MAGNET_URLS: Record<string, string> = {
  // Specific magnet slugs go here. Examples (extend as gap pages add real assets):
  // 'eu-ai-act-faq': 'https://bizlegal-ai.com/guides/eu-ai-act-faq.pdf',
  // 'gdpr-checklist': 'https://bizlegal-ai.com/guides/gdpr-checklist.pdf',
}
const DEFAULT_LEAD_MAGNET_URL = 'https://bizlegal-ai.com/guides'
```

**Every** lead today gets the default URL — the per-slug allow-list is empty. The C-2 SECURITY-V3 fix (don't trust user-supplied URL) is in place, but the **product** functionality (deliver the guide for the specific gap they signed up for) is regressed.

This is a "fix passes review because it's secure, ships because it doesn't break, and silently delivers the wrong magnet" situation.

**Suggested fix:**
1. Telemetry on every `SAFE_LEAD_MAGNET_URLS[gap_slug] ?? DEFAULT_LEAD_MAGNET_URL` fallback — log which `gap_slug` requested when the table was empty
2. Track in `decisions/.planning/WEEK-3-READY-2026-05-09.md` that the allow-list needs population as a launch dependency
3. Consider failing closed in dev: `if (process.env.NODE_ENV === 'development' && !SAFE_LEAD_MAGNET_URLS[gap_slug]) console.warn(...)`

**Severity rationale:** MEDIUM — security fix landed correctly, but the product hole is now hidden behind a default. This is "type-safe wrong" — the kind of bug a reviewer catches but a compiler doesn't.

---

### M-5. `payout_reconciler.commission_total` accumulator silently coerces non-numeric → 0

**File:** `services/oci/router/payout_reconciler.py:161-166`

**Issue:**
```python
commission_total = 0.0
for row in paid_rows:
    try:
        commission_total += float(row.get("commission_usd") or 0)
    except Exception:
        pass
```

`except Exception: pass` is the broadest possible catch. If `commission_usd` is a string `"$1,200.00"` (because someone seeded a partner row with formatting), or `None`, or a Decimal, the `float()` call fails → **silent zero contribution to the digest**. The Telegram digest reports a weekly total that's lower than reality.

**Suggested fix:**
```python
try:
    commission_total += float(row.get("commission_usd") or 0)
except (TypeError, ValueError) as exc:
    logger.warning("payout %s has non-numeric commission_usd=%r: %s",
                   row.get("id"), row.get("commission_usd"), exc)
```

**Severity rationale:** MEDIUM — affects an ops-facing metric (digest), not a billing pathway. Worth fixing because the digest is the **only** weekly visibility into router health.

---

### M-6. `email_contract.send_referral_contract` — `RESEND_REFERRAL_FROM` defaults to a sender that may not be DKIM-aligned

**File:** `services/oci/router/email_contract.py:258-264`

**Issue:**
```python
sender = os.environ.get(
    "RESEND_REFERRAL_FROM",
    os.environ.get(
        "RESEND_FROM",
        "BizLegal-AI Intelligence <referrals@intelligence.bizlegal-ai.com>",
    ),
)
```

The hardcoded fallback `referrals@intelligence.bizlegal-ai.com` is a **subdomain** that may not have its own SPF/DKIM/DMARC alignment. If that subdomain isn't configured at Resend, every referral email lands in spam.

**Suggested fix:**
1. Confirm the subdomain has DKIM in Resend
2. If it doesn't, change the fallback to `team@bizlegal-ai.com` (which is known-aligned per existing `email-ops`)
3. Add a startup check: `if "intelligence.bizlegal-ai.com" in sender and not <DKIM_VERIFIED_FLAG>: logger.error(...)`

**Severity rationale:** MEDIUM — deliverability bug, not a code bug. Catches the kind of "ship works on dev, breaks at prod first contact" pattern. Adding here because the fallback is in source code.

---

### M-7. `seed_partners.collect_partner` — exit code 2 on duplicate-email skip is undocumented and inconsistent with the `--digest-only` exit-code semantics

**Files:**
- `services/oci/router/seed_partners.py:148`
- `services/oci/router/payout_reconciler.py:269`

**Issue:** `seed_partners.py:148` exits with `sys.exit(2)` when a duplicate-email partner is found and the user declines the update path. `payout_reconciler.py:269` returns `1` only on event-firing failure.

The convention across the repo's CLI ops scripts is undocumented. Some treat exit codes as Unix-y (0/1/2), others use them as feature-flags. A future Moses-runs-this-via-cron will hit a bash `if-statement` that treats `2` differently from `1` and the fail-rate will be wrong.

**Suggested fix:** Add an `EXIT_CODES` constant in `services/oci/router/__init__.py`:
```python
EXIT_OK = 0
EXIT_FAILURE = 1
EXIT_USER_ABORT = 2
```
Use them consistently. Document in the `Manual run:` block of each module's docstring.

**Severity rationale:** MEDIUM — operational. Not blocking, but the kind of thing that blows up on the third Moses ops session.

---

### M-8. `report-view.tsx` print button uses `href="javascript:window.print()"` — anti-pattern

**File:** `apps/docai/web/components/report-view.tsx:132`

**Issue:**
```tsx
<a className="button-secondary" href="javascript:window.print()">
  Print Report
</a>
```

Three problems:
1. `javascript:` URLs are blocked by every modern CSP — the moment forge gets nonce-based CSP per `SEC-REVIEW-SITESHELL-2026-05-07.md` S-2, this button breaks
2. `<a>` for a side-effect action is wrong semantics — should be `<button type="button">`
3. No keyboard handling, no ARIA — fails A11Y standard 4.1.2

**Suggested fix:**
```tsx
<button type="button" className="button-secondary" onClick={() => window.print()}>
  Print Report
</button>
```

**Severity rationale:** MEDIUM — A11Y + future CSP regression in one. Same fix shape as other Phase AA A11Y work.

---

## LOW

### L-1. `outputFileTracingRoot` change scoped to docai but not docs'd

**File:** `apps/docai/web/next.config.mjs:24-26`

**Issue:** The comment explains *why* (styled-jsx hoisted in pnpm workspace). It does not explain the **blast radius** — pulling more node_modules into the serverless bundle. `next.config.mjs` for forge, lexaudit, brai, tracr is **unchanged**, meaning if the same hoisting trips them, the fix has to be re-discovered.

**Suggested fix:** Either (a) propagate `outputFileTracingRoot` to all monorepo apps preemptively, or (b) document in `decisions/.planning/codebase/` that this is a known pnpm-monorepo footgun and link from each app's `next.config`.

---

### L-2. `vercel.json` `--ignore-scripts` flag — undocumented trade-off

**Files:** All 6 vercel.json files

**Issue:** `corepack pnpm install --frozen-lockfile=false --ignore-scripts` skips package postinstall hooks. This is fine for most things but breaks:
- `sharp` (image optimization — Next.js requires this for prod images)
- `@swc/core` (Next.js sometimes needs platform binaries)
- Husky (git hooks; doesn't matter on Vercel build, fine)

Today the apps don't seem to need any of these, but adding `next/image` with optimization-enabled assets will silently break.

**Suggested fix:** Document in `decisions/.planning/codebase/vercel-build-conventions.md`:
1. Why `--ignore-scripts` (faster build, no Husky in prod env)
2. What it skips
3. When to drop it (when adding image-optimization or native-binary deps)

---

### L-3. `command-menu.tsx` — `Command.Group heading` prop comment hides a version pin

**File:** `apps/forge/apps/web/app/components/command-menu.tsx:174-175`

**Issue:**
```tsx
{/* Command.Group `heading` prop already renders the label;
    Command.GroupHeading does not exist in this cmdk version. */}
```

The comment notes "this cmdk version" but doesn't say which version, and `package.json` is the only source of truth. If cmdk later adds `GroupHeading`, the next dev will rewrite this and either (a) refactor before the version is upgraded → breaks build, or (b) leave stale assumption in.

**Suggested fix:**
```tsx
{/* cmdk@1.x: Command.Group's `heading` prop renders the label.
    Command.GroupHeading was added in cmdk@2.x — when we upgrade,
    consolidate the recent-items group to use it. */}
```

---

### L-4. `payout_reconciler.format_digest_message` — Markdown injection if partner name contains backticks

**File:** `services/oci/router/payout_reconciler.py:206-220`

**Issue:**
```python
return (
    "*OCI weekly digest* (last 7d)\n"
    f"• Routed: `{digest['routed_count']}`\n"
    ...
    f"• Top partner: {top_partner}"
)
```

`top_partner_name` flows from Supabase and is interpolated unescaped into a Telegram-Markdown body. If a partner name is `Jane O'Brien | Senior _Counsel_` or contains `` ` `` or `*`, the Markdown breaks (or injects formatting).

**Suggested fix:** Escape Telegram-Markdown reserved chars in `top_partner_name` before interpolation:
```python
def _telegram_md_escape(s: str) -> str:
    return re.sub(r"[`_*\[\]()]", lambda m: "\\" + m.group(), s or "")
```

**Severity rationale:** LOW — internal-only digest, no user-facing impact. Still: future-proof against a partner's name breaking the weekly check.

---

### L-5. `Globe.tsx` `RegulatoryGlobe` component — magic numbers

**File:** `apps/hub/components/hero/Globe.tsx:71-84`

**Issue:**
```tsx
{[...Array(6)].map((_, i) => {
  const phi = Math.acos(-1 + (2 * i) / 6)
  const theta = Math.sqrt(6 * Math.PI) * phi
  const x = 1.85 * Math.cos(theta) * Math.sin(phi)
  ...
})}
```

`6` (node count), `1.85` (orbit radius), `0.04` (node size), color array `['#a5b4fc', '#d4a853', '#00FF94', ...]` are all bare numbers. Tweaking the visual means editing inside the JSX instead of named constants.

**Suggested fix:** Hoist to module-level constants with names: `NODE_COUNT`, `NODE_ORBIT_RADIUS`, `NODE_SIZE`, `NODE_COLORS`. Trivial, but follows `coding-style.md` magic-numbers rule.

---

### L-6. `email_contract._fallback_email` body uses f-string with raw user pain_point — no escape, no truncation upstream

**File:** `services/oci/router/email_contract.py:213-234`

**Issue:** `pain_point` is interpolated directly into the email body. The Haiku path truncates at 300 chars (line 99), the fallback path doesn't. A 5000-char pain_point hits the email body as-is.

**Suggested fix:** Truncate at the fallback site too:
```python
pain_point_safe = (lead_record.get("pain_point") or "").strip()[:300]
```

Also consider a 1000-char hard limit on the entire body in the Resend send.

---

## Cross-cutting observations

### CC-1. The `lazyClient` consolidation is the highest-leverage fix in this set
Five sites, four shapes, three different missing-env error behaviors. A single `@bizlegal/lazy-client` package with `lazyProxy<T>(factory: () => T)` solves H-1 (this doc), H-1 (silent-fail doc), and M-1 simultaneously. **Recommended Week-3 task: 1 day, +200/-150 LoC, retires three duplications.**

### CC-2. `force-dynamic` should be a directory-level concern, not per-file
Either centralize via a Next.js middleware that flags the entire `app/api/**` tree as dynamic, or write an ESLint rule that fails any `app/api/**/route.ts` that imports `@/lib/(claude|resend|supabase|fulfillment)` without `export const dynamic = 'force-dynamic'`.

### CC-3. The `corepack pnpm` vercel.json pattern is now boilerplate
6 files, near-identical. Either (a) extract to a shared script `scripts/vercel-build.sh` that each `vercel.json` references, or (b) accept the duplication and add a `.github/workflows/vercel-config-check.yml` that diffs them on every PR.

### CC-4. The OCI Python additions are a quality benchmark for the codebase
`email_contract.py` is exemplary: clear module docstring explaining "why this is separate from notify.py," fallback path that's structurally identical to the Haiku path so the disclosure block stays compliant, telemetry on both paths, idempotency notes pointing back to `main.py`. **The TS code in this PR set is below this bar.** When the Week-3 ops dashboard arrives, the TS error-handling pattern should converge on the OCI Python pattern (named `log_event` calls with structured metadata).

### CC-5. The forge debrand commit is the right scope
`ddaf79f` changed 3 lines in 1 file with a commit body that explains the 3 places "AI" stays and why. Use this commit's shape as the template for future legal-scope edits.

---

## Recommended Week-3 sequencing

1. **First** — fix CRITICALs from `SILENT-FAIL-WEEK3PRE` (C-1/C-2). One PR.
2. **Then** — consolidation PR addressing H-1 (lazy-client package) + H-2 (force-dynamic sweep) + M-1 (Proxy perf) + L-2 (vercel.json doc). One PR, ~3 hours.
3. **Then** — H-3 (`requireEnv`) + H-4 (Globe.tsx unify escape hatches). One PR, ~1 hour.
4. **Then** — Operations sweep: M-3 (HMAC), M-4 (lead-magnet table population), M-5/M-6/M-7 (OCI ops). One PR per concern.

Defer all LOW items to a "code-hygiene sweep" PR after the Week-3 launch ships. None are blocking.

---

## What was deliberately NOT covered

- **Test coverage** — none of the diff added tests; that's a separate gap. Common rule: 80% minimum. Most files in this PR set are untested.
- **Bundle-size impact** of `outputFileTracingRoot` change — would require running a `next build --profile` and comparing Lambda function ZIP sizes. Out of scope for static review.
- **Trigger.dev v4 task definitions** — none modified in this commit range.
- **The themes package** — extensively covered in `TYPE-DESIGN-PHASE-AA`, `SILENT-FAIL-PHASE-AA`, `COMMENT-AUDIT-PHASE-AA`, `A11Y-AUDIT-PHASE-AA`, `SEC-REVIEW-SITESHELL`. No new findings here that weren't already raised there.
