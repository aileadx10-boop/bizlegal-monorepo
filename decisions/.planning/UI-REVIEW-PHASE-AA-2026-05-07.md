# Phase AA — Subdomain Design Pass · UI Review (Code-Only)

**Audited:** 2026-05-07
**Auditor stance:** Adversarial. Anti-template policy from `~/.claude/rules/web/design-quality.md` enforced.
**Mode:** Code-only — read source, reason from code. No browser screenshots (prior attempt budget-overran).
**Scope:** 3 full-template homepages (lexaudit, brai, tracr) + 3 rebrand-only homepages (docai/web, leadforge, forge/apps/web) + LandingV2 + SiteShell + 4 ThemeSpecs.

> **Companion findings — already documented, NOT repeated here:**
> - WCAG: 3 Level A + 6 Level AA blockers in `A11Y-AUDIT-PHASE-AA-2026-05-07.md`
> - Security: 1 HIGH Turnstile regression in `SEC-REVIEW-SITESHELL-2026-05-07.md`
> - Silent failures: 4 CRIT in `SILENT-FAIL-PHASE-AA-2026-05-07.md`

---

## Executive Verdict

**Overall: 30 / 60 — "polished generic" with one section of intentional design (the LandingV2 hero gradient stack), surrounded by uniform cards, repeated section rhythm, and a Frankenstein bolt-on on lexaudit.**

The 4-theme token system is genuinely good — distinct gradient personalities per subdomain (twilight purple-bleed vs royal-blue electric vs daybreak warm paper). But the LandingV2 template that consumes those tokens is a **textbook stack**: hero → 3-card-grid → list-row → stat-row → 3-tier-card-row → form. Every section is `lex-section` with **identical 96px padding**, every card is `border-radius: 18px` with `background: var(--surface)` + the same hover lift. The four hover states are functionally one hover state with different translateY values.

The hero is the only surface that earns its keep visually (multi-radial gradient stack on `--hero-bg` per theme is intentional). Below the hero, the page becomes a Tailwind/shadcn skeleton with a coat of paint. **Direct violation of the anti-template policy:** uniform radius (18px everywhere), uniform spacing (96px section padding), uniform shadows (single `0 18px 40px -18px brand` recipe reused 4 times), uniform card grid (the very thing the policy explicitly bans).

The rebrand-only set is worse on coherence: docai keeps a Three.js scan flow, leadforge keeps a vendored landing, forge has its own design tokens (`--bl-*` not `--ink/--paper/--brand`) and an entirely separate type system. Three rebrand-only pages share **only** the StickyLeadBadge and the SiteShell chrome. The "subdomain design pass" coheres at the chrome level, fractures at the body.

**This looks polished, not opinionated. It is what gets shipped when a designer with taste briefs a template, and a template author with taste implements that brief generically.** It does not look like a product with a point of view.

---

## Per-Pillar Scoring

Score scale: 0 (broken/absent) · 5 (passable, default-feeling) · 10 (intentional, opinionated, irreducibly this product).

### Full-Template Homepages (lexaudit / brai / tracr — same LandingV2)

| # | Pillar | Score | One-line justification |
|---|---|---|---|
| 1 | Hierarchy via scale contrast | 6/10 | Hero h1 `clamp(40, 6vw, 76)` vs section h2 `clamp(28, 3.4vw, 40)` — ratio is fine, but every section h2 is identical weight/treatment and there is no visual inflection between the 4 body sections. Brief / Audits / Spotlight / Pricing are scale-equivalent. |
| 2 | Intentional rhythm | 3/10 | **Anti-template fail.** Every section uses `padding: 96px 24px` (LandingV2.tsx:202). Brief grid: `gap: 18px`. Audits: `gap: 10px`. Pricing: `gap: 16px`. Section sub-paragraphs all `font-size: 15px, max-width: 640px`. There is no editorial pacing — the page reads as five equal beats. |
| 3 | Depth/layering | 5/10 | Backdrop-filter blur on nav + cards + sticky badge is real depth. Hero gradient stack is the strongest moment. But every card uses the same `var(--surface)` glass + same border + same translateY(-2px) hover. No overlap, no z-axis storytelling, no break-out elements crossing section boundaries. |
| 4 | Typography character + pairing | 6/10 | Fraunces (display, weight 300) + Inter (body) is a defensible pairing — Fraunces low-weight serif against neutral sans is doing real work in the hero and the spotlight quote. But Fraunces is then used flat across all h2/h3 with no italic, no optical-size variation, no weight contrast. The `<em>` italic Fraunces in the hero (`color: var(--brand-soft)`) is the **only** earned typographic moment in the entire page. |
| 5 | Semantic vs decorative color | 4/10 | The brand violet/blue is decorative everywhere — used identically on hero glow, eyebrow dot, brief-card numerals, audit hover border, tier hover, focus rings. `--accent-a` (teal/cyan) appears only as audit-row tag chips and pricing checkmarks. `--ember`/`--ember-2` is reserved for the nav CTA and only the nav CTA. Color is not encoding meaning beyond brand vs nav-cta. |
| 6 | Designed hover/focus/active states | 6/10 | Hover states exist on nav-cta, primary cta, brief-card, audit-row, tier, sticky badge — that's deliberate. **But all six hover states are the same recipe**: `translateY(-1 to -2px)` + brand-tinted border + brand-tinted shadow. There is no differentiation between "this is a primary action" hover and "this is a list-row" hover. Focus states: only `border-color: var(--brand)` on inputs (LandingV2.tsx:176, 324). No `:focus-visible` ring, no keyboard-distinct treatment. |

