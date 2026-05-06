# WCAG 2.2 Accessibility Audit — Phase AA Design Surface

**Date:** 2026-05-07
**Auditor:** Senior Accessibility Architect (automated review)
**Standard:** WCAG 2.2 Level AA
**Scope:** `packages/themes/src/*` shared design system + 6 subdomain `app/layout.tsx` integrators (lexaudit, brai, tracr, docai, leadforge, forge)
**Status:** First-ever audit on this surface — no baseline.

---

## Executive Verdict: PARTIAL — 3 Level A blockers, 6 Level AA blockers

The design system is *structurally sound* — semantic landmarks (`role=banner`, `<main>`, `role=contentinfo`), an `aria-label`-correct theme switch, `aria-hidden` brand mark, `prefers-reduced-motion` support, and labelled hero email field are all present. The work the team has shipped puts this on the right side of "default-broken" for a brand-new design pass.

However, three Level A blockers and several Level AA contrast failures must be fixed before any public-traffic launch:

**Level A blockers (must fix before launch):**

1. **Missing `.sr-only` class definition** (SC 1.3.1, 4.1.2) — `LandingV2.tsx:481` uses `<label className="sr-only">` but no `.sr-only` rule exists in any stylesheet shipped by the theme package. The visible label disappears under default user-agent styles for `<label>` (which is `display: inline`) **only** if the project happens to define `.sr-only` elsewhere. We grepped the entire `packages/themes/src` tree — there is no fallback. Result: in browsers where the project doesn't already define `.sr-only`, the label `Email address` renders as visible plaintext, which is a visual bug; in stricter scenarios (e.g. some Tailwind-less subdomains), the rule is missing entirely and authors who rename `sr-only` would silently break the screen-reader name. The pattern is also fragile if any subdomain ships its own `sr-only` differently — we cannot guarantee uniform behaviour.
2. **Focus indicator stripped on form fields** (SC 2.4.7, SC 2.4.11 Focus Appearance) — `LandingV2.tsx:173, 321` set `outline: none` on `.lex-quick-form input`, `.lex-contact-form input`, and `.lex-contact-form textarea`. The replacement is a 1px `border-color` change to `var(--brand)`. A 1px border colour change against the existing 1px `var(--line)` border is **not a perceivable focus indicator** for keyboard users — this is one of the most common ways to fail keyboard accessibility, and 2.4.11 (new in WCAG 2.2 AA) explicitly requires a visible focus appearance with at least a 2 CSS-pixel solid area and 3:1 contrast against adjacent colours. **Brand-soft on dim surface fails 3:1 in several themes** (see contrast table). On Royal Light, `--brand-soft #6E8CFF` on `--surface` over `--ink #F5F8FF` has roughly 2.9:1 — below the 3:1 non-text floor.
3. **Sticky-lead dismiss button has no perceivable focus state and 18×18 target undersize** (SC 2.4.7, SC 2.5.8 Target Size) — `StickyLeadBadge.tsx:114-135` sets `width: 18, height: 18` with no padding. WCAG 2.2 AA requires interactive targets ≥ 24×24 CSS pixels (with limited exceptions; this one does not qualify because it's a free-standing dismiss control with adjacent interactive content within 24px). The button also has no `:focus-visible` style — when a keyboard user tabs to it, no visible state change occurs.

**Level AA blockers (text contrast):**

4. **Nav CTA gradient with white text** (SC 1.4.3) — `lex-nav-cta` and `lex-cta-primary` (LandingV2.tsx:91-100, 149-158) and `bl-nav-cta` (SiteShell.tsx:38) use `linear-gradient(135deg, var(--ember, #FFB347), var(--ember-2, #FF3D00))` with `color: #fff`. White on `#FFB347` (the gradient *start*) is **1.80:1 — fails 4.5:1 body and 3:1 large**. Approximately the top-left ~30% of the button shows white text on too-pale orange. This affects all four themes because `--ember` and `--ember-2` are the same value across all four themes. The pulse pill with white background also reduces effective contrast.
5. **`--ember-2` solid (and gradient end) fails body contrast** — White on `--ember-2 #FF3D00` (Twilight, Royal Dark) is **3.17:1** — fails body text 4.5:1. White on Daybreak/Royal-Light `--ember-2 #E14B16` is **3.92:1** — still fails body. The CTA labels `Start an Audit`, `Run free…` are body-sized (12.5–14px) and must hit 4.5:1.
6. **`--brand-soft` on light themes for small UI text** (SC 1.4.3) — `lex-audit-title strong` is `font-size: 11px` and uses `color: var(--brand-soft)`. On Royal Light, `--brand-soft #6E8CFF` on `--surface` over `--ink #F5F8FF` is **2.92:1**. On Daybreak, `--brand-soft #7E6DFF` on `--ink #FBF9F4` is **3.78:1**. Both fail 4.5:1 body. These tag labels must hit AA.
7. **`--accent-a` chip text on chip background** (SC 1.4.3) — `.lex-audit-tag` uses `color: var(--accent-a)` on a `color-mix(in srgb, var(--accent-a) 18%, transparent)` background. On Twilight `--accent-a #27D4B0` over a near-`--ink-2` base, the chip background is roughly `#211D32` and the text `#27D4B0` → **~7.5:1** PASS. On Royal Dark `--accent-a #43E0F5` over near-ink → ~9:1 PASS. **On Daybreak**, `--accent-a #0F8C6E` (chosen carefully — good!) on the lightened chip yields ~5.6:1 PASS. **On Royal Light**, `--accent-a #0FA9C0` on a faint cyan chip over `#F5F8FF` → ~3.4:1 — FAILS body 4.5:1.
8. **`--paper` on `--surface` translucent** — `surface` is rgba so the effective background depends on what's underneath. We verified `--paper-dim` over `--surface` over the `--audits-bg` / `--spotlight-bg` gradients still passes in dark themes (>5:1). It passes in Daybreak. It is borderline in Royal Light (~4.5–4.7:1 depending on gradient stop) — flag for visual QA.
9. **Hero gradient body text** — `lex-hero-sub` is `color: var(--paper-dim)` on `--hero-bg` (multi-stop gradient). At the lightest stops in Daybreak and Royal Light the contrast can dip below 4.5:1 because the gradient peaks ≈ `#FFFDF7` / `#FFFFFF` and `--paper-dim` is mid-tone. On dark themes the gradient stays dark enough that `--paper-dim` clears 7:1.

---

## 1. Color Contrast Matrix (WCAG SC 1.4.3 / 1.4.11)

Computed contrast ratios for the most-used surface combinations across the four themes. Body text floor: **4.5:1**. Large text (≥ 18.66px @ 400 or ≥ 24px) and non-text UI: **3:1**.

| # | Combination | Twilight (dark) | Daybreak (light) | Royal Dark | Royal Light | Verdict |
|---|---|---|---|---|---|---|
| 1 | `--paper` on `--ink` (body text) | 15.66:1 | 14.74:1 | 16.49:1 | 16.30:1 | PASS all |
| 2 | `--paper-dim` on `--ink` (secondary text) | 10.02:1 | 5.98:1 | 8.18:1 | 6.44:1 | PASS all |
| 3 | `--paper-dim` on `--ink-3` (cards) | ~9.4:1 | 4.78:1 | ~7.7:1 | 5.65:1 | PASS all (Daybreak tight) |
| 4 | `--paper` on `--surface` over `--ink-2` | ~14:1 | ~13:1 | ~14:1 | ~14:1 | PASS all |
| 5 | `--paper-dim` on `--surface` over `--audits-bg` | ~8:1 | ~5.2:1 | ~7:1 | **~4.7:1** | PASS but Royal Light borderline |
| 6 | `#fff` on `--brand` (primary CTA) | 4.88:1 | 7.29:1 | 6.29:1 | 6.29:1 | PASS body all |
| 7 | `#fff` on `--ember` (gradient start, top-left of CTA) | **1.80:1** | **1.80:1** | **1.80:1** | **1.80:1** | **FAIL all — Level AA blocker** |
| 8 | `#fff` on `--ember-2` (gradient end / solid) | **3.17:1** | **3.92:1** | **3.17:1** | **3.92:1** | **FAIL body all — Level AA blocker** |
| 9 | `--brand-soft` on `--ink` (audit-title strong, 11px) | 6.18:1 | **3.78:1** | 5.97:1 | **2.92:1** | **FAIL body Daybreak + Royal Light** |
| 10 | `--accent-a` on accent-tinted chip (audit-tag, 11px) | ~7.5:1 | ~5.6:1 | ~9:1 | **~3.4:1** | **FAIL body Royal Light** |
| 11 | `--brand` on `--surface` (1px border for focus state) | ~3.5:1 (vs `--line`) | ~4.0:1 | ~3.6:1 | **~2.9:1** | **FAIL non-text 3:1 Royal Light** |
| 12 | `--paper-dim` on `--footer-bg` | 8.5:1 | 12.0:1 | 8.6:1 | 12.4:1 | PASS all |
| 13 | `--paper-dim` on `--surface-2` (sticky badge) | ~8:1 | ~5:1 | ~7:1 | ~5:1 | PASS all |

**Computation note:** Ratios computed via the WCAG 2.x formula on sRGB → linear-light → relative-luminance. Translucent surfaces composed over their nearest opaque ancestor (e.g. `--surface` rgba over `--ink-2`). Gradient-on-text values use the *worst-case* gradient stop (the lightest area for white text). Margin of error ±0.1.

---

## 2. Findings by File

### `packages/themes/src/themes.ts`

#### A11Y-001 — `--ember` gradient start fails contrast as CTA background
- **WCAG SC:** 1.4.3 Contrast (Minimum) — Level AA
- **Severity:** Level AA blocker (HIGH)
- **Location:** `themes.ts:48` (Twilight), `:103` (Daybreak), `:158` (Royal Dark), `:218` (Royal Light) — the `--ember` token, plus consumers `LandingV2.tsx:94` (`.lex-nav-cta`), `:152` (`.lex-cta-primary` is `--brand` — OK), `SiteShell.tsx:38` (`.bl-nav-cta`)
- **Issue:** White text on `#FFB347` (the gradient start) yields 1.80:1 — fails even the 3:1 large-text floor. Roughly 30% of the gradient surface is below the 4.5:1 body floor.
- **Fix:**
  - Option A (recommended): darken `--ember` to ≥ `#E08A2C` (≥ 4.5:1 with white) or restrict the gradient range so the lightest stop is ≥ that value.
  - Option B: change CTA text to `var(--paper)` (dark) on the light end, white on the dark end — but this requires a colour-stop-aware text overlay and is fragile; not recommended.
  - Option C: keep the gradient decorative and add a solid darker "core" rectangle behind the text. Acceptable but visually changes the design.

#### A11Y-002 — `--ember-2` solid colour fails body contrast with white
- **WCAG SC:** 1.4.3 — Level AA
- **Severity:** Level AA blocker (HIGH)
- **Location:** Same files as A11Y-001; consumers wherever `--ember-2` appears as a CTA background or solid pill.
- **Issue:** `#FF3D00` → 3.17:1; `#E14B16` (light themes) → 3.92:1. Both fail body 4.5:1.
- **Fix:** Darken `--ember-2` to `#C73600` (Twilight/Royal Dark) and `#B8390F` (Daybreak/Royal Light) — both clear 4.5:1 with white. The brand "ember" identity stays — these are still saturated rust-orange, but legible.

#### A11Y-003 — `--brand-soft` fails on light themes when used for small UI text
- **WCAG SC:** 1.4.3 — Level AA
- **Severity:** Level AA blocker (HIGH)
- **Location:** `themes.ts:98` (Daybreak `#7E6DFF`), `:213` (Royal Light `#6E8CFF`); consumers `LandingV2.tsx:142` (hero `<em>` — large text, OK), `:250` (`.lex-audit-title strong` 11px — FAIL), `:268` (spot-quote ::before 1.4em quote-mark — large/decorative, OK), `:275` (`.lex-spot-stat .num` 32px — large, OK)
- **Issue:** 11px small text in a light theme on `--surface` is ≤3.78:1 (Daybreak) or 2.92:1 (Royal Light).
- **Fix:**
  - Daybreak: change `--brand-soft` to `#5B49E0` (same as `--brand`) when used as small-text colour, OR define a separate `--brand-text-strong` token that is `#3B2BB8` (~6:1 on `#FBF9F4`).
  - Royal Light: shift `--brand-soft` to `#3D5DD8` (~5:1 on `#F5F8FF`) for text use, keep current `#6E8CFF` only for backgrounds/decoration.

#### A11Y-004 — `--accent-a` chip text fails on Royal Light
- **WCAG SC:** 1.4.3 — Level AA
- **Severity:** Level AA blocker (MEDIUM)
- **Location:** `themes.ts:214` (`#0FA9C0`); consumer `LandingV2.tsx:251-255` `.lex-audit-tag`
- **Issue:** Cyan-on-cyan-tint chip on light background ≈ 3.4:1 for 11px text.
- **Fix:** Royal Light `--accent-a` → `#0E7E96` (~5:1).

---

### `packages/themes/src/SiteShell.tsx`

#### A11Y-005 — Brand mark SVG correctly `aria-hidden`, but parent `<a>` `aria-label` says "{brand} home" (acceptable)
- **WCAG SC:** 4.1.2, 1.1.1 — Level A
- **Severity:** Compliant — informational
- **Location:** `SiteShell.tsx:62-67` (SVG), `:145` (`<a aria-label="...home">`)
- **Status:** PASS. The SVG has `aria-hidden="true"`, the surrounding `<a>` has an accessible name from `aria-label` plus visible brand text. Screen reader will announce: `link, {brand} home, {brand}`. Slight redundancy but compliant.
- **Suggested polish:** Drop the `aria-label` and let the visible text + `aria-hidden` SVG provide the name organically (`link, {brand}`) — cleaner announcement.

#### A11Y-006 — `<nav aria-label="Primary">` ✓
- **WCAG SC:** 1.3.1, 4.1.2 — Level A
- **Severity:** Compliant
- **Location:** `SiteShell.tsx:149`
- **Status:** PASS.

#### A11Y-007 — `<main>` lacks `id="main"` for skip link target
- **WCAG SC:** 2.4.1 Bypass Blocks — Level A
- **Severity:** Level A blocker (HIGH) — **no skip link exists**
- **Location:** `SiteShell.tsx:165`
- **Issue:** The shell renders `<header>`, `<nav>` (sticky, with several primary links), then `<main>` — but no skip-to-content link is provided. Keyboard users must tab through the brand link, every primary nav item, the theme toggle, AND the gradient CTA before reaching page content on every navigation. With six subdomains × multiple pages each, this is a pervasive Level A violation.
- **Fix:** Add a visually-hidden-until-focused skip link as the first focusable element inside `.bl-shell`, target `<main id="main" tabIndex={-1}>`:
  ```tsx
  <a href="#main" className="bl-skip-link">Skip to main content</a>
  ```
  with CSS:
  ```css
  .bl-skip-link {
    position: absolute; left: -9999px; top: 0;
    background: var(--ink); color: var(--paper);
    padding: 12px 16px; border-radius: 8px; z-index: 100;
  }
  .bl-skip-link:focus-visible {
    left: 16px; top: 16px;
    outline: 2px solid var(--brand); outline-offset: 2px;
  }
  ```

#### A11Y-008 — Header/nav/footer landmark roles ✓
- **WCAG SC:** 1.3.1 — Level A
- **Severity:** Compliant
- **Location:** `SiteShell.tsx:144` (`role="banner"`), `:167` (`role="contentinfo"`)
- **Status:** PASS. (Note: HTML5 `<header>` as direct child of `<body>` is implicitly `banner`, and `<footer>` is implicitly `contentinfo` — the explicit roles are redundant but harmless.)

#### A11Y-009 — Footer links lack discernible group label
- **WCAG SC:** 2.4.6 Headings and Labels — Level AA
- **Severity:** LOW
- **Location:** `SiteShell.tsx:175-181`
- **Issue:** The footer-links list is rendered as a flat `<div>` of `<a>` elements — no `<ul>` / `<nav aria-label="Legal">` wrapper. Screen readers won't announce them as a group.
- **Fix:** Wrap in `<nav aria-label="Legal">` containing `<ul>` of `<li><a>`.

---

### `packages/themes/src/provider.tsx` — `<ThemeToggleButton>`

#### A11Y-010 — `role="switch"` with `aria-checked` ✓
- **WCAG SC:** 4.1.2 Name, Role, Value — Level A
- **Severity:** Compliant
- **Location:** `provider.tsx:98-104`
- **Status:** PASS. Native `<button type="button">` with explicit `role="switch"`, dynamic `aria-checked={!isPrimary}`, computed `aria-label` ("Switch to bright" / "Switch to dark"), `title` mirror, `onClick` handler. Keyboard activation via Space and Enter is provided by the native button element.

#### A11Y-011 — Theme toggle has no visible focus indicator
- **WCAG SC:** 2.4.7 Focus Visible — Level AA; 2.4.11 Focus Appearance — Level AA (new in 2.2)
- **Severity:** Level AA blocker (HIGH)
- **Location:** `provider.tsx:106-122` — inline-styled button, no `:focus-visible` rule.
- **Issue:** The button uses inline style only; CSS pseudo-classes cannot be expressed inline. No global stylesheet defines `:focus-visible` for this button. Default browser ring may appear in some browsers but is unreliable across themes (especially Twilight where the default outline can blend with the dark backdrop).
- **Fix:** Either move the styles into the package CSS string and add `:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }`, or expose a named class consumers add to a shared stylesheet.

#### A11Y-012 — Theme toggle target size 30×~32 (borderline)
- **WCAG SC:** 2.5.8 Target Size (Minimum) — Level AA (new in 2.2)
- **Severity:** LOW
- **Location:** `provider.tsx:109-119`
- **Issue:** Padding `8px 12px` + ~14px text height ≈ 30–32px tall; horizontally ~70–90px (text-dependent). Target itself is ≥ 24×24, **passes**, but the dot indicator (8×8) inside doesn't add to clickable area; the whole pill is the target — OK.
- **Status:** PASS but worth keeping in mind if the design ever shrinks to icon-only.

---

### `packages/themes/src/StickyLeadBadge.tsx`

#### A11Y-013 — `aria-hidden={!visible}` toggle is correct in concept but interacts badly with `dismissed` state
- **WCAG SC:** 4.1.2 Name, Role, Value — Level A
- **Severity:** MEDIUM
- **Location:** `StickyLeadBadge.tsx:62, 66-90`
- **Status:** Mostly correct — when invisible, both `pointerEvents: 'none'` and `aria-hidden=true` are set, so it can neither be clicked nor announced. When `dismissed`, the component returns `null` (line 62) — clean removal. The risk is that on initial mount `visible=false`, the element is in the DOM but `aria-hidden`. Tab order skips it correctly because of `pointer-events: none`, but the `<a>` and `<button>` are still focusable per HTML semantics — `pointer-events: none` doesn't prevent keyboard focus. **Tab order will land on the dismiss button or link even when the badge is not visible.**
- **Fix:** When `!visible`, also apply `tabIndex={-1}` to the `<a>` and `<button>`, OR conditionally render the badge instead of toggling visibility. Recommend the latter — simpler, no aria/pointer-events/tabIndex juggling.

#### A11Y-014 — Dismiss button target size 18×18 — fails 2.5.8
- **WCAG SC:** 2.5.8 Target Size (Minimum) — Level AA (new in 2.2)
- **Severity:** Level AA blocker (HIGH)
- **Location:** `StickyLeadBadge.tsx:114-135`
- **Issue:** `width: 18, height: 18, padding: 0`. The "×" button is the dismiss control. Although it sits adjacent to the link, the spacing between them (`marginLeft: 4`) is well below 24px, so the exception in 2.5.8 ("inline targets in a sentence" / "spacing exception") does NOT apply.
- **Fix:** `width: 24, height: 24, padding: 4` minimum. Or `padding: 8` and shrink the visual "×" via `font-size`. Maintain the visual lightness while hitting the target floor.

#### A11Y-015 — Dismiss button has no perceivable focus indicator
- **WCAG SC:** 2.4.7, 2.4.11 — Level AA
- **Severity:** Level A blocker (the absence is part of the broader focus issue — see A11Y-011)
- **Location:** `StickyLeadBadge.tsx:114-135`
- **Fix:** Add `:focus-visible` ring via stylesheet, or move the inline style to a CSS class.

#### A11Y-016 — Sticky badge link is not a button but uses an `<a>` — anchor without href semantics OK
- **WCAG SC:** 4.1.2 — Level A
- **Severity:** Compliant
- **Status:** PASS. `<a href={href}>` is correct because it's a navigation link to `/decision-tree`.

#### A11Y-017 — `position: fixed` element may overlap interactive content (CTA / footer links)
- **WCAG SC:** 1.4.10 Reflow — Level AA; 1.4.11 — Level AA
- **Severity:** MEDIUM
- **Location:** `StickyLeadBadge.tsx:67-71`
- **Issue:** At 320px width or 400% zoom, the badge at `bottom: 24, right: 24` will likely overlap content. There's no responsive hide / repositioning logic.
- **Fix:** Add `@media (max-width: 540px)` rule (or component logic) to either reposition (`bottom: 12, right: 12, left: 12, max-width: calc(100vw - 24px)`) or hide entirely on small viewports.

---

### `packages/themes/src/LandingV2.tsx`

#### A11Y-018 — Heading hierarchy correct
- **WCAG SC:** 1.3.1, 2.4.6 — Level A
- **Severity:** Compliant
- **Location:** `LandingV2.tsx:470` (h1 hero), `:508, :528, :556, :580, :637` (h2 sections), `:514, :585` (h3 cards/tiers)
- **Status:** PASS. Hero is the only h1; each section starts with h2; cards and tier names are h3. No skipped levels.

#### A11Y-019 — Eyebrow `<span class="lex-eyebrow">` is decorative — OK
- **WCAG SC:** 1.3.1 — Level A
- **Severity:** Compliant
- **Location:** `LandingV2.tsx:466-469`
- **Status:** Eyebrow is rendered as a `<span>` containing visible text. Screen reader will read it as inline text before the h1 — this is the **intended** behaviour because the eyebrow text *is* useful contextual content (e.g. "PHASE AA · 2026-05" or similar). It should NOT be hidden. PASS.
- **Caution:** Verify the eyebrow text *value* isn't pure decoration like "·". If it's just typographic flourish, change to `aria-hidden="true"`. Per current props (`heroEyebrow: string`), authors should use real words.

#### A11Y-020 — Hero quick form: label uses `.sr-only` which is undefined in this package
- **WCAG SC:** 1.3.1, 4.1.2, 3.3.2 Labels or Instructions — Level A
- **Severity:** Level A blocker (HIGH)
- **Location:** `LandingV2.tsx:481-483`
- **Issue:** As covered in the executive summary — `.sr-only` class is referenced but never defined inside `lexCSSv2` (the inlined stylesheet). The label will either:
  - render as visible text (if no fallback `.sr-only` is defined in the host subdomain), creating a visual bug + likely passing accessibility incidentally; OR
  - if a host stylesheet *does* define `.sr-only`, it will be hidden — but the package can't rely on that.
- **Fix:** Add to `lexCSSv2`:
  ```css
  .lex-page .sr-only {
    position: absolute;
    width: 1px; height: 1px;
    padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0,0,0,0);
    white-space: nowrap; border: 0;
  }
  ```
  Same fix needed in `siteShellCSS` if the shell ever uses `.sr-only`.

#### A11Y-021 — Contact form inputs have placeholders but no labels
- **WCAG SC:** 3.3.2 Labels or Instructions — Level A; 1.3.1 Info and Relationships — Level A
- **Severity:** Level A blocker (HIGH)
- **Location:** `LandingV2.tsx:644-664`
- **Issue:** Three form fields — `name`, `email`, `scenario` — have only `placeholder` attributes ("Your name", "you@company.com", "Briefly: what are you hoping..."). Placeholders are NOT labels. Screen readers may announce them (depending on UA/AT pairing) but:
  - Placeholders disappear on input — users with cognitive load lose context.
  - Some screen readers don't announce placeholders as accessible names.
  - Voice control software cannot reliably target a field by its placeholder.
- **Fix:** Add a real `<label>` for each input. Either visible (best for usability) or `.sr-only` if the design demands placeholder-only:
  ```tsx
  <label htmlFor="contact-name" className="sr-only">Your name</label>
  <input id="contact-name" type="text" ... aria-required="false" />
  <label htmlFor="contact-email" className="sr-only">Email address</label>
  <input id="contact-email" type="email" required aria-required="true" ... />
  <label htmlFor="contact-scenario" className="sr-only">What can we help with?</label>
  <textarea id="contact-scenario" ... />
  ```
- **Bonus:** The form has no `aria-live` region for the success / error states (`submitted`, `error`). Screen reader users won't know the form succeeded. Add `<div aria-live="polite" aria-atomic="true">` wrapping the success / error nodes.

#### A11Y-022 — Hero quick form lacks `aria-live` on success / error
- **WCAG SC:** 4.1.3 Status Messages — Level AA
- **Severity:** Level AA blocker (MEDIUM)
- **Location:** `LandingV2.tsx:477-498`
- **Issue:** When `submitted` becomes true, the form is replaced by `<span class="lex-quick-success">Sent — check your inbox</span>`. Without an `aria-live` region, screen readers won't announce the change.
- **Fix:** Wrap the conditional in `<div aria-live="polite">{submitted ? <span>...</span> : <form>...</form>}</div>`. Same for the error paragraph at line 498.

#### A11Y-023 — Audit row links open in new tab without warning
- **WCAG SC:** 3.2.5 Change on Request — Level AAA (not required for AA but noted)
- **Severity:** LOW
- **Location:** `LandingV2.tsx:531-545`
- **Issue:** `target="_blank" rel="noopener noreferrer"` is correct; users with screen readers won't be warned that focus jumps to a new tab. AAA only.
- **Fix (optional):** Append `aria-label={\`${row.title} (opens in new tab)\`}` for AAA polish.

#### A11Y-024 — Audit row markup has heading-like `<strong>` inside the link
- **WCAG SC:** 1.3.1 — Level A
- **Severity:** LOW
- **Location:** `LandingV2.tsx:540`
- **Issue:** `<strong>{row.tag}</strong>` is presentational; the visual treatment (uppercase, brand-soft colour) suggests a label, not emphasis. Screen readers will announce it as emphasised. The semantic intent is "category label".
- **Fix:** Wrap as `<span className="lex-audit-tag-inline">{row.tag}</span>` and drop the `<strong>`. Visual styling stays the same.

#### A11Y-025 — Pricing tier list `<ul>` with checkmark via `::before` content
- **WCAG SC:** 1.3.1 — Level A
- **Severity:** LOW
- **Location:** `LandingV2.tsx:301-302`
- **Issue:** `.lex-tier li::before { content: "✓ "; color: var(--accent-a); }`. The checkmark is decorative; CSS-generated content is not always announced by screen readers. Whether it's announced depends on AT — VoiceOver does, NVDA does too, but it's better to encode it explicitly with `aria-hidden`.
- **Fix:** Use real markup: `<li><span aria-hidden="true">✓</span> {feature}</li>` and remove the `::before`. Or accept the variability — AAA territory.

#### A11Y-026 — Reduced-motion handling ✓
- **WCAG SC:** 2.3.3 Animation from Interactions — Level AAA (we still respect it); 2.2.2 Pause, Stop, Hide — Level A for the pulse animation
- **Severity:** Compliant
- **Location:** `LandingV2.tsx:62-68`
- **Status:** PASS. The `@media (prefers-reduced-motion: reduce)` block disables `lex-reveal` transforms, sets all animations to `none`, and reduces transitions to 0.001ms. Pulse animation is also disabled.

#### A11Y-027 — Pulse and glow animations are decorative — exempt from 2.2.2
- **WCAG SC:** 2.2.2 Pause, Stop, Hide — Level A
- **Severity:** Compliant
- **Location:** `LandingV2.tsx:106-110, 134-137`
- **Status:** PASS. Both animations are < 5 seconds in duration / decorative motion of pulses, and reduced-motion preference disables them. Animations don't auto-update content (which would trigger 2.2.2's pause requirement).

