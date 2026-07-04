# DELIVERABLE — Plan Review, Cost Ledger, and Hermes Savings
**Date:** 2026-07-04 23:45 UTC+3  Scope: verify the 24/7 Revenue Machine plan
overnight work, compute true cost, compute Hermes time savings,
suggest improvements, and fix the one bug I caught.

================================================================
1 — WHAT WAS ACTUALLY SHIPPED OVERNIGHT (verified)
================================================================

Commit 3360ab1 — Day-1 orchestrator fix:
  - services/__init__.py created
  - python-dotenv installed on Hetzner
  - orchestrator.py now prepends repo root to sys.path
  - VERIFIED: "close deal monetize hot leads" returned ok=true, 1/1 agents ok
  Cron "*/15 * * * *" will pick it up automatically
  STATUS: SHIPPED + VERIFIED ✓

Commit 7b7b334 — Revenue Machine WP1-WP4:
  - agents/HERMES-STANDING-ORDERS.md (101 lines, 7 standing orders O1-O7)
  - agents/AGENTS.md (125 lines, full system index — fixes the missing file)
  - apps/hub/app/api/cron/invoices/route.ts (107 lines, invoice follow-up)
  - apps/hub/app/api/qualify/route.ts (160 lines, Haiku 4.5 intent scorer)
  - apps/hub/app/deal/[token]/page.tsx (178 lines, private deal room)
  - apps/hub/app/services/custom-build/page.tsx (344 lines, 3-tier pricing)
  - apps/hub/vercel.json (+2 crons: invoices 10:00, standing-review 18:00)
  - services/agents/signal_scout.py (254 lines, Apollo-based scan)
  - supabase/migrations/20260704_deal_rooms.sql (48 lines, RLS + 3 idx)
  STATUS: SHIPPED (9 files, 1322 insertions) ✓

Verified against the plan:
  WP1 (Hermes consolidation):   3/3 files exist     ✓
  WP2 (senders + invoice):      3/3 files exist     ✓
  WP3 (qualifier + deal room):  3/4 files exist     ⚠ QualifierChat.tsx MISSING
  WP4 (custom-build page):      1/1 file exists     ✓
  WP5 (risk-snapshot):          0/2 files exist     ✗ NOT BUILT
  WP6 (/ops/command):           0/2 files exist     ✗ NOT BUILT

The overnight claim said "WP1-WP4 built." The reality is:
  WP1, WP2, WP3 (partial), WP4 built.
  WP5 + WP6 not yet built. (WP5 + WP6 were 2.5 days of work in the
  plan, so being 50% through the build is consistent with one
  session of work, but the plan-implied "WP1-WP4 complete" overstates
  by 1.5 days.)

================================================================
2 — THE BUG I CAUGHT (the one that would have bitten you in 24h)
================================================================

The plan said:
  "Tool stack — Skipped: Apollo $49 (signal_scout covers; revisit day 60)"

The actual signal_scout.py ships with this at the top:
  APOLLO_API_KEY=os.getenv("APOLLO_API_KEY", "")

The Hetzner .env shows ZERO Apollo env vars (verified via the
infra probe). So signal_scout will fail every run at 01:00 UTC
until either:
  (a) APOLLO_API_KEY is added to .env (and the plan's "skip Apollo"
      decision is reversed), OR
  (b) signal_scout.py is rewritten to not use Apollo

This is a real contradiction in the overnight work. The plan said
no Apollo. The code needs Apollo. The cron will fail daily until
fixed. Worst case: it adds to the 16/16 monetization fail count.

Same kind of contradiction for APIFY: the plan listed it in
"Moses-only gates" as MISSING, but signal_scout does NOT use Apify
(headhunter does). So signal_scout is purely an Apollo story.

RECOMMENDED FIX (pick one, low risk):
  Option A — drop Apollo from signal_scout. Rewrite to use
             Firecrawl + Anthropic for ICP detection (no paid API
             beyond what the rest of the system already uses).
             Aligns with the plan. ~3 hours of work.
  Option B — add APOLLO_API_KEY to vault, accept the $49/mo cost.
             Aligns with the code. ~10 min of work (just add the key).

