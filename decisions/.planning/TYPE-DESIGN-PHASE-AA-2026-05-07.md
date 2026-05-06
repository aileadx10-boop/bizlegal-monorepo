# Type-Design Audit -- @bizlegal/themes (Phase AA)

**Date:** 2026-05-07
**Auditor:** type-design-analyzer
**Package:** packages/themes (4 ThemeSpecs, ThemeProvider, SiteShell, LandingV2, StickyLeadBadge)
**Files in scope:** themes.ts, apply.ts, provider.tsx, SiteShell.tsx, StickyLeadBadge.tsx, LandingV2.tsx

---

## Executive Verdict

**Severity counts:** 3 HIGH, 7 MED, 4 LOW

The package's type surface is above-average for a hand-rolled design system. ThemeId as a string union is well-chosen, every public interface uses readonly modifiers, and ReadonlyArray is applied consistently to nav/audit/tier collections. Where it falls short: (1) the central ThemeSpec.vars payload is Record<string, string>, throwing away every typo-catching benefit at the most-edited surface in the package; (2) the Result-shape returned by onLeadSubmit is loosely typed so callers cannot rely on `error` being present on failure; (3) several invariants enforced at runtime (alternate whitelist, chromeSuppressPaths early-return, sticky-lead-null disable) paper over what should be discriminated unions or branded types.

The bones are good. The fixes are mostly local refactors that tighten one file each, with no API breaks beyond the optional ones called out below.

---

## Findings

### F-1 [HIGH] ThemeSpec.vars is Record<string, string> -- no autocomplete on the most-edited surface
**Type:** ThemeSpec
**File:** packages/themes/src/themes.ts:21
**Pillar:** Usefulness + Invariant expression

`vars: Readonly<Record<string, string>>` accepts any string key. The 4 ThemeSpecs each duplicate ~21 CSS-var keys (--ink, --brand, --hero-bg, etc.). A typo in any one (e.g. --inkk) is silently legal at compile time and only manifests as a missing color at render time. There is also no compile-time guarantee that all four themes define the same keys, which is the entire point of having a theme registry.

**Refactor:**

```ts
export const THEME_VAR_KEYS = [
  '--ink', '--ink-2', '--ink-3',
  '--surface', '--surface-2',
  '--brand', '--brand-soft',
  '--accent-a', '--accent-b', '--accent-c',
  '--ember', '--ember-2',
  '--paper', '--paper-dim',
  '--line', '--line-2',
  '--hero-bg', '--audits-bg', '--spotlight-bg',
  '--bleed-bg', '--contact-bg',
  '--footer-bg', '--shield-grad',
] as const
export type ThemeVarKey = typeof THEME_VAR_KEYS[number]

export interface ThemeSpec {
  readonly id: ThemeId
  readonly vars: Readonly<Record<ThemeVarKey, string>>  // exhaustive
  // ... other fields unchanged
}
```

With `Record<ThemeVarKey, string>` (not partial), missing a key fails the build. With the literal-key union, --inkk fails the build. This is the single highest-leverage fix in the package.

---

### F-2 [HIGH] onLeadSubmit return type is not a discriminated union -- error is silently optional on failure
**Type:** LandingV2Props.onLeadSubmit
**File:** packages/themes/src/LandingV2.tsx:479-488
**Pillar:** Invariant expression + Enforcement

```ts
onLeadSubmit: (...) => Promise<{ ok: boolean; error?: string }>
```

A handler can legally return `{ ok: false }` with no error, and the caller (Hero and Contact, lines 556-559 and 763-766) reads `res.error?.trim()`. This means a failure with no message renders as `submit_failed` with no detail. The type system permits exactly the bug the runtime code already has to defend against.

Worse, on success the type permits `{ ok: true, error: 'oops' }`, which is meaningless.

**Refactor:**

```ts
export type LeadSubmitResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly error: string }   // required on failure

export interface LeadSubmitArgs {
  readonly email: string
  readonly name?: string
  readonly scenario?: string
  readonly source: 'home-quick-capture' | 'home-intake'   // literal union
  readonly turnstile_token?: string
}
```

After this, the `res.error?.trim()` defensive check inside Hero/Contact becomes `res.error.trim()` with no `?.`, because TypeScript narrows the failure branch. Note: source is also a free string today (line 485). The two real callers pass exactly two literals, so a literal union closes that hole at zero cost.

---

### F-3 [HIGH] applyTheme(id: ThemeId) -- runtime fallback papers over a type leak
**Type:** applyTheme
**File:** packages/themes/src/apply.ts:28-47
**Pillar:** Encapsulation + Enforcement

