# Bench (apps/bench/web)

Surface: `bench.bizlegal-ai.com` — evaluation lab for legal AI (measurement, not advice). Next.js 14.2.35 App Router at `apps/bench/web` (Vercel Root Directory = `apps/bench/web`). Status: Gates 3+5 closed 2026-08-23 (legal review + live checkout); migration apply, Vercel project/CNAME, self-benchmark and test purchase still open per `apps/bench/CLAUDE.md`.

## API routes (`apps/bench/web/app/api/`)

| Route | Method | Purpose |
|---|---|---|
| `/api/audit/request` | POST | Client intake ingress (acquisition). Validates + rate-limits, writes `bench_intake`, fires `lead.inbound` + `email.sent` ops events, sends ONE transactional ack via `@bizlegal/email`. Rule-7-only path. Rate limit: 5 / 10 min per client key (in-memory). |
| `/api/audit/request` | GET | Status probe (`{ok, service, endpoint, method}`). |
| `/api/checkout/start` | POST | **LIVE (2026-08-23).** Validates body against `BENCH_PRODUCTS` set (`bench_audit_2500`, `bench_managed_monthly`) + email + gateway (`card`/`crypto`), logs `agent.checkout` intent, forwards to hub `https://bizlegal-ai.com/api/pay/start` which builds the gateway URL via `@bizlegal/payment`. Returns `checkout_url` or 503 when not live. |
| `/api/checkout/start` | GET | Status probe — reports `live: true/false` (`CHECKOUT_LIVE = true` hardcoded). |
| `/api/experts/apply` | POST | Talent-side intake. Rate-limited, validates (jurisdiction ∈ EU/UK/UAE/Other, PQE 0–60), writes `bench_expert_applications`, sends transactional ack, `email.sent` event. Admission is human (`wf_expert_onboarding`). |
| `/api/experts/apply` | GET | Status probe. |
| `/api/inbound-lead` | POST | HMAC ingress (fleet protocol). Verifies `x-bizlegal-signature` HMAC-SHA256 over raw body vs `BIZLEGAL_INBOUND_SECRET` (timing-safe). Rejects unless `classification.product === 'bench'`. Writes `bench_intake` if email, fires `lead.inbound`. |
| `/api/inbound-lead` | GET | Status probe — reports `configured: Boolean(BIZLEGAL_INBOUND_SECRET)`. |
| `/llms.txt` | GET | AEO surface for AI crawlers — static generated text from `BENCHMARKS` (fleet convention). |

## Pages (`apps/bench/web/app/`)

| Path | Purpose | SEO / noindex |
|---|---|---|
| `/` | Landing — research-lab positioning, registry-derived numbers only (no fabricated client metrics). JSON-LD ProfessionalService. | Indexed (default; no page-level metadata, inherits layout). Sitemap priority 1. |
| `/benchmarks` | Benchmark registry index (MiCA/DPA/VARA). | Indexed; `metadata` present. Sitemap. |
| `/benchmarks/[slug]` | Per-benchmark detail (claims, item counts, held-out counts, jurisdiction). `generateMetadata`. | Indexed; sitemap priority 0.8. |
| `/methodology` | Five-dimension rubric, error taxonomy, calibration, inter-rater, versioning. | Indexed; metadata present. |
| `/sample` | Worked sample report. | Indexed. |
| `/pricing` | Diagnostic Audit $2,500 one-time; Managed Evaluation Program $5,000/mo; Dedicated Intelligence $12,500/mo (from llms.txt). `CheckoutButton` posts to `/api/checkout/start`. | Indexed. |
| `/audit/request` | Client request form (intake). `request-form.tsx` → POST `/api/audit/request`. | Indexed; metadata present ("Request an audit"). |
| `/experts` | Talent funnel ("For experts"). `apply-form.tsx` → POST `/api/experts/apply`. | Indexed. |
| `/report/[id]` | Token-gated measurement report (`?t=` UUID). Queries `bench_reports` joined `bench_engagements` via PostgREST; logs `download.report`. **`robots: { index:false, follow:false }`.** | **noindex.** Disallowed in robots.txt. UUID_RE enforced on both id and token. |
| `/legal/terms` | Client service terms. | Indexed. |
| `/legal/dpa` | Data processing addendum. | Indexed. |
| `robots.ts` | `Allow: /`, `Disallow: /report/, /api/`, sitemap `https://bench.bizlegal-ai.com/sitemap.xml`. | — |
| `sitemap.ts` | Static pages + per-benchmark URLs | — |

