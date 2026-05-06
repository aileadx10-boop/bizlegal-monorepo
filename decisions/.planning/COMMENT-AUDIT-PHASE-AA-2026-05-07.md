# Comment Audit — Phase AA Subdomain Design Pass

**Date:** 2026-05-07
**Reviewer:** comment-analyzer agent (Opus 4.7)
**Files reviewed:** 10 files modified across the Phase AA design pass

---

## Executive verdict

**Counts (51 distinct comments reviewed):**
- WHY-good (Keep): 17
- WHY-good (Decay-risk, rewrite to remove audit code): 18
- DOCSTRING-too-long: 7
- WHAT-redundant: 3
- OK: 6

**Severity:**
- HIGH (rewrite urgently): 4
- MED (decay-risk, rewrite at convenience): 13
- LOW: 11

**Hygiene assessment:** above-average comment discipline; the *content* of WHY-comments is genuinely useful (color ratios, WCAG SCs, before/after values, design-system rationale). The systemic issue is the **audit-code prefix pattern** (S-1 / C1-C4 / H1-H7 / AA1-AA6 / A11Y-035): external pointers to four sibling docs in `decisions/.planning/` that will rot the moment those audits are renumbered, archived, or superseded.

**Recommendation:** keep the audit-codes in commit messages where they belong, and rewrite each comment to be self-explanatory using the WCAG SC or the actual rationale.

---

## HIGH — fixed in this pass (commit on `claude/phase-aa-a11y-034-toggle-dedup`)

| File:line | Original | Fix applied |
|---|---|---|
| `themes.ts:1-9` | Hardcoded `C:\Users\Moshe Dor\Downloads\products page\lexaudit-themes.jsx` path — portability bug | Replaced with generic registry description |
| `themes.ts:196` | `Used as the bright alternate for DocAI / BRAI / TRACR per Moses 2026-05-06 Q&A.` — dated personal attribution | Dropped the "per Moses ... Q&A" attribution |
| `LandingV2.tsx:562` | `// C1 fix — preserve and log the actual error instead of swallowing.` — code does MORE than this (logs + sanitizes + truncates) | Rewrote to match actual behavior |
| `LandingV2.tsx:769` | `// C2 fix — ...` (verbatim copy of C1 issue) | Rewrote to match actual behavior |
| `apps/lexaudit/app/page.tsx:38` (+ brai + tracr) | `// C3 fix — try JSON first, log body-read failures, preserve full error.` | Rewrote without audit-code prefix |

---

## MED — defer to follow-up audit-code-cleanup PR

The 13 MED items are all of the form "audit-code prefix + good rationale". Pattern: drop the `<audit-code> fix —` prefix, keep the body. Examples:

- `LandingV2.tsx:44` `/* Visually-hidden, screen-reader-accessible (a11y A11Y-020 fix). */` → `/* sr-only utility — WCAG 2.4.6 visually-hidden */`
- `LandingV2.tsx:53` `/* Form error region — assertive live (a11y H1/H2 fix). */` — **Especially confusing in CSS context where H1/H2 read as heading levels.** → `/* assertive live region for inline form errors */`
- `LandingV2.tsx:200` `/* a11y AA4 fix — restore visible focus indicator on keyboard focus. */` → drop "AA4 fix —"
- `SiteShell.tsx:30` `/* Skip-to-main link (a11y A1 fix — WCAG 2.4.1 Bypass Blocks) */` → `/* Skip-to-main link — WCAG 2.4.1 Bypass Blocks */`
- `SiteShell.tsx:37` `/* Focus-visible everywhere in the shell (a11y AA4 fix — WCAG 2.4.7) */` → drop "AA4 fix —", keep WCAG citation
- `SiteShell.tsx:52` Same `AA1/AA2 fix` rot pattern; body (gradient stops, contrast ratio) is the keeper
- `LandingV2.tsx:111` Same — exemplary body, just drop the "AA1/AA2" prefix
- `LandingV2.tsx:255-258` Brief "(UI auditor card-vocabulary fix)" parenthetical — drop, keep design rationale
- `LandingV2.tsx:317-320` Spotlight stats — same pattern
- `LandingV2.tsx:337-340` Pricing tier — same pattern
- `LandingV2.tsx:400` `/* a11y AA4 fix — keyboard-only focus ring (WCAG 2.4.7 + 2.4.11). */` → drop "AA4 fix —"
- `apply.ts:23-25` `/** ... C4 fix — was silently no-op'ing ... */` → drop "C4 fix —", keep behavioral description
- `themes.ts:98-99, :215-216, :218` — three identical `a11y AAx fix` rot instances; drop prefix, keep color-ratio body
- `StickyLeadBadge.tsx:127` — drop "AA5 fix —", keep WCAG 2.5.8 citation

---

## LOW — defer / optional

- 7 docstrings exceed the "no multi-paragraph docstrings" rule — modest trims would help (LandingV2 module header, SiteShell module header, apply.ts applyTheme + themeFOUCScript docstrings)
- 3 WHAT-redundant comments (e.g. `// Reveal-on-scroll observer` above a 14-line useEffect that's self-evident)
- "Subdomain Design Pass" / "Phase AA" phase references in 5 layouts — date-fix the comments
- `themes.ts:20` `/** CSS custom properties applied at :root when this theme is active. */` — restates the type literal

---

## What was NOT touched in this pass

- The 13 MED audit-code comments (would be a noisy 18-file commit; better as a single sweep)
- The 11 LOW items (cosmetic)
- The hub layout (out of scope for this audit)

A follow-up "comment hygiene sweep" PR can address all 24 deferred items in one focused diff.
