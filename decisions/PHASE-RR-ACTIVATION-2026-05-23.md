# Phase RR — Activation Runbook (Moses-only)

**Date:** 2026-05-23
**Owner:** Moses
**Time estimate:** ~75 min total (can be split across sessions)

All of Phase RR R1–R6 is shipped to `main` and live on Vercel as of commit `f0b070d`. The code is dormant on the surfaces that need external accounts / API tokens / vault env additions. This runbook walks you through activating each piece.

**Sequence:** items are independent except where noted. Do them in any order. Bold the ones with the highest revenue leverage.

---

## 1 · Append to canonical vault — 5 min

**Why:** the new code reads these env names; the pre-commit hook will block any future PR that references a name not in the vault.

Open `C:\Users\Moshe Dor\Downloads\env-hub-bizlegal-ai.txt` and append:

```
# --- Phase RR (2026-05-23) ---

# R5 — Plausible Analytics (single property tracks all 8 surfaces)
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=bizlegal-ai.com

# R4 — Social syndication API tokens
LINKEDIN_ACCESS_TOKEN=
LINKEDIN_AUTHOR_URN=
X_BEARER_TOKEN=
REDDIT_ACCESS_TOKEN=
BUFFER_ACCESS_TOKEN=
BUFFER_DEFAULT_PROFILE_IDS=

# services/gsc-bot — service account JSON + admin trigger token
GSC_SERVICE_ACCOUNT_JSON=
GSC_BOT_ADMIN_TOKEN=

# Per-surface health probe override (optional — defaults to publisher.bizlegal-ai.com/healthz)
HETZNER_PUBLISHER_HEALTH_URL=https://publisher.bizlegal-ai.com/healthz
```

Leave the values blank for now — they get filled by the section below that produces each one.

Once filled, paste each `KEY=value` into Vercel UI → `bizlegal-ai` project → Settings → Environment Variables (production).

---

## 2 · Plausible Analytics — 5 min ⭐ ship first (unblocks every revenue measurement)

1. Open https://plausible.io → Get Started → $9/mo Growth plan (10 sites, fine)
2. Add site → enter `bizlegal-ai.com` → set timezone `UTC`
3. Plausible's dashboard auto-tracks subdomains since the script uses `data-domain="bizlegal-ai.com"` everywhere (already coded in 7 layouts via `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`)
4. In Vercel UI: set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=bizlegal-ai.com` on every project (hub, brai, tracr, lexaudit, docai, leadforge, forge). 8th surface (blog) lives in CF Pages — set via Cloudflare Pages env separately if you want blog tracking
5. Trigger a re-deploy of each Vercel project (or wait for the next push)

**Verification:**
- `curl -I https://bizlegal-ai.com/` → the response HTML should contain `script.outbound-links.js`
- Plausible dashboard shows ≥1 visit within 60 seconds of loading the page yourself

---

## 3 · services/gsc-bot activation — 10 min

**Why:** automates GSC sitemap re-submission weekly (Mon 02:00 UTC) across all 8 surfaces. Replaces the manual GSC UI loop in the runbook.

### 3.1 — Create the GCP service account

1. Open https://console.cloud.google.com → select or create project `bizlegal-gsc`
2. APIs & Services → Library → enable **Google Search Console API**
3. IAM & Admin → Service Accounts → Create:
   - name: `bizlegal-gsc-bot`
   - role: `Search Console User` (none needed at project level; permissions added per-property below)
4. Keys → Add Key → JSON → download `bizlegal-gsc-bot-XXXX.json`

### 3.2 — Authorize on each GSC property (8× ~30 sec)

For each of the 8 surfaces in GSC:

1. https://search.google.com/search-console → property → Settings → Users and permissions
2. Add user → paste `bizlegal-gsc-bot@bizlegal-gsc.iam.gserviceaccount.com`
3. Permission level: **Restricted**

Properties to add to: `bizlegal-ai.com`, `brai.bizlegal-ai.com`, `forge.bizlegal-ai.com`, `docai.bizlegal-ai.com`, `lexaudit.bizlegal-ai.com`, `tracr.bizlegal-ai.com`, `leadforge.bizlegal-ai.com`, `blog.bizlegal-ai.com`.

### 3.3 — Deploy the worker

