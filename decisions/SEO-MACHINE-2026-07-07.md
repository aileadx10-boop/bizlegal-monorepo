# SEO + AEO + Indexing 24/7 Machine

**Built:** 2026-07-07
**Owner:** Moses (BizLegal AI)
**Source:** `decisions/SEO-MACHINE-2026-07-07.md`
**Status:** Live on Hetzner via cron (after this commit)

## Mission

Drive free, compounding search + AI-citation traffic to all 8 BizLegal subdomains
until $10K MRR is reached from organic + AEO inbound. The system runs unattended
and self-corrects.

## Audit baseline (2026-07-07 09:46 UTC)

| Metric | Value | Gap |
|---|---|---|
| Total seo_pages | 231 | — |
| Published | 177 | — |
| Deployed | 145 | **32 published-but-not-deployed** |
| Avg word count (published) | 176 | Need 800+ for SEO |
| Published pages with regulation_tag | 46 / 177 | **131 missing** |
| Jurisdiction naming inconsistent | 10 / 177 | 4 variants of "united-states" / "united-kingdom" |
| CTA to tracr ($299) | 1 / 177 | Revenue imbalance |
| IndexNow / sitemap pings on schedule | 0 | No pipeline |
| AEO FAQPage JSON-LD coverage | 0 | All pages missing FAQ schema |

## The 4 agents (all in `services/agents/`)

### 1. `content_enricher_v2.py` — daily 02:00 UTC
Backfills structural gaps in seo_pages, no LLM:
- Inferred `regulation_tag` from slug + keywords (16 patterns: MiCA, VARA, SEC, FCA, MAS, GDPR, HIPAA, AML, CASP, FinCEN, OFAC, SOX, NIS2, DORA, AI Act, Fintech, Crypto)
- Jurisdiction canonicalization (10 variants → 4 canonical: united-states, united-kingdom, european-union, uae, singapore, canada, portugal, global)
- Auto-deploy flag: if published=true and word_count >= 200, set deployed=true
  (catches the 32 published-but-not-deployed without re-publishing)

### 2. `aeo_loop_v2.py` — daily 03:00 UTC
For top 5 published pages (by total_score) where FAQ or schema_type is missing,
generate 4 Q&A pairs + set schema_type to "Article+FAQ" via Claude Haiku.
Purpose: become a citation source for ChatGPT, Perplexity, Claude.

### 3. `index_watchdog.py` — daily 04:00 UTC
- IndexNow ping for the 200 most-recently-updated deployed pages
- GSC sitemap re-submission for all 8 subdomains
- Detect index drops >10% vs 7-day rolling avg, Telegram-alert Moses
- Falls back gracefully when IndexNow key or Telegram bot missing

### 4. `seo_dispatcher.py` — every 12h (00:00, 12:00 UTC)
WAT orchestrator. Chains 3 existing specialists (no duplication):
- `content_seeder` → `seo_content_writer.render_post` → writes .mdx to `publish_blog.SOURCE_DIR`
- `content_publisher` → `publish_blog.run` → commits to bizlegal-ea via GitHub Contents API
- `content_indexer` → `gsc_indexnow_pinger.run` → IndexNow + Bing + GSC pings

Idempotent: re-runs skip keywords whose slug already exists.
Fails fast on first error. Heartbeats to `agent_runs` per step.

## Existing agents in cron (untouched)

- `content_enricher.py` (every 6h) — Vercel app pages → Anthropic → `page_enrichments`
- `revenue_alerter.py` (every 1m) — hot-lead → Telegram
- `daily_revenue_summary.py` (18:00 UTC) — daily email digest

## Cron schedule on Hetzner

```
0 0,12 * * *   seo_dispatcher       — write+publish+ping (12h)
0   2 * * *    content_enricher_v2  — backfill gaps
0   3 * * *    aeo_loop_v2          — FAQ + JSON-LD
0   4 * * *    index_watchdog       — IndexNow + GSC + alerts
0 */6 * * *    content_enricher     — Vercel app pages (existing)
```

## Expected outcomes (30 days)

| Metric | Before | Day 30 target |
|---|---|---|
| regulation_tag coverage | 26% | 95% |
| jurisdiction canonical | 95% | 100% |
| published-not-deployed | 32 | 0 |
| AEO FAQ coverage | 0 | 150+ |
| IndexNow pings/month | 0 | 6,000+ |
| Indexed pages (GSC) | ~145 | ~200+ |
| Cited in ChatGPT/Perplexity | 0 | 10+ pages |

## Rollback

Each agent is idempotent and dry-runnable. To disable:
```bash
ssh root@204.168.209.235 "cd /opt/bizlegal/curator && sed -i '/seo_dispatcher\|content_enricher_v2\|aeo_loop_v2\|index_watchdog/d' services/cron_jobs.txt && python3 services/cron_installer.py"
```

## Files touched by this commit

- `services/agents/seo_dispatcher.py` (new, 8.6KB)
- `services/agents/aeo_loop_v2.py` (new, 8.8KB)
- `services/agents/index_watchdog.py` (new, 9.4KB)
- `services/agents/content_enricher_v2.py` (new, 9.1KB)
- `services/cron_jobs.txt` (+4 entries)
- `decisions/SEO-MACHINE-2026-07-07.md` (this file)
