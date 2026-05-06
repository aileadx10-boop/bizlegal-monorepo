# Security Review — Phase AA SiteShell + LandingV2 + FOUC Propagation

**Date:** 2026-05-07
**Reviewer:** security-reviewer agent (Opus 4.7 1M)
**Scope:** code shipped after `SECURITY-V3-2026-05-12.md` covering:

- `packages/themes/src/SiteShell.tsx`
- `packages/themes/src/apply.ts` (`themeFOUCScript()` + `applyTheme()`)
- `packages/themes/src/StickyLeadBadge.tsx`
- `packages/themes/src/LandingV2.tsx`
- `packages/themes/src/provider.tsx`
- 6 subdomain `app/layout.tsx` files: lexaudit, brai, tracr, docai/web, leadforge, forge/apps/web
- 3 subdomain `app/page.tsx` homepages (lexaudit, brai, tracr) using `LandingV2`

**Prior context:** D10 SECURITY-V3 found 2 CRITICAL + 6 HIGH + 8 MED + 4 LOW. Open from prior pass: H-1 (HMAC replay), H-2 (scoped Supabase role). Both unrelated to this surface.

---

## Executive Verdict

| Severity | Count |
|---|---|
| CRITICAL | 0 |
| HIGH | 1 |
| MEDIUM | 3 |
| LOW | 3 |

**Ship-block decision:** **DO NOT BLOCK on security alone.** No CRITICAL findings. The single HIGH (S-1) is a functional + bot-protection regression that breaks the LandingV2 hero/contact lead flow on subdomains where Turnstile is enabled, but it does not introduce new attack surface beyond what rate-limit (10/min/IP at `/api/decision-tree/lead`) already covers. Fix S-1 before announcing the new homepage UX externally; ship the visual changes if needed.

The four `dangerouslySetInnerHTML` audit hot-spots (SiteShell `<style>`, `themeFOUCScript()`, plus the legacy bl-theme inline script in each layout) are all proven safe: every interpolated value is either a module-level constant or a `JSON.stringify`-encoded value from a closed `ThemeId` enum.

---

## Findings

### S-1 — HIGH — LandingV2 hero + contact forms ship no Turnstile token

**Files:**
- `packages/themes/src/LandingV2.tsx:447-500` (Hero quick-capture form)
- `packages/themes/src/LandingV2.tsx:606-674` (Contact intake form)
- `apps/lexaudit/app/page.tsx:20-44` (`onLeadSubmit` body)
- `apps/brai/app/page.tsx:16-40` (`onLeadSubmit` body)
- `apps/tracr/app/page.tsx:14-39` (`onLeadSubmit` body)

**Endpoint that consumes the payload:**
- `apps/lexaudit/app/api/decision-tree/lead/route.ts:71-80` (Turnstile required)

**Attack vector:**
The `LandingV2` Hero quick-capture and Contact intake forms POST to `/api/decision-tree/lead` with this body:

```json
{ "email": "...", "verdict": "home_capture", "answers": { "home_capture": true, "source": "home-quick-capture" | "home-intake", ... } }
```

There is no `turnstile_token` field. The endpoint validates Turnstile via `verifyTurnstile({ token: body.turnstile_token, ... })`. Per `packages/turnstile-verify/src/index.ts:39-45`:

- If `TURNSTILE_SECRET_KEY` is **set**, missing token returns `{ ok: false, errorCodes: ['missing-input-response'] }` → endpoint returns HTTP 403 → both LandingV2 forms permanently fail with `turnstile_failed`. **Functional break.**
- If `TURNSTILE_SECRET_KEY` is **unset** (skip-if-not-configured mode), `verifyTurnstile` returns `{ ok: true, skipped: true }` → both forms bypass bot protection entirely, retreating to rate-limit (10/min/IP) as the only abuse control. **Reintroduces the F-2 problem the package was created to fix.**

