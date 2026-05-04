# Phase AA — what's next after Phase Z closed

**Date:** 2026-05-04
**Predecessor:** Phase Z (closed today, all 11 Z7 rows GREEN)
**Goal:** end-to-end perfection across hub + 6 subdomains + Hetzner curator + OCI router + Fastify funnel-mvp BEFORE any payment goes live.

---

## 1. Where everything lives + how to work from VS Code

### The one path that matters

```
C:\Users\Moshe Dor\bizlegal-monorepo\
```

That's the canonical workspace. Open it in VS Code:

```powershell
code "C:\Users\Moshe Dor\bizlegal-monorepo"
```

OR from Start menu → File → Open Folder → navigate to that path.

**Everything you work on lives here:**
```
bizlegal-monorepo/
├── apps/                7 Vercel apps
│   ├── hub/             bizlegal-ai.com (apex)
│   ├── tracr/           tracr.bizlegal-ai.com
│   ├── lexaudit/        lexaudit.bizlegal-ai.com
│   ├── brai/            brai.bizlegal-ai.com
│   ├── docai/           docai.bizlegal-ai.com
│   ├── forge/           forge.bizlegal-ai.com (the SEO content surface)
│   └── leadforge/       leadforge.bizlegal-ai.com
├── services/            non-Vercel runtimes
│   ├── worker/          Cloudflare Worker (lead intake + digest)
│   ├── hetzner/         curator (scout + brain + publisher + bot)
│   ├── oci/             OCI VM router (inbound deal flow)
│   ├── telegram-hub/    @Bizlegalhubbot (FAQ)
│   └── funnel-mvp/      Fastify + Firebase landing funnel
├── packages/            shared libs
│   ├── ops-log/         HMAC-signed event POSTs
│   └── payment/         code-only payment gateway clients
├── agents/              EA brain + prompts + schemas
├── decisions/           ALL planning docs (read these first)
├── infrastructure/      Caddyfile, terraform, systemd units
├── supabase/            consolidated migrations
└── CLAUDE.md            entry point for any Claude session
```

### Working with Claude Code in VS Code

The Claude Code extension you're using right now lives at the top-right of every VS Code window. Three usage modes:

**Mode A — chat with codebase context (most common):**
1. Open the monorepo folder
2. Click the Claude Code icon in the top-right toolbar (or Cmd+Esc / Ctrl+Esc)
3. Type your request — Claude has read access to the whole monorepo and can edit/run/commit
4. Claude follows the rules in `bizlegal-monorepo/CLAUDE.md` automatically

**Mode B — slash commands (faster for repeated patterns):**
- `/plan <feature>` — get a planning doc before coding
- `/code-review` — review the changes you just made
- `/security-reviewer` — security audit
- `/build-fix` — get unstuck when build breaks