```powershell
cd "C:\Users\Moshe Dor\bizlegal-monorepo\services\gsc-bot"
pnpm install
# paste the full JSON contents on one line (PowerShell can read the file):
$json = Get-Content -Raw "C:\path\to\bizlegal-gsc-bot-XXXX.json"
pnpm wrangler secret put GSC_SERVICE_ACCOUNT_JSON
# paste $json when prompted

# Generate + set admin token
$tok = -join ((1..32) | ForEach-Object { '{0:x}' -f (Get-Random -Maximum 16) })
$tok  # SAVE THIS — needed for manual /run trigger
pnpm wrangler secret put GSC_BOT_ADMIN_TOKEN
# paste $tok when prompted

# Set HMAC secret (same hex as every other surface)
pnpm wrangler secret put BIZLEGAL_INBOUND_SECRET
# paste from vault

# Set ops log URL
pnpm wrangler secret put OPS_LOG_URL
# enter: https://bizlegal-ai.com/api/ops/log

pnpm wrangler deploy
```

### 3.4 — Verify

- `curl https://bizlegal-gsc-bot.bizlegal-ai.workers.dev/health` → `{"ok":true,"sites":8,"version":"0.1.0"}`
- Manual trigger: `curl -X POST "https://bizlegal-gsc-bot.bizlegal-ai.workers.dev/run?token=$GSC_BOT_ADMIN_TOKEN"` → returns per-site `ok:true` array
- Watch `/ops/hetzner` for `gsc.submit.manual` events landing

---

## 4 · Hetzner publisher syndication wiring — 5 min ⭐

**Why:** every curator-published article should trigger 4 social drafts. Right now `services/hetzner/publisher.py` writes to GitHub + fires `content.published` to ops_log but does NOT call `/api/content/syndicate`. Two-line patch.

### 4.1 — Add the call

SSH to Hetzner:

```bash
ssh hetzner
cd /opt/bizlegal-monorepo
git pull
```

Open `services/hetzner/publisher.py` and after the existing `ops_log.log_event(event_type='content.published', ...)` call, add:

```python
# Phase RR — fan out to social syndication (HMAC-signed POST)
try:
    import json, hmac, hashlib, os, httpx
    syndicate_body = json.dumps({
        "source_url": article_url,
        "source_title": article_title,
        "source_summary": article_excerpt[:1200],
    }, separators=(",", ":"))
    sig = hmac.new(
        os.environ["BIZLEGAL_INBOUND_SECRET"].encode(),
        syndicate_body.encode(),
        hashlib.sha256,
    ).hexdigest()
    httpx.post(
        "https://bizlegal-ai.com/api/content/syndicate",
        content=syndicate_body.encode(),
        headers={"content-type": "application/json", "x-bizlegal-signature": sig},
        timeout=30,
    )
except Exception as e:
    print(f"[syndicate] failed (best-effort): {e}")
```

Substitute `article_url`, `article_title`, `article_excerpt` with the variable names already in scope at that point. The publisher already has these from the GitHub commit.

### 4.2 — Restart

```bash
sudo systemctl restart curator-publisher
```

### 4.3 — Verify

- Push a test article through the curator (use `@BIZLEGALFORGEBOT` `/regen` then `/deploy`)
- Watch `/ops/hetzner` for `content.published` event
- Watch `/ops/main` for `social.draft` event (4 channels) within ~30 sec
- Open Telegram — the 4 drafts will arrive in the next 09:00 UTC digest (Phase RR R2 daily-content-pick-suggestion)

---

## 5 · Social media app setup — 30 min (split across 4 apps)

Each one independent; start with LinkedIn (highest revenue leverage; B2B compliance audience).

### 5.1 — LinkedIn — 10 min

1. https://www.linkedin.com/developers/apps → Create app
2. App name: `BizLegal AI Content Syndication`
3. LinkedIn Page: your company page (`bizlegal-ai`)
4. Products → Request **Share on LinkedIn** + **Sign In with LinkedIn using OpenID Connect**
5. Auth → OAuth 2.0 settings → Scopes: `r_liteprofile w_member_social`
6. Generate access token (LinkedIn UI walks you through OAuth flow)
7. Get your member URN: `curl -H "Authorization: Bearer <token>" https://api.linkedin.com/v2/userinfo` → returns `sub`, prefix with `urn:li:person:` → that's `LINKEDIN_AUTHOR_URN`

