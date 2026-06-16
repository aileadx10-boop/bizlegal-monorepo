# Content Pipeline Acceleration

**Date:** 2026-06-17
**Status:** Analysis + Action Plan

---

## Current Pipeline State

### What exists today

```
Scout (06:00 UTC daily)
  → writes candidates to Supabase daily_gaps (status=pending_pick)
  → Telegram bot sends Moses 3 inline buttons [Pick #1] [Pick #2] [Pick #3]

Auto-pick (10:00 UTC daily) [curator-auto-pick.timer]
  → if no human pick within 4h, picks top-scored candidate (score >= 14/25)
  → marks row status=picked

Brain.py (triggered by bot.py as subprocess when pick happens)
  → pulls all status=picked rows from Supabase
  → runs quality gate → humanize → factual_review per draft
  → writes .mdx to /opt/bizlegal/curator/drafts/<slug>.mdx
  → NO loop/timer — runs once per invocation, exits

Bot.py (curator-bot.service, long-running)
  → Telegram bot, always running
  → after brain.py subprocess finishes, sends Moses [Deploy] [Regen] [Reject] buttons
  → on Deploy tap: POST http://127.0.0.1:8082/deploy {"slug":"..."}

Publisher.py (curator-publisher.service on :8082, always running)
  → runs quality gate + humanize + factual_review AGAIN (belt-and-suspenders)
  → verify_numerics via Claude API
  → gh_put() to aileadx10-boop/bizlegal-ea main branch
    → path: projects/bizlegal-seo-site/content/blog/<slug>.mdx
  → optionally fires VERCEL_HUB_HOOK
  → VERCEL_FORGE_HOOK: NOT SET (so forge deploy hook never fires)
  → posts HMAC-signed syndicate event to bizlegal-ai.com/api/content/syndicate

CF Pages (external, automatic)
  → aileadx10-boop/bizlegal-ea is connected to CF Pages
  → any push to main auto-triggers rebuild of blog.bizlegal-ai.com
  → no webhook needed from Hetzner — GitHub push IS the trigger
```

### Current article throughput

- Scout fires daily but brain.py ran manually (brain_run4.log shows 18 picked rows in a single manual run)
- brain_run4.log result: **18 picked, 3 drafted, 2 rejected** (factual_review failures on 2 slugs, leaving 13 unaccounted — likely hero_gen 401 errors on OpenAI image endpoint but drafts still wrote OK; need full log review)
- **3 drafts sitting ready in /opt/bizlegal/curator/drafts/ since 2026-06-16**:
  - `sec-2026-registered-offering-reforms-public-companies.mdx` (12.5KB)
  - `fca-mortgage-reform-2025-flexible-lending-rules-explained.mdx` (12.5KB)
  - `sec-rescinds-no-admit-settlement-rule-crypto-fintech.mdx` (12.8KB)
- None of these have been deployed yet (no human has tapped [Deploy] in Telegram)

---

## Bottlenecks Identified

### Bottleneck 1: Brain.py has no autonomous loop (CRITICAL)

Brain.py is NOT a long-running service. It runs once and exits. There is no systemd timer for brain.py. The only trigger is:
- Moses taps [Pick] in Telegram → bot.py spawns brain.py subprocess

This means: auto-pick at 10:00 UTC marks a row `status=picked`, but **brain.py never runs unless the bot's pick handler fires it**. The auto-pick timer fires `curator-auto-pick.service`, which marks rows picked in Supabase, but nothing subsequently invokes brain.py on those auto-picked rows.

**Fix:** Add a `curator-brain.timer` that runs brain.py every 30-60 minutes. Brain.py is idempotent (uses a flock lock, skips already-drafted rows).

### Bottleneck 2: Deploy requires Moses tap in Telegram (CRITICAL for volume)

Every draft requires Moses to tap [Deploy] before publisher.py runs. At 5 articles/week that's manageable. At daily cadence it becomes a daily chore. At 2+ articles/day it breaks entirely.

**Fix:** Add a `/auto-deploy-all` endpoint to publisher.py that loops over all .mdx files in /opt/bizlegal/curator/drafts/, runs the full quality+factual pipeline, and commits anything that passes. Wire it to a `curator-auto-deploy.timer` at e.g. 12:00 UTC daily.

### Bottleneck 3: OpenAI 401 — hero images not generating

