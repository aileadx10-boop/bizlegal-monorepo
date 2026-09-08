# 04 — Blog + content-generation pipeline audit

> Night audit 2026-09-08. Read-only. No secrets printed. Walls marked UNKNOWN.

## Blog surface facts

| Surface | URL | Backend | Source of truth | Last content |
|---|---|---|---|---|
| Hub canonical blog | bizlegal-ai.com/blog | apps/hub (Next.js) | monorepo `content/blog/` (`apps/hub/lib/blog.ts` walks `../../content/blog`) | local posts dated 2026-09-06/07 |
| Live blog (CF Pages) | blog.bizlegal-ai.com (root 308 → /blog/) | Cloudflare Pages from GitHub `aileadx10-boop/bizlegal-ea` | `projects/bizlegal-seo-site/content/blog/` (what publisher.py + publish_blog.py write) | sitemap lastmod 2026-07-27; last post 2026-07-20 |
| Sitemap | blog.bizlegal-ai.com/sitemap.xml | CF Pages | — | **429 URLs**; blog tags/categories include case-duplicate category paths (`/blog/category/Compliance/` vs `/blog/category/compliance/`) |

Discrepancy: canonical hub blog renders NEWER content; live CF Pages site is ~7 weeks stale.

## Local post inventory — monorepo `content/blog/` (NEWER than live)

| File | Date | Status | Notes |
|---|---|---|---|
| checks-before-an-ai-agent-touches-your-inbox.mdx | 2026-09-06 | published:true | Moses Dor Adv., legal-AI |
| boi-filing-2026-diy-vs-automated.mdx | 2026-09-06 | published:true | Editorial Team |
| what-is-a-contract-risk-assessment.mdx | 2026-09-06 | published:true | — |
| mica-dora-vara-compliance-benchmark-2026.mdx | 2026-09-06 | published:true | — |
| how-to-respond-to-security-questionnaire-fast.mdx | 2026-06-22 | published:true | pillar 3, docai (commit d7b8839) |
| eu-ai-act-fines-non-compliance-2025.mdx | 2026-07-01 | published:true | canonical blog URL |
| travel-rule-compliance-vasps-crypto-exchanges.mdx | 2026-07-01 | published:true | TRACR |
| fincen-boi-reporting-2026-llc-checklist.mdx | 2026-07-13 | published:false | placeholder byline "Moses [Last Name], J.D." |
| i-ran-a-revenue-leak-report-on-my-own-practice.mdx | placeholder `[YYYY-MM-DD]` | published:false | bracket placeholder date + numbers |
| mica-article-68-2026-casp-authorization-withdrawal.mdx | 2026-07-13 | placeholder | products LexAudit/BRAI/Tracr |
| wallet-forensics-court-admissibility-2026.mdx | 2026-07-13 | placeholder | Tracr |
| comparisons/ | docai-vs-luminance, firmcited-vs-ai (2026-09-06, published); gdpr-vs-ccpa-vs-lgpd, mica-vs-vara-vs-fca, soc2-vs-iso27001-vs-hipaa (2026-07-13) | mixed | |
| 2026-07/ | EMPTY | — | |

## Curator pipeline map (Hetzner CX33 204.168.209.235, /opt/bizlegal/curator)

Step flow: **RSS → scout → daily_gaps → bot/auto_pick → brain → publisher → bizlegal-ea (CF Pages)** — plus downstream seo-agents cron suite and n8n.