#### A11Y-028 — Hero h1 uses `<em>` inside `font-style: italic` brand-soft styling (visual emphasis)
- **WCAG SC:** 1.3.1 — Level A
- **Severity:** LOW
- **Location:** `LandingV2.tsx:142`
- **Status:** PASS. `<em>` semantically conveys emphasis; visual italic + colour change is a valid presentation. Screen readers will pause/inflect.

#### A11Y-029 — Form submit buttons use disabled state without `aria-disabled` mirror
- **WCAG SC:** 4.1.2 — Level A
- **Severity:** LOW
- **Location:** `LandingV2.tsx:492, 665`
- **Issue:** `disabled={submitting || !email}` — native `disabled` removes the button from the tab order entirely. This is correct behaviour for "must enter email first," but means keyboard users can't tab to it to discover *why* it's disabled. WCAG-compliant either way, but UX-polish improvement.
- **Fix (optional):** Use `aria-disabled="true"` + click handler that no-ops, plus inline help text "Enter your email first" announced via `aria-describedby`. Not a blocker.

#### A11Y-030 — Inline error text uses `color: '#ef4444'` only (no icon, no aria role)
- **WCAG SC:** 1.4.1 Use of Color — Level A; 4.1.3 Status Messages — Level AA
- **Severity:** Level A blocker (MEDIUM)
- **Location:** `LandingV2.tsx:498, 668`
- **Issue:** "Could not save your email" is conveyed only by red colour. Colour-blind users (especially red-green deuteranopia) may not perceive the distinction from the surrounding text. There's also no `role="alert"` so screen readers won't announce the error after submission.
- **Fix:** `<p role="alert" style={{...}}>⚠ Could not save your email — please try again.</p>` — adds icon (perceivable without colour) AND announces. Use `role="alert"` not `aria-live` because the message appears after a user action.

