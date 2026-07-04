# COMPLIANCE OPS RETAINER — SLA + MAINTENANCE
**Version:** 2026-07-05
**Applies to:** Every $2,500/mo compliance_ops_retainer client

================================================================
1. WHAT YOU (MOSES) MAINTAIN
================================================================

Daily (5 min, 18:00 UTC):
  - [ ] Read the daily_orchestrator's task=19 Telegram digest
  - [ ] Check 1-2 agent_runs rows in Supabase for anomalies
  - [ ] If any agent run failed twice in a row, debug immediately
  - [ ] Otherwise: close Telegram, walk away

Weekly (30 min, Monday morning):
  - [ ] Pull 7-day report from /ops/command (token in vault)
  - [ ] Review agent_runs for the week: success rate >75% target
  - [ ] Check 1-2 client-specific risk snapshots
  - [ ] If success rate < 50% for 2 consecutive days, STOP and debug

Monthly (1 hour, first Monday of month):
  - [ ] Pull 30-day report
  - [ ] Compare against SLA (below)
  - [ ] Send monthly status to each client contact
  - [ ] Send invoice (auto-charged by Stripe)
  - [ ] Update clients/{slug}/config.yaml if anything changed

Quarterly (1 hour, with QBR):
  - [ ] Run 1-hour QBR with client
  - [ ] Walk through the quarter's compliance events caught
  - [ ] Get feedback, adjust config
  - [ ] Ask for case study / testimonial

Annually (1 hour, renewal):
  - [ ] 12-month review with client
  - [ ] Calculate hours saved, fines avoided (rough)
  - [ ] Renewal conversation
  - [ ] Price tier review

================================================================
2. SLA — what the client gets
================================================================

  Item                                  Target      Payout if missed
  ----------------------------------------------------------------------
  Agent uptime                          99.5%       $50/incident
  Daily Telegram digest                 18:00 UTC   Free 1-month extension
  Weekly risk-snapshot                  Monday 9am  Free 1-month extension
  Monthly 1-page status PDF             Day 5       Free 1-month extension
  Compliance delta detection            <24h        Free 1-month extension
  Response to client questions          <24h (SLA)  Free 1-month extension
  First invoice                         Day 30      Free 1-month extension
  Quarterly business review call        1x/quarter  Free 1-month extension

  Penalty cap: 1 month of fees ($2,500) per incident, 3 months per year
  Missed SLA = client can request a 1-month credit (auto-applied)

================================================================
3. CAPACITY (the 8-client sweet spot)
================================================================

  Per-client resource usage (verified on Hetzner CX33):
    CPU:  3.3 min/day
    RAM:  320 MB peak
    API:  88 calls/day (Anthropic + Firecrawl + Resend)
    Storage: 50 MB Supabase + 1 GB Resend
    Network: 200 MB/day

  Per-human workload (1 person, 8 clients):
    Daily review: 5 min × 8 clients = 40 min
    Weekly: 30 min × 8 = 4 hr/week
    Monthly: 1 hr × 8 = 8 hr/month
    Quarterly: 1 hr × 8 = 2 hr/quarter
    Total: 17 hr/week (40% of 1 full-time human)

  At 9 clients: 19 hr/week (sustainable)
  At 12 clients: 25 hr/week (need 2nd human)
  At 16 clients: 33 hr/week (need 2 humans + better tools)

  RECOMMEND: cap at 8 clients until 2nd human onboarded.

================================================================
4. TOOLS + INFRASTRUCTURE
================================================================

  Required (already in stack):
    - 1 Hetzner CX33 (THE MACHINE)
    - 1 Vercel Pro (hub.bizlegal-ai.com)
    - 1 Supabase Pro (multi-tenant, per-client RLS)
    - 1 Resend 10K tier (8 client × 1K emails/mo = 8K)
    - 1 Anthropic API key (8 clients × $10/mo = $80/mo)
    - 1 Firecrawl Hobby (8 clients × $2/mo = $16/mo)
    - Total: ~$186/mo for 8 clients

  Recommended additions (deferred until 4+ clients):
    - Plausible Pro ($29/mo) for per-client conversion analytics
    - Sentry Team ($26/mo) for per-client error tracking
    - Better Uptime ($18/mo) for per-client uptime monitoring

  Optional at 6+ clients:
    - Hire a part-time VA (10 hr/week, $20/hr = $800/mo)
      to handle Tier-1 support escalations
    - 2nd human engineer (full-time, $8K/mo) at 10+ clients

================================================================
5. RISK + MITIGATION
================================================================

  Risk                                         Mitigation
  ----------------------------------------------------------------------
  Orchestrator breaks (Day-1 commit fix)       Daily 18:00 review catches it
                                               within 24h; rollback is git revert
  Single API key expires (Stripe/Resend)      env_audit.py at 09:00 UTC daily
                                               alerts via Telegram
  Client churn (1 of 8 leaves)                Onboarding pipeline has 2:1 ratio
                                               (always 2 in pipeline, 8 active)
  Regulatory fine during retainer             60-day risk window; up to $5K
                                               covered by us; after that, the
                                               24/7 monitor has caught the delta
  Conflict of interest (2 fintechs)           Clients sign mutual NDA; agents
                                               run in dedicated namespaces
  Compliance framework changes                Daily 02:00 UTC update cron
                                               picks up framework deltas

================================================================
6. PRICING TIERS (the upsell path)
================================================================

  Tier 1: Compliance Ops Retainer   $2,500/mo
    - 8 agents running
    - Daily digest + weekly snapshot + monthly PDF
    - Slack + Telegram + Stripe billing

  Tier 2: Compliance Ops + Custom   $5,000/mo  (50% of clients by year 2)
    - Everything in Tier 1
    - 1 custom agent per quarter
    - Quarterly business review (1 hr)
    - SOC 2 pre-filled questionnaire

  Tier 3: Compliance Concierge      $10,000/mo  (2-3 of 8 by year 2)
    - Everything in Tier 2
    - 1 dedicated senior consultant (1 hr/week)
    - 24/7 phone hotline for compliance emergencies
    - Custom framework development (e.g. new state law)

  Pricing model: outcome-priced, not hour-priced
  Annual price increase: 5% (or tied to CPI, your choice)
  Cancel anytime, no annual contract

================================================================
7. ONBOARDING TIMELINE (per client, realistic)
================================================================

  Day 0:    Discovery call (1 hr)
  Day 1-3:  Stack config + first agent runs
  Day 4-7:  All 8 agents running in shadow mode
  Day 8-21: Shadow mode + daily 15-min standup
  Day 22:   Flip to live
  Day 30:   First invoice

  Total: 30 days from discovery to first invoice
  Per-client time cost: 12-16 hours of human work
  At 2 clients/month: 24-32 hours/month of onboarding
  Plus 17 hours/month of maintenance per 8 clients
  Total: 41-49 hours/month per 8 clients
  Per-client hours: 5-6 hours/month
  At $2,500/mo and 6 hours of work, effective rate: $416/hour

================================================================
8. THE 8-CLIENT NORTH STAR
================================================================

  Hit 8 clients = $20K MRR = $240K/year gross
  At 6 hours/client/month of work = 48 hours/month = 12 hr/week
  Plus 5 hr/week new sales = 17 hr/week
  $240K/year ÷ 884 hours = $271/hour effective rate
  (compared to 100 × $200 = $20K/year ÷ 2000 hours = $10/hour)

  The math: 8 × $2,500 is 24x the hourly rate of 100 × $200.
  And it compounds.
