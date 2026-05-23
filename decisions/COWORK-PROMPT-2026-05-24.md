# Phase RR Activation — Cowork Prompt

**Paste the section below ("BEGIN COWORK PROMPT") into a fresh Claude Code session OR give it to any agent that has Bash, Vercel CLI, Supabase MCP, and Wrangler access.** Moses (`mdmdmd63@gmail.com`) is the human-in-the-loop for anything requiring third-party signup or a card transaction.

---

# BEGIN COWORK PROMPT

You are a Claude coworker on the BizLegal AI monorepo. Your job is to take the six Moses-only Phase RR activation items from green-light to live revenue, in order of revenue leverage. You report back at every checkpoint.

## Context (read first)

- Project: `bizlegal-monorepo` (root operating book: `CLAUDE.md`)
- Phase RR is shipped to `main`. Code is dormant on the surfaces below until the env / token / account work in this prompt completes.
- The contract-risk funnel lives at `apps/docai/web/` on Vercel alias `web-eight-blue-44.vercel.app`. NOWPayments crypto checkout is LIVE. PayPal is gated off (`NEXT_PUBLIC_PAYPAL_SCAN_ENABLED=false`) until a 401 OAuth fix.
- Canonical env vault: `C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt`. Pre-commit hook blocks any new `process.env.X` reference for a name not in the vault.
- Supabase project: `ydghhcuuopqzgqcicubg`. Canonical funnel tables: `contract_scans`, `payment_orders`, `leads`.
- Owner email for every third-party signup: `ai.leadx10@gmail.com`. Founder email: `mdmdmd63@gmail.com`.
- Per-surface ops dashboards: `https://bizlegal-ai.com/ops/{main,subdomains,oci,hetzner}?t=$OPS_DASHBOARD_TOKEN`
- Full master queue + verification commands: `decisions/MOSES-PHASE-RR-ACTIVATION.md` + `decisions/PHASE-RR-ACTIVATION-2026-05-23.md` + `decisions/FUNNEL-CANONICAL-IS-DOCAI-2026-05-24.md`

## Task list (do in this exact order)

### 1 · NOWPayments crypto $97 smoke (HIGHEST LEVERAGE — first dollar)

**Goal:** prove the crypto path end-to-end works against `contract_scans.paid=true`.

**You (agent):**
1. Run `scripts/check-docai-prod-health.ps1` and confirm 200 + `healthy=true`
2. Run `scripts/smoke-docai-prod-scan.ps1` → save the `scan_id` returned
3. Run `scripts/smoke-docai-prod-checkout.ps1 -ScanId <that scan_id>` → confirm 303 redirect to `nowpayments.io`
4. Print the actual checkout URL + amount + crypto address to Moses

**Moses (human):** pay the $97 via the printed crypto address (BTC/ETH/USDT — your call). Tell agent when done.

**You (agent) verify:**
- Poll `https://web-eight-blue-44.vercel.app/api/jobs/<scan_id>` (or whatever the DocAI lookup is — check `apps/docai/web/app/api/`) every 30s for up to 10 min
- When `paid=true`, hit `/report?scan_id=<id>` and confirm full report unlocks (not just preview)
- Post a `payment.confirmed` ops event grep: `curl -s "https://bizlegal-ai.com/api/ops/feed?t=$OPS_DASHBOARD_TOKEN&source=docai" | jq '.events[] | select(.event_type=="payment.confirmed")'` — verify the row exists
- Report back: ✅ first dollar in or ❌ what broke at which step

### 2 · PayPal 401 OAuth fix + LIVE flip

**Why it's blocked:** Vercel runtime logs show `PayPal auth failed: 401` on the DocAI funnel. Likely cause: `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` mismatch with `PAYPAL_ENV` (live creds + sandbox env, or vice versa).