RECOMMENDATION: Option A. The plan's "no Apollo" stance was
explicit; aligning the code to the plan is cheaper than adding
$588/yr of spend. Patch signal_scout.py to use Firecrawl + a
simpler ICP scan (regex match on company descriptions, no paid API).

================================================================
3 — MONTHLY COST LEDGER (the actual numbers)
================================================================

EXISTING INFRASTRUCTURE (already paying, before this plan)
-----------------------------------------------------------
  Hetzner CX33 ..........................  €4.85/mo  (~$5.20)
    - 4 CPU, 8 GB RAM, 75 GB disk
    - hosts THE MACHINE (8 agents), 53 cron jobs, 4 systemd services
    - ENV: SUPABASE ✓, ANTHROPIC ✓, APIFY (4 vars) ✓, RESEND ✓
    - ENV: BLOTATO ✗  RESEND_AUDIENCE_ID ✗  STRIPE live ✗  APOLLO ✗

  Vercel Pro (hub.bizlegal-ai.com) ......  $20/mo
    - hosts hub app, 12 serverless crons
    - DNS NOT PUBLICLY RESOLVABLE (still need Cloudflare CNAME fix)
    - 7 active Vercel projects per agents/AGENTS.md (hub, docai, etc.)

  Supabase Pro ..........................  $25/mo
    - hosts 75+ tables (per the prior 24/7 probe)
    - leadforge_leads (271 rows), lead_outreach (53), agent_runs

  Anthropic API ..........................  $40-80/mo
    - Haiku 4.5 for crons + qualifier + standing review
    - Sonnet for reports (Compliance Snapshot, risk-snapshot)
    - Opus only on request (none currently used)

  Resend (10K tier) .....................  $20/mo
    - cold_email_sender, lead_nurture, newsletter, invoices, ea_agent
    - RESEND_AUDIENCE_ID missing (newsletter blocked)

  Firecrawl Hobby ........................  $16/mo
    - headhunter enrichment, signal_scout (after fix), risk-snapshot

  Perplexity API ........................  $5/mo
    - geo_citation cron

  Total EXISTING .......................  ~$131-171/mo

TOOLS THE PLAN ADDS OR REQUIRES (not yet paying)
-------------------------------------------------
  Plausible ..............................  $9/mo    [plan says add]
  SerpBear (self-hosted) + serper.dev ...  $10/mo   [plan says add]
  Buffer .................................  $6/mo    [plan says add]
  GITHUB_TOKEN for publish_blog.py .......  $0       [already in env]
  Apollo (per the bug above) .............  $49/mo   [plan says SKIP]
  APOLLO per Option A above ..............  $0       [patch instead]
  APOLLO per Option B above ..............  $49/mo   [if you take B]

  Total NEW (if all added as planned) ....  ~$25-74/mo
  Total NEW (if you take Option A — drop
              Apollo + Plausible/SerpBear/Buffer not added yet)  $0/mo
  Total NEW (if you take Option B + add Plausible/SerpBear/Buffer)  $74/mo

COMBINED (existing + all new tools as planned)
-----------------------------------------------
  $131-171 + $25-74 = $156-245/mo

  $156/mo  is the floor (all existing + zero new)
  $200/mo  is the realistic midpoint
  $245/mo  is the ceiling (everything on, Option B for Apollo)

The plan's "$150-200/mo all-in" estimate is RIGHT at the floor
if Apollo is dropped (Option A) and Plausible/SerpBear/Buffer
are deferred. If you go with the plan literally (all tools added,
Apollo still skipped), the cost is $180-200/mo.

================================================================
4 — HERMES TIME SAVINGS (the value of the system)
================================================================

The 24/7 Revenue Machine replaces manual work that today is being
done by Moses or is just not being done. Conservative estimate
(based on the system as it would function once all 4 WPs are live):

  WORKSTREAM                          HR/MO SAVED  REPLACES
  ----------------------------------------------------------------
  Spec-only agents (8 specs)          12           manual agent ops
  Headhunter + cold outreach          15           manual send + reply triage
  Morning digest + 18:00 review       15           ad-hoc daily synthesis
  Qualifier chat                      6           discovery calls
  Invoice + dunning                   5           manual email
  Content + socials scheduling        12           hand-scheduled posts
  Compliance scans (DocAI etc)        8           consultant research
  Lead scoring (in Supabase)          4           spreadsheet maintenance
  ----------------------------------------------------------------
  TOTAL                                77 hr/mo

  $50/hr  (VA rate)             = $3,850/mo of value
  $100/hr (operator rate)        = $7,700/mo of value
  $200/hr (senior consultant)    = $15,400/mo of value

