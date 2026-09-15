# LangGap — Coverage-Over-Rankings Localization Scanner

Productionized port of the prototype `langgap_v1.py`. Zero paid APIs in the scan/prioritize/queue path (`requests` + stdlib only).

## Run

```bash
cd "C:/Users/Moshe Dor/bizlegal-monorepo"
python -m services.langgap.scanner --config services/langgap/config.json --run --diff --max-pages 500 --workers 6 --outdir langgap_out --stage-top 10
```

- `--diff` emits only NEW gaps vs the previous run.
- `--stage-top N` writes top-N own-site gaps to `pending_review/<domain>_pending_review.csv` (default 10).
- Competitor sites with no sitemap are non-fatal (e.g. sprinto.com).

## Output contract (do not change — cron and review gate consume it)

```
langgap_out/<domain>_queue.csv      columns: score,url,lastmod,section_weight,declared_hreflangs,missing
langgap_out/state/<domain>_manifest.json
langgap_out/run_summary.json
langgap_out/pending_review/<domain>_pending_review.csv   (own-site only, staged)
```

## Env
- None required for scanning/queueing.
- Optional: `BIZLEGAL_INBOUND_SECRET` / `OPS_LOG_URL` for ops-log HMAC from the worker.
- Anthropic credits only needed for draft generation later; if credits are $0, stage queue without drafts and say so.

## YMYL review gate (hard rule)
Staged outputs are `status: pending-review`. This tool NEVER auto-publishes. Localization must swap regulators (FinCEN→BaFin DE, FinCEN→CNMV ES), add hreflang cluster links, preserve expert byline + review block, and only publish after Moses approves the batch.