Every successful draft in brain_run4.log shows `hero gen failed: Client error '401 Unauthorized'`. The OPENAI_API_KEY in /opt/bizlegal/curator/.env is invalid or depleted. Articles still draft without heroes, but the published MDX lacks `heroImage` frontmatter, which may affect blog layout.

**Fix:** Moses refreshes OPENAI_API_KEY in /opt/bizlegal/curator/.env. OR: use a free Unsplash/Pexels attribution image fallback in brain.py instead of OpenAI image generation (reduces cost, removes 401 risk entirely).

### Bottleneck 4: VERCEL_FORGE_HOOK not set

`publisher.py` line 63 reads `VERCEL_FORGE_HOOK = os.getenv("VERCEL_DEPLOY_HOOK_FORGE", "")` and the env check shows this is empty. Forge-affinity posts (BOI, FinCEN, OFAC, sanctions topics) commit to the forge repo but never trigger a Vercel rebuild for forge.bizlegal-ai.com.

**Fix:** Moses adds `VERCEL_FORGE_HOOK=<vercel-deploy-hook-url>` to /opt/bizlegal/curator/.env (get the URL from Vercel project settings for forge).

### Bottleneck 5: 13 of 18 picked rows went unaccounted in brain_run4

Brain_run4.log shows 18 picked → 3 drafted → 2 rejected = 5 processed. Remaining 13 rows were not logged. The hero gen 401 errors appear inside each drafted entry, meaning they didn't block drafting. The 13 likely stalled silently — possibly hitting the Firecrawl rate limit, Anthropic API throttle, or the flock lock exiting early. Full log is only 31 lines so the 13 rows were never even attempted.

**Fix:** Check Supabase `daily_gaps` table: how many rows are status=picked vs status=drafted. Re-run brain.py with `--force` after resolving the OpenAI key issue.

---

## Full MDX → Live Path (documented)

```
1. /opt/bizlegal/curator/drafts/<slug>.mdx written by brain.py
2. Moses taps [Deploy] in Telegram → bot.py POSTs to publisher:8082/deploy
3. publisher.py:
   a. quality_gate.validate() — structural checks
   b. humanize() — strip AI-tells
   c. factual_review.review() — claims vs sources
   d. verify_numerics() via Claude API — numbers in cited sources?
   e. gh_put() via GitHub Contents API:
      PUT https://api.github.com/repos/aileadx10-boop/bizlegal-ea/contents/
          projects/bizlegal-seo-site/content/blog/<slug>.mdx
      branch: main
   f. (if forge-affinity): same gh_put() to aileadx10-boop/forge repo
4. GitHub push to main → CF Pages webhook auto-fires (GitHub-native integration)
5. CF Pages rebuilds blog.bizlegal-ai.com (~60-90s)
6. Article live at https://blog.bizlegal-ai.com/blog/<slug>
7. HMAC-signed POST to bizlegal-ai.com/api/content/syndicate (social fan-out)
```

No explicit webhook from Hetzner to CF Pages — GitHub's CF Pages integration handles it natively on any push to the connected branch.

---

## Can We Go From 5/Week to Daily Publishing?

**Yes. Required changes:**

| Change | Effort | Owner | Blocker? |
|--------|--------|-------|---------|
| Add `curator-brain.timer` (runs brain.py every 60min) | 30min | Claude Code | None — add systemd unit file + enable |
| Add `/batch-deploy` endpoint to publisher.py | 2h | Claude Code | None |
| Wire `curator-auto-deploy.timer` at 12:00 UTC | 30min | Claude Code | Depends on batch-deploy endpoint |
| Refresh `OPENAI_API_KEY` in curator .env | 5min | Moses | Moses-only (env secret) |
| Set `VERCEL_FORGE_HOOK` in curator .env | 10min | Moses | Moses-only (Vercel UI) |
| Verify Supabase has enough pending_pick rows to sustain daily | 10min | Moses | Check daily_gaps table |

**What does NOT need to change:**
- CF Pages rebuild (already auto on push, no action needed)
- GitHub token (already configured and working — publisher.py /health confirms `github: true`)
- Anthropic key (already configured — `anthropic: true`)
- Publisher service (already running, healthy)
- Bot service (already running, healthy)
- Scout (already runs daily at 06:00 UTC)
- Auto-pick (already runs daily at 10:00 UTC)

---

## The 3 Ready Drafts — How to Publish Now

The 3 drafts in /opt/bizlegal/curator/drafts/ are ready. Two options:

