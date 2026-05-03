# Weekly Routines + Programmatic SEO Audit — 2026-05-04

## Part 1 — Weekly routine table

Times are **UTC**. Tel Aviv is UTC+3 (e.g. `06:00 UTC = 09:00 IDT`). All crons run regardless of weekday unless otherwise marked.

### Master schedule by hour (every day)

| UTC | What fires | Surface | Source |
|---|---|---|---|
| **every 15 min** | `ops-alerts` — checks ops_events for errors/revenue, pushes to @Bizlegalbot | Hub Vercel | `apps/hub/vercel.json` |
| **06:00** | `sanctions/refresh` — BRAI pulls OFAC/EU sanctions deltas | brai subdomain | `apps/brai/vercel.json` |
| **06:00** | `monitor/diff` — LexAudit checks tracked regulator pages for changes | lexaudit subdomain | `apps/lexaudit/vercel.json` |
| **06:00** | `digest/aggregate` — Worker fans out to 6 subdomain `/api/digest`, builds homepage feed | CF Worker | `services/worker/wrangler.toml` |
| **07:00** | `billing/charge-due` — recurring subscription renewals via NOWPayments + PayPal | Hub | `apps/hub/vercel.json` |
| **09:00** | `smoke` — synthetic LeadProfile through 5-stage pipeline (extract→critique→score→summary→route) | Hub | `apps/hub/vercel.json` |
| **09:00** | `snapshot smoke` — Worker runs synthetic snapshot through pipeline | CF Worker | `services/worker/wrangler.toml` |
| **11:00** | `ai-act-monitor` — V1 AI-Act risk classifier rerun on tracked deployments | Hub | `apps/hub/vercel.json` |
| **12:00** | `policy-refresh` — V2 Privacy Auto-Refresh diffs of customer privacy pages | Hub | `apps/hub/vercel.json` |
| **14:00** | `boi/check` — FinCEN BOI deadline check + Telegram nudge to subscribed firms | Hub | `apps/hub/vercel.json` |

### Continuous (no schedule — event-driven)

| What | Surface | Trigger |
|---|---|---|
| **@Bizlegalbot** (ops alerts) | Hub Vercel cron | Fires only when `ops-alerts` cron finds something to alert on |
| **@Bizlegalhubbot** (FAQ) | services/telegram-hub Worker | Inbound user message via webhook |
| **@Bizlegalforgebot** (curator) | Hetzner systemd | Polls Telegram every few seconds for Moses's pick/deploy/reject commands |
| **OCI router** (deal routing) | OCI VM (Caddy + FastAPI) | Inbound POST /lead from realestate-intake or partner forms |
| **Fastify funnel-mvp** | services/funnel-mvp (not yet deployed) | Inbound POST /capture from landing forms — when activated |
| **Worker `/intake`** | CF Worker bizlegal-lead-intake | Landing-form lead submissions, runs 5-stage pipeline |
| **Hub `/api/pay/start`** | Hub Vercel | Click-driven crypto/card checkout creation (no cron) |

### Day-of-week pattern

| Day | Daily crons | Special routines | Moses's typical actions |
|---|---|---|---|
| **Sun** | all | none | Strategy review, /ops dashboard scan, plan the week |
| **Mon** | all | scout fires 06:00 → curator drafts content → Moses picks via @Bizlegalforgebot → publisher.py pushes new gap page to forge.bizlegal-ai.com | Pick + approve gap content (~30 min) |
| **Tue** | all | none | Customer outreach, Reddit/HN posts using outreach kit |
| **Wed** | all | scout + curator + publisher | Pick + approve gap content (~30 min) |
| **Thu** | all | none | Review week's metrics in /ops; deal flow from OCI router |
| **Fri** | all | scout + curator + publisher | Pick + approve gap content (~30 min) |
| **Sat** | all | none | Review week's gap pages, prune low performers, plan next week's strategy |

### What's NOT scheduled (gaps worth noting)

