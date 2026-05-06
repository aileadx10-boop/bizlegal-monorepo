# Silent Failure Audit — Phase AA Subdomain Design Pass

**Scope:** SiteShell, LandingV2, ThemeProvider/apply, StickyLeadBadge, themes registry, and the 6 subdomain app/page.tsx files (lexaudit, brai, tracr, docai, leadforge, forge).
**Commit:** post-71c9c8e (SiteShell propagation), 2026-05-07.
**Hunter:** silent-failure-hunter agent.

Severity legend:
- **CRITICAL** — data loss potential, lost lead, lost paying intent, or security implications
- **HIGH** — silent UX failure (user thinks success when none, or no path to recover)
- **MED** — debug-time pain (errors invisible to ops, slow time-to-diagnose)
- **LOW** — stylistic / defense-in-depth

---

## CRITICAL

### C1. Lost lead error message on the Hero quick-capture form
**File:** packages/themes/src/LandingV2.tsx
**Lines:** 447-461 (Hero submit)

The catch binding is omitted so the Error object — including the upstream message — is dropped. The user sees a generic retry prompt. There is no console.error, no telemetry call, no Sentry capture. If the lead-intake endpoint is broken (rate limit, auth, schema mismatch, n8n down) ops will not know until a human reports a missing inbound lead.

**Impact:** This is the BizLegal AI revenue funnel. Every silent failure here equals a lost lead that the user assumes was captured. CRITICAL because:
- Multiple subdomains (lexaudit, brai, tracr) share this code path
- The endpoint chain is LandingV2 -> /api/decision-tree/lead -> n8n -> Supabase; multiple failure modes
- Stream B Status notes the router has had DNS-blocked deploys recently — exactly when this would silently break

**Fix:**
1. catch (err) -> setError(...) AND console.error('[lead-submit] hero failed', err)
2. Surface a one-line ops-log POST to /api/ops-log with kind=lead_submit_failed
3. Show the actual upstream error tail to the user when NODE_ENV !== production
4. Plumb a Sentry/Datadog client into @bizlegal/themes and capture the exception

### C2. Identical lost lead error on the bottom Contact form
**File:** packages/themes/src/LandingV2.tsx
**Lines:** 618-632 (Contact submit)

Same pattern as C1: empty catch with setError. The Contact form carries name + scenario — a higher-intent lead than the hero — so dropping these silently is even worse.

**Impact:** CRITICAL. Same fix as C1.

### C3. The body-read fallback hides the body of every non-2xx response
**Files:**
- apps/lexaudit/app/page.tsx line 37
- apps/brai/app/page.tsx line 33
- apps/tracr/app/page.tsx line 33

Pattern: const detail = await res.text().catch(() => ''); return { ok:false, error: detail.slice(0,160) || 'http_'+res.status }

**What is swallowed:** Network errors and partial-stream errors during body read (e.g. unexpected end of stream, aborted) become an empty string, which collapses to http_<status> and throws away anything the server actually said. Even when the body comes through, slice(0, 160) drops the rest — fine for display, but a structured error envelope from the API would be parsed as opaque text.

**Impact:** CRITICAL combined with C1/C2 — the only diagnostic info that the form bubbles up is already lossy before LandingV2 swallows it again. Ops have effectively zero visibility into why a lead failed.

**Fix:**
1. Log read failures: .catch((readErr) => { console.error('[lead-submit] body read failed', readErr); return '' })
2. Try res.json() first when content-type is JSON; fall back to text
3. Always log the full body server-side via the API route, not just at the client edge
4. Return a richer envelope with status, error, and code fields

### C4. getTheme throws but applyTheme and the FOUC script silently fall back
**Files:**
- packages/themes/src/themes.ts lines 261-265 (getTheme does throw — good)
- packages/themes/src/apply.ts line 27 (applyTheme: if (!spec) return)
- packages/themes/src/apply.ts lines 86-103 (FOUC script: if(!spec)return)

Inconsistency: getTheme(id) throws on unknown id, but applyTheme(id) and the inline FOUC script silently no-op when THEMES[id] is undefined. A bad storageKey value (someone hand-edits localStorage, theme is renamed and stale storage is read) leads to a page that renders with no CSS variables set at all — meaning every var(--brand), var(--ink), var(--paper) falls back to its hardcoded default in CSS. The page renders, but with the wrong brand colours.

Worse: this happens silently, before paint, with no console.warn. Moses and ops would see "the page looks weird on my browser" with no tools to diagnose.

**Impact:** CRITICAL because it affects every visitor whose stored theme id is invalid (stale localStorage from rename, malicious extension, future theme rename). Brand-coherence is the explicit goal of Phase AA.

