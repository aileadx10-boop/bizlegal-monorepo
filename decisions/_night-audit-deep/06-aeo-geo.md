# 06 — AEO / GEO Status Audit (read-only, 2026-09-08)

Scope: the "get cited by ChatGPT/Claude/Perplexity/Google AI" layer. Sources: decisions GEO-EXECUTION-REPORT-2026-06-19, AEO-AUSTIN-ARMSTRONG-2026-07-02, SEO-SUBSCRIPTION-10K-MRR-PLAN, AI-TEAMMATES-FOUR-CS-2026-09-06, HEADHUNTER-REPORT-2026-06-23; FirmCited repo (vertical.config.ts, audit-engine, monitor, visibility-index, /grok-bot); apps/hub SILO; services/agents; live probes. No secret values printed.

## 1. Plan → Implemented (AEO/GEO mechanisms)

| # | Mechanism (plan source) | Planned | Implemented | Evidence |
|---|---|---|---|---|
| 1 | llms.txt catalog on all product surfaces (GEO-EXEC §1, AEO-ARM §5) | YES | **LIVE** | HTTP 200 on 8/8 surfaces (hub 3924B, brai, tracr, lexaudit, forge, leadforge, docai/web, blog) |
| 2 | AI-bot allowlist robots.ts (36 agents) + scrape blocklist (GEO-EXEC §2A) | YES | **LIVE** | robots.txt 200 all surfaces; GPTBot/ClaudeBot/PerplexityBot ALLOWED; no CF block (AI Crawl Control + Managed robots OFF at edge) |
| 3 | Homepage + product JSON-LD (SoftwareApplication/ItemList/FAQPage/Org) (GEO-EXEC §1) | YES | **LIVE** | 5 blocks in hub SSR HTML; guide/learn pages carry Article/FAQ/Breadcrumb/ItemList + canonical |
| 4 | Hub SILO hubs: /guides /regulations /tools /learn (plan §4) | YES | **LIVE** | sitemap counts guides 68 / regulations 13 / tools 10 / learn 7; tracks indexed, lessons noindexed |
| 5 | 90-day AEO calendar, 39 posts, 5 pillar pages, correct-the-AI pages (AEO-ARM §4/§10) | YES | **NO — 0/39 published live** | live blog stale since 2026-07-27; freshly-written posts 404; pillars 2/5 partial, 6/7/8 empty |
| 6 | 365-post keyword calendar / 8-pillar SERP plan (SEO-SUB §4) | YES | **PARTIAL (~6%)** | 20 posts exist in monorepo content/blog vs 365; blog sitemap frozen 2026-07-27 |
| 7 | Citation tracking → seo_citation_log (aeo_revenue_agent Stage 2; SEO-SUB) | YES | **DARK** | table EXISTS (migration 20260716_revenue_agent_tables) but **zero writers**; aeo_revenue_agent only READS it (docstring claims "updates") |
| 8 | Citation/SoV measurement via SERP tooling (4 engine callers) | YES | **LIVE in audit engine** | Firmcited engines.ts: OpenAI Responses + web_search, Anthropic web_search tool, Perplexity sonar, SerpAPI ai_overview; graceful skip when unkeyed |
| 9 | Visibility index (~15 prompts × 4 engines), publish gate (Firmcited visibility-index) | YES | **PARTIAL — no cron** | migration 0008 exists; stages draft→reviewed→published→killed; vercel.json has **no** visibility-index cron; publish is human-gated |
| 10 | Monthly Monitor $299 scan (recurring audits) | YES | **LIVE** | monitor-runner.ts sweep + IN_FLIGHT guard + PayPal sub; fc_subscriptions=0 |
| 11 | GSC programmatic submission (gsc-bot worker, SEO-SUB §5) | YES | **NOT-WIRED** | worker + service-account code exists, but GSC_SERVICE_ACCOUNT_JSON EMPTY/UNSET in vault; per-property verification UNKNOWN |
| 12 | IndexNow ping per publish (SEO-SUB §5) | YES | **PARTIAL** | INDEXNOW_KEY SET (32ch); last use 2026-06-22; no live publish pipeline to ping |
| 13 | Blog deploy bridge (monorepo content → CF Pages via publish_blog.py) | YES | **DARK** | blog live app stale 43d; monorepo content/blog NOT the deploy source |
| 14 | Grok Bot offer (vertical.config grokbot) | YES (FirmCited) | **LIVE + CONFLICT** | /grok-bot page sells $490 audit ladder; contradicts decision O-018 (see §6) |

## 2. FirmCited AEO stack status