- **No weekly aggregate report** — `/ops` shows event tape but no Mon-morning "here's what last week looked like" summary
- **No automatic content audit** — gap pages get published but never reviewed for SEO performance
- **No backup verification cron** — daily snapshot smoke covers part of this but doesn't verify Supabase RLS, OCI VM disk, Hetzner curator continuity
- **No DNS/cert expiry monitor** — cert renewal happens automatically via certbot on OCI; no proactive "30 days before expiry" alert

---

## Part 2 — Programmatic SEO state

### Headlines

| Metric | Current | Health |
|---|---|---|
| forge.bizlegal-ai.com gap pages indexed | **3** | 🔴 way too few |
| Pipeline producing pages | scout → brain → publisher (Mon/Wed/Fri) | ⚠️ 3-per-week cadence not yet running reliably (today's session unblocked it) |
| Schema.org Article markup | **missing** | 🔴 leaves search ranking on the table |
| OpenGraph tags | present | ✅ |
| Internal cross-linking | 32 links per page | ✅ good |
| Images / diagrams | **0** per page | 🔴 |
| Tables | **0** per page | 🔴 |
| Sitemap auto-generated | yes (Next.js dynamic) | ✅ |
| robots.txt | allows search, blocks AI training crawlers | ✅ reasonable |
| tracr/lexaudit/brai sitemaps | **missing** (returns HTML 404 fallback) | 🔴 |

### Sample gap page anatomy (`/gap/united-states/fincen-defi-bo-audit-guidance-2026`)

```
HTML size: 43 KB
H1: 1
H2: 1
H3: 4
<svg>: 6 (UI icons, NOT diagrams)
<img>: 0
<table>: 0
<pre>/<code>: 0
schema.org: missing
```

The page has decent **textual** structure but zero visual hierarchy. For a regulation-heavy compliance topic, this is a missed opportunity — Google rewards content with images, tables, and structured data, and this category competes against bigger established sites (FinCEN.gov, Cooley, Latham PDFs) where you need stronger format differentiation to surface.

### Improvement priorities (highest leverage first)

#### 1. Add schema.org Article markup (one PR, applies to all gap pages)

In `apps/forge/app/gap/[country]/[slug]/page.tsx`, add a `<script type="application/ld+json">` block per page:

```typescript
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": page.title,
  "description": page.summary,
  "image": page.heroImage ?? "https://forge.bizlegal-ai.com/og-default.png",
  "datePublished": page.publishedAt,
  "dateModified": page.updatedAt,
  "author": { "@type": "Organization", "name": "BizLegal AI" },
  "publisher": {
    "@type": "Organization",
    "name": "BizLegal AI",
    "logo": { "@type": "ImageObject", "url": "https://forge.bizlegal-ai.com/logo.png" }
  },
  "about": { "@type": "Thing", "name": page.regulator },
  "keywords": page.keywords?.join(", ")
}
```

Single PR, applies to all 3 current pages and every future one. Estimated rank impact: top-10 → top-5 for long-tail compliance queries (qualitative, depends on topic).

#### 2. Diagram pipeline — Mermaid → SVG inline

Add a `diagram_mermaid` column to `gap_pages` Supabase table. brain.py prompts Claude to produce a Mermaid diagram per article (decision tree for "do you need to file BOI?", flowchart for "AI Act risk classification", timeline for "GDPR enforcement chronology"). Render server-side via `@mermaid-js/mermaid-cli` during publisher.py's pre-render step. Store as `<svg>` in HTML.

Examples that win in compliance space:
- "Does this transaction trigger BOI reporting?" — decision tree
- "AI Act risk tier ladder" — pyramid
- "Privacy regs comparison: GDPR vs CCPA vs PIPEDA" — sequence diagram

Estimated lift: 30-50% increase in average dwell time. Diagrams also drive backlinks (people screenshot + cite).

#### 3. Comparison tables (highest CTR for B2B compliance queries)

For every "X vs Y" search term, a table is the format that ranks. Brain.py should produce one `<table>` per article when the title contains comparison verbs (`vs`, `or`, `compare`, `difference between`, `which is better`).

Schema:
```html
<table>
  <thead>
    <tr><th>Dimension</th><th>Option A</th><th>Option B</th></tr>
  </thead>
  ...
</table>
```

Wrap with `<div class="overflow-x-auto">` for mobile.

#### 4. Volume — get to 50 pages, then 200

3 pages indexed is sub-critical. The compliance long-tail has ~3000 high-intent search terms; capture 50-200 with one page each and you're at the cusp of Google considering you a topical authority for the niche.

The pipeline exists (scout → brain → publisher); it's running 3-pages-per-week. At that pace 50 pages takes 17 weeks. Two ways to accelerate:

- **Bump cadence:** scout runs Mon/Wed/Fri → run daily. Each run produces 1 ranked candidate. That's 7/week → 50 in 7 weeks.
- **Bump candidates per run:** `TOP_N` in scout.py is 3 (filters down to top 3 per run). Currently brain.py probably drafts ONE; bump to draft all 3, queue them in Telegram, Moses approves up to 3 per cycle.

Recommend: bump cadence to daily AND raise TOP_N to 3, give Moses a Telegram pick-list each morning.

#### 5. Add subdomain sitemaps

`tracr.bizlegal-ai.com/sitemap.xml`, `brai.bizlegal-ai.com/sitemap.xml`, `lexaudit.bizlegal-ai.com/sitemap.xml`, etc. — none currently exist. They return Next.js fallback pages (HTML 404 from a frontend POV).

Each subdomain app needs `app/sitemap.ts` (Next.js 14+ convention):

```typescript
import { MetadataRoute } from 'next'
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    { url: 'https://tracr.bizlegal-ai.com', lastModified: new Date(), priority: 1 },
    { url: 'https://tracr.bizlegal-ai.com/scan', changeFrequency: 'monthly', priority: 0.8 },
    // ...
  ]
}
```

5-min PR per subdomain × 6 subdomains = 30 min.

#### 6. Hub `/api/cron/seo-audit` — weekly auto-check

Cron at `0 8 * * 1` (Mon 08:00 UTC) that:
- Fetches all gap_page slugs from Supabase
- For each, hits `https://www.googleapis.com/customsearch/v1?...q=site:forge.bizlegal-ai.com/gap/<slug>` to confirm Google indexes it
- For unindexed pages 30+ days old, post a Telegram alert "page X published 33 days ago, still not indexed — investigate"
- Outputs to `/api/ops/feed` so it shows on /ops/health

Tells you **early** when SEO drops, instead of finding out by traffic anomaly.

---

## Recommended changes to ship this week

| Priority | Item | Effort | Impact |
|---|---|---|---|
| **P0** | Schema.org Article markup | 1 hr | High — applies to all current + future pages |
| **P0** | Bump scout cadence Mon/Wed/Fri → daily | 5 min (Hetzner timer) | High — 2.3× content velocity |
| **P1** | Mermaid diagram pipeline in brain.py | 4 hr | High — dwell time + backlinks |
| **P1** | Add subdomain sitemaps (×6) | 30 min total | Medium — surfaces hidden pages |
| **P2** | Comparison-table prompts in brain.py | 2 hr | Medium — wins "X vs Y" queries |
| **P2** | Hub `/api/cron/seo-audit` | 3 hr | Medium — proactive monitoring |

Total: ~11 hours of work to lift the SEO posture from "infrastructure ready, content thin" to "infrastructure + content velocity + structured data + diagrams."

---

## How to use this document

1. Reference the schedule when firing manual jobs — don't double-fire something that already runs
2. For the SEO improvements, P0s should land first since they apply retroactively to existing 3 pages
3. Re-audit gap_page count + indexed count weekly; the metric that matters is **indexed pages × CTR**, not just published count