Paste both into Vercel env on the `bizlegal-ai` (hub) project.

### 5.2 — X (Twitter) — 10 min

1. https://developer.x.com → Apply for developer account (free tier works for posting from your own account)
2. Create app → get Bearer Token from the Keys & Tokens tab
3. Paste into vault as `X_BEARER_TOKEN`; set in Vercel

### 5.3 — Reddit — 5 min

1. https://www.reddit.com/prefs/apps → Create another app → type: `script`
2. Note the client ID + secret
3. Get a refresh token via the standard reddit OAuth flow (one-time)
4. Use the refresh token to mint a bearer token each cron cycle (the queue cron expects a bearer; you can wire a refresh helper inside `apps/hub/lib/social/channels.ts` if you want — for now, paste the bearer)

### 5.4 — Buffer — 5 min

1. https://buffer.com → Settings → Apps & Extras → Access Token (paid plan needed for API)
2. Get profile IDs via: `curl "https://api.bufferapp.com/1/profiles.json?access_token=$BUFFER_ACCESS_TOKEN"` → comma-separate the IDs you want syndicate to post to
3. Set `BUFFER_ACCESS_TOKEN` + `BUFFER_DEFAULT_PROFILE_IDS` in Vercel

**Behavior without these tokens:** the cron queue logs `<channel> token not configured` to `social.posted` event with `status=failed`, but the drafts still land in `social_drafts` for manual copy-paste. You can launch incrementally — set LinkedIn first, the rest later.

---

## 6 · Affiliate program launch — 20 min ⭐ HIGHEST LEVERAGE

**Why:** zero-CAC growth. Each share link gets a 90-day cookie. The reconciler runs Friday.

### 6.1 — Smoke test before announcing

1. Visit https://bizlegal-ai.com/affiliates
2. Sign up with your own email (`mdmdmd63+aff-test@gmail.com`)
3. You'll get a code like `kx7nbh3p` and a dashboard URL
4. Open `https://bizlegal-ai.com/api/affiliates/track/kx7nbh3p?to=/agents` in incognito → verify cookie is set + redirected to /agents
5. In the same incognito session, hit `/checkout?product=hub&tier=pro&interval=monthly&amount=4900&name=Hub+Pro` → start checkout
6. Check Supabase → `payment_orders` should have a row with `affiliate_code = 'kx7nbh3p'` populated

If any of these fail, ping me — likely a cookie domain issue or the affiliate code wasn't created.

### 6.2 — Announcement templates

Copy-paste these. **Do not modify the share-link mechanic** — the rate card is wired into the dashboard already.

#### LinkedIn post (1 of 1)

```
We just opened the BizLegal AI affiliate program.

Compliance consultants, fractional GCs, and folks running fintech newsletters: if you send us a paying customer, you earn:

  · 30% on first-month MRR
  · 20% recurring for 11 more months
  · 15% on one-time products

Crypto or wire payouts. 90-day attribution window. No minimums, no contracts.

We have 15 agents at $19 one-time or $49/mo across: regulatory monitoring, contracts, due diligence, Stripe Connect marketplace compliance, EU AI Act, India DPDPA, and more.

Sign up takes 30 seconds → https://bizlegal-ai.com/affiliates

Happy to answer questions in DMs.
```

#### Reddit (r/SaaS, r/Entrepreneur, r/legaltech — modify per sub)

```
Title: Opened our affiliate program — 30% first-month + 20% recurring on B2B compliance SaaS

We've been building BizLegal AI for ~6 months. 15 specialized AI compliance agents (think: BOI Tracker, EU AI Act classifier, India DPDPA gap audit, Stripe Connect marketplace compliance) at $19 one-time or $49/mo.

Just opened the affiliate program. The rates:
  · 30% first-month MRR
  · 20% recurring months 2-12
  · 15% one-time

90-day attribution cookie. Crypto or wire payouts. No vetting — just sign up at /affiliates and you get a code.

I'm here if you want to dig into the agent product surface or the cookie-stuffing protections. Not pitching this as get-rich — pitching it as we want partners and we'll share generously.

Link: https://bizlegal-ai.com/affiliates
```

#### X / Twitter (thread of 4)

