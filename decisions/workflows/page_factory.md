# Workflow — the programmatic-SEO page factory

**Status:** built 2026-09-15 (plan v3 §P). Matrix v1 = 1,216 rows. Nothing published.
**Tool:** `services/seo-agents/page_factory.py` (CLI, Supabase, ops log) + `page_factory_rows.py` (matrix → rows, offline and pure) + `page_factory_prompt.py` (prompt, deterministic markdown assembly, JSON parse) + `page_factory_matrix.json` (the data)
**Gate:** `services/seo-agents/page_quality_gate.py` (extends `services/hetzner/quality_gate.py`)
**Render:** `apps/hub/app/(seo)/[hub]/[slug]/page.tsx` ← `apps/hub/lib/seo-pages.ts`
**Migration:** `supabase/migrations/20260915_seo_pages_page_factory.sql` (additive, idempotent)

---

## Objective

Get from ~723 live URLs + 231 legacy blog rows to **10,000 indexed hub pages in 12 months**
without spending money on generation and without shipping a single page that a compliance
buyer would recognise as machine filler.

The honest constraint from the plan: Google must index ≥60% of the set. Below 40% we
**stop the factory and consolidate** — that is a kill rule, not a suggestion.

## Inputs

| Input | Where | Notes |
|---|---|---|
| Matrix | `services/seo-agents/page_factory_matrix.json` | regulations, jurisdictions, tools, industries, glossary terms, guide variants, **citation registry**, internal-link core |
| Guides | `apps/hub/lib/guides.ts` | parsed at run time — the playbook family can never drift from the hub |
| Rows | Supabase `seo_pages` | `hub` column separates factory rows from the 231 legacy blog rows (`hub IS NULL`) |
| Text | Gemini free tier (`GOOGLE_GEMINI_API_KEY`), OpenRouter `:free` overflow (`OPENROUTER_API_KEY`) | tier 1 / tier 2 only — **Anthropic is refused by the script** |
| Spend log | hub `/api/ops/log` (`BIZLEGAL_INBOUND_SECRET`) | `agent.run.completed` / `agent.run.error`, `metadata.agent='page_factory'`. No new event type was added (CLAUDE.md hard rule 3). |

Load env without printing values:

```bash
set -a; . <(grep -E '^(NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE_KEY|GOOGLE_GEMINI_API_KEY|OPENROUTER_API_KEY|BIZLEGAL_INBOUND_SECRET)=' \
  "/c/Users/Moshe Dor/Downloads/env-hub-bizlegal-ai.txt" | tr -d '\r'); set +a
```

## The four families (matrix v1)

| Family | Hub section | URL | Rows | Dimensions |
|---|---|---|---|---|
| `regulation_jurisdiction` | `compliance` | `/compliance/<reg>-compliance-<jurisdiction>` | 600 | 12 × 50 |
| `tool_industry` | `solutions` | `/solutions/<tool>-for-<industry>` | 300 | 15 × 20 |
| `glossary` | `glossary` | `/glossary/<term>` | 115 | seed list, target 500 |
| `guide_variant` | `playbooks` | `/playbooks/<guide>-<checklist\|faq\|template>` | 201 | 67 × 3 |

Growing the factory means **editing the JSON**, never the script. The glossary seed is 115
real compliance terms; adding the remaining ~385 is a data edit plus a `--write` run.

The stored `slug` is hub-qualified (`compliance/gdpr-compliance-germany`) so it is unique
against the legacy blog rows and maps 1:1 onto the hub route.

## Commands

### 1. Plan (offline — no keys, no network, no writes)

```bash
python services/seo-agents/page_factory.py --plan
```

Prints rows per family, the unique-slug count (a non-zero duplicate count exits 1), the
citation-registry size and the internal-link set size.

### 2. Write drafts

```bash
python services/seo-agents/page_factory.py --write --limit 500            # all families
python services/seo-agents/page_factory.py --write --limit 200 --hub glossary
```

Idempotent: existing slugs are skipped, never overwritten, so a half-finished run is just
re-run. Rows land as `status='draft'`, `published=false`, `deployed=false`. A preflight
call fails the whole run in ~1s if PostgREST is down (exit 3) rather than dying half-way
through a batch. If the migration is not applied yet the insert drops unknown columns and
tells you which — apply the migration and re-run to backfill them.

### 3. Generate + gate

```bash
python services/seo-agents/page_factory.py --generate --limit 20 --tier 1
python services/seo-agents/page_factory.py --generate --limit 1 --dry-run   # gate rehearsal, no write-back
```

Per row: build a strict prompt carrying **only** the registry citations and **only** real
hub paths → free-tier LLM → parse JSON → run the gate → PATCH the row.

- gate passes → `status='review'`
- gate blocks → `status='rejected_quality'`, `gate_findings` stores why
- model returns unparseable JSON or errors → row **stays** `draft`, run continues

`--tier 3+` is refused with an error. The page factory never bills Anthropic.

Budget: ~$0.00 at tier 1/2 (free quota). The spend line printed at the end and the
`ops_events` rows are the receipt — never the agent's own claim.

## The gate (what "good enough for review" means)

`page_quality_gate.py` extends the curator gate, so any phrase banned for the blog is
banned here the day it is added there. BLOCK-level:

1. **≥600 words** in the body.
2. **≥3 citations that resolve to the registry.** A URL not in
   `page_factory_matrix.json.citation_registry` is a BLOCK — the model cannot invent a
   source, and cannot "improve" one either.
