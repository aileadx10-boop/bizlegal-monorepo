# Phase RR Activation Closeout — 2026-05-24

**Session:** Cowork autonomous activation  
**Agent:** Claude (Sonnet 4.6)  
**Duration:** 2026-05-23 23:00 UTC → 2026-05-24 23:00 UTC  
**Mandate:** Take 6 dormant activation items to live revenue in order of revenue leverage.

---

## ⚠️ CRITICAL: Vercel CLI Token Expired

**Discovered late-session:** `~/.../com.vercel.cli/Data/auth.json` has `expiresAt` = 1970-01-21 (Unix ms ≈ 0 — effectively never set). Vercel API returns `invalidToken: true`. TLS cert verification also fails for Node.js in this execution context, preventing automatic token refresh.

**Impact on this session's work:**
- `vercel env add` commands wrote `DONE_*` markers to log files but may NOT have actually saved env vars to Vercel (batch scripts wrote DONE unconditionally regardless of exit code)
- `vercel deploy --prod` failed for `web` project — env var changes and PayPal code may not be live on `web-eight-blue-44.vercel.app`

**Moses MUST do first (before anything else):**
```powershell
cd "C:\Users\Moshe Dor\bizlegal-monorepo\apps\docai\web"
vercel login
vercel deploy --prod
```
Then run `vercel env add` commands for any env vars not yet confirmed.

---

## Status Matrix

| # | Item | Status | Owner | Notes |
|---|------|--------|-------|-------|
| 1 | NOWPayments $97 smoke | ❌ EXPIRED | Moses | Invoice expired (~21h). New invoice needed after web redeploy. |
| 2 | PayPal 401 fix + LIVE flip | ⚠️ PENDING DEPLOY | Moses | Code committed to git. Env var uncertain. Need vercel login first. |
| 3 | Plausible env on 7 projects | ⚠️ UNCERTAIN | Moses | Env push may have failed (token expired). Verify after re-login. |
| 4 | GSC Bot deploy | 🔴 BLOCKED | Moses | GCP service account not created. |
| 5 | Affiliate announcement | ✅ READY | Moses | Templates in §6.2. DM list ready. Post to LinkedIn/Reddit/X. |
| 6 | LinkedIn API token | 🔴 BLOCKED | Moses | Requires Moses OAuth at linkedin.com/developers. |

---

## What the Agent Did (Autonomous)

### Git Commits Pushed ✅ (These DID succeed — git uses separate auth)
- `4fa56c4` — chore(env): trigger rebuild — Plausible domain + PayPal env active
- `c919de5` — feat(paypal,docai): commit PayPal integration + accumulated web app changes
- 20 files changed, 1038 insertions: PayPal checkout/return routes, paypal-scan.ts, CLAUDE.md, health route, AgentCheckoutButton, report-view, package.json, pages

### `bizlegal-ai` Hub Auto-Deploy ✅ (GitHub webhook, no CLI needed)
- `dpl_9GbnaMRc45gXDU9sq6Mb23d8Dk1c` — BUILDING from `c919de5`
- `dpl_J8cY1ycKLuDxZpkJNb4kwAiR2s4a` — QUEUED from `4fa56c4`
- Hub will have Plausible baked in if `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` env var was set before build

### Vercel Env Pushes ⚠️ (Status uncertain due to expired token)
- Ran `vercel env add NEXT_PUBLIC_PLAUSIBLE_DOMAIN production` on all 7 projects
- Ran `vercel env add PAYPAL_ENV production` on web project
- DONE markers confirmed in log files BUT token was expired — may have silently failed
- **Verification required:** `vercel env ls --project web` after `vercel login`

### Vault Updated ✅ (File write, no CLI needed)
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=bizlegal-ai.com` written to `env-hub-bizlegal-ai.txt`

### NOWPayments Smoke Investigation ✅
- Invoice 4774340649 — 21 hours elapsed, zero IPNs, BSC USDT confirms in seconds → expired
- `processed_webhook_events` table: empty (no real payments ever received)
- IPN endpoint confirmed reachable and returning correct 401 on bad signature

### Affiliate Smoke (prev session) ✅
- `GET /api/affiliates/signup` → code `ge8wmdsp` ✅
- `GET /api/affiliates/track/ge8wmdsp?to=/checkout` → 302 ✅

---

## Moses Action Items (Ordered by Revenue Impact)

### 0. FIRST — Re-authenticate Vercel CLI (5 min, blocks everything below)
```powershell
# Run in your own terminal (not Cowork)
cd "C:\Users\Moshe Dor\bizlegal-monorepo\apps\docai\web"
vercel login
```
Browser will open for OAuth. After login:
```powershell
vercel deploy --prod
```

### 0b. Verify + Re-push Env Vars if Needed
After `vercel login`:
```powershell
vercel env ls --project web
# Check for: NEXT_PUBLIC_PLAUSIBLE_DOMAIN, PAYPAL_ENV, NEXT_PUBLIC_PAYPAL_SCAN_ENABLED

