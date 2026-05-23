# Phase RR Activation — Moses Ops Queue

**Generated:** 2026-05-23
**Source:** `~/.claude/plans/glowing-moseying-panda.md` + Phase RR runbook

Phase RR shipped all code to `main`. These are the manual Moses steps to activate each piece. Items marked ⭐ have the highest revenue leverage.

---

## R5 · Plausible Analytics — 5 min ⭐ SHIP FIRST

1. Open https://plausible.io → Get Started → $9/mo Growth plan
2. Add site → `bizlegal-ai.com` → timezone `UTC`
3. In Vercel UI: set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=bizlegal-ai.com` on every project (hub, brai, tracr, lexaudit, docai, leadforge, forge)
4. Redeploy each project

**Verify:** `curl -s https://bizlegal-ai.com/agents | grep -c plausible` → ≥1

---

## R3 · Affiliate launch — 20 min ⭐ HIGHEST LEVERAGE

1. Visit https://bizlegal-ai.com/affiliates
2. Sign up with your own email
3. Test: open `/api/affiliates/track/YOURCODE?to=/agents` in incognito → verify cookie + redirect
4. Post the 3 announcement templates (LinkedIn, Reddit, X) from `CLAUDE.md` Phase RR section
5. DM 30 prospects from the pitch queue

**Verify:** Supabase `payment_orders` has a row with `affiliate_code` populated after test checkout

---

## R4 · Social media tokens — 30 min (4 apps)

### LinkedIn (10 min) ⭐
1. https://www.linkedin.com/developers/apps → Create app "BizLegal AI Content Syndication"
2. Products: Share on LinkedIn + Sign In with LinkedIn using OpenID Connect
3. Scopes: `r_liteprofile w_member_social`
4. Generate access token (OAuth flow)
5. Get author URN: `curl -H "Authorization: Bearer <token>" https://api.linkedin.com/v2/userinfo`
6. Set `LINKEDIN_ACCESS_TOKEN` + `LINKEDIN_AUTHOR_URN` on hub Vercel

### X/Twitter (10 min)
1. https://developer.x.com → Create app → get Bearer Token
2. Set `X_BEARER_TOKEN` on hub Vercel

### Reddit (5 min)
1. https://www.reddit.com/prefs/apps → Create script app → note client ID + secret
2. Get refresh token via OAuth flow
3. Set `REDDIT_ACCESS_TOKEN` on hub Vercel

### Buffer (5 min)
1. https://buffer.com → Settings → Access Token
2. `curl "https://api.bufferapp.com/1/profiles.json?access_token=$TOKEN"` → get profile IDs
3. Set `BUFFER_ACCESS_TOKEN` + `BUFFER_DEFAULT_PROFILE_IDS` on hub Vercel

---

## GSC bot — 10 min

1. https://console.cloud.google.com → Create project `bizlegal-gsc`
2. Enable Google Search Console API
3. Create service account `bizlegal-gsc-bot` → download JSON key
4. For each of 8 GSC properties → Settings → Users → add service account email (Restricted)
5. Deploy: `cd services/gsc-bot && pnpm wrangler secret put GSC_SERVICE_ACCOUNT_JSON`
6. Generate admin token: use `openssl rand -hex 16` → set as `GSC_BOT_ADMIN_TOKEN`
7. Set `BIZLEGAL_INBOUND_SECRET` + `OPS_LOG_URL` on the worker
8. `pnpm wrangler deploy`

**Verify:** `curl https://bizlegal-gsc-bot.bizlegal-ai.workers.dev/health` → `{"ok":true,"sites":8}`

---

## Hetzner publisher syndication patch — 5 min

1. `ssh hetzner; cd /opt/bizlegal-monorepo; git pull`
2. Open `services/hetzner/publisher.py` → after the `ops_log.log_event(event_type='content.published')` line, add the HMAC POST to `/api/content/syndicate`
3. `sudo systemctl restart curator-publisher`

**Verify:** Push test article → watch `/ops/hetzner` for `content.published` + `/ops/main` for `social.draft`

---

## PayPal LIVE flip

1. Open PayPal Developer Dashboard
2. Switch credentials from sandbox to LIVE
3. Update `PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET` on hub Vercel

---

## Recommended order

```
1. Plausible (5 min) → unblocks all revenue measurement
2. Affiliate launch (20 min) → starts zero-CAC compounding
3. Hetzner patch (5 min) → turns curator output into 4× social drafts
4. LinkedIn token (10 min) → starts social fan-out engine
5. GSC bot (10 min) → long-tail SEO compounding
6. X/Reddit/Buffer (20 min) → incremental syndication
Total: ~70 min
```
