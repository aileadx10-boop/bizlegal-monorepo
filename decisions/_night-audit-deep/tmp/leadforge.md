# LeadForge (apps/leadforge)

Live at https://leadforge.bizlegal-ai.com. Next.js 15.5 App Router. Lead-generation surface, no paid tier of its own — fleet cross-sell is the conversion path. Daybreak-only theme, no login surfaces. Build: `pnpm -F @bizlegal/leadforge build`. Vercel project: `leadforge`, root `apps/leadforge`.

**Doc drift flagged:** app CLAUDE.md lists `/api/inbound-lead` as a primary surface — **no such route exists in code** (5 route files only). CLAUDE.md also says `BIZLEGAL_INBOUND_SECRET` is used for "inbound HMAC"; nothing inbound exists — the secret is used only for outbound (signing ops events).

---

## 1. API routes (`app/api/**/route.ts`)

| Route | Methods | Purpose |
|---|---|---|
| `/api/generate-report` | POST | Deterministic demo output — generates 3 fake "deals" (leadforge) or 3 fake "funds" (pipeforge) from a `location` string. No I/O, no DB, no LLM. Feeds the ChatBot surface. |
| `/api/free-audit` | POST | Free 10-point consent & suppression audit. Validates email, IP rate-limit (`leadforge-free-audit`, 5/min), Turnstile, deterministic scorer `lib/free-audit.ts` → on-page result. Fire-and-forget nurture enqueue (vertical=`leadforge`) + `lead.qualified` ops event. Returns `legal_notice` disclaimer. |
| `/api/decision-tree/lead` | POST | TCPA decision-tree lead capture. Validates email + verdict (allowlist of 4), rate-limit (`leadforge-decision-tree-lead`, 10/min), Turnstile (skip-if-unconfigured), nurture enqueue vertical=`leadforge`, `lead.qualified` ops event. |
| `/api/ops/health` | GET | Token-gated env-presence audit (9 keys; critical + reason each). 404 on token mismatch via timing-safe compare. Aggregated by hub `/api/ops/health` into fleet env matrix. `maxDuration=15`. |
| `/api/digest` | GET | Daily product digest for hub aggregator — hardcoded "quiet day" score 0, 2 bullets, 1 link. Honest anti-hallucination stub; no DB read. `s-maxage=300`. |

Note: `/api/generate-report` returns fabricated deal/fund previews as if real (no disclaimer, no LLM, no persistence) — a UX-honesty liability if presented as live data. `/api/digest` is a static zero-score stub, not real telemetry.

## 2. Pages (`app/**`, non-API)

| Route | Purpose | SEO / indexability |
|---|---|---|
| `/` | Homepage: `LeadForgeLanding` (vendored) + pre-banner + `StickyLeadBadge` → /decision-tree | Indexable. Default metadata from layout (`LeadForge` → `[page] \| LeadForge`). No page-level metadata export. |
| `/decision-tree` | TCPA / lead-gen exposure tree. `force-static`. FAQ + tool JSON-LD in-page. | Indexable. Full metadata + canonical (decision-tree page sets its own: title "TCPA / Lead-Gen Decision Tree \| LeadForge", og:url). |
| `/free-audit` | 10-point consent & suppression self-audit client flow. `force-static`. FAQ + tool JSON-LD. | Indexable. Full metadata + canonical. |
| `/pipe` | Pipeforge unclaimed-funds upsell page (renders `PipeforgeUpsell`). No metadata export. | Indexable by default (no noindex), in sitemap. |
| `/robots.txt` (`robots.ts`) | AI-crawler allowlist (36 bots), semantic blocklist (10), `/api/` + `/_next/` private. `crawlDelay: 1`. | — |
| `/sitemap.xml` (`sitemap.ts`) | 4 URLs: `/`, `/decision-tree`, `/free-audit`, `/pipe`. Referenced from apex sitemap-index. | — |
| `layout.tsx` | Root layout: SiteShell, Daybreak-only ThemeProvider + FOUC, 3-block JSON-LD head (`structured-data.tsx`), GSC verification (env-conditional), Plausible (env-conditional), sticky CrossLinkBanner → `https://hub.bizlegal-ai.com/services/compliance-ops` ("24/7 ops, $2,500/mo"). | — |

**Note:** `public/robots.txt` still exists on disk with a *different* policy (disallows `/clients`, `/orders`, `/pipeforge`; allows `/pipeforge` per-app differs). `app/robots.ts` shadows it in Next 15, but the stale static file is a foot-gun if the app route is ever removed.

## 3. Cron / scheduled functions

**None.** `vercel.json` has no `crons`. Only framework/build config:
- `framework: nextjs`, `outputDirectory: .next`
- Root-level install + `turbo build --filter=@bizlegal/leadforge...`

## 4. package.json scripts

| Script | Command |
|---|---|
| dev | `next dev` |
| build | `next build` |
| start | `next start` |
| typecheck | `tsc --noEmit` |

No lint, no test scripts. Workspace deps: `@bizlegal/nurture-enqueue`, `@bizlegal/rate-limit`, `@bizlegal/themes`, `@bizlegal/turnstile-verify`, `@bizlegal/turnstile-widget`, `@supabase/ssr`, `@supabase/supabase-js`. `next.config.mjs` transpiles 7 `@bizlegal/*` packages (incl. unused `@bizlegal/ops-log` and `@bizlegal/payment`).

## 5. lib/ modules