**Fix:**
1. apply.ts:27 -> if (!spec) { console.warn(...); applyTheme(FALLBACK_ID, root); return } — actually apply something
2. FOUC script -> wrap in console.warn inside the catch so dev consoles surface the issue
3. provider.tsx:36-43 -> if getStoredTheme returns a value not in allowed, clear the bad key

---

## HIGH

### H1. Hero error pinned to <p> outside the form, never read by screen readers
**File:** packages/themes/src/LandingV2.tsx
**Line:** 498

No role=alert, no aria-live, no id linked to the input via aria-describedby. Sighted users see red text, screen-reader users see nothing change. The form button re-enables, so a keyboard-only user tries again and gets the same silent failure.

**Impact:** HIGH — accessibility-regressing silent UX failure; likely a WCAG 4.1.3 (Status Messages) violation.

**Fix:** Add role=alert and aria-live=assertive to the <p>, and link the input via aria-describedby.

### H2. Contact form error rendered after the disabled button — same a11y issue
**File:** packages/themes/src/LandingV2.tsx
**Line:** 668

Same pattern, same fix.

### H3. useEffect in ThemeProvider has stale dep array
**File:** packages/themes/src/provider.tsx
**Lines:** 33-47

The deps array is empty with an eslint-disable. If the host swaps primary or storageKey at runtime (rare but possible — e.g. a cookie-based brand swap), the provider keeps the stale theme and never re-reads localStorage. Eslint disable masks the bug.

**Impact:** HIGH for future dev work, MED today since no caller currently rotates these props. Risk: someone adds a per-route theme swap, sees the toggle stop working, cannot diagnose because the eslint comment hides the staleness.

**Fix:** Use [primary, alternate, storageKey] as deps, wrap the body in a guard so it only runs on first render (e.g. useRef flag), or extract the mount logic to a useLayoutEffect keyed by storageKey so a store change re-syncs.

### H4. useTheme() throws but ThemeToggleButton is the only consumer that handles being unmounted
**File:** packages/themes/src/provider.tsx
**Lines:** 73-77

useTheme throws when there is no provider. Throwing from a hook in a 'use client' component during render -> React error boundary -> blank page on the affected branch. SiteShell renders <ThemeToggleButton /> unconditionally (line 157), so any layout that mounts SiteShell without first wrapping in ThemeProvider blanks the entire app shell. This is exactly what would happen if a developer forgets the provider in a new subdomain.

**Impact:** HIGH — silent in development (no provider = white screen on first nav, no console hint other than the thrown error), CRITICAL during a wrong roll-out.

**Fix:**
1. ThemeToggleButton should return null (not throw) when no provider is mounted — wrap useTheme() in try/catch or expose useThemeOptional()
2. Or have SiteShell accept a themeMode prop so a subdomain that does not want a toggle can opt out cleanly

### H5. dangerouslySetInnerHTML for inline FOUC script with no nonce
**File:** apps/lexaudit/app/layout.tsx lines 33-40
**Same pattern in:** brai, tracr, docai, leadforge, forge layouts

The FOUC script body is correctly defensive (script-end escape, double-try), but no CSP nonce is attached. If/when CSP is hardened (per ~/.claude/rules/web/security.md) the script will be silently blocked by the browser, FOUC returns, theme vars never apply, and the page renders with hardcoded fallbacks (see C4). No alert reaches ops.

**Impact:** HIGH on the day CSP ships. Easy to overlook because the page still renders.

**Fix:** Use Next.js middleware to inject a per-request nonce into both the FOUC script and the existing bl-theme script, document the requirement in provider.tsx JSDoc.

### H6. pathMatches has no normalization — query-string and trailing-slash silent miss
**File:** packages/themes/src/SiteShell.tsx
**Lines:** 111-116

usePathname() strips query but Next can return paths with trailing slashes depending on trailingSlash config. The equality check pathname === p would fail for a trailing-slash version. More importantly, chromeSuppressPaths includes /certificate — a route that has a dynamic segment underneath. Today is fine, but a future addition like /certificates (plural) would also match /certificate if someone accidentally drops the trailing slash check. Current code is correct, but the precondition is fragile and undocumented.

**Impact:** MED today, HIGH the day someone adds a similarly-named route.

**Fix:** Normalize pathname to drop trailing slash, and add a unit test fixture covering /certificate, /certificate/abc, /certificates (should NOT match).

### H7. StickyLeadBadge mounts visible-true on hash anchor land + corrupted dismissal flag
**File:** packages/themes/src/StickyLeadBadge.tsx
**Lines:** 47-60

