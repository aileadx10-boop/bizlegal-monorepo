# BrainX weekly radar run — operator SOP

BrainX v0 has no hosted engine — `services/highintelligence-api` is PARKED
(see its CLAUDE.md) and the five agent prompts in `agents/brainx/{market,
competitor,customer-voice,regulatory,monetization}/prompt.md` are the real
design spec, run by a **Claude Code session**, not an API call. Zero
inference cost: the analysis happens inside this session, and the
deterministic tool only validates and persists it.

Never say "continuous" or "24/7" anywhere in output copy — the site's own
`RunStamp` component and the ingest tool's banned-word check both enforce
"weekly, operator-run."

## Step 0 — purge stale seed data (first run only)

The 2026-09-15 build hand-seeded 3 signals pointing at homepages
(`google.com`, `esma.europa.eu`, `nar.realtor`) via an untracked script. If
those rows are still in Neon, delete them before the first real run:

```sql
delete from signals where url in ('https://www.google.com', 'https://www.esma.europa.eu', 'https://www.nar.realtor');
```

## Step 1 — pick a market

One of the three seeded markets: `us-re-compliance`, `legal-practice-growth`,
`ai-fintech-regulation`. Rotate across all three over a month rather than
always running the same one.

## Steps 2–6 — run the five agent prompts, in order

Follow each prompt file exactly as written — they define the strict JSON
shape, the "no fabricated URLs/statistics" rule, and (customer-voice) the
≤40-word verbatim-excerpt rule:

1. `agents/brainx/market/prompt.md` — demand signals.
2. `agents/brainx/competitor/prompt.md` — competitor snapshot → diff → business meaning.
3. `agents/brainx/customer-voice/prompt.md` — pain/frustration/request/buying-signal/legal-pain/wtp classification.
4. `agents/brainx/regulatory/prompt.md` — rule changes, enforcement actions, guidance, bills, court rulings.
5. `agents/brainx/monetization/prompt.md` — synthesis. Requires ≥3 evidence links. Ends "No evidence, no opportunity."

For each candidate opportunity, **open and read every source URL yourself**
before including it — do not accept a URL you have not verified resolves and
says what you are about to claim it says. This is the same discipline
`lib/fixtures/sample.ts` documents for the sample radar.

## Step 7 — write the run file

Assemble the output as one JSON file matching
`apps/brainx/lib/radar/ingest-schema.ts`'s `runFile` schema:

```
content/runs/<YYYY-MM-DD>.json
```

Record the model that ran the session and anything the next operator should
know in `analyst_notes`.

## Step 8 — validate, then apply

```bash
cd apps/brainx
pnpm tsx tools/ingest-radar.ts --file ../../content/runs/<date>.json --dry-run
# fix every reported violation, then:
pnpm tsx tools/ingest-radar.ts --file ../../content/runs/<date>.json
```

`--dry-run` resolves every evidence URL over the network and cross-checks
every factor-score total before writing anything. Exit codes: `0` ok,
`2` schema/static validation failed, `3` a URL failed to resolve,
`4` database error.

## Step 9 — send the weekly pick

```bash
pnpm tsx tools/send-weekly-pick.ts --free
pnpm tsx tools/send-weekly-pick.ts --subscribers
```

## Cadence

Weekly. There is no cron yet — this SOP is run by a human-initiated Claude
Code session until n8n/FastAPI automation is built (see
`services/highintelligence-api/CLAUDE.md` for that upgrade path).