applyTheme accepts ThemeId at the type level, but lines 32-39 contain a console.warn + recursive fallback for unknown ids. There are exactly two ways an unknown id reaches this function:

1. **Internal callers** (provider.tsx line 43): these are statically ThemeId. The runtime check is dead code on this path.
2. **External callers** crossing a serialization boundary: getStoredTheme already validates with `v in THEMES` (line 53) and returns ThemeId | null. The provider's setTheme re-validates with the allowed whitelist.

The runtime check therefore exists to defend against direct external use of `applyTheme(someBareString as ThemeId)` -- callers who lie to the type system. This is a real concern (the function is exported from the package barrel), but the right fix is to keep the runtime check AND narrow the parameter type so the warn-branch is explicit:

**Refactor:**

```ts
// Internal: strict, fast path
function applyThemeStrict(id: ThemeId, root: HTMLElement | null = null): void {
  // ... existing body, no fallback branch
}

// Public: defensive, accepts unknown
export function applyTheme(id: string, root: HTMLElement | null = null): void {
  if (id in THEMES) return applyThemeStrict(id as ThemeId, root)
  console.warn('[applyTheme] Unknown theme id', id, 'falling back to', FALLBACK_THEME)
  return applyThemeStrict(FALLBACK_THEME, root)
}
```

This makes the dual-mode honest: the public surface accepts string (because that is the runtime contract), the internal path is ThemeId. The current single-typed signature lies to TypeScript users that bare strings are rejected when they are silently corrected. Alternative if you would rather keep the strict signature: drop the runtime fallback entirely and let it crash loudly. Pick one. The current claims-strict-behaves-loose combination is the worst of both.

---

### F-4 [MED] ThemeProviderProps.alternate and storageKey have no relational invariant
**Type:** ThemeProviderProps
**File:** packages/themes/src/provider.tsx:17-22
**Pillar:** Invariant expression

storageKey is required even when alternate is null/undefined, but with no alternate there is nothing to persist (the toggle button hides itself line 92, and setTheme short-circuits on non-allowed ids). A subdomain that wires `<ThemeProvider primary='daybreak' storageKey='bl-forge-theme'>` is paying for unused infrastructure. Conversely, a subdomain that supplies alternate but forgets storageKey cannot persist toggles.

**Refactor (discriminated):**

```ts
export type ThemeProviderProps =
  | {  // single-theme mode
      readonly primary: ThemeId
      readonly alternate?: undefined | null
      readonly storageKey?: string  // optional, ignored
      readonly children: React.ReactNode
    }
  | {  // toggle mode requires storageKey
      readonly primary: ThemeId
      readonly alternate: ThemeId
      readonly storageKey: string
      readonly children: React.ReactNode
    }
```

Also: alternate should not equal primary (silent no-op toggle today). A brand-check at the type level isn't free in TS, but a runtime invariant + JSDoc captures the intent.

---

### F-5 [MED] SiteShellProps.stickyLead = {...} | null -- null-as-disable-signal is unidiomatic
**Type:** SiteShellProps.stickyLead
**File:** packages/themes/src/SiteShell.tsx:96
**Pillar:** Encapsulation + Usefulness

null is required (no `?`) and means explicitly disabled, while undefined (via missing property) is forbidden by the type. This forces every caller to write `stickyLead: null` even when they mean I-do-not-care. Standard React idiom is `prop?: T` (undefined = absent = use default), with null reserved for cases where undefined and explicit-disable need to be distinguished.

The shell never distinguishes undefined from null here: both mean do-not-render. The null signal is a stylistic choice with no semantic payoff.

**Refactor:**

```ts
/** Sticky lead badge. Omit to disable globally for this subdomain. */
readonly stickyLead?: { readonly label: string; readonly href: string }
```

Then `showBadge = !suppressChrome && !!stickyLead && !pathMatches(...)`. One less prop to remember; the type stops lying about which absence sentinel it wants.

---

### F-6 [MED] StickyLeadBadgeProps.href and label accept any string including empty
**Type:** StickyLeadBadgeProps
**File:** packages/themes/src/StickyLeadBadge.tsx:16-21
**Pillar:** Invariant expression

Three issues stacked:

1. `href: ''` renders `<a href=''>` which is a same-page reload.
2. threshold should be in [0, 1] per the JSDoc comment but the type accepts NaN, negatives, etc.
3. The badge uses the same { label, href } shape as SiteShellProps.stickyLead and cta -- DRY this (see F-7).

For Phase AA, the LOW-effort fix is consolidating the { label; href } shape into a single NavLink type and clamping threshold at runtime. A branded NonEmptyString href is overkill unless inputs come from external authors.

