# funnel-mvp — Fastify → Next.js Migration (Phase RR-2)

**Date:** 2026-05-24
**Author:** Claude (per Moses's directive)
**Status:** Code complete; awaiting Moses to create Vercel project + point DNS

---

## The decision

Migrate the contract-risk funnel from a Fastify service (`services/funnel-mvp/`) to a Next.js 15 app on Vercel (`apps/funnel-mvp/`). Drop Firebase. Drop LemonSqueezy. Keep PayPal. Use Anthropic Haiku 4.5 as the primary AI extraction (Minimax fallback).

## Why

The Fastify service had been blocking revenue for 3+ weeks waiting on:
- LemonSqueezy credentials (the 4th LS application was rejected on 2026-05-20)
- Firebase service account JSON (never added to vault)
- A deploy target (Hetzner / Fly / Railway / OCI — none picked)

Every other product surface in the monorepo is Next.js on Vercel and works fine. Continuing to maintain Fastify + Firebase + LemonSqueezy as a parallel stack for one product had no upside.

## Stack changes

| Layer | Before | After | Reason |
|---|---|---|---|
| Framework | Fastify (Node standalone) | Next.js 15 (Vercel serverless) | Matches the 7 other apps; free hosting; no SSH/systemd |
| DB | Firestore | Supabase Postgres (`funnel_jobs`) | Canonical data layer for the monorepo |
| Storage | Firebase Storage | Supabase Storage (`funnel-uploads` bucket) | Same auth as DB; one fewer Google project to manage |
| Card payments | LemonSqueezy | PayPal Orders v2 | LS rejected 4× upstream; PayPal already live across the fleet |
| AI extraction | Ollama (local) + Minimax fallback | Anthropic Haiku 4.5 + Minimax fallback | Vercel functions can't run Ollama; Anthropic is already in vault |
| Auth on shared infra | n/a (standalone) | Reuses BIZLEGAL_INBOUND_SECRET HMAC, /api/ops/log | Auto-plugs into per-surface dashboards |
| Analytics | none | Plausible (env-gated) | Inherits Phase RR R5 layout pattern |
| Affiliate tracking | n/a | reads `bz_aff` cookie on upload, writes `funnel_jobs.affiliate_code` | Inherits Phase RR R3 pattern; one 90-day cookie spans all surfaces |

## Hetzner deployment — considered + rejected

Question raised: "Hetzner is attached to Forge — should funnel-mvp deploy there too?"

**Clarification:** Forge runs on Vercel. Hetzner runs the *curator pipeline* (scout / brain / publisher / bot) that *produces content for* Forge. Hetzner is "attached to Forge" in the data-flow sense, not the hosting sense.

**Could we put funnel-mvp on Hetzner?** Yes — the CX32 has spare capacity. We'd need:
- New systemd unit (`funnel-mvp.service`)
- Caddy reverse proxy rule for `funnel.bizlegal-ai.com`
- Cloudflare Tunnel route addition
- Manual deploy via `ssh hetzner && git pull && systemctl restart`

**Why not:**
- 7× the maintenance surface vs Vercel (SSH, systemd, Caddy, certs, OS updates)
- Distinct failure domain from curator — a funnel crash could OOM-kill bot.py and break the content engine
- File upload + PDF gen on a single 4GB box doesn't scale linearly with traffic
- Plausible script, affiliate cookie, ops_log HMAC, per-surface dashboard — all auto-apply on Vercel because of the framework conventions; Hetzner requires reproducing each manually

**Vercel wins on every axis** for an MVP funnel that takes one PayPal payment per session.

## Cloud connectivity within ai.leadx10@gmail.com

Every cloud service the funnel touches lives in (or signs in via) `ai.leadx10@gmail.com`:

| Service | Account | Purpose | Setup state |
|---|---|---|---|
| Vercel | `ai.leadx10@gmail.com` (team `aileadx10-5415s-projects`) | Hosts the Next.js app | Active; needs new project for funnel-mvp |
| Supabase | `ai.leadx10@gmail.com` | DB (`funnel_jobs`) + Storage (`funnel-uploads`) | Active; migration applied 2026-05-24 |
| Anthropic | `ai.leadx10@gmail.com` (via `ANTHROPIC_API_KEY` in vault) | Haiku 4.5 extraction | Active |
| PayPal | `ai.leadx10@gmail.com` (sandbox + soon-live) | Card payments | Sandbox active; live flip pending |
| Google Drive | `ai.leadx10@gmail.com` (`BizLegal Daily Reviews/`) | Daily review reports archive | Active (per the daily-review agent) |
| Google Search Console | `ai.leadx10@gmail.com` | 8 property verifications | Active; needs SA invite for the gsc-bot Worker |
| GCP | `ai.leadx10@gmail.com` (project `bizlegal-gsc`) | Service account for GSC bot only | Pending (Moses task per `MOSES-PHASE-RR-ACTIVATION.md`) |
| Cloudflare | `ai.leadx10@gmail.com` | DNS + Workers (gsc-bot, telegram-hub, lead-intake) | Active |

**Cross-service auth pattern:** every third-party service uses `ai.leadx10@gmail.com` as the human owner. Programmatic auth uses API keys / service accounts stored in the canonical vault (`C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt`) and mirrored to Vercel env. No service-to-service OAuth — everything talks via HMAC signed bodies (BizLegal-internal) or vendor-issued bearer tokens (third-party).

## What shipped today

```
apps/funnel-mvp/
├── app/
│   ├── layout.tsx                              Plausible + topbar + footer
│   ├── page.tsx                                Landing with UploadForm
│   ├── UploadForm.tsx                          Client component
│   ├── globals.css                             Dark theme, mono accents
│   ├── report/[id]/page.tsx                    Server-side fetch + ReportView
│   ├── report/[id]/ReportView.tsx              Client component with polling + PayPal CTA
│   └── api/
│       ├── upload/route.ts                     multipart → parse → extract → preview_ready
│       ├── jobs/[id]/route.ts                  GET state + fresh signed PDF URL
│       ├── payments/paypal/start/route.ts      Create Orders v2 order
│       ├── payments/paypal/webhook/route.ts    Capture → mark paid → build PDF → mark full_report_ready
│       ├── ops/health/route.ts                 Per-subdomain env audit (matches every other sub)
│       └── digest/route.ts                     Daily aggregator (hub consumes this)
├── lib/
│   ├── supabase.ts                             Service-role client + STORAGE_BUCKET const
│   ├── extract.ts                              PDF (pdf-parse) + DOCX (mammoth) + txt fallback
│   ├── paypal.ts                               OAuth + createOneTimeOrder + captureOrder
│   ├── report.ts                               pdfkit → upload to storage
│   └── ai/
│       ├── schema.ts                           Zod schema + buildPreview helper
│       ├── anthropic.ts                        Haiku 4.5 primary (canonical model id)
│       ├── minimax.ts                          Fallback (uses MINIMAX_API_KEY)
│       └── extract.ts                          Two-tier with-fallback wrapper
├── supabase/                                   (mirror; canonical SQL lives in apps/hub/supabase/migrations/)
├── package.json
├── tsconfig.json
├── next.config.mjs
├── vercel.json                                 5 functions with maxDuration; security headers
├── .env.example                                Full env list with comments
└── CLAUDE.md                                   Per-app operating book
```

**Supabase migration applied:** `20260524_funnel_jobs.sql` — table `funnel_jobs` + RLS + auto-touched `updated_at` trigger.

**Lifecycle:** `uploaded → extracting → preview_ready → payment_pending → paid → full_report_ready` (or `failed` at any step).

## What's left for Moses (~30 min)

1. **Create Vercel project** (~5 min)
   - https://vercel.com → New Project → import `aileadx10-boop/bizlegal-monorepo` → name `funnel-mvp` → Root Directory `apps/funnel-mvp` → Framework Next.js
2. **Add env vars** (~10 min) — copy from canonical vault to Vercel UI:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   SUPABASE_SERVICE_KEY
   NEXT_PUBLIC_SUPABASE_ANON_KEY  (optional, only for client-side reads later)
   ANTHROPIC_API_KEY
   MINIMAX_API_KEY                (optional fallback)
   PAYPAL_CLIENT_ID
   PAYPAL_CLIENT_SECRET
   PAYPAL_ENV=sandbox             (flip to `live` for real money)
   PAYPAL_WEBHOOK_ID              (optional; signature verification)
   BIZLEGAL_INBOUND_SECRET
   NEXT_PUBLIC_APP_URL=https://funnel.bizlegal-ai.com
   NEXT_PUBLIC_PLAUSIBLE_DOMAIN=bizlegal-ai.com
   SUPABASE_STORAGE_BUCKET=funnel-uploads
   ```
3. **Create Supabase Storage bucket** (~2 min)
   - https://supabase.com/dashboard/project/ydghhcuuopqzgqcicubg/storage/buckets → New bucket → name `funnel-uploads` → keep Private
4. **Point DNS** (~5 min)
   - Cloudflare → bizlegal-ai.com → DNS → CNAME `funnel` → `cname.vercel-dns.com` (Vercel will validate via the project's domain settings)
5. **Register PayPal webhook** (~5 min, once `PAYPAL_ENV=live`)
   - PayPal Dashboard → Webhooks → URL `https://funnel.bizlegal-ai.com/api/payments/paypal/webhook` → events `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED`
   - Copy webhook ID into `PAYPAL_WEBHOOK_ID` env
6. **Smoke test** (~5 min)
   - Upload any 1-page PDF at `https://funnel.bizlegal-ai.com`
   - Verify preview renders + PayPal sandbox checkout completes + PDF download appears
   - Check `/ops/subdomains?t=$OPS_DASHBOARD_TOKEN` → `funnel-mvp` row should appear with status=200

After step 6, the funnel takes real revenue. The first paying customer should land within 24h of step 6 + one outbound campaign.

## What's still left (system-wide, post-funnel)

Reference: `decisions/MOSES-PHASE-RR-ACTIVATION.md` (the master Moses queue).

Highest leverage remaining:
1. Plausible account + env (5 min — unblocks every measurement)
2. PayPal LIVE flip (5 min — converts every sandbox URL to real revenue)
3. GSC service-account JSON + Worker deploy (10 min — automates SEO compounding)
4. Affiliate launch announcement (20 min — zero-CAC channel turns on)
5. Hetzner publisher syndication patch ✅ already applied this session
6. Social API tokens (LinkedIn first — 10 min) for Phase RR R4 channel fanout

## Verification commands (after Moses ships steps 1-5)

```powershell
# Funnel reachable
(Invoke-WebRequest 'https://funnel.bizlegal-ai.com/').StatusCode

# Health endpoint exposed
Invoke-RestMethod 'https://funnel.bizlegal-ai.com/api/ops/health'

# Digest aggregator returns valid shape
Invoke-RestMethod 'https://funnel.bizlegal-ai.com/api/digest'

# /ops/subdomains aggregates it
$tok = $env:OPS_DASHBOARD_TOKEN
(Invoke-WebRequest "https://bizlegal-ai.com/ops/subdomains?t=$tok").StatusCode
```

## References

- Old (Fastify) version: [`services/funnel-mvp/CLAUDE.md`](../services/funnel-mvp/CLAUDE.md) — deprecated, kept for reference
- New (Next.js) version: [`apps/funnel-mvp/CLAUDE.md`](../apps/funnel-mvp/CLAUDE.md)
- Supabase migration: `apps/hub/supabase/migrations/20260524_funnel_jobs.sql`
- Master Moses queue: [`decisions/MOSES-PHASE-RR-ACTIVATION.md`](MOSES-PHASE-RR-ACTIVATION.md)
- Earlier funnel doc (Z1.E import): [`services/funnel-mvp/README.md`](../services/funnel-mvp/README.md)
