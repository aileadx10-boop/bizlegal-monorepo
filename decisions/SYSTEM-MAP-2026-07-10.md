# BizLegal AI — Complete System Map
**Date:** 2026-07-10
**Owner:** Moses
**Author:** Hermes (audit)
**Status:** Living document

## 1. Code Surface

### 1.1 Next.js Apps (Vercel-deployed, 8 subdomains)
| App | LOC | Subdomain | Purpose |
|-----|-----|-----------|---------|
| hub | 53,953 | bizlegal-ai.com + www | The orchestrator + hub UI + all payment APIs + newsletter + webhooks |
| docai | 28,703 | docai.bizlegal-ai.com | The flagship product: AI contract/DPA/security questionnaire scanning |
| tracr | 17,528 | tracr.bizlegal-ai.com | Crypto wallet forensics (tracr_orders has 11 paid orders!) |
| forge | 18,156 | forge.bizlegal-ai.com | BOI (Beneficial Ownership Information) compliance kit |
| lexaudit | 14,308 | lexaudit.bizlegal-ai.com | Compliance monitor + sanctions screening |
| brai | 9,643 | brai.bizlegal-ai.com | Regulatory intelligence digest |
| leadforge | 4,145 | leadforge.bizlegal-ai.com | Lead-gen landing pages + outbound |
| funnel-mvp | 0 | (not deployed) | Empty starter |
| **Total** | **146,436 LOC** | | |

### 1.2 Python Agents (Hetzner, 38+ .py files)
Layered by purpose:

| Layer | Count | Examples |
|-------|-------|----------|
| **SEO machine** (always-on content) | 14 | seo_content_writer, og_image_generator, internal_linker, geo_citation, crawlers/* (5) |
| **Outreach** (the spam-machine back door) | 7 | headhunter, cold_email_sender, cold_email_outreach, lead_nurture (3 stages), oci_funnel, oci_deal_closer, reddit_outreach, marketing_outreach |
| **Lead pipeline** | 4 | lead_capture_agent, enrichment_agent, lead_nurture_state, headhunter_agent |
| **Monetization** | 4 | monetization_agent (deal rooms), engaged_monetization (rebuild from spam), daily_revenue_summary, revenue_alerter |
| **Content** | 3 | content_agent, marketing_copy, content_enricher_v2 |
| **Quality** | 2 | code_agent, code_fixer |
| **Ops** | 5 | daily_digest, env_audit, ops_heartbeat, aeo_loop_v2, index_watchdog |
| **Specialty** | 4 | daily_autonomous_seo, socials_agent, seo_dispatcher, dunning.py |

### 1.3 Cron Jobs (Hetzner crontab, 77 active, 8 disabled)
Schedule density: ~30 cron entries/day, plus the orchestrator's per-30-min ticks.

**PROBLEM (sibling missed):** The "spam halt" only disabled 3 cron lines (outreach_pipeline, outreach_sender, monetization_v2). The larger back-door machine — `headhunter`, `cold_email_outreach`, `lead_nurture` (3 stages), `oci_deal_closer`, `oci_funnel`, `reddit_outreach`, `marketing_outreach`, `queue_outreach`, `daily_autonomous_seo --headhunter-limit 3` — is **STILL ACTIVE** and will continue sending at 9:35am, 10:00am, 10:30am, 10:35am, 4:30am, 16:05pm, 21:05pm, 22:00pm UTC today and every day.

## 2. Data Surface

### 2.1 Supabase (105 tables, 12 SQL migrations)
| Domain | Populated Tables | Empty Tables (built but unused) |
|--------|------------------|---------------------------------|
| Payments | payment_orders (254) | product_orders, boi_orders, fc_orders, fc_subscriptions, boi_subscriptions, subscriptions |
| Leads | leads (5), leadforge_leads (278 scraped), lead_outreach (63 historical), inbound_leads (0) | leads_raw, leads_clean, lead_magnets, deal_router_leads, lead_nurture_state, fc_leads, tracr_wallet_leads |
| Content | seo_pages (231) | fc_pages, fc_audits |
| Ops | agent_runs (1007+) | — |
| Compliance | tracr_orders (11 — real Tracr revenue exists!) | — |
| **Safety (post-incident)** | email_suppression_list (79), email_send_log (0), email_consent_log (0) | — |
| Subscribers | newsletter_subscribers (2) | subscribers |
| BizLegal-product | — | pricing_plans, product_catalog (no pricing tables exist) |

### 2.2 Storage
- Hetzner `/opt/bizlegal/curator/`: 38+ agents + content pipeline + orchestrator
- Vercel: 8 Next.js apps
- Supabase Pro: 105 tables

## 3. Provider Surface

### 3.1 Live & Working (verified this session)
| Provider | Status | Proof |
|----------|--------|-------|
| NOWPayments | ✅ LIVE | HTTP 200 `{"message":"OK"}` — crypto invoices live |
| PayPal | ✅ LIVE | OAuth token_ok, expires_in=31925s — card checkout live |
| Resend | ✅ LIVE (CF-bypassed via UA fix) | HTTP 422 missing-to = good |
| Perplexity | ✅ LIVE | 53-char pplx key, real "ping" response |
| Anthropic (read-only) | ✅ Key valid | /v1/models 200; /v1/messages 400 (credit=$0) |
| Apify, Firecrawl, Telegram | ✅ LIVE | per sibling's audit |

### 3.2 Dead/Broken
| Provider | Status | Fix |
|----------|--------|-----|
| Anthropic credit | ❌ $0 | Top up at console.anthropic.com |
| Stripe | ❌ Placeholder | vault has sk_live_.../empty publishable/whsec_... (Israeli-blocked anyway) |
| BIZLEGAL_BANK_ACCOUNT_1, _2 | ❌ Empty (placeholders) | Real bank details needed |
| BIZLEGAL_NEWSLETTER_SECRET | ❌ Missing in Vercel | Any 32+ char string |
| RESEND_WEBHOOK_SECRET | ❌ Missing in Vercel | From Resend dashboard |

## 4. Revenue Paths (current)

| Path | State | Conversion |
|------|-------|-----------|
| Self-serve crypto (NOWPayments) | ✅ LIVE | 0 paying customers yet (no engagement exists) |
| Self-serve card (PayPal) | ✅ LIVE | 0 paying customers yet (no engagement exists) |
| Stripe card-native | ❌ Dead | Low priority (Israeli-blocked) |
| Tracr forensics orders | ✅ LIVE | 11 historical orders — the only real revenue source! |
| **Cold outreach → payment** | ⚠️ Back door still open | Spam machine + lead_nurture + oci_deal_closer all active |
| **Newsletter → reply → pay** | 🔒 Built, not active | opt_in_outreach is paused per incident rule; needs Moses |

## 5. Real State vs Claimed State

The sibling's report said "spam pipeline halted" and that was true for the 3
specific agents. But the LARGER spam machine (headhunter → cold_email →
lead_nurture → oci_deal_closer) is still firing daily. This system map
identifies the real blast radius.

**Action needed:** Comment out the back-door cron lines (1 line each) so
the only path to a payment link is opt-in → reply → engaged_monetization.
