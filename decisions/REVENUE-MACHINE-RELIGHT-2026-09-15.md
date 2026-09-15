# Revenue-machine relight — execution handoff (2026-09-15)

**Plan executed:** `decisions/REVENUE-MACHINE-PLAN-V3-2026-09-14.md` (the session plan `snug-wondering-fog`, copied into the repo). Session: Fable 5.1, auto mode ("I AM OUT GO AUTO MODE"), 2026-09-15.
**Evidence standard:** every "verified" line below was probed this session — Vercel deployments API, Supabase SQL via MCP, `curl --ssl-no-revoke` against production, `ssh` reads on the box, vault greps by name. Values were never printed.

## 0 — One paragraph

The working tree that Codex had deployed to production **uncommitted** (`dpl_H5tyz5…`, aliased to bizlegal-ai.com) is now committed as 14 commits on local `main` (`b8f535b` → `244eb54`), so git matches prod once pushed. The seven new SKUs (CasePage `cp_*`, SinceFiled `sf_*`) return real gateway URLs from the live `/api/pay/start` on both rails. The `sf_*` and `casepage_waitlist` tables now exist in the **fleet** Supabase (Codex's "applied to Neon" had hit the wrong database). O-027 (social autopilot) runs live on 442 real drafts with the digest arriving by email through the hub relay. Everything outward-facing — `git push`, FirmCited `vercel --prod`, Hetzner writes, Vercel env/domains, Cloudflare DNS — was refused by the auto-mode classifier and is packaged below as copy-paste ops. **Real revenue is still $0.**

## 1 — Shipped (local `main`, 14 commits ahead of `origin/main`)

| Hash | Commit | Plan phase |
|---|---|---|
| `b8f535b` | feat(payment): CasePage + SinceFiled SKUs in the registry and hub price-map | B (dark apps) |
| `32d6b40` | feat(casepage): O-025 matter-status pages scaffold (waitlist, pricing, pages API, hub checkout) + `vercel.json`/`next.config.mjs` monorepo build | B |
| `3454499` | feat(sincefiled): O-026 days-since compliance tracker scaffold + monorepo build config | B |
| `d2872e5` | fix(seo): unshadow static robots/sitemap on hub/brai/leadforge/lexaudit/tracr, shared `packages/themes/src/seo.ts`, `seo_pages` → sitemap, IndexNow key files on forge/docai, `/api/indexnow` daily cron | S |
| `162ca9a` | fix(rails): PayPal capture-before-fulfil on lexaudit/tracr/brai (+docai webhook), forge limiter fail-closed + test, LeadForge c1–c4 + digest lib/test, LexAudit timing-safe HMAC, digests "degraded", model ids fleet-wide → `ANTHROPIC_MODEL ?? claude-sonnet-5`, DocAI `redactPii` + zod + 5xx-only fallback, hub Pro/Scale → Contact | A1 |
| `6e3aa95` | fix(agents): conversion_funnel URL-encoding, enterprise_closer → `sales_outreach`, monetization heartbeat, llm_router tiers, brain/factual_review/publisher + OCI off retired model ids | C5 |
| `3d80c65` | feat(tools): O-027 social autopilot — collector/scheduler/digest, hub-relay email, `load-env.mjs` hoisting fix, cron_health | O-027 |
| `bb6a093` | feat(langgap): O-028 scanner + week-0 baseline + Phase B AEO backlog | O-028 A/B |
| `8bef494` | chore(scripts): vercel-env-sync, cf-dns-sync (+casepage/sincefiled hosts), paypal-provision-plans, apply-migrations, **hetzner-relight-2026-09-15.sh** | B common, C |
| `244eb54` | docs: plan v3 into decisions, CasePage/SinceFiled/LRO plans, operating-book pointers (4 new CLAUDE.md) | E |
| `86c7b4d` (branch `feat/legal-revenue-os-reference`) | chore(lro): `services/legal-revenue-os` as a DARK reference side branch; its 13 env names added to the vault empty | A2 |

Also this session, outside git: vault gained `DEMO_MODE=`, `SOCIAL_DIGEST_TO_EMAIL=` and the 13 LRO names (empty); a glued line from an earlier append (`TELEGRAM_MOSES_CHAT_ID…DEMO_MODE=`) was repaired.

## 2 — Verified on production / live systems

| Check | Result |
|---|---|
| Hub production deployment | `dpl_H5tyz5RafymRxkab7YHZ91dE9hU5` READY, aliases `bizlegal-ai.com` + `www`, built from the (then-uncommitted) relight tree by Codex via CLI. Three earlier attempts errored on a stray `}` in `price-map.ts`. |
| `POST /api/pay/start` `cp_setup_490` crypto | **200** → NOWPayments invoice `5667282370`, `amount_cents 49000`, order `149131a5…` (pending smoke row, no money) |
| `POST /api/pay/start` `sf_lifetime_329` card | **200** → PayPal checkout token `2XV54033…`, `amount_cents 32900`, order `656d201c…` (pending smoke row) |
| `/api/pay/start` valid ids | all seven `cp_*`/`sf_*` present |
| `/pricing`, `/sitemap.xml`, `/robots.txt` on the hub | 200 / 200 (26.8 KB) / 200 |
| Fleet Supabase `ydghhcuuopqzgqcicubg` | `casepage_waitlist`, `sf_firms`, `sf_obligations`, `sf_events`, `sf_subscriptions` created via MCP `apply_migration` (were absent) |
| O-027 autopilot | `source=live`, queued **442**, sent **12**, `channel=email` via hub relay, `signature_ok`; 6/6 unit tests |
| Monorepo | `turbo typecheck` 27/27; `@bizlegal/payment` builds; vault audit + operating-book audit + shared-stream audit clean on every commit |
| FirmCited `cited.bizlegal-ai.com/audit` | 200 (the G0 buy page is live) — `/intake` **404** (Stage 1 `368b742` still not deployed) |
| Hetzner (read-only) | `curator/.env` has `ANTHROPIC_MODEL=claude-sonnet-4-6` (retired) and 3 of 7 relight keys; Ollama up (`mistral-nemo`); node v22 present; crontab 58 lines incl. `revenue_alerter` every minute and `code_fixer` every 30 min |
| Vercel projects | `casepage` created + linked (`prj_1csFus536eN32D5i1bkEMP0IzPo7`); `sincefiled` (`prj_5lbpw8fcE9unsDvBPH57PFrpS1gC`) linked; neither git-connected, no envs, no domains |
| Cloudflare DNS (dry run) | diff = 7 CNAMEs (sellerradar, falseecho, leaseparse, closeflow, propsignal, casepage, sincefiled → cname.vercel-dns.com), `hub` → apex, delete the two conflicting apex DMARC TXTs, create one `p=quarantine` + `_dmarc.intelligence` |
| `/api/ops/health?t=<vault token>` | **404** = token mismatch between the vault and the hub's Vercel env (not investigated further) |

## 3 — Five numbers, from tables (2026-09-15, fleet Supabase)

| Table | Value |
|---|---|
| `payment_orders` | active **1** (the simulated `smoke_zero` 50¢), pending 23 (2 are today's smoke probes), cancelled 244 → **$0 real, ever** |
| `fc_orders` | 12 rows: expired 6, pending 4, cancelled 2 → **0 paid**; `fc_audits` 0 |
| `fc_leads` / `fc_intake_inquiries` / `fc_email_log` | 13 / 1 / 194 (recovery-24h 80, digest 61, recovery-1h 40, pre-audit-close 6, grokbot pitch 2 + follow-up 2, intake 3) |
| `sales_outreach` / `sales_campaign` / `lead_nurture_state` | 0 / 0 / 0 |
| `social_drafts` pending | 442 · `seo_pages` 231 · `daily_gaps` 43 · `email_suppression_list` 123 · `newsletter_subscribers` 2 · `compliance_subs` 0 · `deals` 0 |
| `agent_runs` / `ops_events` (all time) | 8,976 / 27,376 |

Kill-rule status: nothing to measure yet — no conversations, no pilots. G0 (first real payment) is due **2026-09-20**.

## 4 — Blocked → Moses ops (copy-paste, in this order, ~20 min)

The auto-mode classifier denied each of these from the agent session (reasons in brackets). None was worked around.

**A. Push (14 commits + 2 branches)** [Out-of-Place Publication]
```bash
cd "C:/Users/Moshe Dor/bizlegal-monorepo" && git push origin main feat/coverage-autopilot-build-2026-09-15 feat/legal-revenue-os-reference
```
Verify: Vercel → the 9 linked projects rebuild from `244eb54` (hub `prj_vHUtI3…`, lexaudit, trcr, forge, brai, docai-frontend, bench, leadforge-ai, deal44). Use the deployments API, not curl — curl cannot tell "not deployed" from "deployed and broken".

**B. FirmCited Stage 1 to production** [Production Deploy] — from the clean worktree at `368b742` (the main `Firmcited` checkout has WIP content files; do not deploy from there):
```bash
cd "C:/Users/Moshe Dor/AppData/Local/Temp/claude/c--Users-Moshe-Dor-bizlegal-monorepo/9f52e740-2085-45ef-bf4d-dc167b20e8f5/scratchpad/fc-deploy" && vercel --prod --yes
curl -s --ssl-no-revoke -o /dev/null -w "%{http_code}\n" https://cited.bizlegal-ai.com/intake   # expect 200
```
If that scratchpad path is gone: `cd "C:/Users/Moshe Dor/Firmcited" && git worktree add --detach ../fc-prod 368b742 && cp -r .vercel ../fc-prod/ && cd ../fc-prod && vercel --prod --yes`.

**C. Hetzner relight** [Remote Shell Writes] — merges the vault's Anthropic/Gemini/OpenRouter/Perplexity keys + `claude-sonnet-5` + local Ollama into `curator/.env`, SCPs the fixed agents and the O-027 tool, diets the crontab, restarts, probes:
```bash
cd "C:/Users/Moshe Dor/bizlegal-monorepo" && bash scripts/hetzner-relight-2026-09-15.sh --dry-run
bash scripts/hetzner-relight-2026-09-15.sh        # expect "anthropic probe: 200"
git add services/cron_jobs.txt && git commit -m "chore(hetzner): crontab after the 2026-09-15 relight"
```

**D. CasePage + SinceFiled go live** [Secret-Store Writes / DNS] — in the Vercel dashboard for `casepage` and `sincefiled`: Settings → Git → connect `aileadx10-boop/bizlegal-monorepo` (production branch `main`); Settings → General → Root Directory `apps/casepage` / `apps/sincefiled` (the CLI `vercel git connect` refuses from an app subdir). Then:
```bash
cd "C:/Users/Moshe Dor/bizlegal-monorepo"
for a in casepage sincefiled; do
  node scripts/vercel-env-sync.mjs apps/$a NEXT_PUBLIC_SUPABASE_URL SUPABASE_SERVICE_KEY NEXT_PUBLIC_SUPABASE_ANON_KEY BIZLEGAL_INBOUND_SECRET NEXT_PUBLIC_HUB_URL --target production,preview
  vercel domains add $a.bizlegal-ai.com $a --scope aileadx10-5415s-projects
done
```
Then Deployments → Redeploy each. Until this runs, the `cp_*`/`sf_*` SKUs are buyable only through `/api/pay/start` — the hub has no page that links to them, so the click-to-buy path for these two products *is* this step.

**E. Cloudflare DNS** [DNS / Domain / Cert Changes]
```bash
node scripts/cf-dns-sync.mjs           # review the diff (7 CNAMEs, hub alias, DMARC repair)
node scripts/cf-dns-sync.mjs --apply
```
Flip each new CNAME to proxied only after the host returns 200.

**F. G0 — the real $490 buy** at `https://cited.bizlegal-ai.com/audit` (after B). This is the only item on this page that produces revenue.

**G. Carried over from plan §7:** Search Console → add `bizlegal-gsc-bot@bizlegal-gsc.iam.gserviceaccount.com` as Owner; `gws auth login`; revoke the `cfut_…` Cloudflare token pasted in chat; forward `support@bizlegal-ai.com` → `ai.leadx10@gmail.com`; `CAN_SPAM_ADDRESS` postal value; Google Postmaster Tools; raise the Anthropic key cap only if the spend log hits the $70 wall.

## 5 — Not done this session (honest list)

- Plan phases **B1 sellerradar, B3 deal44 checkout + grant, B4 leaseparse paid gate, B2 falseecho, S2 GSC pinger, P page factory, T Telegram canonical in the hub, O OnePath repo, K memberships, D Gmail sender, GP digest v2** — untouched. Next session starts with B3/B4 (they need only local code + a migration) once the ops above are done.
- `/ops/health` token mismatch (vault vs Vercel) — investigate, it is the chain's self-test.
- `seo_pages.index_status` column does not exist (plan S2 assumes it) — the GSC pinger needs a migration.
- Day-2 O-027 digest proof depends on the Hetzner cron (C) or a manual run tomorrow.
- The two smoke `payment_orders` rows from today's rail probes (`smoke+casepage-…`, `smoke+sincefiled-…`) will expire on their own; they are `pending`, never `active`.

## 6 — Next session, first five minutes

1. `git status -sb` — is `main` still 14 ahead? If pushed, check the 9 deployments are READY on `244eb54`.
2. `curl -s -o /dev/null -w "%{http_code}" https://cited.bizlegal-ai.com/intake` — 200 means B ran.
3. `ssh -i ~/.ssh/id_ed25519 root@204.168.209.235 "grep -c '^ANTHROPIC_MODEL=claude-sonnet-5' /opt/bizlegal/curator/.env; tail -2 /var/log/social-autopilot.log"` — 1 + a digest line means C ran.
4. `dig +short casepage.bizlegal-ai.com` — a CNAME means E ran.
5. Then continue plan v3 in order: B3 deal44 → B4 leaseparse → B1 sellerradar → S/P.
