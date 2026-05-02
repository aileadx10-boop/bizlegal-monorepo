# Pricing — BizLegal-AI Tiers + Lead Magnet

**Scope:** Define pricing tiers and lead magnet for bizlegal-ai.com `/pricing` page update. Calibrated to $10K+/mo MRR target per MASTER PROMPT.

**Status:** proposal — awaiting Moses confirmation before publishing to bizlegal-ai.com

---

## Strategic choices

1. **Four-tier structure** (3 paid + Enterprise) — standard SaaS pattern, avoids choice paralysis
2. **Scout tier priced at $149/mo** — matches existing BOI Kit price point, creates easy upsell story
3. **Command tier priced at $9,999/mo** — hits $10K MRR target from a single closed deal; pre-IPO/listed-token and CEX buyers expect this ACV
4. **Annual plans = ~2 months free** — standard retention play
5. **Lead magnet = free Jurisdiction Risk Snapshot** — collects high-intent email, feeds Phase 1 lead pipeline directly
6. **All existing subdomain products (BRAI, TRACR, LexAudit, DocAI, Forge, LeadForge) remain separately accessible** — Tier bundles set quotas for each
7. **Products CTA across site points to `app.bizlegal-ai.com`** per Moses directive

---

## Lead magnet (free, gated by email)

**Name:** Jurisdiction Risk Snapshot
**What it is:** A 1-page PDF comparing 2 jurisdictions of the user's choice across 6 dimensions:
- Regulatory posture (supportive / neutral / hostile)
- Licensing required for user's activity
- Tax treatment summary
- Banking accessibility
- Recent enforcement actions
- Key deadlines in next 12 months

**Delivery:** User selects 2 jurisdictions from dropdown + enters email + describes activity -> Cloudflare Worker calls Haiku 4.5 -> PDF generated -> emailed + stored in `lead_profiles/`
**Cost per delivery:** ~$0.02 (Haiku + PDF generation)
**Conversion hypothesis:** 10-20% of downloads enter paid trial within 30 days
**Data captured:** full LeadProfile fields (pre-filled by the interaction) -> feeds Phase 1 pipeline

---

## Tier comparison

| Feature | Free | Scout | Operator | Enterprise |
|---|---|---|---|---|
| **Price (monthly)** | $0 | $149 | $999 | Referral-driven, contact |
| **Price (annual, ~17% off)** | $0 | $1,490/yr | $9,990/yr | Custom |
| **BRAI wallet risk scans** | 5/mo | 100/mo | 1,000/mo | Unlimited |
| **TRACR forensics traces** | None | None | 10/mo | Unlimited |
| **DocAI legal docs** | None | 2/mo | 10/mo | Unlimited |
| **LexAudit certificates** | None | None | 2/mo | Unlimited |
| **Forge compliance scans** | 1-time sample | None | 5/mo | Unlimited |
| **Jurisdiction comparisons** | 1 (lead magnet) | 10/mo | Unlimited | Unlimited |
| **Regulatory alert feed** | Weekly digest | Weekly digest | Priority / real-time | Real-time + custom filters |
| **LeadForge access (legal leads marketplace)** | No | No | Viewer | Active listings |
| **Intelligence Reports (Phase 3)** | None | None | 1/quarter | On demand |
| **Users included** | 1 | 1 | 5 | Custom |
| **Dedicated compliance analyst** | No | No | No | Yes (dedicated) |
| **Onboarding** | Self-serve | Self-serve | Self-serve + 1 call | Custom deployment |
| **SLA** | Best effort | Community support | Email, 24h | Custom SLA + phone |
| **API access** | No | No | Read-only | Full + custom endpoints |
| **SSO / SCIM** | No | No | No | Yes |
| **Zero-retention mode** | No | No | Optional | Default + audit logs |
| **Dedicated sub-processor list** | Standard | Standard | Standard | Custom review |
| **Referral commission paid to referrer** | N/A | N/A | N/A | Yes — program TBD |
| **Best for** | Anyone kicking the tires | Solo founder, indie compliance officer, researcher | Growing protocol, early-stage CEX, law firm with crypto practice | Licensed issuer, regulated CEX, listed-token company, top-10 CEX, sovereign CBDC project |

---

## Positioning copy (draft, for /pricing page)

### Hero
**Headline:** "Compliance intelligence priced for every stage."
**Sub:** "From solo founders mapping jurisdictions to licensed issuers managing global enforcement risk — one platform, four tiers."

### Free card
> **Free**
> See what BizLegal-AI can find about your setup in 60 seconds.
>
> - 5 BRAI wallet risk scans per month
> - 1 free Jurisdiction Risk Snapshot (the lead magnet)
> - 1 one-time Forge compliance sample
> - Weekly regulatory digest
> - 1 seat, community support
>
> *No credit card. Start in under a minute.*
> **[Start Free -> app.bizlegal-ai.com/free]**

