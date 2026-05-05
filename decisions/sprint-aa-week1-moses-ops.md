# Phase AA Week 1 — Moses ops queue

**Last updated:** 2026-05-08 (end of Day 5)
**Owner:** Moses (or a sub-agent acting on Moses's behalf)
**Why this exists:** Day 1-5 shipped all the code that can be shipped autonomously. The items below need a human (or an agent with write access to specific external systems) — apply migrations, redeploy services, run partner outreach. Each section is self-contained: copy-paste the commands; expected output is shown so you can verify.

Run these in any order **except** that #1 (picked_by migration) should land before #5 (Hetzner systemd cadence change), because auto_pick.py logs picked_by once the column exists.

## Quick status board

| # | Item | Time | Blocking | Status |
|---|---|---|---|---|
| 1 | Apply `picked_by` migration to Supabase | 2 min | Hetzner cadence quality of life | ☐ |
| 2 | Redeploy 5 subdomains on Vercel | 10 min | Subdomain nurture-enqueue | ☐ |
| 3 | Redeploy worker (already done by automation D4) | — | — | ✅ |
| 4 | Move OCI router to monorepo path on Hetzner | 15 min | OCI re-deploys cleanly | ☐ |
| 5 | Update Hetzner scout systemd timer to daily cadence | 5 min | Scout already running M/W/F | ☐ |
| 6 | Verify replacement RSS feeds + restart scout | 5 min | Adds 3 new feeds | ☐ |
| 7 | OCI partner outreach — send 3-5 emails | 30-60 min | OCI revenue channel | ☐ |
| 8 | Lighthouse drill — fix brai SEO 91→100 | 60 min | Optional polish | ☐ |
| 9 | Rotate the Anthropic API key found as a worker secret | 15 min | Security | ☐ |

---

## 1. Apply `picked_by` migration

**Why:** `auto_pick.py` writes a `picked_by` column to track manual-vs-auto picks for analytics. The script falls back to writing without the column, so this is non-blocking — but if you want analytics, apply it.

**Where:** Supabase project `ydghhcuuopqzgqcicubg` → SQL Editor.

**How:**

```sql
-- file: services/hetzner/supabase/migration-daily-gaps-picked-by.sql
ALTER TABLE public.daily_gaps
  ADD COLUMN IF NOT EXISTS picked_by text;

COMMENT ON COLUMN public.daily_gaps.picked_by IS
  'Who picked this batch into curation: manual_telegram, auto_pick, or null if not picked';

-- Optional partial index for "show me everything auto_pick has touched":
CREATE INDEX IF NOT EXISTS idx_daily_gaps_picked_auto
  ON public.daily_gaps (status, created_at DESC)
  WHERE picked_by = 'auto_pick';
```

**Verify:**

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'daily_gaps' AND column_name = 'picked_by';
-- expect 1 row
```

---

## 2. Redeploy 5 subdomains on Vercel

**Why:** Day 3 added `enqueueNurture` calls to forge / brai / docai / lexaudit / tracr lead-capture routes. The code is on `main` but the production builds are pre-Day-3. Until each subdomain redeploys, those leads still won't trigger nurture sequences.

**Where:** https://vercel.com → each of the 5 projects.

**How (per project):**

1. Open the project in Vercel.
2. Click **Deployments** → **Redeploy** on the latest `main` deployment.
3. Confirm with **Redeploy without cache**.

(Or: trigger by pushing an empty commit. We don't recommend that — clutters git history.)

**Vercel projects to redeploy:**
- `forge.bizlegal-ai.com` — `apps/forge/apps/web`
- `brai.bizlegal-ai.com` — `apps/brai`
- `docai.bizlegal-ai.com` — `apps/docai/web`
- `lexaudit.bizlegal-ai.com` — `apps/lexaudit`
- `tracr.bizlegal-ai.com` — `apps/tracr`

**Verify (per subdomain):** after deploy completes, post a synthetic lead and check Supabase `lead_nurture_state` for a fresh row:

```bash
curl -X POST "https://<subdomain>.bizlegal-ai.com/api/inbound-lead" \
  -H "x-bizlegal-signature: $(echo -n '{...your test body...}' | openssl dgst -sha256 -hmac "$BIZLEGAL_INBOUND_SECRET" -hex | awk '{print $2}')" \
  -H "content-type: application/json" \
  -d '{"schema_version":"1.0","classification":{"product":"<vertical>","confidence":0.9,"reason":"smoke"},"lead":{"lead_id":"smoke-2026-05-08-<vertical>","contact":{"email":"moses+smoke@bizlegal-ai.com"}}}'

# Then check Supabase:
SELECT lead_id, vertical, next_step, next_send_at
FROM lead_nurture_state
WHERE source LIKE '%inbound-lead%'
ORDER BY captured_at DESC
LIMIT 5;
```

**Note:** if any subdomain returns `nurture_enqueue_failed`, it means either `SUPABASE_URL` or `SUPABASE_SECRET` env var is missing on that Vercel project — add them in the project's **Environment Variables** tab and redeploy again.

---

## 3. Worker redeploy

**Already done.** Automation deployed `bizlegal-lead-intake` version `5638d916` on Day 4. Skip.

If for any reason you need to re-trigger:

```bash
cd "C:/Users/Moshe Dor/bizlegal-monorepo/services/worker"
npx wrangler deploy
```

---

## 4. Move OCI router to monorepo path on Hetzner

**Why:** OCI router currently runs from legacy `/opt/oci-deal-router/`. The monorepo path is `/opt/bizlegal-monorepo/services/oci/`. This sprint adds `email_contract.py` and `seed_partners.py` — they live in the monorepo, not the legacy clone. We need the running router to be the monorepo version so the new lead-facing referral-contract email actually fires.

**Where:** Hetzner box (the one running OCI).

**How:**

```bash
# 1) Pull latest monorepo
ssh hetzner    # or however you SSH in
sudo -i

# 2) Confirm monorepo present, pull main
cd /opt/bizlegal-monorepo
git status
git pull origin main

# 3) Rebuild + restart from the new location
cd /opt/bizlegal-monorepo/services/oci
docker compose pull
docker compose up -d --remove-orphans

# 4) Update systemd unit to point at the new working directory
#    (the unit file is committed at services/oci/systemd/deal-router.service —
#    diff it against /etc/systemd/system/deal-router.service first.)
sudo cp /opt/bizlegal-monorepo/services/oci/systemd/deal-router.service \
        /etc/systemd/system/deal-router.service

# Edit /etc/systemd/system/deal-router.service so WorkingDirectory points to
# /opt/bizlegal-monorepo/services/oci (not /opt/oci-deal-router):
sudo sed -i 's|WorkingDirectory=/opt/oci-deal-router|WorkingDirectory=/opt/bizlegal-monorepo/services/oci|' \
        /etc/systemd/system/deal-router.service

sudo systemctl daemon-reload
sudo systemctl restart deal-router

# 5) Confirm health
curl -s http://localhost:8080/health | jq .
# expect: {"ok": true, "version": "v1.0.0-p1", "redis": "up", "supabase": "up"}

# 6) Once you've confirmed the new path is serving, retire the legacy path:
sudo systemctl stop /opt/oci-deal-router/* || true
# (keep the directory around for a week before deleting — has logs we may want)
```

**Verify:** post a synthetic lead and check `/api/ops/feed` for `referral.contract_email` events:

```bash
TOKEN=$(grep '^OPS_DASHBOARD_TOKEN=' "/c/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt" | cut -d= -f2-)
T_ENC=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote_plus(sys.argv[1]))" "$TOKEN")
curl -s "https://bizlegal-ai.com/api/ops/feed?token=$T_ENC&type=referral.contract_email&limit=5" | jq .
# expect: events array (empty until the first ROUTE_PARTNER lead lands)
```

---

## 5. Update Hetzner scout systemd timer to daily cadence

**Why:** The scout (curator) has been running Mon/Wed/Fri only. Phase AA wants daily article cadence. The committed timer file at `services/hetzner/systemd/curator-scout.timer` is already set to daily; this step is just deploying it.

**Where:** Hetzner box (the one running curator).

**How:**

```bash
ssh hetzner
sudo -i

cd /opt/bizlegal-monorepo
git pull origin main

# Compare the desired (committed) timer to what's running:
diff -u /etc/systemd/system/curator-scout.timer \
        /opt/bizlegal-monorepo/services/hetzner/systemd/curator-scout.timer

# Apply:
sudo cp /opt/bizlegal-monorepo/services/hetzner/systemd/curator-scout.timer \
        /etc/systemd/system/curator-scout.timer
sudo systemctl daemon-reload
sudo systemctl restart curator-scout.timer

# Also activate the new auto_pick units (committed at the same path):
sudo cp /opt/bizlegal-monorepo/services/hetzner/systemd/curator-auto-pick.* \
        /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now curator-auto-pick.timer

# Verify:
systemctl list-timers | grep curator
# expect: curator-scout.timer (next ~06:00 UTC daily)
#         curator-auto-pick.timer (next ~10:00 UTC daily)
```

---

## 6. Verify replacement RSS feeds + restart scout

**Why:** Day 5 added 3 new feeds (CISA cybersecurity advisories, CFTC enforcement, NIST news) to `services/hetzner/scout.py`. Confirm they parse cleanly on the live box before the next scout run.

**How:**

```bash
ssh hetzner
sudo -i
cd /opt/bizlegal-monorepo/services/hetzner

# Pull latest
git pull origin main

# Smoke-test the 3 new feeds via Python (same lib scout uses):
python3 -c "
import feedparser
for url in [
  'https://www.cisa.gov/cybersecurity-advisories/all.xml',
  'https://www.cftc.gov/RSS/RSSENF/rssenf.xml',
  'https://www.nist.gov/news-events/news/rss.xml',
]:
  f = feedparser.parse(url)
  print(f'{url}: {len(f.entries)} entries')
"
# expect: 3 lines, each with ≥10 entries

# Force a scout run now (rather than waiting for tomorrow 06:00 UTC):
sudo systemctl start curator-scout.service
sudo journalctl -u curator-scout.service -n 80 --no-pager
# expect: "[scout] fetched N items across 5 feeds" — N should be ~12-15
```

If a feed shows 0 entries on the box but worked on your laptop, the most likely cause is the box hitting a different geo-IP that's blocked. Drop that feed back out of `scout.py` and pick another — the `decisions/.planning/codebase/` baseline doc lists candidates we tested.

---

## 7. OCI partner outreach — send 3-5 emails

**Why:** The OCI router has a placeholder partner that catches every route, but $0 commissions. To start earning real referral revenue, we need 3-5 active partners across UAE / SG / US jurisdictions.

**What to send:** plain-text email, not formatted, sent personally. The router doesn't need partners to integrate — they just need to be willing to engage a referred lead and pay a finder fee on close.

**Email template** (subject + body — replace bracketed parts):

> **Subject:** Inbound-lead referral, finder-fee basis — [PARTNER FIRST NAME], BizLegal-AI Intelligence
>
> Hi [PARTNER FIRST NAME],
>
> Moses here from BizLegal-AI Intelligence. We run an autonomous regulatory-intelligence platform that classifies inbound leads (UAE real-estate, SG business setup, EU/US compliance, etc) and routes the high-fit ones to specialist partners.
>
> Given your work in [JURISDICTION + SPECIALTY — pulled from their site/LinkedIn], you'd be a natural fit for our [UAE_REAL_ESTATE / SG_BUSINESS_SETUP / EU_US_BUSINESS] track. We currently route 3-8 qualified leads/week in your bucket; finder fee is typically 10-20% of first-year fees, payable on close, with full transparency to the lead (we disclose the relationship in writing).
>
> No platform integration needed. We email the lead a transparent intro to you (template attached if you want to see it), then step out — you set scope, fees, and engagement directly.
>
> Two things if interested:
> 1. Reply with the jurisdictions + matter types you'd want routed.
> 2. A weekly cap (we default to 5/week; some partners take more, some less).
>
> If not your cup of tea, no problem — feel free to forward to a colleague. Either way thanks for reading.
>
> — Moses
> BizLegal-AI Intelligence
> mdmdmd63@gmail.com

**Sourcing:** if you don't have a list yet, here's a fast 30-min sourcing pass:
- LinkedIn search: `"real estate lawyer" Dubai`, `"business setup" Singapore`, `"regulatory counsel" New York` — pick 3-5 with public emails or contact forms.
- Or replies from past inbound — anyone who's already DM'd asking about partnership.
- Aim for **diversity of jurisdiction**, not 5 from the same market.

**Once a partner says yes:** seed them via the script.

```bash
ssh hetzner
sudo -i
cd /opt/bizlegal-monorepo/services/oci/router

# Load the env (router has SUPABASE_URL + SUPABASE_SECRET in its .env):
set -a; source ../.env; set +a   # adjust path if your .env lives elsewhere

# Run interactively — answer the prompts:
python3 seed_partners.py
# follow the prompts: name, email, type, jurisdictions, tier, weekly_cap, active=Y
```

**Verify** (after seeding):

```sql
SELECT id, name, email, type, jurisdictions, tier, weekly_cap, active
FROM partners
ORDER BY tier ASC, name;
-- expect: at least 1 row (placeholder) + each new partner you've seeded
```

---

## 8. Lighthouse drill — fix brai SEO 91 → 100 (optional polish)

**Why:** Day 1 + Day 4 baselines both have brai at SEO 91 while every other subdomain is at 100. Diagnostic is a 1-hour task; not blocking sprint goals.

**How:**

```bash
# Generate the HTML report so you can see which audits failed:
LH_OUT=$(cygpath -w /tmp/brai-seo.html)
npx --yes lighthouse https://brai.bizlegal-ai.com \
  --only-categories=seo \
  --output=html --output-path="$LH_OUT" \
  --quiet --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage"

# Open the HTML report:
start "$(cygpath -w /tmp/brai-seo.html)"
```

In the **SEO** section, look at the **Failed audits** list. Likely culprits in priority order: `meta-description`, `link-text` (anchors say "click here" instead of describing destination), `crawlable-anchors` (anchor missing href or has invalid value), `tap-targets` (interactive elements too close together on mobile).

Fix in `apps/brai/app/`:

- **meta-description**: ensure `app/layout.tsx` exports `metadata.description` ≥ 50 chars.
- **link-text**: scan `<a>` and `<Link>` for "click here" / "learn more" — replace with descriptive text.
- **crawlable-anchors**: every `<a>` needs a real `href` (not `#` or `javascript:`).
- **tap-targets**: bump CTA buttons to ≥ 48px height with `min-height` + ample padding.

After commit + push + Vercel redeploy, re-run lighthouse:

```bash
npx --yes lighthouse https://brai.bizlegal-ai.com \
  --only-categories=seo --quiet \
  --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage" \
  --output=json --output-path="$(cygpath -w /tmp/brai-seo-after.json)"
node -e "console.log(JSON.parse(require('fs').readFileSync(process.env.LH).toString()).categories.seo.score * 100)" LH=/c/Users/MOSHED~1/AppData/Local/Temp/brai-seo-after.json
# expect: 100
```

---

## 9. Rotate the Anthropic API key

**Why:** Day 1 GSD security audit flagged a leaked Anthropic API key as a worker secret name. Rotation is overdue — keys live ~30-90 days under best practice.

**How:**

1. **Anthropic console** → https://console.anthropic.com/settings/keys
2. **Create new key**, copy it once.
3. **Update on the worker:**
   ```bash
   cd "C:/Users/Moshe Dor/bizlegal-monorepo/services/worker"
   wrangler secret put ANTHROPIC_API_KEY
   # paste the new key when prompted
   ```
4. **Update on Hetzner** (curator + OCI):
   ```bash
   ssh hetzner
   sudo -i
   # Edit the canonical env file:
   nano /opt/bizlegal-monorepo/.env   # or wherever ANTHROPIC_API_KEY lives
   # Replace the value, save.
   sudo systemctl restart curator-brain.service curator-scout.service
   cd /opt/bizlegal-monorepo/services/oci && docker compose restart
   ```
5. **Update Moses's local file:**
   ```bash
   nano "/c/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt"
   # update ANTHROPIC_API_KEY=...
   ```
6. **Revoke the old key** in the Anthropic console.

**Verify:**

```bash
# Worker — emit a test cron event and confirm Haiku call succeeds:
curl -s "https://bizlegal-ai.com/api/ops/feed?token=$T_ENC&type=cron.completed&limit=3" | jq .
# expect: ok statuses, no auth errors
```

---

## When you're done

Once items 1, 2, 4, 5, 6, 7 are checked off:

1. Run the **synthetic 7-day nurture arc** to prove the V3 pipeline works end-to-end:
   ```bash
   cd "C:/Users/Moshe Dor/bizlegal-monorepo/services/worker"
   export SUPABASE_URL=$(grep '^SUPABASE_URL=' "/c/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt" | cut -d= -f2-)
   export SUPABASE_SECRET=$(grep '^SUPABASE_SECRET=' "/c/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt" | cut -d= -f2-)
   node scripts/synthetic-nurture-arc.mjs --email moses+arc@bizlegal-ai.com --vertical brai --cleanup
   ```
   Expect: 4 emails arrive at `moses+arc@bizlegal-ai.com` over ~5-10 minutes (the script fast-forwards `next_send_at` so it doesn't actually take 7 days). Final state: `next_step=done, emails_sent=4, archived_at` set.

2. Mark the queue items above as ✅ in this file and commit.

If any step fails, paste the error output back to me and we'll debug it.
