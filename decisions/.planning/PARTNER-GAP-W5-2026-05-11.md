# Partner Coverage Gap — Week 5 Day 1 Report

**Date:** 2026-05-11 (Mon AM)
**Query source:** Direct Supabase REST against `partners?active=eq.true`
**Why this matters:** OCI router routes every classified lead to `partner_id`. Today every classification falls through to the placeholder, which means real leads land in Moses's email instead of a partner contract loop. Zero real partners = zero deal closure path = zero referral revenue.

---

## Current state

| Metric | Count |
|---|---:|
| Total active partners | 1 |
| Real (non-placeholder) | **0** |
| Placeholders | 1 |

The single active row:

```
tier=5  type=placeholder  juris=[UAE,SG,US,EU,IL,GB]
name=BizLegal-AI Team (placeholder)  cap=100/week
```

This placeholder catches every classification (it lists all 6 jurisdictions + tier=5 means lowest priority but still selectable when nothing real matches). The `email_contract.py` flow fires partner emails to whatever email is on this row.

---

## Classification → partner gap

Per `services/oci/router/partners.py:CLASSIFICATION_TO_JURISDICTION`:

| Classification | Required jurisdiction | Required types | Real partners eligible |
|---|---|---|---:|
| UAE_REAL_ESTATE | UAE | realtor + lawyer | **0** |
| SG_BUSINESS_SETUP | SG | business_lawyer + structuring_advisor | **0** |
| EU_US_BUSINESS | US | business_lawyer + structuring_advisor | **0** |
| LEGAL_RISK_REPORT | any | any lawyer type | **0** |
| LOW_VALUE | n/a | — | n/a (no routing) |

**All 4 routable classifications = ZERO real partner coverage.**

---

## Path forward (W5.2)

Two options. Both require Moses to provide partner data — I can't seed real or fake people without explicit authorization.

### Option A — Real partners (preferred, slower)
Moses sends 5-10 cold outreach emails THIS WEEK to:
- 2× UAE-based real estate lawyers/realtors (UAE_REAL_ESTATE)
- 2× Singapore business setup lawyers (SG_BUSINESS_SETUP)
- 2× US business lawyers, ideally bilingual EU/US (EU_US_BUSINESS)
- 2× general legal-risk advisors (LEGAL_RISK_REPORT)

For each acceptance, run `bizlegal-seed-partner` skill with their real email + tier=2 (most acceptances start at tier=2; tier=1 reserved for proven closers).

### Option B — Moses-fronted "shadow partners" (fast, gets the chain running)
Seed 4 entries where each is Moses himself with a routing-specific email alias:
- `realestate-uae@bizlegal-ai.com` → forwards to Moses
- `business-sg@bizlegal-ai.com` → Moses
- `business-eu-us@bizlegal-ai.com` → Moses
- `legal-risk@bizlegal-ai.com` → Moses

Each tier=3, weekly_cap=20. Moses receives each `referral.contract_email` himself and replies as a partner would. This lets the synthetic-nurture-arc smoke test (W5.3) run end-to-end while real outreach (Option A) progresses in parallel.

### Recommended hybrid
Run **Option B today** for instant chain integrity. Run **Option A in parallel** through Mon/Wed/Fri outreach (Track A of the plan). Replace shadow partners as real ones accept.

---

## What I need from Moses to seed

For each partner row (whether real or shadow):
- `name` (display + signed-email salutation)
- `email` (where the contract_email lands)
- `type` (one of: `re_lawyer`, `business_lawyer`, `structuring_advisor`, `family_office_advisor`, `realtor`, `family_office_advisor`)
- `jurisdictions` (array — at least one of UAE/SG/US/EU/IL/GB)
- `specialties` (free-text, e.g. "MiCA + crypto", "TCPA + outbound", "DIFC Free Zone")
- `tier` (1-3; lower = higher priority in selection)
- `weekly_cap` (default 20)
- `language_codes` (array, defaults to `['en']`)

I can format this into the `bizlegal-seed-partner` skill calls once Moses replies with the data.

---

## Smoke test ready

Once ≥1 real or shadow partner is seeded for EACH of the 4 classifications, run:

```bash
curl -X POST https://bizlegal-ai.com/api/contact \
  -F "name=Smoke Test" \
  -F "email=smoke+test@bizlegal-ai.com" \
  -F "subject=enterprise" \
  -F "message=I run a 15-person crypto exchange in Singapore, need MiCA + MAS guidance for our Q3 token launch"
```

Expected in `/ops` feed within 15s:
1. `lead.inbound` (source=hub, page=contact)
2. `referral.received` (source=oci, classification=SG_BUSINESS_SETUP, partner_id != placeholder)
3. `email.sent` (source=oci, ref_id=contract_email_*)

If `partner_id == placeholder` after seeding, the partners table needs `jurisdictions` containing `SG` for the chosen row.
