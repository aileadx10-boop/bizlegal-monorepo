# 03 — SEO Status Audit (read-only, 2026-09-08)

Live probes + vault name-presence + migrations + supabase REST counts. No secret values printed.

## 1. Per-host sitemap / robots / AI-crawler matrix (all live probes 2026-09-08)

| Host | sitemap.xml | URLs | sitemap lastmod | robots.txt | AI crawlers (GPT/Claude/Perpl/OAI) | llms.txt |
|---|---|---|---|---|---|---|
| bizlegal-ai.com | 200 | 137 | 2026-08-23 | 200 (65 ln) | **ALLOWED** | 200 |
| docai.bizlegal-ai.com | 200 | 14 | 2026-08-23 | 200 (60 ln) | **ALLOWED** | 200 |
| forge.bizlegal-ai.com | 200 | 8 | 2026-08-23 | 200 (60 ln) | **ALLOWED** | 200 |
| tracr.bizlegal-ai.com | 200 | 10 | 2026-08-23 | 200 (72 ln) | **ALLOWED** | 200 |
| lexaudit.bizlegal-ai.com | 200 | 13 | 2026-08-23 | 200 (68 ln) | **ALLOWED** | 200 |
| brai.bizlegal-ai.com | 200 | 13 | 2026-08-23 | 200 (60 ln) | **ALLOWED** | 200 |
| leadforge.bizlegal-ai.com | 200 | 3 | 2026-08-23 | 200 (60 ln) | **ALLOWED** | 200 |
| bench.bizlegal-ai.com | 200 | 12 | — (none) | 200 (6 ln, minimal) | ALLOWED (default) | 200 |
| blog.bizlegal-ai.com | 200 | 429 | **2026-07-27 (STALE, ~43d)** | 200 (19 ln) | **ALLOWED** | 200 |
| router.bizlegal-ai.com | 200 text/plain, 0 urls | 0 | — | 200 (1 ln) | N/A | 200 |
| cited.bizlegal-ai.com | 200 | 52 | 2026-07-07 | 200 (37 ln) | explicit GPTBot/ClaudeBot/PerplexityBot **Allow: /** | 200 |
| propsignal / leaseparse / closeflow / coguard | ERR | — | — | ERR | — | ERR (not deployed) |

**Robots interpretation (important):** Next.js fleet robots is AI-friendly — `User-Agent:*` + a large allow-list of Googlebot/Bing/GPTBot/ClaudeBot/anthropic-ai/PerplexityBot/OAI-SearchBot/etc. all get `Allow: /` (only /api/, /_next/, /ops disallowed). Only scraper bots (Bytespider, CCBot, Diffbot, SemrushBot, AhrefsBot, MJ12, DotBot, BLEXBot, Imagesift, Petal) are `Disallow: /`. Blog blocks only 4 scrapers. Cited has per-bot `Allow`. **AI crawlers are NOT blocked anywhere deployed.** Crawl-delay:1 on hub/docai.

## 2. GSC wiring state

| Item | State |
|---|---|
| GSC_SERVICE_ACCOUNT_JSON (vault) | **EMPTY/UNSET** → no programmatic GSC API, no auto sitemap submission, no URL-inspection automation |
| GSC_BOT_ADMIN_TOKEN (vault) | EMPTY/UNSET |
| INDEXNOW_KEY (vault) | SET (32 chars) |
| GSC property add/verify (8 listed in GSC-SETUP doc) | MANUAL, UNKNOWN (Moses step, no automation evidence) |
| Sitemaps submitted to GSC per property | UNKNOWN (manual; docs list 8 sitemap URLs to paste) |
| Google Indexing API | NOT set up (no service account) |
| IndexNow submission evidence | done 2026-06-22 (22 URLs, HTTP 200 per prior doc) |

**GSC is effectively NOT wired.** 60-80% of benefit claimed via IndexNow→Bing path only. This is the #1 indexing blocker — agents cannot see impressions/clicks or push re-indexing.

## 3. seo-agents inventory (services/seo-agents/)

| Script | Function | Schedule (crontab.txt) | Outputs / DB writes |
|---|---|---|---|
| daily_autonomous_seo.py | Master orchestrator S1–S8: audit→enrich→publish→IndexNow→discover→headhunt→OCI→Telegram | 07:00 UTC | decisions/DAILY-AUTONOMOUS-<date>.md; streams |
| page_audit.py | Scores 53 pages / 8 surfaces on SEO+GEO+AEO; grade A–F | 06:00 UTC | /opt/bizlegal/decisions/SEO-AUDIT-<date>.md + supabase **seo_pages** (INSERT "audit/…" row per page) |
| seo_content_writer.py | 40-post engine; 1500-word posts w/ FAQ+Article schema, product links from SEO-KEYWORD-CALENDAR.json | content pipeline (02:00 in crontab.txt comment) | .mdx → content/blog |
| keyword_calendar.py | 365-post calendar: 8 pillars × ~46, weekend=comparisons, day-of-year rotation | — | SEO-KEYWORD-CALENDAR.json |
| internal_linker.py | Injects internal cross-links into .mdx (keyword matching) | — | .mdx edits |
| gsc_indexnow_pinger.py | IndexNow (+ Bing WMC, Telegram) on new .mdx; stdlib only | 13:00 (via seo_watchdog) | api.indexnow.org pings |
| seo_watchdog.py | Consolidate daily crawlers, fire IndexNow, Telegram alert on regressions (reads agent_runs) | 13:00 UTC | agent_runs reads, alerts |
| publish_blog.py | Syncs .mdx → bizlegal-ea GitHub (Contents API) → CF Pages blog | — | GitHub commit → blog deploy |
| daily_orchestrator.py | Hourly cron wrapper tasks 04/05/06/19 | 04,05,06,19 UTC | /var/log/seo-agents.log |
| crawlers/* (site_health 08, backlinks 09, competitors 10, ai_checks 11, index_status 12, sales 15, leads 16, customer_q 17) | Per-hour crawl jobs | as listed | agent_runs + supabase |
| enrich_page.py, geo_citation.py, affiliate_funnel.py, content_distribution.py, newsletter.py, conversion_tracker.py, revenue_attribution.py, analytics_dashboard.py, comparison_generator.py, infographic_generator.py, og_image_generator.py, visual_assets.py, lead_magnet.py, ea_agent.py, discovery_scraper.py, ops_alerts.py, telegram_bot/heartbeat.py, cleanup.py | Support pipeline (enrich, citations, affiliates, reports) | per crontab | mixed |

Hetzner crontab "RUNNING" is prior-audit evidence; **installation not verifiable from this box** → UNKNOWN. Local artifacts: none under services/seo-agents (outputs intended for /opt/bizlegal on Hetzner).

**Key defect:** page_audit.py docstring claims a `seo_audits` table; it actually writes to `seo_pages` (also in code), and **seo_audits does not exist in DB (REST 404)** — stale doc.

## 4. Keyword strategy → content coverage

Pillars from SEO-SUBSCRIPTION-10K-MRR-PLAN §4 (8 pillars):

| Pillar (target kws) | Content in content/blog |
|---|---|
| 1. BOI/FinCEN (diy vs automated, llc checklist) | YES — boi-filing-2026-diy-vs-automated.mdx, fincen-boi-reporting-2026-llc-checklist.mdx, 2026-07/boi-certifying-officer-liability-llcs.md |
| 2. VARA/UAE crypto | PARTIAL — mica-vs-vara-vs-fca-crypto-licensing.mdx |
| 3. SOC 2 / compliance automation | YES — soc2-vs-iso27001-vs-hipaa-compliance.mdx, how-to-respond-to-security-questionnaire-fast.mdx |
| 4. GDPR / DPA | YES — gdpr-vs-ccpa-vs-lgpd-data-privacy.mdx |
| 5. Crypto tax / wallet forensics | PARTIAL — wallet-forensics-court-admissibility-2026.mdx, travel-rule-compliance-vasps-crypto-exchanges.mdx |
| 6. PSP / payment licensing | NO post |
| 7. Singapore PSA/MAS | NO post |
| 8. India DPDPA | NO post |
| (bonus) MiCA cluster | WELL COVERED — mica-article-68, mica-dora-vara-benchmark, eu-ai-act, 2026-07/mica-article-23, 2026-07/mica-casp-which-member-state (NOT one of the 8 pillars) |
| (bonus) Comparisons cluster | 5 posts — docai-vs-luminance, firmcited-vs-ai, gdpr-vs-ccpa-vs-lgpd, mica-vs-vara-vs-fca, soc2-vs-iso27001-vs-hipaa |

Gaps: pillars 6/7/8 have zero content; pillar calendar (365) vs actual (20) = 94% un-written.

## 5. Indexation evidence / content fleet

- content/blog in monorepo: **20 posts** (16 .mdx + 4 .md in 2026-07/). Newest dated **2026-09-06/07** (i-ran-revenue-leak-report, boi-filing, comparisons batch).
- Live blog (blog.bizlegal-ai.com): sitemap **429 urls, lastmod 2026-07-27** → stale **~43 days**.
- Live probe: `/posts/{mica-vs-vara-vs-fca-crypto-licensing, soc2-vs-iso27001-vs-hipaa-compliance, boi-filing-2026-diy-vs-automated, i-ran-revenue-leak-report}` → **all 404**. The freshly-written posts are NOT deployed.
- Root cause: live blog is a separate CF-Pages app in **bizlegal-ea repo** (209 posts per CLAUDE.md); monorepo `content/blog` is NOT the deploy source. publish_blog.py (the bridge) not producing deploys since ~2026-07-27 → **content pipeline dead**.

## 6. SEO tables (supabase)

| Table | Exists? | Evidence |
|---|---|---|
| daily_gaps | EXISTS (migration 20260617) | REST count 400/UNKNOWN (prior audit: 43 rows) |
| seo_citation_log | EXISTS (migration 20260716_revenue_agent_tables.sql) | rows=\*/\* (exists; count uncountable via range) |
| seo_pages | EXISTS | rows=0-0/\* (≥1) |
| seo_audits | **MISSING (REST 404)** | script docstring is stale |
| page_enrichments | EXISTS | \*/\* |
| content_queue | **MISSING (REST 404)** | migration 20260906_content_queue.sql NOT applied |
| published_content | **MISSING (REST 404)** | same migration not applied |

