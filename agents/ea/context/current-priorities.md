# Current Priorities

Date: 2026-07-04

## Canonical Sources (read in this order)
1. `agents/HERMES-STANDING-ORDERS.md` — standing orders for every Hermes layer; on conflict with any other doc, standing orders win.
2. `decisions/MRR-40K-90-DAY-PLAN-2026-07-02.md` — THE active Q3 2026 execution plan ($10K MRR committed by 09-30; 4 revenue engines).
3. `decisions/REVENUE-MACHINE-24-7-2026-07-04.md` — the 24/7 revenue machine build (in progress: standing orders, gated outreach, invoice cron, async funnel, /ops/command).

## This Week (Week-1 first-dollar gate, Jul 2-9)
- Moses M1-M2: fix DocAI `NEXT_PUBLIC_SITE_URL` + push `NOWPAYMENTS_IPN_SECRET`, then one real $97 self-purchase round-trips.
- Moses M3: create top 5 PayPal plan IDs; confirm LIVE client ID.
- Moses M4-M5: disable CF AI Crawl Control on 8 zones; verify 8 GSC properties + submit sitemaps.
- Moses M6-M8: fix leadforge root dir + tracr env; refresh Vercel CLI login; Plausible on 7 projects.
- Agents: publish the MiCA-deadline post + queue posts 2-3; release the 28 staged cold emails (consent gates apply); wire `lead_nurture.py` + `distributor.py` + `dunning.py` onto timers; fix the 10 AEO posts' 2025→2026 slugs.

## Decision Filter
Nothing in weeks 2-13 matters if Week 1 doesn't end with one real dollar captured. Revenue captured > everything (Prime Directive).
