# P1 Verification Report — Hub pivot(shell)

**Branch:** `claude/standardize-bizlegal-subdomains-YekYM`
**Phase label:** `pivot(shell): hub LegalShield + conversion widgets + /methodology + banned-word sweep`
**Date:** 2026-04-19

## Scope delivered this phase (hub only)

| Repo | Commit SHA | Remote pushed |
|---|---|---|
| bizlegal-ai (hub) | `2f2eab42e70a5ee5c0dad2a93b3c66231df56bc3` | yes |

**Deferred to P1 next session:** trcr, BRAI, lexaudit, docai-monorepo, leadforge-ai. Hub is the canonical reference; other 5 repos propagate from it.

## Files changed (23 total — 6 new, 17 modified, zero out-of-scope biome noise)

### New files (structure + liability infrastructure)
- `app/methodology/page.tsx` — 7-section methodology route, JSON-LD Dataset schema, Per-product methodology index, mounts LegalShield full
- `components/conversion/DataStat.tsx` — figure with regulator + date + citation URL
- `components/conversion/ScarcityBanner.tsx` — real regulatory deadline countdown
- `components/conversion/LeadMagnetForm.tsx` — email capture stamping DISCLAIMER_VERSION
- `components/conversion/MethodologyBadge.tsx` — one-click provenance badge
- `lib/legal/disclaimer.ts` — DISCLAIMER_VERSION const + disclaimerStamp helper
- `lib/legal/shield-clauses.ts` — 7-clause disclosure (conservatively drafted)

### Modified (LegalShield rewrite + banned-word sweep + env)
- `.env.example` — NEXT_PUBLIC_DISCLAIMER_VERSION default v1.0.0-p1
- `components/layout/LegalShield.tsx` — full + micro variants, stamps disclosure version
- `components/conversion/index.ts` — exports the 4 new widgets
- `lib/brand/tailwind-preset.ts` — P0 carry-over readonly tuple fix
- Banned-word sweep across `app/articles`, `app/blockchain-report`, `app/blog`, `app/digital-asset-regulatory-intelligence`, `app/guides`, `app/lib/seo-factory-experience.ts`, `app/lib/site-content.ts`, `app/page.tsx`, `app/products/page.tsx`, `components/layout/NavBar.tsx`, `components/sections/hero.tsx`, `components/sections/products.tsx`

## P1 gate verification (hub)

| Gate | Requirement | Result |
|---|---|---|
| Banned-word grep on `app/ components/ content/` | 0 hits | **0** |
| JSON-LD `@type` audit | no LegalService / ProfessionalService | **clean** (new `/methodology` uses Dataset; pre-existing Article / FAQPage / Organization preserved) |
| tsc --noEmit | clean | **clean** |
| npm run build | clean production build | **clean** — `/methodology` prerendered at 256 B |
| biome lint on new P1 files | matches project baseline | **matches** (`dangerouslySetInnerHTML` on JSON-LD script is the established pattern used by `/faq`, `/vara-compliance`, etc.) |
| 10 legal routes present | /disclaimer /privacy /terms /refund /acceptable-use /about /contact /pricing /trust /methodology | **10/10** (9 pre-existing, `/methodology` added) |
| LegalShield has full + micro variants | both | **both** |
| DISCLAIMER_VERSION stamped into outputs | visible in page data attributes + JSON payloads | **yes** via `data-disclaimer-version` on LegalShield + widgets, `disclaimer_version` key in `LeadMagnetForm` POST body |

## Banned-word replacements (all in `app/` — hub surface)

| Before | After | Files |
|---|---|---|
| Court-Grade Blockchain Reports | Forensic Blockchain Intelligence | page.tsx, products/page.tsx, lib/site-content.ts, layout/NavBar.tsx |
| court-grade reports | forensic intelligence reports | page.tsx |
| Court-Ready Reports / court-ready forensic PDF reports | Forensic Intelligence Reports / forensic PDF intelligence reports | blog/page.tsx |
| Court-ready blockchain forensic reports for litigation. | Forensic blockchain intelligence reports for litigation. | digital-asset-regulatory-intelligence/page.tsx |
| Court-Grade Compliance. | Forensic-Grade Compliance. | sections/hero.tsx |
| Court-ready reports. | Forensic reports. | sections/products.tsx |
| TRACR (Trace, Analyze, Court-Grade Reports) | TRACR (Trace, Analyze, Composite Risk Reports) | lib/site-content.ts |
| legal service providers | law firms | guides/[...parts]/page.tsx, seo-factory-experience.ts, site-content.ts |
| legal service leads | law firm leads | products/page.tsx |
| Legal service providers and law firms | Law firms | seo-factory-experience.ts |
| Full report delivered to | Full report made available to | blockchain-report/page.tsx |
| certified compliance endpoints | independently reviewed compliance endpoints | articles/[slug]/page.tsx |
| litigation-ready blockchain forensics | forensic blockchain intelligence | lib/site-content.ts |

## LIABILITY_JUDGMENT entries (P1 hub)

| # | Decision |
|---|---|
| 1 | The pivot spec references a "7-clause disclosure verbatim" sourced from a prior v1 document not carried into this implementation context. `lib/legal/shield-clauses.ts` contains a conservatively drafted 7-clause set, derived from the North-Star Rule (intelligence, not services / verdicts / certifications / filings on behalf of the customer) and from defensive patterns used in SaaS legal-tech disclaimers. If the original verbatim source surfaces, a follow-up LIABILITY_JUDGMENT commit should supersede shield-clauses.ts. |
| 2 | "legal services" appeared in defensive context in the prior LegalShield disclaimer ("we do not provide legal services"). Even in defensive framing, the banned-word grep catches it. Rewrote the 7-clause set to use "we do not practice law" and "this is not legal advice" — disclaimer strength preserved, banned substring avoided. |
| 3 | TRACR acronym expansion was "Trace, Analyze, Court-Grade Reports". Replaced with "Composite Risk Reports" to preserve the R and strip the court/judicial promise. This is a copy call, not a legal call — marketing may want to iterate. |

## Deferred to P1 next session (trcr, BRAI, lexaudit, docai-monorepo, leadforge-ai)

Hub serves as the canonical reference. Next session propagates:
- LegalShield + shield-clauses + disclaimer.ts → each repo (with product-specific brand name substitution)
- 4 conversion widgets → each repo
- `/methodology` route → each repo (product-specific methodology body)
- Banned-word sweep per repo (each has its own product surface copy)
- JSON-LD `@type` audit per repo
- `NEXT_PUBLIC_DISCLAIMER_VERSION` to `.env.example` per repo

Each subdomain's methodology page will link back to hub `/methodology` per the hub index section already scaffolded.

## Gate status

P1 hub → P1 rest-of-fleet: **hub unblocked.** 5 remaining repos need the same cycle.
P1 fleet → P2: **blocked** on the 5 remaining repos (trcr, BRAI, lexaudit, docai-monorepo, leadforge-ai).
