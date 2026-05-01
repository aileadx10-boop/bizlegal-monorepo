# DASHBOARD_AGENT_PROMPT — Datadog-feel /ops upgrade (Phase Z5)

**Audience:** a fresh Claude Code agent session. Paste the master prompt below. Don't fire this prompt until **Z7 verification matrix is GREEN for 24 hours** — see `decisions/concurrent-bouncing-kitten.md` Z7.

**Estimated agent time:** ~2-3 days (medium-sized feature; lots of frontend polish).
**Moses time:** ~30 min (review the live PRs + flip the deploy).

---

## Master prompt — paste into a fresh Claude Code session

```
You are upgrading the BizLegal AI /ops live dashboard from a polling-fetch
single-page app into a Datadog-feel observability surface. The existing
implementation lives in apps/hub/app/ops/ + apps/hub/app/api/ops/{feed,health,log}/.

Read decisions/concurrent-bouncing-kitten.md for the canonical Phase Z plan,
then this doc, then CLAUDE.md at monorepo root. Do not modify any payment
code, any agent landing, or any event-type union — those are off-scope.

Your goal: make /ops feel like a real observability product. Specifically:

1. SERVER-SENT EVENTS (SSE) stream
   - New endpoint: apps/hub/app/api/ops/feed/stream/route.ts
   - Returns text/event-stream; pushes new ops_events as Supabase Realtime
     deltas hit. Token-gated by OPS_DASHBOARD_TOKEN (same as /api/ops/feed).
   - Initial GET: streams the most recent 50 events as the first batch,
     then keeps the stream open for new events.
   - Heartbeats every 30s as `: ping` comments to keep CF/Vercel from
     closing idle connections.
   - Client subscribes via EventSource; never re-fetches the whole feed.

2. TIME-SERIES SPARKLINES PER EVENT TYPE
   - Backend: extend /api/ops/feed with a `/api/ops/feed/series?bucket=hour&hours=24`
     endpoint that returns event counts per type bucketed by hour.
   - Frontend: use `recharts` (already in scope-friendly bundle) or
     `@nivo/sparkline` to render a tiny inline chart next to each event-type
     row in the existing summary table.
   - Click a sparkline → opens a drilldown panel showing the actual events
     in that bucket.

3. CLICKABLE SOURCE PILLS (drilldown filter)
   - Backend already supports ?source=<x> — implemented in PR #41 of
     bizlegal-ai. The feed query handles it.
   - Frontend: each source label in the events tape becomes clickable.
     Click → URL becomes /ops?t=$TOKEN&source=docai → feed re-fetches with
     the filter; pill becomes "active" with X to clear.
   - "All sources" pill clears the filter.

4. REVENUE / MRR WIDGET
   - Backend: extend /api/ops/feed summary with mrr_today_cents +
     mrr_24h_delta_cents + mrr_7d_array (7 daily values for sparkline).
     Compute from the payment_orders table by summing active subs
     (monthly + yearly/12) over each day.
   - Frontend: top-strip widget showing MRR + delta + 7-day sparkline.
     Color delta green if positive, red if negative.

5. FUNNEL WIDGET
   - Backend: extend /api/ops/feed summary with funnel_14d:
     { visitors, trials, paid }. Visitor count comes from
     lead.inbound + risk.assessment + agent.checkout events;
     trials from boi.subscribed status=trial + ai_act_subs + policy_refresh_subs;
     paid from payment.confirmed.
   - Frontend: 3-step funnel widget with conversion percentages
     (visitor→trial, trial→paid). Use Sankey or simple stepped bars.

6. FLEET HEALTH STRIP
   - Backend: reuse /api/ops/health summary fields (chain_healthy,
     subdomains_reachable, subdomain_envs_reachable, etc.).
   - Frontend: top of /ops, render an 8-dot strip (hub + 7 surfaces).
     Each dot green/red based on probe + env audit. Click a red dot
     → opens /ops/health?t=$TOKEN scrolled to that subdomain card.
   - Refresh every 60s independent of the events SSE stream.

7. PERFORMANCE GUARDRAILS
   - Never re-fetch the whole feed on a UI interaction.
   - Filter changes → server-side query, NOT client-side filter.
   - SSE stream is the only continuously-open connection.
   - First-paint TTI under 1.5s on a cold load.

Hard constraints:
- DO NOT change /api/ops/log (the HMAC ingress) — only read paths get touched.
- DO NOT add new event types to the OpsEventType union.
- DO NOT change apps/hub/app/agents/ pages.
- DO NOT touch payment code.
- ALL new env vars MUST be appended to the canonical vault FIRST per
  CLAUDE.md Section 5. Pre-commit hook enforces this.

Phase plan:
- D1: SSE stream backend + client EventSource swap. Verification: 50-event
  initial batch loads in under 200ms; sustained stream for 10 min with
  zero reconnect.
- D2: Sparklines + clickable source pills. Verification: each row in the
  summary table renders a sparkline; clicking a pill mutates the URL and
  the feed.
- D3: Revenue widget + funnel widget + fleet health strip. Verification:
  /ops/health drilldown works from a fleet-strip click; revenue numbers
  match Supabase pg_dump SUM(amount_cents) for active subs.

Verification gate (final):
- /ops loads in under 1.5s cold
- SSE stream survives 10 min idle
- Filter pills work and don't trigger full feed re-fetch
- Revenue numbers reconcile against Supabase
- Fleet health dots match /api/ops/health summary

If you hit a Supabase Realtime quota issue: fall back to 5s-poll on the
events tape but keep the SSE infrastructure for future scale. Do not
remove the stream endpoint just because Realtime is a Pro-tier feature.

End of master prompt.
```

---

## Why this prompt is gated on Z7

The current /ops dashboard works (it shipped in Phase O+P+Q+R+S+T+V0+V1+V2). The SSE upgrade adds polish, not new functionality. Building polish on an unstable base is the "moving in circles" trap Moses called out in Phase Z. So:

- Z0-Z7 must be GREEN
- Monorepo migration must be COMPLETE
- 24h observation period must show no regressions
- THEN this prompt fires

If Moses fires this prompt earlier and a Z0-Z7 dependency breaks, the dashboard work papers over the underlying issue. Don't.

---

## Future enhancements (not in this prompt)

These are deliberately out of scope to keep the agent's session focused:

- Alerting rules in-app (currently only Telegram via `/api/cron/ops-alerts`)
- Per-product P&L breakdown (needs cost data we don't track yet)
- Cohort analysis (needs sign-up timestamp + activation event chains)
- Mobile-responsive layout (nice-to-have; /ops is desktop-only now)
- White-label "/ops/<customer>" view (no customer asks for this yet)

Add to `decisions/AGENTS_BRAINSTORM_V2.md` as a future spear or treat as separate work post-revenue.