#### A11Y-031 — `outline: none` on form inputs without `:focus-visible` replacement
- **WCAG SC:** 2.4.7 Focus Visible, 2.4.11 Focus Appearance, 1.4.11 Non-text Contrast — all Level AA
- **Severity:** Level A blocker (HIGH) — re-stated for emphasis
- **Location:** `LandingV2.tsx:173, 321`
- **Fix:**
  ```css
  .lex-quick-form input:focus-visible,
  .lex-contact-form input:focus-visible,
  .lex-contact-form textarea:focus-visible {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
    border-color: var(--brand);
  }
  ```
  This satisfies 2.4.11's "≥ 2 CSS px solid area, ≥ 3:1 contrast against adjacent" requirement.

#### A11Y-032 — Sections lack `aria-labelledby` connecting them to their headings
- **WCAG SC:** 1.3.1 — Level A
- **Severity:** LOW (informational — not strictly required since the heading is the first child)
- **Location:** `LandingV2.tsx:506, 525, 553, 577, 634`
- **Status:** Optional polish. `<section aria-labelledby="audits-heading">` + `<h2 id="audits-heading">` is best-practice but not required when the heading is the section's first content.

---

### `apps/{lexaudit,brai,tracr,docai,leadforge,forge}/app/layout.tsx`