**Full-template subtotal: 30/60.**

### Rebrand-Only Homepages (docai / leadforge / forge — pre-existing, scoring is informational)

These are pre-Phase-AA components that the design pass touched only at the chrome level. Scoring them on the same 6 pillars is not the goal of this audit — the question is whether they look like **the same product** as the full-template trio. They do not.

| Pillar | Verdict |
|---|---|
| Coherence with full-template trio | **Fails.** Forge uses `--bl-*` tokens, its own font system (`--bl-font-display` / `--bl-font-mono`), Lucide icons, Framer Motion `useInView`, and an `IntelligenceCard` component shape that has nothing in common with `lex-tier`. DocAI uses Three.js scan stage. LeadForge uses a vendored `LeadForgeLanding`. None of the three render `lexCSSv2` or use `--brand` / `--paper` / `--surface`. |
| What they share | Only the SiteShell `bl-nav` + `bl-footer` + StickyLeadBadge. The body of each page is a different design system. |

**Implication:** A user who lands on lexaudit.bizlegal-ai.com, then clicks through to docai.bizlegal-ai.com, then to forge.bizlegal-ai.com, will see three different products with three different design languages connected by an identical header/footer/badge. That is not a "subdomain design pass" — that is **chrome unification**. The plan's goal of brand coherence is achieved at 1080px wide × 80px tall (the chrome) and broken everywhere else.

---

## Anti-Template Policy Compliance (per `web/design-quality.md`)

| Banned pattern | Present? | Evidence |
|---|---|---|
| Default card grids with uniform spacing and no hierarchy | **YES** | `.lex-brief-grid` (`grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))`) + `.lex-tiers` (`repeat(auto-fit, minmax(260px, 1fr))`) — both auto-fit equal columns with identical card chrome. Brief cards all weight identical; no featured/non-featured distinction. (LandingV2.tsx:209-211, 281-283) |
| Stock hero (centered headline + gradient blob + generic CTA) | **PARTIAL** | The hero IS centered (`text-align: center`), HAS a gradient stack (3 radials + linear), HAS a primary CTA. The gradient stack is multi-layered and theme-distinct enough to escape "stock blob," but the composition (centered headline above sub above CTA-row) is the canonical landing-page hero. (LandingV2.tsx:113-148) |
| Unmodified library defaults | **NO** | No shadcn/Radix passing through; everything is hand-rolled CSS. |
| Flat layouts with no depth | **NO** | Backdrop-filter blur + multi-stop gradients give real depth in the hero. |
| Uniform radius/spacing/shadows everywhere | **YES — SEVERE** | Radii: 999 (pills) / 18px (cards) / 16px (spot-stat) / 14px (audit-row) / 12px (input) — that's 5 radii but in practice the eye sees "all big-cards 18, all rows 14, all inputs 12" which is uniform within each role. Section padding: literally every section is `padding: 96px 24px` (LandingV2.tsx:202). Shadows: every hover uses `0 N px M px brand-mix` with N=18-24, no actual shadow vocabulary. |
| Safe gray-on-white styling with one decorative accent color | **NO (kind of)** | Twilight does dark-purple + violet brand + teal/gold/orange accents — three accent families, that's a real palette. Daybreak uses warm paper + violet + teal + gold + orange — also legitimately layered. **But** Royal Light flattens to blue brand + cyan accent + paper, which IS approaching one-accent territory. |
| Dashboard-by-numbers (sidebar + cards + charts) | **NO** | Not a dashboard. |
| Default font stacks used without deliberate reason | **NO** | Fraunces + Inter is a deliberate pairing. (See pillar 4 for whether the pairing earns its keep — it half does.) |

