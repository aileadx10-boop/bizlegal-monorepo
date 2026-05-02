# BizLegal-AI — Env upload kit (v2 — pivot-aligned)

**For:** Hub (Vercel `bizlegal-ai`), TRCR (Vercel `tracr`), BRAI (Vercel `brai` + Render `blockchain-agents`).

**Updated 2026-04-27 per Moses corrections:**
- ❌ NO Coinbase Commerce, NO Stripe, NO SendGrid — until first revenue.
- ✅ Payment processors: **NOWPayments + PayPal** (existing) + **LemonSqueezy + Paddle** (post-MoR-approval).
- ⚠️ MoR reapply (LemonSqueezy / Paddle) **gated until new BizLegal is fully live + functioning + old version removed**.
- ✉️ Resend sending domain: `intelligence.bizlegal-ai.com`. Personal inbox (Namecheap): `team@bizlegal-ai.com`.

---

## Email convention (verified)

| Use | Address | Domain DNS |
|---|---|---|
| **Sending (transactional, automated)** | `intelligence@intelligence.bizlegal-ai.com` | Resend domain `intelligence.bizlegal-ai.com` (SPF + DKIM verified in Resend dashboard) |
| **Reply-To (so replies land in your inbox)** | `team@bizlegal-ai.com` | Namecheap (Private Email) on apex `bizlegal-ai.com` |
| **Display name** | `BizLegal AI Intelligence` | (set in `RESEND_FROM_NAME`) |

**Why subdomain for sending:** isolating the sending domain (`intelligence.bizlegal-ai.com`) from the apex (`bizlegal-ai.com`) protects your personal inbox's reputation if Resend's IP gets flagged. Namecheap MX on apex stays clean for receiving.

**Recommended `RESEND_FROM` value:** `intelligence@intelligence.bizlegal-ai.com`. Looks like: `BizLegal AI Intelligence <intelligence@intelligence.bizlegal-ai.com>`.

If you'd rather use `reports@`, `noreply@`, or `alerts@` as the local-part, swap in this kit and code references — Resend accepts any local-part on a verified domain.

---

## Cross-service shared values (paste-once, use everywhere)

```
# Identical across hub + 6 products + EA Worker + OCI router.
# Source of truth: ~/.claude/canonical-env-clean.env (or .env.CANONICAL.txt) on Moses's machine.
BIZLEGAL_INBOUND_SECRET=48320471d447bdf990bf3779f4ecce4e54ed960ace02797c50f588824a5e3db3
NEXT_PUBLIC_DISCLAIMER_VERSION=v1.0.0-p4
NEXT_PUBLIC_HUB_URL=https://bizlegal-ai.com
ANTHROPIC_API_KEY=sk-ant-...                                       # paste from canonical
GOOGLE_GEMINI_API_KEY=...                                          # paste from canonical
RESEND_API_KEY=re_...                                              # paste from canonical
RESEND_FROM=intelligence@intelligence.bizlegal-ai.com
RESEND_FROM_NAME=BizLegal AI Intelligence
RESEND_REPLY_TO=team@bizlegal-ai.com
NEXT_PUBLIC_SUPABASE_URL=https://ydghhcuuopqzgqcicubg.supabase.co  # see "Supabase project map" section
NEXT_PUBLIC_SUPABASE_ANON_KEY=...                                  # paste from canonical
SUPABASE_SERVICE_ROLE_KEY=...                                      # paste from canonical (service role)
```

---

## Supabase project map (per CLAUDE.md)