#### A11Y-033 — `<html lang="en">` ✓
- **WCAG SC:** 3.1.1 Language of Page — Level A
- **Severity:** Compliant across all six layouts
- **Status:** PASS.

#### A11Y-034 — "Back to BizLegal AI" top bar adds an extra navigation surface above the SiteShell
- **WCAG SC:** 1.3.1, 2.4.1, 2.4.3 Focus Order — Level A
- **Severity:** Level A blocker (MEDIUM)
- **Locations:** `apps/lexaudit/app/layout.tsx:43-46`, `apps/docai/web/app/layout.tsx:61-64`, `apps/tracr/app/layout.tsx:52-55`, `apps/forge/apps/web/app/layout.tsx:71` (anchor), `apps/leadforge/app/layout.tsx` (no top bar — OK), `apps/brai/app/layout.tsx` (no top bar — OK)
- **Issue:** The fixed top bar with "← Back to BizLegal AI" + a second `<ThemeToggle>` lives OUTSIDE the SiteShell's `<header>`. Several issues:
  1. **Two theme toggles per page** — the legacy `<ThemeToggle>` (in the top bar) and the new `<ThemeToggleButton>` from the design system (inside the SiteShell). They control DIFFERENT theme systems (`bl-theme` vs `lex-theme` / `brai-theme` / etc). Users will see two toggles with overlapping intent — confusing for keyboard / screen-reader users especially.
  2. The top bar is `position: fixed` at zIndex 9999 — keyboard focus order: `Skip link (missing!) → Top-bar back-link → Top-bar theme-toggle → SiteShell header brand → SiteShell nav → SiteShell theme-toggle → SiteShell CTA → Main content`. That's a lot of focus stops before content.
  3. The top bar is not within a landmark — it should ideally be inside `<nav aria-label="Cross-site">` or absorbed into the SiteShell's banner.
  4. The "← Back to BizLegal AI" `<a>` in `lexaudit`, `docai`, `tracr` is **inside a `<div>`**, not a `<nav>` — fails landmark semantics for the contextual back-link.
