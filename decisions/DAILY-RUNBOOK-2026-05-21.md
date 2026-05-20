# BizLegal AI — Daily Ops Runbook

**One page. Every morning. 2 minutes.** Print this or keep it pinned.

---

## Morning routine (2 min)

```
1. OPEN  → https://bizlegal-ai.com/ops/master?t=$OPS_DASHBOARD_TOKEN
   CHECK → Is the chain green? Any payment.confirmed overnight?

2. OPEN  → https://bizlegal-ai.com/ops/health?t=$OPS_DASHBOARD_TOKEN
   CHECK → All 8 surfaces green? HMAC OK?

3. OPEN  → Telegram
   CHECK → Any curator picks waiting >4h? Auto-pick fires at 10:00 UTC.

4. OPEN  → https://bizlegal-ai.com/ops/master
   CHECK → Revenue stats, events, any critical gaps flagged
```

### If something is RED

| Red item | Do this |
|---|---|
| Subdomain down | Check `apps/<x>/` build, push fix, wait for Vercel redeploy |
| HMAC fail | Regenerate `BIZLEGAL_INBOUND_SECRET`, redeploy all surfaces |
| Env gap | Add missing var to vault → Vercel dashboard → redeploy |
| No events >4h | Check cron fired, check HMAC chain, check Supabase |
| Payment webhook failed | Check gateway dashboard, check `/api/ops/log` |

---

## Revenue actions today

### SELL RIGHT NOW (wire + crypto — no gatekeepers)

| Product | Price | Checkout link |
|---|---|---|
| Forge BOI Kit | $149 | `/checkout?product=forge&tier=boi-kit&interval=one-time&amount=14900` |
| Hub Pro | $149/mo | `/checkout?product=hub&tier=pro&interval=monthly&amount=14900` |
| LexAudit Monitor | $99/mo | `/checkout?product=lexaudit&tier=monitor&interval=monthly&amount=9900` |
| BRAI Extended | $500 | `/checkout?product=brai&tier=extended&interval=one-time&amount=50000` |
| Bank Wire | ≥$500 | Any checkout + buyer selects wire — you confirm manually |

**Send 1 link to a warm prospect today.** Crypto or wire clears same-day.

### Cold pitches — send 3-5 today

Templates in `decisions/COLD-PITCH-QUEUE-2026-05-20.md`.
Pick recipients from LinkedIn / Reddit r/fintech / crypto exchange compliance teams.
Each template includes a live checkout URL.

---

## Weekly cadence

| Day | Action | Where |
|---|---|---|
| **Mon** | Z7 fleet verify — check all surfaces | `/ops/health` |
| **Mon/Wed/Fri** | 3-5 cold pitches + 1 LinkedIn post | Pitch queue doc |
| **Wed** | Partner coverage check | OCI router |
| **Fri 10:00 UTC** | Payout reconciler fires | Telegram digest |
| **Fri PM** | Submit new pages to GSC | Search Console |
| **Sun PM** | 15-min retrospective | What broke? What sold? |

---

## Products available (17 tiers across 7 apps)

| App | Products | Price range |
|---|---|---|
| **Hub** | Pro $149/mo, Scale $499/mo | $149-499/mo |
| **Forge** | BOI Kit $149, Passport $1,500, Scan $97 | $97-1,500 |
| **BRAI** | Standard $149, Priority $249, Extended $500, Retainer $599-1,999 | $149-1,999 |
| **TRACR** | Regulatory $29, Bronze $149, Silver $299 | $29-299 |
| **LexAudit** | Solo $49, Boutique $199, Mid-Market $599 | $49-599/mo |
| **DocAI** | Starter $29, Team $69, Firm $99 | $29-99/mo |
| **LeadForge** | Lead intelligence (pricing TBD) | TBD |

---

## Key URLs

| What | URL |
|---|---|
| Ops Master Dashboard | `/ops/master?t=$OPS_DASHBOARD_TOKEN` |
| Health Check | `/ops/health?t=$OPS_DASHBOARD_TOKEN` |
| Event Tape | `/ops?t=$OPS_DASHBOARD_TOKEN` |
| Unified Checkout | `/checkout?product=<x>&tier=<y>&interval=<z>&amount=<n>&name=<name>` |
| Wire Confirmation | `/api/payments/wire/confirm` (curl or dashboard) |
| Vault (canonical) | `C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt` |
| Operating Book | `bizlegal-monorepo/CLAUDE.md` |
| All Decisions | `bizlegal-monorepo/decisions/` |

---

## Quick reference

```
HMAC secret: BIZLEGAL_INBOUND_SECRET (on all 11 surfaces)
Ops token:   OPS_DASHBOARD_TOKEN (on hub Vercel)
Cron secret: CRON_SECRET (on hub Vercel)
Vercel team: aileadx10-5415s-projects
Supabase:    ydghhcuuopqzgqcicubg (ap-southeast-2)
```

### Deploy commands

| Surface | Command |
|---|---|
| Vercel apps (all 7) | Push to `main` → auto-deploys |
| Hetzner curator | `ssh hetzner; cd /opt/bizlegal-monorepo; git pull; sudo systemctl restart curator-bot curator-publisher` |
| OCI router | `ssh oci; cd /opt/bizlegal-monorepo; git pull; docker compose -f services/oci/docker-compose.yml up -d --build` |
| CF Worker | `cd services/worker; pnpm wrangler deploy` |
| Telegram Hub Bot | `cd services/telegram-hub; pnpm wrangler deploy` |