Initial render is visible=false (line 44), then effect calls onScroll() and may set visible=true immediately if the user lands on #contact. That is a flicker (badge slides in from translateY(16px) AFTER the page paints in its hidden state).

The bigger issue: getDismissedUntil() returns 0 on parse failure (line 28-30). If a user has a malformed timestamp from a previous bad write, Date.now() < 0 is always false -> user sees the badge again. Acceptable, but a malformed timestamp should be cleared, not ignored.

**Impact:** HIGH for the dismissed-flag-corrupted user (they thought they dismissed it, it keeps reappearing every visit, no way to debug).

**Fix:**
1. In getDismissedUntil, on parse failure, localStorage.removeItem(DISMISS_KEY) and console.warn
2. To kill the flicker: set initial state synchronously guarded by typeof window !== undefined, or render the badge with visibility:hidden until first effect

---

## MED

### M1. getStoredTheme and setStoredTheme swallow errors with no telemetry
**File:** packages/themes/src/apply.ts
**Lines:** 39-55

Both helpers wrap localStorage in try/catch with the binding omitted. The comment is correct (storage may be blocked) but we lose the QuotaExceededError vs SecurityError distinction. A user in private browsing gets SecurityError. A user who has filled their quota gets QuotaExceededError. We treat both as "fine, do nothing." Theme toggle silently does not persist for them.

**Impact:** MED — affects only edge-case users. The toggle appears to work mid-session and does not stick on next visit, a confusing silent UX regression that no log will surface.

**Fix:**
1. catch (err) -> console.warn theme storage unavailable so dev consoles see it
2. Add a one-time ops log call when storage write fails so we can correlate with churn metrics
3. Document in provider.tsx that toggle persistence is best-effort

### M2. themeFOUCScript IIFE catch swallows entirely
**File:** packages/themes/src/apply.ts
**Line:** 103

The outer try in the IIFE has a comment "never break first paint" — goal is correct, but in dev a silent failure here means the FOUC inline script is broken (e.g. JSON malformed because a future theme spec contains a script-end literal that the regex missed) and you would never know. The page renders without theme vars, falls back to the default Twilight via CSS var defaults, and the first effect in ThemeProvider then does the right thing — masking the dev-time bug.

**Impact:** MED — masks future regressions in the FOUC path.

**Fix:** In dev, surface via a localhost-conditional console.warn inside the catch.

### M3. applyTheme uses setProperty with no sanity check on values
**File:** packages/themes/src/apply.ts
**Lines:** 28-35

setProperty silently no-ops on invalid CSS values (it throws only on syntactically invalid property names, not values). A typo in themes.ts like an invalid hex means the var gets set to garbage and the browser falls back to inherited / default — the page renders, looks slightly off, no error.

**Impact:** MED — debug-time pain when adjusting themes.

**Fix:** A unit test that imports each theme and validates each value with CSS.supports would catch typos at build time. Worth adding a vitest fixture in packages/themes/src/themes.test.ts.

### M4. IntersectionObserver has no fallback for old browsers
**File:** packages/themes/src/LandingV2.tsx
**Lines:** 401-416

If IntersectionObserver is undefined (very old Safari, some embedded browsers), this throws synchronously inside useEffect -> React sees the error and unmounts the tree on next render. The page is then frozen at last-painted state.

**Impact:** MED — affects under 0.5 percent of browsers per caniuse, but those users see ALL lex-reveal sections stuck at opacity:0 because nothing ever adds the .in class. Sections beyond the hero are invisible.

**Fix:** Detect typeof IntersectionObserver === undefined and reveal everything immediately as a graceful fallback.

### M5. forge homepage Counter uses requestAnimationFrame with no cleanup
**File:** apps/forge/apps/web/app/page.tsx
**Lines:** 14-32

If the component unmounts mid-animation (user navigates away), the rAF callback still fires, calls setCount on an unmounted component -> React 18 silently no-ops but logs a warning. In strict mode + double-invoke, two animations run in parallel.

**Impact:** MED debug noise; harmless to the user. Worse on slow devices where the warning is amplified.

**Fix:** Capture the rAF id and cancel on cleanup with cancelAnimationFrame in the effect cleanup return.

### M6. SiteShell.tsx renders ThemeToggleButton even when the subdomain has no alternate
**File:** packages/themes/src/SiteShell.tsx
**Line:** 157
**With:** provider.tsx:91-92 (ThemeToggleButton returns null when alternate is null)

The button correctly returns null when alternate is null, but SiteShell passes through the bl-navend container holding both the toggle and the CTA. When the toggle returns null, the layout looks fine — but if a layout author later wraps ThemeToggleButton in a div with margin, that empty wrapper renders without the button and shifts the CTA. Today is fine; the silent failure is in the implicit contract.

