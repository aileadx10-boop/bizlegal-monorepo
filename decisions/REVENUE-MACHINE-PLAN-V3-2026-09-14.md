# ONE REVENUE MACHINE — program plan v3 (2026-09-14)

## 0 — Context and decisions

**Goal ladder (Moses):** first real payment by **2026-09-20 (G0)** → 4-figure MRR by month 6 → 5-figure MRR in 6–12 months → exit or 6-figure MRR at 18–24 months; **$4K MRR from Grok Bot retainers**; **10,000 indexed pages** across the ecosystem in 6–12 months; every page enriched with infographics/diagrams from free LLM quotas; DocAI as a top-tier legal-docs generator; an authentic look (tracr light/dark now, Claude-Design brief later); everything live, payable, self-feeding, no manual ops; Moses ops last; §31 answered; API cost table + realistic 6/12/18/24/30/36-month goals; the final audit the most thorough of all.

**Decisions taken by Moses this session (AskUserQuestion):** I run `vercel --prod` for FirmCited after an explicit go · monorepo merges to `main` + pushes after an explicit go · `legal-revenue-os` → DARK reference side branch · Hetzner executed over SSH after an explicit go (supersedes "runbook only") · **$127 = Anthropic Console prepaid credits** (already funds the API; the $70 on the key is a workspace spend cap — raise it at console.anthropic.com → Settings → Limits if the plan's budget needs it) · **10,000 = indexed pages** · **Grok Bot revenue = retainers $500–2K/mo × 3–6 firms; Cursor Pro $20/mo approved** · **API ceiling ≤ $100/mo total**.

**Evidence standard:** every claim probed this session (curl, Vercel deployments API, Supabase SQL, SSH, vault grep — names/lengths only) or file:line-cited by five read-only sweeps. Docs that disagreed with code were wrong; the plan fixes them.

---

## 1 — Ground truth (corrections that change the orders)

| Docs said | Reality (verified today) |
|---|---|
| Anthropic credits $0 | **Vault key works** (1-token `claude-sonnet-5` → 200); $127 prepaid, $70/mo key cap. **Hetzner box runs a different key** (sha mismatch) → 400, plus `ANTHROPIC_MODEL=claude-sonnet-4-6` (retired) → *every* LLM agent on the box fails on key/model, not credits (`LLM plan fallback: HTTP Error 400`). |
| Other LLM keys | **Valid:** Gemini 2.5 Flash/Flash-Lite/Pro (free tier), OpenAI (130 models), Perplexity (`sonar`), OpenRouter (**free tier, usage 0**), SerpAPI set. Local Ollama (Windows): `gemma4:12b`, `hermes3`, `qwen2.5:7b`, `glm4`, `deepseek-coder:33b` + Ollama-cloud `kimi-k3:cloud`/`glm-5.2:cloud`/`kimi-k2.7-code:cloud`. Hetzner Ollama: `mistral-nemo`, `llama3.2:3b`. |
| Cloudflare token | The vault's canonical `CLOUDFLARE_API_TOKEN` now holds a **53-char active token with zone access** (zone `1e1091fb…`, 28 records listed) — the names `globalcftoken09-26`/`dnscftoken09-26` are not in the vault, but the canonical name works → **DNS automation unblocked.** The earlier pasted `cfut_…` token has no zone perms — leave it unused and revoke it (it is in this chat). DNS facts: `antiguru55` CNAME present + proxied → **200**; `cited`/`bench` dns-only CNAMEs; **two conflicting `_dmarc.bizlegal-ai.com` TXT records** (`p=quarantine` rua admin@ *and* `p=none` rua team@ → receivers apply no policy); apex SPF `include:spf.privateemail.com ~all`; SendGrid `s1/s2._domainkey` CNAMEs + privateemail `default._domainkey`; `intelligence.` has Resend DKIM + `send.intelligence` SPF (SES) but **no `_dmarc.intelligence`**; no records for sellerradar/falseecho/leaseparse/closeflow/propsignal/`notes`/`hub`; `google-site-verification` TXT on the apex (GSC domain property is verified). |
| OnePath "pushed" | No GitHub repo `aileadx10-boop/onepath` exists and the local clone has no remote — live via Vercel + CNAME only. Repo creation + git link stays in phase O. |
| Google Workspace CLI | `gws` 0.22.5 installed with `client_secret.json`, **`auth_method: none`** — one interactive `gws auth login` (Moses, browser) unlocks the `gws-*` skills (Gmail filters/labels, Sheets append, Drive upload, Calendar). |
| Scraping credits | Firecrawl **435/1,000 credits** left this period (plan ends 09-29) — enough for the 100-firm leak-scan sprint (~1–3 credits/firm). `APIFY_TOKEN` empty; Bright Data absent. |
| GSC | `Downloads/bizlegal-gsc-b81f7c2fc0c5.json` = service account `bizlegal-gsc-bot@bizlegal-gsc.iam.gserviceaccount.com`; **authenticates, sees 0 properties** → add it as **Owner** on the Search Console properties (a `sc-domain:bizlegal-ai.com` domain property covers every subdomain). |
| FirmCited Phase 0/Stage 1 done | Prod = `c431eb6` (09-08); `8ebd65d`/`ec5fd2c`/`368b742` not deployed; `/intake*` 404. Deploy worktree ready (`368b742`, clean). `fc_audits` has **0 rows ever**. |
| "revert 4ccce6a" | $490 live; running it reintroduces $20. Landmine still in `Downloads/BIZLEGAL_SYSTEM_MAP_MEMORY.md` + `KIMI_WORKER_PROMPT.md`. |
| O-018 stuck / byline open | On `main`; `/ai-practice-review`, `/kit` 200; byline real. Only `bizlegal-morning-brief` routine has no file. |
| Grok Bot (O-019) | `/grok-bot` live; 2 pitches + 2 follow-ups sent, **0 replies** (`fc_inbound_replies` 0) — replies go to unwatched `support@bizlegal-ai.com`; 52-lead approval-gated sender built, dry (needs `CAN_SPAM_ADDRESS`); `pre-audit-close` recovery fired 4× (last today); 13 `fc_leads` all `valid`. |
| OnePath/antiguru | Source `C:\Users\Moshe Dor\onepath` (git, **no remote**); Vercel project `onepath` READY; `antiguru55.bizlegal-ai.com` attached on Vercel, no CF record; `NEXT_PUBLIC_APP_URL` deliberately on `vercel.app` until DNS. Webhook→member path never saw a completed charge. |
| Blog stale since 07-27 | Newest post Sep 1; 434 URLs; stalled with the box's LLM failure. |
| Sitemaps healthy | Hub `public/sitemap.xml` (15 URLs, `hub.` host) **shadows** the ~200-URL `app/sitemap.ts`; `public/robots.txt` shadows the AI-bot BLOCK list on hub/tracr/brai/lexaudit/leadforge (hub allows Bytespider+Diffbot); `sitemap-index.xml` advertised, absent; **231 `seo_pages` in no sitemap**; IndexNow key 404 on forge/docai; hub `/api/indexnow` never cron-called; 6 `/tools/*` missing; 7 apps lack `llms.txt`; 4 apps have no robots/sitemap at all. Live URLs ≈ 723. |
| Telegram wired | Hub reads legacy `TELEGRAM_BOT_TOKEN/CHAT_ID`; canonical `TELEGRAM_HUB_TOKEN` **empty in vault, unset on box** → 7 "canonical" agents post nothing; `@BizlegalHubBot` worker undeployed (1042). |
| Money | `fc_orders` 0 paid; `payment_orders` 1 active = `smoke_zero` simulated 50¢. **$0 real, ever.** Suppression 123; `sales_campaign` 0; `newsletter_subscribers` 2; `lead_nurture_state` 0; `daily_gaps` 25 published / 10 picked. |

**Confirmed code defects (fleet, file:line in the sweeps):** A) PayPal one-time orders fulfilled **without capture** on lexaudit/tracr/brai (missing `/payment/paypal/return`; webhook activates on `CHECKOUT.ORDER.APPROVED`); docai same webhook flaw; monthly SKUs on sellerradar/falseecho/`packages/payment` bill once. B) Forge limiter fails open on an LLM-spending POST. C) LeadForge ×4 (NXDOMAIN banner, fabricated deals without disclaimer, hardcoded quiet-day digest, env-name lie + anon-key degrade). D) LexAudit HMAC `===`. E) docai/forge digest silent zero. F) sellerradar/falseecho `next.config` lack `outputFileTracingRoot`; sellerradar never emails the paid report; both call Resend directly. G) leaseparse gives the paid deliverable to anyone (`ingest/route.ts:21-27`), no IPN/grant, buckets missing. H) deal44 no self-serve checkout, `$699` placeholder, public `/admin`. I) closeflow/propsignal hardcoded 503; propsignal sources `throw not_implemented`. J) DocAI: unauthenticated 2.4–4K-token Sonnet on `/api/agents/*` + `/api/dpa/negotiate`, zero PII redaction, no zod, retired model ids, silent OpenAI fallback, "PDF export" = `window.print()`, 38 `.docx` templates unreferenced, no email delivery. K) Hub Pro $149/Scale $499 have no product spec and no grant. L) `conversion_funnel_agent` cart-recovery query 400s (unencoded `+` in ISO timestamp); `enterprise_closer` writes non-uuid ids to legacy `lead_outreach`; `monetization_agent` reads `lead_outreach`, no heartbeat, 96×/day. M) `infographic_generator --from-mdx` arg bug; `seo_audits` table missing. N) three theme systems; coguard `'midnight'` invalid; 5 apps no CSS; `ui-v2` ×6 copies.