Layout metadata: default title "Bench — The Evaluation Lab for Legal AI", template "%s · Bench", OpenGraph, canonical `/`. Global disclaimer: measurement only, not legal advice.

## Build / infra

- `package.json`: scripts `dev|build|start|typecheck` (`next build`, `tsc --noEmit`). Deps: `next 14.2.35`, `react 18.3.1`, `@bizlegal/email` (workspace); dev: typescript. Node 22.x engine.
- `vercel.json`: Next.js framework, root-trace build `pnpm turbo build --filter=@bizlegal/bench...` from monorepo root. **No crons defined** (no scheduled webhooks on bench itself).
- `next.config.mjs`: `transpilePackages: ["@bizlegal/email"]`; `outputFileTracingRoot` = monorepo root (workspace-hoisted `styled-jsx` fix).

## lib/ modules (`apps/bench/web/lib/`) — exported functions

| Module | Exports |
|---|---|
| `benchmarks.ts` | `BENCHMARKS` (readonly registry), `getBenchmark(slug)`, `releasedItems(b)`, `heldOutCount(b)`. `Benchmark`/`BenchmarkItem` interfaces. Data: `web/data/benchmarks/v1/{mica,dpa,vara}-bench.json` (git-versioned; v1.0.0-draft; status active). |
| `db.ts` | `dbInsert(table, row)`, `dbSelect<T>(pathWithQuery)` — raw PostgREST fetch, service-role only, UA `bizlegal-agent/1.0`, never throws (false/null on failure). No supabase-js. |
| `inter-rater.ts` | `computeInterRater(pairs)` → `InterRaterReport`; `CalibrationPair`/`DimensionAgreement` types. |
| `ops/log.ts` | `logEvent`, `logEventAsync` — HMAC-signed POST to hub `/api/ops/log` (default `https://bizlegal-ai.com/api/ops/log`), swallows failures. Local copy of propsignal pattern, **no new event types** (subset: `agent.checkout`, `lead.inbound`, `email.sent`, `email.failed`, `legal.cite_audit`, `report.generated`, `download.report`, payment.*, `error`). |
| `rate-limit.ts` | `isRateLimited(key)`, `clientKey(req)` — in-memory per-lambda bucket, 5 req / 10 min default. |
| `report-model.ts` | `BenchReportRow`, `BenchReport`, `ExpertCredentialLine` types. |
| `rubric-engine.ts` | `RUBRIC_DIMENSIONS`, `totalScore`, `computeEngagementMetrics`, `MAX_DIMENSION_SCORE=5` (×5 = 25), `HALLUCINATION_SCORE_THRESHOLD=2`; `Severity`/`TaxonomyTag`/`ScoredEvaluation`/`DimensionSummary`/`PracticeAreaSummary` types. |

## Env vars used (names only — values in canonical vault)

`BIZLEGAL_INBOUND_SECRET` · `OPS_LOG_URL` (defaulted) · `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_URL` (fallback) · `SUPABASE_SERVICE_KEY` / `SUPABASE_SERVICE_ROLE_KEY` (fallback). Auto-generated / framework: `NEXT_OTEL_*`, `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`, `__NEXT_BUILD_ID`. Matches `apps/bench/CLAUDE.md` zero-new-env rule (no `RESEND*`/`ANTHROPIC` referenced directly by web code in this pass — sendEmail/acquisition is `@bizlegal/email`-internal; ANTHROPIC per CLAUDE.md doc only).

## Integration points

| Point | Mechanism | Status |
|---|---|---|
| Hub `/api/pay/start` | POST forward from `/api/checkout/start`; `@bizlegal/payment` products registered. | LIVE (flag) |
| Ops chain | `lib/ops/log.ts` → hub `/api/ops/log` HMAC. | Wired |
| Supabase | PostgREST service-role to `bench_intake` / `bench_expert_applications` / `bench_reports` / `bench_engagements` (RLS, no anon). Migration `supabase/migrations/20260816_bench_schema.sql`. | Migration apply — UNKNOWN (per CLAUDE.md, still pending) |
| Email | `@bizlegal/email` workspace pkg; transactional acks only (`audit_request_ack`, `expert_apply_ack`). | Wired |
| Inbound lead protocol | `/api/inbound-lead` HMAC (fleet Worker → subdomain). | Wired |
| Vercel project/CNAME | UNKNOWN — listed as remaining in CLAUDE.md (not code-verifiable here). | UNKNOWN |

