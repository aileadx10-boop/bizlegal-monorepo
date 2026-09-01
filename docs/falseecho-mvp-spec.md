# FalseEcho — MVP Spec (Sabrina-style)

**Status:** approved for build · **Date:** 2026-08-24 · **Owner:** Moses (review) / agent marathon (build)

## 1. Objective

Defamation-grade AI falsehood monitoring for professionals. FalseEcho scans the major AI answer engines for false claims about a person or firm, captures hash-anchored evidence, and delivers court-admissible-style evidence packs. Category: "AI falsehood monitoring" — currently unowned.

## 2. User

- Primary: US consumer law firms (FirmCited overlap — a firm cited wrongly by ChatGPT loses intake).
- Secondary: doctors, executives, founders whose names surface in AI answers.
- Buyer psychology: fear + evidence. They buy once ($29 audit) to see the damage, then subscribe ($149/mo) to watch it.

## 3. Success criteria

| # | Criterion | Verify |
|---|-----------|--------|
| 1 | 4-engine probe runs for any entity name | All 4 engines return 200 + stored response for "Moshe Dor" test |
| 2 | Every captured response is hash-anchored (SHA-256 + UTC timestamp + scan sequence) | Insert + query by hash returns identical record |
| 3 | $29 audit checkout works end-to-end | hub apex checkout → payment → probe → PDF → email, < 5 min |
| 4 | $149/mo monitor tier works | daily cron scan, alert on new falsehood, weekly PDF, dashboard shows history |
| 5 | Programmatic SEO live | each detected falsehood generates an indexable page < 1 hr |
| 6 | Build green | typecheck + `next build` exit 0 |

## 4. Scope

**In scope (MVP):**
- Next.js app at `apps/falseecho` (deploys to `falseecho.bizlegal-ai.com`)
- Landing page, pricing, free-check lead magnet, dashboard
- 4 probes: ChatGPT (OpenAI API), Claude (Anthropic), Perplexity (API), Google AI Overviews (SerpAPI parse)
- 25-prompt battery per entity (name variants, practice-area questions, "is X trustworthy", "X reviews", controversy probes)
- Triage: cheap local/heuristic scorer flags suspected falsehoods; Claude grades flagged items for confidence + writes the narrative (NO legal conclusions — "this claim appears factually inaccurate because [citation]", never "this is defamation")
- Evidence store: `falseecho_evidence` table (id, scan_id, entity, engine, prompt, response, sha256 hash, scanned_at)
- $29 one-time audit → PDF evidence pack → Resend email
- $149/mo monitor → daily scan cron, diff vs previous scan, alert email on new falsehood, weekly summary PDF
- Programmatic SEO route `/seo/[engine]/[entity]/[hash]`
- Checkout via hub apex (`bizlegal-ai.com/checkout?product=falseecho&tier=audit|monitor`)
- Ops events to hub `/api/ops/log` via `@bizlegal/ops-log`

**Out of scope (MVP):**
- No legal advice, no demand letters, no defamation determinations (liability shrinker — we publish evidence, the user decides)
- No automated correction submission to OpenAI/Google (ToS-fragile); correction-request DRAFTS are generated for human review only
- No social-media monitoring (X/Reddit) in v1
- No multi-language scans in v1

## 5. Tech stack

- Next.js app in monorepo, mirrors `apps/brai` structure (landing-content.tsx, /pricing with apex links, /api/inbound-lead, /api/digest, /api/ops/health)
- Supabase primary project (ydghhcuuopqzgqcicubg): `falseecho_scans`, `falseecho_evidence`, `falseecho_monitors` tables
- Hub apex checkout — no hub code changes required; grant helper `falseecho-grant.ts` added to hub webhooks
- Anthropic (flagged-item grading), OpenAI, Perplexity, SerpAPI — keys already in vault
- Resend for delivery; evidence PDFs via existing fleet PDF pattern (check `packages/` for pdf lib)
- Recurring: NOWPayments re-bill cron (fleet pattern) + PayPal subscription gated on `PAYPAL_PLAN_ID_FALSEECHO_MONITOR_MONTHLY` (Moses handoff — plan creation is a dashboard action)

## 6. Timeline

Built in one marathon session. Deploy blocked only on: Vercel project creation + DNS (agent can attempt via API), PayPal plan ID (Moses), real-money test purchase (Moses).

## Liability shrinkers (standing rule: every revenue lever pairs one)

- "We publish signals, you decide" — evidence packs state facts + sources, never legal conclusions
- No guarantee of detection completeness; engines change answers constantly — stated on site
- Named human reviewer note on every evidence pack: "Reviewed pipeline: automated capture, human review available on request"
- robots-friendly: we query public AI APIs, no scraping of gated content