---

## 2 — The machine: how it feeds itself (every circle → next circle, with the code that does it)

```
CONTENT  scout(Ollama) → daily_gaps → brain(Sonnet) → publisher → blog/hub/forge pages → sitemaps+IndexNow+GSC
   ↓ traffic                                                     ↑ case studies / reports (E) close the loop
CAPTURE  free tools (hub/docai/forge/lexaudit/leadforge/cited) → Turnstile → leads + nurture enqueue (@bizlegal/nurture-enqueue)
   ↓
NURTURE  Worker 4-step · FirmCited day 1/3/7 · hub /api/sales/drafts (warm, approve tap) · conversion_funnel cart-recovery (fixed in C)
   ↓
BOOK/BUY hub /api/pay/start (7 rails) · FirmCited $490/$2,000 · sellerradar/falseecho in-app · deal44 (B3) · leaseparse (B4)
   ↓
DELIVER  fail-closed IPNs → grants → PDF/report/room/checklist → @bizlegal/email → thank-you + cross-sell (forge boi→tracker, leadforge→retainer, FirmCited audit→intake pilot→Grok Bot retainer)
   ↓
RETAIN   monitors ($99/$149/$299) · intake weekly report (W4) · Grok Bot retainer weekly report · five-numbers.mjs
   ↓
REPORT   ops_events → /ops/metrics → morning brief (Telegram) → new content topics (daily_gaps) → CONTENT
```
Each arrow already has code; what is missing per arrow is exactly the REPAIR/CONNECT list in §3. Nothing net-new is required to close the loop except deal44 checkout, leaseparse paid gate, hub grants, and the Gmail sender adapter.