| Component | Status | Notes |
|---|---|---|
| $490 AI Visibility Audit (temp $20) | LIVE (build+checkout) | runner.ts orchestrator; inspectFirmSite checks FAQPage/Attorney/LegalService schema + intake; MIN_ENGINES=2; PDF + email delivery |
| Engine callers (ChatGPT/Claude/Perplexity/Google AI Overview) | LIVE | SerpAPI empty-text = meaningful "no AI Overview"; unkeyed engines skipped, not fatal |
| Monitor $299/mo recurring | LIVE | 27-day recur; IN_FLIGHT_STATUSES guard; PayPal subscription (fc_subscriptions=0 rows) |
| Visibility Index (~15 prompts) | BUILT, not scheduled | 'draft' stage hard-gated; refuses to rank when runsOk < half; needs manual run + publish |
| Citation tracking (post-delivery) | ABSENT | audit delivers one-time report; no follow-up SoV/citation-log write anywhere |
| /grok-bot page | LIVE | 4-rung ladder; client-owned Grok sub pass-through ($20-30/mo) |

## 3. Hub GEO content inventory

| Surface | URLs | JSON-LD | Status |
|---|---|---|---|
| /guides | 68 | Article+FAQ+Breadcrumb (+canonical alternates) on representative pages | LIVE |
| /regulations | 13 | standard (ItemList) | LIVE |
| /tools | 10 | standard | LIVE |
| /learn | 7 tracks (lessons noindexed) | canonical+ItemList+Breadcrumb on tracks | LIVE |
| /blog | 1 (index only) | — | posts live on blog subdomain, not hub |
| blog.bizlegal-ai.com (CF Pages) | 429 | — | **STALE 2026-07-27 (~43d)**; fresh posts 404 |
| monorepo content/blog | 20 (16 mdx + 4 md) | FAQ+Article on writer engine | NOT the live deploy source |

## 4. AI-crawler robots / llms.txt matrix (live probes 2026-09-08)

| Host | robots.txt | AI crawlers (GPT/Claude/Perpl/OAI) | llms.txt |
|---|---|---|---|
| bizlegal-ai.com | 200 | ALLOWED | 200 |
| docai/forge/tracr/lexaudit/brai/leadforge | 200 | ALLOWED | 200 |
| bench | 200 (minimal) | allowed (default) | 200 |
| blog | 200 | ALLOWED (4 scrapers blocked) | 200 |
| cited (FirmCited) | 200 | explicit per-bot Allow:/ | 200 |
| router | 200 (1 ln) | N/A | 200 |
| propsignal/leaseparse/closeflow/coguard | ERR | — | ERR (not deployed) |

Cloudflare AI Crawl Control + Managed robots.txt confirmed OFF (no CF block served) — the 2026-06-19 blocker is resolved.

## 5. Measurement tooling presence (vault/secret NAMES only)

| Key | Presence |
|---|---|
| PERPLEXITY_API_KEY | name in vault + Firmcited .env.local; prod-Vercel wiring UNKNOWN |
| SERPAPI_API_KEY | same |
| INDEXNOW_KEY | SET (32 chars) |
| GSC_SERVICE_ACCOUNT_JSON | EMPTY/UNSET |
| GOOGLE_API_KEY / APIFY_API_TOKEN | names present; wiring UNKNOWN |
| OPS_DASHBOARD_TOKEN | vault ↔ Vercel MISMATCH (ops locked) |
| seo_citation_log rows | table exists; live row count UNKNOWN (REST range uncountable); zero writers confirmed |

## 6. Grok Bot status — CONFLICT

- cited.bizlegal-ai.com/grok-bot **LIVE**, sells $490 opportunity audit (shared checkout) + ladder.
- Decision O-018 (AI-TEAMMATES-FOUR-CS-2026-09-06) rejects Grok Bot setups for BizLegal; re-open gates = G1 passed + business ToS/DPA + spend cap + sub inside engagement price. Live page's guardrails transfer compliance responsibility to buyer and do not claim a DPA/spend-cap — does not satisfy the gates. **Unresolved human call: does O-018 bind FirmCited? Flag for Moses.**

## 7. LIVE / PLANNED / DARK summary

**LIVE:** robots allowlists + llms.txt 8/8; hub SILO hubs + JSON-LD; FirmCited audit+monitor engines with 4 engine callers; IndexNow key.
**PLANNED (never delivered):** 90-day/39-post AEO calendar; 5 pillar + correct-the-AI pages; 365-post calendar (94% unwritten); visibility-index cron + publish gate; GSC service account.
**DARK:** seo_citation_log writes (0 writers); blog publish bridge (43d stale; fresh posts 404); curator content flywheel (scout 0/12 — /api/chat 404 behind CF Access + no gemma); GSC automation; llms.txt regeneration (llms_generator.py NOT on cron — catalogs stale after content changes).

**UNKNOWN:** prod presence of PERPLEXITY/SERPAPI keys in Hub+FirmCited Vercel envs; whether aeo_revenue_agent actually fires (Hetzner cron daemon unverifiable from this box; box content-dead though agent targets Supabase+Anthropic directly); GSC per-property verification; seo_citation_log live counts; Monitor subscriber count (fc_subscriptions=0); FirmCited free-check / diy-audit pages (not read).