**Mode C — terminal alongside chat (debugging):**
- Open Terminal panel (Ctrl+`) — keep it open next to Claude
- When Claude runs a command, you see it execute in real-time
- You can also paste your own commands; Claude sees the output

### Multi-machine reality check

Some services run on machines OTHER than your VS Code workspace:
- **Hetzner curator** runs at `root@204.168.209.235` (compliance-arbitrage). Code there at `/opt/bizlegal/curator/`. Authoritative source is in monorepo's `services/hetzner/` — push there, then `scp` or rsync to Hetzner.
- **OCI router** runs at `ubuntu@151.145.81.139`. Code at `/opt/oci-deal-router/`. Authoritative source: `services/oci/`.
- **Cloudflare Worker** deploys via `cd services/worker && pnpm wrangler deploy` from your machine (no remote SSH needed).
- **Local cloudflared tunnel** runs as Windows service on your machine. Config at `%ProgramData%\Cloudflare\.cloudflared\`.

All of these read from the **canonical env vault** at `C:/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt`. Never set env values anywhere except the vault first; deploy from there.

---

## 2. How to start every service (daily runbook)

### One-time setup (already done)

```powershell
cd "C:\Users\Moshe Dor\bizlegal-monorepo"
pnpm install --ignore-scripts
```

This rebuilds `node_modules` if you've nuked them.

### Starting the dev workflow each morning

```powershell
cd "C:\Users\Moshe Dor\bizlegal-monorepo"

# Terminal 1: hub dev server (so you can see UI changes locally)
cd apps/hub
pnpm dev
# → http://localhost:3000 — apex preview

# Terminal 2: any other app you're working on (e.g. forge)
cd apps/forge
pnpm dev -p 3001
# → http://localhost:3001

# Terminal 3 (optional): Worker dev
cd services/worker
pnpm wrangler dev
```

VS Code's split-terminal panel makes this easy — three tabs side-by-side.

### Running individual jobs (one-shots)

```powershell
# Fire scout manually (don't wait for the cron):
ssh -i ~/.ssh/id_ed25519 root@204.168.209.235 "systemctl start --no-block curator-scout"
ssh -i ~/.ssh/id_ed25519 root@204.168.209.235 "journalctl -u curator-scout -f"  # tail

# Force a hub cron right now (Bearer auth):
TOKEN=$(grep '^CRON_SECRET=' "C:\Users\Moshe Dor\Downloads\env-hub-bizlegal-ai.txt" | cut -d= -f2-)
curl -H "Authorization: Bearer $TOKEN" "https://bizlegal-ai.com/api/cron/ops-alerts?now=1"

# Send synthetic Telegram alert (verifies the chain):
TOKEN=$(grep '^BIZLEGALBOT_TOKEN=' "$VAULT" | cut -d= -f2-)
curl -d "chat_id=989097520" --data-urlencode "text=test from ops" \
  "https://api.telegram.org/bot$TOKEN/sendMessage"
```

### Daily morning check

Paste this in Git Bash (NOT PowerShell — quoting is cleaner):

```bash
TOKEN=$(grep '^OPS_DASHBOARD_TOKEN=' "/c/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt" | cut -d= -f2-)
TOKEN_ENC=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote_plus(sys.argv[1]))" "$TOKEN")