**Required-quality count (need ≥4 per design-quality.md):**

1. Clear hierarchy through scale contrast — **partial** (hero only)
2. Intentional rhythm in spacing — **fail** (uniform 96px everywhere)
3. Depth/layering — **partial** (hero + nav blur only)
4. Typography with character — **partial** (Fraunces italic in hero only)
5. Color used semantically — **fail** (brand everywhere as decoration)
6. Hover/focus/active states designed — **partial** (one hover recipe reused)
7. Grid-breaking editorial composition — **fail** (no bento, no asymmetry)
8. Texture/grain/atmosphere — **partial** (gradient atmosphere in hero only)
9. Motion that clarifies flow — **partial** (reveal-on-scroll exists, doesn't differentiate sections)
10. Data visualization as part of design — **fail** (the spotlight stats are 3 boxes with a serif number — that's a number, not a visualization)

**Score: 0 hard passes, 6 partials, 4 fails. Spec requires ≥4 hard passes.**

**Verdict: Anti-template policy non-compliant.**

---

## Critical Code-Level Findings (with file:line remediations)

### BLOCKER — Lexaudit homepage has a Frankenstein bolt-on section

**Where:** `apps/lexaudit/app/page.tsx:46-60`

After the `<LandingV2>` render, lexaudit appends a **completely off-design** section:

```tsx
<section style={{ padding: '56px 24px', background: '#050509', color: '#e2e8f0', textAlign: 'center', borderTop: '1px solid #1e293b' }}>
  ...
  <p style={{ color: '#c9a84c', fontSize: '11px', letterSpacing: '4px', marginBottom: '12px' }}>CONTRACT RISK SCAN</p>
  <h2 style={{ fontFamily: "'Playfair Display', serif", ... }}>Need a quick read on a counterparty draft?</h2>
  ...
  <a href="https://docai.bizlegal-ai.com/..." style={{ background: 'linear-gradient(135deg,#c9a84c,#a07830)', color: '#0a0a0f', ... }}>Free contract risk scan →</a>
</section>
```

**What's wrong:**
- Hardcoded `#050509`, `#c9a84c`, `#1e293b`, `#0a0a0f`, `#e2e8f0`, `#94a3b8` instead of theme tokens. Theme toggle will not affect this section.
- Imports `'Playfair Display'` — a *third* serif on top of Fraunces (display) + Inter (body). The page now has three font families.
- Gold/bronze gradient (`#c9a84c → #a07830`) is not in any theme — not in Twilight (violet/teal/gold-orange), not in Daybreak. This section was lifted from somewhere else and never reskinned.
- `text-align: center` + centered headline + bronze CTA = a different hero, awkwardly bolted under a different design's pricing/contact section.

**Fix:** Either (a) delete this section and route the contract-risk-scan CTA into LandingV2's pricing tier or contact section, or (b) port it into a new `LandingV2Content` field (`crossSell: { eyebrow, title, sub, cta, href }`) and render through the template using theme tokens. Drop Playfair entirely — Fraunces already covers serif duties.

### BLOCKER — Section rhythm collapse (uniform 96px padding)

**Where:** `packages/themes/src/LandingV2.tsx:202` — `.lex-section { padding: 96px 24px; }`

**What's wrong:** Every section below the hero — Brief, Audits, Spotlight, Pricing, Contact — uses the same vertical rhythm. The page reads as five equal blocks. `web/design-quality.md` explicitly bans "uniform padding everywhere."

**Fix:** Establish a 3-tier section rhythm:

```css
.lex-section.lex-section-tight   { padding: 64px 24px; }   /* Audits — list, dense */
.lex-section.lex-section-default { padding: 96px 24px; }   /* Brief, Pricing */
.lex-section.lex-section-bleed   { padding: 144px 24px; }  /* Spotlight, Contact — breathing room */
```

Apply intentionally: Spotlight should be the slowest beat (it's a quote moment); Audits should be the fastest beat (it's a feed); Pricing/Brief sit in the middle.

### BLOCKER — Card vocabulary collapse (one card, three names)

**Where:**
- `.lex-brief-card` — LandingV2.tsx:212-222
- `.lex-spot-stat` — LandingV2.tsx:271-274
- `.lex-tier` — LandingV2.tsx:284-292

All three use `background: var(--surface)` + `border: 1px solid var(--line)` + `border-radius: 16-18px` + `transition: transform 250ms ease`. The lex-brief-card and lex-tier use *identical* hover (translateY(-2px) + brand-mix border + brand-mix shadow). The spot-stat has no hover.

**What's wrong:** The brief is a "what you get" explainer, the spot-stat is data, the pricing tier is a commercial choice. These three need different visual weight. As-built, they read as three rows of equivalent boxes.

**Fix:** Differentiate by role.

- Brief cards → make them connected. Drop the card border on cards 2 and 3, render as a numbered editorial sequence with a vertical rule between (or render as a single bento with one prominent step).
- Spot-stats → make them feel like data. Strip background entirely, use serif numerals on baseline with a thin underline rule. Or invert: make them the lone surface in an otherwise transparent spotlight section.
- Tiers → keep the surface card here (it earns it — they're commercial). The featured tier (`.lex-tier.feat`) currently only gets `border-color: brand 50% mix` + `background: brand 8% mix`. That's not enough to feel "this is the choice." Add: scale up (`transform: scale(1.05)`), add a "Recommended" eyebrow, raise above the line of the other two with a deeper shadow.

### WARNING — Hover state monoculture

**Where:** Six hover states, one recipe.

```css
/* lex-nav-cta:hover (line 101)        */ transform: translateY(-1px);
/* lex-cta-primary:hover (line 159)    */ transform: translateY(-1px);
/* lex-brief-card:hover (line 218)     */ transform: translateY(-2px); + brand border + brand shadow
/* lex-audit-row:hover (line 244)      */ transform: translateY(-1px); + brand border
/* lex-tier:hover (line 289)           */ transform: translateY(-2px); + brand border + brand shadow
/* lex-tier-cta:hover (line 309)       */ filter: brightness(1.1);
```

**Fix:** Hover states should encode action class.

- Primary actions (nav-cta, cta-primary, tier-cta): aggressive — gradient shift, scale, glow.
- List rows (audit-row): subtle — left-edge accent line slides in, no transform.
- Surface cards (brief-card, tier): lift with depth, NOT translation. Use `box-shadow` change without `transform` so the card feels like it's pressed up, not jumped up.

### WARNING — Focus state is one CSS rule

**Where:** Inputs only get `border-color: var(--brand)` on focus (LandingV2.tsx:176, 324).

**What's wrong:** No `:focus-visible` ring, no keyboard-distinct treatment. The nav links, the audit rows (which are anchor tags!), the tier CTAs, and the brand link in the shell all have **zero designed focus states**. This is a WCAG issue (covered in the A11y audit) but it's also a design-quality issue: the keyboard user sees a default browser outline on most interactive elements.

**Fix:** Add a project-wide `:focus-visible` recipe in lexCSSv2 / siteShellCSS:

```css
.lex-page :focus-visible,
.bl-shell :focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 3px;
  border-radius: inherit;
}
```

### WARNING — `.lex-audit-row strong` repeats the tag visually

**Where:** LandingV2.tsx:539-543

```tsx
<div className="lex-audit-title">
  <strong>{row.tag}</strong>     {/* SEC, CFPB, OFAC — eyebrow above title */}
  {row.title}
</div>
<span className="lex-audit-tag">{row.tag}</span>   {/* SEC, CFPB, OFAC — pill on right */}
```

The same regulator tag appears twice on every audit row — once as a typographic eyebrow inside the middle column, once as a colored pill in the right column. That is not "designed redundancy" — that is two different presentations of the same data, side by side, fighting for attention.

**Fix:** Either (a) drop the `<strong>{row.tag}</strong>` eyebrow and let the right-column pill do the work, or (b) drop the right-column pill and let the eyebrow do it. The right-column pill is more scannable for a feed; keep it, drop the eyebrow.

### WARNING — Stat tile typography is the wrong move

**Where:** `.lex-spot-stat .num { font-family: Fraunces; font-size: 32px; color: var(--brand-soft); }` (LandingV2.tsx:275)

**What's wrong:** Fraunces (a contrasted serif designed for editorial body) at 32px with a violet color is not how data numbers want to sit. The numbers `14d / $0 / 100%` should feel decisive, not pretty. They are also the only large-number moment on the page and they're not getting the dedicated typographic treatment they deserve.

**Fix:** Either (a) use Fraunces but go BIG and authoritative — `font-size: clamp(48px, 5vw, 72px)`, weight 300, color `var(--paper)`, NOT brand-soft (the number is the headline, the brand color is on the label), or (b) introduce a third type role: a numerical / mono treatment for stats only. Forge already does this with `var(--bl-font-mono)` — that's a cross-product idea worth porting.

### WARNING — Spotlight section is a quote next to stats — uses no spotlight visual

**Where:** Spotlight section, LandingV2.tsx:552-573.

The "Spotlight" is two columns: a quote on the left, a stack of three stat boxes on the right. There is no actual spotlight — no case-study image, no logo, no client mark, no chart, no document mockup, no product visual. The label says "Spotlight" but the visual treatment is "centered quote with sidebar."

**Fix:** Either rename the section ("Customer / Result / Outcome") to match what it actually shows, or build a real spotlight: pull in a screenshot of a sample LexAudit brief / BRAI report / TRACR trace, render it floating over the gradient with parallax, and let the quote sit beside it as caption. That would also unlock pillar 7 (grid-breaking editorial composition) which the page currently fails outright.

### NOTE — Theme tokens are stronger than the layout that consumes them

The four ThemeSpecs in `themes.ts` are doing more design work than the LandingV2 layout is. Twilight's `--bleed-bg` and `--hero-bg` are 4-stop radial-stacks per theme, with theme-specific accent harmonies (twilight teal+gold+orange, royal-dark cyan+gold+orange, daybreak warm-paper+gold). That work is wasted on a layout that uses uniform card chrome — the gradients sit *behind* the cards but the cards never participate in the gradient logic.

**Opportunity:** Let the gradient through. Make some cards transparent (no `var(--surface)` fill, just a 1px brand-tinted border floating over the gradient). Currently the surface fills neutralize the gradient on every card.

### NOTE — Bento opportunities the design misses

The "Brief" section (3 numbered steps) and the "Spotlight" section (quote + 3 stats) are both screaming for a bento grid:

```
┌─────────────────────────────┬────────────┐
│   1. Run the screen          │            │
│   (large, eyebrow + body)    │   2.       │
│                              │   Get the  │
│                              │   brief    │
├──────────────┬───────────────┤            │
│   3.         │  ↳ Decide     │            │
│   numbered   │  your move    │            │
└──────────────┴───────────────┴────────────┘
```

Or for the spotlight:

```
┌──────────────────────────────────┬─────────────┐
│                                  │  14d        │
│  "We discovered a CFPB Section   │  lead time  │
│   1071 update three weeks..."    ├─────────────┤
│                                  │  $0         │
│  — Compliance lead, mid-market   │  remediation│
│    consumer-finance firm         ├─────────────┤
│                                  │  100%       │
│                                  │  citation   │
└──────────────────────────────────┴─────────────┘
```

Right now both sections are honest 12-column responsive grids with uniform gutters. That's the safe move. Bento would be the opinionated move.

### NOTE — Forge's design system is the strongest in the monorepo, and it is not LandingV2

Read `apps/forge/apps/web/app/page.tsx`. It uses `--bl-bg-low`, `--bl-text-muted`, `--bl-divider`, `bl-grad-text`, `bl-section`, `bl-container`, `bl-container-narrow`, `bl-btn-primary`, `bl-label`, `IntelligenceCard`, `bl-font-mono`, `bl-text-h2`. It uses Lucide icons (`Zap, FileCheck, Globe, ShieldCheck, Award`). It has an animated counter via Framer Motion `useInView`. It has gradient text. It has a 4-up metric strip. It has a labelled section eyebrow (`— Operator products`). It has a featured "Most popular" CTA section with a different background.

This is a more mature design language than LandingV2. The "subdomain design pass" should have either (a) ported Forge's vocabulary into LandingV2 and unified, or (b) ported LandingV2 into Forge and unified. Instead, both exist, with non-overlapping token namespaces (`--bl-*` vs `--brand`/`--paper`/`--surface`), non-overlapping component vocabularies (`IntelligenceCard` vs `lex-brief-card`), and non-overlapping motion approaches (Framer Motion + `useInView` vs IntersectionObserver + CSS transition).

---

## Top 6 Priority Fixes (ranked)

1. **Delete or theme-port the lexaudit Playfair bolt-on section.** (`apps/lexaudit/app/page.tsx:46-60`) — It is hardcoded colors + a third font + a different design language welded onto the bottom of LandingV2. This is the single most visible fail on the lexaudit homepage right now.

2. **Establish a 3-tier section rhythm vocabulary.** Replace the universal `padding: 96px 24px` (LandingV2.tsx:202) with `lex-section-tight | lex-section-default | lex-section-bleed`. Apply per section role.

3. **Differentiate the three card families.** Brief / spot-stat / tier currently share 90% of their visual treatment. Strip the card chrome from spot-stats; connect the brief steps editorially; emphasize the featured tier with scale + badge + deeper shadow.

4. **Add a real `:focus-visible` recipe to `lexCSSv2` and `siteShellCSS`.** Currently only inputs have a designed focus state; nav links, audit rows, tier CTAs all rely on browser default outline. (Also: this pillar 6 fail compounds with the WCAG findings in the companion A11y audit.)

5. **Rebuild the Spotlight section with an actual product visual.** Screenshot of a sample brief/report/trace, parallaxed over the spotlight gradient, with the quote as caption. This unlocks the grid-breaking editorial composition the design currently lacks entirely.

6. **Unify the cross-product design system between LandingV2 and Forge.** Either port `--bl-*` tokens + `bl-font-mono` into LandingV2 (recommended — Forge's tokens are richer), or port `--brand`/`--paper` into Forge. Pick one. Eliminate the parallel design systems before adding more subdomains.

---

## Verdict on Anti-Template Policy

> "Does it avoid looking like a default Tailwind or shadcn template?"

**Partially.** The chrome (nav, footer, sticky badge) and the hero gradient are not template work — those are designed. The body of the page (brief grid + audit list + spotlight grid + pricing grid) IS template work in a coat of paint.

> "Does it have intentional hover/focus/active states?"

**No.** One hover recipe (translateY + brand mix) on six surfaces. No `:focus-visible`. Active states unspecified.

> "Does it use hierarchy rather than uniform emphasis?"

**No.** Five identical body sections, each with the same h2 weight, the same section padding, the same card surface, the same hover.

> "Would this look believable in a real product screenshot?"

**Yes — as a real-looking product.** It would not look out-of-place in a Vercel showcase or a Linear competitor list. That is the problem. It looks like every other competently-built B2B SaaS landing page from 2024-2026.

> "If it supports both themes, do both light and dark feel intentional?"

**Yes.** The theme system is the strongest part of the work. Twilight (lexaudit) and Royal-Dark (brai/tracr) are visually distinct enough that you can tell which subdomain you're on without reading the brand mark. Daybreak (leadforge) and Royal-Light (alt) are both legitimately different light-mode treatments. The 4-theme registry is the win in this phase.

---

## Final Score

**Full-template (LandingV2): 30 / 60**

| Pillar | Score |
|---|---|
| 1. Hierarchy | 6 |
| 2. Rhythm | 3 |
| 3. Depth | 5 |
| 4. Typography | 6 |
| 5. Color semantic | 4 |
| 6. States | 6 |

**This is the score of "polished generic." Not bad work — but not the work the design-quality policy demands.** The path from 30/60 to 45/60 is the priority-fix list above; the path from 45/60 to "intentional and opinionated" is the bento + grid-breaking + cross-system unification work.

---

## Files Audited

- `packages/themes/src/themes.ts` (4 ThemeSpecs)
- `packages/themes/src/LandingV2.tsx` (LandingV2 component + lexCSSv2)
- `packages/themes/src/SiteShell.tsx` (SiteShell + siteShellCSS)
- `packages/themes/src/StickyLeadBadge.tsx`
- `apps/lexaudit/app/page.tsx`
- `apps/lexaudit/app/landing-content.tsx`
- `apps/brai/app/page.tsx`
- `apps/brai/app/landing-content.tsx`
- `apps/tracr/app/page.tsx`
- `apps/tracr/app/landing-content.tsx`
- `apps/docai/web/app/page.tsx` (rebrand-only — coherence check only)
- `apps/leadforge/app/page.tsx` (rebrand-only — coherence check only)
- `apps/forge/apps/web/app/page.tsx` (rebrand-only — coherence check only)