## 7. SILO / internal-link inventory (apps/hub)

- Hub sitemap (137 urls) includes SILO surfaces: **/guides 68, /regulations 13, /tools 10, /learn 7** → hubs generated + sitemapped. /learn track+lesson urls present.
- /blog has **1** hub entry (index only; posts live on blog subdomain).
- **noindex (index:false) inventory** — deliberate hygiene, all private/transient:
  - hub: /dashboard, /docs, /kit, /deal/[token], /report/[id], /contact/thank-you, /affiliates/[code]/dashboard, **/learn/[track]/[lesson]** (lessons; track hubs indexed)
  - ops/* (all), api helpers
  - app-specific: bench/web/app/report/[id], docai/web/app/sqa/kb, deal44 app/r/[token]
- robots.ts present in: hub, brai, docai, forge, leadforge, lexaudit, bench, deal44, falseecho, sellerradar.

## WORKING vs BROKEN vs NOT-WIRED

**WORKING:** sitemaps+robots live on all **deployed** subdomains; AI crawlers allowed everywhere (GEO-friendly); llms.txt live everywhere; hub SILO hubs generated; IndexNow key present & previously used; noindex hygiene correct; robots.ts per-app.

**BROKEN:** blog content pipeline (0 new posts live in 43 days; freshly-written posts 404); blog sitemap lastmod frozen since 2026-07-27; content_queue/published_content migrations unapplied; seo_audits referenced but missing; keyword calendar 94% unfulfilled; pillars 6/7/8 empty.

**NOT-WIRED:** GSC (no service account, no Indexing API, no per-property verification evidence) → indexing feedback & re-index automation absent; blog source split (monorepo content/blog ≠ live blog source).

**UNKNOWN:** exact GSC property verification/submission per property; whether Hetzner crontab daemon actually running (prior audit: RUNNING); daily_gaps exact row count (REST 400); per-page live audit scores (requires running page_audit.py); router.bizlegal-ai.com purpose.
