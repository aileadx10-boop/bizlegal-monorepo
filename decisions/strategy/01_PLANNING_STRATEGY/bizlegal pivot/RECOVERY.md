# BizLegal-AI — Recovery Manual

**Purpose:** Restore the entire BizLegal-AI fleet (hub + 6 products + Hetzner curator + OCI deal router) from scratch on a new machine, after power/computer/OCI failure. Optimized for *speed*, not elegance.

**Author:** Moses Dor (mdmdmd63@gmail.com / ai.leadx10@gmail.com)
**Last updated:** 2026-04-27
**Workspace:** `C:\Users\Moshe Dor\Downloads\SKOOL-NATE\01_PLANNING_STRATEGY\bizlegal pivot\` (this dir)

---

## 1. Asset registry (where everything lives)

### GitHub repos (source of truth)
| Repo | URL | Role |
|---|---|---|
| `aileadx10-boop/bizlegal-ai` | github.com/aileadx10-boop/bizlegal-ai | Hub @ bizlegal-ai.com |
| `aileadx10-boop/BRAI` | github.com/aileadx10-boop/BRAI | brai.bizlegal-ai.com |
| `aileadx10-boop/lexaudit` | github.com/aileadx10-boop/lexaudit | lexaudit.bizlegal-ai.com |
| `aileadx10-boop/trcr` | github.com/aileadx10-boop/trcr | tracr.bizlegal-ai.com |
| `aileadx10-boop/docai-monorepo` | github.com/aileadx10-boop/docai-monorepo | docai.bizlegal-ai.com |
| `aileadx10-boop/leadforge-ai` | github.com/aileadx10-boop/leadforge-ai | leadforge.bizlegal-ai.com |
| `aileadx10-boop/forge` | github.com/aileadx10-boop/forge | forge.bizlegal-ai.com |
| `aileadx10-boop/bizlegal-ea` | github.com/aileadx10-boop/bizlegal-ea | EA Worker + blog factory + OCI router code |

### Hosting
| System | Where | What |
|---|---|---|
| Vercel | `bizlegal-ai` org | Hub + LexAudit + TRCR + DocAI + LeadForge + Forge (Next.js) |
| Render | `blockchain-agents` service | BRAI Python backend |
| Cloudflare Workers | `bizlegal-lead-intake` | EA Worker + blog factory cron |
| Cloudflare Pages | `blog.bizlegal-ai.com` | Blog site |
| Cloudflare KV | namespace `f56bcfd5fd4d46468da269070a7ad323` | DIGEST_KV (hub aggregation) |
| Supabase | project `ydghhcuuopqzgqcicubg` | All product DBs + deal_router_leads |
| Oracle OCI | dev-instance-1, vcn-openclaw, IP `151.145.81.139`, free tier | OCI Deal Router (FastAPI + Docker + Redis) |
| Hetzner CX32 | (existing box) | n8n + Ollama (laptop GPU via tunnel) + Marimo curator |
| Resend | account `aileadx10-boop` | Transactional email (`reports@bizlegal-ai.com`) |
| LemonSqueezy | account TBD | Pro tier checkout (gated 2026-04-27 reapply) |

### DNS (Cloudflare)
| Record | Target | Status |
|---|---|---|
| `bizlegal-ai.com` A/CNAME | Vercel | LIVE |
| `*.bizlegal-ai.com` (subdomains) | Vercel | LIVE for 6 products |
| `blog.bizlegal-ai.com` | Cloudflare Pages | LIVE |
| `router.bizlegal-ai.com` A | `151.145.81.139` | **PENDING** (B9 blocker) |

### Secrets registry (location, never values)
| Secret | Where stored | Used by |
|---|---|---|
| `BIZLEGAL_INBOUND_SECRET` | EA Worker + each product Vercel/Render env + OCI router .env | HMAC of all inter-service POSTs |
| `ANTHROPIC_API_KEY` | EA Worker secret + each product env + OCI router | Haiku/Sonnet calls |
| `ETHERSCAN_API_KEY` | TRCR Vercel env + BRAI Render env | Chain data |
| `RESEND_API_KEY` | EA Worker + each product | Email |
| `TELEGRAM_BOT_TOKEN` (BIZLEGALHUBBOT `8645124750`) | EA Worker secret | Lead intake alerts |
| `TELEGRAM_CURATOR_BOT_TOKEN` (BIZLEGALFORGEBOT `8749216330`) | Hetzner systemd env | Curator approvals |
| `LEMONSQUEEZY_*` | Hub Vercel env (after reapply) | Pro checkout |
| `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_KEY` | Each product env | DB |
| Canonical local copy | `~/.claude/canonical-env-clean.env` (this machine only) | Never committed |

---

## 2. Restore procedure (cold start on a new machine)

### Prerequisites
1. **Install:** git, gh, node 20.x, pnpm, python 3.12, docker desktop, vercel CLI, wrangler CLI, supabase CLI, ssh client.
2. **Clone all 8 repos** into `~/BIZLEGAL/`:
   ```bash
   mkdir -p ~/BIZLEGAL && cd ~/BIZLEGAL
   for r in bizlegal-ai BRAI lexaudit trcr docai-monorepo leadforge-ai forge bizlegal-ea; do
     gh repo clone "aileadx10-boop/$r"
   done
   ```
3. **Authenticate**:
   ```bash
   gh auth login                # GitHub
   vercel login                 # Vercel
   wrangler login               # Cloudflare
   supabase login               # Supabase
   ```
4. **Restore canonical-env-clean.env** from your password manager / 1Password / yubikey backup. This is the master secrets file. Without it, you cannot continue. **NEVER commit this file.**
5. **Set git author email** to the *verified* GitHub-linked one:
   ```bash
   git config --global user.email "ai.leadx10@gmail.com"   # the dot is critical
   git config --global user.name "Moses Dor"
   ```

### Hub + 6 product subdomains (1 hour)
Each repo's main branch is canonical. Vercel auto-redeploys on push. Render auto-redeploys for BRAI.

```bash
for r in bizlegal-ai lexaudit trcr docai-monorepo leadforge-ai forge BRAI; do
  cd ~/BIZLEGAL/$r
  git checkout main && git pull