| Module | Exports |
|---|---|
| `lib/free-audit.ts` | `FREE_AUDIT_CHECKS` (10 checks, 4 areas, severity-weighted), `AUDIT_AREA_LABELS`, `evaluationsFromRaw`, `scoreAudit`, `postureFor` (5 posture bands), types `AuditAnswer` / `AuditArea` / `AuditCheck` / `AuditEvaluation` / `AuditScore` / `PostureBand`. Pure, no I/O. |
| `lib/nurture-enqueue.ts` | Re-export only: `enqueueNurture`, `NurtureVertical`, `EnqueueArgs`, `SubdomainEnqueueArgs` from `@bizlegal/nurture-enqueue`. |
| `lib/ops/log.ts` | `logEvent` (HMAC-SHA256 POST to `OPS_LOG_URL` default `https://bizlegal-ai.com/api/ops/log`, 5s abort, failures swallowed), `logEventAsync` (fire-and-forget), `LogEventInput`, `OpsEventType` (8 types). |
| `lib/supabase/client.ts` | `createBrowserSupabaseClient` (anon). |
| `lib/supabase/server.ts` | `createServerSupabaseClient` (service role `SUPABASE_SERVICE_ROLE_KEY`, falls back to anon key). |
| `lib/supabase/index.ts` | Re-exports both supabase clients. |
| `lib/apify/actors.ts` | Static config only: `APIFY_ACTORS` (3 verticals: commercial/employment/real-estate), `PIPEFORGE_FUNDS_SIGNALS`. **No runtime Apify calls anywhere in app.** |
| `lib/utils.ts` | `cn` (clsx+twMerge), `formatCurrency`. |

Components: `FreeAudit.tsx` (client scorer flow + `crossSellFor('leadforge')`), `LeadGenDecisionTree.tsx` (TCPA tree), `ChatBot.tsx` (→ `/api/generate-report`), `TurnstileWidget.tsx`, `LandingPreBanner.tsx`, `leadforge/LeadForgeLanding.tsx` + `content.ts`, `pipeforge/PipeforgeUpsell.tsx`, `templates/EmailWelcomeTemplate.tsx` + `PdfReportTemplate.tsx` + `TemplateShowcase.tsx` + `index.ts`.

## 6. `process.env.*` references (names only, no values)

| Name | Used in |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `lib/supabase/*` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase/{client,server}.ts` |
| `SUPABASE_SERVICE_ROLE_KEY` | `lib/supabase/server.ts` |
| `SUPABASE_SERVICE_KEY` | **presence-checked only** in `/api/ops/health` — **name mismatch with actual read `SUPABASE_SERVICE_ROLE_KEY`** |
| `BIZLEGAL_INBOUND_SECRET` | `lib/ops/log.ts` (HMAC signer) |
| `OPS_LOG_URL` | `lib/ops/log.ts` (default `https://bizlegal-ai.com/api/ops/log`) |
| `OPS_DASHBOARD_TOKEN` | `/api/ops/health` gate |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `FreeAudit.tsx`, `LeadGenDecisionTree.tsx` (widget) |
| `NEXT_PUBLIC_GSC_VERIFICATION` | `layout.tsx` (Google verification meta) |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | `layout.tsx` (Plausible script) |
| `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `NOWPAYMENTS_API_KEY`, `PAYPAL_CLIENT_ID`, `APIFY_TOKEN` | **presence-checked only** in `/api/ops/health`; not read anywhere else |

No secrets printed. Anon key `getEnv` throws at runtime if unset (browser client).

## 7. Integration points

| Point | Direction | Mechanism |
|---|---|---|
| Hub `/api/ops/log` | Outbound | `lib/ops/log.ts` HMAC-SHA256 POST, header `x-bizlegal-signature`, body `{type, source:'leadforge', ...}`. Events fired: `lead.qualified` (free-audit, decision-tree). |
| Hub `/api/ops/health` fleet matrix | Outbound (aggregation) | Subdomain `/api/ops/health` is token-gated and polled by hub. |
| Hub nurture engine | Outbound | `@bizlegal/nurture-enqueue` vertical=`leadforge`, sources `leadforge:free-audit` / `leadforge:decision-tree`. Cross-sell via `crossSellFor('leadforge')` in FreeAudit result. |
| Hub landing pages | Outbound link | Sticky `CrossLinkBanner` → `hub.bizlegal-ai.com/services/compliance-ops`. Footer SiteShell. |
| Supabase | Read/Write (latent) | Supabase clients exist (`lib/supabase/*`) + `public/dashboard.html` static dashboard queries Supabase REST directly (in-browser `apikey`/Bearer). **No current app route uses the supabase clients.** App API routes are pure/hardcoded. |
| `public/llms.txt` | Outbound | LLM-instruction file (free tier $0 / Pro $99/mo claim — pricing not reflected in code; no checkout). |

**Inbound HMAC (`/api/inbound-lead`):** absent despite CLAUDE.md claim — this app consumes no HMAC-signed inbound traffic; it only signs outbound.

## Key findings

1. **No real data paths.** Every API route is either deterministic demo generation (`/api/generate-report`), score-only (`/api/free-audit`), or lead capture (`/api/decision-tree/lead`). Supabase clients unused by routes.
2. **`/api/generate-report` and ChatBot present fabricated deals/funds as credible output** with no disclaimer and no persistence — top-of-funnel demo liability.
3. **Env-name mismatch:** `/api/ops/health` checks `SUPABASE_SERVICE_KEY`; `lib/supabase/server.ts` reads `SUPABASE_SERVICE_ROLE_KEY` — health can report a service key missing while one exists (and vice-versa). Same for `PAYPAL_CLIENT_ID`/`NOWPAYMENTS_API_KEY` presence claims vs. `@bizlegal/payment` reality (never read here).
4. **`/api/digest` is a hardcoded zero-score stub** — hub's activity feed for leadforge will always show "quiet day" until wired to real tables.
5. **Stale `public/robots.txt`** shadows-risk: app-route robots.ts differs (esp. `/pipeforge` and `/clients`, `/orders` disallows).
6. No lint/test scripts; no crons; no middleware.