---

# Blog (content/blog + services/seo-agents + hub served)

Two pipelines share similar content, different consumers:
- **Hub-served blog** — `bizlegal-ai.com/blog` from `apps/hub/app/blog/` reading monorepo `content/blog` via `apps/hub/lib/blog.ts`.
- **CF Pages blog** — `blog.bizlegal-ai.com` from the separate `bizlegal-ea` repo, fed by `services/seo-agents/publish_blog.py` (NOT this monorepo's deploy path).

## Content inventory (`content/blog/`, 20 files: 16 `.mdx` + 4 `.md`)

**Rendered on hub blog (`published: true`, 11 posts):**

| File | Title |
|---|---|
| `boi-filing-2026-diy-vs-automated.mdx` | BOI Filing 2026: Do You Still Need to File? (DIY vs Automated) |
| `checks-before-an-ai-agent-touches-your-inbox.mdx` | The Checks I Run Before an AI Agent Touches My Inbox |
| `comparisons/docai-vs-luminance-robin-ai-contract-review.mdx` | DocAI vs Luminance vs Robin AI: AI Contract Review Compared (2026) |
| `comparisons/firmcited-vs-ai-citation-checking-tools.mdx` | AI Citation Checking for Law Firms: FirmCited vs Churci, Ascero, and KeyCite (2026) |
| `comparisons/gdpr-vs-ccpa-vs-lgpd-data-privacy.mdx` | GDPR vs CCPA vs LGPD: Comparing the World's Three Major Data Privacy Regimes |
| `comparisons/mica-vs-vara-vs-fca-crypto-licensing.mdx` | MiCA vs VARA vs FCA: Which Crypto Licensing Regime Is Best for Your Company? |
| `comparisons/soc2-vs-iso27001-vs-hipaa-compliance.mdx` | SOC 2 vs ISO 27001 vs HIPAA: Which Compliance Framework Do You Need? |
| `fincen-boi-reporting-2026-llc-checklist.mdx` | FinCEN BOI Reporting in 2026: The 23-Question Test for LLCs |
| `i-ran-a-revenue-leak-report-on-my-own-practice.mdx` | I Ran a Revenue-Leak Report on My Own Practice |
| `mica-dora-vara-compliance-benchmark-2026.mdx` | MiCA, DORA, and VARA in 2026: What a Compliance Team Actually Needs to Prove |
| `what-is-a-contract-risk-assessment.mdx` | What Is a Contract Risk Assessment? (And What a Lawyer Actually Checks) |

**NOT rendered by hub (`published` front matter absent → `readPost` returns null silently, 9 files):**

| File | Title | NOTE |
|---|---|---|
| `2026-07/boi-certifying-officer-liability-llcs.md` | BOI Filing: Who Bears Liability When the Certifying Officer Gets It Wrong? | `.md`, front matter uses `tags`/`slug`, author Moses, no `published` |
| `2026-07/compliance-ops-retainer-vs-in-house-cco.md` | Compliance Ops Retainer vs. In-House CCO: What Early-Stage Fintechs Actually Need | same |
| `2026-07/mica-article-23-casp-application-for-eu-crypto-iss.md` | MiCA Article 68: What EU Crypto-Asset Service Providers Must Do Before the Transitional Period Ends | same |
| `2026-07/mica-casp-which-eu-member-state-to-file-in.md` | MiCA CASP Authorization: Which EU Member State Should You File In? | same |
| `eu-ai-act-fines-non-compliance-2025.mdx` | EU AI Act Fines for Non-Compliance 2025: Actual Penalties and Risk Tiers | no `published` in front matter |
| `how-to-respond-to-security-questionnaire-fast.mdx` | How To Respond To Security Questionnaire Fast (2024 Guide) | **most recent blog commit (d7b8839) — NOT published**; front matter also uses `pillar`/`product`/`keyword`/`category` (CF-pipeline format) instead of hub `tag`/`readTime`/`keywords`/`jurisdiction` |
| `mica-article-68-2026-casp-authorization-withdrawal.mdx` | MiCA Article 68 in 2026: What Compliance Teams Need to Know About CASP Authorization Withdrawal | no `published` |
| `travel-rule-compliance-vasps-crypto-exchanges.mdx` | Travel Rule Compliance for VASPs & Crypto Exchanges: 2026 Buyer's Guide | no `published` |
| `wallet-forensics-court-admissibility-2026.mdx` | Wallet Forensics in Court: How Admissible is Blockchain Evidence in 2026? | no `published` |

## Publish pipeline scripts (`services/seo-agents/`, role from docstring)

| Script | Role |
|---|---|
| `publish_blog.py` | Bridge into `bizlegal-ea` clone: syncs `.mdx` file set via GitHub Contents API (commit+push). CF Pages serves `bizlegal-ea`, not this monorepo. |
| `seo_content_writer.py` | 40-post SEO engine for `blog.bizlegal-ai.com`: reads keyword calendar (`decisions/SEO-KEYWORD-CALENDAR.json`), writes 1500+ word MDX with H1–H3, internal links, FAQ, JSON-LD (Article + FAQPage + BreadcrumbList). |
| `og_image_generator.py` | Renders 1200×630 OG PNGs per MDX (Pillow, dark-navy/gold design language). |
| `internal_linker.py` | Scans MDX dir, auto-injects internal product links by keyword (link table from `decisions/SEO-SUBSCRIPTION-10K-MRR-PLAN.md`); idempotent, stdlib only. |
| `gsc_indexnow_pinger.py` | Pings IndexNow (optionally Bing WMC + Telegram) on new content; state JSON; stdlib urllib. |

Other present scripts (out of scope for this inventory): `comparison_generator`, `keyword_calendar`, `lead_magnet`, `newsletter`, `revenue_attribution`, `conversion_tracker`, `analytics_dashboard`, `seo_watchdog`, `daily_orchestrator`, crawlers etc. — not inventoried here.

## Hub service layer (`apps/hub/lib/blog.ts`)

Single source of truth for the hub blog; reads **monorepo-root `content/blog`** (resolve: `process.cwd()+"/../../content/blog"` then `content/blog`; `process.cwd()` = `apps/hub` on Vercel). Recursively globs `\.mdx?$`. Requires `title`, `date`, **`published` truthy** else the file is silently skipped.

| Function | Purpose |
|---|---|
| `getAllPosts()` | Published, de-duplicated (root beats subdir on slug clash), date-desc, strips `content` → `BlogPostMeta[]`. |
| `getPostBySlug(slug)` | Full `BlogPost` incl. content (basename-slug match, md/mdx). |
| `getFeaturedPosts(limit=2)` | Featured-filtered slice. |
| `getPostsByTag(tag)` / `getPostsByJurisdiction(jurisdiction)` | Faceted queries on front matter. |
| `getAllTags()` | Unique tag set. |
| `getSurroundingPosts(slug)` | Prev/next nav. |

Hub pages: `apps/hub/app/blog/page.tsx` (metadata "Blog — Compliance Intelligence for SaaS, Fintech & Crypto Startups", uses `getAllPosts` + `GUIDES` + `BlogGrid`/`BlogPostGrid`) and `apps/hub/app/blog/[slug]/page.tsx` (`generateStaticParams` from `getAllPosts`, `getPostBySlug`, `notFound`, `permanentRedirect`, `BlogPostView`, `Markdown`). Cross-reference: full hub route inventory lives in the hub surface section of the mechanism map — blog pages are hub-served, plus a separate `content_distribution.py`/CF-Pages blog for `blog.bizlegal-ai.com`.

## Notable findings

1. **`how-to-respond-to-security-questionnaire-fast.mdx` (commit d7b8839, newest blog post) has no `published:` — it will NOT render on the hub blog** and its front matter (`pillar`/`product`/`keyword`/`category`) is the CF-pipeline format, not hub's. Likely intended for `blog.bizlegal-ai.com` via `publish_blog.py`; on the hub side it's a silent no-op.
2. **9 of 20 content files render nothing on the hub** (5 mdx missing `published`, 4 `.md` using CF format) — silent drops, no warning.
3. Bench has no crons; all GETs are status probes; `CHECKOUT_LIVE` is a hardcoded boolean now `true`.
4. Bench DB access is raw PostgREST with service-role fallback chain (`NEXT_PUBLIC_SUPABASE_URL`→`SUPABASE_URL`; `SUPABASE_SERVICE_KEY`→`SUPABASE_SERVICE_ROLE_KEY`).