- **Fix:**
  - Either fold the back-link into the SiteShell (preferred — the SiteShell becomes the single source of nav truth); OR
  - Wrap the top bar in `<nav aria-label="BizLegal AI sites">` and remove the duplicate theme toggle (keep only the SiteShell one).
  - Forge's variant (line 71) has the entire bar as a single `<a>` — better landmark-wise but the inner `ThemeToggle` is missing entirely from forge, so check the pattern is intentional.

#### A11Y-035 — Forge layout has its own `<header>` and `<footer>` instead of SiteShell — divergent a11y profile
- **WCAG SC:** Cross-cutting
- **Severity:** MEDIUM
- **Location:** `apps/forge/apps/web/app/layout.tsx:77-194`
- **Issue:** Forge does NOT use SiteShell — it inlines its own header (line 77-97) and footer (line 102-194). Consequences:
  - No `role="banner"` / `role="contentinfo"` (HTML5 implicit roles still apply if structurally correct — header is direct child of body, OK)
  - No `aria-label` on the `<nav>` (line 82) — fails 1.3.1 Info and Relationships when there are multiple nav landmarks (the footer doesn't have a nav, so it's a single nav — OK by some readings, but be explicit).
  - The `⌘K` `<kbd>` on line 91 is decorative — should be `aria-hidden`.
  - Social-media icons (lines 149-152) are SVGs without `<title>` or `aria-label` on the parent `<a>`. Screen reader announces "link" with no destination.
  - Trust-badge SVGs (lines 161, 165, 169, 173) are decorative checkmarks alongside text "SSL Secured" etc. — they should be `aria-hidden="true"`. They're not.
  - Emoji used as bullets (line 143-145): `📧`, `🕐`, `🌍` — emoji are announced verbosely by screen readers ("envelope open with letter," "clock face nine o'clock," "globe with meridians"). Wrap in `<span aria-hidden="true">📧</span>` and provide explicit text equivalents OR remove.