curl -s "https://bizlegal-ai.com/api/ops/health?token=$TOKEN_ENC" | python3 -m json.tool | head -30
```

Look at:
- `ok: true`
- `probes`: 8 surfaces, all `ok: true`
- `hmac.ok: true`
- `envs[].set` — all critical envs `set: true`

Anything red → drill in.

### Bot status

| Bot | How to check it's alive | What it does |
|---|---|---|
| @Bizlegalbot (alerts) | Send `/start` → wait for ops-alerts cron's next *:00, *:15, *:30, *:45 firing | Pushes ops alerts to chat 989097520 |
| @Bizlegalhubbot (FAQ) | Message any keyword (boi, ai-act, privacy, psp, tracr, brai) → expect reply within 5s | Inbound FAQ for visitors |
| @Bizlegalforgebot (curator) | `ssh hetzner "systemctl is-active curator-bot"` → expect `active` | Listens for your pick/deploy commands |

---

## 3. Article quality system — rules every gap page must pass

You said: "I want each article to go through X, be revised, be humanized, get schemes/sketches/graphs/mockups/diagrams, etc."

Here's the rule-system. **No article publishes without passing all 6 gates.**

### The 6 quality gates

| # | Gate | What it produces | Who/what runs it |
|---|---|---|---|
| 1 | **Source draft** | First draft (Claude Sonnet long-form, MDX + frontmatter) | brain.py (already exists) |
| 2 | **Diagram pass** | 1-3 Mermaid diagrams embedded inline + 1 hero image rendered via DALL-E | brain.py emits, publisher.py renders |
| 3 | **Humanize pass** | Strip AI-tells (em-dashes, "delve", "tapestry", "nuanced", listy listy listy), add a personal voice | New step: pass draft through Claude with a humanize prompt |
| 4 | **Factual review** | Cite at least 3 primary sources (regulator URL, statute, official guidance) with link backs. Flag any claim without citation. | New step: factual-review prompt + grep for unanchored claims |
| 5 | **SEO structure** | Schema.org Article + FAQ + Breadcrumb JSON-LD; H1+H2+H3 hierarchy; internal links to ≥3 other gap pages; comparison table if applicable; word count 800-1500 | New step: a Python validator that reads the rendered HTML and grades against a rubric |
| 6 | **Visual richness** | At least 1 of: comparison table OR decision tree (Mermaid) OR data chart (Recharts SVG) OR infographic (DALL-E composite). The rubric requires ≥3 visual elements per article. | publisher.py asserts before pushing to git |

If any gate fails → article goes back to draft state in Supabase, Telegram nudge to Moses with reason. No silent half-quality publish.

### Concrete implementation plan (~10 hours of code work, all in `services/hetzner/`)

#### Step A — extend brain.py output schema

Current schema (line 82 of brain.py): `mermaid: [...]` — already supports diagrams.

Extend to:

```python
EXPECTED_OUTPUT_SCHEMA = {
    "title": "<H1>",
    "slug": "<url-safe>",
    "vertical": "boi|brai|tracr|lexaudit|docai|forge|leadforge",
    "country": "us|eu|uk|...",
    "summary": "<150 chars max — meta description>",
    "keywords": ["<8-12 long-tail keywords>"],
    "body_mdx": "<MDX with embedded mermaid + tables>",
    "mermaid": [
        {"caption": "...", "code": "graph TD\n A --> B"},
        # 1-3 diagrams; flowchart, decision tree, or sequence
    ],
    "comparison_tables": [
        {"caption": "<X vs Y>", "rows": [["Aspect", "X", "Y"], ...]},
        # Optional but raises rank for "X vs Y" queries
    ],
    "faqs": [
        {"q": "<question>", "a": "<short answer>"},
        # 3-7 FAQs — feeds FAQ schema.org
    ],
    "citations": [
        {"label": "FinCEN BOI Guidance §2(c)", "url": "https://...", "accessed": "2026-05-04"},
        # ≥3 primary sources required
    ],
    "hero_prompt": "<DALL-E prompt; navy+indigo+gold; no robots; editorial>",
    "internal_links": ["<slug>", "<slug>", "<slug>"],  # ≥3 other gap pages
    "target": "blog|hub|both",
}
```

#### Step B — humanize step in brain.py

After the long-form generation, run a SECOND Claude call:

```python
HUMANIZE_PROMPT = """
You will receive a draft compliance article. Rewrite to:
- Remove em-dashes (use commas or periods)
- Remove "delve", "tapestry", "nuanced", "navigate the complexities", "in today's rapidly evolving"
- Replace listy bullet structures with prose paragraphs where the topic flows
- Add ONE conversational aside per H2 section ("In practice, ...", "What this means for a 5-person law firm: ...")
- Keep all citations, all diagrams, all tables
- Keep length within 10% of original

OUTPUT: same JSON schema, body_mdx replaced with humanized version.
""".strip()
```

#### Step C — factual review pass

Third Claude call, separate from drafting:

```python
FACTUAL_REVIEW_PROMPT = """
Audit this compliance article. For each factual claim (statute citations,
deadlines, dollar amounts, jurisdiction-specific rules):
1. Confirm it has a citation in the citations[] array
2. Confirm the citation URL is to a primary source (regulator, government,
   official guidance — NOT a law firm blog or news article)
3. Flag any claim without a primary-source citation

OUTPUT: {
  "all_claims_cited": <bool>,
  "issues": [
    {"claim": "...", "missing": "primary source", "suggested_url": "..."},
    ...
  ]
}
"""
```

If `all_claims_cited: false` → reject the article, queue for human review.

#### Step D — SEO structure validator (Python, runs before commit)

`services/hetzner/quality_gate.py`:

```python
import re, sys
def validate(mdx_body: str, frontmatter: dict) -> list[str]:
    errs = []
    if not re.search(r'^# ', mdx_body, re.M): errs.append('no H1')
    h2_count = len(re.findall(r'^## ', mdx_body, re.M))
    if h2_count < 3: errs.append(f'only {h2_count} H2s, need ≥3')
    if len(frontmatter.get('citations', [])) < 3: errs.append('<3 citations')
    if len(frontmatter.get('mermaid', [])) < 1 and not frontmatter.get('comparison_tables'):
        errs.append('no diagram and no table — need ≥1 visual')
    if len(frontmatter.get('internal_links', [])) < 3: errs.append('<3 internal links')
    word_count = len(re.findall(r'\w+', mdx_body))
    if word_count < 800: errs.append(f'{word_count} words, need ≥800')
    if word_count > 1500: errs.append(f'{word_count} words, max 1500')
    return errs