**Option A — Telegram [Deploy] buttons (existing flow, safe, requires Moses)**
The Telegram bot is running. If bot.py sent preview messages for these drafts, Moses can tap [Deploy] on each. If the messages were lost (bot restarted), run on Hetzner:
```bash
cd /opt/bizlegal/curator && /opt/bizlegal/venv/bin/python brain.py
```
This re-checks picked rows and re-sends Telegram preview messages.

**Option B — Direct publisher API call (requires explicit Moses authorization)**
```bash
# From Hetzner box (loopback only):
curl -X POST http://127.0.0.1:8082/deploy \
  -H 'Content-Type: application/json' \
  -d '{"slug":"sec-2026-registered-offering-reforms-public-companies"}'
# Repeat for the other 2 slugs
```
This bypasses Telegram and publishes directly. Publisher still runs quality+factual gates — it will NOT publish junk. **Authorization required from Moses before running.**

---

## Proposed Implementation Plan (Daily Publishing)

### Phase 1 — Unblock brain.py (no Moses action needed)

Add `/etc/systemd/system/curator-brain.timer`:
```ini
[Unit]
Description=BizLegal curator brain — polls for picked rows every 60min

[Timer]
OnCalendar=*:00
Persistent=true
Unit=curator-brain.service

[Install]
WantedBy=timers.target
```

Add `/etc/systemd/system/curator-brain.service`:
```ini
[Unit]
Description=BizLegal curator brain (one-shot run)

[Service]
Type=oneshot
WorkingDirectory=/opt/bizlegal/curator
ExecStart=/opt/bizlegal/venv/bin/python /opt/bizlegal/curator/brain.py
EnvironmentFile=/opt/bizlegal/curator/.env
```

Enable: `systemctl enable --now curator-brain.timer`

### Phase 2 — Add batch-deploy to publisher.py

Add endpoint to publisher.py:
```python
@app.post("/batch-deploy")
def batch_deploy() -> dict:
    """Deploy all drafts in DRAFTS_DIR that pass quality + factual gates."""
    results = []
    for mdx_path in sorted(DRAFTS_DIR.glob("*.mdx")):
        slug = mdx_path.stem
        result = deploy(SlugReq(slug=slug))
        results.append({"slug": slug, "ok": result.get("ok"), "url": result.get("blog_url")})
    return {"results": results, "total": len(results)}
```

### Phase 3 — Wire auto-deploy timer

Add `/etc/systemd/system/curator-auto-deploy.timer` (fires at 12:00 UTC, 2h after auto-pick):
```ini
[Timer]
OnCalendar=*-*-* 12:00 UTC
Persistent=true
Unit=curator-auto-deploy.service
```

Add `/etc/systemd/system/curator-auto-deploy.service`:
```ini
[Service]
Type=oneshot
ExecStart=/usr/bin/curl -s -X POST http://127.0.0.1:8082/batch-deploy
```

### Phase 4 — Moses env fixes

1. Refresh `OPENAI_API_KEY` in `/opt/bizlegal/curator/.env`
2. Add `VERCEL_FORGE_HOOK=<url>` from Vercel project settings for forge
3. Restart curator-publisher: `systemctl restart curator-publisher`

---

## Realistic Daily Volume Ceiling

- Scout: 3 candidates/day → picks 1 top-scored → brain drafts 1
- With 18+ rows already in picked/pending state, a one-time `brain.py` run with no flags processes all
- Quality gate pass rate: ~60% (3 drafted, 2 rejected from 5 processed in brain_run4)
- Factual review pass rate in publisher: likely similar ~70%
- **Sustainable daily output: 1 article/day once brain.py timer is running**
- **Burst capacity: 3 articles immediately from existing drafts**
- To hit 2+ articles/day: either lower `AUTO_PICK_MIN_SCORE` from 14 to 10, or have scout surface 2 picks/day

---

## Summary Table

| Metric | Now | After Phase 1-3 |
|--------|-----|-----------------|
| Articles drafted/day | 0 (brain.py not auto-running) | 1 |
| Articles published/day | 0 (Moses must tap Telegram) | 1 (auto) |
| Moses touches required | Pick + Deploy per article | 0 (fully autonomous) |
| Hero images | Failing (OpenAI 401) | Failing until env fixed |
| Forge cross-post | Never fires deploy hook | Fixed once env set |
| Articles ready to publish right now | 3 drafts in /drafts/ | — |