- **Fix:** Migrate Forge to SiteShell for consistency, OR retrofit the inline header/footer with: (a) `aria-label` on social-icon links, (b) `aria-hidden` on decorative SVGs and emoji, (c) `aria-hidden` on the `⌘K` kbd, (d) explicit `<nav aria-label="Primary">`.

#### A11Y-036 — Subdomains don't preload the `--lex-display` / `--lex-body` font subsets
- **WCAG SC:** N/A (performance)
- **Severity:** N/A — out of a11y scope but flagged for FCP / CLS budget.

---

## 3. Compliance Summary

| Level | Count | Examples |
|---|---|---|
| **Level A blockers** | **3** | A11Y-007 (skip link), A11Y-020 (sr-only undefined), A11Y-021 (contact form labels) |
| **Level AA blockers** | **6** | A11Y-001 (ember gradient), A11Y-002 (ember-2 solid), A11Y-003 (brand-soft small text light themes), A11Y-004 (accent-a Royal Light chip), A11Y-011 (theme toggle focus), A11Y-014 (sticky dismiss target size), A11Y-031 (input focus stripped) |
| Level AA medium | 4 | A11Y-013 (sticky tabIndex), A11Y-017 (badge reflow), A11Y-022 (aria-live), A11Y-030 (color-only error), A11Y-034 (top-bar focus), A11Y-035 (forge inline) |
| Compliant / informational | 14 | landmarks, switch role, reduced-motion, heading hierarchy, etc. |