```
1/
We opened the BizLegal AI affiliate program today.

30% on first-month MRR. 20% recurring for 11 months. 15% one-time.

Crypto or wire payout. 90-day cookie. No minimums, no contracts.

For compliance consultants, fractional GCs, fintech newsletter ops:
https://bizlegal-ai.com/affiliates

2/
Here's why the rates are this high (most SaaS pay 20% recurring max):

We sell B2B compliance tooling. The customer LTV is long (most stay >12 mo). The CAC we'd otherwise burn on paid acquisition is the budget that funds the affiliate split. Symmetry > cleverness.

3/
The product surface: 15 AI agents at $19 one-time or $49/mo.

Coverage: EU AI Act · India DPDPA · Stripe Connect 1099-K · CTA-2024 BOI · GDPR/CCPA policy refresh · OFAC sanctions · MiCA · jurisdiction comparison · DPA negotiator · and 6 more.

4/
If you have a compliance audience, the 90-day cookie + lifetime-recurring math means a single warm-DM intro can compound to $200-500 over the customer's lifetime.

The dashboard tracks attribution in real time. Friday reconciliation. Crypto pays same-day.

https://bizlegal-ai.com/affiliates
```

### 6.3 — DM list

Source: `decisions/COLD-PITCH-QUEUE-2026-05-20.md` Section "3 pitch personas" — every name in that doc gets a 1-line DM saying "Opened the affiliate side too — same rates as anyone else, link if you want to share: bizlegal-ai.com/affiliates". 30 names. Should take ~15 min in LinkedIn DMs.

---

## 7 · Verification commands (run after each section)

```powershell
# Plausible script present
(Invoke-WebRequest 'https://bizlegal-ai.com/agents').Content -match 'plausible'

# Affiliate landing live
(Invoke-WebRequest 'https://bizlegal-ai.com/affiliates').StatusCode

# All 3 new agent landings live
foreach ($a in @('marketplace-shield','ai-governance','india-dpdpa')) {
  $code = (Invoke-WebRequest "https://bizlegal-ai.com/agents/$a" -SkipHttpErrorCheck).StatusCode
  Write-Output "$a -> $code"
}

# /ops/main has the 4 per-surface dashboard quick-action links
$tok = $env:OPS_DASHBOARD_TOKEN
(Invoke-WebRequest "https://bizlegal-ai.com/ops/master?t=$tok").Content -match '/ops/main'

# GSC bot health
Invoke-RestMethod 'https://bizlegal-gsc-bot.bizlegal-ai.workers.dev/health'

# EA agent runner reachable (needs CRON_SECRET)
$sec = $env:CRON_SECRET
Invoke-WebRequest "https://bizlegal-ai.com/api/agents/run?task=daily-revenue-digest&token=$sec" -SkipHttpErrorCheck | Select-Object StatusCode
```

---

## 8 · Order of operations (recommended)

1. **Plausible** — 5 min, ship first (unblocks every measurement decision)
2. **Affiliate launch** — 20 min, ship second (zero-CAC compounding starts)
3. **Hetzner publisher patch** — 5 min, ship third (turns curator output into 4× social drafts)
4. **LinkedIn token** — 10 min, ship fourth (start the social fan-out engine; remaining channels can lag)
5. **GSC bot activation** — 10 min, ship fifth (long-tail SEO compounding)
6. **X / Reddit / Buffer tokens** — 20 min, ship last (incremental syndication; the system works without them, just leaves drafts in the table)

After step 4, the next /ops/main daily-revenue-digest at 08:00 UTC will start posting actionable signal to Telegram. The autonomous loop is live.

---

## Reference

- Plan: `~/.claude/plans/ethereal-wandering-frog.md` (R1-R6 detail)
- Phase RR commits on `main`: `f5cceec` (R1 dashboards) · `e883568` (R2-R6 stack) · `f0b070d` (R6 landings)
- Operating book root: `bizlegal-monorepo/CLAUDE.md`
- Affiliate dashboard: `https://bizlegal-ai.com/affiliates/<your-code>/dashboard`
- Per-surface ops: `/ops/{main,subdomains,oci,hetzner}?t=$OPS_DASHBOARD_TOKEN`
- /ops/master Quick Actions now cross-link the 4 per-surface dashboards
