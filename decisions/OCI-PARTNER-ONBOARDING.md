# OCI Deal Router — Partner Onboarding Playbook
**Goal:** 5–10 closed client referrals/month by Q3 2026-07  
**Owner:** Moses  
**System:** `services/oci/router/` — live FastAPI on OCI, routes pre-classified leads to signed partners

---

## What partners get

| What | Detail |
|------|--------|
| Lead quality | AI-classified, jurisdiction-matched, pain-point summarised |
| Timing | Email within 60s of lead submission |
| Volume | 1–10 leads/week depending on your weekly cap |
| Format | Name, company, jurisdiction need, transaction type, budget signal |
| Commission basis | 5–10% of first invoice or agreed flat fee on close |
| Exclusivity | Non-exclusive; round-robin within your jurisdiction + speciality |

Partners pay nothing until they close. BizLegal takes a referral fee on **closed deals only**.

---

## Partner types we route to

| `type` field | Speciality |
|---|---|
| `re_lawyer` | UAE/DIFC/Dubai real-estate transactions |
| `business_lawyer` | SG company setup, MAS licensing, US LLC/C-Corp |
| `structuring_advisor` | Cross-border holding structures, SPVs, trusts |
| `family_office_advisor` | Private wealth, family office setup, succession |
| `realtor` | UAE RERA-licensed property sales |

---

## How to add a real partner (Moses action)

Run this SQL in Supabase (project `ydghhcuuopqzgqcicubg`) — one row per partner:

```sql
INSERT INTO public.partners (
  name, email, type,
  jurisdictions, specialties, language_codes,
  active, weekly_cap, tier,
  commission_basis, notes
) VALUES (
  'Firstname Lastname / Firm Name',
  'partner@theirfirm.com',
  'business_lawyer',                          -- see types above
  ARRAY['UAE','SG'],                          -- where they practice
  ARRAY['DIFC_SPV','MAS_FFR'],               -- their focus areas
  ARRAY['en','ar'],                           -- languages spoken
  true,
  3,                                          -- leads/week max
  1,                                          -- tier 1 = preferred; 2-4 = secondary; 5 = placeholder
  '8% of first invoice on close',
  'Signed email agreement 2026-07-XX'
);
```

Tier 1 partners get first-pick on every matched lead. Add multiple partners at tier 2–3 for round-robin.

---

## Referral agreement (email-based, no PDF needed)

Send this to each partner before adding them to the DB:

---

**Subject:** BizLegal AI — Referral Partnership Confirmation

Hi [Name],

This confirms our referral arrangement:

- **What we send you:** Pre-qualified cross-border deal inquiries matched to your jurisdiction and speciality.
- **Volume:** Up to [N] leads/week, capped at your request.
- **Referral fee:** [X]% of your first invoice to the referred client, paid within 30 days of you confirming close.
- **Our disclosure:** Every lead receives our standard referral-contract email disclosing our finder fee and your involvement before they engage with you.
- **Opt-out:** Leads can decline referral within 48 hours.
- **No exclusivity:** We may route similar leads to other partners in your jurisdiction.

Reply "Confirmed" to activate your slot.

Moses Dor | BizLegal AI

---

## Acquisition: reaching 5–10 closes/month

### Step 1 — Sign 3 real partners (Week 1, ~2h)

Target by jurisdiction:

**UAE:**
- LinkedIn: search "DIFC lawyer" + "real estate" → 1st-degree or 2nd-degree
- Dubai Chamber member directory (free PDF search)
- Ask: "We send you 2–3 pre-qualified deal inquiries/week, no monthly fee, 8% on close"

**SG:**
- LinkedIn: "MAS licensing lawyer Singapore" or "company secretary Singapore"
- Law Society of Singapore directory (free)
- Message: same script

**US/EU:**
- LinkedIn: "Delaware LLC formation" or "structuring advisor fintech"
- Bar Association referral registries

### Step 2 — Lead acquisition (Week 1–2, organic)

**Reddit (zero cost, 1h/day):**

Post on:
- r/Dubai — "Buying property as a non-resident? [resources]"
- r/Singapore — "Setting up a company as a foreigner [checklist]"  
- r/expats — "Cross-border deal checklist UAE/SG/US"
- r/legaladvice — answer questions, mention BizLegal route

Each post links to `bizlegal-ai.com/agents` (OCI intake) or the hub contact form.

**Cold email cadence (DocAI users):**

DocAI users who uploaded cross-border contracts (UAE/SG parties visible) → send:

```
Subject: We noticed your contract spans UAE/SG — quick question

Hi,

BizLegal AI spotted that you're working on a [UAE/SG] transaction.
If you need a local lawyer or structuring advisor, we route cross-border
deal inquiries to pre-vetted partners at no cost to you.

Takes 2 minutes: [link to OCI intake or hub form]

Moses | BizLegal AI
```

Target: 20 cold emails/day → 2% close = ~1 referral/day = ~20/month at steady state.

### Step 3 — Blog SEO (Week 2+, long-term)

Articles already in the curator queue that drive OCI leads:
- "Best DIFC lawyers for UAE real estate non-residents 2026"
- "Singapore company formation guide for US founders: lawyer checklist"
- "Cross-border SPV structure: UAE holding + US operating LLC"

Each article ends with: "Get matched to a vetted [UAE/SG] specialist → [OCI intake link]"

---

## Current router state (2026-06-21)

| Check | Status |
|---|---|
| Router deployed | Unknown — OCI Docker not confirmed running; needs SSH check |
| Partners in DB | 1 (placeholder → team@bizlegal-ai.com) |
| Leads in pipeline | 2 test rows in deal_router_leads |
| Email sending | Resend configured; needs RESEND_API_KEY in OCI env |
| Telegram alerts | Configured in notify.py |

**Immediate Moses actions to go live:**
1. Add 1+ real partner row (SQL above)
2. Confirm OCI Docker container is running: `ssh oci; docker ps`
3. Test one lead: `curl -X POST https://deals.bizlegal-ai.com/lead -H "..." -d '{"text":"I want to buy property in Dubai"}'`

---

## Revenue math

| Metric | Conservative | Target |
|---|---|---|
| Leads/month (organic) | 20 | 60 |
| Conversion to close | 5% | 10% |
| Closes/month | 1 | 6 |
| Avg deal value | $5,000 | $15,000 |
| Referral fee (8%) | $400 | $1,200 |
| MRR from OCI | $400 | $7,200 |

At 5–10 closes/month with $5K–$15K average deals: **$2K–$12K/mo** without any paid ads.