**Impact:** MED — fragile contract.

**Fix:** Pass alternate from props down to SiteShell so it can decide whether to render the toggle slot at all, and document the contract on ThemeToggleButton.

---

## LOW

### L1. chromeSuppressPaths default includes /api but /api is server-only
**File:** packages/themes/src/SiteShell.tsx
**Line:** 108

/api should never be hit by a client-rendered shell — Next intercepts at the route handler before the layout renders. The default is harmless but suggests the author was not sure, which is the kind of defense-in-depth that hides bugs.

**Impact:** LOW.

**Fix:** Drop /api from default, comment the intent.

### L2. Optional chaining on searchParams could silence a typo (DocAI)
**File:** apps/docai/web/app/page.tsx
**Line:** 23

resolvedSearchParams.template is direct access today — fine. But if a refactor adds optional chaining here, a typo would silently render with undefined and fall back to a default template, hiding the bug.

**Impact:** LOW — preventative.

**Fix:** Validate at the boundary with a Zod schema.

### L3. applyTheme mutates inline style — clobbers any inline theme overrides set elsewhere
**File:** packages/themes/src/apply.ts
**Lines:** 28-34

A future inline style on the html element for a one-off promo would be silently overwritten on theme toggle. Acceptable today (no such use), but worth a JSDoc warn.

**Impact:** LOW.

**Fix:** Document or move to a stylesheet rule swap so inline styles win.

### L4. themeFOUCScript returns a string consumed via dangerouslySetInnerHTML with no regression test
**File:** packages/themes/src/apply.ts

The script-end escape regex (line 85) is the correct defensive pattern, but if a future theme value contains weird unicode or surrogate pairs the JSON.stringify output could still break parsing in legacy engines. No test covers this.

**Impact:** LOW.

**Fix:** Add a vitest case that calls themeFOUCScript and asserts the returned string is parseable as JS via new Function(s).

### L5. LeadForgeLanding and HomeExperience are vendored components with their own internal forms
**File:** apps/leadforge/app/page.tsx, apps/docai/web/app/page.tsx

This audit covers the SiteShell + LandingV2 surface. The vendored components likely have their own lead-capture and their own silent-failure surface. NOT IN SCOPE BUT FLAGGED — DocAI HomeExperience and LeadForge LeadForgeLanding should get the same audit before they are considered safe.

**Impact:** LOW for this scope, CRITICAL for those components if unaudited.

**Fix:** File a follow-up audit ticket against components/home-experience.tsx and components/leadforge/LeadForgeLanding.tsx.

---

## Summary verdict

| Severity | Count |
|----------|------:|
| CRITICAL | 4     |
| HIGH     | 7     |
| MED      | 6     |
| LOW      | 5     |
| **Total**| **22**|

**Highest-leverage fixes (do first):**
1. C1 + C2 + C3 — restore the lead error path. Add console.error, surface to a Sentry/ops-log call, and propagate the upstream error message in dev. This is the BizLegal AI revenue funnel; every silent submit_failed is a lost paying intent.
2. C4 — make applyTheme and FOUC fall back to a known-good theme + warn, instead of silently no-op-ing.
3. H4 — make ThemeToggleButton non-throwing when the provider is missing, so a roll-out misconfig does not blank the shell.
4. H1 + H2 — add role=alert / aria-live to the form error nodes; otherwise screen-reader users get ZERO feedback on a failed submit.

**Anti-patterns counted (raw):**
- empty catch with no binding: 6 occurrences
  - apply.ts:42, apply.ts:52, StickyLeadBadge.tsx:28, StickyLeadBadge.tsx:38, LandingV2.tsx:456, LandingV2.tsx:627
- catch (e) {} swallowing inside FOUC IIFE: 2 occurrences
  - apply.ts:92 (inner localStorage), apply.ts:103 (outer)
- lossy text-read fallback (.catch returning empty string): 3 occurrences
  - lexaudit/app/page.tsx:37, brai/app/page.tsx:33, tracr/app/page.tsx:33
- Silent fallback to default with no warn: 3 occurrences
  - apply.ts:27 (if !spec return), apply.ts:94 (FOUC if(!spec)return), SiteShell.tsx:130 (usePathname() ?? slash)
- Missing aria-live on error UI: 2 occurrences (LandingV2.tsx:498, :668)
- Missing IntersectionObserver fallback: 1 occurrence (LandingV2.tsx:403)

**Files cleared (no findings):**
- packages/themes/src/themes.ts — getTheme correctly throws (line 263). The downstream applyTheme SHOULD call getTheme instead of THEMES[id] to inherit that throw — currently does its own silent lookup. See C4.
