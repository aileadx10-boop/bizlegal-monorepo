# Revenue Machine — $0 → $100/day target

**First built:** 2026-07-09
**Last updated:** 2026-07-17
**Owner:** Moses (BizLegal AI)
**Status:** LIVE on Hetzner (all 5 agents cron-active)

---

## Cohort 1 — 2026-07-09 (3 agents, template-based)

### Root cause fixed
  1. **Anthropic credit = $0** — blocked LLM scoring. Fixed: funded.
  2. **lead_outreach table**: signal_scout queued 0 leads due to upstream LLM failure.
  3. **Resend FROM address**: was `intelligence@bizlegal-ai.com` (parent domain, not verified).
     Correct FROM: `intelligence@intelligence.bizlegal-ai.com` (verified subdomain).

### Agents shipped
| Agent | Schedule | What it does |
|---|---|---|
| `outreach_pipeline.py` | every 4h | Template-based outreach drafts → `lead_outreach` |
| `outreach_sender.py` | every 15min | Sends `lead_outreach` drafted rows via Resend (30/cycle cap) |
| `monetization_v2.py` | every 30min | NowPayments + PayPal payment links for qualified/replied leads |

### Live results (2026-07-09)
  - 10 leads drafted in 5s (first run)
  - 5 emails SENT (Resend confirmed)
  - 9 payment_orders created (await PayPal capture)
  - 63 rows in lead_outreach queue

---

## Cohort 2 — 2026-07-16 (3 agents, AI-personalized, covers E1-E4)

### What changed
E1 self-serve and E2 high-ticket previously had no nurture or personalized outreach.
All 3 agents draft to `sales_outreach` with `status='drafted'` — Moses approves at `/sales`.

### Agents shipped
| Agent | Schedule | Revenue path | What it does |
|---|---|---|---|
| `aeo_revenue_agent.py` | 07:00 UTC | E3 | AEO Q&A content → daily_gaps, citation tracking, revenue attribution |
| `conversion_funnel_agent.py` | 08:00 UTC | E1+E3 | 4-track drip: risk_snapshot / newsletter / free-scan / cart recovery |
| `enterprise_closer_agent.py` | 09:00 UTC | E2+E4 | AI proposals for ICP≥75, enterprise briefs for ICP≥90, deal room progression, partner drafts |

### Guard rails (unchanged from sales_cap DB table)
- `max_outreach_per_day = 3` (Moses-approved sends)
- `require_approval_for_drafts = 1` (ALL cold outreach requires Moses approval)
- `auto_approve_after_hours = 0` (never auto-approve)
- Transactional auto-sends capped at 15/day (conversion_funnel only: welcome + cart recovery)

### Bug fixed: approve never sent
`/api/sales/drafts` PATCH handler previously set `status='approved'` but never called Resend.
Fixed: approve now calls Resend immediately, updates `sent_at` + `message_id`, handles send failures gracefully (status='send_failed' so Moses can retry).

### Bug fixed: source whitelist too narrow
Original gate blocked sources other than `inbound_*` / `double_optin` / `manual`.
New agents use sources: `risk_snapshot`, `newsletter`, `docai_session`, `deal_room`, `cart_recovery`.
Fixed: expanded `OPT_IN_SOURCES` set to include all new agent sources.

### DB migration applied (20260716_revenue_agent_tables_v3)
- **Created**: `seo_citation_log` (AI engine citation tracking)
- **Extended**: `agent_runs` + `duration_ms`; `lead_nurture_state` + `risk_score`, `last_template`, `converted_at`; `partners` + `status`, `vertical`, `company`, `referral_count`, `revenue_generated_usd`

### Moses-only remaining
1. `$0.50` crypto test buy → prove IPN end-to-end at docai.bizlegal-ai.com
2. Review first batch of `/sales` drafts after agents run 07:00-09:00 UTC tomorrow
3. Plausible: create 7 domain properties (funnel is invisible until analytics fires)
4. Replace `[Moses's Full Name]` / `[J.D.]` placeholders in 3 byline articles, publish
5. Bank account wires in `/opt/bizlegal/curator/.env` (BIZLEGAL_BANK_ACCOUNT_1/2)