```

publisher.py imports this, fails fast if any errors. Only clean drafts get committed to forge.

#### Step E — visual richness enforcement

publisher.py renders the MDX, then before committing to git, runs a final check:

```python
def visual_count(rendered_html: str) -> int:
    count = 0
    count += rendered_html.count('<svg')      # mermaid + sparklines
    count += rendered_html.count('<table')    # comparison + data
    count += rendered_html.count('<img')      # hero + infographics
    return count

if visual_count(html) < 3:
    raise QualityGateError("article has fewer than 3 visual elements")
```

Forces brain.py to produce visuals; if it slacks, publish fails and Moses is notified to redraft.

### Telegram review flow (already exists — extend it)

Current: scout drafts → bot pings Moses with "Pick which item to deploy".

Extended: brain.py produces draft → quality_gate runs → if PASS, bot shows preview link with the rendered HTML; if FAIL, bot lists the specific gate violations and asks Moses if he wants to (a) redraft, (b) override and ship anyway, or (c) reject the topic.

This gives Moses a "veto + improve" loop instead of binary publish/no-publish.

---

## 4. When to apply Paddle and LemonSqueezy

You said: "I don't want to open payment gateways before end-to-end 100% ok in subdomains, main, OCI, Hetzner-forge, Fastify+Firebase funnel."

The right gating criteria:

| Gate | Status today | Required before MoR application |
|---|---|---|
| 1. Z7 11/11 GREEN | ✅ today | hold for 24h soak (until 2026-05-05 14:00 UTC) |
| 2. End-to-end lead → routed → Telegram in <30s | ✅ verified during V1/V2 work | re-test with synthetic |
| 3. /api/pay/start returns valid checkout URL for NOWPayments + PayPal | ✅ implemented in Phase Z3 | run synthetic for each product |
| 4. /agents and /pricing pages tested in real browser at 320px / 768px / 1024px / 1440px | unverified | manual QA pass |
| 5. Every product has /terms-specific section explaining refund window + dispute process | ✅ /refund exists | confirm copy is clear & specific |
| 6. team@bizlegal-ai.com is staffed (replies in <24h) | unverified | route to your inbox or set up Resend |
| 7. 5+ articles published on forge.bizlegal-ai.com (proves content velocity) | currently 3 | publish 5+ via the new quality gates |
| 8. 50+ unique daily visitors for 7 consecutive days (proves organic traffic > zero) | unknown | analytics check |
| 9. Lighthouse score ≥ 90 on apex + at least 3 subdomains | unverified | see §5 below |
| 10. No CRITICAL or HIGH /api/ops/health env warnings | ✅ today | maintain through soak window |
| 11. Article quality system shipped (§3 above) | not yet | ~10h work |

**Earliest realistic application date: 2026-05-15** (10 days from now), assuming you ship the quality system and hit baseline traffic. Earlier risks rejection. MoR providers (Paddle, LS) reject merchants whose sites look thin/unloved — they're protecting THEIR chargeback rates.

When you do apply, submit:
- **URL:** `https://bizlegal-ai.com`
- **Industry:** Legal Tech / Compliance Software (low chargeback)
- **Avg ticket size:** $49-$347
- **Expected monthly volume:** project realistically — claim what you can deliver in 30 days
- **Refund policy:** link `https://bizlegal-ai.com/refund`
- **Privacy + Terms + Contact:** auto-detected from footer

