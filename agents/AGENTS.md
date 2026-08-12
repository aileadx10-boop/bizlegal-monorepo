# Agents Index — BizLegal AI

**Last updated:** 2026-07-04  
**Surfaces:** Hetzner CX33 + Vercel (hub) + Cloudflare Workers  

This file is the authoritative index of every agent, cron job, and tool in the BizLegal AI system.  
Update this file whenever a new agent is added (see `agents/HERMES-STANDING-ORDERS.md` O6).

---

## THE MACHINE — Hetzner WAT Agents

Orchestrated by `services/agents/orchestrator.py`. All run via `crontab -l` on Hetzner CX33 (`root@204.168.209.235`). Logs at `/opt/bizlegal/curator/logs/machine/`.

| Agent | File | Schedule (UTC) | Purpose | Status |
|---|---|---|---|---|
| enrichment | `services/agents/enrichment_agent.py` | 02:00, 14:00 | Domain/person → 360 profile via Firecrawl + Apify | LIVE |
| headhunter | `services/agents/headhunter_agent.py` | 04:30 | Compliance hiring signals → queue personalized outreach | LIVE |
| lead_capture | `services/agents/lead_capture_agent.py` | webhook | Inbound form → 4-stage Haiku pipeline → qualified lead | LIVE |
| content | `services/agents/content_agent.py` | 06:00 | 1 blog + 1 LinkedIn + 1 image + 1 video script/day | LIVE |
| socials | `services/agents/socials_agent.py` | 09:00, 13:00, 18:00 | Cross-post to 7 platforms via Blotato API | LIVE (needs BLOTATO_API_KEY) |
| code | `services/agents/code_agent.py` | 00:15 | Monitor Vercel + endpoints → open PRs on regression | LIVE |
| newsletter | `services/agents/newsletter_agent.py` | Tue 08:00 | Weekly HTML digest → Resend audience | LIVE (needs RESEND_AUDIENCE_ID) |
| monetization | `services/agents/monetization_agent.py` | every 15 min | Hot lead → deal room → Stripe checkout link | LIVE (fixed 2026-07-04) |
| signal_scout | `services/agents/signal_scout.py` | 01:00 | Broader signal scan: LinkedIn → Apollo match → Supabase | LIVE |

**Registry:** `services/agents/registry.py` — env for all agents  
**Orchestrator:** `services/agents/orchestrator.py` — dispatch + heartbeat  
**Env loader:** `services/agents/_env.py` — safe env getters  

---

## SEO/Curator Pipeline — Hetzner

All run via crontab. Logs at `/var/log/seo-agents.log`. Source: `/opt/bizlegal/curator/services/seo-agents/`.

| Job | Schedule (UTC) | Purpose | Status |
|---|---|---|---|
| `brain.py` | 00:00 (systemd) | Pick + draft curator articles | LIVE |
| `quality_gate.py` | 01:00 | Filter low-quality drafts | LIVE |
| `daily_orchestrator.py --task=04` | 04:00 | SEO task dispatch | LIVE |
| `seo_content_writer.py` | 02:00 | Write 1 MDX/day | LIVE |
| `og_image_generator.py` | 03:00 | Generate 1 PNG OG image/day | LIVE |
| `internal_linker.py` | 03:30 | Inject product links | LIVE |
| `affiliate_funnel.py` | 06:00 | Add CTAs to articles | LIVE |
| `geo_citation.py` | 07:00 | Perplexity citation check | LIVE |
| `gsc_indexnow_pinger.py` | 14:00 | IndexNow to Google/Bing | LIVE |
| `publish_blog.py` | 14:30 | Commit MDX to bizlegal-ea repo | LIVE (needs GITHUB_TOKEN) |
| `ea_agent.py` | 19:30 | Daily Telegram report | LIVE |
| `analytics_dashboard.py` | 23:00 | 30-day SVG chart | LIVE |
| `cold_email_outreach.py` | 09:30 | Send cold outreach drafts via Resend | LIVE (dry-run until Moses approves live send) |
| `headhunter.py` | 04:30 | Apollo enrichment + lead queue | LIVE (needs APIFY_API_TOKEN) |
| `lead_nurture.py` | 09:00 | Follow-up sequences for replied leads | LIVE |

