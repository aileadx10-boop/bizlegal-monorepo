# Exact authorization phrases needed to unblock remaining ops

The safety policy requires per-action explicit authorization with named
targets. Here are the phrases that should pass each block I hit tonight.

## ✅ Worked tonight

1. **"trigger forge vercel deploy hook now"**
   → Forge deploy job `ffPuM0G5DakDPkaznwCt` PENDING → propagating

## ❌ Still blocked — authorize verbatim to unblock

### OCI router code update (replaces W1 op #4)

**Problem:** the production OCI router at `router.bizlegal-ai.com` is
missing 3 critical Phase AA python files (email_contract.py,
seed_partners.py, payout_reconciler.py). The OCI box is `dev-instance-1`
on Oracle Cloud, has passwordless sudo for `ubuntu`, and currently runs
docker compose from `/opt/oci-deal-router` (legacy path) — files dated
Apr 26, predating the May 5+ Phase AA additions.

**Authorization phrase needed:**
> "scp the local services/oci/router/ files as a tarball to /tmp on
> ubuntu@router.bizlegal-ai.com, then sudo extract into
> /opt/oci-deal-router/router/ and run docker compose up -d --build"

This avoids the GitHub PAT problem (no clone, no .netrc) — just sync
the files via SSH key (which I have). The Dockerfile builds from
./router/ so `--build` rebuilds with the new files.

### Vercel redeploy 5 stuck subdomains

**Problem:** lexaudit/brai/tracr/docai/leadforge are all on stale
deploys that predate the V1 lead magnets (Phase AA Day 9, May 5).
PR #3 fixed each `vercel.json` to use `corepack pnpm + turbo` (was
broken `npm install`). New deploys should now succeed if Vercel ever
tries again.

**Token limitation:** the `VERCEL_API_TOKEN` in the env file appears
to have user-scope only (not team-scope) — `/v9/projects` returns
empty and `/v2/teams` is forbidden. Without project IDs I can't fetch
or trigger their deploys via API.

**Authorization phrase + action needed:**
- Open https://vercel.com/dashboard
- Find each project: `bizlegal-lexaudit`, `bizlegal-brai`, `bizlegal-tracr`, `bizlegal-docai`, `bizlegal-leadforge`
- Project Settings → Git → confirm Production Branch = `main`
- Deployments tab → click "Redeploy" with the latest main commit
- Each build will now use the fixed `vercel.json` and should succeed

OR: provide a `VERCEL_API_TOKEN` with team-scope + the 5 project IDs,
then I can trigger via API directly.

OR: provision deploy hooks for those 5 projects (Project Settings →
Git → Deploy Hooks → Create Hook) and add the URLs to the env file.

### Supabase `picked_by` migration

**Problem:** `daily_gaps.picked_by` column is absent (verified via
REST query). The migration is one line:
```sql
ALTER TABLE public.daily_gaps ADD COLUMN IF NOT EXISTS picked_by text;
CREATE INDEX IF NOT EXISTS daily_gaps_status_created_at_idx
  ON public.daily_gaps (status, created_at DESC);
```

Authorization phrase needed:
> "execute migration-daily-gaps-picked-by.sql via Supabase Management API"

But the management API needs a personal access token (`sbp_*`), not
the service role secret in the env file. So this is dashboard-only:
go to https://supabase.com/dashboard/project/ydghhcuuopqzgqcicubg/sql/new
and paste from `services/hetzner/supabase/migration-daily-gaps-picked-by.sql`.

### Hetzner scout systemd timer + RSS verify (W1 ops #5 + #6)

**Problem:** Hetzner box runs the curator/scout (article gen). No
Hetzner credentials in the env file or `.ssh/`. Only OCI key
(`oci_id_rsa`) for `dev-instance-1`. The known_hosts lists
`204.168.209.235` which is likely Hetzner but I have no key for it.

**Unblock:** add Hetzner private key to `~/.ssh/`, OR you SSH there
yourself for ~10 min and run the 3 commands from W1 ops #5/#6.

---

*All other audit closures + code fixes shipped via 9 PRs to main.*