**Total findings: 36** (3 Level A blockers + 6 Level AA blockers + 4–6 mediums + lows + compliant items).

---

## 4. Prioritised Fix Sequence (recommended)

### Sprint 1 — unblock public launch (Level A)
1. **A11Y-020** — Inline `.sr-only` rule in `lexCSSv2` and `siteShellCSS`. ~5 min.
2. **A11Y-021** — Add `<label>` to all three contact-form fields. ~10 min.
3. **A11Y-007** — Add skip-to-main link in `SiteShell.tsx`, give `<main id="main" tabIndex={-1}>`. ~15 min.

### Sprint 1 — unblock public launch (Level AA — text contrast)
4. **A11Y-001 / A11Y-002** — Darken `--ember` and `--ember-2` across all four themes, OR change CTA text/background scheme. ~20 min + visual QA.
5. **A11Y-003** — Introduce `--brand-text-strong` token for small-text use, swap consumers. ~25 min.
6. **A11Y-004** — Darken Royal Light `--accent-a` to `#0E7E96`. ~5 min.
7. **A11Y-031** — Add `:focus-visible` rules for all form inputs in `lexCSSv2`. ~10 min.
8. **A11Y-011** — Add `:focus-visible` for theme toggle button. ~10 min.
9. **A11Y-014** — Bump sticky dismiss button to 24×24. ~5 min.