**You (agent):**
1. `vercel env ls production` on the DocAI project — print whether `PAYPAL_*` envs are set (names + presence, never values)
2. Read `apps/docai/web/app/api/payment/paypal/checkout/route.ts` — confirm which base URL it picks for `sandbox` vs `live`
3. Diagnose: ask Moses to confirm whether the current `PAYPAL_CLIENT_ID` is from the LIVE PayPal app or the SANDBOX one (he can check at https://developer.paypal.com → Apps & Credentials)

**Moses (human):**
- Confirm credential type (live vs sandbox)
- If credentials are sandbox: keep `PAYPAL_ENV=sandbox` for one more smoke test, then create a LIVE app at developer.paypal.com, paste new creds into vault, then flip `PAYPAL_ENV=live` on the Vercel project
- If credentials are live but `PAYPAL_ENV=sandbox`: just flip `PAYPAL_ENV=live` on Vercel

**You (agent) verify:**
- Trigger a re-deploy: `vercel --prod` on the DocAI project (or push an empty commit)
- After deploy: try a $1 sandbox PayPal payment (or $97 live) — the `paypal-checkout` route should return 303 to PayPal approval URL instead of 401
- Flip `NEXT_PUBLIC_PAYPAL_SCAN_ENABLED=true` and redeploy — paywall now shows both crypto + card CTAs
- Report: ✅ PayPal works + scan_id paid via PayPal, OR ❌ specific error + which step

### 3 · Plausible Analytics signup + Vercel env

**Why:** Phase RR R5 added Plausible scripts to 7 layouts but they only render when `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set. Without this, zero measurement on any surface.

**Moses (human):**
1. https://plausible.io → Sign up with `ai.leadx10@gmail.com` → Growth plan ($9/mo, 10 sites)
2. Add site → `bizlegal-ai.com` → timezone `UTC`
3. Append to canonical vault: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=bizlegal-ai.com`

**You (agent):**
1. Set the env on all 7 Vercel projects (hub, brai, tracr, lexaudit, docai, leadforge, forge): `vercel env add NEXT_PUBLIC_PLAUSIBLE_DOMAIN production` per project, value `bizlegal-ai.com`
2. Trigger redeploy of each via `vercel --prod` (or push an empty commit per project)
3. Verify: `(Invoke-WebRequest https://bizlegal-ai.com/agents).Content -match 'plausible'` returns True
4. Confirm Plausible dashboard shows ≥1 visit after you load the page yourself

### 4 · services/gsc-bot Cloudflare Worker deploy

**Why:** weekly Mon 02:00 UTC GSC sitemap re-submission across 8 surfaces. Replaces the manual GSC UI loop.

**Moses (human) — 5 min:**
1. https://console.cloud.google.com → project `bizlegal-gsc` (or create) → enable Google Search Console API
2. IAM → Service Accounts → create `bizlegal-gsc-bot` → Keys → Add Key → JSON → download
3. For each of 8 GSC properties (`bizlegal-ai.com`, `brai/forge/docai/lexaudit/tracr/leadforge/blog.bizlegal-ai.com`): Settings → Users → add `bizlegal-gsc-bot@bizlegal-gsc.iam.gserviceaccount.com` as **Restricted**
4. Append to vault:
   - `GSC_SERVICE_ACCOUNT_JSON=` (paste the full JSON one-line)
   - `GSC_BOT_ADMIN_TOKEN=` (generate via `openssl rand -hex 32`)

**You (agent):**
```bash
cd services/gsc-bot
pnpm install
pnpm wrangler login   # if not already
pnpm wrangler secret put GSC_SERVICE_ACCOUNT_JSON   # paste from vault
pnpm wrangler secret put GSC_BOT_ADMIN_TOKEN        # paste from vault
pnpm wrangler secret put BIZLEGAL_INBOUND_SECRET    # same hex as every other surface
pnpm wrangler secret put OPS_LOG_URL                # https://bizlegal-ai.com/api/ops/log
pnpm wrangler deploy
```

**You (agent) verify:**
- `curl https://bizlegal-gsc-bot.bizlegal-ai.workers.dev/health` → `{"ok":true,"sites":8}`
- Manual trigger: `curl -X POST "https://bizlegal-gsc-bot.bizlegal-ai.workers.dev/run?token=<ADMIN_TOKEN>"` → returns per-site `ok:true` array
- Hit `/ops/hetzner?t=$OPS_DASHBOARD_TOKEN` (after re-deploy of hub if `'gsc-bot'` source isn't yet routed — check) — confirm `gsc.submit.manual` event landed

### 5 · Affiliate launch announcement (zero-CAC channel turns on)

**Why:** Phase RR R3 shipped the affiliate program (`https://bizlegal-ai.com/affiliates`). It earns nothing until you announce it.

**You (agent) smoke test first:**
1. POST to `/api/affiliates/signup` with `{"email":"mdmdmd63+aff-test@gmail.com"}` — confirm 200 + 8-char code returned
2. Hit `/api/affiliates/track/<that code>?to=/agents` in a fresh curl session — confirm 302 + `set-cookie: bz_aff=…`
3. Print the share-link URL for Moses to use himself if he wants

**Moses (human) — 20 min:**
Copy-paste templates from `decisions/PHASE-RR-ACTIVATION-2026-05-23.md` §6.2 to:
- LinkedIn (1 post)
- Reddit (r/SaaS, r/Entrepreneur, r/legaltech)
- X (4-tweet thread)
- DM 30 compliance consultants from `decisions/COLD-PITCH-QUEUE-2026-05-20.md`

**You (agent) monitor:**
- Every 4h poll `/api/ops/feed?source=hub&t=…` for `affiliate.signup` events
- Telegram-alert Moses every time a new signup lands

### 6 · LinkedIn API token (unblocks social syndication)

**Why:** Phase RR R4 social syndication has all 4 channel adapters coded but each is dormant without API tokens. LinkedIn first (B2B compliance audience = highest leverage); X/Reddit/Buffer can lag.

**Moses (human) — 10 min:**
1. https://www.linkedin.com/developers/apps → Create app → company page `bizlegal-ai`
2. Products → Request **Share on LinkedIn** + **Sign In with LinkedIn using OpenID Connect**
3. Auth → OAuth flow → generate access token with scopes `r_liteprofile w_member_social`
4. Get author URN: `curl -H "Authorization: Bearer <token>" https://api.linkedin.com/v2/userinfo` → take `sub` field → prefix with `urn:li:person:`
5. Append to vault:
   - `LINKEDIN_ACCESS_TOKEN=<token>`
   - `LINKEDIN_AUTHOR_URN=urn:li:person:<sub>`

**You (agent):**
1. Set both envs on the hub Vercel project (`bizlegal-ai`)
2. Redeploy
3. Test by faking a `content.published` HMAC-signed POST to `/api/content/syndicate` — verify 4 rows land in `social_drafts` table
4. Verify the LinkedIn-channel `social.posted` event fires on next `/api/cron/social-queue` invocation

## Reporting cadence

After **each** numbered task:
- Print to Moses (via Telegram or this chat): what completed, what failed, the exact next step waiting on him (if any)
- If anything blocked: flag the blocker + the smallest unblocking action
- If everything green: move to the next task without waiting

## Hard rules

- **Never** print secret values to chat. Names + presence only.
- **Never** commit a new `process.env.X` without first appending the name to the canonical vault (pre-commit hook will block you).
- **Never** charge a real card without Moses's explicit go-ahead per transaction.
- **Never** delete `services/funnel-mvp/` (it's a tombstone with reference value — leave until DocAI sustains 30 days of revenue).
- If a Vercel CLI / Wrangler command fails on TLS, you may NOT use `NODE_TLS_REJECT_UNAUTHORIZED=0` for any operation that uploads secrets. Stop and ask Moses to fix his local Node TLS trust first.

## When done

When all 6 are green, write a closeout report to `decisions/PHASE-RR-CLOSEOUT-<today>.md` covering:
- What's now live and revenue-generating
- The first dollar moment (timestamp + amount + gateway)
- What was harder than expected (so the next sprint can plan around it)
- The next 3 highest-leverage moves with 30-day revenue impact estimates

# END COWORK PROMPT

---

## How Moses uses this

1. **Single-agent run:** paste the section between BEGIN/END into a fresh Claude Code session. The agent walks through tasks 1→6 in order, pausing at each "Moses (human)" checkpoint.
2. **Coworker hand-off:** share this file's URL with another operator. The prompt is self-contained — they don't need to read the rest of the repo to execute.
3. **Background autonomy:** drop the prompt into the EA agent runner (`apps/hub/lib/agents/prompts.ts`) as a one-shot task; the runner will execute up to the first Moses-checkpoint and Telegram you when waiting.