Net economics: at the $200/mo midpoint cost, the system returns
38-77x its cost at the operator rate. At the $50/hr rate, it's
still 19x.

CAVEATS (the honest version):
  - Many of these hours were ALREADY being lost (not done at all)
    so the savings are not pure substitution; some is capacity unlock
  - The 8 spec-only agents that become real via Hermes need their
    prompts + tests built; today the prompts don't all exist
  - Cold outreach won't actually send 50/day without APIFY + warm-up
    (the Apollo contradiction above will hit first)
  - The qualifier chat only works if the deal-room table is migrated
    and the standing review cron is live (it is, as of commit 7b7b334)

================================================================
5 — IMPROVEMENTS I RECOMMEND (priority order)
================================================================

P0 (blocks revenue, fix this week)
----------------------------------
  1. FIX signal_scout's Apollo contradiction (3 hr, Option A)
     - Rewrite signal_scout.py to use Firecrawl + Anthropic for
       ICP scan, no Apollo. Aligns with the plan's "skip Apollo"
       and saves $49/mo + $588/yr.

  2. APPLY supabase/migrations/20260704_deal_rooms.sql
     - 5 min in Supabase SQL editor. Without this, every /api/qualify
       request fails on the first DB write. Currently the table does
       not exist on the live DB.

  3. Add APIFY_API_TOKEN to /opt/bizlegal/curator/.env on Hetzner
     - 5 min. Without this, headhunter_agent runs but produces 0
       signals daily. Pipeline stays dead. Copy from the vault
       (env-hub-bizlegal-ai.txt) to .env, restart curator-bot.

  4. Add hub.bizlegal-ai.com CNAME in Cloudflare
     - 5 min in Cloudflare UI. CNAME hub → cname.vercel-dns.com.
     Without this, none of the new /services/custom-build, /api/qualify,
     /deal/[token], /api/cron/invoices, or /compliance-snapshot URLs
     resolve publicly.

P1 (build, days 2-3)
---------------------
  5. Build QualifierChat.tsx (the missing 4th WP3 file)
     - 4 hours. Without it, /api/qualify is API-only with no UI.
     The deal room creation works server-side but no embedded widget
     means the funnel is invisible. Drop the file at
     apps/hub/components/conversion/QualifierChat.tsx and embed on
     hub home, /services/custom-build, /products/intelligence.

  6. Build WP5 ($19 Risk Snapshot) + WP6 (/ops/command)
     - 2.5 days combined. These were in the plan but not built.
     /ops/command is the "see every move" dashboard — without it
     the daily Telegram reports are the only window into the system.

  7. Add the standing-review cron to Hetzner crontab
     - 5 min. The Vercel-side cron is wired (per the commit), but
     the Hetzner side has no equivalent. Add:
         0 18 * * * cd /opt/bizlegal/curator && . ./.env && set +a &&
         python3 /opt/bizlegal/curator/services/seo-agents/daily_orchestrator.py --task=19
     The task=19 already exists; just needs crontab entry.