Have your business address, tax ID (or EIN/foreign equivalent), and bank details ready.

---

## 5. SEO 90/100 → 95/100 plan

Lighthouse + Google's PageSpeed Insights (PSI) score on Performance, Accessibility, Best Practices, SEO. Target: ≥ 90 on all four for apex and every subdomain.

### Run baseline today

```powershell
# install if you don't have it
npm i -g @lhci/cli

# or just use PSI:
# Open https://pagespeed.web.dev/ and paste each URL
```

URLs to score:
- https://bizlegal-ai.com (apex)
- https://forge.bizlegal-ai.com (SEO surface — most important)
- https://tracr.bizlegal-ai.com
- https://brai.bizlegal-ai.com
- https://docai.bizlegal-ai.com
- https://leadforge.bizlegal-ai.com
- https://lexaudit.bizlegal-ai.com

Record current scores. Target deltas come from those.

### Six tactics that move the needle most

1. **Schema.org structured data on every gap page** (~2h)
   - Article + FAQ + Breadcrumb JSON-LD blocks
   - Validate via https://validator.schema.org/
   - SEO score: +5 to +10
   - Ranking impact: rich snippets in Google results = 30-50% CTR lift

2. **Cumulative Layout Shift (CLS) → 0** (~1h)
   - Every `<img>` has explicit `width` + `height` (Next.js Image already does this if used)
   - Reserve hero image height before load
   - Performance score: +5 to +15

3. **First Contentful Paint < 1.5s** (~3h)
   - Defer all non-critical JS
   - Move tracking scripts to `next/script` with `strategy="lazyOnload"`
   - Inline critical CSS for above-fold
   - Performance: +10 to +20

4. **Internal linking + topical clusters** (~4h, ongoing)
   - Each gap page links to ≥3 related gap pages (already required by quality gate)
   - Each subdomain links to a parent topic on hub
   - Hub has a /topics/ index that links to all gap pages
   - SEO + ranking: +5 SEO score; cumulative ranking lift over weeks

5. **E-E-A-T signals** (~2h)
   - Author bio component (rendered on every gap page) — establishes "Experience"
   - "Reviewed by" line if you have a paralegal/attorney — establishes "Expertise"
   - Last-updated date prominent — signals "freshness"
   - Citations to primary sources — establishes "Trustworthiness"
   - Ranking impact: meaningful for compliance/legal niche where Google heavily weights E-E-A-T

6. **Image optimization + AVIF** (~1h)
   - All hero images served as AVIF with WebP + JPEG fallback
   - Use Next.js `<Image>` everywhere
   - Compress existing images via `squoosh`
   - Performance: +5 to +15

### Current → 95+ projected timeline

- Today: baseline ~70-80 (typical Next.js with no perf work)
- Week 1: ship #1 #2 #6 → ~85-90
- Week 2: ship #3 #5 → ~92-95
- Week 3: ship #4 + first round of content velocity → ~95+ holds steady

Target: **95+ on apex and forge subdomain by 2026-05-25** (3 weeks).

### One-off backlinks tactic

Once forge has 10+ quality gap pages, run an outreach campaign:
- Find compliance-focused sub-Reddits (`r/Bookkeeping`, `r/smallbusiness`, `r/ECR`) and answer real questions citing your gap pages as further reading
- Comment on Hacker News / Lobsters threads about FinCEN / EU AI Act / GDPR
- DM 50 founders on X who are in your ICP — offer 5 free regulatory reports in exchange for a tweet/blog mention

Compliance backlinks are HARD to earn. Each one is gold for ranking.

---

## 6. Sequenced action plan (next 3 weeks)

### Week 1 — quality system + baseline metrics