done
```

If a Vercel project lost its env vars, paste from canonical-env-clean.env.

### Cloudflare Worker (15 min)
```bash
cd ~/BIZLEGAL/bizlegal-ea/projects/bizlegal-lead-intake
wrangler login
# Restore secrets from canonical:
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put BIZLEGAL_INBOUND_SECRET
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put RESEND_API_KEY
# (etc — full list in wrangler.toml [vars])
wrangler deploy
```

### Hetzner box (30 min, only if Hetzner data lost)
1. Provision new CX32 in Falkenstein, Ubuntu 22.04.
2. SSH in, install: docker, n8n (port 5679), Caddy (port 80/443), python3-venv, redis.
3. Restore n8n workflows from `bizlegal-ea/hetzner/workflows/*.json` (committed copies).
4. Restore Marimo notebooks from `bizlegal-ea/hetzner/notebooks/*.py`.
5. Restore systemd services from `bizlegal-ea/hetzner/systemd/`.
6. Telegram BIZLEGALFORGEBOT chat_id 989097520 — already in Moses's phone.

### OCI Deal Router (45 min, only if OCI free tier reclaimed)
Free-tier instances get reclaimed if idle >7 days. The keep-alive is via systemd cron heartbeat (already configured in `oci-deal-router/systemd/`). If reclaimed:

1. **Provision new instance**: OCI dashboard → Compute → Create instance → VM.Standard.E2.1.Micro, Ubuntu 22.04, in `dev` compartment, `vcn-openclaw`. Add ingress rule for 80/443/22.
2. **Update DNS**: Cloudflare → `router.bizlegal-ai.com` A → new public IP.
3. **SSH in**: `ssh -i ~/.ssh/oci_id_rsa ubuntu@<new-ip>`.
4. **Run setup**:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-plugin nginx caddy git
   git clone https://github.com/aileadx10-boop/bizlegal-ea.git
   cd bizlegal-ea/projects/oci-deal-router
   cp .env.example .env
   # Paste BIZLEGAL_INBOUND_SECRET + ANTHROPIC_API_KEY + SUPABASE_URL/KEY + RESEND_API_KEY + TELEGRAM_BOT_TOKEN
   docker compose up -d
   sudo cp systemd/deal-router.service /etc/systemd/system/
   sudo systemctl enable --now deal-router
   sudo cp Caddyfile /etc/caddy/Caddyfile
   sudo systemctl reload caddy
   ```
5. **Smoke test**: `curl https://router.bizlegal-ai.com/health` → `{"ok":true}`.

### Supabase (only if project lost)
1. Create new project, get new URL + service key.
2. Run all migrations: `supabase db push` against the new project.
3. Update env vars across all products + EA Worker + OCI router.
4. Restore RLS policies.

---

## 3. Action log (chronological — append-only)

> **Rule:** every meaningful action gets one line here. Format: `YYYY-MM-DD HH:MM | what | git ref or URL | why`.

```
2026-04-25 21:24 | Phase 5.1-5.3 cookie + footer + banned-claim | bizlegal-ai d40b594 | MoR prep
2026-04-25 21:26 | Phase 5.4 LemonSqueezy webhook | bizlegal-ai 8c8f77c | Pro tier wire
2026-04-25 23:59 | TRCR /api/inbound-lead | trcr 57669c7 | Phase 4
2026-04-26 18:13 | Hub vercel.json orphan ref fixed | bizlegal-ai af0f692 | build green
2026-04-26 18:25 | Hub author-email re-trigger | bizlegal-ai 92eea6e | Vercel validation
2026-04-26 18:35 | Hub TRACR_ETH_ADDRESS lazy-init | bizlegal-ai cb6bc60 | build green
2026-04-26 19:10 | Stream B B5 ACCEPTED 88%/94%/0-hallucinations | oci-deal-router | quality gate
2026-04-26 ~19  | Stream B B6 deploy SHIPPED | OCI 151.145.81.139 | router live
2026-04-26 ~20  | Stream B B7 EA Worker realestate vertical SHIPPED | bizlegal-ea | routing ready
2026-04-26 ~21  | Stream B B8 hub /realestate page + intake proxy SHIPPED | bizlegal-ai | landing ready
2026-04-26 21:02 | Hub PR #17 merge resolved 5 conflicts + dedup CookieConsent | bizlegal-ai 000b0e4 | unblock prod
2026-04-26 21:05 | Hub PR #17 MERGED to main | bizlegal-ai PR#17 | hub on main
2026-04-26 21:15 | 4 product PRs OPENED (BRAI/LexAudit/DocAI/LeadForge) | awaiting Moses approval | safe gate
2026-04-26 ~22  | Forge audit: /gap returns 200 (was stale 404 in memory) | forge live | revenue path validated
2026-04-27 ~02  | TRCR cherry-pick PR #2 OPENED | trcr chore/add-digest-and-inbound-lead | minimal cuts onto divergent main
2026-04-27 ~03  | Hub PR #18 OPENED — /realestate footer + sitemap cross-link | bizlegal-ai chore/cross-link-realestate | OCI funnel SEO
2026-04-27 ~03  | Strategic docs PR OPENED | bizlegal-ea PR #1 chore/strategic-docs | RECOVERY/FINANCIALS/MOR/CLOUDFLARED/TRAFFIC
2026-04-27 (TBD)| MoR reapply submitted | LemonSqueezy | Paddle parallel | revenue unlock
```

**Append a line every time you commit, deploy, or change config.** This file is the diff between "we know what happened" and "we have to reconstruct from git log + Slack + memory."

---

## 4. What to do when X breaks

### Hub Vercel build fails
1. Check author email on the failing commit: `git log -1 --format='%ae'`. If unverified → `git commit --allow-empty -m "chore(ci): re-trigger" --author="Moses Dor <ai.leadx10@gmail.com>"`.
2. Check for module-level env reads that crash at "Collecting page data" — wrap in lazy getter (see `bizlegal-ai/app/api/tracr/verify-eth/route.ts` for the canonical pattern).
3. Check vercel.json for orphaned route function configs after a delete.

### A subdomain returns 404 / 500
1. `gh api repos/aileadx10-boop/<repo>/deployments?per_page=1` → check ref + state.
2. If the latest deploy is on a feature branch (not main) — that branch has the fix; merge it.
3. If main is broken: revert `git revert HEAD && git push`.

### OCI router stops responding
1. `ssh -i ~/.ssh/oci_id_rsa ubuntu@151.145.81.139`.
2. `docker stats` — RAM > 600 MB? Restart: `docker compose restart`.
3. Logs: `journalctl -u deal-router -f`.
4. If host gone: see "OCI Deal Router" restore above.

### Supabase migration drift
1. `supabase db diff` to see what's different.
2. Apply: `supabase db push`.

### "Why is this email field still failing?"
The verified GitHub-linked email is `ai.leadx10@gmail.com` (with the dot, not `aileadx10@gmail.com`). Vercel rejects commits authored by the dotless one.

---

## 5. Pre-flight before any reapply / customer demo

- [ ] Hub homepage shows Today's Brief + Product Digest, no 500s.
- [ ] All 6 subdomains return 200 on `/`.
- [ ] `forge.bizlegal-ai.com/api/scan` accepts a real payload.
- [ ] `https://router.bizlegal-ai.com/health` returns 200 (after DNS lands).
- [ ] Cookie consent banner appears once per session.
- [ ] Footer shows "BizLegal AI · operated by [legal entity]".
- [ ] Pricing page Pro CTA actually completes a $0.50 LemonSqueezy test transaction.
- [ ] `decisions/log.md` (per-product) has at least last 7 days of activity.
- [ ] This file has the latest action-log entry.

---

## 6. Mental model

- The **hub** is the marketing front door + intelligence aggregator.
- The **6 products** are revenue-generating tools.
- The **EA Worker** routes inbound leads to the right product.
- The **Hetzner curator** writes blog posts to attract organic search traffic.
- The **OCI Deal Router** is the high-ticket real-estate referral funnel.
- **Forge** is the most-baked product → first revenue path (BOI Kit $149).
- **OCI router** is the asymmetric upside path (1 closed deal = $15K-$80K).

Revenue priority: **Forge BOI Kit first** (low friction, $149, real product), **OCI router second** (high reward, 6-9mo payback).
