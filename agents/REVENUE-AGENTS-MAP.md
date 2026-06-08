# BizLegal AI — Revenue Agent Map
**Last updated:** 2026-06-09  
**Goal:** $10K-$30K MRR within 6 months  
**Products:** DocAI SQA ($29/$69/$99/mo) · Conductor ($99/$250/$999/mo) · Forge BOI ($149 one-time) · Tracr ($299) · Brai ($199) · LexAudit ($99-$599/mo) · OCI Referrals (success fee)

---

## Revenue Circles (End-to-End Paths)

```
CIRCLE 1 — DocAI SQA Subscription ($29-$99/mo)
─────────────────────────────────────────────
crawler-agent (find B2B SaaS leads)
  → contact-agent (enrich + score)
    → cold-email-agent (3-touch outreach)
      → sqa-demo-agent (live demo on reply)
        → docai.bizlegal-ai.com/pricing (checkout)
          → hub /api/pay/start (PayPal or crypto)
            → payment.confirmed event
              → thank-you-agent (welcome sequence)
                → revenue-ops (track MRR)

CIRCLE 2 — Reddit/Content Organic ($29-$99/mo)
─────────────────────────────────────────────
writer-agent (Reddit/LinkedIn post)
  → organic traffic → /sqa free trial
    → free → paid upgrade (in-app CTA)
      → hub /checkout → thank-you-agent → revenue-ops

CIRCLE 3 — OCI Referral Network ($500-2000 placement fee)
─────────────────────────────────────────────
crawler-agent (find real estate attorneys)
  → cold-email-agent (partner outreach)
    → partner-ops (onboard + set upfront fee)
      → OCI router routes lead to partner
        → invoice-agent (send placement invoice)
          → thank-you-agent → revenue-ops

CIRCLE 4 — Forge One-Time ($97-$297)
─────────────────────────────────────────────
writer-agent (BOI Tracker blog post / Reddit)
  → forge.bizlegal-ai.com → direct checkout
    → thank-you-agent (delivery + monitor upsell)
      → LexAudit upsell → revenue-ops

CIRCLE 5 — Enterprise / AI Conductor ($250-$999/mo)
─────────────────────────────────────────────
pitch-ops (LinkedIn DM / cold email to compliance teams)
  → sqa-demo-agent (full conductor demo)
    → Stripe Atlas checkout (when live)
      → thank-you-agent (onboarding sequence)
        → invoice-agent (if wire payment)
          → revenue-ops
```

---

## Agent Registry

### EA Agents (in `agents/ea/`)
| Agent | File | Revenue Path | Schedule |
|-------|------|-------------|----------|
| Post Generator | prompts/post-generate.md | Circles 1-5 content | On-demand |
| Post Enricher | prompts/post-enrich.md | SEO/blog content quality | On-demand |
| Lead Extract | prompts/lead-extract.md | Circles 1,3 | On CF Worker trigger |
| Lead Critique | prompts/lead-critique.md | Quality gate for outreach | On CF Worker trigger |
| Lead Score | prompts/lead-score.md | Prioritize outreach targets | On CF Worker trigger |
| Lead Summary | prompts/lead-summary.md | Moses daily digest | Daily |
| OCI Contract | prompts/oci-referral-contract.md | Circle 3 partner onboarding | On partner reply |
| Welcome Email | prompts/email-welcome-generic.md | All circles post-purchase | On payment.confirmed |

### Ops Agents (in `agents/ops/`)
| Agent | File | Revenue Path | Schedule |
|-------|------|-------------|----------|
| morning-ops | morning-ops.md | All — daily health check | Daily 08:55 UTC |
| revenue-ops | revenue-ops.md | All — payment monitoring | Every 15min |
| health-ops | health-ops.md | All — fleet uptime | Every 60min |
| pitch-ops | pitch-ops.md | Circles 1,5 — cold Gmail | Daily 11:00 UTC |
| content-ops | content-ops.md | Circle 2 — blog publish | Daily 09:30 UTC |
| partner-ops | partner-ops.md | Circle 3 — OCI affiliate | Wed 10:00 UTC |
| mrr-review | mrr-review.md | All — MRR tracking | Mon 09:00 UTC |
| friday-retro | friday-retro.md | All — weekly stats | Fri 17:00 UTC |
| monthly-scorecard | monthly-scorecard.md | All — scorecard | 1st 10:00 UTC |
| **writer-agent** | writer-agent.md | Circles 1-5 — content | Daily 08:00 UTC |
| **crawler-agent** | crawler-agent.md | Circles 1,3 — lead research | Daily 07:00 UTC |
| **contact-agent** | contact-agent.md | Circles 1,3 — enrichment | On-demand |
| **invoice-agent** | invoice-agent.md | Circles 3,4 — billing | Daily 09:00 UTC |
| **thank-you-agent** | thank-you-agent.md | All — post-purchase | On payment.confirmed |
| **cold-email-agent** | cold-email-agent.md | Circles 1,5 — outbound | Daily 11:00 UTC |
| **sqa-demo-agent** | sqa-demo-agent.md | Circles 1,5 — demo | On prospect reply |
| **stripe-atlas-agent** | stripe-atlas-agent.md | All — Stripe setup | One-time |