---

### F-7 [MED] NavLink shape duplicated 6x across the package -- no shared NavLink interface
**Type:** Implicit shape `{ label: string; href: string }`
**Files:**
- SiteShell.tsx:87 -- nav: ReadonlyArray<{ label: string; href: string }>
- SiteShell.tsx:88 -- cta: { label: string; href: string }
- SiteShell.tsx:96 -- stickyLead: { label: string; href: string } | null
- SiteShell.tsx:93 -- footer.links?: ReadonlyArray<{ label: string; href: string }>
- LandingV2.tsx:450 -- nav: ReadonlyArray<{ label: string; href: string }>
- LandingV2.tsx:454 -- heroPrimaryCta: { label: string; href: string }

**Pillar:** Usefulness (DRY)

Six occurrences of the same anonymous structural type. Adding a target or rel field (e.g. for target=_blank external links) requires editing six call sites and praying TS catches all of them.

**Refactor:**

```ts
// packages/themes/src/types.ts
export interface NavLink {
  readonly label: string
  readonly href: string
  readonly external?: boolean  // adds target=_blank rel=noopener
}
```

Then each site uses `NavLink | ReadonlyArray<NavLink>`. The `external?` extension would also DRY the runtime branch in LandingV2.tsx:664-665 for audit rows.

---

### F-8 [MED] LandingV2Content.heroHeadline: React.ReactNode allows arbitrary JSX in content
**Type:** LandingV2Content.heroHeadline
**File:** packages/themes/src/LandingV2.tsx:452
**Pillar:** Encapsulation + Invariant expression

React.ReactNode accepts strings, fragments, full component trees, portals, anything. The render site (line 583) is `<h1 className='serif'>{content.heroHeadline}</h1>` which will accept any React tree. Useful for the `<em>` italic accent on brand-soft (the design uses `<em>` to colorize a clause), but also allows content authors to inject `<script>` tags, `<button>`s nested inside `<h1>`, or anything else that breaks accessibility.

This is intentional flexibility (the design needs `<em>` for the violet accent), but the type does not communicate the contract.

**Refactor:**

```ts
// Tighten to string-with-optional-inline-emphasis
export type HeadlineNode =
  | string
  | ReadonlyArray<string | { readonly emphasis: string }>

readonly heroHeadline: HeadlineNode
```

Then a small helper renders alternating string/emphasis parts as alternating fragments and `<em>` spans. Trade-off: less flexible than ReactNode, but content files become serializable JSON (which the design system claims to want -- content is per-subdomain config, not per-subdomain JSX). If full JSX flexibility is intentional, document it explicitly in the JSDoc on the prop.

---

### F-9 [MED] audits[].url? + the runtime spread is fragile
**Type:** AuditRow
**File:** packages/themes/src/LandingV2.tsx:433-438, render at 661-666
**Pillar:** Invariant expression

The runtime spread `{...(row.url ? { target: '_blank', rel: 'noopener noreferrer' } : {})}` defends against a real invariant: external links must have target=_blank + rel=noopener noreferrer, internal/missing links must not. The type does not express this. `{ url: '#' }` and `{ url: 'https://x' }` and `{}` are all legal at the same call site, with three different rendering behaviors.

**Refactor (discriminated):**

```ts
export type AuditRow =
  | { readonly date: string; readonly tag: string; readonly title: string; readonly external: false }
  | { readonly date: string; readonly tag: string; readonly title: string; readonly external: true; readonly url: string }
```

Then non-external rows render as `<span>` instead of `<a href='#'>`, eliminating the broken-link accessibility smell.

---

### F-10 [MED] PricingTier.featured?: boolean -- only one tier should be featured, not enforced
**Type:** PricingTier
**File:** packages/themes/src/LandingV2.tsx:439-447, render at 712-713
**Pillar:** Invariant expression

`tiers.filter(t => t.featured).length` is unconstrained. The CSS in `.lex-tier.feat` (lines 361-372) translates the featured tier up by 12px and applies a brand glow -- it is visually broken if 0 or 2+ tiers are featured. The type allows three featured tiers.

**Refactor:** Move featured off the tier and onto the parent:

```ts
export interface LandingV2Content {
  readonly tiers: ReadonlyArray<PricingTier>
  /** Index into tiers of the visually featured tier. Optional -- omit for a flat row. */
  readonly featuredTierIndex?: number
}

export interface PricingTier {
  readonly name: string
  readonly price: string
  // ...no featured field
}
```

