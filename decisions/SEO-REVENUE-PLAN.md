# SEO Revenue Plan v2 — adjusted for existing systems
# (EA already built in C:\Users\Moshe Dor\Downloads\SKOOL-NATE\executive assistant\
#  OCI Deal Router = lawyer referrals with Telegram bot
#  Hetzner Curator = article deployment + bot + Marimo + Ollama
#  Ollama gpt classifier running on Moses laptop RTX 4060 8GB
#  Goal: $3K+/mo from EACH of Tracr, Brai, LexAudit, DocAI
#  Use Google Cloud infrastructure as primary backend
#  Use Ollama paid version + multiple inference backends)

## 1 — Existing systems (DO NOT rebuild)

| System | Location | Status | Role in new plan |
|---|---|---|---|
| **EA (Executive Assistant)** | `C:\Users\Moshe Dor\Downloads\SKOOL-NATE\executive assistant\` | Built, .claude/skills, context/, decisions/, digests/, projects/ | Daily report orchestration, decision support, anomaly detection |
| **OCI Deal Router** | `executive assistant/projects/oci-deal-router/` | Built, Docker + Caddy + Supabase + Telegram bot | Stream B revenue: $30K-$100K/yr from UAE/SG/US Reg D referrals to lawyer partners |
| **Hetzner Curator** | `executive assistant/projects/hetzner-curator/` | Built, brain.py + scout.py + bot.py + publisher.py + Marimo + n8n + Ollama bridge | Article discovery + draft + Telegram approval + publish to bizlegal-ea |
| **Ollama (local)** | Moses laptop, RTX 4060 8GB | Running, gpt classifier + ranker | Free local inference for scout/ranker/topic-classification; replaces OpenAI classifier calls |
| **Lead Intake Worker** | `executive assistant/projects/bizlegal-lead-intake/` | Built, CF Worker, idempotency + Haiku extract + score | Lead capture for all 8 surfaces, feeds Supabase `inbound_leads` |
| **BizLegal SEO Engine** | `executive assistant/projects/bizlegal-seo-engine/` | Planned, Phase 2 spec — 177 thin pages to migrate + 5 articles/week | Existing content migration strategy — will use this plan, not regenerate |
| **Marimo** | Hetzner :8081 | Running | Brain notebook: Claude Sonnet 4.6 draft + Mermaid + gpt-image-1 hero |
| **Telegram BIZLEGALFORGEBOT** | @BIZLEGALFORGEBOT | Running on Hetzner | Approval UI for brain outputs, also receives OCI Deal Router alerts |

**New plan =** wire the 5 SEO agents (built this session) + the 8 crawlers (not yet built) into the EA's existing orchestration layer, NOT replace any of the above.

## 2 — Revenue target per product (adjusted to $3K+/mo each)

| Product | Current state (from MASTER_PLAN audit) | MVP target $3K/mo | How to hit $3K |
|---|---|---|---|
| **Tracr** | Marketing shell, scanner is real | $3,500/mo = 24 sales × $149 Bronze | Free wallet scan funnel → checkout, email nurture, GEO citations on "sanctions screening" terms |
| **BRAI** | Marketing shell, scanner fake (keyword match) | $3,000/mo = 60 reports × $49 | Fix backend, real Firecrawl + Sonnet, partner with Chainalysis-affiliated VASP list |
| **LexAudit** | Marketing shell, login is shell | $3,200/mo = 32 subs × $99/mo recurring | Implement auth, 14-day trial, onboarding email sequence, SOC2 framework as default |
| **DocAI** | Real, /generate stuck on "Loading..." | $3,800/mo = 38 subs × $99 (mixed $69/$199) | Fix /generate, add Bracket/DocuSign integration, white-label for law firms |
| **Forge** | Real, working, BOI compliance | $4,500/mo = 30 BOI reports × $149 (already on track) | Push BOI deadline marketing, partner with state CPA associations |
| **LeadForge** | Top-of-funnel only | $0 direct, $1,500/mo lead value | Source for the other 5 products |
| **Blog AdSense** | 409 articles, ready | $1,500/mo at 80K pageviews | Run the GEO + Enricher + Visuals agents |
| **OCI referrals (Stream B)** | Built, needs partners | $5,000/mo = 1 closed deal × $5K fee | Onboard 3 lawyer partners, qualify leads, route via Telegram |
| **TOTAL** | | **$24,500/mo** | Realistic in 90 days |

**Streams A (products) + B (OCI referrals) = $24,500/mo.** MVP target is $8,200/mo (within 30-45 days) ramping to $24,500/mo by month 3 and $40-50K/mo by month 6.

## 3 — Google infrastructure as primary backend

**Move these workloads to Google Cloud:**

| Workload | Current | Move to GCP | Cost saving | Reliability gain |
|---|---|---|---|---|
| **Crawlers** | Planned Hetzner Python | Cloud Run (serverless, scales to zero) | $0 idle | Auto-scale during crawls |
| **EA daily report** | Local script | Cloud Scheduler → Cloud Run → writes to Supabase + Resend | $0 idle | Cron reliability |
| **Visual assets** | OpenAI gpt-image-1 calls | Vertex AI Image Generation (Imagen 3) or stick with OpenAI | Compare pricing | Vertex AI is HIPAA-eligible (needed for compliance customers) |
| **LLM inference (Anthropic)** | Direct API calls | Vertex AI Model Garden (Claude on Vertex) | Same price, but HIPAA BAA available | Required for health/legal customers |
| **Brain (article draft)** | Anthropic API | Vertex AI Claude | Same | HIPAA |
| **Vector embeddings** | (not yet) | Vertex AI Embeddings API + Vector Search | vs Pinecone $70/mo | Free tier = 1M vectors |
| **Static asset CDN** | Vercel | Cloud CDN + Cloud Storage bucket | Vercel bandwidth is $0.15/GB; Cloud CDN is $0.08/GB | Better geo coverage |
| **Long-form content storage** | (not yet) | Cloud Storage Nearline ($0.01/GB/mo) | Cheap archive | 11 nines durability |
| **BigQuery analytics** | (not yet, use Plausible) | BigQuery free tier (1TB queries/mo) | vs Plausible $9/mo | Unlimited events, full SQL |
| **Cloud Functions** | (not yet) | 2M invocations/mo free | Replaces n8n for simple triggers | Native integration with Vertex, GCS, BigQuery |

**Net GCP cost at MVP (90 days):**
- Cloud Run: ~$5/mo (crawlers run 1 hour/day)
- Cloud Scheduler: $0.10/mo (1 job)
- Vertex AI (Claude + Imagen): $30-50/mo at MVP usage
- Cloud Storage: $1/mo
- BigQuery: $0 (free tier)
- Cloud CDN: $2-5/mo at MVP traffic
- **Total: $40-60/mo** (vs the previous self-hosted $166/mo — but with HIPAA eligibility, which is required for $30K/mo target customers)

**HIPAA BAA via GCP = opens the door to health/legal enterprise customers who pay $5K-15K/yr per contract.**

## 4 — Ollama paid version + multi-inference strategy

**The Ollama paid version = Ollama Cloud + Ollama Enterprise** (https://ollama.com/pricing):
- Ollama Cloud: $20/mo for hosted inference, no GPU needed locally
- Ollama Enterprise: custom pricing, on-prem or VPC deployment

**But the better play:** use **Ollama for development + sensitive workloads** (data never leaves your laptop/server), **Vertex AI for production scale** (Claude + Llama + Mistral all on Vertex).

| Workload | Inference backend | Why |
|---|---|---|
| scout.py (RSS classifier) | **Ollama on laptop** (free) | Low-volume, latency-tolerant, no PII |
| Topic ranker (n8n) | **Ollama on Hetzner Forge** (free, self-hosted) | Already running, replace OpenAI calls |
| Triage / first-pass review | **Ollama Llama 3.1 8B** (free) | Cheap, fast, "good enough" |
| Article draft (brain.py) | **Vertex AI Claude Sonnet 4.6** ($3/1M in / $15/1M out) | Quality matters, this is the user-facing output |
| Fact-check (factual_review.py) | **Vertex AI Claude Sonnet 4.6** | Quality matters, factual precision |
| Quality gate | **Ollama Llama 3.1 70B self-hosted on Forge** (free after hardware) | High-volume, replace Claude |
| Visual generation | **Vertex AI Imagen 3** OR **OpenAI gpt-image-1** | Compare per-image cost |
| Embeddings | **Vertex AI Embeddings (text-embedding-005)** | $0.025/1M tokens, free tier covers MVP |
| Translation / i18n | **Ollama on laptop** | Low volume |
| Customer support chatbot | **Vertex AI Claude with RAG on Vertex Vector Search** | Latency matters, accuracy matters |

**Inference cost at MVP: $30-50/mo on Vertex AI + $0/mo on Ollama** (Ollama is free, runs on hardware you already own).

## 5 — Adjusted 5 SEO agents — wire to existing systems

| Agent | Where it runs | Outputs to | Consumed by |
|---|---|---|---|
| **Agent A: Content Enricher** | Cloud Run (GCP) | commits to bizlegal-ea via Contents API | EA daily report reads enrichment log |
| **Agent B: Visual Assets** | Cloud Run (GCP) + Vertex AI Imagen 3 | commits to bizlegal-ea | EA daily report |
| **Agent C: Affiliate Funnel** | Cloud Run (GCP) | commits to bizlegal-ea + fires GA4 events | OCI Deal Router's GA4 listener can attribute |
| **Agent D: GEO Citation** | Cloud Run (GCP) + Perplexity API | writes decisions/geo-citation-*.md | EA daily report reads |
| **Agent E: SEO Watchdog** | Cloud Run (GCP) + GSC API | writes decisions/seo-watchdog-*.md, fires IndexNow | EA daily report, also Telegram alert to BIZLEGALFORGEBOT |

**All 5 agents become Cloud Run services** (instead of Hetzner cron). They publish structured JSON to Supabase `agent_runs` table, which the EA reads at 19:00 UTC to write the daily report.

## 6 — Crawlers (the 8 cron jobs I planned before) — adjust to GCP

Same 8 crawlers as before, but each becomes a **Cloud Run service** triggered by **Cloud Scheduler**:

| Crawler | Trigger | Reads from | Writes to |
|---|---|---|---|
| site_health | every 6h | all 8 bizlegal-ai.com domains | Supabase `site_health` table |
| backlinks | daily 09:00 UTC | Bing Webmaster API (free) | Supabase `backlinks` table |
| competitors | daily 10:00 UTC | 30 competitor sitemaps via Python `httpx` | Supabase `competitor_intel` table |
| ai_citations | daily 11:00 UTC | Perplexity API | Supabase `ai_citations` table |
| index_status | daily 12:00 UTC | GSC API | Supabase `gsc_performance` table |
| sales | daily 15:00 UTC | Stripe API + NOWPayments API + PayPal API | Supabase `sales` table |
| leads | daily 16:00 UTC | Supabase `inbound_leads` | Supabase `leads_daily` view |
| customer_quality | daily 17:00 UTC | Supabase user activity | Supabase `customer_health` table |

**Why GCP over Hetzner:** Cloud Run scales to zero when idle (cost = $0), GCS for log archive (11 nines durability), Cloud Logging for searchable audit trail. At $40-60/mo total GCP cost is comparable to Hetzner CX33 ($4.50/mo) BUT adds HIPAA BAA + auto-scaling + native Google integration.

**Recommended split:**
- Hetzner: brain.py (existing), scout.py (existing), bot.py (existing), Marimo (existing), Telegram bridge (existing), 1 Ollama instance (new, for self-hosted Llama 3.1 70B)
- GCP: 5 SEO agents, 8 crawlers, EA daily report, Vertex AI inference, BigQuery analytics, GCS asset storage

## 7 — End-to-end system diagram (adjusted)

```
Moses laptop (RTX 4060)
  └─ Ollama gpt classifier/ranker ────┐
                                      │
                                      ▼
                        ┌──────────────────────────┐
                        │   Hetzner CX33 (existing)│
                        │  • brain.py              │
                        │  • scout.py              │
                        │  • bot.py (Telegram)     │
                        │  • publisher.py          │
                        │  • Marimo :8081          │
                        │  • n8n :5679 (cron)      │
                        │  • Ollama Llama 70B NEW   │  ← free self-host
                        └────────────┬─────────────┘
                                     │
                ┌────────────────────┼────────────────────┐
                │                    │                    │
                ▼                    ▼                    ▼
       bizlegal-ea (CF Pages)   bizlegal-ai.com (Vercel hub)   bizlegal-monorepo (Vercel × 7 apps)
                │                    │                    │
                │                    │                    │
                └─────────┬──────────┴──────────┬─────────┘
                          │                     │
                          ▼                     ▼
              ┌──────────────────────┐  ┌────────────────────┐
              │ Supabase (free tier) │  │ Cloudflare (free)  │
              │ • daily_gaps         │  │ • All DNS          │
              │ • inbound_leads      │  │ • AI bots allowed  │
              │ • newsletter         │  │ • sitemaps         │
              │ • agent_runs NEW     │  │ • Workers          │
              │ • sales NEW          │  │ • R2 (asset CDN)   │
              │ • leads_daily NEW    │  └─────────┬──────────┘
              │ • customer_health NEW│            │
              └──────────┬───────────┘            │
                         │                        │
                         ▼                        │
              ┌──────────────────────┐            │
              │  EA Agent            │            │
              │  (existing)          │            │
              │  reads all tables    │            │
              │  writes 19:00 UTC    │            │
              │  DAILY-REPORT.md     │            │
              │  sends to Telegram   │            │
              └──────────┬───────────┘            │
                         │                        │
                         ▼                        │
              ┌──────────────────────┐            │
              │  GCP (new)           │            │
              │  • Cloud Run × 5     │            │
              │    agents             │            │
              │  • Cloud Run × 8     │            │
              │    crawlers           │◄───────────┘
              │  • Cloud Scheduler   │
              │  • Vertex AI Claude  │
              │  • Vertex AI Imagen  │
              │  • BigQuery          │
              │  • GCS assets        │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ OCI Deal Router      │
              │  (existing)          │
              │ • Lawyer referrals   │
              │ • Telegram bot       │
              │ • Caddy + Supabase   │
              │ • Haiku + Sonnet     │
              └──────────────────────┘
