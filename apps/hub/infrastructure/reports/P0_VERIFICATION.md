# P0 Verification Report — v1-purple + v1-white canonical

**Branch (all 6 repos):** `claude/standardize-bizlegal-subdomains-YekYM`
**Phase label:** `chore(brand): v1-purple + v1-white canonical`
**Date:** 2026-04-19

## Commit SHAs

| Repo | Preset | SHA | Remote pushed |
|---|---|---|---|
| bizlegal-ai | purple | `959fd815e48cba51cc198f024a61d0ddb56aa45d` | yes |
| trcr | purple | `b8c8f2cbfff0ad1d5a2b7f61255ea8403cb8af34` | yes |
| BRAI | purple | `afd3ee539bcb01a29d78ad7feead211747b4ca1e` | yes |
| lexaudit | white | `f4babe8b8bf449935d4c15cfad1bd642e5133102` | yes |
| docai-monorepo | white | `aa0032052180cf82cb07e9a829e8173b2193a15b` | yes |
| leadforge-ai | purple | `d893ce1505d267564e4734ec66c3871c17e863cc` | yes |

## Files shipped per repo (identical across all 6)

- `brand-assets/canonical-template.html`
- `brand-assets/canonical-template-white.html`
- `lib/brand/tokens.ts`
- `lib/brand/template.ts`
- `lib/brand/tailwind-preset.ts`

`lib/brand/template.ts` sets `TEMPLATE` per preset assignment. Confirmed post-commit:
purple on bizlegal-ai / trcr / BRAI / leadforge-ai, white on lexaudit / docai-monorepo.

## Lighthouse accessibility (headless Chrome, CDP, local file via http-server)

Hub canonical templates audited once; identical files now live in every pivot repo.

| Template | Run 1 (pre-fix) | Run 2 (post-fix) | Gate ≥95 |
|---|---|---|---|
| canonical-template.html (purple) | 89 | **100** | pass |
| canonical-template-white.html (white) | 89 | **100** | pass |

### Gate-blocking issues fixed during P0

1. **color-contrast** — CSS rules `.ij` and `.fbot` used `var(--dim)` on `var(--bg-2)`
   (purple: `#a9a7c4` on `#f1f0fe` = 2.06:1). Below WCAG AA 4.5:1.
   **Fix:** swapped both rules to `var(--muted)` in both templates. `--muted` is
   spec-locked (purple `#5d5a7a`, white `#52525b`) and AA-compliant against the
   respective `bg-2`. Does not touch spec-locked token values.

2. **heading-order** — footer column headings were `<h4>` directly after
   section `<h2>`, skipping `<h3>`. **Fix:** promoted all four footer column
   headings (`Products`, `Jurisdictions` or `Frameworks`, `BizLegal AI`, `Legal`)
   from `h4` to `h3` in both templates.

Artifacts retained at `/tmp/lh-audit/{purple,white}-lh{,2}.json`.

## Deferred to P1+ (not P0 scope)

- Banned-word grep (`attorney-filed`, etc.) — P1 gate.
- Template-contamination grep (`var(--pink)` in v1-white repos) — P4 gate.
- `npm run build` / lint / typecheck — P1 gate per repo.

## LIABILITY_JUDGMENT entries (P0)

| # | Repo(s) | Decision |
|---|---|---|
| 1 | all 6 | Canonical presets shipped as additive `lib/brand/tailwind-preset.ts` instead of overwriting each repo's live `tailwind.config.ts`. Overwriting would have broken running styles on bizlegal-ai (quantum tokens), trcr, lexaudit, and leadforge-ai before P4.b adoption. Conservative framing preserves live sites; preset assignment model preserved. Formal `presets: [bizlegalPurple\|bizlegalWhite]` wiring happens in P4.b per spec. |
| 2 | hub (templates) | White-template spec locked `--dim: #a1a1aa` fails WCAG AA 4.5:1 on `--bg-2: #fafafa` (~2.8:1). Rather than change a spec-locked token value, the two CSS rules that rendered small text on `bg-2` were switched to `--muted` (already spec-locked and AA-compliant on both bg-2 values). Token palette unchanged. Same conservative approach applied to purple template for consistency. |

## Gate status

P0 → P1: **UNBLOCKED.** Both templates at 100 accessibility. All 6 repos on target branch with identical artifacts. Preset assignment correct per repo.
