# Secret rotation — GitHub PAT + PayPal CLIENT_SECRET

**Decision:** ROTATE BOTH. Both were in `env-bizlegal04-26.txt` (in Downloads), which I read during this AI session. Best-practice baseline says rotate after any exposure event, even if the exposure is to a trusted assistant. ~10 min total work.

---

## 1. GitHub PAT (~5 min)

The classic PAT `ghp_[REDACTED — see canonical vault]` was in the env file and is currently used by:
- EA Worker for blog factory commits to `aileadx10-boop/bizlegal-ea`
- Possibly the canonical-env-clean.env on this machine

### Step-by-step

1. **Go to** https://github.com/settings/tokens?type=classic
2. **Find** the token with name like "Workspace token" or whatever you named it (you can also look for "last used: today" since I just used it for `gh pr merge` calls).
3. Click **Revoke** → confirm.
4. **Create new fine-grained token** at https://github.com/settings/personal-access-tokens/new (Github recommends fine-grained over classic now):
   - Token name: `bizlegal-fleet-2026-04-28`
   - Expiration: 90 days
   - Resource owner: `aileadx10-boop`
   - Repositories: select these 8 (or "All repositories" if simpler):
     - `bizlegal-ai`, `BRAI`, `lexaudit`, `trcr`, `docai-monorepo`, `leadforge-ai`, `forge`, `bizlegal-ea`
   - Repository permissions:
     - **Contents:** Read and write
     - **Pull requests:** Read and write
     - **Metadata:** Read-only (auto)
     - **Workflows:** Read and write (for the GitHub Actions in `bizlegal-ea`)
   - Generate token. Copy the new `github_pat_...` value.
5. **Propagate the new token** to:
   - **EA Worker:** `cd "C:/Users/Moshe Dor/Downloads/SKOOL-NATE/executive assistant/projects/bizlegal-lead-intake" && wrangler secret put GITHUB_TOKEN` → paste new value.
   - **Local canonical env:** `~/.claude/canonical-env-clean.env` line `GITHUB_TOKEN=...` → replace.
   - **Local gh CLI:** `gh auth logout` then `gh auth login --with-token` and paste, OR `gh auth refresh -h github.com -s repo,workflow`.
   - **Vercel:** check each project's env vars for `GITHUB_TOKEN`. If present, replace; if absent, leave alone (most hub/product runtimes don't need it).

6. **Verify:**
   ```bash
   gh auth status
   # Logged in to github.com as aileadx10-boop (...)
   gh repo view aileadx10-boop/bizlegal-ai --json url
   # Should return URL — confirms new token works
   ```

---

## 2. PayPal Live CLIENT_SECRET (~5 min)

The live secret `EAPG3dwXJsBr0XuY5ZP_8jEsRGKxTmX1uhSrkaxfg9vRnl76lUR7yKCzQxjleYMENTblReT5yHQauk0l` was in the env file. PayPal allows generating a new secret on the same app (no need to delete + recreate).

### Step-by-step

1. **Go to** https://developer.paypal.com/dashboard/applications/live
2. **Click your live app** (the one with CLIENT_ID `ARaoPfEvLONXdzftzmAWmwibmEV-OqtF01uDLDEULJCLEB16AZzjStGifN7Xy_dSdmtzrJgsUQiv2SOn`).
3. **Find the "Secret keys" or "Credentials" section** — should show your current Secret with a "Generate new" or "Rotate" action.
4. Click **Generate new secret**. PayPal warns that the OLD secret will continue working for ~24h to allow rollover, then is invalidated.
5. **Copy the new secret value.**
6. **Update Vercel hub env:** Settings → Environment Variables → `PAYPAL_CLIENT_SECRET` → paste new value → Save.
7. **Also update** the same key on each Vercel product project where it appears:
   - `bizlegal-ai` (hub)
   - `tracr`, `brai`, `lexaudit`, `docai-monorepo`, `leadforge-ai`, `forge`
   - Any project where the env was bulk-imported.
8. **Trigger redeploys** on every project so the new secret takes effect:
   - vercel.com → each project → Deployments → "Redeploy" latest.
9. **Update the local canonical env** file: `~/.claude/canonical-env-clean.env` and `Downloads/env-bizlegal04-26.txt` (or rename/delete the old file once you've confirmed nothing else depends on it).

### Verify

```bash
# A test call to PayPal OAuth with the new secret should return an access token:
curl -sk -X POST https://api-m.paypal.com/v1/oauth2/token \
  -H "Authorization: Basic $(echo -n 'CLIENT_ID:NEW_SECRET' | base64 -w0)" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" | jq '.access_token'
# Should return a token string (truncated). If 401 -> secret wrong.
```

---

## 3. Why these two specifically (and what about the others)

The env file also contained:
- `BIZLEGAL_INBOUND_SECRET` (HMAC for inter-service POSTs) — I generated this in our earlier session and it's actively in use across hub + 6 products + Worker + OCI router. Rotating means a 30-second skew window where some services have new and some old → leads silently drop. **Skip rotating this unless you suspect a leak.**
- `ANTHROPIC_API_KEY` — used by hub + every product. Anthropic has spend caps so rotation is low priority. **Skip unless suspect.**
- Supabase service-role keys — already migrated to the new `sb_secret_*` format last session. Already as fresh as they get. **Skip.**
- NOWPayments API key — would require recreating products (if you'd created any in the dashboard). On-demand invoice pattern means rotation is cheap, but no exposure beyond this session. **Skip unless suspect.**
- Telegram bot tokens (HUBBOT, FORGEBOT) — exposure is "someone could send messages from your bot"; not high-impact. **Skip unless suspect.**

The two I flagged are the only ones with real downstream blast radius (GitHub PAT can write code; PayPal secret can move money). Rotate those, leave the rest.

---

## 4. After rotation

Update `decisions/RECOVERY.md` action log on `bizlegal-ea`:
```
2026-04-28 HH:MM | rotated GitHub PAT (90d) + PayPal Live CLIENT_SECRET | post-AI-session hygiene
```

Done.