---

## 3 — §31 answer (executed by the phases below; also rendered to `decisions/REVENUE-MACHINE-ANSWER-2026-09-14.md`)

**CONNECT (unlocks existing value, 0 new code beyond glue):** vault Anthropic key + `claude-sonnet-5` → Hetzner (revives ~15 agents) · curator → local Ollama (`127.0.0.1:11434`) · FirmCited git → prod (`vercel --prod`) · monorepo branch → `main` → 9 Vercel projects · PayPal capture → lexaudit/tracr/brai · hub grants → deal44/leaseparse · Gmail `OutboundSender` → outbound v2 · `seo_pages` + guides + tools → sitemaps → IndexNow cron → GSC (after Owner grant) · `TELEGRAM_HUB_TOKEN` value → box + vault + hub · OnePath → GitHub + Vercel git link + CNAME · GSC SA → pinger · free-quota LLM routing → every content agent.
**REPAIR:** defects A–N above, the two Hetzner query bugs (L), the sitemap/robots shadows, the retired model ids fleet-wide (`claude-sonnet-4-6/4-5` → `ANTHROPIC_MODEL ?? 'claude-sonnet-5'`), Grok Bot reply capture, docs landmines.
**REMOVE:** LRO from the live path · `code_fixer` (timer that patches prod) · `revenue_alerter` per-minute · 3 duplicate newsletters · static sitemap/robots shadows · dead hub PayPal routes (`api/tracr/paypal-order`, `api/products/[product]/create-order`) · deal44 `/admin` page · hub Pro/Scale checkout (no grant) · non-compliant `cold-email-sequences.md` · `funnel-mvp` after 30 paid days · hardcoded chat id `989097520` defaults · 9 orphan DNS placeholders once real hosts exist.
**BUILD (only these):** deal44 self-serve checkout + grant · leaseparse paid gate + grant + buckets · closeflow wiring on `@bizlegal/closing-engine` · propsignal sources (FEMA/EPA/Socrata) · DocAI DOCX/PDF/clauses/jurisdiction/review-gate/delivery · hub memberships grant + table · design tokens package · programmatic-SEO page factory with quality gate (to 10,000) · infographic/diagram enrichment step.
**ORDER:** A (rails + FirmCited) → C (Hetzner) → B1 sellerradar → B3 deal44 → B4 leaseparse → S (SEO) → T/O/K → D (sales) → B2 falseecho → P (page factory) → Wave 2: B5 closeflow → DA DocAI → G design → B6 propsignal → OCI.

---

## 4 — Phases

### A — Rails + FirmCited relight (branch `fix/phase0-relight-2026-09-10`)
- **A0 probes** done (credits, ledger, routes, worktree).
- **A1 code** (no new env names except where marked → vault first): PayPal capture ported to lexaudit/tracr/brai from `apps/hub/lib/payments/paypal-capture.ts` + `app/payment/paypal/return/route.ts` (GET, 303s; `PAYPAL_ENV` base; tracr/brai get `payment/{success,cancelled}` pages) + webhook hunk on all four incl. docai · forge limiter fail-closed via `@bizlegal/rate-limit` + `parseWindowMs` + test · LeadForge c1–c4 (+ `lib/digest.ts` test) · LexAudit `timingSafeEqual` · docai/forge digest `degraded` · **model ids fleet-wide** `ANTHROPIC_MODEL ?? 'claude-sonnet-5'` (docai `lib/anthropic.ts:13`, `seed-kb.ts:133`, `dpa/negotiate:77`; hub `ai-policy-generator:120`; grep `claude-sonnet-4`, `claude-opus-4`, `claude-haiku-4-5` → keep Haiku 4.5 as the cheap tier) · DocAI security hunk: `redactPii` (port of `apps/lexaudit/lib/safe/redact.ts`) before every LLM call, zod at 12 route boundaries, `/api/agents/*` + `/api/dpa/negotiate` behind `checkTierAccess` with a free preview, OpenAI fallback only on 5xx + ops `error` event · hub `/pricing` Pro/Scale → "Contact" until a grant exists (K).
- **A2 LRO** side branch `feat/legal-revenue-os-reference` (DARK header; ≈13 literal env names → vault; both audits on staged; one §8 pointer on the fix branch).
- **A3 commit per concern → `--ff-only` merge → push [go]** → `list_deployments` READY on hub `prj_vHUtI3FMPRIs2Qhih9Znh8j5a98v`, lexaudit `prj_RbxFLDOZz0RJVZ7t7oksAYBLEvP4`, forge `prj_OBZTIUFbi7nlMm5rnrwD9eSUoRTx`, leadforge-ai `prj_EvFVyDLoW0njq61ksnFNVsQlydDp`, docai-frontend `prj_TcYk46JRBid9zoXJoTbbhlKzUoDe`, trcr `prj_lzf3QcJEN15OKuWCtPO2sNEkDXxt`, brai `prj_959uKA7e3plOkn3XIpQphxn8jM3V`, deal44 `prj_1A2ypHTVaroMVcIyJcbZuV3j0ypY` → curl proofs.
- **A4 FirmCited deploy [go]** from `<scratchpad>\fc-deploy` (`368b742`) → READY → 7 routes 200, unknown slug 404, one `metadata.test` inquiry → `fc_intake_inquiries` +1 · `provision-subscriptions.mjs` for the two intake plans [go] + `sync-env --vercel prj_Zt5A81KYSnw6NKQQIqKuph0MX8O9`.

