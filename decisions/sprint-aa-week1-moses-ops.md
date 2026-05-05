# Phase AA Week 1 — Moses ops queue

**Last updated:** 2026-05-11 (end of Day 8)
**Owner:** Moses (or a sub-agent acting on Moses's behalf)
**Why this exists:** Days 1-6 shipped all the code that can be shipped autonomously. The items below need a human (or an agent with write access to specific external systems) — apply migrations, redeploy services, run partner outreach. Each section is self-contained: copy-paste the commands; expected output is shown so you can verify.

Run these in any order **except** that #1 (picked_by migration) should land before #5 (Hetzner systemd cadence change), because auto_pick.py logs picked_by once the column exists.

## Quick status board

| # | Item | Time | Blocking | Status |
|---|---|---|---|---|
| 1 | Apply `picked_by` migration to Supabase | 2 min | Hetzner cadence quality of life | ☐ |
| 2 | Redeploy 5 subdomains on Vercel | 10 min | Subdomain nurture-enqueue + Forge payment migration + decision-tree | ☐ |
| 3 | Redeploy worker (already done by automation D4) | — | — | ✅ |
| 4 | Move OCI router to monorepo path on Hetzner | 15 min | OCI re-deploys cleanly + Day-6 email_contract + payout digest | ☐ |
| 5 | Update Hetzner scout systemd timer to daily cadence | 5 min | Scout already running M/W/F | ☐ |
| 6 | Verify replacement RSS feeds + restart scout | 5 min | Adds 3 new feeds | ☐ |
| 7 | OCI partner outreach — send 3-5 emails | 30-60 min | OCI revenue channel | ☐ |
| 8 | Lighthouse drill — fix brai SEO 91→100 | 60 min | Optional polish | ☐ |
| 9 | Rotate the Anthropic API key found as a worker secret | 15 min | Security | ☐ |
| 10 | `pnpm install` in repo root after Forge payment-pkg dep landed (D6) | 1 min | Forge build needs workspace link | ☐ |
| 11 | Wire `oci_close.py` into Telegram (or alias on Hetzner) (D6) | 5 min | Optional revenue-tracking ergonomics | ☐ |
| 12 | Add `payout-digest.timer` weekly to Hetzner systemd (D6) | 5 min | OCI weekly Telegram digest | ☐ |
| 13 | Run synthetic-nurture-arc against post-fixes worker (D6 EVAL fixes) | 8 min | Verify single-anchor + word-count guards | ☐ |
| 14 | Apply `lead_nurture_state` quarantine column migration (D7 INTEGRATION-V3 B-4) | 3 min | Stops perpetual Haiku-violation retry loops | ☐ |
| 15 | Decide cross-vertical email policy (D7 INTEGRATION-V3 B-5) | 15 min | Spam-complaint risk if a single email opts into multiple verticals | ☐ |
| 16 | Confirm TRACR decision-tree page renders post-redeploy (D7 V1 magnet #2) | 2 min | New URL `/decision-tree` on tracr subdomain | ☐ |
| 17 | `pnpm install` after `@bizlegal/nurture-enqueue` workspace link added (D8) | 1 min | New shared package — Vercel handles in #2 redeploy | ☐ |
| 18 | Confirm DocAI decision-tree page renders post-redeploy (D8 V1 magnet #3) | 2 min | New URL `/decision-tree` on docai subdomain | ☐ |
| 19 | Worker redeploy after D8 race fix + B-4 quarantine + F-1 (D8) | 1 min | `wrangler deploy` from services/worker — automation handles | ☐ |

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

---

## 10. `pnpm install` after Forge payment-pkg dep landed (Day 6)

**Why:** Day 6 added `@bizlegal/payment: workspace:*` to `apps/forge/apps/web/package.json`. Vercel runs `pnpm install` automatically as part of its build, so this is **not blocking** the redeploy in #2 — but if you ever build Forge locally (`pnpm --filter forge-web dev`), you need to refresh the workspace symlink.

**How:**

```bash
cd "C:/Users/Moshe Dor/bizlegal-monorepo"
pnpm install
# expect: a single new symlink under apps/forge/apps/web/node_modules/@bizlegal/payment
```

**Verify:**

```bash
ls apps/forge/apps/web/node_modules/@bizlegal/payment
# expect: package.json + dist/ + src/ (symlinked into packages/payment)
```

If the redeploy in #2 succeeds and Forge runs cleanly, you can skip this — Vercel handled it.

---

## 11. Wire `oci_close.py` into Telegram (Day 6)

**Why:** Day 6 added `services/oci/router/oci_close.py` — a CLI helper Moses runs when a partner closes a referred deal. It POSTs to the running router's `/feedback` endpoint with `outcome=won` + commission_usd.

The script lives on the Hetzner box; `ROUTER_BASE_URL=http://localhost:8080` works locally on the box. To make it Telegram-quotable, alias it on Hetzner so Moses can paste a one-liner.

**How:**

```bash
ssh hetzner
sudo -i

cd /opt/bizlegal-monorepo/services/oci/router

# Add a tiny launcher shim that loads the env + invokes the CLI:
sudo tee /usr/local/bin/oci-close <<'SH'
#!/usr/bin/env bash
set -e
set -a; source /opt/bizlegal-monorepo/.env 2>/dev/null || source /opt/oci-deal-router/.env; set +a
export ROUTER_BASE_URL="${ROUTER_BASE_URL:-http://localhost:8080}"
exec /usr/bin/python3 /opt/bizlegal-monorepo/services/oci/router/oci_close.py "$@"
SH
sudo chmod +x /usr/local/bin/oci-close

# Quick smoke (won't actually close anything since lead_id is fake):
oci-close lost smoke-fake-id 0 "smoke test"
# expect: {"ok":true,"updated":0} (no lead matches)
```

**Telegram usage** once the alias is in place:

```
oci-close won bizlegal-7af3b2 1500 "client signed retainer with PartnerCo"
oci-close lost bizlegal-91ab44 0 "client went with internal counsel"
oci-close no_show bizlegal-44cd11 0 "no response after 3 follow-ups"
```

The `outcome=won` payload also patches the `payouts` row's `commission_usd`, so when reconciler runs Friday it'll fire `referral.paid` for that amount.

---

## 12. Add `payout-digest.timer` weekly to Hetzner systemd (Day 6)

**Why:** Day 6 extended `payout_reconciler.py` with a Telegram weekly digest (last 7d routed/closed/paid + top partner). The reconciler already runs Fridays via `payout-reconciler.timer`. Confirm the timer file is up-to-date and the reconciler runs with `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` envs available.

**How:**

```bash
ssh hetzner
sudo -i

cd /opt/bizlegal-monorepo
git pull origin main

# Confirm current systemd timer state:
systemctl status payout-reconciler.timer
systemctl list-timers | grep payout-reconciler

# If the unit's WorkingDirectory is still /opt/oci-deal-router/, refresh:
diff -u /etc/systemd/system/payout-reconciler.service \
        /opt/bizlegal-monorepo/services/oci/systemd/payout-reconciler.service
# If different, copy + reload (similar to OCI router move in #4).

# Confirm the digest envs are present in the service env file:
grep -E '^TELEGRAM_(BOT_TOKEN|CHAT_ID)=' /opt/bizlegal-monorepo/.env || \
  echo "WARNING: Telegram envs missing — digest will skip silently"

# Manual smoke (digest only, no event firing):
cd /opt/bizlegal-monorepo/services/oci/router
docker compose exec router python -m payout_reconciler --digest-only
# expect: a Telegram message in the @Bizlegalbot chat with last-7d numbers
```

**Verify:** check the @Bizlegalbot Telegram chat for the digest message after a manual run, then wait for Friday's scheduled run.

---

## 13. Run synthetic-nurture-arc against post-fixes worker (Day 6)

**Why:** Day 6 applied 3 ship-blocking remediations from the gsd-eval-auditor pass on the nurture prompts (single-anchor rule + runtime guards + concrete forge/generic regulators). Run the synthetic 4-email arc once with `--cleanup` to confirm Haiku output passes the new contract validators.

**How:**

```bash
cd "C:/Users/Moshe Dor/bizlegal-monorepo/services/worker"
export SUPABASE_URL=$(grep '^SUPABASE_URL=' "/c/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt" | cut -d= -f2-)
export SUPABASE_SECRET=$(grep '^SUPABASE_SECRET=' "/c/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt" | cut -d= -f2-)
node scripts/synthetic-nurture-arc.mjs \
  --email moses+arc-d6@bizlegal-ai.com \
  --vertical brai \
  --cleanup
```

**Expected:** all 4 emails arrive with exactly one anchor (the styled CTA button), word counts inside 90-180 / 60-120, subject ≤60 chars. Final state: `next_step=done, emails_sent=4, archived_at` set.

If the arc fails on a contract violation (`compose contract violation for ...`), the EVAL-NURTURE remediation worked exactly as intended — Haiku tried to ship something that breached the prompt rules and the runtime guard caught it. Capture the violation string and we'll iterate on the system prompt.

---

---

## 14. Apply quarantine column migration (Day 7 — INTEGRATION-V3 B-4)

**Why:** Day 7 audit found the worker can spin in a perpetual retry loop if Haiku's output deterministically violates the post-D6 contract validators (subject ≤60, single anchor, word count) for some (vertical, step) pair. Without a failure counter, one stuck row = 288 wasted Haiku calls/day. Add `consecutive_failures` and the worker will archive a row after 5 strikes. Worker code patch ships in the **next** sprint commit (this one only ships the migration to be safe; rolling back the column is harder than rolling back code).

**Where:** Supabase project `ydghhcuuopqzgqcicubg` → SQL Editor.

**How:**

```sql
ALTER TABLE public.lead_nurture_state
  ADD COLUMN IF NOT EXISTS consecutive_failures int NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.lead_nurture_state.consecutive_failures IS
  'Number of times the worker has failed to compose this row''s next step. Auto-archived after 5.';

-- Index isn't needed; the partial-due index already filters quarantined
-- rows because their next_send_at gets pushed far into the future or
-- the worker archives them outright (next_step=done).
```

**Verify:**

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'lead_nurture_state' AND column_name = 'consecutive_failures';
-- expect 1 row: integer / 0
```

The worker doesn't read or write this column today, so the migration is safe to apply now and the code patch can land later. Once the column is live, ping me and I'll wire the increment + archive-at-5 in the next sprint commit.

---

## 15. Cross-vertical email policy decision (Day 7 — INTEGRATION-V3 B-5)

**Why:** Today, a single email captured by two different verticals (e.g. someone fills the BOI decision tree, then a TRACR funnel three days later) creates two parallel `lead_nurture_state` rows. They get 8 emails over 10 days from two voices. This is a spam-complaint magnet; Resend reputation hit if it scales.

**The decision is yours, not engineering's.** Three options, with trade-offs:

**Option A — globally one active sequence per email.** New row inserts skip if any non-archived row exists for that email. Simplest; but the second vertical never gets a sequence at all unless the first archives.

**Option B — first-come-first-served + queue subsequent verticals.** Stash the new vertical in `pending_verticals JSONB`; on archive of the active row, pop the next vertical and start its sequence. Best UX; needs schema change + worker logic.

**Option C — accept the parallelism (status quo).** Clear opt-out cue in every email reduces spam-complaint risk; some users genuinely want multi-vertical content. Lowest engineering cost; highest reputation risk.

**Recommendation from engineering:** Option B is the right long-term shape, but ship Option A this sprint and revisit if a paying customer asks for B. Option A is one extra `select` at insert time; Option B is a migration + state-machine change.

**Action requested:** reply with A / B / C and I'll wire the chosen path in the next sprint commit.

---

## 16. Confirm TRACR decision-tree page renders post-redeploy (Day 7)

**Why:** Day 7 added `/decision-tree` to the TRACR subdomain (the V1 lead-magnet pattern's second instance, mirroring Forge BOI). Verify after the Vercel redeploy in #2 picks up the latest commit.

**How:**

```bash
# After tracr.bizlegal-ai.com redeploys:
curl -fsS https://tracr.bizlegal-ai.com/decision-tree | head -c 500
# expect: HTML containing "Does your crypto activity need a compliance scan?"
```

If it 404s, the redeploy in #2 hasn't picked up the `8ef7421..` commit chain yet — wait for the latest Vercel deployment to settle, then retest.

**Smoke** (one full pass through to verify the API):

```bash
LEAD_ID="smoke-tracr-$(date +%s)"
curl -X POST 'https://tracr.bizlegal-ai.com/api/decision-tree/lead' \
  -H 'content-type: application/json' \
  -d '{"email":"moses+tracr-smoke@bizlegal-ai.com","verdict":"standard_review","answers":{"has_meaningful_volume":true}}'
# expect: {"ok":true,"lead_id":"tracr-decision-tree-moses+tracr-smoke@bizlegal-ai.com"}

# Then check Supabase:
SELECT lead_id, vertical, next_step, captured_at
FROM lead_nurture_state
WHERE source = 'tracr:decision-tree'
ORDER BY captured_at DESC LIMIT 3;
# expect: 1 row with vertical='tracr'
```

---

---

## 17. `pnpm install` after `@bizlegal/nurture-enqueue` workspace link added (Day 8)

**Why:** Day 8 lifted the 5 byte-identical `apps/<sub>/lib/nurture-enqueue.ts` files into a single `packages/nurture-enqueue` workspace package. Each subdomain's local file is now a thin re-export from `@bizlegal/nurture-enqueue`. Vercel runs `pnpm install` automatically as part of the build, so this is **not blocking** the redeploys in #2 — but if you build any of the 5 subdomains locally, refresh the workspace symlink first.

**How:**

```bash
cd "C:/Users/Moshe Dor/bizlegal-monorepo"
pnpm install
# expect: 5 new symlinks under
#   apps/forge/apps/web/node_modules/@bizlegal/nurture-enqueue
#   apps/brai/node_modules/@bizlegal/nurture-enqueue
#   apps/docai/web/node_modules/@bizlegal/nurture-enqueue
#   apps/lexaudit/node_modules/@bizlegal/nurture-enqueue
#   apps/tracr/node_modules/@bizlegal/nurture-enqueue
```

**Verify:**

```bash
ls apps/forge/apps/web/node_modules/@bizlegal/nurture-enqueue
# expect: package.json + dist/ + src/ (symlink into packages/nurture-enqueue)
```

If the redeploys in #2 succeed and Forge / BRAI / DocAI / LexAudit / TRACR all build cleanly, you can skip this — Vercel handled it.

---

## 18. Confirm DocAI decision-tree page renders post-redeploy (Day 8)

**Why:** Day 8 added `/decision-tree` to the DocAI subdomain — the third instance of the V1 lead-magnet pattern (Forge BOI → TRACR wallet-trace → DocAI privacy-scan). Verify after the Vercel redeploy in #2 picks up the latest commit.

**How:**

```bash
# After docai.bizlegal-ai.com redeploys:
curl -fsS https://docai.bizlegal-ai.com/decision-tree | head -c 500
# expect: HTML containing "Does your business need a privacy scan?"
```

**Smoke** (one full pass through the API):

```bash
curl -X POST 'https://docai.bizlegal-ai.com/api/decision-tree/lead' \
  -H 'content-type: application/json' \
  -d '{"email":"moses+docai-smoke@bizlegal-ai.com","verdict":"moderate_review","answers":{"processes_personal_data":true,"eu_or_ca_subjects":true,"sensitive_categories":false,"over_50k_subjects":false,"has_dsar_process":false}}'
# expect: {"ok":true,"lead_id":"docai-decision-tree-moses+docai-smoke@bizlegal-ai.com"}

# Check Supabase:
SELECT lead_id, vertical, next_step, captured_at
FROM lead_nurture_state
WHERE source = 'docai:decision-tree'
ORDER BY captured_at DESC LIMIT 3;
# expect: 1 row with vertical='docai'
```

---

## 19. Worker redeploy after Day 8 race fix + quarantine + ops-event correlation

**Why:** Day 8 patched the worker with three INTEGRATION-V3 fixes that need the new bundle to take effect:
- W-4/W-5 race fix: re-read row state between compose and send (skips email if payment confirmed or opt-out fired during the Haiku call window)
- B-4 quarantine: tracks `consecutive_failures`, exponential back-off, archive-at-5 (works pre-migration via PostgREST 400-tolerant fallback)
- F-1: `email` field in worker `nurture.email.sent` ops events for /ops dashboard correlation

**How:**

```bash
cd "C:/Users/Moshe Dor/bizlegal-monorepo/services/worker"
npx wrangler deploy
# expect: "Deployed bizlegal-lead-intake triggers" + a fresh Version ID
```

The automation orchestrator typically runs this at the end of the session; if you're verifying mid-flight, run it manually. After the deploy, the next */5 cron tick uses the new bundle.

**Verify** (after the next cron tick):

```bash
TOKEN=$(grep '^OPS_DASHBOARD_TOKEN=' "/c/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt" | cut -d= -f2-)
T_ENC=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote_plus(sys.argv[1]))" "$TOKEN")
curl -s "https://bizlegal-ai.com/api/ops/feed?token=$T_ENC&type=nurture.email.sent&limit=3" | jq '.events[] | {ref_email, ref_id, metadata}'
# expect: ref_email populated (was missing before D8 F-1 fix)
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