# If NEXT_PUBLIC_PLAUSIBLE_DOMAIN missing, run on each project:
echo "bizlegal-ai.com" | vercel env add NEXT_PUBLIC_PLAUSIBLE_DOMAIN production --project bizlegal-ai --yes
echo "bizlegal-ai.com" | vercel env add NEXT_PUBLIC_PLAUSIBLE_DOMAIN production --project web --yes
# (repeat for brai, trcr, lexaudit, leadforge, forge)
```

### 1. NOWPayments — Re-run Smoke Test (after web redeploy)
```
Go to: https://web-eight-blue-44.vercel.app
Complete a real scan → pay $97 in USDT BSC
Verify: SELECT paid FROM contract_scans ORDER BY created_at DESC LIMIT 1;
Expected: paid=true within 60 seconds of blockchain confirm
```

### 2. PayPal — Confirm Credential Type + Enable
Open https://developer.paypal.com → Apps & Credentials  
**Question:** Is `PAYPAL_CLIENT_ID=ARaoPfEvLONXdzftzmAWmwibmEV-...` from the **Sandbox** or **Live** tab?

- **If Sandbox:** Flip the enable flag: `echo "true" | vercel env add NEXT_PUBLIC_PAYPAL_SCAN_ENABLED production --project web --yes` → `vercel deploy --prod`
- **If Live:** Change env: `echo "live" | vercel env add PAYPAL_ENV production --project web --yes` → `vercel deploy --prod`

### 3. Plausible — Verify Script Loading (after web redeploy)
```bash
curl -s https://web-eight-blue-44.vercel.app | grep -i plausible
# Expect: src containing plausible.io
```

### 4. GSC Bot — GCP Service Account (30 min)
1. https://console.cloud.google.com → IAM → Service Accounts
2. Create: `gsc-sitemap-bot@<project>.iam.gserviceaccount.com`
3. Download JSON key → add as Owner on all 8 GSC properties
4. Run from `services/gsc-bot/`:
```bash
cat service-account.json | wrangler secret put GSC_SERVICE_ACCOUNT_JSON
echo "your-admin-token" | wrangler secret put ADMIN_TOKEN
wrangler deploy
curl https://gsc-bot.<subdomain>.workers.dev/health
```

### 5. Affiliate Announcement — Post Templates (30 min)
From `decisions/PHASE-RR-ACTIVATION-2026-05-23.md` §6.2:
- Post LinkedIn template → tag 5 compliance consultants
- Post Reddit r/legaltech + r/compliance
- Post X/Twitter thread
- DM 30 consultants from list in §6.2

### 6. LinkedIn API Token
1. https://linkedin.com/developers → Create App
2. Request `w_member_social` permission
3. Complete OAuth → add to vault: `LINKEDIN_ACCESS_TOKEN=...`

---

## Technical State After This Session

### Git (Confirmed Good)
- Latest commits on `main`: `c919de5`, `4fa56c4`
- Previously untracked PayPal files now committed
- `bizlegal-ai` hub auto-deploying from main

### Vercel (Requires Re-login)
- CLI token: **EXPIRED** — `vercel login` required
- Web project: last confirmed deploy `dpl_9dmijN4wyzrBAJTBAr1cEBStTBpr` (old code)
- Web project: NOT linked to GitHub (gitDirty:1 deployments only)
- Env vars pushed this session: **UNVERIFIED** due to expired token

### Supabase (ydghhcuuopqzgqcicubg)
- `contract_scans`: 1 scan (paid=false — invoice expired)
- `processed_webhook_events`: empty (no real payments yet)

### Hard Rules Compliance
- ✅ No secret values printed to chat
- ✅ No vault commit without entry
- ✅ services/funnel-mvp/ not deleted
- ✅ NODE_TLS_REJECT_UNAUTHORIZED=0 not used
- ✅ No real card charged without per-transaction approval

---

## Next Sprint Priorities

1. **`vercel login` + `vercel deploy --prod`** (web) — unblocks NOWPayments, PayPal, Plausible
2. **First dollar** — NOWPayments $97 USDT smoke test
3. **GSC Bot** — 30 min Moses investment → weekly SEO autopilot
4. **Affiliate** — 30 min posting → referral revenue within 7 days

_Generated by Claude Cowork session 2026-05-24. Updated with Vercel token expiry finding._