### C — Hetzner over SSH [go] (`root@204.168.209.235`)
1. Backup `.env` + crontab → `/opt/bizlegal/backups/2026-09-14/`.
2. `ANTHROPIC_API_KEY` ← vault value (piped, never printed); `ANTHROPIC_MODEL=claude-sonnet-5`; `GOOGLE_GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `PERPLEXITY_API_KEY` ← vault (for the routing in P); box probe → 200.
3. `OLLAMA_TUNNEL_URL=http://127.0.0.1:11434`; `systemctl start curator-scout.service` → `daily_gaps` delta.
4. `TELEGRAM_HUB_TOKEN` ← the working bot value (copied inside the box); mirrored in the vault.
5. Repo fixes then SCP: `conversion_funnel_agent.py` URL-encode the ISO timestamp; `enterprise_closer_agent.py` → `sales_outreach` uuid; `monetization_agent.py` → `sales_outreach`/`sales_reply` + `_heartbeat`, hourly; crontab `infographic_generator.py --from-mdx <dir>`; `seo_audits` migration.
6. Cron diet: `revenue_alerter` `0 */6`; `code_fixer` disabled; `self_heal`/`ops_alerts` `*/30`; newsletters: keep hub Mon 13:00 only. `crontab -l > services/cron_jobs.txt`; reconcile the two `daily_orchestrator` crontab variants.
7. Proof: `agent_runs` success rows for an LLM agent in the next hour; `conversion_funnel` log without `22007`.