Render: `t.featured` becomes `i === content.featuredTierIndex`. Now the single-featured-tier invariant is expressed at the type level (you can only point to one index).

---

### F-11 [LOW] getTheme(id: ThemeId) throws on unknown id, but id: ThemeId is already exhaustive
**Type:** getTheme
**File:** packages/themes/src/themes.ts:266-270
**Pillar:** Encapsulation

Same dynamic as F-3: `THEMES: Readonly<Record<ThemeId, ThemeSpec>>` is exhaustive, so `THEMES[id]` is statically ThemeSpec, and the !theme branch is unreachable on well-typed input. Either drop the runtime check (rely on the registry being exhaustive) or widen the parameter to `string` like F-3 suggests for applyTheme. Pick consistency with applyTheme.

---

### F-12 [LOW] themeFOUCScript builds Record<string, ThemeSpec> instead of a partial keyed by ThemeId
**Type:** themeFOUCScript bundle local
**File:** packages/themes/src/apply.ts:92
**Pillar:** Usefulness

`const bundle: Record<string, ThemeSpec> = {}` should be `Partial<Record<ThemeId, ThemeSpec>>` since the keys are always ThemeIds drawn from the allowed array. Local-only; LOW because it does not affect any export.

---

### F-13 [LOW] siteShellCSS and lexCSSv2 are typed as bare string -- no template tagging
**Type:** siteShellCSS, lexCSSv2
**Files:** SiteShell.tsx:24, LandingV2.tsx:31
**Pillar:** Usefulness

These are CSS strings injected via dangerouslySetInnerHTML. Tagging them with a branded SafeCSS type and a `css` template literal helper would communicate this-has-been-audited-do-not-concatenate-untrusted-input-here. LOW because the values are package-owned constants, not user input.

---

### F-14 [LOW] chromeSuppressPaths and stickyLeadSuppressPaths are ReadonlyArray<string> -- paths are unbranded
**Type:** SiteShellProps
**File:** packages/themes/src/SiteShell.tsx:99-103
**Pillar:** Invariant expression

These are URL path prefixes. Today an entry like `'login'` (no leading /) silently breaks the `pathname.startsWith(p + '/')` check (line 128 produces `'login/'` which never matches `/login/foo`). A branded RoutePrefix type minted by a `route` factory would prevent this. LOW because the defaults are correct and the runtime impact is feature-silently-fails-to-activate, not breakage.

---

## Summary Table

| ID | Severity | Type | File:line | Pillar |
|---|---|---|---|---|
| F-1 | HIGH | ThemeSpec.vars | themes.ts:21 | Usefulness + Invariant |
| F-2 | HIGH | LandingV2Props.onLeadSubmit | LandingV2.tsx:479 | Invariant + Enforcement |
| F-3 | HIGH | applyTheme(id) dual-mode | apply.ts:28 | Encapsulation + Enforcement |
| F-4 | MED | ThemeProviderProps | provider.tsx:17 | Invariant |
| F-5 | MED | SiteShellProps.stickyLead | SiteShell.tsx:96 | Encapsulation |
| F-6 | MED | StickyLeadBadgeProps | StickyLeadBadge.tsx:16 | Invariant |
| F-7 | MED | NavLink duplication | SiteShell.tsx + LandingV2.tsx | Usefulness |
| F-8 | MED | heroHeadline: ReactNode | LandingV2.tsx:452 | Encapsulation |
| F-9 | MED | AuditRow.url? | LandingV2.tsx:433 | Invariant |
| F-10 | MED | PricingTier.featured? | LandingV2.tsx:439 | Invariant |
| F-11 | LOW | getTheme runtime check | themes.ts:266 | Encapsulation |
| F-12 | LOW | bundle: Record<string, ...> | apply.ts:92 | Usefulness |
| F-13 | LOW | CSS strings unbranded | SiteShell + LandingV2 | Usefulness |
| F-14 | LOW | path prefixes unbranded | SiteShell.tsx:99 | Invariant |

---

## Recommended Sequence

If implementing in priority order (Phase AA+1 cleanup):

1. **F-1** (one-file change in themes.ts, exhaustive var-key union) -- biggest leverage
2. **F-2** (discriminated LeadSubmitResult, literal-union source) -- fixes a real defensive-code smell at the call sites
3. **F-7** (extract NavLink) -- prerequisite that simplifies F-5 and F-6
4. **F-3** (split applyTheme into strict + public) -- clean up the lying signature
5. **F-9, F-10** (discriminated AuditRow, single featuredTierIndex) -- express the visual invariants in types

LOW-severity items can wait or be folded into any future refactor pass touching the same file.
