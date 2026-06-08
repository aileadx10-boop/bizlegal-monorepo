# BizLegal AI — Marketing & Publishing Plan (June 2026 → Dec 2026)
**Goal:** $10K-$30K MRR by Dec 2026  
**Owner:** Moses (human execution) + Agent fleet (automated)

---

## Weekly Cadence (Agent-Driven)

| Day | Time UTC | Agent | Action | Channel |
|-----|----------|-------|--------|---------|
| Mon | 07:00 | crawler-agent | Discover 20 new B2B SaaS leads | Apollo/LinkedIn |
| Mon | 08:00 | writer-agent | Write SEO blog post | blog.bizlegal-ai.com |
| Mon | 09:00 | content-ops | Publish + syndicate blog post | Blog + Reddit |
| Mon | 11:00 | cold-email-agent | Send T1 batch (5 emails) | Gmail |
| Tue | 08:00 | writer-agent | LinkedIn post from Monday blog | LinkedIn |
| Tue | 11:00 | pitch-ops | Research + DM 3 prospects | Gmail |
| Wed | 10:00 | partner-ops | OCI partner reconciliation | Email |
| Wed | 11:00 | cold-email-agent | Send T2 follow-ups | Gmail |
| Thu | 08:00 | writer-agent | Reddit post (r/SaaS or r/legaltech) | Reddit |
| Thu | 14:00 | Moses | Post Reddit manually (copy from writer) | Reddit |
| Fri | 11:00 | cold-email-agent | Send T3 breakup + new T1 batch | Gmail |
| Fri | 17:00 | friday-retro | Weekly stats report | Telegram |
| Daily | 09:30 | content-ops | Blog publish (1/day from curator) | Blog |
| Every 15min | - | revenue-ops | Payment monitor | Telegram |

---

## Content Themes by Product

### DocAI SQA (Primary revenue driver)
- "How I auto-fill SOC 2 questionnaires in 60 seconds" (r/SaaS)
- "CAIQ vs SIG-Lite: what B2B SaaS sales engineers need to know" (r/legaltech)
- "Vendor security questionnaires are killing enterprise deals" (HN)
- "We automated 80% of our customer SOC 2 responses" (LinkedIn)

### Conductor AI Platform ($99-$999/mo)
- "AI-native compliance ops for B2B SaaS" (LinkedIn carousel)
- "Why compliance teams at 50-person SaaS companies need AI tooling" (blog)
- "Reviewing 20 contracts in 20 minutes with AI" (r/Entrepreneur)

### Forge BOI Kit ($149 one-time) — QUICK WIN
- "CTA-2024 BOI deadline guide for founders" (r/Entrepreneur, r/smallbusiness)
- "BOI filing mistakes that get you fined $500/day" (blog)
- URGENCY: FinCEN enforcement is ongoing

### OCI Referral Network
- LinkedIn: "Cross-border real estate: why deals fail at the legal layer" (attorneys)
- Cold email to real estate law firms: "Qualified international buyer referrals"

---

## Channel Priority Stack

### Tier 1 — Highest ROI (Do first)
1. **Cold email to Sales Engineers** (cold-email-agent) — most direct path to paying customers
2. **Reddit r/SaaS** (writer-agent + Moses posts) — high-intent audience
3. **SQA demo on response** (sqa-demo-agent) — highest demo→paid conversion

### Tier 2 — Build flywheel (Do in parallel)
4. **LinkedIn posts** (buffer-publisher skill) — brand credibility
5. **HN Show HN** (Moses manual, quarterly) — viral potential, one-time
6. **Blog SEO** (content-ops + curator) — 3-6 month compound payoff

### Tier 3 — Scale when Tier 1 converting
7. **YouTube** (video-script-brief skill) — requires Moses on camera
8. **Newsletter** (newsletter-adapter skill) — 3 months to build audience
9. **Partner referrals** (partner-ops) — need real partners first

---

## Email Templates Ready Now

### Template 1 — Cold SQA (primary)
→ See `decisions/OUTREACH_KIT.md` Template R1 adapted for email

### Template 2 — BOI Tracker (quick revenue)
```
Subject: CTA-2024 BOI filing for [Company] — are you covered?

Hi [Name],

FinCEN's CTA-2024 BOI filing requirement hit 32M US companies.
Penalties: $591/day for each day late.

We built a BOI Tracker that handles the full filing and monitors
for ownership changes that require updates.

One-time $149. 15-min setup. → forge.bizlegal-ai.com/boi

Moses, BizLegal AI
```

### Template 3 — OCI Partner (referral network)
```
Subject: Qualified international real estate buyers — referral program

Hi [AttorneyName],

I run a compliance routing platform for cross-border real estate deals.
We're building a referral network: when qualified buyers/investors come
to us outside your jurisdiction, we route them to a vetted local attorney
and pay a placement fee.

No exclusivity, no volume commitment.

Worth a 15-min call? I can explain the fee structure and client profile.

Moses Dor, BizLegal AI
```

---

## Stripe Atlas Action Plan

| Step | Who | When | Status |
|------|-----|------|--------|
| Apply at stripe.com/atlas ($500) | Moses | TODAY | ⬜ |
| Complete business description (use stripe-atlas-agent.md) | Moses | TODAY | ⬜ |
| Wait for EIN + Delaware LLC | Atlas | 5-7 days | ⬜ |
| Send new Stripe keys to me | Moses | After Atlas | ⬜ |
| I wire Stripe into /api/pay/start | Code | After keys | ⬜ |
| Create $29/$69/$99 Stripe Prices | Code | After keys | ⬜ |
| Set up Stripe webhooks | Code | After keys | ⬜ |
| Test end-to-end Stripe checkout | Moses+Code | After setup | ⬜ |

---

## Weekly Outreach Targets

| Week | Emails Sent | Reddit Posts | LinkedIn Posts | Target Revenue |
|------|------------|-------------|---------------|---------------|
| W1 (Jun 9-16) | 10 | 2 | 3 | $0 (fix blockers) |
| W2 (Jun 16-23) | 25 | 2 | 3 | $200 (first trial) |
| W3 (Jun 23-30) | 50 | 3 | 5 | $500 |
| W4 (Jul 1-7) | 75 | 3 | 5 | $1,000 |
| Month 2 | 200/mo | 10/mo | 15/mo | $2,000 MRR |
| Month 3 | 400/mo | 15/mo | 20/mo | $5,000 MRR |

---

## Hetzner Ollama Upgrade (Moses does via SSH)

```bash
ssh root@204.168.209.235
# Step 1: Pull Gemma 4 12B
ollama pull gemma4:12b

# Step 2: Update curator env
export CANONICAL_SECRET="<paste from vault BIZLEGAL_INBOUND_SECRET>"
bash /opt/bizlegal-monorepo/scripts/fix-hetzner-inbound-secret.sh

# Step 3: Pull latest code
cd /opt/bizlegal-monorepo && git pull

# Step 4: Verify
ollama list
systemctl status curator-bot
```

If gemma4:12b isn't available yet in Ollama registry:
```bash
# Use gemma3:12b as next-best option
ollama pull gemma3:12b
SCOUT_OLLAMA_MODEL=gemma3:12b
```