| Service | NEXT_PUBLIC_SUPABASE_URL value |
|---|---|
| Hub (Vercel) | `https://ydghhcuuopqzgqcicubg.supabase.co` (DB1 — canonical) |
| TRCR (Vercel) | `https://ydghhcuuopqzgqcicubg.supabase.co` (DB1 — TRCR's master tables `tracr_orders`, `trcr_clients`, etc. live here per CLAUDE.md) |
| BRAI (Vercel + Render) | `https://rgbwlaifhfvlxgamwcnz.supabase.co` (DB2 — product runtime, owns `brai_*` tables when created) |
| Forge (Vercel) | `https://rgbwlaifhfvlxgamwcnz.supabase.co` (DB2 — owns `forge_scans`, `boi_orders`, `gap_pages`) |
| LexAudit (Vercel) | `https://rgbwlaifhfvlxgamwcnz.supabase.co` (DB2 — owns `lexaudit_*`) |
| LeadForge (Vercel) | `https://rgbwlaifhfvlxgamwcnz.supabase.co` (DB2) |
| DocAI (Vercel) | `https://rgbwlaifhfvlxgamwcnz.supabase.co` (DB2 — owns `docai_*`) |
| EA Worker | `https://ydghhcuuopqzgqcicubg.supabase.co` (DB1 — writes leads to `leads`, reads `tracr_orders`) |
| OCI Deal Router | `https://ydghhcuuopqzgqcicubg.supabase.co` (DB1 — `deal_router_leads`, `partners`, `payouts` already migrated here in B2) |

> **Each project has its own `_ANON_KEY` and `_SERVICE_ROLE_KEY`.** Don't paste the DB1 keys into a DB2 project — Supabase rejects with 401.

---

## 1. Hub — Vercel project `bizlegal-ai`

```
# ── REQUIRED (build/runtime depends on these) ──
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://bizlegal-ai.com
NEXT_PUBLIC_HUB_URL=https://bizlegal-ai.com
NEXT_PUBLIC_DISCLAIMER_VERSION=v1.0.0-p4

# Anthropic — used by /risk-engine, /snapshot, regulatory intelligence routes
ANTHROPIC_API_KEY=sk-ant-...

# Supabase DB1 — hub canonical
NEXT_PUBLIC_SUPABASE_URL=https://ydghhcuuopqzgqcicubg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...                          # ← MUST exist (verify-eth uses this exact name)
SUPABASE_SERVICE_ROLE_KEY=...                     # ← also referenced (paste same service-role value)

# Resend — transactional email
RESEND_API_KEY=re_...
RESEND_FROM=intelligence@intelligence.bizlegal-ai.com
RESEND_FROM_NAME=BizLegal AI Intelligence
RESEND_REPLY_TO=team@bizlegal-ai.com

# TRACR ETH crypto checkout — verify-eth route
TRACR_ETH_ADDRESS=0x...                           # ← Moses paste your ETH receiving address
ETHERSCAN_API_KEY=...

# HMAC for inbound-lead routing
BIZLEGAL_INBOUND_SECRET=48320471d447bdf990bf3779f4ecce4e54ed960ace02797c50f588824a5e3db3

# EA Worker URL (where snapshot intake POSTs)
NEXT_PUBLIC_LEAD_INTAKE_URL=https://bizlegal-lead-intake.<your-cf-account>.workers.dev

# OCI Deal Router URL (realestate intake proxy)
OCI_ROUTER_URL=https://router.bizlegal-ai.com    # set when DNS lands; until then http://151.145.81.139

# ── PAYMENTS — current (NOWPayments + PayPal only until MoR approved) ──
NOWPAYMENTS_API_KEY=...
NOWPAYMENTS_IPN_SECRET=...
PAYPAL_ENV=live                                    # or "sandbox" for testing
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...                   # client-side init

# ── PAYMENTS — POST-MoR-approval (DO NOT SET YET) ──
# Set these only after LemonSqueezy / Paddle approves and the new bizlegal-ai
# is fully live + functioning + old version removed (per Moses 2026-04-27).
# NEXT_PUBLIC_LEMONSQUEEZY_PRO_URL=
# LEMONSQUEEZY_WEBHOOK_SECRET=
# PADDLE_PUBLIC_KEY=
# PADDLE_API_KEY=
# PADDLE_WEBHOOK_SECRET=

# ── OPTIONAL (graceful fallback) ──
GOOGLE_GEMINI_API_KEY=...                          # fallback when Anthropic is rate-limited
GOOGLE_API_KEY=...                                 # used by some calculator tools
OPENAI_API_KEY=sk-...                              # blog hero image gen (optional)
ALPHA_VANTAGE_API_KEY=...                          # crypto price helpers
SLACK_WEBHOOK_URL=...                              # optional ops alerts
SENTRY_DSN=                                        # optional error tracking
CRON_SECRET=...                                    # if you wire a Vercel cron
DASHBOARD_PASSWORD=...                             # admin pages
NEXT_PUBLIC_PAYONEER_BRAI_LINK=https://...
COMPLIANCE_SUPABASE_URL=                           # leave blank if same as main Supabase
COMPLIANCE_SUPABASE_SERVICE_KEY=                   # leave blank if same
SVIX_SERVER_URL=
SVIX_TOKEN=
ICEBERG_TOKEN=
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/...
```

**What will break without each:**
- `TRACR_ETH_ADDRESS` missing → `/api/tracr/verify-eth` returns 500 (graceful — by design after the lazy-init fix).
- `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_SERVICE_KEY` missing → all DB-touching routes return 500.
- `ANTHROPIC_API_KEY` missing → `/risk-engine`, `/snapshot` return 500.
- `RESEND_API_KEY` missing → email delivery fails silently (logged but POST returns 200).
- `BIZLEGAL_INBOUND_SECRET` missing → realestate-intake proxy returns 500.

---

## 2. TRCR — Vercel project `tracr`

```
# ── REQUIRED ──
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://tracr.bizlegal-ai.com

# Supabase DB1 — TRCR's master tables live in DB1 per CLAUDE.md
NEXT_PUBLIC_SUPABASE_URL=https://ydghhcuuopqzgqcicubg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Anthropic — TRACR report generation
ANTHROPIC_API_KEY=sk-ant-...

# Chain APIs
GOLDRUSH_API_KEY=cqt_...                           # primary
ETHERSCAN_API_KEY=...                              # fallback

# Resend
RESEND_API_KEY=re_...
RESEND_FROM=intelligence@intelligence.bizlegal-ai.com
RESEND_FROM_NAME=BizLegal AI Intelligence
RESEND_REPLY_TO=team@bizlegal-ai.com

# HMAC inbound-lead (Phase 4 route)
BIZLEGAL_INBOUND_SECRET=48320471d447bdf990bf3779f4ecce4e54ed960ace02797c50f588824a5e3db3

# ── PAYMENTS — NOWPayments + PayPal + Payoneer hosted-checkout ──
NOWPAYMENTS_API_KEY=...
NOWPAYMENTS_IPN_SECRET=...
PAYPAL_ENV=live
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_WEBHOOK_ID=...
NEXT_PUBLIC_PAYONEER_TRCR_STANDARD_LINK=https://...
NEXT_PUBLIC_PAYONEER_TRCR_PROFESSIONAL_LINK=https://...
NEXT_PUBLIC_PAYONEER_TRCR_ENTERPRISE_LINK=https://...

# ── OPTIONAL ──
SVIX_SERVER_URL=
SVIX_TOKEN=
ICEBERG_TOKEN=
```

---

## 3. BRAI — Vercel project `brai` (frontend)

> The Next.js shell at `brai.bizlegal-ai.com`. Backend lives on Render (next section).

```
# ── REQUIRED (Vercel) ──
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://brai.bizlegal-ai.com
NEXT_PUBLIC_HUB_URL=https://bizlegal-ai.com
NEXT_PUBLIC_DISCLAIMER_VERSION=v1.0.0-p4

# Backend URL — points the frontend to the Render Python API
NEXT_PUBLIC_BRAI_API_URL=https://blockchain-agents.onrender.com

# Supabase DB2 — BRAI uses product-runtime DB
NEXT_PUBLIC_SUPABASE_URL=https://rgbwlaifhfvlxgamwcnz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...                  # ← DB2 anon key, not DB1's

# Resend
RESEND_API_KEY=re_...
RESEND_FROM=intelligence@intelligence.bizlegal-ai.com
RESEND_FROM_NAME=BizLegal AI Intelligence
RESEND_REPLY_TO=team@bizlegal-ai.com

# HMAC for /api/inbound-lead (Phase 4 — the BRAI Vercel route, not Render)
BIZLEGAL_INBOUND_SECRET=48320471d447bdf990bf3779f4ecce4e54ed960ace02797c50f588824a5e3db3

# Anthropic — Next.js /api/digest route
ANTHROPIC_API_KEY=sk-ant-...

# ── OPTIONAL (Vercel) ──
GOOGLE_GEMINI_API_KEY=...
NEXT_PUBLIC_PAYONEER_BRAI_LINK=https://...
SLACK_WEBHOOK_URL=...
```

---

## 4. BRAI — Render service `blockchain-agents` (Python backend)

```
# ── REQUIRED ──
ENV=production
LOG_LEVEL=INFO
APP_URL=https://blockchain-agents.onrender.com
PORT=8000                                          # Render auto-sets, leave or override

# Anthropic — agent orchestrator brain
ANTHROPIC_API_KEY=sk-ant-...

# Chain APIs — risk scoring & wallet analysis
ALCHEMY_API_KEY=...
ETHERSCAN_API_KEY=...
MORALIS_API_KEY=...

# Supabase DB2 — BRAI's primary store
SUPABASE_URL=https://rgbwlaifhfvlxgamwcnz.supabase.co
SUPABASE_KEY=...                                    # service role key for DB2 (bypasses RLS)
SUPABASE_SERVICE_KEY=...                            # alt name some code uses

# Email — Resend ONLY (SendGrid removed per pivot policy)
RESEND_API_KEY=re_...
RESEND_FROM=intelligence@intelligence.bizlegal-ai.com
FROM_EMAIL=intelligence@intelligence.bizlegal-ai.com   # legacy code path uses FROM_EMAIL
FROM_NAME=BizLegal AI Intelligence

# Payments — NOWPayments + PayPal only (Stripe + Coinbase removed per pivot policy)
NOWPAYMENTS_API_KEY=...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# API keys allowed to hit /analyze (comma-separated keys you generate yourself)
VALID_API_KEYS=brai-prod-key-1,brai-prod-key-2

# HMAC inbound-lead from EA Worker (Phase 4)
BIZLEGAL_INBOUND_SECRET=48320471d447bdf990bf3779f4ecce4e54ed960ace02797c50f588824a5e3db3

# ── OPTIONAL ──
SLACK_WEBHOOK=https://hooks.slack.com/services/...   # ops alerts
PLATFORM_DB_PATH=                                    # leave blank to use Supabase (default)

# Observability (Langfuse) — optional but recommended
LANGFUSE_PUBLIC_KEY=pk_lf_...
LANGFUSE_SECRET_KEY=sk_lf_...
LANGFUSE_HOST=https://cloud.langfuse.com
```

> **Render TODO:** also remove the now-unused env vars from the `render.yaml`'s envVars block:
> - `SENDGRID_API_KEY` — no longer needed (Resend takes its place).
> - `STRIPE_SECRET_KEY` — pivot policy: no Stripe until first revenue.
> - `COINBASE_COMMERCE_KEY` — pivot policy: no Coinbase until first revenue.
>
> Leaving them in `render.yaml` causes Render's UI to keep prompting you to set values. Remove from yaml + delete from Render dashboard.

**What will break without each:**
- `ANTHROPIC_API_KEY` → `/analyze` 500.
- `ETHERSCAN_API_KEY` or `ALCHEMY_API_KEY` → no chain data → `/analyze` 500.
- `SUPABASE_URL` or `SUPABASE_KEY` → no persistence → 500.
- `BIZLEGAL_INBOUND_SECRET` → `/api/inbound-lead` 401 → leads silently dropped.
- `VALID_API_KEYS` → `/analyze` rejects every request as unauthenticated.
- `RESEND_API_KEY` → email fails.

---

## 5. Quick-reference — the 4 absolutely-must-set values today

| # | Where | Var | Why |
|---|---|---|---|
| 1 | Vercel hub | `TRACR_ETH_ADDRESS` | Unblocks TRCR ETH checkout — currently 500 |
| 2 | Vercel hub + TRCR + BRAI | `BIZLEGAL_INBOUND_SECRET` (cross-service paste) | EA Worker → product lead routing (HMAC verify) |
| 3 | Render BRAI | `BIZLEGAL_INBOUND_SECRET` | Same — must match hub/products byte-for-byte |
| 4 | All projects | `RESEND_FROM`, `RESEND_FROM_NAME`, `RESEND_REPLY_TO` | Replace any old `reports@bizlegal-ai.com` with `intelligence@intelligence.bizlegal-ai.com` so emails actually deliver |

LemonSqueezy + Paddle vars → wait until reapply approved.

---

## 6. Reapply gating (Moses constraint)

> "Need to reapply only after new bizlegal is live and functioning (old version no longer exists)" — 2026-04-27.

**Reapply checklist before submitting MoR (LemonSqueezy + Paddle):**
- [ ] Hub PR #18 merged + production deploy of main green.
- [ ] 4 product PRs (BRAI #1, LexAudit #2, DocAI #2, LeadForge #1) merged + production green.
- [ ] TRCR PR #2 merged + production green.
- [ ] All 6 subdomains return 200 on `/`, `/api/digest`, `/api/inbound-lead`.
- [ ] DNS A record `router.bizlegal-ai.com` → 151.145.81.139 lands; OCI router `/health` returns 200 on the FQDN.
- [ ] Old version of bizlegal-ai content removed (no `seo_pages` ghosts visible to crawlers — sitemap reflects only canonical hub URLs).
- [ ] Cookie banner appears on first visit; footer shows operator entity + branded contact email.
- [ ] Forge BOI Kit + TRACR scanner + Pro snapshot all complete a smoke test transaction with NOWPayments **or** PayPal (not LS/Paddle yet — those come post-approval).
- [ ] Smoke test from incognito browser by a non-Moses tester (friend/colleague) reports trust ≥ 8/10.

When ALL boxes green → submit reapply using `decisions/MOR_REAPPLY.md` text.

---

## 7. How to upload to each platform

### Vercel (hub, tracr, brai-frontend)
1. Open project → Settings → Environment Variables.
2. Click **"Bulk Edit"**.
3. Paste the relevant section above.
4. Set scope to **Production** (and Preview if desired).
5. Save.
6. **Redeploy** the latest commit (Vercel doesn't auto-redeploy on env change).

### Render (BRAI backend)
1. Open service `blockchain-agents` → Environment.
2. Click **"Add from .env"** (top right).
3. Paste section 4.
4. Save — Render auto-redeploys.

---

## 8. Verification (after upload)

```bash
# Hub TRACR ETH endpoint should return 400 (txHash required), not 500
curl -i https://bizlegal-ai.com/api/tracr/verify-eth -X POST \
  -H 'content-type: application/json' -d '{}'

# Hub realestate intake should return 400 (validation), not 500
curl -i https://bizlegal-ai.com/api/realestate-intake -X POST \
  -H 'content-type: application/json' -d '{}'

# TRCR digest
curl -s https://tracr.bizlegal-ai.com/api/digest | jq '.'

# BRAI Render health
curl -s https://blockchain-agents.onrender.com/health | jq '.'

# BRAI Vercel digest
curl -s https://brai.bizlegal-ai.com/api/digest | jq '.'

# Resend smoke (sends a real email — use your own RECIPIENT)
curl -s https://api.resend.com/emails \
  -H "Authorization: Bearer $RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "BizLegal AI Intelligence <intelligence@intelligence.bizlegal-ai.com>",
    "to": ["team@bizlegal-ai.com"],
    "reply_to": "team@bizlegal-ai.com",
    "subject": "Resend domain smoke test",
    "text": "If this lands in your inbox, intelligence.bizlegal-ai.com is verified end-to-end."
  }'
```

If any return 500: check Render logs / Vercel logs / Resend dashboard.

---

## 9. Where to get values from

`~/.claude/canonical-env-clean.env` (or `C:\Users\Moshe Dor\.env.CANONICAL.txt`) on Moses's machine. Names map 1:1 with this kit. **Never commit canonical-env-clean.env to a public repo.**