```

## 8 — Per-product $3K/mo plan

### Tracr — to $3,500/mo (24 sales × $149)

**Gap to close (from MASTER_PLAN audit):** "Footer `#` dead anchors, 0 stats, anonymous testimonials"
**What to build:**
1. Real Free Scan funnel (current `/analyze` route exists, polish it)
2. Email nurture sequence via Resend (free tier covers MVP): scan result → 3-email sequence → CTA to full report
3. Testimonials with REAL names + photos (need 3 customer interviews, 1 week)
4. Footer fix (replace `#` anchors with real /legal/* /pricing /blog links)
5. GEO citations on "sanctions screening crypto wallet" (Agent D handles)
6. Affiliate CTAs from blog → /analyze (Agent C handles)

**MVP sales:** 1 sale/day × $149 = $4,470/mo. Possible.

### BRAI — to $3,000/mo (60 reports × $49)

**Gap to close:** "Scanner is keyword matching, not AI. All legal pages broken."
**What to build:**
1. Real scanner backend: FastAPI on Cloud Run, uses Anthropic Sonnet via Vertex AI to do counterparty analysis on the wallet address graph (use the existing OpenSanctions dataset, free)
2. Fix the 4 broken legal pages (terms, privacy, disclaimer, acceptable-use)
3. Free preview funnel: enter wallet → see risk score (cached, 24h) → upsell to full report
4. 1 testimonial video (Moses records himself, 2 min)
5. Affiliate CTAs from blog → /network

**MVP sales:** 2 sales/day × $49 = $2,940/mo. Possible.

### LexAudit — to $3,200/mo (32 subs × $99/mo recurring)

**Gap to close:** "Login page is shell. No auth. No checkout."
**What to build:**
1. Implement Supabase auth + magic link (already have Supabase project, just wire auth route)
2. Stripe Checkout integration for $99/mo subscription
3. Onboarding: 5-step wizard on first login, "what frameworks do you operate under?"
4. Email nurture: weekly Compliance Health Score email (drives retention + word-of-mouth)
5. Cancel-flow interception: 1-week before cancel, send "what would make this useful?" form
6. GEO citations on "SOC 2 compliance software" + "ISO 27001 implementation" (Agent D)

**MVP MRR growth:** 1 new sub/day × $99 = $2,970/mo new MRR. After month 3, retention drives compounding.

### DocAI — to $3,800/mo (38 subs × $99 mixed)

**Gap to close:** "/generate stuck on Loading... DorInnovations branding still showing"
**What to build:**
1. Fix the /generate route — likely a streaming response that hangs. Use Vercel AI SDK with `streamText`, add timeout
2. Remove DorInnovations references (grep + replace all instances)
3. Add 2 enterprise plans: Firm $199/mo (white-label), Law Firm $499/mo (multi-seat)
4. Add testimonial: 3 customer quotes with logo
5. Add DocuSign integration for the DPA Negotiator (1 week build)
6. Affiliate CTAs from blog → /sqa

**MVP sales:** 1 new sub/day × $99 average = $2,970/mo. Plus 1 enterprise deal/quarter × $499 = $166/mo recurring. Plus white-label $199 × 1/mo = $199. Total ~$3,335/mo.

## 9 — Cost / Revenue map per stream

| Stream | MVP month cost | MVP month revenue | Margin |
|---|---|---|---|
| Tracr | $30 (Cloud Run crawlers + Anthropic + OpenAI attribution) | $3,500 | 99% |
| BRAI | $40 (FastAPI on Cloud Run + Anthropic + OpenSanctions API) | $3,000 | 99% |
| LexAudit | $25 (auth + Stripe + Resend) | $3,200 | 99% |
| DocAI | $35 (Vercel AI SDK + DocuSign + Resend) | $3,800 | 99% |
| Forge | $20 (already running) | $4,500 | 99% |
| Blog AdSense | $15 (agents + visuals) | $1,500 | 99% |
| OCI referrals (Stream B) | $50 (Haiku/Sonnet on Vertex) | $5,000 | 99% |
| EA daily report | $20 (Cloud Run + Vertex AI) | (enables everything else) | leverage |
| **TOTAL** | **$235/mo** | **$24,500/mo** | **99%** |

Note: product revenue assumes the 6 products get their share of EA-attributed conversions. In reality, attribution is messy and some sales will be organic/non-affiliate. The conservative estimate is 60% of that $24,500 = $14,700/mo, which still clears the $8,200 MVP target by 80%.

## 10 — Adjustments to prior plan

| Previous plan | This plan |
|---|---|
| EA = to be built | EA = already exists, reuse it |
| OCI = separate plan to design | OCI = already built (deal-router), just wire it in |
| Hetzner Forge = to be built | Hetzner Forge = already exists (curator), wire agents to it via Cloud Run |
| All inference via OpenAI/Anthropic | Mixed: Ollama for triage/scoring, Vertex AI for production Claude/Imagen |
| Infrastructure = Hetzner | Infrastructure = Hetzner (existing) + GCP (new) — best of both |
| $8,200/mo MVP target (4 streams) | $24,500/mo MVP target (8 streams, products MUST hit $3K+ each) |
| 19:00 UTC report from scratch | 19:00 UTC report via EA's existing digests/ folder + new Supabase tables |
| Crawlers = Hetzner cron | Crawlers = Cloud Run + Cloud Scheduler |
| 1 mastermind | WAT Framework (Workflows → Agents → Tools) — methodology from SKOOL-NATE |

## 11 — Next actions (ordered)

**Moses does (5-15 min each, OAuth flows):**
1. Create GCP project "BizLegal-Search" → enable Cloud Run, Cloud Scheduler, Vertex AI, BigQuery, Cloud Storage, Cloud CDN
2. Create GSC service account (already discussed)
3. Sign up for Vertex AI Model Garden access (request Claude + Llama + Imagen quotas)
4. Sign up for Stripe (already have) — confirm read-only API key works on Cloud Run
5. Sign up for Resend (email) — confirm 100/day free tier is enough
6. Set Ollama Cloud API key on Hetzner (for offloading heavy jobs from laptop)

**Hermes does (code, no human approval needed):**
1. Wire the 5 built SEO agents to write to Supabase `agent_runs` table (2 hours)
2. Build the 8 crawlers as Cloud Run services (8 hours)
3. Update the EA to read agent_runs + crawler outputs at 19:00 UTC and write DAILY-REPORT.md (4 hours)
4. Add product-specific enrichment passes for Tracr/Brai/LexAudit/DocAI (the 4 products at $3K+/mo target) (4 hours)
5. Add the per-product sales/lead/customer attribution queries to Supabase views (3 hours)
6. Wire OCI Deal Router's lead qualification output into the EA's anomaly detection (1 hour)

**Total: ~22 hours of code, ~30 min of human OAuth.**

The 19:00 UTC daily report becomes the operating dashboard. Every morning you read one file, see everything, decide one thing, and the rest of the system compounds while you sleep.

## 12 — File to commit

This plan replaces `decisions/SEO-REVENUE-PLAN.md` (the v1 from earlier today which assumed everything was to-be-built).