### Socials Agents (in `agents/socials/skills/`)
| Skill | Purpose | Revenue Path |
|-------|---------|-------------|
| buffer-publisher | Schedule posts to LinkedIn/X/Facebook | Circle 2 |
| carousel-brief-generator | LinkedIn carousel from blog post | Circle 2 |
| content-series-planner | 30-day content calendar | Circle 2 |
| cross-channel-repurpose | Blog → Reddit/LinkedIn/X | Circle 2 |
| newsletter-adapter | Weekly digest to Resend subscribers | Circles 1-5 |
| shortform-hook-generator | Viral hooks for social posts | Circle 2 |
| thread-adapter | Blog post → X thread | Circle 2 |

### System Agents (in `~/.claude/agents/` — key revenue-relevant)
| Agent | When to Use |
|-------|-------------|
| payment-integration | Wiring Stripe after Atlas |
| fintech-engineer | Payment/compliance code |
| content-marketer | Marketing strategy |
| seo-specialist | SEO audit and optimization |
| data-researcher | Lead research deep-dives |
| customer-success-manager | Churn prevention |
| competitor-analyst | Competitor monitoring |
| legal-advisor | Contract templates |
| market-researcher | TAM analysis |

---

## Ollama Model Stack (Hetzner)

| Model | Use Case | Status |
|-------|---------|--------|
| `gemma4:12b` | Scout classify + SEO scoring (PREFERRED) | **PULL NEEDED** |
| `gemma3:12b` | Fallback if gemma4 unavailable | Pull needed |
| `mistral-nemo` | Minimum viable (installed) | ✅ Installed |
| `llama3.2:3b` | Fast/cheap drafts | ✅ Installed |

**To upgrade Hetzner Ollama:**
```bash
ssh root@204.168.209.235
ollama pull gemma4:12b       # ~8GB download
# Edit curator .env: SCOUT_OLLAMA_MODEL=gemma4:12b
# Restart: systemctl restart curator-bot
```

---

## Stripe Atlas Checklist (Moses)
- [ ] Apply at https://stripe.com/atlas ($500)
- [ ] Select: Delaware LLC
- [ ] Use business description from `agents/ops/stripe-atlas-agent.md`
- [ ] Wait 5-7 business days for EIN + Stripe account
- [ ] Send me the new Stripe keys → I wire into /api/pay/start

---

## Revenue Blockers (Priority Order)

| # | Blocker | Who | Action | Revenue Impact |
|---|---------|-----|--------|---------------|
| 1 | Zero payments confirmed | Moses | Do one $29 test crypto payment | Proves entire loop |
| 2 | OPS token drift | Moses | Vercel hub env → sync OPS_DASHBOARD_TOKEN | Visibility |
| 3 | Hetzner INBOUND_SECRET drift | Moses | SSH → fix curator .env | Blog events + ops |
| 4 | No Stripe (recurring broken) | Moses | Apply Stripe Atlas | Card subscriptions |
| 5 | scout_ollama.py old model | Code | Deploy `git pull` on Hetzner | Gap page pipeline |
| 6 | OCI 0 real partners | Code+Moses | cold-email-agent → 5 partner emails | Referral revenue |
| 7 | No cold outreach sent | Moses | Send Template R1 to r/SaaS TODAY | Week-1 revenue |

---

## 6-Month MRR Roadmap

| Month | Target | Key Actions |
|-------|--------|------------|
| 1 | $500 MRR | Fix blockers 1-3. Post to Reddit. 10 cold emails/day. First 5-7 DocAI trials |
| 2 | $2,000 MRR | 28 subscribers. Stripe Atlas live. Content publishing daily. 5 OCI partner emails |
| 3 | $5,000 MRR | 50 subscribers. Stripe subscriptions replacing PayPal. OCI first referral close |
| 4 | $10,000 MRR | 90 subscribers. YouTube/newsletter flywheel. 2-3 OCI placements |
| 5 | $18,000 MRR | 160 subscribers. LexAudit enterprise pitch. Conductor $999/mo first customer |
| 6 | $30,000 MRR | 210 subscribers. OCI 5 real partners. Monthly recurring referral fees |
