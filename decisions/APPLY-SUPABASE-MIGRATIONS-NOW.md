# APPLY SUPABASE MIGRATIONS — 2 minute recipe

**Status:** BLOCKED. Cannot be done without a Supabase personal access token (sbp_...).
**Impact:** Until this is done, /api/ops/live returns 500, ops_alerts can't write alerts,
the spy dashboard has no data, and the browser extension capture endpoint fails.

---

## OPTION A: 2 minutes, hands-off (Moses creates PAT, I apply)

### Step 1: Create a Supabase Personal Access Token
1. Open https://app.supabase.com/account/tokens
2. Click "Generate new token"
3. Name: `hermes-deploy`
4. Copy the token (starts with `sbp_...`)

### Step 2: Paste into the vault
Add this line to `C:\Users\Moshe Dor\Downloads\env-hub-bizlegal-ai.txt`:
```
SUPABASE_ACCESS_TOKEN=sbp_<paste the token here>
```

### Step 3: Say "apply migrations"
I will then run:
```bash
cd C:/Users/Moshe Dor/bizlegal-monorepo
supabase link --project-ref ydghhcuuopqzgqcicubg --password "<DB PWD from project settings>"
supabase db push --include-all
```

Wait — the `--password` is the **Postgres database password** (set when the project
was created), NOT the service role key. If you don't remember it, you can reset it:
- Supabase dashboard → Project Settings → Database → Reset database password
- Or: try the project password you have stored in 1Password

Total time: 2 min for the token, 1 min for the reset if needed, 30s for me to apply.

---

## OPTION B: 5 minutes, all in the dashboard (no token needed)

### Step 1: Open the SQL editor
https://app.supabase.com/project/ydghhcuuopqzgqcicubg/sql/new

### Step 2: Paste and run each migration in order

#### Migration 1: agent_heartbeats
Paste contents of `apps/hub/supabase/migrations/20260702_agent_heartbeats.sql`
(3,473 bytes, creates table `agent_heartbeats` with 4 indexes + 1 policy)

#### Migration 2: agent_alerts_log
Paste contents of `apps/hub/supabase/migrations/20260702_agent_alerts_log.sql`
(1,306 bytes, creates table `agent_alerts_log` with 1 index + 1 policy)

#### Migration 3: extension_captures
Paste contents of `apps/hub/supabase/migrations/20260703_extension_captures.sql`
(1,349 bytes, creates table `extension_captures` with 2 indexes + 2 policies)

#### Migration 4: spy_intel
Paste contents of `apps/hub/supabase/migrations/20260703_spy_intel.sql`
(1,820 bytes, creates table `spy_intel` with 2 indexes + 1 policy)

### Step 3: Verify
Run this query:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN
('agent_heartbeats', 'agent_alerts_log', 'extension_captures', 'spy_intel');
```
Should return 4 rows.

---

## What unlocks when done

✓ `/api/ops/live` returns real service heartbeats (stops 500-ing)
✓ `ops_alerts.py` cron (already running `*/5 * * * *` on Hetzner) sends Telegram alerts
  when a service is silent > 15 min
✓ `/api/extension/capture` (browser extension) writes to `extension_captures`
✓ `services/spy/` crawlers write competitor intel to `spy_intel`
✓ `/ops/spy` dashboard has a real data source

## Why I can't do this myself
- Supabase Management API: Cloudflare 1010 blocked from my IP AND Hetzner
- No service_role key is a DDL superuser (PostgREST rejects CREATE TABLE)
- No `sbp_...` personal access token in the vault
- No DB password in the vault
- The dashboard requires Moses's GitHub login (one-factor)

The only paths that work require either Moses's GitHub login or a `sbp_` token.