P2 (operate, week 2)
--------------------
  8. Test the full E2E flow with a $1 wire + $19 snapshot
     - The plan's "Verification" section requires this. 1 hour
     (manually: paste a privacy policy, pay $19 via test mode,
     confirm email arrives <10 min, confirm deal room URL works).

  9. Wire STRIPE live key (compliance_snapshots checkout)
     - The current checkout is a stub. Real Stripe unblocks the
     actual $9/$19 revenue line. 1 hour to set up product + price
     in Stripe dashboard, append STRIPE_SECRET_KEY to vault.

  10. Add Plausible + SerpBear + Buffer (the plan's "new tools")
      - These are nice-to-have analytics/distribution. Defer until
      after first paying customer; don't pay for analytics before
      you have a conversion funnel producing real data.

================================================================
6 — TOOLS NEEDED & MONTHLY PAYMENT REGISTRY
================================================================

Save this to env-hub-bizlegal-ai.txt registry or as a separate
decisions/COST-LEDGER.md. Per the O5 standing order, every new
tool/env var must land here BEFORE the code references it.

  EXISTING (already paying)
  ----------------------------------------------------------------
  Tool                    $/mo   Status   Env var(s) needed
  Hetzner CX33            5.20   ACTIVE   n/a (server)
  Vercel Pro              20     ACTIVE   n/a (Vercel UI)
  Supabase Pro            25     ACTIVE   SUPABASE_URL + SERVICE_KEY
  Anthropic API           40-80  ACTIVE   ANTHROPIC_API_KEY
  Resend 10K              20     ACTIVE   RESEND_API_KEY
  Firecrawl Hobby         16     ACTIVE   FIRECRAWL_API_KEY
  Perplexity API          5      ACTIVE   PERPLEXITY_API_KEY
  ----------------------------------------------------------------
  Subtotal EXISTING       131-171

  PLAN ADDS (status as of 2026-07-04)
  ----------------------------------------------------------------
  Plausible               9      NOT ADDED  n/a
  SerpBear (self)         0      NOT ADDED  self-hosted
  serper.dev pay-go       10     NOT ADDED  SERPER_API_KEY
  Buffer                  6      NOT ADDED  BUFFER_API_KEY
  GITHUB_TOKEN            0      PRESENT    GITHUB_TOKEN (env var, not $)
  ----------------------------------------------------------------
  Subtotal NEW            25

  SKIPPED (per plan)
  ----------------------------------------------------------------
  Apollo                  49     SKIP     (Option A: patch signal_scout
                                          to drop the dep, $0)
  SE Ranking              65     SKIP     (not in plan)
  Apify                   49+    MISSING  APIFY_API_TOKEN (in vault,
                                          needs .env copy)
  ----------------------------------------------------------------

  TOTAL PLAN COST        $156-196/mo  (existing + new, no Apollo)
  TOTAL PLAN COST        $205-245/mo  (with Apollo Option B)

  BREAK-EVEN CHECK:
    1 Pilot @ $2,500    = covers 13-16 months of system cost
    1 Snapshot customer/day @ $9 = covers 17-22 days of system cost
    1 Build @ $15,000   = covers 76-96 months of system cost
    1 Flagship @ $40,000 = covers 204-256 months of system cost

  Realistic first-month breakeven requires 1 Pilot OR ~22 Snapshot
  customers OR 1 Build. Per the plan's income table, the
  conservative Day-30 income is $86 — that doesn't cover $200/mo.
  Day-60 conservative is $3.3K — that covers 16x. Day-90
  conservative is $6.7K — that covers 33x.

================================================================
7 — WHAT I CHANGED (commits since 84b9046)
================================================================

None on main from this session. The overnight work (3360ab1 +
7b7b334) is intact. I did NOT push a fix for the Apollo
contradiction yet because that's a 3-hour rewrite that should
be its own commit. I will ship it as P0 if you say go.

================================================================
8 — DECISION MENU
================================================================
  go: fix-signal-scout   (3 hr, rewrite to use Firecrawl+Anthropic,
                          drop the Apollo dep, save $49/mo,
                          ship as commit on main)
  go: apply-migration    (5 min, run 20260704_deal_rooms.sql in
                          Supabase SQL editor; unblocks /api/qualify)
  go: add-apify          (5 min, copy APIFY_API_TOKEN from vault to
                          /opt/bizlegal/curator/.env, restart
                          curator-bot; unblocks headhunter pipeline)
  go: fix-dns            (5 min, Cloudflare CNAME hub → vercel,
                          unblocks all /services/, /api/, /deal/,
                          /compliance-snapshot URLs)
  go: build-wp5-wp6      (2.5 days, ship the missing 25% of the plan
                          — risk-snapshot + /ops/command)
  go: full-p0            (1 hr, apply migration + add APIFY + fix
                          DNS, then verify end-to-end with a $1
                          wire test; the system goes from "built"
                          to "actually working")
  go: cost-only          (just save this report; do not change
                          state)
  stop:                  (leave it)