| Step | File | Trigger | Status (2026-09-08) | Evidence |
|---|---|---|---|---|
| 1. RSS poll + Ollama filter/rank | scout.py | curator-scout.timer daily 06:00 UTC | **DEAD** | Last run Sep 07 06:46: `0/12 items passed filter` — every item dropped with `404 Not Found for url 'https://curator.bizlegal-ai.com/api/chat'`. Models in .env (mistral-nemo) DO exist locally. |
| 2. Supabase state machine | daily_gaps | scout upserts pending_pick | DEAD (no new rows) | Counts: published **25**, picked **10**, archived **7**, rejected_quality **1**, pending_pick **0**. |
| 3. Telegram pick gate | bot.py | curator-bot.service (long-poll) | **RUNNING** | active; heartbeats every 5min. But nothing to pick (no pending_pick). |
| 4. Fallback auto-pick | auto_pick.py | curator-auto-pick.timer daily 10:00 UTC | INERT (active, no-op) | Fires but no pending_pick rows with score ≥ 14 (scout dead). |
| 5. Draft (Sonnet 4.6 + gates) | brain.py | **NO systemd unit / no timer / no cron** — only spawned by bot.py pick | RUNNING-ON-DEMAND | brain_run7.log (Jun 17 19:59): 2 picked → drafted, quality gate ok, humanize ok, factual review ok (3–4 sources, 0 invented). **10 'picked' rows are STUCK — nothing triggers brain autonomously.** |
| 6. Publish (FastAPI :8082) | publisher.py | curator-publisher.service | **RUNNING but STALE BUILD** | Box file = 9132 B dated **Apr 26**; local = 18216 B dated Jun 11. Box missing forge-affinity dual-commit, numeric-claim verification, `/api/content/syndicate` HMAC POST. Endpoints present on box: /deploy /regen /reject /health. |
| 7. Social distribution copy | distributor.py | no schedule | **DEAD/never run** | socials dir EMPTY on box; writes to /opt/bizlegal/curator/social. |
| 8. Enrichment | firecrawl_enrich.py | no cron | INACTIVE | httpx+trafilatura, no API key needed. |
| 9. Ops telemetry | ops_log.py | bot heartbeat loop | RUNNING | POSTs to https://bizlegal-ai.com/api/ops/log w/ HMAC; failures swallowed. |
| 10. n8n workflow | "My workflow" | docker; ACTIVE daily 03:00 UTC | **DEAD** | Ollama nodes call `https://associates-hardwood-click-jesus.trycloudflare.com/api/generate` (ephemeral trycloudflare tunnel — also dead) AND legacy tunnel; writes to `gap_pages` (different table from daily_gaps), then Vercel deploy hook + Telegram. "Temp Env Reader" inactive. |
| 11. marimo | ghcr.io/marimo-team/marimo | docker | RUNNING (container up 4 mo) | volume /opt/bizlegal/marimo EMPTY. |

### Ollama on box

Local `127.0.0.1:11434 /api/chat` **WORKS** with mistral-nemo (23s OK). Scout/brain/n8n point at `curator.bizlegal-ai.com/api/chat` → 404 (route not configured / dropped at tunnel — likely CF Access or missing api/chat location). Repointing .env `OLLAMA_TUNNEL_URL=http://127.0.0.1:11434` is a zero-code-change unblock.

### Downstream content consumers (box cron, all RUNNING)

| Cron (UTC) | Script | Output |
|---|---|---|
| 02:00 daily | seo-agents/seo_content_writer.py --pillar N | 40 `.mdx` (12–13 KB) in `seo-agents/blog_content/` (adgm-crypto-framework, beneficial-owner-definition-fincen, …) — latest file Jul 27 |
| 03:00 daily | seo-agents/og_image_generator.py | og PNGs |
| 14:30 daily | seo-agents/publish_blog.py | **"published 40/40" on 2026-09-07** → git commits to `aileadx10-boop/bizlegal-ea` (HEAD dc0deaa "feat(blog): --all-pending (pillar 3)", 306cb0b, 1385c6f) |
| 10–21:00 | competitors/ai_checks/index_status/sales/leads/customer_q/seo_watchdog/newsletter | /var/log/seo-agents.log (revenue_alerter `fired:0`) |
| 14:00 | gsc_indexnow_pinger --input seo-agents/blog_content | IndexNow ping with prefix `https://blog.bizlegal-ai.com/posts` — **MISMATCHED prefix** (live site uses `/blog/…`, verified 308 on /blog) |

`/opt/bizlegal/curator/content/blog/` also holds dated stub `.md` files (20 in 2026-08, 7 in 2026-09; 36–37 bytes each, filename-only) — NOT real content, not the publish source.

### Live-site verification