---

## Vercel Hub Crons

All defined in `apps/hub/vercel.json`. Run serverlessly on hub.bizlegal-ai.com (Vercel).

| Endpoint | Schedule | Purpose | Status |
|---|---|---|---|
| `/api/cron/billing/charge-due` | 07:00 daily | Charge due invoices | LIVE |
| `/api/cron/boi/check` | 14:00 daily | BOI compliance check | LIVE |
| `/api/cron/ops-alerts` | every 15 min | Telegram ops alerts | LIVE |
| `/api/cron/smoke` | 09:00 daily | Surface health check | LIVE |
| `/api/cron/ai-act-monitor` | 11:00 daily | EU AI Act monitor | LIVE |
| `/api/cron/policy-refresh` | 12:00 daily | Policy framework refresh | LIVE |
| `/api/agents/run?task=daily-revenue-digest` | 08:00 daily | Revenue digest | LIVE |
| `/api/agents/run?task=daily-standing-review` | 18:00 daily | System health review | LIVE |
| `/api/cron/social-queue` | every 30 min | Social queue processor | LIVE |
| `/api/cron/daily-todo` | 06:00 daily | Daily todo generation | LIVE |
| `/api/cron/invoices` | 10:00 daily | Invoice follow-up cron | LIVE |
| `/api/cron/affiliate-reconcile` | Fri 10:30 | Affiliate reconciliation | LIVE |

---

## Cloudflare Workers

| Worker | File | Purpose | Status |
|---|---|---|---|
| bizlegal-lead-intake | `services/worker/` | Inbound lead → HMAC → hub /api/inbound-lead | LIVE |
| telegram-hub | `services/telegram-hub/` | @BizlegalHubBot FAQ bot | LIVE |
| gsc-bot | `services/gsc-bot/` | Weekly GSC sitemap submission | LIVE |

---

## Product APIs (Vercel Functions)

| Endpoint | Surface | Purpose | Status |
|---|---|---|---|
| `apps/hub/app/api/compliance-snapshot/route.ts` | hub | $9 one-time compliance scan | LIVE |
| `apps/hub/app/api/compliance-snapshot/checkout/route.ts` | hub | Stripe checkout for $9/$19 | LIVE (Stripe stub) |
| `apps/hub/app/api/qualify/route.ts` | hub | Async qualifier chat | LIVE |
| `apps/hub/app/api/pay/start/route.ts` | hub | NOWPayments + PayPal checkout URL builder | LIVE |
| `apps/docai/web/app/api/scan/route.ts` | docai | $97 contract scan | LIVE |
| `apps/lexaudit/app/api/audit/route.ts` | lexaudit | $99/mo compliance cert | LIVE |

---

## Event Types (ops-log)

Key event types in `packages/ops-log/src/index.ts`:

- `payment.initiated` / `payment.confirmed` / `payment.failed`
- `lead.captured` / `lead.qualified` / `lead.outreach.drafted`
- `agent.run.success` / `agent.run.failed`
- `content.published` / `content.indexed`
- `deal.room.created` / `deal.room.converted`
- `mica.deadline.alert`      // MiCA deadline digest alert sent

Full list: `packages/ops-log/src/index.ts`

---

## Moses-Only Gates (blocks autonomous sends)

| Gate | What unlocks | Status |
|---|---|---|
| APIFY_API_TOKEN → Hetzner .env | headhunter LinkedIn signal scrape | MISSING |
| BLOTATO_API_KEY → Hetzner .env | socials_agent 7-platform posts | MISSING |
| RESEND_AUDIENCE_ID → Hetzner + Vercel | newsletter.py + subscriber capture | MISSING |
| GITHUB_TOKEN → Hetzner .env | publish_blog.py daily commit | MISSING |
| cold_email_outreach.py live mode | cold outreach sending | BLOCKED (dry-run only) |
| hub.bizlegal-ai.com CNAME in Cloudflare | hub DNS public resolution | MISSING (Moses-only) |
| STRIPE_SECRET_KEY live key | Stripe checkout for Compliance Snapshot | MISSING |