3. **≥3 unique FAQ Q/As**, none of which restates the page title.
4. **≥5 internal links verified against the known-URL set** (guides.ts + regulations +
   tools + core + the factory's own rows). A link to a page that does not exist is a BLOCK.
5. **No banned boilerplate** (curator list + programmatic tells).
6. **No outcome guarantees** — `guarantee`, `will pass`, `ensures compliance`,
   `fully compliant`, `100% compliant`, "we are your lawyer", and `legal advice` outside a
   negated disclaimer.
7. **YMYL disclaimer present** ("not legal advice" / "not a law firm").
8. **≥3 H2 sections.**

WARN-level (visible, not blocking): short FAQ answers, a duplicated H1 in the body.

Three of those failures are designed out rather than gated: `assemble_body()` in
`page_factory_prompt.py` takes the model's `{lede, sections:[{h2, body_md}]}` and emits the
markdown itself, so the H2 count, the absence of an H1 and the verbatim disclaimer are
structural guarantees. `strip_lead_connectives()` then deletes sentence-initial
"Furthermore, / Moreover, / In conclusion," from the text that gets **stored** — a
meaning-preserving deletion of filler, not a way to slip boilerplate past the gate, which
still runs afterwards on exactly the text that will be published.

Note what the guarantee rule does **not** ban: the bare word "guarantee". "The Act
guarantees data principals the right to correction" is accurate compliance prose. The
patterns target the liability shape — a guarantee of a compliance *outcome*, or any
first-person promise — not the vocabulary.

Run the gate standalone on any saved page JSON; it loads the real registry and URL set
from the matrix by itself:

```bash
python services/seo-agents/page_quality_gate.py path/to/page.json
```

Every citation URL in the registry was HTTP-checked on 2026-09-15. Three hosts
(`sec.gov`, `hhs.gov`, `fatf-gafi.org`) return 403 to non-browser user agents and carry
`ua_blocked: true` so a future live-link checker skips them rather than deleting live
sources.

## Publish step — Moses only

The factory **never** sets `status='published'`. The hub route 404s anything that is not
published, and the metadata for a non-published row carries `robots: noindex`.

```sql
-- review what the gate passed
select slug, title, word_count, jsonb_array_length(coalesce(faq,'[]'::jsonb)) as faqs
from seo_pages where status = 'review' order by slug limit 50;

-- read one before publishing it
select title, content, faq, citations from seo_pages where slug = 'glossary/data-fiduciary';

-- publish a batch after reading it
update seo_pages set status = 'published', published = true, updated_at = now()
where slug in ('glossary/data-fiduciary', '...');
```

Publish in small batches (25–50). Watch the index rate on the first 200 before releasing
the next 500 — a thin-content signal applied to 5,000 pages at once is not recoverable
cheaply.

After publishing, the pages enter the hub sitemap and IndexNow through
`getPublishedFactoryPageUrls()` in `apps/hub/lib/seo-pages.ts`. **Open follow-up owned by
plan §S1:** `app/sitemap.ts` is still synchronous and does not call that function yet —
one line, deliberately left to the unshadow work so two agents don't fight over the file.

## Weekly proof (the only numbers that count)

Run it, paste it, don't paraphrase it:

```sql
select coalesce(hub,'(legacy blog)') as hub, status, count(*)
from seo_pages group by 1,2 order by 1,2;

select coalesce(index_status,'(unchecked)') as index_status, count(*)
from seo_pages where hub is not null and status = 'published'
group by 1 order by 2 desc;
```

Report as: **`seo_pages` count by hub/status** + **`index_status` breakdown**. Index rate =
indexed ÷ published. Below 40% → stop the factory and consolidate (plan kill rule).

## Edge cases and failure modes

- **PostgREST down.** `--write` / `--generate` exit 3 with one sentence and write nothing.
  `--plan` is unaffected — it never touches the network.
- **Migration unapplied.** Inserts still land, minus the factory columns, and the run says
  which columns it dropped. Re-run after applying to backfill.
- **Free-tier 429.** `chat_free_tier` walks Gemini Flash-Lite → Flash → OpenRouter `:free`
  and returns the last error; the row stays `draft` and the next run retries it. Do not
  "fix" a 429 by switching to Anthropic.
- **Model invents a citation.** The gate blocks it. This is the expected, designed
  outcome — a `citation_off_registry` count above ~10% means the prompt's SOURCES block is
  too long, not that the gate is too strict.
- **Duplicate slugs.** `--plan` exits 1 if the matrix ever produces two identical slugs.
  Fix the JSON, not the database.
- **A jurisdiction/regulation pair that makes no sense** (e.g. HIPAA in Japan). The page is
  still legitimate — the honest answer is "this regime does not reach you here, and here is
  what does" — but the gate cannot tell a good one from a bad one. Spot-read 5 rows per
  regulation before publishing that regulation's batch.

## Related

- Plan: `decisions/REVENUE-MACHINE-PLAN-V3-2026-09-14.md` §S items 3–4, LLM routing table
- AEO content strategy: `decisions/AEO-AUSTIN-ARMSTRONG-2026-07-02.md`
- Coverage-over-rankings: `decisions/O-028-GROWTH-ENGINE-FILING-2026-09-15.md`
- Curator gate this one extends: `services/hetzner/quality_gate.py`