- `https://blog.bizlegal-ai.com/blog/adgm-crypto-framework` → **404**; `.../how-to-respond-to-security-questionnaire-fast` → **404**; `.../checks-before-an-ai-agent-touches-your-inbox` → **404**. → The 40 pushed posts and all local 2026-09 posts are NOT live. **CF Pages deploy stalled since 2026-07-27** despite bizlegal-ea main receiving 40 posts (publish_blog reports success; repo clone at /opt/bizlegal/bizlegal-ea has the commits).

## Blockers to content regeneration

1. **Ollama tunnel dead (scout + n8n)** — `curator.bizlegal-ai.com/api/chat` → 404. Blocks step 1–2; no new daily_gaps rows since ~Sep; 10 rows stuck `picked` because brain has no trigger.
2. **no brain scheduler** — brain.py runs only via Telegram pick callback; auto_pick marks picked but nothing drafts. 10 `picked` rows orphaned.
3. **publisher.py stale on box** (Apr 26 build vs local Jun 11) — no numeric verification, no forge-affinity dual-commit, no syndicate call.
4. **CF Pages deploy stalled** — bizlegal-ea has 40 pending posts (incl. all pillar posts) that 404 live; lastmod 2026-07-27. Blog surface stale even though content pipeline downstream is producing.
5. **n8n "My workflow"** targets ephemeral trycloudflare tunnel + writes to `gap_pages` (wrong table) — dead parallel path, not wired to daily_gags.
6. Local monorepo content (2026-09-06/07) never deployed to live CF Pages site; placeholder bylines (`Moses [Last Name], J.D.`) and bracket date/numbers in unpublished drafts block clean regen of 2+ posts.

## Manual ops queue

| # | Op | Box command (copy-paste) |
|---|---|---|
| 1 | Repoint Ollama to local (or fix CF Access on tunnel route) | `sed -i 's|OLLAMA_TUNNEL_URL=.*|OLLAMA_TUNNEL_URL=http://127.0.0.1:11434|' /opt/bizlegal/curator/.env && systemctl restart curator-bot curator-publisher` |
| 2 | Re-SCP fresh publisher.py to box | `scp -i ~/.ssh/id_ed25519 services/hetzner/publisher.py root@204.168.209.235:/opt/bizlegal/curator/publisher.py && ssh root@204.168.209.235 "systemctl restart curator-publisher"` |
| 3 | Add brain timer/service so picked rows draft autonomously | `scp services/hetzner/systemd/curator-brain.* root@204.168.209.235:/etc/systemd/system/ && ssh root@204.168.209.235 "systemctl daemon-reload && systemctl enable --now curator-brain.timer"` |
| 4 | Verify/fix CF Pages build on bizlegal-ea repo (40 posts stuck) | CF dashboard → Pages project → latest build of `aileadx10-boop/bizlegal-ea`; last success 2026-07-27 |
| 5 | Deactivate or rewire n8n "My workflow" (dead tunnel, wrong table) | n8n UI `:5678` — deactivate "My workflow"; point Ollama nodes at localhost |
| 6 | Fix gsc_indexnow prefix `/posts` → `/blog` | `sed -i 's|https://blog.bizlegal-ai.com/posts|https://blog.bizlegal-ai.com/blog|' /opt/bizlegal/curator/services/seo-agents/gsc_indexnow_pinger.py` |

## UNKNOWN gaps

- Whether **CF Pages build failed** (auth, content hash, branch) or is simply not triggered — dashboard access not automated; root cause UNKNOWN.
- Whether hub canonical blog (bizlegal-ai.com/blog) got the Sep content deployed — hub deploy source is monorepo `apps/hub`, commit d7b8839 present; live hub URL not verified.
- Full listing of bizlegal-ea `projects/bizlegal-seo-site/content/blog` (GitHub API auth failed — "Bad credentials"); live-file inventory UNKNOWN.
- Exact CF Access setup on `curator.bizlegal-ai.com` route (service token vs email OTP) — 404 root cause asserted, config UNKNOWN.
- Telegram bot reachable/hidden state (no live poll captured).
- Where `content/blog/2026-08|09` stub `.md` files come from (writer script UNKNOWN).
- Whether `daily_orchestrator.py --task=04/19` and other seo-agents cron scripts succeed end-to-end (revenue_alerter shows `ok:true fired:0`; others unverified).