### Sprint 2 — robustness & UX polish (Level AA medium)
10. **A11Y-022 / A11Y-030** — Add `aria-live` / `role="alert"` for form status messages. ~15 min.
11. **A11Y-013** — Conditionally render sticky badge instead of toggling visibility. ~10 min.
12. **A11Y-034** — Resolve duplicate theme-toggle pattern across subdomain layouts. ~30 min cross-app.
13. **A11Y-035** — Migrate Forge to SiteShell OR retrofit inline a11y. ~1–2 hr.

### Sprint 3 — best-practice polish (Level A low / compliant improvements)
14. **A11Y-005, A11Y-009, A11Y-024, A11Y-025, A11Y-029, A11Y-032** — semantic refinements.
15. **A11Y-017** — sticky-badge mobile reflow rule.

---

## 5. Validation Checklist

After fixes, verify with:

- [ ] **axe DevTools** scan on all six subdomain homepages in both themes (where applicable) — 0 critical/serious.
- [ ] **Keyboard-only walkthrough** of each homepage: Skip link → primary nav → theme toggle → CTA → main content → all interactive sections → contact form → footer. Every focus stop visible at ≥3:1.
- [ ] **VoiceOver (macOS) + Safari** — landmark navigation (`Ctrl+Opt+U`), heading navigation (`Ctrl+Opt+Cmd+H`), form-control navigation. Every form field has a name. Every status message announced.
- [ ] **NVDA + Firefox (Windows)** — same as above. Theme toggle announced as "switch, off / on".
- [ ] **Reduced motion** — toggle OS preference, verify zero animations / scroll reveals.
- [ ] **400% zoom** — Chrome `Ctrl++` until 400%, no horizontal scroll on any homepage. Sticky badge does not overlap content.
- [ ] **Manual contrast spot-check** — use Stark / Adobe colour-contrast plugins on the actual rendered hero CTA, audit-tag chips, footer text, sticky badge dismiss "×".
- [ ] **Lighthouse a11y score** ≥ 95 on each homepage.

---

## 6. WCAG 2.2 Criteria Mapping (deduplicated)

The following success criteria are referenced in this audit:

- **1.1.1** Non-text Content (Level A)
- **1.3.1** Info and Relationships (Level A)
- **1.4.1** Use of Color (Level A)
- **1.4.3** Contrast (Minimum) (Level AA)
- **1.4.10** Reflow (Level AA)
- **1.4.11** Non-text Contrast (Level AA)
- **2.2.2** Pause, Stop, Hide (Level A)
- **2.4.1** Bypass Blocks (Level A)
- **2.4.3** Focus Order (Level A)
- **2.4.6** Headings and Labels (Level AA)
- **2.4.7** Focus Visible (Level AA)
- **2.4.11** Focus Appearance (Level AA — new in 2.2)
- **2.5.8** Target Size (Minimum) (Level AA — new in 2.2)
- **3.1.1** Language of Page (Level A)
- **3.2.5** Change on Request (Level AAA — informational only)
- **3.3.2** Labels or Instructions (Level A)
- **4.1.2** Name, Role, Value (Level A)
- **4.1.3** Status Messages (Level AA)

WCAG 2.2 net-new criteria audited and addressed: 2.4.11 Focus Appearance, 2.5.8 Target Size, and 3.3.7 Redundant Entry (no findings on 3.3.7 because no multi-step flow re-asks users for previously-entered data within the audited surface).

---

## 7. Out of Scope (for follow-up)

- Decision-tree intake flow (`/decision-tree`)
- Dashboard / app-internal routes (suppressed by `chromeSuppressPaths`)
- Forge product pages (`/boi`, `/audit`, `/passport`, `/pricing`)
- Cookie consent banner (`CookieConsent` component)
- Legal Shield component (`LegalShield variant="micro"`)
- Cross-browser AT testing (recommend follow-up with real-device VoiceOver / NVDA / TalkBack passes)

---

**End of audit.**