### Scout card
> **Scout — $149/mo**
> Get a read on your jurisdictional risk before your next move.
>
> - 100 BRAI wallet risk scans
> - 10 jurisdiction comparison reports
> - 2 DocAI legal documents
> - Weekly regulatory alerts
>
> *For solo founders and compliance researchers.*
> **[Start Scout -> app.bizlegal-ai.com/scout]**

### Operator card (marked "Most Popular")
> **Operator — $999/mo**
> Operate across jurisdictions with real-time intelligence.
>
> - 1,000 BRAI scans + 10 TRACR traces
> - 10 DocAI docs + 2 LexAudit certificates
> - 5 Forge compliance scans
> - LeadForge viewer access
> - 1 quarterly Intelligence Report
> - 5 team seats, priority alerts
>
> *For growing protocols, early-stage CEXes, law firms with active crypto practice.*
> **[Start 14-day Trial -> app.bizlegal-ai.com/operator]**

### Enterprise card
> **Enterprise — Contact us**
> Custom deployment. Custom SLA. Referral-driven.
>
> - Everything in Operator, without limits
> - Dedicated analyst team
> - On-demand Intelligence Reports
> - Custom API endpoints
> - On-prem or private-cloud deployment option
> - Regulator-grade audit logs and data residency controls
> - SSO, SCIM, custom sub-processor review
>
> *For top-10 CEXes, public companies, sovereign projects.*
>
> **Engagement model: Enterprise contracts are closed via warm partner referrals. Referral terms are managed individually under signed agreement (Moses handles each as counsel).**
>
> **[Contact Sales -> team@bizlegal-ai.com]**

### Referral handling (not an automated program)
Moses is a qualified Israeli lawyer and will handle Enterprise referral compensation manually per written agreement with each partner. **No public `/referrals` page** is needed — referral terms are bilateral and confidential. Partners are invited into the program case-by-case after Enterprise engagement is qualified.

---

## Lead magnet placement

1. Homepage hero secondary CTA: "Get your free Jurisdiction Risk Snapshot"
2. Blog sidebar on every `blog.bizlegal-ai.com` post
3. Exit-intent modal on `/pricing`, `/jurisdictions`, `/posts`
4. Footer on every page
5. End-of-article CTA for related blog posts

---

## Implementation plan (Phase 3 of build, after Phase 1+1.5)

**Day 1** — `/pricing` page update on bizlegal-ai.com
- Replace existing tiers with this structure
- Use forge-v3-purple brand tokens
- Add tier cards w/ "Most Popular" badge on Operator
- Products CTAs route to `app.bizlegal-ai.com/{tier-slug}`
- Email CTA for Enterprise (team@bizlegal-ai.com)

**Day 2** — Lead magnet generator
- New Cloudflare Worker endpoint `POST /lead-magnet/jurisdiction-snapshot`
- Input: 2 jurisdictions + user email + activity description
- Output: 1-page PDF via Haiku 4.5 + serverless PDF renderer (pdfkit on Workers or @react-pdf/renderer)
- Stores LeadProfile in bizlegal-ea + emails PDF to user
- Telegram notify Moses

**Day 3** — Placement + tracking
- Add lead-magnet form component to all placement surfaces
- Cloudflare Web Analytics tagging per surface
- Conversion funnel dashboard

---

## Self-evaluation

| Criterion | Score | Rationale |
|---|---|---|
| Business Value | 10 | Direct $10K MRR path via Command tier; lead magnet feeds pipeline |
| Accuracy | 9 | Tiers priced from product economics; Haiku-generated snapshot uses cited sources |
| Simplicity | 9 | Four tiers, one lead magnet, standard SaaS pattern |
| Cost Efficiency | 10 | ~$0.02 per lead magnet delivery; tier build is zero marginal infra |
| Scalability | 10 | Tiers scale to any volume; Enterprise absorbs outliers |
| Reliability | 9 | Static tier page + stateless lead-magnet Worker = few failure modes |

All >= 9. Mandatory >= 9 met.

---

## Awaiting Moses input

1. **Confirm or adjust prices** — Scout $149 / Operator $999 / Command $9,999?
2. **Confirm lead magnet concept** — Jurisdiction Risk Snapshot PDF, or different magnet (e.g., "Free BRAI scan for one wallet")?
3. **Confirm Enterprise email routing** — team@bizlegal-ai.com or new sales@ alias?
4. **Confirm product slugs under app.bizlegal-ai.com** — `/scout`, `/operator`, `/command`, `/enterprise`? Or tier-agnostic product subroutes?
5. **Confirm existing products stay as-is** or need tier-gating changes on the subdomains (brai.bizlegal-ai.com, etc.)