Day 1 (today):
- Read this doc end-to-end
- Run Lighthouse on apex + forge → record baseline
- Confirm 24h Z7 soak is GREEN (check `/api/ops/health`)

Day 2-3:
- Implement steps A+B of §3 (extend brain.py output + humanize pass)
- Test with one new article through the full pipeline
- Land ≥1 new gap page per day to forge.bizlegal-ai.com

Day 4-5:
- Ship steps C+D+E (factual review, SEO validator, visual richness)
- Audit all 3 existing gap pages — retroactively fix to pass new gates
- Run Lighthouse #1 → see lift from schema + structure work

### Week 2 — performance + content velocity

Day 6-9:
- Ship Lighthouse tactics #2 #3 #6 (CLS, FCP, AVIF)
- Publish 1 article/day = 7 new gap pages by end of week 2
- Verify each passes the 6 quality gates

Day 10:
- Lighthouse #2 → expect 90+ across the board
- Confirm 5+ articles indexed by Google (check via `site:forge.bizlegal-ai.com`)

### Week 3 — E-E-A-T + apply for MoR

Day 11-13:
- Ship E-E-A-T signals (author bios, reviewed-by, citations widget)
- Set up Resend forwarding so team@bizlegal-ai.com auto-replies + forwards to your inbox
- Final QA pass on /agents + /pricing in 4 viewports

Day 14:
- Lighthouse final → expect 95+
- All 11 Z7 rows still GREEN
- 10+ gap pages live, content velocity proven

Day 15:
- Apply to Paddle (https://paddle.com/apply)
- Apply to LemonSqueezy (https://lemonsqueezy.com)
- Submit `https://bizlegal-ai.com` as primary URL
- Wait for approval emails (typically 3-7 business days)

### Week 4+ — go live + iterate

When approval emails land:
- Set `LEMONSQUEEZY_API_KEY` and `PADDLE_API_KEY` in vault + Vercel
- The code-only `packages/payment` already supports them — flips from 503 stub to live calls automatically
- First paid customer flow — own the support replies tightly
- Continue article velocity, watch organic traffic compound

---

## 7. Where to find help when stuck

- **Status of any service:** `/api/ops/health?token=$OPS_DASHBOARD_TOKEN`
- **Scout (curator) state:** `ssh hetzner "systemctl is-active curator-scout"`
- **Vercel deploy logs:** `cd bizlegal-monorepo && vercel logs <deployment-url>`
- **Cloudflared tunnel:** `cloudflared --config "$env:ProgramData\Cloudflare\.cloudflared\config.yml" tunnel info d8f42728-b85a-4e69-b165-981791eacb86`
- **SSH access:**
  - Hetzner: `ssh -i ~/.ssh/id_ed25519 root@204.168.209.235`
  - OCI: `ssh -i ~/.ssh/oci_id_rsa ubuntu@151.145.81.139`
- **Telegram chats:**
  - Alerts: @Bizlegalbot to chat 989097520 (you)
  - FAQ: @Bizlegalhubbot (open to anyone)
  - Curator: @Bizlegalforgebot (you only)
- **Operating book entry point:** `decisions/POST_CUTOVER_PUNCH_LIST.md` + `decisions/WEEKLY_ROUTINES_AND_SEO.md`

---

## TL;DR

1. **Open the monorepo:** `code "C:\Users\Moshe Dor\bizlegal-monorepo"` — VS Code + Claude Code panel works on the whole thing
2. **Start a service:** `pnpm dev` from inside the app dir, OR ssh + systemctl for Hetzner/OCI services
3. **Article quality:** ship the 6-gate system in §3 (~10h work) — every article gets diagrams, citations, schemas, humanized prose, before publish
4. **Apply Paddle/LS:** ~2026-05-15 after 10 days of clean operation + 5+ quality articles + Lighthouse 95+
5. **SEO ≥ 95/100:** week-by-week plan in §5; biggest wins are schema.org + CLS + AVIF + E-E-A-T