The D10 INTEGRATION-V3 F-2 hardening assumed every public lead-intake endpoint would render the `<TurnstileWidget>` and ship the token alongside the email; the new LandingV2 surface skipped that wiring.

**Fix:**
1. Add `<TurnstileWidget>` from `@bizlegal/turnstile-widget` to both forms in `LandingV2.tsx`. Pipe the resulting token through `onLeadSubmit({ email, ..., turnstile_token })`.
2. Update the `LandingV2Props['onLeadSubmit']` shape to accept `turnstile_token?: string`.
3. Update the three subdomain `page.tsx` `onLeadSubmit` bodies to pass `turnstile_token` into the request body.
4. Add a server-side fail-closed guard: when `verdict === 'home_capture'` (sentinel for the LandingV2 forms — not the screener), require Turnstile even if the env-var-skip flag is on, OR drop the skip-if-not-configured path for production.

**Severity rationale:** HIGH (not CRITICAL) because rate-limit still caps abuse at 10/min/IP, the Turnstile bypass is conditional on production env not being set, and the worst impact in the secret-set case is a denial-of-service against legitimate users (form simply doesn't work) — not data exposure or privilege escalation.

---

### S-2 — MEDIUM — Inline `<style>` and `<script>` blocks expand CSP-blocking surface; no CSP shipped

**Files:**
- `packages/themes/src/SiteShell.tsx:142` (`<style dangerouslySetInnerHTML={{ __html: siteShellCSS }} />`)
- `packages/themes/src/LandingV2.tsx:423` (`<style dangerouslySetInnerHTML={{ __html: lexCSSv2 }} />`)
- `apps/lexaudit/app/layout.tsx:33-37, 40` (legacy `bl-theme` script + `LANDING_FOUC` script)
- `apps/brai/app/layout.tsx:29-33, 35`
- `apps/tracr/app/layout.tsx:43-47, 49`
- `apps/docai/web/app/layout.tsx:52-56, 58`
- `apps/leadforge/app/layout.tsx:50` (`LANDING_FOUC` only)
- `apps/forge/apps/web/app/layout.tsx:62-66, 68`
- `apps/lexaudit/next.config.js` (no `headers()` block, no CSP)

**Attack vector:**
Each LandingV2-using subdomain now ships **2 inline `<style>` blocks + 2 inline `<script>` blocks** per page (legacy bl-theme FOUC + new LANDING_FOUC + siteShellCSS + lexCSSv2). None of the subdomain `next.config.js` files configure a `Content-Security-Policy` response header. If a future XSS sink is introduced anywhere in the app (e.g., a markdown renderer, a redirect handler that reflects a query parameter), there is no CSP defense layer.

The contents themselves are all safe today (see S-3 verification), but the surface area for "the next mistake will land in HTML" has grown. Web rule (`rules/web/security.md`) requires nonce-based CSP for production.

**Fix:**
1. Adopt nonce-based CSP via Next.js middleware in each subdomain (`script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline';` — keep `'unsafe-inline'` on `style-src` only because the SiteShell + LandingV2 inline `<style>` blocks are unavoidable for FOUC/SSR).
2. Generate the nonce per request, attach it to every `<script>` element including the FOUC scripts.
3. Track as a Stream-A platform task — does not need to land before the design pass ships.

**Severity rationale:** MEDIUM. No exploitable issue today; defense-in-depth gap that the prior SECURITY-V3 audit also flagged platform-wide (likely already in the project backlog).

---

### S-3 — VERIFIED SAFE — `themeFOUCScript()` JSON injection

**File:** `packages/themes/src/apply.ts:71-104`

**Verification:** The script body interpolates exactly four runtime values:
1. `JSON.stringify(bundle)` where `bundle = { [primary]: THEMES[primary], [alternate]: THEMES[alternate] }`. Both keys are constrained to the `ThemeId` literal union (`'twilight' | 'daybreak' | 'royal-dark' | 'royal-light'`). All values come from the module-level `THEMES` constant (`packages/themes/src/themes.ts:254-259`) — no runtime/user input.
2. `JSON.stringify(primary)` — `ThemeId` enum.
3. `JSON.stringify(alternate ?? '')` — `ThemeId` enum or empty string.
4. `JSON.stringify(storageKey)` — passed by layout (`'lex-theme'`, `'brai-theme'`, etc.) — module-level constant.

The defensive `.replace(/<\/script/gi, '<\\/script')` (line 85) prevents script-tag breakout even if a future theme entry ever contained the literal `</script` substring. `JSON.stringify` already escapes quotes and backslashes properly. No injection vector. **Approved.**

---

### S-4 — VERIFIED SAFE — `siteShellCSS` and `lexCSSv2` inline `<style>` blocks

**Files:** `packages/themes/src/SiteShell.tsx:24-60`, `packages/themes/src/LandingV2.tsx:30-344`

**Verification:** Both constants are template literals with no `${...}` interpolations of any runtime value — pure static CSS. Safe to inline. **Approved.**

---

### S-5 — VERIFIED SAFE — `applyTheme()` `setProperty` writes

**File:** `packages/themes/src/apply.ts:23-35`

**Verification:** `target.style.setProperty(k, v)` is called with key/value pairs from `THEMES[id].vars` — module-level constant. `setProperty` validates CSS syntax; invalid values are silently rejected by the browser. No injection vector even hypothetically because the values originate in a closed registry. **Approved.**

---

### S-6 — MEDIUM — `StickyLeadBadge` href is currently server-controlled but typed permissively

**File:** `packages/themes/src/StickyLeadBadge.tsx:42-113`

**Attack vector:**
The component prop type is `readonly href: string`. Today every caller (the 6 layouts at the line where they pass `stickyLead={{ label: '...', href: '/decision-tree' }}`) passes a server-side static path — safe. But the type allows any string, including `javascript:alert(1)` or external untrusted URLs. If a future caller wires `href` from URL params or user-controlled config (e.g., a CMS), it would render a clickable XSS-by-protocol vector.

**Fix:**
1. Tighten the type to a branded `SafePath` or runtime-validate that `href` starts with `/` or `https://`:
   ```ts
   if (!/^(\/|https:\/\/)/.test(href)) { /* drop or sanitize */ }
   ```
2. Document in JSDoc: "href MUST be server-controlled — never wire from URL params."

**Severity:** MEDIUM. No exploitable path today; defense-in-depth.

---

### S-7 — MEDIUM — `SiteShell` nav/cta/footer hrefs typed permissively (same pattern as S-6)

**File:** `packages/themes/src/SiteShell.tsx:70-90`

**Attack vector:** `nav: ReadonlyArray<{ label: string; href: string }>`, `cta: { label: string; href: string }`, `footer.links` — same untyped-string href pattern. Today all callers pass static layout-defined values. Future risk is identical to S-6.

Note also `apps/lexaudit/app/layout.tsx:51-54` does:
```ts
nav={LEXAUDIT_CONTENT.nav.map((n) => ({ label: n.label, href: n.href.startsWith('#') ? `/${n.href}` : n.href }))}
```
This produces `/#audits` for an anchor-only nav item — harmless, but it's worth noting the transformation logic isn't input-validated either. The values still come from `LEXAUDIT_CONTENT` (server constant), so safe today.

**Fix:** Same as S-6. Apply at the `SiteShellProps` boundary.

---

### S-8 — LOW — `pathMatches` comparison uses simple `startsWith(p + '/')` — verified bypass-resistant

**File:** `packages/themes/src/SiteShell.tsx:111-116`

**Verification attempted:** Could a path like `/apifoo` or `/api2/users` bypass the `/api` chrome-suppress prefix and render the public chrome on an API route?
- `/api` → `pathname === '/api'` matches → suppress.
- `/api/users` → `startsWith('/api/')` matches → suppress.
- `/api2` → `startsWith('/api/')` is false; `pathname === '/api'` is false → does NOT suppress (correct, `/api2` isn't an API route prefix).
- `/apifoo` → same as above → does NOT suppress (correct).

No prefix confusion. **Approved.** Filing as LOW only because if anyone changes this to a `regex`-driven version in the future, they should preserve the same anchored-prefix semantics — worth a comment in code.

**Fix (cosmetic):** Add a JSDoc comment at line 111 documenting the anchored-prefix invariant.

---

### S-9 — LOW — `usePathname()` nullable-fallback to `'/'` is correct

**File:** `packages/themes/src/SiteShell.tsx:130`

**Verification:** `const pathname = usePathname() ?? '/'` — falls back to root when Next.js returns null (during SSR for some setups). Root path doesn't match any chrome-suppress prefix (`/login`, `/dashboard`, etc., all have at least one path segment), so chrome correctly shows on the root page. **Approved.**

---

### S-10 — LOW — `LandingV2` form error-message uses 160-char prefix of server response body

**Files:**
- `apps/lexaudit/app/page.tsx:37-38`
- `apps/brai/app/page.tsx:33-34`
- `apps/tracr/app/page.tsx:31-32`

**Vector:** When the lead endpoint returns non-200, the page reads the response body with `await res.text()` and ships the first 160 characters as `error` back to LandingV2, which then renders it inline below the form (`LandingV2.tsx:498`, `:668`).

If the backend ever returns sensitive context in error bodies (stack traces, internal IDs, env-leaked strings), it would surface to the user. The current decision-tree endpoint returns clean JSON like `{"error":"invalid_email"}` — fine. But the 160-char passthrough is a latent leak channel.

**Fix:** Replace with a fixed map from known error codes to user-facing messages. Drop the raw passthrough.

**Severity:** LOW. Defense-in-depth; no current leak.

---

## Forms / Patterns Examined and Cleared

- **`StickyLeadBadge` localStorage usage** (`DISMISS_KEY`, dismissed-until timestamp) — cannot be poisoned to cause XSS; only impacts the user's own UI. Clear.
- **`ThemeProvider`/`ThemeToggleButton` localStorage roundtrip** — `getStoredTheme` validates `v in THEMES` before accepting (`apply.ts:41`). Clear.
- **React text rendering of `brand`, `nav.label`, `cta.label`, `footer.tagline`, `footer.disclaimer`, `stickyLead.label`** — all rendered as JSX text children, not as HTML attributes or `dangerouslySetInnerHTML`. React auto-escapes. Clear.
- **`heroHeadline: React.ReactNode`** — author-controlled JSX from per-subdomain `landing-content.tsx`. Server-side static, not user input. Clear.
- **`spec.displayFamily` / `spec.bodyFamily` written to `--lex-display` / `--lex-body`** — both come from the `FAMILIES` constant (`themes.ts:24-27`). Clear.

---

## Cross-References

- D10 SECURITY-V3 (`SECURITY-V3-2026-05-12.md`) — F-1, F-2 Turnstile fixes are bypassed by S-1 above. Re-open follow-up.
- D10 INTEGRATION-V3 (`INTEGRATION-V3-2026-05-09.md`) — assumes every public lead endpoint ships Turnstile. New LandingV2 surface broke that invariant.
- `rules/web/security.md` — CSP guidance applies; tracked via S-2.

---

## Recommended Action Order

1. **S-1 (HIGH)** — wire `<TurnstileWidget>` into LandingV2 Hero + Contact forms; pipe token through `onLeadSubmit`. **Ship before external announcement of the new design.**
2. **S-6 / S-7 (MED)** — branded-type or runtime-validate href props on SiteShell + StickyLeadBadge.
3. **S-2 (MED)** — adopt nonce-based CSP middleware platform-wide. Stream-A backlog item.
4. **S-10 (LOW)** — replace the 160-char error passthrough with a code-to-message map.
5. **S-8 (LOW)** — add JSDoc to `pathMatches` documenting the anchored-prefix invariant.

Hardened, V-clean. No CRITICAL. Approved to ship modulo S-1.
