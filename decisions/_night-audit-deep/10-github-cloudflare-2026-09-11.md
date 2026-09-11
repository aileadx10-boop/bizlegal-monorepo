# 10 — GitHub + Cloudflare account audit, 2026-09-11 (evidence fold-in)

**Agent:** account-level audit of `aileadx10-boop` (gh REST, Vercel API, CF via wrangler/DNS, liveness probes). No secret values printed.

## GitHub — 16 repos (13 active, 3 archived)
- Active: `bizlegal-ea` (→CF Pages blog + CF Worker), `bizlegal-monorepo` (**public**, 9 Vercel links), `legal-os`, `bizlegal-ai` (legacy), `forge` (legacy), `trcr` (legacy, branch master), `BRAI`, `leadforge-ai`, `docai-monorepo` (**public**, stale), `lexaudit`, `lexaudit-safe`, `pipeforge`, `lawyersgonomadv2`. Archived: `app-bizlegal`, `DocAI`, `DocAI-agents`.
- **Workflows:** monorepo `operating-book-check.yml` (CI vault audit); ea `deploy-blog.yml` (push blog/** + manual → CF Pages `bizlegal-blog`), `seo-cron.yml` (M-F 09:00), `topics-cron.yml` (Sun 06:00); legacy bizlegal-ai `lead-pipeline.yml` + `migrate-and-deploy.yml` (push `quantum-wat` → Vercel via `VERCEL_TOKEN`).
- **0 open PRs** on monorepo/ea/legal-os. **11 unmerged monorepo branches**, several stale ≥3 wk (`fix/money-path-and-dealdesk` 07-29, `fix/disarm-cold-outbound` 08-16, `feat/deal-intelligence` 08-22, `fix/close-money-loop`, `feat/deal44-phase0` 09-08, `feat/revenue-marathon` 09-07).

## GitHub Actions secret gaps (🔶CONFIRMED)
- **ea CI envs missing at repo level (LIKELY empty in CI):** `seo-cron.yml`/`topics-cron.yml` reference `GEMINI_API_CONTENT_1`, `GEMINI_API_CONTENT_2`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — **none exist**; Telegram alerts fail silent (guard swallows empty). Generation may be degraded.
- **`CF_PAGES_DEPLOY_HOOK` secret is dead** — comment states the Pages deploy-hook 500s since 2026-05-11; switched to direct `wrangler` upload.
- Legacy `bizlegal-ai` holds live `VERCEL_TOKEN` + `VERCEL_PROJECT_ID`/`TEAM_ID` for a stale push-to-deploy path → could push an old build to prod. 🟡 MEDIUM.

## Cloudflare — read path BROKEN (🔶CONFIRMED, error 9109)
- Zone `bizlegal-ai.com` IS on CF (NS `ali`/`lars`).
- **`CLOUDFLARE_API_TOKEN` in canonical env is INVALID** — Pages-project / Worker / zone inventory NOT enumerable. Blog `blog.bizlegal-ai.com` = 200 (deployment state UNKNOWN, no API). 0 webhooks across all 16 repos.

## Vercel — 19 projects
- **9 live:** apex/`bizlegal-ai` (Hub, ~200 env), lexaudit, trcr, forge, brai, docai-frontend, bench (direct-to-Vercel CNAME, 5 env), leadforge-ai, deal44, firmcited (nolink, direct CNAME), onepath.
- **NEW HIGH FINDING — `onepath`:** live undocumented app "One Path…90 days, no hype" (no git link, no repo, no memory entry) with PayPal/NowPayments/Resend/Neon + daily cron + ADMIN_PASSWORD; its only bizlegal domain `antiguru55.bizlegal-ai.com` has NO DNS record → reachable only via `onepath-vert.vercel.app`. **LIVE, owner intent UNKNOWN — unmonitored billing risk.** (Earlier fleet probe showed OnePath branded subdomain dead while Vercel app serves — now root-caused.)
- **Stale/garbage:** `hub` project = 404, real hub = apex; `leadforge` (8 env) dup of `leadforge-ai`; `.cloudflared` + `vercel-trcr` = 0 env junk; `web` stale; legacy `doc-ai` (← archived DocAI), `docai-monorepo`, `lawyersgonomad` — low-risk cruft.
- DNS: bench + cited = **direct-to-Vercel** (not CF-proxied); 9 dead subdomains confirmed (hub, propsignal, leaseparse, closeflow, coguard, falseecho, sellerradar, caseaudit, antiguru55).

## Bottom line for the map
Confirms the `remove` half: 3 archived repos + 11 unmerged branches + 4 stale/junk Vercel projects + 7 fully-orphaned dark-domains. Adds two ops/Moses questions: **(1)** does `onepath` stay (it has the newest real billing rails — candidate for the Gate-1 path or a kill), **(2)** rotate/reissue `CLOUDFLARE_API_TOKEN` to restore CF enumeration + set the missing ea CI secrets. Security note: monorepo itself is **public** while holding ~200-env wiring — verify no secrets in git history.