### B — Dark apps live + payable (Vercel CLI authenticated; Supabase MCP; vault-read scripts)
Common: MCP `create_git_project(repo aileadx10-boop/bizlegal-monorepo, rootDirectory apps/<x>[/web], teamId team_MIY0V66DInbXE2vxoZd6ay3D)`; `scripts/vercel-env-sync.mjs` (vault → `vercel env add`, values never printed); `vercel domains add`; **`scripts/cf-dns-sync.mjs` runs THIS session [go]** (idempotent, reads `CLOUDFLARE_API_TOKEN`, zone `1e1091fb…`, dry-run first, prints the diff): CNAME `sellerradar falseecho leaseparse closeflow propsignal → cname.vercel-dns.com` (proxied off until first 200, then on); `hub → bizlegal-ai.com` (kills the NXDOMAIN link forever); **DMARC repair:** delete the `p=none` duplicate, keep one `_dmarc.bizlegal-ai.com "v=DMARC1; p=quarantine; rua=mailto:team@bizlegal-ai.com; pct=100"`; add `_dmarc.intelligence.bizlegal-ai.com "v=DMARC1; p=quarantine; rua=mailto:team@bizlegal-ai.com"` (Resend transactional domain — Google's bulk-sender rule requires DMARC on the sending domain); `notes` (outbound v2 domain) records staged but **not** applied until the sender is chosen. `scripts/paypal-provision-plans.mjs` (from `Firmcited/scripts/provision-subscriptions.mjs`) [go].
- **B1 sellerradar** ($49 / $99-mo): `outputFileTracingRoot`; `fulfill.ts` → `sendReportReady`; monthly → PayPal Subscriptions (`PAYPAL_PLAN_ID_SELLERRADAR_MONITOR_MONTHLY`) + `BILLING.SUBSCRIPTION.ACTIVATED`; `robots`/`llms.txt`; project + 19 envs + domain; smoke = gateway URLs returned, **no payment executed**.
- **B3 deal44** (₪2,500): `/start` currency picker → hub `/api/pay/start` (`deal44_room_setup_ils` crypto | `deal44_room_setup_usd` repriced from `$699` to the FX twin of ₪2,500, constant documented); hub `deal44-grant.ts` → room + `deals.paid_order_id`; delete `app/admin/page.tsx`. Push deploys it.
- **B4 leaseparse** ($59): migration `20260914_leaseparse_paid_gate.sql`; `ingest`/`upload-url` require an `active` order; hub `leaseparse-grant.ts`; buckets via SQL; Claude default with the `$80/mo` cap in code; project (`apps/leaseparse/web`) + envs + domain; `LEASEPARSE_CHECKOUT_LIVE=1` after a preview dry run.
- **B2 falseecho** ($29 / $149-mo): B1's three hunks + engine pre-flight in `fulfill.ts` (hold `pending_engine` + alert if any of the 4 keys fails) — all four keys are valid today.
- **B5 closeflow** — Wave 2 (landing deploys now, gate off). **B6 propsignal** — landing now, checkout dark until sources exist (order O-025). **B7 coguard** untouched.

### S — SEO/GEO/AEO + P — the page factory to 10,000 indexed pages
1. **Unshadow** (in A3): delete hub `public/sitemap.xml` + the five `public/robots.txt`; hub `app/sitemap.ts` derives guides from `GUIDES`, adds the 6 `/tools/*`, queries `seo_pages` (231); real `app/sitemap-index.xml/route.ts`; FirmCited lastmod from content dates; shared `packages/themes/src/seo.ts` (robots with the 35-allow/10-block list, sitemap, llms.txt) wired into bench/deal44/sellerradar/falseecho/leaseparse/closeflow/propsignal/coguard; IndexNow key file → forge/docai; `/api/indexnow` daily in `apps/hub/vercel.json`.
2. **GSC** (after Moses adds the SA as Owner): vault `GSC_SERVICE_ACCOUNT_JSON` ← the Downloads file (JSON on one line); `gsc_indexnow_pinger.py` submits all 10+ sitemaps + reads coverage into `seo_pages.index_status`; `index_status.py` (currently `skipped`) starts reporting.
3. **Page factory (P) — the 10,000 target, honest math:** today ≈ 723 URLs + 231 `seo_pages`. Programmatic matrix on the hub: 12 regulations × 50 jurisdictions (600) + 15 tools × 20 "for <industry>" (300) + glossary 500 terms + 67 guides × 10 "checklist/FAQ/template" variants (670) + forge gap pages (jurisdiction × obligation, 1,000+) + FirmCited answers (state × practice area, 50 × 8 = 400) + blog 5/day on the fixed flywheel (1,800/yr) ≈ **5,000–6,000 in 6 months, 10,000 in 12** — *if* each page passes a quality gate (≥600 words, ≥3 sourced citations from the regulation registry, unique FAQ schema, internal links ≥5, no LLM boilerplate — `quality_gate.py` extended) and Google indexes ≥60% (typical for thin-risk programmatic sets; below 40% = stop and consolidate). Generation cost on the routing below ≈ **$0.01–0.04/page** → ≤$150 total for 5,000 pages; enrichment (diagram + OG image) is code, not LLM. Deliverable now: `services/seo-agents/page_factory.py` (matrix → `seo_pages` rows → Next.js `app/[hub]/[slug]` renders from the table) + the sitemap query. Weekly proof = `seo_pages` count + GSC indexed count.
4. **Enrichment on every page (free-first):** diagrams = Mermaid rendered server-side to SVG at build (deterministic, $0); infographics = `og_image_generator.py` + Satori-style SVG templates fed by the page's data (the existing `infographic_generator.py` once its arg bug is fixed); raster images only where Gemini's image endpoint free quota allows, else none (no OpenAI `gpt-image-1` — paid). Text enrichment (FAQ, summary, key-dates table) via the routing table.

### LLM routing table (engineered into `services/agents/llm_router.py` tiers + a per-agent daily budget in `ops_events`)
| Tier | Provider/model | Cost | Use |
|---|---|---|---|
| 0 | Ollama Hetzner `mistral-nemo` / `llama3.2:3b`; Windows `gemma4:12b`, `hermes3`, `qwen2.5:7b` via tunnel | $0 | scout filter/rank, lead scoring, classification, drafts' first pass, summaries |
| 1 | Gemini 2.5 Flash-Lite → Flash (free tier: ~1,000 RPD Lite / ~250 RPD Flash — verify in AI Studio) | $0 | page factory text, FAQ, enrichment, AEO answers |
| 2 | OpenRouter `:free` models (free tier, usage 0) + Ollama-cloud `kimi-k3:cloud`/`glm-5.2:cloud` | $0 | overflow for tier 1; long-context rewrites |
| 3 | Anthropic Haiku 4.5 | ~$1/M in | intake_qualify-style constrained JSON, reply classification |
| 4 | Anthropic Sonnet 5 | ~$3/$15 per M | **paid deliverables only**: FirmCited audit narrative, DocAI paid generation, brain.py final drafts, enterprise closer drafts |
| 5 | Perplexity `sonar` / SerpAPI | PAYG | citations research, falseecho engines — only per paid order or ≤$20/mo |
Rule: every agent declares its tier; tier ≥3 calls carry `budget_key` and stop at the daily cap; router logs `{agent, provider, tokens, usd}` to `ops_events` → `/ops/metrics` gets an LLM-spend panel (K/cost dashboard gap closed).

### T / O / K / GB — Telegram, OnePath, memberships, Grok Bot
- **T:** hub reads `TELEGRAM_HUB_TOKEN ?? TELEGRAM_BOT_TOKEN` / `TELEGRAM_MOSES_CHAT_ID ?? TELEGRAM_CHAT_ID`; vault `TELEGRAM_HUB_TOKEN=` filled; hardcoded `989097520` defaults removed; `decisions/TELEGRAM-BOTS-ROLES-2026-09-14.md`; `@BizlegalHubBot` worker after `wrangler login` (F).
- **O:** `gh repo create aileadx10-boop/onepath --private` + push [go]; `vercel git connect`; CNAME staged; after DNS flip `NEXT_PUBLIC_APP_URL` to `https://antiguru55.bizlegal-ai.com` + redeploy (PayPal webhook stays on `vercel.app`); README corrected; `CLAUDE.md` §1 line. Moses's $29 test buy proves webhook→member.
- **K:** Pro/Scale → "Contact" (A1); entitlement map in the §31 doc; `memberships` table + `hub-membership-grant.ts` = Wave 2.
- **GB — Grok Bot revenue path, wired:** *ladder* workshop $150–250/hr → **$490 audit** (fully deliverable: all 4 engines valid) → setup $1.5–5K → **retainer $500–2K/mo** (client's own $20–30/mo subscription pass-through). **$4K MRR = 3–6 retainers.** Funnel math from FirmCited's own five numbers: 52 verified leads (37 direct) + 100-PI-firm sprint → ≥10 conversations → 2–3 audits → 2 setups → 2 retainers in 90 days; at month 6, 4–6 retainers. Agent-side now: `RESEND_REPLY_TO` already → `ai.leadx10@gmail.com`; `CAN_SPAM_ADDRESS` value gate stays closed until Moses supplies the postal address (fail-closed, correct); the 52-lead sender stays `--dry-run`; `pre-audit-close` recovery keeps firing; Grok Bot retainer weekly report = clone of `monitor-digest.ts` (Wave 2). **Cursor Pro $20/mo approved** → the demo team fires a routine + log = the proof asset (Moses: 15 min paste + screenshot). Moses-side: forward `support@bizlegal-ai.com` → `ai.leadx10@gmail.com` (Namecheap) — the 4 sent mails' replies are unwatched today.

### GP — The Google path: Gmail that lands, a digest that tells the truth, Google apps as the operator console
1. **Deliverability (no spam):** transactional (Resend, `intelligence.bizlegal-ai.com`) → DKIM ✓ + SPF ✓ + **DMARC added (B common)**; apex DMARC de-duplicated; `List-Unsubscribe` + `List-Unsubscribe-Post: One-Click` headers on every non-transactional send inside `@bizlegal/email` (Google/Yahoo bulk-sender rule) — verify the package sets them, add if not; Google **Postmaster Tools** for `bizlegal-ai.com` (Moses, same site-verification TXT) → spam-rate + domain reputation panel; warm path for Moses's Gmail cold sends: ≤20/day, plain text, no links in touch 1, reply-to = same mailbox, one-line unsubscribe, verified addresses only (rule 7 v2) — the Gmail adapter (D1) enforces the cap. Old mail to `support@bizlegal-ai.com` → forward to `ai.leadx10@gmail.com` (Moses, Namecheap).
2. **Daily digest v2 (`services/agents/daily_digest.py`, sent 08:00 UTC via hub `/api/internal/send-email` → `ai.leadx10@gmail.com`):** replace the legacy queries (`lead_outreach`, `leadforge_leads`-only, `subscribers`, wrong `brai…/ops` link, hardcoded `$68/day`) with a **per-surface table**: for each of hub, docai, forge, lexaudit, tracr, brai, leadforge, bench, cited (`fc_orders`/`fc_leads`/`fc_intake_*`/`fc_email_log`), deal44 (`deals`/`deal_rooms`), sellerradar (`sellerradar_orders/_leads`), falseecho (`falseecho_scans/_orders`), leaseparse, onepath (Neon — via its `/api/cron/daily` report endpoint or "n/a") → leads 24h · outreach 24h (`sales_outreach` + `fc_outbound`/`fc_email_log` kinds) · payments 24h (real vs simulated, product, gateway) · MRR (active subs × price) · SEO (`seo_pages` delta, `daily_gaps` published, GSC indexed count once the SA has Owner) · agent health per agent (`agent_runs` ok/failed with the failing names listed) · **LLM spend by tier** (from `ops_events`, once the router logs it) · the plan's targets (G0 → $2–4K MRR m3 → $4–8K m6 → $10–20K m12) with "today vs target"; subject line = `BizLegal daily · $X real · N leads · M pages`. Same digest posted to Telegram (`TELEGRAM_HUB_TOKEN`) in short form. Weekly (Mon) = five-numbers table + kill-rule status.
3. **Google apps as the console (after `gws auth login`, Moses, 2 min):** Gmail filter + label `BizLegal/Digest` and `BizLegal/Replies` (`recipe-create-gmail-filter`); a Google Sheet **"BizLegal Ops Console"** with tabs Leads / Drafts-to-approve / Orders / Pages — appended daily by the digest job (`gws-sheets-append`) so approvals can be a checkbox column read back by the hub `/api/sales/drafts` (approve = row flag → HMAC POST); Drive folder **"BizLegal Reports"** receiving weekly PDFs/MD (`gws-drive-upload`) — this is also the **NotebookLM source folder**: NotebookLM has no public API, so a notebook "BizLegal Brain" imports from that Drive folder; `decisions/NOTEBOOKLM-SOURCES.md` lists the canonical files (CLAUDE.md, KIMI.md, the system map, the §31 answer, this plan's handoff) to re-sync weekly; Calendar entries for the cron fleet (`gws-calendar-insert`) so the schedule is visible without SSH. Gemini in Gmail/Sheets then answers "what happened yesterday" over the digest + sheet without any code.
4. **Scraping credits verdict:** Firecrawl — enough (435 credits) for the sprint and the leak scans; renewal 09-29 on the current plan. **Apify** — create the free plan ($5/mo credits) only for the Google-Maps law-firm scraper to build verified, published-address lead lists (`source_url` = the Maps listing) — set `APIFY_TOKEN` in the vault; ~$5/1,000 places on the free credits. **Bright Data — not needed** (no anti-bot targets; state-bar directories + Maps + firm sites cover the ICP). Perplexity/SerpAPI stay per-order.

### D — Sales + marketing connections (nothing sends)
`outbound-dispatch/route.ts:139` `'{{unsubscribe}}'` → real URL; Gmail `OutboundSender` (`packages/email/src/senders/gmail.ts`, `OUTBOUND_SENDER=gmail` → vault) dark; `weekly-newsletter.ts` → `@bizlegal/email` or disabled; doc banners (`cold-email-sequences.md` NON-COMPLIANT; three CLAUDE.md corrected). Wave 2: seo-agents → `llm_router` tiers (D2). Moses taps: leak-scan drafts → `/ops` → `export-approved-gmail.ts --dry-run`; 2 Reddit posts; 3 directory listings.

### E — Docs, §31 doc, handoff, memory
Corrections into `FULL-SYSTEM-MAP-2026-09-11.md` (dated block), both Downloads files (landmine removed; credits work; keys valid; box key mismatch; OnePath found; CF token perms; GSC SA), `KIMI.md`, `CLAUDE.md` §7/§8, `orders/O-017/O-018/O-019/O-023/O-024` + `ORDERS.md`; new orders O-025 propsignal sources, O-026 closeflow, O-027 DocAI top-tier, O-028 design + Claude-Design brief, O-029 OCI, O-030 onepath adopt/kill, O-031 page factory to 10K. `decisions/REVENUE-MACHINE-ANSWER-2026-09-14.md` (§3 + the tables below). Handoff `decisions/REVENUE-OS-RELIGHT-2026-09-14.md` (Shipped w/ hashes + deployment ids / Blocked / five numbers from tables / Next). Memory: `project_revenue_os_intake_prong` update; new `reference_vault_token_truth_2026-09-14` (credits work; box key differs; CF token no zone perms; GSC SA needs Owner; Avast CA bundle for Python = `REQUESTS_CA_BUNDLE=D:/legal_os/scripts/cacerts-bundle.pem`); `reference_firmcited_deploy_lag`.

### Wave 2 (orders filed): **DA DocAI top-tier** — DOCX from the 38 orphan templates (`docx`/`docxtemplater`) + PDF (`pdf-lib`, pattern `services/worker/src/pdf.ts`) → paid delivery (`download_token` + `@bizlegal/email`, pattern `ai-policy-generator/download`) → auto review gate → contract clause library → jurisdiction packs (`deal-engine` `JurisdictionPack` + `reviewed`) → lineage → pgvector → redline; one pricing source. **G design** — tracr `theme-v2.css` → `packages/themes/src/tokens.css`, fix coguard/hub ids, wire 3 CSS-less apps, collapse 7+6 copies, one `SiteShell`; `decisions/DESIGN-BRIEF-2026-09-14.md` for the Claude-Design session (editorial/Swiss, violet→gold light/dark, type pairing, per-surface hero, banned-pattern list). **B5/B6/OCI** as above.

---

## 5 — Estimated API cost per month to reach /goal (engineered to ≤ $100; prepaid $127 covers months 1–2 of Anthropic)

| Line | Now | Months 1–3 | Months 4–12 | Notes |
|---|---|---|---|---|
| Anthropic (Haiku tier 3 + Sonnet tier 4, paid deliverables + brain/closer) | $0 spent | $30–60 | $50–70 (cap) | Sonnet only on paid outputs; audit narrative ≈ $0.30–0.60/audit; DocAI paid gen ≈ $0.05–0.15/doc; brain.py ≈ $0.10/post |
| Gemini Flash-Lite/Flash (page factory, enrichment) | $0 | $0 (free tier) | $0–15 if RPD exceeded | 5,000 pages ≈ 2.5M tokens ≈ free within daily quotas over 90 days |
| Ollama (Hetzner + Windows) | $0 | $0 | $0 | fixed compute already paid |
| OpenRouter `:free` + Ollama-cloud | $0 | $0 | $0 | overflow only |
| Perplexity + SerpAPI (citations; falseecho engines) | $0 | $5–20 | ≤$20 | per paid falseecho order ≈ $0.40; research capped |
| OpenAI | $0 | $0 | $0 | fallback disabled except 5xx; no image gen |
| Cursor Pro (Grok Bot demo team) | $0 | $20 | $20 | approved |
| ZeroBounce PAYG (only if outbound v2 goes live) | $0 | $0–16 | $16–32 | or Moses's verifier |
| Firecrawl (existing plan, 435 credits left) · Apify free plan ($5 credits) · Bright Data | existing | $0–5 | $0–5 | leak scans + Maps lead lists; Bright Data not needed |
| Cloudflare / Vercel / Supabase / Resend / Hetzner | existing | existing | Supabase Pro likely by month 6 (+$25) | watch row/egress with 10K pages |
| **Total incremental** | **$0** | **$55–116** | **$86–162** | at the ≤$100 ceiling: Anthropic stays ≤$70, Perplexity ≤$20, Cursor $20; Gemini/Ollama absorb the volume |

## 6 — Realistic goals (no phony promises; every number is conditional on the five numbers — response ≥10%, demo→pay ≥20%, activation ≥70%, ROI shown, month-4 retention ≥70%)

| Horizon | Revenue (MRR + one-time) | Pages indexed | What must be true |
|---|---|---|---|
| **Sep 20 (G0)** | $490 (one audit) | ~700 | A+C+A4 shipped; Moses's real buy |
| **Month 3** | $2–4K MRR + $4–8K one-time | 2,000–3,000 | 2 intake pilots ($750/mo) + 1–2 Grok Bot retainers ($500–1K) + 3–6 monitors; sellerradar/falseecho 5–10 sales; hub corpus unshadowed; page factory running |
| **Month 6** | **$4–8K MRR** | 5,000–6,000 | 4–6 retainers (the $4K Grok Bot goal) + 3–5 intake firms + DocAI Team/Firm 10–20; index rate ≥60% |
| **Month 12** | **$10–20K MRR** | **10,000** | 8–15 intake firms × $750–1,500 + 6–10 retainers + 20–50 DocAI subs + monitors; GSC-verified |
| **Month 18** | $18–30K MRR | 12,000+ | Stage 3 pilot (litigation intelligence $2.5–5K/mo) with 3–5 boutiques; DocAI top-tier live |
| **Month 24** | $25–45K MRR ($300–540K ARR) → **exit range $1–2.5M at 3–5×** or keep building | 15,000 | month-4 retention proven twice; ≤2h/week manual per customer (the kill rule) |
| **Month 30** | $40–70K MRR | — | Stage 3 at 10–15 boutiques; intake 25+ firms |
| **Month 36** | $70–110K MRR (**6 figures/month only at the top of this band**) | — | requires Stage 3 scaled + one more vertical; not promised — a stretch case |
Kill rules (THE-MACHINE): <10 conversations per 100 firms or <2 pilots per 10 conversations → change the offer; page index rate <40% → stop the factory and consolidate.

---

## 7 — Moses residue (after everything above)
1. Revoke the `cfut_…` token pasted in chat (the vault's canonical token already does the job); `gws auth login` (browser, 2 min) so the Google console pieces run; Google Postmaster Tools for `bizlegal-ai.com`.
2. **Search Console:** add `bizlegal-gsc-bot@bizlegal-gsc.iam.gserviceaccount.com` as Owner (domain property).
3. **The real $490 buy** at cited.bizlegal-ai.com/audit → G0.
4. `support@bizlegal-ai.com` → `ai.leadx10@gmail.com` forwarding (Namecheap); `CAN_SPAM_ADDRESS` postal value; approve the 52-lead Tier-1 send; Cursor Pro + Grok Bot installer sign-in + one routine fired + screenshot.
5. Resend inbound route for `INTAKE_INBOUND_DOMAIN` + `RESEND_WEBHOOK_SECRET`; raise the Anthropic key cap only if the spend log shows the $70 wall.
6. OnePath: $29 test buy; adopt into `apps/` or keep external. Sign the first OCI partner. `wrangler login` for the two CF workers.

---

## 8 — Final audit (the most thorough pass; runs after every phase and once more at the end)
1. **Deploy proof:** every touched Vercel project → `list_deployments` READY with the expected sha; FirmCited `368b742`; OnePath unchanged.
2. **Route matrix:** 200/301/303/401/402/404 as designed on every route touched (rails, intake, dark apps, sitemaps, robots, llms.txt, IndexNow key files), all 12 hosts.
3. **Money rails without paying:** every checkout start returns a gateway URL; PayPal return route → 303s; webhooks fail closed (503/401 without secrets); no `active` row created by the agent (SQL diff before/after).
4. **Tables, not logs:** `payment_orders`, `fc_orders`, `fc_audits`, `fc_intake_*`, `sales_*`, `email_suppression_list`, `seo_pages`, `daily_gaps`, `agent_runs` (last 2h success per revived agent), `ops_events` LLM-spend rows.
5. **Hetzner:** box probe 200; `daily_gaps` delta; crontab = repo file; timers active; no `22007`/`22P02` in the two fixed agents' logs.
6. **SEO:** hub sitemap ≥200 URLs on the apex host; robots BLOCK list served on 5 apps; `sitemap-index.xml` 200; IndexNow key 200 on forge/docai; `seo_pages` in sitemap; GSC SA lists ≥1 property after the Owner grant.
7. **Security:** pre-commit audits clean; no secrets printed anywhere in the session transcript except the pasted CF token (rotate); PII redaction test on DocAI; HMAC timing-safe grep = 0 plain `===` on signatures fleet-wide.
8. **Docs = code:** every corrected claim re-read from the file; orders' `status`/`blocked_on` match reality; memory files updated.
9. **Cost:** `/ops/metrics` LLM panel shows the day's spend by tier; Anthropic ≤ cap; free tiers not exceeded (429 count = 0).
10. **Five numbers baseline** written from tables (all zero today) with the kill thresholds beside them.
11. **DNS + email auth:** `dig`/CF API shows exactly one `_dmarc` on the apex, DMARC on `intelligence.`, the five new CNAMEs resolving and returning 200 (proxied on), `hub.bizlegal-ai.com` → apex 301; `mail-tester`-style header check on one digest mail: SPF pass, DKIM pass, DMARC pass, `List-Unsubscribe` present.
12. **Digest v2 proof:** one manual run of `daily_digest.py` → the Gmail inbox shows the per-surface table with numbers equal to the SQL run in the same minute; Telegram short form arrives; the Sheet gets its rows (if `gws` is authenticated).
13. **Credits/quotas:** Firecrawl remaining ≥ 300 after the sprint dry-run; Gemini/OpenRouter 429 count 0; Anthropic spend for the session ≤ $5 (probe + tests only).
14. **Reconciliation pass:** every row of §1 re-probed at the end and marked ✅/❌ with the new evidence; anything still ❌ becomes an order with an owner, never a silent gap.
